"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Globe } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface LibraryFiltersProps {
    categories: string[];
}

export function LibraryFilters({ categories }: LibraryFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [rating, setRating] = useState(searchParams.get('rating') || 'all');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    // ✅ Online books filter - default disabled to show all books
    const [onlineOnly, setOnlineOnly] = useState(searchParams.get('online') === 'true');

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
        setOnlineOnly(false); // Reset to show all books
        router.push('/library');
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
                <CustomSelect
                    value={category}
                    onChange={(value) => {
                        setCategory(value);
                        updateFilters({ category: value });
                    }}
                    options={[
                        { value: 'all', label: "Barcha yo'nalishlar" },
                        ...categories.map(cat => ({ value: cat, label: cat }))
                    ]}
                    placeholder="Barcha yo'nalishlar"
                    className="min-w-[180px]"
                />

                {/* Rating Filter */}
                <CustomSelect
                    value={rating}
                    onChange={(value) => {
                        setRating(value);
                        updateFilters({ rating: value });
                    }}
                    options={[
                        { value: 'all', label: 'Barcha reytinglar' },
                        { value: '5', label: '⭐⭐⭐⭐⭐ 5 yulduz' },
                        { value: '4', label: '⭐⭐⭐⭐ 4+ yulduz' },
                        { value: '3', label: '⭐⭐⭐ 3+ yulduz' },
                        { value: '2', label: '⭐⭐ 2+ yulduz' }
                    ]}
                    placeholder="Reyting"
                />

                {/* Sort */}
                <CustomSelect
                    value={sort}
                    onChange={(value) => {
                        setSort(value);
                        updateFilters({ sort: value });
                    }}
                    options={[
                        { value: 'newest', label: 'Eng yangi' },
                        { value: 'oldest', label: 'Eng eski' },
                        { value: 'rating', label: 'Yuqori reyting' },
                        { value: 'title-asc', label: 'A-Z' },
                        { value: 'title-desc', label: 'Z-A' }
                    ]}
                    placeholder="Saralash"
                />

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
