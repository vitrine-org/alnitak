import { Index } from "solid-js";
import { formatDate, localeInfo, mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { MONO } from "../shared/fonts";

// Like `cal` in a terminal: a 20-column grid of two-digit days, today in reverse video.
const ADVANCE = 0.602; // Hack, em per glyph
const COLS = 20; // 7 days × 2 + 6 spaces
const ROW = 1.55; // row pitch in em

function Calendar() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, weekStart: "auto", showDivider: true });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  const first = () => (s().weekStart === "monday" ? 1 : s().weekStart === "sunday" ? 0 : localeInfo().firstDayOfWeek || 0);
  const month = () => [...formatDate(now(), "MMM").replace(/\./g, "").toUpperCase()].slice(0, 3).join("");
  const heads = () => {
    const names = localeInfo().daysShort;
    return Array.from({ length: 7 }, (_, i) => {
      const n = [...(names[(first() + i) % 7] ?? "").replace(/\./g, "")].slice(0, 2).join("");
      return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
    });
  };
  const weeks = () => {
    const d = now();
    const lead = (new Date(d.getFullYear(), d.getMonth(), 1).getDay() - first() + 7) % 7;
    const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const out: number[][] = [];
    for (let i = 0; i < lead + days; i += 7) out.push(Array.from({ length: 7 }, (_, j) => (i + j - lead >= 0 && i + j - lead < days ? i + j - lead + 1 : 0)));
    return out;
  };

  const pad = () => (l().card ? 16 : 6);
  // Header (1.25 em), divider and gaps (about 1 em), weekday row and the weeks.
  const fs = () => {
    const byW = (size().width - pad() * 2) / (COLS * ADVANCE);
    const byH = (size().height - pad() * 2) / (1.25 + (s().showDivider ? 1.1 : 0.5) + ROW * (weeks().length + 1));
    return Math.floor(clamp(Math.min(byW, byH), 8, 64));
  };
  const cell = () => fs() * ADVANCE * 3; // two digits and a space
  const rowH = () => Math.round(fs() * ROW);
  const gridW = () => Math.round(fs() * ADVANCE * COLS);
  const glow = () => (l().dark ? "0 1px 6px rgba(0, 0, 0, 0.35)" : "0 0 6px rgba(255, 255, 255, 0.45)");

  return (
    <Surface l={l()} shadow={s().shadow} style={{ alignItems: "center", justifyContent: "center", padding: pad() }}>
      {(c) => (
        <view style={{ flexDirection: "column", width: gridW() }}>
          <view style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <text style={{ fontFamily: MONO, fontWeight: 700, fontSize: Math.round(fs() * 1.25), lineHeight: 1, color: c.text, whiteSpace: "nowrap" }}>
              <span style={{ color: c.accent }}>{month().charAt(0)}</span>
              {month().slice(1)}
            </text>
            <text style={{ fontFamily: MONO, fontWeight: 400, fontSize: Math.round(fs() * 1.25), lineHeight: 1, color: c.text2, whiteSpace: "nowrap" }}>
              {String(now().getFullYear())}
            </text>
          </view>
          {s().showDivider ? (
            <view
              style={{
                height: Math.max(2, Math.round(fs() * 0.14)),
                flexShrink: 0,
                background: c.text,
                marginTop: Math.round(fs() * 0.5),
                marginBottom: Math.round(fs() * 0.3),
                ...(c.shadow ? { boxShadow: glow() } : {}),
              }}
            />
          ) : (
            <view style={{ height: Math.round(fs() * 0.4), flexShrink: 0 }} />
          )}
          <view style={{ flexDirection: "row", height: rowH(), alignItems: "center" }}>
            <Index each={heads()}>
              {(h, i) => (
                <view style={{ width: i === 6 ? fs() * ADVANCE * 2 : cell(), flexShrink: 0 }}>
                  <text style={{ fontFamily: MONO, fontWeight: 400, fontSize: fs(), lineHeight: 1, color: c.text3, whiteSpace: "nowrap" }}>{h()}</text>
                </view>
              )}
            </Index>
          </view>
          <Index each={weeks()}>
            {(week) => (
              <view style={{ flexDirection: "row", height: rowH(), alignItems: "center" }}>
                <Index each={week()}>
                  {(day, i) => {
                    const today = () => day() === now().getDate();
                    const weekend = () => ((first() + i) % 7) % 6 === 0;
                    return (
                      <view style={{ width: i === 6 ? fs() * ADVANCE * 2 : cell(), flexShrink: 0, alignItems: "flex-start" }}>
                        <view
                          style={{
                            width: fs() * ADVANCE * 2,
                            alignItems: "flex-end",
                            ...(today()
                              ? {
                                  background: c.accent,
                                  borderRadius: 2,
                                  paddingVertical: Math.round(fs() * 0.14),
                                  paddingHorizontal: Math.round(fs() * 0.18),
                                  marginHorizontal: -Math.round(fs() * 0.18),
                                  width: fs() * ADVANCE * 2 + Math.round(fs() * 0.18) * 2,
                                  ...(c.shadow ? { boxShadow: glow() } : {}),
                                }
                              : {}),
                          }}
                        >
                          <text
                            style={{
                              fontFamily: MONO,
                              fontWeight: today() ? 700 : 400,
                              fontSize: fs(),
                              lineHeight: 1,
                              color: today() ? c.onAccent : weekend() ? c.text3 : c.text,
                              whiteSpace: "nowrap",
                              ...(today() ? { textShadow: "none" } : {}),
                            }}
                          >
                            {day() ? String(day()).padStart(2, " ") : ""}
                          </text>
                        </view>
                      </view>
                    );
                  }}
                </Index>
              </view>
            )}
          </Index>
        </view>
      )}
    </Surface>
  );
}

mount(() => <Calendar />);
