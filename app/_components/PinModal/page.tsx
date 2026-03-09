'use client';

import React, { useState, useEffect } from 'react';
import { X, Delete, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { toast } from 'sonner';

interface PinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (pin: string) => void | Promise<void>;
    title?: string;
    isSettingMode?: boolean; // If true, might require confirmation (optional implementation)
}

export default function PinModal({ isOpen, onClose, onSuccess, title = "Inserisci PIN", isSettingMode = false }: PinModalProps) {
    const [pin, setPin] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    const [shakeError, setShakeError] = useState(false);
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPin('');
            setError('');
            setIsVerifying(false); // Reset verifying state
            setIsAnimating(true);
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    const handleNumberClick = (num: string) => {
        if (pin.length < 4 && !isVerifying) {
            setPin(prev => prev + num);
            setError(''); // Clear error when user starts typing again
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
        setError(''); // Clear error when user deletes
    };

    const handleSubmit = async () => {
        if (pin.length === 4) {
            setIsVerifying(true);
            setError('');
            console.log(`[MOBILE-DEBUG] PIN submitting: "${pin}"`);
            try {
                await onSuccess(pin);
                console.log('[MOBILE-DEBUG] PIN Submission callback success');
            } catch (err: any) {
                // PIN was incorrect
                setError('PIN non corretto. Riprova.');
                triggerError();
                setPin(''); // Clear the PIN so user can try again
                setIsVerifying(false);
            }
        } else {
            triggerError();
        }
    };

    const triggerError = () => {
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
    };

    useEffect(() => {
        if (pin.length === 4 && !isVerifying) {
            // Auto submit when 4 digits are entered
            setTimeout(() => handleSubmit(), 300);
        }
    }, [pin]);

    // Keyboard Support
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Handle number keys (0-9)
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                handleNumberClick(e.key);
            }
            // Handle Backspace or Delete
            else if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                handleDelete();
            }
            // Handle Enter to submit
            else if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, pin]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={cn(
                "relative w-full max-w-sm bg-[#1e2030]/90 border border-white/10 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 transform",
                isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0",
                shakeError ? "animate-shake" : ""
            )}>

                {/* Header */}
                <div className="flex justify-between items-center p-6 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <Lock className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mb-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl animate-in slide-in-from-top">
                        <p className="text-red-400 font-bold text-sm text-center">{error}</p>
                    </div>
                )}

                {/* PIN Display */}
                <div className="flex justify-center gap-4 py-8">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-4 h-4 rounded-full transition-all duration-300 border-2",
                                pin.length > i
                                    ? isVerifying
                                        ? "bg-indigo-500 border-indigo-500 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse"
                                        : "bg-indigo-500 border-indigo-500 scale-110 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    : "bg-white/10 border-white/10"
                            )}
                        />
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3 p-6 pt-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <button
                            key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            disabled={isVerifying}
                            className={cn(
                                "h-16 rounded-2xl transition-all text-2xl font-bold border shadow-lg flex items-center justify-center",
                                isVerifying
                                    ? "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                                    : "bg-white/5 hover:bg-white/10 active:bg-white/20 text-white border-white/5 active:scale-95"
                            )}
                        >
                            {num}
                        </button>
                    ))}

                    {/* Empty placeholder */}
                    <div />

                    <button
                        onClick={() => handleNumberClick('0')}
                        disabled={isVerifying}
                        className={cn(
                            "h-16 rounded-2xl transition-all text-2xl font-bold border shadow-lg flex items-center justify-center",
                            isVerifying
                                ? "bg-white/5 text-white/30 border-white/5 cursor-not-allowed"
                                : "bg-white/5 hover:bg-white/10 active:bg-white/20 text-white border-white/5 active:scale-95"
                        )}
                    >
                        0
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={isVerifying}
                        className={cn(
                            "h-16 rounded-2xl transition-all border shadow-lg flex items-center justify-center",
                            isVerifying
                                ? "bg-red-500/5 text-red-400/30 border-red-500/5 cursor-not-allowed"
                                : "bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border-red-500/10 active:scale-95"
                        )}
                    >
                        <Delete className="w-6 h-6" />
                    </button>
                </div>

                {/* Footer or Info */}
                <div className="p-4 text-center">
                    <p className="text-xs text-white/30 uppercase tracking-widest font-bold">
                        Sicurezza Genitori
                    </p>
                </div>

            </div>

            {/* CSS Animation for Shake */}
            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
