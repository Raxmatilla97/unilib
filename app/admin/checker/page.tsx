"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Scan, User, BookOpen, Calendar, Check, X, AlertCircle, RotateCcw, TrendingUp, TrendingDown, Award, Flame } from 'lucide-react';
import { awardXP } from './actions';

export default function CheckerPage() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [scanInput, setScanInput] = useState('');
    const [student, setStudent] = useState<any>(null);
    const [scannedBook, setScannedBook] = useState<any>(null);
    const [activeLoans, setActiveLoans] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [todayStats, setTodayStats] = useState({ checkouts: 0, returns: 0 });

    useEffect(() => {
        fetchTodayStats();
    }, []);

    const fetchTodayStats = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        const [checkoutsRes, returnsRes] = await Promise.all([
            supabase.from('book_checkouts').select('*', { count: 'exact', head: true }).gte('checked_out_at', todayISO),
            supabase.from('book_checkouts').select('*', { count: 'exact', head: true }).gte('returned_at', todayISO).eq('status', 'returned')
        ]);

        setTodayStats({
            checkouts: checkoutsRes.count || 0,
            returns: returnsRes.count || 0
        });
    };

    useEffect(() => {
        inputRef.current?.focus();
    }, [student, scannedBook]);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
        inputRef.current?.focus();
        fetchTodayStats();
    };

    const resetAll = () => {
        setStudent(null);
        setScannedBook(null);
        setActiveLoans([]);
        setError('');
        setSuccessMessage('');
        setScanInput('');
        inputRef.current?.focus();
    };

    const handleScan = async () => {
        if (!scanInput.trim()) return;
        setLoading(true);
        setError('');

        try {
            const isBookBarcode = scanInput.startsWith('BOOK-') || scanInput.startsWith('978-');

            if (!isBookBarcode) {
                const studentId = scanInput.replace('STUDENT-UNI-', '').trim();
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('student_id', studentId)
                    .single();

                if (profileError || !profile) {
                    setError('Talaba topilmadi');
                    setLoading(false);
                    setScanInput('');
                    return;
                }

                setStudent(profile);

                const { data: loans } = await supabase
                    .from('book_checkouts')
                    .select(`*, physical_book_copies(barcode, copy_number, books(title, author, cover_color))`)
                    .eq('user_id', profile.id)
                    .eq('status', 'active')
                    .order('due_date', { ascending: true });

                setActiveLoans(loans || []);
            } else {
                if (!student) {
                    setError('Avval talabani skanerlang');
                    setLoading(false);
                    setScanInput('');
                    return;
                }

                const hasOverdue = activeLoans.some(loan => new Date(loan.due_date) < new Date());
                if (hasOverdue) {
                    setError('Talabada muddati o\'tgan kitoblar bor!');
                    setLoading(false);
                    setScanInput('');
                    return;
                }

                if (activeLoans.length >= 5) {
                    setError('Maksimal 5 ta kitob!');
                    setLoading(false);
                    setScanInput('');
                    return;
                }

                const { data: copy, error: copyError } = await supabase
                    .from('physical_book_copies')
                    .select(`*, books(*)`)
                    .eq('barcode', scanInput)
                    .single();

                if (copyError || !copy) {
                    setError('Kitob topilmadi');
                    setLoading(false);
                    setScanInput('');
                    return;
                }

                if (copy.status !== 'available') {
                    setError(`Kitob mavjud emas`);
                    setLoading(false);
                    setScanInput('');
                    return;
                }

                setScannedBook(copy);
            }

            setScanInput('');
        } catch (err) {
            console.error('Scan error:', err);
            setError('Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!student || !scannedBook) return;
        setLoading(true);
        setError('');

        try {
            // Get current librarian
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Librarian topilmadi');
                setLoading(false);
                return;
            }

            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);

            console.log('Creating checkout for:', {
                user_id: student.id,
                physical_copy_id: scannedBook.id,
                librarian_id: user.id,
                organization_id: student.organization_id,
                due_date: dueDate.toISOString()
            });

            const { data: checkoutData, error: checkoutError } = await supabase
                .from('book_checkouts')
                .insert({
                    user_id: student.id,
                    physical_copy_id: scannedBook.id,
                    librarian_id: user.id,
                    organization_id: student.organization_id,
                    due_date: dueDate.toISOString(),
                    status: 'active'
                })
                .select();

            if (checkoutError) {
                console.error('Checkout error:', checkoutError);
                setError(`Qarz yaratishda xatolik: ${checkoutError.message}`);
                setLoading(false);
                return;
            }

            console.log('Checkout created:', checkoutData);

            const { error: updateError } = await supabase
                .from('physical_book_copies')
                .update({ status: 'borrowed' })
                .eq('id', scannedBook.id);

            if (updateError) {
                console.error('Update error:', updateError);
                setError(`Kitob statusini yangilashda xatolik: ${updateError.message}`);
                setLoading(false);
                return;
            }

            showSuccess(`✅ Kitob berildi: ${scannedBook.books.title}`);
            setScannedBook(null);

            // Refresh active loans
            const { data: loans } = await supabase
                .from('book_checkouts')
                .select(`*, physical_book_copies(barcode, copy_number, books(title, author, cover_color))`)
                .eq('user_id', student.id)
                .eq('status', 'active')
                .order('due_date', { ascending: true });

            setActiveLoans(loans || []);
        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(`Xatolik: ${err.message || 'Noma\'lum xatolik'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (copyId: string) => {
        setLoading(true);
        setError('');

        try {
            const loan = activeLoans.find(l => l.physical_copy_id === copyId);
            if (!loan) return;

            const isOnTime = new Date(loan.due_date) >= new Date();

            const { error: returnError } = await supabase
                .from('book_checkouts')
                .update({
                    status: 'returned',
                    returned_at: new Date().toISOString()
                })
                .eq('physical_copy_id', copyId)
                .eq('status', 'active');

            if (returnError) {
                console.error('Return error:', returnError);
                setError(`Qaytarishda xatolik: ${returnError.message}`);
                setLoading(false);
                return;
            }

            const { error: updateError } = await supabase
                .from('physical_book_copies')
                .update({ status: 'available' })
                .eq('id', copyId);

            if (updateError) {
                console.error('Update error:', updateError);
            }

            // Award XP for on-time return
            if (isOnTime && student) {
                console.log('Awarding XP to student:', student.id);

                const result = await awardXP(student.id, 50);

                if (result.success) {
                    console.log('XP awarded successfully! New XP:', result.newXP);
                    setStudent({ ...student, xp: result.newXP });
                } else {
                    console.error('XP award failed:', result.error);
                }
            }

            showSuccess(`✅ Kitob qaytarildi${isOnTime ? ' (+50 XP)' : ''}`);
            setActiveLoans(activeLoans.filter(l => l.physical_copy_id !== copyId));
        } catch (err: any) {
            console.error('Return error:', err);
            setError(`Xatolik: ${err.message || 'Noma\'lum xatolik'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Kitob Berish/Qaytarish</h1>
                    <p className="text-muted-foreground">Talaba va kitoblarni boshqarish</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">Berildi</p>
                                <p className="text-lg font-bold text-green-600">{todayStats.checkouts}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/20 rounded-lg px-4 py-2">
                        <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">Qaytarildi</p>
                                <p className="text-lg font-bold text-blue-600">{todayStats.returns}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-500/10 border-2 border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                    <Check className="w-6 h-6 text-green-600" />
                    <p className="font-medium text-green-700 dark:text-green-400">{successMessage}</p>
                </div>
            )}

            {/* 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN - Student Check & Book Operations */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Student Scanner */}
                    <div className="bg-card border-2 border-border rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Talaba Aniqlash
                        </h3>
                        <div className="flex gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                                placeholder="Student QR skanerlang..."
                                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                                disabled={!!student}
                            />
                            {student ? (
                                <button
                                    onClick={resetAll}
                                    className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg flex items-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleScan}
                                    disabled={loading || !scanInput.trim()}
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Scan className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        {error && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Book Operations */}
                    {student && (
                        <div className="bg-card border-2 border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                Kitob Berish / Qaytarish
                            </h3>

                            {/* Book Scanner */}
                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                                    placeholder="Kitob barcode skanerlang..."
                                    className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none font-mono"
                                />
                                <button
                                    onClick={handleScan}
                                    disabled={loading || !scanInput.trim()}
                                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Scan className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scanned Book - Checkout */}
                            {scannedBook && (
                                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-bold text-lg">{scannedBook.books.title}</h4>
                                            <p className="text-sm text-muted-foreground">{scannedBook.books.author} • Nusxa #{scannedBook.copy_number}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold"
                                    >
                                        BERISH
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN - Student Info */}
                {student && (
                    <div className="space-y-4">
                        {/* Student Card */}
                        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{student.name}</h3>
                                    <p className="text-sm text-muted-foreground font-mono">{student.student_id}</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-card rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Award className="w-4 h-4 text-orange-600" />
                                        <p className="text-xs text-muted-foreground">XP</p>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600">{student.xp || 0}</p>
                                </div>
                                <div className="bg-card rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Flame className="w-4 h-4 text-red-600" />
                                        <p className="text-xs text-muted-foreground">Streak</p>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600">{student.streak || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Active Loans */}
                        <div className="bg-card border-2 border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Qarzda ({activeLoans.length})</h3>
                            {activeLoans.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">Qarzda kitob yo'q</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeLoans.map((loan) => {
                                        const isOverdue = new Date(loan.due_date) < new Date();
                                        const daysLeft = Math.ceil((new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                        return (
                                            <div key={loan.id} className={`p-3 rounded-lg border ${isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-muted/30 border-border'}`}>
                                                <h4 className="font-bold text-sm mb-1">{loan.physical_book_copies.books.title}</h4>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {isOverdue ? '⚠️ Muddati o\'tgan!' : `${daysLeft} kun qoldi`}
                                                </p>
                                                <button
                                                    onClick={() => handleReturn(loan.physical_copy_id)}
                                                    disabled={loading}
                                                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                                                >
                                                    Qaytarish
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
