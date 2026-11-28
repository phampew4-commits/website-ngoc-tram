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
      if (q.trong) {   // tâm vòng giữ trong khung chữ → vòng không chạm mép khung (mép bị cắt vuông)
        var mx = R * 1.4, my = R * .75; q.x = kep(q.x, mx, Math.max(mx, lop.offsetWidth - mx)); q.y = kep(q.y, my, Math.max(my, lop.offsetHeight - my));
        if (!r && !day) { sp.x = q.x; sp.y = q.y; } pos = {x: q.x, y: q.y}; if (!day) rT = R;
      }
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
    var con = conHang('');
    /* dải số liệu #vntSo: dựng ở phần #426 cuối file (số lăn khi cuộn tới) */
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

/* =========================================================
   ĐỢT 28/11 — chuyển động khi cuộn / xem cho từng trang (CSS cuối css/trang-phu-hu.css)
   #058 cẩm nang: thanh tiến độ đọc + "còn khoảng N phút đọc" · #461 thẻ nghiêng theo tay (cẩm nang)
   #426 số liệu lăn như đồng hồ đếm · #231 khung ảnh lớn dựng thẳng · #341 chòm sao ở đầu trang (về Ngọc Trầm)
   #318 đường giao hàng tự vẽ (chính sách) · #313 vòng tay co giãn theo cỡ tay (chọn size)
   #008 nút chép số điện thoại / địa chỉ (liên hệ) · #360 chữ 404 bay tung toé rồi ghép lại
   (Phần chung — tách chữ tiêu đề, lưới chấm, thẻ nổi lên… — nằm ở js/phu-dong.js, không làm lại ở đây.)
   ========================================================= */

/* #461 thẻ nghiêng theo tay khi rê chuột + một vệt sáng lướt ngang theo chuột. Chỉ máy có chuột; điện thoại / giảm chuyển động: bỏ.
   Dùng transform (perspective + rotate) — phần chung chỉ dùng translate / opacity / scale riêng nên không đè nhau. */
function nghiengTay(sel) {
  if (!CHUOT || IT) return;
  var the0 = null, ev0 = null, hen = 0;
  function ve() {
    hen = 0; var c = the0, ev = ev0; if (!c || !ev) return;
    var r = c.getBoundingClientRect(), px = kep((ev.clientX - r.left) / r.width, 0, 1), py = kep((ev.clientY - r.top) / r.height, 0, 1);
    c.style.transform = 'perspective(' + Math.round(1000 * soZ()) + 'px) rotateX(' + ((.5 - py) * 7).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 9).toFixed(2) + 'deg)';
    c.style.setProperty('--sx', ((1 - px) * 100).toFixed(1) + '%');
  }
  function roi(c) {
    c.classList.remove('nt-dang'); c.style.transform = ''; c.classList.add('nt-ve');
    clearTimeout(c._nt); c._nt = setTimeout(function () { c.classList.remove('nt-ve'); }, 750);
  }
  document.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') return;
    var c = ev.target.closest && ev.target.closest(sel);
    if (c && (c.hasAttribute('data-hien') && !c.classList.contains('hien') || /\bpd-(cho|len)\b/.test(c.className))) c = null;   // chưa hiện xong (kể cả hiệu ứng nổi lên của phu-dong) thì thôi
    if (c !== the0) {
      if (the0) roi(the0); the0 = c;
      if (c) {
        if (!c.querySelector(':scope > .nt-sang')) c.insertAdjacentHTML('beforeend', '<i class="nt-sang" aria-hidden="true"></i>');
        clearTimeout(c._nt); c.classList.remove('nt-ve'); c.classList.add('nt-dang');
      }
    }
    if (!c) return; ev0 = ev; if (!hen) hen = requestAnimationFrame(ve);
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', function () { if (the0) { roi(the0); the0 = null; } });
}

