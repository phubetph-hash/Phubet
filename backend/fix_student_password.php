<?php
require_once __DIR__ . '/connect.php';

header('Content-Type: application/json; charset=utf-8');

// Fix password hash for somchai.j@ku.th
$correctHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

$updateQuery = "UPDATE student 
                SET password = ? 
                WHERE email = 'somchai.j@ku.th'";

$stmt = $conn->prepare($updateQuery);
$stmt->bind_param('s', $correctHash);

if ($stmt->execute()) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Password hash updated for somchai.j@ku.th',
        'affected_rows' => $stmt->affected_rows
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Update failed: ' . $conn->error
    ], JSON_PRETTY_PRINT);
}

$stmt->close();
$conn->close();
?>
