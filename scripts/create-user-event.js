#!/usr/bin/env node
/**
 * 在用户个人日历中创建日程
 */

import * as lark from "@larksuiteoapi/node-sdk";
import fs from "fs";

// 配置 - 从环境变量读取
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

async function createUserEvent(summary, startTime, endTime, description) {
  console.log("📅 创建日程到用户个人日历");
  console.log("=".repeat(60));
  console.log();

  // 读取用户令牌
  const tokenData = JSON.parse(fs.readFileSync("user-tokens.json", "utf8"));

  // 创建客户端
  const client = new lark.Client({
    appId: APP_ID,
    appSecret: APP_SECRET,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  // 获取用户的日历列表
  const calendarsRes = await client.calendar.calendar.list(
    {},
    lark.withUserAccessToken(tokenData.accessToken)
  );

  if (calendarsRes.code !== 0) {
    throw new Error(calendarsRes.msg);
  }

  const calendars = calendarsRes.data?.calendar_list || [];
  if (calendars.length === 0) {
    throw new Error("没有找到日历");
  }

  const calendarId = calendars[0].calendar_id;
  console.log("🗓️  使用日历:", calendars[0].summary);
  console.log();

  // 创建日程
  console.log("✨ 创建日程...");
  console.log("  标题:", summary);
  console.log("  开始时间:", startTime.toLocaleString("zh-CN"));
  console.log("  结束时间:", endTime.toLocaleString("zh-CN"));
  if (description) {
    console.log("  描述:", description);
  }
  console.log();

  const createRes = await client.calendar.calendarEvent.create(
    {
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
    },
    lark.withUserAccessToken(tokenData.accessToken)
  );

  if (createRes.code !== 0) {
    throw new Error(createRes.msg);
  }

  console.log("\n✅ 日程创建成功！");
  console.log("  日程标题:", createRes.data?.event?.summary);
  console.log("  日程链接:", createRes.data?.event?.app_link);
  console.log();

  return createRes.data?.event;
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log("用法:");
    console.log("  node create-user-event.js <标题> <开始时间> <结束时间> [描述]");
    console.log("");
    console.log("时间格式: YYYY-MM-DDTHH:mm:ss");
    console.log("");
    console.log("示例:");
    console.log("  node create-user-event.js \"会议\" \"2026-02-23T15:00:00\" \"2026-02-23T16:00:00\"");
    process.exit(1);
  }

  const summary = args[0];
  const startTimeStr = args[1];
  const endTimeStr = args[2];
  const description = args[3] || "";

  const startTime = new Date(startTimeStr);
  const endTime = new Date(endTimeStr);

  createUserEvent(summary, startTime, endTime, description).catch((err) => {
    console.error("❌ 出错:", err);
    process.exit(1);
  });
}

export { createUserEvent };
