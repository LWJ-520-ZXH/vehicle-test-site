# 车载测试学堂网站 · 部署运维手册

> **文档级别**：对外发布版（Operations / SRE Runbook）
> **适用范围**：运维、发布负责人、审校及外部托管方

| 项目 | 内容 |
|------|------|
| 文档编号 | VT-SITE-OPS-002 |
| 版本 | V1.2 |
| 发布日期 | 2026-08-14 |
| 责任人（Owner） | 车载测试学堂运维组 |
| 文档状态 | 正式发布（Released） |
| 密级 | 公开（Public） |
| 关联文档 | 《产品技术文档 README.md》 |

## 修订记录

| 版本 | 日期 | 修订人 | 说明 |
|------|------|--------|------|
| V1.0 | 2026-08-10 | 运维组 | 初版发布流程与常见问题 |
| V1.1 | 2026-08-10 | 运维组 | 按企业对外标准扩写：环境矩阵、pre-flight 清单、缓存机制深挖、多部署形态、回滚、故障分级、安全基线 |
| V1.2 | 2026-08-14 | 运维组 | 生产环境迁移至 Cloudflare Pages；新增双形态构建（本地内联 vs CI 按需加载）；更新环境矩阵、部署方式、Runbook、FAQ |

> **文档同步维护约定（P0）**：本站点任何迭代变动（新增/调整章节、修改数据模型、调整质量门基线、变更部署形态等），都必须同步更新本文件与《产品技术文档 README.md》中的对应数字与章节，保持文档与代码/数据持续一致。当前基线数字：chapters=55、chapterContent=55、glossary=91、quiz=404；质量门 regression 失败=0/警告=32、scan_emoji UI 层=3（豁免）。

---

## 1. 概述

### 1.1 目标
定义本站点从构建到上线的标准流程、环境矩阵、回滚方案与故障处置，确保**每次发布可重复、可验证、可回退**。

### 1.2 范围
- 适用：将 `vehicle-test-site/` 作为静态资源托管到任意环境。
- 涵盖：构建、质量门、缓存戳、部署形态、验证、回滚、监控、故障排查、安全基线。

### 1.3 部署原则
- **不可变快照**：线上运行的是某次部署时刻的目录副本，不就地修改。
- **先校验后发布**：未通过质量门（第 4 节）的构建物禁止上线。
- **可回退**：任何发布都必须有对应的回滚路径（第 8 节）。

---

## 2. 环境矩阵

| 环境 | 用途 | 托管方式 | 访问 | 构建方式 | 数据来源 |
|------|------|----------|------|----------|----------|
| Local | 开发自测 / file:// 双击 | 本地文件系统 | `file:///E:/PythonProject/vehicle-test-site/*.html` | 默认内联（`python build_data_bundle.py`） | 工作区源码 |
| Staging（建议） | 发布前验证 | 同 Prod 形态 | 内网/预览地址 | `INCLUDE_CONTENT=0` | 构建产物 |
| **Prod（主用）** | **对外服务** | **Cloudflare Pages** | **`https://vehicle-test-site.pages.dev`** | **`INCLUDE_CONTENT=0 python3 build_data_bundle.py`** | GitHub `main` 分支 |
| Prod-Backup | 演示/快照 | CloudStudio 快照 | 每次 `shareLink` | 默认内联 | 构建产物 |

> 本仓库当前**主用 Cloudflare Pages 生产部署**；CloudStudio 快照保留为调试/演示备用。其余静态服务器形态见第 6.2 节。

---

## 3. 发布前置检查清单（Pre-flight）

发布前逐项确认（✅/❌）：

- [ ] 内容/样式/图片改动已完成
- [ ] 已运行 `python build_data_bundle.py` 且输出 `chapters=55 / chapterContent=55 / glossary=91`
- [ ] 已运行 `node tools/regression_check.js`，**失败=0 / 警告=32**
- [ ] 已运行 `node tools/scan_emoji.js`，UI 层命中仅 3（豁免）
- [ ] 已运行 `python tools/bump_version.py`
- [ ] 全站无外部（http/https）图片引用（见第 11 节排查口径）
- [ ] 本地预览自测通过（章节/搜索/术语/题库/主题/图片）
- [ ] 已确认本次部署目标：Cloudflare Pages 生产站 `https://vehicle-test-site.pages.dev`，或 CloudStudio 快照 `shareLink`

任一未勾选，**暂停发布**。

---

## 4. 构建与质量门

