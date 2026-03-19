<?php
require_once __DIR__ . '/connect.php';

header('Content-Type: application/json; charset=utf-8');

// Show auth_accounts VIEW definition
$query = "SHOW CREATE VIEW auth_accounts";
$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Query failed: ' . $conn->error
    ]);
    exit;
}

$row = $result->fetch_assoc();

echo json_encode([
    'status' => 'success',
    'view_name' => $row['View'],
    'create_view' => $row['Create View']
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conn->close();
?>
