<?php
/**
 * API: Upload profile image
 * Method: POST (multipart/form-data)
 * Auth: Required
 */

// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../middleware/auth.php';

function getBackendBaseUrl() {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host . '/project-advisor-system/backend';
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check authentication
$user = authenticate();

if (!$user) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
    exit();
}

try {
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }

    $file = $_FILES['image'];
    $user_id = $user['user_id'];
    $role = $user['role'];

    // Validate file type
    $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    $file_type = mime_content_type($file['tmp_name']);
    
    if (!in_array($file_type, $allowed_types)) {
        throw new Exception('Invalid file type. Only JPEG, PNG, and GIF are allowed');
    }

    // Validate file size (max 5MB)
    $max_size = 5 * 1024 * 1024; // 5MB in bytes
    if ($file['size'] > $max_size) {
        throw new Exception('File size exceeds 5MB limit');
    }

    // Create upload directory if it doesn't exist
    $upload_dir = __DIR__ . '/../../uploads/profiles/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    // Generate unique filename
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = 'profile_' . $role . '_' . $user_id . '_' . time() . '.' . $file_extension;
    $upload_path = $upload_dir . $new_filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $upload_path)) {
        throw new Exception('Failed to save uploaded file');
    }

    // Update database
    $conn = getDbConnection();
    
    // Delete old profile image if exists
    if ($role === 'student') {
        $sql = "SELECT image FROM student WHERE student_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $user_id);
    } else if ($role === 'advisor') {
        $sql = "SELECT image FROM advisor WHERE advisor_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
    } else {
        throw new Exception('Invalid role');
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $old_data = $result->fetch_assoc();
    
    // Delete old file if exists
    if ($old_data && $old_data['image']) {
        $old_file = __DIR__ . '/../../uploads/profiles/' . basename($old_data['image']);
        if (file_exists($old_file)) {
            unlink($old_file);
        }
    }
    
    // Update with new image path
    $image_url = '/uploads/profiles/' . $new_filename;
    
    if ($role === 'student') {
        $update_sql = "UPDATE student SET image = ? WHERE student_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param('ss', $image_url, $user_id);
    } else if ($role === 'advisor') {
        $update_sql = "UPDATE advisor SET image = ? WHERE advisor_id = ?";
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param('si', $image_url, $user_id);
    }
    
    if (!$update_stmt->execute()) {
        // Rollback - delete uploaded file
        unlink($upload_path);
        throw new Exception('Failed to update database');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Profile image uploaded successfully',
        'data' => [
            'image_url' => $image_url,
            'full_url' => getBackendBaseUrl() . $image_url
        ]
    ]);

    $stmt->close();
    $update_stmt->close();
    $conn->close();

} catch (Exception $e) {
    error_log("Error in upload profile image API: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
