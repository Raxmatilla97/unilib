"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [useHemisLogin, setUseHemisLogin] = useState(false);
    const [hemisLogin, setHemisLogin] = useState('');
    const [hemisPassword, setHemisPassword] = useState('');
    const { login, user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect when user is authenticated
    useEffect(() => {
        if (user && !authLoading) {
            router.push('/dashboard');
        }
    }, [user, authLoading, router]);

    // Email/Password login handler
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.error || 'Email yoki parol noto\'g\'ri');
                setIsLoading(false);
            } else {
                toast.success('Muvaffaqiyatli!', {
                    description: 'Tizimga kirildi. Dashboard\'ga yo\'naltirilmoqda...',
                    icon: <CheckCircle className="w-5 h-5" />
                });
            }
        } catch (err) {
            setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
            setIsLoading(false);
        }
    }, [email, password, login]);

    // HEMIS login handler
    const handleHemisLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/hemis-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: hemisLogin, password: hemisPassword }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error || 'HEMIS login xatosi');
                setIsLoading(false);
            } else {
                // Use returned credentials to login via Supabase
                if (data.data.email && data.data.password) {
                    const loginResult = await login(data.data.email, data.data.password);
                    if (!loginResult.success) {
                        setError('Login xatosi');
                        setIsLoading(false);
                    } else {
                        toast.success('Muvaffaqiyatli!', {
                            description: 'HEMIS orqali kirildi. Dashboard\'ga yo\'naltirilmoqda...',
                            icon: <CheckCircle className="w-5 h-5" />
                        });

                        // Background sync (non-blocking)
                        if (user?.id) {
                            fetch('/api/hemis/background-sync', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user.id }),
                            }).catch(err => console.log('Background sync failed:', err));
                        }
                    }
                } else {
                    toast.success('Muvaffaqiyatli!', {
                        description: 'HEMIS orqali kirildi. Dashboard\'ga yo\'naltirilmoqda...',
                        icon: <CheckCircle className="w-5 h-5" />
                    });
                }
            }
        } catch (err) {
            setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
            setIsLoading(false);
        }
    }, [hemisLogin, hemisPassword, login]);

    // Direct database login (bypass HEMIS for existing users)
    const handleDbLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/db-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: hemisLogin }),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.error || 'Foydalanuvchi topilmadi');
                setIsLoading(false);
            } else {
                // Login with database credentials
                const loginResult = await login(data.data.email, data.data.password);
                if (!loginResult.success) {
                    setError('Login xatosi');
                    setIsLoading(false);
                } else {
                    toast.success('Muvaffaqiyatli!', {
                        description: 'Bazadagi ma\'lumotlar bilan kirildi',
                        icon: <CheckCircle className="w-5 h-5" />
                    });
                }
            }
        } catch (err) {
            setError('Xatolik yuz berdi');
            setIsLoading(false);
        }
    }, [hemisLogin, login]);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

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
                            <span>Xush kelibsiz</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Tizimga kirish</h1>
                        <p className="text-muted-foreground">
                            {useHemisLogin ? 'HEMIS login va parolingizni kiriting' : 'Hisobingizga kiring va o\'qishni davom ettiring'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start gap-2">
                            <span className="text-lg">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={useHemisLogin ? handleHemisLogin : handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="login-input" className="block text-sm font-medium text-foreground mb-2">
                                {useHemisLogin ? 'HEMIS Login' : 'Email'}
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${(useHemisLogin ? hemisLogin : emailFocused) ? 'text-primary' : 'text-muted-foreground'
                                    }`} />
                                <input
                                    id="login-input"
                                    type={useHemisLogin ? 'text' : 'email'}
                                    value={useHemisLogin ? hemisLogin : email}
                                    onChange={(e) => useHemisLogin ? setHemisLogin(e.target.value) : setEmail(e.target.value)}
                                    onFocus={() => !useHemisLogin && setEmailFocused(true)}
                                    onBlur={() => !useHemisLogin && setEmailFocused(false)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                                    placeholder={useHemisLogin ? 'HEMIS login' : 'email@example.com'}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password-input" className="block text-sm font-medium text-foreground mb-2">
                                Parol
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${(useHemisLogin ? hemisPassword : passwordFocused) ? 'text-primary' : 'text-muted-foreground'
                                    }`} />
                                <input
                                    id="password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={useHemisLogin ? hemisPassword : password}
                                    onChange={(e) => useHemisLogin ? setHemisPassword(e.target.value) : setPassword(e.target.value)}
                                    onFocus={() => !useHemisLogin && setPasswordFocused(true)}
                                    onBlur={() => !useHemisLogin && setPasswordFocused(false)}
                                    required
                                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {!useHemisLogin && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="text-sm text-muted-foreground">Eslab qolish</span>
                                </label>
                                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                                    Parolni unutdingizmi?
                                </Link>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                    Yuklanmoqda...
                                </>
                            ) : (
                                <>
                                    Kirish
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-card text-muted-foreground">yoki</span>
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setUseHemisLogin(!useHemisLogin)}
                        className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                    >
                        {useHemisLogin ? 'Email bilan kirish' : 'HEMIS orqali kirish'}
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Hisobingiz yo'qmi?{' '}
                            <Link href="/register" className="text-primary font-semibold hover:underline">
                                Ro'yxatdan o'ting
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
