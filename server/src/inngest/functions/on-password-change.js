// Send information to user about password change

import { inngest } from "../index.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js"
import { getPasswordChangeEmailTemplate } from "../../utils/mails/passwordChangeEmail.js"


export const onUserPasswordChange = inngest.createFunction(
    { id: "on-user-password-change", retries: 2, triggers: [{ event: "user/password-change" }] },
    async ({ event, step }) => {
        try {
            const { email } = event.data;  // consider sending user object in the event data to reduce read/write overhead
            const user = await step.run("fetch-user", async () => {
                const userObject = await User.findOne({ email });
                if (!userObject) {
                    throw new NonRetriableError("User no longer exists in our database");
                }

                return userObject;
            });

            // change updateAt time to ist
            const updatedAt = await step.run("convert-time-to-IST", async () => {
                const updatedAt = new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "full",
                    timeStyle: "long",
                    timeZone: "Asia/Kolkata",
                }).format(new Date(user.updatedAt));
                return updatedAt;
            });



            // // send email
            await step.run("send-password-chanage-email", async () => {
                const subject = `Your password has been changed`;
                const message = getPasswordChangeEmailTemplate(user.name, user.email, updatedAt);
                await sendMail(user.email, subject, message);
            });

            return { success: true }
        } catch (error) {
            console.error("❌ Error running step", error.message);
            return { success: false };
        }
    }
)