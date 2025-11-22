"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, Moon, Sun, ZoomIn, ZoomOut, BookOpen, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface BookReaderProps {
    fileUrl: string;
    bookTitle: string;
    bookId: string;
    onClose: () => void;
}

export function BookReader({ fileUrl, bookTitle, bookId, onClose }: BookReaderProps) {
    const { user } = useAuth();
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [scale, setScale] = useState<number>(1.0);
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [activeSchedule, setActiveSchedule] = useState<any>(null);
    const [sessionStartPage, setSessionStartPage] = useState<number>(0);
    const [initialDailyPages, setInitialDailyPages] = useState<number>(0);
    const initializedRef = useRef(false);
    const [dualPageMode, setDualPageMode] = useState<boolean>(false);
    const [pageWidth, setPageWidth] = useState<number>(window.innerWidth * 0.3);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch initial data (progress, schedule, daily stats)
    useEffect(() => {
        if (!user || !bookId || initializedRef.current) return;

        const fetchInitialData = async () => {
            try {
                // 1. Get User Progress
                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('current_page')
                    .eq('user_id', user.id)
                    .eq('book_id', bookId)
                    .single();

                if (progressData?.current_page) {
                    setPageNumber(progressData.current_page);
                    setSessionStartPage(progressData.current_page);
                } else {
                    setSessionStartPage(1);
                }

                // 2. Get Active Schedule
                const now = new Date();
                const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                console.log('Checking schedule for date:', today);

                const { data: scheduleData } = await supabase
                    .from('reading_schedule')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('book_id', bookId)
                    .eq('status', 'active')
                    .lte('start_date', today)
                    .gte('end_date', today)
                    .single();

                if (scheduleData) {
                    console.log('Found active schedule:', scheduleData);
                    setActiveSchedule(scheduleData);

                    // 3. Get Daily Progress for today
                    const { data: dailyData } = await supabase
                        .from('daily_progress')
                        .select('pages_read')
                        .eq('schedule_id', scheduleData.id)
                        .eq('date', today)
                        .single();

                    if (dailyData) {
                        console.log('Found daily progress:', dailyData);
                        setInitialDailyPages(dailyData.pages_read || 0);
                    }
                } else {
                    console.log('No active schedule found for this book and date');
                }

                initializedRef.current = true;
            } catch (error) {
                console.error('Error fetching initial reader data:', error);
            }
        };

        fetchInitialData();
    }, [user, bookId]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setLoading(false);
    }

    function previousPage() {
        const step = dualPageMode ? 2 : 1;
        setPageNumber(prev => Math.max(prev - step, 1));
    }

    function nextPage() {
        const step = dualPageMode ? 2 : 1;
        setPageNumber(prev => Math.min(prev + step, numPages));
    }

    // Save progress when page changes
    const saveProgress = useCallback(async () => {
        if (!user || !bookId || numPages === 0) return;

        try {
            const progress = Math.round((pageNumber / numPages) * 100);
            const safeProgress = Math.min(100, Math.max(0, progress));

            // 1. Update User Progress (General)
            await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    book_id: bookId,
                    current_page: pageNumber,
                    total_pages: numPages,
                    progress_percentage: safeProgress,
                    last_read_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id,book_id'
                });

            // 2. Update Daily Progress (If active schedule exists)
            if (activeSchedule) {
                const pagesReadInSession = Math.max(0, pageNumber - sessionStartPage);
                const totalDailyPages = initialDailyPages + pagesReadInSession;

                const now = new Date();
                const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                console.log('Saving daily progress:', {
                    schedule_id: activeSchedule.id,
                    date: today,
                    pages_read: totalDailyPages,
                    session_pages: pagesReadInSession
                });

                await supabase
                    .from('daily_progress')
                    .upsert({
                        schedule_id: activeSchedule.id,
                        date: today,
                        pages_read: totalDailyPages,
                        completed: totalDailyPages >= (activeSchedule.daily_goal_pages || 0)
                    }, {
                        onConflict: 'schedule_id,date'
                    });
            }

        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [user, bookId, pageNumber, numPages, activeSchedule, sessionStartPage, initialDailyPages]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveProgress();
        }, 1000);

        return () => clearTimeout(timer);
    }, [saveProgress]);

    function zoomIn() {
        setScale(prev => {
            const newScale = Math.min(prev + 0.2, 3.0);
            setPageWidth(window.innerWidth * 0.3 * newScale);
            return newScale;
        });
    }

    function zoomOut() {
        setScale(prev => {
            const newScale = Math.max(prev - 0.2, 0.5);
            setPageWidth(window.innerWidth * 0.3 * newScale);
            return newScale;
        });
    }

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') previousPage();
        if (e.key === 'ArrowRight') nextPage();
    };

    // Disable body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Scroll to top when page changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
    }, [pageNumber]);

    return (
        <div
            className={`fixed inset-0 z-50 transition-colors duration-200 ${darkMode ? 'bg-[#2d2d2d]' : 'bg-white'}`}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
                className={`fixed top-4 right-4 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                title="Yopish (Esc)"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Dark Mode Toggle - Top Left */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className={`fixed top-4 left-4 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                title={darkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
            >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            {/* Dual Page Mode Toggle - Top Left (below dark mode) */}
            <button
                onClick={() => setDualPageMode(!dualPageMode)}
                className={`fixed top-20 left-4 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                title={dualPageMode ? 'Bitta sahifa' : '2 sahifa (kitob kabi)'}
            >
                {dualPageMode ? <FileText className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            </button>

            {/* Zoom Out Button - Bottom Left */}
            <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className={`fixed bottom-20 left-4 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                title="Kichiklashtirish"
            >
                <ZoomOut className="w-6 h-6" />
            </button>

            {/* Zoom In Button - Bottom Left (above zoom out) */}
            <button
                onClick={zoomIn}
                disabled={scale >= 3.0}
                className={`fixed bottom-36 left-4 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                title="Kattalashtirish"
            >
                <ZoomIn className="w-6 h-6" />
            </button>

            {/* Page Counter - Bottom Center */}
            <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full shadow-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
                }`}>
                <span className="text-sm font-semibold">
                    {pageNumber} / {numPages || '...'}
                </span>
            </div>

            {/* Previous Page Button - Left */}
            <button
                onClick={previousPage}
                disabled={pageNumber <= 1}
                className={`fixed left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                title="Oldingi sahifa (←)"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Page Button - Right */}
            <button
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                className={`fixed right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                    }`}
                title="Keyingi sahifa (→)"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* PDF Viewer - Full Screen */}
            <div
                ref={containerRef}
                className={`w-full h-full overflow-auto flex justify-center pt-4 ${darkMode ? 'bg-[#2d2d2d]' : 'bg-white'}`}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`w-16 h-16 border-4 ${darkMode ? 'border-gray-600 border-t-gray-400' : 'border-gray-300 border-t-primary'} rounded-full animate-spin mx-auto mb-4`}></div>
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Kitob yuklanmoqda...</p>
                        </div>
                    </div>
                )}
                <div className={`transition-opacity duration-150 ${darkMode ? 'bg-[#2d2d2d]' : 'bg-white'}`}>
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading=""
                        error={
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                        Xatolik yuz berdi
                                    </p>
                                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                        PDF faylni yuklashda muammo yuz berdi
                                    </p>
                                </div>
                            </div>
                        }
                    >
                        {dualPageMode ? (
                            <div className="flex gap-4">
                                <Page
                                    pageNumber={pageNumber}
                                    width={pageWidth}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className={darkMode ? 'pdf-dark-mode' : ''}
                                />
                                {pageNumber < numPages && (
                                    <Page
                                        pageNumber={pageNumber + 1}
                                        width={pageWidth}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className={darkMode ? 'pdf-dark-mode' : ''}
                                    />
                                )}
                            </div>
                        ) : (
                            <Page
                                pageNumber={pageNumber}
                                width={pageWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                className={darkMode ? 'pdf-dark-mode' : ''}
                            />
                        )}
                    </Document>
                </div>
            </div>

            {/* Dark mode PDF styling */}
            <style jsx global>{`
                .pdf-dark-mode canvas {
                    filter: invert(0.9) hue-rotate(180deg) brightness(0.95) contrast(0.9);
                }
                .react-pdf__Page {
                    background-color: transparent !important;
                }
                .react-pdf__Page__canvas {
                    display: block;
                }
            `}</style>
        </div>
    );
}
