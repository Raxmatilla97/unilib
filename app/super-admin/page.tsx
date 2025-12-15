"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Plus, Users, BookOpen, Settings, Search, UserPlus } from 'lucide-react';
import { ROLES } from '@/lib/permissions';

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

export default function SuperAdminPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedOrgForAdmin, setSelectedOrgForAdmin] = useState<Organization | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        checkAccess();
        fetchOrganizations();
    }, [user]);

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

    const fetchOrganizations = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setOrganizations(data);
        }
        setIsLoading(false);
    };

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <div className="container py-10 px-4 md:px-6 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Super Admin Panel</h1>
                    <p className="text-muted-foreground">Platformadagi barcha tashkilotlarni boshqaring</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            <span className="text-sm text-muted-foreground">Tashkilotlar</span>
                        </div>
                        <p className="text-3xl font-bold">{organizations.length}</p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Faol</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {organizations.filter(o => o.subscription_status === 'active').length}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-muted-foreground">Premium</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {organizations.filter(o => o.subscription_tier === 'premium' || o.subscription_tier === 'enterprise').length}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-5 h-5 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Free</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {organizations.filter(o => o.subscription_tier === 'free').length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tashkilot qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border focus:border-primary outline-none"
                        />
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Yangi Tashkilot
                    </button>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left px-6 py-4 font-semibold">Nomi</th>
                                    <th className="text-left px-6 py-4 font-semibold">Turi</th>
                                    <th className="text-left px-6 py-4 font-semibold">Obuna</th>
                                    <th className="text-left px-6 py-4 font-semibold">Status</th>
                                    <th className="text-left px-6 py-4 font-semibold">Talabalar</th>
                                    <th className="text-left px-6 py-4 font-semibold">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                            <p className="text-muted-foreground">Yuklanmoqda...</p>
                                        </td>
                                    </tr>
                                ) : filteredOrgs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-muted-foreground">
                                            Tashkilotlar topilmadi
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrgs.map((org) => (
                                        <tr key={org.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={`/super-admin/organizations/${org.id}`} className="block hover:text-primary transition-colors">
                                                    <p className="font-semibold">{org.name}</p>
                                                    <p className="text-sm text-muted-foreground">{org.slug}</p>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                    {org.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${org.subscription_tier === 'enterprise' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                                                    org.subscription_tier === 'premium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                        'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                    }`}>
                                                    {org.subscription_tier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${org.subscription_status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                    {org.subscription_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {org.max_students.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedOrgForAdmin(org)}
                                                    className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                    title="Admin qoʻshish"
                                                >
                                                    <UserPlus className="w-5 h-5" />
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

            {showCreateModal && (
                <CreateOrganizationModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchOrganizations();
                    }}
                />
            )}

            {selectedOrgForAdmin && (
                <CreateAdminModal
                    organization={selectedOrgForAdmin}
                    onClose={() => setSelectedOrgForAdmin(null)}
                    onSuccess={() => {
                        setSelectedOrgForAdmin(null);
                        alert('Admin muvaffaqiyatli yaratildi!');
                    }}
                />
            )}
        </div>
    );
}

function CreateOrganizationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        type: 'school',
        subscription_tier: 'free',
        max_students: 200
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const { error: insertError } = await supabase
            .from('organizations')
            .insert([formData]);

        if (insertError) {
            setError(insertError.message);
            setIsSubmitting(false);
            return;
        }

        onSuccess();
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Yangi Tashkilot Yaratish</h2>

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
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                    slug: generateSlug(e.target.value)
                                });
                            }}
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
                            <option value="free">Free (200 talaba)</option>
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
                            {isSubmitting ? 'Yuklanmoqda...' : 'Yaratish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CreateAdminModal({ organization, onClose, onSuccess }: { organization: Organization; onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
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
                    organization_id: organization.id,
                    role: 'org_admin'
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
                            {isSubmitting ? 'Yaratilmoqda...' : 'Qo\'shish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
