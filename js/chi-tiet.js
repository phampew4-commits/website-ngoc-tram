/* Trang chi tiết sản phẩm: san-pham.html?ma=<mã> */
/* cách giữ: món trầm (x.tram) dùng GIU_TRAM, còn lại GIU_NGOC */
function khoiGiu(tieu, ds) {
  return '<details><summary>' + tieu + '</summary><div class="tl"><div><ul class="ds-tp cham-soc">' +
    (ds || []).map(function (x) { return '<li><b>' + e(x.tieu) + '.</b> ' + e(x.noi) + '</li>'; }).join('') + '</ul></div></div></details>';
}
var GIU_NGOC = khoiGiu('Giữ ngọc luôn đẹp', (CH.chamSoc || {}).ngoc);
var GIU_TRAM = khoiGiu('Giữ trầm luôn thơm', (CH.chamSoc || {}).tram);

var maSp = new URLSearchParams(location.search).get('ma') || '';

taiDuLieu.then(function () {
  var x = ds.filter(function (y) { return khoa(y) === maSp; })[0] || ds.filter(function (y) { return y.ma === maSp; })[0];
  if (!x) return khongThay();
  dungTrang(x);
  dungXemKi(x);
  dungQuy();
  dungLienQuan(x);
  dungHd(x);
  dungDaXem(x);
}).catch(khongThay);

function khongThay() {
  document.title = 'Không tìm thấy sản phẩm · Ngọc Trầm Store';
  $('#spChinh').innerHTML = '<div class="khong-thay"><span class="nho">Mã ' + e(maSp || '—') + '</span><h1>Không tìm thấy <em>sản phẩm này</em></h1>' +
    '<p>Món này có thể đã được bán hoặc mã chưa đúng. Bạn xem các món khác hoặc nhắn cửa hàng nhé.</p>' +
    '<div class="hang"><a class="nut dac" href="index.html#san-pham">Xem sản phẩm khác</a><a class="nut" href="' + linkZalo() + '" target="_blank">Nhắn Zalo</a></div></div>';
}

/* thông số rút ra từ tên + dữ liệu */
function thongSo(x) {
  var t = x.ten + ' ' + (x.mo_ta || ''), r = [];
  r.push(['Dòng sản phẩm', LOAI[x.loai].ten]);
  var ngoc = nhanSp(x).split(' · ')[0];
  if (ngoc && ngoc !== LOAI[x.loai].ngan) r.push([x.tram ? 'Loại hạt' : 'Chất ngọc', ngoc]);
  var co = /(\d+(?:[.,]\d+)?) ly/.exec(x.ten); if (co && x.loai !== 'charm') r.push(['Cỡ hạt', co[1].replace('.', ',') + ' ly']);
  var v = /vàng (\d\dK)/i.exec(t); if (v) r.push([x.loai === 'chuoi' ? 'Charm' : 'Chất liệu vàng', 'Vàng ' + v[1].toUpperCase()]);
  else if (/bạc|925/i.test(t)) r.push([x.loai === 'chuoi' ? 'Chất liệu charm' : 'Chất liệu', /phủ vàng/i.test(t) ? 'Bạc 925 phủ vàng' : 'Bạc 925']);
  r.push(['Mã sản phẩm', x.ma]);
  r.push(['Tình trạng', x.tt || 'Còn hàng']);
  return r;
}

