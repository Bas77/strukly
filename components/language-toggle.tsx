"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"
import { motion } from "framer-motion"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage(language === "id" ? "en" : "id")}
        className="hover:bg-primary cursor-pointer transition-colors text-xs sm:text-sm font-semibold"
      >
        {language === "id" ? "EN" : "ID"}
      </Button>
    </motion.div>
  )
}
