/**
 * Permission System for Multi-Tenant Architecture
 * 8-Role Hierarchy: Super Admin → System Admin → Org Admin → Head Librarian → Librarian/Teacher → Parent → Student
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    SYSTEM_ADMIN: 'system_admin',
    ORG_ADMIN: 'org_admin',
    HEAD_LIBRARIAN: 'head_librarian',
    LIBRARIAN: 'librarian',
    TEACHER: 'teacher',
    PARENT: 'parent',
    STUDENT: 'student'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy levels (higher number = more permissions)
export const ROLE_HIERARCHY: Record<Role, number> = {
    super_admin: 8,
    system_admin: 7,
    org_admin: 6,
    head_librarian: 5,
    librarian: 4,
    teacher: 4,
    parent: 2,
    student: 1
};

// Role display names in Uzbek
export const ROLE_NAMES: Record<Role, string> = {
    super_admin: 'Super Admin',
    system_admin: 'Tizim Administratori',
    org_admin: 'Tashkilot Administratori',
    head_librarian: 'Bosh Kutubxonachi',
    librarian: 'Kutubxonachi',
    teacher: 'O\'qituvchi',
    parent: 'Ota-ona',
    student: 'O\'quvchi'
};

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
    return ROLE_NAMES[role] || 'Noma\'lum';
}

/**
 * Check if user has required permission level
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can manage organizations
 * Only Super Admin and System Admin
 */
export function canManageOrganizations(userRole: Role): boolean {
    return ([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN] as Role[]).includes(userRole);
}

/**
 * Check if user can manage their organization
 * Org Admin and above
 */
export function canManageOrganization(userRole: Role): boolean {
    return hasPermission(userRole, ROLES.ORG_ADMIN);
}

/**
 * Check if user can manage books
 * Librarians and above (within organization)
 */
export function canManageBooks(userRole: Role): boolean {
    return ([
        ROLES.SUPER_ADMIN,
        ROLES.SYSTEM_ADMIN,
        ROLES.ORG_ADMIN,
        ROLES.HEAD_LIBRARIAN,
        ROLES.LIBRARIAN
    ] as Role[]).includes(userRole);
}

/**
 * Check if user can manage users
 * Head Librarian and above (within organization)
 */
export function canManageUsers(userRole: Role): boolean {
    return hasPermission(userRole, ROLES.HEAD_LIBRARIAN);
}

/**
 * Check if user can view analytics
 * Teachers and above
 */
export function canViewAnalytics(userRole: Role): boolean {
    return hasPermission(userRole, ROLES.TEACHER);
}

/**
 * Check if user can manage study groups
 * Teachers and above
 */
export function canManageStudyGroups(userRole: Role): boolean {
    return hasPermission(userRole, ROLES.TEACHER);
}

/**
 * Check if user can view all organizations
 * Only Super Admin and System Admin
 */
export function canViewAllOrganizations(userRole: Role): boolean {
    return ([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN] as Role[]).includes(userRole);
}

/**
 * Check if user can assign roles
 * Org Admin can assign roles below them
 */
export function canAssignRole(userRole: Role, targetRole: Role): boolean {
    // Super Admin can assign any role
    if (userRole === ROLES.SUPER_ADMIN) return true;

    // System Admin can assign any role except Super Admin
    if (userRole === ROLES.SYSTEM_ADMIN && targetRole !== ROLES.SUPER_ADMIN) return true;

    // Org Admin can assign roles below them (not including Org Admin)
    if (userRole === ROLES.ORG_ADMIN && ROLE_HIERARCHY[targetRole] < ROLE_HIERARCHY[ROLES.ORG_ADMIN]) {
        return true;
    }

    return false;
}

/**
 * Get available roles that a user can assign
 */
export function getAssignableRoles(userRole: Role): Role[] {
    if (userRole === ROLES.SUPER_ADMIN) {
        return Object.values(ROLES);
    }

    if (userRole === ROLES.SYSTEM_ADMIN) {
        return Object.values(ROLES).filter(role => role !== ROLES.SUPER_ADMIN);
    }

    if (userRole === ROLES.ORG_ADMIN) {
        return Object.values(ROLES).filter(
            role => ROLE_HIERARCHY[role] < ROLE_HIERARCHY[ROLES.ORG_ADMIN]
        );
    }

    return [];
}

/**
 * Check if user is admin (any level)
 */
export function isAdmin(userRole: Role): boolean {
    return ([ROLES.SUPER_ADMIN, ROLES.SYSTEM_ADMIN, ROLES.ORG_ADMIN] as Role[]).includes(userRole);
}

/**
 * Check if user is librarian (any level)
 */
export function isLibrarian(userRole: Role): boolean {
    return ([ROLES.HEAD_LIBRARIAN, ROLES.LIBRARIAN] as Role[]).includes(userRole);
}

/**
 * Check if user can borrow books
 * Students, Teachers, and Parents
 */
export function canBorrowBooks(userRole: Role): boolean {
    return ([ROLES.STUDENT, ROLES.TEACHER, ROLES.PARENT] as Role[]).includes(userRole);
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: Role): string {
    const colors: Record<Role, string> = {
        super_admin: 'text-red-500',
        system_admin: 'text-orange-500',
        org_admin: 'text-purple-500',
        head_librarian: 'text-blue-500',
        librarian: 'text-cyan-500',
        teacher: 'text-green-500',
        parent: 'text-yellow-500',
        student: 'text-gray-500'
    };
    return colors[role] || 'text-gray-500';
}

/**
 * Get role badge color for UI
 */
export function getRoleBadgeColor(role: Role): string {
    const colors: Record<Role, string> = {
        super_admin: 'bg-red-500/10 text-red-500 border-red-500/20',
        system_admin: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
        org_admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        head_librarian: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        librarian: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
        teacher: 'bg-green-500/10 text-green-500 border-green-500/20',
        parent: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        student: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return colors[role] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
}
