"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { BookCard } from '@/components/library/BookCard';
import { Search, Filter } from 'lucide-react';

interface Book {
    id: string;
    title: string;
    author: string;
    rating: number;
    coverColor: string;
    category: string;
}

export default function LibraryPage() {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['All']);

    // Fetch books from Supabase
    useEffect(() => {
        fetchBooks();
    }, []);

    // Get search query from URL on mount
    useEffect(() => {
        const query = searchParams.get('q');
        if (query) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('id, title, author, rating, cover_color, category')
                .order('title');

            if (error) throw error;

            if (data) {
                const formattedBooks = data.map(book => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    rating: book.rating,
                    coverColor: book.cover_color || 'bg-blue-500',
                    category: book.category
                }));

                setBooks(formattedBooks);

                // Extract unique categories
                const uniqueCategories = ['All', ...new Set(data.map(book => book.category))];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter books based on search and category
    const filteredBooks = books.filter(book => {
        const matchesSearch = searchQuery === '' ||
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    if (isLoading) {
        return (
            <div className="container py-10 px-4 md:px-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Kitoblar yuklanmoqda...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-10 px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Library Catalog</h1>
                    <p className="text-muted-foreground mt-1">
                        {filteredBooks.length} {filteredBooks.length === 1 ? 'kitob' : 'kitob'} topildi
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Kitob nomi, muallif yoki ISBN bo'yicha qidiring..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'bg-card border border-border hover:bg-muted'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} {...book} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Kitob topilmadi</h3>
                    <p className="text-muted-foreground">Qidiruv yoki filtr shartlarini o'zgartiring</p>
                </div>
            )}
        </div>
    );
}
