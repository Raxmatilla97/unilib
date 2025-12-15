"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
    Save,
    X,
    Upload,
    Loader2,
    ArrowLeft,
    Check,
    AlertCircle,
    FileText,
    Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

interface Book {
    id: string;
    title: string;
    author: string;
    category: string;
    rating: number;
    cover_color: string;
    cover_url?: string;
    file_url?: string;
    description?: string;
    pages?: number;
    year?: number;
    language?: string;
    book_type?: string;
    created_at: string;
}

interface BookFormProps {
    initialData?: Book | null;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function BookForm({ initialData }: BookFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [success, setSuccess] = useState(false);

    // File Upload States
    const [coverStatus, setCoverStatus] = useState<UploadStatus>('idle');
    const [bookFileStatus, setBookFileStatus] = useState<UploadStatus>('idle');
    const [coverUrl, setCoverUrl] = useState(initialData?.cover_url || '');
    const [fileUrl, setFileUrl] = useState(initialData?.file_url || '');

    // Memoize default categories
    const defaultCategories = useMemo(() => [
        'Badiiy',
        'Ilmiy',
        'Darslik',
        'Biznes',
        'Psixologiya',
        'Tarix'
    ], []);

    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await supabase
                .from('books')
                .select('category');

            if (data) {
                const uniqueCategories = Array.from(new Set(data.map(item => item.category))).sort();
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleFileUpload = useCallback(async (
        file: File,
        bucket: 'covers' | 'books',
        setStatus: (s: UploadStatus) => void,
        setUrl: (u: string) => void
    ) => {
        setStatus('uploading');
        try {
            let fileToUpload = file;

            // Compress image if it's a cover (image file)
            if (bucket === 'covers' && file.type.startsWith('image/')) {
                // Create canvas for compression
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });

                // Max dimensions for cover
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = (height * MAX_WIDTH) / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = (width * MAX_HEIGHT) / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                // Convert to blob with compression
                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.85);
                });

                fileToUpload = new File([blob], file.name, { type: 'image/jpeg' });
                URL.revokeObjectURL(img.src);
            }

            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, fileToUpload, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            setUrl(data.publicUrl);
            setStatus('success');
        } catch (error) {
            console.error(`Error uploading to ${bucket}:`, error);
            setStatus('error');
            alert('Fayl yuklashda xatolik yuz berdi');
        }
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            // Validate that files are uploaded if intended
            if (coverStatus === 'uploading' || bookFileStatus === 'uploading') {
                alert('Iltimos, fayllar yuklanib bo\'lishini kuting');
                setLoading(false);
                return;
            }

            const bookData = {
                title: formData.get('title') as string,
                author: formData.get('author') as string,
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                cover_color: formData.get('cover_color') as string,
                cover_url: coverUrl || (formData.get('cover_url_text') as string) || null,
                file_url: fileUrl || (formData.get('file_url_text') as string) || null,
                rating: parseFloat(formData.get('rating') as string) || 5.0,
                pages: parseInt(formData.get('pages') as string) || 0,
                language: formData.get('language') as string || 'O\'zbek',
                year: parseInt(formData.get('year') as string) || new Date().getFullYear(),
                book_type: initialData?.book_type || 'both',
            };

            if (initialData) {
                const { error } = await supabase
                    .from('books')
                    .update(bookData)
                    .eq('id', initialData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('books')
                    .insert([bookData]);
                if (error) throw error;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/admin/books');
                router.refresh();
            }, 2000);
        } catch (error) {
            console.error('Error saving book:', error);
            alert('Xatolik yuz berdi!');
            setLoading(false);
        }
    }, [coverStatus, bookFileStatus, coverUrl, fileUrl, initialData, router]);

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                    <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Muvaffaqiyatli Saqlandi!</h2>
                <p className="text-muted-foreground">Sizni kitoblar roʻyxatiga yoʻnaltirmoqdamiz...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/books"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ortga qaytish
                </Link>
                <h1 className="text-3xl font-bold">
                    {initialData ? 'Kitobni Tahrirlash' : 'Yangi Kitob Qo\'shish'}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {initialData ? 'Mavjud kitob ma\'lumotlarini o\'zgartirish' : 'Platformaga yangi kitob qo\'shish'}
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    {/* Asosiy Ma'lumotlar */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Asosiy Ma'lumotlar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kitob nomi <span className="text-red-500">*</span></label>
                                <input
                                    name="title"
                                    defaultValue={initialData?.title}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Masalan: oʻtgan kunlar"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Muallif <span className="text-red-500">*</span></label>
                                <input
                                    name="author"
                                    defaultValue={initialData?.author}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    placeholder="Masalan: Abdulla Qodiriy"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kategoriya <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        name="category"
                                        list="categories-list"
                                        defaultValue={initialData?.category}
                                        required
                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        placeholder="Tanlang yoki yangi yozing..."
                                        autoComplete="off"
                                    />
                                    <datalist id="categories-list">
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat} />
                                        ))}
                                        {defaultCategories.map((cat) => (
                                            <option key={`default-${cat}`} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Mavjud kategoriyani tanlang yoki yangisini kiriting.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Til</label>
                                <select
                                    name="language"
                                    defaultValue={initialData?.language || 'O\'zbek'}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                >
                                    <option value="oʻzbek">oʻzbek</option>
                                    <option value="Ingliz">Ingliz</option>
                                    <option value="Rus">Rus</option>
                                    <option value="Boshqa">Boshqa</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Fayllar va Media */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Fayllar va Media</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Cover Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Muqova Rasmi</label>
                                <div className="flex flex-col gap-3">
                                    <div className={`border-2 border-dashed rounded-lg p-4 transition-all text-center cursor-pointer relative group
                                        ${coverStatus === 'error' ? 'border-red-500 bg-red-500/5' :
                                            coverStatus === 'success' ? 'border-green-500 bg-green-500/5' :
                                                'border-border hover:bg-muted/50'}`}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, 'covers', setCoverStatus, setCoverUrl);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={coverStatus === 'uploading'}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            {coverStatus === 'uploading' ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    <span className="text-sm font-medium text-primary">Yuklanmoqda...</span>
                                                </>
                                            ) : coverStatus === 'success' ? (
                                                <>
                                                    <Check className="w-8 h-8 text-green-500" />
                                                    <span className="text-sm font-medium text-green-500">Rasm yuklandi!</span>
                                                </>
                                            ) : coverStatus === 'error' ? (
                                                <>
                                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                                    <span className="text-sm font-medium text-red-500">Xatolik! Qayta urining</span>
                                                </>
                                            ) : (
                                                <>
                                                    {coverUrl ? (
                                                        <img src={coverUrl} alt="Cover" className="w-16 h-24 object-cover rounded shadow-sm mb-2" />
                                                    ) : (
                                                        <ImageIcon className="w-8 h-8 group-hover:text-primary transition-colors" />
                                                    )}
                                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                        {coverUrl ? 'Rasmni o\'zgartirish' : 'Rasm yuklash uchun bosing'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">URL</span>
                                        <input
                                            name="cover_url_text"
                                            value={coverUrl}
                                            onChange={(e) => setCoverUrl(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm transition-all"
                                            placeholder="Yoki rasm URL manzili..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Book File Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Kitob Fayli (PDF/EPUB)</label>
                                <div className="flex flex-col gap-3">
                                    <div className={`border-2 border-dashed rounded-lg p-4 transition-all text-center cursor-pointer relative group
                                        ${bookFileStatus === 'error' ? 'border-red-500 bg-red-500/5' :
                                            bookFileStatus === 'success' ? 'border-green-500 bg-green-500/5' :
                                                'border-border hover:bg-muted/50'}`}
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf,.epub"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, 'books', setBookFileStatus, setFileUrl);
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={bookFileStatus === 'uploading'}
                                        />
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            {bookFileStatus === 'uploading' ? (
                                                <>
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    <span className="text-sm font-medium text-primary">Yuklanmoqda...</span>
                                                </>
                                            ) : bookFileStatus === 'success' ? (
                                                <>
                                                    <Check className="w-8 h-8 text-green-500" />
                                                    <span className="text-sm font-medium text-green-500">Fayl yuklandi!</span>
                                                </>
                                            ) : bookFileStatus === 'error' ? (
                                                <>
                                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                                    <span className="text-sm font-medium text-red-500">Xatolik! Qayta urining</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FileText className="w-8 h-8 group-hover:text-primary transition-colors" />
                                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                        {fileUrl ? 'Faylni o\'zgartirish' : 'Fayl yuklash uchun bosing'}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">URL</span>
                                        <input
                                            name="file_url_text"
                                            value={fileUrl}
                                            onChange={(e) => setFileUrl(e.target.value)}
                                            className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm transition-all"
                                            placeholder="Yoki fayl URL manzili..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Qo'shimcha Ma'lumotlar */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Qoʻshimcha Ma'lumotlar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sahifalar soni</label>
                                <input
                                    name="pages"
                                    type="number"
                                    defaultValue={initialData?.pages || 0}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nashr Yili</label>
                                <input
                                    name="year"
                                    type="number"
                                    defaultValue={initialData?.year || new Date().getFullYear()}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reyting (0-5)</label>
                                <input
                                    name="rating"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    defaultValue={initialData?.rating || 5.0}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Muqova Rangi (Default)</label>
                                <select
                                    name="cover_color"
                                    defaultValue={initialData?.cover_color || 'bg-blue-500'}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                >
                                    <option value="bg-blue-500">Koʻk</option>
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
                                defaultValue={initialData?.description}
                                rows={5}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
                                placeholder="Kitob haqida batafsil ma'lumot..."
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                        <Link
                            href="/admin/books"
                            className="px-6 py-2.5 rounded-lg hover:bg-muted transition-colors font-medium"
                        >
                            Bekor qilish
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || coverStatus === 'uploading' || bookFileStatus === 'uploading'}
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
                                    {initialData ? 'O\'zgarishlarni Saqlash' : 'Kitobni Qo\'shish'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
