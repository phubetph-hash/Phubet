<?php
require_once __DIR__ . '/connect.php';

header('Content-Type: application/json; charset=utf-8');

// Show student table structure
$query = "SHOW COLUMNS FROM student";
$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Query failed: ' . $conn->error
    ]);
    exit;
}

$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row;
}

echo json_encode([
    'status' => 'success',
    'columns' => $columns
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conn->close();
?>
