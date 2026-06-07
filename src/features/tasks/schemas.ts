import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  locationName: z.string().min(1, "Nama lokasi wajib diisi"),
  latitude: z.number({ message: "Lokasi wajib dipilih" }),
  longitude: z.number({ message: "Lokasi wajib dipilih" }),
  taskType: z.enum(["regular", "urgent"], { message: "Tipe biaya wajib dipilih" }),
  runnerFee: z.number().int().positive("Biaya runner tidak valid"),
  paymentMethod: z.enum(["cash", "transfer"], {
    message: "Metode pembayaran wajib dipilih",
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const cancelTaskSchema = z.object({
  reason: z.string().min(1, "Alasan pembatalan wajib diisi"),
});

export type CancelTaskInput = z.infer<typeof cancelTaskSchema>;
