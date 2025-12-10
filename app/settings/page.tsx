'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RefreshCw, CheckCircle, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleHemisSync = async () => {
        if (!user?.id) return;

        setIsSyncing(true);
        const toastId = toast.loading('HEMIS ma\'lumotlari yangilanmoqda...');

        try {
            const response = await fetch('/api/hemis/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Ma\'lumotlar yangilandi!', {
                    id: toastId,
                    description: 'Profile sahifasini yangilang',
                    icon: <CheckCircle className="w-5 h-5" />
                });
                // Refresh page after 1 second
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error(data.error || 'Xatolik yuz berdi', { id: toastId });
            }
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('Xatolik yuz berdi', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'O\'CHIRISH') {
            toast.error('Tasdiqlash uchun "O\'CHIRISH" deb yozing');
            return;
        }

        if (!user?.id) return;

        setIsDeleting(true);
        const toastId = toast.loading('Akkount o\'chirilmoqda...');

        try {
            // Delete profile first
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Delete auth user
            const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

            if (authError) {
                // If admin delete fails, try regular signOut
                await supabase.auth.signOut();
            }

            toast.success('Akkount o\'chirildi', {
                id: toastId,
                description: 'Xayr!'
            });

            // Logout and redirect
            setTimeout(() => {
                logout();
            }, 1000);
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'Xatolik yuz berdi', { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!mounted) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-background py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 bg-muted rounded w-1/3" />
                            <div className="h-64 bg-muted rounded" />
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Sozlamalar</h1>
                        <p className="text-muted-foreground">
                            Hisob sozlamalari va ma'lumotlarni boshqarish
                        </p>
                    </div>

                    {/* HEMIS Sync Section */}
                    <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2">HEMIS Ma'lumotlarini Yangilash</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    HEMIS tizimidan eng so'nggi ma'lumotlaringizni oling (fakultet, guruh, kurs, GPA va boshqalar)
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Bu jarayon bir necha soniya davom etishi mumkin</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleHemisSync}
                            disabled={isSyncing}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                        >
                            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Yangilanmoqda...' : 'HEMIS\'dan Yangilash'}
                        </button>
                    </div>

                    {/* Delete Account Section */}
                    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2 text-red-600 dark:text-red-400">Xavfli Hudud</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Akkauntni o'chirish qaytarib bo'lmaydigan amaldir. Barcha ma'lumotlaringiz o'chiriladi.
                                </p>
                            </div>
                        </div>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium rounded-xl transition-all duration-200"
                            >
                                <Trash2 className="w-5 h-5" />
                                Akkauntni O'chirish
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                                        <strong>Diqqat!</strong> Bu amalni tasdiqlash uchun quyidagi matnni kiriting:
                                    </p>
                                    <p className="text-sm font-mono font-bold text-red-600 dark:text-red-400 mb-3">
                                        O'CHIRISH
                                    </p>
                                    <input
                                        type="text"
                                        value={deleteConfirmText}
                                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                                        placeholder="O'CHIRISH deb yozing"
                                        className="w-full px-4 py-3 bg-background border border-red-500/30 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all outline-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(false);
                                            setDeleteConfirmText('');
                                        }}
                                        className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-xl transition-all duration-200"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={isDeleting || deleteConfirmText !== 'O\'CHIRISH'}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        {isDeleting ? 'O\'chirilmoqda...' : 'Akkauntni O\'chirish'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>Eslatma:</strong> HEMIS ma'lumotlarini yangilash uchun HEMIS tizimida ro'yxatdan o'tgan bo'lishingiz kerak.
                        </p>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
