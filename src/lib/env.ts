/**
 * Centralised, validated access to environment variables.
 * Fails fast (in dev) when a required variable is missing.
 */

function required(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${key}. ` +
        `Copy .env.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export const env = {
  supabaseUrl: required("VITE_SUPABASE_URL"),
  supabaseAnonKey: required("VITE_SUPABASE_ANON_KEY"),
  campusEmailDomain:
    import.meta.env.VITE_CAMPUS_EMAIL_DOMAIN || "student.itk.ac.id",
} as const;
