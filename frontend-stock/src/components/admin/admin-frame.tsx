"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { LanguageToggle } from "@/components/language-toggle";
import { hasAdminSession, signOutAdmin } from "@/lib/admin-auth";
import { useLocale } from "@/contexts/locale-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AdminFrame({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLocale();
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    void (async () => {
      try {
        const loggedIn = await hasAdminSession();
        if (!loggedIn) {
          router.replace("/admin/login");
        }
      } catch {
        router.replace("/admin/login");
      }
      setIsChecking(false);
    })();
  }, [isLoginPage, router]);

  const onSignOut = async (): Promise<void> => {
    await signOutAdmin();
    router.replace("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <p className="liquid-shell rounded-2xl px-4 py-2 text-sm">
          Loading admin session...
        </p>
      </main>
    );
  }

  const navItems = [
    { href: "/admin/items", label: t(language, "adminItems") },
    { href: "/admin/orders", label: t(language, "adminOrders") },
  ];

  return (
    <div className="page-enter min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-4 p-4 md:grid-cols-[260px_1fr] md:p-5">
        <aside className="liquid-shell hidden rounded-3xl p-5 md:flex md:flex-col md:gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Admin Console
            </p>
            <h1 className="mt-1 text-2xl font-semibold">TTB CART</h1>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start",
                  pathname.startsWith(item.href)
                    ? "border-primary/40 bg-primary/90 text-primary-foreground shadow-[0_18px_30px_-25px_rgba(65,95,210,.9)]"
                    : "border-white/60 bg-white/35",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            <LanguageToggle />
            <Button
              className="w-full border-red-300/85 bg-red-50/90 text-red-700 hover:bg-red-100"
              variant="destructive"
              onClick={onSignOut}
            >
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="liquid-shell mb-4 rounded-3xl px-4 py-3 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Admin Console
                </p>
                <h1 className="text-lg font-semibold">TTB CART</h1>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <Button
                  className="border-red-300/85 bg-red-50/90 text-red-700 hover:bg-red-100"
                  variant="destructive"
                  size="sm"
                  onClick={onSignOut}
                >
                  Sign out
                </Button>
              </div>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    pathname.startsWith(item.href)
                      ? "border-primary bg-primary/10 text-primary"
                      : "",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="space-y-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
