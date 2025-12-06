import Image from 'next/image';
import Link from 'next/link';
import { Star, BookOpen, Eye } from 'lucide-react';

interface BookCardProps {
    id: string;
    title: string;
    author: string;
    rating: number;
    coverColor: string;
    category: string;
    cover_url?: string;
    readersCount?: number;
    views_count?: number;
}

export function BookCard({ id, title, author, rating, coverColor, category, cover_url, readersCount, views_count }: BookCardProps) {
    return (
        <Link href={`/library/${id}`} className="group block h-full">
            <div className="relative h-full flex flex-col bg-background/40 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300">
                {/* Cover Image */}
                <div className={`aspect-[2/3] ${coverColor} relative overflow-hidden`}>
                    {cover_url ? (
                        <Image
                            src={cover_url}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                        {category}
                    </span>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-[2px]">
                        <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                            O'qish
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors" title={title}>
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1 font-medium" title={author}>
                        {author}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{rating}</span>
                            </div>
                            {views_count !== undefined && views_count > 0 && (
                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium" title={`${views_count} marta ko'rilgan`}>
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{views_count}</span>
                                </div>
                            )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <BookOpen className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
