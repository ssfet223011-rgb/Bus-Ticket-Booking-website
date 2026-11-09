# JatraSheba (যাত্রাসেবা) — Multi-Operator Bus Ticketing, Counter POS & Travel Information Platform

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald.svg)](https://supabase.com/)

A production-grade, enterprise-scale Multi-Operator Intercity Bus Ticket Booking, Physical Counter Point-of-Sale (POS), and Travel Information Management Platform designed specifically for the Bangladesh transportation ecosystem.

---

## 🌟 Key Platform Modules & Capabilities

### 1. Multi-Operator Bus Marketplace
- Nationwide route coverage: Dhaka, Chattogram, Cox's Bazar, Sylhet, Rajshahi, Khulna, Barishal, Bogura.
- Leading bus operator fleets: **Green Line Paribahan**, **Shohagh Paribahan**, **Hanif Enterprise**, **Ena Travels**, **Desh Travels**, and platform-managed fleet **JatraSheba Express**.
- Multi-tier coach categories: Multi-Axle Scania Luxury AC, Volvo B11R 2+1 VIP Business Class, Hyundai Royal Sleeper Berths, and Deluxe Non-AC.
- Real-time trip filtering by departure time slots (Morning, Afternoon, Night), coach class, price range, and operators.

### 2. Centralized Real-Time Seat Inventory Engine
- **Shared Inventory**: Online web passengers and physical counter operators share the exact same PostgreSQL inventory in real time.
- **10-Minute Temporary Seat Hold**: Prevents duplicate reservations. When seats are selected, an atomic transactional hold is applied with a visible countdown timer.
- **Auto-Release Cron**: Expired holds automatically return to available status.
- **Accurate Seat Map**: Dynamic layouts for 2+2 standard coaches, 2+1 VIP luxury recliners, and double-deck sleeper berths with driver and door positions.

### 3. Physical Counter POS Terminal
- Fast, keyboard-friendly walk-in ticket booking interface tailored for busy terminals (Sayedabad, Gabtoli, Dampara, etc.).
- Dual print support:
  - **80mm ESC/POS Thermal Receipt** with high-contrast barcode/QR code and compact layout.
  - **Full A4 Boarding Pass PDF** with complete travel policies and terms.
- Counter shift reconciliation:
  - Real-time cash collection vs. digital MFS sales tracking.
  - Daily expense logger (thermal paper rolls, refreshments).
  - End-of-Day cash closing with drawer count verification.

### 4. Bangladesh Payment Gateway Abstraction & MFS Simulator
- Integrated support for Bangladesh's leading payment methods:
  - **bKash Instant Checkout** with simulated Account, OTP, and PIN verification modal.
  - **Nagad Gateway**.
  - **Credit / Debit Cards** (Visa, Mastercard, SSLCommerz).
  - **Counter Cash Collection** for walk-in passengers.
- Coupon engine supporting percentage and fixed discounts (`SHUVOJATRA`, `EID2026`, `BKASH50`).

### 5. Digital QR Boarding Pass & Conductor Scanner
- Unique cryptographic booking references (e.g. `BD-20261103-XXXXXX`) and ticket IDs.
- Conductor verification modal: Conductors can scan or input ticket QR payloads to instantly check boarding validity and prevent fraud or cancelled ticket re-entry.

### 6. Role-Based Access Control (RBAC) & Persona Switcher
- Configured for 9 roles:
  1. **Super Admin**: Platform overview, financial commissions, operator approvals, system settings.
  2. **Operator Owner / Manager**: Fleet management, trip scheduling, driver/helper rosters, passenger manifests.
  3. **Counter Operator / Manager**: POS walk-in booking, thermal printing, shift cash drawer.
  4. **Passenger**: Personal profile, active bookings, one-click PDF ticket download, cancellation & refunds.
- Top bar **Quick Persona Switcher** allowing instant role toggling during demonstrations.

### 7. Bilingual English & Bengali (বাংলা) Localization
- Complete one-click language toggle across navigation, search, seat maps, checkout, and E-Tickets.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons |
| **Backend & Database** | Supabase, PostgreSQL 15+, Row Level Security (RLS), Stored Procedures |
| **Edge Functions** | Deno-based Supabase Edge Functions (`payment-webhook`, `release-holds-cron`) |
| **Hardware & Print** | 80mm ESC/POS Thermal Receipt, Browser Web Print, QR Code Engine (`qrcode.react`) |
| **State & Persistence** | Reactive React Context with dual Supabase Cloud / LocalStorage demo fallback |

---

## 📂 Project Directory Structure

```
├── dist/                             # Compiled production bundle
├── public/                           # Static assets
├── src/
│   ├── components/
│   │   ├── admin/                    # Super Admin Dashboard & Financial Settlements
│   │   ├── booking/                  # SearchWidget, FilterSidebar, TripCard, SeatMap, CheckoutModal
│   │   ├── common/                   # Header, Footer, Persona Switcher, Badges
│   │   ├── counter/                  # Counter POS View, Cash Closing, Expense Logger
│   │   ├── info/                     # Travel Hub, Counter Locator with Google Maps links
│   │   ├── operator/                 # Operator Dashboard, Trip Scheduler, Passenger Manifest
│   │   ├── passenger/                # My Bookings, Cancellation & Refund Portal
│   │   └── ticket/                   # ETicketCard (A4), ThermalReceipt (80mm), QRScannerModal
│   ├── context/
│   │   ├── AuthContext.tsx           # Multi-role authentication & quick switcher
│   │   ├── BookingContext.tsx        # Centralized seat inventory & booking engine
│   │   └── LanguageContext.tsx       # Bilingual EN/BN i18n dictionary
│   ├── services/
│   │   ├── mockData.ts               # Bangladesh transport seed data
│   │   └── supabase.ts               # Supabase JS client with offline fallback
│   ├── types/
│   │   └── index.ts                  # TypeScript definitions for all 30+ entities
│   ├── utils/
│   │   └── seatHelpers.ts            # Bus seat layout calculations & BDT formatters
│   ├── App.tsx                       # Master App orchestrator
│   ├── index.css                     # Tailwind v4 styles and print media rules
│   └── main.tsx                      # Root entry point
├── supabase/
│   ├── functions/
│   │   ├── payment-webhook/          # Supabase Edge Function for gateway callbacks
│   │   └── release-holds-cron/       # Supabase Edge Function for expired holds
│   ├── migrations/
│   │   └── 20260101000000_core_schema.sql # 30+ tables, RLS policies & stored procedures
│   └── seed.sql                      # Production seed data (cities, operators, trips)
├── .env.example                      # Environment variable template
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript compiler configuration
└── vite.config.ts                    # Vite build configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js version 18+ (tested on v24.19)
- npm version 9+

### 1. Clone & Install Dependencies
```bash
cd "Bus Ticket website"
npm install
```

### 2. Environment Configuration
Copy the template file to `.env`:
```bash
cp .env.example .env
```
*(The application is pre-configured to run out-of-the-box in sandbox demo mode even if Supabase keys are not provided immediately).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
npm run preview
```

---

## 🗄️ Supabase Cloud Setup & Migration

To connect your own live Supabase project:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/migrations/20260101000000_core_schema.sql`](file:///supabase/migrations/20260101000000_core_schema.sql).
4. Run the seed data file [`supabase/seed.sql`](file:///supabase/seed.sql).
5. Copy your **Project URL** and **Anon Public Key** from `Settings -> API` into your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
6. Deploy the Supabase Edge Functions using the Supabase CLI:
   ```bash
   supabase functions deploy payment-webhook
   supabase functions deploy release-holds-cron
   ```

---

## 🧑‍💻 Test Accounts & Role Personas

Use the **Role Selector** in the top navigation bar to test each perspective:

| Persona | Role | Features Available |
|---|---|---|
| **Farabi Rahman** | `super_admin` | Global Platform KPIs, Operator Management, Settlements, System Audit Logs |
| **Kamrul Hassan** | `operator_owner` | Green Line Fleet Manager, Trip Scheduler, Passenger Manifest Exporter |
| **Md. Rafiqul Islam**| `counter_operator` | Sayedabad POS Terminal, Walk-in Booking, 80mm Thermal Receipt, Cash Closing |
| **Tanvir Ahmed** | `passenger` | Search Buses, Select Seats, bKash Checkout, E-Ticket Download, Cancel Booking |

---

## 💳 Payment Gateway Sandbox Testing

When completing a checkout:
- **bKash**: Click `bKash Instant`, enter any phone (e.g. `01712345678`), OTP: `123456`, PIN: `12345`.
- **Nagad**: Click `Nagad`, enter OTP and PIN.
- **Card**: Instant mock settlement.
- **Counter Cash**: Available in Counter POS mode for direct cash collection.
- **Coupons**: Test with `SHUVOJATRA` (৳150 off), `EID2026` (10% off), or `BKASH50` (৳50 off).

---

## 📄 License & Attribution
Developed for the Bangladesh Transportation Market. All trademarks (bKash, Nagad, Green Line, Shohagh, etc.) are property of their respective owners.
