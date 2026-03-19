<?php
/**
 * Admin API: Faculty Management
 * POST /api/admin/master-data/faculty.php (Create)
 * PUT /api/admin/master-data/faculty.php (Update) 
 * DELETE /api/admin/master-data/faculty.php (Delete)
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

try {
    if ($method === 'POST') {
        // CREATE
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Log the received input for debugging
        error_log("Faculty POST input: " . print_r($input, true));
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        // Support both faculty_name and faculty_name_th
        $faculty_name = trim($input['faculty_name'] ?? $input['faculty_name_th'] ?? '');
        
        if (empty($faculty_name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faculty name is required']);
            exit;
        }
        
        // Check if faculty name already exists
        $checkStmt = $conn->prepare("SELECT faculty_id FROM faculty WHERE faculty_name = ?");
        $checkStmt->bind_param('s', $faculty_name);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ชื่อคณะนี้มีอยู่แล้วในระบบ']);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO faculty (faculty_name) VALUES (?)");
        $stmt->bind_param('s', $faculty_name);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'เพิ่มคณะเรียบร้อยแล้ว',
                'data' => ['faculty_id' => $conn->insert_id]
            ]);
        } else {
            throw new Exception('Failed to create faculty');
        }
        
    } else if ($method === 'PUT') {
        // UPDATE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $faculty_id = intval($input['faculty_id'] ?? 0);
        // Support both faculty_name and faculty_name_th
        $faculty_name = trim($input['faculty_name'] ?? $input['faculty_name_th'] ?? '');
        
        if ($faculty_id <= 0 || empty($faculty_name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faculty ID and name are required']);
            exit;
        }
        
        // Check if faculty name already exists (excluding current faculty)
        $checkStmt = $conn->prepare("SELECT faculty_id FROM faculty WHERE faculty_name = ? AND faculty_id != ?");
        $checkStmt->bind_param('si', $faculty_name, $faculty_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        
        if ($result->num_rows > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ชื่อคณะนี้มีอยู่แล้วในระบบ']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE faculty SET faculty_name = ? WHERE faculty_id = ?");
        $stmt->bind_param('si', $faculty_name, $faculty_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'แก้ไขข้อมูลคณะเรียบร้อยแล้ว'
            ]);
        } else {
            throw new Exception('Failed to update faculty');
        }
        
    } else if ($method === 'DELETE') {
        // DELETE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $faculty_id = intval($input['faculty_id'] ?? 0);
        
        if ($faculty_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Faculty ID is required']);
            exit;
        }
        
        // Check if faculty is used by departments
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM department WHERE faculty_id = ?");
        $checkStmt->bind_param('i', $faculty_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result()->fetch_assoc();
        
        if ($result['count'] > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ไม่สามารถลบคณะนี้ได้ เนื่องจากมีภาควิชาที่เชื่อมโยงอยู่']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM faculty WHERE faculty_id = ?");
        $stmt->bind_param('i', $faculty_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'ลบคณะเรียบร้อยแล้ว'
            ]);
        } else {
            throw new Exception('Failed to delete faculty');
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