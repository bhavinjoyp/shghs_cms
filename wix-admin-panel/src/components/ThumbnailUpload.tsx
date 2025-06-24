'use client';

import React, { useState, useRef, useCallback } from 'react';
import Button from './ui/Button';

interface UploadedThumbnail {
  id: string;
  url: string;
  filename: string;
  path?: string;
  thumbnail?: string;
}

interface ThumbnailUploadProps {
  onThumbnailUploaded: (thumbnail: UploadedThumbnail) => void;
  onError?: (error: string) => void;
  className?: string;
  title?: string;
  mediaType?: 'gallery' | 'news';
  currentThumbnail?: string;
}

export default function ThumbnailUpload({ 
  onThumbnailUploaded, 
  onError,
  className = "",
  title = "untitled",
  mediaType = "gallery",
  currentThumbnail
}: ThumbnailUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please select only image files for thumbnail');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('mediaType', mediaType);

      const response = await fetch('/api/upload/thumbnail', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(100);
      onThumbnailUploaded(result.data);
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [title, mediaType]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  }, [title, mediaType]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors relative
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {currentThumbnail ? (
          <div className="space-y-3">
            <div className="w-32 h-32 mx-auto rounded-lg overflow-hidden">
              <img
                src={currentThumbnail}
                alt="Current thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Current Thumbnail</p>
              <p className="text-xs text-gray-500">
                {isDragging ? 'Drop new thumbnail here' : 'Click or drag to replace'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              <p className="text-lg font-medium">
                {isDragging ? 'Drop thumbnail here' : 'Upload Thumbnail'}
              </p>
              <p className="text-sm">Drag and drop or click to select</p>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 300x300px or larger, max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Uploading thumbnail...</span>
            <span className="text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={openFileDialog}
        disabled={isUploading}
        variant="secondary"
        className="w-full"
      >
        {isUploading ? 'Uploading...' : currentThumbnail ? 'Change Thumbnail' : 'Choose Thumbnail'}
      </Button>
    </div>
  );
}
