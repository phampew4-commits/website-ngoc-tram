/* ---------- dữ liệu ---------- */
/* món nào có video (video/sp/<mã>.mp4) — danh sách do app ghi lại mỗi lần đăng web */
var dsVideo = fetch('video/sp/ds.json', {cache: 'no-cache'}).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });

taiDuLieu.then(function () {
  $('#tongSp').textContent = ds.length;
  dungHero(); dungNoiBat(); dungBst(); dungChay(); dungPhong(); dungTab(); hienLuoi(true); dungLap();
  moTheoHash();
  var h = location.hash.slice(1), lo = /^loai-(\w+)$/.exec(h), dh = /^hd-/.test(h) && document.getElementById(h);
  if (lo) { chonLoai(lo[1]); setTimeout(function () { cuonToi(document.getElementById('san-pham')); }, 300); }
  if (dh) { dh.open = true; setTimeout(function () { cuonToi(dh); }, 300); }
}).catch(function () { $('#luoi').innerHTML = '<p class="rong">Chưa tải được danh sách sản phẩm.</p>'; });

/* ---------- HERO: trình chiếu ---------- */
var THOI_GIAN = 6000;
function dungHero() { dsVideo.then(function (vids) { dungHeroVoi(vids || []); }); }
/* Trình chiếu đầu trang dạng ô — màn ngang (máy tính): 3 ô mỗi slide, màn dọc (điện thoại): 1 ô.
   Ô có video (video/sp/<mã>.mp4) thì chạy video, không có thì hiện ảnh. Tên + giá nằm trong từng ô, bấm là mở món. */
