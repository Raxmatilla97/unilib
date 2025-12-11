"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfileData } from '@/lib/react-query/hooks';
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
    Camera,
    Phone,
    GraduationCap,
    Users,
    BookMarked
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { ProfileSkeleton } from '@/components/loading/ProfileSkeleton';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

// Lazy load heavy components
const StudentIDCard = dynamic(() => import('@/components/profile/StudentIDCard'), {
    loading: () => <div className="bg-card/80 rounded-2xl p-6 h-64 animate-pulse" />,
    ssr: false
});

export default function ProfilePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ✅ Use React Query hook with automatic caching
    const { data, isLoading, error } = useProfileData(user?.id);

    const [editedProfile, setEditedProfile] = useState({
        name: '',
        university: '',
        bio: ''
    });

    // ✅ Simplified - no heavy QR/Barcode generation on page load
    // QR/Barcode will be shown only when needed

    // Update edited profile when data loads
    useEffect(() => {
        if (data?.profile) {
            setEditedProfile({
                name: data.profile.name || '',
                university: data.profile.university || '',
                bio: data.profile.bio || ''
            });
        }
    }, [data?.profile]);

    // ✅ Memoized save handler
    const handleSave = useCallback(async () => {
        if (!user?.id) return;

        setIsSaving(true);
        const toastId = toast.loading('Saqlanmoqda...');

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: editedProfile.name,
                    university: editedProfile.university,
                    bio: editedProfile.bio
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Profil yangilandi!', { id: toastId });
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Xatolik yuz berdi. Qaytadan urinib ko\'ring.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    }, [user?.id, editedProfile, queryClient]);

    // ✅ Memoized cancel handler
    const handleCancel = useCallback(() => {
        if (data?.profile) {
            setEditedProfile({
                name: data.profile.name || '',
                university: data.profile.university || '',
                bio: data.profile.bio || ''
            });
        }
        setIsEditing(false);
    }, [data?.profile]);

    if (isLoading) {
        return (
            <ProtectedRoute>
                <ProfileSkeleton />
            </ProtectedRoute>
        );
    }

    if (error || !data?.profile) {
        return (
            <ProtectedRoute>
                <div className="container py-10 px-4 md:px-6">
                    <div className="text-center text-red-500">
                        Xatolik yuz berdi. Qaytadan urinib ko'ring.
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const profile = data.profile;
    const activeLoans = data.activeLoans;

    return (
        <ProtectedRoute>
            {/* Premium Background */}
            <div className="min-h-screen bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[800px] h-[400px] bg-primary/5 blur-3xl rounded-full opacity-60 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-soft-light pointer-events-none"></div>

                <div className="container relative z-10 py-8 md:py-12 px-4 md:px-6 max-w-6xl mx-auto">
                    {/* Premium Header */}
                    <div className="mb-8 md:mb-10">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                    Shaxsiy Profil
                                </h1>
                                <p className="text-base md:text-lg text-muted-foreground">
                                    Ma'lumotlaringizni boshqaring va yangilang
                                </p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 min-h-[48px] w-full sm:w-auto"
                                >
                                    <Edit2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    <span className="font-semibold">Tahrirlash</span>
                                </button>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-muted/50 backdrop-blur-sm text-foreground rounded-xl hover:bg-muted transition-all min-h-[48px]"
                                    >
                                        <X className="w-5 h-5" />
                                        <span className="font-medium">Bekor qilish</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                                    >
                                        <Save className="w-5 h-5" />
                                        <span className="font-semibold">{isSaving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Left Column - Profile Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Avatar and Basic Info Card */}
                            <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    {/* Avatar */}
                                    <div className="relative group mx-auto sm:mx-0">
                                        {profile.avatar_url ? (
                                            <img
                                                src={profile.avatar_url}
                                                alt={profile.name}
                                                className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover shadow-lg ring-4 ring-primary/20"
                                                onError={(e) => {
                                                    // Fallback to initials if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg ring-4 ring-primary/20 ${profile.avatar_url ? 'hidden' : ''}`}>
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                        {isEditing && (
                                            <button className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Camera className="w-6 h-6 text-white" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 w-full">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-semibold mb-2 block text-foreground/80">Ism</label>
                                                    <input
                                                        type="text"
                                                        value={editedProfile.name}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                                        className="w-full px-4 py-3 text-base bg-background/50 backdrop-blur-sm border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-semibold mb-2 block text-foreground/80">Universitet</label>
                                                    <input
                                                        type="text"
                                                        value={editedProfile.university}
                                                        onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
                                                        className="w-full px-4 py-3 text-base bg-background/50 backdrop-blur-sm border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h2 className="text-2xl md:text-3xl font-bold mb-3">{profile.name}</h2>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 text-muted-foreground">
                                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                                        <span className="text-sm truncate">{profile.email}</span>
                                                    </div>
                                                    {profile.university && (
                                                        <div className="flex items-center gap-3 text-muted-foreground">
                                                            <Building2 className="w-4 h-4 flex-shrink-0" />
                                                            <span className="text-sm">{profile.university}</span>
                                                        </div>
                                                    )}
                                                    {(profile.student_number || profile.student_id) && (
                                                        <div className="flex items-center gap-3 mt-3">
                                                            <User className="w-4 h-4 flex-shrink-0 text-primary" />
                                                            <span className="text-sm font-mono font-semibold text-primary">
                                                                ID: {profile.student_number || profile.student_id}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="mt-6 pt-6 border-t border-border/40">
                                    <label className="text-sm font-semibold mb-3 block">Bio</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedProfile.bio}
                                            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                            rows={3}
                                            placeholder="O'zingiz haqingizda qisqacha yozing..."
                                            className="w-full px-4 py-3 text-base bg-background/50 backdrop-blur-sm border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none resize-none"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {profile.bio || 'Bio qo\'shilmagan'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Active Loans */}
                            {activeLoans.length > 0 && (
                                <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl overflow-hidden shadow-xl">
                                    <div className="p-6 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
                                        <h3 className="font-bold text-base flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                            Qarzda Kitoblar ({activeLoans.length})
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-border/40">
                                        {activeLoans.map((loan: any) => {
                                            const book = loan.physical_book_copies?.books;
                                            const copy = loan.physical_book_copies;
                                            const dueDate = new Date(loan.due_date);
                                            const isOverdue = dueDate < new Date();
                                            const daysRemaining = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                            return (
                                                <div key={loan.id} className="p-4 hover:bg-muted/30 transition-colors">
                                                    <div className="flex gap-4">
                                                        <div className={`w-12 h-16 rounded-lg ${book?.cover_color || 'bg-primary'} flex-shrink-0 shadow-md`}></div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold truncate">{book?.title}</h4>
                                                            <p className="text-sm text-muted-foreground">{book?.author}</p>
                                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                                                    #{copy?.copy_number}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-xs">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>Muddat: {dueDate.toLocaleDateString()}</span>
                                                                </div>
                                                                {isOverdue ? (
                                                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-600 text-xs rounded-full font-medium">
                                                                        MUDDATI O'TGAN ({Math.abs(daysRemaining)} kun)
                                                                    </span>
                                                                ) : daysRemaining <= 3 ? (
                                                                    <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-600 text-xs rounded-full font-medium">
                                                                        {daysRemaining} kun qoldi
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Account Info */}
                            <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-6 shadow-xl">
                                <h3 className="font-bold mb-4 text-base">Hisob Ma'lumotlari</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Email</p>
                                                <p className="text-sm text-muted-foreground">{profile.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-primary" />
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

                            {/* Academic Info (HEMIS Data) */}
                            {(profile.faculty || profile.student_group || profile.course) && (
                                <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-6 shadow-xl">
                                    <h3 className="font-bold mb-4 text-base">Akademik Ma'lumotlar</h3>
                                    <div className="space-y-3">
                                        {profile.phone && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Phone className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Telefon</p>
                                                    <p className="text-sm text-muted-foreground">{profile.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.faculty && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Fakultet</p>
                                                    <p className="text-sm text-muted-foreground">{profile.faculty}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.student_group && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Guruh</p>
                                                    <p className="text-sm text-muted-foreground">{profile.student_group}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.course && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <GraduationCap className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Kurs</p>
                                                    <p className="text-sm text-muted-foreground">{profile.course}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.education_form && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <BookOpen className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Ta'lim shakli</p>
                                                    <p className="text-sm text-muted-foreground">{profile.education_form}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.specialty && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <BookMarked className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Mutaxassislik</p>
                                                    <p className="text-sm text-muted-foreground">{profile.specialty}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.gpa && (
                                            <div className="flex items-center gap-3 py-2">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Award className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">GPA</p>
                                                    <p className="text-sm text-muted-foreground font-semibold">{profile.gpa}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Stats */}
                        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                            {/* Student ID Card with QR/Barcode - Lazy Loaded */}
                            {(profile.student_number || profile.student_id) && (
                                <StudentIDCard studentNumber={profile.student_number || profile.student_id} />
                            )}

                            {/* XP Card */}
                            <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-base">Tajriba</h3>
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-bold">{profile.xp} XP</span>
                                        <span className="text-sm text-muted-foreground">Jami</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                            style={{ width: `${(profile.xp % 1000) / 10}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        {1000 - (profile.xp % 1000)} XP keyingi darajaga
                                    </p>
                                </div>
                            </div>

                            {/* Streak Card */}
                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-amber-600 dark:text-amber-500 text-base">Streak</h3>
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
            </div>
        </ProtectedRoute>
    );
}
