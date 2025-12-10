import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { login, password } = await request.json();

        if (!login || !password) {
            return NextResponse.json(
                { success: false, error: 'Login va parol kiritilishi shart' },
                { status: 400 }
            );
        }

        console.log('[HEMIS Login API] Authenticating:', login);

        // 1. Get JWT token from HEMIS
        console.log('[HEMIS Login API] Step 1: Getting JWT token');
        const HEMIS_API_URL = 'https://student.umft.uz/rest/v1/';
        const loginResponse = await fetch(`${HEMIS_API_URL}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password }),
        });

        const responseText = await loginResponse.text();
        console.log('[HEMIS Login API] Response status:', loginResponse.status);
        console.log('[HEMIS Login API] Response body:', responseText);

        if (!loginResponse.ok) {
            console.error('[HEMIS Login API] HEMIS auth failed');

            // Return actual HEMIS error message
            let errorMessage = 'HEMIS login yoki parol noto\'g\'ri';
            try {
                const errorData = JSON.parse(responseText);
                if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch (e) {
                // Use default message
            }

            return NextResponse.json(
                { success: false, error: errorMessage },
                { status: 401 }
            );
        }

        const loginData = JSON.parse(responseText);
        const hemisToken = loginData.data?.token || loginData.token;

        if (!hemisToken) {
            return NextResponse.json(
                { success: false, error: 'Token olinmadi' },
                { status: 500 }
            );
        }

        console.log('[HEMIS Login API] ✓ JWT token received');

        // 2. Decode JWT to get student ID (no need for second API call!)
        console.log('[HEMIS Login API] Step 2: Decoding JWT token');
        const tokenParts = hemisToken.split('.');
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        const studentIdNumber = payload.jti; // Student ID is in 'jti' field

        console.log('[HEMIS Login API] ✓ Student ID from JWT:', studentIdNumber);

        // 3. Check if user exists in database by student_id_number
        const supabase = await createClient();

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, email, student_number')
            .eq('student_number', studentIdNumber)
            .maybeSingle();

        const userPassword = `hemis_${login}_${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10)}`;

        if (existingProfile) {
            // User exists - just login (no data fetch needed!)
            console.log('[HEMIS Login API] ✓ User found, logging in without fetching data');

            return NextResponse.json({
                success: true,
                data: {
                    email: existingProfile.email,
                    password: userPassword,
                    existing: true,
                },
            });
        }

        // User doesn't exist - fetch full data from HEMIS and create account
        console.log('[HEMIS Login API] New user, fetching full data from HEMIS');

        const meResponse = await fetch(`${HEMIS_API_URL}account/me`, {
            headers: { 'Authorization': `Bearer ${hemisToken}` },
        });

        if (!meResponse.ok) {
            return NextResponse.json(
                { success: false, error: 'Student ma\'lumotlari olinmadi' },
                { status: 500 }
            );
        }

        const meData = await meResponse.json();
        const student = meData.data || meData;

        console.log('[HEMIS Login API] ✓ Full student data received');

        const finalEmail = student.email || `${student.login}@hemis.umft.uz`;

        // Format name from UPPERCASE to Title Case
        const formatName = (name: string) => {
            if (!name) return '';
            return name.toLowerCase().split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        const formattedName = formatName(
            student.full_name || student.name || `${student.first_name} ${student.second_name}`.trim()
        );

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: finalEmail,
            password: userPassword,
            options: {
                data: {
                    name: formattedName,
                    hemis_login: student.login,
                    hemis_id: student.id,
                },
            },
        });

        if (signUpError) {
            // If user already exists in auth, just return login credentials
            if (signUpError.message?.includes('already registered') || signUpError.status === 422) {
                console.log('[HEMIS Login API] User exists in auth, returning login credentials');
                return NextResponse.json({
                    success: true,
                    data: {
                        email: finalEmail,
                        password: userPassword,
                        existing: true,
                    },
                });
            }

            console.error('[HEMIS Login API] Failed to create user:', signUpError);
            return NextResponse.json(
                { success: false, error: 'Foydalanuvchi yaratishda xatolik' },
                { status: 500 }
            );
        }

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: signUpData.user!.id,
                email: finalEmail,
                name: formattedName,
                student_number: studentIdNumber,
                university: student.university || 'UMFT',
                role: 'student',
                avatar_url: student.image || student.picture || null,
                hemis_token: hemisToken, // Save token for future API calls
                // Additional HEMIS details
                phone: student.phone || null,
                faculty: student.faculty?.name || null,
                student_group: student.group?.name || null,
                course: student.level?.name || null,
                education_form: student.educationForm?.name || null,
                specialty: student.specialty?.name || null,
                gpa: student.avg_gpa || null,
            });

        if (profileError) {
            console.error('[HEMIS Login API] Profile creation error:', profileError);
        }

        console.log('[HEMIS Login API] ✓ New user created');

        return NextResponse.json({
            success: true,
            data: {
                email: finalEmail,
                password: userPassword,
                existing: false,
            },
        });

    } catch (error) {
        console.error('[HEMIS Login API] Unexpected error:', error);
        return NextResponse.json(
            { success: false, error: 'Server xatosi' },
            { status: 500 }
        );
    }
}
