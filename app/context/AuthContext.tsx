"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api, { getCsrfToken } from "@/app/lib/api";
import { ChildProfile } from "@/app/types";

// Costante build-time: true solo quando si fa npm run mobile:build
const IS_MOBILE_BUILD = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.8.103:8000';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roles?: { name: string }[];
    has_pin?: boolean;
}

interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (data: any) => Promise<void>;
    loginWithGoogle: () => void;
    register: (data: any) => Promise<{ requiresVerification?: boolean } | void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<any>;
    resetPassword: (data: any) => Promise<any>;
    resendVerification: (email: string) => Promise<any>;
    isLoading: boolean;
    error: string | null;
    activeProfile: ChildProfile | 'adult' | null;
    setActiveProfile: (profile: ChildProfile | 'adult' | null) => void;
    hasStories: boolean;
    refreshHasStories: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeProfile, setActiveProfile] = useState<ChildProfile | 'adult' | null>(null);
    const [hasStories, setHasStories] = useState<boolean>(true); // Default to true to avoid flash of locked scroll
    const router = useRouter();

    const refreshHasStories = async () => {
        try {
            // Check published stories
            const resPublished = await api.get('/api/auth/stories?status=published');
            const hasPublished = Array.isArray(resPublished.data) && resPublished.data.length > 0;

            if (hasPublished) {
                setHasStories(true);
                return;
            }

            // Check drafts
            const resDrafts = await api.get('/api/auth/stories?status=draft');
            const hasDrafts = Array.isArray(resDrafts.data) && resDrafts.data.length > 0;

            setHasStories(hasPublished || hasDrafts);
        } catch (err) {
            console.error('[MOBILE-DEBUG] refreshHasStories failed', err);
            setHasStories(true); // Fallback to true on error
        }
    };

    // Fetch user on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get("/api/user");
                const backendUser = response.data;
                console.log('[MOBILE-DEBUG] AuthContext: fetchUser success', backendUser.email);
                setUser(backendUser);
                // After getting user, check if they have stories
                await refreshHasStories();
            } catch (err: any) {
                console.warn('[MOBILE-DEBUG] AuthContext: fetchUser failed', err.response?.status);
                setUser(null);
                setActiveProfile(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (data: any) => {
        setError(null);
        try {
            if (!IS_MOBILE_BUILD) await getCsrfToken();

            const resp = await api.post('/api/auth/login', data);

            if (resp.data?.access_token) {
                console.log('[MOBILE-DEBUG] AuthContext: login - Token received, saving...');
                localStorage.setItem('auth_token', resp.data.access_token);
            }

            const response = await api.get('/api/user');
            const backendUser = response.data;
            console.log('[MOBILE-DEBUG] AuthContext: login success for', backendUser.email);
            setUser(backendUser);
            await refreshHasStories();
            setActiveProfile(null);
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login fallito');
            throw err;
        }
    };

    const loginWithGoogle = () => {
        window.location.href = `${BACKEND_URL}/api/auth/google/redirect`;
    };

    const register = async (data: any) => {
        setError(null);
        try {
            if (!IS_MOBILE_BUILD) await getCsrfToken();

            const resp = await api.post('/api/auth/register', data);

            // Se il backend risponde che serve verifica email
            if (resp.data?.requiresVerification) {
                return { requiresVerification: true };
            }

            if (resp.data?.access_token) {
                console.log('[MOBILE-DEBUG] AuthContext: register - Token received, saving...');
                localStorage.setItem('auth_token', resp.data.access_token);
            }

            const response = await api.get('/api/user');
            const backendUser = response.data;
            console.log('[MOBILE-DEBUG] AuthContext: register success for', backendUser.email);
            setUser(backendUser);
            router.refresh();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registrazione fallita');
            throw err;
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            if (!IS_MOBILE_BUILD) await getCsrfToken();
            const response = await api.post('/api/auth/forgot-password', { email });
            return response.data;
        } catch (err: any) {
            throw err;
        }
    };

    const resetPassword = async (data: any) => {
        try {
            if (!IS_MOBILE_BUILD) await getCsrfToken();
            const response = await api.post('/api/auth/reset-password', data);
            return response.data;
        } catch (err: any) {
            throw err;
        }
    };

    const resendVerification = async (email: string) => {
        try {
            if (!IS_MOBILE_BUILD) await getCsrfToken();
            const response = await api.post('/api/auth/email/resend', { email });
            return response.data;
        } catch (err: any) {
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            // Clear both session state and any saved Bearer token (Google OAuth)
            console.log('[MOBILE-DEBUG] AuthContext: logging out, clearing token');
            localStorage.removeItem('auth_token');
            setUser(null);
            setActiveProfile(null);
            router.push('/');
        }
    };

    return (
        <AuthContext.Provider value={{
            user, setUser, login, loginWithGoogle, register, logout,
            forgotPassword, resetPassword, resendVerification,
            isLoading, error, activeProfile, setActiveProfile,
            hasStories, refreshHasStories
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
