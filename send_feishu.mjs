import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const latestJsonPath = path.join(__dirname, 'data', 'latest.json');
const briefingTxtPath = path.join(__dirname, 'output', 'briefing.txt');
const pushStatePath = path.join(__dirname, 'data', 'feishu-push-state.json');
const radarVersion = process.env.RADAR_VERSION || 'v2';

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

function getScheduleSlot(date, time) {
  const [hour, minute] = time.split(':').map(Number);
  const current = hour * 60 + minute;
  const slots = [
    { name: 'morning', label: '07:40', start: 7 * 60 + 25, end: 8 * 60 + 15 },
    { name: 'afternoon', label: '15:40', start: 15 * 60 + 25, end: 16 * 60 + 15 }
  ];
  const slot = slots.find((item) => current >= item.start && current <= item.end);
  if (!slot) return null;
  return {
    ...slot,
    key: `${radarVersion}-${date}-${slot.name}`
  };
}

function getScheduleSlotFromCron(date, cron) {
  const map = {
    '30 23 * * *': { name: 'morning', label: '07:40' },
    '45 23 * * *': { name: 'morning', label: '07:40' },
    '59 23 * * *': { name: 'morning', label: '07:40' },
    '30 7 * * *': { name: 'afternoon', label: '15:40' },
    '45 7 * * *': { name: 'afternoon', label: '15:40' },
    '59 7 * * *': { name: 'afternoon', label: '15:40' }
  };
  const slot = map[cron];
  if (!slot) return null;
  return {
    ...slot,
    key: `${radarVersion}-${date}-${slot.name}`
  };
}

async function readPushState() {
  try {
    return JSON.parse(await fs.readFile(pushStatePath, 'utf8'));
  } catch {
    return { sentSlots: {} };
  }
}

async function writePushState(state) {
  await fs.mkdir(path.dirname(pushStatePath), { recursive: true });
  await fs.writeFile(pushStatePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

async function main() {
  const webhook = process.env.FEISHU_WEBHOOK_URL;
  if (!webhook) {
    console.log('Feishu webhook missing, skip push.');
    return;
  }

  const dashboardUrl = process.env.PUBLIC_DASHBOARD_URL || 'PUBLIC_DASHBOARD_URL 未配置';
  const manual = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch' || process.env.FEISHU_TEST === '1';
  const scheduleCron = process.env.GITHUB_EVENT_SCHEDULE || '';
  const { date, time } = cnNowParts();
  const slot = getScheduleSlotFromCron(date, scheduleCron) || getScheduleSlot(date, time);

  if (!manual) {
    if (!slot) {
      console.log(`No Feishu schedule slot matched for ${date} ${time}; cron="${scheduleCron}", skip push.`);
      return;
    }
    const state = await readPushState();
    if (state.sentSlots?.[slot.key]) {
      console.log(`Feishu push already sent for ${slot.key}, skip duplicate.`);
      return;
    }
  }

  const title = manual
    ? `ChenChen 今日 Briefing｜${radarVersion} 手动测试｜${date} ${time}`
    : `ChenChen 今日 Briefing｜${radarVersion} ${slot?.label || ''}｜${date} ${time}`;
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
    if (!manual && slot) {
      const state = await readPushState();
      state.sentSlots = state.sentSlots || {};
      state.sentSlots[slot.key] = {
        sentAt: new Date().toISOString(),
        displayTime: `${date} ${time}`,
        scheduleSlot: slot.label,
        runId: process.env.GITHUB_RUN_ID || ''
      };
      await writePushState(state);
    }
  } catch (error) {
    console.error(`Feishu push error: ${error.message}`);
  }
}

main();
