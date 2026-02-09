# Quick Start Guide

This is a beginner-friendly guide to get your Price Compare app running in 15 minutes!

## What You'll Need

1. A computer with internet
2. Node.js installed ([download here](https://nodejs.org))
3. A code editor like VS Code ([download here](https://code.visualstudio.com))

## Step-by-Step Setup

### 1️⃣ Install Dependencies (2 minutes)

Open your terminal in the project folder and run:

\`\`\`bash
npm install
\`\`\`

Wait for all packages to download.

### 2️⃣ Create Supabase Account (5 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new project:
   - Name: "price-compare"
   - Database password: (save this somewhere!)
   - Region: Choose closest to you
5. Wait 2-3 minutes for setup

### 3️⃣ Setup Database (3 minutes)

In Supabase dashboard:

1. Click "SQL Editor" (left sidebar)
2. Click "New Query"
3. Open file: `supabase/migrations/20240101000000_initial_schema.sql`
4. Copy ALL the text
5. Paste in Supabase and click "Run"
6. Repeat for file: `supabase/migrations/20240101000001_seed_data.sql`

### 4️⃣ Get Your API Keys (2 minutes)

In Supabase:

1. Click "Project Settings" (gear icon, bottom left)
2. Click "API" in settings
3. Copy these three values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

### 5️⃣ Create Resend Account (2 minutes)

1. Go to https://resend.com
2. Sign up with email
3. Go to "API Keys"
4. Click "Create API Key"
5. Copy the key

### 6️⃣ Setup Environment File (1 minute)

1. Copy file `.env.example` to `.env.local`
2. Open `.env.local` in your editor
3. Fill in your keys:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
RESEND_API_KEY=re_123...
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

4. Save the file

### 7️⃣ Start the App! (30 seconds)

In terminal:

\`\`\`bash
npm run dev
\`\`\`

Open browser to: http://localhost:3000

## First Steps in the App

### Create Your Account

1. Click "Get Started" or "Sign Up"
2. Enter your name, email, and password
3. Click "Create Account"
4. You'll be redirected to the dashboard!

### Make Yourself Admin

To access the admin panel:

1. Go to Supabase Dashboard
2. Click "Authentication" > "Users"
3. Find your user and click on it
4. Copy the User ID
5. Go to "SQL Editor"
6. Run this query (replace YOUR_USER_ID):

\`\`\`sql
UPDATE profiles 
SET is_admin = true 
WHERE id = 'YOUR_USER_ID';
\`\`\`

7. Refresh your app
8. You'll now see "Admin" button in navigation!

### Add Your First Price

1. Click "Admin" in the navigation
2. Scroll to "Prices Management"
3. Click "Add New Price"
4. Select a product (like "Organic Bananas")
5. Select a store (like "Walmart")
6. Enter a price (like "2.99")
7. Select currency (USD)
8. Click "Add Price"

### Create a Price Alert

1. Go to "Dashboard"
2. Scroll to "Create New Alert"
3. Select a product
4. Enter target price (like "2.50")
5. Select currency
6. Click "Create Alert"
7. You'll get an email when the price drops!

## Troubleshooting

**App won't start?**
- Make sure you ran `npm install`
- Check your `.env.local` file has all values filled in

**Can't sign up?**
- Check Supabase project is running
- Verify your API keys are correct in `.env.local`

**Not receiving emails?**
- Using onboarding@resend.dev for testing is fine
- Check your spam folder
- Verify Resend API key is correct

**Admin panel not showing?**
- Make sure you ran the SQL command to set is_admin = true
- Sign out and sign back in

## What's Next?

- ✅ Explore the price list at `/pricelist`
- ✅ Add more products in the admin panel
- ✅ Set up price alerts for items you buy regularly
- ✅ Check out the README.md for deployment to Vercel

## Need Help?

- Read the full README.md for detailed documentation
- Check the verification checklist in README.md
- Review your .env.local file for typos

---

Congratulations! 🎉 You've successfully set up your Price Compare app!
