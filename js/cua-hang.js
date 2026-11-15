/* =========================================================
   CỬA HÀNG (cua-hang.html) + QUÀ TẶNG (qua-tang.html)
   Lọc theo loại / dòng ngọc / mức giá / vàng — chọn nhiều trong một nhóm (hoặc),
   các nhóm cộng dồn (và). Bộ lọc ghi lên địa chỉ trang (?loai=chuoi&gia=3-7…) để gửi link cho nhau.
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

/* ================= CỬA HÀNG ================= */
if (document.body.dataset.trang === 'cua-hang') (function () {
  var NHOM = {
    loai: {ds: function () { return THU_TU.map(function (l) { return {v: l, ten: LOAI[l].ten}; }); }, khop: function (x, v) { return x.loai === v; }},
    ngoc: {ds: function () { return NGOC_TIM.map(function (t) { return {v: slug(t), ten: t}; }); }, khop: function (x, v) { return ngocCua(x).map(slug).indexOf(v) >= 0; }},
    gia: {ds: function () { return MUC_GIA.map(function (m) { return {v: m.k, ten: m.ten}; }); }, khop: giaKhop},
    vang: {ds: function () { return VANG.map(function (v) { return {v: v.toLowerCase(), ten: 'Vàng ' + v}; }); }, khop: function (x, v) { return vangCua(x).toLowerCase() === v; }}
  };
  var chon = {loai: [], ngoc: [], gia: [], vang: []}, sxCh = 'moi', tuCh = '', hienCh = 0, MOI = 24;

  /* đọc bộ lọc từ địa chỉ trang */
  var q = new URLSearchParams(location.search);
  Object.keys(chon).forEach(function (k) { chon[k] = (q.get(k) || '').split(',').filter(Boolean); });
  if (q.get('sx')) sxCh = q.get('sx');
  if (q.get('q')) { tuCh = q.get('q'); $('#chTim').value = tuCh; }
  $('#chSx').value = sxCh;

  function ghiDiaChi() {
    var p = new URLSearchParams();
    Object.keys(chon).forEach(function (k) { if (chon[k].length) p.set(k, chon[k].join(',')); });
    if (tuCh) p.set('q', tuCh);
    if (sxCh !== 'moi') p.set('sx', sxCh);
    var s = p.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }
  function qua(x, boQua) {   // món có khớp mọi nhóm (trừ nhóm boQua — để đếm số món cho từng ô lọc)
    for (var k in chon) {
      if (k === boQua || !chon[k].length) continue;
      if (!chon[k].some(function (v) { return NHOM[k].khop(x, v); })) return false;
    }
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
    var so = Object.keys(chon).reduce(function (s, k) { return s + chon[k].length; }, 0);
    $('#chSoLoc').hidden = !so; $('#chSoLoc').textContent = so;
    $('#chChip').innerHTML = Object.keys(chon).map(function (k) {
      return chon[k].map(function (v) {
        var m = NHOM[k].ds().filter(function (y) { return y.v === v; })[0];
        return m ? '<button type="button" class="chip-loc" data-k="' + k + '" data-v="' + e(v) + '">' + e(m.ten) + '<span aria-hidden="true">×</span></button>' : '';
      }).join('');
    }).join('') + (so ? '<button type="button" class="chip-xoa" id="chXoaChip">Xoá tất cả</button>' : '');
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
  }
  function veDm() {   // hàng ô danh mục tròn: ảnh món mới nhất của từng loại
    var tat = conTrenWeb(), dem = {};
    tat.forEach(function (x) { dem[x.loai] = (dem[x.loai] || 0) + 1; });
    var anhCua = function (l) {
      var r = tat.filter(function (x) { return (!l ? x.loai !== 'charm' : x.loai === l) && x.anh && x.anh[0]; })
        .sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay); })[0];
      return r ? hinh(r.anh[0], '', 300) : '';
    };
    $('#chDm').innerHTML = [{l: '', ten: 'Tất cả', n: tat.length}].concat(THU_TU.filter(function (l) { return dem[l]; }).map(function (l) {
      return {l: l, ten: LOAI[l].ten, n: dem[l]};
    })).map(function (o, i) {
      return '<button type="button" class="dm-o" role="listitem" data-loai="' + o.l + '" style="--i:' + i + '"><span class="h">' + anhCua(o.l) + '</span>' +
        '<b>' + e(o.ten) + '</b><small>' + o.n + ' món</small></button>';
    }).join('');
    $('#chDm').onclick = function (ev) {
      var b = ev.target.closest('.dm-o'); if (!b) return;
      var l = b.dataset.loai;
      chon.loai = !l || (chon.loai.length === 1 && chon.loai[0] === l) ? [] : [l];
      doi();
      var luoi = $('.ch-thanh'); if (luoi && luoi.getBoundingClientRect().top > innerHeight * .8) cuonToi(luoi);
    };
  }
  function veLuoi(lai) {
    var r = ketQua(), l = $('#chLuoi');
    if (lai) { hienCh = 0; l.innerHTML = ''; }
    $('#chSo').innerHTML = '<b>' + r.length + '</b> món';
    $('#chTong').textContent = r.length;
    $('#chXemKq').textContent = 'Xem ' + r.length + ' món';
    if (!r.length) {
      l.innerHTML = '<div class="rong ch-rong"><p>Chưa có món nào khớp bộ lọc này.</p><button type="button" class="nut" data-xoa-loc>Xoá bộ lọc</button>' +
        ' <a class="nut dac" href="' + linkZalo() + '" target="_blank" rel="noopener">Nhờ cửa hàng tìm giúp</a></div>';
      $('#chThem').hidden = true; return;
    }
    var moi = r.slice(hienCh, hienCh + MOI); hienCh += moi.length;
    l.insertAdjacentHTML('beforeend', moi.map(the).join('')); theoDoi(l);
    $('#chThem').hidden = hienCh >= r.length;
    $('#chThem').textContent = 'Xem thêm · ' + (r.length - hienCh) + ' món';
  }
  function doi() { ghiDiaChi(); veLoc(); tieuDe(); veLuoi(true); }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('.o-loc,.chip-loc');
    if (b) {
      var a = chon[b.dataset.k], i = a.indexOf(b.dataset.v);
      if (i >= 0) a.splice(i, 1); else a.push(b.dataset.v);
      doi(); return;
    }
    if (ev.target.closest('#chXoaChip,#chXoaLoc,[data-xoa-loc]')) { Object.keys(chon).forEach(function (k) { chon[k] = []; }); tuCh = ''; $('#chTim').value = ''; doi(); return; }
  });
  var henTim; $('#chTim').oninput = function () { var v = this.value; clearTimeout(henTim); henTim = setTimeout(function () { tuCh = v.trim(); doi(); }, 200); };
  $('#chSx').onchange = function () { sxCh = this.value; ghiDiaChi(); veLuoi(true); };
  $('#chThem').onclick = function () { veLuoi(false); };

  /* điện thoại: bộ lọc trượt lên từ dưới */
  function moLoc(mo) { $('#chLoc').classList.toggle('mo', mo); $('#chLocNen').classList.toggle('mo', mo); document.body.style.overflow = mo ? 'hidden' : ''; }
  $('#chMoLoc').onclick = function () { moLoc(true); };
  $('#chDongLoc').onclick = $('#chLocNen').onclick = $('#chXemKq').onclick = function () { moLoc(false); };
  addEventListener('keydown', function (ev) { if (ev.key === 'Escape') moLoc(false); });

  taiDuLieu.then(function () { veDm(); veLoc(); tieuDe(); veLuoi(true); })
    .catch(function () { $('#chLuoi').innerHTML = '<p class="rong">Chưa tải được danh sách sản phẩm.</p>'; });
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
  var dang = (/^#(\S+)$/.exec(location.hash) || [])[1];
  function monCua(n) {
    return conTrenWeb().filter(function (x) { return LOAI_QUA.indexOf(x.loai) >= 0 && x.gia >= n.tu && x.gia < n.den; })
      .sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay) || b.gia - a.gia; });
  }
  function chonNgan(k) {
    var n = NGAN.filter(function (x) { return x.k === k; })[0] || NGAN[0], r = monCua(n);
    $$('#qtNgan .qt-the').forEach(function (b) { var on = b.dataset.k === n.k; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    var l = $('#qtLuoi');
    l.innerHTML = r.length ? r.slice(0, 8).map(the).join('') :
      '<div class="rong"><p>Tầm giá này tạm hết món — nhắn cửa hàng để được báo khi có món mới.</p></div>';
    theoDoi(l);
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
    }).join('');
    $('#qtNgan').onclick = function (ev) { var b = ev.target.closest('.qt-the'); if (b) chonNgan(b.dataset.k); };
    chonNgan(dang);
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
  }).catch(function () { $('#qtLuoi').innerHTML = '<p class="rong">Chưa tải được danh sách sản phẩm.</p>'; });

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
})();