/* ---------- CẨM NANG ---------- */
if (TRANG === 'cam-nang') (function () {
  nghiengTay('#cnNgoc .ngoc-the, #cnGiuTram .meo, #cnOnline .meo');

  /* #058 thanh tiến độ đọc mảnh màu vàng ngay dưới thanh đầu trang (đầu trang ẩn khi cuộn xuống thì thanh nhích lên mép màn hình),
     cùng chỉ báo nhỏ góc trái dưới "còn khoảng N phút đọc" — tính từ số chữ thật của bài (≈ 230 tiếng / phút). Hết bài: "Đã đọc xong". */
  var bai = $('#noi'); if (!bai) return;
  var thanh = document.createElement('div'); thanh.className = 'doc-thanh'; thanh.setAttribute('aria-hidden', 'true'); thanh.innerHTML = '<i></i>';
  var nhan = document.createElement('div'); nhan.className = 'doc-con'; nhan.setAttribute('aria-hidden', 'true');
  nhan.innerHTML = '<svg viewBox="0 0 20 20"><circle class="nen" cx="10" cy="10" r="8"/><circle class="chay" cx="10" cy="10" r="8" pathLength="100"/>' +
    '<path class="tich" d="M6.3 10.3l2.5 2.5 5-5.3" pathLength="1"/></svg><span></span>';
  document.body.appendChild(thanh); document.body.appendChild(nhan);
  var vach = thanh.firstChild, vong = nhan.querySelector('.chay'), chu = nhan.querySelector('span');
  var TOC = 230, tong = 0, hen = 0;
  function dem() {   // số tiếng (chữ) thật trong bài
    tong = String(bai.innerText || bai.textContent).split(/\s+/).filter(function (w) { return /[0-9A-Za-zÀ-ỹ]/.test(w); }).length;
    cap();
  }
  function cap() {
    hen = 0;
    var r = bai.getBoundingClientRect(), p = kep(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
    vach.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    vong.style.strokeDashoffset = (100 - p * 100).toFixed(2);
    var xong = p > .985, phut = Math.max(1, Math.ceil(tong * (1 - p) / TOC));
    var s = xong ? 'Đã đọc xong' : 'Còn khoảng ' + phut + ' phút đọc';
    if (chu.textContent !== s) chu.textContent = s;
    nhan.classList.toggle('xong', xong);
    nhan.classList.toggle('hien', scrollY > innerHeight * .35 && tong > 0);
  }
  addEventListener('scroll', function () { if (!hen) hen = requestAnimationFrame(cap); }, {passive: true});
  addEventListener('resize', cap);
  dem(); taiDuLieu.then(function () { setTimeout(dem, 60); });
})();

/* ---------- VỀ NGỌC TRẦM ---------- */
if (TRANG === 've-ngoc-tram') (function () {
  /* #341 chòm sao ở phần đầu trang tối: chấm vàng nhỏ trôi chậm, gần nhau thì nối nét mảnh; rê chuột thì con trỏ thành một điểm nối.
     Canvas dừng hẳn khi đầu trang ra khỏi màn hình hoặc tab ẩn; điện thoại ít chấm hơn; giảm chuyển động: vẽ một khung đứng yên. */
  (function () {
    var dau = $('.vnt-dau'); if (!dau || !window.HTMLCanvasElement) return;
    var cv = document.createElement('canvas'); cv.className = 'vnt-sao'; cv.setAttribute('aria-hidden', 'true');
    dau.insertBefore(cv, dau.querySelector('.khung'));
    var g = cv.getContext('2d'); if (!g) return;
    var DT = matchMedia('(max-width: 760px)').matches, W = 0, H = 0, pts = [], chuot = null, thay = true, raf = 0, last = 0;
    function moi() {
      var a = Math.random() * Math.PI * 2, v = 5 + Math.random() * 9;
      return {x: Math.random() * W, y: Math.random() * H, vx: Math.cos(a) * v, vy: Math.sin(a) * v, v: v, r: .6 + Math.random() * 1.2};
    }
    function doLai() {
      W = dau.clientWidth; H = dau.clientHeight; if (!W || !H) return;
      var dpr = Math.min(DT ? 1.5 : 2, devicePixelRatio || 1);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(kep(W * H / (DT ? 15000 : 15500), DT ? 18 : 36, DT ? 34 : 84));
      pts.forEach(function (p) { p.x = Math.min(p.x, W); p.y = Math.min(p.y, H); });
      while (pts.length < n) pts.push(moi()); pts.length = n;
      if (IT || !raf) ve(0);
    }
    function ve(dt) {
      var z = soZ(), D = 118 * z, M = 170 * z, i, j, p, q, dx, dy, d;
      g.clearRect(0, 0, W, H);
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (chuot) {   // chấm gần con trỏ bị hút nhẹ về phía nó
          dx = chuot.x - p.x; dy = chuot.y - p.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < M && d > 1) { p.vx += dx / d * 16 * dt; p.vy += dy / d * 16 * dt; }
        }
        var tc = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (tc > p.v * 2.2) { p.vx *= p.v * 2.2 / tc; p.vy *= p.v * 2.2 / tc; }
        else if (tc > p.v) { p.vx *= 1 - .6 * dt; p.vy *= 1 - .6 * dt; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }
      g.lineWidth = .7;
      for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) {
        p = pts[i]; q = pts[j]; dx = p.x - q.x; dy = p.y - q.y;
        if (Math.abs(dx) > D || Math.abs(dy) > D) continue;
        d = Math.sqrt(dx * dx + dy * dy); if (d > D) continue;
        g.strokeStyle = 'rgba(209,173,102,' + ((1 - d / D) * .42).toFixed(3) + ')';
        g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
      }
      if (chuot) {
        g.lineWidth = .9;
        for (i = 0; i < pts.length; i++) {
          p = pts[i]; dx = p.x - chuot.x; dy = p.y - chuot.y; d = Math.sqrt(dx * dx + dy * dy); if (d > M) continue;
          g.strokeStyle = 'rgba(232,206,150,' + ((1 - d / M) * .6).toFixed(3) + ')';
          g.beginPath(); g.moveTo(chuot.x, chuot.y); g.lineTo(p.x, p.y); g.stroke();
        }
      }
      g.fillStyle = 'rgba(236,214,164,.85)';
      for (i = 0; i < pts.length; i++) { p = pts[i]; g.beginPath(); g.arc(p.x, p.y, p.r * z, 0, 6.2832); g.fill(); }
    }
    function khung(now) {
      raf = 0; if (!thay || document.hidden) return;
      var dt = Math.min(.05, Math.max(.001, (now - last) / 1000)); last = now;
      ve(dt); raf = requestAnimationFrame(khung);
    }
    function chay() { if (IT || raf || !thay || document.hidden) return; last = performance.now(); raf = requestAnimationFrame(khung); }
    doLai(); addEventListener('resize', doLai);
    if (IT) return;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { thay = es[0].isIntersecting; if (thay) chay(); }).observe(dau);
    document.addEventListener('visibilitychange', chay);
    if (CHUOT) {
      dau.addEventListener('pointermove', function (ev) { var r = dau.getBoundingClientRect(); chuot = {x: ev.clientX - r.left, y: ev.clientY - r.top}; });
      dau.addEventListener('pointerleave', function () { chuot = null; });
    }
    chay();
  })();

  taiDuLieu.then(function () {
    var con = conHang(''), v = ND.van || {};
    /* #426 dải số liệu: từng chữ số lăn như đồng hồ đếm khi cuộn tới; rê chuột lên một số thì nó lăn lại một vòng.
       CHỈ số thật: số năm từ năm thành lập (cc.nam, mặc định 2015) tới năm nay · số món đang bán trong data/san-pham.json
       · số loại sản phẩm đang có hàng (LOAI) · số dòng ngọc đang có hàng · số dòng trầm nhà làm trong data/tram-dot.json. */
    var hop = $('#vntSo'); if (!hop) return;
    var nam0 = +(v['cc.nam'] || 2015), soNam = new Date().getFullYear() - nam0;
    var loaiCo = THU_TU.filter(function (k) { return con.some(function (x) { return x.loai === k; }); }).length;
    var dongNgoc = NGOC_TIM.filter(function (t) { return con.some(function (x) { return ngocCua(x).indexOf(t) >= 0; }); }).length;
    var so = [[soNam, 'Năm chọn ngọc · từ ' + nam0], [con.length, 'Món đang có'], [loaiCo, 'Loại sản phẩm'], [dongNgoc, 'Dòng ngọc']]
      .filter(function (x) { return x[0] > 0; });
    taiJson('data/tram-dot.json').then(function (d) { return ((d && d.loai) || []).length; }, function () { return 0; }).then(function (n) {
      if (n) so.push([n, 'Dòng trầm nhà làm']);
      var DS = '01234567890123456789'.split('').map(function (c) { return '<b>' + c + '</b>'; }).join('');
      hop.classList.add('dem', 'c' + so.length);
      hop.innerHTML = so.map(function (x, i) {
        var s = String(x[0]);
        return '<div data-hien style="--i:' + i + '" aria-label="' + s + ' ' + e(x[1]) + '"><b class="dem-so" aria-hidden="true">' +
          s.split('').map(function (c, k) { return '<span class="cot"><span style="--k:' + k + '" data-d="' + c + '">' + DS + '</span></span>'; }).join('') +
          '</b><span aria-hidden="true">' + e(x[1]) + '</span></div>';
      }).join('');
      theoDoi(hop);
      var o = $$('#vntSo > div');
      function lan(div, tuDau) {
        var cot = [].slice.call(div.querySelectorAll('.cot > span'));
        cot.forEach(function (c) { c.style.transition = 'none'; c.style.setProperty('--d', tuDau ? 0 : c.dataset.d); });
        void div.offsetWidth;
        cot.forEach(function (c) { c.style.transition = ''; c.style.setProperty('--d', +c.dataset.d + 10); });
      }
      if (IT) { $$('#vntSo .cot > span').forEach(function (c) { c.style.setProperty('--d', +c.dataset.d + 10); }); return; }
      khiThay([hop], function () { o.forEach(function (d) { lan(d, true); }); }, .4);
      if (CHUOT) o.forEach(function (d) {
        var luc = 0;
        d.addEventListener('pointerenter', function () { if (!d.classList.contains('hien') || Date.now() - luc < 1500) return; luc = Date.now(); lan(d, false); });
      });
    });

    /* #231 khung ảnh lớn: lúc đầu ngửa ra sau và nhỏ, cuộn tới thì dựng thẳng, to dần, bóng đổ sâu dần cho tới khi phẳng mặt;
       phẳng rồi thì tên, mã, giá món hiện lên. Cuộn ngược lên thì ngả lại. Ảnh = một món chuỗi thật đang có (không trùng ảnh đầu trang). */
    var kh = $('#vntKhung'); if (!kh) return;
    var chuoi = con.filter(function (y) { return y.loai === 'chuoi' && y.anh && y.anh.length; });
    var y = chuoi[9] || chuoi[1] || con.filter(function (z) { return z.anh && z.anh.length; })[1]; if (!y) return;
    kh.innerHTML = '<div class="vk-man"><a class="vk-anh" href="' + linkSp(y) + '" tabindex="-1">' + hinh(y.anh[0], y.ten, 1400) + '</a>' +
      '<div class="vk-tt"><small>Một món đang có ở cửa hàng</small><b>' + e(y.ten) + '</b><span>Mã ' + e(y.ma) + ' · ' + gia(y.gia) + '</span>' +
      '<p>Ảnh chụp chính món này — món bạn nhận là món trong ảnh.</p><a class="nut" href="' + linkSp(y) + '">Xem món này' + MUI_DI + '</a></div></div>';
    kh.hidden = false;
    if (IT) { kh.classList.add('phang'); return; }
    var hen = 0;
    function cap() {
      hen = 0;
      var r = kh.parentNode.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return;   // đo khung bọc (không bị transform)
      var p = kep((innerHeight - r.top) / Math.max(1, (innerHeight + Math.min(kh.offsetHeight, innerHeight)) / 2), 0, 1), q = 1 - Math.pow(1 - p, 2);   // phẳng khi khung vào giữa màn hình
      kh.style.setProperty('--p', q.toFixed(4));
      kh.style.transform = 'perspective(' + Math.round(1500 * soZ()) + 'px) rotateX(' + (30 * (1 - q)).toFixed(2) + 'deg) scale(' + (.8 + .2 * q).toFixed(4) + ')';
      kh.classList.toggle('phang', p > .97);
    }
    addEventListener('scroll', function () { if (!hen) hen = requestAnimationFrame(cap); }, {passive: true});
    addEventListener('resize', cap); cap();
  });
})();

