"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { History, Search, Download, User, BookOpen, Calendar, Check, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Transaction {
    id: string;
    user_id: string;
    physical_copy_id: string;
    checked_out_at: string;
    due_date: string;
    returned_at: string | null;
    status: 'active' | 'returned';
    profiles: {
        name: string;
        student_id: string;
        student_number: string;
    };
    physical_book_copies: {
        copy_number: number;
        barcode: string;
        books: {
            title: string;
            author: string;
        };
    };
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const itemsPerPage = 50;

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    useEffect(() => {
        filterTransactions();
    }, [transactions, statusFilter, searchQuery]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const startTime = performance.now();

            // Fetch data with count in single query
            const { data, error, count } = await supabase
                .from('book_checkouts')
                .select(`
                    id,
                    user_id,
                    physical_copy_id,
                    checked_out_at,
                    due_date,
                    returned_at,
                    status,
                    librarian_id,
                    profiles!book_checkouts_user_id_fkey(
                        name,
                        student_id,
                        student_number
                    ),
                    librarian:profiles!book_checkouts_librarian_id_fkey(
                        name,
                        email
                    ),
                    physical_book_copies(
                        copy_number,
                        barcode,
                        books(title, author)
                    )
                `, { count: 'exact' })
                .order('checked_out_at', { ascending: false })
                .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

            const queryTime = performance.now() - startTime;
            console.log(`⏱️ Transactions query took: ${queryTime.toFixed(2)}ms`);
            console.log('📊 Total count:', count);
            console.log('� Data length:', data?.length);

            if (error) throw error;

            setTotalCount(count || 0);
            setTransactions((data as unknown) as Transaction[] || []);
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
                const studentName = t.profiles?.name?.toLowerCase() || '';
                const studentId = t.profiles?.student_id?.toLowerCase() || '';
                const studentNumber = t.profiles?.student_number?.toLowerCase() || '';
                const bookTitle = t.physical_book_copies?.books?.title?.toLowerCase() || '';
                return studentName.includes(query) ||
                    studentId.includes(query) ||
                    studentNumber.includes(query) ||
                    bookTitle.includes(query);
            });
        }

        setFilteredTransactions(filtered);
    };

    const getStatusBadge = (transaction: Transaction) => {
        const dueDate = new Date(transaction.due_date);
        const isOverdue = transaction.status === 'active' && dueDate < new Date();

        if (isOverdue) {
            return (
                <span className="px-2 py-1 bg-red-500/10 text-red-600 text-xs rounded-full font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Muddati oʻtgan
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
        // Add UTF-8 BOM for Excel compatibility
        const BOM = '\uFEFF';
        const headers = [
            'Talaba',
            'Student ID',
            'Kitob',
            'Muallif',
            'Nusxa',
            'Kutubxonachi',
            'Kutubxonachi Email',
            'Berilgan Sana',
            'Berilgan Vaqt',
            'Muddat',
            'Qaytarilgan Sana',
            'Qaytarilgan Vaqt',
            'Holat'
        ];

        const rows = filteredTransactions.map(t => {
            const checkedOutDate = new Date(t.checked_out_at);
            const returnedDate = t.returned_at ? new Date(t.returned_at) : null;

            return [
                t.profiles?.name || '',
                // Add tab character to force text format in Excel
                '\t' + (t.profiles?.student_number || t.profiles?.student_id || ''),
                t.physical_book_copies?.books?.title || '',
                t.physical_book_copies?.books?.author || '',
                t.physical_book_copies?.copy_number || '',
                (t as any).librarian?.name || 'N/A',
                (t as any).librarian?.email || '',
                checkedOutDate.toLocaleDateString('uz-UZ'),
                checkedOutDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
                new Date(t.due_date).toLocaleDateString('uz-UZ'),
                returnedDate ? returnedDate.toLocaleDateString('uz-UZ') : '',
                returnedDate ? returnedDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '',
                t.status === 'active' ? 'Aktiv' : 'Qaytarilgan'
            ];
        });

        // Use semicolon delimiter for better Excel compatibility
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\r\n');

        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qarzlar_tarixi_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <History className="w-8 h-8 text-primary" />
                        Qarzlar Tarixi
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Barcha kitob qarzlari va qaytarishlar ({totalCount} ta)
                    </p>
                </div>
                <button
                    onClick={exportToCSV}
                    disabled={filteredTransactions.length === 0}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
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
                            <option value="overdue">Muddati oʻtgan</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-muted-foreground">Jami</p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-blue-600">Aktiv</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {transactions.filter(t => t.status === 'active').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-green-600">Qaytarilgan</p>
                    <p className="text-2xl font-bold text-green-600">
                        {transactions.filter(t => t.status === 'returned').length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-red-600">Muddati oʻtgan</p>
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
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Talaba</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Kitob</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Kutubxonachi</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Berilgan</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Muddat / Qaytarilgan</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium">Holat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{transaction.profiles?.name}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {transaction.profiles?.student_number || transaction.profiles?.student_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{transaction.physical_book_copies?.books?.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Nusxa #{transaction.physical_book_copies?.copy_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <p className="font-medium">{(transaction as any).librarian?.name || 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground">{(transaction as any).librarian?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    <div>
                                                        <p>{new Date(transaction.checked_out_at).toLocaleDateString('uz-UZ')}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(transaction.checked_out_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm">
                                                    <p className="font-medium">
                                                        Muddat: {new Date(transaction.due_date).toLocaleDateString('uz-UZ')}
                                                    </p>
                                                    {transaction.returned_at && (
                                                        <p className="text-xs text-green-600 mt-1">
                                                            ✓ Qaytarilgan: {new Date(transaction.returned_at).toLocaleDateString('uz-UZ')} {new Date(transaction.returned_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(transaction)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                                <p className="text-sm text-muted-foreground">
                                    Sahifa {currentPage} / {totalPages}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Oldingi
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1.5 bg-background border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                    >
                                        Keyingi
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
