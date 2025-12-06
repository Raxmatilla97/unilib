"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Package, Plus, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function OfflineBookDetailsPage({ params }: PageProps) {
    const router = useRouter();
    const [bookId, setBookId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [book, setBook] = useState<any>(null);
    const [copies, setCopies] = useState<any[]>([]);

    useEffect(() => {
        params.then(p => {
            setBookId(p.id);
            loadBookDetails(p.id);
        });
    }, []);

    const loadBookDetails = async (id: string) => {
        // Get book info
        const { data: bookData } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (!bookData) {
            router.push('/admin/books/offline');
            return;
        }

        setBook(bookData);

        // Get all physical copies
        const { data: copiesData } = await supabase
            .from('physical_book_copies')
            .select('*')
            .eq('book_id', id)
            .order('copy_number', { ascending: true });

        // Get checkout history for each copy
        const copiesWithHistory = await Promise.all(
            (copiesData || []).map(async (copy) => {
                const { data: checkouts } = await supabase
                    .from('book_checkouts')
                    .select(`
                        *,
                        profiles:user_id(name, email, student_id)
                    `)
                    .eq('physical_copy_id', copy.id)
                    .order('checked_out_at', { ascending: false })
                    .limit(5);

                return {
                    ...copy,
                    checkouts: checkouts || []
                };
            })
        );

        setCopies(copiesWithHistory);
        setLoading(false);
    };

    const handleDeleteBook = async () => {
        if (!confirm('Kitobni o\'chirmoqchimisiz? Bu barcha nusxalarni ham o\'chiradi!')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', bookId);

            if (error) throw error;

            router.push('/admin/books/offline');
            router.refresh();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Xatolik yuz berdi!');
        }
    };

    const handleDeleteCopy = async (copyId: string) => {
        if (!confirm('Nusxani o\'chirmoqchimisiz?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('physical_book_copies')
                .delete()
                .eq('id', copyId);

            if (error) throw error;

            // Reload data
            loadBookDetails(bookId);
        } catch (error) {
            console.error('Error deleting copy:', error);
            alert('Xatolik yuz berdi!');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!book) {
        return <div>Kitob topilmadi</div>;
    }

    const availableCopies = copies.filter(c => c.status === 'available').length;
    const borrowedCopies = copies.filter(c => c.status === 'borrowed').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/books/offline"
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">{book.title}</h1>
                        <p className="text-muted-foreground mt-1">
                            {book.author} • {book.category}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/admin/books/offline/${bookId}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Tahrirlash
                    </Link>
                    <button
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                        onClick={handleDeleteBook}
                    >
                        <Trash2 className="w-4 h-4" />
                        O'chirish
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Jami Nusxalar</p>
                    <p className="text-3xl font-bold mt-1">{copies.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Mavjud</p>
                    <p className="text-3xl font-bold mt-1 text-green-500">{availableCopies}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Qarzda</p>
                    <p className="text-3xl font-bold mt-1 text-orange-500">{borrowedCopies}</p>
                </div>
            </div>

            {/* Book Info */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Kitob Ma'lumotlari</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Muallif</p>
                        <p className="font-medium">{book.author}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Kategoriya</p>
                        <p className="font-medium">{book.category}</p>
                    </div>
                    {book.description && (
                        <div className="md:col-span-2">
                            <p className="text-sm text-muted-foreground">Tavsif</p>
                            <p className="font-medium">{book.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Physical Copies */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-bold">Fizik Nusxalar</h2>
                    <Link
                        href={`/admin/books/offline/${bookId}/add-copy`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nusxa Qo'shish
                    </Link>
                </div>

                {copies.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Hozircha nusxalar yo'q
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left p-4 font-semibold">Nusxa #</th>
                                    <th className="text-left p-4 font-semibold">Barcode</th>
                                    <th className="text-left p-4 font-semibold">Holat</th>
                                    <th className="text-left p-4 font-semibold">Joylashuv</th>
                                    <th className="text-left p-4 font-semibold">Oxirgi Qarz</th>
                                    <th className="text-right p-4 font-semibold">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {copies.map((copy) => {
                                    const lastCheckout = copy.checkouts[0];
                                    const statusColors = {
                                        available: 'bg-green-500/10 text-green-600',
                                        borrowed: 'bg-orange-500/10 text-orange-600',
                                        lost: 'bg-red-500/10 text-red-600',
                                        damaged: 'bg-yellow-500/10 text-yellow-600'
                                    };

                                    return (
                                        <tr key={copy.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-semibold">#{copy.copy_number}</td>
                                            <td className="p-4 font-mono text-sm">{copy.barcode}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[copy.status as keyof typeof statusColors]}`}>
                                                    {copy.status === 'available' && 'Mavjud'}
                                                    {copy.status === 'borrowed' && 'Qarzda'}
                                                    {copy.status === 'lost' && 'Yo\'qolgan'}
                                                    {copy.status === 'damaged' && 'Shikastlangan'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="w-4 h-4" />
                                                    {copy.location || 'Belgilanmagan'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {lastCheckout ? (
                                                    <div>
                                                        <p>{(lastCheckout.profiles as any)?.name}</p>
                                                        <p className="text-xs">{new Date(lastCheckout.checked_out_at).toLocaleDateString()}</p>
                                                    </div>
                                                ) : (
                                                    'Hech qachon'
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/books/offline/${bookId}/copy/${copy.id}/edit`}
                                                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                        onClick={() => handleDeleteCopy(copy.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
