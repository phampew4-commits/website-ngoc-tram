/* ---------- dữ liệu ---------- */
taiDuLieu.then(function () {
  $('#tongSp').textContent = ds.length;
  dungHero(); dungNoiBat(); dungBst(); dungChay(); dungPhong(); dungTab(); hienLuoi(true);
  moTheoHash();
  var h = location.hash.slice(1), lo = /^loai-(\w+)$/.exec(h), dh = /^hd-/.test(h) && document.getElementById(h);
  if (lo) { chonLoai(lo[1]); setTimeout(function () { cuonToi(document.getElementById('san-pham')); }, 300); }
  if (dh) { dh.open = true; setTimeout(function () { cuonToi(dh); }, 300); }
}).catch(function () { $('#luoi').innerHTML = '<p class="rong">Chưa tải được danh sách sản phẩm.</p>'; });

/* ---------- HERO: trình chiếu ---------- */
var THOI_GIAN = 6000;
function dungHero() {
  var c = conHang('chuoi'), cac = [c[0], conHang('khuyen')[0], c[2], conHang('nhan')[0]].filter(Boolean);
  $('#chieu').innerHTML = cac.map(function (x, i) { return '<figure' + (i ? '' : ' class="on"') + '>' + hinh(x.anh[0], x.ten, 1600, i ? '' : ' fetchpriority="high"').replace(' loading="lazy"', i ? ' loading="lazy"' : '') + '</figure>'; }).join('');
  $('#tienTrinh').style.setProperty('--tg', THOI_GIAN + 'ms');
  $('#tienTrinh').innerHTML = cac.map(function (_, i) { return '<button' + (i ? '' : ' class="on"') + ' aria-label="Ảnh ' + (i + 1) + '">' + ('0' + (i + 1)) + '<i></i></button>'; }).join('');
  var i = 0, hen;
  function toi(n) {
    i = (n + cac.length) % cac.length;
    $$('#chieu figure').forEach(function (f, j) { f.classList.toggle('on', j === i); });
    $$('#tienTrinh button').forEach(function (b, j) { b.classList.remove('on'); if (j === i) { void b.offsetWidth; b.classList.add('on'); } });
    var x = cac[i];
    $('#temHero').href = '#sp/' + encodeURIComponent(khoa(x));
    $('#temHero').innerHTML = '<small>Mã ' + e(x.ma) + ' · ' + LOAI[x.loai].ngan + '</small><b>' + e(x.ten.replace(/ mix charm.*/i, '')) + '</b>' + gia(x.gia);
    clearTimeout(hen); if (!GIAM) hen = setTimeout(function () { toi(i + 1); }, THOI_GIAN);
  }
  $('#tienTrinh').onclick = function (ev) { var b = ev.target.closest('button'); if (b) toi([].indexOf.call(b.parentNode.children, b)); };
  toi(0);
}

function dungNoiBat() {
  var c = conHang('chuoi'), chon = [c[1], conHang('nhan')[0], c[3], conHang('khuyen')[1] || conHang('matday')[0]].filter(Boolean);
  $('#noiBat').innerHTML = chon.map(the).join(''); theoDoi($('#noiBat'));
}

/* ---------- bộ sưu tập: chữ lớn + ảnh theo chuột ---------- */
function dungBst() {
  var dem = {}; ds.forEach(function (x) { dem[x.loai] = (dem[x.loai] || 0) + 1; });
  $('#dsBst').innerHTML = THU_TU.filter(function (l) { return dem[l]; }).map(function (l) {
    var a = conHang(l)[Math.min(1, conHang(l).length - 1)];
    return '<li data-hien><a href="#san-pham" data-loai="' + l + '" data-anh="' + (a ? anh(a.anh[0], 500) : '') + '">' + LOAI[l].ten + '<sup>' + dem[l] + '</sup></a></li>';
  }).join('');
  theoDoi($('#dsBst'));
  var xem = $('#xemChuot'), mx = 0, my = 0, x = 0, y = 0, chay = false;
  $('#dsBst').addEventListener('click', function (ev) { var a = ev.target.closest('a'); if (a) chonLoai(a.dataset.loai); });
  if (!matchMedia('(hover:hover)').matches) return;
  $('#dsBst').addEventListener('mouseover', function (ev) {
    var a = ev.target.closest('a'); if (!a) return;
    mx = ev.clientX; my = ev.clientY;
    xem.innerHTML = '<img src="' + a.dataset.anh + '" alt="" referrerpolicy="no-referrer">'; xem.classList.add('on');
    if (!chay) { chay = true; x = mx; y = my; buoc(); }
  });
  $('#dsBst').addEventListener('mouseleave', function () { xem.classList.remove('on'); });
  addEventListener('mousemove', function (ev) { mx = ev.clientX; my = ev.clientY; }, {passive: true});
  function buoc() {
    x += (mx - x) * .14; y += (my - y) * .14;
    xem.style.transform = 'translate(' + (x - 100) + 'px,' + (y - 125) + 'px) rotate(' + ((mx - x) * .04).toFixed(2) + 'deg)';
    if (xem.classList.contains('on') || Math.abs(mx - x) > .5) requestAnimationFrame(buoc); else chay = false;
  }
}

