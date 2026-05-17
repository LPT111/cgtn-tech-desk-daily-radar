import { angleFor } from './classifier.js';

const VIDEO_KEYWORDS = [
  'AI', '人工智能', '大模型', '机器人', '人形机器人', '具身智能', '芯片', '半导体',
  '新能源车', '自动驾驶', 'Robotaxi', '低空经济', '无人机', 'eVTOL', '商业航天',
  '火箭', '卫星', '脑机接口', '量子', '智能制造', '数字经济', '科技',
  'China technology', 'Chinese EV', 'China AI', 'humanoid robot'
];

const TOPIC_SEEDS = [
  ['China AI', 'AI'],
  ['humanoid robot China', '机器人'],
  ['Chinese EV smart driving', '新能源车'],
  ['China semiconductor GPU', '芯片'],
  ['China low altitude economy drone', '太空与低空'],
  ['China commercial space rocket satellite', '太空与低空'],
  ['AI agent large model China', 'AI'],
  ['robotaxi China autonomous driving', '新能源车'],
  ['quantum technology China', '科学前沿'],
  ['data center computing power China', '数字经济']
];

export function isVideoTech(title = '') {
  return VIDEO_KEYWORDS.some(keyword => title.toLowerCase().includes(String(keyword).toLowerCase()));
}

function materialFit(category) {
  if (['机器人', '新能源车', '太空与低空', '科学前沿'].includes(category)) return 'yes';
  if (['AI', '芯片', '数字经济'].includes(category)) return 'maybe';
  return 'no';
}

function videoAngle(category, platform) {
  const base = angleFor(category);
  return `${base} Use ${platform} clips only as trend signals; verify original source and rights before broadcast use.`;
}

export async function fetchVideoPlatform(source) {
  const items = TOPIC_SEEDS.map(([keyword, category], index) => {
    const q = source.platform === '抖音' ? encodeURIComponent(keyword.replace(/\s+/g, ' ')) : encodeURIComponent(keyword);
    const url = source.platform === 'YouTube'
      ? `${source.searchBase}${keyword.replace(/\s+/g, '+')}`
      : `${source.searchBase}${q}`;
    return {
      rank: index + 1,
      title: keyword,
      platform: source.platform,
      heat: '待人工核实',
      url,
      angle: videoAngle(category, source.platform),
      materialFit: materialFit(category),
      category,
      status: 'fallback_search'
    };
  });

  return {
    platform: source.platform,
    status: 'fallback',
    message: '该平台实时榜单暂未稳定抓到，建议人工点击核实',
    items
  };
}
