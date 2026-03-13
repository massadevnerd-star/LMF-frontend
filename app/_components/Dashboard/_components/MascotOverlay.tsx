'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MessageCircle, X, Languages, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import api from '@/app/lib/api';
import { Story } from '@/app/types';
import { useRouter } from 'next/navigation';

interface MascotOverlayProps {
    isDarkMode: boolean;
    latestStory?: Story | null;
}

const TARGET_LANGUAGES = [
    { code: 'ru', label: 'Russo', flag: '🇷🇺' },
    { code: 'en', label: 'Inglese', flag: '🇬🇧' },
    { code: 'es', label: 'Spagnolo', flag: '🇪🇸' }
];

export default function MascotOverlay({ isDarkMode, latestStory }: MascotOverlayProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [status, setStatus] = useState<'idle' | 'translating' | 'success' | 'error'>('idle');
    const [selectedLang, setSelectedLang] = useState('ru');
    const router = useRouter();

    // Get story details safely
    let storyTitle = 'la tua ultima storia';
    if (latestStory) {
        try {
            const output = typeof latestStory.output === 'string' 
                ? JSON.parse(latestStory.output) 
                : latestStory.output;
            storyTitle = `"${output?.formData?.title || output?.title || 'Senza Titolo'}"`;
        } catch (e) {}
    }

    const handleTranslate = async () => {
        if (!latestStory) return;
        
        setStatus('translating');
        try {
            await api.post(`/api/auth/stories/${latestStory.id}/translate`, {
                target_lang: selectedLang,
                with_audio: true,
                engine: 'generative'
            });
            setStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
                // Optional: navigate to the story or show a toast
                router.refresh(); 
            }, 3000);
        } catch (error) {
            console.error("Translation failed:", error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    if (!latestStory) return null; // Don't show mascot if no stories exist

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
            {/* Speech Bubble (Tailwind Transition) */}
            <div
                className={cn(
                    "pointer-events-auto p-5 rounded-3xl shadow-2xl border-2 max-w-[320px] mb-2 transition-all duration-300 transform origin-bottom-right",
                    isOpen 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-75 translate-y-4 pointer-events-none",
                    isDarkMode 
                        ? "bg-[#1a1c31] border-indigo-500/30 text-white" 
                        : "bg-white border-orange-100 text-gray-800"
                )}
            >
                <div className="flex justify-between items-start mb-3">
                    <h4 className="font-black text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Magia delle Lingue!
                    </h4>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                        disabled={status === 'translating'}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                {status === 'idle' && (
                    <>
                        <p className="text-sm leading-relaxed mb-4 opacity-90">
                            Ciao! Sono la Matita Magica. Posso tradurre {storyTitle} in un'altra lingua e farla anche parlare!
                        </p>

                        <div className="flex gap-2 mb-4">
                            {TARGET_LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => setSelectedLang(lang.code)}
                                    className={cn(
                                        "flex-1 py-2 px-1 text-xs font-bold rounded-lg border-2 transition-all flex flex-col items-center gap-1",
                                        selectedLang === lang.code 
                                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" 
                                            : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                                    )}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    {lang.label}
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={handleTranslate}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 group"
                        >
                            <Languages className="w-5 h-5 transition-transform group-hover:rotate-12" />
                            Traduci in {TARGET_LANGUAGES.find(l => l.code === selectedLang)?.label}
                        </button>
                    </>
                )}

                {status === 'translating' && (
                    <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="font-bold text-center">Magia in corso...</p>
                        <p className="text-xs text-center opacity-70">Sto studiando il dizionario e preparando le voci. Ci vorrà qualche secondo!</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center py-6 gap-3 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-12 h-12" />
                        <p className="font-bold text-center">Fatto! 🎉</p>
                        <p className="text-xs text-center opacity-70">La tua storia è pronta in {TARGET_LANGUAGES.find(l => l.code === selectedLang)?.label}.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center py-6 gap-3 text-red-500">
                        <X className="w-10 h-10" />
                        <p className="font-bold text-center">Ops!</p>
                        <p className="text-xs text-center opacity-70">Qualcosa è andato storto. Riprova più tardi.</p>
                    </div>
                )}
            </div>

            {/* Mascot Avatar Trigger */}
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => status !== 'translating' && setIsOpen(!isOpen)}
                className={cn(
                    "pointer-events-auto cursor-pointer relative group transition-all duration-500",
                    "w-20 h-20 md:w-24 md:h-24",
                    isHovered ? "-translate-y-2" : "animate-bounce-slow",
                    status === 'translating' && "opacity-50 cursor-not-allowed"
                )}
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={cn(
                    "relative w-full h-full rounded-full border-4 overflow-hidden shadow-2xl transition-all duration-300",
                    isOpen ? "border-indigo-500 scale-110" : "border-white dark:border-gray-800"
                )}>
                    <Image
                        src="/assets/mascot-pencil.png"
                        alt="Magic Mascot"
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Notification Badge */}
                {!isOpen && status !== 'translating' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-3 h-3 text-white fill-white" />
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}

