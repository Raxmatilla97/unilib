"use client";

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    if (!isLandingPage) {
        return null;
    }

    return <Footer />;
}
