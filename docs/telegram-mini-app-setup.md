# Telegram Mini App & Free Cloud Hosting Setup Guide

This guide explains how your frontend is configured to run as a **Telegram Mini App (TMA)** and how to run it independently without requiring a Python backend.

---

## 🌟 Key Features Implemented

1. **Telegram Mini App Native Integration (`useTelegram`)**:
   - **Auto-Detection**: Seamlessly detects when the website is opened inside Telegram vs. a standard web browser.
   - **Telegram User Auto-Fill**: Automatically pre-fills the customer's full name and Telegram handle (`@username`) directly into the booking form.
   - **Native Telegram Controls**:
     - **MainButton**: Synchronized with booking state ("RESERVE CHAIR · 350 ETB") pinned to the bottom of the Telegram screen.
     - **BackButton**: Native top-left arrow in Telegram header to navigate back cleanly without exiting the app.
     - **Haptic Feedback**: Subtle vibration on service selection, date picker, and booking confirmation.
   - **Dark Theme Matching**: Automatically adjusts header color and background to `#090909` to match Telegram's sleek chrome.
   - **Receipt Sharing**: Users can tap "Send Confirmation to Bot Chat" to deliver their booking receipt directly into their Telegram message history.

2. **Standalone & Free Cloud-Ready Architecture (No Python Needed)**:
   - Previously, the app required a running Django/Python backend on a local IP.
   - Now, the frontend works **100% standalone** out of the box using a robust client storage layer (`standaloneStore.js`):
     - Comprehensive catalog of haircuts and grooming services (Low Fade, Mid Fade, Skin Fade, Textured Crop, Classic Cut, Beard Design, etc.).
     - Live availability engine: automatically generates realistic 45-min / 60-min slots for today (filtering out passed times) and up to 14 days in advance.
     - Creates valid booking codes (e.g. `BK-0089`) and stores records in `localStorage`.
     - Supports mock payment verification (Telebirr, CBE Birr, Cash).
     - **Cloud Database Ready**: When you are ready to connect a free cloud database (such as Supabase, Firebase Firestore, or a remote REST API), you only need to set `VITE_API_BASE_URL` in `.env`.

---

## 🚀 How to Connect to a Telegram Bot

### Step 1: Create a Bot via @BotFather
1. Open Telegram and search for [`@BotFather`](https://t.me/BotFather).
2. Send `/newbot`.
3. Give your bot a friendly name (e.g., `NOIR Barbers Addis`).
4. Give your bot a unique username ending in `bot` (e.g., `noir_barbers_app_bot`).
5. BotFather will provide an **API Token** (keep this token safe).

---

### Step 2: Configure the Mini App (Menu Button)
To let users open the website as a Mini App directly from the chat:
1. In `@BotFather`, send `/setmenubutton`.
2. Select your bot.
3. Choose **"Configure menu button"**.
4. Enter the button text: `💈 Book Chair`.
5. Enter your Mini App URL:
   - For local testing: your HTTPS tunnel URL (see Step 3 below).
   - For production: your deployed Vercel / Cloudflare URL (e.g. `https://noir-barbers.vercel.app`).

Alternatively, create a standalone Web App link using `@BotFather`:
1. Send `/newapp`.
2. Choose your bot.
3. Set title, description, and upload a 640x360 image.
4. Enter the Web App URL.
5. BotFather will give you a direct link like: `t.me/noir_barbers_app_bot/book`.

---

### Step 3: Test Locally with an HTTPS Tunnel
Telegram requires Mini Apps to use an **HTTPS** URL.

1. Start your local dev server:
   ```bash
   cd web
   npm run dev
   ```
   *(Running at `http://localhost:5173`)*

2. In another terminal, create a free HTTPS tunnel using `localtunnel` or `cloudflared`:
   ```bash
   npx localtunnel --port 5173
   ```
   *(Or using ngrok: `ngrok http 5173`)*

3. Copy the `https://....loca.lt` URL and paste it into `@BotFather` as your Mini App URL!

4. Open your bot in Telegram on mobile or desktop and tap the bottom **"💈 Book Chair"** button!

---

### Step 4: Run the Companion Telegram Bot Script
We included a zero-dependency companion bot script in `scripts/telegram-bot.mjs`:

```bash
# Run with your Bot Token and Mini App URL:
node scripts/telegram-bot.mjs <YOUR_BOT_TOKEN> <YOUR_HTTPS_URL>
```

**What this script does:**
- Responds to `/start` with an interactive inline button to launch the Mini App.
- Automatically registers the persistent Telegram menu button.
- Listens for booking confirmation events sent from the Mini App and posts instant booking receipts into the chat!

---

### Step 5: Free Frontend Hosting (Deploy in 2 Minutes)

You can host this frontend for free on any of these platforms:

#### Option A: Vercel (Recommended)
1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Set **Root Directory** to `web`.
5. Click **Deploy**.
6. Copy your production URL (e.g., `https://your-app.vercel.app`) and set it in `@BotFather`!

#### Option B: Cloudflare Pages
1. Go to Cloudflare Dashboard > **Workers & Pages**.
2. Connect your GitHub repository.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Root directory: `web`
6. Deploy for free with zero-cost global CDN!

---

### Step 6: Connecting a Free Cloud Database (Later)

When you're ready to store bookings in a free hosted cloud database instead of localStorage:

1. **Supabase (Free Tier: 500MB PostgreSQL, Auth, Realtime)**:
   - Create a free project at [supabase.com](https://supabase.com).
   - Create a `bookings` table matching the fields: `booking_code`, `customer_name`, `customer_phone`, `service_name`, `booking_date`, `start_time`, `status`, `payment_status`.
   - Set your API URL in `web/.env`:
     ```env
     VITE_API_BASE_URL=https://your-project.supabase.co
     ```

2. **Firebase Firestore (Free Tier: 1GB storage, 50k reads/day)**:
   - Create a Firebase project and enable Firestore.
   - Simply sync `standaloneStore.js` with Firebase JS SDK!
