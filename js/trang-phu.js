/* =========================================================
   TRANG PHỤ: chọn size · chính sách · cẩm nang · liên hệ · về Ngọc Trầm
   Chữ chính sách, chăm sóc, liên hệ lấy từ cài đặt web (app › Quản trị web) — sửa ở app là các trang này đổi theo.
   ========================================================= */
var TRANG = document.body.dataset.trang;
var MUI_DI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function soVn(n) { return String(Math.round(n * 10) / 10).replace('.', ','); }
function theMeo(ds, so) {   // lưới thẻ mẹo: [{tieu, noi}]
  return (ds || []).map(function (x, i) {
    return '<div class="meo" data-hien style="--i:' + (i % 3) + '">' + (so ? '<span class="so">' + ('0' + (i + 1)).slice(-2) + '</span>' : '') +
      '<b>' + e(x.tieu) + '</b><p>' + e(x.noi) + '</p></div>';
  }).join('');
}

/* ---------- hiệu ứng chuyển động (ý từ thư viện lucianlabs) — CSS ở css/trang-phu-hu.css ---------- */
var IT = matchMedia('(prefers-reduced-motion: reduce)').matches;        // người dùng muốn ít chuyển động
var CHUOT = matchMedia('(hover: hover) and (pointer: fine)').matches;   // có chuột (máy tính)
function soZ() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1; }
function kep(x, a, b) { return Math.max(a, Math.min(b, x)); }
function khiThay(ds, fn, nguong) {   // gọi fn(el) một lần khi el cuộn vào màn hình
  ds = ds.filter(Boolean); if (!ds.length) return;
  if (!('IntersectionObserver' in window)) { ds.forEach(fn); return; }
  var o = new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) { o.unobserve(x.target); fn(x.target); } });
  }, {threshold: nguong || .5, rootMargin: '0px 0px -8% 0px'});
  ds.forEach(function (x) { o.observe(x); });
}
var SVG_MUI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* #392 nét bút vẽ tay: gạch chân / khoanh tròn — mỗi nét vẽ hai lần hơi run tay */
var NET_VE = {
  gach: ['0 0 200 12', ['M3 7.5C46 4 112 9.5 197 5', 'M10 10C70 7.5 140 11.2 192 8.4']],
  khoanh: ['0 0 200 60', ['M118 5C62 1 8 12 6 31c-2 19 52 27 104 25 52-2 88-12 86-29C194 9 150 2 84 8', 'M34 11C16 19 13 36 31 45']]
};
function veTay(el, kieu, tre) {
  if (!el) return; var n = NET_VE[kieu];
  el.classList.add('ve-tay', kieu);
  el.insertAdjacentHTML('beforeend', '<svg viewBox="' + n[0] + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
    n[1].map(function (d) { return '<path pathLength="1" d="' + d + '"/>'; }).join('') + '</svg>');
  khiThay([el], function () { setTimeout(function () { el.classList.add('ve'); }, tre || 0); }, .9);
}
/* #281 bút dạ quang quét lần lượt từng ý chính — câu dài quét lâu hơn, xuống dòng thì quét hết dòng trên rồi sang dòng dưới */
function quetDaQuang(hop, spans) {
  if (!hop || !spans.length) return;
  khiThay([hop], function () {
    var d = .15;
    spans.forEach(function (s) {
      var t = Math.min(1.3, .3 + s.textContent.length * .02);
      s.style.setProperty('--t', t + 's'); s.style.setProperty('--d', d + 's'); s.classList.add('ve'); d += t * .85;
    });
  }, .35);
}
function boDaQuang(el, re) {   // bọc đoạn chữ khớp re trong el bằng <span class="dq">
  var t = el.textContent, m = re.exec(t); if (!m) return null;
  el.innerHTML = e(t.slice(0, m.index)) + '<span class="dq">' + e(m[0]) + '</span>' + e(t.slice(m.index + m[0].length));
  return el.querySelector('.dq');
}

/* ---------- mục lục trong trang: bấm thì cuộn mượt, cuộn tới đâu sáng mục đó ---------- */
function canhMucLuc(sel) {
  var lk = $$(sel + ' a[href^="#"]'); if (!lk.length) return;
  var muc = lk.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  lk.forEach(function (a, i) {
    a.addEventListener('click', function (ev) { if (!muc[i]) return; ev.preventDefault(); cuonToi(muc[i]); history.replaceState(null, '', a.getAttribute('href')); });
  });
  function sang() {
    var k = 0;
    muc.forEach(function (m, i) { if (m && m.getBoundingClientRect().top < innerHeight * .35) k = i; });
    lk.forEach(function (a, i) { a.classList.toggle('on', i === k); });
  }
  addEventListener('scroll', sang, {passive: true}); sang();
  if (location.hash) { var m = document.getElementById(location.hash.slice(1)); if (m) setTimeout(function () { cuonToi(m); }, 350); }
}

/* ---------- #469 sổ tay lật trang: mẹo giữ ngọc in trong một cuốn sổ hai trang (máy tính).
   Bấm / kéo mép trang phải để lật tới, trang trái để lật lui; giấy cong có bóng và đổ bóng xuống trang dưới.
   Điện thoại hoặc khi bật giảm chuyển động: vẫn là lưới thẻ đọc bình thường. Mọi trang luôn nằm trong DOM theo đúng thứ tự
   nên trình đọc màn hình đọc đủ cả 7 mẹo, không phụ thuộc đang lật tới đâu. ---------- */
