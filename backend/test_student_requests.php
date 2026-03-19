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

$student_id = isset($_GET['id']) ? trim($_GET['id']) : '61123456789';

// Get student's requests
$req_stmt = $conn->prepare("SELECT r.request_id, r.project_title, r.project_detail, r.advisor_id, r.status,
                            r.suggestion, r.rejection_reason, r.approve_date, r.submit_date,
                            r.created_at, r.updated_at, r.academic_term_id,
                            CONCAT(a.prefix, a.first_name, ' ', a.last_name) AS advisor_name,
                            ar.rank_name_th AS advisor_title,
                            at.term, at.academic_year
                            FROM request r
                            LEFT JOIN advisor a ON r.advisor_id = a.advisor_id
                            LEFT JOIN academic_rank ar ON a.academic_rank_id = ar.academic_rank_id
                            LEFT JOIN academic_term at ON r.academic_term_id = at.academic_term_id
                            WHERE r.student_id = ?
                            ORDER BY r.created_at DESC LIMIT 5");
$req_stmt->bind_param('s', $student_id);
$req_stmt->execute();
$req_res = $req_stmt->get_result();
$requests = [];
while ($req = $req_res->fetch_assoc()) {
    $requests[] = $req;
}

echo json_encode(['success' => true, 'data' => $requests], JSON_UNESCAPED_UNICODE);
?>