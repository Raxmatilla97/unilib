"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Star, BookOpen, Download, Quote, Share2, ArrowLeft } from 'lucide-react';
import { BookCard } from '@/components/library/BookCard';
import { BookReader } from '@/components/reader/BookReader';

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
}

interface BookDetailClientProps {
    book: Book;
    similarBooks: any[];
}

export function BookDetailClient({ book, similarBooks }: BookDetailClientProps) {
    const [showReader, setShowReader] = useState(false);

    return (
        <>
            {showReader && book.file_url && (
                <BookReader
                    fileUrl={book.file_url}
                    bookTitle={book.title}
                    onClose={() => setShowReader(false)}
                />
            )}

            <div className="container py-10 px-4 md:px-6">
                <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Kutubxonaga qaytish
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                    {/* Book Cover */}
                    <div className="md:col-span-1">
                        <div className={`aspect-[2/3] ${book.cover_color || 'bg-blue-500'} rounded-2xl shadow-2xl relative flex items-center justify-center overflow-hidden group`}>
                            {book.cover_url ? (
                                <img
                                    src={book.cover_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center text-white p-8">
                                    <h1 className="text-3xl font-bold font-serif mb-2">{book.title}</h1>
                                    <p className="text-lg opacity-90">{book.author}</p>
                                </div>
                            )}
                            {book.year && (
                                <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                                    {book.year}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Book Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                    {book.category}
                                </span>
                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                    <Star className="w-3 h-3 fill-amber-500" />
                                    {book.rating}
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight mb-2">{book.title}</h1>
                            <p className="text-xl text-muted-foreground">Muallif: {book.author}</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {book.file_url ? (
                                <>
                                    <button
                                        onClick={() => setShowReader(true)}
                                        className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25"
                                    >
                                        <BookOpen className="w-5 h-5" />
                                        O'qish
                                    </button>
                                    <a
                                        href={book.file_url}
                                        download
                                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors border border-border"
                                    >
                                        <Download className="w-5 h-5" />
                                        Yuklab olish
                                    </a>
                                </>
                            ) : (
                                <button disabled className="flex items-center gap-2 px-8 py-3 rounded-full bg-muted text-muted-foreground font-medium cursor-not-allowed">
                                    <BookOpen className="w-5 h-5" />
                                    Fayl mavjud emas
                                </button>
                            )}
                            <button className="p-3 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                                <Quote className="w-5 h-5" />
                            </button>
                            <button className="p-3 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-lg font-bold mb-2">Tavsif</h3>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {book.description || "Tavsif mavjud emas."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
                            <div>
                                <div className="text-sm text-muted-foreground">Til</div>
                                <div className="font-medium">{book.language || 'Noma\'lum'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Yil</div>
                                <div className="font-medium">{book.year || 'Noma\'lum'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Sahifalar</div>
                                <div className="font-medium">{book.pages || 'Noma\'lum'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Kategoriya</div>
                                <div className="font-medium">{book.category}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Books */}
                {similarBooks.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">O'xshash kitoblar</h2>
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
        </>
    );
}
