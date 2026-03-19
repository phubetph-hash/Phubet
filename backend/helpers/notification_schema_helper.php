<?php
/**
 * Notification schema and role-safety helpers.
 */

function ensureNotificationRoleSupport($conn) {
    $sql = "SELECT COUNT(*) AS c
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'notifications'
              AND COLUMN_NAME = 'user_role'";
    $res = $conn->query($sql);
    $row = $res ? $res->fetch_assoc() : null;
    $hasUserRole = $row && (int)$row['c'] > 0;

    if (!$hasUserRole) {
        $conn->query("ALTER TABLE notifications ADD COLUMN user_role VARCHAR(20) NULL AFTER user_id");
        $conn->query("ALTER TABLE notifications ADD INDEX idx_user_role (user_role)");
    }

    // Backfill old rows where role can be inferred from action path/type.
    $conn->query("UPDATE notifications
                  SET user_role = CASE
                    WHEN action_url LIKE '/student/%' THEN 'student'
                    WHEN action_url LIKE '/advisor/%' THEN 'advisor'
                    WHEN action_url LIKE '/admin/%' THEN 'admin'
                    WHEN type IN ('request_approved', 'request_rejected') THEN 'student'
                    WHEN type = 'new_request' THEN 'advisor'
                    ELSE user_role
                  END
                  WHERE user_role IS NULL");
}

/**
 * Restrict legacy (NULL role) rows to IDs that are unique across roles.
 */
function roleSafeNotificationWhereClause() {
    return "user_id = ?
            AND (
              user_role = ?
              OR (
                user_role IS NULL
                AND NOT EXISTS (
                  SELECT 1
                  FROM auth_accounts aa
                  WHERE aa.user_id = notifications.user_id
                    AND aa.role <> ?
                )
              )
            )";
}
