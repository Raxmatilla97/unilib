"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/permissions';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    Building2,
    ChevronRight,
    History,
    X
} from 'lucide-react';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { hasPermission, isSuperAdmin } = useAuth();

    const navItems = [
        {
            href: '/admin',
            label: 'Dashboard',
            icon: LayoutDashboard,
            show: true
        },
        {
            href: '/admin/books/online',
            label: 'Online Kitoblar',
            icon: BookOpen,
            show: hasPermission(ROLES.LIBRARIAN)
        },
        {
            href: '/admin/books/offline',
            label: 'Offline Kitoblar',
            icon: BookOpen,
            show: hasPermission(ROLES.LIBRARIAN)
        },
        {
            href: '/admin/checker',
            label: 'Kitob Berish/Qaytarish',
            icon: ChevronRight,
            show: hasPermission(ROLES.LIBRARIAN)
        },
        {
            href: '/admin/transactions',
            label: 'Qarzlar Tarixi',
            icon: History,
            show: hasPermission(ROLES.LIBRARIAN)
        },
        {
            href: '/admin/users',
            label: 'Foydalanuvchilar',
            icon: Users,
            show: hasPermission(ROLES.HEAD_LIBRARIAN)
        },
    ].filter(item => item.show);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-200 ease-in-out
                md:translate-x-0 md:static md:h-screen md:flex md:flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-2 font-bold text-xl" onClick={onClose}>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <span>Admin Panel</span>
                    </Link>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 hover:bg-muted rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="flex-1 font-medium">{item.label}</span>
                                {isActive && <ChevronRight className="w-4 h-4" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                        <span className="font-medium">Kabinetga qaytish</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}
