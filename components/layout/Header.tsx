"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Bell, User, BookOpen, Users, LayoutDashboard, Award, Menu, X, Sun, Moon, LogOut, Settings, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
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

    const navItems = [
        { href: '/library', icon: BookOpen, label: 'Kutubxona' },
        { href: '/groups', icon: Users, label: 'Guruhlar' },
        { href: '/dashboard', icon: LayoutDashboard, label: 'Kabinet' },
        { href: '/leaderboard', icon: Award, label: 'Reyting' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/20 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight group">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-foreground group-hover:text-primary transition-colors">UniLib</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar (Desktop) */}
                    <form onSubmit={handleSearch} className="hidden md:flex relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="search"
                            placeholder="Qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl bg-muted/50 border border-transparent pl-10 pr-4 py-2 text-sm focus:bg-background focus:border-primary/20 focus:shadow-sm transition-all outline-none placeholder:text-muted-foreground/70"
                        />
                    </form>

                    {/* Theme Toggle */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    )}

                    {/* Notifications - only show when logged in */}
                    {user && (
                        <button className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-background" />
                        </button>
                    )}

                    {/* User Menu or Login Button */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors overflow-hidden font-bold text-sm text-primary"
                            >
                                {user.name.charAt(0).toUpperCase()}
                            </button>

                            {isUserMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-2 py-1.5 text-sm font-semibold text-foreground border-b border-border/50 mb-1">
                                            {user.name}
                                            {user.university && (
                                                <div className="text-xs text-muted-foreground font-normal mt-0.5">{user.university}</div>
                                            )}
                                        </div>
                                        <Link href="/profile" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                                            <User className="w-4 h-4" />
                                            Profil
                                        </Link>
                                        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                                            <LayoutDashboard className="w-4 h-4" />
                                            Kabinet
                                        </Link>
                                        <Link href="/settings" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                                            <Settings className="w-4 h-4" />
                                            Sozlamalar
                                        </Link>
                                        <Link href="/help" className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                                            <HelpCircle className="w-4 h-4" />
                                            Yordam
                                        </Link>
                                        <div className="my-1 border-t border-border/50" />
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Chiqish
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm"
                        >
                            Kirish
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-background/95 backdrop-blur-xl z-40 border-t border-border/20 p-4 animate-in slide-in-from-top-5 duration-200">
                    <form onSubmit={handleSearch} className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl bg-muted/50 border border-transparent pl-10 pr-4 py-3 text-base focus:bg-background focus:border-primary/20 outline-none"
                        />
                    </form>
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                                    pathname === item.href
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
