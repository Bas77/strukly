"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, Calendar, Moon, Sun, Loader2 } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { LanguageToggle } from "@/components/language-toggle"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { getUserReceipts, getRevenueStats as fetchRevenueStats } from "@/lib/db-service"
import { Receipt, RevenueStats } from "@/lib/types"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileSettings } from "@/components/mobile-settings"
import { MobileNav } from "@/components/mobile-nav"

// Green shade palette: different shades of #48d390
const CATEGORY_COLORS = [
  "#48d390", // Light green
  "#2db877", // Medium green
  "#1a9d5f", // Dark green
]

export default function RevenuePage() {
  const { language } = useLanguage()
  const t = translations[language]
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [filter, setFilter] = useState("today")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeMerchantIndex, setActiveMerchantIndex] = useState<number | null>(null)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  useEffect(() => {
    setMounted(true)
    const theme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(theme === "dark" || (theme === null && prefersDark))
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
      try {
        const { receipts: userReceipts } = await getUserReceipts(user.uid, 100)
        setReceipts(userReceipts)

        let startDate: Date | undefined
        let endDate: Date = new Date()
        const now = new Date()

        switch (filter) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        }

        const stats = await fetchRevenueStats(user.uid, startDate, endDate)
        setRevenueStats(stats)
      } catch (error) {
        console.error("Error fetching revenue data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, filter])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const getPeriodLabel = () => {
    switch (filter) {
      case "today":
        return language === "id" ? "Hari Ini" : "Today"
      case "week":
        return language === "id" ? "Minggu Ini" : "This Week"
      case "month":
        return language === "id" ? "Bulan Ini" : "This Month"
      case "year":
        return language === "id" ? "Tahun Ini" : "This Year"
      default:
        return ""
    }
  }

  const getChartData = () => {
    if (!revenueStats) return []

    switch (filter) {
      case "today": {
        // Show hourly data for today
        return Object.entries(revenueStats.hourlyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([hour, revenue]) => {
            const date = new Date(hour + ":00:00");
            const timeStr = date.toLocaleTimeString(language === "id" ? "id-ID" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            return { date: timeStr, revenue };
          });
      }
      case "week": {
        // Show daily data for the week
        return Object.entries(revenueStats.dailyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-7)
          .map(([date, revenue]) => ({
            date: new Date(date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", { weekday: "short" }),
            revenue,
          }));
      }
      case "month": {
        // Show weekly aggregated data for the month
        const weeklyData: { [key: string]: number } = {};
        Object.entries(revenueStats.dailyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([date, revenue]) => {
            const dateObj = new Date(date);
            const monthStart = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
            const dayOfMonth = dateObj.getDate();
            const week = Math.ceil(dayOfMonth / 7);
            const weekKey = `week${week}`;
            weeklyData[weekKey] = (weeklyData[weekKey] || 0) + revenue;
          });
        
        return Object.entries(weeklyData).map(([week, revenue]) => ({
          date: language === "id" ? `${week.replace("week", "Minggu ")}` : `Week ${week.replace("week", "")}`,
          revenue,
        }));
      }
      case "year": {
        // Show monthly aggregated data for the year
        const monthlyData: { [key: string]: number } = {};
        Object.entries(revenueStats.dailyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .forEach(([date, revenue]) => {
            const dateObj = new Date(date);
            const monthKey = dateObj.toLocaleDateString(language === "id" ? "id-ID" : "en-US", { month: "short" });
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + revenue;
          });
        
        return Object.entries(monthlyData).map(([month, revenue]) => ({
          date: month,
          revenue,
        }));
      }
      default:
        return [];
    }
  };

  const chartData = getChartData();

  const merchantData = revenueStats
    ? Object.entries(revenueStats.merchantBreakdown)
        .sort(([, a], [, b]) => b - a) // Sort by revenue descending
        .map(([name, revenue]) => ({ name, revenue }))
    : []

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !mounted) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* ====================== UNIFIED NAVBAR ====================== */}
<nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">

      {/* Left side – Logo + Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <h1 className="text-xl font-bold hidden sm:block">Strukly</h1>
        </Link>

        {/* Page title on inner pages (Detect & Revenue) */}
        {typeof window !== "undefined" && !window.location.pathname.includes("/detect") && !window.location.pathname.includes("/revenue") ? null : (
          <h2 className="text-lg font-semibold sm:hidden">
            {window.location.pathname.includes("/detect")
              ? t.deteksi_struk_button
              : t.laporan_pendapatan_title}
          </h2>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-3">


        <LanguageToggle />
        <ThemeToggle />

        {/* Logged-in user */}
        {user ? (
          <>
            <Link href="/detect">
              <Button className="bg-primary hover:bg-primary/20! text-white hover:cursor-pointer">
                {t.deteksi_struk_button}
              </Button>
            </Link>
            <UserNav />
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="outline" className="bg-transparent hover:bg-accent/50 ">
                {t.masuk}
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                {t.daftar}
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu buttons */}
      <div className="flex sm:hidden items-center gap-2">
        <MobileSettings isOpen={isMobileSettingsOpen} setIsOpen={setIsMobileSettingsOpen} setNavOpen={setIsMobileNavOpen} />
        <MobileNav isOpen={isMobileNavOpen} setIsOpen={setIsMobileNavOpen} setSettingsOpen={setIsMobileSettingsOpen} />
      </div>
    </div>
  </div>
</nav>
{/* =========================================================== */}

      <motion.section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8" variants={itemVariants}>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "today", label: t.hari_ini },
              { value: "week", label: t.minggu },
              { value: "month", label: t.bulan },
              { value: "year", label: t.tahun },
            ].map((option) => (
              <motion.div key={option.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={filter === option.value ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                  className={`text-xs sm:text-sm cursor-pointer hover:bg-accent/50! ${filter === option.value ? "bg-primary text-white" : ""}`}
                >
                  {option.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/80">
              <div className="p-4 sm:p-6 space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">{getPeriodLabel()}</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance break-words">
                  Rp {revenueStats?.totalRevenue.toLocaleString("id-ID") || "0"}
                </h2>
                <p className="text-xs sm:text-sm text-primary font-semibold">
                  {language === "id" ? "Total Pendapatan" : "Total Revenue"}
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50 hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/80">
              <div className="p-4 sm:p-6 space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {t.jumlah_transaksi}
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  {revenueStats?.totalReceipts || 0}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{t.struk_terdeteksi}</p>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
            <Card className="border-border/50 hover:border-primary/20 transition-colors bg-gradient-to-br from-card/80 to-card">
              <div className="p-4 sm:p-6 space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                  {t.rata_rata}
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  Rp {revenueStats?.averageTransaction.toLocaleString("id-ID") || "0"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{t.per_transaksi}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div className="grid lg:grid-cols-3 gap-4 md:gap-6" variants={containerVariants}>
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="border-border/50 p-4 md:p-6 bg-gradient-to-br from-card/80 to-card">
              <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                {t.tren_pendapatan}
              </h3>
              <div className="w-full h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#48d390" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#48d390" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                    <YAxis 
                      stroke="var(--color-muted-foreground)" 
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `Rp ${(value / 1000000).toFixed(0)}M`;
                        } else if (value >= 1000) {
                          return `Rp ${(value / 1000).toFixed(0)}K`;
                        }
                        return `Rp ${value}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value: any) => `Rp ${value.toLocaleString("id-ID")}`}
                      labelStyle={{ color: "var(--color-foreground)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#48d390"
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                      dot={{ fill: "#48d390", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Pendapatan"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-border/50 p-4 md:p-6 bg-gradient-to-br from-card/80 to-card">
              <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                {language === "id" ? "Merchant Terpopuler" : "Top Merchants"}
              </h3>
              <div className="w-full space-y-4">
                {merchantData.length > 0 ? (
                  <>
                    <div className="h-56 md:h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={merchantData.map((item, idx) => ({
                              ...item,
                              percentage: Math.round((item.revenue / merchantData.reduce((sum, m) => sum + m.revenue, 0)) * 100)
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="revenue"
                            onMouseEnter={(_, index) => setActiveMerchantIndex(index)}
                            onMouseLeave={() => setActiveMerchantIndex(null)}
                          >
                            {merchantData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                                opacity={activeMerchantIndex === null || activeMerchantIndex === index ? 1 : 0.5}
                                style={{ cursor: "pointer", transition: "opacity 0.3s ease" }}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload[0]) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold text-sm">{data.name}</p>
                                    <p className="text-xs text-muted-foreground">{data.percentage}%</p>
                                    <p className="text-sm font-bold text-primary mt-1">
                                      Rp {data.revenue.toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                      {merchantData.map((item, idx) => {
                        const total = merchantData.reduce((sum, m) => sum + m.revenue, 0)
                        const percentage = Math.round((item.revenue / total) * 100)
                        return (
                          <motion.div
                            key={idx}
                            className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                            onMouseEnter={() => setActiveMerchantIndex(idx)}
                            onMouseLeave={() => setActiveMerchantIndex(null)}
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                              />
                              <span className="text-muted-foreground truncate">{item.name}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-semibold">{percentage}%</span>
                              {activeMerchantIndex === idx && (
                                <motion.span
                                  className="text-xs font-bold text-primary"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                >
                                  Rp {item.revenue.toLocaleString("id-ID")}
                                </motion.span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === "id" ? "Belum ada data" : "No data yet"}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>
    </main>
  )
}
