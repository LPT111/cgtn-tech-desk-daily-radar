const SOURCE_POLICY_PATTERN = /(工信部|科技部|国家发展改革委|国家网信办|市场监管总局|国务院|新华社|人民网|白宫|OSTP|NIST|BIS|EU AI Office|European Commission|OECD)/i;
const PRIMARY_SOURCE_PATTERN = /(工信部|科技部|国家发展改革委|国家网信办|市场监管总局|国务院|中国科学院|新华社|人民网|OSTP|NIST|BIS|EU AI Office|European Commission|公司官网|研究院|大学|实验室)/i;

export const CATEGORY_PROFILES = {
  '监管与安全': {
    weight: 100,
    strong: ['国家科技战略', '科技政策', '人工智能治理', 'AI治理', 'AI安全', '算法治理', '出口管制', '技术管制', '数据安全', '网络安全', '隐私保护', '监管框架', 'AI Act', 'AI Office', 'NIST', 'BIS', 'OSTP'],
    weak: ['监管', '政策', '标准', '合规', '网信办', '工信部', '白宫', '制裁', '禁令', '治理', '中美科技', '科技合作'],
    negative: ['游戏规则', '行业标准杆', '服务标准', '航空安全']
  },
  AI: {
    weight: 95,
    strong: ['人工智能', '大语言模型', '大模型', '生成式AI', '生成式人工智能', 'AI Agent', '智能体', '多模态模型', '基础模型', '模型训练', '模型推理', 'AIGC', 'ChatGPT', 'OpenAI', 'Anthropic', 'DeepMind', 'DeepSeek', '通义千问', '文心一言'],
    weak: ['AI', '机器学习', '深度学习', '神经网络', '推理算力', 'AI应用', 'AI芯片', 'Kimi', '豆包', 'Sora'],
    negative: ['飞机', '航空', '航班', '交友', '相亲', '游戏', '电影', '购物', '音箱', '耳机', '键盘']
  },
  '芯片': {
    weight: 95,
    strong: ['半导体', '芯片制造', '先进制程', '晶圆', '光刻', '刻蚀机', '先进封装', 'HBM', 'EDA', 'GPU', 'CPU', 'NPU', '国产芯片'],
    weak: ['芯片', '算力芯片', '存储芯片', '英伟达', 'NVIDIA', 'AMD', 'Intel', 'TSMC', '台积电', '三星电子', 'Samsung', 'ASML', '中芯国际', '寒武纪', '昇腾'],
    negative: ['薯片', '芯片优惠', '手机导购']
  },
  '机器人': {
    weight: 90,
    strong: ['人形机器人', '具身智能', '工业机器人', '服务机器人', '机器人量产', '机器人产线', '机器人本体'],
    weak: ['机器人', '机械臂', '机器狗', '宇树', '智元', '优必选', '自动化产线', '灵巧手'],
    negative: ['聊天机器人客服', '游戏机器人']
  },
  '太空与低空': {
    weight: 90,
    strong: ['商业航天', '低空经济', '卫星互联网', '运载火箭', '可重复使用火箭', 'eVTOL', '星座组网', '深空探测'],
    weak: ['卫星', '火箭', '航天', '无人机', '通航', '发射任务', 'SpaceX', '星链'],
    negative: ['航空公司', '民航客机', '喷气式飞机订单', '机票']
  },
  '新能源车': {
    weight: 85,
    strong: ['新能源汽车', '智能驾驶', '自动驾驶', 'Robotaxi', '车路云', '动力电池', '固态电池', '智能网联汽车'],
    weak: ['电动车', '新能源车', '换电', '比亚迪', '宁德时代', '小米汽车', '蔚来', '小鹏', '理想汽车', '特斯拉', 'Tesla'],
    negative: ['汽车优惠', '购车折扣', '二手车']
  },
  '科学前沿': {
    weight: 85,
    strong: ['重大科研成果', '重大科学装置', '大科学装置', '量子计算', '量子通信', '脑机接口', '生命科学突破', '新材料突破', '实验装置', '基础研究'],
    weak: ['科研', '科学家', '论文', '研究团队', '中国科学院', 'Nature', 'Science', 'MIT Technology Review', 'WIRED Science', '量子', '脑科学', '生命科学', '材料科学'],
    negative: ['科学养生', '科学购物', '科幻电影']
  },
  '数字经济': {
    weight: 70,
    strong: ['数字经济', '数据要素', '数字基础设施', '算力中心', '云计算基础设施', '工业互联网', '平台经济治理'],
    weak: ['云计算', '数据中心', '跨境电商', '平台经济', '直播电商', '鸿蒙', 'HarmonyOS', '服务器', '云服务'],
    negative: ['购物推荐', '促销', '优惠券']
  },
  '交通与航空': {
    weight: 45,
    strong: ['航空运输', '航空公司', '民航', '飞机订单', '喷气式飞机', '机场运营'],
    weak: ['飞机', '航班', '客机', '航空业', '波音', '空客', 'IATA'],
    negative: []
  },
  '消费互联网': {
    weight: 40,
    strong: ['交友软件', '社交平台', '在线交友', '消费互联网', '内容平台'],
    weak: ['交友', '相亲', '短视频平台', '网红经济', '社交应用'],
    negative: ['人工智能治理', '大模型']
  },
  '游戏娱乐': {
    weight: 10,
    strong: ['游戏预告片', '新游预告', 'Halloween Game', 'gaming trailer', 'video game'],
    weak: ['游戏', '电竞', '电影', '票房', '娱乐'],
    negative: []
  },
  '其他': {
    weight: 0,
    strong: [],
    weak: [],
    negative: []
  }
};

