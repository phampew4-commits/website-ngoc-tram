/* Trang GIỎ HÀNG — xem món đã chọn rồi đặt mua.
   Đơn ghi vào Firestore (donHang) → app Ngọc Trầm trên máy cửa hàng đọc và báo đơn mới.
   Giỏ chỉ giữ mã món (chung.js › GIO); tên, giá, trạng thái lấy mới từ data/san-pham.json mỗi lần mở trang. */
var noiGio = $('#gioNoi'), MON = [], dangGui = false;
var moTom = false, daVe = false, lanSl = null, tongCu = null;   // hiệu ứng: tóm tắt đang mở, đã vẽ lần đầu, vừa đổi số lượng, tổng trước khi đổi

/* ---------- các bước đặt hàng (đúng luồng thật của trang: giỏ → điền người nhận → gửi đơn → cửa hàng đã nhận) ---------- */
var BUOC = ['Giỏ hàng', 'Thông tin giao hàng', 'Gửi đơn', 'Đã nhận đơn'], buoc = {cur: -1, p: 0};
function buocHtml() {
  if (!KHACH.bat) return '';   // chế độ nhắn Zalo: không có các bước này
  return '<ol class="gh-buoc" id="ghBuoc" aria-label="Các bước đặt hàng">' + BUOC.map(function (t, k) {
    return '<li class="gh-b' + (k < buoc.cur ? ' xong' : k === buoc.cur ? ' nay' : '') + '" style="--p:' + phanNoi(k, buoc) + '">' +
      (k ? '<i class="gh-noi" aria-hidden="true"><b></b></i>' : '') +
      '<span class="gh-cham" aria-hidden="true"><em>' + (k + 1) + '</em><svg viewBox="0 0 24 24"><path d="M5.5 12.5l4 4 9-9.5"/></svg></span>' +
      '<span class="gh-ten">' + t + '</span></li>';
  }).join('') + '</ol>';
}
function phanNoi(k, b) { return k <= b.cur ? 1 : k === b.cur + 1 ? b.p : 0; }   // đường nối vào bước k đầy bao nhiêu
function datBuoc(cur, p) {
  var tu = buoc.cur, ol = $('#ghBuoc');
  buoc = {cur: cur, p: p || 0};
  if (!ol) return;
  void ol.offsetWidth;   // để chuyển động chạy cả khi khung vừa dựng lại
  var buocT = GIAM ? 0 : .2, goc = Math.max(0, tu) * 2;
  [].forEach.call(ol.children, function (li, k) {
    // thứ tự sáng: chấm 0, đường 1, chấm 1, đường 2… — chỉ trễ dần khi đi tới
    var dl = cur > tu ? Math.max(0, (2 * k - 1 - goc)) * buocT : 0, dc = cur > tu ? Math.max(0, (2 * k - goc)) * buocT : 0;
    li.style.setProperty('--dl', dl + 's'); li.style.setProperty('--dc', dc + 's');
    li.style.setProperty('--p', phanNoi(k, buoc));
    li.classList.toggle('xong', k < cur); li.classList.toggle('nay', k === cur);
    if (k === cur) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    li.querySelector('.gh-ten').setAttribute('aria-label', BUOC[k] + (k < cur ? ', đã xong' : k === cur ? ', bước hiện tại' : ''));
  });
}

