"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Loader2,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface SiteResult {
  site: string;
  available: boolean | null;
  category: string;
  url: string;
}

const Page = () => {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<SiteResult[]>([]);
  const [loading, setLoading] = useState(false);

  const groupedResults = results.reduce((acc, site) => {
    const category = site.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(site);
    return acc;
  }, {} as Record<string, SiteResult[]>);

  async function performCheck() {
    const trimmed = username.trim();
    if (!trimmed) return;

    setLoading(true);
    setResults([]);

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

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20 font-sans selection:bg-blue-100">
      {/* Header / Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-20 text-center space-y-8">
        <div className="space-y-4">
          <Badge
            variant="secondary"
            className="rounded-full px-4 py-1 text-blue-600 bg-blue-50 border-blue-100"
          >
            v1.0 Live Now
          </Badge>
          <div className="flex justify-center items-center">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">
              Username<span className="text-blue-600">Scout</span>
            </h1>

            <img src="/icon.png" alt="icon" className="h-24 w-24" />
          </div>

          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            UsernameScout is a fast, reliable tool to check username
            availability across a multitude of different platforms.
          </p>
        </div>

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
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-6xl px-6 mt-20 space-y-16">
        {Object.entries(groupedResults).map(([category, sites]) => (
          <div
            key={category}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {category}
              </h2>
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs text-slate-400 font-mono">
                {sites.length} sites
              </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sites.map((site, index) => {
                const status =
                  site.available === true
                    ? "available"
                    : site.available === false
                    ? "taken"
                    : "unknown";

                const statusLabel =
                  status === "available"
                    ? "Available"
                    : status === "taken"
                    ? "Claimed"
                    : "Unknown";

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
                    key={index}
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
                          <CheckCircle2 size={16} className="text-green-500" />
                        )}
                        {status === "taken" && (
                          <XCircle size={16} className="text-red-400" />
                        )}
                        {status === "unknown" && (
                          <HelpCircle size={16} className="text-slate-400" />
                        )}
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 truncate">
                          {site.site}
                        </h3>
                        <p
                          className={`text-[10px] font-bold uppercase tracking-tighter ${statusClass}`}
                        >
                          {statusLabel}
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

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Globe className="text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-medium tracking-tight">
              Enter a handle to scan the web
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default Page;
