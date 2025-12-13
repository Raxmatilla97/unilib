"use client";

import { ReadOnlyRoute } from '@/components/auth/ReadOnlyRoute';
import { Quote, Sparkles, BookOpen, Copy, FileText } from 'lucide-react';

export default function CitationsPage() {
    return (
        <ReadOnlyRoute>
            <div className="container py-8 md:py-16 px-4 md:px-6 max-w-4xl mx-auto">
                <div className="text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 md:mb-6 relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl" />
                        <Quote className="w-8 h-8 md:w-10 md:h-10 text-blue-500 relative z-10" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                        Iqtibos Generatori
                    </h1>

                    {/* Coming Soon Badge */}
                    <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20 mb-4 md:mb-6">
                        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium text-sm md:text-base">Tez orada</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
                        Kitoblar uchun avtomatik iqtibos yarating. APA, MLA, Chicago va Harvard formatlarini qo'llab-quvvatlaydi.
                    </p>

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                        <div className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">Ko'p formatlar</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                APA, MLA, Chicago, Harvard
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <Copy className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                            </div>
                            <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">Tez nusxalash</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                Bir bosishda nusxalang
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                            </div>
                            <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">Kutubxonadan</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                o'qigan kitoblaringizdan
                            </p>
                        </div>
                    </div>

                    {/* Example */}
                    <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8">
                        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Misol</h3>
                        <div className="bg-card border border-border rounded-lg p-3 md:p-4 text-left overflow-x-auto">
                            <p className="text-xs md:text-sm font-mono text-muted-foreground whitespace-normal break-words">
                                Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009).
                                <span className="italic"> Introduction to Algorithms</span> (3rd ed.).
                                MIT Press.
                            </p>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-2">APA format</p>
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl md:rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg md:text-xl font-bold mb-2">Hozircha boshqa funksiyalardan foydalaning</h3>
                        <p className="text-sm md:text-base text-muted-foreground mb-4">
                            Iqtibos generatori ustida ishlanmoqda. Shu vaqtda Reyting va Yutuqlar bilan o'zingizni sinab ko'ring!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                            <a
                                href="/library"
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-center min-h-[44px] flex items-center justify-center"
                            >
                                Kutubxonaga o'tish
                            </a>
                            <a
                                href="/achievements"
                                className="px-6 py-2.5 bg-card border border-border rounded-lg font-medium hover:bg-accent/5 transition-colors text-center min-h-[44px] flex items-center justify-center"
                            >
                                Yutuqlarni ko'rish
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </ReadOnlyRoute>
    );
}