function dungHeroVoi(vids) {
  var kt = {};   // mã → {w, h} (ds.json mới) — vẫn đọc được dạng cũ chỉ có mã
  vids.forEach(function (v) { if (v && typeof v === 'object') kt[String(v.ma)] = v; else kt[String(v)] = {ma: String(v)}; });
  var dungVideo = (ND.heroKieu || 'video') !== 'anh';   // app › Đầu trang › Trình chiếu: Video / Ảnh
  var coVid = function (x) { return dungVideo && !!kt[String(x.ma)]; };
  var doc = function (x) { var k = kt[String(x.ma)]; return !!(k && k.h && k.w && k.h / k.w >= 1.5); };   // video dọc: khít ô, nét nhất
  var cheDo = ND.heroCheDo || ((ND.heroAnh || []).length ? 'tay' : 'gia');
  var chonVid = (cheDo === 'tay' && ND.heroVid) || {};
  var vidCua = function (x) {   // admin chọn riêng > video của chính món > không có (hiện ảnh)
    var v = String(chonVid[x.ma] || '').replace(/[^\w.\/-]/g, '').replace(/\.\.+/g, '.');
    if (!dungVideo) return '';
    return v || (coVid(x) ? 'sp/' + x.ma + '.mp4' : '');
  };
  var tron = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var soAnh = Math.min(9, Math.max(2, +ND.heroSo || 6)), soMon = Math.max(3, Math.ceil(soAnh / 3) * 3);   // tròn bội 3 cho đủ ô
  var cac = [];
  if (cheDo === 'tay') {
    cac = (ND.heroAnh || []).map(function (m) { return ds.filter(function (x) { return x.ma === String(m) || x.id === String(m); })[0]; }).filter(Boolean).slice(0, 6);
  }
  if (!cac.length) {
    /* tự chọn: món có video dọc trước (khít ô), rồi video vuông, rồi món chỉ có ảnh */
    var con = conHang('');
    if (cheDo === 'ngaunhien') {
      var loai = (ND.heroLoai && ND.heroLoai.length) ? ND.heroLoai : ['chuoi', 'nhan', 'khuyen', 'matday'];
      con = tron(con.filter(function (x) { return loai.indexOf(x.loai) >= 0; }));
    }
    var hang = function (x) { return doc(x) ? 0 : coVid(x) ? 1 : 2; };
    cac = con.slice().sort(function (a, b) { return hang(a) - hang(b); }).slice(0, soMon);
  }
  if (!cac.length) return;
  var hero = $('.hero'), N = cac.length;
  hero.classList.add('co-o');
  var tem = $('#temHero'); if (tem) tem.remove();
  $('#chieu').innerHTML = cac.map(function (x, i) {
    var v = vidCua(x), nen;
    if (v) {
      var bia = 'video/' + v.replace(/\.\w+$/, '') + '.jpg';
      nen = '<video muted loop playsinline preload="' + (i < 3 ? 'metadata' : 'none') + '" poster="' + bia + '" aria-hidden="true"><source src="video/' + v + '" type="video/mp4"></video>';
    } else nen = hinh(x.anh[0], x.ten, 1200, i ? '' : ' fetchpriority="high"');
    return '<div class="o-hero" data-i="' + i + '">' + nen + '</div>';
  }).join('');
  var nhan = $('#nhanO');
  if (!nhan) { nhan = document.createElement('div'); nhan.className = 'nhan-o'; nhan.id = 'nhanO'; hero.appendChild(nhan); }
  var o = $$('#chieu .o-hero'), ngang = matchMedia('(min-aspect-ratio: 1/1)'), n = 0, hen, trongMan = true;
  function moiSlide() { return ngang.matches ? Math.min(3, N) : 1; }
  function soSlide() { return Math.ceil(N / moiSlide()); }
  function oCua(sl) { var k = moiSlide(), r = []; for (var j = 0; j < k; j++) r.push((sl * k + j) % N); return r; }
  function phat(hien) {   // chỉ video các ô đang hiện chạy; cuộn khỏi đầu trang thì dừng hết
    o.forEach(function (t, i) {
      var v = t.querySelector('video'); if (!v) return;
      if (trongMan && !GIAM && hien.indexOf(i) >= 0) { v.preload = 'auto'; try { v.currentTime = 0; } catch (er) {} var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }
  function veSo() {
    var k = soSlide();
    $('#tienTrinh').style.setProperty('--tg', THOI_GIAN + 'ms');
    $('#tienTrinh').innerHTML = k > 1 ? Array.apply(null, Array(k)).map(function (_, i) {
      return '<button aria-label="Nhóm ' + (i + 1) + '">' + ('0' + (i + 1)) + '<i></i></button>'; }).join('') : '';
  }
  function toi(sl) {
    var k = soSlide(); n = ((sl % k) + k) % k;
    var hien = oCua(n), m = moiSlide();
    o.forEach(function (t, i) {
      var j = hien.indexOf(i);
      t.classList.toggle('on', j >= 0);
      if (j >= 0) t.style.left = (j * 100 / m) + '%';
    });
    phat(hien);
    nhan.innerHTML = hien.map(function (i, j) {
      var x = cac[i];
      return '<a class="o-nhan" href="' + linkSp(x) + '" style="animation-delay:' + (j * 120) + 'ms"><small>Mã ' + e(x.ma) + ' · ' + LOAI[x.loai].ngan + '</small>' +
        '<b>' + e(x.ten.replace(/ mix charm.*/i, '')) + '</b><span>' + gia(x.gia) +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>';
    }).join('');
    $$('#tienTrinh button').forEach(function (b, j) { b.classList.remove('on'); if (j === n) { void b.offsetWidth; b.classList.add('on'); } });
    clearTimeout(hen); if (!GIAM && k > 1) hen = setTimeout(function () { toi(n + 1); }, THOI_GIAN);
  }
  $('#tienTrinh').onclick = function (ev) { var b = ev.target.closest('button'); if (b) toi([].indexOf.call(b.parentNode.children, b)); };
  (ngang.addEventListener ? ngang.addEventListener.bind(ngang, 'change') : ngang.addListener.bind(ngang))(function () { veSo(); toi(0); });
  new IntersectionObserver(function (es) { es.forEach(function (x) { trongMan = x.isIntersecting; phat(trongMan ? oCua(n) : []); }); }).observe(hero);
  veSo(); toi(0);
}

function dungNoiBat() {
  var c = conHang('chuoi'), chon = [c[1], conHang('nhan')[0], c[3], conHang('khuyen')[1] || conHang('matday')[0]].filter(Boolean);
  var tay = ((CH.trangChu || {}).noiBat || []).map(function (m) { return ds.filter(function (x) { return x.ma === String(m) || x.id === String(m); })[0]; }).filter(Boolean);
  if (tay.length) chon = tay.slice(0, 8);   // admin chọn tay thì dùng danh sách đó
  $('#noiBat').innerHTML = chon.map(the).join(''); theoDoi($('#noiBat'));
}

/* ---------- bộ sưu tập: chữ lớn + ảnh theo chuột ---------- */
function demLoai() { var d = {}; ds.forEach(function (x) { d[x.loai] = (d[x.loai] || 0) + 1; }); return d; }

function dungBst() {
  var dem = demLoai(), ls = THU_TU.filter(function (l) { return dem[l]; });
  var mon = ls.map(function (l) { var c = conHang(l); return c[Math.min(1, c.length - 1)]; });
  /* #276: mỗi dòng ngọc một ảnh thật của chính dòng đó — máy tính: ảnh nổi theo chuột; điện thoại: ảnh nhỏ cạnh tên */
  $('#dsBst').innerHTML = ls.map(function (l, i) {
    var a = mon[i];
    return '<li data-hien><a href="#san-pham" data-loai="' + l + '" data-i="' + i + '">' +
      (a ? '<img class="tc-bst-nho" src="' + anh(a.anh[0], 160) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">' : '') +
      LOAI[l].ten + '<sup>' + dem[l] + '</sup></a></li>';
  }).join('');
  theoDoi($('#dsBst'));
  var xem = $('#xemChuot'), mx = 0, my = 0, x = 0, y = 0, chay = false, dai = null;
  $('#dsBst').addEventListener('click', function (ev) { var a = ev.target.closest('a'); if (a) chonLoai(a.dataset.loai); });
  if (!matchMedia('(hover:hover)').matches) return;
  $('#dsBst').addEventListener('mouseover', function (ev) {
    var a = ev.target.closest('a'); if (!a) return;
    mx = ev.clientX; my = ev.clientY;
    if (!dai) {   // một dải ảnh xếp dọc — đổi dòng thì dải trượt lên / xuống tới ảnh của dòng mới
      xem.innerHTML = '<div class="tc-dai">' + mon.map(function (m, i) {
        return '<img src="' + (m ? anh(m.anh[0], 500) : '') + '" alt="" style="--i:' + i + '" decoding="async" referrerpolicy="no-referrer">'; }).join('') + '</div>';
      dai = xem.firstChild;
    }
    var moi = !xem.classList.contains('on');
    if (moi) dai.style.transition = 'none';
    dai.style.translate = '0 ' + (-(+a.dataset.i || 0) * 100) + '%';
    if (moi) { void dai.offsetWidth; dai.style.transition = ''; }
    xem.classList.add('on');
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
  /* 28/11: bỏ ảnh nền (ảnh sản phẩm phóng to bị nhoè, có vệt) — nền giờ là quầng sáng + bụi vàng (css/bui-vang.css, js/bui-vang.js) */
  var q = $('#chuQuet');
  q.innerHTML = q.textContent.split(/(\s+)/).map(function (w) { return /^\s+$/.test(w) ? w : '<span>' + e(w) + '</span>'; }).join('');
}

/* ---------- chữ chạy khổng lồ ---------- */
function dungChay() {
  var c = conHang(), anhs = [c[2], c[6], c[9], c[12]].filter(Boolean);
  var t = function (k) { var a = anhs[k % anhs.length]; return '<span class="tron">' + (a ? hinh(a.anh[0], '', 300).replace(' loading="lazy"', '') : '') + '</span>'; };
  var h1 = '', h2 = '';
  var cum = function (ds, lech) { return ds.map(function (p, i) { return '<span>' + ndHtml(p) + '</span>' + t(i + lech); }).join(''); };
  var d1 = (ND.chay1 && ND.chay1.length) ? ND.chay1 : ['Ngọc Trầm', '*Jade & Agarwood*'], d2 = (ND.chay2 && ND.chay2.length) ? ND.chay2 : ['*Phỉ thuý*', 'Trầm hương', '*Vàng 18K*'];
  for (var k = 0; k < 4; k++) { h1 += cum(d1, k); h2 += cum(d2, k + 2); }
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
  /* #247 video "Cách Ngọc Trầm chọn từng món" nở rộng hai bên khi cuộn tới */
  var qv = $('#quyVideo');
  if (qv && !qv.hidden) {
    var rv = qv.getBoundingClientRect();
    if (rv.bottom > 0 && rv.top < vh) {
      var pv = Math.min(1, Math.max(0, (vh - rv.top) / (vh * .8))), ev2 = 1 - Math.pow(1 - pv, 3);
      qv.classList.toggle('tc-no', ev2 < 1);
      qv.style.clipPath = ev2 < 1 ? 'inset(0 ' + ((1 - ev2) * 12).toFixed(2) + '% round calc(' + (22 + (1 - ev2) * 60).toFixed(1) + 'px*var(--z)))' : '';
      qv.style.scale = ev2 < 1 ? (.9 + ev2 * .1).toFixed(4) : '';
    }
  }
}
addEventListener('scroll', function () { if (!cho) { cho = true; requestAnimationFrame(khiCuon); } }, {passive: true});
addEventListener('resize', khiCuon);
khiCuon();

/* ---------- lọc + lưới sản phẩm ---------- */
function dungTab() {
  var dem = demLoai();
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
window.moSp = function (k) { location.hash = 'sp/' + encodeURIComponent(k); };   // trang chủ mở chi tiết ngay tại chỗ

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
  $$('.ct .lat').forEach(function (b) { b.hidden = x.anh.length < 2; });   // một ảnh thì khỏi mũi tên
  var tt = x.tt || 'Còn hàng';
  $('#ttCt').innerHTML =
    '<span class="nho">' + LOAI[x.loai].ten + ' · ' + e(nhanSp(x)) + '</span>' +
    '<h3>' + e(x.ten) + '</h3>' +
    '<div class="ma-ct"><span>Mã ' + e(x.ma) + '</span><span class="chip' + (/bán/i.test(tt) ? ' ban' : '') + '">' + e(tt) + '</span></div>' +
    '<div class="gia-ct">' + gia(x.gia) + '</div><small>' + (x.gia ? 'Giá bán lẻ' : 'Nhắn shop để được báo giá') + '</small>' +
    (x.mo_ta ? '<p class="mt">' + e(x.mo_ta) + '</p>' : '') +
    '<div class="hang">' + (/bán/i.test(tt) ? '' : '<button class="nut dac" data-gio="' + e(khoa(x)) + '">Thêm vào giỏ</button>') +
    '<a class="nut zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Hỏi mua qua Zalo</a>' +
    '<a class="nut" href="' + linkFb() + '" target="_blank" data-chep="' + e(x.ma) + '">Nhắn Messenger</a></div>' +
    '<div class="ghi-ct">Bấm nút, câu hỏi kèm mã ' + e(x.ma) + ' được chép sẵn để bạn dán vào tin nhắn.</div>' +
    '<a class="sang-trang" href="' + linkSp(x) + '">Xem trang chi tiết <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
  veNutThem();
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
  var l = ev.target.closest('[data-lat]');
  if (l) {   // mũi tên lật ảnh, chạy vòng lại từ đầu
    var g = $('#bang'), so = g.children.length, i = Math.round(g.scrollLeft / g.clientWidth) + (+l.dataset.lat);
    g.scrollTo({left: ((i % so) + so) % so * g.clientWidth, behavior: 'smooth'});
  }
};
addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && $('#ct').classList.contains('mo')) dongCt(); });
$('#bang').addEventListener('scroll', function () {
  var i = Math.round(this.scrollLeft / this.clientWidth);
  $$('#chamCt button').forEach(function (x, j) { x.classList.toggle('on', j === i); });
}, {passive: true});


/* ---------- cảm nhận khách hàng (sửa trong app › Nội dung trang) ----------
   Trái: tiêu đề đè lên ảnh lớn · Phải: cột thẻ, một thẻ sáng lên và tự đổi mỗi 4,5 giây. */
(function () {
  var cn = (ND.camNhan || []).filter(function (x) { return x && x.noi; }).slice(0, 6);
  var muc = $('#cam-nhan'); if (!muc || !cn.length) return;
  muc.hidden = false;

  /* ảnh lớn bên trái: xếp chồng sẵn ảnh của từng cảm nhận, đổi thẻ nào thì ảnh đó mờ hiện lên */
  var hinh = $('#cnHinh'), lop = [], anhCua = [];
  cn.forEach(function (x) {
    if (!x.anh) { anhCua.push(-1); return; }
    anhCua.push(lop.length);
    lop.push('<img src="img/cam-nhan/' + encodeURIComponent(x.anh) + '" alt="Khách của Ngọc Trầm' + (x.ten ? ' — ' + e(x.ten) : '') +
      '"' + (lop.length ? ' loading="lazy"' : '') + ' decoding="async">');
  });
  if (lop.length) {
    hinh.innerHTML = lop.join('') + '<span class="cn-dau">Từ 2015<small>Jade &amp; Agarwood</small></span>';
    hinh.querySelector('img').classList.add('hien-anh');
  } else {
    hinh.remove();
    muc.querySelector('.cn-bo').classList.add('khong-hinh');
  }
  var dsAnh = hinh ? [].slice.call(hinh.querySelectorAll('img')) : [];

  $('#dsCamNhan').innerHTML = cn.map(function (x, i) {
    var sao = Math.max(1, Math.min(5, +x.sao || 5));
    var ten = x.ten || 'Khách của Ngọc Trầm';
    return '<article class="cn-the' + (i ? '' : ' sang') + '" data-cn="' + i + '" data-hien style="transition-delay:' + (i * 90) + 'ms">' +
      '<div class="sao" aria-label="' + sao + ' trên 5 sao">' + new Array(sao + 1).join('<span>★</span>') + '</div>' +
      '<blockquote>' + e(x.noi) + '</blockquote>' +
      '<footer><span class="ai">' + (x.anh
          ? '<img src="img/cam-nhan/' + encodeURIComponent(x.anh) + '" alt="" loading="lazy" decoding="async">'
          : e((ten.trim().split(/\s+/).pop() || 'K')[0].toUpperCase())) + '</span>' +
        '<span class="ten"><b>' + e(ten) + '</b>' + (x.tu ? '<small>Khách ở ' + e(x.tu) + '</small>' : '') + '</span></footer>' +
      (x.ma ? '<a class="cn-di" href="san-pham.html?ma=' + encodeURIComponent(x.ma) + '" hidden aria-label="Xem món khách đã chọn">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17L17 7M9 7h8v8"/></svg></a>' : '') +
      '</article>';
  }).join('');

  /* món khách đã chọn: lấy tên thật từ kho, món đã ẩn / gõ sai mã thì giấu nút đi */
  taiDuLieu.then(function () {
    cn.forEach(function (x, i) {
      if (!x.ma) return;
      var mon = ds.filter(function (y) { return String(y.ma) === String(x.ma) || String(khoa(y)) === String(x.ma); })[0];
      var a = $('.cn-the[data-cn="' + i + '"] .cn-di'); if (!a || !mon) return;
      a.hidden = false;
      a.title = 'Món khách đã chọn: ' + mon.ten;
      a.setAttribute('aria-label', a.title);
    });
  }).catch(function () {});

  theoDoi(muc);

  /* thẻ sáng tự chạy vòng — rê chuột vào thì dừng lại */
  var the = $$('#dsCamNhan .cn-the'), dang = 0, hen = 0;
  /* điện thoại / máy tính bảng: các thẻ thành một hàng vuốt ngang, có chấm báo đang ở thẻ nào */
  var khay = $('#dsCamNhan'), laTruot = function () { return getComputedStyle(khay).overflowX === 'auto'; };
  var cham = document.createElement('div'); cham.className = 'cn-cham';
  cham.innerHTML = the.map(function (_, i) { return '<button type="button" aria-label="Cảm nhận ' + (i + 1) + '"></button>'; }).join('');
  khay.after(cham);
  /* tự trượt bằng tay mình (không dùng 'smooth' của trình duyệt — Safari điện thoại vừa trượt vừa hút thẻ nên giật):
     tắt hút thẻ trong lúc trượt, đường cong êm, xong bật lại */
  var dangTruot = 0, tayCham = false;
  function truotToi(i, muot) {
    if (!laTruot()) return;
    var t = the[i], den = Math.max(0, Math.min(khay.scrollWidth - khay.clientWidth, t.offsetLeft - (khay.clientWidth - t.offsetWidth) / 2));
    cancelAnimationFrame(dangTruot);
    if (!muot || GIAM) { khay.scrollLeft = den; return; }
    var tu = khay.scrollLeft, quang = den - tu; if (Math.abs(quang) < 2) return;
    var lau = Math.min(1100, 620 + Math.abs(quang) * .35), bd = performance.now();
    khay.classList.add('dang-truot');
    (function buoc(bay) {
      var p = Math.min(1, (bay - bd) / lau), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      khay.scrollLeft = tu + quang * e;
      if (p < 1 && !tayCham) dangTruot = requestAnimationFrame(buoc);
      else { dangTruot = 0; khay.classList.remove('dang-truot'); }
    })(bd);
  }
  khay.addEventListener('touchstart', function () { tayCham = true; dung(); cancelAnimationFrame(dangTruot); khay.classList.remove('dang-truot'); }, {passive: true});
  khay.addEventListener('touchend', function () { tayCham = false; dem_lai(); }, {passive: true});
  function sang(i, khongTruot) {
    dang = (i + the.length) % the.length;
    the.forEach(function (t, j) { t.classList.toggle('sang', j === dang); });
    [].forEach.call(cham.children, function (b, j) { b.classList.toggle('on', j === dang); });
    var k = anhCua[dang];                       // thẻ không có ảnh thì giữ nguyên ảnh đang hiện
    if (k >= 0) dsAnh.forEach(function (im, j) { im.classList.toggle('hien-anh', j === k); });
    if (!khongTruot) truotToi(dang, true);
  }
  var henCuon;
  khay.addEventListener('scroll', function () {    // khách tự vuốt: dừng tay rồi thì thẻ nằm giữa khung thành thẻ sáng
    clearTimeout(henCuon);
    if (dangTruot) return;   // đang tự trượt thì không tính lại thẻ giữa
    henCuon = setTimeout(function () {
      if (tayCham) return;
      var giua = khay.scrollLeft + khay.clientWidth / 2, gan = 0, kc = 1e9;
      the.forEach(function (t, j) { var d = Math.abs(t.offsetLeft + t.offsetWidth / 2 - giua); if (d < kc) { kc = d; gan = j; } });
      if (gan !== dang) { sang(gan, true); dem_lai(); }
    }, 120);
  }, {passive: true});
  cham.addEventListener('click', function (ev) {
    var b = ev.target.closest('button'); if (!b) return;
    sang([].indexOf.call(cham.children, b)); dem_lai();
  });
  [].forEach.call(cham.children, function (b, j) { b.classList.toggle('on', j === 0); });
  function chay() { if (the.length > 1 && !GIAM && !tayCham) hen = setInterval(function () { sang(dang + 1); }, 4500); }
  function dung() { clearInterval(hen); hen = 0; }
  function dem_lai() { dung(); chay(); }   // rê vào thẻ nào thì thẻ đó sáng và đếm lại từ đầu
  muc.addEventListener('mouseover', function (ev) {
    var t = ev.target.closest('.cn-the');
    if (t && +t.dataset.cn !== dang) { sang(+t.dataset.cn); dem_lai(); }
  });
  document.addEventListener('visibilitychange', function () { document.hidden ? dung() : (hen || chay()); });
  chay();
})();

/* mở trang kèm #loai-… (từ menu lớn hoặc chân trang ở trang khác) → lọc sẵn đúng loại rồi cuộn tới lưới */
(function () {
  var m = /^#loai-(\w+)$/.exec(location.hash); if (!m || !LOAI[m[1]]) return;
  taiDuLieu.then(function () {
    chonLoai(m[1]);
    setTimeout(function () { cuonToi($('#san-pham')); }, 260);
  });
})();

/* ---------- video mục "Cách Ngọc Trầm chọn từng món" (chọn trong app › Nội dung trang) ----------
   Tự chạy lặp, không tiếng (autoplay để chắc chắn chạy); cuộn ra khỏi màn hình thì tạm dừng cho nhẹ máy. */
(function () {
  var ten = String((ND.van || {})['quy.video'] || '').replace(/[^\w.\/-]/g, '').replace(/\.\.+/g, '.').replace(/^\/+/, '');
  var o = $('#quyVideo'); if (!o) return;
  if (!ten) { o.remove(); $('#quyLuoi').classList.add('khong-video'); return; }
  var bia = 'video/' + ten.replace(/\.\w+$/, '') + '.jpg';
  o.hidden = false;
  o.innerHTML = '<video muted loop playsinline autoplay preload="metadata" poster="' + bia + '" aria-label="Video cửa hàng Ngọc Trầm">' +
    '<source src="video/' + ten + '" type="video/mp4"></video>';
  var v = o.querySelector('video');
  /* khung theo đúng khổ video: video vuông mà nhét vào khung dọc 9:16 thì bị cắt dải giữa rồi phóng gần gấp đôi → mềm */
  function datKhuon(w, h) { if (w && h) { o.style.aspectRatio = w + ' / ' + h; o.classList.toggle('vuong-k', w / h > .7); } }
  var maV = (/^sp\/(.+)\.mp4$/.exec(ten) || [])[1];
  if (maV) dsVideo.then(function (dsv) { (dsv || []).forEach(function (k) { if (k && String(k.ma) === maV) datKhuon(k.w, k.h); }); });
  v.addEventListener('loadedmetadata', function () { datKhuon(v.videoWidth, v.videoHeight); });
  /* món gắn với video: admin chọn (quy.ma) > mã lấy từ tên video sản phẩm sp/<mã>.mp4 */
  var maMon = String((ND.van || {})['quy.ma'] || ((/^sp\/(.+)\.mp4$/.exec(ten) || [])[1]) || '').trim();
  if (maMon) taiDuLieu.then(function () {
    var x = ds.filter(function (y) { return String(y.ma) === maMon || String(khoa(y)) === maMon; })[0]; if (!x) return;
    var a = document.createElement('a');
    a.className = 'quy-mon'; a.href = linkSp(x);
    a.innerHTML = '<small>Mã ' + e(x.ma) + ' · ' + LOAI[x.loai].ngan + '</small><b>' + e(x.ten.replace(/ mix charm.*/i, '')) + '</b>' +
      '<span>' + gia(x.gia) + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';
    o.appendChild(a);
  });
  if (GIAM) { v.removeAttribute('autoplay'); v.removeAttribute('loop'); v.controls = true; return; }   // giảm chuyển động: khách tự bấm xem
  new IntersectionObserver(function (es) {
    es.forEach(function (x) {
      if (x.isIntersecting) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      else v.pause();
    });
  }, {threshold: .25}).observe(o);
})();

/* =====================================================================
   HIỆU ỨNG TRANG CHỦ — ý từ thư viện lucianlabs, viết lại theo kiểu giấy · mực · vàng (CSS: css/trang-chu-hu.css)
   ===================================================================== */
var CO_CHUOT = matchMedia('(hover:hover) and (pointer:fine)').matches;

/* ---------- #216 + #357: tách tiêu đề hero thành từng từ (trồi lên lần lượt) và từng chữ (đậm lên gần chuột) ----------
   Chạy ngay lúc nạp trang, trước khi chung.js gắn .hien cho tiêu đề hero → không hiện hai lần. */
(function tachTieuDe() {
  var h = $('.hero .tieu-de'); if (!h) return;
  var k = 0, chuCai;
  try { chuCai = new RegExp('\\P{M}\\p{M}*', 'gu'); } catch (er) { chuCai = null; }
  var tachChu = function (w) { return chuCai ? (w.match(chuCai) || [w]) : Array.from ? Array.from(w) : w.split(''); };
  h.setAttribute('aria-label', $$('.hero .tieu-de .dong-chu').map(function (d) { return d.textContent.trim(); }).join(' ').replace(/\s+/g, ' ') || h.textContent.trim());
  function tach(node) {
    [].slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return; }
          var t = document.createElement('span'); t.className = 'tc-tu'; t.style.setProperty('--k', k++);
          t.innerHTML = tachChu(w).map(function (c) { return '<span class="tc-c">' + e(c) + '</span>'; }).join('');
          f.appendChild(t);
        });
        node.replaceChild(f, n);
      } else if (n.nodeType === 1) tach(n);
    });
  }
  $$('.hero .tieu-de .dong-chu').forEach(function (d) { d.setAttribute('aria-hidden', 'true'); tach(d.firstElementChild || d); });
  h.classList.add('tc-tach');
})();

