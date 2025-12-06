"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Camera, Edit2, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { detectReceiptOCR } from "@/lib/ocr-client"
import { autoCorrectItemName } from "@/components/ocr-detector"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { LanguageToggle } from "@/components/language-toggle"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { createReceipt } from "@/lib/db-service"
import { uploadReceiptImage } from "@/lib/storage-service"
import { toast } from "sonner"
import { UserNav } from "@/components/user-nav"

interface Item {
  id: string
  name: string
  quantity: number
  price: number
}

interface Receipt {
  id: string
  merchant: string
  date: string
  items: Item[]
  total: number
  timestamp: Date
}

export default function DetectPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const { user, loading } = useAuth()
  const router = useRouter()

  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Item | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [merchant, setMerchant] = useState("")
  const [isDragActive, setIsDragActive] = useState(false)
  const [saveImageToStorage, setSaveImageToStorage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = async () => {
        setUploadedImage(reader.result as string)

        setIsProcessing(true)
        try {
          const result = await detectReceiptOCR(reader.result as string)
          setItems(
            result.items.map((item: { name: string; quantity: any; price: any }, idx: { toString: () => any }) => ({
              id: idx.toString(),
              name: autoCorrectItemName(item.name),
              quantity: item.quantity,
              price: item.price,
            })),
          )
          setMerchant(result.merchant)
        } catch (error) {
          console.error("OCR detection error:", error)
          toast.error(language === "id" ? "Gagal mendeteksi struk" : "Failed to detect receipt")
        } finally {
          setIsProcessing(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setEditValues({ ...item })
  }

  const handleSaveEdit = () => {
    if (editValues) {
      setItems(items.map((item) => (item.id === editingId ? editValues : item)))
      setEditingId(null)
      setEditValues(null)
    }
  }

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleAddItem = () => {
    const newItem: Item = {
      id: Date.now().toString(),
      name: "Item Baru",
      quantity: 1,
      price: 0,
    }
    setItems([...items, newItem])
  }

  const totalRevenue = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  const handleSaveReceipt = async () => {
    if (items.length === 0 || !user) return

    setIsSaving(true)

    try {
      // Optionally upload image to Firebase Storage
      let imageUrl: string | null = null
      if (saveImageToStorage && imageFile) {
        setUploadProgress(0)
        imageUrl = await uploadReceiptImage(imageFile, user.uid, (p) => setUploadProgress(p))
      }

      // Save receipt to Firestore with processed data (items, qty, total)
      // Image URL is optional and only stored if user chose to save the image
      await createReceipt({
        userId: user.uid,
        imageUrl,
        storeName: merchant || (language === "id" ? "Merchant Tidak Diketahui" : "Unknown Merchant"),
        date: new Date().toISOString().split("T")[0],
        totalAmount: totalRevenue,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price,
        })),
        category: "General",
        paymentMethod: "Cash",
      })

      toast.success(language === "id" ? "Struk berhasil disimpan!" : "Receipt saved successfully!")

      // Reset form
      setUploadedImage(null)
      setImageFile(null)
      setItems([])
      setMerchant("")

      // Redirect to revenue page
      setTimeout(() => {
        router.push("/revenue")
      }, 1000)
    } catch (error: any) {
      console.error("Save receipt error:", error)
      toast.error(error.message || (language === "id" ? "Gagal menyimpan struk" : "Failed to save receipt"))
    } finally {
      setIsSaving(false)
      setUploadProgress(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">{t.deteksi_struk_button}</h1>
            </div>
            <div className="flex gap-2">
              <LanguageToggle />
              <Link href="/revenue">
                <Button variant="outline" className="bg-transparent text-xs sm:text-sm font-semibold hover:bg-accent! cursor-pointer transition-colors">
                  {t.laporan}
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div className="grid md:grid-cols-2 gap-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Image Upload */}
          <motion.div className="space-y-4" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-2xl font-bold">{t.ambil_foto_struk}</h2>
            <Card
              className={`border-border/50 border-2 border-dashed p-8 cursor-pointer hover:border-primary/50 transition-colors min-h-[400px] min-w-[400px] flex items-center justify-center ${isDragActive ? 'border-primary bg-primary/10' : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={e => { e.preventDefault(); setIsDragActive(false); }}
              onDrop={e => {
                e.preventDefault();
                setIsDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    setUploadedImage(reader.result as string);
                    setIsProcessing(true);
                    try {
                      const result = await detectReceiptOCR(reader.result as string);
                      setItems(result.items.map((item: { name: string; quantity: any; price: any }, idx: { toString: () => any }) => ({
                        id: idx.toString(),
                        name: autoCorrectItemName(item.name),
                        quantity: item.quantity,
                        price: item.price,
                      })));
                      setMerchant(result.merchant);
                    } catch (error) {
                      console.error("OCR detection error:", error);
                      toast.error(language === "id" ? "Gagal mendeteksi struk" : "Failed to detect receipt");
                    } finally {
                      setIsProcessing(false);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            >
              <label className="cursor-pointer w-full flex flex-col items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadedImage ? (
                  <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt={t.ganti_foto}
                      className="w-full rounded-lg max-h-96 object-cover"
                    />
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadedImage(null);
                        setItems([]);
                        setMerchant("");
                      }}
                    >
                      {t.ganti_foto}
                    </Button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 py-8">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Camera className="w-12 h-12 text-primary" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <p className="font-semibold">{t.klik_drag}</p>
                      <p className="text-sm text-muted-foreground">{t.png_jpg}</p>
                      {isDragActive && (
                        <p className="text-primary font-semibold mt-2">Drop file here...</p>
                      )}
                    </div>
                  </div>
                )}
              </label>
            </Card>
          </motion.div>

          {/* Items Detected */}
          <motion.div className="space-y-4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-2xl font-bold">{t.data_terdeteksi}</h2>
            <Card className="border-border/50 p-6 space-y-4 overflow-visible">
              {merchant && (
                <motion.div
                  className="p-3 bg-primary/10 rounded-lg border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-sm text-muted-foreground">{t.merchant}</p>
                  <p className="font-semibold text-primary">{merchant}</p>
                </motion.div>
              )}

              {isProcessing && (
                <motion.div
                  className="flex items-center gap-2 py-4 justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{t.mendeteksi_struk}</p>
                </motion.div>
              )}

              {/* Items List */}
              <AnimatePresence>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {editingId === item.id ? (
                        <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
                          <input
                            type="text"
                            value={editValues?.name || ""}
                            onChange={(e) => setEditValues(editValues ? { ...editValues, name: e.target.value } : null)}
                            className="w-full max-w-full px-3 py-2 bg-background border border-border rounded text-sm"
                            placeholder={t.nama_item}
                          />
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editValues?.quantity || 0}
                              onChange={(e) =>
                                setEditValues(
                                  editValues ? { ...editValues, quantity: Number.parseInt(e.target.value) || 0 } : null,
                                )
                              }
                              className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded text-sm"
                              placeholder={t.qty}
                            />
                            <input
                              type="number"
                              value={editValues?.price || 0}
                              onChange={(e) =>
                                setEditValues(
                                  editValues ? { ...editValues, price: Number.parseInt(e.target.value) || 0 } : null,
                                )
                              }
                              className="flex-1 min-w-0 px-3 py-2 bg-background border border-border rounded text-sm"
                              placeholder={t.harga}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-primary text-white hover:bg-primary/80 cursor-pointer"
                              onClick={handleSaveEdit}
                            >
                              <Save className="w-4 h-4 mr-1" /> {t.simpan}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-transparent hover:bg-accent! cursor-pointer"
                              onClick={() => setEditingId(null)}
                            >
                              {t.batal}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}x @ Rp {item.price.toLocaleString("id-ID")}
                            </p>
                            <p className="font-semibold text-primary">
                              Rp {(item.quantity * item.price).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="cursor-pointer" onClick={() => handleEdit(item)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="cursor-pointer" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>

              <Button variant="outline" className="w-full bg-transparent hover:bg-accent! cursor-pointer" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" /> {t.tambah_item}
              </Button>

              {/* Total */}
              {items.length > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t.total}</span>
                    <span className="text-2xl font-bold text-primary">Rp {totalRevenue.toLocaleString("id-ID")}</span>
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/80 text-white cursor-pointer"
                    onClick={handleSaveReceipt}
                    disabled={isProcessing || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {uploadProgress !== null ? (
                          <>{language === "id" ? "Mengunggah" : "Uploading"} {uploadProgress}%</>
                        ) : (
                          <>{language === "id" ? "Menyimpan..." : "Saving..."}</>
                        )}
                      </>
                    ) : (
                      t.simpan_database
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </main>
  )
}
