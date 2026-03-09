"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Sparkles, User, Mail, Lock, CheckCircle2, XCircle } from "lucide-react";

// ── Password strength checker ──────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "Almeno 8 caratteri", ok: password.length >= 8 },
        { label: "Una lettera maiuscola", ok: /[A-Z]/.test(password) },
        { label: "Un numero", ok: /[0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
    const labels = ["", "Debole", "Discreta", "Forte"];

    if (!password) return null;

    return (
        <div className="space-y-2 mt-1">
            {/* Bar */}
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : "bg-gray-200"}`}
                    />
                ))}
                <span className={`text-[10px] font-bold ml-1 ${score === 3 ? "text-emerald-500" : score === 2 ? "text-yellow-500" : "text-red-400"}`}>
                    {labels[score]}
                </span>
            </div>
            {/* Checklist */}
            <div className="flex flex-col gap-0.5">
                {checks.map(c => (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs transition-colors ${c.ok ? "text-emerald-600" : "text-gray-400"}`}>
                        {c.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {c.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main RegisterForm ──────────────────────────────────────────────────────
export function RegisterForm({ onCancel, onLoginClick }: { onCancel: () => void; onLoginClick: () => void }) {
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [visible, setVisible] = useState(false);

    // Mount animation
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(t);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError("Le password non coincidono.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await register({ name, email, password, password_confirmation: passwordConfirmation });
            if (result && result.requiresVerification) {
                setSuccess(true);
            } else {
                onCancel();
            }
        } catch (err: any) {
            setError(err?.message || "Registrazione fallita. Riprova.");
        } finally {
            setIsLoading(false);
        }
    };

    const passwordsMatch = passwordConfirmation && password === passwordConfirmation;
    const passwordsMismatch = passwordConfirmation && password !== passwordConfirmation;

    return (
        /* ── Fullscreen overlay ── */
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Blurred, gradient backdrop */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Card */}
            <div
                className={`relative z-10 w-full max-w-md transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"
                    }`}
            >
                {/* Decorative glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-40 animate-pulse" />

                <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">

                    {/* Header gradient strip */}
                    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 pt-8 pb-10">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-white/80" />
                            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Le Mie Fiabe</p>
                            <Sparkles className="w-5 h-5 text-white/80" />
                        </div>
                        <h2 className="text-3xl font-black text-white text-center leading-tight">
                            Crea il tuo<br />
                            <span className="text-yellow-300">Castello Magico</span> ✨
                        </h2>
                        <p className="text-white/70 text-sm text-center mt-2">
                            Un mondo di storie ti aspetta
                        </p>
                    </div>

                    {/* Form area — pulled up with negative margin to overlap strip */}
                    <div className="-mt-4 bg-white dark:bg-gray-900 rounded-t-3xl px-8 pt-6 pb-8 space-y-4">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm font-bold p-3 bg-red-50 border border-red-100 rounded-xl">
                                <XCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="space-y-4 text-center py-6">
                                <div className="flex justify-center mb-4">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black mb-2">Controlla la tua email</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Abbiamo inviato un link di verifica a <span className="font-bold">{email}</span>. Clicca sul link per attivare il tuo account e iniziare a creare le tue storie!
                                </p>
                                <button
                                    onClick={onLoginClick}
                                    className="w-full py-3 rounded-xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                >
                                    Vai al Login
                                </button>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    {/* Nome */}
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Il tuo nome"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium placeholder-gray-400"
                                            required
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium placeholder-gray-400"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type={showPass ? "text" : "password"}
                                                placeholder="Password"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-11 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm font-medium placeholder-gray-400"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(p => !p)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <PasswordStrength password={password} />
                                    </div>

                                    {/* Conferma Password */}
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Conferma password"
                                            value={passwordConfirmation}
                                            onChange={e => setPasswordConfirmation(e.target.value)}
                                            className={`w-full pl-10 pr-11 py-3 rounded-xl border-2 bg-gray-50 focus:bg-white transition-all outline-none text-sm font-medium placeholder-gray-400
                                        ${passwordsMatch ? "border-emerald-400 focus:ring-4 focus:ring-emerald-100" :
                                                    passwordsMismatch ? "border-red-400 focus:ring-4 focus:ring-red-100" :
                                                        "border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"}`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(p => !p)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                        {passwordsMatch && (
                                            <p className="mt-1 text-xs text-emerald-600 font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Le password coincidono
                                            </p>
                                        )}
                                        {passwordsMismatch && (
                                            <p className="mt-1 text-xs text-red-500 font-bold flex items-center gap-1">
                                                <XCircle className="w-3 h-3" /> Le password non coincidono
                                            </p>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3.5 rounded-xl font-black text-white text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg hover:shadow-purple-300/50 hover:shadow-xl active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {isLoading ? (
                                                <>
                                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                                    </svg>
                                                    Creazione account...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Entra nel Castello Magico
                                                </>
                                            )}
                                        </span>
                                        {/* Shimmer effect */}
                                        <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                    </button>
                                </form>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-100" />
                                    <span className="text-xs text-gray-400 font-bold">oppure</span>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>

                                {/* Switch to Login */}
                                <p className="text-center text-sm text-gray-500">
                                    Hai già un account?{" "}
                                    <button
                                        onClick={onLoginClick}
                                        className="font-black text-indigo-600 hover:text-purple-600 transition-colors hover:underline underline-offset-2"
                                    >
                                        Accedi qui
                                    </button>
                                </p>

                                {/* Cancel */}
                                <button
                                    onClick={onCancel}
                                    className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    Annulla
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
