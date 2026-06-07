import { z } from "zod";
import { isCampusEmail } from "@/lib/utils/validation";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .refine(isCampusEmail, "Gunakan email kampus ITK"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, "Nama wajib diisi"),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .refine(isCampusEmail, "Gunakan email kampus ITK"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
