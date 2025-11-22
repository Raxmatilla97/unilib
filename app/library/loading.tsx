export default function LibraryLoading() {
    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="h-10 w-48 bg-muted rounded-lg mb-8 animate-pulse" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm">
                        <div className="aspect-[2/3] bg-muted animate-pulse" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                            <div className="flex justify-between pt-2">
                                <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                                <div className="h-3 bg-muted rounded w-1/4 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
