<?php
require_once(__DIR__ . '/backend/connect.php');

// Create the view
$sql = file_get_contents(__DIR__ . '/fix_auth_view.sql');
if ($conn->multi_query($sql)) {
    echo "View created successfully\n";
    // Clear remaining results
    while ($conn->more_results() && $conn->next_result()) {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    }

    // Test SELECT query
    echo "\nTesting SELECT from view:\n";
    $test_sql = "SELECT * FROM auth_accounts WHERE role = 'admin' LIMIT 1";
    $result = $conn->query($test_sql);
    if ($result && $row = $result->fetch_assoc()) {
        echo "Found admin user: " . $row['email'] . "\n";
    } else {
        echo "Error or no admin found: " . $conn->error . "\n";
    }

    // Test underlying tables still work
    echo "\nTesting direct table access:\n";
    $tables = ['student', 'advisor', 'administrator'];
    foreach ($tables as $table) {
        $sql = "SELECT email, password_hash FROM $table LIMIT 1";
        $result = $conn->query($sql);
        if ($result && $row = $result->fetch_assoc()) {
            echo "$table table accessible\n";
        } else {
            echo "Error accessing $table table: " . $conn->error . "\n";
        }
    }
} else {
    echo "Error creating view: " . $conn->error . "\n";
}

$conn->close();
