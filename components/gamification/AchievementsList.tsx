"use client";

import { AchievementBadge } from './AchievementBadge';

interface Achievement {
    id: string;
    key: string;
    title: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    xp_reward: number;
    unlocked_at?: string;
    seen?: boolean;
}

interface AchievementsListProps {
    achievements: Achievement[];
    userAchievements: Achievement[];
}

export function AchievementsList({ achievements, userAchievements }: AchievementsListProps) {
    // Create a map of unlocked achievements for quick lookup
    const unlockedMap = new Map(
        userAchievements.map(ua => [ua.key, { unlocked_at: ua.unlocked_at, seen: ua.seen }])
    );

    // Group achievements by tier
    const groupedByTier = {
        platinum: [] as Achievement[],
        gold: [] as Achievement[],
        silver: [] as Achievement[],
        bronze: [] as Achievement[]
    };

    achievements.forEach(achievement => {
        const unlockInfo = unlockedMap.get(achievement.key);
        const achievementWithUnlock = {
            ...achievement,
            unlocked_at: unlockInfo?.unlocked_at,
            seen: unlockInfo?.seen
        };
        groupedByTier[achievement.tier].push(achievementWithUnlock);
    });

    // Calculate stats
    const totalAchievements = achievements.length;
    const unlockedCount = userAchievements.length;
    const progressPercent = Math.round((unlockedCount / totalAchievements) * 100);

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">🏆 Yutuqlar</h2>
                        <p className="text-muted-foreground">
                            {unlockedCount} / {totalAchievements} ochilgan
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-primary">{progressPercent}%</div>
                        <div className="text-sm text-muted-foreground">Bajarilgan</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Achievements by Tier */}
            {(['platinum', 'gold', 'silver', 'bronze'] as const).map(tier => {
                const tierAchievements = groupedByTier[tier];
                if (tierAchievements.length === 0) return null;

                const tierNames = {
                    platinum: '💎 Platinum',
                    gold: '🥇 Gold',
                    silver: '🥈 Silver',
                    bronze: '🥉 Bronze'
                };

                return (
                    <div key={tier}>
                        <h3 className="text-xl font-bold mb-4">{tierNames[tier]}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tierAchievements.map(achievement => (
                                <AchievementBadge
                                    key={achievement.id}
                                    title={achievement.title}
                                    description={achievement.description}
                                    icon={achievement.icon}
                                    tier={achievement.tier}
                                    xpReward={achievement.xp_reward}
                                    unlocked={!!achievement.unlocked_at}
                                    unlockedAt={achievement.unlocked_at}
                                    isNew={!!(achievement.unlocked_at && !achievement.seen)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