function soTay(hop, ds) {
  if (!hop) return; hop.innerHTML = ''; if (!ds.length) return;
  var mat = ds.map(function (x, i) {
    return '<span class="so">' + ('0' + (i + 1)).slice(-2) + '</span><b>' + e(x.tieu) + '</b><p>' + e(x.noi) + '</p><i class="st-tr" aria-hidden="true">' + (i + 1) + '</i>';
  });
  var n = Math.ceil(mat.length / 2), tong = mat.length, la = '';
  for (var k = 0; k < n; k++) la += '<div class="st-to"><div class="st-mat truoc">' + mat[2 * k] + '<i class="st-bong"></i></div>' +
    (mat[2 * k + 1] ? '<div class="st-mat sau">' + mat[2 * k + 1] + '<i class="st-bong"></i></div>'
                    : '<div class="st-mat sau trong" aria-hidden="true"><img src="img/hoa.png" alt=""><i class="st-bong"></i></div>') + '</div>';
  hop.innerHTML = '<div class="so-tay" data-hien role="group" aria-label="Sổ tay giữ ngọc">' +
    '<div class="st-sach">' +
      '<div class="st-bia" aria-hidden="true"><small>Sổ tay Ngọc Trầm</small><b>Giữ ngọc<br><em>luôn đẹp</em></b><span>Bấm vào trang bên phải<br>hoặc kéo mép giấy để lật</span></div>' +
      '<div class="st-cuoi"><small>Hết sổ tay</small><b>Còn điều gì<br><em>chưa rõ?</em></b><a href="' + linkZalo() + '" target="_blank" rel="noopener">Nhắn Zalo cho cửa hàng</a></div>' +
      la + '<i class="st-bc p"></i><i class="st-bc t"></i>' +
    '</div>' +
    '<div class="st-dieu"><button type="button" class="st-lui" aria-label="Lật về trang trước">' + SVG_MUI + '</button>' +
    '<span class="st-dem" aria-live="polite"></span><button type="button" class="st-toi" aria-label="Lật sang trang sau">' + SVG_MUI + '</button></div></div>';
  var st = hop.firstChild, sach = st.firstChild, to = [].slice.call(sach.querySelectorAll('.st-to')),
      lui = st.querySelector('.st-lui'), toi = st.querySelector('.st-toi'), dem = st.querySelector('.st-dem'),
      bcP = sach.querySelector('.st-bc.p'), bcT = sach.querySelector('.st-bc.t'), lat = 0, thu = 0, keo = null;
  var mq = matchMedia('(min-width: 900px)');
  function bat() { st.classList.toggle('lat-duoc', mq.matches && !IT); }
  bat(); if (mq.addEventListener) mq.addEventListener('change', bat); else mq.addListener(bat);
  function sapXep() {
    to.forEach(function (l, k) {
      l.style.zIndex = l._bay ? n + 5 + l._bay : (k < lat ? k + 1 : n - k + 1);
      l.classList.toggle('lat', k < lat);
      l.classList.toggle('tren-phai', k === lat && !l._bay); l.classList.toggle('tren-trai', k === lat - 1 && !l._bay);
    });
    lui.disabled = lat === 0; toi.disabled = lat === n;
    var so = [2 * lat, 2 * lat + 1].filter(function (x) { return x >= 1 && x <= tong; });
    dem.textContent = so.length ? 'Trang ' + so.join(' – ') + ' / ' + tong : 'Hết sổ tay';
  }
  function bay(k, tien) {   // lá k đang bay: nằm trên cùng cho tới khi đáp xuống
    var l = to[k]; l._bay = ++thu; l.classList.remove('dang-lat'); void l.offsetWidth; l.classList.add('dang-lat');
    var bc = tien ? bcP : bcT; bc.classList.add('on'); setTimeout(function () { bc.classList.remove('on'); }, 480);
    sapXep();
    clearTimeout(l._hen); l._hen = setTimeout(function () { l._bay = 0; l.classList.remove('dang-lat'); sapXep(); }, 980);
  }
  function lat1(huong) {
    var k = huong > 0 ? lat : lat - 1; if (k < 0 || k >= n) return;
    lat += huong; bay(k, huong > 0);
  }
  lui.addEventListener('click', function () { lat1(-1); });
  toi.addEventListener('click', function () { lat1(1); });
  st.addEventListener('keydown', function (ev) {
    if (!st.classList.contains('lat-duoc')) return;
    if (ev.key === 'ArrowRight') { lat1(1); ev.preventDefault(); } else if (ev.key === 'ArrowLeft') { lat1(-1); ev.preventDefault(); }
  });
  sach.addEventListener('pointerdown', function (ev) {
    if (!st.classList.contains('lat-duoc') || ev.button > 0 || ev.target.closest('a')) return;
    var r = sach.getBoundingClientRect(), phai = ev.clientX > r.left + r.width / 2, k = phai ? lat : lat - 1;
    if (k < 0 || k >= n) return;
    keo = {k: k, phai: phai, x0: ev.clientX, w: r.width / 2, g: phai ? 0 : -180, di: false, id: ev.pointerId};
  });
  sach.addEventListener('pointermove', function (ev) {
    if (!keo || ev.pointerId !== keo.id) return;
    var dx = ev.clientX - keo.x0, l = to[keo.k];
    if (!keo.di) {
      if (Math.abs(dx) < 6) return;
      keo.di = true; try { sach.setPointerCapture(ev.pointerId); } catch (er) {}
      l.classList.add('keo'); l._bay = ++thu; sapXep();
    }
    var t = kep((keo.phai ? -dx : dx) / (keo.w * 1.15), 0, 1);
    keo.g = keo.phai ? -180 * t : -180 + 180 * t;
    l.style.setProperty('--g', keo.g.toFixed(1) + 'deg');
    [].forEach.call(l.querySelectorAll('.st-bong'), function (b) { b.style.opacity = (Math.sin(t * Math.PI) * .9).toFixed(3); });
    (keo.phai ? bcP : bcT).classList.toggle('on', t > .05 && t < .7);
  });
  function tha() {
    if (!keo) return; var c = keo, l = to[c.k]; keo = null;
    if (!c.di) { lat1(c.phai ? 1 : -1); return; }   // chỉ bấm, không kéo: lật luôn
    [].forEach.call(l.querySelectorAll('.st-bong'), function (b) { b.style.opacity = ''; });
    bcP.classList.remove('on'); bcT.classList.remove('on');
    l.classList.remove('keo'); l.style.removeProperty('--g');   // giấy tự đáp về phía gần hơn
    if (c.phai && c.g < -90) lat++; else if (!c.phai && c.g > -90) lat--;
    sapXep(); clearTimeout(l._hen); l._hen = setTimeout(function () { l._bay = 0; sapXep(); }, 980);
  }
  sach.addEventListener('pointerup', tha); sach.addEventListener('pointercancel', tha);
  sapXep();
}