### 4.1 构建（必跑）
```bash
cd vehicle-test-site
python build_data_bundle.py
```
预期输出：
```
OK 写入 .../assets/js/data-bundle.js  chapters=55  chapterContent=55  glossary=91
OK 写入 .../assets/js/quiz-bundle.js  questions=404  chapters=18  knowledgePoints=156
```
失败处置：检查 `data/` 下 JSON 是否非法（引号/逗号/编码）；修复后重跑。

### 4.2 回归校验（必跑）
```bash
node tools/regression_check.js
```
通过标准：`失败=0 / 警告=32`（警告为已知基线，如空渲染块、薄章标注，非阻断）。
失败处置：查看失败项明细，定位章节/块类型，修复内容或渲染器后重跑。

### 4.3 emoji 扫描（必跑）
```bash
node tools/scan_emoji.js
```
通过标准：`TOTAL UI-LAYER EMOJI HITS = 3`（均为 `app.js` 内正则豁免）。
失败处置：若 UI 层出现非豁免 emoji，定位文件替换为 `ICON()` 内联 SVG。

---

## 5. 缓存与版本戳机制

### 5.1 为什么需要缓存戳
浏览器会缓存静态资源（JS/CSS/图片）。若只改文件不换戳，用户会长期命中旧版本，表现为"改了没生效"。

### 5.2 `bump_version.py` 做了什么
1. 生成秒级版本号写入 `assets/version.json`。
2. 同步 5 个 HTML（`index/chapters/chapter/glossary/quiz`）中 JS/CSS 引用的 `?v=` 查询戳。
3. 更新 `app.js` 内的 `__CONTENT_VERSION__` 哨兵（用于运行时一致性校验）。

### 5.3 工作原理
资源以 `app.js?v=20260810215052` 形式请求；戳变更 → URL 变更 → 浏览器视为新资源 → 重新下载。旧戳资源在 CDN/浏览器侧自然过期。

> **铁律**：改了 CSS / JS / `data/` / `assets/images/` 中任一，发布前**必须** bump。

---

## 6. 部署方式

### 6.1 Cloudflare Pages（主用·生产环境）

**项目配置**：
- GitHub 仓库：`https://github.com/LWJ-520-ZXH/vehicle-test-site`
- 生产分支：`main`
- 构建命令：`INCLUDE_CONTENT=0 python3 build_data_bundle.py`
- 输出目录：`.`（仓库根目录）
- 生产地址：**`https://vehicle-test-site.pages.dev`**

**为什么用这个命令**：
- `INCLUDE_CONTENT=0` 表示 `data-bundle.js` 只内联章节索引、术语表、题库，**不内联 chapterContent**。`chapter.html` 会在用户点击章节时按需 fetch `data/chapter-content/NN.json`。
- 这样首屏 bundle 仅约 **77KB**，配合 Cloudflare CDN/压缩/HTTP2，首屏加载远快于 975KB 全量内联版。
- 本地 `file://` 双击场景仍用默认 `python build_data_bundle.py`（全量内联），避免 CORS 问题。

**发布流程**：
1. 本地改动并通过第 3、4 节质量门。
2. `git add . && git commit -m "..." && git push origin main`
3. Cloudflare Pages 自动触发构建（约 1–2 分钟）。
4. 构建完成后访问 `https://vehicle-test-site.pages.dev`；若缓存戳未更新，用户硬刷新（Ctrl/Cmd+Shift+R）。

### 6.2 CloudStudio 快照部署（调试/演示备用）
调用部署能力，参数：
- `directory`：`E:\PythonProject\vehicle-test-site`
- `entry`：`index.html`

返回 `shareLink`（verified=true 为权威可访问地址）。

注意事项：
- **快照语义**：只上传"调用时刻"的目录。改完站点**必须重新部署**才能刷新线上。
- **地址会变化**：沙箱存活期内可能原地刷新（返回相同 URL）；过期或重部署会返回**全新** `sandboxId` + 域名。以**每次部署返回的 `shareLink`** 为准，禁止硬编码旧地址。
- **偶发 400**：部署接口偶发返回 `400`，直接重试一次即可（已知现象，重试成功率高）。

### 6.3 任意静态服务器（备选）
本站为纯静态，可托管到 Nginx / OSS+CDN / Vercel。要点：
- Web 根 = `vehicle-test-site/`（含 `index.html`）。
- 正确 MIME：`.json`/`.js`/`.svg`/`.png` 默认即可。
- 若托管形态支持服务器（非 file://），建议用 `INCLUDE_CONTENT=0` 构建以减小首屏体积；若仅供本地双击，用默认内联。
- 上线前跑完第 3、4 节。

