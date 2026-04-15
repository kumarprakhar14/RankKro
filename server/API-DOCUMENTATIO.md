# Mock Test Platform — API Documentation

**Base URL:** `/api/admin`  
**Auth:** JWT (Bearer Token required for all endpoints)  
**Stack:** Node.js · Express · MongoDB · JWT

---

## Table of Contents

- [User Management](#user-management)
- [Question Management](#question-management)
- [Test Management](#test-management)
- [Analytics](#analytics)
- [Known Issues & Notes](#known-issues--notes)

---

## User Management

### `GET /api/admin/users`

Retrieves a paginated list of all registered users.

**Status:** ✅ Working

**Query Parameters:** None (default: page 1, limit 20)

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "69c571d9e8a279741bd3a9e6",
        "name": "kundan kumar",
        "email": "kundan906420@gmail.com",
        "phone": "",
        "plan": "PREMIUM",
        "role": "USER",
        "isActive": true,
        "createdAt": "2026-03-26T17:50:17.779Z",
        "updatedAt": "2026-04-13T01:34:40.249Z",
        "__v": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  },
  "message": "Users retrieved successfully"
}
```

---

### `GET /api/admin/users/:userId`

Retrieves full details for a specific user, including their attempt history and aggregate stats.

**Status:** ✅ Working

**Path Parameters:**

| Parameter | Type   | Description       |
|-----------|--------|-------------------|
| `userId`  | string | MongoDB `_id` of the user |

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "69c571d9e8a279741bd3a9e6",
      "name": "kundan kumar",
      "email": "kundan906420@gmail.com",
      "phone": "",
      "plan": "PREMIUM",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-03-26T17:50:17.779Z",
      "updatedAt": "2026-04-13T01:34:40.249Z",
      "__v": 3
    },
    "attempts": [
      {
        "_id": "69dc481ad04e17b68da77a60",
        "test_id": null,
        "user_id": "69c571d9e8a279741bd3a9e6",
        "status": "IN_PROGRESS",
        "createdAt": "2026-04-13T01:34:20.431Z",
        "expires_at": "2026-04-13T02:34:20.364Z",
        "final_score": 0,
        "started_at": "2026-04-13T01:34:20.364Z",
        "updatedAt": "2026-04-13T01:34:24.885Z",
        "__v": 0
      }
    ],
    "stats": {
      "totalAttempts": 0,
      "averageScore": 0,
      "bestScore": 0
    }
  },
  "message": "User detail retrieved successfully"
}
```

> **Note:** `test_id` may be `null` for attempts where the associated test has been deleted.

---

### `PATCH /api/admin/users/:userId/plan`

Updates the subscription plan for a specific user.

**Status:** ✅ Working

**Path Parameters:**

| Parameter | Type   | Description       |
|-----------|--------|-------------------|
| `userId`  | string | MongoDB `_id` of the user |

**Request Body:**

```json
{
  "plan": "premium"
}
```

| Field  | Type   | Accepted Values           |
|--------|--------|---------------------------|
| `plan` | string | `"premium"` or `"free"` (case-insensitive) |

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "69c571d9e8a279741bd3a9e6",
      "name": "kundan kumar",
      "email": "kundan906420@gmail.com",
      "phone": "",
      "plan": "PREMIUM",
      "role": "USER",
      "isActive": true,
      "createdAt": "2026-03-26T17:50:17.779Z",
      "updatedAt": "2026-04-13T20:20:13.775Z",
      "__v": 3
    }
  },
  "message": "User plan updated to PREMIUM"
}
```

---

## Question Management

### `GET /api/admin/questions`

Retrieves a paginated, filterable list of questions.

**Status:** ✅ Working

**Query Parameters:**

| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| `search`  | string | No       | Full-text search on question text  |
| `subject` | string | No       | Filter by subject (e.g. `Geography`) |
| `page`    | number | No       | Page number (default: 1)           |
| `limit`   | number | No       | Results per page (default: 20)     |

**Example Request:**

```
GET /api/admin/questions?search=What%20is%20the%20capital&subject=Geography&page=1&limit=20
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "_id": "q-ga-284",
        "text": "What is the capital of Haryana??",
        "option_a": "Chandigarh",
        "option_b": "Gurgaon",
        "option_c": "Rohtak",
        "option_d": "Ambala",
        "correct_option": 0,
        "explanation": "Chandigarh capital.",
        "marks": 2,
        "negative_marks": 0.5,
        "subject": "Geography",
        "difficulty": "Easy",
        "createdAt": "2026-04-13T01:25:42.789Z",
        "updatedAt": "2026-04-13T01:25:42.789Z",
        "__v": 0
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  },
  "message": "Questions retrieved successfully"
}
```

---

### `POST /api/admin/questions`

Creates a new standalone question.

**Status:** ✅ Working

**Request Body:**

```json
{
  "id": "q-en-273",
  "text": "What is the antonym of 'LEADER'",
  "option_a": "Disciple",
  "option_b": "Follower",
  "option_c": "Member",
  "option_d": "Person",
  "correct_option": 1,
  "explanation": "The antonym of 'LEADER' is Follower",
  "marks": 2,
  "negative_marks": 0.5,
  "subject": "Vocabulary",
  "difficulty": "Easy"
}
```

| Field            | Type   | Required | Description                                              |
|------------------|--------|----------|----------------------------------------------------------|
| `id`             | string | Yes      | Human-readable ID using prefix convention (e.g. `q-ga-001`, `q-qa-001`, `q-re-001`, `q-en-001`) |
| `text`           | string | Yes      | Question text                                            |
| `option_a`–`option_d` | string | Yes | Four answer choices                                 |
| `correct_option` | number | Yes      | 0-indexed correct answer (0=A, 1=B, 2=C, 3=D)           |
| `explanation`    | string | Yes      | Explanation shown after submission                       |
| `marks`          | number | Yes      | Marks awarded for a correct answer                       |
| `negative_marks` | number | Yes      | Marks deducted for a wrong answer                        |
| `subject`        | string | Yes      | Subject tag (e.g. `Geography`, `Vocabulary`)             |
| `difficulty`     | string | Yes      | `Easy`, `Medium`, or `Hard`                              |

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "question": {
      "_id": "q-en-273",
      "text": "what is the antonym of 'LEADER'",
      "option_a": "Disciple",
      "option_b": "Follower",
      "option_c": "Member",
      "option_d": "Person",
      "correct_option": 1,
      "explanation": "The antonym of 'LEADER' is Follwer",
      "marks": 2,
      "negative_marks": 0.5,
      "subject": "Vocablary",
      "difficulty": "Easy",
      "createdAt": "2026-04-13T20:47:11.533Z",
      "updatedAt": "2026-04-13T20:47:11.533Z",
      "__v": 0
    }
  },
  "message": "Question created successfully"
}
```