/* ---------- ô nhập: đúng luật kiểm tra lúc gửi đơn ---------- */
var HOP = {
  ten: function (v) { return v.trim().length >= 2; },
  sdt: function (v) { return v.replace(/\D/g, '').length >= 9; },
  diaChi: function (v) { return v.trim().length >= 8; }
};
var IC_DUNG = '<i class="gh-dung" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5.5 12.5l4 4 9-9.5" pathLength="1"/></svg></i>';
function oNhap(ten, nhan, giaTri, them, vung) {
  var co = String(giaTri || '').trim() !== '', dung = HOP[ten] && HOP[ten](String(giaTri || ''));
  return '<label class="gh-o' + (co ? ' co' : '') + (dung ? ' dung' : '') + (vung ? ' gh-vung' : '') + '">' +
    (vung ? '<textarea name="' + ten + '" rows="2" ' + them + '>' + e(giaTri || '') + '</textarea>'
          : '<input name="' + ten + '" value="' + e(giaTri || '') + '" ' + them + '>') +
    '<span class="gh-nhan">' + nhan + '</span>' + (HOP[ten] ? IC_DUNG : '') + '</label>';
}
function tienDo() {   // bao nhiêu ô bắt buộc đã điền đúng → đường nối sang bước "Gửi đơn"
  var f = $('#fDat'); if (!f) return 0;
  return Object.keys(HOP).filter(function (k) { return HOP[k](f[k].value); }).length / 3;
}
function nhanNut(s) { var n = $('#nutDat .gh-chu'); if (n) n.textContent = s; }

/* ---------- giỏ trống: dùng chung hình hộp của ngăn giỏ (HOP_TRONG, chung.js) cho đồng bộ; thiếu thì dùng hình dự phòng này ---------- */
var HINH_TRONG = '<svg class="gh-hinh" viewBox="0 0 160 132" aria-hidden="true">' +
  '<ellipse class="gh-bong" cx="80" cy="120" rx="46" ry="4.5"/>' +
  '<path class="gh-nap" d="M47 66 L53 41 Q54 38 57 38 H103 Q106 38 107 41 L113 66" pathLength="1"/>' +
  '<path class="gh-than" d="M38 66 H122 V102 Q122 110 114 110 H46 Q38 110 38 102 Z" pathLength="1"/>' +
  '<path class="gh-dem" d="M46 66 Q80 80 114 66" pathLength="1"/><path class="gh-khe" d="M70 75 H90" pathLength="1"/>' +
  '<g class="gh-vong"><g class="gh-vong-i"><path fill-rule="evenodd" d="M61 22a19 19 0 1 0 38 0a19 19 0 1 0 -38 0Z M67.5 22a12.5 12.5 0 1 0 25 0a12.5 12.5 0 1 0 -25 0Z" pathLength="1"/>' +
  '<path class="gh-sang" d="M68 14 Q72 7.5 79.5 6" pathLength="1"/></g></g>' +
  '<path class="gh-sao s1" d="M124 22 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6Z"/>' +
  '<path class="gh-sao s2" d="M34 36 l1.2 3.3 3.3 1.2 -3.3 1.2 -1.2 3.3 -1.2 -3.3 -3.3 -1.2 3.3 -1.2Z"/>' +
  '<path class="gh-sao s3" d="M118 88 l1 2.8 2.8 1 -2.8 1 -1 2.8 -1 -2.8 -2.8 -1 2.8 -1Z"/></svg>';
var MUI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

/* ---------- tóm tắt đơn: gập còn tổng tiền, bấm mở xem từng món ---------- */
function tomHtml(muaDuoc, tong) {
  if (!muaDuoc.length) return '<div class="hang-tom"><span>0 món đặt được</span><b id="ghTong">' + gia(0) + '</b></div>';
  return '<button type="button" class="hang-tom gh-gap" id="ghGap" aria-expanded="' + moTom + '" aria-controls="ghChi">' +
      '<span>' + muaDuoc.length + ' món đặt được<small class="gh-mo"><em>' + (moTom ? 'Thu gọn' : 'Xem chi tiết') + '</em>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9l6 6 6-6"/></svg></small></span>' +
      '<b id="ghTong">' + gia(tong) + '</b></button>' +
    '<div class="gh-chi' + (moTom ? ' mo' : '') + '" id="ghChi"><div><ul>' + muaDuoc.map(function (g) {
      return '<li><span>' + e(g.x.ten) + (g.x.td ? ' <small>× ' + g.x.sl + '</small>' : '') + '</span><b>' + gia(g.x.gia) + '</b></li>';
    }).join('') + '<li class="gh-cong"><span>Tạm tính</span><b>' + gia(tong) + '</b></li></ul></div></div>';
}
function demTong(o, tu, den) {   // tổng tiền chạy số khi đổi số lượng
  if (!o || GIAM || tu === den) return;
  var t0 = performance.now(), T = 520;
  (function buoc(t) {
    var k = Math.min(1, (t - t0) / T); k = 1 - Math.pow(1 - k, 3);
    o.textContent = gia(Math.round(tu + (den - tu) * k));
    if (k < 1) requestAnimationFrame(buoc); else o.textContent = gia(den);
  })(t0);
  setTimeout(function () { o.textContent = gia(den); }, T + 120);   // phòng khi tab ẩn, rAF dừng
}

