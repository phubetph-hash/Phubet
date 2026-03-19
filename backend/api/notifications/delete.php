<?php
/**
 * API: Delete notification
 * Method: DELETE
 * Auth: Required
 */

// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/notification_schema_helper.php';

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
    $conn = getDbConnection();
    ensureNotificationRoleSupport($conn);
    
    $user_id = $user['user_id'];
    $user_role = $user['role'];
    $whereClause = roleSafeNotificationWhereClause();
    $notification_id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    
    if (!$notification_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Notification ID required'
        ]);
        exit();
    }
    
    // Delete notification (only if it belongs to the user)
    $sql = "DELETE FROM notifications WHERE notification_id = ? AND {$whereClause}";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('isss', $notification_id, $user_id, $user_role, $user_role);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Notification deleted'
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Notification already removed',
            'alreadyDeleted' => true
        ]);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Error in delete notification API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
