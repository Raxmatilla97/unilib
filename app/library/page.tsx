import { Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BookList } from '@/components/library/BookList';

export const dynamic = 'force-dynamic';

async function getBooks() {
    const { data, error } = await supabase
        .from('books')
        .select('id, title, author, rating, cover_color, category')
        .order('title');

    if (error) {
        console.error('Error fetching books:', error);
        return [];
    }

    return data.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        rating: book.rating,
        coverColor: book.cover_color || 'bg-blue-500',
        category: book.category
    }));
}

export default async function LibraryPage() {
    const books = await getBooks();
    const categories = ['All', ...new Set(books.map(book => book.category))];

    return (
        <div className="container py-10 px-4 md:px-6">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Kitoblar yuklanmoqda...</p>
                    </div>
                </div>
            }>
                <BookList initialBooks={books} categories={categories} />
            </Suspense>
        </div>
    );
}
