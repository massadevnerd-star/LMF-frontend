'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { it } from '../locales/it';
import { en } from '../locales/en';

type Language = 'it' | 'en';
type Dictionary = typeof it;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper to get nested properties
const getNestedValue = (obj: any, path: string): string => {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, obj) || path;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('it');

    // Derive dictionary directly from language state. No useEffect sync needed.
    const dictionary = language === 'it' ? it : en;

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'it' || savedLang === 'en')) {
            setLanguage(savedLang);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: string) => {
        return getNestedValue(dictionary, key);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
