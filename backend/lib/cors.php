<?php
require_once __DIR__ . '/../config.php';

function setCorsHeaders() {
    if (isset($GLOBALS['CORS_ORIGIN'])) {
        header('Access-Control-Allow-Origin: ' . $GLOBALS['CORS_ORIGIN']);
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, x-csrf-token, X-Requested-With');
    }

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}