export function AchievementsSkeleton() {
    return (
        <div className="container py-10 px-4 md:px-6 max-w-6xl mx-auto animate-pulse">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted/50 rounded-xl"></div>
                ))}
            </div>

            {/* Achievements */}
            <div className="space-y-4">
                <div className="h-8 w-48 bg-muted/50 rounded mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-40 bg-muted/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
