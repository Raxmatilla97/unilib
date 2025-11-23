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
    progress?: number;
    target?: number;
}

const tierColors = {
    bronze: 'from-amber-700/80 to-amber-900/80',
    silver: 'from-slate-400/80 to-slate-600/80',
    gold: 'from-yellow-400/80 to-yellow-600/80',
    platinum: 'from-cyan-400/80 to-blue-600/80'
};

const tierBorders = {
    bronze: 'border-amber-700/50',
    silver: 'border-slate-400/50',
    gold: 'border-yellow-400/50',
    platinum: 'border-cyan-400/50'
};

const tierGlows = {
    bronze: 'shadow-amber-900/20',
    silver: 'shadow-slate-900/20',
    gold: 'shadow-yellow-900/20',
    platinum: 'shadow-cyan-900/20'
};

export function AchievementBadge({
    title,
    description,
    icon,
    tier,
    xpReward,
    unlocked = false,
    unlockedAt,
    isNew = false,
    progress = 0,
    target = 100
}: AchievementBadgeProps) {
    const percent = Math.min(100, Math.round((progress / target) * 100));

    return (
        <div
            className={`relative group rounded-xl md:rounded-2xl p-4 md:p-6 border transition-all duration-500 overflow-hidden flex flex-col h-full ${unlocked
                ? `bg-gradient-to-br ${tierColors[tier]} ${tierBorders[tier]} shadow-lg ${tierGlows[tier]} hover:scale-[1.02] hover:shadow-xl`
                : 'bg-card/50 border-border/50 hover:bg-card/80'
                }`}
        >
            {/* Background Pattern */}
            {unlocked && (
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.8),transparent)]" />
            )}

            {/* New Badge */}
            {isNew && unlocked && (
                <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full animate-pulse shadow-lg">
                    YANGI
                </div>
            )}

            <div className="relative z-10 flex flex-col h-full">
                {/* Icon & Title */}
                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className={`text-2xl md:text-4xl p-2 md:p-3 rounded-lg md:rounded-xl bg-background/10 backdrop-blur-sm flex-shrink-0 ${unlocked ? 'shadow-inner' : 'grayscale opacity-50'}`}>
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-base md:text-lg leading-tight mb-1 ${unlocked ? 'text-white' : 'text-foreground'} line-clamp-2`}>
                            {title}
                        </h3>
                        <div className={`text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 rounded-full inline-block ${unlocked ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </div>
                    </div>
                </div>

                {/* Description - Grows to fill space */}
                <p className={`text-xs md:text-sm mb-3 md:mb-4 flex-grow ${unlocked ? 'text-white/90' : 'text-muted-foreground'} line-clamp-3`}>
                    {description}
                </p>

                {/* Footer: XP & Date or Progress */}
                <div className="mt-auto">
                    {unlocked ? (
                        <div className="flex items-center justify-between text-[10px] md:text-xs text-white/80 border-t border-white/10 pt-2 md:pt-3">
                            <span className="font-semibold text-yellow-300 flex items-center gap-1">
                                ⚡ +{xpReward} XP
                            </span>
                            {unlockedAt && (
                                <span className="text-[10px] md:text-xs">
                                    {new Date(unlockedAt).toLocaleDateString('uz-UZ', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-1.5 md:space-y-2">
                            <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground">
                                <span>Jarayon</span>
                                <span>{progress} / {target}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            <div className="flex justify-end">
                                <span className="text-[10px] md:text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    🔒 +{xpReward} XP
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
