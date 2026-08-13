# 车载测试学堂网站 · 产品技术文档

> **文档级别**：对外发布版（Product / Technical Documentation）
> **适用范围**：研发、内容编辑、运维、审核及外部合作方

| 项目 | 内容 |
|------|------|
| 文档编号 | VT-SITE-RD-001 |
| 版本 | V1.2 |
| 发布日期 | 2026-08-14 |
| 责任人（Owner） | 车载测试学堂前端研发组 |
| 文档状态 | 正式发布（Released） |
| 密级 | 公开（Public） |
| 关联文档 | 《部署运维手册 DEPLOY.md》 |

## 修订记录

| 版本 | 日期 | 修订人 | 说明 |
|------|------|--------|------|
| V1.0 | 2026-08-10 | 研发组 | 初版，覆盖架构、数据模型、内容规范、质量门 |
| V1.1 | 2026-08-10 | 研发组 | 按企业对外标准扩写：补充文档信息表、架构图、完整 Schema 参考、内容创作 Runbook、设计规范与安全合规 |
| V1.2 | 2026-08-14 | 研发组 | 同步部署形态变更：新增 Cloudflare Pages 生产部署、双形态构建（本地内联 / CI 按需加载） |

> **文档同步维护约定（P0）**：本站点任何迭代变动（新增/调整章节、修改数据模型、调整质量门基线、变更部署形态等），都必须同步更新本文件与《部署运维手册 DEPLOY.md》中的对应数字与章节，保持文档与代码/数据持续一致。当前基线数字：chapters=55、chapterContent=55、glossary=91、quiz=404；质量门 regression 失败=0/警告=32、scan_emoji UI 层=3（豁免）。

---

## 1. 文档目的与范围

### 1.1 目的
本文件定义「车载测试学堂网站」的产品定位、技术架构、数据模型、内容创作规范与质量保障体系，作为研发交付、内容编辑与第三方协作的**唯一权威依据**。

### 1.2 范围
- 适用：站点源码 `vehicle-test-site/` 全部静态资源与数据。
- 涵盖：架构、目录、运行时依赖、数据 Schema、渲染路由、设计系统、本地开发、内容创作、质量门。
- 不涵盖：线上部署与回滚操作（见《部署运维手册 DEPLOY.md》）。

### 1.3 非目标
- 不涉及后端服务、数据库或用户账户系统（本站为纯静态、无服务端）。
- 不规定具体章节教学内容（由内容团队另行评审）。

---

## 2. 产品概述

### 2.1 背景
车载测试从业者需要体系化的总线协议、仿真工具、诊断与 HIL 台架知识。本站定位为**自学 + 知识分享**型学习平台，强调"可检索、可动手、可自测"。

### 2.2 产品原则
- **零压力学习**：不提供进度条 / 打卡 / 完成百分比等外部激励 UI，仅保留轻量"最近查看"标记（`LastViewed`）。
- **完全离线自洽**：所有图片、字体、图标均为本地资源或内联 SVG，**不引用任何外部（http/https）资源**。
- **数据驱动**：内容、术语、题库与界面解耦，编辑内容无需改动前端代码。

### 2.3 目标读者
车载测试工程师、总线协议工程师、HIL/台架测试工程师、相关专业学生与培训讲师。

### 2.4 核心特性
- 55 章体系化课程，按模块（A–F / R）与能力分级（L0–L3）组织。
- 91 条专业术语表，支持中英文对照与分类检索。
- 404 道自测题库，按章组织，支持单/多选/判断/简答。
- 交互式仿真部件（位定时、帧结构、线与逻辑、总线负载、CANoe 面板）。
- 全文搜索、暗色主题、响应式布局、交叉引用跳转。

---

## 3. 读者对象与文档地图

