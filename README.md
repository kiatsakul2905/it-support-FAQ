# IT Support Knowledge Base 🔍

ระบบค้นหาและจัดการปัญหา IT ด้วย **Next.js 14** + **Neon Database** + **Cloudflare Pages**

![IT Support KB Preview](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![Neon](https://img.shields.io/badge/Database-Neon-green) ![Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## ✨ Features

### Core Features
- 🔎 **Search System** — ค้นหาจากชื่อปัญหา, อาการ, วิธีแก้ไข
- 📂 **Category System** — Hardware, Software, Network, Security, Email, Printer
- 📄 **Problem Detail** — ชื่อปัญหา, อาการ, สาเหตุ, วิธีแก้, วันที่สร้าง
- 🛠 **Admin Dashboard** — เพิ่ม/แก้ไข/ลบปัญหา และจัดการหมวดหมู่

### Extra Features
- 🏷 **Tag System** — ค้นหาด้วย tag เช่น `#wifi`, `#printer`, `#windows11`
- 👍 **Rating System** — ช่วยได้ / ไม่ช่วย พร้อม progress bar
- 📊 **View Count** — นับจำนวนการเข้าชมอัตโนมัติ
- 🔁 **Related Problems** — แสดงปัญหาที่เกี่ยวข้องในหมวดเดียวกัน
- 🔍 **Filter & Sort** — เรียงตาม ล่าสุด / ยอดดูสูงสุด / คะแนนสูงสุด

---

## 🗂 Project Structure

```
it-support-kb/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── problems/
│   │   │   ├── page.tsx               # Problems list with search
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Problem detail
│   │   ├── categories/
│   │   │   └── page.tsx               # Categories grid
│   │   ├── tags/
│   │   │   └── page.tsx               # Tags cloud
│   │   ├── admin/
│   │   │   ├── page.tsx               # Admin dashboard
│   │   │   └── problems/
│   │   │       ├── new/page.tsx       # Add problem form
│   │   │       └── [slug]/edit/       # Edit problem form
│   │   └── api/
│   │       ├── problems/
│   │       │   ├── route.ts           # GET all, POST new
│   │       │   └── [slug]/
│   │       │       ├── route.ts       # GET, PUT, DELETE single
│   │       │       └── rate/route.ts  # POST rating
│   │       ├── categories/route.ts    # GET, POST categories
│   │       └── tags/route.ts          # GET, POST tags
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── SearchBar.tsx
│   │   └── ProblemCard.tsx
│   └── lib/
│       ├── utils.ts                    # Helpers & types
│       └── db/
│           ├── index.ts               # Neon + Drizzle connection
│           └── schema.ts              # Database schema
├── database/
│   └── migration.sql                  # SQL to run in Neon
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── wrangler.toml
└── .env.example
```

---

## 🚀 Quick Setup Guide

### Step 1: Clone & Install

```bash
git clone <your-repo>
cd it-support-kb
npm install
```

### Step 2: Create Neon Database

1. ไปที่ [neon.tech](https://neon.tech) → Sign Up (ฟรี)
2. Create New Project → ตั้งชื่อ `it-support-kb`
3. คัดลอก **Connection String** จาก Dashboard (postgresql://...)
4. ไปที่ **SQL Editor** → วาง และรัน `database/migration.sql` ทั้งหมด

### Step 3: Environment Variables

```bash
cp .env.example .env.local
```

แก้ไข `.env.local`:
```env
DATABASE_URL=postgresql://[user]:[password]@[host].neon.tech/[dbname]?sslmode=require
ADMIN_PASSWORD=your-secure-admin-password
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here
```

### Step 4: Run Development

```bash
npm run dev
# Open http://localhost:3000
```

---

## ☁️ Deploy to Cloudflare Pages

### Option 1: GitHub + Cloudflare (แนะนำ)

1. Push โค้ดขึ้น GitHub
2. ไปที่ [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. Create a Project → Connect to Git → เลือก Repo
4. ตั้งค่า Build:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output**: `.next`
5. ตั้งค่า **Environment Variables** ใน Cloudflare:
   ```
   DATABASE_URL = postgresql://...
   ADMIN_PASSWORD = your-password
   NEXTAUTH_URL = https://your-project.pages.dev
   NEXTAUTH_SECRET = your-secret
   ```
6. Deploy!

### Option 2: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler pages deploy .next
```

---

## 📡 API Reference

### Problems

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/problems` | ดึงรายการปัญหา (query: q, category, tag, sort, limit) |
| POST | `/api/problems` | เพิ่มปัญหาใหม่ (Header: x-admin-key) |
| GET | `/api/problems/:slug` | ดึงปัญหาเดี่ยว + เพิ่ม view count |
| PUT | `/api/problems/:slug` | แก้ไขปัญหา (Header: x-admin-key) |
| DELETE | `/api/problems/:slug` | ลบปัญหา (Header: x-admin-key) |
| POST | `/api/problems/:slug/rate` | ให้คะแนน helpful/not_helpful |

### Categories & Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | ดึงหมวดหมู่ทั้งหมด |
| POST | `/api/categories` | เพิ่มหมวดหมู่ใหม่ |
| GET | `/api/tags` | ดึง tags ทั้งหมด |
| POST | `/api/tags` | เพิ่ม tag ใหม่ |

---

## 🎨 Design System

**Theme**: Terminal / Monochrome Green — ได้แรงบันดาลใจจาก Terminal เก่า  
**Fonts**: JetBrains Mono (body) + Syne (display) + Share Tech Mono  
**Colors**:
- Accent: `#00ff41` (terminal green)
- Amber: `#ffb800` (warnings/admin)
- Red: `#ff3a3a` (errors/delete)
- Blue: `#00d4ff` (software category)

---

## 🔐 Admin Access

ไปที่ `/admin` แล้วกรอก `ADMIN_PASSWORD` ที่ตั้งไว้ใน `.env`

> **Note**: ระบบ Auth ใช้ localStorage เก็บ key ไว้ใน browser เหมาะสำหรับ internal tool  
> สำหรับ production ที่ต้องการ security สูง ควรเพิ่ม NextAuth.js

---

## 🛠 Tech Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | Neon (Serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Deploy | Cloudflare Pages |
| Icons | Unicode symbols (no external deps) |

---

## 📝 License

MIT — ใช้ได้ฟรีทั้งส่วนตัวและเชิงพาณิชย์
