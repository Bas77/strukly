"use client"

import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface MobileNavProps {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  setSettingsOpen: (value: boolean) => void
}

export function MobileNav({ isOpen, setIsOpen, setSettingsOpen }: MobileNavProps) {
  const { language } = useLanguage()
  const t = translations[language]
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success(language === "id" ? "Berhasil logout" : "Logged out successfully")
      router.push("/")
      setIsOpen(false)
    } catch (error) {
      console.error("Logout error:", error)
      toast.error(language === "id" ? "Gagal logout" : "Failed to logout")
    }
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSettingsOpen(false)
        }}
        className="sm:hidden rounded-full cursor-pointer"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden absolute top-14 left-0 right-0 bg-background border-b border-border shadow-lg z-40">
          <div className="flex flex-col p-4 space-y-2">
            <Link href="/detect" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start cursor-pointer text-base">
                {t.deteksi_struk_button}
              </Button>
            </Link>
            <Link href="/revenue" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start cursor-pointer text-base">
                {t.laporan}
              </Button>
            </Link>
            {!user && (
              <>
                <Link href="/login" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start cursor-pointer text-base">
                    {t.masuk}
                  </Button>
                </Link>
                <Link href="/register" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start cursor-pointer text-base">
                    {t.daftar}
                  </Button>
                </Link>
              </>
            )}
            {user && (
              <Button
                variant="ghost"
                className="w-full justify-start cursor-pointer text-base"
                onClick={handleLogout}
              >
                {language === "id" ? "Keluar" : "Logout"}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
