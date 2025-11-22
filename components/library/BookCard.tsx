import Link from 'next/link';
import { Star, BookOpen } from 'lucide-react';

interface BookCardProps {
    id: string;
    title: string;
    author: string;
    rating: number;
    coverColor: string;
    category: string;
    cover_url?: string;
}

export function BookCard({ id, title, author, rating, coverColor, category, cover_url }: BookCardProps) {
    return (
        <Link href={`/library/${id}`} className="group block h-full">
            <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className={`h-80 ${coverColor} relative flex items-center justify-center overflow-hidden`}>
                    {cover_url ? (
                        <img
                            src={cover_url}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    )}
                    <span className="absolute bottom-3 left-3 z-10 text-xs font-medium text-white bg-black/30 px-2 py-1 rounded backdrop-blur-md">
                        {category}
                    </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors" title={title}>{title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-1" title={author}>{author}</p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {rating}
                        </div>
                        <div className="p-1.5 rounded-full bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <BookOpen className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
