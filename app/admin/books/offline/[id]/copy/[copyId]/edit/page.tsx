"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string; copyId: string }>;
}

export default function EditCopyPage({ params }: PageProps) {
    const router = useRouter();
    const [bookId, setBookId] = useState<string>('');
    const [copyId, setCopyId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copy, setCopy] = useState<any>(null);
    const [book, setBook] = useState<any>(null);

    useEffect(() => {
        params.then(p => {
            setBookId(p.id);
            setCopyId(p.copyId);
            loadCopyData(p.id, p.copyId);
        });
    }, []);

    const loadCopyData = async (bookId: string, copyId: string) => {
        // Get copy info
        const { data: copyData } = await supabase
            .from('physical_book_copies')
            .select('*')
            .eq('id', copyId)
            .single();

        setCopy(copyData);

        // Get book info
        const { data: bookData } = await supabase
            .from('books')
            .select('*')
            .eq('id', bookId)
            .single();

        setBook(bookData);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.currentTarget);

        try {
            const { error } = await supabase
                .from('physical_book_copies')
                .update({
                    barcode: formData.get('barcode') as string,
                    location: formData.get('location') as string,
                    status: formData.get('status') as string,
                    notes: formData.get('notes') as string,
                })
                .eq('id', copyId);

            if (error) throw error;

            router.push(`/admin/books/offline/${bookId}`);
            router.refresh();
        } catch (error) {
            console.error('Error updating copy:', error);
            alert('Xatolik yuz berdi!');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!copy || !book) {
        return <div>Nusxa topilmadi</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-6">
                <Link
                    href={`/admin/books/offline/${bookId}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ortga qaytish
                </Link>
                <h1 className="text-3xl font-bold">Nusxani Tahrirlash</h1>
                <p className="text-muted-foreground mt-1">
                    "{book.title}" - Nusxa #{copy.copy_number}
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Nusxa Ma'lumotlari</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Nusxa Raqami
                                </label>
                                <input
                                    value={`#${copy.copy_number}`}
                                    disabled
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Barcode <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="barcode"
                                    defaultValue={copy.barcode}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Holat <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    defaultValue={copy.status}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                >
                                    <option value="available">Mavjud</option>
                                    <option value="borrowed">Qarzda</option>
                                    <option value="lost">Yo'qolgan</option>
                                    <option value="damaged">Shikastlangan</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Joylashuv</label>
                                <input
                                    name="location"
                                    defaultValue={copy.location || ''}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Masalan: A-1, Raqam 5"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Izohlar</label>
                            <textarea
                                name="notes"
                                defaultValue={copy.notes || ''}
                                rows={4}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
                                placeholder="Qo'shimcha ma'lumotlar..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                        <Link
                            href={`/admin/books/offline/${bookId}`}
                            className="px-6 py-2.5 rounded-lg hover:bg-muted transition-colors font-medium"
                        >
                            Bekor qilish
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saqlanmoqda...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Saqlash
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
