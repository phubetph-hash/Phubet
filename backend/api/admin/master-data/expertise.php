<?php
/**
 * Admin API: Expertise Management
 * POST /api/admin/master-data/expertise.php (Create)
 * PUT /api/admin/master-data/expertise.php (Update) 
 * DELETE /api/admin/master-data/expertise.php (Delete)
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
        
        // Support multiple field names
        $expertise_name = trim($input['expertise_name'] ?? $input['expertise_name_th'] ?? '');
        
        if (empty($expertise_name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Expertise name is required']);
            exit;
        }
        
        $stmt = $conn->prepare("INSERT INTO expertise (expertise_name) VALUES (?)");
        $stmt->bind_param('s', $expertise_name);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Expertise created successfully',
                'data' => ['expertise_id' => $conn->insert_id]
            ]);
        } else {
            throw new Exception('Failed to create expertise');
        }
        
    } else if ($method === 'PUT') {
        // UPDATE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $expertise_id = intval($input['expertise_id'] ?? 0);
        // Support multiple field names
        $expertise_name = trim($input['expertise_name'] ?? $input['expertise_name_th'] ?? '');
        
        if ($expertise_id <= 0 || empty($expertise_name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Expertise ID and name are required']);
            exit;
        }
        
        $stmt = $conn->prepare("UPDATE expertise SET expertise_name = ? WHERE expertise_id = ?");
        $stmt->bind_param('si', $expertise_name, $expertise_id);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Expertise updated successfully'
            ]);
        } else {
            throw new Exception('Failed to update expertise');
        }
        
    } else if ($method === 'DELETE') {
        // DELETE
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
            exit;
        }
        
        $expertise_id = intval($input['expertise_id'] ?? 0);
        
        if ($expertise_id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Expertise ID is required']);
            exit;
        }
        
        $conn->begin_transaction();

        // Cascade delete advisor_expertise assignments first
        $delAdvisorExpertise = $conn->prepare("DELETE FROM advisor_expertise WHERE expertise_id = ?");
        $delAdvisorExpertise->bind_param('i', $expertise_id);
        $delAdvisorExpertise->execute();

        $stmt = $conn->prepare("DELETE FROM expertise WHERE expertise_id = ?");
        $stmt->bind_param('i', $expertise_id);

        if ($stmt->execute()) {
            $conn->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Expertise deleted successfully'
            ]);
        } else {
            $conn->rollback();
            throw new Exception('Failed to delete expertise');
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