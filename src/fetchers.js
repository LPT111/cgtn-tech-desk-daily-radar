import { absoluteUrl, cleanTitle, dateKeyFromDate, dateKeyFromText, firstText, isBadTitle, stripTags } from './normalize.js';

export async function fetchText(url, sourceType = 'html', timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 ChenChen-CGTN-Tech-Radar/2.0',
        accept: sourceType === 'rss' ? 'application/rss+xml, application/atom+xml, text/xml, */*' : 'text/html, application/json, */*'
      }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractMeta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  return stripTags((html.match(pattern) || [])[1] || '');
}

function articleScope(html) {
  const blocks = [
    ...html.match(/<article\b[\s\S]*?<\/article>/gi) || [],
    ...html.match(/<main\b[\s\S]*?<\/main>/gi) || [],
    ...html.match(/<div[^>]+(?:id|class)=["'][^"']*(?:TRS_Editor|article|content|detail|main|正文|text|post_content|article-content)[^"']*["'][^>]*>[\s\S]{0,20000}?<\/div>/gi) || []
  ];
  return blocks.join(' ') || html.slice(0, 14000);
}

function structuredPublishedDate(html, targetDate) {
  const jsonLdDate =
    (html.match(/["']datePublished["']\s*:\s*["']([^"']+)["']/i) || [])[1] ||
    (html.match(/["']dateCreated["']\s*:\s*["']([^"']+)["']/i) || [])[1] ||
    '';
  const timeDate =
    (html.match(/<time[^>]+datetime=["']([^"']+)["'][^>]*>/i) || [])[1] ||
    '';
  const labeledDate =
    (articleScope(html).match(/(?:发布时间|发布日期|发布于|更新于|Published|Updated)\s*[:：]?\s*((?:20\d{2})[-/.年]\d{1,2}[-/.月]\d{1,2}(?:日)?(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?)/i) || [])[1] ||
    '';
  const candidate = jsonLdDate || timeDate || labeledDate;
  return dateKeyFromDate(candidate) || dateKeyFromText(candidate, targetDate);
}

export function extractDetail(html, targetDate) {
  const metaDate =
    extractMeta(html, 'article:published_time') ||
    extractMeta(html, 'pubdate') ||
    extractMeta(html, 'publishdate') ||
    extractMeta(html, 'date') ||
    extractMeta(html, 'og:release_date') ||
    extractMeta(html, 'weibo: article:create_at');
  const date = dateKeyFromDate(metaDate) || structuredPublishedDate(html, targetDate);
  const summary = firstText(
    extractMeta(html, 'description') ||
    extractMeta(html, 'og:description') ||
    articleScope(html),
    500
  );
  return { date, summary, rawText: summary, dateConfidence: date ? 'detail' : 'none' };
}

function push(items, source, title, url, context = '', targetDate = '') {
  const clean = cleanTitle(title);
  if (!url || !clean || isBadTitle(clean)) return;
  const absolute = absoluteUrl(url, source.url);
  const urlDate = dateKeyFromText(absolute, targetDate);
  const listDate = dateKeyFromText(`${clean} ${context}`, targetDate);
  items.push({
    id: '',
    title: clean,
    summary: firstText(context, 180),
    source: source.name,
    sourceTier: source.tier,
    url: absolute,
    publishedAt: '',
    date: urlDate || listDate,
    dateConfidence: urlDate ? 'url' : (listDate ? 'list' : 'none'),
    rawText: firstText(context, 500),
    sourceWeight: source.weight
  });
}

export function parseRss(xml, source, targetDate) {
  const items = [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi) || [];
  for (const block of blocks.slice(0, 120)) {
    const title = (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const link =
      (block.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i) || [])[1] ||
      stripTags((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
    const description =
      (block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] ||
      (block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1] ||
      (block.match(/<content[^>]*>([\s\S]*?)<\/content>/i) || [])[1] ||
      '';
    const pubDate =
      stripTags((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '') ||
      stripTags((block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] || '');
    push(items, source, title, link, description, targetDate);
    const last = items.at(-1);
    if (last) {
      last.publishedAt = pubDate;
      const rssDate = dateKeyFromDate(pubDate);
      last.date = rssDate || last.date;
      if (rssDate) last.dateConfidence = 'rss';
    }
  }
  return items;
}

export function parseHtml(html, source, targetDate) {
  const items = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;
  const allow = parserAllow(source.parser);
  while ((match = anchorPattern.exec(html)) && items.length < 240) {
    const attrs = match[1] || '';
    const href = (attrs.match(/\bhref=["']([^"']+)["']/i) || [])[1];
    const title = match[2];
    if (!href || /javascript:|mailto:|#/.test(href)) continue;
    if (allow && !allow(href, stripTags(title))) continue;
    const context = html.slice(Math.max(0, match.index - 300), Math.min(html.length, anchorPattern.lastIndex + 300));
    push(items, source, title, href, context, targetDate);
  }
  return items;
}

function parserAllow(parser = 'generic') {
  const rules = {
    sina: href => /(tech|finance|news)\.sina|\/roll\/|doc-|article/.test(href),
    stdaily: href => /(content_|\/\d{2}\/\d{2}\/|\/\d{4}-\d{2}\/\d{2}\/)/.test(href),
    cas: href => /(\/yw\/|\/ky\/|\/xw\/|\/\d{6}\/)/.test(href),
    sciencenet: href => /(htmlnews|news\/|paper|id=)/i.test(href),
    cctv: href => /(\/\d{4}\/\d{2}\/\d{2}\/|content_\d+)/.test(href),
    'news-cn': href => /(\/tech\/|\/fortune\/|c_\d+|\/\d{8}\/)/.test(href),
    people: href => /(n1\/|c1007|c1057|science|tech)/i.test(href),
    gmw: href => /(\/\d{4}-\d{2}\/\d{2}\/|tech|kepu|content_)/i.test(href),
    cnr: href => /(\/\d{8}\/|tech|kj|cnr.cn)/i.test(href),
    cls: href => /(detail|telegraph|article|depth)/i.test(href)
  };
  return rules[parser] || null;
}

export async function fetchSource(source, targetDate) {
  const text = await fetchText(source.url, source.type);
  if (source.type === 'rss') return parseRss(text, source, targetDate);
  return parseHtml(text, source, targetDate);
}

export async function enrichItem(item, targetDate) {
  if (!item.url) return item;
  try {
    const html = await fetchText(item.url, 'html', 10000);
    const detail = extractDetail(html, targetDate);
    const urlDate = dateKeyFromText(item.url, targetDate);
    const trustedItemDate = ['rss', 'url'].includes(item.dateConfidence) ? item.date : '';
    const date = urlDate || detail.date || trustedItemDate;
    const status = date === targetDate ? 'confirmed_today' : (date ? 'old' : 'suspected_today');
    return {
      ...item,
      summary: detail.summary || item.summary,
      rawText: detail.rawText || item.rawText,
      publishedAt: item.publishedAt || date,
      date,
      dateConfidence: urlDate ? 'url' : (detail.date ? 'detail' : (trustedItemDate ? item.dateConfidence : 'none')),
      status,
      detailChecked: true
    };
  } catch {
    const trustedDate = ['rss', 'url'].includes(item.dateConfidence) ? item.date : '';
    return {
      ...item,
      date: trustedDate,
      dateConfidence: trustedDate ? item.dateConfidence : 'none',
      status: trustedDate === targetDate ? 'confirmed_today' : (trustedDate ? 'old' : 'suspected_today'),
      detailChecked: false
    };
  }
}
