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
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string, university?: string) => Promise<boolean>;
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

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Login error:', error.message);
                return false;
            }

            // Don't wait for profile fetch here to speed up UI transition
            // onAuthStateChange will handle setting the user
            if (data.user) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (name: string, email: string, password: string, university?: string): Promise<boolean> => {
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
                return false;
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
                return true;
            }

            return false;
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
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
