"use client";

import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Review {
    id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface BookReviewsProps {
    bookId: string;
    reviews: Review[];
    isAuthenticated: boolean;
    userId?: string | null;
}

export function BookReviews({ bookId, reviews: initialReviews, isAuthenticated, userId }: BookReviewsProps) {
    const [reviews, setReviews] = useState(initialReviews);

    return (
        <div className="space-y-8">
            {/* Reviews Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    Izohlar va Baholar
                </h2>
                <span className="text-muted-foreground">
                    {reviews.length} ta izoh
                </span>
            </div>

            {/* Coming Soon Message */}
            <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 backdrop-blur-sm text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Izoh qoldirish tizimi yangilanmoqda</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Ushbu funksiya ayni damda texnik xizmat ko'rsatish jarayonida. Tez orada siz kitoblar haqida o'z fikringizni qoldirishingiz mumkin bo'ladi.
                </p>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="font-bold text-lg">{review.user_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString('uz-UZ', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                                        {review.rating}
                                    </span>
                                </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Hali izohlar yo'q.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
