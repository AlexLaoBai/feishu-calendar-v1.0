#!/usr/bin/env node
/**
 * 更新日程
 */

import * as lark from "@larksuiteoapi/node-sdk";
import fs from "fs";

// 配置 - 从环境变量读取
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

async function updateEvent(eventId, updates) {
  console.log("📅 更新飞书日历日程");
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
  console.log("原日程:", originalEvent.summary);
  console.log();

  // 构建更新数据
  const updateData = {
    summary: updates.summary || originalEvent.summary,
    description: updates.description || originalEvent.description,
    start_time: updates.startTime ? {
      timestamp: Math.floor(updates.startTime.getTime() / 1000),
      timezone: "Asia/Shanghai"
    } : originalEvent.start_time,
    end_time: updates.endTime ? {
      timestamp: Math.floor(updates.endTime.getTime() / 1000),
      timezone: "Asia/Shanghai"
    } : originalEvent.end_time
  };

  // 更新日程
  console.log("✨ 更新日程...");
  console.log("标题:", updateData.summary);
  if (updates.description) {
    console.log("描述:", updateData.description);
  }
  if (updates.startTime) {
    console.log("开始时间:", new Date(updateData.start_time.timestamp * 1000).toLocaleString());
  }
  if (updates.endTime) {
    console.log("结束时间:", new Date(updateData.end_time.timestamp * 1000).toLocaleString());
  }
  console.log();

  const updateRes = await client.calendar.calendarEvent.update({
    path: { calendar_id: "primary", event_id: eventId },
    data: updateData
  }, lark.withUserAccessToken(tokenData.accessToken));

  if (updateRes.code !== 0) {
    throw new Error(updateRes.msg);
  }

  console.log("✅ 日程更新成功！");
  console.log("新日程标题:", updateRes.data.event.summary);
  
  if (updateRes.data.event.app_link) {
    console.log("日程链接:", updateRes.data.event.app_link);
  }
  console.log();

  return updateRes.data.event;
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log("用法:");
    console.log("  node update-event.js <事件ID> --summary <标题> --description <描述> --startTime <开始时间> --endTime <结束时间>");
    console.log("");
    console.log("时间格式: YYYY-MM-DDTHH:mm:ss");
    console.log("");
    console.log("示例:");
    console.log("  node update-event.js \"event_123\" --summary \"新会议\" --startTime \"2026-02-23T16:00:00\"");
    process.exit(1);
  }

  const eventId = args[0];
  const updates = {};

  // 解析命令行参数
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];
      
      if (key === "startTime" || key === "endTime") {
        updates[key] = new Date(value);
      } else {
        updates[key] = value;
      }
      
      i++;
    }
  }

  updateEvent(eventId, updates).catch((err) => {
    console.error("❌ 出错:", err);
    process.exit(1);
  });
}

export { updateEvent };