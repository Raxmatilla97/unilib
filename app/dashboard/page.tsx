"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

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
    const [schedules, setSchedules] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [weeklyPages, setWeeklyPages] = useState(0);
    const [todayProgress, setTodayProgress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        // Fetch only once when user becomes available
        if (user && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchDashboardData();
        }
    }, [user]); // Depend on user, but only fetch once

    const fetchDashboardData = async () => {
        try {
            // Fetch user profile stats, reading progress, active schedules, and weekly progress in parallel
            const [profileResponse, progressResponse, schedulesResponse, weeklyProgressResponse, totalBooksResponse] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('xp, level, streak_days')
                    .eq('id', user?.id)
                    .single(),
                supabase
                    .from('user_progress')
                    .select(`
                        progress_percentage,
                        book_id,
                        last_read_at,
                        books (
                            title,
                            author,
                            cover_color
                        )
                    `)
                    .eq('user_id', user?.id)
                    .order('last_read_at', { ascending: false })
                    .limit(5),
                supabase
                    .from('reading_schedule')
                    .select(`
                        id,
                        book_id,
                        start_date,
                        end_date,
                        daily_goal_pages,
                        daily_goal_minutes,
                        created_at,
                        books (
                            title,
                            author,
                            pages
                        )
                    `)
                    .eq('user_id', user?.id)
                    .eq('status', 'active')
                    .gte('end_date', new Date().toISOString().split('T')[0])
                    .order('end_date', { ascending: true })
                    .limit(1),
                supabase
                    .from('daily_progress')
                    .select(`
                        pages_read, 
                        minutes_read, 
                        date, 
                        schedule_id,
                        reading_schedule!inner(user_id)
                    `)
                    .eq('reading_schedule.user_id', user?.id)
                    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
                supabase
                    .from('user_progress')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', user?.id)
            ]);

            const { data: profile } = profileResponse;
            const { data: progress } = progressResponse;
            const { data: schedulesData } = schedulesResponse;
            const { data: weeklyData } = weeklyProgressResponse;
            const { count: totalBooks } = totalBooksResponse;

            // Calculate weekly pages
            const pages = weeklyData?.reduce((sum, day) => sum + (day.pages_read || 0), 0) || 0;
            setWeeklyPages(pages);

            if (totalBooks !== null) {
                setStats(prev => ({
                    ...prev,
                    booksRead: totalBooks
                }));
            }

            // Process Recent Activity
            let newActivities: any[] = [];

            if (progress) {
                progress.forEach((p: any) => {
                    if (p.last_read_at) {
                        newActivities.push({
                            type: 'read',
                            title: p.books.title,
                            time: new Date(p.last_read_at),
                            details: `${p.progress_percentage}% o'qildi`
                        });
                    }
                });
            }

            // Sort activities by time
            newActivities.sort((a, b) => b.time.getTime() - a.time.getTime());
            setActivities(newActivities.slice(0, 5));

            if (profile) {
                setStats(prev => ({
                    ...prev,
                    xp: profile.xp || 0,
                    level: profile.level || 1,
                    streak: profile.streak_days || 0
                }));
            }

            if (progress) {
                const formattedProgress = progress.slice(0, 3).map((p: any) => ({
                    book_title: p.books.title,
                    book_author: p.books.author,
                    progress_percentage: p.progress_percentage,
                    book_id: p.book_id,
                    cover_color: p.books.cover_color || 'bg-blue-500'
                }));
                setUserProgress(formattedProgress);
            }

            if (schedulesData && schedulesData.length > 0) {
                setSchedules(schedulesData);

                // Find today's progress for the active schedule
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                // Find schedule where today is within date range
                const activeSchedule = schedulesData.find((s: any) =>
                    s.start_date <= todayStr && s.end_date >= todayStr
                ) || schedulesData[0]; // Fallback to first if none match

                const activeScheduleId = activeSchedule.id;

                console.log('Looking for today progress:', {
                    todayStr,
                    activeScheduleId,
                    weeklyDataLength: weeklyData?.length,
                    weeklyData: weeklyData
                });

                const todayData = weeklyData?.find((p: any) => p.date === todayStr && p.schedule_id === activeScheduleId);

                console.log('Found today progress:', todayData);

                setTodayProgress(todayData || null);
            } else {
                setSchedules([]);
                setTodayProgress(null);
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
            <DashboardClient
                initialStats={stats}
                initialProgress={userProgress}
                activeSchedules={schedules}
                recentActivities={activities}
                weeklyPages={weeklyPages}
                todayProgress={todayProgress}
            />
        </ProtectedRoute>
    );
}
