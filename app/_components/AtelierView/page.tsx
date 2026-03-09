'use client'

import { ViewType, Story, Draft } from "@/app/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/lib/utils"; // Assuming utils exists here
import {
    Users,
    Heart,
    Share2,
    MoreHorizontal,
    Lock,
    Play,
    MessageCircle,
    Bookmark,
    Pin as PinIcon,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { getAssetUrl } from '@/app/lib/urlHelper';

interface AtelierViewProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    isDarkMode: boolean;
    setSelectedDraftId: (id: string) => void;
}

// Mock Data
// Data Interfaces are now imported from @/app/types

export default function AtelierView({ isDarkMode, setView, setSelectedDraftId }: AtelierViewProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'videos' | 'reposts' | 'liked'>('videos');
    const [stories, setStories] = useState<Story[]>([]);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Stories
                const storiesRes = await api.get('/api/auth/stories?status=published');
                setStories(Array.isArray(storiesRes.data) ? storiesRes.data : []);

                // Fetch Drafts
                const draftsRes = await api.get('/api/auth/stories?status=draft');
                const rawDrafts = Array.isArray(draftsRes.data) ? draftsRes.data : [];

                const parsedDrafts = rawDrafts.map((d: any) => {
                    let output = d.output;
                    if (typeof output === 'string') {
                        try { output = JSON.parse(output); } catch (e) { }
                    }
                    return {
                        id: d.id,
                        formData: output.formData || {},
                        updatedAt: d.updated_at,
                        userId: d.user_id,
                        slides: output.slides || []
                    };
                });
                setDrafts(parsedDrafts);

            } catch (error) {
                console.error("Failed to fetch atelier data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const textColor = isDarkMode ? "text-white" : "text-black";
    const mutedColor = isDarkMode ? "text-gray-400" : "text-gray-500";
    const borderColor = isDarkMode ? "border-gray-800" : "border-gray-200";
    const hoverBg = isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100";

    const carouselRef = useRef<HTMLDivElement>(null);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className={cn("w-full max-w-[1200px] mx-auto pt-8 px-4 pb-20 font-sans", isDarkMode ? "bg-[#121212]" : "bg-white")}>

            {/* --- PROFILE HEADER --- */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 px-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className={cn("text-2xl md:text-3xl font-black mb-2", textColor)}>{user?.name || 'Utente Magico'}</h1>
                    <p className={cn("text-sm md:text-base max-w-lg mx-auto md:mx-0", mutedColor)}>
                        {user?.email || 'Esploratore di storie.'}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm font-bold">
                        <div className="flex flex-col items-center md:items-start">
                            <span className={textColor}>{stories.length}</span>
                            <span className={mutedColor}>Storie</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <span className={textColor}>{drafts.length}</span>
                            <span className={mutedColor}>Bozze</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT TABS --- */}
            <div className={cn("flex items-center gap-8 mb-6 border-b", borderColor)}>
                <button
                    onClick={() => setActiveTab('videos')}
                    className={cn(
                        "h-12 px-2 flex items-center gap-2 font-semibold text-lg border-b-2 transition-colors relative top-[1px]",
                        activeTab === 'videos' ? "border-black dark:border-white opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                >
                    <span className={isDarkMode && activeTab === 'videos' ? "text-white" : "text-black"}>Video</span>
                </button>
                <button
                    onClick={() => setActiveTab('reposts')}
                    className={cn(
                        "h-12 px-2 flex items-center gap-2 font-semibold text-lg border-b-2 transition-colors relative top-[1px]",
                        activeTab === 'reposts' ? "border-black dark:border-white opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                >
                    <Share2 className="w-4 h-4" />
                    <span className={isDarkMode && activeTab === 'reposts' ? "text-white" : "text-black"}>Bozze</span>
                </button>
            </div>

            {/* --- CAROUSEL AND GRID CONTENT --- */}
            {activeTab === 'videos' && stories.length > 0 && (
                <div className="flex flex-col gap-6 mb-8 mt-2">
                    {/* CAROUSEL HEADER */}
                    <div className="relative group/carousel">
                        <h2 className={cn("text-xl font-bold mb-4 px-1", textColor)}>Le tue Storie</h2>

                        {/* Left Arrow */}
                        <button
                            onClick={() => scrollCarousel('left')}
                            className="absolute left-[-20px] top-[45%] z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 text-black dark:text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scrollCarousel('right')}
                            className="absolute right-[-20px] top-[45%] z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 text-black dark:text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center shrink-0"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Carousel Container */}
                        <div
                            ref={carouselRef}
                            className="flex gap-4 overflow-x-auto pb-4 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth"
                        >
                            {stories.slice(0, 8).map((story) => {
                                const storyOutput = typeof story.output === 'string' ? JSON.parse(story.output) : story.output;
                                const cover = storyOutput?.coverImage || story.cover_image;

                                return (
                                    <div
                                        key={`carousel-${story.id}`}
                                        onClick={() => router.push(`/view-story?id=${story.id}`)}
                                        className="snap-start shrink-0 w-[180px] sm:w-[220px] flex flex-col group cursor-pointer"
                                    >
                                        {/* Card Image Container */}
                                        <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3 border border-black/5 dark:border-white/5 transition-transform duration-300 group-hover:-translate-y-1 shadow-md">
                                            {cover ? (
                                                <img
                                                    src={getAssetUrl(cover)}
                                                    alt={story.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
                                                    <Bookmark className="w-8 h-8" />
                                                </div>
                                            )}

                                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                                <Play className="w-3 h-3 fill-white" />
                                                <span>Start</span>
                                            </div>
                                        </div>

                                        {/* Card Details */}
                                        <div className="flex flex-col px-1">
                                            <h3 className={cn("font-bold text-base leading-tight line-clamp-1 group-hover:text-pink-600 transition-colors", textColor)}>
                                                {story.title}
                                            </h3>
                                            <p className={cn("text-xs line-clamp-2 leading-relaxed opacity-70 mb-1", textColor)}>
                                                {storyOutput?.formData?.description || 'Nessuna descrizione'}
                                            </p>
                                            <span className={cn("text-[10px] font-medium opacity-50 uppercase tracking-wide", mutedColor)}>
                                                {new Date(story.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reposts' && drafts.length > 0 && (
                <div className="flex flex-col gap-6 mb-8 mt-2">
                    {/* CAROUSEL HEADER */}
                    <div className="relative group/carousel">
                        <h2 className={cn("text-xl font-bold mb-4 px-1", textColor)}>Le tue Bozze</h2>

                        {/* Left Arrow */}
                        <button
                            onClick={() => scrollCarousel('left')}
                            className="absolute left-[-20px] top-[45%] z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 text-black dark:text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scrollCarousel('right')}
                            className="absolute right-[-20px] top-[45%] z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 text-black dark:text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center shrink-0"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Carousel Container */}
                        <div
                            ref={carouselRef}
                            className="flex gap-4 overflow-x-auto pb-4 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth"
                        >
                            {drafts.slice(0, 8).map((draft) => {
                                const cover = draft.formData?.coverPreview;
                                return (
                                    <div
                                        key={`carousel-reposts-${draft.id}`}
                                        onClick={() => { setSelectedDraftId(String(draft.id)); setView('laboratorio'); }}
                                        className="snap-start shrink-0 w-[180px] sm:w-[220px] flex flex-col group cursor-pointer"
                                    >
                                        {/* Card Image Container */}
                                        <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3 border border-black/5 dark:border-white/5 transition-transform duration-300 group-hover:-translate-y-1 shadow-md">
                                            {cover ? (
                                                <img
                                                    src={getAssetUrl(cover)}
                                                    alt={draft.formData?.title || 'Bozza'}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500">
                                                    <Share2 className="w-8 h-8" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                                <span>BOZZA</span>
                                            </div>
                                        </div>

                                        {/* Card Details */}
                                        <div className="flex flex-col px-1">
                                            <h3 className={cn("font-bold text-base leading-tight line-clamp-1 group-hover:text-pink-600 transition-colors", textColor)}>
                                                {draft.formData?.title || 'Senza Titolo'}
                                            </h3>
                                            <p className={cn("text-xs line-clamp-2 leading-relaxed opacity-70 mb-1", textColor)}>
                                                {draft.formData?.description || 'Nessuna descrizione'}
                                            </p>
                                            <span className={cn("text-[10px] font-medium opacity-50 uppercase tracking-wide", mutedColor)}>
                                                {new Date(draft.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* --- GRID CONTENT --- */}
            {activeTab === 'liked' ? (
                <div className={cn("flex flex-col items-center justify-center py-20 opacity-60", textColor)}>
                    <Lock className="w-16 h-16 mb-4 opacity-30" />
                    <h3 className="text-xl font-bold">I video con "Mi piace" sono privati</h3>
                    <p className="text-sm">I video che ti piacciono sono visibili solo a te</p>
                </div>
            ) : (

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : (activeTab === 'videos' ? stories : drafts).length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                            <p>Nessun contenuto trovato.</p>
                        </div>
                    ) : (
                        (activeTab === 'videos' ? stories : drafts).map((item: any) => {
                            // Handle different structure for Story vs Draft
                            const isStory = activeTab === 'videos';
                            const output = isStory ? (typeof item.output === 'string' ? JSON.parse(item.output) : item.output) : null;
                            const title = isStory ? item.title : (item.formData?.title || 'Senza Titolo');
                            const desc = isStory ? (output?.formData?.description) : (item.formData?.description);
                            const date = new Date(isStory ? item.created_at : item.updatedAt).toLocaleDateString();
                            const cover = isStory ? (output?.coverImage || item.cover_image) : item.formData?.coverPreview;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (isStory) {
                                            router.push(`/view-story?id=${item.id}`);
                                        } else {
                                            setSelectedDraftId(String(item.id));
                                            setView('laboratorio');
                                        }
                                    }}
                                    className="flex flex-col group cursor-pointer"
                                >
                                    {/* Card Image */}
                                    <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 border border-black/5 dark:border-white/5 transition-transform duration-300 group-hover:-translate-y-1">
                                        {cover ? (
                                            <img
                                                src={getAssetUrl(cover)}
                                                alt={title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                                {isStory ? <Play className="w-8 h-8 text-white/50" /> : <Share2 className="w-8 h-8 text-white/50" />}
                                            </div>
                                        )}

                                        {/* Badge */}
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                                            {isStory ? <Play className="w-3 h-3 fill-white" /> : <span>BOZZA</span>}
                                            {isStory && <span>Start</span>}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-col px-1">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h3 className={cn("font-bold text-lg leading-tight line-clamp-1 group-hover:text-pink-600 transition-colors", textColor)}>
                                                {title}
                                            </h3>
                                        </div>
                                        <p className={cn("text-sm line-clamp-2 leading-relaxed opacity-70 mb-2", textColor)}>
                                            {desc || 'Nessuna descrizione'}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] font-medium opacity-50 uppercase tracking-wide">
                                            <span className={mutedColor}>{date}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}

        </div>
    );
}