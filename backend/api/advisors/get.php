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

// Get advisor ID from parameter or session (for own profile)
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    // If no ID provided and user is an advisor, use their own ID
    if ($auth['role'] === 'advisor') {
        $id = $auth['user_id'];
    } else {
        http_response_code(400); 
        echo json_encode(['success' => false, 'message' => 'id is required']); 
        exit; 
    }
}

$sql = "SELECT a.advisor_id, a.prefix, a.first_name, a.last_name, a.image, a.phone, a.email, 
        a.project_capacity, a.interests, a.academic_rank_id, a.academic_degree_id, 
        a.faculty_id, a.department_id, a.program_id,
        COALESCE((SELECT COUNT(*) FROM request r WHERE r.advisor_id=a.advisor_id AND r.status='อนุมัติ'),0) AS current_students,
        ar.rank_name_th AS academic_rank_name, ad.degree_name_th AS academic_degree_name,
        f.faculty_name, d.department_name, p.program_name,
        a.created_at, a.updated_at
        FROM advisor a
        LEFT JOIN academic_rank ar ON a.academic_rank_id = ar.academic_rank_id
        LEFT JOIN academic_degree ad ON a.academic_degree_id = ad.academic_degree_id
        LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
        LEFT JOIN department d ON a.department_id = d.department_id
        LEFT JOIN program p ON a.program_id = p.program_id
        WHERE a.advisor_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) { 
    http_response_code(404); 
    echo json_encode(['success' => false, 'message' => 'Advisor not found']); 
    exit; 
}

$advisor = $res->fetch_assoc();
$advisor['available_capacity'] = intval($advisor['project_capacity']) - intval($advisor['current_students']);
$advisor['capacity'] = intval($advisor['project_capacity']);

// Get expertises
$expStmt = $conn->prepare("SELECT e.expertise_id, e.expertise_name AS expertise_name_th 
                           FROM advisor_expertise ae 
                           JOIN expertise e ON ae.expertise_id = e.expertise_id 
                           WHERE ae.advisor_id = ?");
$expStmt->bind_param('i', $id);
$expStmt->execute();
$expRes = $expStmt->get_result();
$expertises = [];
$expertise_ids = [];
while ($exp = $expRes->fetch_assoc()) {
    $expertises[] = $exp;
    $expertise_ids[] = intval($exp['expertise_id']);
}
$advisor['expertises'] = $expertises;
$advisor['expertise_ids'] = $expertise_ids;

echo json_encode(['success' => true, 'data' => $advisor]);
?>

