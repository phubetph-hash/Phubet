<?php
require_once __DIR__ . '/config.php';

mysqli_report(MYSQLI_REPORT_OFF);

$conn = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode([ 'status' => 'error', 'message' => 'Database connection failed', 'error' => $conn->connect_error ]));
}

$conn->set_charset('utf8mb4');
?>
