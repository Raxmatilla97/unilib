import Link from 'next/link';
import { BookCard } from '@/components/library/BookCard';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export const revalidate = 60; // Cache for 60 seconds

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getBooks(
    page: number = 1,
    limit: number = 12,
    search?: string,
    category?: string,
    minRating?: number,
    sortBy: string = 'newest'
) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query with filters
    let booksQuery = supabaseAdmin
        .from('books')
        .select('id, title, author, rating, cover_color, category, cover_url, views_count, physical_book_copies(id)');

    // Apply search filter
    if (search && search.trim()) {
        booksQuery = booksQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }

    // Apply category filter
    if (category && category !== 'all') {
        booksQuery = booksQuery.eq('category', category);
    }

    // Apply rating filter
    if (minRating && minRating > 0) {
        booksQuery = booksQuery.gte('rating', minRating);
    }

    // Apply sorting
    switch (sortBy) {
        case 'rating':
            booksQuery = booksQuery.order('rating', { ascending: false });
            break;
        case 'title':
            booksQuery = booksQuery.order('title', { ascending: true });
            break;
        case 'newest':
        default:
            booksQuery = booksQuery.order('created_at', { ascending: false });
            break;
    }

    // Get total count with same filters
    let countQuery = supabaseAdmin
        .from('books')
        .select('*', { count: 'exact', head: true });

    if (search && search.trim()) {
        countQuery = countQuery.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
    }
    if (category && category !== 'all') {
        countQuery = countQuery.eq('category', category);
    }
    if (minRating && minRating > 0) {
        countQuery = countQuery.gte('rating', minRating);
    }

    const [booksResponse, countResponse] = await Promise.all([
        booksQuery.range(from, to),
        countQuery
    ]);

    const books = booksResponse.data || [];
    const totalBooks = countResponse.count || 0;
    const totalPages = Math.ceil(totalBooks / limit);

    // Get reader counts for current page books
    if (books.length > 0) {
        const bookIds = books.map(b => b.id);
        const { data: progressData } = await supabaseAdmin
            .from('user_progress')
            .select('book_id')
            .in('book_id', bookIds)
            .gt('progress_percentage', 0)
            .lt('progress_percentage', 100);

        // Count readers per book
        const readerCounts: Record<string, number> = {};
        progressData?.forEach((p: any) => {
            readerCounts[p.book_id] = (readerCounts[p.book_id] || 0) + 1;
        });

        // Add reader count to each book
        const booksWithReaders = books.map(book => ({
            ...book,
            readersCount: readerCounts[book.id] || 0
        }));

        return { books: booksWithReaders, totalBooks, totalPages };
    }

    return { books, totalBooks, totalPages };
}

export default async function LibraryPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const limit = 12;

    // Extract filter params
    const search = params?.search as string | undefined;
    const category = params?.category as string | undefined;
    const minRating = params?.rating ? Number(params.rating) : undefined;
    const sortBy = (params?.sort as string) || 'newest';

    const { books, totalBooks, totalPages } = await getBooks(
        page,
        limit,
        search,
        category,
        minRating,
        sortBy
    );

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

            <div className="container relative z-10 py-12 md:py-20 px-4 md:px-6">
                <div className="flex flex-col gap-4 mb-12 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        Kutubxona
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {totalBooks} ta kitob va qo'llanmalar sizni kutmoqda.
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-10">
                    <LibraryFilters />
                </div>

                {books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-8 rounded-3xl bg-muted/20 border border-border/50">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Hech qanday kitob topilmadi</h3>
                        <p className="text-muted-foreground">Qidiruv so'zini o'zgartirib yoki filtrlarni tozalab ko'ring.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {books.map((book: any) => (
                                <BookCard
                                    key={book.id}
                                    id={book.id}
                                    title={book.title}
                                    author={book.author}
                                    rating={book.rating}
                                    coverColor={book.cover_color || 'bg-blue-500'}
                                    category={book.category}
                                    cover_url={book.cover_url}
                                    readersCount={book.readersCount}
                                    views_count={book.views_count}
                                    hasPhysicalCopy={book.physical_book_copies && book.physical_book_copies.length > 0}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16">
                                <Link
                                    href={`/library?page=${page - 1}`}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${page <= 1
                                        ? 'pointer-events-none opacity-50 bg-muted text-muted-foreground'
                                        : 'bg-card border border-border hover:border-primary/50 hover:shadow-lg'
                                        }`}
                                    aria-label="Previous page"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">Oldingi</span>
                                </Link>

                                <div className="flex items-center gap-2 px-4">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }

                                        return (
                                            <Link
                                                key={pageNum}
                                                href={`/library?page=${pageNum}`}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${page === pageNum
                                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110'
                                                    : 'bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                {pageNum}
                                            </Link>
                                        );
                                    })}
                                </div>

                                <Link
                                    href={`/library?page=${page + 1}`}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${page >= totalPages
                                        ? 'pointer-events-none opacity-50 bg-muted text-muted-foreground'
                                        : 'bg-card border border-border hover:border-primary/50 hover:shadow-lg'
                                        }`}
                                    aria-label="Next page"
                                >
                                    <span className="hidden sm:inline">Keyingi</span>
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
