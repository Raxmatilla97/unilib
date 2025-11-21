"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    BookOpen,
    TrendingUp,
    Award,
    Clock,
    Target,
    Flame,
    Star,
    Calendar,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface UserProgress {
    book_title: string;
    book_author: string;
    progress_percentage: number;
    book_id: string;
    cover_color: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
    const [stats, setStats] = useState({
        booksRead: 0,
        totalPages: 0,
        streak: 0,
        xp: 0,
        level: 1
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch user profile stats
            const { data: profile } = await supabase
                .from('profiles')
                .select('xp, level, streak_days')
                .eq('id', user?.id)
                .single();

            if (profile) {
                setStats(prev => ({
                    ...prev,
                    xp: profile.xp || 0,
                    level: profile.level || 1,
                    streak: profile.streak_days || 0
                }));
            }

            // Fetch reading progress
            const { data: progress } = await supabase
                .from('user_progress')
                .select(`
                    progress_percentage,
                    book_id,
                    books (
                        title,
                        author,
                        cover_color
                    )
                `)
                .eq('user_id', user?.id)
                .order('last_read_at', { ascending: false })
                .limit(3);

            if (progress) {
                const formattedProgress = progress.map((p: any) => ({
                    book_title: p.books.title,
                    book_author: p.books.author,
                    progress_percentage: p.progress_percentage,
                    book_id: p.book_id,
                    cover_color: p.books.cover_color || 'bg-blue-500'
                }));
                setUserProgress(formattedProgress);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="container py-10 px-4 md:px-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Yuklanmoqda...</p>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
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
                            <p className="text-3xl font-bold">{userProgress.length}</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:shadow-amber-500/10 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                                <Flame className="w-6 h-6 text-amber-500" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">Streak</p>
                            <p className="text-3xl font-bold">{stats.streak} kun</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/10 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                                <Star className="w-6 h-6 text-purple-500" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">XP</p>
                            <p className="text-3xl font-bold">{stats.xp}</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                                <Award className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">Daraja</p>
                            <p className="text-3xl font-bold">{stats.level}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
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

                            {userProgress.length > 0 ? (
                                <div className="space-y-4">
                                    {userProgress.map((book, i) => (
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
                        {/* Weekly Challenge */}
                        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    <h3 className="font-bold text-primary">Haftalik Vazifa</h3>
                                </div>
                                <p className="text-sm mb-4">
                                    50 sahifa o'qing va <span className="font-semibold text-primary">"Tech Savvy"</span> nishonini qo'lga kiriting
                                </p>
                                <div className="flex items-center justify-between text-sm font-medium mb-2">
                                    <span>Jarayon</span>
                                    <span className="text-primary">32/50</span>
                                </div>
                                <div className="h-2.5 w-full bg-background/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-accent w-[64%] rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                So'nggi Faoliyat
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { action: 'Kitob o\'qidingiz', time: '2 soat oldin', icon: BookOpen },
                                    { action: 'Guruhga qo\'shildingiz', time: 'Bugun', icon: Target },
                                    { action: 'Nishon oldingiz', time: 'Kecha', icon: Award },
                                ].map((activity, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                            <activity.icon className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{activity.action}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
