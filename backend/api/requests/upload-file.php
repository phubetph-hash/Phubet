<?php
// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../middleware/rate_limit.php';
require_once __DIR__ . '/../../connect.php';

// Only set Content-Type, CORS is handled by .htaccess
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Rate limiting
rate_limit('file_upload', 10, 60); // 10 uploads per minute

// Authentication required
$auth = checkAuth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
    exit;
}

$user = [
    'user_id' => $auth['user_id'],
    'role_id' => $auth['role'] === 'student' ? 1 : ($auth['role'] === 'advisor' ? 2 : 3)
];

// Debug: Check role
error_log("Upload-file debug: auth_role=" . ($auth['role'] ?? 'NULL') . ", user_role_id=" . $user['role_id']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {
    // Check if user is student
    if ($user['role_id'] != 1) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. Students only.'
        ]);
        exit;
    }

    // Validate required fields (request_id is optional for new requests)
    $request_id = null;
    if (isset($_POST['request_id']) && !empty($_POST['request_id'])) {
        $request_id = intval($_POST['request_id']);
        
        // Verify that the request belongs to the current user
        $stmt = $conn->prepare("
            SELECT r.request_id, r.student_id 
            FROM request r 
            WHERE r.request_id = ? AND r.student_id = ?
        ");
        $stmt->bind_param("is", $request_id, $user['user_id']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Access denied or request not found'
            ]);
            exit;
        }
    }

    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $error_messages = [
            UPLOAD_ERR_INI_SIZE => 'File is too large (exceeds server limit)',
            UPLOAD_ERR_FORM_SIZE => 'File is too large (exceeds form limit)',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
        ];
        
        $error = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $error_messages[$error] ?? 'Unknown upload error'
        ]);
        exit;
    }

    $uploaded_file = $_FILES['file'];
    
    // File validation
    $max_size = 10 * 1024 * 1024; // 10MB
    $allowed_types = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
    ];
    
    $allowed_extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'txt'];
    
    // Check file size
    if ($uploaded_file['size'] > $max_size) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'File size exceeds 10MB limit'
        ]);
        exit;
    }
    
    // Check file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $uploaded_file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mime_type, $allowed_types)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid file type. Only PDF, Word, Excel, PowerPoint, images and text files are allowed.'
        ]);
        exit;
    }
    
    // Check file extension
    $pathinfo = pathinfo($uploaded_file['name']);
    $extension = strtolower($pathinfo['extension'] ?? '');
    
    if (!in_array($extension, $allowed_extensions)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid file extension'
        ]);
        exit;
    }
    
    // Create upload directory if it doesn't exist
    $upload_dir = __DIR__ . '/../../uploads/requests/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generate unique filename using running number
    // Get next file number from database
    $conn->begin_transaction();
    try {
        $update_query = "UPDATE file_counter SET counter_value = LAST_INSERT_ID(counter_value + 1) WHERE id = 1";
        $conn->query($update_query);
        
        $select_query = "SELECT LAST_INSERT_ID() as next_number";
        $result = $conn->query($select_query);
        $row = $result->fetch_assoc();
        $file_number = str_pad($row['next_number'], 6, '0', STR_PAD_LEFT);
        
        $conn->commit();
    } catch (Exception $e) {
        $conn->rollback();
        error_log("Error getting file number: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'เกิดข้อผิดพลาดในการสร้างชื่อไฟล์'
        ]);
        exit;
    }
    
    $unique_filename = 'request_file_' . $file_number . '.' . $extension;
    $file_path = $upload_dir . $unique_filename;
    
    // Move uploaded file
    if (!move_uploaded_file($uploaded_file['tmp_name'], $file_path)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to save file'
        ]);
        exit;
    }
    
    // Update request table with proposal file (only if request_id exists)
    if ($request_id) {
        $stmt = $conn->prepare("
            UPDATE request 
            SET proposal_file = ?, original_filename = ?
            WHERE request_id = ?
        ");
        $original_filename = $uploaded_file['name'];
        $stmt->bind_param("ssi", $unique_filename, $original_filename, $request_id);
        
        if (!$stmt->execute()) {
            // Remove uploaded file if database update fails
            unlink($file_path);
            throw new Exception('Failed to update request with file information');
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'File uploaded successfully',
        'data' => [
            'filename' => $unique_filename,
            'original_name' => $uploaded_file['name'],
            'file_size' => $uploaded_file['size'],
            'mime_type' => $mime_type,
            'uploaded_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    error_log("File upload error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>

