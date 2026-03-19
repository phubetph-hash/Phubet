<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204); 
    exit; 
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $sql = "SELECT academic_degree_id, degree_name_th, degree_name_en, sort_order, created_at 
            FROM academic_degree 
            WHERE is_active = 1
            ORDER BY sort_order ASC, degree_name_th ASC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . $conn->error);
    }
    
    $degrees = [];
    while ($row = $result->fetch_assoc()) {
        $degrees[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $degrees,
        'count' => count($degrees)
    ]);

} catch (Exception $e) {
    error_log("Academic Degrees API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>