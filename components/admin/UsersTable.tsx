"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Shield,
    Trash2
} from 'lucide-react';
import { Role, ROLES } from '@/lib/permissions';
import { updateUserRole, deleteUser } from '@/app/admin/users/actions';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    student_id?: string;
    xp?: number;
    streak?: number;
    university?: string;
    created_at: string;
    activeLoansCount?: number;
}

interface UsersTableProps {
    users: User[];
    page: number;
    totalPages: number;
    totalUsers: number;
}

export function UsersTable({ users: initialUsers, page, totalPages, totalUsers }: UsersTableProps) {
    const [users, setUsers] = useState(initialUsers);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const router = useRouter();

    // Update local state when initialUsers changes (e.g. on page change)
    useEffect(() => {
        setUsers(initialUsers);
    }, [initialUsers]);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleRoleUpdate = async (userId: string, newRole: Role) => {
        setIsLoading(userId);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
                setEditingId(null);
            } else {
                alert('Failed to update role');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Rostdan ham bu foydalanuvchini o\'chirmoqchimisiz? Bu amalni qaytarib bo\'lmaydi.')) return;

        setIsLoading(userId);
        try {
            const result = await deleteUser(userId);
            if (result.success) {
                setUsers(users.filter(u => u.id !== userId));
                alert('Foydalanuvchi o\'chirildi!');
            } else {
                alert(`Xatolik: ${result.error || 'Foydalanuvchini o\'chirib bo\'lmadi'}`);
                console.error('Delete failed:', result.error);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Xatolik yuz berdi!');
        } finally {
            setIsLoading(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        router.push(`/admin/users?page=${newPage}`);
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Qidirish..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                />
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-4 py-3">Foydalanuvchi</th>
                                <th className="px-4 py-3">Student ID</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">XP</th>
                                <th className="px-4 py-3">Qarzlar</th>
                                <th className="px-4 py-3">Rol</th>
                                <th className="px-4 py-3 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            {user.name || 'Nomsiz'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.student_id ? (
                                            <span className="font-mono text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded">
                                                {user.student_id}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-sm">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-orange-600">{user.xp || 0}</span>
                                            {user.streak && user.streak > 0 && (
                                                <span className="text-xs bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded-full">
                                                    🔥 {user.streak}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.activeLoansCount && user.activeLoansCount > 0 ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                                                {user.activeLoansCount} aktiv
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingId === user.id ? (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleUpdate(user.id, e.target.value as Role)}
                                                disabled={isLoading === user.id}
                                                className="bg-background border border-border rounded px-2 py-1 text-xs"
                                            >
                                                <option value={ROLES.STUDENT}>Student</option>
                                                <option value={ROLES.LIBRARIAN}>Kutubxonachi</option>
                                                <option value={ROLES.ORG_ADMIN}>Org Admin</option>
                                                <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === ROLES.SUPER_ADMIN ? 'bg-red-500/10 text-red-500' :
                                                user.role === ROLES.ORG_ADMIN ? 'bg-purple-500/10 text-purple-500' :
                                                    user.role === ROLES.LIBRARIAN ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                                                className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-primary"
                                                title="Rolni o'zgartirish"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={isLoading === user.id}
                                                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                                                title="O'chirish"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        Foydalanuvchilar topilmadi
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredUsers.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                        Foydalanuvchilar topilmadi
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                            {/* User Info */}
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate">{user.name || 'Nomsiz'}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                    {user.university && (
                                        <p className="text-xs text-muted-foreground mt-1">{user.university}</p>
                                    )}
                                </div>
                            </div>

                            {/* Role Section */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Rol</label>
                                {editingId === user.id ? (
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value as Role)}
                                        disabled={isLoading === user.id}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value={ROLES.STUDENT}>Student</option>
                                        <option value={ROLES.LIBRARIAN}>Kutubxonachi</option>
                                        <option value={ROLES.ORG_ADMIN}>Org Admin</option>
                                        <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${user.role === ROLES.SUPER_ADMIN ? 'bg-red-500/10 text-red-500' :
                                            user.role === ROLES.ORG_ADMIN ? 'bg-purple-500/10 text-purple-500' :
                                                user.role === ROLES.LIBRARIAN ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-border">
                                <button
                                    onClick={() => setEditingId(editingId === user.id ? null : user.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium text-sm"
                                >
                                    <Shield className="w-4 h-4" />
                                    {editingId === user.id ? 'Bekor qilish' : 'Rolni o\'zgartirish'}
                                </button>
                                <button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={isLoading === user.id}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    O'chirish
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground text-center sm:text-left">
                    Jami: <span className="font-medium text-foreground">{totalUsers}</span> ta
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px]"
                    >
                        Oldingi
                    </button>
                    <span className="text-sm font-medium whitespace-nowrap">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-3 py-1.5 text-sm border border-border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px]"
                    >
                        Keyingi
                    </button>
                </div>
            </div>
        </div>
    );
}
