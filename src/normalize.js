export function stripTags(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanTitle(value = '') {
  return stripTags(value)
    .replace(/^[·•\-\s]+/, '')
    .replace(/\s+\d{1,2}:\d{2}(?::\d{2})?$/, '')
    .replace(/\.\.\.$/, '')
    .replace(/…$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titleKey(value = '') {
  return cleanTitle(value)
    .replace(/^(快讯|独家|重磅|视频|图集|观察)\|?/i, '')
    .replace(/(\d{1,2}:\d{2}|20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2}日?|\d{1,2}月\d{1,2}日)/g, '')
    .replace(/(官宣|重磅|突发|快讯|独家|最新|一图看懂|图解|视频|直击|实探|热议|刷屏|罕见|彻底刷新认知|打开新世界)/gi, '')
    .replace(/(新浪科技|网易科技|腾讯科技|快科技|IT之家|科技日报|新华社|人民网|央视新闻|中国日报|观察者网|财联社)/g, '')
    .replace(/[“”"‘’'《》：:，,。！？!?、\s·•\-|丨（）()【】\[\]]/g, '')
    .toLowerCase();
}

export function canonicalUrl(value = '') {
  try {
    const url = new URL(value);
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|spm|from|source|share|share_token|ref|rss|output)$/i.test(key)) url.searchParams.delete(key);
    }
    let path = url.pathname.replace(/\/index\.html?$/i, '/').replace(/\/+$/, '');
    url.pathname = path || '/';
    return url.href;
  } catch {
    return value || '';
  }
}

export function similarityTokens(value = '') {
  const key = titleKey(value)
    .replace(/[零一二三四五六七八九十百千万亿]/g, match => ({
      零: '0', 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6', 七: '7', 八: '8', 九: '9', 十: '10', 百: '100', 千: '1000', 万: '10000', 亿: '100000000'
    }[match] || match));
  const cnTokens = key.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  const enTokens = key.match(/[a-z0-9]{2,}/gi) || [];
  const compact = [...cnTokens, ...enTokens].join('');
  const grams = [];
  for (let i = 0; i < compact.length - 1; i += 1) grams.push(compact.slice(i, i + 2));
  return [...new Set([...cnTokens, ...enTokens.map(t => t.toLowerCase()), ...grams])];
}

export function absoluteUrl(url, base) {
  try {
    return new URL(url, base).href;
  } catch {
    return url || '';
  }
}

export function isBadTitle(title = '') {
  const text = cleanTitle(title).replace(/\s+/g, '');
  if (!text || text.length < 6 || text.length > 96) return true;
  if (/^(更多|首页|返回|上一页|下一页|上一篇|下一篇|视频|图片|专题|进入|点击|分享到|客户端|栏目|频道|登录|注册|广告服务)/.test(text)) return true;
  if (/^(PrintasPDF|ExpressionofInterestForm|Commerce\.gov|FeatureStories|MailingList|Legalnotice|Wasthispagehelpful\??|Languagesonourwebsites|DigitalEUonMastodon|AboutDirectorate-GeneralCONNECT|NISTResearchLibrary|NISTDigitalArchives|NationalVulnerabilityDatabase)$/i.test(text)) return true;
  if (/^(nlNederlands|skSlovenčina|ptPortuguês|bgБългарски|frFrançais|deDeutsch|esEspañol|itItaliano|plPolski)$/i.test(text)) return true;
  if (/更多(时政|网信|科技|要闻|新闻|推荐|精彩)/.test(text)) return true;
  if (/^(中国社会科学院|国家互联网信息办公室|市场监管总局|科技部|工业和信息化部|国家发展和改革委员会|中国科学院|科学网电子杂志)$/.test(text)) return true;
  if (/版权所有|联系我们|友情链接|ICP备|公网安备|责任编辑|来源[:：]|作者[:：]/.test(text)) return true;
  if (/^[\d\s\-/:：年月日]+$/.test(text)) return true;
  return false;
}

export function firstText(value = '', limit = 300) {
  return stripTags(value)
    .replace(/责任编辑[:：]\S+/g, ' ')
    .replace(/上一篇[:：].*$/g, ' ')
    .replace(/下一篇[:：].*$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

export function dateKeyFromDate(value, timeZone = 'Asia/Shanghai') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export function dateKeyFromText(value = '', targetDate = '') {
  const text = String(value);
  const ymd =
    text.match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/) ||
    text.match(/(20\d{2})(\d{2})(\d{2})/);
  if (ymd) {
    const [, year, month, day] = ymd;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  const md = text.match(/(\d{1,2})月(\d{1,2})日/);
  if (md && targetDate) {
    const [year] = targetDate.split('-');
    return `${year}-${String(md[1]).padStart(2, '0')}-${String(md[2]).padStart(2, '0')}`;
  }
  return '';
}

export function titleHasOtherDate(title, targetDate) {
  const date = dateKeyFromText(title, targetDate);
  return Boolean(date && date !== targetDate);
}
