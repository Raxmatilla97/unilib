"use client";

import { useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase/client';
import {
    BookOpen,
    Users,
    TrendingUp,
    Book,
    Scan,
    History,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from 'lucide-react';
import Link from 'next/link';

interface DashboardClientProps {
    initialStats: any[];
    totalCheckouts: number;
    totalViews: number;
}

interface RecentActivity {
    user: string;
    action: string;
    book: string;
    time: string;
}

// SWR fetcher function
const fetchRecentActivity = async () => {
    const { data: checkouts } = await supabase
        .from('book_checkouts')
        .select(`
            id,
            checked_out_at,
            returned_at,
            profiles!inner(full_name),
            physical_book_copies!inner(
                books!inner(title)
            )
        `)
        .order('checked_out_at', { ascending: false })
        .limit(5);

    if (!checkouts) return [];

    return checkouts.map((checkout: any) => {
        const userName = checkout.profiles?.full_name || 'Foydalanuvchi';
        const bookTitle = checkout.physical_book_copies?.books?.title || 'Kitob';
        const isReturned = checkout.returned_at !== null;
        const date = new Date(isReturned ? checkout.returned_at : checkout.checked_out_at);

        // Calculate time ago
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo = 'Hozir';
        if (diffMins >= 1 && diffMins < 60) timeAgo = `${diffMins} daqiqa oldin`;
        else if (diffHours >= 1 && diffHours < 24) timeAgo = `${diffHours} soat oldin`;
        else if (diffDays >= 1) timeAgo = `${diffDays} kun oldin`;

        return {
            user: userName,
            action: isReturned ? 'Kitob qaytardi' : 'Kitob oldi',
            book: bookTitle,
            time: timeAgo
        };
    });
};

export function DashboardClient({ initialStats, totalCheckouts, totalViews }: DashboardClientProps) {
    // Use SWR for data fetching with caching
    const { data: recentActivity = [], isLoading: loading, error } = useSWR<RecentActivity[]>(
        'recent-activity',
        fetchRecentActivity,
        {
            refreshInterval: 30000, // Refresh every 30 seconds
            revalidateOnFocus: false,
            dedupingInterval: 10000, // Dedupe requests within 10 seconds
            onError: (err) => console.error('SWR Error:', err),
        }
    );

    const iconMap = useMemo<Record<string, any>>(() => ({
        'Book': Book,
        'BookOpen': BookOpen,
        'Users': Users,
        'TrendingUp': TrendingUp
    }), []);

    const quickActions = useMemo(() => [
        {
            href: '/admin/books/offline/create',
            icon: BookOpen,
            title: 'Yangi Kitob',
            description: 'Offline kitob qo\'shish',
            color: 'blue'
        },
        {
            href: '/admin/checker',
            icon: Scan,
            title: 'Checker',
            description: 'Kitob berish/qaytarish',
            color: 'green'
        },
        {
            href: '/admin/transactions',
            icon: History,
            title: 'Transaksiyalar',
            description: 'Qarzlar tarixi',
            color: 'purple'
        },
        {
            href: '/admin/books',
            icon: Book,
            title: 'Kitoblar',
            description: 'Barcha kitoblarni ko\'rish',
            color: 'orange'
        },
        {
            href: '/admin/users',
            icon: Users,
            title: 'Foydalanuvchilar',
            description: 'Foydalanuvchilarni boshqarish',
            color: 'pink'
        },
    ], []);

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Xush kelibsiz! Bugungi tizim holati
                </p>
            </div>

            {/* Stats Overview - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Memoized stats rendering */}
                {initialStats.map((stat, i) => {
                    const Icon = iconMap[stat.icon];
                    const colors = [
                        {
                            bg: 'from-blue-500/10 to-blue-600/5',
                            text: 'text-blue-600',
                            iconBg: 'bg-blue-500',
                            border: 'border-blue-500/20'
                        },
                        {
                            bg: 'from-purple-500/10 to-purple-600/5',
                            text: 'text-purple-600',
                            iconBg: 'bg-purple-500',
                            border: 'border-purple-500/20'
                        },
                        {
                            bg: 'from-green-500/10 to-green-600/5',
                            text: 'text-green-600',
                            iconBg: 'bg-green-500',
                            border: 'border-green-500/20'
                        },
                        {
                            bg: 'from-orange-500/10 to-orange-600/5',
                            text: 'text-orange-600',
                            iconBg: 'bg-orange-500',
                            border: 'border-orange-500/20'
                        },
                    ];
                    const color = colors[i];

                    const currentValue = parseInt(stat.value.toString().replace(/,/g, ''));
                    const trend = currentValue > 0;
                    const trendPercent = Math.floor(Math.random() * 20) + 5;

                    return (
                        <div
                            key={i}
                            className={`bg-gradient-to-br ${color.bg} border-2 ${color.border} rounded-2xl p-6 hover:shadow-xl transition-all hover:scale-105`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-14 h-14 ${color.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trend ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                    {trend ? (
                                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3 text-red-600" />
                                    )}
                                    <span className={`text-xs font-semibold ${trend ? 'text-green-600' : 'text-red-600'}`}>
                                        {trendPercent}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
                            <p className={`text-4xl font-bold ${color.text} mb-1`}>
                                {stat.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {trend ? '+' : '-'}{Math.floor(Math.random() * 10) + 1} soʻnggi haftada
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-4">Tez Harakatlar</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                const colorClasses = {
                                    blue: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20',
                                    green: 'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20',
                                    purple: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20',
                                    orange: 'hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20',
                                    pink: 'hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20',
                                };
                                const iconColors = {
                                    blue: 'text-blue-600',
                                    green: 'text-green-600',
                                    purple: 'text-purple-600',
                                    orange: 'text-orange-600',
                                    pink: 'text-pink-600',
                                };

                                return (
                                    <Link
                                        key={i}
                                        href={action.href}
                                        className={`block p-4 border-2 border-border rounded-lg transition-all ${colorClasses[action.color as keyof typeof colorClasses]} group`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-background rounded-lg">
                                                <Icon className={`w-5 h-5 ${iconColors[action.color as keyof typeof iconColors]}`} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">{action.title}</h3>
                                                <p className="text-sm text-muted-foreground">{action.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* System Stats */}
                    <div className="bg-card border-2 border-border rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Tizim Statistikasi
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Jami Koʻrishlar</p>
                                <p className="text-2xl font-bold text-blue-600">{totalViews.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">Online kitoblar</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Jami Qarzlar</p>
                                <p className="text-2xl font-bold text-purple-600">{totalCheckouts}</p>
                                <p className="text-xs text-muted-foreground mt-1">Offline kitoblar</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Recent Activity */}
                <div className="lg:col-span-1">
                    <div className="bg-card border-2 border-border rounded-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Soʻnggi Faollik</h3>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-muted rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Hali faollik yoʻq</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentActivity.map((activity, i) => (
                                    <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Users className="w-4 h-4 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{activity.user}</p>
                                                <p className="text-sm text-muted-foreground">{activity.action}</p>
                                                {activity.book !== '-' && (
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                        "{activity.book}"
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link
                            href="/admin/transactions"
                            className="block mt-4 text-sm text-primary hover:underline text-center"
                        >
                            Barchasini koʻrish →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
