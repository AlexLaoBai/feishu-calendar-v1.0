#!/usr/bin/env node
/**
 * 删除测试日程
 */

import * as Lark from "@larksuiteoapi/node-sdk";

// 从环境变量或配置文件读取凭证
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

// 创建飞书客户端
const client = new Lark.Client({
  appId: APP_ID,
  appSecret: APP_SECRET,
  appType: Lark.AppType.SelfBuild,
  domain: Lark.Domain.Feishu,
});

async function deleteTestEvents() {
  console.log("🗑️ 删除测试日程...");
  console.log("---\n");

  try {
    // 1. 获取日历列表
    console.log("1️⃣ 获取日历列表...");
    const calendarsRes = await client.calendar.calendar.list({});
    if (calendarsRes.code !== 0) {
      console.error("❌ 获取日历列表失败:", calendarsRes.msg);
      return;
    }

    const calendars = calendarsRes.data?.calendar_list || [];
    const calendarId = calendars[0].calendar_id;

    // 2. 获取日程列表
    console.log("\n2️⃣ 获取日程列表...");
    const eventsRes = await client.calendar.calendarEvent.list({
      path: { calendar_id: calendarId },
    });

    if (eventsRes.code !== 0) {
      console.error("❌ 获取日程列表失败:", eventsRes.msg);
      return;
    }

    const events = eventsRes.data?.items || [];
    console.log(`找到 ${events.length} 个日程`);

    // 3. 删除测试日程
    const testEvents = events.filter(
      (e) =>
        e.summary?.includes("测试") ||
        e.summary?.includes("test") ||
        e.description?.includes("测试")
    );

    console.log(`\n找到 ${testEvents.length} 个测试日程`);

    for (const event of testEvents) {
      console.log(`\n删除日程: ${event.summary}`);
      try {
        const deleteRes = await client.calendar.calendarEvent.delete({
          path: { calendar_id: calendarId, event_id: event.event_id },
        });
        console.log("  删除响应:", JSON.stringify(deleteRes, null, 2));
        if (deleteRes.code === 0) {
          console.log("  ✅ 删除成功");
        } else {
          console.log("  ❌ 删除失败:", deleteRes.msg);
        }
      } catch (err) {
        console.log("  ❌ 删除出错:", err.message);
      }
    }

    console.log("\n✅ 完成！");
  } catch (err) {
    console.error("\n❌ 操作失败:", err);
  }
}

// 执行
deleteTestEvents();