"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Medal, Trophy, Flame, Star } from "lucide-react";

interface LeaderboardItemProps {
    rank: number;
    user: {
        id: string;
        full_name: string;
        avatar_url?: string;
        level: number;
        xp?: number;
        streak_days?: number;
    };
    isCurrentUser?: boolean;
    type: 'xp' | 'streak';
}

export function LeaderboardItem({ rank, user, isCurrentUser, type }: LeaderboardItemProps) {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />;
            default:
                return <span className="font-bold text-muted-foreground w-6 text-center">{rank}</span>;
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-yellow-500/10 border-yellow-500/20";
            case 2:
                return "bg-gray-400/10 border-gray-400/20";
            case 3:
                return "bg-amber-700/10 border-amber-700/20";
            default:
                return "bg-card border-border hover:bg-accent/5";
        }
    };

    return (
        <div className={cn(
            "flex items-center gap-2 md:gap-4 p-3 md:p-4 rounded-lg md:rounded-xl border transition-all",
            getRankStyle(rank),
            isCurrentUser && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}>
            <div className="flex items-center justify-center w-6 md:w-8 flex-shrink-0">
                {getRankIcon(rank)}
            </div>

            <Avatar className="w-8 h-8 md:w-10 md:h-10 border-2 border-background flex-shrink-0">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm md:text-base truncate">
                        {user.full_name || 'Foydalanuvchi'}
                        {isCurrentUser && <span className="ml-1 md:ml-2 text-[10px] md:text-xs bg-primary/10 text-primary px-1.5 md:px-2 py-0.5 rounded-full">Siz</span>}
                    </h3>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                    {user.level}-daraja
                </p>
            </div>

            <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm md:text-lg flex items-center justify-end gap-1">
                    {type === 'xp' ? (
                        <>
                            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                            <span className="hidden sm:inline">{user.xp?.toLocaleString()} XP</span>
                            <span className="sm:hidden text-xs">{(user.xp || 0) >= 1000 ? `${Math.floor((user.xp || 0) / 1000)}k` : user.xp}</span>
                        </>
                    ) : (
                        <>
                            <Flame className="w-3 h-3 md:w-4 md:h-4 text-orange-500 fill-orange-500" />
                            <span>{user.streak_days} <span className="hidden sm:inline">kun</span></span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
