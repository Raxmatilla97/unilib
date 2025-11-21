import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, Search } from 'lucide-react';

export default async function ReaderPage({ params }: { params: { id: string } }) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let book = null;

    try {
        const { data, error } = await supabase
            .from('books')
            .select('*')
            .eq('id', params.id)
            .single();

        if (data) {
            book = data;
        }
    } catch (error) {
        console.error('Error fetching book:', error);
    }

    // Fallback if book not found
    const bookTitle = book?.title || 'Introduction to Algorithms - 3rd Edition';

    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-background text-foreground">
                {/* Reader Header */}
                <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <Link href={`/library/${params.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-medium text-sm truncate max-w-[200px] md:max-w-md">
                            {bookTitle}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono text-muted-foreground">100%</span>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border mx-2" />
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                            <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar (Thumbnails) */}
                    <div className="hidden md:flex w-64 border-r border-border flex-col overflow-y-auto bg-card/30">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => (
                            <div key={page} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/50">
                                <div className="aspect-[3/4] bg-background rounded mb-2 border border-border shadow-sm" />
                                <div className="text-center text-xs text-muted-foreground">Page {page}</div>
                            </div>
                        ))}
                    </div>

                    {/* PDF View Area */}
                    <div className="flex-1 bg-background/50 flex items-center justify-center overflow-auto p-8">
                        <div className="w-full max-w-3xl aspect-[3/4] bg-card text-card-foreground p-12 shadow-2xl relative border border-border/50">
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-5 pointer-events-none">
                                <div className="text-9xl font-bold -rotate-45 text-foreground">PREVIEW</div>
                            </div>
                            <h2 className="text-4xl font-bold mb-8 text-center mt-20">Chapter 1: The Role of Algorithms in Computing</h2>
                            <div className="space-y-4 text-justify font-serif leading-relaxed text-card-foreground/90">
                                <p>
                                    What are algorithms? Why is the study of algorithms worthwhile? What is the role
                                    of algorithms relative to other technologies used in computers? In this chapter,
                                    we will answer these questions.
                                </p>
                                <p>
                                    Informally, an algorithm is any well-defined computational procedure that takes
                                    some value, or set of values, as input and produces some value, or set of values,
                                    as output. An algorithm is thus a sequence of computational steps that transform
                                    the input into the output.
                                </p>
                                <p>
                                    We can also view an algorithm as a tool for solving a well-specified computational
                                    problem. The statement of the problem specifies in general terms the desired
                                    input/output relationship. The algorithm describes a specific computational
                                    procedure for achieving that input/output relationship.
                                </p>
                            </div>
                            <div className="absolute bottom-8 left-0 w-full text-center text-sm text-muted-foreground">
                                Page 5
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="h-12 border-t border-border flex items-center justify-center gap-4 bg-card/50 backdrop-blur-sm">
                    <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-muted-foreground">Page 5 of 1312</span>
                    <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
