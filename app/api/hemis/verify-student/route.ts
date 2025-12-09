// API Route: Verify student with HEMIS (with mock support)
import { NextRequest, NextResponse } from 'next/server';
import { hemisClient } from '@/lib/hemis/client';
import { verifyMockStudent } from '@/lib/hemis/mock-data';

const USE_MOCK = process.env.USE_MOCK_HEMIS === 'true';

export async function POST(request: NextRequest) {
    try {
        const { studentId } = await request.json();

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID kerak' },
                { status: 400 }
            );
        }

        // 🧪 Mock mode (API key bo'lmasa)
        if (USE_MOCK) {
            console.log('🧪 Mock HEMIS data ishlatilmoqda');
            const mockResult = verifyMockStudent(studentId);

            if (!mockResult.valid) {
                return NextResponse.json(
                    { valid: false, error: mockResult.error },
                    { status: 404 }
                );
            }

            const student = mockResult.student!;
            const departmentCode = hemisClient.mapDepartmentToCode(student.department.id);

            return NextResponse.json({
                valid: true,
                mock: true,
                student: {
                    hemis_id: student.student_id_number,
                    full_name: student.full_name,
                    first_name: student.first_name,
                    second_name: student.second_name,
                    third_name: student.third_name,
                    email: student.email,
                    phone: student.phone,
                    birth_date: student.birth_date,
                    gender: student.gender === 1 ? 'male' : 'female',
                    department: {
                        id: student.department.id,
                        code: departmentCode,
                        name: student.department.name,
                    },
                    faculty: {
                        id: student.faculty.id,
                        name: student.faculty.name,
                    },
                    course: student.course,
                    group: student.group.name,
                    status: student.status_name,
                },
            });
        }

        // ✅ Real HEMIS API
        const result = await hemisClient.verifyStudent(studentId);

        if (!result.valid) {
            return NextResponse.json(
                { valid: false, error: result.error },
                { status: 404 }
            );
        }

        const student = result.student!;
        const departmentCode = hemisClient.mapDepartmentToCode(student.department.id);

        return NextResponse.json({
            valid: true,
            student: {
                hemis_id: student.student_id_number,
                full_name: student.full_name,
                first_name: student.first_name,
                second_name: student.second_name,
                third_name: student.third_name,
                email: student.email,
                phone: student.phone,
                birth_date: student.birth_date,
                gender: student.gender === 1 ? 'male' : 'female',
                department: {
                    id: student.department.id,
                    code: departmentCode,
                    name: student.department.name,
                },
                faculty: {
                    id: student.faculty.id,
                    name: student.faculty.name,
                },
                course: student.course,
                group: student.group.name,
                status: student.status_name,
            },
        });
    } catch (error) {
        console.error('HEMIS error:', error);
        return NextResponse.json(
            { error: 'HEMIS bilan bog\'lanishda xatolik' },
            { status: 500 }
        );
    }
}
