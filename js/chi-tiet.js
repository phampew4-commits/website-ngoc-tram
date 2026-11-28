/* Trang chi tiết sản phẩm: san-pham.html?ma=<mã> */
/* cách giữ: món trầm (x.tram) dùng GIU_TRAM, còn lại GIU_NGOC */
function khoiGiu(tieu, ds) {
  return '<details><summary>' + tieu + '</summary><div class="tl"><div><ul class="ds-tp cham-soc">' +
    (ds || []).map(function (x) { return '<li><b>' + e(x.tieu) + '.</b> ' + e(x.noi) + '</li>'; }).join('') + '</ul></div></div></details>';
}
var GIU_NGOC = khoiGiu('Giữ ngọc luôn đẹp', (CH.chamSoc || {}).ngoc);
var GIU_TRAM = khoiGiu('Giữ trầm luôn thơm', (CH.chamSoc || {}).tram);

var maSp = new URLSearchParams(location.search).get('ma') || '';
/* ?si=1: khách sỉ xem chi tiết — giá là giá sỉ (giải từ data/si.json bằng js/si.js), không giỏ hàng / yêu thích / gợi ý giá lẻ.
   Máy chưa đăng nhập tài khoản sỉ → về si.html đăng nhập rồi quay lại đúng món này. */
var CHE_SI = new URLSearchParams(location.search).get('si') === '1' && typeof SI !== 'undefined';
if (CHE_SI) document.documentElement.classList.add('che-si');

Promise.all([taiDuLieu, CHE_SI ? SI.san() : null]).then(function (r) {
  if (CHE_SI && !r[1]) { location.replace('si.html?ve=' + encodeURIComponent(maSp)); return; }
  var x = ds.filter(function (y) { return khoa(y) === maSp; })[0] || ds.filter(function (y) { return y.ma === maSp; })[0];
  if (!x) return khongThay();
  dungTrang(x);
  dungXemKi(x);
  dungQuy();
  if (!CHE_SI) { dungPhoiCharm(x); dungTronBo(x); }
  dungLienQuan(x);
  dungHd(x);
  if (!CHE_SI) dungDaXem(x);
  thuGonTT();
  if (CHE_SI) SI.ve();
}).catch(khongThay);
function giaSiCua(x) { return SI.du && SI.du.g[khoa(x)] || 0; }
function linkCt(k) { return CHE_SI ? SI.ct(k) : 'san-pham.html?ma=' + encodeURIComponent(k); }

function khongThay() {
  moManNoi();
  document.title = 'Không tìm thấy sản phẩm · Ngọc Trầm Store';
  $('#spChinh').innerHTML = '<div class="khong-thay"><span class="nho">Mã ' + e(maSp || '—') + '</span><h1>Không tìm thấy <em>sản phẩm này</em></h1>' +
    '<p>Món này có thể đã được bán hoặc mã chưa đúng. Bạn xem các món khác hoặc nhắn cửa hàng nhé.</p>' +
    '<div class="hang"><a class="nut dac" href="' + (CHE_SI ? 'si.html' : 'index.html#san-pham') + '">Xem sản phẩm khác</a><a class="nut" href="' + linkZalo() + '" target="_blank">Nhắn Zalo</a></div></div>';
}

/* thông số rút ra từ tên + dữ liệu */
function thongSo(x) {
  var t = x.ten + ' ' + (x.mo_ta || ''), r = [];
  r.push(['Dòng sản phẩm', LOAI[x.loai].ten]);
  var ngoc = nhanSp(x).split(' · ')[0];
  if (ngoc && ngoc !== LOAI[x.loai].ngan) r.push([x.tram ? 'Loại hạt' : 'Chất ngọc', ngoc]);
  var co = /(\d+(?:[.,]\d+)?) ly/.exec(x.ten); if (co && x.loai !== 'charm') r.push(['Cỡ hạt', co[1].replace('.', ',') + ' ly']);
  var v = /vàng (\d\dK)/i.exec(t); if (v) r.push([x.loai === 'chuoi' ? 'Charm' : 'Chất liệu vàng', 'Vàng ' + v[1].toUpperCase()]);
  else if (/bạc|925/i.test(t)) r.push([x.loai === 'chuoi' ? 'Chất liệu charm' : 'Chất liệu', /phủ vàng/i.test(t) ? 'Bạc 925 phủ vàng' : 'Bạc 925']);
  r.push(['Mã sản phẩm', x.ma]);
  r.push(['Tình trạng', x.tt || 'Còn hàng']);
  return r;
}

