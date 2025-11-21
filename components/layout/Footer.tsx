import Link from 'next/link';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-16 pb-8">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight group">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <span className="text-foreground group-hover:text-primary transition-colors">UniLib</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Talabalar va tadqiqotchilar uchun sun'iy intellektga asoslangan zamonaviy raqamli kutubxona platformasi.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h3 className="font-bold mb-6">Platforma</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/library" className="hover:text-primary transition-colors">Kutubxona Katalogi</Link></li>
                            <li><Link href="/groups" className="hover:text-primary transition-colors">O'quv Guruhlari</Link></li>
                            <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Reyting va Yutuqlar</Link></li>
                            <li><Link href="/citations" className="hover:text-primary transition-colors">Iqtibos Generatori</Link></li>
                            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Shaxsiy Kabinet</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="font-bold mb-6">Resurslar</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Foydalanish Qo'llanmasi</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Tadqiqot Usullari</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Akademik Yozuv</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">API Hujjatlari</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Hamjamiyat</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold mb-6">Bog'lanish</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>Toshkent sh., Universitet ko'chasi, 12-uy</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+998 71 123 45 67</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>info@unilib.uz</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; 2024 UniLib. Barcha huquqlar himoyalangan.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-primary transition-colors">Maxfiylik Siyosati</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Foydalanish Shartlari</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Cookie Sozlamalari</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
