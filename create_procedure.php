<?php
require_once(__DIR__ . '/backend/connect.php');

// Create the stored procedure
$sql = file_get_contents(__DIR__ . '/create_update_procedure.sql');
$result = $conn->multi_query($sql);

if ($result) {
    echo "Stored procedure created successfully\n";
    // Clear remaining results
    while ($conn->more_results() && $conn->next_result()) {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    }

    // Test the stored procedure
    $test_sql = "CALL update_user_password('admin', '1', 'test_hash')";
    if ($conn->query($test_sql)) {
        echo "Test UPDATE using stored procedure successful\n";
    } else {
        echo "Error testing stored procedure: " . $conn->error . "\n";
    }
} else {
    echo "Error creating stored procedure: " . $conn->error . "\n";
}

$conn->close();