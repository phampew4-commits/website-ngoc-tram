/* Chuyển động riêng trang Tự thiết kế chuỗi (thiet-ke.html) — ý từ lucianlabs. CSS: css/tk-dong.css
   Chỉ chạy theo thao tác của khách, không đụng logic phối chuỗi trong thiet-ke.js (chỉ đọc biến chon, V3D, xyHat…).
   - #442 charm bay vòng cung từ thẻ lên đúng chỗ trên chuỗi, chuỗi loé vòng sáng chỗ đáp
   - #042 số bước 01–04 tô vàng + dấu tích khi xong bước
   - #018 tổng ước tính lăn số tới giá mới
   - #017 bong bóng số cm trên thanh cỡ tay, nghiêng theo đà kéo
   - #251 thẻ dây / thẻ charm nổi lên lần lượt khi danh sách hiện ra hoặc đổi lọc */
(function () {
  if (!document.getElementById('tk')) return;
  var GIAM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $1(s, g) { return (g || document).querySelector(s); }

  /* ---------- #442 charm bay lên chuỗi ---------- */
  var truoc = 0, theBam = null;
  document.addEventListener('click', function (ev) {   // pha bắt: ghi số charm TRƯỚC khi thiet-ke.js xử lý
    var b = ev.target.closest && ev.target.closest('#dsCharm .the-charm');
    theBam = b; truoc = chon.gan.length;
  }, true);
  $1('#dsCharm').addEventListener('click', function () {   // đăng ký sau thiet-ke.js → chạy sau khi đã gắn
    var b = theBam; theBam = null;
    if (!b || chon.gan.length <= truoc) return;
    var g = chon.gan[chon.gan.length - 1], im = $1('.h img', b);
    if (!g || !im) return;
    requestAnimationFrame(function () { requestAnimationFrame(function () { bay(im, g); }); });   // đợi vòng vẽ xong mới lấy vị trí
  });
  function dich(g) {   // toạ độ màn hình chỗ charm vừa gắn
    var san = $1('.san-trong'); if (!san) return null;
    var r = san.getBoundingClientRect(), v = null;
    try {
      if (window.V3D && V3D.viTri) v = V3D.viTri(g);
      else if (typeof xyHat === 'function') { var p = xyHat(g.j), k = $1('#vong').getBoundingClientRect().width / 400; v = [p[0] * k, p[1] * k]; }
    } catch (er) {}
    if (!v || !isFinite(v[0]) || !isFinite(v[1])) v = [r.width / 2, r.height * .78];
    return {x: r.left + v[0], y: r.top + v[1], r: r};
  }
  function bay(im, g) {
    var d = dich(g); if (!d) return;
    var a = im.getBoundingClientRect();
    var trongMan = d.r.bottom > 40 && d.r.top < innerHeight - 40;   // điện thoại: sân khấu đã cuộn khuất → bay về nút xem nhỏ / thôi
    if (GIAM || !a.width || !trongMan) { if (trongMan) loe(d); return; }
    var c = document.createElement('div'); c.className = 'tkd-bay'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<img alt="" referrerpolicy="no-referrer" src="' + (im.currentSrc || im.src) + '">';
    var w = a.width; c.style.cssText = 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + w + 'px;height:' + w + 'px';
    document.body.appendChild(c);
    var dx = d.x - (a.left + w / 2), dy = d.y - (a.top + w / 2), cao = -Math.min(150, 70 + Math.abs(dx) * .15), s1 = Math.max(.28, 34 / w);
    var anim = c.animate([
      {translate: '0 0', scale: 1, rotate: '0deg', opacity: 1},
      {translate: (dx * .5) + 'px ' + (dy * .5 + cao) + 'px', scale: .78, rotate: '-14deg', opacity: 1, offset: .5},
      {translate: dx + 'px ' + dy + 'px', scale: s1, rotate: '0deg', opacity: .9}
    ], {duration: Math.min(900, 520 + Math.hypot(dx, dy) * .35), easing: 'cubic-bezier(.45,.05,.3,1)'});
    anim.onfinish = function () { c.remove(); loe(dich(g) || d); };
  }
  function loe(d) {   // vòng sáng vàng toả ra chỗ charm đáp
    if (!d || GIAM) return;
    var o = document.createElement('i'); o.className = 'tkd-loe'; o.setAttribute('aria-hidden', 'true');
    o.style.left = d.x + 'px'; o.style.top = d.y + 'px';
    document.body.appendChild(o); setTimeout(function () { o.remove(); }, 900);
  }

  /* ---------- #042 số bước: tô vàng + dấu tích khi xong ---------- */
  var DAU = '<svg class="tkd-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 12.5l3.6 3.6 7.4-8" pathLength="1"/></svg>';
  function buoc() {
    var bs = document.querySelectorAll('.tk-bang .buoc-tk'), xong = [!!chon.day, !!chon.day, chon.gan.length > 0];
    [].forEach.call(bs, function (s, i) {
      var so = $1('.so-buoc', s); if (!so) return;
      if (!$1('.tkd-tick', so)) so.insertAdjacentHTML('beforeend', DAU);
      so.classList.toggle('tkd-xong', !!xong[i]);
    });
    var tt = $1('#tomTat .so-buoc');
    if (tt && !$1('.tkd-tick', tt)) { tt.insertAdjacentHTML('beforeend', DAU); tt.classList.add('tkd-xong'); }
  }

  /* ---------- #018 tổng ước tính lăn số ---------- */
  var tongCu = null;
  function lanTong() {
    var n = 0; try { n = tong(); } catch (er) { return; }
    var o = [$1('#tomTat .tong-tt b'), $1('#thanhTk b')].filter(Boolean);
    if (tongCu === null || GIAM || n === tongCu || !n) { tongCu = n; return; }
    var tu = tongCu, bd = performance.now(), len = n > tu; tongCu = n;
    o.forEach(function (b) { b.classList.remove('tkd-len', 'tkd-xuong'); void b.offsetWidth; b.classList.add(len ? 'tkd-len' : 'tkd-xuong'); });
    (function f(t) {
      var k = Math.min(1, (t - bd) / 700); k = 1 - Math.pow(1 - k, 3);
      var v = Math.round((tu + (n - tu) * k) / 10000) * 10000, chu = k < 1 ? '≈ ' + gia(v) : uoc(n);
      o.forEach(function (b) { if (b.isConnected) b.textContent = chu; });
      if (k < 1) requestAnimationFrame(f);
    })(bd);
  }

  /* theo dõi tóm tắt được dựng lại (mỗi lần đổi dây / charm / cỡ) */
  var hen = 0;
  new MutationObserver(function () {
    if (hen) return;
    hen = requestAnimationFrame(function () { hen = 0; buoc(); lanTong(); });
  }).observe($1('#tomTat'), {childList: true});
  buoc();

  /* ---------- #017 bong bóng cỡ tay nghiêng theo đà kéo ---------- */
  var tay = $1('#coTay');
  if (tay) {
    var bo = document.createElement('div'); bo.className = 'tkd-tay'; bo.setAttribute('aria-hidden', 'true');
    bo.innerHTML = '<span class="tkd-bong"><b></b></span>';
    tay.parentNode.insertBefore(bo, tay); bo.appendChild(tay);
    var bong = $1('.tkd-bong', bo), chu = $1('b', bo), x0 = null, nghieng = 0, vt = 0, raf = 0, dangKeo = false;
    function viTri() {
      var mn = +tay.min, mx = +tay.max, k = (+tay.value - mn) / (mx - mn), w = tay.clientWidth, th = 18;
      return th / 2 + k * (w - th);
    }
    function ve() {
      raf = 0;
      var x = viTri();
      if (x0 !== null && !GIAM) vt += (x - x0) * .9;
      x0 = x;
      vt *= .78; nghieng += (Math.max(-24, Math.min(24, -vt)) - nghieng) * .35;
      bong.style.left = x + 'px'; bong.style.rotate = nghieng.toFixed(2) + 'deg';
      chu.textContent = String(+tay.value).replace('.', ',') + ' cm';
      if (Math.abs(nghieng) > .2 || Math.abs(vt) > .2) raf = requestAnimationFrame(ve);
    }
    function chay() { if (!raf) raf = requestAnimationFrame(ve); }
    tay.addEventListener('input', chay);
    tay.addEventListener('pointerdown', function () { dangKeo = true; bo.classList.add('tkd-keo'); });
    addEventListener('pointerup', function () { if (dangKeo) { dangKeo = false; bo.classList.remove('tkd-keo'); chay(); } });
    tay.addEventListener('focus', function () { bo.classList.add('tkd-keo'); });
    tay.addEventListener('blur', function () { bo.classList.remove('tkd-keo'); });
    addEventListener('resize', function () { x0 = null; chay(); });
    setTimeout(function () { x0 = null; chay(); }, 50);
  }

  /* ---------- #251 thẻ dây / thẻ charm nổi lên lần lượt ---------- */
  function noiLen(goc, chon_, motLan) {   // motLan: chỉ lần hiện đầu (danh sách dây dựng lại mỗi lần chọn — không nảy lại)
    if (!goc || GIAM || !goc.animate) return;
    var daCo = new WeakSet(), xong = false;
    var mo = new MutationObserver(function (ms) {
      if (xong) return;
      var moi = [];
      ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 && n.matches(chon_) && !daCo.has(n)) moi.push(n); }); });
      if (!moi.length) return;
      var r = goc.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) { moi.forEach(function (n) { daCo.add(n); }); if (motLan) { xong = true; mo.disconnect(); } return; }
      var i = 0;
      moi.forEach(function (n) {
        daCo.add(n);
        var b = n.getBoundingClientRect(); if (b.top > innerHeight + 40 || b.bottom < -40) return;   // ngoài màn hình thì để yên
        n.animate([{opacity: 0, translate: '0 14px', scale: .94}, {opacity: 1, translate: '0 0', scale: 1}],
          {duration: 560, delay: Math.min(i++, 14) * 32, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards'});
      });
      if (motLan) { xong = true; mo.disconnect(); }
    });
    mo.observe(goc, {childList: true});
  }
  noiLen($1('#dsCharm'), '.the-charm');
  noiLen($1('#dsDay'), '.the-day', true);

  /* ---------- nút trên trang thiết kế (28/11: user thấy một số nút chưa có hiệu ứng) ----------
     · vệt loang từ đúng chỗ bấm (như nút .nut của web) cho nút công cụ, tab vòng, ô số vòng, chip lọc, thẻ dây, nút trong bong bóng, nút +/− charm
     · nền chọn trượt sang lựa chọn mới (tab vòng, chip lọc) / khung chọn trượt (ô số vòng) — tự dựng lại khi danh sách vẽ lại */
  var NUT = '.cong-cu button,.tab-vong button,.so-vong button,.chip-nhom button,.the-day,.bong-charm button,.dau-cong,.bot-charm';
  document.addEventListener('pointerdown', function (ev) {
    if (GIAM || ev.button) return;
    var n = ev.target.closest && ev.target.closest(NUT); if (!n || n.disabled || !n.animate) return;
    var r = n.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, k = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
    var hop = n.querySelector(':scope > .tkd-gon-hop');
    if (!hop) { hop = document.createElement('span'); hop.className = 'tkd-gon-hop'; hop.setAttribute('aria-hidden', 'true'); n.appendChild(hop); }
    var g = document.createElement('i'); g.className = 'tkd-gon';
    g.style.cssText = 'left:' + (x - k) + 'px;top:' + (y - k) + 'px;width:' + 2 * k + 'px;height:' + 2 * k + 'px';
    hop.appendChild(g);
    var a = g.animate([{transform: 'scale(0)', opacity: .22}, {transform: 'scale(1)', opacity: 0}], {duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)'});
    a.onfinish = a.oncancel = function () { g.remove(); };
  }, {passive: true});

  function truot(goc, kieu) {
    if (!goc) return;
    goc.classList.add('tkd-truot-co', 'tkd-' + kieu);
    var nen = null, cu = null;
    function dat(dau) {
      var on = goc.querySelector('button.on');
      if (!nen || !nen.isConnected) { nen = document.createElement('i'); nen.className = 'tkd-truot'; nen.setAttribute('aria-hidden', 'true'); goc.insertBefore(nen, goc.firstChild); dau = true; }
      if (!on) { nen.style.opacity = 0; return; }
      var r = {l: on.offsetLeft, t: on.offsetTop, w: on.offsetWidth, h: on.offsetHeight};
      nen.style.opacity = 1;
      if (cu && !dau && !GIAM && nen.animate) nen.animate([{left: cu.l + 'px', top: cu.t + 'px', width: cu.w + 'px', height: cu.h + 'px'}, {left: r.l + 'px', top: r.t + 'px', width: r.w + 'px', height: r.h + 'px'}], {duration: 480, easing: 'cubic-bezier(.3,1.3,.5,1)'});
      nen.style.left = r.l + 'px'; nen.style.top = r.t + 'px'; nen.style.width = r.w + 'px'; nen.style.height = r.h + 'px';
      cu = r;
    }
    var hen = 0;
    function soat() { if (!hen) hen = requestAnimationFrame(function () { hen = 0; dat(false); }); }
    new MutationObserver(soat).observe(goc, {childList: true, subtree: true, attributes: true, attributeFilter: ['class']});
    addEventListener('resize', function () { cu = null; dat(true); });
    dat(true);
  }
  truot($1('#tabVong'), 'tab');
  truot($1('#chipNhom'), 'chip');
  truot($1('#soVong'), 'vong');
})();
