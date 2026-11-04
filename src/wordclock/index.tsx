import { mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { timeWords } from "../shared/words";
import { MONO } from "../shared/fonts";

// Longest time of the day in Hack (0.602 em per glyph): "Twelve Twenty Seven".
const LONGEST = 19 * 0.602;

function WordClock() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, showDivider: true });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  const t = () => timeWords(now());
  const pad = () => (l().card ? 14 : 6);
  // In the original the time is 22.6 px under a 180 × 3 px divider, 16 px apart.
  const fs = () => {
    const byW = (size().width - pad() * 2) / LONGEST;
    const byH = (size().height - pad() * 2) / (s().showDivider ? 1.2 + (3 + 12) / 22.6 : 1.2);
    return Math.floor(clamp(Math.min(byW, byH), 10, 80));
  };
  const k = () => fs() / 22.6;

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: pad() }}>
      {(c) => (
        <>
          {s().showDivider ? (
            <view style={{ width: Math.round(Math.min(180 * k(), size().width * 0.6)), height: Math.max(2, Math.round(2 + k())), flexShrink: 0, background: c.text, marginBottom: Math.round(12 * k()) }} />
          ) : null}
          <text style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs(), lineHeight: 1.2, color: c.text, whiteSpace: "nowrap" }}>
            {t().hour + " "}
            <span style={{ color: c.accent }}>{t().minute}</span>
          </text>
        </>
      )}
    </Surface>
  );
}

mount(() => <WordClock />);
