/* ========== 内容版本戳：章节 JSON 缓存失效与 fetch 防缓存用 ========== */
const __CONTENT_VERSION__ = '20260814103123';

/* 启动即清理旧版本会话缓存，避免残留旧内容（CDN 忽略 ?v，浏览器可能长期缓存旧 app.js） */
(function () {
  try {
    const prefix = 'avt-ch-'
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i)
      if (k && k.indexOf(prefix) === 0 && k.indexOf('-' + __CONTENT_VERSION__) === -1) {
        sessionStorage.removeItem(k)
      }
    }
  } catch (e) {}
})()

/* ========== 安全存储：file:// / 沙盒 / opaque origin 下 localStorage/sessionStorage 可能抛 SecurityError ========== */
/* 不可用时静默降级为内存对象，避免初始化即崩溃导致整页空白（P0 守门） */
function _mkSafeStorage(name) {
  let backend = null
  try {
    // 注意：localStorage/sessionStorage 在 file:// 或 opaque origin 下「访问即抛 SecurityError」，
    // 因此必须在 try 内部才引用该全局属性，否则函数调用本身就会中断脚本（P0 守门）
    backend = name === 'local' ? localStorage : sessionStorage
    const k = '__avt_safe__'
    backend.setItem(k, '1'); backend.removeItem(k)
  } catch (e) { backend = null }
  if (backend) return backend
  const mem = {}
  return {
    getItem(k) { return k in mem ? mem[k] : null },
    setItem(k, v) { mem[k] = String(v) },
    removeItem(k) { delete mem[k] },
    key(i) { return Object.keys(mem)[i] || null },
    get length() { return Object.keys(mem).length },
  }
}
const _safeLS = _mkSafeStorage('local')
const _safeSS = _mkSafeStorage('session')

/* ========== 统一 SVG 图标库（描边 / currentColor / 矢量） ========== */
function ICON(name){
  const P={
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    star:'<path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 6 20.4l1.4-6.8L2.3 9.6l6.9-.7z" fill="currentColor" stroke="none"/>',
    book:'<path d="M12 6c-1.8-1.2-4-1.8-7-1.8C3 4.2 2 5.4 2 7v12c0 1.5 1 2.5 3 2.5 2.8 0 5-1 7-2.2 2 1.2 4.2 2.2 7 2.2 2 0 3-1 3-2.5V7c0-1.6-1-2.8-3-2.8-3 0-5.2.6-7 1.8z"/><path d="M12 6v13.5"/>',
    clipboard:'<rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6M9 14h6"/>',
    chat:'<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12z"/>',
    link:'<path d="M9 15l6-6"/><path d="M10.5 6.5l1-1a4 4 0 0 1 6 6l-1 1"/><path d="M13.5 17.5l-1 1a4 4 0 0 1-6-6l1-1"/>',
    bulb:'<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.3 1 2.5h6c0-1.2.3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    warning:'<path d="M12 3l9 16H3z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
    flask:'<path d="M9 3h6"/><path d="M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M7.5 15h9"/>',
    refresh:'<path d="M20 11a8 8 0 1 0-1.5 5"/><path d="M20 5v6h-6"/>',
    doc:'<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/>',
    scale:'<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7l-3 6h6z"/><path d="M19 7l-3 6h6z"/>',
    file:'<path d="M14 3v5h5"/><path d="M7 3h7l5 5v13H7z"/>',
    wip:'<path d="M4 20h16"/><path d="M6 20l2-9h8l2 9"/><path d="M12 11V7"/><path d="M9 7h6"/>',
    signal:'<path d="M2 12h3l2-7 4 16 3-12 2 6h6"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    car:'<path d="M3 13l2-5a2 2 0 0 1 2-1.5h8A2 2 0 0 1 19 8l2 5v5h-3"/><path d="M3 13v5h3"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="M15 9l-2 5-4 2 2-5z"/>',
    check:'<path d="M5 13l4 4L19 7"/>',
    cross:'<path d="M18 6L6 18M6 6l12 12"/>',
    bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    chevronDown:'<path d="M6 9l6 6 6-6"/>',
    quiz:'<path d="M9 11l2 2 4-4"/><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
    alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>',
    arrowRight:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    repeat:'<path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    wrench:'<path d="M14 7a4 4 0 0 1-5 5l-6 6 2 2 6-6a4 4 0 0 1 5-5l-2 2-2-2z"/>',
    branch:'<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7v10"/><path d="M6 12h6a4 4 0 0 0 4-4V7"/>',
    diagram:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gauge:'<path d="M3 15a9 9 0 0 1 18 0"/><path d="M12 15l4-5"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/>',
    sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h6M14 18h6"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="12" cy="18" r="2"/>',
    play:'<path d="M8 5v14l11-7z"/>',
    pause:'<path d="M8 5v14M16 5v14"/>',
    send:'<path d="M21 3L3 11l7 2 2 7z"/>',
    activity:'<path d="M3 12h4l2-7 4 14 2-7h6"/>',
    cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    wave:'<path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0"/>',
    chip:'<rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
    layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.8"/><path d="M21 15l-5-5L5 21"/>',
    monitor:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'
  };
  const s=P[name]; if(!s) return '';
  return '<svg class="ui-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+s+'</svg>';
}
const BQ_ICON={'面试说':'chat','承上':'link','核心理念':'bulb','warning':'warning','lab':'flask','review':'refresh'};
const BQ_TEXT={'面试说':'面试说','承上':'承上启下','核心理念':'核心理念','warning':'注意','lab':'动手实验','review':'阶段性回顾'};
/* ============================================================
   车载测试学堂 · 首页主逻辑 v4
   主题 / 卡片 / 路径 / 车企 / 进度
   - 路线和车企完全独立渲染，不依赖 chapters.json
   - 每一步都有 inline fallback，JS 失败页面仍可见
   ============================================================ */

/* ========== 能力分级 L0-L3 ========== */
const LEVEL_META = {
  L0: { name: '入门导航', color: '#EC4899' },
  L1: { name: '上岗必备', color: '#2563EB' },
  L2: { name: '专项深入', color: '#F59E0B' },
  L3: { name: '专家进阶', color: '#EF4444' }
}

/* ========== 主题 ========== */
const Theme = {
  btn: null,
  init() {
    this.btn = document.getElementById('theme-btn')
    if (!this.btn) return
    const saved = _safeLS.getItem('avt-theme') || 'system'
    this.apply(saved)
    this.btn.addEventListener('click', () => this.cycle())
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (_safeLS.getItem('avt-theme') === 'system') this.apply('system')
      })
    }
  },
  cycle() {
    const order = ['light', 'dark', 'system']
    const cur = _safeLS.getItem('avt-theme') || 'system'
    const next = order[(order.indexOf(cur) + 1) % 3]
    this.apply(next)
  },
  apply(mode) {
    let t
    if (mode === 'system') {
      t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else { t = mode }
    document.documentElement.setAttribute('data-theme', t)
    _safeLS.setItem('avt-theme', mode)
    this.updateIcon(mode)
  },
  updateIcon(mode) {
    if (!this.btn) return
    const icons = {
      light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
      dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
      system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    }
    this.btn.innerHTML = icons[mode]
    this.btn.title = { light: '浅色模式', dark: '深色模式', system: '跟随系统' }[mode]
  }
}

/* ========== 最近查看（自学导向：仅记录访问时间，不做进度/打卡） ========== */
const LastViewed = {
  data: {},
  load() {
    try { this.data = JSON.parse(localStorage.getItem('avt-lastviewed') || '{}') } catch { this.data = {} }
  },
  get(num) { return this.data[num] || 0 },
  touch(num) {
    const t = Date.now()
    this.data[num] = t
    try { localStorage.setItem('avt-lastviewed', JSON.stringify(this.data)) } catch {}
    return t
  },
  format(num) {
    const t = this.data[num]
    if (!t) return ''
    const diff = Date.now() - t
    const min = 60000, hr = 3600000, day = 86400000
    if (diff < hr) return Math.max(1, Math.floor(diff / min)) + ' 分钟前'
    if (diff < day) return Math.floor(diff / hr) + ' 小时前'
    if (diff < 30 * day) return Math.floor(diff / day) + ' 天前'
    try { return new Date(t).toLocaleDateString('zh-CN') } catch { return '' }
  }
}

/* ========== 车企数据 ========== */
// 车企品牌色：用于图标主题自适应（currentColor 注入）+ 品牌识别
const OEM_BRAND = {
  '比亚迪': '#e60012', '蔚来': '#00aef0', '小鹏': '#00b14f', '理想': '#f97316',
  '吉利': '#1e3a8a', '长城': '#d4001a', '长安': '#005bac', '大众': '#0099da',
  '特斯拉': '#e82127', '华为智选': '#cf0a2c', '小米': '#ff6900', '宝马': '#0066b1'
}
// 拟真品牌 Logo SVG（按品牌真实视觉特征绘制，非抽象字母标；暗黑模式由卡片背景保证对比度）
const OEM_ICONS = {
  '比亚迪': '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="20" rx="17" ry="11" fill="#e60012"/><text x="20" y="24.5" text-anchor="middle" fill="#fff" font-size="11" font-weight="800" font-family="var(--font-sans)">BYD</text></svg>',
  '蔚来': '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#00aef0"/><path d="M7 21 Q20 13 33 21 L33 25 Q20 17 7 25 Z" fill="#fff"/><path d="M9 25 Q20 19 31 25 L31 29 Q20 23 9 29 Z" fill="#fff" opacity=".75"/></svg>',
  '小鹏': '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#00b14f"><path d="M20 5 L26 13 L22 20 L26 27 L20 35 L14 27 L18 20 L14 13 Z"/><path d="M5 13 L13 20 L5 27 L9 31 L20 22 L31 31 L35 27 L27 20 L35 13 L31 9 L20 18 L9 9 Z"/></g></svg>',
  '理想': '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="6" width="28" height="28" rx="7" fill="#f97316"/><text x="20" y="27.5" text-anchor="middle" fill="#fff" font-size="17" font-weight="800" font-family="var(--font-sans)">Li</text></svg>',
  '吉利': '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 L34 10 L32 30 L20 36 L8 30 L6 10 Z" fill="#1e3a8a"/><path d="M20 8 L30 12 L28 28 L20 32 L12 28 L10 12 Z" fill="#fff"/><text x="20" y="23" text-anchor="middle" fill="#1e3a8a" font-size="8" font-weight="800" font-family="var(--font-sans)">GEELY</text></svg>',
  '长城': '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4 L34 10 L32 32 L20 36 L8 32 L6 10 Z" fill="#d4001a"/><path d="M14 11 H26 V15 H22 V25 H26 V29 H14 V25 H18 V15 H14 Z" fill="#fff"/></svg>',
  '长安': '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#005bac"/><path d="M12 13 L20 30 L28 13 H24 L20 23 L16 13 Z" fill="#fff"/></svg>',
  '大众': '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#0099da"/><path d="M12 13 L18 28 L20 21 L22 28 L28 13 H24 L22 19 L20 13 L18 19 L16 13 Z" fill="#fff"/></svg>',
  '特斯拉': '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 9 Q20 13 34 9 L32 12 Q20 15 8 12 Z" fill="#e82127"/><path d="M18 12 H22 V34 H18 Z" fill="#e82127"/></svg>',
  '华为智选': '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="#cf0a2c"><path d="M20 6 L22 16 L20 18 L18 16 Z"/><path d="M29 10 L27 20 L25 19 L26 10 Z"/><path d="M34 20 L25 22 L24 20 L33 18 Z"/><path d="M29 30 L20 25 L22 23 L30 27 Z"/><path d="M20 34 L18 24 L20 22 L22 24 Z"/><path d="M11 30 L13 20 L15 21 L14 30 Z"/><path d="M6 20 L15 18 L16 20 L7 22 Z"/><path d="M11 10 L20 15 L18 17 L10 13 Z"/></g></svg>',
  '小米': '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="5" y="5" width="30" height="30" rx="8" fill="#ff6900"/><text x="20" y="28.5" text-anchor="middle" fill="#fff" font-size="19" font-weight="700" font-family="var(--font-sans)">mi</text></svg>',
  '宝马': '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#000"/><path d="M20 2 A18 18 0 0 1 38 20 H20 Z" fill="#0066b1"/><path d="M20 38 A18 18 0 0 1 2 20 H20 Z" fill="#0066b1"/><path d="M20 2 A18 18 0 0 0 2 20 H20 Z" fill="#fff"/><path d="M20 38 A18 18 0 0 0 38 20 H20 Z" fill="#fff"/><circle cx="20" cy="20" r="18" fill="none" stroke="#000" stroke-width="2"/></svg>'
}

const OEM_DATA = [
  { name: '比亚迪', img: 'assets/images/oem-byd.svg', desc: '全球新能源销冠，垂直整合全栈自研，搭载刀片电池、DM-i 超级混动、云辇系统、e平台3.0。智能座舱DiLink + DiPilot智驾。', tags: ['新能源', '自研', '垂直整合'] },
  { name: '蔚来', img: 'assets/images/oem-nio.svg', desc: '高端智能电动SUV/轿车双线布局，换电体系全国超2000座。NT2平台全系标配激光雷达+4 Orin-X(1016TOPS)，NIO Phone生态互联。', tags: ['换电', '高端', '智驾'] },
  { name: '小鹏', img: 'assets/images/oem-xpeng.svg', desc: '以智驾为核心卖点，XNGP城区/高速全场景辅助驾驶。G6/G9基于800V碳化硅高压平台，XEEA架构中央超算+域控。', tags: ['智驾', '800V', '纯电'] },
  { name: '理想', img: 'assets/images/oem-li.svg', desc: '增程式+纯电双擎路线，L9/L8/L7/理想MEGA。自研理想AD Max智驾(激光雷达+双Orin-X)，SS智能座舱四屏交互。', tags: ['增程', '家庭', '座舱'] },
  { name: '吉利', img: 'assets/images/oem-geely.svg', desc: 'CMA/SEA浩瀚架构多品牌矩阵(极氪/领克/吉利)。自研7nm座舱芯片龍鷹一号，魅族FlymeAuto操作系统。SEA架构覆盖A-E级车。', tags: ['多品牌', '平台化', '自研芯片'] },
  { name: '长城', img: 'assets/images/oem-gwm.svg', desc: 'SUV+皮卡双线王者，柠檬/坦克/咖啡智能三大平台。毫末智行HPilot全场景导航辅助驾驶，咖啡智能座舱系统。', tags: ['SUV', '皮卡', '智驾'] },
  { name: '长安', img: 'assets/images/oem-changan.svg', desc: '自主+合资(长安福特/马自达)并行。深蓝SL03/S7增程+纯电双动力，阿维塔(华为HI模式)搭载华为ADS2.0智驾。', tags: ['自主', '华为HI', '深蓝'] },
  { name: '大众', img: 'assets/images/oem-vw.svg', desc: '全球最大汽车集团之一，MEB/PPE/SSP纯电平台三阶段布局。ID.系列车型搭载CARIAD软件栈，与小鹏合作EEA架构。', tags: ['合资', '全球', 'MEB'] },
  { name: '特斯拉', img: 'assets/images/oem-tesla.svg', desc: '纯电行业标杆，FSD端到端智驾(纯视觉方案)。4680电池+一体压铸降低制造成本，OTA持续提升车辆功能和性能。', tags: ['标杆', 'FSD', '纯视觉'] },
  { name: '华为智选', img: 'assets/images/oem-huawei.svg', desc: '华为智选车业务(AITO问界/智界/享界)。HarmonyOS智能座舱+ADS2.0智驾(不依赖高精地图)。途灵底盘+DriveONE电驱。', tags: ['鸿蒙座舱', 'ADS', '智选'] },
  { name: '小米', img: 'assets/images/oem-xiaomi.svg', desc: '小米SU7三电机超跑级性能(2.78s零百)，Hyper OS人车家全生态互联。自研CTB电池-车身一体化+800V高压平台。', tags: ['新势力', '生态', '性能'] },
  { name: '宝马', img: 'assets/images/oem-bmw.svg', desc: '百年豪华品牌，Neue Klasse 新世代纯电平台2025落地。iDrive操作系统迭代至9.0，L3级自动驾驶率先获得德国认证。', tags: ['豪华', 'L3', '传统豪华'] }
]


/* ========== 封面设计系统引擎（Ch01 规范：模块母题 + 章节种子差异化） ========== */
function seedParams(num){
  let s = (num*9301+49297) % 233280;
  const rnd = () => { s = (s*9301+49297)%233280; return s/233280; };
  const r = rnd();
  return {
    rot: Math.floor(rnd()*40),
    phase: rnd()*Math.PI*2,
    density: r>0.66?'dense':(r>0.33?'mid':'sparse'),
    offset: Math.floor(rnd()*16)-8
  };
}
function bgDots(density){
  const gap = density==='dense'?14:(density==='mid'?20:28);
  let s='';
  for(let y=gap/2;y<168;y+=gap)
    for(let x=gap/2;x<120;x+=gap)
      s+=`<circle cx="${x}" cy="${y}" r="1" fill="rgba(255,255,255,.06)"/>`;
  return s;
}

