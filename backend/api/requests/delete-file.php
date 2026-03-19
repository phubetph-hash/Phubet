<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Authentication required
$auth_result = authenticateUser();
if (!$auth_result['success']) {
    http_response_code(401);
    echo json_encode($auth_result);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {
    $user = $auth_result['user'];
    
    // Get file_id from URL path
    $path_parts = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    $file_id = isset($path_parts[0]) ? intval($path_parts[0]) : 0;
    
    if ($file_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid file ID'
        ]);
        exit;
    }
    
    // Get file information and verify permissions
    $stmt = $conn->prepare("
        SELECT rf.*, r.student_id 
        FROM request_files rf
        INNER JOIN requests r ON rf.request_id = r.request_id
        WHERE rf.file_id = ? AND rf.deleted_at IS NULL
    ");
    $stmt->bind_param("i", $file_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'File not found'
        ]);
        exit;
    }
    
    $file = $result->fetch_assoc();
    
    // Check permissions - only the file uploader or student who owns the request can delete
    if ($user['role_id'] == 1) { // Student
        if ($file['student_id'] != $user['user_id']) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Access denied'
            ]);
            exit;
        }
    }
    // Admins and advisors can delete any file
    
    // Mark file as deleted (soft delete)
    $stmt = $conn->prepare("
        UPDATE request_files 
        SET deleted_at = NOW() 
        WHERE file_id = ?
    ");
    $stmt->bind_param("i", $file_id);
    
    if ($stmt->execute()) {
        // Optionally delete physical file
        $file_path = __DIR__ . '/../../' . $file['file_path'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete file');
    }

} catch (Exception $e) {
    error_log("Delete file error: " . $e->getMessage());
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