function dungTrang(x) {
  var tt = x.tt || 'Còn hàng', loai = LOAI[x.loai];
  document.title = x.ten + ' · Ngọc Trầm Store';
  var md = document.querySelector('meta[name="description"]'); if (md) md.content = x.ten + ' – ' + gia(x.gia) + '. Ảnh thật, mã ' + x.ma + ', hỏi mua qua Zalo.';
  $('#duong').insertAdjacentHTML('beforeend', '<span>/</span><a href="index.html#san-pham" data-loai="' + x.loai + '">' + loai.ten + '</a><span>/</span><b>' + e(x.ma) + '</b>');

  var tp = x.tp && x.tp.length ? '<ul class="ds-tp">' + x.tp.map(function (c) { return '<li>' + e(c) + '</li>'; }).join('') + '</ul>' : '';
  $('#spChinh').innerHTML =
    '<div class="sp-anh">' +
      '<div class="khung-anh" id="khungAnh" data-mo-anh>' + x.anh.map(function (id, i) {
        return '<figure class="' + (i ? '' : 'on') + '" data-i="' + i + '">' + hinh(id, x.ten + ' – ảnh ' + (i + 1), 1400).replace(i ? '' : ' loading="lazy"', '') + '</figure>'; }).join('') +
        (x.anh.length > 1 ? '<button class="mui-ten trai" data-buoc="-1" aria-label="Ảnh trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg></button>' +
          '<button class="mui-ten phai" data-buoc="1" aria-label="Ảnh sau"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg></button>' +
          '<span class="dem-anh" id="demAnh">01 / ' + ('0' + x.anh.length).slice(-2) + '</span>' : '') +
      '</div>' +
      (x.anh.length > 1 ? '<div class="nho-anh" id="nhoAnh">' + x.anh.map(function (id, i) {
        return '<button class="' + (i ? '' : 'on') + '" data-i="' + i + '" aria-label="Ảnh ' + (i + 1) + '">' + hinh(id, '', 240) + '</button>'; }).join('') + '</div>' : '') +
    '</div>' +
    '<div class="sp-tt">' +
      '<div class="dinh">' +
        '<span class="nho" data-hien>' + loai.ten + ' · ' + e(nhanSp(x)) + '</span>' +
        '<h1 class="tieu-de"><span class="dong-chu"><span>' + e(x.ten) + '</span></span></h1>' +
        '<div class="ma-ct" data-hien><span>Mã ' + e(x.ma) + '</span><span class="chip' + (/bán/i.test(tt) ? ' ban' : '') + '">' + e(tt) + '</span></div>' +
        '<div class="gia-sp" data-hien><b>' + gia(x.gia) + '</b><small>' + (x.gia ? 'Giá bán lẻ · mỗi món chỉ có một' : 'Nhắn shop để được báo giá') + '</small></div>' +
        '<div class="hang-mua" data-hien>' +
          (/bán/i.test(tt) ? '' : '<button class="nut dac" data-gio="' + e(khoa(x)) + '">Thêm vào giỏ</button>') +
          '<a class="nut zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Hỏi mua qua Zalo</a>' +
          '<a class="nut" href="' + linkFb() + '" target="_blank" data-chep="' + e(x.ma) + '">Nhắn Messenger</a>' +
          (KHACH.bat ? '<button class="nut nut-yt" id="nutYt" data-ma="' + e(x.ma) + '"><span>♡</span> Lưu vào yêu thích</button>' : '') +
        '</div>' +
        '<p class="ghi-ct" data-hien>Bấm nút, câu hỏi kèm mã ' + e(x.ma) + ' được chép sẵn — bạn chỉ cần dán vào tin nhắn.</p>' +
        '<ul class="cam-ket-sp" data-hien>' +
          '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg><span>Ảnh thật<small>Chụp đúng món</small></span></li>' +
          '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3z"/></svg><span>Xem video<small>Gửi trước khi chốt</small></span></li>' +
          '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg><span>Giao toàn quốc<small>Đóng hộp cẩn thận</small></span></li>' +
        '</ul>' +
        '<div class="mo-rong" data-hien>' +
          '<details open><summary>Thông tin sản phẩm</summary><div class="tl"><div>' +
            (x.ct && x.ct.length ? '<p class="nhan-tp">Chi tiết món</p><ul class="ds-ct">' + x.ct.map(function (d) { return '<li>' + e(d) + '</li>'; }).join('') + '</ul>' : '') +
            '<dl class="bang-ts">' +
            thongSo(x).map(function (r) { return '<div><dt>' + e(r[0]) + '</dt><dd>' + e(r[1]) + '</dd></div>'; }).join('') + '</dl>' +
            (tp && !(x.ct && x.ct.length) ? '<p class="nhan-tp">Charm đi kèm</p>' + tp : '') + '</div></div></details>' +
          '<details><summary>Giao hàng</summary><div class="tl"><div>' + dsCs('giao') + '</div></div></details>' +
          '<details><summary>Đổi trả &amp; bảo hành</summary><div class="tl"><div><p class="nhan-tp">Đổi trả</p>' + dsCs('doi') + '<p class="nhan-tp">Bảo hành</p>' + dsCs('bh') + '<p class="nhan-tp">Lưu ý về charm vàng</p>' + dsCs('luuY') + '</div></div></details>' +
          (x.tram ? GIU_TRAM : GIU_NGOC) +
          '' +
          ''  +
        '</div>' +
      '</div>' +
    '</div>';

  /* thanh mua dính dưới đáy (điện thoại) */
  $('#thanhMua').innerHTML = '<div><small>Mã ' + e(x.ma) + '</small><b>' + gia(x.gia) + '</b></div>' +
    (/bán/i.test(tt) ? '<a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Hỏi mua qua Zalo</a>'
                     : '<button class="nut dac" data-gio="' + e(khoa(x)) + '">Thêm vào giỏ</button>');
  veNutThem();
  var hm = $('.hang-mua'), lq = $('#lien-he');
  function thanh() { $('#thanhMua').classList.toggle('hien', hm.getBoundingClientRect().bottom < 0 && lq.getBoundingClientRect().top > innerHeight); }
  addEventListener('scroll', thanh, {passive: true}); thanh();

  theoDoi($('#spChinh'));
  requestAnimationFrame(function () { $('#khungAnh').classList.add('hien'); $('.sp-tt .tieu-de').classList.add('hien'); });
  boAnh(x);
}

