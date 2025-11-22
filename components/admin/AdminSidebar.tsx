"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MessageSquare,
    BarChart3,
    Settings,
    ChevronRight
} from 'lucide-react';

export function AdminSidebar() {
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
            href: '/admin/books',
            label: 'Kitoblar',
            icon: BookOpen,
            show: hasPermission('books:read')
        },
        {
            href: '/admin/users',
            label: 'Foydalanuvchilar',
            icon: Users,
            show: isSuperAdmin()
        },
        {
            href: '/admin/groups',
            label: 'Guruhlar',
            icon: MessageSquare,
            show: hasPermission('groups:moderate')
        },
        {
            href: '/admin/analytics',
            label: 'Statistika',
            icon: BarChart3,
            show: hasPermission('analytics:view')
        },
        {
            href: '/admin/settings',
            label: 'Sozlamalar',
            icon: Settings,
            show: hasPermission('settings:manage')
        },
    ].filter(item => item.show);

    return (
        <aside className="w-64 bg-card border-r border-border h-screen sticky top-0 flex flex-col">
            <div className="p-6 border-b border-border">
                <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <span>Admin Panel</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
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
    );
}
