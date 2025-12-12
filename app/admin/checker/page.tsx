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
            const isBookBarcode = scanInput.startsWith('BOOK-') || scanInput.startsWith('978-') || /^\d{13}$/.test(scanInput);

            if (!isBookBarcode) {
                // Clean input - remove any prefix and trim
                const studentNumber = scanInput.replace('STUDENT-UNI-', '').trim();
                console.log('🔍 Searching for student_number:', studentNumber);

                // Single optimized query - search both fields at once
                const startTime = performance.now();
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .or(`student_number.eq.${studentNumber},student_id.eq.${studentNumber}`)
                    .limit(1);

                const profileTime = performance.now() - startTime;
                console.log(`⏱️ Profile query took: ${profileTime.toFixed(2)}ms`);

                console.log('📊 Search result:', { profiles, profileError, count: profiles?.length });

                if (profileError) {
                    console.error('❌ Search error:', profileError);
                }

                if (profileError || !profiles || profiles.length === 0) {
                    setError(`Talaba topilmadi: ${studentNumber}`);
                    setLoading(false);
                    setScanInput('');
                    return;
                }

                const profile = profiles[0];
                console.log('✅ Student found:', profile.name, profile.student_number);
                setStudent(profile);

                // Fetch loans
                const loansStartTime = performance.now();
                const { data: loans } = await supabase
                    .from('book_checkouts')
                    .select(`*, physical_book_copies(barcode, copy_number, books(title, author, cover_color))`)
                    .eq('user_id', profile.id)
                    .eq('status', 'active')
                    .order('due_date', { ascending: true });

                const loansTime = performance.now() - loansStartTime;
                console.log(`⏱️ Loans query took: ${loansTime.toFixed(2)}ms`);

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
                    <div className="relative bg-gradient-to-br from-card via-card to-primary/5 border-2 border-border rounded-xl p-6 overflow-hidden">
                        {/* Animated background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse opacity-50" />

                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                Talaba Aniqlash
                            </h3>
                            <div className="flex gap-3">
                                <div className="flex-1 relative group">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                                        placeholder="Student QR skanerlang..."
                                        className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border-2 border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none font-mono transition-all group-hover:border-primary/30"
                                        disabled={!!student}
                                    />
                                    {/* Scan line animation */}
                                    {loading && (
                                        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                                            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
                                        </div>
                                    )}
                                </div>
                                {student ? (
                                    <button
                                        onClick={resetAll}
                                        className="px-6 py-3 bg-gradient-to-br from-muted to-muted/80 hover:from-muted/90 hover:to-muted/70 rounded-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleScan}
                                        disabled={loading || !scanInput.trim()}
                                        className="px-6 py-3 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20"
                                    >
                                        <Scan className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            {error && (
                                <div className="mt-3 p-3 bg-red-500/10 backdrop-blur-sm border-2 border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <AlertCircle className="w-5 h-5 animate-pulse" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Book Operations */}
                    {student && (
                        <div className="relative bg-gradient-to-br from-card via-card to-accent/5 border-2 border-border rounded-xl p-6 overflow-hidden">
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5 animate-pulse opacity-30" />

                            <div className="relative z-10">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-accent/10 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-accent" />
                                    </div>
                                    Kitob Berish / Qaytarish
                                </h3>

                                {/* Book Scanner */}
                                <div className="flex gap-3 mb-4">
                                    <div className="flex-1 relative group">
                                        <input
                                            type="text"
                                            value={scanInput}
                                            onChange={(e) => setScanInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                                            placeholder="Kitob barcode skanerlang..."
                                            className="w-full px-4 py-3 bg-background/50 backdrop-blur-sm border-2 border-border rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none font-mono transition-all group-hover:border-accent/30"
                                        />
                                        {loading && (
                                            <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                                                <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-accent to-transparent animate-scan" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleScan}
                                        disabled={loading || !scanInput.trim()}
                                        className="px-6 py-3 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-lg hover:from-accent/90 hover:to-accent/70 disabled:opacity-50 transition-all hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-accent/20"
                                    >
                                        <Scan className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Scanned Book - Checkout */}
                                {scannedBook && (
                                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm border-2 border-green-500/30 rounded-xl p-5 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xl mb-1">{scannedBook.books.title}</h4>
                                                <p className="text-sm text-muted-foreground">{scannedBook.books.author} • Nusxa #{scannedBook.copy_number}</p>
                                            </div>
                                            <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                                                <BookOpen className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            disabled={loading}
                                            className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40"
                                        >
                                            ✓ BERISH
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN - Student Info */}
                {student && (
                    <div className="space-y-4">
                        {/* Student Card - Glassmorphism */}
                        <div className="relative bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 backdrop-blur-xl border-2 border-primary/30 rounded-2xl p-6 overflow-hidden shadow-2xl shadow-primary/10">
                            {/* Animated background orbs */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        {student.avatar_url ? (
                                            <img
                                                src={student.avatar_url}
                                                alt={student.name}
                                                className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-primary/20"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                                                <User className="w-10 h-10 text-white" />
                                            </div>
                                        )}
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{student.name}</h3>
                                        <p className="text-sm text-muted-foreground font-mono mt-1">{student.student_number || student.student_id}</p>
                                        {student.phone && (
                                            <p className="text-xs text-muted-foreground mt-1">📱 {student.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Student Info */}
                                {(student.faculty || student.student_group || student.course) && (
                                    <div className="mb-6 p-4 bg-card/30 backdrop-blur-sm rounded-xl border border-border/30">
                                        <div className="space-y-2 text-sm">
                                            {student.faculty && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-muted-foreground min-w-[80px]">Fakultet:</span>
                                                    <span className="font-medium">{student.faculty}</span>
                                                </div>
                                            )}
                                            {student.student_group && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-muted-foreground min-w-[80px]">Guruh:</span>
                                                    <span className="font-medium">{student.student_group}</span>
                                                </div>
                                            )}
                                            {student.course && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-muted-foreground min-w-[80px]">Kurs:</span>
                                                    <span className="font-medium">{student.course}</span>
                                                </div>
                                            )}
                                            {student.education_form && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-muted-foreground min-w-[80px]">Ta'lim:</span>
                                                    <span className="font-medium">{student.education_form}</span>
                                                </div>
                                            )}
                                            {student.specialty && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-muted-foreground min-w-[80px]">Mutaxassis:</span>
                                                    <span className="font-medium">{student.specialty}</span>
                                                </div>
                                            )}
                                            {student.gpa && (
                                                <div className="flex items-start gap-2">
                                                    <span className="text-muted-foreground min-w-[80px]">GPA:</span>
                                                    <span className="font-bold text-primary">{student.gpa}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* XP Progress Bar */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-muted-foreground">Experience</span>
                                        <span className="text-xs font-bold text-orange-600">{student.xp || 0} XP</span>
                                    </div>
                                    <div className="h-3 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-orange-500/50"
                                            style={{ width: `${Math.min(((student.xp || 0) % 1000) / 10, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Level {Math.floor((student.xp || 0) / 1000) + 1}</p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-orange-500/10 rounded-lg">
                                                <Award className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Total XP</p>
                                        </div>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{student.xp || 0}</p>
                                    </div>
                                    <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-red-500/10 rounded-lg">
                                                <Flame className={`w-4 h-4 text-red-600 ${(student.streak || 0) > 0 ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Streak</p>
                                        </div>
                                        <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">{student.streak || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Loans */}
                        <div className="bg-card/50 backdrop-blur-sm border-2 border-border rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                                <span>Qarzda Kitoblar</span>
                                <span className="text-sm font-normal px-3 py-1 bg-primary/10 text-primary rounded-full">{activeLoans.length}</span>
                            </h3>
                            {activeLoans.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                                        <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="text-muted-foreground">Qarzda kitob yo'q</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activeLoans.map((loan) => {
                                        const isOverdue = new Date(loan.due_date) < new Date();
                                        const daysLeft = Math.ceil((new Date(loan.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                                        const urgencyColor = isOverdue
                                            ? 'from-red-500/20 to-red-600/10 border-red-500/30'
                                            : daysLeft <= 3
                                                ? 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30'
                                                : 'from-blue-500/20 to-blue-600/10 border-blue-500/30';

                                        return (
                                            <div key={loan.id} className={`relative bg-gradient-to-br ${urgencyColor} backdrop-blur-sm border-2 rounded-xl p-4 overflow-hidden transition-all hover:scale-[1.02]`}>
                                                {/* Progress indicator */}
                                                <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" style={{ width: `${Math.max(0, Math.min(100, (daysLeft / 14) * 100))}%` }} />

                                                <div className="relative">
                                                    <h4 className="font-bold text-sm mb-1 pr-12">{loan.physical_book_copies.books.title}</h4>
                                                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        {isOverdue ? (
                                                            <span className="text-red-600 font-medium">⚠️ {Math.abs(daysLeft)} kun kechikkan!</span>
                                                        ) : (
                                                            <span className={daysLeft <= 3 ? 'text-yellow-600 font-medium' : ''}>{daysLeft} kun qoldi</span>
                                                        )}
                                                    </p>
                                                    <button
                                                        onClick={() => handleReturn(loan.physical_copy_id)}
                                                        disabled={loading}
                                                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
                                                    >
                                                        ✓ Qaytarish
                                                    </button>
                                                </div>
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
