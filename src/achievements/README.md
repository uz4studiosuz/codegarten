# Achievements

A self-contained module: badge rules, the celebration dialog and the dashboard
panel. Nothing outside this folder knows how an achievement is decided.

## Layers

```
src/achievements/
  types.ts                 shapes only (Achievement, ProgressSnapshot, ...)
  catalog.ts               the rules — pure data
  evaluate.ts              snapshot + catalog -> state (pure, no React)
  storage.ts               which badges were already celebrated (localStorage)
  context.tsx              wires progress -> evaluate -> celebration queue
  components/              presentation only
  index.ts                 the public surface — import from here
```

Each layer may only import from the ones above it. `evaluate.ts` has no React
and no storage, so the rules can be unit-tested or moved to the server later
without touching anything else.

## The two rules that keep it honest

- **Derived, never stored.** Whether a badge is earned is recomputed from the
  current progress snapshot every render. Only *celebrated* ids are persisted,
  so rules can be added, renamed or rebalanced with no migration.
- **Celebrated exactly once.** The first evaluation after install adopts the
  learner's existing progress silently — otherwise shipping a new badge would
  greet a mid-course learner with a stack of dialogs. After that, a crossing
  queues one dialog, and the id is recorded when the learner dismisses it (not
  when it is queued), so a badge earned in a tab that gets closed is still
  celebrated next time.

## Adding an achievement

Append to `ACHIEVEMENTS` in `catalog.ts`:

```ts
{
  id: "streak-30",                       // stable: it is the storage key
  name: "Bir oylik zanjir",
  description: "Ketma-ket 30 kun dars qiling",   // shown while locked
  icon: "🌙",
  group: "izchillik",
  metric: (s) => s.streak,               // progress toward the goal
  goal: 30,
  unit: "kun",
  celebration: "O'ttiz kun ketma-ket — bu endi odat.",
}
```

`metric` may only read `ProgressSnapshot`. To base a badge on something new,
add the field to `ProgressSnapshot` in `types.ts` and feed it in `context.tsx`
— which is also the moment to ask whether the dashboard shows that number
anywhere, since a locked badge doubles as a hint about what to do next.

## Where the numbers come from

`ProgressContext.stats` (lessons, XP, streak, active days, finished levels and
modules, track percent) plus `VocabularyContext.count` for saved terms. The
provider mounts inside both, and renders the dialog itself — so a badge earned
at the end of a lesson is congratulated wherever the learner happens to be.
