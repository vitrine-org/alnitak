import { mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { timeWords } from "../shared/words";
import { describe, emptyMessage, unitSymbol, useWeather } from "../shared/weather";
import { MONO } from "../shared/fonts";

// As in the original theme: a rule, the time in words, today's weather in three
// lines and a closing rule, 1rem apart. Sizes are relative to the 16 px base.
const TIME = 1.414; // time, bold
const LINE = 1.5; // weather line height
const RULE_W = 180 / 16;
const RULE_H = 3 / 16;
const GAP = 1;
// Widest content in Hack (0.602 em per glyph): the weather sentence (48 glyphs)
// or the longest time, "Twelve Twenty Seven" (19 glyphs at 1.414 em).
const WIDEST = Math.max(48, 19 * TIME) * 0.602;

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
  const size = useSize();
  const now = useClock("minute");
  // No requests while the weather is hidden.
  const w = useWeather(() => ({ city: s().showWeather ? s().city : "", units: s().units }));

  const t = () => timeWords(now());
  const u = () => unitSymbol(s().units);
  const d = () => w.data();
  const pad = () => (l().card ? 14 : 6);

  // Height of the whole block in base units (1 = the 16 px body size).
  const units = () => {
    let h = TIME * 1.2;
    if (s().showWeather) h += GAP + 3 * LINE;
    if (s().showDivider) h += 2 * (GAP + RULE_H);
    return h;
  };
  const base = () => {
    const byW = (size().width - pad() * 2) / (s().showWeather ? WIDEST : 19 * TIME * 0.602);
    const byH = (size().height - pad() * 2) / units();
    return Math.floor(clamp(Math.min(byW, byH), 7, 40) * 10) / 10;
  };
  const gap = () => Math.round(GAP * base());

  const rule = (c: { text: string; dark: boolean; shadow: boolean }) => (
    <view
      style={{
        width: Math.round(Math.min(RULE_W * base(), size().width * 0.6)),
        height: Math.max(2, Math.round(RULE_H * base())),
        flexShrink: 0,
        background: c.text,
        ...(c.shadow ? { boxShadow: c.dark ? "0 1px 6px rgba(0, 0, 0, 0.35)" : "0 0 6px rgba(255, 255, 255, 0.45)" } : {}),
      }}
    />
  );

  return (
    <Surface
      l={l()}
      shadow={s().shadow}
      style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: pad(), gap: gap() }}
    >
      {(c) => (
        <>
          {s().showDivider ? rule(c) : null}
          <text style={{ fontFamily: MONO, fontWeight: 700, fontSize: Math.round(TIME * base()), lineHeight: 1.2, color: c.text, whiteSpace: "nowrap" }}>
            {t().hour + " "}
            <span style={{ color: c.accent }}>{t().minute}</span>
          </text>
          {s().showWeather ? (
            <text style={{ fontFamily: MONO, fontSize: Math.round(base()), lineHeight: LINE, textAlign: "center", color: c.text, whiteSpace: "nowrap" }}>
              {d() ? (
                <>
                  {`Today weather in ${d()!.place} is ${describe(d()!.code)}.`}
                  <br />
                  {`Temperature is ${d()!.temp}${u()}, min is ${d()!.min}${u()}, max is ${d()!.max}${u()}.`}
                  <br />
                  {`It feels like ${d()!.feels}${u()}, and humidity is ${d()!.humidity}%`}
                  {w.error() ? <span style={{ color: c.accent }}>{" (offline)"}</span> : null}
                </>
              ) : (
                emptyMessage(w.error(), w.query())
              )}
            </text>
          ) : null}
          {s().showDivider ? rule(c) : null}
        </>
      )}
    </Surface>
  );
}

mount(() => <WordClock />);