/* ---------- CHÍNH SÁCH: #318 đường giao hàng tự vẽ theo độ cuộn ----------
   Từ "Ngọc Trầm" tới "Nhà bạn", nét uốn lượn vẽ tới đâu theo độ cuộn tới đó, kiện hàng nhỏ chạy theo đầu nét.
   Các mốc là câu lấy NGUYÊN VĂN từ chính sách giao hàng (CH.chinhSach.giao, sửa ở app) — không có câu khớp thì bỏ mốc đó. */
if (TRANG === 'chinh-sach') (function () {
  var sec = $('#giao-hang'), G = CHINH_SACH.giao || []; if (!sec || !G.length) return;
  function cau(re) {   // câu (trong chính sách) có chứa re
    for (var i = 0; i < G.length; i++) {
      var c = G[i].split(/\.\s+/).filter(function (s) { return re.test(s); })[0];
      if (c) return c.replace(/\.?\s*$/, '.');
    }
    return '';
  }
  var IC = {
    nha: '<path d="M4 20V10l8-6 8 6v10"/><path d="M9.5 20v-6h5v6"/>',
    video: '<rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="M15.5 10.5l5-3v9l-5-3"/>',
    hop: '<path d="M3.5 8.5h17v4h-17zM5 12.5v8h14v-8M12 8.5v12"/>',
    xe: '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>',
    lich: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    tay: '<path d="M4 11.5l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M9.5 15.2l1.8 1.8 3.4-3.6"/>'
  };
  var MOC = [
    {ic: 'nha', tieu: 'Ngọc Trầm', noi: LIEN_HE.diaChi || 'Cửa hàng'},
    {ic: 'video', tieu: 'Quay video món hàng', noi: cau(/video/i)},
    {ic: 'hop', tieu: 'Đóng hộp chống sốc', noi: cau(/đóng hộp/i)},
    {ic: 'xe', tieu: 'Gửi đi', noi: cau(/Vietnam Post|toàn quốc/i)},
    {ic: 'lich', tieu: 'Trên đường tới bạn', noi: cau(/\d\s*[–-]\s*\d+\s*ngày/i)},
    {ic: 'tay', tieu: 'Nhà bạn', noi: cau(/kiểm tra hàng/i) || 'Nhận hàng.'}
  ].filter(function (m) { return m.noi; });
  if (MOC.length < 4) return;
  var dv = document.createElement('div'); dv.className = 'cs-duong';
  dv.innerHTML = '<p class="cd-nho">Hành trình một món hàng</p><div class="cd-khung"><svg class="cd-svg" aria-hidden="true" focusable="false"><path class="cd-nen"/><path class="cd-ve"/></svg>' +
    '<span class="cd-kien" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 8.5h17v4h-17z" fill="#d1ad66"/><path d="M5 12.5h14v8H5z" fill="#fbf8f2"/><path d="M12 8.5v12" stroke="#a8823a" stroke-width="1.6"/>' +
    '<path d="M12 8.5S10.5 4 8 4.5 7 8.5 12 8.5zm0 0s1.5-4.5 4-4 1 4-4 4z" fill="none" stroke="#a8823a" stroke-width="1.4" stroke-linejoin="round"/><path d="M3.5 8.5h17v4h-17zM5 12.5v8h14v-8" fill="none" stroke="#a8823a" stroke-width="1.3" stroke-linejoin="round"/></svg></span>' +
    '<ol class="cd-moc">' + MOC.map(function (m, i) {
      return '<li class="cd-o' + (i === 0 ? ' dau' : i === MOC.length - 1 ? ' cuoi' : '') + '"><i class="cd-cham" aria-hidden="true">' + _sv(IC[m.ic]) + '</i>' +
        '<div class="cd-the"><b>' + e(m.tieu) + '</b><span>' + e(m.noi) + '</span></div></li>';
    }).join('') + '</ol></div>';
  sec.querySelector('.ds-tp').insertAdjacentElement('afterend', dv);
  var khung = dv.querySelector('.cd-khung'), svg = dv.querySelector('.cd-svg'), nen = dv.querySelector('.cd-nen'), net = dv.querySelector('.cd-ve'),
      kien = dv.querySelector('.cd-kien'), li = $$('.cd-o'), mau = [], dai = 0, hen = 0;
  function doLai() {
    var kr = khung.getBoundingClientRect(), z = soZ(), A = 30 * z;
    if (!kr.width) return;
    var tam = li.map(function (l) { var c = l.querySelector('.cd-cham').getBoundingClientRect(); return {x: c.left + c.width / 2 - kr.left, y: c.top + c.height / 2 - kr.top}; });
    mau = [{x: tam[0].x, y: tam[0].y, l: 0}]; dai = 0;
    for (var i = 0; i < tam.length - 1; i++) {   // mỗi đoạn là nửa chu kỳ sin, đổi phía luân phiên → đường uốn lượn liền mạch
      var a = tam[i], b = tam[i + 1], dau = i % 2 ? -1 : 1, N = 28;
      for (var k = 1; k <= N; k++) {
        var t = k / N, x = a.x + (b.x - a.x) * t + dau * A * Math.sin(Math.PI * t), yy = a.y + (b.y - a.y) * t, tr = mau[mau.length - 1];
        dai += Math.hypot(x - tr.x, yy - tr.y); mau.push({x: x, y: yy, l: dai});
      }
    }
    li.forEach(function (l, i) { l._l = mau[Math.min(mau.length - 1, i * 28)].l; });   // độ dài đường tới từng mốc
    var d = 'M' + mau.map(function (m) { return m.x.toFixed(1) + ' ' + m.y.toFixed(1); }).join('L');
    svg.setAttribute('width', kr.width); svg.setAttribute('height', kr.height); svg.setAttribute('viewBox', '0 0 ' + kr.width.toFixed(1) + ' ' + kr.height.toFixed(1));
    nen.setAttribute('d', d); net.setAttribute('d', d);
    net.style.strokeDasharray = dai.toFixed(1) + ' ' + (dai + 10).toFixed(1);
    cap();
  }
  function diemTai(yy) {   // điểm trên đường ứng với độ cao yy (đường luôn đi xuống)
    if (yy <= mau[0].y) return {i: 0, m: mau[0]};
    for (var i = 1; i < mau.length; i++) if (mau[i].y >= yy) {
      var a = mau[i - 1], b = mau[i], t = (yy - a.y) / Math.max(.001, b.y - a.y);
      return {i: i, m: {x: a.x + (b.x - a.x) * t, y: yy, l: a.l + (b.l - a.l) * t}};
    }
    return {i: mau.length - 1, m: mau[mau.length - 1]};
  }
  function cap() {
    hen = 0; if (!mau.length) return;
    var kr = khung.getBoundingClientRect();
    if (kr.bottom < -200 || kr.top > innerHeight + 200) return;
    var d = diemTai(IT ? 1e9 : innerHeight * .6 - kr.top), m = d.m, a = mau[Math.max(0, d.i - 1)], b = mau[Math.min(mau.length - 1, d.i + 1)];
    net.style.strokeDashoffset = (dai - m.l).toFixed(1);
    var goc = Math.atan2(b.x - a.x, b.y - a.y) * -180 / Math.PI * .45;   // kiện hàng ngả nhẹ theo hướng đi
    kien.style.transform = 'translate(' + m.x.toFixed(1) + 'px,' + m.y.toFixed(1) + 'px) rotate(' + goc.toFixed(1) + 'deg)';
    kien.classList.toggle('toi', m.l >= dai - 1);
    li.forEach(function (l) { l.classList.toggle('toi', m.l >= l._l - 2); });
  }
  if (!IT) addEventListener('scroll', function () { if (!hen) hen = requestAnimationFrame(cap); }, {passive: true});
  addEventListener('resize', doLai);
  doLai(); if (document.fonts) document.fonts.ready.then(doLai);
  setTimeout(doLai, 1300);   // phần mục hiện dần xong thì đo lại cho chắc
})();

