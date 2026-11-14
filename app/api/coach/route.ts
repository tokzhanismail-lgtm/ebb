import { NextResponse } from "next/server";
import { chat, extractJson, llmConfig, type ChatMsg } from "@/lib/llm";
import { COACH_SYSTEM, techniquePrompt } from "@/lib/prompts";
import { checkSafety, RESOURCES } from "@/lib/safety";
import { TECHNIQUES, type Technique } from "@/lib/techniques";
import type { Emotion } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  mode: "technique" | "chat";
  emotion?: Emotion;
  hunger?: number;
  intensity?: number;
  note?: string;
  messages?: ChatMsg[];
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const emotion: Emotion = (body.emotion as Emotion) || "not sure";
  const userText = [body.note || "", ...(body.messages || []).filter((m) => m.role === "user").map((m) => m.content)].join(" ");
  const safety = checkSafety(userText);
  if (safety !== "ok") {
    return NextResponse.json({ safety, resource: RESOURCES[safety] });
  }

  const { ok } = llmConfig();

  if (body.mode === "technique") {
    const fallback = TECHNIQUES[emotion] ?? TECHNIQUES["not sure"];
    if (!ok) return NextResponse.json({ technique: { ...fallback, line: "This will pass. You get to choose." }, source: "library" });
    try {
      const text = await chat(
        COACH_SYSTEM,
        [{ role: "user", content: techniquePrompt(emotion, body.hunger ?? 0, body.intensity ?? 5, body.note) }],
        500
      );
      const parsed = extractJson<Technique & { line?: string }>(text);
      if (parsed && parsed.title && Array.isArray(parsed.steps) && parsed.steps.length) {
        return NextResponse.json({ technique: { ...parsed, steps: parsed.steps.slice(0, 4) }, source: "ai" });
      }
      return NextResponse.json({ technique: { ...fallback, line: "This will pass. You get to choose." }, source: "library" });
    } catch (e) {
      console.error("coach technique error", e);
      return NextResponse.json({ technique: { ...fallback, line: "This will pass. You get to choose." }, source: "library" });
    }
  }

  // chat mode
  const messages = (body.messages || []).slice(-10);
  if (!messages.length) return NextResponse.json({ error: "No messages" }, { status: 400 });
  const context = `Context: the person named the feeling "${emotion}", physical hunger ${body.hunger ?? "?"}/10, urge ${body.intensity ?? "?"}/10.`;
  if (!ok) {
    return NextResponse.json({
      reply:
        "I hear you. Let's not decide anything for the next 10 minutes — just notice where the urge sits in your body and breathe into it. What's the strongest part of the feeling right now?",
      source: "library",
    });
  }
  try {
    const reply = await chat(`${COACH_SYSTEM}\n\n${context}`, messages, 300);
    return NextResponse.json({ reply, source: "ai" });
  } catch (e) {
    console.error("coach chat error", e);
    return NextResponse.json({
      reply: "I'm here. Take one slow breath with me — in for 4, out for 6. What feels loudest right now: the craving, or the feeling under it?",
      source: "library",
    });
  }
}
