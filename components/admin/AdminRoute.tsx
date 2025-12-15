"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { canManageBooks, isAdmin, isLibrarian, Role } from '@/lib/permissions';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect if not authenticated
        if (!isLoading && !user) {
            console.log('[AdminRoute] No user, redirecting to login');
            router.push('/login');
            return;
        }

        // Check if user has admin/librarian access
        if (!isLoading && user) {
            console.log('[AdminRoute] User:', user);
            console.log('[AdminRoute] User role:', user.role);

            if (!user.role) {
                console.log('[AdminRoute] No role found, redirecting to dashboard');
                router.push('/dashboard');
                return;
            }

            const userRole = user.role as Role;

            // Allow access for admins and librarians
            const hasAccess = isAdmin(userRole) || isLibrarian(userRole) || canManageBooks(userRole);

            console.log('[AdminRoute] Role check:', {
                userRole,
                isAdmin: isAdmin(userRole),
                isLibrarian: isLibrarian(userRole),
                canManageBooks: canManageBooks(userRole),
                hasAccess
            });

            if (!hasAccess) {
                console.log('[AdminRoute] Access denied, redirecting to dashboard');
                router.push('/dashboard');
                return;
            }

            console.log('[AdminRoute] Access granted!');
        }
    }, [user, isLoading, router]);

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

    // Check if role exists
    if (!user.role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center max-w-md p-8">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold mb-2">Role topilmadi</h1>
                    <p className="text-muted-foreground mb-6">
                        Sizning profilingizda role belgilanmagan. Iltimos, admin bilan bog'laning.
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

    // Check role
    const userRole = user.role as Role;
    const hasAccess = isAdmin(userRole) || isLibrarian(userRole) || canManageBooks(userRole);

    if (!hasAccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center max-w-md p-8">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Ruxsat yoʻq</h1>
                    <p className="text-muted-foreground mb-4">
                        Bu sahifaga kirish uchun admin yoki kutubxonachi huquqlari kerak.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Sizning rolingiz: <span className="font-semibold">{userRole}</span>
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
