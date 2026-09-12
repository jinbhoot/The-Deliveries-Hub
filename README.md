# 🚀 Deliveries Hub — Multi-Category Delivery Platform

An end-to-end, production-ready on-demand delivery platform built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **MongoDB / Mongoose**, and **Stripe**.

Deliveries Hub seamlessly connects **Customers**, **Delivery Riders**, and **Platform Administrators** across three core categories: **Food**, **Groceries**, and **Medicine**.

---

## 🌟 Key Features

### 👤 1. Client Dashboard (`/ClientDashboard`)
- **Category Browsing**: Explore dynamic categories and subcategories (Fast Food, Desi Meals, Daily Essentials, Prescription Medicine, etc.).
- **Smart Shopping Cart**: Add items, adjust quantities, real-time subtotal calculation.
- **Dual Payment Options**:
  - **Cash on Delivery (COD)** with automated receipt generation upon delivery.
  - **Online Card Payments** powered by **Stripe Elements**.
- **Live Order Tracking**: Real-time status progression (`Pending` ➔ `Accepted` ➔ `Picked Up` ➔ `On the Way` ➔ `Delivered`).
- **Support & Reporting**: Submit dispute tickets and delivery feedback directly to the admin team.
- **Account & Password Management**: Self-service password reset and profile updates.

### 🛵 2. Rider Dashboard (`/RiderDashboard`)
- **Real-Time Job Dispatch**: View and accept available orders in the area with atomic race-condition locks.
- **Status Lifecycle Control**: Progress orders from acceptance to final doorstep delivery.
- **Transparent 80/20 Earnings Split**:
  - **Base Store Bill**: Fully separated and untouched.
  - **Fixed Delivery Fee**: Automatically splits **80% to Rider Earnings** and **20% to Platform Admin Fee**.
- **Duty Toggle**: Instant online/offline availability switch.
- **Rider Verification**: Driver CNIC, vehicle details, and license verification flow.

### 🛡️ 3. Admin Dashboard (`/adminDashboard`)
- **Real-Time Analytics**: Total revenue, platform fees, active riders, client count, and order volumes.
- **Catalog & Inventory Management**: Create, edit, and delete categories, subcategories, and individual store items with image URLs.
- **Rider Management**: Review pending rider applications, approve accounts, or restrict/block accounts.
- **Order Oversight & Payment Ledger**: Complete audit trail of all transactions and cash collections.
- **Dispute Resolution**: Review, investigate, and resolve customer reports and complaints.

### 📄 4. Public & Information Pages
- **Landing Page (`/`)**: Hero section, service highlights, mobile responsive navigation.
- **Terms & Conditions (`/terms`, `/terms-and-conditions`)**: Detailed delivery fee formulas, 80/20 split breakdown, ETA timelines, cancellation and refund policies.
- **Privacy Policy (`/privacy`, `/privacy-policy`)**: Data collection, security standards, GPS usage, and user rights.
- **About Us (`/about`, `/about-us`)**: Mission statement, core pillars, and company impact metrics.
- **Contact Us (`/contact`, `/contact-us`)**: Dedicated support channels for customers, WhatsApp instant chat, email helpdesk, and rider operations desk.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose 8](https://mongoosejs.com/)
- **Authentication**: JWT tokens stored in secure `httpOnly` cookies with `jose` & `bcryptjs` password hashing
- **Payments**: [Stripe](https://stripe.com/) (`@stripe/stripe-js` & `@stripe/react-stripe-js`)
- **Type Safety**: [TypeScript 5](https://www.typescriptlang.org/)

---

## 📁 Project Structure

```text
deliveries-hub-complete-project/
├── app/
│   ├── (public pages)
│   │   ├── about/ & about-us/          # About Us page
│   │   ├── contact/ & contact-us/      # Contact Us page
│   │   ├── privacy/ & privacy-policy/  # Privacy Policy
│   │   ├── terms/ & terms-and-conditions/ # Terms & Conditions
│   │   ├── login/                      # Unified login with password reset
│   │   ├── signup/                     # Client & Rider registration
│   │   └── page.tsx                    # Landing Home page
│   ├── adminDashboard/                 # Admin management views
│   ├── ClientDashboard/                # Customer ordering & tracking
│   ├── RiderDashboard/                 # Rider dispatch & earnings
│   └── api/                            # Next.js App Router API endpoints
│       ├── admin/                      # Admin statistics & metrics
│       ├── auth/                       # Register, login, logout, reset-password
│       ├── categories/ & subcategories/# Catalog taxonomy
│       ├── clients/                    # Customer records
│       ├── items/                      # Products & pricing
│       ├── orders/                     # Order lifecycle & atomic accept
│       ├── payments/                   # Stripe intent & COD records
│       ├── reports/                    # Customer dispute reports
│       └── riders/                     # Rider verification & status
├── components/                         # Reusable UI (PublicHeader, PublicFooter, etc.)
├── lib/                                # DB connection, auth helpers, Stripe client
├── models/                             # Mongoose schemas (User, Order, Item, etc.)
├── public/                             # Static assets & images
├── scripts/                            # Database seed scripts
└── middleware.ts                       # Role-based route guard
```

---

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.18+ or v20+ recommended)
- [MongoDB Atlas](https://www.mongodb.com/atlas) database connection string
- [Stripe Account](https://dashboard.stripe.com/register) (for test API keys)

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd deliveries-hub-complete-project
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
Open `.env.local` and set your credentials:
```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/deliveries-hub?retryWrites=true&w=majority

# JWT Token Secret (any random string)
JWT_SECRET=your_super_secret_random_jwt_string_here

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_CURRENCY=pkr
```

### 5. Seed Database (Optional but Recommended)
Initialize admin accounts, test riders, and sample catalog items:
```bash
# 1. Seed Admin account (admin@deliveryhub.com / Admin@123)
node scripts/seedAdmin.mjs

# 2. Seed Test Rider account (rider@deliveryhub.com / Rider@123)
node scripts/seedRider.mjs

# 3. Seed Category taxonomy & demo items
node scripts/seedTaxonomy.mjs
```

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Build for Production
```bash
npm run build
npm run start
```

---

## 🔒 Security & Best Practices

- **Never commit `.env` or `.env.local`** to Git (already protected in `.gitignore`).
- Passwords are encrypted using salted `bcryptjs` hashes.
- API endpoints authenticate incoming requests via signed JWT cookies parsed in Next.js `middleware.ts`.
- Route access is strictly isolated by role (`client`, `rider`, `admin`).

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

