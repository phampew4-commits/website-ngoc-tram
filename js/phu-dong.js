/* Chuyển động chung cho các trang phụ (ngoài trang chủ) — ý từ lucianlabs. CSS: css/phu-dong.css
   #216 + #263 tiêu đề h1 đầu trang: từng từ trồi lên lần lượt, chữ nghiêng ánh vàng chảy (cả h1 dựng / đổi bằng JS sau đó)
   #363 nền lưới chấm vàng rất nhạt ở vùng đầu trang: rê chuột gợn sóng tròn, điện thoại thỉnh thoảng tự gợn
   #251 thẻ trong lưới nổi lên so le khi cuộn tới
   #260 một câu lớn tô đậm dần theo cuộn · #394 dải chữ lớn trôi ngược chiều, cuộn thì trôi nhanh hơn
   #211 khung "Cần tư vấn?" ở chân trang: lưới mờ + vệt sáng vàng chạy quanh viền
   Không dùng ở trang chủ (đã có trang-chu.js) và trầm hương. */
(function () {
  'use strict';
  var B = document.body, MAIN = document.querySelector('main');
  if (!B || !MAIN || document.querySelector('.hero') || B.dataset.trang === 'tram-huong') return;
  var TRANG = B.dataset.trang || (MAIN.classList.contains('trang-gio') ? 'gio-hang' : MAIN.classList.contains('trang-tk') ? 'tai-khoan' : '');
  var GIAM_ = typeof GIAM !== 'undefined' ? GIAM : matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHUOT_ = typeof CHUOT !== 'undefined' ? CHUOT : matchMedia('(hover: hover) and (pointer: fine)').matches;
  var CO_IO = 'IntersectionObserver' in window;
  function zoom() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (x) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[x]; }); }
  function kep(v, a, b) { return v < a ? a : v > b ? b : v; }
  function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  /* =====================================================================
     #216 + #263 TIÊU ĐỀ ĐẦU TRANG
     Có khung .dong-chu (style.css: overflow hidden + chừa đệm cho dấu) → dòng đứng yên, từng từ trồi lên dưới mặt nạ.
     Không có khung (giỏ trống, tài khoản, 404) → từng từ hiện mờ → rõ.
     h1 bị dựng lại cùng chữ → nối tiếp đúng nhịp cũ (không chạy lại); đổi chữ (lọc cửa hàng, đổi mục sỉ) → chạy lại nhanh.
     ===================================================================== */
  var SEL_H1 = '.tp-dau h1,.ch-dau2 h1,.si-dau h1,.vnt-dau h1,.tp-404 h1,.trang-gio h1,.trang-tk h1,.tk-dau h1';
  var NHO = typeof WeakMap === 'function' ? new WeakMap() : null;
  var ioH = CO_IO ? new IntersectionObserver(function (es) {
    es.forEach(function (x) { x.target.classList.toggle('pd-thay', x.isIntersecting); });
  }) : null;
  function boQua(n) {   // phần trong h1 không tách: hình vẽ, câu ẩn #346, từ đã tách
    return /^svg$/i.test(n.tagName) || n.classList.contains('an-cau') || n.classList.contains('an-vong') || n.classList.contains('pd-tu');
  }
  function tachH1(h) {
    if (GIAM_ || !NHO || !h || !h.isConnected) return;
    var dong = [].slice.call(h.querySelectorAll('.dong-chu'));
    var chu = gon(dong.length ? dong.map(function (d) { return d.textContent; }).join(' ') : [].map.call(h.childNodes, function (n) {
      return n.nodeType === 1 && boQua(n) && !n.classList.contains('pd-tu') ? '' : n.textContent;
    }).join(''));
    if (!chu) return;
    var bay = performance.now(), cu = NHO.get(h), t0, goc;
    if (!cu) { t0 = bay; goc = h.closest('.trang-gio,.trang-tk') ? .12 : .34; }   // lần đầu: chờ màn mở trang tan
    else if (cu.chu === chu) { t0 = cu.t0; goc = cu.goc; }                         // dựng lại cùng chữ → nối tiếp
    else { t0 = bay; goc = .04; }                                                   // đổi chữ → chạy lại nhanh
    NHO.set(h, {chu: chu, t0: t0, goc: goc});
    var lech = (bay - t0) / 1000, k = 0, ke = 0;
    function tach(node, trongEm) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          if (!/\S/.test(n.textContent)) return;
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
            var t = document.createElement('span'); t.className = 'pd-tu'; t.textContent = w;
            t.style.setProperty('--d', (goc + k * .075 - lech).toFixed(3) + 's');
            if (trongEm) t.style.setProperty('--de', (ke++ * .32).toFixed(2) + 's');
            if (!dong.length) t.setAttribute('aria-hidden', 'true');
            k++; f.appendChild(t);
          });
          node.replaceChild(f, n);
        } else if (n.nodeType === 1 && !boQua(n)) tach(n, trongEm || n.tagName === 'EM');
      });
    }
    if (dong.length) dong.forEach(function (d) { d.setAttribute('aria-hidden', 'true'); tach(d, false); });
    else tach(h, false);
    h.setAttribute('aria-label', chu);
    h.classList.add('pd-tach'); h.classList.toggle('pd-tron', !dong.length);
    if (ioH && !h._pdIo) { h._pdIo = 1; ioH.observe(h); }
  }

  /* =====================================================================
     #363 LƯỚI CHẤM VÀNG Ở VÙNG ĐẦU TRANG (canvas nằm dưới chữ, không chặn bấm, dừng khi ra khỏi màn hình)
     ===================================================================== */
  function luoiCham(sec) {
    var cv = document.createElement('canvas'); cv.className = 'pd-cham'; cv.setAttribute('aria-hidden', 'true');
    var ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return;
    sec.classList.add('pd-co-cham'); sec.insertBefore(cv, sec.firstChild);
    var W = 0, H = 0, dpr = 1, z = 1, cham = [], song = [], tro = null, thay = !CO_IO, raf = 0, dung = 0, moiX = -1e4, moiY = -1e4, moiT = 0;
    function doKich() {
      dung = 0;
      var r = sec.getBoundingClientRect(); if (!r.width || !r.height) return;
      W = r.width; H = r.height; z = zoom(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      var b = 22 * z, cot = Math.ceil(W / b) + 1, hang = Math.ceil(H / b) + 1, ox = (W - (cot - 1) * b) / 2, oy = (H - (hang - 1) * b) / 2;
      cham = [];
      for (var j = 0; j < hang; j++) for (var i = 0; i < cot; i++) {
        var x = ox + i * b, y = oy + j * b, ex = (x - W / 2) / (W * .56), ey = (y - H * .45) / (H * .78), d = Math.sqrt(ex * ex + ey * ey);
        var a = Math.max(0, 1 - d);
        cham.push({x: x, y: y, a: .05 + .26 * Math.pow(a, .85)});   // sáng ở giữa, nhạt dần ra mép
      }
      ve(performance.now());
    }
    function ve(bay) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#a8823a';
      song = song.filter(function (s) { return bay - s.t < s.tho; });
      var r0 = .95 * z, R2 = Math.pow(120 * z, 2), dich = 4.5 * z;
      for (var i = 0; i < cham.length; i++) {
        var c = cham[i], a = c.a, r = r0, dx = 0, dy = 0;
        for (var j = 0; j < song.length; j++) {
          var s = song[j], t = (bay - s.t) / 1000, ban = s.v * t, px = c.x - s.x, py = c.y - s.y, d = Math.sqrt(px * px + py * py) || 1, q = (d - ban) / s.w;
          if (q > -2.4 && q < 2.4) {
            var g = Math.exp(-q * q) * s.m * Math.pow(1 - (bay - s.t) / s.tho, 1.5);
            dx += px / d * g * dich; dy += py / d * g * dich; a += g * .5; r += g * 1.25 * z;
          }
        }
        if (tro) {
          var ux = c.x - tro.x, uy = c.y - tro.y, u = (ux * ux + uy * uy) / R2;
          if (u < 1) { var h = (1 - u) * (1 - u); a += h * .2; r += h * .45 * z; }
        }
        if (a < .02) continue;
        ctx.globalAlpha = a > .8 ? .8 : a;
        ctx.beginPath(); ctx.arc(c.x + dx, c.y + dy, r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function vong(bay) { raf = 0; ve(bay); if (thay && song.length) raf = requestAnimationFrame(vong); }
    function chay() { if (!raf && thay && W) raf = requestAnimationFrame(vong); }
    function gonSong(x, y, m, w, v) {
      var xa = Math.max(Math.hypot(x, y), Math.hypot(W - x, y), Math.hypot(x, H - y), Math.hypot(W - x, H - y));
      song.push({x: x, y: y, m: m, w: w * z, v: v * z, t: performance.now(), tho: Math.min(3200, (xa + 60 * z) / (v * z) * 1000)});
      if (song.length > 10) song.shift();
      chay();
    }
    doKich();
    if (window.ResizeObserver) new ResizeObserver(function () { if (!dung) dung = requestAnimationFrame(doKich); }).observe(sec);
    else addEventListener('resize', function () { if (!dung) dung = requestAnimationFrame(doKich); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(doKich);
    if (GIAM_) return;   // giảm chuyển động: chỉ còn lưới chấm đứng yên
    if (CO_IO) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; if (thay) chay(); else if (raf) { cancelAnimationFrame(raf); raf = 0; } }).observe(sec);
    function viTri(ev) { var r = sec.getBoundingClientRect(); return {x: ev.clientX - r.left, y: ev.clientY - r.top}; }
    if (CHUOT_) {
      sec.addEventListener('pointermove', function (ev) {
        if (ev.pointerType !== 'mouse') return;
        tro = viTri(ev);
        var bay = performance.now(), qd = Math.hypot(tro.x - moiX, tro.y - moiY);
        if (qd > 64 * z && bay - moiT > 110) { moiX = tro.x; moiY = tro.y; moiT = bay; gonSong(tro.x, tro.y, .55, 28, 240); }
        else if (!raf) { ve(bay); }
      }, {passive: true});
      sec.addEventListener('pointerleave', function () { tro = null; moiX = moiY = -1e4; if (!raf) ve(performance.now()); });
    }
    sec.addEventListener('pointerdown', function (ev) { var p = viTri(ev); gonSong(p.x, p.y, 1, 42, 320); }, {passive: true});
    /* mở trang: một vòng gợn từ giữa tiêu đề */
    setTimeout(function () {
      var h = sec.querySelector('h1'), r = sec.getBoundingClientRect(), q = h ? h.getBoundingClientRect() : null;
      gonSong(q ? q.left - r.left + q.width / 2 : W / 2, q ? q.top - r.top + q.height / 2 : H / 2, .9, 40, 260);
    }, 650);
    /* không có chuột: thỉnh thoảng tự gợn nhẹ */
    if (!CHUOT_) (function hen() {
      setTimeout(function () {
        if (thay && !document.hidden && W) gonSong(W * (.15 + Math.random() * .7), H * (.25 + Math.random() * .5), .65, 34, 210);
        hen();
      }, 3800 + Math.random() * 3200);
    })();
  }

  /* =====================================================================
     #251 THẺ TRONG LƯỚI NỔI LÊN SO LE KHI CUỘN TỚI (từ dưới lên + to dần, lần lượt theo thứ tự trong lưới)
     Không áp vào lưới sản phẩm .luoi .sp (cửa hàng / sỉ / quà tặng đã có hiệu ứng riêng).
     ===================================================================== */
  var SEL_THE = {
    'cam-nang': '#cnNgoc>.ngoc-the,#cnGiuTram>.meo,#cnOnline>.meo',
    'lien-he': '#lhThe>.lh-the,#lhMxh>.mxh-the',
    've-ngoc-tram': '#vntSo>div,#vntCk>.vnt-ck-o,.vnt-di-ds>a',
    'qua-tang': '#qtDv>.qt-dv-o,#qtKemDs>a',
    'chon-size': '.sz-buoc>li',
    'si': '#siDmLuoi>.si-dm-o'
  }[TRANG] || '';
  var ioT = SEL_THE && CO_IO && !GIAM_ ? new IntersectionObserver(function (es) {
    var vao = [];
    es.forEach(function (x) {
      var el = x.target;
      if (x.isIntersecting) { vao.push(el); ioT.unobserve(el); }
      else if (x.boundingClientRect.bottom < 0) { el.classList.remove('pd-cho'); ioT.unobserve(el); }   // đã nằm trên màn hình (cuộn sẵn) → hiện luôn
    });
    vao.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    var dem = [], cha = [];
    vao.forEach(function (el) {
      var p = cha.indexOf(el.parentNode); if (p < 0) { cha.push(el.parentNode); dem.push(0); p = cha.length - 1; }
      el.style.setProperty('--pd-tre', Math.min(dem[p]++, 7) * 95 + 'ms');
      el.classList.remove('pd-cho'); el.classList.add('pd-len');
      el.addEventListener('animationend', function xong(ev) {
        if (ev.target !== el) return;
        el.classList.remove('pd-len'); el.removeEventListener('animationend', xong);
      });
    });
  }, {threshold: .12, rootMargin: '0px 0px -6% 0px'}) : null;
  function quetThe(ds) {
    if (!ioT) return;
    ds.forEach(function (n) {
      if (n.nodeType !== 1 && n.nodeType !== 9) return;
      var tim = n.matches && n.matches(SEL_THE) ? [n] : [];
      if (n.querySelectorAll) tim = tim.concat([].slice.call(n.querySelectorAll(SEL_THE)));
      tim.forEach(function (el) {
        if (el.classList.contains('pd-the')) return;
        el.classList.add('pd-the', 'pd-cho'); ioT.observe(el);
      });
    });
  }

  /* =====================================================================
     #260 CÂU LỚN TÔ ĐẬM THEO CUỘN — chỉ lấy câu ĐÃ CÓ trên trang (đọc từ chính trang, không viết câu mới).
     #394 DẢI CHỮ TRÔI — từ khoá đúng chủ đề trang.
     Cả hai đặt cuối nội dung trang, ngay trước chân trang.
     ===================================================================== */
  function timCau(goc, re) {   // phần tử nhỏ nhất trong goc có chữ khớp re → câu chứa chỗ khớp
    var ds = [].slice.call(document.querySelectorAll(goc)), tot = '';
    ds.forEach(function (g) {
      [g].concat([].slice.call(g.querySelectorAll('p,li'))).forEach(function (el) {   // chỉ đoạn văn / dòng liệt kê, bỏ tiêu đề ngắn
        var t = gon(el.textContent);
        if (t.length > 24 && re.test(t) && (!tot || t.length < tot.length)) tot = t;
      });
    });
    if (!tot) return '';
    var cau = tot.match(/[^.!?]+[.!?]*/g) || [tot];
    for (var i = 0; i < cau.length; i++) if (re.test(cau[i])) return gon(cau[i]);
    return '';
  }
  var CAU = {
    'chinh-sach': ['#csNoi', /quay video/i],
    'cam-nang': ['#cnGiuNgoc', /Ngọc đẹp nhất/i],
    'lien-he': ['.lh-meo', /ánh sáng tự nhiên/i],
    've-ngoc-tram': ['.vnt-gt [data-nd="cc.doan"]', /chọn tay|ảnh thật/i],
    'qua-tang': ['#qtDv', /đóng hộp/i],
    'chon-size': ['.tp-dau .dan', /vừa tay/i]
  };
  function dongNgoc() {
    var t = [].map.call(document.querySelectorAll('#cnNgoc .ngoc-the b'), function (b) { return gon(b.textContent); }).filter(Boolean);
    return t.length >= 3 ? t : ['Phỉ thuý', 'Lam băng', 'Lục đế', 'Hoà điền', 'Ngọc bích', 'Trầm hương'];
  }
  var TROI = {
    'chinh-sach': function () { return [['Giao hàng', 'Thanh toán', 'Đổi trả', 'Bảo hành', 'Bảo mật thông tin'], ['Giao toàn quốc', 'Đóng hộp chống sốc', 'Video món trước khi gửi', 'Mỗi món một mã']]; },
    'cam-nang': function () { return [dongNgoc(), ['Giữ ngọc', 'Giữ trầm', 'Charm vàng', 'Đo cỡ tay', 'Xem ảnh thật']]; },
    'lien-he': function () { return [['Ghé cửa hàng', 'Xem ngọc tận tay', 'Ánh sáng tự nhiên', 'Đo size tại cửa hàng'], ['Zalo', 'Messenger', 'Facebook', 'Instagram', 'TikTok']]; },
    've-ngoc-tram': function () { return [['Phỉ thuý', 'Trầm hương', 'Charm vàng', 'Mỗi món một mã', 'Ảnh thật'], ['Chọn ngọc', 'Phối charm vàng', 'Đóng hộp & gửi đi']]; },
    'qua-tang': function () { return [['Chọn quà theo ngân sách', 'Charm vàng làm quà kèm', 'Đóng hộp cẩn thận'], ['Phỉ thuý', 'Trầm hương', 'Charm vàng', 'Thiết kế chuỗi riêng']]; },
    'chon-size': function () { return [['Chuỗi & vòng tay', 'Chuỗi quấn nhiều vòng', 'Nhẫn', 'Khuyên tai & mặt dây'], ['Thước dây', 'Cỡ tay', 'Chu vi ngón', 'Đường kính nhẫn', 'Số hạt']]; }
  };

  function cauLon(cau) {
    var tu = cau.split(' ').filter(Boolean), n = tu.length, vang = 0;
    for (var i = n - 1; i >= 0 && vang < 3; i--) { if (tu[i] === '—') break; vang++; }
    var sec = document.createElement('section'); sec.className = 'pd-cau';
    sec.innerHTML = '<div class="khung"><p>' + tu.map(function (w, i) {
      return '<span class="pd-w' + (i >= n - vang ? ' vang' : '') + '">' + esc(w) + '</span>';
    }).join(' ') + '</p></div>';
    MAIN.appendChild(sec);
    var p = sec.querySelector('p'), ds = [].slice.call(p.children), sang = -1, hen = 0, thay = !CO_IO;
    function cap() {
      hen = 0;
      var r = p.getBoundingClientRect(), vh = innerHeight;
      var t = kep((vh * .86 - r.top) / (vh * .4 + r.height), 0, 1), on = Math.round(t * ds.length);
      if (on === sang) return;
      ds.forEach(function (w, i) { w.classList.toggle('on', i < on); });
      sang = on;
    }
    if (GIAM_) { ds.forEach(function (w) { w.classList.add('on'); }); return; }
    if (CO_IO) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; if (thay) cap(); }, {rootMargin: '10% 0px'}).observe(sec);
    addEventListener('scroll', function () { if (thay && !hen) hen = requestAnimationFrame(cap); }, {passive: true});
    addEventListener('resize', function () { sang = -1; cap(); });
    cap();
  }

  function daiTroi(hang) {
    hang = hang.concat([['Ngọc Trầm']]);   // hàng thứ ba: tên cửa hàng, chữ viền mảnh (ẩn trên điện thoại)
    var sec = document.createElement('section'); sec.className = 'pd-troi'; sec.setAttribute('aria-hidden', 'true');
    sec.innerHTML = hang.map(function (ds, i) {
      return '<div class="pd-hang h' + (i + 1) + '"><div class="pd-ray"><span class="pd-ban">' + ds.map(function (t) { return '<span>' + esc(t) + '</span><i></i>'; }).join('') + '</span></div></div>';
    }).join('');
    MAIN.appendChild(sec);
    var hangs = [].slice.call(sec.querySelectorAll('.pd-hang')).map(function (el, i) {
      return {el: el, ray: el.firstChild, ban: el.firstChild.firstChild, w: 0, x: 0, dir: i % 2 ? 1 : -1, v: 24 + i * 5};
    });
    function doKich() {
      var vw = sec.clientWidth || innerWidth;
      hangs.forEach(function (h, i) {
        if (!h.el.offsetParent && getComputedStyle(h.el).display === 'none') { h.w = 0; return; }
        var ban = h.ban; h.w = ban.getBoundingClientRect().width; if (!h.w) return;
        var can = Math.ceil(vw / h.w) + 1, co = h.ray.children.length;
        for (; co < can; co++) h.ray.appendChild(ban.cloneNode(true));
        if (!h.x) h.x = -h.w * (.18 + i * .27);
        dat(h);
      });
    }
    function dat(h) {
      if (!h.w) return;
      h.x = ((h.x % h.w) + h.w) % h.w - h.w;
      h.ray.style.transform = 'translate3d(' + h.x.toFixed(2) + 'px,0,0)';
    }
    doKich();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(doKich);
    addEventListener('resize', doKich);
    if (GIAM_) return;   // giảm chuyển động: chữ đứng yên
    var thay = !CO_IO, raf = 0, tr = 0, yCu = scrollY, toc = 0, z = zoom();
    function buoc(bay) {
      raf = 0;
      var dt = tr ? Math.min(.05, (bay - tr) / 1000) : .016; tr = bay;
      var dy = scrollY - yCu; yCu = scrollY;
      toc += (kep(dy, -90, 90) - toc) * .12;   // tốc độ cuộn đã làm mượt (px / khung hình)
      hangs.forEach(function (h) { h.x += h.dir * (h.v * z * dt + toc * 1.3); dat(h); });
      if (thay) raf = requestAnimationFrame(buoc);
    }
    if (CO_IO) new IntersectionObserver(function (es) {
      thay = es[0].isIntersecting;
      if (thay && !raf) { tr = 0; yCu = scrollY; z = zoom(); raf = requestAnimationFrame(buoc); }
    }, {rootMargin: '8% 0px'}).observe(sec);
    else raf = requestAnimationFrame(buoc);
  }

  /* =====================================================================
     #211 KHUNG "CẦN TƯ VẤN?" Ở CHÂN TRANG — chỉ trang phụ, giỏ hàng, tài khoản
     ===================================================================== */
  function khungTuVan() {
    var tren = document.querySelector('footer.lh .tren');
    if (!tren || !(B.classList.contains('trang-phu') || TRANG === 'gio-hang' || TRANG === 'tai-khoan')) return;
    tren.classList.add('pd-lh');
    tren.insertAdjacentHTML('afterbegin', '<i class="pd-lh-luoi" aria-hidden="true"></i><i class="pd-lh-vien" aria-hidden="true"><i></i></i>');
    if (!GIAM_ && CO_IO) new IntersectionObserver(function (es) { tren.classList.toggle('pd-chay', es[0].isIntersecting); }).observe(tren);
    else if (!GIAM_) tren.classList.add('pd-chay');
  }

  /* =====================================================================
     KHỞI ĐỘNG
     ===================================================================== */
  [].forEach.call(document.querySelectorAll(SEL_H1), tachH1);
  [].forEach.call(document.querySelectorAll('.tp-dau,.ch-dau2,.si-dau,.tk-dau'), luoiCham);
  if (CAU[TRANG]) {
    var c = timCau(CAU[TRANG][0], CAU[TRANG][1]);
    if (c) cauLon(c);
  }
  if (TROI[TRANG]) daiTroi(TROI[TRANG]());
  khungTuVan();
  quetThe([document]);

  /* h1 / thẻ được dựng hoặc đổi sau (lọc cửa hàng, mục sỉ, giỏ hàng, tài khoản, dữ liệu tải xong) */
  if (window.MutationObserver) {
    var mo = new MutationObserver(function (rs) {
      var h1s = [], moi = [];
      function themH(h) { if (h && h.matches && h.matches(SEL_H1) && h1s.indexOf(h) < 0) h1s.push(h); }
      rs.forEach(function (r) {
        var t = r.target.nodeType === 1 ? r.target : r.target.parentNode;
        if (t && t.closest) themH(t.closest('h1'));
        [].forEach.call(r.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          moi.push(n);
          if (n.tagName === 'H1') themH(n); else if (n.querySelectorAll) [].forEach.call(n.querySelectorAll('h1'), themH);
        });
      });
      if (!h1s.length && !moi.length) return;
      mo.disconnect();
      try { h1s.forEach(tachH1); quetThe(moi); }
      finally { mo.observe(MAIN, {childList: true, subtree: true, characterData: true}); }
    });
    mo.observe(MAIN, {childList: true, subtree: true, characterData: true});
  }
})();
