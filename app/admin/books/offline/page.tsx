import { supabaseAdmin } from '@/lib/supabase/admin';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { BooksSearch } from '@/components/admin/BooksSearch';

export const dynamic = 'force-dynamic';

interface GetBooksParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
}

async function getOfflineBooks({
    page = 1,
    limit = 10,
    search,
    category,
    status,
    sort = 'created_at'
}: GetBooksParams = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build count query
    let countQuery = supabaseAdmin
        .from('books')
        .select('*', { count: 'exact', head: true })
        .in('book_type', ['offline', 'both']);

    // Apply search filter to count
    if (search) {
        countQuery = countQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    // Apply category filter to count
    if (category) {
        countQuery = countQuery.eq('category', category);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
        console.error('Error fetching books count:', countError);
        return { books: [], totalBooks: 0, totalPages: 0, categories: [] };
    }

    // Build main query with JOIN
    let booksQuery = supabaseAdmin
        .from('books')
        .select(`
            id,
            title,
            author,
            category,
            cover_url,
            cover_color,
            created_at,
            physical_book_copies(id, status, barcode, location)
        `)
        .in('book_type', ['offline', 'both']);

    // Apply search filter
    if (search) {
        booksQuery = booksQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    // Apply category filter
    if (category) {
        booksQuery = booksQuery.eq('category', category);
    }

    // Apply sorting
    switch (sort) {
        case 'title':
            booksQuery = booksQuery.order('title', { ascending: true });
            break;
        case 'author':
            booksQuery = booksQuery.order('author', { ascending: true });
            break;
        default:
            booksQuery = booksQuery.order('created_at', { ascending: false });
    }

    // Apply pagination
    booksQuery = booksQuery.range(from, to);

    const { data: books, error } = await booksQuery;

    if (error) {
        console.error('Error fetching offline books:', error);
        return { books: [], totalBooks: 0, totalPages: 0, categories: [] };
    }

    // Calculate copy counts and apply status filter
    let booksWithCopies = (books || []).map((book: any) => {
        const copies = book.physical_book_copies || [];
        const totalCopies = copies.length;
        const availableCopies = copies.filter((c: any) => c.status === 'available').length;
        const borrowedCopies = copies.filter((c: any) => c.status === 'borrowed').length;
        const lostCopies = copies.filter((c: any) => c.status === 'lost').length;
        const damagedCopies = copies.filter((c: any) => c.status === 'damaged').length;

        return {
            ...book,
            totalCopies,
            availableCopies,
            borrowedCopies,
            lostCopies,
            damagedCopies,
            copies
        };
    });

    // Apply status filter (client-side since it's based on copies)
    if (status === 'available') {
        booksWithCopies = booksWithCopies.filter(book => book.availableCopies > 0);
    } else if (status === 'borrowed') {
        booksWithCopies = booksWithCopies.filter(book => book.borrowedCopies > 0);
    } else if (status === 'lost') {
        booksWithCopies = booksWithCopies.filter(book => book.lostCopies > 0);
    } else if (status === 'damaged') {
        booksWithCopies = booksWithCopies.filter(book => book.damagedCopies > 0);
    }

    // Sort by copies if needed (client-side)
    if (sort === 'copies') {
        booksWithCopies.sort((a, b) => b.totalCopies - a.totalCopies);
    }

    // Get unique categories for filter
    const { data: allBooks } = await supabaseAdmin
        .from('books')
        .select('category')
        .in('book_type', ['offline', 'both'])
        .not('category', 'is', null);

    const categories = [...new Set((allBooks || []).map((b: any) => b.category))].filter(Boolean).sort() as string[];

    console.log('📚 Total offline books for categories:', allBooks?.length);
    console.log('📂 Unique categories:', categories);

    return {
        books: booksWithCopies,
        totalBooks: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        categories
    };
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OfflineBooksPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search as string | undefined;
    const category = params?.category as string | undefined;
    const status = params?.status as string | undefined;
    const sort = params?.sort as string | undefined;

    const { books, totalBooks, totalPages, categories } = await getOfflineBooks({
        page,
        limit: 10,
        search,
        category,
        status,
        sort
    });

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

            {/* Search & Filters */}
            <BooksSearch
                categories={categories}
                showStatusFilter={true}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Jami Kitoblar</p>
                    <p className="text-3xl font-bold mt-1">{totalBooks}</p>
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
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Yo'qolgan</p>
                    <p className="text-3xl font-bold mt-1 text-red-500">
                        {books.reduce((sum, book) => sum + book.lostCopies, 0)}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Shikastlangan</p>
                    <p className="text-3xl font-bold mt-1 text-yellow-500">
                        {books.reduce((sum, book) => sum + book.damagedCopies, 0)}
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
                    <>
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between p-4 border-t border-border">
                                <p className="text-sm text-muted-foreground">
                                    Jami {totalBooks} kitob, {page}-sahifa / {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    {page > 1 && (
                                        <Link
                                            href={`/admin/books/offline?page=${page - 1}`}
                                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                        >
                                            ← Oldingi
                                        </Link>
                                    )}
                                    {page < totalPages && (
                                        <Link
                                            href={`/admin/books/offline?page=${page + 1}`}
                                            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                                        >
                                            Keyingi →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
