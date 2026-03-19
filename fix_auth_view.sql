-- Drop the existing view
DROP VIEW IF EXISTS `auth_accounts`;

-- Create the auth_accounts view with explicit collation
CREATE VIEW `auth_accounts` AS
SELECT 
    'student' COLLATE utf8mb4_unicode_ci AS role,
    student_id COLLATE utf8mb4_unicode_ci AS user_id,
    email COLLATE utf8mb4_unicode_ci AS email,
    password_hash COLLATE utf8mb4_unicode_ci AS password_hash
FROM student
UNION ALL
SELECT 
    'advisor' COLLATE utf8mb4_unicode_ci AS role,
    CAST(advisor_id AS CHAR(20)) COLLATE utf8mb4_unicode_ci AS user_id,
    email COLLATE utf8mb4_unicode_ci AS email,
    password_hash COLLATE utf8mb4_unicode_ci AS password_hash
FROM advisor
UNION ALL
SELECT 
    'admin' COLLATE utf8mb4_unicode_ci AS role,
    CAST(admin_id AS CHAR(20)) COLLATE utf8mb4_unicode_ci AS user_id,
    email COLLATE utf8mb4_unicode_ci AS email,
    password_hash COLLATE utf8mb4_unicode_ci AS password_hash
FROM administrator;
