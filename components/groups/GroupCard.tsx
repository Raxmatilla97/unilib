import Link from 'next/link';
import { Users, MessageCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GroupCardProps {
    id: string;
    name: string;
    book: string;
    members: number;
    active: boolean;
    tags: string[];
}

export function GroupCard({ id, name, book, members, active, tags }: GroupCardProps) {
    return (
        <Link href={`/groups/${id}`} className="block group">
            <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                    {active && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Now
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <BookOpen className="w-4 h-4" />
                    <span className="line-clamp-1">{book}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                                {String.fromCharCode(65 + i)}
                            </div>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{members - 3}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
