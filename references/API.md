# Feishu Calendar API Reference

## 飞书日历 API 文档

### 应用配置
- **App ID:** 从环境变量 `FEISHU_APP_ID` 读取
- **App Secret:** 从环境变量 `FEISHU_APP_SECRET` 读取
- **Domain:** `lark.Domain.Feishu`

**配置方式：**
```bash
export FEISHU_APP_ID="your-app-id"
export FEISHU_APP_SECRET="your-app-secret"
```

### OAuth 授权

#### 授权链接生成
```javascript
const baseUrl = "https://open.feishu.cn/open-apis/authen/v1/index";
const params = new URLSearchParams({
  app_id: APP_ID,
  redirect_uri: REDIRECT_URI,
  response_type: "code",
  scope: "calendar:calendar calendar:calendar:read calendar:calendar:readonly calendar:calendar.event:read calendar:calendar.event:create calendar:calendar.event:update calendar:calendar.event:delete contact:user.base:readonly offline_access",
});
const authUrl = `${baseUrl}?${params.toString()}`;
```

#### 用授权码换取 access_token
```javascript
const postData = JSON.stringify({
  grant_type: "authorization_code",
  client_id: APP_ID,
  client_secret: APP_SECRET,
  code: AUTH_CODE,
  redirect_uri: REDIRECT_URI,
});

const options = {
  hostname: "open.feishu.cn",
  port: 443,
  path: "/open-apis/authen/v2/oauth/token",
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(postData),
  },
};
```

### 日历 API

#### 获取日历列表
```javascript
const calendarsRes = await client.calendar.calendar.list(
  {},
  lark.withUserAccessToken(userAccessToken)
);
```

#### 创建日程
```javascript
const createRes = await client.calendar.calendarEvent.create(
  {
    path: { calendar_id: calendarId },
    data: {
      summary: "会议",
      description: "会议描述",
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
  lark.withUserAccessToken(userAccessToken)
);
```

### 权限列表

#### 用户级权限
- `calendar:calendar` - 日历管理
- `calendar:calendar:read` - 读取日历
- `calendar:calendar:readonly` - 只读日历
- `calendar:calendar.event:read` - 读取日程
- `calendar:calendar.event:create` - 创建日程
- `calendar:calendar.event:update` - 更新日程
- `calendar:calendar.event:delete` - 删除日程
- `contact:user.base:readonly` - 用户信息读取
- `offline_access` - 离线访问（refresh_token）

### 令牌有效期
- **Access Token:** 2 小时 (7200 秒)
- **Refresh Token:** 7 天 (604800 秒)
