<?php
require_once(__DIR__ . '/backend/connect.php');

// Grant permissions
$sql = file_get_contents(__DIR__ . '/grant_permissions.sql');
if ($conn->multi_query($sql)) {
    echo "Permissions granted successfully\n";
    while ($conn->more_results() && $conn->next_result()) {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    }
} else {
    echo "Error granting permissions: " . $conn->error . "\n";
}

$conn->close();