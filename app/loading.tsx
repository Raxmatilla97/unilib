import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-muted-foreground animate-pulse">Yuklanmoqda...</p>
            </div>
        </div>
    );
}
