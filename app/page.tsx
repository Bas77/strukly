"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, Camera, TrendingUp, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import SpotlightCard from "@/components/SpotlightCard"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase" // Import Firebase auth
import { UserNav } from "@/components/user-nav"
import { MobileNav } from "@/components/mobile-nav"
import { MobileSettings } from "@/components/mobile-settings"
import { Chatbot } from "@/components/chatbot"

export default function HomePage() {
  const { language } = useLanguage()
  const t = translations[language]
  const [isLoggedIn, setIsLoggedIn] = useState(false) // State untuk login
  const [user, setUser] = useState(null) // State untuk data pengguna
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false)

  useEffect(() => {
    // Pantau perubahan status login
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true)
        setUser(currentUser) // Simpan data pengguna
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    })

    return () => unsubscribe() // Bersihkan listener saat komponen unmount
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/10 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">S</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Strukly</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              <Link href="/revenue">
                <Button variant="outline" className="bg-transparent text-xs sm:text-sm font-semibold hover:bg-accent! cursor-pointer transition-colors">
                  {t.laporan}
                </Button>
              </Link>
              <LanguageToggle />
              <ThemeToggle />
              {isLoggedIn ? (
                <UserNav />
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="bg-transparent text-xs sm:text-sm hover:bg-accent! cursor-pointer">
                      {t.masuk}
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm py-1 sm:py-2 cursor-pointer">
                      {t.daftar}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="sm:hidden flex items-center gap-2">
              <MobileSettings isOpen={isMobileSettingsOpen} setIsOpen={setIsMobileSettingsOpen} setNavOpen={setIsMobileNavOpen} />
              <MobileNav isOpen={isMobileNavOpen} setIsOpen={setIsMobileNavOpen} setSettingsOpen={setIsMobileSettingsOpen} />
            </div>
          </div>
        </div>
      </nav>

      <motion.section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance leading-tight">
                {t.ubah_struk_jadi}{" "}
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  {t.pendapatan}
                </span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed">
                {t.dokumentasi_struk}
              </p>
            </div>
            <motion.div className="flex flex-col sm:flex-row gap-3 pt-2" variants={itemVariants}>
              <Link href="/detect" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/80 hover:scale-102 text-primary-foreground w-full sm:w-auto text-sm sm:text-base cursor-pointer"
                >
                  {t.deteksi_struk_button} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/revenue" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-sm sm:text-base hover:bg-accent! hover:scale-102 cursor-pointer">
                  {t.lihat_laporan}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(81, 255, 73, 0.2)">
            <img
              src="/hero-img.png"
              alt="Testing Image"
              className="w-full h-full object-cover rounded-2xl"
            />
          </SpotlightCard>
        </div>

        <motion.section
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 md:mt-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-border/50 hover:border-primary/20 transition-colors h-full">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold">{t.deteksi_otomatis}</h3>
                <p className="text-sm text-muted-foreground">{t.ai_membaca}</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="border-border/50 hover:border-primary/20 transition-colors h-full">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold">{t.analitik_lengkap}</h3>
                <p className="text-sm text-muted-foreground">{t.laporan_pendapatan}</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <Card className="border-border/50 hover:border-primary/20 transition-colors h-full">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold">{t.tracking_akurat}</h3>
                <p className="text-sm text-muted-foreground">{t.pantau_omz}</p>
              </div>
            </Card>
          </motion.div>
        </motion.section>
      </motion.section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground py-8 md:py-12 mt-8 md:mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t.siap_optimalkan}</h2>
          <p className="text-sm sm:text-base opacity-90 max-w-2xl mx-auto">{t.bergabung_ribuan}</p>
          <Link href="/detect">
            <Button size="lg" variant="secondary" className="mt-2 text-xs sm:text-sm cursor-pointer">
              {t.mulai_deteksi} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-semibold text-sm sm:text-base">Strukly</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.copyright}</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </main>
  )
}
