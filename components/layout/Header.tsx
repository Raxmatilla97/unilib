"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Search, User, BookOpen, Users, LayoutDashboard, Award, Menu, X, Sun, Moon, LogOut, Quote, Sparkles, Info, Mail, Trophy, Calendar } from 'lucide-react';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/library?q=${encodeURIComponent(searchQuery)}`);
            setIsMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        router.push('/');
    };

    // Landing page'da boshqa tugmalar
    const isLandingPage = pathname === '/';

    const navItems = isLandingPage ? [
        { href: '/library', label: 'Kutubxona', icon: BookOpen },
        { href: '#features', label: 'Xususiyatlar', icon: Sparkles },
        { href: '#about', label: 'Biz haqimizda', icon: Info },
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

    // Don't show header on admin pages (they have their own header)
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4 md:px-6 justify-between">
                {/* Logo - Always show */}
                <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-lg md:text-xl">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <span className="hidden sm:inline">UniLib</span>
                </Link>

                {/* Desktop Nav - Only on landing page (sidebar handles logged-in navigation) */}
                {isLandingPage && (
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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

                    {/* Notifications - Hidden on mobile to save space */}
                    {user && (
                        <div className="hidden md:block">
                            <NotificationBell />
                        </div>
                    )}

                    {/* Theme */}
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
                        <div className="hidden md:block relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm text-white hover:scale-105 transition-transform"
                                aria-label="User menu"
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </button>
                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg z-50 p-2">
                                        <div className="px-3 py-2 border-b border-border mb-2">
                                            <p className="font-semibold text-sm">{user.name}</p>
                                        </div>
                                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                                            <User className="w-4 h-4" />
                                            Profil
                                        </Link>
                                        <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Kabinet
                                        </Link>
                                        <div className="my-2 border-t border-border" />
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <LogOut className="w-4 h-4" />
                                            Chiqish
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="hidden md:flex px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                            Kirish
                        </Link>
                    )}

                    {/* Mobile Button - Larger touch target */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2.5 rounded-lg hover:bg-muted/50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu - Improved spacing and touch targets */}
            <div className={`md:hidden border-t border-border bg-card ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                <div className="container px-4 py-4 space-y-2">
                    {/* Search - Larger touch target */}
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

                    {/* Mobile Nav - Show when logged in or on landing page */}
                    {(user || isLandingPage) && navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
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
                            <Link
                                href="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-background hover:bg-muted transition-colors min-h-[48px] text-base"
                            >
                                <User className="w-5 h-5 flex-shrink-0" />
                                Profil
                            </Link>
                            <button
                                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors min-h-[48px] text-base"
                            >
                                <LogOut className="w-5 h-5 flex-shrink-0" />
                                Chiqish
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
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
