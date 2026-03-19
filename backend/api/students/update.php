<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Method not allowed']); exit; }

// Check authentication
$auth = checkAuth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'message' => 'กรุณาล็อกอินใหม่อีกครั้ง',
        'code' => 'AUTH_REQUIRED'
    ]);
    exit;
}

// Only allow students to update their own data or admins
if ($auth['role'] !== 'admin') {
    $id = $auth['user_id'];
} else {
    $id = isset($_GET['id']) ? trim($_GET['id']) : $auth['user_id'];
}

if ($id === '') { 
    http_response_code(400); 
    echo json_encode(['success'=>false,'message'=>'Student ID is required']); 
    exit; 
}

$input = json_decode(file_get_contents('php://input'), true);
$prefix       = isset($input['prefix']) ? trim($input['prefix']) : null;
$first_name   = isset($input['first_name']) ? trim($input['first_name']) : null;
$last_name    = isset($input['last_name']) ? trim($input['last_name']) : null;
$faculty_id   = isset($input['faculty_id']) ? intval($input['faculty_id']) : null;
$department_id = isset($input['department_id']) ? intval($input['department_id']) : null;
$program_id   = isset($input['program_id']) ? intval($input['program_id']) : null;
$image        = isset($input['image']) ? trim($input['image']) : null;
$password     = array_key_exists('password',$input) ? $input['password'] : null;

$fields = [];
$params = [];
$types = '';
if (!is_null($prefix)) { $fields[]='prefix=?'; $params[]=$prefix; $types.='s'; }
if (!is_null($first_name)) { $fields[]='first_name=?'; $params[]=$first_name; $types.='s'; }
if (!is_null($last_name)) { $fields[]='last_name=?'; $params[]=$last_name; $types.='s'; }
if (!is_null($faculty_id) && $faculty_id > 0) { $fields[]='faculty_id=?'; $params[]=$faculty_id; $types.='i'; }
if (!is_null($department_id) && $department_id > 0) { $fields[]='department_id=?'; $params[]=$department_id; $types.='i'; }
if (!is_null($program_id) && $program_id > 0) { $fields[]='program_id=?'; $params[]=$program_id; $types.='i'; }
if (!is_null($image)) { $fields[]='image=?'; $params[]=$image; $types.='s'; }
if (!is_null($password) && $password!=='') {
  // hash via DB
  $hashStmt = $conn->prepare("SELECT SHA2(?,256) AS h");
  $hashStmt->bind_param('s', $password);
  $hashStmt->execute();
  $hash = $hashStmt->get_result()->fetch_assoc()['h'];
  $fields[]='password=?'; $params[]=$hash; $types.='s';
}

if (empty($fields)) { 
    echo json_encode(['success'=>true,'data'=>['student_id'=>$id],'message'=>'No changes to update']); 
    exit; 
}

$params[]=$id; $types.='s';
$sql = 'UPDATE student SET '.implode(',', $fields).' WHERE student_id=?';
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);

if (!$stmt->execute()) { 
    http_response_code(500); 
    echo json_encode(['success'=>false,'message'=>'Update failed','error'=>$stmt->error]); 
    exit; 
}

echo json_encode(['success'=>true,'data'=>['student_id'=>$id],'message'=>'Profile updated successfully']);
?>

