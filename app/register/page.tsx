"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const { signup, loginWithGoogle } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [diag, setDiag] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(language === "id" ? "Password tidak cocok" : "Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError(language === "id" ? "Password minimal 8 karakter" : "Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      await signup(email, password, name)
      toast.success(language === "id" ? "Akun berhasil dibuat!" : "Account created successfully!")
      router.push("/detect")
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || (language === "id" ? "Pendaftaran gagal. Silakan coba lagi." : "Registration failed. Please try again."))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/debug')
        if (!mounted) return
        const json = await res.json()
        setDiag(json)
        // Also print to console for easier debugging
        // eslint-disable-next-line no-console
        console.info('Firebase debug:', json)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Could not fetch /debug', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      toast.success(language === "id" ? "Akun berhasil dibuat dengan Google!" : "Account created with Google successfully!")
      router.push("/detect")
    } catch (error: any) {
      console.error("Google signup error:", error)
      setError(error.message || (language === "id" ? "Pendaftaran dengan Google gagal." : "Google signup failed."))
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{t.laporan}</span>
            </Link>
            <div className="flex gap-2 items-center">
              {/* Language Toggle */}
              <LanguageToggle />
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Logo and Title */}
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <motion.div
              className="flex justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
            </motion.div>
            <motion.h1 className="text-3xl font-bold" variants={itemVariants}>
              {t.register_title}
            </motion.h1>
            <motion.p className="text-muted-foreground" variants={itemVariants}>
              {t.mulai_deteksi}
            </motion.p>
          </motion.div>

          {/* Register Form */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 shadow-lg">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <motion.div
                    className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive flex gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="name" className="block text-sm font-medium">
                    {t.email}
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={language === "id" ? "Nama bisnis Anda" : "Your business name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm font-medium">
                    {t.email}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm font-medium">
                    {t.password}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === "id" ? "Minimal 8 karakter" : "At least 8 characters"}
                  </p>
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium">
                    {t.confirm_password}
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input border-border/50 focus:border-primary transition-colors"
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (language === "id" ? "Sedang Membuat Akun..." : "Creating Account...") : t.daftar}
                  </Button>
                </motion.div>

                <motion.div className="relative" variants={itemVariants}>
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {language === "id" ? "Atau daftar dengan" : "Or sign up with"}
                    </span>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignup}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {language === "id" ? "Google" : "Google"}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>

          {/* Sign In Link */}
          <motion.div className="text-center" variants={itemVariants}>
            <p className="text-sm text-muted-foreground">
              {t.sudah_punya_akun}{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                {t.login_sekarang}
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}
