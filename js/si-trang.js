/* Trang khách sỉ si.html: đăng nhập → danh mục (#) → danh sách món một danh mục (#loai=charm) → chi tiết (san-pham.html?ma=…&si=1)
   #ds = danh sách hỏi sỉ đã gom. Giá sỉ lấy từ SI (js/si.js), không có trong san-pham.json. */
(function () {
  var Q = new URLSearchParams(location.search), VE = Q.get('ve') || '';
  var du = null, MOI = 24, hien = MOI, loaiDang = '';

  window.moSp = function (k) { sangTrang(SI.ct(k)); };

  function giaSi(x) { return du && du.g[khoa(x)] || 0; }
  function con(loai) { return ds.filter(function (x) { return x.tt !== 'Đã bán' && (!loai || x.loai === loai); }); }

  /* ---------- đăng nhập ---------- */
  function hienKhoa() {
    $('#siKhoa').hidden = false; $('#siNoi').hidden = true;
    $('#siDan').hidden = false;
    theoDoi($('#siKhoa'));
    setTimeout(function () { var i = $('#fSi [name=ten]'); if (i && !laDienThoai()) i.focus(); }, 300);
  }
  $('#fSi').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var f = ev.target, nut = $('#siVao'), loi = $('#siLoi');
    loi.hidden = true; nut.disabled = true; nut.textContent = 'Đang mở bảng giá…';
    SI.dangNhap(f.ten.value, f.mk.value).then(function (d) {
      if (VE) { location.replace(SI.ct(VE)); return; }
      baoTin('Chào ' + d.ten + ' — đã mở bảng giá sỉ'); vao(d);
    }).catch(function (er) {
      loi.textContent = er === 'sai' ? 'Tên đăng nhập hoặc mật khẩu chưa đúng.'
        : er === 'may' ? 'Trình duyệt này chưa mở được bảng giá. Bạn thử Safari hoặc Chrome bản mới nhé.'
        : 'Chưa tải được bảng giá, bạn thử lại sau ít phút.';
      loi.hidden = false;
    }).then(function () { nut.disabled = false; nut.textContent = 'Xem giá sỉ'; });
  });
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('.si-hien-mk'); if (!b) return;
    var i = b.previousElementSibling, an = i.type === 'password';
    i.type = an ? 'text' : 'password'; b.textContent = an ? 'Ẩn' : 'Hiện'; b.setAttribute('aria-label', an ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
  });
  $('#siThoat').addEventListener('click', function () {
    SI.thoat(); du = null; location.hash = ''; baoTin('Đã đăng xuất khỏi bảng giá sỉ'); hienKhoa();
  });

  function vao(d) {
    du = d;
    taiDuLieu.then(function () {
      $('#siKhoa').hidden = true; $('#siNoi').hidden = false;
      $('#siChao').innerHTML = '<span class="si-xc">Xin chào </span><b>' + e(d.ten) + '</b>' + (d.luc ? '<span> · giá sỉ cập nhật ' + e(d.luc.split(' ')[0]) + '</span>' : '');
      SI.ve(); theo();
    });
  }

  /* ---------- điều hướng theo # ---------- */
  function theo() {
    if (!du) return;
    var h = location.hash.slice(1), m = /^loai=(\w+)/.exec(h);
    $('#siDm').hidden = !!h; $('#siMon').hidden = !m; $('#siGom').hidden = h !== 'ds';
    $('#siDan').hidden = !!h;
    if (m && LOAI[m[1]]) veMon(m[1]);
    else if (h === 'ds') veGom();
    else { veDm(); datTieu('Bảng giá <em>sỉ</em>', ''); }
  }
  addEventListener('hashchange', function () { theo(); scrollTo({top: 0, behavior: GIAM ? 'auto' : 'smooth'}); });
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest('.si-ve'); if (!a) return;
    ev.preventDefault(); history.pushState(null, '', 'si.html'); theo(); scrollTo({top: 0, behavior: GIAM ? 'auto' : 'smooth'});
  });

  function datTieu(html, duong) {
    $('#siTieu').innerHTML = '<span class="dong-chu"><span>' + html + '</span></span>';
    $('#siTieu').classList.add('hien');
    $('#siDuong').innerHTML = '<a href="index.html">Trang chủ</a><span>/</span><a href="si.html">Khách sỉ</a>' + (duong ? '<span>/</span><span>' + duong + '</span>' : '');
    document.title = (duong ? duong.replace(/<[^>]+>/g, '') + ' · ' : '') + 'Bảng giá sỉ · Ngọc Trầm Store';
  }

  /* ---------- danh mục ---------- */
  function veDm() {
    var o = THU_TU.map(function (l) {
      var mon = con(l); if (!mon.length) return '';
      var co = mon.filter(giaSi).length;
      var bia = mon.slice().sort(function (a, b) { return (giaSi(b) ? 1 : 0) - (giaSi(a) ? 1 : 0) || ngaySo(b.ngay) - ngaySo(a.ngay); }).slice(0, 3);
      return '<a class="si-dm-o" href="#loai=' + l + '" data-hien>' +
        '<span class="si-dm-anh">' + bia.map(function (x, i) { return hinh(x.anh[0], '', 600, ' class="a' + i + '"'); }).join('') + '</span>' +
        '<span class="si-dm-chu"><b>' + e(LOAI[l].ten) + '</b><small>' + mon.length + ' món' + (co < mon.length ? (co ? ' · ' + co + ' món có giá sỉ' : ' · hỏi giá sỉ') : '') + '</small></span>' +
        '<span class="si-dm-mui" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>';
    }).join('');
    $('#siDmLuoi').innerHTML = o || '<p class="dan">Hiện chưa có món nào đang bán.</p>';
    theoDoi($('#siDm'));
  }

  /* ---------- danh sách món một danh mục ---------- */
  function theSi(x, i) { return SI.the(x, i, du); }
  function locMon() {
    var t = boDau($('#siTim').value.trim()), xep = $('#siXep').value;
    var mon = con(loaiDang).filter(function (x) {
      if (!t) return true;
      var s = boDau(x.ten + ' ' + x.ma + ' ' + (x.mo_ta || ''));
      return t.split(/\s+/).every(function (w) { return s.indexOf(w) >= 0; });
    });
    if (xep === 'moi') mon.sort(function (a, b) { return ngaySo(b.ngay) - ngaySo(a.ngay); });
    else mon.sort(function (a, b) {
      var ga = giaSi(a), gb = giaSi(b);
      if (!ga !== !gb) return ga ? -1 : 1;   // món chưa có giá sỉ xuống cuối
      return xep === 'thap' ? ga - gb : gb - ga;
    });
    return mon;
  }
  function veLuoi() {
    var mon = locMon();
    $('#siSo').textContent = mon.length ? mon.length + ' món' + ($('#siTim').value.trim() ? ' khớp' : ' đang có') : '';
    $('#siLuoi').innerHTML = mon.length ? mon.slice(0, hien).map(theSi).join('')
      : '<p class="si-trong">Không có món nào khớp. Bạn thử từ khác, hoặc nhắn Zalo hỏi Ngọc Trầm.</p>';
    $('#siThem').hidden = mon.length <= hien;
    SI.ve(); theoDoi($('#siLuoi'));
  }
  function veMon(l) {
    if (loaiDang !== l) { loaiDang = l; hien = MOI; $('#siTim').value = ''; $('#siXep').value = 'moi'; }
    datTieu(e(LOAI[l].ten) + ' <em>giá sỉ</em>', e(LOAI[l].ten));
    veLuoi();
  }
  var hen;
  $('#siTim').addEventListener('input', function () { clearTimeout(hen); hen = setTimeout(function () { hien = MOI; veLuoi(); }, 160); });
  $('#siXep').addEventListener('change', function () { hien = MOI; veLuoi(); });
  $('#siNutThem').addEventListener('click', function () { hien += MOI; veLuoi(); });

  /* ---------- danh sách hỏi sỉ ---------- */
  function veGom() {
    datTieu('Danh sách <em>hỏi sỉ</em>', 'Danh sách hỏi sỉ');
    var ma = SI.ds(), mon = ma.map(function (k) { return ds.filter(function (x) { return String(khoa(x)) === k; })[0]; }).filter(Boolean);
    var tong = mon.reduce(function (s, x) { return s + (x.tt === 'Đã bán' ? 0 : giaSi(x)); }, 0);
    $('#siGomNoi').innerHTML = !mon.length
      ? '<div class="si-trong-ds"><p>Chưa có món nào. Bấm biểu tượng <span class="si-ic">' + IC_SI_THEM + '</span> trên ảnh món, hoặc nút "Thêm vào danh sách sỉ" ở trang chi tiết.</p><a class="nut" href="si.html">Xem hàng</a></div>'
      : '<ul class="si-gom-ds">' + mon.map(function (x) {
          var g = giaSi(x), ban = x.tt === 'Đã bán';
          return '<li' + (ban ? ' class="ban"' : '') + '><a href="' + SI.ct(khoa(x)) + '">' + hinh(x.anh[0], x.ten, 200) + '</a>' +
            '<div><a href="' + SI.ct(khoa(x)) + '"><b>' + e(x.ten) + '</b></a><small>#' + e(x.ma) + ' · ' + e(LOAI[x.loai].ngan) + (ban ? ' · đã bán' : '') + '</small></div>' +
            '<span class="si-gom-g">' + (ban ? '—' : g ? gia(g) : 'Hỏi giá') + '</span>' +
            '<button type="button" class="si-bo" data-si-bo="' + e(khoa(x)) + '" aria-label="Bỏ món này">×</button></li>';
        }).join('') + '</ul>' +
        '<div class="si-gom-chan"><p>' + mon.length + ' món' + (tong ? ' · tạm tính theo giá sỉ <b>' + gia(tong) + '</b>' : '') + '</p>' +
        '<div class="hang"><button type="button" class="si-xoa-het">Xoá hết</button>' +
        '<a class="nut dac si-gui" href="' + linkZalo() + '" target="_blank" rel="noopener">' + bieuTuong('zalo') + 'Chép danh sách &amp; mở Zalo</a></div>' +
        '<p class="ghi">Danh sách được chép sẵn kèm mã và giá sỉ — mở Zalo xong bạn chỉ cần dán vào tin nhắn.</p></div>';
    theoDoi($('#siGom'));
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-si-bo]');
    if (b) { SI.doi(b.dataset.siBo); return veGom(); }
    if (ev.target.closest('.si-xoa-het')) { SI.xoaHet(); baoTin('Đã xoá danh sách hỏi sỉ'); return veGom(); }
    var g = ev.target.closest('.si-gui'); if (!g || !du) return;
    var mon = SI.ds().map(function (k) { return ds.filter(function (x) { return String(khoa(x)) === k && x.tt !== 'Đã bán'; })[0]; }).filter(Boolean);
    if (navigator.clipboard) navigator.clipboard.writeText(SI.chu(mon, du, du.ten)).catch(function () {});
    baoTin('Đã chép ' + mon.length + ' mã — dán vào Zalo nhé');
  });

  /* ---------- mở trang ---------- */
  if (!SI.duoc()) { hienKhoa(); return; }
  SI.san().then(function (d) {
    if (d && VE) { location.replace(SI.ct(VE)); return; }
    if (d) vao(d); else hienKhoa();
  });
})();