/* ---------- cách thanh toán (bật/tắt trong app › Quản trị web › Thanh toán) ---------- */
var TRA = CAU_HINH.thanhToan || {};
var PT_COC = Math.max(5, Math.min(100, +TRA.cocPhanTram || 30));
function coTk() { return !!(TRA.stk && TRA.nganHang); }
function cachTra() {
  var a = [];
  if (TRA.cod !== false) a.push({k: 'cod', ten: 'Trả khi nhận hàng', mo: 'Bưu tá giao tới, bạn kiểm tra món rồi mới trả tiền.'});
  if (TRA.ck !== false) a.push({k: 'ck', ten: 'Chuyển khoản trước', mo: 'Chuyển đủ tiền trước, cửa hàng gói và gửi đi ngay.'});
  if (TRA.coc) a.push({k: 'coc', ten: 'Cọc trước ' + PT_COC + '%', mo: 'Cọc để giữ món, phần còn lại trả khi nhận hàng.'});
  return a.length ? a : [{k: 'cod', ten: 'Trả khi nhận hàng', mo: ''}];
}
function tienTra(cach, tong) {
  if (cach === 'ck') return tong;
  if (cach === 'coc') return Math.max(1000, Math.round(tong * PT_COC / 100 / 1000) * 1000);
  return 0;
}

Promise.all([taiDuLieu, taiTramDot]).then(function () { if (KHACH.bat) KHACH.san.then(function () { KHACH.nghe.push(veGio); veGio(); }); else veGio(); });

function monTrongGio() {
  var m = {};
  ds.forEach(function (x) { m[String(khoa(x))] = x; m[String(x.ma)] = x; });
  return GIO.ds().map(function (k) {
    var x = m[k] || monTd(k);
    return {k: k, x: x, mua: !!(x && x.tt !== 'Đã bán' && x.gia)};
  });
}

function veGio() {
  MON = monTrongGio();
  var muaDuoc = MON.filter(function (g) { return g.mua; });
  var tong = muaDuoc.reduce(function (s, g) { return s + g.x.gia; }, 0);

  if (!MON.length) {
    noiGio.innerHTML = '<div class="tk-hop giua gh-trong">' + (typeof HOP_TRONG === 'string' ? HOP_TRONG : HINH_TRONG) + '<span class="nho">Giỏ hàng</span><h1>Giỏ đang <em>trống</em></h1>' +
      '<p class="dan">Bạn chọn món ưng ý rồi bấm “Thêm vào giỏ”, mọi món sẽ gom về đây để đặt một lần.</p>' +
      '<a class="nut dac gh-di" href="cua-hang.html">Xem cửa hàng' + MUI + '</a></div>';
    buoc = {cur: -1, p: 0}; daVe = true;
    return;
  }

  noiGio.innerHTML = buocHtml() + '<div class="gio-dau"><span class="nho" data-hien>Giỏ hàng</span>' +
      '<h1 class="tieu-de"><span class="dong-chu"><span>Món bạn <em>đã chọn</em></span></span></h1>' +
      '<p data-hien>' + (MON.some(function (g) { return g.x && g.x.td; }) ? 'Món ngọc mỗi món chỉ có một; trầm hương bạn chọn được số lượng. Đặt xong,' : 'Mỗi món chỉ có một, nên giỏ không có số lượng. Đặt xong,') + ' cửa hàng nhắn lại ngay để xác nhận và gửi video món thật trước khi giao.</p></div>' +
    '<div class="gio-luoi">' +
      '<div class="gio-ds">' + MON.map(dongMon).join('') + goiY(GIO.ds()) + '</div>' +
      '<aside class="gio-ben"><div class="gio-tom">' +
        tomHtml(muaDuoc, tong) + thanhShip(tong) +
        (MON.length > muaDuoc.length ? '<p class="gio-luuy">' + (MON.length - muaDuoc.length) + ' món không đặt được, bạn bỏ khỏi giỏ giúp cửa hàng nhé.</p>' : '') +
        '<p class="gio-luuy">Chưa tính phí gửi. Cửa hàng báo phí khi xác nhận đơn.</p>' +
        '</div><div id="gioDat"></div></aside>' +
    '</div>';
  if (daVe) [].forEach.call(noiGio.querySelectorAll('[data-hien],.tieu-de'), function (x) { x.classList.add('hien'); });   // vẽ lại (đổi số lượng, bỏ món) thì không mờ-hiện lại cả trang
  daVe = true;
  theoDoi(noiGio);
  veDat(muaDuoc, tong);
  if (lanSl) { demTong($('#ghTong'), tongCu, tong); lanSl = null; }   // số lượng tự lăn nhờ dongSl (chung.js); ở đây cho tổng tiền chạy số
}

