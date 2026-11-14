import { NextResponse } from "next/server";
import { chat, extractJson, llmConfig } from "@/lib/llm";
import { INSIGHTS_SYSTEM, insightsPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

export interface Insights {
  headline: string;
  patterns: string[];
  plan: { if: string; then: string };
  progress?: string;
  encouragement?: string;
}

export async function POST(req: Request) {
  let summary = "";
  try {
    summary = String((await req.json()).summary || "").slice(0, 4000);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!summary) return NextResponse.json({ error: "No data" }, { status: 400 });
  if (!llmConfig().ok) return NextResponse.json({ source: "library" });

  try {
    const text = await chat(INSIGHTS_SYSTEM, [{ role: "user", content: insightsPrompt(summary) }], 700);
    const parsed = extractJson<Insights>(text);
    if (parsed && parsed.headline && parsed.plan?.if && parsed.plan?.then) {
      return NextResponse.json({ source: "ai", insights: parsed });
    }
    return NextResponse.json({ source: "library" });
  } catch (e) {
    console.error("insights error", e);
    return NextResponse.json({ source: "library" });
  }
}
