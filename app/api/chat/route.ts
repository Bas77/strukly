// app/api/chat/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;
// Gunakan model yang sama karena terbukti tersedia di akunmu
const MODEL_NAME = "gemini-2.0-flash";
const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body; // Menerima pesan & history dari frontend

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // 1. Instruksi kepribadian Bot
    const systemPrompt = {
      role: "user",
      parts: [{ text: `
        You are Strukly AI, a helpful assistant for a receipt management app.
        Language: Indonesian (Bahasa Indonesia).
        Tone: Friendly, concise, helpful.
        Capabilities: Help users upload receipts, explain features, and troubleshoot errors.
      `}]
    };

    const modelAck = {
      role: "model",
      parts: [{ text: "Siap! Saya Strukly AI yang akan membantu pengguna dengan ramah." }]
    };

    // 2. Format History Chat (ubah format frontend ke format Gemini)
    const formattedHistory = history.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // 3. Gabungkan semua konteks
    const contents = [
      systemPrompt,
      modelAck,
      ...formattedHistory,
      { role: "user", parts: [{ text: message }] }
    ];

    // 4. Kirim ke Gemini
    const res = await fetch(`${MODEL_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Chat API Error:", errorText);
      return NextResponse.json({ response: "Maaf, saya sedang pusing. Coba lagi nanti ya." }, { status: 500 });
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({ response: reply });

  } catch (error: any) {
    console.error("Chat Server Error:", error);
    return NextResponse.json({ response: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
