"use client"

import { Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language-context"

interface MobileSettingsProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  setNavOpen: (value: boolean) => void
}

export function MobileSettings({ isOpen, setIsOpen, setNavOpen }: MobileSettingsProps) {
  const { language } = useLanguage()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setNavOpen(false)
        }}
        className="sm:hidden rounded-full cursor-pointer"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
      </Button>

      {/* Mobile Settings Menu */}
      {isOpen && (
        <div className="sm:hidden absolute top-14 right-0 bg-background border border-border rounded-lg shadow-lg z-40 p-4 w-48">
          <div className="flex flex-col space-y-4">
            <div className="border-b pb-4">
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                {language === "id" ? "Tema" : "Theme"}
              </p>
              <ThemeToggle />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-3">
                {language === "id" ? "Bahasa" : "Language"}
              </p>
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