| 角色 | 重点章节 |
|------|----------|
| 前端研发 | 第 4、5、6、7、8、11 章 |
| 内容编辑 | 第 10 章（内容创作指南）、第 6 章（Schema） |
| 运维 / SRE | 《部署运维手册 DEPLOY.md》 |
| 审核 / 外部合作方 | 第 2、6、8、12 章 |

---

## 4. 技术架构

### 4.1 架构总览

```
┌──────────────────────────────────────────────────────────┐
│                        浏览器 (Client)                       │
│  index / chapters / chapter / glossary / quiz  (静态 HTML)   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ app.js  (路由 / 渲染 / 搜索 / 主题 / 图标 ICON())    │    │
│  └────────────────────────────────────────────────────┘    │
│      │ fetch 章节内容            │ 读取内联数据              │
│      ▼                         ▼                            │
│  data/chapter-content/NN.json   assets/js/data-bundle.js     │
│  (按需加载，55 章)              (window.__SITE_DATA__)        │
└──────────────────────────────────────────────────────────┘
            │ 构建期生成
            ▼
 build_data_bundle.py  ←  data/chapters.json + chapter-content/* + glossary.json + quiz/*
            │
            ▼
 assets/js/data-bundle.js + assets/js/quiz-bundle.js
```

### 4.2 分层说明
- **展示层**：5 个静态 HTML 页面 + `main.css` / `chapter-detail.css`。
- **逻辑层**：`app.js`（单文件核心，无框架），负责 SPA 式路由、内容渲染、搜索、主题切换、图标注入、缓存戳校验。
- **数据层**：`data-bundle.js`（构建产物，内联章节目录 / 术语 / 题库；章节正文根据构建参数选择内联或按需 fetch）；`data/chapter-content/NN.json` 为章节正文权威源。
- **构建层**：Python 脚本把 `data/` 下的 JSON 聚合并写入 `assets/js/`；Node 脚本做回归与 emoji 校验。支持双形态构建：默认内联（本地 file://）与 `INCLUDE_CONTENT=0`（Cloudflare Pages 生产环境按需加载）。
- **无服务端**：部署形态为任意静态文件服务，无 API、无数据库。当前生产环境使用 Cloudflare Pages。

### 4.3 数据驱动渲染流（时序）
1. 浏览器加载 `index.html`，引入 `data-bundle.js`，得到 `window.__SITE_DATA__`。
2. `app.js` 渲染首页：章节卡片网格（来自 `chapters`）、术语云、题库入口、OEM 车厂展示。
3. 用户点击某章 → `chapter.html?id=NN`。
4. `app.js` 解析 `id`，`fetch('data/chapter-content/NN.json')` 获取正文（默认不内联以瘦身首屏）。
5. 按 `content_blocks[].type` 分派渲染函数，逐块输出 DOM。
6. 交叉引用 `[[NN-slug]]` 由 `escLink()` 解析为站内跳转。

### 4.4 目录结构（权威）

```
vehicle-test-site/
├── index.html                 # 首页
├── chapters.html              # 章节总览
├── chapter.html               # 章节详情（?id=NN 路由）
├── glossary.html              # 术语表
├── quiz.html                  # 题库中心
├── components-preview.html    # 组件/样式预览（内部）
├── ee-evolution-preview.html  # 电气架构演进预览（内部）
├── quiz-prototype.html        # 题库原型（内部）
├── README.md                  # 本文档
├── DEPLOY.md                  # 部署运维手册
├── assets/
│   ├── css/
│   │   ├── main.css           # 设计 Token（:root）、布局、组件、主题
│   │   └── chapter-detail.css  # 章节详情样式（含 .kb-sim* 仿真部件）
│   ├── js/
│   │   ├── app.js             # 核心逻辑（路由/渲染/搜索/主题/图标/缓存戳）
│   │   ├── data-bundle.js      # 构建产物：章节目录+术语+题库+章节正文（默认内联）
│   │   └── quiz-bundle.js      # 构建产物：题库（questions/chapters/knowledgePoints）
│   ├── images/                # 全部本地图片（png/svg，含 oem-*.svg 车厂 Logo）
│   └── version.json           # 当前缓存版本号
├── data/
│   ├── chapters.json          # { modules, chapters[55] } 章节元数据
│   ├── glossary.json          # 91 条术语
│   ├── chapter-content/       # 55 个 NN.json 章节正文（权威源）
│   └── quiz/                  # 每章一题 NN.json，构建为 quiz-bundle.js
└── tools/                     # 构建 / 校验 / 内容注入脚本
    ├── build_data_bundle.py    # 数据聚合（日常必须）
    ├── bump_version.py         # 缓存戳（日常必须）
    ├── regression_check.js     # 回归校验（质量门）
    ├── scan_emoji.js           # emoji 扫描（质量门）
    └── _*.py / *.js            # 一次性内容注入脚本（非门禁）
```

