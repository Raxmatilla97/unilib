"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { History, Search, Filter, Download, User, BookOpen, Calendar, Check, Clock, AlertCircle } from 'lucide-react';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [transactions, statusFilter, searchQuery]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('book_checkouts')
                .select(`
                    *,
                    profiles!book_checkouts_user_id_fkey(name, student_id),
                    physical_book_copies(
                        copy_number,
                        barcode,
                        books(title, author)
                    )
                `)
                .order('checked_out_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterTransactions = () => {
        let filtered = [...transactions];

        // Status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'overdue') {
                filtered = filtered.filter(t =>
                    t.status === 'active' && new Date(t.due_date) < new Date()
                );
            } else {
                filtered = filtered.filter(t => t.status === statusFilter);
            }
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t => {
                const studentName = (t.profiles as any)?.name?.toLowerCase() || '';
                const studentId = (t.profiles as any)?.student_id?.toLowerCase() || '';
                const bookTitle = ((t.physical_book_copies as any)?.books as any)?.title?.toLowerCase() || '';
                return studentName.includes(query) || studentId.includes(query) || bookTitle.includes(query);
            });
        }

        setFilteredTransactions(filtered);
    };

    const getStatusBadge = (transaction: any) => {
        const dueDate = new Date(transaction.due_date);
        const isOverdue = transaction.status === 'active' && dueDate < new Date();

        if (isOverdue) {
            return (
                <span className="px-2 py-1 bg-red-500/10 text-red-600 text-xs rounded-full font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Muddati o'tgan
                </span>
            );
        }

        if (transaction.status === 'active') {
            return (
                <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-xs rounded-full font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Aktiv
                </span>
            );
        }

        return (
            <span className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded-full font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                Qaytarilgan
            </span>
        );
    };

    const exportToCSV = () => {
        const csv = [
            ['Student', 'Student ID', 'Kitob', 'Nusxa', 'Berilgan', 'Muddat', 'Qaytarilgan', 'Holat'],
            ...filteredTransactions.map(t => [
                (t.profiles as any)?.name || '',
                (t.profiles as any)?.student_id || '',
                ((t.physical_book_copies as any)?.books as any)?.title || '',
                (t.physical_book_copies as any)?.copy_number || '',
                new Date(t.checked_out_at).toLocaleDateString(),
                new Date(t.due_date).toLocaleDateString(),
                t.returned_at ? new Date(t.returned_at).toLocaleDateString() : '',
                t.status
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <History className="w-8 h-8 text-primary" />
                        Qarzlar Tarixi
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Barcha kitob qarzlari va qaytarishlar
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Qidiruv</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Talaba yoki kitob qidiring..."
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-2 block">Holat</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
                        >
                            <option value="all">Barchasi</option>
                            <option value="active">Aktiv</option>
                            <option value="returned">Qaytarilgan</option>
                            <option value="overdue">Muddati o'tgan</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">Jami</p>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <p className="text-sm text-blue-600">Aktiv</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {transactions.filter(t => t.status === 'active').length}
                    </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-sm text-green-600">Qaytarilgan</p>
                    <p className="text-2xl font-bold text-green-600">
                        {transactions.filter(t => t.status === 'returned').length}
                    </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-sm text-red-600">Muddati o'tgan</p>
                    <p className="text-2xl font-bold text-red-600">
                        {transactions.filter(t => t.status === 'active' && new Date(t.due_date) < new Date()).length}
                    </p>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Yuklanmoqda...</div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Hech narsa topilmadi</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Talaba</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Kitob</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Berilgan</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Muddat</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium">Holat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredTransactions.map((transaction) => {
                                    const student = transaction.profiles as any;
                                    const copy = transaction.physical_book_copies as any;
                                    const book = copy?.books as any;

                                    return (
                                        <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{student?.name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{student?.student_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{book?.title}</p>
                                                        <p className="text-xs text-muted-foreground">Nusxa #{copy?.copy_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    {new Date(transaction.checked_out_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    {new Date(transaction.due_date).toLocaleDateString()}
                                                    {transaction.returned_at && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Qaytarilgan: {new Date(transaction.returned_at).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(transaction)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
