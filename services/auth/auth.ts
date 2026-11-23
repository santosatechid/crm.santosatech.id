import { PrismaClient } from "@/prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, openAPI } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";

import { sendEmail } from "@/services/email";

import { sendMail } from "./mailer";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset kata sandi CRM",
        html: `<p>Halo ${user.name},</p><p>Klik tautan berikut untuk mengatur ulang kata sandi:</p><p><a href="${url}">${url}</a></p><p>Abaikan email ini jika Anda tidak meminta reset.</p>`,
      });
    },
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
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    openAPI(),
    admin({
      defaultRole: "user",
      adminRole: "admin",
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
    nextCookies(),
  ],
});
