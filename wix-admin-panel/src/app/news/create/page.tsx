'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Loader2 } from 'lucide-react';
import { MediaItem } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ImageUpload from '@/components/ImageUpload';
import ThumbnailUpload from '@/components/ThumbnailUpload';
import DragDropGallery from '@/components/DragDropGallery';

export default function CreateNewsPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtube_link: '',
        publish: false,
        nursery: false
    });
    const [uploadedImages, setUploadedImages] = useState<MediaItem[]>([]);
    const [thumbnail, setThumbnail] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageUploaded = (imageData: any) => {
        const newImage: MediaItem = {
            src: imageData.src,
            title: imageData.title,
            alt: imageData.alt,
            type: 'image'
        };
        setUploadedImages(prev => [...prev, newImage]);
    };

    const handleImageReorder = (reorderedImages: MediaItem[]) => {
        setUploadedImages(reorderedImages);
    };

    const handleImageRemove = (imageId: string) => {
        setUploadedImages(prev => prev.filter(img => img.src !== imageId));
    };

    const handleThumbnailUploaded = (thumbnailData: any) => {
        setThumbnail(thumbnailData.url);
    };

    const handleImageEdit = (image: MediaItem) => {
        const newTitle = prompt('Enter new title for image:', image.title);
        const newDescription = prompt('Enter description for image:', image.description || '');
        
        if (newTitle !== null) {
            setUploadedImages(prev => 
                prev.map(img => 
                    img.src === image.src 
                        ? { ...img, title: newTitle, description: newDescription || undefined }
                        : img
                )
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) { setError('Title is required'); return; }
        if (!formData.description.trim()) { setError('Description is required'); return; }
        if (!thumbnail) { setError('A thumbnail is required'); return; }

        setIsSubmitting(true);
        setError(null);

        try {
            const newsData = {
                title: formData.title,
                description: formData.description,
                newsIndividual: formData.title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''),
                youtube_link: formData.youtube_link || undefined,
                images_videos: uploadedImages,
                thumbnail: thumbnail,
                publish: formData.publish,
                nursery: formData.nursery
            };

            const response = await fetch('/api/news', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newsData),
            });

            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to create news article');
            }

            setSuccess(true);
            setTimeout(() => {
                window.location.href = '/news';
            }, 2000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create news article');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUploadError = (error: string) => {
        setError(error);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">News Article Created!</h2>
                    <p className="text-gray-600 mb-6">Redirecting you back to the news page...</p>
                    <Link
                        href="/news"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Back to News
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-800">Create News Article</h1>
                        <Link 
                            href="/news"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to News
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-4xl py-10 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Article Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">Title *</label>
                                    <Input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} placeholder="Enter news article title" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Description *</label>
                                    <textarea id="description" name="description" rows={6} value={formData.description} onChange={handleInputChange} placeholder="Enter article content and description" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label htmlFor="youtube_link" className="block text-sm font-medium text-gray-600 mb-1">YouTube Link (optional)</label>
                                    <Input id="youtube_link" name="youtube_link" type="url" value={formData.youtube_link} onChange={handleInputChange} placeholder="https://youtube.com/watch?v=..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                                </div>
                                <div className="flex items-center space-x-6 pt-2">
                                    <div className="flex items-center">
                                        <input id="publish" name="publish" type="checkbox" checked={formData.publish} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                        <label htmlFor="publish" className="ml-2 block text-sm text-gray-700">Publish immediately</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="nursery" name="nursery" type="checkbox" checked={formData.nursery} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                        <label htmlFor="nursery" className="ml-2 block text-sm text-gray-700">Nursery category</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Article Thumbnail *</h2>
                        <ThumbnailUpload onThumbnailUploaded={handleThumbnailUploaded} onError={handleUploadError} title={formData.title || 'news-article'} mediaType="news" />
                        {thumbnail && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Current Thumbnail</h3>
                                <div className="w-40 h-40 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={thumbnail} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Article Images (optional)</h2>
                        {uploadedImages.length < 15 ? (
                            <ImageUpload onImageUploaded={handleImageUploaded} onError={handleUploadError} multiple={true} maxFiles={15 - uploadedImages.length} title={formData.title || 'news-article'} mediaType="news" />
                        ) : (
                            <p className="text-sm text-red-600">Maximum of 15 images reached.</p>
                        )}
                        {uploadedImages.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4">Uploaded Images ({uploadedImages.length})</h3>
                                <DragDropGallery images={uploadedImages} onImageReorder={handleImageReorder} onImageRemove={handleImageRemove} onImageEdit={handleImageEdit} editable={true} />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-4 pt-4">
                        <Link href="/news" className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">Cancel</Link>
                        <Button type="submit" disabled={isSubmitting || !thumbnail} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? (
                                <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Creating...</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Create Article</>
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}