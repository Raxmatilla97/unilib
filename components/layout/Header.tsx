"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { Search, User, BookOpen, Users, LayoutDashboard, Award, Menu, X, Sun, Moon, LogOut, Quote, Sparkles, Info, Mail } from 'lucide-react';

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
        { href: '/library', label: 'Kutubxona', icon: BookOpen },
        { href: '/groups', label: 'Guruhlar', icon: Users },
        { href: '/leaderboard', label: 'Reyting', icon: Award },
        { href: '/citations', label: 'Iqtiboslar', icon: Quote },
    ];

    // Don't show header on admin pages (they have their own header)
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className={`container flex h-16 items-center px-4 md:px-6 ${(isLandingPage || pathname === '/login' || pathname === '/register') ? 'justify-between' : 'justify-end'}`}>
                {/* Logo - Only on landing page and auth pages */}
                {(isLandingPage || pathname === '/login' || pathname === '/register') && (
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <span className="hidden sm:inline">UniLib</span>
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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
                    <form onSubmit={handleSearch} className="hidden lg:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Qidirish..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-[280px] xl:w-[350px] rounded-xl bg-muted/50 border border-transparent pl-10 pr-4 py-2 text-sm focus:bg-background focus:border-primary/20 transition-all outline-none"
                            />
                        </div>
                    </form>

                    {/* Theme */}
                    {mounted && (
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-full hover:bg-muted/50 transition-colors">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    )}

                    {/* User Menu */}
                    {user ? (
                        <div className="hidden md:block relative">
                            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-sm text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </button>
                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg z-50 p-2">
                                        <div className="px-3 py-2 border-b border-border mb-2">
                                            <p className="font-semibold text-sm">{user.name}</p>
                                        </div>
                                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg">
                                            <User className="w-4 h-4" />
                                            Profil
                                        </Link>
                                        <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Kabinet
                                        </Link>
                                        <div className="my-2 border-t border-border" />
                                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg">
                                            <LogOut className="w-4 h-4" />
                                            Chiqish
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="hidden md:flex px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                            Kirish
                        </Link>
                    )}

                    {/* Mobile Button */}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted/50">
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden border-t border-border bg-card ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                <div className="container px-4 py-4 space-y-3">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Qidirish..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg bg-background border border-border pl-10 pr-4 py-2.5 text-sm outline-none"
                            />
                        </div>
                    </form>

                    {/* Mobile Nav - Only on landing page */}
                    {isLandingPage && navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive ? 'bg-primary/10 text-primary' : 'bg-background hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}

                    {user ? (
                        <div className="pt-3 border-t border-border space-y-2">
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background hover:bg-muted">
                                <User className="w-5 h-5" />
                                Profil
                            </Link>
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-background hover:bg-muted">
                                <LayoutDashboard className="w-5 h-5" />
                                Kabinet
                            </Link>
                            <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20">
                                <LogOut className="w-5 h-5" />
                                Chiqish
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg bg-primary text-primary-foreground text-center font-semibold">
                            Kirish
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
