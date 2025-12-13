"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ReadOnlyRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean; // If true, acts like ProtectedRoute
}

export function ReadOnlyRoute({ children, requireAuth = false }: ReadOnlyRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    // If requireAuth is true and user is not authenticated, redirect to login
    if (requireAuth && !user) {
        router.push('/login');
        return null;
    }

    // For read-only mode, allow viewing even without authentication
    // Individual components will handle blocking write operations
    return <>{children}</>;
}
