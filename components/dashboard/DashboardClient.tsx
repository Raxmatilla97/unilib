"use client";

import { useAuth } from '@/contexts/AuthContext';
import {
    BookOpen,
    TrendingUp,
    Award,
    Clock,
    Target,
    Flame,
    Star,
    Sparkles,
    ChevronRight,
    Calendar
} from 'lucide-react';
import Link from 'next/link';

interface UserProgress {
    book_title: string;
    book_author: string;
    progress_percentage: number;
    book_id: string;
    cover_color: string;
}

interface UserStats {
    booksRead: number;
    xp: number;
    level: number;
    streak: number;
}

interface DashboardClientProps {
    initialStats: UserStats;
    initialProgress: UserProgress[];
    activeSchedules?: any[];
    recentActivities?: any[];
    weeklyPages?: number;
    todayProgress?: any;
}

export function DashboardClient({
    initialStats,
    initialProgress,
    activeSchedules = [],
    recentActivities = [],
    weeklyPages = 0,
    todayProgress
}: DashboardClientProps) {
    const { user } = useAuth();
    const activeSchedule = activeSchedules[0];

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " yil oldin";

        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " oy oldin";

        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " kun oldin";

        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " soat oldin";

        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " daqiqa oldin";

        return "Hozirgina";
    };

    return (
        <div className="container py-10 px-4 md:px-6 max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                    Xush kelibsiz, {user?.name}! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                    Bugun nimani o'rganamiz?
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:shadow-blue-500/10 transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                            <BookOpen className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Kitoblar</p>
                        <p className="text-3xl font-bold">{initialStats.booksRead}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:shadow-amber-500/10 transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                            <Flame className="w-6 h-6 text-amber-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Streak</p>
                        <p className="text-3xl font-bold">{initialStats.streak} kun</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                            <Star className="w-6 h-6 text-purple-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">XP</p>
                        <p className="text-3xl font-bold">{initialStats.xp}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                            <Award className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Daraja</p>
                        <p className="text-3xl font-bold">{initialStats.level}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Today's Plan Widget */}
                    {activeSchedule && (
                        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Bugungi Reja
                                    </h2>
                                    <span className="text-sm font-medium px-3 py-1 bg-background/50 rounded-full border border-border">
                                        {(() => {
                                            const date = new Date(activeSchedule.end_date);
                                            const months = [
                                                'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
                                                'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
                                            ];
                                            return `${date.getDate()}-${months[date.getMonth()]} ${date.getFullYear()}-yil`;
                                        })()} gacha
                                    </span>
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{activeSchedule.books?.title}</h3>
                                        <p className="text-muted-foreground text-sm mb-3">{activeSchedule.books?.author}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            {activeSchedule.daily_goal_pages && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1">
                                                        <Target className="w-4 h-4 text-primary" />
                                                        Kunlik: <strong>{activeSchedule.daily_goal_pages} sahifa</strong>
                                                    </span>
                                                    <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden mt-1">
                                                        <div
                                                            className="h-full bg-primary rounded-full transition-all"
                                                            style={{
                                                                width: `${Math.min(100, ((todayProgress?.pages_read || 0) / activeSchedule.daily_goal_pages) * 100)}%`
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        Bugun: {todayProgress?.pages_read || 0} sahifa o'qildi
                                                    </span>
                                                </div>
                                            )}
                                            {activeSchedule.daily_goal_minutes && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4 text-primary" />
                                                    Kunlik: <strong>{activeSchedule.daily_goal_minutes} daqiqa</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href={`/reader/${activeSchedule.book_id}`}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    O'qishni boshlash
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Continue Reading */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                O'qishni davom ettiring
                            </h2>
                            <Link href="/library" className="text-sm text-primary hover:underline flex items-center gap-1">
                                Barchasi
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {initialProgress.length > 0 ? (
                            <div className="space-y-4">
                                {initialProgress.map((book, i) => (
                                    <Link
                                        key={i}
                                        href={`/reader/${book.book_id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all group border border-transparent hover:border-border"
                                    >
                                        <div className={`w-14 h-20 rounded-lg ${book.cover_color} shadow-md flex items-center justify-center text-white font-bold text-xs group-hover:scale-105 transition-transform`}>
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold mb-1 group-hover:text-primary transition-colors">{book.book_title}</h4>
                                            <p className="text-sm text-muted-foreground mb-2">{book.book_author}</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                                                        style={{ width: `${book.progress_percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-right">
                                                    {book.progress_percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold mb-2">Hali kitob o'qimadingiz</h3>
                                <p className="text-sm text-muted-foreground mb-4">Kutubxonadan kitob tanlang va o'qishni boshlang</p>
                                <Link href="/library" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                    <BookOpen className="w-4 h-4" />
                                    Kutubxonaga o'tish
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/groups" className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 hover:shadow-lg hover:shadow-primary/10 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold mb-1">Guruhlar</h3>
                            <p className="text-sm text-muted-foreground">O'quv guruhlariga qo'shiling</p>
                        </Link>

                        <Link href="/leaderboard" className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/10 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-accent" />
                            </div>
                            <h3 className="font-bold mb-1">Reyting</h3>
                            <p className="text-sm text-muted-foreground">O'z o'rningizni ko'ring</p>
                        </Link>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Weekly Progress */}
                    <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h3 className="font-bold text-primary">Haftalik Natija</h3>
                            </div>
                            <p className="text-sm mb-4">
                                Bu hafta jami <span className="font-semibold text-primary">{weeklyPages} sahifa</span> o'qidingiz.
                            </p>
                            <div className="flex items-center justify-between text-sm font-medium mb-2">
                                <span>Maqsad (100 sahifa)</span>
                                <span className="text-primary">{Math.min(100, Math.round((weeklyPages / 100) * 100))}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-background/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (weeklyPages / 100) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary" />
                            So'nggi Faoliyat
                        </h3>
                        <div className="space-y-4">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium line-clamp-1">{activity.title}</p>
                                            <p className="text-xs text-muted-foreground mb-0.5">{activity.details}</p>
                                            <p className="text-[10px] text-muted-foreground/70">{formatTimeAgo(activity.time)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                    Hali faoliyat yo'q
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
