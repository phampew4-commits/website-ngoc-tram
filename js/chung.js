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
  matday: {ten: 'Mặt dây',         ngan: 'Mặt dây'}
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
function hinh(id, alt, w, them) { return '<img src="' + anh(id, w) + '" alt="' + e(alt) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"' + (them || '') + '>'; }

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
      '<div class="dau-mv"><span class="nho">Mới về tại cửa hàng</span><a href="' + veTrang + '#san-pham">Xem tất cả <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>' +
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
        '<div class="mxh">' + mxh + '</div>' +
        (LIEN_HE.nhomZalo ? '<a class="nut sang nho-tin" href="' + e(LIEN_HE.nhomZalo) + '" target="_blank" rel="noopener">Nhận tin món mới qua Zalo</a>' : '') +
      '</div>' +
      cot('Mua sắm', THU_TU.map(function (l) { return [LOAI[l].ten, veTrang + '#loai-' + l]; }).concat([['Tự thiết kế chuỗi', 'thiet-ke.html']])) +
      cot('Hỗ trợ', [['Giao hàng', veTrang + '#hd-giao'], ['Đổi trả', veTrang + '#hd-doi'], ['Bảo hành', veTrang + '#hd-bh'], ['Lưu ý charm vàng', veTrang + '#hd-luuy'], ['Hỏi đáp', veTrang + '#hoi-dap']]) +
      cot('Ngọc Trầm', [['Câu chuyện', veTrang + '#cau-chuyen'], ['Liên hệ', '#lien-he']].concat(LIEN_HE.fanpage.map(function (f) { return [f.ten, f.link, 1]; }))) +
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
    var r = ds.slice().sort(function (a, b) { return (a.loai === 'charm') - (b.loai === 'charm') || ngaySo(b.ngay) - ngaySo(a.ngay); }).slice(0, 6);
    var l = $('#luoiMv'); if (!l) return;
    l.innerHTML = r.map(function (x) {
      return '<a href="' + linkSp(x) + '"><span class="h">' + hinh(x.anh[0], x.ten, 400) + '</span><span class="tt-mv"><b>' + e(x.ten) + '</b>' + gia(x.gia) + '</span></a>';
    }).join('');
  }).catch(function () {});
}


/* ---------- đầu trang + menu ---------- */
var dau = $('#dau');
function capNhatDau() { dau.classList.toggle('dac', !$('.hero') || scrollY > innerHeight * 0.75); }
addEventListener('scroll', capNhatDau, {passive: true}); capNhatDau();
$('#moMenu').onclick = function () {
  var mo = $('#menu').classList.toggle('mo'); this.classList.toggle('mo', mo); document.body.classList.toggle('khoa', mo);
  document.body.style.overflow = mo ? 'hidden' : '';
};
$$('#menu a').forEach(function (a) { a.onclick = function () { $('#menu').classList.remove('mo'); $('#moMenu').classList.remove('mo'); document.body.classList.remove('khoa'); document.body.style.overflow = ''; }; });

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
function linkSp(x) { return 'san-pham.html?ma=' + encodeURIComponent(khoa(x)); }
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
  bo: function (k) { GIO.luu(GIO.ds().filter(function (x) { return x !== String(k); })); },
  xoaHet: function () { GIO.luu([]); }
};
function veNutGio() {
  var a = $('#nutGio'), n = GIO.so();
  if (!a) {
    var o = oNut(); if (!o) return;
    a = document.createElement('a'); a.id = 'nutGio'; a.className = 'nut-dau nut-gio'; a.href = 'gio-hang.html';
    a.onclick = function (ev) { if (!/gio-hang/.test(location.pathname)) { ev.preventDefault(); moGio(); } };
    o.appendChild(a);
  }
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
  a.setAttribute('aria-label', n ? 'Món yêu thích · ' + n + ' món' : 'Món yêu thích');
  a.title = a.getAttribute('aria-label');
  a.innerHTML = IC_TIM + (n ? '<i>' + n + '</i>' : '');
  a.classList.toggle('co', !!n);
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
  if (g) {   // thêm vào giỏ → giỏ sổ ra luôn cho thấy
    ev.preventDefault();
    if (!GIO.co(g.dataset.gio)) GIO.them(g.dataset.gio);
    if (nganGio && nganGio.classList.contains('mo') && nganKieu === 'yt') { baoTin('Đã thêm vào giỏ'); veNgan(); return; }
    moGio(); return;
  }
  var t = ev.target.closest('[data-yt]');
  if (t) {
    ev.preventDefault();
    var them = YT.doi(t.dataset.yt);
    baoTin(them ? 'Đã lưu vào yêu thích' : 'Đã bỏ khỏi yêu thích');
    if (nganGio && nganGio.classList.contains('mo') && nganKieu === 'yt') veNgan();
    if (!them && t.closest('#luoiYt') && window.veHoSo) setTimeout(veHoSo, 150);   // trang tài khoản: bỏ tim thì món rời khỏi lưới
    return;
  }
  var x = ev.target.closest('[data-xem]');
  if (x) { ev.preventDefault(); moMon(x.dataset.xem); }
});
function moMon(k) { (window.moSp || function (m) { location.href = 'san-pham.html?ma=' + encodeURIComponent(m); })(k); }
addEventListener('storage', function (ev) {   // mở nhiều thẻ cùng lúc
  if (ev.key === 'gio') { veNutGio(); veNutThem(); }
  if (ev.key === 'yeuThich') { veNutYtDau(); veNutYt(); }
});
veNutTim(); veNutYtDau(); veNutGio();

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
    than.innerHTML = '<div class="ngan-trong"><p>Giỏ đang trống.</p><p class="nhe">Bấm “Thêm vào giỏ” ở món bạn ưng, mọi món sẽ gom về đây.</p>' +
      '<a class="nut dac" href="index.html#san-pham">Xem sản phẩm</a></div>';
    chan.innerHTML = ''; return;
  }
  taiDuLieu.then(function () {
    var m = {};
    ds.forEach(function (x) { m[String(khoa(x))] = x; m[String(x.ma)] = x; });
    var mon = ma.map(function (k) { var x = m[k]; return {k: k, x: x, mua: !!(x && x.tt !== 'Đã bán' && x.gia)}; });
    var mua = mon.filter(function (g) { return g.mua; });
    var tong = mua.reduce(function (s, g) { return s + g.x.gia; }, 0);
    than.innerHTML = mon.map(function (g) {
      if (!g.x) return '<div class="ngan-mon het"><div class="anh"></div><div class="tt"><h3>Món ' + e(g.k) + '</h3>' +
        '<p class="het">Vừa được bán hoặc tạm ẩn.</p></div><button class="bo" data-bo-ngan="' + e(g.k) + '">Bỏ</button></div>';
      return '<div class="ngan-mon' + (g.mua ? '' : ' het') + '"><a class="anh" href="' + linkSp(g.x) + '">' + hinh(g.x.anh[0], g.x.ten, 200) + '</a>' +
        '<div class="tt"><h3><a href="' + linkSp(g.x) + '">' + e(g.x.ten) + '</a></h3><div class="ma">Mã ' + e(g.x.ma) + '</div>' +
        (g.mua ? '<div class="gia">' + gia(g.x.gia) + '</div>' : '<p class="het">' + (g.x.tt === 'Đã bán' ? 'Món này đã có chủ.' : 'Chưa có giá — nhắn Zalo nhé.') + '</p>') +
        '</div><button class="bo" data-bo-ngan="' + e(g.k) + '">Bỏ</button></div>';
    }).join('') + goiY(ma);
    chan.innerHTML = '<div class="dong-tong"><span>Tạm tính · ' + mua.length + ' món</span><b>' + gia(tong) + '</b></div>' +
      '<p class="nhe">Chưa tính phí gửi. Cửa hàng báo phí khi xác nhận đơn.</p>' +
      '<a class="nut dac" href="gio-hang.html">Đặt mua</a>' +
      '<button class="tiep" data-dong-gio>Tiếp tục xem</button>';
  });
}
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