/* #357: chữ gần con trỏ dày nét lên (viền chữ dày dần, bề rộng chữ giữ nguyên nên dòng không xô lệch) — chỉ máy có chuột */
(function dayChu() {
  var h = $('.hero .tieu-de'), hero = $('.hero'); if (!h || GIAM || !CO_CHUOT) return;
  var chu = $$('.hero .tieu-de .tc-c'), vt = [], cur = chu.map(function () { return 0; }), ptr = null, raf = 0, R = 150, can = true;
  function doViTri() {
    var r0 = h.getBoundingClientRect();
    vt = chu.map(function (c) { var r = c.getBoundingClientRect(); return [r.left + r.width / 2 - r0.left, r.top + r.height / 2 - r0.top]; });
    R = parseFloat(getComputedStyle(h).fontSize) * 1.6; can = false;
  }
  hero.addEventListener('pointerenter', function () { can = true; });
  addEventListener('resize', function () { can = true; });
  hero.addEventListener('pointermove', function (ev) {
    if (ev.pointerType && ev.pointerType !== 'mouse') return;
    if (can || performance.now() < 3500) doViTri();      // lúc chữ còn đang trồi lên thì đo lại mỗi lần
    var r0 = h.getBoundingClientRect(); ptr = [ev.clientX - r0.left, ev.clientY - r0.top]; chay();
  });
  hero.addEventListener('pointerleave', function () { ptr = null; chay(); });
  function chay() { if (!raf) raf = requestAnimationFrame(buoc); }
  function buoc() {
    raf = 0; var con = false;
    for (var i = 0; i < chu.length; i++) {
      var f = 0;
      if (ptr && vt[i]) { var dx = vt[i][0] - ptr[0], dy = (vt[i][1] - ptr[1]) * 1.3, d = Math.sqrt(dx * dx + dy * dy); f = d < R ? .5 + .5 * Math.cos(d / R * Math.PI) : 0; }
      var m = cur[i] + (f - cur[i]) * (ptr ? .16 : .08);
      if (Math.abs(m - f) < .004) m = f; else con = true;
      if (m !== cur[i]) { cur[i] = m; chu[i].style.setProperty('--sw', m.toFixed(3)); }
    }
    if (con) chay();
  }
})();

