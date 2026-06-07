/**
 * App-wide constants derived from the product requirements.
 */

export const APP_NAME = "Task Runner";
export const APP_VERSION = "1.0.0";

// --- Fee model -------------------------------------------------------
export const PLATFORM_FEE_RATE = 0.1; // 10% commission

export const TASK_TYPE = {
  regular: {
    value: "regular",
    label: "Regular",
    minFee: 5000,
    maxFee: 8000,
    etaLabel: "30 - 60 menit",
  },
  urgent: {
    value: "urgent",
    label: "Urgent",
    minFee: 8000,
    maxFee: 12000,
    etaLabel: "10 - 30 menit",
  },
} as const;

export type TaskType = keyof typeof TASK_TYPE;

// --- Task categories -------------------------------------------------
export const TASK_CATEGORIES = [
  { value: "food", label: "Titip Makanan/Minuman" },
  { value: "print", label: "Print/Dokumen" },
  { value: "pickup", label: "Ambil Barang" },
  { value: "coop", label: "Koperasi/Kantin" },
  { value: "minimart", label: "Minimarket" },
  { value: "other", label: "Lainnya" },
] as const;

// --- Service area ----------------------------------------------------
export const NORMAL_SERVICE_RADIUS_KM = 3;

// ITK campus reference point (approx.)
export const CAMPUS_CENTER = {
  lat: -1.1866,
  lng: 116.8453,
} as const;

// --- Task status -----------------------------------------------------
export const TASK_STATUS = {
  waiting_runner: "Menunggu Runner",
  accepted: "Diterima",
  in_progress: "Dalam Proses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
} as const;

export type TaskStatus = keyof typeof TASK_STATUS;

// --- Payment ---------------------------------------------------------
export const PAYMENT_METHOD = {
  cash: "Cash",
  transfer: "Transfer",
} as const;

export const PAYMENT_STATUS = {
  unpaid: "Belum Dibayar",
  awaiting_proof: "Menunggu Bukti",
  proof_uploaded: "Bukti Diunggah",
  runner_confirmed: "Dikonfirmasi Runner",
  cash_on_complete: "Cash Saat Selesai",
} as const;

// --- Verification ----------------------------------------------------
export const VERIFICATION_STATUS = {
  incomplete: "Belum Lengkap",
  pending: "Menunggu Verifikasi",
  verified: "Terverifikasi",
  rejected: "Ditolak",
} as const;

export type VerificationStatus = keyof typeof VERIFICATION_STATUS;
