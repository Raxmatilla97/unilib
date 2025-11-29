'use client';

import { Search } from 'lucide-react';
import { FormEvent } from 'react';

export function SimpleSearchBar({ className = '' }: { className?: string }) {
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('search');
        if (query) {
            window.location.href = `/library?search=${encodeURIComponent(query.toString())}`;
        }
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="relative">
                <input
                    type="text"
                    name="search"
                    placeholder="Kitob, muallif yoki mavzu bo'yicha qidiring..."
                    className="w-full px-6 py-4 pr-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-lg"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    <Search className="w-5 h-5" />
                </button>
            </div>
        </form>
    );
}
