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
