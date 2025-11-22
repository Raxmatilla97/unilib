import { supabaseAdmin } from '@/lib/supabase/server';
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

    // Get paginated data
    const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching users:', error);
        return { users: [], totalUsers: 0, totalPages: 0 };
    }

    return {
        users: users || [],
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