/* ---------- #263: ánh vàng trong chữ nhấn chỉ chảy khi tiêu đề đang trên màn hình ---------- */
(function () {
  if (GIAM || !window.IntersectionObserver) return;
  var io2 = new IntersectionObserver(function (es) { es.forEach(function (x) { x.target.classList.toggle('tc-thay', x.isIntersecting); }); });
  $$('.hero .tieu-de, .quy h2, .moi-tk h2, .chuyen .phong h2').forEach(function (h) { io2.observe(h); });
})();

/* ---------- #319 quầng sáng ngọc / vàng trôi nhẹ ở nền hero, một quầng theo chuột (trễ một nhịp) ---------- */
(function haoQuang() {
  var o = $('#tcHao'), hero = $('.hero'); if (!o) return;
  if (GIAM) { o.remove(); return; }
  var q = [].slice.call(o.children), W = 1, H = 1, t0 = performance.now(), mx = .5, my = .42, x = .5, y = .42, trong = true, raf = 0, last = 0;
  setTimeout(function () { o.classList.add('on'); }, 900);
  function kt() { W = hero.clientWidth; H = hero.clientHeight; }
  kt(); addEventListener('resize', kt);
  if (CO_CHUOT) {
    hero.addEventListener('pointermove', function (ev) { var r = hero.getBoundingClientRect(); mx = (ev.clientX - r.left) / W; my = (ev.clientY - r.top) / H; }, {passive: true});
    hero.addEventListener('pointerleave', function () { mx = .5; my = .42; });
  }
  function buoc(now) {
    raf = 0; if (!trong || document.hidden) return;
    if (!CO_CHUOT && now - last < 50) { raf = requestAnimationFrame(buoc); return; }   // điện thoại: chỉ trôi chậm, 20 hình/giây là đủ
    last = now;
    var t = (now - t0) / 1000;
    x += (mx - x) * .04; y += (my - y) * .04;
    var p = [
      [x + .05 * Math.sin(t * .21), y + .04 * Math.cos(t * .17)],
      [.24 + .12 * Math.sin(t * .11) + (x - .5) * .2, .66 + .1 * Math.cos(t * .09) + (y - .5) * .14],
      [.78 + .1 * Math.cos(t * .08) + (x - .5) * .14, .28 + .12 * Math.sin(t * .1) + (y - .5) * .12]];
    for (var i = 0; i < q.length; i++) q[i].style.transform = 'translate3d(' + (p[i][0] * W).toFixed(1) + 'px,' + (p[i][1] * H).toFixed(1) + 'px,0)';
    raf = requestAnimationFrame(buoc);
  }
  function batLai() { if (trong && !document.hidden && !raf) raf = requestAnimationFrame(buoc); }
  new IntersectionObserver(function (es) { trong = es[0].isIntersecting; batLai(); }).observe(hero);
  document.addEventListener('visibilitychange', batLai);
  batLai();
})();

