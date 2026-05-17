import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { angleFor, classify, formatFor, hasInternationalValue, keywordString, matchedTopic, titleCategory } from './src/classifier.js';
import { dedupeAndCluster } from './src/dedupe.js';
import { enrichItem, fetchSource } from './src/fetchers.js';
import { makeBriefing, makeFeishuBriefing } from './src/briefing.js';
import { scoreItem, priorityFromScore } from './src/scorer.js';
import { GLOBAL_SOURCES, SOURCES } from './src/sources.js';
import { firstText, isBadTitle, titleHasOtherDate } from './src/normalize.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(__dirname, 'daily-data.js');
const dataDir = path.join(__dirname, 'data');
const latestJsonPath = path.join(dataDir, 'latest.json');
const briefingDir = path.join(__dirname, 'output');
const briefingMdPath = path.join(briefingDir, 'briefing.md');
const briefingTxtPath = path.join(briefingDir, 'briefing.txt');
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
  if (/任天堂|游戏库|城市体检|城市更新|袭击|致\d+死|ICP备|公网安备|概念股行情|Complaint Center|不良信息举报|特朗普儿子|IPO|报告会$|新闻发布会$|先进事迹报告会|可以说|关键科学问题|人类负责提出问题/.test(item.title)) return false;
  const text = `${item.title} ${item.summary || ''} ${item.rawText || ''}`;
  const titleCat = titleCategory(item.title);
  const textHasTech = /(AI|人工智能|大模型|智能体|多模态|算力|芯片|半导体|GPU|CPU|机器人|具身智能|新能源|智能驾驶|自动驾驶|卫星|火箭|低空|无人机|量子|科研|科学|材料|数据安全|网信|算法|数字经济|云计算|数据中心|鸿蒙|电商|平台经济|药企|生物医药|生命科学)/i.test(text);
  if (item.status === 'suspected_today' && !titleCat) return false;
  return Boolean(titleCat || textHasTech);
}

function isGlobalRelevant(item) {
  if (!item.url || isBadTitle(item.title)) return false;
  if (/apnews\.com\/hub\/(?!technology)/i.test(item.url)) return false;
  if (/\/hub\/(russia-ukraine|donald-trump|politics|sports|world-news|entertainment)/i.test(item.url)) return false;
  if (/^(Español|English|Video|Photos|Podcasts|Newsletters|Sports|Business|Science|Technology|World|US|Europe|Menu|Search)$/i.test(item.title)) return false;
  if (item.title.length < 12) return false;
  const text = `${item.title} ${item.summary || ''} ${item.rawText || ''}`;
  const titleHasSignal = /(AI|artificial intelligence|OpenAI|Google|Meta|Apple|Microsoft|NVIDIA|Tesla|SpaceX|Amazon|Anthropic|chip|semiconductor|robot|autonomous|EV|electric vehicle|space|rocket|satellite|energy|cybersecurity|data|export control|regulation|China|Chinese|supply chain|quantum|technology|tech)/i.test(item.title);
  const textHasSignal = /(AI|artificial intelligence|OpenAI|Google|Meta|Apple|Microsoft|NVIDIA|Tesla|SpaceX|Amazon|Anthropic|chip|semiconductor|robot|autonomous|EV|electric vehicle|space|rocket|satellite|energy|cybersecurity|data|export control|regulation|China|Chinese|supply chain|quantum|technology|tech)/i.test(text);
  if (['AP Technology', 'France24 Technology', 'Reuters Technology', 'Yahoo News Technology'].includes(item.source)) return titleHasSignal;
  return titleHasSignal || (textHasSignal && item.status === 'confirmed_today');
}

function completeItem(item, topicSourceCounts) {
  const category = classify(item);
  const topic = matchedTopic({ ...item, category });
  const score = scoreItem({ ...item, category, matchedTopic: topic }, topicSourceCounts.get(topic) || 1);
  return {
    id: Buffer.from(`${item.url}-${item.title}`).toString('base64url').slice(0, 20),
    title: item.title,
    summary: firstText(item.summary || item.rawText || '', 160),
    source: item.source,
    sources: item.sources || [item.source],
    sourceTier: item.sourceTier,
    url: item.url,
    sourceUrls: item.sourceUrls || [item.url],
    publishedAt: item.publishedAt || item.date || '',
    date: item.date || '',
    category,
    keywords: keywordString(category),
    priority: priorityFromScore(score),
    score,
    format: formatFor(category),
    angle: angleFor(category),
    status: item.status || 'no_date',
    matchedTopic: topic,
    rawText: firstText(item.rawText || item.summary || '', 300)
  };
}

