import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { dash } from "@better-auth/infra";
import { Pool } from "pg";
import { getServiceSupabase } from "./supabase";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_API_KEY,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://folkets-stemme.no",
    "https://www.folkets-stemme.no",
  ],
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    reddit: {
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
    },
  },
  plugins: [
    dash(),
    phoneNumber({
      sendOTP: async ({ phoneNumber: phone, code }) => {
        if (process.env.SMS_PROVIDER === "twilio") {
          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;
          const fromNumber = process.env.TWILIO_FROM_NUMBER;
          const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
          await fetch(url, {
            method: "POST",
            headers: {
              Authorization:
                "Basic " +
                Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: phone,
              From: fromNumber!,
              Body: `Folkets Stemme: Din verifiseringskode er ${code}`,
            }),
          });
        } else {
          console.log(
            `[SMS OTP] Phone: ${phone}, Code: ${code} (configure SMS_PROVIDER for production)`
          );
        }
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      phoneVerified: { type: "boolean", required: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const supabase = getServiceSupabase();
            await supabase.schema("next_auth").from("users").upsert(
              {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image || null,
              },
              { onConflict: "id" }
            );
          } catch (e) {
            console.error("Failed to sync user to next_auth.users:", e);
          }
        },
      },
    },
  },
});
