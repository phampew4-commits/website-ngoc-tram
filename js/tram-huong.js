/* Trang Trầm hương nhà làm (tram-huong.html)
   - Sản phẩm từng dòng lấy từ data/tram-dot.json (chung.js tải sẵn vào TD qua taiTramDot)
   - Mỗi quy cách có giá là một món giỏ mã td-<sp.id>-<quyCach.id>, mua được nhiều (GIO.themSl)
   - Nét vàng chạy dọc trang + hình vẽ theo thanh cuộn + các chuyển động trang trí */
(function () {
  var html = document.documentElement;
  var CHUP = /[?&]chup=1/.test(location.search);   // ?chup=1: hiện + vẽ sẵn mọi thứ để chụp ảnh toàn trang
  if (CHUP) html.classList.add('chup');
  var GIAM = CHUP || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tien = function (n) { return (+n).toLocaleString('vi-VN') + 'đ'; };
  function trong(g, s) { return [].slice.call((g || document).querySelectorAll(s)); }

  var IC_TRU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 12h12"/></svg>';
  var IC_CONG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 6v12M6 12h12"/></svg>';
  var IC_TUI = '<svg class="th-tui" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>';
  var IC_TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var IC_ZALO = '<svg class="th-ic-zalo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 4c-4.7 0-8.5 3.2-8.5 7.2 0 2.2 1.2 4.2 3 5.5L6 20l3.6-1.8c.8.2 1.6.3 2.4.3 4.7 0 8.5-3.2 8.5-7.3S16.7 4 12 4z"/></svg>';
  var zalo = function () { return linkZalo(); };
  var moiTab = function () { return LIEN_HE.sdt ? ' target="_blank" rel="noopener"' : ''; };

  /* ================= DỰNG THẺ SẢN PHẨM ================= */
  function theSp(l, s, i, lon) {
    var q = (s.quyCach || []).filter(function (x) { return x && x.ten; });
    if (!q.length) q = [{id: 'qc1', ten: 'Một quy cách', gia: null}];
    var dau = q[0], coGia = +dau.gia > 0;
    var chip = q.map(function (x, j) {
      return '<button type="button" data-qc="' + e(x.id) + '" data-gia="' + (+x.gia > 0 ? +x.gia : '') + '"' + (j ? '' : ' class="on"') +
        ' aria-pressed="' + (j ? 'false' : 'true') + '">' + e(x.ten) + '</button>';
    }).join('');
    var anhO = s.anh ? hinh(s.anh, s.ten, 600) :
      '<svg class="th-ve-nho" aria-hidden="true"><use href="#ve-' + e(l.ve || l.id) + '" width="100%" height="100%"/></svg>';
    return '<article class="th-sp' + (lon ? ' lon' : '') + (coGia ? '' : ' chua-gia') + '" id="sp-' + e(s.id) + '" data-sp="' + e(s.id) + '" data-ten="' + e(s.ten) + '" data-hien style="--i:' + (i % 4) + '">' +
      '<figure class="th-sp-anh">' + anhO + (lon ? '<span class="th-noi-bat">Nổi bật</span>' : '') +
      '<span class="th-co">' + IC_TICK + '<span>Trong giỏ</span></span>' + (s.anh ? '' : '<span class="th-minh-hoa">Hình minh hoạ</span>') + '</figure>' +
      '<div class="th-sp-noi"><div class="th-sp-tt"><h3 class="th-sp-ten">' + e(s.ten) + '</h3>' + (s.mo ? '<p class="th-sp-mo">' + e(s.mo) + '</p>' : '') +
      '<div class="th-qc" role="group" aria-label="Quy cách">' + chip + '</div></div>' +
      '<div class="th-chot"><div class="th-gia"><b class="th-gia-so">' + (coGia ? tien(dau.gia) : '') + '</b><span class="th-cho-gia">Giá đang cập nhật</span></div>' +
      '<div class="th-sl"><button type="button" class="th-bot" aria-label="Bớt một" disabled>' + IC_TRU + '</button><input type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Số lượng"><button type="button" class="th-them1" aria-label="Thêm một">' + IC_CONG + '</button></div>' +
      '<button type="button" class="nut dac th-them">' + IC_TUI + '<span>Thêm vào giỏ</span></button>' +
      '<a class="nut th-zalo" href="' + zalo() + '"' + moiTab() + '>' + IC_ZALO + '<span>Nhắn Zalo hỏi giá</span></a>' +
      '<p class="th-da" hidden>' + IC_TICK + '<span class="th-da-chu"></span><a href="gio-hang.html">Xem giỏ</a></p></div></div></article>';
  }
  function oTrong(l) {
    return '<div class="th-trong" data-hien><div><b>' + e(l.ten) + ' đang được cập nhật</b><p>Ngọc Trầm đang chụp ảnh và lên giá các sản phẩm dòng này. Nhắn Zalo để hỏi những loại đang có sẵn.</p></div>' +
      '<a class="nut dac th-zalo-dac" href="' + zalo() + '"' + moiTab() + '>' + IC_ZALO + 'Hỏi qua Zalo</a></div>';
  }

  function ganThe(the) {
    var id = the.dataset.sp, ten = the.dataset.ten;
    var o = the.querySelector('.th-sl input'), bot = the.querySelector('.th-bot'), them1 = the.querySelector('.th-them1');
    var dangChon = function () { return the.querySelector('.th-qc button.on'); };
    function datSl(n) { n = Math.max(1, Math.min(99, parseInt(n, 10) || 1)); o.value = n; bot.disabled = n <= 1; them1.disabled = n >= 99; }
    function chon(b) {
      trong(the, '.th-qc button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      var g = b.dataset.gia; the.classList.toggle('chua-gia', !g);
      if (g) the.querySelector('.th-gia-so').textContent = tien(g);
    }
    trong(the, '.th-qc button').forEach(function (b) { b.onclick = function () { chon(b); }; });
    bot.onclick = function () { datSl(+o.value - 1); };
    them1.onclick = function () { datSl(+o.value + 1); };
    o.onchange = function () { datSl(o.value); };
    datSl(1);
    var nut = the.querySelector('.th-them');
    nut.onclick = function () {
      var b = dangChon(); if (!b || !b.dataset.gia) return;
      var k = 'td-' + id + '-' + b.dataset.qc, n = +o.value;
      if (!TD.mon[k]) { baoTin('Sản phẩm này chưa đặt được — nhắn Zalo giúp Ngọc Trầm nhé'); return; }
      GIO.themSl(k, n); datSl(1); capNhatDa();
      bayTram(nut);
      nut.classList.add('xong'); nut.querySelector('span').textContent = 'Đã thêm';
      setTimeout(function () { nut.classList.remove('xong'); nut.querySelector('span').textContent = 'Thêm vào giỏ'; }, 1600);
      baoTin('Đã thêm ' + n + ' × ' + ten + ' (' + b.textContent + ') vào giỏ');
    };
    the.querySelector('.th-zalo').addEventListener('click', function () {
      var b = dangChon(), chu = 'Chào Ngọc Trầm, mình muốn hỏi giá ' + ten + (b ? ' (' + b.textContent + ')' : '');
      try { navigator.clipboard.writeText(chu); baoTin('Đã chép câu hỏi giá — dán vào Zalo nhé'); } catch (er) {}
    });
  }
  function capNhatDa() {   // thẻ nào đang có trong giỏ: viền vàng + dòng "Trong giỏ: …"
    trong(document, '.th-sp').forEach(function (the) {
      var id = the.dataset.sp, ds = [], tong = 0;
      trong(the, '.th-qc button').forEach(function (b) {
        var k = 'td-' + id + '-' + b.dataset.qc;
        if (GIO.co(k)) { var n = GIO.sl(k); tong += n; ds.push(n + ' × ' + b.textContent); }
      });
      var da = the.querySelector('.th-da'); da.hidden = !tong; the.classList.toggle('trong-gio', !!tong);
      if (tong) { da.querySelector('.th-da-chu').textContent = 'Trong giỏ: ' + ds.join(', '); the.querySelector('.th-co span').textContent = 'Trong giỏ · ' + tong; }
    });
  }
  addEventListener('storage', capNhatDa);
  addEventListener('pageshow', capNhatDa);

  taiTramDot.then(function () {
    (TD.loai || []).forEach(function (l, li) {
      var sec = document.getElementById(l.id); if (!sec) return;
      var ds = sec.querySelector('[data-ds]'), kieu = ds.dataset.ds, sp = (l.sp || []).filter(function (s) { return s && s.id && s.ten; });
      if (l.mo) sec.querySelector('[data-mo]').textContent = l.mo;
      if (l.dacDiem && l.dacDiem.length) sec.querySelector('[data-dd]').innerHTML = l.dacDiem.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('');
      var so = ('0' + (li + 1)).slice(-2);
      sec.querySelector('[data-dem]').textContent = 'Dòng ' + so + ' · ' + (sp.length ? sp.length + ' sản phẩm' : 'đang cập nhật');
      var dd = sec.querySelector('[data-dem-ds]');
      if (dd) dd.textContent = sp.length ? sp.length + ' sản phẩm · chọn quy cách để xem giá' : 'Đang cập nhật';
      ds.innerHTML = sp.length ? sp.map(function (s, i) { return theSp(l, s, i, kieu === 'noi' && !!s.noiBat); }).join('') : oTrong(l);
      sec.classList.toggle('it', sp.length < 3);
      trong(ds, '.th-sp').forEach(ganThe);
      theoDoi(sec);
    });
    capNhatDa();
    ganHang(); dungLai();
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(function () { t.scrollIntoView({block: 'start'}); }, 60); }
  });

  /* ================= HÀNG VUỐT NGANG ================= */
  function ganHang() {
    trong(document, '.th-dong').forEach(function (sec) {
      var hang = sec.querySelector('.th-hang'), lui = sec.querySelector('.th-lui'), toi = sec.querySelector('.th-toi');
      if (!hang || !lui) return;
      function buoc() { var c = hang.querySelector('.th-sp'); return c ? c.offsetWidth + 18 : 300; }
      function canh() { lui.disabled = hang.scrollLeft < 4; toi.disabled = hang.scrollLeft + hang.clientWidth > hang.scrollWidth - 4; }
      lui.onclick = function () { hang.scrollBy({left: -buoc()}); };
      toi.onclick = function () { hang.scrollBy({left: buoc()}); };
      hang.addEventListener('scroll', canh, {passive: true}); canh();
    });
  }

  /* ================= NÉT VÀNG CHẠY DỌC + HÌNH VẼ THEO THANH CUỘN =================
     path.net đi dọc biên trang, vòng vào đỉnh khói hình mỗi dòng (data-tren) rồi đi tiếp từ đầu nét đất (data-day).
     Mỗi <svg data-ve>: --p (0→1) — bắt đầu vẽ khi đỉnh hình chạm 85% màn hình, xong khi tâm hình tới 55%. */
  var wrap = document.getElementById('hanhTrinh'), soi = wrap.querySelector('.th-soi'), net = soi.querySelector('.net'),
      but = soi.querySelector('.dau-but'), quang = soi.querySelector('.quang');
  var L = 0, ys = [], pts = [], wTop = 0, ves = [], dong = [], hen2, raf = 0, dangOn = -1;
  var navK = document.querySelector('.th-dieu .khung'), navA = trong(document, '.th-dieu a');

  function C(a, b) { var dy = (b.y - a.y) / 2; return ' C' + a.x + ' ' + (a.y + dy) + ' ' + b.x + ' ' + (b.y - dy) + ' ' + b.x + ' ' + b.y; }
  function khuyu(a, b) { return ' C' + (a.x + (b.x - a.x) * .75) + ' ' + a.y + ' ' + b.x + ' ' + (a.y + (b.y - a.y) * .25) + ' ' + b.x + ' ' + b.y; }

  function dung() {
    var r0 = wrap.getBoundingClientRect(), W = wrap.clientWidth, H = wrap.offsetHeight;
    wTop = r0.top + scrollY;
    soi.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var k = wrap.querySelector('.khung').getBoundingClientRect(), le = Math.max(10, Math.min(70, (k.left - r0.left) * .5)), bien = {L: le, R: W - le};
    function diem(svg, x, y) { var p = svg.createSVGPoint(); p.x = x; p.y = y; p = p.matrixTransform(svg.getScreenCTM()); return {x: p.x - r0.left, y: p.y - r0.top}; }
    var cur = {x: le, y: 0}, ben = 'L', d = 'M' + le + ' 0';
    trong(wrap, 'svg[data-tren]').forEach(function (svg) {
      var t = svg.dataset.tren.split(',').map(Number), b = svg.dataset.day.split(',').map(Number);
      var A = diem(svg, t[0], t[1]), sec = svg.closest('section'), sr = sec.getBoundingClientRect();
      var yc = sr.top - r0.top + parseFloat(getComputedStyle(sec).paddingTop) * .45, mx = bien[ben];
      if (Math.abs(cur.x - mx) > 1) { var r = {x: mx, y: cur.y + 60}; d += khuyu(cur, r); cur = r; }
      if (yc - 50 > cur.y) { d += ' L' + mx + ' ' + (yc - 50); cur = {x: mx, y: yc - 50}; }
      var v = {x: A.x, y: Math.min(A.y - 4, Math.max(cur.y + 70, yc + 50))}; d += C(cur, v); cur = v;
      if (A.y > cur.y) d += ' L' + A.x + ' ' + A.y;
      ben = A.x < W * .45 ? 'L' : 'R';
      var B = diem(svg, ben === 'L' ? b[0] : b[2], b[1]); d += ' M' + B.x + ' ' + B.y; cur = B;
    });
    var cuoi = {x: bien[ben], y: Math.min(H - 10, cur.y + 90)}; d += khuyu(cur, cuoi);
    net.setAttribute('d', d);
    L = net.getTotalLength(); net.style.strokeDasharray = L + ' ' + L;
    var N = Math.min(2400, Math.ceil(L / 6)); ys = []; pts = [];
    for (var i = 0, m = -1e9; i <= N; i++) { var p = net.getPointAtLength(L * i / N); m = Math.max(m, p.y); ys.push(m); pts.push(p); }
    ves = trong(document, '[data-ve]').map(function (el) { var r = el.getBoundingClientRect(); return {el: el, top: r.top + scrollY, h: r.height, p: -1}; });
    dong = trong(document, '.th-dong[data-loai]').map(function (s) { var r = s.getBoundingClientRect(); return {top: r.top + scrollY, bot: r.bottom + scrollY}; });
    ve();
  }
  function ve() {
    raf = 0;
    var vh = innerHeight;
    if (GIAM) { net.style.strokeDashoffset = 0; but.style.display = quang.style.display = 'none'; }
    else {
      var y = scrollY + vh * .8 - wTop, lo = 0, hi = ys.length - 1;
      while (lo < hi) { var g = (lo + hi) >> 1; if (ys[g] < y) lo = g + 1; else hi = g; }
      var len = L * lo / Math.max(1, ys.length - 1);
      net.style.strokeDashoffset = L - len;
      var p = pts[lo], an = !p || len <= 1 || len >= L - 1;
      but.style.display = quang.style.display = an ? 'none' : '';
      if (!an) { but.setAttribute('cx', p.x); but.setAttribute('cy', p.y); quang.setAttribute('cx', p.x); quang.setAttribute('cy', p.y); }
      ves.forEach(function (v) {
        var bd = v.top - vh * .85, kt = v.top + v.h / 2 - vh * .55, q = Math.max(0, Math.min(1, (scrollY - bd) / Math.max(80, kt - bd)));
        if (Math.abs(q - v.p) > .002) { v.p = q; v.el.style.setProperty('--p', q.toFixed(3)); }
      });
    }
    var mt = scrollY + vh * .4, on = -1;
    dong.forEach(function (s, i) { if (mt >= s.top && mt < s.bot) on = i; });
    if (on !== dangOn) {
      dangOn = on;
      navA.forEach(function (a, i) { a.classList.toggle('on', i === on); });
      if (on >= 0 && navK.scrollWidth > navK.clientWidth) { var a = navA[on]; navK.scrollTo({left: a.offsetLeft - (navK.clientWidth - a.offsetWidth) / 2, behavior: GIAM ? 'auto' : 'smooth'}); }
    }
  }
  function dungLai() { clearTimeout(hen2); hen2 = setTimeout(dung, 120); }
  addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(ve); }, {passive: true});
  addEventListener('resize', dungLai);
  if ('ResizeObserver' in window) new ResizeObserver(dungLai).observe(wrap);
  if (document.fonts) document.fonts.ready.then(dungLai);
  addEventListener('load', dungLai);
  dung();

  /* ================= CHUYỂN ĐỘNG THÊM ================= */
  function bayTram(nut) {   // dùng hàm bay vào giỏ chung của chung.js (ảnh thật nếu có, không thì chấm vàng)
    var the = nut.closest('.th-sp'), img = the && the.querySelector('.th-sp-anh img');
    if (typeof window.bayVaoGio === 'function') window.bayVaoGio(nut, img || null);
  }

  /* ================= NHỊP THỞ Ở PHẦN TRẦM THIỀN (lucian #193) =================
     Bấm vòng tròn: hít vào 4s (nở) – giữ 2s – thở ra 4s (co), hiện số giây còn lại; bấm lần nữa / cuộn đi chỗ khác thì dừng.
     Giảm chuyển động: vòng không co giãn (CSS), chữ + số giây vẫn chạy. */
  var tho = document.querySelector('.th-tho');
  if (tho) (function () {
    var vong = tho.querySelector('.th-tho-vong'), chu = tho.querySelector('.th-tho-tt b'), so = tho.querySelector('.th-tho-tt i'), doc = tho.querySelector('.th-tho-doc');
    var PHA = [['Hít vào', 4000], ['Giữ', 2000], ['Thở ra', 4000]], bat = false, t0 = 0, rafT = 0, phaCu = -1, soCu = '';
    var em = function (x) { return (1 - Math.cos(Math.PI * x)) / 2; };
    function lap(now) {
      if (!bat) return;
      var t = (now - t0) % 10000, i = t < 4000 ? 0 : t < 6000 ? 1 : 2, k = (t - (i ? (i === 1 ? 4000 : 6000) : 0)) / PHA[i][1];
      tho.style.setProperty('--tho', (i === 0 ? em(k) : i === 1 ? 1 : 1 - em(k)).toFixed(4));
      tho.style.setProperty('--pha', k.toFixed(4));
      if (i !== phaCu) { phaCu = i; tho.dataset.pha = i; chu.textContent = doc.textContent = PHA[i][0]; }
      var g = String(Math.max(1, Math.ceil((1 - k) * PHA[i][1] / 1000)));
      if (g !== soCu) { soCu = g; so.textContent = g; }
      rafT = requestAnimationFrame(lap);
    }
    function batDau() { bat = true; t0 = performance.now(); phaCu = -1; soCu = ''; tho.classList.add('dang'); vong.setAttribute('aria-pressed', 'true'); rafT = requestAnimationFrame(lap); }
    function thoi(im) {
      if (!bat) return;
      bat = false; cancelAnimationFrame(rafT); tho.classList.remove('dang'); delete tho.dataset.pha;
      tho.style.setProperty('--tho', 0); tho.style.setProperty('--pha', 0);
      vong.setAttribute('aria-pressed', 'false'); chu.textContent = 'Bấm để bắt đầu'; so.textContent = ''; if (!im) doc.textContent = 'Đã dừng';
    }
    vong.addEventListener('click', function () { if (bat) thoi(); else batDau(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (!es[0].isIntersecting) thoi(true); }).observe(tho);
  })();

  /* ================= CHỮ TRÔI THEO ĐƯỜNG SÓNG NHƯ LÀN KHÓI (lucian #382) =================
     Đường sóng vẽ lại mỗi khung hình (2 sóng sin chồng nhau), chữ trôi dọc theo nó, mỗi chữ tự nghiêng theo độ dốc.
     Chỉ chạy khi khối đang trên màn hình; giảm chuyển động / ?chup=1 thì đứng yên. */
  var song = document.querySelector('.th-song');
  if (song) (function () {
    var svg = song.querySelector('svg'), duong = svg.querySelector('#thSongDuong'), tp = svg.querySelector('textPath'), tx = svg.querySelector('text');
    var CHU = 'Trầm có tăm · Trầm không tăm · Nụ trầm · Trầm thiền · Nhang vòng · Răm trầm · ', W = 0, H = 0, bien = 0, don = 0, pha = 0, lech = 0, truoc = 0, thay = false, chay = false;
    function doSize() {
      W = svg.clientWidth || song.clientWidth; H = svg.clientHeight || 170; if (!W) return;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      bien = Math.min(26, H * .15);
      tp.textContent = CHU; don = 0;
      try { don = tx.getComputedTextLength(); } catch (er) {}
      if (!don) don = 600;
      var n = Math.ceil((W + 160) / don) + 1, s = ''; for (var i = 0; i < n; i++) s += CHU;
      tp.textContent = s;
      ve(0);
    }
    function ve(dt) {
      pha += dt * .55; lech = (lech + dt * 26) % don;
      var pts = [], buocX = W < 600 ? 14 : 18;
      for (var x = -80; x <= W + 80 + buocX; x += buocX) {
        var y = H * .56 + bien * Math.sin(x / 170 + pha) + bien * .3 * Math.sin(x / 61 - pha * 1.4);
        pts.push(x.toFixed(1) + ' ' + y.toFixed(1));
      }
      duong.setAttribute('d', 'M' + pts.join(' L'));
      tp.setAttribute('startOffset', (-lech).toFixed(1));
    }
    function lap(now) {
      if (!thay || document.hidden) { chay = false; return; }
      var dt = Math.min(.05, (now - (truoc || now)) / 1000); truoc = now;
      ve(dt); requestAnimationFrame(lap);
    }
    function batLai() { if (GIAM || chay || !thay) return; chay = true; truoc = 0; requestAnimationFrame(lap); }
    doSize();
    addEventListener('resize', function () { clearTimeout(song._h); song._h = setTimeout(doSize, 150); });
    if (document.fonts) document.fonts.ready.then(doSize);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; batLai(); }, {rootMargin: '80px 0px'}).observe(song);
    else { thay = true; batLai(); }
    document.addEventListener('visibilitychange', batLai);
  })();

  if (GIAM) return;
  html.classList.add('dong');
  var R = Math.random;

  /* tàn lửa bay trong các phần nền tối */
  trong(document, '.th-hero,.th-dong.toi,.th-ket').forEach(function (sec) {
    var box = document.createElement('div'), n = sec.classList.contains('th-hero') ? 22 : 12;
    box.className = 'th-tan'; box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) {
      var s = document.createElement('i');
      s.style.cssText = 'left:' + (R() * 100).toFixed(1) + '%;--t:' + (10 + R() * 12).toFixed(1) + 's;--d:-' + (R() * 22).toFixed(1) + 's;--x:' +
        ((R() - .5) * 140).toFixed(0) + 'px;--c:' + (1.2 + R() * 2.4).toFixed(1) + 'px';
      box.appendChild(s);
    }
    sec.insertBefore(box, sec.firstChild);
  });

  /* đầu trang nghiêng theo chuột */
  var hero = document.querySelector('.th-hero');
  if (hero && matchMedia('(hover:hover)').matches) {
    hero.addEventListener('mousemove', function (ev) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((ev.clientX - r.left) / r.width * 2 - 1).toFixed(3));
      hero.style.setProperty('--my', ((ev.clientY - r.top) / r.height * 2 - 1).toFixed(3));
    });
    hero.addEventListener('mouseleave', function () { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); });
  }

  /* ---------- chuẩn bị cho các hiệu ứng theo thanh cuộn (một vòng rAF chung: đọc hết vị trí trước, ghi sau) ---------- */
  var bq = document.querySelector('.th-trich blockquote'), tus = [];
  if (bq) {   // câu trích: tách từng chữ (lucian #388)
    (function tach(nut) {
      [].slice.call(nut.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'tu'; s.textContent = w; f.appendChild(s); tus.push({el: s, q: -1});
          });
          nut.replaceChild(f, c);
        } else if (c.nodeType === 1) tach(c);
      });
    })(bq);
  }
  /* số chương 01–04 lăn như dải số (lucian #390): hàng chục đứng yên, hàng đơn vị là dải 0…n lăn từ n-1 tới n */
  var soLon = trong(document, '.th-so-lon').map(function (el) {
    var t = el.textContent.trim(), n = parseInt(t.slice(-1), 10) || 0, dai = '';
    for (var i = 0; i <= n; i++) dai += '<i>' + i + '</i>';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = e(t.slice(0, -1)) + '<span class="th-so-cuon"><span class="th-so-dai">' + dai + '</span></span>';
    return {el: el, goc: el.parentNode, n: n, v: -1};
  });
  /* khung vòm hé mở từ khe giữa (lucian #282) */
  var vom = trong(document, '.th-gt-anh').map(function (el) { return {el: el, v: -1}; });
  /* nền tối hoà vào phần sáng kề bên (lucian #329) */
  var hoa = trong(document, '.th-dong.toi,.th-ket').map(function (el) { return {el: el, v: -1, ra: false}; });
  /* bước nhà làm: đường thời gian sáng dần (lucian #370) */
  var olB = document.querySelector('.th-buoc'), liB = olB ? trong(olB, 'li') : [], mocB = [], docB = false, sangB = -1;
  var mqDoc = matchMedia('(max-width:760px)');
  function doMoc() {
    if (!olB) return;
    docB = mqDoc.matches;
    var W = olB.clientWidth, H = olB.clientHeight;
    mocB = liB.map(function (li) { return docB ? (li.offsetTop + 30) / Math.max(1, H) : (li.offsetLeft + 26) / Math.max(1, W); });
  }
  /* thẻ "Dùng an toàn" xếp chồng (lucian #223) — chỉ khi CSS đã cho thẻ dính (máy tính) */
  var the1 = document.querySelector('.th-dung-o'), the2 = the1 && document.querySelector('.th-dung-o + .th-dung-o'), luiCu = -1;
  function doThe() {
    if (!the2) return;
    the2.style.removeProperty('--cao');
    if (getComputedStyle(the1).position === 'sticky') the2.style.setProperty('--cao', the1.offsetHeight + 'px');
  }

  var cho = 0, kep = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
  var em = function (x) { return x * x * (3 - 2 * x); };
  function khung() {
    cho = 0;
    var vh = innerHeight, ghi = [];
    /* đọc */
    var ra = Math.min(1, scrollY / vh);
    var lechs = trong(document, '.th-dong').map(function (s) {
      var r = s.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return null;
      return Math.max(-1.2, Math.min(1.2, (r.top + Math.min(r.height, vh) / 2 - vh / 2) / vh));
    });
    var pBq = 0;
    if (bq) { var b = bq.getBoundingClientRect(); pBq = kep((vh * .92 - b.top) / (vh * .4)); }
    soLon.forEach(function (o) { var r = o.goc.getBoundingClientRect(); o.p = (r.bottom < -200 || r.top > vh + 200) ? null : kep((vh * .92 - r.top) / (vh * .42)); });
    vom.forEach(function (o) { var r = o.el.getBoundingClientRect(); o.p = (r.bottom < -100 || r.top > vh + 100) ? null : kep((vh * 1.02 - r.top) / (vh * .34)); });
    hoa.forEach(function (o) {
      var r = o.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) { o.p = null; return; }
      var vao = kep((vh - r.top) / (vh * .36)), roi = kep(r.bottom / (vh * .3));
      o.raMoi = roi < vao; o.p = .55 + .45 * em(Math.min(vao, roi));
    });
    var pB = -1;
    if (olB) {
      var rb = olB.getBoundingClientRect();
      if (rb.bottom > -100 && rb.top < vh + 100) pB = docB ? kep((vh * .62 - rb.top) / rb.height) : kep((vh * .86 - rb.top) / (vh * .42));
    }
    var lui = -1;
    if (the2 && the2.style.getPropertyValue('--cao')) {
      var r2 = the2.getBoundingClientRect(), h1 = the1.offsetHeight, dinh = parseFloat(getComputedStyle(the2).top) || 0;
      lui = kep(1 - (r2.top - dinh) / Math.max(1, h1));
    }
    /* ghi */
    if (hero) hero.style.setProperty('--ra', ra.toFixed(3));
    trong(document, '.th-dong').forEach(function (s, i) { if (lechs[i] !== null) s.style.setProperty('--lech', lechs[i].toFixed(3)); });
    if (tus.length) {
      var N = tus.length;
      tus.forEach(function (t, i) {
        var q = kep((pBq * (N + 2.2) - i) / 2.2); q = Math.round(q * 50) / 50;
        if (q !== t.q) { t.q = q; t.el.style.setProperty('--q', q); }
      });
    }
    soLon.forEach(function (o) {
      if (o.p === null) return;
      var v = Math.round((Math.max(0, o.n - 1) + (o.n ? em(o.p) : 0)) * 1000) / 1000;
      if (v !== o.v) { o.v = v; o.el.style.setProperty('--cuon', v); }
    });
    vom.forEach(function (o) {
      if (o.p === null) return;
      var v = Math.round(em(o.p) * 500) / 500;
      if (v !== o.v) { o.v = v; o.el.style.setProperty('--mo', v); }
    });
    hoa.forEach(function (o) {
      if (o.p === null) return;
      var v = Math.round(o.p * 500) / 500;
      if (v !== o.v) { o.v = v; o.el.style.setProperty('--hoa', v); }
      if (o.raMoi !== o.ra) { o.ra = o.raMoi; o.el.classList.toggle('ra', o.ra); }
    });
    if (pB >= 0 && Math.abs(pB - sangB) > .001) {
      sangB = pB; olB.style.setProperty('--sang', pB.toFixed(3));
      liB.forEach(function (li, i) { li.classList.toggle('sang', pB >= mocB[i] - .005); });
    }
    if (lui >= 0 && Math.abs(lui - luiCu) > .002) { luiCu = lui; the1.style.setProperty('--lui', lui.toFixed(3)); }
  }
  function doLai() { doMoc(); doThe(); khung(); }
  addEventListener('scroll', function () { if (!cho) cho = requestAnimationFrame(khung); }, {passive: true});
  addEventListener('resize', function () { clearTimeout(khung._h); khung._h = setTimeout(doLai, 120); });
  if (document.fonts) document.fonts.ready.then(doLai);
  addEventListener('load', doLai);
  doLai();

  /* ================= DÒNG HẠT BAY NHƯ KHÓI Ở ĐẦU TRANG (lucian #352) =================
     Canvas nhẹ: mỗi hạt trôi lên theo một "dòng chảy" vô hình đổi dần theo thời gian, kéo theo vệt mảnh (lưu vài vị trí gần nhất, xoá
     canvas mỗi khung — không để lại vệt mờ đọng). Rê chuột: khói xoáy nhẹ quanh con trỏ. Dừng khi đầu trang ra khỏi màn hình / tab ẩn.
     Điện thoại: ít hạt hơn. Nằm dưới tàn lửa, trên nền ánh vàng (thị sai nhiều lớp #309). */
  if (hero) (function () {
    var cv = document.createElement('canvas'), ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    cv.className = 'th-hero-khoi'; cv.setAttribute('aria-hidden', 'true');
    var nen = document.createElement('div'); nen.className = 'th-hero-nen'; nen.setAttribute('aria-hidden', 'true');
    hero.insertBefore(cv, hero.firstChild); hero.insertBefore(nen, hero.firstChild);
    var W = 0, H = 0, ps = [], K = 22, t = 0, thay = true, chay = false, truoc = 0, chuot = null, nhip = 0;
    var MAU = ['rgba(233,222,198,', 'rgba(209,173,102,'];
    function hat(p, dau) {   // hạt mới: dày hơn ở nửa phải (quanh nén trầm) và phía dưới, như khói bốc lên
      var x = R(); if (W >= 760 && R() < .55) x = .45 + R() * .55;
      p.x = x * W; p.y = dau ? R() * H : H * (.55 + R() * .5); p.v = .35 + R() * .55; p.a = .5 + R() * .5; p.s = 0; p.m = 300 + R() * 520;
      p.c = R() < .28 ? 1 : 0; p.h = [p.x, p.y]; p.o = R() * 6.28; return p;
    }
    function co() {
      var r = hero.getBoundingClientRect(), dpr = Math.min(1.5, devicePixelRatio || 1);
      W = Math.round(r.width); H = Math.round(r.height); if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = W < 760 ? 70 : W < 1200 ? 150 : 210; K = W < 760 ? 16 : 22;
      ps = []; for (var i = 0; i < n; i++) ps.push(hat({}, true));
    }
    function buoc(dt) {
      t += dt; nhip++;
      var f = dt * 60, luu = nhip % 3 === 0, nhom = [[[], [], []], [[], [], []]];
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        /* lệch khỏi hướng thẳng lên: dòng chảy vô hình đổi dần theo thời gian → làn khói uốn lượn */
        var lech = Math.sin(p.x * .0058 + t * .3 + p.o * .15) * Math.cos(p.y * .0041 - t * .22) * 1.25 + Math.sin((p.x - p.y) * .0027 + t * .27) * .55;
        var vx = Math.sin(lech) * p.v, vy = -Math.cos(lech) * p.v * .9;
        if (chuot) {
          var dx = p.x - chuot.x, dy = p.y - chuot.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 170 && d > 1) { var k = (1 - d / 170) * 1.6; vx += -dy / d * k - dx / d * k * .2; vy += dx / d * k - dy / d * k * .2; }
        }
        p.x += vx * f; p.y += vy * f; p.s += f;
        if (luu) { p.h.push(p.x, p.y); if (p.h.length > K * 2) p.h.splice(0, 2); }
        if (p.y < -30 || p.x < -40 || p.x > W + 40 || p.s > p.m) { hat(p, false); continue; }
        /* mờ dần ở đầu + cuối đời hạt, nhạt hơn khi đi qua vùng chữ bên trái */
        var song = Math.sin(Math.PI * Math.min(1, p.s / p.m)) * p.a * (W >= 760 ? .45 + .55 * Math.min(1, p.x / (W * .6)) : .7);
        nhom[p.c][song > .5 ? 2 : song > .25 ? 1 : 0].push(p);
      }
      ctx.clearRect(0, 0, W, H); ctx.lineWidth = 1; ctx.lineCap = ctx.lineJoin = 'round';
      for (var c = 0; c < 2; c++) for (var b = 0; b < 3; b++) {
        var ds = nhom[c][b]; if (!ds.length) continue;
        ctx.strokeStyle = MAU[c] + [.045, .09, .16][b] + ')'; ctx.beginPath();
        for (var j = 0; j < ds.length; j++) {
          var q = ds[j], h = q.h; if (h.length < 4) continue;
          ctx.moveTo(h[0], h[1]); for (var m = 2; m < h.length; m += 2) ctx.lineTo(h[m], h[m + 1]); ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
      }
    }
    function lap(now) {
      if (!thay || document.hidden) { chay = false; return; }
      var dt = Math.min(.05, (now - (truoc || now)) / 1000 || .016); truoc = now;
      buoc(dt); requestAnimationFrame(lap);
    }
    function batLai() { if (chay || !thay || document.hidden || !W) return; chay = true; truoc = 0; requestAnimationFrame(lap); }
    co();
    for (var i = 0; i < 90; i++) buoc(1 / 60);   // chạy trước vài khung cho có vệt ngay khi mở trang
    if ('ResizeObserver' in window) new ResizeObserver(function () { clearTimeout(cv._h); cv._h = setTimeout(function () { co(); batLai(); }, 150); }).observe(hero);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; batLai(); }).observe(hero);
    document.addEventListener('visibilitychange', batLai);
    if (matchMedia('(hover:hover)').matches) {
      hero.addEventListener('mousemove', function (ev) { var r = cv.getBoundingClientRect(); chuot = {x: ev.clientX - r.left, y: ev.clientY - r.top}; });
      hero.addEventListener('mouseleave', function () { chuot = null; });
    }
    batLai();
  })();

  /* thanh 4 dòng: nền tròn trượt theo mục đang xem */
  if (navK) {
    var nen = document.createElement('span'); nen.className = 'th-dieu-nen'; navK.insertBefore(nen, navK.firstChild);
    var dat = function () {
      var a = navK.querySelector('a.on');
      if (!a) { nen.style.opacity = 0; return; }
      nen.style.opacity = 1; nen.style.width = a.offsetWidth + 'px'; nen.style.height = a.offsetHeight + 'px';
      nen.style.top = a.offsetTop + 'px'; nen.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    };
    new MutationObserver(dat).observe(navK, {subtree: true, attributes: true, attributeFilter: ['class']});
    addEventListener('resize', dat);
  }

  /* dải chữ chạy: nhanh + nghiêng theo tốc độ cuộn, đổi chiều theo chiều cuộn */
  var chay = document.querySelector('.th-chay-trong');
  if (chay) {
    var x = 0, v = 0, cu = scrollY, huong = 1, w = 0, thay = false;
    var doW = function () { w = chay.scrollWidth / 2; }; doW(); addEventListener('resize', doW);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; if (thay) cu = scrollY; }).observe(chay.parentNode); else thay = true;
    (function lap() {
      if (thay && !document.hidden) {
        var d = scrollY - cu; cu = scrollY;
        if (d) huong = d > 0 ? 1 : -1;
        v += (Math.min(60, Math.abs(d)) * .5 - v) * .1;
        x -= huong * (.55 + v);
        if (x <= -w) x += w; if (x > 0) x -= w;
        chay.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0) skewX(' + (-huong * Math.min(12, v * .6)).toFixed(2) + 'deg)';
      }
      requestAnimationFrame(lap);
    })();
  }
})();