/* ================= CHỌN SIZE ================= */
if (TRANG === 'chon-size') (function () {
  var CO_HAT = [6, 8, 10, 12];   // ly ≈ mm
  var soHatVong = function (tay, ly) { return Math.max(16, Math.round((tay + 1.5) * 10 / ly)); };   // giống xưởng phối chuỗi
  function tinh() {
    var t = +$('#szTay').value;
    $('#szGt').textContent = soVn(t) + ' cm';
    $('#szKq').innerHTML = '<li><span>Chu vi chuỗi khi xâu</span><b>≈ ' + soVn(t + 1.5) + ' cm</b></li>' +
      CO_HAT.map(function (ly) { return '<li><span>Hạt ' + ly + ' ly</span><b>≈ ' + soHatVong(t, ly) + ' hạt</b></li>'; }).join('');
    $('#szTk').href = 'thiet-ke.html?t=' + t;
    $('#szTay').style.setProperty('--p', ((t - 12) / 8 * 100) + '%');
    $$('#szBang tbody tr').forEach(function (r) { r.classList.toggle('on', +r.dataset.t === Math.round(t)); });
  }
  $('#szBang').innerHTML = '<thead><tr><th>Cỡ tay</th><th>Chu vi chuỗi</th>' + CO_HAT.map(function (l) { return '<th>Hạt ' + l + ' ly</th>'; }).join('') + '</tr></thead><tbody>' +
    [13, 14, 15, 16, 17, 18, 19].map(function (t) {
      return '<tr data-t="' + t + '"><td>' + t + ' cm</td><td>' + soVn(t + 1.5) + ' cm</td>' + CO_HAT.map(function (l) { return '<td>' + soHatVong(t, l) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody>';
  $('#szTay').addEventListener('input', tinh); tinh();

  /* nhẫn: size Việt Nam, chu vi (mm) = size + 40 */
  var kieu = 'cv';
  $('#szBangNhan').innerHTML = '<thead><tr><th>Size</th><th>Chu vi ngón (mm)</th><th>Đường kính nhẫn (mm)</th></tr></thead><tbody>' +
    Array.apply(null, Array(15)).map(function (_, i) {
      var s = i + 6, cv = s + 40;
      return '<tr data-s="' + s + '"><td>' + s + '</td><td>' + cv + '</td><td>' + soVn(cv / Math.PI) + '</td></tr>';
    }).join('') + '</tbody>';
  function doiNhan() {
    var v = parseFloat(String($('#szMm').value).replace(',', '.')), ra = $('#szRa');
    $$('#szBangNhan tbody tr').forEach(function (r) { r.classList.remove('on'); });
    if (!v) { ra.innerHTML = '<small>Size nhẫn của bạn</small><b>—</b><span>Nhập số đo để xem</span>'; return; }
    var cv = kieu === 'cv' ? v : v * Math.PI, s = Math.ceil(cv - 40 - 0.25);
    if (s < 6 || s > 20) { ra.innerHTML = '<small>Size nhẫn của bạn</small><b>?</b><span>Số đo nằm ngoài bảng (size 6 – 20) — kiểm tra lại đơn vị mm nhé.</span>'; return; }
    ra.innerHTML = '<small>Size nhẫn của bạn</small><b>' + s + '</b><span>Chu vi ' + soVn(s + 40) + ' mm · đường kính ' + soVn((s + 40) / Math.PI) + ' mm</span>';
    var r = $('#szBangNhan tr[data-s="' + s + '"]'); if (r) r.classList.add('on');
  }
  $$('.sz-kieu button').forEach(function (b) {
    b.onclick = function () {
      kieu = b.dataset.kieu;
      $$('.sz-kieu button').forEach(function (x) { x.classList.toggle('on', x === b); });
      $('#szNhanNhan').textContent = kieu === 'cv' ? 'Chu vi ngón tay (mm)' : 'Đường kính trong của nhẫn (mm)';
      $('#szMm').placeholder = kieu === 'cv' ? 'Ví dụ 52' : 'Ví dụ 16,5';
      doiNhan();
    };
  });
  $('#szMm').addEventListener('input', doiNhan);
  canhMucLuc('.tp-muc-luc');

  /* #464 thước dây kéo ngang đo cỡ tay — kim giữa đứng yên, kéo / hất thước; nối thẳng vào ô #szTay (vẫn dùng phím mũi tên được)
     #017 bóng số phía trên nghiêng theo tốc độ kéo rồi bật về thẳng */
  (function () {
    var inp = $('#szTay'), hop = $('#szTinh'), bong = $('#szGt'); if (!inp || !hop) return;
    var MIN = +inp.min, MAX = +inp.max, BUOC = +inp.step || .5, DAU = MIN - 4, CUOI = MAX + 4;
    hop.classList.add('co-thuoc'); inp.classList.add('an-di');
    var th = document.createElement('div'); th.className = 'thuoc'; th.setAttribute('aria-hidden', 'true');
    th.innerHTML = '<div class="bang"></div><i class="kim"></i>';
    inp.parentNode.insertBefore(th, inp.nextSibling);
    th.insertAdjacentHTML('afterend', '<small class="thuoc-goi" aria-hidden="true">Kéo thước sang trái, phải để chọn cỡ tay</small>');
    var bang = th.firstChild, PX = 58;
    function veThuoc() {
      var z = soZ(); PX = 58 * z;
      var w = (CUOI - DAU) * PX, h = 60 * z, s = '';
      for (var i = 0; i <= (CUOI - DAU) * 10; i++) {
        var x = (i * PX / 10).toFixed(1), cm = i % 10 === 0, nua = i % 5 === 0;
        s += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="' + ((cm ? 26 : nua ? 17 : 9) * z).toFixed(1) + '" stroke="' + (cm ? '#1d3a46' : 'rgba(29,58,70,.5)') + '" stroke-width="' + (cm ? 1.4 : 1) + '"/>';
        if (cm) s += '<text x="' + x + '" y="' + (46 * z).toFixed(1) + '" text-anchor="middle" font-size="' + (14 * z).toFixed(1) + '" font-family="Lora,Georgia,serif" fill="' + (DAU + i / 10 >= MIN && DAU + i / 10 <= MAX ? '#1d3a46' : 'rgba(29,58,70,.35)') + '">' + (DAU + i / 10) + '</text>';
      }
      bang.style.width = w + 'px';
      bang.innerHTML = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + s + '</svg>';
    }
    var v = +inp.value, van = 0, dich = null, keo = null, raf = 0, last = 0, goc = 0, gocV = 0, tuThuoc = false;
    var lam = function (x) { return Math.round(x / BUOC) * BUOC; };
    function datViTri() { bang.style.transform = 'translate3d(' + (th.clientWidth / 2 - (v - DAU) * PX).toFixed(1) + 'px,0,0)'; }
    function datGiaTri() {
      var r = kep(lam(v), MIN, MAX);
      if (+inp.value !== r) { inp.value = r; tuThuoc = true; inp.dispatchEvent(new Event('input', {bubbles: true})); tuThuoc = false; }
    }
    function khung(now) {
      raf = 0;
      var dt = Math.min(.033, Math.max(.001, (now - last) / 1000)); last = now;
      if (!keo) {
        if (IT) { if (dich != null) v = dich; van = 0; }
        else if (dich == null) {                                   // trôi theo quán tính sau khi hất
          v += van * dt; van *= Math.pow(.03, dt);
          if (v < MIN || v > MAX) { v = kep(v, MIN - .4, MAX + .4); dich = kep(lam(v), MIN, MAX); }
          else if (Math.abs(van) < 1.5) dich = kep(lam(v + van * .12), MIN, MAX);
        } else {                                                   // lò xo hút về vạch gần nhất
          van += ((dich - v) * 160 - van * 19) * dt; v += van * dt;
          if (Math.abs(dich - v) < .002 && Math.abs(van) < .02) { v = dich; van = 0; }
        }
      }
      var nghieng = IT ? 0 : kep(van * 2.2, -13, 13);   // kéo thước sang trái thì bóng ngả sang phải (ngược hướng kéo)
      gocV += ((nghieng - goc) * 240 - gocV * 15) * dt; goc += gocV * dt;
      if (IT) { goc = 0; gocV = 0; }
      bong.style.transform = Math.abs(goc) > .01 ? 'rotate(' + goc.toFixed(2) + 'deg)' : '';
      datViTri(); datGiaTri();
      if (keo || Math.abs(van) > .02 || Math.abs(goc) > .03 || Math.abs(gocV) > .05 || (dich != null && v !== dich)) raf = requestAnimationFrame(khung);
    }
    function chay() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(khung); } }
    th.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      keo = {x0: ev.clientX, v0: v, lx: ev.clientX, lt: performance.now(), di: false, id: ev.pointerId};
      van = 0; dich = null; chay();
    });
    th.addEventListener('pointermove', function (ev) {
      if (!keo || ev.pointerId !== keo.id) return;
      var dx = ev.clientX - keo.x0;
      if (!keo.di) { if (Math.abs(dx) < 4) return; keo.di = true; th.classList.add('keo'); try { th.setPointerCapture(ev.pointerId); } catch (er) {} }
      var tho = keo.v0 - dx / PX;
      v = tho < MIN ? MIN - (MIN - tho) * .3 : tho > MAX ? MAX + (tho - MAX) * .3 : tho;   // ra quá đầu thước thì nặng tay
      var now = performance.now(), t = Math.max(.008, (now - keo.lt) / 1000);
      van = van * .6 + (-(ev.clientX - keo.lx) / PX / t) * .4; keo.lx = ev.clientX; keo.lt = now;
      chay();
    });
    function tha(ev) {
      if (!keo) return; var k = keo; keo = null; th.classList.remove('keo');
      if (!k.di) {   // chạm một cái: thước chạy tới vạch vừa chạm
        var r = th.getBoundingClientRect();
        dich = kep(lam(v + (ev.clientX - r.left - r.width / 2) / PX), MIN, MAX); van = 0;
      } else if (performance.now() - k.lt > 90) van = 0;   // dừng tay rồi mới thả: không trôi
      if (IT) dich = kep(lam(v), MIN, MAX);
      chay();
    }
    th.addEventListener('pointerup', tha); th.addEventListener('pointercancel', tha);
    inp.addEventListener('input', function () { if (tuThuoc) return; dich = +inp.value; van = 0; chay(); });   // phím mũi tên
    veThuoc(); datViTri();
    addEventListener('resize', function () { veThuoc(); datViTri(); });
  })();

  /* #013 nền trượt co giãn khi đổi kiểu đo nhẫn: dãn dài như dây chun rồi bật gọn vào ô mới */
  (function () {
    var k = $('.sz-kieu'); if (!k) return;
    var nen = document.createElement('i'); nen.className = 'nen'; nen.setAttribute('aria-hidden', 'true');
    k.insertBefore(nen, k.firstChild); k.classList.add('co-nen');
    var x0 = 0, w0 = 0;
    function dat(b, dong) {
      var x = b.offsetLeft, w = b.offsetWidth;
      if (dong && !IT && w0 && nen.animate) {
        var trai = Math.min(x0, x), rong = Math.max(x0 + w0, x + w) - trai;
        nen.animate([
          {transform: 'translateX(' + x0 + 'px)', width: w0 + 'px'},
          {transform: 'translateX(' + trai + 'px) scaleY(.8)', width: rong + 'px', offset: .45},
          {transform: 'translateX(' + x + 'px) scaleX(1.05) scaleY(.94)', width: w + 'px', offset: .75},
          {transform: 'translateX(' + x + 'px)', width: w + 'px'}
        ], {duration: 560, easing: 'cubic-bezier(.3,.7,.25,1)'});
      }
      nen.style.transform = 'translateX(' + x + 'px)'; nen.style.width = w + 'px'; x0 = x; w0 = w;
    }
    [].slice.call(k.querySelectorAll('button')).forEach(function (b) { b.addEventListener('click', function () { dat(b, true); }); });
    var lai = function () { var b = k.querySelector('button.on'); if (b) dat(b, false); };
    lai(); addEventListener('resize', lai); if (document.fonts) document.fonts.ready.then(lai);
  })();
})();

