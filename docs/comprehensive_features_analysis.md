# KENG FUNKSIYALAR TAHLILI

## 📊 Umumiy Ko'rinish

Sizning yangi talablaringizga ko'ra, UniLib platformasi **Enterprise darajadagi Library Management System** ga aylanmoqda. Bu faqat online kutubxona emas, balki milliy darajadagi infrastruktura.

---

## 🎯 Asosiy O'zgarishlar

### Avvalgi Reja vs Yangi Reja

| Aspekt | Avval | Endi |
|--------|-------|------|
| **Rollar** | 5 ta (Super Admin, Org Admin, Librarian, Moderator, User) | **8 ta** (+ System Admin, Head Librarian, Teacher, Parent) |
| **Maqsad** | Online kutubxona platformasi | **Milliy raqamli ID tizimi** |
| **Hardware** | Yo'q | **Scanner, Printer, ID karta** |
| **Offline** | Yo'q | **Offline mode** kerak |
| **Notification** | Oddiy in-app | **SMS + Email + Push** |
| **Biznes Model** | SaaS subscription | **B2G (Business-to-Government)** |
| **Scope** | Bitta platforma | **Cross-library**, shahar/milliy darajada |

---

## 👥 YANGI ROLLAR TAHLILI

### 1️⃣ **System Admin** (Yangi!)

**Kim:** Bizning texnik support jamoamiz

**Vazifasi:**
- Bug fix va texnik support
- Barcha maktablar ma'lumotlarini ko'rish (faqat debug uchun)
- Database backup/restore
- Deployment

**Database:**
```sql
role = 'system_admin'
organization_id = NULL  -- Platformaga tegishli
permissions = ['view_all_orgs', 'technical_support', 'system_logs']
```

**Frontend:**
- `/system-admin/*` routes
- Support ticket system
- Logs viewer
- Database tools

---

### 2️⃣ **Head Librarian** (Yangi!)

**Kim:** Kutubxona rahbari

**Farqi Librarian'dan:**
- Boshqa kutubxonachilarni boshqaradi
- Sozlamalarni o'zgartiradi (kitob muddati, max kitoblar, jarimalar)
- Moliyaviy hisobotlar
- Excel import/export

**Database:**
```sql
role = 'head_librarian'
organization_id = '...'
permissions = ['manage_librarians', 'edit_settings', 'financial_reports']
```

**Frontend:**
- Librarian dashboard + qo'shimcha Settings tab
- Team management page
- Advanced analytics

---

### 3️⃣ **Teacher** (Yangi!)

**Kim:** O'qituvchilar

**Funksiyalari:**
- O'z sinfi statistikasini ko'rish
- **Reading assignments berish** (yangi funksiya!)
- Passive o'quvchilarni aniqlash
- Kitob tavsiya qilish

**Database:**
```sql
-- Yangi jadval kerak
CREATE TABLE reading_assignments (
  id UUID PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id),
  class_name TEXT,  -- "8-A"
  book_id UUID REFERENCES books(id),
  assigned_date DATE,
  due_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ
);

-- Compliance tracking
CREATE TABLE assignment_completions (
  id UUID PRIMARY KEY,
  assignment_id UUID REFERENCES reading_assignments(id),
  student_id UUID REFERENCES profiles(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ
);
```

**Frontend:**
- `/teacher/dashboard` - Sinf statistikasi
- `/teacher/assignments` - Reading assignment berish
- `/teacher/students` - O'quvchilar ro'yxati

---

### 4️⃣ **Parent** (Yangi!)

**Kim:** Ota-onalar

**Funksiyalari:**
- Farzand faoliyatini monitoring
- Oylik hisobot olish
- Kitob rezerv qilish (farzand uchun)
- Tavsiyalar olish

**Database:**
```sql
CREATE TABLE parent_child_relationships (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id),
  child_id UUID REFERENCES profiles(id),
  relationship TEXT, -- 'father', 'mother', 'guardian'
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
);
```

**Frontend:**
- `/parent/dashboard` - Farzand statistikasi
- `/parent/reports` - Oylik hisobotlar
- `/parent/notifications` - Xabarnomalar

