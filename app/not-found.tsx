"use client";

import Link from 'next/link';
import { Home, Search, MoveLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-[#030014] text-white">

            {/* Stars Background Animation */}
            <div className="absolute inset-0 z-0">
                <div className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle top-[10%] left-[20%]"></div>
                <div className="absolute w-[3px] h-[3px] bg-blue-300 rounded-full animate-twinkle top-[30%] left-[60%] delay-75"></div>
                <div className="absolute w-[2px] h-[2px] bg-purple-300 rounded-full animate-twinkle top-[70%] left-[40%] delay-150"></div>
                <div className="absolute w-[1px] h-[1px] bg-white rounded-full animate-twinkle top-[40%] left-[80%] delay-300"></div>
                <div className="absolute w-[2px] h-[2px] bg-white rounded-full animate-twinkle top-[15%] left-[90%] delay-500"></div>
                <div className="absolute w-[3px] h-[3px] bg-cyan-300 rounded-full animate-twinkle top-[80%] left-[10%] delay-200"></div>
                {/* Nebulas */}
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl mix-blend-screen"></div>
                <div className="absolute bottom-[0%] right-[0%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl mix-blend-screen"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4">

                {/* Giant Glowing 404 */}
                <div className="relative mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                        404
                    </h1>
                    {/* Glitch Effect Duplicate (Optional sophisticated effect) */}
                    <h1 className="absolute inset-0 text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-cyan-500 opacity-20 blur-[2px] animate-pulse-fast select-none pointer-events-none">
                        404
                    </h1>

                    {/* Floating Element Overlap */}
                    <div className="absolute top-[20%] right-[10%] animate-float">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-xl opacity-40"></div>
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-black/40 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center relative -mt-20 -ml-4">
                            <span className="text-4xl">🛸</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-purple-200">
                        Hyuston, bizda muammo bor!
                    </h2>
                    <p className="text-blue-200/60 text-lg md:text-xl leading-relaxed">
                        Siz qidirayotgan sahifa koinotning qora tuynugiga tushib ketgan ko'rinadi.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-12 w-full max-w-sm mx-auto">
                    <Link href="/" className="flex-1">
                        <button className="w-full relative px-8 py-3.5 rounded-xl bg-white text-black font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:bg-blue-50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group">
                            <span className="relative z-10 flex items-center gap-2">
                                <Home className="w-5 h-5" />
                                Bosh sahifa
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700"></div>
                        </button>
                    </Link>

                    <Link href="/library" className="flex-1">
                        <button className="w-full px-8 py-3.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-white font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 group">
                            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Qidirish
                        </button>
                    </Link>
                </div>
            </div>


        </div>
    );
}
