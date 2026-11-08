# How to Connect Supabase Cloud Database (Step-by-Step)

Supabase is a free cloud PostgreSQL database with an instant REST API. Follow these simple steps to connect it to your NOIR Barbers platform:

---

### Step 1: Create a Free Supabase Project (2 Minutes)

1. Go to [supabase.com](https://supabase.com) and sign in (you can use your GitHub account).
2. Click **"New Project"**.
3. Choose a name (e.g. `noir-barbers-db`) and a secure database password.
4. Select the closest region and click **"Create new project"**.

---

### Step 2: Run the Database Schema (1 Click)

1. In your Supabase dashboard, click on the **SQL Editor** icon in the left sidebar (looks like `>_`).
2. Click **"New Query"**.
3. Open [`docs/supabase-schema.sql`](./supabase-schema.sql) from this project, copy the whole SQL text, and paste it into the Supabase SQL Editor.
4. Click **Run** (green button).
5. All 4 tables (`services`, `barbers`, `bookings`, `gallery`) and initial sample services will be created instantly!

---

### Step 3: Get Your API Keys

1. In Supabase, go to **Project Settings** (gear icon at bottom left) > **API**.
2. Copy two values:
   - **Project URL** (e.g. `https://xyzprojectid.supabase.co`)
   - **anon / public key** (a long string starting with `eyJhbGci...`)

---

### Step 4: Add to Your Frontend `.env`

Open `web/.env` in your project and add:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your_anon_key_here...
```

---

### Step 5: Test & Verify

1. Run the web app:
   ```bash
   npm --prefix web run dev
   ```
2. Open the Admin Console: `http://localhost:5173/admin/login`
3. Tap **"Fill Default Admin"** and click **Sign In**.
4. On the dashboard, use the **📱 Mobile Asset Manager** to add a new service or haircut.
5. Check your Supabase Table Editor: you will see the new row saved directly in your cloud database!
6. Open your Telegram Bot Mini App: your new haircut is immediately visible and bookable by customers!
