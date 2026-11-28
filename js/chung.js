/* ======== CÀI ĐẶT WEB — lấy từ cau-hinh.js (sửa trong app Ngọc Trầm › Quản trị web) ======== */
var CH = window.CAU_HINH || {};
var LIEN_HE = CH.lienHe || {fanpage: []};
LIEN_HE.fanpage = LIEN_HE.fanpage || [];

var LOAI = {
  tron:   {ten: 'Chuỗi ngọc',      ngan: 'Chuỗi'},       // chuỗi trơn (kho chuỗi trơn trong app), chưa gắn charm
  chuoi:  {ten: 'Chuỗi mix charm', ngan: 'Chuỗi mix'},
  charm:  {ten: 'Charm vàng',      ngan: 'Charm'},
  nhan:   {ten: 'Nhẫn',            ngan: 'Nhẫn'},
  khuyen: {ten: 'Khuyên tai',      ngan: 'Khuyên'},
  matday: {ten: 'Mặt dây',         ngan: 'Mặt dây'},
  tramdot: {ten: 'Trầm đốt',       ngan: 'Trầm đốt'}   // trầm đốt nhà làm (data/tram-dot.json) — KHÔNG nằm trong THU_TU, chỉ dùng cho giỏ
};
var THU_TU = ['tron', 'chuoi', 'charm', 'nhan', 'khuyen', 'matday'];
var ds = [], loc = 'tat', tu = '', sx = 'moi', soHien = 0, MOI_LAN = 16;
var GIAM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* bấm thẻ sản phẩm → mở trang chi tiết; trang chủ đặt moSp riêng (mở bằng hash). Mấy nút tròn trên ảnh tự lo phần của chúng. */
document.addEventListener('click', function (ev) {
  if (ev.target.closest('.viec')) return;
  var b = ev.target.closest('.sp'); if (b) moMon(b.dataset.k);
});
document.addEventListener('keydown', function (ev) {
  if (ev.key !== 'Enter' && ev.key !== ' ') return;
  var b = ev.target.closest && ev.target.closest('.sp'); if (!b || ev.target !== b) return;
  ev.preventDefault(); moMon(b.dataset.k);
});

