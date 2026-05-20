function timePart(value = '') {
  const match = String(value).match(/(\d{1,2}:\d{2})(?::\d{2})?/);
  return match ? match[1] : String(value || '时间待核');
}

function formatGenerated(value) {
  return value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '';
}

function topicLine(topics, name) {
  const found = topics.find(topic => topic.topic.includes(name));
  return found ? `${found.topic}（${found.count} 条，${found.sourceCount} 个来源）` : '';
}

function topDomesticText(leads, targetDate, compact = false) {
  return leads.slice(0, 5).map((lead, index) => {
    if (compact) {
      return `${index + 1}. [${timePart(lead.publishedAt || lead.date)}] ${lead.title}\n` +
        `   来源：${lead.source}\n` +
        `   链接：${lead.url}\n` +
        `   角度：${lead.angle}`;
    }
    return `${index + 1}. [${timePart(lead.publishedAt || lead.date)}] ${lead.title}\n` +
      `   ${lead.source}｜${lead.date || targetDate}｜${lead.url}\n` +
      `   报道角度：${lead.angle}`;
  }).join('\n\n');
}

function globalText(globalLeads, limit = 5) {
  return globalLeads.slice(0, limit).map((lead, index) => (
    `${index + 1}. ${lead.title}｜${lead.source}｜${lead.url}`
  )).join('\n');
}

function topicText(topics) {
  return `- AI 应用：${topicLine(topics, 'AI')}
- 芯片/半导体：${topicLine(topics, '半导体') || topicLine(topics, 'GPU')}
- 机器人/具身智能：${topicLine(topics, '机器人')}
- 新能源车/智能驾驶：${topicLine(topics, '新能源车')}
- 太空与低空经济：${topicLine(topics, '低空') || topicLine(topics, '航天')}
- 科学前沿：${topicLine(topics, '科学')}`;
}

function changeText(changeSummary = {}) {
  if (!changeSummary.hasPrevious) return '本次为 v2 首次生成，后续会标记新增与延续线索。';
  const totalNew = (changeSummary.domesticNew || 0) + (changeSummary.globalNew || 0);
  const totalContinued = (changeSummary.domesticContinued || 0) + (changeSummary.globalContinued || 0);
  const note = totalNew === 0
    ? '本次核心内容更新较少，适合重点核验政策口径、国际背景和旧议题是否有新进展。'
    : '本次有新增核心线索，优先核验新增项的一手来源和可视化素材。';
  return `新增核心线索：国内 ${changeSummary.domesticNew || 0} 条｜国际 ${changeSummary.globalNew || 0} 条
延续跟踪线索：国内 ${changeSummary.domesticContinued || 0} 条｜国际 ${changeSummary.globalContinued || 0} 条
${note}`;
}

function newItemsText(changeSummary = {}) {
  const rows = [
    ...(changeSummary.topNewDomestic || []).map(item => `- ${item.title}｜${item.source}｜${item.url}`),
    ...(changeSummary.topNewGlobal || []).map(item => `- ${item.title}｜${item.source}｜${item.url}`)
  ].slice(0, 6);
  return rows.length ? rows.join('\n') : '- 暂无新增核心线索。';
}

export function makeFeishuBriefing(leads, topics, targetDate, globalLeads = [], stats = {}, dashboardUrl = '') {
  const generated = formatGenerated(stats.generatedAt);
  const version = stats.radarVersion || 'v2';
  return `【ChenChen 今日 Briefing｜${version}】

生成时间：${generated}
网页链接：${dashboardUrl || 'PUBLIC_DASHBOARD_URL 未配置'}

本次更新：
${changeText(stats.changeSummary)}

最值得关注：
${topDomesticText(leads, targetDate, true) || '暂无高优先级科技新闻。'}

本次新增线索：
${newItemsText(stats.changeSummary)}

今日热点方向：
${topicText(topics)}

国际科技背景：
${globalText(globalLeads, 5) || '暂无国际科技背景。'}

发稿前核验提示：
官方来源、企业回应、数据口径、国际背景、可视化素材。`;
}

export function makeBriefing(leads, topics, failures, targetDate, globalLeads = [], stats = {}) {
  const generated = formatGenerated(stats.generatedAt);
  const version = stats.radarVersion || 'v2';
  const copyText = `ChenChen 今日中国科技热点｜${targetDate}｜${version}
生成时间：${generated}
抓取时间范围：00:00–当前时间
数据统计：抓取总数 ${stats.itemsSeen || 0}｜确认今日 ${stats.confirmedToday || leads.length}｜国际背景 ${globalLeads.length}

本次更新：
${changeText(stats.changeSummary)}

最值得关注：
${topDomesticText(leads, targetDate) || '暂无高优先级科技新闻。'}

本次新增线索：
${newItemsText(stats.changeSummary)}

今日热点方向：
${topicText(topics)}

需要核实：
官方来源、企业回应、数据口径、国际背景、可视化素材。

可采访方向：
政策研究者、企业工程师、行业分析师、真实用户、科研人员。

国际科技背景：
${globalText(globalLeads, 5) || '暂无国际科技背景。'}`;

  const htmlList = leads.slice(0, 5).map((lead, index) => `
    <article class="brief-item">
      <strong>${index + 1}. [${timePart(lead.publishedAt || lead.date)}] ${lead.title}</strong>
      <span>${lead.source}｜${lead.date || targetDate}｜<a href="${lead.url}" target="_blank" rel="noopener">原文链接</a></span>
      <p>报道角度：${lead.angle}</p>
    </article>
  `).join('');
  const globalHtml = globalLeads.slice(0, 5).map((lead, index) => `
    <article class="brief-item">
      <strong>${index + 1}. ${lead.title}</strong>
      <span>时间：${lead.publishedAt || lead.date || '待核'}｜来源：${lead.source}｜<a href="${lead.url}" target="_blank" rel="noopener">原文链接</a></span>
      <p>${lead.cgtAngle}</p>
    </article>
  `).join('');

  const displayHtml = `
    <div class="brief-display">
      <h3>ChenChen 今日中国科技热点 <small>${version}</small></h3>
      <p>日期：${targetDate}｜生成时间：${generated}｜抓取时间范围：00:00–当前时间</p>
      <p>数据统计：抓取总数 ${stats.itemsSeen || 0}｜确认今日 ${stats.confirmedToday || leads.length}｜国际背景 ${globalLeads.length}</p>
      <h4>本次更新</h4>
      <p>${changeText(stats.changeSummary).replace(/\n/g, '<br>')}</p>
      <h4>最值得关注</h4>
      ${htmlList || '<p>暂无高优先级科技新闻。</p>'}
      <h4>国际科技背景</h4>
      ${globalHtml || '<p>暂无国际科技背景。</p>'}
    </div>
  `;

  return { copyText, displayHtml };
}
