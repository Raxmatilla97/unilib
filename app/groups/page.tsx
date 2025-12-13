"use client";

import { ReadOnlyRoute } from '@/components/auth/ReadOnlyRoute';
import { Users, Sparkles, Calendar, MessageCircle } from 'lucide-react';

export default function GroupsPage() {
    return (
        <ReadOnlyRoute>
            <div className="container py-8 md:py-16 px-4 md:px-6 max-w-4xl mx-auto">
                <div className="text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4 md:mb-6 relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-xl" />
                        <Users className="w-8 h-8 md:w-10 md:h-10 text-primary relative z-10" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
                        o'quv Guruhlari
                    </h1>

                    {/* Coming Soon Badge */}
                    <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 text-primary rounded-full border border-primary/20 mb-4 md:mb-6">
                        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="font-medium text-sm md:text-base">Tez orada</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm md:text-lg text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto">
                        Do'stlaringiz bilan birgalikda o'qing, muhokama qiling va bilimlaringizni oshiring.
                        o'quv guruhlari funksiyasi ustida ishlanmoqda.
                    </p>

                    {/* Features Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                        <div className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">Real-time Chat</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                Guruh a'zolari bilan jonli suhbat
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                            </div>
                            <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">Guruh Maqsadlari</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                Birgalikda kitob o'qish rejalari
                            </p>
                        </div>

                        <div className="bg-card border border-border rounded-lg md:rounded-xl p-4 md:p-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-3 md:mb-4 mx-auto">
                                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                            </div>
                            <h3 className="font-bold mb-1 md:mb-2 text-sm md:text-base">Guruh Faoliyati</h3>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                A'zolarning o'qish statistikasi
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl md:rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg md:text-xl font-bold mb-2">Yangiliklar uchun kuzatib boring</h3>
                        <p className="text-sm md:text-base text-muted-foreground mb-4">
                            Guruhlar funksiyasi yaqin orada ishga tushadi. Hozircha Reyting va Yutuqlar bilan o'zingizni sinab ko'ring!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center">
                            <a
                                href="/leaderboard"
                                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-center min-h-[44px] flex items-center justify-center"
                            >
                                Reytingga o'tish
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
