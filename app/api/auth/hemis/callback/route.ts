// HEMIS OAuth Callback Handler
import { NextRequest, NextResponse } from 'next/server';
import { hemisOAuth } from '@/lib/hemis/oauth';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Handle OAuth error
        if (error) {
            return NextResponse.redirect(
                new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
            );
        }

        if (!code) {
            return NextResponse.redirect(
                new URL('/login?error=no_code', request.url)
            );
        }

        // Exchange code for access token
        const tokenResponse = await hemisOAuth.getAccessToken(code);

        // Get user info from HEMIS
        const hemisUser = await hemisOAuth.getUserInfo(tokenResponse.access_token);

        // Check if user exists in our database
        const { data: existingUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('hemis_student_id', hemisUser.student_id)
            .single();

        if (existingUser) {
            // User exists - login
            // TODO: Create session with Supabase Auth
            return NextResponse.redirect(
                new URL('/dashboard', request.url)
            );
        } else {
            // New user - redirect to complete registration
            // Store HEMIS data in session for registration
            const registrationData = {
                hemis_id: hemisUser.student_id,
                full_name: hemisUser.full_name,
                email: hemisUser.email,
                access_token: tokenResponse.access_token,
            };

            // Redirect to registration with pre-filled data
            return NextResponse.redirect(
                new URL(
                    `/register?hemis_data=${encodeURIComponent(JSON.stringify(registrationData))}`,
                    request.url
                )
            );
        }
    } catch (error) {
        console.error('HEMIS OAuth callback error:', error);
        return NextResponse.redirect(
            new URL('/login?error=oauth_failed', request.url)
        );
    }
}
