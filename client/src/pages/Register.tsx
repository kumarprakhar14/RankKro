import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthCard, AuthForm, AuthField } from '@/components/auth'
import { useState } from 'react'
import { authAPI } from '@/lib/api'
import { useNavigate, Link } from 'react-router-dom'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/\d/, 'Must contain at least one digit')
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    })

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true)
        try {
            const response = await authAPI.register({
                name: data.name,
                email: data.email,
                password: data.password,
            })

            if (response.success) {
                // Redirect to login with success indication
                navigate('/sign-in')
            }
        } catch (error: any) {
            if (error.fields) {
                // Field-level validation errors from server
                Object.entries(error.fields).forEach(([field, message]) => {
                    if (field in form.getValues()) {
                        form.setError(field as keyof RegisterFormData, {
                            message: Array.isArray(message) ? message[0] : message as string,
                        })
                    }
                })
            } else {
                // General error (email already exists, etc.)
                form.setError('root', {
                    message: error.message || 'Registration failed. Please try again.',
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthCard
            title="Create Account"
            description="Join RankKro to get started"
        >
            <AuthForm<RegisterFormData>
                form={form}
                schema={registerSchema}
                defaultValues={{
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                }}
                onSubmit={onSubmit}
                submitText="Sign Up"
                loadingText="Creating Account..."
                isLoading={isLoading}
            >
                {(form) => (
                    <>
                        <AuthField
                            control={form.control}
                            name="name"
                            label="Full Name"
                            placeholder="John Doe"
                        />
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
                        <AuthField
                            control={form.control}
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="••••••••"
                            type="password"
                        />
                    </>
                )}
            </AuthForm>
            <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-primary font-medium hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthCard>
    )
}