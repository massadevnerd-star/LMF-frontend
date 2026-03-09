'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ViewType } from '@/app/types';
import { Eye, EyeOff, Loader2, ArrowRight, X } from 'lucide-react';

// Build-time: true solo quando si fa npm run mobile:build
const IS_MOBILE_BUILD = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile';

// ─── MONSTER SVG ICONS ───────────────────────────────────────────────────────
// Pixel-art style SVG characters – inline so no external assets needed

const MonsterSVGs: Record<string, React.ReactNode> = {
    grumolo: (
        <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Pixel-art purple blob monster */}
            <rect x="20" y="12" width="24" height="4" fill="#7c3aed" />
            <rect x="16" y="16" width="32" height="4" fill="#7c3aed" />
            <rect x="12" y="20" width="40" height="16" fill="#7c3aed" />
            <rect x="10" y="24" width="4" height="8" fill="#7c3aed" />
            <rect x="50" y="24" width="4" height="8" fill="#7c3aed" />
            <rect x="12" y="36" width="40" height="8" fill="#7c3aed" />
            <rect x="16" y="44" width="6" height="8" fill="#7c3aed" />
            <rect x="42" y="44" width="6" height="8" fill="#7c3aed" />
            {/* eyes */}
            <rect x="20" y="24" width="8" height="8" fill="#fff" />
            <rect x="36" y="24" width="8" height="8" fill="#fff" />
            <rect x="22" y="26" width="4" height="4" fill="#1e1b4b" />
            <rect x="38" y="26" width="4" height="4" fill="#1e1b4b" />
            {/* angry brows */}
            <rect x="19" y="22" width="10" height="2" fill="#4c1d95" transform="rotate(-10,24,23)" />
            <rect x="35" y="22" width="10" height="2" fill="#4c1d95" transform="rotate(10,40,23)" />
        </svg>
    ),
    blinky: (
        <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Round blue eyeball character */}
            <circle cx="32" cy="32" r="22" fill="#dbeafe" />
            <circle cx="32" cy="32" r="22" fill="none" stroke="#2563eb" strokeWidth="3" />
            {/* big eye */}
            <circle cx="32" cy="32" r="12" fill="#2563eb" />
            <circle cx="32" cy="32" r="8" fill="#1e40af" />
            <circle cx="32" cy="32" r="5" fill="#1e1b4b" />
            <circle cx="29" cy="29" r="2" fill="#fff" />
            {/* lashes */}
            <line x1="32" y1="10" x2="32" y2="6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="21" y1="13" x2="18" y2="10" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="43" y1="13" x2="46" y2="10" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    ),
    zanka: (
        <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Cute dinosaur */}
            <ellipse cx="36" cy="38" rx="18" ry="14" fill="#16a34a" />
            <ellipse cx="18" cy="40" rx="8" ry="6" fill="#16a34a" />
            <ellipse cx="17" cy="38" rx="5" ry="4" fill="#4ade80" />
            <circle cx="14" cy="36" r="3" fill="#16a34a" />
            {/* tail */}
            <ellipse cx="52" cy="44" rx="8" ry="4" fill="#16a34a" transform="rotate(-20,52,44)" />
            <ellipse cx="58" cy="48" rx="5" ry="3" fill="#16a34a" transform="rotate(-30,58,48)" />
            {/* eye */}
            <circle cx="22" cy="36" r="4" fill="#fff" />
            <circle cx="22" cy="36" r="2" fill="#1e1b4b" />
            <circle cx="21" cy="35" r="1" fill="#fff" />
            {/* nostril */}
            <circle cx="13" cy="38" r="1" fill="#15803d" />
            {/* legs */}
            <rect x="28" y="50" width="6" height="8" rx="3" fill="#16a34a" />
            <rect x="38" y="50" width="6" height="8" rx="3" fill="#16a34a" />
            {/* spikes */}
            <polygon points="30,24 34,16 38,24" fill="#15803d" />
            <polygon points="36,22 40,14 44,22" fill="#15803d" />
        </svg>
    ),
    soffio: (
        <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Fluffy cloud character */}
            <circle cx="24" cy="38" r="14" fill="#e2e8f0" />
            <circle cx="40" cy="38" r="14" fill="#e2e8f0" />
            <circle cx="32" cy="28" r="16" fill="#e2e8f0" />
            <circle cx="20" cy="32" r="10" fill="#f1f5f9" />
            <circle cx="44" cy="32" r="10" fill="#f1f5f9" />
            {/* face */}
            <circle cx="27" cy="30" r="3" fill="#fff" />
            <circle cx="37" cy="30" r="3" fill="#fff" />
            <circle cx="27" cy="31" r="2" fill="#475569" />
            <circle cx="37" cy="31" r="2" fill="#475569" />
            <path d="M28 36 Q32 40 36 36" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            {/* cheeks */}
            <circle cx="22" cy="35" r="4" fill="#fda4af" opacity="0.5" />
            <circle cx="42" cy="35" r="4" fill="#fda4af" opacity="0.5" />
        </svg>
    ),
    scintilla: (
        <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Unicorn head */}
            <ellipse cx="32" cy="38" rx="20" ry="18" fill="#e0f2fe" />
            <ellipse cx="14" cy="30" rx="10" ry="12" fill="#bae6fd" />
            {/* horn */}
            <polygon points="14,18 18,4 22,18" fill="#fbbf24" />
            <line x1="15" y1="16" x2="17" y2="8" stroke="#f59e0b" strokeWidth="1" />
            <line x1="18" y1="16" x2="20" y2="8" stroke="#f59e0b" strokeWidth="1" />
            {/* mane */}
            <path d="M22,20 Q18,26 20,34" stroke="#f472b6" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M24,18 Q22,26 24,36" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* eye */}
            <circle cx="20" cy="28" r="5" fill="#fff" />
            <circle cx="20" cy="28" r="3" fill="#1e1b4b" />
            <circle cx="19" cy="27" r="1.5" fill="#fff" />
            {/* nostril */}
            <circle cx="12" cy="34" r="2" fill="#93c5fd" opacity="0.7" />
            {/* ear */}
            <polygon points="8,20 12,12 16,20" fill="#bae6fd" />
            <polygon points="10,20 12,14 14,20" fill="#f9a8d4" />
            {/* stars */}
            <text x="36" y="26" fontSize="10" fill="#fbbf24">✦</text>
            <text x="44" y="36" fontSize="8" fill="#c4b5fd">✦</text>
        </svg>
    ),
    blobbo: (
        <svg viewBox="0 0 64 64" className="w-full h-full">
            {/* Teal soap/sponge blob */}
            <rect x="14" y="20" width="36" height="28" rx="10" fill="#0d9488" />
            <rect x="14" y="20" width="36" height="28" rx="10" fill="url(#blobGrad)" />
            <defs>
                <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
            </defs>
            {/* bubbles */}
            <circle cx="22" cy="30" r="4" fill="#5eead4" opacity="0.7" />
            <circle cx="34" cy="24" r="3" fill="#99f6e4" opacity="0.6" />
            <circle cx="44" cy="32" r="3" fill="#5eead4" opacity="0.7" />
            <circle cx="30" cy="38" r="2" fill="#99f6e4" opacity="0.5" />
            {/* eyes */}
            <circle cx="24" cy="30" r="4" fill="#fff" />
            <circle cx="40" cy="30" r="4" fill="#fff" />
            <circle cx="25" cy="31" r="2" fill="#134e4a" />
            <circle cx="41" cy="31" r="2" fill="#134e4a" />
            <circle cx="24" cy="30" r="1" fill="#fff" />
            <circle cx="40" cy="30" r="1" fill="#fff" />
            {/* smile */}
            <path d="M26 38 Q32 44 38 38" fill="none" stroke="#134e4a" strokeWidth="2" strokeLinecap="round" />
            {/* bumps on top (sponge) */}
            <rect x="18" y="16" width="5" height="6" rx="3" fill="#0d9488" />
            <rect x="26" y="14" width="5" height="8" rx="3" fill="#0d9488" />
            <rect x="34" y="15" width="5" height="7" rx="3" fill="#0d9488" />
            <rect x="42" y="17" width="5" height="5" rx="3" fill="#0d9488" />
        </svg>
    ),
};

