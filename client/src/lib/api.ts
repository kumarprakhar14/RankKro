export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? ""

// Server response shape
interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    message?: string
    error?: {
        code: string
        message: string
        fields?: Record<string, string | string[]>
    }
}

interface AuthData {
    accessToken: string
    user: {
        id: string
        name: string
        email: string
        phone: string | null
        image: string | null
        plan: 'FREE' | 'PREMIUM'
        isActive: boolean
        createdAt: string
    }
}

interface RegisterData {
    id: string
    name: string
    email: string
}

// ============================
// Test API response types
// ============================

export interface ServerTest {
    _id: string
    id: string             // e.g. "ssc-cgl-01"
    title: string
    exam_type: string
    duration_minutes: number
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    status: 'FREE' | 'PREMIUM'
    attempted_count: number
    is_pyq: boolean
    createdAt: string
    updatedAt?: string
    __v?: number
    section_count?: number
}

interface TestListData {
    tests: ServerTest[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

export interface ServerQuestion {
    _id: string
    id: string
    text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    marks: number
    negative_marks: number
    subject: string
    question_order: number
}

export interface ServerSection {
    _id: string
    name: string
    display_order: number
    questions: ServerQuestion[]
}

interface StartTestData {
    attempt: {
        _id: string
        started_at: string
        expires_at: string
        status: string
    }
    test: {
        _id: string
        title: string
        duration_minutes: number
        exam_type: string
    }
    sections: ServerSection[]
}

interface SubmitTestData {
    attemptId: string
    final_score: number
    summary: {
        total: number
        correct: number
        incorrect: number
        skipped: number
    }
}

export interface ResultQuestion {
    _id: string
    text: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: number
    explanation: string
    marks: number
    negative_marks: number
    subject: string
}

export interface ResultAnswer {
    _id: string
    selected_option: number | null
    is_correct: boolean
    question: ResultQuestion
}

interface ResultData {
    attempt: {
        _id: string
        started_at: string
        submitted_at: string
        final_score: number
        status: string
    }
    test: {
        _id: string
        title: string
        exam_type: string
        duration_minutes: number
    }
    summary: {
        total: number
        correct: number
        incorrect: number
        skipped: number
    }
    answers: ResultAnswer[]
}

interface AttemptsData {
    attempts: Array<{
        _id: string
        test_id: {
            _id: string
            title: string
            exam_type: string
            difficulty: string
            status: string
            duration_minutes: number
        }
        started_at: string
        submitted_at: string | null
        status: string
        final_score: number
    }>
    stats: {
        totalAttempts: number
        averageScore: number
        bestScore: number
    }
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // Inject auth token if available
    const token = localStorage.getItem('rankro_access_token')
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        credentials: 'include', // always send cookies
        ...options,
    })

    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
        // Automatic Token Refresh Logic
        if (response.status === 401 && endpoint !== '/api/auth/refresh' && !endpoint.includes('/api/auth/login')) {
            try {
                // Call the refresh endpoint manually to avoid circular apiRequest loops
                const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (refreshRes.ok) {
                    const refreshData = await refreshRes.json();
                    const newAccessToken = refreshData.data?.accessToken;

                    if (newAccessToken) {
                        // Update storage
                        localStorage.setItem('rankro_access_token', newAccessToken);

                        // Retry original request
                        const retryHeaders = {
                            ...headers,
                            Authorization: `Bearer ${newAccessToken}`
                        };

                        const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
                            ...options,
                            headers: retryHeaders,
                            credentials: 'include'
                        });

                        const retryData = await retryRes.json();
                        if (retryRes.ok) {
                            return retryData;
                        }

                        // If it fails again, throw the new error
                        const retryErr = new Error(retryData.error?.message || retryData.message || 'Request failed') as any;
                        retryErr.code = retryData.error?.code;
                        retryErr.status = retryRes.status;
                        throw retryErr;
                    } else {
                        throw new Error("Token refresh succeeded but no access token was returned");
                    }
                } else {
                    // Refresh failed (refresh token expired) -> Force Logout
                    window.dispatchEvent(new Event('auth:unauthorized'));
                }
            } catch (err) {
                console.error("Token refresh failed", err);
                throw err;
            }
        }

        // Throw with the server's error info attached
        const error = new Error(data.error?.message || data.message || 'Request failed') as Error & {
            code?: string
            fields?: Record<string, string | string[]>
            status?: number
        }
        error.code = data.error?.code
        error.fields = data.error?.fields
        error.status = response.status
        throw error
    }

    return data
}

