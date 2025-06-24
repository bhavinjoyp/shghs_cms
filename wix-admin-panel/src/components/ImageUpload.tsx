'use client';

import React, { useState, useRef, useCallback } from 'react';
import Button from './ui/Button';

interface UploadedImage {
  src: string;
  title: string;
  alt: string;
  type: 'image';
}

interface ImageUploadProps {
  onImageUploaded: (image: UploadedImage) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  title?: string;
  mediaType?: 'gallery' | 'news';
}

export default function ImageUpload({ 
  onImageUploaded, 
  onError, 
  multiple = false, 
  maxFiles = 10,
  className = "",
  title = "untitled",
  mediaType = "gallery"
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleFiles = useCallback(async (files: FileList) => {
    const filesToUpload = Array.from(files).slice(0, maxFiles);
    if (filesToUpload.length === 0) return;
    setOverallProgress(0);
    const step = 100 / filesToUpload.length;
    for (const file of filesToUpload) {
      await uploadSingleFile(file);
      setOverallProgress(prev => Math.min(prev + step, 100));
    }
   }, [maxFiles]);

   const uploadSingleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
       onError?.('Please select only image files');
       return;
     }

     const fileId = `${file.name}-${Date.now()}`;
    setIsUploading(true);

     try {
       const formData = new FormData();
       formData.append('file', file);
       formData.append('title', title);
       formData.append('mediaType', mediaType);

       const uploadUrl = `${window.location.origin}/api/upload`;
       const response = await fetch(uploadUrl, {
         method: 'POST',
         body: formData,
       });
       if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
       }

       const result = await response.json();

       if (!result.success) {
         throw new Error(result.error || 'Upload failed');
       }

      onImageUploaded(result.data);
     } catch (error) {
       onError?.(error instanceof Error ? error.message : 'Upload failed');
     } finally {
      setIsUploading(false);
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
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
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
              {isDragging ? 'Drop images here' : 'Drag and drop images here'}
            </p>
            <p className="text-sm">or click to select files</p>
            {multiple && (
              <p className="text-xs text-gray-500">
                You can upload up to {maxFiles} images
              </p>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Uploading...</span>
            <span className="text-gray-600">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {!multiple && (
        <Button
          onClick={openFileDialog}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Choose Image'}
        </Button>
      )}
    </div>
  );
}