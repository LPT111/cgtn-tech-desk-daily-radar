import { matchedTopic } from './classifier.js';
import { canonicalUrl, similarityTokens, titleKey } from './normalize.js';

const SOURCE_RANK = {
  official: 60,
  research: 50,
  mainstream: 40,
  industry: 30,
  international: 20
};

const ACTION_WORDS = [
  '发布', '启动', '建成', '完成', '获批', '突破', '上线', '开放', '发射', '试飞',
  '量产', '投产', '融资', '收购', '合作', '处罚', '通报', '回应', '推出', '升级',
  '研制', '签约', '落地', '开源', '禁令', '监管'
];

function jaccard(a, b) {
  const left = new Set(a);
  const right = new Set(b);
  if (!left.size || !right.size) return 0;
  const shared = [...left].filter(item => right.has(item)).length;
  return shared / (left.size + right.size - shared);
}

function longestCommonSubstringLength(a, b) {
  if (!a || !b) return 0;
  const prev = new Array(b.length + 1).fill(0);
  let best = 0;
  for (let i = 1; i <= a.length; i += 1) {
    let last = 0;
    for (let j = 1; j <= b.length; j += 1) {
      const temp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? last + 1 : 0;
      if (prev[j] > best) best = prev[j];
      last = temp;
    }
  }
  return best;
}

function entities(item) {
  const text = `${item.title} ${item.summary || ''}`;
  const matches = text.match(/[A-Za-z][A-Za-z0-9.+-]{1,}|[\u4e00-\u9fa5]{2,}(?:公司|集团|大学|学院|研究院|实验室|卫星|火箭|机器人|汽车|芯片|模型|平台|系统|装置|中心|标准|项目|计划)?/g) || [];
  return [...new Set(matches.filter(token => token.length >= 2 && !/责任编辑|来源|更多|新闻|科技|今日|记者|表示|相关|活动/.test(token)).slice(0, 16))];
}

function actions(item) {
  const text = `${item.title} ${item.summary || ''}`;
  return ACTION_WORDS.filter(word => text.includes(word));
}

const DISTINCT_EVENT_PATTERNS = [
  /(算电岛|预制算力中心|词元用电成本|Token用电成本)/i
];

function sameEvent(a, b) {
  if (canonicalUrl(a.url) && canonicalUrl(a.url) === canonicalUrl(b.url)) return true;
  const aKey = titleKey(a.title);
  const bKey = titleKey(b.title);
  if (aKey && bKey && (aKey.includes(bKey) || bKey.includes(aKey))) return true;
  if (longestCommonSubstringLength(aKey, bKey) >= 12) return true;
  const tokenScore = jaccard(similarityTokens(a.title), similarityTokens(b.title));
  if (tokenScore >= 0.58) return true;
  const aText = `${a.title || ''} ${a.summary || ''}`;
  const bText = `${b.title || ''} ${b.summary || ''}`;
  if (DISTINCT_EVENT_PATTERNS.some(pattern => pattern.test(aText) && pattern.test(bText))) return true;

  const aEntities = new Set(entities(a));
  const bEntities = new Set(entities(b));
  const sharedEntities = [...aEntities].filter(entity => bEntities.has(entity) || [...bEntities].some(other => other.includes(entity) || entity.includes(other)));
  const sharedActions = actions(a).filter(action => actions(b).includes(action));
  const sameTopic = matchedTopic(a) === matchedTopic(b);
  if (sameTopic && sharedEntities.length >= 2 && (sharedActions.length || tokenScore >= 0.34)) return true;
  if (sharedEntities.length >= 3 && tokenScore >= 0.28) return true;
  return false;
}

function betterPrimary(a, b) {
  const scoreA = (SOURCE_RANK[a.sourceTier] || 0) + Number(a.sourceWeight || 0) + ((a.summary || '').length > 80 ? 4 : 0);
  const scoreB = (SOURCE_RANK[b.sourceTier] || 0) + Number(b.sourceWeight || 0) + ((b.summary || '').length > 80 ? 4 : 0);
  return scoreB > scoreA ? b : a;
}

function mergeInto(current, item) {
  const primary = betterPrimary(current, item);
  const secondary = primary === current ? item : current;
  primary.sources = Array.from(new Set([
    ...(current.sources || [current.source]),
    ...(item.sources || [item.source])
  ].filter(Boolean)));
  primary.sourceUrls = Array.from(new Set([
    ...(current.sourceUrls || [current.url]),
    ...(item.sourceUrls || [item.url])
  ].filter(Boolean)));
  primary.relatedTitles = Array.from(new Set([...(current.relatedTitles || [current.title]), item.title, ...(item.relatedTitles || [])])).slice(0, 8);
  if ((secondary.summary || '').length > (primary.summary || '').length) primary.summary = secondary.summary;
  if (!primary.publishedAt && secondary.publishedAt) primary.publishedAt = secondary.publishedAt;
  if (!primary.date && secondary.date) primary.date = secondary.date;
  if (!primary.status || primary.status !== 'confirmed_today') primary.status = secondary.status || primary.status;
  return primary;
}

export function dedupeAndCluster(items) {
  const deduped = [];

  for (const item of items) {
    if (!titleKey(item.title) || !item.url) continue;
    const idx = deduped.findIndex(existing => sameEvent(existing, item));
    if (idx >= 0) {
      deduped[idx] = mergeInto(deduped[idx], item);
      continue;
    }
    deduped.push({ ...item, sources: [item.source], sourceUrls: [item.url], relatedTitles: [item.title] });
  }

  for (const item of deduped) item.matchedTopic = matchedTopic(item);

  const topicMap = new Map();
  for (const item of deduped) {
    const topic = item.matchedTopic;
    if (!topicMap.has(topic)) topicMap.set(topic, { topic, count: 0, sources: new Set(), items: [] });
    const group = topicMap.get(topic);
    group.count += 1;
    for (const source of item.sources || [item.source]) group.sources.add(source);
    group.items.push(item.title);
  }

  const topics = [...topicMap.values()]
    .map(group => ({
      topic: group.topic,
      count: group.count,
      sourceCount: group.sources.size,
      sources: [...group.sources],
      items: group.items.slice(0, 5)
    }))
    .sort((a, b) => (b.sourceCount - a.sourceCount) || (b.count - a.count));

  return { items: deduped, topics };
}
