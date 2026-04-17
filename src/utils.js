export default class Utils {
    // ── private constants ──────────────────────────────────────────────
    // Index 0 is an empty placeholder so all accesses stay 1-based (mirrors the original Lua tables)

    static #WORDS = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine "];
    static #LEVELS = ["", "THOUSAND ", "MILLION ", "BILLION ", "TRILLION ", "QUADRILLION ", "QUINTILLION ", "SEXTILLION ", "SEPTILLION ", "OCTILLION "];
    static #IWORDS = ["", "Ten ", "Twenty ", "Thirty ", "Forty ", "Fifty ", "Sixty ", "Seventy ", "Eighty ", "Ninety "];
    static #TWORDS = ["", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];

    // ── private helpers ────────────────────────────────────────────────

    /** Yields [position, digit] pairs from least-significant to most-significant digit. */
    static *#digitsOf(n) {
        let i = -1;
        while (n > 0) {
            i++;
            const digit = n % 10;
            n = Math.floor(n / 10);
            yield [i, digit];
        }
    }

    /** Converts a non-negative integer to its English word representation. */
    static #numberToWord(number) {
        if (number === 0) return "O'Clock";

        // levelFlag is set whenever pos % 3 === 0 (ones place of each 3-digit group)
        // and consumed (reset) as soon as the first non-zero digit of that group is named.
        let levelFlag = false;

        const getname = (pos, dig) => {
            levelFlag = levelFlag || (pos % 3 === 0);
            if (dig === 0) return "";

            const base = (pos % 3 === 1 ? Utils.#IWORDS[dig] : Utils.#WORDS[dig])
                + (pos % 3 === 2 ? "HUNDRED " : "");

            if (levelFlag) {
                levelFlag = false;
                return base + Utils.#LEVELS[Math.floor(pos / 3)];
            }
            return base;
        };

        let vword = "";
        for (const [i, v] of Utils.#digitsOf(number)) {
            vword = getname(i, v) + vword;
        }

        // "Twenty One " → "Twenty-One ", "Ten One " → "Eleven ", etc.
        for (let i = 1; i <= 9; i++) {
            vword = vword.replaceAll("TY " + Utils.#WORDS[i], "TY-" + Utils.#WORDS[i]);
            vword = vword.replaceAll("Ten " + Utils.#WORDS[i], Utils.#TWORDS[i]);
        }

        return vword.trim();
    }

    // ── public API ─────────────────────────────────────────────────────

    /**
     * Returns the hour, minute, and day-of-month as English words.
     * @param {Date} date
     * @returns {{ hour: string, minute: string, date: string }}
     */
    static timeToWords(date = new Date()) {
        const h = date.getHours() % 12 || 12;
        return {
            hour: Utils.#numberToWord(h),
            minute: Utils.#numberToWord(date.getMinutes()),
            date: Utils.#numberToWord(date.getDate()),
        };
    }
}