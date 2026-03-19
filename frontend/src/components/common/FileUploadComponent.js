'use client';

import React, { useState, useCallback, useEffect } from 'react';
import apiClient from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import { 
  FaCloudUploadAlt, 
  FaFile, 
  FaTrashAlt, 
  FaEye, 
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/errorMessages';

const FileUploadComponent = ({ requestId, onFilesChange }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');

  // Load existing files
  const loadFiles = async () => {
    if (!requestId) {
      // No request ID means this is a new request, no existing files to load
      setFiles([]);
      return;
    }
    
    try {
      const response = await apiClient.get(`/api/requests/get-files?request_id=${requestId}`);
      if (response.success) {
        setFiles(response.data || []);
        if (onFilesChange) {
          onFilesChange(response.data || []);
        }
      } else {
        // API returned error, but don't crash - just set empty files
        setFiles([]);
      }
    } catch (error) {
      // Silently handle errors - this could be authentication issues or server errors
      // For new requests or when not logged in, this is expected
      setFiles([]);
      if (onFilesChange) {
        onFilesChange([]);
      }
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading files:', error);
      }
    }
  };

  useEffect(() => {
    loadFiles();
  }, [requestId]);

  // Upload file function
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add request_id only if it exists
    if (requestId) {
      formData.append('request_id', requestId);
    }

    try {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      const csrfToken = await apiClient.getCsrfToken();
      
      // Use apiClient for proper session handling
      const response = await fetch(apiClient.getFullUrl('/api/requests/upload-file.php'), {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // For requests without ID, add file to local state
        const newFile = {
          filename: result.data.filename,
          original_name: result.data.original_name,
          file_size: result.data.file_size,
          mime_type: result.data.mime_type,
          uploaded_at: result.data.uploaded_at
        };
        
        if (requestId) {
          await loadFiles(); // Reload files list from server
        } else {
          // Add to local files state
          const updatedFiles = [...files, newFile];
          setFiles(updatedFiles);
          if (onFilesChange) {
            onFilesChange(updatedFiles);
          }
        }
        
        setError('');
        
        // Clear progress after 2 seconds
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 2000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || ERROR_MESSAGES.FILE_UPLOAD_FAILED);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    }
  };

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setError('');

    try {
      // Upload files one by one
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
    } finally {
      setUploading(false);
    }
  }, [requestId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  // Delete file function
  const deleteFile = async (fileId, fileName) => {
    try {
      if (fileId) {
        // Delete from server (for existing files)
        const response = await apiClient.delete(`/api/requests/delete-file/${fileId}`);
        if (response.success) {
          await loadFiles(); // Reload files list
        }
      } else if (fileName) {
        // Remove from local state (for newly uploaded files)
        const updatedFiles = files.filter(file => file.name !== fileName && file.filename !== fileName);
        setFiles(updatedFiles);
        if (onFilesChange) {
          onFilesChange(updatedFiles);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(ERROR_MESSAGES.FILE_DELETE_FAILED);
    }
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📋';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">เอกสารประกอบ</h3>
        
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400" />
            <div>
              <p className="text-lg text-gray-600">
                {isDragActive ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                รองรับ: PDF, Word, Excel, PowerPoint, รูปภาพ, Text (สูงสุด 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="flex items-center space-x-3">
                <FaSpinner className="animate-spin text-blue-500" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{fileName}</span>
                    <span className="text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <FaTimesCircle className="text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            ไฟล์ที่อัปโหลดแล้ว ({files.length})
          </h4>
          
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={file.file_id || file.filename || `file-${index}`} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getFileIcon(file.mime_type)}
                  </span>
                  <div>
                    <h5 className="font-medium text-gray-900">{file.original_filename}</h5>
                    <p className="text-sm text-gray-500">
                      {file.formatted_size} • อัปโหลดเมื่อ{' '}
                      {new Date(file.uploaded_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {file.file_description && (
                      <p className="text-sm text-gray-600 mt-1">{file.file_description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(`${apiClient.baseURL}/${file.file_path}`, '_blank')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="ดูไฟล์"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => deleteFile(file.file_id, file.filename || file.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="ลบไฟล์"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;