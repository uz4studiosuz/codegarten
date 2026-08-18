"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  IconArrowLeft,
  IconBook,
  IconDumbbell,
  IconCheck,
  IconStarFilled,
  IconLockFilled,
  IconBarbell,
} from "@tabler/icons-react";
import { AppNavbar } from "@/components/dashboard/AppNavbar";
import { foundationalLearningPath, mockUserProfile } from "@/data/mockCourseData";

type NodeState = "completed" | "active" | "locked";

/** Vertical air above an item, and for nodes the offset from the column centre. */
type PathItem =
  | { kind: "level"; num: number; title: string; gapTop: number }
  | { kind: "nextup"; title: string; lessonId: string; gapTop: number }
  | {
      kind: "node";
      id: string;
      title: string;
      state: NodeState;
      zig: number;
      gapTop: number;
      isReview?: boolean;
    };

/**
 * The trail is hand-authored as a flat ribbon: banners, the "Next up" card and
 * the snaking nodes appear in exactly this order, with the horizontal offsets
 * and vertical gaps that give the path its wandering shape.
 */
const PATH_ITEMS: PathItem[] = [
  { kind: "level", num: 1, title: "Variables", gapTop: 0 },
  { kind: "node", id: "step-1", title: "Multiple Variables", state: "completed", zig: 17, gapTop: 31 },
  { kind: "node", id: "step-2", title: "Using Variables", state: "active", zig: -79, gapTop: 30 },
  { kind: "node", id: "step-3", title: "Setting Variables", state: "locked", zig: -117, gapTop: 32 },
  { kind: "node", id: "step-4", title: "Level Review", state: "locked", zig: -64, gapTop: 33, isReview: true },
  { kind: "nextup", title: "Using Variables", lessonId: "step-2", gapTop: 28 },
  { kind: "node", id: "step-5", title: "Setting Variables", state: "locked", zig: 3, gapTop: 31 },
  { kind: "node", id: "step-6", title: "Setting Variables", state: "locked", zig: -43, gapTop: 41 },
  { kind: "node", id: "step-7", title: "Setting Variables", state: "locked", zig: -113, gapTop: 42 },
  { kind: "node", id: "step-8", title: "Setting Variables", state: "locked", zig: -159, gapTop: 42 },
  { kind: "node", id: "step-9", title: "Setting Variables", state: "locked", zig: -123, gapTop: 41 },
  { kind: "node", id: "step-10", title: "Level Review", state: "locked", zig: -43, gapTop: 41, isReview: true },
];

const DISC_SIZE = { completed: 76, active: 76, locked: 72 } as const;

// ── Node disc ───────────────────────────────────────────────────────────────
function NodeDisc({
  state,
  size,
  isReview,
}: {
  state: NodeState;
  size: number;
  isReview?: boolean;
}) {
  const box = { width: size, height: size };
  const lift = "shadow-[0_5px_12px_rgba(0,0,0,0.45)]";

  if (state === "completed") {
    return (
      <div
        style={box}
        className={`shrink-0 rounded-full bg-gradient-to-b from-[#6BC95F] to-[#55AE4A] ${lift} flex items-center justify-center`}
      >
        <IconCheck size={30} stroke={3.2} className="text-white" />
      </div>
    );
  }

  if (state === "active") {
    return (
      <div
        style={box}
        className={`shrink-0 rounded-full bg-gradient-to-b from-[#F5BB4D] to-[#E09E2A] ${lift} flex items-center justify-center`}
      >
        <IconStarFilled size={26} className="text-white" />
      </div>
    );
  }

  return (
    <div
      style={box}
      className={`shrink-0 rounded-full bg-gradient-to-b from-[#F1F1F1] to-[#DCDCDC] ${lift} flex items-center justify-center`}
    >
      {isReview ? (
        <IconBarbell size={26} stroke={2} className="text-[#9A9AA1]" />
      ) : (
        <IconLockFilled size={22} className="text-[#9A9AA1]" />
      )}
    </div>
  );
}

