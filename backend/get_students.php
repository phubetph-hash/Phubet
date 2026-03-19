<?php
include 'connect.php';

$sql = "SELECT * FROM student";
$result = $conn->query($sql);

$students = [];

while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

header('Content-Type: application/json');
echo json_encode($students);
?>