---

### `PATCH /api/admin/questions/:questionId`

Updates one or more fields of an existing question.

**Status:** ✅ Working

**Path Parameters:**

| Parameter    | Type   | Description                  |
|--------------|--------|------------------------------|
| `questionId` | string | The `_id` of the question (e.g. `q-en-273`) |

**Request Body** (all fields optional — send only what needs updating):

```json
{
  "text": "What is the synonym of 'LEADER'"
}
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "question": {
      "_id": "q-en-273",
      "text": "what is the synonym of 'LEADER'",
      "option_a": "Disciple",
      "option_b": "Follower",
      "option_c": "Member",
      "option_d": "Person",
      "correct_option": 1,
      "explanation": "The antonym of 'LEADER' is Follwer",
      "marks": 2,
      "negative_marks": 0.5,
      "subject": "Vocablary",
      "difficulty": "Easy",
      "createdAt": "2026-04-13T20:47:11.533Z",
      "updatedAt": "2026-04-13T20:47:11.533Z",
      "__v": 0
    }
  },
  "message": "Question updated successfully"
}
```

---

## Test Management

### `GET /api/admin/tests`

Retrieves a paginated, filterable list of tests.

**Status:** ✅ Working

**Query Parameters:**

| Parameter   | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| `exam_type` | string | No       | Filter by exam type (e.g. `ssc cgl`)     |
| `status`    | string | No       | Filter by status (`free` or `premium`)   |
| `page`      | number | No       | Page number (default: 1)                 |
| `limit`     | number | No       | Results per page (default: 20)           |

