<?php
// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../connect.php';

/**
 * Resolve proposal file path across legacy and current storage formats.
 */
function resolveProposalFilePath($storedValue) {
    if (!$storedValue || !is_string($storedValue)) {
        return null;
    }

    $value = trim($storedValue);
    if ($value === '') {
        return null;
    }

    $uploadsRequestsDir = realpath(__DIR__ . '/../../uploads/requests');
    if ($uploadsRequestsDir === false) {
        return null;
    }

    $uploadsRequestsDir = rtrim($uploadsRequestsDir, DIRECTORY_SEPARATOR);

    // Candidate 1: value already includes a relative path.
    $relativeCandidate = realpath(__DIR__ . '/../../' . ltrim(str_replace('\\', '/', $value), '/'));
    if ($relativeCandidate !== false && strpos($relativeCandidate, $uploadsRequestsDir) === 0 && is_file($relativeCandidate)) {
        return $relativeCandidate;
    }

    // Candidate 2: value is just a filename.
    $basename = basename($value);
    $directCandidate = $uploadsRequestsDir . DIRECTORY_SEPARATOR . $basename;
    if (is_file($directCandidate)) {
        return $directCandidate;
    }

    // Candidate 3: handle legacy variants that append suffixes to the stored stem.
    $filenameInfo = pathinfo($basename);
    $stem = isset($filenameInfo['filename']) ? $filenameInfo['filename'] : '';
    $ext = isset($filenameInfo['extension']) && $filenameInfo['extension'] !== '' ? $filenameInfo['extension'] : '*';

    if ($stem !== '') {
        $pattern = $uploadsRequestsDir . DIRECTORY_SEPARATOR . $stem . '*.' . $ext;
        $matches = glob($pattern);
        if (is_array($matches) && count($matches) > 0) {
            usort($matches, function ($a, $b) {
                return filemtime($b) - filemtime($a);
            });
            if (is_file($matches[0])) {
                return $matches[0];
            }
        }
    }

    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Authentication required
$auth = checkAuth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication required'
    ]);
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

try {
    $request_id = isset($_GET['request_id']) ? intval($_GET['request_id']) : 0;
    
    if ($request_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Request ID is required'
        ]);
        exit;
    }

    // Get request details and check permissions
    $stmt = $conn->prepare("
        SELECT r.request_id, r.student_id, r.advisor_id, r.proposal_file,
               s.first_name AS student_first_name, s.last_name AS student_last_name
        FROM request r 
        JOIN student s ON r.student_id = s.student_id
        WHERE r.request_id = ?
    ");
    $stmt->bind_param("i", $request_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Request not found'
        ]);
        exit;
    }
    
    $request = $result->fetch_assoc();
    
    // Check if user has permission to view this file
    $has_permission = false;
    
    // Convert to string for comparison (database returns string, session might be int)
    $user_id_str = (string)$auth['user_id'];
    $student_id_str = (string)$request['student_id'];
    $advisor_id_str = (string)$request['advisor_id'];
    
    if ($auth['role'] === 'student' && $user_id_str === $student_id_str) {
        $has_permission = true; // Student can view their own files
    } else if ($auth['role'] === 'advisor' && $user_id_str === $advisor_id_str) {
        $has_permission = true; // Advisor can view files from requests sent to them
    } else if ($auth['role'] === 'admin') {
        $has_permission = true; // Admin can view all files
    }
    
    if (!$has_permission) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied'
        ]);
        exit;
    }
    
    if (!$request['proposal_file']) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'No file attached to this request'
        ]);
        exit;
    }
    
    $file_path = resolveProposalFilePath($request['proposal_file']);

    if ($file_path === null) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'File not found on server',
            'missing_file' => $request['proposal_file']
        ]);
        exit;
    }
    
    // Get file info
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $file_path);
    finfo_close($finfo);
    
    $file_size = filesize($file_path);
    $download_name = !empty($request['proposal_file']) ? basename($request['proposal_file']) : basename($file_path);
    
    // Set headers for file download/display
    header('Content-Type: ' . $mime_type);
    header('Content-Length: ' . $file_size);
    header('Content-Disposition: inline; filename="' . $download_name . '"');
    header('Cache-Control: private, max-age=3600');
    header('Pragma: cache');
    
    // Output file
    readfile($file_path);
    exit;

} catch (Exception $e) {
    error_log("File download error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>