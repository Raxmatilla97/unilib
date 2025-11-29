"use client";

import { AdminRoute } from '@/components/admin/AdminRoute';
import { BookForm } from '@/components/admin/BookForm';

export default function CreateBookPage() {
    return (
        <AdminRoute>
            <BookForm />
        </AdminRoute>
    );
}
