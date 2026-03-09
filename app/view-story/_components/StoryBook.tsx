'use client';

import React, { useRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import BookCoverPage from './BookCoverPage';
import StoryPage from './StoryPage';
import EndPage from './EndPage';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Music, Pause } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';

interface StoryBookProps {
    story: any;
}

function StoryBook({ story }: StoryBookProps) {
    const bookRef = useRef<any>(null);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Prepare story data
    const storyData = typeof story.output === 'string' ? JSON.parse(story.output) : story.output;
    // Handle both structures: direct properties (Published via AI usually) or nested formData (Manual Drafts if published that way)
    const title = storyData.title || storyData.formData?.title;
    const coverImage = storyData.coverImage || storyData.formData?.coverPreview; // AI uses coverImage, Manual uses coverPreview
    const chapters = storyData.chapters || storyData.slides; // Manual uses slides
    const audioPreview = storyData.audioPreview || storyData.formData?.audioPreview;
    const creationMode = storyData.creationMode || storyData.formData?.creationMode || 'manual';

    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // AutoPlay on Mount
    useEffect(() => {
        if (audioRef.current && audioPreview) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch(error => {
                    console.log("Auto-play prevented");
                });
            }
        }
    }, [audioPreview]);

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

    const onFlip = (e: any) => {
        setPageNumber(e.data);
    };

    const nextFlip = () => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipNext();
        }
    };

    const prevFlip = () => {
        if (bookRef.current) {
            bookRef.current.pageFlip().flipPrev();
        }
    };

    // Calculate total pages logic if needed, but react-pageflip handles it internally.

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 py-10 overflow-hidden relative">

            {/* Audio Player Overlay */}
            {audioPreview && (
                <>
                    <audio
                        ref={audioRef}
                        src={getAssetUrl(audioPreview)}
                        onEnded={() => setIsPlaying(false)}
                        loop={true}
                        className="hidden"
                    />
                    <Button
                        onClick={toggleAudio}
                        className={cn(
                            "absolute top-6 right-6 z-50 rounded-full w-14 h-14 shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 border-2",
                            isPlaying
                                ? "bg-white text-pink-500 animate-pulse border-pink-300 shadow-pink-500/50"
                                : "bg-white/90 text-gray-500 hover:bg-white hover:text-pink-500 border-white/20"
                        )}
                        title={isPlaying ? "Pausa Musica" : "Riproduci Musica"}
                    >
                        {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Music className="w-6 h-6" />}
                    </Button>
                </>
            )}

            {/* Ambient Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-neutral-900 to-neutral-950 z-0 pointer-events-none"></div>

            <div className="z-10 relative flex items-center justify-center w-full max-w-[1200px] h-[80vh]">
                {/*@ts-ignore*/}
                <HTMLFlipBook
                    width={500}
                    height={700}
                    size="stretch"
                    minWidth={300}
                    maxWidth={600}
                    minHeight={400}
                    maxHeight={800}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    className="demo-book shadow-2xl"
                    ref={bookRef}
                    onFlip={onFlip}
                    usePortrait={true} // Single page on mobile if responsive
                    startZIndex={0}
                    autoSize={true}
                    clickEventForward={true}
                    useMouseEvents={true}
                    swipeDistance={30}
                    showPageCorners={true}
                    disableFlipByClick={false}
                    style={{ margin: '0 auto' }}
                    drawShadow={true}
                    flippingTime={1000}
                >
                    {/* Front Cover */}
                    <BookCoverPage title={title} coverImage={coverImage} creationMode={creationMode} />

                    {/* Story Pages */}
                    {chapters?.map((chapter: any, index: number) => (
                        <StoryPage
                            key={index}
                            chapterNumber={chapter.chapter_number || index + 1}
                            chapterTitle={chapter.chapter_title || chapter.title || `Pagina ${index + 1}`}
                            text={chapter.text}
                            imagePrompt={chapter.image_prompt}
                            freeElements={chapter.freeElements}
                            slide={chapter} // Pass full slide object for manual stories
                        />
                    ))}

                    {/* End Page */}
                    <EndPage />

                </HTMLFlipBook>
            </div>

            {/* Controls */}
            <div className="z-20 mt-8 flex space-x-6">
                <Button
                    variant="secondary"
                    size="icon"
                    onClick={prevFlip}
                    className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                <div className="text-white/50 font-mono text-sm flex items-center bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
                    Page {pageNumber}
                </div>

                <Button
                    variant="secondary"
                    size="icon"
                    onClick={nextFlip}
                    className="rounded-full w-12 h-12 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            <style jsx global>{`
                .page {
                    background-color: #fdfbf7;
                    box-shadow: inset -5px 0 20px rgba(0,0,0,0.1);
                    /* 3D Transform origin helps realism */
                }
                .demo-book {
                    background-size: cover;
                }
            `}</style>
        </div>
    )
}

export default StoryBook;