function $(s) { return document.querySelector(s); }
function $$(s) { return [].slice.call(document.querySelectorAll(s)); }
function e(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (x) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]; }); }
function anh(id, w) { return /[\/.]/.test(id) ? id : 'https://lh3.googleusercontent.com/d/' + id + '=w' + (w || 600); }   // id Drive · hoặc đường dẫn ảnh trên web (img/day-tron/…)
function gia(n) { return n ? n.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'; }
function khoa(x) { return x.id || x.ma; }
function boDau(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
function ngaySo(s) { var m = /(\d+)\/(\d+)\/(\d+)\s*(\d+)?:?(\d+)?/.exec(s || ''); return m ? +new Date(+m[3], m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)) : 0; }
function hinh(id, alt, w, them) {   // #258: ảnh mờ rồi nét dần khi tải xong (lớp mo-dan; ảnh hero ưu tiên tải thì thôi)
  them = them || '';
  var mo = !/fetchpriority/.test(them), lop = '';
  if (mo) { if (/class="/.test(them)) them = them.replace('class="', 'class="mo-dan '); else lop = ' class="mo-dan"'; }
  return '<img src="' + anh(id, w) + '" alt="' + e(alt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"' + lop + them + '>';
}

/* ======== CHÍNH SÁCH — sửa ở đây (dùng cho Hỏi đáp + trang chi tiết) ======== */
var CHINH_SACH = {};
['giao', 'doi', 'luuY', 'bh'].forEach(function (k) {
  CHINH_SACH[k] = ((CH.chinhSach || {})[k] || []).map(function (x) { return String(x).replace(/\{sdt\}/g, LIEN_HE.sdt || ''); });
});
function dsCs(k) { return '<ul class="ds-tp">' + CHINH_SACH[k].map(function (x) { return '<li>' + e(x) + '</li>'; }).join('') + '</ul>'; }
$$('[data-cs]').forEach(function (u) { u.outerHTML = dsCs(u.dataset.cs); });

/* ---------- NỘI DUNG TRANG (CH.noiDung — sửa trong app › Nội dung trang) ----------
   Chữ có *dấu sao* → in nghiêng màu vàng. Tiêu đề lớn: mỗi dòng xuống hàng là một dòng chữ trồi lên. */
var ND = CH.noiDung || {};
function ndHtml(v) { return e(v).replace(/\*(.+?)\*/g, '<em>$1</em>'); }
$$('[data-nd]').forEach(function (el) {
  var v = (ND.van || {})[el.dataset.nd];
  if (v == null || String(v).trim() === '') return;
  if (el.classList.contains('tieu-de'))
    el.innerHTML = String(v).split('\n').filter(function (l) { return l.trim(); })
      .map(function (l) { return '<span class="dong-chu"><span>' + ndHtml(l) + '</span></span>'; }).join('');
  else el.innerHTML = ndHtml(v).replace(/\n/g, '<br>');
});
if ((ND.camKet || []).length) $$('.cam-ket ul').forEach(function (ul) {
  [].forEach.call(ul.children, function (li, i) { if (ND.camKet[i]) li.lastChild.textContent = ND.camKet[i]; });
});
(function () {
  var o = $('#hdChung'); if (!o) return;
  o.outerHTML = (ND.hoiDap || []).filter(function (x) { return x.hoi; }).map(function (x, i) {
    return '<details' + (i ? '' : ' open') + '><summary>' + e(x.hoi) + '</summary><div class="tl"><div><p>' + e(x.dap).replace(/\n/g, '<br>') + '</p></div></div></details>';
  }).join('');
})();
(function () {   // dải thông báo trên cùng (đóng thì ẩn tới khi đổi nội dung)
  var tb = ND.thongBao || {};
  if (!tb.bat || !String(tb.chu || '').trim()) return;
  var k = 'nt-tb-' + tb.chu, da = false;
  try { da = !!localStorage.getItem(k); } catch (er) {}
  if (da || !$('#dau')) return;
  var b = document.createElement('div'); b.className = 'dai-tb';
  b.innerHTML = (tb.link ? '<a href="' + e(tb.link) + '">' + ndHtml(tb.chu) + ' <span aria-hidden="true">→</span></a>' : '<span>' + ndHtml(tb.chu) + '</span>') +
    '<button type="button" aria-label="Đóng thông báo">×</button>';
  $('#dau').insertBefore(b, $('#dau').firstChild);
  document.body.classList.add('co-tb');
  b.querySelector('button').onclick = function () { b.remove(); document.body.classList.remove('co-tb'); try { localStorage.setItem(k, '1'); } catch (er) {} };
})();

/* ---------- liên hệ ---------- */
function linkZalo() { return LIEN_HE.sdt ? 'https://zalo.me/' + LIEN_HE.sdt.replace(/\D/g, '') : '#lien-he'; }
function laDienThoai() { return matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent); }
// điện thoại: m.me mở thẳng app Messenger · máy tính: m.me chuyển sang messenger.com bắt đăng nhập riêng → mở trang Facebook, khách bấm "Nhắn tin"
function linkFb() { return !LIEN_HE.messenger ? '#lien-he' : laDienThoai() ? 'https://m.me/' + LIEN_HE.messenger : 'https://www.facebook.com/' + LIEN_HE.messenger; }
$$('[data-zalo]').forEach(function (a) { a.href = linkZalo(); if (LIEN_HE.sdt) a.target = '_blank'; });
$$('[data-fb]').forEach(function (a) { a.href = linkFb(); if (LIEN_HE.messenger) a.target = '_blank'; });
/* ---------- chân trang (dựng chung cho mọi trang) ---------- */
var IC = {
  fb: '<path d="M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v7h4v-7h3l1-4h-4V8.5a.5.5 0 01.5-.5z" fill="currentColor" stroke="none"/>',
  zalo: '<path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.6 1.4 4.9 3.6 6.5L5 21l3.4-1.8c1.1.3 2.3.5 3.6.5 5.5 0 10-3.8 10-8.5S17.5 3 12 3z"/><text x="12" y="13.6" font-size="6.2" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none" font-family="Arial,sans-serif">Zalo</text>',
  ms: '<path d="M12 3C7 3 3 6.7 3 11.3c0 2.6 1.3 4.9 3.3 6.4V21l3-1.7c.9.2 1.8.4 2.7.4 5 0 9-3.7 9-8.3S17 3 12 3z"/><path d="M7.5 13.5l3-3.2 2 2 3.5-2.8-3 3.3-2-2z" fill="currentColor"/>',
  ig: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17" cy="7" r=".9" fill="currentColor"/>',
  tt: '<path d="M14 4v10.5a3.5 3.5 0 11-3.5-3.5M14 4c.4 2.4 2 4 4.5 4.3"/>'
};
function bieuTuong(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg>'; }
function phut(s) { var p = s.split(':'); return +p[0] * 60 + +(p[1] || 0); }
function trangThaiMo() {   // theo giờ Việt Nam (UTC+7), không phụ thuộc múi giờ máy khách
  var d = new Date(), vn = (d.getUTCHours() * 60 + d.getUTCMinutes() + 7 * 60) % 1440, mo = phut(LIEN_HE.gioMo), dong = phut(LIEN_HE.gioDong);
  return vn >= mo && vn < dong ? {mo: true, chu: 'Đang mở cửa · đóng lúc ' + LIEN_HE.gioDong}
                               : {mo: false, chu: 'Đã đóng cửa · mở lại lúc ' + LIEN_HE.gioMo};
}
function dungChanTrang() {
  var o = $('#chanTrang'); if (!o) return;
  var veTrang = $('.hero') ? '' : 'index.html', tt = trangThaiMo();
  var mxh = [['fb', LIEN_HE.fanpage[0] && LIEN_HE.fanpage[0].link, 'Facebook'], ['zalo', linkZalo(), 'Zalo'], ['ms', linkFb(), 'Messenger'],
             ['ig', LIEN_HE.instagram, 'Instagram'], ['tt', LIEN_HE.tiktok, 'TikTok']]
    .filter(function (x) { return x[1]; })
    .map(function (x) { return '<a href="' + e(x[1]) + '" target="_blank" rel="noopener" aria-label="' + x[2] + '" title="' + x[2] + '">' + bieuTuong(x[0]) + '</a>'; }).join('');
  var cot = function (tieu, ds) { return '<div class="cot-lk"><h4>' + tieu + '</h4><ul>' + ds.map(function (x) { return '<li><a href="' + x[1] + '"' + (x[2] ? ' target="_blank" rel="noopener"' : '') + '>' + e(x[0]) + '</a></li>'; }).join('') + '</ul></div>'; };
  o.outerHTML =
    '<div class="moi-ve"><div class="khung">' +
      '<div class="dau-mv"><span class="nho">Mới về tại cửa hàng</span><a href="cua-hang.html">Xem tất cả <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
      '<div class="luoi-mv" id="luoiMv"></div>' +
    '</div></div>' +
    '<div class="duoi"><div class="khung ct-luoi">' +
      '<div class="cot-tt">' +
        '<a class="hieu-ct" href="' + (veTrang || '#') + '"><img src="img/hoa.png" alt=""><b>Ngọc Trầm</b></a>' +
        '<p>' + ndHtml(ND.gioiThieu || 'Phỉ thuý & trang sức vàng, chọn tay từng món từ năm 2015.') + '</p>' +
        '<div class="mo-cua' + (tt.mo ? ' mo' : '') + '"><i></i>' + tt.chu + '</div>' +
        '<ul class="lien-he-ct">' +
          '<li><small>Zalo · Điện thoại</small><a href="tel:' + e(LIEN_HE.sdt) + '">' + e(LIEN_HE.sdt) + '</a></li>' +
          '<li><small>Giờ làm việc</small>' + e(LIEN_HE.gio) + '</li>' +
        '</ul>' +
        '<div class="mxh sang-theo-chuot">' + mxh + '</div>' +
        (LIEN_HE.nhomZalo ? '<a class="nut sang nho-tin" href="' + e(LIEN_HE.nhomZalo) + '" target="_blank" rel="noopener">Nhận tin món mới qua Zalo</a>' : '') +
      '</div>' +
      cot('Mua sắm', [['Tất cả sản phẩm', 'cua-hang.html']].concat(THU_TU.map(function (l) { return [LOAI[l].ten, 'cua-hang.html?loai=' + l]; }))
        .concat([['Trầm đốt nhà làm', 'tram-huong.html'], ['Quà tặng theo ngân sách', 'qua-tang.html'], ['Tự thiết kế chuỗi', 'thiet-ke.html']])) +
      cot('Hỗ trợ', [['Chính sách giao hàng', 'chinh-sach.html#giao-hang'], ['Thanh toán', 'chinh-sach.html#thanh-toan'], ['Đổi trả', 'chinh-sach.html#doi-tra'], ['Bảo hành', 'chinh-sach.html#bao-hanh'],
        ['Chọn size vòng & nhẫn', 'chon-size.html'], ['Cẩm nang ngọc', 'cam-nang.html'], ['Hỏi đáp', veTrang + '#hoi-dap']]) +
      cot('Ngọc Trầm', [['Về Ngọc Trầm', 've-ngoc-tram.html'], ['Liên hệ & cửa hàng', 'lien-he.html'], ['Bảo mật thông tin', 'chinh-sach.html#bao-mat']].concat(LIEN_HE.fanpage.map(function (f) { return [f.ten, f.link, 1]; }))) +
      '<div class="cot-bd">' +
        '<div class="ban-do"><iframe title="Bản đồ Ngọc Trầm Store" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(LIEN_HE.toaDo) + '&z=16&hl=vi&output=embed"></iframe></div>' +
        '<p>' + e(LIEN_HE.diaChi) + '</p>' +
        '<a class="chi-duong" href="' + e(LIEN_HE.banDo) + '" target="_blank" rel="noopener">Chỉ đường <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M9 7h8v8"/></svg></a>' +
      '</div>' +
    '</div></div>' +
    '<div class="dai-tt"><div class="khung"><span>Thanh toán: ' + cachTraNgan() + '</span><span>Giao hàng: Vietnam Post · Toàn quốc</span><span>Ship miễn phí đơn từ 1.500.000đ chuyển khoản trước</span></div></div>' +
    '<div class="ban-quyen"><span>© ' + new Date().getFullYear() + ' Ngọc Trầm Store</span><span>Jade &amp; Agarwood · Việt Nam · Est. 2015</span></div>' +
    '<div class="chu-lon" aria-hidden="true"><span>Ngọc Trầm</span></div>';
  // dải "Mới về": 6 món mới nhất (ưu tiên chuỗi, nhẫn, khuyên, mặt dây)
  taiDuLieu.then(function () {
    var r = ds.slice().sort(function (a, b) { return (a.loai === 'charm') - (b.loai === 'charm') || ngaySo(b.ngay) - ngaySo(a.ngay); }).slice(0, 12);
    var l = $('#luoiMv'); if (!l || !r.length) return;
    var the = function (x, gia_) { return '<a href="' + linkSp(x) + '"' + (gia_ ? ' tabindex="-1" aria-hidden="true"' : '') + '><span class="h">' +
      hinh(x.anh[0], gia_ ? '' : x.ten, 400) + '</span><span class="tt-mv"><b>' + e(x.ten) + '</b>' + gia(x.gia) + '</span></a>'; };
    /* dải chạy liên tục: dựng 2 lượt giống nhau, trượt đúng nửa chiều dài thì quay về đầu → không thấy chỗ nối.
       Tốc độ cố định ~32px/giây dù bao nhiêu món (nhiều món thì một vòng dài hơn). */
    l.innerHTML = '<div class="bang-mv sang-theo-chuot">' + r.map(function (x) { return the(x); }).join('') + r.map(function (x) { return the(x, 1); }).join('') + '</div>';
    l.style.setProperty('--tg-mv', Math.max(40, Math.round(r.length * 212 / 32)) + 's');
  }).catch(function () {});
}


/* =========================================================
   MENU LỚN (mega) — dựng bằng JS nên 5 trang dùng chung
   Máy tính: rê vào mục là bảng sổ xuống hết bề ngang.
   Điện thoại: mỗi mục là một khay gập trong màn hình menu.
   ========================================================= */
var NGOC_TIM = ['Phỉ thuý', 'Lam băng', 'Lục đế', 'Hoà điền', 'Ngọc bích', 'Trầm hương', 'Hoàng long'];
function slug(s) { return boDau(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function ngocCua(x) {   // dòng ngọc của món — chỉ xét TÊN món (mô tả có tên charm đi kèm, dễ nhận nhầm)
  var t = boDau(x.ten), r = NGOC_TIM.filter(function (n) { return t.indexOf(boDau(n)) >= 0; });
  if (x.tram && r.indexOf('Trầm hương') < 0) r.push('Trầm hương');
  return r;
}
function dungMenu() {
  var m = $('#menu'); if (!m) return;
  var v = $('.hero') ? '' : 'index.html';   // ở trang khác thì phải quay về trang chủ
  var tt = trangThaiMo();
  var mui = '<svg class="mui-mega" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 9.5l6 6 6-6"/></svg>';
  var ten = function (x) { return '<span>' + x + '</span>'; };
  var lk = function (ds) { return ds.map(function (x) { return '<li><a href="' + x[1] + '"' + (x[2] ? ' target="_blank" rel="noopener"' : '') + '>' + e(x[0]) + '</a></li>'; }).join(''); };

  var megaSp = '<div class="mega" id="megaSp">' +
    '<div class="mega-trong">' +
      '<div class="mega-cot"><h3>Theo loại</h3><ul class="mega-ds" id="megaLoai"><li class="mega-cho">Đang tải…</li></ul></div>' +
      '<div class="mega-cot"><h3>Theo dòng ngọc</h3><ul class="mega-ds" id="megaNgoc"></ul></div>' +
      '<div class="mega-cot"><h3>Theo ngân sách</h3><ul class="mega-ds" id="megaGia">' +
        lk([['Dưới 3 triệu', 'qua-tang.html#duoi-3'], ['3 – 7 triệu', 'qua-tang.html#3-7'], ['7 – 12 triệu', 'qua-tang.html#7-12'], ['Trên 12 triệu', 'qua-tang.html#tren-12']]) +
        '<li><a class="mega-qua" href="qua-tang.html">Gợi ý quà tặng →</a></li></ul></div>' +
      '<div class="mega-cot"><h3>Mới về</h3><div class="mega-mon" id="megaMoi"></div></div>' +
      '<a class="mega-the" id="megaThe" href="' + v + '#noi-bat"><span class="h"></span>' +
        '<span class="nho">Tuyển chọn</span><b>Món nổi bật tuần này</b>' +
        '<span class="di">Xem ngay<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' +
    '</div>' +
    '<div class="mega-chan"><div class="mega-chan-trong">' +
      '<a href="cua-hang.html">Tất cả sản phẩm</a><a href="cua-hang.html?sx=moi">Mới về</a><a href="chon-size.html">Hướng dẫn chọn size</a>' +
      '<button type="button" data-mo-tim>Tìm theo tên hoặc mã</button>' +
      '<span class="ghi">Mỗi món chỉ có một — ai chốt trước giữ trước.</span>' +
    '</div></div></div>';

  var megaTk = '<div class="mega" id="megaTk">' +
    '<div class="mega-trong tk">' +
      '<div class="mega-cot gioi">' +
        '<h3>Xưởng phối chuỗi</h3>' +
        '<p>Chọn dây ngọc, lấy cỡ tay rồi gắn charm vàng — vòng xoay 3D ngay trên màn hình. Ưng mắt thì gửi cho cửa hàng làm thật.</p>' +
        '<a class="nut dac" href="thiet-ke.html">Mở xưởng phối chuỗi</a>' +
      '</div>' +
      '<ol class="mega-buoc">' +
        '<li><b>01</b><span>Chọn dây ngọc<small>Phỉ thuý, hoà điền, ngọc bích…</small></span></li>' +
        '<li><b>02</b><span>Cỡ tay &amp; số vòng<small>Đo một lần, nhớ cho lần sau</small></span></li>' +
        '<li><b>03</b><span>Gắn charm vàng<small id="megaSoCharm">Charm vàng 14K – 18K</small></span></li>' +
      '</ol>' +
      '<a class="mega-the" id="megaTheTk" href="thiet-ke.html"><span class="h"></span>' +
        '<span class="nho">Gợi ý</span><b>Xem vòng mẫu xoay 360°</b>' +
        '<span class="di">Thử ngay<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' +
    '</div></div>';

  var megaHt = '<div class="mega" id="megaHt">' +
    '<div class="mega-trong ht">' +
      '<div class="mega-cot"><h3>Chính sách</h3><ul class="mega-ds">' +
        lk([['Giao hàng', 'chinh-sach.html#giao-hang'], ['Thanh toán', 'chinh-sach.html#thanh-toan'], ['Đổi trả', 'chinh-sach.html#doi-tra'],
            ['Bảo hành', 'chinh-sach.html#bao-hanh'], ['Bảo mật thông tin', 'chinh-sach.html#bao-mat']]) + '</ul></div>' +
      '<div class="mega-cot"><h3>Hướng dẫn</h3><ul class="mega-ds">' +
        lk([['Chọn size vòng & nhẫn', 'chon-size.html'], ['Cẩm nang ngọc', 'cam-nang.html'], ['Giữ ngọc & trầm luôn đẹp', 'cam-nang.html#giu-ngoc'],
            ['Hỏi & đáp', v + '#hoi-dap'], ['Đơn đã đặt', 'tai-khoan.html']]) + '</ul></div>' +
      '<div class="mega-cot nhan">' +
        '<h3>Nhắn cho cửa hàng</h3>' +
        '<div class="mo-cua' + (tt.mo ? ' mo' : '') + '"><i></i>' + tt.chu + '</div>' +
        '<a class="sdt" href="tel:' + e(LIEN_HE.sdt) + '">' + e(LIEN_HE.sdt) + '</a>' +
        '<p>' + e(LIEN_HE.diaChi) + '</p>' +
        '<div class="hang"><a class="nut dac" href="' + linkZalo() + '" target="_blank" rel="noopener">Nhắn Zalo</a>' +
        '<a class="nut" href="' + linkFb() + '" target="_blank" rel="noopener">Messenger</a></div>' +
      '</div>' +
    '</div></div>';

  var megaVe = '<div class="mega" id="megaVe">' +
    '<div class="mega-trong ve">' +
      '<div class="mega-cot"><h3>Về chúng tôi</h3><ul class="mega-ds">' +
        lk([['Câu chuyện Ngọc Trầm', 've-ngoc-tram.html'], ['Cách chọn từng món', 've-ngoc-tram.html'], ['Cảm nhận khách hàng', v + '#cam-nhan'], ['Liên hệ & cửa hàng', 'lien-he.html']]) + '</ul></div>' +
      '<div class="mega-cot"><h3>Theo dõi</h3><ul class="mega-ds">' +
        lk([['Facebook', (LIEN_HE.fanpage[0] || {}).link, 1], ['Instagram', LIEN_HE.instagram, 1], ['TikTok', LIEN_HE.tiktok, 1]].filter(function (x) { return x[1]; })) + '</ul></div>' +
      '<a class="mega-the" id="megaTheVe" href="ve-ngoc-tram.html"><span class="h"></span>' +
        '<span class="nho">Từ năm 2015</span><b>Mỗi viên ngọc mang một câu chuyện riêng</b>' +
        '<span class="di">Đọc câu chuyện<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' +
      '<a class="mega-the" id="megaTheLh" href="lien-he.html"><span class="h"></span>' +
        '<span class="nho">' + e(LIEN_HE.diaChi || 'Cửa hàng') + '</span><b>Ghé xem ngọc tận tay</b>' +
        '<span class="di">Bản đồ &amp; giờ mở cửa<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' +
    '</div></div>';

  m.innerHTML =
    '<div class="menu-nhanh">' +
      '<a href="gio-hang.html"><span class="h">' + IC_GIO + '<i id="menuSoGio" hidden></i></span>Giỏ hàng</a>' +
      '<button type="button" data-mo-yt><span class="h">' + IC_TIM + '<i id="menuSoYt" hidden></i></span>Yêu thích</button>' +
      '<a href="tai-khoan.html"><span class="h">' + IC_NGUOI + '</span>Tài khoản</a>' +
    '</div>' +
    '<ul class="menu-ds">' +
    '<li class="co-mega"><button type="button" class="menu-nut" aria-expanded="false" aria-controls="megaSp">' + ten('Sản phẩm') + mui + '</button>' + megaSp + '</li>' +
    '<li><a class="menu-nut" href="qua-tang.html">' + ten('Quà tặng') + '</a></li>' +
    '<li><a class="menu-nut" href="tram-huong.html">' + ten('Trầm đốt') + '</a></li>' +
    '<li class="co-mega"><button type="button" class="menu-nut" aria-expanded="false" aria-controls="megaTk">' + ten('Tự thiết kế') + mui + '</button>' + megaTk + '</li>' +
    '<li class="co-mega"><button type="button" class="menu-nut" aria-expanded="false" aria-controls="megaHt">' + ten('Hỗ trợ') + mui + '</button>' + megaHt + '</li>' +
    '<li class="co-mega"><button type="button" class="menu-nut" aria-expanded="false" aria-controls="megaVe">' + ten('Ngọc Trầm') + mui + '</button>' + megaVe + '</li>' +
    '</ul>';

  soTrongMenu('menuSoGio', GIO.so()); soTrongMenu('menuSoYt', YT.so());   // hàng nút nhanh vừa dựng xong

  /* phần chạy theo dữ liệu: số món từng loại, dòng ngọc, món mới về, ảnh thẻ */
  taiDuLieu.then(function () {
    var dem = {};
    ds.forEach(function (x) { dem[x.loai] = (dem[x.loai] || 0) + 1; });
    $('#megaLoai').innerHTML = THU_TU.filter(function (l) { return dem[l]; }).map(function (l) {
      return '<li><a href="cua-hang.html?loai=' + l + '">' + LOAI[l].ten + '<i>' + dem[l] + '</i></a></li>';
    }).join('');
    $('#megaNgoc').innerHTML = NGOC_TIM.map(function (t) {
      var n = ds.filter(function (x) { return x.tt !== 'Đã bán' && ngocCua(x).indexOf(t) >= 0; }).length;
      return n ? '<li><a href="cua-hang.html?ngoc=' + slug(t) + '">' + e(t) + '<i>' + n + '</i></a></li>' : '';
    }).join('');
    var moi = ds.slice().sort(function (a, b) { return (a.loai === 'charm') - (b.loai === 'charm') || ngaySo(b.ngay) - ngaySo(a.ngay); }).slice(0, 3);
    $('#megaMoi').innerHTML = moi.map(function (x) {
      return '<a class="mega-nho" href="' + linkSp(x) + '"><span class="h">' + hinh(x.anh[0], x.ten, 160) + '</span>' +
        '<span class="tt"><b>' + e(x.ten) + '</b><small>' + gia(x.gia) + '</small></span></a>';
    }).join('');
    var sang = conHang('')[0] || ds[0];
    if (sang) $('#megaThe').querySelector('.h').innerHTML = hinh(sang.anh[0], '', 500);
    var day = ds.filter(function (x) { return x.loai === 'tron' || x.loai === 'chuoi'; });
    var mau = day[Math.floor(Math.random() * day.length)];
    if (mau) $('#megaTheTk').querySelector('.h').innerHTML = hinh(mau.anh[0], '', 500);
    var ve = day.filter(function (x) { return x.anh[1]; });
    if (ve[1]) $('#megaTheVe').querySelector('.h').innerHTML = hinh(ve[1].anh[1], '', 500);
    if (ve[2]) $('#megaTheLh').querySelector('.h').innerHTML = hinh(ve[2].anh[1], '', 500);
    if (dem.charm) $('#megaSoCharm').textContent = dem.charm + ' charm vàng 14K – 18K';
  }).catch(function () {});
}

var megaMo = null, megaHen;
function moMega(li) {
  clearTimeout(megaHen);
  if (megaMo === li) return;
  var cu = megaMo, gap = dienThoai() && !GIAM && $('#menu').classList.contains('mo');
  var ds = [cu, li].filter(Boolean).map(function (x) {   // điện thoại: đo chiều cao trước khi đổi
    var m = x.querySelector('.mega'), h = m.getBoundingClientRect().height;
    if (m._a) m._a.cancel();
    return {m: m, tu: h};
  });
  var neo = gap && li ? li.querySelector('.menu-nut') : null, neoTren = neo ? neo.getBoundingClientRect().top : 0;
  /* #354 máy tính: đang mở một mục mà rê sang mục khác → bảng không đóng-mở lại, chỉ co giãn chiều cao, nội dung trượt ngang theo hướng rê */
  var doi = !dienThoai() && !GIAM && cu && li, mCu = doi && cu.querySelector('.mega'), hCu = doi ? mCu.offsetHeight : 0;
  if (doi) { mCu.classList.add('doi'); li.querySelector('.mega').classList.add('doi'); }
  if (cu) cu.classList.remove('mo'), cu.querySelector('.menu-nut').setAttribute('aria-expanded', 'false');
  megaMo = li;
  if (li) { li.classList.add('mo'); li.querySelector('.menu-nut').setAttribute('aria-expanded', 'true'); }
  dau.classList.toggle('mo-mega', !!li);
  muiMega(li, !cu);
  if (doi) {
    var m = li.querySelector('.mega'), hMoi = m.offsetHeight, ds_ = [].slice.call(li.parentNode.children), huong = ds_.indexOf(li) > ds_.indexOf(cu) ? 1 : -1;
    if (m._m) m._m.cancel();
    m.style.overflow = 'hidden';
    m._m = m.animate([{height: hCu + 'px'}, {height: hMoi + 'px'}], {duration: 520, easing: 'cubic-bezier(.22,1,.36,1)'});
    m._m.onfinish = m._m.oncancel = function () { m.style.overflow = ''; m._m = null; };
    [].forEach.call(m.children, function (c) {
      c.animate([{opacity: 0, transform: 'translateX(' + huong * 44 + 'px)'}, {opacity: 1, transform: 'none'}], {duration: 560, easing: 'cubic-bezier(.22,1,.36,1)'});
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { mCu.classList.remove('doi'); m.classList.remove('doi'); }); });
  }
  if (!gap) return;
  /* mục mở ra / gập lại trượt theo chiều cao, không bật tắt đột ngột */
  ds.forEach(function (o) {
    var den = o.m.getBoundingClientRect().height;
    if (Math.abs(den - o.tu) < 1) return;
    o.m._a = o.m.animate([{height: o.tu + 'px'}, {height: den + 'px'}], {duration: 520, easing: 'cubic-bezier(.22,1,.36,1)'});
    o.m._a.onfinish = o.m._a.oncancel = function () { o.m._a = null; };
  });
  /* mục đang mở nằm phía trên gập lại thì giữ nút vừa bấm đứng yên, không bị kéo tụt lên */
  if (neo) {
    var nav = $('#menu'), het = performance.now() + 560, tay = false;
    var thoi = function () { tay = true; };
    nav.addEventListener('touchstart', thoi, {once: true, passive: true});
    (function giu() {
      if (tay) return;
      var lech = neo.getBoundingClientRect().top - neoTren;
      if (Math.abs(lech) > .5) nav.scrollTop += lech;
      if (performance.now() < het) requestAnimationFrame(giu);
      else nav.removeEventListener('touchstart', thoi);
    })();
  }
}
function muiMega(li, nhay) {   // mũi nhọn nhỏ trên mép bảng, nằm đúng dưới mục đang mở
  var mu = document.getElementById('megaMui');
  if (!mu) { if (!li || !dau) return; mu = document.createElement('span'); mu.id = 'megaMui'; mu.className = 'mega-mui'; mu.setAttribute('aria-hidden', 'true'); dau.appendChild(mu); nhay = true; }
  if (!li || dienThoai()) { mu.classList.remove('hien'); return; }
  var r = li.querySelector('.menu-nut').getBoundingClientRect(), x = r.left + r.width / 2 - dau.getBoundingClientRect().left;
  if (nhay) mu.style.transition = 'none';
  mu.style.transform = 'translateX(' + x.toFixed(1) + 'px) rotate(45deg)';
  if (nhay) { void mu.offsetWidth; mu.style.transition = ''; }
  mu.classList.add('hien');
}
function dongMega(tre) {
  clearTimeout(megaHen);
  if (tre) megaHen = setTimeout(function () { moMega(null); }, 180);
  else moMega(null);
}
function dienThoai() { return innerWidth <= 900; }

/* ---------- đầu trang + menu ---------- */
var dau = $('#dau');
function capNhatDau() { dau.classList.toggle('dac', !$('.hero') || scrollY > innerHeight * 0.75); }
addEventListener('scroll', capNhatDau, {passive: true}); capNhatDau();
$('#moMenu').onclick = function () {
  var r = this.getBoundingClientRect(), mn = $('#menu');   // #045 tâm vòng loang = giữa nút ☰
  mn.style.setProperty('--mx', (r.left + r.width / 2).toFixed(1) + 'px'); mn.style.setProperty('--my', (r.top + r.height / 2).toFixed(1) + 'px');
  var mo = $('#menu').classList.toggle('mo'); this.classList.toggle('mo', mo); document.body.classList.toggle('khoa', mo);
  document.body.style.overflow = mo ? 'hidden' : '';
  if (!mo) moMega(null);
};
function dongMenuDt() {   // đóng màn hình menu trên điện thoại
  $('#menu').classList.remove('mo'); $('#moMenu').classList.remove('mo');
  document.body.classList.remove('khoa'); moMega(null); traCuon();
}
(function () {
  var nav = $('#menu'); if (!nav) return;
  nav.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-tim]');
    if (t) {   // dòng ngọc → mở hộp tìm với sẵn chữ
      ev.preventDefault(); dongMenuDt(); moTim();
      var o = $('#oTimDau'); o.value = t.dataset.tim; $('#timXoa').hidden = false; veTim(o.value);
      return;
    }
    if (ev.target.closest('[data-mo-tim]')) { ev.preventDefault(); dongMenuDt(); moTim(); return; }
    if (ev.target.closest('[data-mo-yt]')) { ev.preventDefault(); dongMenuDt(); moYt(); return; }
    var b = ev.target.closest('.menu-nut');
    if (b && b.tagName === 'BUTTON') {   // bấm tên mục: điện thoại gập/mở, máy tính đóng mở bảng
      ev.preventDefault();
      var li = b.parentNode;
      moMega(megaMo === li ? null : li);
      return;
    }
    if (ev.target.closest('a')) dongMenuDt();   // bấm một mục con → đóng menu
  });
  nav.addEventListener('mouseover', function (ev) {
    if (dienThoai()) return;
    var li = ev.target.closest('.co-mega');
    if (li) moMega(li);
    else if (ev.target.closest('.menu-ds')) dongMega(true);
  });
  nav.addEventListener('mouseleave', function () { if (!dienThoai()) dongMega(true); });
  nav.addEventListener('focusin', function (ev) {
    if (dienThoai()) return;
    var li = ev.target.closest('.co-mega');
    if (li) moMega(li); else moMega(null);
  });
  addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && megaMo) moMega(null); });
  addEventListener('resize', function () { moMega(null); });
})();