export const CATEGORY_TERMS = Object.fromEntries(
  Object.entries(CATEGORY_PROFILES).map(([category, profile]) => [category, [...profile.strong, ...profile.weak]])
);

export const HARD_TECH_WEIGHTS = Object.fromEntries(
  Object.entries(CATEGORY_PROFILES).map(([category, profile]) => [category, profile.weight])
);

export const CGTN_KEYWORDS = [
  '人工智能', '大模型', 'AI治理', '芯片', '半导体', '人形机器人', '具身智能',
  '商业航天', '低空经济', '新能源车', '智能驾驶', '重大科研成果', '科技政策',
  '出口管制', '国际标准', '中美科技'
];

export const TOPIC_RULES = [
  ['国家科技战略与监管', ['国家科技战略', '科技政策', 'AI治理', 'AI安全', '出口管制', 'NIST', 'BIS', 'OSTP', 'AI Office']],
  ['AI 应用与智能体', ['AI Agent', '智能体', 'AI应用', '多模态模型', '大模型', 'OpenAI', 'DeepSeek', 'Anthropic']],
  ['国产 GPU / 算力基础设施', ['GPU', '推理算力', '昇腾', '数据中心', '算力中心', 'AI芯片']],
  ['半导体供应链', ['半导体', '芯片制造', '光刻', '晶圆', '先进封装', 'EDA', '刻蚀机', 'HBM']],
  ['人形机器人与具身智能', ['人形机器人', '具身智能', '工业机器人', '灵巧手', '宇树', '智元', '优必选']],
  ['新能源车与智能驾驶', ['新能源汽车', '智能驾驶', '自动驾驶', 'Robotaxi', '动力电池']],
  ['低空经济与无人机', ['低空经济', '无人机', 'eVTOL', '通航']],
  ['商业航天与卫星互联网', ['商业航天', '卫星互联网', '运载火箭', '星座组网', '深空探测']],
  ['数字基础设施与数据要素', ['数字经济', '数据要素', '工业互联网', '算力中心', '云计算基础设施']],
  ['科学前沿与科研设施', ['重大科研成果', '大科学装置', '量子计算', '脑机接口', '生命科学突破', '新材料突破']]
];

