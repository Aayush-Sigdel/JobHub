import { ReactNode } from "react";
import { requireUserRole } from "@/lib/server-user-role";

const layout = async ({ children }: { children: ReactNode }) => {
  await requireUserRole(false);
  return <div>{children}</div>;
};

export default layout;
