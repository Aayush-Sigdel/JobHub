import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-option";
import { CollaborationShell } from "@/components/collaboration/collaboration-shell";

export default async function CollaborationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) redirect("/sign-in?callbackUrl=%2Fcollaborators");
  if (session.user?.employer) redirect("/dashboard");
  return <CollaborationShell>{children}</CollaborationShell>;
}
