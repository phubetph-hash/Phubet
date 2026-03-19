<?php
/**
 * Admin API: Reset User Password
 * POST /api/admin/users/reset-password.php
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
$role = $input['role'] ?? '';
$new_password = $input['new_password'] ?? '';

if (empty($user_id) || empty($role)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'User ID and role are required']);
    exit;
}

// Generate new password if not provided
if (empty($new_password)) {
    $new_password = bin2hex(random_bytes(8)); // 16 character random password
}

try {
    // Hash the new password
    $hashed_password = hash('sha256', $new_password);
    
    $user = null;
    $updated = false;
    
    // Update password based on role
    if ($role === 'administrator') {
        $updateQuery = "UPDATE administrator SET password = ?, updated_at = NOW() WHERE admin_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('si', $hashed_password, $user_id);
        $stmt->execute();
        $updated = $stmt->affected_rows > 0;
        
        if ($updated) {
            $emailQuery = "SELECT email, first_name, last_name FROM administrator WHERE admin_id = ?";
            $stmt = $conn->prepare($emailQuery);
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
        }
        
    } elseif ($role === 'student') {
        $updateQuery = "UPDATE student SET password = ?, updated_at = NOW() WHERE student_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('si', $hashed_password, $user_id);
        $stmt->execute();
        $updated = $stmt->affected_rows > 0;
        
        if ($updated) {
            $emailQuery = "SELECT email, first_name, last_name FROM student WHERE student_id = ?";
            $stmt = $conn->prepare($emailQuery);
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
        }
        
    } elseif ($role === 'advisor') {
        $updateQuery = "UPDATE advisor SET password = ?, updated_at = NOW() WHERE advisor_id = ?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('si', $hashed_password, $user_id);
        $stmt->execute();
        $updated = $stmt->affected_rows > 0;
        
        if ($updated) {
            $emailQuery = "SELECT email, first_name, last_name FROM advisor WHERE advisor_id = ?";
            $stmt = $conn->prepare($emailQuery);
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
        }
    }
    
    if (!$updated) {
        throw new Exception('User not found');
    }
    
    // In a real implementation, you would send an email here
    // For now, we'll just return the new password
    
    echo json_encode([
        'success' => true,
        'message' => 'Password reset successfully',
        'data' => [
            'new_password' => $new_password,
            'user_email' => $user['email'],
            'user_name' => $user['first_name'] . ' ' . $user['last_name']
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
