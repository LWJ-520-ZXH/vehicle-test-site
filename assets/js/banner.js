/* ============================================================
   车载测试学堂 · Banner 动画引擎 v3
   实车图片 + 环境光点粒子 + CAN 差分波形
   零外部依赖
   ============================================================ */

/* --- 环境光点粒子 (Canvas 背景层) --- */
const ambientParticles = (() => {
  let cvs, ctx, W, H, dpr, particles = [], stop = false

  function init() {
    cvs = document.getElementById('hero-particles')
    if (!cvs) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    resize()
    // 生成 110~140 颗离子光点（数量/尺寸/亮度整体上调，增强可见度）
    const COUNT = Math.round(Math.min(140, Math.max(110, (W * H) / 8000)))
    for (let i = 0; i < COUNT; i++) {
      const big = Math.random() < 0.18            // 约 1/5 为大颗粒「主离子」
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .6,            // 漂移速度提升（原 .3）
        vy: (Math.random() - .5) * .6,
        r: big ? 3 + Math.random() * 3 : 1.4 + Math.random() * 2.6,
        o: .42 + Math.random() * .43,            // 基础亮度 .42~.85（原 .15~.5）
        ph: Math.random() * Math.PI * 2,         // 闪烁相位
        tw: .6 + Math.random() * 1.3,            // 闪烁频率
      })
    }
    loop()
  }

  function resize() {
    if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    W = rect.width; H = rect.height
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    cvs.width = W * dpr; cvs.height = H * dpr
    ctx = cvs.getContext('2d')
    ctx.scale(dpr, dpr)
  }

  function loop() {
    if (stop) return
    requestAnimationFrame(loop)
    ctx.clearRect(0, 0, W, H)
    const theme = document.documentElement.getAttribute('data-theme') || 'light'
    const isDark = theme === 'dark'
    // 暗黑模式：青蓝霓虹离子；明亮模式：品牌蓝
    const color = isDark ? '120,210,255' : '37,99,235'
    const t = performance.now() / 1000
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy
      if (p.x < 0 || p.x > W) p.vx *= -1
      if (p.y < 0 || p.y > H) p.vy *= -1
      // 轻微闪烁，模拟离子能量脉动
      const a = p.o * (0.72 + 0.28 * Math.sin(t * p.tw + p.ph))
      ctx.save()
      ctx.shadowBlur = p.r * 4.5                    // 霓虹辉光
      ctx.shadowColor = `rgba(${color},${a})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${color},${a})`
      ctx.fill()
      ctx.restore()
    }
  }

  return { init, resize, stop: () => { stop = true } }
})()

/* --- CAN 差分波形 (Canvas 底部) --- */
const canWave = (() => {
  let cvs, ctx, W, H, dpr, frame = 0, stop = false
  const bus = { h: [], l: [] }

  function init() {
    cvs = document.getElementById('hero-wave')
    if (!cvs) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = cvs.getBoundingClientRect()
    W = rect.width; H = rect.height
    cvs.width = W * dpr; cvs.height = H * dpr
    ctx = cvs.getContext('2d')
    ctx.scale(dpr, dpr)
    const n = Math.floor(W / 4) + 40
    bus.h = []; bus.l = []
    for (let i = 0; i < n; i++) {
      const s = Math.random() < 0.35 ? 'dominant' : 'recessive'
      if (s === 'dominant') { bus.h.push(3.5); bus.l.push(1.5) }
      else { bus.h.push(2.5); bus.l.push(2.5) }
    }
    loop()
  }

  function loop() {
    if (stop) return
    frame++; requestAnimationFrame(loop)
    ctx.clearRect(0, 0, W, H)
    const shift = -(frame * 0.6) % (W + 300)
    const baseY = H * 0.48
    const ampY = H * 0.32
    const theme = document.documentElement.getAttribute('data-theme') || 'light'
    const hCol = theme === 'dark'
      ? { h: 'rgba(56,189,248,.15)', l: 'rgba(6,182,212,.10)', grid: 'rgba(148,180,255,.06)' }
      : { h: 'rgba(37,99,235,.12)', l: 'rgba(6,182,212,.07)', grid: 'rgba(37,99,235,.05)' }

    ctx.strokeStyle = hCol.grid; ctx.lineWidth = 1; ctx.setLineDash([4, 8])
    ctx.beginPath(); ctx.moveTo(0, baseY); ctx.lineTo(W, baseY); ctx.stroke(); ctx.setLineDash([])

    for (const sig of [{ data: bus.h, col: hCol.h, offY: -ampY * .5 }, { data: bus.l, col: hCol.l, offY: ampY * .5 }]) {
      ctx.strokeStyle = sig.col; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
      ctx.beginPath()
      let started = false
      for (let i = 0; i < bus.h.length; i++) {
        const x = shift + i * 5
        if (x > W + 60) break
        if (x < -60) continue
        const y = baseY + sig.offY - (sig.data[i] - 2.5) * (ampY * .38)
        if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.fillStyle = hCol.h; ctx.font = '600 11px monospace'
    ctx.fillText('CAN_H', 14, baseY - ampY * .5 - 10)
    ctx.fillText('CAN_L', 14, baseY + ampY * .5 + 18)
  }

  function resize() {
    if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    W = rect.width; H = rect.height
    cvs.width = W * dpr; cvs.height = H * dpr
    ctx.scale(dpr, dpr)
  }

  return { init, resize, stop: () => { stop = true } }
})()

/* --- 初始化 --- */
document.addEventListener('DOMContentLoaded', () => {
  ambientParticles.init()
  canWave.init()
  window.addEventListener('resize', () => {
    ambientParticles.resize()
    canWave.resize()
  })
})

window.__canWave = canWave