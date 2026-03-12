'use client'

import { ViewType, Story, Draft } from "@/app/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/app/lib/utils"; // Assuming utils exists here
import { getAssetUrl } from "@/app/lib/urlHelper";
import { getAvatarUrl } from "@/app/lib/avatar";
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
    Loader2,
    Trash2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import api, { deleteStory } from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import NotLogged from "../NotLogged/page";
import AssignmentUpdateModal from './_components/AssignmentUpdateModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DashboardProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    isDarkMode: boolean;
    setSelectedDraftId: (id: string | null) => void;
}

// Mock Data
// Data Interfaces are now imported from @/app/types

// --- REUSABLE STORY CARD COMPONENT ---
const StoryCard = ({
    item,
    activeTab,
    isChild,
    isDarkMode,
    likedStories,
    toggleLike,
    onAssign,
    onDelete,
    onClick,
    className
}: any) => {
    const isStory = activeTab === 'videos';
    const output = isStory ? (typeof item.output === 'string' ? JSON.parse(item.output) : item.output) : null;
    const title = isStory ? (output?.formData?.title || output?.title || 'Senza Titolo') : (item.formData?.title || 'Senza Titolo');
    const desc = isStory ? (output?.formData?.description) : (item.formData?.description);
    const date = new Date(isStory ? item.created_at : item.updatedAt).toLocaleDateString();
    const cover = isStory ? (output?.coverImage || item.cover_image) : item.formData?.coverPreview;

    const textColor = isDarkMode ? "text-white" : "text-black";
    const mutedColor = isDarkMode ? "text-gray-400" : "text-gray-500";

    return (
        <div className={cn("flex flex-col group cursor-pointer", className)} onClick={onClick}>
            {/* Card Image Container */}
            <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 border border-black/5 dark:border-white/5 transition-transform duration-300 group-hover:-translate-y-1 shadow-md">
                {cover ? (
                    <img
                        src={getAssetUrl(cover)}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
                        {isStory ? <Play className="w-8 h-8" /> : <Share2 className="w-8 h-8" />}
                    </div>
                )}

                {/* Badge (Bottom Left) */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-[11px] font-bold bg-black/40 px-2.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                    {isStory ? <Play className="w-3 h-3 fill-white" /> : <span>BOZZA</span>}
                    {isStory && <span>Start</span>}
                </div>

                {/* Assigned Children Indicator (Top Left - Parent Only) */}
                {!isChild && item.children && item.children.length > 0 && (
                    <div className="absolute top-2 left-2 flex -space-x-2 z-10">
                        {item.children.slice(0, 3).map((child: any) => (
                            <div
                                key={child.id}
                                className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                                title={child.nickname}
                            >
                                <img
                                    src={getAvatarUrl(child.avatar, child.nickname)}
                                    alt={child.nickname}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        {item.children.length > 3 && (
                            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                +{item.children.length - 3}
                            </div>
                        )}
                    </div>
                )}

                {/* Delete Button (Draft Only) */}
                {!isStory && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(e, item.id); }}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors z-10 opacity-0 group-hover:opacity-100"
                        title="Elimina bozza"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                {/* LIKE BUTTON (Story Only - Top Right) */}
                {isStory && (
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(e, item.id); }}
                        className="absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all z-10 hover:scale-110 active:scale-95 group/like"
                    >
                        <Heart
                            className={cn(
                                "w-6 h-6 transition-colors drop-shadow-md",
                                likedStories.has(item.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-white hover:text-red-200"
                            )}
                        />
                    </button>
                )}
            </div>

            {/* Card Details */}
            <div className="flex flex-col px-1">
                <h3 className={cn("font-bold text-sm leading-tight line-clamp-1 group-hover:text-pink-600 transition-colors", textColor)}>
                    {title}
                </h3>
                <p className={cn("text-[10px] line-clamp-2 leading-relaxed opacity-70 mb-1", textColor)}>
                    {desc || 'Nessuna descrizione'}
                </p>
                <div className="flex justify-between items-end mt-2">
                    <span className={cn("text-[9px] font-medium opacity-50 uppercase tracking-wide", mutedColor)}>
                        {date}
                    </span>

                    {/* Manage Sharing Button (Parent Only) */}
                    {!isChild && isStory && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAssign(item);
                            }}
                            className={cn("p-2 rounded-full transition-colors", isDarkMode ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-100 text-gray-400 hover:text-black")}
                            title="Modifica Condivisione"
                        >
                            <Users className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ isDarkMode, setView, setSelectedDraftId }: DashboardProps) {
    const { user, isLoading: isAuthLoading, activeProfile } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'videos' | 'reposts' | 'liked'>('videos');
    const [stories, setStories] = useState<Story[]>([]);
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState<number | null>(null);

    // Assignment Update Modal State
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [storyToAssign, setStoryToAssign] = useState<Story | null>(null);

    // Determine profile display info
    const isChild = typeof activeProfile === 'object' && activeProfile !== null;
    const displayName = isChild ? (activeProfile as any).nickname : (user?.name || 'Utente Magico');
    const displayAvatar = isChild
        ? getAvatarUrl((activeProfile as any).avatar, (activeProfile as any).nickname)
        : getAvatarUrl(user?.avatar, user?.name);
    const displaySubtext = isChild ? 'Piccolo Lettore' : (user?.email || 'Esploratore di storie.');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Stories
                const queryParams = new URLSearchParams({ status: 'published' });
                if (isChild && activeProfile && typeof activeProfile === 'object') {
                    queryParams.append('child_id', String(activeProfile.id));
                }
                const storiesRes = await api.get(`/api/auth/stories?${queryParams.toString()}`);
                setStories(Array.isArray(storiesRes.data) ? storiesRes.data : []);

                setStories(Array.isArray(storiesRes.data) ? storiesRes.data : []);

                // Fetch Drafts (Only for Parents)
                if (!isChild) {
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

                    // Remove duplicates by ID and filter out published stories (safety check)
                    const publishedIds = new Set((Array.isArray(storiesRes.data) ? storiesRes.data : []).map((s: any) => s.id));

                    const uniqueDrafts = parsedDrafts.filter((draft: any, index: number, self: any[]) =>
                        index === self.findIndex((t) => (
                            t.id === draft.id
                        )) && !publishedIds.has(draft.id)
                    );

                    setDrafts(uniqueDrafts);
                } else {
                    setDrafts([]);
                }

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

    const handleDeleteDraft = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setDraftToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!draftToDelete) return;

        try {
            await deleteStory(draftToDelete);
            setDrafts(prev => prev.filter(d => d.id !== draftToDelete));
            setDeleteModalOpen(false);
            setDraftToDelete(null);
        } catch (error) {
            console.error("Failed to delete draft", error);
            alert("Errore durante l'eliminazione della bozza");
        }
    };

    // --- LIKE FEATURE (Local Storage for MVP) ---
    const [likedStories, setLikedStories] = useState<Set<number>>(new Set());

    useEffect(() => {
        // Load likes from local storage on mount
        const savedLikes = localStorage.getItem('liked_stories');
        if (savedLikes) {
            try {
                const ids = JSON.parse(savedLikes);
                setLikedStories(new Set(ids));
            } catch (e) {
                console.error("Failed to parse likes", e);
            }
        }
    }, []);

    const toggleLike = (e: React.MouseEvent, storyId: number) => {
        e.stopPropagation(); // Prevent card click navigation
        const newLikes = new Set(likedStories);
        if (newLikes.has(storyId)) {
            newLikes.delete(storyId);
        } else {
            newLikes.add(storyId);
        }
        setLikedStories(newLikes);
        localStorage.setItem('liked_stories', JSON.stringify(Array.from(newLikes)));
    };
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

    const contentToDisplay = activeTab === 'videos' ? stories : drafts;

    if (isAuthLoading) {
        return (
            <div className="w-full h-full flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!user) {
        return <NotLogged isDarkMode={isDarkMode} />;
    }



    return (
        <div className={cn("w-full max-w-[1200px] mx-auto pt-8 px-4 pb-20 font-sans", isDarkMode ? "bg-[#121212]" : "bg-white")}>

            {/* --- PROFILE HEADER --- */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 px-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                    <img
                        src={displayAvatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className={cn("text-2xl md:text-3xl font-black mb-2", textColor)}>{displayName}</h1>
                    <p className={cn("text-sm md:text-base max-w-lg mx-auto md:mx-0", mutedColor)}>
                        {displaySubtext}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm font-bold">
                        <div className="flex flex-col items-center md:items-start">
                            <span className={textColor}>{stories.length}</span>
                            <span className={mutedColor}>Storie</span>
                        </div>
                        {!isChild && (
                            <div className="flex flex-col items-center md:items-start">
                                <span className={textColor}>{drafts.length}</span>
                                <span className={mutedColor}>Bozze</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- SECTION TITLE (Ultime Notizie) --- */}
            <div className="px-4 mb-4 text-center md:text-left">
                <p className={cn("text-[10px] font-black text-bold uppercase tracking-[0.2em] opacity-60", textColor)}>
                    News
                </p>
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
                {!isChild && (
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
                )}
            </div>

            {activeTab === 'videos' && stories.length > 0 && (
                <div className="flex flex-col gap-6 mb-8 mt-2">
                    {/* CAROUSEL HEADER */}
                    <div className="relative group/carousel">

                        {/* Left Arrow */}
                        <button
                            onClick={() => scrollCarousel('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 text-black dark:text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Right Arrow */}
                        <button
                            onClick={() => scrollCarousel('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-2 text-black dark:text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center shrink-0"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Carousel Container */}
                        <div
                            ref={carouselRef}
                            className="flex gap-4 overflow-x-auto pb-4 px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth"
                        >
                            {stories.slice(0, 8).map((story) => (
                                <StoryCard
                                    key={`carousel-${story.id}`}
                                    item={story}
                                    activeTab="videos"
                                    isChild={isChild}
                                    isDarkMode={isDarkMode}
                                    likedStories={likedStories}
                                    toggleLike={toggleLike}
                                    onAssign={(s: any) => { setStoryToAssign(s); setAssignmentModalOpen(true); }}
                                    onClick={() => router.push(`/view-story?id=${story.id}`)}
                                    className="snap-start shrink-0 w-[calc(50%-8px)] min-w-[calc(50%-8px)] sm:w-[200px] sm:min-w-[200px]"
                                />
                            ))}
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


                        {/* Carousel Container */}

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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        </div>
                    ) : contentToDisplay.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                            <p>Nessun contenuto trovato.</p>
                        </div>
                    ) : (
                        contentToDisplay.map((item: any) => (
                            <StoryCard
                                key={item.id}
                                item={item}
                                activeTab={activeTab}
                                isChild={isChild}
                                isDarkMode={isDarkMode}
                                likedStories={likedStories}
                                toggleLike={toggleLike}
                                onAssign={(s: any) => { setStoryToAssign(s); setAssignmentModalOpen(true); }}
                                onDelete={handleDeleteDraft}
                                onClick={() => {
                                    if (activeTab === 'videos') {
                                        router.push(`/view-story?id=${item.id}`);
                                    } else {
                                        setSelectedDraftId(String(item.id));
                                        setView('laboratorio');
                                    }
                                }}
                            />
                        ))
                    )}
                </div>
            )}

            {/* ASSIGNMENT UPDATE MODAL */}
            {storyToAssign && (
                <AssignmentUpdateModal
                    isOpen={assignmentModalOpen}
                    onClose={() => {
                        setAssignmentModalOpen(false);
                        setStoryToAssign(null);
                    }}
                    storyId={Number(storyToAssign.id)}
                    initialAssignedChildIds={storyToAssign.children?.map(c => c.id) || []}
                    onUpdate={(storyId, newChildIds) => {
                        // Simple re-fetch to update UI
                        api.get('/api/auth/stories?status=published').then(res => {
                            setStories(Array.isArray(res.data) ? res.data : []);
                        });
                    }}
                />
            )}

            {/* DELETE CONFIRMATION MODAL */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent className="rounded-3xl border-2 border-red-100 bg-white dark:bg-[#1a1c31] dark:border-red-900/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-red-600 dark:text-red-400">
                            Sei sicuro? 🗑️
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-300">
                            Stai per cancellare per sempre questa storia. Non potrai più recuperarla.
                            Vuoi davvero procedere?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-xl px-6 py-2 text-gray-600 font-bold dark:text-gray-300 dark:hover:bg-white/10">
                            No, annulla
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2"
                        >
                            Sì, cancella tutto
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}