<?php
require_once __DIR__ . '/../../middleware/cors.php';
cors();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../lib/Mailer.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get request body
$data = json_decode(file_get_contents('php://input'), true);
$email = isset($data['email']) ? trim($data['email']) : '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

// Check if email exists in auth_accounts
$stmt = $conn->prepare('SELECT user_id, role FROM auth_accounts WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Don't reveal if email exists or not for security
    echo json_encode(['success' => true, 'message' => 'If the email exists in our system, you will receive a password reset link']);
    exit;
}

// Generate reset token
$token = bin2hex(random_bytes(32));
$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token expires in 1 hour

// Store reset token in database
$stmt = $conn->prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
$user = $result->fetch_assoc();
$userId = $user['user_id'];
$stmt->bind_param('sss', $userId, $token, $expiresAt);

try {
    $stmt->execute();
} catch (mysqli_sql_exception $e) {
    // Remove any existing tokens for this user first
    $stmt = $conn->prepare('DELETE FROM password_reset_tokens WHERE user_id = ?');
    $stmt->bind_param('s', $userId);
    $stmt->execute();
    
    // Try inserting again
    $stmt = $conn->prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $userId, $token, $expiresAt);
    $stmt->execute();
}

// Generate reset URL
$resetUrl = 'http://localhost:3000/reset-password?token=' . $token;

// Send email with reset link
try {
    $mailer = new Mailer();
    $mailer->sendPasswordReset($email, $resetUrl);
    
    echo json_encode([
        'success' => true,
        'message' => 'หากอีเมลนี้มีอยู่ในระบบ คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่านทางอีเมล'
    ]);
} catch (Exception $e) {
    error_log('Forgot password email send failed for ' . $email . ': ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง'
    ]);
}