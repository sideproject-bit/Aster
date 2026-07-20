import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WikisDashboard } from "@/components/WikisDashboard";

export default async function WikisPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <WikisDashboard />;
}
