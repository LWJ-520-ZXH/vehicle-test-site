#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
车载测试学堂 · 数据打包脚本（免服务器 file:// 直接打开）
- 把 data/chapters.json 与 data/chapter-content/NN.json 全部打进 assets/js/data-bundle.js
- 设置 window.__SITE_DATA__ = { chapters, chapterContent:{ '01':{}, ... } }
- 另把 data/quiz/NN.json 单独打进 assets/js/quiz-bundle.js（window.__QUIZ_DATA__）
  题库体量大，独立成包，只有 quiz.html 引用，不拖累首页/章节页首屏
- app.js 优先用 bundle，缺失时回退 fetch（兼容仍走 http 服务的场景）
用法:  python build_data_bundle.py   （数据有改动后重跑即可）
"""
import json
import os
import glob
import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, "data")
OUT = os.path.join(ROOT, "assets", "js", "data-bundle.js")
QUIZ_OUT = os.path.join(ROOT, "assets", "js", "quiz-bundle.js")

# 1) 章节索引
with open(os.path.join(DATA, "chapters.json"), encoding="utf-8") as f:
    chapters_data = json.load(f)
chapters = chapters_data.get("chapters", []) if isinstance(chapters_data, dict) else chapters_data

# 2) 章节内容（按 2 位编号归档，与 app.js 的 padded 取法一致）
content = {}
for path in sorted(glob.glob(os.path.join(DATA, "chapter-content", "*.json"))):
    name = os.path.splitext(os.path.basename(path))[0]
    with open(path, encoding="utf-8") as f:
        content[name] = json.load(f)

# 3) 术语表（避免 file:// 下 fetch 被 CORS 拦截，一并打进 bundle）
glossary = []
glossary_path = os.path.join(DATA, "glossary.json")
if os.path.exists(glossary_path):
    with open(glossary_path, encoding="utf-8") as f:
        glossary = json.load(f).get("glossary", [])

# 章节内容默认内联进 bundle（P0 运营约定：用户日常通过 file:// 双击打开，
# 浏览器禁止 fetch 本地 JSON，必须内联否则整章内容空白）。
# 仅当显式设 INCLUDE_CONTENT=0 时才不内联（首屏瘦身，但需走 http 服务）。
INCLUDE_CONTENT = os.environ.get("INCLUDE_CONTENT", "1") == "1"
bundle = {
    "chapters": chapters,
    "chapterContent": content if INCLUDE_CONTENT else {},
    "glossary": glossary,
}

with open(OUT, "w", encoding="utf-8") as f:
    f.write("/* 自动生成：章节数据打包，用于 file:// 免服务器直接打开。勿手改，改数据后重跑 build_data_bundle.py */\n")
    f.write("window.__SITE_DATA__ = ")
    json.dump(bundle, f, ensure_ascii=False, separators=(",", ":"))
    f.write(";\n")

print(f"OK 写入 {OUT}  chapters={len(chapters)}  chapterContent={len(content)}  glossary={len(glossary)}")


# ============================================================
# 4) 题库打包 → assets/js/quiz-bundle.js
# ============================================================
modules_def = chapters_data.get("modules", {}) if isinstance(chapters_data, dict) else {}
ch_index = {c["num"]: c for c in chapters}

questions = []
per_chapter = {}
for path in sorted(glob.glob(os.path.join(DATA, "quiz", "*.json"))):
    num = int(os.path.splitext(os.path.basename(path))[0])
    with open(path, encoding="utf-8") as f:
        qs = json.load(f)
    if not isinstance(qs, list):
        raise SystemExit(f"题库格式错误（顶层应为数组）: {path}")
    questions.extend(qs)
    src = ch_index.get(num, {})
    per_chapter[num] = {
        "num": num,
        "title": src.get("title", f"第{num}章"),
        "slug": src.get("slug", ""),
        "module": src.get("module", qs[0]["module"] if qs else ""),
        "color": src.get("color", ""),
        "qCount": len(qs),
        "kpCount": len({q["sectionIndex"] for q in qs}),
    }

# 模块维度汇总：全 7 模块都列出，无题的给 0（题库页模块选择器要展示完整学习路径）
mod_stat = {}
for key, meta in modules_def.items():
    chs = [c for c in per_chapter.values() if c["module"] == key]
    mod_stat[key] = {
        "key": key,
        "name": meta.get("name", key),
        "desc": meta.get("desc", ""),
        "color": meta.get("color", ""),
        "qCount": sum(c["qCount"] for c in chs),
        "chapterCount": len(chs),
        "totalChapters": sum(1 for c in chapters if c.get("module") == key),
    }


def _tally(field):
    out = {}
    for q in questions:
        out[q[field]] = out.get(q[field], 0) + 1
    return out


quiz_bundle = {
    "meta": {
        "total": len(questions),
        "kpTotal": sum(c["kpCount"] for c in per_chapter.values()),
        "chapterCount": len(per_chapter),
        "generatedAt": datetime.date.today().isoformat(),
        "modules": mod_stat,
        "chapters": [per_chapter[k] for k in sorted(per_chapter)],
        "types": _tally("type"),
        "cats": _tally("cat"),
        "difficulties": _tally("difficulty"),
    },
    "questions": questions,
}

with open(QUIZ_OUT, "w", encoding="utf-8") as f:
    f.write("/* 自动生成：题库数据打包，用于 file:// 免服务器直接打开。勿手改，改 data/quiz/*.json 后重跑 build_data_bundle.py */\n")
    f.write("window.__QUIZ_DATA__ = ")
    json.dump(quiz_bundle, f, ensure_ascii=False, separators=(",", ":"))
    f.write(";\n")

_kb = os.path.getsize(QUIZ_OUT) / 1024
print(f"OK 写入 {QUIZ_OUT}  questions={len(questions)}  chapters={len(per_chapter)}  "
      f"knowledgePoints={quiz_bundle['meta']['kpTotal']}  size={_kb:.0f}KB")
