#!/usr/bin/env node
/**
 * 飞书日程创建脚本 - 简化版
 * 直接创建日程
 */

import * as Lark from "@larksuiteoapi/node-sdk";

// 从环境变量读取凭证
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

// 创建飞书客户端
const client = new Lark.Client({
  appId: APP_ID,
  appSecret: APP_SECRET,
  appType: Lark.AppType.SelfBuild,
  domain: Lark.Domain.Feishu,
});

/**
 * 获取主日历 ID
 */
async function getPrimaryCalendarId() {
  const res = await client.calendar.calendar.list({});
  if (res.code !== 0) {
    throw new Error(res.msg);
  }

  const calendars = res.data?.calendar_list || [];

  // 先找主日历
  const primary = calendars.find((c) => c.type === "primary");
  if (primary) {
    return primary.calendar_id;
  }

  // 如果没有主日历，返回第一个
  if (calendars.length > 0) {
    return calendars[0].calendar_id;
  }

  throw new Error("没有找到日历");
}

/**
 * 创建日程
 */
async function createEvent(
  calendarId,
  summary,
  startTime,
  endTime,
  description
) {
  const res = await client.calendar.calendarEvent.create({
    path: { calendar_id: calendarId },
    data: {
      summary,
      description: description || "",
      start_time: {
        timestamp: Math.floor(startTime.getTime() / 1000),
        timezone: "Asia/Shanghai",
      },
      end_time: {
        timestamp: Math.floor(endTime.getTime() / 1000),
        timezone: "Asia/Shanghai",
      },
    },
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }

  return res.data?.event;
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log("用法:");
    console.log("  node create-event-simple.js <标题> <开始时间> <结束时间> [描述]");
    console.log("");
    console.log("时间格式: YYYY-MM-DDTHH:mm:ss");
    console.log("");
    console.log("示例:");
    console.log("  node create-event-simple.js \"会议\" \"2026-02-23T15:00:00\" \"2026-02-23T16:00:00\"");
    return;
  }

  const summary = args[0];
  const startTimeStr = args[1];
  const endTimeStr = args[2];
  const description = args[3] || "";

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  console.log("📅 创建日程:");
  console.log("  标题:", summary);
  console.log("  开始时间:", startTime.toLocaleString("zh-CN"));
  console.log("  结束时间:", endTime.toLocaleString("zh-CN"));
  if (description) {
    console.log("  描述:", description);
  }
  console.log();

  try {
    // 获取日历
    console.log("📆 获取日历...");
    const calendarId = await getPrimaryCalendarId();
    console.log("  日历 ID:", calendarId);
    console.log();

    // 创建日程
    console.log("✨ 创建日程...");
    const event = await createEvent(
      calendarId,
      summary,
      startTime,
      endTime,
      description
    );
    console.log("✅ 日程创建成功！");
    console.log("  日程 ID:", event.event_id);
    console.log("  日程链接:", event.app_link);
    console.log();
    console.log("🎉 完成！");
  } catch (err) {
    console.error("❌ 创建失败:", err);
  }
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getPrimaryCalendarId, createEvent };