/* Bụi vàng lấp lánh — dùng chung (trang Trầm đốt, trang chủ). Gắn data-bui (nền sáng) hoặc data-bui="toi" (nền tối) vào phần cần; hoặc gọi window.buiVang(el, {toi}). CSS: css/bui-vang.css */
/* ================= BỤI VÀNG LẤP LÁNH Ở CÁC PHẦN NỀN SÁNG (28/11: user chọn kiểu này sau khi chê khói mềm và vân gỗ) =================
   Mỗi phần nền sáng một canvas dưới chữ: hạt vàng nhỏ trôi lên chậm, đung đưa, lấp lánh; hạt lớn thỉnh thoảng loé tia chữ thập;
   vài đốm mờ to ở lớp sau cho có chiều sâu. Rê chuột: hạt dạt nhẹ ra xa con trỏ. Phần nền tối đã có tàn lửa (tram-huong.js) nên bỏ qua.
   Chỉ chạy khi phần đó trên màn hình + tab hiện, ~30 khung/giây; giảm chuyển động / ?chup=1: một khung đứng yên. */
(function () {
  var GIAM = /[?&]chup=1/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHUOT = matchMedia('(hover:hover)').matches;
  window.buiVang = bui;
  function chay() { [].slice.call(document.querySelectorAll('[data-bui]')).forEach(function (s) { bui(s, {toi: s.dataset.bui === 'toi'}); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chay); else chay();
  function bui(s, tuy) {
    if (!s || s.querySelector(':scope > .tdb-bui')) return;
    var TOI = !!(tuy && tuy.toi);
    var cv = document.createElement('canvas'), ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return;
    cv.className = 'tdb-bui'; cv.setAttribute('aria-hidden', 'true');
    s.classList.add('tdb-co'); s.insertBefore(cv, s.firstChild);
    var W = 0, H = 0, hs = [], t = 0, thay = false, chay = false, truoc = 0, mx = -1e4, my = -1e4, hen = 0;
    function R() { return Math.random(); }
    function moi(h, dau) {
      var sau = R() < .14;   // lớp sau: đốm mờ to
      h.x = R() * W; h.y = dau ? R() * H : H + 10; h.sau = sau;
      h.r = sau ? 6 + R() * 10 : .7 + Math.pow(R(), 2.2) * 2.2; h.v = sau ? 3 + R() * 4 : 6 + R() * 12;
      h.p = R() * 6.28; h.w = .6 + R() * 1.4; h.dx = 0; h.dy = 0; h.loe = 0; return h;
    }
    function co() {
      var r = s.getBoundingClientRect(); W = Math.round(r.width); H = Math.round(r.height); if (!W || !H) return;
      var dpr = Math.min(1.5, devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(80, Math.max(18, W * H / (W < 760 ? 16000 : 14000))));
      hs = []; for (var i = 0; i < n; i++) hs.push(moi({}, true));
    }
    function ve() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < hs.length; i++) {
        var h = hs[i], x = h.x + Math.sin(t * .5 * h.w + h.p) * 8 + h.dx, y = h.y + h.dy;
        var nh = .5 + .5 * Math.sin(t * 1.6 * h.w + h.p * 3);   // lấp lánh
        if (h.sau) {
          var g = ctx.createRadialGradient(x, y, 0, x, y, h.r);
          g.addColorStop(0, 'rgba(214,176,98,' + ((TOI ? .1 : .07) + .05 * nh).toFixed(3) + ')'); g.addColorStop(1, 'rgba(214,176,98,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, h.r, 0, 6.283); ctx.fill(); continue;
        }
        ctx.fillStyle = TOI ? 'rgba(236,206,146,' + (.3 + .55 * nh).toFixed(3) + ')' : 'rgba(176,136,58,' + (.28 + .5 * nh).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, h.r, 0, 6.283); ctx.fill();
        if (h.r > 1.6 && h.loe > 0) {   // tia chữ thập loé lên rồi tắt
          var L = h.r * 5 * h.loe, a = (.55 * h.loe).toFixed(3);
          ctx.strokeStyle = (TOI ? 'rgba(245,220,170,' : 'rgba(200,160,80,') + a + ')'; ctx.lineWidth = .8; ctx.beginPath();
          ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
        }
      }
    }
    function lap(now) {
      if (!thay || document.hidden) { chay = false; return; }
      if (now - truoc < 31) { requestAnimationFrame(lap); return; }
      var dt = Math.min(.06, (now - (truoc || now)) / 1000 || .033); truoc = now; t += dt;
      for (var i = 0; i < hs.length; i++) {
        var h = hs[i]; h.y -= h.v * dt;
        if (h.y < -14) { moi(h, false); continue; }
        if (h.r > 1.6) { if (h.loe > 0) h.loe = Math.max(0, h.loe - dt * 1.4); else if (R() < dt * .12) h.loe = 1; }
        var ddx = h.x + h.dx - mx, ddy = h.y + h.dy - my, d2 = ddx * ddx + ddy * ddy, tx = 0, ty = 0;
        if (d2 < 14400 && d2 > 1) { var d = Math.sqrt(d2), k = (1 - d / 120) * 34; tx = ddx / d * k; ty = ddy / d * k; }
        h.dx += (tx - h.dx) * Math.min(1, dt * 3); h.dy += (ty - h.dy) * Math.min(1, dt * 3);
      }
      ve(); requestAnimationFrame(lap);
    }
    function batLai() { if (GIAM || chay || !thay || document.hidden || !W) return; chay = true; truoc = 0; requestAnimationFrame(lap); }
    co(); t = 2; ve();
    if ('ResizeObserver' in window) new ResizeObserver(function () { clearTimeout(hen); hen = setTimeout(function () { co(); ve(); }, 180); }).observe(s);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; batLai(); }).observe(s);
    document.addEventListener('visibilitychange', batLai);
    if (CHUOT && !GIAM) {
      s.addEventListener('mousemove', function (ev) { var r = cv.getBoundingClientRect(); mx = ev.clientX - r.left; my = ev.clientY - r.top; });
      s.addEventListener('mouseleave', function () { mx = my = -1e4; });
    }
  }
})();

