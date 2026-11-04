// English number words for the word clock, as the original theme spelled them.
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty"];

/** 0 → "O'Clock", 7 → "Seven", 47 → "Forty Seven". */
export function numberWords(n: number): string {
  if (n === 0) return "O'Clock";
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
}

/** Hour (12-hour clock) and minute in words. */
export function timeWords(d: Date): { hour: string; minute: string } {
  return { hour: numberWords(d.getHours() % 12 || 12), minute: numberWords(d.getMinutes()) };
}
