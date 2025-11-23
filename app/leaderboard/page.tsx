"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, Star, Loader2 } from "lucide-react";

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [xpLeaderboard, setXpLeaderboard] = useState<any[]>([]);
    const [streakLeaderboard, setStreakLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                // Fetch XP Leaderboard
                const { data: xpData, error: xpError } = await supabase
                    .rpc('get_leaderboard', { limit_count: 50 });

                if (xpError) throw xpError;
                setXpLeaderboard(xpData || []);

                // Fetch Streak Leaderboard
                const { data: streakData, error: streakError } = await supabase
                    .rpc('get_streak_leaderboard', { limit_count: 50 });

                if (streakError) throw streakError;
                setStreakLeaderboard(streakData || []);

            } catch (error: any) {
                console.error("Error fetching leaderboards:", error);
                console.error("Error details:", error?.message, error?.details, error?.hint);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    return (
        <div className="container py-6 md:py-8 px-4 md:px-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold">Reyting</h1>
                    <p className="text-sm md:text-base text-muted-foreground">Eng faol kitobxonlar bilan bellashing</p>
                </div>
            </div>

            <Tabs defaultValue="xp" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8">
                    <TabsTrigger value="xp" className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                        <Star className="w-4 h-4" />
                        <span className="hidden sm:inline">XP Reytingi</span>
                        <span className="sm:hidden">XP</span>
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="flex items-center gap-1.5 md:gap-2 text-sm md:text-base">
                        <Flame className="w-4 h-4" />
                        <span className="hidden sm:inline">Streak Reytingi</span>
                        <span className="sm:hidden">Streak</span>
                    </TabsTrigger>
                </TabsList>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="xp" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
                                <h2 className="text-base md:text-lg font-bold mb-1 md:mb-2 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 flex-shrink-0" />
                                    Eng ko'p XP to'plaganlar
                                </h2>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Kitob o'qish va vazifalarni bajarish orqali XP to'plang va reytingda ko'tariling.
                                </p>
                            </div>
                            <LeaderboardList users={xpLeaderboard} currentUserId={user?.id} type="xp" />
                        </TabsContent>

                        <TabsContent value="streak" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/10 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
                                <h2 className="text-base md:text-lg font-bold mb-1 md:mb-2 flex items-center gap-2">
                                    <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" />
                                    Eng uzun Streak
                                </h2>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Har kuni uzluksiz o'qish orqali streakni saqlab qoling.
                                </p>
                            </div>
                            <LeaderboardList users={streakLeaderboard} currentUserId={user?.id} type="streak" />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
