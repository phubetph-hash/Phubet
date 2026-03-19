<?php
require_once __DIR__ . '/connect.php';

header('Content-Type: application/json; charset=utf-8');

// Test if auth_accounts VIEW exists and has student data
$query = "SELECT role, user_id, email, LEFT(password_hash, 20) as hash_preview 
          FROM auth_accounts 
          WHERE role = 'student' 
          LIMIT 5";

$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Query failed: ' . $conn->error
    ]);
    exit;
}

$students = [];
while ($row = $result->fetch_assoc()) {
    $students[] = $row;
}

echo json_encode([
    'status' => 'success',
    'total_students' => count($students),
    'students' => $students
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conn->close();
?>
