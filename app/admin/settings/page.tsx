import { supabaseAdmin } from '@/lib/supabase/admin';
import { Settings, Building2, Users, BookOpen, BarChart3, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getSystemStats() {
    const [
        { count: usersCount },
        { count: booksCount },
        { count: loansCount },
        { count: groupsCount }
    ] = await Promise.all([
        supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('books').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('book_checkouts').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('groups').select('*', { count: 'exact', head: true })
    ]);

    return {
        usersCount: usersCount || 0,
        booksCount: booksCount || 0,
        loansCount: loansCount || 0,
        groupsCount: groupsCount || 0
    };
}

export default async function SettingsPage() {
    const stats = await getSystemStats();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Settings className="w-8 h-8 text-primary" />
                    Sozlamalar
                </h1>
                <p className="text-muted-foreground mt-1">
                    Tizim ma'lumotlari va konfiguratsiya
                </p>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-2 border-blue-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Foydalanuvchilar</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{stats.usersCount}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-2 border-purple-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <BookOpen className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Kitoblar</p>
                    <p className="text-3xl font-bold text-purple-600 mt-1">{stats.booksCount}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-2 border-green-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Jami Qarzlar</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.loansCount}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-2 border-orange-500/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Database className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-sm text-muted-foreground">Guruhlar</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{stats.groupsCount}</p>
                </div>
            </div>

            {/* Organization Info */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Tashkilot Ma'lumotlari
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Tashkilot Nomi</label>
                        <p className="text-lg font-semibold mt-1">Library ID Platform</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Tashkilot Turi</label>
                        <p className="text-lg font-semibold mt-1">Kutubxona Tizimi</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Yaratilgan Sana</label>
                        <p className="text-lg font-semibold mt-1">{new Date().toLocaleDateString('uz-UZ')}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Holat</label>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-600 mt-1">
                            ✓ Faol
                        </span>
                    </div>
                </div>
            </div>

            {/* System Information */}
            <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Tizim Ma'lumotlari</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium">Platform Versiyasi</span>
                        <span className="text-sm text-muted-foreground font-mono">v1.0.0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium">Database</span>
                        <span className="text-sm text-muted-foreground">Supabase PostgreSQL</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium">Framework</span>
                        <span className="text-sm text-muted-foreground">Next.js 16</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm font-medium">Hosting</span>
                        <span className="text-sm text-muted-foreground">Vercel</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Tizim Harakatlari</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left">
                        <h3 className="font-bold mb-1">Database Backup</h3>
                        <p className="text-sm text-muted-foreground">Ma'lumotlar zaxirasi</p>
                    </button>
                    <button className="p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left">
                        <h3 className="font-bold mb-1">Cache Tozalash</h3>
                        <p className="text-sm text-muted-foreground">Tizim cache'ini tozalash</p>
                    </button>
                    <button className="p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-lg transition-all text-left">
                        <h3 className="font-bold mb-1">Loglarni Ko'rish</h3>
                        <p className="text-sm text-muted-foreground">Tizim loglarini tekshirish</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
