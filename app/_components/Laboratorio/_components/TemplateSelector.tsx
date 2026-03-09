import React from 'react';
import { cn } from '@/app/lib/utils';
import { Layout } from 'lucide-react';

export type TemplateLayout = 'two-columns' | 'three-rows' | 'two-rows' | 'full-screen' | 'three-columns' | 'empty';

interface TemplateSelectorProps {
    onSelect: (layout: TemplateLayout) => void;
    isDarkMode: boolean;
}

function TemplateSelector({ onSelect, isDarkMode }: TemplateSelectorProps) {
    const cardBg = isDarkMode ? 'bg-[#1a1c31] border-indigo-500/30 text-white' : 'bg-white border-gray-200 text-gray-900';
    const hoverEffect = "hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl relative overflow-hidden group";

    const templates = [
        {
            id: 'two-columns',
            name: 'Tema 2 Colonne',
            color: 'border-cyan-400',
            bg: 'bg-cyan-400',
            render: () => (
                <div className="w-full h-32 flex gap-2 p-2 bg-gray-100">
                    <div className="flex-1 bg-white border border-gray-300 flex items-center justify-center text-[8px] text-center font-bold text-gray-400 uppercase leading-tight">Testo<br />Colonna<br />Sinistra</div>
                    <div className="flex-1 bg-white border border-gray-300 flex items-center justify-center text-[8px] text-center font-bold text-gray-400 uppercase leading-tight">Testo<br />Colonna<br />Destra</div>
                </div>
            )
        },
        {
            id: 'three-rows',
            name: 'Tema 3 Righe',
            color: 'border-pink-500',
            bg: 'bg-pink-500',
            render: () => (
                <div className="w-full h-32 flex flex-col gap-1 p-2 bg-gray-100">
                    <div className="flex-1 bg-white border border-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase">Testo Superiore</div>
                    <div className="flex-1 bg-white/50 border border-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase">Testo Centrale</div>
                    <div className="flex-1 bg-white border border-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase">Testo Inferiore</div>
                </div>
            )
        },
        {
            id: 'two-rows',
            name: 'Tema 2 Righe',
            color: 'border-emerald-500',
            bg: 'bg-emerald-500',
            render: () => (
                <div className="w-full h-32 flex flex-col justify-between p-2 bg-gray-100 relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Layout className="w-16 h-16" />
                    </div>
                    <div className="h-8 bg-white border border-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase z-10">Testo Superiore</div>
                    <div className="h-8 bg-white border border-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase z-10">Testo Inferiore</div>
                </div>
            )
        },
        {
            id: 'full-screen',
            name: 'Tema Tutto Schermo',
            color: 'border-red-400',
            bg: 'bg-red-400',
            render: () => (
                <div className="w-full h-32 p-2 bg-gray-100 flex items-center justify-center relative">
                    <div className="w-20 h-20 rounded-full bg-gray-200 absolute"></div>
                    <div className="absolute inset-4 bg-white/80 border border-gray-300 flex items-center justify-center text-center text-[8px] font-bold text-gray-500 uppercase z-10 backdrop-blur-sm">
                        Testo su tutta<br />l'area della slide
                    </div>
                </div>
            )
        },
        {
            id: 'three-columns',
            name: 'Tema 3 Colonne',
            color: 'border-orange-400',
            bg: 'bg-orange-400',
            render: () => (
                <div className="w-full h-32 flex gap-1 p-2 bg-gray-100">
                    <div className="flex-1 bg-white border border-gray-300 flex items-center justify-center text-[6px] text-center font-bold text-gray-400 uppercase leading-tight">Testo<br />Col<br />Sin</div>
                    <div className="flex-1 bg-white border border-gray-300 flex items-center justify-center text-[6px] text-center font-bold text-gray-400 uppercase leading-tight">Testo<br />Col<br />Cen</div>
                    <div className="flex-1 bg-white border border-gray-300 flex items-center justify-center text-[6px] text-center font-bold text-gray-400 uppercase leading-tight">Testo<br />Col<br />Des</div>
                </div>
            )
        },
        {
            id: 'empty',
            name: 'Tema Vuota',
            color: 'border-red-500',
            bg: 'bg-red-500',
            render: () => (
                <div className="w-full h-32 p-2 bg-gray-100 flex items-center justify-center">
                    <div className="w-full h-full bg-white border border-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-400 uppercase">
                        Nessun Testo<br />Solo Sfondo
                    </div>
                </div>
            )
        },
    ] as const;

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className={cn("text-center mb-8 px-8 py-3 rounded-xl border backdrop-blur-md", isDarkMode ? "bg-indigo-900/40 border-indigo-500/30" : "bg-purple-50 border-purple-200")}>
                <h2 className={cn("text-xl font-bold uppercase", isDarkMode ? "text-indigo-200" : "text-purple-700")}>Seleziona il tema per la tua slide</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onSelect(template.id as TemplateLayout)}
                        className={cn(
                            "border-2 rounded-lg flex flex-col",
                            template.color,
                            hoverEffect,
                            cardBg
                        )}
                    >
                        {/* Preview Area */}
                        <div className="flex-1 border-b border-gray-100 dark:border-gray-800">
                            {template.render()}
                        </div>

                        {/* Initial Label (like the screenshot bottom bar) */}
                        <div className={cn("py-2 text-center text-xs font-bold text-white uppercase tracking-wider", template.bg)}>
                            {template.name}
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-8 text-sm opacity-50 px-4 text-center">
                Potrai comunque modificare il layout di ogni singola slide successivamente nell'editor.
            </p>
        </div>
    );
}

export default TemplateSelector;
