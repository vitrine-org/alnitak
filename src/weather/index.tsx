import { mount, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { describe, emptyMessage, unitSymbol, useWeather } from "../shared/weather";
import { MONO } from "../shared/fonts";

// The longest line is about 48 Hack glyphs (0.602 em each).
const LONGEST = 48 * 0.602;

function Weather() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, city: "London", units: "celsius", showDivider: true });
  const l = useLook(s);
  const size = useSize();
  const w = useWeather(s);

  const pad = () => (l().card ? 14 : 6);
  const fs = () => {
    const byW = (size().width - pad() * 2) / LONGEST;
    const byH = (size().height - pad() * 2) / (3 * 1.5 + (s().showDivider ? (3 + 12) / 16 : 0));
    return Math.floor(clamp(Math.min(byW, byH), 8, 28));
  };
  const k = () => fs() / 16;
  const u = () => unitSymbol(s().units);
  const d = () => w.data();

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", padding: pad() }}>
      {(c) => (
        <>
          <text style={{ fontFamily: MONO, fontSize: fs(), lineHeight: 1.5, textAlign: "center", color: c.text, whiteSpace: "nowrap" }}>
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
          {s().showDivider ? (
            <view style={{ width: Math.round(Math.min(180 * k(), size().width * 0.5)), height: Math.max(2, Math.round(2 + k())), flexShrink: 0, background: c.text, marginTop: Math.round(12 * k()), ...(c.shadow ? { boxShadow: c.dark ? "0 1px 6px rgba(0, 0, 0, 0.35)" : "0 0 6px rgba(255, 255, 255, 0.45)" } : {}) }} />
          ) : null}
        </>
      )}
    </Surface>
  );
}

mount(() => <Weather />);
