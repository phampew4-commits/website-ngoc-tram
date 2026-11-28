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

  /* ---------- #461: nghiêng nhẹ theo chuột (chỉ máy có chuột). 28/11: user chê vệt sáng lướt → đã bỏ, chỉ còn nghiêng ---------- */
  function ganNghieng(t) {
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
        if (GIAM) xong(); else mo(f, img, im, xong);
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
  /* chuyển ảnh: ảnh mới mờ dần hiện lên đè ảnh cũ (28/11: user chê kiểu vỡ ô vuông #349 → thay bằng mờ dần) */
  function mo(f, img, im, xong) {
    var o = document.createElement('img');
    o.className = 'td-vo'; o.alt = ''; o.setAttribute('aria-hidden', 'true'); o.referrerPolicy = 'no-referrer'; o.src = im.src;
    img.parentNode.insertBefore(o, img.nextSibling);
    if (!o.animate) { xong(); return; }
    o.animate([{opacity: 0}, {opacity: 1}], {duration: 700, easing: 'ease-in-out'}).onfinish = xong;
  }
  /* (cũ, không dùng) vẽ chuyển ảnh: lưới ô vuông ~30px, mỗi ô bật ra (to dần + hơi vượt) theo khoảng cách tới điểm bắt đầu, viền vàng mảnh lúc đang bật */
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

/* ================= DẢI 4 Ô GIÁ TRỊ (.th-gtri) SỐNG ĐỘNG HƠN (28/11: user thấy "đơn điệu") =================
   Biểu tượng vẽ nét xong thì mỗi cái có chuyển động riêng đúng ý nghĩa — chỉ chạy khi dải đang trên màn hình:
   nhà làm: khói ống khói bay lên · 6 dòng trầm: đầu nhang đỏ lửa + khói cuộn · giao toàn quốc: xe chạy nhún, bánh quay, vệt gió ·
   hỏi người làm: ba chấm đang gõ trong bong bóng. Quanh mỗi vòng có một cung vàng chạy chậm (#348 kiểu vòng quay), lúc hiện thì gợn một vòng toả ra. */
(function () {
  var g = document.querySelector('.th-gtri'); if (!g) return;
  var GIAM = /[?&]chup=1/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function them(svg, ten, tt) { var e = document.createElementNS(NS, ten); for (var k in tt) e.setAttribute(k, tt[k]); svg.appendChild(e); return e; }
  [].forEach.call(g.querySelectorAll('.th-gtri-o'), function (o, i) {
    var v = o.querySelector('.th-gtri-vong'), svg = v && v.querySelector('svg'); if (!svg) return;
    o.classList.add('tdg-' + i);
    var p = svg.querySelectorAll('path,circle');
    if (i === 0 && p[4]) p[4].classList.add('tdg-khoi');
    if (i === 1) {
      if (p[2]) p[2].classList.add('tdg-khoi'); if (p[3]) p[3].classList.add('tdg-khoi', 'tdg-k2');
      [[12, 15], [18, 11], [24, 13], [30, 17]].forEach(function (d, j) { them(svg, 'circle', {cx: d[0], cy: d[1], r: 1.1, class: 'tdg-lua', style: '--j:' + j}); });
    }
    if (i === 2) {
      var xe = document.createElementNS(NS, 'g'); xe.setAttribute('class', 'tdg-xe');
      [].slice.call(p).forEach(function (e) { xe.appendChild(e); });
      if (p[2]) p[2].classList.add('tdg-banh'); if (p[3]) p[3].classList.add('tdg-banh');
      svg.appendChild(xe);
      [[0, 17, -4], [-2, 22, -7], [0, 27, -3]].forEach(function (d, j) { them(svg, 'path', {d: 'M' + d[0] + ' ' + d[1] + 'h' + d[2], class: 'tdg-gio', style: '--j:' + j}); });
    }
    if (i === 3) [14, 20, 26].forEach(function (x, j) { them(svg, 'circle', {cx: x, cy: 19, r: 1.6, class: 'tdg-cham', style: '--j:' + j}); });
    var q = document.createElement('i'); q.className = 'tdg-quy'; q.setAttribute('aria-hidden', 'true'); q.style.setProperty('--i', i); v.appendChild(q);
    var s = document.createElement('i'); s.className = 'tdg-gon'; s.setAttribute('aria-hidden', 'true'); v.appendChild(s);
  });
  if (GIAM) { g.classList.add('tdg-tinh'); return; }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { g.classList.toggle('tdg-chay', es[0].isIntersecting); }, {threshold: .15}).observe(g);
  else g.classList.add('tdg-chay');
})();

