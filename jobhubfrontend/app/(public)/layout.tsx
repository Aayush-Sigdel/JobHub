import { fetchWithAuth } from "@/lib/service-api";
import NavigationBar from "../(applier)/_components/navigation/navigation-bar";

export default async function UsersLayout({
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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <NavigationBar profile={profile} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
