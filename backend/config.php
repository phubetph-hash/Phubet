<?php
// Database configuration for AdvisorDB
// NOTE: Update these if your local credentials differ
$DB_HOST = getenv('DB_HOST') ?: 'localhost';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';
$DB_NAME = getenv('DB_NAME') ?: 'AdvisorDB';

// CORS configuration - automatically handle dynamic origins
// This applies to all API endpoints
require_once __DIR__ . '/middleware/cors.php';
if (php_sapi_name() !== 'cli') {
    cors(); // Apply CORS headers for all HTTP requests
}

// Global CSRF validation for state-changing HTTP methods.
// The middleware itself handles exemptions (auth bootstrap endpoints, OPTIONS, etc.).
if (php_sapi_name() !== 'cli') {
    require_once __DIR__ . '/middleware/csrf.php';
    validateCsrfToken();
}

// Database connection function
function getDbConnection() {
    global $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME;
    
    $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
    
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }
    
    $conn->set_charset('utf8mb4');
    return $conn;
}
?>

