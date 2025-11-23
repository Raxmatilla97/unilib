# 📖 UniLib - O'rnatish va Foydalanish Qo'llanmasi

Bu qo'llanma UniLib loyihasini o'rnatish va ishga tushirish bo'yicha batafsil ko'rsatmalarni o'z ichiga oladi.

---

## 📋 Mundarija

1. [Tizim Talablari](#tizim-talablari)
2. [O'rnatish](#ornatish)
3. [Supabase Konfiguratsiyasi](#supabase-konfiguratsiyasi)
4. [Database Migratsiyalari](#database-migratsiyalari)
5. [Loyihani Ishga Tushirish](#loyihani-ishga-tushirish)
6. [Funksiyalar Bo'yicha Qo'llanma](#funksiyalar-boyicha-qollanma)
7. [Muammolarni Hal Qilish](#muammolarni-hal-qilish)

---

## 🖥️ Tizim Talablari

### Minimal Talablar
- **Node.js**: 18.0 yoki yuqori
- **npm**: 9.0 yoki yuqori
- **Git**: Eng so'nggi versiya
- **Brauzer**: Chrome, Firefox, Safari, Edge (so'nggi versiyalar)

### Tavsiya Etilgan
- **Node.js**: 20.x LTS
- **RAM**: 4GB yoki ko'proq
- **Disk**: 500MB bo'sh joy

---

## 🚀 O'rnatish

### 1. Repositoriyani Klonlash

```bash
git clone https://github.com/Kirito514/unilib.git
cd unilib
```

### 2. Dependencies O'rnatish

```bash
npm install
```

Bu quyidagi paketlarni o'rnatadi:
- Next.js 16
- React 19
- Supabase Client
- Tailwind CSS
- Radix UI komponentlar
- va boshqalar...

### 3. Environment Variables

`.env.local` faylini yarating:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Qayerdan olish:**
1. [Supabase Dashboard](https://supabase.com/dashboard) ga kiring
2. Loyihangizni tanlang
3. Settings → API ga o'ting
4. URL va Keys ni nusxalang

---

## 🗄️ Supabase Konfiguratsiyasi

### 1. Yangi Loyiha Yaratish

1. [Supabase](https://supabase.com) ga kiring
2. "New Project" tugmasini bosing
3. Loyiha nomini kiriting (masalan: `unilib`)
4. Parolni yarating
5. Regionni tanlang (eng yaqinini)
6. "Create new project" tugmasini bosing

### 2. Authentication Sozlash

1. **Authentication → Providers** ga o'ting
2. **Email** providerini yoqing
3. **Settings:**
   - Enable email confirmations: `false` (development uchun)
   - Enable email change confirmations: `true`

### 3. Storage Sozlash

1. **Storage** ga o'ting
2. Yangi bucket yarating: `books`
3. **Public access:** `true`
4. **File size limit:** `100MB`

---

## 📊 Database Migratsiyalari

### Migratsiyalarni Ishga Tushirish Tartibi

Quyidagi SQL fayllarni **Supabase SQL Editor** da ketma-ket ishlating:

#### 1. Asosiy Jadvallar (Agar yo'q bo'lsa)

```sql
-- profiles, books, reading_schedule, daily_progress jadvallari
-- Bu jadvallar allaqachon mavjud bo'lishi kerak
```

#### 2. Gamification Tizimi

**Fayl:** `supabase/migrations/20241123_gamification.sql`

Bu migration quyidagilarni yaratadi:
- `achievements` jadvali
- `user_achievements` jadvali
- `profiles` ga gamification ustunlari (`xp`, `level`, `streak_days`, etc.)
- Achievement check funksiyalari
- XP va level yangilash triggerlar

**Ishlatish:**
1. Supabase Dashboard → SQL Editor
2. Faylni oching va barcha kodni nusxalang
3. SQL Editor ga joylashtiring
4. "Run" tugmasini bosing

#### 3. Notifications Tizimi

**Fayl:** `supabase/migrations/20241123_notifications.sql`

Bu migration:
- `notifications` jadvalini yaratadi
- RLS policylarini sozlaydi

**Fayl:** `supabase/migrations/20241123_notification_triggers.sql`

Bu migration:
- Yutuq qo'lga kiritilganda avtomatik notification yaratadi

#### 4. Gamification Trigger Fix

**Fayl:** `supabase/migrations/20241123_fix_gamification_triggers.sql`

Bu migration:
- `total_pages_read` ni avtomatik yangilaydi
- Mavjud ma'lumotlarni qayta hisoblaydi

#### 5. Streak Logic

**Fayl:** `supabase/migrations/20241123_streak_logic.sql`

Bu migration:
- `last_streak_update` ustunini qo'shadi
- Streak avtomatik yangilanish triggerini yaratadi

#### 6. Leaderboard Functions

**Fayl:** `supabase/migrations/20241123_leaderboard_functions.sql`

Bu migration:
- `get_leaderboard()` funksiyasini yaratadi
- `get_streak_leaderboard()` funksiyasini yaratadi

### Migratsiyalarni Tekshirish

Barcha migratsiyalar muvaffaqiyatli ishlaganini tekshirish:

```sql
-- Jadvallarni tekshirish
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Funksiyalarni tekshirish
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';
```

---

## 🎯 Loyihani Ishga Tushirish

### Development Mode

```bash
npm run dev
```

Loyiha `http://localhost:3000` da ochiladi.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## 📚 Funksiyalar Bo'yicha Qo'llanma

### 1. Ro'yxatdan O'tish va Kirish

#### Ro'yxatdan O'tish
1. `/` sahifasiga o'ting
2. "Ro'yxatdan o'tish" tugmasini bosing
3. Ism, Email, Parol kiriting
4. "Ro'yxatdan o'tish" tugmasini bosing

#### Kirish
1. Email va Parolni kiriting
2. "Kirish" tugmasini bosing

### 2. Kitob Qo'shish (Admin)

1. `/library` ga o'ting
2. "Kitob qo'shish" tugmasini bosing
3. Ma'lumotlarni to'ldiring:
   - Nomi
   - Muallif
   - Tavsif
   - PDF fayl
   - Muqova rasmi (ixtiyoriy)
4. "Saqlash" tugmasini bosing

### 3. O'qish Rejasi Yaratish

1. Dashboard ga o'ting
2. Kitobni tanlang
3. "Reja yaratish" tugmasini bosing
4. Sozlamalar:
   - Boshlanish sanasi
   - Tugash sanasi
   - Kunlik maqsad (sahifa yoki daqiqa)
5. "Yaratish" tugmasini bosing

### 4. Kitob O'qish

1. Dashboard yoki Library dan kitobni tanlang
2. "O'qishni boshlash" tugmasini bosing
3. PDF reader ochiladi
4. Sahifalarni o'qing
5. Progress avtomatik saqlanadi

**Klaviatura Shortcutlar:**
- `←` / `→` - Sahifalarni almashtirish
- `+` / `-` - Zoom in/out
- `Esc` - Chiqish

### 5. Yutuqlarni Ko'rish

1. `/achievements` ga o'ting
2. Barcha yutuqlarni ko'ring
3. Tablar:
   - **Barchasi** - Barcha yutuqlar
   - **Qo'lga kiritilgan** - Sizning yutuqlaringiz
   - **Qulflangan** - Hali qo'lga kiritilmagan

**Yutuq Turlari:**
- 🔥 Streak (3, 7, 30, 100 kun)
- 📚 Kitoblar (1, 5, 10, 50 kitob)
- 📖 Sahifalar (100, 500, 1000, 5000 sahifa)
- 🎯 Maqsadlar (10, 50, 100 maqsad)

### 6. Reytingni Ko'rish

1. `/leaderboard` ga o'ting
2. Tablarni tanlang:
   - **XP Reytingi** - Eng ko'p XP
   - **Streak Reytingi** - Eng uzun streak
3. O'z o'rningizni ko'ring (highlight qilingan)

### 7. Bildirishnomalar

1. Header da qo'ng'iroq ikonasini bosing
2. Bildirishnomalar ro'yxati ochiladi
3. Bildirishnomani bosib, sahifaga o'ting
4. "Barchasini o'qilgan deb belgilash" tugmasi

---

## 🎮 Gamification Tizimi Qo'llanmasi

### XP Olish Yo'llari

| Harakat | XP |
|---------|-----|
| Sahifa o'qish | 10 XP/sahifa |
| Kunlik maqsad bajarish | 50 XP |
| Kitobni tugatish | 200 XP |
| Yutuq qo'lga kiritish | 25-100 XP |

### Daraja Tizimi

```
Daraja 1: 0 XP
Daraja 2: 1000 XP
Daraja 3: 2000 XP
...
Daraja N: (N-1) * 1000 XP
```

### Streak Qoidalari

1. **Streak Oshadi:**
   - Bugun kunlik maqsad bajarilsa
   - Kecha ham bajarilgan bo'lsa
   - Streak +1

2. **Streak Qayta Boshlanadi:**
   - Bir kun o'tkazib yuborilsa
   - Streak = 1

3. **Streak Saqlanadi:**
   - Bir kunda bir marta hisoblanadi
   - Bir kunda ko'p marta bajarish streak ni oshirmaydi

---

## 🔧 Muammolarni Hal Qilish

### Build Xatolari

#### "Module not found" Xatosi

**Sabab:** Package o'rnatilmagan

**Yechim:**
```bash
npm install
```

#### "Cannot find module '@/components/ui/...'"

**Sabab:** Shadcn/ui komponent yo'q

**Yechim:**
```bash
npx shadcn@latest add [component-name]
```

Yoki qo'lda yarating (`components/ui/` papkada).

### Database Xatolari

#### "column does not exist"

**Sabab:** Migration ishlatilmagan

**Yechim:**
1. Supabase SQL Editor ga o'ting
2. Tegishli migration faylini ishlating

#### "function does not exist"

**Sabab:** Function yaratilmagan

**Yechim:**
1. `20241123_leaderboard_functions.sql` ni ishlating
2. Yoki boshqa tegishli migration faylini

### Authentication Xatolari

#### "Invalid login credentials"

**Yechim:**
1. Email va parolni tekshiring
2. Supabase Dashboard da foydalanuvchi mavjudligini tekshiring

#### "Email not confirmed"

**Yechim:**
1. Supabase Dashboard → Authentication → Users
2. Foydalanuvchini toping
3. "Confirm email" tugmasini bosing

### Performance Muammolari

#### Sekin Yuklash

**Yechim:**
1. Browser cache ni tozalang
2. Development mode da ishlatayotganingizni tekshiring
3. Production build qiling: `npm run build`

#### PDF Sekin Ochilmoqda

**Yechim:**
1. PDF fayl hajmini tekshiring (100MB dan kam bo'lishi kerak)
2. PDF ni optimizatsiya qiling
3. Browser cache ni tozalang

---

## 📝 Qo'shimcha Maslahatlar

### Development

1. **Hot Reload:** Kod o'zgartirilganda avtomatik yangilanadi
2. **Console Logs:** Browser console ni ochib xatolarni ko'ring
3. **Network Tab:** API so'rovlarni kuzating

### Production

1. **Environment Variables:** Production uchun alohida `.env.production` yarating
2. **Build Optimization:** `npm run build` ishlatib optimizatsiya qiling
3. **Caching:** Static fayllar uchun CDN ishlatish tavsiya etiladi

### Database

1. **Backup:** Muntazam backup oling
2. **Indexlar:** Ko'p ishlatiladigan ustunlarga index qo'shing
3. **RLS:** Row Level Security ni doim yoqiq qoldiring

---

## 🆘 Yordam

Muammo yuzaga kelsa:

1. **GitHub Issues:** [github.com/Kirito514/unilib/issues](https://github.com/Kirito514/unilib/issues)
2. **Documentation:** Ushbu faylni qayta o'qing
3. **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
4. **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---

## ✅ Checklist

O'rnatish to'g'ri bajarilganini tekshirish:

- [ ] Node.js o'rnatilgan
- [ ] Repository klonlangan
- [ ] Dependencies o'rnatilgan
- [ ] `.env.local` yaratilgan
- [ ] Supabase loyihasi yaratilgan
- [ ] Barcha migratsiyalar ishlatilgan
- [ ] `npm run dev` ishlayapti
- [ ] Ro'yxatdan o'tish ishlayapti
- [ ] Kitob qo'shish ishlayapti
- [ ] PDF o'qish ishlayapti
- [ ] Gamification ishlayapti

---

**🎉 Tabriklaymiz! UniLib tayyor!**
