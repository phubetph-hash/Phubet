<?php
// Simple session-based auth middleware
// Usage:
//   require_once __DIR__ . '/../middleware/auth.php';
//   require_auth(); // any logged-in user
//   require_auth('student'); // specific role

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function require_auth($role = null) {
    if (!isset($_SESSION['role']) || !isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status'=>'error','message'=>'unauthorized']);
        exit;
    }
    if ($role !== null && $_SESSION['role'] !== $role) {
        http_response_code(403);
        echo json_encode(['status'=>'error','message'=>'forbidden']);
        exit;
    }
}

function current_user_role() { return $_SESSION['role'] ?? null; }
function current_user_id() { return $_SESSION['user_id'] ?? null; }

function checkAuth() {
    return [
        'authenticated' => isset($_SESSION['role']) && isset($_SESSION['user_id']),
        'role' => $_SESSION['role'] ?? null,
        'user_id' => $_SESSION['user_id'] ?? null
    ];
}

function authenticate() {
    if (!isset($_SESSION['role']) || !isset($_SESSION['user_id'])) {
        return null;
    }
    return [
        'role' => $_SESSION['role'],
        'user_id' => $_SESSION['user_id']
    ];
}
?>

