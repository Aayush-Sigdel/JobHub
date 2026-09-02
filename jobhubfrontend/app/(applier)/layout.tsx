import { fetchWithAuth } from "@/lib/service-api";
import NavigationBar from "./_components/navigation/navigation-bar";
import NavigationBarBottom from "./_components/navigation/navigation-bar-bottom";

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
    <div>
      <NavigationBar profile={profile} />
      <NavigationBarBottom />
      <div className="px-16 py-2">{children}</div>
    </div>
  );
}
