'use client'

import Image from "next/image";
import Link from "next/link";
import { ViewType } from "@/app/types";
import { useState, useEffect } from "react";


import { getPath } from "@/app/lib/path";
import { useAuth } from "@/app/context/AuthContext";

export interface SidebarProps {
    currentView: ViewType | null | undefined;
    setView: (view: ViewType) => void;
    isDarkMode: boolean;
}

const LogoSVG = ({ isDarkMode }: { isDarkMode: boolean }) => (
    <Image
        priority
        alt="Logo"
        className="w-auto h-32 sm:h-40 md:h-56 object-contain "
        height={500}
        src={getPath('/lgo-lmf-new.png')}
        width={500}
    />
);
import { useLanguage } from '@/app/context/LanguageContext';

export default function Sidebar({ currentView, setView, isDarkMode }: SidebarProps) {
    const { user, activeProfile } = useAuth();
    const { t } = useLanguage();
    const [navItems, setNavItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const apiModule = await import('@/app/lib/api');
                // Se l'utente è loggato, recupera il menu personalizzato per il suo ruolo.
                // Altrimenti, recupera solo le voci pubbliche (senza ruoli assegnati).
                const endpoint = user ? '/api/user/menu' : '/api/menu/public';
                const response = await apiModule.default.get(endpoint);
                setNavItems(response.data);
            } catch (error) {
                console.error("Failed to fetch menu", error);
            }
        };

        fetchMenu();
    }, [user]); // Ricarica il menu ogni volta che lo stato di autenticazione cambia

    const bgColor = isDarkMode ? 'bg-[#1a1c31]' : 'bg-white border-2 border-orange-50';
    const textColor = isDarkMode ? 'text-indigo-200' : 'text-zinc-600';
    const activeColor = isDarkMode ? 'text-indigo-400' : 'text-orange-600';
    const hoverBg = isDarkMode ? 'hover:bg-indigo-500/10' : 'hover:bg-orange-50';

    // Helper to translate label if it is a key
    const getLabel = (label: string) => {
        if (label && label.includes('.') && !label.includes(' ')) {
            return t(label);
        }
        return label;
    };



    return (
        <nav className="flex flex-col gap-3 h-full overflow-hidden pb-4">
            {/* Logo Section - Desktop */}
            <div
                className={`${bgColor} rounded-[2rem] p-4 shadow-xl flex items-center justify-center shrink-0 group cursor-pointer transition-all hover:scale-[1.05] max-h-48`}
                onClick={() => setView('home')}
            >
                <LogoSVG isDarkMode={isDarkMode} />
            </div>
            <div className={`${bgColor} rounded-[2rem] p-5 space-y-4 transition-all duration-300 shadow-xl flex-1 overflow-y-auto no-scrollbar`}>
                {navItems.filter(item => {
                    // 1. If no roles assigned, visible to everyone
                    if (!item.roles || item.roles.length === 0) return true;

                    // 2. Determine required role based on active profile
                    // 'adult' profile -> needs 'parent' role (or 'admin')
                    // Child profile -> needs 'kid' role
                    const requiredRole = activeProfile === 'adult' ? 'parent' : 'kid';

                    // 3. Check if item allows this role
                    // For adults, we might also allow 'admin' role if we had that in UI, but for now just 'parent'.
                    return item.roles.some((r: any) => r.name === requiredRole);
                }).map((item) => {
                    return (
                        <button
                            key={item.id}
                            onClick={() => setView(item.route as ViewType)}
                            className={`flex items-center gap-4 w-full px-3 py-3 text-base font-bold transition-all rounded-2xl cursor-pointer ${hoverBg} ${currentView === item.route ? activeColor + ' scale-105' : textColor}`}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            {getLabel(item.label)}
                        </button>
                    )
                })}
            </div>
        </nav>

    );
}