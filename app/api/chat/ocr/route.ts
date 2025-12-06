// app/api/chat/ocr/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY; // Atau KOLOSAL_API_KEY
const MODEL_NAME = "gemini-2.0-flash"; 
const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) return NextResponse.json({ error: "Image missing" }, { status: 400 });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    // PERUBAHAN PROMPT: Tambahkan field "total_amount"
    const prompt = `
      Extract receipt data into strict JSON.
      JSON Structure:
      {
        "merchant": "Store Name",
        "total_amount": 0,  // <-- Cari angka Total Akhir (Grand Total) di struk
        "items": [
          {
            "name": "Item Name",
            "quantity": 1, 
            "price": 10000 // Harga SATUAN (Unit Price). Jika struk hanya menampilkan total per baris, bagi dengan quantity.
          }
        ]
      }
      Rules:
      - "total_amount" harus angka final (termasuk pajak/diskon).
      - Return ONLY raw JSON.
    `;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64Data } }
        ]
      }]
    };

    const res = await fetch(`${MODEL_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // ... (Sisa kode sama: error handling & parsing JSON) ...
    
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
       text = text.substring(firstBrace, lastBrace + 1);
    }

    return NextResponse.json(JSON.parse(text));

  } catch (err: any) {
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}
