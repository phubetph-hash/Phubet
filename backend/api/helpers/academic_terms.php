<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$sql = "SELECT academic_term_id, academic_year, term FROM academic_term ORDER BY academic_year DESC, 
        CASE WHEN term = 'ต้น' THEN 1 
             WHEN term = 'ปลาย' THEN 2 
             WHEN term = 'ฤดูร้อน' THEN 3 END";
$res = $conn->query($sql);
$rows = [];
if ($res) { 
    while ($r = $res->fetch_assoc()) { 
        $rows[] = $r; 
    } 
}
echo json_encode(['success' => true, 'data' => $rows]);
?>

