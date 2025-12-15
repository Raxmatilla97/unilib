"use client";

import { useMemo } from 'react';
import useSWR from 'swr';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OfflineBooksClientProps {
    initialBooks: any[];
    initialTotalBooks: number;
    initialTotalPages: number;
    initialCategories: string[];
    currentPage: number;
}

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
};

export function OfflineBooksClient({
    initialBooks,
    initialTotalBooks,
    initialTotalPages,
    initialCategories,
    currentPage
}: OfflineBooksClientProps) {
    const searchParams = useSearchParams();

    // Build query string from search params
    const queryString = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());

        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const sort = searchParams.get('sort');

        if (search) params.set('search', search);
        if (category) params.set('category', category);
        if (status) params.set('status', status);
        if (sort) params.set('sort', sort);

        return params.toString();
    }, [searchParams, currentPage]);

    // Use SWR for client-side caching
    const { data, isLoading } = useSWR(
        `/api/admin/books/offline?${queryString}`,
        fetcher,
        {
            fallbackData: {
                books: initialBooks,
                totalBooks: initialTotalBooks,
                totalPages: initialTotalPages,
                categories: initialCategories
            },
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    const { books = initialBooks, totalBooks = initialTotalBooks } = data || {};

    return (
        <>
            {/* Books List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Package className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold mb-2">Offline kitoblar yoʻq</h3>
                        <p className="text-muted-foreground mb-6">
                            Birinchi offline kitobni qoʻshing
                        </p>
                        <Link
                            href="/admin/books/offline/create"
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Kitob Qoʻshish
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="text-left p-4 font-semibold">Kitob</th>
                                        <th className="text-left p-4 font-semibold">Muallif</th>
                                        <th className="text-left p-4 font-semibold">Kategoriya</th>
                                        <th className="text-center p-4 font-semibold">Jami Nusxalar</th>
                                        <th className="text-center p-4 font-semibold">Mavjud</th>
                                        <th className="text-center p-4 font-semibold">Qarzda</th>
                                        <th className="text-right p-4 font-semibold">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {books.map((book: any) => (
                                        <tr key={book.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-16 rounded ${book.cover_color || 'bg-blue-500'} flex items-center justify-center overflow-hidden`}>
                                                        {book.cover_url ? (
                                                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{book.title}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-muted-foreground">{book.author}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                                    {book.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center font-semibold">{book.totalCopies}</td>
                                            <td className="p-4 text-center">
                                                <span className="text-green-600 font-semibold">{book.availableCopies}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-orange-600 font-semibold">{book.borrowedCopies}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    href={`/admin/books/offline/${book.id}`}
                                                    className="text-primary hover:underline text-sm font-medium"
                                                >
                                                    Batafsil →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {initialTotalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    Jami {totalBooks} kitob, {currentPage}-sahifa / {initialTotalPages}
                                </p>
                                <div className="flex gap-2">
                                    {currentPage > 1 && (
                                        <Link
                                            href={`/admin/books/offline?page=${currentPage - 1}${searchParams.toString() ? '&' + searchParams.toString() : ''}`}
                                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                        >
                                            ← Oldingi
                                        </Link>
                                    )}
                                    {currentPage < initialTotalPages && (
                                        <Link
                                            href={`/admin/books/offline?page=${currentPage + 1}${searchParams.toString() ? '&' + searchParams.toString() : ''}`}
                                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                        >
                                            Keyingi →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
