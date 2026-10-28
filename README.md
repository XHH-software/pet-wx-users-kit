# pet-wx-users-kit

宠物服务预约平台 · 用户端（uni-app + Vue 3），一套代码同时支持 H5 与微信小程序。

配套项目：

- 后端：[pet-service-platform](https://github.com/XHH-software/pet-service-platform)
- 商家管理端：[pet-web-admin-kit](https://github.com/XHH-software/pet-web-admin-kit)

## 功能页面

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `pages/index/index` | 门店信息、分类入口、热门服务、超值套餐 |
| 服务列表 | `pages/service/list` | 分类筛选、关键词搜索 |
| 服务/套餐详情 | `pages/service/detail` | 服务介绍、套餐内容、立即预约 |
| 预约下单 | `pages/appointment/create` | 4 步：选服务 → 选宠物 → 选时间 → 确认 |
| 我的预约 | `pages/appointment/list` | 状态筛选、去支付、取消、去评价 |
| 预约详情 | `pages/appointment/detail` | 订单、服务、宠物、支付信息 |
| 我的宠物 | `pages/pet/list` / `pages/pet/edit` | 宠物 CRUD、疫苗到期校验 |
| 地址管理 | `pages/address/list` / `pages/address/edit` | 地址 CRUD、默认地址 |
| 我的评价 | `pages/review/list` / `pages/review/create` | 评价列表、星级 + 图片 + 内容 |
| 个人中心 | `pages/profile/index` | 登录、宠物/地址/评价入口 |

## 技术栈

| 组件 | 说明 |
| --- | --- |
| uni-app | 3.0（Vue 3） |
| Vue | 3.4 |
| Pinia | 2.2 |
| Vite | 5.4 |
| Day.js | 1.11 |

## 快速开始

要求：Node.js 18+，并先启动后端 `pet-service-platform`（默认 `http://localhost:8080`）。

### H5 调试

```bash
npm install
npm run dev:h5
```

默认端口 `5173`；如需固定 8082：

```bash
npm run dev:h5 -- --port 8082
```

### 微信小程序

```bash
npm run dev:mp-weixin
```

用微信开发者工具导入 `dist/dev/mp-weixin`。仓库内 `project.config.json` 使用 `touristappid`（游客模式），请替换为你自己的小程序 AppID，或直接在开发者工具里选择测试号。

## 后端地址

`src/utils/request.js`：

```js
const BASE_URL = 'http://localhost:8080'
```

- H5 本地调试保持 `localhost` 即可
- 真机预览请改成电脑局域网 IP，并保证手机与电脑同一网络
- 请求头使用 `authentication: <jwt>`

## 登录说明

开发期后端开启 `app.wx.mock=true`，微信登录为 mock：

- H5 端 `uni.login` 失败时会自动回退到 `dev_mock_code`
- 后端把任意 code 映射到固定 openid，并绑定演示客户「张女士」
- 接入真实小程序时，需在后端配置 `app.wx.app-id` / `app.wx.app-secret` 并关闭 mock

支付同样是演示实现：下单后调用支付接口会直接置为已支付，未接微信支付。

## 目录结构

```
src/
├─ api/            # 接口封装
├─ components/     # ServiceCard / PackageCard / TimeSlotPicker 等
├─ constants/      # 状态枚举
├─ pages/          # 页面
├─ static/         # 图片与 tabbar 图标
├─ stores/         # Pinia（登录态）
├─ utils/          # request / 日期 / 校验
├─ App.vue
├─ main.js
├─ manifest.json
├─ pages.json
└─ uni.scss
```

## 接口文档

- [接口清单](docs/api-reference.md)
- [业务说明](docs/business-description.md)

后端统一响应：

```json
{ "code": 1, "msg": null, "data": {} }
```

- `code=1` 成功
- `code=0` 业务失败
- `code=401` 未登录 / 登录过期
