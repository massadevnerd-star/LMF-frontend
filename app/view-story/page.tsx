'use client'
import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/app/lib/api'
import { Button } from '@/components/ui/button'
import StoryBook from './_components/StoryBook';
import MainLayout from '@/app/_components/MainLayout';

import { ManualStoryViewer } from './_components/ManualStoryViewer';

function ViewStoryContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const [story, setStory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [selectedLang, setSelectedLang] = useState('it');

    useEffect(() => {
        if (!id) return;

        const fetchStory = async () => {
            try {
                const response = await api.get(`/api/auth/stories/${id}`);
                setStory(response.data);
            } catch (err: any) {
                console.error("Error fetching story:", err);
                setError("Impossibile caricare la storia. Assicurati di essere loggato.");
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [id]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const handleSetView = (view: any) => {
        router.push('/');
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-purple-50">
            <div className="text-2xl font-bold text-purple-600 animate-pulse">Caricamento Magico...</div>
        </div>;
    }

    if (error) {
        return <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-4">
            <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
            <Button onClick={() => router.push('/')}>Torna alla Home</Button>
        </div>;
    }

    if (!story) return null;

    // Determine Mode
    let storyData: any = {};
    try {
        storyData = typeof story.output === 'string' ? JSON.parse(story.output) : story.output;
    } catch (e) {
        console.error("Parse error", e);
    }

    const translations = storyData.translations || {};
    const availableLangs = ['it', ...Object.keys(translations)];
    const effectiveStoryData = selectedLang === 'it' ? storyData : translations[selectedLang];

    // Check creationMode (either in DB column or inside JSON)
    const creationMode = story.creation_mode || storyData.creationMode || storyData.formData?.creationMode;
    const isManual = creationMode === 'manual';

    const renderLanguageSwitcher = () => {
        if (availableLangs.length <= 1) return null;
        return (
            <div className="fixed top-6 right-20 z-[110] flex gap-2">
                {availableLangs.map(lang => (
                    <button
                        key={lang}
                        onClick={() => setSelectedLang(lang)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold uppercase border-2 transition-all ${
                            selectedLang === lang 
                                ? 'bg-indigo-500 text-white border-indigo-500 scale-110 shadow-lg' 
                                : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20 backdrop-blur-md'
                        }`}
                        title={`Cambia lingua in ${lang}`}
                    >
                        {lang}
                    </button>
                ))}
            </div>
        );
    };

    if (isManual) {
        // Prepare Manual Data
        let slides = storyData.slides || storyData.chapters || [];
        
        if (selectedLang !== 'it' && effectiveStoryData.slides) {
            slides = slides.map((originalSlide: any, index: number) => {
                const transSlide = effectiveStoryData.slides[index];
                if (!transSlide) return originalSlide;

                return {
                    ...originalSlide,
                    // If audioUrl exists from translation, override slide audio and force custom mode
                    audio: transSlide.audioUrl ? { url: transSlide.audioUrl, isDefaultAudio: false, duration: 15 } : originalSlide.audio,
                    freeElements: transSlide.freeElements || originalSlide.freeElements
                };
            });
        }

        const title = effectiveStoryData.title || storyData.title || storyData.formData?.title || "Storia";
        // If not IT, we don't have a global audio preview anymore, we use slide audio
        const audioPreview = selectedLang === 'it' ? (storyData.audioPreview || storyData.formData?.audioPreview) : null;
        const coverImage = storyData.coverImage || storyData.formData?.coverPreview || storyData.formData?.coverImage;
        const orientation = storyData.orientation || storyData.formData?.coverOrientation || 'vertical';
        const audioMode = selectedLang === 'it' ? (storyData.audioMode || storyData.formData?.audioMode || 'global') : 'slides';

        return (
            <>
                {renderLanguageSwitcher()}
                <ManualStoryViewer
                    slides={slides}
                    storyTitle={title}
                    audioPreview={audioPreview}
                    coverImage={coverImage}
                    onClose={() => router.push('/')}
                    orientation={orientation}
                    audioMode={audioMode}
                />
            </>
        );
    }

    // For StoryBook (AI Generated Stories)
    // We update the story object conceptually before passing it down
    const translatedStoryForBook = {
        ...story,
        output: effectiveStoryData
    };

    return (
        <MainLayout
            currentView={null}
            setView={handleSetView}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
        >
            {renderLanguageSwitcher()}
            <StoryBook story={translatedStoryForBook} />
        </MainLayout>
    );
}

export default function ViewStory() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-purple-50">
                <div className="text-2xl font-bold text-purple-600 animate-pulse">Caricamento...</div>
            </div>
        }>
            <ViewStoryContent />
        </Suspense>
    );
}