/* ================= CHÍNH SÁCH ================= */
if (TRANG === 'chinh-sach') (function () {
  var tt = CH.thanhToan || {}, cachTra = [];
  if (tt.ck !== false) cachTra.push('Chuyển khoản ngân hàng' + (tt.tenNganHang ? ' (' + tt.tenNganHang + ')' : '') + ' — số tài khoản và mã QR hiện ở bước đặt hàng.');
  if (tt.cod !== false) cachTra.push('Thanh toán khi nhận hàng (COD) — được kiểm tra hàng trước khi trả tiền.');
  if (tt.coc) cachTra.push('Với đơn giá trị cao, cửa hàng xin bạn cọc trước' + (tt.cocPhanTram ? ' ' + tt.cocPhanTram + '%' : '') + ' giá trị đơn.');
  cachTra.push('Miễn phí ship cho đơn từ 1.500.000đ đặt online và chuyển khoản trước toàn bộ.');
  var MUC = [
    {id: 'giao-hang', ten: 'Giao hàng', ds: CHINH_SACH.giao},
    {id: 'thanh-toan', ten: 'Thanh toán', ds: cachTra},
    {id: 'doi-tra', ten: 'Đổi trả', ds: CHINH_SACH.doi},
    {id: 'bao-hanh', ten: 'Bảo hành', ds: CHINH_SACH.bh},
    {id: 'charm-vang', ten: 'Lưu ý charm vàng', ds: CHINH_SACH.luuY},
    {id: 'bao-mat', ten: 'Bảo mật thông tin', ds: [
      'Ngọc Trầm chỉ hỏi những thông tin cần để giao hàng: họ tên, số điện thoại, địa chỉ nhận và email (nếu bạn tạo tài khoản).',
      'Thông tin chỉ dùng để xác nhận đơn, giao hàng, bảo hành và báo cho bạn về đơn đã đặt.',
      'Cửa hàng không bán hay chia sẻ thông tin của bạn cho bên khác, trừ đơn vị vận chuyển cần địa chỉ để giao hàng.',
      'Muốn sửa hoặc xoá thông tin của mình, bạn nhắn Zalo ' + (LIEN_HE.sdt || 'cho cửa hàng') + '.'
    ]}
  ].filter(function (m) { return m.ds && m.ds.length; });
  var HD = (ND.hoiDap || []).filter(function (x) { return x.hoi && x.dap; });   // hỏi đáp sửa ở app › Nội dung trang
  var dsMuc = MUC.concat(HD.length ? [{id: 'hoi-dap', ten: 'Hỏi nhanh'}] : []);
  $('#csMuc').innerHTML = '<span class="nho">Mục lục</span>' + dsMuc.map(function (m, i) { return '<a href="#' + m.id + '"><i>' + ('0' + (i + 1)).slice(-2) + '</i>' + m.ten + '</a>'; }).join('') +
    '<div class="cs-hoi"><b>Còn thắc mắc?</b><a href="' + linkZalo() + '" target="_blank" rel="noopener">Nhắn Zalo ' + e(LIEN_HE.sdt || '') + '</a></div>';
  $('#csNoi').innerHTML = MUC.map(function (m, i) {
    return '<section class="cs-phan" id="' + m.id + '" data-hien><span class="so-phan">' + ('0' + (i + 1)).slice(-2) + '</span><h2>' + m.ten + '</h2>' +
      '<ul class="ds-tp">' + m.ds.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul></section>';
  }).join('') +
    /* #044 hỏi đáp: bấm câu hỏi thì lời đáp mở mượt, nét dọc của dấu cộng nằm xuống thành dấu trừ; mỗi lần mở một câu */
    (HD.length ? '<section class="cs-phan" id="hoi-dap" data-hien><span class="so-phan">' + ('0' + dsMuc.length).slice(-2) + '</span><h2>Hỏi nhanh</h2><div class="hg">' +
      HD.map(function (x, i) {
        return '<div class="hg-muc"><h3><button type="button" class="hg-hoi" id="hgh' + i + '" aria-expanded="false" aria-controls="hgd' + i + '"><span>' + e(x.hoi) + '</span><i class="hg-cong" aria-hidden="true"></i></button></h3>' +
          '<div class="hg-dap" id="hgd' + i + '" role="region" aria-labelledby="hgh' + i + '"><div><p>' + e(x.dap).replace(/\n/g, '<br>') + '</p></div></div></div>';
      }).join('') + '</div></section>' : '') +
    '<p class="cs-cap">Chính sách áp dụng cho mọi đơn mua tại cửa hàng và trên website Ngọc Trầm Store.</p>';
  $$('.hg-hoi').forEach(function (b) {
    b.addEventListener('click', function () {
      var mo = b.getAttribute('aria-expanded') !== 'true';
      $$('.hg-hoi').forEach(function (x) { var m = x === b && mo; x.setAttribute('aria-expanded', String(m)); x.closest('.hg-muc').classList.toggle('mo', m); });
    });
  });
  theoDoi($('#csNoi'));
  canhMucLuc('#csMuc');
})();

