import { env } from "@/lib/env";

/**
 * Validate that an email belongs to the configured campus domain.
 * Accepts the exact domain or any subdomain of it.
 */
export function isCampusEmail(email: string): boolean {
  const domain = env.campusEmailDomain.toLowerCase();
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at === -1) return false;
  const host = value.slice(at + 1);
  return host === domain || host.endsWith("." + domain);
}

/**
 * Convert a local phone number to WhatsApp format (e.g. "08xxx" -> "628xxx").
 * Returns null when the input cannot be normalised.
 */
export function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("8")) return "62" + digits;
  return null;
}
