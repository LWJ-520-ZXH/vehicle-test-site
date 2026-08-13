/* ============================================================
   题库中心 · 交互逻辑（quiz.js）
   - 数据来自 quiz-bundle.js 注入的 window.__QUIZ_DATA__
     { meta:{total, chapterCount, kpTotal, modules, chapters, types, cats, difficulties}, questions }
   - ICON / MODULE_COLORS / MODULE_NAMES 复用 app.js 全局（app.js 已先加载）
   - 主题切换由 app.js 的 Theme 统一处理，本文件不重复绑定 theme-btn
   产品红线：无分数 / 无百分比 / 无进度条 / 无打卡；localStorage 只存 known 与 review
   ============================================================ */
(function () {
  'use strict'

  const QD = window.__QUIZ_DATA__ || {
    meta: { total: 0, chapterCount: 0, kpTotal: 0, modules: {}, chapters: [], types: {}, cats: {}, difficulties: {} },
    questions: []
  }
  const QUESTIONS = QD.questions || []
  const META = QD.meta || {}

  // app.js 已定义 MODULE_COLORS / MODULE_NAMES（全局词法作用域，可直接引用）
  const TYPE_NAMES = { single: '单选题', multi: '多选题', judge: '判断题', short: '简答题' }
  const DIFF_COLORS = { '基础': '#10b981', '进阶': '#f59e0b', '挑战': '#ef4444' }
  const TYPE_ORDER = ['single', 'multi', 'judge', 'short']
  const DIFF_ORDER = ['基础', '进阶', '挑战']

  /* ============================================================
     QuizMark —— localStorage 轻标记（与 LastViewed 同族）
     只存用户主动标注的 known / review，不存对错、不存分数
     ============================================================ */
  const QuizMark = {
    KEY: 'avt-quizmark',
    _d: null,
    all() {
      if (this._d) return this._d
      try { this._d = JSON.parse(localStorage.getItem(this.KEY) || '{}') } catch (e) { this._d = {} }
      return this._d
    },
    get(id) { return this.all()[id] || '' },
    set(id, v) {
      const d = this.all()
      if (!v || d[id] === v) delete d[id]; else d[id] = v
      try { localStorage.setItem(this.KEY, JSON.stringify(d)) } catch (e) {}
      return d[id] || ''
    },
    count(v) { const d = this.all(); return Object.keys(d).filter(k => d[k] === v).length }
  }

  /* ============================================================
     QuizPage —— 长列表自测
     ============================================================ */
  const QuizPage = (function () {
    const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const PAGE = 6
    const state = { mod: 'all', type: 'all', diff: 'all', ch: 'all', q: '', shown: PAGE, shuffle: false, hideKnown: false, reviewOnly: false }
    const sess = {}                 // 本次会话作答态（不落地）：{ picked:[], revealed, explOpen }
    let SHUFFLE_ORDER = null        // 打乱顺序一次性生成，保持稳定
    let filtersEl, listEl, resultEl, subEl

    function countBy(fn) { return QUESTIONS.filter(fn).length }
    function modCount(m) { return META.modules && META.modules[m] ? (META.modules[m].qCount || 0) : countBy(q => q.module === m) }

    /* ---------- 筛选 chip ---------- */
    function chip(dim, val, label, c, color) {
      const on = state[dim] === val
      return '<button type="button" class="chip' + (color ? ' chip-mod' : '') + (on ? ' active' : '') + '"' +
        (color ? ' style="--mod-c:' + color + '"' : '') +
        ' data-dim="' + dim + '" data-val="' + esc(val) + '"' + (c === 0 ? ' disabled' : '') + '>' +
        (color ? '<span class="c-dot"></span>' : '') + esc(label) +
        (c == null ? '' : '<span class="c-count">' + c + '</span>') + '</button>'
    }
    function modCard(val, label, c, color, badge) {
      const on = state.mod === val
      return '<button type="button" class="qz-mod' + (on ? ' on' : '') + '"' +
        ' data-mod="' + esc(val) + '"' + (c === 0 && val !== 'all' ? ' disabled' : '') +
        (color ? ' style="--mod-c:' + color + '"' : '') + '>' +
        (badge ? '<span class="qz-mod-badge">' + badge + '</span>' : '') +
        '<span class="qz-mod-name">' + esc(label) + '</span>' +
        '<span class="qz-mod-count">' + c + '</span></button>'
    }
    function renderFilters() {
      let h = ''
      // 模块：全站 7 模块（A-R）卡片式选择器，无题量模块 disabled；试点外模块先占位，扩量时不用改 UI
      h += '<div class="qz-filter-row"><div class="qz-fl">模块</div><div class="qz-mods">'
      h += modCard('all', '全部模块', QUESTIONS.length, null, null)
      Object.keys(MODULE_NAMES).forEach(m => {
        h += modCard(m, MODULE_NAMES[m], modCount(m), MODULE_COLORS[m], m)
      })
      h += '</div></div>'
      h += '<div class="qz-filter-row"><div class="qz-fl">题型</div><div class="qz-chips">'
      h += chip('type', 'all', '全部', QUESTIONS.length)
      TYPE_ORDER.forEach(t => { h += chip('type', t, TYPE_NAMES[t], countBy(q => q.type === t)) })
      h += '</div></div>'
      h += '<div class="qz-filter-row"><div class="qz-fl">难度</div><div class="qz-chips">'
      h += chip('diff', 'all', '全部', QUESTIONS.length)
      DIFF_ORDER.forEach(d => { h += chip('diff', d, d, countBy(q => q.difficulty === d), DIFF_COLORS[d]) })
      h += '</div></div>'
      // 章节：平铺全部试点章节，不分组、不级联
      h += '<div class="qz-filter-row"><div class="qz-fl">章节</div><div class="qz-chips">'
      h += chip('ch', 'all', '全部章节', QUESTIONS.length)
      ;(META.chapters || []).forEach(c => {
        const color = c.color || (MODULE_COLORS[c.module] || '')
        h += chip('ch', String(c.num), c.num + ' ' + c.title, countBy(q => q.chapterNum === c.num), color)
      })
      h += '</div></div>'
      filtersEl.innerHTML = h
    }

    /* ---------- 匹配（筛选 + 搜索 + toggle） ---------- */
    function matchBase(q) {
      if (state.mod !== 'all' && q.module !== state.mod) return false
      if (state.type !== 'all' && q.type !== state.type) return false
      if (state.diff !== 'all' && q.difficulty !== state.diff) return false
      if (state.ch !== 'all' && String(q.chapterNum) !== state.ch) return false
      if (state.q) {
        const s = (q.stem + ' ' + (q.tags || []).join(' ') + ' ' + q.sectionTitle + ' ' + q.id).toLowerCase()
        if (!s.includes(state.q.toLowerCase())) return false
      }
      return true
    }
    function baseList() {
      let list = QUESTIONS.filter(q => matchBase(q))
      if (state.hideKnown) list = list.filter(q => QuizMark.get(q.id) !== 'known')
      if (state.reviewOnly) list = list.filter(q => QuizMark.get(q.id) === 'review')
      if (state.shuffle) {
        if (!SHUFFLE_ORDER) SHUFFLE_ORDER = QUESTIONS.map(q => q.id).sort(() => Math.random() - 0.5)
        const pos = {}; SHUFFLE_ORDER.forEach((id, i) => { pos[id] = i })
        list = list.slice().sort((a, b) => pos[a.id] - pos[b.id])
      }
      return list
    }

    /* ---------- 题卡 ---------- */
    function optionsHTML(q, st) {
      if (q.type === 'short') return ''
      const opts = q.type === 'judge'
        ? [{ key: 'T', text: '正确' }, { key: 'F', text: '错误' }]
        : (q.options || [])
      const revealed = st && st.revealed
      const picked = st ? st.picked : []
      return '<div class="qz-options">' + opts.map(o => {
        let cls = 'qz-opt', ic = ''
        if (revealed) {
          const isAns = q.answer.indexOf(o.key) >= 0, isPk = picked.indexOf(o.key) >= 0
          if (isAns) { cls += ' correct'; ic = ICON('check') }
          else if (isPk) { cls += ' wrong'; ic = ICON('cross') }
          else cls += ' dim'
        } else if (picked.indexOf(o.key) >= 0) cls += ' picked'
        return '<button type="button" class="' + cls + '" data-key="' + o.key + '"' + (revealed ? ' disabled' : '') + '>' +
          '<span class="qz-opt-key">' + o.key + '</span>' +
          '<span class="qz-opt-text">' + esc(o.text) + '</span>' +
          '<span class="qz-opt-ic">' + ic + '</span></button>'
      }).join('') + '</div>'
    }
    // 揭示区：思路解析折叠 + 绿色答案框 + 解析框(含要点) + 关联术语 + 素材来源
    function revealHTML(q, st) {
      const isShort = q.type === 'short'
      const ansLabel = isShort ? '参考答案'
        : '正确答案 ' + (q.type === 'judge' ? (q.answer[0] === 'T' ? '正确' : '错误') : q.answer.join(' · '))
      const open = st && st.explOpen
      let body = ''
      if (isShort) {
        body += '<div class="qz-refans">' + esc(q.refAnswer) + '</div>'
      }
      body += '<div class="qz-expl-body">' + esc(q.explanation) + '</div>'
      if (q.keyPoints && q.keyPoints.length) {
        body += '<div class="qz-keypoints"><div class="qz-keypoints-h">答题要点</div><ul>' +
          q.keyPoints.map(k => '<li>' + esc(k) + '</li>').join('') + '</ul></div>'
      }
      if (q.relatedTerms && q.relatedTerms.length) {
        body += '<div class="qz-terms"><span class="qz-terms-h">关联术语</span>' +
          q.relatedTerms.map(t => '<a class="qz-term" href="glossary.html" title="查术语表">' + esc(t) + '</a>').join('') + '</div>'
      }
      const srcLabel = q.sourceRef ? q.sourceRef.label : q.sectionTitle
      return '<div class="qz-reveal">' +
        '<button type="button" class="qz-toggle-expl' + (open ? ' on' : '') + '" aria-expanded="' + (open ? 'true' : 'false') + '">思路解析 ' + ICON('chevronDown') + '</button>' +
        '<div class="qz-answer">' + ICON('check') + esc(ansLabel) + '</div>' +
        '<div class="qz-expl"' + (open ? '' : ' hidden') + '>' + body + '</div>' +
        '<div class="qz-source">' + ICON('link') + '素材来源：' + esc(srcLabel) + '</div>' +
      '</div>'
    }
    function cardHTML(q) {
      const mc = MODULE_COLORS[q.module] || '#2563eb', dc = DIFF_COLORS[q.difficulty] || mc
      const mk = QuizMark.get(q.id)
      const badges = [
        '<span class="qz-badge qz-badge-mod" style="--mod-c:' + mc + '">' + q.module + ' · 第' + q.chapterNum + '章</span>',
        '<span class="qz-badge qz-badge-type">' + TYPE_NAMES[q.type] + '</span>',
        '<span class="qz-badge qz-badge-diff" style="--df-c:' + dc + '">' + esc(q.difficulty) + '</span>',
        '<span class="qz-badge qz-badge-cat">' + esc(q.cat) + '</span>'
      ]
      if (q.direction === '反向') badges.push('<span class="qz-badge qz-badge-dir">反向题</span>')
      badges.push('<span class="qz-badge qz-badge-num">' + esc(q.id) + '</span>')
      const submit = q.type === 'multi'
        ? '<button type="button" class="qz-btn qz-btn-primary qz-submit" disabled>' + ICON('check') + '提交作答</button>'
        : (q.type === 'short' ? '<button type="button" class="qz-btn qz-btn-primary qz-submit">' + ICON('link') + '查看参考答案</button>' : '')
      const st = sess[q.id]
      return '<article class="qz-card" data-id="' + q.id + '" style="--mod-c:' + mc + ';--df-c:' + dc + '">' +
        '<div class="qz-card-badges">' + badges.join('') + '</div>' +
        '<div class="qz-stem">' + esc(q.stem) + (q.type === 'multi' ? '<span class="qz-multi-hint">可多选</span>' : '') + '</div>' +
        optionsHTML(q, st) +
        '<div class="qz-actions">' +
          submit +
          '<button type="button" class="qz-btn qz-btn-known qz-mark' + (mk === 'known' ? ' on' : '') + '" data-mark="known">' + ICON('check') + '已掌握</button>' +
          '<button type="button" class="qz-btn qz-btn-review qz-mark' + (mk === 'review' ? ' on' : '') + '" data-mark="review">' + ICON('bookmark') + '再看</button>' +
          '<a class="qz-src" href="chapter.html?id=' + q.chapterNum + '&kp=' + q.sectionIndex + '" title="回到第' + q.chapterNum + '章原文知识点：' + esc(q.sectionTitle) + '">' + ICON('link') + esc(q.sectionTitle) + '</a>' +
        '</div>' +
        (st && st.revealed ? revealHTML(q, st) : '') +
      '</article>'
    }
    function emptyHTML() {
      return '<div class="qz-empty">' + ICON('search') +
        '<div class="qz-empty-t">这个条件下暂时没有题目</div>' +
        '<div>放宽筛选，或点击工具条的「只看再看」试试。</div></div>'
    }

    /* ---------- 渲染主列表 ---------- */
    function render() {
      const list = baseList()
      resultEl.innerHTML = '匹配 <b>' + list.length + '</b> 题'
      if (!list.length) { listEl.innerHTML = emptyHTML(); return }
      const show = list.slice(0, state.shown)
      let h = show.map(cardHTML).join('')
      if (list.length > state.shown) h += '<button type="button" class="qz-more" id="qz-more">加载更多（剩 ' + (list.length - state.shown) + ' 题）</button>'
      listEl.innerHTML = h
    }

    /* ---------- 作答即揭示（原地更新） ---------- */
    function doReveal(cardEl, q) {
      const st = sess[q.id] || (sess[q.id] = { picked: [], revealed: false, explOpen: false })
      if (q.type !== 'short') {
        const picked = q.type === 'multi'
          ? Array.from(cardEl.querySelectorAll('.qz-opt.picked')).map(b => b.getAttribute('data-key'))
          : [cardEl.querySelector('.qz-opt.picked').getAttribute('data-key')]
        cardEl.querySelectorAll('.qz-opt').forEach(b => {
          b.disabled = true
          const k = b.getAttribute('data-key')
          const isAns = q.answer.indexOf(k) >= 0, isPk = picked.indexOf(k) >= 0
          b.classList.remove('picked')
          if (isAns) { b.classList.add('correct'); b.querySelector('.qz-opt-ic').innerHTML = ICON('check') }
          else if (isPk) { b.classList.add('wrong'); b.querySelector('.qz-opt-ic').innerHTML = ICON('cross') }
          else b.classList.add('dim')
        })
        st.picked = picked
      }
      st.revealed = true
      const wrap = document.createElement('div'); wrap.innerHTML = revealHTML(q, st)
      cardEl.appendChild(wrap.firstChild)
      const sub = cardEl.querySelector('.qz-submit'); if (sub) sub.hidden = true
    }

    /* ---------- 事件 ---------- */
    function bind() {
      // 筛选 chip + 模块卡片
      filtersEl.addEventListener('click', e => {
        const modBtn = e.target.closest('.qz-mod')
        if (modBtn && !modBtn.disabled) {
          state.mod = modBtn.getAttribute('data-mod')
          state.shown = PAGE; renderFilters(); render(); return
        }
        const c = e.target.closest('.chip'); if (!c || c.disabled) return
        const dim = c.getAttribute('data-dim'), val = c.getAttribute('data-val')
        state[dim] = val; state.shown = PAGE; renderFilters(); render()
      })
      // 工具条 toggle
      document.querySelectorAll('.qz-toggle').forEach(b => {
        b.addEventListener('click', () => {
          const tg = b.getAttribute('data-tg')
          state[tg] = !state[tg]
          b.classList.toggle('on', state[tg])
          if (tg === 'shuffle' && !state[tg]) SHUFFLE_ORDER = null   // 关闭打乱 → 恢复原始顺序
          state.shown = PAGE; render()
        })
      })
      // 搜索
      const qInput = document.getElementById('qz-q')
      if (qInput) qInput.addEventListener('input', e => { state.q = e.target.value.trim(); state.shown = PAGE; render() })
      // 列表交互（选项/提交/思路解析折叠/标记/加载更多）
      listEl.addEventListener('click', e => {
        if (e.target.closest('#qz-more')) { state.shown += PAGE; render(); return }
        const card = e.target.closest('.qz-card'); if (!card) return
        const q = QUESTIONS.find(x => x.id === card.getAttribute('data-id')); if (!q) return

        const tog = e.target.closest('.qz-toggle-expl')
        if (tog) {
          const st = sess[q.id] || (sess[q.id] = { picked: [], revealed: false, explOpen: false })
          st.explOpen = !st.explOpen
          const ex = card.querySelector('.qz-expl'); if (ex) ex.hidden = !st.explOpen
          tog.classList.toggle('on', st.explOpen)
          tog.setAttribute('aria-expanded', st.explOpen ? 'true' : 'false')
          return
        }
        const opt = e.target.closest('.qz-opt')
        if (opt && !opt.disabled) {
          if (q.type === 'multi') {
            opt.classList.toggle('picked')
            card.querySelector('.qz-submit').disabled = card.querySelectorAll('.qz-opt.picked').length === 0
          } else {
            card.querySelectorAll('.qz-opt').forEach(b => b.classList.remove('picked'))
            opt.classList.add('picked'); doReveal(card, q)
          }
          return
        }
        if (e.target.closest('.qz-submit')) { doReveal(card, q); return }
        const mk = e.target.closest('.qz-mark')
        if (mk) { QuizMark.set(q.id, mk.getAttribute('data-mark')); render(); return }
      })
      // 主题切换由 app.js 的 Theme 统一处理，此处不再绑定 theme-btn
    }

    return {
      init() {
        filtersEl = document.getElementById('qz-filters')
        listEl = document.getElementById('qz-list')
        resultEl = document.getElementById('qz-result')
        subEl = document.querySelector('.qz-h-sub')
        if (subEl) subEl.innerHTML = '轻量自测 · 从 <b>' + (META.chapterCount || 0) + '</b> 个试点章节抽题 · 当前 <b>' + (META.total || 0) + '</b> 题'
        renderFilters(); bind(); render()
      }
    }
  })()

  window.QuizPage = QuizPage
  document.addEventListener('DOMContentLoaded', () => QuizPage.init())
})()
