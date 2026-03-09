'use client';

import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function NotLogged({ isDarkMode }: { isDarkMode?: boolean }) {
    const { loginWithGoogle } = useAuth(); // Assuming we can trigger login from here

    return (
        <div className={isDarkMode ? "dark" : ""}>
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500 bg-transparent dark:text-white">

                {/* Floating Icons Animation */}
                <div className="relative mb-8">
                    <div className="absolute -top-12 -left-12 text-yellow-400 animate-bounce delay-100">
                        <Sparkles size={48} />
                    </div>
                    <div className="absolute -bottom-4 -right-12 text-pink-400 animate-bounce delay-300">
                        <Sparkles size={32} />
                    </div>

                    <div className="w-48 h-48 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl ring-8 ring-indigo-50 dark:ring-indigo-900/20">
                        <Lock className="w-24 h-24 text-white" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-6 pb-2">
                    Ops! Serve la Chiave Magica
                </h1>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg mb-10 leading-relaxed font-medium">
                    Per creare o vedere le storie devi essere loggato.
                    <br />
                    I tuoi amici magici ti stanno aspettando!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
                    <Button
                        onClick={loginWithGoogle}
                        className="flex-1 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
                    >
                        Entra nel Castello
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 max-w-2xl w-full">
                    <h3 className="text-indigo-900 dark:text-indigo-200 font-bold mb-4 text-left flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Cosa puoi fare dopo?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                            <span className="text-2xl mb-2 block">🎨</span>
                            <p className="font-bold text-sm text-indigo-800 dark:text-indigo-300">Disegnare</p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">Crea disegni fantastici</p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <span className="text-2xl mb-2 block">📖</span>
                            <p className="font-bold text-sm text-purple-800 dark:text-purple-300">Leggere</p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">Scopri nuove storie</p>
                        </div>
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                            <span className="text-2xl mb-2 block">🎧</span>
                            <p className="font-bold text-sm text-pink-800 dark:text-pink-300">Ascoltare</p>
                            <p className="text-xs text-pink-600 dark:text-pink-400">Audio fiabe magiche</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
