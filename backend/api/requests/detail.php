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
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id<=0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id is required']); exit; }

$sql = "SELECT r.*, 
        a.first_name AS advisor_first_name, a.last_name AS advisor_last_name,
        a.email AS advisor_email,
        s.first_name AS student_first_name, s.last_name AS student_last_name,
        s.email AS student_email,
        CONCAT(COALESCE(s.prefix, ''), s.first_name, ' ', s.last_name) AS student_name,
        CONCAT(COALESCE(a.prefix, ''), a.first_name, ' ', a.last_name) AS advisor_name,
        p.program_name AS program_name_th,
        d.department_name AS department_name_th,
        f.faculty_name AS faculty_name_th,
        at.term, at.academic_year,
        r.original_filename
        FROM request r
        JOIN advisor a ON r.advisor_id=a.advisor_id
        JOIN student s ON r.student_id=s.student_id
        LEFT JOIN program p ON s.program_id = p.program_id
        LEFT JOIN department d ON p.department_id = d.department_id
        LEFT JOIN faculty f ON d.faculty_id = f.faculty_id
        LEFT JOIN academic_term at ON r.academic_term_id = at.academic_term_id
        WHERE r.request_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows===0) { http_response_code(404); echo json_encode(['success'=>false,'message'=>'Request not found']); exit; }
echo json_encode(['success'=>true,'data'=>$res->fetch_assoc()]);
?>

