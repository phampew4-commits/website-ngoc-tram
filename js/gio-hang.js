/* Trang GIỎ HÀNG — xem món đã chọn rồi đặt mua.
   Đơn ghi vào Firestore (donHang) → app Ngọc Trầm trên máy cửa hàng đọc và báo đơn mới.
   Giỏ chỉ giữ mã món (chung.js › GIO); tên, giá, trạng thái lấy mới từ data/san-pham.json mỗi lần mở trang. */
var noiGio = $('#gioNoi'), MON = [], dangGui = false;

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

taiDuLieu.then(function () { if (KHACH.bat) KHACH.san.then(function () { KHACH.nghe.push(veGio); veGio(); }); else veGio(); });

function monTrongGio() {
  var m = {};
  ds.forEach(function (x) { m[String(khoa(x))] = x; m[String(x.ma)] = x; });
  return GIO.ds().map(function (k) {
    var x = m[k];
    return {k: k, x: x, mua: !!(x && x.tt !== 'Đã bán' && x.gia)};
  });
}

function veGio() {
  MON = monTrongGio();
  var muaDuoc = MON.filter(function (g) { return g.mua; });
  var tong = muaDuoc.reduce(function (s, g) { return s + g.x.gia; }, 0);

  if (!MON.length) {
    noiGio.innerHTML = '<div class="tk-hop giua"><span class="nho">Giỏ hàng</span><h1>Giỏ đang <em>trống</em></h1>' +
      '<p class="dan">Bạn chọn món ưng ý rồi bấm “Thêm vào giỏ”, mọi món sẽ gom về đây để đặt một lần.</p>' +
      '<a class="nut dac" href="index.html#san-pham">Xem sản phẩm</a></div>';
    return;
  }

  noiGio.innerHTML = '<div class="gio-dau"><span class="nho" data-hien>Giỏ hàng</span>' +
      '<h1 class="tieu-de"><span class="dong-chu"><span>Món bạn <em>đã chọn</em></span></span></h1>' +
      '<p data-hien>Mỗi món chỉ có một, nên giỏ không có số lượng. Đặt xong, cửa hàng nhắn lại ngay để xác nhận và gửi video món thật trước khi giao.</p></div>' +
    '<div class="gio-luoi">' +
      '<div class="gio-ds">' + MON.map(dongMon).join('') + '</div>' +
      '<aside class="gio-ben"><div class="gio-tom">' +
        '<div class="hang-tom"><span>' + muaDuoc.length + ' món đặt được</span><b>' + gia(tong) + '</b></div>' +
        (MON.length > muaDuoc.length ? '<p class="gio-luuy">' + (MON.length - muaDuoc.length) + ' món không đặt được, bạn bỏ khỏi giỏ giúp cửa hàng nhé.</p>' : '') +
        '<p class="gio-luuy">Chưa tính phí gửi. Cửa hàng báo phí khi xác nhận đơn.</p>' +
        '</div><div id="gioDat"></div></aside>' +
    '</div>';
  theoDoi(noiGio);
  veDat(muaDuoc, tong);
}

function dongMon(g) {
  if (!g.x) return '<div class="gio-mon het"><div class="gio-anh"></div><div class="gio-tt"><h3>Món ' + e(g.k) + '</h3>' +
    '<p class="gio-het">Món này vừa được bán hoặc tạm ẩn.</p></div>' +
    '<button class="gio-bo" data-bo="' + e(g.k) + '" aria-label="Bỏ khỏi giỏ">Bỏ</button></div>';
  var x = g.x;
  return '<div class="gio-mon' + (g.mua ? '' : ' het') + '">' +
    '<a class="gio-anh" href="' + linkSp(x) + '">' + hinh(x.anh[0], x.ten, 220) + '</a>' +
    '<div class="gio-tt"><h3><a href="' + linkSp(x) + '">' + e(x.ten) + '</a></h3>' +
      '<div class="gio-ma">Mã ' + e(x.ma) + ' · ' + LOAI[x.loai].ngan + '</div>' +
      (g.mua ? '<div class="gio-gia">' + gia(x.gia) + '</div>'
             : '<p class="gio-het">' + (x.tt === 'Đã bán' ? 'Món này đã có chủ mất rồi.' : 'Món này chưa có giá, bạn nhắn Zalo để cửa hàng báo giá.') + '</p>') +
    '</div><button class="gio-bo" data-bo="' + e(g.k) + '" aria-label="Bỏ khỏi giỏ">Bỏ</button></div>';
}

