import Link from 'next/link';
import { Users, Quote, BookOpen, ArrowRight, Search, TrendingUp, Star, Code, Calculator, Atom, Globe, Brain, PenTool, History, Dna, Building, Palette, Briefcase, Library, Mail, ChevronRight } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PilotHero } from '@/components/pilot/PilotHero';
import { FeaturedBooks } from '@/components/pilot/FeaturedBooks';
import { ScrollToTop } from '@/components/ScrollToTop';

// ✅ Cache for 5 minutes - 90% faster for repeat visitors
export const revalidate = 300;

async function getTopBooks() {
    try {
        const { data: books, error } = await supabaseAdmin
            .from('books')
            .select('id, title, author, cover_url, views_count')
            .order('views_count', { ascending: false })
            .limit(8);

        if (error) {
            console.error('Error fetching top books:', error);
            return [];
        }

        return books || [];
    } catch (err) {
        console.error('Error in getTopBooks:', err);
        return [];
    }
}

export default async function LandingPage() {
    const topBooks = await getTopBooks();

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">

            {/* Hero Section */}
            <PilotHero />

            {/* Stats Section */}
            <section className="py-24 bg-background overflow-hidden border-y border-border/50">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { label: "Mavjud Kitoblar", value: "10k+", icon: Library },
                            { label: "Faol Talabalar", value: "5k+", icon: Users },
                            { label: "O'quv Guruhlari", value: "150+", icon: Users },
                            { label: "Iqtiboslar", value: "1M+", icon: Quote }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center justify-center text-center group p-6 rounded-3xl bg-muted/20 hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/20">
                                <div className="mb-4 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors text-primary">
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{stat.value}</div>
                                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Books Section */}
            <FeaturedBooks books={topBooks} />

            {/* Popular Categories */}
            <section className="py-24 md:py-32 bg-background overflow-hidden">
                <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ommabop Yo'nalishlar</h2>
                        <p className="text-lg text-muted-foreground">Qiziqishlaringiz bo'yicha adabiyotlarni toping</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { name: 'Kompyuter Ilmlari', icon: Code },
                            { name: 'Matematika', icon: Calculator },
                            { name: 'Fizika', icon: Atom },
                            { name: 'Iqtisodiyot', icon: TrendingUp },
                            { name: 'Psixologiya', icon: Brain },
                            { name: 'Adabiyot', icon: PenTool },
                            { name: 'Tarix', icon: History },
                            { name: 'Biologiya', icon: Dna },
                            { name: 'Muhandislik', icon: Building },
                            { name: 'Falsafa', icon: Globe },
                            { name: 'San\'at', icon: Palette },
                            { name: 'Biznes', icon: Briefcase }
                        ].map((cat, i) => (
                            <Link key={i} href={`/library?category=${cat.name}`} className="group p-6 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/50 hover:bg-card hover:shadow-lg transition-all text-center flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <div className="font-bold text-sm text-foreground">{cat.name}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 md:py-32 bg-muted/20 overflow-hidden">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-foreground">Loyiha Maqsadi</h2>
                            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                                Ushbu platforma O'zbekiston ta'lim tizimini raqamlashtirish va talabalar uchun yagona, qulay bilim olish muhitini yaratish maqsadida ishlab chiqilgan.
                            </p>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                Bizning asosiy vazifamiz — har bir talabaga sifatli ta'lim resurslaridan foydalanish imkoniyatini berish va akademik halollikni ta'minlashdir.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-background border border-border">
                                    <div className="text-3xl font-bold text-primary mb-2">10k+</div>
                                    <div className="text-base text-muted-foreground">Raqamli Resurslar</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-background border border-border">
                                    <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                                    <div className="text-base text-muted-foreground">Doimiy Kirish</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors" />
                            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border border-primary/20 backdrop-blur-sm">
                                <BookOpen className="w-48 h-48 text-primary drop-shadow-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 md:py-32 bg-background overflow-hidden">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">Biz Bilan Bog'laning</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Savollaringiz bormi? Biz sizga yordam berishga tayyormiz!
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/50 text-center hover:shadow-xl transition-all group">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Email</h3>
                            <p className="text-muted-foreground">info@unilib.uz</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/50 text-center hover:shadow-xl transition-all group">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Telegram</h3>
                            <p className="text-muted-foreground">@unilib_support</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-muted/20 border border-transparent hover:border-primary/50 text-center hover:shadow-xl transition-all group">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Globe className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Manzil</h3>
                            <p className="text-muted-foreground">Toshkent, O'zbekiston</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

                <div className="container px-4 mx-auto relative z-10 text-center max-w-4xl">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
                        O'qish jarayonini <br />
                        <span className="text-primary">O'zgartirishga Tayyormisiz?</span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Akademik maqsadlariga erishish uchun Library ID dan foydalanayotgan minglab talabalarga qo'shiling.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/library"
                            className="px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-xl hover:shadow-2xl hover:bg-primary/90 transition-all hover:-translate-y-1"
                        >
                            Hozir Boshlash
                        </Link>
                        <Link
                            href="/register"
                            className="px-10 py-5 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-xl hover:bg-muted/50 transition-all"
                        >
                            Ro'yxatdan O'tish
                        </Link>
                    </div>
                </div>
            </section>

            {/* Scroll to Top Button */}
            <ScrollToTop />

        </div>
    );
}
