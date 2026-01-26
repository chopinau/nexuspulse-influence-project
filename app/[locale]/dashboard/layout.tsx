import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ReactNode } from "react";

export default async function DashboardLayout({
  children,
  params: { locale }
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/api/auth/signin?callbackUrl=/${locale}/dashboard`);
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <nav className="sticky top-24 space-y-2 bg-cyber-panel backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Menu
              </div>
              <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors">
                Overview
              </Link>
              <Link href="/premium" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-cyber-neon hover:bg-white/5 transition-colors">
                Insights Engine
              </Link>
              <Link href="/account" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                Account Settings
              </Link>
              <div className="pt-4 mt-4 border-t border-white/10">
                <Link href="/api/auth/signout" className="block px-3 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-red-500/10 transition-colors">
                  Log Out
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}