/* ---------- hiện ra khi cuộn tới ---------- */
var io = new IntersectionObserver(function (es) {
  es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('hien'); io.unobserve(x.target); } });
}, {threshold: .15, rootMargin: '0px 0px -6% 0px'});
function theoDoi(goc) {
  (goc || document).querySelectorAll('[data-hien]:not(.hien),[data-mo-anh]:not(.hien),.tieu-de:not(.hien)').forEach(function (x) { io.observe(x); });
  veNutThem(); veNutYt();   // thẻ mới dựng xong thì nút giỏ / tim hiện đúng trạng thái
}
theoDoi();
// tiêu đề hero hiện ngay
requestAnimationFrame(function () { setTimeout(function () { $$('.hero .tieu-de,.hero [data-hien]').forEach(function (x) { x.classList.add('hien'); }); }, 150); });

/* ---------- dữ liệu ---------- */
/* Tải JSON nhanh: trang khai báo <link rel="preload" href="x.json?v=PHIÊN"> trong <head> → tải song song ngay từ đầu.
   Máy khách đã có đúng phiên này (lưu lần trước) → dùng luôn, khỏi chờ mạng. Phiên do xuat_du_lieu.py ghi khi xuất. */
function taiJson(ten) {
  var l = document.querySelector('link[rel="preload"][href^="' + ten + '"]'), url = l ? l.getAttribute('href') : ten, v = (url.split('v=')[1] || '');
  try { var c = JSON.parse(localStorage.getItem('dl:' + ten) || 'null'); if (c && v && c.v === v) return Promise.resolve(c.d); } catch (er) {}
  return fetch(url, v ? {} : {cache: 'no-cache'}).then(function (r) { return r.json(); }).then(function (d) {
    try { localStorage.setItem('dl:' + ten, JSON.stringify({v: v, d: d})); } catch (er) {}
    return d;
  });
}
var taiDuLieu = taiJson('data/san-pham.json').then(function (d) {
  var an = ((CH.trangChu || {}).an || []).map(String);
  ds = d.filter(function (x) { return x.anh && x.anh.length && an.indexOf(String(x.ma)) < 0 && an.indexOf(String(x.id || '')) < 0; }); return ds;
});
function linkSp(x) { return x.td ? 'tram-huong.html#' + x.sp : 'san-pham.html?ma=' + encodeURIComponent(khoa(x)); }
dungChanTrang();

function conHang(loai) {
  return ds.filter(function (x) { return (!loai || x.loai === loai) && x.tt !== 'Đã bán'; }).sort(function (a, b) { return b.gia - a.gia; });
}

/* ---------- biểu tượng nhỏ trên thẻ sản phẩm & giỏ ---------- */
var _sv = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
var IC_GIO = _sv('<path d="M5.6 8h12.8l-1 11.1a1.9 1.9 0 0 1-1.9 1.7H8.5a1.9 1.9 0 0 1-1.9-1.7z"/><path d="M9.2 10.4V7.3a2.8 2.8 0 0 1 5.6 0v3.1"/>');
var IC_TIM = _sv('<path d="M12 20.3s-7.3-4.5-7.3-9.6A3.9 3.9 0 0 1 12 8.1a3.9 3.9 0 0 1 7.3 2.6c0 5.1-7.3 9.6-7.3 9.6z"/>');
var IC_MAT = _sv('<path d="M2.6 12S6.2 6.6 12 6.6 21.4 12 21.4 12 17.8 17.4 12 17.4 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.7"/>');
var IC_KINH = _sv('<circle cx="10.8" cy="10.8" r="6.3"/><path d="M15.4 15.4L21 21"/>');
var IC_NGUOI = _sv('<circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c1-3.8 4-5.8 7.5-5.8s6.5 2 7.5 5.8"/>');

/* ---------- hàng nút tròn trên đầu trang (tìm · yêu thích · giỏ · tài khoản) ---------- */
function oNut() {
  var o = document.getElementById('dauNut');
  if (!o) {
    var phai = $('.dau .phai'); if (!phai) return null;
    o = document.createElement('div'); o.className = 'dau-nut'; o.id = 'dauNut';
    phai.insertBefore(o, phai.querySelector('.mo-menu'));
  }
  return o;
}

/* ---------- giỏ hàng ----------
   Chỉ lưu MÃ món ở máy khách (localStorage 'gio'); tên, giá, trạng thái luôn lấy mới từ data/san-pham.json
   để khách không bao giờ đặt theo giá cũ hoặc đặt món đã bán. Mỗi món chỉ có một nên không có số lượng. */
var GIO = {
  ds: function () { try { return (JSON.parse(localStorage.getItem('gio') || '[]') || []).map(String); } catch (er) { return []; } },
  luu: function (d) { try { localStorage.setItem('gio', JSON.stringify(d.slice(0, 30))); } catch (er) {} veNutGio(); veNutThem(); },
  co: function (k) { return GIO.ds().indexOf(String(k)) >= 0; },
  so: function () { return GIO.ds().length; },
  them: function (k) { var d = GIO.ds(); if (d.indexOf(String(k)) < 0) { d.unshift(String(k)); GIO.luu(d); } },
  bo: function (k) { GIO.datSl(k, 0); GIO.luu(GIO.ds().filter(function (x) { return x !== String(k); })); },
  xoaHet: function () { try { localStorage.removeItem('gio-sl'); } catch (er) {} GIO.luu([]); },
  /* số lượng — chỉ trầm đốt (mã 'td-…') mua nhiều; món ngọc luôn là 1 */
  _sl: function () { try { return JSON.parse(localStorage.getItem('gio-sl') || '{}') || {}; } catch (er) { return {}; } },
  sl: function (k) { return Math.max(1, Math.min(99, +GIO._sl()[k] || 1)); },
  datSl: function (k, n) {
    var m = GIO._sl(); n = Math.max(0, Math.min(99, Math.round(+n || 0)));
    if (n > 0) m[k] = n; else delete m[k];
    try { localStorage.setItem('gio-sl', JSON.stringify(m)); } catch (er) {}
  },
  themSl: function (k, n) {   // thêm trầm đốt: đã có trong giỏ thì cộng dồn số lượng
    var co = GIO.co(k); GIO.datSl(k, (co ? GIO.sl(k) : 0) + (n || 1)); if (!co) GIO.them(k); else { veNutGio(); veNutThem(); }
  }
};

