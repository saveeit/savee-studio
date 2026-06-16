import type { Template } from "../types";
import { carousel } from "./carousel";
import { stack } from "./stack";
import { grid } from "./grid";
import { wheel } from "./wheel";
import { marquee } from "./marquee";
import { spin } from "./spin";

export const TEMPLATES: Template[] = [carousel, stack, grid, wheel, marquee, spin];

export const TEMPLATES_BY_ID: Record<string, Template> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
);

export interface TemplateGroup {
  name: string;
  templates: Template[];
}

export function groupTemplates(templates: Template[]): TemplateGroup[] {
  const map = new Map<string, Template[]>();
  for (const t of templates) {
    if (!map.has(t.group)) map.set(t.group, []);
    map.get(t.group)!.push(t);
  }
  return Array.from(map.entries()).map(([name, templates]) => ({ name, templates }));
}
