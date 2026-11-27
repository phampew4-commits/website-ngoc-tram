/* =========================================================
   CỬA HÀNG (cua-hang.html) + QUÀ TẶNG (qua-tang.html)
   Lọc theo loại / dòng ngọc / mức giá / vàng — chọn nhiều trong một nhóm (hoặc),
   các nhóm cộng dồn (và). Bộ lọc ghi lên địa chỉ trang (?loai=chuoi&gia=3-7…) để gửi link cho nhau.
   27/11/2026 — thêm chuyển động theo ý lucianlabs (css/cua-hang-hu.css):
   #292/#317 thẻ trượt về chỗ mới khi lọc / sắp xếp · #308 xem lưới ↔ danh sách · #024 biểu đồ giá hai đầu kéo (?khoang=)
   #305 ngăn lọc điện thoại đếm ngay · #242 thanh loại bám đầu trang · #039 viên chọn trượt · #043 "Xem thêm" có tiến độ
   #079/#439 khung chờ có ánh lướt · #092 không có kết quả → gợi ý nới lọc · #322 dòng tìm nhanh tự cuộn
   #050 thẻ nghiêng nhẹ + ánh · #366 rê ngang trên ảnh xem các ảnh khác · #342 hộp quà mở nắp (quà tặng)
   ========================================================= */
var MUC_GIA = [
  {k: 'duoi-1', ten: 'Dưới 1 triệu', tu: 0, den: 1e6},
  {k: '1-3', ten: '1 – 3 triệu', tu: 1e6, den: 3e6},
  {k: '3-7', ten: '3 – 7 triệu', tu: 3e6, den: 7e6},
  {k: '7-12', ten: '7 – 12 triệu', tu: 7e6, den: 12e6},
  {k: 'tren-12', ten: 'Trên 12 triệu', tu: 12e6, den: Infinity}
];
var VANG = ['14K', '18K', '24K'];
function vangCua(x) { var m = /vàng\s*(\d\dK)/i.exec(x.ten + ' ' + (x.mo_ta || '')); return m ? m[1].toUpperCase() : ''; }
function giaKhop(x, k) { var g = MUC_GIA.filter(function (m) { return m.k === k; })[0]; return g && x.gia >= g.tu && x.gia < g.den; }
var conTrenWeb = function () { return ds.filter(function (x) { return x.tt !== 'Đã bán'; }); };

/* ---------- đồ dùng chung cho hiệu ứng ---------- */
var CH_EASE = 'cubic-bezier(.16,1,.3,1)';
function tienGon(v) {   // 1250000 → "1,3 triệu" · 850000 → "850 nghìn"
  if (v >= 1e6) return String(Math.round(v / 1e5) / 10).replace('.', ',') + ' triệu';
  return Math.round(v / 1e3) + ' nghìn';
}
/* số lăn (#292/#305/#024): số cũ trượt đi, số mới trượt vào */
function lanSo(el, n) {
  if (!el) return;
  n = String(n); var cu = el._n; if (cu === n) return; el._n = n;
  if (cu == null || GIAM || !el.animate) { el.textContent = n; return; }
  var len = (+n || 0) > (+cu || 0) ? 1 : -1, tk = el._tk = (el._tk || 0) + 1;
  el.classList.add('ch-lan');
  el.innerHTML = '<span class="lan-cu">' + e(cu) + '</span><span class="lan-moi">' + e(n) + '</span>';
  el.firstChild.animate([{transform: 'none', opacity: 1}, {transform: 'translateY(' + (-len * 100) + '%)', opacity: 0}], {duration: 380, easing: CH_EASE, fill: 'forwards'});
  el.lastChild.animate([{transform: 'translateY(' + (len * 100) + '%)', opacity: 0}, {transform: 'none', opacity: 1}], {duration: 460, easing: CH_EASE})
    .onfinish = function () { if (el._tk === tk) el.textContent = n; };
}
/* viên chọn trượt (#039): khung nằm tuyệt đối trong hộp chứa, cạnh phía trước vươn tới trước rồi cạnh sau mới theo kịp */
function truotVien(v, el, tucThi) {
  if (!v || !el) { if (v) v.classList.remove('co'); return; }
  var l = 0, t = 0, x = el, hop = v.offsetParent;   // cộng dồn offset tới hộp chứa (ô cha đang chạy hiệu ứng cũng thành offsetParent)
  while (x && x !== hop) { l += x.offsetLeft; t += x.offsetTop; x = x.offsetParent; }
  var n = {l: l, t: t, w: el.offsetWidth, h: el.offsetHeight}, c = v._v;
  v.style.left = n.l + 'px'; v.style.top = n.t + 'px'; v.style.width = n.w + 'px'; v.style.height = n.h + 'px';
  v._v = n; v.classList.add('co');
  if (!c || tucThi || GIAM || !v.animate || (c.l === n.l && c.t === n.t && c.w === n.w)) return;
  var giua = function (a0, a1, b0, b1) {   // a = cạnh đầu, b = cạnh cuối theo một trục
    var di = a1 > a0 || b1 > b0, mA = di ? .15 : .8, mB = di ? .8 : .15;
    return [a0 + (a1 - a0) * mA, b0 + (b1 - b0) * mB];
  };
  var x = giua(c.l, n.l, c.l + c.w, n.l + n.w), y = giua(c.t, n.t, c.t + c.h, n.t + n.h);
  v.animate([
    {left: c.l + 'px', width: c.w + 'px', top: c.t + 'px', height: c.h + 'px'},
    {left: x[0] + 'px', width: (x[1] - x[0]) + 'px', top: y[0] + 'px', height: (y[1] - y[0]) + 'px', offset: .45},
    {left: n.l + 'px', width: n.w + 'px', top: n.t + 'px', height: n.h + 'px'}
  ], {duration: 620, easing: 'cubic-bezier(.45,0,.2,1)'});
}
/* khung xám chờ dữ liệu (#079/#439) */
function theXuong(n) {
  var s = '';
  for (var i = 0; i < n; i++) s += '<div class="sp ch-xuong" aria-hidden="true"><div class="h"></div><span class="x1"></span><span class="x2"></span></div>';
  return s;
}
/* ảnh thẻ: chờ tải thì ánh lướt, tải xong thì từ mờ sang nét (#079) */
function choAnh(goc) {
  if (!goc) return;
  [].forEach.call(goc.querySelectorAll('.sp:not(.ch-xuong) .h > img:not(.sau):not(.ch-them)'), function (im) {
    if (im._cho) return; im._cho = 1;
    if (im.complete && im.naturalWidth) return;
    var h = im.parentNode; h.classList.add('cho');
    var xong = function () { h.classList.remove('cho'); };
    im.addEventListener('load', xong, {once: true}); im.addEventListener('error', xong, {once: true});
  });
}

