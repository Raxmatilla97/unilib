import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StreakTracker() {
    const days = [
        { day: 'M', active: true },
        { day: 'T', active: true },
        { day: 'W', active: true },
        { day: 'T', active: true },
        { day: 'F', active: false },
        { day: 'S', active: true },
        { day: 'S', active: false }, // Today
    ];

    return (
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                        Reading Streak
                    </h3>
                    <p className="text-sm text-muted-foreground">You're on fire! Keep it up.</p>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">4</div>
                    <div className="text-xs font-medium uppercase tracking-wider text-orange-500/70">Days</div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                {days.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            item.active
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110"
                                : "bg-muted text-muted-foreground"
                        )}>
                            {item.active ? <Flame className="w-4 h-4 fill-white" /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
