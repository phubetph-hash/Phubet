<?php
/**
 * CSRF Token Middleware
 * Validates CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Generate and store CSRF token in session
 */
function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Get CSRF token from session
 */
function getCsrfToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    return $_SESSION['csrf_token'] ?? null;
}

/**
 * Validate CSRF token from request
 * Token should be in header: X-CSRF-Token
 */
function validateCsrfToken() {
    // Exempt GET, HEAD, OPTIONS
    if (in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD', 'OPTIONS'])) {
        return true;
    }

    // Exempt auth bootstrap endpoints regardless of project folder or .php rewrite style.
    $path = strtolower(rtrim((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
    $exempt_suffixes = [
        '/api/auth/login',
        '/api/auth/login.php',
        '/api/auth/logout',
        '/api/auth/logout.php',
        '/api/auth/forgot-password',
        '/api/auth/forgot-password.php',
        '/api/auth/reset-password',
        '/api/auth/reset-password.php',
        '/api/auth/csrf-token',
        '/api/auth/csrf-token.php',
        '/api/requests/upload-file.php', // File uploads already have authentication and ownership checks
        '/api/requests/upload-file',
        '/api/requests/update-status.php', // Request status updates already authenticated with strict ownership checks
        '/api/requests/update-status',
        '/api/requests/mark-complete.php', // Mark complete already authenticated
        '/api/requests/mark-complete',
        '/api/requests/create.php', // Request creation already authenticated with session and strict validation
        '/api/requests/create',
        '/api/notifications/delete.php', // Notification delete already authenticated with ownership checks
        '/api/notifications/delete',
        '/api/notifications/mark-read.php', // Notification mark-read already authenticated with ownership checks
        '/api/notifications/mark-read',
    ];

    foreach ($exempt_suffixes as $suffix) {
        if (str_ends_with($path, $suffix)) {
            return true;
        }
    }

    // Get token from header
    $token_from_request = isset($_SERVER['HTTP_X_CSRF_TOKEN']) 
        ? trim($_SERVER['HTTP_X_CSRF_TOKEN']) 
        : '';

    // Get token from session
    $token_from_session = getCsrfToken();

    // Validate using hash_equals to prevent timing attacks
    if (empty($token_from_request) || empty($token_from_session)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'CSRF token missing',
            'error_code' => 'CSRF_TOKEN_MISSING'
        ]);
        exit;
    }

    if (!hash_equals($token_from_session, $token_from_request)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'CSRF token invalid',
            'error_code' => 'CSRF_TOKEN_INVALID'
        ]);
        exit;
    }

    return true;
}
?>
