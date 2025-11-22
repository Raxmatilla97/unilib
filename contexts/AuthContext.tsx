"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole, hasPermission, Permission, isAdmin } from '@/lib/permissions';

interface User {
    id: string;
    name: string;
    email: string;
    university?: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string, university?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
    hasPermission: (permission: Permission) => boolean;
    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkUser();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
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
    }, []);

    const checkUser = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            // If there's an error (like invalid refresh token), clear the session
            if (error) {
                console.warn('Session error:', error.message);
                await supabase.auth.signOut();
                setUser(null);
                setIsLoading(false);
                return;
            }

            if (session?.user) {
                await setUserFromSupabase(session.user);
            }
        } catch (error) {
            console.error('Error checking user:', error);
            // Clear any invalid session
            await supabase.auth.signOut();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const setUserFromSupabase = async (supabaseUser: SupabaseUser) => {
        // Get user profile from profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('name, university, role')
            .eq('id', supabaseUser.id)
            .single();

        setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: profile?.name || supabaseUser.email!.split('@')[0],
            university: profile?.university,
            role: (profile?.role as UserRole) || 'USER'
        });
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('Login error:', error.message);
                return { success: false, error: error.message };
            }
            if (data.user) {
                // Let onAuthStateChange listener fetch profile and set user
                return { success: true };
            }
            return { success: false, error: 'Login failed' };
        } catch (err: any) {
            console.error('Login error:', err);
            return { success: false, error: err.message || 'An unexpected error occurred' };
        }
    };

    const register = async (name: string, email: string, password: string, university?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Sign up the user with metadata
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        university
                    }
                }
            });

            if (error) {
                console.error('Registration error:', error.message);
                return { success: false, error: error.message };
            }

            if (data.user) {
                // Profile will be created by database trigger
                // Just set the user state
                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    name: name,
                    university: university,
                    role: 'USER'
                });
                return { success: true };
            }

            return { success: false, error: 'Registration failed' };
        } catch (error: any) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred' };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
        setUser(null);
        // Force clear any potential stale state
        if (typeof window !== 'undefined') {
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('sb-refresh-token');
        }
        // Force reload to clear Next.js client cache
        window.location.href = '/login';
    };

    const checkPermission = (permission: Permission): boolean => {
        if (!user) return false;
        return hasPermission(user.role, permission);
    };

    const checkIsAdmin = (): boolean => {
        if (!user) return false;
        return isAdmin(user.role);
    };

    const checkIsSuperAdmin = (): boolean => {
        if (!user) return false;
        return user.role === 'SUPER_ADMIN';
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isLoading,
            hasPermission: checkPermission,
            isAdmin: checkIsAdmin,
            isSuperAdmin: checkIsSuperAdmin
        }}>
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
