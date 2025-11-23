"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LibraryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [rating, setRating] = useState(searchParams.get('rating') || 'all');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search });
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset to page 1 when filters change
        params.delete('page');

        router.push(`/library?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('all');
        setRating('all');
        setSort('newest');
        router.push('/library');
    };

    const hasActiveFilters = search || category !== 'all' || rating !== 'all' || sort !== 'newest';

    return (
        <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Kitob yoki muallif qidiring..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl bg-muted/50 border border-border focus:border-primary focus:bg-background transition-all outline-none text-foreground placeholder:text-muted-foreground"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 md:gap-3 items-center">
                {/* Category Filter */}
                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        updateFilters({ category: e.target.value });
                    }}
                    className="col-span-2 sm:col-span-1 w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 text-sm rounded-lg bg-card border border-border focus:border-primary outline-none cursor-pointer min-h-[44px]"
                >
                    <option value="all">Barcha kategoriyalar</option>
                    <option value="Programming">Dasturlash</option>
                    <option value="Science">Fan</option>
                    <option value="Mathematics">Matematika</option>
                    <option value="Literature">Adabiyot</option>
                    <option value="History">Tarix</option>
                    <option value="Philosophy">Falsafa</option>
                    <option value="Physics">Fizika</option>
                    <option value="Chemistry">Kimyo</option>
                    <option value="Biology">Biologiya</option>
                    <option value="Economics">Iqtisod</option>
                    <option value="Psychology">Psixologiya</option>
                </select>

                {/* Rating Filter */}
                <select
                    value={rating}
                    onChange={(e) => {
                        setRating(e.target.value);
                        updateFilters({ rating: e.target.value });
                    }}
                    className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 text-sm rounded-lg bg-card border border-border focus:border-primary outline-none cursor-pointer min-h-[44px]"
                >
                    <option value="all">Barcha reytinglar</option>
                    <option value="4">4+ ⭐</option>
                    <option value="3">3+ ⭐</option>
                </select>

                {/* Sort */}
                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        updateFilters({ sort: e.target.value });
                    }}
                    className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 text-sm rounded-lg bg-card border border-border focus:border-primary outline-none cursor-pointer min-h-[44px]"
                >
                    <option value="newest">Yangi qo'shilganlar</option>
                    <option value="rating">Yuqori rating</option>
                    <option value="title">A-Z</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="col-span-2 sm:col-span-1 w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        <X className="w-4 h-4" />
                        Tozalash
                    </button>
                )}
            </div>
        </div>
    );
}