/* bộ ảnh: mũi tên, ảnh nhỏ, vuốt, phím, phóng to theo chuột */
function boAnh(x) {
  var n = x.anh.length, i = 0, k = $('#khungAnh');
  function toi(j) {
    i = (j + n) % n;
    $$('#khungAnh figure').forEach(function (f, t) { f.classList.toggle('on', t === i); });
    $$('#nhoAnh button').forEach(function (b, t) { b.classList.toggle('on', t === i); });
    if ($('#demAnh')) $('#demAnh').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + n).slice(-2);
  }
  k.addEventListener('click', function (ev) { var b = ev.target.closest('[data-buoc]'); if (b) toi(i + +b.dataset.buoc); else moDen(x, i); });
  if ($('#nhoAnh')) $('#nhoAnh').addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (b) toi(+b.dataset.i); });
  addEventListener('keydown', function (ev) { if (ev.key === 'ArrowLeft') toi(i - 1); if (ev.key === 'ArrowRight') toi(i + 1); });
  var x0 = null;
  k.addEventListener('touchstart', function (ev) { x0 = ev.touches[0].clientX; }, {passive: true});
  k.addEventListener('touchend', function (ev) { if (x0 == null) return; var d = ev.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) toi(i + (d < 0 ? 1 : -1)); x0 = null; });
  if (matchMedia('(hover:hover)').matches) {
    k.addEventListener('mousemove', function (ev) {
      if (ev.target.closest('button')) { k.classList.remove('phong'); return; }
      var r = k.getBoundingClientRect(), f = k.querySelector('figure.on img');
      f.style.transformOrigin = ((ev.clientX - r.left) / r.width * 100) + '% ' + ((ev.clientY - r.top) / r.height * 100) + '%';
      k.classList.add('phong');
    });
    k.addEventListener('mouseleave', function () { k.classList.remove('phong'); });
  }
}

