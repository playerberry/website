/**
 * A digital product sold in the store. Titles, descriptions and category
 * labels are localised in the locale files under `store.items.<id>` and looked
 * up by `id`.
 */
export interface Product {
  /** Stable identifier; also the i18n key suffix. */
  id: string;
  /** Price in US dollars. */
  price: number;
  /** Font Awesome icon class shown on the product tile. */
  icon: string;
  /** Optional highlight badge rendered on the card corner. */
  badge?: "popular" | "new";
  /** Accent-colour modifier for the icon tile (empty string = berry default). */
  tone: "" | "is-violet" | "is-blue" | "is-cyan" | "is-amber";
}

/**
 * Store catalogue. Titles, descriptions and category labels live in the locale
 * files under `store.items.<id>`; this array holds only the metadata.
 */
export const products: Product[] = [
  {
    id: "berry-ui",
    price: 49,
    icon: "fa-solid fa-layer-group",
    badge: "popular",
    tone: "",
  },
  {
    id: "vue-launch",
    price: 39,
    icon: "fa-solid fa-rocket",
    tone: "is-cyan",
  },
  {
    id: "swift-components",
    price: 59,
    icon: "fa-solid fa-mobile-screen",
    badge: "new",
    tone: "is-blue",
  },
  {
    id: "icon-forge",
    price: 19,
    icon: "fa-solid fa-icons",
    tone: "is-amber",
  },
  {
    id: "api-boiler",
    price: 45,
    icon: "fa-solid fa-server",
    tone: "is-violet",
  },
  {
    id: "berry-blocks",
    price: 29,
    icon: "fa-solid fa-cubes",
    tone: "",
  },
];
