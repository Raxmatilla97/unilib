import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark, Search } from 'lucide-react';

export default function ReaderPage({ params }: { params: { id: string } }) {
    return (
        <ProtectedRoute>
            <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
                {/* Reader Header */}
                <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900">
                    <div className="flex items-center gap-4">
                        <Link href={`/library/${params.id}`} className="text-zinc-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-medium text-sm truncate max-w-[200px] md:max-w-md">
                            Introduction to Algorithms - 3rd Edition
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono">100%</span>
                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-zinc-800 mx-2" />
                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <Bookmark className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar (Thumbnails) */}
                    <div className="hidden md:flex w-64 border-r border-zinc-800 flex-col overflow-y-auto bg-zinc-900/50">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => (
                            <div key={page} className="p-4 hover:bg-zinc-800 cursor-pointer transition-colors">
                                <div className="aspect-[3/4] bg-white/10 rounded mb-2" />
                                <div className="text-center text-xs text-zinc-500">Page {page}</div>
                            </div>
                        ))}
                    </div>

                    {/* PDF View Area */}
                    <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-auto p-8">
                        <div className="w-full max-w-3xl aspect-[3/4] bg-card text-card-foreground p-12 shadow-2xl relative">
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10 pointer-events-none">
                                <div className="text-9xl font-bold -rotate-45">PREVIEW</div>
                            </div>
                            <h2 className="text-4xl font-bold mb-8 text-center mt-20">Chapter 1: The Role of Algorithms in Computing</h2>
                            <div className="space-y-4 text-justify font-serif leading-relaxed">
                                <p>
                                    What are algorithms? Why is the study of algorithms worthwhile? What is the role
                                    of algorithms relative to other technologies used in computers? In this chapter,
                                    we will answer these questions.
                                </p>
                                <p>
                                    Informally, an algorithm is any well-defined computational procedure that takes
                                    some value, or set of values, as input and produces some value, or set of values,
                                    as output. An algorithm is thus a sequence of computational steps that transform
                                    the input into the output.
                                </p>
                                <p>
                                    We can also view an algorithm as a tool for solving a well-specified computational
                                    problem. The statement of the problem specifies in general terms the desired
                                    input/output relationship. The algorithm describes a specific computational
                                    procedure for achieving that input/output relationship.
                                </p>
                            </div>
                            <div className="absolute bottom-8 left-0 w-full text-center text-sm text-gray-500">
                                Page 5
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="h-12 border-t border-zinc-800 flex items-center justify-center gap-4 bg-zinc-900">
                    <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium">Page 5 of 1312</span>
                    <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
