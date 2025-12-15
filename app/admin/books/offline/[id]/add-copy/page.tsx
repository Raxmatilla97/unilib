"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BarcodePrintModal } from '@/components/admin/BarcodePrintModal';

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
    const [barcodeMode, setBarcodeMode] = useState<'auto' | 'existing'>('auto');
    const [generatedBarcodes, setGeneratedBarcodes] = useState<string[]>([]);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [copyCount, setCopyCount] = useState(1);
    const [existingBarcodes, setExistingBarcodes] = useState<string[]>(['']);
    const [barcodeExistsInDB, setBarcodeExistsInDB] = useState<boolean[]>([]);
    const [invNumbers, setInvNumbers] = useState<string[]>(['']);
    const [isbn, setIsbn] = useState('');

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


    const loadBookData = useCallback(async (id: string) => {
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
    }, []);

    useEffect(() => {
        params.then(p => {
            setBookId(p.id);
            loadBookData(p.id);
        });
    }, [params, loadBookData]);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.currentTarget);

        try {
            const numberOfCopies = copyCount;
            const location = formData.get('location') as string;

            // Validate existing barcodes for duplicates
            if (barcodeMode === 'existing') {
                const filledBarcodes = existingBarcodes.filter(b => b && b.trim());
                const uniqueBarcodes = new Set(filledBarcodes);

                if (filledBarcodes.length !== uniqueBarcodes.size) {
                    alert('Xatolik: Bir xil barcode kiritilgan! Har bir nusxa uchun alohida barcode kiriting.');
                    setSaving(false);
                    return;
                }

                if (filledBarcodes.length !== numberOfCopies) {
                    alert(`Xatolik: ${numberOfCopies} ta barcode kiritish kerak!`);
                    setSaving(false);
                    return;
                }
            }

            // Get book title for barcode prefix
            const titlePrefix = book.title.charAt(0).toUpperCase().charCodeAt(0).toString().slice(-2).padStart(2, '0');

            // Generate copies with 10-digit barcodes
            const copies = [];
            for (let i = 0; i < numberOfCopies; i++) {
                const copyNumber = nextCopyNumber + i;
                let barcode;

                if (barcodeMode === 'existing') {
                    // Use existing barcode from array
                    barcode = existingBarcodes[i] || `NO-BARCODE-${copyNumber}`;
                } else {
                    // Generate 10-digit numeric barcode (CODE128)
                    // Format: XXXXXXXZZZ = 10 digits total
                    // XXXXXXX = book ID hash (7 digits)
                    // ZZZ = copy number (3 digits)

                    let hash = 0;
                    for (let j = 0; j < bookId.length; j++) {
                        hash = ((hash << 5) - hash) + bookId.charCodeAt(j);
                        hash = hash & hash;
                    }
                    const bookHash = Math.abs(hash).toString().slice(0, 7).padStart(7, '0');

                    const copyNum = String(copyNumber).padStart(3, '0');
                    barcode = `${bookHash}${copyNum}`;
                }

                copies.push({
                    book_id: bookId,
                    barcode: barcode,
                    copy_number: copyNumber,
                    location: location,
                    status: 'available',
                    inv_number: invNumbers[i] || null,
                    isbn: isbn || null
                });
            }

            console.log('📊 Inserting copies:', copies);
            const { error } = await supabase
                .from('physical_book_copies')
                .insert(copies);

            if (error) {
                console.error('❌ Insert error:', error);
                console.error('❌ Error code:', error.code);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error details:', error.details);
                console.error('❌ Error hint:', error.hint);

                // Check for duplicate barcode
                if (error.code === '23505') {
                    alert('Xatolik: Barcode allaqachon mavjud! Boshqa barcode kiriting.');
                } else {
                    alert(`Nusxalarni qoʻshishda xatolik: ${error.message || 'Noma\'lum xatolik'}`);
                }

                setSaving(false);
                return;
            }

            // Show barcode modal
            setGeneratedBarcodes(copies.map(c => c.barcode));
            setShowBarcodeModal(true);
        } catch (error: any) {
            console.error('Error adding copies:', error);

            if (error.code === '23505') {
                alert('Xatolik: Barcode allaqachon mavjud sistemada!');
            } else if (error.code === '23503') {
                alert('Xatolik: Tashkilot ma\'lumotlari topilmadi!');
            } else {
                alert('Xatolik yuz berdi! Iltimos, qaytadan urinib ko\'ring.');
            }

            setSaving(false);
        }
    }, [barcodeMode, bookId, nextCopyNumber, copyCount, existingBarcodes]);

    const handleCloseModal = useCallback(() => {
        setShowBarcodeModal(false);
        router.push(`/admin/books/offline/${bookId}`);
        router.refresh();
    }, [bookId, router]);

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
                <h1 className="text-3xl font-bold">Nusxa Qoʻshish</h1>
                <p className="text-muted-foreground mt-1">
                    "{book.title}" kitobiga yangi fizik nusxa qoʻshish
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
                        </div>

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
                                                    Nusxa #{nextCopyNumber + i}
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
                                    Scanner bilan skanerlang yoki qoʻlda kiriting. Har bir nusxa uchun alohida barcode.
                                </p>
                            </div>
                        )}
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
                                    value={copyCount}
                                    onChange={(e) => {
                                        const count = parseInt(e.target.value) || 1;
                                        setCopyCount(count);
                                        // Resize arrays
                                        setExistingBarcodes(Array.from({ length: count }, (_, i) => existingBarcodes[i] || ''));
                                        setInvNumbers(Array.from({ length: count }, (_, i) => invNumbers[i] || ''));
                                    }}
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

                            {/* ISBN - Common for all copies */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">ISBN (ixtiyoriy)</label>
                                <input
                                    type="text"
                                    value={isbn}
                                    onChange={(e) => setIsbn(e.target.value)}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono"
                                    placeholder="978-0-123456-78-9"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Xalqaro standart kitob raqami (barcha nusxalar uchun bir xil)
                                </p>
                            </div>

                            {/* INV Numbers - One per copy */}
                            {copyCount > 0 && (
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium">INV Raqamlari (ixtiyoriy)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Array.from({ length: copyCount }, (_, i) => (
                                            <div key={i} className="space-y-1">
                                                <label className="text-xs text-muted-foreground">
                                                    Nusxa #{nextCopyNumber + i}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={invNumbers[i] || ''}
                                                    onChange={(e) => {
                                                        const newInv = [...invNumbers];
                                                        newInv[i] = e.target.value;
                                                        setInvNumbers(newInv);
                                                    }}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all font-mono text-sm"
                                                    placeholder={`INV-${nextCopyNumber + i}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Inventar raqamlari - kutubxona katalogi uchun
                                    </p>
                                </div>
                            )}
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
                                    Nusxa Qoʻshish
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
