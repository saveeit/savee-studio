/**
 * Typeface library for the text overlay — reuses Savee's site-builder fonts
 * (packages/media/site-fonts in saveeit/savee), served from /fonts/site.
 * @font-face rules live in styles/globals.css.
 */

export interface FontDef {
  id: string;
  label: string;
  /** CSS font-family stack (quoted where names contain spaces). */
  family: string;
  category: "Sans Serif" | "Serif" | "Display" | "Mono";
  headlineWeight: number;
  subheadWeight: number;
  /** Headline renders uppercase (display treatment). */
  uppercase: boolean;
  /** Headline letter-spacing as a fraction of font size (negative = tighter). */
  tracking: number;
  /** Subhead renders italic (editorial serif treatment). */
  subheadItalic?: boolean;
}

export const FONTS: FontDef[] = [
  // Defaults (system / app font)
  {
    id: "sans",
    label: "Inter",
    family: "var(--font-sans)",
    category: "Sans Serif",
    headlineWeight: 700,
    subheadWeight: 400,
    uppercase: true,
    tracking: -0.02,
  },
  {
    id: "serif",
    label: "Georgia",
    family: "Georgia, serif",
    category: "Serif",
    headlineWeight: 500,
    subheadWeight: 400,
    uppercase: false,
    tracking: 0,
    subheadItalic: true,
  },
  // Savee site fonts — Sans Serif
  {
    id: "neue-montreal",
    label: "Neue Montreal",
    family: '"PP Neue Montreal", sans-serif',
    category: "Sans Serif",
    headlineWeight: 700,
    subheadWeight: 400,
    uppercase: true,
    tracking: -0.02,
  },
  {
    id: "monument",
    label: "Monument",
    family: '"Monument Normal", sans-serif',
    category: "Sans Serif",
    headlineWeight: 900,
    subheadWeight: 400,
    uppercase: true,
    tracking: -0.01,
  },
  {
    id: "agrandir",
    label: "Agrandir",
    family: '"Agrandir", sans-serif',
    category: "Sans Serif",
    headlineWeight: 700,
    subheadWeight: 400,
    uppercase: true,
    tracking: -0.01,
  },
  {
    id: "object-sans",
    label: "Object Sans",
    family: '"Object Sans", sans-serif',
    category: "Sans Serif",
    headlineWeight: 800,
    subheadWeight: 400,
    uppercase: true,
    tracking: -0.01,
  },
  // Display
  {
    id: "bebas-neue",
    label: "Bebas Neue",
    family: '"Bebas Neue", sans-serif',
    category: "Display",
    headlineWeight: 400,
    subheadWeight: 400,
    uppercase: true,
    tracking: 0.01,
  },
  {
    id: "formula-condensed",
    label: "Formula Condensed",
    family: '"Formula Condensed", sans-serif',
    category: "Display",
    headlineWeight: 900,
    subheadWeight: 400,
    uppercase: true,
    tracking: 0,
  },
  {
    id: "neue-machina",
    label: "Neue Machina",
    family: '"Neue Machina", sans-serif',
    category: "Display",
    headlineWeight: 800,
    subheadWeight: 400,
    uppercase: true,
    tracking: -0.01,
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    family: '"Space Grotesk", sans-serif',
    category: "Display",
    headlineWeight: 700,
    subheadWeight: 400,
    uppercase: true,
    tracking: -0.01,
  },
  // Serif
  {
    id: "editorial-new",
    label: "Editorial New",
    family: '"Editorial New", Georgia, serif',
    category: "Serif",
    headlineWeight: 700,
    subheadWeight: 400,
    uppercase: false,
    tracking: -0.01,
  },
  {
    id: "migra",
    label: "Migra",
    family: '"Migra", Georgia, serif',
    category: "Serif",
    headlineWeight: 800,
    subheadWeight: 400,
    uppercase: false,
    tracking: 0,
  },
  {
    id: "eiko",
    label: "Eiko",
    family: '"Eiko", Georgia, serif',
    category: "Serif",
    headlineWeight: 900,
    subheadWeight: 400,
    uppercase: false,
    tracking: 0,
  },
];

export const FONTS_BY_ID: Record<string, FontDef> = Object.fromEntries(
  FONTS.map((f) => [f.id, f]),
);

export const DEFAULT_FONT_ID = "serif";

export function fontById(id: string): FontDef {
  return FONTS_BY_ID[id] ?? FONTS_BY_ID[DEFAULT_FONT_ID];
}
