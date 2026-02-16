import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const navItems = [
  { label: "Profile", href: "/dashboard" },
  { label: "Upload Resume", href: "/dashboard/upload" },
  { label: "Skills", href: "/dashboard/skills" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-6">
        <Link href="/dashboard" className="mb-8 block text-xl font-bold">
          EliteApply
        </Link>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-14 items-center justify-end border-b px-6">
          <UserButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
