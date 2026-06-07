import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  angleFor,
  classifyWithEvidence,
  formatFor,
  globalRelevanceScore,
  hardTechWeight,
  isDirectReject,
  isGlobalWhitelistMatch,
  keywordString,
  matchedTopic,
  reporterSignals
} from './src/classifier.js';
import { dedupeAndCluster } from './src/dedupe.js';
import { enrichItem, fetchSource } from './src/fetchers.js';
import { makeBriefing, makeFeishuBriefing } from './src/briefing.js';
import { priorityFromScore, scoreItemDetailed } from './src/scorer.js';
import { GLOBAL_SOURCES, SOURCES } from './src/sources.js';
import { firstText, isBadTitle, titleHasOtherDate } from './src/normalize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, 'daily-data.js');
const dataDir = path.join(__dirname, 'data');
const latestJsonPath = path.join(dataDir, 'latest.json');
const briefingDir = path.join(__dirname, 'output');
const briefingMdPath = path.join(briefingDir, 'briefing.md');
const briefingTxtPath = path.join(briefingDir, 'briefing.txt');
const radarVersion = process.env.RADAR_VERSION || 'v3';
const targetDate = process.env.CGTN_RADAR_DATE || new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date());

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

function isRelevant(item) {
  if (!item.url || isBadTitle(item.title) || titleHasOtherDate(item.title, targetDate)) return false;
  if (isDirectReject(item)) return false;
  if (/城市体检|城市更新|袭击|致\d+死|ICP备|公网安备|概念股行情|四大证券报|头版头条|股市|个股|涨停|党务|党建|培训班|干部培训|会议通知|Complaint Center|不良信息举报|IPO|先进事迹报告会/.test(item.title)) return false;
  const classification = classifyWithEvidence(item);
  const weight = hardTechWeight({ ...item, category: classification.category });
  if (classification.category === '其他' || classification.category === '游戏娱乐') return false;
  if (classification.category === '交通与航空' || classification.category === '消费互联网') return false;
  if (item.status === 'suspected_today' && classification.confidence < 0.68) return false;
  return classification.confidence >= 0.64 && weight >= 70;
}

function isGlobalRelevant(item) {
  if (!item.url || isBadTitle(item.title)) return false;
  if (isDirectReject(item)) return false;
  if (/stock-trading|financial filings|Vance|Trump financial|election|senate|campaign/i.test(item.title)) return false;
  if (/apnews\.com\/hub\/(?!technology)/i.test(item.url)) return false;
  if (/\/hub\/(russia-ukraine|donald-trump|politics|sports|world-news|entertainment)/i.test(item.url)) return false;
  if (/^(Español|English|Video|Photos|Podcasts|Newsletters|Sports|Business|Science|Technology|World|US|Europe|Menu|Search)$/i.test(item.title)) return false;
  if (item.title.length < 12) return false;
  return isGlobalWhitelistMatch(item);
}

