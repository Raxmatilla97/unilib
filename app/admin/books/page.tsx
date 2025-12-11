import { redirect } from 'next/navigation';

export default function BooksManagementPage() {
    // Redirect to online books page since we have separate pages
    redirect('/admin/books/online');
}