---

## 5. 技术栈与运行时依赖

| 类别 | 选型 | 说明 |
|------|------|------|
| 前端 | HTML5 + CSS3 + 原生 JavaScript（ES2020） | 无框架、无打包器 |
| 数据格式 | JSON | UTF-8，无 BOM |
| 构建 | Python 3.12+ | `build_data_bundle.py`、`bump_version.py` |
| 校验 | Node.js 22+ | `regression_check.js`、`scan_emoji.js` |
| 图标 | 内联 SVG（`app.js` 的 `ICON(name)`） | 禁止 emoji 作 UI 图标 |
| 图片 | 本地 PNG / SVG | 禁止外部图片 |
| 部署 | Cloudflare Pages（主用）/ 任意静态服务器 / CloudStudio 快照 | 无容器编排 |

**依赖最小化原则**：不引入前端 CDN、不引入运行时第三方 JS 库，保证离线可用与供应链安全。

---

## 6. 数据模型与 Schema 参考

> 所有 JSON 使用 UTF-8、2 空格缩进、无尾随逗号。修改后必须重跑 `build_data_bundle.py`。

### 6.1 `data/chapters.json`（章节目录）
顶层对象：
```json
{
  "modules": [ { "id":"A", "name":"网络与协议", "color":"#2563EB" }, ... ],
  "chapters": [ { /* 见下 */ }, ... ]   // 长度 55
}
```
`chapters[]` 单条字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `num` | int | ✓ | 章节序号（1–55，决定 `?id=` 与文件名 `NN.json`） |
| `slug` | string | ✓ | URL 友好短名，用于交叉引用 `[[NN-slug]]` |
| `title` | string | ✓ | 章节标题 |
| `star` | string | — | 标记，如 `"核心"` / `"⭐核心工具"` |
| `difficulty` | string | — | 难度，如 `"核心"` / `"进阶"` |
| `module` | string | ✓ | 模块字母 `A`–`F` 或 `R` |
| `moduleName` | string | ✓ | 模块中文名 |
| `color` | string | ✓ | 模块主题色（hex） |
| `oneliner` | string | ✓ | 一句话简介（卡片副标题） |
| `tags` | string[] | — | 标签 |
| `kp` | int | ✓ | 知识点数量（卡片展示） |
| `minutes` | int | — | 预计阅读分钟数 |
| `sections` | string[] | ✓ | 本节标题列表（目录用） |
| `summary` | string | ✓ | 章节摘要 |

### 6.2 `data/chapter-content/NN.json`（章节正文，权威源）
```json
{
  "num": 8,
  "slug": "CANoe",
  "title": "CANoe ⭐核心工具",
  "oneliner": "……",
  "summary": "……",
  "prev_chapter": 7,
  "next_chapter": 9,
  "sections": [
    {
      "title": "四、仿真面板设计（Panel）",
      "content_blocks": [ /* 见 6.3 */ ]
    }
  ]
}
```
| 字段 | 说明 |
|------|------|
| `num` / `slug` / `title` / `oneliner` / `summary` | 与 `chapters.json` 对应条目保持一致 |
| `prev_chapter` / `next_chapter` | 上/下章序号，用于详情页导航 |
| `sections[]` | 章节内的小节数组；每节含 `title` 与 `content_blocks[]` |