/* ========== 内容主题封面引擎 V2（每张卡片按其核心内容绘制图标，无数字水印） ========== */
const _CS = 'rgba(255,255,255,.22)', _CM = 'rgba(255,255,255,.15)', _CL = 'rgba(255,255,255,.10)', _CF = 'rgba(255,255,255,.12)'
const COVER_MOTIFS_V2 = {
  topology: (p) => {
    let links = '', nodes = ''
    for (let k = 0; k < 5; k++) {
      const a = (-90 + 72 * k) * Math.PI / 180
      const x = +(Math.cos(a) * 30).toFixed(1), y = +(Math.sin(a) * 30).toFixed(1)
      links += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="${_CM}" stroke-width="1.3"/>`
      nodes += `<rect x="${x - 6}" y="${y - 6}" width="12" height="12" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="2" fill="${_CF}"/>`
    }
    return `<g transform="translate(60,84)">${links}<circle r="13" fill="none" stroke="${_CS}" stroke-width="1.6"/><circle r="7" fill="none" stroke="${_CM}" stroke-width="1.2"/><circle r="3" fill="${_CF}"/>${nodes}</g>`
  },
  bus: (p) => `<g transform="translate(60,84)">
    <line x1="-46" y1="0" x2="46" y2="0" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="-46" y1="11" x2="46" y2="11" stroke="${_CL}" stroke-width="1"/>
    ${[-32, -11, 11, 32].map(x => `<line x1="${x}" y1="0" x2="${x}" y2="-14" stroke="${_CM}" stroke-width="1.2"/><rect x="${x - 7}" y="-26" width="14" height="14" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/><circle cx="${x}" cy="-19" r="2" fill="${_CF}"/>`).join('')}
    <circle cx="0" cy="0" r="3" fill="${_CS}"/>
  </g>`,
  lin: (p) => `<g transform="translate(60,88)">
    <line x1="-42" y1="-6" x2="42" y2="-6" stroke="${_CS}" stroke-width="1.6"/>
    <rect x="-46" y="-18" width="18" height="22" rx="3" fill="none" stroke="${_CS}" stroke-width="1.4"/>
    ${[-22, 2, 26].map(x => `<line x1="${x}" y1="-6" x2="${x}" y2="10" stroke="${_CM}" stroke-width="1.2"/><rect x="${x - 6}" y="10" width="12" height="12" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/>`).join('')}
  </g>`,
  flexray: (p) => `<g transform="translate(60,84)">
    <line x1="-44" y1="-10" x2="44" y2="-10" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="-44" y1="10" x2="44" y2="10" stroke="${_CS}" stroke-width="1.6"/>
    ${[-30, 0, 30].map(x => `<line x1="${x}" y1="-10" x2="${x}" y2="10" stroke="${_CM}" stroke-width="1.2"/><circle cx="${x}" cy="0" r="3" fill="${_CF}"/>`).join('')}
    <rect x="-48" y="-16" width="8" height="32" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/>
    <rect x="40" y="-16" width="8" height="32" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/>
  </g>`,
  eth: (p) => `<g transform="translate(60,84)">
    <rect x="-22" y="-22" width="44" height="44" rx="6" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    ${[-14, -7, 0, 7, 14].map(x => `<rect x="${x - 2}" y="-14" width="4" height="10" rx="1" fill="${_CF}"/>`).join('')}
    <line x1="0" y1="22" x2="0" y2="34" stroke="${_CM}" stroke-width="1.4"/>
    <path d="M-10,30 q10,8 20,0" fill="none" stroke="${_CM}" stroke-width="1.2"/>
  </g>`,
  uds: (p) => `<g transform="translate(60,84)">
    <path d="M-18,-14 a10,10 0 1 1 14,14 l-8,8 -6,-6 6,-6 a5,5 0 1 0 -6,-6 z" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="6" y1="14" x2="24" y2="22" stroke="${_CS}" stroke-width="1.6"/>
    <path d="M24,22 l-6,-1 m6,1 l-1,-6" stroke="${_CM}" stroke-width="1.2" fill="none"/>
    <line x1="-24" y1="20" x2="4" y2="20" stroke="${_CM}" stroke-width="1.2"/>
    <path d="M4,20 l-5,-3 m5,3 l-5,3" stroke="${_CM}" stroke-width="1.2" fill="none"/>
  </g>`,
  obd: (p) => { let pins = ''; for (let i = 0; i < 8; i++) { const x = -22 + i * 4.6; pins += `<circle cx="${x.toFixed(1)}" cy="-9" r="1.4" fill="${_CF}"/><circle cx="${x.toFixed(1)}" cy="6" r="1.4" fill="${_CF}"/>` } return `<g transform="translate(60,84)"><path d="M-26,-18 L26,-18 L30,14 L-30,14 Z" fill="none" stroke="${_CS}" stroke-width="1.6"/>${pins}</g>` },
  canoe: (p) => `<g transform="translate(60,80)">
    <rect x="-42" y="-28" width="84" height="56" rx="6" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <line x1="-42" y1="-20" x2="42" y2="-20" stroke="${_CM}" stroke-width="1"/>
    ${[-13, -3, 7, 17].map(y => `<rect x="-36" y="${y}" width="${20 + Math.abs((y * 13) % 24)}" height="4" rx="2" fill="${_CF}"/>`).join('')}
    <circle cx="34" cy="-24" r="2" fill="${_CM}"/>
  </g>`,
  capl: (p) => `<g transform="translate(60,84)">
    <path d="M-20,-22 L-30,-10 L-20,2" fill="none" stroke="${_CS}" stroke-width="1.8"/>
    <path d="M20,-22 L30,-10 L20,2" fill="none" stroke="${_CS}" stroke-width="1.8"/>
    <line x1="-14" y1="14" x2="14" y2="14" stroke="${_CM}" stroke-width="1.4"/>
    <line x1="-8" y1="22" x2="8" y2="22" stroke="${_CM}" stroke-width="1.4"/>
  </g>`,
  python: (p) => `<g transform="translate(60,80)">
    <rect x="-40" y="-24" width="80" height="48" rx="6" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <line x1="-40" y1="-16" x2="40" y2="-16" stroke="${_CM}" stroke-width="1"/>
    <text x="-32" y="8" font-family="monospace" font-size="18" fill="${_CS}">&gt;&gt;&gt;</text>
    <rect x="-32" y="14" width="30" height="3" rx="1.5" fill="${_CF}"/>
  </g>`,
  zcanpro: (p) => `<g transform="translate(60,80)">
    <rect x="-42" y="-28" width="84" height="56" rx="6" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <line x1="-42" y1="-20" x2="42" y2="-20" stroke="${_CM}" stroke-width="1"/>
    ${[-26, 2].map(y => `<rect x="-36" y="${y}" width="20" height="14" rx="2" fill="none" stroke="${_CL}" stroke-width="1.1"/><rect x="-10" y="${y}" width="46" height="14" rx="2" fill="none" stroke="${_CL}" stroke-width="1.1"/>`).join('')}
    <circle cx="-34" cy="-24" r="2" fill="${_CM}"/><circle cx="-28" cy="-24" r="2" fill="${_CL}"/>
  </g>`,
  vmodel: (p) => `<g transform="translate(60,84)">
    <path d="M-36,-22 L0,26 L36,-22" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    ${[-22, -4, 14].map(y => { const dx = (y + 22) * 36 / 48; return `<line x1="${-dx.toFixed(1)}" y1="${y}" x2="${dx.toFixed(1)}" y2="${y}" stroke="${_CM}" stroke-width="1.1"/>` }).join('')}
    <circle cx="0" cy="26" r="3" fill="${_CF}"/>
  </g>`,
  gauge: (p) => { let ticks = ''; [-30, 0, 30].forEach(a => { const x = +(Math.cos((a - 180) * Math.PI / 180) * 30).toFixed(1), y = +(Math.sin((a - 180) * Math.PI / 180) * 30).toFixed(1); ticks += `<circle cx="${x}" cy="${y}" r="2" fill="${_CF}"/>` }); return `<g transform="translate(60,90)"><path d="M-30,0 A30,30 0 0 1 30,0" fill="none" stroke="${_CS}" stroke-width="1.8"/>${ticks}<line x1="0" y1="0" x2="20" y2="-14" stroke="${_CS}" stroke-width="1.8"/><circle cx="0" cy="0" r="3.5" fill="${_CF}"/></g>` },
  ivi: (p) => `<g transform="translate(60,84)">
    <rect x="-34" y="-24" width="68" height="44" rx="6" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <rect x="-28" y="-18" width="56" height="32" rx="3" fill="none" stroke="${_CL}" stroke-width="1"/>
    ${[-20, -4, 12].map(y => `<rect x="-24" y="${y}" width="${20 + ((y + 20) % 16)}" height="5" rx="2" fill="${_CF}"/>`).join('')}
    <line x1="0" y1="20" x2="0" y2="28" stroke="${_CM}" stroke-width="1.2"/>
  </g>`,
  gnss: (p) => `<g transform="translate(60,72)">
    <rect x="-16" y="-14" width="32" height="16" rx="3" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <line x1="-10" y1="-14" x2="-10" y2="-22" stroke="${_CM}" stroke-width="1.2"/>
    <line x1="10" y1="-14" x2="10" y2="-22" stroke="${_CM}" stroke-width="1.2"/>
    <path d="M-20,-18 A22,22 0 0 1 20,-18" fill="none" stroke="${_CL}" stroke-width="1"/>
    <path d="M-26,-12 A28,28 0 0 1 26,-12" fill="none" stroke="${_CL}" stroke-width="1"/>
    <circle cx="0" cy="34" r="4" fill="${_CF}"/>
    <path d="M0,28 l-5,8 h10 z" fill="${_CF}"/>
  </g>`,
  roadmap: (p) => `<g transform="translate(60,84)">
    <path d="M-40,12 C-20,-22 20,-22 40,12" fill="none" stroke="${_CS}" stroke-width="1.8"/>
    ${[[-40, 12], [0, -6], [40, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="${_CM}" stroke-width="1.3"/><circle cx="${x}" cy="${y}" r="2.5" fill="${_CF}"/>`).join('')}
  </g>`,
  radar: (p) => `<g transform="translate(60,78)">
    ${[14, 24, 34].map(r => `<path d="M0,0 A${r},${r} 0 0 1 ${r},0" fill="none" stroke="${_CL}" stroke-width="1"/>`).join('')}
    <line x1="0" y1="0" x2="34" y2="0" stroke="${_CS}" stroke-width="1.6"/>
    <g transform="translate(0,8)"><path d="M-16,-6 l4,-6 h24 l4,6 v8 h-32 z" fill="none" stroke="${_CM}" stroke-width="1.2"/><circle cx="-10" cy="4" r="3" fill="none" stroke="${_CM}" stroke-width="1"/><circle cx="10" cy="4" r="3" fill="none" stroke="${_CM}" stroke-width="1"/></g>
    <circle cx="0" cy="0" r="3" fill="${_CF}"/>
  </g>`,
  ota: (p) => `<g transform="translate(60,76)">
    <path d="M-22,4 a12,12 0 0 1 22,-6 a10,10 0 0 1 18,4 a9,9 0 0 1 -2,18 h-34 a10,10 0 0 1 -4,-16 z" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="0" y1="14" x2="0" y2="34" stroke="${_CS}" stroke-width="1.8"/>
    <path d="M-6,28 l6,8 l6,-8" fill="none" stroke="${_CS}" stroke-width="1.8"/>
  </g>`,
  battery: (p) => `<g transform="translate(60,84)">
    <rect x="-30" y="-20" width="60" height="40" rx="6" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <rect x="30" y="-8" width="6" height="16" rx="2" fill="${_CF}"/>
    ${[-15, 5, 25].map(x => `<line x1="${x}" y1="-20" x2="${x}" y2="20" stroke="${_CM}" stroke-width="1.2"/>`).join('')}
    <path d="M-6,-6 l-4,8 h6 l-4,8" fill="none" stroke="${_CF}" stroke-width="1.6"/>
  </g>`,
  powertrain: (p) => `<g transform="translate(60,84)">
    <rect x="-26" y="-18" width="40" height="36" rx="5" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <rect x="14" y="-8" width="14" height="16" rx="3" fill="none" stroke="${_CM}" stroke-width="1.3"/>
    <circle cx="-8" cy="0" r="8" fill="none" stroke="${_CM}" stroke-width="1.2"/>
    <line x1="-26" y1="0" x2="14" y2="0" stroke="${_CL}" stroke-width="1"/>
  </g>`,
  chassis: (p) => `<g transform="translate(60,84)">
    <path d="M-38,6 L-30,-6 L-10,-10 L10,-10 L30,-6 L38,6" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="-30" y1="6" x2="30" y2="6" stroke="${_CM}" stroke-width="1.3"/>
    <circle cx="-20" cy="10" r="8" fill="none" stroke="${_CM}" stroke-width="1.4"/>
    <circle cx="20" cy="10" r="8" fill="none" stroke="${_CM}" stroke-width="1.4"/>
    <circle cx="-20" cy="10" r="2.5" fill="${_CF}"/><circle cx="20" cy="10" r="2.5" fill="${_CF}"/>
  </g>`,
  body: (p) => `<g transform="translate(60,84)">
    <path d="M-40,10 L-34,-2 Q-30,-14 -10,-14 L14,-14 Q30,-14 34,-2 L40,10 Z" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="-44" y1="10" x2="44" y2="10" stroke="${_CM}" stroke-width="1.3"/>
    <circle cx="-22" cy="12" r="7" fill="none" stroke="${_CM}" stroke-width="1.3"/>
    <circle cx="22" cy="12" r="7" fill="none" stroke="${_CM}" stroke-width="1.3"/>
  </g>`,
  testmod: (p) => `<g transform="translate(60,84)">
    ${[-18, 0, 18].map(y => `<rect x="-30" y="${y - 8}" width="60" height="16" rx="3" fill="none" stroke="${_CM}" stroke-width="1.3"/><circle cx="-22" cy="${y}" r="2" fill="${_CF}"/>`).join('')}
    <path d="M30,-28 l5,5 l-5,5" fill="none" stroke="${_CS}" stroke-width="1.4"/>
  </g>`,
  dbc: (p) => `<g transform="translate(60,82)">
    <rect x="-36" y="-22" width="72" height="44" rx="4" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <line x1="-36" y1="-10" x2="36" y2="-10" stroke="${_CM}" stroke-width="1.1"/>
    <line x1="-12" y1="-22" x2="-12" y2="22" stroke="${_CM}" stroke-width="1.1"/>
    ${[-16, 2, 20].map(y => `<line x1="-34" y1="${y}" x2="34" y2="${y}" stroke="${_CL}" stroke-width=".8"/>`).join('')}
    <path d="M10,6 l8,8 l-16,0 z" fill="${_CF}"/>
  </g>`,
  automation: (p) => `<g transform="translate(60,84)">
    ${[-18, -2, 14].map((y, i) => `<rect x="${-30 + i * 3}" y="${y - 7}" width="60" height="14" rx="3" fill="none" stroke="${_CM}" stroke-width="1.3"/>`).join('')}
    <path d="M30,-22 l5,5 l-5,5" fill="none" stroke="${_CS}" stroke-width="1.4"/>
  </g>`,
  report: (p) => `<g transform="translate(60,82)">
    <path d="M-22,-26 L10,-26 L26,-10 L26,26 L-22,26 Z" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <path d="M10,-26 L10,-10 L26,-10" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    ${[-16, -6, 4, 14].map(y => `<line x1="-14" y1="${y}" x2="14" y2="${y}" stroke="${_CM}" stroke-width="1"/>`).join('')}
    <path d="M-6,18 l4,4 l8,-10" fill="none" stroke="${_CF}" stroke-width="1.8"/>
  </g>`,
  hil: (p) => `<g transform="translate(60,84)">
    <rect x="-26" y="-28" width="52" height="56" rx="4" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    ${[-20, -6, 8, 22].map(y => `<rect x="-20" y="${y}" width="40" height="8" rx="2" fill="none" stroke="${_CM}" stroke-width="1.1"/>`).join('')}
    <circle cx="18" cy="-22" r="2" fill="${_CF}"/>
  </g>`,
  iso: (p) => `<g transform="translate(60,82)">
    <path d="M0,-28 L24,-18 V4 C24,18 12,26 0,30 C-12,26 -24,18 -24,4 V-18 Z" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <path d="M-10,2 l7,8 l12,-16" fill="none" stroke="${_CF}" stroke-width="1.8"/>
  </g>`,
  autosar: (p) => `<g transform="translate(60,84)">
    ${[-20, -6, 8, 22].map((y, i) => `<rect x="-30" y="${y - 5}" width="60" height="11" rx="2" fill="none" stroke="${_CM}" stroke-width="1.2"/><text x="-26" y="${y + 3}" font-size="6" fill="${_CM}" font-family="monospace">L${i}</text>`).join('')}
    <line x1="-30" y1="2" x2="-40" y2="2" stroke="${_CS}" stroke-width="1.2"/>
    <line x1="30" y1="2" x2="40" y2="2" stroke="${_CS}" stroke-width="1.2"/>
  </g>`,
  chip: (p) => `<g transform="translate(60,84)">
    <rect x="-18" y="-18" width="36" height="36" rx="4" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    ${[-12, 0, 12].map(x => `<line x1="${x}" y1="-18" x2="${x}" y2="-24" stroke="${_CM}" stroke-width="1.2"/><line x1="${x}" y1="18" x2="${x}" y2="24" stroke="${_CM}" stroke-width="1.2"/>`).join('')}
    ${[-12, 12].map(y => `<line x1="-18" y1="${y}" x2="-24" y2="${y}" stroke="${_CM}" stroke-width="1.2"/><line x1="18" y1="${y}" x2="24" y2="${y}" stroke="${_CM}" stroke-width="1.2"/>`).join('')}
    <rect x="-8" y="-8" width="16" height="16" rx="2" fill="none" stroke="${_CF}" stroke-width="1.2"/>
  </g>`,
  touch: (p) => `<g transform="translate(60,80)">
    <rect x="-30" y="-26" width="60" height="40" rx="6" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <path d="M6,18 q10,-18 2,-22 q-4,2 -2,8 q-2,-6 -6,-2 q-2,4 0,8 q-4,-2 -6,4 q-2,6 4,10 z" fill="none" stroke="${_CM}" stroke-width="1.3"/>
    <circle cx="6" cy="-6" r="2" fill="${_CF}"/>
  </g>`,
  media: (p) => `<g transform="translate(60,84)">
    <circle cx="-6" cy="0" r="22" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <path d="M-2,-10 L12,0 L-2,10 Z" fill="${_CF}"/>
    ${[-8, 2, 12].map(x => `<path d="M${x},-12 q4,12 0,24" fill="none" stroke="${_CM}" stroke-width="1.2"/>`).join('')}
  </g>`,
  bt: (p) => `<g transform="translate(60,84)">
    <path d="M0,-26 L18,-8 L0,10 L18,28" fill="none" stroke="${_CS}" stroke-width="1.8"/>
    <path d="M0,-26 L0,10 M0,10 L18,-8 M0,10 L0,28 M0,10 L18,28" fill="none" stroke="${_CS}" stroke-width="1.6"/>
  </g>`,
  voice: (p) => `<g transform="translate(60,84)">
    ${[-28, -18, -8, 2, 12, 22].map((x, i) => { const h = [14, 26, 38, 30, 22, 12][i]; return `<line x1="${x}" y1="${-h / 2}" x2="${x}" y2="${h / 2}" stroke="${_CM}" stroke-width="2" stroke-linecap="round"/>` }).join('')}
  </g>`,
  sliders: (p) => `<g transform="translate(60,84)">
    ${[-14, 2, 18].map(y => `<line x1="-30" y1="${y}" x2="30" y2="${y}" stroke="${_CM}" stroke-width="1.4"/><circle cx="${-10 + ((y + 14) * 1.3) % 30}" cy="${y}" r="5" fill="none" stroke="${_CS}" stroke-width="1.6"/>`).join('')}
  </g>`,
  carplay: (p) => `<g transform="translate(60,80)">
    <rect x="-14" y="-26" width="28" height="52" rx="6" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <line x1="-14" y1="-18" x2="14" y2="-18" stroke="${_CM}" stroke-width="1"/>
    <circle cx="0" cy="22" r="2" fill="${_CF}"/>
    <path d="M-10,30 L-6,22 Q-2,18 16,18 L22,24 L26,30 Z" fill="none" stroke="${_CM}" stroke-width="1.3"/>
  </g>`,
  perf: (p) => `<g transform="translate(60,84)">
    <line x1="-30" y1="22" x2="30" y2="22" stroke="${_CM}" stroke-width="1.3"/>
    ${[-26, -12, 2, 16].map((x, i) => { const h = [16, 28, 22, 34][i]; return `<rect x="${x}" y="${22 - h}" width="9" height="${h}" rx="1.5" fill="none" stroke="${_CS}" stroke-width="1.5"/>` }).join('')}
  </g>`,
  reverse: (p) => `<g transform="translate(60,82)">
    <rect x="-34" y="-22" width="68" height="44" rx="4" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <line x1="0" y1="-22" x2="0" y2="22" stroke="${_CL}" stroke-width="1"/>
    <line x1="-34" y1="0" x2="34" y2="0" stroke="${_CL}" stroke-width="1"/>
    <path d="M-20,16 L-12,8 L-4,16" fill="none" stroke="${_CF}" stroke-width="1.4"/>
    <path d="M12,16 L20,8 L28,16" fill="none" stroke="${_CF}" stroke-width="1.4"/>
  </g>`,
  carintro: (p) => `<g transform="translate(60,84)">
    <path d="M-42,8 L-34,-4 Q-28,-18 0,-18 Q24,-18 32,-4 L42,8 Z" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="-46" y1="8" x2="46" y2="8" stroke="${_CM}" stroke-width="1.3"/>
    <circle cx="-22" cy="10" r="8" fill="none" stroke="${_CM}" stroke-width="1.4"/>
    <circle cx="22" cy="10" r="8" fill="none" stroke="${_CM}" stroke-width="1.4"/>
  </g>`,
  desk: (p) => `<g transform="translate(60,82)">
    <path d="M-30,-18 L30,-18 L26,-2 L-26,-2 Z" fill="none" stroke="${_CS}" stroke-width="1.5"/>
    <rect x="-34" y="0" width="68" height="6" rx="2" fill="none" stroke="${_CM}" stroke-width="1.4"/>
    <line x1="0" y1="6" x2="0" y2="14" stroke="${_CM}" stroke-width="1.2"/>
    <rect x="-22" y="-14" width="44" height="10" rx="1" fill="none" stroke="${_CL}" stroke-width="1"/>
  </g>`,
  freetools: (p) => { let teeth = ''; [0, 60, 120, 180, 240, 300].forEach(a => { const rad = a * Math.PI / 180; teeth += `<line x1="${(Math.cos(rad) * 12).toFixed(1)}" y1="${(-4 + Math.sin(rad) * 12).toFixed(1)}" x2="${(Math.cos(rad) * 16).toFixed(1)}" y2="${(-4 + Math.sin(rad) * 16).toFixed(1)}" stroke="${_CM}" stroke-width="1.4"/>` }); return `<g transform="translate(60,84)"><circle cx="-6" cy="-4" r="12" fill="none" stroke="${_CS}" stroke-width="1.5"/>${teeth}<path d="M12,-14 a7,7 0 1 1 10,10 l-8,8 -4,-4 z" fill="none" stroke="${_CS}" stroke-width="1.5"/></g>` },
  bug: (p) => `<g transform="translate(60,84)">
    <ellipse cx="0" cy="2" rx="12" ry="16" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <line x1="0" y1="-14" x2="0" y2="18" stroke="${_CM}" stroke-width="1.1"/>
    <line x1="-12" y1="-6" x2="-12" y2="10" stroke="${_CM}" stroke-width="1.1"/>
    <line x1="12" y1="-6" x2="12" y2="10" stroke="${_CM}" stroke-width="1.1"/>
    <line x1="-12" y1="-6" x2="-20" y2="-10" stroke="${_CM}" stroke-width="1"/>
    <line x1="12" y1="-6" x2="20" y2="-10" stroke="${_CM}" stroke-width="1"/>
    <line x1="-12" y1="10" x2="-20" y2="14" stroke="${_CM}" stroke-width="1"/>
    <line x1="12" y1="10" x2="20" y2="14" stroke="${_CM}" stroke-width="1"/>
    <circle cx="0" cy="-12" r="3" fill="none" stroke="${_CM}" stroke-width="1.2"/>
  </g>`,
  domain: (p) => `<g transform="translate(60,84)">
    <rect x="-14" y="-12" width="28" height="24" rx="4" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    ${[[-30, -18], [-30, 18], [30, -18], [30, 18]].map(([x, y]) => `<line x1="${x > 0 ? 14 : -14}" y1="0" x2="${x}" y2="${y}" stroke="${_CM}" stroke-width="1.2"/><rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/>`).join('')}
  </g>`,
  cockpit: (p) => `<g transform="translate(60,84)">
    <circle cx="0" cy="2" r="18" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <circle cx="0" cy="2" r="4" fill="none" stroke="${_CM}" stroke-width="1.3"/>
    <line x1="0" y1="2" x2="0" y2="-16" stroke="${_CM}" stroke-width="1.3"/>
    <line x1="0" y1="2" x2="16" y2="2" stroke="${_CM}" stroke-width="1.3"/>
    <rect x="-34" y="-14" width="14" height="20" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/>
    <rect x="20" y="-14" width="14" height="20" rx="2" fill="none" stroke="${_CL}" stroke-width="1.2"/>
  </g>`,
  cyber: (p) => `<g transform="translate(60,82)">
    <rect x="-18" y="-4" width="36" height="30" rx="5" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <path d="M-10,-4 V-14 a10,10 0 0 1 20,0 V-4" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <circle cx="0" cy="8" r="4" fill="none" stroke="${_CF}" stroke-width="1.4"/>
    <line x1="0" y1="12" x2="0" y2="18" stroke="${_CF}" stroke-width="1.4"/>
  </g>`,
  gb: (p) => `<g transform="translate(60,82)">
    <path d="M-22,-26 L10,-26 L26,-10 L26,26 L-22,26 Z" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    <path d="M10,-26 L10,-10 L26,-10" fill="none" stroke="${_CS}" stroke-width="1.6"/>
    ${[-16, -6, 4].map(y => `<line x1="-14" y1="${y}" x2="16" y2="${y}" stroke="${_CM}" stroke-width="1"/>`).join('')}
    <circle cx="6" cy="16" r="9" fill="none" stroke="${_CF}" stroke-width="1.4"/>
    <text x="6" y="19" font-size="7" fill="${_CF}" text-anchor="middle" font-family="monospace">GB</text>
  </g>`
}
const COVER_FALLBACK = { A: 'bus', B: 'canoe', C: 'vmodel', D: 'gauge', E: 'ivi', F: 'iso', R: 'roadmap' }
const COVER_MAP = {
  1: 'topology', 2: 'bus', 3: 'lin', 4: 'flexray', 5: 'eth', 6: 'uds', 7: 'obd', 8: 'canoe', 9: 'capl', 10: 'python',
  11: 'zcanpro', 12: 'vmodel', 13: 'gauge', 14: 'ivi', 15: 'gnss', 16: 'roadmap', 17: 'radar', 18: 'ota', 19: 'battery',
  20: 'powertrain', 21: 'chassis', 22: 'body', 23: 'testmod', 24: 'dbc', 25: 'automation', 26: 'report', 27: 'hil',
  28: 'iso', 29: 'autosar', 30: 'chip', 31: 'touch', 32: 'media', 33: 'bt', 34: 'voice', 35: 'sliders', 36: 'carplay',
  37: 'perf', 38: 'reverse', 39: 'carintro', 40: 'desk', 41: 'freetools', 42: 'bug', 43: 'domain', 44: 'cockpit',
  45: 'vmodel', 46: 'cyber', 47: 'gb', 48: 'iso', 49: 'cyber', 50: 'canoe', 51: 'dbc'
}
function genCoverV2(module, num) {
  const key = COVER_MAP[num] || COVER_FALLBACK[module] || 'bus'
  const fn = COVER_MOTIFS_V2[key] || COVER_MOTIFS_V2.bus
  const p = seedParams(num)
  const motif = fn(p, num)
  return `<svg width="100%" height="100%" viewBox="0 0 120 168" preserveAspectRatio="xMidYMid slice">${bgDots(p.density)}${motif}</svg>`
}

const MODULE_NAMES = { A: '网络与协议', B: '工具链', C: '流程与方法', D: '域测试专项', E: '座舱功能测试', F: '标准与进阶', R: '学习路径' }
const MODULE_COLORS = { A: '#2563eb', B: '#06b6d4', C: '#8b5cf6', D: '#f59e0b', E: '#10b981', F: '#ef4444', R: '#ec4899' }

/* ========== 知识点卡片右侧矢量线稿 SVG ========== */
const _S = (s) => `<svg viewBox="0 0 80 80" fill="none" stroke="rgba(130,155,190,.45)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${s}</svg>`
const KP_ART = [
  /* 0 - 芯片/ECU */
  _S('<rect x="22" y="18" width="36" height="44" rx="4"/><line x1="28" y1="18" x2="28" y2="10"/><line x1="38" y1="18" x2="38" y2="10"/><line x1="48" y1="18" x2="48" y2="10"/><line x1="28" y1="62" x2="28" y2="70"/><line x1="38" y1="62" x2="38" y2="70"/><line x1="48" y1="62" x2="48" y2="70"/><circle cx="40" cy="40" r="7"/><path d="M36 36 L44 44 M44 36 L36 44"/>'),
  /* 1 - 五大域/网格 */
  _S('<rect x="18" y="18" width="18" height="18" rx="2" opacity=".6"/><rect x="40" y="18" width="18" height="18" rx="2" opacity=".6"/><rect x="18" y="40" width="18" height="18" rx="2" opacity=".6"/><rect x="40" y="40" width="18" height="18" rx="2" opacity=".6"/><line x1="27" y1="27" x2="49" y2="27"/><line x1="27" y1="49" x2="49" y2="49"/>'),
  /* 2 - 架构演进/层级 */
  _S('<rect x="12" y="52" width="18" height="14" rx="2"/><rect x="22" y="38" width="24" height="14" rx="2"/><rect x="32" y="24" width="32" height="14" rx="2"/><path d="M48 30 L52 24 L56 30"/><path d="M56 30 L56 38"/><path d="M38 44 L42 38 L46 44"/>'),
  /* 3 - 总线拓扑/节点 */
  _S('<circle cx="16" cy="40" r="5"/><circle cx="40" cy="20" r="5"/><circle cx="64" cy="40" r="5"/><circle cx="40" cy="60" r="5"/><line x1="21" y1="40" x2="35" y2="25"/><line x1="45" y1="25" x2="59" y2="40"/><line x1="35" y1="55" x2="45" y2="55"/><line x1="40" y1="55" x2="40" y2="65"/><line x1="16" y1="40" x2="40" y2="55"/>'),
  /* 4 - 网关/桥梁 */
  _S('<rect x="8" y="22" width="22" height="36" rx="3"/><rect x="50" y="22" width="22" height="36" rx="3"/><path d="M30 30 L50 26"/><path d="M30 38 L50 34"/><path d="M30 46 L50 42"/><path d="M30 54 L50 50"/><circle cx="40" cy="20" r="5"/>'),
  /* 5 - 域控vs分布/对比 */
  _S('<circle cx="38" cy="24" r="14"/><circle cx="38" cy="24" r="6"/><circle cx="18" cy="52" r="6"/><circle cx="40" cy="62" r="6"/><circle cx="62" cy="52" r="6"/><line x1="24" y1="52" x2="32" y2="36"/><line x1="40" y1="56" x2="38" y2="38"/><line x1="56" y1="52" x2="44" y2="36"/>'),
  /* 6 - 面试/靶心 */
  _S('<circle cx="40" cy="40" r="28"/><circle cx="40" cy="40" r="18"/><circle cx="40" cy="40" r="8"/><circle cx="40" cy="40" r="2" fill="rgba(130,155,190,.45)"/>'),
  /* 7 - 实战/工具 */
  _S('<rect x="26" y="22" width="16" height="14" rx="2"/><path d="M42 30 L64 52 L58 58 L36 36 Z"/><circle cx="38" cy="38" r="4"/><line x1="42" y1="22" x2="42" y2="18"/>')
]

/* 第2章"CAN帧格式"原始内容已完整解析为 content_blocks：
   标准帧 vs 扩展帧逐位对比、IDE位仲裁转折点、实际应用场景分配、
   混合网络行为规则、填充位(Bit Stuffing)原理、四种帧类型等全部内容
   — 不再使用静态 SVG 映射，详情面板直接从 content_blocks 渲染 — */
/* ========== 主控制器 ========== */
const App = {
  chapters: [],
  loading: false,

  async init() {
    Theme.init()
    LastViewed.load()

    // 1. 车企卡片：立即渲染（不依赖 chapters.json）
    this.renderOEM()

    // 3. 加载 chapters.json → 渲染卡片 + 筛选
    this.loading = true
    try {
      if (window.__SITE_DATA__ && window.__SITE_DATA__.chapters) {
        this.chapters = window.__SITE_DATA__.chapters
      } else {
        let loaded = null
        // 会话内缓存：避免每次整页切换都重新拉取章节索引（提升页面切换速度）
        try {
          const c = sessionStorage.getItem('avt-chapters')
          if (c) loaded = JSON.parse(c)
        } catch {}
        if (!loaded) {
          const res = await fetch('data/chapters.json')
          if (!res.ok) throw new Error('HTTP ' + res.status)
          const d = await res.json()
          loaded = d.chapters || []
          try { sessionStorage.setItem('avt-chapters', JSON.stringify(loaded)) } catch {}
        }
        this.chapters = loaded
      }
    } catch (e) {
      console.warn('chapters.json fallback:', e.message)
      this.chapters = []
    }
    this.loading = false
    // 下拉填充独立于数据加载 try 块：即使出错也不应清空核心 chapters 导致卡片空白
    this._populateKbDropdown()
    this._initDropdown()

    // 页面路由：首页 / 全量列表 / 章节详情
    const pathname = window.location.pathname
    const isChaptersPage = pathname.includes('chapters.html')
    const isChapterPage = !isChaptersPage && pathname.includes('chapter.html')
    if (isChapterPage) {
      this.renderChapterDetail()
    } else if (isChaptersPage) {
      this.buildFilters()
      this.buildLevelFilters()
      this.renderAllChapters('all')
      this.bindFilter()
      this.bindLevelFilter()
    } else {
      this.renderFeatured()
    }
    // 搜索与筛选状态（站内搜索 P0 + 能力分级）
    this._filter = 'all'
    this._level = 'all'
    this._search = ''
    this.initSearch()
    this.initGlossary()
    this.observeCards()
    this._guardCardSelection()

    // 数据驱动计数：用真实数据填充页面上的计数占位（避免硬编码漂移）
    this.syncCounts()
  },

  /* --- 数据驱动计数同步（章节数 / 术语数 / SEO meta） --- */
  syncCounts() {
    if (typeof document === 'undefined') return
    const n = (this.chapters && this.chapters.length) ||
      (window.__SITE_DATA__ && window.__SITE_DATA__.chapters && window.__SITE_DATA__.chapters.length) || 0
    if (n) {
      document.querySelectorAll('[data-chapter-count]').forEach((el) => { el.textContent = String(n) })
      // SEO meta 同步（静态兜底已正确，这里随真实数据刷新，避免未来漂移）
      const meta = document.querySelector('meta[name="description"]')
      if (meta) {
        const c = meta.getAttribute('content')
        if (c) meta.setAttribute('content', c.replace(/\d+\s*章/g, n + ' 章'))
      }
    }
    const g = (window.__SITE_DATA__ && window.__SITE_DATA__.glossary && window.__SITE_DATA__.glossary.length) || 0
    if (g) document.querySelectorAll('[data-glossary-count]').forEach((el) => { el.textContent = String(g) })
  },

  /* --- 站内搜索：头部全局输入框 --- */
  initSearch() {
    const input = document.getElementById('hdr-search')
    if (!input) return
    const isChapters = window.location.pathname.includes('chapters.html')
    input.addEventListener('input', () => {
      if (isChapters) {
        this._search = input.value.trim()
        this._applyList(false)
      }
    })
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = encodeURIComponent(input.value.trim())
        if (!isChapters && q) window.location.href = 'chapters.html?q=' + q
      }
    })
    const sBtn = document.getElementById('hdr-search-btn')
    if (sBtn) sBtn.addEventListener('click', () => {
      const q = encodeURIComponent(input.value.trim())
      if (isChapters) {
        this._search = input.value.trim()
        this._applyList(false)
      } else if (q) {
        window.location.href = 'chapters.html?q=' + q
      }
    })
    // 知识库页：从 ?q= 预填并即时过滤
    if (isChapters) {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('q')
      if (q) {
        input.value = q
        this._search = q
        this._applyList(false)
      }
    }
  },

  /* --- 卡片点击防误跳：允许选中文字复制而不触发跳转 --- */
  _guardCardSelection() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest && e.target.closest('.chapter-card')
      if (!link) return
      const sel = window.getSelection && window.getSelection()
      // 若用户刚产生了文本选择（拖选 / 双击选词），则取消本次卡片导航，保留选择以便复制
      if (sel && sel.toString().trim().length > 0) {
        e.preventDefault()
      }
    }, true)
  },

  /* --- 车企卡片渲染 --- */
  renderOEM() {
    const grid = document.getElementById('oem-grid')
    if (!grid) return
    grid.innerHTML = OEM_DATA.map(o => {
      const tagsHTML = o.tags.map(t => `<span class="tag">${t}</span>`).join('')
      const icon = OEM_ICONS[o.name] || ''
      const brandColor = OEM_BRAND[o.name] || '#2563eb'
      return `<div class="oem-card" style="--oem-color:${brandColor}">
        <div class="oem-img-wrap">
          <div class="oem-brand-icon">${icon}</div>
        </div>
        <div class="oem-name">${o.name}</div>
        <div class="oem-desc">${o.desc}</div>
        <div class="oem-tags">${tagsHTML}</div>
      </div>`
    }).join('')
    requestAnimationFrame(() => this.observeCards())
  },

  /* --- 首页精选卡片（前6张） --- */
  renderFeatured() {
    const grid = document.getElementById('card-grid')
    if (!grid) return
    const list = this.chapters.slice(0, 6)
    if (!list.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-3)">暂无内容</div>'
      return
    }
    grid.innerHTML = list.map(c => this._cardHTML(c, '')).join('')
    requestAnimationFrame(() => this.observeCards())
  },

  /* --- 章节详情页：全宽 Banner + 知识点卡片递进 --- */
  async renderChapterDetail() {
    const params = new URLSearchParams(window.location.search)
    const id = parseInt(params.get('id')) || 1
    const chapter = this.chapters.find(c => c.num === id)
    if (!chapter) {
      const banner = document.getElementById('chapter-banner')
      if (banner) banner.innerHTML = '<div class="banner-inner"><h1 class="banner-title" style="color:#fff">该章节尚未编制</h1><p class="banner-desc">请从首页或全部章节页面浏览已有内容</p></div>'
      return
    }
    document.title = `${this._cardName(chapter.title)} - 车载测试学堂`
    // file:// / opaque origin 下 history.replaceState 带 URL 会抛 SecurityError，静默跳过（P0 守门）
    if (chapter.slug) {
      try { history.replaceState(null, '', `?id=${chapter.num}`) } catch (e) {}
    }
    // 最近查看：打开章节即记录访问时间（自学导向，不做进度/打卡）
    LastViewed.touch(chapter.num)
    this._renderBanner(chapter)
    this._renderKnowledgePoints(chapter)
    this._initFloatActions()
  },

  _renderBanner(chapter) {
    const banner = document.getElementById('chapter-banner')
    if (!banner) return
    const mc = chapter.color || MODULE_COLORS[chapter.module] || '#2563eb'
    // 横屏 Banner 封面（与卡片封面分离）；缺失时回退卡片封面，再缺失则隐藏
    const bannerImg = `assets/images/chapter-banner-${String(chapter.num).padStart(2,'0')}.png`
    const coverImg = `assets/images/chapter-cover-${String(chapter.num).padStart(2,'0')}.webp`
    banner.style.setProperty('--kp-accent', mc)
    banner.style.background = `linear-gradient(135deg, ${mc} 0%, ${mc}88 100%)`
    // 徽章
    const modName = chapter.moduleName || MODULE_NAMES[chapter.module] || ''
    const badgeMod = `<span class="banner-badge banner-badge-mod">${modName}</span>`
    const badgeCore = chapter.star === '核心'
      ? '<span class="banner-badge core">' + ICON('star') + '核心推荐</span>'
      : `<span class="banner-badge">${ICON('book')} ${chapter.star}</span>`

    banner.innerHTML = `
      <img src="${bannerImg}" class="banner-bg-img" alt="" loading="eager"
        onerror="this.onerror=null;this.src='${coverImg}';this.onerror=function(){this.style.display='none'}">
      <div class="banner-gradient"></div>
      <div class="banner-cover-art">${genCoverV2(chapter.module, chapter.num)}</div>
      <div class="banner-inner">
        <div class="banner-badges">${badgeMod}${badgeCore}</div>
        <h1 class="banner-title">${this._cardName(chapter.title)}</h1>
        <p class="banner-desc">${this.esc(chapter.oneliner || '')}</p>
        <div class="banner-meta">
          <span class="banner-meta-item">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <b>${chapter.kp}</b> 个知识点
          </span>
          <span class="banner-meta-item">
            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            ${chapter.module} · ${modName}
          </span>
        </div>
      </div>`
  },

  _renderKnowledgePoints(chapter) {
    const row = document.getElementById('kp-row')
    if (!row) return
    const sections = chapter.sections || []
    const desc = document.getElementById('kp-section-desc')
    if (desc) desc.textContent = `共 ${sections.length} 个知识点`

    if (!sections.length) {
      row.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text-3)">暂无知识点</div>'
      return
    }

    const total = sections.length
    const third = Math.max(1, Math.ceil(total / 3))
    const stageLabels = ['入门筑基', '核心掌握', '进阶深入']

    // 立即渲染缩略卡片（图标占位，异步填充）
    const renderThumbs = () => {
      row.innerHTML = sections.map((title, i) => {
        // sections 可能是字符串数组（标题）或对象数组
        const titleStr = typeof title === 'string' ? title : (title.title || '')
        const stage = Math.min(2, Math.floor(i / third))
        return `<div class="kp-thumb kp-stage-${stage}" data-idx="${i}" role="button" tabindex="0" aria-label="查看知识点 ${i+1}">
          <div class="kp-tn-num">${String(i + 1).padStart(2,'0')}</div>
          <div class="kp-tn-title">${this._shortTitle(titleStr)}</div>
          <div class="kp-tn-stage">${stageLabels[stage]}</div>
        </div>`
      }).join('')
    }
    renderThumbs()

    // 右侧目录（TOC）锚点：列出全部知识点，点击跳转
    this._buildToc(chapter, sections)

    // 手风琴：至少展开一个，不可关闭
    let openIdx = -1
    this._chapterContent = null

    row.addEventListener('click', (e) => {
      const thumb = e.target.closest('.kp-thumb')
      if (!thumb) return
      const idx = parseInt(thumb.dataset.idx)
      if (idx === openIdx) return // 不可关闭
      if (openIdx >= 0) {
        const prev = row.querySelector('.kp-thumb.active')
        if (prev) prev.classList.remove('active', 'switching')
      }
      thumb.classList.add('active', 'switching')
      openIdx = idx
      this._openDetail(idx, chapter, sections)
      setTimeout(() => thumb.classList.remove('switching'), 400)
    })

    // 键盘支持
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const thumb = e.target.closest('.kp-thumb')
        if (thumb) thumb.click()
      }
    })

    // 异步加载详细内容数据库
    this._prefetchAdjacent(chapter.num)
    this._loadChapterContent(chapter.num).then(content => {
      if (!content) {
        // 无内容也展开第一个
        if (openIdx === -1) {
          const first = row.querySelector('.kp-thumb')
          if (first) first.click()
        }
        return
      }
      this._chapterContent = content
      // 更新卡片标题为完整标题
      const secArr = content.sections || []
      secArr.forEach((sec, i) => {
        if (sec.title && typeof sec.title === 'string') {
          const thumb = row.querySelector(`.kp-thumb[data-idx="${i}"]`)
          if (thumb) {
            const titleEl = thumb.querySelector('.kp-tn-title')
            if (titleEl) titleEl.textContent = this._shortTitle(sec.title)
          }
        }
      })
      // 同步目录（TOC）标题为完整标题
      this._syncTocTitles(secArr)
      // 上下章导航（字段缺失时按章节序号 ±1 回退，保留 1–38 的既有意图跳转；修复 39–54 缺字段导致导航断裂）
      const _byNum = {}
      ;(this.chapters || []).forEach(c => { _byNum[c.num] = c })
      const _maxNum = this.chapters && this.chapters.length ? Math.max.apply(null, this.chapters.map(c => c.num)) : 54
      const _cNum = chapter.num
      const _resolveNav = (field, fallbackNum) => {
        if (!field && typeof fallbackNum !== 'number') return null
        const num = typeof field === 'number' ? field : (field && typeof field.num === 'number' ? field.num : fallbackNum)
        const ref = _byNum[num]
        if (!ref) return null
        const rawName = (field && typeof field === 'object' && field.name) ? field.name : (ref.title || '')
        return { num, name: this._cardName(rawName) }
      }
      const prevChapter = _resolveNav(content.prev_chapter, _cNum > 1 ? _cNum - 1 : null)
      const nextChapter = _resolveNav(content.next_chapter, _cNum < _maxNum ? _cNum + 1 : null)
      const navEl = document.getElementById('chapter-nav')
      if (navEl) {
        navEl.style.display = 'block'
        let navHTML = '<div class="cnav-inner">'
        if (prevChapter) {
          navHTML += `<a href="chapter.html?id=${prevChapter.num}" class="cnav-link cnav-prev">
              <span class="cnav-arrow" aria-hidden="true">←</span>
              <span class="cnav-text"><span class="cnav-label">上一章</span><span class="cnav-title">${this.esc(prevChapter.name)}</span></span>
            </a>`
        } else {
          navHTML += `<div class="cnav-link cnav-prev cnav-disabled"><span class="cnav-arrow" aria-hidden="true">←</span><span class="cnav-text"><span class="cnav-label">已是第一章</span></span></div>`
        }
        navHTML += `<div class="cnav-spacer"></div>`
        if (nextChapter) {
          navHTML += `<a href="chapter.html?id=${nextChapter.num}" class="cnav-link cnav-next">
              <span class="cnav-text"><span class="cnav-label">下一章</span><span class="cnav-title">${this.esc(nextChapter.name)}</span></span>
              <span class="cnav-arrow" aria-hidden="true">→</span>
            </a>`
        } else {
          navHTML += `<div class="cnav-link cnav-next cnav-disabled"><span class="cnav-text"><span class="cnav-label">已是最后一章</span></span><span class="cnav-arrow" aria-hidden="true">→</span></div>`
        }
        navHTML += '</div>'
        navEl.innerHTML = navHTML
      }

      // 章末总结
      if (content.summary) {
        const summary = document.getElementById('kp-summary')
        if (summary) {
          summary.style.display = 'block'
          summary.innerHTML = `<div class="kp-summary-label">${ICON('clipboard')} 本章总结</div><div class="kp-summary-text">${this._formatSummary(content.summary)}</div>`
        }
      }
      // 展开第一个（若尚未展开）
      if (openIdx === -1) {
        const first = row.querySelector('.kp-thumb')
        if (first) first.click()
      } else {
        // 刷新当前展开的内容
        this._openDetail(openIdx, chapter, sections)
      }
    })
  },

  /* 构建右侧目录（TOC）锚点 */
  _buildToc(chapter, sections) {
    const toc = document.getElementById('kp-toc')
    if (!toc) return
    const items = (sections || []).map((title, i) => {
      const titleStr = typeof title === 'string' ? title : (title.title || '')
      return `<button class="toc-item" data-idx="${i}" type="button">
        <span class="toc-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="toc-title">${this.esc(this._shortTitle(titleStr))}</span>
      </button>`
    }).join('')
    toc.innerHTML = `<div class="toc-head">${ICON('doc')} 本章目录</div>${items}`
    if (!toc.dataset.bound) {
      toc.addEventListener('click', (e) => {
        const item = e.target.closest('.toc-item')
        if (!item) return
        const idx = parseInt(item.dataset.idx)
        const row = document.getElementById('kp-row')
        const thumb = row ? row.querySelector(`.kp-thumb[data-idx="${idx}"]`) : null
        if (thumb) thumb.click()
      })
      toc.dataset.bound = '1'
    }
    /* 滚动协调（产品优化）：顶部“知识点导航”缩略图行可见时，隐藏右侧目录，
       避免同一组知识点被列表展示两次；目录改为浮于右侧、脱离文档流，
       显隐不再挤动正文宽度，避免滚动时正文/目录抖动。一旦滚过该行进入正文，目录重新出现便于跳转。 */
    const row = document.getElementById('kp-row')
    if (row && 'IntersectionObserver' in window) {
      if (this._tocIO) { try { this._tocIO.disconnect() } catch (e) {} }
      this._tocIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          toc.classList.toggle('toc-hidden', e.isIntersecting)
        })
      }, { rootMargin: '0px 0px 0px 0px', threshold: 0 })
      this._tocIO.observe(row)
    }
  },

  /* 同步右侧目录高亮（scroll-spy 等价物：内容区为单区切换模型，
     当前打开的知识点即"当前位置"，由 _openDetail 统一收口高亮，
     无论入口是点目录 / 点缩略图 / 键盘，目录都跟随当前内容） */
  _syncTocActive(idx) {
    const toc = document.getElementById('kp-toc')
    if (!toc) return
    toc.querySelectorAll('.toc-item.active').forEach(el => el.classList.remove('active'))
    const item = toc.querySelector(`.toc-item[data-idx="${idx}"]`)
    if (item) item.classList.add('active')
  },

  /* 内容加载后同步 TOC 标题为完整标题 */
  _syncTocTitles(secArr) {
    const toc = document.getElementById('kp-toc')
    if (!toc || !secArr) return
    secArr.forEach((sec, i) => {
      if (!sec || !sec.title) return
      const item = toc.querySelector(`.toc-item[data-idx="${i}"] .toc-title`)
      if (item) item.textContent = this._shortTitle(sec.title)
    })
  },

  /* 短标题：去掉序号前缀 */
  _shortTitle(title) {
    if (!title) return ''
    // 去掉 "一、"/"二、" 等中文序号前缀，保留核心语义
    return title.replace(/^[一二三四五六七八九十]+[、.]\s*/, '').replace(/^[A-Za-z]+\s*[:：]\s*/, '').trim()
  },

  /* 章末总结：合并为一段连续文本（不拆 chip、不分 Q&A），仅清洗 markdown/结构标记 */
  _formatSummary(text) {
    if (!text) return ''
    // 若是 "问题" > > "答案" 型，把两半拼回一段连续文字（不区分为问答）
    const qa = text.match(/^\s*[""'']([^"'']+)[""'']\s*(?:>\s*>|>>)\s*[""''](.+?)[""'']\s*$/s)
    const raw = qa ? (qa[1].trim() + '　' + qa[2].trim()) : text
    // 1. 移除代码块、markdown 标题、水平分隔线、粗斜体/行内代码标记
    const cleaned = raw
      .replace(/```[\s\S]*?```/g, '')              // 代码块
      .replace(/^#{1,6}\s+/gm, '')                 // 标题标记 # ## ###
      .replace(/^\s*[-*_]{3,}\s*$/gm, '')         // --- / *** / ___
      .replace(/\*\*(.*?)\*\*/g, '$1')             // **bold**
      .replace(/__(.*?)__/g, '$1')                 // __bold__
      .replace(/`(.*?)`/g, '$1')                   // `code`
      .replace(/^[┌┐└┘─├┤┬┴┼│↓←→↔⇄⇅ \t\-|]+$/gm, '') // 纯 ASCII 结构线
      .replace(/\s+/g, ' ')
      .trim()
    // 2. 合并为一段连续文本（不拆 chip、不分 Q&A）
    return `<p class="kp-summary-para">${this.esc(cleaned || text)}</p>`
  },

  /* 渲染单个内容块 — 自适应类型 */
  _renderBlock(b) {
    const t = b.type
    const esc = (s) => this.esc(s || '')

    // ── 段落 ──
    if (t === 'paragraph') {
      // 过滤章节中部的“返回 | 继续”导航条，与底部上下章导航重复
      if (/^[⬅←]\s*返回\s*\[\[.*?\]\]\s*\|\s*(?:继续\s*[→➡]?\s*)?\[\[.*?\]\]/.test(b.text || '')) return ''
      return `<p class="kb-paragraph">${escLink(b.text)}</p>`
    }

    // ── 三级标题 ──
    if (t === 'h3') {
      return `<h3 class="kb-h3">${escLink(b.text)}</h3>`
    }

    // ── 四级标题 ──
    if (t === 'h4') {
      return `<h4 class="kb-h4">${escLink(b.text)}</h4>`
    }

    // ── 分隔线 ──
    if (t === 'hr') {
      return `<hr class="kb-hr">`
    }

    // ── 表格 ──
    if (t === 'table') {
      // PM 视角：对比表需「固定维度列（首列）+ 高亮推荐列」，便于横向扫读时不丢失上下文、一眼锁定结论
      // 推荐列：按单元格文本信号（推荐/首选/优选/最佳…）自动识别，避免把“热度”列的 emoji 误判为推荐列
      const recMark = /推荐|首选|优选|最佳|建议选择|核心方案/
      const heatMark = /热度|优先级|常用程度/
      const recScore = {}
      ;(b.rows || []).forEach(r => {
        ;(b.headers || []).forEach((h, i) => {
          if (i === 0) return
          if (heatMark.test(h || '')) return // 热度列单独处理，不参与推荐列识别
          if (recMark.test(r[i] || '')) recScore[i] = (recScore[i] || 0) + 1
        })
      })
      let recIdx = -1, recBest = 0
      for (const k in recScore) { if (recScore[k] > recBest) { recBest = recScore[k]; recIdx = +k } }
      const isHeatCol = (i) => heatMark.test((b.headers || [])[i] || '')
      const cellCls = (i) => {
        let c = ''
        if (i === recIdx) c += ' kb-th-rec'
        if (i === 0) c += ' kb-th-dim'
        if (isHeatCol(i)) c += ' kb-th-heat'
        return c.trim()
      }
      // 单元格支持 **加粗** / `行内代码` Markdown，先转义 HTML 再解析，避免 XSS
      const renderCell = (s, i) => {
        const raw = s || ''
        // 热度/优先级列：把 emoji 星/勾转成可读文字标签
        if (isHeatCol(i)) {
          const t = raw.trim()
          if (/^[⭐★☆]+$/.test(t) || /高频|必考|重点/.test(t)) return '<span class="kb-prio kb-prio-high">高频</span>'
          if (/^[✅✓√]+$/.test(t) || /常用|日常/.test(t)) return '<span class="kb-prio kb-prio-daily">常用</span>'
          if (!t || t === '—' || t === '-') return '<span class="kb-prio kb-prio-none">—</span>'
        }
        return esc(raw)
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
      }
      // 表头文案优化："热度" → "优先级"
      const renderHeader = (h, i) => {
        const text = (h || '').replace(/^热度$/, '优先级')
        return renderCell(text, i)
      }
      const headers = (b.headers || []).map((h, i) => `<th class="${cellCls(i)}">${renderHeader(h, i)}</th>`).join('')
      const rows = (b.rows || []).map(r => {
        // Pad or trim cells to match header count
        const cells = (b.headers || []).map((_, i) => `<td class="${cellCls(i)}">${renderCell(r[i] || '', i)}</td>`).join('')
        return `<tr>${cells}</tr>`
      }).join('')
      const wrapCls = 'kb-table-wrap' + (recIdx >= 0 ? ' has-rec' : '')
      const hasCompareHeader = (b.headers || []).some(h => /对比|vs|比较|选型|差异|优劣/.test(h || ''))
      const isCompare = recIdx >= 0 || hasCompareHeader || (b.headers || []).length >= 4
      // 表格徽章文案：优先 block.badge；否则按表头关键词推断；兜底“对比视图”
      const badgeLabel = (() => {
        if (b.badge) return b.badge
        const hs = (b.headers || []).join(' ')
        if (/状态|掩码|bit/.test(hs)) return '状态位图'
        if (/速查/.test(hs)) return '速查视图'
        if (/格式|报文|请求|响应/.test(hs)) return '报文格式'
        if (/结构|布局|字段|边界/.test(hs)) return '结构视图'
        if (/参数|配置/.test(hs)) return '参数视图'
        if (/对比|vs|比较|选型|差异|优劣/.test(hs)) return '对比视图'
        return '对比视图'
      })()
      const badge = isCompare ? '<span class="kb-table-badge">' + ICON('scale') + ' ' + esc(badgeLabel) + '</span>' : ''
      const wrapCls2 = wrapCls + (isCompare ? ' has-compare' : '')
      return `<div class="${wrapCls2}">${badge}<table class="kb-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`
    }

    // ── 代码块（内容感知：路线图/信号图/IDE 编辑器，仅真正代码才用 IDE） ──
    if (t === 'code') {
      const variant = detectCodeVariant(b.code)
      if (variant === 'roadmap') return renderRoadmapHTML(b.code)
      if (variant === 'can-diff') return renderCanDiffHTML(b.code)
      if (variant === 'oscilloscope') return renderOscilloscopeHTML(b.code)
      if (variant === 'topology') {
        const topoHTML = renderTopologyHTML(b.code)
        if (topoHTML) return topoHTML
        // 未命中任何具体拓扑形态时，回退到「示意图」原样展示
      }
      if (variant === 'diagram') return renderDiagramHTML(b.code)

      // 真正代码：原生 IDE 编辑器（超长代码默认折叠，支持一键展开）
      const fn = b.filename || (b.language ? b.language.toLowerCase() : 'snippet')
      const lang = (b.language || 'text').toUpperCase()
      const codeLines = (b.code || '').split('\n')
      const collapsible = codeLines.length > 18
      const foldedCls = collapsible ? ' collapsed' : ''
      return `<div class="code-editor${foldedCls}" data-raw="${escAttr(b.code)}" data-lang="${escAttr(lang)}">
        <div class="ce-bar">
          <span class="ce-dots"><i></i><i></i><i></i></span>
          <span class="ce-tab">${ICON('file')} ${esc(fn)}</span>
          <span class="ce-lang">${esc(lang)}</span>
          ${collapsible ? '<button class="ce-fold" type="button">展开</button>' : ''}
          <button class="ce-copy" type="button">复制</button>
        </div>
        <div class="ce-body"><div class="ce-gutter"></div><div class="ce-code"></div></div>
      </div>`
    }

    // ── 三代 E/E 架构演进（显式类型，结构化数据渲染，非启发式） ──
    if (t === 'ee-evolution') return renderEeEvolutionHTML(b)

    // ── 拓扑图（显式类型，结构化数据渲染） ──
    if (t === 'topology') return renderTopologyBlockHTML(b)

    // ── ASCII 图表 ──（PM 视角：框线图应作为「示意图」呈现，带图题栏而非裸代码块）
    if (t === 'diagram') {
      const cap = b.caption ? esc(b.caption) : '示意图'
      return `<div class="kb-diagram" data-raw="${escAttr(b.code)}">
        <div class="kb-fig-bar"><span class="kb-fig-ic">${ICON('diagram')}</span><span>${cap}</span>
          <button class="kb-diagram-copy" type="button">复制</button></div>
        <pre><code>${esc(b.code)}</code></pre>
      </div>`
    }

    // ── 界面截图 / 示意图（矢量 SVG 仿界面，矢量清晰且可缩放）──
    if (t === 'image') {
      const src = b.src || ''
      if (!src) return ''
      const alt = b.alt ? esc(b.alt) : (b.caption ? esc(b.caption) : '界面示意图')
      const cap = b.caption ? esc(b.caption) : ''
      const imgClass = ['kb-image-img', 'is-lazy', b.class].filter(Boolean).join(' ')
      return `<figure class="kb-image">
        <img class="${imgClass}" data-src="${escAttr(src)}" alt="${alt}" loading="lazy" decoding="async">
        ${cap ? `<figcaption class="kb-image-cap"><span class="kb-image-ic">${ICON('image')}</span><span>${cap}</span></figcaption>` : ''}
      </figure>`
    }

    // ── 分层数据流图（如导航：定位层→计算层→交互层）──
    if (t === 'navflow') return renderNavFlowHTML(b.code)

    // ── 章节知识全景（垂直卡片式总结，替代拥挤的 ASCII 框线图）──
    if (t === 'summary') {
      const items = (b.items || []).map((it, i) => {
        const topic = esc(it.topic || '')
        const core = esc(it.core || '')
        const note = esc(it.note || '')
        return `<div class="ks-row" style="--i:${i}">
          <span class="ks-num">${i + 1}</span>
          <div class="ks-main">
            <div class="ks-topic">${topic}</div>
            <div class="ks-body">
              ${core ? `<div class="ks-core">${core}</div>` : ''}
              ${note ? `<div class="ks-note">${note}</div>` : ''}
            </div>
          </div>
        </div>`
      }).join('')
      const title = esc(b.title || '知识全景')
      const count = (b.items || []).length
      return `<div class="kb-summary">
        <div class="kb-summary-head"><span class="kb-summary-ic">${ICON('diagram')}</span><span class="kb-summary-title">${title}</span>${count ? `<span class="kb-summary-count">${count} 个模块</span>` : ''}</div>
        <div class="kb-summary-body">${items}</div>
      </div>`
    }

    // ── 列表 ──
    if (t === 'list') {
      const tag = b.style === 'ol' ? 'ol' : 'ul'
      const items = (b.items || []).map(item => `<li>${escLink(item)}</li>`).join('')
      return `<${tag} class="kb-list kb-list-${b.style || 'ul'}">${items}</${tag}>`
    }

    // ── 引用块（多种风格） ──
    if (t === 'blockquote') {
      const style = b.style || '标准'
      const clsMap = {
        '面试说': 'kb-bq-interview',
        '承上': 'kb-bq-承接',
        '核心理念': 'kb-bq-concept',
        'warning': 'kb-bq-warn',
        'lab': 'kb-bq-lab',
        'review_current': 'kb-bq-review',
        'review_next': 'kb-bq-review',
        'review': 'kb-bq-review',
      }
      const cls = clsMap[style] || 'kb-bq-default'
      return `<div class="kb-blockquote ${cls}"><div class="kb-bq-label">${ICON(BQ_ICON[style]||'doc')} ${BQ_TEXT[style]||style}</div><div class="kb-bq-body">${escLink(b.text)}</div></div>`
    }

    // ── 回顾块（组合式 current + next） ──
    if (t === 'review') {
      let html = `<div class="kb-blockquote kb-bq-review">`
      if (b.current) html += `<div class="kb-bq-label">${ICON('check')} 你现在掌握的是</div><div class="kb-bq-body">${escLink(b.current)}</div>`
      if (b.next) html += `<div class="kb-bq-label" style="margin-top:12px">${ICON('arrowRight')} 接下来要解决的</div><div class="kb-bq-body">${escLink(b.next)}</div>`
      html += `</div>`
      return html
    }

    // ── 图形化流程图 ──
    if (t === 'flow') {
      const cap = b.caption || '流程图'
      const def = b.def ? escAttr(JSON.stringify(b.def)) : ''
      const legend = this._flowLegend(b.def)
      return `<div class="flow-wrap">
        <div class="flow-cap"><span class="ic">${ICON('branch')}</span><span>${esc(cap)}</span>${legend ? `<span class="flow-legend">${legend}</span>` : ''}</div>
        <svg class="flow-svg" data-flow="${def}" viewBox="0 0 640 480" preserveAspectRatio="xMidYMid meet"></svg>
      </div>`
    }

    // ── 缺陷/案例库（五段式 Bug 卡片：现象→根因→复现→定位→修复）──
    if (t === 'case') {
      const sevMap = { '严重': 'sev-crit', '中等': 'sev-warn', '轻微': 'sev-low' }
      const sevCls = sevMap[b.severity] || 'sev-warn'
      const sevLabel = b.severity || '中等'
      const tags = (b.tags || []).map(tg => `<span class="kb-case-tag">#${esc(tg)}</span>`).join('')
      const step = (ic, label, text) => text
        ? `<div class="kb-case-step"><span class="kb-case-ic">${ICON(ic)}</span><div class="kb-case-step-body"><b class="kb-case-step-label">${label}</b><p class="kb-case-step-text">${esc(text)}</p></div></div>`
        : ''
      const body = [
        step('eye', '现象', b.symptom),
        step('search', '根因', b.rootCause),
        step('repeat', '复现', b.repro),
        step('target', '定位', b.locate),
        step('wrench', '修复 / 规避', b.fix),
      ].join('')
      return `<div class="kb-case ${sevCls}">
        <div class="kb-case-head">
          <div class="kb-case-title">${esc(b.title || '缺陷案例')}</div>
          <div class="kb-case-sev">${esc(sevLabel)}</div>
        </div>
        ${tags ? `<div class="kb-case-tags">${tags}</div>` : ''}
        <div class="kb-case-body">${body}</div>
      </div>`
    }

    // ── 服务子功能详解卡（把密集段落变成可扫读卡片网格）──
    if (t === 'svc-cards') return this._renderSvcCards(b)

    // ── 故障码 5 位结构交互卡片 ──
    if (t === 'dtc') return this._renderDtc(b)

    // ── 仿真组件（交互式知识点模拟：位时序/帧结构/线与/总线负载/CANoe）──
    if (t === 'sim') return this._renderSim(b)

    return ``
  },

  /* 故障码 5 位结构交互卡片：返回完整可交互 HTML，交互在 mountDtcCards 中装配 */
  _renderDtc(b) {
    const cfg = b.data || {}
    const card = (pos, val, enc, typeCls, typeText, desc, extra) => {
      extra = extra || ''
      return `<button type="button" class="dtc-card" data-pos="${pos}" ${extra}>
        <span class="dtc-pos">第 ${pos} 位</span>
        <span class="dtc-val">${val}</span>
        <span class="dtc-enc">${enc}</span>
        <span class="dtc-type ${typeCls}">${typeText}</span>
        <span class="dtc-desc">${desc}</span>
      </button>`
    }
    const cards = [
      card(1, 'P', '系统', 'dtc-fixed', '固定：P/C/B/U', '动力 / 底盘 / 车身 / 网络', 'data-sys="P"'),
      card(2, '0', '通用·厂定', 'dtc-fixed', '可切换', '0/2 通用 · 1/3 厂定义', 'data-mode="generic"'),
      card(3, '4', '子系统', 'dtc-cond', '条件：通用码固定', '通用码=SAE 子系统；厂定义码=OEM 自定义', 'data-sub="generic"'),
      card(4, '2', '序号', 'dtc-fixed', '固定：00–99', '具体故障序号'),
      card(5, '0', '序号', 'dtc-fixed', '固定：00–99', '具体故障序号'),
    ].join('')
    const title = b.title ? `<div class="kb-dtc-title">${this.esc(b.title)}</div>` : ''
    return `<div class="kb-dtc" data-dtc data-cfg="${escAttr(JSON.stringify(cfg))}">
      ${title}
      <div class="kb-dtc-hint">${ICON('doc')} 点击卡片切换示例 —— 重点看第 2 位如何决定第 3 位是否「固定类型」</div>
      <div class="kb-dtc-cards">${cards}</div>
      <div class="kb-dtc-detail" data-dtc-detail></div>
    </div>`
  },

  /* 服务子功能详解卡：把密集段落变成可扫读卡片网格 */
  _renderSvcCards(b) {
    const esc = (s) => this.esc(s || '')
    const badgeCls = (t) => {
      const map = {
        '常用': 'daily', '日常': 'daily',
        '排障': 'fix', '排查': 'fix', '故障排查': 'fix',
        '回归测试': 'reg', '回归': 'reg',
        '注意': 'warn', '注意语义': 'warn', '小心': 'warn',
        '快照': 'snap', '扩展': 'ext'
      }
      return map[t] || 'default'
    }
    const cards = (b.items || []).map(it => {
      const bc = badgeCls(it.badge || '')
      const badge = it.badge ? `<span class="svc-badge svc-badge-${bc}">${esc(it.badge)}</span>` : ''
      const rows = []
      if (it.question) rows.push(`<div class="svc-row svc-row-q"><span class="svc-label">Q</span><span class="svc-q">${esc(it.question)}</span></div>`)
      if (it.request) rows.push(`<div class="svc-row"><span class="svc-label">请求</span><code class="svc-code-snippet">${esc(it.request)}</code></div>`)
      if (it.response) rows.push(`<div class="svc-row"><span class="svc-label">响应</span><code class="svc-code-snippet">${esc(it.response)}</code></div>`)
      if (it.scene) rows.push(`<div class="svc-row"><span class="svc-label">场景</span><span>${esc(it.scene)}</span></div>`)
      if (it.note) rows.push(`<div class="svc-row"><span class="svc-label">注意</span><span>${esc(it.note)}</span></div>`)
      return `<div class="svc-card">
        <div class="svc-card-head">
          <span class="svc-code">${esc(it.code)}</span>
          <span class="svc-name">${esc(it.name)}</span>
          ${badge}
        </div>
        <div class="svc-card-body">${rows.join('')}</div>
      </div>`
    }).join('')
    const title = b.title ? `<div class="kb-svc-head"><span class="kb-svc-ic">${ICON('layers')}</span><span class="kb-svc-title">${esc(b.title)}</span><span class="kb-svc-count">${(b.items || []).length} 个服务</span></div>` : ''
    return `<div class="kb-svc-cards">${title}<div class="kb-svc-grid">${cards}</div></div>`
  },

  /* 仿真组件：返回容器骨架，真正的交互在 mountSimWidget 中装配（DOM 就绪后调用） */
  _renderSim(b) {
    const kind = b.sim || 'bittiming'
    const title = b.title || '知识点仿真'
    const cap = b.caption || ''
    const cfg = JSON.stringify({ kind, defaults: b.defaults || {}, note: b.note || '' })
    const iconMap = { bittiming: 'sliders', framedemo: 'layers', wiredand: 'chip', busload: 'gauge', canoe: 'cpu' }
    const ic = iconMap[kind] || 'activity'
    return `<div class="kb-sim" data-sim="${kind}" data-cfg="${escAttr(cfg)}">
      <div class="kb-sim-head"><span class="sim-ic">${ICON(ic)}</span><span class="kb-sim-title">${this.esc(title)}</span></div>
      ${cap ? `<div class="kb-sim-cap">${this.esc(cap)}</div>` : ''}
      <div class="kb-sim-mount"></div>
    </div>`
  },

  /* 组合重设计：左侧大纲导航 + 速记卡 */
  _flowLegend(def) {
    const kinds = new Set()
    ;(def && def.edges || []).forEach(e => kinds.add(e.kind || 'base'))
    const map = [
      ['base', '主线'],
      ['yes', '是 / 满足'],
      ['no', '否 / 不满足'],
      ['supply', '关联 / 补充']
    ]
    return map.filter(([k]) => kinds.has(k)).map(([k, label]) =>
      `<span class="fl-item"><i class="fl-dot fl-dot-${k}"></i>${this.esc(label)}</span>`
    ).join('')
  },

  /* 打开详情面板 — 自适应 content_blocks 渲染 */
  _openDetail(idx, chapter, sections) {
    const panel = document.getElementById('kp-detail')
    if (!panel) return
    const inner = panel.querySelector('.kp-detail-inner')
    if (!inner) return

    // 最近查看：仅记录本章访问时间戳（不展示百分比/进度，也不在 TOC 内做已读标记）
    LastViewed.touch(chapter.num)
    const title = sections[idx] || ''
    const total = sections.length
    const third = Math.max(1, Math.ceil(total / 3))
    const stage = Math.min(2, Math.floor(idx / third))
    const stageLabels = ['入门筑基', '核心掌握', '进阶深入']
    const mc = chapter.color || MODULE_COLORS[chapter.module] || '#2563eb'

    const detail = (this._chapterContent && this._chapterContent.sections && this._chapterContent.sections[idx])
      ? this._chapterContent.sections[idx] : null

    let contentHTML = ''

    if (detail) {
      const iconHtml = detail.icon ? `<div class="kp-dt-icon">${detail.icon}</div>` : ''
      const titleFull = detail.title || title

      // --- Head ---
      contentHTML = `
        <div class="kp-dt-head">
          ${iconHtml}
          <div class="kp-dt-num kp-stage-${stage}" style="background:${mc}">${String(idx + 1).padStart(2,'0')}</div>
          <div>
            <div class="kp-dt-stage kp-stage-${stage}">${stageLabels[stage]}</div>
            <div class="kp-dt-title">${this.esc(titleFull)}</div>
          </div>
        </div>`

      // --- content_blocks adaptive render (single source of truth) ---
      const blocks = detail.content_blocks || []
      blocks.forEach(b => {
        contentHTML += this._renderBlock(b)
      })

    } else {
      const noContent = !this._chapterContent
      contentHTML = `
        <div class="kp-dt-head">
          <div class="kp-dt-num kp-stage-${stage}" style="background:${mc}">${String(idx + 1).padStart(2,'0')}</div>
          <div>
            <div class="kp-dt-stage kp-stage-${stage}">${stageLabels[stage]}</div>
            <div class="kp-dt-title">${this.esc(title)}</div>
          </div>
        </div>`
      if (noContent) {
        contentHTML += `<div class="kp-dt-coming">${ICON('wip')} 本章详细内容正在筹备中，敬请期待。<br>你可以先浏览其他章节，或从顶部「知识库」切换。</div>`
      } else {
        contentHTML += `<p class="kp-dt-intro">${this._getSectionHint(total, idx)}</p>`
      }
    }

    // 先停掉上一轮仿真组件的动画循环（避免叠加泄漏）
    simStopAll()

    inner.innerHTML = contentHTML
    // 图片懒加载接管（视口内才发请求，根治 file:// 下 141 张图同步全量解码卡顿）
    initLazyImages(inner)
    inner.style.setProperty('--mod-color', mc)
    panel.classList.add('open')
    // 目录高亮跟随当前打开的知识点（scroll-spy 等价物，单源收口）
    this._syncTocActive(idx)

    // 初始化增强组件：编辑器代码块 + 图形化流程图
    inner.querySelectorAll('.code-editor').forEach(ed => renderEditor(ed))
    inner.querySelectorAll('.kb-diagram').forEach(d => {
      const copyBtn = d.querySelector('.kb-diagram-copy')
      if (copyBtn) copyBtn.addEventListener('click', () => {
        const raw = d.getAttribute('data-raw') || ''
        navigator.clipboard.writeText(raw).then(() => {
          copyBtn.textContent = '已复制'
          setTimeout(() => { copyBtn.textContent = '复制' }, 1600)
        }).catch(() => { copyBtn.textContent = '复制失败' })
      })
    })
    inner.querySelectorAll('.flow-svg').forEach(svg => {
      try {
        const def = JSON.parse(svg.dataset.flow)
        renderFlow(svg, def)
      } catch (e) { /* 数据结构异常时静默跳过，不阻断详情渲染 */ }
    })

    // 装配交互式仿真组件（位时序/帧结构/线与/总线负载/CANoe 等）
    inner.querySelectorAll('.kb-sim').forEach(el => {
      try { mountSimWidget(el) } catch (e) { /* 仿真装配异常不影响正文渲染 */ }
    })

    // 装配故障码 5 位结构交互卡片
    inner.querySelectorAll('.kb-dtc').forEach(el => {
      try { mountDtcCards(el) } catch (e) { /* 交互装配异常不影响正文渲染 */ }
    })

    // 术语表高亮：把正文中的专业术语包成可悬浮提示的 .term
    this._applyGlossary(inner)

    // 先重置再触发滚动
    const doScroll = () => {
      const rect = panel.getBoundingClientRect()
      if (rect.top < 0 || rect.top > window.innerHeight * 0.6) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
    // 等 transition 展开后再判断
    requestAnimationFrame(() => requestAnimationFrame(doScroll))
  },

  /* 浮动滚动按钮（回到顶部 / 滚动到底部） */
  _initFloatActions() {
    const wrap = document.getElementById('chapter-float-actions')
    const topBtn = document.getElementById('back-to-top')
    const bottomBtn = document.getElementById('back-to-bottom')
    if (!wrap || !topBtn || !bottomBtn) return

    const docHeight = () => document.documentElement.scrollHeight || document.body.scrollHeight
    const toggle = () => {
      const maxScroll = Math.max(0, docHeight() - window.innerHeight)
      const canScroll = maxScroll > 100
      wrap.classList.toggle('visible', canScroll)
      topBtn.classList.toggle('visible', window.scrollY > 300)
      bottomBtn.classList.toggle('visible', window.scrollY < maxScroll - 300)
    }

    window.addEventListener('scroll', toggle, { passive: true })
    window.addEventListener('resize', toggle, { passive: true })
    toggle()

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
    bottomBtn.addEventListener('click', () => {
      const maxScroll = () => Math.max(0, docHeight() - window.innerHeight)
      window.scrollTo({ top: maxScroll(), behavior: 'smooth' })
      // 兜底校正：懒加载图片会在滚动途中撑高页面，导致平滑滚动目标过时、停在中途
      const settle = () => {
        if (window.scrollY + window.innerHeight < docHeight() - 4) {
          window.scrollTo({ top: maxScroll(), behavior: 'auto' })
        }
      }
      window.addEventListener('scrollend', settle, { once: true })
      setTimeout(settle, 800)
    })
  },

  /* 加载章节详细内容 */
  async _loadChapterContent(num) {
    const padded = String(num).padStart(2, '0')
    if (window.__SITE_DATA__ && window.__SITE_DATA__.chapterContent && window.__SITE_DATA__.chapterContent[padded]) {
      return window.__SITE_DATA__.chapterContent[padded]
    }
    const cacheKey = 'avt-ch-' + padded + '-' + __CONTENT_VERSION__
    // 会话内缓存：整页切换后再次进入同一章节时内容瞬时呈现，消除白屏等待
    try {
      const cached = _safeSS.getItem(cacheKey)
      if (cached) return JSON.parse(cached)
    } catch {}
    // 仅当环境提供 fetch（且非 file://）时才尝试按需加载；否则静默回退（内容已内联）
    if (typeof fetch !== 'function') return null
    try {
      const res = await fetch(`data/chapter-content/${padded}.json?v=${__CONTENT_VERSION__}`, { cache: 'no-store' })
      if (!res.ok) return null
      const json = await res.json()
      try { _safeSS.setItem(cacheKey, JSON.stringify(json)) } catch {}
      return json
    } catch {
      return null
    }
  },

  /* 预取相邻章节内容到会话缓存，使「上一章/下一章」切换瞬时完成 */
  _prefetchAdjacent(num) {
    const max = (this.chapters && this.chapters.length) || 54
    ;[num - 1, num + 1].forEach((n) => {
      if (n >= 1 && n <= max) this._loadChapterContent(n)
    })
  },

  /* 知识点提示文案 */
  _getSectionHint(total, i) {
    if (i === 0) return '从最基础的概念入手，打好认知地基'
    if (i === total - 1) return '综合本章所有知识点，完成体系化梳理'
    if (i <= 2) return '逐步深入核心概念，构建知识点之间的关联'
    return '将知识串联成面，形成完整的技能闭环'
  },

  /* --- 从标题中提取纯名称（去掉 ⭐ 后的注释） --- */
  _cardName(title) {
    if (typeof title !== 'string') return ''
    const idx = title.indexOf('⭐')
    return idx > -1 ? title.substring(0, idx).trim() : title
  },

  /* --- 卡片 HTML 模板（共用方法） --- */
  /* --- 能力分级：按模块派生 L0-L3（单源，避免数据不一致） --- */
  _levelOf(c) {
    const d = (c.difficulty || '').trim()
    if (d === '零基础' || d === 'L0') return 'L0'
    const m = c.module
    if (m === 'R') return 'L0'
    if (m === 'A' || m === 'B' || m === 'C') return 'L1'
    if (m === 'D' || m === 'E') return 'L2'
    if (m === 'F') return 'L3'
    return 'L1'
  },

  _cardHTML(c, extraAttrs = '', extraClass = '') {
    const mc = c.color || MODULE_COLORS[c.module] || '#2563eb'
    const starCls = c.star === '核心' ? ' core' : ''
    const lv = this._levelOf(c)
    const cover = genCoverV2(c.module, c.num)
    const tags = c.tags || []
    const shownTags = tags.slice(0, 3)
    const tagsHTML = shownTags.map(t => `<span class="tag">${this.esc(t)}</span>`).join('')
    const moreTag = tags.length > 3 ? `<span class="tag tag-more">+${tags.length - 3}</span>` : ''
    const previewItems = (c.sections || []).slice(0, 4)
      .map(s => `<li>${this.esc(s)}</li>`).join('')
    // 自定义封面图（如有），否则由内容主题 SVG 封面填充
    const coverImg = `assets/images/chapter-cover-${String(c.num).padStart(2,'0')}.webp`
    const coverContent = `<img src="${coverImg}" alt="" class="card-cover-img" loading="lazy"
      onerror="this.style.display='none'">${cover}`
    const name = this._cardName(c.title)
    const lastViewed = LastViewed.get(c.num)
    const viewedChip = lastViewed ? `<span class="card-lastviewed">${ICON('clock')} ${LastViewed.format(c.num)}</span>` : ''
    return `<a class="chapter-card${extraClass}" href="chapter.html?id=${c.num}" data-num="${c.num}"${extraAttrs}
      aria-label="${this.esc(name)} · ${this.esc(MODULE_NAMES[c.module] || '')}" style="--mod-color:${mc}">
      <div class="card-cover" style="--mod-color:${mc}">
        ${coverContent}
        <div class="card-level" style="--lv-color:${LEVEL_META[lv].color}">${lv} · ${LEVEL_META[lv].name}</div>
        <div class="card-star${starCls}">${c.star === '核心' ? (ICON('star') + '核心') : c.star}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${this.esc(c.title)}</div>
        <div class="card-oneliner">${this.esc(c.oneliner || '')}</div>
        <div class="card-tags">${tagsHTML}${moreTag}</div>
        <div class="card-preview">
          <ul class="preview-list">${previewItems}</ul>
          <span class="preview-toggle">查看全部 ${c.kp} 个知识点
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h13M12 5l7 7-7 7"/></svg>
          </span>
        </div>
        <div class="card-meta">
          <span>${ICON('book')} <b>${c.kp}</b> 知识点</span>
          ${viewedChip}
        </div>
      </div>
    </a>`
  },

  /* --- 构建筛选栏（模块 + 全部 + 核心） --- */
  buildFilters() {
    const bar = document.getElementById('filter-bar')
    if (!bar) return
    const all = this.chapters.filter(c => c.module !== 'R')
    const coreCount = all.filter(c => c.star === '核心').length
    const chips = [
      { label: '全部', filter: 'all', count: all.length },
      { label: ICON('star') + '核心推荐', filter: 'core', count: coreCount }
    ]
    const modOrder = ['A', 'B', 'C', 'D', 'E', 'F']
    modOrder.forEach(m => {
      const cnt = all.filter(c => c.module === m).length
      chips.push({ label: MODULE_NAMES[m], filter: m, count: cnt })
    })
    bar.innerHTML = chips.map(ch =>
      `<span class="chip${ch.filter === 'all' ? ' active' : ''}" data-filter="${ch.filter}">
        <span class="c-dot"></span>${ch.label}
        <span class="c-count">${ch.count}</span>
      </span>`
    ).join('')
  },

  /* --- 绑定筛选点击 --- */
  bindFilter() {
    const bar = document.getElementById('filter-bar')
    if (!bar) return
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.chip')
      if (!chip || chip.classList.contains('active')) return
      bar.querySelectorAll('.chip').forEach(ch => ch.classList.remove('active'))
      chip.classList.add('active')
      this._filter = chip.dataset.filter
      this._applyList(false)
    })
  },

  /* --- 构建能力分级筛选栏（L0-L3） --- */
  buildLevelFilters() {
    const bar = document.getElementById('level-bar')
    if (!bar) return
    const levels = ['L0', 'L1', 'L2', 'L3']
    const chips = [{ label: '全部', filter: 'all' }].concat(
      levels.map(l => ({ label: `${l} · ${LEVEL_META[l].name}`, filter: l, color: LEVEL_META[l].color }))
    )
    bar.innerHTML = chips.map(ch =>
      `<span class="chip chip-level${ch.filter === 'all' ? ' active' : ''}" data-level="${ch.filter}"${ch.color ? ` style="--lv-color:${ch.color}"` : ''}>
        <span class="c-dot"></span>${ch.label}
      </span>`
    ).join('')
  },

  /* --- 绑定能力分级筛选点击 --- */
  bindLevelFilter() {
    const bar = document.getElementById('level-bar')
    if (!bar) return
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.chip')
      if (!chip || chip.classList.contains('active')) return
      bar.querySelectorAll('.chip').forEach(ch => ch.classList.remove('active'))
      chip.classList.add('active')
      this._level = chip.dataset.level
      this._applyList(false)
    })
  },

  /* --- 全量列表页：按筛选 + 搜索渲染 --- */
  renderAllChapters(filter = 'all', animate = true) {
    this._filter = filter
    this._applyList(animate)
  },

  _applyList(animate = true) {
    const grid = document.getElementById('card-grid')
    if (!grid) return
    let list = this.chapters.filter(c => c.module !== 'R')
    if (this._filter === 'core') {
      list = list.filter(c => c.star === '核心')
    } else if (this._filter !== 'all') {
      list = list.filter(c => c.module === this._filter)
    }
    // 能力分级过滤（与模块/搜索组合）
    if (this._level && this._level !== 'all') {
      list = list.filter(c => this._levelOf(c) === this._level)
    }
    if (this._search) {
      const t = this._search.toLowerCase()
      list = list.filter(c => {
        const hay = [c.title, c.oneliner, c.slug, (c.tags || []).join(' '), c.moduleName, c.summary]
          .join(' ').toLowerCase()
        return hay.includes(t)
      })
    }
    if (!list.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-3)">' +
        (this._search ? '未找到匹配“' + this.esc(this._search) + '”的章节，换个关键词试试' : '暂无匹配内容') + '</div>'
      return
    }
    // 筛选重渲染(animate=false)时把 .in 内联进 HTML，卡片“出生即可见”，
    // 避免整屏重新播放 translateY 滑入动画导致筛选抖动
    const cls = animate ? '' : ' in'
    grid.innerHTML = list.map(c => this._cardHTML(c, ` data-module="${c.module}" data-star="${c.star}"`, cls)).join('')
    if (animate) requestAnimationFrame(() => this.observeCards())
  },

  /* --- 知识库导航下拉填充（排除未编制的 R 模块，避免空壳入口） --- */
  _populateKbDropdown() {
    const dd = document.getElementById('kb-dropdown')
    if (!dd) return
    const list = this.chapters.filter(c => c.module !== 'R')
    const rList = this.chapters.filter(c => c.module === 'R')
    dd.innerHTML = list.map((ch) => {
      const c = MODULE_COLORS[ch.module] || '#2563eb'
      const modName = MODULE_NAMES[ch.module] || ''
      const title = (ch.title || '').replace(/ ⭐.*$/, '')
      return `<a class="nav-dropdown-item" href="chapter.html?id=${ch.num}">
        <span class="dd-num" style="background:${c}">${String(ch.num).padStart(2,'0')}</span>
        <span class="dd-title">${this.esc(title)}</span>
        <span class="dd-mod">${this.esc(modName)}</span>
      </a>`
    }).join('') + rList.map((ch) => {
      const c = ch.color || '#EC4899'
      const title = (ch.title || '').replace(/ ⭐.*$/, '')
      return `<a class="nav-dropdown-item nav-dropdown-path" href="chapter.html?id=${ch.num}">
        <span class="dd-num" style="background:${c}">${String(ch.num).padStart(2,'0')}</span>
        <span class="dd-title">${this.esc(title)}</span>
        <span class="dd-mod">${this.esc(ch.moduleName || '成长导航')}</span>
      </a>`
    }).join('')
  },

  /* --- 下拉点击/外部关闭（移动端无 hover 时仍可展开） --- */
  _initDropdown() {
    const dd = document.getElementById('kb-dropdown')
    const wrap = dd ? dd.closest('.nav-item-dropdown') : null
    const trigger = wrap ? wrap.querySelector('a') : null
    if (!wrap || !trigger) return
    trigger.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 680px)').matches) {
        e.preventDefault()
        wrap.classList.toggle('open')
      }
    })
    document.addEventListener('click', (e) => {
      if (wrap.classList.contains('open') && !wrap.contains(e.target)) {
        wrap.classList.remove('open')
      }
    })
  },

  /* --- 术语表：高亮 + 悬浮提示 --- */
  initGlossary() {
    const data = window.__SITE_DATA__ && window.__SITE_DATA__.glossary
    if (!data || !data.length) return
    // 构建 term -> {full, def} 映射与正则（按长度降序，避免短词嵌套匹配长词）
    this._glossaryMap = {}
    const terms = data.map(t => t.term).filter(Boolean).sort((a, b) => b.length - a.length)
    terms.forEach(term => {
      const item = data.find(t => t.term === term)
      this._glossaryMap[term] = item
    })
    this._glossaryTerms = terms
    // 单例 tooltip
    if (!document.getElementById('glossary-tip')) {
      const tip = document.createElement('div')
      tip.id = 'glossary-tip'
      tip.className = 'glossary-tip'
      tip.setAttribute('role', 'tooltip')
      document.body.appendChild(tip)
    }
    // 事件委托：悬浮 .term 显示释义
    document.removeEventListener('mouseover', this._glossaryOver)
    document.removeEventListener('mouseout', this._glossaryOut)
    this._glossaryOver = (e) => {
      const el = e.target.closest && e.target.closest('.term')
      if (!el) return
      const item = this._glossaryMap[el.dataset.term]
      if (!item) return
      this._showGlossaryTip(el, item)
    }
    this._glossaryOut = (e) => {
      const el = e.target.closest && e.target.closest('.term')
      if (!el) return
      this._hideGlossaryTip()
    }
    document.addEventListener('mouseover', this._glossaryOver)
    document.addEventListener('mouseout', this._glossaryOut)
  },

  _glossaryRegex() {
    if (this._glossaryRe) return this._glossaryRe
    const terms = (this._glossaryTerms || []).map(t => {
      const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // 拉丁字母术语加字母数字边界，避免嵌入 CANoe/CAN FD 等长词内部
      if (/^[A-Za-z0-9 /.\-]+$/.test(t)) {
        return `(?<![A-Za-z0-9])${esc}(?![A-Za-z0-9])`
      }
      return esc
    })
    this._glossaryRe = new RegExp(terms.join('|'), 'g')
    return this._glossaryRe
  },

  _applyGlossary(root) {
    if (!this._glossaryTerms || !this._glossaryTerms.length) return
    const skip = (n) => {
      const p = n.parentElement
      // 跳过 SVG 内的文本：图里的 <text> 被包成 <span class="term"> 会变非法 SVG，导致整张示意图/拓扑图文字消失
      return !!(p && (p.closest('svg') || p.closest('pre') || p.closest('code') || p.closest('script') || p.closest('style') || p.closest('.term')))
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return (n.nodeValue && n.nodeValue.trim() && !skip(n)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      }
    })
    const nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)
    const re = this._glossaryRegex()
    const seen = new Set() // 同一章节内每个术语仅首次出现才高亮
    nodes.forEach(node => {
      const text = node.nodeValue
      re.lastIndex = 0
      if (!re.test(text)) return
      re.lastIndex = 0
      const frag = document.createDocumentFragment()
      let last = 0, m
      while ((m = re.exec(text))) {
        const s = m.index, e = m.index + m[0].length
        if (s > last) frag.appendChild(document.createTextNode(text.slice(last, s)))
        const term = m[0]
        if (seen.has(term)) {
          frag.appendChild(document.createTextNode(term))
        } else {
          const span = document.createElement('span')
          span.className = 'term'
          span.dataset.term = term
          span.textContent = term
          frag.appendChild(span)
          seen.add(term)
        }
        last = e
        if (term.length === 0) re.lastIndex++
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
      if (frag.childNodes.length) node.parentNode.replaceChild(frag, node)
    })
  },

  _showGlossaryTip(el, item) {
    const tip = document.getElementById('glossary-tip')
    if (!tip) return
    tip.innerHTML = `<div class="gt-term">${this.esc(item.term)}<span class="gt-full">${this.esc(item.full || '')}</span></div>` +
      `<div class="gt-def">${this.esc(item.def || '')}</div>`
    tip.classList.add('show')
    const r = el.getBoundingClientRect()
    const tw = tip.offsetWidth, th = tip.offsetHeight
    let left = r.left + r.width / 2 - tw / 2
    let top = r.bottom + 8
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8))
    if (top + th > window.innerHeight - 8) top = r.top - th - 8
    tip.style.left = left + 'px'
    tip.style.top = top + 'px'
  },

  _hideGlossaryTip() {
    const tip = document.getElementById('glossary-tip')
    if (tip) tip.classList.remove('show')
  },

  esc(s) {
    if (typeof s !== 'string') return ''
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  },

  /* --- 卡片入场动画（健壮版，杜绝“卡片不显示”） --- */
  observeCards() {
    const cards = document.querySelectorAll('.chapter-card, .oem-card')
    if (!cards.length) return
    const reveal = (el) => el.classList.add('in')

    // 兜底1：浏览器不支持 IntersectionObserver → 直接全部显示
    if (!('IntersectionObserver' in window)) {
      cards.forEach(reveal)
      return
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          obs.unobserve(e.target)
        }
      })
    }, { threshold: .08, rootMargin: '0px 0px -40px 0px' })

    cards.forEach(el => {
      if (el.dataset.observed) return
      el.dataset.observed = '1'
      const rect = el.getBoundingClientRect()
      // 已在视口内：立即显示，不依赖异步回调（避免首屏卡片卡在 opacity:0）
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(el)
      } else {
        obs.observe(el)
      }
    })

    // 兜底2：1.2s 后强制显示所有仍处于 opacity:0 的卡片，
    // 防止任何异常（observer 未触发 / 布局抖动）导致永久不可见
    setTimeout(() => {
      document.querySelectorAll('.chapter-card:not(.in), .oem-card:not(.in)').forEach(reveal)
    }, 1200)
  }
}

