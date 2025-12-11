"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BarcodePrintModal } from '@/components/admin/BarcodePrintModal';

export default function CreateOfflineBookPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [barcodeMode, setBarcodeMode] = useState<'auto' | 'existing'>('auto');
    const [generatedBarcodes, setGeneratedBarcodes] = useState<string[]>([]);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [copyCount, setCopyCount] = useState(1);
    const [existingBarcodes, setExistingBarcodes] = useState<string[]>(['']);
    const [barcodeExistsInDB, setBarcodeExistsInDB] = useState<boolean[]>([]);

    // Check if barcode exists in database
    const checkBarcodeInDB = useCallback(async (barcode: string, index: number) => {
        if (!barcode || !barcode.trim()) {
            const newExists = [...barcodeExistsInDB];
            newExists[index] = false;
            setBarcodeExistsInDB(newExists);
            return;
        }

        const { data } = await supabase
            .from('physical_book_copies')
            .select('barcode')
            .eq('barcode', barcode.trim())
            .limit(1);

        const newExists = [...barcodeExistsInDB];
        newExists[index] = (data && data.length > 0) || false;
        setBarcodeExistsInDB(newExists);
    }, [barcodeExistsInDB]);


    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
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
            const numberOfCopies = copyCount;
            const location = formData.get('location') as string;

            // Validate existing barcodes for duplicates
            if (barcodeMode === 'existing') {
                const filledBarcodes = existingBarcodes.filter(b => b && b.trim());
                const uniqueBarcodes = new Set(filledBarcodes);

                if (filledBarcodes.length !== uniqueBarcodes.size) {
                    alert('Xatolik: Bir xil barcode kiritilgan! Har bir nusxa uchun alohida barcode kiriting.');
                    setLoading(false);
                    return;
                }

                if (filledBarcodes.length !== numberOfCopies) {
                    alert(`Xatolik: ${numberOfCopies} ta barcode kiritish kerak!`);
                    setLoading(false);
                    return;
                }
            }

            // Get organization info for auto-generated barcodes
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

                if (barcodeMode === 'existing') {
                    // Use existing barcode from array
                    barcode = existingBarcodes[i - 1] || `NO-BARCODE-${i}`;
                } else {
                    // Generate 13-digit numeric barcode (EAN-13 format)
                    // Format: XXYYYYYYYYYZZZ = 13 digits total
                    // XX = organization code (2 digits)
                    // YYYYYYYYY = book ID hash (8 digits) 
                    // ZZZ = copy number (3 digits)

                    const orgCode = orgSlug.charCodeAt(0).toString().slice(-2).padStart(2, '0');

                    let hash = 0;
                    for (let j = 0; j < book.id.length; j++) {
                        hash = ((hash << 5) - hash) + book.id.charCodeAt(j);
                        hash = hash & hash;
                    }
                    const bookHash = Math.abs(hash).toString().slice(0, 8).padStart(8, '0');

                    const copyNum = String(i).padStart(3, '0');
                    barcode = `${orgCode}${bookHash}${copyNum}`;
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

            if (copiesError) {
                console.error('Copies insert error:', copiesError);

                // Check for duplicate barcode
                if (copiesError.code === '23505') {
                    alert('Xatolik: Barcode allaqachon mavjud! Boshqa barcode kiriting yoki avtomatik generatsiya tanlang.');
                } else {
                    alert(`Nusxalarni yaratishda xatolik: ${copiesError.message}`);
                }

                setLoading(false);
                return;
            }

            // Store generated barcodes and show modal
            setGeneratedBarcodes(copies.map(c => c.barcode));
            setShowBarcodeModal(true);
        } catch (error: any) {
            console.error('Error creating offline book:', error);

            // Better error messages
            if (error.code === '23505') {
                alert('Xatolik: Barcode allaqachon mavjud sistemada!');
            } else if (error.code === '23503') {
                alert('Xatolik: Tashkilot ma\'lumotlari topilmadi!');
            } else {
                alert('Xatolik yuz berdi! Iltimos, qaytadan urinib ko\'ring.');
            }

            setLoading(false);
        }
    }, [barcodeMode, router, copyCount, existingBarcodes]);

    const handleCloseModal = () => {
        setShowBarcodeModal(false);
        router.push('/admin/books/offline');
        router.refresh();
    };

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
                                        checked={barcodeMode === 'auto'}
                                        onChange={() => setBarcodeMode('auto')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Avtomatik generatsiya</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="barcode_mode"
                                        value="existing"
                                        checked={barcodeMode === 'existing'}
                                        onChange={() => setBarcodeMode('existing')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Kitobda mavjud barcode</span>
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Avtomatik: Tizim barcode yaratadi. Mavjud: Kitobdagi ISBN yoki barcode'ni kiriting.
                            </p>
                        </div>

                        {/* Existing Barcode Input (Conditional) */}
                        {barcodeMode === 'existing' && (
                            <div className="space-y-4">
                                <label className="text-sm font-medium">
                                    Kitobdagi Barcode/ISBN (Har bir nusxa uchun)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Array.from({ length: copyCount }, (_, i) => {
                                        const currentBarcode = existingBarcodes[i] || '';
                                        const isDuplicate = currentBarcode && existingBarcodes.filter(b => b === currentBarcode).length > 1;
                                        const existsInDB = barcodeExistsInDB[i] || false;
                                        const hasError = isDuplicate || existsInDB;

                                        return (
                                            <div key={i} className="space-y-1">
                                                <label className="text-xs text-muted-foreground">
                                                    Nusxa #{i + 1}
                                                </label>
                                                <input
                                                    value={currentBarcode}
                                                    onChange={(e) => {
                                                        const newBarcodes = [...existingBarcodes];
                                                        newBarcodes[i] = e.target.value;
                                                        setExistingBarcodes(newBarcodes);

                                                        // Debounced DB check
                                                        setTimeout(() => {
                                                            checkBarcodeInDB(e.target.value, i);
                                                        }, 500);
                                                    }}
                                                    className={`w-full px-3 py-2 bg-background border rounded-lg focus:ring-2 outline-none transition-all font-mono text-sm ${hasError
                                                            ? 'border-red-500 focus:ring-red-500/50'
                                                            : 'border-border focus:ring-primary/50'
                                                        }`}
                                                    placeholder={`Barcode ${i + 1}`}
                                                />
                                                {isDuplicate && (
                                                    <p className="text-xs text-red-500">
                                                        ⚠️ Bir xil barcode!
                                                    </p>
                                                )}
                                                {!isDuplicate && existsInDB && (
                                                    <p className="text-xs text-red-500">
                                                        ⚠️ Bu barcode allaqachon mavjud!
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Scanner bilan skanerlang yoki qo'lda kiriting. Har bir nusxa uchun alohida barcode.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Nusxalar soni <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="copies"
                                    type="number"
                                    min="1"
                                    value={copyCount}
                                    onChange={(e) => {
                                        const count = parseInt(e.target.value) || 1;
                                        setCopyCount(count);
                                        // Resize barcode array
                                        setExistingBarcodes(Array.from({ length: count }, (_, i) => existingBarcodes[i] || ''));
                                    }}
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

            {/* Barcode Print Modal */}
            {showBarcodeModal && (
                <BarcodePrintModal
                    barcodes={generatedBarcodes}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
