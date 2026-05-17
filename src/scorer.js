import { hasCctnKeyword, hasInternationalValue, isVisual } from './classifier.js';
import { TIER_SCORE } from './sources.js';

export function scoreItem(item, topicSourceCount = 1) {
  let score = 0;
  if (item.status === 'confirmed_today') score += 30;
  if (item.status === 'suspected_today' || item.status === 'no_date') score -= 10;
  if (item.status === 'old') score -= 50;
  score += TIER_SCORE[item.sourceTier] || 6;
  if (topicSourceCount >= 3) score += 25;
  else if (topicSourceCount >= 2) score += 15;
  if (hasCctnKeyword(item)) score += 15;
  if (isVisual(item)) score += 10;
  if (hasInternationalValue(item)) score += 10;
  score += Math.min(10, Number(item.sourceWeight || 0));
  return score;
}

export function priorityFromScore(score) {
  if (score >= 70) return 5;
  if (score >= 50) return 4;
  if (score >= 30) return 3;
  return 2;
}
