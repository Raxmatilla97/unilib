# TO'LIQ IMPLEMENTATSIYA REJASI

## 🎯 Loyihaning Yangi Ko'rinishi

**Avval:** Online kutubxona platformasi (UniLib)
**Endi:** **Milliy Raqamli Kutubxona ID Tizimi** 🇺🇿

Bu - O'zbekiston bo'ylab barcha maktab, kollej va universitetlar uchun yagona ID karta tizimi.

---

## 📊 UMUMIY MA'LUMOT

### Asosiy Raqamlar

| Ko'rsatkich | Qiymat |
|-------------|---------|
| **Rollar** | 8 ta (Super Admin → Student) |
| **Asosiy Funksiya** | 15+ ta |
| **Database Jadvallari** | 20+ ta |
| **Implementatsiya Vaqti** | 8-12 hafta (MVP) |
| **Bosqichlar** | 14 ta |

### Texnologiyalar

- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Backend:** Supabase (PostgreSQL + RLS + Edge Functions)
- **ID Card:** QR Code + Barcode (Code128)
- **Notifications:** SMS (Playmobile/Eskiz), Email (SendGrid), Push (FCM)
- **Offline:** IndexedDB + Sync Queue
- **Printing:** PDF generation (jsPDF) + Receipt printer
- **Scanner:** USB Barcode Scanner + Webcam QR

---

## 👥 8 TA ROL - BATAFSIL

### 1️⃣ Super Admin (Platform Egasi)

**Kim:** Siz va jamoangiz

**Dashboardi:**
```
┌─────────────────────────────────────────┐
│ 🌍 Platform Super Admin                │
├─────────────────────────────────────────┤
│ 📊 Umumiy Statistika                   │
│   • Tashkilotlar: 245                   │
│   • Jami o'quvchilar: 125,430          │
│   • Aktiv: 89,234 (71%)                │
│   • Oylik daromad: $12,450             │
│                                         │
│ 📈 O'sish (oyma-oy)                    │
│   • Yangi tashkilotlar: +15            │
│   • Yangi o'quvchilar: +8,234          │
│   • Churn rate: 2.1%                   │
│                                         │
│ 🏢 Tashkilotlar (so'nggi)              │
│   • 50-maktab, Toshkent                │
│   • Oqtepa kollej, Samarqand           │
│   • TATU, Toshkent                     │
│                                         │
│ [+ Yangi Tashkilot] [Billing] [Support]│
└─────────────────────────────────────────┘
```

**Funksiyalar:**
- ✅ Yangi tashkilot ochish
- ✅ Tashkilot adminini tayinlash
- ✅ Billing va to'lovlar
- ✅ Platform-wide analytics
- ✅ Feature toggle (yangi funksiyalarni on/off)
- ✅ A/B testing sozlamalari
- ✅ Pricing o'zgartirish

**Database:**
```sql
role = 'super_admin'
organization_id = NULL  -- Platform darajasida
```

---

### 2️⃣ System Admin (Support Jamoasi)

**Kim:** Bizning texnik support xodimlarimiz

**Funksiyalar:**
- ✅ Bug report qabul qilish
- ✅ Barcha tashkilotlar ma'lumotlarini ko'rish (debug uchun)
- ✅ Database backup/restore
- ✅ System logs ko'rish
- ✅ Maktablarga texnik yordam
- ✅ Feature request qabul qilish

**Database:**
```sql
role = 'system_admin'
organization_id = NULL
permissions = ['view_all', 'debug', 'support']
```

---

### 3️⃣ Organization Admin (Maktab Direktori)

**Kim:** Maktab/Kollej/Universitet rahbariyati

**Dashboardi:**
```
┌─────────────────────────────────────────┐
│ 🏫 50-maktab Admin Panel               │
├─────────────────────────────────────────┤
│ 📊 Umumiy Ko'rsatkichlar               │
│   • O'quvchilar: 650                   │
│   • Aktiv: 487 (75%)                   │
│   • Kitoblar: 1,250                    │
│   • Aktiv qarzlar: 145                 │
│                                         │
│ 👥 Jamoa                               │
│   • Feruza Aliyeva - Head Librarian   │
│   • Jamshid Toshev - Librarian        │
│   • Malika Karimova - Teacher         │
│                                         │
│ 💰 Moliya                              │
│   • Obuna: Premium ($89/oy)           │
│   • Jarimalar (oylik): 125,000 so'm   │
│                                         │
│ [Sozlamalar] [Hisobotlar] [Jamoa]     │
└─────────────────────────────────────────┘
```