function relevanceToChina(item) {
  const text = `${item.title} ${item.summary || ''} ${item.rawText || ''}`;
  if (/(China|Chinese|Beijing|US-China|export control|semiconductor restriction|supply chain|NVIDIA|Tesla|Apple|OpenAI|AI regulation|data governance|cybersecurity)/i.test(text)) return 'high';
  if (/(AI|chip|semiconductor|robot|autonomous|EV|space|satellite|energy|quantum|Google|Meta|Microsoft|Amazon|Anthropic)/i.test(text)) return 'medium';
  return 'low';
}

function globalAngle(item, category) {
  const relation = relevanceToChina(item);
  if (relation === 'high') {
    return `Use this as a direct international context item for China tech reporting: compare policy, supply-chain pressure, market competition or governance choices around ${category}.`;
  }
  return `Use this as background for global ${category} trends, then localize the CGTN angle by asking how Chinese firms, regulators or researchers are responding.`;
}

function completeGlobalItem(item) {
  const category = classify(item);
  const score = scoreItem({ ...item, category, sourceTier: 'international' }, 1) + (hasInternationalValue(item) ? 10 : 0);
  const relevance = relevanceToChina(item);
  return {
    id: Buffer.from(`global-${item.url}-${item.title}`).toString('base64url').slice(0, 20),
    title: item.title,
    summary: firstText(item.summary || item.rawText || '', 180),
    source: item.source,
    url: item.url,
    publishedAt: item.publishedAt || item.date || '',
    date: item.date || '',
    region: item.region || 'Global',
    category,
    keywords: keywordString(category),
    relevanceToChina: relevance,
    cgtAngle: globalAngle(item, category),
    priority: priorityFromScore(score + (relevance === 'high' ? 15 : relevance === 'medium' ? 5 : 0)),
    score,
    status: item.status || 'no_date'
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
    .sort((a, b) => b.score - a.score);
  const suspected = finalDomestic.items
    .filter(item => item.status === 'suspected_today' || item.status === 'no_date')
    .filter(item => item.priority >= 3)
    .sort((a, b) => b.score - a.score);
  const oldCount = completed.filter(item => item.status === 'old').length;

  const globalEnriched = await enrichAll(global.allItems);
  const globalRelevant = globalEnriched.filter(isGlobalRelevant);
  const { items: globalDeduped } = dedupeAndCluster(globalRelevant);
  const globalLeads = globalDeduped
    .map(completeGlobalItem)
    .filter(item => item.priority >= 3 && item.url)
    .sort((a, b) => {
      const relevanceRank = { high: 3, medium: 2, low: 1 };
      return (relevanceRank[b.relevanceToChina] - relevanceRank[a.relevanceToChina]) || (b.priority - a.priority) || (b.score - a.score);
    })
    .slice(0, 40);

  const allFailures = [...failures, ...global.failures];
  const briefing = makeBriefing(confirmed, topics, allFailures, targetDate, globalLeads, {
    generatedAt,
    itemsSeen: allItems.length + global.allItems.length,
    confirmedToday: confirmed.length,
    suspectedToday: suspected.length,
    failedCount: allFailures.length
  });
  const feishuBriefing = makeFeishuBriefing(confirmed, topics, targetDate, globalLeads, {
    generatedAt,
    itemsSeen: allItems.length + global.allItems.length,
    confirmedToday: confirmed.length
  }, process.env.PUBLIC_DASHBOARD_URL || '');

  const payload = {
    generatedAt,
    targetDate,
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
  await fs.writeFile(briefingMdPath, `# ChenChen 今日 Briefing\n\n${feishuBriefing}\n`, 'utf8');
  console.log(`wrote ${outputPath}`);
  console.log(`wrote ${latestJsonPath}`);
  console.log(`wrote ${briefingMdPath}`);
  console.log(`wrote ${briefingTxtPath}`);
  console.log(JSON.stringify({
    totalFetched: payload.itemsSeen,
    globalFetched: payload.globalItemsSeen,
    confirmedToday: payload.leads.length,
    suspectedToday: payload.suspectedLeads.length,
    filteredOld: payload.skippedNonToday,
    domesticFailedSources: payload.domesticFailedSources.map(item => item.name),
    globalFailedSources: payload.globalFailedSources.map(item => item.name)
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
