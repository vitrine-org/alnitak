import { mount, useClock, useSettings } from "@vitrine/sdk";
import { Surface, useLook } from "../shared/look";
import { numberWords, timeWords } from "../shared/words";
import { describe, emptyMessage, unitSymbol, useWeather } from "../shared/weather";
import { MONO } from "../shared/fonts";
import { HACK_BOLD as BOLD, HACK_REGULAR as REGULAR } from "../shared/metrics";
import { capTrim, legible, MIN_VALUE, textWidth, useFit, widest } from "../shared/fit";

// Reference design, in the original theme's CSS pixels: a 180 × 3 rule, the time in words in
// Hack Bold at 1.414rem, today's weather in three centred 1rem lines and a closing rule, all
// 1rem apart, line height 1.2.
const TIME = 22.6;
const TEXT = 16;
const LH = 1.2;
const RULE_W = 180;
const RULE_H = 3;
const GAP = 16;
const PAD = { bare: 8, card: 22 };
const SAMPLE = [
  "Today weather in London is partly cloudy.",
  "Temperature is 20°C, min is 15°C, max is 25°C.",
  "It feels like 20°C, and humidity is 100%",
];
// The longest time of the day, so the size never changes with the minute.
const HOURS = Array.from({ length: 12 }, (_, i) => numberWords(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => numberWords(i));

function WordClock() {
  const s = useSettings({
    theme: "dark",
    accent: "#448AFF",
    background: "none",
    shadow: true,
    showDivider: true,
    showWeather: true,
    city: "London",
    units: "celsius",
  });
  const l = useLook(s);
  const now = useClock("minute");
  // No requests while the weather is hidden.
  const w = useWeather(() => ({ city: s().showWeather ? s().city : "", units: s().units }));

  const t = () => timeWords(now());
  const u = () => unitSymbol(s().units);
  const d = () => w.data();
  const lines = () =>
    d()
      ? [
          `Today weather in ${d()!.place} is ${describe(d()!.code)}.`,
          `Temperature is ${d()!.temp}${u()}, min is ${d()!.min}${u()}, max is ${d()!.max}${u()}.`,
          `It feels like ${d()!.feels}${u()}, and humidity is ${d()!.humidity}%${w.error() ? " (offline)" : ""}`,
        ]
      : [emptyMessage(w.error(), w.query())];
  const pad = () => (l().card ? PAD.card : PAD.bare);
  // Without rules the column is cropped to the capitals of the time and the last text line.
  const top = (ts: number) => (s().showDivider ? 0 : -capTrim(BOLD, ts, LH).marginTop);
  const bottom = (fs: number, ts: number) => (s().showDivider ? 0 : s().showWeather ? -capTrim(REGULAR, fs, LH, 0.24).marginBottom : -capTrim(BOLD, ts, LH).marginBottom);

  const k = useFit((k) => {
    const ts = legible(TIME, k, MIN_VALUE);
    const fs = legible(TEXT, k);
    const time = Math.max(...HOURS.map((h) => textWidth(BOLD, h + " ", ts))) + Math.max(...MINUTES.map((m) => textWidth(BOLD, m, ts)));
    let wd = Math.max(time, s().showDivider ? RULE_W : 0);
    let h = ts * LH;
    if (s().showWeather) {
      wd = Math.max(wd, widest(REGULAR, d() ? lines() : SAMPLE, fs));
      h += GAP + 3 * fs * LH;
    }
    if (s().showDivider) h += 2 * (GAP + RULE_H);
    return { w: wd + 2 * pad(), h: h - top(ts) - bottom(fs, ts) + 2 * pad() };
  });
  const ts = () => legible(TIME, k(), MIN_VALUE) * k();
  const fs = () => legible(TEXT, k()) * k();

  const rule = (c: { text: string; dark: boolean; shadow: string | null }) => (
    <view
      style={{
        width: RULE_W * k(),
        height: Math.max(1, RULE_H * k()),
        flexShrink: 0,
        background: c.text,
        ...(c.shadow ? { boxShadow: c.dark ? `0 ${k()}px ${6 * k()}px rgba(0, 0, 0, 0.35)` : `0 0 ${6 * k()}px rgba(255, 255, 255, 0.45)` } : {}),
      }}
    />
  );

  return (
    <Surface l={l()} k={k()} style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: pad() * k(), gap: GAP * k() }}>
      {(c) => (
        <>
          {s().showDivider ? rule(c) : null}
          <text
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: ts(),
              lineHeight: LH,
              color: c.text,
              whiteSpace: "nowrap",
              marginTop: -top(ts()),
              marginBottom: s().showWeather ? 0 : -bottom(fs(), ts()),
            }}
          >
            {t().hour + " "}
            <span style={{ color: c.accent }}>{t().minute}</span>
          </text>
          {s().showWeather ? (
            <text
              style={{
                fontFamily: MONO,
                fontSize: fs(),
                lineHeight: LH,
                textAlign: "center",
                color: c.text,
                whiteSpace: "nowrap",
                marginBottom: -bottom(fs(), ts()),
              }}
            >
              {lines().map((x, i) => (i ? [<br />, x] : x))}
            </text>
          ) : null}
          {s().showDivider ? rule(c) : null}
        </>
      )}
    </Surface>
  );
}

mount(() => <WordClock />);
