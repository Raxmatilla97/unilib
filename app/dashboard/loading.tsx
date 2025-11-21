export default function Loading() {
    return (
        <div className="container py-10 px-4 md:px-6 max-w-6xl mx-auto">
            {/* Welcome Header Skeleton */}
            <div className="mb-8">
                <div className="h-10 w-64 bg-muted rounded-lg animate-pulse mb-2" />
                <div className="h-6 w-48 bg-muted rounded-lg animate-pulse" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-2xl p-6 h-32 animate-pulse">
                        <div className="w-12 h-12 rounded-xl bg-muted mb-3" />
                        <div className="h-4 w-16 bg-muted rounded mb-2" />
                        <div className="h-8 w-12 bg-muted rounded" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 h-64 animate-pulse" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card border border-border rounded-2xl p-6 h-32 animate-pulse" />
                        <div className="bg-card border border-border rounded-2xl p-6 h-32 animate-pulse" />
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-6 h-48 animate-pulse" />
                    <div className="bg-card border border-border rounded-2xl p-6 h-64 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
