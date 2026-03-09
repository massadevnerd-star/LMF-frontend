'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { ViewType, Story } from "@/app/types";
import api from '@/app/lib/api';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';
import { Search, Sparkles, PawPrint, Ghost, Laugh, BookOpen, Star, Loader2, Play, Bookmark } from 'lucide-react';

interface SearchViewProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    isDarkMode: boolean;
}

// Mock categories
const CATEGORIES = [
    { id: 'all', label: 'Tutte', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'adventure', label: 'Avventura', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'animals', label: 'Animali', icon: <PawPrint className="w-4 h-4" /> },
    { id: 'magic', label: 'Magia', icon: <Ghost className="w-4 h-4" /> },
    { id: 'funny', label: 'Divertenti', icon: <Laugh className="w-4 h-4" /> },
];

// Mock Results
// Mocks removed - using real data


export default function SearchView({ currentView, setView, isDarkMode }: SearchViewProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/auth/stories?status=published');
                if (Array.isArray(response.data)) {
                    setStories(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch stories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    const filteredStories = stories.filter(story => {
        const output = typeof story.output === 'string' ? JSON.parse(story.output) : story.output;
        const title = story.title || 'Senza Titolo';
        const subject = story.story_subject || 'other';

        const description = output?.formData?.description || '';

        // Map subject to category or check simply
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            description.toLowerCase().includes(searchQuery.toLowerCase());

        // Simple category matching - we might need to map real subjects to our categories later
        // For now, if activeCategory is not all, check if subject contains the category keyword or matches
        let matchesCategory = activeCategory === 'all';
        if (!matchesCategory) {
            // Rough mapping for demo since backend might have free text subjects
            if (activeCategory === 'magic' && (subject.includes('mago') || subject.includes('fata') || subject.includes('magia'))) matchesCategory = true;
            else if (activeCategory === 'animals' && (subject.includes('animale') || subject.includes('gatto') || subject.includes('cane'))) matchesCategory = true;
            else if (activeCategory === 'adventure' && (subject.includes('avventura') || subject.includes('viaggio'))) matchesCategory = true;
            else if (activeCategory === 'funny' && (subject.includes('divertente') || subject.includes('ridere'))) matchesCategory = true;
            else if (subject === activeCategory) matchesCategory = true;
        }

        return matchesSearch && matchesCategory;
    });

    const textColor = isDarkMode ? 'text-white' : 'text-gray-800';
    const subText = isDarkMode ? 'text-indigo-200' : 'text-gray-500';
    const inputBg = isDarkMode ? 'bg-[#242642] border-indigo-500/30 text-white' : 'bg-white border-orange-100 text-gray-800';
    const cardBg = isDarkMode ? 'bg-[#242642]' : 'bg-white';





    return (
        <div className={cn("w-full max-w-[1200px] mx-auto pt-8 px-4 pb-20 font-sans min-h-screen", isDarkMode ? "bg-transparent" : "bg-transparent")}>

            {/* Header / Search Bar */}
            <div className="flex flex-col gap-6 mb-10">
                <div>
                    <h2 className={cn("text-3xl md:text-4xl font-black uppercase tracking-wide mb-2", textColor)}>Cerca Storie</h2>
                    <p className={cn("text-lg opacity-70", textColor)}>Trova la tua prossima avventura magica!</p>
                </div>

                <div className="relative max-w-2xl w-full">
                    <input
                        type="text"
                        placeholder="Cerca una favola..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full h-14 pl-14 pr-6 rounded-2xl text-lg font-medium outline-none border-2 focus:ring-4 transition-all shadow-lg",
                            isDarkMode ? "focus:ring-indigo-500/20 focus:border-indigo-500" : "focus:ring-orange-200 focus:border-orange-400",
                            inputBg
                        )}
                    />
                    <Search className={cn("absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 opacity-50", textColor)} />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 border-2",
                                activeCategory === cat.id
                                    ? (isDarkMode ? "bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/30 shadow-lg" : "bg-orange-500 border-orange-400 text-white shadow-orange-300 shadow-lg")
                                    : (isDarkMode ? "bg-[#242642] border-indigo-500/30 text-indigo-200 hover:bg-[#2f3256]" : "bg-white border-orange-100 text-gray-600 hover:bg-orange-50")
                            )}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className={cn("w-10 h-10 animate-spin", isDarkMode ? "text-indigo-400" : "text-orange-400")} />
                </div>
            ) : filteredStories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {filteredStories.map(story => {
                        const output = typeof story.output === 'string' ? JSON.parse(story.output) : story.output;
                        const cover = output?.coverImage || story.cover_image;
                        // Mock view count for now as API might not provide it yet
                        const views = Math.floor(Math.random() * 2000) + 100;
                        const title = story ? output.title : (story || 'Senza Titolo');


                        return (
                            <div
                                key={story.id}
                                onClick={() => router.push(`/view-story?id=${story.id}`)}
                                className={cn("flex flex-col group cursor-pointer", cardBg, isDarkMode ? "border-transparent" : "")}
                            >
                                {/* Card Image Container */}
                                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3 border border-black/5 dark:border-white/5 transition-transform duration-300 group-hover:-translate-y-1 shadow-md">
                                    {cover ? (
                                        <img src={getAssetUrl(cover)} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
                                            <Bookmark className="w-8 h-8" />
                                        </div>
                                    )}

                                    {/* Badge at bottom left like Dashboard */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                        <Play className="w-3 h-3 fill-white" />
                                        <span>Start</span>
                                    </div>

                                    {/* Views Badge (kept as extra info, but positioned top right or similar? Or maybe replace Start? I'll keep Start as it invites action like Dashboard) */}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col px-1">
                                    <h3 className={cn("font-bold text-base leading-tight line-clamp-1 group-hover:text-pink-600 transition-colors", textColor)}>
                                        {title}
                                    </h3>
                                    <p className={cn("text-xs line-clamp-2 leading-relaxed opacity-70 mb-1", textColor)}>
                                        {output?.formData?.description || 'Nessuna descrizione'}
                                    </p>
                                    <span className={cn("text-[10px] font-medium opacity-50 uppercase tracking-wide", subText)}>
                                        {new Date(story.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                    <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-6", isDarkMode ? "bg-indigo-900/50" : "bg-orange-100")}>
                        <Search className={cn("w-10 h-10", isDarkMode ? "text-indigo-300" : "text-orange-400")} />
                    </div>
                    <h3 className={cn("text-xl font-bold mb-2", textColor)}>Nessuna storia trovata</h3>
                    <p className={cn("text-center max-w-sm", subText)}>Prova a cercare qualcos'altro o cambia categoria!</p>
                </div>
            )}

        </div>
    );
}
