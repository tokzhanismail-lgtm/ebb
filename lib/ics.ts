/** Builds a recurring weekday calendar reminder (.ics) 15 minutes before the danger window. */
export function buildIcs(startHour: number, ifText: string, thenText: string) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() + 1);
  start.setHours(startHour, 0, 0, 0);
  start.setMinutes(start.getMinutes() - 15);
  const end = new Date(start.getTime() + 15 * 60 * 1000);

  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const summary = "Ebb: your danger window starts soon";
  const desc = `If ${ifText}, then ${thenText}. Open Ebb and tap SOS if an urge shows up.`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Ebb//Danger Window//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@ebb.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    `SUMMARY:${escape(summary)}`,
    `DESCRIPTION:${escape(desc)}`,
    "BEGIN:VALARM",
    "TRIGGER:PT0M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(summary)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function escape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function downloadIcs(content: string, filename = "ebb-danger-window.ics") {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