function dungTrang(x) {
  var tt = x.tt || 'Còn hàng', loai = LOAI[x.loai];
  document.title = x.ten + ' · Ngọc Trầm Store';
  var md = document.querySelector('meta[name="description"]'); if (md && !CHE_SI) md.content = x.ten + ' – ' + gia(x.gia) + '. Ảnh thật, mã ' + x.ma + ', hỏi mua qua Zalo.';
  var gs = CHE_SI ? giaSiCua(x) : 0, ban = /bán/i.test(tt);
  if (CHE_SI) {
    document.title = x.ten + ' · Giá sỉ · Ngọc Trầm Store';
    $('#duong').innerHTML = '<a href="index.html">Trang chủ</a><span>/</span><a href="si.html">Khách sỉ</a><span>/</span><a href="si.html#loai=' + x.loai + '">' + loai.ten + '</a><span>/</span><b>' + e(x.ma) + '</b>';
  } else
  $('#duong').insertAdjacentHTML('beforeend', '<span>/</span><a href="index.html#san-pham" data-loai="' + x.loai + '">' + loai.ten + '</a><span>/</span><b>' + e(x.ma) + '</b>');

  var tp = x.tp && x.tp.length ? '<ul class="ds-tp">' + x.tp.map(function (c) { return '<li>' + e(c) + '</li>'; }).join('') + '</ul>' : '';
  $('#spChinh').innerHTML =
    '<div class="sp-anh">' +
      '<div class="khung-anh" id="khungAnh" data-mo-anh>' + x.anh.map(function (id, i) {
        return '<figure class="' + (i ? '' : 'on') + '" data-i="' + i + '">' + hinh(id, x.ten + ' – ảnh ' + (i + 1), 1400).replace(i ? '' : ' loading="lazy"', '') + '</figure>'; }).join('') +
        (x.anh.length > 1 ? '<button class="mui-ten trai" data-buoc="-1" aria-label="Ảnh trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg></button>' +
          '<button class="mui-ten phai" data-buoc="1" aria-label="Ảnh sau"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg></button>' +
          '<span class="dem-anh" id="demAnh">01 / ' + ('0' + x.anh.length).slice(-2) + '</span>' : '') +
        '<span class="goi-soi" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M8 10.5h5M10.5 8v5"/></svg>' +
          (matchMedia('(hover:hover) and (pointer:fine)').matches ? 'Rê chuột để soi' : 'Chạm giữ để soi') + '</span>' +
      '</div>' +
      (x.anh.length > 1 ? '<div class="nho-anh" id="nhoAnh">' + x.anh.map(function (id, i) {
        return '<button class="' + (i ? '' : 'on') + '" data-i="' + i + '" aria-label="Ảnh ' + (i + 1) + '">' + hinh(id, '', 240) + '</button>'; }).join('') + '</div>' : '') +
    '</div>' +
    '<div class="sp-tt">' +
      '<div class="dinh">' +
        '<span class="nho" data-hien>' + loai.ten + ' · ' + e(nhanSp(x)) + '</span>' +
        '<h1 class="tieu-de"><span class="dong-chu"><span>' + e(x.ten) + '</span></span></h1>' +
        '<div class="ma-ct" data-hien><span>Mã ' + e(x.ma) + '</span><span class="chip' + (/bán/i.test(tt) ? ' ban' : '') + '">' + e(tt) + '</span></div>' +
        (CHE_SI ? '<div class="gia-sp si-gia" data-hien><b>' + (gs ? gia(gs) : 'Hỏi giá sỉ') + '</b><small>' + (gs ? 'Giá sỉ · dành cho khách sỉ' : 'Nhắn Zalo để được báo giá sỉ') + '</small></div>' +
          '<div class="hang-mua" data-hien>' +
            '<a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" rel="noopener" data-chep-si="' + e(khoa(x)) + '">Hỏi sỉ qua Zalo</a>' +
            (ban ? '' : '<button class="nut" data-si-ds="' + e(khoa(x)) + '" data-chu></button>') +
          '</div>' +
          '<p class="ghi-ct" data-hien>Bấm "Hỏi sỉ qua Zalo", mã và giá sỉ được chép sẵn — bạn chỉ cần dán vào tin nhắn. Lấy nhiều món thì gom vào <a class="si-xem-ds" href="si.html#ds">danh sách hỏi sỉ<i data-so-si hidden></i></a> rồi gửi một lần.</p>' +
          '<div class="si-an">' : '') +
        '<div class="gia-sp" data-hien><b>' + gia(x.gia) + '</b><small>' + (x.gia ? 'Giá bán lẻ · mỗi món chỉ có một' : 'Nhắn shop để được báo giá') + '</small></div>' +
        '<div class="hang-mua" data-hien>' +
          (/bán/i.test(tt) ? '' : '<button class="nut dac" data-gio="' + e(khoa(x)) + '">Thêm vào giỏ</button>') +
          '<a class="nut zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Hỏi mua qua Zalo</a>' +
          '<a class="nut" href="' + linkFb() + '" target="_blank" data-chep="' + e(x.ma) + '">Nhắn Messenger</a>' +
          '<button class="nut nut-yt" id="nutYt" data-ma="' + e(x.ma) + '"><span>♡</span> Lưu vào yêu thích</button>' +
        '</div>' +
        '<p class="ghi-ct" data-hien>Bấm nút, câu hỏi kèm mã ' + e(x.ma) + ' được chép sẵn — bạn chỉ cần dán vào tin nhắn.</p>' +
        (x.gia && !/bán/i.test(tt) ? '<p class="ship-sp" data-hien><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>' +
          (x.gia >= NGUONG_SHIP ? '<span>Món này được <b>miễn ship</b> khi chuyển khoản trước.</span>'
                                : '<span>Mua thêm <b>' + gia(NGUONG_SHIP - x.gia) + '</b> để được <b>miễn ship</b> (chuyển khoản trước).</span>') + '</p>' : '') +
        (CHE_SI ? '</div>' : '') +
        '<div id="phoiCharm"></div>' +
        '<ul class="cam-ket-sp" data-hien>' +
          '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg><span>Ảnh thật<small>Chụp đúng món</small></span></li>' +
          '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/></svg><span>Xem video<small>Gửi trước khi chốt</small></span></li>' +
          '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg><span>Giao toàn quốc<small>Đóng hộp cẩn thận</small></span></li>' +
        '</ul>' +
        '<div class="mo-rong" data-hien>' +
          '<details open><summary>Thông tin sản phẩm</summary><div class="tl"><div>' +
            (x.mo_ta && x.mo_ta.length > 30 && !/^đi kèm/i.test(x.mo_ta) ? '<p class="mo-ta-sp">' + e(x.mo_ta) + '</p>' : '') +
            (x.ct && x.ct.length ? '<p class="nhan-tp">Chi tiết món</p><ul class="ds-ct">' + x.ct.map(function (d) { return '<li>' + e(d) + '</li>'; }).join('') + '</ul>' : '') +
            '<dl class="bang-ts">' +
            thongSo(x).map(function (r) { return '<div><dt>' + e(r[0]) + '</dt><dd>' + e(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
            (tp && !(x.ct && x.ct.length) ? '<p class="nhan-tp">Charm đi kèm</p>' + tp : '') + '</div></div></details>' +
          '<details><summary>Giao hàng</summary><div class="tl"><div>' + dsCs('giao') + '</div></div></details>' +
          '<details><summary>Đổi trả &amp; bảo hành</summary><div class="tl"><div><p class="nhan-tp">Đổi trả</p>' + dsCs('doi') + '<p class="nhan-tp">Bảo hành</p>' + dsCs('bh') + '<p class="nhan-tp">Lưu ý về charm vàng</p>' + dsCs('luuY') + '</div></div></details>' +
          (x.tram ? GIU_TRAM : GIU_NGOC) +
          '' +
          ''  +
        '</div>' +
      '</div>' +
    '</div>';

  /* thanh mua dính dưới đáy (điện thoại) */
  $('#thanhMua').innerHTML = CHE_SI
    ? '<div><small>Mã ' + e(x.ma) + ' · giá sỉ</small><b>' + (gs ? gia(gs) : 'Hỏi giá') + '</b></div>' +
      '<a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" rel="noopener" data-chep-si="' + e(khoa(x)) + '">Hỏi sỉ qua Zalo</a>'
    : '<div><small>Mã ' + e(x.ma) + '</small><b>' + gia(x.gia) + '</b></div>' +
    (/bán/i.test(tt) ? '<a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Hỏi mua qua Zalo</a>'
                     : '<button class="nut dac" data-gio="' + e(khoa(x)) + '">Thêm vào giỏ</button>');
  veNutThem();
  var hm = $('.hang-mua'), lq = $('#lien-he');
  function thanh() { $('#thanhMua').classList.toggle('hien', hm.getBoundingClientRect().bottom < 0 && lq.getBoundingClientRect().top > innerHeight); }
  addEventListener('scroll', thanh, {passive: true}); thanh();

  theoDoi($('#spChinh'));
  requestAnimationFrame(function () { $('#khungAnh').classList.add('hien'); $('.sp-tt .tieu-de').classList.add('hien'); });
  boAnh(x);
}

/* bộ ảnh: mũi tên, ảnh nhỏ, vuốt, phím · rê chuột / chạm giữ để soi bằng kính lúp (#356) · bấm để phóng toàn màn hình (#061) */
function boAnh(x) {
  var n = x.anh.length, i = 0, k = $('#khungAnh'), lup;
  function toi(j) {
    i = (j + n) % n;
    $$('#khungAnh figure').forEach(function (f, t) { f.classList.toggle('on', t === i); });
    $$('#nhoAnh button').forEach(function (b, t) { b.classList.toggle('on', t === i); });
    if ($('#demAnh')) $('#demAnh').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + n).slice(-2);
    if (lup) lup.moi();
  }
  /* nơi ảnh bay về khi đóng màn xem lớn: chuyển khung chính sang đúng ảnh đang xem (không mờ dần) */
  function nguon(j) {
    if (j !== i) { k.classList.add('tuc'); toi(j); void k.offsetWidth; k.classList.remove('tuc'); }
    var im = k.querySelector('figure.on img'); return im ? {img: im, cat: k} : null;
  }
  k.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-buoc]');
    if (b) return toi(i + +b.dataset.buoc);
    if (lup.vuaSoi()) return;            // vừa chạm giữ để soi → không mở màn xem lớn
    lup.tat(); moDen(x, i, nguon);
  });
  if ($('#nhoAnh')) $('#nhoAnh').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) toi(+b.dataset.i); });
  addEventListener('keydown', function (ev) { if (ev.key === 'ArrowLeft') toi(i - 1); if (ev.key === 'ArrowRight') toi(i + 1); });
  var x0 = null;
  k.addEventListener('touchstart', function (ev) { x0 = ev.touches.length === 1 ? ev.touches[0].clientX : null; }, {passive: true});
  k.addEventListener('touchend', function (ev) {
    if (x0 == null || lup.dangSoi() || lup.vuaSoi()) { x0 = null; return; }
    var d = ev.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) toi(i + (d < 0 ? 1 : -1)); x0 = null;
  });
  lup = kinhLup(k, x, function () { return i; });
  /* trang mở từ thẻ món ở trang trước (#328): đợi ảnh chính tải xong rồi mới vén màn */
  if (window.NO_RA) {
    var im = k.querySelector('figure.on img');
    if (!im || im.complete) moManNoi(); else { im.addEventListener('load', moManNoi); im.addEventListener('error', moManNoi); }
  }
}