/* ---------- câu chuyện: ảnh trôi + chữ sáng dần theo cuộn ---------- */
function dungPhong() {
  var c = conHang('chuoi'), a = c[4] || c[0];
  $('#phong').insertAdjacentHTML('afterbegin', hinh(a.anh[1] || a.anh[0], '', 1600));
  var q = $('#chuQuet');
  q.innerHTML = q.textContent.split(/(\s+)/).map(function (w) { return /^\s+$/.test(w) ? w : '<span>' + e(w) + '</span>'; }).join('');
}

/* ---------- chữ chạy khổng lồ ---------- */
function dungChay() {
  var c = conHang(), anhs = [c[2], c[6], c[9], c[12]].filter(Boolean);
  var t = function (k) { var a = anhs[k % anhs.length]; return '<span class="tron">' + (a ? hinh(a.anh[0], '', 300).replace(' loading="lazy"', '') : '') + '</span>'; };
  var h1 = '', h2 = '';
  for (var k = 0; k < 4; k++) { h1 += '<span>Ngọc Trầm</span>' + t(k) + '<em>Jade &amp; Agarwood</em>' + t(k + 1); h2 += '<em>Phỉ thuý</em>' + t(k + 2) + '<span>Trầm hương</span>' + t(k + 3) + '<em>Vàng 18K</em>' + t(k); }
  var r = $$('#chay .hang'); r[0].innerHTML = h1; r[1].innerHTML = h2;
}

/* ---------- vòng lặp cuộn: đầu trang, ảnh trôi, chữ chạy, chữ sáng ---------- */
var cho = false;
function khiCuon() {
  cho = false;
  if (GIAM) return;
  var vh = innerHeight;
  var ph = $('#phong'), img = ph && ph.querySelector('img');
  if (img) { var r = ph.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) img.style.transform = 'translate3d(0,' + ((r.top / vh) * -8).toFixed(2) + '%,0) scale(1.05)'; }
  var ch = $('#chay'), rc = ch.getBoundingClientRect();
  if (rc.bottom > 0 && rc.top < vh) $$('#chay .hang').forEach(function (h) {
    var p = (vh - rc.top) / (vh + rc.height), d = +h.dataset.huong;
    h.style.transform = 'translate3d(' + (d < 0 ? -p * 30 : -30 + p * 30) + '%,0,0)';
  });
  var q = $('#chuQuet'), rq = q.getBoundingClientRect();
  if (rq.top < vh && rq.bottom > 0) {
    var tl = Math.min(1, Math.max(0, (vh * .85 - rq.top) / (rq.height + vh * .35))), sp = q.children, n = Math.round(tl * sp.length);
    for (var i = 0; i < sp.length; i++) sp[i].classList.toggle('sang', i < n);
  }
}
addEventListener('scroll', function () { if (!cho) { cho = true; requestAnimationFrame(khiCuon); } }, {passive: true});
addEventListener('resize', khiCuon);
khiCuon();

