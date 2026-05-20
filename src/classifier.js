export const CATEGORY_TERMS = {
  AI: ['AI', '人工智能', '大模型', 'AIGC', 'Agent', '智能体', '多模态', '算力', '模型', '生成式', 'ChatGPT', 'OpenAI', 'DeepSeek', '通义', '文心', 'Kimi', '豆包', 'Sora', 'GEO'],
  芯片: ['芯片', '半导体', 'GPU', 'CPU', '存储', '光刻', '晶圆', '先进制程', '封装', 'EDA', '国产替代', 'HBM', '寒武纪', '中芯国际', '华为昇腾', '英伟达', '英特尔', '刻蚀机'],
  机器人: ['机器人', '人形机器人', '具身智能', '机械臂', '自动化', '宇树', '智元', '优必选', '工业机器人', '机器狗'],
  新能源车: ['新能源车', '新能源汽车', '电动车', '智能驾驶', '自动驾驶', 'Robotaxi', '车路云', '动力电池', '比亚迪', '宁德时代', '小米汽车', '蔚来', '小鹏', '理想汽车', '特斯拉'],
  数字经济: ['平台经济', '直播电商', '跨境电商', '云计算', '数据中心', '数字基础设施', '数据要素', '算力中心', '鸿蒙', 'HarmonyOS', '服务器', '云服务'],
  太空与低空: ['卫星', '火箭', '商业航天', '低空经济', '无人机', 'eVTOL', '通航', '卫星互联网', '星座', '光计算卫星', '运载火箭', '神舟'],
  科学前沿: ['科研', '论文', '实验装置', '科学家', '材料', '生命科学', '脑科学', '量子', '基础研究', '大科学装置', '中科院', '科学实验', '国际标准', '岩溶'],
  监管与安全: ['监管', '网信办', '工信部', '数据安全', '算法治理', '隐私', '合规', '标准', '政策', '市场监管', '个人信息', '网络安全', '人工智能治理', 'AI治理', 'AI安全', '安全治理', '出口管制', '技术管制', '制裁', '禁令', '白宫', 'NIST', 'AI Office', '欧盟AI法案', '中美', '合作', '对话', '联合声明', '政策文件']
};

export const CGTN_KEYWORDS = ['AI', '芯片', '机器人', '低空经济', '商业航天', '新能源车', '数字经济', '科技政策', '半导体', '人形机器人', '出海', '国际标准', '中美AI', 'AI治理', '出口管制', 'AI安全', '人工智能合作'];

export const TOPIC_RULES = [
  ['AI 应用与智能体', ['Agent', '智能体', '应用', 'AI应用', '多模态', '大模型', 'GEO', 'OpenAI', 'DeepSeek', '豆包', 'Kimi']],
  ['国产 GPU / 算力基础设施', ['GPU', '算力', '昇腾', '摩尔线程', '数据中心', '服务器', 'Token']],
  ['半导体供应链', ['芯片', '半导体', '光刻', '晶圆', '封装', 'EDA', '刻蚀机', 'HBM']],
  ['人形机器人与具身智能', ['人形机器人', '具身智能', '机器人', '机械臂', '宇树', '智元', '优必选']],
  ['新能源车与智能驾驶', ['新能源车', '智能驾驶', '自动驾驶', 'Robotaxi', '比亚迪', '理想汽车', '小鹏', '蔚来', '动力电池']],
  ['低空经济与无人机', ['低空经济', '无人机', 'eVTOL', '通航']],
  ['商业航天与卫星互联网', ['卫星', '火箭', '商业航天', '星座', '卫星互联网', '光计算卫星', '运载火箭']],
  ['数字基础设施与平台经济', ['数字经济', '平台经济', '云计算', '数据中心', '跨境电商', '数据要素', '鸿蒙']],
  ['中美 AI 与科技政策', ['中美', 'AI合作', '人工智能合作', 'AI安全', 'AI治理', '出口管制', '白宫', 'NIST', 'BIS', '欧盟AI法案', 'AI Office', '对话机制']],
  ['科技监管与数据安全', ['监管', '网信办', '数据安全', '隐私', '算法治理', '合规', '市场监管', '政策文件', '标准', '出口管制']],
  ['科学前沿与科研设施', ['科研', '论文', '实验装置', '科学家', '材料', '生命科学', '量子', '大科学装置', '国际标准']]
];

export const FORMAT_BY_CATEGORY = {
  AI: 'package',
  芯片: 'graphic',
  机器人: 'video',
  新能源车: 'video',
  数字经济: 'graphic',
  太空与低空: 'video',
  科学前沿: 'package',
  监管与安全: 'live'
};

