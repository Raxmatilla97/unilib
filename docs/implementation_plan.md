# Multi-Tenant Architecture Implementation Plan

## Goal
Transform UniLib from a single-tenant application to a multi-tenant SaaS platform where:
- **Super Admin** manages the entire platform and creates organizations
- **Organization Admin** (assigned by Super Admin) manages their organization as a super admin within their scope
- **Librarians, Moderators, and other roles** are managed by Organization Admins
- Each organization's data is completely isolated and secure

## User Review Required

> [!IMPORTANT]
> **Role Hierarchy Clarification**
> 
> Please confirm the role hierarchy:
> 1. **Platform Super Admin** → Full platform access, creates organizations
> 2. **Organization Admin** → Full access within their organization
> 3. **Librarian** → Manages books, borrowing, students within organization
> 4. **Moderator** → Manages content, discussions, groups within organization
> 5. **Student/User** → End user of the library
>
> Are there any other roles we need to consider?

> [!WARNING]
> **Database Architecture Choice**
> 
> We need to decide on the isolation strategy:
> - **Option A: Row-Level Security (RLS)** - All organizations share tables, RLS policies enforce isolation
> - **Option B: Schema-based** - Each organization gets its own schema
> - **Option C: Database-based** - Each organization gets its own database
>
> For this project, I recommend **Option A (RLS)** because:
> - Easier to implement with Supabase
> - Better for cross-organization features (like XP ranking, inter-library sharing)
> - Cost-effective
> - Easier maintenance
>
> Do you agree or prefer a different approach?

---

## Proposed Changes

### Database Schema

#### [NEW] Organizations Table
**File:** [20250129_create_organizations.sql](file:///d:/unilib2/supabase/migrations/20250129_create_organizations.sql)

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier
  type TEXT NOT NULL, -- 'school', 'college', 'university', 'library'
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}', -- organization-specific settings
  subscription_tier TEXT DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
  subscription_status TEXT DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### [MODIFY] Users/Profiles Table
**File:** [20250129_update_users_for_organizations.sql](file:///d:/unilib2/supabase/migrations/20250129_update_users_for_organizations.sql)

Add organization relationship and enhanced roles:
```sql
ALTER TABLE profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user'; 
-- roles: 'super_admin', 'org_admin', 'librarian', 'moderator', 'user'
ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
```

#### [NEW] Organization Members Table
**File:** [20250129_create_organization_members.sql](file:///d:/unilib2/supabase/migrations/20250129_create_organization_members.sql)

For users who belong to multiple organizations:
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'org_admin', 'librarian', 'moderator', 'user'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);
```

#### [MODIFY] Existing Tables (Books, Reading Progress, etc.)
All existing tables need `organization_id`:
- `books` → Add organization_id (which org owns this book)
- `reading_progress` → Inherit from user's organization
- `achievements` → Can be platform-wide or organization-specific
- `study_groups` → Add organization_id
- `notifications` → Organization-scoped

---

### Frontend Components

#### [NEW] Super Admin Dashboard
**File:** [app/super-admin/page.tsx](file:///d:/unilib2/app/super-admin/page.tsx)

Features:
- List all organizations
- Create new organization
- Assign organization admin
- Platform-wide statistics
- System health monitoring

#### [NEW] Organization Admin Dashboard
**File:** [app/org-admin/page.tsx](file:///d:/unilib2/app/org-admin/page.tsx)

Features:
- Organization overview
- Manage team members (add librarians, moderators)
- Organization settings
- Organization analytics
- Library management

#### [MODIFY] Existing Admin Panel
**File:** [app/admin/page.tsx](file:///d:/unilib2/app/admin/page.tsx)

Transform current admin to be organization-scoped:
- Show only organization's data
- Hide platform-wide features
- Add role-based UI elements

---

### Authentication & Authorization

#### [NEW] Role-based Middleware
**File:** [middleware.ts](file:///d:/unilib2/middleware.ts)

Protect routes based on roles:
```typescript
- /super-admin/* → super_admin only
- /org-admin/* → org_admin only
- /admin/* → org_admin, librarian
- /moderator/* → org_admin, moderator
```

#### [NEW] Permission Helper Functions
**File:** [lib/permissions.ts](file:///d:/unilib2/lib/permissions.ts)

Helper functions to check permissions:
```typescript
- canManageOrganization()
- canManageBooks()
- canManageUsers()
- canViewAnalytics()
```

---

### Database Functions & RLS Policies

#### [NEW] Row-Level Security Policies
**File:** [20250129_enable_rls_policies.sql](file:///d:/unilib2/supabase/migrations/20250129_enable_rls_policies.sql)

Ensure data isolation:
```sql
-- Users can only see their organization's books
CREATE POLICY "Users see own org books"
  ON books FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ));

-- Similar policies for all tables
```

---

## Verification Plan

### Automated Tests
1. Create test organizations with `npm run test:db`
2. Verify RLS policies prevent cross-org data access
3. Test role-based permissions

### Manual Verification
1. Create Super Admin account
2. Create 2 test organizations
3. Assign organization admins
4. Verify data isolation between organizations
5. Test librarian and moderator roles
6. Verify existing users can still access their data

---

## Migration Strategy

> [!CAUTION]
> **Existing User Data**
> 
> Current users in the database need to be migrated. Options:
> 1. Create a default "UniLib Platform" organization and assign all existing users to it
> 2. Manual migration by Super Admin
> 3. Users self-select organization during next login
>
> Which approach do you prefer?

---

## Glossary

**Roles:**
- **Super Admin** - Platform owner, full access to everything
- **Organization Admin** - Owns an organization (school/college/university), manages team
- **Librarian** - Manages books, students, borrowing within organization
- **Moderator** - Manages content, discussions, study groups
- **User/Student** - End user who borrows books

**Organization Types:**
- School (Maktab)
- College/Technikum (Kollej/Texnikum)
- University (OTM)
- Public Library (Ommaviy kutubxona)
- Private Library (Xususiy kutubxona)
