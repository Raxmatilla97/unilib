"use client";

import { useState } from 'react';
import { Search, Sparkles, Mic, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AISearchBar({ className }: { className?: string }) {
    const [isFocused, setIsFocused] = useState(false);
    const [query, setQuery] = useState('');

    return (
        <div className={cn("relative w-full max-w-3xl mx-auto", className)}>
            {/* Glow Effect */}
            <div className={cn(
                "absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl opacity-30 blur-xl transition-opacity duration-500",
                isFocused ? "opacity-70" : "opacity-30"
            )} />

            <div className={cn(
                "relative flex items-center bg-background/80 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden",
                isFocused ? "ring-2 ring-primary/50 scale-[1.02]" : ""
            )}>
                <div className="pl-6 pr-4 text-primary animate-pulse-slow">
                    <Sparkles className="w-6 h-6" />
                </div>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Kitoblar, mavzular qidiring yoki savol bering..."
                    className="w-full py-5 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/70 font-medium"
                />

                <div className="flex items-center pr-2 gap-2">
                    <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
                        <Mic className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Suggestions */}
            <div className={cn(
                "absolute top-full left-0 right-0 mt-4 transition-all duration-500 ease-out",
                isFocused ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
            )}>
                <div className="flex flex-wrap justify-center gap-2">
                    {[
                        "Yangi boshlovchilar uchun mashinali oʻqitish",
                        "Iqtisodiyot asoslari",
                        "Kvant fizikasi tarixi",
                        "Oʻzbek adabiyoti durdonalari"
                    ].map((suggestion, i) => (
                        <button
                            key={i}
                            className="px-4 py-2 rounded-full bg-background/60 backdrop-blur-md border border-border/50 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center gap-2"
                        >
                            <ArrowRight className="w-3 h-3" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
