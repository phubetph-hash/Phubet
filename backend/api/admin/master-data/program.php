<?php
/**
 * Admin API: Program Management
 * POST /api/admin/master-data/program.php (Create)
 * PUT /api/admin/master-data/program.php (Update) 
 * DELETE /api/admin/master-data/program.php (Delete)
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
        
        // Support both program_name and program_name_th
        $program_name = trim($input['program_name'] ?? $input['program_name_th'] ?? '');
        $department_id = intval($input['department_id'] ?? 0);
        
        if (empty($program_name) || $department_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Program name and department ID are required']);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO program (program_name, department_id) VALUES (?, ?)");
        $stmt->bind_param('si', $program_name, $department_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Program created successfully',
                'data' => ['program_id' => $conn->insert_id]
            ]);
        } else {
            throw new Exception('Failed to create program');
        }
        
    } else if ($method === 'PUT') {
        // UPDATE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $program_id = intval($input['program_id'] ?? 0);
        // Support both program_name and program_name_th
        $program_name = trim($input['program_name'] ?? $input['program_name_th'] ?? '');
        $department_id = intval($input['department_id'] ?? 0);
        
        if ($program_id <= 0 || empty($program_name) || $department_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Program ID, name and department ID are required']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE program SET program_name = ?, department_id = ? WHERE program_id = ?");
        $stmt->bind_param('sii', $program_name, $department_id, $program_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Program updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update program');
        }
        
    } else if ($method === 'DELETE') {
        // DELETE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $program_id = intval($input['program_id'] ?? 0);
        
        if ($program_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Program ID is required']);
            exit;
        }
        
        // Check if program is used by students
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM student WHERE program_id = ?");
        $checkStmt->bind_param('i', $program_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result()->fetch_assoc();
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cannot delete program that has students']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM program WHERE program_id = ?");
        $stmt->bind_param('i', $program_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Program deleted successfully'
            ]);
        } else {
            throw new Exception('Failed to delete program');
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