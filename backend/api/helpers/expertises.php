<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$sql = "SELECT expertise_id, expertise_name AS expertise_name_th FROM expertise ORDER BY expertise_name";
$res = $conn->query($sql);
$rows = [];
if ($res) { while ($r = $res->fetch_assoc()) { $rows[] = $r; } }
echo json_encode(['success' => true, 'data' => $rows]);
?>

