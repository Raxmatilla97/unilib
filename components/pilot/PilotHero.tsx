"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

export function PilotHero() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/library?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-8 animate-fade-in backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span>Universitet Kutubxonlarining Kelajagi</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        Cheksiz Bilimlar <br />
                        <span className="text-primary inline-block relative">
                            Sizning Qo'lingizda
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                        O'zbekistonning barcha oliy o'quv yurtlari resurslarini birlashtiruvchi yagona raqamli platforma.
                        Ilm-fan va ta'lim uchun cheksiz imkoniyatlar.
                    </p>

                    {/* Simple Search Bar */}
                    <div className="w-full max-w-2xl mb-12 animate-slide-up delay-200 relative z-20">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl shadow-primary/5 overflow-hidden transition-all">
                                <Search className="w-6 h-6 text-muted-foreground ml-6" />
                                <input
                                    type="text"
                                    placeholder="Kitob, muallif yoki mavzuni qidiring..."
                                    className="w-full bg-transparent border-none px-4 py-5 text-lg outline-none placeholder:text-muted-foreground/70"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="m-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg"
                                >
                                    Izlash
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up delay-300">
                        <Link
                            href="/library"
                            className="group relative px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                            Katalogga O'tish
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/groups"
                            className="px-8 py-4 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
                        >
                            Guruhlarga Qo'shilish
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
