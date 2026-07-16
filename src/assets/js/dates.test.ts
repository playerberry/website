import { describe, expect, it } from "vitest";
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

  it("falls back to English for unknown locales", () => {
    expect(formatPostDate("2026-01-05", "de")).toBe("January 5, 2026");
  });

  it("reuses cached formatters across calls (same output, no throw)", () => {
    const first = formatPostDate("2024-09-08", "tr");
    const second = formatPostDate("2024-09-08", "tr");
    expect(second).toBe(first);
  });
});
