<?php
/**
 * API: Get notifications for current user
 * Method: GET
 * Auth: Required
 */

// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/notification_schema_helper.php';

// Apply CORS headers early
cors();

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
    
    // Get query parameters
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $unread_only = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    // Build query
    $whereClause = roleSafeNotificationWhereClause();

    $sql = "SELECT 
                notification_id as id,
                type,
                title,
                message,
                is_read as isRead,
                action_url as actionUrl,
                metadata,
                created_at as createdAt,
                read_at as readAt
            FROM notifications 
            WHERE {$whereClause}";
    
    if ($unread_only) {
        $sql .= " AND is_read = FALSE";
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssii', $user_id, $user_role, $user_role, $limit, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        // Parse metadata JSON
        $row['metadata'] = $row['metadata'] ? json_decode($row['metadata'], true) : [];
        $row['isRead'] = (bool)$row['isRead'];
        $notifications[] = $row;
    }
    
    // Get unread count
    $count_sql = "SELECT COUNT(*) as unread_count
                  FROM notifications
                  WHERE {$whereClause} AND is_read = FALSE";
    $count_stmt = $conn->prepare($count_sql);
    $count_stmt->bind_param('sss', $user_id, $user_role, $user_role);
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $unread_count = $count_result->fetch_assoc()['unread_count'];
    
    echo json_encode([
        'success' => true,
        'data' => $notifications,
        'unreadCount' => (int)$unread_count,
        'total' => count($notifications)
    ]);
    
    $stmt->close();
    $count_stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    error_log("Error in notifications list API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}
