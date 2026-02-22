#!/usr/bin/env node
/**
 * 测试在用户个人日历中创建日程
 */

import * as lark from "@larksuiteoapi/node-sdk";
import fs from "fs";

// 配置 - 从环境变量读取
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

async function main() {
  console.log("📅 测试在用户个人日历中创建日程");
  console.log("=".repeat(60));
  console.log();

  // 读取用户令牌
  console.log("📖 读取用户令牌...");
  const tokenData = JSON.parse(fs.readFileSync("user-tokens.json", "utf8"));
  console.log("  Access Token:", tokenData.accessToken.substring(0, 50) + "...");
  console.log("  Scope:", tokenData.scope);
  console.log();

  // 创建客户端
  const client = new lark.Client({
    appId: APP_ID,
    appSecret: APP_SECRET,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  // 获取用户的日历列表
  console.log("📆 获取用户日历列表...");
  const calendarsRes = await client.calendar.calendar.list(
    {},
    lark.withUserAccessToken(tokenData.accessToken)
  );

  if (calendarsRes.code !== 0) {
    console.error("❌ 获取日历失败:", calendarsRes.msg);
    return;
  }

  const calendars = calendarsRes.data?.calendar_list || [];
  console.log(`  找到 ${calendars.length} 个日历`);
  calendars.forEach((cal, i) => {
    console.log(`  ${i + 1}. ${cal.summary} (${cal.type})`);
  });
  console.log();

  if (calendars.length === 0) {
    console.error("❌ 没有找到日历");
    return;
  }

  const calendarId = calendars[0].calendar_id;
  console.log("🗓️  使用日历:", calendars[0].summary);
  console.log();

  // 创建日程
  console.log("✨ 创建测试日程...");
  const now = new Date();
  const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  const createRes = await client.calendar.calendarEvent.create(
    {
      path: { calendar_id: calendarId },
      data: {
        summary: "测试日程 - OAuth 授权成功",
        description: "这是一个测试日程，用于验证 OAuth 授权是否成功。\n\n现在可以在你的个人日历中创建日程了！",
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
    console.error("❌ 创建日程失败:", createRes.msg);
    return;
  }

  console.log("\n✅ 日程创建成功！");
  console.log("  日程标题:", createRes.data?.event?.summary);
  console.log("  日程链接:", createRes.data?.event?.app_link);
  console.log();
  console.log("🎉 OAuth 授权完成！现在可以在你的个人日历中创建日程了！");
}

// 执行
main().catch((err) => {
  console.error("❌ 出错:", err);
  process.exit(1);
});
