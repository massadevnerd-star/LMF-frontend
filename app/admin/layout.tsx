'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Menu, BookOpen, Users, LogOut, Shield } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';

// ─── Admin Top Header ────────────────────────────────────────────────────────
function AdminHeader() {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-gray-100 shadow-sm px-8 py-3 flex items-center justify-end sticky top-0 z-30">
            {/* Left: brand + badge */}


            {/* Right: user info + back button */}
            <div className="flex items-center gap-4">
                {user && (
                    <div className="text-right leading-tight">
                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Amministratore</p>
                    </div>
                )}
                <Link href="/">
                    <Button
                        variant="outline"
                        className="gap-2 font-bold border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        Torna al Sito
                    </Button>
                </Link>
            </div>
        </header>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Gestione Menu', href: '/admin/menus', icon: <Menu className="w-5 h-5" /> },
        { label: 'Storie & Crediti', href: '/admin/stories', icon: <BookOpen className="w-5 h-5" /> },
        { label: 'Utenti', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
        {
            label: 'Traduzioni',
            href: '/admin/translations',
            icon: <div className="w-5 h-5 font-bold text-xs flex items-center justify-center border-2 border-current rounded">IT</div>,
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-xl flex flex-col z-10">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-black text-indigo-600 tracking-tight">LMF Admin</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Control Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <div className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all',
                                pathname === item.href
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            )}>
                                {item.icon}
                                {item.label}
                            </div>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => { logout(); }}
                        className="w-full gap-2 justify-start font-bold border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main column: header on top, then content */}
            <main className="flex-1 overflow-auto flex flex-col">
                <AdminHeader />
                <div className="p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
