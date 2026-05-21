import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
  database: new Database("auth.db"),
  secret: process.env.BETTER_AUTH_API_KEY || "fallback_secret",
  emailAndPassword: {
    enabled: true,
  },
});
