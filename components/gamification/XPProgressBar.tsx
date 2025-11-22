"use client";

interface XPProgressBarProps {
    currentXP: number;
    currentLevel: number;
    showDetails?: boolean;
}

// Calculate XP needed for next level
function getXPForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
}

export function XPProgressBar({ currentXP, currentLevel, showDetails = true }: XPProgressBarProps) {
    const currentLevelXP = getXPForLevel(currentLevel);
    const nextLevelXP = getXPForLevel(currentLevel + 1);
    const xpInCurrentLevel = currentXP - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const progressPercent = Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100);

    return (
        <div className="w-full">
            {/* Level and XP Display */}
            {showDetails && (
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                            {currentLevel}
                        </div>
                        <div>
                            <div className="text-sm font-semibold">Level {currentLevel}</div>
                            <div className="text-xs text-muted-foreground">
                                {xpInCurrentLevel} / {xpNeededForNextLevel} XP
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-muted-foreground">Jami XP</div>
                        <div className="text-sm font-bold text-primary">{currentXP.toLocaleString()}</div>
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
                {/* Gradient Progress */}
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                >
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>

                {/* Percentage Text */}
                {showDetails && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white drop-shadow-lg">
                            {Math.round(progressPercent)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Next Level Info */}
            {showDetails && (
                <div className="mt-1 text-center">
                    <span className="text-xs text-muted-foreground">
                        Keyingi level uchun {xpNeededForNextLevel - xpInCurrentLevel} XP kerak
                    </span>
                </div>
            )}

            {/* Shimmer Animation */}
            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
