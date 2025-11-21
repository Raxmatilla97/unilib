# Vercel Deployment - Environment Variables

Vercel dashboard'da quyidagi environment variables'larni qo'shing:

## 🔐 Required Environment Variables

### Production & Preview & Development

```bash
NEXT_PUBLIC_SUPABASE_URL=https://gghpcaamqreqvvjixesm.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaHBjYWFtcXJlcXZ2aml4ZXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTU4MDUsImV4cCI6MjA3OTI5MTgwNX0.1gmc2nFH_uv35XU-_MrmAL-EpIO-RfC-TlJzh6psekc

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnaHBjYWFtcXJlcXZ2aml4ZXNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzcxNTgwNSwiZXhwIjoyMDc5MjkxODA1fQ.6SQ48SfswbfPlkMuHsxWGXSIAtoX9bZ2yPj3hso8m2U
```

## 📝 Vercel'da qo'shish yo'li:

1. **Vercel Dashboard** → Loyihangizni tanlang
2. **Settings** → **Environment Variables**
3. Har bir variable uchun:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://gghpcaamqreqvvjixesm.supabase.co`
   - **Environment**: Production, Preview, Development (hammasini belgilang)
   - **Add** tugmasini bosing

4. Xuddi shu jarayonni `NEXT_PUBLIC_SUPABASE_ANON_KEY` va `SUPABASE_SERVICE_ROLE_KEY` uchun takrorlang

## 🚀 Deploy qilish:

### Variant 1: Vercel Dashboard (Tavsiya etiladi)
1. [vercel.com](https://vercel.com) → **Add New Project**
2. GitHub repository import: `Kirito514/unilib`
3. Environment variables qo'shing (yuqoridagi)
4. **Deploy** tugmasini bosing

### Variant 2: Vercel CLI
```bash
# CLI o'rnatish
npm i -g vercel

# Login
vercel login

# Environment variables qo'shish
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy
vercel --prod
```

## ⚙️ Build Settings (Vercel'da avtomatik aniqlaydi):
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x yoki 20.x

## ✅ Deploy'dan keyin:
- Vercel sizga URL beradi (masalan: `unilib.vercel.app`)
- Har bir GitHub push avtomatik deploy qiladi
- Preview deployments har bir PR uchun yaratiladi

## 🔒 Xavfsizlik:
- `.env.local` faylini **HECH QACHON** GitHub'ga push qilmang
- Service Role Key faqat server-side ishlatiladi
- Anon Key public bo'lishi mumkin (RLS bilan himoyalangan)
