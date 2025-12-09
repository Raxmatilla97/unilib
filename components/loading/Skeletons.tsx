export function DashboardSkeleton() {
    return (
        <div className="container py-10 px-4 md:px-6 animate-pulse">
            {/* Header */}
            <div className="mb-8">
                <div className="h-8 w-48 bg-muted/50 rounded mb-2"></div>
                <div className="h-4 w-64 bg-muted/50 rounded"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-muted/50 rounded-xl"></div>
                ))}
            </div>

            {/* Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                    <div className="h-6 w-40 bg-muted/50 rounded"></div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/50 rounded-xl"></div>
                    ))}
                </div>
                <div className="space-y-4">
                    <div className="h-6 w-40 bg-muted/50 rounded"></div>
                    <div className="h-64 bg-muted/50 rounded-xl"></div>
                </div>
            </div>

            {/* Activities */}
            <div className="space-y-4">
                <div className="h-6 w-40 bg-muted/50 rounded"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="container py-10 px-4 md:px-6 animate-pulse">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-muted/50"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-8 w-48 bg-muted/50 rounded"></div>
                        <div className="h-4 w-64 bg-muted/50 rounded"></div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/50 rounded-xl"></div>
                    ))}
                </div>

                {/* QR Code */}
                <div className="h-64 bg-muted/50 rounded-xl"></div>

                {/* Info */}
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-16 bg-muted/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function LibrarySkeleton() {
    return (
        <div className="container py-10 px-4 md:px-6 animate-pulse">
            {/* Search */}
            <div className="mb-8">
                <div className="h-12 bg-muted/50 rounded-xl max-w-2xl"></div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-24 bg-muted/50 rounded-lg"></div>
                ))}
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-64 bg-muted/50 rounded-xl"></div>
                        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                        <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LeaderboardSkeleton() {
    return (
        <div className="container py-10 px-4 md:px-6 animate-pulse">
            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <div className="h-10 w-32 bg-muted/50 rounded-lg"></div>
                <div className="h-10 w-32 bg-muted/50 rounded-lg"></div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div key={i} className="h-20 bg-muted/50 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
}
