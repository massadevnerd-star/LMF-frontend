import React, { useState, useEffect, useRef } from 'react';
import { SidebarProps } from '../Sidebar/page';
import { Image as ImageIcon, Upload, Info, Wand2, ArrowRight, ArrowLeft, Tag, Coins, RectangleHorizontal, RectangleVertical, Check, Clock, Pencil, Trash2, Plus, Layout, Globe, Music } from 'lucide-react';
import { toast } from "sonner";
import { cn } from '@/app/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import BookPreview from './_components/BookPreview';
import FableEditor, { Slide } from './_components/FableEditor';
import TemplateSelector, { TemplateLayout } from './_components/TemplateSelector';
import StoryAssignmentSelector from './_components/StoryAssignmentSelector';
import api, { uploadFile, saveStory, updateStory } from '@/app/lib/api';
import { toRelativePath, getAssetUrl } from '@/app/lib/urlHelper';
import { useAuth } from '@/app/context/AuthContext';
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

// Mock Data for Selects
const AGE_GROUPS = ["3-5 anni", "6-8 anni", "9-12 anni", "Per tutti"];
const CATEGORIES = ["Avventura", "Fantasia", "Educativo", "Favola Classica", "Animali", "Scienza"];

interface StoryFormData {
    coverImage: File | null;
    coverPreview: string | null;
    audioFile: File | null;
    audioPreview: string | null;
    coverOrientation: 'vertical' | 'horizontal';
    title: string;
    description: string;
    ageGroup: string;
    category: string;
    tags: string[];
    price: number | '';
    creationMode?: 'manual' | 'ai';
    selectedLayout?: TemplateLayout;
    audioMode?: 'global' | 'slides';
    assignedChildren?: number[];
}

interface SavedStory {
    id: string;
    createdAt: number;
    updatedAt: number;
    formData: StoryFormData;
    slides: Slide[];
    userId?: string;
}

