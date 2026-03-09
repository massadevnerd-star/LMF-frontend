import React from 'react';
import { Type, Image as ImageIcon, Layout as LayoutIcon, MousePointer2 } from 'lucide-react';
import { SlideContentItem, TemplateLayout, ContentType } from './FableEditor';
import { cn } from '@/app/lib/utils';
import { getAssetUrl } from '@/app/lib/urlHelper';

// --- Helper Components for Layout ---
interface SmartZoneProps {
    zoneId: string;
    label: string;
    icon: any;
    allowedTypes: ContentType[];
    content: SlideContentItem | undefined;
    onUpdate: (item: SlideContentItem | undefined) => void;
    readOnly?: boolean;
}

function SmartZone({ zoneId, label, icon: Icon, allowedTypes, content, onUpdate, readOnly }: SmartZoneProps) {
    // If readOnly and no content, render nothing or placeholder? 
    // FableEditor renders placeholder. Viewer should probably render nothing or empty space.
    // User wants "identical". Editor shows placeholders. But Viewer shouldn't show "Click to add".
    // I'll assume if readOnly && !content, return null.
    if (readOnly && !content) return null;

    if (content) {
        if (content.type === 'image') {
            return (
                <div className="w-full h-full relative group rounded-xl overflow-hidden shadow-sm">
                    <img src={getAssetUrl(content.value)} alt="Content" className="w-full h-full object-cover" />
                    {!readOnly && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => onUpdate(undefined)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                title="Rimuovi"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            );
        }
        if (content.type === 'text') {
            return (
                <div className="w-full h-full relative group rounded-xl border border-transparent hover:border-gray-200">
                    <p className="whitespace-pre-wrap w-full h-full text-lg leading-relaxed p-2">{content.value}</p>
                    {!readOnly && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onUpdate(undefined)}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            );
        }
    }

    // Placeholder State (Only if not readOnly)
    if (readOnly) return null;

    return (
        <div className="w-full h-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group bg-white/50">
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-purple-100 flex items-center justify-center text-gray-400 group-hover:text-purple-600 transition-colors">
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-center">
                <p className="font-bold text-gray-500 group-hover:text-purple-700">{label}</p>
                <p className="text-xs text-gray-400 group-hover:text-purple-500">
                    {allowedTypes.includes('image') && allowedTypes.includes('text') ? "Clicca per aggiungere foto o testo" :
                        allowedTypes.includes('image') ? "Clicca per aggiungere immagine" : "Clicca per scrivere"}
                </p>
            </div>
        </div>
    );
}

interface RenderSlideLayoutProps {
    layout?: TemplateLayout;
    content: Record<string, SlideContentItem>;
    onUpdateZone: (zoneId: string, item: SlideContentItem | undefined) => void;
    readOnly?: boolean;
}

export function RenderSlideLayout({ layout, content, onUpdateZone, readOnly }: RenderSlideLayoutProps) {

    const bind = (zoneId: string, label: string, icon: any, types: ContentType[] = ['text', 'image']) => (
        <SmartZone
            zoneId={zoneId}
            label={label}
            icon={icon}
            allowedTypes={types}
            content={content[zoneId]}
            onUpdate={(item) => onUpdateZone(zoneId, item)}
            readOnly={readOnly}
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
                    {/* Only show "Empty" label if NOT readOnly, because checking a preview of empty layout should arguably just include free elements? 
                         But user said "exact code". In editor it shows "Layout Vuoto". 
                         Viewing it, maybe we don't want "Layout Vuoto".
                         I'll stick to editor.
                     */}
                    {!readOnly && (
                        <div className="text-center opacity-30">
                            <LayoutIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm font-medium text-gray-400">Layout Vuoto</p>
                        </div>
                    )}
                </div>
            );
    }
}