function dongMon(g) {
  if (!g.x) return '<div class="gio-mon het"><div class="gio-anh"></div><div class="gio-tt"><h3>Món ' + e(g.k) + '</h3>' +
    '<p class="gio-het">Món này vừa được bán hoặc tạm ẩn.</p></div>' +
    '<button class="gio-bo" data-bo="' + e(g.k) + '" aria-label="Bỏ khỏi giỏ">Bỏ</button></div>';
  var x = g.x;
  return '<div class="gio-mon' + (g.mua ? '' : ' het') + '">' +
    '<a class="gio-anh" href="' + linkSp(x) + '">' + hinh(x.anh[0], x.ten, 220) + '</a>' +
    '<div class="gio-tt"><h3><a href="' + linkSp(x) + '">' + e(x.ten) + '</a></h3>' +
      (x.td ? '<div class="gio-ma">Trầm nhà làm · ' + gia(x.don) + ' / món</div>' + dongSl(g.k, x.sl)
            : '<div class="gio-ma">Mã ' + e(x.ma) + ' · ' + LOAI[x.loai].ngan + '</div>') +
      (g.mua ? '<div class="gio-gia">' + gia(x.gia) + '</div>'
             : '<p class="gio-het">' + (x.tt === 'Đã bán' ? 'Món này đã có chủ mất rồi.' : 'Món này chưa có giá, bạn nhắn Zalo để cửa hàng báo giá.') + '</p>') +
    '</div><button class="gio-bo" data-bo="' + e(g.k) + '" aria-label="Bỏ khỏi giỏ">Bỏ</button></div>';
}