---

## 📚 YANGI FUNKSIYALAR

### 1. **ID Card System** (Eng Muhim!)

#### a) Card Generation

**Format:** `UZ-{REGION}-{YEAR}-{UNIQUE_ID}`
- Misol: `UZ-00045-2024-0012345`
- 00045 - Toshkent viloyat kodi
- 2024 - Yil
- 0012345 - Unikal ID

**QR Code Content:**
```json
{
  "id": "UZ-00045-2024-0012345",
  "student_id": "uuid-here",
  "org_id": "org-uuid",
  "name": "Alisher Karimov",
  "issued": "2024-11-29"
}
```

**Database:**
```sql
ALTER TABLE profiles ADD COLUMN card_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN card_status TEXT DEFAULT 'active'; -- active/blocked/lost
ALTER TABLE profiles ADD COLUMN card_issued_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN qr_code TEXT; -- Base64 encoded QR
ALTER TABLE profiles ADD COLUMN barcode TEXT;
```

**Printing Options:**
1. **Bizdan buyurtma** - Biz chop etib yuboramiz (3-5 kun)
2. **O'zi chop etish** - PDF yuklab oladi va local printer'da chop etadi

**PDF Template:**
- Front: QR code, Barcode, Ism, Maktab, Logo
- Back: Foydalanish qoidalari, support telefon

---

#### b) Scanner Integration

**3 ta usul:**
1. **Hardware Barcode Scanner** - USB orqali, keyboard inputga o'xshash
2. **Webcam QR Scanner** - JavaScript WebRTC API
3. **Manual input** - Keyboard'dan ID raqam kiritish

**Frontend Component:**
```typescript
// components/library/CardScanner.tsx
function CardScanner({ onScan }) {
  const [scanMode, setScanMode] = useState<'barcode' | 'qr' | 'manual'>('barcode');
  
  // USB scanner input listener
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        onScan(barcodeBuffer);
      }
    };
    // ...
  }, []);
  
  return (...);
}
```

---

### 2. **Book Borrowing System**

#### Database Schema:

```sql
CREATE TABLE borrowed_books (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  book_id UUID REFERENCES books(id),
  organization_id UUID REFERENCES organizations(id),
  borrowed_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  extended_count INTEGER DEFAULT 0,  -- necha marta uzaytirilgan
  
  -- Book condition
  condition_at_borrow TEXT DEFAULT 'good', -- good/fair/poor
  condition_at_return TEXT,
  damage_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'borrowed', -- borrowed/returned/overdue/lost
  
  -- Librarian info
  borrowed_by_librarian UUID REFERENCES profiles(id),
  returned_to_librarian UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_borrowed_student ON borrowed_books(student_id);
CREATE INDEX idx_borrowed_status ON borrowed_books(status);
CREATE INDEX idx_borrowed_due_date ON borrowed_books(due_date);
```

#### Borrow Workflow:

