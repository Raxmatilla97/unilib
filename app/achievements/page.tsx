"use client";

import { useEffect, useMemo, useCallback } from 'react';
import { ReadOnlyRoute } from '@/components/auth/ReadOnlyRoute';
import { AchievementsList } from '@/components/gamification/AchievementsList';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievementsData } from '@/lib/react-query/hooks';
import { markAchievementsAsSeen } from './actions';
import { AchievementsSkeleton } from '@/components/loading/AchievementsSkeleton';

export default function AchievementsPage() {
    const { user } = useAuth();

    // ✅ Use React Query hook with automatic caching
    const { data, isLoading, error } = useAchievementsData(user?.id);

    // ✅ Memoize user stats
    const userStats = useMemo(() => {
        if (!data?.profile) {
            return {
                xp: 0,
                level: 1,
                streak: 0,
                booksCompleted: 0,
                pagesRead: 0,
                dailyGoalsCompleted: 0
            };
        }

        return {
            xp: data.profile.xp || 0,
            level: data.profile.level || 1,
            streak: data.profile.streak_days || 0,
            booksCompleted: data.profile.total_books_completed || 0,
            pagesRead: data.profile.total_pages_read || 0,
            dailyGoalsCompleted: data.profile.total_daily_goals_completed || 0
        };
    }, [data?.profile]);

    // ✅ Memoize formatted user achievements
    const userAchievements = useMemo(() => {
        if (!data?.userAchievements) return [];

        return data.userAchievements.map((ua: any) => ({
            ...ua.achievements,
            unlocked_at: ua.unlocked_at,
            seen: ua.seen
        }));
    }, [data?.userAchievements]);

    // ✅ Memoized mark as seen handler
    const markAsSeen = useCallback(() => {
        if (userAchievements.length > 0 && user) {
            const unseenIds = userAchievements
                .filter((ua: any) => !ua.seen)
                .map((ua: any) => ua.id);

            if (unseenIds.length > 0) {
                markAchievementsAsSeen(unseenIds, user.id);
            }
        }
    }, [userAchievements, user]);

    // Mark unseen achievements as seen
    useEffect(() => {
        const timer = setTimeout(markAsSeen, 3000);
        return () => clearTimeout(timer);
    }, [markAsSeen]);

    if (isLoading) {
        return (
            <ReadOnlyRoute>
                <AchievementsSkeleton />
            </ReadOnlyRoute>
        );
    }

    // Show error only if user is authenticated and there's an actual error
    if (error && user) {
        return (
            <ReadOnlyRoute>
                <div className="container py-10 px-4 md:px-6">
                    <div className="text-center text-red-500">
                        Xatolik yuz berdi. Qaytadan urinib koʻring.
                    </div>
                </div>
            </ReadOnlyRoute>
        );
    }

    // For unauthenticated users, use empty data
    const achievements = data?.achievements || [];
    const userAchievementsData = data?.userAchievements || [];

    return (
        <ReadOnlyRoute>
            <div className="container py-6 md:py-10 px-4 md:px-6 max-w-6xl mx-auto">
                {/* XP Progress & Stats - Mobile Optimized */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* XP Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-card to-card/50 border border-border rounded-xl md:rounded-2xl p-4 md:p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                            <span className="text-2xl md:text-3xl">⭐</span> Daraja va XP
                        </h2>
                        <XPProgressBar
                            currentXP={userStats.xp}
                            currentLevel={userStats.level}
                            showDetails={true}
                        />

                        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border/50">
                            <h3 className="text-xs font-semibold text-muted-foreground mb-3 md:mb-4 uppercase tracking-wider">
                                Keyingi darajaga tezroq yetish uchun:
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                <div className="bg-background/40 p-3 rounded-xl flex items-center gap-3 border border-border/50 hover:bg-background/60 transition-colors">
                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg flex-shrink-0">
                                        📚
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold">+200 XP</div>
                                        <div className="text-xs text-muted-foreground">Kitob tugating</div>
                                    </div>
                                </div>
                                <div className="bg-background/40 p-3 rounded-xl flex items-center gap-3 border border-border/50 hover:bg-background/60 transition-colors">
                                    <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg flex-shrink-0">
                                        🔥
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold">+50 XP</div>
                                        <div className="text-xs text-muted-foreground">Kunlik streak</div>
                                    </div>
                                </div>
                                <div className="bg-background/40 p-3 rounded-xl flex items-center gap-3 border border-border/50 hover:bg-background/60 transition-colors">
                                    <div className="p-2 bg-green-500/10 text-green-500 rounded-lg flex-shrink-0">
                                        🎯
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold">+50 XP</div>
                                        <div className="text-xs text-muted-foreground">Kunlik maqsad</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm h-full">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                            <span className="text-xl md:text-2xl">📊</span> Statistika
                        </h2>
                        <div className="space-y-2 md:space-y-3">
                            <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg md:rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-lg md:text-xl">🔥</span>
                                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Streak</span>
                                </div>
                                <span className="text-base md:text-lg font-bold text-foreground">{userStats.streak} kun</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg md:rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-lg md:text-xl">📚</span>
                                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Kitoblar</span>
                                </div>
                                <span className="text-base md:text-lg font-bold text-foreground">{userStats.booksCompleted}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg md:rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-lg md:text-xl">📄</span>
                                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Sahifalar</span>
                                </div>
                                <span className="text-base md:text-lg font-bold text-foreground">{userStats.pagesRead}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 md:p-3 bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg md:rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-lg md:text-xl">🎯</span>
                                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Maqsadlar</span>
                                </div>
                                <span className="text-base md:text-lg font-bold text-foreground">{userStats.dailyGoalsCompleted}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements List */}
                <AchievementsList
                    achievements={achievements}
                    userAchievements={userAchievements}
                    userStats={userStats}
                />
            </div>
        </ReadOnlyRoute>
    );
}
