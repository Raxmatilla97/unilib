'use server';

import { supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSchedule(
    scheduleId: string,
    userId: string,
    data: {
        start_date: string;
        end_date: string;
        daily_goal_pages?: number;
        daily_goal_minutes?: number;
    }
) {
    try {
        // Validate dates
        if (new Date(data.end_date) < new Date(data.start_date)) {
            return { success: false, error: 'Tugash sanasi boshlanish sanasidan katta bo\'lishi kerak' };
        }

        // Validate daily goals
        if (data.daily_goal_pages && data.daily_goal_pages <= 0) {
            return { success: false, error: 'Kunlik maqsad 0 dan katta bo\'lishi kerak' };
        }

        // Update schedule (user_id filter ensures ownership)
        const { error: updateError } = await supabaseAdmin
            .from('reading_schedule')
            .update({
                start_date: data.start_date,
                end_date: data.end_date,
                daily_goal_pages: data.daily_goal_pages,
                daily_goal_minutes: data.daily_goal_minutes,
            })
            .eq('id', scheduleId)
            .eq('user_id', userId);

        if (updateError) {
            console.error('Error updating schedule:', updateError);
            return { success: false, error: 'Rejani yangilashda xatolik yuz berdi' };
        }

        // Revalidate the schedule page
        revalidatePath('/schedule');

        return { success: true };
    } catch (error) {
        console.error('Error in updateSchedule:', error);
        return { success: false, error: 'Kutilmagan xatolik yuz berdi' };
    }
}

export async function deleteSchedule(scheduleId: string, userId: string) {
    try {
        // Soft delete: set status to 'deleted' (user_id filter ensures ownership)
        const { error: deleteError } = await supabaseAdmin
            .from('reading_schedule')
            .update({ status: 'deleted' })
            .eq('id', scheduleId)
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Error deleting schedule:', deleteError);
            return { success: false, error: 'Rejani o\'chirishda xatolik yuz berdi' };
        }

        // Revalidate the schedule page
        revalidatePath('/schedule');

        return { success: true };
    } catch (error) {
        console.error('Error in deleteSchedule:', error);
        return { success: false, error: 'Kutilmagan xatolik yuz berdi' };
    }
}
