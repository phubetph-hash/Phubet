<?php
// Check current session status for debugging
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

// Return current session info
echo json_encode([
    'success' => true,
    'session_id' => session_id(),
    'authenticated' => isset($_SESSION['role']) && isset($_SESSION['user_id']),
    'role' => $_SESSION['role'] ?? null,
    'user_id' => $_SESSION['user_id'] ?? null,
    'email' => $_SESSION['email'] ?? null,
    'session_data' => $_SESSION ?? []
]);
?>