**Nginx 示例**：
```nginx
server {
  listen 80;
  server_name vt.example.com;
  root /var/www/vehicle-test-site;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
  # 资源带 ?v= 戳，可长缓存
  location ~* \.(js|css|png|svg|json)$ { add_header Cache-Control "public, max-age=86400"; }
}
```

**OSS / Vercel**：直接推送 `vehicle-test-site/` 到 Bucket 根或项目根，开启静态托管。

---

## 7. 发布 Runbook（标准流程）

### 7.1 Cloudflare Pages 生产发布

```
1. 在本地工作区完成内容/代码改动
2. python build_data_bundle.py          # 本地构建（默认内联，用于 file:// 自测）
3. node tools/regression_check.js        # 质量门①
4. node tools/scan_emoji.js              # 质量门②
5. python tools/bump_version.py          # 缓存戳
6. （可选）本地 python -m http.server 8080 自测
7. git add . && git commit -m "..." && git push origin main
8. 等待 Cloudflare Pages 自动构建完成（约 1–2 分钟）
9. 访问 https://vehicle-test-site.pages.dev 执行第 9 节冒烟测试
10. 通知相关方新内容已上线
```

### 7.2 CloudStudio 快照发布（备用）

```
1. 在本地工作区完成内容/代码改动
2. python build_data_bundle.py          # 构建（默认内联）
3. node tools/regression_check.js        # 质量门①
4. node tools/scan_emoji.js              # 质量门②
5. python tools/bump_version.py          # 缓存戳
6. （可选）本地 python -m http.server 自测
7. 调用部署（CloudStudio 快照）
8. 拿到 shareLink
9. 执行第 9 节冒烟测试
10. 通知相关方新地址（如地址变化）
```

回滚见第 8 节；故障见第 11 节。

---

## 8. 回滚方案

| 场景 | 方案 | 影响 |
|------|------|------|
| 内容错误/渲染异常 | 重新部署**上一版已知良好**构建产物（保留历史构建目录或 Git tag） | 秒级，用户硬刷新即恢复 |
| 缓存戳误发 | 将 `assets/version.json` 与 5 个 HTML 的 `?v=`、app.js `__CONTENT_VERSION__` 回退到上一版本号，重新部署 | 中 |
| 部署地址失效（沙箱过期） | 重新调用部署获取新 `shareLink`，更新对外入口 | 用户需使用新地址 |

> 最佳实践：每次发布前用 Git 打 tag 或保留上一版 `assets/js/` 与 `data/` 快照，确保可一键回退。

---

## 9. 部署后验证（Smoke Test）

发布后逐项确认（✅/❌）：
- [ ] 首页可打开，`shareLink` 返回 200
- [ ] 章节卡片可点击进入详情，`?id=` 路由正常
- [ ] 搜索可用，命中正确章节
- [ ] 术语表可查，分类筛选正常
- [ ] 题库可答题，无脚本报错（控制台无红）
- [ ] 暗色主题切换正常、无闪烁
- [ ] 抽查 3–5 张图片正常显示（无碎图）
- [ ] 抽查 1 章含仿真部件（如 CANoe）可交互
- [ ] 控制台无 404（重点 `data/chapter-content/NN.json`、`assets/images/*`）

验证命令（可选）：
```bash
curl -sI https://<shareLink>/index.html | head -1
curl -s https://<shareLink>/data/chapter-content/08.json | grep -o "panel-[a-z0-9-]*\.png" | head
```

---

## 10. 监控与告警建议

- **可用性**：对 `index.html` 与 `data-bundle.js` 做 HTTP 探活（5xx / 超时告警）。
- **资源完整性**：定时抓取 `08.json`，断言关键图片 `src` 对应文件 200。
- **控制台错误**：前端可接轻量错误上报（当前无服务端，建议仅本地日志或第三方 RUM，须告知用户）。
- **缓存一致性**：发布后比对线上 `__CONTENT_VERSION__` 与构建版本号是否一致。

---

## 11. 故障排查（分级）

### 11.1 严重度定义
| 等级 | 定义 | 响应 |
|------|------|------|
| S1 | 全站不可用 / 首页 5xx | 立即回滚 + 告警 |
| S2 | 核心功能失效（章节空白、搜索挂） | 1 小时内修复 |
| S3 | 局部样式/单图异常 | 排期修复 |