/* ---------- #252 nhãn thông báo ở đầu trang: miễn ship (ngưỡng thật NGUONG_SHIP trong chung.js), có vệt sáng lướt ---------- */
(function nhanTin() {
  var a = $('#tcTin'); if (!a || typeof NGUONG_SHIP === 'undefined' || !NGUONG_SHIP) return;
  a.innerHTML = '<span class="tc-tin-cham"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/></svg></span>' +
    '<span>Miễn ship đơn từ <b>' + gia(NGUONG_SHIP) + '</b> · chuyển khoản trước</span>' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  a.setAttribute('aria-label', 'Miễn ship đơn từ ' + gia(NGUONG_SHIP) + ' khi chuyển khoản trước — xem chính sách giao hàng');
  a.hidden = false;
  a.addEventListener('click', function () { var d = document.getElementById('hd-giao'); if (d) d.open = true; });   // cuộn tới do chung.js lo
})();

/* ---------- #348 huy hiệu chữ chạy vòng tròn — rê chuột quay nhanh, rời ra chậm dần theo quán tính ---------- */
(function huyHieu() {
  var a = $('#tcHuy'); if (!a || GIAM) return;
  var s = a.querySelector('svg'), goc = 0, v = 14, dich = 14, trong = false, raf = 0, last = 0;
  a.addEventListener('pointerenter', function () { dich = 80; });
  a.addEventListener('pointerleave', function () { dich = 14; });
  function buoc(now) {
    raf = 0; if (!trong || document.hidden) return;
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    v += (dich - v) * Math.min(1, dt * (dich > v ? 4 : 1.4));
    goc = (goc + v * dt) % 360; s.style.transform = 'rotate(' + goc.toFixed(2) + 'deg)';
    raf = requestAnimationFrame(buoc);
  }
  function batLai() { if (trong && !document.hidden && !raf) { last = performance.now(); raf = requestAnimationFrame(buoc); } }
  new IntersectionObserver(function (es) { trong = es[0].isIntersecting; batLai(); }).observe(a);
  document.addEventListener('visibilitychange', batLai);
})();