export const FORMAT_BY_CATEGORY = {
  '监管与安全': 'live',
  AI: 'package',
  '芯片': 'graphic',
  '机器人': 'video',
  '太空与低空': 'video',
  '新能源车': 'video',
  '科学前沿': 'package',
  '数字经济': 'graphic',
  '交通与航空': 'package',
  '消费互联网': 'graphic',
  '游戏娱乐': 'video',
  '其他': 'graphic'
};

export const ENGLISH_TERMS = {
  '监管与安全': 'technology policy, AI governance, safety and standards',
  AI: 'AI applications, foundation models, agents and governance',
  '芯片': 'semiconductors, advanced manufacturing and compute infrastructure',
  '机器人': 'robotics, embodied intelligence and smart manufacturing',
  '太空与低空': 'commercial space, low-altitude economy and satellite infrastructure',
  '新能源车': 'EVs, smart mobility, batteries and autonomous driving',
  '科学前沿': 'frontier science, research infrastructure and scientific discovery',
  '数字经济': 'digital infrastructure, data flows and the platform economy',
  '交通与航空': 'aviation, transport infrastructure and industrial trade',
  '消费互联网': 'consumer internet, platforms and changing user behavior',
  '游戏娱乐': 'gaming and digital entertainment',
  '其他': 'technology and industry'
};

const DIRECT_REJECT_PATTERNS = [
  /游戏预告|新游|gameplay|gaming trailer|Halloween Game|PS5|Xbox game|Nintendo|Steam sale/i,
  /电影预告|票房|明星|综艺|celebrity|movie trailer/i,
  /购物|促销|优惠券|折扣|秒杀|特价|购买指南|导购|best .* (buy|deal)|shopping|coupon|sale/i,
  /耳机推荐|键盘推荐|音箱推荐|手机推荐|手机壳|充电宝|蓝牙音箱|headphones?|keyboards?|speakers? you can buy/i,
  /Yahoo Gaming|Yahoo Shopping|gift guide|consumer recommendation/i,
  /旅游新国标|旅游景区.{0,16}(智慧化|运营管理|客流监测)/i,
  /Print as PDF|Expression of Interest Form|Commerce\.gov|Feature Stories|Mailing List|Legal notice|Was this page helpful/i,
  /Languages on our websites|Digital EU on Mastodon|About Directorate-General CONNECT|NIST Research Library|NIST Digital Archives|National Vulnerability Database/i,
  /^(nl Nederlands|sk slovenčina|pt português|bg български|fr français|de deutsch|es español|it italiano|pl polski)$/i,
  /俄乌|乌军|俄军|击落.*无人机|导弹袭击|军事设施|战场/i,
  /^Review:|product review|wearable.*coach|元起|售价.*元|笔记本.*发售|购买.*显卡/i
];

const MARKETING_PATTERNS = [
  /重磅来袭|震撼发布|限时|优惠|低至|首发价|抢购|必买|值得买|新品推荐/i,
  /sponsored|deal of the day|buy now|best price|shopping guide/i
];

const SOFT_NEWS_PATTERNS = [
  /网友直呼|播放量|高考.*作文|高考用车提醒|高考.*志愿助手|AI\s*志愿助手|诡异.*图片|买豪宅|谍照|内饰升级|OTA\s*升级|发布会亮相|有望亮相/i,
  /股价|盈利预期|募资|估值|IPO|上市倒计时|equity stake|valuation|real estate|S&P 500/i,
  /产品更新|版本更新|体验活动|实测|跑山|转发后|发售|元起|售价|一图看懂|图解|适配设备型号清单|设备型号清单|设备量占比|API\s*版本使用数量|C盘空间|可禁用.*删除|迷你主机产品|搭载\s*\d+GB\s*内存/i,
  /有生之年|恐怕无法见证|或许能创造艺术/i,
  /leaving .*board|board after|CEO .*visit|legacy at stake|startups right now|off your phone|IPO race|newsletter|The Download:/i
];

