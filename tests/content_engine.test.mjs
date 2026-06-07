import assert from 'node:assert/strict';
import {
  angleFor,
  classifyWithEvidence,
  hardTechWeight,
  isDirectReject,
  isGlobalWhitelistMatch
} from '../src/classifier.js';
import { dedupeAndCluster } from '../src/dedupe.js';

const aviation = {
  title: '国际航空运输协会副总裁：因伊朗战争推迟喷气式飞机订单将使中东航空公司付出高昂代价',
  summary: 'Airlines may delay aircraft orders as regional uncertainty raises costs.',
  source: 'Reuters Technology'
};
assert.equal(classifyWithEvidence(aviation).category, '交通与航空');

const dating = {
  title: '交友软件滑不动了 都市男女开始做PPT找对象',
  summary: '年轻用户改变在线交友方式。',
  source: '新浪科技'
};
assert.equal(classifyWithEvidence(dating).category, '消费互联网');

const game = {
  title: 'Halloween Game trailer arrives with new characters',
  source: 'Yahoo Gaming'
};
assert.equal(classifyWithEvidence(game).category, '游戏娱乐');
assert.equal(isDirectReject(game), true);
assert.equal(isGlobalWhitelistMatch(game), false);

const shopping = {
  title: '8 Of The Best AirPlay Speakers You Can Buy',
  source: 'Yahoo News Technology',
  url: 'https://www.yahoo.com/shopping/best-speakers'
};
assert.equal(isDirectReject(shopping), true);
assert.equal(isGlobalWhitelistMatch(shopping), false);
assert.equal(isDirectReject({
  title: '旅游新国标首次明确界定智慧化运营：实时客流监测',
  source: 'IT之家'
}), true);

const policy = {
  title: 'BIS updates semiconductor export controls affecting advanced AI chips',
  summary: 'The rules change licensing requirements for exports to China.',
  source: 'US BIS',
  url: 'https://bis.gov/policy'
};
assert.equal(classifyWithEvidence(policy).category, '监管与安全');
assert.equal(isGlobalWhitelistMatch(policy), true);

const chip = {
  title: 'TSMC expands advanced packaging capacity for AI accelerators',
  summary: 'The investment targets HBM integration and higher production capacity.',
  source: 'Reuters Technology'
};
assert.equal(classifyWithEvidence(chip).category, '芯片');
assert.equal(isGlobalWhitelistMatch(chip), true);

assert.equal(hardTechWeight('监管与安全'), 100);
assert.equal(hardTechWeight('AI'), 95);
assert.equal(hardTechWeight('芯片'), 95);
assert.equal(hardTechWeight('机器人'), 90);
assert.equal(hardTechWeight('游戏娱乐'), 10);
assert.equal(hardTechWeight({
  title: '旅游新国标明确智慧化运营要求',
  summary: '旅游景区客流管理规范。',
  category: '监管与安全'
}), 60);
assert.equal(hardTechWeight({
  title: 'BIS updates AI chip export controls',
  category: '监管与安全'
}), 100);
assert.equal(hardTechWeight({
  title: '平台发布未成年人保护新规',
  summary: '重点治理网络欺凌与诱导打赏。',
  category: '监管与安全'
}), 85);
assert.equal(hardTechWeight({
  title: '一图看懂全球半导体设备核心技术',
  category: '芯片'
}), 65);
assert.equal(hardTechWeight({
  title: 'HarmonyOS API 设备量占比最新数据公布',
  category: '数字经济'
}), 40);
assert.equal(hardTechWeight({
  title: 'C盘空间多出来4GB：Chrome本地AI大模型可禁用、删除',
  category: 'AI'
}), 65);
assert.equal(hardTechWeight({
  title: '锐龙 AI Max 迷你主机产品搭载 192GB 内存',
  category: 'AI'
}), 65);
assert.equal(hardTechWeight({
  title: '高考今日开考，平台上线 AI 志愿助手',
  category: 'AI'
}), 65);

const botTraffic = {
  title: '机器人流量首次超过人类网络请求',
  summary: 'Automated traffic and AI agents are reshaping internet activity.'
};
assert.equal(classifyWithEvidence(botTraffic).category, 'AI');

assert.equal(isDirectReject({
  title: 'Print as PDF',
  source: 'EU AI Office'
}), true);

const angleItems = [
  { title: 'China launches an AI agent for industrial design', source: '科技日报' },
  { title: 'A multimodal model enters hospital workflows', source: '新华社' },
  { title: 'New AI governance standard opens for comment', source: '工信部' },
  { title: 'Open-source model cuts inference cost', source: 'IT之家' },
  { title: 'AI assistant deployed in public services', source: '人民网' }
];
const angles = angleItems.map(item => angleFor('AI', item));
assert.equal(new Set(angles).size, angles.length);

const computeCenterDuplicates = dedupeAndCluster([
  {
    title: '全球首个，正式发布！词元用电成本下降30%',
    summary: '全球首个算力中心高压交直流预制舱供电站“算电岛”在青岛发布。',
    source: '科技日报',
    sourceTier: 'mainstream',
    url: 'https://example.com/a'
  },
  {
    title: '全球首个预制算力中心底座投用 Token用电成本大降30%',
    summary: '全球首个预制算力中心底座在山东青岛正式启用。',
    source: '央视新闻',
    sourceTier: 'official',
    url: 'https://example.com/b'
  }
]);
assert.equal(computeCenterDuplicates.items.length, 1);
assert.equal(computeCenterDuplicates.items[0].sources.length, 2);

console.log('content engine tests passed');
