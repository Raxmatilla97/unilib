"use client";

import { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface BooksSearchProps {
    categories?: string[];
    showStatusFilter?: boolean;
}

export function BooksSearch({ categories = [], showStatusFilter = false }: BooksSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
    const [showFilters, setShowFilters] = useState(false);

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedStatus) params.set('status', selectedStatus);
        if (sortBy && sortBy !== 'created_at') params.set('sort', sortBy);

        router.push(`?${params.toString()}`);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('');
        setSelectedStatus('');
        setSortBy('created_at');
        router.push('?');
    };

    const hasActiveFilters = searchQuery || selectedCategory || selectedStatus || sortBy !== 'created_at';

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Kitob nomi yoki muallif bo'yicha qidirish..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-primary transition-colors bg-background"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 border-2 rounded-lg transition-all flex items-center gap-2 ${showFilters || hasActiveFilters
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary'
                        }`}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    <span className="hidden md:inline">Filtrlar</span>
                    {hasActiveFilters && (
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                    )}
                </button>
                <button
                    onClick={applyFilters}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                    Qidirish
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-muted/30 border-2 border-border rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Category Filter */}
                        {categories.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Kategoriya
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-primary bg-background"
                                >
                                    <option value="">Barchasi</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Status Filter */}
                        {showStatusFilter && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Holat
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-primary bg-background"
                                >
                                    <option value="">Barchasi</option>
                                    <option value="available">Mavjud</option>
                                    <option value="borrowed">Qarzda</option>
                                </select>
                            </div>
                        )}

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Saralash
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-border rounded-lg focus:outline-none focus:border-primary bg-background"
                            >
                                <option value="created_at">Yangi qo'shilganlar</option>
                                <option value="title">Nomi (A-Z)</option>
                                <option value="author">Muallif (A-Z)</option>
                                <option value="copies">Nusxalar soni</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border-2 border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Tozalash
                            </button>
                        )}
                        <button
                            onClick={applyFilters}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Qo'llash
                        </button>
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && !showFilters && (
                <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                            <span>Qidiruv: "{searchQuery}"</span>
                            <button onClick={() => { setSearchQuery(''); applyFilters(); }}>
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    {selectedCategory && (
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                            <span>Kategoriya: {selectedCategory}</span>
                            <button onClick={() => { setSelectedCategory(''); applyFilters(); }}>
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                    {selectedStatus && (
                        <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                            <span>Holat: {selectedStatus === 'available' ? 'Mavjud' : 'Qarzda'}</span>
                            <button onClick={() => { setSelectedStatus(''); applyFilters(); }}>
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
