import Link from 'next/link';
import { BookCard } from '@/components/library/BookCard';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getBooks() {
    const { data, error } = await supabaseAdmin
        .from('books')
        .select('id, title, author, rating, cover_color, category, cover_url')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching books:', error);
        return [];
    }
    return data || [];
}

export default async function LibraryPage() {
    const books = await getBooks();

    return (
        <div className="container py-10 px-4 md:px-6">
            <h1 className="text-3xl font-bold mb-8">Kutubxona</h1>
            {books.length === 0 ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <p className="text-muted-foreground">Hech qanday kitob topilmadi.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            author={book.author}
                            rating={book.rating}
                            coverColor={book.cover_color || 'bg-blue-500'}
                            category={book.category}
                            cover_url={book.cover_url}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
