'use client';

import { useState, useRef } from 'react';
import apiClient from '@/lib/api';
import { useNotifications } from '@/contexts/NotificationContext';

export default function ProfileImageUploader({ currentImage, onImageUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { showToast } = useNotifications();
  const fileInputRef = useRef(null);

  const API_BASE_URL = apiClient.baseURL;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    // Convert relative path to full Backend URL
    return `${API_BASE_URL}${imagePath}`;
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showToast({ message: 'กรุณาเลือกไฟล์รูปภาพ (JPEG, PNG, หรือ GIF เท่านั้น)', type: 'warning' });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast({ message: 'ขนาดไฟล์ต้องไม่เกิน 5MB', type: 'warning' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to server
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    try {
      setIsUploading(true);

      // Upload with 'image' field name to match backend expectation
      const response = await apiClient.uploadFile('/api/profile/upload-image', file, {}, 'image');

      if (response.success) {
        showToast({ message: 'อัปโหลดรูปโปรไฟล์สำเร็จ', type: 'success' });
        setPreviewUrl(getImageUrl(response.data.image_url));
        if (onImageUpdate) {
          onImageUpdate(response.data.image_url);
        }
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast({ message: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: ' + (error.message || 'Unknown error'), type: 'error' });
      // Revert preview
      setPreviewUrl(getImageUrl(currentImage));
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Image Display */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
          {(() => {
            // Use previewUrl if available (during upload preview)
            // Otherwise use currentImage from server
            const displayUrl = previewUrl || getImageUrl(currentImage);
            
            return displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error:', e.target.src);
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-indigo-600">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            );
          })()}
        </div>

        {/* Upload Button Overlay */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'}
        </button>
        <p className="text-xs text-gray-500 text-center">
          รองรับไฟล์ JPEG, PNG, GIF (ไม่เกิน 5MB)
        </p>
      </div>
    </div>
  );
}
