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
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);
    const [reviews, setReviews] = useState(initialReviews);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated || !userId) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch(`/api/books/${bookId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating, comment, userId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Izoh qo\'shishda xatolik yuz berdi');
            }

            // Refresh reviews
            const reviewsResponse = await fetch(`/api/books/${bookId}/reviews`);
            const newReviews = await reviewsResponse.json();
            setReviews(newReviews);

            // Reset form
            setRating(5);
            setComment('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

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

            {/* Add Review Form */}
            {isAuthenticated ? (
                <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6">Fikringizni Bildiring</h3>
                    {error && (
                        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Baho</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${star <= (hoveredStar || rating)
                                                ? 'fill-yellow-500 text-yellow-500'
                                                : 'text-muted-foreground'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium mb-3">Izoh</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Kitob haqida fikringizni yozing..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border focus:border-primary outline-none resize-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Yuklanmoqda...' : 'Izoh Qoldirish'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-8 rounded-3xl bg-muted/30 border border-border/50 backdrop-blur-sm text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Izoh qoldirish uchun tizimga kiring</h3>
                    <p className="text-muted-foreground mb-6">
                        Kitob haqida fikr bildirish va baho berish uchun ro'yxatdan o'tishingiz kerak.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/login"
                            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                        >
                            Kirish
                        </Link>
                        <Link
                            href="/register"
                            className="px-6 py-3 rounded-xl bg-card border border-border hover:border-primary/50 font-bold hover:bg-muted/50 transition-colors"
                        >
                            Ro'yxatdan O'tish
                        </Link>
                    </div>
                </div>
            )}

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
                        <p>Hali izohlar yo'q. Birinchi bo'lib izoh qoldiring!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
