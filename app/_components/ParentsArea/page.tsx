'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ViewType, ChildProfile, Story } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import api, { pinService, deleteStory } from '@/app/lib/api';
import { cn } from '@/app/lib/utils';
import { Plus, Edit2, Trash2, X, Check, Calendar, User as UserIcon, Lock, ChevronDown, KeyRound, MailCheck, BookOpen, Eye } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PinModal from "@/app/_components/PinModal/page";
import { getAvatarUrl } from '@/app/lib/avatar';
import ChangePinModal from "@/app/_components/ChangePinModal/page";
import ResetPinModal from "@/app/_components/ResetPinModal/page";
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

interface ParentsAreaProps {
    currentView: ViewType;
    setView: (view: ViewType) => void;
    isDarkMode: boolean;
}

// DiceBear Avatar Seeds
const AVATAR_SEEDS = [
    'Felix', 'Aneka', 'Zoe', 'Marc', 'Leo', 'Molly',
    'Simba', 'Lala', 'Coco', 'Bubba', 'Kiki', 'Ziggy'
];

export default function ParentsArea({ currentView, setView, isDarkMode }: ParentsAreaProps) {
    const { user, setUser } = useAuth();
    const { t } = useLanguage();
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false); // Legacy PIN Modal
    const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
    const [isResetPinModalOpen, setIsResetPinModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
    const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
    const [showPinDropdown, setShowPinDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Stories State
    const [stories, setStories] = useState<Story[]>([]);
    const [loadingStories, setLoadingStories] = useState(true);
    const [deleteStoryModalOpen, setDeleteStoryModalOpen] = useState(false);
    const [storyToDelete, setStoryToDelete] = useState<number | null>(null);
    const [previewStory, setPreviewStory] = useState<Story | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        nickname: '',
        type: 'Figlio' as 'Adulto' | 'Figlio' | 'Figlia',
        avatar: AVATAR_SEEDS[0]
    });

    // PIN Management Handlers
    const handleChangePin = async (oldPin: string, newPin: string) => {
        try {
            await pinService.changePin(oldPin, newPin);
            toast.success("PIN aggiornato con successo!");
        } catch (error: any) {
            console.error("Failed to change PIN", error);
            throw error; // Re-throw to let modal handle it
        }
    };

    const handleRequestReset = async (email: string) => {
        try {
            await pinService.requestReset(email);
            toast.success("Codice di reset inviato via email!");
        } catch (error: any) {
            console.error("Failed to request reset", error);
            throw error;
        }
    };

    const handleVerifyAndReset = async (email: string, code: string, newPin: string) => {
        try {
            await pinService.verifyResetAndSetPin(email, code, newPin);
            toast.success("PIN reimpostato con successo!");
        } catch (error: any) {
            console.error("Failed to verify and reset", error);
            throw error;
        }
    };

    // Legacy PIN handler
    const handleSetPin = async (pin: string) => {
        try {
            const response = await api.post('/api/auth/pin', { pin });
            setIsPinModalOpen(false);
            if (typeof setUser === 'function') {
                setUser(response.data.user);
            }
            toast.success("PIN di sicurezza impostato con successo!");
        } catch (error) {
            console.error("Failed to set PIN", error);
            toast.error("Errore durante l'impostazione del PIN");
        }
    };

    useEffect(() => {
        fetchChildren();
        fetchStories();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowPinDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await api.get('/api/auth/children');
            // Ensure we always set an array
            setChildren(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch children", error);
            setChildren([]); // Fallback to empty array
        } finally {
            setLoading(false);
        }
    };

    const fetchStories = async () => {
        try {
            const response = await api.get('/api/auth/stories');
            if (Array.isArray(response.data)) {
                setStories(response.data);
            } else {
                setStories([]);
            }
        } catch (error) {
            console.error("Failed to fetch stories", error);
            setStories([]);
        } finally {
            setLoadingStories(false);
        }
    };

    const handleOpenModal = (child?: ChildProfile) => {
        if (child) {
            setEditingChild(child);
            setFormData({
                nickname: child.nickname,
                type: child.type,
                avatar: child.avatar || AVATAR_SEEDS[0]
            });
        } else {
            setEditingChild(null);
            setFormData({
                nickname: '',
                type: 'Figlio',
                avatar: AVATAR_SEEDS[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.nickname) {
            toast.error("Inserisci almeno il nickname!");
            return;
        }

        try {
            if (editingChild) {
                // Update
                const response = await api.put(`/api/auth/children/${editingChild.id}`, formData);
                setChildren(prev => prev.map(c => c.id === editingChild.id ? response.data : c));
                toast.success("Profilo aggiornato!");
            } else {
                // Create
                const response = await api.post('/api/auth/children', formData);
                setChildren(prev => [...prev, response.data]);
                toast.success("Nuovo profilo creato!");
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Errore durante il salvataggio.");
        }
    };

    const handleDeleteClick = (id: number) => {
        setProfileToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!profileToDelete) return;

        try {
            await api.delete(`/api/auth/children/${profileToDelete}`);
            setChildren(prev => prev.filter(c => c.id !== profileToDelete));
            toast.success("Profilo eliminato.");
            setDeleteModalOpen(false);
            setProfileToDelete(null);
        } catch (error) {
            console.error("Delete failed", error);
            toast.error("Errore durante l'eliminazione.");
        }
    };

    const confirmStoryDelete = async () => {
        if (!storyToDelete) return;

        try {
            await deleteStory(storyToDelete);
            setStories(prev => prev.filter(s => s.id !== storyToDelete));
            toast.success("Storia eliminata con successo.");
            setDeleteStoryModalOpen(false);
            setStoryToDelete(null);
        } catch (error) {
            console.error("Delete story failed", error);
            toast.error("Errore durante l'eliminazione della storia.");
        }
    };

    const bgColor = isDarkMode ? 'bg-[#1a1c31]' : 'bg-white';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-800';
    const cardBg = isDarkMode ? 'bg-[#242642]' : 'bg-orange-50';

    return (
        <div className={cn("w-full max-w-[1200px] mx-auto pt-8 px-4 pb-20 font-sans min-h-screen", isDarkMode ? "bg-transparent" : "bg-transparent")}>

            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className={cn("text-3xl md:text-4xl font-black uppercase tracking-wide mb-2", textColor)}>{t('parents_area.title')}</h2>
                    <p className={cn("text-lg opacity-70", textColor)}>{t('parents_area.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    {/* PIN Management Dropdown */}
                    <div ref={dropdownRef} className="relative">
                        <Button
                            onClick={() => setShowPinDropdown(!showPinDropdown)}
                            variant="outline"
                            className={cn("gap-2 font-bold border-2", isDarkMode ? "border-indigo-500 text-indigo-300 hover:bg-indigo-900/50" : "border-orange-200 text-orange-600 hover:bg-orange-50")}
                        >
                            <Lock className="w-4 h-4" />
                            {t('parents_area.manage_pin')}
                            <ChevronDown className={cn("w-4 h-4 transition-transform", showPinDropdown && "rotate-180")} />
                        </Button>

                        {/* Dropdown Menu */}
                        {showPinDropdown && (
                            <div className={cn(
                                "absolute top-full mt-2 right-0 w-56 rounded-2xl shadow-2xl border-2 overflow-hidden z-50 animate-in slide-in-from-top-2",
                                isDarkMode ? "bg-[#1e2030] border-indigo-500/30" : "bg-white border-gray-200"
                            )}>
                                {user?.has_pin ? (
                                    <button
                                        onClick={() => {
                                            setIsChangePinModalOpen(true);
                                            setShowPinDropdown(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-3 flex items-center gap-3 transition-colors font-bold text-left",
                                            isDarkMode ? "hover:bg-indigo-900/30 text-white" : "hover:bg-orange-50 text-gray-800"
                                        )}
                                    >
                                        <KeyRound className="w-5 h-5" />
                                        {t('parents_area.change_pin')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsPinModalOpen(true);
                                            setShowPinDropdown(false);
                                        }}
                                        className={cn(
                                            "w-full px-4 py-3 flex items-center gap-3 transition-colors font-bold text-left",
                                            isDarkMode ? "hover:bg-indigo-900/30 text-white" : "hover:bg-orange-50 text-gray-800"
                                        )}
                                    >
                                        <Lock className="w-5 h-5" />
                                        {t('parents_area.set_pin')}
                                    </button>
                                )}
                                <div className={cn("h-px", isDarkMode ? "bg-indigo-500/20" : "bg-gray-200")} />
                                <button
                                    onClick={() => {
                                        setIsResetPinModalOpen(true);
                                        setShowPinDropdown(false);
                                    }}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center gap-3 transition-colors font-bold text-left",
                                        isDarkMode ? "hover:bg-indigo-900/30 text-white" : "hover:bg-orange-50 text-gray-800"
                                    )}
                                >
                                    <MailCheck className="w-5 h-5" />
                                    {t('parents_area.reset_email')}
                                </button>
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={() => setView('profile-selection')}
                        className={cn("gap-2 font-bold", isDarkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-orange-500 hover:bg-orange-600")}
                    >
                        <UserIcon className="w-4 h-4" />
                        {t('parents_area.change_profile')}
                    </Button>
                </div>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">

                {/* Main Parent Profile (Read Only for now) */}
                <div className="flex flex-col items-center group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                    <div className={cn("w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-transparent group-hover:border-indigo-500 transition-all shadow-xl mb-4 bg-white")}>
                        <img
                            src={getAvatarUrl(user?.avatar, user?.name)}
                            alt={t('parents_area.parent')}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className={cn("font-bold text-xl", textColor)}>{user?.name || t('parents_area.parent')}</span>
                    <span className={cn("text-xs uppercase tracking-widest font-bold opacity-50 bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full mt-1")}>{t('parents_area.parent')}</span>
                </div>

                {/* Children Profiles */}
                {children.map(child => (
                    <div key={child.id} className="relative flex flex-col items-center group cursor-pointer">
                        <div className={cn("relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-transparent group-hover:border-green-400 transition-all shadow-xl mb-4 bg-white")}>
                            <img
                                src={getAvatarUrl(child.avatar, child.nickname)}
                                alt={child.nickname}
                                className="w-full h-full object-cover"
                            />
                            {/* Edit Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleOpenModal(child)}
                                    className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(child.id)}
                                    className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <span className={cn("font-bold text-xl", textColor)}>{child.nickname}</span>
                        <span className={cn("text-xs uppercase tracking-widest font-bold opacity-50 px-2 py-0.5 rounded-full mt-1 bg-green-100 text-green-800")}>{child.type === 'Adulto' ? t('parents_area.adult') : t('parents_area.child')}</span>
                    </div>
                ))}

                {/* Add New Profile Button */}
                <div
                    onClick={() => handleOpenModal()}
                    className="flex flex-col items-center group cursor-pointer"
                >
                    <div className={cn("w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border-4 border-dashed transition-all hover:scale-105 hover:bg-opacity-50 mb-4", isDarkMode ? "border-gray-600 bg-white/5 hover:border-gray-400" : "border-gray-300 bg-gray-50 hover:border-gray-400")}>
                        <Plus className={cn("w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity", textColor)} />
                    </div>
                    <span className={cn("font-bold text-xl opacity-50 group-hover:opacity-80", textColor)}>{t('parents_area.add')}</span>
                </div>
            </div>

            {/* STORIES TABLE SECTION */}
            <div className="mt-16">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className={cn("w-8 h-8", isDarkMode ? "text-indigo-400" : "text-orange-500")} />
                    <h3 className={cn("text-2xl font-black uppercase tracking-wide", textColor)}>{t('parents_area.stories_title')}</h3>
                </div>

                <div className={cn(
                    "rounded-3xl shadow-xl overflow-hidden border-2",
                    isDarkMode ? "bg-[#1e2030] border-indigo-500/20" : "bg-white border-orange-100"
                )}>
                    {loadingStories ? (
                        <div className="p-10 text-center">
                            <div className={cn("inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin", isDarkMode ? "border-indigo-500" : "border-orange-500")} />
                            <p className={cn("mt-4 font-bold opacity-70", textColor)}>{t('parents_area.loading_stories')}</p>
                        </div>
                    ) : stories.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <BookOpen className={cn("w-16 h-16 opacity-20 mb-4", textColor)} />
                            <h4 className={cn("text-xl font-bold mb-2", textColor)}>{t('parents_area.no_stories_title')}</h4>
                            <p className={cn("opacity-70 max-w-md", textColor)}>{t('parents_area.no_stories_desc')}</p>
                            <Button
                                onClick={() => setView('laboratorio')}
                                className={cn("mt-6 gap-2 font-bold px-8 py-6 rounded-2xl", isDarkMode ? "bg-indigo-600 hover:bg-indigo-700" : "bg-orange-500 hover:bg-orange-600")}
                            >
                                <Plus className="w-5 h-5" />
                                {t('parents_area.create_new_story')}
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className={cn("border-b-2 text-sm uppercase tracking-wider font-black", isDarkMode ? "border-indigo-500/20 bg-indigo-900/30 text-indigo-200" : "border-orange-100 bg-orange-50 text-orange-800")}>
                                        <th className="p-5 font-bold">{t('parents_area.table.cover')}</th>
                                        <th className="p-5 font-bold">{t('parents_area.table.title')}</th>
                                        <th className="p-5 font-bold hidden md:table-cell">{t('parents_area.table.description')}</th>
                                        <th className="p-5 font-bold text-center">{t('parents_area.table.date')}</th>
                                        <th className="p-5 font-bold text-center">{t('parents_area.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stories.map((story) => {
                                        let coverImg = story.cover_image || "/placeholder-book.jpg";
                                        let storyDesc = story.story_subject || t('parents_area.table.no_desc');

                                        // Try to extract image from old JSON format or new array format
                                        if (story.output) {
                                            try {
                                                const outputData = typeof story.output === 'string' ? JSON.parse(story.output) : story.output;

                                                if (!story.cover_image) {
                                                    // Old format { coverImage: "..." }
                                                    if (outputData.coverImage) {
                                                        coverImg = outputData.coverImage;
                                                    }
                                                    // New format: Array of slides/pages
                                                    else if (Array.isArray(outputData)) {
                                                        const imageSlide = outputData.find((item: any) => item.type === 'image' && item.content);
                                                        if (imageSlide) {
                                                            coverImg = imageSlide.content;
                                                        }
                                                    }
                                                }
                                            } catch (e) {
                                                // ignore json parse error
                                                console.error("Error parsing story output for image", e);
                                            }
                                        }

                                        // Prepend backend URL if it's a local storage path and not a full URL
                                        if (coverImg && coverImg.startsWith('storage/') && !coverImg.startsWith('http')) {
                                            // Fallback to local for dev if no env var
                                            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.103:8000';
                                            // Handle both 'storage/' and '/storage/' forms
                                            const cleanPath = coverImg.startsWith('/') ? coverImg : `/${coverImg}`;
                                            coverImg = `${backendUrl}${cleanPath}`;
                                        }

                                        return (
                                            <tr key={story.id} className={cn("border-b last:border-0 transition-colors", isDarkMode ? "border-indigo-500/10 hover:bg-indigo-900/20" : "border-orange-50 hover:bg-orange-50/50")}>
                                                <td className="p-4 align-middle">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-black/10 flex items-center justify-center bg-gray-100">
                                                        <img src={coverImg} alt={story.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Cover'; }} />
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle font-bold">
                                                    <span className={textColor}>{story.title || t('parents_area.table.untitled')}</span>
                                                    {story.children && story.children.length > 0 && (
                                                        <div className="flex gap-1 mt-2">
                                                            {story.children.map(child => (
                                                                <span key={child.id} className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", isDarkMode ? "bg-green-900/50 text-green-300" : "bg-green-100 text-green-700")}>
                                                                    {child.nickname}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle hidden md:table-cell max-w-xs">
                                                    <p className={cn("text-sm line-clamp-2 opacity-80", textColor)}>
                                                        {storyDesc}
                                                    </p>
                                                </td>
                                                <td className="p-4 align-middle text-center whitespace-nowrap">
                                                    <span className={cn("text-sm font-medium opacity-70", textColor)}>
                                                        {new Date(story.created_at).toLocaleDateString('it-IT')}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setStoryToDelete(story.id);
                                                                setDeleteStoryModalOpen(true);
                                                            }}
                                                            className={cn("p-2 rounded-xl transition-all hover:scale-110", isDarkMode ? "bg-red-500/20 text-red-400 hover:bg-red-500/40" : "bg-red-50 text-red-500 hover:bg-red-100")}
                                                            title={t('parents_area.actions.delete')}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in transition-all">
                    <div className={cn(
                        "w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform",
                        isDarkMode ? "bg-[#1e2030] border-2 border-indigo-500/30" : "bg-white border-4 border-white"
                    )}>

                        {/* Modal Header */}
                        <div className={cn(
                            "flex justify-between items-center p-8 pb-6",
                            isDarkMode ? "bg-indigo-600/10" : "bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF]"
                        )}>
                            <div>
                                <h3 className={cn("text-2xl font-black uppercase tracking-wide", isDarkMode ? "text-white" : "text-gray-800")}>
                                    {editingChild ? 'Modifica Profilo' : 'Nuovo Eroe'}
                                </h3>
                                <p className={cn("text-sm font-bold opacity-60", isDarkMode ? "text-indigo-200" : "text-gray-600")}>
                                    {editingChild ? 'Aggiorna i dettagli' : 'Crea un nuovo profilo'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={cn("rounded-full p-2 transition-transform hover:rotate-90 hover:bg-white/20", isDarkMode ? "text-white" : "text-gray-700")}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">

                            {/* Nickname Input */}
                            <div className="space-y-2">
                                <label className={cn("font-black text-xs uppercase tracking-widest pl-2", isDarkMode ? "text-indigo-200" : "text-gray-400")}>
                                    {t('parents_area.edit_profile_modal.nickname')}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                        placeholder={t('parents_area.edit_profile_modal.nickname_placeholder')}
                                        className={cn(
                                            "w-full px-5 py-4 rounded-2xl font-bold text-lg outline-none border-2 transition-all shadow-sm focus:shadow-md",
                                            isDarkMode
                                                ? "bg-[#121212] border-indigo-500/30 text-white focus:border-indigo-500 placeholder-white/20"
                                                : "bg-gray-50 border-gray-100 text-gray-800 focus:border-orange-300 focus:bg-white placeholder-gray-300"
                                        )}
                                    />
                                    <UserIcon className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", isDarkMode ? "text-indigo-400" : "text-gray-300 group-focus-within:text-orange-400")} />
                                </div>
                            </div>

                            {/* Type Select */}
                            <div className="space-y-2">
                                <label className={cn("font-black text-xs uppercase tracking-widest pl-2", isDarkMode ? "text-indigo-200" : "text-gray-400")}>
                                    {t('parents_area.edit_profile_modal.who_is_it')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className={cn(
                                            "w-full px-5 py-4 rounded-2xl font-bold text-lg outline-none border-2 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md",
                                            isDarkMode
                                                ? "bg-[#121212] border-indigo-500/30 text-white focus:border-indigo-500"
                                                : "bg-indigo-50 border-indigo-100 text-indigo-900 focus:border-indigo-300 hover:bg-indigo-100"
                                        )}
                                    >
                                        <option value="Adulto">{t('parents_area.edit_profile_modal.role_parent')}</option>
                                        <option value="Figlio">{t('parents_area.edit_profile_modal.role_child')}</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "white" : "#4F46E5"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Avatar Grid */}
                            <div className="space-y-3">
                                <label className={cn("font-black text-xs uppercase tracking-widest text-center block", isDarkMode ? "text-indigo-200" : "text-gray-400")}>
                                    {t('parents_area.edit_profile_modal.choose_avatar')}
                                </label>
                                <div className={cn(
                                    "grid grid-cols-4 gap-4 p-4 rounded-2xl max-h-48 overflow-y-auto custom-scrollbar border-2",
                                    isDarkMode ? "bg-[#121212] border-indigo-500/20" : "bg-gray-50 border-gray-100"
                                )}>
                                    {AVATAR_SEEDS.map((seed) => (
                                        <div
                                            key={seed}
                                            onClick={() => setFormData({ ...formData, avatar: seed })}
                                            className={cn(
                                                "aspect-square rounded-full overflow-hidden cursor-pointer transition-all duration-300",
                                                formData.avatar === seed
                                                    ? "ring-4 ring-offset-2 scale-105 shadow-lg"
                                                    : "opacity-70 hover:opacity-100 hover:scale-110",
                                                formData.avatar === seed && (isDarkMode ? "ring-indigo-500 ring-offset-[#1e2030]" : "ring-orange-400 ring-offset-white")
                                            )}
                                        >
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                                                alt={seed}
                                                className="w-full h-full object-cover bg-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => setIsModalOpen(false)}
                                    className={cn(
                                        "flex-1 py-6 rounded-2xl font-bold border-2 transition-all",
                                        isDarkMode
                                            ? "bg-transparent border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                    )}
                                >
                                    {t('parents_area.edit_profile_modal.cancel')}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className={cn(
                                        "flex-[2] py-6 rounded-2xl font-black uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all",
                                        isDarkMode
                                            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                                            : "bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white"
                                    )}
                                >
                                    {editingChild ? t('parents_area.edit_profile_modal.save') : t('parents_area.edit_profile_modal.create')}
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW STORY MODAL */}
            {previewStory && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setPreviewStory(null)} />
                    <div className={cn(
                        "relative w-full max-w-2xl max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300",
                        isDarkMode ? "bg-[#1e2030] border-2 border-indigo-500/30" : "bg-white border-4 border-white"
                    )}>
                        <div className={cn(
                            "flex justify-between items-center p-6 border-b",
                            isDarkMode ? "border-indigo-500/20 bg-indigo-900/20" : "border-gray-100 bg-gray-50/80"
                        )}>
                            <h3 className={cn("text-xl font-black uppercase tracking-wide", textColor)}>{t('parents_area.preview_modal.title')}</h3>
                            <button
                                onClick={() => setPreviewStory(null)}
                                className={cn("rounded-full p-2 hover:bg-black/10 transition-colors", textColor)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="flex flex-col md:flex-row gap-6 mb-6">
                                <div className="w-40 h-40 shrink-0 rounded-2xl overflow-hidden self-center md:self-start shadow-md border border-black/10">
                                    <img
                                        src={
                                            previewStory.cover_image
                                                ? (previewStory.cover_image.startsWith('storage/') ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.103:8000'}/${previewStory.cover_image}` : previewStory.cover_image)
                                                : (previewStory.output
                                                    ? (() => {
                                                        try {
                                                            const data = typeof previewStory.output === 'string' ? JSON.parse(previewStory.output) : previewStory.output;
                                                            let foundImage = null;
                                                            if (data.coverImage) foundImage = data.coverImage;
                                                            else if (Array.isArray(data)) {
                                                                const imgSlide = data.find((i: any) => i.type === 'image' && i.content);
                                                                if (imgSlide) foundImage = imgSlide.content;
                                                            }
                                                            if (foundImage && foundImage.startsWith('storage/')) return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.103:8000'}/${foundImage}`;
                                                            return foundImage;
                                                        } catch (e) { return null; }
                                                    })()
                                                    : null)
                                                || "/placeholder-book.jpg"
                                        }
                                        alt={previewStory.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Cover'; }}
                                    />
                                </div>
                                <div>
                                    <h2 className={cn("text-3xl font-black mb-2", textColor)}>{previewStory.title}</h2>
                                    <p className={cn("opacity-80 leading-relaxed", textColor)}>
                                        {previewStory.story_subject || t('parents_area.preview_modal.no_desc_recorded')}
                                    </p>
                                </div>
                            </div>
                            <div className={cn("p-5 rounded-2xl", isDarkMode ? "bg-black/20" : "bg-orange-50/50")}>
                                <h4 className={cn("font-bold mb-3 uppercase tracking-wider text-sm opacity-60", textColor)}>{t('parents_area.preview_modal.original_json')}</h4>
                                <pre className={cn("text-xs whitespace-pre-wrap font-mono p-4 rounded-xl overflow-x-auto", isDarkMode ? "bg-[#121212] text-green-400" : "bg-white text-blue-800 shadow-inner")}>
                                    {typeof previewStory.output === 'object' ? JSON.stringify(previewStory.output, null, 2) : previewStory.output}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleSetPin}
                title="Imposta PIN Genitore"
                isSettingMode={true}
            />

            {/* Change PIN Modal */}
            <ChangePinModal
                isOpen={isChangePinModalOpen}
                onClose={() => setIsChangePinModalOpen(false)}
                onSuccess={handleChangePin}
                isDarkMode={isDarkMode}
            />

            {/* Reset PIN Modal */}
            <ResetPinModal
                isOpen={isResetPinModalOpen}
                onClose={() => setIsResetPinModalOpen(false)}
                onRequestReset={handleRequestReset}
                onVerifyAndReset={handleVerifyAndReset}
                isDarkMode={isDarkMode}
            />

            {/* DELETE CONFIRMATION MODAL */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent className={cn("rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden", isDarkMode ? "bg-[#1a1c31] text-white" : "bg-white text-gray-900")}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-wide flex items-center gap-2 text-red-500">
                            <Trash2 className="w-6 h-6" />
                            {t('parents_area.delete_profile_modal.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={cn("text-base font-medium", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                            {t('parents_area.delete_profile_modal.desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className={cn("rounded-xl px-6 py-2 font-bold border-2 transition-colors", isDarkMode ? "bg-white/10 hover:bg-white/20 border-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700")}>
                            {t('parents_area.delete_profile_modal.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-wide px-6 py-2 shadow-lg border-2 border-red-400"
                        >
                            {t('parents_area.delete_profile_modal.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* DELETE STORY CONFIRMATION MODAL */}
            <AlertDialog open={deleteStoryModalOpen} onOpenChange={setDeleteStoryModalOpen}>
                <AlertDialogContent className={cn("rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden", isDarkMode ? "bg-[#1a1c31] text-white" : "bg-white text-gray-900")}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-wide flex items-center gap-2 text-red-500">
                            <Trash2 className="w-6 h-6" />
                            {t('parents_area.delete_story_modal.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={cn("text-base font-medium", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                            {t('parents_area.delete_story_modal.desc')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className={cn("rounded-xl px-6 py-2 font-bold border-2 transition-colors", isDarkMode ? "bg-white/10 hover:bg-white/20 border-white/10 text-white" : "bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700")}>
                            {t('parents_area.delete_story_modal.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStoryDelete}
                            className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-wide px-6 py-2 shadow-lg border-2 border-red-400"
                        >
                            {t('parents_area.delete_story_modal.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
