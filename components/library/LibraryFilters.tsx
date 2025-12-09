"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Globe } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export function LibraryFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [rating, setRating] = useState(searchParams.get('rating') || 'all');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    // ✅ Online books filter - default enabled
    const [onlineOnly, setOnlineOnly] = useState(searchParams.get('online') !== 'false');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFilters({ search });
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const updateFilters = useCallback((updates: Record<string, string>) => {
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
    }, [searchParams, router]);

    const clearFilters = useCallback(() => {
        setSearch('');
        setCategory('all');
        setRating('all');
        setSort('newest');
        setOnlineOnly(true); // Keep online filter on
        router.push('/library?online=true');
    }, [router]);

    const toggleOnlineOnly = useCallback(() => {
        const newValue = !onlineOnly;
        setOnlineOnly(newValue);
        updateFilters({ online: newValue ? 'true' : 'false' });
    }, [onlineOnly, updateFilters]);

    const hasActiveFilters = search || category !== 'all' || rating !== 'all' || sort !== 'newest';

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <div className="relative flex items-center bg-background/50 backdrop-blur-xl border border-border rounded-2xl shadow-sm focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Kitob nomi, muallif yoki kalit so'z..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-12 py-4 text-base bg-transparent border-none outline-none placeholder:text-muted-foreground/70"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                        >
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
                {/* ✅ Online Books Toggle - Prominent */}
                <button
                    onClick={toggleOnlineOnly}
                    className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 ${onlineOnly
                            ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                            : 'bg-background/50 backdrop-blur-md border border-border hover:border-primary/50'
                        }`}
                >
                    <Globe className="w-4 h-4" />
                    Faqat Online Kitoblar
                    {onlineOnly && (
                        <span className="ml-1 w-2 h-2 bg-primary-foreground rounded-full animate-pulse"></span>
                    )}
                </button>

                {/* Category Filter */}
                <div className="relative group">
                    <select
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            updateFilters({ category: e.target.value });
                        }}
                        className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 focus:border-primary outline-none cursor-pointer transition-all shadow-sm text-sm font-medium min-w-[180px]"
                    >
                        <option value="all">Barcha yo'nalishlar</option>
                        <option value="Kompyuter Ilmlari">Kompyuter Ilmlari</option>
                        <option value="Matematika">Matematika</option>
                        <option value="Fizika">Fizika</option>
                        <option value="Iqtisodiyot">Iqtisodiyot</option>
                        <option value="Psixologiya">Psixologiya</option>
                        <option value="Adabiyot">Adabiyot</option>
                        <option value="Tarix">Tarix</option>
                        <option value="Biologiya">Biologiya</option>
                        <option value="Muhandislik">Muhandislik</option>
                        <option value="Falsafa">Falsafa</option>
                        <option value="San'at">San'at</option>
                        <option value="Biznes">Biznes</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="relative group">
                    <select
                        value={rating}
                        onChange={(e) => {
                            setRating(e.target.value);
                            updateFilters({ rating: e.target.value });
                        }}
                        className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 focus:border-primary outline-none cursor-pointer transition-all shadow-sm text-sm font-medium"
                    >
                        <option value="all">Reyting</option>
                        <option value="4">4+ Yulduz</option>
                        <option value="3">3+ Yulduz</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Sort */}
                <div className="relative group">
                    <select
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            updateFilters({ sort: e.target.value });
                        }}
                        className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-background/50 backdrop-blur-md border border-border hover:border-primary/50 focus:border-primary outline-none cursor-pointer transition-all shadow-sm text-sm font-medium"
                    >
                        <option value="newest">Eng yangilar</option>
                        <option value="rating">Yuqori reyting</option>
                        <option value="title">A-Z</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium transition-all flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Tozalash
                    </button>
                )}
            </div>
        </div>
    );
}
