import React from 'react';
import { RenderSlideLayout } from './RenderSlideLayout';
import { Slide, SlideContentItem } from './FableEditor';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';

// Types needed (imported or redefined if circular dep issues)
// Ideally FableEditor exports these. 
// Assuming types are available via FableEditor or shared.
// Since RenderSlideLayout needs them, and I imported them from FableEditor there, 
// I should rely on FableEditor exporting them.

interface SlideCanvasProps {
    slide: Slide;
    scale: number;
    width: number;
    height: number;
    readOnly?: boolean;
    // Interaction props (optional if readOnly)
    selectedId?: string | null;
    onMouseDownElement?: (e: React.MouseEvent, id: string, type: string, element: any) => void;
    onCanvasClick?: (e: React.MouseEvent) => void;
    onUpdateZone?: (zoneId: string, item: SlideContentItem | undefined) => void;
}

export function SlideCanvas({
    slide,
    scale,
    width,
    height,
    readOnly = false,
    selectedId,
    onMouseDownElement,
    onCanvasClick,
    onUpdateZone
}: SlideCanvasProps) {

    // Filter freeElements if needed? No, logic inside map.
    const safeFreeElements = Array.isArray(slide.freeElements) ? slide.freeElements : [];

    return (
        <div
            onClick={readOnly ? undefined : onCanvasClick}
            style={{
                width: width,
                height: height,
                transform: `scale(${scale})`,
                // origin center usually handled by parent flex, but here we can enforce it if needed.
                // Parent usually handles layout.
            }}
            className={cn(
                "bg-white shadow-2xl rounded-sm relative transition-transform duration-75 origin-center shrink-0",
                readOnly ? "shadow-none" : "" // Maybe less shadow in viewer? User said "exact code". Editor has shadow-2xl.
            )}
        >
            {/* 1. Underlying Template Layout */}
            <div className={cn("absolute inset-0 z-0", readOnly ? "" : "pointer-events-none opacity-50")}>
                {/* 
                   In Editor, opacity-50 is applied to layout when Free Elements are active? 
                   Editor code: className="absolute inset-0 z-0 pointer-events-none opacity-50"
                   Wait, this means layout is ALWAYS 50% opacity in editor?? 
                   Let's check line 926 in previous view. Yes: "opacity-50".
                   So if I want "Exact", I keep it.
                */}
                <RenderSlideLayout
                    layout={slide.layout}
                    content={slide.content || {}}
                    onUpdateZone={(zoneId, item) => onUpdateZone && onUpdateZone(zoneId, item)}
                    readOnly={readOnly}
                />
            </div>

            {/* 2. Free Floating Elements Layer */}
            <div className="absolute inset-0 z-10">
                {safeFreeElements.map(el => {
                    const isSelected = selectedId === el.id;

                    return (
                        <div
                            key={el.id}
                            onMouseDown={(e) => !readOnly && onMouseDownElement && onMouseDownElement(e, el.id, 'move', el)}
                            style={{
                                left: el.x,
                                top: el.y,
                                width: el.width,
                                height: el.height,
                                position: 'absolute' // Enforce absolute here just in case style prop misses it
                            }}
                            className={cn(
                                "absolute transition-opacity", // Removed cursor-move if readOnly
                                !readOnly && "cursor-move group p-2",
                                // Selection styles
                                !readOnly && (isSelected ? "z-50 opacity-100" : "z-20 hover:z-30 opacity-90"),
                                // ReadOnly styles: Just render. Maybe z-index needed?
                                readOnly && "z-20"
                            )}
                        >
                            {/* FLOATING TOOLBAR - Only if NOT readOnly */}
                            {!readOnly && isSelected && el.type === 'text' && (
                                <div
                                    className="absolute -top-12 left-0 flex items-center gap-1 bg-black/80 p-1.5 rounded-lg backdrop-blur-md shadow-xl text-white z-[60] animate-in fade-in slide-in-from-bottom-2"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    style={{ transform: `scale(${1 / scale})`, transformOrigin: 'bottom left' }}
                                >
                                    {/* Toolbar content would need to be passed or children? 
                                        For now, extracting huge blocks is risky WITHOUT passing needed handlers 
                                        like `updateElementStyle`.
                                        
                                        Editor has `updateElementStyle`.
                                        
                                        If I want to reuse this for VIEWER, I don't need toolbar.
                                        But Editor needs it.
                                        
                                        Refactoring Editor to use this component implies passing ALL props for toolbar.
                                        That is a lot of props.
                                        
                                        ALTERNATIVE:
                                        Code-split only the RENDERING of the element, not the toolbar.
                                        
                                        Actually, for the Viewer, I just need to render the content.
                                        
                                        If I strip interactions, I get:
                                    */}

                                    <span className="text-xs font-bold text-gray-300 pl-1 pr-2 border-r border-white/20">Testo</span>
                                    {/* ... buttons ... */}
                                    {/* This suggests I should maybe duplicate the render logic for Viewer vs Editor 
                                        OR make the component smart enough.
                                        
                                        For "Quick Fix" to satisfy user:
                                        Use current logic for Viewer but ensure it matches Editor's DOM structure.
                                        
                                        Editor:
                                        div (absolute bounds)
                                          -> content (img or div)
                                          
                                        Viewer:
                                        div (absolute bounds)
                                          -> content
                                          
                                        I should ensure styles match.
                                    */}
                                </div>
                            )}

                            {/* ELEMENT CONTENT */}
                            <div className={cn(
                                "w-full h-full relative overflow-hidden", // Editor uses this?
                                // Editor: className={cn("w-full h-full relative", el.type === 'text' ? "" : "rounded-lg overflow-hidden shadow-sm")}
                                el.type === 'text' ? "" : "rounded-lg overflow-hidden shadow-sm",
                                !readOnly && isSelected ? "ring-2 ring-indigo-500 ring-offset-2" : ""
                            )}>
                                {el.type === 'image' && (
                                    <img
                                        src={getAssetUrl(el.content)}
                                        alt="Element"
                                        className="w-full h-full object-cover pointer-events-none select-none"
                                    />
                                )}
                                {el.type === 'text' && (
                                    <div
                                        className="w-full h-full p-2"
                                        style={{
                                            fontSize: el.fontSize || 20,
                                            fontFamily: el.fontFamily || 'sans-serif',
                                            fontWeight: el.isBold ? 'bold' : 'normal',
                                            color: el.color || '#000000',
                                            // Editor doesn't explicitly set lineHeight? Defaults.
                                        }}
                                    >
                                        {el.content}
                                    </div>
                                )}
                            </div>

                            {/* Resize Handles - Only if NOT readOnly */}
                            {!readOnly && isSelected && (
                                <>
                                    {/* ... handles ... */}
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full cursor-se-resize z-50 shadow-md border-2 border-white transition-transform hover:scale-125"
                                        onMouseDown={(e) => onMouseDownElement && onMouseDownElement(e, el.id, 'resize', el)} />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
