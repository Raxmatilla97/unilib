import Link from 'next/link';
import { BookCard } from '@/components/library/BookCard';
import { LibraryFilters } from '@/components/library/LibraryFilters';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        .select('id, title, author, rating, cover_color, category, cover_url');

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
        <div className="container py-6 md:py-10 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">Kutubxona</h1>
                <p className="text-sm md:text-base text-muted-foreground">{totalBooks} ta kitob</p>
            </div>

            {/* Filters */}
            <LibraryFilters />

            {books.length === 0 ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <p className="text-muted-foreground">Hech qanday kitob topilmadi.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6 md:mt-8">
                            <Link
                                href={`/library?page=${page - 1}`}
                                className={`flex items-center justify-center gap-1 px-3 md:px-4 py-2 rounded-lg border transition-colors min-h-[40px] ${page <= 1
                                    ? 'pointer-events-none opacity-50 border-border bg-muted'
                                    : 'border-border hover:bg-muted'
                                    }`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Oldingi</span>
                            </Link>

                            <div className="flex items-center gap-1 md:gap-2">
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
                                            className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg border transition-colors text-sm md:text-base ${page === pageNum
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'border-border hover:bg-muted'
                                                }`}
                                        >
                                            {pageNum}
                                        </Link>
                                    );
                                })}
                            </div>

                            <Link
                                href={`/library?page=${page + 1}`}
                                className={`flex items-center justify-center gap-1 px-3 md:px-4 py-2 rounded-lg border transition-colors min-h-[40px] ${page >= totalPages
                                    ? 'pointer-events-none opacity-50 border-border bg-muted'
                                    : 'border-border hover:bg-muted'
                                    }`}
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Keyingi</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
