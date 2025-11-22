"use client";

import { useState, useEffect } from 'react';
import { ReadingCalendar } from '@/components/schedule/ReadingCalendar';
import { ScheduleBookModal } from '@/components/schedule/ScheduleBookModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function SchedulePage() {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSchedules();
        }
    }, [user]);

    const fetchSchedules = async () => {
        try {
            const { data, error } = await supabase
                .from('reading_schedule')
                .select(`
                    *,
                    books (
                        title,
                        author,
                        pages
                    )
                `)
                .eq('status', 'active')
                .order('start_date', { ascending: true });

            if (error) throw error;
            setSchedules(data || []);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleAddSchedule = () => {
        setSelectedDate(undefined);
        setIsModalOpen(true);
    };

    const handleScheduleCreated = () => {
        fetchSchedules();
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
            <div className="container py-10 px-4 md:px-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        📅 O'qish Rejam
                    </h1>
                    <p className="text-muted-foreground">
                        Kitoblaringizni rejalashtiring va maqsadlaringizga erishing
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-3xl font-bold text-primary mb-1">
                            {schedules.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Faol rejalar
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-3xl font-bold text-green-500 mb-1">
                            0
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Tugatilgan
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="text-3xl font-bold text-orange-500 mb-1">
                            🔥 0
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Kunlik streak
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <ReadingCalendar
                    schedules={schedules}
                    onDateClick={handleDateClick}
                    onAddSchedule={handleAddSchedule}
                />

                {/* Schedule List */}
                {schedules.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Faol Rejalar</h2>
                        <div className="space-y-4">
                            {schedules.map((schedule: any) => (
                                <div
                                    key={schedule.id}
                                    className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">
                                                {schedule.books?.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                {schedule.books?.author}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span>
                                                    📅 {new Date(schedule.start_date).toLocaleDateString('uz-UZ')} - {new Date(schedule.end_date).toLocaleDateString('uz-UZ')}
                                                </span>
                                                {schedule.daily_goal_pages && (
                                                    <span>
                                                        📖 {schedule.daily_goal_pages} sahifa/kun
                                                    </span>
                                                )}
                                                {schedule.daily_goal_minutes && (
                                                    <span>
                                                        ⏱️ {schedule.daily_goal_minutes} daqiqa/kun
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground mb-2">
                                                Progress
                                            </div>
                                            <div className="text-2xl font-bold text-primary">
                                                0%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {schedules.length === 0 && (
                    <div className="mt-8 text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-bold mb-2">
                            Hali rejalaringiz yo'q
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            Birinchi kitobingizni rejalashtiring va o'qishni boshlang!
                        </p>
                        <button
                            onClick={handleAddSchedule}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Reja qo'shish
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <ScheduleBookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onScheduleCreated={handleScheduleCreated}
                selectedDate={selectedDate}
            />
        </ProtectedRoute>
    );
}
