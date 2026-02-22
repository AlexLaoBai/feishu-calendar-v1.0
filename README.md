# Feishu Calendar Skill v1.0

飞书日历同步功能 - 支持在对话中输入日程安排，直接创建到用户的个人飞书日历。

## ✨ 特性

- ✅ OAuth 授权支持
- ✅ 直接在用户个人日历创建日程
- ✅ 完整的日历 API 集成
- ✅ 支持日程的创建、读取、更新、删除
- ✅ 环境变量配置，安全无敏感信息

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
export FEISHU_APP_ID="your-app-id"
export FEISHU_APP_SECRET="your-app-secret"
```

### 3. OAuth 授权

首次使用需要进行 OAuth 授权，获取用户访问令牌。授权后令牌会保存在 `user-tokens.json`。

### 4. 使用示例

```javascript
import { createUserEvent } from "./scripts/create-user-event.js";

const summary = "会议";
const startTime = new Date("2026-02-22T17:00:00");
const endTime = new Date("2026-02-22T18:00:00");
const description = "今天下午 5 点到 6 点的会议";

await createUserEvent(summary, startTime, endTime, description);
```

## 📁 项目结构

```
feishu-calendar-v1.0/
├── .gitignore                      # Git 忽略文件
├── README.md                        # 项目说明文档
├── SKILL.md                         # OpenClaw Skill 文档
├── package.json                     # 依赖配置
├── scripts/                         # 脚本目录
│   ├── check-events.js            # 检查日程列表
│   ├── create-event-simple.js     # 创建日程（应用日历）
│   ├── create-user-event.js       # 在用户个人日历创建日程
│   ├── delete-test-events.js      # 删除测试日程
│   └── test-user-calendar.js      # 测试在用户个人日历创建日程
└── references/                     # 参考文档
    └── API.md                     # 飞书日历 API 参考文档
```

## 🔧 脚本说明

### `scripts/create-user-event.js`
在用户个人日历中创建日程。

### `scripts/test-user-calendar.js`
测试在用户个人日历中创建日程的功能。

### `scripts/create-event-simple.js`
在应用日历中创建日程（不需要用户授权）。

### `scripts/check-events.js`
检查日程列表。

### `scripts/delete-test-events.js`
删除测试日程。

## 📋 权限列表

### 用户级权限
- `calendar:calendar` - 日历管理
- `calendar:calendar:read` - 读取日历
- `calendar:calendar:readonly` - 只读日历
- `calendar:calendar.event:read` - 读取日程
- `calendar:calendar.event:create` - 创建日程
- `calendar:calendar.event:update` - 更新日程
- `calendar:calendar.event:delete` - 删除日程
- `contact:user.base:readonly` - 用户信息读取
- `offline_access` - 离线访问（refresh_token）

## 🔐 安全说明

- 所有敏感配置通过环境变量读取
- `user-tokens.json` 包含用户授权令牌，已添加到 `.gitignore`
- 不要将 `user-tokens.json` 提交到版本控制

## 📝 版本信息

### v1.0.0 (2026-02-22)
- ✅ 初始版本发布
- ✅ OAuth 授权成功
- ✅ 支持在用户个人日历创建日程
- ✅ 完整的测试脚本
- ✅ API 参考文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [飞书开放平台](https://open.feishu.cn/)
- [OpenClaw](https://openclaw.ai/)
- [项目 GitHub 仓库](https://github.com/AlexLaoBai/feishu-calendar-v1.0)