/* ---------- #338 một từ tự lăn (hộp 3D) giữa các dòng sản phẩm thật — số món đếm từ kho, bấm là lọc luôn ---------- */
function dungLap() {
  var p = $('#tcDong'); if (!p) return;
  var dem = demLoai(), cac = THU_TU.filter(function (l) { return dem[l]; })
    .sort(function (a, b) { return dem[b] - dem[a]; })
    .map(function (l) { return {l: l, chu: dem[l] + ' ' + LOAI[l].ten.toLowerCase()}; });
  if (cac.length < 2) return;
  p.innerHTML = 'Đang có <span class="tc-lap" role="button" tabindex="0"><span class="tc-hop"><span class="tc-mat tc-truoc"></span><span class="tc-mat tc-tren" aria-hidden="true"></span></span><span class="tc-vach"></span></span>' +
    '<span class="tc-di">· bấm để xem</span>';
  p.hidden = false;
  var nut = p.querySelector('.tc-lap'), hop = nut.querySelector('.tc-hop'), truoc = hop.querySelector('.tc-truoc'), tren = hop.querySelector('.tc-tren');
  var n = 0, hen = 0, trong = false, re = false, TG = 3200;
  nut.style.setProperty('--tg', TG + 'ms');
  function dat(i) { truoc.textContent = cac[i].chu; nut.style.setProperty('--w', Math.ceil(truoc.offsetWidth + 2) + 'px'); nut.setAttribute('aria-label', 'Xem ' + cac[i].chu); }
  dat(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { dat(n); });
  function lan() {
    var k = (n + 1) % cac.length;
    tren.textContent = cac[k].chu;
    nut.style.setProperty('--w', Math.ceil(tren.offsetWidth + 2) + 'px');
    hop.classList.add('tc-lan');
    setTimeout(function () { n = k; dat(n); hop.classList.remove('tc-lan'); hen = 0; hen0(); }, 880);
  }
  function hen0() {
    clearTimeout(hen); nut.classList.remove('tc-chay');
    if (GIAM || !trong || re || document.hidden) return;
    void nut.offsetWidth; nut.classList.add('tc-chay');
    hen = setTimeout(lan, TG);
  }
  nut.addEventListener('click', function () { chonLoai(cac[n].l); cuonToi($('.loc') || $('#san-pham')); });
  nut.addEventListener('mouseenter', function () { re = true; clearTimeout(hen); });
  nut.addEventListener('mouseleave', function () { re = false; hen0(); });
  new IntersectionObserver(function (es) { trong = es[0].isIntersecting; if (trong) { if (!hen) hen0(); } else { clearTimeout(hen); hen = 0; } }).observe(p);
  document.addEventListener('visibilitychange', function () { clearTimeout(hen); hen = 0; hen0(); });
}

