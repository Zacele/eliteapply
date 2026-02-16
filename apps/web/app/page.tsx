import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">EliteApply</h1>
      <p className="text-lg text-muted-foreground">Build your professional profile and land more jobs</p>
      <div className="flex gap-4">
        <Link href="/sign-in" className="rounded-md bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90">
          Sign In
        </Link>
        <Link href="/sign-up" className="rounded-md border px-6 py-3 hover:bg-accent">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
