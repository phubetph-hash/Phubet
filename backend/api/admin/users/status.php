<?php
/**
 * Admin API: Update User Status
 * PUT /api/admin/users/status.php
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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$user_id = $input['user_id'] ?? '';
$status = $input['status'] ?? '';

if (empty($user_id) || empty($status)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID and status are required']);
    exit;
}

// Validate status
if (!in_array($status, ['active', 'suspended', 'deleted'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit;
}

try {
    // Get user role first
    $roleQuery = "SELECT role FROM auth_accounts WHERE user_id = ?";
    $stmt = $conn->prepare($roleQuery);
    $stmt->bind_param('s', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('User not found');
    }
    
    $userData = $result->fetch_assoc();
    $userRole = $userData['role'];
    
    // Update or insert user status
    $updateQuery = "
        INSERT INTO user_status (role, user_id, status, updated_at) 
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        status = VALUES(status), 
        updated_at = NOW()
    ";
    
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param('sss', $userRole, $user_id, $status);
    $stmt->execute();
    
    // Get user info from the appropriate table based on role
    $userName = '';
    $userEmail = '';
    
    if ($userRole === 'student') {
        $userQuery = "SELECT email, CONCAT(first_name, ' ', last_name) as name FROM student WHERE student_id = ?";
        $stmt = $conn->prepare($userQuery);
        $stmt->bind_param('s', $user_id);
    } else if ($userRole === 'advisor') {
        $userQuery = "SELECT email, CONCAT(first_name, ' ', last_name) as name FROM advisor WHERE advisor_id = ?";
        $stmt = $conn->prepare($userQuery);
        $stmt->bind_param('i', $user_id);
    } else if ($userRole === 'admin') {
        $userQuery = "SELECT email, CONCAT(first_name, ' ', last_name) as name FROM administrator WHERE admin_id = ?";
        $stmt = $conn->prepare($userQuery);
        $stmt->bind_param('i', $user_id);
    }
    
    if (isset($stmt)) {
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        $userName = $user['name'] ?? '';
        $userEmail = $user['email'] ?? '';
    }
    
    $statusLabels = [
        'active' => 'ใช้งานได้',
        'suspended' => 'ถูกระงับ',
        'deleted' => 'ถูกลบ'
    ];
    
    echo json_encode([
        'success' => true,
        'message' => 'User status updated successfully',
        'data' => [
            'user_id' => $user_id,
            'user_name' => $userName,
            'user_email' => $userEmail,
            'user_role' => $userRole,
            'new_status' => $status,
            'status_label' => $statusLabels[$status]
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
