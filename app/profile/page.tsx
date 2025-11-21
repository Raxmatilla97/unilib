"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
    User,
    Mail,
    Building2,
    Calendar,
    Award,
    BookOpen,
    TrendingUp,
    Edit2,
    Save,
    X,
    Camera
} from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        university: '',
        bio: '',
        avatar_url: '',
        xp: 0,
        level: 1,
        streak_days: 0,
        created_at: ''
    });

    const [editedProfile, setEditedProfile] = useState(profile);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setProfile(data);
                setEditedProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: editedProfile.name,
                    university: editedProfile.university,
                    bio: editedProfile.bio
                })
                .eq('id', user?.id);

            if (error) throw error;

            setProfile(editedProfile);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <div className="container py-10 px-4 md:px-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Yuklanmoqda...</p>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container py-10 px-4 md:px-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
                        <p className="text-muted-foreground mt-1">Shaxsiy ma'lumotlaringizni boshqaring</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                            Tahrirlash
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={handleCancel}
                                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Avatar and Basic Info */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                {/* Avatar */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                    {isEditing && (
                                        <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-6 h-6 text-white" />
                                        </button>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Ism</label>
                                                <input
                                                    type="text"
                                                    value={editedProfile.name}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium mb-1 block">Universitet</label>
                                                <input
                                                    type="text"
                                                    value={editedProfile.university || ''}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{profile.email}</span>
                                            </div>
                                            {profile.university && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Building2 className="w-4 h-4" />
                                                    <span className="text-sm">{profile.university}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <label className="text-sm font-medium mb-2 block">Bio</label>
                                {isEditing ? (
                                    <textarea
                                        value={editedProfile.bio || ''}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                        rows={3}
                                        placeholder="O'zingiz haqingizda qisqacha yozing..."
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-muted-foreground">
                                        {profile.bio || 'Bio qo\'shilmagan'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Account Info */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold mb-4">Hisob Ma'lumotlari</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Email</p>
                                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Qo'shilgan sana</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(profile.created_at).toLocaleDateString('uz-UZ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                        {/* Level Card */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-primary">Daraja</h3>
                                <Award className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-bold mb-2">{profile.level}</div>
                                <p className="text-sm text-muted-foreground">Hozirgi daraja</p>
                            </div>
                        </div>

                        {/* XP Card */}
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold">Tajriba</h3>
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold">{profile.xp} XP</span>
                                    <span className="text-sm text-muted-foreground">Jami</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-accent"
                                        style={{ width: `${(profile.xp % 1000) / 10}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    {1000 - (profile.xp % 1000)} XP keyingi darajaga
                                </p>
                            </div>
                        </div>

                        {/* Streak Card */}
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-amber-600 dark:text-amber-500">Streak</h3>
                                <div className="text-2xl">🔥</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold mb-2">{profile.streak_days}</div>
                                <p className="text-sm text-muted-foreground">Kun ketma-ket</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