/* ================= CẨM NANG ================= */
if (TRANG === 'cam-nang') (function () {
  var MO_TA = {   // giới thiệu ngắn từng dòng ngọc (chỉ tả vẻ ngoài, không nói công dụng)
    'Phỉ thuý': 'Ngọc cứng, mặt bóng như kính. Sắc xanh, tím, vàng hay trắng tuỳ viên — càng trong, càng đều màu thì càng quý.',
    'Lam băng': 'Phỉ thuý ánh xanh lam nhạt, nước trong như băng, nhìn thanh và mát mắt.',
    'Lục đế': 'Phỉ thuý xanh lục đậm, đều màu và có độ trong — sắc xanh được chuộng nhất của phỉ thuý.',
    'Hoà điền': 'Ngọc mang tên vùng Hoà Điền. Thớ ngọc mịn, bóng như sáp, sắc trắng sữa đến xanh nhạt, cầm ấm tay.',
    'Ngọc bích': 'Sắc xanh rêu đến xanh đậm, thớ ngọc dai và mịn — đeo lâu ngày mặt ngọc càng bóng.',
    'Trầm hương': 'Gỗ dó tích nhựa thơm qua nhiều năm. Hương ấm, nhẹ, vân gỗ mỗi hạt một khác.',
    'Hoàng long': 'Sắc vàng đến cam đỏ ấm áp, mặt ngọc bóng mịn, hợp phối cùng charm vàng.'
  };
  taiDuLieu.then(function () {
    var con = conHang('');
    var coMon = NGOC_TIM.filter(function (t) { return con.some(function (x) { return ngocCua(x).indexOf(t) >= 0; }); });   // dòng đang có hàng
    $('#cnNgoc').innerHTML = coMon.map(function (t, i) {
      var mon = con.filter(function (x) { return ngocCua(x).indexOf(t) >= 0; }), x = mon.filter(function (y) { return y.loai !== 'charm'; })[0] || mon[0];
      return '<a class="ngoc-the" data-hien style="--i:' + (i % 3) + '" href="cua-hang.html?ngoc=' + slug(t) + '"><span class="h">' + (x ? hinh(x.anh[0], t, 600) : '') + '</span>' +
        '<span class="tt"><small>' + (mon.length ? mon.length + ' món đang có' : 'Tạm hết hàng') + '</small><b>' + e(t) + '</b><p>' + e(MO_TA[t] || '') + '</p>' +
        '<span class="di">Xem các món' + MUI_DI + '</span></span></a>';
    }).join('');
    theoDoi($('#cnNgoc'));
  });
  soTay($('#cnGiuNgoc'), (CH.chamSoc || {}).ngoc || []);
  $('#cnGiuTram').innerHTML = theMeo((CH.chamSoc || {}).tram, true);
  $('#cnCharm').innerHTML = '<ul class="ds-tp">' + CHINH_SACH.luuY.concat([
    'Tháo charm khi tắm, bơi hay dùng hoá chất tẩy rửa để vàng không xỉn màu.',
    'Cất charm riêng trong túi vải, tránh cọ xát với đá cứng làm xước mặt vàng.'
  ]).map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
  /* #281 bút dạ quang: quét tên từng mẹo giữ trầm, và ý "không phải vàng tích sản" ở charm vàng */
  $$('#cnGiuTram .meo b').forEach(function (b) { b.innerHTML = '<span class="dq">' + b.innerHTML + '</span>'; });
  quetDaQuang($('#cnGiuTram'), $$('#cnGiuTram .dq'));
  var dqCharm = $$('#cnCharm li').map(function (li) { return boDaQuang(li, /không phải [^,.;—]+/i); }).filter(Boolean);
  quetDaQuang($('#cnCharm'), dqCharm);
  /* #392 nét bút vẽ tay: gạch chân "giữ ngọc" ở tiêu đề, khoanh "miễn phí" ở ô đánh bóng charm */
  veTay($('.tp-dau h1 em'), 'gach', 1100);
  $$('[data-ve]').forEach(function (x) { veTay(x, x.dataset.ve, 250); });
  $('#cnOnline').innerHTML = theMeo([
    {tieu: 'Xin thêm video', noi: 'Màu ngọc trên màn hình có thể chênh nhẹ. Nhắn cửa hàng quay video món dưới ánh sáng tự nhiên trước khi chốt.'},
    {tieu: 'Nhìn độ trong và màu', noi: 'Soi ngọc qua ánh sáng: nước ngọc càng trong, màu càng đều thì món càng sáng đẹp khi đeo.'},
    {tieu: 'Ghi lại mã món', noi: 'Mỗi món ở Ngọc Trầm có một mã riêng và bộ ảnh thật — mua xong vẫn tra lại được.'},
    {tieu: 'Đúng cỡ tay', noi: 'Chuỗi vừa tay đeo mới đẹp và bền dây. Đo cỡ tay trước theo hướng dẫn chọn size.'}
  ], true) + '<div class="cnang-di"><a class="nut" href="chon-size.html">Hướng dẫn chọn size' + MUI_DI + '</a><a class="nut dac" href="cua-hang.html">Xem tất cả sản phẩm' + MUI_DI + '</a></div>';
  theoDoi($('#noi'));
  canhMucLuc('.tp-muc-luc');
})();

/* ================= LIÊN HỆ ================= */
if (TRANG === 'lien-he') (function () {
  var tt = trangThaiMo();
  var IC_LH = {
    dc: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    gio: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    dt: '<path d="M6.6 3.5h2.6l1.4 4-2 1.4a10.5 10.5 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>',
    tin: '<path d="M4.5 5.5h15v10h-9l-4 3.5v-3.5h-2z"/>'
  };
  var o = function (ic, nho, noi, them) { return '<div class="lh-the" data-hien><span class="ic">' + _sv(IC_LH[ic]) + '</span><div><small>' + nho + '</small>' + noi + (them || '') + '</div></div>'; };
  $('#lhThe').innerHTML =
    o('dc', 'Địa chỉ', '<b>' + e(LIEN_HE.diaChi) + '</b>', LIEN_HE.banDo ? '<a href="' + e(LIEN_HE.banDo) + '" target="_blank" rel="noopener">Chỉ đường' + MUI_DI + '</a>' : '') +
    o('gio', 'Giờ mở cửa', '<b>' + e(LIEN_HE.gio) + '</b>', '<div class="mo-cua' + (tt.mo ? ' mo' : '') + '"><i></i>' + tt.chu + '</div>') +
    o('dt', 'Điện thoại · Zalo', '<b><a href="tel:' + e(LIEN_HE.sdt) + '">' + e(LIEN_HE.sdt) + '</a></b>') +
    o('tin', 'Nhắn tin', '<b>Trả lời trong giờ mở cửa</b>',
      '<div class="hang"><a class="nut dac" href="' + linkZalo() + '" target="_blank" rel="noopener" style="background:#0068ff;border-color:#0068ff">Zalo</a>' +
      '<a class="nut" href="' + linkFb() + '" target="_blank" rel="noopener">Messenger</a></div>');
  if (LIEN_HE.toaDo) $('#lhBd').innerHTML = '<iframe title="Bản đồ Ngọc Trầm Store" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(LIEN_HE.toaDo) + '&z=16&hl=vi&output=embed"></iframe>';
  var mxh = [['fb', LIEN_HE.fanpage[0] && LIEN_HE.fanpage[0].link, 'Facebook', LIEN_HE.fanpage[0] && LIEN_HE.fanpage[0].ten],
             ['ig', LIEN_HE.instagram, 'Instagram', (/instagram\.com\/([^\/?]+)/.exec(LIEN_HE.instagram || '') || [])[1]],
             ['tt', LIEN_HE.tiktok, 'TikTok', (/tiktok\.com\/(@[^\/?]+)/.exec(LIEN_HE.tiktok || '') || [])[1]]]
    .concat(LIEN_HE.fanpage.slice(1).map(function (f) { return ['fb', f.link, 'Facebook', f.ten]; }))
    .filter(function (x) { return x[1]; });
  $('#lhMxh').innerHTML = mxh.map(function (x) {
    return '<a class="mxh-the" data-hien href="' + e(x[1]) + '" target="_blank" rel="noopener"><span class="ic">' + bieuTuong(x[0]) + '</span><small>' + x[2] + '</small><b>' + e(x[3] || x[2]) + '</b><span class="di">Theo dõi' + MUI_DI + '</span></a>';
  }).join('');
  theoDoi($('#noi'));

  /* #005 máy bay giấy: bấm "Nhắn Zalo" thì một chiếc máy bay giấy nhỏ cất cánh từ nút, lượn một vòng rồi bay đi,
     để lại vệt chấm mờ dần. Link vẫn mở Zalo như cũ (tab mới) — hiệu ứng chỉ trang trí, không chặn gì. */
  if (IT) return;
  var DUONG = 'M0 0C18 -52 104 -78 112 -30C118 6 62 14 58 -22C54 -70 210 -150 560 -300';
  function bayGiay(nut) {
    var r = nut.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, NS = 'http://www.w3.org/2000/svg';
    if (nut.animate) nut.animate([{transform: 'scale(1)'}, {transform: 'scale(.94)'}, {transform: 'scale(1)'}], {duration: 320, easing: 'ease-out'});
    var vet = document.createElementNS(NS, 'svg'); vet.setAttribute('class', 'mb-vet'); vet.setAttribute('width', '1'); vet.setAttribute('height', '1');
    vet.style.left = x + 'px'; vet.style.top = y + 'px';
    var p = document.createElementNS(NS, 'path'); p.setAttribute('d', DUONG); p.setAttribute('stroke', 'none'); vet.appendChild(p);
    document.body.appendChild(vet);
    var L = p.getTotalLength(), TG = 1500;
    for (var i = 1; i < 34; i++) {
      var q = p.getPointAtLength(L * i / 34), c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', q.x.toFixed(1)); c.setAttribute('cy', q.y.toFixed(1)); c.setAttribute('r', '1.3'); c.setAttribute('fill', '#d1ad66'); c.style.opacity = 0;
      vet.appendChild(c);
      c.animate([{opacity: 0}, {opacity: .9, offset: .08}, {opacity: 0}], {duration: 900, delay: TG * i / 34, fill: 'both'});
    }
    var mb = document.createElement('div'); mb.className = 'mb-giay'; mb.setAttribute('aria-hidden', 'true');
    mb.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2.5 11.2 21 3.5l-4.6 17-5.1-5.6z" fill="#fbf8f2" stroke="#a8823a" stroke-width="1.2" stroke-linejoin="round"/><path d="M11.3 14.9 21 3.5 7.2 13z" fill="#ebe2d2" stroke="#a8823a" stroke-width="1.2" stroke-linejoin="round"/><path d="M7.2 13l1.3 5.8 2.8-3.9" fill="#d1ad66" stroke="#a8823a" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    mb.style.left = x + 'px'; mb.style.top = y + 'px'; mb.style.offsetPath = 'path("' + DUONG + '")';
    document.body.appendChild(mb);
    var a = mb.animate([{offsetDistance: '0%', opacity: 0, scale: .5}, {opacity: 1, scale: 1, offset: .08}, {opacity: 1, offset: .8}, {offsetDistance: '100%', opacity: 0, scale: .8}],
      {duration: TG, easing: 'cubic-bezier(.35,.1,.6,1)', fill: 'both'});
    a.onfinish = function () { mb.remove(); };
    setTimeout(function () { vet.remove(); mb.remove(); }, TG + 1000);
  }
  $$('#noi a[href*="zalo.me"], .lh [data-zalo]').forEach(function (a) { a.addEventListener('click', function () { bayGiay(a); }); });
})();

