#!/usr/bin/env node
/**
 * 检查日程列表
 */

import * as Lark from "@larksuiteoapi/node-sdk";

// 从环境变量或配置文件读取凭证
const APP_ID = process.env.FEISHU_APP_ID || "cli_a9135c98af38dcda";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "CC5y5TVuVwkp0tENFcn5gdPBv37Ya6ic";

// 创建飞书客户端
const client = new Lark.Client({
  appId: APP_ID,
  appSecret: APP_SECRET,
  appType: Lark.AppType.SelfBuild,
  domain: Lark.Domain.Feishu,
});

async function checkEvents() {
  console.log("🔍 检查飞书日历...");
  console.log("---\n");

  try {
    // 1. 获取日历列表
    console.log("1️⃣ 获取日历列表...");
    const calendarsRes = await client.calendar.calendar.list({});
    console.log("响应:", JSON.stringify(calendarsRes, null, 2));
    console.log();

    if (calendarsRes.code !== 0) {
      console.error("❌ 获取日历列表失败:", calendarsRes.msg);
      return;
    }

    const calendars = calendarsRes.data?.calendar_list || [];
    console.log(`找到 ${calendars.length} 个日历`);

    if (calendars.length === 0) {
      console.log("没有找到日历");
      return;
    }

    // 打印所有日历
    calendars.forEach((cal, index) => {
      console.log(`\n日历 ${index + 1}:`);
      console.log("  ID:", cal.calendar_id);
      console.log("  名称:", cal.summary);
      console.log("  类型:", cal.type);
      console.log("  权限:", cal.permissions);
    });

    // 2. 获取主日历的日程列表
    const primaryCalendar = calendars.find((c) => c.type === "primary") || calendars[0];
    const calendarId = primaryCalendar.calendar_id;

    console.log(`\n\n2️⃣ 获取日程列表 (日历: ${primaryCalendar.summary})...`);
    const eventsRes = await client.calendar.calendarEvent.list({
      path: { calendar_id: calendarId },
    });
    console.log("响应:", JSON.stringify(eventsRes, null, 2));
    console.log();

    if (eventsRes.code !== 0) {
      console.error("❌ 获取日程列表失败:", eventsRes.msg);
      return;
    }

    const events = eventsRes.data?.items || [];
    console.log(`找到 ${events.length} 个日程`);

    if (events.length > 0) {
      console.log("\n日程列表:");
      events.forEach((event, index) => {
        console.log(`\n${index + 1}. ${event.summary}`);
        console.log("   ID:", event.event_id);
        console.log("   开始:", event.start_time?.timestamp);
        console.log("   结束:", event.end_time?.timestamp);
        console.log("   状态:", event.status);
      });
    }

    console.log("\n✅ 检查完成！");
  } catch (err) {
    console.error("\n❌ 检查失败:", err);
  }
}

// 执行检查
checkEvents();