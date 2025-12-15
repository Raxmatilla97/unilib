'use client';

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/lib/react-query/hooks';
import { ReadOnlyRoute } from '@/components/auth/ReadOnlyRoute';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { DashboardSkeleton } from '@/components/loading/Skeletons';

interface UserProgress {
    book_title: string;
    book_author: string;
    progress_percentage: number;
    book_id: string;
    cover_color: string;
}

export default function DashboardPage() {
    const { user } = useAuth();

    // ✅ Use React Query hook with automatic caching
    const { data, isLoading, error } = useDashboardData(user?.id);

    // ✅ Memoize processed stats to prevent recalculation
    const stats = useMemo(() => {
        if (!data) return {
            booksRead: 0,
            totalPages: 0,
            streak: 0,
            xp: 0,
            level: 1
        };

        return {
            booksRead: data.totalBooks || 0,
            totalPages: 0,
            streak: data.profile?.streak_days || 0,
            xp: data.profile?.xp || 0,
            level: data.profile?.level || 1
        };
    }, [data]);

    // ✅ Memoize user progress to prevent recalculation
    const userProgress = useMemo<UserProgress[]>(() => {
        if (!data?.progress) return [];

        return data.progress.slice(0, 3).map((p: any) => ({
            book_title: p.books.title,
            book_author: p.books.author,
            progress_percentage: p.progress_percentage,
            book_id: p.book_id,
            cover_color: p.books.cover_color || 'bg-blue-500'
        }));
    }, [data?.progress]);

    // ✅ Memoize activities
    const activities = useMemo(() => {
        if (!data?.progress) return [];

        const newActivities: any[] = [];
        data.progress.forEach((p: any) => {
            if (p.last_read_at) {
                newActivities.push({
                    type: 'read',
                    title: p.books.title,
                    time: new Date(p.last_read_at),
                    details: `${p.progress_percentage}% oʻqildi`
                });
            }
        });

        newActivities.sort((a, b) => b.time.getTime() - a.time.getTime());
        return newActivities.slice(0, 5);
    }, [data?.progress]);

    // ✅ Memoize weekly pages
    const weeklyPages = useMemo(() => {
        if (!data?.weeklyProgress) return 0;
        return data.weeklyProgress.reduce((sum, day) => sum + (day.pages_read || 0), 0);
    }, [data?.weeklyProgress]);

    // ✅ Memoize today's progress
    const todayProgress = useMemo(() => {
        if (!data?.schedules || data.schedules.length === 0 || !data.weeklyProgress) {
            return null;
        }

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const activeSchedule = data.schedules.find((s: any) =>
            s.start_date <= todayStr && s.end_date >= todayStr
        ) || data.schedules[0];

        const todayData = data.weeklyProgress.find((p: any) =>
            p.date === todayStr && p.schedule_id === activeSchedule.id
        );

        return todayData || null;
    }, [data?.schedules, data?.weeklyProgress]);

    if (isLoading) {
        return (
            <ReadOnlyRoute>
                <DashboardSkeleton />
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

    return (
        <ReadOnlyRoute>
            <DashboardClient
                initialStats={stats}
                initialProgress={userProgress}
                activeSchedules={data?.schedules || []}
                recentActivities={activities}
                weeklyPages={weeklyPages}
                todayProgress={todayProgress}
            />
        </ReadOnlyRoute>
    );
}
