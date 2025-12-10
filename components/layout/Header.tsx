"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Search, User, BookOpen, Users, LayoutDashboard, Award, Menu, X, Sun, Moon, LogOut, Quote, Sparkles, Info, Mail, Trophy, Calendar, Shield, Star, Zap } from 'lucide-react';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { user, logout, isAdmin } = useAuth();
    const [menuState, setMenuState] = useState({ mobile: false, user: false });
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // ✅ Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Check if click is outside user menu
            if (menuState.user && !target.closest('[data-user-menu]')) {
                setMenuState(prev => ({ ...prev, user: false }));
            }
        };

        if (menuState.user) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [menuState.user]);

    // ✅ Memoized handlers for better performance
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/library?q=${encodeURIComponent(searchQuery)}`);
            setMenuState(prev => ({ ...prev, mobile: false }));
        }
    }, [searchQuery, router]);

    const handleLogout = useCallback(() => {
        logout();
        setMenuState(prev => ({ ...prev, user: false }));
        router.push('/');
    }, [logout, router]);

    const toggleMobileMenu = useCallback(() => {
        setMenuState(prev => ({ ...prev, mobile: !prev.mobile }));
    }, []);

    const toggleUserMenu = useCallback(() => {
        setMenuState(prev => ({ ...prev, user: !prev.user }));
    }, []);

    const isLandingPage = pathname === '/';

    // ✅ Memoized navItems - only recalculate when pathname changes
    const navItems = useMemo(() => {
        return isLandingPage ? [
            { href: '#features', label: 'Xususiyatlar', icon: Sparkles },
            { href: '#about', label: 'Afzalliklar', icon: Star },
            { href: '#contact', label: 'Aloqa', icon: Mail },
        ] : [
            { href: '/dashboard', label: 'Kabinet', icon: LayoutDashboard },
            { href: '/schedule', label: 'O\'qish Rejam', icon: Calendar },
            { href: '/library', label: 'Kutubxona', icon: BookOpen },
            { href: '/groups', label: 'Guruhlar', icon: Users },
            { href: '/achievements', label: 'Yutuqlar', icon: Trophy },
            { href: '/leaderboard', label: 'Reyting', icon: Award },
            { href: '/citations', label: 'Iqtiboslar', icon: Quote },
        ];
    }, [isLandingPage]);

    // Don't show header on admin pages
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm transition-all duration-300">
            <div className={`container flex h-16 items-center px-4 md:px-6 ${isLandingPage ? 'justify-between' : 'justify-end'}`}>
                {/* Logo - Only on landing page */}
                {isLandingPage && (
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all rounded-full"></div>
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-primary/25">
                                <BookOpen className="w-6 h-6" />
                            </div>
                        </div>
                        <span className="font-bold text-xl tracking-tight group-hover:text-primary transition-colors">Library ID</span>
                    </Link>
                )}

                {/* Desktop Nav - Only on landing page */}
                {isLandingPage && (
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    {user && (
                        <form onSubmit={handleSearch} className="hidden lg:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="search"
                                    placeholder="Qidirish..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-[240px] xl:w-[300px] rounded-xl bg-muted/50 border border-transparent pl-10 pr-4 py-2 text-sm focus:bg-background focus:border-primary/20 transition-all outline-none"
                                />
                            </div>
                        </form>
                    )}

                    {/* Notifications */}
                    {user && (
                        <div className="hidden md:block">
                            <NotificationBell />
                        </div>
                    )}

                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 rounded-full hover:bg-muted/50 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    )}

                    {/* User Menu */}
                    {user ? (
                        <div className="hidden md:block relative" data-user-menu>
                            <button
                                onClick={toggleUserMenu}
                                className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm text-white hover:scale-105 transition-transform shadow-md overflow-hidden"
                                aria-label="User menu"
                            >
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '';
                                        }}
                                    />
                                ) : (
                                    <span>
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </button>
                            {menuState.user && (
                                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg z-[70] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2 border-b border-border mb-2">
                                        <p className="font-semibold text-sm">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    {isAdmin() && (
                                        <Link href="/admin" onClick={toggleUserMenu} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors font-medium text-primary">
                                            <Shield className="w-4 h-4" />
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link href="/profile" onClick={toggleUserMenu} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                                        <User className="w-4 h-4" />
                                        Profil
                                    </Link>
                                    <Link href="/dashboard" onClick={toggleUserMenu} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Kabinet
                                    </Link>
                                    <div className="my-2 border-t border-border" />
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <LogOut className="w-4 h-4" />
                                        Chiqish
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="hidden md:flex px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md">
                            Kirish
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2.5 rounded-lg hover:bg-muted/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Toggle menu"
                    >
                        {menuState.mobile ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden border-t border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 ${menuState.mobile ? 'block' : 'hidden'} max-h-[calc(100vh-4rem)] overflow-y-auto`}>
                <div className="container px-4 py-4 space-y-2">
                    {/* Search */}
                    {user && (
                        <form onSubmit={handleSearch} className="mb-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <input
                                    type="search"
                                    placeholder="Qidirish..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg bg-background border border-border pl-11 pr-4 py-3 text-base outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                        </form>
                    )}

                    {/* Mobile Nav */}
                    {(user || isLandingPage) && navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={toggleMobileMenu}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg font-medium text-base min-h-[48px] transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* User Menu Items */}
                    {user ? (
                        <div className="pt-2 border-t border-border space-y-2 mt-3">
                            <div className="px-4 py-2 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm text-white shadow-md overflow-hidden flex-shrink-0">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <span className={user.avatar_url ? 'hidden' : ''}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-base truncate">{user.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>

                            {isAdmin() && (
                                <Link
                                    href="/admin"
                                    onClick={toggleMobileMenu}
                                    className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors min-h-[48px] text-base font-medium"
                                >
                                    <Shield className="w-5 h-5 flex-shrink-0" />
                                    Admin Panel
                                </Link>
                            )}

                            <Link
                                href="/profile"
                                onClick={toggleMobileMenu}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-background hover:bg-muted transition-colors min-h-[48px] text-base"
                            >
                                <User className="w-5 h-5 flex-shrink-0" />
                                Profil
                            </Link>
                            <button
                                onClick={() => { handleLogout(); toggleMobileMenu(); }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors min-h-[48px] text-base"
                            >
                                <LogOut className="w-5 h-5 flex-shrink-0" />
                                Chiqish
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            onClick={toggleMobileMenu}
                            className="block px-4 py-3.5 rounded-lg bg-primary text-primary-foreground text-center font-semibold min-h-[48px] flex items-center justify-center text-base hover:bg-primary/90 transition-colors"
                        >
                            Kirish
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
