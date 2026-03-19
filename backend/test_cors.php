<?php
require_once __DIR__ . '/config.php';

// CORS headers
header('Access-Control-Allow-Origin: ' . $CORS_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { 
    http_response_code(204); 
    exit; 
}

echo json_encode([
    'status' => 'ok',
    'message' => 'CORS is working!',
    'cors_origin' => $CORS_ORIGIN,
    'request_origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
    'headers_sent' => headers_list()
]);
?>

