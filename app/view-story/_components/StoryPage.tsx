import React from 'react'

// Update imports to include styling for free elements if needed
import { cn } from '@/app/lib/utils';
import { SlideCanvas } from '../../_components/Laboratorio/_components/SlideCanvas';

interface StoryPageProps {
    chapterNumber: number;
    chapterTitle: string;
    text: string;
    imagePrompt?: string;
    freeElements?: any[]; // layout elements from FableEditor
    slide?: any; // Full manual slide object
}

const StoryPage = React.forwardRef<HTMLDivElement, StoryPageProps>((props, ref) => {
    // Determine mode
    // Determine mode: It is manual if we have a slide object WITH freeElements (or layout).
    // AI chapters just have text/imagePrompt.
    const isManual = !!props.slide && (Array.isArray(props.slide.freeElements) || !!props.slide.layout);

    // Manual Mode: Use SlideCanvas to replicate Editor exactly
    if (isManual) {
        // Calculate scale to fit 960x540 (or 1024x1024 if old data) into the page.
        // Page width approx 500px.
        // 500 / 960 ~= 0.52.
        const scale = 0.52;
        // Note: SlideCanvas handles the visual rendering.
        // We center it vertically and horizontally.

        return (
            <div className="page bg-[#fdfbf7] h-full shadow-inner flex flex-col items-center justify-center overflow-hidden relative" ref={ref}>
                {/* Page Number */}
                <div className="absolute top-4 right-6 text-gray-400 font-serif italic text-sm z-20">
                    {props.chapterNumber > 0 ? `Pagina ${props.chapterNumber}` : ''}
                </div>

                <div
                    style={{
                        // Container for the scalable canvas
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}
                >
                    <SlideCanvas
                        slide={props.slide}
                        width={960} // Editor uses 960 now
                        height={540} // Editor uses 540
                        scale={scale}
                        readOnly={true}
                    />
                </div>

                {/* Footer decoration */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 z-20">
                    <span>❦</span>
                </div>
            </div>
        );
    }

    // AI Mode: Text Only (Legacy)
    return (
        <div className="page bg-[#fdfbf7] h-full shadow-inner text-gray-800 flex flex-col overflow-hidden" ref={ref}>
            <div className="h-full border-2 border-dotted border-gray-300 relative">

                {/* Page Number */}
                <div className="absolute top-4 right-6 text-gray-400 font-serif italic text-sm z-20">
                    {props.chapterNumber > 0 ? `Pagina ${props.chapterNumber}` : ''}
                </div>

                <div className="p-8 h-full flex flex-col">
                    <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 mt-2 border-b-2 border-amber-200 pb-2 inline-block">
                        {props.chapterTitle}
                    </h3>
                    <div className="prose prose-lg prose-p:font-serif prose-p:leading-8 prose-p:text-gray-700 max-w-none overflow-y-auto max-h-[85%] scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent pr-2">
                        <p className="whitespace-pre-wrap">{props.text}</p>
                    </div>
                </div>

                {/* Footer decoration */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 z-20">
                    <span>❦</span>
                </div>
            </div>
        </div>
    )
});

StoryPage.displayName = 'StoryPage';

export default StoryPage;
