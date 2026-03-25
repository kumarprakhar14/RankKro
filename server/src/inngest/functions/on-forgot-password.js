// Trigger an event when user requests to reset password

import { inngest } from "../index.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import { getForgotPasswordEmailTemplate } from "../../utils/mails/forgotPasswordEmail.js";


export const onUserForgotPassword =  inngest.createFunction(
    { id: "on-user-forgot-password", retries: 2, triggers: [{ event: "user/forgot-password" }] },
    async ({ event, step }) => {
        try {
            const { email, url } = event.data;  // consider sending user object in the event data to reduce read/write overhead
            const user = await step.run("fetch-user", async () => {
                const userObject = await User.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User no longer exists in our database");
                }
                return userObject;
            });

            await step.run("send-forgot-password-email", async () => {
                const subject = `Reset your password`;
                const message = getForgotPasswordEmailTemplate(user.name, user.email, url);
                await sendMail(user.email, subject, message);
            });

            return { success: true }

        } catch (error) {
            console.error("❌ Error sending forgot password mail", error.message);
            return { success: false };
        }
    }
)