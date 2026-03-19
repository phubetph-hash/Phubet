<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {
    $user = [
        'user_id' => $auth['user_id'],
        'role_id' => $auth['role'] === 'student' ? 1 : ($auth['role'] === 'advisor' ? 2 : 3)
    ];
    
    // Get request_id from query parameters
    if (!isset($_GET['request_id']) || empty($_GET['request_id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Request ID is required'
        ]);
        exit;
    }

    $request_id = intval($_GET['request_id']);
    
    // Check if request_files table exists, if not return empty array
    $check_table = $conn->query("SHOW TABLES LIKE 'request_files'");
    if ($check_table->num_rows === 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Files table not yet created',
            'data' => []
        ]);
        exit;
    }
    
    // Verify access based on user role
    if ($user['role_id'] == 1) {
        // Student: can only see files from their own requests
        $stmt = $conn->prepare("
            SELECT rf.* 
            FROM request_files rf
            INNER JOIN request r ON rf.request_id = r.request_id
            WHERE rf.request_id = ? AND r.student_id = ? AND rf.deleted_at IS NULL
            ORDER BY rf.uploaded_at DESC
        ");
        $stmt->bind_param("is", $request_id, $user['user_id']);
    } else {
        // Advisor/Admin: can see all files for the request
        $stmt = $conn->prepare("
            SELECT rf.*
            FROM request_files rf
            WHERE rf.request_id = ? AND rf.deleted_at IS NULL
            ORDER BY rf.uploaded_at DESC
        ");
        $stmt->bind_param("i", $request_id);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $files = [];
    while ($row = $result->fetch_assoc()) {
        // Format file size for display
        $size = $row['file_size'];
        if ($size < 1024) {
            $formatted_size = $size . ' B';
        } elseif ($size < 1024 * 1024) {
            $formatted_size = round($size / 1024, 1) . ' KB';
        } else {
            $formatted_size = round($size / (1024 * 1024), 1) . ' MB';
        }
        
        $file_data = [
            'file_id' => $row['file_id'],
            'original_filename' => $row['original_filename'],
            'file_size' => $row['file_size'],
            'formatted_size' => $formatted_size,
            'mime_type' => $row['mime_type'],
            'uploaded_at' => $row['uploaded_at'],
            'file_description' => $row['file_description'] ?? ''
        ];
        
        // Add uploader info if user is not student
        if ($user['role_id'] != 1 && isset($row['first_name'])) {
            $file_data['uploaded_by_name'] = $row['first_name'] . ' ' . $row['last_name'];
        }
        
        $files[] = $file_data;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $files
    ]);

} catch (Exception $e) {
    error_log("Get files error: " . $e->getMessage());
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