### 6.3 内容块（content block）类型与字段

| `type` | 必备字段 | 可选字段 | 说明 |
|--------|----------|----------|------|
| `paragraph` | `text` | — | 段落；支持 `**加粗**`、行内 `code`、交叉引用 `[[NN-slug]]` |
| `h3` | `text` | — | 三级标题 |
| `h4` | `text` | — | 四级标题（步骤级） |
| `table` | `headers[]`, `rows[][]` | — | 表格；`rows` 为二维字符串数组 |
| `list` | `items[]` | `ordered` | 列表；`items` 为字符串数组 |
| `blockquote` | `text` | `style` | 引用块；`style`∈`warning`/`concept`/`面试说`/`承上` 等 |
| `code` | `code` | `language` | 代码块；超长自动折叠 |
| `image` | `src` | `alt`, `caption` | 图片；`src` **必须**为本地 `assets/images/...` |
| `review` | — | — | 本章复习小结块 |
| `sim` | `sim` | 多 | 交互仿真；`sim`∈`bittiming`/`framedemo`/`wiredand`/`busload`/`canoe` |
| `hr` | — | — | 分隔线 |
| `flow` / `diagram` / `topology` / `case` / `dtc` / `svc-cards` / `ee-evolution` / `summary` | 依部件而定 | — | 特定可视化部件，详见 `app.js` 渲染器 |

> **图片纪律（强制）**：`image.src` 只能引用本地相对路径 `assets/images/xxx.png|svg`。**禁止** `http(s)://` 或 `//domain` 外部图片。

### 6.4 `data/glossary.json`（术语表）
数组，每条：`{ "term", "en?", "category", "definition", "relates?"[] }`。`category` 用于分类筛选（基础/协议/物理/文件/诊断/工具/域系统/标准/测试/架构/安全）。

### 6.5 `data/quiz/NN.json`（题库，每章一题）
数组，每条题型：
- 单选 `type:"single"` / 多选 `type:"multiple"`：`{ question, options[], answer[] }`
- 判断 `type:"bool"`：`{ question, answer:true|false }`
- 简答 `type:"short"`：`{ question, answer(要点) }`
红线：题库**无分数、无百分比、无进度条**；`localStorage` 仅记录掌握标记（`know`/`review`）。改数据后跑 `normalize_quiz.py` 再构建，并跑 `tools/quiz_smoke_test.js`。

---

## 7. 前端渲染与路由

- **路由方式**：基于 `location.search` 的轻量路由（`?id=NN`），非 History API，兼容静态托管与 `file://`。
- **渲染分派**：`app.js` 维护 `type → render(block)` 映射；新增内容块类型须同步扩展渲染器与 `regression_check.js`。
- **交叉引用**：正文中的 `[[NN-slug]]` 由 `escLink()` 转为 `<a href="chapter.html?id=NN">`；在段落 / h3 / h4 / 引用 / 列表 / 回顾块中生效，**代码块与表格单元格内不解析**（避免误转义）。
- **零填充兼容**：`?id=02` 等价 `?id=2`，由 `parseInt` 解析，保证 `[[02-CAN总线]]` 类链接有效。

---

## 8. 设计规范

### 8.1 设计 Token
所有新样式必须走 `main.css :root` 中的 Token，禁止散写 px 值：
- 字阶：`--fs-*`；间距：`--space-*`（4px 基准）；圆角、阴影、颜色均以变量声明。

### 8.2 模块配色表（权威）

| 模块 | 含义 | 颜色 |
|------|------|------|
| A | 网络与协议 | `#2563eb` |
| B | 工具与仿真 | `#06b6d4` |
| C | 协议深度 | `#8b5cf6` |
| D | 诊断与测试 | `#f59e0b` |
| E | 域系统 | `#10b981` |
| F | 缺陷/标准 | `#ef4444` |
| R | 综合/路线图 | `#ec4899` |

