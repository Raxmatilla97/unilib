"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import QRCode from 'qrcode';
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
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [activeLoans, setActiveLoans] = useState<any[]>([]);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        university: '',
        bio: '',
        avatar_url: '',
        xp: 0,
        level: 1,
        streak_days: 0,
        created_at: '',
        student_id: '',
        organization_id: ''
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

                // Generate QR code
                if (data.student_id) {
                    const qrText = `STUDENT-UNI-${data.student_id}`;
                    const qrDataUrl = await QRCode.toDataURL(qrText, {
                        width: 200,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    setQrCodeUrl(qrDataUrl);
                }

                // Fetch active loans
                const { data: loans } = await supabase
                    .from('book_checkouts')
                    .select(`
                        *,
                        physical_book_copies(
                            barcode,
                            copy_number,
                            books(title, author, cover_color)
                        )
                    `)
                    .eq('user_id', data.id)
                    .eq('status', 'active')
                    .order('due_date', { ascending: true });

                setActiveLoans(loans || []);
            }
        } catch (error) {
            console.error('Error fetching profile:', JSON.stringify(error, null, 2));
            if (error) {
                console.error('Error details:', error);
            }
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
            <div className="container py-6 md:py-10 px-4 md:px-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profil</h1>
                        <p className="text-sm md:text-base text-muted-foreground mt-1">Shaxsiy ma'lumotlaringizni boshqaring</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors min-h-[44px] w-full sm:w-auto"
                        >
                            <Edit2 className="w-4 h-4" />
                            Tahrirlash
                        </button>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleCancel}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors min-h-[44px]"
                            >
                                <X className="w-4 h-4" />
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 min-h-[44px]"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {/* Avatar and Basic Info */}
                        <div className="bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                                {/* Avatar */}
                                <div className="relative group mx-auto sm:mx-0">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl md:text-3xl font-bold text-white">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                    {isEditing && (
                                        <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                        </button>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 w-full">
                                    {isEditing ? (
                                        <div className="space-y-3 md:space-y-4">
                                            <div>
                                                <label className="text-xs md:text-sm font-medium mb-1 block">Ism</label>
                                                <input
                                                    type="text"
                                                    value={editedProfile.name}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm md:text-base bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none min-h-[44px]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs md:text-sm font-medium mb-1 block">Universitet</label>
                                                <input
                                                    type="text"
                                                    value={editedProfile.university || ''}
                                                    onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
                                                    className="w-full px-3 py-2 text-sm md:text-base bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none min-h-[44px]"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h2 className="text-xl md:text-2xl font-bold mb-1">{profile.name}</h2>
                                            <div className="flex items-center gap-2 text-muted-foreground mb-2 md:mb-3">
                                                <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                                <span className="text-xs md:text-sm truncate">{profile.email}</span>
                                            </div>
                                            {profile.university && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Building2 className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                                    <span className="text-xs md:text-sm">{profile.university}</span>
                                                </div>
                                            )}
                                            {profile.student_id && (
                                                <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                                    <User className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                                                    <span className="text-xs md:text-sm font-mono">ID: {profile.student_id}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border">
                                <label className="text-xs md:text-sm font-medium mb-2 block">Bio</label>
                                {isEditing ? (
                                    <textarea
                                        value={editedProfile.bio || ''}
                                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                                        rows={3}
                                        placeholder="O'zingiz haqingizda qisqacha yozing..."
                                        className="w-full px-3 py-2 text-sm md:text-base bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                                    />
                                ) : (
                                    <p className="text-sm md:text-base text-muted-foreground">
                                        {profile.bio || 'Bio qo\'shilmagan'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Active Loans */}
                        {activeLoans.length > 0 && (
                            <div className="bg-card border border-border rounded-xl md:rounded-2xl overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-border">
                                    <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        Qarzda Kitoblar ({activeLoans.length})
                                    </h3>
                                </div>
                                <div className="divide-y divide-border">
                                    {activeLoans.map((loan) => {
                                        const book = (loan.physical_book_copies as any)?.books;
                                        const copy = loan.physical_book_copies as any;
                                        const dueDate = new Date(loan.due_date);
                                        const isOverdue = dueDate < new Date();
                                        const daysRemaining = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                        return (
                                            <div key={loan.id} className="p-4 hover:bg-muted/30 transition-colors">
                                                <div className="flex gap-4">
                                                    <div className={`w-12 h-16 rounded ${book?.cover_color || 'bg-primary'} flex-shrink-0`}></div>
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
                        <div className="bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-6">
                            <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Hisob Ma'lumotlari</h3>
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
                    <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24 lg:self-start">
                        {/* QR Code Card - Moved to top */}
                        {profile.student_id && qrCodeUrl && (
                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                                <h3 className="font-bold mb-3 md:mb-4 text-sm md:text-base">Student QR Code</h3>
                                <div className="bg-white p-4 rounded-lg flex items-center justify-center">
                                    <img
                                        src={qrCodeUrl}
                                        alt="Student QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>
                                <div className="mt-3 text-center space-y-1">
                                    <p className="text-xs font-mono text-muted-foreground">
                                        ID: {profile.student_id}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Kutubxonachiga ko'rsating
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* XP Card */}
                        <div className="bg-card border border-border rounded-xl md:rounded-2xl p-4 md:p-6">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <h3 className="font-bold text-sm md:text-base">Tajriba</h3>
                                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
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
                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                            <div className="flex items-center justify-between mb-3 md:mb-4">
                                <h3 className="font-bold text-amber-600 dark:text-amber-500 text-sm md:text-base">Streak</h3>
                                <div className="text-xl md:text-2xl">🔥</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold mb-2">{profile.streak_days}</div>
                                <p className="text-xs md:text-sm text-muted-foreground">Kun ketma-ket</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
