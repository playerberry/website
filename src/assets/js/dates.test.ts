// Pin the process to a UTC-negative zone before anything is formatted. Post
// dates are date-only ISO strings, which parse as UTC midnight; if the
// formatter ever stopped forcing UTC, every expectation below would slip back
// a day here (and on any developer machine west of Greenwich). Node applies a
// `TZ` change at runtime, and the formatters are created lazily inside the
// tests, so the hoisted imports below are not a problem.
process.env.TZ = "America/Los_Angeles";

import { describe, expect, it, vi } from "vitest";
import { formatPostDate } from "./dates";

describe("formatPostDate", () => {
  it("formats Turkish dates as 'day month year'", () => {
    expect(formatPostDate("2026-06-18", "tr")).toBe("18 Haziran 2026");
  });

  it("formats English dates as 'Month day, year'", () => {
    expect(formatPostDate("2026-06-18", "en")).toBe("June 18, 2026");
  });

  it("formats Spanish dates as 'day de month de year'", () => {
    expect(formatPostDate("2026-06-18", "es")).toBe("18 de junio de 2026");
  });

  it("formats German and Japanese dates in their own conventions", () => {
    expect(formatPostDate("2026-06-18", "de")).toBe("18. Juni 2026");
    expect(formatPostDate("2026-06-18", "ja")).toBe("2026年6月18日");
  });

  it("falls back to English for unknown locales", () => {
    expect(formatPostDate("2026-01-05", "xx")).toBe("January 5, 2026");
  });

  it("constructs one Intl.DateTimeFormat per locale", () => {
    // Use a locale no earlier test has touched; otherwise the cache is already
    // warm and the spy would count zero constructions with or without caching.
    // The spy delegates to the real constructor explicitly: a bare spy is used
    // as `new.target`, which would hand back an object without `format`.
    const Original = Intl.DateTimeFormat;
    const spy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockImplementation(function (...args) {
        return new Original(...args);
      });
    expect(formatPostDate("2024-09-08", "fr")).toBe("8 septembre 2024");
    expect(formatPostDate("2024-09-09", "fr")).toBe("9 septembre 2024");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
