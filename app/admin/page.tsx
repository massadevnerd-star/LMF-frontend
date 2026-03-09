'use client';

import React, { useEffect, useState } from 'react';
import { adminService } from '@/app/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, CreditCard, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        storiesCount: 0,
        creditsUsed: 0,
        usersCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // In a real app we would have a specific stats endpoint. 
                // For now, let's fetch stories to get some data or mock it if endpoints aren't ready.
                // Since I haven't made a stats endpoint, I will just list stories for now 
                // and calculate client side or just show placeholders.
                // Let's use the stories endpoint to get count and credits.
                const stories = await adminService.getStories();

                const totalCredits = stories.data.reduce((acc: number, story: any) => acc + (story.credits_used || 0), 0);

                setStats({
                    storiesCount: stories.total || stories.data.length,
                    creditsUsed: totalCredits,
                    usersCount: 0 // We don't have a users endpoint yet that returns count easily without pagination
                });
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-black text-gray-800">Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Storie Create</CardTitle>
                        <BookOpen className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.storiesCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Crediti AI Usati</CardTitle>
                        <CreditCard className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : stats.creditsUsed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Utenti Totali</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? '...' : '-'}</div>
                        <p className="text-xs text-gray-500">+ new this month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Attività Recente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Placeholder for recent activity list */}
                            <p className="text-sm text-gray-500 text-center py-8">Nessuna attività recente registrata.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