/* ================= VỀ NGỌC TRẦM ================= */
if (TRANG === 've-ngoc-tram') (function () {
  var v = ND.van || {};
  /* #370 đường thời gian: cuộn xuống thì đường giữa sáng dần từ trên, tới bước nào chấm bước đó bật sáng; cuộn lên thì tắt lại */
  var bu = $('#vntBuoc');
  bu.innerHTML = [1, 2, 3].map(function (i) {
    return '<div class="meo" data-hien style="--i:' + (i - 1) + '"><i class="tl-cham" aria-hidden="true"></i><span class="so">0' + i + '</span><b>' + e(v['quy.b' + i + 't'] || '') + '</b><p>' + e(v['quy.b' + i + 'n'] || '') + '</p></div>';
  }).join('') + '<i class="tl-ray" aria-hidden="true"><i class="tl-sang"></i></i>';
  bu.classList.add('vnt-tl');
  var cho = 0;
  function sangDan() {
    cho = 0;
    var r = bu.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
    var p = kep((innerHeight * .62 - r.top) / r.height, 0, 1), z = soZ();
    bu.style.setProperty('--p', p.toFixed(4));
    [].forEach.call(bu.querySelectorAll('.meo'), function (m) { m.classList.toggle('sang', m.offsetTop + 40 * z <= p * r.height); });
  }
  addEventListener('scroll', function () { if (!cho) cho = requestAnimationFrame(sangDan); }, {passive: true});
  addEventListener('resize', sangDan); sangDan();

  /* #214 lưới bento cho các cam kết: ô to nhỏ đan nhau, rê chuột (hoặc cuộn tới trên điện thoại) thì cảnh nhỏ trong ô chạy */
  var CANH = [
    [/ngọc|đá|phỉ/i, '<circle class="ve" pathLength="1" cx="55" cy="56" r="30"/><circle cx="55" cy="56" r="19" opacity=".45"/><path class="ve" pathLength="1" d="M38 46a20 20 0 0 1 15-10"/><g class="loe"><path d="M82 24v12M76 30h12"/></g>'],
    [/vàng|\dK/i, '<path class="len" d="M18 86h32l-6-15H24z"/><path class="len" d="M58 86h32l-6-15H64z"/><path class="len" d="M38 66h32l-6-15H44z"/><g class="loe"><path d="M80 26v12M74 32h12"/></g>'],
    [/ảnh|hình|video/i, '<path class="ve" pathLength="1" d="M20 40V24h16M74 24h16v16M90 72v16H74M36 88H20V72"/><circle class="ve" pathLength="1" cx="55" cy="56" r="15"/><g class="loe"><circle cx="55" cy="56" r="26" fill="#d1ad66" opacity=".35" stroke="none"/></g>'],
    [/giao|ship|gửi/i, '<path class="ve" pathLength="1" d="M14 92C40 92 34 52 60 54S88 44 92 34"/><path d="M92 34s-9-8-9-15a9 9 0 0 1 18 0c0 7-9 15-9 15z"/><circle cx="92" cy="19" r="3"/><g class="loe"><circle cx="14" cy="92" r="6" fill="#d1ad66" stroke="none"/></g>'],
    [/./, '<path class="ve" pathLength="1" d="M55 20l8 27 27 8-27 8-8 27-8-27-27-8 27-8z"/><g class="loe"><circle cx="55" cy="55" r="12" fill="#d1ad66" opacity=".35" stroke="none"/></g>']
  ];
  var ck = $('#vntCk');
  ck.innerHTML = (ND.camKet || []).map(function (c, i) {
    var canh = CANH.filter(function (x) { return x[0].test(c); })[0][1];
    return '<div class="vnt-ck-o" data-hien style="--i:' + i + '"><svg class="ck-canh" viewBox="0 0 110 110" aria-hidden="true" focusable="false">' + canh + '</svg><span>' + ('0' + (i + 1)).slice(-2) + '</span><b>' + e(c) + '</b></div>';
  }).join('');
  if ((ND.camKet || []).length >= 4) ck.classList.add('bento');
  var oCk = $$('#vntCk .vnt-ck-o');
  function choiCanh(o) { if (IT) return; o.classList.remove('chay'); void o.offsetWidth; o.classList.add('chay'); clearTimeout(o._h); o._h = setTimeout(function () { o.classList.remove('chay'); }, 2300); }
  khiThay(oCk, function (o) { setTimeout(function () { choiCanh(o); }, 500 + (+o.style.getPropertyValue('--i') || 0) * 180); }, .6);
  if (CHUOT) oCk.forEach(function (o) { o.addEventListener('pointerenter', function () { if (!o.classList.contains('chay')) choiCanh(o); }); });

  /* #049 thẻ minh hoạ nhiều lớp: 4 lối đi cuối trang có hình vẽ ba lớp, rê chuột thì các lớp lệch nhau theo độ sâu */
  var HINH = [
    '<path d="M40 70c30-34 120-40 170-6" stroke="#d1ad66" stroke-opacity=".5"/>' + [0, 1, 2, 3, 4, 5, 6].map(function (i) { var t = i / 6, x = 52 + t * 140, y = 64 - Math.sin(t * Math.PI) * 26; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (i === 3 ? 11 : 8) + '" fill="' + (i === 3 ? '#d1ad66' : 'rgba(127,186,160,.55)') + '" stroke="#d1ad66" stroke-opacity=".6"/>'; }).join(''),
    '<path d="M70 36h100" stroke="#d1ad66" stroke-opacity=".5"/><circle cx="120" cy="64" r="20" fill="none" stroke="#d1ad66"/><circle cx="120" cy="64" r="9" fill="#d1ad66" fill-opacity=".8"/><path d="M120 36v8" stroke="#d1ad66"/><circle cx="92" cy="36" r="6" fill="rgba(127,186,160,.6)"/><circle cx="148" cy="36" r="6" fill="rgba(127,186,160,.6)"/>',
    '<path d="M86 46c-10 4-14 12-14 22h14V54h-6c0-4 2-7 6-8zM124 46c-10 4-14 12-14 22h14V54h-6c0-4 2-7 6-8z" fill="#d1ad66" fill-opacity=".85"/><path d="M138 74h40M138 62h28" stroke="#d1ad66" stroke-opacity=".5"/>',
    '<path d="M120 84s-20-18-20-32a20 20 0 0 1 40 0c0 14-20 32-20 32z" fill="none" stroke="#d1ad66"/><circle cx="120" cy="52" r="7" fill="#d1ad66"/><ellipse cx="120" cy="88" rx="30" ry="5" fill="none" stroke="#d1ad66" stroke-opacity=".4"/>'
  ];
  $$('.vnt-di-ds a').forEach(function (a, i) {
    a.classList.add('co-lop');
    a.insertAdjacentHTML('afterbegin', '<span class="lop" aria-hidden="true">' +
      '<svg viewBox="0 0 240 110" preserveAspectRatio="xMidYMid slice" style="--d:6"><circle cx="190" cy="30" r="34" fill="rgba(209,173,102,.12)"/><circle cx="40" cy="96" r="44" fill="rgba(255,255,255,.04)"/></svg>' +
      '<svg viewBox="0 0 240 110" preserveAspectRatio="xMidYMid slice" style="--d:12"><path d="M-10 92c40-26 80-30 120-12s90 14 140-10v50H-10z" fill="rgba(255,255,255,.05)" stroke="rgba(209,173,102,.3)"/></svg>' +
      '<svg viewBox="0 0 240 110" preserveAspectRatio="xMidYMid slice" style="--d:20" fill="none" stroke-width="1.4">' + (HINH[i % HINH.length]) + '</svg></span>');
    if (!CHUOT || IT) return;
    a.addEventListener('pointermove', function (ev) {
      var r = a.getBoundingClientRect();
      a.classList.add('theo');
      a.style.setProperty('--px', (((ev.clientX - r.left) / r.width - .5) * 2).toFixed(3));
      a.style.setProperty('--py', (((ev.clientY - r.top) / r.height - .5) * 2).toFixed(3));
    });
    a.addEventListener('pointerleave', function () { a.classList.remove('theo'); a.style.setProperty('--px', 0); a.style.setProperty('--py', 0); });
  });

  /* #346 câu ẩn trong vòng tròn: rê chuột lên câu lớn đầu trang, trong vòng tròn hiện câu "Không có hai viên ngọc giống nhau."
     (câu đầu của đoạn cc.quet, sửa ở app). Bấm giữ thì vòng tròn tràn đầy khung. Điện thoại: hiện cả hai câu, câu sau nằm dưới. */
  (function () {
    var h1 = $('.vnt-dau h1'), cau = (String(v['cc.quet'] || '').match(/^[^.!?]+[.!?]/) || [])[0];
    if (!h1 || !cau) return;
    h1.classList.add('co-an');
    h1.insertAdjacentHTML('beforeend', '<span class="an-cau" aria-hidden="true"><span>' + e(cau.trim()) + '</span></span><i class="an-vong" aria-hidden="true"></i>');
    if (!CHUOT || IT) return;
    var lop = h1.querySelector('.an-cau'), vong = h1.querySelector('.an-vong'), vung = $('.vnt-dau');
    var pos = {x: 0, y: 0}, sp = {x: 0, y: 0}, vt = {x: 0, y: 0}, r = 0, rT = 0, day = false, raf = 0, last = 0, R = 80, demo = null, daRe = false;
    function khung(now) {
      raf = 0;
      var dt = Math.min(.033, Math.max(.001, (now - last) / 1000)); last = now;
      if (demo) { var t = kep((now - demo.t0) / 2400, 0, 1), w = lop.offsetWidth; pos = {x: w * (.12 + .76 * (t * t * (3 - 2 * t))), y: lop.offsetHeight * (.5 + Math.sin(t * Math.PI * 2) * .12)}; if (t >= 1) { demo = null; rT = 0; } }
      vt.x += ((pos.x - sp.x) * 240 - vt.x * 23) * dt; vt.y += ((pos.y - sp.y) * 240 - vt.y * 23) * dt; sp.x += vt.x * dt; sp.y += vt.y * dt;
      r += (rT - r) * Math.min(1, dt * (day ? 5 : 11));
      var toc = Math.min(1, Math.hypot(vt.x, vt.y) / 1600), g = Math.atan2(vt.y, vt.x);
      var rx = r * (1 + toc * .35 * Math.abs(Math.cos(g))), ry = r * (1 + toc * .35 * Math.abs(Math.sin(g)));
      lop.style.setProperty('--x', sp.x.toFixed(1) + 'px'); lop.style.setProperty('--y', sp.y.toFixed(1) + 'px');
      lop.style.setProperty('--rx', rx.toFixed(1) + 'px'); lop.style.setProperty('--ry', ry.toFixed(1) + 'px');
      vong.style.width = rx * 2 + 'px'; vong.style.height = ry * 2 + 'px';
      vong.style.transform = 'translate(' + (lop.offsetLeft + sp.x - rx).toFixed(1) + 'px,' + (lop.offsetTop + sp.y - ry).toFixed(1) + 'px)';
      vong.style.opacity = !day && r > 4 ? '1' : '0';
      if (demo || Math.abs(pos.x - sp.x) + Math.abs(pos.y - sp.y) > .3 || Math.abs(rT - r) > .3 || Math.hypot(vt.x, vt.y) > 2) raf = requestAnimationFrame(khung);
    }
    function chay() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(khung); } }
    function viTri(ev) { var b = lop.getBoundingClientRect(); return {x: ev.clientX - b.left, y: ev.clientY - b.top, trong: ev.clientX >= b.left && ev.clientX <= b.right && ev.clientY >= b.top - 30 && ev.clientY <= b.bottom + 30}; }
    vung.addEventListener('pointermove', function (ev) {
      var q = viTri(ev); demo = null; daRe = true;
      R = parseFloat(getComputedStyle(h1).fontSize) * 1.05;
      if (q.trong) { if (!r && !day) { sp.x = q.x; sp.y = q.y; } pos = {x: q.x, y: q.y}; if (!day) rT = R; }
      else if (!day) rT = 0;
      chay();
    });
    vung.addEventListener('pointerleave', function () { if (!day) { rT = 0; chay(); } });
    vung.addEventListener('pointerdown', function (ev) { var q = viTri(ev); if (!q.trong) return; day = true; pos = {x: q.x, y: q.y}; rT = Math.hypot(lop.offsetWidth, lop.offsetHeight); chay(); });
    addEventListener('pointerup', function () { if (!day) return; day = false; rT = R; chay(); });
    // chưa ai rê chuột: vòng tròn tự lướt qua một lần cho biết có câu ẩn
    setTimeout(function () {
      if (daRe || scrollY > innerHeight * .5) return;
      R = parseFloat(getComputedStyle(h1).fontSize) * 1.05;
      sp = {x: lop.offsetWidth * .12, y: lop.offsetHeight * .5}; rT = R; demo = {t0: performance.now()}; chay();
    }, 2200);
  })();

  taiDuLieu.then(function () {
    var con = conHang(''), dong = NGOC_TIM.filter(function (t) { return con.some(function (x) { return ngocCua(x).indexOf(t) >= 0; }); }).length;
    var nam = +(v['cc.nam'] || 2015);
    $('#vntSo').innerHTML = [[nam, 'Năm thành lập'], [new Date().getFullYear() - nam, 'Năm chọn ngọc'], [con.length, 'Món đang có'], [dong, 'Dòng ngọc']]
      .map(function (x, i) { return '<div data-hien style="--i:' + i + '"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
    var x = con.filter(function (y) { return y.loai === 'chuoi'; })[0] || con[0];
    if (x) $('#vntAnh').innerHTML = hinh(x.anh[1] || x.anh[0], '', 1600, ' fetchpriority="high"');
    daiAnh(con.filter(function (y) { return y !== x && y.loai === 'chuoi' && y.anh && y.anh.length; }).slice(0, 8));
    theoDoi($('#noi'));
  });
  theoDoi($('#noi'));
  requestAnimationFrame(function () { setTimeout(function () { $$('.vnt-dau .tieu-de,.vnt-dau [data-hien]').forEach(function (x) { x.classList.add('hien'); }); }, 150); });

  /* #241 dải ảnh món thật chạy ngang khi cuộn dọc (máy tính: ghim khung lại; điện thoại / giảm chuyển động: vuốt ngang bình thường).
     Số mã to phía sau mỗi ảnh trôi trễ hơn dải một chút cho có chiều sâu. */
  function daiAnh(ds) {
    var sec = $('#vntDai'); if (!sec || ds.length < 4) return;
    $('#vntDaiDs').innerHTML = ds.map(function (x) {
      return '<a class="vd-o" href="' + linkSp(x) + '"><span class="vd-so" aria-hidden="true">' + e(String(x.ma).replace(/^M/, '')) + '</span><span class="vd-h">' + hinh(x.anh[0], x.ten, 600) + '</span>' +
        '<small>Mã ' + e(x.ma) + '</small><b>' + e(x.ten) + '</b></a>';
    }).join('');
    sec.hidden = false;
    var ray = sec.querySelector('.vd-ray'), dai = $('#vntDaiDs'), thanh = $('#vntDaiP'), so = $$('#vntDaiDs .vd-so');
    var mq = matchMedia('(min-width: 900px)'), lech = 0, p = 0, pt = 0, raf = 0;
    function doLai() {
      var ghim = mq.matches && !IT;
      sec.classList.toggle('ghim', ghim);
      if (!ghim) { sec.style.height = ''; dai.style.transform = ''; so.forEach(function (s) { s.style.removeProperty('--tre'); }); return; }
      lech = Math.max(0, dai.scrollWidth - ray.clientWidth + parseFloat(getComputedStyle(ray).paddingLeft) * 2);
      sec.style.height = (innerHeight + lech) + 'px';
      cuon();
    }
    function cuon() {
      if (!sec.classList.contains('ghim')) {   // vuốt ngang: thanh tiến trình theo vị trí cuộn ngang
        var m = ray.scrollWidth - ray.clientWidth; thanh.style.setProperty('--p', m > 0 ? (ray.scrollLeft / m).toFixed(3) : 0); return;
      }
      var r = sec.getBoundingClientRect();
      p = kep(-r.top / Math.max(1, lech), 0, 1);
      dai.style.transform = 'translate3d(' + (-p * lech).toFixed(1) + 'px,0,0)';
      thanh.style.setProperty('--p', p.toFixed(4));
      if (!raf) raf = requestAnimationFrame(tre);
    }
    function tre() {   // số mã đuổi theo chậm hơn
      raf = 0; pt += (p - pt) * .12;
      var d = (p - pt) * lech * .18;
      so.forEach(function (s) { s.style.setProperty('--tre', d.toFixed(1)); });
      if (Math.abs(p - pt) > .0005) raf = requestAnimationFrame(tre);
    }
    addEventListener('scroll', cuon, {passive: true}); ray.addEventListener('scroll', cuon, {passive: true});
    addEventListener('resize', doLai); if (mq.addEventListener) mq.addEventListener('change', doLai);
    doLai();
  }
})();

