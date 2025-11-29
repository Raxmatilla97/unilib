import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: reviews, error } = await supabaseAdmin
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
            .eq('book_id', id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform data to match expected format
        const transformedReviews = reviews?.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            created_at: review.created_at,
            user_name: (review.profiles as any)?.name || 'Anonim'
        })) || [];

        return NextResponse.json(transformedReviews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookId } = await params;
        const body = await request.json();
        const { rating, comment, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!rating || !comment || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('book_reviews')
            .insert({
                book_id: bookId,
                user_id: userId,
                rating,
                comment
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json({ error: 'Siz allaqachon izoh qoldirgansiz' }, { status: 409 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}
