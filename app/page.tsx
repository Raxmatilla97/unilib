import Link from 'next/link';
import { AISearchBar } from '@/components/search/AISearchBar';
import { Users, Trophy, LayoutDashboard, Quote, BookOpen, ArrowRight, Sparkles, Search, MessageCircle, TrendingUp, Star, Code, Calculator, Atom, Globe, Brain, PenTool, History, Dna, Building, Palette, Briefcase, GraduationCap, Library, Lightbulb, Bookmark } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden bg-background">
      {/* Hero Section - Compact & Professional */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15] text-primary"
          style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 blur-[100px] rounded-full pointer-events-none animate-pulse-slow delay-1000" />

        {/* Floating Shapes */}
        <div className="absolute top-20 left-[10%] w-16 h-16 border border-primary/20 rounded-2xl rotate-12 animate-fade-in opacity-20 hidden md:block" />
        <div className="absolute bottom-20 right-[10%] w-24 h-24 border border-accent/20 rounded-full animate-fade-in delay-300 opacity-20 hidden md:block" />
        <div className="absolute top-40 right-[15%] w-8 h-8 bg-primary/20 rounded-full blur-sm animate-pulse hidden md:block" />

        <div className="container relative z-10 px-4 md:px-6 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-primary/20 text-primary font-semibold text-xs md:text-sm mb-6 shadow-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 fill-primary/20" />
            <span>Universitet Kutubxonalarining Kelajagi</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up leading-[1.1] text-foreground">
            Cheksiz Bilimlar <br />
            <span className="text-primary relative inline-block">
              Sizning Qo'lingizda
              {/* Underline decoration */}
              <svg className="absolute w-full h-2.5 -bottom-1 left-0 text-accent opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100 leading-relaxed font-medium">
            UniLib — bu shunchaki kutubxona emas. Bu sizning <span className="text-primary font-bold">shaxsiy AI yordamchingiz</span>,
            o'quv guruhi markazi va muvaffaqiyat sari yo'llanmangizdir.
          </p>

          <div className="animate-slide-up delay-200 mb-12 relative z-20">
            <AISearchBar className="shadow-xl shadow-primary/5 border-primary/20 max-w-2xl mx-auto" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 animate-slide-up delay-300">
            <Link href="/library" className="group relative px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all hover:-translate-y-0.5">
              <span className="flex items-center gap-2">
                Katalogga O'tish <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/groups" className="px-6 py-3.5 rounded-xl bg-card text-foreground font-bold text-base border border-border hover:border-primary/50 hover:bg-muted/30 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              Guruhlarga Qo'shilish
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By - Compact */}
      <section className="py-8 border-y border-border/40 bg-card/50">
        <div className="container px-4 md:px-6 text-center">
          <p className="text-xs font-bold text-muted-foreground mb-6 uppercase tracking-[0.2em]">Bizga ishonch bildirgan universitetlar</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {['MIT', 'Stanford', 'Harvard', 'Oxford', 'Cambridge', 'Toshkent Davlat Universiteti'].map((uni, i) => (
              <div key={i} className="text-lg md:text-xl font-bold flex items-center gap-2 hover:text-primary transition-colors cursor-default">
                <GraduationCap className="w-6 h-6" />
                {uni}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Compact Cards */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: "Mavjud Kitoblar", value: "10k+", icon: Library, color: "text-primary", bg: "bg-primary/10" },
              { label: "Faol Talabalar", value: "5k+", icon: Users, color: "text-primary", bg: "bg-primary/10" },
              { label: "O'quv Guruhlari", value: "150+", icon: MessageCircle, color: "text-primary", bg: "bg-primary/10" },
              { label: "Iqtiboslar", value: "1M+", icon: Quote, color: "text-primary", bg: "bg-primary/10" }
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all group text-center">
                <div className={`w-12 h-12 mx-auto rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1 tracking-tight">{stat.value}</div>
                <div className="text-muted-foreground font-medium uppercase tracking-wide text-[10px] md:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Compact */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Muvaffaqiyat Kalitlari</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Bizning platforma sizga o'qish jarayonini osonlashtirish va samaradorlikni oshirish uchun eng zamonaviy vositalarni taqdim etadi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "O'quv Guruhlari",
                desc: "Fanlar bo'yicha guruhlarga qo'shiling va real vaqtda muhokama qiling."
              },
              {
                icon: Trophy,
                title: "Gamifikatsiya",
                desc: "O'qiganingiz sari darajangizni oshiring va maxsus nishonlarga ega bo'ling."
              },
              {
                icon: LayoutDashboard,
                title: "Aqlli Boshqaruv",
                desc: "Shaxsiy kabinetingizda o'sish ko'rsatkichlaringizni tahlil qiling."
              },
              {
                icon: Quote,
                title: "Iqtibos Generatori",
                desc: "Ilmiy ishlaringiz uchun soniyalar ichida mukammal iqtiboslar yarating."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-6 rounded-xl bg-muted/20 hover:bg-card border border-transparent hover:border-border hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-card border border-border flex items-center justify-center mb-4 text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Compact */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">3 Qadamda Boshlang</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              UniLib bilan ishlash juda oddiy va qulay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] bg-border" />

            {[
              {
                icon: Search,
                title: "Kashf Eting",
                desc: "AI qidiruv tizimi orqali kerakli manbani toping.",
                step: "01"
              },
              {
                icon: Users,
                title: "Hamkorlik",
                desc: "Guruhlarga qo'shiling va bilim almashing.",
                step: "02"
              },
              {
                icon: TrendingUp,
                title: "Rivojlaning",
                desc: "Bilim darajangizni oshirib boring.",
                step: "03"
              }
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center z-10 group">
                <div className="w-20 h-20 rounded-full bg-card border-4 border-muted flex items-center justify-center mb-5 shadow-lg group-hover:border-primary transition-colors duration-300 relative">
                  <item.icon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xs shadow-md border-2 border-background">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section - Premium Grid */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold mb-1 uppercase tracking-wider text-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                Tavsiya Etamiz
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Hafta Trendlari</h2>
            </div>
            <Link href="/library" className="px-5 py-2.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors font-medium flex items-center gap-2 group text-sm">
              Barcha kitoblar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', gradient: 'from-blue-600 to-indigo-700', rating: 4.9 },
              { title: 'Clean Code', author: 'Robert C. Martin', gradient: 'from-emerald-500 to-teal-700', rating: 4.8 },
              { title: 'Design Patterns', author: 'Erich Gamma', gradient: 'from-slate-600 to-slate-800', rating: 4.7 },
              { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', gradient: 'from-amber-600 to-orange-700', rating: 4.9 },
              { title: 'Artificial Intelligence', author: 'Stuart Russell', gradient: 'from-purple-600 to-indigo-600', rating: 4.8 },
              { title: 'Deep Learning', author: 'Ian Goodfellow', gradient: 'from-rose-600 to-pink-700', rating: 4.7 },
              { title: 'System Design Interview', author: 'Alex Xu', gradient: 'from-cyan-600 to-blue-700', rating: 4.9 },
              { title: 'Cracking the Coding Interview', author: 'Gayle Laakmann', gradient: 'from-green-600 to-emerald-700', rating: 4.8 }
            ].map((book, i) => (
              <Link key={i} href={`/library/${i + 1}`} className="group block">
                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 relative shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${book.gradient} opacity-90`} />

                  {/* Texture overlay */}
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

                  {/* Minimalist Cover Design */}
                  <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                    <div className="flex justify-end">
                      <div className="bg-black/20 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 text-[10px] font-bold border border-white/10">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {book.rating}
                      </div>
                    </div>
                    <div>
                      <BookOpen className="w-8 h-8 mb-4 opacity-80" />
                      <h3 className="font-bold leading-tight mb-1 text-lg line-clamp-3 drop-shadow-md">{book.title}</h3>
                      <p className="text-xs opacity-90 font-medium text-white/80">{book.author}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories - Compact Pills */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ommabop Yo'nalishlar</h2>
            <p className="text-muted-foreground text-sm md:text-base">Qiziqishlaringiz bo'yicha adabiyotlarni toping</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Computer Science', icon: Code },
              { name: 'Mathematics', icon: Calculator },
              { name: 'Physics', icon: Atom },
              { name: 'Economics', icon: TrendingUp },
              { name: 'Psychology', icon: Brain },
              { name: 'Literature', icon: PenTool },
              { name: 'History', icon: History },
              { name: 'Biology', icon: Dna },
              { name: 'Engineering', icon: Building },
              { name: 'Philosophy', icon: Globe },
              { name: 'Art', icon: Palette },
              { name: 'Business', icon: Briefcase }
            ].map((cat, i) => (
              <Link key={i} href={`/library?category=${cat.name}`} className="group p-4 rounded-xl bg-card border border-border hover:border-primary hover:shadow-md transition-all text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                  <cat.icon className="w-5 h-5" />
                </div>
                <div className="font-medium text-sm text-foreground">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Compact Cards */}
      <section className="py-20 md:py-24 bg-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Talabalar Muvaffaqiyati</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "UniLib o'qish uslubimni o'zgartirdi. AI qidiruvi men topa olmagan kitoblarni topib beradi.",
                author: "Alex Chen",
                role: "Kompyuter Ilmlari",
                avatar: "AC"
              },
              {
                quote: "O'quv guruhlari ajoyib. Men murakkab mavzularni tushunishga yordam beradigan hamjamiyatni topdim.",
                author: "Sarah Johnson",
                role: "Tibbiyot",
                avatar: "SJ"
              },
              {
                quote: "Gamifikatsiya menga juda yoqadi! Nishonlarni yutish o'qishni o'yinga aylantiradi.",
                author: "Michael Park",
                role: "Adabiyotshunoslik",
                avatar: "MP"
              },
              {
                quote: "Iqtibos generatori mening eng sevimli vositam. Vaqtimni 50% ga tejaydi.",
                author: "Dildora Aliyeva",
                role: "Tarix",
                avatar: "DA"
              },
              {
                quote: "Dashboard orqali o'z o'sishimni kuzatib borish juda qulay. Har kuni o'qishga motivatsiya beradi.",
                author: "Jasur Karimov",
                role: "Iqtisodiyot",
                avatar: "JK"
              },
              {
                quote: "Kutubxona bazasi juda boy. O'zbek tilidagi nodir adabiyotlarni ham topish mumkinligi quvonarli.",
                author: "Malika Saidova",
                role: "Filologiya",
                avatar: "MS"
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-6 rounded-xl bg-muted/10 border border-transparent hover:border-border hover:bg-card hover:shadow-lg transition-all duration-300">
                <div className="mb-4 text-yellow-500 flex gap-1">
                  {[1, 2, 3, 4, 5].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-base text-foreground/80 mb-6 leading-relaxed font-medium italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/10">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">{testimonial.author}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Compact Accordion */}
      <section className="py-20 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-muted-foreground font-bold text-[10px] uppercase tracking-widest mb-3">
              <Lightbulb className="w-3.5 h-3.5" />
              Yordam Markazi
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ko'p So'raladigan Savollar</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "UniLib talabalar uchun bepulmi?", a: "Ha! UniLib barcha universitet talabalari uchun mutlaqo bepul. Ro'yxatdan o'tish uchun talabalik guvohnomasi yoki universitet emaili talab qilinadi." },
              { q: "Kitoblarni oflayn o'qish uchun yuklab olsam bo'ladimi?", a: "Albatta. Xavfsiz o'quvchi orqali oyiga 5 tagacha kitobni oflayn o'qish uchun yuklab olishingiz mumkin. Yuklab olingan kitoblar 30 kun davomida mavjud bo'ladi." },
              { q: "AI qidiruvi qanday ishlaydi?", a: "Bizning AI shunchaki kalit so'zlarni emas, balki so'rovingizning mazmunini tahlil qiladi. Masalan, 'iqtisodiy inqirozlar haqida kitoblar' deb yozsangiz, u mavzuga oid eng yaxshi manbalarni saralab beradi." },
              { q: "O'quv guruhlarini kim yaratadi?", a: "Har bir talaba o'quv guruhini yaratishi mumkin. O'qituvchilar ham rasmiy kurs guruhlarini ochishlari mumkin. Guruhlar ochiq yoki yopiq bo'lishi mumkin." },
              { q: "Platformada qanday tillardagi kitoblar bor?", a: "Hozirda o'zbek, ingliz va rus tillaridagi 10,000 dan ortiq ilmiy va badiiy adabiyotlar mavjud. Baza har kuni yangilanib boriladi." },
              { q: "Mobil ilovasi bormi?", a: "Hozirda biz veb-platformaga e'tibor qaratganmiz, ammo mobil ilova tez orada iOS va Android uchun taqdim etiladi." }
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer">
                <h3 className="text-base font-bold mb-2 flex items-center gap-3 text-foreground">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">?</span>
                  {faq.q}
                </h3>
                <p className="text-muted-foreground pl-8 leading-relaxed text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Adaptive Design */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden p-10 md:p-20 text-center shadow-xl shadow-primary/5 dark:shadow-slate-900/20">

            {/* Layer 1: Light Mode Background (White Card) */}
            <div className="absolute inset-0 bg-white border-2 border-primary/10 dark:hidden" />

            {/* Layer 2: Dark Mode Background (Slate Gradient) */}
            <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800" />

            {/* Abstract shapes */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 dark:bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 dark:bg-accent/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-primary dark:text-white">
                O'qish jarayonini <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600 dark:to-emerald-400">o'zgartirishga</span> tayyormisiz?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground dark:text-slate-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                Akademik maqsadlariga erishish uchun UniLib dan foydalanayotgan minglab talabalarga qo'shiling.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/library" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 hover:-translate-y-1">
                  Hozir Boshlash
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white dark:bg-white/10 text-primary dark:text-white font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/20 backdrop-blur-sm transition-all border-2 border-primary/10 dark:border-white/10 shadow-sm">
                  Ro'yxatdan O'tish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
