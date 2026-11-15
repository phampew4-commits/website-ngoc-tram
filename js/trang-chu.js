/* ---------- dữ liệu ---------- */
/* món nào có video (video/sp/<mã>.mp4) — danh sách do app ghi lại mỗi lần đăng web */
var dsVideo = fetch('video/sp/ds.json', {cache: 'no-cache'}).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });

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
function dungHero() { dsVideo.then(function (vids) { dungHeroVoi(vids || []); }); }
/* Trình chiếu đầu trang dạng ô — màn ngang (máy tính): 3 ô mỗi slide, màn dọc (điện thoại): 1 ô.
   Ô có video (video/sp/<mã>.mp4) thì chạy video, không có thì hiện ảnh. Tên + giá nằm trong từng ô, bấm là mở món. */
function dungHeroVoi(vids) {
  var kt = {};   // mã → {w, h} (ds.json mới) — vẫn đọc được dạng cũ chỉ có mã
  vids.forEach(function (v) { if (v && typeof v === 'object') kt[String(v.ma)] = v; else kt[String(v)] = {ma: String(v)}; });
  var coVid = function (x) { return !!kt[String(x.ma)]; };
  var doc = function (x) { var k = kt[String(x.ma)]; return !!(k && k.h && k.w && k.h / k.w >= 1.5); };   // video dọc: khít ô, nét nhất
  var cheDo = ND.heroCheDo || ((ND.heroAnh || []).length ? 'tay' : 'gia');
  var chonVid = (cheDo === 'tay' && ND.heroVid) || {};
  var vidCua = function (x) {   // admin chọn riêng > video của chính món > không có (hiện ảnh)
    var v = String(chonVid[x.ma] || '').replace(/[^\w.\/-]/g, '').replace(/\.\.+/g, '.');
    return v || (coVid(x) ? 'sp/' + x.ma + '.mp4' : '');
  };
  var tron = function (a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var soAnh = Math.min(6, Math.max(2, +ND.heroSo || 4)), soMon = Math.max(3, Math.ceil(soAnh / 3) * 3);   // tròn bội 3 cho đủ ô
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
  var dem = demLoai();
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
  function truotToi(i, muot) {
    if (!laTruot()) return;
    var t = the[i];
    khay.scrollTo({left: t.offsetLeft - (khay.clientWidth - t.offsetWidth) / 2, behavior: muot ? 'smooth' : 'auto'});
  }
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
    henCuon = setTimeout(function () {
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
  function chay() { if (the.length > 1 && !GIAM) hen = setInterval(function () { sang(dang + 1); }, 4500); }
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
