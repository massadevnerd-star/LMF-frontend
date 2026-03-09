"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
    onCancel: () => void;
    onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onCancel, onBackToLogin }: ForgotPasswordFormProps) {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Errore durante la richiesta. Riprova.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="space-y-4 text-center pb-4">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                </div>
                <h3 className="text-xl font-black mb-2">Controlla la tua email</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Se l'indirizzo email <span className="font-bold">{email}</span> è registrato, riceverai a breve un link per reimpostare la tua password.
                </p>
                <button
                    onClick={onBackToLogin}
                    className="w-full py-3 rounded-xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                    Torna al Login
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <button onClick={onBackToLogin} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-black text-center flex-1 pr-6">Password Dimenticata</h3>
            </div>

            <p className="text-sm text-gray-600 text-center mb-4">
                Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
            </p>

            {error && <div className="text-red-500 text-xs text-center font-bold p-2 bg-red-50 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="email"
                        placeholder="La tua email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium placeholder-gray-400"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Invio in corso...
                        </>
                    ) : "Invia Link di Reset"}
                </button>
            </form>

            <button onClick={onCancel} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600">
                Annulla
            </button>
        </div>
    );
}
