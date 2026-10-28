# 宠物服务预约平台 · 小程序端接口文档

> 本文档基于小程序前端已实现的页面和 API 调用，供后端开发参考。
> 小程序项目位置：`D:\pet-wx-users-kit`
> 管理端项目位置：`D:\pet-web-admin-kit`（已完成，参考其 `docs/api-reference.md`）

---

## 目录

1. [通用约定](#1-通用约定)
2. [认证模块](#2-认证模块)
3. [门店信息](#3-门店信息)
4. [分类模块](#4-分类模块)
5. [服务项目](#5-服务项目)
6. [服务套餐](#6-服务套餐)
7. [宠物档案](#7-宠物档案)
8. [地址管理](#8-地址管理)
9. [可约时段](#9-可约时段)
10. [预约管理](#10-预约管理)
11. [评价管理](#11-评价管理)
12. [数据字典](#12-数据字典)
13. [前端项目文件清单](#13-前端项目文件清单)

---

## 1. 通用约定

### 1.1 基础路径

- 开发环境：`http://localhost:8080`
- 所有接口以 `/user/` 开头（管理端以 `/admin/` 开头）

### 1.2 统一响应体

```json
{
  "code": 1,
  "msg": null,
  "data": {}
}
```

| code | 含义 |
|------|------|
| 1 | 成功 |
| 0 | 业务失败（msg 包含错误信息） |
| 401 | 未登录 / token 过期 |

### 1.3 分页约定

**请求参数**：`page`（默认 1）、`pageSize`（默认 10）

**响应格式**：
```json
{
  "code": 1,
  "msg": null,
  "data": {
    "total": 50,
    "records": []
  }
}
```

### 1.4 认证方式

请求头携带 `authentication` 字段（注意：管理端使用 `token` 字段）：
```
authentication: eyJhbGciOiJIUzI1NiJ9...
```

> 小程序端使用微信登录获取 token，token 由后端通过 code2session 生成。

### 1.5 日期时间格式

- 日期：`YYYY-MM-DD`（如 `2026-11-05`）
- 时刻：`HH:mm`（如 `14:00`）
- 完整时间：`YYYY-MM-DD HH:mm:ss`
- 金额：保留两位小数

---

## 2. 认证模块

### 2.1 微信登录

```
POST /user/login
```

**请求体**：
```json
{
  "code": "wx_login_code_from_wx_login"
}
```

**响应 data**：
```json
{
  "id": 1,
  "nickname": "微信用户",
  "avatar": "https://xxx/avatar.jpg",
  "phone": "13800138000",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**业务逻辑**：
- 调用微信 `code2Session` 接口获取 openid
- 如果 openid 已注册，直接返回用户信息和 token
- 如果 openid 未注册，自动创建客户记录，返回新用户信息和 token
- token 建议使用 JWT，有效期 7 天

### 2.2 获取用户信息

```
GET /user/info
```

**请求头**：携带 authentication

**响应 data**：
```json
{
  "id": 1,
  "nickname": "微信用户",
  "avatar": "https://xxx/avatar.jpg",
  "phone": "13800138000"
}
```

### 2.3 更新用户信息

```
PUT /user/info
```

**请求体**：
```json
{
  "nickname": "新昵称",
  "avatar": "https://xxx/new-avatar.jpg",
  "phone": "13900139000"
}
```

**响应 data**：`null`

---

## 3. 门店信息

### 3.1 获取门店营业状态

```
GET /user/shop/status
```

**响应 data**：
```json
{
  "id": 1,
  "name": "萌宠之家",
  "logo": "https://xxx/shop-logo.jpg",
  "phone": "010-12345678",
  "address": "北京市朝阳区XX路XX号",
  "businessStatus": 1,
  "businessHours": [
    { "dayOfWeek": 1, "isRest": false, "openTime": "09:00", "closeTime": "20:00" },
    { "dayOfWeek": 2, "isRest": false, "openTime": "09:00", "closeTime": "20:00" },
    { "dayOfWeek": 3, "isRest": false, "openTime": "09:00", "closeTime": "20:00" },
    { "dayOfWeek": 4, "isRest": false, "openTime": "09:00", "closeTime": "20:00" },
    { "dayOfWeek": 5, "isRest": false, "openTime": "09:00", "closeTime": "20:00" },
    { "dayOfWeek": 6, "isRest": false, "openTime": "09:00", "closeTime": "21:00" },
    { "dayOfWeek": 7, "isRest": true, "openTime": null, "closeTime": null }
  ]
}
```

> `businessStatus`: 1=营业中，0=休息中
> `dayOfWeek`: 1=周一，7=周日

**前端用途**：首页顶部展示门店名称、Logo、营业状态标签、地址和联系电话。

---

## 4. 分类模块

### 4.1 分类列表

```
GET /user/category/list
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | int | 否 | 1=服务项目分类，2=服务套餐分类 |

**响应 data**：
```json
[
  { "id": 1, "name": "洗护", "type": 1, "sort": 1 },
  { "id": 2, "name": "美容", "type": 1, "sort": 2 },
  { "id": 3, "name": "保健", "type": 1, "sort": 3 }
]
```

**业务逻辑**：
- 只返回启用状态（status=1）的分类
- 按 sort 字段升序排列

**前端用途**：
- 首页分类图标区域（type=1）
- 服务列表页分类筛选 Tab

---

## 5. 服务项目

### 5.1 服务项目列表

```
GET /user/service-item/list
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | long | 否 | 分类 ID 筛选 |
| name | string | 否 | 名称模糊搜索 |
| page | int | 否 | 页码，默认 1 |
| pageSize | int | 否 | 每页条数，默认 10 |

**响应 data**：
```json
[
  {
    "id": 1,
    "name": "中型犬基础洗护",
    "image": "https://xxx/service1.jpg",
    "categoryId": 1,
    "categoryName": "洗护",
    "price": 168.00,
    "duration": 60,
    "petSizeLimit": 2,
    "dailyLimit": 10,
    "description": "包含洗澡、吹干、基础修剪",
    "status": 1
  }
]
```

**业务逻辑**：
- 只返回启用状态（status=1）的项目
- 分页返回时包装为 `{total, records}` 格式

**前端用途**：
- 首页"热门服务"区域（取前 6 条）
- 服务列表页完整列表
- 预约下单第一步选择服务

### 5.2 服务项目详情

```
GET /user/service-item/{id}
```

**响应 data**：同 5.1 单条记录结构

**前端用途**：服务详情页展示完整信息。

---

## 6. 服务套餐

### 6.1 套餐列表

```
GET /user/package/list
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| categoryId | long | 否 | 分类 ID 筛选 |
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |

**响应 data**：
```json
[
  {
    "id": 1,
    "name": "尊享洗护套餐",
    "image": "https://xxx/package1.jpg",
    "categoryId": 1,
    "categoryName": "洗护",
    "originalPrice": 336.00,
    "sellingPrice": 288.00,
    "dailyLimit": 5,
    "description": "两次基础洗护 + 一次精剪",
    "status": 1,
    "details": [
      { "serviceItemId": 1, "serviceName": "中型犬基础洗护", "quantity": 2, "duration": 60 },
      { "serviceItemId": 3, "serviceName": "精剪造型", "quantity": 1, "duration": 90 }
    ]
  }
]
```

**业务逻辑**：
- 只返回启用状态的套餐
- 包含 details 明细数组

### 6.2 套餐详情

```
GET /user/package/{id}
```

**响应 data**：同 6.1 单条结构

**前端用途**：套餐详情页，展示套餐包含的服务项目明细。

---

## 7. 宠物档案

### 7.1 我的宠物列表

```
GET /user/pet/list
```

**请求头**：携带 authentication

**响应 data**：
```json
[
  {
    "id": 1,
    "name": "豆豆",
    "avatar": "https://xxx/pet1.jpg",
    "species": 1,
    "breed": "金毛",
    "gender": 1,
    "weight": 25.5,
    "birthday": "2024-03-15",
    "neutered": true,
    "vaccineExpiryDate": "2027-03-15",
    "allergies": "",
    "remark": "性格温顺"
  }
]
```

**业务逻辑**：
- 通过 token 获取当前客户 ID
- 返回该客户下所有宠物

### 7.2 新增宠物

```
POST /user/pet
```

**请求体**：
```json
{
  "name": "豆豆",
  "avatar": "https://xxx/pet1.jpg",
  "species": 1,
  "breed": "金毛",
  "gender": 1,
  "weight": 25.5,
  "birthday": "2024-03-15",
  "neutered": true,
  "vaccineExpiryDate": "2027-03-15",
  "allergies": "",
  "remark": "性格温顺"
}
```

**响应 data**：`null`

**业务逻辑**：
- 自动关联当前登录客户 ID
- name 和 species 为必填

### 7.3 修改宠物

```
PUT /user/pet
```

**请求体**：同 7.2，需包含 `id` 字段

**响应 data**：`null`

**业务逻辑**：
- 校验宠物归属当前客户

### 7.4 删除宠物

```
DELETE /user/pet/{id}
```

**响应 data**：`null`

**业务逻辑**：
- 校验宠物归属当前客户
- 如果该宠物有未完成预约（status=1/2/3），拒绝删除并返回错误提示

---

## 8. 地址管理

### 8.1 地址列表

```
GET /user/address/list
```

**请求头**：携带 authentication

**响应 data**：
```json
[
  {
    "id": 1,
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "XX路XX号XX室",
    "contactName": "张女士",
    "contactPhone": "13812341234",
    "isDefault": true
  }
]
```

**业务逻辑**：
- 通过 token 获取当前客户 ID
- 返回该客户下所有地址
- 默认地址排在前面

### 8.2 新增地址

```
POST /user/address
```

**请求体**：
```json
{
  "province": "北京市",
  "city": "北京市",
  "district": "朝阳区",
  "detail": "XX路XX号XX室",
  "contactName": "张女士",
  "contactPhone": "13812341234",
  "isDefault": true
}
```

**响应 data**：`null`

**业务逻辑**：
- 自动关联当前客户 ID
- 如果 isDefault=true，将该客户其他地址的 isDefault 设为 false
- contactName 和 contactPhone 和 detail 为必填

### 8.3 修改地址

```
PUT /user/address
```

**请求体**：同 8.2，需包含 `id` 字段

**响应 data**：`null`

### 8.4 删除地址

```
DELETE /user/address/{id}
```

**响应 data**：`null`

**业务逻辑**：
- 校验地址归属当前客户

---

## 9. 可约时段

### 9.1 获取可预约时段 ★

```
GET /user/schedule/available
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 是 | 日期，YYYY-MM-DD |
| serviceItemId | long | 否 | 服务项目 ID |
| packageId | long | 否 | 服务套餐 ID |

**响应 data**：
```json
[
  {
    "staffId": 3,
    "staffName": "王美容师",
    "level": 2,
    "avatar": "https://xxx/avatar.jpg",
    "slots": ["09:00", "09:30", "10:00", "14:00", "14:30"]
  },
  {
    "staffId": 5,
    "staffName": "李美容师",
    "level": 3,
    "avatar": "https://xxx/avatar2.jpg",
    "slots": ["09:00", "13:00", "15:00"]
  }
]
```

**业务逻辑**（核心接口）：
1. 根据 serviceItemId 或 packageId 获取服务时长 duration
2. 查询该日所有启用状态且有排班（status=1）的员工
3. 如果指定了 serviceItemId，过滤掉不具备该项目资质的员工
4. 对每个员工：
   - 获取排班时间 [startTime, endTime]
   - 按 30 分钟切片
   - 减去已预约占用的时间片（查 appointment_slot 表）
   - 找出所有能容纳 duration 分钟的连续可用起始点
5. 按员工分组返回

**前端用途**：预约下单第三步，展示可选日期和时段。

---

## 10. 预约管理

### 10.1 提交预约

```
POST /user/appointment
```

**请求体**：
```json
{
  "petId": 1,
  "staffId": 3,
  "serviceItemIds": [1],
  "packageId": null,
  "appointmentDate": "2026-11-05",
  "startTime": "14:00",
  "remark": "请注意狗狗比较胆小"
}
```

**响应 data**：
```json
{
  "id": 1002,
  "orderNo": "AP202611050002"
}
```

**业务逻辑**：
1. 校验宠物疫苗未过期
2. 校验服务项目适用体型（如果宠物体重超出限制）
3. 校验员工在该日期有排班且状态为可约
4. 计算总时长：
   - 单个项目：duration
   - 套餐：所有明细的 duration × quantity 之和
5. 计算 endTime = startTime + 总时长
6. 检查时段冲突（该员工在该时段是否已有预约）
7. 写入 appointment_slot 占用时间片（30 分钟粒度）
8. 生成订单号：AP + YYYYMMDD + 4位序号
9. 初始状态：1（待支付）

### 10.2 模拟支付

```
POST /user/appointment/{id}/pay
```

**响应 data**：`null`

**业务逻辑**：
- 仅 status=1（待支付）可操作
- 更新状态为 2（待服务）
- 更新 payStatus=1（已付）
- 记录 payTime

> 实际项目中这里应对接微信支付，当前为模拟实现。

### 10.3 我的预约列表

```
GET /user/appointment/page
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
| status | int | 否 | 预约状态筛选 |

**响应 data**：
```json
{
  "total": 5,
  "records": [
    {
      "id": 1001,
      "orderNo": "AP202611050001",
      "appointmentDate": "2026-11-05",
      "startTime": "14:00",
      "endTime": "15:30",
      "staffName": "王美容师",
      "itemSummary": "中型犬基础洗护 ×1",
      "totalAmount": 168.00,
      "payStatus": 1,
      "status": 2,
      "createTime": "2026-11-04 20:13:22"
    }
  ]
}
```

**业务逻辑**：
- 通过 token 获取当前客户 ID
- 只返回该客户的预约
- 按 createTime 倒序

### 10.4 预约详情

```
GET /user/appointment/{id}
```

**响应 data**：
```json
{
  "id": 1001,
  "orderNo": "AP202611050001",
  "appointmentDate": "2026-11-05",
  "startTime": "14:00",
  "endTime": "15:30",
  "status": 2,
  "createTime": "2026-11-04 20:13:22",
  "petName": "豆豆",
  "petSpecies": 1,
  "petBreed": "金毛",
  "staffName": "王美容师",
  "staffLevel": 2,
  "items": [
    {
      "serviceName": "中型犬基础洗护",
      "price": 168.00,
      "duration": 60,
      "quantity": 1,
      "subtotal": 168.00
    }
  ],
  "totalAmount": 168.00,
  "payStatus": 1,
  "payTime": "2026-11-04 20:15:00",
  "cancelReason": null,
  "remark": "请注意狗狗比较胆小"
}
```

**业务逻辑**：
- 校验预约归属当前客户

### 10.5 取消预约

```
POST /user/appointment/{id}/cancel
```

**请求体**：
```json
{
  "cancelReason": "临时有事，改天再去"
}
```

**响应 data**：`null`

**业务逻辑**：
- 仅 status=1（待支付）或 status=2（待服务）可取消
- 更新状态为 4（已取消）
- 释放 appointment_slot 时间片
- 如果已支付（payStatus=1），需要触发退款流程
- 记录 cancelReason

---

## 11. 评价管理

### 11.1 提交评价

```
POST /user/review
```

**请求体**：
```json
{
  "appointmentId": 1001,
  "score": 5,
  "content": "服务非常好，狗狗洗得很干净，美容师很专业！",
  "images": ["https://xxx/review1.jpg", "https://xxx/review2.jpg"]
}
```

**响应 data**：`null`

**业务逻辑**：
- 校验预约归属当前客户
- 校验预约状态为 5（已完成）
- 校验该预约尚未评价（一条预约只能评价一次）
- 评价后更新预约状态为 6（已评价）
- score 范围 1-5
- images 最多 3 张

### 11.2 我的评价列表

```
GET /user/review/list
```

**请求参数**：
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |

**响应 data**：
```json
{
  "total": 10,
  "records": [
    {
      "id": 1,
      "appointmentId": 1001,
      "staffName": "王美容师",
      "score": 5,
      "content": "服务非常好，狗狗洗得很干净！",
      "images": ["https://xxx/review1.jpg"],
      "replyContent": "感谢您的好评！欢迎下次再来~",
      "createTime": "2026-11-06 10:30:00"
    }
  ]
}
```

**业务逻辑**：
- 通过 token 获取当前客户 ID
- 只返回该客户的评价
- 按 createTime 倒序

---

## 12. 数据字典

### 12.1 预约状态 (appointment.status)

| 值 | 含义 | 客户可执行操作 |
|----|------|--------------|
| 1 | 待支付 | 支付、取消 |
| 2 | 待服务 | 取消 |
| 3 | 服务中 | 无 |
| 4 | 已取消 | 无 |
| 5 | 已完成 | 评价 |
| 6 | 已评价 | 无 |

### 12.2 支付状态 (appointment.payStatus)

| 值 | 含义 |
|----|------|
| 0 | 未付 |
| 1 | 已付 |
| 2 | 已退 |

### 12.3 宠物类型 (pet.species)

| 值 | 含义 |
|----|------|
| 1 | 狗 |
| 2 | 猫 |
| 3 | 其他 |

### 12.4 宠物性别 (pet.gender)

| 值 | 含义 |
|----|------|
| 1 | 公 |
| 2 | 母 |

### 12.5 适用体型 (service_item.petSizeLimit)

| 值 | 含义 |
|----|------|
| 0 | 不限 |
| 1 | 小型（≤10kg） |
| 2 | 中型（10-25kg） |
| 3 | 大型（≥25kg） |

### 12.6 员工职级 (staff.level)

| 值 | 含义 |
|----|------|
| 1 | 初级 |
| 2 | 中级 |
| 3 | 高级 |

---

## 13. 前端项目文件清单

```
D:\pet-wx-users-kit\
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.js
    ├── App.vue
    ├── manifest.json              # uni-app 配置
    ├── pages.json                 # 页面路由 + TabBar
    ├── uni.scss                   # 设计 Token
    ├── api/
    │   ├── user.js                # 登录/用户信息/门店状态
    │   ├── category.js            # 分类列表
    │   ├── serviceItem.js         # 服务项目
    │   ├── servicePackage.js      # 服务套餐
    │   ├── pet.js                 # 宠物 CRUD
    │   ├── address.js             # 地址 CRUD
    │   ├── appointment.js         # 预约（含可约时段）
    │   └── review.js              # 评价
    ├── constants/
    │   ├── enums.js               # 枚举定义
    │   └── dict.js                # 字典工具
    ├── stores/
    │   └── user.js                # Pinia 用户状态
    ├── utils/
    │   ├── request.js             # uni.request 封装
    │   └── format.js              # 格式化工具
    ├── components/
    │   ├── StatusTag.vue          # 状态标签
    │   ├── ServiceCard.vue        # 服务项目卡片
    │   ├── PackageCard.vue        # 套餐卡片
    │   ├── PetCard.vue            # 宠物卡片
    │   ├── EmptyState.vue         # 空状态
    │   ├── TimeSlotPicker.vue     # 时段选择器
    │   └── PriceDisplay.vue       # 价格展示
    ├── pages/
    │   ├── index/index.vue        # 首页（TabBar）
    │   ├── service/
    │   │   ├── list.vue           # 服务列表（TabBar）
    │   │   └── detail.vue         # 服务详情
    │   ├── appointment/
    │   │   ├── create.vue         # 预约下单（4步流程）
    │   │   ├── list.vue           # 我的预约（TabBar）
    │   │   └── detail.vue         # 预约详情
    │   ├── pet/
    │   │   ├── list.vue           # 宠物列表
    │   │   └── edit.vue           # 添加/编辑宠物
    │   ├── address/
    │   │   ├── list.vue           # 地址列表
    │   │   └── edit.vue           # 添加/编辑地址
    │   ├── review/
    │   │   ├── create.vue         # 发表评价
    │   │   └── list.vue           # 我的评价
    │   └── profile/
    │       └── index.vue          # 个人中心（TabBar）
    └── static/
        └── images/                # 静态图片资源
```

---

## 附录：与管理端接口的差异

| 维度 | 管理端 | 小程序端 |
|------|--------|---------|
| 接口前缀 | `/admin/` | `/user/` |
| 认证头 | `token` | `authentication` |
| 认证方式 | 账号密码登录 | 微信 code2Session |
| 数据范围 | 全店数据 | 仅当前客户数据 |
| 写操作 | CRUD 全部 | 仅自己的资源 |
| 支付 | 无（代客下单） | 模拟支付 |
| 评价 | 回复评价 | 发起评价 |
| 排班 | 管理排班 | 只读查看可约时段 |
