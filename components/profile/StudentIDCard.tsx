'use client';

import { useState, useEffect } from 'react';

interface StudentIDCardProps {
    studentNumber: string;
    studentId?: string;  // Year-based student ID (e.g., 24001)
}

export default function StudentIDCard({ studentNumber, studentId }: StudentIDCardProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [barcodeUrl, setBarcodeUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateCodes = async () => {
            if (!studentNumber) {
                setIsLoading(false);
                return;
            }

            try {
                // Check cache first
                const qrCacheKey = `qr-${studentNumber}`;
                const barcodeCacheKey = `barcode-${studentNumber}`;

                const qrCached = localStorage.getItem(qrCacheKey);
                const barcodeCached = localStorage.getItem(barcodeCacheKey);

                if (qrCached && barcodeCached) {
                    setQrCodeUrl(qrCached);
                    setBarcodeUrl(barcodeCached);
                    setIsLoading(false);
                    return;
                }

                // Generate QR Code
                const qrCanvas = document.createElement('canvas');
                const QRCode = (await import('qrcode')).default;
                await QRCode.toCanvas(qrCanvas, studentNumber, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                const qrDataUrl = qrCanvas.toDataURL();

                // Generate Barcode
                const barcodeCanvas = document.createElement('canvas');
                const JsBarcode = (await import('jsbarcode')).default;
                JsBarcode(barcodeCanvas, studentNumber, {
                    format: 'CODE128',
                    width: 2,
                    height: 60,
                    displayValue: true,
                    fontSize: 14,
                    margin: 5
                });
                const barcodeDataUrl = barcodeCanvas.toDataURL();

                // Cache the results
                localStorage.setItem(qrCacheKey, qrDataUrl);
                localStorage.setItem(barcodeCacheKey, barcodeDataUrl);

                setQrCodeUrl(qrDataUrl);
                setBarcodeUrl(barcodeDataUrl);
            } catch (error) {
                console.error('Error generating codes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Small delay to prevent blocking render
        const timer = setTimeout(generateCodes, 100);
        return () => clearTimeout(timer);
    }, [studentNumber]);

    if (!studentNumber && !studentId) {
        return null;
    }

    return (
        <div className="bg-card/80 backdrop-blur-xl border border-border/40 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold mb-4 text-base">Talaba ID</h3>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Student ID - Modern ID Card Style */}
                    {studentId && (
                        <div className="relative overflow-hidden rounded-2xl mb-4 shadow-2xl">
                            {/* Static gradient background - Fresh university colors */}
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500"></div>

                            {/* Glassmorphism overlay */}
                            <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 p-8">
                                {/* Decorative corner elements */}
                                <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2 border-white/40 rounded-tl-lg"></div>
                                <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2 border-white/40 rounded-tr-lg"></div>
                                <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2 border-white/40 rounded-bl-lg"></div>
                                <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2 border-white/40 rounded-br-lg"></div>

                                {/* Content */}
                                <div className="text-center space-y-3">
                                    <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                                        <p className="text-xs font-semibold text-white uppercase tracking-widest">
                                            Student ID
                                        </p>
                                    </div>

                                    <div className="relative">
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 blur-2xl bg-white/30 rounded-lg"></div>
                                        <p className="relative text-6xl font-black text-white tracking-wider drop-shadow-2xl">
                                            {studentId}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 pt-2">
                                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                                        <div className="w-2 h-2 rounded-full bg-white/60"></div>
                                        <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QR Code */}
                    {qrCodeUrl && (
                        <div className="bg-white p-4 rounded-xl flex items-center justify-center mb-4 shadow-md">
                            <img
                                src={qrCodeUrl}
                                alt="Student QR Code"
                                className="w-48 h-48"
                            />
                        </div>
                    )}

                    {/* Barcode */}
                    {barcodeUrl && (
                        <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center mb-4 shadow-md">
                            <img
                                src={barcodeUrl}
                                alt="Student Barcode"
                                className="max-w-full h-auto"
                            />
                        </div>
                    )}

                    <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                            Kutubxonachiga koʻrsating
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
