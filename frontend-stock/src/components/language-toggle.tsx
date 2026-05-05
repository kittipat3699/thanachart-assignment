"use client";

import { useLocale } from "@/contexts/locale-context";
import { Button } from "@/components/ui/button";

export function LanguageToggle(): React.JSX.Element {
  const { language, setLanguage } = useLocale();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/75 bg-white/52 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl">
      <Button
        type="button"
        size="sm"
        variant={language === "th" ? "default" : "ghost"}
        onClick={() => setLanguage("th")}
      >
        ไทย
      </Button>
      <Button
        type="button"
        size="sm"
        variant={language === "en" ? "default" : "ghost"}
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
    </div>
  );
}
