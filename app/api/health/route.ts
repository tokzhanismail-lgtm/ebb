import { NextResponse } from "next/server";
import { llmConfig } from "@/lib/llm";

export const dynamic = "force-dynamic";

/** Lets the team (and judges) check the AI is wired up — never returns the key. */
export async function GET() {
  const { provider, model, ok } = llmConfig();
  return NextResponse.json({ ai: ok, provider: ok ? provider : null, model: ok ? model : null });
}
