"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Wait a bit for auth to initialize
        const timer = setTimeout(() => {
            if (!user) {
                router.push('/login');
            } else {
                setShouldRender(true);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [user, router]);

    // Show loading only briefly
    if (isLoading || !shouldRender) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
