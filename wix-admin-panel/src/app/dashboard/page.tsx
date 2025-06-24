'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image, Newspaper, Plus, LogOut } from 'lucide-react';

const Dashboard = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const quickActions = [
        { name: 'Manage Galleries', href: '/gallery', icon: Image, description: 'Create, edit, and manage image galleries.' },
        { name: 'Manage News', href: '/news', icon: Newspaper, description: 'Create, edit, and publish news articles.' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-700">SHGHS CMS Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto py-10 px-6">
                <div className="animate-fade-in">
                    {/* Welcome message */}
                    <div className="mb-10 p-6 bg-white rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
                        <p className="text-gray-600">Select an option below to manage your content.</p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                href={action.href}
                                className="group p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-400"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <action.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600">
                                            {action.name}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-1">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
