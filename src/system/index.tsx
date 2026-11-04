import { Index } from "solid-js";
import { mount, useSettings, useSize, useSystem } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { MONO } from "../shared/fonts";

// htop-style meters in Hack: `CPU [||||||||        42%]`, one glyph per column.
const ADVANCE = 0.602;
const ROW = 1.45;
const LABEL = 4; // "CPU " and friends

type Meter = { label: string; value: number; text: string } | { label: string; net: [string, string] };

/** A rate as a short monospaced figure: "1.2M", "340K", "12B" per second. */
function rate(bytes: number | undefined): string {
  if (bytes === undefined) return "-";
  const units = ["B", "K", "M", "G"];
  let v = bytes;
  let i = 0;
  while (v >= 1000 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v >= 100 || i === 0 ? Math.round(v) : v.toFixed(1)}${units[i]}/s`;
}

function System() {
  const s = useSettings({
    theme: "dark",
    accent: "#448AFF",
    background: "none",
    shadow: true,
    showDisk: true,
    drive: "C",
    showNetwork: true,
    showBattery: true,
    interval: 2,
  });
  const l = useLook(s);
  const size = useSize();
  const snap = useSystem(["cpu", "memory", "drives", "network", "battery"], clamp(Number(s().interval) || 2, 1, 30) * 1000);

  const meters = (): Meter[] => {
    const { cpu, memory, drives, network, battery } = snap();
    const pct = (v: number) => `${Math.round(clamp(v, 0, 100))}%`;
    const m: Meter[] = [];
    const c = cpu?.usage ?? 0;
    m.push({ label: "CPU", value: c, text: pct(c) });
    const r = memory && memory.total > 0 ? (memory.used / memory.total) * 100 : 0;
    m.push({ label: "MEM", value: r, text: pct(r) });
    if (s().showDisk) {
      const letter = (String(s().drive || "C").trim()[0] || "C").toUpperCase();
      const d = drives?.find((x) => x.name.toUpperCase().startsWith(letter + ":"));
      const v = d && d.total > 0 ? (d.used / d.total) * 100 : 0;
      m.push({ label: `${letter}:`, value: v, text: pct(v) });
    }
    if (s().showBattery && battery?.hasBattery) {
      const v = battery.level ?? 0;
      m.push({ label: "BAT", value: v, text: (battery.charging ? "+" : "") + pct(v) });
    }
    if (s().showNetwork) m.push({ label: "NET", net: [rate(network?.rxPerSec), rate(network?.txPerSec)] });
    return m;
  };

  const pad = () => (l().card ? 14 : 6);
  // At least 24 columns; rows that do not fit the height are left out.
  const fs = () => {
    const byW = (size().width - pad() * 2) / (24 * ADVANCE);
    const byH = (size().height - pad() * 2) / (meters().length * ROW);
    return Math.floor(clamp(Math.min(byW, byH), 9, 28));
  };
  // One column of slack: glyph advances are rounded to whole pixels.
  const cols = () => Math.floor((size().width - pad() * 2) / (fs() * ADVANCE)) - 1;
  const rowH = () => fs() * ROW;
  // On very short sizes the rows that do not fit are left out (network first).
  const shown = () => meters().slice(0, Math.max(1, Math.floor((size().height - pad() * 2 + 1) / rowH())));

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "column", justifyContent: "center", padding: pad() }}>
      {(c) => (
        <Index each={shown()}>
          {(m) => {
            const t = { fontFamily: MONO, fontSize: fs(), lineHeight: 1, whiteSpace: "nowrap" as const };
            const meter = () => m() as { label: string; value: number; text: string };
            const net = () => ("net" in m() ? (m() as { net: [string, string] }).net : null);
            // Inside the brackets: bars, padding and the value at the right end, as htop does.
            const inner = () => cols() - LABEL - 2;
            const bars = () => {
              const room = Math.max(1, inner() - meter().text.length - 1);
              return Math.round((clamp(meter().value, 0, 100) / 100) * room);
            };
            return (
              <view style={{ height: rowH(), flexDirection: "row", alignItems: "center" }}>
                <text style={{ ...t, fontWeight: 700, color: c.text }}>{m().label.padEnd(LABEL, " ")}</text>
                {net() ? (
                  <text style={{ ...t, fontWeight: 400, color: c.text }}>
                    <span style={{ color: c.accent, fontWeight: 700 }}>↓</span>
                    {` ${net()![0].padEnd(Math.max(8, Math.floor((inner() - 4) / 2)), " ")}`}
                    <span style={{ color: c.accent, fontWeight: 700 }}>↑</span>
                    {` ${net()![1]}`}
                  </text>
                ) : (
                  <text style={{ ...t, fontWeight: 700, color: c.text }}>
                    {"["}
                    <span style={{ color: c.accent }}>{"|".repeat(bars())}</span>
                    <span style={{ color: c.track, fontWeight: 400 }}>{"·".repeat(Math.max(0, inner() - bars() - meter().text.length))}</span>
                    <span style={{ fontWeight: 400, color: c.text2 }}>{meter().text}</span>
                    {"]"}
                  </text>
                )}
              </view>
            );
          }}
        </Index>
      )}
    </Surface>
  );
}

mount(() => <System />);
