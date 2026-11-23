import { z } from "zod";

export function parseInput<T extends z.ZodType>(
  schema: T,
  input: unknown,
):
  | { ok: true; data: z.infer<T> }
  | { ok: false; message: string } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid",
    };
  }
  return { ok: true, data: parsed.data };
}

const optionalText = z
  .string()
  .trim()
  .max(1000)
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null));

const optionalEmail = z
  .string()
  .trim()
  .max(200)
  .nullish()
  .transform((value) => (value && value.length > 0 ? value : null))
  .refine(
    (value) => value === null || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
    "Email tidak valid",
  );

const requiredEmail = z
  .string()
  .trim()
  .min(1, "Email wajib diisi")
  .email("Email tidak valid");

const money = z.coerce.number().int("Nominal harus bilangan bulat").min(0);
const dateInput = z.string().trim().min(1, "Tanggal wajib diisi");

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Nama klien minimal 2 karakter").max(160),
  email: optionalEmail,
  phone: optionalText,
  address: optionalText,
  taxId: optionalText,
  status: z.enum(["PROSPECT", "ACTIVE", "INACTIVE"]).default("PROSPECT"),
});

export const contactSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().trim().min(2, "Nama kontak minimal 2 karakter").max(160),
  position: optionalText,
  email: optionalEmail,
  phone: optionalText,
  isPrimary: z.boolean().default(false),
});

export const noteSchema = z.object({
  clientId: z.string().min(1),
  content: z.string().trim().min(3, "Catatan minimal 3 karakter").max(5000),
  occurredAt: dateInput,
});

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, "Deskripsi item wajib diisi").max(300),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0").max(1_000_000),
  unitPrice: money,
});

export const invoiceSchema = z
  .object({
    clientId: z.string().min(1, "Klien wajib dipilih"),
    taskId: optionalText,
    issueDate: dateInput,
    dueDate: dateInput,
    discount: money.default(0),
    taxRate: z.coerce.number().min(0).max(100).default(0),
    note: optionalText,
    items: z.array(invoiceItemSchema).min(1, "Minimal satu item invoice"),
  })
  .refine(
    (value) =>
      new Date(`${value.dueDate}T00:00:00`) >=
      new Date(`${value.issueDate}T00:00:00`),
    { message: "Jatuh tempo tidak boleh sebelum tanggal terbit", path: ["dueDate"] },
  );

export const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().int("Nominal harus bilangan bulat").positive("Nominal wajib lebih dari 0"),
  paidAt: dateInput,
  method: z.enum(["TRANSFER", "CASH", "OTHER"]).default("TRANSFER"),
  note: optionalText,
});

export const taskSchema = z.object({
  title: z.string().trim().min(2, "Judul tugas minimal 2 karakter").max(200),
  description: optionalText,
  clientId: optionalText,
  assigneeId: optionalText,
  dueDate: z.string().trim().nullish().transform((value) => (value ? value : null)),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
});

export const taskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

export const commentSchema = z.object({
  taskId: z.string().min(1),
  content: z.string().trim().min(1, "Komentar wajib diisi").max(5000),
});

export const workspaceSchema = z.object({
  name: z.string().trim().min(2, "Nama kantor minimal 2 karakter").max(160),
  email: optionalEmail,
  phone: optionalText,
  address: optionalText,
  logoUrl: optionalText,
  bankName: optionalText,
  bankAccountNumber: optionalText,
  bankAccountName: optionalText,
  invoiceNumberFormat: z
    .string()
    .trim()
    .min(3, "Format nomor invoice wajib diisi")
    .max(60)
    .refine((value) => value.includes("{SEQ"), "Format wajib memuat {SEQ}"),
  defaultTaxRate: z.coerce.number().min(0).max(100),
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Nama kantor minimal 2 karakter").max(160),
  email: optionalEmail,
  phone: optionalText,
  address: optionalText,
});

export const inviteSchema = z.object({
  email: requiredEmail,
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const memberRoleSchema = z.object({
  membershipId: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(160),
  phone: optionalText,
});

export const signatureRequestSchema = z.object({
  invoiceId: z.string().min(1),
});

export const signSchema = z.object({
  name: z.string().trim().min(2, "Nama penanda tangan wajib diisi").max(160),
  email: optionalEmail,
  signature: z
    .string()
    .min(100, "Tanda tangan wajib diisi")
    .max(400_000, "Gambar tanda tangan terlalu besar")
    .refine((value) => value.startsWith("data:image/"), "Format tanda tangan tidak valid"),
  consent: z.literal(true, { message: "Persetujuan wajib dicentang" }),
});
