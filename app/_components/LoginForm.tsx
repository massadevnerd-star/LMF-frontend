"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";

export function LoginForm({ onCancel, onRegisterClick, onForgotPasswordClick }: { onCancel: () => void; onRegisterClick: () => void; onForgotPasswordClick?: () => void }) {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await login({ email, password });
            onCancel(); // Close modal on success
        } catch (err: any) {
            setError(err?.message || "Login fallito. Riprova.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-black text-center mb-2">Accedi con Email</h3>
            {error && <div className="text-red-500 text-xs text-center font-bold p-2 bg-red-50 rounded-lg">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <p className="text-xs font-bold">Email</p>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                        required
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                        required
                    />
                    <div className="flex justify-end mt-1">
                        <button
                            type="button"
                            onClick={onForgotPasswordClick}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Password dimenticata?
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Accesso in corso..." : "Accedi"}
                </button>
            </form>
            <div className="text-center text-xs text-gray-500">
                Non hai un account?{" "}
                <button onClick={onRegisterClick} className="font-bold text-indigo-600 hover:underline">
                    Registrati
                </button>
            </div>
            <button onClick={onCancel} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600">
                Annulla
            </button>
        </div>
    );
}
