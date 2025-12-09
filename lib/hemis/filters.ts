// HEMIS data filtering for library system
// Only extract necessary information, protect privacy

interface LibraryUserData {
    hemis_id: string;
    full_name: string;
    email: string;
    phone: string;
    type: 'student' | 'employee';
    department: {
        id: number;
        code: string;
        name: string;
    };
    faculty: string;
    status: string;
    // Student-specific
    course?: number;
    group?: string;
    // Employee-specific
    position?: string;
}

/**
 * Filter HEMIS student data for library system
 * Removes sensitive information
 */
export function filterStudentData(hemisStudent: any): LibraryUserData {
    return {
        hemis_id: hemisStudent.student_id_number,
        full_name: hemisStudent.full_name,
        email: hemisStudent.email,
        phone: hemisStudent.phone || '',
        type: 'student',
        department: {
            id: hemisStudent.department.id,
            code: hemisStudent.department.code,
            name: hemisStudent.department.name,
        },
        faculty: hemisStudent.faculty.name,
        status: hemisStudent.status_name,
        course: hemisStudent.course,
        group: hemisStudent.group.name,
    };
}

/**
 * Filter HEMIS employee data for library system
 * Removes sensitive information
 */
export function filterEmployeeData(hemisEmployee: any): LibraryUserData {
    return {
        hemis_id: hemisEmployee.employee_id,
        full_name: hemisEmployee.full_name,
        email: hemisEmployee.email,
        phone: hemisEmployee.phone || '',
        type: 'employee',
        department: {
            id: hemisEmployee.department.id,
            code: hemisEmployee.department.code,
            name: hemisEmployee.department.name,
        },
        faculty: hemisEmployee.faculty.name,
        status: hemisEmployee.status_name,
        position: hemisEmployee.position,
    };
}

/**
 * Generate 13-digit barcode for library user
 */
export function generateLibraryBarcode(userData: LibraryUserData): string {
    const universityCode = '01';
    const year = new Date().getFullYear().toString().slice(-2);

    // Get next sequence number (from database)
    // This is a placeholder - implement actual sequence logic
    const sequenceNum = '0001';

    // Department code (3 digits)
    const deptCode = userData.department.code.padStart(3, '0');

    // Base ID (12 digits)
    const baseId = universityCode + year + sequenceNum + deptCode;

    // Calculate check digit (EAN-13)
    const checkDigit = calculateCheckDigit(baseId);

    return baseId + checkDigit;
}

function calculateCheckDigit(barcode: string): string {
    let sum = 0;
    for (let i = 0; i < barcode.length; i++) {
        const digit = parseInt(barcode[i]);
        sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
}

/**
 * Privacy-safe data export
 * Only includes data needed for library operations
 */
export function getLibrarySafeData(hemisData: any, userType: 'student' | 'employee'): LibraryUserData {
    if (userType === 'student') {
        return filterStudentData(hemisData);
    } else {
        return filterEmployeeData(hemisData);
    }
}
