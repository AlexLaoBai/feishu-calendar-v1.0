---
name: feishu-calendar-v1.0
description: 飞书日历同步功能 v1.0 - 支持在对话中输入日程安排，直接创建到用户的个人飞书日历。包含完整的 OAuth 授权、日程创建、时间解析等功能。当用户需要创建飞书日程、安排会议、管理个人日历时使用此技能。版本：1.0
---

# Feishu Calendar Skill v1.0

## ✅ 当前状态

🎉 **飞书日历功能已完全可用！OAuth 授权成功！**

版本：1.0 | 发布日期：2026-02-22

现在可以直接在用户的个人日历中创建日程了！

---

## 📅 使用方式

### 1. 配置环境变量

首先需要配置飞书应用的凭证：

```bash
export FEISHU_APP_ID="your-app-id"
export FEISHU_APP_SECRET="your-app-secret"
```

### 2. OAuth 授权

首次使用需要进行 OAuth 授权，获取用户访问令牌。授权后令牌会保存在 `user-tokens.json`。

### 3. 创建日程

直接告诉我你的日程安排，我会帮你解析并创建到你的个人飞书日历！

**示例：**
- "明天下午3点开会"
- "2月25日上午10点和客户视频通话"
- "下周五晚上6点聚餐"
- "今天下午 5 点到 6 点安排会议"

---

## 🔧 技术说明

### 脚本位置
- `scripts/create-user-event.js` - 在用户个人日历创建日程
- `scripts/test-user-calendar.js` - 测试在用户个人日历创建日程
- `scripts/create-event-simple.js` - 创建日程（应用日历）
- `scripts/check-events.js` - 检查日程列表
- `scripts/delete-test-events.js` - 删除测试日程

### 参考文档
- `references/API.md` - 飞书日历 API 参考文档

### 已授权的权限（用户级）
- ✅ `calendar:calendar` - 日历管理
- ✅ `calendar:calendar:read` - 读取日历
- ✅ `calendar:calendar:readonly` - 只读日历
- ✅ `calendar:calendar.event:read` - 读取日程
- ✅ `calendar:calendar.event:create` - 创建日程
- ✅ `calendar:calendar.event:update` - 更新日程
- ✅ `calendar:calendar.event:delete` - 删除日程
- ✅ `contact:user.base:readonly` - 用户信息读取
- ✅ `offline_access` - 离线访问（refresh_token）

### 依赖
- `@larksuiteoapi/node-sdk` - 飞书 SDK

### 用户令牌
- 令牌保存在：`user-tokens.json`
- Access Token 有效期：2 小时
- Refresh Token 有效期：7 天

---

## 📝 使用流程

### 创建日程

1. **理解用户需求** - 解析用户的自然语言日程描述
2. **提取时间信息** - 识别开始时间、结束时间
3. **提取日程标题** - 识别会议/日程主题
4. **调用创建脚本** - 使用 `scripts/create-user-event.js` 创建日程
5. **返回结果** - 告诉用户日程创建成功，并提供日程链接

### 时间解析

支持的时间格式：
- "今天下午3点"
- "明天上午10点"
- "2月25日晚上6点"
- "下周五下午3点"
- "今天下午 5 点到 6 点"

---

## 🚀 快速开始

### 创建一个简单的日程

```javascript
import { createUserEvent } from "./scripts/create-user-event.js";

const summary = "会议";
const startTime = new Date("2026-02-22T17:00:00");
const endTime = new Date("2026-02-22T18:00:00");
const description = "今天下午 5 点到 6 点的会议";

await createUserEvent(summary, startTime, endTime, description);
```

### 测试日程创建

```bash
cd /path/to/skill
node scripts/test-user-calendar.js
```

---

## 📋 版本信息

### v1.0 (2026-02-22)
- ✅ 初始版本发布
- ✅ OAuth 授权成功
- ✅ 支持在用户个人日历创建日程
- ✅ 基础时间解析功能
- ✅ 完整的测试脚本
- ✅ API 参考文档

---

## 🎉 现在开始使用吧！

直接告诉我你的日程安排，我会帮你创建到你的个人日历！
