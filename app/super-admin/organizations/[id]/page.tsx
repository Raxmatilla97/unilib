"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/permissions';
import {
    Building2,
    Users,
    Edit,
    Power,
    ArrowLeft,
    Mail,
    Calendar,
    Shield,
    Trash2,
    UserPlus
} from 'lucide-react';

interface Organization {
    id: string;
    name: string;
    slug: string;
    type: string;
    subscription_tier: string;
    subscription_status: string;
    max_students: number;
    created_at: string;
}

interface OrgUser {
    id: string;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export default function OrganizationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddAdminModal, setShowAddAdminModal] = useState(false);

    useEffect(() => {
        checkAccess();
        fetchOrganizationDetails();
        fetchOrgUsers();
    }, [params.id, user]);

    const checkAccess = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== ROLES.SUPER_ADMIN) {
            router.push('/dashboard');
        }
    };

    const fetchOrganizationDetails = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', params.id)
            .single();

        if (!error && data) {
            setOrganization(data);
        }
        setIsLoading(false);
    };

    const fetchOrgUsers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, name, role, is_active, created_at')
            .eq('organization_id', params.id)
            .in('role', ['org_admin', 'head_librarian', 'librarian'])
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrgUsers(data);
        }
    };

    const handleDeactivate = async () => {
        if (!confirm('Tashkilotni nofaol qilmoqchimisiz?')) return;

        const { error } = await supabase
            .from('organizations')
            .update({ subscription_status: 'inactive' })
            .eq('id', params.id);

        if (!error) {
            alert('Tashkilot nofaol qilindi');
            fetchOrganizationDetails();
        }
    };

    const handleActivate = async () => {
        const { error } = await supabase
            .from('organizations')
            .update({ subscription_status: 'active' })
            .eq('id', params.id);

        if (!error) {
            alert('Tashkilot faollashtirildi');
            fetchOrganizationDetails();
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Foydalanuvchini o\'chirmoqchimisiz?')) return;

        const { error } = await supabase
            .from('profiles')
            .update({ is_active: false })
            .eq('id', userId);

        if (!error) {
            alert('Foydalanuvchi nofaol qilindi');
            fetchOrgUsers();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Tashkilot topilmadi</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container py-10 px-4 md:px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/super-admin')}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Orqaga
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{organization.name}</h1>
                            <p className="text-muted-foreground">{organization.slug}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Tahrirlash
                            </button>
                            {organization.subscription_status === 'active' ? (
                                <button
                                    onClick={handleDeactivate}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                                >
                                    <Power className="w-4 h-4" />
                                    Nofaol qilish
                                </button>
                            ) : (
                                <button
                                    onClick={handleActivate}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                                >
                                    <Power className="w-4 h-4" />
                                    Faollashtirish
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Organization Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Turi</span>
                        </div>
                        <p className="text-2xl font-bold capitalize">{organization.type}</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Obuna</span>
                        </div>
                        <p className="text-2xl font-bold capitalize">{organization.subscription_tier}</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Status</span>
                        </div>
                        <p className="text-2xl font-bold capitalize">{organization.subscription_status}</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Max Talabalar</span>
                        </div>
                        <p className="text-2xl font-bold">{organization.max_students.toLocaleString()}</p>
                    </div>
                </div>

                {/* Admins Section */}
                <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Adminlar va Xodimlar</h2>
                        <button
                            onClick={() => setShowAddAdminModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            Admin qoʻshish
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold">Ism</th>
                                    <th className="text-left px-6 py-4 font-semibold">Email</th>
                                    <th className="text-left px-6 py-4 font-semibold">Rol</th>
                                    <th className="text-left px-6 py-4 font-semibold">Status</th>
                                    <th className="text-left px-6 py-4 font-semibold">Yaratilgan</th>
                                    <th className="text-left px-6 py-4 font-semibold">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orgUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                            Hali adminlar yoʻq
                                        </td>
                                    </tr>
                                ) : (
                                    orgUsers.map((orgUser) => (
                                        <tr key={orgUser.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium">{orgUser.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    {orgUser.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                    {orgUser.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${orgUser.is_active
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                    {orgUser.is_active ? 'Faol' : 'Nofaol'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(orgUser.created_at).toLocaleDateString('uz-UZ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteUser(orgUser.id)}
                                                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                    title="Nofaol qilish"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <EditOrganizationModal
                    organization={organization}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        fetchOrganizationDetails();
                    }}
                />
            )}

            {/* Add Admin Modal */}
            {showAddAdminModal && (
                <AddAdminModal
                    organization={organization}
                    onClose={() => setShowAddAdminModal(false)}
                    onSuccess={() => {
                        setShowAddAdminModal(false);
                        fetchOrgUsers();
                    }}
                />
            )}
        </div>
    );
}

function EditOrganizationModal({ organization, onClose, onSuccess }: {
    organization: Organization;
    onClose: () => void;
    onSuccess: () => void
}) {
    const [formData, setFormData] = useState({
        name: organization.name,
        slug: organization.slug,
        type: organization.type,
        subscription_tier: organization.subscription_tier,
        max_students: organization.max_students
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const { error: updateError } = await supabase
            .from('organizations')
            .update(formData)
            .eq('id', organization.id);

        if (updateError) {
            setError(updateError.message);
            setIsSubmitting(false);
            return;
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Tashkilotni Tahrirlash</h2>

                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nomi</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Turi</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        >
                            <option value="school">Maktab</option>
                            <option value="college">Kollej</option>
                            <option value="university">Universitet</option>
                            <option value="public_library">Ommaviy Kutubxona</option>
                            <option value="private_library">Xususiy Kutubxona</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Obuna Turi</label>
                        <select
                            value={formData.subscription_tier}
                            onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        >
                            <option value="free">Free</option>
                            <option value="basic">Basic</option>
                            <option value="premium">Premium</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Maksimal Talabalar</label>
                        <input
                            type="number"
                            value={formData.max_students}
                            onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                            min="1"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddAdminModal({ organization, onClose, onSuccess }: {
    organization: Organization;
    onClose: () => void;
    onSuccess: () => void
}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'org_admin'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    organization_id: organization.id
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create admin');
            }

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-2">Admin Qoʻshish</h2>
                <p className="text-muted-foreground mb-6">
                    <span className="font-semibold text-foreground">{organization.name}</span> uchun yangi admin
                </p>

                {error && (
                    <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Ism</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Parol</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Rol</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        >
                            <option value="org_admin">Organization Admin</option>
                            <option value="head_librarian">Head Librarian</option>
                            <option value="librarian">Librarian</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-xl border border-border hover:bg-muted transition-colors"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Yaratish' : 'Qo\'shish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
