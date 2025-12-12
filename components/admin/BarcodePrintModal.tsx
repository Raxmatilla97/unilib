"use client";

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { X, Printer } from 'lucide-react';

interface BarcodePrintModalProps {
    barcodes: string[];
    onClose: () => void;
}

export function BarcodePrintModal({ barcodes, onClose }: BarcodePrintModalProps) {
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

    useEffect(() => {
        // Generate barcodes
        barcodes.forEach((barcode, index) => {
            const canvas = canvasRefs.current[index];
            if (canvas) {
                try {
                    JsBarcode(canvas, barcode, {
                        format: 'CODE128',
                        width: 3,
                        height: 100,
                        displayValue: true,
                        fontSize: 20,
                        margin: 10
                    });
                } catch (error) {
                    console.error('Barcode generation error:', error);
                }
            }
        });
    }, [barcodes]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border no-print">
                    <h2 className="text-2xl font-bold">Barcode Chop Etish</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Barcodes */}
                <div className="p-6 space-y-8">
                    {barcodes.map((barcode, index) => (
                        <div key={index} className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-white barcode-label">
                            <canvas
                                ref={(el) => { canvasRefs.current[index] = el; }}
                                className="mb-2"
                            />
                            <p className="text-lg font-mono font-bold text-black mt-2">
                                {barcode}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                                Nusxa #{index + 1}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 p-6 border-t border-border no-print">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                        Yopish
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl font-medium"
                    >
                        <Printer className="w-5 h-5" />
                        Chop Etish
                    </button>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .barcode-label,
                    .barcode-label * {
                        visibility: visible;
                    }
                    .barcode-label {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        page-break-after: always;
                    }
                    .barcode-label:last-child {
                        page-break-after: auto;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
