"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Quote, BookOpen, ArrowRight, Search, TrendingUp, Star, Code, Calculator, Atom, Globe, Brain, PenTool, History, Dna, Building, Palette, Briefcase, Library, Mail, ChevronRight } from 'lucide-react';

export default function PilotPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/library?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-8 animate-fade-in backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Universitet Kutubxonlarining Kelajagi</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
              Cheksiz Bilimlar <br />
              <span className="text-primary inline-block relative">
                Sizning Qo'lingizda
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              O'zbekistonning barcha oliy o'quv yurtlari resurslarini birlashtiruvchi yagona raqamli platforma.
              Ilm-fan va ta'lim uchun cheksiz imkoniyatlar.
            </p>

            {/* Simple Search Bar */}
            <div className="w-full max-w-2xl mb-12 animate-slide-up delay-200 relative z-20">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl shadow-primary/5 overflow-hidden transition-all">
                  <Search className="w-6 h-6 text-muted-foreground ml-6" />
                  <input
                    type="text"
                    placeholder="Kitob, muallif yoki mavzuni qidiring..."
                    className="w-full bg-transparent border-none px-4 py-5 text-lg outline-none placeholder:text-muted-foreground/70"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="m-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    Izlash
                  </button>
                </div>
              </form>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-slide-up delay-300">
              <Link
                href="/library"
                className="group relative px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                Katalogga O'tish
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/groups"
                className="px-8 py-4 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-lg hover:bg-muted/50 transition-all flex items-center justify-center gap-3 backdrop-blur-sm"
              >
                Guruhlarga Qo'shilish
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-background overflow-hidden border-y border-border/50">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { label: "Mavjud Kitoblar", value: "10k+", icon: Library },
              { label: "Faol Talabalar", value: "5k+", icon: Users },
              { label: "O'quv Guruhlari", value: "150+", icon: Users }, // Changed icon to Users as MessageCircle wasn't imported, or use Users
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

      {/* Featured Books Section (Only 1 Row) */}
      <section className="py-24 md:py-32 bg-muted/20 overflow-hidden">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase tracking-wider text-sm">
                <Star className="w-4 h-4 fill-current" />
                Tavsiya Etamiz
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">Eng Ko'p O'qilganlar</h2>
            </div>
            <Link href="/library" className="px-6 py-3 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors font-medium flex items-center gap-2 group bg-background">
              Barcha kitoblar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', gradient: 'from-blue-600 to-indigo-700', rating: 4.9 },
              { title: 'Clean Code', author: 'Robert C. Martin', gradient: 'from-emerald-500 to-teal-700', rating: 4.8 },
              { title: 'Design Patterns', author: 'Erich Gamma', gradient: 'from-slate-600 to-slate-800', rating: 4.7 },
              { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', gradient: 'from-amber-600 to-orange-700', rating: 4.9 },
            ].map((book, i) => (
              <Link key={i} href={`/library/${i + 1}`} className="group block">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-4 relative shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`absolute inset-0 bg-gradient-to-br ${book.gradient} opacity-90`} />
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

                  <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                    <div className="flex justify-end">
                      <div className="bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-bold border border-white/10">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        {book.rating}
                      </div>
                    </div>
                    <div>
                      <BookOpen className="w-8 h-8 mb-4 opacity-80" />
                      <h3 className="font-bold leading-tight mb-2 text-lg line-clamp-3 drop-shadow-md">{book.title}</h3>
                      <p className="text-xs opacity-90 font-medium text-white/80">{book.author}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors" />
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
            Akademik maqsadlariga erishish uchun UniLib dan foydalanayotgan minglab talabalarga qo'shiling.
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

    </div>
  );
}
