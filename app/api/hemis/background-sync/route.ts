import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Background HEMIS sync - checks if sync is needed and performs it
 * Called automatically after login if JWT is fresh
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get user's last sync time and HEMIS token
        const { data: profile } = await supabase
            .from('profiles')
            .select('hemis_token, last_synced_at, student_number')
            .eq('id', userId)
            .single();

        if (!profile?.hemis_token || !profile?.student_number) {
            return NextResponse.json(
                { success: false, error: 'HEMIS data not found' },
                { status: 404 }
            );
        }

        // Check if sync is needed (24 hours)
        const lastSynced = profile.last_synced_at ? new Date(profile.last_synced_at) : null;
        const now = new Date();
        const hoursSinceSync = lastSynced
            ? (now.getTime() - lastSynced.getTime()) / (1000 * 60 * 60)
            : 999;

        if (hoursSinceSync < 24) {
            console.log('[Background Sync] Sync not needed, last synced', hoursSinceSync.toFixed(1), 'hours ago');
            return NextResponse.json({
                success: true,
                message: 'Sync not needed',
                lastSynced: profile.last_synced_at,
            });
        }

        console.log('[Background Sync] Syncing data for student:', profile.student_number);

        // Fetch latest data from HEMIS
        const HEMIS_API_URL = 'https://student.umft.uz/rest/v1/';
        const meResponse = await fetch(`${HEMIS_API_URL}account/me`, {
            headers: { 'Authorization': `Bearer ${profile.hemis_token}` },
        });

        if (!meResponse.ok) {
            console.log('[Background Sync] HEMIS token expired or invalid');
            return NextResponse.json(
                { success: false, error: 'HEMIS token expired' },
                { status: 401 }
            );
        }

        const meData = await meResponse.json();
        const student = meData.data || meData;

        // Format name
        const formatName = (name: string) => {
            if (!name) return '';
            return name.toLowerCase().split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        const formattedName = formatName(
            student.full_name || student.name || `${student.first_name} ${student.second_name}`.trim()
        );

        // Update profile with latest HEMIS data
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                name: formattedName,
                avatar_url: student.image || student.picture || null,
                phone: student.phone || null,
                faculty: student.faculty?.name || null,
                student_group: student.group?.name || null,
                course: student.level?.name || null,
                education_form: student.educationForm?.name || null,
                specialty: student.specialty?.name || null,
                gpa: student.avg_gpa || null,
                last_synced_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (updateError) {
            console.error('[Background Sync] Update error:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update profile' },
                { status: 500 }
            );
        }

        console.log('[Background Sync] ✓ Profile updated successfully');

        return NextResponse.json({
            success: true,
            message: 'Background sync completed',
            lastSynced: new Date().toISOString(),
        });

    } catch (error) {
        console.error('[Background Sync] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}
