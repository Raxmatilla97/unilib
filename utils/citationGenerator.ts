export type CitationFormat = 'APA' | 'MLA' | 'Chicago' | 'Harvard';

export interface BookMetadata {
    title: string;
    authorFirst: string;
    authorLast: string;
    year: string;
    publisher: string;
    city?: string;
}

export function generateCitation(book: BookMetadata, format: CitationFormat): string {
    const { title, authorFirst, authorLast, year, publisher, city = 'New York' } = book;

    switch (format) {
        case 'APA':
            return `${authorLast}, ${authorFirst[0]}. (${year}). ${title}. ${publisher}.`;
        case 'MLA':
            return `${authorLast}, ${authorFirst}. ${title}. ${publisher}, ${year}.`;
        case 'Chicago':
            return `${authorLast}, ${authorFirst}. ${title}. ${city}: ${publisher}, ${year}.`;
        case 'Harvard':
            return `${authorLast}, ${authorFirst[0]}. (${year}) ${title}. ${city}: ${publisher}.`;
        default:
            return '';
    }
}
