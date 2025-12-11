import { supabaseAdmin } from '@/lib/supabase/admin';
import { BookForm } from '@/components/admin/BookForm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getBook(id: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching book:', error);
        return null;
    }
}

export default async function EditBookPage({ params }: PageProps) {
    const { id } = await params;
    const book = await getBook(id);

    if (!book) {
        notFound();
    }

    return <BookForm initialData={book} />;
}
