import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const latestJsonPath = path.join(__dirname, 'data', 'latest.json');
const briefingTxtPath = path.join(__dirname, 'output', 'briefing.txt');

function cnNowParts() {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
  return { date, time };
}

async function readBriefing() {
  try {
    const data = JSON.parse(await fs.readFile(latestJsonPath, 'utf8'));
    if (data.feishuBriefingText) return data.feishuBriefingText;
  } catch {
    // Fall back to the generated text file below.
  }
  return fs.readFile(briefingTxtPath, 'utf8');
}

async function main() {
  const webhook = process.env.FEISHU_WEBHOOK_URL;
  if (!webhook) {
    console.log('Feishu webhook missing, skip push.');
    return;
  }

  const dashboardUrl = process.env.PUBLIC_DASHBOARD_URL || 'PUBLIC_DASHBOARD_URL 未配置';
  const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' || process.env.FEISHU_TEST === '1';
  const { date, time } = cnNowParts();
  const title = manual
    ? `ChenChen 今日 Briefing｜手动测试｜${date} ${time}`
    : `ChenChen 今日 Briefing｜${date} ${time}`;
  const briefing = (await readBriefing()).replace(/PUBLIC_DASHBOARD_URL 未配置/g, dashboardUrl).trim();
  const text = `${title}\n\n${briefing}`;

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: { text }
      })
    });
    const body = await response.text();
    if (!response.ok) {
      console.error(`Feishu push failed: ${response.status} ${response.statusText}`);
      console.error(body);
      return;
    }
    console.log(`Feishu push success: ${response.status}`);
    console.log(body);
  } catch (error) {
    console.error(`Feishu push error: ${error.message}`);
  }
}

main();
