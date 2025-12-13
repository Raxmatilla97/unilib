"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    BookOpen,
    Users,
    Award,
    Quote,
    LayoutDashboard,
    ChevronLeft,
    ChevronRight,
    Shield,
    Calendar,
    Trophy,
    User,
    Settings
} from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';

export function Sidebar() {
    const pathname = usePathname();
    const { user, isAdmin } = useAuth();

    // ✅ localStorage for collapse state
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            if (saved !== null) {
                setIsCollapsed(saved === 'true');
            }
        }
    }, []);

    // ✅ Memoized toggle handler
    const toggleCollapse = useCallback(() => {
        setIsCollapsed(prev => {
            const newValue = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('sidebar-collapsed', String(newValue));
            }
            return newValue;
        });
    }, []);

    // Don't show sidebar on auth pages, landing page, or admin pages
    if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin')) {
        return null;
    }

    // ✅ Memoized navItems
    const navItems = useMemo(() => [
        { href: '/dashboard', label: 'Kabinet', icon: LayoutDashboard },
        { href: '/profile', label: 'Profil', icon: User },
        { href: '/library', label: 'Kutubxona', icon: BookOpen },
        { href: '/schedule', label: 'O\'qish Rejam', icon: Calendar },
        { href: '/groups', label: 'Guruhlar', icon: Users },
        { href: '/achievements', label: 'Yutuqlar', icon: Trophy },
        { href: '/leaderboard', label: 'Reyting', icon: Award },
        { href: '/citations', label: 'Iqtiboslar', icon: Quote },
        { href: '/settings', label: 'Sozlamalar', icon: Settings },
    ], []);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col bg-card/80 backdrop-blur-xl border-r border-border/40 h-screen sticky top-0 transition-all duration-300 overflow-x-hidden ${isCollapsed ? 'w-16' : 'w-64'
                }`}>
                {/* Logo */}
                <div className={`h-16 border-b border-border/40 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
                    {!isCollapsed && (
                        <Link href={user ? "/" : "/library"} className="flex items-center gap-2 font-bold text-xl group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:bg-primary/30 transition-all rounded-lg"></div>
                                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                            <span className="group-hover:text-primary transition-colors">Library ID</span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-lg group-hover:bg-primary/30 transition-all rounded-lg"></div>
                            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className={`flex-1 space-y-1 overflow-y-auto ${isCollapsed ? 'p-2 no-scrollbar' : 'p-4'}`}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-[1.01]'
                                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                                title={item.label}
                                aria-label={item.label}
                            >
                                {/* Active Indicator */}
                                {isActive && !isCollapsed && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"></div>
                                )}
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span className="font-medium">{item.label}</span>}
                                {isActive && !isCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                        );
                    })}



                    {/* Admin Panel - Only for admins */}
                    {isAdmin() && (
                        <Link
                            href="/admin"
                            className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group mt-2 border-t border-border/40 pt-4 ${pathname.startsWith('/admin')
                                ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-[1.01]'
                                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                            title="Admin Panel"
                            aria-label="Admin Panel"
                        >
                            {pathname.startsWith('/admin') && !isCollapsed && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full"></div>
                            )}
                            <Shield className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium">Admin Panel</span>}
                            {pathname.startsWith('/admin') && !isCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                    )}
                </nav>

                {/* Login Button for Unauthenticated Users */}
                {!user && !isCollapsed && (
                    <div className="px-4 pb-2">
                        <Link
                            href="/login"
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-[1.02]"
                        >
                            <User className="w-4 h-4" />
                            Kirish
                        </Link>
                    </div>
                )}

                {/* Collapse Toggle */}
                <div className={`border-t border-border/40 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                    <button
                        onClick={toggleCollapse}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all hover:scale-105 ${isCollapsed ? 'px-0' : 'px-4'
                            }`}
                        aria-label={isCollapsed ? 'Kengaytirish' : 'Yig\'ish'}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm">Yig'ish</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
