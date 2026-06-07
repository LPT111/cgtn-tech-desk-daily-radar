# ChenChen CGTN Tech Desk Daily Radar V3

这是面向 ChenChen 的 CGTN 科技记者每日选题驾驶舱，不以最大化新闻数量为目标，而以内容质量、分类准确率和记者可用性为核心。

## V3 核心能力

- 标题、摘要、正文前 500 字和来源联合分类
- 国际科技背景白名单
- 游戏、购物、促销和消费导购直接过滤
- 国家科技战略、AI 治理、芯片、机器人、航天和重大科研优先
- Reporter Mode 默认开启，优先今日新增、一手来源、可采访、有画面和国际传播价值
- 动态 CGTN Angle，避免重复套话
- 页面展示分类校验率、国际白名单率和 Angle 重复率

## 更新与推送

- 北京时间 07:00：晨会前版
- 北京时间 14:00：午后选题会前版
- GitHub Actions 使用窗口 fallback，`send_feishu.mjs` 按 `v3-日期-时段` 去重
- `workflow_dispatch` 手动运行会立即发送飞书测试消息
- 手机备用手动入口：`manual-update.html`

## 本地更新

```bash
cd /Users/lpt/Codex/outputs/cgtn_tech_dashboard
CGTN_RADAR_DATE=$(date +%F) RADAR_VERSION=v3 node fetch_daily.mjs
```

生成：

```text
daily-data.js
data/latest.json
output/briefing.md
output/briefing.txt
```

## 内容引擎测试

```bash
node tests/content_engine.test.mjs
```

测试覆盖航空误判 AI、交友软件误判 AI、游戏预告和购物导购污染国际池、国际白名单、硬科技权重与 Angle 去重。

## 打开看板

直接打开：

```text
/Users/lpt/Codex/outputs/cgtn_tech_dashboard/index.html
```

自动抓取是选题雷达，不是最终稿件判断。发稿前仍需核实原文、官方口径、企业回应、数据时间和国际背景。