function goiY(dangCo) {
  var con = conHang('').filter(function (x) { return dangCo.indexOf(String(khoa(x))) < 0 && dangCo.indexOf(String(x.ma)) < 0; });
  if (!con.length) return '';
  var i = Math.floor(Math.random() * Math.max(1, con.length - 2));
  return '<div class="ngan-goi"><h3>Có thể bạn cũng thích</h3>' + con.slice(i, i + 2).map(function (x) {
    return '<div class="ngan-mon nho"><a class="anh" href="' + linkSp(x) + '">' + hinh(x.anh[0], x.ten, 200) + '</a>' +
      '<div class="tt"><h3><a href="' + linkSp(x) + '">' + e(x.ten) + '</a></h3><div class="gia">' + gia(x.gia) + '</div></div>' +
      '<button class="tron" data-gio="' + e(khoa(x)) + '" aria-label="Thêm vào giỏ">' + IC_GIO + '</button></div>';
  }).join('') + '</div>';
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
var hb; function baoTin(s) { var t = $('#thongBao'); t.textContent = s; t.classList.add('hien'); clearTimeout(hb); hb = setTimeout(function () { t.classList.remove('hien'); }, 2600); }

document.addEventListener('click', function (ev) {
  var c = ev.target.closest('[data-chep]'); if (!c) return;
  var chu = 'Chào Ngọc Trầm, mình muốn hỏi mã ' + c.dataset.chep;
  if (navigator.clipboard) navigator.clipboard.writeText(chu).catch(function () {});
  baoTin('Đã chép mã ' + c.dataset.chep + ' — dán vào tin nhắn nhé');
});

/* ---------- rời trang: kéo màn giấy lại rồi mới sang trang mới ---------- */
addEventListener('load', function () { setTimeout(function () { document.documentElement.classList.add('da-nap'); }, 320); });
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest('a[href]');
    if (!a || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }
    if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html?$/.test(u.pathname)) return;
    ev.preventDefault();
    document.documentElement.classList.add('roi-trang');
    setTimeout(function () { location.href = u.href; }, 220);
  });
  addEventListener('pageshow', function (ev) { if (ev.persisted) document.documentElement.classList.remove('roi-trang'); });
})();

/* ---------- cuộn mượt, chậm khi bấm link trong trang (menu, nút "Xem sản phẩm"…) ---------- */
(function () {
  var dang = 0;
  function eo(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }   // nhanh dần rồi chậm dần
  function viTri(el) {
    if (getComputedStyle(el).position === 'sticky') el = el.parentElement;   // mục dính: lấy theo khối chứa
    return el.getBoundingClientRect().top + scrollY - 68;                     // trừ chiều cao đầu trang
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
