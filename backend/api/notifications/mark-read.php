<?php
/**
 * API: Mark notification(s) as read
 * Method: PATCH
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
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Check if marking all as read or specific notification
    if (isset($input['mark_all']) && $input['mark_all'] === true) {
        // Mark all notifications as read
        $sql = "UPDATE notifications 
                SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
            WHERE {$whereClause} AND is_read = FALSE";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('sss', $user_id, $user_role, $user_role);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'All notifications marked as read',
            'affected_rows' => $stmt->affected_rows
        ]);
        
    } else if (isset($input['notification_id'])) {
        // Mark specific notification as read
        $notification_id = $input['notification_id'];
        
        $sql = "UPDATE notifications 
                SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
            WHERE notification_id = ? AND {$whereClause}";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('isss', $notification_id, $user_id, $user_role, $user_role);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Notification not found'
            ]);
        }
        
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request'
        ]);
    }
    
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Error in mark as read API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