function repairTruncatedTitle(item = {}) {
  const title = String(item.title || '').replace(/\s+/g, ' ').trim();
  const summary = String(item.summary || item.rawText || '').replace(/\s+/g, ' ').trim();
  if (!title || !summary) return title;

  const candidate = summary.split(/[，,。；;\n]/)[0].trim();
  const sharedPrefix = title.slice(0, Math.max(8, title.length - 2));
  const visiblyTruncated = /[“"'（(:：]$/.test(title);
  const looksLikeCompletion = candidate.length > title.length
    && candidate.length <= 120
    && (visiblyTruncated || (sharedPrefix.length >= 8 && candidate.startsWith(sharedPrefix)));
  return looksLikeCompletion ? candidate : title;
}

function completeItem(item, topicSourceCounts) {
  const normalizedItem = { ...item, title: repairTruncatedTitle(item) };
  const classification = classifyWithEvidence(normalizedItem);
  const category = classification.category;
  const topic = matchedTopic({ ...normalizedItem, category });
  const scoring = scoreItemDetailed({ ...normalizedItem, category, matchedTopic: topic }, topicSourceCounts.get(topic) || 1);
  const signals = reporterSignals({ ...normalizedItem, category });
  return {
    id: Buffer.from(`${normalizedItem.url}-${normalizedItem.title}`).toString('base64url').slice(0, 20),
    title: normalizedItem.title,
    summary: firstText(normalizedItem.summary || normalizedItem.rawText || '', 160),
    source: normalizedItem.source,
    sources: normalizedItem.sources || [normalizedItem.source],
    sourceTier: normalizedItem.sourceTier,
    url: normalizedItem.url,
    sourceUrls: normalizedItem.sourceUrls || [normalizedItem.url],
    publishedAt: normalizedItem.publishedAt || normalizedItem.date || '',
    date: normalizedItem.date || '',
    category,
    classificationConfidence: classification.confidence,
    classificationEvidence: classification.evidenceFields,
    hardTechPriority: hardTechWeight({ ...normalizedItem, category }),
    keywords: keywordString(category),
    priority: priorityFromScore(scoring.score),
    score: scoring.score,
    reporterScore: scoring.reporterScore,
    scoreBreakdown: scoring.breakdown,
    reporterSignals: signals,
    isPrimarySource: signals.primary,
    hasInterviewValue: signals.interview,
    hasVisualValue: signals.visual,
    hasInternationalValue: signals.international,
    format: formatFor(category),
    angle: angleFor(category, normalizedItem),
    status: normalizedItem.status || 'no_date',
    matchedTopic: topic,
    rawText: firstText(normalizedItem.rawText || normalizedItem.summary || '', 500)
  };
}

function relevanceToChina(item) {
  const text = `${item.title} ${item.summary || ''} ${item.rawText || ''}`;
  if (/(China|Chinese|Beijing|US-China|U\.S\.-China|export control|semiconductor restriction|supply chain|NVIDIA|Tesla|Apple|OpenAI|AI regulation|AI governance|AI safety|data governance|cybersecurity|BIS|NIST|White House|AI Act|standards)/i.test(text)) return 'high';
  if (/(AI|chip|semiconductor|robot|autonomous|EV|space|satellite|energy|quantum|Google|Meta|Microsoft|Amazon|Anthropic)/i.test(text)) return 'medium';
  return 'low';
}

function itemSignature(item) {
  const key = (item.url || item.title || '')
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/[?#].*$/, '')
    .replace(/[^\p{L}\p{N}]+/gu, '');
  return key.slice(0, 120);
}

async function readPreviousPayload() {
  try {
    return JSON.parse(await fs.readFile(latestJsonPath, 'utf8'));
  } catch {
    return null;
  }
}

function buildChangeSummary(previous, domesticLeads, globalLeads) {
  const previousDomestic = new Set((previous?.leads || []).map(itemSignature));
  const previousGlobal = new Set((previous?.globalLeads || []).map(itemSignature));
  const newDomestic = domesticLeads.filter(item => !previousDomestic.has(itemSignature(item)));
  const newGlobal = globalLeads.filter(item => !previousGlobal.has(itemSignature(item)));
  const continuedDomestic = domesticLeads.filter(item => previousDomestic.has(itemSignature(item)));
  const continuedGlobal = globalLeads.filter(item => previousGlobal.has(itemSignature(item)));
  newDomestic.forEach(item => { item.isNewSinceLastRun = true; });
  newGlobal.forEach(item => { item.isNewSinceLastRun = true; });
  continuedDomestic.forEach(item => { item.isNewSinceLastRun = false; });
  continuedGlobal.forEach(item => { item.isNewSinceLastRun = false; });
  return {
    domesticNew: newDomestic.length,
    globalNew: newGlobal.length,
    domesticContinued: continuedDomestic.length,
    globalContinued: continuedGlobal.length,
    topNewDomestic: newDomestic.slice(0, 5).map(item => ({ title: item.title, source: item.source, url: item.url })),
    topNewGlobal: newGlobal.slice(0, 5).map(item => ({ title: item.title, source: item.source, url: item.url })),
    hasPrevious: Boolean(previous?.generatedAt)
  };
}

function percentage(numerator, denominator) {
  return denominator ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;
}

function isWithinDays(date, target, days) {
  if (!date || !target) return false;
  const current = new Date(`${target}T12:00:00Z`);
  const candidate = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(current.getTime()) || Number.isNaN(candidate.getTime())) return false;
  const ageDays = (current.getTime() - candidate.getTime()) / 86400000;
  return ageDays >= 0 && ageDays <= days;
}

function angleDuplicateRate(items) {
  const angles = items.map(item => item.angle || item.cgtAngle).filter(Boolean);
  const unique = new Set(angles);
  return percentage(angles.length - unique.size, angles.length);
}

function contentQualityMetrics(domesticItems, globalItems, domesticCandidates, globalCandidates) {
  const classified = domesticItems.filter(item => Number(item.classificationConfidence || 0) >= 0.64).length;
  const globalWhitelisted = globalItems.filter(item => Number(item.globalWhitelistScore || 0) > 0).length;
  return {
    classificationValidationRate: percentage(classified, domesticItems.length),
    globalWhitelistRate: percentage(globalWhitelisted, globalItems.length),
    angleDuplicateRate: angleDuplicateRate([...domesticItems, ...globalItems]),
    domesticRejected: Math.max(0, domesticCandidates.length - domesticItems.length),
    globalRejected: Math.max(0, globalCandidates.length - globalItems.length),
    targets: {
      classificationValidationRate: '>90%',
      globalWhitelistRate: '>85%',
      angleDuplicateRate: '<10%'
    }
  };
}

function completeGlobalItem(item) {
  const normalizedItem = { ...item, title: repairTruncatedTitle(item) };
  const classification = classifyWithEvidence(normalizedItem);
  const category = classification.category;
  const recentStatus = isWithinDays(normalizedItem.date, targetDate, 2) ? 'confirmed_today' : normalizedItem.status;
  const scoring = scoreItemDetailed({ ...normalizedItem, category, status: recentStatus, sourceTier: 'international' }, 1);
  const relevance = relevanceToChina(normalizedItem);
  const whitelistScore = globalRelevanceScore(normalizedItem);
  const score = scoring.score + Math.round(whitelistScore * 0.25);
  const signals = reporterSignals({ ...normalizedItem, category, sourceTier: 'international' });
  return {
    id: Buffer.from(`global-${normalizedItem.url}-${normalizedItem.title}`).toString('base64url').slice(0, 20),
    title: normalizedItem.title,
    summary: firstText(normalizedItem.summary || normalizedItem.rawText || '', 180),
    source: normalizedItem.source,
    url: normalizedItem.url,
    publishedAt: normalizedItem.publishedAt || normalizedItem.date || '',
    date: normalizedItem.date || '',
    region: normalizedItem.region || 'Global',
    category,
    classificationConfidence: classification.confidence,
    hardTechPriority: hardTechWeight({ ...normalizedItem, category }),
    globalWhitelistScore: whitelistScore,
    keywords: keywordString(category),
    relevanceToChina: relevance,
    cgtAngle: angleFor(category, normalizedItem),
    priority: priorityFromScore(score + (relevance === 'high' ? 15 : relevance === 'medium' ? 5 : 0)),
    score,
    reporterScore: scoring.reporterScore + Math.round(whitelistScore * 0.25),
    reporterSignals: signals,
    status: normalizedItem.date === targetDate ? 'confirmed_today' : (recentStatus === 'confirmed_today' ? 'recent_48h' : (normalizedItem.status || 'no_date'))
  };
}

async function fetchAllSources(sources, label) {
  const allItems = [];
  const failures = [];
  const sourceStats = [];

  for (const source of sources) {
    try {
      const items = await fetchSource(source, targetDate);
      allItems.push(...items.map(item => ({ ...item, region: source.region })));
      sourceStats.push({ name: source.name, tier: source.tier, parsed: items.length, failed: false, optional: Boolean(source.optional) });
      console.log(`ok ${label} ${source.name}: ${items.length}`);
    } catch (error) {
      failures.push({ name: source.name, error: error.message, optional: Boolean(source.optional) });
      sourceStats.push({ name: source.name, tier: source.tier, parsed: 0, failed: true, error: error.message, optional: Boolean(source.optional) });
      console.warn(`fail ${label} ${source.name}: ${error.message}`);
    }
  }

  return { allItems, failures, sourceStats };
}

async function enrichAll(items) {
  const enriched = [];
  for (const group of chunk(items.slice(0, 900), 16)) {
    const results = await Promise.all(group.map(item => enrichItem(item, targetDate)));
    enriched.push(...results);
  }
  return enriched;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const previousPayload = await readPreviousPayload();
  const domestic = await fetchAllSources(SOURCES, 'domestic');
  const global = await fetchAllSources(GLOBAL_SOURCES, 'global');

  const { allItems, failures, sourceStats } = domestic;
  const enriched = await enrichAll(allItems);
  const relevant = enriched.filter(isRelevant);
  const { items: deduped, topics: initialTopics } = dedupeAndCluster(relevant);
  let topics = initialTopics;
  const topicSourceCounts = new Map(topics.map(topic => [topic.topic, topic.sourceCount]));

  const completed = deduped.map(item => completeItem(item, topicSourceCounts));
  const finalDomestic = dedupeAndCluster(completed);
  topics = finalDomestic.topics;
  const confirmed = finalDomestic.items
    .filter(item => item.status === 'confirmed_today' && item.date === targetDate && item.priority >= 3)
    .filter(item => item.classificationConfidence >= 0.64 && item.hardTechPriority >= 70)
    .sort((a, b) => (b.reporterScore - a.reporterScore) || (b.score - a.score));
  const suspected = finalDomestic.items
    .filter(item => item.status === 'suspected_today' || item.status === 'no_date')
    .filter(item => item.priority >= 3)
    .filter(item => item.classificationConfidence >= 0.68 && item.hardTechPriority >= 70)
    .sort((a, b) => (b.reporterScore - a.reporterScore) || (b.score - a.score));
  const oldCount = completed.filter(item => item.status === 'old').length;

  const globalEnriched = await enrichAll(global.allItems);
  const globalRelevant = globalEnriched.filter(isGlobalRelevant);
  const { items: globalDeduped } = dedupeAndCluster(globalRelevant);
  const globalLeads = globalDeduped
    .map(completeGlobalItem)
    .filter(item => item.priority >= 3 && item.url && item.globalWhitelistScore > 0)
    .filter(item => item.classificationConfidence >= 0.58 && item.hardTechPriority >= 70)
    .filter(item => isWithinDays(item.date, targetDate, 2))
    .sort((a, b) => {
      const relevanceRank = { high: 3, medium: 2, low: 1 };
      return (b.reporterScore - a.reporterScore) ||
        (relevanceRank[b.relevanceToChina] - relevanceRank[a.relevanceToChina]) ||
        (b.priority - a.priority) ||
        (b.score - a.score);
    })
    .slice(0, 40);

  const changeSummary = buildChangeSummary(previousPayload, confirmed, globalLeads);
  confirmed.sort((a, b) =>
    ((b.reporterScore + (b.isNewSinceLastRun ? 12 : 0)) - (a.reporterScore + (a.isNewSinceLastRun ? 12 : 0))) ||
    (b.score - a.score));
  globalLeads.sort((a, b) =>
    ((b.reporterScore + (b.isNewSinceLastRun ? 12 : 0)) - (a.reporterScore + (a.isNewSinceLastRun ? 12 : 0))) ||
    (b.score - a.score));
  topics = dedupeAndCluster(confirmed).topics;
  const qualityMetrics = contentQualityMetrics(confirmed, globalLeads, enriched, globalEnriched);

  const allFailures = [...failures, ...global.failures];
  const briefing = makeBriefing(confirmed, topics, allFailures, targetDate, globalLeads, {
    generatedAt,
    itemsSeen: allItems.length + global.allItems.length,
    confirmedToday: confirmed.length,
    suspectedToday: suspected.length,
    failedCount: allFailures.length,
    radarVersion,
    changeSummary
  });
  const feishuBriefing = makeFeishuBriefing(confirmed, topics, targetDate, globalLeads, {
    generatedAt,
    itemsSeen: allItems.length + global.allItems.length,
    confirmedToday: confirmed.length,
    radarVersion,
    changeSummary
  }, process.env.PUBLIC_DASHBOARD_URL || '');

  const payload = {
    generatedAt,
    radarVersion,
    targetDate,
    changeSummary,
    qualityMetrics,
    reporterModeDefault: true,
    updateSchedule: ['07:00 Beijing Time', '14:00 Beijing Time'],
    todayOnly: true,
    sourcesChecked: SOURCES.length,
    successSources: sourceStats.filter(item => !item.failed).length,
    failedSources: failures,
    failures,
    sourceStats,
    itemsSeen: allItems.length,
    itemsAfterEnrich: enriched.length,
    itemsAfterRelevantFilter: relevant.length,
    itemsAfterDedupe: finalDomestic.items.length,
    todayItemsSeen: confirmed.length,
    suspectedItemsSeen: suspected.length,
    skippedNonToday: oldCount,
    domesticSourceStats: sourceStats,
    globalSourceStats: global.sourceStats,
    domesticFailedSources: failures,
    globalFailedSources: global.failures,
    globalSourcesChecked: GLOBAL_SOURCES.length,
    globalSuccessSources: global.sourceStats.filter(item => !item.failed).length,
    globalItemsSeen: global.allItems.length,
    globalWindow: 'latest_48h',
    globalItemsAfterRelevantFilter: globalRelevant.length,
    topics,
    leads: confirmed,
    suspectedLeads: suspected,
    globalLeads,
    brief: briefing.copyText,
    copyBriefingText: briefing.copyText,
    displayBriefingHtml: briefing.displayHtml,
    feishuBriefingText: feishuBriefing
  };

  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(briefingDir, { recursive: true });
  await fs.writeFile(outputPath, `window.CHENCHEN_DAILY_DATA = ${JSON.stringify(payload, null, 2)};\n`, 'utf8');
  await fs.writeFile(latestJsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  await fs.writeFile(briefingTxtPath, `${feishuBriefing}\n`, 'utf8');
  await fs.writeFile(briefingMdPath, `# CGTN Tech Desk Daily Radar V3\n\n${feishuBriefing}\n`, 'utf8');
  console.log(`wrote ${outputPath}`);
  console.log(`wrote ${latestJsonPath}`);
  console.log(`wrote ${briefingMdPath}`);
  console.log(`wrote ${briefingTxtPath}`);
  console.log(JSON.stringify({
    totalFetched: payload.itemsSeen,
    globalFetched: payload.globalItemsSeen,
    confirmedToday: payload.leads.length,
    suspectedToday: payload.suspectedLeads.length,
    qualityMetrics: payload.qualityMetrics,
    filteredOld: payload.skippedNonToday,
    domesticFailedSources: payload.domesticFailedSources.map(item => item.name),
    globalFailedSources: payload.globalFailedSources.map(item => item.name)
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
