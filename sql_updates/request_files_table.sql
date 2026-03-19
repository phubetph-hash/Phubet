-- Add request_files table for file uploads
CREATE TABLE IF NOT EXISTS request_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    request_id INT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at DATETIME NOT NULL,
    uploaded_by INT NOT NULL,
    deleted_at DATETIME NULL,
    
    FOREIGN KEY (request_id) REFERENCES requests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE,
    
    INDEX idx_request_files_request_id (request_id),
    INDEX idx_request_files_uploaded_by (uploaded_by),
    INDEX idx_request_files_uploaded_at (uploaded_at)
);

-- Add file_description column to allow students to describe their files
ALTER TABLE request_files 
ADD COLUMN file_description TEXT NULL AFTER mime_type;