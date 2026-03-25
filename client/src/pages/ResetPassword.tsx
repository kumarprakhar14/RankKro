import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthCard, AuthForm, AuthField } from '@/components/auth'
import { authAPI } from '@/lib/api'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

// Reset password schema mapping to backend's expectations + client-side confirmation
const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPassword() {
    const { token } = useParams<{ token: string }>()
    const navigate = useNavigate()
    
    const [isCheckingToken, setIsCheckingToken] = useState(true)
    const [tokenError, setTokenError] = useState<string | null>(null)
    const [email, setEmail] = useState<string | null>(null)
    
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    })

    // Mount validation: Check token validity first
    useEffect(() => {
        if (!token) {
            setTokenError("No reset token provided")
            setIsCheckingToken(false)
            return
        }

        const validateToken = async () => {
            try {
                const res = await authAPI.validateResetToken(token)
                if (res.success && res.data?.valid) {
                    setEmail(res.data.email || null)
                }
            } catch (error: any) {
                setTokenError(error.message || "Link invalid or expired")
            } finally {
                setIsCheckingToken(false)
            }
        }
        
        validateToken()
    }, [token])

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return
        
        setIsSubmitting(true)
        try {
            const response = await authAPI.resetPassword(token, { newPassword: data.newPassword })
            if (response.success) {
                setSuccessMessage(response.message || 'Password reset successful.')
                setTimeout(() => {
                    navigate('/login', { replace: true })
                }, 3000)
            }
        } catch (error: any) {
            form.setError('root', {
                message: error.message || 'Failed to reset password. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isCheckingToken) {
        return (
            <AuthCard title="Reset Password" description="Verifying your secure link...">
                <div className="flex justify-center p-6">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </AuthCard>
        )
    }

    if (tokenError) {
        return (
            <AuthCard title="Reset Password" description="Invalid Link">
                <div className="flex items-center p-4 mb-6 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50" role="alert">
                    <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
                    <div>{tokenError}</div>
                </div>
                <div className="text-center">
                    <Link to="/forgot-password" className="text-primary hover:underline">
                        Request a new reset link
                    </Link>
                </div>
            </AuthCard>
        )
    }

    return (
        <AuthCard
            title="Create New Password"
            description={email ? `Resetting password for ${email}` : "Enter your new password below"}
        >
            {successMessage ? (
                <div className="space-y-4">
                    <div className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50" role="alert">
                        <CheckCircle2 className="flex-shrink-0 inline w-4 h-4 mr-3" />
                        <div>{successMessage}</div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                        Redirecting to login...
                    </p>
                </div>
            ) : (
                <AuthForm<ResetPasswordFormData>
                    form={form}
                    schema={resetPasswordSchema}
                    defaultValues={{ newPassword: '', confirmPassword: '' }}
                    onSubmit={onSubmit}
                    submitText="Reset Password"
                    loadingText="Resetting..."
                    isLoading={isSubmitting}
                >
                    {(form) => (
                        <>
                            <AuthField
                                control={form.control}
                                name="newPassword"
                                label="New Password"
                                placeholder="••••••••"
                                type="password"
                            />
                            <AuthField
                                control={form.control}
                                name="confirmPassword"
                                label="Confirm New Password"
                                placeholder="••••••••"
                                type="password"
                            />
                        </>
                    )}
                </AuthForm>
            )}
        </AuthCard>
    )
}
