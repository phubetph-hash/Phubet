<?php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$department_id = isset($_GET['department_id']) ? intval($_GET['department_id']) : 0;
$sql = "SELECT program_id, program_name, program_name AS program_name_th, department_id FROM program";
if ($department_id > 0) { $sql .= " WHERE department_id = ".$department_id; }
$sql .= " ORDER BY program_name";

$res = $conn->query($sql);
$rows = [];
if ($res) { while ($r = $res->fetch_assoc()) { $rows[]=$r; } }
echo json_encode(['status'=>'ok','data'=>$rows]);
?>

