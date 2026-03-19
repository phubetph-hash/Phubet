<?php
/**
 * Admin API: Dashboard Statistics
 * GET /api/admin/dashboard/stats.php
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

try {
    $stats = [];
    
    // Count total students
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM student");
    $stmt->execute();
    $stats['totalStudents'] = $stmt->get_result()->fetch_assoc()['count'];
    
    // Count total advisors
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM advisor");
    $stmt->execute();
    $stats['totalAdvisors'] = $stmt->get_result()->fetch_assoc()['count'];
    
    // Count total requests
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM request");
    $stmt->execute();
    $stats['totalRequests'] = $stmt->get_result()->fetch_assoc()['count'];
    
    // Count pending requests
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE status = 'รอดำเนินการ'");
    $stmt->execute();
    $stats['pendingRequests'] = $stmt->get_result()->fetch_assoc()['count'];
    
    // Count approved requests
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE status = 'อนุมัติ'");
    $stmt->execute();
    $stats['approvedRequests'] = $stmt->get_result()->fetch_assoc()['count'];
    
    // Count rejected requests
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE status = 'ปฏิเสธ'");
    $stmt->execute();
    $stats['rejectedRequests'] = $stmt->get_result()->fetch_assoc()['count'];
    
    // Count expired requests
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE status = 'หมดอายุ'");
    $stmt->execute();
    $stats['expiredRequests'] = $stmt->get_result()->fetch_assoc()['count'];
    
    // Count cancelled requests
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE status = 'ยกเลิก'");
    $stmt->execute();
    $stats['cancelledRequests'] = $stmt->get_result()->fetch_assoc()['count'];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>