/* ---------- khung đặt mua ---------- */
function veDat(muaDuoc, tong) {
  var o = $('#gioDat');
  if (!muaDuoc.length) { o.innerHTML = ''; datBuoc(0, 0); return; }
  if (!KHACH.bat) {
    o.innerHTML = '<p class="gio-luuy">Bạn nhắn Zalo kèm mã món, cửa hàng chốt đơn giúp bạn.</p>' +
      '<a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(muaDuoc.map(function (g) { return g.x.ma; }).join(', ')) + '">Nhắn Zalo đặt mua</a>';
    return;
  }
  if (!KHACH.user) {
    o.innerHTML = '<p class="gio-luuy">Đăng nhập để đặt hàng — cửa hàng biết đơn của ai, bạn cũng xem lại được đơn đã đặt.</p>' +
      '<button class="nut dac" id="nutVao">Đăng nhập để đặt mua</button>';
    $('#nutVao').onclick = function () { KHACH.canDangNhap(); };
    datBuoc(0, 0);
    return;
  }
  var h = KHACH.ho || {};
  o.innerHTML = '<form class="gio-form" id="fDat" novalidate>' +
    '<h3>Người nhận</h3>' +
    oNhap('ten', 'Họ tên', h.ten, 'autocomplete="name" required') +
    oNhap('sdt', 'Số điện thoại', h.sdt, 'type="tel" inputmode="numeric" autocomplete="tel" required') +
    oNhap('diaChi', 'Địa chỉ giao hàng', h.diaChi, 'autocomplete="street-address" required', true) +
    oNhap('ghiChu', 'Ghi chú <small>(không bắt buộc)</small>', '', 'placeholder="Cỡ tay, cách gói, giờ nhận hàng…"', true) +
    veCachTra(tong) +
    '<p class="loi-tk" id="loiDat" hidden></p>' +
    '<button class="nut dac gh-nut" type="submit" id="nutDat"><span class="gh-chu">Đặt mua · ' + gia(tong) + '</span>' +
      '<i class="gh-xoay" aria-hidden="true"></i><svg class="gh-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" pathLength="1"/></svg></button>' +
    '<p class="gio-luuy">Đặt xong cửa hàng nhắn lại để xác nhận. Chưa cần trả trước.</p>' +
    '</form>';
  $('#fDat').onsubmit = function (ev) { ev.preventDefault(); guiDon(muaDuoc, tong); };
  $('#fDat').addEventListener('change', function (ev) { if (ev.target.name === 'traTien') doiCachTra(tong); });
  $('#fDat').addEventListener('input', function (ev) {   // nhãn nổi, dấu tích khi điền đúng, đường nối các bước đầy dần
    var o = ev.target, l = o.closest('.gh-o'); if (!l) return;
    l.classList.toggle('co', o.value.trim() !== ''); l.classList.remove('sai');
    if (HOP[o.name]) { l.classList.toggle('dung', HOP[o.name](o.value)); if (!dangGui) datBuoc(1, tienDo()); }
  });
  doiCachTra(tong);
  datBuoc(1, tienDo());
}

function veCachTra(tong) {
  var ds = cachTra();
  return '<h3>Cách thanh toán</h3><div class="gio-tra">' + ds.map(function (c, i) {
    var st = tienTra(c.k, tong);
    return '<label class="tra-o"><input type="radio" name="traTien" value="' + c.k + '"' + (i ? '' : ' checked') + '>' +
      '<span class="tra-tt"><b>' + c.ten + (st ? ' · ' + gia(st) : '') + '</b><small>' + c.mo + '</small></span></label>';
  }).join('') + '</div><div class="tra-tk" id="traTk" hidden></div>';
}

function khungTk(cach, soTien, maDonHang) {
  if (cach === 'cod') return '';
  if (!coTk()) return '<p class="gio-luuy">Đặt xong cửa hàng nhắn Zalo gửi bạn số tài khoản và xác nhận đơn.</p>';
  var qr = TRA.qr !== false && maDonHang ? 'https://img.vietqr.io/image/' + encodeURIComponent(TRA.nganHang) + '-' +
      encodeURIComponent(TRA.stk) + '-compact2.png?amount=' + soTien +
      (TRA.chuTk ? '&accountName=' + encodeURIComponent(TRA.chuTk) : '') : '';
  return '<div class="ck-hop">' +
    (qr ? '<img class="ck-qr" src="' + qr + '" alt="Mã QR chuyển khoản" width="230" height="230" loading="lazy">' : '') +
    '<dl class="ck-tt">' +
      '<dt>Ngân hàng</dt><dd>' + e(TRA.tenNganHang || TRA.nganHang) + '</dd>' +
      '<dt>Số tài khoản</dt><dd><b>' + e(TRA.stk) + '</b>' + nutChep(TRA.stk) + '</dd>' +
      (TRA.chuTk ? '<dt>Chủ tài khoản</dt><dd>' + e(TRA.chuTk) + '</dd>' : '') +
      '<dt>Số tiền</dt><dd><b>' + gia(soTien) + '</b>' + (cach === 'coc' ? ' <small>cọc ' + PT_COC + '%</small>' : '') + '</dd>' +
      (maDonHang ? '<dt>Mã đơn</dt><dd><b>' + e(maDonHang) + '</b>' + nutChep(maDonHang) + '</dd>' : '') +
    '</dl></div>';
}
function nutChep(s) { return ' <button type="button" class="chep-nho" data-chep-tho="' + e(s) + '">Chép</button>'; }

