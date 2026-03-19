-- Grant permissions
GRANT SELECT, UPDATE ON advisordb.student TO CURRENT_USER;
GRANT SELECT, UPDATE ON advisordb.advisor TO CURRENT_USER;
GRANT SELECT, UPDATE ON advisordb.administrator TO CURRENT_USER;
GRANT SELECT, UPDATE ON advisordb.auth_accounts TO CURRENT_USER;