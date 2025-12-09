import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

// Dashboard data hook
export function useDashboardData(userId: string | undefined) {
    return useQuery({
        queryKey: ['dashboard', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');

            const [profileResponse, progressResponse, schedulesResponse, weeklyProgressResponse, totalBooksResponse] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('xp, level, streak_days')
                    .eq('id', userId)
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
                    .eq('user_id', userId)
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
                    .eq('user_id', userId)
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
                    .eq('reading_schedule.user_id', userId)
                    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
                supabase
                    .from('user_progress')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId)
            ]);

            return {
                profile: profileResponse.data,
                progress: progressResponse.data,
                schedules: schedulesResponse.data,
                weeklyProgress: weeklyProgressResponse.data,
                totalBooks: totalBooksResponse.count,
            };
        },
        enabled: !!userId,
    });
}

// Profile data hook with combined query
export function useProfileData(userId: string | undefined) {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');

            // Separate queries for better reliability
            const [profileResponse, loansResponse] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single(),
                supabase
                    .from('book_checkouts')
                    .select(`
                        *,
                        physical_book_copies(
                            barcode,
                            copy_number,
                            books(title, author, cover_color)
                        )
                    `)
                    .eq('user_id', userId)
                    .eq('status', 'active')
                    .order('due_date', { ascending: true })
            ]);

            if (profileResponse.error) throw profileResponse.error;

            return {
                profile: profileResponse.data,
                activeLoans: loansResponse.data || [],
            };
        },
        enabled: !!userId,
    });
}

// Schedule data hook
export function useScheduleData(userId: string | undefined) {
    return useQuery({
        queryKey: ['schedule', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');

            const [schedulesResponse, progressResponse, profileResponse] = await Promise.all([
                supabase
                    .from('reading_schedule')
                    .select(`
                        *,
                        books (
                            title,
                            author,
                            pages
                        )
                    `)
                    .eq('user_id', userId)
                    .neq('status', 'deleted')
                    .order('start_date', { ascending: true }),
                supabase
                    .from('daily_progress')
                    .select('*')
                    .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
                supabase
                    .from('profiles')
                    .select('streak_days')
                    .eq('id', userId)
                    .single()
            ]);

            return {
                schedules: schedulesResponse.data || [],
                dailyProgress: progressResponse.data || [],
                streak: profileResponse.data?.streak_days || 0,
            };
        },
        enabled: !!userId,
    });
}

// Achievements data hook
export function useAchievementsData(userId: string | undefined) {
    return useQuery({
        queryKey: ['achievements', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');

            const [achievementsResponse, userAchievementsResponse, profileResponse] = await Promise.all([
                supabase
                    .from('achievements')
                    .select('*')
                    .order('tier', { ascending: false })
                    .order('xp_reward', { ascending: true }),
                supabase
                    .from('user_achievements')
                    .select(`
                        unlocked_at,
                        seen,
                        achievements (*)
                    `)
                    .eq('user_id', userId),
                supabase
                    .from('profiles')
                    .select('xp, level, streak_days, total_books_completed, total_pages_read, total_daily_goals_completed')
                    .eq('id', userId)
                    .single()
            ]);

            return {
                achievements: achievementsResponse.data || [],
                userAchievements: userAchievementsResponse.data || [],
                profile: profileResponse.data,
            };
        },
        enabled: !!userId,
    });
}

// Leaderboard hooks
export function useLeaderboard(type: 'xp' | 'streak' = 'xp') {
    return useQuery({
        queryKey: ['leaderboard', type],
        queryFn: async () => {
            const rpcName = type === 'xp' ? 'get_leaderboard' : 'get_streak_leaderboard';
            const { data, error } = await supabase.rpc(rpcName, { limit_count: 50 });

            if (error) throw error;
            return data || [];
        },
    });
}

// Combined leaderboard hook (both at once)
export function useLeaderboards() {
    return useQuery({
        queryKey: ['leaderboards'],
        queryFn: async () => {
            const [xpResponse, streakResponse] = await Promise.all([
                supabase.rpc('get_leaderboard', { limit_count: 50 }),
                supabase.rpc('get_streak_leaderboard', { limit_count: 50 }),
            ]);

            return {
                xp: xpResponse.data || [],
                streak: streakResponse.data || [],
            };
        },
    });
}
