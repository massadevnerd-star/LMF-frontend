import React, { useRef, useState, useLayoutEffect } from 'react';
import { Slide, SLIDE_WIDTH, SLIDE_HEIGHT } from './FableEditor';
import { RenderSlideLayout } from './RenderSlideLayout';
import { getAssetUrl } from '@/app/lib/urlHelper';

interface SlidePreviewProps {
    slide: Slide;
    fit?: 'contain' | 'cover';
    width?: number;
    height?: number;
}

// --- READ-ONLY Slide Renderer for Preview/Thumbnail ---
// This component automatically scales the fixed-resolution slide content to fit its parent container
export function SlidePreview({ slide, fit = 'contain', width = SLIDE_WIDTH, height = SLIDE_HEIGHT }: SlidePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const parentW = parent.clientWidth;
                    const parentH = parent.clientHeight;

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
                <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
                    {/* Added opacity-50 to match FableEditor behavior if missed in extraction. 
                         FableEditor has it. My extracted RenderSlideLayout handles content/layout.
                     */}
                    <RenderSlideLayout
                        layout={slide.layout}
                        content={slide.content}
                        onUpdateZone={() => { }}
                        readOnly={true}
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
