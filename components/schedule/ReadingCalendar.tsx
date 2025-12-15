"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface ReadingCalendarProps {
    schedules: any[];
    dailyProgress?: any[];
    onDateClick: (date: Date) => void;
    onAddSchedule: () => void;
}

export function ReadingCalendar({ schedules, dailyProgress = [], onDateClick, onAddSchedule }: ReadingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];

    const dayNames = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Adjust for Monday start

        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getSchedulesForDate = (date: Date | null) => {
        if (!date) return [];
        return schedules.filter(s => {
            const start = new Date(s.start_date);
            const end = new Date(s.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            const current = new Date(date);
            current.setHours(0, 0, 0, 0);
            return current >= start && current <= end;
        });
    };

    const getProgressForDate = (date: Date | null) => {
        if (!date) return null;
        const dateStr = date.toISOString().split('T')[0];
        return dailyProgress.find(p => p.date === dateStr);
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const days = getDaysInMonth(currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <CalendarIcon className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0" />
                    <h2 className="text-lg md:text-2xl font-bold truncate">
                        <span className="hidden sm:inline">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
                        <span className="sm:hidden">{monthNames[currentDate.getMonth()].slice(0, 3)} {currentDate.getFullYear()}</span>
                    </h2>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <button
                        onClick={previousMonth}
                        className="p-2 rounded-lg hover:bg-muted transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg hover:bg-muted transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button
                        onClick={onAddSchedule}
                        className="ml-1 md:ml-2 flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[40px]"
                        aria-label="Add schedule"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">Reja qoʻshish</span>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {/* Day names */}
                {dayNames.map(day => (
                    <div key={day} className="text-center text-[10px] md:text-sm font-medium text-muted-foreground py-1 md:py-2">
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {days.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const daySchedules = getSchedulesForDate(date);
                    const progress = getProgressForDate(date);
                    const isToday = date.getTime() === today.getTime();
                    const isPast = date < today;
                    const hasProgress = progress && (progress.pages_read > 0 || progress.minutes_read > 0);
                    const isCompleted = progress?.completed;

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => onDateClick(date)}
                            className={`
                                aspect-square p-1 md:p-2 rounded-md md:rounded-lg border transition-all relative
                                ${isToday ? 'border-primary bg-primary/5' : 'border-border'}
                                ${isPast ? 'opacity-80' : ''}
                                hover:bg-muted hover:border-primary
                                flex flex-col items-center justify-center
                            `}
                        >
                            <span className={`text-xs md:text-sm font-medium ${isToday ? 'text-primary font-bold' : ''}`}>
                                {date.getDate()}
                            </span>

                            {/* Progress Indicators */}
                            <div className="flex gap-0.5 md:gap-1 mt-0.5 md:mt-1">
                                {isCompleted ? (
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500" title="Kunlik maqsad bajarildi" />
                                ) : hasProgress ? (
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-500" title="Oʻqildi, lekin maqsadga yetilmadi" />
                                ) : daySchedules.length > 0 ? (
                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary/30" title="Rejalashtirilgan" />
                                ) : null}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-4 md:mt-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded border-2 border-primary bg-primary/10" />
                    <span>Bugun</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded bg-primary" />
                    <span>Rejalashtirilgan</span>
                </div>
            </div>
        </div>
    );
}