**Example Request:**

```
GET /api/admin/tests?exam_type=ssc%20cgl&status=free&page=5&limit=2
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "_id": "69dcc5bfd58c9a4e804c042b",
        "id": "ssc-cgl-07",
        "title": "SSC CGL (Tier I) Mock Test 7",
        "exam_type": "SSC CGL",
        "duration_minutes": 60,
        "difficulty": "MEDIUM",
        "status": "FREE",
        "attempted_count": 0,
        "is_pyq": false,
        "createdAt": "2026-04-13T10:30:23.891Z",
        "updatedAt": "2026-04-13T10:30:23.891Z",
        "__v": 0,
        "section_count": 0
      }
    ],
    "pagination": {
      "page": 5,
      "limit": 2,
      "total": 14,
      "totalPages": 7
    }
  },
  "message": "Tests retrieved successfully"
}
```

---

### `POST /api/admin/tests`

Creates a new test along with its sections.

**Status:** ✅ Working  
**⚠️ Known Issue:** Duplicate `id` values are not enforced — a test can be created with an `id` that already exists in the database. See [Known Issues](#known-issues--notes).

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

| Field               | Type    | Required | Description                                      |
|---------------------|---------|----------|--------------------------------------------------|
| `id`                | string  | Yes      | Human-readable test ID (e.g. `ssc-cgl-15`)       |
| `title`             | string  | Yes      | Display title                                    |
| `exam_type`         | string  | Yes      | Exam category (e.g. `SSC CGL`, `RRB NTPC`)       |
| `duration_minutes`  | number  | Yes      | Exam duration in minutes                         |
| `difficulty`        | string  | Yes      | `EASY`, `MEDIUM`, or `HARD`                      |
| `status`            | string  | Yes      | `FREE` or `PREMIUM`                              |
| `is_pyq`            | boolean | Yes      | Whether this is a Previous Year Question paper   |
| `initial_sections`  | array   | No       | Pass empty array `[]` if no pre-existing sections |
| `sections`          | array   | Yes      | List of section objects with a `name` field      |

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "test": {
      "id": "ssc-cgl-15",
      "title": "SSC CGL (Tier I) Mock Test 15",
      "exam_type": "SSC CGL",
      "duration_minutes": 60,
      "difficulty": "MEDIUM",
      "status": "FREE",
      "attempted_count": 0,
      "is_pyq": false,
      "_id": "69dd5eea4132c792a1c1060c",
      "createdAt": "2026-04-13T21:23:54.559Z",
      "updatedAt": "2026-04-13T21:23:54.559Z",
      "__v": 0
    },
    "sections": [
      {
        "testId": "69dd5eea4132c792a1c1060c",
        "name": "General Awareness",
        "section_order": 1,
        "_id": "69dd5eea4132c792a1c1060e",
        "__v": 0,
        "createdAt": "2026-04-13T21:23:54.706Z",
        "updatedAt": "2026-04-13T21:23:54.706Z"
      },
      {
        "testId": "69dd5eea4132c792a1c1060c",
        "name": "Quantitative Aptitude",
        "section_order": 2,
        "_id": "69dd5eea4132c792a1c1060f",
        "__v": 0,
        "createdAt": "2026-04-13T21:23:54.706Z",
        "updatedAt": "2026-04-13T21:23:54.706Z"
      },
      {
        "testId": "69dd5eea4132c792a1c1060c",
        "name": "Reasoning",
        "section_order": 3,
        "_id": "69dd5eea4132c792a1c10610",
        "__v": 0,
        "createdAt": "2026-04-13T21:23:54.706Z",
        "updatedAt": "2026-04-13T21:23:54.706Z"
      },
      {
        "testId": "69dd5eea4132c792a1c1060c",
        "name": "English",
        "section_order": 4,
        "_id": "69dd5eea4132c792a1c10611",
        "__v": 0,
        "createdAt": "2026-04-13T21:23:54.707Z",
        "updatedAt": "2026-04-13T21:23:54.707Z"
      }
    ]
  },
  "message": "Test created successfully"
}
```

---

### `GET /api/admin/tests/:testId`

Retrieves full detail for a specific test, including its sections.

**Status:** ✅ Working

**Path Parameters:**

| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| `testId`  | string | MongoDB `_id` of the test document |

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "test": {
      "_id": "69dcc62bd58c9a4e804c046b",
      "id": "ssc-cgl-15",
      "title": "SSC CGL (Tier I) Mock Test 15",
      "exam_type": "SSC CGL",
      "duration_minutes": 60,
      "difficulty": "MEDIUM",
      "status": "FREE",
      "attempted_count": 0,
      "is_pyq": false,
      "createdAt": "2026-04-13T10:32:11.232Z",
      "updatedAt": "2026-04-13T10:32:11.232Z",
      "__v": 0
    },
    "sections": []
  },
  "message": "Test detail retrieved successfully"
}
```

