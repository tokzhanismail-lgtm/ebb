# Ebb — cravings come in waves

**Ebb is a skill trainer for emotional eating.** When an urge to eat hits without real hunger, Ebb helps you
**notice** what you're feeling, **pause** while the urge passes, and **choose** on purpose — then learns your
danger hours so you can **predict** and plan for them. No diets, no calories, no shame.

Built in 24 hours for Business Cup 2.0 (Skills track: *what do people fail to master?* — emotional regulation).

## What it does

| Screen | What happens |
|---|---|
| **Quiz** | 5 questions → your pattern (e.g. *The Evening Unwinder*), a 4-week skill plan, and a safety screen that points to eating-disorder support when needed. |
| **SOS** | Hunger vs. emotion check → name the feeling → an **AI coach** picks a 90-second technique → a 10-minute pause with a live "urge wave" → log what you chose. One tap to message your buddy, or talk it through with the coach. |
| **Progress** | Four skill levels (Notice, Pause, Choose, Predict), weekly pause-rate curve, feelings breakdown, danger window, **AI pattern insights**, and if-then plans you can add to your calendar (.ics). |
| **Garden** | Every urge met with awareness plants something. Nothing is ever taken away. |
| **Ebb Plus** | Paywall (test mode): AI insights and reminders are premium; SOS is always free. |

Data stays in the browser (localStorage) — no sign-up or login. Click **"See 3 weeks of progress"** on the home
page to load a realistic demo account.

## Safety

Ebb is a wellness tool, not therapy or medical care. The coach never discusses calories, weight, or restriction.
Messages mentioning self-harm or eating-disorder behaviors stop the normal flow and show 988 and the National
Alliance for Eating Disorders helpline (1-866-662-1235).

## Tech

- Next.js 15 (App Router) + React 19 + TypeScript, plain CSS, hand-built SVG (wave, garden, chart)
- `/api/coach` and `/api/insights` call an LLM server-side (Anthropic, Google Gemini, or OpenAI — your choice)
- Works without an API key too: the coach falls back to a built-in technique library

## Run locally

```bash
npm install
cp .env.example .env.local   # add your key
npm run dev                  # http://localhost:3000
```

## Deploy to Vercel

1. Import this repository in Vercel (Add New → Project).
2. Add environment variables:
   - `LLM_PROVIDER` = `gemini` (or `anthropic` / `openai`)
   - `LLM_API_KEY` = your key
   - optional `LLM_MODEL` to override the default model
3. Deploy. Check `/api/health` — it should say `"ai": true`.