/* ---------- #356 kính lúp ----------
   máy tính: rê chuột trên ảnh chính → vòng kính theo chuột (đuổi mượt bằng rAF), soi ảnh nét cao (tải khi bắt đầu rê)
   điện thoại: chạm giữ ~0,3 giây → kính hiện phía trên ngón tay, kéo để soi, nhấc tay là tắt; vuốt nhanh vẫn đổi ảnh như cũ */
var ZOOM_LUP = 2.5;
function kinhLup(k, x, layI) {
  var lup = document.createElement('div'), limg = document.createElement('img');
  lup.className = 'kinh-lup'; lup.setAttribute('aria-hidden', 'true');
  limg.alt = ''; limg.referrerPolicy = 'no-referrer'; limg.decoding = 'async';
  lup.appendChild(limg); lup.insertAdjacentHTML('beforeend', '<b>' + String(ZOOM_LUP).replace('.', ',') + '×</b>');
  document.body.appendChild(lup);
  var bat = false, cham = false, lech = 0, D = 0, T = {x: 0, y: 0}, C = {x: 0, y: 0}, raf = 0, luc = 0, nhay = true, kt = {}, cao = {}, vua = 0, hen = 0, t0 = null;

  function nguonCao(id, im) {                 // ảnh nét: tải nền, xong thì thay vào kính
    var u = anh(id, 2400);
    if (cao[id] === 2) return u;
    if (!cao[id]) {
      cao[id] = 1; var t = new Image(); t.referrerPolicy = 'no-referrer';
      t.onload = function () { cao[id] = 2; if (bat) ve(); }; t.onerror = function () { cao[id] = 3; }; t.src = u;
    }
    return im.currentSrc || im.src;
  }
  function ve() {
    raf = 0; if (!bat) return;
    var now = performance.now(), a = nhay || GIAM ? 1 : 1 - Math.pow(.62, Math.min(4, (now - luc) / 16.7)); luc = now; nhay = false;
    C.x += (T.x - C.x) * a; C.y += (T.y - C.y) * a;
    var im = k.querySelector('figure.on img'); if (!im) return;
    var src = nguonCao(x.anh[layI()], im);
    if (limg._u !== src) { limg.src = src; limg._u = src; }
    var R = hinhHoc(im).R;
    if (R.w !== kt.w || R.h !== kt.h) { limg.style.width = R.w * ZOOM_LUP + 'px'; limg.style.height = R.h * ZOOM_LUP + 'px'; kt = R; }
    var cy = cham ? Math.max(D / 2 + 12, C.y - lech) : C.y;      // điện thoại: kính nằm trên ngón tay
    lup.style.translate = (C.x - D / 2) + 'px ' + (cy - D / 2) + 'px';
    limg.style.transform = 'translate3d(' + (D / 2 - (C.x - R.l) * ZOOM_LUP) + 'px,' + (D / 2 - (C.y - R.t) * ZOOM_LUP) + 'px,0)';
    if (Math.abs(T.x - C.x) > .2 || Math.abs(T.y - C.y) > .2) raf = requestAnimationFrame(ve);
  }
  function dat(cx, cy) {
    var r = k.getBoundingClientRect();
    if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return tat();
    T.x = cx; T.y = cy;
    if (!bat) {
      bat = true; nhay = true; D = lup.offsetWidth; lech = cham ? D * .8 : 0;
      k.classList.add('soi'); lup.classList.add('hien');
    }
    if (!raf) { luc = performance.now(); raf = requestAnimationFrame(ve); }
  }
  function tat() {
    if (!bat) return; bat = false; k.classList.remove('soi'); lup.classList.remove('hien');
    if (cham) { cham = false; vua = Date.now(); }
  }

  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    k.addEventListener('mouseenter', function () { var im = k.querySelector('figure.on img'); if (im) nguonCao(x.anh[layI()], im); });
    k.addEventListener('mousemove', function (ev) { if (ev.target.closest('button')) return tat(); dat(ev.clientX, ev.clientY); });
    k.addEventListener('mouseleave', tat);
    addEventListener('scroll', function () { if (bat) dat(T.x, T.y); }, {passive: true});
  } else {
    k.addEventListener('touchstart', function (ev) {
      clearTimeout(hen); if (ev.touches.length !== 1 || ev.target.closest('button')) return;
      var t = ev.touches[0]; t0 = {x: t.clientX, y: t.clientY};
      var im = k.querySelector('figure.on img'); if (im) nguonCao(x.anh[layI()], im);
      hen = setTimeout(function () { cham = true; dat(t0.x, t0.y); }, 320);
    }, {passive: true});
    k.addEventListener('touchmove', function (ev) {
      var t = ev.touches[0];
      if (bat) { ev.preventDefault(); T.x = t.clientX; T.y = t.clientY; dat(t.clientX, t.clientY); return; }
      if (t0 && Math.hypot(t.clientX - t0.x, t.clientY - t0.y) > 10) { clearTimeout(hen); t0 = null; }
    }, {passive: false});
    var nha = function () { clearTimeout(hen); t0 = null; tat(); };
    k.addEventListener('touchend', nha); k.addEventListener('touchcancel', nha);
    k.addEventListener('contextmenu', function (ev) { if (bat || t0) ev.preventDefault(); });
  }
  return {tat: tat, moi: function () { if (bat && !raf) raf = requestAnimationFrame(ve); }, dangSoi: function () { return bat; }, vuaSoi: function () { return Date.now() - vua < 450; }};
}