/* ========== 启动 ========== */
document.addEventListener('DOMContentLoaded', () => {
  App.init()
  initImageZoom()
})

// ── 图片懒加载：视口内才发请求（根治 file:// 下原生 loading=lazy 不可靠导致的全量同步解码）──
let _lazyObserver = null
function initLazyImages(root) {
  // 章节切换会重渲染 inner，先断开上一轮 observer，避免对已卸载节点空观察导致泄漏
  if (_lazyObserver) { try { _lazyObserver.disconnect() } catch (e) {} _lazyObserver = null }
  const scope = root || document
  const imgs = scope.querySelectorAll('img.kb-image-img.is-lazy[data-src]')
  if (!imgs.length) return

  const loadNow = (img) => {
    const real = img.dataset.src
    if (!real) return
    const dropLazy = () => img.classList.remove('is-lazy')
    img.addEventListener('load', dropLazy, { once: true })
    img.addEventListener('error', dropLazy, { once: true })
    img.src = real
    img.removeAttribute('data-src')
  }

  if (!('IntersectionObserver' in window)) {
    imgs.forEach(loadNow)
    return
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      loadNow(e.target)
      obs.unobserve(e.target)
    })
  }, { root: null, rootMargin: '300px 0px', threshold: 0.01 })
  imgs.forEach(img => io.observe(img))
  _lazyObserver = io
}

