# 📚 UniLib - Universitet Kutubxonasi

> Premium onlayn kutubxona platformasi o'zbek tili uchun. AI qidiruv, gamification, va ijtimoiy o'rganish funksiyalari bilan.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 🌟 Asosiy Funksiyalar

### 📖 Kitob O'qish
- **PDF Reader** - To'liq funksional PDF o'qish interfeysi
- **Progress Tracking** - Avtomatik o'qish jarayonini kuzatish
- **Auto-Resume** - Oxirgi o'qilgan sahifadan davom ettirish
- **Reading Schedule** - Kunlik o'qish rejasi yaratish

### 🎮 Gamification Tizimi
- **XP va Darajalar** - Kitob o'qish orqali tajriba to'plash
- **Yutuqlar (Achievements)** - 15+ turli yutuqlar
- **Streak Tizimi** - Kunlik o'qish zanjiri
- **Reyting (Leaderboard)** - XP va Streak bo'yicha musobaqa

### 📊 Shaxsiy Dashboard
- **O'qish Statistikasi** - Kunlik, haftalik, oylik hisobotlar
- **Bugungi Reja** - Joriy kitob va maqsad
- **Faoliyat Tarixi** - So'nggi harakatlar
- **XP Progress Bar** - Keyingi darajagacha qolgan XP

### 🔔 Bildirishnomalar
- **Real-time Notifications** - Yutuqlar va yangiliklar
- **Achievement Alerts** - Yangi yutuq qo'lga kiritilganda
- **Daily Goal Reminders** - Kunlik maqsad eslatmalari

### 🏆 Reyting Tizimi
- **XP Reytingi** - Eng ko'p XP to'plaganlar
- **Streak Reytingi** - Eng uzun streak
- **Top 3 Medals** - Oltin, Kumush, Bronza
- **User Highlight** - O'z o'rningizni ko'rish

---

## 🚀 Texnologiyalar

### Frontend
- **Next.js 16** - React framework (App Router)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **React PDF** - PDF rendering

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security (RLS)
- **Server Actions** - Next.js server-side logic

### State Management
- **React Context** - Auth state
- **React Hooks** - Local state

---

## 📁 Loyiha Strukturasi

```
unilib2/
├── app/                          # Next.js App Router
│   ├── achievements/             # Yutuqlar sahifasi
│   ├── citations/                # Iqtiboslar (Coming Soon)
│   ├── dashboard/                # Bosh sahifa
│   ├── groups/                   # Guruhlar (Coming Soon)
│   ├── leaderboard/              # Reyting
│   ├── library/                  # Kutubxona
│   ├── notifications/            # Bildirishnomalar
│   ├── reader/[id]/              # Kitob o'qish
│   └── schedule/                 # O'qish rejasi
├── components/                   # React komponentlar
│   ├── auth/                     # Autentifikatsiya
│   ├── dashboard/                # Dashboard widgetlar
│   ├── gamification/             # XP, Yutuqlar
│   ├── layout/                   # Header, Footer
│   ├── leaderboard/              # Reyting komponentlar
│   ├── notifications/            # Bildirishnoma komponentlar
│   ├── reader/                   # PDF reader
│   └── ui/                       # UI primitives
├── contexts/                     # React Context
│   └── AuthContext.tsx           # Auth state
├── lib/                          # Utilities
│   ├── supabase/                 # Supabase clients
│   └── utils.ts                  # Helper functions
├── supabase/                     # Database
│   └── migrations/               # SQL migrations
└── public/                       # Static files
```

---

## 🎯 Asosiy Funksiyalar Tavsifi

### 1. Gamification Tizimi

**XP (Experience Points):**
- Kitob o'qish: 10 XP/sahifa
- Kunlik maqsad: 50 XP
- Kitobni tugatish: 200 XP
- Yutuq qo'lga kiritish: 25-100 XP

**Darajalar:**
- Har 1000 XP = 1 daraja
- Maksimal daraja: Cheksiz

