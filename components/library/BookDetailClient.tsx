"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Star, BookOpen, Download, Quote, Share2, ArrowLeft, Eye } from 'lucide-react';
import { BookCard } from '@/components/library/BookCard';
import { BookReviews } from '@/components/library/BookReviews';
import { supabase } from '@/lib/supabase/client';

// Lazy load BookReader component (only loads when user clicks "Read")
const BookReader = dynamic(() => import('@/components/reader/BookReader').then(mod => ({ default: mod.BookReader })), {
    loading: () => (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Kitob ochilmoqda...</p>
            </div>
        </div>
    ),
    ssr: false
});

interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    rating: number;
    cover_color: string;
    cover_url?: string;
    file_url?: string;
    description?: string;
    pages?: number;
    year?: number;
    language?: string;
    views_count?: number;
}

interface BookDetailClientProps {
    book: Book;
    similarBooks: any[];
    initialReviews: any[];
    userId?: string | null;
    isAuthenticated: boolean;
}

export function BookDetailClient({ book, similarBooks, initialReviews, userId: initialUserId, isAuthenticated: initialAuth }: BookDetailClientProps) {
    const [showReader, setShowReader] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
    const [userId, setUserId] = useState<string | null>(initialUserId || null);

    useEffect(() => {
        // Check authentication on client side
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
            setUserId(user?.id || null);
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session?.user);
            setUserId(session?.user?.id || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

            {showReader && book.file_url && (
                <BookReader
                    fileUrl={book.file_url}
                    bookTitle={book.title}
                    bookId={book.id}
                    onClose={() => setShowReader(false)}
                />
            )}

            <div className="container relative z-10 py-10 px-4 md:px-6">
                <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                    Kutubxonaga qaytish
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
                    {/* Book Cover */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <div className={`aspect-[2/3] ${book.cover_color || 'bg-blue-500'} rounded-3xl shadow-2xl relative flex items-center justify-center overflow-hidden group border border-white/10`}>
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="text-center text-white p-8">
                                    <h1 className="text-3xl font-bold font-serif mb-2">{book.title}</h1>
                                    <p className="text-lg opacity-90">{book.author}</p>
                                </div>
                            )}
                            {book.year && (
                                <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/10">
                                    {book.year}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Book Info */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                                    {book.category}
                                </span>
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{book.rating}</span>
                                </div>
                                {book.views_count !== undefined && (
                                    <div className="flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                                        <Eye className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{book.views_count} koʻrilgan</span>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                {book.title}
                            </h1>
                            <p className="text-2xl text-muted-foreground font-medium">
                                <span className="text-primary">Muallif:</span> {book.author}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {book.file_url ? (
                                <>
                                    <button
                                        onClick={() => setShowReader(true)}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        Oʻqishni Boshlash
                                    </button>
                                    <a
                                        href={book.file_url}
                                        download
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-lg hover:bg-muted/50 transition-all hover:-translate-y-1"
                                    >
                                        <Download className="w-5 h-5" />
                                        Yuklab Olish
                                    </a>
                                </>
                            ) : (
                                <button disabled className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-muted text-muted-foreground font-bold text-lg cursor-not-allowed opacity-70">
                                    <BookOpen className="w-5 h-5" />
                                    Fayl mavjud emas
                                </button>
                            )}
                            <button className="p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-muted-foreground hover:text-primary">
                                <Quote className="w-6 h-6" />
                            </button>
                            <button className="p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-muted-foreground hover:text-primary">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 rounded-full bg-primary"></span>
                                Kitob Haqida
                            </h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                                {book.description || "Tavsif mavjud emas."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Til", value: book.language || 'Noma\'lum' },
                                { label: "Yil", value: book.year || 'Noma\'lum' },
                                { label: "Sahifalar", value: book.pages || 'Noma\'lum' },
                                { label: "Kategoriya", value: book.category }
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-card border border-border/50 text-center">
                                    <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                                    <div className="font-bold text-lg">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-border/50 pt-16 mb-16">
                    <BookReviews
                        bookId={book.id}
                        reviews={initialReviews}
                        isAuthenticated={isAuthenticated}
                        userId={userId}
                    />
                </div>

                {/* Similar Books */}
                {similarBooks.length > 0 && (
                    <div className="border-t border-border/50 pt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold">Oʻxshash Kitoblar</h2>
                            <Link href={`/library?category=${book.category}`} className="text-primary font-medium hover:underline">
                                Barchasini koʻrish
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {similarBooks.map((similarBook: any) => (
                                <BookCard
                                    key={similarBook.id}
                                    id={similarBook.id}
                                    title={similarBook.title}
                                    author={similarBook.author}
                                    rating={similarBook.rating}
                                    coverColor={similarBook.cover_color || 'bg-blue-500'}
                                    category={similarBook.category}
                                    cover_url={similarBook.cover_url}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