// ── 图片点击放大预览（lightbox）──
function initImageZoom(){
  if (document.getElementById('kb-lightbox')) return
  const lb = document.createElement('div')
  lb.id = 'kb-lightbox'
  lb.className = 'kb-lightbox'
  lb.setAttribute('role', 'dialog')
  lb.setAttribute('aria-label', '图片放大预览')
  lb.innerHTML =
    '<button class="kb-lightbox-close" type="button" aria-label="关闭预览">' + ICON('cross') + '</button>' +
    '<img class="kb-lightbox-img" src="" alt="">' +
    '<figcaption class="kb-lightbox-cap"></figcaption>'
  document.body.appendChild(lb)

  const lbImg = lb.querySelector('.kb-lightbox-img')
  const lbCap = lb.querySelector('.kb-lightbox-cap')

  function open(src, alt, cap){
    lbImg.src = src
    lbImg.alt = alt || ''
    if (cap){ lbCap.textContent = cap; lbCap.style.display = '' }
    else { lbCap.style.display = 'none' }
    lb.classList.add('open')
    document.body.style.overflow = 'hidden'
  }
  function close(){
    lb.classList.remove('open')
    lbImg.src = ''
    document.body.style.overflow = ''
  }

  // 事件委托：点击章节内图片打开预览
  document.addEventListener('click', (e) => {
    const img = e.target.closest('.kb-image-img')
    if (!img || lb.contains(img)) return
    const fig = img.closest('.kb-image')
    const capEl = fig ? fig.querySelector('.kb-image-cap') : null
    open(img.dataset.src || img.getAttribute('src'), img.getAttribute('alt'), capEl ? capEl.textContent.trim() : '')
  })
  // 点遮罩背景或关闭按钮关闭
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.closest('.kb-lightbox-close')) close()
  })
  // Esc 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('open')) close()
  })
}

