// app/(auth)/action.ts
"use server";

import { setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies"; // adjust path
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { error: "Invalid email or password." };
    }

    const data = await response.json();

    await setAuthCookies(data.accessToken, data.refreshToken);
  } catch (error) {
    return { error: "Failed to connect to the server." };
  }

  redirect("/home");
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect("/sign-in");
}
