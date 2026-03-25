import { inngest} from "../index.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js"
import { getWelcomeEmailTemplate } from "../../utils/mails/welcomeEmail.js"

export const onUserSignup = inngest.createFunction(
    { id: "on-user-signup", retries: 2, triggers: [{ event: "user/signup" }] },
    async ({ event, step }) => {
        try {
            const { email } = event.data;
            const user = await step.run("fetch-user", async () => {
                const userObject = await User.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User no longer exists in our database");
                }
                return userObject;
            });

            await step.run("send-welcome-email", async () => {
                const subject = `Welcome to RanKro`;
                const message = getWelcomeEmailTemplate(user.name, user.email);
                await sendMail(user.email, subject, message);
            });

            return { success: true };
        } catch (error) {
            console.error("❌ Error running step", error.message);
            return { success: false };
        }
    }
)