### 8.3 能力分级
`L0(R) · L1(A,B,C) · L2(D,E) · L3(F)`。卡片与导航按此分级着色与排序。

### 8.4 主题
- 提供亮色 / 暗色 / 跟随系统三态，切换即时、无闪烁。
- 暗色保留"钛金霓虹"金主题（标题金 `#f6e0b3`），仅修正内部不一致。

### 8.5 图标系统
- UI 图标统一使用 `app.js` 的 `ICON(name)` 内联描边 SVG（`fill:none; stroke=currentColor; viewBox="0 0 24 24"`，输出 `<svg class="ui-ic">`）。
- **禁止 emoji 作 UI 图标**（内容正文内的 emoji 豁免）。
- `.ui-ic{width:1em;height:1em}` 随父级缩放；搜索按钮特例 18px。

### 8.6 可访问性（WCAG 2.1 AA）
- 语义化标签、对比度达标、图片 `alt` 必填、可键盘操作、主题切换不丢失焦点。

---

## 9. 本地开发环境

### 9.1 环境要求
- Python 3.12+（构建与缓存戳）
- Node.js 22+（质量门）
- 任意静态服务器（推荐 `python -m http.server`）

### 9.2 常用命令
```bash
# 数据改动后重建 bundle
python build_data_bundle.py

# 质量门（失败=0 / 警告=32 基线）
node tools/regression_check.js
node tools/scan_emoji.js

# 改 CSS/JS/数据/图片后 bump 缓存戳
python tools/bump_version.py

# 本地预览
python -m http.server 8080   # 访问 http://localhost:8080/index.html
```

### 9.3 `file://` 浏览
直接双击 `chapter.html` 用 `file://` 打开时，浏览器会禁止 `fetch` 本地 JSON。因此 `build_data_bundle.py` 默认已将章节正文内联进 `data-bundle.js`，直接 `python build_data_bundle.py` 即可支持 `file://` 离线打开。若希望恢复按需 fetch（缩小 bundle 体积），可显式设置 `INCLUDE_CONTENT=0 python build_data_bundle.py`，但此时必须通过本地服务器访问，不能用 `file://` 双击打开。

---

## 10. 内容创作指南（Runbook）

### 10.1 新增一章
1. 在 `data/chapters.json` 的 `chapters[]` 追加一条（字段见 6.1），`num` 取当前最大+1。
2. 新建 `data/chapter-content/NN.json`（NN 与 `num` 一致，零填充两位如 `08.json`），结构见 6.2。
3. 如需同章题库，新建 `data/quiz/NN.json`（见 6.5），跑 `normalize_quiz.py`。
4. 重跑 `build_data_bundle.py`，确认 `regression_check.js` 通过。

### 10.2 新增术语
向 `data/glossary.json` 追加一条，填写 `term`/`category`/`definition`；重跑构建（术语会进入 `data-bundle.js`）。

### 10.3 新增/修改图片
1. 图片放入 `assets/images/`，命名语义化（如 `dbc-importwizard.png`、`panel-control-7.png`）。
2. 在 `content_blocks` 中以 `{ "type":"image", "src":"assets/images/xxx.png", "alt":"...", "caption":"..." }` 引用。
3. **严禁外部图片**；SVG 优先（矢量、体积小）。

### 10.4 交叉引用
正文写 `[[NN-slug]]` 即可跳转；`slug` 须与 `chapters.json` 中对应条目的 `slug` 一致。

### 10.5 内容块去重陷阱
批量 `append` 块时加"是否已存在"守卫；**绝不用 `(type,style,text)` 去重**（table/code/case/flow/hr/list 无 `text` 会塌成同一 key 误删）。改动后比对基线块数。

