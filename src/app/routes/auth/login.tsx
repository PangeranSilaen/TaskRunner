import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { signIn } from "@/features/auth/api";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setServerError(null);
    try {
      await signIn(values);
      const from =
        (location.state as { from?: { pathname: string } } | null)?.from
          ?.pathname ?? "/home";
      navigate(from, { replace: true });
    } catch {
      setServerError("Email atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="w-full rounded-2xl bg-surface p-5 shadow-card">
      <div className="mb-5 grid grid-cols-2 rounded-xl bg-surface-muted p-1 text-sm font-medium">
        <span className="rounded-lg bg-surface py-2 text-center text-primary shadow-soft">
          Masuk
        </span>
        <Link
          to="/auth/register"
          className="py-2 text-center text-ink-soft"
        >
          Daftar
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email Kampus"
          type="email"
          placeholder="nim@student.itk.ac.id"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Masuk
        </Button>
      </form>
    </div>
  );
}