/* ---------- TRẦM ĐỐT nhà làm (data/tram-dot.json): dòng (loai) → sản phẩm (sp) → quy cách. Mỗi quy cách có giá là một "món" giỏ mã td-<sp.id>-<quyCach.id> ---------- */
var TD = {loai: [], mon: {}};
var taiTramDot = taiJson('data/tram-dot.json').then(function (d) {
  TD.loai = (d && d.loai) || [];
  TD.loai.forEach(function (l) {
    (l.sp || []).forEach(function (s) {
      if (!s || !s.id) return;
      (s.quyCach || []).forEach(function (q) {
        if (!q || !(+q.gia > 0)) return;
        var k = 'td-' + s.id + '-' + q.id;
        TD.mon[k] = {id: k, ma: k, td: true, sp: 'sp-' + s.id, ten: s.ten + ' · ' + q.ten, loai: 'tramdot', tt: 'Còn hàng',
                     don: +q.gia, gia: +q.gia, anh: [s.anh || ('img/tram/' + (l.ve || l.id) + '.svg')]};
      });
    });
  });
  return TD;
}).catch(function () { return TD; });
function monTd(k) {   // món trầm trong giỏ kèm số lượng: gia = đơn giá × số lượng
  var x = TD.mon[k]; if (!x) return null;
  var n = GIO.sl(k); return Object.assign({}, x, {sl: n, gia: x.don * n});
}
var slTruoc = {};
function dongSl(k, n) {   // bộ chọn số lượng trong giỏ (trầm đốt) · #018 số đổi so với lần vẽ trước thì lăn lên/xuống
  var cu = slTruoc[k]; slTruoc[k] = n;
  var so = cu != null && cu !== n ? '<b class="lan-so ' + (n > cu ? 'so-len' : 'so-xuong') + '" data-cu="' + cu + '"><span>' + n + '</span></b>' : '<b>' + n + '</b>';
  return '<div class="sl-chon" role="group" aria-label="Số lượng"><button type="button" data-sl="-1" data-k="' + e(k) + '" aria-label="Bớt"' + (n <= 1 ? ' disabled' : '') + '>−</button>' +
    so + '<button type="button" data-sl="1" data-k="' + e(k) + '" aria-label="Thêm"' + (n >= 99 ? ' disabled' : '') + '>+</button></div>';
}
function veNutGio() {
  var a = $('#nutGio'), n = GIO.so();
  if (!a) {
    var o = oNut(); if (!o) return;
    a = document.createElement('a'); a.id = 'nutGio'; a.className = 'nut-dau nut-gio'; a.href = 'gio-hang.html';
    a.onclick = function (ev) { if (!/gio-hang/.test(location.pathname)) { ev.preventDefault(); moGio(); } };
    o.appendChild(a);
  }
  soTrongMenu('menuSoGio', n);
  a.setAttribute('aria-label', n ? 'Giỏ hàng · ' + n + ' món' : 'Giỏ hàng'); a.title = a.getAttribute('aria-label');
  a.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M5.6 8h12.8l-1 11.1a1.9 1.9 0 0 1-1.9 1.7H8.5a1.9 1.9 0 0 1-1.9-1.7z"/><path d="M9.2 10.4V7.3a2.8 2.8 0 0 1 5.6 0v3.1"/></svg>' +
    (n ? '<i>' + n + '</i>' : '');
  a.classList.toggle('co', !!n);
}
function veNutThem() {   // cập nhật mọi nút "Thêm vào giỏ" đang hiện
  $$('[data-gio]').forEach(function (b) {
    var co = GIO.co(b.dataset.gio);
    b.classList.toggle('da', co);
    if (b.classList.contains('tron')) { b.setAttribute('aria-label', co ? 'Đã có trong giỏ' : 'Thêm vào giỏ'); b.title = b.getAttribute('aria-label'); return; }
    if (b.classList.contains('pc-them')) { b.textContent = co ? '✓ Trong giỏ' : '+ Thêm'; return; }
    b.textContent = co ? '✓ Đã trong giỏ · Xem giỏ' : 'Thêm vào giỏ';
  });
}

/* ---------- YÊU THÍCH ----------
   Lưu mã món ở máy khách (localStorage 'yeuThich') nên khách chưa đăng nhập vẫn để dành được.
   Đăng nhập rồi thì khach.js gộp hai bên, từ đó mỗi lần bấm tim ghi luôn lên Firestore. */
var YT = {
  ds: function () { try { return (JSON.parse(localStorage.getItem('yeuThich') || '[]') || []).map(String); } catch (er) { return []; } },
  dat: function (d) { try { localStorage.setItem('yeuThich', JSON.stringify(d.slice(0, 200))); } catch (er) {} veNutYtDau(); veNutYt(); },
  co: function (ma) { return YT.ds().indexOf(String(ma)) >= 0; },
  so: function () { return YT.ds().length; },
  doi: function (ma) {   // trả về true nếu vừa thêm vào
    var d = YT.ds(), i = d.indexOf(String(ma)), them = i < 0;
    if (them) d.unshift(String(ma)); else d.splice(i, 1);
    YT.dat(d); YT.len();
    return them;
  },
  len: function () {   // đẩy lên tài khoản (nếu đang đăng nhập)
    if (typeof KHACH === 'undefined' || !KHACH.bat || !KHACH.user || !KHACH.ho) return;
    KHACH.ghi({yeuThich: YT.ds()}).catch(function () {});
  }
};
function veNutYtDau() {
  var a = document.getElementById('nutYtDau'), n = YT.so();
  if (!a) {
    var o = oNut(); if (!o) return;
    a = document.createElement('button'); a.id = 'nutYtDau'; a.className = 'nut-dau nut-yt-dau'; a.type = 'button';
    a.onclick = function () { moYt(); };
    o.appendChild(a);
  }
  soTrongMenu('menuSoYt', n);
  a.setAttribute('aria-label', n ? 'Món yêu thích · ' + n + ' món' : 'Món yêu thích');
  a.title = a.getAttribute('aria-label');
  a.innerHTML = IC_TIM + (n ? '<i>' + n + '</i>' : '');
  a.classList.toggle('co', !!n);
  if (n > +a.dataset.n && window.noTim) noTim(a, true);
  a.dataset.n = n;
}
function soTrongMenu(id, n) {   // số món trên hàng nút nhanh trong menu điện thoại + chấm báo trên nút menu
  var o = document.getElementById(id);
  if (o) { o.textContent = n; o.hidden = !n; }
  var mn = document.getElementById('moMenu');
  if (mn) mn.classList.toggle('co-cham', (typeof GIO !== 'undefined' ? GIO.so() : 0) + (typeof YT !== 'undefined' ? YT.so() : 0) > 0);
}
function veNutTim() {
  if (document.getElementById('nutTimDau')) return;
  var o = oNut(); if (!o) return;
  var a = document.createElement('button'); a.id = 'nutTimDau'; a.className = 'nut-dau nut-tim-dau'; a.type = 'button';
  a.setAttribute('aria-label', 'Tìm sản phẩm'); a.title = 'Tìm sản phẩm';
  a.innerHTML = IC_KINH;
  a.onclick = function () { moTim(); };
  o.appendChild(a);
}
function veNutYt() {
  if (typeof YT === 'undefined') return;
  var d = YT.ds();
  $$('[data-yt]').forEach(function (b) { b.classList.toggle('da', d.indexOf(String(b.dataset.yt)) >= 0); });
}

document.addEventListener('click', function (ev) {
  var g = ev.target.closest('[data-gio]');
  if (g) {   // thêm vào giỏ → ảnh bay vào nút giỏ (#442) rồi giỏ sổ ra cho thấy
    ev.preventDefault();
    var moi = !GIO.co(g.dataset.gio), dangMo = nganGio && nganGio.classList.contains('mo');
    if (moi) GIO.them(g.dataset.gio);
    if (dangMo && nganKieu === 'yt') { baoTin('Đã thêm vào giỏ'); veNgan(); return; }
    var tg = moi && !dangMo ? bayVaoGio(g) : 0;
    if (tg) setTimeout(moGio, tg - 120); else moGio();
    return;
  }
  var t = ev.target.closest('[data-yt]');
  if (t) {
    ev.preventDefault();
    var them = YT.doi(t.dataset.yt);
    if (them) noTim(t);
    baoTin(them ? 'Đã lưu vào yêu thích' : 'Đã bỏ khỏi yêu thích');
    if (nganGio && nganGio.classList.contains('mo') && nganKieu === 'yt') veNgan();
    if (!them && t.closest('#luoiYt') && window.veHoSo) setTimeout(veHoSo, 150);   // trang tài khoản: bỏ tim thì món rời khỏi lưới
    return;
  }
  var x = ev.target.closest('[data-xem]');
  if (x) { ev.preventDefault(); moMon(x.dataset.xem); }
});
function moMon(k) { (window.moSp || function (m) { sangTrang('san-pham.html?ma=' + encodeURIComponent(m)); })(k); }
addEventListener('storage', function (ev) {   // mở nhiều thẻ cùng lúc
  if (ev.key === 'gio') { veNutGio(); veNutThem(); }
  if (ev.key === 'yeuThich') { veNutYtDau(); veNutYt(); }
});
veNutTim(); veNutYtDau(); veNutGio();
dungMenu();   // gọi sau cùng: cần taiDuLieu (đếm số món) và các biểu tượng IC_* ở trên

/* ---------- ngăn sổ ra từ phải: dùng chung cho giỏ hàng và món yêu thích ---------- */
var nganGio = null, nganKieu = 'gio';
function dungNgan() {
  if (nganGio) return nganGio;
  nganGio = document.createElement('div');
  nganGio.className = 'ngan-gio'; nganGio.id = 'nganGio';
  nganGio.setAttribute('role', 'dialog'); nganGio.setAttribute('aria-label', 'Giỏ hàng');
  nganGio.innerHTML = '<div class="nen" data-dong-gio></div><aside class="hop">' +
    '<header><h2 id="nganTieu">Giỏ hàng</h2><button class="dong" data-dong-gio aria-label="Đóng">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l14 14M19 5L5 19"/></svg></button></header>' +
    '<div class="than" id="nganThan"></div><footer id="nganChan"></footer></aside>';
  document.body.appendChild(nganGio);
  nganGio.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-dong-gio]')) return dongGio();
    var b = ev.target.closest('[data-bo-ngan]');
    if (b) { GIO.bo(b.dataset.boNgan); veNgan(); return; }
    var sl = ev.target.closest('[data-sl]');
    if (sl) { GIO.datSl(sl.dataset.k, Math.max(1, GIO.sl(sl.dataset.k) + +sl.dataset.sl)); veNgan(); return; }
    var y = ev.target.closest('[data-bo-yt]');
    if (y) { YT.doi(y.dataset.boYt); veNgan(); return; }
    if (ev.target.closest('#ytVaoGio')) {   // thêm hết món để dành vào giỏ
      taiDuLieu.then(function () {
        var m = {}; ds.forEach(function (x) { m[String(khoa(x))] = x; m[String(x.ma)] = x; });
        var d = GIO.ds(), so = 0;
        YT.ds().forEach(function (k) {
          var x = m[k]; if (!x || x.tt === 'Đã bán' || !x.gia) return;
          var kk = String(khoa(x)); if (d.indexOf(kk) < 0) { d.unshift(kk); so++; }
        });
        GIO.luu(d); baoTin(so ? 'Đã thêm ' + so + ' món vào giỏ' : 'Các món này đã có trong giỏ');
        moNgan('gio');
      });
    }
  });
  return nganGio;
}
function moNgan(kieu) {
  if (kieu === 'gio' && /gio-hang/.test(location.pathname)) { location.reload(); return; }
  dongTim(); dungNgan(); nganKieu = kieu; veNgan();
  requestAnimationFrame(function () { nganGio.classList.add('mo'); });
  document.body.style.overflow = 'hidden';
}
function moGio() { moNgan('gio'); }
function moYt() { moNgan('yt'); }
function dongGio() { if (nganGio) nganGio.classList.remove('mo'); traCuon(); }
function traCuon() {   // chỉ trả lại cuộn trang khi không còn lớp nào đang mở
  if (nganGio && nganGio.classList.contains('mo')) return;
  if (hopTim && hopTim.classList.contains('mo')) return;
  if ($('#menu') && $('#menu').classList.contains('mo')) return;
  if ($('.ct.mo')) return;
  document.body.style.overflow = '';
}
addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && nganGio && nganGio.classList.contains('mo')) dongGio(); });