/* ============================================================
   增强组件引擎：编辑器风格代码块 + 图形化流程图
   落地自 UI Design 原型 chapter-detail-flowcode.html
   ============================================================ */
const SVG_NS = 'http://www.w3.org/2000/svg'

function _esc(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escAttr(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// 站内章节交叉引用：[[NN-slug]] → 真实跳转链接（修复长期失效的 wiki 链接约定）
function escLink(s) {
  let out = _esc(s)
  // 已知非章节锚点：MOC = 知识库主页（此前全站约 30+ 处 [[MOC_车载测试]] 为死链裸文本）
  out = out.replace(/\[\[MOC_车载测试\]\]/g,
    '<a class="wiki-link" href="chapters.html">车载测试知识主页</a>')
  out = out.replace(/\[\[(\d+)-([^\]]+)\]\]/g, (m, id, label) =>
    `<a class="wiki-link" href="chapter.html?id=${id}">${label}</a>`)
  return out
}

/* ---------- 编辑器代码块：语法高亮 + 行号 + 复制 ---------- */
const HL_KW = new Set([
  'import', 'from', 'as', 'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while',
  'assert', 'None', 'True', 'False', 'in', 'not', 'and', 'or', 'with', 'try', 'except',
  'await', 'async', 'pragma', 'pack', 'push', 'pop', 'typedef', 'struct', 'sizeof',
  'uint32_t', 'uint16_t', 'uint8_t', 'int', 'void', 'float', 'double', 'char', 'bool',
  'const', 'static', 'volatile', 'unsigned', 'public', 'private', 'protected',
  'new', 'delete', 'function', 'var', 'let', 'include', 'define', 'ifdef', 'ifndef',
  'endif', 'error'
])

function hlLine(line) {
  // C++ 风格整行注释
  let m = line.match(/^(\s*)(\/\/.*)$/)
  if (m) return _esc(m[1]) + '<span class="tok-com">' + _esc(m[2]) + '</span>'
  // 预处理器指令（#pragma 等）不当注释
  let pc = line.match(/^(\s*)(#\s*(pragma|include|define|if|ifdef|ifndef|else|endif|error)\b.*)$/)
  if (!pc) {
    let cm = line.match(/^(\s*)(#.*)$/)
    if (cm) return _esc(cm[1]) + '<span class="tok-com">' + _esc(cm[2]) + '</span>'
  }

  // 行内 // 注释：先定位不在字符串中的 //，前面代码正常高亮，后面整体作为注释
  const commentIdx = findInlineComment(line)
  if (commentIdx !== -1) {
    return hlLine(line.slice(0, commentIdx)) + '<span class="tok-com">' + _esc(line.slice(commentIdx)) + '</span>'
  }

  // 逐字符扫描：字符串 / 关键字 / 数字 / 标点
  let out = ''
  let idx = 0
  const src = line
  while (idx < src.length) {
    const c = src[idx]
    if (c === '"' || c === "'") {
      let end = idx + 1
      while (end < src.length && src[end] !== c) { if (src[end] === '\\') end++; end++ }
      let str = src.slice(idx, Math.min(end + 1, src.length))
      out += '<span class="tok-str">' + _esc(str) + '</span>'
      idx = Math.min(end + 1, src.length)
      continue
    }
    if (/[A-Za-z_]/.test(c)) {
      let end = idx
      while (end < src.length && /[A-Za-z0-9_]/.test(src[end])) end++
      let w = src.slice(idx, end)
      if (HL_KW.has(w)) out += '<span class="tok-key">' + _esc(w) + '</span>'
      else if (src[end] === '(') out += '<span class="tok-fn">' + _esc(w) + '</span>'
      else out += _esc(w)
      idx = end
      continue
    }
    if (/[0-9]/.test(c)) {
      let end = idx
      while (end < src.length && /[0-9a-fA-Fx]/.test(src[end])) end++
      out += '<span class="tok-num">' + _esc(src.slice(idx, end)) + '</span>'
      idx = end
      continue
    }
    if ('{}()[];,'.includes(c)) { out += '<span class="tok-punc">' + _esc(c) + '</span>'; idx++; continue }
    out += _esc(c)
    idx++
  }
  return out
}

/* 定位行内 // 注释起始位置（忽略字符串内的 //） */
function findInlineComment(s) {
  let inStr = 0
  for (let i = 0; i < s.length - 1; i++) {
    const c = s[i], n = s[i + 1]
    if ((c === '"' || c === "'") && (i === 0 || s[i - 1] !== '\\')) inStr = inStr ? 0 : c.charCodeAt(0)
    if (!inStr && c === '/' && n === '/') return i
  }
  return -1
}

function renderEditor(ed) {
  const raw = ed.getAttribute('data-raw') || ''
  const lines = raw.split('\n')
  const gutter = ed.querySelector('.ce-gutter')
  const code = ed.querySelector('.ce-code')
  if (!gutter || !code) return
  gutter.innerHTML = lines.map((_, i) => '<span' + (i === 0 ? ' class="active"' : '') + '>' + (i + 1) + '</span>').join('')
  code.innerHTML = lines.map(l => '<span class="ln">' + hlLine(l) + '</span>').join('')
  // 复制原始代码
  const btn = ed.querySelector('.ce-copy')
  if (btn) {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(raw).then(() => {
        const old = btn.innerHTML
        btn.innerHTML = '已复制'
        btn.classList.add('done')
        setTimeout(() => { btn.innerHTML = old; btn.classList.remove('done') }, 1600)
      }).catch(() => { btn.textContent = '复制失败' })
    })
  }
  // 折叠 / 展开超长代码
  const foldBtn = ed.querySelector('.ce-fold')
  if (foldBtn) {
    foldBtn.addEventListener('click', () => {
      const collapsed = ed.classList.toggle('collapsed')
      foldBtn.textContent = collapsed ? '展开' : '收起'
    })
  }
  // 行高亮联动（悬停某行 → 行号槽同步高亮）
  const spans = [...code.querySelectorAll('.ln')]
  spans.forEach((sp, i) => {
    sp.addEventListener('mouseenter', () => {
      [...gutter.children].forEach(g => g.classList.remove('active'))
      if (gutter.children[i]) gutter.children[i].classList.add('active')
    })
  })
  code.addEventListener('mouseleave', () => {
    [...gutter.children].forEach(g => g.classList.remove('active'))
    if (gutter.children[0]) gutter.children[0].classList.add('active')
  })
}

/* ---------- SVG 流程图引擎 ---------- */
function svgEl(tag, attrs) {
  const e = document.createElementNS(SVG_NS, tag)
  for (const k in attrs) e.setAttribute(k, attrs[k])
  return e
}

function renderFlow(svg, def) {
  if (!def || !def.nodes) return
  const byId = {}
  def.nodes.forEach(n => byId[n.id] = n)
  const cx = n => n.x + n.w / 2
  const cy = n => n.y + n.h / 2
  function anchor(n, side) {
    if (side === 'right') return { x: n.x + n.w, y: cy(n) }
    if (side === 'left') return { x: n.x, y: cy(n) }
    if (side === 'bottom') return { x: cx(n), y: n.y + n.h }
    return { x: cx(n), y: n.y }
  }
  function sides(s, t) {
    const dx = cx(t) - cx(s), dy = cy(t) - cy(s)
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? ['right', 'left'] : ['left', 'right']
    return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom']
  }
  function path(s, t) {
    const a = sides(s, t)
    const p1 = anchor(s, a[0]), p2 = anchor(t, a[1])
    const dx = p2.x - p1.x, dy = p2.y - p1.y
    const k = Math.max(40, Math.abs(dx) * 0.45, Math.abs(dy) * 0.45)
    let c1, c2
    if (a[0] === 'right' || a[0] === 'left') {
      c1 = { x: p1.x + (a[0] === 'right' ? k : -k), y: p1.y }
      c2 = { x: p2.x + (a[1] === 'left' ? -k : k), y: p2.y }
    } else {
      c1 = { x: p1.x, y: p1.y + (a[0] === 'bottom' ? k : -k) }
      c2 = { x: p2.x, y: p2.y + (a[1] === 'top' ? -k : k) }
    }
    return `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`
  }
  // 连线（先画，置于节点下层）
  ;(def.edges || []).forEach(e => {
    const s = byId[e.from], t = byId[e.to]
    if (!s || !t) return
    const d = path(s, t)
    const g = svgEl('g', { class: 'fn-edge' + (e.kind ? ' ' + e.kind : '') })
    g.appendChild(svgEl('path', { class: 'fn-edge-base', d }))
    g.appendChild(svgEl('path', { class: 'fn-edge-flow', d }))
    if (e.label) {
      const sa = sides(s, t)
      const mx = (anchor(s, sa[0]).x + anchor(t, sa[1]).x) / 2
      const my = (anchor(s, sa[0]).y + anchor(t, sa[1]).y) / 2
      const w = e.label.length * 8 + 14
      g.appendChild(svgEl('rect', { class: 'fn-edge-label-bg', x: mx - w / 2, y: my - 11, width: w, height: 22, rx: 11 }))
      const tx = svgEl('text', { class: 'fn-edge-label', x: mx, y: my + 4, 'text-anchor': 'middle' })
      tx.textContent = e.label
      g.appendChild(tx)
    }
    g.dataset.from = e.from
    g.dataset.to = e.to
    svg.appendChild(g)
  })
  // 节点
  def.nodes.forEach((n, i) => {
    const g = svgEl('g', {
      class: 'fn-node' + (n.type ? ' fn-' + n.type : '') + (n.accent ? ' fn-accent' : '') + ((n.warn || n.endKind === 'warn') ? ' warn' : ''),
      style: 'animation-delay:' + (i * 70) + 'ms'
    })
    g.dataset.id = n.id
    const rx = (n.type === 'start' || n.type === 'end') ? n.h / 2 : 14
    g.appendChild(svgEl('rect', { class: 'fn-rect', x: n.x, y: n.y, width: n.w, height: n.h, rx, ry: rx }))
    if (n.icon) {
      const ti = svgEl('text', { class: 'fn-icon', x: n.x + 18, y: n.y + n.h / 2 + 7, 'text-anchor': 'middle' })
      ti.textContent = n.icon
      g.appendChild(ti)
    }
    // 路线图节点：把 "阶段1 标题" 拆为编号徽标 + 标题，提升可读性
    const stageMatch = (n.title || '').match(/^(阶段\d+)\s*(.+)$/)
    const hasStage = !!stageMatch
    const stageNum = stageMatch ? stageMatch[1] : ''
    const titleText = stageMatch ? stageMatch[2] : n.title
    const titleY = n.y + (n.sub ? n.h / 2 - 8 : n.h / 2 + 4)
    if (hasStage) {
      const badgeW = stageNum.length * 10 + 10
      const badge = svgEl('rect', {
        class: 'fn-stage-bg', x: n.x + (n.icon ? 46 : n.w / 2 - 54), y: titleY - 14,
        width: badgeW, height: 18, rx: 9
      })
      g.appendChild(badge)
      const stageTx = svgEl('text', {
        class: 'fn-stage-num', x: n.x + (n.icon ? 46 : n.w / 2 - 54) + badgeW / 2, y: titleY - 1,
        'text-anchor': 'middle'
      })
      stageTx.textContent = stageNum
      g.appendChild(stageTx)
    }
    const tx = svgEl('text', {
      class: 'fn-title' + (hasStage ? ' fn-title-with-stage' : ''),
      x: n.x + (n.icon ? 46 : 10),
      y: titleY + (hasStage ? 14 : 0),
      'text-anchor': n.icon ? 'start' : 'middle'
    })
    if (!n.icon) tx.setAttribute('x', n.x + n.w / 2)
    tx.textContent = titleText
    g.appendChild(tx)
    if (n.sub) {
      const st = svgEl('text', { class: 'fn-sub', x: n.x + n.w / 2, y: n.y + n.h / 2 + (hasStage ? 22 : 17), 'text-anchor': 'middle' })
      st.textContent = n.sub
      g.appendChild(st)
    }
    // 悬停联动：高亮当前节点及其关联边/节点
    g.addEventListener('mouseenter', () => {
      svg.classList.add('hovering')
      svg.querySelectorAll('.fn-node').forEach(x => x.classList.toggle('hot', x.dataset.id === n.id || def.edges.some(e => (e.from === n.id && x.dataset.id === e.to) || (e.to === n.id && x.dataset.id === e.from))))
      svg.querySelectorAll('.fn-edge').forEach(x => x.classList.toggle('hot', x.dataset.from === n.id || x.dataset.to === n.id))
    })
    g.addEventListener('mouseleave', () => {
      svg.classList.remove('hovering')
      svg.querySelectorAll('.fn-node,.fn-edge').forEach(x => x.classList.remove('hot'))
    })
    svg.appendChild(g)
  })
  // 自适应 viewBox（按节点包围盒 + 留白），并约束最小宽高比，避免竖图被拉爆
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  def.nodes.forEach(n => {
    minX = Math.min(minX, n.x); minY = Math.min(minY, n.y)
    maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h)
  })
  if (minX !== Infinity) {
    const pad = 24
    let vx = minX - pad, vy = minY - pad
    let vw = (maxX - minX) + pad * 2
    let vh = (maxY - minY) + pad * 2
    // 竖图/窄图：补足横向留白，使宽高比不低于 1.3（适中，不拉爆、不空旷）
    const MIN_AR = 1.3
    if (vw / vh < MIN_AR) {
      const add = (vh * MIN_AR - vw) / 2
      vx -= add; vw = vh * MIN_AR
    }
    svg.setAttribute('viewBox', vx + ' ' + vy + ' ' + vw + ' ' + vh)
  }
}

/* ---------- 内容感知代码块组件（根据实际内容选择组件形态，非代码内容组件化） ---------- */

// 明显代码标记：注释/关键字/预处理器/CAPL 等。箭头流程图里常含代码注释，
// 必须排在 flow/diagram 之前，确保真正代码永远走 IDE 编辑器，不被误判为组件。
function isRealCode(c) {
  return /(\/\/|\/\*|\*\/|#include|#define|#\s*===|^\s*#\s|def\s+\w|function\s+\w|import\s+\w|class\s+\w|void\s+\w|public\s+\w|private\s+\w|namespace\s+\w|variables\s*\{|testcase|testStep|=>|std::|printf|return\s*;)/m.test(c)
}

function detectCodeVariant(code) {
  if (!code || typeof code !== 'string') return 'code'
  const c = code

  // ① CAN 差分信号图：CAN_H/CAN_L + 电压值 + 隐性/显性
  if (/CAN_H/.test(c) && /CAN_L/.test(c) && /\d+\.\d+V/.test(c) && /隐性/.test(c) && /显性/.test(c)) {
    return 'can-diff'
  }

  // ② 示波器波形图：正常波形 vs 振铃/缺终端电阻（含 CAN_H/CAN_L 轨迹）
  const hasWaveformLabel = /正常波形|缺少终端电阻|振铃|过冲|欠冲|振荡/.test(c)
  const hasWaveformSymbols = /[╱╲┌┐└┘┬─┤│]/.test(c) && (/CAN_H/.test(c) || /CAN_L/.test(c))
  if (hasWaveformLabel && hasWaveformSymbols && c.split('\n').length >= 3) {
    return 'oscilloscope'
  }

  // ③ 学习路线图 / 进阶阶梯：↓ 或纯 | 分隔 + 多数行带说明标签
  const lines = c.split('\n').map(l => l.trim()).filter(Boolean)
  const total = lines.length
  if (total >= 4) {
    const sepCount = lines.filter(l => /^[↓|]+$/.test(l)).length
    const topicNoteCount = lines.filter(l => /←/.test(l) || /[\[【].+?[\]】]/.test(l)).length
    const meaningCount = total - sepCount
    if (sepCount >= 2 && topicNoteCount >= meaningCount * 0.5 && /[一-鿿]/.test(c)) {
      return 'roadmap'
    }
  }

  // ④ 明确的网络拓扑对比：总线型/星型/环形/混合型 同时出现 + ECU/CAN
  const topoMarks = [/总线型[（(]Bus[)）]/, /星型[（(]Star[)）]/, /环形[（(]Ring[)）]/, /混合型/]
  const topoScore = topoMarks.reduce((s, re) => s + (re.test(c) ? 1 : 0), 0)
  if (topoScore >= 3 && /(ECU)/.test(c) && /CAN/.test(c)) return 'topology'

  // ⑤ 网关型整车网络：网关 + ≥2 种网络介质（CAN/LIN/以太网/FlexRay）+ 连线
  const netWords = (c.match(/动力CAN|底盘CAN|车身CAN|信息CAN|车载以太网|以太网|LIN|FlexRay|CAN/g) || [])
  const norm = new Set(netWords.map(w => /CAN/.test(w) ? 'CAN' : w))
  if (/网关/.test(c) && norm.size >= 2 && /[─═├└│┬┤┼]/.test(c)) return 'topology'

  // ⑥ 物理总线（真有 ECU 节点抽头）：横轴 + 抽头字符 + [ECU]/ECU1 节点
  //    收紧：避免把"知识全景图/引脚图/配置清单/HIL 框图"误升为拓扑
  if (/[─═]/.test(c) && /[╪╫┬┼]/.test(c) && /\[ECU|ECU[0-9]/.test(c)) return 'topology'

  // ⑦ 双通道 / 冗余通道：实线通道 + 通道节点（FlexRay 双通道等）
  if (/═{2,}/.test(c) && /(通道|Node|冗余|Channel|FlexRay)/.test(c)) return 'topology'

  // ⑧ 明确命名的 CAN/LIN 域节点树：根=域，子节点=ECU/部件（动力/底盘/车身 CAN 等）
  if (/^\s*(动力CAN|底盘CAN|车身CAN|信息CAN|LIN[总线]?|FlexRay|以太网)/m.test(c)
      && /[├└]/.test(c)
      && /(VCU|EMS|TCU|MCU|BMS|ABS|ESP|EPS|EPB|BCM|PEPS|HCU|域控|控制器|传感器|执行器)/.test(c)) return 'topology'

  // ⑨ 真正代码 → 原生 IDE 编辑器（绝不被误判为组件）
  if (isRealCode(c)) return 'code'

  // ⑩ 分层数据流（如导航：定位层→计算层→交互层）→ 结构化卡片，避免 ASCII 框线图过乱
  if (/定位层/.test(c) && /计算层/.test(c) && /交互层/.test(c) && /[┌┐└┘─│├┤┬┴┼]/.test(c)) return 'navflow'

  // ⑪ 其余含框线/制表/箭头字符的 ASCII 图 → 作为「示意图」原样展示，不强行拓扑化
  if (/[┌┐└┘─│├┤┬┴┼═╪╫║╔╗╚╝╠╣╦╩╬▼▲►◄→←]/.test(c)) return 'diagram'

  return 'code'
}

/* ---------- ASCII 示意图（内容感知：常见模式结构化，其他原样展示） ---------- */
function renderDiagramHTML(code) {
  const c = code || ''
  if (isDtcReadModes(c)) return renderDtcReadModesHTML(c)
  if (isDtcStatusByte(c)) return renderDtcStatusByteHTML(c)
  return renderGenericDiagramHTML(c)
}

function isDtcReadModes(c) {
  return /\$19\s+0?1\s*[—-]/.test(c) && /按状态掩码读DTC/.test(c) && /快照/.test(c)
}

function isDtcStatusByte(c) {
  return /bit7.*bit6.*bit5.*bit4.*bit3.*bit2.*bit1.*bit0/.test(c) && /testFailed|Confirmed DTC|Pending DTC/.test(c)
}

function renderGenericDiagramHTML(code) {
  const cap = '示意图'
  return `<div class="kb-diagram" data-raw="${escAttr(code)}">
    <div class="kb-fig-bar"><span class="kb-fig-ic">${ICON('diagram')}</span><span>${_esc(cap)}</span>
      <button class="kb-diagram-copy" type="button">复制</button></div>
    <pre><code>${_esc(code)}</code></pre>
  </div>`
}

/* ── $19 服务读取方式 → 结构化卡片网格 ── */
function renderDtcReadModesHTML(code) {
  const rows = []
  const lines = code.split('\n')
  const re = /^\$19\s+([0-9A-Fa-f]{1,2})\s*[—-]\s*(.+?)(?:\s+"(.+?)")?\s*(←.*)?$/
  lines.forEach(line => {
    const m = line.trim().match(re)
    if (!m) return
    const [, hex, name, question, tagRaw] = m
    let tag = '', tagClass = ''
    if (tagRaw) {
      const t = tagRaw.replace(/[←\s]/g, '')
      if (/最常用/.test(t)) { tag = '最常用'; tagClass = 'daily' }
      else if (/排障|排查/.test(t)) { tag = '排障常用'; tagClass = 'trouble' }
      else if (/全搞定|一条指令/.test(t)) { tag = '一键全读'; tagClass = 'all' }
      else { tag = t; tagClass = 'note' }
    }
    rows.push({ hex: hex.padStart(2, '0').toUpperCase(), name: name.trim(), question: (question || '').trim(), tag, tagClass })
  })
  if (!rows.length) return renderGenericDiagramHTML(code)
  const items = rows.map(r => {
    const tag = r.tag ? `<span class="kb-diag-tag kb-diag-tag-${r.tagClass}">${_esc(r.tag)}</span>` : ''
    const q = r.question ? `<div class="kb-diag-card-q">${_esc(r.question)}</div>` : ''
    return `<div class="kb-diag-card">
      <div class="kb-diag-card-head"><span class="kb-diag-sid">$19 ${_esc(r.hex)}</span>${tag}</div>
      <div class="kb-diag-card-title">${_esc(r.name)}</div>
      ${q}
    </div>`
  }).join('')
  return `<div class="kb-diagram kb-diagram-structured" data-raw="${escAttr(code)}">
    <div class="kb-fig-bar"><span class="kb-fig-ic">${ICON('diagram')}</span><span>$19 读取 DTC 的 8 种方式</span>
      <button class="kb-diagram-copy" type="button">复制</button></div>
    <div class="kb-diag-grid">${items}</div>
  </div>`
}

/* ── DTC 状态字节 → 位图可视化 ── */
function renderDtcStatusByteHTML(code) {
  const bitMap = [
    { bit: 0, key: 'testFailed', label: 'testFailed', desc: '当前循环检测到故障' },
    { bit: 2, key: 'pendingDTC', label: 'Pending DTC', desc: '待定故障（首次检出，未确认）' },
    { bit: 3, key: 'confirmedDTC', label: 'Confirmed DTC', desc: '已确认故障（存 NVM）' },
    { bit: 4, key: 'testNotCompleteSinceLastClear', label: 'testNotComplete SinceLastClear', desc: '清码后检测未完成（刚清码常见）' },
    { bit: 7, key: 'warningIndicatorRequested', label: 'warningIndicator Requested', desc: '请求亮故障灯 (MIL)，≠bit3' }
  ]
  code.split('\n').forEach(line => {
    const m = line.trim().match(/^bit(\d)=(\S+)\s*→\s*(.+)$/)
    if (m) {
      const b = parseInt(m[1], 10)
      const item = bitMap.find(x => x.bit === b)
      if (item) item.desc = m[3].trim()
    }
  })
  const cells = Array.from({ length: 8 }, (_, i) => {
    const b = 7 - i
    const item = bitMap.find(x => x.bit === b)
    const cls = item ? 'on' : 'off'
    const label = item ? item.label : `bit${b}`
    const desc = item ? item.desc : '保留/未定义'
    return `<div class="kb-bit-cell kb-bit-${cls}" data-bit="${b}">
      <span class="kb-bit-num">bit${b}</span>
      <span class="kb-bit-label">${_esc(label)}</span>
      <span class="kb-bit-desc">${_esc(desc)}</span>
    </div>`
  }).join('')
  return `<div class="kb-diagram kb-diagram-structured" data-raw="${escAttr(code)}">
    <div class="kb-fig-bar"><span class="kb-fig-ic">${ICON('chip')}</span><span>DTC 状态字节（1 Byte）</span>
      <button class="kb-diagram-copy" type="button">复制</button></div>
    <div class="kb-bitfield">${cells}</div>
    <div class="kb-bitfield-legend">
      <span class="kb-legend-dot on"></span> 面试常考位
      <span class="kb-legend-dot off"></span> 保留/次常用位
    </div>
  </div>`
}

/* ---------- 分层数据流图（如导航：定位层 → 计算层 → 交互层） ----------
   把复杂 ASCII 框线图重绘为清晰的“三栏卡片 + 层间箭头”HTML 结构 ---------- */
function renderNavFlowHTML(code) {
  const lines = (code || '').split('\n')
  // 优先按 ch15 导航数据流已知结构解析；无法解析则回落为普通示意图
  const layers = parseNavFlowLayers(lines)
  if (!layers || layers.length < 2) return renderDiagramHTML(code)

  const layerHTML = layers.map((layer, li) => {
    const items = (layer.items || []).map(item => {
      const sub = item.sub ? `<span class="nf-item-sub">${esc(item.sub)}</span>` : ''
      return `<div class="nf-item"><span class="nf-item-title">${esc(item.title)}</span>${sub}</div>`
    }).join('')
    return `<div class="nf-layer">
      <div class="nf-layer-head"><span class="nf-layer-num">0${li + 1}</span><span class="nf-layer-title">${esc(layer.title)}</span></div>
      <div class="nf-layer-body">${items}</div>
    </div>`
  }).join('')

  const arrows = layers.length - 1
  const arrowsHTML = Array.from({ length: arrows }, () =>
    `<div class="nf-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>`
  ).join('')

  return `<div class="kb-navflow">
    <div class="kb-fig-bar"><span class="kb-fig-ic">${ICON('diagram')}</span><span>导航系统数据流</span></div>
    <div class="nf-body">${layerHTML}${arrowsHTML}</div>
    <div class="nf-foot">关键依赖链：定位 → 计算 → 交互，任一环节丢信号/延迟都会直接体现在用户体验上</div>
  </div>`
}

/* 解析三栏分层 ASCII：按首行“定位层 计算层 交互层”分栏，再按 ┌/└ 框线提取每个框的文本 */
function parseNavFlowLayers(lines) {
  if (!lines || !lines.length) return null
  const first = lines[0] || ''
  const titles = first.trim().split(/\s{2,}/).filter(Boolean)
  if (titles.length < 2) return null
  const colCount = titles.length
  const totalW = first.length || 80
  const colW = Math.floor(totalW / colCount)
  const layers = titles.map(t => ({ title: t, items: [] }))

  let currentItems = layers.map(() => null)
  lines.slice(1).forEach((raw) => {
    const line = raw.replace(/[─┼├┤┬┴┌┐└┘]/g, ' ')
    for (let i = 0; i < colCount; i++) {
      const start = i * colW
      const seg = line.slice(start, start + colW).trim()
      if (!seg) continue
      // 框顶线：开始新项
      if (/^└|^┌/.test(raw.slice(start, start + colW))) {
        currentItems[i] = { title: '', sub: '' }
        layers[i].items.push(currentItems[i])
      } else if (currentItems[i]) {
        // 累积文本行；含 (/) 或 中英文混合的视为标题，纯说明文字视为子标题
        if (!currentItems[i].title) currentItems[i].title = seg
        else currentItems[i].sub += (currentItems[i].sub ? ' ' : '') + seg
      }
    }
  })
  // 清理空项
  layers.forEach(l => { l.items = l.items.filter(it => it.title || it.sub) })
  return layers.filter(l => l.items.length)
}

function parseRoadmapStep(line) {
  let title = '', sub = '', tag = '', note = ''

  // 模式 A：title [tag] note
  const bracketMatch = line.match(/^(.+?)\s*[\[【](.+?)[\]】]\s*(.*)$/)
  if (bracketMatch) {
    title = bracketMatch[1].trim()
    tag = bracketMatch[2].trim()
    note = bracketMatch[3].trim()
    return { title, sub, tag, note }
  }

  // 模式 B：title(subtitle) ← note  或  title ← note
  const arrowIdx = line.indexOf('←')
  if (arrowIdx !== -1) {
    const left = line.slice(0, arrowIdx).trim()
    note = line.slice(arrowIdx + 1).trim()
    const parenMatch = left.match(/^(.+?)\s*[(（](.+?)[)）]\s*$/)
    if (parenMatch) {
      title = parenMatch[1].trim()
      sub = parenMatch[2].trim()
    } else {
      title = left
    }
    const tagNoteMatch = note.match(/^(.+?)[：:]\s*(.+)$/)
    if (tagNoteMatch) {
      tag = tagNoteMatch[1].trim()
      note = tagNoteMatch[2].trim()
    }
    return { title, sub, tag, note }
  }

  title = line.trim()
  return { title, sub, tag, note }
}

function renderRoadmapHTML(code) {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l && !/^[↓|]+$/.test(l))
  const steps = lines.map(parseRoadmapStep)
  const total = steps.length
  const html = steps.map((s, i) => `
    <div class="lp-step" style="--i:${i}">
      <div class="lp-node">${i + 1}</div>
      <div class="lp-card">
        <div class="lp-title">${_esc(s.title)}</div>
        ${s.sub ? `<div class="lp-sub">${_esc(s.sub)}</div>` : ''}
        ${s.tag || s.note ? `<div class="lp-meta">
          ${s.tag ? `<span class="lp-tag">${_esc(s.tag)}</span>` : ''}
          ${s.note ? `<span class="lp-note">${_esc(s.note)}</span>` : ''}
        </div>` : ''}
      </div>
    </div>`).join('')
  return `<div class="learn-path-block">
    <div class="lp-summary">${ICON('link')} 学习路径 · 共 ${total} 步，由浅入深逐级递进</div>
    <div class="learn-path" data-steps="${total}">${html}</div>
  </div>`
}

function renderCanDiffHTML(code) {
  // 固定渲染标准 CAN 差分信号示意图（从文本中识别意图，视觉统一）
  return `<div class="signal-diagram sig-can-diff">
    <div class="sd-title">CAN 差分信号：隐性（逻辑1）→ 显性（逻辑0）</div>
    <svg viewBox="0 0 720 240" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sdGradH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#22c55e" stop-opacity=".6"/>
          <stop offset="100%" stop-color="#22c55e"/>
        </linearGradient>
        <linearGradient id="sdGradL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity=".6"/>
          <stop offset="100%" stop-color="#3b82f6"/>
        </linearGradient>
      </defs>
      <!-- 参考线 2.5V -->
      <line class="sd-ref" x1="40" y1="120" x2="680" y2="120"/>
      <text class="sd-ref-label" x="30" y="124">2.5V</text>

      <!-- 状态标签 -->
      <text class="sd-state" x="150" y="30">隐性（逻辑1）</text>
      <text class="sd-state" x="390" y="30">显性（逻辑0）</text>

      <!-- 过渡区虚线 -->
      <line class="sd-trans" x1="260" y1="40" x2="260" y2="200"/>
      <line class="sd-trans" x1="320" y1="40" x2="320" y2="200"/>

      <!-- CAN_H 波形 -->
      <polyline class="sd-wave sd-h" points="40,120 260,120 320,50 500,50"/>
      <text class="sd-label" x="510" y="40">CAN_H</text>
      <text class="sd-vlabel" x="510" y="58">3.5V</text>

      <!-- CAN_L 波形 -->
      <polyline class="sd-wave sd-l" points="40,120 260,120 320,190 500,190"/>
      <text class="sd-label" x="510" y="205">CAN_L</text>
      <text class="sd-vlabel" x="510" y="187">1.5V</text>

      <!-- 底部说明 -->
      <text class="sd-sum" x="150" y="225">CAN_H = CAN_L = 2.5V</text>
      <text class="sd-sum" x="390" y="225">CAN_H=3.5V，CAN_L=1.5V，差值≈2V</text>
    </svg>
  </div>`
}

/* ---------- 示波器波形诊断（ASCII code 识别后可视化） ---------- */
function renderOscilloscopeHTML(code) {
  const c = code || ''
  const leftLabel = c.match(/正常波形/) ? '正常波形' : '标准波形'
  const rightLabel = c.match(/缺少终端电阻|振铃/) ? '缺少终端电阻（振铃）' : '故障波形'
  const leftNote = c.match(/干净|振幅一致/) ? '干净、振幅一致' : ''
  const rightNote = c.match(/过冲|欠冲|振荡|振铃/) ? '有过冲/欠冲、振荡' : ''

  function screenSVG(title, note, ringing) {
    const W = 340, H = 220
    const left = 24, right = 316, top = 28, bottom = 160
    const lowH = 138, highH = 58, lowL = 138, highL = 58
    const mid = (lowH + highH) / 2
    // 网格线
    let grid = ''
    for (let x = left; x <= right; x += 40) grid += `<line class="osc-grid" x1="${x}" y1="${top}" x2="${x}" y2="${bottom}"/>`
    for (let y = top; y <= bottom; y += 32) grid += `<line class="osc-grid" x1="${left}" y1="${y}" x2="${right}" y2="${y}"/>`

    // 脉冲边沿坐标：三段隐性→显性→隐性→显性→隐性
    const edges = [
      [left, 60], [90, 60], [110, highH], [170, highH], [190, lowH], [250, lowH], [270, highH], [right - 10, highH]
    ]

    function tracePath(points, low, high, ringing) {
      let d = `M ${points[0][0]} ${points[0][1] === highH ? high : low}`
      for (let i = 1; i < points.length; i++) {
        const [x, y] = points[i]
        const prev = points[i - 1]
        const targetY = y === highH ? high : low
        if (prev[1] !== y && ringing) {
          // 在边沿加入阻尼振荡
          const steps = 18
          const amp = (prev[1] === highH ? low - high : high - low) * 0.35
          for (let s = 1; s <= steps; s++) {
            const t = s / steps
            const xi = prev[0] + (x - prev[0]) * t
            const decay = Math.exp(-t * 3.5)
            const yi = prev[1] === highH
              ? high + (targetY - high) * t + amp * Math.sin(t * Math.PI * 8) * decay
              : low + (targetY - low) * t - amp * Math.sin(t * Math.PI * 8) * decay
            d += ` L ${xi.toFixed(1)} ${yi.toFixed(1)}`
          }
        } else {
          d += ` L ${x} ${targetY}`
        }
      }
      return d
    }

    const pathH = tracePath(edges, lowH, highH, ringing)
    const pathL = tracePath(edges.map(([x, y]) => [x, y === highH ? lowH : highH]), lowL, highL, ringing)

    return `<div class="osc-screen">
      <div class="osc-screen-title">${_esc(title)}</div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <rect class="osc-bg" x="0" y="0" width="${W}" height="${H}" rx="8"/>
        ${grid}
        <line class="osc-axis" x1="${left}" y1="${mid}" x2="${right}" y2="${mid}"/>
        <path class="osc-trace osc-trace-h" d="${pathH}"/>
        <path class="osc-trace osc-trace-l" d="${pathL}"/>
        <text class="osc-trace-label osc-trace-label-h" x="${left + 6}" y="${highH - 8}">CAN_H</text>
        <text class="osc-trace-label osc-trace-label-l" x="${left + 6}" y="${lowL + 18}">CAN_L</text>
        ${note ? `<text class="osc-note" x="${W / 2}" y="${bottom + 32}" text-anchor="middle">${_esc(note)}</text>` : ''}
      </svg>
    </div>`
  }

  return `<div class="oscilloscope-wrap">
    <div class="osc-head"><span class="ic">' + ICON('signal') + '</span><span>示波器波形诊断</span></div>
    <div class="osc-screens">
      ${screenSVG(leftLabel, leftNote, false)}
      ${screenSVG(rightLabel, rightNote, true)}
    </div>
  </div>`
}

/* ---------- 网关型网络拓扑（ASCII code 识别后可视化） ---------- */
function renderGatewayTopologyHTML(code) {
  // 从文本提取各路 CAN / 以太网标注（取最长匹配）
  const labels = []
  const m = code.match(/(动力CAN[^\n]*?)(?=\s*──|$)/) || code.match(/动力CAN[^\n]*/)
  if (m) labels.push({ name: '动力CAN', sub: '500K', y: 60 })
  if (/底盘CAN/.test(code)) labels.push({ name: '底盘CAN', sub: '500K', y: 100 })
  if (/车身CAN/.test(code)) labels.push({ name: '车身CAN', sub: '125K', y: 140 })
  if (/诊断OBD|OBD/.test(code)) labels.push({ name: '诊断OBD', sub: '', y: 180 })
  if (labels.length < 2) labels.push({ name: '车身CAN', sub: '125K', y: 140 })

  const leftPad = 100           // 左侧文字区宽度（避免 text-anchor:end 被裁切）
  const busStart = leftPad + 10 // 总线起点
  const gwX = 290               // 网关中心 X
  const W = 760, H = 320
  let svg = '<svg class="topo-flow-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">'

  // 左侧 CAN 总线
  labels.forEach(lbl => {
    svg += '<line class="topo-flow-arrow" x1="' + busStart + '" y1="' + lbl.y + '" x2="' + (gwX - 30) + '" y2="' + lbl.y + '"/>'
    svg += '<text class="topo-flow-layer-title" x="' + leftPad + '" y="' + (lbl.y + 4) + '" text-anchor="end">' + _esc(lbl.name) + '</text>'
    if (lbl.sub) svg += '<text class="topo-flow-item" x="' + leftPad + '" y="' + (lbl.y + 18) + '" text-anchor="end">' + _esc(lbl.sub) + '</text>'
  })

  // 网关
  svg += '<rect class="topo-flow-fb-box" x="' + (gwX - 50) + '" y="95" width="100" height="90" rx="10"/>'
  svg += '<text class="topo-flow-fb-title" x="' + gwX + '" y="140" text-anchor="middle">网关</text>'
  svg += '<text class="topo-flow-fb-sub" x="' + gwX + '" y="160" text-anchor="middle">路由 / 转发</text>'

  // 连接到网关的竖线
  labels.forEach(lbl => {
    svg += '<line class="topo-flow-arrow" x1="' + (gwX - 30) + '" y1="' + lbl.y + '" x2="' + (gwX - 50) + '" y2="' + lbl.y + '"/>'
  })

  // 右侧 信息CAN
  const infoY = 100
  const infoX = gwX + 170
  svg += '<line class="topo-flow-arrow" x1="' + (gwX + 50) + '" y1="140" x2="' + infoX + '" y2="140"/>'
  svg += '<line class="topo-flow-arrow" x1="' + infoX + '" y1="140" x2="' + infoX + '" y2="' + infoY + '"/>'
  svg += '<rect class="topo-flow-box" x="' + (infoX - 60) + '" y="' + (infoY - 18) + '" width="120" height="36" rx="6"/>'
  svg += '<text class="topo-flow-layer-title" x="' + infoX + '" y="' + (infoY + 4) + '" text-anchor="middle">信息CAN</text>'
  svg += '<text class="topo-flow-item" x="' + infoX + '" y="' + (infoY + 34) + '" text-anchor="middle">仪表 / 中控 / HUD（125K/500K 常见）</text>'

  // 下方 车载以太网
  const ethY = 230
  svg += '<line class="topo-flow-arrow" x1="' + gwX + '" y1="185" x2="' + gwX + '" y2="' + (ethY - 10) + '"/>'
  svg += '<polygon class="topo-flow-arrow-head" points="' + (gwX - 4) + ',' + (ethY - 10) + ' ' + gwX + ',' + ethY + ' ' + (gwX + 4) + ',' + (ethY - 10) + '"/>'
  svg += '<rect class="topo-flow-box" x="' + (gwX - 90) + '" y="' + ethY + '" width="180" height="40" rx="6"/>'
  svg += '<text class="topo-flow-layer-title" x="' + gwX + '" y="' + (ethY + 17) + '" text-anchor="middle">车载以太网 100M</text>'
  svg += '<text class="topo-flow-item" x="' + gwX + '" y="' + (ethY + 33) + '" text-anchor="middle">座舱 / 智驾域控 / T-BOX</text>'

  svg += '</svg>'
  return '<div class="topo-wrap"><div class="topo-head"><span class="ic">' + ICON('globe') + '</span><span>整车网络拓扑</span></div>' + svg + '</div>'
}

/* ---------- 文本折行辅助：按视觉宽度拆分 SVG 文本 ---------- */
function wrapSvgText(text, maxWidth) {
  const t = String(text || '').trim()
  if (!t) return []
  const charWidth = ch => (/\p{Unified_Ideograph}/u.test(ch) || /[、，。！？；：""''（）【】]/.test(ch)) ? 2 : 1
  const words = t.split(/\s+/)
  const lines = []
  let line = '', w = 0
  for (const word of words) {
    const ww = Array.from(word).reduce((s, ch) => s + charWidth(ch), 0)
    if (ww > maxWidth) {
      // 超长词强制截断
      if (line) { lines.push(line); line = ''; w = 0 }
      let chunk = '', cw = 0
      for (const ch of Array.from(word)) {
        const cw1 = charWidth(ch)
        if (cw + cw1 > maxWidth && chunk) { lines.push(chunk); chunk = ch; cw = cw1 }
        else { chunk += ch; cw += cw1 }
      }
      if (chunk) { line = chunk; w = cw }
      continue
    }
    if (w + ww + (line ? 1 : 0) > maxWidth) { lines.push(line); line = word; w = ww }
    else { line = line ? line + ' ' + word : word; w += ww + (line ? 1 : 0) }
  }
  if (line) lines.push(line)
  return lines.length ? lines : [t]
}

/* ---------- 树型网络拓扑（ASCII code 识别后可视化） ---------- */
function renderTreeTopologyHTML(code) {
  const rawLines = code.split('\n').map(l => l.replace(/\r/g, '')).filter(Boolean)
  // 过滤掉纯框线/空白的装饰行
  const meaningful = rawLines.filter(l => {
    const stripped = l.replace(/[\s│├└─┄┅┈┉═╴╶╸╺┐┌┘└┤├┬┴┼┃┏┓┗┛┣┫┳┻╋]/g, '').trim()
    return stripped.length > 0 && !/^\.+$/.test(stripped)
  })

  const rootLine = meaningful.find(l => !/[├└]/.test(l)) || meaningful[0]
  const childLines = meaningful.filter(l => /[├└]/.test(l))
  const root = rootLine ? rootLine.replace(/[\[\]]/g, '').trim() : '根节点'
  const children = childLines.map(l => {
    const text = l.replace(/^[\s│├└─]+/, '').replace(/[\[\]]/g, '').trim()
    return text || '子节点'
  }).filter(Boolean).slice(0, 6)

  if (!children.length) return renderGatewayTopologyHTML(code)

  const W = 720
  const rootX = W / 2
  const rootW = 180, rootLineH = 18
  const rootLines = wrapSvgText(root, 16).slice(0, 3)
  const rootH = 14 + rootLines.length * rootLineH
  const rootY = 34 + rootH / 2

  const childW = 120, childLineH = 16
  const gap = 14
  const totalW = children.length * childW + (children.length - 1) * gap
  const startX = (W - totalW) / 2
  const childY = rootY + rootH / 2 + 56

  const childBlocks = children.map(child => {
    const lines = wrapSvgText(child, 10).slice(0, 4)
    const h = Math.max(42, 12 + lines.length * childLineH)
    return { text: child, lines, h }
  })
  const maxChildH = Math.max(...childBlocks.map(b => b.h))
  const H = Math.max(260, childY + maxChildH + 40)

  let svg = '<svg class="topo-flow-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">'

  // 根节点
  svg += '<rect class="topo-flow-box" x="' + (rootX - rootW / 2) + '" y="' + (rootY - rootH / 2) + '" width="' + rootW + '" height="' + rootH + '" rx="8"/>'
  rootLines.forEach((line, i) => {
    const y = rootY - (rootLines.length - 1) * rootLineH / 2 + i * rootLineH + 4
    svg += '<text class="topo-flow-layer-title" x="' + rootX + '" y="' + y + '" text-anchor="middle">' + _esc(line) + '</text>'
  })

  // 主干竖线
  svg += '<line class="topo-flow-arrow" x1="' + rootX + '" y1="' + (rootY + rootH / 2) + '" x2="' + rootX + '" y2="' + (childY - 24) + '"/>'

  // 子节点横线
  const firstChildCX = startX + childW / 2
  const lastChildCX = startX + (children.length - 1) * (childW + gap) + childW / 2
  svg += '<line class="topo-flow-arrow" x1="' + firstChildCX + '" y1="' + (childY - 24) + '" x2="' + lastChildCX + '" y2="' + (childY - 24) + '"/>'

  childBlocks.forEach((b, i) => {
    const x = startX + i * (childW + gap)
    const cx = x + childW / 2
    svg += '<line class="topo-flow-arrow" x1="' + cx + '" y1="' + (childY - 24) + '" x2="' + cx + '" y2="' + childY + '"/>'
    svg += '<rect class="topo-flow-fb-box" x="' + x + '" y="' + childY + '" width="' + childW + '" height="' + maxChildH + '" rx="6"/>'
    b.lines.forEach((line, j) => {
      const y = childY + maxChildH / 2 - (b.lines.length - 1) * childLineH / 2 + j * childLineH + 4
      svg += '<text class="topo-flow-fb-title" x="' + cx + '" y="' + y + '" text-anchor="middle">' + _esc(line) + '</text>'
    })
    if (b.text.length > 40) svg += '<title>' + _esc(b.text) + '</title>'
  })

  svg += '</svg>'
  return '<div class="topo-wrap"><div class="topo-head"><span class="ic">' + ICON('globe') + '</span><span>网络拓扑</span></div>' + svg + '</div>'
}

/* ---------- 内容感知组件 ②b：网络拓扑示意图（ASCII code 识别后可视化） ---------- */
function renderTopologyHTML(code) {
  const c = code || ''
  const hasBus = /总线型[（(]Bus[)）]/.test(c)
  const hasStar = /星型[（(]Star[)）]/.test(c)
  const hasRing = /环形[（(]Ring[)）]/.test(c)
  const hasHybrid = /混合型/.test(c)

  // 1) 经典拓扑类型优先（总线/星型/环形/混合），避免被树型逻辑误吞
  const classicTopo = hasBus || hasStar || hasRing || hasHybrid

  // 2) 网关型：网关 + 多路 CAN + 连线字符
  const hasGateway = /网关/.test(c) && (/动力CAN/.test(c) || /底盘CAN/.test(c) || /车身CAN/.test(c) || /信息CAN/.test(c)) && /[─├└│]/.test(c)

  // 3) 树型：有明确子节点（├/└ 行不少于 2 条）且内容有意义
  const childLikeLines = c.split('\n').filter(l => /[├└]/.test(l) && l.replace(/[\s│├└─┄┅┈┉═╴╶╸╺┐┌┘└┤├┬┴┼┃┏┓┗┛┣┫┳┻╋]/g, '').trim().length > 0)
  const hasTree = !classicTopo && childLikeLines.length >= 2 && /CAN|LIN|ECU|节点/.test(c) && c.split('\n').length >= 4

  // 若文本里明确出现 总线/星型/环形/混合 四类经典拓扑，优先按四卡片展示，
  // 避免被网关/树型逻辑误吞（如 ch01「四种拓扑长什么样」同时含"网关"关键字）。
  if (hasGateway && !classicTopo) return renderGatewayTopologyHTML(c)
  if (hasTree && !classicTopo) return renderTreeTopologyHTML(c)
  // 经典拓扑若命中则继续下面的卡片渲染；未命中任何拓扑时不渲染为拓扑，保持原 code 块

  const busSvg = '<svg viewBox="0 0 280 130" preserveAspectRatio="xMidYMid meet">' +
    '<line class="topo-line" x1="40" y1="85" x2="240" y2="85"/>' +
    '<text class="topo-term" x="30" y="89">120Ω</text>' +
    '<text class="topo-term" x="250" y="89">120Ω</text>' +
    '<rect class="topo-node" x="60" y="25" width="28" height="18" rx="3"/><text class="topo-text" x="74" y="38">ECU1</text><line class="topo-line" x1="74" y1="43" x2="74" y2="85"/>' +
    '<rect class="topo-node" x="108" y="25" width="28" height="18" rx="3"/><text class="topo-text" x="122" y="38">ECU2</text><line class="topo-line" x1="122" y1="43" x2="122" y2="85"/>' +
    '<rect class="topo-node" x="156" y="25" width="28" height="18" rx="3"/><text class="topo-text" x="170" y="38">ECU3</text><line class="topo-line" x1="170" y1="43" x2="170" y2="85"/>' +
    '<rect class="topo-node" x="204" y="25" width="28" height="18" rx="3"/><text class="topo-text" x="218" y="38">ECU4</text><line class="topo-line" x1="218" y1="43" x2="218" y2="85"/>' +
  '</svg>'

  const starSvg = '<svg viewBox="0 0 260 180" preserveAspectRatio="xMidYMid meet">' +
    '<rect class="topo-node" x="100" y="78" width="60" height="26" rx="4"/><text class="topo-text" x="130" y="97">交换机</text>' +
    '<rect class="topo-node" x="116" y="16" width="28" height="18" rx="3"/><text class="topo-text" x="130" y="29">ECU1</text><line class="topo-line" x1="130" y1="34" x2="130" y2="78"/>' +
    '<rect class="topo-node" x="206" y="82" width="28" height="18" rx="3"/><text class="topo-text" x="220" y="95">ECU2</text><line class="topo-line" x1="206" y1="91" x2="160" y2="91"/>' +
    '<rect class="topo-node" x="116" y="146" width="28" height="18" rx="3"/><text class="topo-text" x="130" y="159">ECU3</text><line class="topo-line" x1="130" y1="146" x2="130" y2="104"/>' +
    '<rect class="topo-node" x="26" y="82" width="28" height="18" rx="3"/><text class="topo-text" x="40" y="95">ECU4</text><line class="topo-line" x1="54" y1="91" x2="100" y2="91"/>' +
  '</svg>'

  const ringSvg = '<svg viewBox="0 0 260 180" preserveAspectRatio="xMidYMid meet">' +
    '<rect class="topo-node" x="46" y="28" width="28" height="18" rx="3"/><text class="topo-text" x="60" y="41">ECU1</text>' +
    '<rect class="topo-node" x="186" y="28" width="28" height="18" rx="3"/><text class="topo-text" x="200" y="41">ECU2</text>' +
    '<rect class="topo-node" x="186" y="134" width="28" height="18" rx="3"/><text class="topo-text" x="200" y="147">ECU3</text>' +
    '<rect class="topo-node" x="46" y="134" width="28" height="18" rx="3"/><text class="topo-text" x="60" y="147">ECU4</text>' +
    '<line class="topo-line" x1="60" y1="46" x2="200" y2="46"/>' +
    '<line class="topo-line" x1="200" y1="46" x2="200" y2="134"/>' +
    '<line class="topo-line" x1="200" y1="139" x2="60" y2="139"/>' +
    '<line class="topo-line" x1="60" y1="134" x2="60" y2="46"/>' +
    '<polygon class="topo-node-fill" points="120,42 128,46 120,50"/>' +
  '</svg>'

  const hybridSvg = '<svg viewBox="0 0 340 170" preserveAspectRatio="xMidYMid meet">' +
    '<line class="topo-line" x1="30" y1="58" x2="130" y2="58"/>' +
    '<text class="topo-label" x="80" y="48">动力CAN</text>' +
    '<rect class="topo-node" x="42" y="24" width="26" height="16" rx="3"/><text class="topo-text" x="55" y="35">ECU</text><line class="topo-line" x1="55" y1="40" x2="55" y2="58"/>' +
    '<rect class="topo-node" x="82" y="24" width="26" height="16" rx="3"/><text class="topo-text" x="95" y="35">ECU</text><line class="topo-line" x1="95" y1="40" x2="95" y2="58"/>' +
    '<line class="topo-line" x1="210" y1="58" x2="310" y2="58"/>' +
    '<text class="topo-label" x="260" y="48">车身CAN</text>' +
    '<rect class="topo-node" x="222" y="24" width="26" height="16" rx="3"/><text class="topo-text" x="235" y="35">ECU</text><line class="topo-line" x1="235" y1="40" x2="235" y2="58"/>' +
    '<rect class="topo-node" x="262" y="24" width="26" height="16" rx="3"/><text class="topo-text" x="275" y="35">ECU</text><line class="topo-line" x1="275" y1="40" x2="275" y2="58"/>' +
    '<rect class="topo-node-fill" x="140" y="100" width="60" height="28" rx="4"/><text class="topo-text-inverse" x="170" y="120">网关</text>' +
    '<line class="topo-line" x1="80" y1="58" x2="170" y2="100"/>' +
    '<line class="topo-line" x1="260" y1="58" x2="170" y2="100"/>' +
    '<line class="topo-line" x1="200" y1="114" x2="240" y2="114"/>' +
    '<text class="topo-label" x="220" y="106">以太网</text>' +
    '<line class="topo-line" x1="240" y1="114" x2="280" y2="114"/>' +
    '<rect class="topo-node" x="280" y="102" width="40" height="24" rx="3"/><text class="topo-text" x="300" y="119">域控</text>' +
  '</svg>'

  const cards = []
  if (hasBus) cards.push('<div class="topo-card"><div class="topo-title">总线型（Bus）</div>' + busSvg + '<ul class="topo-notes"><li>共享主干：CAN_H / CAN_L</li><li>线束断 / 短路 / 电阻失效 = 全网瘫</li></ul></div>')
  if (hasStar) cards.push('<div class="topo-card"><div class="topo-title">星型（Star）</div>' + starSvg + '<ul class="topo-notes"><li>分支断只坏一个</li><li>交换机挂 = 全网瘫</li></ul></div>')
  if (hasRing) cards.push('<div class="topo-card"><div class="topo-title">环形（Ring）</div>' + ringSvg + '<ul class="topo-notes"><li>断一处可从反方向继续通信</li><li>代表：MOST 多媒体环网</li></ul></div>')
  if (hasHybrid) cards.push('<div class="topo-card"><div class="topo-title">混合型</div>' + hybridSvg + '<ul class="topo-notes"><li>量产车的真实形态</li><li>网关 = 星型中心，每条 CAN 仍是总线型</li></ul></div>')

  if (!cards.length) return ''
  return '<div class="topo-wrap"><div class="topo-head"><span class="ic">' + ICON('globe') + '</span><span>网络拓扑</span></div><div class="topo-grid">' + cards.join('') + '</div></div>'
}

/* ---------- 内容感知组件 ②c：显式拓扑块（结构化数据，如中控链路流程图） ---------- */
function renderTopologyBlockHTML(b) {
  const kind = b.kind || 'flow'
  if (kind === 'flow') return renderFlowTopologyHTML(b)
  // 其它类型可继续扩展；暂用 ASCII 识别兜底
  return renderTopologyHTML(b.code || '')
}

function renderFlowTopologyHTML(b) {
  const layers = b.layers || []
  if (!layers.length) return ''
  const feedback = b.feedback || {}
  const edges = b.edges || []
  const title = b.title || '流程拓扑'
  const loopBack = feedback.loop !== false

  const W = 800
  // 根据层数自适应盒子宽度和间距，保证 6 层也能放下
  const desiredBoxW = 150, desiredGap = 24
  const minBoxW = 110, minGap = 14
  let boxW = desiredBoxW, gap = desiredGap
  const totalNeeded = layers.length * desiredBoxW + (layers.length - 1) * desiredGap
  if (totalNeeded > W - 40) {
    gap = minGap
    boxW = Math.max(minBoxW, (W - 40 - (layers.length - 1) * gap) / layers.length)
  }
  const boxH = 90
  const startX = (W - (layers.length * boxW + (layers.length - 1) * gap)) / 2
  const topY = 56
  const hasFeedback = feedback.steps && feedback.steps.length
  const H = topY + boxH + (hasFeedback ? 140 : 40)

  let svg = '<svg class="topo-flow-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">'

  // 顶层横向流程
  layers.forEach((layer, i) => {
    const x = startX + i * (boxW + gap)
    const y = topY
    svg += '<rect class="topo-flow-box" x="' + x + '" y="' + y + '" width="' + boxW + '" height="' + boxH + '" rx="8"/>'
    svg += '<rect class="topo-flow-layer-head" x="' + x + '" y="' + y + '" width="' + boxW + '" height="26" rx="8"/>'
    svg += '<text class="topo-flow-layer-title" x="' + (x + boxW / 2) + '" y="' + (y + 17) + '" text-anchor="middle">' + _esc(layer.name) + '</text>'
    const items = (layer.items || []).slice(0, 3)
    items.forEach((item, j) => {
      svg += '<text class="topo-flow-item" x="' + (x + boxW / 2) + '" y="' + (y + 47 + j * 18) + '" text-anchor="middle">' + _esc(item) + '</text>'
    })
    if (i < layers.length - 1) {
      const ax = x + boxW, ay = y + boxH / 2
      const ax2 = startX + (i + 1) * (boxW + gap)
      svg += '<line class="topo-flow-arrow" x1="' + ax + '" y1="' + ay + '" x2="' + (ax2 - 6) + '" y2="' + ay + '"/>'
      svg += '<polygon class="topo-flow-arrow-head" points="' + ax2 + ',' + (ay - 4) + ' ' + (ax2 + 7) + ',' + ay + ' ' + ax2 + ',' + (ay + 4) + '"/>'
      const edgeLabel = edges[i] ? (typeof edges[i] === 'string' ? edges[i] : (edges[i].label || '')) : ''
      if (edgeLabel) {
        const mx = (ax + ax2 - 6) / 2
        svg += '<text class="topo-flow-edge-label" x="' + mx + '" y="' + (ay - 10) + '" text-anchor="middle">' + _esc(edgeLabel) + '</text>'
      }
    }
  })

  // 底部状态回显 / 反馈链路（默认闭环，可 feedback.loop:false 关闭）
  if (feedback.steps && feedback.steps.length) {
    const fbLabelY = topY + boxH + 34
    svg += '<text class="topo-flow-feedback-label" x="' + (W / 2) + '" y="' + fbLabelY + '" text-anchor="middle">' + _esc(feedback.label || '状态回显闭环') + '</text>'

    const fbSteps = feedback.steps
    const fbBoxW = 130, fbBoxH = 58
    const fbGap = 18
    const fbTotalW = fbSteps.length * fbBoxW + (fbSteps.length - 1) * fbGap
    const fbStartX = (W - fbTotalW) / 2
    const fbY = topY + boxH + 52

    fbSteps.forEach((step, i) => {
      const x = fbStartX + i * (fbBoxW + fbGap)
      svg += '<rect class="topo-flow-fb-box" x="' + x + '" y="' + fbY + '" width="' + fbBoxW + '" height="' + fbBoxH + '" rx="6"/>'
      svg += '<text class="topo-flow-fb-title" x="' + (x + fbBoxW / 2) + '" y="' + (fbY + 22) + '" text-anchor="middle">' + _esc(step.name) + '</text>'
      if (step.sub) {
        svg += '<text class="topo-flow-fb-sub" x="' + (x + fbBoxW / 2) + '" y="' + (fbY + 41) + '" text-anchor="middle">' + _esc(step.sub) + '</text>'
      }
      if (i < fbSteps.length - 1) {
        const ax = x + fbBoxW, ay = fbY + fbBoxH / 2
        const ax2 = fbStartX + (i + 1) * (fbBoxW + fbGap)
        svg += '<line class="topo-flow-arrow" x1="' + ax + '" y1="' + ay + '" x2="' + (ax2 - 6) + '" y2="' + ay + '"/>'
        svg += '<polygon class="topo-flow-arrow-head" points="' + ax2 + ',' + (ay - 4) + ' ' + (ax2 + 7) + ',' + ay + ' ' + ax2 + ',' + (ay + 4) + '"/>'
      }
    })

    // 从顶层最后一个盒子向下到第一个反馈节点
    const lastLayerX = startX + (layers.length - 1) * (boxW + gap) + boxW / 2
    const lastLayerY = topY + boxH
    const firstFbX = fbStartX + fbBoxW / 2
    const firstFbY = fbY
    svg += '<line class="topo-flow-arrow" x1="' + lastLayerX + '" y1="' + lastLayerY + '" x2="' + lastLayerX + '" y2="' + (firstFbY - 10) + '"/>'
    svg += '<polygon class="topo-flow-arrow-head" points="' + (lastLayerX - 4) + ',' + (firstFbY - 10) + ' ' + lastLayerX + ',' + (firstFbY - 2) + ' ' + (lastLayerX + 4) + ',' + (firstFbY - 10) + '"/>'

    // 从最后一个反馈节点向左回到顶层第一个盒子（闭环，可关闭）
    if (loopBack) {
      const lastFbX = fbStartX + (fbSteps.length - 1) * (fbBoxW + fbGap) + fbBoxW / 2
      const firstLayerX = startX + boxW / 2
      const loopY = fbY - 28
      svg += '<path class="topo-flow-arrow" d="M ' + lastFbX + ' ' + fbY + ' L ' + lastFbX + ' ' + loopY + ' L ' + firstLayerX + ' ' + loopY + ' L ' + firstLayerX + ' ' + lastLayerY + '" fill="none"/>'
      svg += '<polygon class="topo-flow-arrow-head" points="' + (firstLayerX - 4) + ',' + (lastLayerY + 8) + ' ' + firstLayerX + ',' + (lastLayerY + 16) + ' ' + (firstLayerX + 4) + ',' + (lastLayerY + 8) + '"/>'
    }
  }

  svg += '</svg>'

  return '<div class="topo-flow-wrap">' +
    '<div class="topo-flow-head"><span class="ic">' + ICON('globe') + '</span><span>' + _esc(title) + '</span></div>' +
    svg +
    '</div>'
}

/* ---------- 内容感知组件 ③：三代 E/E 架构演进（显式 type 渲染） ---------- */
function renderEeEvolutionHTML(b) {
  const gens = (b && b.generations) || []
  if (!gens.length) return ''

  const arrowSVG = '<div class="ee-arrow" aria-hidden="true"><svg viewBox="0 0 40 60" preserveAspectRatio="xMidYMid meet"><line class="ee-arrow-line" x1="6" y1="30" x2="30" y2="30"/><path class="ee-arrow-head" d="M26 22 L36 30 L26 38 Z"/></svg></div>'

  const cardHTML = (g, i) => {
    const accent = { gen1: '#22c55e', gen2: '#2563eb', gen3: '#8b5cf6' }[g.accent] || '#2563eb'
    let visual = ''
    if (g.kind === 'ecu') {
      visual = '<div class="ee-nodes">' + g.nodes.map((n, k) =>
        '<div class="ee-node" style="--j:' + k + '"><span class="ee-node-l">' + _esc(n.label) + '</span><span class="ee-node-s">' + _esc(n.sub) + '</span></div>'
      ).join('') + '</div>'
    } else if (g.kind === 'domain') {
      visual = '<div class="ee-domains">' + g.domains.map((d, k) =>
        '<div class="ee-domain" style="--j:' + k + '"><div class="ee-domain-name">' + _esc(d.name) + '</div><div class="ee-ditems">' +
        d.items.map(it => '<span class="ee-ditem">' + _esc(it) + '</span>').join('') + '</div></div>'
      ).join('') + '</div>'
    } else if (g.kind === 'zonal') {
      const v = g.vcc
      visual = '<div class="ee-zonal">' +
        '<div class="ee-vcc" style="--j:0"><div class="ee-vcc-name">' + _esc(v.name) + '</div><div class="ee-ditems">' +
        v.items.map(it => '<span class="ee-ditem">' + _esc(it) + '</span>').join('') + '</div></div>' +
        '<div class="ee-zones">' + g.zones.map((z, k) =>
          '<div class="ee-zone" style="--j:' + (k + 1) + '">' + _esc(z) + '</div>').join('') + '</div>' +
        '</div>'
    }

    let tag = ''
    if (g.highlight) {
      tag = '<div class="ee-highlight">' + ICON('bolt') + ' ' + _esc(g.highlight) + '</div>'
    } else if (g.pain) {
      tag = '<div class="ee-pain">' + ICON('warning') + ' ' + _esc(g.pain) + '</div>'
    } else if (g.tag) {
      tag = '<div class="ee-chip">' + _esc(g.tag) + '</div>'
    }

    return '<div class="ee-card" style="--accent:' + accent + ';--i:' + i + '" data-accent="' + _esc(g.accent) + '">' +
      '<div class="ee-head">' +
        '<span class="ee-badge">' + _esc(g.phase) + '</span>' +
        '<span class="ee-stage">' + _esc(g.stage) + '</span>' +
        '<h4 class="ee-title">' + _esc(g.title) + '</h4>' +
      '</div>' +
      '<div class="ee-visual">' + visual + '</div>' +
      tag +
      '<div class="ee-foot">' +
        '<div class="ee-foot-row"><span class="ee-foot-ic">' + ICON('car') + '</span><span>' + _esc(g.cars) + '</span></div>' +
        '<div class="ee-foot-era">' + _esc(g.era) + '</div>' +
      '</div>' +
    '</div>'
  }

  let inner = ''
  gens.forEach((g, i) => {
    inner += cardHTML(g, i)
    if (i < gens.length - 1) inner += arrowSVG
  })

  return '<div class="ee-evolution" aria-label="三代 E/E 架构演进对比">' + inner + '</div>'
}

/* 三代架构卡片：点击 pin（保持聚焦态便于跨代对照）；文本拖选时不触发 */
document.addEventListener('click', (e) => {
  const card = e.target.closest && e.target.closest('.ee-card')
  if (!card) return
  if (e.target.closest('a, button')) return
  const sel = window.getSelection && window.getSelection()
  if (sel && sel.toString().trim().length > 0) return
  card.classList.toggle('ee-pin')
})

/* ============================================================
   仿真组件引擎（交互式知识点模拟）— 位时序 / 帧结构 / 线与 / 总线负载 / CANoe
   P0 合规：描边 SVG 图标、无紫粉渐变、无弹跳缓动
   ============================================================ */
const _simRAF = new Set()
function simStopAll(){ _simRAF.forEach(id => { try { cancelAnimationFrame(id) } catch (e) {} }); _simRAF.clear() }

/* 半圆仪表 SVG（指针 + 弧），updateGauge 负责驱动 */
function simGaugeSVG(){
  return '<svg class="sim-gauge" viewBox="0 0 200 120" aria-hidden="true">'
    + '<path class="g-track" d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--hairline,#e6e8ef)" stroke-width="13" stroke-linecap="round"/>'
    + '<path class="g-fill" d="" fill="none" stroke="#10b981" stroke-width="13" stroke-linecap="round"/>'
    + '<line class="g-needle" x1="100" y1="100" x2="100" y2="30" stroke="var(--text-1,#1b2330)" stroke-width="3" stroke-linecap="round"/>'
    + '<circle cx="100" cy="100" r="6" fill="var(--text-1,#1b2330)"/>'
    + '<text class="g-val" x="100" y="90" text-anchor="middle">0</text>'
    + '</svg>'
}
function updateGauge(svg, value, max, colorFn){
  if (!svg) return
  const f = Math.max(0, Math.min(1, value / max))
  const th = (180 - f * 180) * Math.PI / 180
  const x = 100 + 80 * Math.cos(th), y = 100 - 80 * Math.sin(th)
  const fill = svg.querySelector('.g-fill')
  if (fill) fill.setAttribute('d', 'M20 100 A80 80 0 0 1 ' + x.toFixed(2) + ' ' + y.toFixed(2))
  const needle = svg.querySelector('.g-needle')
  if (needle) needle.style.transform = 'rotate(' + (f * 180 - 90).toFixed(1) + 'deg)'
  const val = svg.querySelector('.g-val'); if (val) val.textContent = Math.round(value)
  if (colorFn && fill) fill.setAttribute('stroke', colorFn(value))
}
const simZone = v => v > 80 ? '#ef4444' : (v > 50 ? '#f59e0b' : '#10b981')

function mountDtcCards(root) {
  let cfg = {}
  try { cfg = JSON.parse(root.dataset.cfg || '{}') } catch (e) { cfg = {} }
  const subGeneric = cfg.subGeneric || {}
  const sysMap = cfg.systems || { P: '动力总成', C: '底盘', B: '车身', U: '网络/通信' }
  const cards = root.querySelectorAll('.dtc-card')
  if (!cards.length) return
  const detail = root.querySelector('[data-dtc-detail]')
  const subCard = root.querySelector('.dtc-card[data-pos="3"]')
  const pos2 = root.querySelector('.dtc-card[data-pos="2"]')
  let sys = 'P'
  let mode = 'generic'
  function showDetail(title, html) {
    if (detail) detail.innerHTML = '<div class="dtc-detail-card"><div class="dtc-detail-title">' + title + '</div><div class="dtc-detail-body">' + html + '</div></div>'
  }
  function renderSub() {
    if (!subCard) return
    const ty = subCard.querySelector('.dtc-type')
    const de = subCard.querySelector('.dtc-desc')
    if (mode === 'generic') {
      subCard.dataset.sub = 'generic'
      ty.className = 'dtc-type dtc-cond'
      ty.textContent = '条件：通用码固定'
      de.textContent = '通用码=SAE 标准子系统；厂定义码=OEM 自定义'
    } else {
      subCard.dataset.sub = 'mfr'
      ty.className = 'dtc-type dtc-warn'
      ty.textContent = '不固定：厂自定义'
      de.textContent = '由主机厂自定义，各品牌含义不同，无统一标准'
    }
  }
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const pos = card.dataset.pos
      if (pos === '1') {
        const order = ['P', 'C', 'B', 'U']
        sys = order[(order.indexOf(sys) + 1) % 4]
        card.querySelector('.dtc-val').textContent = sys
        card.querySelector('.dtc-desc').textContent = sysMap[sys] || sys
        showDetail('系统（第 1 位）', '字母 <b>' + sys + '</b> = ' + (sysMap[sys] || sys) + '。这一位永远固定为 P/C/B/U 四类之一。')
      } else if (pos === '2') {
        mode = (mode === 'generic') ? 'mfr' : 'generic'
        if (pos2) pos2.querySelector('.dtc-val').textContent = (mode === 'generic') ? '0' : '1'
        renderSub()
        showDetail('通用 / 厂定义（第 2 位）',
          mode === 'generic'
            ? '当前 <b>通用（0/2）</b>：第 3 位固定为 SAE 标准子系统（见下）。'
            : '当前 <b>厂定义（1/3）</b>：第 3 位由主机厂自定义，不再固定。')
      } else if (pos === '3') {
        if (mode === 'generic') {
          const rows = Object.keys(subGeneric).map(k => '<tr><td>P0' + k + 'x</td><td>' + subGeneric[k] + '</td></tr>').join('')
          showDetail('子系统（第 3 位 · 通用码）',
            '<p>通用码下第 3 位固定映射为 SAE 子系统：</p><table class="dtc-sub"><thead><tr><th>码段</th><th>子系统</th></tr></thead><tbody>' + rows + '</tbody></table>')
        } else {
          showDetail('子系统（第 3 位 · 厂定义码）',
            '<p>厂定义码下，第 3 位由主机厂自定义，不同品牌含义不同，<b>没有统一标准</b>。解码须查该车型 OEM DTC 手册。</p>')
        }
      } else {
        showDetail('序号（第 4–5 位）', '这两位固定为 00–99 的具体故障序号，与前面几位组合成完整故障码。')
      }
    })
  })
  renderSub()
}

