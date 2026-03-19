<?php
require_once __DIR__ . '/../../middleware/cors.php';
cors();

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

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
$rawInput = file_get_contents('php://input');
error_log("Reset password raw input: " . $rawInput);

$data = json_decode($rawInput, true);
error_log("Reset password decoded data: " . print_r($data, true));

$token = isset($data['token']) ? trim($data['token']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';

if (empty($token) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกข้อมูลให้ครบถ้วน']);
    exit;
}

// Check if token exists and is not expired
error_log("Checking token: " . $token);

$sql = "SELECT t.*, a.email, a.role, t.expires_at, CONVERT_TZ(NOW(), 'SYSTEM', 'UTC') as timestamp 
        FROM password_reset_tokens t 
        JOIN auth_accounts a ON t.user_id = a.user_id 
        WHERE t.token = ?";
error_log("SQL query: " . $sql);

$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    error_log("Token not found: " . $token);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่']);
    exit;
}

$row = $result->fetch_assoc();
error_log("Token data: " . print_r($row, true));

// Convert both times to UTC for comparison
$expires = new DateTime($row['expires_at'], new DateTimeZone('UTC'));
$now = new DateTime($row['timestamp'], new DateTimeZone('UTC'));

error_log("Token expiry check - Expires: " . $expires->format('Y-m-d H:i:s') . ", Now: " . $now->format('Y-m-d H:i:s'));

if($expires < $now){
    error_log("Token expired");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุแล้ว กรุณาขอลิงก์ใหม่']);
    exit;
}

// Hash password using SHA2-256 to match login system
$stmt = $conn->prepare("SELECT SHA2(?, 256) AS hash");
$stmt->bind_param('s', $password);
$stmt->execute();
$hash_result = $stmt->get_result()->fetch_assoc();
$password_hash = $hash_result['hash'];

error_log("User role: " . $row['role']);
error_log("User ID: " . $row['user_id']);
error_log("Password hash: " . $password_hash);

// เริ่ม transaction
$conn->begin_transaction();

try {
    // อัพเดทรหัสผ่านในตาราง role-specific
    $updateSql = '';
    if ($row['role'] === 'student') {
        $updateSql = 'UPDATE student SET password = ? WHERE student_id = ?';
    } else if ($row['role'] === 'advisor') { 
        $updateSql = 'UPDATE advisor SET password = ? WHERE CAST(advisor_id AS CHAR(20)) = ?';
    } else if ($row['role'] === 'admin') {
        $updateSql = 'UPDATE administrator SET password = ? WHERE CAST(admin_id AS CHAR(20)) = ?';
    } else {
        error_log("Invalid role: " . $row['role']);
        throw new Exception('ไม่พบข้อมูลผู้ใช้งาน');
    }

    $stmt = $conn->prepare($updateSql);
    if (!$stmt) {
        throw new Exception('ไม่สามารถเตรียมคำสั่งอัปเดตรหัสผ่านได้');
    }

    $stmt->bind_param('ss', $password_hash, $row['user_id']);

    if (!$stmt->execute()) {
        error_log("Failed to update password. Error: " . $stmt->error);
        throw new Exception('ไม่สามารถอัพเดทรหัสผ่านได้');
    }

    error_log("Password updated successfully for user ID: " . $row['user_id']);

    // Delete used token
    $stmt = $conn->prepare('DELETE FROM password_reset_tokens WHERE token = ?');
    $stmt->bind_param('s', $token);
    
    if (!$stmt->execute()) {
        throw new Exception('ไม่สามารถลบโทเคนได้');
    }

    // ถ้าทุกอย่างสำเร็จ commit transaction
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'ตั้งรหัสผ่านใหม่สำเร็จ'
    ]);

} catch (Exception $e) {
    // ถ้าเกิด error ให้ rollback
    $conn->rollback();
    error_log("Password update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'ไม่สามารถอัพเดทรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง'
    ]);
    exit;
}