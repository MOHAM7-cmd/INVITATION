'use strict';
/* ===== بيانات الدعوة: عدّل هنا فقط ===== */
const CONFIG = {
  outerNames: 'مراد وكريمته',
  outerDate: '26.11.2026',
  groom: 'مراد',
  welcome: 'لأن كل مناسبة مميزة تستحق دعوة مميزة... نتشرف بدعوتكم لمشاركتنا فرحتنا.',
  dateText: 'الخميس الموافق 26 / 11 / 2026م',
  timeText: 'من الساعة 7:30 مساءً حتى الساعة 9:30 مساءً',
  venue: 'صالة ليالينا للأفراح',
  note: 'يمنع التصوير داخل قاعة النساء حفاظاً على الخصوصية ويمنع اصطحاب الاطفال.',
  eventISO: '2026-11-26T19:30:00+03:00', // توقيت عمّان (UTC+3) مثبت صراحة
  mapsUrl: 'https://maps.app.goo.gl/1eXWYZMNEpDyi7Fj8?g_st=ac',
  music: 'assets/audio/music.wav',
  shareTitle: 'دعوة زفاف مراد',
  shareText: 'نتشرف بدعوتكم لحضور حفل زفاف مراد - الخميس 26/11/2026',
  gallery: [
    { src: 'assets/images/hall-1.jpg', alt: 'منصة الكوشة في صالة ليالينا' },
    { src: 'assets/images/hall-2.jpg', alt: 'زاوية الكوشة والطاولات' },
    { src: 'assets/images/placeholder-1.svg', alt: 'صورة تجريبية 1' },
    { src: 'assets/images/placeholder-2.svg', alt: 'صورة تجريبية 2' },
    { src: 'assets/images/placeholder-3.svg', alt: 'صورة تجريبية 3' },
    { src: 'assets/images/placeholder-4.svg', alt: 'صورة تجريبية 4' }
  ]
};

const $ = (s, r = document) => r.querySelector(s);
document.querySelectorAll('[data-bind]').forEach(el => { const v = CONFIG[el.dataset.bind]; if (v) el.textContent = v; });
$('#mapBtn').href = CONFIG.mapsUrl;

/* الظرف + الموسيقى */
const audio = new Audio(); audio.loop = true; audio.preload = 'none'; audio.src = CONFIG.music;
const musicBtn = $('#musicBtn');
function setMusic(on) { musicBtn.classList.toggle('on', on); musicBtn.setAttribute('aria-label', on ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'); }
function playMusic() { const p = audio.play(); if (p) p.then(() => setMusic(true)).catch(() => setMusic(false)); }
musicBtn.addEventListener('click', () => { if (audio.paused) playMusic(); else { audio.pause(); setMusic(false); } });
audio.addEventListener('error', () => { musicBtn.hidden = true; });

const env = $('#envelope');
env.addEventListener('click', () => {
  if (env.classList.contains('open')) return;
  env.classList.add('open'); playMusic();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    $('#intro').classList.add('gone');
    $('#main').hidden = false; musicBtn.hidden = !!audio.error;
    document.body.classList.remove('locked'); scrollTo(0, 0);
    requestAnimationFrame(observe);
  }, reduce ? 200 : 2100);
});

/* ظهور الأقسام */
function observe() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* العد التنازلي */
const target = Date.parse(CONFIG.eventISO), ids = ['d', 'h', 'm', 's'], last = {};
function tick() {
  let diff = target - Date.now();
  if (diff <= 0) {
    $('#countdown').hidden = true; const d = $('#cd-done'); d.hidden = false;
    d.textContent = Date.now() < target + 2 * 3600e3 ? 'حان موعد فرحتنا — بانتظاركم' : 'شكراً لكل من شاركنا فرحتنا';
    return clearInterval(timer);
  }
  const v = [Math.floor(diff / 864e5), Math.floor(diff / 36e5) % 24, Math.floor(diff / 6e4) % 60, Math.floor(diff / 1e3) % 60];
  v.forEach((n, i) => {
    const t = String(n).padStart(2, '0'), el = $('#cd-' + ids[i]);
    if (last[i] !== t) { el.textContent = t; if (last[i] !== undefined) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } last[i] = t; }
  });
}
const timer = setInterval(tick, 1000); tick();

/* المعرض + Lightbox */
const gal = $('#gallery'), lb = $('#lightbox'), lbImg = $('img', lb); let cur = 0;
CONFIG.gallery.forEach((g, i) => {
  const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', g.alt);
  const im = new Image(); im.src = g.src; im.alt = g.alt; im.loading = 'lazy'; im.decoding = 'async';
  b.appendChild(im); b.addEventListener('click', () => show(i, true)); gal.appendChild(b);
});
function show(i, open) {
  const n = CONFIG.gallery.length; cur = (i + n) % n;
  lbImg.src = CONFIG.gallery[cur].src; lbImg.alt = CONFIG.gallery[cur].alt;
  if (open) { lb.hidden = false; document.body.style.overflow = 'hidden'; }
}
function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
$('.lb-x').onclick = closeLb; $('.lb-n').onclick = () => show(cur + 1); $('.lb-p').onclick = () => show(cur - 1);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') show(cur + 1); if (e.key === 'ArrowRight') show(cur - 1); });
let sx = 0; lb.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)); });

/* المشاركة */
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }
$('#shareBtn').addEventListener('click', async () => {
  const data = { title: CONFIG.shareTitle, text: CONFIG.shareText, url: location.href };
  if (navigator.share) { try { await navigator.share(data); } catch (e) { /* ألغى المستخدم */ } return; }
  try { await navigator.clipboard.writeText(location.href); toast('تم نسخ رابط الدعوة'); }
  catch (e) { const t = document.createElement('textarea'); t.value = location.href; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); toast('تم نسخ رابط الدعوة'); } catch (_) { toast(location.href); } t.remove(); }
});
