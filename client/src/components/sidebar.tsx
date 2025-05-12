import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { Bell } from "lucide-react";
import {
  FinsmartIcon,
  DashboardIcon,
  TransactionsIcon,
  AnalysisIcon,
  ForecastIcon,
  ProfileIcon,
  SettingsIcon,
  UserManagementIcon,
  AIManagementIcon,
  PerformanceIcon,
  LogoutIcon,
} from "@/components/icons";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const isMobile = useMobile();
  
  const [activeRole, setActiveRole] = useState<"user" | "admin">(
    user?.role === "admin" ? "admin" : "user"
  );

  // Memoize navigation items to prevent unnecessary re-renders
  const userNavItems = useMemo(
    () => [
      {
        name: "Bảng điều khiển",
        href: "/",
        icon: DashboardIcon,
      },
      {
        name: "Thu chi",
        href: "/transactions",
        icon: TransactionsIcon,
      },
      {
        name: "Phân tích",
        href: "/analysis",
        icon: AnalysisIcon,
      },
      {
        name: "Dự báo",
        href: "/forecast",
        icon: ForecastIcon,
      },
    ],
    []
  );

  const accountItems = useMemo(
    () => [
      {
        name: "Hồ sơ cá nhân",
        href: "/profile",
        icon: ProfileIcon,
      },
      {
        name: "Cài đặt",
        href: "/settings",
        icon: SettingsIcon,
      },
    ],
    []
  );

  const adminNavItems = useMemo(
    () => [
      {
        name: "Bảng quản trị",
        href: "/admin",
        icon: DashboardIcon,
      },
      {
        name: "Quản lý người dùng",
        href: "/admin/users",
        icon: UserManagementIcon,
      },
      {
        name: "Quản lý AI",
        href: "/admin/ai",
        icon: AIManagementIcon,
      },
      {
        name: "Thuật toán gợi ý AI",
        href: "/admin/ai-parameters",
        icon: AIManagementIcon,
      },
      {
        name: "Báo cáo hiệu suất",
        href: "/admin/performance",
        icon: PerformanceIcon,
      },
    ],
    []
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const initials = user
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-white dark:bg-card transition duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo and brand */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center space-x-2">
            <FinsmartIcon className="h-8 w-8 text-primary-dark" />
            <span className="text-lg font-bold text-primary-dark dark:text-primary">
              FinSmart
            </span>
          </div>

          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden rounded-md p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* User profile summary */}
        <div className="flex flex-col items-center px-4 py-5 border-b border-neutral-200 dark:border-neutral-800">
          <Avatar className="h-16 w-16 bg-primary-light text-white text-xl font-medium overflow-hidden">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <h3 className="mt-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {user?.fullName}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {user?.email}
          </p>
          <div className="mt-3 flex items-center">
            <Badge variant="outline" className="bg-success bg-opacity-20 text-success border-0">
              {activeRole === "admin" ? "Admin" : "Người dùng"}
            </Badge>
          </div>
        </div>

        {/* Navigation - User */}
        {activeRole === "user" && (
          <nav className="px-4 py-4">
            <h3 className="px-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Tổng quan
            </h3>
            <div className="mt-2 space-y-1">
              {userNavItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-primary-light bg-opacity-10 text-primary-dark dark:bg-primary-dark dark:bg-opacity-20 dark:text-primary"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      location === item.href
                        ? "text-primary-dark dark:text-primary"
                        : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </div>

            <h3 className="mt-6 px-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Tài khoản
            </h3>
            <div className="mt-2 space-y-1">
              {accountItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-primary-light bg-opacity-10 text-primary-dark dark:bg-primary-dark dark:bg-opacity-20 dark:text-primary"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      location === item.href
                        ? "text-primary-dark dark:text-primary"
                        : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Navigation - Admin */}
        {activeRole === "admin" && (
          <nav className="px-4 py-4">
            <h3 className="px-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Quản trị
            </h3>
            <div className="mt-2 space-y-1">
              {adminNavItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    location === item.href
                      ? "bg-primary-light bg-opacity-10 text-primary-dark dark:bg-primary-dark dark:bg-opacity-20 dark:text-primary"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      location === item.href
                        ? "text-primary-dark dark:text-primary"
                        : "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Logout button */}
        <div className="mt-auto px-4 py-4 border-t border-neutral-200 dark:border-neutral-800">
          {user?.role === "admin" && (
            <Button
              variant="outline"
              className="w-full mb-3"
              onClick={() =>
                setActiveRole(activeRole === "admin" ? "user" : "admin")
              }
            >
              {activeRole === "admin"
                ? "Chuyển sang người dùng"
                : "Chuyển sang admin"}
            </Button>
          )}
          <Button
            variant="default"
            className="w-full bg-primary-dark hover:bg-primary"
            onClick={handleLogout}
          >
            <LogoutIcon className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>
    </>
  );
}

export function AppHeader({
  toggleSidebar,
  title,
}: {
  toggleSidebar: () => void;
  title: string;
}) {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile();

  return (
    <header className="z-10 py-4 bg-white dark:bg-card shadow-sm lg:static lg:overflow-y-visible">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* Left section: Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              type="button"
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-medium text-neutral-800 dark:text-neutral-100">
              {title}
            </h2>
          </div>
        </div>

        {/* Right section: Dark mode toggle and notifications */}
        <div className="flex items-center space-x-4">
          <ModeToggle />

          <button
            type="button"
            className="relative rounded-full text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <span className="sr-only">Xem thông báo</span>
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
