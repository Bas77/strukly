// app/api/chat/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.KOLOSAL_API_KEY;

// PERBAIKAN: Gunakan ID Model yang sesuai dengan akunmu (Llama 4 Maverick)
const MODEL_NAME = "meta-llama/llama-4-maverick-17b-128e-instruct";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const systemMessage = {
      role: "system",
      content: "Kamu adalah Strukly AI, asisten aplikasi keuangan. Jawab dengan Bahasa Indonesia yang singkat, ramah, dan membantu."
    };

    const formattedHistory = history ? history.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    })) : [];

    const messages = [
      systemMessage,
      ...formattedHistory,
      { role: "user", content: message }
    ];

    console.log("Mengirim Chat ke Kolosal dengan Model:", MODEL_NAME);

    const response = await fetch("https://api.kolosal.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Kolosal Chat Error:", errorText);
      return NextResponse.json({ response: "Maaf, server AI sedang sibuk." }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Maaf, tidak ada balasan.";

    return NextResponse.json({ response: reply });

  } catch (error: any) {
    console.error("Chat Server Error:", error);
    return NextResponse.json({ response: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}