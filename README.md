<h1 align="center">
  🎓 UNI SWAP Campus MarketPlace
</h1>

<p align="center">
  A secure, AI-enhanced marketplace built exclusively for university students to buy and sell items within a trusted campus community.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Firebase_Realtime_Database-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Features by Component](#-features-by-component)
  - [1. User Management](#1-user-management-component)
  - [2. Item Management](#2-item-management-component)
  - [3. Transaction & Pricing Management](#3-transaction--pricing-management-component)
  - [4. Trust, Security & Intelligence](#4-trust-security--intelligence-component)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Team & Contributions](#-team--contributions)
- [License](#-license)

---

## 🌐 Project Overview

**UNI SWAP Campus MarketPlace** is a full-stack MERN web application designed for university students to securely buy and sell items within their campus community. The platform ensures only verified university members can access the system, enforces secure transactions, and leverages AI/ML capabilities to build trust, detect fraud, and offer personalized recommendations.

The system is divided into **four core components**, each developed and managed by a dedicated team member:

| # | Component | Responsibility |
|---|-----------|----------------|
| 1 | User Management | Registration, authentication, roles, profiles |
| 2 | Item Management | Listings, images, categories, availability |
| 3 | Transaction & Pricing Management | Payments, discounts, seller tracking |
| 4 | Trust, Security & Intelligence | Fraud detection, reviews, AI recommendations |

---

## 🏗 System Architecture

```
campus-marketplace-system/
├── frontend/          # React.js Client Application
├── backend/           # Node.js + Express REST API
│   ├── user-service/      # Component 1 – User Management
│   ├── item-service/      # Component 2 – Item Management
│   ├── transaction-service/ # Component 3 – Transaction & Pricing
│   └── trust-service/     # Component 4 – Trust, Security & AI
└── README.md
```

---

## ✨ Features by Component

### 1. User Management Component

> Manages all users and controls access. Only verified university members may register and use the platform.

- ✅ User registration using **university email**
- ✅ Secure **login / logout** flows
- ✅ User **profile management**
- ✅ **Role-based access control** (Student, Admin)
- ✅ **Account verification** and authentication (JWT)
- ✅ **Secure password hashing** (bcrypt)

---

### 2. Item Management Component

> Handles all operations related to listing, managing, and displaying items available for buying and selling.

- ✅ **Add new item listings** with detailed descriptions
- ✅ **Edit and delete** existing listings
- ✅ **Upload and manage item images** (Cloudinary / Multer)
- ✅ **Categorize items** — Books, Electronics, Hostel Items, and more
- ✅ **View item details** with rich media
- ✅ Manage **item availability status** (Available / Sold / Reserved)

---

### 3. Transaction & Pricing Management Component

> Manages all purchase-related activities including payments, discounts, and seller performance tracking.

- ✅ **Upload and manage payment slips**
- ✅ **Verify payment details** by admins
- ✅ **Calculate total price** for cart/purchases
- ✅ **Bulk purchase discounts** (2 or more items)
- ✅ **Track completed transactions** with history
- ✅ **Best seller leaderboard** based on sales performance

---

### 4. Trust, Security & Intelligence Component

> Ensures platform safety, builds community trust, and enhances the system with AI-based features.

- ✅ **Fraud & suspicious activity detection**
- ✅ Monitoring of **abnormal pricing or listing behavior**
- ✅ **Review and rating management** for buyers/sellers
- ✅ **Sentiment analysis** on user reviews (AI/NLP)
- ✅ **Seller trust scoring** algorithm
- ✅ **Personalized item recommendations** (AI-driven)
- ✅ **Administrative moderation and reporting** tools

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js, Axios, React Router DOM, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | Firebase Realtime Database (Firebase Admin SDK) |
| **Hosting** | Firebase Hosting + Cloud Functions |
| **Authentication** | JSON Web Tokens (JWT), bcrypt.js |
| **File Uploads** | Multer, Cloudinary |
| **AI / ML** | Sentiment Analysis API / Custom NLP Model |
| **Version Control** | Git & GitHub |
| **Package Manager** | npm |

---

## 📁 Project Structure

```
campus-marketplace-system/
│
├── backend/
│   ├── config/
│   │   └── database.js             # Firebase Realtime Database access
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── errorHandler.js
│   │
│   ├── user-service/               # Component 1
│   │   ├── models/User.js
│   │   ├── routes/userRoutes.js
│   │   └── controllers/userController.js
│   │
│   ├── item-service/               # Component 2
│   │   ├── models/Item.js
│   │   ├── routes/itemRoutes.js
│   │   └── controllers/itemController.js
│   │
│   ├── transaction-service/        # Component 3
│   │   ├── models/Transaction.js
│   │   ├── routes/transactionRoutes.js
│   │   └── controllers/transactionController.js
│   │
│   ├── trust-service/              # Component 4
│   │   ├── models/Review.js
│   │   ├── routes/trustRoutes.js
│   │   └── controllers/trustController.js
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── users/
│   │   │   ├── items/
│   │   │   ├── transactions/
│   │   │   └── trust/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/               # Axios API calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v9+)
- [Firebase CLI](https://firebase.google.com/docs/cli) (`npm install -g firebase-tools`)
- Java JDK 11+ (required by the local Firebase Realtime Database emulator)
- A Firebase project with Realtime Database enabled

### 1. Clone the Repository

```bash
git clone https://github.com/Nethmi2003-web/campus-marketplace-system.git
cd campus-marketplace-system
```

### 2. Create and Configure Firebase

The repository is configured to target Firebase project `uni-swap-9d541` (Uni-Swap). You must sign in with a Google account that is authorized on that project. If it belongs to another team member, ask its owner to add your account in Firebase Console → Project settings → Users and permissions; project name/ID alone do not grant access. If you do not have permission, create a project in your own account and update `.firebaserc` to its project ID instead.

In the Firebase Console, confirm that **Realtime Database** is enabled, then copy its database URL from the Realtime Database page. Do not guess the URL from the project ID. The database starts empty; this setup does not copy data or credentials from another project.

Firebase Functions deployment requires a billing-enabled Firebase project (Blaze plan). From the repository root, sign in and verify the configured target:

```bash
firebase login
firebase use
```

The expected active project is `uni-swap-9d541`. The deployed API uses the Firebase Admin SDK; the supplied Realtime Database rules deny direct client reads and writes.

### 3. Run Locally

Install dependencies from the repository root:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Copy `backend/.env.example` to `backend/.env` and set `FIREBASE_DATABASE_URL` and a long random `JWT_SECRET`. Keep these values private. For local development against the Realtime Database emulator, start it from the repository root:

```bash
firebase emulators:start --only database
```

In another terminal, set `FIREBASE_DATABASE_EMULATOR_HOST=127.0.0.1:9000` and `GCLOUD_PROJECT=demo-campus-marketplace`, then start the backend:

```bash
npm --prefix backend run dev
```

In a third terminal, start the frontend:

```bash
npm --prefix frontend run dev
```

The frontend is at `http://localhost:5173`; its `/api` requests are proxied to the backend on port `5001`.

### 4. Deploy to Firebase

The Functions code needs the database URL as a project parameter. Create `backend/.env.<project-id>` (replace `<project-id>` with the exact ID shown in Firebase Console) with only this setting:

```env
FIREBASE_DATABASE_URL=https://YOUR_DATABASE_URL_FROM_FIREBASE_CONSOLE
```

This project-specific environment file is git-ignored. Do not put passwords, API keys, or service-account credentials in it. Set the JWT signing key and Cloudinary upload credentials as Functions secrets. Use values from accounts you control; Cloudinary is required by the existing image and payment-slip upload routes.

```bash
firebase functions:secrets:set JWT_SECRET
firebase functions:secrets:set CLOUDINARY_CLOUD_NAME
firebase functions:secrets:set CLOUDINARY_API_KEY
firebase functions:secrets:set CLOUDINARY_API_SECRET
firebase deploy --only database,functions,hosting
```

Enter a long, unique JWT secret when prompted. Firebase Hosting builds and serves the React app and rewrites `/api/**` to the Express API Cloud Function. The new Realtime Database starts empty; existing records are not migrated. Import data only from an authorized export, separately.

---

## 🔐 Environment Variables

Copy `backend/.env.example` to `backend/.env` for local development:

```env
# Local API server
PORT=5001
FIREBASE_DATABASE_URL=https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=7d

# Optional: required for image and payment-slip uploads
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> Never commit `.env` files, service-account keys, or other credentials. Firebase Functions uses the `JWT_SECRET` secret configured during deployment. Cloudinary credentials are still required for the existing image and payment-slip upload routes.

---

## 📡 API Endpoints

### 🔑 User Management  `/api/users`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login and receive JWT | Public |
| GET | `/me` | Get current user profile | 🔒 Private |
| PUT | `/me` | Update user profile | 🔒 Private |
| GET | `/` | Get all users | 🔒 Admin |

### 📦 Item Management  `/api/items`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all items | Public |
| GET | `/:id` | Get single item detail | Public |
| POST | `/` | Create a new item listing | 🔒 Private |
| PUT | `/:id` | Edit an item listing | 🔒 Private |
| DELETE | `/:id` | Delete an item listing | 🔒 Private |

### 💳 Transaction & Pricing  `/api/transactions`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create a new transaction | 🔒 Private |
| GET | `/my` | Get my transactions | 🔒 Private |
| POST | `/:id/payment` | Upload payment slip | 🔒 Private |
| PUT | `/:id/verify` | Verify payment (admin) | 🔒 Admin |
| GET | `/bestsellers` | Get top sellers | Public |

### 🛡 Trust & Security  `/api/trust`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/reviews` | Submit a review | 🔒 Private |
| GET | `/reviews/:sellerId` | Get seller reviews | Public |
| GET | `/score/:sellerId` | Get trust score | Public |
| GET | `/recommendations` | Get AI recommendations | 🔒 Private |
| POST | `/report` | Report suspicious activity | 🔒 Private |

---

## 👥 Team & Contributions

This project is developed as a group assignment for the **IT Project Management (ITPM)** module at **SLIIT**.

| Component | Contributor | GitHub |
|-----------|-------------|--------|
| User Management | Member 1 | [@username](https://github.com) |
| Item Management | Member 2 | [@username](https://github.com) |
| Transaction & Pricing | Member 3 | [@username](https://github.com) |
| Trust, Security & AI | Member 4 | [@username](https://github.com) |

> ✏️ **Update the table above** with your team members' real names and GitHub usernames.

### Branch Strategy

Each team member works on their own **feature branch** and submits pull requests to `main`:

```
main
├── feature/user-management
├── feature/item-management
├── feature/transaction-pricing
└── feature/trust-security-ai
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
   UNI SWAP Campus MarketPlace Team | SLIIT – ITPM 2026
</p>

---

## CampusCart public site

The frontend also includes the UniSwap – Campus Cart public business-plan showcase. The marketing site is the `/` route; existing marketplace sign-in, registration, item listings and role dashboards remain available at their existing routes.

### Frontend setup and checks

```bash
npm --prefix frontend install
npm --prefix frontend run dev
npm --prefix frontend run typecheck
npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build
npm --prefix frontend run format
```

### CampusCart folder map

```text
frontend/src/
├── components/
│   ├── brand/       # Logo, shared marketing layout, navigation and footer
│   └── ui/          # Reusable cards, sections, tabs, forms, tables and accordion
├── data/            # Typed brand, market, strategy, pricing and plan data
├── hooks/           # Theme and page metadata
├── lib/             # Currency, savings and loan calculators
├── pages/marketing/ # Lazy-loaded public site pages
└── styles/          # CampusCart design tokens and responsive styles
```

Edit site copy and market information in `frontend/src/data/site.ts`, pricing in `frontend/src/data/pricing.ts`, and plan values in `frontend/src/data/financials.ts`. Keep financial discrepancies visible and documented in [`DATA_NOTES.md`](./DATA_NOTES.md); avoid recalculating or silently reconciling source figures.

### Static deployment

The public site is a Vite static build. In Vercel or Netlify, set the project root to `frontend`, the build command to `npm run build`, and the output directory to `dist`. Configure a single-page-app rewrite to `/index.html` so direct visits and refreshes on routes such as `/financials` resolve to the React app. Marketing sign-up and contact forms are client-side demonstrations: submissions are held in memory for the current page session and are not sent to a service.
