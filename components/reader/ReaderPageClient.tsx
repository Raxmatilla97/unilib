"use client";

import { useRouter } from 'next/navigation';
import { BookReader } from './BookReader';

interface ReaderPageClientProps {
    book: {
        id: string;
        title: string;
        file_url: string;
    };
}

export function ReaderPageClient({ book }: ReaderPageClientProps) {
    const router = useRouter();

    return (
        <BookReader
            fileUrl={book.file_url}
            bookTitle={book.title}
            bookId={book.id}
            onClose={() => router.push('/dashboard')}
        />
    );
}
