"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { BarChart3, TrendingUp, BookOpen, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TimeFilter = 'day' | 'week' | 'month';

export default function StatistikaPage() {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
    const [loading, setLoading] = useState(true);

    // Stats
    const [totalCheckouts, setTotalCheckouts] = useState(0);
    const [activeLoans, setActiveLoans] = useState(0);
    const [totalViews, setTotalViews] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);

    // Charts data
    const [checkoutTrends, setCheckoutTrends] = useState<any[]>([]);
    const [topOfflineBooks, setTopOfflineBooks] = useState<any[]>([]);
    const [topOnlineBooks, setTopOnlineBooks] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
    }, [timeFilter]);

    const getDateRange = () => {
        const now = new Date();
        let startDate = new Date();

        switch (timeFilter) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
        }

        return startDate.toISOString();
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const startDate = getDateRange();

            // Total checkouts in period
            const { count: checkoutsCount } = await supabase
                .from('book_checkouts')
                .select('*', { count: 'exact', head: true })
                .gte('checked_out_at', startDate);
            setTotalCheckouts(checkoutsCount || 0);

            // Active loans
            const { count: activeCount } = await supabase
                .from('book_checkouts')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');
            setActiveLoans(activeCount || 0);

            // Total views - sum of all books' views_count
            const { data: booksData } = await supabase
                .from('books')
                .select('views_count');

            const totalViewsCount = booksData?.reduce((sum, book) => sum + (book.views_count || 0), 0) || 0;
            setTotalViews(totalViewsCount);

            // Active users
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            setActiveUsers(usersCount || 0);

            // Checkout trends
            await fetchCheckoutTrends(startDate);

            // Top books
            await fetchTopBooks();

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCheckoutTrends = async (startDate: string) => {
        const { data } = await supabase
            .from('book_checkouts')
            .select('checked_out_at')
            .gte('checked_out_at', startDate)
            .order('checked_out_at');

        if (data) {
            const grouped = groupByDate(data.map(d => d.checked_out_at));
            setCheckoutTrends(grouped);
        }
    };

    const fetchTopBooks = async () => {
        try {
            // Top offline books - by checkout count
            const { data: checkouts } = await supabase
                .from('book_checkouts')
                .select(`
                    physical_copy_id,
                    physical_book_copies!inner(
                        book_id,
                        books!inner(id, title, author)
                    )
                `);

            if (checkouts && checkouts.length > 0) {
                const bookCounts: { [key: string]: { id: string; title: string; author: string; count: number } } = {};

                checkouts.forEach((checkout: any) => {
                    const copy = checkout.physical_book_copies;
                    if (copy && copy.books) {
                        const book = copy.books;
                        const bookId = book.id;

                        if (!bookCounts[bookId]) {
                            bookCounts[bookId] = {
                                id: bookId,
                                title: book.title,
                                author: book.author,
                                count: 0
                            };
                        }
                        bookCounts[bookId].count++;
                    }
                });

                const sorted = Object.values(bookCounts)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
                setTopOfflineBooks(sorted);
            }

            // Top online books - by views_count
            const { data: onlineBooks } = await supabase
                .from('books')
                .select('id, title, author, views_count')
                .order('views_count', { ascending: false })
                .limit(5);

            if (onlineBooks && onlineBooks.length > 0) {
                const formatted = onlineBooks.map(book => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                    count: book.views_count || 0
                }));
                setTopOnlineBooks(formatted);
            }
        } catch (error) {
            console.error('Error fetching top books:', error);
        }
    };

    const groupByDate = (dates: string[]) => {
        const grouped: { [key: string]: number } = {};

        dates.forEach(dateStr => {
            const date = new Date(dateStr);
            const key = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
            grouped[key] = (grouped[key] || 0) + 1;
        });

        return Object.entries(grouped)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => {
                const [dayA, monthA] = a.date.split('/').map(Number);
                const [dayB, monthB] = b.date.split('/').map(Number);
                return (monthA * 100 + dayA) - (monthB * 100 + dayB);
            });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        Statistika
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Kutubxona faoliyati tahlili
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeFilter('day')}
                        className={`px-4 py-2 rounded-lg transition-colors ${timeFilter === 'day'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        Bugun
                    </button>
                    <button
                        onClick={() => setTimeFilter('week')}
                        className={`px-4 py-2 rounded-lg transition-colors ${timeFilter === 'week'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        Hafta
                    </button>
                    <button
                        onClick={() => setTimeFilter('month')}
                        className={`px-4 py-2 rounded-lg transition-colors ${timeFilter === 'month'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        Oy
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-600">Qarzlar</p>
                        <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{totalCheckouts}</p>
                    <p className="text-xs text-muted-foreground mt-1">Offline kitoblar</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-2 border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-green-600">Aktiv</p>
                        <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-green-600">{activeLoans}</p>
                    <p className="text-xs text-muted-foreground mt-1">Hozirda qarzda</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-purple-600">Ko'rishlar</p>
                        <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-purple-600">{totalViews}</p>
                    <p className="text-xs text-muted-foreground mt-1">Online kitoblar</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-2 border-orange-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-orange-600">Foydalanuvchilar</p>
                        <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{activeUsers}</p>
                    <p className="text-xs text-muted-foreground mt-1">Ro'yxatdan o'tgan</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
                {/* Checkout Trends */}
                <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-2 border-blue-500/20 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-bold">📊 Qarzlar Dinamikasi</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {timeFilter === 'day' ? 'Bugungi' : timeFilter === 'week' ? 'Haftalik' : 'Oylik'} statistika
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-blue-500/10 rounded-lg">
                            <p className="text-sm font-medium text-blue-600">
                                Jami: {checkoutTrends.reduce((sum, item) => sum + item.count, 0)}
                            </p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={checkoutTrends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorCheckouts" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                name="Qarzlar"
                                fill="url(#colorCheckouts)"
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                                activeDot={{ r: 7, fill: '#2563eb' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Books */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Offline Books */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">📚 Eng Ko'p Olingan Kitoblar (Offline)</h3>
                    {topOfflineBooks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">Hali ma'lumot yo'q</p>
                    ) : (
                        <div className="space-y-3">
                            {topOfflineBooks.map((book: any, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                                        <p className="font-medium">{book.title}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm font-bold">
                                        {book.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Online Books */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="text-lg font-bold mb-4">📖 Eng Ko'p Ko'rilgan Kitoblar (Online)</h3>
                    {topOnlineBooks.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">Hali ma'lumot yo'q</p>
                    ) : (
                        <div className="space-y-3">
                            {topOnlineBooks.map((book: any, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                                        <p className="font-medium">{book.title}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-sm font-bold">
                                        {book.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
