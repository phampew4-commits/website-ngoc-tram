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
  $('#csMuc').innerHTML = '<span class="nho">Mục lục</span>' + MUC.map(function (m, i) { return '<a href="#' + m.id + '"><i>' + ('0' + (i + 1)).slice(-2) + '</i>' + m.ten + '</a>'; }).join('') +
    '<div class="cs-hoi"><b>Còn thắc mắc?</b><a href="' + linkZalo() + '" target="_blank" rel="noopener">Nhắn Zalo ' + e(LIEN_HE.sdt || '') + '</a></div>';
  $('#csNoi').innerHTML = MUC.map(function (m, i) {
    return '<section class="cs-phan" id="' + m.id + '" data-hien><span class="so-phan">' + ('0' + (i + 1)).slice(-2) + '</span><h2>' + m.ten + '</h2>' +
      '<ul class="ds-tp">' + m.ds.map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul></section>';
  }).join('') + '<p class="cs-cap">Chính sách áp dụng cho mọi đơn mua tại cửa hàng và trên website Ngọc Trầm Store.</p>';
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
  $('#cnGiuNgoc').innerHTML = theMeo((CH.chamSoc || {}).ngoc, true);
  $('#cnGiuTram').innerHTML = theMeo((CH.chamSoc || {}).tram, true);
  $('#cnCharm').innerHTML = '<ul class="ds-tp">' + CHINH_SACH.luuY.concat([
    'Tháo charm khi tắm, bơi hay dùng hoá chất tẩy rửa để vàng không xỉn màu.',
    'Cất charm riêng trong túi vải, tránh cọ xát với đá cứng làm xước mặt vàng.'
  ]).map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>';
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
})();

/* ================= VỀ NGỌC TRẦM ================= */
if (TRANG === 've-ngoc-tram') (function () {
  var v = ND.van || {};
  $('#vntBuoc').innerHTML = [1, 2, 3].map(function (i) {
    return '<div class="meo" data-hien style="--i:' + (i - 1) + '"><span class="so">0' + i + '</span><b>' + e(v['quy.b' + i + 't'] || '') + '</b><p>' + e(v['quy.b' + i + 'n'] || '') + '</p></div>';
  }).join('');
  $('#vntCk').innerHTML = (ND.camKet || []).map(function (c, i) { return '<div class="vnt-ck-o" data-hien style="--i:' + i + '"><span>' + ('0' + (i + 1)).slice(-2) + '</span><b>' + e(c) + '</b></div>'; }).join('');
  taiDuLieu.then(function () {
    var con = conHang(''), dong = NGOC_TIM.filter(function (t) { return con.some(function (x) { return ngocCua(x).indexOf(t) >= 0; }); }).length;
    var nam = +(v['cc.nam'] || 2015);
    $('#vntSo').innerHTML = [[nam, 'Năm thành lập'], [new Date().getFullYear() - nam, 'Năm chọn ngọc'], [con.length, 'Món đang có'], [dong, 'Dòng ngọc']]
      .map(function (x, i) { return '<div data-hien style="--i:' + i + '"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
    var x = con.filter(function (y) { return y.loai === 'chuoi'; })[0] || con[0];
    if (x) $('#vntAnh').innerHTML = hinh(x.anh[1] || x.anh[0], '', 1600, ' fetchpriority="high"');
    theoDoi($('#noi'));
  });
  theoDoi($('#noi'));
  requestAnimationFrame(function () { setTimeout(function () { $$('.vnt-dau .tieu-de,.vnt-dau [data-hien]').forEach(function (x) { x.classList.add('hien'); }); }, 150); });
})();

/* tiêu đề đầu các trang phụ hiện ngay khi mở */
requestAnimationFrame(function () { setTimeout(function () { $$('.tp-dau .tieu-de,.tp-dau [data-hien]').forEach(function (x) { x.classList.add('hien'); }); }, 120); });
