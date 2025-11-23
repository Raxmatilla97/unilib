"use client";

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AchievementsList } from '@/components/gamification/AchievementsList';
import { XPProgressBar } from '@/components/gamification/XPProgressBar';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
    id: string;
    key: string;
    title: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    xp_reward: number;
}

interface UserAchievement extends Achievement {
    unlocked_at: string;
    seen: boolean;
}

import { markAchievementsAsSeen } from './actions';

export default function AchievementsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [userStats, setUserStats] = useState({
        xp: 0,
        level: 1,
        streak: 0,
        booksCompleted: 0,
        pagesRead: 0,
        dailyGoalsCompleted: 0
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    // Mark unseen achievements as seen
    useEffect(() => {
        if (userAchievements.length > 0) {
            const unseenIds = userAchievements
                .filter(ua => !ua.seen)
                .map(ua => ua.id);

            if (unseenIds.length > 0) {
                // Mark as seen after a short delay to allow user to see the "New" badge
                const timer = setTimeout(() => {
                    if (user) {
                        markAchievementsAsSeen(unseenIds, user.id);
                    }
                }, 3000);

                return () => clearTimeout(timer);
            }
        }
    }, [userAchievements]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all achievements
            const { data: allAchievements } = await supabase
                .from('achievements')
                .select('*')
                .order('tier', { ascending: false })
                .order('xp_reward', { ascending: true });

            // Fetch user's unlocked achievements
            const { data: unlockedAchievements } = await supabase
                .from('user_achievements')
                .select(`
                    unlocked_at,
                    seen,
                    achievements (*)
                `)
                .eq('user_id', user?.id);

            // Fetch user stats
            const { data: profile } = await supabase
                .from('profiles')
                .select('xp, level, streak_days, total_books_completed, total_pages_read, total_daily_goals_completed')
                .eq('id', user?.id)
                .single();

            if (allAchievements) {
                setAchievements(allAchievements);
            }

            if (unlockedAchievements) {
                const formattedUnlocked = unlockedAchievements.map((ua: any) => ({
                    ...ua.achievements,
                    unlocked_at: ua.unlocked_at,
                    seen: ua.seen
                }));
                setUserAchievements(formattedUnlocked);
            }

            if (profile) {
                setUserStats({
                    xp: profile.xp || 0,
                    level: profile.level || 1,
                    streak: profile.streak_days || 0,
                    booksCompleted: profile.total_books_completed || 0,
                    pagesRead: profile.total_pages_read || 0,
                    dailyGoalsCompleted: profile.total_daily_goals_completed || 0
                });
            }

        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
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
        </ProtectedRoute>
    );
}
