"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const emailFromUrl = searchParams.get("email");

    const { resetPassword } = useAuth();

    // Form state
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Status state
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const passwordsMatch = passwordConfirmation && password === passwordConfirmation;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token || !emailFromUrl) {
            setStatus("error");
            setMessage("Link di reset non valido. Manca il token o l'email.");
            return;
        }

        if (password !== passwordConfirmation) {
            setStatus("error");
            setMessage("Le password non coincidono.");
            return;
        }

        setStatus("loading");
        try {
            const res = await resetPassword({
                token,
                email: emailFromUrl,
                password,
                password_confirmation: passwordConfirmation
            });
            setStatus("success");
            setMessage(res?.message || "Password reimpostata con successo!");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.response?.data?.message || "Errore durante il reset della password.");
        }
    };

    if (status === "success") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-4">Password Aggiornata</h1>
                    <p className="text-gray-600 mb-8">
                        La tua password è stata modificata con successo. Ora puoi accedere con le tue nuove credenziali.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                    >
                        Torna alla Home per Accedere
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 mx-auto mb-8">

                <h1 className="text-2xl font-black text-gray-900 mb-2 text-center">Crea nuova password</h1>
                <p className="text-sm text-gray-500 text-center mb-8">
                    Scegli una password forte per {emailFromUrl || 'il tuo account'}.
                </p>

                {status === "error" && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-700 text-sm font-medium">
                        <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                        <p>{message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nuova Password */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder="Nuova password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(p => !p)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Conferma Password */}
                    <div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Conferma nuova password"
                                value={passwordConfirmation}
                                onChange={e => setPasswordConfirmation(e.target.value)}
                                className={`w-full pl-10 pr-11 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium
                                    ${passwordsMatch ? "border-emerald-400 focus:ring-4 focus:ring-emerald-100" :
                                        (passwordConfirmation && !passwordsMatch) ? "border-red-400 focus:ring-4 focus:ring-red-100" :
                                            "border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"}`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(p => !p)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading" || !password || !passwordConfirmation}
                        className="w-full mt-6 py-3.5 rounded-xl font-bold text-white bg-indigo-600 shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {status === "loading" ? (
                            <>
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Salvataggio...
                            </>
                        ) : "Salva Nuova Password"}
                    </button>
                </form>

            </div>

            <Link href="/" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                Torna alla Home
            </Link>
        </div>
    );
}
