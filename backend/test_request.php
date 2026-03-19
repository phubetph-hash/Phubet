<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204); 
    exit; 
}

$request_id = isset($_GET['id']) ? intval($_GET['id']) : 18;

$sql = "SELECT r.request_id, r.student_id, r.advisor_id, r.submit_date, r.status, r.expire_date, 
        r.approve_date, r.project_title, r.project_detail, r.suggestion, r.rejection_reason, r.created_at, r.updated_at,
        CONCAT(a.prefix, a.first_name, ' ', a.last_name) AS advisor_name,
        CONCAT(s.prefix, s.first_name, ' ', s.last_name) AS student_name,
        ar.rank_name_th AS advisor_title,
        at.academic_year, at.term
        FROM request r 
        JOIN advisor a ON r.advisor_id = a.advisor_id
        JOIN student s ON r.student_id = s.student_id
        LEFT JOIN academic_rank ar ON a.academic_rank_id = ar.academic_rank_id
        LEFT JOIN academic_term at ON r.academic_term_id = at.academic_term_id
        WHERE r.request_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $request_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(['success' => false, 'message' => 'Request not found'], JSON_UNESCAPED_UNICODE);
}
?>