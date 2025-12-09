'use client';

export default function BookDetailLoading() {
    return (
        <div className="container py-10 px-4 md:px-6 animate-pulse">
            {/* Back button */}
            <div className="h-10 w-32 bg-muted/50 rounded-lg mb-8"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Book cover */}
                <div className="lg:col-span-1">
                    <div className="aspect-[2/3] bg-muted/50 rounded-xl"></div>
                </div>

                {/* Book info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-10 w-3/4 bg-muted/50 rounded"></div>
                    <div className="h-6 w-1/2 bg-muted/50 rounded"></div>
                    <div className="h-4 w-1/4 bg-muted/50 rounded"></div>

                    <div className="space-y-2">
                        <div className="h-4 bg-muted/50 rounded w-full"></div>
                        <div className="h-4 bg-muted/50 rounded w-full"></div>
                        <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                    </div>

                    <div className="flex gap-4">
                        <div className="h-12 w-32 bg-muted/50 rounded-xl"></div>
                        <div className="h-12 w-32 bg-muted/50 rounded-xl"></div>
                    </div>
                </div>
            </div>

            {/* Similar books */}
            <div className="mt-16">
                <div className="h-8 w-48 bg-muted/50 rounded mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[2/3] bg-muted/50 rounded-xl"></div>
                            <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                            <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
