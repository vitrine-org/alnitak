// Text entry: widgets never get keyboard focus, so the engine shows a small prompt next to them.
import { prompt, type PromptOptions } from "@vitrine/sdk";

/** True when this engine can show its text prompt (older ones cannot: use the settings then). */
export const canPrompt = () => typeof (globalThis as any).__vitrine?.prompt === "function";

/** The text typed, null when cancelled, undefined when the engine has no prompt. */
export async function ask(options: PromptOptions): Promise<string | null | undefined> {
  if (!canPrompt()) return undefined;
  return prompt(options);
}
