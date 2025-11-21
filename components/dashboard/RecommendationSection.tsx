import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function RecommendationSection() {
    const recommendations = [
        { title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', match: '98%' },
        { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', category: 'Career', match: '95%' },
        { title: 'Design Patterns', author: 'Erich Gamma', category: 'Architecture', match: '92%' },
    ];

    return (
        <div className="space-y-4">
            {recommendations.map((book, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-muted rounded-md shadow-sm group-hover:shadow-md transition-shadow" />
                        <div>
                            <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{book.title}</h4>
                            <p className="text-xs text-muted-foreground">{book.author}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{book.category}</span>
                                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                                    <Sparkles className="w-3 h-3" />
                                    {book.match} Match
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            ))}

            <Link href="/library" className="block text-center text-sm text-primary hover:underline mt-2">
                View all recommendations
            </Link>
        </div>
    );
}