/* ================= CỬA HÀNG ================= */
if (document.body.dataset.trang === 'cua-hang') (function () {
  var NHOM = {
    loai: {ds: function () { return THU_TU.map(function (l) { return {v: l, ten: LOAI[l].ten}; }); }, khop: function (x, v) { return x.loai === v; }},
    ngoc: {ds: function () { return NGOC_TIM.map(function (t) { return {v: slug(t), ten: t}; }); }, khop: function (x, v) { return ngocCua(x).map(slug).indexOf(v) >= 0; }},
    gia: {ds: function () { return MUC_GIA.map(function (m) { return {v: m.k, ten: m.ten}; }); }, khop: giaKhop},
    vang: {ds: function () { return VANG.map(function (v) { return {v: v.toLowerCase(), ten: 'Vàng ' + v}; }); }, khop: function (x, v) { return vangCua(x).toLowerCase() === v; }}
  };
  var chon = {loai: [], ngoc: [], gia: [], vang: []}, sxCh = 'moi', tuCh = '', hienCh = 0, MOI = 24;
  var khoang = null;   // khoảng giá kéo trên biểu đồ [từ, đến] (đồng) — thay cho ô "Mức giá" khi khách kéo
  var luoi = $('#chLuoi'), dauH = function () { return ($('#dau') || {}).offsetHeight || 68; };

  /* đọc bộ lọc từ địa chỉ trang */
  var q = new URLSearchParams(location.search);
  Object.keys(chon).forEach(function (k) { chon[k] = (q.get(k) || '').split(',').filter(Boolean); });
  if (q.get('sx')) sxCh = q.get('sx');
  if (q.get('q')) { tuCh = q.get('q'); $('#chTim').value = tuCh; }
  var mk = /^(\d+)-(\d+)$/.exec(q.get('khoang') || '');
  if (mk && +mk[2] >= +mk[1]) { khoang = [+mk[1] * 1e3, +mk[2] * 1e3]; chon.gia = []; }
  $('#chSx').value = sxCh;

  /* khung chờ trong lúc tải dữ liệu */
  if (!ds.length) {
    luoi.innerHTML = theXuong(6);
    $('#chDm').innerHTML = Array(6).join('<span class="dm-o ch-xuong-dm" aria-hidden="true"><span class="h"></span><b></b><small></small></span>') + '<span class="dm-o ch-xuong-dm" aria-hidden="true"><span class="h"></span><b></b><small></small></span>';
  }

  function ghiDiaChi() {
    var p = new URLSearchParams();
    Object.keys(chon).forEach(function (k) { if (chon[k].length) p.set(k, chon[k].join(',')); });
    if (khoang) p.set('khoang', Math.round(khoang[0] / 1e3) + '-' + Math.round(khoang[1] / 1e3));
    if (tuCh) p.set('q', tuCh);
    if (sxCh !== 'moi') p.set('sx', sxCh);
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }
  function trongKhoang(x, kh) { return x.gia >= kh[0] && x.gia <= kh[1]; }
  function qua(x, boQua) {   // món có khớp mọi nhóm (trừ nhóm boQua — để đếm số món cho từng ô lọc)
    for (var k in chon) {
      if (k === boQua || !chon[k].length) continue;
      if (!chon[k].some(function (v) { return NHOM[k].khop(x, v); })) return false;
    }
    if (khoang && boQua !== 'gia' && !trongKhoang(x, khoang)) return false;
    return !tuCh || boDau(x.ten + ' ' + x.ma + ' ' + (x.mo_ta || '')).indexOf(boDau(tuCh)) >= 0;
  }
  function ketQua() {
    var r = conTrenWeb().filter(function (x) { return qua(x); });
    var uu = function (x) { return x.loai === 'charm' && !chon.loai.length ? 1 : 0; };   // xem tất cả: charm xếp sau
    r.sort(function (a, b) {
      if (sxCh === 'tang') return (a.gia || 9e15) - (b.gia || 9e15);
      if (sxCh === 'giam') return b.gia - a.gia;
      return uu(a) - uu(b) || ngaySo(b.ngay) - ngaySo(a.ngay) || b.gia - a.gia;
    });
    return r;
  }
  function veLoc() {
    var tat = conTrenWeb();
    $$('.ch-o').forEach(function (o) {
      var k = o.dataset.nhom;
      o.innerHTML = NHOM[k].ds().map(function (m) {
        var n = tat.filter(function (x) { return qua(x, k) && NHOM[k].khop(x, m.v); }).length, on = chon[k].indexOf(m.v) >= 0;
        if (!n && !on) return '';
        return '<button type="button" class="o-loc' + (on ? ' on' : '') + '" data-k="' + k + '" data-v="' + e(m.v) + '" aria-pressed="' + on + '">' +
          '<span class="hop"></span>' + e(m.ten) + '<i>' + n + '</i></button>';
      }).join('') || '<p class="ch-trong">Không có lựa chọn</p>';
    });
    var so = Object.keys(chon).reduce(function (s, k) { return s + chon[k].length; }, 0) + (khoang ? 1 : 0);
    $('#chSoLoc').hidden = !so; $('#chSoLoc').textContent = so;
    $('#chChip').innerHTML = Object.keys(chon).map(function (k) {
      return chon[k].map(function (v) {
        var m = NHOM[k].ds().filter(function (y) { return y.v === v; })[0];
        return m ? '<button type="button" class="chip-loc" data-k="' + k + '" data-v="' + e(v) + '">' + e(m.ten) + '<span aria-hidden="true">×</span></button>' : '';
      }).join('');
    }).join('') + (khoang ? '<button type="button" class="chip-loc" data-k="khoang" data-v="">Giá ' + tienGon(khoang[0]) + ' – ' + tienGon(khoang[1]) + '<span aria-hidden="true">×</span></button>' : '') +
      (so ? '<button type="button" class="chip-xoa" id="chXoaChip">Xoá tất cả</button>' : '');
    BD.ve();
  }
  function tieuDe() {   // tiêu đề đổi theo bộ lọc: chọn đúng một loại thì hiện tên loại
    var t = chon.loai.length === 1 ? LOAI[chon.loai[0]].ten : chon.ngoc.length === 1 ? NHOM.ngoc.ds().filter(function (m) { return m.v === chon.ngoc[0]; }).map(function (m) { return m.ten; })[0] : '';
    $('#chTieu').innerHTML = '<span class="dong-chu"><span>' + (t ? '<em>' + e(t) + '</em>' : 'Tất cả <em>sản phẩm</em>') + '</span></span>';
    document.title = (t || 'Cửa hàng') + ' · Ngọc Trầm Store';
    $('#chDuong').textContent = t || 'Cửa hàng';
    $$('#chDm .dm-o').forEach(function (o) {   // ô danh mục đang chọn
      var l = o.dataset.loai;
      o.classList.toggle('on', l ? chon.loai.length === 1 && chon.loai[0] === l : !chon.loai.length);
    });
    var on = $('#chDm .dm-o.on .h'); $('#chDm').classList.toggle('co-vong', !!on);
    truotVien($('#chDmVong'), on);
  }
  function veDm() {   // hàng ô danh mục tròn: ảnh món mới nhất của từng loại
    var tat = conTrenWeb(), dem = {};
    tat.forEach(function (x) { dem[x.loai] = (dem[x.loai] || 0) + 1; });
    var anhCua = function (l) {
      var r = tat.filter(function (x) { return (!l ? x.loai !== 'charm' : x.loai === l) && x.anh && x.anh[0]; })
        .sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay); })[0];
      return r ? hinh(r.anh[0], '', 300) : '';
    };
    var o = [{l: '', ten: 'Tất cả', n: tat.length}].concat(THU_TU.filter(function (l) { return dem[l]; }).map(function (l) {
      return {l: l, ten: LOAI[l].ten, n: dem[l]};
    }));
    $('#chDm').innerHTML = o.map(function (o, i) {
      return '<button type="button" class="dm-o" role="listitem" data-loai="' + o.l + '" style="--i:' + i + '"><span class="h">' + anhCua(o.l) + '</span>' +
        '<b>' + e(o.ten) + '</b><small>' + o.n + ' món</small></button>';
    }).join('') + '<span class="ch-dm-vong" id="chDmVong" aria-hidden="true"></span>';
    $('#chDm').onclick = function (ev) {
      var b = ev.target.closest('.dm-o'); if (!b) return;
      chonLoai(b.dataset.loai);
    };
    BAM.dung(o);
  }
  function chonLoai(l) {   // bấm ô danh mục / chip thanh bám: chọn đúng một loại (bấm lại thì bỏ)
    chon.loai = !l || (chon.loai.length === 1 && chon.loai[0] === l) ? [] : [l];
    doi();
    var t = $('.ch-thanh'); if (!t) return;
    var y = t.getBoundingClientRect().top;
    if (y > innerHeight * .8) cuonToi(t);
    else if (y < dauH()) {   // đang ở sâu trong lưới (bấm từ thanh bám): về đầu lưới, chừa chỗ cho thanh bám
      var b = $('#chBam'), du = b && b.classList.contains('hien') ? b.offsetHeight : 0;
      scrollTo({top: Math.max(0, scrollY + y - dauH() - du - 8), behavior: GIAM ? 'auto' : 'smooth'});
    }
  }

  /* ---------- #092 không có kết quả: thử bỏ từng bộ lọc, đếm thật số món sẽ có ---------- */
  function demKhi(sua) {
    var c = {}, kh = khoang, t = tuCh;
    Object.keys(chon).forEach(function (k) { c[k] = chon[k].slice(); });
    sua(); var n = ketQua().length;
    chon = c; khoang = kh; tuCh = t;
    return n;
  }
  function goiNoi() {
    var bo = [];
    Object.keys(chon).forEach(function (k) {
      chon[k].forEach(function (v) {
        var m = NHOM[k].ds().filter(function (y) { return y.v === v; })[0];
        bo.push({k: k, v: v, ten: m ? m.ten : v, n: demKhi(function () { chon[k] = chon[k].filter(function (y) { return y !== v; }); })});
      });
    });
    if (khoang) bo.push({k: 'khoang', v: '', ten: 'Giá ' + tienGon(khoang[0]) + ' – ' + tienGon(khoang[1]), n: demKhi(function () { khoang = null; })});
    if (tuCh) bo.push({k: 'q', v: '', ten: '“' + tuCh + '”', n: demKhi(function () { tuCh = ''; })});
    bo = bo.filter(function (b) { return b.n > 0; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 4);
    return bo.length ? '<p class="ch-noi-dau">Thử nới bớt một bộ lọc:</p><div class="ch-noi">' + bo.map(function (b, i) {
      return '<button type="button" class="ch-noi-o" data-bo-k="' + b.k + '" data-bo-v="' + e(b.v) + '" style="--i:' + i + '">Bỏ <b>' + e(b.ten) + '</b><i>' + b.n + ' món</i></button>';
    }).join('') + '</div>' : '';
  }

  function veLuoi(lai) {
    var r = ketQua(), l = luoi;
    if (lai) { hienCh = 0; l.innerHTML = ''; }
    if (!$('#chSo .ch-so-n')) $('#chSo').innerHTML = '<b class="ch-so-n"></b> món';
    lanSo($('#chSo .ch-so-n'), r.length);
    $('#chTong').textContent = r.length;
    var xk = $('#chXemKq');
    if (!xk.querySelector('.ch-so-n')) xk.innerHTML = '<span class="ch-xk-co">Xem <b class="ch-so-n"></b> món</span><span class="ch-xk-khong">Chưa có món khớp</span>';
    lanSo(xk.querySelector('.ch-so-n'), r.length);
    xk.classList.toggle('khong', !r.length); xk.disabled = !r.length;
    BAM.so(r.length);
    if (!r.length) {
      l.innerHTML = '<div class="rong ch-rong"><span class="ch-kinh" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="21" cy="21" r="12"/><path d="M30 30l9 9"/><path class="lo" d="M14.5 17.5a8 8 0 0 1 5-4.5"/></svg></span>' +
        '<p>Chưa có món nào khớp bộ lọc này.</p>' + goiNoi() +
        '<div class="ch-rong-nut"><button type="button" class="nut" data-xoa-loc>Xoá bộ lọc</button>' +
        ' <a class="nut dac" href="' + linkZalo() + '" target="_blank" rel="noopener">Nhờ cửa hàng tìm giúp</a></div></div>';
      $('#chThem').hidden = true; veTien(0, 0); return;
    }
    var moi = r.slice(hienCh, hienCh + MOI); hienCh += moi.length;
    l.insertAdjacentHTML('beforeend', moi.map(the).join('')); themMoTa(l); theoDoi(l); choAnh(l);
    $('#chThem').hidden = hienCh >= r.length;
    $('#chThem').innerHTML = 'Xem thêm · <b class="ch-so-n">' + (r.length - hienCh) + '</b> món';
    veTien(hienCh, r.length);
  }
  /* #043 "Xem thêm": vạch tiến độ đã xem bao nhiêu / tổng */
  function veTien(da, tong) {
    var t = $('#chTien');
    if (!t) { $('#chThem').parentNode.insertAdjacentHTML('beforeend', '<div class="ch-tien" id="chTien"><span>Đã xem <b class="ch-so-n"></b> / <i></i> món</span><em><u></u></em></div>'); t = $('#chTien'); }
    t.hidden = !tong || da >= tong;
    lanSo(t.querySelector('b'), da); t.querySelector('i').textContent = tong;
    t.querySelector('u').style.transform = 'scaleX(' + (tong ? da / tong : 0) + ')';
  }
  /* mô tả ngắn — chỉ hiện ở kiểu xem danh sách (#308) */
  function themMoTa(goc) {
    var map = {}; ds.forEach(function (x) { map[khoa(x)] = x; });
    [].forEach.call(goc.querySelectorAll('.sp[data-k]:not(.co-mt)'), function (c) {
      var x = map[c.dataset.k]; c.classList.add('co-mt'); if (!x) return;
      var mt = String(x.mo_ta || '').replace(/\s+/g, ' ').trim(); if (mt.length > 150) mt = mt.slice(0, 147).replace(/\s\S*$/, '') + '…';
      var nh = nhanSp(x), ln = LOAI[x.loai] || {ten: '', ngan: ''};   // "Chuỗi mix charm · 18K" — không lặp tên loại
      nh = nh.indexOf(ln.ngan) === 0 ? ln.ten + nh.slice(ln.ngan.length) : ln.ten + ' · ' + nh;
      c.insertAdjacentHTML('beforeend', '<div class="ch-mt"><span>' + e(nh) + '</span><p>' + (mt ? e(mt) : 'Mỗi món chỉ có một — ảnh chụp chính món này.') + '</p></div>');
    });
  }

  /* ---------- #292 / #317: món giữ lại trượt về chỗ mới, món bị lọc thu nhỏ mờ đi, món mới nở ra ---------- */
  function chup() {
    if (GIAM || !luoi.animate) return null;
    var m = {}, vh = innerHeight, co = 0;
    [].forEach.call(luoi.children, function (c) {
      if (!c.dataset.k || c.classList.contains('ch-ma')) return;
      var r = c.getBoundingClientRect(); if (r.bottom < -300 || r.top > vh + 300) return;
      m[c.dataset.k] = {r: r, el: c}; co = 1;
    });
    return co ? m : null;
  }
  function choi(truoc, kieu) {
    if (!truoc) return;
    var g = luoi.getBoundingClientRect(), vh = innerHeight, j = 0, con = {};
    [].forEach.call(luoi.querySelectorAll(':scope > .sp[data-k]'), function (c) {
      var k = c.dataset.k, t = truoc[k], r = c.getBoundingClientRect(); con[k] = 1;
      var trong = r.bottom > 0 && r.top < vh;
      if (t) {
        c.classList.add('hien');
        var dx = t.r.left - r.left, dy = t.r.top - r.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        if (!trong && !(t.r.bottom > 0 && t.r.top < vh)) return;
        var s = kieu === 'sx' ? (dy < 0 ? 1.03 : .97) : 1;   // sắp xếp: món đi lên nhô ra một chút, món đi xuống lùi vào
        if (s > 1) c.style.zIndex = 2;
        c.animate([{transform: 'translate(' + dx + 'px,' + dy + 'px)'},
          {transform: 'translate(' + dx * .45 + 'px,' + dy * .45 + 'px) scale(' + s + ')', offset: .5},
          {transform: 'none'}], {duration: 680, easing: 'cubic-bezier(.3,.7,.2,1)'}).onfinish = function () { c.style.zIndex = ''; };
      } else if (trong) {
        c.classList.add('hien');
        c.animate([{opacity: 0, transform: 'scale(.9)'}, {opacity: 1, transform: 'none'}],
          {duration: 560, delay: 160 + Math.min(j++, 8) * 45, easing: CH_EASE, fill: 'backwards'});
      }
    });
    Object.keys(truoc).forEach(function (k) {   // món không còn khớp: giữ bóng ở chỗ cũ, thu nhỏ rồi biến mất
      if (con[k]) return; var t = truoc[k];
      if (t.r.bottom < 0 || t.r.top > vh) return;
      var b = t.el; b.classList.add('ch-ma'); b.setAttribute('aria-hidden', 'true'); b.removeAttribute('tabindex');
      b.style.cssText = 'position:absolute;left:' + (t.r.left - g.left) + 'px;top:' + (t.r.top - g.top) + 'px;width:' + t.r.width + 'px;height:' + t.r.height + 'px;margin:0;pointer-events:none;z-index:0';
      luoi.appendChild(b);
      b.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'scale(.82)'}], {duration: 420, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards'})
        .onfinish = function () { b.remove(); };
    });
  }
  function doi() { var t = chup(); ghiDiaChi(); veLoc(); tieuDe(); veLuoi(true); choi(t, 'loc'); BAM.capNhat(); GOI.ve(); }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('.o-loc,.chip-loc');
    if (b) {
      if (b.dataset.k === 'khoang') { khoang = null; doi(); return; }
      var a = chon[b.dataset.k], i = a.indexOf(b.dataset.v);
      if (i >= 0) a.splice(i, 1); else a.push(b.dataset.v);
      if (b.dataset.k === 'gia') khoang = null;
      doi(); return;
    }
    var n = ev.target.closest('.ch-noi-o');
    if (n) {
      var k = n.dataset.boK;
      if (k === 'khoang') khoang = null;
      else if (k === 'q') { tuCh = ''; $('#chTim').value = ''; }
      else chon[k] = chon[k].filter(function (y) { return y !== n.dataset.boV; });
      doi(); return;
    }
    if (ev.target.closest('#chXoaChip,#chXoaLoc,[data-xoa-loc]')) { Object.keys(chon).forEach(function (k) { chon[k] = []; }); khoang = null; tuCh = ''; $('#chTim').value = ''; doi(); return; }
  });
  var henTim; $('#chTim').oninput = function () { var v = this.value; clearTimeout(henTim); henTim = setTimeout(function () { tuCh = v.trim(); doi(); }, 200); };
  $('#chSx').onchange = function () { var t = chup(); sxCh = this.value; ghiDiaChi(); veLuoi(true); choi(t, 'sx'); };
  $('#chThem').onclick = function () { veLuoi(false); };

  /* ---------- #024 biểu đồ giá hai đầu kéo (thang log — giá trải từ vài trăm nghìn tới gần trăm triệu) ---------- */
  var BD = (function () {
    var nhom = $('.ch-o[data-nhom="gia"]'), goc, LO, HI, lnLO, lnHI, SO = 26, keo = null, cot = [];
    function gia(p) {   // vị trí 0…1000 → giá (làm tròn cho dễ đọc)
      if (p <= 0) return LO; if (p >= 1000) return HI;
      var v = Math.exp(lnLO + p / 1000 * (lnHI - lnLO)), b = v < 1e6 ? 5e4 : v < 1e7 ? 1e5 : 5e5;
      return Math.round(v / b) * b;
    }
    function viTri(v) { return Math.max(0, Math.min(1000, Math.round((Math.log(Math.max(v, 1)) - lnLO) / (lnHI - lnLO) * 1000))); }
    function dung() {
      var g = conTrenWeb().map(function (x) { return x.gia; }).filter(Boolean);
      if (g.length < 4 || !nhom) return false;
      LO = Math.max(5e4, Math.floor(Math.min.apply(0, g) / 5e4) * 5e4); HI = Math.ceil(Math.max.apply(0, g) / 1e6) * 1e6;
      lnLO = Math.log(LO); lnHI = Math.log(HI);
      for (var i = 0; i < SO; i++) cot.push(Math.exp(lnLO + (i + .5) / SO * (lnHI - lnLO)));
      nhom.insertAdjacentHTML('beforebegin', '<div class="ch-bd" id="chBd"><div class="ch-bd-dau"><span class="ch-bd-gia"></span><span class="ch-bd-so"><b class="ch-so-n"></b> món</span></div>' +
        '<div class="ch-bd-cot" aria-hidden="true">' + cot.map(function () { return '<i></i>'; }).join('') + '</div>' +
        '<div class="ch-bd-ray"><span class="ray"><span class="chon"></span></span>' +
        '<input type="range" min="0" max="1000" step="1" aria-label="Giá thấp nhất" data-dau="0"><input type="range" min="0" max="1000" step="1" aria-label="Giá cao nhất" data-dau="1"></div>' +
        '<div class="ch-bd-thang" aria-hidden="true"><span>' + tienGon(LO) + '</span><span>' + tienGon(HI) + '</span></div></div>');
      goc = $('#chBd');
      var ins = goc.querySelectorAll('input');
      [].forEach.call(ins, function (inp) {
        inp.addEventListener('input', function () {
          var a = +ins[0].value, b = +ins[1].value;
          if (a > b) { if (inp === ins[0]) ins[0].value = a = b; else ins[1].value = b = a; }
          keo = [a, b]; goc.classList.add('keo'); hien();
        });
        inp.addEventListener('change', function () {
          var a = +ins[0].value, b = +ins[1].value; keo = null; goc.classList.remove('keo');
          khoang = a <= 0 && b >= 1000 ? null : [gia(a), gia(b)];
          if (khoang) chon.gia = [];
          doi();
        });
      });
      return true;
    }
    function hien() {   // vẽ cột + nhãn theo khoảng đang chọn (hoặc đang kéo)
      if (!goc) return;
      var ins = goc.querySelectorAll('input'), a, b, khop;
      if (keo) { a = keo[0]; b = keo[1]; var kh = [gia(a), gia(b)]; khop = function (v) { return v >= kh[0] && v <= kh[1]; }; }
      else if (khoang) { a = viTri(khoang[0]); b = viTri(khoang[1]); khop = function (v) { return v >= khoang[0] && v <= khoang[1]; }; }
      else if (chon.gia.length) {
        var ms = MUC_GIA.filter(function (m) { return chon.gia.indexOf(m.k) >= 0; });
        a = viTri(Math.min.apply(0, ms.map(function (m) { return m.tu; }))); b = viTri(Math.min(HI, Math.max.apply(0, ms.map(function (m) { return m.den; }))));
        khop = function (v) { return ms.some(function (m) { return v >= m.tu && v < m.den; }); };
      } else { a = 0; b = 1000; khop = function () { return true; }; }
      if (!keo) { ins[0].value = a; ins[1].value = b; }
      ins[0].style.zIndex = a > 900 ? 3 : 2;
      ins[0].setAttribute('aria-valuetext', tienGon(gia(a))); ins[1].setAttribute('aria-valuetext', tienGon(gia(b)));
      goc.querySelector('.chon').style.cssText = 'left:' + a / 10 + '%;right:' + (100 - b / 10) + '%';
      goc.querySelector('.ch-bd-gia').textContent = a <= 0 && b >= 1000 ? 'Mọi mức giá' : tienGon(gia(a)) + ' – ' + tienGon(gia(b));
      /* chiều cao cột = số món mỗi khoảng (theo các bộ lọc khác) */
      var mon = conTrenWeb().filter(function (x) { return x.gia && qua(x, 'gia'); }), dem = cot.map(function () { return 0; });
      mon.forEach(function (x) { var i = Math.floor((Math.log(x.gia) - lnLO) / (lnHI - lnLO) * SO); dem[Math.max(0, Math.min(SO - 1, i))]++; });
      var max = Math.max.apply(0, dem) || 1;
      [].forEach.call(goc.querySelectorAll('.ch-bd-cot i'), function (c, i) {
        c.style.setProperty('--h', dem[i] ? Math.max(8, dem[i] / max * 100) : 3);
        c.classList.toggle('vao', khop(cot[i]) && !!dem[i]);
      });
      lanSo(goc.querySelector('.ch-so-n'), mon.filter(function (x) { return khop(x.gia); }).length);
    }
    return {ve: function () { if (!goc && ds.length && !dung()) return; hien(); }};
  })();

  /* ---------- #308 xem lưới ↔ danh sách: ảnh trượt và co giãn về chỗ mới ---------- */
  var kieu = 'luoi';
  try { if (localStorage.getItem('ch-kieu') === 'ds') kieu = 'ds'; } catch (er) {}
  $('#chSo').insertAdjacentHTML('afterend', '<div class="ch-kieu" role="group" aria-label="Kiểu xem">' +
    '<button type="button" data-kieu="luoi" aria-label="Xem dạng lưới"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/></svg></button>' +
    '<button type="button" data-kieu="ds" aria-label="Xem dạng danh sách"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4" y="5" width="5" height="5" rx="1"/><rect x="4" y="14" width="5" height="5" rx="1"/><path d="M12 6.5h8M12 9h5M12 15.5h8M12 18h5"/></svg></button>' +
    '<span class="vien" aria-hidden="true"></span></div>');
  function datKieu(k, hieu) {
    var doiThat = k !== kieu; kieu = k;
    try { localStorage.setItem('ch-kieu', k); } catch (er) {}
    $$('.ch-kieu button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.kieu === k); });
    truotVien($('.ch-kieu .vien'), $('.ch-kieu [data-kieu="' + k + '"]'), !hieu);
    if (!doiThat && hieu) return;
    var truoc = [], neo = null, vh = innerHeight, top = dauH();
    if (hieu && !GIAM && luoi.animate) [].forEach.call(luoi.querySelectorAll(':scope > .sp[data-k]'), function (c) {
      var r = c.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      truoc.push({c: c, r: c.querySelector('.h').getBoundingClientRect()});
      if (!neo && r.bottom > top + 40) neo = {c: c, top: r.top};
    });
    luoi.classList.toggle('ds', k === 'ds');
    if (neo) { var d = neo.c.getBoundingClientRect().top - neo.top; if (Math.abs(d) > 1) scrollTo({top: scrollY + d, behavior: 'instant'}); }
    truoc.forEach(function (t, i) {
      var h = t.c.querySelector('.h'), r = h.getBoundingClientRect(); if (!r.width) return;
      h.animate([{transformOrigin: '0 0', transform: 'translate(' + (t.r.left - r.left) + 'px,' + (t.r.top - r.top) + 'px) scale(' + t.r.width / r.width + ',' + t.r.height / r.height + ')'},
        {transformOrigin: '0 0', transform: 'none'}], {duration: 620, easing: CH_EASE});
      [].forEach.call(t.c.querySelectorAll('h3,.g,.ch-mt'), function (x) {
        x.animate([{opacity: 0, transform: 'translateY(6px)'}, {opacity: 1, transform: 'none'}], {duration: 420, delay: 260 + Math.min(i, 8) * 25, easing: CH_EASE, fill: 'backwards'});
      });
    });
  }
  $('.ch-kieu').onclick = function (ev) { var b = ev.target.closest('[data-kieu]'); if (b) datKieu(b.dataset.kieu, true); };

  /* ---------- #305 điện thoại: bộ lọc trượt lên từ dưới, kéo tay cầm xuống để đóng ---------- */
  function moLoc(mo) { $('#chLoc').classList.toggle('mo', mo); $('#chLocNen').classList.toggle('mo', mo); document.body.style.overflow = mo ? 'hidden' : ''; }
  $('#chMoLoc').onclick = function () { moLoc(true); };
  $('#chDongLoc').onclick = $('#chLocNen').onclick = $('#chXemKq').onclick = function () { moLoc(false); };
  addEventListener('keydown', function (ev) { if (ev.key === 'Escape') moLoc(false); });
  (function () {
    var dau = $('.ch-loc-dau'), ngan = $('#chLoc'); if (!dau) return;
    dau.insertAdjacentHTML('afterbegin', '<span class="ch-tay" aria-hidden="true"></span>');
    var y0 = null, dy = 0;
    dau.addEventListener('pointerdown', function (ev) { if (!ngan.classList.contains('mo') || ev.target.closest('button')) return; y0 = ev.clientY; dy = 0; ngan.style.transition = 'none'; dau.setPointerCapture(ev.pointerId); });
    dau.addEventListener('pointermove', function (ev) { if (y0 == null) return; dy = Math.max(0, ev.clientY - y0); ngan.style.translate = '0 ' + dy + 'px'; });
    var tha = function () { if (y0 == null) return; y0 = null; ngan.style.transition = ''; ngan.style.translate = ''; if (dy > 90) moLoc(false); };
    dau.addEventListener('pointerup', tha); dau.addEventListener('pointercancel', tha);
  })();

  /* ---------- #242 thanh loại bám đầu trang khi cuộn qua hàng danh mục · #039 viên chọn trượt ---------- */
  var BAM = (function () {
    var thanh, ds2, vien, gach, hien = false, dang = '';
    function dung(o) {
      if (thanh) return;
      document.body.insertAdjacentHTML('beforeend', '<div class="ch-bam" id="chBam" aria-label="Chọn nhanh loại"><div class="khung">' +
        '<button type="button" class="ch-bam-loc" aria-label="Mở bộ lọc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button>' +
        '<div class="ch-bam-ds">' + o.map(function (x) { return '<button type="button" data-loai="' + x.l + '">' + e(x.ten) + '</button>'; }).join('') +
        '<span class="vien" aria-hidden="true"></span><span class="gach" aria-hidden="true"></span></div><span class="ch-bam-so"><b class="ch-so-n"></b> món</span></div></div>');
      thanh = $('#chBam'); ds2 = thanh.querySelector('.ch-bam-ds'); vien = ds2.querySelector('.vien'); gach = ds2.querySelector('.gach');
      ds2.onclick = function (ev) { var b = ev.target.closest('[data-loai]'); if (b) chonLoai(b.dataset.loai); };
      thanh.querySelector('.ch-bam-loc').onclick = function () { moLoc(true); };
      var hen = 0; addEventListener('scroll', function () { if (!hen) hen = requestAnimationFrame(function () { hen = 0; xem(); }); }, {passive: true});
      addEventListener('resize', function () { capNhat(true); });
      xem();
    }
    function nutCua(l) { return ds2 && ds2.querySelector('[data-loai="' + l + '"]'); }
    function giuTrongTam(b) {   // chip nằm ngoài khung cuộn ngang thì cuộn tới (điện thoại)
      if (!b) return; var l = b.offsetLeft, r = l + b.offsetWidth;
      if (l < ds2.scrollLeft + 10 || r > ds2.scrollLeft + ds2.clientWidth - 10) ds2.scrollTo({left: l - ds2.clientWidth / 2 + b.offsetWidth / 2, behavior: GIAM ? 'auto' : 'smooth'});
    }
    function capNhat(tucThi) {
      if (!thanh) return;
      var l = chon.loai.length === 1 ? chon.loai[0] : chon.loai.length ? null : '', b = l == null ? null : nutCua(l);
      [].forEach.call(ds2.querySelectorAll('[data-loai]'), function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      if (hien) { truotVien(vien, b, tucThi); giuTrongTam(b); } else vien._v = null;
      dang = ''; xem();
    }
    function xem() {   // hiện thanh khi đã cuộn qua hàng danh mục và vẫn đang ở trong lưới sản phẩm
      if (!thanh) return;
      var h = dauH(), dm = $('#chDm').getBoundingClientRect(), than = $('.ch-than').getBoundingClientRect();
      var nen = dm.bottom < h && than.bottom > h + 160;
      if (nen !== hien) {
        hien = nen; thanh.classList.toggle('hien', nen); thanh.style.top = h + 'px'; document.body.classList.toggle('ch-bam-hien', nen);
        if (nen) { var l = chon.loai.length === 1 ? chon.loai[0] : chon.loai.length ? null : ''; truotVien(vien, l == null ? null : nutCua(l), true); }
      }
      if (!hien) return;
      /* "Tất cả": vạch vàng nhỏ chạy theo loại của món đang nằm dưới thanh */
      var l2 = '';
      if (!chon.loai.length) {
        var y = h + thanh.offsetHeight + 60, gr = luoi.getBoundingClientRect(), el = document.elementFromPoint(gr.left + Math.min(gr.width / 2, 60), y);
        var c = el && el.closest && el.closest('.sp[data-k]');
        if (c) { var x = ds.filter(function (m) { return khoa(m) === c.dataset.k; })[0]; if (x) l2 = x.loai; }
      }
      if (l2 !== dang) {
        dang = l2; var b = l2 && nutCua(l2);
        [].forEach.call(ds2.querySelectorAll('[data-loai]'), function (x) { x.classList.toggle('dang', x === b); });
        truotVien(gach, b || null);
        if (b) giuTrongTam(b);
      }
    }
    return {dung: dung, capNhat: capNhat, so: function (n) { if (thanh) lanSo(thanh.querySelector('.ch-so-n'), n); }};
  })();

  /* ---------- #322 dòng tìm nhanh tự cuộn dưới ô tìm: tên loại / dòng ngọc thật kèm số món thật ---------- */
  var GOI = (function () {
    var goc, muc = [], i = 0, hen, dung = false, trongMan = true;
    function dungMuc() {
      var tat = conTrenWeb(), dem = function (f) { return tat.filter(f).length; };
      muc = THU_TU.map(function (l) { return {k: 'loai', v: l, ten: LOAI[l].ten, n: dem(function (x) { return x.loai === l; })}; })
        .concat(NGOC_TIM.map(function (t) { var s = slug(t); return {k: 'ngoc', v: s, ten: t, n: dem(function (x) { return ngocCua(x).map(slug).indexOf(s) >= 0; })}; }))
        .filter(function (m) { return m.n > 0; }).sort(function (a, b) { return b.n - a.n; });
    }
    function o(m, cls) { return '<button type="button" class="' + cls + '" data-goi-k="' + m.k + '" data-goi-v="' + e(m.v) + '">' + e(m.ten) + '<i>' + m.n + ' món</i></button>'; }
    function ve() {
      if (!ds.length) return;
      if (!goc) {
        dungMuc(); if (muc.length < 2) return;
        $('.ch-thanh').insertAdjacentHTML('beforeend', '<div class="ch-goi" id="chGoi"><span class="nhan">Tìm nhanh</span><span class="cuon" aria-live="off"></span>' +
          '<button type="button" class="mo" aria-expanded="false" aria-label="Xem tất cả gợi ý"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9l6 6 6-6"/></svg></button>' +
          '<div class="bang" hidden>' + muc.map(function (m) { return o(m, 'ch-goi-o'); }).join('') + '</div></div>');
        goc = $('#chGoi');
        goc.querySelector('.cuon').innerHTML = o(muc[0], 'ch-goi-o hien');
        goc.addEventListener('click', function (ev) {
          var m = ev.target.closest('.mo');
          if (m) { var b = goc.querySelector('.bang'), mo = b.hidden; b.hidden = !mo; m.setAttribute('aria-expanded', mo); goc.classList.toggle('mo-bang', mo); return; }
          var x = ev.target.closest('[data-goi-k]'); if (!x) return;
          chon[x.dataset.goiK] = [x.dataset.goiV]; doi();
        });
        goc.addEventListener('pointerenter', function () { dung = true; }); goc.addEventListener('pointerleave', function () { dung = false; });
        goc.addEventListener('focusin', function () { dung = true; }); goc.addEventListener('focusout', function () { dung = false; });
        if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { trongMan = es[0].isIntersecting; }).observe(goc);
        if (!GIAM) hen = setInterval(lan, 3400);
      }
      goc.hidden = !!tuCh;   // đang gõ tìm thì ẩn cho gọn
    }
    function lan() {   // trượt mục cũ lên, mục mới từ dưới lên
      if (dung || !trongMan || document.hidden || !goc || goc.classList.contains('mo-bang')) return;
      i = (i + 1) % muc.length;
      var c = goc.querySelector('.cuon'), cu = c.querySelector('.hien');
      c.insertAdjacentHTML('beforeend', o(muc[i], 'ch-goi-o vao'));
      var moi = c.lastChild;
      requestAnimationFrame(function () { requestAnimationFrame(function () { moi.classList.remove('vao'); moi.classList.add('hien'); if (cu) { cu.classList.remove('hien'); cu.classList.add('ra'); } }); });
      setTimeout(function () { if (cu) cu.remove(); }, 700);
    }
    return {ve: ve};
  })();

  taiDuLieu.then(function () { veDm(); veLoc(); tieuDe(); veLuoi(true); datKieu(kieu, false); BAM.capNhat(true); GOI.ve(); })
    .catch(function (er) { console.error(er); luoi.innerHTML = '<p class="rong">Chưa tải được danh sách sản phẩm.</p>'; });
})();