function mountSimWidget(el){
  const cfg = JSON.parse(el.dataset.cfg || '{}')
  const kind = cfg.kind || el.dataset.sim
  const d = cfg.defaults || {}
  const mount = el.querySelector('.kb-sim-mount')
  if (!mount) return
  if (kind === 'bittiming') return buildBittiming(mount, d)
  if (kind === 'framedemo') return buildFramedemo(mount, d)
  if (kind === 'wiredand')  return buildWiredAnd(mount, d)
  if (kind === 'busload')   return buildBusload(mount, d)
  if (kind === 'canoe')     return buildCanoe(mount, d)
}

/* —— CAN 位时序 / 采样点计算器 —— */
function buildBittiming(mount, d){
  const def = Object.assign({ fclk: 8, brp: 1, tseg1: 13, tseg2: 2, sjw: 1, target: 500 }, d)
  mount.innerHTML = '<div class="kb-sim-body"><div class="sim-ctl">'
    + '<div class="sim-field"><label>目标波特率<b id="bt-tgt-v">' + def.target + ' kbps</b></label>'
      + '<select class="sim-select" id="bt-tgt"><option>125</option><option>250</option><option>500</option><option>1000</option></select></div>'
    + '<div class="sim-field"><label>预分频 BRP<b id="bt-brp-v">' + def.brp + '</b></label><input class="sim-range" id="bt-brp" type="range" min="1" max="32" step="1" value="' + def.brp + '"></div>'
    + '<div class="sim-field"><label>TSEG1（采样段1）<b id="bt-t1-v">' + def.tseg1 + '</b></label><input class="sim-range" id="bt-t1" type="range" min="1" max="16" step="1" value="' + def.tseg1 + '"></div>'
    + '<div class="sim-field"><label>TSEG2（采样段2）<b id="bt-t2-v">' + def.tseg2 + '</b></label><input class="sim-range" id="bt-t2" type="range" min="1" max="8" step="1" value="' + def.tseg2 + '"></div>'
    + '<div class="sim-field"><label>SJW（同步跳转）<b id="bt-sjw-v">' + def.sjw + '</b></label><input class="sim-range" id="bt-sjw" type="range" min="1" max="4" step="1" value="' + def.sjw + '"></div>'
    + '<div class="sim-hint">系统时钟固定 ' + def.fclk + ' MHz（常见 CAN 控制器晶振）。拖动滑块观察采样点与位时间变化，典型采样点建议 60%–80%。</div>'
    + '</div><div class="sim-out">'
    + '<div class="sim-bitbar" id="bt-bar"></div>'
    + '<div class="sim-readout" id="bt-ro"></div>'
    + '<div class="sim-verdict" id="bt-verdict"></div>'
    + '</div></div>'
  const $ = id => mount.querySelector(id)
  $('#bt-tgt').value = def.target
  const calc = () => {
    const fclk = def.fclk, brp = +$('#bt-brp').value, t1 = +$('#bt-t1').value, t2 = +$('#bt-t2').value, sjw = +$('#bt-sjw').value
    const target = +$('#bt-tgt').value
    $('#bt-brp-v').textContent = brp; $('#bt-t1-v').textContent = t1; $('#bt-t2-v').textContent = t2; $('#bt-sjw-v').textContent = sjw; $('#bt-tgt-v').textContent = target + ' kbps'
    const tq = brp / (fclk * 1e6), bitTime = (1 + t1 + t2) * tq, actual = 1 / bitTime
    const sp = (1 + t1) / (1 + t1 + t2) * 100, err = (actual - target * 1e3) / (target * 1e3) * 100
    $('#bt-bar').innerHTML = '<div class="bb-sync" style="flex:1">SYNC</div>'
      + '<div class="bb-t1" style="flex:' + t1 + '">TSEG1 ' + t1 + '</div>'
      + '<div class="bb-t2" style="flex:' + t2 + '">TSEG2 ' + t2 + '<span class="bb-mark"></span></div>'
    $('#bt-ro').innerHTML = ''
      + '<div class="ro"><span>实际波特率</span><b>' + Math.round(actual / 1e3) + '<small>kbps</small></b></div>'
      + '<div class="ro"><span>采样点</span><b>' + sp.toFixed(1) + '<small>%</small></b></div>'
      + '<div class="ro"><span>每位时间</span><b>' + (bitTime * 1e6).toFixed(2) + '<small>µs</small></b></div>'
      + '<div class="ro"><span>波特率误差</span><b>' + err.toFixed(2) + '<small>%</small></b></div>'
    let verdict = '采样点 ' + (sp >= 60 && sp <= 80 ? '落在推荐区间 60%–80%。' : '偏离推荐区间 60%–80%，通信余量不足。')
    if (Math.abs(err) > 1) verdict += ' 实际波特率与目标偏差 ' + err.toFixed(1) + '%，需调整 BRP / TSEG 以匹配。'
    $('#bt-verdict').innerHTML = verdict
  }
  ;['#bt-brp', '#bt-t1', '#bt-t2', '#bt-sjw'].forEach(id => $(id).addEventListener('input', calc))
  $('#bt-tgt').addEventListener('change', calc)
  calc()
}

