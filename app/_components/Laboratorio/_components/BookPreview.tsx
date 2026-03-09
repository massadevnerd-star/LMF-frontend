import React, { useCallback, useRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { cn } from '@/app/lib/utils';
import { ChevronRight, ChevronLeft, Music, Pause } from 'lucide-react';
import { getAssetUrl } from '@/app/lib/urlHelper';

interface BookPreviewProps {
    coverPreview: string | null;
    coverOrientation: 'vertical' | 'horizontal';
    title: string;
    audioPreview?: string | null;
}

const PreviewCoverPage = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <div className={cn("page bg-neutral-100 h-full shadow-lg overflow-hidden border-r-2 border-neutral-300", props.orientation === 'horizontal' ? 'rounded-r-md' : 'rounded-r-md')} ref={ref} data-density="hard">
            {props.coverPreview ? (
                <div className="w-full h-full relative">
                    <img
                        src={getAssetUrl(props.coverPreview)}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
                </div>
            ) : (
                <div className="w-full h-full bg-purple-100 flex flex-col items-center justify-center p-6 text-center border-4 border-dashed border-purple-200 m-2 rounded-lg">
                    <h2 className="text-xl font-bold text-purple-800 break-words w-full">{props.title || "Titolo Storia"}</h2>
                    <p className="text-purple-400 mt-2 text-sm">Anteprima Copertina</p>
                </div>
            )}
        </div>
    );
});
PreviewCoverPage.displayName = 'PreviewCoverPage';

const PreviewBackCover = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <div className="page bg-purple-900 h-full shadow-lg overflow-hidden border-l-2 border-purple-950 flex flex-col items-center justify-center text-white/50" ref={ref} data-density="hard">
            <span className="text-sm font-medium uppercase tracking-widest">Fine</span>
        </div>
    );
});
PreviewBackCover.displayName = 'PreviewBackCover';

const PreviewInnerPage = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    return (
        <div className="page bg-[#fdfbf7] h-full p-8 shadow-inner flex flex-col items-center justify-center text-center bo" ref={ref}>
            <p className="font-serif text-neutral-600 italic">"C'era una volta..."</p>
            <p className="text-xs text-neutral-400 mt-4">(Esempio pagina interna)</p>
        </div>
    );
});
PreviewInnerPage.displayName = 'PreviewInnerPage';


function BookPreview({ coverPreview, coverOrientation, title, audioPreview }: BookPreviewProps) {
    const bookRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Reset audio state when source changes
    useEffect(() => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [audioPreview]);

    const toggleAudio = useCallback(() => {
        if (!audioRef.current || !audioPreview) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
            setIsPlaying(true);
        }
    }, [isPlaying, audioPreview]);

    // Dimensions based on orientation
    // Vertical: Standard Book (approx 300x450)
    // Horizontal: Landscape Book (approx 450x300)
    const width = coverOrientation === 'vertical' ? 300 : 450;
    const height = coverOrientation === 'vertical' ? 450 : 300;

    const nextFlip = useCallback(() => {
        bookRef.current?.pageFlip().flipNext();
    }, []);

    const prevFlip = useCallback(() => {
        bookRef.current?.pageFlip().flipPrev();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-8 relative group">
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
                    <button
                        onClick={toggleAudio}
                        className={cn(
                            "absolute top-4 right-4 z-50 w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110",
                            isPlaying
                                ? "bg-white text-pink-500 animate-pulse border-2 border-pink-200"
                                : "bg-white/80 text-gray-500 hover:bg-white hover:text-pink-500 border border-transparent"
                        )}
                        title={isPlaying ? "Pausa Musica" : "Riproduci Musica"}
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Music className="w-5 h-5" />}
                    </button>
                </>
            )}

            <div className="relative perspective-1000">
                {/*@ts-ignore*/}
                <HTMLFlipBook
                    key={coverOrientation}
                    width={width}
                    height={height}
                    size="fixed" // Use fixed to respect orientation dimensions strictly
                    minWidth={width}
                    maxWidth={width}
                    minHeight={height}
                    maxHeight={height}
                    maxShadowOpacity={0.5}
                    showCover={true}
                    mobileScrollSupport={true}
                    className={cn("demo-book shadow-2xl transition-all duration-500", coverOrientation === 'vertical' ? 'aspect-[2/3]' : 'aspect-[3/2]')}
                    ref={bookRef}
                    usePortrait={true}
                    startZIndex={0}
                    autoSize={true}
                    clickEventForward={true}
                    useMouseEvents={true}
                    swipeDistance={30}
                    showPageCorners={true}
                    disableFlipByClick={false}
                    drawShadow={true}
                    flippingTime={1000}
                >
                    <PreviewCoverPage coverPreview={coverPreview} title={title} orientation={coverOrientation} />
                    <PreviewInnerPage />
                    <PreviewInnerPage />
                    <PreviewBackCover />
                </HTMLFlipBook>
            </div>

            <div className="flex gap-4 mt-6 opacity-50 group-hover:opacity-100 transition-opacity">
                <button onClick={prevFlip} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextFlip} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            <p className="text-white/40 text-xs mt-2 font-medium uppercase tracking-widest">
                Anteprima Libro interattivo
            </p>

            <style jsx global>{`
                .page {
                    background-color: #fdfbf7;
                }
            `}</style>
        </div>
    );
}

export default BookPreview;
