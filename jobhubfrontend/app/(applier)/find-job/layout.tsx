import { requireUserRole } from "@/lib/server-user-role";

export default async function FindJobLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUserRole(false);
  return children;
}
