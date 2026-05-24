export const scoredCriteria = ["taste", "salt", "texture", "oil", "priceQuality"] as const;

export type ScoredCriterionKey = (typeof scoredCriteria)[number];

export type CriterionScore = {
  score: number;
  note: string;
};

export type EvaluationCriteria = Record<ScoredCriterionKey, CriterionScore> & {
  verdict: string;
};

export function getCriteriaAverage(criteria: EvaluationCriteria) {
  const total = scoredCriteria.reduce((sum, key) => sum + criteria[key].score, 0);

  return Math.round((total / scoredCriteria.length) * 10) / 10;
}
