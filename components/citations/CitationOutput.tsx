"use client";

import { useState } from 'react';
import { Copy, Check, Quote } from 'lucide-react';
import { CitationFormat } from '@/utils/citationGenerator';
import { cn } from '@/lib/utils';

interface CitationOutputProps {
    citation: string;
    format: CitationFormat;
    onFormatChange: (format: CitationFormat) => void;
}

export function CitationOutput({ citation, format, onFormatChange }: CitationOutputProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(citation);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!citation) return null;

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg animate-fade-in">
            <div className="flex border-b border-border bg-muted/30">
                {(['APA', 'MLA', 'Chicago', 'Harvard'] as CitationFormat[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => onFormatChange(f)}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            format === f
                                ? "bg-background text-primary border-b-2 border-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="p-6">
                <div className="relative bg-muted/30 p-6 rounded-xl border border-dashed border-border">
                    <Quote className="absolute top-4 left-4 w-6 h-6 text-primary/20" />
                    <p className="text-lg font-serif pl-8 pr-12 break-words">
                        {citation}
                    </p>
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-background transition-colors text-muted-foreground hover:text-primary"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                    Always double-check citations against your institution's guidelines.
                </p>
            </div>
        </div>
    );
}