**Yutuqlar:**
- 🔥 Streak yutuqlari (3, 7, 30, 100 kun)
- 📚 Kitob yutuqlari (1, 5, 10, 50 kitob)
- 📖 Sahifa yutuqlari (100, 500, 1000, 5000 sahifa)
- 🎯 Maqsad yutuqlari (10, 50, 100 maqsad)

### 2. O'qish Rejasi (Reading Schedule)

**Funksiyalar:**
- Kitob tanlash
- Boshlanish va tugash sanasi
- Kunlik maqsad (sahifa yoki daqiqa)
- Avtomatik progress tracking
- Kalendar ko'rinishi

**Progress Tracking:**
- Real-time yangilanish
- Kunlik maqsad bajarilganda bildirishnoma
- Streak yangilanishi
- XP berish

### 3. Reyting (Leaderboard)

**XP Reytingi:**
- Eng ko'p XP to'plaganlar
- Top 3 alohida ajratilgan
- Joriy foydalanuvchi highlight

**Streak Reytingi:**
- Eng uzun streak
- Faqat faol streaklar
- Real-time yangilanish

---

## 🔐 Xavfsizlik

### Row Level Security (RLS)
Barcha jadvallar RLS bilan himoyalangan:
- Foydalanuvchilar faqat o'z ma'lumotlarini ko'radi
- Admin funksiyalari alohida
- Server-side validation

### Authentication
- Supabase Auth
- Email/Password
- Session management
- Protected routes

---

## 📱 Responsive Dizayn

- **Mobile-first** - Mobil qurilmalar uchun optimallashtirilgan
- **Tablet** - Planshetlar uchun moslashtirilgan
- **Desktop** - Katta ekranlar uchun to'liq funksional

---

## 🎨 Dizayn Tizimi

### Ranglar
- **Primary** - Asosiy rang (ko'k)
- **Accent** - Urg'u rang (pushti)
- **Muted** - Pasaytirilgan rang
- **Destructive** - Xavfli harakatlar (qizil)

### Komponentlar
- **Glassmorphism** - Shaffof orqa fon
- **Gradients** - Rang o'tishlari
- **Shadows** - Soyalar
- **Animations** - Animatsiyalar

---

## 📊 Database Schema

### Asosiy Jadvallar

**profiles**
- `id`, `name`, `email`, `avatar_url`
- `xp`, `level`, `streak_days`
- `total_pages_read`, `total_books_completed`

**books**
- `id`, `title`, `author`, `description`
- `file_url`, `cover_url`, `total_pages`

**reading_schedule**
- `id`, `user_id`, `book_id`
- `start_date`, `end_date`
- `daily_goal_pages`, `daily_goal_minutes`

**daily_progress**
- `id`, `user_id`, `schedule_id`
- `date`, `pages_read`, `completed`

**achievements**
- `id`, `key`, `title`, `description`
- `xp_reward`, `tier`, `requirement_type`

**user_achievements**
- `id`, `user_id`, `achievement_id`
- `unlocked_at`, `seen`

**notifications**
- `id`, `user_id`, `title`, `message`
- `type`, `is_read`, `link`

---

## 🔄 Coming Soon

- 👥 **O'quv Guruhlari** - Real-time chat, guruh maqsadlari
- 📝 **Iqtibos Generatori** - APA, MLA, Chicago, Harvard
- 🔍 **AI Qidiruv** - Semantic search
- 📈 **Tahlil Dashboard** - Batafsil statistika
- 🎓 **Kurslar** - Strukturalashtirilgan o'quv rejalari

---

## 📖 Qo'shimcha Ma'lumot

Batafsil o'rnatish va foydalanish bo'yicha ko'rsatmalar uchun:

👉 **[INSTRUCTIONS.md](./INSTRUCTIONS.md)** - To'liq qo'llanma

---

## 🤝 Hissa Qo'shish

Loyihaga hissa qo'shmoqchimisiz? Pull request yuboring!

---

## 📄 Litsenziya

MIT License

---

## 👨‍💻 Muallif

**UniLib Team**

---

**🌟 Agar loyiha yoqsa, star bering!**
