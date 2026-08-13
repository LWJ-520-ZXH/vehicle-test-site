-- ============================================================================
-- 车载测试学堂 · 后端内容中台 · D1 Schema
-- 文档: docs/backend-content-platform.md (VT-SITE-ARCH-001 V2.0) §3
-- 幂等: 全部使用 IF NOT EXISTS，可重复执行 (re-run safe)
-- 应用: wrangler d1 execute vehicle_site --file=migrations/001_schema.sql
-- 真源策略: 内容表(chapters/glossary/quiz) 以 Git JSON 为唯一真源，
--           D1 为构建期派生物，迁移脚本幂等可重跑 (见 §8 / §10)。
-- ============================================================================

-- 用户表（含 token_version 支持单点吊销，无 sessions 表）
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'registered', -- registered | approved
  token_version INTEGER NOT NULL DEFAULT 0,         -- 吊销: version++
  created_at    INTEGER NOT NULL,
  last_login    INTEGER,
  deleted_at    INTEGER                                  -- 软删 (PII 留存期清理)
);

-- 申请记录表（含审计链）
CREATE TABLE IF NOT EXISTS applications (
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
CREATE TABLE IF NOT EXISTS magic_tokens (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL,
  token_hash  TEXT NOT NULL,                     -- SHA-256，不存明文
  purpose     TEXT NOT NULL DEFAULT 'login',     -- login | register
  expires_at  INTEGER NOT NULL,
  used_at     INTEGER,                            -- 原子置位即失效
  created_at  INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 章节正文表（content_json = 完整 chapter-content/NN.json）
CREATE TABLE IF NOT EXISTS chapters (
  num          INTEGER PRIMARY KEY,
  slug         TEXT NOT NULL,
  title        TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'restricted', -- public | restricted
  content_json TEXT NOT NULL
);

-- 术语表（content_json = 完整术语对象）
CREATE TABLE IF NOT EXISTS glossary (
  id            INTEGER PRIMARY KEY,
  term          TEXT NOT NULL,
  category      TEXT,
  access_level  TEXT NOT NULL DEFAULT 'restricted',
  content_json  TEXT NOT NULL
);

-- 题库表（content_json = 完整题目对象；题库全受限，仅 approved 可见）
CREATE TABLE IF NOT EXISTS quiz (
  id            INTEGER PRIMARY KEY,
  chapter_num   INTEGER,
  access_level  TEXT NOT NULL DEFAULT 'restricted',
  content_json  TEXT NOT NULL
);

-- 索引（加速审计/清理/查询）
CREATE INDEX IF NOT EXISTS idx_app_user   ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_mt_user    ON magic_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_mt_expires ON magic_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_quiz_chap  ON quiz(chapter_num);
