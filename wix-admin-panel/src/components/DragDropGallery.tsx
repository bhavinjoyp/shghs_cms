'use client';

import React, { useState, useCallback } from 'react';
import { MediaItem } from '@/types';
import Button from './ui/Button';
import Modal from './ui/Modal';

interface DragDropGalleryProps {
  images: MediaItem[];
  onImageReorder?: (images: MediaItem[]) => void;
  onImageRemove?: (imageId: string) => void;
  onImageEdit?: (image: MediaItem) => void;
  editable?: boolean;
  className?: string;
}

export default function DragDropGallery({
  images,
  onImageReorder,
  onImageRemove,
  onImageEdit,
  editable = false,
  className = ""
}: DragDropGalleryProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    onImageReorder?.(newImages);
    setDraggedIndex(null);
  }, [draggedIndex, images, onImageReorder]);

  const handleImageClick = useCallback((image: MediaItem) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  }, []);

  const handleRemoveImage = useCallback((e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this image?')) {
      onImageRemove?.(imageId);
    }
  }, [onImageRemove]);

  const handleEditImage = useCallback((e: React.MouseEvent, image: MediaItem) => {
    e.stopPropagation();
    onImageEdit?.(image);
  }, [onImageEdit]);

  if (!images || images.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>No images to display</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className={`
              relative group cursor-pointer rounded-lg overflow-hidden shadow-md transition-all duration-200
              ${editable ? 'hover:shadow-lg' : ''}
              ${draggedIndex === index ? 'opacity-50' : ''}
            `}
            draggable={editable}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleImageClick(image)}
          >
            <div className="aspect-square relative">
              <img
                src={image.src}
                alt={image.alt || image.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {editable && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    {onImageEdit && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => handleEditImage(e, image)}
                        className="bg-white text-gray-800 hover:bg-gray-100"
                      >
                        Edit
                      </Button>
                    )}
                    {onImageRemove && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => handleRemoveImage(e, image.src)}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedImage?.title || 'Image Preview'}
      >
        {selectedImage && (
          <div className="space-y-4">
            <div className="max-h-96 overflow-hidden rounded-lg">
              <img
                src={selectedImage.src}
                alt={selectedImage.alt || selectedImage.title}
                className="w-full h-auto object-contain"
              />
            </div>
            
            {selectedImage.description && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                <p className="text-gray-600">{selectedImage.description}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              {editable && onImageEdit && (
                <Button
                  onClick={() => {
                    onImageEdit(selectedImage);
                    setIsModalOpen(false);
                  }}
                >
                  Edit Image
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}