/* ---------- #310 video sản phẩm chạy bên trong dòng chữ nhấn của tiêu đề Liên hệ ("Nhắn cho Ngọc Trầm.") ----------
   Vẽ từng chữ lên canvas đúng vị trí chữ thật rồi đổ khung video vào trong nét chữ. Chữ thật vẫn nằm đó (trong suốt) để đọc / chọn được.
   Chỉ tải video khi cuộn gần tới; ra khỏi màn hình thì dừng. Video lỗi / không tự chạy được thì giữ nguyên chữ vàng. */
(function chuVideo() {
  var h2 = $('.lh .tren h2'), em = h2 && h2.querySelector('em');
  if (!em || GIAM || !window.IntersectionObserver || !document.createElement('canvas').getContext) return;
  Promise.all([dsVideo, taiDuLieu]).then(function (r) {
    var mon = (r[0] || []).map(function (v) { var m = String(v && typeof v === 'object' ? v.ma : v); return ds.filter(function (x) { return String(x.ma) === m; })[0]; }).filter(Boolean);
    var x = mon.filter(function (x) { return x.tt !== 'Đã bán' && /phi thuy/.test(boDau(x.ten)); })[0] || mon[0];
    if (!x) return;
    var io3 = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io3.disconnect();
      (function cho() { h2.classList.contains('hien') ? setTimeout(function () { batDau(String(x.ma)); }, 1300) : setTimeout(cho, 300); })();
    }, {rootMargin: '300px 0px'});
    io3.observe(h2);
  }).catch(function () {});

  function batDau(ma) {
    var v = document.createElement('video');
    v.className = 'tc-nguon'; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.src = 'video/sp/' + ma + '.mp4';
    h2.parentNode.appendChild(v);
    var cv = document.createElement('canvas'); cv.className = 'tc-chu-video'; cv.setAttribute('aria-hidden', 'true'); h2.appendChild(cv);
    var ctx = cv.getContext('2d'), dpr = 1, W = 0, H = 0, ky = [], font = '', hop = null, trong = true, raf = 0, last = 0, daBat = false;
    function doChu() {
      var r0 = h2.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1); W = r0.width; H = r0.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px';
      var cs = getComputedStyle(em); font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = font;
      var m = ctx.measureText('Nh'), asc = m.fontBoundingBoxAscent;
      ky = []; hop = {l: 1e9, t: 1e9, r: -1e9, b: -1e9};
      var rg = document.createRange(), w = document.createTreeWalker(em, NodeFilter.SHOW_TEXT), nd;
      while ((nd = w.nextNode())) {
        var s = nd.textContent, i = 0;
        while (i < s.length) {
          var c = s.charAt(i), j = i + 1;
          if (/[\ud800-\udbff]/.test(c)) j++;
          while (j < s.length && /[̀-ͯ]/.test(s.charAt(j))) j++;
          c = s.slice(i, j);
          if (!/^\s+$/.test(c)) {
            rg.setStart(nd, i); rg.setEnd(nd, j);
            var rr = rg.getClientRects()[0];
            if (rr && rr.width) {
              var bx = rr.left - r0.left, by = rr.top - r0.top;
              ky.push([c, bx, by + (asc || rr.height * .78)]);
              hop.l = Math.min(hop.l, bx); hop.t = Math.min(hop.t, by); hop.r = Math.max(hop.r, rr.right - r0.left); hop.b = Math.max(hop.b, rr.bottom - r0.top);
            }
          }
          i = j;
        }
      }
    }
    function ve() {
      if (!ky.length || !v.videoWidth) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
      ctx.font = font; ctx.fillStyle = '#fff';
      for (var i = 0; i < ky.length; i++) ctx.fillText(ky[i][0], ky[i][1], ky[i][2]);
      ctx.globalCompositeOperation = 'source-in';
      var bw = hop.r - hop.l, bh = hop.b - hop.t, sc = Math.max(bw / v.videoWidth, bh / v.videoHeight) * 1.05;
      ctx.drawImage(v, hop.l + (bw - v.videoWidth * sc) / 2, hop.t + (bh - v.videoHeight * sc) / 2, v.videoWidth * sc, v.videoHeight * sc);
      ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(209,173,102,.2)'; ctx.fillRect(0, 0, W, H);   // ánh vàng nhẹ cho hợp tông
    }
    function buoc(now) {
      raf = 0; if (!trong || document.hidden) return;
      if (now - last > 33) { last = now; ve(); }
      raf = requestAnimationFrame(buoc);
    }
    function chay() {
      if (!trong || document.hidden) { v.pause(); return; }
      var p = v.play(); if (p && p.catch) p.catch(function () {});
      if (!raf) raf = requestAnimationFrame(buoc);
    }
    v.addEventListener('playing', function () {
      if (daBat) return; daBat = true;
      ve(); cv.classList.add('on'); em.classList.add('tc-trong'); requestAnimationFrame(function () { em.classList.add('on'); });
    });
    var henDo;
    addEventListener('resize', function () { clearTimeout(henDo); henDo = setTimeout(function () { doChu(); ve(); }, 150); });
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      doChu();
      new IntersectionObserver(function (es) { trong = es[0].isIntersecting; chay(); }).observe(h2);
      document.addEventListener('visibilitychange', chay);
    });
  }
})();