/* ================= BỤI VÀNG LẤP LÁNH Ở CÁC PHẦN NỀN SÁNG — mã ở js/bui-vang.js (dùng chung với trang chủ) ================= */
(function () {
  if (!window.buiVang) return;
  [].slice.call(document.querySelectorAll('.th-ke,.th-dong:not(.toi),.th-nha,.th-can,.td-so')).forEach(function (s) { window.buiVang(s); });
})();

/* ================= HÌNH NÉT ĐẦU TRANG BIẾN HÌNH QUA 6 LOẠI TRẦM (28/11: user muốn nét vẽ 2D chuyển động thành các loại nhang nhà mình) =================
   Mỗi hình là ~13 nét (3 làn khói + thân), vẽ theo ảnh thật: có tăm (3 que trên đế đồng) · nụ (búp nhọn trên đĩa) · nhang vòng (cuộn tháp chuông treo móc)
   · trầm thiền (lư nhìn từ trên, sợi hình người ngồi) · không tăm (khay gỗ + nắp + ống) · răm trầm (lò xông hoa văn, đĩa răm).
   Mỗi nét lấy mẫu thành 90 điểm; đổi hình = từng điểm trượt sang chỗ mới (nét chảy, uốn thành hình kia), nét thừa thu về một điểm rồi tắt.
   Khói lượn liên tục. Tên dòng hiện dưới hình, bấm → tới dòng đó. Chỉ chạy khi đầu trang trên màn hình + tab hiện.
   Giảm chuyển động / ?chup=1: đứng yên ở hình đầu. Không lấy được điểm (trình duyệt cũ) → giữ hình nét cũ. */
