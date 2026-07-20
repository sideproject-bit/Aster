import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AccountSettings } from "@/components/AccountSettings";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <AccountSettings email={session.user.email ?? ""} />;
}
