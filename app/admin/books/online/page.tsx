import { supabaseAdmin } from '@/lib/supabase/admin';
import { BooksTable } from '@/components/admin/BooksTable';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';
import { BooksSearch } from '@/components/admin/BooksSearch';

export const dynamic = 'force-dynamic';

interface GetBooksParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
}

async function getBooks({
    page = 1,
    limit = 10,
    search,
    category,
    sort = 'created_at'
}: GetBooksParams = {}) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build count query
    let countQuery = supabaseAdmin
        .from('books')
        .select('*', { count: 'exact', head: true })
        .in('book_type', ['online', 'both']);

    // Apply filters to count
    if (search) {
        countQuery = countQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }
    if (category) {
        countQuery = countQuery.eq('category', category);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
        console.error('Error fetching books count:', countError);
        return { books: [], totalBooks: 0, totalPages: 0, categories: [] };
    }

    // Build main query
    let booksQuery = supabaseAdmin
        .from('books')
        .select('id, title, author, category, rating, cover_color, cover_url, created_at')
        .in('book_type', ['online', 'both']);

    // Apply filters
    if (search) {
        booksQuery = booksQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }
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
        case 'rating':
            booksQuery = booksQuery.order('rating', { ascending: false });
            break;
        default:
            booksQuery = booksQuery.order('created_at', { ascending: false });
    }

    booksQuery = booksQuery.range(from, to);

    const { data: books, error } = await booksQuery;

    if (error) {
        console.error('Error fetching books:', error);
        return { books: [], totalBooks: 0, totalPages: 0, categories: [] };
    }

    // Get unique categories
    const { data: allBooks } = await supabaseAdmin
        .from('books')
        .select('category')
        .in('book_type', ['online', 'both']);

    const categories = [...new Set((allBooks || []).map((b: any) => b.category))].filter(Boolean) as string[];

    return {
        books: books || [],
        totalBooks: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        categories
    };
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OnlineBooksPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const search = params?.search as string | undefined;
    const category = params?.category as string | undefined;
    const sort = params?.sort as string | undefined;

    const { books, totalBooks, totalPages, categories } = await getBooks({
        page,
        limit: 10,
        search,
        category,
        sort
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BookOpen className="w-8 h-8 text-primary" />
                        Online Kitoblar
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Raqamli kitoblar (PDF/EPUB) boshqaruvi
                    </p>
                </div>
                <Link
                    href="/admin/books/create"
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-5 h-5" />
                    Yangi Online Kitob
                </Link>
            </div>

            {/* Search & Filters */}
            <BooksSearch
                categories={categories}
                showStatusFilter={false}
            />

            <BooksTable
                books={books}
                page={page}
                totalPages={totalPages}
                totalBooks={totalBooks}
            />
        </div>
    );
}
