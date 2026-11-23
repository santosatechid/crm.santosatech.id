import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, openAPI } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";

import { sendMail } from "./mailer";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 30 * 60,
      strategy: "compact",
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    openAPI(),
    admin({
      // Optional: configure admin settings
      defaultRole: "user",
      adminRole: "admin",
      teacherRole: "teacher",
      studentRole: "student",
      parentRole: "parent",
    }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp }) {
        await sendMail({
          to: email,
          subject: "Kode verifikasi akun",
          text: `Kode verifikasi Anda: ${otp}. Berlaku 10 menit. Jangan bagikan kode ini.`,
        });
      },
    }),
    nextCookies(), // ✅ MOVED: Cookie plugin MUST be last
  ],
});
