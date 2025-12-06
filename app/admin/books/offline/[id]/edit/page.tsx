"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditOfflineBookPage({ params }: PageProps) {
    const router = useRouter();
    const [bookId, setBookId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [book, setBook] = useState<any>(null);

    useEffect(() => {
        params.then(p => {
            setBookId(p.id);
            loadBook(p.id);
        });
    }, []);

    const loadBook = async (id: string) => {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            setBook(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const formData = new FormData(e.currentTarget);

        try {
            const { error } = await supabase
                .from('books')
                .update({
                    title: formData.get('title') as string,
                    author: formData.get('author') as string,
                    category: formData.get('category') as string,
                    description: formData.get('description') as string,
                    cover_color: formData.get('cover_color') as string,
                })
                .eq('id', bookId);

            if (error) throw error;

            router.push(`/admin/books/offline/${bookId}`);
            router.refresh();
        } catch (error) {
            console.error('Error updating book:', error);
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
                <h1 className="text-3xl font-bold">Kitobni Tahrirlash</h1>
                <p className="text-muted-foreground mt-1">
                    Kitob ma'lumotlarini yangilash
                </p>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-border pb-2">Asosiy Ma'lumotlar</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Kitob nomi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="title"
                                    defaultValue={book.title}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Muallif <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="author"
                                    defaultValue={book.author}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Kategoriya <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="category"
                                    defaultValue={book.category}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Muqova Rangi</label>
                                <select
                                    name="cover_color"
                                    defaultValue={book.cover_color || 'bg-blue-500'}
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
                                defaultValue={book.description || ''}
                                rows={4}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
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
