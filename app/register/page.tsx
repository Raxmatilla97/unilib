"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Mail, Lock, User, Building, ArrowRight, Sparkles, Check } from 'lucide-react';

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
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
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
            const success = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.university
            );
            if (success) {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.15] text-primary"
                style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <span className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">UniLib</span>
                </Link>

                {/* Card */}
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>Yangi hisob yaratish</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Ro'yxatdan o'tish</h1>
                        <p className="text-muted-foreground">Bilimlar olamiga qo'shiling</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                            {error}
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
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground placeholder:text-muted-foreground"
                                    placeholder="sizning@email.uz"
                                />
                            </div>
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
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                                    placeholder="Kamida 6 ta belgi"
                                />
                            </div>
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
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground"
                                    placeholder="Parolni qayta kiriting"
                                />
                            </div>
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