```typescript
// app/library/actions.ts
async function borrowBook({
  studentId,
  bookId,
  librarianId,
  organizationId
}) {
  // 1. Check: Student active?
  const student = await getStudent(studentId);
  if (student.card_status !== 'active') {
    throw new Error('Karta bloklangan');
  }
  
  // 2. Check: Student has overdue books?
  const overdueCount = await getOverdueCount(studentId);
  if (overdueCount > 0) {
    throw new Error(`${overdueCount} ta muddati o'tgan kitob qaytaring`);
  }
  
  // 3. Check: Max books limit
  const currentBooks = await getCurrentBooksCount(studentId);
  const maxBooks = await getOrgSetting(organizationId, 'max_books') || 2;
  if (currentBooks >= maxBooks) {
    throw new Error(`Maksimal ${maxBooks} ta kitob olish mumkin`);
  }
  
  // 4. Check: Book available?
  const availableCopies = await getAvailableCopies(bookId);
  if (availableCopies < 1) {
    throw new Error('Kitob mavjud emas');
  }
  
  // 5. Create borrow record
  const loanPeriod = await getOrgSetting(organizationId, 'loan_period_days') || 14;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanPeriod);
  
  await db.borrowed_books.insert({
    student_id: studentId,
    book_id: bookId,
    organization_id: organizationId,
    borrowed_by_librarian: librarianId,
    due_date: dueDate,
    status: 'borrowed'
  });
  
  // 6. Award XP
  await awardXP(studentId, 50, 'book_borrowed');
  
  // 7. Send notification
  await sendNotification(studentId, {
    title: 'Kitob olindi',
    message: `Kitobni ${dueDate} gacha qaytaring`,
    type: 'sms'
  });
  
  // 8. Return receipt data
  return { success: true, dueDate };
}
```

---

### 3. **Book Reservation System** (Waiting Queue)

**Muammo:** Barcha kitoblar band bo'lsa, o'quvchi navbatga qo'yiladi.

#### Database:

```sql
CREATE TABLE book_reservations (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  student_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,  -- 48 soat reservation expire bo'ladi
  status TEXT DEFAULT 'waiting', -- waiting/ready/expired/cancelled
  notified_at TIMESTAMPTZ,
  position INTEGER,  -- Navbatdagi o'rni
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Logic:

```typescript
// Birinchi odam kitobni qaytarganda
async function onBookReturned(bookId: string) {
  // 1. Navbatdagi birinchi odamni topish
  const nextReservation = await db.book_reservations.findFirst({
    where: { book_id: bookId, status: 'waiting' },
    orderBy: { reserved_at: 'asc' }
  });
  
  if (!nextReservation) return;
  
  // 2. Status o'zgartirish
  await db.book_reservations.update({
    where: { id: nextReservation.id },
    data: {
      status: 'ready',
      notified_at: new Date(),
      expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    }
  });
  
  // 3. Notification yuborish
  await sendNotification(nextReservation.student_id, {
    title: 'Kitob tayyor!',
    message: 'Rezerv qilgan kitobingiz endi mavjud. 48 soat ichida oling.',
    type: 'sms'
  });
  
  // 4. Timer: 48 soat o'tsa expire
  setTimeout(async () => {
    const reservation = await db.book_reservations.findById(nextReservation.id);
    if (reservation.status === 'ready') {
      await expireReservation(reservation.id);
    }
  }, 48 * 60 * 60 * 1000);
}
```

---

### 4. **Fines & Penalties System**

#### Database:

```sql
CREATE TABLE fines_penalties (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  borrowed_book_id UUID REFERENCES borrowed_books(id),
  
  type TEXT NOT NULL, -- overdue/lost/damaged
  amount DECIMAL(10,2),  -- Jarima miqdori (so'mda)
  
  reason TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'unpaid', -- unpaid/paid/waived
  
  issued_by UUID REFERENCES profiles(id), -- qaysi kutubxonachi
  paid_to UUID REFERENCES profiles(id)
);
```

#### Auto-calculation:

```typescript
// Har kuni soat 00:00 da ishga tushadi
async function calculateOverdueFines() {
  const overdueBooks = await db.borrowed_books.findMany({
    where: {
      status: 'borrowed',
      due_date: { lt: new Date() }
    }
  });
  
  for (const book of overdueBooks) {
    const daysOverdue = Math.floor(
      (Date.now() - book.due_date.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const finePerDay = await getOrgSetting(book.organization_id, 'fine_per_day') || 1000;
    const totalFine = daysOverdue * finePerDay;
    
    // Agar jarima allaqachon mavjud bo'lsa, update
    await db.fines_penalties.upsert({
      where: {
        borrowed_book_id: book.id
      },
      update: {
        amount: totalFine
      },
      create: {
        student_id: book.student_id,
        organization_id: book.organization_id,
        borrowed_book_id: book.id,
        type: 'overdue',
        amount: totalFine,
        reason: `${daysOverdue} kun kechikkan`
      }
    });
    
    // Kartani block qilish (agar jarima 50k dan oshsa)
    if (totalFine > 50000) {
      await blockCard(book.student_id);
    }
  }
}
```

---

### 5. **Notification System** (SMS + Email + Push)

#### Database:

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  
  type TEXT NOT NULL, -- sms/email/push/in_app
  category TEXT, -- reminder/overdue/achievement/announcement
  
  title TEXT,
  message TEXT,
  
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'pending', -- pending/sent/failed
  error_message TEXT,
  
  metadata JSONB,  -- Qo'shimcha ma'lumotlar
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Integration:

**SMS Provider:** Playmobile, Eskiz.uz, yoki Paynet
**Email Provider:** SendGrid, AWS SES
**Push:** Firebase Cloud Messaging (mobile app uchun)

```typescript
// lib/notifications.ts
async function sendNotification({
  userId,
  type,
  title,
  message,
  category
}) {
  // 1. User preferences check
  const user = await getUser(userId);
  const prefs = await getNotificationPreferences(userId);
  
  if (!prefs[category]?.enabled) {
    return; // User bu kategoriyani o'chirgan
  }
  
  // 2. Send based on type
  if (type === 'sms' && user.phone) {
    await sendSMS(user.phone, message);
  }
  
  if (type === 'email' && user.email) {
    await sendEmail(user.email, title, message);
  }
  
  if (type === 'push' && user.fcm_token) {
    await sendPushNotification(user.fcm_token, { title, message });
  }
  
  // 3. Always save in-app notification
  await db.notifications.create({
    user_id: userId,
    type,
    category,
    title,
    message,
    sent_at: new Date(),
    status: 'sent'
  });
}
```

---

### 6. **Offline Mode**

**Vazifasi:** Internet yo'q bo'lsa ham kutubxonachi ishlashi mumkin.

#### Architecture:

1. **Local Database:** IndexedDB (browser) yoki SQLite (desktop app)
2. **Sync Queue:** Barcha action'lar queue'ga qo'yiladi
3. **Auto-sync:** Internet qaytganda sync qilinadi

#### Database:

```sql
CREATE TABLE offline_sync_queue (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  action_type TEXT, -- borrow/return/register_student/etc
  action_data JSONB,
  created_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' -- pending/synced/failed
);
```

#### Frontend Logic:

```typescript
// lib/offline.ts
export function useOfflineQueue() {
  async function addToQueue(action: Action) {
    await localDB.queue.add(action);
    
    // Try sync immediately
    if (navigator.onLine) {
      await syncQueue();
    }
  }
  
  async function syncQueue() {
    const pending = await localDB.queue.getAll({ status: 'pending' });
    
    for (const action of pending) {
      try {
        await executeAction(action);
        await localDB.queue.update(action.id, { status: 'synced', synced_at: new Date() });
      } catch (error) {
        console.error('Sync failed:', error);
        // Retry later
      }
    }
  }
  
  // Auto-sync when online
  useEffect(() => {
    window.addEventListener('online', syncQueue);
    return () => window.removeEventListener('online', syncQueue);
  }, []);
  
  return { addToQueue, syncQueue };
}
```

---

### 7. **Automated Reports**

#### Kunlik Check (Har kuni 09:00)

```typescript
// jobs/daily-check.ts
export async function dailyCheck() {
  // 1. Muddati yaqinlashayotgan kitoblar (3 kun qolgan)
  const upcomingDue = await db.borrowed_books.findMany({
    where: {
      status: 'borrowed',
      due_date: {
        gte: new Date(),
        lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    }
  });
  
  for (const book of upcomingDue) {
    await sendNotification(book.student_id, {
      type: 'sms',
      category: 'reminder',
      title: 'Eslatma',
      message: `"${book.book.title}" kitobini 3 kundan keyin qaytarish kerak`
    });
  }
  
  // 2. Muddati o'tgan kitoblar
  const overdue = await getOverdueBooks();
  for (const book of overdue) {
    await sendNotification(book.student_id, {
      type: 'sms',
      category: 'overdue',
      title: 'Diqqat!',
      message: `Kitob qaytarish muddati o'tdi. Tezda qaytaring.`
    });
    
    // 7 kundan ortiq o'tgan bo'lsa - ota-onaga
    const daysOverdue = getDaysOverdue(book.due_date);
    if (daysOverdue >= 7) {
      const parent = await getParent(book.student_id);
      if (parent) {
        await sendNotification(parent.id, {
          type: 'sms',
          category: 'overdue',
          message: `Farzandingiz kutubxona kitobini ${daysOverdue} kun davomida qaytarmagan`
        });
      }
    }
  }
  
  // 3. Achievement check
  await checkAchievements();
}
```

#### Haftalik Hisobot (Har dushanba 10:00)

```typescript
export async function weeklyReport(organizationId: string) {
  const stats = await getWeeklyStats(organizationId);
  
  const report = {
    borrowed_count: stats.borrowed,
    returned_count: stats.returned,
    active_students: stats.active_students,
    top_books: stats.top_books,
    overdue_count: stats.overdue,
    fines_total: stats.fines
  };
  
  // Email to admin
  const admin = await getOrgAdmin(organizationId);
  await sendEmail(admin.email, 'Haftalik Hisobot', renderWeeklyReport(report));
}
```

---

## 💾 DATABASE SCHEMA - FULL

```sql
-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('school', 'college', 'university', 'library')),
  
  -- Branding
  logo_url TEXT,
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  
  -- Settings
  settings JSONB DEFAULT '{
    "loan_period_days": 14,
    "max_books_per_student": 2,
    "fine_per_day": 1000,
    "xp_per_borrow": 50,
    "xp_per_return": 10
  }'::jsonb,
  
  -- Subscription
  subscription_tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'premium', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  subscription_started_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS / PROFILES