function Laboratorio({ currentView, setView, isDarkMode, selectedDraftId }: SidebarProps & { selectedDraftId?: string | null }) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);

    // Form Data State
    const [formData, setFormData] = useState<StoryFormData>({
        coverImage: null,
        coverPreview: null,
        audioFile: null,
        audioPreview: null,
        coverOrientation: 'vertical',
        title: '',
        description: '',
        ageGroup: '',
        category: '',
        tags: [],
        price: '',
        creationMode: undefined,
        audioMode: 'global', // Default to global
    });
    const [currentTag, setCurrentTag] = useState('');

    // Persistence State
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [initialEditorSlides, setInitialEditorSlides] = useState<Slide[] | undefined>(undefined);
    const [latestSlides, setLatestSlides] = useState<Slide[]>([]);

    // Modal State
    const [publishModalOpen, setPublishModalOpen] = useState(false);
    const [storyToPublish, setStoryToPublish] = useState<SavedStory | null>(null);

    // Styles
    const bgColor = isDarkMode ? 'bg-[#1a1c31]' : 'bg-white';
    const textColor = isDarkMode ? 'text-indigo-200' : 'text-[#5b21b6]';
    const cardBg = isDarkMode ? 'bg-[#1a1c31] border border-indigo-500/30' : 'bg-gray-50 border border-gray-100';
    const inputBg = isDarkMode ? 'bg-[#2e3048] border-transparent focus:border-indigo-500' : 'bg-white border-gray-200 focus:border-purple-500';
    const labelColor = isDarkMode ? 'text-indigo-300' : 'text-purple-900';

    // --- Load Draft from API ---
    useEffect(() => {
        const loadDraft = async () => {
            if (selectedDraftId) {
                try {
                    const response = await api.get(`/api/auth/stories/${selectedDraftId}`);

                    const story = response.data;

                    // Parse Data
                    let output = story.output;
                    if (typeof output === 'string') {
                        try { output = JSON.parse(output); } catch (e) { }
                    }

                    console.log('output => ', output);
                    // Populate State
                    setFormData(output.formData || {});
                    setInitialEditorSlides(output.slides || []);
                    setEditingId(story.id);

                    // Go to Step 1 to review metadata
                    setCurrentStep(1);
                    toast.success("Bozza caricata!");
                } catch (e) {
                    console.error("Load Error", e);
                    toast.error("Errore nel caricamento della bozza.");
                }
            }
        };
        loadDraft();
    }, [selectedDraftId]);

    // Removing persistStories and updating delete logic to use API
    // We assume api.deleteStory exists or we add it now?
    // I will add deleteStory to api.ts in next step.
    // Here I will remove the functions.

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOrientationChange = (orientation: 'vertical' | 'horizontal') => {
        setFormData(prev => ({ ...prev, coverOrientation: orientation }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    coverImage: file,
                    coverPreview: reader.result as string // Save as DataURL for persistence
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    audioFile: file,
                    audioPreview: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(currentTag.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
            }
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleBack = () => {
        if (currentStep === 2) {
            if (formData.selectedLayout) {
                // Return to Template Selector
                setFormData(prev => ({ ...prev, selectedLayout: undefined }));
                return;
            }
            if (formData.creationMode === 'manual') {
                // Return to Mode Selection
                setFormData(prev => ({ ...prev, creationMode: undefined }));
                return;
            }
            if (formData.creationMode === 'ai') {
                setFormData(prev => ({ ...prev, creationMode: undefined }));
                return;
            }
        }
        prevStep();
    };

    // --- HELPERS ---

    // Helper to convert Blob/DataURL to File
    const dataURLtoFile = async (dataurl: string, filename: string) => {
        try {
            const res = await fetch(dataurl);
            const blob = await res.blob();
            return new File([blob], filename, { type: blob.type });
        } catch (e) {
            console.error("Conversion error", e);
            return null;
        }
    };

    // Helper to Save/Publish logic
    const saveToBackend = async (
        status: 'draft' | 'published',
        currentSlides: Slide[],
        overrideFormData?: StoryFormData,
        overrideId?: string
    ) => {
        const data = overrideFormData || formData;
        const targetId = overrideId || editingId;

        // 1. Upload Cover (always save relative path for portability)
        let coverUrl = data.coverPreview;
        if (data.coverImage) {
            const url = await uploadFile(data.coverImage);
            if (url) coverUrl = toRelativePath(url);
        } else if (coverUrl && (coverUrl.startsWith('http://') || coverUrl.startsWith('https://'))) {
            coverUrl = toRelativePath(coverUrl);
        }

        // 2. Upload Audio
        let audioUrl = data.audioPreview;
        if (data.audioFile) {
            const url = await uploadFile(data.audioFile);
            if (url) audioUrl = toRelativePath(url);
        } else if (audioUrl && (audioUrl.startsWith('http://') || audioUrl.startsWith('https://'))) {
            audioUrl = toRelativePath(audioUrl);
        }

        // 3. Process Slides
        const processedSlides = await Promise.all(currentSlides.map(async (slide) => {
            // Process Free Elements (Images) - always save relative path
            const newFreeElements = await Promise.all(slide.freeElements.map(async (el) => {
                if (el.type === 'image' && el.content && (el.content.startsWith('data:') || el.content.startsWith('blob:'))) {
                    try {
                        const file = await dataURLtoFile(el.content, `slide-${slide.id}-${el.id}.png`);
                        if (file) {
                            const url = await uploadFile(file);
                            if (url) return { ...el, content: toRelativePath(url) };
                        }
                    } catch (e) {
                        console.error("Failed to convert/upload slide image", e);
                    }
                }
                // Normalize existing paths (e.g. from loaded draft with full URL)
                if (el.type === 'image' && el.content && !el.content.startsWith('blob:') && !el.content.startsWith('data:')) {
                    return { ...el, content: toRelativePath(el.content) };
                }
                return el;
            }));

            // Process Slide Audio (relative path)
            let newAudio = slide.audio;
            if (slide.audio && slide.audio.file) {
                try {
                    const url = await uploadFile(slide.audio.file);
                    if (url) {
                        newAudio = {
                            ...slide.audio,
                            url: toRelativePath(url),
                            file: undefined,
                            preview: undefined,
                        }
                    }
                } catch (e) {
                    console.error("Failed to upload slide audio", e);
                }
            } else if (slide.audio?.url && (slide.audio.url.startsWith('http://') || slide.audio.url.startsWith('https://'))) {
                newAudio = { ...slide.audio, url: toRelativePath(slide.audio.url) };
            } else if (slide.audio) {
                newAudio = { ...slide.audio, file: undefined, preview: undefined };
            }

            // Process layout zone content (images in template zones) - always save relative path
            const newContent: Record<string, { type: string; value: string }> = { ...(slide.content || {}) };
            for (const [zoneId, item] of Object.entries(slide.content || {})) {
                if (item?.type === 'image' && item.value) {
                    if (item.value.startsWith('data:') || item.value.startsWith('blob:')) {
                        try {
                            const file = await dataURLtoFile(item.value, `slide-${slide.id}-zone-${zoneId}.png`);
                            if (file) {
                                const url = await uploadFile(file);
                                if (url) newContent[zoneId] = { ...item, value: toRelativePath(url) };
                            }
                        } catch (e) {
                            console.error("Failed to convert/upload zone image", e);
                        }
                    } else {
                        newContent[zoneId] = { ...item, value: toRelativePath(item.value) };
                    }
                }
            }

            return { ...slide, content: newContent, freeElements: newFreeElements, audio: newAudio };
        }));

        const storyPayload = {
            storySubject: data.title || 'Senza Titolo',
            storyType: data.category || 'Generico',
            ageGroup: data.ageGroup || 'Per tutti',
            imageStyle: 'paper_cut',
            creationMode: data.creationMode || 'manual',
            status: status,
            assigned_children: data.assignedChildren || [], // Add assignment
            output: {
                title: data.title,
                coverImage: coverUrl,
                audioUrl: audioUrl,
                slides: processedSlides,
                formData: {
                    ...data,
                    coverImage: undefined,
                    audioFile: undefined,
                    coverPreview: coverUrl,
                    audioPreview: audioUrl
                }
            }
        };

        if (targetId && !String(targetId).startsWith('local_') && String(targetId).length < 13) {
            // UPDATE Existing DB Story
            try {
                await updateStory(targetId, storyPayload);
                toast.success(status === 'published' ? "Storia aggiornata e pubblicata!" : "Bozza aggiornata!");
            } catch (e: any) {
                if (e.response && e.response.status === 404) {
                    // Fallback: If story missing (deleted?), create new
                    console.warn("Story not found, creating new instead.");
                    const res = await saveStory(storyPayload);
                    if (res.data && res.data.id) {
                        setEditingId(res.data.id);
                    }
                    toast.success(status === 'published' ? "Storia pubblicata online!" : "Bozza salvata (nuovo ID)!");
                } else {
                    throw e; // Rethrow other errors
                }
            }
        } else {
            // CREATE New
            const res = await saveStory(storyPayload);
            if (res.data && res.data.id) {
                setEditingId(res.data.id);
            }
            toast.success(status === 'published' ? "Storia pubblicata online!" : "Bozza salvata online!");
        }

        // Navigation Logic
        if (status === 'published' && !overrideId) {
            setCurrentStep(3); // Stay on publish step or go to dashboard
            // Maybe redirect to dashboard?
        }
    };

    const handleSaveDraft = async (slides: Slide[]) => {
        try {
            await saveToBackend('draft', slides);
            // Stay in editor or go to Step 3?
            // Original: setCurrentStep(3);
        } catch (e) {
            console.error("Save Draft Error", e);
            toast.error("Errore nel salvataggio della bozza.");
        }
    };

    const publishStory = (story: SavedStory) => {
        setStoryToPublish(story);
        setPublishModalOpen(true);
    };

    const confirmPublish = async () => {
        if (!storyToPublish) return;

        try {
            await saveToBackend('published', storyToPublish.slides, storyToPublish.formData, storyToPublish.id);
            setView('home');
        } catch (e) {
            console.error("Publish Error", e);
            toast.error("Errore durante la pubblicazione.");
        } finally {
            setPublishModalOpen(false);
            setStoryToPublish(null);
        }
    };

    // Legacy placeholder
    const deleteStory = async (id: string) => {
        if (window.confirm("Sei sicuro di voler cancellare questa storia?")) {
            // await api.deleteStory(id);
            toast.info("Funzionalità eliminazione in sviluppo");
        }
    };


    return (
        <div className={cn("min-h-screen py-10 px-4 md:px-8 font-sans", bgColor)} >

            {/* Header Section */}
            < div className="text-center mb-12 animate-in slide-in-from-top-4 duration-700" >
                <h1 className={cn("text-4xl md:text-6xl font-black uppercase tracking-wide mb-4", textColor)}>
                    Laboratorio delle Fiabe
                </h1>
                <p className={cn("text-lg md:text-xl font-medium opacity-80 max-w-2xl mx-auto", isDarkMode ? "text-indigo-300" : "text-gray-600")}>
                    Dai vita alla tua immaginazione in 3 semplici passi.
                </p>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-4 mt-8" >
                    {
                        [1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 border-2",
                                    currentStep === step
                                        ? (isDarkMode ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "bg-purple-600 border-purple-600 text-white shadow-lg")
                                        : currentStep > step
                                            ? (isDarkMode ? "bg-indigo-900/50 border-indigo-700 text-indigo-400" : "bg-purple-100 border-purple-200 text-purple-600")
                                            : (isDarkMode ? "bg-transparent border-gray-700 text-gray-700" : "bg-transparent border-gray-200 text-gray-300")
                                )}>
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div className={cn(
                                        "w-12 h-1 mx-2 rounded-full",
                                        currentStep > step
                                            ? (isDarkMode ? "bg-indigo-700" : "bg-purple-200")
                                            : (isDarkMode ? "bg-gray-800" : "bg-gray-100")
                                    )} />
                                )}
                            </div>
                        ))
                    }
                </div >
            </div >

            {/* Content Container */}
            < div className="max-w-[1600px] mx-auto pb-20" >

                {/* Step 1 Content */}
                {
                    currentStep === 1 && (
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in zoom-in-95 duration-500">

                            {/* Left Column: Cover Image (4 cols) */}
                            <div className="xl:col-span-4 space-y-6">
                                <div className={cn("p-8 rounded-[2rem] h-full flex flex-col transition-all duration-300", cardBg)}>

                                    {/* Header & Orientation Toggle */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                        <h3 className={cn("text-2xl font-black uppercase", textColor)}>1. Orientamento</h3>

                                        <div className={cn("flex items-center p-1 rounded-xl border", isDarkMode ? "bg-[#2e3048] border-gray-700" : "bg-white border-gray-200")}>
                                            <button
                                                onClick={() => handleOrientationChange('vertical')}
                                                className={cn(
                                                    "p-2 rounded-lg flex items-center gap-2 transition-all",
                                                    formData.coverOrientation === 'vertical'
                                                        ? (isDarkMode ? "bg-indigo-600 text-white shadow-lg" : "bg-purple-600 text-white shadow-lg")
                                                        : "hover:bg-gray-100 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
                                                )}
                                                title="Verticale"
                                            >
                                                <RectangleVertical className="w-5 h-5" />
                                                {formData.coverOrientation === 'vertical' && <Check className="w-3 h-3" />}
                                            </button>
                                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                                            <button
                                                onClick={() => handleOrientationChange('horizontal')}
                                                className={cn(
                                                    "p-2 rounded-lg flex items-center gap-2 transition-all",
                                                    formData.coverOrientation === 'horizontal'
                                                        ? (isDarkMode ? "bg-indigo-600 text-white shadow-lg" : "bg-purple-600 text-white shadow-lg")
                                                        : "hover:bg-gray-100 dark:hover:bg-white/5 opacity-60 hover:opacity-100"
                                                )}
                                                title="Orizzontale"
                                            >
                                                <RectangleHorizontal className="w-5 h-5" />
                                                {formData.coverOrientation === 'horizontal' && <Check className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Upload Area */}
                                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                        <label className={cn(
                                            "relative border-4 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 group overflow-hidden w-full",
                                            isDarkMode ? "border-gray-700 hover:border-indigo-500 hover:bg-white/5" : "border-gray-200 hover:border-purple-400 hover:bg-purple-50",
                                            formData.coverOrientation === 'vertical' ? "aspect-[2/3] max-w-[350px]" : "aspect-[3/2] max-w-full"
                                        )}>
                                            {formData.coverPreview ? (
                                                <img src={getAssetUrl(formData.coverPreview)} alt="Cover Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-6 space-y-4">
                                                    <div className={cn(
                                                        "w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110",
                                                        isDarkMode ? "bg-indigo-900/30 text-indigo-400" : "bg-purple-100 text-purple-500"
                                                    )}>
                                                        <ImageIcon className="w-10 h-10" />
                                                    </div>
                                                    <div>
                                                        <p className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-gray-900")}>Carica Immagine</p>
                                                        <p className={cn("text-sm mt-1 mb-2", isDarkMode ? "text-indigo-300/60" : "text-gray-500")}>PNG, JPG fino a 10MB</p>
                                                        <p className={cn("text-xs font-medium uppercase tracking-wider opacity-70", isDarkMode ? "text-indigo-300" : "text-purple-600")}>
                                                            Formato {formData.coverOrientation === 'vertical' ? 'Verticale' : 'Orizzontale'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <div className="text-center text-white">
                                                    <Upload className="w-10 h-10 mx-auto mb-2" />
                                                    <span className="font-bold">Cambia Immagine</span>
                                                </div>
                                            </div>
                                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>

                                    {/* Book Preview Section */}
                                    <div className="mt-8 border-t border-white/10 pt-8 w-full flex flex-col items-center justify-center">
                                        <h3 className={cn("text-2xl font-black uppercase", textColor)}>Anteprima Libro</h3>
                                        <BookPreview
                                            coverPreview={formData.coverPreview}
                                            coverOrientation={formData.coverOrientation}
                                            title={formData.title}
                                            audioPreview={formData.audioPreview}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Details Form (8 cols) */}
                            <div className="xl:col-span-8 space-y-6">
                                <div className={cn("p-8 rounded-[2rem]", cardBg)}>
                                    <h3 className={cn("text-2xl font-black uppercase mb-6", textColor)}>2. Dettagli Storia</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                        {/* Title */}
                                        <div className="col-span-2">
                                            <label className={cn("text-sm font-bold uppercase tracking-wider mb-2 block ml-1", labelColor)}>Titolo</label>
                                            <Input
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                placeholder="Il titolo della tua fiaba..."
                                                className={cn("h-14 text-lg rounded-2xl px-5 border-2 shadow-sm font-medium", inputBg)}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="col-span-2">
                                            <label className={cn("text-sm font-bold uppercase tracking-wider mb-2 block ml-1", labelColor)}>Descrizione</label>
                                            <Textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                placeholder="Di cosa parla la tua storia?"
                                                className={cn("min-h-[120px] text-lg rounded-2xl p-5 resize-none border-2 shadow-sm font-medium", inputBg)}
                                            />
                                        </div>

                                        {/* Age Group */}
                                        <div className="col-span-2 md:col-span-1">
                                            <label className={cn("text-sm font-bold uppercase tracking-wider mb-2 block ml-1", labelColor)}>Fascia d'età</label>
                                            <div className="relative">
                                                <select
                                                    name="ageGroup"
                                                    value={formData.ageGroup || ""}
                                                    onChange={handleInputChange}
                                                    className={cn("w-full h-14 text-lg rounded-2xl px-5 appearance-none cursor-pointer outline-none border-2 shadow-sm font-medium transition-colors", inputBg)}
                                                >
                                                    <option value="" disabled>Seleziona fascia...</option>
                                                    {AGE_GROUPS.map(age => <option key={age} value={age} className={isDarkMode ? "bg-[#1a1c31]" : "bg-white"}>{age}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                            </div>
                                        </div>

                                        {/* Category */}
                                        <div className="col-span-2 md:col-span-1">
                                            <label className={cn("text-sm font-bold uppercase tracking-wider mb-2 block ml-1", labelColor)}>Categoria</label>
                                            <div className="relative">
                                                <select
                                                    name="category"
                                                    value={formData.category || ""}
                                                    onChange={handleInputChange}
                                                    className={cn("w-full h-14 text-lg rounded-2xl px-5 appearance-none cursor-pointer outline-none border-2 shadow-sm font-medium transition-colors", inputBg)}
                                                >
                                                    <option value="" disabled>Seleziona categoria...</option>
                                                    {CATEGORIES.map(cat => <option key={cat} value={cat} className={isDarkMode ? "bg-[#1a1c31]" : "bg-white"}>{cat}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">▼</div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="col-span-2">
                                            <label className={cn("text-sm font-bold uppercase tracking-wider mb-2 block ml-1", labelColor)}>Tags</label>
                                            <div className={cn("min-h-[3.5rem] rounded-2xl px-3 py-2 flex flex-wrap items-center gap-2 border-2 shadow-sm", inputBg)}>
                                                {formData.tags.map((tag, idx) => (
                                                    <span key={idx} className={cn(
                                                        "px-3 py-1 rounded-xl text-sm font-bold flex items-center gap-1 shadow-sm",
                                                        isDarkMode ? "bg-indigo-600 text-white" : "bg-purple-100 text-purple-700"
                                                    )}>
                                                        {tag}
                                                        <button onClick={() => removeTag(tag)} className="ml-1 opacity-60 hover:opacity-100">×</button>
                                                    </span>
                                                ))}
                                                <input
                                                    type="text"
                                                    value={currentTag}
                                                    onChange={(e) => setCurrentTag(e.target.value)}
                                                    onKeyDown={handleAddTag}
                                                    placeholder={formData.tags.length === 0 ? "Aggiungi tag (invio)..." : ""}
                                                    className="bg-transparent flex-1 border-none outline-none min-w-[150px] p-2 text-lg font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Price */}
                                        {/* <div className="col-span-2 md:col-span-1">
                                        <label className={cn("text-sm font-bold uppercase tracking-wider mb-2 block ml-1", labelColor)}>Prezzo (Gettoni)</label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                                placeholder="0"
                                                min="0"
                                                className={cn("h-14 text-lg rounded-2xl pl-12 border-2 shadow-sm font-medium", inputBg)}
                                            />
                                            <Coins className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" />
                                        </div>
                                    </div> */}


                                        {/* Audio Upload */}
                                        {/* AUDIO SECTION MOVED TO STEP 2 */}

                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Step 2: Editor della Storia */}
                {
                    currentStep === 2 && (
                        <div className="h-full flex flex-col">

                            {/* Mode Selection Screen */}
                            {!formData.creationMode && (
                                <div className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-500">

                                    <div className={cn("max-w-4xl w-full text-center mb-12 p-8 rounded-3xl backdrop-blur-md border", isDarkMode ? "bg-indigo-900/40 border-indigo-500/30 text-white" : "bg-white/60 border-purple-200 text-purple-900")}>
                                        <h2 className="text-3xl font-black uppercase mb-4">Step 2 di 3: Il mio Laboratorio</h2>
                                        <p className="text-lg leading-relaxed opacity-90">
                                            Ora puoi entrare nel <span className="font-bold text-pink-500">Il mio Laboratorio</span> vero e proprio.
                                            Qui potrai creare le slide che comporranno la tua fiaba.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                                        {/* Manual Creation Card */}
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, creationMode: 'manual', selectedLayout: 'two-columns' }))}
                                            className={cn(
                                                "group relative p-10 rounded-[2.5rem] border-2 text-left transition-all duration-300 hover:scale-105 active:scale-95",
                                                isDarkMode
                                                    ? "bg-[#1a1c31] border-indigo-500/30 hover:border-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                                                    : "bg-white border-purple-100 hover:border-pink-400 hover:shadow-xl"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform group-hover:rotate-12",
                                                isDarkMode ? "bg-pink-500/20 text-pink-400" : "bg-pink-100 text-pink-500"
                                            )}>
                                                ✏️
                                            </div>
                                            <h3 className={cn("text-2xl font-black uppercase mb-2", isDarkMode ? "text-white" : "text-purple-900")}>
                                                Crea la tua fiaba!
                                            </h3>
                                            <p className={cn("text-lg", isDarkMode ? "text-indigo-300" : "text-gray-600")}>
                                                Scrivi la storia pagina per pagina, scegliendo layout e immagini manualmente.
                                            </p>
                                        </button>

                                        {/* AI Creation Card */}

                                        <button
                                            onClick={() => setView('ai-discovery')}
                                            className={cn(
                                                "group relative p-10 rounded-[2.5rem] border-2 text-left transition-all duration-300 hover:scale-105 active:scale-95",
                                                isDarkMode
                                                    ? "bg-[#1a1c31] border-indigo-500/30 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]"
                                                    : "bg-white border-purple-100 hover:border-emerald-400 hover:shadow-xl"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 text-3xl transition-transform group-hover:rotate-12",
                                                isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
                                            )}>
                                                🤖
                                            </div>
                                            <h3 className={cn("text-2xl font-black uppercase mb-2", isDarkMode ? "text-white" : "text-purple-900")}>
                                                Crea con IA!
                                            </h3>
                                            <p className={cn("text-lg", isDarkMode ? "text-indigo-300" : "text-gray-600")}>
                                                Lascia che l'Intelligenza Artificiale generi la storia per te in pochi secondi.
                                            </p>
                                            <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500 text-white text-xs font-bold uppercase rounded-full tracking-wide">
                                                1 Gettone
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Editor Canvas */}
                            {(formData.creationMode === 'manual') && (formData.selectedLayout || initialEditorSlides) && (
                                <FableEditor
                                    isDarkMode={isDarkMode}
                                    storyTitle={formData.title}
                                    layout={formData.selectedLayout}
                                    initialSlides={initialEditorSlides}
                                    onSave={handleSaveDraft}
                                    onChange={setLatestSlides}
                                    // Audio Props
                                    audioMode={formData.audioMode || 'global'}
                                    onAudioModeChange={(mode) => setFormData(prev => ({ ...prev, audioMode: mode }))}
                                    globalAudioPreview={formData.audioPreview}
                                    onGlobalAudioUpload={(file) => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setFormData(prev => ({
                                                ...prev,
                                                audioFile: file,
                                                audioPreview: reader.result as string
                                            }));
                                        };
                                        reader.readAsDataURL(file);
                                    }}
                                    onGlobalAudioClear={() => setFormData(prev => ({ ...prev, audioFile: null, audioPreview: null }))}
                                    orientation={formData.coverOrientation}
                                />
                            )}

                            {/* AI Flow (Placeholder) */}
                            {formData.creationMode === 'ai' && (
                                <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8">
                                    <h1 className="text-4xl font-bold text-white mb-4">GENERATORE IA</h1>
                                    <p className="text-white/70">Qui andrà il flusso di generazione con Gemini.</p>
                                    <Button onClick={() => setFormData(prev => ({ ...prev, creationMode: undefined }))} className="mt-4">
                                        Torna alla scelta
                                    </Button>
                                </div>
                            )}

                        </div>
                    )
                }

                {/* Step 3: Conferma e Pubblicazione */}
                {
                    currentStep === 3 && (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500 text-center">
                            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl", isDarkMode ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600")}>
                                <Check className="w-12 h-12" />
                            </div>
                            <h2 className={cn("text-4xl font-black uppercase mb-4", textColor)}>Fantastico!</h2>
                            <p className={cn("text-xl max-w-lg mb-10", isDarkMode ? "text-indigo-200" : "text-gray-600")}>
                                La tua storia è stata salvata come bozza. Cosa vuoi fare adesso?
                            </p>

                            <div className="mb-8 w-full max-w-md bg-white/50 dark:bg-black/20 p-6 rounded-2xl backdrop-blur-sm border border-gray-100 dark:border-white/10">
                                <StoryAssignmentSelector
                                    assignedChildrenIds={formData.assignedChildren || []}
                                    onChange={(ids) => setFormData(prev => ({ ...prev, assignedChildren: ids }))}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                                <Button
                                    size="lg"
                                    onClick={() => setView('home')}
                                    className={cn("px-8 py-6 text-lg rounded-xl shadow-lg border-2", isDarkMode ? "bg-[#2e3048] border-indigo-500/30 hover:border-indigo-500" : "bg-black border-gray-200 hover:border-purple-300 hover:scale-105 active:scale-95 cursor-pointer")}
                                >
                                    <Layout className="w-5 h-5 mr-2" /> Torna alla Dashboard
                                </Button>

                                <Button
                                    size="lg"
                                    onClick={() => publishStory({
                                        id: editingId as string,
                                        formData,
                                        slides: latestSlides.length > 0 ? latestSlides : (initialEditorSlides || []),
                                        createdAt: Date.now(),
                                        updatedAt: Date.now()
                                    })}
                                    className="bg-orange-500 hover:bg-orange-500 text-white px-10 py-6 text-lg rounded-xl shadow-xl shadow-purple-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                >
                                    <Globe className="w-5 h-5 mr-2" /> Pubblica Ora
                                </Button>
                            </div>
                        </div>
                    )
                }


                {/* Footer Navigation (Solo per Step 1 e 2) */}
                {
                    currentStep < 3 && (
                        <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className={cn("text-lg font-medium", isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" /> Indietro
                            </Button>

                            <Button
                                size="lg"
                                onClick={async () => {
                                    if (currentStep === 2) {
                                        const slidesToSave = latestSlides.length > 0 ? latestSlides : (initialEditorSlides || []);
                                        if (slidesToSave.length > 0) {
                                            // Auto-save and move to dashboard
                                            await handleSaveDraft(slidesToSave);
                                            setCurrentStep(3);
                                        } else {
                                            nextStep();
                                        }
                                    } else {
                                        nextStep();
                                    }
                                }}
                                className={cn(
                                    "text-lg font-bold px-10 py-6 rounded-2xl shadow-xl transition-all hover:scale-105",
                                    isDarkMode ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30" : "bg-purple-600 hover:bg-purple-500 shadow-purple-200"
                                )}
                            >
                                Prossimo Step <ArrowRight className="w-6 h-6 ml-2" />
                            </Button>
                        </div>
                    )
                }

            </div >

            {/* PUBLISH CONFIRMATION MODAL */}
            <AlertDialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
                <AlertDialogContent className="rounded-3xl border-2 border-green-100 bg-white dark:bg-[#1a1c31] dark:border-green-900/30">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-green-600 dark:text-green-400">
                            Sei sicuro di voler pubblicare? 🌍
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-300">
                            La tua storia sarà visibile a tutti nella libreria pubblica.
                            Potrai sempre modificarla o riportarla in bozza in seguito.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2">
                        <AlertDialogCancel className="rounded-xl px-6 py-2 text-gray-600 font-bold dark:text-gray-300 dark:hover:bg-white/10">
                            No, aspetta
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmPublish}
                            className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2"
                        >
                            Sì, pubblica ora!
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    )
}

export default Laboratorio;