import { supabaseAdmin } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Call the increment_book_views function
        const { error } = await supabaseAdmin
            .rpc('increment_book_views', { book_uuid: id });

        if (error) {
            console.error('Error incrementing views:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error incrementing views:', error);
        return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 });
    }
}
