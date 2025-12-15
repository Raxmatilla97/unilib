"use client";

import { useState, useMemo, useCallback } from 'react';
import { ReadingCalendar } from '@/components/schedule/ReadingCalendar';
import { ScheduleBookModal } from '@/components/schedule/ScheduleBookModal';
import { ReadOnlyRoute } from '@/components/auth/ReadOnlyRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { useScheduleData } from '@/lib/react-query/hooks';
import { deleteSchedule } from './actions';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { ScheduleSkeleton } from '@/components/loading/ScheduleSkeleton';

export default function SchedulePage() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const isReadOnly = !user;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [editingSchedule, setEditingSchedule] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ✅ Use React Query hook with automatic caching
    const { data, isLoading, error } = useScheduleData(user?.id);

    // ✅ Memoize stats calculation
    const stats = useMemo(() => {
        if (!data) return { active: 0, completed: 0, streak: 0 };

        const activeCount = data.schedules.filter((s: any) => s.status === 'active').length;
        const completedCount = data.schedules.filter((s: any) => s.status === 'completed').length;

        return {
            active: activeCount,
            completed: completedCount,
            streak: data.streak
        };
    }, [data]);

    const handleDateClick = useCallback((date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    }, []);

    const handleAddSchedule = useCallback(() => {
        if (isReadOnly) {
            toast.info('Reja qo\'shish uchun tizimga kiring', {
                action: {
                    label: 'Kirish',
                    onClick: () => router.push('/login')
                }
            });
            return;
        }
        setSelectedDate(undefined);
        setIsModalOpen(true);
    }, [isReadOnly, router]);

    const handleScheduleCreated = useCallback(() => {
        // Invalidate query to refetch data
        queryClient.invalidateQueries({ queryKey: ['schedule', user?.id] });
        setEditingSchedule(null);
    }, [queryClient, user?.id]);

    const handleEdit = useCallback((schedule: any) => {
        if (isReadOnly) {
            toast.info('Tahrirlash uchun tizimga kiring', {
                action: {
                    label: 'Kirish',
                    onClick: () => router.push('/login')
                }
            });
            return;
        }
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    }, [isReadOnly, router]);

    const handleDelete = useCallback(async (scheduleId: string) => {
        if (isReadOnly) {
            toast.info('Oʻchirish uchun tizimga kiring', {
                action: {
                    label: 'Kirish',
                    onClick: () => router.push('/login')
                }
            });
            return;
        }

        if (!user) {
            toast.error('Unauthorized');
            return;
        }

        // Better confirmation with toast
        const confirmed = window.confirm('Haqiqatan ham bu rejani oʻchirmoqchimisiz?');
        if (!confirmed) return;

        setDeletingId(scheduleId);
        const toastId = toast.loading('Oʻchirilmoqda...');

        const result = await deleteSchedule(scheduleId, user.id);
        setDeletingId(null);

        if (result.success) {
            toast.success('Reja muvaffaqiyatli oʻchirildi', { id: toastId });
            queryClient.invalidateQueries({ queryKey: ['schedule', user?.id] });
        } else {
            toast.error(result.error || 'Xatolik yuz berdi', { id: toastId });
        }
    }, [isReadOnly, router, user, queryClient]);

    const handleModalClose = useCallback(() => {
        setIsModalOpen(false);
        setEditingSchedule(null);
    }, []);

    if (isLoading) {
        return (
            <ReadOnlyRoute>
                <ScheduleSkeleton />
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

    // For unauthenticated users or when data is not available, show empty state
    const schedules = data?.schedules || [];
    const dailyProgress = data?.dailyProgress || [];

    return (
        <ReadOnlyRoute>
            <div className="container py-6 md:py-10 px-4 md:px-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-2">
                        📅 Oʻqish Rejam
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Kitoblaringizni rejalashtiring va maqsadlaringizga erishing
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-6">
                        <div className="text-2xl md:text-3xl font-bold text-primary mb-0.5 md:mb-1">
                            {stats.active}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                            Faol rejalar
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-6">
                        <div className="text-2xl md:text-3xl font-bold text-green-500 mb-0.5 md:mb-1">
                            {stats.completed}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                            Tugatilgan
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg md:rounded-xl p-3 md:p-6">
                        <div className="text-2xl md:text-3xl font-bold text-orange-500 mb-0.5 md:mb-1">
                            🔥 {stats.streak}
                        </div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                            <span className="hidden sm:inline">Kunlik </span>streak
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <ReadingCalendar
                    schedules={schedules}
                    dailyProgress={dailyProgress}
                    onDateClick={handleDateClick}
                    onAddSchedule={handleAddSchedule}
                />

                {/* Schedule List */}
                {schedules.length > 0 && (
                    <div className="mt-6 md:mt-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Faol Rejalar</h2>
                        <div className="space-y-3 md:space-y-4">
                            {schedules.map((schedule: any) => {
                                const now = new Date();
                                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                                const todayProgress = dailyProgress.find(p => p.date === todayStr && p.schedule_id === schedule.id);
                                const progressPercent = schedule.daily_goal_pages
                                    ? Math.min(100, ((todayProgress?.pages_read || 0) / schedule.daily_goal_pages) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={schedule.id}
                                        className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base md:text-lg mb-1">
                                                    {schedule.books?.title}
                                                </h3>
                                                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                                                    {schedule.books?.author}
                                                </p>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm">
                                                    <span className="flex items-center gap-1">
                                                        📅 {new Date(schedule.start_date).toLocaleDateString('uz-UZ')} - {new Date(schedule.end_date).toLocaleDateString('uz-UZ')}
                                                    </span>
                                                    {schedule.daily_goal_pages && (
                                                        <span className="flex items-center gap-1">
                                                            📖 {schedule.daily_goal_pages} sahifa/kun
                                                        </span>
                                                    )}
                                                    {schedule.daily_goal_minutes && (
                                                        <span className="flex items-center gap-1">
                                                            ⏱️ {schedule.daily_goal_minutes} daqiqa/kun
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right md:min-w-[120px] flex-shrink-0">
                                                <div className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">
                                                    Bugungi Progress
                                                </div>
                                                <div className="text-xl md:text-2xl font-bold text-primary mb-1">
                                                    {Math.round(progressPercent)}%
                                                </div>
                                                <div className="text-[10px] md:text-xs text-muted-foreground">
                                                    {todayProgress?.pages_read || 0} / {schedule.daily_goal_pages} sahifa
                                                </div>
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs md:text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg transition-colors min-h-[44px]"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Tahrirlash
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule.id)}
                                                disabled={deletingId === schedule.id}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs md:text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50 min-h-[44px]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {deletingId === schedule.id ? 'Oʻchirilmoqda...' : 'Oʻchirish'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {schedules.length === 0 && (
                    <div className="mt-8 text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold mb-2">
                            Hali rejalaringiz yoʻq
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Birinchi kitobingizni rejalashtiring va oʻqishni boshlang!
                        </p>
                        <button
                            onClick={handleAddSchedule}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Reja qoʻshish
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <ScheduleBookModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onScheduleCreated={handleScheduleCreated}
                selectedDate={selectedDate}
                editingSchedule={editingSchedule}
            />
        </ReadOnlyRoute>
    );
}
