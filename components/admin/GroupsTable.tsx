"use client";

import { useState } from 'react';
import {
    Search,
    Trash2,
    MessageSquare,
    Users
} from 'lucide-react';
import { deleteGroup } from '@/app/admin/groups/actions';

interface Group {
    id: string;
    name: string;
    description?: string;
    members_count: number;
    created_at: string;
    is_active: boolean;
    books?: {
        title: string;
    };
}

interface GroupsTableProps {
    groups: Group[];
}

export function GroupsTable({ groups: initialGroups }: GroupsTableProps) {
    const [groups, setGroups] = useState(initialGroups);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const filteredGroups = groups.filter(group =>
        group.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (groupId: string) => {
        if (!confirm('Bu guruhni o\'chirishga ishonchingiz komilmi?')) return;

        setIsLoading(groupId);
        try {
            const result = await deleteGroup(groupId);
            if (result.success) {
                setGroups(groups.filter(g => g.id !== groupId));
            } else {
                alert('Guruhni o\'chirishda xatolik yuz berdi');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(null);
        }
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
                                <th className="px-4 py-3">Guruh Nomi</th>
                                <th className="px-4 py-3">Kitob</th>
                                <th className="px-4 py-3">A'zolar</th>
                                <th className="px-4 py-3">Holat</th>
                                <th className="px-4 py-3 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredGroups.map((group) => (
                                <tr key={group.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{group.name}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-1">{group.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{group.books?.title || '-'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Users className="w-3 h-3" />
                                            {group.members_count || 0}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${group.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                                            }`}>
                                            {group.is_active ? 'Faol' : 'Nofaol'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(group.id)}
                                            disabled={isLoading === group.id}
                                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                                            title="O'chirish"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredGroups.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        Guruhlar topilmadi
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredGroups.length === 0 ? (
                    <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                        Guruhlar topilmadi
                    </div>
                ) : (
                    filteredGroups.map((group) => (
                        <div key={group.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                            {/* Group Info */}
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base">{group.name}</h3>
                                    {group.description && (
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground">Kitob</p>
                                    <p className="text-sm font-medium mt-1">{group.books?.title || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">A'zolar</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{group.members_count || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-border">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${group.is_active ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
                                    }`}>
                                    {group.is_active ? 'Faol' : 'Nofaol'}
                                </span>
                                <button
                                    onClick={() => handleDelete(group.id)}
                                    disabled={isLoading === group.id}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors font-medium text-sm disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    O'chirish
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
