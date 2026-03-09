'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';

interface ResetPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestReset: (email: string) => Promise<void>;
    onVerifyAndReset: (email: string, code: string, newPin: string) => Promise<void>;
    isDarkMode?: boolean;
}

export default function ResetPinModal({ isOpen, onClose, onRequestReset, onVerifyAndReset, isDarkMode = false }: ResetPinModalProps) {
    const [step, setStep] = useState<'email' | 'code' | 'newPin' | 'confirm'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setStep('email');
        setEmail('');
        setCode('');
        setNewPin('');
        setConfirmPin('');
        setError('');
        setLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleEmailSubmit = async () => {
        if (!email || !email.includes('@')) {
            setError('Inserisci un indirizzo email valido');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await onRequestReset(email);
            setStep('code');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Errore durante l\'invio dell\'email');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeSubmit = () => {
        if (code.length !== 6) {
            setError('Il codice deve essere di 6 cifre');
            return;
        }
        setError('');
        setStep('newPin');
    };

    const handleNewPinSubmit = () => {
        if (newPin.length !== 4) {
            setError('Il PIN deve essere di 4 cifre');
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
            await onVerifyAndReset(email, code, newPin);
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Errore durante il reset del PIN');
            setLoading(false);
        }
    };

    const handlePinInput = (value: string, setter: (val: string) => void, maxLength: number) => {
        const numericValue = value.replace(/\D/g, '').slice(0, maxLength);
        setter(numericValue);
    };

    const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter') {
            action();
        }
    };

    const handleBack = () => {
        setError('');
        if (step === 'code') setStep('email');
        else if (step === 'newPin') setStep('code');
        else if (step === 'confirm') setStep('newPin');
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
                    isDarkMode ? "bg-indigo-600/10" : "bg-gradient-to-r from-blue-400 to-cyan-400"
                )}>
                    <div className="flex items-center gap-3">
                        {step !== 'email' && (
                            <button
                                onClick={handleBack}
                                className={cn("rounded-full p-2 transition-transform hover:scale-110 hover:bg-white/20", textColor)}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h3 className={cn("text-2xl font-black uppercase tracking-wide flex items-center gap-2", textColor)}>
                                <Mail className="w-6 h-6" />
                                Reset PIN
                            </h3>
                            <p className={cn("text-sm font-bold opacity-60 mt-1", isDarkMode ? "text-indigo-200" : "text-white")}>
                                {step === 'email' && 'Inserisci la tua email'}
                                {step === 'code' && 'Inserisci il codice ricevuto'}
                                {step === 'newPin' && 'Scegli un nuovo PIN'}
                                {step === 'confirm' && 'Conferma il nuovo PIN'}
                            </p>
                        </div>
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
                        <div className={cn("w-3 h-3 rounded-full transition-all", step === 'email' ? "bg-blue-500 scale-125" : "bg-gray-300")} />
                        <div className={cn("w-3 h-3 rounded-full transition-all", step === 'code' ? "bg-blue-500 scale-125" : "bg-gray-300")} />
                        <div className={cn("w-3 h-3 rounded-full transition-all", step === 'newPin' ? "bg-blue-500 scale-125" : "bg-gray-300")} />
                        <div className={cn("w-3 h-3 rounded-full transition-all", step === 'confirm' ? "bg-blue-500 scale-125" : "bg-gray-300")} />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-red-700 font-bold text-sm">{error}</p>
                        </div>
                    )}

                    {/* Email Input */}
                    {step === 'email' && (
                        <div className="space-y-3">
                            <label className={cn("font-black text-xs uppercase tracking-widest pl-2", isDarkMode ? "text-indigo-200" : "text-gray-400")}>
                                Indirizzo Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, handleEmailSubmit)}
                                placeholder="tua@email.com"
                                autoFocus
                                className={cn(
                                    "w-full px-6 py-5 rounded-2xl font-bold text-lg outline-none border-2 transition-all shadow-sm focus:shadow-md",
                                    inputBg,
                                    borderColor,
                                    textColor,
                                    "focus:border-blue-500"
                                )}
                            />
                            <p className={cn("text-xs opacity-50", textColor)}>
                                Riceverai un codice di 6 cifre via email
                            </p>
                        </div>
                    )}

                    {/* Code Input */}
                    {step === 'code' && (
                        <div className="space-y-3">
                            <label className={cn("font-black text-xs uppercase tracking-widest pl-2", isDarkMode ? "text-indigo-200" : "text-gray-400")}>
                                Codice di Verifica
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                value={code}
                                onChange={(e) => handlePinInput(e.target.value, setCode, 6)}
                                onKeyPress={(e) => handleKeyPress(e, handleCodeSubmit)}
                                placeholder="••••••"
                                autoFocus
                                className={cn(
                                    "w-full px-6 py-5 rounded-2xl font-bold text-3xl text-center tracking-[0.5em] outline-none border-2 transition-all shadow-sm focus:shadow-md",
                                    inputBg,
                                    borderColor,
                                    textColor,
                                    "focus:border-blue-500"
                                )}
                            />
                            <p className={cn("text-xs text-center opacity-50", textColor)}>
                                {code.length}/6 cifre • Controlla la tua email
                            </p>
                        </div>
                    )}

                    {/* New PIN Input */}
                    {(step === 'newPin' || step === 'confirm') && (
                        <div className="space-y-3">
                            <label className={cn("font-black text-xs uppercase tracking-widest pl-2", isDarkMode ? "text-indigo-200" : "text-gray-400")}>
                                {step === 'newPin' ? 'Nuovo PIN' : 'Conferma PIN'}
                            </label>
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={step === 'newPin' ? newPin : confirmPin}
                                onChange={(e) => handlePinInput(e.target.value, step === 'newPin' ? setNewPin : setConfirmPin, 4)}
                                onKeyPress={(e) => handleKeyPress(e, step === 'newPin' ? handleNewPinSubmit : handleConfirmPinSubmit)}
                                placeholder="••••"
                                autoFocus
                                className={cn(
                                    "w-full px-6 py-5 rounded-2xl font-bold text-3xl text-center tracking-[1em] outline-none border-2 transition-all shadow-sm focus:shadow-md",
                                    inputBg,
                                    borderColor,
                                    textColor,
                                    "focus:border-blue-500"
                                )}
                            />
                            <p className={cn("text-xs text-center opacity-50", textColor)}>
                                {(step === 'newPin' ? newPin : confirmPin).length}/4 cifre
                            </p>
                        </div>
                    )}

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
                            onClick={
                                step === 'email' ? handleEmailSubmit :
                                    step === 'code' ? handleCodeSubmit :
                                        step === 'newPin' ? handleNewPinSubmit :
                                            handleConfirmPinSubmit
                            }
                            disabled={
                                loading ||
                                (step === 'email' ? !email || !email.includes('@') :
                                    step === 'code' ? code.length !== 6 :
                                        step === 'newPin' ? newPin.length !== 4 :
                                            confirmPin.length !== 4)
                            }
                            className={cn(
                                "flex-[2] py-6 rounded-2xl font-black uppercase tracking-wide shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all gap-2",
                                isDarkMode
                                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                                    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                            )}
                        >
                            {loading ? (
                                'Caricamento...'
                            ) : step === 'confirm' ? (
                                <>
                                    <Check className="w-5 h-5" />
                                    Conferma
                                </>
                            ) : step === 'email' ? (
                                'Invia Codice'
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