export const authAPI = {
    register: (body: { name: string; email: string; password: string }) =>
        apiRequest<RegisterData>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    login: (body: { email: string; password: string }) =>
        apiRequest<AuthData>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    logout: () =>
        apiRequest('/api/auth/logout', {
            method: 'POST',
        }),

    refresh: () =>
        apiRequest<AuthData>('/api/auth/refresh', {
            method: 'POST',
        }),

    forgotPassword: (body: { email: string }) =>
        apiRequest<{ message: string }>('/api/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    validateResetToken: (token: string) =>
        apiRequest<{ valid: boolean; message: string; email?: string }>(`/api/auth/reset-password/${token}`, {
            method: 'GET',
        }),

    resetPassword: (token: string, body: { newPassword: string }) =>
        apiRequest<{ message: string }>(`/api/auth/reset-password/${token}`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),
}

export const testAPI = {
    /** List tests with optional filters */
    listTests: (filters?: { category?: string; difficulty?: string; status?: string; page?: number; limit?: number }) => {
        const params = new URLSearchParams()
        if (filters?.category) params.set('category', filters.category)
        if (filters?.difficulty) params.set('difficulty', filters.difficulty)
        if (filters?.status) params.set('status', filters.status)
        if (filters?.page) params.set('page', String(filters.page))
        if (filters?.limit) params.set('limit', String(filters.limit))
        const qs = params.toString()
        return apiRequest<TestListData>(`/api/tests${qs ? `?${qs}` : ''}`)
    },

    /** Start an exam session */
    startTest: (testId: string) =>
        apiRequest<StartTestData>(`/api/tests/${testId}/start`, {
            method: 'POST',
        }),

    /** Submit all answers */
    submitTest: (testId: string, body: { attemptId: string; answers: Array<{ question_id: string; selected_option: number | null }> }) =>
        apiRequest<SubmitTestData>(`/api/tests/${testId}/submit`, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    /** Fetch full result with answers revealed */
    getResult: (testId: string, attemptId: string) =>
        apiRequest<ResultData>(`/api/tests/${testId}/result/${attemptId}`),

    /** Get user's attempt history */
    getUserAttempts: (filters?: { page?: number; limit?: number }) => {
        const params = new URLSearchParams()
        if (filters?.page) params.set('page', String(filters.page))
        if (filters?.limit) params.set('limit', String(filters.limit))
        const qs = params.toString()
        return apiRequest<AttemptsData>(`/api/user/attempts${qs ? `?${qs}` : ''}`)
    },
}

// ============================
// Admin API
// ============================

export interface AdminAnalyticsData {
    users: { total: number; premium: number; free: number; recentSignups: number }
    content: { totalTests: number; totalQuestions: number }
    attempts: { total: number; submitted: number; inProgress: number }
    topTests: Array<{ _id: string; attempts: number; title: string; exam_type: string }>
}

export const adminAPI = {
    // Analytics
    getAnalytics: () => apiRequest<AdminAnalyticsData>('/api/admin/analytics'),

    // Users
    listUsers: (params?: { search?: string; plan?: string; page?: number; limit?: number }) => {
        const urlParams = new URLSearchParams()
        if (params?.search) urlParams.set('search', params.search)
        if (params?.plan) urlParams.set('plan', params.plan)
        if (params?.page) urlParams.set('page', String(params.page))
        if (params?.limit) urlParams.set('limit', String(params.limit))
        const qs = urlParams.toString()
        return apiRequest<{ users: any[], pagination: any }>(`/api/admin/users${qs ? `?${qs}` : ''}`)
    },
    getUserDetail: (userId: string) => apiRequest<{ user: any, attempts: any[], stats: any }>(`/api/admin/users/${userId}`),
    updateUserPlan: (userId: string, plan: 'FREE' | 'PREMIUM') =>
        apiRequest<{ user: any }>(`/api/admin/users/${userId}/plan`, { method: 'PATCH', body: JSON.stringify({ plan }) }),

    // Questions
    listQuestions: (params?: { subject?: string; search?: string; page?: number; limit?: number }) => {
        const urlParams = new URLSearchParams()
        if (params?.subject) urlParams.set('subject', params.subject)
        if (params?.search) urlParams.set('search', params.search)
        if (params?.page) urlParams.set('page', String(params.page))
        if (params?.limit) urlParams.set('limit', String(params.limit))
        const qs = urlParams.toString()
        return apiRequest<{ questions: ServerQuestion[], pagination: any }>(`/api/admin/questions${qs ? `?${qs}` : ''}`)
    },
    createQuestion: (data: any) =>
        apiRequest<{ question: ServerQuestion }>('/api/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
    updateQuestion: (questionId: string, data: any) =>
        apiRequest<{ question: ServerQuestion }>(`/api/admin/questions/${questionId}`, { method: 'PATCH', body: JSON.stringify(data) }),

    // Tests
    listTests: (params?: { exam_type?: string; status?: string; page?: number; limit?: number }) => {
        const urlParams = new URLSearchParams()
        if (params?.exam_type) urlParams.set('exam_type', params.exam_type)
        if (params?.status) urlParams.set('status', params.status)
        if (params?.page) urlParams.set('page', String(params.page))
        if (params?.limit) urlParams.set('limit', String(params.limit))
        const qs = urlParams.toString()
        return apiRequest<{ tests: ServerTest[], pagination: any }>(`/api/admin/tests${qs ? `?${qs}` : ''}`)
    },
    createTest: (data: any) =>
        apiRequest<{ test: ServerTest, sections: ServerSection[] }>('/api/admin/tests', { method: 'POST', body: JSON.stringify(data) }),
    updateTest: (testId: string, data: any) =>
        apiRequest<{ test: ServerTest }>(`/api/admin/tests/${testId}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getTestDetail: (testId: string) =>
        apiRequest<{ test: ServerTest, sections: ServerSection[] }>(`/api/admin/tests/${testId}`),
    assignQuestions: (testId: string, sectionId: string, questions: Array<{ question_id: string; question_order: number }>) =>
        apiRequest<{ assigned: number }>(`/api/admin/tests/${testId}/sections/${sectionId}/questions`, {
            method: 'POST',
            body: JSON.stringify({ questions })
        })
}

// ============================
// Payment API
// ============================
export const paymentAPI = {
    createOrder: (amount: number) =>
        apiRequest<{ order: any }>('/api/payments/create-order', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        }),

    verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        apiRequest<{ message: string }>('/api/payments/verify-payment', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
}