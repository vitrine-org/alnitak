import { Index } from "solid-js";
import { formatDate, mount, useClock, useSettings } from "@vitrine/sdk";
import { Surface, useLook } from "../shared/look";
import { MONO } from "../shared/fonts";
import { HACK_BOLD as HACK } from "../shared/metrics";
import { capTrim, useFit } from "../shared/fit";

// The original themes are English: dates are never translated.
const EN = "en-US";

// Reference design, in the original theme's CSS pixels: a 3 × 3 grid of Hack Bold at 5.653rem
// (line height 0.9), columns 2.5rem and rows 1.5rem apart.
const F = 90.4;
const LH = 0.9;
const COL_GAP = 40;
const ROW_GAP = 24;
const CELL = (HACK.adv[HACK.chars.indexOf("M")] / 1000) * F; // Hack is monospaced
const PAD = { bare: 8, card: 22 };

/** First three letters of a name, without abbreviation dots. */
const three = (s: string) => [...s.replace(/\./g, "").toUpperCase()].slice(0, 3).join("").padEnd(3, " ");

function DateGrid() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true });
  const l = useLook(s);
  const now = useClock("minute");

  // ┌───┬───┬───┐
  // │ M │ O │ N │   month, the first letter in the accent color
  // │ - │ 3 │ 1 │   day of the month
  // │ S │ U │ N │   weekday
  // └───┴───┴───┘
  const cells = () => {
    const d = now();
    return [...three(formatDate(d, "MMM", EN)), "-", ...formatDate(d, "DD", EN), ...three(formatDate(d, "ddd", EN))];
  };
  const pad = () => (l().card ? PAD.card : PAD.bare);
  // The grid cropped to the capitals of its first and last rows.
  const trim = (size: number) => capTrim(HACK, size, LH);
  const k = useFit(() => {
    const t = trim(F);
    return { w: 3 * CELL + 2 * COL_GAP + 2 * pad(), h: 3 * LH * F + 2 * ROW_GAP + t.marginTop + t.marginBottom + 2 * pad() };
  });
  const fs = () => F * k();

  return (
    <Surface l={l()} k={k()} style={{ alignItems: "center", justifyContent: "center", padding: pad() * k() }}>
      {(c) => (
        <view
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            columnGap: COL_GAP * k(),
            rowGap: ROW_GAP * k(),
            width: (3 * CELL + 2 * COL_GAP) * k(),
            ...trim(fs()),
          }}
        >
          <Index each={cells()}>
            {(ch, i) => (
              <text style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs(), lineHeight: LH, textAlign: "center", color: i === 0 ? c.accent : c.text }}>
                {ch()}
              </text>
            )}
          </Index>
        </view>
      )}
    </Surface>
  );
}

mount(() => <DateGrid />);
