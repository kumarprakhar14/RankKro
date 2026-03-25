export const getForgotPasswordEmailTemplate = (userName, userEmail, resetUrl) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Logo -->
                    <tr>
                        <td style="padding: 15px 10px; text-align: center; background: #030816;">
                            <img src="https://res.cloudinary.com/dkjxsipsx/image/upload/v1764654587/svgviewer-png-output_2_ouinht_larx8k.png" alt="Company Logo" style="width: 300px; height: auto;">
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h1 style="color: #333333; font-size: 28px; margin: 0 0 20px 0; font-weight: 600;">
                                Password Reset Request 🔐
                            </h1>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Hi <strong style="color: #333333;">${userName}</strong>,
                            </p>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                We received a request to reset the password for your account associated with <strong style="color: #333333;">${userEmail}</strong>.
                            </p>
                            
                            <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                Click the button below to create a new password. This link will expire in <strong style="color: #333333;">1 hour</strong> for security reasons.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${resetUrl}" style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative Link -->
                            <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
                                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                                    <strong>Button not working?</strong>
                                </p>
                                <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 0; word-break: break-all;">
                                    Copy and paste this link into your browser: <br>
                                    <a href="${resetUrl}" style="color: #667eea; text-decoration: none;">${resetUrl}</a>
                                </p>
                            </div>
                            
                            <!-- Security Notice -->
                            <div style="margin-top: 30px; padding-top: 25px; border-top: 1px solid #eeeeee;">
                                <h2 style="color: #333333; font-size: 18px; margin: 0 0 15px 0;">⚠️ Security Notice</h2>
                                
                                <table role="presentation" style="width: 100%;">
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #666666; font-size: 14px; line-height: 1.6;">
                                                • If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #666666; font-size: 14px; line-height: 1.6;">
                                                • This password reset link will expire in 1 hour for your security.
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0;">
                                            <span style="color: #666666; font-size: 14px; line-height: 1.6;">
                                                • Never share this link with anyone.
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                If you have any questions, feel free to reach out to our support team at 
                                <a href="mailto:support@yourapp.com" style="color: #667eea; text-decoration: none;">support@yourapp.com</a>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f8f9fa;">
                            <p style="color: #999999; font-size: 14px; margin: 0 0 10px 0;">
                                © 2024 Your Company. All rights reserved.
                            </p>
                            <p style="color: #999999; font-size: 12px; margin: 0;">
                                123 Business Street, City, State 12345
                            </p>
                            
                            <!-- Social Links -->
                            <div style="margin-top: 20px;">
                                <a href="https://twitter.com/yourcompany" style="display: inline-block; margin: 0 10px;">
                                    <img src="https://via.placeholder.com/32/667eea/ffffff?text=T" alt="Twitter" style="width: 32px; height: 32px; border-radius: 50%;">
                                </a>
                                <a href="https://facebook.com/yourcompany" style="display: inline-block; margin: 0 10px;">
                                    <img src="https://via.placeholder.com/32/667eea/ffffff?text=F" alt="Facebook" style="width: 32px; height: 32px; border-radius: 50%;">
                                </a>
                                <a href="https://linkedin.com/company/yourcompany" style="display: inline-block; margin: 0 10px;">
                                    <img src="https://via.placeholder.com/32/667eea/ffffff?text=L" alt="LinkedIn" style="width: 32px; height: 32px; border-radius: 50%;">
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};