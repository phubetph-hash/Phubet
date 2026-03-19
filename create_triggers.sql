DELIMITER //

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_student_password//
DROP TRIGGER IF EXISTS update_advisor_password//
DROP TRIGGER IF EXISTS update_admin_password//

-- Create trigger for student_accounts
CREATE TRIGGER update_student_password
BEFORE UPDATE ON student_accounts
FOR EACH ROW
BEGIN
    UPDATE student SET password_hash = NEW.password_hash WHERE student_id = NEW.user_id;
END//

-- Create trigger for advisor_accounts
CREATE TRIGGER update_advisor_password
BEFORE UPDATE ON advisor_accounts
FOR EACH ROW
BEGIN
    UPDATE advisor SET password_hash = NEW.password_hash WHERE advisor_id = CAST(NEW.user_id AS UNSIGNED);
END//

-- Create trigger for admin_accounts
CREATE TRIGGER update_admin_password
BEFORE UPDATE ON admin_accounts
FOR EACH ROW
BEGIN
    UPDATE administrator SET password_hash = NEW.password_hash WHERE admin_id = CAST(NEW.user_id AS UNSIGNED);
END//

DELIMITER ;