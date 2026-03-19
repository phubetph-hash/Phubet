<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$student_id   = isset($input['student_id']) ? trim($input['student_id']) : '';
$prefix       = isset($input['prefix']) ? trim($input['prefix']) : '';
$first_name   = isset($input['first_name']) ? trim($input['first_name']) : '';
$last_name    = isset($input['last_name']) ? trim($input['last_name']) : '';
$email        = isset($input['email']) ? trim($input['email']) : '';
$password     = isset($input['password']) ? $input['password'] : '';
$faculty_id   = isset($input['faculty_id']) ? intval($input['faculty_id']) : 0;
$department_id= isset($input['department_id']) ? intval($input['department_id']) : 0;
$program_id   = isset($input['program_id']) ? intval($input['program_id']) : 0;
$image        = isset($input['image']) ? trim($input['image']) : null;

if ($student_id === '' || $prefix === '' || $first_name === '' || $last_name === '' || $email === '' || $password === '' || $faculty_id<=0 || $department_id<=0 || $program_id<=0) {
  http_response_code(400);
  echo json_encode(['status'=>'error','message'=>'missing required fields']);
  exit;
}

// Duplicate email check across all roles
$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM auth_accounts WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$c = $stmt->get_result()->fetch_assoc()['c'];
if ($c > 0) { http_response_code(409); echo json_encode(['status'=>'error','message'=>'email already exists']); exit; }

// Hash password with SHA2-256 using DB
$hashStmt = $conn->prepare("SELECT SHA2(?,256) AS h");
$hashStmt->bind_param('s', $password);
$hashStmt->execute();
$hash = $hashStmt->get_result()->fetch_assoc()['h'];

// Start transaction
$conn->begin_transaction();

try {
    // Insert into student table
    $stmtIns = $conn->prepare("INSERT INTO student (student_id,prefix,first_name,last_name,image,email,password,faculty_id,department_id,program_id) VALUES (?,?,?,?,?,?,?,?,?,?)");
    $stmtIns->bind_param('sssssssiii', $student_id,$prefix,$first_name,$last_name,$image,$email,$hash,$faculty_id,$department_id,$program_id);
    if (!$stmtIns->execute()) {
        throw new Exception($stmtIns->error);
    }
    
    // No need to insert into auth_accounts - it's a VIEW that automatically includes student data
    
    $conn->commit();
    echo json_encode(['status'=>'ok','data'=>['student_id'=>$student_id,'email'=>$email]]);
    
} catch (Exception $e) {
    $conn->rollback();
    error_log("Student create error: " . $e->getMessage());
    error_log("Student create trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>'failed to create student','error'=>$e->getMessage(),'trace'=>$e->getTraceAsString()]);
    exit;
}
?>

