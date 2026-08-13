# 车载测试学堂 · 后端内容中台架构设计

> **文档级别**：架构设计（Architecture Design）
> **适用范围**：研发、运维、决策方、审计
> **状态**：V2.0（已并入企业级评审 P0/P1 硬约束）

| 项目 | 内容 |
|------|------|
| 文档编号 | VT-SITE-ARCH-001 |
| 版本 | V2.0 |
| 发布日期 | 2026-08-14 |
| 责任人 | 车载测试学堂前端研发组 |
| 关联文档 | 《产品技术文档 README.md》《部署运维手册 DEPLOY.md》《方案企业级评审 backend-content-platform-review.md》 |

---

## 1. 背景与目标

### 1.1 现状
纯静态 SPA，全部 55 章正文、术语表、题库随 `data-bundle.js` 公开，无访问控制。

### 1.2 新需求
- **内容分层**：5 章「公开章」（登录即看），其余约 50 章 + 题库「受限内容」（申请 + 审批）。
- **全站门禁**：含 5 公开章在内全部内容均需注册/登录后访问。
- **列表可见**：首页展示全部 55 章卡片与题库入口；点击受限内容弹框提示「申请开通」。
- **申请流程**：已登录用户点击受限内容 → 提交申请 → **飞书 + 邮箱**双通知站长 → 站长手动改 D1 状态解锁。
- **防爬**：受限内容必须鉴权，配速率限制与 CORS 收敛。
- **无编辑后台**：内容固定，由 Git/JSON 维护；审批仅改 D1 用户状态。

### 1.3 访问层级
| 层级 | 身份 | 可访问内容 |
|------|------|-----------|
| L0 | 匿名 | 仅列表/元数据；点击任何内容 → 引导登录/注册 |
| L1 | 已注册（`registered`） | 5 公开章正文 + 术语表（登录可见部分） |
| L2 | 已审批（`approved`） | 全部 55 章 + 术语表 + 题库 |

> 解锁为「全有或全无」：单 `approved` 状态放行全部受限内容（无后台逐章审批）。

---

## 2. 技术架构（Cloudflare 原生产栈）

```
浏览器 SPA (Cloudflare Pages · vehicle-test-site.pages.dev)
  │ 同域 fetch('/api/...') 自动带 JWT cookie
  ├─ 列表/元数据：静态 data-bundle.js（仅元数据，无正文）
  └─ 正文/术语/题库：同域 Pages Functions（/api/*）
        │
   Cloudflare Pages Functions（同域 API 网关 + 鉴权 + 通知）
   ├─ /api/auth/*      register · login · verify · me · logout · DELETE /me
   ├─ /api/chapters/:num  正文（按 status + access_level 放行）
   ├─ /api/glossary        术语
   ├─ /api/quiz            题库（需 approved）
   ├─ /api/apply           申请 → 写 D1 + 飞书/邮件通知
   └─ 中间件：JWT 校验 + CSRF 头校验 + 速率限制
        │
   Cloudflare D1          Cloudflare KV        Cloudflare R2
   ├─ users               ├─ rl:ip            ├─ d1-backup/*（每日导出）
   ├─ applications         └─ rl:user
   ├─ magic_tokens
   ├─ chapters(content_json)
   ├─ glossary(content_json)
   └─ quiz(content_json)
```

> **同域优先（V2 修正）**：API 以 **Pages Functions** 部署在 `vehicle-test-site.pages.dev/api/*`，与 SPA **同源**。好处：无需跨域 CORS、`SameSite=Lax` cookie 即可、CSRF 面大幅缩小（仍为纵深防御保留 `X-Requested-With` 头校验）。原"独立 Workers 子域 + 跨域"方案因 `SameSite=Strict` 会阻断跨站 cookie 而废弃。
>
> 备份：每日 cron Worker 将 D1 全表导出 JSON 落 R2，满足 RPO<24h / RTO<4h。

---

## 3. 数据模型（D1 Schema，V2 含 P0 扩充）

