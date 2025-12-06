// lib/ocr-client.ts

export async function detectReceiptOCR(base64Image: string) {
  try {
    // PERBAIKAN: Gunakan endpoint Next.js internal (bukan localhost:8000)
    const response = await fetch("/api/chat/ocr", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error("Failed to call OCR API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("OCR Client Error:", error);
    return { items: [], merchant: "" };
  }
}