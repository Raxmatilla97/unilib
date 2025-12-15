"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { X, ChevronLeft, ChevronRight, Moon, Sun, ZoomIn, ZoomOut, BookOpen, FileText, Type, AlignLeft, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CelebrationModal } from '@/components/gamification/CelebrationModal';
import { toast } from 'sonner';
import { createNotification } from '@/app/notifications/actions';

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
    const [pageWidth, setPageWidth] = useState<number>(600);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showCelebration, setShowCelebration] = useState<boolean>(false);
    const celebrationShownRef = useRef<boolean>(false);
    const [showControls, setShowControls] = useState<boolean>(true);
    const [showTextSettings, setShowTextSettings] = useState<boolean>(false);
    const [textMode, setTextMode] = useState<boolean>(false);
    const [pageText, setPageText] = useState<string>('');
    const [fontSize, setFontSize] = useState<number>(18);
    const pdfDocumentRef = useRef<any>(null);

    // Calculate optimal width based on screen size
    const calculatePageWidth = useCallback(() => {
        if (typeof window === 'undefined') return 600;

        const width = window.innerWidth;
        let baseWidth;

        if (width < 768) {
            baseWidth = width * 0.95; // 95% on mobile
        } else if (width < 1024) {
            baseWidth = width * 0.85; // 85% on tablet
        } else {
            baseWidth = width * 0.55; // 55% on desktop
        }

        // If dual page mode is active, we need to fit two pages
        if (dualPageMode && width >= 768) {
            baseWidth = (width * 0.9) / 2;
        }

        return baseWidth * scale;
    }, [scale, dualPageMode]);

    useEffect(() => {
        const handleResize = () => {
            setPageWidth(calculatePageWidth());
        };

        // Initial calculation
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [calculatePageWidth]);

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

                // Debugging: Fetch all schedules for this book to see why it's not matching
                const { data: allSchedules } = await supabase
                    .from('reading_schedule')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('book_id', bookId);

                console.log('Debug - All schedules for book:', allSchedules);
                console.log('Debug - Today:', today);

                // Find matching schedule in JS to debug logic
                const scheduleData = allSchedules?.find(s => {
                    const isActive = s.status === 'active';
                    const isStarted = s.start_date <= today;
                    const isNotEnded = s.end_date >= today;
                    console.log(`Schedule ${s.id}: active=${isActive}, started=${isStarted} (${s.start_date} <= ${today}), notEnded=${isNotEnded} (${s.end_date} >= ${today})`);
                    return isActive && isStarted && isNotEnded;
                });

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

    const [isScanned, setIsScanned] = useState<boolean>(false);

    function onDocumentLoadSuccess(pdf: any) {
        setNumPages(pdf.numPages);
        setLoading(false);
        pdfDocumentRef.current = pdf;
        if (textMode) {
            extractText(pageNumber);
        }
    }

    const extractText = useCallback(async (pageNum: number) => {
        if (!pdfDocumentRef.current) return;

        try {
            const page = await pdfDocumentRef.current.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Check if there are any text items
            if (!textContent.items || textContent.items.length === 0) {
                setPageText('');
                setIsScanned(true);
                return;
            }

            const textItems = textContent.items.map((item: any) => item.str);
            const joinedText = textItems.join(' ');

            // Check if the joined text is empty or just whitespace
            if (joinedText.trim().length === 0) {
                setPageText('');
                setIsScanned(true);
            } else {
                setPageText(joinedText);
                setIsScanned(false);
            }
        } catch (error) {
            console.error('Error extracting text:', error);
            setPageText('');
            setIsScanned(false); // Error is different from being scanned
        }
    }, []);

    useEffect(() => {
        if (textMode) {
            extractText(pageNumber);
        }
    }, [pageNumber, textMode, extractText]);

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
                const dailyGoal = activeSchedule.daily_goal_pages || 0;
                const wasCompleted = initialDailyPages >= dailyGoal;
                const isNowCompleted = totalDailyPages >= dailyGoal;

                const now = new Date();
                const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                // Only log when goal is completed, not every save
                if (!wasCompleted && isNowCompleted) {
                    console.log('🎯 Daily goal completed!', {
                        schedule_id: activeSchedule.id,
                        pages_read: totalDailyPages,
                        goal: dailyGoal
                    });

                    // Create persistent notification
                    if (user) {
                        createNotification(
                            user.id,
                            'Kunlik maqsad bajarildi! 🎉',
                            `Tabriklaymiz! Siz bugungi oʻqish rejasini bajardingiz (${dailyGoal} sahifa).`,
                            'achievement'
                        );
                    }
                }

                const { data: dailyData, error: dailyError } = await supabase
                    .from('daily_progress')
                    .upsert({
                        schedule_id: activeSchedule.id,
                        date: today,
                        pages_read: totalDailyPages,
                        completed: isNowCompleted
                    }, {
                        onConflict: 'schedule_id,date'
                    });

                if (dailyError) {
                    console.error('❌ Error saving daily progress:', dailyError);
                } else {
                    console.log('✅ Daily progress saved:', {
                        schedule_id: activeSchedule.id,
                        date: today,
                        pages_read: totalDailyPages,
                        completed: isNowCompleted
                    });
                }

                // Show celebration if goal was just completed
                if (!wasCompleted && isNowCompleted) {
                    // Check if celebration already shown today
                    const celebrationKey = `celebration_${today}_${activeSchedule.id}`;
                    const hasShownToday = localStorage.getItem(celebrationKey);

                    if (!hasShownToday && !celebrationShownRef.current) {
                        celebrationShownRef.current = true;
                        localStorage.setItem(celebrationKey, 'true');
                        setShowCelebration(true);

                        // Show toast after modal appears (2 second delay)
                        setTimeout(() => {
                            toast.success('Kunlik maqsad bajarildi!', {
                                description: '🎉 Siz +50 XP oldingiz va darajangiz oshdi!',
                                duration: 4000,
                                className: 'toast-celebration',
                            });
                        }, 2000);

                        console.log('🎉 Daily goal completed! Showing celebration...');
                    } else {
                        console.log('Celebration already shown today');
                    }
                }
            }

        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [user, bookId, pageNumber, numPages, activeSchedule, sessionStartPage, initialDailyPages]);

    useEffect(() => {
        // Debounce: save only after user stops changing pages for 3 seconds
        const timer = setTimeout(() => {
            saveProgress();
        }, 3000); // Increased from 1000ms to 3000ms

        return () => clearTimeout(timer);
    }, [saveProgress]);

    function zoomIn() {
        setScale(prev => Math.min(prev + 0.1, 2.5));
    }

    function zoomOut() {
        setScale(prev => Math.max(prev - 0.1, 0.5));
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

    const toggleControls = () => {
        setShowControls(prev => !prev);
    };

    return (
        <div
            className={`fixed inset-0 z-50 transition-colors duration-200 flex flex-col items-center justify-center ${darkMode ? 'bg-[#2d2d2d]' : 'bg-white'}`}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Click overlay to toggle controls */}
            <div
                className="absolute inset-0 z-0"
                onClick={toggleControls}
            />

            {/* Controls Container - with transition for fade effect */}
            <div className={`transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Close Button - Top Right */}
                <button
                    onClick={onClose}
                    className={`fixed top-4 right-4 z-20 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    title="Yopish (Esc)"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Dark Mode Toggle - Top Left */}
                <button
                    onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
                    className={`fixed top-4 left-4 z-20 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    title={darkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
                >
                    {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </button>

                {/* Dual Page Mode Toggle - Top Left (below dark mode) - Hidden on mobile */}
                <button
                    onClick={(e) => { e.stopPropagation(); setDualPageMode(!dualPageMode); }}
                    className={`fixed top-20 left-4 z-20 p-3 rounded-full shadow-lg transition-all hover:scale-110 hidden md:block ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    title={dualPageMode ? 'Bitta sahifa' : '2 sahifa (kitob kabi)'}
                >
                    {dualPageMode ? <FileText className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </button>

                {/* Text Settings Toggle (Aa) - Top Left (Mobile only) */}
                <div className="fixed top-20 left-4 z-20 md:hidden">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowTextSettings(!showTextSettings); }}
                        className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                            } ${showTextSettings ? 'ring-2 ring-primary' : ''}`}
                        title="Matn oʻlchami"
                    >
                        <Type className="w-6 h-6" />
                    </button>

                    {/* Text Settings Menu */}
                    {showTextSettings && (
                        <div className={`absolute top-full left-0 mt-2 p-4 rounded-xl shadow-xl min-w-[240px] flex flex-col gap-4 ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-sm font-medium mb-1">Koʻrinish rejimi</div>
                            <div className="flex p-1 bg-gray-100 rounded-lg dark:bg-gray-700 mb-2">
                                <button
                                    onClick={() => setTextMode(false)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${!textMode
                                        ? 'bg-white text-primary shadow-sm dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    Original
                                </button>
                                <button
                                    onClick={() => setTextMode(true)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${textMode
                                        ? 'bg-white text-primary shadow-sm dark:bg-gray-600 dark:text-white'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    <AlignLeft className="w-4 h-4" />
                                    Matn
                                </button>
                            </div>

                            <div className="text-sm font-medium mb-1">
                                {textMode ? "Matn o'lchami" : "Masshtab"}
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={textMode ? () => setFontSize(s => Math.max(12, s - 2)) : zoomOut}
                                    disabled={textMode ? fontSize <= 12 : scale <= 0.5}
                                    className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'} disabled:opacity-50`}
                                >
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <span className="font-bold">
                                    {textMode ? `${fontSize}px` : `${Math.round(scale * 100)}%`}
                                </span>
                                <button
                                    onClick={textMode ? () => setFontSize(s => Math.min(32, s + 2)) : zoomIn}
                                    disabled={textMode ? fontSize >= 32 : scale >= 3.0}
                                    className={`p-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'} disabled:opacity-50`}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Zoom Out Button - Bottom Left (Desktop only) */}
                <button
                    onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                    disabled={scale <= 0.5}
                    className={`fixed bottom-20 left-4 z-20 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed hidden md:block ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    title="Kichiklashtirish"
                >
                    <ZoomOut className="w-6 h-6" />
                </button>

                {/* Zoom In Button - Bottom Left (above zoom out) (Desktop only) */}
                <button
                    onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                    disabled={scale >= 3.0}
                    className={`fixed bottom-36 left-4 z-20 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed hidden md:block ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    title="Kattalashtirish"
                >
                    <ZoomIn className="w-6 h-6" />
                </button>

                {/* Page Counter - Bottom Center */}
                <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full shadow-lg ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'
                    }`}>
                    <span className="text-sm font-semibold">
                        {pageNumber} / {numPages || '...'}
                    </span>
                </div>

                {/* Previous Page Button - Left */}
                <button
                    onClick={(e) => { e.stopPropagation(); previousPage(); }}
                    disabled={pageNumber <= 1}
                    className={`fixed left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    title="Oldingi sahifa (←)"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next Page Button - Right */}
                <button
                    onClick={(e) => { e.stopPropagation(); nextPage(); }}
                    disabled={pageNumber >= numPages}
                    className={`fixed right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed ${darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-100 text-gray-700'
                        }`}
                    title="Keyingi sahifa (→)"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Content Viewer (PDF or Text) */}
            <div
                ref={containerRef}
                className={`w-full h-full overflow-auto flex justify-center items-start pt-4 pb-20 z-10 relative ${darkMode ? 'bg-[#2d2d2d]' : 'bg-white'}`}
                onClick={() => {
                    toggleControls();
                }}
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`w-16 h-16 border-4 ${darkMode ? 'border-gray-600 border-t-gray-400' : 'border-gray-300 border-t-primary'} rounded-full animate-spin mx-auto mb-4`}></div>
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Kitob yuklanmoqda...</p>
                        </div>
                    </div>
                )}

                {textMode ? (
                    <div
                        className={`max-w-3xl w-full px-6 py-8 mx-auto leading-relaxed transition-colors duration-200 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {isScanned ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <ImageIcon className="w-16 h-16 mb-4 text-gray-400" />
                                <h3 className="text-xl font-semibold mb-2">Matn qatlami topilmadi</h3>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    Ushbu kitob rasmlardan iborat (skaner qilingan) bo'lishi mumkin.
                                    Shu sababli matn rejimini qoʻllab-quvvatlamaydi.
                                </p>
                                <button
                                    onClick={() => setTextMode(false)}
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Original holatga qaytish
                                </button>
                            </div>
                        ) : pageText ? (
                            <p className="whitespace-pre-wrap">{pageText}</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                <p>Matn yuklanmoqda...</p>
                            </div>
                        )}
                    </div>
                ) : (
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
                )}
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

            {/* Celebration Modal */}
            <CelebrationModal
                isOpen={showCelebration}
                onClose={() => setShowCelebration(false)}
                dailyGoalCompleted={true}
            />
        </div>
    );
}
