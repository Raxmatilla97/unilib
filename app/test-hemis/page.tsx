"use client";

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestHemisPage() {
    const [studentId, setStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testHemis = async () => {
        if (!studentId.trim()) {
            setError('Student ID kiriting');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/hemis/verify-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId: studentId.trim() }),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || 'Xatolik yuz berdi');
            }
        } catch (err: any) {
            setError(err.message || 'Network xatosi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">HEMIS API Test</h1>
                <p className="text-muted-foreground mb-8">
                    Student ID kiriting va HEMIS dan ma'lumot olishni sinab koʻring
                </p>

                <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <label className="block text-sm font-medium mb-2">
                        Student ID (11-12 raqam)
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            placeholder="463241100012"
                            maxLength={12}
                            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            onKeyDown={(e) => e.key === 'Enter' && testHemis()}
                        />
                        <button
                            onClick={testHemis}
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Tekshirilmoqda...
                                </>
                            ) : (
                                'Tekshirish'
                            )}
                        </button>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Mock test uchun:</p>
                        <p>• 12345678901 - Alisher Navoiy</p>
                        <p>• 98765432109 - Nodira Begim</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-500">Xatolik</p>
                            <p className="text-sm text-red-500/80">{error}</p>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <p className="font-medium text-green-500">
                                Muvaffaqiyatli! ({result.source === 'mock' ? 'Mock data' : 'HEMIS API'})
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Student ID</p>
                                    <p className="font-medium">{result.data.studentId}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Toʻliq ism</p>
                                    <p className="font-medium">{result.data.fullName}</p>
                                </div>
                            </div>

                            {result.data.email && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Email</p>
                                    <p className="font-medium">{result.data.email}</p>
                                </div>
                            )}

                            {result.data.department && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Kafedra</p>
                                    <p className="font-medium">
                                        {result.data.department}
                                        {result.data.departmentCode && ` (${result.data.departmentCode})`}
                                    </p>
                                </div>
                            )}

                            {result.data.group && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Guruh</p>
                                    <p className="font-medium">{result.data.group}</p>
                                </div>
                            )}

                            {result.data.faculty && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Fakultet</p>
                                    <p className="font-medium">{result.data.faculty}</p>
                                </div>
                            )}

                            {result.data.specialty && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Mutaxassislik</p>
                                    <p className="font-medium">{result.data.specialty}</p>
                                </div>
                            )}

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                    Raw JSON koʻrish
                                </summary>
                                <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </details>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
