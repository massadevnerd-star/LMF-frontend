"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const isVerified = searchParams.get("verified") === "1";

    // Supporto al reinvio manuale da questa pagina se l'utente ci capita senza parametro
    const { resendVerification } = useAuth();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    // Se l'URL dice verified=1 mostriamo la success UI
    if (isVerified) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden text-center p-8">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Email Verificata!</h1>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Il tuo account è stato confermato con successo. Ora puoi iniziare a creare le tue storie magiche.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                    >
                        Vai all'applicazione <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        try {
            const res = await resendVerification(email);
            setStatus("success");
            setMessage(res?.message || "Email inviata con successo.");
        } catch (err: any) {
            setStatus("error");
            setMessage(err?.response?.data?.message || "Errore durante l'invio. Riprova più tardi.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center mx-auto mb-8">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-10 h-10 text-indigo-500" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 mb-4">Controlla la tua email</h1>
                <p className="text-gray-600 mb-8 leading-relaxed">
                    Abbiamo inviato un link di verifica alla tua email. Clicca sul link per confermare il tuo account.
                </p>

                <hr className="border-gray-100 my-8" />

                <div className="text-left">
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Non hai ricevuto l'email?</h3>
                    <p className="text-xs text-gray-500 mb-4">
                        Inserisci il tuo indirizzo per ricevere un nuovo link di verifica.
                    </p>

                    {status === "success" && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-700 text-sm">
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{message}</p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-700 text-sm">
                            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>{message}</p>
                        </div>
                    )}

                    <form onSubmit={handleResend} className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Tua email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-400 outline-none text-sm transition-all"
                            required
                        />
                        <button
                            type="submit"
                            disabled={status === "loading" || !email}
                            className="px-4 py-2.5 rounded-xl font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors disabled:opacity-50"
                        >
                            {status === "loading" ? "Invio..." : "Reinvia"}
                        </button>
                    </form>
                </div>
            </div>

            <Link href="/" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                Torna alla Home
            </Link>
        </div>
    );
}
