<?php
// Start session first
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../helpers/notification_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['status'=>'error','message'=>'Method not allowed']); exit; }

$input = json_decode(file_get_contents('php://input'), true);
$student_id = $_SESSION['user_id']; // Get from session instead
$advisor_id = isset($input['advisor_id']) ? intval($input['advisor_id']) : 0;
$academic_term_id = isset($input['academic_term_id']) ? intval($input['academic_term_id']) : 0;
$project_title = isset($input['project_title']) ? trim($input['project_title']) : '';
$project_detail = isset($input['project_detail']) ? trim($input['project_detail']) : '';
$proposal_file = isset($input['proposal_file']) ? trim($input['proposal_file']) : null;

if (!$student_id || $advisor_id<=0 || $academic_term_id<=0 || $project_title==='') {
  http_response_code(400); echo json_encode(['status'=>'error','message'=>'missing required fields']); exit;
}

// Begin transaction
$conn->begin_transaction();
try {
  // Auto-repair legacy data: if a student already has completed projects with an advisor,
  // any older approved rows for the same student/advisor pair are stale and should be completed.
  $stmt = $conn->prepare("UPDATE request r
      JOIN (
        SELECT student_id, advisor_id, MAX(COALESCE(complete_date, CURRENT_DATE)) AS completed_on
        FROM request
        WHERE student_id = ? AND complete_date IS NOT NULL
        GROUP BY student_id, advisor_id
      ) c ON c.student_id = r.student_id AND c.advisor_id = r.advisor_id
      SET r.status = 'เสร็จสิ้น',
          r.complete_date = COALESCE(r.complete_date, c.completed_on)
      WHERE r.student_id = ?
        AND r.status = 'อนุมัติ'
        AND r.complete_date IS NULL");
  $stmt->bind_param('ss', $student_id, $student_id);
  $stmt->execute();

  // CRITICAL: Check if student already has an approved advisor
  $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM request WHERE student_id=? AND status='อนุมัติ' FOR UPDATE");
  $stmt->bind_param('s', $student_id);
  $stmt->execute();
  $approvedCnt = $stmt->get_result()->fetch_assoc()['c'];
  if ($approvedCnt > 0) { throw new Exception('student already has approved advisor'); }

  // Lock pending count for the student
  $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM request WHERE student_id=? AND status='รอดำเนินการ' FOR UPDATE");
  $stmt->bind_param('s', $student_id);
  $stmt->execute();
  $pendingCnt = $stmt->get_result()->fetch_assoc()['c'];
  if ($pendingCnt >= 5) { throw new Exception('pending limit reached'); }

  // Avoid duplicate pending with same advisor
  $stmt = $conn->prepare("SELECT COUNT(*) AS c FROM request WHERE student_id=? AND advisor_id=? AND status='รอดำเนินการ' FOR UPDATE");
  $stmt->bind_param('si', $student_id, $advisor_id);
  $stmt->execute();
  $dupCnt = $stmt->get_result()->fetch_assoc()['c'];
  if ($dupCnt > 0) { throw new Exception('duplicate pending request'); }

  // Capacity check: approved count < project_capacity
  $stmt = $conn->prepare("SELECT a.project_capacity, COALESCE(SUM(r.status='อนุมัติ'),0) AS approved FROM advisor a LEFT JOIN request r ON r.advisor_id=a.advisor_id AND r.status='อนุมัติ' WHERE a.advisor_id=? FOR UPDATE");
  $stmt->bind_param('i', $advisor_id);
  $stmt->execute();
  $row = $stmt->get_result()->fetch_assoc();
  if (!$row) { throw new Exception('advisor not found'); }
  if (intval($row['approved']) >= intval($row['project_capacity'])) { throw new Exception('advisor capacity full'); }

  // Insert request
  $stmt = $conn->prepare("INSERT INTO request (student_id,advisor_id,academic_term_id,submit_date,project_title,project_detail,proposal_file,status,expire_date) VALUES (?,?,?,?,?,?,?, 'รอดำเนินการ', DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY))");
  $today = date('Y-m-d');
  $stmt->bind_param('siissss', $student_id,$advisor_id,$academic_term_id,$today,$project_title,$project_detail,$proposal_file);
  if (!$stmt->execute()) { throw new Exception('insert failed'); }
  $reqId = $conn->insert_id;
  
  // Get student and advisor names for notification
  $stmt = $conn->prepare("SELECT s.first_name as student_fname, s.last_name as student_lname,
                                 a.first_name as advisor_fname, a.last_name as advisor_lname
                          FROM student s, advisor a
                          WHERE s.student_id = ? AND a.advisor_id = ?");
  $stmt->bind_param('si', $student_id, $advisor_id);
  $stmt->execute();
  $names = $stmt->get_result()->fetch_assoc();
  
  if ($names) {
    $student_name = $names['student_fname'] . ' ' . $names['student_lname'];
    
    // Create notification for advisor
    notifyAdvisorNewRequest($advisor_id, $student_name, $reqId, $project_title);
  }

  $conn->commit();
  echo json_encode(['status'=>'ok','data'=>['request_id'=>$reqId]]);
} catch (Exception $e) {
  $conn->rollback();
  http_response_code(400);
  echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
}
?>

