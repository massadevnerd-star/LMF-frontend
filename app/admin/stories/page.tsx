'use client';

import React, { useEffect, useState } from 'react';
import { adminService, StorySummary } from '@/app/services/adminService';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStoriesPage() {
    const [stories, setStories] = useState<StorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortByCredits, setSortByCredits] = useState(false);

    useEffect(() => {
        loadStories();
    }, [sortByCredits]);

    const loadStories = async () => {
        setLoading(true);
        try {
            const params = sortByCredits ? { sort_by_credits: 'true' } : {};
            const response = await adminService.getStories(params);
            setStories(response.data || []); // Handle pagination structure
        } catch (error) {
            toast.error("Errore caricamento storie");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Sei sicuro di voler eliminare questa storia?")) return;
        try {
            await adminService.deleteStory(id);
            setStories(prev => prev.filter(s => s.id !== id));
            toast.success("Storia eliminata");
        } catch (e) {
            toast.error("Errore eliminazione");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-gray-800">Storie & Crediti</h2>
                <Button
                    variant={sortByCredits ? "default" : "outline"}
                    onClick={() => setSortByCredits(!sortByCredits)}
                    className="gap-2"
                >
                    <TrendingUp className="w-4 h-4" />
                    {sortByCredits ? 'Ordina per Recenti' : 'Ordina per Crediti Usati'}
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-500">Titolo</th>
                            <th className="p-4 font-bold text-gray-500">Autore</th>
                            <th className="p-4 font-bold text-gray-500">Stato</th>
                            <th className="p-4 font-bold text-gray-500">Crediti</th>
                            <th className="p-4 font-bold text-gray-500 text-right">Data</th>
                            <th className="p-4 font-bold text-gray-500 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {stories.map(story => (
                            <tr key={story.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-gray-800">{story.story_subject}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                            {story.user?.avatar ? (
                                                <img src={story.user.avatar} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-indigo-100 text-indigo-500">
                                                    {story.user?.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">{story.user?.name}</p>
                                            <p className="text-xs text-gray-400">{story.user?.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${story.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {story.status || 'Draft'}
                                    </span>
                                </td>
                                <td className="p-4 font-mono font-bold text-indigo-600">
                                    {story.credits_used > 0 ? `-${story.credits_used}` : '0'}
                                </td>
                                <td className="p-4 text-right text-gray-500 text-sm">
                                    {new Date(story.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(story.id)} className="hover:bg-red-50 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {stories.length === 0 && !loading && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">Nessuna storia trovata.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
