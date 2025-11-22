"use client";

interface AchievementBadgeProps {
    title: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    xpReward: number;
    unlocked?: boolean;
    unlockedAt?: string;
    isNew?: boolean;
}

const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-blue-600'
};

const tierBorders = {
    bronze: 'border-amber-700',
    silver: 'border-gray-400',
    gold: 'border-yellow-400',
    platinum: 'border-cyan-400'
};

export function AchievementBadge({
    title,
    description,
    icon,
    tier,
    xpReward,
    unlocked = false,
    unlockedAt,
    isNew = false
}: AchievementBadgeProps) {
    return (
        <div
            className={`relative group rounded-xl p-4 border-2 transition-all duration-300 ${unlocked
                    ? `bg-gradient-to-br ${tierColors[tier]} ${tierBorders[tier]} hover:scale-105 hover:shadow-xl`
                    : 'bg-card border-border opacity-50 grayscale hover:opacity-70'
                }`}
        >
            {/* New Badge */}
            {isNew && unlocked && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    YANGI!
                </div>
            )}

            {/* Icon */}
            <div className="text-center mb-3">
                <div className={`text-5xl mb-2 ${unlocked ? 'animate-bounce' : ''}`}>
                    {icon}
                </div>
                <h3 className={`font-bold text-lg ${unlocked ? 'text-white' : 'text-foreground'}`}>
                    {title}
                </h3>
            </div>

            {/* Description */}
            <p className={`text-sm text-center mb-3 ${unlocked ? 'text-white/90' : 'text-muted-foreground'}`}>
                {description}
            </p>

            {/* XP Reward */}
            <div className="flex items-center justify-center gap-2">
                <span className={`text-sm font-semibold ${unlocked ? 'text-yellow-300' : 'text-muted-foreground'}`}>
                    +{xpReward} XP
                </span>
            </div>

            {/* Unlocked Date */}
            {unlocked && unlockedAt && (
                <div className="mt-2 text-center">
                    <span className="text-xs text-white/70">
                        {new Date(unlockedAt).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            )}

            {/* Lock Icon for Locked Achievements */}
            {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-20">🔒</div>
                </div>
            )}
        </div>
    );
}
