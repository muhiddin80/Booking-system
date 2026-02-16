"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Calendar, Ticket, Zap } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Helper to determine if a link is active
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm dark:bg-gray-900/90 dark:border-gray-800">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/events" className="flex items-center space-x-3 group">
              <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Event<span className="text-indigo-600 dark:text-indigo-400">Sync</span>
              </h1>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
              <NavLink
                href="/events"
                active={isActive("/events")}
                icon={<Calendar className="w-4 h-4" />}
                label="Explore"
              />
              <NavLink
                href="/bookings"
                active={isActive("/bookings")}
                icon={<Ticket className="w-4 h-4" />}
                label="My Tickets"
              />
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider dark:text-indigo-400">
                Member
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {user?.name || "Guest"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="group flex items-center space-x-2 bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-200 font-medium dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <span className="text-sm font-semibold">Sign Out</span>
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Sub-component to keep code DRY and clean
function NavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  const { resolvedTheme } = useTheme();
  
  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-indigo-100 text-indigo-700 shadow-sm border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300"
          : resolvedTheme === 'dark'
            ? "text-gray-400 hover:bg-gray-800 hover:text-gray-100 border border-transparent"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
