import Link from 'next/link';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Shield, CheckCircle } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 pt-20 pb-10">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight group">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:shadow-primary/25">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-foreground group-hover:text-primary transition-colors">LibraryID</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Ta'lim muassasalari uchun yagona raqamli identifikatsiya va kutubxona boshqaruv tizimi.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-1"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-1"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-1"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:-translate-y-1"><Linkedin className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h3 className="font-bold mb-6 text-lg">Platforma</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>Imkoniyatlar</Link></li>
                            <li><Link href="#pricing" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>Narxlar</Link></li>
                            <li><Link href="#demo" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>Demo Versiya</Link></li>
                            <li><Link href="/login" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>Tizimga Kirish</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="font-bold mb-6 text-lg">Yordam</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>Qo'llanma</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>FAQ</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>Texnik Yordam</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>API Hujjatlari</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold mb-6 text-lg">Bog'lanish</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="leading-relaxed">Toshkent sh., Yakkasaroy tumani, Bog'ibo'ston ko'chasi 3a</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span>(55) 520-88-88</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span>info@umft-official.uz</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; 2025 LibraryID. Barcha huquqlar himoyalangan.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="#" className="hover:text-primary transition-colors">Maxfiylik Siyosati</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Foydalanish Shartlari</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
