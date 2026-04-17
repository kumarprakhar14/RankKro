<div align="center">

# RankKro

**India's most trusted mock test platform for SSC, Railway & UPSC aspirants.**

Mock Do. Rank Kro.

[![Live](https://img.shields.io/badge/Live-rankkro.pages.dev-FF6B00?style=for-the-badge&logo=cloudflare&logoColor=white)](https://rankkro.pages.dev)
[![License](https://img.shields.io/badge/License-Proprietary-1A5DC8?style=for-the-badge)](./LICENSE)
[![Stack](https://img.shields.io/badge/Stack-MERN-22C55E?style=for-the-badge&logo=mongodb&logoColor=white)](#tech-stack)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [User](#user)
  - [Tests (Student)](#tests-student)
  - [Payments](#payments)
  - [Admin — User Management](#admin--user-management)
  - [Admin — Question Management](#admin--question-management)
  - [Admin — Test Management](#admin--test-management)
  - [Admin — Analytics](#admin--analytics)
- [Authentication Flow](#authentication-flow)
- [Subscription Model](#subscription-model)
- [Known Issues](#known-issues)
- [Contributing](#contributing)

---

## Overview

**RankKro** is a full-stack, production-grade SaaS platform built for competitive exam aspirants in India. It provides exam-pattern mock tests for **SSC CGL, RRB NTPC, and UPSC**, with a real exam-like interface — live timer, section-wise navigation, question palette, negative marking, and instant results with All India Rank computation.

The platform is live at **[rankkro.pages.dev](https://rankkro.pages.dev)** and is operated by **Bharatrise Ventures Pvt. Ltd.**

---

## Features

| Feature | Description |
|---|---|
| 🧪 **Exam-Pattern Mock Tests** | Full-length tests with sections, question palettes, and a live countdown timer |
| 📊 **Section-wise Analysis** | Detailed post-test breakdown by subject with accuracy and score data |
| 🏆 **All India Rank** | Real-time rank computed across all test-takers |
| 🔒 **JWT Auth + Refresh Tokens** | Stateless, secure authentication with automatic token rotation via HttpOnly cookies |
| 💳 **Razorpay Payments** | PCI-compliant payment integration for upgrading to the Premium plan |
| 📧 **Transactional Emails** | Inngest-powered async email delivery for signup, password reset, and subscription events |
| 🛡️ **Admin Dashboard** | Full content management: create tests, manage questions, update user plans, view analytics |
| 📱 **Responsive Design** | Mobile-first UI built with Tailwind CSS and Framer Motion |
| 🔑 **Password Reset** | Token-based secure forgot/reset password flow with expiring links |
| 🚀 **PYQ Support** | Flag-able Previous Year Question papers as a distinct content type |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, React Router v6, Framer Motion |
| **Styling** | Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express 5, ES Modules |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (access + refresh tokens), Argon2 password hashing |
| **Payments** | Razorpay |
| **Async Jobs** | Inngest (event-driven background functions) |
| **Email** | Nodemailer, Mailtrap (SMTP) |
| **Security** | Helmet, CORS, Cookie-Parser |
| **Dev Tooling** | Nodemon, ESLint |

---

## Project Structure

```
RankKro/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets (SVG logos, favicon)
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Admin layout and panel components
│   │   │   └── landing/        # Landing page sections (Navbar, Hero, Footer, etc.)
│   │   ├── context/            # React Context (AuthContext)
│   │   ├── lib/                # API client (api.ts) with auto token-refresh logic
│   │   ├── pages/              # Route-level page components
│   │   │   ├── admin/          # Admin pages (Dashboard, Users, Questions, Tests)
│   │   │   ├── Exam.tsx        # Live exam session interface
│   │   │   ├── MockTest.tsx    # Test listing page
│   │   │   ├── Pricing.tsx     # Subscription / Razorpay page
│   │   │   ├── Result.tsx      # Post-exam results and analysis
│   │   │   └── ...
│   │   └── main.tsx
│   └── index.html
│
└── server/                     # Node.js + Express backend
    ├── src/
    │   ├── controllers/        # Route handler logic
    │   ├── middlewares/        # Auth, admin guard, premium check
    │   ├── models/             # Mongoose schemas
    │   ├── routes/             # Express routers
    │   ├── services/           # Passport.js
    │   ├── inngest/            # Background event functions (email, etc.)
    │   ├── utils/              # Cron jobs, helpers
    │   ├── validations/        # Zod schemas
    │   ├── app.js              # Express app setup
    │   └── server.js           # Entry point
    ├── .env.example
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js `>= 18.x`
- MongoDB Atlas account (or local MongoDB instance)
- Razorpay account (for payment integration)
- SMTP credentials (Mailtrap recommended for development)
- Inngest account (for background jobs)

---

### Environment Variables

#### Server (`server/.env`)

Copy `server/.env.example` and fill in the values:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rankkro

# JWT Secrets (use long, random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# CORS
API_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
REDIRECT_URL=http://localhost:5173

# Email (SMTP)
EMAIL_FROM=no-reply@rankkro.com
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass

# Inngest (background jobs)
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

#### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
```

---

### Running Locally

**1. Clone the repository**

```bash
git clone https://github.com/bharatrise/rankkro.git
cd rankkro
```

**2. Start the backend server**

```bash
cd server
npm install
npm run dev        # Starts with nodemon on port 5000
```

**3. Start the frontend client**

```bash
cd client
npm install
npm run dev        # Starts Vite dev server on port 5173
```

**4. (Optional) Seed the database**

```bash
cd server
npm run seed       # Runs src/scripts/seedQuestions.js
```

---

## API Reference

**Base URL:** `http://localhost:5000/api`  
**Auth:** Bearer token in `Authorization` header (`Authorization: Bearer <access_token>`)  
**Content-Type:** `application/json`

All protected endpoints return `401 Unauthorized` when the token is missing or expired. Use `POST /api/auth/refresh` to obtain a new access token using the HttpOnly refresh-token cookie.

---

### Authentication

All auth routes are **public** (no token required).

#### `POST /api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "name": "Ravi Sharma",
  "email": "ravi@example.com",
  "password": "SecurePass@123"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "Ravi Sharma",
      "email": "ravi@example.com",
      "plan": "FREE",
      "role": "USER"
    },
    "accessToken": "<jwt>"
  },
  "message": "User registered successfully"
}
```

---

#### `POST /api/auth/login`

Authenticate and receive tokens.

**Request Body:**

```json
{
  "email": "ravi@example.com",
  "password": "SecurePass@123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "user": { "...": "..." },
    "accessToken": "<jwt>"
  },
  "message": "Login successful"
}
```

> Refresh token is set as an HttpOnly cookie (`rankro_refresh_token`).

---

#### `POST /api/auth/logout`

Invalidate the session. Clears the refresh token cookie.

**Auth Required:** No

**Response `200`:**

```json
{ "success": true, "message": "Logged out successfully" }
```

---

#### `POST /api/auth/refresh`

Rotate access token using the HttpOnly refresh token cookie.

**Auth Required:** No (cookie is sent automatically by the browser)

**Response `200`:**

```json
{
  "success": true,
  "data": { "accessToken": "<new_jwt>" }
}
```

---

#### `POST /api/auth/forgot-password`

Sends a password reset email to the user.

**Request Body:**

```json
{ "email": "ravi@example.com" }
```

---

#### `GET /api/auth/reset-password/:token`

Validates a reset token before showing the reset form.

| Param | Type | Description |
|---|---|---|
| `token` | string | The reset token from the email link |

---

#### `POST /api/auth/reset-password/:token`

Resets the password using a valid token.

**Request Body:**

```json
{ "password": "NewSecurePass@456" }
```

---

### User

#### `GET /api/me`

🔒 Returns the authenticated user's profile.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Ravi Sharma",
    "email": "ravi@example.com",
    "plan": "FREE",
    "role": "USER",
    "isActive": true
  },
  "message": "User profile retrieved"
}
```

---

#### `GET /api/user/attempts`

🔒 Returns the authenticated user's test attempt history and performance stats.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "_id": "...",
        "test_id": "...",
        "status": "SUBMITTED",
        "final_score": 148.5,
        "started_at": "2026-04-15T10:00:00.000Z"
      }
    ],
    "stats": {
      "totalAttempts": 5,
      "averageScore": 132.4,
      "bestScore": 164
    }
  },
  "message": "Attempts retrieved successfully"
}
```

---

### Tests (Student)

All test routes are **🔒 protected**. Premium tests additionally require an active Premium plan.

#### `GET /api/tests`

List all available mock tests with optional filters.

**Query Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `exam_type` | string | e.g. `SSC CGL`, `RRB NTPC` |
| `status` | string | `FREE` or `PREMIUM` |
| `is_pyq` | boolean | Filter for previous year papers |
| `page` | number | Default: `1` |
| `limit` | number | Default: `20` |

**Example:**

```
GET /api/tests?exam_type=SSC%20CGL&status=FREE&page=1&limit=10
```

---

#### `POST /api/tests/:id/start`

🔒 + 💎 **Premium guard** for non-free tests. Initializes a new exam session and returns all questions organized by section.

| Param | Type | Description |
|---|---|---|
| `id` | string | Human-readable test ID (e.g. `ssc-cgl-07`) |

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "attemptId": "...",
    "test": { "title": "SSC CGL Mock Test 7", "duration_minutes": 60, "...": "..." },
    "sections": [
      {
        "sectionId": "...",
        "name": "General Awareness",
        "questions": [
          {
            "_id": "q-ga-001",
            "text": "Which Article of the Constitution abolishes untouchability?",
            "option_a": "Article 12",
            "option_b": "Article 17",
            "option_c": "Article 21",
            "option_d": "Article 32",
            "marks": 2,
            "negative_marks": 0.5
          }
        ]
      }
    ]
  }
}
```

> **Note:** The `correct_option` field is **never** sent to the client during an active session.

---

#### `POST /api/tests/:id/submit`

🔒 Submit answers for a test session. Calculates score, applies negative marking, and stores the result.

| Param | Type | Description |
|---|---|---|
| `id` | string | Human-readable test ID |

**Request Body:**

```json
{
  "attemptId": "...",
  "answers": {
    "q-ga-001": 1,
    "q-ga-002": 3,
    "q-ga-003": null
  }
}
```

> Values are 0-indexed option numbers (0=A, 1=B, 2=C, 3=D). `null` means unanswered.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "attemptId": "...",
    "finalScore": 148.5,
    "status": "SUBMITTED"
  },
  "message": "Test submitted successfully"
}
```

---

#### `GET /api/tests/:id/result/:attemptId`

🔒 Retrieve the full result and analysis for a completed attempt.

| Param | Type | Description |
|---|---|---|
| `id` | string | Human-readable test ID |
| `attemptId` | string | MongoDB `_id` of the attempt |

---

### Payments

All payment routes are **🔒 protected**.

#### `POST /api/payments/create-order`

Creates a Razorpay order for the Premium plan purchase.

**Request Body:**

```json
{ "amount": 1 }
```

**Response `200`:**

```json
{
  "success": true,
  "order": {
    "id": "order_xxxxxxxxxxxxxxxx",
    "amount": 100,
    "currency": "INR"
  }
}
```

---

#### `POST /api/payments/verify-payment`

Verifies a Razorpay payment signature server-side and upgrades the user's plan to `PREMIUM` on success.

**Request Body:**

```json
{
  "razorpay_order_id": "order_xxxxxxxxxxxxxxxx",
  "razorpay_payment_id": "pay_xxxxxxxxxxxxxxxx",
  "razorpay_signature": "..."
}
```

**Response `200`:**

```json
{
  "success": true,
  "message": "Payment verified. Welcome to Premium!"
}
```

---

### Admin — User Management

All admin routes require **🔒 JWT auth** + **🛡️ ADMIN role**.

#### `GET /api/admin/users`

Paginated list of all registered users.

**Query Parameters:** `page` (default: 1), `limit` (default: 20)

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "Ravi Sharma",
        "email": "ravi@example.com",
        "plan": "PREMIUM",
        "role": "USER",
        "isActive": true,
        "createdAt": "2026-03-26T17:50:17.779Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
  },
  "message": "Users retrieved successfully"
}
```

---

#### `GET /api/admin/users/:userId`

Full detail for a specific user including attempt history and aggregate performance stats.

| Param | Type | Description |
|---|---|---|
| `userId` | string | MongoDB `_id` of the user |

---

#### `PATCH /api/admin/users/:userId/plan`

Update a user's subscription plan.

**Request Body:**

```json
{ "plan": "premium" }
```

| Field | Accepted Values |
|---|---|
| `plan` | `"premium"` or `"free"` (case-insensitive) |

---

### Admin — Question Management

#### `GET /api/admin/questions`

Paginated, searchable list of all questions.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Full-text search on question text |
| `subject` | string | e.g. `Geography`, `Vocabulary`, `Reasoning` |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |

---

#### `POST /api/admin/questions`

Create a new standalone question.

**Request Body:**

```json
{
  "id": "q-ga-001",
  "text": "Which Article of the Constitution abolishes untouchability?",
  "option_a": "Article 12",
  "option_b": "Article 17",
  "option_c": "Article 21",
  "option_d": "Article 32",
  "correct_option": 1,
  "explanation": "Article 17 of the Indian Constitution abolishes untouchability.",
  "marks": 2,
  "negative_marks": 0.5,
  "subject": "Polity",
  "difficulty": "Easy"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Human-readable ID. Convention: `q-{subject-prefix}-{number}` (e.g. `q-ga-001`, `q-re-042`) |
| `text` | string | Yes | Question text |
| `option_a`–`option_d` | string | Yes | Four answer choices |
| `correct_option` | number | Yes | 0-indexed correct answer (0=A, 1=B, 2=C, 3=D) |
| `explanation` | string | Yes | Explanation shown after submission |
| `marks` | number | Yes | Marks for a correct answer |
| `negative_marks` | number | Yes | Marks deducted for a wrong answer |
| `subject` | string | Yes | Subject tag |
| `difficulty` | string | Yes | `Easy`, `Medium`, or `Hard` |

---

#### `PATCH /api/admin/questions/:questionId`

Partially update an existing question. All fields are optional — send only what needs to change.

| Param | Type | Description |
|---|---|---|
| `questionId` | string | The `_id` of the question (e.g. `q-ga-001`) |

**Example Request Body:**

```json
{ "difficulty": "Medium", "negative_marks": 0.25 }
```

---

### Admin — Test Management

#### `GET /api/admin/tests`

Paginated list of all tests.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `exam_type` | string | e.g. `ssc cgl`, `rrb ntpc` |
| `status` | string | `free` or `premium` |
| `page` | number | Default: 1 |
| `limit` | number | Default: 20 |

---

#### `POST /api/admin/tests`

Create a new test with its sections in a single request.

**Request Body:**

```json
{
  "id": "ssc-cgl-15",
  "title": "SSC CGL (Tier I) Mock Test 15",
  "exam_type": "SSC CGL",
  "duration_minutes": 60,
  "difficulty": "MEDIUM",
  "status": "FREE",
  "is_pyq": false,
  "initial_sections": [],
  "sections": [
    { "name": "General Awareness" },
    { "name": "Quantitative Aptitude" },
    { "name": "Reasoning" },
    { "name": "English" }
  ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Human-readable test ID (e.g. `ssc-cgl-15`) |
| `title` | string | Yes | Display title |
| `exam_type` | string | Yes | `SSC CGL`, `RRB NTPC`, `UPSC`, etc. |
| `duration_minutes` | number | Yes | Duration in minutes |
| `difficulty` | string | Yes | `EASY`, `MEDIUM`, or `HARD` |
| `status` | string | Yes | `FREE` or `PREMIUM` |
| `is_pyq` | boolean | Yes | `true` if this is a Previous Year Paper |
| `sections` | array | Yes | Array of `{ name: string }` objects |

---

#### `GET /api/admin/tests/:testId`

Full detail for a specific test, including its sections.

| Param | Type | Description |
|---|---|---|
| `testId` | string | MongoDB `_id` of the test |

---

#### `PATCH /api/admin/tests/:testId`

Update test metadata. All fields optional. `attempted_count` is **read-only** and is ignored even if sent.

**Example Request Body:**

```json
{ "status": "PREMIUM", "is_pyq": true }
```

---

#### `POST /api/admin/tests/:testId/sections/:sectionId/questions`

Bulk-assign questions to a specific section.

| Param | Type | Description |
|---|---|---|
| `testId` | string | MongoDB `_id` of the test |
| `sectionId` | string | MongoDB `_id` of the section |

**Request Body:**

```json
{
  "questions": [
    { "question_id": "q-ga-001", "question_order": 1 },
    { "question_id": "q-ga-002", "question_order": 2 },
    { "question_id": "q-ga-003", "question_order": 3 }
  ]
}
```

---

### Admin — Analytics

#### `GET /api/admin/analytics`

Platform-wide summary dashboard.

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "users": {
      "total": 5,
      "premium": 3,
      "free": 2,
      "recentSignups": 0
    },
    "content": {
      "totalTests": 14,
      "totalQuestions": 1156
    },
    "attempts": {
      "total": 3,
      "submitted": 0,
      "inProgress": 3
    },
    "topTests": []
  },
  "message": "Analytics retrieved successfully"
}
```

---

## Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│  Registration / Login                                         │
│  → Server issues short-lived Access Token (JWT, 15 min)       │
│  → Server sets long-lived Refresh Token (HttpOnly cookie)     │
│                                                              │
│  Client stores access token in localStorage                  │
│                                                              │
│  On 401 → client calls POST /api/auth/refresh automatically  │
│         → new access token is issued via cookie exchange     │
│                                                              │
│  On logout → refresh token cookie is cleared server-side     │
└──────────────────────────────────────────────────────────────┘
```

---

## Subscription Model

| Plan | Price | Access |
|---|---|---|
| **FREE** | ₹0 | Access to all FREE-tagged mock tests |
| **PREMIUM** | ₹1 (lifetime) | Unlimited access to all tests including PREMIUM-tagged content |

Payment is processed via Razorpay. On successful verification, the user's `plan` is upgraded to `PREMIUM` in the database and their local session is updated instantly without requiring a re-login.

---

## Known Issues

| Endpoint | Issue | Severity |
|---|---|---|
| `POST /api/admin/tests` | No uniqueness check on the `id` field — duplicate IDs can be silently created | ⚠️ Medium |
| `PATCH /api/admin/tests/:testId` | `attempted_count` is silently ignored if included in the request body | ℹ️ By Design |
| All admin endpoints | Edge-case error handling not fully tested | ⚠️ Pending |
| Test-section-question linking | Aggregation consistency between test sections and question assignment not fully validated | ⁉️ Critical |

---

## Contributing

This repository is currently **closed-source**. For bug reports, partnership enquiries, or content contributions, please contact:

**Bharatrise Ventures Pvt. Ltd.**  
📧 [support@rankkro.com](mailto:support@rankkro.com)

---

<div align="center">

© 2026 Bharatrise Ventures Pvt. Ltd. · All rights reserved.  
Built with ❤️ for India's competitive exam aspirants.

</div>
