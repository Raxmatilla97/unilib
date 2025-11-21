"use client";

import { useState } from 'react';
import { BookMetadata } from '@/utils/citationGenerator';

interface CitationFormProps {
    onGenerate: (data: BookMetadata) => void;
}

export function CitationForm({ onGenerate }: CitationFormProps) {
    const [formData, setFormData] = useState<BookMetadata>({
        title: '',
        authorFirst: '',
        authorLast: '',
        year: '',
        publisher: '',
        city: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input
                        name="authorFirst"
                        value={formData.authorFirst}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="John"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                        name="authorLast"
                        value={formData.authorLast}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Doe"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Book Title</label>
                <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="The Art of Computer Programming"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Year</label>
                    <input
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="2024"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Publisher</label>
                    <input
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="MIT Press"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">City (Optional)</label>
                    <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full p-2 rounded-lg bg-background border border-input focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Cambridge"
                    />
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/25">
                Generate Citation
            </button>
        </form>
    );
}
