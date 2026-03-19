<?php
// Simple IP-based rate limiter using session (for dev only)
// Usage: require_once __DIR__.'/rate_limit.php'; rate_limit('auth_login', 20, 60);
// NOTE: session_start() must be called AFTER setting CORS headers in the main script

function rate_limit($key, $maxRequests, $perSeconds) {
    // Ensure session is started (but should be done in main script after CORS headers)
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $bucketKey = 'rate_'.$key.'_'.$ip;
    $now = time();
    if (!isset($_SESSION[$bucketKey])) {
        $_SESSION[$bucketKey] = ['count'=>1,'reset'=>$now + $perSeconds];
        return; 
    }
    $bucket = &$_SESSION[$bucketKey];
    if ($now > $bucket['reset']) { $bucket = ['count'=>1,'reset'=>$now + $perSeconds]; return; }
    $bucket['count']++;
    if ($bucket['count'] > $maxRequests) {
        http_response_code(429);
        echo json_encode(['status'=>'error','message'=>'too many requests','retry_after'=>$bucket['reset'] - $now]);
        exit;
    }
}
?>

