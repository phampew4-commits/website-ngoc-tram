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

/* bấm thẻ sản phẩm → mở trang chi tiết; trang chủ đặt moSp riêng (mở bằng hash) */
document.addEventListener('click', function (ev) { var b = ev.target.closest('.sp'); if (b) (window.moSp || function (k) { location.href = 'san-pham.html?ma=' + encodeURIComponent(k); })(b.dataset.k); });

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
    '<div class="dai-tt"><div class="khung"><span>Thanh toán: Chuyển khoản · COD</span><span>Giao hàng: Vietnam Post · Toàn quốc</span><span>Ship miễn phí đơn từ 1.500.000đ chuyển khoản trước</span></div></div>' +
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
function theoDoi(goc) { (goc || document).querySelectorAll('[data-hien]:not(.hien),[data-mo-anh]:not(.hien),.tieu-de:not(.hien)').forEach(function (x) { io.observe(x); }); }
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

/* ---------- thẻ sản phẩm ---------- */
function nhanSp(x) {
  var t = x.ten.toLowerCase(), v = /vàng (\d\dK)/i.exec(x.ten + ' ' + (x.mo_ta || ''));
  var ngoc = x.tram || /trầm/.test(t) ? 'Trầm hương' : /lam băng/.test(t) ? 'Lam băng' : /lục đế/.test(t) ? 'Lục đế' : /hoà điền|hòa điền/.test(t) ? 'Hoà điền' : /ngọc bích/.test(t) ? 'Ngọc bích' : /phỉ|phit/.test(t) ? 'Phỉ thuý' : LOAI[x.loai].ngan;
  return ngoc + (v ? ' · ' + v[1] : '');
}
function the(x, i) {
  return '<button class="sp" data-hien style="--i:' + (i % 4) + '" data-k="' + e(khoa(x)) + '"><div class="h">' +
    '<span class="nhan">' + e(nhanSp(x)) + '</span>' + (x.tt && x.tt !== 'Còn hàng' ? '<span class="tt">' + e(x.tt) + '</span>' : '') +
    hinh(x.anh[0], x.ten, 700) + (x.anh[1] ? hinh(x.anh[1], x.ten, 700, ' class="sau"') : '') +
    '<span class="hoi">Xem &amp; hỏi mua</span></div>' +
    '<h3>' + e(x.ten) + '</h3><div class="g">' + gia(x.gia) + '<span class="ma">#' + e(x.ma) + '</span></div></button>';
}
var hb; function baoTin(s) { var t = $('#thongBao'); t.textContent = s; t.classList.add('hien'); clearTimeout(hb); hb = setTimeout(function () { t.classList.remove('hien'); }, 2600); }

document.addEventListener('click', function (ev) {
  var c = ev.target.closest('[data-chep]'); if (!c) return;
  var chu = 'Chào Ngọc Trầm, mình muốn hỏi mã ' + c.dataset.chep;
  if (navigator.clipboard) navigator.clipboard.writeText(chu).catch(function () {});
  baoTin('Đã chép mã ' + c.dataset.chep + ' — dán vào tin nhắn nhé');
});

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
