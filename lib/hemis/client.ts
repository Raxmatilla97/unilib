// HEMIS API Client for UMFT
// Base URL: https://student.umft.uz/rest/v1

interface HemisConfig {
    baseUrl: string;
    apiKey?: string;
    timeout?: number;
}

interface HemisStudent {
    id: string;
    student_id_number: string;
    full_name: string;
    first_name: string;
    second_name: string;
    third_name: string;
    birth_date: string;
    gender: number;
    citizenship: string;
    nationality: string;
    email: string;
    phone: string;
    passport_number: string;
    passport_pin: string;
    department: {
        id: number;
        code: string;
        name: string;
    };
    faculty: {
        id: number;
        code: string;
        name: string;
    };
    education_type: {
        id: number;
        name: string;
    };
    education_form: {
        id: number;
        name: string;
    };
    course: number;
    group: {
        id: number;
        name: string;
    };
    status: number;
    status_name: string;
}

interface HemisDepartment {
    id: number;
    code: string;
    name: string;
    faculty_id: number;
    faculty_name: string;
        try {
    const response = await fetch(`${this.config.baseUrl}/student/${studentId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        signal: AbortSignal.timeout(this.config.timeout!),
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null; // Student not found
        }
        throw new Error(`HEMIS API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data || data;
} catch (error) {
    console.error('Error fetching student from HEMIS:', error);
    throw error;
}
    }

    /**
     * Verify if student exists and is active
     */
    async verifyStudent(studentId: string): Promise < {
    valid: boolean;
    student?: HemisStudent;
    error?: string;
} > {
    try {
        const student = await this.getStudent(studentId);

        if(!student) {
            return {
                valid: false,
                error: 'Student not found in HEMIS',
            };
        }

            // Check if student is active (status = 10 usually means active)
            if(student.status !== 10) {
    return {
        valid: false,
        error: `Student status: ${student.status_name}`,
    };
}

return {
    valid: true,
    student,
};
        } catch (error) {
    return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
    };
}
    }

    /**
     * Get all departments
     */
    async getDepartments(): Promise < HemisDepartment[] > {
    try {
        const response = await fetch(`${this.config.baseUrl}/data/departments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
            },
            signal: AbortSignal.timeout(this.config.timeout!),
        });

        if(!response.ok) {
    throw new Error(`HEMIS API error: ${response.status}`);
}

const data = await response.json();
return data.data || data;
        } catch (error) {
    console.error('Error fetching departments from HEMIS:', error);
    throw error;
}
    }

/**
 * Map HEMIS department ID to 3-digit barcode code
 */
mapDepartmentToCode(departmentId: number): string {
    // Default mapping - customize based on your university
    const departmentMap: Record<number, string> = {
        1: '101', // Computer Science
        2: '102', // Engineering
        3: '201', // Medicine
        4: '202', // Pharmacy
        5: '301', // Economics
        // Add more mappings as needed
    };

    return departmentMap[departmentId] || '001'; // Default to 001
}
}

// Export singleton instance
export const hemisClient = new HemisApiClient({
    baseUrl: process.env.NEXT_PUBLIC_HEMIS_API_URL || 'https://student.umft.uz/rest/v1',
    apiKey: process.env.HEMIS_API_KEY,
});

export type { HemisStudent, HemisDepartment };
