# RankKro API Documentation
 
**Base URL:** `http://localhost:5000/api`  
**Auth:** JWT (Access Token in `Authorization: Bearer <token>` header)  
**Session:** HttpOnly Refresh Token cookie (`refreshToken`)  
**Stack:** Node.js · Express · MongoDB · JWT
 
 ---
 
 ## Table of Contents
 
 - [Authentication](#authentication)
 - [User Profile & History](#user-profile--history)
 - [Tests & Exam Engine](#tests--exam-engine)
 - [Payments & Subscription](#payments--subscription)
 - [User Management (Admin)](#user-management-admin)
 - [Question Management (Admin)](#question-management-admin)
 - [Test Management (Admin)](#test-management-admin)
 - [Analytics (Admin)](#analytics-admin)
 - [Known Issues & Notes](#known-issues--notes)
 
 ---
 
 ## Authentication
 
 ### `POST /api/auth/register`
 
 Register a new user account.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 {
   "name": "Ravi Sharma",
   "email": "ravi@example.com",
   "password": "SecurePass@123",
   "phone": "9876543210"
 }
 ```
 
 **Sample Response (201):**
 
 ```json
 {
   "success": true,
   "data": {
     "_id": "...",
     "name": "Ravi Sharma",
     "email": "ravi@example.com",
     "role": "USER",
     "plan": "FREE"
   },
   "message": "User registered successfully"
 }
 ```
 
 ---
 
 ### `POST /api/auth/login`
 
 Authenticate and receive access token. Sets HttpOnly `refreshToken` cookie.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 {
   "email": "ravi@example.com",
   "password": "SecurePass@123"
 }
 ```
 
 **Sample Response (200):**
 
 ```json
 {
   "success": true,
   "data": {
     "accessToken": "ey...",
     "user": { "...": "..." }
   },
   "message": "Login successful"
 }
 ```
 
 ---
 
 ### `POST /api/auth/refresh`
 
 Rotate access token using the HttpOnly refresh token cookie.
 
 **Status:** ✅ Working
 
 **Sample Response (200):**
 
 ```json
 {
   "success": true,
   "data": {
     "accessToken": "ey...",
     "user": { "...": "..." }
   },
   "message": "New access token issued"
 }
 ```
 
 ---
 
 ### `POST /api/auth/forgot-password`
 
 Sends a password reset link to the user's email.
 
 **Request Body:**
 
 ```json
 { "email": "ravi@example.com" }
 ```
 
 ---
 
 ### `POST /api/auth/reset-password/:token`
 
 Updates the user's password using a valid reset token.
 
 **Request Body:**
 
 ```json
 { "newPassword": "NewSecurePass@456" }
 ```
 
 ---
 
 ## User Profile & History
 
 ### `GET /api/user/profile`
 
 Retrieves the full profile of the authenticated user.
 
 **Status:** ✅ Working
 
 **Sample Response:**
 
 ```json
 {
   "success": true,
   "data": {
     "_id": "...",
     "name": "Ravi Sharma",
     "email": "ravi@example.com",
     "plan": "FREE",
     "phone": "9876543210"
   }
 }
 ```
 
 ---
 
 ### `PATCH /api/user/profile`
 
 Updates non-sensitive profile fields (name, phone).
 
 **Request Body:**
 
 ```json
 {
   "name": "Ravi Kumar",
   "phone": "9999999999"
 }
 ```
 
 ---
 
 ### `PATCH /api/user/email`
 
 Updates the user's email address. Requires current password confirmation.
 
 **Request Body:**
 
 ```json
 {
   "newEmail": "ravi.new@example.com",
   "currentPassword": "SecurePass@123"
 }
 ```
 
 ---
 
 ### `PATCH /api/user/password`
 
 Changes account password. Invalidates all other active sessions (clears refresh tokens).
 
 **Request Body:**
 
 ```json
 {
   "currentPassword": "SecurePass@123",
   "newPassword": "NewSecurePass@456"
 }
 ```
 
 ---
 
 ### `GET /api/user/attempts`
 
 Retrieves paginated attempt history and aggregate performance stats.
 
 **Query Parameters:** `page`, `limit`
 
 **Sample Response:**
 
 ```json
 {
   "success": true,
   "data": {
     "attempts": [
       {
         "_id": "...",
         "testId": { "title": "SSC CGL Mock 1", "...": "..." },
         "status": "SUBMITTED",
         "finalScore": 148.5,
         "startedAt": "2026-04-15T10:00:00.000Z"
       }
     ],
     "stats": {
       "totalAttempts": 5,
       "averageScore": 132.4,
       "bestScore": 164
     }
   }
 }
 ```
 
 ---
 
 ### `GET /api/user/transactions`
 
 Retrieves cursor-paginated transaction history for the user.
 
 **Query Parameters:** `cursor` (last payment `_id`), `limit`
 
 **Sample Response:**
 
 ```json
 {
   "success": true,
   "data": {
     "transactions": [
       {
         "_id": "...",
         "amount": 499,
         "status": "SUCCESS",
         "paymentId": "pay_xxxxx",
         "createdAt": "..."
       }
     ],
     "pagination": { "nextCursor": "...", "hasMore": true }
   }
 }
 ```
 
 ---
 
 ## Tests & Exam Engine
 
 ### `GET /api/tests`
 
 List available tests with filters.
 
 **Status:** ✅ Working
 
 **Query Parameters:** `category`, `difficulty`, `status`, `page`, `limit`
 
 ---
 
 ### `POST /api/tests/:id/start`
 
 Initializes a test attempt and returns questions Organized by section.
 
 **Status:** ✅ Working
 
 **Note:** `correctOption` and `explanation` are hidden until submission.
 
 ---
 
 ### `POST /api/tests/:id/submit`
 
 Submits answers for a test attempt and calculates final score.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 {
   "attemptId": "...",
   "answers": [
     { "questionId": "...", "selectedOption": 1 },
     { "questionId": "...", "selectedOption": null }
   ]
 }
 ```
 
 ---
 
 ### `GET /api/tests/:id/result/:attemptId`
 
 Returns full attempt result, revealing correct answers and explanations.
 
 **Status:** ✅ Working
 
 ---
 
 ## Payments & Subscription
 
 ### `POST /api/payments/create-order`
 
 Creates a Razorpay order.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 { "amount": 1 }
 ```
 
 ---
 
 ### `POST /api/payments/verify-payment`
 
 Verifies signature and upgrades user to **PREMIUM** plan.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 {
   "razorpay_order_id": "...",
   "razorpay_payment_id": "...",
   "razorpay_signature": "..."
 }
 ```
 
 ---
 
 ## User Management (Admin)
 
 ### `GET /api/admin/users`
 
 Retrieves a paginated list of all registered users.
 
 **Status:** ✅ Working
 
 **Query Parameters:** `page`, `limit`
 
 **Sample Response:**
 
 ```json
 {
   "success": true,
   "data": {
     "users": [
       {
         "_id": "...",
         "name": "kundan kumar",
         "email": "kundan906420@gmail.com",
         "plan": "PREMIUM",
         "role": "USER",
         "isActive": true
       }
     ],
     "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
   }
 }
 ```
 
 ---
 
 ### `GET /api/admin/users/:userId`
 
 Retrieves full details for a specific user, including their attempt history and aggregate stats.
 
 **Status:** ✅ Working
 
 ---
 
 ### `PATCH /api/admin/users/:userId/plan`
 
 Updates the subscription plan for a specific user.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 { "plan": "premium" }
 ```
 
 ---
 
 ## Question Management (Admin)
 
 ### `GET /api/admin/questions`
 
 Retrieves a paginated, filterable list of questions.
 
 **Status:** ✅ Working
 
 **Query Parameters:** `search`, `subject`, `page`, `limit`
 
 ---
 
 ### `POST /api/admin/questions`
 
 Creates a new standalone question.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 {
   "id": "q-ga-001",
   "text": "What is the capital of Haryana??",
   "option_a": "Chandigarh",
   "option_b": "Gurgaon",
   "option_c": "Rohtak",
   "option_d": "Ambala",
   "correct_option": 0,
   "explanation": "Chandigarh is the capital.",
   "marks": 2,
   "negative_marks": 0.5,
   "subject": "Geography",
   "difficulty": "Easy"
 }
 ```
 
 ---
 
 ### `PATCH /api/admin/questions/:questionId`
 
 Updates one or more fields of an existing question.
 
 **Status:** ✅ Working
 
 ---
 
 ## Test Management (Admin)
 
 ### `GET /api/admin/tests`
 
 Retrieves a paginated, filterable list of tests.
 
 **Status:** ✅ Working
 
 **Query Parameters:** `exam_type`, `status`, `page`, `limit`
 
 ---
 
 ### `POST /api/admin/tests`
 
 Creates a new test along with its sections.
 
 **Status:** ✅ Working
 
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
   "sections": [
     { "name": "General Awareness" },
     { "name": "English" }
   ]
 }
 ```
 
 ---
 
 ### `GET /api/admin/tests/:testId`
 
 Retrieves full detail for a specific test, including its sections.
 
 **Status:** ✅ Working
 
 ---
 
 ### `PATCH /api/admin/tests/:testId`
 
 Updates metadata fields for an existing test.
 
 **Status:** ✅ Working
 
 ---
 
 ### `POST /api/admin/tests/:testId/sections/:sectionId/questions`
 
 Bulk-assigns questions to a specific section within a test.
 
 **Status:** ✅ Working
 
 **Request Body:**
 
 ```json
 {
   "questions": [
     { "question_id": "q-ga-001", "question_order": 1 },
     { "question_id": "q-ga-002", "question_order": 2 }
   ]
 }
 ```
 
 ---
 
 ## Analytics (Admin)
 
 ### `GET /api/admin/analytics`
 
 Returns a platform-wide summary of users, content, and test attempts.
 
 **Status:** ✅ Working
 
 ---
 
 ## Known Issues & Notes
 
 | Endpoint | Issue | Severity |
 |----------|-------|----------|
 | `POST /api/admin/tests` | No uniqueness check on the `id` field — duplicate `id` values can be created without error | ⚠️ Medium |
 | `PATCH /api/admin/tests/:testId` | The `attempted_count` field is silently ignored even if included in the request body | ℹ️ By Design |
 | All endpoints | Edge cases are not yet tested for any endpoint | ⚠️ Pending |
 | Test Management | Test mapping with sections and questions requires stricter validation | ⁉️ Critical |
 
 ---
 
 *Documentation generated from implementation audit — April 24, 2026.*  
 *Platform: RankKro · Stack: React · TypeScript · Node.js · MongoDB · JWT*
 *Author: Bharatrise Ventures*