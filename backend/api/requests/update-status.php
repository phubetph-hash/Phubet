<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../connect.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/notification_helper.php';

function resolveAutoCancelStatus($conn) {
  $sql = "SELECT COLUMN_TYPE
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'request'
            AND COLUMN_NAME = 'status'
          LIMIT 1";
  $result = $conn->query($sql);
  $row = $result ? $result->fetch_assoc() : null;
  $columnType = strtolower($row['COLUMN_TYPE'] ?? '');

  return strpos($columnType, "'ยกเลิก'") !== false ? 'ยกเลิก' : 'ปฏิเสธ';
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if (!in_array($_SERVER['REQUEST_METHOD'], ['PATCH', 'PUT'])) { http_response_code(405); echo json_encode(['success'=>false,'message'=>'Method not allowed']); exit; }

// Check authentication
$auth = checkAuth();
if (!$auth['authenticated']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id<=0) { http_response_code(400); echo json_encode(['success'=>false,'message'=>'id is required']); exit; }
$input = json_decode(file_get_contents('php://input'), true);
$status = isset($input['status']) ? trim($input['status']) : '';
$suggestion = isset($input['suggestion']) ? $input['suggestion'] : null;
$rejection_reason = isset($input['rejection_reason']) ? $input['rejection_reason'] : null;

if (!in_array($status, ['อนุมัติ','ปฏิเสธ','ยกเลิก'])) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'invalid status']); exit; }
if ($status==='ปฏิเสธ' && (is_null($rejection_reason) || trim($rejection_reason)==='')) { http_response_code(400); echo json_encode(['status'=>'error','message'=>'rejection_reason required when rejecting']); exit; }

$conn->begin_transaction();
try {
  // Lock target pending request and get related info
  $stmt = $conn->prepare("SELECT r.request_id, r.student_id, r.advisor_id, r.project_title, 
                                 s.first_name as student_fname, s.last_name as student_lname,
                                 a.first_name as advisor_fname, a.last_name as advisor_lname
                          FROM request r
                          LEFT JOIN student s ON r.student_id = s.student_id
                          LEFT JOIN advisor a ON r.advisor_id = a.advisor_id
                          WHERE r.request_id=? AND r.status='รอดำเนินการ' FOR UPDATE");
  $stmt->bind_param('i', $id);
  $stmt->execute();
  $row = $stmt->get_result()->fetch_assoc();
  if (!$row) { throw new Exception('request not pending or not found'); }

  $student_name = $row['student_fname'] . ' ' . $row['student_lname'];
  $advisor_name = $row['advisor_fname'] . ' ' . $row['advisor_lname'];
  $project_title = $row['project_title'];

  if ($status==='อนุมัติ') {
    // Approve this request
    $stmtU = $conn->prepare("UPDATE request SET status='อนุมัติ', approve_date=CURRENT_DATE WHERE request_id=?");
    $stmtU->bind_param('i', $id);
    if (!$stmtU->execute()) { throw new Exception('approve failed'); }
    
    // Create notification for student
    notifyStudentRequestApproved($row['student_id'], $advisor_name, $id, $project_title);

    // Auto-cancel other pending requests for this student.
    $autoCancelStatus = resolveAutoCancelStatus($conn);
    $autoCancelReason = "ระบบยกเลิกอัตโนมัติ: มีอาจารย์ตอบรับคำขอ #{$id} แล้ว";
    $autoCancelSuggestion = "โปรดดำเนินการกับอาจารย์ที่อนุมัติคำขอแล้ว";

    $stmtC = $conn->prepare("UPDATE request
                             SET status=?,
                                 approve_date=CURRENT_DATE,
                                 rejection_reason=?,
                                 suggestion=?
                             WHERE student_id=?
                               AND status='รอดำเนินการ'
                               AND request_id<>?");
    $stmtC->bind_param('ssssi', $autoCancelStatus, $autoCancelReason, $autoCancelSuggestion, $row['student_id'], $id);
    if (!$stmtC->execute()) { throw new Exception('auto cancel other pending requests failed'); }
  } else if ($status === 'ปฏิเสธ') {
    $stmtR = $conn->prepare("UPDATE request SET status='ปฏิเสธ', approve_date=CURRENT_DATE, rejection_reason=?, suggestion=? WHERE request_id=?");
    $stmtR->bind_param('ssi', $rejection_reason, $suggestion, $id);
    if (!$stmtR->execute()) { throw new Exception('reject failed'); }
    
    // Create notification for student
    notifyStudentRequestRejected($row['student_id'], $advisor_name, $id, $project_title, $rejection_reason);
  } else if ($status === 'ยกเลิก') {
    // อนุญาตให้ยกเลิกได้เฉพาะเจ้าของคำขอ
    if ($auth['role'] !== 'student' || $auth['user_id'] !== $row['student_id']) {
      throw new Exception('only request owner can cancel');
    }
    $stmtC = $conn->prepare("UPDATE request SET status='ยกเลิก', approve_date=CURRENT_DATE WHERE request_id=? AND student_id=?");
    $stmtC->bind_param('is', $id, $auth['user_id']);
    if (!$stmtC->execute()) { throw new Exception('cancel failed'); }
  }

  $conn->commit();
  echo json_encode(['success'=>true,'message'=>'Request status updated successfully']);
} catch (Exception $e) {
  $conn->rollback();
  http_response_code(400);
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>

