import { Suspense } from "react";
import { fetchWithAuth } from "@/lib/service-api";
import NavigationBar from "./_components/navigation/navigation-bar";
import CandidateMobileNav from "./_components/navigation/candidate-mobile-nav";

export default async function ApplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile = null;
  try {
    profile = await fetchWithAuth<any>("/user/profile");
  } catch (e) {
    // Unauthenticated or network error
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Suspense>
        <NavigationBar profile={profile} />
      </Suspense>
      <main className="flex-1 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 pb-20 md:pb-8">
        {children}
      </main>
      <CandidateMobileNav />
    </div>
  );
}
