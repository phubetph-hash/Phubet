<?php
/**
 * Admin API: Academic Terms Management
 * POST /api/admin/master-data/academic_terms.php (Create)
 * PUT /api/admin/master-data/academic_terms.php (Update)
 * DELETE /api/admin/master-data/academic_terms.php (Delete)
 */

require_once __DIR__ . '/../../../config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../../connect.php';
require_once __DIR__ . '/../../../middleware/auth.php';

// Check authentication and admin role
$auth = checkAuth();
if (!$auth['authenticated'] || $auth['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    if ($method === 'POST') {
        // CREATE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        // Map frontend fields to database fields
        $term_year = intval($input['term_year'] ?? 0);
        $term_number = intval($input['term_number'] ?? 0);
        
        if ($term_year <= 0 || $term_number <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Term year and term number are required']);
            exit;
        }
        
        if ($term_number < 1 || $term_number > 3) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Term number must be between 1 and 3']);
            exit;
        }
        
        // Convert term_number to Thai term name (enum)
        $term_map = [1 => 'ต้น', 2 => 'ปลาย', 3 => 'ฤดูร้อน'];
        $term = $term_map[$term_number];
        
        // Format academic_year as "2567/2568" for term 1 (2567) -> "2567/2568"
        $academic_year = $term_year . '/' . ($term_year + 1);
        
        // Check for existing term
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM academic_term WHERE academic_year = ? AND term = ?");
        $checkStmt->bind_param('ss', $academic_year, $term);
        $checkStmt->execute();
        $result = $checkStmt->get_result()->fetch_assoc();
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Academic term already exists for this year and term']);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO academic_term (academic_year, term) VALUES (?, ?)");
        $stmt->bind_param('ss', $academic_year, $term);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Academic term created successfully',
                'data' => ['academic_term_id' => $conn->insert_id]
            ]);
        } else {
            throw new Exception('Failed to create academic term');
        }
        
    } else if ($method === 'PUT') {
        // UPDATE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        // Map frontend fields to database fields
        $academic_term_id = intval($input['term_id'] ?? $input['academic_term_id'] ?? 0);
        $term_year = intval($input['term_year'] ?? 0);
        $term_number = intval($input['term_number'] ?? 0);
        
        if ($academic_term_id <= 0 || $term_year <= 0 || $term_number <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Term ID, term year, and term number are required']);
            exit;
        }
        
        if ($term_number < 1 || $term_number > 3) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Term number must be between 1 and 3']);
            exit;
        }
        
        // Convert term_number to Thai term name (enum)
        $term_map = [1 => 'ต้น', 2 => 'ปลาย', 3 => 'ฤดูร้อน'];
        $term = $term_map[$term_number];
        
        // Format academic_year
        $academic_year = $term_year . '/' . ($term_year + 1);
        
        // Check for existing term (excluding current)
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM academic_term WHERE academic_year = ? AND term = ? AND academic_term_id != ?");
        $checkStmt->bind_param('ssi', $academic_year, $term, $academic_term_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result()->fetch_assoc();
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Academic term already exists for this year and term']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE academic_term SET academic_year = ?, term = ? WHERE academic_term_id = ?");
        $stmt->bind_param('ssi', $academic_year, $term, $academic_term_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Academic term updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update academic term');
        }
        
    } else if ($method === 'DELETE') {
        // DELETE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $academic_term_id = intval($input['term_id'] ?? $input['academic_term_id'] ?? 0);
        
        if ($academic_term_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Term ID is required']);
            exit;
        }
        
        // Check if academic term is used by requests
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM request WHERE academic_term_id = ?");
        $checkStmt->bind_param('i', $academic_term_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result()->fetch_assoc();
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cannot delete academic term that is used in advisor requests']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM academic_term WHERE academic_term_id = ?");
        $stmt->bind_param('i', $academic_term_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Academic term deleted successfully'
            ]);
        } else {
            throw new Exception('Failed to delete academic term');
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>