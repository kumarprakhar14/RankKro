import { inngest } from "../index.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import { getSubscriptionEmailTemplate } from "../../utils/mails/subscriptionEmail.js";

export const onUserSubscription = inngest.createFunction(
    { id: "on-user-subscription", retries: 2, triggers: [{ event: "user/subscription" }] },
    async ({ event, step }) => {
        try {
            const { email, amount } = event.data;
            const user = await step.run("fetch-user", async () => {
                const userObject = await User.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User no longer exists in our database");
                }
                return userObject;
            });

            await step.run("send-subscription-email", async () => {
                const subject = `Welcome to RanKro Premium! 🚀`;
                const message = getSubscriptionEmailTemplate(user.name, amount);
                await sendMail(user.email, subject, message);
            });

            return { success: true };
        } catch (error) {
            if (error instanceof NonRetriableError) {
                console.error("❌ Non-retryable error running step", error.message);
                throw error;
            }
            console.error("❌ Error running subscription email step", error.message);
            throw error;
        }
    }
);
