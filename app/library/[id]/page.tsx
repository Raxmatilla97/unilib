import { supabaseAdmin } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
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

async function getReviews(bookId: string) {
    const { data } = await supabaseAdmin
        .from('book_reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            profiles:user_id (
                name
            )
        `)
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });

    return data?.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user_name: (review.profiles as any)?.name || 'Anonim'
    })) || [];
}

async function getUserId() {
    try {
        const cookieStore = await cookies();

        // Get all cookies and find Supabase auth token
        const allCookies = cookieStore.getAll();
        const authCookie = allCookies.find(cookie =>
            cookie.name.includes('auth-token') ||
            cookie.name.includes('access-token') ||
            (cookie.name.includes('sb-') && cookie.name.includes('auth'))
        );

        if (!authCookie?.value) {
            return null;
        }

        try {
            const { data: { user } } = await supabaseAdmin.auth.getUser(authCookie.value);
            return user?.id || null;
        } catch {
            return null;
        }
    } catch {
        return null;
    }
}

async function incrementViews(bookId: string) {
    try {
        // Call the API route to increment views
        await supabaseAdmin.rpc('increment_book_views', { book_uuid: bookId });
    } catch (error) {
        console.error('Failed to increment views:', error);
    }
}

export default async function BookDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const book = await getBook(params.id);

    if (!book) {
        notFound();
    }

    const [similarBooks, reviews, userId] = await Promise.all([
        getSimilarBooks(book.category, book.id),
        getReviews(book.id),
        getUserId()
    ]);

    // Increment views count
    await incrementViews(book.id);

    return (
        <BookDetailClient
            book={book}
            similarBooks={similarBooks}
            initialReviews={reviews}
            userId={userId}
            isAuthenticated={!!userId}
        />
    );
}
