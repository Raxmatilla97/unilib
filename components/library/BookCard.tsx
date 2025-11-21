import Link from 'next/link';
import { Star, BookOpen } from 'lucide-react';

interface BookCardProps {
    id: string;
    title: string;
    author: string;
    rating: number;
    coverColor: string;
    category: string;
}

export function BookCard({ id, title, author, rating, coverColor, category }: BookCardProps) {
    return (
        <Link href={`/library/${id}`} className="group block">
            <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`h-48 ${coverColor} relative p-4 flex items-end`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                    <span className="relative z-10 text-xs font-medium text-white bg-black/30 px-2 py-1 rounded backdrop-blur-md">
                        {category}
                    </span>
                </div>
                <div className="p-4">
                    <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{author}</p>
                    <div className="flex items-center justify-between">
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