/* ---------- khung đặt mua ---------- */
function veDat(muaDuoc, tong) {
  var o = $('#gioDat');
  if (!muaDuoc.length) { o.innerHTML = ''; return; }
  if (!KHACH.bat) {
    o.innerHTML = '<p class="gio-luuy">Bạn nhắn Zalo kèm mã món, cửa hàng chốt đơn giúp bạn.</p>' +
      '<a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(muaDuoc.map(function (g) { return g.x.ma; }).join(', ')) + '">Nhắn Zalo đặt mua</a>';
    return;
  }
  if (!KHACH.user) {
    o.innerHTML = '<p class="gio-luuy">Đăng nhập để đặt hàng — cửa hàng biết đơn của ai, bạn cũng xem lại được đơn đã đặt.</p>' +
      '<button class="nut dac" id="nutVao">Đăng nhập để đặt mua</button>';
    $('#nutVao').onclick = function () { KHACH.canDangNhap(); };
    return;
  }
  var h = KHACH.ho || {};
  o.innerHTML = '<form class="gio-form" id="fDat" novalidate>' +
    '<h3>Người nhận</h3>' +
    '<label>Họ tên<input name="ten" autocomplete="name" value="' + e(h.ten || '') + '" required></label>' +
    '<label>Số điện thoại<input name="sdt" type="tel" inputmode="numeric" autocomplete="tel" value="' + e(h.sdt || '') + '" required></label>' +
    '<label>Địa chỉ giao hàng<textarea name="diaChi" rows="2" autocomplete="street-address" required>' + e(h.diaChi || '') + '</textarea></label>' +
    '<label>Ghi chú <small>(không bắt buộc)</small><textarea name="ghiChu" rows="2" placeholder="Cỡ tay, cách gói, giờ nhận hàng…"></textarea></label>' +
    veCachTra(tong) +
    '<p class="loi-tk" id="loiDat" hidden></p>' +
    '<button class="nut dac" type="submit" id="nutDat">Đặt mua · ' + gia(tong) + '</button>' +
    '<p class="gio-luuy">Đặt xong cửa hàng nhắn lại để xác nhận. Chưa cần trả trước.</p>' +
    '</form>';
  $('#fDat').onsubmit = function (ev) { ev.preventDefault(); guiDon(muaDuoc, tong); };
  $('#fDat').addEventListener('change', function (ev) { if (ev.target.name === 'traTien') doiCachTra(tong); });
  doiCachTra(tong);
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
      encodeURIComponent(TRA.stk) + '-compact2.png?amount=' + soTien + '&addInfo=' + encodeURIComponent(maDonHang) +
      (TRA.chuTk ? '&accountName=' + encodeURIComponent(TRA.chuTk) : '') : '';
  return '<div class="ck-hop">' +
    (qr ? '<img class="ck-qr" src="' + qr + '" alt="Mã QR chuyển khoản" width="230" height="230" loading="lazy">' : '') +
    '<dl class="ck-tt">' +
      '<dt>Ngân hàng</dt><dd>' + e(TRA.tenNganHang || TRA.nganHang) + '</dd>' +
      '<dt>Số tài khoản</dt><dd><b>' + e(TRA.stk) + '</b>' + nutChep(TRA.stk) + '</dd>' +
      (TRA.chuTk ? '<dt>Chủ tài khoản</dt><dd>' + e(TRA.chuTk) + '</dd>' : '') +
      '<dt>Số tiền</dt><dd><b>' + gia(soTien) + '</b>' + (cach === 'coc' ? ' <small>cọc ' + PT_COC + '%</small>' : '') + '</dd>' +
      (maDonHang ? '<dt>Nội dung</dt><dd><b>' + e(maDonHang) + '</b>' + nutChep(maDonHang) + '</dd>'
                 : '<dt>Nội dung</dt><dd>mã đơn — hiện ngay sau khi bạn đặt</dd>') +
    '</dl></div>';
}
function nutChep(s) { return ' <button type="button" class="chep-nho" data-chep-tho="' + e(s) + '">Chép</button>'; }

function doiCachTra(tong) {
  var f = $('#fDat'), hop = $('#traTk'); if (!f || !hop) return;
  var cach = f.traTien ? f.traTien.value : 'cod';
  hop.innerHTML = khungTk(cach, tienTra(cach, tong), '');
  hop.hidden = !hop.innerHTML;
  var n = $('#nutDat'); if (n && !dangGui) n.textContent = 'Đặt mua · ' + gia(tong);
}

function maDon() {
  var d = new Date(), s = function (n) { return ('0' + n).slice(-2); };
  return 'DH' + s(d.getFullYear() % 100) + s(d.getMonth() + 1) + s(d.getDate()) + '-' + String(Math.floor(Math.random() * 900) + 100);
}

