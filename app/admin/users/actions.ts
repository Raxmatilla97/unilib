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
        console.log('Attempting to delete user:', userId);

        // First, try to delete from profiles (this might cascade)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('Profile deletion error:', profileError);
            // Continue anyway, try auth deletion
        }

        // Delete from auth.users using supabaseAdmin
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (authError) {
            console.error('Auth deletion error:', authError);
            throw authError;
        }

        console.log('User deleted successfully');
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return {
            success: false,
            error: error?.message || 'Failed to delete user'
        };
    }
}