function veNgan() {
  if (!nganGio) return;
  if (nganKieu === 'yt') return veNganYt();
  var than = $('#nganThan'), chan = $('#nganChan'), ma = GIO.ds();
  $('#nganTieu').textContent = 'Giỏ hàng';
  if (!ma.length) {
    than.innerHTML = '<div class="ngan-trong">' + HOP_TRONG + '<p>Giỏ đang trống.</p><p class="nhe">Bấm “Thêm vào giỏ” ở món bạn ưng, mọi món sẽ gom về đây.</p>' +
      '<a class="nut dac" href="cua-hang.html">Xem cửa hàng</a></div>';
    chan.innerHTML = ''; tongTruoc = 0; return;
  }
  Promise.all([taiDuLieu, taiTramDot]).then(function () {
    var m = {};
    ds.forEach(function (x) { m[String(khoa(x))] = x; m[String(x.ma)] = x; });
    var mon = ma.map(function (k) { var x = m[k] || monTd(k); return {k: k, x: x, mua: !!(x && x.tt !== 'Đã bán' && x.gia)}; });
    var mua = mon.filter(function (g) { return g.mua; });
    var tong = mua.reduce(function (s, g) { return s + g.x.gia; }, 0);
    than.innerHTML = mon.map(function (g) {
      if (!g.x) return '<div class="ngan-mon het"><div class="anh"></div><div class="tt"><h3>Món ' + e(g.k) + '</h3>' +
        '<p class="het">Vừa được bán hoặc tạm ẩn.</p></div><button class="bo" data-bo-ngan="' + e(g.k) + '">Bỏ</button></div>';
      return '<div class="ngan-mon' + (g.mua ? '' : ' het') + '"><a class="anh" href="' + linkSp(g.x) + '">' + hinh(g.x.anh[0], g.x.ten, 200) + '</a>' +
        '<div class="tt"><h3><a href="' + linkSp(g.x) + '">' + e(g.x.ten) + '</a></h3>' +
        (g.x.td ? '<div class="ma">Trầm nhà làm · ' + gia(g.x.don) + ' / món</div>' + dongSl(g.k, g.x.sl) : '<div class="ma">Mã ' + e(g.x.ma) + '</div>') +
        (g.mua ? '<div class="gia">' + gia(g.x.gia) + '</div>' : '<p class="het">' + (g.x.tt === 'Đã bán' ? 'Món này đã có chủ.' : 'Chưa có giá — nhắn Zalo nhé.') + '</p>') +
        '</div><button class="bo" data-bo-ngan="' + e(g.k) + '">Bỏ</button></div>';
    }).join('') + goiY(ma);
    chan.innerHTML = thanhShip(tong) + '<div class="dong-tong"><span>Tạm tính · ' + mua.length + ' món</span><b>' + gia(tong) + '</b></div>' +
      '<p class="nhe">Chưa tính phí gửi. Cửa hàng báo phí khi xác nhận đơn.</p>' +
      '<a class="nut dac" href="gio-hang.html">Đặt mua</a>' +
      '<button class="tiep" data-dong-gio>Tiếp tục xem</button>';
    var o = chan.querySelector('.dong-tong b');   // tổng tiền chạy số từ tổng lần trước tới tổng mới
    if (o && tongTruoc && tongTruoc !== tong && !GIAM) demTien(o, tongTruoc, tong);
    tongTruoc = tong;
  });
}
var tongTruoc = 0;
function demTien(o, tu, den) {
  var bd = performance.now();
  (function buoc(t) {
    var k = Math.min(1, (t - bd) / 650); k = 1 - Math.pow(1 - k, 3);
    o.textContent = gia(Math.round((tu + (den - tu) * k) / 1000) * 1000);
    if (k < 1) requestAnimationFrame(buoc); else o.textContent = gia(den);
  })(bd);
}
/* hình minh hoạ ngăn giỏ trống: hộp quà lơ lửng, vòng ngọc bay trên nắp, vài đốm vàng lấp lánh */
var HOP_TRONG = '<svg class="minh-hoa" viewBox="0 0 150 128" aria-hidden="true">' +
  '<ellipse class="bong" cx="75" cy="116" rx="36" ry="4.5"/>' +
  '<path class="lap l1" d="M27 44l1.8-4.6 1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8z"/>' +
  '<path class="lap l2" d="M120 30l1.4-3.6 1.4 3.6 3.6 1.4-3.6 1.4-1.4 3.6-1.4-3.6-3.6-1.4z"/>' +
  '<path class="lap l3" d="M116 78l1.2-3 1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2z"/>' +
  '<g class="hop-qua">' +
    '<g class="nhan-bay"><circle class="vong-ngoc" cx="75" cy="34" r="12"/><path class="vong-sang" d="M67.5 28.5a10 10 0 0 1 7-4"/></g>' +
    '<path class="net than-hop" d="M44 72h62v34a5 5 0 0 1-5 5H49a5 5 0 0 1-5-5z"/>' +
    '<path class="net dai" d="M75 72v39"/>' +
    '<g class="nap"><rect class="net than-hop" x="38" y="57" width="74" height="15" rx="3.5"/><path class="net dai" d="M75 57v15"/>' +
      '<path class="net dai" d="M75 57c-5-9-17-10-15-3 1.5 4.5 9 4 15 3zM75 57c5-9 17-10 15-3-1.5 4.5-9 4-15 3z"/></g>' +
  '</g></svg>';
function veNganYt() {
  var than = $('#nganThan'), chan = $('#nganChan'), ma = YT.ds();
  $('#nganTieu').textContent = 'Món yêu thích';
  if (!ma.length) {
    than.innerHTML = '<div class="ngan-trong"><p>Chưa để dành món nào.</p>' +
      '<p class="nhe">Bấm hình trái tim ở món bạn ưng, mọi món sẽ gom về đây để xem lại sau.</p>' +
      '<a class="nut dac" href="index.html#san-pham">Xem sản phẩm</a></div>';
    chan.innerHTML = ''; return;
  }
  taiDuLieu.then(function () {
    var m = {};
    ds.forEach(function (x) { m[String(khoa(x))] = x; m[String(x.ma)] = x; });
    var mon = ma.map(function (k) { var x = m[k]; return {k: k, x: x, mua: !!(x && x.tt !== 'Đã bán' && x.gia)}; });
    var mua = mon.filter(function (g) { return g.mua; });
    than.innerHTML = mon.map(function (g) {
      if (!g.x) return '<div class="ngan-mon het"><div class="anh"></div><div class="tt"><h3>Món ' + e(g.k) + '</h3>' +
        '<p class="het">Vừa được bán hoặc tạm ẩn.</p></div><button class="bo" data-bo-yt="' + e(g.k) + '">Bỏ</button></div>';
      return '<div class="ngan-mon' + (g.mua ? '' : ' het') + '"><a class="anh" href="' + linkSp(g.x) + '">' + hinh(g.x.anh[0], g.x.ten, 200) + '</a>' +
        '<div class="tt"><h3><a href="' + linkSp(g.x) + '">' + e(g.x.ten) + '</a></h3><div class="ma">Mã ' + e(g.x.ma) + '</div>' +
        (g.mua ? '<div class="gia">' + gia(g.x.gia) + '</div>' : '<p class="het">' + (g.x.tt === 'Đã bán' ? 'Món này đã có chủ.' : 'Chưa có giá — nhắn Zalo nhé.') + '</p>') +
        '</div><div class="viec-ngan">' +
        (g.mua ? '<button class="tron" data-gio="' + e(khoa(g.x)) + '" aria-label="Thêm vào giỏ">' + IC_GIO + '</button>' : '') +
        '<button class="bo" data-bo-yt="' + e(g.k) + '">Bỏ</button></div></div>';
    }).join('');
    chan.innerHTML = '<div class="dong-tong"><span>' + mon.length + ' món để dành</span>' +
        (mua.length ? '<b>' + gia(mua.reduce(function (s, g) { return s + g.x.gia; }, 0)) + '</b>' : '') + '</div>' +
      '<p class="nhe">' + (typeof KHACH !== 'undefined' && KHACH.bat && !KHACH.user
        ? 'Danh sách đang lưu ở máy này. <a href="tai-khoan.html">Đăng nhập</a> để nó theo bạn sang máy khác.'
        : 'Danh sách được lưu trong tài khoản của bạn.') + '</p>' +
      (mua.length ? '<button class="nut dac" id="ytVaoGio">Thêm ' + mua.length + ' món vào giỏ</button>' : '') +
      '<button class="tiep" data-dong-gio>Tiếp tục xem</button>';
    veNutThem();
  });
}

/* ---------- UPSALE ----------
   Miễn ship theo đúng chính sách: đặt online, chuyển khoản trước toàn bộ, đơn từ NGUONG_SHIP. */
var NGUONG_SHIP = +((CH.thanhToan || {}).mienShip) || 1500000;
function thanhShip(tong) {
  var du = tong >= NGUONG_SHIP, p = Math.min(100, Math.round(tong / NGUONG_SHIP * 100));
  return '<div class="thanh-ship' + (du ? ' du' : '') + '" style="--p:' + p + '%">' +
    '<p>' + (du ? '<b>Đơn đủ điều kiện miễn ship</b> khi chuyển khoản trước toàn bộ.'
                : 'Thêm <b>' + gia(NGUONG_SHIP - tong) + '</b> nữa để được <b>miễn ship</b> (chuyển khoản trước).') + '</p>' +
    '<span class="vach-ship"><i></i></span></div>';
}
function charmHop(x, n, bo) {   // charm hợp với chuỗi x: cùng dòng ngọc, cùng loại vàng; bỏ charm chuỗi đã gắn sẵn
  var ngoc = ngocCua(x).map(boDau).filter(function (t) { return t !== 'phi thuy'; }), vang = (/vàng\s*(\d\dK)/i.exec(x.ten) || [])[1];
  var daCo = (x.tp || []).map(function (t) { return boDau(t); });
  bo = bo || [];
  return conHang('charm').filter(function (c) {
    return c.gia && daCo.indexOf(boDau(c.ten)) < 0 && bo.indexOf(String(khoa(c))) < 0 && bo.indexOf(String(c.ma)) < 0;
  }).map(function (c) {
    var t = boDau(c.ten), d = 0;
    ngoc.forEach(function (g) { if (t.indexOf(g) >= 0) d += 3; });
    if (vang && new RegExp(vang, 'i').test(c.ten)) d += 1;
    return {c: c, d: d};
  }).sort(function (a, b) { return b.d - a.d || ngaySo(b.c.ngay) - ngaySo(a.c.ngay); }).slice(0, n).map(function (o) { return o.c; });
}
function dongGoiY(x, nhan) {
  return '<div class="ngan-mon nho"><a class="anh" href="' + linkSp(x) + '">' + hinh(x.anh[0], x.ten, 200) + '</a>' +
    '<div class="tt">' + (nhan ? '<small class="nhan-goi">' + nhan + '</small>' : '') + '<h3><a href="' + linkSp(x) + '">' + e(x.ten) + '</a></h3><div class="gia">' + gia(x.gia) + '</div></div>' +
    '<button class="tron" data-gio="' + e(khoa(x)) + '" aria-label="Thêm vào giỏ">' + IC_GIO + '</button></div>';
}
/* gợi ý trong giỏ: thiếu tiền miễn ship → món vừa đủ bù; có chuỗi → charm hợp chuỗi; còn lại → món ngẫu nhiên */
function goiY(dangCo) {
  var trong = function (x) { return dangCo.indexOf(String(khoa(x))) >= 0 || dangCo.indexOf(String(x.ma)) >= 0; };
  var gio = ds.filter(trong).filter(function (x) { return x.tt !== 'Đã bán' && x.gia; });
  var tong = gio.reduce(function (s, x) { return s + x.gia; }, 0), thieu = NGUONG_SHIP - tong;
  var con = conHang('').filter(function (x) { return !trong(x) && x.gia; });
  if (!con.length) return '';
  var chuoi = gio.filter(function (x) { return x.loai === 'chuoi' || x.loai === 'tron'; })[0];
  if (chuoi) {
    var ch = charmHop(chuoi, 2, dangCo);
    if (ch.length) return '<div class="ngan-goi"><h3>Phối thêm charm cho chuỗi</h3>' + ch.map(function (c) {
      return dongGoiY(c, c.gia >= thieu && thieu > 0 ? 'Thêm món này là đủ miễn ship' : '');
    }).join('') + '</div>';
  }
  if (thieu > 0 && tong > 0) {
    var bu = con.filter(function (x) { return x.gia >= thieu; }).sort(function (a, b) { return a.gia - b.gia; }).slice(0, 2);
    if (bu.length) return '<div class="ngan-goi"><h3>Thêm một món là được miễn ship</h3>' + bu.map(function (x) { return dongGoiY(x); }).join('') + '</div>';
  }
  var i = Math.floor(Math.random() * Math.max(1, con.length - 2));
  return '<div class="ngan-goi"><h3>Có thể bạn cũng thích</h3>' + con.slice(i, i + 2).map(function (x) { return dongGoiY(x); }).join('') + '</div>';
}

/* =========================================================
   TÌM KIẾM (nút kính lúp trên đầu trang · mọi trang)
   Tìm trong tên, mã, mô tả và loại món của data/san-pham.json.
   ========================================================= */
var hopTim = null, timLoai = '';
function dungTim() {
  if (hopTim) return hopTim;
  hopTim = document.createElement('div');
  hopTim.className = 'hop-tim'; hopTim.id = 'hopTim';
  hopTim.setAttribute('role', 'dialog'); hopTim.setAttribute('aria-label', 'Tìm sản phẩm');
  hopTim.innerHTML = '<div class="nen" data-dong-tim></div><div class="hop">' +
    '<div class="o-tim">' + IC_KINH +
      '<input id="oTimDau" type="search" placeholder="Tìm chuỗi, charm, nhẫn… hoặc mã món" autocomplete="off" spellcheck="false" aria-label="Tìm sản phẩm">' +
      '<button type="button" class="xoa" id="timXoa" aria-label="Xoá chữ" hidden>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button type="button" class="dong-tim" data-dong-tim>Đóng</button>' +
    '</div><div class="kq-tim" id="kqTim"></div></div>';
  document.body.appendChild(hopTim);
  var o = $('#oTimDau'), hen;
  o.addEventListener('input', function () {
    $('#timXoa').hidden = !o.value;
    clearTimeout(hen); var v = o.value; hen = setTimeout(function () { veTim(v); }, 140);
  });
  o.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); diTim(ev.key === 'ArrowDown' ? 1 : -1); return; }
    if (ev.key === 'Enter') {
      var a = hopTim.querySelector('.tim-mon.chon') || hopTim.querySelector('.tim-mon');
      if (a) { ev.preventDefault(); nhoTim(o.value); a.click(); }
    }
  });
  hopTim.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-dong-tim]')) return dongTim();
    var x = ev.target.closest('#timXoa');
    if (x) { o.value = ''; x.hidden = true; o.focus(); veTim(''); return; }
    var l = ev.target.closest('[data-loai-tim]');
    if (l) { timLoai = l.dataset.loaiTim; veTim(o.value); o.focus(); return; }
    var c = ev.target.closest('[data-tu]');
    if (c) { o.value = c.dataset.tu; $('#timXoa').hidden = false; veTim(c.dataset.tu); o.focus(); return; }
    if (ev.target.closest('.tim-mon')) nhoTim(o.value);
  });
  return hopTim;
}
function moTim() {
  dongGio(); dungTim();
  hopTim.classList.add('mo'); document.body.style.overflow = 'hidden';
  var o = $('#oTimDau');
  veTim(o.value);
  setTimeout(function () { o.focus(); o.select(); }, 80);
}
function dongTim() { if (hopTim) hopTim.classList.remove('mo'); traCuon(); }

