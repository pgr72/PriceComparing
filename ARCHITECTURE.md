# Architecture Overview

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         Users                               │
│        (Public, Authenticated, Admin)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                         │
│  ┌──────────────┬──────────────┬────────────────────────┐  │
│  │ Landing Page │ Price List   │ Dashboard / Admin      │  │
│  │ (Public)     │ (Public)     │ (Protected)            │  │
│  └──────────────┴──────────────┴────────────────────────┘  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │         shadcn/ui Components + Tailwind            │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server Actions                     │
│  ┌──────────┬──────────┬──────────┬──────────┬─────────┐   │
│  │ auth.ts  │ goods.ts │ stores.ts│ prices.ts│ alerts  │   │
│  │          │          │          │          │  .ts    │   │
│  └──────────┴──────────┴──────────┴──────────┴─────────┘   │
└────────────┬───────────────────────────────────┬────────────┘
             │                                   │
             ▼                                   ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│   Supabase Backend       │      │   Resend Email Service   │
│                          │      │                          │
│  ┌────────────────────┐  │      │  ┌────────────────────┐  │
│  │  PostgreSQL DB     │  │      │  │  Email Templates   │  │
│  │  - profiles        │  │      │  │  - Price Alerts    │  │
│  │  - goods           │  │      │  │  - Deal Digests    │  │
│  │  - stores          │  │      │  └────────────────────┘  │
│  │  - prices          │  │      │                          │
│  │  - price_alerts    │  │      │  ┌────────────────────┐  │
│  │  - countries       │  │      │  │  Email Delivery    │  │
│  │  - currencies      │  │      │  │  - SMTP            │  │
│  └────────────────────┘  │      │  │  - Tracking        │  │
│                          │      │  └────────────────────┘  │
│  ┌────────────────────┐  │      └──────────────────────────┘
│  │  Auth Service      │  │
│  │  - Sign Up         │  │
│  │  - Sign In         │  │
│  │  - Password Reset  │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │  Row Level         │  │
│  │  Security (RLS)    │  │
│  └────────────────────┘  │
└──────────────────────────┘
\`\`\`

## Data Flow

### 1. User Authentication Flow

\`\`\`
User → Sign Up Form → Server Action (auth.ts) → Supabase Auth
                                                      ↓
                                                Creates user
                                                      ↓
                                                Trigger function
                                                      ↓
                                        Creates profile + preferences
                                                      ↓
User ← Redirect to Dashboard ← Session Cookie ← Response
\`\`\`

### 2. Price Alert Flow

\`\`\`
User → Creates Alert → Server Action (alerts.ts) → Supabase DB
                                                         ↓
                                                 Stores alert record
                                                         
Admin → Adds New Price → Server Action (prices.ts) → Supabase DB
                                                         ↓
                                                 Stores price record
                                                         ↓
                                                 Query active alerts
                                                         ↓
                                        Compare with new price
                                                         ↓
                                        If price <= target:
                                                         ↓
                                        Call email service
                                                         ↓
                                        Resend → Send Email → User
\`\`\`

### 3. Price Comparison Flow

\`\`\`
User → Visits Price List → Server Component → Supabase Query
                                                      ↓
                                        Fetch prices with joins
                                                      ↓
                                        Group by product
                                                      ↓
                                        Calculate best price
                                                      ↓
User ← Rendered Page ← Server Response ← Formatted data
\`\`\`

## Component Architecture

### Page Structure

\`\`\`
app/
├── page.tsx (Landing - Public)
├── pricelist/page.tsx (Price List - Public)
├── dashboard/page.tsx (Dashboard - Protected)
├── admin/page.tsx (Admin Panel - Protected + Admin Check)
└── auth/
    ├── signin/page.tsx
    ├── signup/page.tsx
    └── reset-password/page.tsx
\`\`\`

### Component Hierarchy

\`\`\`
Dashboard Page
├── Header
│   ├── Logo
│   ├── Navigation Links
│   └── Sign Out Button
├── Profile Section
│   └── Welcome Message
├── Price Alerts Section
│   ├── PriceAlertList (Client Component)
│   │   └── Individual Alert Cards
│   │       ├── Alert Details
│   │       ├── Toggle Button
│   │       └── Delete Button
│   └── PriceAlertForm (Client Component)
│       ├── Product Select
│       ├── Target Price Input
│       ├── Currency Select
│       └── Submit Button
└── Recent Deals Section
    └── Deal Cards
        ├── Product Info
        ├── Store Info
        └── Price Display
\`\`\`

## Database Schema

### Entity Relationship Diagram

\`\`\`
┌─────────────┐
│   users     │ (Supabase Auth)
└──────┬──────┘
       │ 1:1
       │
┌──────▼──────────┐
│   profiles      │
│                 │
│ - id (PK, FK)   │
│ - email         │
│ - full_name     │
│ - is_admin      │
└──────┬──────────┘
       │ 1:n
       │
┌──────▼──────────┐      ┌──────────────┐
│  price_alerts   │  n:1 │    goods     │
│                 ├──────┤              │
│ - user_id (FK)  │      │ - id (PK)    │
│ - good_id (FK)  │      │ - name       │
│ - target_price  │      │ - category   │
│ - is_active     │      │ - unit       │
└─────────────────┘      └──────┬───────┘
                                │ 1:n
                                │
                         ┌──────▼───────┐
                         │   prices     │
                         │              │
                         │ - good_id    │───┐
                         │ - store_id   │   │
                         │ - price      │   │
                         │ - date       │   │
                         └──────────────┘   │
                                            │ n:1
                         ┌──────────────┐   │
                         │   stores     │◄──┘
                         │              │
                         │ - id (PK)    │
                         │ - name       │
                         │ - location   │
                         │ - country_id │
                         └──────┬───────┘
                                │ n:1
                         ┌──────▼───────┐
                         │  countries   │
                         │              │
                         │ - id (PK)    │
                         │ - name       │
                         │ - code       │
                         └──────────────┘
\`\`\`

## Security Model

### Row Level Security Policies

\`\`\`
Table: profiles
├── SELECT: Public (all can view)
└── UPDATE: Owner only (auth.uid() = id)

Table: goods
├── SELECT: Public (all can view)
└── INSERT/UPDATE/DELETE: Admin only

Table: stores
├── SELECT: Public (all can view)
└── INSERT/UPDATE/DELETE: Admin only

Table: prices
├── SELECT: Public (all can view)
└── INSERT/UPDATE/DELETE: Admin only

Table: price_alerts
├── SELECT: Owner only (auth.uid() = user_id)
├── INSERT: Owner only
├── UPDATE: Owner only
└── DELETE: Owner only

Table: user_preferences
└── All operations: Owner only
\`\`\`

### Authentication Middleware

\`\`\`
Request → Middleware → Check Session → Update Cookies
                            ↓
                    Valid Session?
                      ↙         ↘
                    Yes         No
                     ↓           ↓
            Allow Access    Redirect to /auth/signin
                                (for protected routes)
\`\`\`

## API Routes (Server Actions)

### Authentication Actions
- `signUp(formData)` - Create new user
- `signIn(formData)` - Authenticate user
- `signOut()` - End session
- `resetPassword(formData)` - Send reset email
- `updatePassword(formData)` - Update password

### CRUD Actions
- **Goods**: `createGood`, `updateGood`, `deleteGood`
- **Stores**: `createStore`, `updateStore`, `deleteStore`
- **Prices**: `createPrice`, `updatePrice`, `deletePrice`
- **Alerts**: `createPriceAlert`, `updatePriceAlert`, `deletePriceAlert`, `togglePriceAlert`

## Email Service Integration

### Email Triggers

\`\`\`
Price Update Event
       ↓
Check Active Alerts
       ↓
Price <= Target?
       ↓ Yes
Compose Email
       ↓
Call Resend API
       ↓
Send Email
       ↓
Log Result
\`\`\`

### Email Templates

1. **Price Alert Email**
   - Triggered when price drops below target
   - Contains: product name, old price, new price, store, CTA

2. **Deal Digest Email** (Future)
   - Weekly summary of best deals
   - Contains: multiple products, savings, trends

## Deployment Architecture

\`\`\`
┌──────────────────────────────────────────┐
│          Vercel Edge Network             │
│  ┌────────────────────────────────────┐  │
│  │   CDN (Static Assets)              │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │   Next.js Serverless Functions     │  │
│  │   - SSR                            │  │
│  │   - Server Actions                 │  │
│  │   - API Routes                     │  │
│  └────────────────────────────────────┘  │
└──────────┬───────────────────────────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌──────────────┐
│   Supabase       │  │   Resend     │
│   (Database)     │  │   (Email)    │
└──────────────────┘  └──────────────┘
\`\`\`

## State Management

### Server State
- Managed by Supabase queries
- Server Components fetch data directly
- Revalidated on mutations via `revalidatePath()`

### Client State
- Form state in Client Components
- Loading/error states for async operations
- No global state management needed (kept simple)

## Performance Optimizations

1. **Data Fetching**
   - Server Components for initial data
   - Parallel data fetching with Promise.all
   - Selective revalidation

2. **Rendering**
   - Static generation for public pages
   - Dynamic rendering for personalized content
   - Streaming for large datasets

3. **Assets**
   - Next.js Image optimization
   - Font optimization
   - CSS modules with Tailwind

## Error Handling

\`\`\`
User Action
    ↓
Server Action
    ↓
Try/Catch Block
    ↓
Error?
 ↙   ↘
Yes   No
 ↓     ↓
Return  Return
Error   Success
 ↓     ↓
Component Displays
Message to User
\`\`\`

---

This architecture provides:
- ✅ Scalability (serverless)
- ✅ Security (RLS, Server Actions)
- ✅ Performance (edge deployment, SSR)
- ✅ Maintainability (clean separation of concerns)
- ✅ Cost efficiency (generous free tiers)
