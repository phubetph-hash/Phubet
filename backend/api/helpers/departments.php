<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$faculty_id = isset($_GET['faculty_id']) ? intval($_GET['faculty_id']) : 0;
$sql = "SELECT department_id, department_name AS department_name_th, faculty_id FROM department";
if ($faculty_id > 0) { $sql .= " WHERE faculty_id = ".$faculty_id; }
$sql .= " ORDER BY department_name";

$res = $conn->query($sql);
$rows = [];
if ($res) { while ($r = $res->fetch_assoc()) { $rows[]=$r; } }
echo json_encode(['success'=>true,'data'=>$rows]);
?>

