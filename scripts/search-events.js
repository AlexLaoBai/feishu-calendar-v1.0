#!/usr/bin/env node
/**
 * 搜索日程
 */

import * as lark from "@larksuiteoapi/node-sdk";
import fs from "fs";
import dayjs from "dayjs";

// 配置 - 从环境变量读取
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

async function searchEvents(query = "", startDate = null, endDate = null) {
  console.log("🔍 搜索飞书日历日程");
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

  // 搜索日程
  console.log("🔍 搜索日程...");
  
  // 构建搜索条件
  const searchParams = {};
  
  if (query) {
    searchParams.query = query;
  }
  
  if (startDate) {
    searchParams.start_time = {
      timestamp: Math.floor(startDate.getTime() / 1000),
      timezone: "Asia/Shanghai"
    };
  }
  
  if (endDate) {
    searchParams.end_time = {
      timestamp: Math.floor(endDate.getTime() / 1000),
      timezone: "Asia/Shanghai"
    };
  }

  const eventsRes = await client.calendar.calendarEvent.list({
    path: { calendar_id: calendarId },
    query: {
      max_results: 50,
      time_min: startDate ? Math.floor(startDate.getTime() / 1000) : undefined,
      time_max: endDate ? Math.floor(endDate.getTime() / 1000) : undefined
    }
  }, lark.withUserAccessToken(tokenData.accessToken));

  if (eventsRes.code !== 0) {
    throw new Error(eventsRes.msg);
  }

  const events = eventsRes.data?.items || [];
  console.log(`📅 找到 ${events.length} 个日程`);
  console.log();

  // 筛选符合查询条件的日程
  const filteredEvents = events.filter(event => {
    // 标题或描述包含查询关键词
    const matchesQuery = query ? 
      event.summary?.includes(query) || 
      event.description?.includes(query) : true;
    
    return matchesQuery;
  });

  console.log(`🎯 筛选出 ${filteredEvents.length} 个符合条件的日程`);
  console.log();

  // 打印匹配的日程
  filteredEvents.forEach((event, index) => {
    const startTime = dayjs(event.start_time.timestamp * 1000);
    const endTime = dayjs(event.end_time.timestamp * 1000);
    
    console.log(`${index + 1}. ${event.summary}`);
    console.log(`   时间: ${startTime.format("YYYY-MM-DD HH:mm")} - ${endTime.format("HH:mm")}`);
    
    if (event.description) {
      console.log(`   描述: ${event.description.substring(0, 100)}${event.description.length > 100 ? "..." : ""}`);
    }
    
    console.log(`   状态: ${event.status}`);
    console.log();
  });

  return filteredEvents;
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  const query = args[0] || "";
  let startDate = null;
  let endDate = null;

  if (args[1]) {
    startDate = dayjs(args[1]).toDate();
  }
  
  if (args[2]) {
    endDate = dayjs(args[2]).toDate();
  }

  searchEvents(query, startDate, endDate).catch((err) => {
    console.error("❌ 出错:", err);
    process.exit(1);
  });
}

export { searchEvents };