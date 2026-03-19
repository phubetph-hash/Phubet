<?php
/**
 * Admin API: Get User Detail
 * GET /api/admin/users/detail.php?id=123&role=student|advisor|administrator
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

$user_id = $_GET['id'] ?? '';
$role = $_GET['role'] ?? '';

if (empty($user_id) || empty($role)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID and role are required']);
    exit;
}

try {
    $user = null;
    
    // Get user based on role
    if ($role === 'administrator') {
        $query = "
            SELECT 
                admin_id as user_id,
                email,
                first_name,
                last_name,
                NULL as phone,
                'admin' as role,
                COALESCE(us.status, 'active') as status,
                created_at,
                updated_at
            FROM administrator a
            LEFT JOIN user_status us ON us.user_id = a.admin_id AND us.role = 'admin'
            WHERE admin_id = ?
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        
    } elseif ($role === 'student') {
        $query = "
            SELECT 
                s.student_id as user_id,
                s.email,
                s.first_name,
                s.last_name,
                NULL as phone,
                'student' as role,
                COALESCE(us.status, 'active') as status,
                s.created_at,
                s.updated_at,
                s.student_id,
                s.faculty_id,
                f.faculty_name,
                s.department_id,
                d.department_name,
                s.program_id,
                p.program_name
            FROM student s
            LEFT JOIN faculty f ON s.faculty_id = f.faculty_id
            LEFT JOIN department d ON s.department_id = d.department_id
            LEFT JOIN program p ON s.program_id = p.program_id
            LEFT JOIN user_status us ON us.user_id = s.student_id AND us.role = 'student'
            WHERE s.student_id = ?
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param('s', $user_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        
    } elseif ($role === 'advisor') {
        $query = "
            SELECT 
                a.advisor_id as user_id,
                a.email,
                a.first_name,
                a.last_name,
                a.phone,
                'advisor' as role,
                COALESCE(us.status, 'active') as status,
                a.created_at,
                a.updated_at,
                a.faculty_id,
                f.faculty_name,
                a.department_id,
                d.department_name,
                a.academic_rank_id,
                ar.rank_name_th as academic_rank_name,
                a.academic_degree_id,
                ad.degree_name_th as academic_degree_name,
                a.project_capacity as capacity,
                COALESCE((SELECT COUNT(*) FROM request WHERE advisor_id = a.advisor_id AND status = 'อนุมัติ'), 0) as current_students
            FROM advisor a
            LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
            LEFT JOIN department d ON a.department_id = d.department_id
            LEFT JOIN academic_rank ar ON a.academic_rank_id = ar.academic_rank_id
            LEFT JOIN academic_degree ad ON a.academic_degree_id = ad.academic_degree_id
            LEFT JOIN user_status us ON us.user_id = a.advisor_id AND us.role = 'advisor'
            WHERE a.advisor_id = ?
        ";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
    }
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Prepare user data
    $userData = $user;
    
    // Add advisor expertise if needed
    if ($role === 'advisor') {
        $expertiseQuery = "
            SELECT 
                ae.expertise_id,
                e.expertise_name_th
            FROM advisor_expertise ae
            LEFT JOIN expertise e ON ae.expertise_id = e.expertise_id
            WHERE ae.advisor_id = ?
        ";
        
        $stmt = $conn->prepare($expertiseQuery);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $expertises = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $userData['expertises'] = $expertises;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $userData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