-- ============================================
ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' 
  CHECK (role IN ('super_admin', 'system_admin', 'org_admin', 'head_librarian', 'librarian', 'teacher', 'parent', 'user'));

-- ID Card fields
ALTER TABLE profiles ADD COLUMN card_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN card_status TEXT DEFAULT 'active' CHECK (card_status IN ('active', 'blocked', 'lost'));
ALTER TABLE profiles ADD COLUMN card_issued_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN qr_code TEXT;
ALTER TABLE profiles ADD COLUMN barcode TEXT;

-- Contact
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN email TEXT;

-- Class info (for students)
ALTER TABLE profiles ADD COLUMN class_name TEXT;  -- "8-A"
ALTER TABLE profiles ADD COLUMN student_number TEXT;

-- Timestamps
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;

-- ============================================
-- ORGANIZATION MEMBERS (for multi-org users)
-- ============================================
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- PARENT-CHILD RELATIONSHIPS
-- ============================================
CREATE TABLE parent_child_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  relationship TEXT CHECK (relationship IN ('father', 'mother', 'guardian')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- ============================================
-- BOOKS
-- ============================================
ALTER TABLE books ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE books ADD COLUMN barcode TEXT UNIQUE;
ALTER TABLE books ADD COLUMN isbn TEXT;
ALTER TABLE books ADD COLUMN quantity INTEGER DEFAULT 1;
ALTER TABLE books ADD COLUMN available INTEGER DEFAULT 1;  -- Available copies
ALTER TABLE books ADD COLUMN condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'fair', 'poor', 'lost'));

