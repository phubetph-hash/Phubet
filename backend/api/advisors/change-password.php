<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') { 
    http_response_code(405); 
    echo json_encode(['success'=>false,'message'=>'Method not allowed']); 
    exit; 
}

// Check authentication
$auth = checkAuth();
if (!$auth['authenticated'] || $auth['role'] !== 'advisor') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$advisor_id = $auth['user_id'];
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
    echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters']);
    exit;
}

try {
    // Support both legacy and new schemas
    $passwordColumn = 'password_hash';
    $colCheckStmt = $conn->prepare("SHOW COLUMNS FROM advisor LIKE 'password_hash'");
    $colCheckStmt->execute();
    $colCheckResult = $colCheckStmt->get_result();
    if ($colCheckResult->num_rows === 0) {
        $passwordColumn = 'password';
    }

    // Verify current password
    $stmt = $conn->prepare("SELECT {$passwordColumn} AS password_value FROM advisor WHERE advisor_id = ?");
    $stmt->bind_param('i', $advisor_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Advisor not found']);
        exit;
    }
    
    $advisor = $result->fetch_assoc();
    
    // Hash current password using SQL SHA2 (same as login)
    $hashStmt = $conn->prepare("SELECT SHA2(?, 256) AS h");
    $hashStmt->bind_param('s', $current_password);
    $hashStmt->execute();
    $currentHash = $hashStmt->get_result()->fetch_assoc()['h'];
    
    if ($currentHash !== $advisor['password_value']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }
    
    // Hash new password using SQL SHA2
    $newHashStmt = $conn->prepare("SELECT SHA2(?, 256) AS h");
    $newHashStmt->bind_param('s', $new_password);
    $newHashStmt->execute();
    $newHash = $newHashStmt->get_result()->fetch_assoc()['h'];
    
    // Update password
    $updateStmt = $conn->prepare("UPDATE advisor SET {$passwordColumn} = ?, updated_at = CURRENT_TIMESTAMP WHERE advisor_id = ?");
    $updateStmt->bind_param('si', $newHash, $advisor_id);
    
    if (!$updateStmt->execute()) {
        throw new Exception('Failed to update password');
    }
    
    echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    
} catch (Throwable $e) {
    error_log("Change Password Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}
?>