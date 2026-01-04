"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState } from "react";
import {
  Loader2,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUpDown,
} from "lucide-react";

interface SiteResult {
  site: string;
  available: boolean | null;
  category: string;
  url: string;
}

type Status = "available" | "taken" | "unknown";
type StatusFilter = "all" | Status;
type SortMode = "status" | "site" | "category";

function getStatus(r: SiteResult): Status {
  return r.available === true
    ? "available"
    : r.available === false
    ? "taken"
    : "unknown";
}

function statusLabel(s: Status) {
  return s === "available"
    ? "Available"
    : s === "taken"
    ? "Claimed"
    : "Unknown";
}

export default function Page() {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<SiteResult[]>([]);
  const [loading, setLoading] = useState(false);

  // UI controls
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("status");
  const [query, setQuery] = useState(""); // search within results

  async function performCheck() {
    const trimmed = username.trim();
    if (!trimmed) return;

    setLoading(true);
    setResults([]);
    setQuery("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSortMode("status");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/check/${encodeURIComponent(
          trimmed
        )}`
      );

      const data = await response.json();
      const rawResults = data?.results ?? [];
      setResults(Array.isArray(rawResults) ? rawResults : []);
    } catch (error) {
      console.error("API Error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) set.add(r.category || "Other");
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [results]);

  const counts = useMemo(() => {
    let a = 0,
      t = 0,
      u = 0;
    for (const r of results) {
      const s = getStatus(r);
      if (s === "available") a++;
      else if (s === "taken") t++;
      else u++;
    }
    return { total: results.length, available: a, taken: t, unknown: u };
  }, [results]);

  const filteredAndSorted = useMemo(() => {
    let list = results;

    if (categoryFilter !== "all") {
      list = list.filter((r) => (r.category || "Other") === categoryFilter);
    }

    if (statusFilter !== "all") {
      list = list.filter((r) => getStatus(r) === statusFilter);
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((r) => r.site.toLowerCase().includes(q));
    }

    const statusRank: Record<Status, number> = {
      available: 0,
      taken: 1,
      unknown: 2,
    };

    const sorted = [...list].sort((a, b) => {
      if (sortMode === "site") return a.site.localeCompare(b.site);
      if (sortMode === "category")
        return (a.category || "Other").localeCompare(b.category || "Other");

      const sa = getStatus(a);
      const sb = getStatus(b);
      const d = statusRank[sa] - statusRank[sb];
      return d !== 0 ? d : a.site.localeCompare(b.site);
    });

    return sorted;
  }, [results, categoryFilter, statusFilter, sortMode, query]);

  const groupedResults = useMemo(() => {
    return filteredAndSorted.reduce((acc, site) => {
      const category = site.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(site);
      return acc;
    }, {} as Record<string, SiteResult[]>);
  }, [filteredAndSorted]);

  return (
    <main className="min-h-screen bg-[#f8fafc] font-sans selection:bg-blue-100">
      {/* Header / Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12">
        <div className="text-center space-y-6">
          <Badge
            variant="secondary"
            className="rounded-full px-4 py-1 text-blue-600 bg-blue-50 border-blue-100"
          >
            v1.0 Live Now
          </Badge>

          <div className="flex justify-center items-center gap-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
              Username<span className="text-blue-600">Scout</span>
            </h1>
            <img
              src="/icon.png"
              alt="icon"
              className="h-16 w-16 md:h-20 md:w-20"
            />
          </div>

          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            UsernameScout is a fast, reliable tool to check username
            availability across a multitude of different platforms.
          </p>

          {/* Search Bar */}
          <div className="flex items-center justify-center max-w-lg mx-auto relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex w-full bg-white rounded-full p-1.5 shadow-xl border border-slate-200">
              <Input
                type="text"
                placeholder="Enter preferred username..."
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-zA-Z0-9._-]/g, "")
                  )
                }
                onKeyDown={(e) => e.key === "Enter" && performCheck()}
                className="border-none focus-visible:ring-0 text-base h-11 pl-4 rounded-full bg-transparent"
              />

              <Button
                onClick={performCheck}
                disabled={loading}
                className="rounded-full px-8 h-11 bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-lg"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                ) : null}
                {loading ? "Searching" : "Search"}
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Results Toolbar (single row) */}
        {results.length > 0 && (
          <div className="sticky top-0 z-20 mt-10 bg-[#f8fafc]/80 backdrop-blur border-y border-slate-200">
            <div className="mx-auto max-w-6xl px-6 py-3">
              <div className="flex items-center gap-2 flex-nowrap overflow-x-auto">
                {/* Counts (clickable chips) */}
                <button
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${
                    statusFilter === "available"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === "available" ? "all" : "available"
                    )
                  }
                >
                  {counts.available} Available
                </button>

                <button
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${
                    statusFilter === "taken"
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() =>
                    setStatusFilter(statusFilter === "taken" ? "all" : "taken")
                  }
                >
                  {counts.taken} Claimed
                </button>

                <button
                  className={`px-2.5 py-1 rounded-full border text-xs font-semibold shrink-0 ${
                    statusFilter === "unknown"
                      ? "bg-slate-100 border-slate-300 text-slate-700"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === "unknown" ? "all" : "unknown"
                    )
                  }
                >
                  {counts.unknown} Unknown
                </button>

                <span className="text-slate-300 shrink-0">•</span>
                <span className="text-slate-500 text-xs font-mono shrink-0">
                  {counts.total} total
                </span>

                {/* Controls */}
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sites…"
                  className="h-9 w-44 md:w-56 bg-white shrink-0"
                />

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shrink-0"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All categories" : c}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() =>
                    setSortMode((prev) =>
                      prev === "status"
                        ? "site"
                        : prev === "site"
                        ? "category"
                        : "status"
                    )
                  }
                  className="h-9 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:border-slate-300 shrink-0"
                  title="Sort"
                >
                  <ArrowUpDown size={16} />
                  Sort: {sortMode}
                </button>

                <Button
                  variant="secondary"
                  className="h-9 shrink-0"
                  onClick={() => {
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setSortMode("status");
                    setQuery("");
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Results Section: scrollable panel */}
      <section className="mx-auto max-w-6xl px-6 mt-6 pb-20">
        {results.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="max-h-[70vh] overflow-auto p-4 space-y-10">
              {Object.entries(groupedResults).map(([category, sites]) => (
                <div
                  key={category}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      {category}
                    </h2>
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-xs text-slate-400 font-mono">
                      {sites.length} sites
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {sites.map((site, index) => {
                      const status = getStatus(site);
                      const statusClass =
                        status === "available"
                          ? "text-green-600"
                          : status === "taken"
                          ? "text-red-500"
                          : "text-slate-400";

                      const host = (() => {
                        try {
                          return new URL(site.url).hostname;
                        } catch {
                          return "example.com";
                        }
                      })();

                      return (
                        <Card
                          key={`${site.site}-${index}`}
                          className="group relative border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          <div className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="h-8 w-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5">
                                <img
                                  src={`https://www.google.com/s2/favicons?sz=64&domain=${host}`}
                                  alt={site.site}
                                  className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://www.google.com/s2/favicons?sz=64&domain=example.com";
                                  }}
                                />
                              </div>

                              {status === "available" && (
                                <CheckCircle2
                                  size={16}
                                  className="text-green-500"
                                />
                              )}
                              {status === "taken" && (
                                <XCircle size={16} className="text-red-400" />
                              )}
                              {status === "unknown" && (
                                <HelpCircle
                                  size={16}
                                  className="text-slate-400"
                                />
                              )}
                            </div>

                            <div>
                              <h3 className="text-sm font-semibold text-slate-700 truncate">
                                {site.site}
                              </h3>
                              <p
                                className={`text-[10px] font-bold uppercase tracking-tighter ${statusClass}`}
                              >
                                {statusLabel(status)}
                              </p>
                            </div>

                            <a
                              href={site.url}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 z-10 opacity-0"
                              aria-label={`View ${site.site}`}
                            />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredAndSorted.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  No results match your filters.
                </div>
              )}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 mt-10">
            <Globe className="text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-medium tracking-tight">
              Enter a handle to scan the web
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