-- ============================================
-- BORROWED BOOKS
-- ============================================
CREATE TABLE borrowed_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  -- Dates
  borrowed_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  returned_at TIMESTAMPTZ,
  extended_count INTEGER DEFAULT 0,
  
  -- Condition
  condition_at_borrow TEXT DEFAULT 'good',
  condition_at_return TEXT,
  damage_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'overdue', 'lost')),
  
  -- Librarian
  borrowed_by_librarian UUID REFERENCES profiles(id),
  returned_to_librarian UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_borrowed_student ON borrowed_books(student_id);
CREATE INDEX idx_borrowed_book ON borrowed_books(book_id);
CREATE INDEX idx_borrowed_status ON borrowed_books(status);
CREATE INDEX idx_borrowed_due_date ON borrowed_books(due_date);

-- ============================================
-- BOOK RESERVATIONS
-- ============================================
CREATE TABLE book_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'expired', 'cancelled', 'fulfilled')),
  position INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reservation_status ON book_reservations(book_id, status);

-- ============================================
-- FINES & PENALTIES
-- ============================================
CREATE TABLE fines_penalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  borrowed_book_id UUID REFERENCES borrowed_books(id),
  
  type TEXT NOT NULL CHECK (type IN ('overdue', 'lost', 'damaged')),
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'waived')),
  
  issued_by UUID REFERENCES profiles(id),
  paid_to UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- READING ASSIGNMENTS (Teacher feature)
