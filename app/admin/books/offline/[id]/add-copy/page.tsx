"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function AddCopyPage({ params }: PageProps) {
    const router = useRouter();
    const [bookId, setBookId] = useState<string>('');
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [nextCopyNumber, setNextCopyNumber] = useState(1);

    useEffect(() => {
        params.then(p => {
            setBookId(p.id);
            loadBookData(p.id);
        });
    }, []);

    const loadBookData = async (id: string) => {
        // Get book info
        const { data: bookData } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        setBook(bookData);

        // Get existing copies to determine next copy number
        const { data: copies } = await supabase
            .from('physical_book_copies')
            .select('copy_number')
            .eq('book_id', id)
            .order('copy_number', { ascending: false })
            .limit(1);

        if (copies && copies.length > 0) {
            setNextCopyNumber(copies[0].copy_number + 1);
        }

        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.currentTarget);

        try {
            const numberOfCopies = parseInt(formData.get('copies') as string) || 1;
            const location = formData.get('location') as string;
            const barcodeMode = formData.get('barcode_mode') as string;
            const existingBarcode = formData.get('existing_barcode') as string;

            // Get organization info
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
                .from('profiles')
                .select('organizations(slug), organization_id')
                .eq('id', user?.id)
                .single();

            const orgSlug = (profile?.organizations as any)?.slug || 'UNI';

            // Generate copies
            const copies = [];
            for (let i = 0; i < numberOfCopies; i++) {
                const copyNumber = nextCopyNumber + i;
                let barcode;

                if (barcodeMode === 'existing' && existingBarcode) {
                    barcode = numberOfCopies > 1
                        ? `${existingBarcode}-${String(copyNumber).padStart(3, '0')}`
                        : existingBarcode;
                } else {
                    const shortId = bookId.substring(0, 8).toUpperCase();
                    const paddedCopy = String(copyNumber).padStart(3, '0');
                    barcode = `BOOK-${orgSlug}-${shortId}-${paddedCopy}`;
                }

                copies.push({
                    book_id: bookId,
                    barcode: barcode,
                    copy_number: copyNumber,
                    location: location,
                    organization_id: (profile as any)?.organization_id,
                    status: 'available'
                });
            }

            const { error } = await supabase
                .from('physical_book_copies')
                .insert(copies);

            if (error) throw error;

            router.push(`/admin/books/offline/${bookId}`);
            router.refresh();
        } catch (error) {
            console.error('Error adding copies:', error);
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

    if (!book) {
        return <div>Kitob topilmadi</div>;
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
                <h1 className="text-3xl font-bold">Nusxa Qo'shish</h1>
                <p className="text-muted-foreground mt-1">
                    "{book.title}" kitobiga yangi fizik nusxa qo'shish
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {/* Barcode Mode Selection */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Barcode Rejimi</h3>
                        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="barcode_mode"
                                        value="auto"
                                        defaultChecked
                                        className="w-4 h-4"
                                        onChange={() => {
                                            const existingInput = document.getElementById('existing_barcode_section') as HTMLElement;
                                            if (existingInput) existingInput.style.display = 'none';
                                        }}
                                    />
                                    <span className="text-sm">Avtomatik generatsiya</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="barcode_mode"
                                        value="existing"
                                        className="w-4 h-4"
                                        onChange={() => {
                                            const existingInput = document.getElementById('existing_barcode_section') as HTMLElement;
                                            if (existingInput) existingInput.style.display = 'block';
                                        }}
                                    />
                                    <span className="text-sm">Kitobda mavjud barcode</span>
                                </label>
                            </div>
                        </div>

                        <div id="existing_barcode_section" style={{ display: 'none' }} className="space-y-2">
                            <label className="text-sm font-medium">Kitobdagi Barcode/ISBN</label>
                            <input
                                name="existing_barcode"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                                placeholder="Masalan: 978-0-13-468599-1"
                            />
                        </div>
                    </div>

                    {/* Copy Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Nusxa Ma'lumotlari</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Nusxalar soni <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="copies"
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Keyingi nusxa raqami: #{nextCopyNumber}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Joylashuv (Shelf)</label>
                                <input
                                    name="location"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Masalan: A-1, Raqam 5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
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
                                    Nusxa Qo'shish
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
