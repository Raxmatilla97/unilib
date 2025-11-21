import { BookOpen, Clock, Flame, TrendingUp } from 'lucide-react';

export function ReadingStats() {
    const stats = [
        { label: 'Books Read', value: '12', change: '+2 this month', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Hours Read', value: '48.5', change: '+5.2 hrs', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Current Streak', value: '4 Days', change: 'Keep it up!', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Avg. Daily', value: '45 min', change: '+12%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                            {stat.change}
                        </span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
