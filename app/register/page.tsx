"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Mail, Lock, User, Building, ArrowRight, Sparkles, Check, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Password strength calculator
function calculatePasswordStrength(password: string): { strength: number; text: string; color: string } {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
        { strength: 0, text: 'Juda zaif', color: 'bg-red-500' },
        { strength: 1, text: 'Zaif', color: 'bg-orange-500' },
        { strength: 2, text: 'O\'rtacha', color: 'bg-yellow-500' },
        { strength: 3, text: 'Yaxshi', color: 'bg-blue-500' },
        { strength: 4, text: 'Kuchli', color: 'bg-green-500' },
        { strength: 5, text: 'Juda kuchli', color: 'bg-emerald-500' },
    ];

    return levels[strength];
}

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        university: ''
    });
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect when user is authenticated
    useEffect(() => {
        if (user && !authLoading) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    // ✅ Memoized password strength
    const passwordStrength = useMemo(() => {
        if (!formData.password) return { strength: 0, text: '', color: '' };
        return calculatePasswordStrength(formData.password);
    }, [formData.password]);

    // ✅ Real-time validation
    const validateField = useCallback((name: string, value: string) => {
        const errors: Record<string, string> = {};

        switch (name) {
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errors.email = 'Email formati noto\'g\'ri';
                }
                break;
            case 'password':
                if (value && value.length < 6) {
                    errors.password = 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak';
                }
                break;
            case 'confirmPassword':
                if (value && value !== formData.password) {
                    errors.confirmPassword = 'Parollar mos kelmayapti';
                }
                break;
        }

        setFieldErrors(prev => ({ ...prev, ...errors, [name]: errors[name] || '' }));
    }, [formData.password]);

    // ✅ Memoized submit handler
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Parollar mos kelmayapti');
            return;
        }

        if (formData.password.length < 6) {
            setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
            return;
        }

        if (!agreedToTerms) {
            setError('Foydalanish shartlarini qabul qilishingiz kerak');
            return;
        }

        setIsLoading(true);

        try {
            const result = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.university
            );

            if (!result.success) {
                if (result.error?.includes('User already registered')) {
                    setError('Bu email bilan allaqachon ro\'yxatdan o\'tilgan');
                } else {
                    setError(result.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
                }
                setIsLoading(false);
            } else {
                // ✅ Success feedback
                toast.success('Muvaffaqiyatli!', {
                    description: 'Hisobingiz yaratildi. Dashboard\'ga yo\'naltirilmoqda...',
                    icon: <CheckCircle className="w-5 h-5" />
                });
                // Don't set isLoading to false - useEffect will redirect
            }
        } catch (err) {
            setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
            setIsLoading(false);
        }
    }, [formData, agreedToTerms, register]);

    // ✅ Memoized change handler
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    }, [validateField]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.15] text-primary"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />

            <div className="w-full max-w-md relative z-10">

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8 backdrop-blur-sm">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>Yangi hisob yaratish</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Ro'yxatdan o'tish</h1>
                        <p className="text-muted-foreground">Bilimlar olamiga qo'shiling</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                                To'liq ism
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    aria-label="To'liq ism"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground placeholder:text-muted-foreground"
                                    placeholder="Ism Familiya"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    aria-label="Email manzil"
                                    aria-invalid={!!fieldErrors.email}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border transition-all outline-none text-foreground placeholder:text-muted-foreground ${fieldErrors.email ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary focus:bg-background'
                                        }`}
                                    placeholder="sizning@email.uz"
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {fieldErrors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="university" className="block text-sm font-medium text-foreground mb-2">
                                Universitet (ixtiyoriy)
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="university"
                                    name="university"
                                    type="text"
                                    value={formData.university}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground placeholder:text-muted-foreground"
                                    placeholder="Toshkent Davlat Universiteti"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                Parol
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    aria-label="Parol"
                                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                                    placeholder="Kamida 6 ta belgi"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* ✅ Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.strength >= level
                                                    ? passwordStrength.color
                                                    : 'bg-muted'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Parol kuchi: <span className="font-semibold">{passwordStrength.text}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                                Parolni tasdiqlang
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    aria-label="Parolni tasdiqlang"
                                    aria-invalid={!!fieldErrors.confirmPassword}
                                    className={`w-full pl-11 pr-11 py-3 rounded-xl bg-muted/50 border transition-all outline-none text-foreground ${fieldErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary focus:bg-background'
                                        }`}
                                    placeholder="Parolni qayta kiriting"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {fieldErrors.confirmPassword}
                                </p>
                            )}
                            {formData.confirmPassword && !fieldErrors.confirmPassword && formData.password === formData.confirmPassword && (
                                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    Parollar mos keladi
                                </p>
                            )}
                        </div>

                        <div className="flex items-start gap-3 pt-2">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                />
                            </div>
                            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                                Men{' '}
                                <Link href="#" className="text-primary hover:underline">
                                    Foydalanish shartlari
                                </Link>
                                {' '}va{' '}
                                <Link href="#" className="text-primary hover:underline">
                                    Maxfiylik siyosati
                                </Link>
                                ni o'qib chiqdim va roziman
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                    Yuklanmoqda...
                                </>
                            ) : (
                                <>
                                    Ro'yxatdan o'tish
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Allaqachon hisobingiz bormi?{' '}
                            <Link href="/login" className="text-primary font-semibold hover:underline">
                                Tizimga kiring
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        ← Bosh sahifaga qaytish
                    </Link>
                </div>
            </div>
        </div>
    );
}
