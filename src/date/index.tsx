import { Index } from "solid-js";
import { formatDate, mount, useClock, useSettings, useSize } from "@vitrine/sdk";
import { Surface, clamp, useLook } from "../shared/look";
import { MONO } from "../shared/fonts";

// Hack is monospaced: 0.602 em per glyph. Gaps follow the original 2.5rem × 1.5rem on 5.653rem.
const ADVANCE = 0.602;
const COL_GAP = 2.5 / 5.653;
const ROW_GAP = 1.5 / 5.653;
const LINE = 0.9;

/** First three letters of a locale name, without abbreviation dots. */
const three = (s: string) => [...s.replace(/\./g, "").toUpperCase()].slice(0, 3).join("").padEnd(3, " ");

function DateGrid() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true });
  const l = useLook(s);
  const size = useSize();
  const now = useClock("minute");

  // ┌───┬───┬───┐
  // │ M │ O │ N │   month, the first letter in the accent color
  // │ - │ 3 │ 1 │   day of the month
  // │ S │ U │ N │   weekday
  // └───┴───┴───┘
  const cells = () => {
    const d = now();
    return [...three(formatDate(d, "MMM")), "-", ...formatDate(d, "DD"), ...three(formatDate(d, "ddd"))];
  };
  const pad = () => (l().card ? 16 : 6);
  const fs = () => {
    const byW = (size().width - pad() * 2) / (3 * ADVANCE + 2 * COL_GAP);
    const byH = (size().height - pad() * 2) / (3 * LINE + 2 * ROW_GAP);
    return Math.floor(clamp(Math.min(byW, byH), 14, 260));
  };

  return (
    <Surface l={l()} shadow={s().shadow} style={{ alignItems: "center", justifyContent: "center", padding: pad() }}>
      {(c) => (
        <view
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 1fr",
            columnGap: Math.round(fs() * COL_GAP),
            rowGap: Math.round(fs() * ROW_GAP),
          }}
        >
          <Index each={cells()}>
            {(ch, i) => (
              <text
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: fs(),
                  lineHeight: LINE,
                  textAlign: "center",
                  color: i === 0 ? c.accent : c.text,
                }}
              >
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
