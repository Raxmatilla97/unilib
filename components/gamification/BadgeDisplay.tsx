import { Award, Lock, Star, Zap, Book, Target, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: any;
    unlocked: boolean;
    date?: string;
    color: string;
}

export function BadgeDisplay() {
    const badges: Badge[] = [
        { id: '1', name: 'Bookworm', description: 'Read 10 books', icon: Book, unlocked: true, date: '2 days ago', color: 'text-blue-500 bg-blue-500/10' },
        { id: '2', name: 'Speed Reader', description: 'Read 100 pages in an hour', icon: Zap, unlocked: true, date: '1 week ago', color: 'text-yellow-500 bg-yellow-500/10' },
        { id: '3', name: 'Consistent', description: '7 day reading streak', icon: Star, unlocked: true, date: 'Yesterday', color: 'text-purple-500 bg-purple-500/10' },
        { id: '4', name: 'Social Butterfly', description: 'Join 5 study groups', icon: Award, unlocked: false, color: 'text-pink-500 bg-pink-500/10' },
        { id: '5', name: 'Deep Diver', description: 'Read for 5 hours straight', icon: Target, unlocked: false, color: 'text-emerald-500 bg-emerald-500/10' },
        { id: '6', name: 'Critic', description: 'Write 10 reviews', icon: MessageCircle, unlocked: false, color: 'text-orange-500 bg-orange-500/10' },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className={cn(
                        "relative p-4 rounded-xl border transition-all group",
                        badge.unlocked
                            ? "bg-card border-border hover:border-primary/50 hover:shadow-md"
                            : "bg-muted/30 border-transparent opacity-70"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                        badge.unlocked ? badge.color : "bg-muted text-muted-foreground"
                    )}>
                        {badge.unlocked ? <badge.icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                    </div>

                    <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground leading-tight">{badge.description}</p>

                    {badge.unlocked && (
                        <div className="mt-3 text-[10px] font-medium text-primary/70 bg-primary/5 inline-block px-2 py-0.5 rounded-full">
                            Unlocked {badge.date}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