/* hình học một ảnh object-fit:cover trên màn hình: R = cả tấm ảnh, V = phần đang lộ ra (cắt theo khung cat) */
function hinhHoc(img, cat) {
  var b = img.getBoundingClientRect(), nw = img.naturalWidth || b.width || 1, nh = img.naturalHeight || b.height || 1;
  var s = Math.max(b.width / nw, b.height / nh), w = nw * s, h = nh * s;
  var c = (cat || img).getBoundingClientRect();
  return {R: {l: b.left + (b.width - w) / 2, t: b.top + (b.height - h) / 2, w: w, h: h},
          V: {l: Math.max(b.left, c.left), t: Math.max(b.top, c.top), r: Math.min(b.right, c.right), b: Math.min(b.bottom, c.bottom)}};
}
function vuaKhung(nw, nh, o) {   // object-fit:contain trong hình chữ nhật o
  var s = Math.min(o.w / nw, o.h / nh), w = nw * s, h = nh * s, l = o.l + (o.w - w) / 2, t = o.t + (o.h - h) / 2;
  return {R: {l: l, t: t, w: w, h: h}, V: {l: l, t: t, r: l + w, b: t + h}};
}
function trongMan(g) { return g.V.r - g.V.l > 12 && g.V.b - g.V.t > 12 && g.V.b > 0 && g.V.t < innerHeight && g.V.r > 0 && g.V.l < innerWidth; }
/* một tấm ảnh bay từ hình học a sang b — chỉ đổi transform + clip-path nên mượt (không vẽ lại bố cục trang) */
function bay(src, a, b, o) {
  o = o || {};
  var im = document.createElement('img'), B = b.R;
  im.className = 'bay-anh'; im.alt = ''; im.referrerPolicy = 'no-referrer'; im.src = src;
  im.style.cssText = 'left:' + B.l + 'px;top:' + B.t + 'px;width:' + B.w + 'px;height:' + B.h + 'px' + (o.z ? ';z-index:' + o.z : '');
  document.body.appendChild(im);
  function hinh(g) {
    var s = g.R.w / B.w;
    return {transform: 'translate(' + (g.R.l - B.l) + 'px,' + (g.R.t - B.t) + 'px) scale(' + s + ')',
      clipPath: 'inset(' + Math.max(0, (g.V.t - g.R.t) / s) + 'px ' + Math.max(0, (g.R.l + g.R.w - g.V.r) / s) + 'px ' +
        Math.max(0, (g.R.t + g.R.h - g.V.b) / s) + 'px ' + Math.max(0, (g.V.l - g.R.l) / s) + 'px round ' + (g.bo || 0) / s + 'px)'};
  }
  var an = im.animate([hinh(a), hinh(b)], {duration: o.ms || 560, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards'});
  return {im: im, an: an};
}
var BO_GOC = function () { return 4 * (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1); };

/* ảnh lớn: xem kĩ từng góc. Máy tính (≥3 ảnh): dải ảnh dọc, rê vào dải nào dải đó mở rộng (#389).
   Điện thoại / máy cảm ứng: 2 cột so le như cũ. Bấm ảnh nào cũng mở màn xem lớn từ đúng chỗ ảnh đó. */
function dungXemKi(x) {
  if (x.anh.length < 2) return;
  var k = $('#xemKi'), mq = matchMedia('(hover:hover) and (pointer:fine) and (min-width:901px)'), than;
  k.innerHTML = '<div class="khung"><div class="dau-xk"><span class="nho" data-hien>Ảnh thật · chụp đúng món</span>' +
    '<h2 class="tieu-de"><span class="dong-chu"><span>Xem kĩ <em>từng góc</em></span></span></h2>' +
    '<p data-hien>Bấm vào ảnh để xem phóng to. Muốn xem rõ màu ngọc hơn, <a href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">nhắn Ngọc Trầm</a> để nhận video quay trực tiếp món này.</p></div>' +
    '<div class="xk-than"></div></div>';
  than = k.querySelector('.xk-than');
  function dung() {
    var dai = x.anh.length >= 3 && mq.matches;
    than.innerHTML = dai
      ? '<div class="dai-xk" data-hien>' + x.anh.map(function (id, i) {
          return '<button type="button" class="dai' + (i ? '' : ' on') + '" data-i="' + i + '" style="--i:' + i + '" aria-label="Xem ảnh ' + (i + 1) + ' toàn màn hình">' +
            hinh(id, x.ten + ' – ảnh ' + (i + 1), 1200) + '<span class="so">' + ('0' + (i + 1)).slice(-2) + '</span><span class="goi">Bấm để phóng to</span></button>'; }).join('') + '</div>'
      : '<div class="luoi-xk">' + [0, 1].map(function (c) {   // 2 cột so le: ảnh lẻ bên trái, ảnh chẵn bên phải (lệch xuống)
          return '<div class="cot">' + x.anh.map(function (id, i) {
            return i % 2 !== c ? '' : '<figure data-hien data-i="' + i + '"><button type="button" aria-label="Xem ảnh ' + (i + 1) + ' toàn màn hình">' + hinh(id, x.ten + ' – ảnh ' + (i + 1), 1200) + '</button>' +
              '<figcaption>' + ('0' + (i + 1)).slice(-2) + '</figcaption></figure>'; }).join('') + '</div>'; }).join('') + '</div>';
    if (dai && window.ResizeObserver) new ResizeObserver(doDai).observe(than.querySelector('.dai-xk'));
    theoDoi(k);
  }
  function doDai() {   // dải đang mở rộng ≈ khổ ảnh 4:5 của chiều cao hàng
    var c = than.querySelector('.dai-xk'); if (!c) return;
    var n = c.children.length, g = parseFloat(getComputedStyle(c).columnGap) || 0, W = c.clientWidth - g * (n - 1), H = c.clientHeight;
    if (W <= 0 || H <= 0) return;
    var f = Math.min(.6, Math.max(1 / n + .05, H * .8 / W));
    c.style.setProperty('--k', ((n - 1) * f / (1 - f)).toFixed(3));
    c.style.setProperty('--rong', Math.round(W * f) + 'px');
  }
  function chon(d, tuc) {
    var c = d.parentNode; if (d.classList.contains('on')) return;
    if (tuc) c.classList.add('tuc');
    c.querySelectorAll('.dai').forEach(function (b) { b.classList.toggle('on', b === d); });
    if (tuc) { void c.offsetWidth; c.classList.remove('tuc'); }
  }
  var hen;
  than.addEventListener('mouseover', function (ev) {
    var d = ev.target.closest('.dai'); clearTimeout(hen); if (d) hen = setTimeout(function () { chon(d); }, 60);
  });
  than.addEventListener('focusin', function (ev) { var d = ev.target.closest('.dai'); if (d) chon(d); });
  than.addEventListener('click', function (ev) {
    var f = ev.target.closest('[data-i]'); if (!f) return;
    moDen(x, +f.dataset.i, function (j) {
      var o = than.querySelector('[data-i="' + j + '"]'); if (!o) return null;
      if (o.classList.contains('dai')) chon(o, true);
      return {img: o.querySelector('img'), cat: o};
    });
  });
  if (mq.addEventListener) mq.addEventListener('change', dung);
  k.hidden = false;
  dung();
}

/* xem ảnh toàn màn hình (#061): ảnh bay ra từ đúng chỗ ảnh nhỏ, đóng thì thu về chỗ cũ.
   Mũi tên / phím ← → / vuốt ngang để đổi ảnh (ảnh trượt theo tay), vuốt xuống để đóng, Esc để đóng.
   nguon(j) → {img, cat}: ảnh trên trang ứng với ảnh thứ j (để bay ra / bay về); không có thì mờ dần như cũ. */
function moDen(x, i, nguon) {
  var d = $('#denAnh'), n = x.anh.length, truoc = document.activeElement, dangBay = null, anNguon = null;
  d.innerHTML = '<button class="dong" aria-label="Đóng">×</button>' + x.anh.map(function (id, t) { return '<figure data-i="' + t + '">' + hinh(id, x.ten + ' – ảnh ' + (t + 1), 2000) + '</figure>'; }).join('') +
    (n > 1 ? '<button class="mui-ten trai" data-buoc="-1" aria-label="Ảnh trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="mui-ten phai" data-buoc="1" aria-label="Ảnh sau"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg></button>' : '') +
    '<span class="dem-anh"></span>';
  d.className = 'den-anh'; d.style.removeProperty('--nen');
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Ảnh ' + x.ten);
  var fs = d.querySelectorAll('figure');
  function toi(j, huong) {
    var cu = i; i = (j + n) % n;
    if (huong && cu !== i && !GIAM) {     // ảnh mới trượt vào từ phía đi tới, ảnh cũ trượt ra phía kia
      var vao = fs[i], ra = fs[cu];
      vao.style.transition = 'none'; vao.style.translate = (huong * 12) + '% 0'; void vao.offsetWidth;
      vao.style.transition = ''; vao.style.translate = '';
      ra.style.transition = ''; ra.style.translate = (-huong * 12) + '% 0';
      setTimeout(function () { if (!ra.classList.contains('on')) { ra.style.transition = 'none'; ra.style.translate = ''; } }, 650);
    }
    fs.forEach(function (f, t) { f.classList.toggle('on', t === i); });
    d.querySelector('.dem-anh').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + n).slice(-2);
  }
  function xongBay() { if (dangBay) { dangBay.im.remove(); dangBay = null; } if (anNguon) { anNguon.classList.remove('anh-an'); anNguon = null; } }
  function ketThuc() {
    xongBay(); d.hidden = true; d.innerHTML = ''; d.className = 'den-anh'; d.style.removeProperty('--nen'); d._dong = false;
    if (truoc && truoc.focus) try { truoc.focus({preventScroll: true}); } catch (er) {}
  }
  function dong() {
    if (d._dong) return; d._dong = true;
    removeEventListener('keydown', phim, true);
    document.body.classList.remove('khoa-cuon');
    xongBay();
    var f = fs[i], im = f && f.querySelector('img'), ng = !GIAM && nguon ? nguon(i) : null, a, b;
    if (ng && ng.img && ng.img.naturalWidth) {
      b = hinhHoc(ng.img, ng.cat); b.bo = BO_GOC();
      if (im && im.complete && im.naturalWidth) a = hinhHoc(im);
      else { var fr = f.getBoundingClientRect(); a = vuaKhung(ng.img.naturalWidth, ng.img.naturalHeight, {l: fr.left, t: fr.top, w: fr.width, h: fr.height}); }
      a.bo = 3;
    }
    if (b && trongMan(b)) {
      anNguon = ng.img; anNguon.classList.add('anh-an');
      dangBay = bay(im && im.complete && im.naturalWidth ? (im.currentSrc || im.src) : (ng.img.currentSrc || ng.img.src), a, b, {ms: 520});
      d.classList.add('dang-bay'); d.classList.remove('mo');
      dangBay.an.onfinish = ketThuc;
    } else { d.classList.remove('mo'); setTimeout(ketThuc, 350); }
  }
  function phim(ev) { if (ev.key === 'Escape') dong(); else if (ev.key === 'ArrowLeft') toi(i - 1, -1); else if (ev.key === 'ArrowRight') toi(i + 1, 1); else return; ev.stopPropagation(); ev.preventDefault(); }
  var vuaKeo = false;
  d.onclick = function (ev) {
    if (vuaKeo) { vuaKeo = false; return; }
    var b = ev.target.closest('[data-buoc]'); if (b) toi(i + +b.dataset.buoc, +b.dataset.buoc);
    else if (ev.target.closest('.dong') || !ev.target.closest('img')) dong();
  };
  /* vuốt: ngang → ảnh trượt theo tay rồi sang ảnh khác; xuống → ảnh trôi theo, nền nhạt dần, thả quá ngưỡng thì đóng */
  var x0 = 0, y0 = 0, dx = 0, dy = 0, keo = null;
  d.ontouchstart = function (ev) { if (ev.touches.length > 1) { keo = 'bo'; return; } x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY; dx = dy = 0; keo = null; };
  d.ontouchmove = function (ev) {
    if (keo === 'bo' || ev.touches.length > 1) { keo = 'bo'; return; }
    dx = ev.touches[0].clientX - x0; dy = ev.touches[0].clientY - y0;
    if (!keo && Math.hypot(dx, dy) > 8) keo = Math.abs(dx) > Math.abs(dy) ? (n > 1 ? 'ngang' : 'bo') : (dy > 0 ? 'doc' : 'bo');
    var f = fs[i]; if (!f || GIAM) return;
    if (keo === 'ngang') { f.style.transition = 'none'; f.style.translate = dx + 'px 0'; }
    else if (keo === 'doc') { f.style.transition = 'none'; f.style.translate = '0 ' + Math.max(0, dy) + 'px'; f.style.scale = String(1 - Math.min(.25, Math.max(0, dy) / innerHeight * .5)); d.style.setProperty('--nen', String(1 - Math.min(.75, Math.max(0, dy) / 360))); }
  };
  d.ontouchend = function () {
    var f = fs[i], k2 = keo; keo = null; if (!k2 || k2 === 'bo' || !f) return;
    vuaKeo = true; setTimeout(function () { vuaKeo = false; }, 350);
    f.style.transition = '';
    if (k2 === 'ngang') { if (Math.abs(dx) > 50) toi(i + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); else f.style.translate = ''; }
    else if (dy > 110) dong();
    else { f.style.translate = ''; f.style.scale = ''; d.style.removeProperty('--nen'); }
  };
  addEventListener('keydown', phim, true);
  d.hidden = false; document.body.classList.add('khoa-cuon'); toi(i);
  /* bay ra từ ảnh nhỏ: ảnh nhỏ (đã tải sẵn) phóng tới đúng khung ảnh lớn, ảnh nét tải xong thì hoà vào */
  var ng = !GIAM && nguon ? nguon(i) : null;
  if (ng && ng.img && ng.img.complete && ng.img.naturalWidth) {
    var a = hinhHoc(ng.img, ng.cat);
    if (trongMan(a)) {
      var f = fs[i], fr = f.getBoundingClientRect(), that = f.querySelector('img'),
        b = vuaKhung(ng.img.naturalWidth, ng.img.naturalHeight, {l: fr.left, t: fr.top, w: fr.width, h: fr.height});
      a.bo = BO_GOC(); b.bo = 3;
      d.classList.add('dang-bay'); anNguon = ng.img; anNguon.classList.add('anh-an');
      var fl = dangBay = bay(ng.img.currentSrc || ng.img.src, a, b, {ms: 600});
      fl.an.onfinish = function () {
        if (dangBay !== fl) return;
        if (anNguon) { anNguon.classList.remove('anh-an'); anNguon = null; }
        var hoa = function () {
          if (dangBay !== fl) return; dangBay = null;
          d.classList.remove('dang-bay');
          fl.im.animate([{opacity: 1}, {opacity: 0}], {duration: 320, fill: 'forwards'}).onfinish = function () { fl.im.remove(); };
        };
        if (that.complete) hoa();
        else { that.addEventListener('load', hoa); that.addEventListener('error', hoa); setTimeout(hoa, 2500); }
      };
    }
  }
  requestAnimationFrame(function () { d.classList.add('mo'); var c = d.querySelector('.dong'); if (c) c.focus({preventScroll: true}); });
}

/* dải "Cách Ngọc Trầm chọn từng món" — chữ lấy từ phần Nội dung trang chủ (app › Cài đặt web) */
function dungQuy() {
  var v = ((CH.noiDung || {}).van || {}).quy || {}, k = $('#spQuy');
  var buoc = [
    [v.b1t || 'Chọn ngọc', v.b1n || 'Từng viên ngọc được xem dưới ánh sáng tự nhiên — màu, độ trong, vân ngọc — trước khi vào kho.',
      '<circle pathLength="1" cx="40" cy="40" r="14"/><circle pathLength="1" cx="70" cy="34" r="14"/><circle pathLength="1" cx="100" cy="40" r="14"/><circle pathLength="1" cx="118" cy="66" r="14"/><circle pathLength="1" cx="28" cy="68" r="14"/><path pathLength="1" d="M64 74c0 0 0 14 11 24c11-10 11-24 11-24c-6-5-16-5-22 0z"/><path pathLength="1" d="M75 60v14"/>'],
    [v.b2t || 'Phối charm vàng', v.b2n || 'Chuỗi được phối với charm vàng theo tông ngọc, để mỗi bộ là một thiết kế không lặp lại.',
      '<path pathLength="1" d="M20 30c30 50 80 50 110 0"/><circle pathLength="1" cx="45" cy="58" r="7"/><circle pathLength="1" cx="75" cy="66" r="7"/><circle pathLength="1" cx="105" cy="58" r="7"/><path pathLength="1" d="M75 73v10"/><path pathLength="1" d="M66 92a9 9 0 1018 0c0-8-9-9-9-9s-9 1-9 9z"/><path pathLength="1" d="M75 101v8"/>'],
    [v.b3t || 'Đóng hộp & gửi đi', v.b3n || 'Mỗi món được kiểm tra lần cuối, gửi video cho bạn xem trước, rồi đóng hộp cẩn thận và giao tận nơi.',
      '<rect pathLength="1" x="30" y="50" width="90" height="60" rx="3"/><path pathLength="1" d="M24 50h102v-14H24z"/><path pathLength="1" d="M75 36v74"/><path pathLength="1" d="M75 36c-14-22-34-10-22 0M75 36c14-22 34-10 22 0"/>']];
  var tieu = (v.tieu || 'Cách Ngọc Trầm\n*chọn* từng món').split('\n');
  k.innerHTML = '<div class="khung"><h2 class="tieu-de">' + tieu.map(function (d) { return '<span class="dong-chu"><span>' + ndHtml(d) + '</span></span>'; }).join('') + '</h2>' +
    '<div class="buoc-ngang">' + buoc.map(function (b, i) {
      return '<article data-hien style="--i:' + i + '"><svg viewBox="0 0 150 130" aria-hidden="true">' + b[2] + '</svg><span class="so">0' + (i + 1) + '</span><h3>' + e(b[0]) + '</h3><p>' + e(b[1]) + '</p></article>'; }).join('') +
    '</div></div>';
  k.hidden = false; theoDoi(k);
}

/* hỏi đáp (app › Nội dung › Hỏi đáp) + gợi ý tự thiết kế với chuỗi / charm */
function dungHd(x) {
  var hd = (CH.noiDung || {}).hoiDap || [], k = $('#spHd');
  if (!hd.length) return;
  var goi = x.loai === 'chuoi' || x.loai === 'tron' || x.loai === 'charm' ? '<a class="goi-tk" href="thiet-ke.html" data-hien><span class="nho">Xưởng phối chuỗi · 3D</span>' +
    '<b>' + (x.loai === 'tron' ? 'Gắn thêm charm vàng <em>cho dây ngọc này</em>' : x.loai === 'chuoi' ? 'Thích dây ngọc này, muốn <em>phối kiểu khác?</em>' : 'Xem charm này <em>trên chuỗi của bạn</em>') + '</b>' +
    '<small>Chọn dây, nhập cỡ tay, gắn charm vàng vào đúng chỗ — xoay xem 3D như thật rồi gửi cho Ngọc Trầm xâu giúp.</small>' +
    '<span class="nut dac">Tự thiết kế <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' : '';
  k.innerHTML = '<div class="khung"><div class="trai"><span class="nho" data-hien>Cần biết</span>' +
    '<h2 class="tieu-de"><span class="dong-chu"><span>Hỏi <em>&amp;</em> đáp</span></span></h2>' +
    '<p data-hien>Chưa thấy câu bạn cần? <a href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Nhắn Ngọc Trầm</a> kèm mã ' + e(x.ma) + '.</p>' + goi + '</div>' +
    '<div data-hien>' + hd.map(function (q, i) { return '<details' + (i ? '' : ' open') + '><summary>' + e(q.hoi) + '</summary><div class="tl"><div><p>' + e(q.dap) + '</p></div></div></details>'; }).join('') + '</div></div>';
  k.hidden = false; theoDoi(k);
}

/* món bạn vừa xem (nhớ trên máy khách, tối đa 12) */
function dungDaXem(x) {
  var kx = khoa(x), cu = [];
  try { cu = JSON.parse(localStorage.getItem('daXem') || '[]'); } catch (er) {}
  try { localStorage.setItem('daXem', JSON.stringify([kx].concat(cu.filter(function (m) { return m !== kx; })).slice(0, 12))); } catch (er) {}
  var mon = cu.filter(function (m) { return m !== kx; }).map(function (m) { return ds.filter(function (y) { return khoa(y) === m; })[0]; })
    .filter(function (y) { return y && y.tt !== 'Đã bán'; }).slice(0, 6);
  if (!mon.length) return;
  var k = $('#daXem');
  k.innerHTML = '<div class="khung"><div class="dau-dx"><span class="nho">Bạn vừa xem</span><button type="button" class="xoa-dx">Xoá lịch sử</button></div><div class="hang-dx">' +
    mon.map(function (y) { return '<a href="' + linkSp(y) + '">' + hinh(y.anh[0], y.ten, 300) + '<span>' + e(y.ten) + '</span><b>' + gia(y.gia) + '</b></a>'; }).join('') + '</div></div>';
  k.hidden = false;
  k.querySelector('.xoa-dx').onclick = function () { try { localStorage.setItem('daXem', JSON.stringify([kx])); } catch (er) {} k.hidden = true; };
}

/* ---------- UPSALE: phối thêm charm (trang chuỗi) ---------- */
function dungPhoiCharm(x) {
  var o = $('#phoiCharm'); if (!o || (x.loai !== 'chuoi' && x.loai !== 'tron') || x.tt === 'Đã bán') return;
  var ch = charmHop(x, 6); if (!ch.length) return;
  var ngoc = ngocCua(x).filter(function (t) { return t !== 'Phỉ thuý'; })[0];
  o.className = 'phoi-charm'; o.setAttribute('data-hien', '');
  o.innerHTML = '<div class="pc-dau"><b>Phối thêm charm</b><a href="cua-hang.html?loai=charm' + (ngoc ? '&ngoc=' + slug(ngoc) : '') + '">Xem thêm' + MUI_CT + '</a></div>' +
    '<p>Gắn thêm charm vàng hợp tông, cửa hàng xâu sẵn trước khi gửi.</p>' +
    '<div class="pc-ds">' + ch.map(function (c) {
      return '<div class="pc-mon"><a class="h" href="' + linkSp(c) + '">' + hinh(c.anh[0], c.ten, 240) + '</a>' +
        '<a class="ten" href="' + linkSp(c) + '">' + e(c.ten.replace(/^charm\s*/i, '').replace(/^./, function (k) { return k.toUpperCase(); })) + '</a><span class="g">' + gia(c.gia) + '</span>' +
        '<button type="button" class="pc-them" data-gio="' + e(khoa(c)) + '">+ Thêm</button></div>';
    }).join('') + '</div>';
  if (ch.length > 3) keoNgang(o.querySelector('.pc-ds'), true);
  theoDoi(o.parentNode); veNutThem();
}

/* ---------- UPSALE: trọn bộ cùng dòng ngọc (khác loại với món đang xem) ---------- */
function dungTronBo(x) {
  var ngoc = ngocCua(x); if (!ngoc.length) return;
  var rieng = ngoc.filter(function (t) { return t !== 'Phỉ thuý'; });   // "lam băng", "lục đế"… sát hơn chữ "phỉ thuý" chung
  var tim = rieng.length ? rieng : ngoc;
  var nhom = x.loai === 'tron' ? 'chuoi' : x.loai;
  var mon = conHang('').filter(function (y) {
    var l = y.loai === 'tron' ? 'chuoi' : y.loai;
    return y !== x && l !== nhom && y.gia && (x.loai === 'charm' ? (y.loai === 'chuoi' || y.loai === 'tron') : y.loai !== 'charm') &&
      ngocCua(y).some(function (t) { return tim.indexOf(t) >= 0; });
  }).sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay); }).slice(0, 8);
  if (!mon.length) return;
  var s = document.createElement('section');
  s.className = 'muc tron-bo'; s.id = 'tronBo';
  s.innerHTML = '<div class="khung"><div class="giua"><span class="nho" data-hien>' + (x.loai === 'charm' ? 'Gắn charm lên' : 'Trọn bộ cùng dòng ngọc') + '</span>' +
    '<h2 class="tieu-de"><span class="dong-chu"><span>' + (x.loai === 'charm' ? 'Chuỗi hợp với <em>charm này</em>' : 'Đeo cùng <em>' + e(tim[0].toLowerCase()) + '</em>') + '</span></span></h2></div>' +
    '<div class="luoi" style="margin-top:56px">' + mon.map(the).join('') + '</div>' +
    '<div class="them"><a class="nut" href="cua-hang.html?ngoc=' + slug(tim[0]) + '">Xem tất cả món ' + e(tim[0].toLowerCase()) + MUI_CT + '</a></div></div>';
  $('#lienQuan').parentNode.insertBefore(s, $('#lienQuan'));
  if (mon.length > 4) keoNgang(s.querySelector('.luoi'));
  theoDoi(s);
}
var MUI_CT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function dungLienQuan(x) {
  var cung = ds.filter(function (y) { return y !== x && y.loai === x.loai && y.tt !== 'Đã bán'; });
  cung.sort(function (a, b) { return Math.abs(a.gia - x.gia) - Math.abs(b.gia - x.gia); });
  var them = cung.slice(0, 10);   // hàng kéo ngang (#339): tối đa 10 món
  if (them.length < 4) them = them.concat(ds.filter(function (y) { return y !== x && them.indexOf(y) < 0 && y.loai !== 'charm'; }).slice(0, 4 - them.length));
  if (!them.length) return;
  $('#lienQuan').hidden = false;
  if (CHE_SI) {
    $('#luoiLq').innerHTML = them.map(function (y, i) { return SI.the(y, i, SI.du); }).join('');
    var tc = $('#lienQuan .them a'); if (tc) { tc.href = 'si.html#loai=' + x.loai; tc.textContent = 'Xem tất cả ' + LOAI[x.loai].ten.toLowerCase() + ' giá sỉ'; }
  } else
  $('#luoiLq').innerHTML = them.map(the).join('');
  if (them.length > 4) keoNgang($('#luoiLq'));
  theoDoi($('#lienQuan'));
}

