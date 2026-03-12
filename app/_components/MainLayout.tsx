'use client';

import { ReactNode, useRef, useState, useEffect } from "react";
import Sidebar from "./Sidebar/page";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/app/context/AuthContext";
import { ViewType } from "@/app/types";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface MainLayoutProps {
    children: ReactNode;
    currentView?: ViewType | null;
    setView: (view: ViewType) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    headerRef?: any;
}

export default function MainLayout({
    children,
    currentView,
    setView,
    isDarkMode,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    headerRef
}: MainLayoutProps) {
    const { user, loginWithGoogle, hasStories } = useAuth();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollButtons, setShowScrollButtons] = useState({ top: false, bottom: false });

    const handleLogin = (method: 'google' | 'email') => {
        console.log(`Logging in with ${method}`);
        if (method === 'google') {
            loginWithGoogle();
        } else {
            // TODO: Email login
        }
    };

    // Check scroll position to show/hide buttons
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            setShowScrollButtons({
                top: scrollTop > 100,
                bottom: scrollTop < scrollHeight - clientHeight - 100
            });
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial check

        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (direction: 'up' | 'down') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = direction === 'up' ? -window.innerHeight * 0.8 : window.innerHeight * 0.8;
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    };

    const pageBg = isDarkMode ? 'bg-[#0f1123]' : 'bg-[#fff9f0]';
    const contentBg = isDarkMode ? 'bg-[#1a1c31]' : 'bg-white';
    const textColor = isDarkMode ? 'text-blue-50' : 'text-gray-800';
    const borderClass = isDarkMode ? 'border-indigo-500/20' : 'border-orange-100';

    const isScrollLocked = !!user && !hasStories && (currentView === 'home' || !currentView);

    return (
        <div className={`flex flex-col h-screen transition-colors duration-700 ${pageBg} ${textColor} overflow-hidden select-none`}>
            <div className="flex flex-1 overflow-hidden p-2 lg:p-3 gap-3">
                <div className="hidden lg:flex lg:flex-col lg:h-full w-72 space-y-3 shrink-0">
                    <Sidebar currentView={currentView} setView={setView} isDarkMode={isDarkMode} />
                </div>
                <main className={`flex-1 flex flex-col overflow-hidden rounded-[2.5rem] transition-colors duration-300 shadow-2xl ${contentBg} border-4 ${borderClass} relative`}>
                    <Header
                        currentView={currentView ?? 'home'} // Default to home if null, or maybe handle in Header?
                        isDarkMode={isDarkMode}
                        onToggleTheme={toggleTheme}
                        isAuthenticated={!!user}
                        onLogin={handleLogin}
                        setView={setView}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        ref={headerRef}
                    />
                    <div
                        ref={scrollContainerRef}
                        className={cn(
                            "flex-1 px-6 lg:px-10 pb-32 scroll-smooth scrollbar-hide lg:overflow-y-auto",
                            isScrollLocked ? "overflow-hidden" : "overflow-y-auto"
                        )}
                    >
                        {children}
                    </div>

                    {/* Custom Scroll Buttons - design adatto ai bambini */}
                    {showScrollButtons.top && !isScrollLocked && (
                        <button
                            onClick={() => scrollTo('up')}
                            className={cn(
                                "fixed right-6 top-28 z-50 w-10 h-10 flex items-center justify-center rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border-2",
                                isDarkMode
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300/40 shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_28px_rgba(99,102,241,0.5)]"
                                    : "bg-gradient-to-br from-purple-400 to-pink-500 border-white/40 shadow-[0_4px_20px_rgba(168,85,247,0.5)] hover:shadow-[0_6px_28px_rgba(236,72,153,0.5)]"
                            )}
                            aria-label="Scorri su"
                        >
                            <ChevronUp className="w-5 h-5" />
                        </button>
                    )}

                    {showScrollButtons.bottom && !isScrollLocked && (
                        <button
                            onClick={() => scrollTo('down')}
                            className={cn(
                                "fixed right-6 bottom-28 z-50 w-10 h-10 flex items-center justify-center rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 border-2",
                                isDarkMode
                                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-300/40 shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_28_rgba(99,102,241,0.5)]"
                                    : "bg-gradient-to-br from-purple-400 to-pink-500 border-white/40 shadow-[0_4px_20px_rgba(168,85,247,0.5)] hover:shadow-[0_6px_28px_rgba(236,72,153,0.5)]"
                            )}
                            aria-label="Scorri giù"
                        >
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    )}
                </main>

            </div>
            <Footer />
        </div>

    );
}
