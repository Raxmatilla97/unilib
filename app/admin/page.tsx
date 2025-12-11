import { supabaseAdmin } from '@/lib/supabase/admin';
import {
    BookOpen,
    Users,
    TrendingUp,
    Book
} from 'lucide-react';
import { DashboardClient } from '@/components/admin/DashboardClient';

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
    const stats = await getAdminStats();

    const statsData = [
        {
            label: 'Jami Kitoblar',
            value: stats.booksCount.toLocaleString(),
            icon: 'Book',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Jismoniy Nusxalar',
            value: stats.physicalCopiesCount.toLocaleString(),
            icon: 'BookOpen',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            label: 'Foydalanuvchilar',
            value: stats.usersCount.toLocaleString(),
            icon: 'Users',
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            label: 'Aktiv Qarzlar',
            value: stats.activeLoansCount.toLocaleString(),
            icon: 'TrendingUp',
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        },
    ];

    return (
        <DashboardClient
            initialStats={statsData}
            totalCheckouts={stats.checkoutsCount}
            totalViews={stats.totalViews}
        />
    );
}
