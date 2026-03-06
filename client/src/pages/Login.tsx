import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthCard, AuthForm, AuthField } from '@/components/auth'
import { useState } from 'react'

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
    const [isLoading, setIsLoading] = useState(false)
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
            // Call your API here
            console.log('Login data:', data)
            // const response = await loginAPI(data)
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
        </AuthCard>
    )
}