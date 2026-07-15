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
  /** When `true`, the project is surfaced in the home page's featured grid. */
  featured?: boolean;
}

/**
 * Portfolio content. Titles and descriptions live in the locale files under
 * `projects.items.<id>`; this array holds only the structural metadata.
 */
export const projects: Project[] = [
  {
    id: "nova",
    category: "web",
    year: 2026,
    tech: ["Vue 3", "TypeScript", "Node.js"],
    gradient: "linear-gradient(135deg, #ff3d77, #8b5cf6)",
    featured: true,
  },
  {
    id: "pulse",
    category: "mobile",
    year: 2025,
    tech: ["Swift", "SwiftUI", "HealthKit"],
    gradient: "linear-gradient(135deg, #338aff, #3cf0c5)",
    featured: true,
  },
  {
    id: "atlas",
    category: "web",
    year: 2025,
    tech: ["Nuxt", "PostgreSQL", "Stripe"],
    gradient: "linear-gradient(135deg, #ffa63d, #ff3d77)",
    featured: true,
  },
  {
    id: "echo",
    category: "web",
    year: 2024,
    tech: ["WebSocket", "Redis", "Fastify"],
    gradient: "linear-gradient(135deg, #8b5cf6, #338aff)",
  },
  {
    id: "forge",
    category: "devops",
    year: 2024,
    tech: ["Docker", "Kubernetes", "Go"],
    gradient: "linear-gradient(135deg, #3cf0c5, #8b5cf6)",
  },
  {
    id: "orbit",
    category: "design",
    year: 2023,
    tech: ["Figma", "Design Tokens", "Less"],
    gradient: "linear-gradient(135deg, #ff3d77, #ffa63d)",
  },
];