---

## 11. 质量保障

### 11.1 质量门（强制）
| 步骤 | 命令 | 通过标准 |
|------|------|----------|
| 构建 | `python build_data_bundle.py` | 输出 `chapters=55 / chapterContent=55 / glossary=91` |
| 回归 | `node tools/regression_check.js` | 失败=0 / 警告=32（基线） |
| emoji | `node tools/scan_emoji.js` | UI 层 3 命中（均 `app.js` 正则豁免） |

### 11.2 回归脚本说明
`regression_check.js` 校验：54/55 章结构、章节内容块数、块类型渲染、交互逻辑单元（折叠/搜索/分级/术语正则）、封面渲染等。新增内容块类型须同步扩展其断言。

### 11.3 emoji 规范
UI 图标禁 emoji；`scan_emoji.js` 对代码内正则命中的 `✅/✓/√` 等做豁免。若 UI 层出现非豁免 emoji，视为缺陷。

### 11.4 持续集成建议
- 提交前本地跑完 11.1 三步。
- CI（如有）在 PR 阶段跑 `regression_check.js` + `scan_emoji.js`，任一非零即阻断合并。

---

## 12. 安全与合规

- **无外部依赖**：不加载任何第三方 JS/CSS/字体/图片，规避供应链与隐私风险。
- **无用户数据收集**：纯静态，无埋点、无账户、无服务端存储。
- **本地优先**：`data-bundle.js` 默认内联全部章节正文，支持 `file://` 完全离线运行。
- **内容合规**：车厂 Logo 使用自绘矢量标识，不打包第三方商标位图。

---

## 13. 性能预算

| 指标 | 目标 | 备注 |
|------|------|------|
| 首屏 JS（data-bundle） | < 100 KB（gzip） | 正文默认不内联 |
| 图片 | 优先 SVG；PNG 控制尺寸 | OEM Logo 为内联式 SVG |
| 交互流畅度 | 60fps | 主题切换/搜索无卡顿 |
| 可访问性 | WCAG 2.1 AA | 对比度/键盘可达 |

---

## 14. 术语表（文档内）

| 术语 | 含义 |
|------|------|
| SPA | 单页应用（本站为轻量多页 + 客户端路由） |
| Bundle | 构建产物 `data-bundle.js` / `quiz-bundle.js` |
| 内容块 | `content_blocks[]` 中的最小渲染单元 |
| 缓存戳 | `?v=` / `__CONTENT_VERSION__`，用于打破浏览器缓存 |
| OEM | 整车厂（Original Equipment Manufacturer） |

---

## 15. 常见问题 FAQ

**Q1：改了内容线上没变？**
未跑 `bump_version.py`，或 Cloudflare Pages 构建尚未完成。改完必 bump，push 到 `main` 后等 CF 构建完成，用户硬刷新（Ctrl/Cmd+Shift+R）。

**Q2：章节点进去空白？**
`?id=NN` 对应的 `data/chapter-content/NN.json` 缺失或编号与 `chapters.json` 不一致；确认文件存在且 `num` 匹配。

**Q3：图片碎图？**
`src` 漏写扩展名，或文件不在 `assets/images/`；发布前跑回归校验可拦截。

**Q4：能不能用 React/Vue？**
当前为刻意的无框架纯静态方案，以降低依赖、保证离线。如需框架化属重大架构变更，不在本文范围。

---

## 附录 A：内容块类型速查
`paragraph` · `h3` · `h4` · `table` · `list` · `blockquote` · `code` · `image` · `review` · `sim` · `hr` · `flow` · `diagram` · `topology` · `case` · `dtc` · `svc-cards` · `ee-evolution` · `summary`

## 附录 B：模块与能力分级映射
A(网络协议/L1) · B(工具仿真/L1) · C(协议深度/L1) · D(诊断测试/L2) · E(域系统/L2) · F(缺陷标准/L3) · R(综合/L0)