```sql
-- 用户表（含 token_version 支持单点吊销）
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT UNIQUE NOT NULL,
  status       TEXT NOT NULL DEFAULT 'registered', -- registered | approved
  token_version INTEGER NOT NULL DEFAULT 0,        -- 吊销：version++
  created_at   INTEGER NOT NULL,
  last_login   INTEGER,
  deleted_at   INTEGER                                  -- 软删（PII 留存期清理）
);

-- 申请记录表（含审计链）
CREATE TABLE applications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  email       TEXT NOT NULL,
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',  -- pending | handled
  created_at  INTEGER NOT NULL,
  approved_by TEXT,
  approved_at INTEGER,
  approved_ip TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 魔法链接 token（单次+过期，存哈希）
CREATE TABLE magic_tokens (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  token_hash  TEXT NOT NULL,                     -- SHA-256，不存明文
  purpose     TEXT NOT NULL DEFAULT 'login',     -- login | register
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,                            -- 原子置位即失效
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
-- 注：过期 token 由 cron 惰性清理（DELETE WHERE expires_at < ?）

-- 章节正文表
CREATE TABLE chapters (
  num           INTEGER PRIMARY KEY,
  slug          TEXT NOT NULL,
  title         TEXT NOT NULL,
  access_level  TEXT NOT NULL DEFAULT 'restricted', -- public | restricted
  content_json  TEXT NOT NULL
);

-- 术语表
CREATE TABLE glossary (
  id            INTEGER PRIMARY KEY,
  term          TEXT NOT NULL,
  category      TEXT,
  access_level  TEXT NOT NULL DEFAULT 'restricted',
  content_json  TEXT NOT NULL
);

-- 题库表
CREATE TABLE quiz (
  id            INTEGER PRIMARY KEY,
  chapter_num   INTEGER,
  access_level  TEXT NOT NULL DEFAULT 'restricted',
  content_json  TEXT NOT NULL
);
```

---

## 4. API 规范

### 4.1 鉴权
| 方法 | 路径 | 说明 | 防枚举/轰炸 |
|------|------|------|------------|
| POST | `/api/auth/register` | `{email}`；不存在建号，发魔法链接 | 统一响应"若邮箱有效已发送"；按 email+IP 限流；重复失败触发 turnstile |
| POST | `/api/auth/login` | `{email}`；发魔法链接 | 同上，响应与 register 一致 |
| GET  | `/api/auth/verify?token=xxx` | 校验 magic_tokens（单次+未过期）→ 置 used_at → 发 JWT cookie | token 哈希比对 |
| GET  | `/api/auth/me` | 返回 `{email, status}` | 需有效 JWT |
| POST | `/api/auth/logout` | 清 cookie + 删 session/升 token_version | CSRF 头校验 |
| DELETE | `/api/me` | 级联删 users/applications/magic_tokens/sessions（PII 删除权） | 需有效 JWT + CSRF 头 |

### 4.2 内容
| 方法 | 路径 | 放行逻辑 |
|------|------|----------|
| GET | `/api/chapters/:num` | 匿名→401；registered+public→200；approved+restricted→200；其余→403 |
| GET | `/api/glossary` | registered→public 条目；approved→全部 |
| GET | `/api/quiz` | approved→200；其余→403 |
| POST | `/api/apply` | `{note}`；写 applications(pending)+去重+通知；每用户仅一处于 pending |

> 全部内容接口强制 JWT；缺失/过期→401。响应 `Cache-Control: private, no-store`。

---

## 5. 安全设计（P0 硬约束）

### 5.1 CSRF / 同源防护（P0-1，V2 修正）
- API 与 SPA **同源**（`vehicle-test-site.pages.dev`），无需跨域 CORS，`SameSite=Lax` cookie 即可随同源 fetch 自动携带。
- 纵深防御：所有状态变更 POST/DELETE 仍校验请求头 **`X-Requested-With: fetch`**（同源 fetch 自动附带；若被第三方脚本伪造则需跨域，受同源策略拦截）。
- cookie 属性：`HttpOnly` + `Secure` + `SameSite=Lax` + `Path=/`。
- 若未来 API 切到独立域，须改为 `SameSite=None; Secure` 并显式 `Access-Control-Allow-Origin` + `Allow-Credentials`（绝不为 `*`）。

### 5.2 魔法链接生命周期（P0-4）
- `magic_tokens` 仅存 `SHA-256(token)`；`verify` 时查未过期(`expires_at`)、`used_at IS NULL` 的记录，原子 `UPDATE ... SET used_at=? WHERE id=? AND used_at IS NULL`（影响行数=1 才放行）。
- token 15 分钟有效、单次使用。

### 5.3 JWT 吊销（P0-5）
- JWT 载荷含 `sub=user_id, ver=users.token_version, exp`。
- 中间件校验后比对 `users.token_version === jwt.ver`；不一致→401。
- 封禁/登出：`UPDATE users SET token_version = token_version+1` 或删 `sessions`，**无需轮换全局密钥**。

