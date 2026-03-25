export const getSubscriptionEmailTemplate = (name, amount) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium Subscription Confirmed</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-top: 5px solid #4f46e5; }
            .header { background-color: #4f46e5; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 30px; color: #333; line-height: 1.6; }
            .content h2 { color: #2c3e50; font-size: 20px; margin-top: 0; }
            .details-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin: 25px 0; }
            .details-box p { margin: 5px 0; font-size: 15px; }
            .btn { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: 500; font-size: 16px; margin-top: 15px; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #7f8c8d; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Premium! 🚀</h1>
            </div>
            <div class="content">
                <h2>Hi ${name},</h2>
                <p>Thank you for subscribing to RanKro Premium! Your payment of ₹${amount} was successful, and your account has been upgraded.</p>
                <div class="details-box">
                    <strong>Your Premium Benefits:</strong>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>Unlimited access to all mock tests</li>
                        <li>Detailed AI performance analytics</li>
                        <li>Ad-free experience</li>
                    </ul>
                </div>
                <p>You can now log in and start attempting premium tests immediately.</p>
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/mocks" class="btn">Start Practicing</a>
                </div>
            </div>
            <div class="footer">
                &copy; ${new Date().getFullYear()} RanKro. All rights reserved.<br>
                For support, contact us at support@rankro.com
            </div>
        </div>
    </body>
    </html>
    `;
};
