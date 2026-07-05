import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(3, "Password is Required"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(20, "Name must be at most 20 characters"),
  email: z.email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(3, "Password is Required")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(
      /[@#$%^&+=!]/,
      "Password must contain a special character (@#$%^&+=!)",
    ),
  employer: z.boolean().optional(),
});

export type LoginFormInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
