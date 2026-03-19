<?php
/**
 * Admin API: Update User
 * PUT /api/admin/users/update.php
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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

$user_id = $input['user_id'] ?? '';
$first_name = $input['first_name'] ?? '';
$last_name = $input['last_name'] ?? '';
$phone = $input['phone'] ?? '';
$role = $input['role'] ?? '';

if (empty($user_id) || empty($first_name) || empty($last_name) || empty($role)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Required fields missing']);
    exit;
}

try {
    $conn->begin_transaction();
    
    $updated = false;
    
    // Update based on role
    if ($role === 'administrator') {
        $updateQuery = "
            UPDATE administrator 
            SET first_name = ?, last_name = ?, updated_at = NOW()
            WHERE admin_id = ?
        ";
        
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('ssi', $first_name, $last_name, $user_id);
        $stmt->execute();
        $updated = $stmt->affected_rows > 0;
        
    } elseif ($role === 'student') {
        // Build dynamic update query for student
        $updateFields = ['first_name = ?', 'last_name = ?'];
        $params = [$first_name, $last_name];
        $paramTypes = 'ss';
        
        // Only update faculty/department/program if they are provided and not null
        if (isset($input['faculty_id']) && !empty($input['faculty_id'])) {
            $updateFields[] = 'faculty_id = ?';
            $params[] = $input['faculty_id'];
            $paramTypes .= 'i';
        }
        
        if (isset($input['department_id']) && !empty($input['department_id'])) {
            $updateFields[] = 'department_id = ?';
            $params[] = $input['department_id'];
            $paramTypes .= 'i';
        }
        
        if (isset($input['program_id']) && !empty($input['program_id'])) {
            $updateFields[] = 'program_id = ?';
            $params[] = $input['program_id'];
            $paramTypes .= 'i';
        }
        
        $updateFields[] = 'updated_at = NOW()';
        
        $updateQuery = "
            UPDATE student 
            SET " . implode(', ', $updateFields) . "
            WHERE student_id = ?
        ";
        
        $params[] = $user_id;
        $paramTypes .= 's';
        
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param($paramTypes, ...$params);
        $stmt->execute();
        $updated = $stmt->affected_rows > 0;
        
    } elseif ($role === 'advisor') {
        $academic_rank_id = $input['academic_rank_id'] ?? null;
        $academic_degree_id = $input['academic_degree_id'] ?? null;
        $project_capacity = $input['project_capacity'] ?? null;
        $faculty_id = $input['faculty_id'] ?? null;
        $department_id = $input['department_id'] ?? null;
        
        $updateQuery = "
            UPDATE advisor 
            SET first_name = ?, last_name = ?, phone = ?,
                academic_rank_id = ?, academic_degree_id = ?, project_capacity = ?, 
                faculty_id = ?, department_id = ?, updated_at = NOW()
            WHERE advisor_id = ?
        ";
        
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param('sssiiiiiii', $first_name, $last_name, $phone,
                         $academic_rank_id, $academic_degree_id, $project_capacity, 
                         $faculty_id, $department_id, $user_id);
        $stmt->execute();
        $updated = $stmt->affected_rows > 0;
        
        // Update expertise if provided
        if (isset($input['expertise_ids']) && is_array($input['expertise_ids'])) {
            // Delete existing expertise
            $deleteQuery = "DELETE FROM advisor_expertise WHERE advisor_id = ?";
            $stmt = $conn->prepare($deleteQuery);
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            
            // Insert new expertise
            if (!empty($input['expertise_ids'])) {
                $insertQuery = "INSERT INTO advisor_expertise (advisor_id, expertise_id) VALUES (?, ?)";
                $stmt = $conn->prepare($insertQuery);
                
                foreach ($input['expertise_ids'] as $expertise_id) {
                    $stmt->bind_param('ii', $user_id, $expertise_id);
                    $stmt->execute();
                }
            }
        }
    }
    
    if (!$updated) {
        throw new Exception('User not found or no changes made');
    }

    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'User updated successfully'
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