/* ảnh lớn: xem kĩ từng góc (đủ bộ ảnh, xếp so le), bấm để xem toàn màn hình */
function dungXemKi(x) {
  if (x.anh.length < 2) return;
  var k = $('#xemKi');
  k.innerHTML = '<div class="khung"><div class="dau-xk"><span class="nho" data-hien>Ảnh thật · chụp đúng món</span>' +
    '<h2 class="tieu-de"><span class="dong-chu"><span>Xem kĩ <em>từng góc</em></span></span></h2>' +
    '<p data-hien>Bấm vào ảnh để xem phóng to. Muốn xem rõ màu ngọc hơn, <a href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">nhắn Ngọc Trầm</a> để nhận video quay trực tiếp món này.</p></div>' +
    '<div class="luoi-xk">' + [0, 1].map(function (c) {   // 2 cột so le: ảnh lẻ bên trái, ảnh chẵn bên phải (lệch xuống)
      return '<div class="cot">' + x.anh.map(function (id, i) {
        return i % 2 !== c ? '' : '<figure data-hien data-i="' + i + '"><button type="button" aria-label="Xem ảnh ' + (i + 1) + ' toàn màn hình">' + hinh(id, x.ten + ' – ảnh ' + (i + 1), 1200) + '</button>' +
          '<figcaption>' + ('0' + (i + 1)).slice(-2) + '</figcaption></figure>'; }).join('') + '</div>'; }).join('') + '</div></div>';
  k.hidden = false;
  k.addEventListener('click', function (ev) { var f = ev.target.closest('figure'); if (f) moDen(x, +f.dataset.i); });
  theoDoi(k);
}

/* xem ảnh toàn màn hình: mũi tên, phím, vuốt, Esc */
function moDen(x, i) {
  var d = $('#denAnh'), n = x.anh.length, truoc = document.activeElement;
  d.innerHTML = '<button class="dong" aria-label="Đóng">×</button>' + x.anh.map(function (id, t) { return '<figure data-i="' + t + '">' + hinh(id, x.ten + ' – ảnh ' + (t + 1), 2000) + '</figure>'; }).join('') +
    (n > 1 ? '<button class="mui-ten trai" data-buoc="-1" aria-label="Ảnh trước"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="mui-ten phai" data-buoc="1" aria-label="Ảnh sau"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7"/></svg></button>' : '') +
    '<span class="dem-anh"></span>';
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Ảnh ' + x.ten);
  function toi(j) { i = (j + n) % n; d.querySelectorAll('figure').forEach(function (f, t) { f.classList.toggle('on', t === i); }); d.querySelector('.dem-anh').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + n).slice(-2); }
  function dong() { d.classList.remove('mo'); document.body.classList.remove('khoa-cuon'); removeEventListener('keydown', phim, true); setTimeout(function () { d.hidden = true; d.innerHTML = ''; }, 350); if (truoc) truoc.focus(); }
  function phim(ev) { if (ev.key === 'Escape') dong(); else if (ev.key === 'ArrowLeft') toi(i - 1); else if (ev.key === 'ArrowRight') toi(i + 1); else return; ev.stopPropagation(); ev.preventDefault(); }
  d.onclick = function (ev) { var b = ev.target.closest('[data-buoc]'); if (b) toi(i + +b.dataset.buoc); else if (ev.target.closest('.dong') || !ev.target.closest('img')) dong(); };
  var x0 = null;
  d.ontouchstart = function (ev) { x0 = ev.touches[0].clientX; };
  d.ontouchend = function (ev) { if (x0 == null) return; var q = ev.changedTouches[0].clientX - x0; if (Math.abs(q) > 40) toi(i + (q < 0 ? 1 : -1)); x0 = null; };
  addEventListener('keydown', phim, true);
  d.hidden = false; document.body.classList.add('khoa-cuon'); toi(i);
  requestAnimationFrame(function () { d.classList.add('mo'); d.querySelector('.dong').focus(); });
}

