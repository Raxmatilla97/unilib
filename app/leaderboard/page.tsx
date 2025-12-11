"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLeaderboards } from "@/lib/react-query/hooks";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Star, Crown, Medal, Award } from "lucide-react";
import { LeaderboardSkeleton } from "@/components/loading/Skeletons";

export default function LeaderboardPage() {
    const { user } = useAuth();
    const { data, isLoading, error } = useLeaderboards();

    if (isLoading) return <LeaderboardSkeleton />;

    if (error) {
        return (
            <div className="container py-8 px-4 max-w-4xl mx-auto">
                <div className="text-center text-red-500">Xatolik yuz berdi. Qaytadan urinib ko'ring.</div>
            </div>
        );
    }

    const xpLeaderboard = data?.xp || [];
    const streakLeaderboard = data?.streak || [];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Premium Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-background to-background pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[800px] h-[400px] bg-yellow-500/5 blur-3xl rounded-full opacity-60 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-soft-light pointer-events-none"></div>

            <div className="container relative z-10 py-8 md:py-12 px-4 md:px-6 max-w-5xl mx-auto">
                {/* Premium Header */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-4 md:mb-6 relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/10 to-orange-500/10 blur-xl animate-pulse" />
                        <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 relative z-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        Reyting Jadvali
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Eng faol kitobxonlar bilan bellashing va o'z darajangizni oshiring
                    </p>
                </div>

                <Tabs defaultValue="xp" className="w-full">
                    {/* Modern Tabs */}
                    <TabsList className="grid w-full grid-cols-2 mb-8 md:mb-10 h-14 bg-muted/30 backdrop-blur-sm p-1.5">
                        <TabsTrigger
                            value="xp"
                            className="flex items-center gap-2 text-sm md:text-base font-semibold h-full rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                        >
                            <Star className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">XP Reytingi</span>
                            <span className="sm:hidden">XP</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="streak"
                            className="flex items-center gap-2 text-sm md:text-base font-semibold h-full rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                        >
                            <Flame className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden sm:inline">Streak Reytingi</span>
                            <span className="sm:hidden">Streak</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="xp" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Top 3 Podium */}
                        {xpLeaderboard.length >= 3 && (
                            <div className="mb-8 md:mb-10">
                                <div className="grid grid-cols-3 gap-3 md:gap-4 items-end mb-6">
                                    {/* 2nd Place */}
                                    <div className="text-center">
                                        <div className="relative inline-block mb-3">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-background shadow-xl">
                                                <span className="text-2xl md:text-3xl font-bold text-white">2</span>
                                            </div>
                                            <Medal className="absolute -top-2 -right-2 w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="font-bold text-sm md:text-base truncate">{xpLeaderboard[1]?.full_name}</p>
                                        <p className="text-xs md:text-sm text-yellow-600 dark:text-yellow-400 font-semibold">{xpLeaderboard[1]?.xp} XP</p>
                                    </div>

                                    {/* 1st Place */}
                                    <div className="text-center -mt-4">
                                        <div className="relative inline-block mb-3">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center border-4 border-background shadow-2xl animate-pulse">
                                                <span className="text-3xl md:text-4xl font-bold text-white">1</span>
                                            </div>
                                            <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 text-yellow-500 animate-bounce" />
                                        </div>
                                        <p className="font-bold text-base md:text-lg truncate">{xpLeaderboard[0]?.full_name}</p>
                                        <p className="text-sm md:text-base text-yellow-600 dark:text-yellow-400 font-bold">{xpLeaderboard[0]?.xp} XP</p>
                                    </div>

                                    {/* 3rd Place */}
                                    <div className="text-center">
                                        <div className="relative inline-block mb-3">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center border-4 border-background shadow-xl">
                                                <span className="text-2xl md:text-3xl font-bold text-white">3</span>
                                            </div>
                                            <Award className="absolute -top-2 -right-2 w-6 h-6 text-orange-500" />
                                        </div>
                                        <p className="font-bold text-sm md:text-base truncate">{xpLeaderboard[2]?.full_name}</p>
                                        <p className="text-xs md:text-sm text-yellow-600 dark:text-yellow-400 font-semibold">{xpLeaderboard[2]?.xp} XP</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-5 md:p-6 mb-6 backdrop-blur-sm">
                            <h2 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Eng ko'p XP to'plaganlar
                            </h2>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Kitob o'qish va vazifalarni bajarish orqali XP to'plang va reytingda yuqoriga ko'tariling.
                            </p>
                        </div>

                        <LeaderboardList users={xpLeaderboard} currentUserId={user?.id} type="xp" />
                    </TabsContent>

                    <TabsContent value="streak" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Top 3 Podium */}
                        {streakLeaderboard.length >= 3 && (
                            <div className="mb-8 md:mb-10">
                                <div className="grid grid-cols-3 gap-3 md:gap-4 items-end mb-6">
                                    {/* 2nd Place */}
                                    <div className="text-center">
                                        <div className="relative inline-block mb-3">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center border-4 border-background shadow-xl">
                                                <span className="text-2xl md:text-3xl font-bold text-white">2</span>
                                            </div>
                                            <Flame className="absolute -top-2 -right-2 w-6 h-6 text-orange-400" />
                                        </div>
                                        <p className="font-bold text-sm md:text-base truncate">{streakLeaderboard[1]?.full_name}</p>
                                        <p className="text-xs md:text-sm text-orange-600 dark:text-orange-400 font-semibold">{streakLeaderboard[1]?.streak_days} kun</p>
                                    </div>

                                    {/* 1st Place */}
                                    <div className="text-center -mt-4">
                                        <div className="relative inline-block mb-3">
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center border-4 border-background shadow-2xl animate-pulse">
                                                <span className="text-3xl md:text-4xl font-bold text-white">1</span>
                                            </div>
                                            <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 text-orange-500 animate-bounce" />
                                        </div>
                                        <p className="font-bold text-base md:text-lg truncate">{streakLeaderboard[0]?.full_name}</p>
                                        <p className="text-sm md:text-base text-orange-600 dark:text-orange-400 font-bold">{streakLeaderboard[0]?.streak_days} kun</p>
                                    </div>

                                    {/* 3rd Place */}
                                    <div className="text-center">
                                        <div className="relative inline-block mb-3">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center border-4 border-background shadow-xl">
                                                <span className="text-2xl md:text-3xl font-bold text-white">3</span>
                                            </div>
                                            <Award className="absolute -top-2 -right-2 w-6 h-6 text-orange-500" />
                                        </div>
                                        <p className="font-bold text-sm md:text-base truncate">{streakLeaderboard[2]?.full_name}</p>
                                        <p className="text-xs md:text-sm text-orange-600 dark:text-orange-400 font-semibold">{streakLeaderboard[2]?.streak_days} kun</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-5 md:p-6 mb-6 backdrop-blur-sm">
                            <h2 className="text-base md:text-lg font-bold mb-2 flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                Eng uzun Streak
                            </h2>
                            <p className="text-sm md:text-base text-muted-foreground">
                                Har kuni uzluksiz o'qish orqali streakni saqlab qoling va reytingda birinchi bo'ling.
                            </p>
                        </div>

                        <LeaderboardList users={streakLeaderboard} currentUserId={user?.id} type="streak" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
