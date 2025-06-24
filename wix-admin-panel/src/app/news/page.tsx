'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { NewsItem } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function NewsPage() {
    const router = useRouter();
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    useEffect(() => {
        fetchNewsItems();
    }, []);

    const fetchNewsItems = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/news');
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch news items');
            }
            setNewsItems(result.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch news items');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedItem) return;
        try {
            const response = await fetch(`/api/news/${selectedItem.id}`, { method: 'DELETE' });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to delete news item');
            }
            setNewsItems(prev => prev.filter(item => item.id !== selectedItem.id));
            setIsDeleteOpen(false);
            setSelectedItem(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete news item');
        }
    };

    const handlePreviewItem = (item: NewsItem) => {
        setSelectedItem(item);
        setIsPreviewOpen(true);
    };

    const handleEditItem = (item: NewsItem) => {
        router.push(`/news/${item.id}/edit`);
    };

    const confirmDelete = (item: NewsItem) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    <p className="text-gray-700 text-lg">Loading news...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-6 h-6" />
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
                        </div>
                        <Link
                            href="/news/create"
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create News
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {newsItems.length === 0 && !loading ? (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No News Items Yet</h3>
                        <p className="text-gray-600 mt-2 mb-4">Get started by creating your first news article.</p>
                        <Link
                            href="/news/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Article
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {newsItems.map((item) => (
                            <div key={item.id} className="group relative bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                                <div className="relative w-full h-48">
                                    <img
                                        src={item.thumbnail || '/placeholder-image.png'}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-800 truncate" title={item.title}>{item.title}</h3>
                                    <div className="flex justify-end items-center mt-4 space-x-2">
                                        <button onClick={() => handlePreviewItem(item)} className="text-gray-500 hover:text-blue-600 p-2 rounded-full transition-colors duration-200">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleEditItem(item)} className="text-gray-500 hover:text-green-600 p-2 rounded-full transition-colors duration-200">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => confirmDelete(item)} className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors duration-200">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full ${item.publish ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {item.publish ? 'Published' : 'Draft'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={selectedItem?.title || 'Preview'}>
                {selectedItem && (
                    <div className="w-full max-h-[80vh] overflow-y-auto p-1">
                        {selectedItem.images_videos && selectedItem.images_videos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 mb-4">
                                {selectedItem.images_videos.map((media, index) => (
                                    <div key={index} className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                        <img
                                            src={media.src}
                                            alt={media.alt || selectedItem.title}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                                <img
                                    src={selectedItem.thumbnail || '/placeholder-image.png'}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        )}
                        
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-4">{selectedItem.description}</p>
                            {selectedItem.content && (
                                <div
                                    className="prose prose-sm max-w-none text-gray-800"
                                    dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Deletion">
                <p>Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4 mt-6">
                    <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteItem}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
}