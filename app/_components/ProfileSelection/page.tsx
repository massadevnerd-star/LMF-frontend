'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { ViewType, ChildProfile } from '@/app/types';
import api from '@/app/lib/api';
import { Loader2, User as UserIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PinModal from '@/app/_components/PinModal/page';
import { getAvatarUrl } from '@/app/lib/avatar';

interface ProfileSelectionProps {
    isDarkMode?: boolean;
    setView?: (view: ViewType) => void;
}

export default function ProfileSelection({ isDarkMode, setView }: ProfileSelectionProps) {
    const { user, setActiveProfile } = useAuth();
    const { t } = useLanguage();
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const response = await api.get('/api/auth/children');
                setChildren(response.data);
            } catch (err) {
                console.error("Failed to fetch children profiles", err);
                setChildren([]);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchChildren();
        }
    }, [user]);

    const handleProfileSelect = (profile: ChildProfile | 'adult') => {
        if (profile === 'adult' && user?.has_pin) {
            setIsPinModalOpen(true);
            return;
        }

        setActiveProfile(profile);
        if (setView) {
            setView('home');
        }
    };

    const handlePinVerifySuccess = async (pin: string) => {
        console.log(`[MOBILE-DEBUG] ProfileSelection: Verifying PIN "${pin}"...`);
        try {
            const response = await api.post('/api/auth/pin/verify-current', { pin });
            console.log('[MOBILE-DEBUG] ProfileSelection: PIN valid response', response.data);
            setIsPinModalOpen(false);
            setActiveProfile('adult');
            if (setView) {
                setView('home');
            }
        } catch (error: any) {
            const errorDetails = {
                status: error.response?.status,
                data: error.response?.data
            };
            console.error(`[MOBILE-DEBUG] ProfileSelection: PIN verify failed: ${JSON.stringify(errorDetails)}`);
            throw error;
        }
    };

    if (!user) return null;

    return (
        <div className={`flex flex-col items-center justify-center p-4 font-sans h-full w-full ${isDarkMode ? 'text-white' : ''}`}>
            <div className="text-center mb-10 mt-28 md:mt-0">
                <h1 className={`text-3xl md:text-4xl font-black mb-2 ${isDarkMode ? 'text-indigo-300' : 'text-[#5b21b6]'}`}>
                    {t('profile_selection.who_is_reading')}
                </h1>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {t('profile_selection.choose_profile')}
                </p>
            </div>

            {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 max-w-4xl">
                    {/* ADULT PROFILE */}
                    <div
                        onClick={() => handleProfileSelect('adult')}
                        className="flex flex-col items-center group cursor-pointer"
                    >
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden mb-4 border-4 border-transparent group-hover:border-purple-500 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105 relative bg-white">
                            <img
                                src={getAvatarUrl(user.avatar, user.name)}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-black/40 h-8 flex items-center justify-center backdrop-blur-sm">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('header.parent')}</span>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {user.name}
                        </span>
                    </div>

                    {/* CHILDREN PROFILES */}
                    {children.map(child => (
                        <div
                            key={child.id}
                            onClick={() => handleProfileSelect(child)}
                            className="flex flex-col items-center group cursor-pointer"
                        >
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden mb-4 border-4 border-transparent group-hover:border-yellow-400 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105 bg-white">
                                <img
                                    src={getAvatarUrl(child.avatar, child.nickname)}
                                    alt={child.nickname}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-200 group-hover:text-yellow-500 transition-colors">
                                {child.nickname}
                            </span>
                        </div>
                    ))}

                    {/* ADD PROFILE BUTTON (Placeholder) */}
                    <div className="flex flex-col items-center group cursor-not-allowed opacity-50">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 mb-4">
                            <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-400">
                            {t('profile_selection.add_profile')} {t('profile_selection.coming_soon')}
                        </span>
                    </div>

                </div>
            )}

            <PinModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handlePinVerifySuccess}
                title={t('header.pin_modal_title') // Reusing header title or add specific one if needed
                }
            />
        </div>
    );
}
