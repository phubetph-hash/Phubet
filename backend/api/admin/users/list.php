<?php
/**
 * Admin API: List Users
 * GET /api/admin/users/list.php
 */

// Load config first (includes CORS)
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

// Get query parameters
$role = $_GET['role'] ?? 'all';
$q = $_GET['q'] ?? '';
$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

try {
    // Query users from their respective tables
    $users = [];
    
    // Query students
    if ($role === 'all' || $role === 'student') {
        $studentQuery = "
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
                f.faculty_name,
                d.department_name,
                p.program_name,
                NULL as academic_rank_name,
                NULL as academic_degree_name,
                NULL as capacity,
                NULL as current_students
            FROM student s
            LEFT JOIN program p ON s.program_id = p.program_id
            LEFT JOIN department d ON p.department_id = d.department_id
            LEFT JOIN faculty f ON d.faculty_id = f.faculty_id
            LEFT JOIN user_status us ON us.user_id = s.student_id AND us.role = 'student'
            WHERE 1=1
        ";
        
        if (!empty($q)) {
            $studentQuery .= " AND (s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ?)";
        }
        
        $stmt = $conn->prepare($studentQuery);
        if (!empty($q)) {
            $searchTerm = "%{$q}%";
            $stmt->bind_param('sss', $searchTerm, $searchTerm, $searchTerm);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    }
    
    // Query advisors
    if ($role === 'all' || $role === 'advisor') {
        $advisorQuery = "
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
                NULL as student_id,
                f.faculty_name,
                d.department_name,
                NULL as program_name,
                ar.rank_name_th as academic_rank_name,
                ad.degree_name_th as academic_degree_name,
                a.project_capacity as capacity,
                (SELECT COUNT(*) FROM request WHERE advisor_id = a.advisor_id AND status = 'อนุมัติ') as current_students
            FROM advisor a
            LEFT JOIN academic_rank ar ON a.academic_rank_id = ar.academic_rank_id
            LEFT JOIN academic_degree ad ON a.academic_degree_id = ad.academic_degree_id
            LEFT JOIN faculty f ON a.faculty_id = f.faculty_id
            LEFT JOIN department d ON a.department_id = d.department_id
            LEFT JOIN user_status us ON us.user_id = a.advisor_id AND us.role = 'advisor'
            WHERE 1=1
        ";
        
        if (!empty($q)) {
            $advisorQuery .= " AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ?)";
        }
        
        $stmt = $conn->prepare($advisorQuery);
        if (!empty($q)) {
            $searchTerm = "%{$q}%";
            $stmt->bind_param('sss', $searchTerm, $searchTerm, $searchTerm);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    }
    
    // Query administrators
    if ($role === 'all' || $role === 'administrator') {
        $adminQuery = "
            SELECT 
                a.admin_id as user_id,
                a.email,
                a.first_name,
                a.last_name,
                NULL as phone,
                'admin' as role,
                COALESCE(us.status, 'active') as status,
                a.created_at,
                a.updated_at,
                NULL as student_id,
                NULL as faculty_name,
                NULL as department_name,
                NULL as program_name,
                NULL as academic_rank_name,
                NULL as academic_degree_name,
                NULL as capacity,
                NULL as current_students
            FROM administrator a
            LEFT JOIN user_status us ON us.user_id = a.admin_id AND us.role = 'admin'
            WHERE 1=1
        ";
        
        if (!empty($q)) {
            $adminQuery .= " AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ?)";
        }
        
        $stmt = $conn->prepare($adminQuery);
        if (!empty($q)) {
            $searchTerm = "%{$q}%";
            $stmt->bind_param('sss', $searchTerm, $searchTerm, $searchTerm);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    }
    
    // Sort by created_at descending
    usort($users, function($a, $b) {
        return strtotime($b['created_at'] ?? '1970-01-01') - strtotime($a['created_at'] ?? '1970-01-01');
    });
    
    // Apply pagination
    $total = count($users);
    $totalPages = ceil($total / $limit);
    $users = array_slice($users, $offset, $limit);
    
    // Format user data
    $formattedUsers = [];
    foreach ($users as $user) {
        $formattedUsers[] = [
            'user_id' => $user['user_id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'phone' => $user['phone'],
            'role' => $user['role'],
            'status' => $user['status'],
            'created_at' => $user['created_at'],
            'updated_at' => $user['updated_at'],
            'student_id' => $user['student_id'],
            'faculty_name' => $user['faculty_name'],
            'department_name' => $user['department_name'],
            'program_name' => $user['program_name'],
            'academic_rank_name' => $user['academic_rank_name'],
            'academic_degree_name' => $user['academic_degree_name'],
            'capacity' => $user['capacity'],
            'current_students' => $user['current_students'],
        ];
    }
    
    echo json_encode([
        'success' => true,
        'data' => $formattedUsers,
        'pagination' => [
            'current_page' => $page,
            'total_pages' => $totalPages,
            'total_items' => $total,
            'items_per_page' => $limit,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1,
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
