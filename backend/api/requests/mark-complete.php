<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/notification_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204); 
    exit; 
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'])) { 
    http_response_code(405); 
    echo json_encode(['success' => false, 'message' => 'Method not allowed']); 
    exit; 
}

// Check authentication - only advisors can mark complete
$auth = checkAuth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($auth['role'] !== 'advisor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Only advisors can mark requests as complete']);
    exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) { 
    http_response_code(400); 
    echo json_encode(['success' => false, 'message' => 'id is required']); 
    exit; 
}

$conn->begin_transaction();
try {
    // Get request and verify it belongs to this advisor and is approved
    $stmt = $conn->prepare("
        SELECT r.request_id, r.student_id, r.advisor_id, r.project_title, 
               s.first_name as student_fname, s.last_name as student_lname,
               a.first_name as advisor_fname, a.last_name as advisor_lname
        FROM request r
        LEFT JOIN student s ON r.student_id = s.student_id
        LEFT JOIN advisor a ON r.advisor_id = a.advisor_id
        WHERE r.request_id = ? AND r.advisor_id = ? AND r.status = 'อนุมัติ'
        FOR UPDATE
    ");
    
    $stmt->bind_param('is', $id, $auth['user_id']);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    
    if (!$row) { 
        throw new Exception('Request not found, not approved, or not assigned to this advisor'); 
    }

    // Update request status to complete
    $stmtUpdate = $conn->prepare("
        UPDATE request 
        SET status = 'เสร็จสิ้น', 
            complete_date = CURRENT_DATE 
        WHERE request_id = ?
    ");
    $stmtUpdate->bind_param('i', $id);
    if (!$stmtUpdate->execute()) { 
        throw new Exception('Failed to update request status'); 
    }

    // Create notification for student
    $student_name = $row['student_fname'] . ' ' . $row['student_lname'];
    $advisor_name = $row['advisor_fname'] . ' ' . $row['advisor_lname'];
    $project_title = $row['project_title'];
    
    notifyStudentProjectComplete($row['student_id'], $advisor_name, $id, $project_title);

    $conn->commit();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Request marked as complete',
        'data' => [
            'request_id' => $id,
            'status' => 'เสร็จสิ้น'
        ]
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
