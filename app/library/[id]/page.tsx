import { supabaseAdmin } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BookDetailClient } from '@/components/library/BookDetailClient';

export const dynamic = 'force-dynamic';

async function getBook(id: string) {
    const { data, error } = await supabaseAdmin
        .from('books')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
}

async function getSimilarBooks(category: string, currentId: string) {
    const { data } = await supabaseAdmin
        .from('books')
        .select('id, title, author, rating, cover_color, category, cover_url')
        .eq('category', category)
        .neq('id', currentId)
        .limit(4);

    return data || [];
}

export default async function BookDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const book = await getBook(params.id);

    if (!book) {
        notFound();
    }

    const similarBooks = await getSimilarBooks(book.category, book.id);

    return <BookDetailClient book={book} similarBooks={similarBooks} />;
}
