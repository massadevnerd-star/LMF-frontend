import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MonitorPlay, Pause, Music, X, ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';
import { SlidePreview } from '../../_components/Laboratorio/_components/SlidePreview';
import { Slide } from '../../_components/Laboratorio/_components/FableEditor';

interface ManualStoryViewerProps {
    slides: Slide[];
    storyTitle: string;
    audioPreview?: string | null;
    coverImage?: string | null;
    onClose: () => void;
    audioMode?: 'global' | 'slides';
    orientation?: 'vertical' | 'horizontal';
}

export function ManualStoryViewer({ slides, storyTitle, audioPreview, coverImage, onClose, orientation, audioMode = 'global' }: ManualStoryViewerProps) {
    const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioError, setAudioError] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Determine Canvas Size
    const canvasWidth = orientation === 'vertical' ? 800 : 960;
    const canvasHeight = orientation === 'vertical' ? 1200 : 540;

    // GLOBAL MODE: Calculate linear slide duration
    const globalSlideDuration = audioDuration > 0 && slides.length > 0 ? audioDuration / slides.length : 5;

    // SLIDE MODE: Get current slide audio details
    const currentSlide = slides[previewSlideIndex];
    const slideAudioSrc = currentSlide?.audio?.isDefaultAudio ? audioPreview : (currentSlide?.audio?.url || currentSlide?.audio?.preview);
    // If specific slide audio is set but default is true, we fallback to global (audioPreview).
    // If specific slide audio is set and default is false, we use that.
    // NOTE: In published view, it is mostly 'url'. 'preview' is for local editor.

    // Derived effective source based on mode
    const effectiveAudioSrc = audioMode === 'slides' ? slideAudioSrc : audioPreview;

    if (!slides || slides.length === 0) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-white">
                <p>Nessuna pagina disponibile.</p>
                <Button variant="ghost" onClick={onClose} className="mt-4 text-white">Chiudi</Button>
            </div>
        );
    }

    // Effect: Handle Slide Change in SLIDE MODE
    // Effect: Handle Slide Change in SLIDE MODE
    useEffect(() => {
        if (!isStarted || audioMode !== 'slides' || !audioRef.current) return;

        const currentSlide = slides[previewSlideIndex];
        const isDefault = currentSlide?.audio?.isDefaultAudio;
        // Default to 5s if not set, or use slide duration
        const durationSec = currentSlide?.audio?.duration || 5;

        let timer: NodeJS.Timeout;

        const playSlideAudio = async () => {
            audioRef.current!.pause();
            audioRef.current!.currentTime = 0;

            try {
                // Play audio (whether custom or global default)
                await audioRef.current!.play();
                setIsPlaying(true);
            } catch (e) {
                console.warn("Autoplay failed", e);
                setIsPlaying(false);
            }

            // TIMER LOGIC: If Default Audio, enforce duration
            if (isDefault) {
                timer = setTimeout(() => {
                    if (previewSlideIndex < slides.length - 1) {
                        setPreviewSlideIndex(p => p + 1);
                    }
                }, durationSec * 1000);
            }
        };

        playSlideAudio();

        return () => {
            if (timer) clearTimeout(timer);
        };

    }, [previewSlideIndex, audioMode, effectiveAudioSrc, isStarted, slides]);


    // Handle Audio Ended (Slide Mode -> Auto Advance)
    const handleAudioEnded = () => {
        setIsPlaying(false);
        if (audioMode === 'slides') {
            const currentSlide = slides[previewSlideIndex];
            // Only auto-advance on 'ended' event if it's CUSTOM audio.
            // If it's default audio, we rely on the Timer.
            if (!currentSlide?.audio?.isDefaultAudio) {
                if (previewSlideIndex < slides.length - 1) {
                    setPreviewSlideIndex(p => p + 1);
                }
            }
        }
    };

    // Handle Time Update (Global Mode -> Sync Slides)
    const handleTimeUpdate = () => {
        if (!audioRef.current) return;

        if (audioMode === 'global') {
            const currentTime = audioRef.current.currentTime;
            const targetIndex = Math.floor(currentTime / globalSlideDuration);
            if (targetIndex >= 0 && targetIndex < slides.length && targetIndex !== previewSlideIndex) {
                setPreviewSlideIndex(targetIndex);
            }
        }
    };

    // Reset loop
    useEffect(() => {
        setAudioError(false);
        setIsPlaying(false);
        setIsStarted(false);
        setPreviewSlideIndex(0);
        setAudioDuration(0);
    }, [audioPreview, audioMode]); // Add audioMode dependency

    const handleStart = () => {
        setIsStarted(true);
        // Play handled by useEffect for 'slides' mode when index is 0
        // For 'global', we play immediately
        if (audioMode === 'global' && audioRef.current && effectiveAudioSrc && !audioError) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        } else if (audioMode === 'slides') {
            // Trigger the effect by setting started
        }
    };

    const toggleAudio = () => {
        if (!audioRef.current || audioError) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
        }
    };

    const nextPreviewSlide = () => {
        if (previewSlideIndex < slides.length - 1) {
            setPreviewSlideIndex(prev => prev + 1);
            if (audioMode === 'global' && audioRef.current && globalSlideDuration > 0) {
                audioRef.current.currentTime = (previewSlideIndex + 1) * globalSlideDuration;
            }
        }
    };

    const prevPreviewSlide = () => {
        if (previewSlideIndex > 0) {
            setPreviewSlideIndex(prev => prev - 1);
            if (audioMode === 'global' && audioRef.current && globalSlideDuration > 0) {
                audioRef.current.currentTime = (previewSlideIndex - 1) * globalSlideDuration;
            }
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isStarted) return; // Disable keyboard nav if not started
            if (e.key === 'ArrowRight') nextPreviewSlide();
            if (e.key === 'ArrowLeft') prevPreviewSlide();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [previewSlideIndex, isStarted, onClose, audioMode, globalSlideDuration]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Unique Audio Element */}
            {effectiveAudioSrc && (
                <audio
                    ref={audioRef}
                    src={getAssetUrl(effectiveAudioSrc)}
                    onError={(e) => { console.error("Audio Error", e); setAudioError(true); setIsPlaying(false); }}
                    onLoadedMetadata={(e) => {
                        // In global mode we need duration for calculations
                        if (audioMode === 'global') setAudioDuration(e.currentTarget.duration);
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleAudioEnded}
                    className="hidden"
                />
            )}

            {!isStarted ? (
                // --- COVER VIEW ---
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 animate-in fade-in duration-500">
                    <Button variant="ghost" className="absolute top-6 right-6 text-white" onClick={onClose}>
                        <X className="w-8 h-8" />
                    </Button>

                    <div
                        className="relative w-[300px] h-[450px] md:w-[400px] md:h-[600px] bg-white rounded-lg shadow-2xl cursor-pointer group hover:scale-105 transition-all duration-300"
                        onClick={handleStart}
                    >
                        {/* Book Spine Effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-800 to-transparent z-20 rounded-l-lg opacity-40"></div>

                        {coverImage ? (
                            <img src={getAssetUrl(coverImage)} alt={storyTitle} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-900 text-white p-8 text-center">
                                <h1 className="text-3xl font-serif">{storyTitle}</h1>
                            </div>
                        )}

                        {/* Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all rounded-lg">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-transform shadow-xl">
                                <Play className="w-10 h-10 text-white fill-white ml-2" />
                            </div>
                        </div>
                    </div>

                    <h2 className="mt-8 text-2xl text-white font-serif tracking-wide">{storyTitle}</h2>
                    <p className="text-white/60 mt-2">Clicca sulla copertina per iniziare</p>
                </div>
            ) : (
                // --- SLIDESHOW VIEW ---
                <>
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white z-10">
                        <div className="flex items-center gap-4">
                            <MonitorPlay className="w-6 h-6 text-pink-500" />
                            <h2 className="text-xl font-bold uppercase tracking-widest">{storyTitle}</h2>

                            {/* Audio Controls */}
                            {audioPreview && (
                                <div className="ml-4 flex items-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleAudio}
                                        disabled={audioError}
                                        className={cn(
                                            "rounded-full w-10 h-10 hover:bg-white/20 transition-all",
                                            isPlaying ? "text-pink-400 animate-pulse bg-white/10" : "text-white/70 hover:text-white",
                                            audioError ? "opacity-50 cursor-not-allowed text-red-400" : ""
                                        )}
                                        title={audioError ? "Audio non disponibile" : (isPlaying ? "Pausa" : "Ascolta Audio")}
                                    >
                                        {isPlaying ? <Pause className="w-6 h-6" /> : <Music className="w-6 h-6" />}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
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

                        {/* Slide Display */}
                        <div className="w-full h-full p-12 flex items-center justify-center">
                            {/* Ensure currentSlide exists (it was checked earlier, but let's be safe inside Fragment if tree changed) */}
                            {currentSlide && <SlidePreview slide={currentSlide} fit="contain" width={canvasWidth} height={canvasHeight} />}
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
                </>
            )}
        </div>
    );
}