### 5.4 账户枚举 / 邮件轰炸（P0-3）
- register/login **统一响应文案**，不暴露"邮箱是否已注册"。
- 限流：每 email 5 次/10 分钟 + 每 IP 20 次/小时（KV）。
- 连续失败 ≥3 次引入 Cloudflare Turnstile 人机校验。

### 5.5 PII 合规与数据主体权利（P0-6）
- 站点增加**隐私政策**页；注册表单含**明示同意勾选**（"我已阅读并同意隐私政策"），未勾选禁止提交。
- `DELETE /api/me`：级联清除该用户所有记录（users/applications/magic_tokens）。
- 留存期：账号 `last_login` 超 2 年未活跃 → cron 自动软删（`deleted_at`）。
- 邮箱为唯一 PII，不外泄至前端日志。

### 5.6 密钥管理（P0-7）
- `JWT_SECRET` / `FEISHU_WEBHOOK` / `EMAIL_API_KEY` 存 Cloudflare 环境变量（静止加密），**不进代码/Git/聊天记录**。
- 轮换 SOP（写入 DEPLOY.md）：
  - `JWT_SECRET` 轮换：先 `token_version++` 使旧会话失效，再换密钥，避免误杀正常会话。
  - Webhook/邮件 Key 支持双密钥并行过渡期。
  - 泄露处置：立即轮换 + 审计 `applications.approved_*` 异常。

### 5.7 输入校验（P1-5）
- 邮箱后端 RFC 5322 轻量校验。
- `note` 限长 500、剥除控制字符（防日志注入/存储滥用）。
- 所有写接口拒绝超长/非法载荷。

### 5.8 熔断开关 / 特征标志（V2 新增 · 运维安全）
- 环境变量 `AUTH_ENABLED`（默认 `true`）。`false` 时 Pages Functions **回退到静态公开模式**：直接返回静态 `data-bundle.js` 内含容（或代理到公开章），跳过门禁，保证鉴权系统故障时全站不整体瘫痪。
- 故障处置 SOP：观测到 auth 异常 → 置 `AUTH_ENABLED=false` 立即恢复可访问 → 排查 → 修复 → 重新开启。
- 该开关是运维保底，不替代安全设计。

### 5.9 错误处理
- 所有接口返回**通用错误文案**（如 `{"error":"请求失败"}`），不泄露堆栈/内部表名/SQL。
- 5xx 记录结构化日志（含 requestId），供可观测系统告警。

---

## 6. 通知设计（申请时触发）

`/api/apply` 落库后并行：
1. **飞书**：POST 群机器人 Webhook（`FEISHU_WEBHOOK`），含申请人邮箱、备注、时间、D1 改状态提示。
2. **邮箱**：事务邮件（Resend / Cloudflare Email）发 `OWNER_EMAIL`。
均需环境变量，不硬编码。

---

## 7. 防爬设计

- 全内容需 JWT；匿名无法获取任何正文。
- 限流（KV，P1-1 注一致性）：每 IP 60 次/分钟 + 每用户 300 次/天；超限 429。
- CORS 收敛到自有域名；无批量导出接口（仅按 `:num` 单章）。
- token 短期（JWT 7 天 + magic link 15 分钟单次）。
> 边界：已审批用户可在浏览器复制内容；技术防爬仅挡匿名/批量，真版权靠水印+法律。

---

## 8. 可靠与可观测（P0-2 / P1-2）

- **备份/DR**：每日 cron Worker 执行 D1 全表导出 → R2（`d1-backup/YYYYMMDD.json`）；RPO<24h，RTO<4h。内容表以 **Git JSON 为唯一真源**，D1 为派生，重迁脚本幂等。
- **恢复流程**：从 R2 取最新 `d1-backup/YYYYMMDD.json` → 本地 `wrangler d1 execute vehicle_site --file=restore.sql`（restore.sql 由备份 JSON 经 `tools/d1_backup_to_sql.py` 生成 `INSERT OR REPLACE` 语句）。恢复后跑 6 态矩阵自测。
- **可观测**：接入 Workers Logs / Sentry 记录 auth 异常；外部 uptime 探活 `/api/me`；auth 失败率突增告警；申请/审批写结构化日志。
- **WAF**：启用 Cloudflare Bot Fight Mode，对 `/api/*` 加异常 UA 拦截（P2-2）。

---

## 9. 前端改动清单