/* ---------- CHỌN SIZE: #313 vòng tay hạt ngọc co giãn theo cỡ tay đang chọn ----------
   Vòng = chu vi chuỗi khi xâu (cỡ tay + 1,5 cm), hạt 8 ly, số hạt đúng theo công thức của bảng; đổi cỡ thì vòng co giãn mượt (lò xo)
   và các hạt nảy nhẹ lần lượt. Chỉ nghe sự kiện input của #szTay (thước #464 cũng phát input) — không đụng phần tính toán có sẵn. */
if (TRANG === 'chon-size') (function () {
  var inp = $('#szTay'), gt = $('#szTinh .sz-gt'); if (!inp || !gt) return;
  var LY = 8, S = 27, hatCua = function (t) { return Math.max(16, Math.round((t + 1.5) * 10 / LY)); };
  var hop = document.createElement('div'); hop.className = 'sz-vong-tay'; hop.setAttribute('aria-hidden', 'true');
  hop.innerHTML = '<svg viewBox="-120 -120 240 240"><defs>' +
    '<radialGradient id="szNgoc" cx="36%" cy="32%" r="72%"><stop offset="0" stop-color="#e3f0e6"/><stop offset=".4" stop-color="#8fbea6"/><stop offset="1" stop-color="#3d6f5d"/></radialGradient>' +
    '<radialGradient id="szVang" cx="36%" cy="32%" r="72%"><stop offset="0" stop-color="#fff3d6"/><stop offset=".45" stop-color="#d1ad66"/><stop offset="1" stop-color="#8a6526"/></radialGradient></defs>' +
    '<ellipse class="bong" cx="0" cy="106" rx="70" ry="7"/><circle class="day" r="60"/><g class="hat"></g>' +
    '<text class="so" y="2">0</text><text class="nho" y="22">hạt ' + LY + ' ly</text></svg>';
  gt.parentNode.insertBefore(hop, gt);
  var gHat = hop.querySelector('.hat'), day = hop.querySelector('.day'), bong = hop.querySelector('.bong'), so = hop.querySelector('.so'), NS = 'http://www.w3.org/2000/svg';
  var n = 0, hat = [], R = 0, vR = 0, Rd = 0, raf = 0, last = 0;
  function datHat(m) {
    gHat.innerHTML = ''; hat = [];
    for (var i = 0; i < m; i++) {
      var c = document.createElementNS(NS, 'circle'); c.setAttribute('fill', i === 0 ? 'url(#szVang)' : 'url(#szNgoc)');
      gHat.appendChild(c); hat.push(c);
    }
    n = m; so.textContent = m;
  }
  function ve() {
    var br = Math.min(13, R * Math.sin(Math.PI / n) * .97);
    hat.forEach(function (c, i) {
      var a = Math.PI / 2 + i * 2 * Math.PI / n;   // hạt vàng nằm dưới đáy
      c.setAttribute('cx', (Math.cos(a) * R).toFixed(2)); c.setAttribute('cy', (Math.sin(a) * R).toFixed(2));
      c.setAttribute('r', (i === 0 ? br * .82 : br).toFixed(2));
    });
    day.setAttribute('r', R.toFixed(2));
    bong.setAttribute('cy', (R + br + 9).toFixed(1)); bong.setAttribute('rx', (R * .78).toFixed(1));
  }
  function khung(now) {
    raf = 0;
    var dt = Math.min(.032, Math.max(.001, (now - last) / 1000)); last = now;
    vR += ((Rd - R) * 170 - vR * 17) * dt; R += vR * dt;
    if (Math.abs(Rd - R) < .02 && Math.abs(vR) < .05) { R = Rd; vR = 0; } else raf = requestAnimationFrame(khung);
    ve();
  }
  function nay() {
    if (IT || !hat[0] || !hat[0].animate) return;
    hat.forEach(function (c, i) {
      c.animate([{transform: 'scale(1)'}, {transform: 'scale(1.22)', offset: .35}, {transform: 'scale(.94)', offset: .7}, {transform: 'scale(1)'}],
        {duration: 460, delay: i * 14, easing: 'ease-out'});
    });
  }
  function cap() {
    var t = +inp.value; if (!t) return;
    var m = hatCua(t), doi = m !== n;
    Rd = (t + 1.5) / (2 * Math.PI) * S;
    if (doi) datHat(m);
    if (IT || !R) { R = Rd; vR = 0; ve(); }
    else { ve(); if (!raf) { last = performance.now(); raf = requestAnimationFrame(khung); } }
    if (doi) nay();
  }
  inp.addEventListener('input', cap); cap();
})();

