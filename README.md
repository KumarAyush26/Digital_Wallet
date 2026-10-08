# 💳 PayFlow - Production-Ready Digital Wallet & Payments Platform (MERN Stack)

[![Stack](https://img.shields.io/badge/Stack-MongoDB%20|%20Express%20|%20React%20|%20Node.js-6366f1.svg)](#)
[![WebSockets](https://img.shields.io/badge/Real--Time-Socket.IO-emerald.svg)](#)
[![AI-Insights](https://img.shields.io/badge/FinTech-AI%20Insights%20%26%20Fraud%20Engine-purple.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)

PayFlow is an institutional-grade, full-stack Digital Wallet & Payments System built using **MongoDB, Express.js, React 19, Node.js**, and **Socket.IO**. It features **atomic balance updates**, **QR Code camera scan & pay**, a **heuristic fraud detection risk engine**, **AI-powered spending predictions & financial insights**, **monthly category budgeting**, **savings goal pots**, **PDF statement & receipt generators**, and an **Executive Admin Control Console**.

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Account Vault
- **JWT Bearer Token Authentication** with role-based access control (`user` and `admin`).
- **Bcrypt password hashing** with 10 salt rounds.
- **Unique UPI ID Auto-Generation** (e.g. `kumar@wallet`, `rahul@wallet`).
- **Simulated 2FA OTP & Biometric Passkey support**.
- **Forgot Password Flow** with 6-digit OTP reset.
- **Profile Customization** with avatars and contact settings.

### 2. ⚡ Atomic Wallet Operations & P2P Transfers
- **Guaranteed Consistency**: Atomic conditional balance updates (`$inc` with `$gte` balance condition) preventing double spending or negative balances.
- **Live Recipient Validation**: Instant payee lookup by UPI ID, Email, or Phone before transfer execution.
- **Simulated Top-up & Withdrawal Gateway**: Credit/Debit Cards, NetBanking portals, and instant bank account payouts.
- **Low-Balance Alerts**: Automated notifications when balance dips below ₹500.

### 3. 📷 QR Code Ecosystem
- **Dynamic QR Generator**: Encodes personal UPI endpoints (`wallet://pay?upi={id}&name={name}`) with custom amount pre-filling.
- **In-Browser Camera Scanner**: Real-time camera feed scanning via `html5-qrcode` + image upload + manual format parsing.
- **Instant Settlement**: Direct payee verification and 1-click confirmation with audio-visual confetti feedback.

### 4. 🧠 FinTech Intelligence: AI Insights & Fraud Detection
- **Heuristic Fraud Detection Risk Engine**:
  - Calculates real-time 0–100 risk scores and categorizes risk into `LOW`, `MEDIUM`, and `HIGH`.
  - Flags transactions exceeding 5x historical average amounts, rapid-fire velocity spikes, or unfamiliar high-value payees.
  - Automatically alerts the Admin Console for compliance audit.
- **AI Financial Insights Engine**:
  - Calculates Month-over-Month spending velocity (% increase or decrease).
  - Identifies category spending spikes (e.g. *"Food spending increased by 24% vs last month"*).
  - Analyzes weekend spending habits and calculates potential monthly savings.
  - Recommends actionable, customized budget limits.

### 5. 🎯 Category Budgeting & Savings Goal Pots
- **Monthly Category Limits**: Set caps for Food, Shopping, Bills, Transport, etc.
- **Threshold Alerts**: Visual progress bars with 80% cautionary alerts and 100% exceeded warning badges.
- **Savings Goal Pots**: Create dedicated goal funds (e.g., *Emergency Fund*, *New Laptop*, *Vacation*), deposit from wallet, or release funds back anytime.

### 6. 📊 Transaction Ledger & Digital Statements
- Search, filter by type (`Sent`, `Received`, `Top-up`, `Withdrawal`), category, status, and date range.
- **PDF Account Statement**: Formatted digital statement using `jspdf` and `jspdf-autotable`.
- **CSV Data Export**: One-click spreadsheet export for Excel and accounting tools.
- **Electronic Receipt**: Individual transaction receipt download in A5 format.

### 7. 🛡️ Executive Administrator Control Panel
- Platform KPI Metrics: Total registered users, total platform volume (₹), 24h volume, circulating balances, and active flagged risk items.
- User Management: Search users, toggle **Freeze / Unfreeze** accounts, delete malicious accounts.
- Transaction Risk Inspector: Inspect anomaly reasons, mark transactions as legitimate, or take compliance actions.

### 8. 🔔 Real-Time WebSockets (Socket.IO)
- Instant push alerts to payer and payee upon transfer completion.
- Interactive notification center with unread counters and persistent history.

---

## 🏗️ Architecture & Folder Structure

```
Digital_Wallet/
├── server/
│   ├── server.js                     # Express & Socket.IO initialization
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                 # MongoDB connection with MongoMemoryServer fallback
│   │   │   └── constants.js          # System constants (Categories, Risk Levels, Types)
│   │   ├── models/
│   │   │   ├── User.js               # User authentication model with bcrypt
│   │   │   ├── Wallet.js             # Ledger balances and account numbers
│   │   │   ├── Transaction.js        # Immutable transaction audit trail
│   │   │   ├── Budget.js             # Monthly category limit guardrails
│   │   │   ├── SavingsGoal.js        # Target goal savings pots
│   │   │   ├── Contact.js            # Saved trusted payee contacts
│   │   │   └── Notification.js       # In-app notifications
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification middleware
│   │   │   ├── admin.js              # Admin authorization guard
│   │   │   ├── rateLimiter.js        # Express rate limiting
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   ├── services/
│   │   │   ├── socketService.js      # WebSocket room broadcasts
│   │   │   ├── fraudDetectionService.js # 0-100 Risk evaluation engine
│   │   │   └── aiInsightsService.js  # Smart spend velocity & anomaly engine
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── walletController.js
│   │   │   ├── transactionController.js
│   │   │   ├── qrController.js
│   │   │   ├── budgetController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── contactController.js
│   │   │   ├── notificationController.js
│   │   │   └── adminController.js
│   │   ├── routes/                   # Modular Express routers
│   │   └── utils/
│   │       ├── idGenerator.js        # TXN and UPI ID generators
│   │       └── seed.js               # Demo dataset seeder
│   └── test-api.js                   # Automated end-to-end API test suite
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                   # Routes and application shell
│       ├── index.css                 # Custom design tokens & gradients
│       ├── context/                  # Auth, Wallet, Socket & Theme contexts
│       ├── services/                 # Axios API clients & PDF/CSV exporters
│       ├── components/
│       │   ├── common/               # Navbar, Sidebar, Modal, Badge, Dropdown
│       │   ├── dashboard/            # BalanceCard, QuickActions, MetricsGrid, Contacts
│       │   ├── wallet/               # AddMoney, Withdraw, SendMoney, Request modals
│       │   ├── qr/                   # MyQrCode, ScanQrModal
│       │   ├── transactions/         # DetailsModal, Export dropdowns
│       │   ├── analytics/            # IncomeExpenseChart, CategoryDonut, AiInsights
│       │   ├── budget/               # BudgetManager, SavingsGoalList
│       │   └── admin/                # RiskDetailsModal
│       ├── pages/                    # Landing, Auth, Dashboard, Transfer, Analytics, etc.
│       └── utils/                    # Currency formatters & helpers
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- *(Optional)* Local MongoDB or MongoDB Atlas connection URI (If omitted, the server automatically starts an embedded in-memory MongoDB instance with zero configuration required).

### 1. Clone & Install Dependencies

```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 2. Configure Environment Variables

**Server (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_digital_wallet_production_2026
JWT_EXPIRES_IN=7d
MONGODB_URI=
CLIENT_URL=http://localhost:5173
```
*(Leave `MONGODB_URI` blank to automatically run the embedded high-speed MongoMemoryServer).*

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Run Application

**Start the Backend Server:**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Start the React Client:**
```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

---

## 🔑 Pre-Seeded Demo Accounts

The database comes pre-seeded with rich realistic transaction records, budgets, and savings goals:

| Account Name | Email / UPI ID | Password | Role | Balance |
|---|---|---|---|---|
| **Super Admin** | `admin@wallet` | `admin123` | `admin` | ₹5,00,000 |
| **Kumar Sharma** | `kumar@gmail.com` / `kumar@wallet` | `kumar123` | `user` | ₹12,450 |
| **Rahul Verma** | `rahul@gmail.com` / `rahul@wallet` | `rahul123` | `user` | ₹5,000 |
| **Amit Patel** | `amit@gmail.com` / `amit@wallet` | `amit123` | `user` | ₹8,500 |
| **Priya Nair** | `priya@gmail.com` / `priya@wallet` | `priya123` | `user` | ₹15,000 |
| **Suspicious User** | `suspicious@wallet` | `test1234` | `user` | ₹1,00,000 (Flagged) |

*Tip: On the Login screen, click any of the 1-Click Demo buttons to log in instantly!*

---

## 📡 API Reference Overview

### Authentication
- `POST /api/auth/register` - Create user, generate UPI ID, and credit ₹1,000 bonus.
- `POST /api/auth/login` - Sign in via email/UPI and receive signed JWT.
- `GET /api/auth/profile` - Fetch current authenticated user.
- `PUT /api/auth/profile` - Update profile, password, 2FA toggle, or avatar.
- `POST /api/auth/forgot-password` - Request simulated OTP code.
- `POST /api/auth/reset-password` - Reset password with verified OTP.

### Wallet & Transfers
- `GET /api/wallet` - Fetch wallet balance and account metadata.
- `POST /api/wallet/validate-recipient` - Live lookup by UPI ID, Email, or Phone.
- `POST /api/wallet/add-money` - Simulated payment gateway top-up.
- `POST /api/wallet/withdraw` - Simulated payout to bank account or UPI.
- `POST /api/wallet/transfer` - Atomic peer-to-peer balance transfer.

### QR Code Payments
- `GET /api/qr/payload` - Generate personal QR payload.
- `POST /api/qr/verify` - Parse and validate scanned QR payload.
- `POST /api/qr/pay` - Confirm and execute QR payment.

### Transactions & Statements
- `GET /api/transactions` - Filtered, paginated, and searchable transaction history.
- `GET /api/transactions/:id` - Full transaction receipt metadata.
- `POST /api/transactions/request-money` - Send payment request alert to another user.

### Analytics & AI Insights
- `GET /api/analytics/overview` - Inflow, outflow, and top frequent payees.
- `GET /api/analytics/monthly-trends` - 6-month historical income vs expense comparison.
- `GET /api/analytics/category-breakdown` - Monthly expense distribution by category.
- `GET /api/analytics/ai-insights` - Month-over-Month spend velocity, category spikes, weekend habits, and AI recommendations.

### Budgets & Savings Goals
- `GET /api/budgets` - Active monthly budgets with live spending calculations.
- `POST /api/budgets` - Set/update category budget limit.
- `GET /api/budgets/goals` - Fetch savings goal pots.
- `POST /api/budgets/goals` - Create new savings goal.
- `POST /api/budgets/goals/:id/contribute` - Deposit funds into goal.
- `POST /api/budgets/goals/:id/withdraw` - Release funds from goal to wallet.

### Administration
- `GET /api/admin/stats` - Platform executive KPI metrics.
- `GET /api/admin/users` - Paginated user management table.
- `PATCH /api/admin/users/:id/freeze` - Freeze or unfreeze user account.
- `DELETE /api/admin/users/:id` - Delete user account and associated wallet.
- `GET /api/admin/transactions` - All platform transactions with risk level filter.
- `PATCH /api/admin/transactions/:id/review` - Review and approve flagged transactions.

---

## 🧪 Running Automated Tests

Run the built-in end-to-end integration test suite:

```bash
cd server
node test-api.js
```

---

## 🌐 Production Deployment Guide

### Frontend Deployment (Vercel)
1. Push the repository to GitHub.
2. In Vercel, import the repository and set **Root Directory** to `client`.
3. Set Environment Variables:
   - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://payflow-api.onrender.com/api`)
   - `VITE_SOCKET_URL`: Your deployed backend server URL (e.g. `https://payflow-api.onrender.com`)
4. Build Command: `npm run build` | Output Directory: `dist`

### Backend Deployment (Render / Railway)
1. In Render, create a new **Web Service** and set **Root Directory** to `server`.
2. Build Command: `npm install` | Start Command: `node server.js`
3. Add Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: Secure 64-character secret
   - `MONGODB_URI`: MongoDB Atlas cluster connection string
   - `CLIENT_URL`: Your Vercel frontend URL

### Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User and whitelist your deployment IP (`0.0.0.0/0` for cloud hosts).
3. Copy the SRV connection string into `MONGODB_URI`.

---

## 📄 License
This project is licensed under the MIT License.