/* ================= 404 ================= */
/* #089 số 0 ở giữa là la bàn: kim đuổi theo con trỏ bằng lò xo (vượt quá một chút rồi về), hai số 4 nghiêng về phía con trỏ.
   Không rê chuột thì kim chỉ về nút "Về trang chủ". */
if (TRANG === '404') (function () {
  var so = $('.so-404'), kim = $('.la-ban .kim'), lb = $('.la-ban'), ve = $('#ve404'); if (!so || !kim) return;
  var a = 0, va = 0, dich = 0, raf = 0, last = 0;
  function khung(now) {
    raf = 0;
    var dt = Math.min(.032, Math.max(.001, (now - last) / 1000)); last = now;
    if (IT) { a = dich; va = 0; } else { va += (200 * (dich - a) - 15 * va) * dt; a += va * dt; }
    kim.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
    if (Math.abs(va) > .05 || Math.abs(dich - a) > .05) raf = requestAnimationFrame(khung);
  }
  function chay() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(khung); } }
  function ngam(deg) { dich = a + ((((deg - a) % 360) + 540) % 360) - 180; chay(); }   // quay đường ngắn nhất
  function huong(x, y, nghieng) {
    var r = lb.getBoundingClientRect(), dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
    ngam(Math.atan2(dx, -dy) * 180 / Math.PI);
    so.style.setProperty('--r', nghieng ? kep(dx / (innerWidth / 2), -1, 1).toFixed(3) : 0);
  }
  function veNha() { if (!ve) return; var r = ve.getBoundingClientRect(); huong(r.left + r.width / 2, r.top + r.height / 2, false); }
  if (CHUOT) {
    addEventListener('pointermove', function (ev) { huong(ev.clientX, ev.clientY, true); });
    document.documentElement.addEventListener('pointerleave', veNha);
  } else addEventListener('pointerdown', function (ev) { huong(ev.clientX, ev.clientY, true); setTimeout(veNha, 1600); });
  if (ve) { ve.addEventListener('focus', veNha); }
  a = -40; setTimeout(veNha, IT ? 0 : 500);
  addEventListener('resize', veNha);
})();

/* tiêu đề đầu các trang phụ hiện ngay khi mở */
requestAnimationFrame(function () { setTimeout(function () { $$('.tp-dau .tieu-de,.tp-dau [data-hien]').forEach(function (x) { x.classList.add('hien'); }); }, 120); });
