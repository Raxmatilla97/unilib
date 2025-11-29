'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Role } from '@/lib/permissions';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: Role) {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;

        // Log the action
        await supabaseAdmin.from('admin_logs').insert({
            action: 'User Role Updated',
            details: { userId, newRole },
            admin_id: 'system' // Ideally we get the current admin's ID
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update user role' };
    }
}

export async function deleteUser(userId: string) {
    try {
        // Delete from auth.users using supabaseAdmin
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) throw error;

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}