/* —— CAN 数据帧结构可视化构建器 —— */
function buildFramedemo(mount, d){
  const def = Object.assign({ format: 'std', id: 0x100, dlc: 8, br: 500, data: [0x12,0x34,0x56,0x78,0x9A,0xBC,0xDE,0xF0] }, d)
  let fmt = def.format, idv = def.id, dlc = def.dlc, data = def.data.slice()
  const fields = () => fmt === 'std'
    ? [['SOF',1],['仲裁段',13],['控制段',5],['数据段',8*dlc],['CRC段',15],['CRC界定',1],['ACK',1],['ACK界定',1],['EOF',7],['IFS',3]]
    : [['SOF',1],['仲裁段',31],['控制段',6],['数据段',8*dlc],['CRC段',15],['CRC界定',1],['ACK',1],['ACK界定',1],['EOF',7],['IFS',3]]
  mount.innerHTML = '<div class="kb-sim-body"><div class="sim-ctl">'
    + '<div class="sim-field"><label>帧格式</label><div class="sim-toggle" id="fr-fmt">'
      + '<button data-f="std" class="' + (fmt==='std'?'on':'') + '">标准帧 11位</button>'
      + '<button data-f="ext" class="' + (fmt==='ext'?'on':'') + '">扩展帧 29位</button></div></div>'
    + '<div class="sim-field"><label>标识符 ID<b id="fr-id-v">0x' + idv.toString(16).toUpperCase() + '</b></label><input class="sim-num" id="fr-id" type="number" min="0" max="' + (fmt==='std'?2047:0x1FFFFFFF) + '" value="' + idv + '"></div>'
    + '<div class="sim-field"><label>DLC（数据长度）<b id="fr-dlc-v">' + dlc + '</b></label><input class="sim-range" id="fr-dlc" type="range" min="0" max="8" step="1" value="' + dlc + '"></div>'
    + '<div class="sim-field"><label>数据字节（十六进制，空格分隔）</label><input class="sim-num" id="fr-data" value="' + data.map(x => ('0'+x.toString(16).toUpperCase()).slice(-2)).join(' ') + '"></div>'
    + '<div class="sim-hint">数据帧由固定字段拼接而成，拖动 DLC 可看到「数据段」宽度实时变化，总位数与单帧耗时随之改变。</div>'
    + '</div><div class="sim-out">'
    + '<div class="sim-frame" id="fr-bar"></div>'
    + '<div class="sim-frame-legend" id="fr-legend"></div>'
    + '<div class="sim-readout" id="fr-ro"></div>'
    + '</div></div>'
  const $ = id => mount.querySelector(id)
  const render = () => {
    const fs = fields(); const total = fs.reduce((a, b) => a + b[1], 0)
    let html = '', leg = ''
    fs.forEach((f, i) => {
      const cls = f[1] < 4 ? 'tiny' : f[1] < 9 ? 'narrow' : ''
      html += '<div class="fr-seg fr-seg-' + i + ' ' + cls + '" style="flex:' + f[1] + '" title="' + f[0] + ' ' + f[1] + '位">'
            + (f[1] >= 4 ? '<span class="fr-seg-name">' + f[0] + '</span>' : '')
            + (f[1] >= 9 ? '<span class="fr-seg-bits">' + f[1] + '位</span>' : '')
            + '</div>'
      leg += '<span><i class="fr-c-' + i + '"></i>' + f[0] + ' ' + f[1] + '位</span>'
    })
    $('#fr-bar').innerHTML = html; $('#fr-legend').innerHTML = leg
    const frameTime = total / (def.br * 1e3)
    const dataKbps = frameTime > 0 ? (dlc * 8 * def.br / total) : 0
    $('#fr-ro').innerHTML = ''
      + '<div class="ro"><span>总位数</span><b>' + total + '<small>bit</small></b></div>'
      + '<div class="ro"><span>单帧耗时</span><b>' + (frameTime * 1e6).toFixed(1) + '<small>µs</small></b></div>'
      + '<div class="ro"><span>数据字节</span><b>' + dlc + '<small>byte</small></b></div>'
      + '<div class="ro"><span>有效数据吞吐</span><b>' + dataKbps.toFixed(1) + '<small>kbps</small></b></div>'
  }
  $('#fr-fmt').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    fmt = b.dataset.f; $('#fr-fmt').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b))
    $('#fr-id').max = fmt === 'std' ? 2047 : 0x1FFFFFFF; render() }))
  $('#fr-id').addEventListener('input', () => { idv = parseInt($('#fr-id').value) || 0; $('#fr-id-v').textContent = '0x' + idv.toString(16).toUpperCase() })
  $('#fr-dlc').addEventListener('input', () => { dlc = +$('#fr-dlc').value; $('#fr-dlc-v').textContent = dlc; render() })
  $('#fr-data').addEventListener('change', () => { data = $('#fr-data').value.trim().split(/\s+/).map(x => parseInt(x.replace(/0x/i, ''), 16) || 0).slice(0, 8); render() })
  render()
}