### 11.2 症状—根因—处置

| 症状 | 根因 | 处置 |
|------|------|------|
| 首页 5xx / 打不开 | CF Pages 构建失败 / DNS 未生效 / 沙箱过期 | 查看 CF 构建日志；S1 立即回滚 |
| 改了内容线上没变 | 未 bump 缓存戳 / CF 构建未结束 / 未 push 到 main | push 后等构建完成；跑 `bump_version.py`；用户硬刷新 |
| 章节进不去/空白 | `NN.json` 缺失或 `num` 与 `chapters.json` 不一致；或 file:// 用了非内联版 | 确认文件存在、编号匹配；本地用默认内联构建；重部署 |
| 图片碎图 / 404 | `src` 漏扩展名、文件不在 `assets/images/`、或误引用外部图片 | 补文件/扩展名；全站禁外部图片；重部署 |
| 出现外部图片破图 | 误写 `http(s)://` 或 `//domain` | 改为本地 `assets/images/`；重建 bundle |
| UI 图标位出现 emoji | 误用 emoji 当图标 | 改用 `ICON(name)` 内联 SVG |
| 部署返回 400 | 偶发 | 直接重试部署 |
| 地址失效 | 沙箱过期 | 重新部署取新 `shareLink` |

---

## 12. 安全基线

- **纯静态、无服务端**：无 RCE/注入面；无需 WAF 规则例外。
- **无第三方运行时**：不加载外部 JS/CSS/字体，规避供应链攻击。
- **Cloudflare 已自动添加安全头**：`X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`Access-Control-Allow-Origin: *`。
- **建议响应头**（如有网关/CDN 可进一步加固）：
  ```
  Content-Security-Policy: default-src 'self'; img-src 'self' data:;
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  ```
- **无用户数据**：不涉及 PII 收集与存储。

---

## 13. 容量与成本

- 站点为纯静态小体积（CF Pages 生产版 bundle ≈77KB、图片多为 SVG/PNG 压缩），Cloudflare Pages 免费档已覆盖日常流量。
- CloudStudio 沙箱保留为调试/演示入口，按平台规则过期释放。

---

## 14. 常见问题 FAQ

**Q1：为什么 Git push 后线上还没变？**
Cloudflare Pages 需要 1–2 分钟完成构建和全球边缘刷新。请在 CF 控制台查看构建日志，或在浏览器中硬刷新（Ctrl/Cmd+Shift+R）。若仍未变，检查是否忘了 `python tools/bump_version.py`。

**Q2：Cloudflare Pages 地址会变吗？**
不会。`https://vehicle-test-site.pages.dev` 是固定域名（除非你修改项目名）。旧 CloudStudio 沙箱地址才会变化。

**Q3：能不能免服务器用 file:// 打开？**
可以。本地用默认命令 `python build_data_bundle.py`，它会将章节正文内联进 `data-bundle.js`，然后直接双击 HTML 即可离线浏览。**不要**在本地 file:// 场景使用 `INCLUDE_CONTENT=0`，否则章节内容会因 CORS 而空白。

**Q4：Cloudflare Pages 收费吗？**
当前免费档已够用（无限请求、慷慨的构建分钟数）。如流量极大再考虑付费档。

**Q5：CloudStudio 快照还要保留吗？**
保留作为调试/演示备用。主用地址仍是 `https://vehicle-test-site.pages.dev`。

---

## 附录：命令速查表

| 目的 | 命令 |
|------|------|
| 构建 | `python build_data_bundle.py` |
| 回归 | `node tools/regression_check.js` |
| emoji 扫描 | `node tools/scan_emoji.js` |
| 缓存戳 | `python tools/bump_version.py` |
| 本地预览 | `python -m http.server 8080` |
| 内联正文（默认，支持 file://） | `python build_data_bundle.py` |
| 跳过内联（需本地服务器） | `INCLUDE_CONTENT=0 python build_data_bundle.py` |
| 题库规范化 | `python tools/normalize_quiz.py` |
| 题库冒烟 | `node tools/quiz_smoke_test.js` |
| 生产部署 | Cloudflare Pages：GitHub `LWJ-520-ZXH/vehicle-test-site`，Build=`INCLUDE_CONTENT=0 python3 build_data_bundle.py`，Output=`.` |
| 快照部署 | CloudStudio 快照部署（directory=`vehicle-test-site`, entry=`index.html`） |