export default function ModulePathPage() {
  const urlParams = useParams();
  const moduleId = (urlParams?.moduleId as string) || "mod-2";

  const path = foundationalLearningPath;
  const mod =
    path.modules.find((m) => m.id === moduleId) || path.modules[1] || path.modules[0];

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col font-sans">
      <AppNavbar activeTab="courses" user={mockUserProfile} />

      {/* ── Breadcrumb ── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-[1118px] mx-auto px-6 py-5 flex items-center gap-2.5">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[15px] text-[#8b8b93] hover:text-white transition-colors"
          >
            <IconArrowLeft size={18} />
            Courses
          </Link>
          <span className="text-[#3a3a41] text-[15px]">/</span>
          <span className="text-[15px] text-[#c9c9d0]">{mod.title}</span>
        </div>
      </div>

      <main className="flex-1 max-w-[1118px] w-full mx-auto px-6 py-[52px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-11 lg:gap-[72px] items-start">

          {/* ══ LEFT: module summary card ══ */}
          <div className="rounded-[26px] border border-[#2b2b31] bg-[#101013] p-7">
            <Image
              src={mod.imageSrc || "/images/loops.png"}
              alt={mod.title}
              width={72}
              height={72}
              className="w-[72px] h-[72px] object-contain"
            />

            <h1 className="mt-6 text-[26px] font-bold leading-tight text-white">
              {mod.title}
            </h1>
            <p className="mt-2.5 text-[15px] leading-[1.65] text-[#8b8b93]">
              {mod.description}
            </p>

            <div className="mt-7 h-px bg-[#2b2b31]" />

            <div className="mt-5 flex items-center gap-7 text-[15px] text-[#9a9aa2]">
              <span className="inline-flex items-center gap-2">
                <IconBook size={18} stroke={1.8} className="text-[#7a7a83]" />
                15 Lessons
              </span>
              <span className="inline-flex items-center gap-2">
                <IconDumbbell size={18} stroke={1.8} className="text-[#7a7a83]" />
                150 Exercises
              </span>
            </div>
          </div>

          {/* ══ RIGHT: snaking lesson path ══ */}
          <div className="flex flex-col">
            {PATH_ITEMS.map((item, idx) => {
              if (item.kind === "level") {
                return (
                  <div
                    key={`level-${item.num}`}
                    style={{ marginTop: item.gapTop }}
                    className="rounded-[16px] border-2 border-[#22C55E] px-5 py-4 text-center"
                  >
                    <div className="text-[11px] font-mono font-bold uppercase leading-none tracking-[0.22em] text-[#8b8b93]">
                      Level {item.num}
                    </div>
                    <div className="mt-1.5 text-[16px] font-bold leading-none text-white">
                      {item.title}
                    </div>
                  </div>
                );
              }

              if (item.kind === "nextup") {
                return (
                  <Link
                    key={`nextup-${idx}`}
                    href={`/learn/${moduleId}/${item.lessonId}`}
                    style={{ marginTop: item.gapTop }}
                    className="block rounded-[16px] border border-[#2b2b31] bg-[#16161a] px-6 py-4 hover:border-[#3d3d45] transition-colors"
                  >
                    <div className="text-[13px] text-[#8b8b93]">Next up</div>
                    <div className="mt-0.5 text-[16px] font-bold text-white">
                      {item.title}
                    </div>
                  </Link>
                );
              }

              const isLocked = item.state === "locked";
              const size = DISC_SIZE[item.state];

              /*
               * The disc — not the disc+label group — is what has to land on the
               * trail, so it is absolutely placed at the column centre plus its
               * offset. Narrow screens use a damped offset so nothing escapes.
               */
              const anchor = {
                "--x": `calc(50% + ${item.zig}px - ${size / 2}px)`,
                "--x-sm": `calc(50% + ${Math.round(item.zig * 0.45)}px - ${size / 2}px)`,
                marginTop: item.gapTop,
                height: size,
              } as React.CSSProperties;

              return (
                <div key={item.id} className="relative w-full" style={anchor}>
                  <Link
                    href={isLocked ? "#" : `/learn/${moduleId}/${item.id}`}
                    aria-disabled={isLocked}
                    tabIndex={isLocked ? -1 : undefined}
                    onClick={(e) => isLocked && e.preventDefault()}
                    className={`absolute top-0 left-[var(--x-sm)] lg:left-[var(--x)] flex items-center gap-5 rounded-full ${
                      isLocked
                        ? "cursor-default"
                        : "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22C55E]"
                    }`}
                  >
                    <NodeDisc state={item.state} size={size} isReview={item.isReview} />
                    <span
                      className={`text-[15px] whitespace-nowrap ${
                        item.state === "active"
                          ? "font-bold text-white"
                          : item.isReview
                          ? "font-medium text-[#6d6d74]"
                          : "font-medium text-[#c9c9d0]"
                      }`}
                    >
                      {item.title}
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