/* ================= QUÀ TẶNG ================= */
if (document.body.dataset.trang === 'qua-tang') (function () {
  var NGAN = [
    {k: 'duoi-3', ten: 'Dưới 3 triệu', nho: 'Quà xinh, ý nghĩa', tu: 0, den: 3e6, gia: 'duoi-1,1-3'},
    {k: '3-7', ten: '3 – 7 triệu', nho: 'Quà sinh nhật, kỷ niệm', tu: 3e6, den: 7e6, gia: '3-7'},
    {k: '7-12', ten: '7 – 12 triệu', nho: 'Quà cho người thân yêu', tu: 7e6, den: 12e6, gia: '7-12'},
    {k: 'tren-12', ten: 'Trên 12 triệu', nho: 'Món để dành cả đời', tu: 12e6, den: Infinity, gia: 'tren-12'}
  ];
  var LOAI_QUA = ['tron', 'chuoi', 'nhan', 'khuyen', 'matday'];   // charm vàng để riêng ở mục quà kèm
  var dang = (/^#(\S+)$/.exec(location.hash) || [])[1], dangI = -1;
  if (!ds.length) {   // khung chờ (#079/#439)
    $('#qtNgan').innerHTML = Array(5).join('<span class="qt-the ch-xuong-qt" aria-hidden="true"></span>');
    $('#qtLuoi').innerHTML = theXuong(4);
  }
  function monCua(n) {
    return conTrenWeb().filter(function (x) { return LOAI_QUA.indexOf(x.loai) >= 0 && x.gia >= n.tu && x.gia < n.den; })
      .sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay) || b.gia - a.gia; });
  }
  function chonNgan(k, hieu) {
    var n = NGAN.filter(function (x) { return x.k === k; })[0] || NGAN[0], r = monCua(n), i = NGAN.indexOf(n), huong = dangI < 0 ? 0 : i > dangI ? 1 : i < dangI ? -1 : 0;
    dangI = i;
    $$('#qtNgan .qt-the').forEach(function (b) { var on = b.dataset.k === n.k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    truotVien($('#qtVien'), $('#qtNgan .qt-the.on'), !hieu);   // #039 khung vàng trượt sang thẻ ngân sách mới
    var l = $('#qtLuoi');
    l.innerHTML = r.length ? r.slice(0, 8).map(the).join('') :
      '<div class="rong"><p>Tầm giá này tạm hết món — nhắn cửa hàng để được báo khi có món mới.</p></div>';
    if (hieu && huong && !GIAM && l.animate) {   // món mới lướt vào từ phía vừa chuyển tới, lần lượt từng món
      [].forEach.call(l.querySelectorAll('.sp'), function (c, j) {
        c.classList.add('hien');
        c.animate([{opacity: 0, transform: 'translateX(' + huong * 42 + 'px)'}, {opacity: 1, transform: 'none'}],
          {duration: 560, delay: j * 55, easing: CH_EASE, fill: 'backwards'});
      });
    }
    theoDoi(l); choAnh(l);
    var a = $('#qtTatCa');
    a.href = 'cua-hang.html?loai=' + LOAI_QUA.join(',') + '&gia=' + n.gia;
    a.innerHTML = 'Xem tất cả ' + r.length + ' món ' + n.ten.toLowerCase() + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    a.parentNode.hidden = r.length <= 8;
    history.replaceState(null, '', '#' + n.k);
  }
  taiDuLieu.then(function () {
    $('#qtNgan').innerHTML = NGAN.map(function (n) {
      var r = monCua(n), x = r[0];
      return '<button type="button" class="qt-the" role="tab" data-k="' + n.k + '"><span class="h">' + (x ? hinh(x.anh[0], '', 500) : '') + '</span>' +
        '<span class="tt"><small>' + e(n.nho) + '</small><b>' + e(n.ten) + '</b><i>' + r.length + ' món</i></span></button>';
    }).join('') + '<span class="qt-vien" id="qtVien" aria-hidden="true"></span>';
    $('#qtNgan').classList.add('co-vien');
    $('#qtNgan').onclick = function (ev) { var b = ev.target.closest('.qt-the'); if (b) chonNgan(b.dataset.k, true); };
    chonNgan(dang, false);
    addEventListener('resize', function () { truotVien($('#qtVien'), $('#qtNgan .qt-the.on'), true); });
    /* charm vàng làm quà kèm: 8 charm mới nhất dưới 3 triệu */
    var c = conTrenWeb().filter(function (x) { return x.loai === 'charm' && x.gia && x.gia < 3e6; })
      .sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay); }).slice(0, 8);
    if (c.length) {
      $('#qtKem').hidden = false;
      $('#qtKemDs').innerHTML = c.map(function (x) {
        return '<a class="mega-nho qt-nho" href="' + linkSp(x) + '"><span class="h">' + hinh(x.anh[0], x.ten, 200) + '</span>' +
          '<span class="tt"><b>' + e(x.ten) + '</b><small>' + gia(x.gia) + '</small></span></a>';
      }).join('');
    }
  }).catch(function (er) { console.error(er); $('#qtLuoi').innerHTML = '<p class="rong">Chưa tải được danh sách sản phẩm.</p>'; });

  /* dịch vụ quà — lấy đúng theo chính sách giao hàng của cửa hàng */
  var DV = [
    ['hop', 'Đóng hộp cẩn thận', 'Mỗi món được đóng hộp, chèn chống sốc — mở ra là tặng được ngay.'],
    ['video', 'Xem video trước khi gửi', 'Cửa hàng quay video chính món quà để bạn xem lại trước khi giao.'],
    ['xe', 'Giao toàn quốc', 'Vietnam Post: 2–3 ngày miền Bắc, 3–5 ngày miền Trung và miền Nam.'],
    ['but', 'Thiết kế chuỗi riêng', 'Tự phối dây ngọc và charm vàng theo ý mình — món quà không trùng với ai.']
  ];
  var IC_DV = {
    hop: '<path d="M3.5 8.5h17v4h-17zM5 12.5v8h14v-8M12 8.5v12M12 8.5S10.5 4 8 4.5 7 8.5 12 8.5zm0 0s1.5-4.5 4-4 1 4-4 4z"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>',
    xe: '<path d="M3 6.5h11v9H3zM14 9.5h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    but: '<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>'
  };
  $('#qtDv').innerHTML = DV.map(function (d, i) {
    return '<div class="qt-dv-o" data-hien style="--i:' + i + '"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' + IC_DV[d[0]] + '</svg></span>' +
      '<b>' + d[1] + '</b><p>' + d[2] + '</p>' + (d[0] === 'but' ? '<a href="thiet-ke.html">Mở xưởng phối chuỗi →</a>' : '') + '</div>';
  }).join('');
  theoDoi($('#qtDv'));

  /* ---------- #342 hộp quà tháo nơ, mở nắp — cuộn tới thì tự mở, bấm để đóng / mở lại ---------- */
  (function () {
    var hop = $('#qtHop'); if (!hop) return;
    var nut = hop.querySelector('.qt-hop-nut'), da = false;
    function mo(m) {
      hop.classList.toggle('mo', m); nut.setAttribute('aria-expanded', m); nut.setAttribute('aria-label', m ? 'Gói hộp quà lại' : 'Mở hộp quà');
      if (m && !GIAM) {   // vài đốm vàng bay ra
        var sao = hop.querySelector('.qt-sao'); sao.innerHTML = '';
        for (var i = 0; i < 9; i++) {
          var g = -150 + i * 15 + (Math.random() * 10 - 5), d = 55 + Math.random() * 40, s = document.createElement('i');
          s.style.setProperty('--dx', (Math.cos(g * Math.PI / 180) * d).toFixed(1) + 'px');
          s.style.setProperty('--dy', (Math.sin(g * Math.PI / 180) * d).toFixed(1) + 'px');
          s.style.animationDelay = (700 + i * 40) + 'ms'; sao.appendChild(s);
        }
      }
    }
    nut.onclick = function () { da = true; mo(!hop.classList.contains('mo')); };
    if (GIAM || !('IntersectionObserver' in window)) { mo(true); return; }
    var io2 = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io2.disconnect();
      setTimeout(function () { if (!da) mo(true); }, 650);
    }, {threshold: .7});
    io2.observe(hop);
  })();
})();

