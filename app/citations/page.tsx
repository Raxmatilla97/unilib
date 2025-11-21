"use client";

import { useState } from 'react';
import { CitationForm } from '@/components/citations/CitationForm';
import { CitationOutput } from '@/components/citations/CitationOutput';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { generateCitation, BookMetadata, CitationFormat } from '@/utils/citationGenerator';
import { Quote, History } from 'lucide-react';

export default function CitationsPage() {
    const [citation, setCitation] = useState('');
    const [format, setFormat] = useState<CitationFormat>('APA');
    const [lastBook, setLastBook] = useState<BookMetadata | null>(null);

    const handleGenerate = (book: BookMetadata) => {
        setLastBook(book);
        setCitation(generateCitation(book, format));
    };

    const handleFormatChange = (newFormat: CitationFormat) => {
        setFormat(newFormat);
        if (lastBook) {
            setCitation(generateCitation(lastBook, newFormat));
        }
    };

    return (
        <ProtectedRoute>
            <div className="container py-10 px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                            <Quote className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Citation Generator</h1>
                        <p className="text-muted-foreground">Create perfect citations in seconds. Supports APA, MLA, Chicago, and Harvard.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                                <h2 className="font-bold mb-6">Enter Book Details</h2>
                                <CitationForm onGenerate={handleGenerate} />
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="sticky top-24">
                                <h2 className="font-bold mb-4">Result</h2>
                                {citation ? (
                                    <CitationOutput
                                        citation={citation}
                                        format={format}
                                        onFormatChange={handleFormatChange}
                                    />
                                ) : (
                                    <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-8 text-center text-muted-foreground">
                                        <p>Fill out the form to generate a citation.</p>
                                    </div>
                                )}

                                <div className="mt-8">
                                    <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
                                        <History className="w-4 h-4" />
                                        Recent Citations
                                    </h3>
                                    <div className="space-y-3 opacity-60">
                                        <div className="text-xs p-3 bg-muted rounded-lg border border-border truncate">
                                            Cormen, T. H. (2009). Introduction to Algorithms...
                                        </div>
                                        <div className="text-xs p-3 bg-muted rounded-lg border border-border truncate">
                                            Hunt, A. (1999). The Pragmatic Programmer...
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
