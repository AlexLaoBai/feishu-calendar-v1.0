#!/usr/bin/env node
/**
 * 删除日程
 */

import * as lark from "@larksuiteoapi/node-sdk";
import fs from "fs";

// 配置 - 从环境变量读取
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

async function deleteEvent(eventId) {
  console.log("📅 删除飞书日历日程");
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

  // 获取日程详情
  console.log(`🔍 获取日程详情: ${eventId}`);
  
  const eventRes = await client.calendar.calendarEvent.get({
    path: { calendar_id: "primary", event_id: eventId }
  }, lark.withUserAccessToken(tokenData.accessToken));

  if (eventRes.code !== 0) {
    throw new Error(eventRes.msg);
  }

  const originalEvent = eventRes.data.event;
  console.log("要删除的日程:", originalEvent.summary);
  console.log();

  // 确认删除
  const confirm = prompt("⚠️  确认要删除这个日程吗？(y/N): ");
  if (!confirm.toLowerCase().startsWith("y")) {
    console.log("取消删除操作");
    return;
  }

  // 删除日程
  console.log("🗑️ 删除日程...");
  
  const deleteRes = await client.calendar.calendarEvent.delete({
    path: { calendar_id: "primary", event_id: eventId }
  }, lark.withUserAccessToken(tokenData.accessToken));

  if (deleteRes.code !== 0) {
    throw new Error(deleteRes.msg);
  }

  console.log("✅ 日程删除成功！");
  console.log();

  return true;
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log("用法:");
    console.log("  node delete-event.js <事件ID>");
    console.log("");
    console.log("示例:");
    console.log("  node delete-event.js \"event_123\"");
    process.exit(1);
  }

  const eventId = args[0];

  deleteEvent(eventId).catch((err) => {
    console.error("❌ 出错:", err);
    process.exit(1);
  });
}

export { deleteEvent };