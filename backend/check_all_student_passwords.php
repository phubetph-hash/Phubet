<?php
require_once __DIR__ . '/connect.php';

header('Content-Type: application/json; charset=utf-8');

// Show all student passwords
$query = "SELECT student_id, email, password_hash FROM student";
$result = $conn->query($query);

if (!$result) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Query failed: ' . $conn->error
    ]);
    exit;
}

$students = [];
$correctHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

while ($row = $result->fetch_assoc()) {
    $row['is_correct'] = ($row['password_hash'] === $correctHash);
    $students[] = $row;
}

echo json_encode([
    'status' => 'success',
    'expected_hash' => $correctHash,
    'students' => $students
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$conn->close();
?>
