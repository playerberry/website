import { describe, expect, it } from "vitest";
import { projects } from "./projects";
import { products } from "./products";

/** The slice of a locale catalogue that the portfolio and store read. */
interface Catalogue {
  projects: {
    visit: string;
    items: Record<string, { title: string; description: string }>;
  };
  store: {
    free: string;
    get: string;
    items: Record<
      string,
      { category: string; title: string; description: string }
    >;
  };
}

/** Every locale catalogue, keyed by its file path. */
const catalogues = import.meta.glob("../locales/*.json", {
  eager: true,
  import: "default",
}) as Record<string, Catalogue>;

const localeEntries = Object.entries(catalogues);

describe("locale catalogues", () => {
  it("are all discovered", () => {
    expect(localeEntries.length).toBeGreaterThanOrEqual(11);
  });

  it.each(localeEntries)("%s localises every project", (_, messages) => {
    for (const project of projects) {
      const entry = messages.projects.items[project.id];
      expect(entry, `projects.items.${project.id}`).toBeDefined();
      expect(entry.title).not.toBe("");
      expect(entry.description).not.toBe("");
    }
    expect(messages.projects.visit).not.toBe("");
  });

  it.each(localeEntries)("%s localises every product", (_, messages) => {
    for (const product of products) {
      const entry = messages.store.items[product.id];
      expect(entry, `store.items.${product.id}`).toBeDefined();
      expect(entry.category).not.toBe("");
      expect(entry.title).not.toBe("");
      expect(entry.description).not.toBe("");
    }
    expect(messages.store.free).not.toBe("");
    expect(messages.store.get).not.toBe("");
  });
});

describe("portfolio data", () => {
  it("has unique project ids", () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique product ids", () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only links to absolute https URLs", () => {
    for (const item of [...projects, ...products]) {
      if (item.url) expect(item.url).toMatch(/^https:\/\//);
    }
  });

  it("prices products at zero or more dollars", () => {
    for (const product of products) {
      expect(product.price).toBeGreaterThanOrEqual(0);
    }
  });
});
