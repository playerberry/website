/** The disciplines a project can be filed under in the portfolio filter. */
export type ProjectCategory = "web" | "mobile" | "design" | "devops";

/**
 * A single portfolio entry. Only structural/visual metadata lives here; the
 * human-readable title and description are localised in the locale files under
 * `projects.items.<id>` and looked up by `id`.
 */
export interface Project {
  /** Stable identifier; also the i18n key suffix and card initial source. */
  id: string;
  /** Category used by the projects-page filter. */
  category: ProjectCategory;
  /** Year the project shipped. */
  year: number;
  /** Technology chips shown on the card. */
  tech: string[];
  /** CSS `background-image` gradient used for the card thumbnail. */
  gradient: string;
  /**
   * Public URL of the shipped product, when there is one. Rendered as an
   * external "visit" link on the card; omitted for confidential work.
   */
  url?: string;
  /** When `true`, the project is surfaced in the home page's featured grid. */
  featured?: boolean;
}

/**
 * Portfolio content. Titles and descriptions live in the locale files under
 * `projects.items.<id>`; this array holds only the structural metadata.
 */
export const projects: Project[] = [
  {
    id: "neredesinco",
    category: "mobile",
    year: 2026,
    tech: ["Swift 6", "SwiftUI", "Fastify", "PostgreSQL"],
    gradient: "linear-gradient(135deg, #ff3d77, #338aff)",
    url: "https://neredesin.co",
    featured: true,
  },
];
