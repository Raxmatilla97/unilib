import { supabaseAdmin } from '@/lib/supabase/admin';
import { Package, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getOfflineBooks() {
    // Get offline books with copy counts
    const { data: books, error } = await supabaseAdmin
        .from('books')
        .select(`
            id,
            title,
            author,
            category,
            cover_url,
            cover_color,
            created_at
        `)
        .in('book_type', ['offline', 'both'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching offline books:', error);
        return [];
    }

    // Get copy counts for each book
    const booksWithCopies = await Promise.all(
        (books || []).map(async (book) => {
            const { data: copies } = await supabaseAdmin
                .from('physical_book_copies')
                .select('id, status, barcode, location')
                .eq('book_id', book.id);

            const totalCopies = copies?.length || 0;
            const availableCopies = copies?.filter(c => c.status === 'available').length || 0;
            const borrowedCopies = copies?.filter(c => c.status === 'borrowed').length || 0;

            return {
                ...book,
                totalCopies,
                availableCopies,
                borrowedCopies,
                copies: copies || []
            };
        })
    );

    return booksWithCopies;
}

export default async function OfflineBooksPage() {
    const books = await getOfflineBooks();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Package className="w-8 h-8 text-primary" />
                        Offline Kitoblar
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Fizik kitoblar va nusxalar boshqaruvi
                    </p>
                </div>
                <Link
                    href="/admin/books/offline/create"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5" />
                    Yangi Offline Kitob
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Jami Kitoblar</p>
                    <p className="text-3xl font-bold mt-1">{books.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Jami Nusxalar</p>
                    <p className="text-3xl font-bold mt-1">
                        {books.reduce((sum, book) => sum + book.totalCopies, 0)}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Qarzda</p>
                    <p className="text-3xl font-bold mt-1 text-orange-500">
                        {books.reduce((sum, book) => sum + book.borrowedCopies, 0)}
                    </p>
                </div>
            </div>

            {/* Books List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Package className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold mb-2">Offline kitoblar yo'q</h3>
                        <p className="text-muted-foreground mb-6">
                            Birinchi offline kitobni qo'shing
                        </p>
                        <Link
                            href="/admin/books/offline/create"
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Kitob Qo'shish
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="text-left p-4 font-semibold">Kitob</th>
                                    <th className="text-left p-4 font-semibold">Muallif</th>
                                    <th className="text-left p-4 font-semibold">Kategoriya</th>
                                    <th className="text-center p-4 font-semibold">Jami Nusxalar</th>
                                    <th className="text-center p-4 font-semibold">Mavjud</th>
                                    <th className="text-center p-4 font-semibold">Qarzda</th>
                                    <th className="text-right p-4 font-semibold">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book) => (
                                    <tr key={book.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-16 rounded ${book.cover_color || 'bg-blue-500'} flex items-center justify-center overflow-hidden`}>
                                                    {book.cover_url ? (
                                                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{book.title}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{book.author}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                                {book.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-semibold">{book.totalCopies}</td>
                                        <td className="p-4 text-center">
                                            <span className="text-green-600 font-semibold">{book.availableCopies}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-orange-600 font-semibold">{book.borrowedCopies}</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/admin/books/offline/${book.id}`}
                                                className="text-primary hover:underline text-sm font-medium"
                                            >
                                                Batafsil →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
