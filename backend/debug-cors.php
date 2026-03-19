<?php
/**
 * CORS Debug Endpoint
 * Test: GET /backend/debug-cors.php
 */

header_remove('Access-Control-Allow-Origin');
require_once __DIR__ . '/config.php';

// Force CORS to be called
require_once __DIR__ . '/middleware/cors.php';
cors();

// Output debug info
header('Content-Type: application/json; charset=utf-8');
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'No origin header';

echo json_encode([
    'success' => true,
    'message' => 'CORS Debug Info',
    'request_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'response_headers' => [
        'Access-Control-Allow-Origin' => getallheaders()['Access-Control-Allow-Origin'] ?? 'NOT SET',
        'Access-Control-Allow-Credentials' => getallheaders()['Access-Control-Allow-Credentials'] ?? 'NOT SET',
    ],
    'timestamp' => date('Y-m-d H:i:s'),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