const GLOBAL_ENTITY_PATTERN = /(OpenAI|Anthropic|Google AI|DeepMind|Meta AI|Microsoft AI|NVIDIA|AMD|Intel|TSMC|Samsung|ASML|Tesla|SpaceX|Apple|Amazon|Microsoft|Google)/i;
const GLOBAL_POLICY_PATTERN = /(White House OSTP|OSTP|BIS|EU AI Office|NIST|AI Act|export controls?|semiconductor restrictions?|data governance|cybersecurity policy)/i;
const GLOBAL_SCIENCE_SOURCE_PATTERN = /(Nature|Science|MIT Technology Review|WIRED Science)/i;
const GLOBAL_SCIENCE_TOPIC_PATTERN = /(artificial intelligence|\bAI\b|quantum|semiconductor|chip|robot|space|satellite|biotech|genom|medical|neuroscience|brain|energy|battery|fusion|materials?|computing|climate tech)/i;
const HARD_TECH_POLICY_PATTERN = /(国家科技战略|科技政策|人工智能治理|AI治理|AI安全|算法治理|出口管制|技术管制|芯片.{0,10}(限制|政策|管制)|半导体.{0,10}(限制|政策|管制)|中美科技|科技合作|NIST|BIS|OSTP|EU AI Office|AI Office|AI Act)/i;
const DIGITAL_SAFETY_POLICY_PATTERN = /(数据安全|网络安全|隐私保护|平台治理|未成年人保护|网络欺凌|诱导打赏|深度合成|生成式人工智能.{0,10}(办法|规定|标准|治理))/i;

