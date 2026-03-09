'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { ViewType } from '@/app/types';
import { Loader2, Eye, EyeOff, Check, AlertCircle, User, Mail, Lock, ChevronLeft } from 'lucide-react';
import api, { getCsrfToken } from '@/app/lib/api';
import { AvatarPickerModal, AVATAR_SEEDS, getAvatarSeedUrl } from '@/app/_components/AvatarPickerModal';
import { getAvatarUrl } from '@/app/lib/avatar';

interface UserProfileProps {
    isDarkMode: boolean;
    setView: (v: ViewType) => void;
}

type TabType = 'info' | 'password';

interface FeedbackState {
    type: 'success' | 'error' | null;
    message: string;
}

export default function UserProfile({ isDarkMode, setView }: UserProfileProps) {
    const { user, setUser } = useAuth();

    const [tab, setTab] = useState<TabType>('info');

    // ── Avatar
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    // Derive current seed from user.avatar if it's already a seed (not a full URL)
    const currentSeed = user?.avatar && !user.avatar.startsWith('http') ? user.avatar : null;
    const [selectedSeed, setSelectedSeed] = useState<string>(currentSeed ?? AVATAR_SEEDS[0]);
    const [avatarBusy, setAvatarBusy] = useState(false);

    // Sync selectedSeed with user's actual avatar seed whenever user changes
    useEffect(() => {
        if (user?.avatar && !user.avatar.startsWith('http')) {
            setSelectedSeed(user.avatar);
        }
    }, [user?.avatar]);

    const handleAvatarSeedSelect = (seed: string) => {
        setSelectedSeed(seed);
    };

    const handleAvatarConfirm = async (seed: string) => {
        setAvatarBusy(true);
        try {
            await getCsrfToken();
            const res = await api.post('/api/auth/profile/avatar-seed', { seed });
            if (typeof setUser === 'function') setUser(res.data.user);
            ok('Avatar aggiornato!');
        } catch (err: any) {
            fail(err.response?.data?.message || 'Errore durante il salvataggio.');
        } finally {
            setAvatarBusy(false);
        }
    };

    // ── Info Tab state
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');

    // ── Password Tab state
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    // ── Shared
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' });

    const ok = (msg: string) => setFeedback({ type: 'success', message: msg });
    const fail = (msg: string) => setFeedback({ type: 'error', message: msg });
    const clear = () => setFeedback({ type: null, message: '' });

    // ── Update name / email
    const handleUpdateInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        clear();
        setBusy(true);
        try {
            await getCsrfToken();
            const res = await api.put('/api/auth/profile', { name, email });
            if (typeof setUser === 'function') setUser(res.data.user);
            ok('Profilo aggiornato con successo!');
        } catch (err: any) {
            fail(err.response?.data?.message || 'Errore durante l\'aggiornamento.');
        } finally {
            setBusy(false);
        }
    };

    // ── Update password
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        clear();
        if (newPwd !== confirmPwd) { fail('Le nuove password non coincidono.'); return; }
        if (newPwd.length < 8) { fail('La password deve essere di almeno 8 caratteri.'); return; }
        setBusy(true);
        try {
            await getCsrfToken();
            await api.put('/api/auth/profile/password', {
                current_password: currentPwd,
                password: newPwd,
                password_confirmation: confirmPwd,
            });
            ok('Password cambiata con successo!');
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
        } catch (err: any) {
            fail(err.response?.data?.message || 'Errore durante il cambio password.');
        } finally {
            setBusy(false);
        }
    };

    // ── Helpers
    const inputCls = `w-full h-12 px-4 rounded-2xl border-2 outline-none font-medium text-base transition-all
        ${isDarkMode
            ? 'bg-white/5 border-white/10 text-white focus:border-[#9d319e] placeholder:text-white/30'
            : 'bg-white border-gray-200 text-gray-800 focus:border-[#9d319e] placeholder:text-gray-300'}`;

    const labelCls = `block text-xs font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-purple-300' : 'text-[#4a1d96]'}`;

    return (
        <>
            <div className="w-full max-w-[680px] mx-auto px-4 md:px-6 py-10 animate-in fade-in duration-300">

                {/* ── Back + Title ─────────────────────────────────────────── */}
                <button
                    onClick={() => setView('home')}
                    className={`flex items-center gap-2 mb-8 text-sm font-bold transition-opacity hover:opacity-70 ${isDarkMode ? 'text-purple-300' : 'text-[#9d319e]'}`}
                >
                    <ChevronLeft className="w-5 h-5" /> Torna alla home
                </button>

                {/* ── Avatar + Name ────────────────────────────────────────── */}
                <div className="flex items-center gap-5 mb-10">
                    {/* Avatar cliccabile → apre picker */}
                    <div className="relative flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowAvatarPicker(true)}
                            className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-200 shadow-xl group relative focus:outline-none focus:ring-4 focus:ring-purple-300 bg-white"
                            title="Cambia avatar"
                        >
                            <img
                                src={getAvatarUrl(user?.avatar, user?.name)}
                                alt={user?.name ?? 'Avatar'}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {avatarBusy
                                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                                    : <span className="text-2xl" role="img" aria-label="modifica">✏️</span>}
                            </div>
                        </button>
                        {/* Badge */}
                        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#9d319e] flex items-center justify-center shadow-md pointer-events-none">
                            <span className="text-[10px]">✏️</span>
                        </div>
                    </div>
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-[#4a1d96]'}`}>
                            {user?.name}
                        </h1>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-gray-400'}`}>
                            {user?.email}
                        </p>
                        <p className="text-xs text-[#9d319e] font-bold mt-1 cursor-pointer hover:underline" onClick={() => setShowAvatarPicker(true)}>
                            Cambia avatar
                        </p>
                    </div>
                </div>

                {/* ── Tab switcher ──────────────────────────────────────────── */}
                <div className={`flex mb-8 rounded-2xl p-1 gap-1 ${isDarkMode ? 'bg-white/5' : 'bg-[#f4f0ff]'}`}>
                    {([
                        { id: 'info', icon: <User className="w-4 h-4" />, label: 'Dati Personali' },
                        { id: 'password', icon: <Lock className="w-4 h-4" />, label: 'Cambia Password' },
                    ] as { id: TabType; icon: React.ReactNode; label: string }[]).map(t => (
                        <button
                            key={t.id}
                            onClick={() => { setTab(t.id); clear(); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${tab === t.id
                                ? 'bg-white shadow-md text-[#9d319e]'
                                : isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* ── Feedback Banner ──────────────────────────────────────── */}
                {feedback.type && (
                    <div className={`flex items-center gap-3 p-4 rounded-2xl mb-6 font-semibold text-sm border-2 ${feedback.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                        {feedback.type === 'success'
                            ? <Check className="w-5 h-5 flex-shrink-0" />
                            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        }
                        {feedback.message}
                    </div>
                )}

                {/* ── INFO TAB ─────────────────────────────────────────────── */}
                {tab === 'info' && (
                    <form onSubmit={handleUpdateInfo} className="space-y-5">
                        <div>
                            <label className={labelCls}>Nome</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Il tuo nome"
                                    className={inputCls + ' pl-12'}
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="la-tua@email.com"
                                    className={inputCls + ' pl-12'}
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={busy}
                            className="w-full h-14 rounded-2xl font-black text-base text-white uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                            style={{ background: 'linear-gradient(135deg, #9d319e, #ff0080)' }}
                        >
                            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                                <Check className="w-5 h-5" /> Salva Modifiche
                            </>}
                        </button>
                    </form>
                )}

                {/* ── PASSWORD TAB ──────────────────────────────────────────── */}
                {tab === 'password' && (
                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                        <div>
                            <label className={labelCls}>Password attuale</label>
                            <div className="relative">
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    required
                                    value={currentPwd}
                                    onChange={e => setCurrentPwd(e.target.value)}
                                    placeholder="••••••••"
                                    className={inputCls + ' pl-12 pr-12'}
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                <button type="button" onClick={() => setShowPwd(p => !p)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#9d319e] transition-colors">
                                    {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Nuova password</label>
                            <div className="relative">
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    required
                                    value={newPwd}
                                    onChange={e => setNewPwd(e.target.value)}
                                    placeholder="Almeno 8 caratteri"
                                    className={inputCls + ' pl-12'}
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Conferma nuova password</label>
                            <div className="relative">
                                <input
                                    type={showPwd ? 'text' : 'password'}
                                    required
                                    value={confirmPwd}
                                    onChange={e => setConfirmPwd(e.target.value)}
                                    placeholder="Ripeti la nuova password"
                                    className={inputCls + ' pl-12'}
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            </div>

                            {/* Strength indicator */}
                            {newPwd && (
                                <div className="mt-2 flex gap-1">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${newPwd.length > i * 3
                                            ? i < 2 ? 'bg-orange-400' : i < 3 ? 'bg-yellow-400' : 'bg-green-500'
                                            : isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                                            }`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={busy}
                            className="w-full h-14 rounded-2xl font-black text-base text-white uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                            style={{ background: 'linear-gradient(135deg, #9d319e, #ff0080)' }}
                        >
                            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                                <Lock className="w-5 h-5" /> Cambia Password
                            </>}
                        </button>
                    </form>
                )}
            </div>

            <AvatarPickerModal
                isOpen={showAvatarPicker}
                onClose={() => setShowAvatarPicker(false)}
                onConfirm={handleAvatarConfirm}
                currentSeed={selectedSeed}
                onSelect={handleAvatarSeedSelect}
                isDarkMode={isDarkMode}
            />
        </>
    );
}
