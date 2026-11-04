import { formatDate, mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { MONO } from "../shared/fonts";

const ADVANCE = 0.602;
const ONES = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

/** 7 → "Seven", 47 → "Forty Seven"; from 100 on, digits read better than words. */
function count(n: number): string {
  if (n >= 100) return String(n);
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
}

/** The target day from "YYYY-MM-DD"; empty or invalid means the next New Year's Day. */
function target(raw: string, now: Date): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(now.getFullYear() + 1, 0, 1);
}

function Countdown() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, title: "", date: "", showDivider: true });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  const when = () => target(s().date, now());
  const dated = () => /^\d{4}-\d{2}-\d{2}$/.test(s().date.trim());
  const title = () => s().title.trim() || (dated() ? formatDate(when(), "D MMM YYYY") : "New Year");
  const days = () => {
    const a = new Date(now().getFullYear(), now().getMonth(), now().getDate()).getTime();
    return Math.round((when().getTime() - a) / 86400000);
  };
  // Main line: the number in the accent color, like the word clock's minutes.
  const big = (): [string, string] => {
    const n = days();
    if (n === 0) return ["", "Today"];
    const d = Math.abs(n) === 1 ? "Day" : "Days";
    return [count(Math.abs(n)), n > 0 ? d : `${d} ago`];
  };
  const sub = () => {
    const n = days();
    const date = formatDate(when(), "ddd D MMM").replace(/\./g, "").replace(/(^|\s)(\S)/g, (_, sp: string, ch: string) => sp + ch.toUpperCase());
    if (n === 0) return title();
    return `${n > 0 ? "to" : "since"} ${title()}${s().title.trim() ? " · " + date : ""}`;
  };

  const pad = () => (l().card ? 14 : 6);
  const fs = () => {
    const longest = Math.max(big()[0].length + 1 + big()[1].length, sub().length * 0.6);
    const byW = (size().width - pad() * 2) / (Math.max(longest, 10) * ADVANCE);
    const byH = (size().height - pad() * 2) / ((s().showDivider ? 1.2 + 15 / 22.6 : 1.2) + 0.6 * 1.3 + 0.35);
    return Math.floor(clamp(Math.min(byW, byH), 10, 72));
  };
  const k = () => fs() / 22.6;

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: pad() }}>
      {(c) => (
        <>
          {s().showDivider ? (
            <view
              style={{
                width: Math.round(Math.min(180 * k(), size().width * 0.6)),
                height: Math.max(2, Math.round(2 + k())),
                flexShrink: 0,
                background: c.text,
                marginBottom: Math.round(12 * k()),
                ...(c.shadow ? { boxShadow: c.dark ? "0 1px 6px rgba(0, 0, 0, 0.35)" : "0 0 6px rgba(255, 255, 255, 0.45)" } : {}),
              }}
            />
          ) : null}
          <text style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs(), lineHeight: 1.2, color: c.text, whiteSpace: "nowrap" }}>
            {big()[0] ? <span style={{ color: c.accent }}>{big()[0] + " "}</span> : null}
            {big()[1]}
          </text>
          <text style={{ fontFamily: MONO, fontWeight: 400, fontSize: Math.max(9, Math.round(fs() * 0.6)), lineHeight: 1.3, color: c.text2, whiteSpace: "nowrap", marginTop: Math.round(fs() * 0.35) }}>
            {sub()}
          </text>
        </>
      )}
    </Surface>
  );
}

mount(() => <Countdown />);
