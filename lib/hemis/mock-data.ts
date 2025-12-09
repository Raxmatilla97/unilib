// Mock HEMIS API for testing without real API key
import { HemisStudent } from './client';

export const mockStudents: Record<string, HemisStudent> = {
    '12345678': {
        id: '1',
        student_id_number: '12345678',
        full_name: 'Aliyev Vali Akramovich',
        first_name: 'Vali',
        second_name: 'Aliyev',
        third_name: 'Akramovich',
        birth_date: '2003-05-15',
        gender: 1,
        citizenship: 'UZ',
        nationality: 'O\'zbek',
        email: 'vali.aliyev@student.umft.uz',
        phone: '+998901234567',
        passport_number: 'AA1234567',
        passport_pin: '12345678901234',
        department: {
            id: 1,
            code: '101',
            name: 'Kompyuter fanlari va dasturlash',
        },
        faculty: {
            id: 1,
            code: '01',
            name: 'Informatika fakulteti',
        },
        education_type: {
            id: 1,
            name: 'Bakalavr',
        },
        education_form: {
            id: 1,
            name: 'Kunduzgi',
        },
        course: 2,
        group: {
            id: 1,
            name: 'KF-21',
        },
        status: 10,
        status_name: 'O\'qiydi',
    },
    '87654321': {
        id: '2',
        student_id_number: '87654321',
        full_name: 'Karimova Dilnoza Shavkatovna',
        first_name: 'Dilnoza',
        second_name: 'Karimova',
        third_name: 'Shavkatovna',
        birth_date: '2004-08-22',
        gender: 2,
        citizenship: 'UZ',
        nationality: 'O\'zbek',
        email: 'dilnoza.karimova@student.umft.uz',
        phone: '+998907654321',
        passport_number: 'AB7654321',
        passport_pin: '98765432109876',
        department: {
            id: 3,
            code: '201',
            name: 'Tibbiyot',
        },
        faculty: {
            id: 2,
            code: '02',
            name: 'Tibbiyot fakulteti',
        },
        education_type: {
            id: 1,
            name: 'Bakalavr',
        },
        education_form: {
            id: 1,
            name: 'Kunduzgi',
        },
        course: 3,
        group: {
            id: 5,
            name: 'TF-22',
        },
        status: 10,
        status_name: 'O\'qiydi',
    },
};

export function getMockStudent(studentId: string): HemisStudent | null {
    return mockStudents[studentId] || null;
}

export function verifyMockStudent(studentId: string): {
    valid: boolean;
    student?: HemisStudent;
    error?: string;
} {
    const student = getMockStudent(studentId);

    if (!student) {
        return {
            valid: false,
            error: 'Talaba HEMIS tizimida topilmadi',
        };
    }

    if (student.status !== 10) {
        return {
            valid: false,
            error: `Talaba holati: ${student.status_name}`,
        };
    }

    return {
        valid: true,
        student,
    };
}
