'use client';

import React from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/app/lib/utils';

// Gli stessi seed usati nell'Area Genitori
export const AVATAR_SEEDS = [
    'Felix', 'Aneka', 'Zoe', 'Marc', 'Leo', 'Molly',
    'Simba', 'Lala', 'Coco', 'Bubba', 'Kiki', 'Ziggy'
];

export function getAvatarSeedUrl(seed: string): string {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

interface AvatarPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: (seed: string) => void;
    currentSeed?: string | null;
    onSelect: (seed: string) => void;
    isDarkMode?: boolean;
}

export function AvatarPickerModal({
    isOpen,
    onClose,
    onConfirm,
    currentSeed,
    onSelect,
    isDarkMode = false,
}: AvatarPickerModalProps) {
    if (!isOpen) return null;

    const selected = currentSeed ?? AVATAR_SEEDS[0];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div
                className={cn(
                    'w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300',
                    isDarkMode
                        ? 'bg-[#1e2030] border-2 border-purple-500/30'
                        : 'bg-white border-4 border-white'
                )}
            >
                {/* Header */}
                <div className={cn(
                    'flex justify-between items-center p-6 pb-4',
                    isDarkMode
                        ? 'bg-purple-600/10'
                        : 'bg-gradient-to-r from-[#9d319e] to-[#ff0080]'
                )}>
                    <div>
                        <h3 className={cn('text-xl font-black', isDarkMode ? 'text-white' : 'text-white')}>
                            Scegli il tuo Avatar ✨
                        </h3>
                        <p className={cn('text-xs font-bold opacity-75', 'text-white')}>
                            Clicca su un avatar per selezionarlo
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 transition-transform hover:rotate-90 hover:bg-white/20 text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Avatar Grid */}
                <div className="p-6">
                    <div className={cn(
                        'grid grid-cols-4 gap-4 p-4 rounded-2xl border-2 max-h-64 overflow-y-auto',
                        isDarkMode
                            ? 'bg-[#121212] border-purple-500/20'
                            : 'bg-gray-50 border-gray-100'
                    )}>
                        {AVATAR_SEEDS.map((seed) => {
                            const isSelected = seed === selected;
                            return (
                                <button
                                    key={seed}
                                    type="button"
                                    onClick={() => onSelect(seed)}
                                    className={cn(
                                        'relative aspect-square rounded-full overflow-hidden transition-all duration-300 focus:outline-none',
                                        isSelected
                                            ? 'ring-4 ring-offset-2 scale-110 shadow-lg ring-[#9d319e]'
                                            : 'opacity-70 hover:opacity-100 hover:scale-110',
                                        isDarkMode ? 'ring-offset-[#1e2030]' : 'ring-offset-white'
                                    )}
                                >
                                    <img
                                        src={getAvatarSeedUrl(seed)}
                                        alt={seed}
                                        className="w-full h-full object-cover bg-white"
                                    />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-[#9d319e]/20 flex items-end justify-end p-1">
                                            <div className="w-4 h-4 rounded-full bg-[#9d319e] flex items-center justify-center">
                                                <Check className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Preview + Confirm */}
                    <div className="mt-4 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-[#9d319e]/30 shadow-md flex-shrink-0">
                            <img
                                src={getAvatarSeedUrl(selected)}
                                alt="Preview"
                                className="w-full h-full object-cover bg-white"
                            />
                        </div>
                        <div className="flex-1">
                            <p className={cn('text-xs font-bold uppercase tracking-widest mb-1', isDarkMode ? 'text-purple-300' : 'text-gray-400')}>
                                Anteprima
                            </p>
                            <p className={cn('font-black', isDarkMode ? 'text-white' : 'text-gray-800')}>
                                {selected}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                onConfirm?.(selected);
                                onClose();
                            }}
                            className="px-5 py-2.5 rounded-xl font-black text-white bg-gradient-to-r from-[#9d319e] to-[#ff0080] shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                            Conferma ✓
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
