import { NextResponse } from "next/server";

const API_KEY = process.env.KOLOSAL_API_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "Image missing" }, { status: 400 });
    }

    // PERUBAHAN STRATEGI:
    // Jangan dibersihkan/split! Kirim lengkap dengan "data:image/..."
    // Agar server tahu Mime Type-nya.
    const fullDataURI = image; 

    // Debugging: Pastikan diawali dengan "data:"
    console.log("Mengirim Full Data URI:", fullDataURI.substring(0, 30) + "...");

    const receiptSchema = {
      type: "object",
      properties: {
        merchant: { type: "string" },
        total_amount: { type: "integer" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "integer" },
              price: { type: "integer" }
            },
            required: ["name", "price"]
          }
        }
      },
      required: ["merchant", "items", "total_amount"]
    };

    const response = await fetch("https://api.kolosal.ai/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}` 
      },
      body: JSON.stringify({
        image_data: fullDataURI, // Kirim string lengkap
        auto_fix: true,
        language: "auto", // Ubah ke auto dulu agar lebih fleksibel
        custom_schema: {
          name: "struk_extraction",
          strict: true,
          schema: receiptSchema
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Kolosal API Error:", errorText);
      return NextResponse.json({ error: "Kolosal Error", details: errorText }, { status: 500 });
    }

    const data = await response.json();
    console.log("Kolosal Sukses!");
    return NextResponse.json(data);

  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Server Error", details: err.message }, { status: 500 });
  }
}