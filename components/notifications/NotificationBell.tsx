"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getNotifications, markAsRead, markAllAsRead } from '@/app/notifications/actions';
import { NotificationItem } from './NotificationItem';
import { toast } from 'sonner';

export function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        const result = await getNotifications(user.id);
        if (result.success && result.data) {
            setNotifications(result.data);
        }
        setLoading(false);
    };

    const handleMarkAsRead = async (id: string) => {
        if (!user) return;

        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));

        const result = await markAsRead(id, user.id);
        if (!result.success) {
            // Revert on error
            fetchNotifications();
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user || unreadCount === 0) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        const result = await markAllAsRead(user.id);
        if (!result.success) {
            fetchNotifications();
            toast.error('Xatolik yuz berdi');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-muted rounded-full transition-colors"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                        <h3 className="font-semibold">Bildirishnomalar</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                            >
                                <CheckCheck className="w-3 h-3" />
                                Barchasini oʻqish
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                Yuklanmoqda...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                                <Bell className="w-8 h-8 opacity-20" />
                                <p>Hozircha xabarlar yoʻq</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={handleMarkAsRead}
                                />
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
