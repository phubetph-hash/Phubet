<?php
require_once(__DIR__ . '/backend/connect.php');

$sql = "SHOW CREATE VIEW auth_accounts";
$result = $conn->query($sql);

if ($result) {
    $row = $result->fetch_assoc();
    echo "Current view definition:\n";
    print_r($row);
} else {
    echo "Error checking view: " . $conn->error . "\n";
}

$conn->close();