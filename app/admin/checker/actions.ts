'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function awardXP(userId: string, xpAmount: number) {
    try {
        // Get current XP
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('xp')
            .eq('id', userId)
            .single();

        if (fetchError) {
            console.error('Fetch profile error:', fetchError);
            return { success: false, error: fetchError.message };
        }

        const newXP = (profile.xp || 0) + xpAmount;

        // Update XP
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ xp: newXP })
            .eq('id', userId);

        if (updateError) {
            console.error('XP update error:', updateError);
            return { success: false, error: updateError.message };
        }

        revalidatePath('/admin/checker');
        return { success: true, newXP };
    } catch (error: any) {
        console.error('Award XP error:', error);
        return { success: false, error: error.message };
    }
}
