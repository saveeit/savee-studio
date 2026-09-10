import React, { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { TEMPLATES, groupTemplates } from "../templates";
import { useAnimator } from "../store";

export function TemplatePanel() {
  const selectedId = useAnimator((s) => s.selectedId);
  const selectTemplate = useAnimator((s) => s.selectTemplate);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"templates" | "custom">("templates");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TEMPLATES;
    return TEMPLATES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.group.toLowerCase().includes(q) ||
        (t.blurb ?? "").toLowerCase().includes(q),
    );
  }, [query]);

  const groups = useMemo(() => groupTemplates(filtered), [filtered]);

  return (
    <div className="flex h-full w-[272px] shrink-0 flex-col border-r border-separator bg-panel">
      {/* tabs */}
      <div className="flex gap-1 px-5 pb-3 pt-6">
        {(["templates", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "text-[15px] font-medium capitalize transition-colors",
              tab === t ? "text-white" : "text-gray-600 hover:text-gray-300",
            )}
          >
            {t}
            {t === "templates" ? <span className="px-2 text-gray-700">·</span> : null}
          </button>
        ))}
      </div>

      {/* search */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface px-3 py-2.5">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates"
            className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="px-5 pb-1.5 pt-1 text-[12px] text-muted">
        {tab === "templates" ? `${filtered.length} templates` : "Your saved presets"}
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-4">
        {tab === "custom" ? (
          <div className="px-3 py-8 text-center text-[13px] leading-relaxed text-gray-500">
            No custom presets yet. Tweak a template and{" "}
            <span className="text-gray-300">Save as custom</span> to keep it here.
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.name} className="mb-0.5">
              {g.templates.map((t) => {
                const active = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t.id)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left transition-colors",
                      active ? "bg-surface" : "hover:bg-surface/60",
                    )}
                  >
                    <div className="min-w-0">
                      <div
                        className={cn(
                          "truncate text-[14px] font-medium",
                          active ? "text-white" : "text-gray-200",
                        )}
                      >
                        {t.name}
                      </div>
                      <div className="truncate text-[12px] text-gray-500">{t.blurb}</div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-gray-300" : "text-gray-600 group-hover:text-gray-400",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-line p-4">
        <button className="w-full rounded-[10px] border border-line bg-surface py-2.5 text-[13px] font-medium text-gray-200 transition-colors hover:border-gray-600 hover:text-white">
          Save as custom
        </button>
      </div>

    </div>
  );
}
