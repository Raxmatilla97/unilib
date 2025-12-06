import { supabaseAdmin } from '@/lib/supabase/admin';
import {
    BookOpen,
    Users,
    TrendingUp,
    Activity,
    Scan,
    History,
    BarChart3,
    Book
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getAdminStats() {
    const [
        { count: booksCount },
        { count: physicalCopiesCount },
        { count: usersCount },
        { count: activeLoansCount },
        { count: checkoutsCount },
        { data: booksData }
    ] = await Promise.all([
        supabaseAdmin.from('books').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('physical_book_copies').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('book_checkouts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('book_checkouts').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('books').select('views_count')
    ]);

    const totalViews = booksData?.reduce((sum, book) => sum + (book.views_count || 0), 0) || 0;

    return {
        booksCount: booksCount || 0,
        physicalCopiesCount: physicalCopiesCount || 0,
        usersCount: usersCount || 0,
        activeLoansCount: activeLoansCount || 0,
        checkoutsCount: checkoutsCount || 0,
        totalViews
    };
}

export default async function AdminDashboard() {
    const { booksCount, physicalCopiesCount, usersCount, activeLoansCount, checkoutsCount, totalViews } = await getAdminStats();

    const stats = [
        {
            label: 'Jami Kitoblar',
            value: booksCount.toLocaleString(),
            icon: Book,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Jismoniy Nusxalar',
            value: physicalCopiesCount.toLocaleString(),
            icon: BookOpen,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            label: 'Foydalanuvchilar',
            value: usersCount.toLocaleString(),
            icon: Users,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            label: 'Aktiv Qarzlar',
            value: activeLoansCount.toLocaleString(),
            icon: TrendingUp,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        },
    ];

    const quickStats = [
        {
            label: 'Jami Qarzlar',
            value: checkoutsCount.toLocaleString(),
            color: 'text-blue-600'
        },
        {
            label: 'Jami Ko\'rishlar',
            value: totalViews.toLocaleString(),
            color: 'text-purple-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 border-2 border-primary/20 rounded-2xl p-8 shadow-lg">
                <h1 className="text-4xl font-bold mb-2">
                    🎯 Admin Panel
                </h1>
                <p className="text-muted-foreground text-lg">
                    Tizimni boshqarish va nazorat qilish markazi
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className={`bg-gradient-to-br ${stat.bg} to-transparent border-2 ${stat.border} rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105`}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-14 h-14 rounded-xl ${stat.bg} border-2 ${stat.border} flex items-center justify-center`}>
                                    <Icon className={`w-7 h-7 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
                            <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickStats.map((stat, i) => (
                    <div key={i} className="bg-card border-2 border-border rounded-xl p-6">
                        <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold mb-4">⚡ Tez Harakatlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/admin/books/offline/create" className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/20 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all text-left group">
                        <BookOpen className="w-10 h-10 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold mb-1 text-lg">Offline Kitob</h3>
                        <p className="text-sm text-muted-foreground">Yangi kitob qo'shish</p>
                    </Link>

                    <Link href="/admin/checker" className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20 rounded-xl hover:border-green-500 hover:shadow-xl transition-all text-left group">
                        <Scan className="w-10 h-10 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold mb-1 text-lg">Checker</h3>
                        <p className="text-sm text-muted-foreground">Kitob berish/qaytarish</p>
                    </Link>

                    <Link href="/admin/transactions" className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-500/20 rounded-xl hover:border-purple-500 hover:shadow-xl transition-all text-left group">
                        <History className="w-10 h-10 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold mb-1 text-lg">Qarzlar Tarixi</h3>
                        <p className="text-sm text-muted-foreground">Barcha transaksiyalar</p>
                    </Link>

                    <Link href="/admin/statistika" className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-2 border-orange-500/20 rounded-xl hover:border-orange-500 hover:shadow-xl transition-all text-left group">
                        <BarChart3 className="w-10 h-10 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold mb-1 text-lg">Statistika</h3>
                        <p className="text-sm text-muted-foreground">Tahlil va hisobotlar</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
