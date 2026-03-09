import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, Type, Music, MonitorPlay, Save, Layout as LayoutIcon, X, Upload, Move, Scaling, Bold, Italic, ArrowLeft, ArrowRight, Pause } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";

import { TemplateLayout } from './TemplateSelector';
import { SlideSettings, SlideAudio } from './SlideSettings';
import { StoryAudioSettings, AudioMode } from './StoryAudioSettings';

interface FableEditorProps {
    isDarkMode: boolean;
    storyTitle: string;
    layout?: TemplateLayout;
    initialSlides?: Slide[];
    onSave?: (slides: Slide[]) => void;
    onChange?: (slides: Slide[]) => void;
    // Audio Props
    audioMode?: AudioMode;
    onAudioModeChange?: (mode: AudioMode) => void;
    globalAudioPreview?: string | null;
    onGlobalAudioUpload?: (file: File) => void;
    onGlobalAudioClear?: () => void;
    orientation?: 'vertical' | 'horizontal';
}

export type ContentType = 'text' | 'image' | 'audio';

export interface SlideContentItem {
    type: ContentType;
    value: string; // Text content or Image/Audio URL
}

export interface FreeElement {
    id: string;
    type: 'text' | 'image';
    content: string; // Text content or Image URL
    x: number;
    y: number;
    width: number;
    height: number;
    // Styling
    fontSize?: number;
    fontFamily?: string;
    isBold?: boolean;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
}

export interface Slide {
    id: number;
    title: string;
    layout?: TemplateLayout;
    content: Record<string, SlideContentItem>; // Map zoneId -> Content
    freeElements: FreeElement[];
    audio?: SlideAudio;
}

// Default Constants (exported for compatibility, but used dynamically inside)
export const SLIDE_WIDTH = 960;
export const SLIDE_HEIGHT = 540;

export type { TemplateLayout };

// --- Smart Zone Component (Grid Items) ---
interface SmartZoneProps {
    zoneId: string;
    label: string;
    icon: any;
    allowedTypes?: ContentType[];
    content?: SlideContentItem;
    onUpdate: (value: SlideContentItem | undefined) => void;
    readOnly?: boolean;
}

