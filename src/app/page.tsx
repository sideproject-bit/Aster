import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingHero } from "@/components/LandingHero";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/wikis");
  }

  return <LandingHero />;
}