-- ============================================
CREATE TABLE reading_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  class_name TEXT,
  book_id UUID REFERENCES books(id),
  
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assignment_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES reading_assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  UNIQUE(assignment_id, student_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  type TEXT NOT NULL CHECK (type IN ('sms', 'email', 'push', 'in_app')),
  category TEXT CHECK (category IN ('reminder', 'overdue', 'achievement', 'announcement', 'reservation')),
  
  title TEXT,
  message TEXT NOT NULL,
  
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);

-- ============================================
-- OFFLINE SYNC QUEUE
-- ============================================
CREATE TABLE offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  error_message TEXT
);

-- ============================================
-- Update existing tables
-- ============================================
-- reading_progress, achievements, study_groups, etc.
-- should all get organization_id column
```

---

## 🎯 IMPLEMENTATSIYA PRIORITETI

### MVP (Phase 1) - 2-3 hafta
**Vazifa:** Bitta maktabda ishlashi mumkin bo'lgan tizim

1. ✅ Multi-tenant database (organizations, users, RLS)
2. ✅ Basic roles (Super Admin, Org Admin, Librarian, Student)
3. ✅ Book borrowing (scan card → borrow → return)
4. ✅ ID card generation (QR/Barcode)
5. ✅ Simple notifications (in-app)
6. ✅ Basic dashboard (org admin)

### Phase 2 - 2 hafta
**Extended Features**

1. ✅ Head Librarian role + settings
2. ✅ SMS notifications
3. ✅ Overdue detection + fines
4. ✅ Book reservation
5. ✅ Offline mode (basic)

### Phase 3 - 2 hafta
**Teacher & Parent Roles**

1. ✅ Teacher dashboard + reading assignments
2. ✅ Parent dashboard + monthly reports
3. ✅ Email notifications
4. ✅ Advanced analytics

### Phase 4 - 2 hafta
**Automation & Polish**

1. ✅ Automated daily checks
2. ✅ Weekly/monthly reports
3. ✅ Excel import/export
4. ✅ Physical card printing
5. ✅ Full offline mode

### Phase 5 - Future
**Scale & Advanced**

1. Cross-library access
2. Mobile app
3. AI recommendations
4. Payment integration
5. National platform

---

## ❓ MUHIM SAVOLLAR

1. **MVP qayerdan boshlaymiz?**
   - Bitta maktabda sinab ko'ramizmi?
   - Yoki darhol multi-tenant qilamizmi?

2. **SMS provider?**
   - Playmobile? Eskiz.uz? Paynet?
   - API key bormi?

3. **Card printing?**
   - Biz chop etamizmi yoki maktab o'zi?
   - Printlar tayyor hamilayotganmikan?

4. **Hardware scanner?**
   - USB barcode scanner recommend qilamizmi?
   - Yoki faqat webcam QR?

5. **Offline mode qanchalik muhim?**
   - Desktop app qilamizmi (Electron)?
   - Yoki browser offline mode yetadimi?

6. **Mobile app kerakmi?**
   - Hozir kerakmi yoki keyinroq?
   - React Native yoki Flutter?

---

## 📝 KEYINGI QADAM

Tasdiqlanguncha:
1. ❓ Prioritet tasdiqlash
2. ❓ Texnik savollarni hal qilish
3. ❓ MVP scope'ni aniq belgilash

Tasdiqlangandan keyin:
1. ✅ Database migration yozish
2. ✅ Frontend components
3. ✅ Implementation boshlash

**Qaysi qismdan boshlaymiz?** 🚀
