import { z } from "zod";
import { toWhatsAppNumber } from "@/lib/utils/validation";

export const verificationSchema = z.object({
  phone: z
    .string()
    .min(1, "Nomor telepon wajib diisi")
    .refine((v) => toWhatsAppNumber(v) !== null, "Nomor WhatsApp tidak valid"),
});

export type VerificationInput = z.infer<typeof verificationSchema>;