(function () {
  var hop = document.querySelector('.th-hero-ve'), cu = hop && hop.querySelector('svg'); if (!hop || !cu) return;
  var GIAM = /[?&]chup=1/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg', M = 90, SO_K = 3, SO_THAN = 10;
  var KHOI = 'c-10-9 8-16 0-26s-14-18 2-28s14-22-4-34s-18-26 2-38s16-28 0-40', KHOI2 = 'c9-7 1-14 9-20s15-12 7-22s4-14 11-18', KHOI3 = 'c-11-5-4-14-14-19s-7-13 0-21';
  function k(x, y, t) { return 'M' + x + ' ' + y + t; }
  function elip(cx, cy, rx, ry) { return 'M' + (cx - rx) + ' ' + cy + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2 * rx + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + (-2 * rx) + ' 0'; }
  /* nhang vòng: xoắn ốc tháp chuông */
  var xoan = [], vt = 0;
  (function () { var vong = 10; for (var i = 0; i <= 420; i++) { var u = i / 420, a = u * vong * 6.2832 - 1.5708, rx = 5 + 76 * Math.pow(u, .85), y = 176 + 250 * u; xoan.push([150 + rx * Math.cos(a), y + rx * .16 * Math.sin(a)]); } vt = xoan[xoan.length - 1]; })();
  var TT = 'M78.00 130.50C76.00 130.52 70.00 130.78 66.00 130.60C62.00 130.42 57.25 130.25 54.00 129.40C50.75 128.55 48.08 127.23 46.50 125.50C44.92 123.77 44.17 121.00 44.50 119.00C44.83 117.00 46.50 114.70 48.50 113.50C50.50 112.30 53.50 111.68 56.50 111.80C59.50 111.92 63.00 113.03 66.50 114.20C70.00 115.37 73.83 117.20 77.50 118.80C81.17 120.40 85.00 122.50 88.50 123.80C92.00 125.10 95.33 126.17 98.50 126.60C101.67 127.03 104.83 127.07 107.50 126.40C110.17 125.73 112.82 124.27 114.50 122.60C116.18 120.93 117.42 118.43 117.60 116.40C117.78 114.37 116.93 112.10 115.60 110.40C114.27 108.70 111.37 107.67 109.60 106.20C107.83 104.73 105.53 103.37 105.00 101.60C104.47 99.83 105.47 97.60 106.40 95.60C107.33 93.60 109.77 91.77 110.60 89.60C111.43 87.43 111.90 84.73 111.40 82.60C110.90 80.47 109.40 78.50 107.60 76.80C105.80 75.10 102.97 73.67 100.60 72.40C98.23 71.13 95.23 70.50 93.40 69.20C91.57 67.90 90.07 66.40 89.60 64.60C89.13 62.80 90.97 60.37 90.60 58.40C90.23 56.43 88.90 54.10 87.40 52.80C85.90 51.50 83.43 50.53 81.60 50.60C79.77 50.67 77.57 51.80 76.40 53.20C75.23 54.60 74.63 57.03 74.60 59.00C74.57 60.97 76.37 63.10 76.20 65.00C76.03 66.90 75.20 68.87 73.60 70.40C72.00 71.93 68.77 72.50 66.60 74.20C64.43 75.90 61.80 78.30 60.60 80.60C59.40 82.90 59.07 85.73 59.40 88.00C59.73 90.27 61.00 92.60 62.60 94.20C64.20 95.80 66.67 97.00 69.00 97.60C71.33 98.20 74.23 98.17 76.60 97.80C78.97 97.43 81.40 96.47 83.20 95.40C85.00 94.33 86.57 92.73 87.40 91.40C88.23 90.07 88.07 88.07 88.20 87.40';
  var HINH = [
    {id: 'co-tam', so: '01', ten: 'Trầm có tăm', lua: [150, 232], k: [k(150, 230, KHOI), k(121, 268, 'c-8-8 6-14 0-22s-10-16 2-24s10-18-2-26'), k(183, 274, 'c8-8-5-13 1-21s9-15-2-23s-8-16 3-24')], than: [
      ['M148.4 462V233a1.6 1.6 0 0 1 3.2 0V462', ''], ['M144.6 462L119.6 272a1.6 1.6 0 0 1 3.2-.4L147.8 462', ''], ['M152.2 462L181.4 276a1.6 1.6 0 0 1 3.2.5L155.4 462', ''],
      ['M148.4 462V420h3.2V462', 'tre'], ['M144.6 462L139.1 420.2l3.2-.4L147.8 462', 'tre'], ['M152.2 462L158.7 420.5l3.2.5L155.4 462', 'tre'],
      [elip(150, 462, 40, 8), ''], ['M110 462v9c0 5 18 8 40 8s40-3 40-8v-9', ''], [elip(150, 461, 6, 2), 'tre']]},
    {id: 'nu-tram', so: '03', ten: 'Nụ trầm', lua: [150, 300], k: [k(150, 298, KHOI), k(154, 280, KHOI2), k(146, 262, KHOI3)], than: [
      ['M150 300C138 330 120 380 120 428c0 14 5 24 10 30h40c5-6 10-16 10-30c0-48-18-98-30-128Z', ''],
      ['M137 456c-3-38 3-96 11-150', 'tre'], ['M163 456c3-38-3-96-11-150', 'tre'],
      [elip(150, 462, 58, 10), ''], ['M92 462v4c0 6 26 11 58 11s58-5 58-11v-4', ''],
      ['M226 418c-6 12-12 30-12 46c0 6 1 10 3 13h18c2-3 3-7 3-13c0-16-6-34-12-46Z', ''], ['M44 468L86 456c5-1 8 4 6 8c-1 4-5 6-9 6L44 472Z', '']]},
    {id: 'nhang-vong', so: '05', ten: 'Nhang vòng', lua: vt, k: [k(vt[0], vt[1] - 2, KHOI), k(vt[0] + 3, vt[1] - 22, KHOI2), k(vt[0] - 4, vt[1] - 40, KHOI3)], than: [
      [xoan, ''], ['M150 476V160', 'tre'], ['M150 160c0-12 14-12 14-2', 'tre'], [elip(150, 470, 64, 9), ''], [elip(150, 470, 30, 4), 'tre']]},
    {id: 'tram-thien', so: '04', ten: 'Trầm thiền', lua: [145.4, 412.8], k: ['M146 412c16-3 32-1 42-12s8-26 20-36s20-24 10-40s8-28 0-42s-8-22 4-32', 'M212 300c8-8 2-15 9-22s10-14 3-22', 'M196 330c10-5 6-12 13-17'], than: [
      [{d: TT, tx: function (p) { return [(p.x - 81) * 1.55 + 150, (p.y - 90) * 1.55 + 350]; }}, 'tre'],
      [elip(150, 350, 96, 96), ''], [elip(150, 350, 80, 80), ''], ['M54 340a10 10 0 1 0 0 20', ''], ['M246 340a10 10 0 1 1 0 20', '']]},
    {id: 'khong-tam', so: '02', ten: 'Trầm không tăm', lua: [214, 405], k: [k(214, 402, KHOI), k(218, 380, KHOI2), k(210, 366, KHOI3)], than: [
      ['M72 414L226 386L234 394L80 422Z', ''], [elip(153, 404, 9, 3), 'tre'],
      ['M62 436L232 405L246 416L76 447Z', ''], ['M76 447L246 416V426L76 457Z', ''], ['M84 440L230 413', ''], ['M96 437L214 405', 'tre'],
      ['M92 470L196 452a6 6 0 0 1 2 11.8L94 481.8a6 6 0 0 1-2-11.8Z', ''], ['M178 455l2 11.8', 'tre']]},
    {id: 'ram-tram', so: '06', ten: 'Răm trầm', lua: [150, 384], k: [k(150, 378, KHOI), k(160, 372, KHOI2 + 's4-14 12-18'), k(140, 366, KHOI3)], than: [
      [elip(150, 392, 72, 14), ''], ['M78 392v62c0 9 32 16 72 16s72-7 72-16v-62', ''],
      ['M86 424l8 10l8-10l8 10l8-10l8 10l8-10l8 10l8-10l8 10l8-10l8 10l8-10l8 10l8-10l8 10l8-10', 'tre'],
      [elip(150, 386, 28, 6), 'tre'], ['M132 384l8-5l9 2l-4 5z', ''], ['M152 381l10-4l7 4l-8 4z', ''], ['M146 388l6-4l7 1l-3 4z', ''],
      ['M70 472h160', ''], ['M86 480h128', '']]}
  ];
  /* lấy mẫu điểm */
  var tam = document.createElementNS(NS, 'svg'); tam.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden'); tam.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tam);
  function mau(nguon) {
    if (Array.isArray(nguon)) {   // mảng điểm sẵn (xoắn ốc) → lấy lại đều M điểm
      var r = []; for (var i = 0; i < M; i++) { var f = i / (M - 1) * (nguon.length - 1), a = Math.floor(f), b = Math.min(nguon.length - 1, a + 1), q = f - a; r.push([nguon[a][0] + (nguon[b][0] - nguon[a][0]) * q, nguon[a][1] + (nguon[b][1] - nguon[a][1]) * q]); } return r;
    }
    var d = typeof nguon === 'string' ? nguon : nguon.d, tx = nguon.tx;
    var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); tam.appendChild(p);
    var L = p.getTotalLength(), ra = [];
    for (var j = 0; j < M; j++) { var pt = p.getPointAtLength(L * j / (M - 1)); ra.push(tx ? tx(pt) : [pt.x, pt.y]); }
    p.remove(); return ra;
  }
  try {
    HINH.forEach(function (h) {
      h.slot = [];
      for (var i = 0; i < SO_K; i++) h.slot.push({p: mau(h.k[i]), loai: 'k', o: 1});
      for (var j = 0; j < SO_THAN; j++) {
        var t = h.than[j];
        if (t) h.slot.push({p: mau(t[0]), loai: t[1], o: 1});
        else { var o = []; for (var m = 0; m < M; m++) o.push([h.lua[0], h.lua[1]]); h.slot.push({p: o, loai: '', o: 0}); }   // nét thừa: thu về một điểm, tắt
      }
    });
  } catch (er) { tam.remove(); return; }
  tam.remove();

  var MAU = {'': [233, 227, 214], tre: [209, 173, 102], k: [226, 206, 166]}, DAY = {'': .9, tre: 1.3, k: .7};
  var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'tdh-ve'); svg.setAttribute('viewBox', '0 0 300 520'); svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<circle class="tdh-nen" cx="150" cy="250" r="128"/><path class="tdh-nen" d="M40 486H260"/>';
  var duong = HINH[0].slot.map(function () { var p = document.createElementNS(NS, 'path'); svg.appendChild(p); return p; });
  var lua = document.createElementNS(NS, 'circle'); lua.setAttribute('class', 'tdh-lua'); lua.setAttribute('r', '2.2'); svg.appendChild(lua);
  var ten = document.createElement('a'); ten.className = 'tdh-ten'; ten.innerHTML = '<span></span><b></b>';
  hop.classList.add('tdh-co'); hop.appendChild(svg); hop.appendChild(ten);

  var dang = 0, toi = 1, k0 = 0, t = 0, pha = 'giu', bd = 0, GIU = 3400, DOI = 1900, chay = false, thay = true, truoc = 0;
  function datTen(h) { ten.href = '#' + h.id; ten.querySelector('span').textContent = h.so; ten.querySelector('b').textContent = h.ten; ten.setAttribute('aria-label', 'Xem dòng ' + h.ten); }
  function em(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function ve(q) {   // q: tiến độ đổi hình 0..1 (0 = đang ở hình dang)
    var A = HINH[dang], B = HINH[toi];
    for (var i = 0; i < duong.length; i++) {
      var a = A.slot[i], b = B.slot[i], tre = i * .035, e = em(Math.max(0, Math.min(1, (q - tre) / (1 - .035 * duong.length + .035 * 3))));
      if (q <= 0) e = 0; if (q >= 1) e = 1;
      var s = '', khoi = i < SO_K;
      for (var m = 0; m < M; m++) {
        var x = a.p[m][0] + (b.p[m][0] - a.p[m][0]) * e, y = a.p[m][1] + (b.p[m][1] - a.p[m][1]) * e;
        if (q > 0 && q < 1) { var song = Math.sin(e * Math.PI) * 6; x += Math.sin(m * .21 + i) * song; }   // lúc chảy: nét gợn nhẹ
        if (khoi && !GIAM) { var u = m / (M - 1); x += Math.sin(u * 7 - t * 1.6 + i * 2) * 4 * u; }   // khói lượn
        s += (m ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      var p = duong[i], ca = MAU[a.loai], cb = MAU[b.loai];
      p.setAttribute('d', s);
      p.style.stroke = 'rgb(' + [0, 1, 2].map(function (c) { return Math.round(ca[c] + (cb[c] - ca[c]) * e); }).join(',') + ')';
      p.style.strokeWidth = (DAY[a.loai] + (DAY[b.loai] - DAY[a.loai]) * e).toFixed(2);
      p.style.opacity = (a.o + (b.o - a.o) * e) * (khoi ? .55 : 1);
    }
    var ee = em(Math.max(0, Math.min(1, q)));
    lua.setAttribute('cx', (A.lua[0] + (B.lua[0] - A.lua[0]) * ee).toFixed(1)); lua.setAttribute('cy', (A.lua[1] + (B.lua[1] - A.lua[1]) * ee).toFixed(1));
  }
  function lap(now) {
    if (!thay || document.hidden) { chay = false; return; }
    var dt = Math.min(.05, (now - (truoc || now)) / 1000 || .016); truoc = now; t += dt;
    if (!bd) bd = now;
    var q = 0;
    if (pha === 'giu') { if (now - bd > GIU) { pha = 'doi'; bd = now; } }
    else { q = Math.min(1, (now - bd) / DOI); if (q > .5 && ten.dataset.i !== String(toi)) { ten.dataset.i = toi; ten.classList.remove('moi'); void ten.offsetWidth; ten.classList.add('moi'); datTen(HINH[toi]); }
      if (q >= 1) { dang = toi; toi = (toi + 1) % HINH.length; pha = 'giu'; bd = now; q = 0; } }
    ve(q); requestAnimationFrame(lap);
  }
  function batLai() { if (GIAM || chay || !thay || document.hidden) return; chay = true; truoc = 0; bd = 0; requestAnimationFrame(lap); }
  datTen(HINH[0]); ten.dataset.i = 0; ve(0);
  /* vẽ ra lần đầu: từng nét chạy dần */
  if (!GIAM && svg.animate) svg.animate([{opacity: 0, transform: 'translateY(12px)'}, {opacity: 1, transform: 'none'}], {duration: 1400, delay: 250, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards'});
  setTimeout(batLai, GIAM ? 0 : 1200);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; batLai(); }).observe(hop);
  document.addEventListener('visibilitychange', batLai);
  if (/[?&]chup=1/.test(location.search)) ve(0);
})();
