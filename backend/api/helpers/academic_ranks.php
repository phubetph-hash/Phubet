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
    $sql = "SELECT academic_rank_id, rank_name_th, rank_name_en, sort_order, created_at 
            FROM academic_rank 
            WHERE is_active = 1
            ORDER BY sort_order ASC, rank_name_th ASC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception('Database query failed: ' . $conn->error);
    }
    
    $ranks = [];
    while ($row = $result->fetch_assoc()) {
        $ranks[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $ranks,
        'count' => count($ranks)
    ]);

} catch (Exception $e) {
    error_log("Academic Ranks API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>