function normalizeText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsTerm(text, term) {
  const haystack = normalizeText(text);
  const needle = String(term).trim();
  if (!needle) return false;
  if (/^[a-z0-9.+-]{1,5}$/i.test(needle)) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}([^a-z0-9]|$)`, 'i').test(haystack);
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function countTerms(text, terms) {
  return terms.reduce((count, term) => count + (containsTerm(text, term) ? 1 : 0), 0);
}

function fieldText(item, field, limit) {
  return normalizeText(item?.[field] || '').slice(0, limit);
}

function evidenceText(item) {
  return {
    title: fieldText(item, 'title', 220),
    summary: fieldText(item, 'summary', 600),
    body: fieldText(item, 'rawText', 500),
    source: fieldText(item, 'source', 120)
  };
}

function explicitCategoryOverride(item) {
  const { title, summary, body } = evidenceText(item);
  const text = `${title} ${summary} ${body}`;
  if (/(航空运输|航空公司|民航|喷气式飞机|飞机订单|客机订单|IATA)/i.test(text)) return '交通与航空';
  if (/(交友软件|在线交友|相亲软件|做PPT找对象|dating app|matchmaking app)/i.test(text)) return '消费互联网';
  if (/(游戏预告|新游预告|Halloween Game|gaming trailer|video game trailer)/i.test(text)) return '游戏娱乐';
  if (/(机器人流量|机器网络请求|bot traffic|automated traffic)/i.test(text)) return 'AI';
  if (/(鸿蒙智行|智界\s*R7|Model\s*[3YXS]|汽车|SUV|轿车|电动车)/i.test(title) && /(智驾|HiCar|OTA|座舱|后视镜|车型|车顶|大屏|续航|电池|特斯拉|Tesla|smart)/i.test(text)) return '新能源车';
  return '';
}

export function classifyWithEvidence(item = {}) {
  const fields = evidenceText(item);
  const override = explicitCategoryOverride(item);
  const scores = {};
  const signals = {};

  for (const [category, profile] of Object.entries(CATEGORY_PROFILES)) {
    if (category === '其他') continue;
    const titleStrong = countTerms(fields.title, profile.strong);
    const titleWeak = countTerms(fields.title, profile.weak);
    const summaryStrong = countTerms(fields.summary, profile.strong);
    const summaryWeak = countTerms(fields.summary, profile.weak);
    const bodyStrong = countTerms(fields.body, profile.strong);
    const bodyWeak = countTerms(fields.body, profile.weak);
    const negatives = countTerms(`${fields.title} ${fields.summary} ${fields.body}`, profile.negative);
    const directSignals = titleStrong + titleWeak + summaryStrong + summaryWeak;
    let score = directSignals
      ? titleStrong * 8 + titleWeak * 4 + summaryStrong * 4 + summaryWeak * 2 + bodyStrong * 2 + bodyWeak - negatives * 7
      : 0;
    if (score > 0 && category === '监管与安全' && SOURCE_POLICY_PATTERN.test(fields.source)) score += 5;
    if (score > 0 && category === '科学前沿' && /(Nature|Science|中国科学院|科技日报|MIT Technology Review|WIRED Science)/i.test(fields.source)) score += 4;
    scores[category] = score;
    signals[category] = { titleStrong, titleWeak, summaryStrong, summaryWeak, bodyStrong, bodyWeak, negatives };
  }

  if (override) scores[override] = Math.max(scores[override] || 0, 30);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [category, bestScore] = ranked[0] || ['其他', 0];
  const secondScore = ranked[1]?.[1] || 0;
  const finalCategory = bestScore >= 4 ? category : '其他';
  const confidence = finalCategory === '其他'
    ? 0
    : Math.max(0.35, Math.min(0.99, 0.45 + bestScore / 55 + Math.max(0, bestScore - secondScore) / 40));

  return {
    category: finalCategory,
    confidence: Number(confidence.toFixed(2)),
    score: bestScore,
    secondScore,
    override: override || '',
    signals: signals[finalCategory] || {},
    evidenceFields: ['title', 'summary', 'rawText_first_500', 'source']
  };
}

export function titleCategory(title = '') {
  return classifyWithEvidence({ title }).category === '其他' ? '' : classifyWithEvidence({ title }).category;
}

export function classify(item) {
  return classifyWithEvidence(item).category;
}

export function matchedTopic(item) {
  const text = `${item.title || ''} ${item.summary || ''} ${String(item.rawText || '').slice(0, 500)}`;
  for (const [topic, terms] of TOPIC_RULES) {
    if (terms.some(term => containsTerm(text, term))) return topic;
  }
  const category = item.category || classify(item);
  return category === '其他' ? '待编辑判断' : `${category}动态`;
}

export function keywordString(category) {
  return ENGLISH_TERMS[category] || ENGLISH_TERMS.其他;
}

function stableHash(value = '') {
  let hash = 0;
  for (const char of String(value)) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

function focusFor(category, item = {}) {
  const text = `${item.title || ''} ${item.summary || ''}`;
  const rules = {
    AI: [
      [/治理|安全|监管|AI Act|NIST/i, 'governance, safety and public trust'],
      [/Agent|智能体|应用|落地/i, 'deployment evidence and productivity gains'],
      [/算力|训练|推理|数据中心/i, 'compute economics and infrastructure demand'],
      [/开源|模型发布|大模型/i, 'model capability, access and ecosystem effects']
    ],
    '芯片': [
      [/出口管制|限制|BIS|制裁/i, 'export controls and supply-chain resilience'],
      [/光刻|晶圆|制程|封装|HBM/i, 'manufacturing capability and bottlenecks'],
      [/GPU|AI芯片|算力/i, 'AI-compute demand and domestic alternatives']
    ],
    '机器人': [
      [/量产|订单|工厂|产线/i, 'production scale and real industrial adoption'],
      [/人形|具身|灵巧手/i, 'embodied intelligence beyond demonstration'],
      [/服务|医疗|养老/i, 'service deployment, safety and user value']
    ],
    '太空与低空': [
      [/火箭|发射|卫星|星座/i, 'mission capability and commercial sustainability'],
      [/低空|无人机|eVTOL/i, 'urban services, logistics, safety and regulation']
    ],
    '新能源车': [
      [/出海|海外|关税|欧洲/i, 'overseas markets and global competition'],
      [/电池|固态|充电|换电/i, 'battery innovation and infrastructure'],
      [/智驾|自动驾驶|Robotaxi/i, 'deployment safety, regulation and user adoption']
    ],
    '科学前沿': [
      [/装置|设施|实验室/i, 'research infrastructure and long-term innovation capacity'],
      [/量子|材料|生命|脑机/i, 'the scientific mechanism, evidence and translational boundary']
    ],
    '监管与安全': [
      [/中美|出口管制|BIS/i, 'technology competition, dialogue and supply-chain consequences'],
      [/AI治理|AI安全|算法/i, 'the balance between innovation, safety and accountability'],
      [/标准|NIST|AI Office/i, 'standards, implementation and international rule-setting']
    ],
    '数字经济': [
      [/数据要素|数据跨境/i, 'data flows, governance and value creation'],
      [/云|算力中心|基础设施/i, 'digital infrastructure and support for the real economy']
    ]
  };
  return (rules[category] || []).find(([pattern]) => pattern.test(text))?.[1] || ENGLISH_TERMS[category] || ENGLISH_TERMS.其他;
}

const ANGLE_TEMPLATES = {
  AI: [
    focus => `Lead with ${focus}; verify who is using the system, what measurable gains exist and where governance risks remain.`,
    focus => `Frame this as an AI deployment story about ${focus}, separating product claims from evidence of real-world adoption.`,
    focus => `Ask whether this changes China’s AI competitiveness through ${focus}, and identify users, costs, safeguards and export relevance.`,
    focus => `Turn the item into a reporting test of ${focus}: capability, implementation, economic value and regulatory consequences.`
  ],
  '芯片': [
    focus => `Place the development in the semiconductor value chain, focusing on ${focus}, production evidence and implications for global supply.`,
    focus => `Explain which chip bottleneck this addresses and assess ${focus}, customers, capacity and dependence on overseas equipment.`,
    focus => `Use ${focus} as the spine of the story, then compare China’s progress with global competitors and market demand.`,
    focus => `Report beyond the announcement: verify yield, scale, customers and how ${focus} affects industrial resilience.`
  ],
  '机器人': [
    focus => `Show whether the robot is moving from demo to deployment, using ${focus}, orders, operating scenarios and safety as evidence.`,
    focus => `Build the story around ${focus}; interview engineers and end users to test whether the technology solves a real production problem.`,
    focus => `Assess the robotics value chain through ${focus}, including components, cost, reliability and export potential.`,
    focus => `Prioritize strong visuals but anchor them in ${focus}, measurable performance and repeatable commercial use.`
  ],
  '太空与低空': [
    focus => `Link the story to ${focus}, then verify payload, mission economics, regulation, safety and practical service scenarios.`,
    focus => `Use ${focus} to explain how aerospace capability becomes a commercial or public-service application rather than a one-off event.`,
    focus => `Frame the item through ${focus}, China’s industrial ecosystem and the international market or standards context.`,
    focus => `Pair launch or flight visuals with evidence on ${focus}, customers, regulation and operational readiness.`
  ],
  '新能源车': [
    focus => `Focus on ${focus}, comparing technology claims with deliveries, safety data, user adoption and overseas market implications.`,
    focus => `Use ${focus} to connect the product news with China’s mobility supply chain, competition and international expansion.`,
    focus => `Report the industrial consequence of ${focus}: who gains, what scales and what regulatory or trade barriers remain.`,
    focus => `Move beyond launch coverage by testing ${focus}, cost, reliability and consumer value.`
  ],
  '科学前沿': [
    focus => `Explain the finding in plain language, clarify the evidence and uncertainty, and connect ${focus} to China’s wider innovation capacity.`,
    focus => `Turn the research into a human-readable science story about ${focus}, avoiding claims beyond the published evidence.`,
    focus => `Ask what is genuinely new, how it was tested and whether ${focus} creates a credible path toward application.`,
    focus => `Use researchers and facilities as reporting anchors, with ${focus}, peer context and limitations clearly stated.`
  ],
  '监管与安全': [
    focus => `Frame the policy through ${focus}, identifying what changes in practice for companies, researchers and international partners.`,
    focus => `Explain the rule, the implementation mechanism and the consequences for ${focus}, rather than repeating official language.`,
    focus => `Use ${focus} to compare Chinese and international governance choices and identify points of cooperation or friction.`,
    focus => `Build an accountability-focused policy story around ${focus}, timelines, enforcement and affected stakeholders.`
  ],
  '数字经济': [
    focus => `Connect the item to ${focus}, showing how digital infrastructure supports the real economy and where governance questions remain.`,
    focus => `Assess the practical value of ${focus}: users, data flows, productivity, market structure and regulatory trade-offs.`,
    focus => `Frame this as infrastructure rather than consumer hype, using ${focus}, adoption and measurable economic effects.`,
    focus => `Explain who benefits from ${focus}, what scales nationally and what barriers remain.`
  ],
  '交通与航空': [
    focus => `Treat this as an aviation and trade story about ${focus}, fleet planning, costs and regional market consequences.`,
    focus => `Focus on transport economics and industrial supply, not AI, and verify how ${focus} changes airline capacity or procurement.`
  ],
  '消费互联网': [
    focus => `Treat this as a consumer-internet behavior story about ${focus}, platform incentives and social impact, not as core AI news.`,
    focus => `Ask what the trend reveals about users, platforms and the digital economy, while keeping its priority below hard-tech developments.`
  ],
  '其他': [
    focus => `Clarify the technology relevance and reporting value before promotion, using ${focus} and primary-source verification.`
  ]
};

export function angleFor(category, item = {}, offset = 0) {
  const templates = ANGLE_TEMPLATES[category] || ANGLE_TEMPLATES.其他;
  const index = (stableHash(`${item.title || ''}|${item.source || ''}`) + offset) % templates.length;
  const base = templates[index](focusFor(category, item));
  const cue = normalizeText(item.title || '').slice(0, 72);
  return cue ? `${base} For this item, test the claim behind “${cue}” against primary-source evidence.` : base;
}

export function formatFor(category) {
  return FORMAT_BY_CATEGORY[category] || 'graphic';
}

export function hardTechWeight(categoryOrItem) {
  const item = typeof categoryOrItem === 'string' ? null : (categoryOrItem || {});
  const category = typeof categoryOrItem === 'string' ? categoryOrItem : (item.category || classify(item));
  const base = HARD_TECH_WEIGHTS[category] ?? 0;
  if (item && category === '监管与安全') {
    const text = `${item.title || ''} ${item.summary || ''}`;
    if (HARD_TECH_POLICY_PATTERN.test(text)) return base;
    if (DIGITAL_SAFETY_POLICY_PATTERN.test(text)) return 85;
    return 60;
  }
  if (item && isSoftNewsLike(item)) return Math.max(0, base - 30);
  return base;
}

export function isDirectReject(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''} ${item.source || ''} ${item.url || ''}`;
  return DIRECT_REJECT_PATTERNS.some(pattern => pattern.test(text));
}

