"use client";

import { useAuth } from '@/contexts/AuthContext';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/permissions';
import { Bell, LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!user) return null;

    return (
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="h-full px-4 md:px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold">Boshqaruv paneli</h2>
                        <p className="text-xs text-muted-foreground hidden sm:block">Library ID Admin</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    {/* Notifications */}
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors relative">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Info */}
                    <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-border">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium">{user.name}</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                                    {getRoleDisplayName(user.role)}
                                </span>
                            </div>
                        </div>
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm md:text-base">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        title="Chiqish"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
