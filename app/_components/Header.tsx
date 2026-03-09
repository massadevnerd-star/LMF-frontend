import { Menu, X, Home, Users, Settings, LogOut, HelpCircle, Search, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Image from 'next/image';
import { ViewType } from '@/app/types';
import api from '@/app/lib/api';
import { useAuth } from '@/app/context/AuthContext';
import { getPath } from '@/app/lib/path';
import PinModal from '@/app/_components/PinModal/page';
import { useLanguage } from '@/app/context/LanguageContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { getAvatarUrl } from '@/app/lib/avatar';

interface MenuItem {
    icon: string;
    label: string;
    action?: () => void;
    color?: string;
}

interface HeaderProps {
    currentView: ViewType;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    isAuthenticated?: boolean;
    onLogin?: (method: 'google' | 'email') => void;
    setView: (view: ViewType) => void;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
}

const LogoMobileSVG = ({ isDarkMode, onGoHome }: { isDarkMode: boolean; onGoHome: () => void }) => (
    <button
        onClick={onGoHome}
        className="transition-transform active:scale-105 shrink-0"
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border-2 h-12 w-12 ${isDarkMode ? 'bg-indigo-900/50 border-indigo-500/30' : 'bg-white border-orange-100 shadow-sm'}`}>
            <Image
                priority
                alt="Logo LMF"
                className="w-8 h-8 object-contain"
                height={100}
                src={getPath('/lgo-lmf-new.png')}
                width={100}
            />
        </div>
    </button>
);

const Header = forwardRef<any, HeaderProps>(({
    currentView,
    isDarkMode,
    onToggleTheme,
    isAuthenticated,
    onLogin,
    setView,
    searchQuery,
    setSearchQuery
}, ref) => {
    const { user, logout, activeProfile, setActiveProfile } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
    const [navItems, setNavItems] = useState<any[]>([]);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [modalView, setModalView] = useState<'options' | 'email_login' | 'register' | 'forgot_password'>('options');
    const menuRef = useRef<HTMLDivElement>(null);
    const loginTriggerRef = useRef<(() => void) | null>(null);

    // Expose login trigger to parent
    useImperativeHandle(ref, () => ({
        openLogin: () => {
            setIsLoginModalOpen(true);
            setModalView('options');
        }
    }));

    // If onTriggerLogin is a function, call it? No, that's the wrong way.
    // Let's use a simpler approach: page.tsx has the state, and passes it to Header.


    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Auto-close login modal when user logs in successfully
    useEffect(() => {
        if (user) {
            setIsLoginModalOpen(false);
            setModalView('options');
        }
    }, [user]);

    // Fetch dynamic menu items for mobile quick menu
    useEffect(() => {
        const fetchNavItems = async () => {
            try {
                const endpoint = user ? '/api/user/menu' : '/api/menu/public';
                const response = await api.get(endpoint);
                setNavItems(response.data);
            } catch (error) {
                console.error("Failed to fetch menu in Header", error);
            }
        };
        fetchNavItems();
    }, [user]);

    const menuBg = isDarkMode ? 'bg-[#1e2030] border-indigo-500/30 text-white' : 'bg-white border-orange-100 text-gray-800';
    const itemHover = isDarkMode ? 'hover:bg-white/10' : 'hover:bg-orange-50';



    // 1. Define handleProfileExit first
    const handleProfileExit = () => {
        setIsMenuOpen(false);
        if (activeProfile !== 'adult' && user?.has_pin) {
            setIsPinModalOpen(true);
        } else {
            setActiveProfile(null);
        }
    };

    // Check if user is admin
    const isAdmin = user?.roles?.some((r: any) => r.name === 'admin');
    const isAdultProfile = activeProfile === 'adult';

    const menuItems: MenuItem[] = [
        // 1. Dashboard (Everyone) — torna alla home/dashboard
        { icon: '🏠', label: t('header.menu.dashboard'), action: () => setView('home') },

        // 2. Cambia Profilo (Everyone) — seleziona profilo figlio/adulto
        { icon: '👥', label: t('header.menu.change_profile'), action: handleProfileExit },

        // 3. Il mio profilo — settings page (Adult Only)
        ...(isAdultProfile ? [{
            icon: '⚙️',
            label: t('header.menu.my_settings'),
            action: () => setView('user-profile')
        }] : []),

        // 4. Parents Area (Adult Only)
        ...(isAdultProfile ? [{
            icon: '👨‍👩‍👧',
            label: t('header.menu.parents_area'),
            action: () => setView('parents-area')
        }] : []),

        // 5. Magic Help (Everyone)
        { icon: '🆘', label: t('header.menu.magic_help') },

        // 6. Admin Dashboard (Admin AND Adult Profile ONLY)
        ...(isAdmin && isAdultProfile ? [{
            icon: '🛡️',
            label: t('header.menu.admin_dashboard'),
            action: () => window.location.href = '/admin',
            color: 'text-indigo-600 font-black'
        }] : []),

        // 7. Logout (Everyone)
        { icon: '🚪', label: t('header.menu.logout'), color: 'text-red-500', action: () => { logout(); setView('home'); } },
    ];

    const handlePinVerifySuccess = async (pin: string) => {
        try {
            await api.post('/api/auth/pin/verify', { pin });
            // PIN Correct: Allow exit
            setIsPinModalOpen(false);
            setActiveProfile(null);
        } catch (error) {
            console.error("PIN verification failed", error);
            throw error; // Propagate to PinModal for error UI
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'it' ? 'en' : 'it');
    };

    const getLabel = (label: string) => {
        if (label && label.includes('.') && !label.includes(' ')) {
            return t(label);
        }
        return label;
    };

    return (
        <>
            <header className="flex flex-col p-4 md:p-6 bg-transparent sticky top-0 z-40 backdrop-blur-md transition-all duration-300">

                {/* Mobile: Facebook-style Header Row */}
                <div className="lg:hidden w-full flex items-center gap-2 pb-2">
                    {/* 1. Logo (Left) */}
                    <LogoMobileSVG isDarkMode={isDarkMode} onGoHome={() => setView('home')} />

                    {/* 2. Search Bar (Middle) */}
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={t('header.menu.search_placeholder') || 'Cerca...'}
                            value={searchQuery || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery?.(val);
                                if (val.trim() !== '' && currentView !== 'search') {
                                    setView('search');
                                }
                            }}
                            onFocus={() => {
                                if (currentView !== 'search') {
                                    setView('search');
                                }
                            }}
                            className={`w-full py-2.5 pl-10 pr-4 rounded-full text-xs font-bold border-2 transition-all outline-none ${isDarkMode
                                ? 'bg-indigo-900/40 border-indigo-500/20 text-white placeholder:text-indigo-400 focus:border-indigo-400'
                                : 'bg-gray-100 border-transparent text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-orange-200 shadow-inner'
                                }`}
                        />
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-gray-400'}`} />
                    </div>

                    {/* 3. Grid Icon (Squares) → Opens Nav Menu */}
                    <button
                        onClick={() => setIsNavMenuOpen(true)}
                        className={`p-2.5 rounded-full border-2 transition-all active:scale-90 ${isDarkMode
                            ? 'bg-indigo-900/50 border-indigo-500/30 text-white'
                            : 'bg-white border-orange-100 text-orange-500 shadow-sm'
                            }`}
                        title="Menu"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>

                    {/* 4. Profile Image (Triggers Menu) */}
                    {isAuthenticated ? (
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all active:scale-95 shrink-0 ${isDarkMode ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/20' : 'border-white shadow-md'}`}
                        >
                            <Image
                                src={activeProfile && activeProfile !== 'adult'
                                    ? getAvatarUrl((activeProfile as any).avatar, (activeProfile as any).nickname)
                                    : getAvatarUrl(user?.avatar, user?.name)
                                }
                                alt="User"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsLoginModalOpen(true)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all active:scale-95 shrink-0 ${isDarkMode
                                ? 'bg-indigo-600 border-indigo-400/30 text-white'
                                : 'bg-orange-500 border-white text-white shadow-md'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    )}
                </div>



                {/* DESKTOP CONTROLS (Hidden on Mobile) */}
                <div className="w-full hidden lg:flex items-center justify-between">
                    {/* Spacer/Nav Placeholder */}
                    <div className="flex items-center gap-3"></div>

                    <div className="flex items-center gap-3 md:gap-4">

                        {/* Language Toggle (Desktop) */}
                        <button
                            onClick={toggleLanguage}
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-lg text-xl ${isDarkMode
                                ? 'bg-indigo-600 border-indigo-400/30'
                                : 'bg-white border-orange-200'
                                }`}
                            title="Cambia Lingua / Switch Language"
                        >
                            {language === 'it' ? '🇮🇹' : '🇬🇧'}
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={onToggleTheme}
                            className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg border-2 ${isDarkMode
                                ? 'bg-indigo-600 text-yellow-200 border-indigo-400/30'
                                : 'bg-orange-500 text-white border-orange-400'
                                }`}
                        >
                            {isDarkMode ? `☀️ ${t('header.menu.day_mode')}` : `✨ ${t('header.menu.night_mode')}`}
                        </button>

                        {/* Auth Section: Login Button or Profile */}
                        {!isAuthenticated ? (
                            <div className="relative">
                                {/* Login Button */}
                                <button
                                    onClick={() => setIsLoginModalOpen(!isLoginModalOpen)}
                                    className={`px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-lg border-2 ${isDarkMode
                                        ? 'bg-indigo-600 text-white border-indigo-400/30'
                                        : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white border-white/20'
                                        }`}
                                >
                                    {t('header.login')}
                                </button>

                            </div>
                        ) : (

                            /* Profile with Dropdown Menu (Existing Code) */
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 shadow-inner overflow-hidden ${isDarkMode ? 'bg-indigo-900/50 border-indigo-500/20' : 'bg-orange-50 border-orange-200'
                                        }`}
                                >
                                    {(activeProfile && activeProfile !== 'adult') ? (
                                        <Image
                                            src={getAvatarUrl((activeProfile as any).avatar, (activeProfile as any).nickname)}
                                            alt={(activeProfile as any).nickname}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src={getAvatarUrl(user?.avatar, user?.name)}
                                            alt={user?.name ?? 'Avatar'}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </button>

                                {/* Profile Menu Popover */}
                                {isMenuOpen && (
                                    <div className={`absolute right-0 mt-4 w-64 rounded-[2rem] border-2 shadow-2xl p-3 animate-in fade-in slide-in-from-top-4 duration-300 z-50 ${menuBg}`}>
                                        <div className="px-4 py-3 mb-2 border-b border-transparent">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">{t('header.current_hero')}</p>
                                            <p className="font-black text-lg truncate">
                                                {activeProfile && activeProfile !== 'adult' ? activeProfile.nickname : (user?.name || 'Piccolo Esploratore')}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            {menuItems.map((item, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        if (item.action) {
                                                            item.action();
                                                        }
                                                    }}
                                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all cursor-pointer text-sm ${itemHover} ${item.color || ''}`}
                                                >
                                                    <span className="text-xl">{item.icon}</span>
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div >
            </header >

            {/* PROFILO DRAWER (avatar button) — entra da sinistra */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-50 flex flex-row-reverse lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    {/* Drawer panel */}
                    <div
                        className={`relative h-full w-4/5 max-w-xs flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 ${isDarkMode ? 'bg-[#1a1c31]' : 'bg-white'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header: EROE ATTUALE + nome */}
                        <div className={`px-6 pt-8 pb-5 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-400' : 'text-gray-400'
                                    }`}>
                                    {activeProfile === 'adult' ? t('header.parent') : 'Eroe Attuale'}
                                </p>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                {activeProfile === 'adult' ? user?.name : (activeProfile?.nickname || t('header.guest'))}
                            </p>
                        </div>

                        {/* Voci menu */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">

                            {/* Dashboard */}
                            <button onClick={() => { setIsMobileMenuOpen(false); setView('home'); }}
                                className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${isDarkMode
                                    ? 'text-white hover:bg-indigo-500/10'
                                    : 'text-gray-800 hover:bg-orange-50'
                                    }`}>
                                <span className="text-2xl shrink-0">🏠</span>
                                <span className="text-base font-bold">Dashboard</span>
                            </button>

                            {/* Cambia Profilo */}
                            {isAuthenticated && (
                                <button onClick={() => { setIsMobileMenuOpen(false); handleProfileExit(); }}
                                    className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${isDarkMode ? 'text-white hover:bg-indigo-500/10' : 'text-gray-800 hover:bg-orange-50'
                                        }`}>
                                    <span className="text-2xl shrink-0">👥</span>
                                    <span className="text-base font-bold">{t('header.menu.change_profile')}</span>
                                </button>
                            )}

                            {/* Il mio profilo (adult only) */}
                            {isAuthenticated && activeProfile === 'adult' && (
                                <button onClick={() => { setIsMobileMenuOpen(false); setView('user-profile'); }}
                                    className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${isDarkMode ? 'text-white hover:bg-indigo-500/10' : 'text-gray-800 hover:bg-orange-50'
                                        }`}>
                                    <span className="text-2xl shrink-0">⚙️</span>
                                    <span className="text-base font-bold">{t('header.menu.my_settings')}</span>
                                </button>
                            )}

                            {/* Area Genitori (adult only) */}
                            {isAuthenticated && activeProfile === 'adult' && (
                                <button onClick={() => { setIsMobileMenuOpen(false); setView('parents-area'); }}
                                    className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${isDarkMode ? 'text-white hover:bg-indigo-500/10' : 'text-gray-800 hover:bg-orange-50'
                                        }`}>
                                    <span className="text-2xl shrink-0">👨‍👩‍👧</span>
                                    <span className="text-base font-bold">{t('header.menu.parents_area')}</span>
                                </button>
                            )}

                            {/* Tema */}
                            <button onClick={() => { setIsMobileMenuOpen(false); onToggleTheme(); }}
                                className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${isDarkMode ? 'text-white hover:bg-indigo-500/10' : 'text-gray-800 hover:bg-orange-50'
                                    }`}>
                                <span className="text-2xl shrink-0">{isDarkMode ? '☀️' : '✨'}</span>
                                <span className="text-base font-bold">{isDarkMode ? t('header.menu.day_mode_full') : t('header.menu.night_mode_full')}</span>
                            </button>

                            {/* Lingua */}
                            <button onClick={() => { setIsMobileMenuOpen(false); toggleLanguage(); }}
                                className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${isDarkMode ? 'text-white hover:bg-indigo-500/10' : 'text-gray-800 hover:bg-orange-50'
                                    }`}>
                                <span className="text-2xl shrink-0">{language === 'it' ? '🇮🇹' : '🇬🇧'}</span>
                                <span className="text-base font-bold">{language === 'it' ? 'Italiano' : 'English'}</span>
                            </button>
                        </div>

                        {/* Esci / Login — fissato in fondo */}
                        <div className={`p-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-100'
                            }`}>
                            {isAuthenticated ? (
                                <button onClick={() => { setIsMobileMenuOpen(false); logout(); setView('home'); }}
                                    className="flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                                    <span className="text-2xl shrink-0">🚪</span>
                                    <span className="text-base font-bold">{t('header.menu.logout')}</span>
                                </button>
                            ) : (
                                <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl font-bold bg-orange-500 text-white shadow-lg hover:scale-105 transition-all">
                                    {t('header.menu.login_to_start')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Backdrop — click per chiudere */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" />
                </div>
            )}

            {/* NAV DRAWER (4-squares button) — entra da sinistra */}
            {isNavMenuOpen && (
                <div
                    className="fixed inset-0 z-50 flex flex-row-reverse lg:hidden"
                    onClick={() => setIsNavMenuOpen(false)}
                >
                    {/* Drawer panel */}
                    <div
                        className={`relative h-full w-4/5 max-w-xs flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 ${isDarkMode ? 'bg-[#1a1c31]' : 'bg-white'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between px-6 pt-8 pb-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'
                            }`}>
                            <span className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-indigo-300' : 'text-orange-500'
                                }`}>
                                Menu
                            </span>
                            <button
                                onClick={() => setIsNavMenuOpen(false)}
                                className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-500'
                                    }`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Voci di navigazione */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-1">
                            {navItems.filter(item => {
                                if (!item.roles || item.roles.length === 0) return true;
                                const requiredRole = activeProfile === 'adult' ? 'parent' : 'kid';
                                return item.roles.some((r: any) => r.name === requiredRole);
                            }).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setIsNavMenuOpen(false); setView(item.route as ViewType); }}
                                    className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl font-bold transition-all active:scale-95 ${currentView === item.route
                                        ? isDarkMode
                                            ? 'bg-indigo-500/20 text-indigo-100'
                                            : 'bg-orange-50 text-orange-700'
                                        : isDarkMode
                                            ? 'text-white hover:bg-indigo-500/10'
                                            : 'text-gray-800 hover:bg-orange-50'
                                        }`}
                                >
                                    <span className="text-2xl shrink-0">{item.icon}</span>
                                    <span className="text-base font-bold">{getLabel(item.label)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Backdrop — click per chiudere */}
                    <div className="flex-1 bg-black/40 backdrop-blur-sm" />
                </div>
            )}

            {/* LOGIN MODAL (Universal) */}
            {
                isLoginModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-end lg:items-start justify-center lg:justify-end lg:px-6 lg:pt-20 bg-black/50 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none" onClick={() => setIsLoginModalOpen(false)}>
                        <div
                            className={`w-full lg:w-80 rounded-t-[2rem] lg:rounded-[2rem] border-2 shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 lg:animate-in lg:fade-in lg:slide-in-from-top-4 ${menuBg}`}
                            onClick={(e) => e.stopPropagation()} // Prevent close on content click
                        >
                            <div className="lg:hidden w-12 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-6" /> {/* Mobile Drag Handle */}

                            {modalView === 'options' && (
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{t('header.welcome')}</h3>
                                        <p className={`text-xs font-medium ${isDarkMode ? 'text-indigo-200' : 'text-gray-500'}`}>{t('header.login_subtitle')}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={() => { onLogin?.('google'); setIsLoginModalOpen(false); }}
                                            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold bg-white text-gray-700 border-2 border-gray-100 hover:bg-gray-50 transition-all shadow-sm group"
                                        >
                                            <span className="text-lg group-hover:scale-110 transition-transform">G</span>
                                            {t('header.continue_google')}
                                        </button>

                                        <button
                                            onClick={() => setModalView('email_login')}
                                            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold border-2 transition-all shadow-sm ${isDarkMode
                                                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/20'
                                                : 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100'
                                                }`}
                                        >
                                            <span>✉️</span>
                                            {t('header.use_email')}
                                        </button>
                                    </div>
                                </>
                            )}

                            {modalView === 'email_login' && (
                                <LoginForm
                                    onCancel={() => setModalView('options')}
                                    onRegisterClick={() => setModalView('register')}
                                    onForgotPasswordClick={() => setModalView('forgot_password')}
                                />
                            )}

                            {modalView === 'register' && (
                                <RegisterForm
                                    onCancel={() => setModalView('options')}
                                    onLoginClick={() => setModalView('email_login')}
                                />
                            )}

                            {modalView === 'forgot_password' && (
                                <ForgotPasswordForm
                                    onCancel={() => setModalView('options')}
                                    onBackToLogin={() => setModalView('email_login')}
                                />
                            )}
                        </div>
                    </div>
                )
            }

            {/* PIN MODAL */}
            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handlePinVerifySuccess}
                title="Inserisci PIN Genitore per Uscire"
            />
        </>
    );
});

export default Header