"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, Calendar, Moon, Sun } from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"

const dailyData = [
  { date: "Sen", revenue: 2400 },
  { date: "Sel", revenue: 2210 },
  { date: "Rab", revenue: 2290 },
  { date: "Kam", revenue: 2000 },
  { date: "Jum", revenue: 2181 },
  { date: "Sab", revenue: 2500 },
  { date: "Min", revenue: 2100 },
]

const categoryData = [
  { name: "Makanan", value: 35, revenue: 10500000 },
  { name: "Minuman", value: 25, revenue: 7500000 },
  { name: "Lainnya", value: 40, revenue: 12000000 },
]

// Green shade palette: different shades of #48d390
const CATEGORY_COLORS = [
  "#48d390", // Light green
  "#2db877", // Medium green
  "#1a9d5f", // Dark green
]

export default function RevenuePage() {
  const { language } = useLanguage()
  const t = translations[language]

  const [filter, setFilter] = useState("today")
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    const theme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(theme === "dark" || (theme === null && prefersDark))
  }, [])

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

  const getRevenueStats = () => {
    switch (filter) {
      case "today":
        return { total: "Rp 2.100.000", trend: "+12%", period: "Hari Ini" }
      case "week":
        return { total: "Rp 15.681.000", trend: "+8%", period: "Minggu Ini" }
      case "month":
        return { total: "Rp 65.428.000", trend: "+15%", period: "Bulan Ini" }
      case "year":
        return { total: "Rp 786.336.000", trend: "+22%", period: "Tahun Ini" }
      default:
        return { total: "Rp 0", trend: "0%", period: "" }
    }
  }

  const stats = getRevenueStats()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-10 sm:h-10">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl font-bold">{t.laporan_pendapatan_title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Language Toggle & Theme Toggle */}
              <LanguageToggle />
              <ThemeToggle />

              <Link href="/detect">
                <Button className="bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4">
                  {t.deteksi_struk}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <motion.section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Filter Section */}
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
                  className={`text-xs sm:text-sm ${filter === option.value ? "bg-primary text-white" : ""}`}
                >
                  {option.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Stats */}
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/80">
              <div className="p-4 sm:p-6 space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">{stats.period}</p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-balance break-words">{stats.total}</h2>
                <p className="text-xs sm:text-sm text-primary font-semibold">
                  {stats.trend} {t.dari_periode_sebelumnya}
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
                  {filter === "today" ? "8" : filter === "week" ? "52" : filter === "month" ? "215" : "2580"}
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
                  {filter === "today"
                    ? "Rp 262.500"
                    : filter === "week"
                      ? "Rp 301.558"
                      : filter === "month"
                        ? "Rp 304.316"
                        : "Rp 304.774"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">{t.per_transaksi}</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div className="grid lg:grid-cols-3 gap-4 md:gap-6" variants={containerVariants}>
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="border-border/50 p-4 md:p-6 bg-gradient-to-br from-card/80 to-card">
              <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0" />
                {t.tren_pendapatan}
              </h3>
              <div className="w-full h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#48d390" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#48d390" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
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
                {t.kategori}
              </h3>
              <div className="w-full space-y-4">
                <div className="h-56 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                        onMouseLeave={() => setActiveCategoryIndex(null)}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            opacity={activeCategoryIndex === null || activeCategoryIndex === index ? 1 : 0.5}
                            style={{ cursor: "pointer", transition: "opacity 0.3s ease" }}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value, name, props) => {
                          if (name === "value") {
                            return `${value}%`
                          }
                          return value
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold text-sm">{data.name}</p>
                                <p className="text-xs text-muted-foreground">{data.value}%</p>
                                <p className="text-sm font-bold text-primary mt-1">
                                  Rp {(data.revenue / 1000000).toFixed(1)}M
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
                  {categoryData.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50"
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[idx] }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold">{item.value}%</span>
                        {activeCategoryIndex === idx && (
                          <motion.span
                            className="text-xs font-bold text-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            Rp {(item.revenue / 1000000).toFixed(1)}M
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div className="mt-6 md:mt-8" variants={itemVariants}>
          <Card className="border-border/50 p-4 md:p-6 bg-gradient-to-br from-card/80 to-card">
            <h3 className="text-base md:text-lg font-semibold mb-4">{t.laporan_harian}</h3>
            <div className="space-y-2 md:space-y-3">
              {dailyData.map((day, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.05 }}
                >
                  <span className="font-medium text-xs sm:text-sm text-muted-foreground w-10 flex-shrink-0">
                    {day.date}
                  </span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-0">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.revenue / 2500) * 100}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.05 }}
                    />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm flex-shrink-0">
                    Rp {(day.revenue / 1000).toFixed(0)}K
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.section>
    </main>
  )
}
