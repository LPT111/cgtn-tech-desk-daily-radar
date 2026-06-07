import {
  hasCctnKeyword,
  hasInternationalValue,
  hardTechWeight,
  isDirectReject,
  isMarketingLike,
  isSoftNewsLike,
  reporterSignals
} from './classifier.js';
import { TIER_SCORE } from './sources.js';

export function scoreItemDetailed(item, topicSourceCount = 1) {
  const category = item.category || '其他';
  const hardTech = hardTechWeight({ ...item, category });
  const signals = reporterSignals(item);
  const breakdown = {
    hardTech,
    today: 0,
    sourceAuthority: 0,
    multiSource: 0,
    cgtFocus: 0,
    visual: 0,
    international: 0,
    policy: 0,
    sourceWeight: 0,
    primarySource: 0,
    interviewValue: 0,
    marketingPenalty: 0,
    softNewsPenalty: 0,
    lowValuePenalty: 0
  };

  if (isDirectReject(item)) {
    return { score: 0, reporterScore: 0, breakdown: { ...breakdown, lowValuePenalty: -200 }, signals };
  }

  if (item.status === 'confirmed_today') breakdown.today = 18;
  else if (item.status === 'suspected_today' || item.status === 'no_date') breakdown.today = -10;
  else if (item.status === 'old') breakdown.today = -60;

  breakdown.sourceAuthority = Math.min(18, TIER_SCORE[item.sourceTier] || 6);
  if (topicSourceCount >= 3) breakdown.multiSource = 22;
  else if (topicSourceCount >= 2) breakdown.multiSource = 12;
  if (hasCctnKeyword(item)) breakdown.cgtFocus = 12;
  if (signals.visual) breakdown.visual = 8;
  if (hasInternationalValue(item)) breakdown.international = 9;
  if (category === '监管与安全') breakdown.policy = 12;
  breakdown.sourceWeight = Math.min(8, Number(item.sourceWeight || 0));
  if (signals.primary) breakdown.primarySource = 12;
  if (signals.interview) breakdown.interviewValue = 8;
  if (isMarketingLike(item)) breakdown.marketingPenalty = -35;
  if (isSoftNewsLike(item)) breakdown.softNewsPenalty = -55;
  if (category === '消费互联网') breakdown.lowValuePenalty = -30;
  if (category === '交通与航空') breakdown.lowValuePenalty = -35;
  if (category === '游戏娱乐') breakdown.lowValuePenalty = -100;
  if (category === '其他') breakdown.lowValuePenalty = -80;

  const score = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const reporterScore = score
    + (signals.primary ? 10 : 0)
    + (signals.interview ? 8 : 0)
    + (signals.visual ? 6 : 0)
    + (signals.international ? 8 : 0);

  return {
    score: Math.max(0, score),
    reporterScore: Math.max(0, reporterScore),
    breakdown,
    signals
  };
}

export function scoreItem(item, topicSourceCount = 1) {
  return scoreItemDetailed(item, topicSourceCount).score;
}

export function priorityFromScore(score) {
  if (score >= 145) return 5;
  if (score >= 112) return 4;
  if (score >= 78) return 3;
  return 2;
}
