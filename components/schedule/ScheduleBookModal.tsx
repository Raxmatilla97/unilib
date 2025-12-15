"use client";

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { updateSchedule } from '@/app/schedule/actions';
import { toast } from 'sonner';

interface Book {
    id: string;
    title: string;
    author: string;
    pages?: number;
}

interface ScheduleBookModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScheduleCreated: () => void;
    selectedDate?: Date;
    editingSchedule?: any;
}

export function ScheduleBookModal({ isOpen, onClose, onScheduleCreated, selectedDate, editingSchedule }: ScheduleBookModalProps) {
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [goalType, setGoalType] = useState<'pages' | 'minutes'>('pages');
    const [dailyGoalPages, setDailyGoalPages] = useState(30);
    const [dailyGoalMinutes, setDailyGoalMinutes] = useState(30);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchBooks();

            // If editing, pre-fill form
            if (editingSchedule) {
                setSelectedBook(editingSchedule.book_id);
                setStartDate(editingSchedule.start_date);
                setEndDate(editingSchedule.end_date);

                if (editingSchedule.daily_goal_pages) {
                    setGoalType('pages');
                    setDailyGoalPages(editingSchedule.daily_goal_pages);
                } else if (editingSchedule.daily_goal_minutes) {
                    setGoalType('minutes');
                    setDailyGoalMinutes(editingSchedule.daily_goal_minutes);
                }
            } else if (selectedDate) {
                // If creating new, use selected date
                const dateStr = selectedDate.toISOString().split('T')[0];
                setStartDate(dateStr);
                const end = new Date(selectedDate);
                end.setDate(end.getDate() + 10);
                setEndDate(end.toISOString().split('T')[0]);
            }
        }
    }, [isOpen, selectedDate, editingSchedule]);

    const fetchBooks = async () => {
        const { data } = await supabase
            .from('books')
            .select('id, title, author, pages')
            .order('title');
        if (data) setBooks(data);
    };

    const calculateDailyGoal = () => {
        if (!selectedBook || !startDate || !endDate) return null;

        const book = books.find(b => b.id === selectedBook);
        if (!book?.pages) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        if (days <= 0) return null;

        const pagesPerDay = Math.ceil(book.pages / days);
        return { totalPages: book.pages, days, pagesPerDay };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingSchedule) {
                // Update existing schedule
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    toast.error('Unauthorized');
                    return;
                }

                const result = await updateSchedule(
                    editingSchedule.id,
                    user.id,
                    {
                        start_date: startDate,
                        end_date: endDate,
                        daily_goal_pages: goalType === 'pages' ? dailyGoalPages : undefined,
                        daily_goal_minutes: goalType === 'minutes' ? dailyGoalMinutes : undefined,
                    }
                );

                if (result.success) {
                    toast.success('Reja muvaffaqiyatli yangilandi');
                    onScheduleCreated();
                    onClose();
                    resetForm();
                } else {
                    toast.error(result.error || 'Xatolik yuz berdi');
                }
            } else {
                // Create new schedule
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const scheduleData = {
                    user_id: user.id,
                    book_id: selectedBook,
                    start_date: startDate,
                    end_date: endDate,
                    daily_goal_pages: goalType === 'pages' ? dailyGoalPages : null,
                    daily_goal_minutes: goalType === 'minutes' ? dailyGoalMinutes : null,
                    status: 'active'
                };

                const { error } = await supabase
                    .from('reading_schedule')
                    .insert(scheduleData);

                if (error) throw error;

                toast.success('Reja muvaffaqiyatli yaratildi');
                onScheduleCreated();
                onClose();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedBook('');
        setStartDate('');
        setEndDate('');
        setDailyGoalPages(30);
        setDailyGoalMinutes(30);
    };

    const calculation = calculateDailyGoal();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-2xl font-bold">{editingSchedule ? '✏️ Rejani Tahrirlash' : '📚 Kitobni Rejalashtirish'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Book Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Kitob</label>
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            required
                            disabled={!!editingSchedule}
                            className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">Kitobni tanlang...</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title} - {book.author}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Boshlanish
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Tugash
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                min={startDate}
                                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none"
                            />
                        </div>
                    </div>

                    {/* Auto Calculation */}
                    {calculation && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <h3 className="font-semibold mb-2">📊 Avtomatik Hisoblash:</h3>
                            <ul className="space-y-1 text-sm">
                                <li>• Kitob hajmi: <strong>{calculation.totalPages} sahifa</strong></li>
                                <li>• Muddat: <strong>{calculation.days} kun</strong></li>
                                <li>• Kunlik maqsad: <strong>{calculation.pagesPerDay} sahifa</strong></li>
                            </ul>
                        </div>
                    )}

                    {/* Goal Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">🎯 Maqsad turi</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="pages"
                                    checked={goalType === 'pages'}
                                    onChange={(e) => setGoalType(e.target.value as 'pages')}
                                    className="w-4 h-4"
                                />
                                <BookOpen className="w-4 h-4" />
                                <span>Sahifa boʻyicha</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    value="minutes"
                                    checked={goalType === 'minutes'}
                                    onChange={(e) => setGoalType(e.target.value as 'minutes')}
                                    className="w-4 h-4"
                                />
                                <Clock className="w-4 h-4" />
                                <span>Vaqt boʻyicha</span>
                            </label>
                        </div>
                    </div>

                    {/* Daily Goal */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Kunlik maqsad
                        </label>
                        {goalType === 'pages' ? (
                            <input
                                type="number"
                                value={dailyGoalPages}
                                onChange={(e) => setDailyGoalPages(Number(e.target.value))}
                                min="1"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none"
                                placeholder="Sahifalar soni"
                            />
                        ) : (
                            <input
                                type="number"
                                value={dailyGoalMinutes}
                                onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                                min="1"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary outline-none"
                                placeholder="Daqiqalar"
                            />
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saqlanmoqda...' : (editingSchedule ? 'Yangilash ✅' : 'Rejalashtirish ✅')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
