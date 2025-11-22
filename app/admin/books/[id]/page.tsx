"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { BookForm } from '@/components/admin/BookForm';
import { Loader2 } from 'lucide-react';

export default function EditBookPage() {
    const params = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const { data, error } = await supabase
                    .from('books')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setBook(data);
            } catch (error) {
                console.error('Error fetching book:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchBook();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Kitob topilmadi</p>
            </div>
        );
    }

    return (
        <AdminRoute requiredPermission="books:update">
            <BookForm initialData={book} />
        </AdminRoute>
    );
}
