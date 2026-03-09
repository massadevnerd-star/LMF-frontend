'use client';

import React, { useState } from 'react';
import { X, Lock, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';

interface ChangePinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (oldPin: string, newPin: string) => Promise<void>;
    isDarkMode?: boolean;
}

export default function ChangePinModal({ isOpen, onClose, onSuccess, isDarkMode = false }: ChangePinModalProps) {
    const [step, setStep] = useState<'old' | 'new' | 'confirm'>('old');
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setStep('old');
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        setError('');
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleOldPinSubmit = async () => {
        if (oldPin.length !== 4) {
            setError('Il PIN deve essere di 4 cifre');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Import pinService at the top if not already imported
            const { pinService } = await import('@/app/lib/api');
            const response = await pinService.verifyPin(oldPin);

            if (!response.data.valid) {
                setError('PIN non corretto. Riprova.');
                setLoading(false);
                return;
            }

            // PIN is correct, proceed to next step
            setError('');
            setLoading(false);
            setStep('new');
        } catch (err: any) {
            setError('Errore durante la verifica del PIN');
            setLoading(false);
        }
    };

    const handleNewPinSubmit = () => {
        if (newPin.length !== 4) {
            setError('Il PIN deve essere di 4 cifre');
            return;
        }
        if (newPin === oldPin) {
            setError('Il nuovo PIN deve essere diverso dal vecchio');
            return;
        }
        setError('');
        setStep('confirm');
    };

    const handleConfirmPinSubmit = async () => {
        if (confirmPin.length !== 4) {
            setError('Il PIN deve essere di 4 cifre');
            return;
        }
        if (confirmPin !== newPin) {
            setError('I PIN non corrispondono');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onSuccess(oldPin, newPin);
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Errore durante il cambio PIN');
            setLoading(false);
        }
    };

    const handlePinInput = (value: string, setter: (val: string) => void) => {
        const numericValue = value.replace(/\D/g, '').slice(0, 4);
        setter(numericValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    if (!isOpen) return null;

    const bgColor = isDarkMode ? 'bg-[#1e2030]' : 'bg-white';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-800';
    const inputBg = isDarkMode ? 'bg-[#121212]' : 'bg-gray-50';
    const borderColor = isDarkMode ? 'border-indigo-500/30' : 'border-gray-200';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className={cn(
                "w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300",
                bgColor,
                isDarkMode ? "border-2 border-indigo-500/30" : "border-4 border-white"
            )}>
                {/* Header */}
                <div className={cn(
                    "flex justify-between items-center p-8 pb-6",
                    isDarkMode ? "bg-indigo-600/10" : "bg-gradient-to-r from-purple-400 to-pink-400"
                )}>
                    <div>
                        <h3 className={cn("text-2xl font-black uppercase tracking-wide flex items-center gap-2", textColor)}>
                            <Lock className="w-6 h-6" />
                            Cambia PIN
                        </h3>
                        <p className={cn("text-sm font-bold opacity-60 mt-1", isDarkMode ? "text-indigo-200" : "text-white")}>
                            {step === 'old' && 'Inserisci il tuo PIN attuale'}
                            {step === 'new' && 'Scegli un nuovo PIN'}
                            {step === 'confirm' && 'Conferma il nuovo PIN'}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className={cn("rounded-full p-2 transition-transform hover:rotate-90 hover:bg-white/20", textColor)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2 mb-6">
                        <div className={cn("w-3 h-3 rounded-full transition-all", step === 'old' ? "bg-purple-500 scale-125" : "bg-gray-300")} />
                        <div className={cn("w-3 h-3 rounded-full transition-all", step === 'new' ? "bg-purple-500 scale-125" : "bg-gray-300")} />
                        <div className={cn("w-3 h-3 rounded-full transition-all", step === 'confirm' ? "bg-purple-500 scale-125" : "bg-gray-300")} />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-red-700 font-bold text-sm">{error}</p>
                        </div>
                    )}

                    {/* PIN Input */}
                    <div className="space-y-3">
                        <label className={cn("font-black text-xs uppercase tracking-widest pl-2", isDarkMode ? "text-indigo-200" : "text-gray-400")}>
                            {step === 'old' && 'PIN Attuale'}
                            {step === 'new' && 'Nuovo PIN'}
                            {step === 'confirm' && 'Conferma PIN'}
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            value={step === 'old' ? oldPin : step === 'new' ? newPin : confirmPin}
                            onChange={(e) => handlePinInput(e.target.value, step === 'old' ? setOldPin : step === 'new' ? setNewPin : setConfirmPin)}
                            onKeyPress={(e) => handleKeyPress(e, step === 'old' ? handleOldPinSubmit : step === 'new' ? handleNewPinSubmit : handleConfirmPinSubmit)}
                            placeholder="••••"
                            autoFocus
                            className={cn(
                                "w-full px-6 py-5 rounded-2xl font-bold text-3xl text-center tracking-[1em] outline-none border-2 transition-all shadow-sm focus:shadow-md",
                                inputBg,
                                borderColor,
                                textColor,
                                "focus:border-purple-500"
                            )}
                        />
                        <p className={cn("text-xs text-center opacity-50", textColor)}>
                            {(step === 'old' ? oldPin : step === 'new' ? newPin : confirmPin).length}/4 cifre
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            onClick={handleClose}
                            disabled={loading}
                            className={cn(
                                "flex-1 py-6 rounded-2xl font-bold border-2 transition-all",
                                isDarkMode
                                    ? "bg-transparent border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                                    : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            Annulla
                        </Button>
                        <Button
                            onClick={step === 'old' ? handleOldPinSubmit : step === 'new' ? handleNewPinSubmit : handleConfirmPinSubmit}
                            disabled={loading || (step === 'old' ? oldPin.length !== 4 : step === 'new' ? newPin.length !== 4 : confirmPin.length !== 4)}
                            className={cn(
                                "flex-[2] py-6 rounded-2xl font-black uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all gap-2",
                                isDarkMode
                                    ? "bg-purple-600 hover:bg-purple-500 text-white"
                                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            )}
                        >
                            {loading ? (
                                'Caricamento...'
                            ) : step === 'confirm' ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Conferma
                                </>
                            ) : (
                                'Avanti'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