/* chữ vừa tìm, lưu ở máy khách */
function ganTim() { try { return (JSON.parse(localStorage.getItem('tim-gan') || '[]') || []).slice(0, 6); } catch (er) { return []; } }
function nhoTim(v) {
  v = String(v || '').trim(); if (v.length < 2) return;
  var d = ganTim().filter(function (x) { return boDau(x) !== boDau(v); });
  d.unshift(v);
  try { localStorage.setItem('tim-gan', JSON.stringify(d.slice(0, 6))); } catch (er) {}
}

function theTim(x) {
  var ban = x.tt === 'Đã bán';
  return '<a class="tim-mon' + (ban ? ' ban' : '') + '" href="' + linkSp(x) + '">' +
    '<span class="h">' + hinh(x.anh[0], x.ten, 160) + '</span>' +
    '<span class="tt"><b>' + e(x.ten) + '</b><small>' + e(nhanSp(x)) + ' · Mã ' + e(x.ma) + (ban ? ' · Đã bán' : '') + '</small></span>' +
    '<span class="g">' + gia(x.gia) + '</span></a>';
}
function chipTim() {
  var dem = {};
  ds.forEach(function (x) { dem[x.loai] = (dem[x.loai] || 0) + 1; });
  return '<div class="chip-tim"><button type="button" data-loai-tim=""' + (timLoai ? '' : ' class="on"') + '>Tất cả</button>' +
    THU_TU.filter(function (l) { return dem[l]; }).map(function (l) {
      return '<button type="button" data-loai-tim="' + l + '"' + (timLoai === l ? ' class="on"' : '') + '>' + LOAI[l].ngan + '<i>' + dem[l] + '</i></button>';
    }).join('') + '</div>';
}
function goiYTim() {
  var gan = ganTim();
  var moi = ds.slice().sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay); }).slice(0, 4);
  return (gan.length ? '<div class="nhom-tim"><h3>Bạn vừa tìm</h3><div class="chu-tim">' +
      gan.map(function (t) { return '<button type="button" data-tu="' + e(t) + '">' + e(t) + '</button>'; }).join('') + '</div></div>' : '') +
    '<div class="nhom-tim"><h3>Mới về</h3>' + moi.map(theTim).join('') + '</div>' +
    '<a class="tim-them" href="thiet-ke.html">Hoặc tự thiết kế chuỗi của riêng bạn' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
}
function veTim(v) {
  var o = $('#kqTim'); if (!o) return;
  var q = boDau(String(v || '').trim());
  if (!ds.length) o.innerHTML = '<p class="dang-tai">Đang tải danh sách món…</p>';
  taiDuLieu.then(function () {
    if (!q && !timLoai) { o.innerHTML = chipTim() + goiYTim(); return; }
    var tus = q ? q.split(/\s+/) : [];
    var r = ds.map(function (x) {
      if (timLoai && x.loai !== timLoai) return null;
      var kho = boDau(x.ten + ' ' + x.ma + ' ' + (x.mo_ta || '') + ' ' + LOAI[x.loai].ten);
      for (var i = 0; i < tus.length; i++) if (kho.indexOf(tus[i]) < 0) return null;
      var d = 0, ma = boDau(x.ma);
      if (q) {
        if (ma === q) d -= 1000; else if (ma.indexOf(q) === 0) d -= 600;
        if (boDau(x.ten).indexOf(q) === 0) d -= 300;
        else if (boDau(x.ten).indexOf(q) > 0) d -= 100;
      }
      if (x.tt === 'Đã bán') d += 500;
      return {x: x, d: d - ngaySo(x.ngay) / 1e11};
    }).filter(Boolean).sort(function (a, b) { return a.d - b.d; });
    if (!r.length) {
      o.innerHTML = chipTim() + '<div class="tim-trong"><p>Không có món nào khớp' + (q ? ' “' + e(String(v).trim()) + '”' : '') + '.</p>' +
        '<p class="nhe">Bạn thử tên ngọc (phỉ thuý, hoà điền, lam băng…), loại món, hay nhắn Zalo để cửa hàng tìm giúp.</p>' +
        '<a class="nut dac" href="' + linkZalo() + '" target="_blank" rel="noopener">Nhắn Zalo tìm giúp</a></div>';
      return;
    }
    o.innerHTML = chipTim() + '<div class="so-tim">' + r.length + ' món' + (q ? ' khớp “' + e(String(v).trim()) + '”' : '') + '</div>' +
      r.slice(0, 14).map(function (g) { return theTim(g.x); }).join('') +
      (r.length > 14 ? '<a class="tim-them" href="index.html#san-pham">Xem tất cả trong trang sản phẩm' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' : '');
  });
}
function diTim(b) {   // mũi tên lên / xuống chạy trong danh sách kết quả
  var ds_ = [].slice.call(hopTim.querySelectorAll('.tim-mon')); if (!ds_.length) return;
  var i = ds_.indexOf(hopTim.querySelector('.tim-mon.chon'));
  i = i < 0 ? (b > 0 ? 0 : ds_.length - 1) : (i + b + ds_.length) % ds_.length;
  ds_.forEach(function (a) { a.classList.remove('chon'); });
  ds_[i].classList.add('chon');
  ds_[i].scrollIntoView({block: 'nearest'});
}
addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape' && hopTim && hopTim.classList.contains('mo')) return dongTim();
  var o = ev.target, trongO = o && (/^(INPUT|TEXTAREA|SELECT)$/.test(o.tagName) || o.isContentEditable);
  if ((ev.key === 'k' || ev.key === 'K') && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); return moTim(); }
  if (ev.key === '/' && !trongO && !ev.metaKey && !ev.ctrlKey && !ev.altKey) { ev.preventDefault(); moTim(); }
});

/* ---------- thẻ sản phẩm ---------- */
function nhanSp(x) {
  var t = x.ten.toLowerCase(), v = /vàng (\d\dK)/i.exec(x.ten + ' ' + (x.mo_ta || ''));
  var ngoc = x.tram || /trầm/.test(t) ? 'Trầm hương' : /lam băng/.test(t) ? 'Lam băng' : /lục đế/.test(t) ? 'Lục đế' : /hoà điền|hòa điền/.test(t) ? 'Hoà điền' : /ngọc bích/.test(t) ? 'Ngọc bích' : /phỉ|phit/.test(t) ? 'Phỉ thuý' : LOAI[x.loai].ngan;
  return ngoc + (v ? ' · ' + v[1] : '');
}
function the(x, i) {
  var k = e(khoa(x)), ban = x.tt === 'Đã bán';
  return '<div class="sp" role="button" tabindex="0" data-hien style="--i:' + (i % 4) + '" data-k="' + k + '"><div class="h">' +
    '<span class="nhan">' + e(nhanSp(x)) + '</span>' + (x.tt && x.tt !== 'Còn hàng' ? '<span class="tt">' + e(x.tt) + '</span>' : '') +
    hinh(x.anh[0], x.ten, 700) + (x.anh[1] ? hinh(x.anh[1], x.ten, 700, ' class="sau"') : '') +
    '<div class="viec">' +
      (ban || !x.gia ? '' : '<button class="tron" data-gio="' + k + '" aria-label="Thêm vào giỏ">' + IC_GIO + '</button>') +
      '<button class="tron" data-yt="' + e(x.ma) + '" aria-label="Lưu vào yêu thích">' + IC_TIM + '</button>' +
      '<button class="tron" data-xem="' + k + '" aria-label="Xem nhanh">' + IC_MAT + '</button>' +
    '</div></div>' +
    '<h3>' + e(x.ten) + '</h3><div class="g">' + gia(x.gia) + '<span class="ma">#' + e(x.ma) + '</span></div></div>';
}
function cachTraNgan() {
  var t = CAU_HINH.thanhToan || {}, a = [];
  if (t.ck !== false) a.push('Chuyển khoản');
  if (t.cod !== false) a.push('COD');
  if (t.coc) a.push('Cọc trước');
  return a.join(' · ') || 'Nhắn Zalo để chốt';
}
/* #070 / #435 thông báo: trồi lên từ dưới, dấu tích tự vẽ, thanh mảnh chạy hết thì tự tắt; nhiều cái liên tiếp thì xếp chồng (tối đa 3).
   Máy tính: rê chuột vào thì xoè ra thành danh sách và dừng đếm. baoTin(chữ, 'loi') → biểu tượng chấm than (tự đoán khi chữ có "không được", "chưa … được"…) */
var tbXep = null;
function baoTin(s, kieu) {
  if (!tbXep) {
    tbXep = document.createElement('div'); tbXep.className = 'tb-xep';
    tbXep.setAttribute('role', 'status'); tbXep.setAttribute('aria-live', 'polite');
    document.body.appendChild(tbXep);
  }
  s = String(s == null ? '' : s);
  var loi = kieu === 'loi' || (kieu == null && /không được|chưa [^.,]{0,12}được|lỗi|thất bại|bị chặn|chặn chép/i.test(s));
  var t = document.createElement('div'); t.className = 'tb' + (loi ? ' loi' : '');
  t.style.setProperty('--tg', Math.min(5200, 2400 + s.length * 28) + 'ms');
  t.innerHTML = (loi ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" pathLength="1"/><path d="M12 7.5v5.5M12 16.4v.1" pathLength="1"/></svg>'
                     : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" pathLength="1"/><path d="M7.8 12.3l2.9 2.9 5.6-6" pathLength="1"/></svg>') +
    '<span>' + e(s) + '</span><i class="tb-tg" aria-hidden="true"></i>';
  var tat = function () {
    if (t.classList.contains('ra')) return;
    t.classList.add('ra'); xepTb();
    setTimeout(function () { t.remove(); }, 460);
  };
  t.querySelector('.tb-tg').addEventListener('animationend', tat);
  if (GIAM) setTimeout(tat, Math.min(5200, 2400 + s.length * 28));
  var tm = $$('.thanh-mua.hien, .lw-bb.hien').reduce(function (h, x) { return Math.max(h, x.offsetHeight); }, 0);   // đứng trên thanh mua dính đáy
  tbXep.style.setProperty('--nang-tb', tm + 'px');
  tbXep.appendChild(t);
  var con = [].filter.call(tbXep.children, function (x) { return !x.classList.contains('ra'); });
  if (con.length > 3) con.slice(0, con.length - 3).forEach(function (x) { x.querySelector('.tb-tg').dispatchEvent(new Event('animationend')); });
  xepTb();
}
function xepTb() {
  var con = [].filter.call(tbXep.children, function (x) { return !x.classList.contains('ra'); });
  con.forEach(function (x, i) { x.style.setProperty('--i', con.length - 1 - i); });
}

document.addEventListener('click', function (ev) {
  var c = ev.target.closest('[data-chep]'); if (!c) return;
  var chu = 'Chào Ngọc Trầm, mình muốn hỏi mã ' + c.dataset.chep;
  if (navigator.clipboard) navigator.clipboard.writeText(chu).catch(function () {});
  baoTin('Đã chép mã ' + c.dataset.chep + ' — dán vào tin nhắn nhé');
});

/* ---------- rời trang (#321): tờ giấy dâng từ dưới lên che trang, hiện hoa sen + tên trang đích, rồi mới sang trang.
   Trang mới mở ra với body::before cùng màu giấy + hoa sen tan dần → hai lớp nối nhau, không chớp.
   Bỏ qua: link mở tab mới, link # trong trang, link đã bị chặn (nút giỏ mở ngăn…), phím Ctrl/⌘. ---------- */
addEventListener('load', function () { setTimeout(function () { document.documentElement.classList.add('da-nap'); }, 320); });
var TEN_TRANG = {'index': 'Trang chủ', 'cua-hang': 'Cửa hàng', 'san-pham': 'Chi tiết món', 'gio-hang': 'Giỏ hàng', 'lien-he': 'Liên hệ & cửa hàng', 'tram-huong': 'Trầm đốt nhà làm',
  'qua-tang': 'Quà tặng', 'thiet-ke': 'Tự thiết kế chuỗi', 'chon-size': 'Chọn size', 'chinh-sach': 'Chính sách', 'cam-nang': 'Cẩm nang ngọc', 've-ngoc-tram': 'Về Ngọc Trầm', 'tai-khoan': 'Tài khoản', 'si': 'Bảng giá sỉ'};
var manChe = null;
function sangTrang(href, ten) {
  var u; try { u = new URL(href, location.href); } catch (er) { location.href = href; return; }
  if (GIAM) { location.href = u.href; return; }
  if (ten == null) {
    var tg = (/([\w-]+)\.html?$/.exec(u.pathname) || [])[1] || 'index', ma = u.searchParams.get('ma');
    var mon = tg === 'san-pham' && ma && ds.filter(function (x) { return String(khoa(x)) === ma || String(x.ma) === ma; })[0];
    ten = mon ? mon.ten : (TEN_TRANG[tg] || '');
  }
  if (!manChe) {
    manChe = document.createElement('div'); manChe.className = 'man-che'; manChe.setAttribute('aria-hidden', 'true');
    manChe.innerHTML = '<div class="rem"></div><div class="noi"><img src="img/hoa.png" alt=""><b></b></div>';
    document.body.appendChild(manChe); void manChe.offsetWidth;
  }
  manChe.querySelector('b').textContent = ten;
  manChe.classList.add('dang-che'); document.documentElement.classList.add('roi-trang');
  setTimeout(function () { location.href = u.href; }, 470);
  setTimeout(function () { manChe.classList.remove('dang-che'); document.documentElement.classList.remove('roi-trang'); }, 6000);   // lỡ trang không chuyển (tải file…) thì mở màn lại
}
(function () {
  if (GIAM) return;
  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest('a[href]');
    if (!a || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }
    if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html?$/.test(u.pathname)) return;
    ev.preventDefault();
    sangTrang(u.href);
  });
  addEventListener('pageshow', function (ev) {
    if (!ev.persisted) return;
    document.documentElement.classList.remove('roi-trang');
    if (manChe) manChe.classList.remove('dang-che');
  });
})();

