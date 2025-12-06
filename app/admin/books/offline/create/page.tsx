"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Save, ArrowLeft, Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function CreateOfflineBookPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            // Get user's organization_id first
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .single();

            if (!profile?.organization_id) {
                alert('Tashkilot topilmadi. Iltimos, admin bilan bog\'laning.');
                setLoading(false);
                return;
            }

            const bookData = {
                title: formData.get('title') as string,
                author: formData.get('author') as string,
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                cover_color: formData.get('cover_color') as string,
                book_type: 'offline',
                rating: 5.0,
                organization_id: profile.organization_id
            };

            // Create the book
            const { data: book, error: bookError } = await supabase
                .from('books')
                .insert([bookData])
                .select()
                .single();

            if (bookError) throw bookError;

            // Create physical copies
            const numberOfCopies = parseInt(formData.get('copies') as string) || 1;
            const location = formData.get('location') as string;
            const barcodeMode = formData.get('barcode_mode') as string;
            const existingBarcode = formData.get('existing_barcode') as string;

            // Get organization info for auto-generated barcodes (reuse user from above)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('organizations(slug)')
                .eq('id', user.id)
                .single();

            const orgSlug = (profileData?.organizations as any)?.slug || 'UNI';

            // Generate copies
            const copies = [];
            for (let i = 1; i <= numberOfCopies; i++) {
                let barcode;

                if (barcodeMode === 'existing' && existingBarcode) {
                    // Use existing barcode with copy number suffix
                    barcode = numberOfCopies > 1
                        ? `${existingBarcode}-${String(i).padStart(3, '0')}`
                        : existingBarcode;
                } else {
                    // Generate barcode client-side
                    const shortId = book.id.substring(0, 8).toUpperCase();
                    const paddedCopy = String(i).padStart(3, '0');
                    barcode = `BOOK-${orgSlug}-${shortId}-${paddedCopy}`;
                }

                copies.push({
                    book_id: book.id,
                    barcode: barcode,
                    copy_number: i,
                    location: location,
                    organization_id: profile.organization_id,
                    status: 'available'
                });
            }

            const { error: copiesError } = await supabase
                .from('physical_book_copies')
                .insert(copies);

            if (copiesError) throw copiesError;

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/books/offline');
                router.refresh();
            }, 2000);
        } catch (error) {
            console.error('Error creating offline book:', error);
            alert('Xatolik yuz berdi!');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                    <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Muvaffaqiyatli Saqlandi!</h2>
                <p className="text-muted-foreground">Sizni offline kitoblar ro'yxatiga yo'naltirmoqdamiz...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-6">
                <Link
                    href="/admin/books/offline"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ortga qaytish
                </Link>
                <h1 className="text-3xl font-bold">Yangi Offline Kitob Qo'shish</h1>
                <p className="text-muted-foreground mt-1">
                    Fizik kitob va uning nusxalarini yaratish
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Asosiy Ma'lumotlar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Kitob nomi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="title"
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Masalan: O'tgan kunlar"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Muallif <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="author"
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Masalan: Abdulla Qodiriy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Kategoriya <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="category"
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Masalan: Badiiy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Muqova Rangi</label>
                                <select
                                    name="cover_color"
                                    defaultValue="bg-blue-500"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                >
                                    <option value="bg-blue-500">Ko'k</option>
                                    <option value="bg-green-500">Yashil</option>
                                    <option value="bg-red-500">Qizil</option>
                                    <option value="bg-yellow-500">Sariq</option>
                                    <option value="bg-purple-500">Binafsha</option>
                                    <option value="bg-indigo-500">Indigo</option>
                                    <option value="bg-pink-500">Pushti</option>
                                    <option value="bg-slate-500">Kulrang</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tavsif</label>
                            <textarea
                                name="description"
                                rows={4}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
                                placeholder="Kitob haqida batafsil ma'lumot..."
                            />
                        </div>
                    </div>

                    {/* Physical Copies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Fizik Nusxalar</h3>

                        {/* Barcode Mode Selection */}
                        <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                            <label className="text-sm font-medium">Barcode Rejimi</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="barcode_mode"
                                        value="auto"
                                        defaultChecked
                                        className="w-4 h-4"
                                        onChange={(e) => {
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
                                        onChange={(e) => {
                                            const existingInput = document.getElementById('existing_barcode_section') as HTMLElement;
                                            if (existingInput) existingInput.style.display = 'block';
                                        }}
                                    />
                                    <span className="text-sm">Kitobda mavjud barcode</span>
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Avtomatik: Tizim barcode yaratadi. Mavjud: Kitobdagi ISBN yoki barcode'ni kiriting.
                            </p>
                        </div>

                        {/* Existing Barcode Input (Hidden by default) */}
                        <div id="existing_barcode_section" style={{ display: 'none' }} className="space-y-2">
                            <label className="text-sm font-medium">
                                Kitobdagi Barcode/ISBN
                            </label>
                            <input
                                name="existing_barcode"
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                                placeholder="Masalan: 978-0-13-468599-1 yoki 1234567890123"
                            />
                            <p className="text-xs text-muted-foreground">
                                Scanner bilan skanerlang yoki qo'lda kiriting
                            </p>
                        </div>

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
                                    Har bir nusxa uchun alohida barcode
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
                            href="/admin/books/offline"
                            className="px-6 py-2.5 rounded-lg hover:bg-muted transition-colors font-medium"
                        >
                            Bekor qilish
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saqlanmoqda...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Kitobni Qo'shish
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
