# ChenChen CGTN Tech Desk Daily Radar

这是给 ChenChen 使用的 CGTN 科技记者每日热点看板。

## 打开看板

直接打开：

```text
/Users/lpt/Codex/outputs/cgtn_tech_dashboard/index.html
```

## v2 定时更新与飞书推送

v2 改为每天两更，减少内容变化不大时的重复推送：

- 北京时间 07:40：晨间选题会前版
- 北京时间 15:40：下午更新版
- 手机备用手动入口：`manual-update.html`

GitHub Actions 使用窗口 fallback 触发，`send_feishu.mjs` 会按 `v2-日期-时段` 去重，避免同一时段重复推送。手动运行 `workflow_dispatch` 会立即发送一条飞书测试消息。

v2 还新增了 Policy Radar：中美 AI、AI 治理、出口管制、标准、监管、数据安全等主题会被单独加权，并在页面中独立展示。

## 本地更新自动早报

在终端运行：

```bash
cd /Users/lpt/Codex/outputs/cgtn_tech_dashboard
CGTN_RADAR_DATE=$(date +%F) RADAR_VERSION=v2 node fetch_daily.mjs
```

脚本会抓取 RSS / 官网页面，生成：

```text
daily-data.js
data/latest.json
output/briefing.md
output/briefing.txt
```

重新打开或刷新 `index.html` 后，页面会自动读取最新数据。也可以点顶部的 `⇣` 按钮，把自动抓取数据覆盖到当前看板。

## 调整信息源

主要编辑：

```text
src/sources.js
```

支持两种类型：

- `rss`：RSS / Atom 源
- `html`：普通官网页面，脚本会提取链接标题并按科技关键词筛选

## 备注

自动抓取是选题雷达，不是最终稿件判断。发稿前仍建议核实原文、官方口径、企业回应、数据时间和国际背景。
