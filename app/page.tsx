import Link from 'next/link';
import {
    CheckCircle, ArrowRight, Sparkles, Shield, Zap, Users,
    TrendingUp, Clock, BookOpen, QrCode, Smartphone, BarChart3,
    Building2, GraduationCap, School, Library, Award, Target,
    Globe, Mail, Phone, ChevronRight, Star, Laptop, WifiOff,
    Play, Layers, PieChart, Lock, History, X, Database, ChevronDown
} from 'lucide-react';
import { HeroActions } from '@/components/landing/HeroActions';

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20 selection:text-primary">

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 overflow-hidden">
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
                            <span>O'zbekiston Milliy Kutubxona ID Tizimi</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                            Kutubxonangizni <br />
                            <span className="text-primary inline-block relative">
                                Kelajakka
                                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                                </svg>
                            </span>{' '}
                            Olib O'ting
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
                            LibraryID — bu ta'lim muassasalari uchun yagona raqamli ekotizim.
                            Jarayonlarni 90% ga tezlashtiring va to'liq nazoratga ega bo'ling.
                        </p>

                        {/* CTA Buttons */}
                        <HeroActions />

                        {/* Dashboard Preview (Glassmorphism) */}
                        <div className="mt-16 md:mt-24 relative w-full max-w-5xl mx-auto perspective-1000">
                            <div className="relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

                                {/* Mockup Header */}
                                <div className="h-10 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                    </div>
                                    <div className="ml-4 h-5 w-64 rounded-full bg-muted/50 text-[10px] flex items-center px-3 text-muted-foreground">
                                        libraryid.uz/dashboard
                                    </div>
                                </div>

                                {/* Mockup Content */}
                                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                    {/* Sidebar Mock */}
                                    <div className="hidden md:block space-y-4">
                                        <div className="h-8 w-32 bg-primary/20 rounded-lg mb-6" />
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="h-10 w-full bg-muted/50 rounded-lg" />
                                        ))}
                                    </div>

                                    {/* Main Content Mock */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="grid grid-cols-3 gap-4">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-24 rounded-xl bg-card border border-border/50 p-4">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 mb-2" />
                                                    <div className="h-4 w-16 bg-muted rounded" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="h-64 rounded-xl bg-card border border-border/50 p-4">
                                            <div className="flex items-end gap-2 h-full pb-4 px-4">
                                                {[40, 70, 45, 90, 60, 80, 50, 75, 65, 85].map((h, i) => (
                                                    <div key={i} className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -right-12 top-1/4 p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-xl animate-float hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Kitob Qaytarildi</div>
                                        <div className="text-xs text-muted-foreground">Hozirgina • Alisher K.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -left-12 bottom-1/4 p-4 rounded-2xl bg-card/80 backdrop-blur-md border border-border shadow-xl animate-float delay-1000 hidden lg:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold">+125 O'quvchi</div>
                                        <div className="text-xs text-muted-foreground">Bu hafta qo'shildi</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 border-y border-border/50 bg-muted/20 backdrop-blur-sm overflow-hidden">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {[
                            { label: "Muassasalar", value: "50+", icon: Building2 },
                            { label: "O'quvchilar", value: "25k+", icon: Users },
                            { label: "Kitoblar", value: "100k+", icon: BookOpen },
                            { label: "Tejalgan Vaqt", value: "90%", icon: Clock },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center justify-center text-center group">
                                <div className="mb-3 p-3 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                    <stat.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{stat.value}</div>
                                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" className="py-24 md:py-32 relative overflow-hidden">
                <div className="container px-4 mx-auto relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Barcha Jarayonlar <span className="text-primary">Bitta Tizimda</span></h2>
                        <p className="text-lg text-muted-foreground">
                            Eski uslubdagi qog'ozbozlikdan voz keching. LibraryID sizga zamonaviy boshqaruv vositalarini taqdim etadi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {/* Large Card 1 */}
                        <div className="md:col-span-2 rounded-3xl bg-card border border-border p-8 md:p-12 relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                    <QrCode className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">Yagona ID Karta Tizimi</h3>
                                <p className="text-muted-foreground text-lg max-w-md mb-8">
                                    Har bir o'quvchi va xodim uchun maxsus QR kodli ID karta.
                                    Kitob olish, binoga kirish va davomat uchun yagona yechim.
                                </p>
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                                        <Zap className="w-4 h-4 text-yellow-500" />
                                        5 soniyada skanerlash
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        100% Xavfsiz
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tall Card */}
                        <div className="md:row-span-2 rounded-3xl bg-card border border-border p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-500 flex flex-col">
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent z-10" />
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                                <BarChart3 className="w-7 h-7 text-accent" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Real-time Statistika</h3>
                            <p className="text-muted-foreground mb-8">
                                Kutubxona faoliyatini to'liq nazorat qiling. Eng ko'p o'qiladigan kitoblar va faol o'quvchilar reytingi.
                            </p>

                            {/* Chart Mockup */}
                            <div className="mt-auto relative h-64 w-full bg-muted/20 rounded-xl border border-border/50 p-4 flex items-end justify-between gap-2 group-hover:scale-105 transition-transform duration-500">
                                {[30, 50, 45, 70, 60, 90, 80].map((h, i) => (
                                    <div key={i} className="w-full bg-accent/50 rounded-t-sm" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="rounded-3xl bg-card border border-border p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6">
                                <Award className="w-6 h-6 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Gamifikatsiya</h3>
                            <p className="text-muted-foreground">
                                O'quvchilarni kitob o'qishga ruhlantiring. XP, darajalar va yutuqlar tizimi.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="rounded-3xl bg-card border border-border p-8 relative overflow-hidden group hover:border-primary/50 transition-all duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6">
                                <WifiOff className="w-6 h-6 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Offline Rejim</h3>
                            <p className="text-muted-foreground">
                                Internet bo'lmaganda ham ishlashda davom eting. Ma'lumotlar keyin sinxronlanadi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section id="about" className="py-24 md:py-32 bg-background relative overflow-hidden">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Nega Aynan <span className="text-primary">LibraryID?</span></h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Eski uslubdagi kutubxona va zamonaviy tizim o'rtasidagi farqni his qiling.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 relative">
                        {/* Old Way */}
                        <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <History className="w-24 h-24 md:w-32 md:h-32 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-red-500 flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-red-500/10"><X className="w-6 h-6" /></span>
                                Eski Tizim
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Har bir kitobni qo'lda yozib olish",
                                    "Uzun navbatlar va kutish vaqti",
                                    "Kitoblar yo'qolishi va hisobsizligi",
                                    "Statistika va hisobotlar yo'qligi",
                                    "O'quvchilarda qiziqish pastligi"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-muted-foreground">
                                        <X className="w-5 h-5 text-red-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* New Way */}
                        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Sparkles className="w-24 h-24 md:w-32 md:h-32 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-6 text-primary flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-primary/10"><CheckCircle className="w-6 h-6" /></span>
                                LibraryID
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "QR kod orqali 5 soniyada xizmat",
                                    "Navbatlar yo'q, to'liq avtomatlashgan",
                                    "100% nazorat va shaffoflik",
                                    "Real vaqtda aniq statistika",
                                    "Gamifikatsiya orqali yuqori motivatsiya"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium">
                                        <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-24 md:py-32 bg-muted/20 overflow-hidden">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">3 Qadamda <span className="text-primary">Ishga Tushiring</span></h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Murakkab jarayonlar yo'q. Tizimni o'rnatish va ishlatish juda oson.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Ro'yxatdan O'tish",
                                desc: "Muassasangizni tizimga ulang va admin kabinetiga ega bo'ling.",
                                icon: Building2
                            },
                            {
                                step: "02",
                                title: "Ma'lumotlarni Yuklash",
                                desc: "O'quvchilar va kitoblar bazasini excel orqali oson yuklang.",
                                icon: Database
                            },
                            {
                                step: "03",
                                title: "ID Kartalarni Tarqatish",
                                desc: "QR kodli ID kartalarni tarqating va tizimdan foydalanishni boshlang.",
                                icon: QrCode
                            }
                        ].map((item, i) => (
                            <div key={i} className="relative p-8 rounded-3xl bg-background border border-border hover:border-primary/50 transition-all group">
                                <div className="absolute -top-6 left-8 text-6xl font-black text-muted/20 group-hover:text-primary/10 transition-colors">
                                    {item.step}
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative z-10">
                                    <item.icon className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 relative z-10">{item.title}</h3>
                                <p className="text-muted-foreground relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 md:py-32 bg-background overflow-hidden">
                <div className="container px-4 mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ko'p So'raladigan <span className="text-primary">Savollar</span></h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "Tizimni o'rnatish uchun server kerakmi?",
                                a: "Yo'q, LibraryID bulutli (cloud) tizim. Sizga faqat internet va kompyuter kerak."
                            },
                            {
                                q: "Internet yo'q bo'lsa nima bo'ladi?",
                                a: "Tizim offline rejimda ham ishlaydi. Internet paydo bo'lganda ma'lumotlar avtomatik sinxronlanadi."
                            },
                            {
                                q: "ID kartalarni qayerdan olamiz?",
                                a: "Biz sizga tayyor dizayn beramiz yoki o'zimiz chop etib yetkazib berishimiz mumkin."
                            },
                            {
                                q: "Eski ma'lumotlarni qanday o'tkazamiz?",
                                a: "Excel fayl orqali barcha kitoblar va o'quvchilarni bir zumda import qilishingiz mumkin."
                            }
                        ].map((item, i) => (
                            <details key={i} className="group p-6 rounded-2xl bg-muted/20 open:bg-primary/5 transition-colors">
                                <summary className="flex items-center justify-between font-bold text-lg cursor-pointer list-none">
                                    {item.q}
                                    <span className="transition-transform group-open:rotate-180">
                                        <ChevronDown className="w-5 h-5" />
                                    </span>
                                </summary>
                                <p className="mt-4 text-muted-foreground leading-relaxed">
                                    {item.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 md:py-32 bg-muted/20 overflow-hidden">
                <div className="container px-4 mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Shaffof Narxlar</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Muassasangiz turiga mos keluvchi rejani tanlang. Yashirin to'lovlar yo'q.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Maktab',
                                price: '40,000',
                                desc: 'Kichik va o\'rta maktablar uchun',
                                features: ['200 tagacha o\'quvchi', '1,000 tagacha kitob', 'Asosiy funksiyalar', 'Email support']
                            },
                            {
                                name: 'Kollej',
                                price: '100,000',
                                desc: 'Kollej va litseylar uchun',
                                popular: true,
                                features: ['500 tagacha o\'quvchi', '3,000 tagacha kitob', 'Barcha funksiyalar', 'Priority support', 'SMS xabarnomalar']
                            },
                            {
                                name: 'Universitet',
                                price: '250,000',
                                desc: 'Oliy ta\'lim muassasalari uchun',
                                features: ['Cheksiz o\'quvchi', 'Cheksiz kitob', 'Premium funksiyalar', '24/7 support', 'API integratsiya']
                            }
                        ].map((plan, i) => (
                            <div key={i} className={`relative p-8 rounded-3xl border transition-all duration-300 ${plan.popular
                                    ? 'bg-card border-primary shadow-2xl shadow-primary/10 md:scale-105 z-10'
                                    : 'bg-background border-border hover:border-primary/50'
                                }`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                                        Eng Ommabop
                                    </div>
                                )}
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground">so'm/oy</span>
                                    </div>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-sm">
                                            <CheckCircle className={`w-5 h-5 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="#demo"
                                    className={`block w-full py-4 rounded-xl font-bold text-center transition-all ${plan.popular
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg'
                                            : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    Tanlash
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="demo" className="py-24 md:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />

                <div className="container px-4 mx-auto relative z-10 text-center max-w-4xl">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
                        Kutubxonangizni Bugun <br />
                        <span className="text-primary">Raqamlashtiring</span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                        30 kunlik bepul sinov davri. Kredit karta talab qilinmaydi.
                        Hozir ro'yxatdan o'ting va 5 daqiqada ishga tushiring.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register"
                            className="px-10 py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-xl hover:shadow-2xl hover:bg-primary/90 transition-all hover:-translate-y-1"
                        >
                            Bepul Boshlash
                        </Link>
                        <Link
                            href="#contact"
                            className="px-10 py-5 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-xl hover:bg-muted/50 transition-all"
                        >
                            Bog'lanish
                        </Link>
                    </div>
                </div>
            </section>

            {/* Hidden Contact Anchor for Footer */}
            <div id="contact" />

        </div>
    );
}
