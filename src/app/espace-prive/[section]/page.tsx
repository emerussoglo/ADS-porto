import { notFound } from "next/navigation";
import MemberDashboard from "../page";

const sections = new Set([
  "profil",
  "formations",
  "activites",
  "evaluations",
  "documents",
  "messages",
  "merites",
  "sanctions",
]);

export default async function MemberSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!sections.has(section)) {
    notFound();
  }

  return <MemberDashboard />;
}
