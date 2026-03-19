<?php
/**
 * Admin API: Recent Activities (Recent Requests)
 * GET /api/admin/dashboard/recent_activities.php
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

try {
    // Get recent 10 requests with student and advisor info
    $sql = "SELECT 
                r.request_id as id,
                r.project_title as project_name,
                r.status,
                r.created_at,
                s.first_name as student_firstname,
                s.last_name as student_lastname,
                a.first_name as advisor_firstname,
                a.last_name as advisor_lastname
            FROM request r
            LEFT JOIN student s ON r.student_id = s.student_id
            LEFT JOIN advisor a ON r.advisor_id = a.advisor_id
            ORDER BY r.created_at DESC
            LIMIT 10";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $activities = [];
    while ($row = $result->fetch_assoc()) {
        $activities[] = [
            'id' => $row['id'],
            'projectName' => $row['project_name'],
            'status' => $row['status'],
            'studentName' => $row['student_firstname'] . ' ' . $row['student_lastname'],
            'advisorName' => $row['advisor_firstname'] . ' ' . $row['advisor_lastname'],
            'createdAt' => $row['created_at']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $activities
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>