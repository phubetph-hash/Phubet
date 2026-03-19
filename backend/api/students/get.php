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

// Debug: log auth data
error_log("Student get.php - Auth data: " . json_encode($auth));

// Only allow students to access their own data or admins
if ($auth['role'] !== 'admin') {
    $student_id = $auth['user_id'];
} else {
    $student_id = isset($_GET['id']) ? trim($_GET['id']) : $auth['user_id'];
}

error_log("Student get.php - Looking for student_id: " . $student_id);

if ($student_id === '') { 
    http_response_code(400); 
    echo json_encode(['success' => false, 'message' => 'Student ID is required']); 
    exit; 
}

$stmt = $conn->prepare("SELECT s.student_id, s.prefix, s.first_name, s.last_name, s.image, s.email, 
                       s.faculty_id, s.department_id, s.program_id, s.created_at, s.updated_at,
                       f.faculty_name, d.department_name, p.program_name
                       FROM student s
                       LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
                       LEFT JOIN department d ON s.department_id = d.department_id  
                       LEFT JOIN program p ON s.program_id = p.program_id
                       WHERE s.student_id = ?");
$stmt->bind_param('s', $student_id);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) { 
    http_response_code(404);
    error_log("Student get.php - Student not found for student_id: $student_id, role: " . $auth['role']);
    echo json_encode([
        'success' => false, 
        'message' => 'Student not found',
        'debug' => [
            'requested_student_id' => $student_id,
            'session_role' => $auth['role']
        ]
    ]); 
    exit; 
}

$student_data = $res->fetch_assoc();

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
                            ORDER BY r.created_at DESC");
$req_stmt->bind_param('s', $student_id);
$req_stmt->execute();
$req_res = $req_stmt->get_result();
$requests = [];
while ($req = $req_res->fetch_assoc()) {
    $requests[] = $req;
}

$student_data['requests'] = $requests;
echo json_encode(['success' => true, 'data' => $student_data]);
?>