function guiDon(muaDuoc, tong) {
  if (dangGui) return;
  var f = $('#fDat'), loi = function (s) { var p = $('#loiDat'); p.hidden = !s; p.textContent = s || ''; };
  var ten = f.ten.value.trim(), sdt = f.sdt.value.trim(), diaChi = f.diaChi.value.trim(), ghiChu = f.ghiChu.value.trim();
  if (ten.length < 2) return loi('Bạn điền họ tên giúp cửa hàng nhé.');
  if (sdt.replace(/\D/g, '').length < 9) return loi('Số điện thoại chưa đúng.');
  if (diaChi.length < 8) return loi('Bạn điền địa chỉ giao hàng đầy đủ hơn nhé.');

  var cach = f.traTien ? f.traTien.value : 'cod';
  if (['cod', 'ck', 'coc'].indexOf(cach) < 0) cach = 'cod';
  dangGui = true; $('#nutDat').disabled = true; $('#nutDat').textContent = 'Đang gửi đơn…';
  var ma = maDon();
  var don = {
    ma: ma, uid: KHACH.user.uid, email: KHACH.user.email || '',
    ten: ten.slice(0, 80), sdt: sdt.slice(0, 20), diaChi: diaChi.slice(0, 300), ghiChu: ghiChu.slice(0, 500),
    mon: muaDuoc.map(function (g) { return {ma: String(g.x.ma), k: String(khoa(g.x)), ten: String(g.x.ten).slice(0, 150), gia: g.x.gia, anh: (g.x.anh || [])[0] || ''}; }),
    soMon: muaDuoc.length, tong: tong, traTien: cach, canTra: tienTra(cach, tong),
    trangThai: 'moi', daXem: false,
    luc: firebase.firestore.FieldValue.serverTimestamp()
  };
  KHACH.db.collection('donHang').add(don)
    .then(function () { return KHACH.ghi({ten: ten, sdt: sdt, diaChi: diaChi}).catch(function () {}); })
    .then(function () { muaDuoc.forEach(function (g) { GIO.bo(g.k); }); veXong(don); })
    .catch(function (er) {
      dangGui = false; $('#nutDat').disabled = false; $('#nutDat').textContent = 'Đặt mua · ' + gia(tong);
      loi(er && er.code === 'permission-denied' ? 'Chưa gửi được đơn (web chưa mở quyền ghi đơn). Bạn nhắn Zalo giúp cửa hàng nhé.' : 'Chưa gửi được đơn, bạn kiểm tra mạng rồi thử lại.');
    });
}

function veXong(don) {
  noiGio.innerHTML = '<div class="tk-hop giua gio-xong">' +
    '<div class="dau-tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 7"/></svg></div>' +
    '<span class="nho">Đã nhận đơn</span><h1>Cảm ơn <em>' + e(don.ten.split(' ').pop()) + '</em></h1>' +
    '<p class="dan">Đơn <b>' + e(don.ma) + '</b> · ' + don.soMon + ' món · ' + gia(don.tong) + '<br>Cửa hàng đã nhận được và sẽ nhắn vào số ' + e(don.sdt) + ' để xác nhận, gửi video món thật rồi mới giao.</p>' +
    (don.traTien === 'cod' ? '' : '<div class="xong-ck"><h3>' + (don.traTien === 'coc' ? 'Cọc giữ món' : 'Chuyển khoản cho đơn này') + '</h3>' +
      khungTk(don.traTien, don.canTra, don.ma) +
      '<p class="gio-luuy">Chuyển xong bạn nhắn Zalo giúp cửa hàng, đơn được xác nhận nhanh hơn.</p></div>') +
    '<div class="hang giua-hang"><a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(don.ma) + '">Nhắn Zalo kèm mã đơn</a>' +
    '<a class="nut" href="tai-khoan.html">Xem đơn của tôi</a></div>' +
    '<a class="sang-trang" href="index.html#san-pham">Xem thêm sản phẩm <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>';
  theoDoi(noiGio);
}

noiGio.addEventListener('click', function (ev) {
  var c = ev.target.closest('[data-chep-tho]');
  if (c) {
    if (navigator.clipboard) navigator.clipboard.writeText(c.dataset.chepTho).catch(function () {});
    baoTin('Đã chép ' + c.dataset.chepTho);
    return;
  }
  var b = ev.target.closest('[data-bo]'); if (!b) return;
  GIO.bo(b.dataset.bo); veGio();
});
