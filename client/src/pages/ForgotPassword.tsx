import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthCard, AuthForm, AuthField } from '@/components/auth'
import { useState } from 'react'
import { authAPI } from '@/lib/api'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true)
        setSuccessMessage(null)
        try {
            const response = await authAPI.forgotPassword({ email: data.email })
            if (response.success) {
                setSuccessMessage(response.message || 'If an account exists, a reset link has been sent to your email.')
            }
        } catch (error: any) {
            if (error.fields) {
                Object.entries(error.fields).forEach(([field, message]) => {
                    form.setError(field as keyof ForgotPasswordFormData, {
                        message: Array.isArray(message) ? message[0] : message as string,
                    })
                })
            } else {
                form.setError('root', {
                    message: error.message || 'Failed to process request. Please try again.',
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthCard
            title="Forgot Password"
            description="Enter your email to receive a password reset link."
        >
            {successMessage ? (
                <div className="space-y-4">
                    <div className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50" role="alert">
                        <CheckCircle2 className="flex-shrink-0 inline w-4 h-4 mr-3" />
                        <div>{successMessage}</div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Return to Login
                        </Link>
                    </p>
                </div>
            ) : (
                <>
                    <AuthForm<ForgotPasswordFormData>
                        form={form}
                        schema={forgotPasswordSchema}
                        defaultValues={{ email: '' }}
                        onSubmit={onSubmit}
                        submitText="Send Reset Link"
                        loadingText="Sending..."
                        isLoading={isLoading}
                    >
                        {(form) => (
                            <AuthField
                                control={form.control}
                                name="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                type="email"
                            />
                        )}
                    </AuthForm>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Log in
                        </Link>
                    </p>
                </>
            )}
        </AuthCard>
    )
}
