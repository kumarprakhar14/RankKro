import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthCard, AuthForm, AuthField } from '@/components/auth'
import { useState } from 'react'
import { authAPI } from '@/lib/api'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const from = (location.state as { from?: string })?.from || '/'
    const auth = useAuth()

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const response = await authAPI.login({
                email: data.email,
                password: data.password,
            })

            if (response.success && response.data) {
                auth.login(response.data.accessToken, response.data.user)
                navigate(from, { replace: true })
            }
        } catch (error: any) {
            // Show server error in the form
            if (error.fields) {
                // Field-level validation errors from server
                Object.entries(error.fields).forEach(([field, message]) => {
                    form.setError(field as keyof LoginFormData, {
                        message: Array.isArray(message) ? message[0] : message as string,
                    })
                })
            } else {
                // General error (wrong credentials, etc.)
                form.setError('root', {
                    message: error.message || 'Login failed. Please try again.',
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthCard
            title="Welcome Back"
            description="Sign in to your account to continue"
        >
            <AuthForm<LoginFormData>
                form={form}
                schema={loginSchema}
                defaultValues={{
                    email: '',
                    password: '',
                }}
                onSubmit={onSubmit}
                submitText="Sign In"
                loadingText="Signing In..."
                isLoading={isLoading}
            >
                {(form) => (
                    <>
                        <AuthField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="you@example.com"
                            type="email"
                        />
                        <AuthField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="••••••••"
                            type="password"
                        />
                    </>
                )}
            </AuthForm>
            <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-primary font-medium hover:underline">
                    Sign up
                </Link>
            </p>
        </AuthCard>
    )
}