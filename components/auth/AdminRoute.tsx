"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/permissions';

interface AdminRouteProps {
    children: React.ReactNode;
    requiredRole?: string; // 'admin' | 'super_admin' | 'librarian'
}

export function AdminRoute({ children, requiredRole }: AdminRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not authenticated
        if (!isLoading && !user) {
            router.push('/login');
            return;
        }

        // Check if user has required role
        if (!isLoading && user) {
            const userRole = user.role?.toLowerCase();
            const allowedRoles = [
                ROLES.SUPER_ADMIN.toLowerCase(),
                ROLES.ORG_ADMIN.toLowerCase(),
                ROLES.LIBRARIAN.toLowerCase()
            ];

            // If specific role required, check it
            if (requiredRole) {
                const required = requiredRole.toLowerCase();

                // Super admin can access everything
                if (userRole === ROLES.SUPER_ADMIN.toLowerCase()) {
                    return;
                }

                // Check if user has required role
                if (userRole !== required && !allowedRoles.includes(userRole)) {
                    router.push('/dashboard');
                    return;
                }
            } else {
                // No specific role, just check if user is admin/librarian/super_admin
                if (!allowedRoles.includes(userRole)) {
                    router.push('/dashboard');
                    return;
                }
            }
        }
    }, [user, isLoading, router, requiredRole]);

    // Show loading while auth is initializing
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

    // Don't render if not authenticated
    if (!user) {
        return null;
    }

    // Check role
    const userRole = user.role?.toLowerCase();
    const allowedRoles = [
        ROLES.SUPER_ADMIN.toLowerCase(),
        ROLES.ORG_ADMIN.toLowerCase(),
        ROLES.LIBRARIAN.toLowerCase()
    ];

    if (!allowedRoles.includes(userRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center max-w-md p-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Ruxsat yo'q</h1>
                    <p className="text-muted-foreground mb-6">
                        Bu sahifaga kirish uchun admin huquqlari kerak.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Dashboard ga qaytish
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