/* ♡ yêu thích — lưu ngay ở máy khách, đăng nhập thì đồng bộ lên tài khoản */
function veYt() { var b = $('#nutYt'); if (!b) return; var co = YT.co(b.dataset.ma); b.classList.toggle('on', co); b.innerHTML = '<span>' + (co ? '♥' : '♡') + '</span> ' + (co ? 'Đã lưu yêu thích' : 'Lưu vào yêu thích'); }
if (KHACH.bat) { KHACH.nghe.push(veYt); KHACH.san.then(function () { setTimeout(veYt, 300); }); }
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('#nutYt'); if (!b) return;
  var co = YT.doi(b.dataset.ma);
  baoTin(co ? 'Đã lưu vào yêu thích' : 'Đã bỏ khỏi yêu thích');
  veYt();
  if (co && typeof noTim === 'function') noTim(b);
});

/* ---------- #288 "Thông tin sản phẩm" dài (chuỗi nhiều charm…) → thu gọn, mờ dần ở đáy, "Xem thêm" mở ra mượt ---------- */
function thuGonTT() {
  var tl = $('.mo-rong details .tl > div'); if (!tl || tl.querySelector('.thu-gon')) return;
  var h = document.createElement('div'); h.className = 'thu-gon';
  while (tl.firstChild) h.appendChild(tl.firstChild);
  tl.appendChild(h);
  var nut = document.createElement('button'); nut.type = 'button'; nut.className = 'xem-them'; nut.hidden = true; tl.appendChild(nut);
  function z() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1; }
  function nhan(mo) {
    nut.setAttribute('aria-expanded', String(mo));
    nut.innerHTML = '<span>' + (mo ? 'Thu gọn' : 'Xem đầy đủ thông tin') + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9l6 6 6-6"/></svg>';
  }
  function doCao() {   // chỉ thu gọn khi dài hơn hẳn ngưỡng (đỡ phải bấm "xem thêm" cho vài dòng)
    if (h.classList.contains('mo-ra') || !h.offsetParent) return;
    var cao = Math.round(300 * z()), can = h.scrollHeight > cao + 110 * z();
    nut.hidden = !can; h.classList.toggle('dong', can); h.style.maxHeight = can ? cao + 'px' : '';
    if (can) nhan(false);
  }
  nut.onclick = function () {
    var cao = Math.round(300 * z());
    if (!h.classList.contains('mo-ra')) {
      h.style.maxHeight = h.scrollHeight + 'px'; h.classList.add('mo-ra'); h.classList.remove('dong'); nhan(true);
      var xong = function (ev) { if (ev && ev.propertyName !== 'max-height') return; h.removeEventListener('transitionend', xong); if (h.classList.contains('mo-ra')) h.style.maxHeight = 'none'; };
      h.addEventListener('transitionend', xong); if (GIAM) xong();
    } else {
      h.style.maxHeight = h.scrollHeight + 'px'; void h.offsetHeight;
      h.classList.remove('mo-ra'); h.classList.add('dong'); h.style.maxHeight = cao + 'px'; nhan(false);
      var dt = h.closest('details').getBoundingClientRect().top;   // đang ở dưới sâu → đưa màn hình về đầu khung, khỏi lạc chỗ
      if (dt < 90 * z()) scrollBy({top: dt - 110 * z(), behavior: GIAM ? 'auto' : 'smooth'});
    }
  };
  doCao();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(doCao);
  addEventListener('load', doCao);
  h.closest('details').addEventListener('toggle', doCao);
}

