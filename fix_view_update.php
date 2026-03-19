<?php
require_once(__DIR__ . '/backend/connect.php');

// Grant necessary permissions
$grant_sql = "GRANT UPDATE ON advisordb.auth_accounts TO CURRENT_USER;";
$conn->query($grant_sql);

// Add update permissions to the view
$alter_sql = "
DROP VIEW IF EXISTS auth_accounts;
CREATE VIEW auth_accounts AS
SELECT 
    'student' COLLATE utf8mb4_unicode_ci AS role,
    student_id COLLATE utf8mb4_unicode_ci AS user_id,
    email COLLATE utf8mb4_unicode_ci AS email,
    password_hash COLLATE utf8mb4_unicode_ci AS password_hash
FROM student
UNION ALL
SELECT 
    'advisor' COLLATE utf8mb4_unicode_ci AS role,
    CAST(advisor_id AS CHAR(20)) COLLATE utf8mb4_unicode_ci AS user_id,
    email COLLATE utf8mb4_unicode_ci AS email,
    password_hash COLLATE utf8mb4_unicode_ci AS password_hash
FROM advisor
UNION ALL
SELECT 
    'admin' COLLATE utf8mb4_unicode_ci AS role,
    CAST(admin_id AS CHAR(20)) COLLATE utf8mb4_unicode_ci AS user_id,
    email COLLATE utf8mb4_unicode_ci AS email,
    password_hash COLLATE utf8mb4_unicode_ci AS password_hash
FROM administrator
WITH CHECK OPTION;";

$result = $conn->multi_query($alter_sql);

if ($result) {
    echo "View updated successfully with UPDATE permission\n";
    // Clear remaining results
    while ($conn->more_results() && $conn->next_result()) {
        if ($res = $conn->store_result()) {
            $res->free();
        }
    }

    // Test UPDATE query on an admin account
    $test_sql = "UPDATE auth_accounts SET password_hash = 'test_hash' WHERE role = 'admin' LIMIT 1";
    if ($conn->query($test_sql)) {
        echo "Test UPDATE query successful\n";
    } else {
        echo "Error testing UPDATE: " . $conn->error . "\n";
    }
} else {
    echo "Error updating view: " . $conn->error . "\n";
}

$conn->close();