**Funksiyalar:**
- ✅ Jamoa boshqaruvi (Head Librarian, Librarian, Teacher qo'shish)
- ✅ Tashkilot sozlamalari (logo, kontakt, manzil)
- ✅ Kutubxona konfiguratsiya:
  - Kitob berish muddati (14 kun)
  - Maksimal kitoblar (2 ta)
  - Kunlik jarima (1000 so'm)
  - XP ball miqdorlari
- ✅ Excel import/export (kitoblar, o'quvchilar)
- ✅ Billing va to'lovlar ko'rish
- ✅ Barcha o'quvchi va kitoblar statistikasi
- ✅ Announcement yuborish (barcha o'quvchilarga)

---

### 4️⃣ Head Librarian (Bosh Kutubxonachi)

**Kim:** Kutubxona rahbari

**Dashboardi:**
```
┌─────────────────────────────────────────┐
│ 📚 Kutubxona Boshqaruvi                │
├─────────────────────────────────────────┤
│ 👥 Jamoa (Kutubxonachilar)             │
│   • Jamshid - 234 ta kitob bergan (oy) │
│   • Dilshod - 189 ta kitob bergan      │
│                                         │
│ 📊 Bugungi Statistika                  │
│   • Berilgan: 45 ta                    │
│   • Qaytarilgan: 38 ta                 │
│   • Muddati o'tgan: 12 ta              │
│                                         │
│ ⚙️ Sozlamalar                          │
│   • Kitob muddati: 14 kun              │
│   • Maksimal kitob: 2 ta               │
│   • Jarima: 1000 so'm/kun              │
│                                         │
│ [Kutubxonachi +] [Sozlamalar] [Hisobot]│
└─────────────────────────────────────────┘
```

**Funksiyalar:**
- ✅ Kutubxonachi qo'shish/o'chirish
- ✅ Kutubxonachi faoliyatini monitoring
- ✅ Kutubxona sozlamalarini o'zgartirish
- ✅ Moliyaviy hisobotlar (jarimalar)
- ✅ Kitob inventarizatsiya
- ✅ Excel export (barcha ma'lumotlar)
- ✅ Backup olish

**Farqi Librarian'dan:**
- Boshqaruv huquqlari
- Sozlamalarni o'zgartirish
- Moliyaviy ma'lumotlar

---

### 5️⃣ Librarian (Kutubxonachi)

**Kim:** Kutubxonada ishlovchi xodim

**Interfeysi (Asosiy ish joyi):**
```
┌─────────────────────────────────────────┐
│ 📖 Kitob Berish/Qabul Qilish           │
├─────────────────────────────────────────┤
│ 🔍 [Kartani skaner qiling...]          │
│                                         │
│ Yoki:                                   │
│ 📱 Telefon: [+998 __ ___ __ __]        │
│ 💳 ID Raqam: [UZ-00045-2024-_______]   │
│                                         │
│ [Skaner Boshlash] [Qo'lda Kiritish]   │
└─────────────────────────────────────────┘
```

**O'quvchi skanerlangandan keyin:**
```
┌─────────────────────────────────────────┐
│ 👤 Alisher Karimov | 8-A sinf         │
│ ⭐ Level 5 - 2,340 XP                  │
├─────────────────────────────────────────┤
│ 📚 Hozirgi kitoblar: 1/2               │
│                                         │
│ ✅ "O'tkan Kunlar" (Abdulla Qodiriy)   │
│    Olingan: 15-noyabr                  │
│    Qaytarish: 29-noyabr (bugun!)      │
│    [Muddatni Uzaytirish] [Qaytardi]   │
│                                         │
│ ⚠️ Muddati o'tgan: Yo'q                │
│ 💰 Jarima: 0 so'm                      │
│                                         │
│ [+ Yangi Kitob Berish]                 │
└─────────────────────────────────────────┘
```

**Funksiyalar:**
- ✅ Kartani skaner qilish (barcode/QR)
- ✅ Kartasiz kirish (SMS kod)
- ✅ Kitob berish (borrow)
- ✅ Kitob qabul qilish (return)
- ✅ Muddatni uzaytirish
- ✅ Kitob rezerv qilish
- ✅ Yangi o'quvchi ro'yxatdan o'tkazish
- ✅ ID karta chop etish
- ✅ Kartani block/unblock (jarima bo'lsa)
- ✅ Muddati o'tgan kitoblar ro'yxati
- ✅ Kunlik hisobot

---

### 6️⃣ Teacher (O'qituvchi)

**Kim:** Fanlar o'qituvchisi

**Dashboardi:**
```
┌─────────────────────────────────────────┐
│ 👨‍🏫 Malika Karimova - Adabiyot        │
│ 📚 8-A sinf                            │
├─────────────────────────────────────────┤
│ 📊 Sinf O'qish Statistikasi            │
│   • Jami o'quvchilar: 32               │
│   • Faol: 24 (75%)                     │
│   • Passiv: 8                          │
│                                         │
│ 🏆 Top 5 O'quvchilar                   │
│   1. Alisher - 12 kitob (Level 6)     │
│   2. Madina - 10 kitob (Level 5)      │
│   3. Sardor - 8 kitob (Level 4)       │
│                                         │
│ ⚠️ Passive O'quvchilar (0 kitob)       │
│   • Jasur, Dilnoza, Feruza            │
│                                         │
│ 📖 Reading Assignments                 │
│   • "Otgan Kunlar" - 18/32 bajarildi  │
│   • "Ikki Eshik Orasi" - 0/32         │
│                                         │
│ [+ Yangi Topshiriq] [Hisobot]         │
└─────────────────────────────────────────┘
```

**Funksiyalar:**
- ✅ Sinf statistikasini ko'rish
- ✅ **Reading assignment berish:**
  - Kitob tanlash
  - Muddat belgilash
  - Tavsif yozish
  - Compliance avtomatik kuzatiladi
- ✅ Passive o'quvchilarni aniqlash
- ✅ Kitob tavsiya qilish
- ✅ Haftalik/oylik hisobot (PDF export)
- ✅ O'quvchilar o'qish kategoriyalari

**Reading Assignment Misol:**
```
Topshiriq: "Otgan Kunlar" kitobini o'qish
Muddat: 1-dekabr
Tavsif: Keyingi darsda muhokama qilamiz

Bajarilish: 18/32
✅ Alisher, Madina, Sardor... (18 ta)
❌ Dilnoza, Feruza, Jasur... (14 ta)
```

---

### 7️⃣ Parent (Ota-ona)

**Kim:** O'quvchining ota-onasi

**Dashboardi:**
```
┌─────────────────────────────────────────┐
│ 👨‍👩‍👦 Farzand: Alisher Karimov        │
│ 🎓 8-A sinf | 50-maktab                │
├─────────────────────────────────────────┤
│ 📊 Noyabr Hisoboti                     │
│   • O'qilgan kitoblar: 5 ta            │
│   • XP: +350 (Level 5 → Level 6)       │
│   • Rank: #12 / 650 (Top 2%)           │
│   • Streak: 🔥 12 kun                  │
│                                         │
│ 📚 Hozirgi Kitoblar                    │
│   • "Otgan Kunlar" (bugun qaytarish)  │
│                                         │
│ 📖 So'nggi 5 ta Kitob                  │
│   • Ikki Eshik Orasi - ⭐⭐⭐⭐⭐           │
│   • Mehrobdan Chayon - ⭐⭐⭐⭐            │
│   • Atomic Habits - ⭐⭐⭐⭐⭐             │
│                                         │
│ 💡 Sevimli Kategoriya                  │
│   • Science Fiction (40%)              │
│   • O'zbek Adabiyoti (30%)             │
│                                         │
│ 🎁 Tavsiya                             │
│   Farzandingiz science fiction sevadi. │
│   "Foundation" seriyasini sovg'a       │
│   qilishingiz mumkin 😊                │
└─────────────────────────────────────────┘
```

**Funksiyalar:**
- ✅ Farzand profilini ko'rish
- ✅ Hozirgi va o'tgan kitoblar
- ✅ XP va ranking
- ✅ O'qish statistikasi
- ✅ Sevimli kategoriyalar
- ✅ Oylik hisobot email orqali
- ✅ Kitob rezerv qilish (farzand uchun)
- ✅ Muddati o'tgan kitoblar haqida SMS
- ✅ Tavsiyalar olish

**Oylik Email Hisobot:**
```
Subject: Alisher Karimov - Noyabr Hisoboti

Assalomu alaykum!

Farzandingiz Alisher noyabrda 5 ta kitob o'qidi va 
350 XP to'pladi. U hozir Level 6 darajasida va 
maktabda Top 2% ichida.

Sevimli kategoriyasi: Science Fiction

📚 O'qilgan kitoblar:
1. Ikki Eshik Orasi - Oybek
2. Mehrobdan Chayon - Abdulla Qodiriy
3. Atomic Habits - James Clear
...

💡 Tavsiya: Isaac Asimov "Foundation" seriyasi

[Batafsil ko'rish]
```

---

### 8️⃣ Student/User (O'quvchi)

**Kim:** Maktab, kollej, universitet o'quvchisi

**Mobile App (Asosiy interfeysi):**
```
┌─────────────────────────────────────────┐
│ 👤 Alisher Karimov                     │
│ ⭐ Level 6 - 2,690 XP                  │
│ 🏆 Rank: #12 / 650                     │
│ 🔥 Streak: 12 kun                      │
├─────────────────────────────────────────┤
│ 📚 Hozirgi Kitoblarim (1)              │
│                                         │
│ ✅ "O'tkan Kunlar"                     │
│    📅 Bugun qaytarish kerak!           │
│    [Muddatni Uzaytir] [Qaytardim]     │
│                                         │
│ [+ Yangi Kitob Topish]                 │
├─────────────────────────────────────────┤
│ 🔍 Kitob Qidirish                      │
│ [___________________________] 🔍       │
│                                         │
│ 🔥 Trending Kitoblar                   │
│   • Atomic Habits (28 kishi o'qiyapti) │
│   • Otgan Kunlar (22 kishi)            │
│                                         │
│ 💡 Sizga Tavsiya                       │
│   • Foundation - Isaac Asimov          │
│     (Science Fiction sevganingiz uchun)│
├─────────────────────────────────────────┤
│ 🏅 Yutuqlarim                          │
│   🥇 Birinchi Kitob                    │
│   🥇 10 Kitob Sprint                   │
│   🥇 30 Kunlik Streak                  │
│   🔒 50 Kitob (qulflangan)             │
│                                         │
│ [Hammasini Ko'rish]                    │
└─────────────────────────────────────────┘
```

**Funksiyalar:**
- ✅ O'z profilini ko'rish
- ✅ Hozirgi va o'tgan kitoblar tarixini ko'rish
- ✅ XP, level, achievements
- ✅ Leaderboard (maktab/shahar/milliy)
- ✅ Kitob qidirish va ko'rish
- ✅ Kitob rezerv qilish
- ✅ QR kodini ko'rsatish (raqamli karta)
- ✅ Notification olish
- ✅ Reviews va ratings yozish
- ✅ Reading goals o'rnatish
- ✅ Do'stlar faoliyati

---

## 🔧 YANGI FUNKSIYALAR

### 1. ID Card System

#### Kartaning Ko'rinishi:

```
┌─────────────────────────────────────┐
│  [Logo]   50-MAKTAB KUTUBXONASI    │
│                                     │
│  👤 ALISHER KARIMOV                │
│      8-A sinf                       │
│                                     │
│  [BARCODE: ||||| |||| |||]         │
│  UZ-00045-2024-0012345             │
│                                     │
│           [QR CODE]                 │
│                                     │
│  Berilgan: 29.11.2024              │
└─────────────────────────────────────┘

Orqa tomon:
┌─────────────────────────────────────┐
│  📖 FOYDALANISH QOIDALARI           │
│                                     │
│  • Kartani yo'qotmang               │
│  • Kitobni muddatida qaytaring      │
│  • Kartani boshqaga bermang         │
│                                     │
│  ❓ Savol bo'lsa:                   │
│  📞 +998 71 123 45 67              │
│  📧 support@libraryid.uz           │
│                                     │
│  🌐 libraryid.uz                   │
└─────────────────────────────────────┘
```

#### ID Format:
`UZ-{REGION}-{YEAR}-{UNIQUE}`

- `UZ` - O'zbekiston
- `00045` - Toshkent viloyat kodi (5 raqam)
- `2024` - Yil
- `0012345` - Unikal ID (7 raqam)

Misol: `UZ-00045-2024-0012345`

---

### 2. Book Borrowing Workflow

```
1. O'quvchi kartani ko'rsatadi
   ↓
2. Kutubxonachi skaner qiladi (5 soniya)
   ↓
3. Tizim o'quvchini ochadi:
   ✅ Aktiv?
   ✅ Muddati o'tgan kitob yo'qmi?
   ✅ Max limit oshmaganmi?
   ↓
4. Kutubxonachi kitobni tanlaydi
   ↓
5. "Berish" tugmasi
   ↓
6. Tizim avtomatik:
   • Due date o'rnatadi (+14 kun)
   • XP +50 beradi
   • SMS yuboradi
   • Receipt chop etadi
   ↓
7. Tayyor! (jami 5-10 soniya)
```

---

### 3. Book Reservation (Navbat)

**Vaziyat:** Barcha nusxalar band

```
O'quvchi: "Men 'Atomic Habits' kitobi kerak"
Kutubxonachi: "Kechirasiz, barcha 5 nusxa berilgan"

Tizimda:
┌─────────────────────────────────────┐
│ 📚 Atomic Habits - James Clear     │
│ ❌ Mavjud: 0/5                     │
│                                     │
│ 🔔 Navbatga Qo'shish               │
│                                     │
│ Navbatdagilar:                     │
│ 1. Madina (3 kun oldin)            │
│ 2. Sardor (1 kun oldin)            │
│                                     │
│ Sizning o'rningiz: 3               │
│ [Rezerv Qilish]                    │
└─────────────────────────────────────┘
```

**Birinchi odam kitobni qaytarganda:**
1. Navbatdagi birinchi odamga SMS keladi:
   _"Rezerv qilgan 'Atomic Habits' endi mavjud! 48 soat ichida oling."_
2. 48 soat o'tsa, rezerv expire bo'ladi
3. Keyingi odamga o'tadi

---

### 4. Fines System

**Jarima turlari:**
1. **Muddati o'tgan** - 1000 so'm/kun
2. **Yo'qolgan** - Kitob narxi
3. **Zararlangan** - Holatiga qarab (50%-100%)

**Avtomatik hisoblash:**
```typescript
Har kuni soat 00:00:

1. Muddati o'tgan kitoblarni topadi
2. Har kun uchun +1000 so'm
3. Agar 50,000 so'mdan oshsa → karta block
4. Ota-onaga SMS (agar 7+ kun o'tgan bo'lsa)
```

**Kutubxonachi interfeysi:**
```
┌─────────────────────────────────────┐
│ 👤 Alisher Karimov                 │
│ ⚠️ JARIMA: 15,000 so'm             │
├─────────────────────────────────────┤
│ 📚 "Otgan Kunlar"                  │
│    Muddati: 14-noyabr              │
│    Bugun: 29-noyabr                │
│    Kechikish: 15 kun               │
│    Jarima: 15,000 so'm             │
│                                     │
│ [Kitobni Qaytardi]                 │
│ [Jarima To'landi] [Kechirish]      │
└─────────────────────────────────────┘
```

---

### 5. SMS/Email/Push Notifications

**Integratsiyalar:**
- SMS: Playmobile, Eskiz.uz
- Email: SendGrid, AWS SES  
- Push: Firebase Cloud Messaging

**Notification turlari:**

| Turi | Qachon | Kimga | Kanal |
|------|--------|-------|-------|
| Eslatma | 3 kun qolgan | O'quvchi | SMS + In-app |
| Muddati o'tgan | Har kuni | O'quvchi | SMS + Email |
| Ota-ona ogohlantiruvi | 7+ kun | Ota-ona | SMS |
| Rezerv tayyor | Kitob qaytganda | O'quvchi | SMS + Push |
| Achievement | Yangi badge | O'quvchi | Push + In-app |
| Haftalik hisobot | Har dushanba | Admin | Email |
| Oylik hisobot | Har oy 1-si | Ota-ona | Email |

**Misollar:**

```sms
📚 Eslatma: "Atomic Habits" kitobini 
3 kundan keyin qaytarish kerak.

- UniLib Kutubxona
```

```sms
⚠️ Diqqat! "Otgan Kunlar" kitobini 
qaytarish muddati 5 kun o'tgan. 
Tezda qaytaring, aks holda jarima!

- 50-maktab Kutubxonasi
```

```sms
🎉 Tabriklaymiz! Siz Level 6 ga 
yetdingiz va "Kitob Do'sti" badge 
oldingiz! 

[Ko'rish: app.libraryid.uz]
```

---

### 6. Offline Mode

**Vazifasi:** Internet yo'q bo'lsa ham ishlash

**Arxitektura:**
```
Kutubxonachi kompyuteri:
┌────────────────────────┐
│ Browser                │
│ ┌────────────────────┐ │
│ │ Next.js App        │ │
│ │                    │ │
│ │ IndexedDB (Local)  │ │
│ │ • O'quvchilar      │ │
│ │ • Kitoblar         │ │
│ │ • Sync Queue       │ │
│ └────────────────────┘ │
└────────────────────────┘
         ↕️ (Sync when online)
┌────────────────────────┐
│ Supabase Cloud         │
└────────────────────────┘
```

**Ishlash tartibi:**
1. Offline bo'lsa:
   - Action local database'ga yoziladi
   - Sync queue'ga qo'yiladi
   - UI'da "Offline mode" badge
2. Online bo'lganda:
   - Queue'dagi barcha actionlar yuboriladi
   - Local va cloud sync qilinadi

---

### 7. Automated Reports

#### Kunlik Check (09:00)
- ✅ 3 kun qolgan → SMS eslatma
- ✅ Muddati o'tgan → SMS ogohlantirish
- ✅ 7+ kun → Ota-onaga SMS
- ✅ Achievement check

#### Haftalik Hisobot (Dushanba 10:00)
- ✅ Org Admin'ga email
- ✅ Haftalik statistika
- ✅ Top kitoblar
- ✅ Muddati o'tgan ro'yxat

#### Oylik Hisobot (Har oy 1-si)
- ✅ Ota-onaga email
- ✅ Farzand faolligi
- ✅ O'qilgan kitoblar
- ✅ Tavsiyalar

---

## 💾 TO'LIQ DATABASE SCHEMA

```sql
-- Organizations
CREATE TABLE organizations (
  id, name, slug, type,
  logo_url, contact_email, contact_phone, address,
  settings JSONB,  -- loan_period_days, max_books, fine_per_day, etc.
  subscription_tier, subscription_status,
  created_at, updated_at
);

-- Users/Profiles  
ALTER TABLE profiles ADD COLUMNS:
  organization_id, role (8 types),
  card_id, card_status, qr_code, barcode,
  phone, email, class_name, student_number,
  is_active, last_login_at;

-- Organization Members (multi-org users)
CREATE TABLE organization_members (
  id, organization_id, user_id, role, joined_at
);

-- Parent-Child
CREATE TABLE parent_child_relationships (
  id, parent_id, child_id, relationship, verified
);

-- Books
ALTER TABLE books ADD COLUMNS:
  organization_id, barcode, isbn,
  quantity, available, condition;

-- Borrowed Books
CREATE TABLE borrowed_books (
  id, student_id, book_id, organization_id,
  borrowed_at, due_date, returned_at, extended_count,
  condition_at_borrow, condition_at_return, damage_notes,
  status, borrowed_by_librarian, returned_to_librarian
);

-- Reservations
CREATE TABLE book_reservations (
  id, book_id, student_id, organization_id,
  reserved_at, expires_at, notified_at,
  status, position
);

-- Fines
CREATE TABLE fines_penalties (
  id, student_id, organization_id, borrowed_book_id,
  type, amount, reason,
  issued_at, paid_at, status,
  issued_by, paid_to
);

-- Reading Assignments (Teacher)
CREATE TABLE reading_assignments (
  id, teacher_id, organization_id, class_name, book_id,
  assigned_date, due_date, description
);

CREATE TABLE assignment_completions (
  id, assignment_id, student_id,
  completed, completed_at
);

-- Notifications
CREATE TABLE notifications (
  id, user_id, organization_id,
  type, category, title, message,
  sent_at, read_at, status, error_message,
  metadata JSONB
);

-- Offline Sync
CREATE TABLE offline_sync_queue (
  id, organization_id, action_type, action_data,
  created_at, synced_at, status, error_message
);
```

---

## 🎯 IMPLEMENTATSIYA BOSQICHLARI

### 📅 Phase 1: Foundation (2 hafta)
**MVP asoslari**

- [ ] Multi-tenant database (organizations, RLS)
- [ ] 8 ta rol sistema
- [ ] Authentication va role-based middleware
- [ ] Basic dashboards (Super Admin, Org Admin)

---

### 📅 Phase 2: Core Library (2 hafta)
**Kutubxona asosiy funksiyalari**

- [ ] Book borrowing workflow
- [ ] Book return workflow
- [ ] Student registration
- [ ] ID card generation (QR + Barcode)
- [ ] Scanner integration (USB + Webcam)

---

### 📅 Phase 3: Advanced Library (1.5 hafta)
**Qo'shimcha funksiyalar**

- [ ] Book reservation system
- [ ] Fine/penalty system
- [ ] Book damage tracking
- [ ] Overdue detection
- [ ] Receipt printing

---

### 📅 Phase 4: Notifications (1 hafta)
**Xabarnoma tizimi**

- [ ] SMS integration (Playmobile/Eskiz)
- [ ] Email integration (SendGrid)
- [ ] Push notifications (FCM)
- [ ] In-app notifications
- [ ] Notification preferences

---

### 📅 Phase 5: Extended Roles (1.5 hafta)
**Head Librarian, Teacher, Parent**

- [ ] Head Librarian dashboard + settings
- [ ] Teacher dashboard
- [ ] Reading assignments
- [ ] Parent dashboard
- [ ] Parent-child linking

---

### 📅 Phase 6: Automation (1 hafta)
**Avtomatik jarayonlar**

- [ ] Daily checks (cron jobs)
- [ ] Weekly reports
- [ ] Monthly reports
- [ ] Achievement detection
- [ ] Auto fine calculation

---

### 📅 Phase 7: Offline Mode (1 hafta)
**Offline support**

- [ ] IndexedDB integration
- [ ] Sync queue
- [ ] Auto sync when online
- [ ] Conflict resolution

---

### Phase 8: Polish & Testing (1 hafta)
**Sifat va test**

- [ ] Security audit
- [ ] Performance optimization
- [ ] Multi-tenant isolation testing
- [ ] User acceptance testing
- [ ] Bug fixes

---

**Jami MVP: 8-10 hafta** ✅

---

## ❓ QARORLAR VA SAVOLLAR

### ✅ Tasdiqlangan

1. ✅ Multi-tenant architecture (RLS)
2. ✅ 8 ta rol sistema
3. ✅ ID card (QR + Barcode)
4. ✅ SMS/Email/Push notifications

### ❓ Javob Kerak

1. **MVP scope:**
   - Barcha 8 ta rolni darhol qilamizmi?
   - Yoki avval eng muhimlari (4-5 ta)?

2. **SMS provider:**
   - Playmobile yoki Eskiz.uz?
   - API key tayyor hamilayotganmikan?

3. **Card printing:**
   - Biz chop etamiz yoki maktab o'zi?
   - Blank kartalar sotib olamizmi?

4. **Hardware:**
   - USB barcode scanner tavsiya qilamizmi?
   - Yoki webcam QR yetadimi?

5. **Offline mode:**
   - Desktop app (Electron) kerakmi?
   - Yoki browser offline mode yetadimi?

6. **Mobile app:**
   - React Native yoki Flutter?
   - Hozir kerakmi yoki keyinroq?

7. **Pilot:**
   - Qaysi maktabda sinab ko'ramiz?
   - Qachon boshlaymiz?

---

## 🚀 KEYINGI QADAM

**Javob bering:**
1. MVP scope tasdiqlang
2. Texnik savollarni hal qiling
3. Pilot maktabni tanlang

**Keyin darhol boshlaymiz:**
1. Database migrations
2. Frontend scaffolding
3. Core features

Tayyor bo'lsangiz, aytaying! 💪🇺🇿