/* —— CAN/LIN 显性/隐性 线与 + 仲裁演示 —— */
function buildWiredAnd(mount, d){
  const def = Object.assign({ a: 'dom', b: 'rec', idA: 0x100, idB: 0x200 }, d)
  let a = def.a, b = def.b
  const laneHTML = (level) => {
    const cls = level === 'dom' ? 'dom' : 'rec'
    const text = level === 'dom' ? '显性 Dominant' : '隐性 Recessive'
    return '<div class="ln-track ' + cls + '"><span class="ln-text">' + text + '</span></div>'
  }
  mount.innerHTML = '<div class="kb-sim-body"><div class="sim-ctl">'
    + '<div class="sim-field"><label>节点 A 驱动电平</label><div class="sim-toggle" id="wa-a">'
      + '<button data-s="dom" class="' + (a==='dom'?'on':'') + '">显性 0</button><button data-s="rec" class="' + (a==='rec'?'on':'') + '">隐性 1</button></div></div>'
    + '<div class="sim-field"><label>节点 B 驱动电平</label><div class="sim-toggle" id="wa-b">'
      + '<button data-s="dom" class="' + (b==='dom'?'on':'') + '">显性 0</button><button data-s="rec" class="' + (b==='rec'?'on':'') + '">隐性 1</button></div></div>'
    + '<div class="sim-hint">CAN/LIN 总线是「线与」结构：任一节点驱动显性（逻辑 0），总线即为显性；只有全部节点都发隐性（逻辑 1）时，总线才是隐性。显性永远胜过隐性。</div>'
    + '</div><div class="sim-out"><div class="sim-lanes">'
    + '<div class="sim-lane"><span class="ln-label">节点 A</span><div class="ln-track" id="wa-la"></div></div>'
    + '<div class="sim-lane"><span class="ln-label">节点 B</span><div class="ln-track" id="wa-lb"></div></div>'
    + '<div class="sim-lane bus"><span class="ln-label">总线</span><div class="ln-track" id="wa-lbus"></div></div>'
    + '</div><div class="sim-verdict" id="wa-verdict"></div>'
    + '<div class="sim-arb"><div class="sim-field"><label>仲裁胜负演示（两帧同时发送，逐位比较 ID）</label>'
      + '<div class="sim-arb-row">'
      + '<input class="sim-num" id="wa-ida" value="0x' + def.idA.toString(16).toUpperCase() + '">'
      + '<input class="sim-num" id="wa-idb" value="0x' + def.idB.toString(16).toUpperCase() + '">'
      + '<button class="sim-btn ghost" id="wa-regen">' + ICON('refresh') + ' 随机生成</button></div></div></div>'
    + '<div class="sim-verdict" id="wa-arb"></div>'
    + '</div></div>'
  const $ = id => mount.querySelector(id)
  const draw = () => {
    const bus = (a === 'dom' || b === 'dom') ? 'dom' : 'rec'
    $('#wa-la').innerHTML = laneHTML(a); $('#wa-lb').innerHTML = laneHTML(b); $('#wa-lbus').innerHTML = laneHTML(bus)
    $('#wa-verdict').innerHTML = '总线状态：<b>' + (bus === 'dom' ? '显性（Dominant）' : '隐性（Recessive）') + '</b> —— 节点 A=' + (a==='dom'?'显性':'隐性') + '，节点 B=' + (b==='dom'?'显性':'隐性') + '，线与结果如上。'
  }
  const arb = () => {
    let ia = parseInt(($('#wa-ida').value || '').replace(/0x/i, ''), 16); if (isNaN(ia)) ia = def.idA
    let ib = parseInt(($('#wa-idb').value || '').replace(/0x/i, ''), 16); if (isNaN(ib)) ib = def.idB
    const bits = Math.max(ia.toString(2).length, ib.toString(2).length)
    let diff = -1, wina = null
    for (let i = 0; i < bits; i++) { const ba = (ia >> (bits - 1 - i)) & 1, bb = (ib >> (bits - 1 - i)) & 1; if (ba !== bb) { diff = i; wina = (ba === 0 ? 'A' : 'B'); break } }
    if (diff < 0) { $('#wa-arb').innerHTML = '两帧 ID 完全相同，无法仲裁（实际会冲突）—— 请换一个 ID。'; return }
    $('#wa-arb').innerHTML = '从第 <b>' + (diff + 1) + '</b> 位起出现分歧：节点 ' + wina + ' 在该位发 <b>显性(0)</b>，赢得总线仲裁，另一节点自动退出发送（非破坏性位仲裁）。'
  }
  $('#wa-a').querySelectorAll('button').forEach(x => x.addEventListener('click', () => { a = x.dataset.s; $('#wa-a').querySelectorAll('button').forEach(y => y.classList.toggle('on', y === x)); draw() }))
  $('#wa-b').querySelectorAll('button').forEach(x => x.addEventListener('click', () => { b = x.dataset.s; $('#wa-b').querySelectorAll('button').forEach(y => y.classList.toggle('on', y === x)); draw() }))
  $('#wa-regen').addEventListener('click', () => { const r = () => 0x80 + Math.floor(Math.random() * 0x600); $('#wa-ida').value = '0x' + r().toString(16).toUpperCase(); $('#wa-idb').value = '0x' + r().toString(16).toUpperCase(); arb() })
  $('#wa-ida').addEventListener('input', arb); $('#wa-idb').addEventListener('input', arb)
  draw(); arb()
}

/* —— CAN 总线负载计算器 —— */
function buildBusload(mount, d){
  const def = Object.assign({ n: 8, period: 100, dlc: 8, br: 500 }, d)
  mount.innerHTML = '<div class="kb-sim-body"><div class="sim-ctl">'
    + '<div class="sim-field"><label>报文数量 N<b id="bl-n-v">' + def.n + '</b></label><input class="sim-range" id="bl-n" type="range" min="1" max="30" step="1" value="' + def.n + '"></div>'
    + '<div class="sim-field"><label>发送周期 T<b id="bl-t-v">' + def.period + ' ms</b></label><input class="sim-range" id="bl-t" type="range" min="1" max="1000" step="1" value="' + def.period + '"></div>'
    + '<div class="sim-field"><label>每帧 DLC<b id="bl-d-v">' + def.dlc + '</b></label><input class="sim-range" id="bl-d" type="range" min="0" max="8" step="1" value="' + def.dlc + '"></div>'
    + '<div class="sim-field"><label>总线波特率</label><select class="sim-select" id="bl-br"><option>125</option><option>250</option><option>500</option><option>1000</option><option>2000</option><option>5000</option></select></div>'
    + '<div class="sim-hint">经典 CAN 每帧固定开销约 47 位（不含数据），负载率 = 报文数 × 单帧位数 ÷（波特率 × 周期）。超过 80% 即存在拥塞风险。</div>'
    + '</div><div class="sim-out">' + simGaugeSVG() + '<div class="sim-readout" id="bl-ro"></div><div class="sim-verdict" id="bl-verdict"></div></div></div>'
  const $ = id => mount.querySelector(id)
  const svg = mount.querySelector('.sim-gauge')
  $('#bl-br').value = def.br
  const calc = () => {
    const n = +$('#bl-n').value, t = +$('#bl-t').value, dlc = +$('#bl-d').value, br = +$('#bl-br').value
    $('#bl-n-v').textContent = n; $('#bl-t-v').textContent = t + ' ms'; $('#bl-d-v').textContent = dlc
    const bits = 47 + 8 * dlc, bitTime = 1 / (br * 1e3), frameTime = bits * bitTime
    const load = n * bits / (br * 1e3 * (t / 1000)) * 100
    updateGauge(svg, Math.min(load, 120), 120, simZone)
    $('#bl-ro').innerHTML = ''
      + '<div class="ro"><span>单帧位数</span><b>' + bits + '<small>bit</small></b></div>'
      + '<div class="ro"><span>单帧时间</span><b>' + (frameTime * 1e6).toFixed(1) + '<small>µs</small></b></div>'
      + '<div class="ro"><span>总线吞吐</span><b>' + (n * bits / (t / 1000) / 1000).toFixed(1) + '<small>kbps</small></b></div>'
      + '<div class="ro"><span>负载率</span><b>' + load.toFixed(1) + '<small>%</small></b></div>'
    $('#bl-verdict').innerHTML = '负载率 ' + load.toFixed(1) + '%：' + (load < 50 ? '总线空闲充足，实时性有保障。' : load < 80 ? '带宽偏紧但可接受，注意突发报文。' : '已超 80%，存在仲裁延迟与丢帧风险，建议拆分总线或升速。')
  }
  ;['#bl-n', '#bl-t', '#bl-d'].forEach(id => $(id).addEventListener('input', calc))
  $('#bl-br').addEventListener('change', calc)
  calc()
}

/* —— CANoe 风格交互面板（节点 + Trace + 发送 + 总线负载 + 实时信号） —— */
function buildCanoe(mount, d){
  const msgs = [
    { id: 0x100, name: '车速帧', dlc: 2 },
    { id: 0x200, name: '转速帧', dlc: 2 },
    { id: 0x300, name: '油门帧', dlc: 1 },
    { id: 0x400, name: '车门状态', dlc: 1 },
    { id: 0x500, name: '电池电压', dlc: 2 }
  ]
  const nodes = ['ESP', 'ECM', 'BCM', 'TCU', 'Gateway']
  const signals = { '车速': { min: 0, max: 240, val: 60 }, '转速': { min: 0, max: 8000, val: 1500 }, '油门': { min: 0, max: 100, val: 20 } }
  let curSig = '车速', paused = false, simT = 0, lastEmit = {}, traceRows = [], spark = []
  mount.innerHTML = '<div class="sim-canoe">'
    + '<div class="sim-nodes">' + nodes.map((n, i) => '<div class="sim-node' + (i === 4 ? ' off' : '') + '"><span class="dot"></span>' + n + '</div>').join('') + '</div>'
    + '<div><div class="sim-trace" id="cn-trace"></div>'
      + '<div class="sim-canoe-ctl">'
        + '<select id="cn-sel">' + msgs.map(m => '<option value="' + m.id + '">' + m.name + ' (0x' + m.id.toString(16).toUpperCase() + ' · DLC' + m.dlc + ')</option>').join('') + '</select>'
        + '<button class="sim-btn" id="cn-send">' + ICON('send') + ' 发送</button>'
        + '<button class="sim-btn ghost" id="cn-play">' + ICON('pause') + ' 暂停</button>'
      + '</div>'
      + '<div class="sim-canoe-row"><div class="sim-signal">'
        + '<div class="sig-top"><span class="sig-name">实时信号</span>'
          + '<select id="cn-sig" style="padding:3px 6px;font-size:11px;border-radius:6px;border:1px solid var(--hairline,#e6e8ef);background:var(--surface-2,#f4f6fb)">' + Object.keys(signals).map(s => '<option' + (s === curSig ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></div>'
        + '<div class="sig-val" id="cn-sigval">0</div>'
        + '<svg class="sim-spark" id="cn-spark" viewBox="0 0 200 38" preserveAspectRatio="none"></svg>'
      + '</div><div>' + simGaugeSVG() + '<div class="sim-hint" id="cn-loadtxt">总线负载 — （500 kbps 示例）</div></div></div>'
    + '</div></div>'
  const $ = id => mount.querySelector(id)
  const svg = mount.querySelector('.sim-gauge')
  const traceEl = $('#cn-trace')
  const hex = (n, len) => { let s = n.toString(16).toUpperCase(); while (s.length < len) s = '0' + s; return s }
  const randData = dlc => { const a = []; for (let i = 0; i < dlc; i++) a.push(Math.floor(Math.random() * 256)); return a }
  const pushTrace = (m, inj) => {
    const dt = randData(m.dlc)
    const row = '<div class="tr' + (inj ? ' inj' : '') + '"><span>' + (simT / 1000).toFixed(2) + 's</span><span class="t-id">0x' + m.id.toString(16).toUpperCase() + '</span><span>' + m.dlc + '</span><span class="t-d">' + dt.map(x => hex(x, 2)).join(' ') + '</span></div>'
    traceRows.unshift(row); if (traceRows.length > 14) traceRows.pop(); traceEl.innerHTML = traceRows.join('')
  }
  let loadVal = 38, last = (typeof performance !== 'undefined' ? performance.now() : Date.now())
  const step = dt => {
    simT += dt
    msgs.forEach(m => { const period = (m.id === 0x400) ? 500 : (m.id === 0x500 ? 800 : 120); if (!lastEmit[m.id]) lastEmit[m.id] = 0; if (simT - lastEmit[m.id] >= period) { lastEmit[m.id] = simT; pushTrace(m, false) } })
    const s = signals[curSig]; s.val += (Math.random() - 0.5) * (s.max - s.min) / 12; s.val = Math.max(s.min, Math.min(s.max, s.val)); if (Math.random() < 0.04) s.val = s.min + Math.random() * (s.max - s.min)
    $('#cn-sigval').innerHTML = Math.round(s.val) + '<small>' + (curSig === '车速' ? 'km/h' : curSig === '转速' ? 'rpm' : '%') + '</small>'
    spark.push(s.val); if (spark.length > 60) spark.shift()
    const mn = signals[curSig].min, mx = signals[curSig].max
    $('#cn-spark').innerHTML = '<polyline fill="none" stroke="var(--mod-color,#2563eb)" stroke-width="2" points="' + spark.map((v, i) => (i / 59 * 200).toFixed(1) + ',' + (34 - ((v - mn) / (mx - mn)) * 30).toFixed(1)).join(' ') + '"/>'
    loadVal += (Math.random() - 0.5) * 5; if (Math.random() < 0.03) loadVal = 28 + Math.random() * 44; loadVal = Math.max(10, Math.min(85, loadVal))
    updateGauge(svg, loadVal, 100, simZone)
    $('#cn-loadtxt').textContent = '总线负载 ' + loadVal.toFixed(0) + '% （实时监测 · 500 kbps）'
  }
  let raf = 0
  const loop = now => {
    if (!mount.isConnected) { _simRAF.delete(raf); return }
    const dt = Math.min(100, now - last); last = now
    if (!paused) step(dt)
    raf = requestAnimationFrame(loop); _simRAF.add(raf)
  }
  raf = requestAnimationFrame(loop); _simRAF.add(raf)
  $('#cn-send').addEventListener('click', () => { const id = +$('#cn-sel').value; const m = msgs.find(x => x.id === id); if (m) pushTrace(m, true) })
  $('#cn-play').addEventListener('click', () => { paused = !paused; const b = $('#cn-play'); b.innerHTML = (paused ? ICON('play') : ICON('pause')) + ' ' + (paused ? '继续' : '暂停') })
  $('#cn-sig').addEventListener('change', e => { curSig = e.target.value; spark = [] })
}