"use client";

import { LeaderboardItem } from "./LeaderboardItem";

interface LeaderboardListProps {
    users: any[];
    currentUserId?: string;
    type: 'xp' | 'streak';
}

export function LeaderboardList({ users, currentUserId, type }: LeaderboardListProps) {
    if (users.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                Hozircha reyting boʻsh
            </div>
        );
    }

    return (
        <div className="space-y-2 md:space-y-3">
            {users.map((user) => (
                <LeaderboardItem
                    key={user.user_id}
                    rank={user.rank}
                    user={{
                        id: user.user_id,
                        full_name: user.full_name,
                        avatar_url: user.avatar_url,
                        level: user.level,
                        xp: user.xp,
                        streak_days: user.streak_days
                    }}
                    isCurrentUser={user.user_id === currentUserId}
                    type={type}
                />
            ))}
        </div>
    );
}
