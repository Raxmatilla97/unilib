"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    BookOpen,
    Edit,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    rating: number;
    cover_color: string;
    cover_url?: string;
    created_at: string;
}

interface BooksTableProps {
    books: Book[];
    page: number;
    totalPages: number;
    totalBooks: number;
}

export function BooksTable({ books: initialBooks, page, totalPages, totalBooks }: BooksTableProps) {
    const [books, setBooks] = useState(initialBooks);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        setBooks(initialBooks);
    }, [initialBooks]);

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Bu kitobni o\'chirishga ishonchingiz komilmi?')) return;

        setIsLoading(id);
        try {
            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setBooks(books.filter(book => book.id !== id));

            // Refresh to get updated data
            router.refresh();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Kitobni o\'chirishda xatolik yuz berdi');
        } finally {
            setIsLoading(null);
        }
    }, [books, router]);

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        router.push(`/admin/books?page=${newPage}`);
    }, [totalPages, router]);

    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="text-left p-4 font-semibold">Kitob</th>
                            <th className="text-left p-4 font-semibold">Muallif</th>
                            <th className="text-left p-4 font-semibold">Kategoriya</th>
                            <th className="text-left p-4 font-semibold">Reyting</th>
                            <th className="text-right p-4 font-semibold">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                    Kitoblar topilmadi
                                </td>
                            </tr>
                        ) : (
                            books.map((book) => (
                                <tr key={book.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-14 rounded ${book.cover_color} flex items-center justify-center text-white shadow-sm overflow-hidden relative`}>
                                                {book.cover_url ? (
                                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <BookOpen className="w-5 h-5" />
                                                )}
                                            </div>
                                            <span className="font-medium">{book.title}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-muted-foreground">{book.author}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                                            {book.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-semibold">{book.rating}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/books/${book.id}`}
                                                className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors"
                                                title="Tahrirlash"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                disabled={isLoading === book.id}
                                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                title="o'chirish"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {books.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                        Kitoblar topilmadi
                    </div>
                ) : (
                    books.map((book) => (
                        <div key={book.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                            {/* Book Info */}
                            <div className="flex items-start gap-3">
                                <div className={`w-16 h-20 rounded ${book.cover_color} flex items-center justify-center text-white shadow-sm overflow-hidden relative flex-shrink-0`}>
                                    {book.cover_url ? (
                                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <BookOpen className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base line-clamp-2">{book.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                            {book.category}
                                        </span>
                                        <span className="text-sm font-semibold">★ {book.rating}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-border">
                                <Link
                                    href={`/admin/books/${book.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors font-medium text-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                    Tahrirlash
                                </Link>
                                <button
                                    onClick={() => handleDelete(book.id)}
                                    disabled={isLoading === book.id}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Oʻchirish
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border border-border rounded-xl bg-card flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Jami: <span className="font-medium text-foreground">{totalBooks}</span> ta
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px]"
                    >
                        Oldingi
                    </button>
                    <span className="text-sm font-medium whitespace-nowrap">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px]"
                    >
                        Keyingi
                    </button>
                </div>
            </div>
        </div>
    );
}