/* dải "Cách Ngọc Trầm chọn từng món" — chữ lấy từ phần Nội dung trang chủ (app › Cài đặt web) */
function dungQuy() {
  var v = ((CH.noiDung || {}).van || {}).quy || {}, k = $('#spQuy');
  var buoc = [
    [v.b1t || 'Chọn ngọc', v.b1n || 'Từng viên ngọc được xem dưới ánh sáng tự nhiên — màu, độ trong, vân ngọc — trước khi vào kho.',
      '<circle pathLength="1" cx="40" cy="40" r="14"/><circle pathLength="1" cx="70" cy="34" r="14"/><circle pathLength="1" cx="100" cy="40" r="14"/><circle pathLength="1" cx="118" cy="66" r="14"/><circle pathLength="1" cx="28" cy="68" r="14"/><path pathLength="1" d="M64 74c0 0 0 14 11 24c11-10 11-24 11-24c-6-5-16-5-22 0z"/><path pathLength="1" d="M75 60v14"/>'],
    [v.b2t || 'Phối charm vàng', v.b2n || 'Chuỗi được phối với charm vàng theo tông ngọc, để mỗi bộ là một thiết kế không lặp lại.',
      '<path pathLength="1" d="M20 30c30 50 80 50 110 0"/><circle pathLength="1" cx="45" cy="58" r="7"/><circle pathLength="1" cx="75" cy="66" r="7"/><circle pathLength="1" cx="105" cy="58" r="7"/><path pathLength="1" d="M75 73v10"/><path pathLength="1" d="M66 92a9 9 0 1018 0c0-8-9-9-9-9s-9 1-9 9z"/><path pathLength="1" d="M75 101v8"/>'],
    [v.b3t || 'Đóng hộp & gửi đi', v.b3n || 'Mỗi món được kiểm tra lần cuối, gửi video cho bạn xem trước, rồi đóng hộp cẩn thận và giao tận nơi.',
      '<rect pathLength="1" x="30" y="50" width="90" height="60" rx="3"/><path pathLength="1" d="M24 50h102v-14H24z"/><path pathLength="1" d="M75 36v74"/><path pathLength="1" d="M75 36c-14-22-34-10-22 0M75 36c14-22 34-10 22 0"/>']];
  var tieu = (v.tieu || 'Cách Ngọc Trầm\n*chọn* từng món').split('\n');
  k.innerHTML = '<div class="khung"><h2 class="tieu-de">' + tieu.map(function (d) { return '<span class="dong-chu"><span>' + ndHtml(d) + '</span></span>'; }).join('') + '</h2>' +
    '<div class="buoc-ngang">' + buoc.map(function (b, i) {
      return '<article data-hien style="--i:' + i + '"><svg viewBox="0 0 150 130" aria-hidden="true">' + b[2] + '</svg><span class="so">0' + (i + 1) + '</span><h3>' + e(b[0]) + '</h3><p>' + e(b[1]) + '</p></article>'; }).join('') +
    '</div></div>';
  k.hidden = false; theoDoi(k);
}

/* hỏi đáp (app › Nội dung › Hỏi đáp) + gợi ý tự thiết kế với chuỗi / charm */
function dungHd(x) {
  var hd = (CH.noiDung || {}).hoiDap || [], k = $('#spHd');
  if (!hd.length) return;
  var goi = x.loai === 'chuoi' || x.loai === 'tron' || x.loai === 'charm' ? '<a class="goi-tk" href="thiet-ke.html" data-hien><span class="nho">Xưởng phối chuỗi · 3D</span>' +
    '<b>' + (x.loai === 'tron' ? 'Gắn thêm charm vàng <em>cho dây ngọc này</em>' : x.loai === 'chuoi' ? 'Thích dây ngọc này, muốn <em>phối kiểu khác?</em>' : 'Xem charm này <em>trên chuỗi của bạn</em>') + '</b>' +
    '<small>Chọn dây, nhập cỡ tay, gắn charm vàng vào đúng chỗ — xoay xem 3D như thật rồi gửi cho Ngọc Trầm xâu giúp.</small>' +
    '<span class="nut dac">Tự thiết kế <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></a>' : '';
  k.innerHTML = '<div class="khung"><div class="trai"><span class="nho" data-hien>Cần biết</span>' +
    '<h2 class="tieu-de"><span class="dong-chu"><span>Hỏi <em>&amp;</em> đáp</span></span></h2>' +
    '<p data-hien>Chưa thấy câu bạn cần? <a href="' + linkZalo() + '" target="_blank" data-chep="' + e(x.ma) + '">Nhắn Ngọc Trầm</a> kèm mã ' + e(x.ma) + '.</p>' + goi + '</div>' +
    '<div data-hien>' + hd.map(function (q, i) { return '<details' + (i ? '' : ' open') + '><summary>' + e(q.hoi) + '</summary><div class="tl"><div><p>' + e(q.dap) + '</p></div></div></details>'; }).join('') + '</div></div>';
  k.hidden = false; theoDoi(k);
}