export function isMarketingLike(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''}`;
  return MARKETING_PATTERNS.some(pattern => pattern.test(text));
}

export function isSoftNewsLike(item = {}) {
  const text = `${item.title || ''} ${item.summary || ''}`;
  return SOFT_NEWS_PATTERNS.some(pattern => pattern.test(text));
}

export function isGlobalWhitelistMatch(item = {}) {
  if (isDirectReject(item)) return false;
  const text = `${item.title || ''} ${item.summary || ''} ${String(item.rawText || '').slice(0, 500)}`;
  const source = `${item.source || ''} ${item.url || ''}`;
  const classification = classifyWithEvidence(item);
  if (classification.category === '游戏娱乐' || classification.category === '消费互联网' || classification.category === '交通与航空' || classification.category === '其他') return false;
  if (GLOBAL_POLICY_PATTERN.test(text) || GLOBAL_POLICY_PATTERN.test(source)) return true;
  if (GLOBAL_ENTITY_PATTERN.test(text)) return true;
  if (GLOBAL_SCIENCE_SOURCE_PATTERN.test(source) && classification.category === '科学前沿' && GLOBAL_SCIENCE_TOPIC_PATTERN.test(text)) return true;
  return false;
}

export function globalRelevanceScore(item = {}) {
  if (!isGlobalWhitelistMatch(item)) return 0;
  const text = `${item.title || ''} ${item.summary || ''}`;
  let score = 50;
  if (/(China|Chinese|Beijing|US-China|U\.S\.-China|中国|中美)/i.test(text)) score += 25;
  if (GLOBAL_POLICY_PATTERN.test(text)) score += 15;
  if (GLOBAL_ENTITY_PATTERN.test(text)) score += 10;
  if (GLOBAL_SCIENCE_SOURCE_PATTERN.test(`${item.source || ''} ${item.url || ''}`)) score += 10;
  return Math.min(100, score);
}

export function isPrimarySource(item = {}) {
  return PRIMARY_SOURCE_PATTERN.test(`${item.source || ''} ${item.url || ''}`);
}

export function hasCctnKeyword(item) {
  const text = `${item.title || ''} ${item.summary || ''}`;
  return CGTN_KEYWORDS.some(term => containsTerm(text, term));
}

export function isVisual(item) {
  return /(机器人|人形|卫星|火箭|无人机|eVTOL|飞行|发射|车展|工厂|产线|实验装置|大科学装置|发布会|robot|rocket|satellite|drone|factory)/i
    .test(`${item.title || ''} ${item.summary || ''}`);
}

export function hasInternationalValue(item) {
  return /(全球|国际|首个|出海|海外|中美|供应链|国际标准|世界|跨境|欧洲|美国|export|global|international|supply chain|China|Chinese)/i
    .test(`${item.title || ''} ${item.summary || ''}`);
}

export function hasInterviewValue(item = {}) {
  return /(发布|启动|建成|投产|量产|签署|政策|标准|试验|测试|研究团队|科学家|工程师|负责人|监管|订单|用户|示范|应用场景|launch|trial|policy|standard|researchers?|engineers?|regulator)/i
    .test(`${item.title || ''} ${item.summary || ''}`);
}

export function reporterSignals(item = {}) {
  const primary = isPrimarySource(item);
  const visual = isVisual(item);
  const international = hasInternationalValue(item);
  const interview = hasInterviewValue(item);
  const marketing = isMarketingLike(item);
  const softNews = isSoftNewsLike(item);
  const category = item.category || classify(item);
  const weight = hardTechWeight({ ...item, category });
  const score = weight
    + (item.status === 'confirmed_today' ? 15 : 0)
    + (primary ? 15 : 0)
    + (interview ? 10 : 0)
    + (visual ? 8 : 0)
    + (international ? 10 : 0)
    - (marketing ? 35 : 0)
    - (softNews ? 55 : 0)
    - (category === '消费互联网' ? 25 : 0)
    - (category === '游戏娱乐' ? 80 : 0);
  return {
    primary,
    visual,
    international,
    interview,
    marketing,
    softNews,
    hardTechWeight: weight,
    reporterScore: score
  };
}
