import { createClient } from '@supabase/supabase-js';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ReaderPageClient } from '@/components/reader/ReaderPageClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let book = null;

    try {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            book = data;
        }
    } catch (error) {
        console.error('Error fetching book:', error);
    }

    if (!book) {
        return (
            <ProtectedRoute>
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold mb-4">Kitob topilmadi</h1>
                    <Link href="/library" className="text-primary hover:underline">
                        Kutubxonaga qaytish
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    if (!book.file_url) {
        return (
            <ProtectedRoute>
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold mb-4">Bu kitobning fayli mavjud emas</h1>
                    <Link href="/library" className="flex items-center gap-2 text-primary hover:underline">
                        <ArrowLeft className="w-4 h-4" />
                        Kutubxonaga qaytish
                    </Link>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <ReaderPageClient book={book} />
        </ProtectedRoute>
    );
}