/* ---------- #256 màn chờ đếm % — số chạy theo việc nạp thật (chữ, dữ liệu, ảnh đầu trang), tối đa ~1,2 giây ---------- */
(function manCho() {
  var nap = $('#tcNap'), g = document.documentElement;
  if (!nap) return;
  if (nap.hidden || !g.classList.contains('tc-cho')) { nap.remove(); return; }
  var so = nap.querySelector('.tc-nap-so b span'), vach = nap.querySelector('.tc-nap-vach i'), xong = {dom: 12}, hien = 0, ket = false;
  function dich() { if (performance.now() > 820) return 100; var t = 0; for (var k in xong) t += xong[k]; return Math.min(100, t); }
  var chuXong = function () { xong.chu = 23; };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(chuXong, chuXong); else chuXong();
  taiDuLieu.then(function () { xong.dl = 40; }, function () { xong.dl = 40; });
  Promise.resolve(dsVideo).then(function () { return taiDuLieu; }).then(function () {
    setTimeout(function () {
      var m = $('#chieu img, #chieu video'); if (!m) { xong.anh = 25; return; }
      var src = m.tagName === 'VIDEO' ? m.getAttribute('poster') : (m.currentSrc || m.src);
      var im = new Image(); im.referrerPolicy = 'no-referrer';
      im.onload = im.onerror = function () { xong.anh = 25; };
      im.src = src;
    }, 0);
  }).catch(function () { xong.anh = 25; });
  var truoc = performance.now();
  (function buoc() {
    if (ket) return;
    var bay = performance.now(), dt = Math.min(.1, (bay - truoc) / 1000), d = dich(), nhanh = bay > 820; truoc = bay;
    if (hien < d) hien = Math.min(d, hien + (d - hien) * (1 - Math.exp(-dt * (nhanh ? 16 : 7))) + dt * (nhanh ? 70 : 18));   // theo thời gian thật, không theo số khung hình
    so.textContent = Math.floor(hien); vach.style.setProperty('--p', (hien / 100).toFixed(3));
    if (hien >= 99.5) { so.textContent = '100'; vach.style.setProperty('--p', 1); setTimeout(mo, 120); return; }
    requestAnimationFrame(buoc);
  })();
  function mo() {
    if (ket) return; ket = true;
    g.classList.add('tc-mo'); g.classList.remove('tc-cho');
    setTimeout(function () { nap.remove(); }, 1000);
  }
})();
