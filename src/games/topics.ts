/**
 * Curriculum topics
 * -----------------
 * The vocabulary shared by modules (content/modules/*.json → `topics`) and
 * games (GameDefinition → `topics`). A lesson ends in a game that practises the
 * very idea it just taught, and this list is the join between the two sides.
 *
 * Add a topic only when a game exists that can practise it; an unmatched topic
 * silently falls back to keyword and kind matching (see resolve.ts).
 */
export type GameTopic =
  | "sequencing"
  | "debugging"
  | "loops"
  | "functions"
  | "conditionals"
  | "variables"
  | "efficiency"
  | "geometry";

export const TOPIC_LABELS: Record<GameTopic, string> = {
  sequencing: "Ketma-ketlik",
  debugging: "Xatolarni topish",
  loops: "Sikllar",
  functions: "Funksiyalar",
  conditionals: "Shartlar",
  variables: "O'zgaruvchilar",
  efficiency: "Samaradorlik",
  geometry: "Shakl va parametr",
};

export const ALL_TOPICS = Object.keys(TOPIC_LABELS) as GameTopic[];

export function isGameTopic(value: string): value is GameTopic {
  return value in TOPIC_LABELS;
}
