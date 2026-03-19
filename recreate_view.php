<?php
require_once(__DIR__ . '/backend/connect.php');

$sql = file_get_contents(__DIR__ . '/recreate_auth_view.sql');
$result = $conn->multi_query($sql);

if ($result) {
    echo "Auth accounts view recreated successfully\n";
    
    // Clear out remaining results
    while ($conn->more_results() && $conn->next_result()) {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    }
    
    // Verify the view was created
    $verify = $conn->query("SELECT COUNT(*) as count FROM auth_accounts");
    if ($verify) {
        $row = $verify->fetch_assoc();
        echo "Found " . $row['count'] . " accounts in the view\n";
    } else {
        echo "Error verifying view: " . $conn->error . "\n";
    }
} else {
    echo "Error creating view: " . $conn->error . "\n";
}

$conn->close();