/* ---------- #339 hàng gợi ý kéo ngang: kéo theo tay, thả thì trôi theo đà rồi dừng đúng mép thẻ ----------
   chuột: tự xử lý kéo + quán tính; cảm ứng / bàn di: cuộn gốc của máy + scroll-snap. Mũi tên đi từng thẻ, vạch dưới cho biết đang ở đâu. */
function keoNgang(ray, hep) {
  ray.classList.remove('luoi'); ray.classList.add('keo-ray'); if (hep) ray.classList.add('hep');
  var dk = document.createElement('div'); dk.className = 'keo-dk' + (hep ? ' hep' : '');
  dk.innerHTML = '<div class="keo-tien"><i></i></div>' +
    '<button type="button" class="keo-nut" data-h="-1" aria-label="Xem món trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<button type="button" class="keo-nut" data-h="1" aria-label="Xem món sau"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg></button>';
  ray.parentNode.insertBefore(dk, ray.nextSibling);
  var vach = dk.querySelector('i'), nT = dk.querySelector('[data-h="-1"]'), nS = dk.querySelector('[data-h="1"]'), raf = 0, hoat = 0, keo = null;
  function max() { return ray.scrollWidth - ray.clientWidth; }
  function moc() {
    var o = ray.firstElementChild ? ray.firstElementChild.offsetLeft : 0, m = max(), r = [];
    [].forEach.call(ray.children, function (c) { var v = Math.min(m, Math.max(0, c.offsetLeft - o)); if (r.indexOf(v) < 0) r.push(v); });
    return r;
  }
  function ganNhat(v) { return moc().reduce(function (a, b) { return Math.abs(b - v) < Math.abs(a - v) ? b : a; }, 0); }
  function capNhat() {
    raf = 0; var m = max(), L = vach.parentNode.clientWidth;
    dk.classList.toggle('khong', m < 4);
    var w = Math.max(24, L * ray.clientWidth / Math.max(1, ray.scrollWidth));
    vach.style.width = w + 'px'; vach.style.transform = 'translateX(' + (m > 0 ? (L - w) * ray.scrollLeft / m : 0) + 'px)';
    nT.disabled = ray.scrollLeft < 4; nS.disabled = ray.scrollLeft > m - 4;
  }
  function huy() { if (hoat) { cancelAnimationFrame(hoat); hoat = 0; ray.classList.remove('dang-keo'); } }
  function truot(dich) {
    huy(); var tu = ray.scrollLeft, d = dich - tu; if (Math.abs(d) < 1) return;
    if (GIAM) { ray.scrollLeft = dich; return; }
    var t0 = performance.now(), ms = Math.min(950, Math.max(420, Math.abs(d) * 1.1));
    ray.classList.add('dang-keo');                     // tắt snap trong lúc tự trôi, tới nơi bật lại (đã đúng mép thẻ nên không giật)
    hoat = requestAnimationFrame(function b(now) {
      var p = Math.min(1, (now - t0) / ms); ray.scrollLeft = tu + d * (1 - Math.pow(1 - p, 4));
      if (p < 1) hoat = requestAnimationFrame(b); else { hoat = 0; ray.classList.remove('dang-keo'); }
    });
  }
  dk.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-h]'); if (!b) return;
    var cur = ray.scrollLeft, m = moc(), h = +b.dataset.h, dich;
    if (h > 0) dich = m.filter(function (v) { return v > cur + 4; })[0]; else dich = m.filter(function (v) { return v < cur - 4; }).pop();
    truot(dich == null ? (h > 0 ? max() : 0) : dich);
  });
  ray.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(capNhat); }, {passive: true});
  addEventListener('resize', function () { if (!raf) raf = requestAnimationFrame(capNhat); });
  ray.addEventListener('wheel', huy, {passive: true});
  ray.addEventListener('touchstart', huy, {passive: true});
  ray.addEventListener('dragstart', function (ev) { ev.preventDefault(); });
  ray.addEventListener('pointerdown', function (ev) {
    if (ev.pointerType !== 'mouse' || ev.button) return;
    huy(); keo = {x: ev.clientX, s: ray.scrollLeft, id: ev.pointerId, dang: false, mau: [[ev.timeStamp, ray.scrollLeft]]};
  });
  ray.addEventListener('pointermove', function (ev) {
    if (!keo || ev.pointerId !== keo.id) return;
    var dx = ev.clientX - keo.x;
    if (!keo.dang) { if (Math.abs(dx) < 6) return; keo.dang = true; try { ray.setPointerCapture(ev.pointerId); } catch (er) {} ray.classList.add('dang-keo', 'cam'); }
    ray.scrollLeft = keo.s - dx;
    keo.mau.push([ev.timeStamp, ray.scrollLeft]);
    while (keo.mau.length > 2 && ev.timeStamp - keo.mau[0][0] > 100) keo.mau.shift();
  });
  function tha(ev) {
    if (!keo || ev.pointerId !== keo.id) return;
    var k = keo; keo = null; if (!k.dang) return;
    ray.classList.remove('cam'); ray.classList.add('vua-keo'); setTimeout(function () { ray.classList.remove('vua-keo'); }, 60);
    var a = k.mau[0], b = k.mau[k.mau.length - 1], v = b[0] > a[0] && ev.timeStamp - b[0] < 80 ? (b[1] - a[1]) / (b[0] - a[0]) : 0;
    truot(ganNhat(ray.scrollLeft + v * 320));         // trôi xa theo đà vung tay, dừng ở thẻ gần điểm rơi nhất
  }
  ray.addEventListener('pointerup', tha); ray.addEventListener('pointercancel', tha);
  ray.addEventListener('click', function (ev) {          // vừa kéo xong thì không tính là bấm vào thẻ
    if (ray.classList.contains('vua-keo')) { ev.preventDefault(); ev.stopPropagation(); ray.classList.remove('vua-keo'); }
  }, true);
  /* thẻ nằm ngoài khung kéo: hiện cùng lúc với cả hàng (không đợi kéo tới mới mờ hiện) */
  new IntersectionObserver(function (es, ob) {
    if (!es[0].isIntersecting) return; ob.disconnect();
    [].forEach.call(ray.querySelectorAll('[data-hien]'), function (c) { c.classList.add('hien'); });
  }, {threshold: .2}).observe(ray);
  capNhat();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(capNhat);
}