/* ---------- hỏi đáp & khung mở rộng: <details> mở / đóng mượt mọi lần ----------
   <details> gốc giấu nội dung ngay khi bỏ [open] nên lúc đóng không có hiệu ứng, còn lần mở sau
   nội dung được vẽ thẳng ở trạng thái mở nên cũng không trượt → tự điều khiển cả hai chiều. */
(function () {
  if (GIAM) return;
  function huy(d, tl) {   // huỷ lượt đóng đang dở (bấm lại giữa chừng)
    clearTimeout(d._hen);
    if (d._nghe) { tl.removeEventListener('transitionend', d._nghe); d._nghe = null; }
  }
  document.addEventListener('click', function (ev) {
    var s = ev.target.closest('summary'); if (!s) return;
    var d = s.parentNode; if (!d || d.tagName !== 'DETAILS') return;
    var tl = d.querySelector(':scope > .tl'); if (!tl) return;
    ev.preventDefault();
    huy(d, tl);
    if (d.open && !d.classList.contains('dang-dong')) {          // đóng: co lại xong mới bỏ [open]
      d.classList.add('dang-dong');
      var xong = function () { huy(d, tl); d.open = false; d.classList.remove('dang-dong'); };
      d._nghe = function (e) { if (e.target === tl && e.propertyName === 'grid-template-rows') xong(); };
      tl.addEventListener('transitionend', d._nghe);
      d._hen = setTimeout(xong, 950);                               // lưới an toàn nếu transitionend không tới
    } else {                                                         // mở (hoặc bấm lại khi đang đóng dở)
      d.classList.remove('dang-dong');
      if (!d.open) {
        d.classList.add('dang-mo'); d.open = true;
        void tl.offsetHeight;                                        // vẽ một lần ở 0fr làm điểm xuất phát
        d.classList.remove('dang-mo');
      }
    }
  });
})();

/* ---------- cuộn mượt, chậm khi bấm link trong trang (menu, nút "Xem sản phẩm"…) ---------- */
(function () {
  var dang = 0;
  function eo(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }   // nhanh dần rồi chậm dần
  function viTri(el) {
    if (getComputedStyle(el).position === 'sticky') el = el.parentElement;   // mục dính: lấy theo khối chứa
    return el.getBoundingClientRect().top + scrollY - (($('#dau') || {}).offsetHeight || 68);   // trừ chiều cao đầu trang (màn hình to: đầu trang cao hơn)
  }
  window.cuonToi = function (el) {
    var tu = scrollY, den = Math.max(0, Math.min(viTri(el), document.documentElement.scrollHeight - innerHeight)), qd = den - tu;
    if (GIAM || Math.abs(qd) < 2) { scrollTo(0, den); return; }
    var tg = Math.min(2200, Math.max(1100, 900 + Math.abs(qd) * .22)), bd = performance.now(), so = ++dang;
    document.documentElement.style.scrollBehavior = 'auto';
    (function b(now) {
      if (so !== dang) return;
      var t = Math.min(1, (now - bd) / tg);
      scrollTo(0, tu + qd * eo(t));
      if (t < 1) requestAnimationFrame(b);
    })(bd);
  };
  addEventListener('wheel', function () { dang++; }, {passive: true});       // khách tự cuộn thì dừng hiệu ứng
  addEventListener('touchstart', function () { dang++; }, {passive: true});
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('a[href]'); if (!a || ev.defaultPrevented || ev.metaKey || ev.ctrlKey) return;
    var href = a.getAttribute('href'), m = /^(?:index\.html)?#([\w-]+)$/.exec(href);
    if (!m || (/^index\.html/.test(href) && !$('.hero'))) return;           // chỉ link tới mục trong cùng trang
    var id = m[1], loai = /^loai-(\w+)$/.exec(id);
    if (loai && window.chonLoai) { chonLoai(loai[1]); id = 'san-pham'; }
    var el = document.getElementById(id); if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    ev.preventDefault(); cuonToi(el);
    history.replaceState(null, '', '#' + id);
  });
})();

/* ---------- chế độ xem trước trong app: nhận lệnh cuộn tới khối đang sửa ---------- */
var XEM_TRUOC = /[?&]xemtruoc=1/.test(location.search);
if (XEM_TRUOC) {
  document.documentElement.classList.add('xem-truoc');
  addEventListener('message', function (ev) {
    if (ev.origin !== location.origin || !ev.data || !ev.data.den) return;
    var el = document.getElementById(ev.data.den); if (!el) return;
    $$('.dang-sua').forEach(function (x) { x.classList.remove('dang-sua'); });
    el.classList.add('dang-sua');
    if (ev.data.ngay) { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - (ev.data.den === 'dauTrang' ? 0 : 80))); }
    else cuonToi(el);
  });
  document.addEventListener('click', function (ev) { var a = ev.target.closest('a'); if (a) ev.preventDefault(); }, true);   // khung xem trước: không mở link
}

/* ---------- nút lên đầu trang: hiện khi đã cuộn quá 1 màn hình, vòng viền chạy theo phần trang đã đọc ---------- */
(function () {
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'len-dau'; b.setAttribute('aria-label', 'Lên đầu trang');
  b.innerHTML = '<svg class="vien" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22.5" pathLength="100"/></svg>' +
    '<svg class="mui" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
  document.body.appendChild(b);
  var vong = b.querySelector('circle'), hen = 0;
  function cap() {
    hen = 0;
    var cao = document.documentElement.scrollHeight - innerHeight, y = scrollY;
    b.classList.toggle('hien', y > innerHeight * 1.2);
    vong.style.strokeDashoffset = 100 - (cao > 0 ? Math.min(1, y / cao) : 0) * 100;
    var tm = document.querySelector('.thanh-mua.hien');   // trang sản phẩm (điện thoại): đứng trên thanh mua
    b.style.setProperty('--nang', tm && tm.offsetHeight ? tm.offsetHeight + 'px' : '0px');
  }
  addEventListener('scroll', function () { if (!hen) hen = requestAnimationFrame(cap); }, {passive: true});
  addEventListener('resize', cap);
  b.onclick = function () { cuonToi(document.body); };
  cap();
  /* thanh mua (trang sản phẩm) hiện / ẩn theo nút Mua chính chứ không theo lúc cuộn → theo dõi riêng để nút nhích lên kịp */
  function theoThanh() { var tm = document.querySelector('.thanh-mua'); if (tm) new MutationObserver(cap).observe(tm, {attributes: true, attributeFilter: ['class']}); return !!tm; }
  if (!theoThanh()) addEventListener('load', theoThanh, {once: true});
})();

/* =========================================================
   HIỆU ỨNG CHUNG TOÀN WEB (ý từ thư viện lucianlabs) — CSS ở cuối css/style.css
   Rê chuột chỉ chạy trên máy có chuột (CHUOT); máy bật "giảm chuyển động" (GIAM) thì tắt hoặc giảm.
   ========================================================= */
var CHUOT = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- #212 cuộn xuống: đầu trang trượt lên khuất · cuộn lên (dù chút xíu) là hiện lại ----------
   Không ẩn khi: menu lớn / menu điện thoại / ngăn giỏ / hộp tìm đang mở, đang ở gần đầu trang, hoặc đang bấm phím trong đầu trang.
   Lớp html.dau-an để trang khác đẩy thanh dính của mình lên (top:0) khi đầu trang khuất. */
var hienDau = function () {};
(function () {
  if (!dau) return;
  var y0 = scrollY, an = false, giu = 0, hen = 0;
  function khoa() {
    return megaMo || document.body.classList.contains('khoa') || Date.now() < giu ||
      (nganGio && nganGio.classList.contains('mo')) || (hopTim && hopTim.classList.contains('mo')) || dau.contains(document.activeElement) && document.activeElement !== document.body;
  }
  function dat(v) { if (v === an) return; an = v; dau.classList.toggle('an', v); document.documentElement.classList.toggle('dau-an', v); }
  function cap() {
    hen = 0;
    var y = scrollY, d = y - y0;
    if (y < 160 || khoa()) { dat(false); y0 = y; return; }
    if (d > 8) { dat(true); y0 = y; } else if (d < -6) { dat(false); y0 = y; }
  }
  addEventListener('scroll', function () { if (!hen) hen = requestAnimationFrame(cap); }, {passive: true});
  hienDau = function (ms) { giu = Date.now() + (ms || 1200); dat(false); };
  window.hienDau = hienDau;
  dau.addEventListener('focusin', function () { dat(false); });
  if (CHUOT) addEventListener('mousemove', function (ev) { if (an && ev.clientY < 16) hienDau(800); }, {passive: true});   // chuột chạm mép trên → hiện
})();

/* ---------- #205 chữ "Ngọc Trầm" ở logo đầu trang gợn nhẹ: chữ gần chuột nhô lên, chữ bên cạnh theo ít hơn, mỗi chữ tự lò xo về chỗ ---------- */
(function () {
  var b = document.querySelector('.dau .hieu b'); if (!b || !CHUOT || GIAM) return;
  var chu = b.textContent.normalize('NFC');
  b.parentNode.setAttribute('aria-label', chu.trim());
  b.textContent = '';
  var ch = Array.from(chu).map(function (c) {
    var s = document.createElement('span'); s.className = 'gon'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); b.appendChild(s);
    return {s: s, x: 0, y: 0, v: 0};
  });
  var mx = -1e4, my = -1e4, cy = 0, chay = false;
  function do_() { ch.forEach(function (o) { var r = o.s.getBoundingClientRect(); o.x = r.left + r.width / 2; cy = r.top + r.height / 2; }); }
  function ve() {
    var yen = true;
    ch.forEach(function (o) {
      var d = Math.hypot(o.x - mx, (cy - my) * 1.6), dich = d < 64 ? -3.4 * Math.pow(1 - d / 64, 2) : 0;
      o.v = (o.v + (dich - o.y) * .16) * .74; o.y += o.v;
      if (Math.abs(o.v) > .01 || Math.abs(dich - o.y) > .01) yen = false;
      o.s.style.transform = Math.abs(o.y) < .01 ? '' : 'translateY(' + o.y.toFixed(2) + 'px)';
    });
    if (yen && mx < -1e3) { chay = false; return; }
    requestAnimationFrame(ve);
  }
  dau.addEventListener('pointerenter', do_);
  dau.addEventListener('pointermove', function (ev) { mx = ev.clientX; my = ev.clientY; if (!chay) { chay = true; requestAnimationFrame(ve); } });
  dau.addEventListener('pointerleave', function () { mx = my = -1e4; });
  addEventListener('resize', do_);
})();

/* ---------- nút .nut: #009 chữ cuộn lên khi rê · #002 nút chính hút nhẹ về phía chuột · #006 vệt loang từ đúng chỗ bấm ----------
   Chữ được bọc <nt-lan><nt-chu> (textContent giữ nguyên). Nút [data-gio] hay [data-khong-lan] không bọc (chữ do JS khác đổi liên tục). */
