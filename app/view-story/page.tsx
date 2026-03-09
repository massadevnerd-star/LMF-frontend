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

    const [isDarkMode, setIsDarkMode] = useState(false);
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

    // Check creationMode (either in DB column or inside JSON)
    const creationMode = story.creation_mode || storyData.creationMode || storyData.formData?.creationMode;
    const isManual = creationMode === 'manual';

    if (isManual) {
        // Prepare Manual Data
        const slides = storyData.slides || storyData.chapters || [];
        const title = storyData.title || storyData.formData?.title || "Storia";
        const audioPreview = storyData.audioPreview || storyData.formData?.audioPreview;
        const coverImage = storyData.coverImage || storyData.formData?.coverPreview || storyData.formData?.coverImage;
        const orientation = storyData.orientation || storyData.formData?.coverOrientation || 'vertical';
        const audioMode = storyData.audioMode || storyData.formData?.audioMode || 'global';

        return (
            <ManualStoryViewer
                slides={slides}
                storyTitle={title}
                audioPreview={audioPreview}
                coverImage={coverImage}
                onClose={() => router.push('/')}
                orientation={orientation}
                audioMode={audioMode}
            />
        );
    }

    return (
        <MainLayout
            currentView={null}
            setView={handleSetView}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
        >
            <StoryBook story={story} />
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