/* ---------- LIÊN HỆ: #008 nút chép số điện thoại và địa chỉ (lấy từ CH.lienHe như các thẻ) ----------
   Bấm thì chép; biểu tượng hai ô vuông chồng nhau vẽ lại thành dấu tích rồi trở về. */
if (TRANG === 'lien-he') (function () {
  var CHEP = [['Địa chỉ', LIEN_HE.diaChi, 'Chép địa chỉ', 'Đã chép địa chỉ cửa hàng'], ['Điện thoại', LIEN_HE.sdt, 'Chép số điện thoại', 'Đã chép số điện thoại']];
  var IC = '<svg class="cp" viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/></svg>' +
    '<svg class="ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.2 4.2L18.5 8" pathLength="1"/></svg>';
  function chep(s) {
    try { if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(s).then(function () { return true; }, function () { return cu(s); }); } catch (er) {}
    return Promise.resolve(cu(s));
  }
  function cu(s) {   // cách cũ cho trình duyệt không có clipboard API
    var t = document.createElement('textarea'); t.value = s; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(t); t.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (er) {} t.remove(); return ok;
  }
  $$('#lhThe .lh-the').forEach(function (the) {
    var nho = (the.querySelector('small') || {}).textContent || '', c = CHEP.filter(function (x) { return x[1] && nho.indexOf(x[0]) === 0; })[0];
    var b = the.querySelector('b'); if (!c || !b) return;
    var hang = document.createElement('div'); hang.className = 'lh-chep-hang';
    b.parentNode.insertBefore(hang, b); hang.appendChild(b);
    var nut = document.createElement('button'); nut.type = 'button'; nut.className = 'lh-chep'; nut.setAttribute('aria-label', c[2]); nut.innerHTML = IC;
    hang.appendChild(nut);
    var hen = 0;
    nut.addEventListener('click', function () {
      chep(String(c[1])).then(function (ok) {
        if (!ok) { baoTin('Chưa chép được — bạn giữ tay vào chữ để chép nhé', 'loi'); return; }
        clearTimeout(hen); nut.classList.remove('da'); void nut.offsetWidth; nut.classList.add('da'); nut.setAttribute('aria-label', 'Đã chép');
        baoTin(c[3]);
        hen = setTimeout(function () { nut.classList.remove('da'); nut.setAttribute('aria-label', c[2]); }, 1800);
      });
    });
  });
})();

