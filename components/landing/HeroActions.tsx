'use client';

import { ArrowRight, Play } from 'lucide-react';
import { toast } from 'sonner';

export function HeroActions() {
    const handleUnavailable = () => {
        toast.info("Ushbu xizmat hozircha faol emas", {
            description: "Tez orada ishga tushiriladi. Biz bilan qoling!"
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up delay-200">
            <button
                onClick={handleUnavailable}
                className="group relative px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                Bepul Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
                onClick={handleUnavailable}
                className="px-8 py-4 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-3 backdrop-blur-sm cursor-pointer"
            >
                <Play className="w-5 h-5 fill-current" />
                Video Ko'rish
            </button>
        </div>
    );
}
