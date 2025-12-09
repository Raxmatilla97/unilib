"use client";

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
    const pathname = usePathname();

    // Show footer only on landing page
    const isLandingPage = pathname === '/';

    if (!isLandingPage) {
        return null;
    }

    return <Footer />;
}