function doiCachTra(tong) {
  var f = $('#fDat'), hop = $('#traTk'); if (!f || !hop) return;
  var cach = f.traTien ? f.traTien.value : 'cod';
  hop.innerHTML = khungTk(cach, tienTra(cach, tong), '');
  hop.hidden = !hop.innerHTML;
  if (!dangGui) nhanNut('Đặt mua · ' + gia(tong));
}

function maDon() {
  var d = new Date(), s = function (n) { return ('0' + n).slice(-2); };
  return 'DH' + s(d.getFullYear() % 100) + s(d.getMonth() + 1) + s(d.getDate()) + '-' + String(Math.floor(Math.random() * 900) + 100);
}

function guiDon(muaDuoc, tong) {
  if (dangGui) return;
  var f = $('#fDat'), loi = function (s, o) {
    var p = $('#loiDat'); p.hidden = !s; p.textContent = s || '';
    if (o) {   // ô sai rung nhẹ rồi được chọn để sửa
      var l = o.closest('.gh-o'); l.classList.remove('sai'); void l.offsetWidth; l.classList.add('sai');
      try { o.focus({preventScroll: true}); } catch (er) { o.focus(); }
    }
  };
  var ten = f.ten.value.trim(), sdt = f.sdt.value.trim(), diaChi = f.diaChi.value.trim(), ghiChu = f.ghiChu.value.trim();
  if (ten.length < 2) return loi('Bạn điền họ tên giúp cửa hàng nhé.', f.ten);
  if (sdt.replace(/\D/g, '').length < 9) return loi('Số điện thoại chưa đúng.', f.sdt);
  if (diaChi.length < 8) return loi('Bạn điền địa chỉ giao hàng đầy đủ hơn nhé.', f.diaChi);
  loi('');

  var cach = f.traTien ? f.traTien.value : 'cod';
  if (['cod', 'ck', 'coc'].indexOf(cach) < 0) cach = 'cod';
  dangGui = true; $('#nutDat').disabled = true; nhanNut('Đang gửi đơn…');
  $('#nutDat').classList.add('dang'); $('#nutDat').setAttribute('aria-label', 'Đang gửi đơn'); datBuoc(2, 0);
  var ma = maDon();
  var don = {
    ma: ma, uid: KHACH.user.uid, email: KHACH.user.email || '',
    ten: ten.slice(0, 80), sdt: sdt.slice(0, 20), diaChi: diaChi.slice(0, 300), ghiChu: ghiChu.slice(0, 500),
    mon: muaDuoc.map(function (g) {
      var m = {ma: String(g.x.ma), k: String(khoa(g.x)), ten: String(g.x.ten).slice(0, 150), gia: g.x.gia, anh: (g.x.anh || [])[0] || ''};
      if (g.x.td) { m.ten = (g.x.ten + ' × ' + g.x.sl).slice(0, 150); m.sl = g.x.sl; m.don = g.x.don; }   // trầm đốt: giá = đơn giá × số lượng
      return m;
    }),
    soMon: muaDuoc.length, tong: tong, traTien: cach, canTra: tienTra(cach, tong),
    trangThai: 'moi', daXem: false,
    luc: firebase.firestore.FieldValue.serverTimestamp()
  };
  KHACH.db.collection('donHang').add(don)
    .then(function () { return KHACH.ghi({ten: ten, sdt: sdt, diaChi: diaChi}).catch(function () {}); })
    .then(function () {
      muaDuoc.forEach(function (g) { GIO.bo(g.k); });
      var n = $('#nutDat'); if (n) { n.classList.add('xong'); n.setAttribute('aria-label', 'Đã gửi đơn'); }   // dấu tích trong nút rồi mới sang trang cảm ơn
      setTimeout(function () { veXong(don); }, GIAM ? 0 : 950);
    })
    .catch(function (er) {
      var n = $('#nutDat');
      dangGui = false; n.disabled = false; n.classList.remove('dang', 'xong'); n.removeAttribute('aria-label'); nhanNut('Đặt mua · ' + gia(tong)); datBuoc(1, tienDo());
      loi(er && er.code === 'permission-denied' ? 'Chưa gửi được đơn (web chưa mở quyền ghi đơn). Bạn nhắn Zalo giúp cửa hàng nhé.' : 'Chưa gửi được đơn, bạn kiểm tra mạng rồi thử lại.');
    });
}