- 登录/注册弹框（邮箱 + 魔法链接流程；失败触发 turnstile）。
- 卡片点击：匿名→登录/注册；注册+public→拉 API；注册+restricted→申请弹框；approved→拉 API。
- fetch 改造：`credentials:'include'` + 头 `X-Requested-With:'fetch'`；渲染从读 `chapterContent` 改读 API。
- 顶部登录态 + 登出（logout 调 CSRF 保护接口）。
- 隐私政策页；`DELETE /api/me` 入口（账户注销）。

---

## 10. 迁移脚本

`tools/migrate_to_d1.py`：读 `data/chapters.json` + `chapter-content/NN.json` + `glossary.json` + `quiz/NN.json` → 幂等写入 D1（Git 为唯一真源）。经 `wrangler d1 execute` 批量执行。

---

## 11. 部署步骤

1. `wrangler d1 create vehicle_site` + 执行建表 SQL。
2. `wrangler kv namespace create rl`、`wrangler r2 bucket create d1-backup`。
3. 写 `wrangler.toml`：`[vars]` 注入密钥 + 绑定 D1/KV/R2 + 调度 cron（备份）。
4. `wrangler deploy` 发布 Worker。
5. Pages 构建改 `INCLUDE_CONTENT=0`（仅元数据），正文不进静态包。
6. 前端接 API + 登录流，重部署 Pages。
7. 跑迁移脚本灌数据。
8. 自测 6 态访问矩阵 + 评审 P0 安全清单。

### 11.1 灰度发布与回滚（V2 新增）
- **协调发布**：Pages Functions（API+鉴权）与前端改造**同一次发布**上线；`AUTH_ENABLED=true` 前确认 Functions 健康。
- **回滚**：Functions/前端异常 → 置 `AUTH_ENABLED=false`（Functions 回退静态公开）即时止血；或 `wrangler rollback` 到上一版本 Functions。
- **旧站兼容**：引入门禁前站点全公开；切换后全门禁。发布窗口内已有访客需重新注册，属一次性的可接受摩擦（新站无存量账号）。

---

## 12. 安全清单（投产 Gate，P0/P1）

- [ ] 同源 API（Pages Functions）+ SameSite=Lax + X-Requested-With 头校验
- [ ] D1 定时 export 备份 R2 + 恢复流程 + RTO/RPO 定义
- [ ] 注册/登录统一响应 + email/IP 限流 + turnstile
- [ ] magic_tokens 单次+过期强制
- [ ] token_version 支持单点吊销（无 sessions 表）
- [ ] 隐私政策 + 注册同意勾选 + DELETE /api/me 级联 + 留存期
- [ ] 密钥轮换 SOP 入 DEPLOY.md
- [ ] AUTH_ENABLED 熔断开关 + 灰度发布/回滚 SOP
- [ ] KV 限流最终一致性已评估（近似防御）
- [ ] 可观测日志/告警/探活就位
- [ ] Git 为内容真源策略明确
- [ ] 审批审计列（approved_by/at/ip）写入
- [ ] 输入校验（邮箱/notes）后端落实
- [ ] 通用错误响应（无内部泄露）
- [ ] 单元/集成/压测覆盖 6 态矩阵

---

## 13. 实施阶段

| 阶段 | 内容 | 产出 |
|------|------|------|
| P1 | D1 建表 + 迁移脚本 | 数据底座 |
| P2 | Workers 鉴权 + 内容 API（含 P0 安全） | 安全内容接口 |
| P3 | apply + 飞书/邮件通知 + 审计 | 申请闭环 |
| P4 | 前端登录流 + 卡片改造 | 全链路 |
| P5 | 限流 + 备份 + 可观测 + 部署 | 生产就绪 |

---

## 14. 评审状态

- V1.0 → 企业级评审发现 P0×7 / P1×6 / P2×4。
- V2.0 → 已将 P0/P1 全部并入硬约束（见 §3/§5/§8/§12）。
- V2.0 → **3 轮独立自审已通过**（安全架构 / 可靠数据模型 / 合规可运维），日志见 `docs/backend-review-log.md`。企业级 P0×7、P1×6 在 V2.0 中 100% 闭合，无遗留 P0/P1。
- **结论**：设计达「可实施」门槛，按 §13 顺序启动 P1（D1 建表 + 迁移脚本）。
- 待用户确认的产物级决策（非设计缺陷，不阻断实施）：5 个公开章节具体选择、公开术语子集、飞书/邮件/JWT 凭据于部署时通过环境变量注入。
