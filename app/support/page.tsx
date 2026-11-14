import Link from "next/link";
import Nav from "@/components/Nav";

export const metadata = { title: "Support — Ebb" };

export default function Support() {
  return (
    <main className="app stack">
      <Link href="/home" className="logo">
        ebb
      </Link>
      <h2>Support</h2>

      <div className="panel deep stack">
        <h3>If you&apos;re in crisis</h3>
        <p>
          Call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline, US), any time. If you&apos;re in immediate
          danger, call 911.
        </p>
        <div className="row">
          <a className="btn btn-buoy" href="tel:988">
            Call 988
          </a>
          <a className="btn btn-ghost" style={{ color: "var(--foam)", borderColor: "#4d6b72" }} href="sms:988">
            Text 988
          </a>
        </div>
      </div>

      <div className="panel stack">
        <h3>If eating feels out of control</h3>
        <p>
          Bingeing, purging, or going long stretches without eating can be signs of an eating disorder — and they&apos;re
          treatable. The National Alliance for Eating Disorders helpline is staffed by licensed therapists:
        </p>
        <a className="btn btn-tide" href="tel:18666621235">
          Call 1-866-662-1235
        </a>
        <p className="small muted">Monday–Friday, 9am–7pm ET.</p>
      </div>

      <div className="panel quiet stack">
        <h3>What Ebb is — and isn&apos;t</h3>
        <p>
          Ebb is a wellness tool that helps you practice one emotional-regulation skill: noticing an urge, pausing, and
          choosing on purpose. It is not therapy, medical care, nutrition advice, or treatment for any condition.
        </p>
        <p>
          Your log stays in this browser on your device. When you use the AI coach or pattern insights, an anonymous
          summary of your entries is sent to our AI provider to generate a reply. We never ask for your weight or
          calories.
        </p>
      </div>
      <Nav />
    </main>
  );
}