/* ================= HIỆU ỨNG THẺ SẢN PHẨM (cả hai trang) =================
   #050 thẻ nghiêng rất nhẹ theo chuột + ánh phản chiếu trên ảnh · #366 rê ngang trên ảnh để xem lần lượt các ảnh của món.
   Chỉ máy có chuột (hover + pointer fine); điện thoại giữ nguyên như cũ. (#335 chú thích trượt theo hướng chuột: bỏ —
   đáy ảnh đã có hàng nút giỏ / tim / xem nhanh trượt lên, thêm một lớp nữa sẽ rối mắt.) */
if (/^(cua-hang|qua-tang)$/.test(document.body.dataset.trang) && matchMedia('(hover:hover) and (pointer:fine)').matches) (function () {
  var map = null, the0 = null, hen = 0, ev0 = null;
  function monCua(k) { if (!map) { map = {}; ds.forEach(function (x) { map[khoa(x)] = x; }); } return map[k]; }
  function chuanBiLuot(c) {   // lần đầu rê vào: thêm ảnh 3, 4… của món (ảnh 1, 2 đã có sẵn trong thẻ)
    if (c._luot !== undefined) return c._luot;
    var x = monCua(c.dataset.k), h = c.querySelector('.h');
    if (!x || !h || !x.anh || x.anh.length < 3) return (c._luot = null);
    var a = x.anh.slice(0, 6), vt = h.querySelector('.viec'), anhs = [h.querySelector('img:not(.sau)'), h.querySelector('img.sau')];
    a.slice(2).forEach(function (id) {
      var t = document.createElement('div'); t.innerHTML = hinh(id, '', 700, ' class="ch-them"');
      var im = t.firstChild; im.removeAttribute('loading'); h.insertBefore(im, vt); anhs.push(im);
    });
    var v = document.createElement('div'); v.className = 'ch-vach'; v.setAttribute('aria-hidden', 'true');
    v.innerHTML = a.map(function () { return '<i></i>'; }).join(''); h.appendChild(v);
    return (c._luot = {h: h, anhs: anhs, vach: [].slice.call(v.children), i: -1});
  }
  function ve() {
    hen = 0; var ev = ev0; if (!ev || !the0) return;
    var c = the0, r = c.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
    var dsach = c.parentNode && c.parentNode.classList.contains('ds');
    if (!GIAM && !dsach) {   // #050 nghiêng tối đa ~3°, ánh đi theo chuột
      c.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * 4).toFixed(2) + 'deg) rotateY(' + ((px - .5) * 5).toFixed(2) + 'deg)';
      c.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); c.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
    }
    var L = c._luot; if (!L) return;   // #366 vị trí ngang trên ảnh → ảnh thứ mấy
    var hr = L.h.getBoundingClientRect();
    if (ev.clientY < hr.top || ev.clientY > hr.bottom) return;
    var i = Math.max(0, Math.min(L.anhs.length - 1, Math.floor((ev.clientX - hr.left) / hr.width * L.anhs.length)));
    if (i === L.i) return; L.i = i;
    L.h.classList.add('luot');
    L.anhs.forEach(function (im, j) { if (j) im.classList.toggle('on', j === i); });
    L.vach.forEach(function (v, j) { v.classList.toggle('on', j === i); });
  }
  function roi(c) {
    c.classList.remove('nghieng'); c.style.transform = '';
    var L = c._luot; if (L) { L.h.classList.remove('luot'); L.i = -1; L.anhs.forEach(function (im) { im.classList.remove('on'); }); L.vach.forEach(function (v) { v.classList.remove('on'); }); }
  }
  document.addEventListener('pointermove', function (ev) {
    if (ev.pointerType !== 'mouse') return;
    var c = ev.target.closest && ev.target.closest('.ch-luoi .sp[data-k]:not(.ch-ma),.qt-luoi .sp[data-k]');
    if (c !== the0) { if (the0) roi(the0); the0 = c; if (c) { c.classList.add('nghieng'); chuanBiLuot(c); } }
    if (!c) return;
    ev0 = ev; if (!hen) hen = requestAnimationFrame(ve);
  }, {passive: true});
  document.addEventListener('pointerleave', function () { if (the0) { roi(the0); the0 = null; } });
})();
