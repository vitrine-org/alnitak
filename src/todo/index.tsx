import { createEffect, createSignal, For } from "solid-js";
import { mount, useSettings, useSize, useStorage } from "@vitrine/sdk";
import { Surface, clamp, type Look, useLook } from "../shared/look";
import { ask, canPrompt } from "../shared/input";
import { MONO } from "../shared/fonts";

interface Item {
  id: string;
  text: string;
  done: boolean;
}

const ADVANCE = 0.602;
const ROW = 1.75; // row pitch in em
const newId = () => Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
/** Tasks typed in the settings, separated by ";" or new lines; "[x] " marks one done. */
const splitSeed = (raw: string) =>
  raw
    .split(/[;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);

/** Hover state for a clickable row. */
function useHover() {
  const [hover, setHover] = createSignal(false);
  return { hover, handlers: { onPointerEnter: () => setHover(true), onPointerLeave: () => setHover(false) } };
}

function Row(props: { c: Look; fs: number; item: Item; editable: boolean; onToggle: () => void; onEdit: () => void }) {
  const h = useHover();
  const t = (extra: object) => ({ fontFamily: MONO, fontSize: props.fs, lineHeight: 1, whiteSpace: "nowrap" as const, ...extra });
  return (
    <view
      onClick={props.onToggle}
      {...h.handlers}
      style={{ height: Math.round(props.fs * ROW), flexShrink: 0, flexDirection: "row", alignItems: "center" }}
    >
      <text style={t({ fontWeight: 700, color: props.item.done ? props.c.accent : h.hover() ? props.c.text : props.c.text2 })}>
        {props.item.done ? "[x]" : "[ ]"}
      </text>
      <view style={{ flex: 1, minWidth: 0, marginLeft: props.fs * ADVANCE }}>
        <text
          style={
            t({
              fontWeight: 400,
              color: props.item.done ? props.c.text3 : props.c.text,
              textOverflow: "ellipsis",
              textDecoration: props.item.done ? "line-through" : "none",
            }) as any
          }
        >
          {props.item.text}
        </text>
      </view>
      {props.editable ? (
        <view onClick={(e) => (e.stopPropagation(), props.onEdit())} style={{ flexShrink: 0, paddingLeft: props.fs * ADVANCE, opacity: h.hover() ? 1 : 0, transition: "opacity 150ms ease" }}>
          <text style={t({ fontWeight: 400, color: props.c.text3 })}>edit</text>
        </view>
      ) : null}
    </view>
  );
}

function Todo() {
  const s = useSettings({ theme: "dark", accent: "#448AFF", background: "none", shadow: true, title: "To do", items: "", hideDone: false });
  const l = useLook(s);
  const size = useSize();
  const [items, setItems] = useStorage<Item[] | null>("items", null);
  const [seed, setSeed] = useStorage<string>("seed", "");
  const [scroll, setScroll] = createSignal(0);
  const add = useHover();
  const clear = useHover();

  // Tasks typed into the settings are added once; the list itself lives in widget storage.
  createEffect(() => {
    const raw = String(s().items ?? "");
    if (raw === seed() && items() !== null) return;
    const have = new Set((items() ?? []).map((i) => i.text.toLowerCase()));
    const old = splitSeed(seed());
    const added = splitSeed(raw)
      .filter((t) => !old.includes(t) && !have.has(t.replace(/^\[x\]\s*/i, "").toLowerCase()))
      .map((t) => ({ id: newId(), text: t.replace(/^\[x\]\s*/i, ""), done: /^\[x\]/i.test(t) }));
    setSeed(raw);
    if (added.length || items() === null) setItems([...(items() ?? []), ...added]);
  });

  const all = () => items() ?? [];
  const visible = () => (s().hideDone ? all().filter((i) => !i.done) : all());
  const left = () => all().filter((i) => !i.done).length;
  const doneCount = () => all().length - left();
  const editable = canPrompt();

  const pad = () => (l().card ? 14 : 6);
  // Size the type to the width (about 26 columns), within reason for the height.
  const fs = () => Math.floor(clamp(Math.min((size().width - pad() * 2) / (26 * ADVANCE), (size().height - pad() * 2) / (1.3 + 1 + ROW * 3)), 10, 22));
  const headH = () => Math.round(fs() * 1.3);
  const ruleH = () => Math.max(2, Math.round(fs() * 0.14));
  const capacity = () => Math.max(1, Math.floor((size().height - pad() * 2 - headH() - ruleH() - fs() * 0.6) / Math.round(fs() * ROW)) - (editable ? 1 : 0));
  const maxScroll = () => Math.max(0, visible().length - capacity());
  const at = () => clamp(scroll(), 0, maxScroll());
  const shown = () => visible().slice(at(), at() + capacity());
  const byId = (id: string) => all().find((i) => i.id === id) ?? { id, text: "", done: false };

  const toggle = (id: string) => setItems(all().map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const clearDone = () => setItems(all().filter((i) => !i.done));
  const create = async () => {
    const text = await ask({ title: "New task", placeholder: "What needs doing?" });
    if (text && text.trim()) {
      setItems([...all(), { id: newId(), text: text.trim(), done: false }]);
      setScroll(Number.MAX_SAFE_INTEGER);
    }
  };
  const edit = async (item: Item) => {
    const text = await ask({ title: "Edit task", placeholder: "Leave empty to delete", value: item.text });
    if (typeof text !== "string") return;
    const t = text.trim();
    setItems(t ? all().map((i) => (i.id === item.id ? { ...i, text: t } : i)) : all().filter((i) => i.id !== item.id));
  };
  const title = () => s().title.trim() || "To do";
  const glow = () => (l().dark ? "0 1px 6px rgba(0, 0, 0, 0.35)" : "0 0 6px rgba(255, 255, 255, 0.45)");

  return (
    <Surface l={l()} shadow={s().shadow} style={{ flexDirection: "column", padding: pad() }}>
      {(c) => (
        <>
          <view style={{ height: headH(), flexShrink: 0, flexDirection: "row", alignItems: "center" }}>
            <text style={{ fontFamily: MONO, fontWeight: 700, fontSize: Math.round(fs() * 1.15), lineHeight: 1, color: c.text, whiteSpace: "nowrap", flexShrink: 1 }}>
              <span style={{ color: c.accent }}>{title().charAt(0)}</span>
              {title().slice(1)}
            </text>
            <view style={{ flex: 1 }} />
            {doneCount() > 0 ? (
              <view onClick={clearDone} {...clear.handlers} style={{ flexShrink: 0, marginRight: fs() * ADVANCE * 2 }}>
                <text style={{ fontFamily: MONO, fontSize: fs(), lineHeight: 1, color: clear.hover() ? c.accent : c.text3, whiteSpace: "nowrap" }}>clear</text>
              </view>
            ) : null}
            <text style={{ fontFamily: MONO, fontWeight: 400, fontSize: fs(), lineHeight: 1, color: c.text2, whiteSpace: "nowrap", flexShrink: 0 }}>
              {all().length ? `${doneCount()}/${all().length}` : ""}
            </text>
          </view>
          <view style={{ height: ruleH(), flexShrink: 0, background: c.text, marginTop: Math.round(fs() * 0.3), marginBottom: Math.round(fs() * 0.3), ...(c.shadow ? { boxShadow: glow() } : {}) }} />
          <view
            onWheel={(e) => setScroll(clamp(at() + ((e.deltaY ?? 0) > 0 ? 1 : -1), 0, maxScroll()))}
            style={{ flex: 1, flexDirection: "column", minHeight: 0 }}
          >
            <For each={shown().map((i) => i.id)}>
              {(id) => <Row c={c} fs={fs()} item={byId(id)} editable={editable} onToggle={() => toggle(id)} onEdit={() => edit(byId(id))} />}
            </For>
            {all().length === 0 && !editable ? (
              <text style={{ fontFamily: MONO, fontSize: fs(), lineHeight: ROW, color: c.text3 }}>Add tasks in the widget settings</text>
            ) : null}
            {editable ? (
              <view onClick={create} {...add.handlers} style={{ height: Math.round(fs() * ROW), flexShrink: 0, flexDirection: "row", alignItems: "center" }}>
                <text style={{ fontFamily: MONO, fontWeight: 700, fontSize: fs(), lineHeight: 1, color: c.accent, whiteSpace: "nowrap" }}>[+]</text>
                <text style={{ fontFamily: MONO, fontSize: fs(), lineHeight: 1, color: add.hover() ? c.text : c.text3, whiteSpace: "nowrap", marginLeft: fs() * ADVANCE }}>
                  {all().length ? "add a task" : "add your first task"}
                </text>
              </view>
            ) : null}
          </view>
        </>
      )}
    </Surface>
  );
}

mount(() => <Todo />);