/* món bạn vừa xem (nhớ trên máy khách, tối đa 12) */
function dungDaXem(x) {
  var kx = khoa(x), cu = [];
  try { cu = JSON.parse(localStorage.getItem('daXem') || '[]'); } catch (er) {}
  try { localStorage.setItem('daXem', JSON.stringify([kx].concat(cu.filter(function (m) { return m !== kx; })).slice(0, 12))); } catch (er) {}
  var mon = cu.filter(function (m) { return m !== kx; }).map(function (m) { return ds.filter(function (y) { return khoa(y) === m; })[0]; })
    .filter(function (y) { return y && y.tt !== 'Đã bán'; }).slice(0, 6);
  if (!mon.length) return;
  var k = $('#daXem');
  k.innerHTML = '<div class="khung"><div class="dau-dx"><span class="nho">Bạn vừa xem</span><button type="button" class="xoa-dx">Xoá lịch sử</button></div><div class="hang-dx">' +
    mon.map(function (y) { return '<a href="' + linkSp(y) + '">' + hinh(y.anh[0], y.ten, 300) + '<span>' + e(y.ten) + '</span><b>' + gia(y.gia) + '</b></a>'; }).join('') + '</div></div>';
  k.hidden = false;
  k.querySelector('.xoa-dx').onclick = function () { try { localStorage.setItem('daXem', JSON.stringify([kx])); } catch (er) {} k.hidden = true; };
}

function dungLienQuan(x) {
  var cung = ds.filter(function (y) { return y !== x && y.loai === x.loai && y.tt !== 'Đã bán'; });
  cung.sort(function (a, b) { return Math.abs(a.gia - x.gia) - Math.abs(b.gia - x.gia); });
  var them = cung.slice(0, 4);
  if (them.length < 4) them = them.concat(ds.filter(function (y) { return y !== x && them.indexOf(y) < 0 && y.loai !== 'charm'; }).slice(0, 4 - them.length));
  if (!them.length) return;
  $('#lienQuan').hidden = false;
  $('#luoiLq').innerHTML = them.map(the).join('');
  theoDoi($('#lienQuan'));
}

/* ♡ yêu thích (cần tài khoản) */
function veYt() { var b = $('#nutYt'); if (!b) return; var co = KHACH.yeuThich(b.dataset.ma); b.classList.toggle('on', co); b.innerHTML = '<span>' + (co ? '♥' : '♡') + '</span> ' + (co ? 'Đã lưu yêu thích' : 'Lưu vào yêu thích'); }
if (KHACH.bat) { KHACH.nghe.push(veYt); KHACH.san.then(function () { setTimeout(veYt, 300); }); }
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('#nutYt'); if (!b) return;
  if (!KHACH.user) return KHACH.canDangNhap();
  b.disabled = true;
  KHACH.doiYeuThich(b.dataset.ma).then(function (moi) { baoTin(moi ? 'Đã lưu vào yêu thích' : 'Đã bỏ khỏi yêu thích'); veYt(); })
    .catch(function () { baoTin('Chưa lưu được, thử lại nhé'); }).then(function () { b.disabled = false; });
});