/* ---------- 404: #360 chạm / bấm dòng chữ lớn thì các chữ bay tung toé, xoay, lơ lửng một chút rồi ghép lại đúng chỗ ----------
   Chỉ tách chữ của tiêu đề h1 — la bàn #089 không đụng tới. */
if (TRANG === '404') (function () {
  var h = $('.tp-404 h1'); if (!h || IT) return;
  h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
  function tach(goc) {
    [].slice.call(goc.childNodes).forEach(function (nd) {
      if (nd.nodeType === 1) { tach(nd); return; }
      if (nd.nodeType !== 3) return;
      var f = document.createDocumentFragment();
      nd.textContent.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(' ')); return; }
        var tu = document.createElement('span'); tu.className = 'tu'; tu.setAttribute('aria-hidden', 'true');
        Array.from(w).forEach(function (ch) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; tu.appendChild(s); });
        f.appendChild(tu);
      });
      goc.replaceChild(f, nd);
    });
  }
  tach(h); h.classList.add('tung-duoc'); h.tabIndex = 0;
  var bay = false;
  function tung() {
    if (bay || !h.animate) return; bay = true;
    var z = soZ(), chu = $$('.tp-404 h1 .ch'), xa = innerWidth < 600 ? 140 : 260, tre = 0;
    chu.forEach(function (c) {
      var r = c.getBoundingClientRect(), g = Math.random() * Math.PI * 2, d = (.45 + Math.random() * .55) * xa * z;
      var dx = Math.cos(g) * d, dy = Math.sin(g) * d * .8 - 30 * z;
      dx = kep(r.left + dx, 8, innerWidth - 8 - r.width) - r.left;   // không bay ra ngoài màn hình
      dy = kep(r.top + dy, 8, innerHeight - 8 - r.height) - r.top;
      var q = (Math.random() < .5 ? -1 : 1) * (120 + Math.random() * 300), TG = 1500 + Math.random() * 300;
      tre = Math.max(tre, TG);
      c.animate([
        {transform: 'translate(0,0) rotate(0deg)', easing: 'cubic-bezier(.2,.75,.3,1)'},
        {transform: 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) rotate(' + q.toFixed(0) + 'deg)', offset: .36, easing: 'ease-in-out'},
        {transform: 'translate(' + (dx * 1.04).toFixed(1) + 'px,' + (dy * 1.04 + 5).toFixed(1) + 'px) rotate(' + (q * 1.06).toFixed(0) + 'deg)', offset: .56, easing: 'cubic-bezier(.45,0,.2,1.3)'},
        {transform: 'translate(0,0) rotate(0deg)'}
      ], {duration: TG});
    });
    setTimeout(function () { bay = false; }, tre + 50);
  }
  h.addEventListener('click', tung);
  h.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tung(); } });
})();

/* tiêu đề đầu các trang phụ hiện ngay khi mở */
requestAnimationFrame(function () { setTimeout(function () { $$('.tp-dau .tieu-de,.tp-dau [data-hien]').forEach(function (x) { x.classList.add('hien'); }); }, 120); });
