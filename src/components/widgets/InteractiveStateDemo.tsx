"use client";

import React, { useState } from "react";
import { IconBolt, IconServer, IconRotateClockwise, IconCpu, IconDeviceDesktop } from "@tabler/icons-react";
import { Button } from "@/design-system/primitives/Button";
import { Badge } from "@/design-system/primitives/Badge";

export const InteractiveStateDemo: React.FC = () => {
  const [useCache, setUseCache] = useState(true);
  const [requestState, setRequestState] = useState<"idle" | "fetching" | "success">("idle");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [requestCount, setRequestCount] = useState(0);

  const triggerRequest = () => {
    if (requestState === "fetching") return;
    setRequestState("fetching");

    const latency = useCache ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 120) + 180;

    setTimeout(() => {
      setLatencyMs(latency);
      setRequestState("success");
      setRequestCount((c) => c + 1);
    }, useCache ? 300 : 1200);
  };

  return (
    <div className="w-full rounded-2xl bg-[#0f1218] border border-border-subtle p-5 sm:p-7 shadow-deep">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-accent-purple">
            <IconCpu size={16} stroke={2} />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              System Architecture: Cache vs Database Latency
            </h4>
            <p className="text-xs text-text-muted">
              Xotira ierarxiyasi va taqsimlangan tizimlar kechikishini his qiling
            </p>
          </div>
        </div>

        {/* Cache Toggle */}
        <div className="flex items-center gap-2 bg-bg-card p-1 rounded-lg border border-border-subtle">
          <button
            onClick={() => setUseCache(true)}
            className={`px-3 py-1 text-xs rounded font-semibold transition-all ${
              useCache
                ? "bg-accent-green text-black shadow-glow-green"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Redis In-Memory (Cache)
          </button>
          <button
            onClick={() => setUseCache(false)}
            className={`px-3 py-1 text-xs rounded font-semibold transition-all ${
              !useCache
                ? "bg-brand-electric text-white shadow-glow"
                : "text-text-secondary hover:text-white"
            }`}
          >
            Disk Database (No Cache)
          </button>
        </div>
      </div>

      {/* Visual System Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center mb-6">
        {/* Node 1: API Gateway */}
        <div className="p-4 rounded-xl bg-bg-card border border-border-medium flex flex-col items-center text-center relative">
          <div className="w-10 h-10 rounded-full bg-brand/30 border border-brand-electric/50 flex items-center justify-center text-brand-light mb-2">
            <IconServer size={20} stroke={2} />
          </div>
          <span className="text-xs font-bold text-white">Edge API Gateway</span>
          <span className="text-[10px] text-text-muted mt-0.5">So&apos;rov qabul qiluvchi</span>
        </div>

        {/* Flow indicator */}
        <div className="flex flex-col items-center justify-center py-2 sm:py-0">
          <div
            className={`h-1 w-full rounded-full transition-all duration-500 ${
              requestState === "fetching"
                ? "bg-gradient-to-r from-brand-electric via-accent-green to-brand-electric animate-shimmer bg-[length:200%_100%]"
                : "bg-border-subtle"
            }`}
          />
          <span className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1 font-mono">
            {requestState === "fetching" ? "So'rov jo'natilmoqda..." : "Kutish holati"}
          </span>
        </div>

        {/* Node 2: Data Source */}
        <div
          className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center relative ${
            useCache
              ? "bg-accent-green/10 border-accent-green/40 shadow-glow-green"
              : "bg-brand/20 border-brand-electric/40"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              useCache
                ? "bg-accent-green text-black"
                : "bg-bg-elevated border border-border-medium text-brand-light"
            }`}
          >
            {useCache ? <IconBolt size={20} stroke={2} /> : <IconDeviceDesktop size={20} stroke={2} />}
          </div>
          <span className="text-xs font-bold text-white">
            {useCache ? "In-Memory RAM Cache" : "PostgreSQL Disk DB"}
          </span>
          <span className="text-[10px] text-text-muted mt-0.5">
            {useCache ? "Kechikish: ~2-5 ms" : "Kechikish: ~180-300 ms"}
          </span>
        </div>
      </div>

      {/* Latency Output Box */}
      <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-[#141822] border border-border-subtle mb-5">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              requestState === "fetching"
                ? "bg-accent-amber animate-ping"
                : requestState === "success"
                ? "bg-accent-green"
                : "bg-text-dim"
            }`}
          />
          <div>
            <span className="text-xs text-text-muted block">Joriy javob vaqti (Latency):</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-white">
              {latencyMs !== null ? `${latencyMs} ms` : "—"}
            </span>
          </div>
        </div>

        {latencyMs !== null && (
          <Badge variant={latencyMs < 10 ? "success" : "warning"} size="md">
            {latencyMs < 10 ? "⚡ 60x Tezroq (Cache Hit)" : "🐢 Sekin (Disk I/O)"}
          </Badge>
        )}
      </div>

      {/* Trigger Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          So&apos;rovlar soni: {requestCount}
        </span>

        <Button
          size="sm"
          variant="primary"
          onClick={triggerRequest}
          isLoading={requestState === "fetching"}
          leftIcon={<IconRotateClockwise size={14} stroke={2} />}
        >
          So&apos;rov Yuborish (Test Request)
        </Button>
      </div>
    </div>
  );
};
