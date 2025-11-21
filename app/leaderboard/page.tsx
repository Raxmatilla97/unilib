import { createClient } from '@supabase/supabase-js';
import { XPBar } from '@/components/gamification/XPBar';
import { BadgeDisplay } from '@/components/gamification/BadgeDisplay';
import { StreakTracker } from '@/components/gamification/StreakTracker';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Trophy, Medal, Crown } from 'lucide-react';

export default async function LeaderboardPage() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    interface LeaderboardUser {
        rank: number;
        name: string;
        xp: number;
        level: number;
        avatar: string;
    }

    let leaderboard: LeaderboardUser[] = [];
    let currentUserStats = { xp: 0, level: 1, maxXP: 10000 }; // Default

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, xp, level')
            .order('xp', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (data && data.length > 0) {
            leaderboard = data.map((user: any, index: number) => ({
                rank: index + 1,
                name: user.name || 'Anonymous',
                xp: user.xp || 0,
                level: user.level || 1,
                avatar: (user.name || 'A').charAt(0).toUpperCase()
            }));
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }

    // Fallback to mock data
    if (leaderboard.length === 0) {
        leaderboard = [
            { rank: 1, name: 'Sarah J.', xp: 12500, level: 15, avatar: 'S' },
            { rank: 2, name: 'Mike T.', xp: 11200, level: 14, avatar: 'M' },
            { rank: 3, name: 'Emma W.', xp: 10800, level: 13, avatar: 'E' },
            { rank: 4, name: 'You', xp: 8500, level: 12, avatar: 'Y' },
            { rank: 5, name: 'David L.', xp: 8200, level: 12, avatar: 'D' },
        ];
    }

    // Ensure we have at least 3 items for the podium to work without errors
    while (leaderboard.length < 3) {
        leaderboard.push({
            rank: leaderboard.length + 1,
            name: 'TBD',
            xp: 0,
            level: 1,
            avatar: '?'
        });
    }

    return (
        <ProtectedRoute>
            <div className="container py-10 px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Leaderboard Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Leaderboard</h1>
                            <p className="text-muted-foreground">Top readers this week. Keep reading to climb the ranks!</p>
                        </div>

                        {/* Podium */}
                        <div className="flex items-end justify-center gap-4 mb-12 h-64">
                            {/* 2nd Place */}
                            <div className="flex flex-col items-center animate-slide-up delay-100">
                                <div className="w-16 h-16 rounded-full bg-card border-4 border-slate-400 flex items-center justify-center font-bold text-xl mb-2 relative shadow-lg">
                                    {leaderboard[1].avatar}
                                    <div className="absolute -bottom-2 bg-slate-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</div>
                                </div>
                                <div className="w-24 h-32 bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-x border-t border-slate-400/30 rounded-t-xl flex items-end justify-center pb-4 backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="font-bold">{leaderboard[1].name}</div>
                                        <div className="text-xs text-muted-foreground">{leaderboard[1].xp} XP</div>
                                    </div>
                                </div>
                            </div>

                            {/* 1st Place */}
                            <div className="flex flex-col items-center z-10 animate-slide-up">
                                <Crown className="w-8 h-8 text-yellow-500 mb-2 animate-bounce" />
                                <div className="w-20 h-20 rounded-full bg-card border-4 border-yellow-500 flex items-center justify-center font-bold text-2xl mb-2 relative shadow-lg shadow-yellow-500/20">
                                    {leaderboard[0].avatar}
                                    <div className="absolute -bottom-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">1</div>
                                </div>
                                <div className="w-28 h-40 bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 border-x border-t border-yellow-500/30 rounded-t-xl flex items-end justify-center pb-4 shadow-lg backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-lg">{leaderboard[0].name}</div>
                                        <div className="text-sm text-yellow-500 font-medium">{leaderboard[0].xp} XP</div>
                                    </div>
                                </div>
                            </div>

                            {/* 3rd Place */}
                            <div className="flex flex-col items-center animate-slide-up delay-200">
                                <div className="w-16 h-16 rounded-full bg-card border-4 border-orange-400 flex items-center justify-center font-bold text-xl mb-2 relative shadow-lg">
                                    {leaderboard[2].avatar}
                                    <div className="absolute -bottom-2 bg-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</div>
                                </div>
                                <div className="w-24 h-24 bg-gradient-to-t from-orange-400/20 to-orange-400/5 border-x border-t border-orange-400/30 rounded-t-xl flex items-end justify-center pb-4 backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="font-bold">{leaderboard[2].name}</div>
                                        <div className="text-xs text-muted-foreground">{leaderboard[2].xp} XP</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                            {leaderboard.slice(3).map((user, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${user.name === 'You' ? 'bg-primary/5' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground">
                                            #{user.rank}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {user.name}
                                                {user.name === 'You' && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">YOU</span>}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Level {user.level} Scholar</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-primary">
                                        {user.xp.toLocaleString()} XP
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-primary" />
                                Your Progress
                            </h3>
                            {/* Note: This should ideally be dynamic based on logged in user */}
                            <XPBar currentXP={8500} maxXP={10000} level={12} />
                        </div>

                        <StreakTracker />

                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Medal className="w-5 h-5 text-primary" />
                                Recent Achievements
                            </h3>
                            <BadgeDisplay />
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
