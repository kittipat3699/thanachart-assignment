"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/locale-context";
import { signInAdmin } from "@/lib/admin-auth";
import { t } from "@/lib/i18n";

export default function AdminLoginPage(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLocale();
  const [email, setEmail] = useState("admin+1777883883539@mock-com.local");
  const [password, setPassword] = useState("Adm!YKox9guGrHE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInAdmin(email, password);
      router.replace("/admin/items");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
      <Card className="w-full max-w-md space-y-5 rounded-[30px] p-7 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Admin Console
            </p>
            <h1 className="liquid-title text-3xl font-semibold">
              {t(language, "adminLogin")}
            </h1>
          </div>
          <LanguageToggle />
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              {t(language, "email")}
            </span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">
              {t(language, "password")}
            </span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : t(language, "signIn")}
          </Button>
        </form>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </Card>
    </main>
  );
}
