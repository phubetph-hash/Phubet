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
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

// Get advisor ID from parameter or session (for own profile)
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    // If no ID provided and user is an advisor, use their own ID
    if ($auth['role'] === 'advisor') {
        $id = $auth['user_id'];
    } else {
        http_response_code(400); 
        echo json_encode(['success' => false, 'message' => 'id is required']); 
        exit; 
    }
}

$input = json_decode(file_get_contents('php://input'), true);
$prefix       = isset($input['prefix']) ? trim($input['prefix']) : null;
$first_name   = isset($input['first_name']) ? trim($input['first_name']) : null;
$last_name    = isset($input['last_name']) ? trim($input['last_name']) : null;
$image        = isset($input['image']) ? trim($input['image']) : null;
$phone        = isset($input['phone']) ? trim($input['phone']) : null;
$academic_rank_id   = isset($input['academic_rank_id']) ? intval($input['academic_rank_id']) : null;
$academic_degree_id = isset($input['academic_degree_id']) ? intval($input['academic_degree_id']) : null;
$faculty_id   = isset($input['faculty_id']) ? intval($input['faculty_id']) : null;
$department_id= isset($input['department_id']) ? intval($input['department_id']) : null;
$program_id   = isset($input['program_id']) ? intval($input['program_id']) : null;
$project_capacity = isset($input['capacity']) ? intval($input['capacity']) : (isset($input['project_capacity']) ? intval($input['project_capacity']) : null);
$interests    = array_key_exists('interests',$input) ? $input['interests'] : null;
$password     = array_key_exists('password',$input) ? $input['password'] : null;
$expertise_ids= isset($input['expertise_ids']) && is_array($input['expertise_ids']) ? $input['expertise_ids'] : null;

$fields=[]; $params=[]; $types='';
if(!is_null($prefix)){ $fields[]='prefix=?'; $params[]=$prefix; $types.='s'; }
if(!is_null($first_name)){ $fields[]='first_name=?'; $params[]=$first_name; $types.='s'; }
if(!is_null($last_name)){ $fields[]='last_name=?'; $params[]=$last_name; $types.='s'; }
if(!is_null($image)){ $fields[]='image=?'; $params[]=$image; $types.='s'; }
if(!is_null($phone)){ $fields[]='phone=?'; $params[]=$phone; $types.='s'; }
if(!is_null($academic_rank_id)){ $fields[]='academic_rank_id=?'; $params[]=$academic_rank_id; $types.='i'; }
if(!is_null($academic_degree_id)){ $fields[]='academic_degree_id=?'; $params[]=$academic_degree_id; $types.='i'; }
if(!is_null($faculty_id)){ $fields[]='faculty_id=?'; $params[]=$faculty_id; $types.='i'; }
if(!is_null($department_id)){ $fields[]='department_id=?'; $params[]=$department_id; $types.='i'; }
if(!is_null($program_id)){ $fields[]='program_id=?'; $params[]=$program_id; $types.='i'; }
if(!is_null($project_capacity)){ $fields[]='project_capacity=?'; $params[]=$project_capacity; $types.='i'; }
if(!is_null($interests)){ $fields[]='interests=?'; $params[]=$interests; $types.='s'; }
if(!is_null($password) && $password!==''){
  $hashStmt=$conn->prepare("SELECT SHA2(?,256) AS h");
  $hashStmt->bind_param('s',$password);
  $hashStmt->execute();
  $hash=$hashStmt->get_result()->fetch_assoc()['h'];
  $fields[]='password=?'; $params[]=$hash; $types.='s';
}

if(!empty($fields)){
  $params[]=$id; $types.='i';
  $sql='UPDATE advisor SET '.implode(',', $fields).' WHERE advisor_id=?';
  $stmt=$conn->prepare($sql);
  $stmt->bind_param($types, ...$params);
  if(!$stmt->execute()){ http_response_code(500); echo json_encode(['success'=>false,'message'=>'update failed','error'=>$stmt->error]); exit; }
}

// update expertise mapping if provided
if(!is_null($expertise_ids)){
  $conn->query("DELETE FROM advisor_expertise WHERE advisor_id=".$id);
  $stmtJ=$conn->prepare("INSERT INTO advisor_expertise(advisor_id,expertise_id) VALUES (?,?)");
  foreach($expertise_ids as $eid){ $eid=intval($eid); if($eid>0){ $stmtJ->bind_param('ii',$id,$eid); $stmtJ->execute(); }}
}

echo json_encode(['success'=>true,'data'=>['advisor_id'=>$id],'message'=>'Profile updated successfully']);
?>

