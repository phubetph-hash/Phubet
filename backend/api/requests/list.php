<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Check authentication
$auth = checkAuth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$current_user_id = $auth['user_id'];
$current_role = $auth['role'];

$student_id = isset($_GET['student_id']) ? trim($_GET['student_id']) : '';
$advisor_id = isset($_GET['advisor_id']) ? intval($_GET['advisor_id']) : 0;
$status = isset($_GET['status']) ? trim($_GET['status']) : '';
$limit = isset($_GET['limit']) ? max(1,intval($_GET['limit'])) : 20;
$offset = isset($_GET['offset']) ? max(0,intval($_GET['offset'])) : 0;

// Auto-detect based on role
if ($current_role === 'student' && $student_id === '') {
    $student_id = $current_user_id;
} elseif ($current_role === 'advisor' && $advisor_id <= 0) {
    $advisor_id = intval($current_user_id);
}

if ($current_role !== 'admin' && $student_id === '' && $advisor_id <= 0) { 
    http_response_code(400); 
    echo json_encode(['success' => false, 'message' => 'student_id or advisor_id is required']); 
    exit; 
}

$where = [];
if ($student_id !== '') { 
    $where[] = "r.student_id = '" . $conn->real_escape_string($student_id) . "'"; 
}
if ($advisor_id > 0) { 
    $where[] = 'r.advisor_id = ' . $advisor_id; 
}
if ($status !== '' && $status !== 'all') {
    $where[] = "r.status = '" . $conn->real_escape_string($status) . "'";
}
$whereSql = empty($where) ? '' : ('WHERE ' . implode(' AND ', $where));

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
        $whereSql ORDER BY r.request_id DESC LIMIT $limit OFFSET $offset";

$res = $conn->query($sql);
$rows = [];
if ($res) { 
    while($r = $res->fetch_assoc()){ 
        $rows[] = $r; 
    } 
}

echo json_encode(['success' => true, 'data' => $rows]);
?>

