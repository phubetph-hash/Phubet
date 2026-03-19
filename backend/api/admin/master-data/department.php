<?php
/**
 * Admin API: Department Management
 * POST /api/admin/master-data/department.php (Create)
 * PUT /api/admin/master-data/department.php (Update) 
 * DELETE /api/admin/master-data/department.php (Delete)
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
        
        // Support both department_name and department_name_th
        $department_name = trim($input['department_name'] ?? $input['department_name_th'] ?? '');
        $faculty_id = intval($input['faculty_id'] ?? 0);
        
        if (empty($department_name) || $faculty_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Department name and faculty ID are required']);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO department (department_name, faculty_id) VALUES (?, ?)");
        $stmt->bind_param('si', $department_name, $faculty_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Department created successfully',
                'data' => ['department_id' => $conn->insert_id]
            ]);
        } else {
            throw new Exception('Failed to create department');
        }
        
    } else if ($method === 'PUT') {
        // UPDATE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $department_id = intval($input['department_id'] ?? 0);
        // Support both department_name and department_name_th
        $department_name = trim($input['department_name'] ?? $input['department_name_th'] ?? '');
        $faculty_id = intval($input['faculty_id'] ?? 0);
        
        if ($department_id <= 0 || empty($department_name) || $faculty_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Department ID, name and faculty ID are required']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE department SET department_name = ?, faculty_id = ? WHERE department_id = ?");
        $stmt->bind_param('sii', $department_name, $faculty_id, $department_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Department updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update department');
        }
        
    } else if ($method === 'DELETE') {
        // DELETE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $department_id = intval($input['department_id'] ?? 0);
        
        if ($department_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Department ID is required']);
            exit;
        }
        
        // Delete programs in this department first
        $conn->begin_transaction();

        // Delete programs belonging to this department
        $delPrograms = $conn->prepare("DELETE FROM program WHERE department_id = ?");
        $delPrograms->bind_param('i', $department_id);
        $delPrograms->execute();

        // Check if department is used by students/advisors
        $checkStmt = $conn->prepare("SELECT COUNT(*) as count FROM student WHERE department_id = ?");
        $checkStmt->bind_param('i', $department_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result()->fetch_assoc();
        
        if ($result['count'] > 0) {
            $conn->rollback();
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Cannot delete department that has students']);
            exit;
        }
        
        $stmt = $conn->prepare("DELETE FROM department WHERE department_id = ?");
        $stmt->bind_param('i', $department_id);
        
        if ($stmt->execute()) {
            $conn->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
        } else {
            $conn->rollback();
            throw new Exception('Failed to delete department');
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