import Link from 'next/link';
import { Star, BookOpen, ArrowRight, Eye } from 'lucide-react';
import Image from 'next/image';

interface Book {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
    views_count: number;
}

interface FeaturedBooksProps {
    books: Book[];
}

export function FeaturedBooks({ books }: FeaturedBooksProps) {
    // Take only first 8 books
    const displayBooks = books.slice(0, 8);

    // Enhanced gradient colors for book covers
    const gradients = [
        { from: 'from-blue-500', to: 'to-indigo-600', accent: 'bg-blue-500' },
        { from: 'from-emerald-500', to: 'to-teal-600', accent: 'bg-emerald-500' },
        { from: 'from-violet-500', to: 'to-purple-600', accent: 'bg-violet-500' },
        { from: 'from-amber-500', to: 'to-orange-600', accent: 'bg-amber-500' },
        { from: 'from-rose-500', to: 'to-pink-600', accent: 'bg-rose-500' },
        { from: 'from-cyan-500', to: 'to-blue-600', accent: 'bg-cyan-500' },
        { from: 'from-lime-500', to: 'to-green-600', accent: 'bg-lime-500' },
        { from: 'from-fuchsia-500', to: 'to-purple-600', accent: 'bg-fuchsia-500' },
    ];

    return (
        <section className="py-24 md:py-32 overflow-hidden">
            <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase tracking-wider text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            Tavsiya Etamiz
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold">Eng koʻp oʻqilganlar</h2>
                    </div>
                    <Link href="/library" className="px-6 py-3 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors font-medium flex items-center gap-2 group bg-background">
                        Barcha kitoblar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {displayBooks.map((book, i) => {
                        const gradient = gradients[i % gradients.length];
                        return (
                            <Link key={book.id} href={`/library/${book.id}`} className="group block">
                                <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-4 relative shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 border border-border/50">
                                    {book.cover_url ? (
                                        <Image
                                            src={book.cover_url}
                                            alt={book.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <>
                                            <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to}`} />
                                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
                                            {/* Decorative Elements */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl" />
                                        </>
                                    )}

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                                        {/* Top Badge - Views */}
                                        <div className="flex justify-end">
                                            <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-lg border border-white/20">
                                                <Eye className="w-3.5 h-3.5 text-white" />
                                                <span className="text-white">{book.views_count.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Bottom Content */}
                                        <div>
                                            <div className="mb-3">
                                                <BookOpen className="w-10 h-10 opacity-90 drop-shadow-lg" />
                                            </div>
                                            <h3 className="font-bold leading-tight mb-2 text-lg line-clamp-2 drop-shadow-lg">
                                                {book.title}
                                            </h3>
                                            <p className="text-sm opacity-95 font-medium drop-shadow-md line-clamp-1">
                                                {book.author}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
