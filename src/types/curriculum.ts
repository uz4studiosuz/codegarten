export interface LearningTrack {
  id: string;
  title: string;
  category: "cs" | "algorithms" | "web" | "ai" | "systems";
  tag: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedHours: string;
  lessonsCount: number;
  description: string;
  skills: string[];
  videoPreview?: string;
  posterImage?: string;
  highlightColor: string;
  accentBadge: string;
  popular?: boolean;
}

export interface QuizQuestion {
  id: string;
  topic: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  codeSnippet?: string;
  question: string;
  options: {
    id: string;
    label: string;
    explanation?: string;
  }[];
  correctOptionId: string;
  detailedSolution: string;
  xpReward: number;
}

export interface FeatureComparison {
  title: string;
  description: string;
  passiveWay: string;
  codegartenWay: string;
  videoAsset: string;
}
