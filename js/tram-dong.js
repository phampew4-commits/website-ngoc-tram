/* Trang Trầm hương — hiệu ứng lucianlabs đợt 2. CSS: css/tram-dong.css
   Chạy sau js/tram-huong.js. Thẻ sản phẩm dựng xong trong taiTramDot.then() của tram-huong.js → hàm then() ở đây đăng ký sau nên chạy sau.
   #349 ảnh thẻ vỡ ô vuông sang ảnh thật kế tiếp · #461 thẻ nghiêng + vệt sáng · #251 thẻ nổi lên so le theo cột
   #260 câu "Khoảnh khắc" tô màu theo cuộn · #426 dải số thật đếm lên · #211 khối kết: lưới mờ + viền sáng quanh nút
   #231 các bước "Nhà làm" dựng từ nghiêng về phẳng · #424 hỏi đáp mở/đóng mượt · #281 bút dạ quang lướt qua lưu ý an toàn
   Không đụng figure .th-gt-anh (mô hình 3D dùng). */
(function () {
  var html = document.documentElement;
  var CHUP = /[?&]chup=1/.test(location.search);
  var GIAM = CHUP || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHUOT = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var R = Math.random;
  function trong(g, s) { return [].slice.call((g || document).querySelectorAll(s)); }
  function kep(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  var coIO = 'IntersectionObserver' in window;

  /* ================= #426 DẢI SỐ THẬT (lấy từ data/tram-dot.json) =================
     Dựng khung ngay (chiều cao cố định, khỏi xô trang khi số về), điền số khi dữ liệu tải xong. */
  var gtri = document.querySelector('.th-gtri'), dai = null;
  if (gtri) {
    dai = document.createElement('section');
    dai.className = 'td-so';
    dai.setAttribute('aria-label', 'Trầm hương nhà làm hiện có trên trang');
    dai.innerHTML = '<div class="khung"><ul class="td-so-ds"></ul></div>';
    gtri.parentNode.insertBefore(dai, gtri.nextSibling);
  }
  function dungSo(ds) {
    var ul = dai.querySelector('ul');
    ul.innerHTML = ds.map(function (o, j) {
      var k = 0, so = String(o.so).split('').map(function (c) {
        if (!/\d/.test(c)) return '<span class="td-ky">' + e(c) + '</span>';
        var d = ''; for (var i = 0; i < 20; i++) d += '<i>' + (i % 10) + '</i>';
        return '<span class="td-cot" style="--d:' + c + ';--k:' + (k++) + '"><span class="td-dai">' + d + '</span></span>';
      }).join('');
      return '<li style="--o:' + j + '"><b class="td-so-so" aria-hidden="true">' + so + (o.don ? '<small>' + e(o.don) + '</small>' : '') + '</b>' +
        '<span class="td-so-nhan" aria-hidden="true">' + e(o.nhan) + '</span><span class="td-an">' + e(o.doc) + '</span></li>';
    }).join('');
    if (GIAM || !coIO) { dai.classList.add('hien'); return; }
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { dai.classList.add('hien'); io.disconnect(); }
    }, {threshold: .35});
    io.observe(dai);
  }

  /* ================= #424 HỎI ĐÁP: bọc câu trả lời vào .tl để chung.js mở/đóng mượt cả hai chiều ================= */
  trong(document, '.th-hd details').forEach(function (d) {
    if (d.querySelector(':scope > .tl')) return;
    var tl = document.createElement('div'), vo = document.createElement('div');
    tl.className = 'tl'; tl.appendChild(vo);
    [].slice.call(d.childNodes).forEach(function (c) { if (c.nodeName !== 'SUMMARY') vo.appendChild(c); });
    d.appendChild(tl);
  });

  /* ================= #281 BÚT DẠ QUANG: lướt qua vài lưu ý an toàn (chữ có sẵn trên trang) ================= */
  var CAN_TO = ['Không để trầm cháy khi không có người trông', 'để xa tầm tay trẻ nhỏ và thú cưng', 'đợi nguội hẳn'];
  var toS = [];
  trong(document, '.th-dung-ds li').forEach(function (li) {
    if (!CAN_TO.some(function (cau) { return li.textContent.indexOf(cau) >= 0; })) return;
    /* li là lưới (số thứ tự + chữ): gom chữ vào một span để phần tô màu không bị tách thành ô lưới riêng */
    var bo = document.createElement('span'); bo.className = 'td-to-dong';
    while (li.firstChild) bo.appendChild(li.firstChild);
    li.appendChild(bo);
    CAN_TO.forEach(function (cau) {
      trong(li, '*').concat([li]).some(function (el) {
        return [].slice.call(el.childNodes).some(function (n) {
          if (n.nodeType !== 3) return false;
          var i = n.textContent.indexOf(cau); if (i < 0) return false;
          var sau = n.splitText(i); sau.splitText(cau.length);
          var m = document.createElement('mark'); m.className = 'td-to'; m.style.setProperty('--k', toS.length);
          sau.parentNode.replaceChild(m, sau); m.appendChild(sau); toS.push(m); return true;
        });
      });
    });
  });
  if (toS.length) {
    if (GIAM || !coIO) toS.forEach(function (m) { m.classList.add('hien'); });
    else {
      var ioTo = new IntersectionObserver(function (es) {
        es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('hien'); ioTo.unobserve(x.target); } });
      }, {rootMargin: '0px 0px -22% 0px'});
      toS.forEach(function (m) { ioTo.observe(m); });
    }
  }

  /* ================= #211 KHỐI KẾT: lưới mờ + vệt sáng quay sau nút, viền sáng vàng chạy quanh khung nút ================= */
  var ket = document.querySelector('.th-ket');
  if (ket) {
    var luoi = document.createElement('div'); luoi.className = 'td-luoi'; luoi.setAttribute('aria-hidden', 'true');
    luoi.innerHTML = '<i class="td-tia"></i>';
    ket.insertBefore(luoi, ket.firstChild);
    var nutK = ket.querySelector('.th-ket-nut'); if (nutK) nutK.classList.add('td-vien');
    if (coIO) new IntersectionObserver(function (es) { ket.classList.toggle('td-chay', es[0].isIntersecting); }).observe(ket);
    else ket.classList.add('td-chay');
  }

  /* ================= #260 CÂU "KHOẢNH KHẮC" TÔ MÀU DẦN THEO CUỘN ================= */
  var keH = document.querySelector('.th-ke .th-ke-chu'), tuK = [];
  if (keH && !GIAM) {
    (function tach(nut) {
      [].slice.call(nut.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return;
            if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
            var s = document.createElement('span'); s.className = 'td-tu'; s.textContent = w;
            if (c.parentNode.closest('em')) s.classList.add('td-nhan');
            f.appendChild(s); tuK.push({el: s, on: false});
          });
          nut.replaceChild(f, c);
        } else if (c.nodeType === 1 && c.namespaceURI !== 'http://www.w3.org/2000/svg') tach(c);
      });
    })(keH);
    keH.classList.add('td-to-mau');
  }

  /* ================= #231 CÁC BƯỚC "NHÀ LÀM" DỰNG TỪ NGHIÊNG VỀ PHẲNG ================= */
  var buoc = document.querySelector('.th-nha .th-buoc'), dungCu = -1;
  if (buoc && !GIAM) buoc.classList.add('td-dung');

  /* một vòng rAF chung cho #260 + #231, chỉ chạy khi một trong hai đang gần màn hình */
  var gan = {ke: false, buoc: false}, cho = 0;
  function khung() {
    cho = 0;
    var vh = innerHeight;
    if (gan.ke && tuK.length) {
      var r = keH.getBoundingClientRect(), p = kep((vh * .85 - r.top) / Math.max(1, vh * .47 + r.height * .5)), N = tuK.length;
      tuK.forEach(function (t, i) {
        var on = p * (N + 1) > i + .5;
        if (on !== t.on) { t.on = on; t.el.classList.toggle('td-do', on); }
      });
    }
    if (gan.buoc) {
      var rb = buoc.getBoundingClientRect(), q = kep((vh * 1.02 - rb.top) / (vh * .55));
      q = Math.round(q * q * (3 - 2 * q) * 400) / 400;
      if (q !== dungCu) { dungCu = q; buoc.style.setProperty('--dung', q); }
    }
  }
  function hen() { if (!cho && (gan.ke || gan.buoc)) cho = requestAnimationFrame(khung); }
  if (!GIAM) {
    addEventListener('scroll', hen, {passive: true});
    addEventListener('resize', hen);
    if (coIO) {
      var ioG = new IntersectionObserver(function (es) {
        es.forEach(function (x) { gan[x.target === keH ? 'ke' : 'buoc'] = x.isIntersecting; });
        hen();
      }, {rootMargin: '120px 0px'});
      if (tuK.length) ioG.observe(keH);
      if (buoc) ioG.observe(buoc);
    } else { gan.ke = !!tuK.length; gan.buoc = !!buoc; hen(); }
  }

  /* ================= THẺ SẢN PHẨM (sau khi tram-huong.js dựng xong) ================= */
  if (typeof taiTramDot === 'undefined') return;
  taiTramDot.then(function () {
    var loai = (window.TD && TD.loai) || [], sp = {}, nSp = 0, nAnh = 0, giaTu = 0;
    loai.forEach(function (l) {
      (l.sp || []).forEach(function (s) {
        if (!s || !s.id || !s.ten) return;
        nSp++;
        var ds = [s.anh].concat(s.anhThem || []).filter(Boolean);
        nAnh += ds.length; sp[s.id] = ds;
        (s.quyCach || []).forEach(function (q) { var g = +(q && q.gia); if (g > 0 && (!giaTu || g < giaTu)) giaTu = g; });
      });
    });
    /* #426: chỉ số đếm được từ dữ liệu */
    if (dai) {
      var so = [];
      if (loai.length) so.push({so: loai.length, nhan: 'dòng trầm nhà làm', doc: loai.length + ' dòng trầm nhà làm'});
      if (nSp) so.push({so: nSp, nhan: 'sản phẩm đang có', doc: nSp + ' sản phẩm đang có'});
      if (nAnh) so.push({so: nAnh, nhan: 'ảnh chụp sản phẩm thật', doc: nAnh + ' ảnh chụp sản phẩm thật'});
      if (giaTu) so.push({so: giaTu.toLocaleString('vi-VN'), don: 'đ', nhan: 'giá từ', doc: 'Giá từ ' + giaTu.toLocaleString('vi-VN') + ' đồng'});
      if (so.length >= 2) { dai.style.setProperty('--n', so.length); dungSo(so); } else dai.remove();
    }
    var the = trong(document, '.th-sp');
    xepCot(); addEventListener('resize', function () { clearTimeout(xepCot._h); xepCot._h = setTimeout(xepCot, 150); });
    if (!CHUP) the.forEach(function (t) { ganAnh(t, sp[t.dataset.sp] || []); });
    if (CHUOT && !GIAM) the.forEach(ganNghieng);
  });

  /* ---------- #251: thẻ trong cùng một hàng nổi lên lần lượt từ cột trái (đặt --i theo cột thật, không theo số thứ tự) ---------- */
  function xepCot() {
    trong(document, '[data-ds]').forEach(function (ds) {
      var cs = trong(ds, ':scope > .th-sp'), ngang = ds.classList.contains('th-hang');
      var hang = {};
      cs.forEach(function (c) { var k = Math.round(c.offsetTop / 8); (hang[k] = hang[k] || []).push(c); });
      Object.keys(hang).forEach(function (k) {
        hang[k].sort(function (a, b) { return a.offsetLeft - b.offsetLeft; }).forEach(function (c, i) {
          if (!c.classList.contains('hien')) c.style.setProperty('--i', ngang ? Math.min(i, 3) : i);
        });
      });
    });
  }

  /* ---------- #461: nghiêng theo chuột + vệt sáng lướt (chỉ máy có chuột) ---------- */
  function ganNghieng(t) {
    var sang = document.createElement('span'); sang.className = 'td-sang'; sang.setAttribute('aria-hidden', 'true');
    t.appendChild(sang);
    var cho = 0, ev = null, r = null;
    function ve() {
      cho = 0; if (!ev || !r) return;
      var nx = kep((ev.clientX - r.left) / r.width), ny = kep((ev.clientY - r.top) / r.height);
      var max = Math.max(1.2, Math.min(5, 1500 / r.width));   // thẻ càng rộng càng nghiêng ít
      t.style.setProperty('--ry', ((nx - .5) * 2 * max).toFixed(2) + 'deg');
      t.style.setProperty('--rx', ((.5 - ny) * 2 * max * .8).toFixed(2) + 'deg');
      t.style.setProperty('--gx', (nx * 100).toFixed(1) + '%');
      t.style.setProperty('--gy', (ny * 100).toFixed(1) + '%');
    }
    t.addEventListener('pointerenter', function (e2) { if (e2.pointerType !== 'mouse') return; r = t.getBoundingClientRect(); t.classList.add('td-ng'); });
    t.addEventListener('pointermove', function (e2) {
      if (e2.pointerType !== 'mouse') return;
      ev = e2; if (!r) r = t.getBoundingClientRect();
      if (!cho) cho = requestAnimationFrame(ve);
    });
    t.addEventListener('pointerleave', function () {
      r = null; ev = null; t.classList.remove('td-ng');
      t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg');
    });
    addEventListener('scroll', function () { r = null; }, {passive: true});
  }

  /* ---------- #349: ảnh thẻ vỡ thành ô vuông nhỏ, từng ô bật ra thành ảnh thật kế tiếp ----------
     Máy tính: rê chuột vào thẻ → ảnh kế tiếp (vỡ từ chỗ con trỏ), giữ chuột trên ảnh thì cứ ~3 giây đổi tiếp.
     Điện thoại: thẻ nằm ở giữa màn hình hơn 1,2 giây → đổi, rồi cứ ~3,4 giây đổi tiếp khi thẻ còn ở đó.
     Ảnh tải lười: chỉ tải ảnh kế tiếp khi thẻ đã lên màn hình; vẽ bằng một canvas chỉ sống trong ~1 giây chuyển ảnh.
     Giảm chuyển động: rê chuột vẫn đổi ảnh nhưng đổi thẳng, điện thoại không tự đổi. */
  function ganAnh(t, ds) {
    var f = t.querySelector('.th-sp-anh'), img = f && f.querySelector('img');
    if (!img || ds.length < 2) return;
    var n = ds.length, dang = 0, ban = false, kho = {}, henT = 0;
    var cham = document.createElement('span'); cham.className = 'td-cham'; cham.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) cham.appendChild(document.createElement('i'));
    cham.firstChild.classList.add('on');
    f.appendChild(cham); f.classList.add('td-nhieu');
    function url(i) { return anh(ds[i], 600); }
    function tai(i) {
      if (kho[i]) return kho[i];
      return (kho[i] = new Promise(function (ok, hong) {
        var im = new Image();
        im.referrerPolicy = 'no-referrer'; im.decoding = 'async';
        im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(function () { ok(im); }); };
        im.onerror = function () { delete kho[i]; hong(); };
        im.src = url(i);
      }));
    }
    function danhDau(i) { [].forEach.call(cham.children, function (c, j) { c.classList.toggle('on', j === i); }); }
    function doi(ox, oy) {
      if (ban) return;
      var toi = (dang + 1) % n;
      ban = true;
      tai(toi).then(function (im) {
        if (!t.isConnected) return;
        danhDau(toi);
        var xong = function () {
          img.src = url(toi); img.alt = t.dataset.ten + ' — ảnh ' + (toi + 1) + '/' + n;
          var bo = function () { var c = f.querySelector('.td-vo'); if (c) c.remove(); dang = toi; ban = false; tai((toi + 1) % n).catch(function () {}); };
          (img.decode ? img.decode() : Promise.resolve()).then(bo, bo);
        };
        if (GIAM) xong(); else vo(f, img, im, ox, oy, xong);
      }, function () { ban = false; });
    }
    if (CHUOT) {
      var lap = function () { clearTimeout(henT); henT = setTimeout(function () { doi(f.clientWidth / 2, f.clientHeight / 2); lap(); }, 3000); };
      t.addEventListener('pointerenter', function (ev) {
        if (ev.pointerType === 'touch') return;
        var r = f.getBoundingClientRect();
        doi(Math.max(0, Math.min(r.width, ev.clientX - r.left)), Math.max(0, Math.min(r.height, ev.clientY - r.top)));
      });
      f.addEventListener('pointerenter', function (ev) { if (ev.pointerType !== 'touch' && !GIAM) lap(); });
      f.addEventListener('pointerleave', function () { clearTimeout(henT); });
    }
    if (coIO) {
      /* tải trước đúng một ảnh kế tiếp khi thẻ đã lên màn hình (sau khi trang tải xong) */
      var ioT = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        ioT.disconnect();
        var di = function () { tai(1).catch(function () {}); };
        if (document.readyState === 'complete') setTimeout(di, 400); else addEventListener('load', function () { setTimeout(di, 400); });
      }, {rootMargin: '100px'});
      ioT.observe(f);
      if (!CHUOT && !GIAM) {
        var giua = false;
        var tuDoi = function (lan) {
          clearTimeout(henT);
          henT = setTimeout(function () {
            if (!giua || document.hidden) return;
            var r = f.getBoundingClientRect();
            var cy = (r.top + r.bottom) / 2;   // tâm ảnh ở quãng giữa màn hình; thẻ trong hàng vuốt ngang phải nằm trọn bề ngang
            if (cy > innerHeight * .2 && cy < innerHeight * .72 && r.left >= -8 && r.right <= innerWidth + 8) doi(r.width / 2, r.height / 2);
            tuDoi(3400);
          }, lan);
        };
        new IntersectionObserver(function (es) {
          giua = es[0].isIntersecting;
          if (giua) tuDoi(1200); else clearTimeout(henT);
        }, {rootMargin: '-36% 0px -36% 0px'}).observe(f);
      }
    }
  }
  /* vẽ chuyển ảnh: lưới ô vuông ~30px, mỗi ô bật ra (to dần + hơi vượt) theo khoảng cách tới điểm bắt đầu, viền vàng mảnh lúc đang bật */
  function vo(f, img, im, ox, oy, xong) {
    var W = f.clientWidth, H = f.clientHeight;
    if (!W || !H || !im.naturalWidth) { xong(); return; }
    var cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    if (!ctx) { xong(); return; }
    var dpr = Math.min(2, devicePixelRatio || 1);
    cv.className = 'td-vo'; cv.setAttribute('aria-hidden', 'true');
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    img.parentNode.insertBefore(cv, img.nextSibling);
    var nw = im.naturalWidth, nh = im.naturalHeight, k = Math.max(W / nw, H / nh), bx = (W - nw * k) / 2, by = (H - nh * k) / 2;
    var C = Math.max(5, Math.min(16, Math.round(W / 30))), Rw = Math.max(4, Math.min(16, Math.round(H / 30))), cw = W / C, ch = H / Rw;
    var o = [], xa = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy)) || 1;
    for (var y = 0; y < Rw; y++) for (var x = 0; x < C; x++) {
      var d = Math.hypot((x + .5) * cw - ox, (y + .5) * ch - oy);
      o.push({x: x * cw, y: y * ch, t: d / xa * 520 + R() * 170});
    }
    var DUR = 380, t0 = performance.now();
    var nay = function (p) { var c = 1.6, q = p - 1; return 1 + (c + 1) * q * q * q + c * q * q; };   // bật ra hơi quá rồi về đúng cỡ
    function buoc(now) {
      if (!cv.isConnected) return;
      var t = now - t0, het = true;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (var i = 0; i < o.length; i++) {
        var c = o[i], p = (t - c.t) / DUR;
        if (p < 1) het = false;
        if (p <= 0) continue;
        if (p > 1) p = 1;
        var s = nay(p), dw = cw * s + .7, dh = ch * s + .7, dx = c.x + (cw - dw) / 2, dy = c.y + (ch - dh) / 2;
        ctx.globalAlpha = Math.min(1, p * 2.2);
        ctx.drawImage(im, (c.x - bx) / k, (c.y - by) / k, (cw + .7) / k, (ch + .7) / k, dx, dy, dw, dh);
        if (p < 1) { ctx.globalAlpha = (1 - p) * .7; ctx.strokeStyle = '#d1ad66'; ctx.strokeRect(dx + .5, dy + .5, dw - 1, dh - 1); }
      }
      ctx.globalAlpha = 1;
      if (het) xong(); else requestAnimationFrame(buoc);
    }
    requestAnimationFrame(buoc);
  }
})();
