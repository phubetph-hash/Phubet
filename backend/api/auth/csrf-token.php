<?php
/**
 * CSRF Token Endpoint
 * GET /api/auth/csrf-token.php
 * 
 * Returns CSRF token to frontend for state-changing requests
 * Does NOT require authentication (safe to call before login)
 */

ob_start();

require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../middleware/cors.php';

// Apply CORS headers early
cors();

header('Content-Type: application/json; charset=utf-8');
ob_end_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

// Start session without auth requirement
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../middleware/csrf.php';

// Generate new token if not exists
$token = generateCsrfToken();

echo json_encode([
    'success' => true,
    'data' => [
        'token' => $token,
        'header_name' => 'X-CSRF-Token'
    ]
]);
?>
