import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;

export type UserRole = "user" | "admin";

export type VerificationStatus =
  | "incomplete"
  | "pending"
  | "verified"
  | "rejected";
