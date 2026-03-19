<?php
// Start output buffering to prevent any accidental output before headers
ob_start();

// Load config first
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../middleware/cors.php';

// Response content type
header('Content-Type: application/json; charset=utf-8');

// Apply CORS headers
cors();

// Clear any buffered output
ob_end_clean();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204); 
    exit; 
}

// Now safe to start session and load other dependencies
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../middleware/rate_limit.php';
require_once __DIR__ . '/../../middleware/csrf.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Rate limit: 20 requests per 60 seconds per IP
rate_limit('auth_login', 20, 60);

$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'email and password are required']);
    exit;
}

// Fetch account from unified view and check user status
$stmt = $conn->prepare("
    SELECT a.role, a.user_id, a.password_hash, a.name, COALESCE(us.status, 'active') as status
    FROM auth_accounts a
    LEFT JOIN user_status us ON us.user_id = a.user_id AND us.role = a.role
    WHERE a.email = ?
");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows !== 1) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error', 
        'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'error_code' => 'INVALID_CREDENTIALS'
    ]);
    exit;
}
$row = $result->fetch_assoc();

// Check if account is suspended
if ($row['status'] === 'suspended') {
    http_response_code(403);
    echo json_encode([
        'status' => 'error', 
        'message' => 'บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ',
        'error_code' => 'ACCOUNT_SUSPENDED'
    ]);
    exit;
}

// Check if account is deleted
if ($row['status'] === 'deleted') {
    http_response_code(403);
    echo json_encode([
        'status' => 'error', 
        'message' => 'บัญชีของคุณถูกลบแล้ว',
        'error_code' => 'ACCOUNT_DELETED'
    ]);
    exit;
}

// Compare SHA2-256
$hashStmt = $conn->prepare("SELECT SHA2(?, 256) AS h");
$hashStmt->bind_param('s', $password);
$hashStmt->execute();
$hashRes = $hashStmt->get_result()->fetch_assoc();

if (!hash_equals($row['password_hash'], $hashRes['h'])) {
    http_response_code(401);
    echo json_encode([
        'status' => 'error', 
        'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        'error_code' => 'INVALID_CREDENTIALS'
    ]);
    exit;
}

// Establish simple session
$_SESSION['role'] = $row['role'];
$_SESSION['user_id'] = $row['user_id'];
$_SESSION['email'] = $email;

// Generate CSRF token for this session
$csrf_token = generateCsrfToken();

// IMPORTANT: Force session write before sending response
// This prevents race condition where frontend loads notifications
// before session cookie is properly set in browser
session_write_close();

echo json_encode([
    'status' => 'ok',
    'data' => [
        'role' => $row['role'],
        'user_id' => $row['user_id'],
        'email' => $email,
        'name' => $row['name'],
        'csrf_token' => $csrf_token
    ]
]);
?>

