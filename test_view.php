<?php
require_once(__DIR__ . '/backend/connect.php');

// Test SELECT query
$sql = "SELECT * FROM auth_accounts LIMIT 5";
$result = $conn->query($sql);

if ($result) {
    echo "Successfully queried auth_accounts view\n";
    echo "Found records:\n";
    while ($row = $result->fetch_assoc()) {
        echo "Role: " . $row['role'] . ", User ID: " . $row['user_id'] . ", Email: " . $row['email'] . "\n";
    }
} else {
    echo "Error querying view: " . $conn->error . "\n";
}

$conn->close();