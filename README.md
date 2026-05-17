# ChenChen CGTN Tech Desk Daily Radar

这是给 ChenChen 使用的 CGTN 科技记者每日热点看板。

## 打开看板

直接打开：

```text
/Users/lpt/Codex/outputs/cgtn_tech_dashboard/index.html
```

## 每天更新自动早报

在终端运行：

```bash
cd /Users/lpt/Codex
node outputs/cgtn_tech_dashboard/fetch_daily.mjs
```

脚本会读取 `sources.json`，抓取 RSS / 官网页面，生成：

```text
outputs/cgtn_tech_dashboard/daily-data.js
```

重新打开或刷新 `index.html` 后，页面会自动读取最新数据。也可以点顶部的 `⇣` 按钮，把自动抓取数据覆盖到当前看板。

## 调整信息源

编辑：

```text
outputs/cgtn_tech_dashboard/sources.json
```

支持两种类型：

- `rss`：RSS / Atom 源
- `html`：普通官网页面，脚本会提取链接标题并按科技关键词筛选

## 备注

自动抓取是选题雷达，不是最终稿件判断。发稿前仍建议核实原文、官方口径、企业回应、数据时间和国际背景。
