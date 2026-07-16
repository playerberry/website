import { describe, expect, it } from "vitest";
import {
  feedPathFor,
  localeForCountry,
  parseTraceCountry,
} from "./locales";

/** A realistic Cloudflare `/cdn-cgi/trace` response body. */
const trace = (loc: string): string =>
  `fl=997f41\nh=playerberry.com\nip=185.20.6.90\nts=1784214488.000\nvisit_scheme=https\nuag=curl/8.7.1\ncolo=AMS\nhttp=http/2\nloc=${loc}\ntls=TLSv1.3\nwarp=off\n`;

describe("parseTraceCountry", () => {
  it("extracts the country code from a trace body", () => {
    expect(parseTraceCountry(trace("TR"))).toBe("TR");
    expect(parseTraceCountry(trace("ES"))).toBe("ES");
  });

  it("upper-cases lower-case codes", () => {
    expect(parseTraceCountry(trace("de"))).toBe("DE");
  });

  it("returns null when the loc line is missing", () => {
    expect(parseTraceCountry("h=playerberry.com\ncolo=AMS\n")).toBeNull();
  });

  it("returns null for garbage input", () => {
    expect(parseTraceCountry("<html>error</html>")).toBeNull();
  });

  it("does not match loc= inside another line", () => {
    expect(parseTraceCountry("bloc=TR\n")).toBeNull();
  });
});

describe("localeForCountry", () => {
  it("maps Türkiye to Turkish", () => {
    expect(localeForCountry("TR")).toBe("tr");
  });

  it("maps Spain to Spanish", () => {
    expect(localeForCountry("ES")).toBe("es");
  });

  it("falls back to English for unmapped countries", () => {
    expect(localeForCountry("DE")).toBe("en");
    expect(localeForCountry("US")).toBe("en");
    expect(localeForCountry("JP")).toBe("en");
  });

  it("falls back to English when detection failed", () => {
    expect(localeForCountry(null)).toBe("en");
    expect(localeForCountry(undefined)).toBe("en");
  });

  it("accepts lower-case country codes", () => {
    expect(localeForCountry("tr")).toBe("tr");
  });
});

describe("feedPathFor", () => {
  it("returns the per-locale feed paths", () => {
    expect(feedPathFor("tr")).toBe("/rss.xml");
    expect(feedPathFor("en")).toBe("/rss-en.xml");
    expect(feedPathFor("es")).toBe("/rss-es.xml");
  });

  it("falls back to the English feed for unknown locales", () => {
    expect(feedPathFor("de")).toBe("/rss-en.xml");
  });
});
