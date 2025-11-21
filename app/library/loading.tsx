import { Search } from 'lucide-react';

export default function Loading() {
    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="h-10 w-48 bg-muted rounded-lg animate-pulse mb-2" />
                    <div className="h-5 w-32 bg-muted rounded-lg animate-pulse" />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <div className="w-full h-12 bg-muted rounded-lg animate-pulse" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 w-24 bg-muted rounded-lg animate-pulse flex-shrink-0" />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-xl overflow-hidden h-[300px] animate-pulse">
                        <div className="h-2/3 bg-muted" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 w-3/4 bg-muted rounded" />
                            <div className="h-3 w-1/2 bg-muted rounded" />
                            <div className="flex justify-between pt-2">
                                <div className="h-3 w-10 bg-muted rounded" />
                                <div className="h-3 w-10 bg-muted rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
