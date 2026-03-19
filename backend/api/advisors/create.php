<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$prefix       = isset($input['prefix']) ? trim($input['prefix']) : '';
$first_name   = isset($input['first_name']) ? trim($input['first_name']) : '';
$last_name    = isset($input['last_name']) ? trim($input['last_name']) : '';
$email        = isset($input['email']) ? trim($input['email']) : '';
$password     = isset($input['password']) ? $input['password'] : '';
$phone        = isset($input['phone']) ? trim($input['phone']) : null;
$image        = isset($input['image']) ? trim($input['image']) : null;
$academic_rank_id   = isset($input['academic_rank_id']) ? intval($input['academic_rank_id']) : 0;
$academic_degree_id = isset($input['academic_degree_id']) && intval($input['academic_degree_id']) > 0 ? intval($input['academic_degree_id']) : 1;
$faculty_id   = isset($input['faculty_id']) ? intval($input['faculty_id']) : 0;
$department_id= isset($input['department_id']) ? intval($input['department_id']) : 0;
$program_id   = isset($input['program_id']) ? intval($input['program_id']) : 0;
$project_capacity = isset($input['project_capacity']) ? intval($input['project_capacity']) : 0;
$interests    = isset($input['interests']) ? $input['interests'] : null;
$expertise_ids= isset($input['expertise_ids']) && is_array($input['expertise_ids']) ? $input['expertise_ids'] : [];

if ($prefix===''||$first_name===''||$last_name===''||$email===''||$password===''||$academic_rank_id<=0||$faculty_id<=0||$department_id<=0) {
  http_response_code(400); echo json_encode(['status'=>'error','message'=>'missing required fields']); exit;
}

// check duplicate email across roles
$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM auth_accounts WHERE email=?");
$stmt->bind_param('s', $email);
$stmt->execute();
if ($stmt->get_result()->fetch_assoc()['c']>0) { http_response_code(409); echo json_encode(['status'=>'error','message'=>'email already exists']); exit; }

// hash password
$hashStmt = $conn->prepare("SELECT SHA2(?,256) AS h");
$hashStmt->bind_param('s', $password);
$hashStmt->execute();
$hash = $hashStmt->get_result()->fetch_assoc()['h'];

// Start transaction
$conn->begin_transaction();

try {
    // insert advisor
    $ins = $conn->prepare("INSERT INTO advisor(prefix,first_name,last_name,image,academic_rank_id,academic_degree_id,phone,email,password,project_capacity,faculty_id,department_id,program_id,interests) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
    $ins->bind_param('ssssiiissiiiis', $prefix,$first_name,$last_name,$image,$academic_rank_id,$academic_degree_id,$phone,$email,$hash,$project_capacity,$faculty_id,$department_id,$program_id,$interests);
    if (!$ins->execute()) {
        throw new Exception($ins->error);
    }
    $advisor_id = $conn->insert_id;
    
    // No need to insert into auth_accounts - it's a VIEW that automatically includes advisor data

    // advisor_expertise (many-to-many)
    if (!empty($expertise_ids)) {
        $stmtJ = $conn->prepare("INSERT INTO advisor_expertise(advisor_id,expertise_id) VALUES (?,?)");
        foreach ($expertise_ids as $eid) {
            $eid = intval($eid);
            if ($eid>0) { 
                $stmtJ->bind_param('ii', $advisor_id, $eid); 
                if (!$stmtJ->execute()) {
                    throw new Exception($stmtJ->error);
                }
            }
        }
    }
    
    $conn->commit();
    echo json_encode(['status'=>'ok','data'=>['advisor_id'=>$advisor_id,'email'=>$email]]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>'failed to create advisor','error'=>$e->getMessage()]);
    exit;
}
?>