(function () {
  if (!CHUOT || GIAM) return;
  function boc(goc) {
    (goc || document).querySelectorAll('.nut').forEach(function (n) {
      if (n.matches('[data-gio],[data-khong-lan]') || n.querySelector(':scope > nt-lan')) return;
      /* chỉ bọc khi nút có ĐÚNG MỘT phần chữ (chữ trần hoặc <span data-nd>), còn lại chỉ là biểu tượng — nút chữ lẫn số/thẻ khác thì để nguyên
         (bọc dở sẽ nuốt khoảng trắng). Dùng thẻ riêng nt-lan/nt-chu để CSS kiểu ".nut-x span" của trang khác không dính vào. */
      var chu = [].filter.call(n.childNodes, function (c) {
        return c.nodeType === 3 ? c.nodeValue.trim() : c.nodeType === 1 && !/^(svg|SVG|IMG|I)$/.test(c.tagName) && !c.classList.contains('loang');
      });
      if (chu.length !== 1) return;
      var c = chu[0], la = c.nodeType === 3, con = !la && c.tagName === 'SPAN' && c.hasAttribute('data-nd') && !c.children.length;
      if (la || con) {
        var o = document.createElement('nt-lan');
        if (la) { var i = document.createElement('nt-chu'); i.textContent = c.nodeValue.trim(); o.appendChild(i); n.replaceChild(o, c); }
        else { n.insertBefore(o, c); o.appendChild(c); }
      }
    });
  }
  boc();
  var hen = 0;
  new MutationObserver(function () { if (!hen) hen = requestAnimationFrame(function () { hen = 0; boc(); }); }).observe(document.body, {childList: true, subtree: true});

  var nam = null;   // nút đang bị "hút"
  function tha(n) { n.style.removeProperty('--hx'); n.style.removeProperty('--hy'); }
  document.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') return;
    var n = ev.target.closest && ev.target.closest('.nut.dac,.nut.sang');
    if (n && (n.offsetWidth > 360 || n.closest('.ngan-gio,.hop-tim'))) n = null;   // nút dài hết bề ngang thì thôi
    if (n !== nam) { if (nam) tha(nam); nam = n; }
    if (!nam) return;
    var r = nam.getBoundingClientRect();
    nam.style.setProperty('--hx', ((ev.clientX - r.left - r.width / 2) * .2).toFixed(1) + 'px');
    nam.style.setProperty('--hy', ((ev.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px');
  }, {passive: true});
  document.addEventListener('mouseout', function (ev) { if (!ev.relatedTarget && nam) { tha(nam); nam = null; } });
})();
document.addEventListener('pointerdown', function (ev) {   // #006 (cả điện thoại)
  if (GIAM || ev.button) return;
  var n = ev.target.closest && ev.target.closest('.nut'); if (!n || n.disabled) return;
  var r = n.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, k = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
  var s = document.createElement('span'); s.className = 'loang'; s.setAttribute('aria-hidden', 'true');
  s.style.cssText = 'left:' + (x - k) + 'px;top:' + (y - k) + 'px;width:' + 2 * k + 'px;height:' + 2 * k + 'px';
  n.appendChild(s);
  var a = s.animate([{transform: 'scale(0)', opacity: .26}, {transform: 'scale(1)', opacity: 0}], {duration: 700, easing: 'cubic-bezier(.2,.7,.3,1)'});
  a.onfinish = a.oncancel = function () { s.remove(); };
}, {passive: true});

/* ---------- #314 con trỏ tròn mềm: chạy theo chuột như lò xo, tới nút thì ôm theo hình nút, vào ô nhập thì ẩn. Con trỏ thật vẫn giữ. ---------- */
(function () {
  if (!CHUOT || GIAM) return;
  var c = document.createElement('div'); c.className = 'con-tro'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
  var OM = '.nut,.nut-dau,.len-dau,.mo-menu,.sp .viec .tron,.ngan-mon .tron,.mxh a,.tab button,.sl-chon button,.chip-tim button,.ngan-gio .dong,.cong-cu button,.tab-vong button,.chip-nhom button';
  var BAM = 'a,button,[role="button"],summary,label,select,.sp';
  var NHAP = 'input,textarea,select,iframe,[contenteditable=""],[contenteditable="true"]';
  var p = {x: 0, y: 0}, o = {x: 0, y: 0, w: 26, h: 26, r: 13}, om = null, omR = 0, chay = false, dau_ = true;
  document.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') { c.classList.remove('hien'); return; }
    p.x = ev.clientX; p.y = ev.clientY;
    if (dau_) { o.x = p.x; o.y = p.y; dau_ = false; }
    var t = ev.target.closest ? ev.target : document.body, nhap = t.closest(NHAP);
    var moi = nhap ? null : t.closest(OM);
    if (moi !== om) { om = moi; if (om) { var br = parseFloat(getComputedStyle(om).borderTopLeftRadius) || 6; omR = br; } }
    c.classList.toggle('hien', !nhap);
    c.classList.toggle('om', !!om);
    c.classList.toggle('bam', !om && !nhap && !!t.closest(BAM));
    if (!chay) { chay = true; requestAnimationFrame(ve); }
  }, {passive: true});
  document.addEventListener('mouseout', function (ev) { if (!ev.relatedTarget) { c.classList.remove('hien'); dau_ = true; } });
  document.addEventListener('pointerdown', function () { c.classList.add('nhan'); }, {passive: true});
  document.addEventListener('pointerup', function () { c.classList.remove('nhan'); }, {passive: true});
  function ve() {
    var tx = p.x, ty = p.y, tw, th, tr;
    if (om && om.isConnected) {
      var r = om.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      tw = r.width + 10; th = r.height + 10; tr = Math.min(omR + 5, th / 2);
      tx = cx + (p.x - cx) * .1; ty = cy + (p.y - cy) * .1;
    } else { tw = th = c.classList.contains('bam') ? 42 : 26; tr = tw / 2; }
    var k = .2;
    o.x += (tx - o.x) * k; o.y += (ty - o.y) * k; o.w += (tw - o.w) * k; o.h += (th - o.h) * k; o.r += (tr - o.r) * k;
    c.style.transform = 'translate3d(' + (o.x - o.w / 2).toFixed(1) + 'px,' + (o.y - o.h / 2).toFixed(1) + 'px,0)';
    c.style.width = o.w.toFixed(1) + 'px'; c.style.height = o.h.toFixed(1) + 'px'; c.style.borderRadius = o.r.toFixed(1) + 'px';
    if (Math.abs(tx - o.x) + Math.abs(ty - o.y) + Math.abs(tw - o.w) + Math.abs(th - o.h) > .3 || om) requestAnimationFrame(ve);
    else chay = false;
  }
})();

/* ---------- #236 chân trang lộ ra như kéo rèm: khi cuộn tới, nội dung chân trang trượt ra từ dưới mép trang trên, lớn dần + sáng dần.
   Tính theo quãng cuộn còn lại nên trang ngắn (chân trang đã hiện sẵn) vẫn về đúng chỗ ở cuối trang. ---------- */
(function () {
  var f = document.querySelector('footer.lh'); if (!f || GIAM) return;
  var boc = document.createElement('div'); boc.className = 'lh-rem';
  while (f.firstChild) boc.appendChild(f.firstChild);
  f.appendChild(boc);
  var toi = document.createElement('i'); toi.className = 'rem-toi'; toi.setAttribute('aria-hidden', 'true'); f.appendChild(toi);
  var thay = false, hen = 0;
  function cap() {
    hen = 0;
    var vh = innerHeight, r = f.getBoundingClientRect(), tren = r.top + scrollY, het = document.documentElement.scrollHeight - vh;
    var bd = tren - vh, kt = Math.min(bd + Math.min(vh * .8, r.height), het), qd = kt - bd;
    var p = qd < 90 ? 1 : Math.max(0, Math.min(1, (scrollY - bd) / qd));
    var S = Math.min(vh * (dienThoai() ? .12 : .24), 210);
    f.style.setProperty('--rem-y', (-(1 - p) * S).toFixed(1) + 'px');
    f.style.setProperty('--rem-s', (.965 + .035 * p).toFixed(4));
    f.style.setProperty('--rem-o', ((1 - p) * .9).toFixed(3));
  }
  new IntersectionObserver(function (es) { thay = es[0].isIntersecting; if (thay) cap(); }, {rootMargin: '15% 0px'}).observe(f);
  addEventListener('scroll', function () { if (thay && !hen) hen = requestAnimationFrame(cap); }, {passive: true});
  addEventListener('resize', cap); addEventListener('load', cap);
  cap();
})();

/* ---------- #258 ảnh tải xong (ảnh dựng bằng hinh()) → gắn .nap để chạy hiệu ứng mờ → nét ---------- */
document.addEventListener('load', function (ev) { var t = ev.target; if (t.tagName === 'IMG' && t.classList.contains('mo-dan')) t.classList.add('nap'); }, true);

/* ---------- #228 viền thẻ sáng theo chuột trên nền tối — LỚP DÙNG CHUNG ----------
   Gắn class "sang-theo-chuot" vào khối chứa; mỗi con trực tiếp là một thẻ (cần có border-radius nếu muốn bo). Ánh sáng loang theo chuột
   dọc viền các thẻ (cả thẻ bên cạnh), lòng thẻ sáng nhẹ. Thẻ được chèn thêm một <i class="sang-vien"> (tự thêm lại nếu bị vẽ lại). */
(function () {
  if (!CHUOT) return;
  var dang = null, ev0 = null, hen = 0;
  function chay() {
    hen = 0;
    var t = ev0.target, g = t && t.closest ? t.closest('.sang-theo-chuot') : null;
    if (dang && dang !== g) dang.classList.remove('dang-sang');
    dang = g; if (!g) return;
    g.classList.add('dang-sang');
    [].forEach.call(g.children, function (c) {
      if (/^(IMG|INPUT|BR|HR)$/.test(c.tagName)) return;
      if (!c.querySelector(':scope > .sang-vien')) c.insertAdjacentHTML('beforeend', '<i class="sang-vien" aria-hidden="true"></i>');
      var r = c.getBoundingClientRect();
      c.style.setProperty('--sx', (ev0.clientX - r.left).toFixed(0) + 'px'); c.style.setProperty('--sy', (ev0.clientY - r.top).toFixed(0) + 'px');
    });
  }
  document.addEventListener('pointermove', function (ev) { if (ev.pointerType !== 'mouse') return; ev0 = ev; if (!hen) hen = requestAnimationFrame(chay); }, {passive: true});
  document.addEventListener('mouseout', function (ev) { if (!ev.relatedTarget && dang) { dang.classList.remove('dang-sang'); dang = null; } });
})();

/* ---------- #022 trái tim nổ nhẹ: tim co lại rồi bật lên, một vòng + vài hạt đỏ/vàng toả ra. noTim(nút, nhe) — nhe: chỉ nảy + ít hạt (tim đầu trang) ---------- */
function noTim(el, nhe) {
  if (GIAM || !el) return;
  var r = el.getBoundingClientRect(); if (!r.width) return;
  el.animate([{transform: 'scale(1)'}, {transform: 'scale(.78)', offset: .25}, {transform: 'scale(1.2)', offset: .6}, {transform: 'scale(1)'}], {duration: 560, easing: 'cubic-bezier(.3,.7,.4,1)'});
  var z = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1;
  var b = document.createElement('div'); b.className = 'no-tim'; b.setAttribute('aria-hidden', 'true');
  b.style.transform = 'translate(' + (r.left + r.width / 2) + 'px,' + (r.top + r.height / 2) + 'px)';
  var so = nhe ? 5 : 8;
  b.innerHTML = (nhe ? '' : '<span></span>') + new Array(so + 1).join('<i></i>');
  document.body.appendChild(b);
  var vong = b.querySelector('span');
  if (vong) vong.animate([{transform: 'scale(.3)', opacity: .9}, {transform: 'scale(1.35)', opacity: 0}], {duration: 520, easing: 'cubic-bezier(.2,.7,.3,1)', delay: 90, fill: 'backwards'});
  [].forEach.call(b.querySelectorAll('i'), function (h, i) {
    var g = i / so * Math.PI * 2 - Math.PI / 2, d1 = (nhe ? 12 : 16) * z, d2 = (nhe ? 20 : 28) * z;
    h.animate([{transform: 'translate(' + Math.cos(g) * d1 + 'px,' + Math.sin(g) * d1 + 'px) scale(1)', opacity: 1},
               {transform: 'translate(' + Math.cos(g) * d2 + 'px,' + Math.sin(g) * d2 + 'px) scale(0)', opacity: .6}],
      {duration: 560, easing: 'cubic-bezier(.2,.7,.3,1)', delay: 120, fill: 'backwards'});
  });
  setTimeout(function () { b.remove(); }, 800);
}

/* ---------- #442 ảnh sản phẩm bay theo đường cong vào nút giỏ đầu trang, nút giỏ lắc nhẹ, số trên nút nảy lên.
   bayVaoGio(nguon, anh): nguon = nút vừa bấm (hoặc phần tử ảnh), anh = (tuỳ chọn) đường dẫn ảnh hoặc <img>; không tìm được ảnh thì bay chấm vàng.
   Trả về số mili-giây bay (0 nếu không bay) để trang tự hẹn việc tiếp theo. Dùng được ở mọi trang (trầm hương nối vào được). ---------- */
function bayVaoGio(nguon, anh) {
  if (GIAM || !nguon || !nguon.getBoundingClientRect) return 0;
  var dich = [document.getElementById('nutGio'), document.getElementById('moMenu')].filter(function (x) { return x && x.getBoundingClientRect().width; })[0];
  if (!dich) return 0;
  var bu = dau && dau.classList.contains('an') ? dau.offsetHeight + 4 : 0;   // đầu trang đang khuất: tính chỗ nút giỏ sau khi hiện lại
  hienDau(1600);
  var im = anh && anh.tagName === 'IMG' ? anh : null, src = typeof anh === 'string' ? anh : '';
  if (!im && !src) {
    var hop = nguon.closest('.sp, .ngan-mon, .pc-mon, .mega-nho, .tim-mon, .gio-dong, article, li');
    im = (hop && hop.querySelector('img:not(.sau)')) || (nguon.tagName === 'IMG' ? nguon : null) || document.querySelector('main figure.on img, main .sp-anh img, main img');
  }
  if (im) src = im.currentSrc || im.src;
  var rn = nguon.getBoundingClientRect(), r0 = im && im.getBoundingClientRect().width ? im.getBoundingClientRect() : rn;
  if (r0.bottom < 0 || r0.top > innerHeight) r0 = rn;   // ảnh đã cuộn khuất → bay từ chính nút
  var rd = dich.getBoundingClientRect();
  var w = src ? Math.max(44, Math.min(r0.width, r0.height || r0.width, 130)) : 18;
  var p0 = {x: r0.left + r0.width / 2, y: r0.top + r0.height / 2}, p2 = {x: rd.left + rd.width / 2, y: rd.top + rd.height / 2 + bu};
  var p1 = {x: (p0.x + p2.x) / 2 + (p2.x - p0.x) * .15, y: Math.min(p0.y, p2.y) - Math.min(160, 60 + Math.abs(p2.x - p0.x) * .2)};
  var el;
  if (src) { el = document.createElement('img'); el.referrerPolicy = 'no-referrer'; el.alt = ''; el.src = src; el.className = 'bay-gio'; }
  else { el = document.createElement('div'); el.className = 'bay-gio cham'; }
  el.style.width = el.style.height = w + 'px'; el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);
  var kf = [], N = 18, cuoi = 20 / w;
  for (var i = 0; i <= N; i++) {
    var t = i / N, tt = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, u = 1 - tt;
    var x = u * u * p0.x + 2 * u * tt * p1.x + tt * tt * p2.x, y = u * u * p0.y + 2 * u * tt * p1.y + tt * tt * p2.y;
    var s = 1 + (cuoi - 1) * Math.pow(tt, 1.3);
    kf.push({transform: 'translate(' + (x - w / 2).toFixed(1) + 'px,' + (y - w / 2).toFixed(1) + 'px) scale(' + s.toFixed(3) + ') rotate(' + (tt * -14).toFixed(1) + 'deg)',
             opacity: t > .86 ? 1 - (t - .86) / .14 * .7 : 1, offset: t});
  }
  var tg = 760;
  el.animate(kf, {duration: tg, easing: 'linear', fill: 'forwards'}).onfinish = function () {
    el.remove();
    dich.animate([{transform: 'none'}, {transform: 'rotate(-13deg) scale(1.08)'}, {transform: 'rotate(9deg)'}, {transform: 'rotate(-4deg)'}, {transform: 'none'}], {duration: 520, easing: 'ease-out'});
    var so = dich.querySelector('i');
    if (so) so.animate([{transform: 'scale(1)'}, {transform: 'scale(1.45)'}, {transform: 'scale(.9)'}, {transform: 'scale(1)'}], {duration: 480, easing: 'cubic-bezier(.3,.7,.4,1)'});
  };
  return tg;
}
