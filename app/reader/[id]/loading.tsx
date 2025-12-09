'use client';

export default function ReaderLoading() {
    return (
        <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium text-muted-foreground">Kitob ochilmoqda...</p>
                <p className="text-sm text-muted-foreground/70 mt-2">Iltimos kuting</p>
            </div>
        </div>
    );
}
