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
    Home,
    ChevronLeft,
    ChevronRight,
    Shield,
    Calendar,
    Trophy
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
    const pathname = usePathname();
    const { user, isAdmin } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Don't show sidebar on auth pages, landing page, or admin pages
    if (!user || pathname === '/' || pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin')) {
        return null;
    }

    const navItems = [
        { href: '/dashboard', label: 'Kabinet', icon: LayoutDashboard },
        { href: '/schedule', label: 'O\'qish Rejam', icon: Calendar },
        { href: '/library', label: 'Kutubxona', icon: BookOpen },
        { href: '/groups', label: 'Guruhlar', icon: Users },
        { href: '/achievements', label: 'Yutuqlar', icon: Trophy },
        { href: '/leaderboard', label: 'Reyting', icon: Award },
        { href: '/citations', label: 'Iqtiboslar', icon: Quote },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col bg-card border-r border-border h-screen sticky top-0 transition-all duration-300 overflow-x-hidden ${isCollapsed ? 'w-16' : 'w-64'
                }`}>
                {/* Logo */}
                <div className={`h-16 border-b border-border flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
                    {!isCollapsed && (
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                            <span>LibraryID</span>
                        </Link>
                    )}
                    {isCollapsed && (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className={`flex-1 space-y-1 overflow-y-auto ${isCollapsed ? 'p-2 no-scrollbar' : 'p-4'}`}>
                    <style jsx global>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        .no-scrollbar {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}</style>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                                title={isCollapsed ? item.label : ''}
                            >
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
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group mt-2 border-t border-border pt-4 ${pathname.startsWith('/admin')
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                            title={isCollapsed ? 'Admin Panel' : ''}
                        >
                            <Shield className="w-5 h-5 flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium">Admin Panel</span>}
                            {pathname.startsWith('/admin') && !isCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </Link>
                    )}
                </nav>

                {/* Collapse Toggle */}
                <div className={`border-t border-border ${isCollapsed ? 'p-2' : 'p-4'}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all ${isCollapsed ? 'px-0' : 'px-4'}`}
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
