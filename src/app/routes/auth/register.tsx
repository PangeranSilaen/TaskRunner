import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { signUp } from "@/features/auth/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);
    try {
      await signUp(values);
      // After sign-up the session is created; send user to verification.
      navigate("/profile/verification", { replace: true });
    } catch (err) {
      const message =
        err instanceof Error && /registered/i.test(err.message)
          ? "Email ini sudah terdaftar. Silakan masuk."
          : "Gagal mendaftar. Silakan coba lagi.";
      setServerError(message);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-surface p-5 shadow-card">
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-surface-muted p-1 text-sm font-medium">
        <Link to="/auth/login" className="py-2 text-center text-ink-soft">
          Masuk
        </Link>
        <span className="rounded-lg bg-surface py-2 text-center text-primary shadow-soft">
          Daftar
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nama Lengkap"
          placeholder="Nama sesuai KTM"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />
        <Input
          label="Email Kampus"
          type="email"
          placeholder="nim@student.itk.ac.id"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Daftar
        </Button>
      </form>
    </div>
  );
}