// ─── DATA ────────────────────────────────────────────────────────────────────

export interface Monster {
    id: string;
    name: string;
    svgKey: string;
    personality: string;
}

export const MONSTERS: Monster[] = [
    { id: '1', name: 'Grumolo', svgKey: 'grumolo', personality: 'Brontolone ma dal cuore d\'oro' },
    { id: '2', name: 'Blinky', svgKey: 'blinky', personality: 'Curioso e sempre sveglio' },
    { id: '3', name: 'Zanna', svgKey: 'zanka', personality: 'Lento ma saggio' },
    { id: '4', name: 'Soffio', svgKey: 'soffio', personality: 'Leggero come il vento' },
    { id: '5', name: 'Scintilla', svgKey: 'scintilla', personality: 'Brillante e coraggiosa' },
    { id: '6', name: 'Blobbo', svgKey: 'blobbo', personality: 'Morbido e super elastico' },
];

export const THEMES: string[] = [
    'Nello spazio siderale',
    'In fondo al mare blu',
    'In un castello di caramelle',
    'Nella giungla dei giganti',
    'Nel mondo dei sogni',
];

// ─── MONSTER CARD ────────────────────────────────────────────────────────────

function MonsterCard({ monster, isSelected, onSelect }: {
    monster: Monster;
    isSelected: boolean;
    onSelect: (m: Monster) => void;
}) {
    return (
        <button
            onClick={() => onSelect(monster)}
            className={`relative flex flex-col items-center justify-center w-full aspect-square rounded-[1.8rem] transition-all duration-200 group
                ${isSelected
                    ? 'bg-white border-[3px] border-black shadow-xl scale-105'
                    : 'bg-[#f0f4ff] border-[3px] border-transparent hover:bg-[#e6edff] hover:scale-[1.03]'
                }`}
        >
            <div className="w-[60%] h-[60%] mb-1">
                {MonsterSVGs[monster.svgKey]}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-1 transition-colors
                ${isSelected ? 'text-[#ff0080]' : 'text-[#a1b3d5]'}`}
            >
                {monster.name}
            </span>

            {isSelected && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#ff4444] border-[2.5px] border-white rounded-full flex items-center justify-center text-white text-xs font-black shadow-md z-10">
                    ✓
                </div>
            )}
        </button>
    );
}

// ─── AUTH MODAL ──────────────────────────────────────────────────────────────

function AuthModal({ onClose }: { onClose: () => void }) {
    const { login, register, loginWithGoogle, error } = useAuth();
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (tab === 'register' && password !== confirm) {
            setLocalError('Le password non coincidono.');
            return;
        }
        setBusy(true);
        try {
            if (tab === 'login') await login({ email, password });
            else await register({ name, email, password, password_confirmation: confirm });
            onClose();
        } catch (err: any) {
            setLocalError(err.response?.data?.message || 'Qualcosa è andato storto.');
        } finally {
            setBusy(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md mx-4 bg-white rounded-[2.5rem] shadow-2xl border-4 border-purple-100 overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#4a1d96] to-[#7c3aed] px-8 pt-8 pb-6 text-white">
                    <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="text-4xl mb-3">✨</div>
                    <h2 className="text-2xl font-black">Accedi per creare la tua fiaba!</h2>
                    <p className="text-purple-200 text-sm mt-1">Registrati gratis o accedi con Google</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b-2 border-gray-100">
                    {(['login', 'register'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setLocalError(null); }}
                            className={`flex-1 py-4 font-black text-sm uppercase tracking-wide transition-colors ${tab === t
                                ? 'text-[#9d319e] border-b-2 border-[#9d319e]'
                                : 'text-gray-400 hover:text-purple-400'
                                }`}
                        >
                            {t === 'login' ? '🔑 Accedi' : '🌟 Registrati'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                    {tab === 'register' && (
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                            placeholder="Il tuo nome"
                            className="w-full h-12 px-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none font-medium text-base" />
                    )}
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full h-12 px-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none font-medium text-base" />
                    <div className="relative">
                        <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full h-12 px-4 pr-12 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none font-medium text-base" />
                        <button type="button" onClick={() => setShowPass(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500">
                            {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {tab === 'register' && (
                        <input type={showPass ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)}
                            placeholder="Conferma password"
                            className="w-full h-12 px-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 outline-none font-medium text-base" />
                    )}

                    {displayError && (
                        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 font-semibold text-sm">{displayError}</div>
                    )}

                    <button type="submit" disabled={busy}
                        className="w-full h-14 rounded-2xl font-black text-lg text-white uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #ff8c00, #ff0080)' }}>
                        {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                            {tab === 'login' ? 'Entra!' : 'Crea Account!'}
                            <ArrowRight className="w-5 h-5" />
                        </>}
                    </button>

                    {!IS_MOBILE_BUILD && (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-gray-400 text-xs font-semibold">oppure</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <button type="button" onClick={loginWithGoogle}
                                className="w-full h-12 rounded-2xl border-2 border-gray-200 hover:border-purple-300 font-bold text-gray-700 flex items-center justify-center gap-3 transition-all hover:bg-purple-50">
                                <svg width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continua con Google
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

// ─── STORY GENERATOR ─────────────────────────────────────────────────────────

interface Story { title: string; content: string; moral: string; }
type LoadState = 'idle' | 'loading' | 'success' | 'error';

async function generateFairyTale(monster: Monster, theme: string): Promise<Story> {
    await new Promise(r => setTimeout(r, 1500));
    return {
        title: `${monster.name} e ${theme}`,
        content: `C'era una volta ${monster.name}. Un giorno decise di partire per ${theme}...\n\nLì incontrò amici straordinari e scoprì che il coraggio viene dal cuore.`,
        moral: 'Il vero coraggio è credere in se stessi, anche quando sembra impossibile.',
    };
}

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface MagicFactoryProps {
    isDarkMode: boolean;
    setView: (v: ViewType) => void;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function MagicFactory({ isDarkMode }: MagicFactoryProps) {
    const { user, isLoading } = useAuth();

    const [selectedMonster, setSelectedMonster] = useState<Monster>(MONSTERS[5]);
    const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[4]);
    const [story, setStory] = useState<Story | null>(null);
    const [loadState, setLoadState] = useState<LoadState>('idle');
    const [showAuth, setShowAuth] = useState(false);

    const handleGenerate = async () => {
        if (!user) { setShowAuth(true); return; }
        setLoadState('loading');
        setStory(null);
        try {
            const result = await generateFairyTale(selectedMonster, selectedTheme);
            setStory(result);
            setLoadState('success');
            setTimeout(() => document.getElementById('story-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch {
            setLoadState('error');
        }
    };

    if (isLoading) {
        return <div className="w-full h-full flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-400" /></div>;
    }

    return (
        <>
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            <div className="w-full max-w-[900px] mx-auto px-6 py-10">

                {/* ── 1. Scegli il Protagonista ─────────────────────────── */}
                <section className="mb-14">
                    <div className="flex items-center gap-3 mb-10">
                        <span className="text-2xl">🧩</span>
                        <h2 className="text-xl md:text-2xl font-black text-[#4a1d96] tracking-tight">
                            1. Scegli il tuo Protagonista
                        </h2>
                    </div>

                    {/* Hero preview */}
                    <div className="flex flex-col items-center mb-10">
                        <div
                            className="relative rounded-full p-[3px] shadow-xl"
                            style={{ background: 'linear-gradient(to bottom, #ff8c00, #ff0080)' }}
                        >
                            <div className="w-40 h-40 md:w-52 md:h-52 bg-white rounded-full flex items-center justify-center p-6">
                                {MonsterSVGs[selectedMonster.svgKey]}
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <h3 className="text-4xl md:text-5xl font-black text-[#ff0080] uppercase tracking-tighter">
                                {selectedMonster.name}
                            </h3>
                            <p className="text-sm md:text-base text-gray-400 italic font-semibold mt-1">
                                &ldquo;{selectedMonster.personality}&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Monster grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                        {MONSTERS.map(m => (
                            <MonsterCard
                                key={m.id}
                                monster={m}
                                isSelected={selectedMonster.id === m.id}
                                onSelect={setSelectedMonster}
                            />
                        ))}
                    </div>
                </section>

                {/* ── 2. Dove ambientiamo la storia ─────────────────────── */}
                <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">📖</span>
                        <h2 className="text-xl md:text-2xl font-black text-[#4a1d96] tracking-tight">
                            2. Dove ambientiamo la storia?
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {THEMES.map(t => (
                            <button
                                key={t}
                                onClick={() => setSelectedTheme(t)}
                                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${selectedTheme === t
                                    ? 'bg-white border-[#9d319e] text-[#9d319e] shadow-md scale-105'
                                    : 'bg-[#f0f5ff] border-transparent text-[#a1b3d5] hover:bg-[#e6eeff]'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── CTA ───────────────────────────────────────────────── */}
                <div className="flex justify-center mb-14">
                    <button
                        onClick={handleGenerate}
                        disabled={loadState === 'loading'}
                        className="px-14 py-5 rounded-full text-xl font-black uppercase tracking-widest text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #ff8c00, #ff0080)', boxShadow: '0 8px 32px rgba(255,0,128,0.25)' }}
                    >
                        {loadState === 'loading'
                            ? <><Loader2 className="w-6 h-6 animate-spin" /> Apertura libro...</>
                            : 'Crea la Fiaba'
                        }
                    </button>
                </div>

                {/* ── Story Result ──────────────────────────────────────── */}
                {(loadState === 'loading' || loadState === 'success') && (
                    <div id="story-result" className="pt-10 border-t-2 border-dashed border-[#f0f5ff]">
                        {loadState === 'loading' ? (
                            <div className="text-center py-16">
                                <div className="text-7xl animate-bounce mb-4">📚</div>
                                <p className="text-xl font-black text-indigo-900/30">Inchiostro magico in corso...</p>
                            </div>
                        ) : story && (
                            <article className="max-w-[650px] mx-auto">
                                <h3 className="text-4xl md:text-5xl font-black text-[#ff0080] mb-8 italic leading-tight text-center">
                                    {story.title}
                                </h3>
                                <div className="text-lg md:text-xl text-indigo-900/80 leading-relaxed font-medium space-y-5">
                                    {story.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                                </div>
                                <div className="mt-10 p-8 bg-purple-50 rounded-3xl border-2 border-dashed border-purple-200">
                                    <span className="block text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-2">Il segreto della storia</span>
                                    <p className="text-lg italic font-bold text-purple-900">&ldquo;{story.moral}&rdquo;</p>
                                </div>
                            </article>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
