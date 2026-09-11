"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { LoginFormInput, loginSchema } from "@/lib/validation/auth";
import {
  AuthCharacters,
  AuthFieldType,
} from "@/components/auth/auth-characters";

import { signIn, getSession } from "next-auth/react";

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const BrandMark = () => (
  <svg
    className="w-8 h-8 text-neutral-900"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
  </svg>
);

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<AuthFieldType>("none");
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isHoveringGoogle, setIsHoveringGoogle] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isSubmitted, touchedFields },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: {
      email: emailParam,
      password: "",
    },
  });

  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  const emailValue = watch("email") || "";
  const passwordValue = watch("password") || "";

  const onSubmit = async (data: LoginFormInput) => {
    setAuthError("");
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setAuthError("Invalid email or password. Please check your credentials.");
      return;
    }

    const session = await getSession();
    const callbackUrl = searchParams.get("callbackUrl");
    const isEmployer = Boolean(session?.user?.employer);

    if (isEmployer) {
      const isCandidateUrl =
        callbackUrl &&
        ["/home", "/job-tracker", "/find-job", "/task"].some((route) =>
          callbackUrl.startsWith(route),
        );
      const target =
        callbackUrl && !isCandidateUrl && callbackUrl !== "/"
          ? callbackUrl
          : "/dashboard";
      window.location.href = target;
    } else {
      const isEmployerUrl =
        callbackUrl &&
        [
          "/dashboard",
          "/candidates",
          "/manage-jobs",
          "/manage-job",
          "/post-job",
          "/post-task",
        ].some((route) => callbackUrl.startsWith(route));
      const target =
        callbackUrl && !isEmployerUrl && callbackUrl !== "/"
          ? callbackUrl
          : "/home";
      window.location.href = target;
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/home" });
  };

  const clearAuthError = () => {
    if (authError) setAuthError("");
  };

  const getActiveErrorMessage = () => {
    if (authError) return authError;
    if (focusedField === "email" && touchedFields.email && errors.email)
      return errors.email.message || "";
    if (
      focusedField === "password" &&
      touchedFields.password &&
      errors.password
    )
      return errors.password.message || "";
    if (isSubmitted) {
      return errors.email?.message || errors.password?.message || "";
    }
    return "";
  };

  const errorMessage = getActiveErrorMessage();

  const emailReg = register("email");
  const passwordReg = register("password");

  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-white selection:bg-neutral-900 selection:text-white">
      {/* Left Column: Character Stage with Floating Cloud */}
      <div className="w-full md:w-[52%] lg:w-[55%] xl:w-[58%] bg-[#ECECEE] min-h-[480px] md:min-h-screen flex flex-col justify-between pt-20 sm:pt-24 px-6 sm:px-10 lg:px-12 pb-0 relative overflow-hidden">
        {/* Grounded Interactive Characters + Cloud Bubble */}
        <div className="relative w-full flex-1 flex flex-col justify-end items-center pb-0">
          <AuthCharacters
            focusedField={focusedField}
            showPassword={showPassword}
            isSubmitting={isSubmitting}
            isHoveringSubmit={isHoveringSubmit}
            isHoveringGoogle={isHoveringGoogle}
            emailValue={emailValue}
            passwordValue={passwordValue}
            errorMessage={errorMessage}
            pageType="signin"
            className="w-full max-w-[580px] lg:max-w-[680px] xl:max-w-[760px]"
          />
        </div>
      </div>

      {/* Right Column: Full-height clean form page */}
      <div className="w-full md:w-[48%] lg:w-[45%] xl:w-[42%] min-h-[calc(100vh-480px)] md:min-h-screen bg-white flex flex-col justify-center items-center pt-24 pb-12 px-6 sm:px-12 lg:px-16 xl:px-20 text-neutral-900">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Brand Sparkle Logo */}
          <div className="flex justify-center mb-6">
            <BrandMark />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-neutral-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-base text-neutral-500 font-medium">
              Please enter your details to sign in
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-neutral-800 uppercase tracking-wide"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                name={emailReg.name}
                ref={emailReg.ref}
                onChange={(e) => {
                  emailReg.onChange(e);
                  clearAuthError();
                }}
                onBlur={(e) => {
                  emailReg.onBlur(e);
                  setFocusedField("none");
                }}
                onFocus={() => {
                  setFocusedField("email");
                  clearAuthError();
                }}
                placeholder="name@company.com"
                className={`w-full h-13 px-4 rounded-2xl bg-neutral-50 border-2 ${
                  errors.email && (touchedFields.email || isSubmitted)
                    ? "border-rose-400 bg-rose-50/20"
                    : "border-neutral-200"
                } text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all`}
              />
              {errors.email && (touchedFields.email || isSubmitted) && (
                <p className="text-xs font-semibold text-rose-500 mt-1 pl-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-neutral-800 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  name={passwordReg.name}
                  ref={passwordReg.ref}
                  onChange={(e) => {
                    passwordReg.onChange(e);
                    clearAuthError();
                  }}
                  onBlur={(e) => {
                    passwordReg.onBlur(e);
                    setFocusedField("none");
                  }}
                  onFocus={() => {
                    setFocusedField("password");
                    clearAuthError();
                  }}
                  placeholder="••••••••"
                  className={`w-full h-13 px-4 pr-12 rounded-2xl bg-neutral-50 border-2 ${
                    errors.password && (touchedFields.password || isSubmitted)
                      ? "border-rose-400 bg-rose-50/20"
                      : "border-neutral-200"
                  } text-neutral-900 text-base font-medium placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-neutral-900/10 focus:border-neutral-900 focus:bg-white transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 transition-colors p-1.5 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (touchedFields.password || isSubmitted) && (
                <p className="text-xs font-semibold text-rose-500 mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Form-level Auth error message */}
            {authError && (
              <p className="text-xs font-semibold text-rose-500 mt-1.5 pl-1">
                {authError}
              </p>
            )}

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <span>Remember for 30 days</span>
              </label>

              <Link
                href="/forget-password"
                className="text-sm font-bold text-neutral-900 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onMouseEnter={() => setIsHoveringSubmit(true)}
              onMouseLeave={() => setIsHoveringSubmit(false)}
              className="w-full h-13 sm:h-14 mt-2 bg-[#18181B] hover:bg-neutral-800 active:scale-[0.99] text-white rounded-full font-bold text-base sm:text-lg transition-all duration-150 flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Log In"
              )}
            </button>

            {/* Social Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              onMouseEnter={() => setIsHoveringGoogle(true)}
              onMouseLeave={() => setIsHoveringGoogle(false)}
              className="w-full h-13 sm:h-14 bg-[#F4F4F6] hover:bg-[#EAEAEF] active:scale-[0.99] text-neutral-800 rounded-full font-bold text-base border-2 border-neutral-200/80 transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer shadow-sm"
            >
              <GoogleIcon />
              <span>Log in with Google</span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-8 text-sm text-neutral-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-bold text-neutral-900 hover:underline transition-colors ml-1"
            >
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-800" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