function veXong(don) {
  noiGio.innerHTML = buocHtml() + '<div class="tk-hop giua gio-xong">' +
    '<div class="dau-tick gh-ve"><svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path class="gh-ve-vong" d="M32 3a29 29 0 1 1 0 58a29 29 0 1 1 0-58" pathLength="1"/>' +
      '<path class="gh-ve-tick" d="M20 33l8.5 8.5L45 24" pathLength="1"/></svg></div>' +
    '<span class="nho">Đã nhận đơn</span><h1>Cảm ơn <em>' + e(don.ten.split(' ').pop()) + '</em></h1>' +
    '<p class="dan">Đơn <b>' + e(don.ma) + '</b> · ' + don.soMon + ' món · ' + gia(don.tong) + '<br>Cửa hàng đã nhận được và sẽ nhắn vào số ' + e(don.sdt) + ' để xác nhận, gửi video món thật rồi mới giao.</p>' +
    (don.traTien === 'cod' ? '' : '<div class="xong-ck"><h3>' + (don.traTien === 'coc' ? 'Cọc giữ món' : 'Chuyển khoản cho đơn này') + '</h3>' +
      khungTk(don.traTien, don.canTra, don.ma) +
      '<p class="gio-luuy">Chuyển xong bạn nhắn Zalo giúp cửa hàng, đơn được xác nhận nhanh hơn.</p></div>') +
    '<div class="hang giua-hang"><a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(don.ma) + '">Nhắn Zalo kèm mã đơn</a>' +
    '<a class="nut" href="tai-khoan.html">Xem đơn của tôi</a></div>' +
    '<a class="sang-trang" href="index.html#san-pham">Xem thêm sản phẩm <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>';
  theoDoi(noiGio);
  datBuoc(4, 0);
  if (scrollY > noiGio.getBoundingClientRect().top + scrollY) window.scrollTo({top: 0, behavior: GIAM ? 'auto' : 'smooth'});   // đang ở dưới form (điện thoại) thì đưa lên để thấy lời cảm ơn
}

noiGio.addEventListener('click', function (ev) {
  var gp = ev.target.closest('#ghGap');
  if (gp) {   // gập / mở chi tiết đơn (không vẽ lại trang)
    moTom = !moTom;
    gp.setAttribute('aria-expanded', moTom); $('#ghChi').classList.toggle('mo', moTom);
    gp.querySelector('.gh-mo em').textContent = moTom ? 'Thu gọn' : 'Xem chi tiết';
    return;
  }
  var c = ev.target.closest('[data-chep-tho]');
  if (c) {
    if (navigator.clipboard) navigator.clipboard.writeText(c.dataset.chepTho).catch(function () {});
    baoTin('Đã chép ' + c.dataset.chepTho);
    return;
  }
  var sl = ev.target.closest('[data-sl]');
  if (sl) {
    var cu = GIO.sl(sl.dataset.k), moi = Math.max(1, cu + +sl.dataset.sl);
    tongCu = MON.filter(function (g) { return g.mua; }).reduce(function (s, g) { return s + g.x.gia; }, 0);
    lanSl = {k: sl.dataset.k, cu: cu, moi: moi};
    GIO.datSl(sl.dataset.k, moi); veGio(); return;
  }
  var b = ev.target.closest('[data-bo]'); if (!b) return;
  GIO.bo(b.dataset.bo); veGio();
});
