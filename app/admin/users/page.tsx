import { supabaseAdmin } from '@/lib/supabase/admin';
import { UsersTable } from '@/components/admin/UsersTable';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getUsers(page: number = 1, limit: number = 10) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get total count
    const { count, error: countError } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error fetching users count:', countError);
        return { users: [], totalUsers: 0, totalPages: 0 };
    }

    // Get paginated data with active loans count
    const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select(`
            *,
            book_checkouts!book_checkouts_user_id_fkey(id, status)
        `)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching users:', error);
        return { users: [], totalUsers: 0, totalPages: 0 };
    }

    // Count active loans for each user
    const usersWithLoans = users?.map(user => ({
        ...user,
        activeLoansCount: user.book_checkouts?.filter((loan: any) => loan.status === 'active').length || 0
    })) || [];

    return {
        users: usersWithLoans,
        totalUsers: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const limit = 10;
    const { users, totalUsers, totalPages } = await getUsers(page, limit);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Users className="w-8 h-8 text-primary" />
                        Foydalanuvchilar
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Tizimdagi barcha foydalanuvchilarni boshqarish
                    </p>
                </div>
            </div>

            <UsersTable
                users={users}
                page={page}
                totalPages={totalPages}
                totalUsers={totalUsers}
            />
        </div>
    );
}
