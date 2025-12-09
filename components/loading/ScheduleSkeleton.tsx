export function ScheduleSkeleton() {
    return (
        <div className="container py-10 px-4 md:px-6 animate-pulse">
            {/* Header */}
            <div className="mb-8">
                <div className="h-8 w-48 bg-muted/50 rounded mb-2"></div>
                <div className="h-4 w-64 bg-muted/50 rounded"></div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted/50 rounded-xl"></div>
                ))}
            </div>

            {/* Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-muted/50 rounded-xl"></div>
                <div className="space-y-4">
                    <div className="h-6 w-40 bg-muted/50 rounded"></div>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-muted/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
