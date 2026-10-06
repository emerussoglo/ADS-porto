import type { ReactNode } from "react";
import PrivateSpaceLayout from "@/components/member/PrivateSpaceLayout";

export default function MemberLayout({ children }: { children: ReactNode }) {
  return <PrivateSpaceLayout>{children}</PrivateSpaceLayout>;
}
