<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Method not allowed']); exit; }

// Check authentication
$auth = checkAuth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Only allow students to change their own password or admins
if ($auth['role'] !== 'admin') {
    $student_id = $auth['user_id'];
} else {
    $student_id = isset($_GET['id']) ? trim($_GET['id']) : $auth['user_id'];
}

if ($student_id === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID is required']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$current_password = isset($input['current_password']) ? trim($input['current_password']) : '';
$new_password = isset($input['new_password']) ? trim($input['new_password']) : '';

if ($current_password === '' || $new_password === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Current password and new password are required']);
    exit;
}

if (strlen($new_password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters long']);
    exit;
}

try {
    // Verify current password
    $stmt = $conn->prepare("SELECT password_hash FROM student WHERE student_id = ?");
    $stmt->bind_param('s', $student_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Student not found']);
        exit;
    }
    
    $student = $result->fetch_assoc();
    
    // Hash current password and compare
    $hashStmt = $conn->prepare("SELECT SHA2(?, 256) AS h");
    $hashStmt->bind_param('s', $current_password);
    $hashStmt->execute();
    $currentHash = $hashStmt->get_result()->fetch_assoc()['h'];
    
    if ($currentHash !== $student['password_hash']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }
    
    // Hash new password
    $newHashStmt = $conn->prepare("SELECT SHA2(?, 256) AS h");
    $newHashStmt->bind_param('s', $new_password);
    $newHashStmt->execute();
    $newHash = $newHashStmt->get_result()->fetch_assoc()['h'];
    
    // Update password
    $updateStmt = $conn->prepare("UPDATE student SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE student_id = ?");
    $updateStmt->bind_param('ss', $newHash, $student_id);
    
    if (!$updateStmt->execute()) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update password']);
        exit;
    }
    
    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
?>