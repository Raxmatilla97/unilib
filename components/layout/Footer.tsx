"use client";

import Link from 'next/link';
import { useState } from 'react';
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Send } from 'lucide-react';

export function Footer() {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement newsletter subscription
        console.log('Newsletter subscription:', email);
        setEmail('');
    };

    return (
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 pt-20 pb-10">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all rounded-full"></div>
                                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:shadow-primary/25">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                            </div>
                            <span className="text-foreground group-hover:text-primary transition-colors">Library ID</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Ta'lim muassasalari uchun yagona raqamli identifikatsiya va kutubxona boshqaruv tizimi.
                        </p>
                        <div className="flex gap-3">
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                                <Facebook className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
                                <Linkedin className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h3 className="font-bold mb-6 text-lg">Platforma</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li>
                                <Link href="/library" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    Kutubxona
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    Kabinet
                                </Link>
                            </li>
                            <li>
                                <Link href="/achievements" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    Yutuqlar
                                </Link>
                            </li>
                            <li>
                                <Link href="/login" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    Tizimga Kirish
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="font-bold mb-6 text-lg">Yordam</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    Qo'llanma
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    Texnik Yordam
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-primary transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors"></span>
                                    API Hujjatlari
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info + Newsletter */}
                    <div>
                        <h3 className="font-bold mb-6 text-lg">Bog'lanish</h3>
                        <ul className="space-y-4 text-sm text-muted-foreground mb-6">
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="leading-relaxed">Toshkent sh., Yakkasaroy tumani</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span>(55) 520-88-88</span>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span>info@unilib.uz</span>
                            </li>
                        </ul>

                        {/* Newsletter */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3 text-sm">Yangiliklar</h4>
                            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    required
                                    className="flex-1 px-3 py-2 rounded-lg bg-muted/50 border border-transparent focus:border-primary/20 outline-none text-sm transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; 2025 Library ID. Barcha huquqlar himoyalangan.
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
