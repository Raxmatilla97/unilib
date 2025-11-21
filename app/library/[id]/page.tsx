import Link from 'next/link';
import { Star, BookOpen, Download, Quote, Share2, ArrowLeft } from 'lucide-react';
import { BookCard } from '@/components/library/BookCard';

export default function BookDetailPage({ params }: { params: { id: string } }) {
    return (
        <div className="container py-10 px-4 md:px-6">
            <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Catalog
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                {/* Book Cover */}
                <div className="md:col-span-1">
                    <div className="aspect-[2/3] bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-2xl relative flex items-center justify-center p-8">
                        <div className="text-center text-white">
                            <h1 className="text-3xl font-bold font-serif mb-2">Introduction to Algorithms</h1>
                            <p className="text-lg opacity-90">Thomas H. Cormen</p>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                            3rd Edition
                        </div>
                    </div>
                </div>

                {/* Book Info */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">Computer Science</span>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                <Star className="w-3 h-3 fill-amber-500" />
                                4.9 (1,240 reviews)
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Introduction to Algorithms</h1>
                        <p className="text-xl text-muted-foreground">by Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/reader/1" className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25">
                            <BookOpen className="w-5 h-5" />
                            Read Online
                        </Link>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors border border-border">
                            <Download className="w-5 h-5" />
                            Download PDF
                        </button>
                        <button className="p-3 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                            <Quote className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-lg font-bold mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            This title covers a broad range of algorithms in depth, yet makes their design and analysis accessible to all levels of readers. Each chapter is relatively self-contained and can be used as a unit of study. The algorithms are described in English and in a pseudocode designed to be readable by anyone who has done a little programming.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
                        <div>
                            <div className="text-sm text-muted-foreground">Publisher</div>
                            <div className="font-medium">MIT Press</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Year</div>
                            <div className="font-medium">2009</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Pages</div>
                            <div className="font-medium">1312</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">ISBN</div>
                            <div className="font-medium">978-0262033848</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Books */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Similar Books</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { id: '2', title: 'Clean Code', author: 'Robert C. Martin', rating: 4.8, coverColor: 'bg-blue-500', category: 'Software Engineering' },
                        { id: '3', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', rating: 4.9, coverColor: 'bg-emerald-500', category: 'Career' },
                        { id: '4', title: 'Design Patterns', author: 'Erich Gamma', rating: 4.7, coverColor: 'bg-purple-500', category: 'Architecture' },
                        { id: '5', title: 'Structure and Interpretation', author: 'Harold Abelson', rating: 4.9, coverColor: 'bg-indigo-500', category: 'Computer Science' },
                    ].map((book) => (
                        <BookCard key={book.id} {...book} />
                    ))}
                </div>
            </div>
        </div>
    );
}
