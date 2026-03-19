<?php
/**
 * Notification Helper Functions
 * Helper functions to create notifications automatically
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/notification_schema_helper.php';

/**
 * Create a notification
 */
function createNotification($user_id, $type, $title, $message, $action_url = null, $metadata = [], $user_role = null) {
    try {
        $conn = getDbConnection();
    ensureNotificationRoleSupport($conn);
        
        $metadata_json = json_encode($metadata);
        
    $sql = "INSERT INTO notifications (user_id, user_role, type, title, message, action_url, metadata) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssssss', $user_id, $user_role, $type, $title, $message, $action_url, $metadata_json);
        $stmt->execute();
        
        $notification_id = $stmt->insert_id;
        
        $stmt->close();
        $conn->close();
        
        return $notification_id;
        
    } catch (Exception $e) {
        error_log("Error creating notification: " . $e->getMessage());
        return false;
    }
}

/**
 * Notify advisor when new request is created
 */
function notifyAdvisorNewRequest($advisor_id, $student_name, $request_id, $project_title) {
    return createNotification(
        $advisor_id,
        'new_request',
        'มีคำขอใหม่',
        "นิสิต {$student_name} ส่งคำขอโครงงาน \"{$project_title}\" มาให้คุณ",
        '/advisor/requests',
        [
            'studentName' => $student_name,
            'requestId' => $request_id,
            'projectTitle' => $project_title
        ],
        'advisor'
    );
}

/**
 * Notify student when request is approved
 */
function notifyStudentRequestApproved($student_id, $advisor_name, $request_id, $project_title) {
    return createNotification(
        $student_id,
        'request_approved',
        'คำขอได้รับการอนุมัติ',
        "คำขอโครงงาน \"{$project_title}\" ได้รับการอนุมัติจาก {$advisor_name}",
        '/student/requests',
        [
            'advisorName' => $advisor_name,
            'requestId' => $request_id,
            'projectTitle' => $project_title
        ],
        'student'
    );
}

/**
 * Notify student when request is rejected
 */
function notifyStudentRequestRejected($student_id, $advisor_name, $request_id, $project_title, $reason) {
    return createNotification(
        $student_id,
        'request_rejected',
        'คำขอถูกปฏิเสธ',
        "คำขอโครงงาน \"{$project_title}\" ถูกปฏิเสธโดย {$advisor_name}\nเหตุผล: {$reason}",
        '/student/requests',
        [
            'advisorName' => $advisor_name,
            'requestId' => $request_id,
            'projectTitle' => $project_title,
            'reason' => $reason
        ],
        'student'
    );
}

/**
 * Notify student when project is marked complete
 */
function notifyStudentProjectComplete($student_id, $advisor_name, $request_id, $project_title) {
    return createNotification(
        $student_id,
        'project_complete',
        'โครงงานเสร็จสิ้นแล้ว',
        "โครงงาน \"{$project_title}\" ได้รับการยืนยันว่าเสร็จสิ้นแล้ว โดย {$advisor_name}",
        '/student/requests',
        [
            'advisorName' => $advisor_name,
            'requestId' => $request_id,
            'projectTitle' => $project_title
        ],
        'student'
    );
}

/**
 * Notify user when profile is updated
 */
function notifyProfileUpdated($user_id, $role = null) {
    return createNotification(
        $user_id,
        'profile_updated',
        'อัปเดตโปรไฟล์สำเร็จ',
        'ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว',
        '/profile',
        [],
        $role
    );
}

/**
 * Create system-wide notification
 */
function createSystemNotification($type, $title, $message, $action_url = null) {
    try {
        $conn = getDbConnection();
        ensureNotificationRoleSupport($conn);
        
        // Get all active users
        $sql = "SELECT user_id, role FROM auth_accounts WHERE status = 'active'";
        $result = $conn->query($sql);
        
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            if (createNotification($row['user_id'], $type, $title, $message, $action_url, [], $row['role'])) {
                $count++;
            }
        }
        
        $conn->close();
        return $count;
        
    } catch (Exception $e) {
        error_log("Error creating system notification: " . $e->getMessage());
        return 0;
    }
}