/* ---------- lọc + lưới sản phẩm ---------- */
function dungTab() {
  var dem = {}; ds.forEach(function (x) { dem[x.loai] = (dem[x.loai] || 0) + 1; });
  $('#tab').innerHTML = '<button data-loai="tat" class="on">Tất cả<span>' + ds.length + '</span></button>' +
    THU_TU.filter(function (l) { return dem[l]; }).map(function (l) { return '<button data-loai="' + l + '">' + LOAI[l].ngan + '<span>' + dem[l] + '</span></button>'; }).join('');
  $('#tab').onclick = function (ev) { var b = ev.target.closest('button'); if (b) chonLoai(b.dataset.loai); };
}
function chonLoai(l) {
  loc = l; $$('#tab button').forEach(function (b) { b.classList.toggle('on', b.dataset.loai === l); }); hienLuoi(true);
}
var hen; $('#o-tim').oninput = function () { clearTimeout(hen); var v = this.value; hen = setTimeout(function () { tu = boDau(v.trim()); hienLuoi(true); }, 180); };
$('#sapXep').onchange = function () { sx = this.value; hienLuoi(true); };
$('#xemThem').onclick = function () { hienLuoi(false); };
function danhSach() {
  var r = ds.filter(function (x) { return (loc === 'tat' || x.loai === loc) && (!tu || boDau(x.ten + ' ' + x.ma + ' ' + (x.mo_ta || '')).indexOf(tu) >= 0); });
  var uu = function (x) { return x.loai === 'charm' ? 1 : 0; };
  r.sort(function (a, b) {
    if (sx === 'tang') return a.gia - b.gia;
    if (sx === 'giam') return b.gia - a.gia;
    return (loc === 'tat' ? uu(a) - uu(b) : 0) || ngaySo(b.ngay) - ngaySo(a.ngay) || b.gia - a.gia;
  });
  return r;
}
function hienLuoi(lai) {
  var r = danhSach(), l = $('#luoi');
  if (lai) { soHien = 0; l.innerHTML = ''; }
  if (!r.length) { l.innerHTML = '<p class="rong">Không có món nào khớp “' + e($('#o-tim').value) + '”.</p>'; $('#xemThem').style.display = 'none'; return; }
  var moi = r.slice(soHien, soHien + MOI_LAN); soHien += moi.length;
  l.insertAdjacentHTML('beforeend', moi.map(the).join('')); theoDoi(l);
  $('#xemThem').style.display = soHien < r.length ? '' : 'none';
  $('#xemThem').textContent = 'Xem thêm · ' + (r.length - soHien) + ' món';
}
document.addEventListener('click', function (ev) { var b = ev.target.closest('.sp'); if (b) location.hash = 'sp/' + encodeURIComponent(b.dataset.k); });

/* ---------- chi tiết (trượt từ phải) ---------- */
function moTheoHash() {
  var m = /^#sp\/(.+)$/.exec(location.hash);
  if (!m) { dongCt(true); return; }
  var k = decodeURIComponent(m[1]), x = ds.filter(function (y) { return khoa(y) === k || y.ma === k; })[0];
  if (x) moCt(x);
}
addEventListener('hashchange', moTheoHash);
function moCt(x) {
  $('#bang').innerHTML = x.anh.map(function (id, i) { return hinh(id, x.ten + ' – ảnh ' + (i + 1), 1200); }).join('');
  $('#bang').scrollLeft = 0;
  $('#chamCt').innerHTML = x.anh.length > 1 ? x.anh.map(function (_, i) { return '<button' + (i ? '' : ' class="on"') + ' aria-label="Ảnh ' + (i + 1) + '"></button>'; }).join('') : '';
  var tt = x.tt || 'Còn hàng';
  $('#ttCt').innerHTML =
    '<span class="nho">' + LOAI[x.loai].ten + ' · ' + e(nhanSp(x)) + '</span>' +
    '<h3>' + e(x.ten) + '</h3>' +
    '<div class="ma-ct"><span>Mã ' + e(x.ma) + '</span><span class="chip' + (/bán/i.test(tt) ? ' ban' : '') + '">' + e(tt) + '</span></div>' +
    '<div class="gia-ct">' + gia(x.gia) + '</div><small>Giá bán lẻ</small>' +
    (x.mo_ta ? '<p class="mt">' + e(x.mo_ta) + '</p>' : '') +
    '<div class="hang"><a class="nut dac" style="background:#0068ff;border-color:#0068ff" href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Hỏi mua qua Zalo</a>' +
    '<a class="nut" href="' + linkFb() + '" target="_blank" data-chep="' + e(x.ma) + '">Nhắn Messenger</a></div>' +
    '<div class="ghi-ct">Bấm nút, câu hỏi kèm mã ' + e(x.ma) + ' được chép sẵn để bạn dán vào tin nhắn.</div>' +
    '<a class="sang-trang" href="' + linkSp(x) + '">Xem trang chi tiết <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
  $('#ct').classList.add('mo'); document.body.style.overflow = 'hidden';
  document.title = x.ten + ' · Ngọc Trầm Store';
}
function dongCt(im) {
  $('#ct').classList.remove('mo'); if (!$('#menu').classList.contains('mo')) document.body.style.overflow = '';
  document.title = 'Ngọc Trầm Store · Phỉ thuý & Trang sức vàng';
  if (!im && /^#sp\//.test(location.hash)) history.pushState('', '', location.pathname + location.search);
}
$('#ct').onclick = function (ev) {
  if (ev.target.closest('[data-dong]')) dongCt();
  var b = ev.target.closest('#chamCt button');
  if (b) { var bg = $('#bang'); bg.scrollTo({left: [].indexOf.call(b.parentNode.children, b) * bg.clientWidth, behavior: 'smooth'}); }
};
addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && $('#ct').classList.contains('mo')) dongCt(); });
$('#bang').addEventListener('scroll', function () {
  var i = Math.round(this.scrollLeft / this.clientWidth);
  $$('#chamCt button').forEach(function (x, j) { x.classList.toggle('on', j === i); });
}, {passive: true});