const SmartZone = ({ zoneId, label, icon: Icon, allowedTypes = ['text', 'image'], content, onUpdate, readOnly = false }: SmartZoneProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editing Text
    const handleTextDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate({ type: 'text', value: e.target.value });
    };

    // Upload Image
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            onUpdate({ type: 'image', value: url });
        }
    };

    const triggerImageUpload = () => {
        if (readOnly) return;
        fileInputRef.current?.click();
    };

    // If Content Exists
    if (content) {
        if (content.type === 'text') {
            if (isEditing && !readOnly) {
                return (
                    <div className="w-full h-full relative group">
                        <Textarea
                            autoFocus
                            value={content.value}
                            onChange={handleTextDataChange}
                            onBlur={() => setIsEditing(false)}
                            className="w-full h-full resize-none border-2 border-indigo-400 bg-white/50 p-4 text-lg rounded-xl focus:ring-0"
                            placeholder="Scrivi qui..."
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
                            className="absolute top-2 right-2 z-10 hover:bg-red-100 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                );
            }
            return (
                <div
                    onClick={() => !readOnly && setIsEditing(true)}
                    className={cn(
                        "w-full h-full p-4 overflow-auto border-2 border-transparent rounded-xl transition-all",
                        !readOnly ? "cursor-text hover:border-gray-200" : ""
                    )}
                >
                    <p className="whitespace-pre-wrap text-lg text-gray-800">{content.value}</p>
                </div>
            )
        }

        if (content.type === 'image') {
            return (
                <div className="w-full h-full relative group rounded-xl overflow-hidden bg-gray-100">
                    <img src={getAssetUrl(content.value)} alt="Slide Content" className="w-full h-full object-cover" />

                    {/* Hover Actions */}
                    {!readOnly && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button variant="secondary" size="sm" onClick={triggerImageUpload}>
                                <Upload className="w-4 h-4 mr-2" /> Cambia
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => onUpdate(undefined)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                </div>
            );
        }
    }

    // Placeholder State
    const handlePlaceholderClick = () => {
        if (readOnly) return;
        if (allowedTypes.length === 1) {
            if (allowedTypes[0] === 'text') setIsEditing(true);
            if (allowedTypes[0] === 'image') triggerImageUpload();
            return;
        }
        if (Icon === Type) setIsEditing(true);
        else if (Icon === ImageIcon) triggerImageUpload();
        else {
            setIsEditing(true);
        }
    };

    return (
        <div
            onClick={handlePlaceholderClick}
            className={cn(
                "w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 transition-colors group relative overflow-hidden",
                !readOnly ? "cursor-pointer hover:bg-gray-100" : ""
            )}
        >
            {Icon && <Icon className="w-8 h-8 mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />}
            <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            {!readOnly && <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        </div>
    );
};


// --- Layout Renderer ---
function RenderSlideLayout({ layout, content, onUpdateZone }: { layout?: TemplateLayout, content: Record<string, SlideContentItem>, onUpdateZone: (zoneId: string, item: SlideContentItem | undefined) => void }) {

    const bind = (zoneId: string, label: string, icon: any, types: ContentType[] = ['text', 'image']) => (
        <SmartZone
            zoneId={zoneId}
            label={label}
            icon={icon}
            allowedTypes={types}
            content={content[zoneId]}
            onUpdate={(item) => onUpdateZone(zoneId, item)}
        />
    );

    switch (layout) {
        case 'two-columns':
            return (
                <div className="grid grid-cols-2 gap-4 w-full h-full p-6">
                    {bind('left', 'Colonna Sinistra', Type, ['text'])}
                    {bind('right', 'Colonna Destra', ImageIcon, ['image'])}
                </div>
            );
        case 'three-rows':
            return (
                <div className="grid grid-rows-3 gap-4 w-full h-full p-6">
                    {bind('top', 'Testo Superiore', Type, ['text'])}
                    {bind('center', 'Contenuto Centrale', ImageIcon, ['image'])}
                    {bind('bottom', 'Testo Inferiore', Type, ['text'])}
                </div>
            );
        case 'two-rows':
            return (
                <div className="grid grid-rows-2 gap-4 w-full h-full p-6">
                    {bind('top', 'Zona Superiore', Type, ['text'])}
                    {bind('bottom', 'Zona Inferiore', ImageIcon, ['text', 'image'])}
                </div>
            );
        case 'full-screen':
            return (
                <div className="relative w-full h-full p-6">
                    {bind('main', 'Area Tutto Schermo', ImageIcon, ['image'])}
                    <div className="absolute bottom-10 left-10 right-10 h-20 bg-white/90 p-2 rounded-xl border shadow-sm backdrop-blur-sm z-10">
                        {bind('caption', 'Didascalia (Opzionale)', Type, ['text'])}
                    </div>
                </div>
            );
        case 'three-columns':
            return (
                <div className="grid grid-cols-3 gap-4 w-full h-full p-6">
                    {bind('left', 'Sinistra', Type, ['text'])}
                    {bind('center', 'Centro', ImageIcon, ['image', 'text'])}
                    {bind('right', 'Destra', Type, ['text'])}
                </div>
            );
        case 'empty':
        default:
            return (
                <div className="w-full h-full p-6 flex items-center justify-center pointer-events-none">
                    <div className="text-center opacity-30">
                        <LayoutIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm font-medium text-gray-400">Layout Vuoto</p>
                    </div>
                </div>
            );
    }
}

// --- READ-ONLY Slide Renderer for Preview/Thumbnail ---
// This component automatically scales the fixed-resolution slide content to fit its parent container
function SlidePreview({ slide, fit = 'contain', width, height }: { slide: Slide, fit?: 'contain' | 'cover', width: number, height: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const parentW = parent.clientWidth;
                    const parentH = parent.clientHeight;

                    // Simple logic: Fit width currently, assuming 16:9 everywhere.
                    // For more robustness:
                    const scaleW = parentW / width;
                    const scaleH = parentH / height;

                    setScale(fit === 'contain' ? Math.min(scaleW, scaleH) : Math.max(scaleW, scaleH));
                }
            }
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        if (containerRef.current?.parentElement) {
            observer.observe(containerRef.current.parentElement);
        }
        window.addEventListener('resize', updateScale);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateScale);
        };
    }, [fit, width, height]);

    return (
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <div
                ref={containerRef}
                style={{
                    width: width,
                    height: height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center'
                }}
                className="relative bg-white shadow-sm shrink-0"
            >
                {/* 1. Layout Content */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <RenderSlideLayout
                        layout={slide.layout}
                        content={slide.content}
                        onUpdateZone={() => { }}
                    />
                </div>

                {/* 2. Free Floating Elements */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {slide.freeElements.map(el => (
                        <div
                            key={el.id}
                            style={{
                                left: el.x,
                                top: el.y,
                                width: el.width,
                                height: el.height
                            }}
                            className="absolute"
                        >
                            <div className="w-full h-full p-2 relative flex flex-col justify-start">
                                {el.type === 'text' ? (
                                    <p
                                        style={{
                                            fontFamily: el.fontFamily || 'sans-serif',
                                            fontSize: `${el.fontSize || 20}px`,
                                            fontWeight: el.isBold ? 'bold' : 'normal',
                                            whiteSpace: 'pre-wrap'
                                        }}
                                        className="leading-tight break-words"
                                    >
                                        {el.content}
                                    </p>
                                ) : (
                                    <div className="w-full h-full relative overflow-hidden rounded-lg">
                                        {el.content && (
                                            <img src={getAssetUrl(el.content)} alt="Element" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

type InteractionMode = 'idle' | 'move' | 'resize';

interface InteractionState {
    mode: InteractionMode;
    elementId: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    userScale: number; // The scale at which interaction started
}


const FableEditor: React.FC<FableEditorProps> = ({
    isDarkMode,
    storyTitle,
    layout = 'two-columns',
    initialSlides,
    onSave,
    onChange,
    // Audio
    audioMode = 'global',
    onAudioModeChange,
    globalAudioPreview,
    onGlobalAudioUpload,
    onGlobalAudioClear,
    orientation = 'vertical'
}) => {
    const [slides, setSlides] = useState<Slide[]>(initialSlides || [
        { id: 1, title: "Pagina 1", layout: layout || 'empty', content: {}, freeElements: [] }
    ]);
    const [currentSlideId, setCurrentSlideId] = useState<number>(initialSlides?.[0]?.id || 1);

    // Dynamic Dimensions based on orientation
    // Default to Vertical (now 800x1200) if undefined for backward compatibility? Or keep logic.
    // User requested "larger container" for vertical.
    // Horizontal: 960x540 (16:9)
    // Vertical: 800x1200 (2:3) - Increased from 640x900
    const canvasWidth = orientation === 'horizontal' ? 960 : 800;
    const canvasHeight = orientation === 'horizontal' ? 540 : 1200;

    // Interaction State
    const [interaction, setInteraction] = useState<InteractionState>({
        mode: 'idle',
        elementId: null,
        startX: 0,
        startY: 0,
        initialX: 0,
        initialY: 0,
        initialWidth: 0,
        initialHeight: 0,
        userScale: 1
    });

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewSlideIndex, setPreviewSlideIndex] = useState(0);

    // Audio Preview Logic
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);

    // Sync Slides with Audio
    const handleTimeUpdate = () => {
        if (audioRef.current && audioDuration > 0 && slides.length > 0) {
            const currentTime = audioRef.current.currentTime;
            const slideDuration = audioDuration / slides.length;
            // Calculate target index based on percentage completion to handle any duration
            const targetIndex = Math.floor(currentTime / slideDuration);

            // Only update if changed and within bounds
            if (targetIndex !== previewSlideIndex && targetIndex < slides.length) {
                setPreviewSlideIndex(targetIndex);
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            const duration = audioRef.current.duration;
            if (!isNaN(duration) && duration !== Infinity) {
                setAudioDuration(duration);
            }
        }
    };

    // Auto-Advance Logic (Preview)
    useEffect(() => {
        if (!isPreviewOpen) {
            setIsPlaying(false);
            setAudioDuration(0);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            return;
        }

        // Global Mode
        if (audioMode === 'global') {
            if (globalAudioPreview && audioRef.current) {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => setIsPlaying(true)).catch(() => console.log("Auto-play prevented"));
                }
            }
        }
        // Slide Mode
        else if (audioMode === 'slides') {
            const currentSlide = slides[previewSlideIndex];
            const slideDuration = (currentSlide?.audio?.duration || 5) * 1000;
            const hasAudio = !!(currentSlide?.audio?.preview || currentSlide?.audio?.url);

            // Play Slide Audio
            if (hasAudio && audioRef.current) {
                audioRef.current.currentTime = 0;
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => setIsPlaying(true)).catch(e => console.log("Slide play prevented", e));
                }
            }

            // Set Timer for auto-advance based on Duration (Master Clock)
            const timer = setTimeout(() => {
                if (previewSlideIndex < slides.length - 1) {
                    setPreviewSlideIndex(prev => prev + 1);
                } else {
                    // End of story
                    setIsPlaying(false);
                }
            }, slideDuration);

            return () => {
                clearTimeout(timer);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
            }
        }

    }, [isPreviewOpen, audioMode, globalAudioPreview, previewSlideIndex]);

    const toggleAudio = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const canvasRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [editorScale, setEditorScale] = useState(1);

    const activeSlide = slides.find(s => s.id === currentSlideId) || slides[0];

    // Sync to Parent
    useEffect(() => {
        if (onChange) {
            onChange(slides);
        }
    }, [slides, onChange]);

    // Styles
    const toolbarBg = isDarkMode ? 'bg-[#2e3048] border-indigo-500/30' : 'bg-white border-purple-200';
    const canvasBg = isDarkMode ? 'bg-[#1a1c31]' : 'bg-gray-100';
    const slideItemBg = isDarkMode ? 'bg-[#2e3048] hover:bg-[#383b5c]' : 'bg-white hover:bg-gray-50';
    const activeSlideBorder = isDarkMode ? 'border-pink-500' : 'border-purple-500';

    // Auto-scale editor canvas
    useLayoutEffect(() => {
        const handleResize = () => {
            if (wrapperRef.current) {
                const availableWidth = wrapperRef.current.clientWidth - 80; // Padding
                const availableHeight = wrapperRef.current.clientHeight - 80;

                const scaleW = availableWidth / canvasWidth;
                const scaleH = availableHeight / canvasHeight;

                // Fit into available space
                setEditorScale(Math.min(scaleW, scaleH, 1.2)); // Cap at 1.2x zoom
            }
        };

        handleResize();
        const observer = new ResizeObserver(handleResize);
        if (wrapperRef.current) observer.observe(wrapperRef.current);

        return () => observer.disconnect();
    }, [canvasWidth, canvasHeight]);

    const addSlide = () => {
        const newId = Math.max(...slides.map(s => s.id)) + 1;
        setSlides([...slides, {
            id: newId,
            title: `Pagina ${newId}`,
            layout: layout || 'empty',
            content: {},
            freeElements: [],
            audio: { duration: 5, isDefaultAudio: true }
        }]);
        setCurrentSlideId(newId);
    };

    const deleteSlide = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (slides.length <= 1) return;

        const newSlides = slides.filter(s => s.id !== id);
        setSlides(newSlides);

        // If we deleted the current slide, switch to another one
        if (currentSlideId === id) {
            // Try to go to previous index, or 0
            const deletedIndex = slides.findIndex(s => s.id === id);
            const newIndex = Math.max(0, deletedIndex - 1);
            if (newSlides[newIndex]) {
                setCurrentSlideId(newSlides[newIndex].id);
            }
        }
    };

    const updateZoneContent = (slideId: number, zoneId: string, item: SlideContentItem | undefined) => {
        setSlides(prev => prev.map(slide => {
            if (slide.id === slideId) {
                const newContent = { ...slide.content };
                if (item) {
                    newContent[zoneId] = item;
                } else {
                    delete newContent[zoneId];
                }
                return { ...slide, content: newContent };
            }
            return slide;
        }));
    };

    const addFreeText = () => {
        // "padding proporzionato"
        const pY = 20;
        const pX = 20;
        let dX = pX;
        let dY = pY;
        let dW = canvasWidth - (pX * 2);
        let dH = canvasHeight - (pY * 2);

        if (activeSlide.layout === 'two-columns') {
            dW = (canvasWidth / 2) - (pX * 2);

            // Smart Placement: Check default Left zone
            const center = canvasWidth / 2;
            const hasLeftElement = (activeSlide.freeElements || []).some(el => (el.x + el.width / 2) < center);

            if (hasLeftElement) {
                // Determine layout for Right side
                dX = center + pX;
            } else {
                dX = pX;
            }
        }

        const newElement: FreeElement = {
            id: Date.now().toString(),
            type: 'text',
            content: "Nuovo Testo",
            x: dX,
            y: dY,
            width: dW,
            height: dH,
            fontSize: 20,
            fontFamily: 'sans-serif',
            isBold: false
        };

        setSlides(prev => prev.map(slide => {
            if (slide.id === currentSlideId) {
                const currentElements = slide.freeElements || [];
                return { ...slide, freeElements: [...currentElements, newElement] };
            }
            return slide;
        }));
        setSelectedId(newElement.id);
    };

    const addFreeImage = () => {
        const pY = 20;
        const pX = 20;
        let dX = pX;
        let dY = pY;
        let dW = canvasWidth - (pX * 2);
        let dH = canvasHeight - (pY * 2);

        if (activeSlide.layout === 'two-columns') {
            dW = (canvasWidth / 2) - (pX * 2);

            // Smart Placement for Image
            const center = canvasWidth / 2;
            const hasLeftElement = (activeSlide.freeElements || []).some(el => (el.x + el.width / 2) < center);

            if (hasLeftElement) {
                dX = center + pX;
            } else {
                dX = pX;
            }
        }

        const newElement: FreeElement = {
            id: Date.now().toString(),
            type: 'image',
            content: "", // Empty initially, usage placeholder
            x: dX,
            y: dY,
            width: dW,
            height: dH,
        };

        setSlides(prev => prev.map(slide => {
            if (slide.id === currentSlideId) {
                const currentElements = slide.freeElements || [];
                return { ...slide, freeElements: [...currentElements, newElement] };
            }
            return slide;
        }));
        setSelectedId(newElement.id);
    }

    const updateFreeElement = (elementId: string, updates: Partial<FreeElement>) => {
        setSlides(prev => prev.map(slide => {
            if (slide.id === currentSlideId) {
                return {
                    ...slide,
                    freeElements: (slide.freeElements || []).map(el => el.id === elementId ? { ...el, ...updates } : el)
                };
            }
            return slide;
        }));
    };

    const deleteFreeElement = (elementId: string) => {
        setSlides(prev => prev.map(slide => {
            if (slide.id === currentSlideId) {
                return {
                    ...slide,
                    freeElements: (slide.freeElements || []).filter(el => el.id !== elementId)
                };
            }
            return slide;
        }));
        if (selectedId === elementId) setSelectedId(null);
    }

    // --- Interaction Handlers ---
    const handleMouseDown = (e: React.MouseEvent, elementId: string, mode: InteractionMode, element: FreeElement) => {
        e.stopPropagation();

        if (mode === 'resize' || mode === 'move') {
            e.preventDefault();
        }

        setSelectedId(elementId);

        if (canvasRef.current) {
            setInteraction({
                mode: mode,
                elementId: elementId,
                startX: e.clientX,
                startY: e.clientY,
                initialX: element.x,
                initialY: element.y,
                initialWidth: element.width,
                initialHeight: element.height,
                userScale: editorScale // Capture current scale to normalize delta
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (interaction.mode !== 'idle' && interaction.elementId) {
            e.preventDefault();

            // Normalize delta by scale
            const deltaX = (e.clientX - interaction.startX) / interaction.userScale;
            const deltaY = (e.clientY - interaction.startY) / interaction.userScale;

            if (interaction.mode === 'move') {
                let newX = interaction.initialX + deltaX;
                let newY = interaction.initialY + deltaY;

                // Common Vertical Constraints (Top/Bottom Padding)
                const padding = 20;
                const elHeight = interaction.initialHeight;
                const elWidth = interaction.initialWidth;
                const minY = padding;
                const maxY = canvasHeight - padding - elHeight;
                const minX = padding;
                const maxX = canvasWidth - padding - elWidth;

                newY = Math.max(newY, minY);
                newY = Math.min(newY, maxY);
                newX = Math.max(newX, minX);
                newX = Math.min(newX, maxX);

                // SWAP LOGIC
                let swaps: Record<string, number> = {};
                if (activeSlide.layout === 'two-columns') {
                    const center = canvasWidth / 2;
                    const myCenter = newX + elWidth / 2;
                    const myZone = myCenter < center ? 'left' : 'right';

                    // Find first element that is NOT me, and check its zone
                    const others = (activeSlide.freeElements || []).filter(el => el.id !== interaction.elementId);

                    for (const other of others) {
                        const otherCenter = other.x + other.width / 2;
                        const otherZone = otherCenter < center ? 'left' : 'right';

                        // If overlap in zones, force swap
                        if (myZone === otherZone) {
                            const targetX = myZone === 'left'
                                ? center + padding // Move To Right
                                : padding;         // Move To Left
                            swaps[other.id] = targetX;
                            // We only handle one swap at a time ideally, but this loop covers multiples if needed
                        }
                    }
                }

                // Apply Updates (Me + Swaps)
                setSlides(prev => prev.map(slide => {
                    if (slide.id === currentSlideId) {
                        const newFreeElements = (slide.freeElements || []).map(el => {
                            if (el.id === interaction.elementId) {
                                return { ...el, x: newX, y: newY };
                            }
                            if (swaps[el.id] !== undefined) {
                                return { ...el, x: swaps[el.id] };
                            }
                            return el;
                        });
                        return { ...slide, freeElements: newFreeElements };
                    }
                    return slide;
                }));

            } else if (interaction.mode === 'resize') {
                let newWidth = Math.max(50, interaction.initialWidth + deltaX);
                let newHeight = Math.max(50, interaction.initialHeight + deltaY);
                const padding = 20;

                // Vertical Constraint for Resize (Bottom Padding)
                const maxContentHeight = (canvasHeight - padding) - interaction.initialY;
                newHeight = Math.min(newHeight, maxContentHeight);

                // Constraint for Resize in Two-Columns
                if (activeSlide.layout === 'two-columns') {
                    const slideCenter = canvasWidth / 2;
                    const gapHalf = 15;
                    const padding = 20;

                    // If element starts on Left, max width is limited by gap
                    if (interaction.initialX < slideCenter) {
                        const maxWidth = (slideCenter - gapHalf) - interaction.initialX;
                        newWidth = Math.min(newWidth, maxWidth);
                    } else {
                        // If element starts on Right, max width is limited by Slide Width - Padding
                        const maxWidth = (canvasWidth - padding) - interaction.initialX;
                        newWidth = Math.min(newWidth, maxWidth);
                    }
                }

                updateFreeElement(interaction.elementId, {
                    width: newWidth,
                    height: newHeight
                });
            }
        }
    };

    const handleMouseUp = () => {
        setInteraction(prev => ({ ...prev, mode: 'idle', elementId: null }));
    };

    const handleCanvasClick = () => {
        setSelectedId(null);
    }

    // Handle Image Upload for Free Element
    const handleFreeImageUpload = (e: React.ChangeEvent<HTMLInputElement>, elementId: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            updateFreeElement(elementId, { content: url });
        }
    }

    const openPreview = () => {
        setPreviewSlideIndex(0);
        setIsPreviewOpen(true);
    };

    const nextPreviewSlide = () => {
        setPreviewSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
    };

    const prevPreviewSlide = () => {
        setPreviewSlideIndex(prev => Math.max(prev - 1, 0));
    };

    const safeFreeElements = activeSlide?.freeElements || [];

    return (
        <div
            className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-300 relative"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
        >
            {/* FULL SCREEN PREVIEW OVERLAY */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="absolute top-10 left-0 right-0 p-6 flex justify-between items-center text-white z-10">
                        <div className="flex items-center gap-4">
                            <MonitorPlay className="w-6 h-6 text-pink-500" />
                            <h2 className="text-xl font-bold uppercase tracking-widest">{storyTitle || "Anteprima Storia"}</h2>

                            {/* Audio Controls - PREVIEW */}
                            {/* Global Audio */}
                            {audioMode === 'global' && globalAudioPreview && (
                                <div className="ml-4 flex items-center">
                                    <audio
                                        ref={audioRef}
                                        src={getAssetUrl(globalAudioPreview)}
                                        loop={false} // Don't loop by default to respect end of story? Or loop story? User said 'divide duration', implying 1-1 mapping.
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        className="hidden"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleAudio}
                                        className={cn(
                                            "rounded-full w-10 h-10 hover:bg-white/20 transition-all",
                                            isPlaying ? "text-pink-400 animate-pulse bg-white/10" : "text-white/70 hover:text-white"
                                        )}
                                        title={isPlaying ? "Pausa" : "Ascolta Sottofondo"}
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                                    </Button>
                                </div>
                            )}

                            {/* Slide Audio (Dynamic) */}
                            {audioMode === 'slides' && (
                                <div className="ml-4 flex items-center">
                                    <audio
                                        ref={audioRef}
                                        key={previewSlideIndex}
                                        src={getAssetUrl(slides[previewSlideIndex]?.audio?.preview || slides[previewSlideIndex]?.audio?.url || '')}
                                        loop={false}
                                        autoPlay={true} // Auto play on slide change in preview
                                        className="hidden"
                                    />
                                    {/* We don't necessarily need a play button for slide audio if it auto plays, 
                                         but good to have status. 
                                         Since ref is same, toggleAudio works if we attach refs correctly.
                                      */}
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsPreviewOpen(false)}
                            className="text-white hover:bg-white/20 rounded-full w-12 h-12"
                        >
                            <X className="w-8 h-8" />
                        </Button>
                    </div>

                    {/* Preview Content */}
                    <div className="w-full h-full flex items-center justify-center p-4">
                        {/* Nav Buttons */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={prevPreviewSlide}
                                disabled={previewSlideIndex === 0}
                                className="w-14 h-14 rounded-full shadow-2xl bg-white/10 hover:bg-white/30 text-white disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-md"
                            >
                                <ArrowLeft className="w-8 h-8" />
                            </Button>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={nextPreviewSlide}
                                disabled={previewSlideIndex === slides.length - 1}
                                className="w-14 h-14 rounded-full shadow-2xl bg-white/10 hover:bg-white/30 text-white disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-md"
                            >
                                <ArrowRight className="w-8 h-8" />
                            </Button>
                        </div>

                        <div className="w-full h-full p-12 flex items-center justify-center">
                            <SlidePreview slide={slides[previewSlideIndex]} fit="contain" width={canvasWidth} height={canvasHeight} />
                        </div>
                    </div>

                    {/* Footer / Progress */}
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-2">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-all duration-300",
                                    idx === previewSlideIndex ? "bg-pink-500 scale-125" : "bg-white/30"
                                )}
                            />
                        ))}
                    </div>

                </div>
            )}


            {/* Top Toolbar */}
            <div className={cn("h-16 flex items-center justify-between px-6 border-b shrink-0", toolbarBg)}>
                <div className="flex items-center gap-4">
                    <span className="font-bold opacity-70 uppercase tracking-widest text-xs">Strumenti:</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-pink-500 hover:bg-pink-500/10"
                        title="Aggiungi Testo"
                        onClick={addFreeText}
                    >
                        <Type className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-500 hover:bg-blue-500/10"
                        title="Aggiungi Immagine"
                        onClick={addFreeImage}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </Button>
                    <StoryAudioSettings
                        audioMode={audioMode}
                        onModeChange={onAudioModeChange || (() => { })}
                        globalAudioPreview={globalAudioPreview}
                        onGlobalAudioUpload={onGlobalAudioUpload || (() => { })}
                        onGlobalAudioClear={onGlobalAudioClear || (() => { })}
                    />

                    {audioMode === 'slides' && (
                        <SlideSettings
                            audio={activeSlide.audio}
                            onUpdate={(newAudio) => {
                                setSlides(prev => prev.map(s => s.id === activeSlide.id ? { ...s, audio: newAudio } : s));
                            }}
                            defaultAudioPreview={null}
                        />
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => onSave && onSave(slides)}
                    >
                        <Save className="w-4 h-4" />
                        Salva Bozza
                    </Button>
                    <Button
                        size="sm"
                        onClick={openPreview}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 gap-2"
                    >
                        <MonitorPlay className="w-4 h-4" />
                        Anteprima
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left/Top: Slide Strip */}
                <div className={cn("w-full md:w-48 flex flex-row md:flex-col border-b md:border-b-0 md:border-r overflow-x-auto md:overflow-y-auto p-4 gap-4 shrink-0", toolbarBg)}>
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            onClick={() => setCurrentSlideId(slide.id)}
                            className={cn(
                                "w-32 md:w-auto shrink-0 aspect-video rounded-lg border-2 cursor-pointer relative group transition-all p-2 flex items-center justify-center text-xs text-center select-none overflow-hidden",
                                slide.id === currentSlideId ? activeSlideBorder : "border-transparent opacity-60 hover:opacity-100",
                                slideItemBg
                            )}
                        >
                            <span className="absolute top-1 left-2 text-[10px] font-bold opacity-50 z-10 bg-white/50 px-1 rounded">{index + 1}</span>
                            <div className="w-full h-full pointer-events-none flex items-center justify-center">
                                {/* Thumbnail */}
                                <SlidePreview slide={slide} fit="contain" width={canvasWidth} height={canvasHeight} />
                            </div>

                            {/* Delete Button (Hover) */}
                            {slides.length > 1 && (
                                <button
                                    onClick={(e) => deleteSlide(e, slide.id)}
                                    className="absolute top-1 right-1 p-1 rounded-sm bg-red-500 text-white opacity-0 group-hover:opacity-100 md:opacity-0 transition-opacity z-20 hover:bg-red-600"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={addSlide}
                        className={cn("w-32 md:w-auto shrink-0 aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 opacity-50 hover:opacity-100 transition-all", isDarkMode ? "border-gray-700 hover:border-gray-500" : "border-gray-300 hover:border-gray-400")}
                    >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase">Nuova</span>
                    </button>
                </div>

                {/* Center: Canvas */}
                <div ref={wrapperRef} className={cn("flex-1 p-10 flex items-center justify-center overflow-auto relative select-none", canvasBg)}>

                    {/* The Slide "Piece of Paper" - FIXED RESOLUTION + SCALE */}
                    <div
                        ref={canvasRef}
                        onMouseDown={handleCanvasClick}
                        style={{
                            width: canvasWidth,
                            height: canvasHeight,
                            transform: `scale(${editorScale})`,
                            // Ensure centering when scaled
                        }}
                        className="bg-white shadow-2xl rounded-sm relative transition-transform duration-75 origin-center shrink-0"
                    >
                        {/* 1. Underlying Template Layout */}
                        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                            <RenderSlideLayout
                                layout={activeSlide.layout}
                                content={activeSlide.content}
                                onUpdateZone={(zoneId, item) => updateZoneContent(activeSlide.id, zoneId, item)}
                            />
                        </div>

                        {/* 2. Free Floating Elements Layer */}
                        <div className="absolute inset-0 z-10">
                            {safeFreeElements.map(el => {
                                const isSelected = selectedId === el.id;

                                return (
                                    <div
                                        key={el.id}
                                        onMouseDown={(e) => handleMouseDown(e, el.id, 'move', el)}
                                        style={{
                                            left: el.x,
                                            top: el.y,
                                            width: el.width,
                                            height: el.height
                                        }}
                                        className={cn(
                                            "absolute cursor-move group p-2 transition-opacity",
                                            isSelected || interaction.elementId === el.id ? "z-50 opacity-100" : "z-20 hover:z-30 opacity-90"
                                        )}
                                    >
                                        {/* FLOATING TOOLBAR for selected element */}
                                        {isSelected && el.type === 'text' && (
                                            <div
                                                className="absolute -top-12 left-0 flex items-center gap-1 bg-black/80 p-1.5 rounded-lg backdrop-blur-md shadow-xl text-white z-[60] animate-in fade-in slide-in-from-bottom-2"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                style={{ transform: `scale(${1 / editorScale})`, transformOrigin: 'bottom left' }} // Counter-scale toolbar? Optional, keeps it readable
                                            >
                                                <select
                                                    className="bg-transparent text-xs border border-white/20 rounded px-1 py-1 outline-none cursor-pointer hover:bg-white/10"
                                                    value={el.fontFamily || 'sans-serif'}
                                                    onChange={(e) => updateFreeElement(el.id, { fontFamily: e.target.value })}
                                                >
                                                    <option value="sans-serif">Sans Serif</option>
                                                    <option value="serif">Serif</option>
                                                    <option value="monospace">Mono</option>
                                                    <option value="'Comic Sans MS', cursive">Comic</option>
                                                </select>

                                                <div className="h-4 w-px bg-white/20 mx-1" />

                                                <button
                                                    className="hover:bg-white/20 p-1 rounded transition-colors"
                                                    onClick={() => updateFreeElement(el.id, { fontSize: Math.max(10, (el.fontSize || 20) - 2) })}
                                                >
                                                    <span className="text-xs font-bold">-</span>
                                                </button>
                                                <span className="text-xs w-6 text-center">{el.fontSize || 20}</span>
                                                <button
                                                    className="hover:bg-white/20 p-1 rounded transition-colors"
                                                    onClick={() => updateFreeElement(el.id, { fontSize: (el.fontSize || 20) + 2 })}
                                                >
                                                    <span className="text-xs font-bold">+</span>
                                                </button>

                                                <div className="h-4 w-px bg-white/20 mx-1" />

                                                <button
                                                    className={cn("p-1 rounded transition-colors", el.isBold ? "bg-white text-black" : "hover:bg-white/20")}
                                                    onClick={() => updateFreeElement(el.id, { isBold: !el.isBold })}
                                                >
                                                    <Bold className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        <div className={cn(
                                            "w-full h-full p-2 rounded-xl transition-all shadow-sm relative flex flex-col",
                                            "bg-white/80 backdrop-blur-sm",
                                            isSelected ? "border-2 border-blue-500 shadow-lg" : "border-2 border-dashed border-gray-400/50 hover:border-blue-400"
                                        )}>
                                            {/* CONTENT: Text vs Image */}
                                            {el.type === 'text' ? (
                                                <Textarea
                                                    value={el.content}
                                                    onChange={(e) => updateFreeElement(el.id, { content: e.target.value })}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    className="w-full h-full resize-none bg-transparent border-none text-black p-0 focus:ring-0 shadow-none overflow-hidden leading-tight"
                                                    style={{
                                                        fontFamily: el.fontFamily || 'sans-serif',
                                                        fontSize: `${el.fontSize || 20}px`,
                                                        fontWeight: el.isBold ? 'bold' : 'normal'
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center group/image">
                                                    {el.content ? (
                                                        <>
                                                            <img src={getAssetUrl(el.content)} alt="Element" className="w-full h-full object-cover pointer-events-none" />
                                                            {/* Change Image Button */}
                                                            {isSelected && (
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity">
                                                                    <Button variant="secondary" size="sm" className="pointer-events-auto" onClick={() => document.getElementById(`file-${el.id}`)?.click()}>
                                                                        <Upload className="w-4 h-4 mr-2" /> Cambia
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div
                                                            className="flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
                                                            onClick={() => document.getElementById(`file-${el.id}`)?.click()}
                                                        >
                                                            <ImageIcon className="w-8 h-8 mb-2" />
                                                            <span className="text-xs font-bold uppercase">Carica Faoto</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        id={`file-${el.id}`}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFreeImageUpload(e, el.id)}
                                                    />
                                                </div>
                                            )}

                                            {/* Delete Handle */}
                                            {isSelected && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteFreeElement(el.id); }}
                                                    className="absolute -top-3 -right-3 p-1.5 rounded-full bg-red-500 text-white hover:scale-110 transition-all shadow-md z-50"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}

                                            {/* Drag Handle Icon (Visual Cue) */}
                                            {isSelected && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-blue-500 bg-white/80 rounded-full p-1 shadow-sm">
                                                    <Move className="w-3 h-3" />
                                                </div>
                                            )}

                                            {/* RESIZE HANDLE */}
                                            <div
                                                onMouseDown={(e) => handleMouseDown(e, el.id, 'resize', el)}
                                                className={cn(
                                                    "absolute -bottom-3 -right-3 p-1 rounded-full bg-blue-500 text-white cursor-se-resize transition-opacity z-50 hover:scale-110 shadow-sm",
                                                    isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                                )}
                                            >
                                                <Scaling className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default FableEditor;
