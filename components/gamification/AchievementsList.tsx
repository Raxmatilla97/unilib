import { useState } from 'react';
import { AchievementBadge } from './AchievementBadge';
import { Trophy, Lock, Unlock, Grid } from 'lucide-react';

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

interface UserStats {
    xp: number;
    level: number;
    streak: number;
    booksCompleted: number;
    pagesRead: number;
    dailyGoalsCompleted: number;
}

interface AchievementsListProps {
    achievements: Achievement[];
    userAchievements: Achievement[];
    userStats: UserStats;
}

export function AchievementsList({ achievements, userAchievements, userStats }: AchievementsListProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');

    // Create a map of unlocked achievements for quick lookup
    const unlockedMap = new Map(
        userAchievements.map(ua => [ua.key, { unlocked_at: ua.unlocked_at, seen: ua.seen }])
    );

    // Helper to calculate progress
    const getProgress = (key: string) => {
        let current = 0;
        let target = 1;

        if (key.includes('book')) {
            current = userStats.booksCompleted;
            if (key.includes('first')) target = 1;
            else if (key.includes('5')) target = 5;
            else if (key.includes('10')) target = 10;
            else if (key.includes('25')) target = 25;
            else if (key.includes('50')) target = 50;
            else if (key.includes('100')) target = 100;
        } else if (key.includes('streak')) {
            current = userStats.streak;
            if (key.includes('3')) target = 3;
            else if (key.includes('7')) target = 7;
            else if (key.includes('14')) target = 14;
            else if (key.includes('30')) target = 30;
        } else if (key.includes('page')) {
            current = userStats.pagesRead;
            if (key.includes('100')) target = 100;
            else if (key.includes('500')) target = 500;
            else if (key.includes('1000')) target = 1000;
            else if (key.includes('5000')) target = 5000;
        } else if (key.includes('goal')) {
            current = userStats.dailyGoalsCompleted;
            if (key.includes('1')) target = 1;
            else if (key.includes('7')) target = 7;
            else if (key.includes('30')) target = 30;
        }

        return { current, target };
    };

    // Filter achievements based on tab
    const filteredAchievements = achievements.filter(achievement => {
        const isUnlocked = unlockedMap.has(achievement.key);
        if (activeTab === 'unlocked') return isUnlocked;
        if (activeTab === 'locked') return !isUnlocked;
        return true;
    });

    // Group achievements by tier
    const groupedByTier = {
        platinum: [] as Achievement[],
        gold: [] as Achievement[],
        silver: [] as Achievement[],
        bronze: [] as Achievement[]
    };

    filteredAchievements.forEach(achievement => {
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
        <div className="space-y-8">
            {/* Stats Header - Mobile Optimized */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl md:text-4xl shadow-inner flex-shrink-0">
                            🏆
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Yutuqlar</h2>
                            <p className="text-muted-foreground text-sm md:text-lg">
                                {unlockedCount} / {totalAchievements} ochilgan
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 w-full md:max-w-md">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs md:text-sm font-medium text-muted-foreground">Umumiy jarayon</span>
                            <span className="text-xl md:text-2xl font-bold text-primary">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-3 md:h-4 bg-muted/50 rounded-full overflow-hidden p-0.5 md:p-1 border border-border/50">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary/20"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - Mobile Optimized */}
            <div className="flex p-1 bg-muted/50 rounded-xl w-full md:w-fit">
                {[
                    { id: 'all', label: 'Barchasi', icon: Grid },
                    { id: 'unlocked', label: 'Ochilgan', icon: Unlock },
                    { id: 'locked', label: 'Qulflangan', icon: Lock },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-300 min-h-[44px] ${activeTab === tab.id
                            ? 'bg-background text-foreground shadow-sm scale-105'
                            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Achievements by Tier */}
            <div className="space-y-12">
                {(['platinum', 'gold', 'silver', 'bronze'] as const).map(tier => {
                    const tierAchievements = groupedByTier[tier];
                    if (tierAchievements.length === 0) return null;

                    const tierConfig = {
                        platinum: { name: 'Platinum', icon: '💎', color: 'text-cyan-400' },
                        gold: { name: 'Gold', icon: '🥇', color: 'text-yellow-400' },
                        silver: { name: 'Silver', icon: '🥈', color: 'text-slate-400' },
                        bronze: { name: 'Bronze', icon: '🥉', color: 'text-amber-600' }
                    };

                    return (
                        <div key={tier} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                <span className="text-xl md:text-2xl flex-shrink-0">{tierConfig[tier].icon}</span>
                                <h3 className={`text-lg md:text-2xl font-bold ${tierConfig[tier].color}`}>
                                    {tierConfig[tier].name}
                                </h3>
                                <div className="h-px flex-1 bg-border/50" />
                                <span className="text-xs md:text-sm text-muted-foreground font-medium px-2 md:px-3 py-1 rounded-full bg-muted/50">
                                    {tierAchievements.length}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-fr">
                                {tierAchievements.map(achievement => {
                                    const { current, target } = getProgress(achievement.key);
                                    return (
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
                                            progress={current}
                                            target={target}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {filteredAchievements.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl grayscale opacity-50">
                            🏆
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Hech narsa topilmadi</h3>
                        <p className="text-muted-foreground">Bu kategoriyada yutuqlar yoʻq</p>
                    </div>
                )}
            </div>
        </div>
    );
}
