-- Create stored procedures for updating passwords
DELIMITER //

DROP PROCEDURE IF EXISTS update_user_password//
CREATE PROCEDURE update_user_password(
    IN p_role VARCHAR(10),
    IN p_user_id VARCHAR(20),
    IN p_password_hash VARCHAR(255)
)
BEGIN
    IF p_role = 'student' THEN
        UPDATE student SET password_hash = p_password_hash WHERE student_id = p_user_id;
    ELSEIF p_role = 'advisor' THEN
        UPDATE advisor SET password_hash = p_password_hash WHERE advisor_id = CAST(p_user_id AS UNSIGNED);
    ELSEIF p_role = 'admin' THEN
        UPDATE administrator SET password_hash = p_password_hash WHERE admin_id = CAST(p_user_id AS UNSIGNED);
    END IF;
END//

DELIMITER ;