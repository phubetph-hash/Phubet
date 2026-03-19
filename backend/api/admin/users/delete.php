<?php
/**
 * Admin API: Delete User
 * DELETE /api/admin/users/delete.php
 */

require_once __DIR__ . '/../../../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../../connect.php';
require_once __DIR__ . '/../../../middleware/auth.php';

// Check authentication and admin role
$auth = checkAuth();
if (!$auth['authenticated'] || $auth['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$user_id = $input['user_id'] ?? '';
$role = $input['role'] ?? '';

if (empty($user_id) || empty($role)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID and role are required']);
    exit;
}

try {
    $conn->begin_transaction();
    
    $deleted = false;

    // Helper: delete from optional tables (won't error if table/column doesn't exist)
    $safeDelete = function($table, $column, $id, $type) use ($conn) {
        $stmt = $conn->prepare("DELETE FROM `$table` WHERE `$column` = ?");
        if ($stmt) { $stmt->bind_param($type, $id); $stmt->execute(); }
    };

    // Delete based on role
    if ($role === 'student') {
        // student_id is VARCHAR(20) — use 's' not 'i'
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE student_id = ? AND status = 'อนุมัติ'");
        $checkStmt->bind_param('s', $user_id);
        $checkStmt->execute();
        $approvedCount = $checkStmt->get_result()->fetch_assoc()['count'];
        if ($approvedCount > 0) {
            throw new Exception('Cannot delete student with approved requests');
        }

        // Delete related records (student_id is VARCHAR)
        $safeDelete('request', 'student_id', $user_id, 's');
        $safeDelete('student_advisor', 'student_id', $user_id, 's');
        $safeDelete('notifications', 'user_id', $user_id, 's');
        $safeDelete('password_reset_tokens', 'user_id', $user_id, 's');
        $safeDelete('user_status', 'user_id', $user_id, 's');

        $stmt = $conn->prepare("DELETE FROM student WHERE student_id = ?");
        $stmt->bind_param('s', $user_id);
        $stmt->execute();
        $deleted = $stmt->affected_rows > 0;

    } elseif ($role === 'advisor') {
        $advisor_id = intval($user_id);

        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE advisor_id = ? AND status = 'อนุมัติ'");
        $checkStmt->bind_param('i', $advisor_id);
        $checkStmt->execute();
        $approvedCount = $checkStmt->get_result()->fetch_assoc()['count'];
        if ($approvedCount > 0) {
            throw new Exception('Cannot delete advisor with approved requests');
        }

        // Delete related records
        $safeDelete('advisor_expertise', 'advisor_id', $advisor_id, 'i');
        $safeDelete('student_advisor', 'advisor_id', $advisor_id, 'i');
        $safeDelete('request', 'advisor_id', $advisor_id, 'i');
        $safeDelete('notifications', 'user_id', (string)$advisor_id, 's');
        $safeDelete('password_reset_tokens', 'user_id', (string)$advisor_id, 's');
        $safeDelete('user_status', 'user_id', (string)$advisor_id, 's');

        $stmt = $conn->prepare("DELETE FROM advisor WHERE advisor_id = ?");
        $stmt->bind_param('i', $advisor_id);
        $stmt->execute();
        $deleted = $stmt->affected_rows > 0;

    } elseif ($role === 'administrator') {
        $admin_id = intval($user_id);

        $checkAdminQuery = "SELECT COUNT(*) as count FROM administrator";
        $stmt = $conn->prepare($checkAdminQuery);
        $stmt->execute();
        $adminCount = $stmt->get_result()->fetch_assoc()['count'];
        if ($adminCount <= 1) {
            throw new Exception('Cannot delete the last administrator');
        }

        $safeDelete('notifications', 'user_id', (string)$admin_id, 's');
        $safeDelete('password_reset_tokens', 'user_id', (string)$admin_id, 's');
        $safeDelete('user_status', 'user_id', (string)$admin_id, 's');

        $stmt = $conn->prepare("DELETE FROM administrator WHERE admin_id = ?");
        $stmt->bind_param('i', $admin_id);
        $stmt->execute();
        $deleted = $stmt->affected_rows > 0;
    }
    
    if (!$deleted) {
        throw new Exception('Failed to delete user');
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'User deleted successfully'
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
