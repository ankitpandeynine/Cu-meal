# 🍽️ CU Meal & Events Portal (with Gemini AI & Admin Studio)

A campus mess management and event publishing portal for **Chandigarh University (CU)**, built with **Next.js 14**, **Tailwind CSS**, and **Google Gemini AI**.

---

## 🌟 Key Features

### 1. 📅 Interactive Top Calendar & Daily Meals View (Matching UI Screenshots)
- **Horizontal Date Bar**: Week & month day selector with active date pill indicator (`25 Su`, `26 Mo`, `27 Tu`, etc.), "Today 🔴" indicator, and "Tomorrow >" quick jump.
- **Complete Meal Times on One Screen**:
  - 🌅 **Breakfast** (`07:30 AM - 09:00 AM`) — e.g. *Sweet Dalia, Banana, Bread, Boiled Egg, Fat Spread Jam, Tea*
  - 🍛 **Lunch** (`12:00 PM - 01:45 PM`) — e.g. *Amritsari Chole, Khatta Meetha Pumpkin, Chapati, Sweet Lassi, Steamed Rice, Beet Cucumber Salad, Mix Pickle*
  - ☕ **Snacks (Boys)** (`04:30 PM - 05:15 PM`) — e.g. *NC: Samosa, Tea / Zakir: Namkeen, Tea*
  - 🍵 **Snacks (Girls)** (`04:30 PM - 05:15 PM`) — e.g. *Rusk, Tea*
  - 🍲 **Dinner** (`07:30 PM - 09:00 PM`) — e.g. *Dhaba Dal, Subz Jalfreji, Chapati, Steamed Rice, Green Salad, Mix Pickle, Green Chilli*
- **"Menu Unavailable" State**: When menu is being updated for a day, shows the clean clipboard icon & *"The menu is currently being updated. Please check back shortly."*
- **Hostel Filter Chips**: Filter between All, Boys (NC & Zakir blocks), or Girls Wing.

### 2. 📱 Floating Capsule Navigation & Profile View
- **Bottom Navigation Bar**: Floating glass pill matching screenshots (`Meal`, `Events`, `Profile`).
- **Profile View**:
  - Scenic Mountain header banner
  - User details: **Ankit Pandey** (`25bda70210@gmail.com`)
  - Gender: Male, Birthday: 24 Jul
  - Appearance toggle (Light / Dark)
  - Interactive Feedback submission form
  - Direct 1-click gateway to the Admin Portal

### 3. 🔐 Secure Admin Portal (`/admin`)
- Accessible only with credentials:
  - **Username**: `ankit`
  - **Password**: `ankitcu21`
- Includes session authentication with secure cookies and instant logout.

### 4. 🤖 Google Gemini AI Event & Poster Pipeline
- **Natural Language to Event**: Simply type a casual sentence like:
  > *"Add a Diwali Grand Feast & Musical DJ Night this Sunday at 7 PM with live tandoori paneer counters, rasmalai, ethnic dress contest, and a glowing festive poster"*
- **Gemini Automatically Generates**:
  - Catchy title & teaser subtitle
  - Accurate date, time, and campus venue
  - Thematic category (`festival`, `special-feast`, `dj-night`, `sports`, `mess-notice`)
  - Detailed 3-paragraph announcement text
  - Key event highlights & menu inclusion bullet points
- **Dynamic AI Poster Engine**:
  - Creates graphic posters with gradient backdrops, festive lighting, decorative icons, and custom typography.
  - Themes: `festive`, `foodie`, `neon`, `sports`, `royal`.
- **Instant Live Publishing**: Choose **"Generate & Preview"** to inspect and tweak, or **"Ask Gemini & Publish Live 🚀"** for 1-click immediate deployment to the website!

### 5. 🥗 Gemini AI Menu Assistant
- Ask Gemini: *"Generate a healthy Punjabi special for Wednesday with Rajma Chawal for lunch and Paneer Tikka for dinner"* — automatically populates and formats the meal cards!

---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repository
git clone <repo-url>
cd cumeal

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the Admin Portal.

---

## ☁️ Vercel Deployment Pipeline

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Complete CU Meal & Gemini Event Portal"
git branch -M main
git remote add origin https://github.com/<your-username>/cumeal.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Select your `cumeal` GitHub repository.
3. In **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com))*
   - `ADMIN_USER`: `ankit`
   - `ADMIN_PASSWORD`: `ankitcu21`
4. Click **Deploy**!

Vercel will build and deploy the application with zero configuration. Any updates pushed to the GitHub `main` branch will automatically trigger a new deployment.
