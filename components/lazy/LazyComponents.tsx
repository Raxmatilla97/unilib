'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'

// Loading fallback component
function LoadingFallback({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    )
}

// Lazy load Chart components
export const LazyLineChart = dynamic(
    () => import('recharts').then(mod => ({ default: mod.LineChart })),
    {
        loading: () => <LoadingFallback message="Loading chart..." />,
        ssr: false,
    }
)

export const LazyBarChart = dynamic(
    () => import('recharts').then(mod => ({ default: mod.BarChart })),
    {
        loading: () => <LoadingFallback message="Loading chart..." />,
        ssr: false,
    }
)

// Lazy load QR Code generator
export const LazyQRCode = dynamic(
    () => import('qrcode.react').then(mod => ({ default: mod.QRCodeSVG })),
    {
        loading: () => <LoadingFallback message="Generating QR code..." />,
        ssr: false,
    }
)

// Lazy load Barcode generator  
export const LazyBarcode = dynamic(
    () => import('react-barcode').then(mod => mod),
    {
        loading: () => <LoadingFallback message="Generating barcode..." />,
        ssr: false,
    }
)

// Lazy load heavy admin components
export const LazyBooksTable = dynamic(
    () => import('@/components/admin/BooksTable').then(mod => ({ default: mod.BooksTable })),
    {
        loading: () => <LoadingFallback message="Loading books table..." />,
        ssr: false,
    }
)

export const LazyUsersTable = dynamic(
    () => import('@/components/admin/UsersTable').then(mod => ({ default: mod.UsersTable })),
    {
        loading: () => <LoadingFallback message="Loading users table..." />,
        ssr: false,
    }
)

// Generic lazy wrapper with Suspense
export function withLazyLoad<P extends object>(
    Component: ComponentType<P>,
    fallbackMessage?: string
) {
    return function LazyComponent(props: P) {
        return (
            <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
                <Component {...props} />
            </Suspense>
        )
    }
}