export const ENGLISH_TERMS = {
  AI: 'AI applications, large language models, AI governance, productivity',
  芯片: 'semiconductors, advanced packaging, supply-chain resilience',
  机器人: 'robotics, automation, smart manufacturing, embodied AI',
  新能源车: 'EVs, smart mobility, battery technology, globalization',
  数字经济: 'digital economy, data infrastructure, cloud computing',
  太空与低空: 'low-altitude economy, commercial space, satellite internet',
  科学前沿: 'scientific research, frontier science, research infrastructure',
  监管与安全: 'data security, privacy protection, regulatory framework'
};

export const ANGLES = {
  AI: 'Frame it around how China is moving AI from model capability into real-world productivity, governance and public-service scenarios.',
  芯片: 'Explain how the development fits into China’s semiconductor supply chain, industrial resilience and global technology competition.',
  机器人: 'Show whether robotics is entering real production and service settings, not just product launches or demos.',
  新能源车: 'Focus on smart mobility, battery innovation, industrial competition and overseas market implications.',
  数字经济: 'Connect the item to digital infrastructure, data flows, platform economy and how technology supports the real economy.',
  太空与低空: 'Link aerospace and low-altitude applications to logistics, urban services, safety, industry policy and commercial use cases.',
  科学前沿: 'Explain the scientific finding or research infrastructure in plain language, then connect it to wider innovation capacity.',
  监管与安全: 'Frame it around the balance between innovation, safety, privacy, compliance and public trust.'
};

function includesAny(text, terms) {
  const lowered = text.toLowerCase();
  return terms.some(term => lowered.includes(String(term).toLowerCase()));
}

export function titleCategory(title = '') {
  const titleText = String(title);
  if (/岩溶|生命科学|化学|物理|实验|院士|科研|科学|大科学装置|材料|国际标准/.test(titleText)) return '科学前沿';
  if (/中美|AI治理|人工智能治理|AI安全|出口管制|技术管制|数据安全|算法|监管|政策|标准|合规|白宫|NIST|欧盟AI法案|AI Office/.test(titleText)) return '监管与安全';
  if (/萝卜快跑|中国车|车企|汽车|换电|增程/.test(titleText)) return '新能源车';
  for (const category of ['太空与低空', '新能源车', '芯片', '机器人', 'AI', '数字经济', '科学前沿', '监管与安全']) {
    if (includesAny(titleText, CATEGORY_TERMS[category])) return category;
  }
  if (/蔚来|理想|小鹏|比亚迪|换电|增程|车企|汽车/.test(titleText)) return '新能源车';
  if (/火箭|卫星|SpaceX|发射|航天/.test(titleText)) return '太空与低空';
  if (/药企|生物医药|生命科学|化学|物理|实验|院士/.test(titleText)) return '科学前沿';
  return '';
}

export function classify(item) {
  const text = `${item.title} ${item.summary || ''} ${item.rawText || ''}`;
  const fromTitle = titleCategory(item.title);
  if (fromTitle) return fromTitle;
  let best = { category: '数字经济', hits: 0 };
  for (const [category, terms] of Object.entries(CATEGORY_TERMS)) {
    const hits = terms.reduce((sum, term) => sum + (includesAny(text, [term]) ? 1 : 0), 0);
    if (hits > best.hits) best = { category, hits };
  }
  return best.category;
}

export function matchedTopic(item) {
  const text = `${item.title} ${item.summary || ''} ${item.rawText || ''}`;
  for (const [topic, terms] of TOPIC_RULES) {
    if (includesAny(text, terms)) return topic;
  }
  return `${item.category || classify(item)}动态`;
}

export function keywordString(category) {
  return ENGLISH_TERMS[category] || ENGLISH_TERMS.数字经济;
}

export function angleFor(category) {
  return ANGLES[category] || ANGLES.数字经济;
}

export function formatFor(category) {
  return FORMAT_BY_CATEGORY[category] || 'graphic';
}

export function hasCctnKeyword(item) {
  return includesAny(`${item.title} ${item.summary || ''}`, CGTN_KEYWORDS);
}

export function isVisual(item) {
  return includesAny(`${item.title} ${item.summary || ''}`, ['机器人', '卫星', '火箭', '无人机', '车展', '工厂', '实验装置', '发布会', 'eVTOL', '飞行', '发射']);
}

export function hasInternationalValue(item) {
  return includesAny(`${item.title} ${item.summary || ''}`, ['全球', '国际', '首个', '出海', '海外', '中美', '供应链', '标准', '世界', '跨境', '拉美', '欧洲']);
}
