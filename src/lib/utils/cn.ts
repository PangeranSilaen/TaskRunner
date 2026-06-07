import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Indonesian Rupiah, e.g. 9000 -> "Rp9.000". */
export function formatRupiah(amount: number): string {
  return "Rp" + amount.toLocaleString("id-ID");
}

/** Format an ISO timestamp into a readable Indonesian date+time. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