---

### `PATCH /api/admin/tests/:testId`

Updates metadata fields for an existing test.

**Status:** ✅ Working  
**⚠️ Restriction:** The `attempted_count` field cannot be modified via this endpoint — it is managed internally and any value sent for it will be ignored.

**Path Parameters:**

| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| `testId`  | string | MongoDB `_id` of the test document |

**Request Body** (all fields optional — send only what needs updating):

```json
{
  "status": "PREMIUM",
  "is_pyq": true
}
```

**Sample Response:**

```json
{
  "success": true,
  "data": {
    "test": {
      "_id": "69dcc62bd58c9a4e804c046b",
      "id": "ssc-cgl-15",
      "title": "SSC CGL (Tier I) Mock Test 15",
      "exam_type": "SSC CGL",
      "duration_minutes": 60,
      "difficulty": "MEDIUM",
      "status": "PREMIUM",
      "attempted_count": 0,
      "is_pyq": true,
      "createdAt": "2026-04-13T10:32:11.232Z",
      "updatedAt": "2026-04-13T21:44:05.509Z",
      "__v": 0
    }
  },
  "message": "Test updated successfully"
}
```

---

### `POST /api/admin/tests/:testId/sections/:sectionId/questions`

Bulk-assigns questions to a specific section within a test.

**Status:** ✅ Working (not recently re-tested)

**Path Parameters:**

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `testId`    | string | MongoDB `_id` of the test                |
| `sectionId` | string | MongoDB `_id` of the section             |

**Request Body:**

```json
{
  "questions": [
    { "question_id": "q-en-029", "question_order": 1 },
    { "question_id": "q-en-030", "question_order": 2 },
    { "question_id": "q-en-031", "question_order": 3 }
  ]
}
```

| Field             | Type   | Description                                        |
|-------------------|--------|----------------------------------------------------|
| `question_id`     | string | The `_id` of the question to add                   |
| `question_order`  | number | Display order of the question within the section   |

---

## Analytics

### `GET /api/admin/analytics`

Returns a platform-wide summary of users, content, and test attempts.

**Status:** ✅ Working

**Sample Response:**

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

## Known Issues & Notes

| Endpoint | Issue | Severity |
|----------|-------|----------|
| `POST /api/admin/tests` | No uniqueness check on the `id` field — duplicate `id` values (e.g. two documents with `"id": "ssc-cgl-01"`) can be created without error | ⚠️ Medium |
| `PATCH /api/admin/tests/:testId` | The `attempted_count` field is silently ignored even if included in the request body — it cannot be set via this endpoint | ℹ️ By Design |
| All endpoints | Edge cases are not yet tested for any endpoint | ⚠️ Pending |
| Test Management Endpoints | Test mapping with sections and questions | ⁉️ Critical
---

*Documentation generated from testing session — April 13–14, 2026.*  
*Platform: Mock Test Platform · Stack: React · TypeScript · Node.js · MongoDB · JWT*