/* ---------- #328 bấm thẻ món khác: ảnh thẻ nở tới đúng chỗ khung ảnh lớn, giấy phủ lên, rồi mới sang trang ----------
   trang mới (cũng là san-pham.html) giữ lớp giấy + ảnh ở đúng chỗ đó tới khi ảnh chính tải xong, rồi mới vén → liền mạch.
   chuyển trang sau ~0,3 giây (ngang với màn giấy chuyển trang sẵn có); máy giảm chuyển động thì sang thẳng. */
function viTriKhung() {   // khung ảnh chính ở vị trí khi trang vừa mở (cuộn = 0)
  var kh = $('#khungAnh'); if (!kh) return null;
  var r = kh.getBoundingClientRect(), s = kh.parentNode.getBoundingClientRect(), c = $('#spChinh').getBoundingClientRect();
  return {l: r.left, t: c.top + scrollY + (r.top - s.top), w: r.width, h: r.height};
}
function noRa(img, href) {
  var dich = !GIAM && img && img.complete && img.naturalWidth && !document.hidden ? viTriKhung() : null;
  var ma = ''; try { ma = new URL(href, location.href).searchParams.get('ma') || ''; } catch (er) {}
  var a = dich && hinhHoc(img, img.closest('.h') || img.parentNode);
  if (!dich || !ma || !trongMan(a) || dich.t > innerHeight) { location.href = href; return; }
  var s = Math.max(dich.w / img.naturalWidth, dich.h / img.naturalHeight), w = img.naturalWidth * s, h = img.naturalHeight * s;
  var b = {R: {l: dich.l + (dich.w - w) / 2, t: dich.t + (dich.h - h) / 2, w: w, h: h}, V: {l: dich.l, t: dich.t, r: dich.l + dich.w, b: dich.t + dich.h}};
  a.bo = parseFloat(getComputedStyle(img.closest('.h') || img).borderRadius) || 0; b.bo = parseFloat(getComputedStyle($('#khungAnh')).borderRadius) || 0;
  var man = document.createElement('div'); man.className = 'man-no'; document.body.appendChild(man);
  man.animate([{opacity: 0}, {opacity: 1}], {duration: 300, easing: 'ease-out', fill: 'forwards'});
  var src = img.currentSrc || img.src, fl = bay(src, a, b, {ms: 480, z: 906});
  img.classList.add('anh-an');
  try { sessionStorage.setItem('noRa', JSON.stringify({u: src, k: ma, t: Date.now(), r: dich, bo: b.bo})); } catch (er) {}
  setTimeout(function () { location.href = href; }, 300);
  addEventListener('pageshow', function f(ev) {   // bấm "quay lại" về đúng trang này (bfcache) → dọn sạch
    if (!ev.persisted) return; removeEventListener('pageshow', f);
    man.remove(); fl.im.remove(); img.classList.remove('anh-an');
  });
}
(function () {
  var vua = null;
  document.addEventListener('click', function (ev) {
    vua = ev.target.closest ? ev.target.closest('.sp') : null;
    if (GIAM || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest && ev.target.closest('.pc-mon a[href], .hang-dx a[href]');
    if (!a || ev.target.closest('.vua-keo')) return;
    var im = (a.closest('.pc-mon') || a).querySelector('img'); if (!im) return;
    ev.preventDefault(); noRa(im, a.href);
  }, true);
  window.moSp = function (k) {
    var c = vua && vua.dataset.k === String(k) ? vua : null;
    noRa(c && c.querySelector('.h img'), linkCt(k));
  };
})();
/* trang này được mở từ thẻ ở trang trước: dựng sẵn ảnh đúng chỗ (lớp giấy do san-pham.html bật từ <head>) */
var noiVao = null;
if (window.NO_RA) (function (n) {
  var o = document.createElement('div'); o.className = 'bay-noi';
  o.style.cssText = 'left:' + n.r.l + 'px;top:' + n.r.t + 'px;width:' + n.r.w + 'px;height:' + n.r.h + 'px;border-radius:' + (n.bo || 0) + 'px';
  o.innerHTML = '<img alt="" referrerpolicy="no-referrer" src="' + e(n.u) + '">';
  document.body.appendChild(o); noiVao = o;
  setTimeout(moManNoi, 2600);   // lưới an toàn: mạng chậm cũng không giữ màn quá lâu
})(window.NO_RA);
function moManNoi() {
  var H = document.documentElement;
  if (!H.classList.contains('tu-the') || moManNoi.da) return; moManNoi.da = true;
  var o = noiVao, kh = $('#khungAnh');
  if (o && kh) { var r = kh.getBoundingClientRect(); o.style.left = r.left + 'px'; o.style.top = r.top + 'px'; o.style.width = r.width + 'px'; o.style.height = r.height + 'px'; }
  requestAnimationFrame(function () {
    H.classList.add('tu-the-mo');
    setTimeout(function () {
      H.classList.add('da-nap'); H.classList.remove('tu-the', 'tu-the-mo');
      if (o) o.animate([{opacity: 1}, {opacity: 0}], {duration: 260, fill: 'forwards'}).onfinish = function () { o.remove(); };
    }, 520);
  });
}
