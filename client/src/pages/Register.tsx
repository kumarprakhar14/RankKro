import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthCard, AuthForm, AuthField } from '@/components/auth'
import { useState } from 'react'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function Register() {
    const [isLoading, setIsLoading] = useState(false)
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
            // Call your API here
            console.log('Register data:', data)
            // const response = await registerAPI(data)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthCard
            title="Create Account"
            description="Join ExamEdge to get started"
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
        </AuthCard>
    )
}