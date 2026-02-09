# Price Compare - Grocery Price Comparison App

A production-ready Next.js application for comparing grocery prices across multiple stores with email notifications for price drops.

## Features

✅ **Public Features**
- Landing page with feature showcase
- Public price comparison list
- Responsive design

✅ **Authentication**
- Sign up with email/password
- Sign in
- Password reset via email
- Secure session management

✅ **User Dashboard**
- Create and manage price alerts
- View recent deals
- Track products across stores
- Email notifications when prices drop

✅ **Admin Panel** (admin users only)
- Manage goods (products)
- Manage stores
- Update prices
- Automatic price alert triggering

✅ **Email Notifications**
- Price drop alerts
- Deal notifications
- Professional HTML email templates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Email**: Resend
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Resend account (free tier available)
- Vercel account (optional, for deployment)

## Setup Instructions

### 1. Clone and Install Dependencies

\`\`\`bash
git clone <your-repo-url>
cd price-compare-app
npm install
\`\`\`

### 2. Supabase Setup

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the database to be provisioned (2-3 minutes)
4. Go to Project Settings > API to find your credentials

#### Run Database Migrations

You have two options:

**Option A: Using Supabase Dashboard (Recommended for beginners)**

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
5. Paste into the SQL editor and click "Run"
6. Repeat for `supabase/migrations/20240101000001_seed_data.sql`

**Option B: Using Supabase CLI**

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
\`\`\`

#### Create Admin User

After running migrations, you need to manually set a user as admin:

1. Sign up for an account through your app (after completing the rest of setup)
2. Go to Supabase Dashboard > Authentication > Users
3. Find your user and copy the user ID
4. Go to SQL Editor and run:

\`\`\`sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID_HERE';
\`\`\`

### 3. Resend Setup

1. Go to [resend.com](https://resend.com) and create a free account
2. Verify your domain (or use their testing domain for development)
3. Create an API key from the dashboard
4. Copy the API key for your `.env.local` file

### 4. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev  # Use resend.dev for testing

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

**Where to find Supabase credentials:**
- Project URL and Anon Key: Project Settings > API
- Service Role Key: Project Settings > API (keep this secret!)

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

- **profiles**: User profiles (extends auth.users)
- **countries**: Country data
- **currencies**: Currency information
- **stores**: Store locations
- **goods**: Products/items
- **prices**: Price entries for goods at stores
- **price_alerts**: User-created price alerts
- **user_preferences**: User notification settings

### Key Relationships

- Prices belong to a good, store, and currency
- Price alerts belong to a user, good, and currency
- Stores belong to a country
- Profiles extend Supabase auth.users

## Deployment to Vercel

### 1. Push to GitHub

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
\`\`\`

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from your `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Click "Deploy"

### 3. Update Supabase Settings

After deployment, update your Supabase project:

1. Go to Authentication > URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add `https://your-domain.vercel.app/**` to "Redirect URLs"

### 4. Update Resend Domain

For production:
1. Verify your custom domain in Resend
2. Update `RESEND_FROM_EMAIL` in Vercel environment variables

## Manual Verification Checklist

### Authentication
- [ ] User can sign up with email/password
- [ ] User receives confirmation email (check spam)
- [ ] User can sign in with credentials
- [ ] User can request password reset
- [ ] User receives password reset email
- [ ] User can update password via reset link
- [ ] User stays signed in across page refreshes
- [ ] User can sign out

### Public Pages
- [ ] Landing page loads correctly
- [ ] Navigation works on all pages
- [ ] Price list shows current prices
- [ ] Price list groups by product
- [ ] Best price is highlighted
- [ ] Mobile responsive design works

### Dashboard (Regular User)
- [ ] User can access dashboard after login
- [ ] User sees their profile name
- [ ] User can create price alerts
- [ ] User can view their alerts
- [ ] User can pause/resume alerts
- [ ] User can delete alerts
- [ ] Recent deals section shows latest prices
- [ ] Non-admin users cannot access admin panel

### Admin Panel
- [ ] Admin user can access /admin
- [ ] Admin can create new goods
- [ ] Admin can edit goods
- [ ] Admin can delete goods
- [ ] Admin can create stores
- [ ] Admin can edit stores
- [ ] Admin can delete stores
- [ ] Admin can add new prices
- [ ] Admin can delete prices
- [ ] Adding prices triggers email alerts

### Email Notifications
- [ ] Price alert email sent when price drops below target
- [ ] Email contains correct product name
- [ ] Email contains correct prices
- [ ] Email contains store information
- [ ] Email link to dashboard works
- [ ] Email formatting looks professional

### Data Integrity
- [ ] All forms validate required fields
- [ ] Prices accept decimal values
- [ ] Dates default to today
- [ ] Currency symbols display correctly
- [ ] Unit measurements shown properly
- [ ] Related data updates correctly

## Project Structure

\`\`\`
price-compare-app/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── auth.ts       # Authentication actions
│   │   ├── goods.ts      # Goods CRUD
│   │   ├── stores.ts     # Stores CRUD
│   │   ├── prices.ts     # Prices CRUD + alerts
│   │   └── alerts.ts     # Price alerts CRUD
│   ├── admin/            # Admin panel
│   │   └── page.tsx
│   ├── auth/             # Authentication pages
│   │   ├── signin/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── dashboard/        # User dashboard
│   │   └── page.tsx
│   ├── pricelist/        # Public price list
│   │   └── page.tsx
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific components
│   ├── PriceAlertForm.tsx
│   └── PriceAlertList.tsx
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── email.ts          # Email service
│   └── utils.ts          # Utility functions
├── supabase/
│   └── migrations/       # Database migrations
├── .env.example          # Environment variables template
└── package.json
\`\`\`

## Common Issues and Solutions

### Issue: "Invalid API key" error from Supabase
**Solution**: Double-check your `.env.local` file has the correct keys from Supabase dashboard.

### Issue: Emails not sending
**Solution**: 
- Verify Resend API key is correct
- Check you're using a verified domain or resend.dev for testing
- Check spam folder

### Issue: "Not authorized" when accessing admin
**Solution**: Make sure you've run the SQL command to set `is_admin = true` for your user.

### Issue: Database migrations failed
**Solution**: 
- Check you're connected to the right Supabase project
- Ensure no syntax errors in SQL files
- Try running migrations one at a time in SQL Editor

### Issue: Price alerts not triggering
**Solution**:
- Verify Resend is configured correctly
- Check that alert target price is higher than the new price
- Ensure alert is active (not paused)

## Development Tips

1. **Testing Email Locally**: Use Resend's test domain (onboarding@resend.dev) during development
2. **Database Changes**: Always create new migration files instead of editing existing ones
3. **Type Safety**: The app uses TypeScript - add proper types when creating new components
4. **Server Actions**: All mutations use Server Actions for better security and performance

## Security Best Practices

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Admin checks performed server-side
- ✅ Service role key never exposed to client
- ✅ Passwords hashed by Supabase Auth
- ✅ HTTPS enforced in production (Vercel)
- ✅ Environment variables properly separated

## Future Enhancements

Potential features to add:
- [ ] Price history charts
- [ ] Multi-currency support
- [ ] Store location maps
- [ ] Barcode scanning
- [ ] Shopping list feature
- [ ] Weekly deal digest emails
- [ ] Mobile apps (React Native)
- [ ] API for third-party integrations

## Support

For issues or questions:
1. Check this README
2. Review the verification checklist
3. Check Supabase and Resend documentation
4. Review Next.js App Router documentation

## License

MIT License - feel free to use this for personal or commercial projects.

---

Built with ❤️ using Next.js, Supabase, and Resend
