"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Role, hasPermission as checkPermission, ROLES } from '@/lib/permissions';

interface User {
    id: string;
    name: string;
    email: string;
    university?: string;
    role: Role;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string, university?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
    hasPermission: (permission: Role) => boolean;
    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Memoize setUserFromSupabase to prevent recreation on every render
    const setUserFromSupabase = useCallback(async (supabaseUser: SupabaseUser, skipCache = false) => {
        try {
            // Try to load from cache first for instant load
            if (!skipCache && typeof window !== 'undefined') {
                const cached = sessionStorage.getItem('user_profile');
                if (cached) {
                    const cachedUser = JSON.parse(cached);
                    if (cachedUser.id === supabaseUser.id) {
                        setUser(cachedUser);
                        // Refresh in background
                        setTimeout(() => setUserFromSupabase(supabaseUser, true), 100);
                        return;
                    }
                }
            }

            // Get user profile from profiles table - SELECT ONLY NEEDED FIELDS
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('name, university, role, avatar_url')
                .eq('id', supabaseUser.id)
                .maybeSingle();

            if (error && error.message) {
                console.error('Profile fetch error:', error);
            }

            const userData = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: profile?.name || supabaseUser.user_metadata?.name || 'User',
                university: profile?.university,
                role: (profile?.role as Role) || 'student',
                avatar_url: profile?.avatar_url,
            };

            setUser(userData);

            // Cache for instant subsequent loads
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('user_profile', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error setting user:', error);
            const fallbackUser = {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: supabaseUser.user_metadata?.name || 'User',
                university: undefined,
                role: 'student' as Role,
                avatar_url: undefined,
            };
            setUser(fallbackUser);
        }
    }, []);

    // Memoize checkUser function
    const checkUser = useCallback(async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.debug('Session expired or invalid, clearing:', error.message);
                await supabase.auth.signOut();
                setUser(null);
                setIsLoading(false);
                return;
            }

            if (session?.user) {
                setIsLoading(false);
                await setUserFromSupabase(session.user);
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Error checking user:', error);
            await supabase.auth.signOut();
            setUser(null);
            setIsLoading(false);
        }
    }, [setUserFromSupabase]);

    // Auth state change listener
    useEffect(() => {
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/login');
                router.refresh();
                return;
            }

            if (event === 'TOKEN_REFRESHED') {
                if (!session) {
                    setUser(null);
                    return;
                }
            }

            if (session?.user) {
                await setUserFromSupabase(session.user);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [checkUser, setUserFromSupabase, router]);

    // Memoize login function
    const login = useCallback(async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                await setUserFromSupabase(data.user);
                return { success: true };
            }

            return { success: false, error: 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'An unexpected error occurred' };
        }
    }, [setUserFromSupabase]);

    // Memoize register function
    const register = useCallback(async (name: string, email: string, password: string, university?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        university,
                    },
                },
            });

            if (error) {
                return { success: false, error: error.message };
            }

            if (data.user) {
                return { success: true };
            }

            return { success: false, error: 'Registration failed' };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'An unexpected error occurred' };
        }
    }, []);

    // Memoize logout function
    const logout = useCallback(async () => {
        try {
            // Clear user state immediately for instant UI update
            setUser(null);

            // Clear session storage cache
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('user_profile');
            }

            // Sign out from Supabase
            await supabase.auth.signOut();

            // Redirect to login page using Next.js router
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
            // Even if error, still clear state and redirect
            setUser(null);
            router.push('/login');
            router.refresh();
        }
    }, [router]);

    // Memoize permission check functions
    const hasPermissionCheck = useCallback((permission: Role) => {
        if (!user) return false;
        return checkPermission(user.role, permission);
    }, [user]);

    const isAdmin = useCallback(() => {
        if (!user) return false;
        return ['super_admin', 'system_admin', 'org_admin', 'head_librarian', 'librarian'].includes(user.role);
    }, [user]);

    const isSuperAdmin = useCallback(() => {
        return user?.role === 'super_admin';
    }, [user]);

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        user,
        login,
        register,
        logout,
        isLoading,
        hasPermission: hasPermissionCheck,
        isAdmin,
        isSuperAdmin,
    }), [user, login, register, logout, isLoading, hasPermissionCheck, isAdmin, isSuperAdmin]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
