/* =========================================================
   TỰ THIẾT KẾ CHUỖI
   - Chọn dây ngọc, số vòng quấn (1–5), cỡ tay.
   - Thiết kế TỪNG VÒNG riêng (tab Vòng 1, Vòng 2…), charm gắn ở hạt thứ j của vòng k.
   - "Đeo thử": vẽ cả chuỗi quấn trên cổ tay, kéo ngang để xoay.
   - Chỉ TỔNG giá là ước tính (≈, làm tròn); giá dây và giá charm giữ nguyên.
   Lưu vào link (#d=…&t=…&v=…&c=id@k.j,…) và máy khách (localStorage).
   ========================================================= */
var TK = {day: [], charm: []}, chon = {day: null, tay: 15, vong: 1, gan: []};   // gan: [{c, k: vòng, j: hạt}]
var dangChon = null, vongDang = 0, cheDo = 'sua';   // dangChon = charm đang chọn (object trong chon.gan)
var nhomLoc = 'tat', tuCharm = '', xepC = 're', soCharmHien = 0, MOI = 24, TOI_DA = +((CH.thietKe || {}).toiDaCharm) || 12;
var CX = 200, CY = 200, R = 150, VONG_GIA = +((CH.thietKe || {}).vongGia) || 3;   // giá dây trong app là giá dây quấn 3 vòng

fetch('thiet-ke.json', {cache: 'no-cache'}).then(function (r) { return r.json(); }).then(function (d) {
  TK = d; docLai(); dungDay(); dungVong(); dungChip(); hienCharm(true); ve(true);
});

/* ---------- tính toán ---------- */
function soHat() {           // hạt MỖI vòng: chu vi = cỡ tay + 1,5 cm độ rộng; mỗi hạt = cỡ hạt (ly ≈ mm)
  var co = chon.day ? chon.day.co : 6;
  return Math.max(16, Math.round((chon.tay + 1.5) * 10 / co));
}
function tongHat() { return soHat() * chon.vong; }
function giaDay(d, v) { d = d || chon.day; return d ? Math.round(d.gia * (v || chon.vong) / VONG_GIA / 1000) * 1000 : 0; }
function tong() { return giaDay() + chon.gan.reduce(function (s, g) { return s + g.c.gia; }, 0); }
function uoc(n) { return '≈ ' + gia(Math.round(n / 10000) * 10000); }   // chỉ dùng cho TỔNG giá ước tính
function cuaVong(k) { return chon.gan.filter(function (g) { return g.k === k; }); }
function oDo(k, j) { return chon.gan.filter(function (g) { return g.k === k && g.j === j; })[0]; }
function rHat() { return R * Math.sin(Math.PI / soHat()) * 1.02; }
function xyHat(j) { var n = soHat(), a = -Math.PI / 2 + j * 2 * Math.PI / n; return [CX + R * Math.cos(a), CY + R * Math.sin(a)]; }
function viTriTrong(k) {   // chỗ trống của vòng k, ưu tiên phía trước (đáy vòng), xen kẽ trái – phải
  var n = soHat(), goc = Math.round(n / 2);
  for (var t = 0; t < n; t++) { var j = (goc + (t % 2 ? -1 : 1) * Math.ceil(t / 2) * 2 + n * 4) % n; if (!oDo(k, j)) return j; }
  for (j = 0; j < n; j++) if (!oDo(k, j)) return j;
  return -1;
}
function tenVt(g) { return (chon.vong > 1 ? 'vòng ' + (g.k + 1) + ', ' : '') + 'hạt ' + (g.j + 1) + '/' + soHat(); }
function chuanHoa() {      // khi đổi cỡ tay / số vòng: kéo charm về trong phạm vi, tránh trùng chỗ
  var n = soHat(), bo = 0;
  chon.gan = chon.gan.filter(function (g) { if (g.k >= chon.vong) { bo++; return false; } return true; });
  var dung = {};
  chon.gan.forEach(function (g) {
    g.j = Math.min(g.j, n - 1);
    while (dung[g.k + '.' + g.j]) g.j = (g.j + 1) % n;
    dung[g.k + '.' + g.j] = 1;
  });
  if (vongDang >= chon.vong) vongDang = chon.vong - 1;
  return bo;
}
function pha(hex, t) {   // làm tối màu một chút để hạt không đều màu
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
  return 'rgb(' + Math.round(r * (1 - t)) + ',' + Math.round(g * (1 - t)) + ',' + Math.round(b * (1 - t)) + ')';
}
function defsChung(rc) {
  var mau = chon.day ? chon.day.mau : ['#e4dfd0', '#a49f8c'], h = '';
  [0, 1, 2].forEach(function (k) {   // 3 sắc độ ngọc khác nhau cho tự nhiên
    h += '<radialGradient id="ng' + k + '" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".85"/>' +
      '<stop offset=".18" stop-color="' + pha(mau[0], k * .07) + '"/><stop offset=".75" stop-color="' + pha(mau[1], k * .05) + '"/>' +
      '<stop offset="1" stop-color="' + pha(mau[1], .25) + '"/></radialGradient>';
  });
  h += '<radialGradient id="vangKim" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff3cf"/><stop offset=".45" stop-color="#d9b56a"/><stop offset="1" stop-color="#8a6420"/></radialGradient>';
  h += '<clipPath id="tronCharm"><circle r="' + rc.toFixed(2) + '"/></clipPath>';
  h += '<filter id="bong" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#1d3a46" flood-opacity=".28"/></filter>';
  return h;
}
function svgHat(r, k) {
  return '<circle r="' + r.toFixed(2) + '" fill="url(#ng' + k + ')" filter="url(#bong)"/>' +
    '<ellipse cx="' + (-r * .32).toFixed(2) + '" cy="' + (-r * .38).toFixed(2) + '" rx="' + (r * .28).toFixed(2) + '" ry="' + (r * .16).toFixed(2) + '" fill="#fff" opacity=".55" transform="rotate(-30)"/>';
}
function svgCharm(g, rc, sel) {
  return (sel ? '<circle r="' + (rc + 7) + '" class="vong-chon" fill="none" stroke="#a8823a" stroke-width="1.2" stroke-dasharray="3 3"/>' : '') +
    '<circle r="' + (rc + 2.6) + '" fill="url(#vangKim)" filter="url(#bong)"/>' +
    '<image href="' + anh(g.c.anh, 200) + '" x="' + (-rc) + '" y="' + (-rc) + '" width="' + (2 * rc) + '" height="' + (2 * rc) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#tronCharm)"/>' +
    '<circle r="' + rc + '" fill="none" stroke="#fff6dc" stroke-width=".8" opacity=".8"/>';
}

/* ---------- vẽ ---------- */
function ve(lanDau) {
  chuanHoa();
  $('.tk-san').classList.toggle('deo', cheDo === 'deo');
  if (cheDo === 'deo') veTay(); else veVong(lanDau);
  dungTabVong(); bong(); tomTat(); luu(); capMini();
}

/* chế độ thiết kế: chỉ vẽ vòng đang chọn */
function veVong(lanDau) {
  dungTu = false;
  var n = soHat(), r = rHat(), rc = r * 1.55, k = vongDang, h = '<defs>' + defsChung(rc) + '</defs>';
  h += '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="none" stroke="rgba(29,58,70,.18)" stroke-width="1.2"/>';
  for (var j = 0; j < n; j++) {
    if (oDo(k, j)) continue;
    var p = xyHat(j), d = lanDau ? ' style="animation-delay:' + (j * 18) + 'ms"' : '';
    h += '<g class="hat' + (lanDau ? ' moc' : '') + '"' + d + ' transform="translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')">' + svgHat(r, (k * 5 + j * 7) % 3) + '</g>';
  }
  cuaVong(k).forEach(function (g) {
    var p = xyHat(g.j);
    h += '<g class="charm-g' + (g === dangChon ? ' chon' : '') + (g.moi ? ' moi' : '') + '" data-o="' + g.k + '.' + g.j + '" transform="translate(' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + ')">' +
      '<g class="noi-charm">' + svgCharm(g, rc, g === dangChon) + '</g></g>';
    g.moi = false;
  });
  $('#vong').innerHTML = h;
  $('#nhanGiua').innerHTML = chon.day
    ? '<small>' + (chon.vong > 1 ? 'Vòng ' + (k + 1) + '/' + chon.vong + ' · ' : '') + n + ' hạt · ' + String(chon.day.co).replace('.', ',') + ' ly</small><b>' + e(chon.day.ten.replace(/\s*\d+([.,]\d+)? ly/, '')) + '</b><span>' + uoc(tong()) + '</span>'
    : '<small>Bắt đầu</small><b>Chọn dây ngọc</b><span>ở bước 01</span>';
}

/* tab vòng + nút đeo thử */
function dungTabVong() {
  var L = chon.vong, n = soHat(), h = '';
  if (L > 1) for (var k = 0; k < L; k++) {
    var c = cuaVong(k), cham = c.map(function (g) { var a = -Math.PI / 2 + g.j * 2 * Math.PI / n; return '<circle cx="' + (12 + 8 * Math.cos(a)).toFixed(1) + '" cy="' + (12 + 8 * Math.sin(a)).toFixed(1) + '" r="2.2" fill="#c9a35c" stroke="none"/>'; }).join('');
    h += '<button class="' + (cheDo === 'sua' && k === vongDang ? 'on' : '') + '" data-k="' + k + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="8"/>' + cham + '</svg>Vòng ' + (k + 1) + '<small>' + c.length + '</small></button>';
  }
  else h += '<button class="' + (cheDo === 'sua' ? 'on' : '') + '" data-k="0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="8"/></svg>Thiết kế</button>';
  h += '<button class="deo-thu' + (cheDo === 'deo' ? ' on' : '') + '" data-deo><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 9c4-1 8-1 12 0l4-2c1 0 2 1 1.5 2L17 12l3.5 3c.5 1-.5 2-1.5 2l-4-2c-4 1-8 1-12 0"/><ellipse cx="10" cy="12" rx="2" ry="4.2"/></svg>Đeo thử trên tay</button>';
  $('#tabVong').innerHTML = h;
  var xoa = $('[data-lam="xoa"]'); if (xoa) xoa.lastChild.textContent = L > 1 ? 'Bỏ charm vòng này' : 'Bỏ hết charm';
}
$('#tabVong').addEventListener('click', function (ev) {
  var b = ev.target.closest('button'); if (!b) return;
  dangChon = null;
  if (b.hasAttribute('data-deo')) { if (!chon.day) { baoTin('Chọn dây ngọc ở bước 01 trước nhé'); return; } cheDo = 'deo'; }
  else { cheDo = 'sua'; vongDang = +b.dataset.k; }
  ve(true);
});

/* ---------- ĐEO THỬ: cả chuỗi quấn trên cổ tay, kéo ngang để xoay ---------- */
var tay = null, xoay = 0, dungTu = false;
function veTay() {
  var n = soHat(), L = chon.vong, s = 3.3, co = chon.day ? chon.day.co : 6, r = co / 2 * s,
      b = (chon.tay + 1.5) * 10 / (2 * Math.PI) * s, h0 = chon.tay * 10 / (2 * Math.PI) * s, a = b * .36, rc = r * 1.75,
      buocX = r * 2.05, xc = 196 + (L - 1) * buocX / 2, Y = 192, hx = xc + r * 2.6, u = h0 / 57;   // hx: chỗ cổ tay nối bàn tay
  var cs = []; for (var k = 0; k < L; k++) cs.push(xc - k * buocX);
  function X(v) { return (hx + v * u).toFixed(1); }
  function Yd(v) { return (v * u).toFixed(1); }
  // cánh tay nằm ngang, bàn tay bên phải (toạ độ bàn tay co giãn theo cỡ cổ tay)
  var T = Y - h0, B = Y + h0;
  var canhTay = 'M-40,' + (T - 30) + ' C60,' + (T - 22) + ' ' + (hx - 70) + ',' + (T - 4) + ' ' + hx + ',' + T +
    ' C' + X(28) + ',' + (T - +Yd(3)) + ' ' + X(50) + ',' + (T - +Yd(8)) + ' ' + X(76) + ',' + (T - +Yd(5)) +
    ' C' + X(108) + ',' + (T + +Yd(1)) + ' ' + X(136) + ',' + (T + +Yd(12)) + ' ' + X(140) + ',' + (Y - +Yd(16)) +
    ' C' + X(146) + ',' + (Y + +Yd(6)) + ' ' + X(138) + ',' + (B - +Yd(10)) + ' ' + X(112) + ',' + (B + +Yd(2)) +
    ' C' + X(80) + ',' + (B + +Yd(7)) + ' ' + X(30) + ',' + (B + +Yd(2)) + ' ' + hx + ',' + B +
    ' C' + (hx - 70) + ',' + (B + 5) + ' 60,' + (B + 22) + ' -40,' + (B + 30) + ' Z';
  var ngonCai = 'M' + X(30) + ',' + (T - +Yd(2)) + ' C' + X(44) + ',' + (T - +Yd(26)) + ' ' + X(74) + ',' + (T - +Yd(38)) + ' ' + X(94) + ',' + (T - +Yd(30)) +
    ' C' + X(106) + ',' + (T - +Yd(24)) + ' ' + X(96) + ',' + (T - +Yd(10)) + ' ' + X(72) + ',' + (T - +Yd(4)) + ' Z';
  var ke = ''; [-.42, .04, .46].forEach(function (t) { var y = Y + t * h0; ke += '<path d="M' + X(88) + ',' + (y - 2).toFixed(1) + ' C' + X(108) + ',' + y.toFixed(1) + ' ' + X(124) + ',' + (y + 1).toFixed(1) + ' ' + X(138) + ',' + (y + 3).toFixed(1) + '" stroke="rgba(150,96,70,.25)" stroke-width="1.2" fill="none"/>'; });
  var items = '';
  for (k = 0; k < L; k++) for (var j = 0; j < n; j++) {
    var g = oDo(k, j);
    items += '<g class="t-hat" data-k="' + k + '" data-j="' + j + '"' + (g ? ' data-o="' + k + '.' + j + '"' : '') + '>' + (g ? svgCharm(g, rc, false) : svgHat(r, (k * 5 + j * 7) % 3)) + '</g>';
  }
  $('#vong').innerHTML = '<defs>' + defsChung(rc) +
    '<linearGradient id="da" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dac6"/><stop offset=".45" stop-color="#e7bfa3"/><stop offset="1" stop-color="#c9937a"/></linearGradient>' +
    '<radialGradient id="bongTay" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#1d3a46" stop-opacity=".22"/><stop offset="1" stop-color="#1d3a46" stop-opacity="0"/></radialGradient>' +
    '<clipPath id="khungTay"><circle cx="200" cy="200" r="199"/></clipPath></defs>' +
    '<g clip-path="url(#khungTay)"><ellipse cx="200" cy="' + (B + 46) + '" rx="230" ry="26" fill="url(#bongTay)"/>' +
    '<g id="tauSau"></g><path d="' + canhTay + '" fill="url(#da)"/><path d="' + ngonCai + '" fill="url(#da)" stroke="rgba(150,96,70,.25)" stroke-width="1"/>' + ke +
    '<path d="M-40,' + (T - 14) + ' C80,' + (T - 6) + ' 170,' + (T + 4) + ' ' + hx + ',' + (T + 8) + '" stroke="#fff" stroke-opacity=".35" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<g id="tayTruoc">' + items + '</g></g>';
  tay = {n: n, L: L, b: b, a: a, Y: Y, cs: cs, nut: $$('#vong .t-hat'), sau: $('#tauSau'), truoc: $('#tayTruoc')};
  $('#nhanGiua').innerHTML = '';
  capNhatTay();
  if (!dungTu && !GIAM) tuXoay();
}
function capNhatTay() {
  if (!tay) return;
  var ds = tay.nut.map(function (el) {
    var k = +el.dataset.k, j = +el.dataset.j, f = 2 * Math.PI * (j - tay.n / 2) / tay.n + xoay, sau = Math.cos(f);
    var x = tay.cs[k] + tay.a * sau, y = tay.Y + tay.b * Math.sin(f), sc = .86 + .14 * sau;
    el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(3) + ')');
    el.style.opacity = sau < 0 ? (.75 + .25 * (1 + sau)).toFixed(2) : 1;
    return {el: el, sau: sau};
  });
  ds.sort(function (p, q) { return p.sau - q.sau; });
  ds.forEach(function (p) { (p.sau < 0 ? tay.sau : tay.truoc).appendChild(p.el); });
}
var henXoay = 0;
function tuXoay() {   // xoay chậm tự động cho tới khi khách tự kéo
  cancelAnimationFrame(henXoay);
  (function b() { if (cheDo !== 'deo' || dungTu) return; xoay += .006; capNhatTay(); henXoay = requestAnimationFrame(b); })();
}

/* ---------- bong bóng thông tin charm đang chọn ---------- */
function bong() {
  var b = $('#bongCharm'), g = dangChon;
  if (!g || cheDo !== 'sua' || chon.gan.indexOf(g) < 0) { b.hidden = true; return; }
  var p = xyHat(g.j), k = $('#vong').getBoundingClientRect().width / 400;
  b.hidden = false;
  b.innerHTML = '<b>' + e(g.c.ten) + '</b><span>' + gia(g.c.gia) + ' · ' + tenVt(g) + '</span>' +
    '<div><button data-dich="-1" aria-label="Dời sang trái">‹</button><button data-dich="1" aria-label="Dời sang phải">›</button>' +
    (chon.vong > 1 ? '<select data-sang aria-label="Chuyển sang vòng khác"><option value="">Sang vòng…</option>' +
      Array.from({length: chon.vong}, function (_, i) { return i === g.k ? '' : '<option value="' + i + '">Vòng ' + (i + 1) + '</option>'; }).join('') + '</select>' : '') +
    '<button data-bo>Bỏ</button></div>';
  b.style.left = p[0] * k + 'px'; b.style.top = p[1] * k + 'px';
  b.className = 'bong-charm ' + (p[1] > CY ? 'tren' : 'duoi');
}
function doiCho(g, k, j) {
  var khac = oDo(k, j);
  if (khac && khac !== g) { khac.k = g.k; khac.j = g.j; }
  g.k = k; g.j = j; dangChon = g; ve();
}
$('#bongCharm').addEventListener('click', function (ev) {
  var g = dangChon; if (!g) return;
  var d = ev.target.closest('[data-dich]'), n = soHat();
  if (d) doiCho(g, g.k, (g.j + +d.dataset.dich + n) % n);
  if (ev.target.closest('[data-bo]')) boMot(g);
});
$('#bongCharm').addEventListener('change', function (ev) {
  var s = ev.target.closest('[data-sang]'), g = dangChon; if (!s || !g || s.value === '') return;
  var k = +s.value, j = oDo(k, g.j) ? viTriTrong(k) : g.j;
  if (j < 0) { baoTin('Vòng ' + (k + 1) + ' đã đầy'); return; }
  g.k = k; g.j = j; vongDang = k; dangChon = g; ve();
  baoTin('Đã chuyển charm sang vòng ' + (k + 1));
});

/* ---------- kéo: thiết kế = đổi chỗ charm; đeo thử = xoay tay ---------- */
(function () {
  var svg = $('#vong'), keo = null;
  function jTuChuot(ev) {
    var r = svg.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * 400 - CX, y = (ev.clientY - r.top) / r.height * 400 - CY;
    var a = Math.atan2(y, x) + Math.PI / 2, n = soHat();
    return ((Math.round(a / (2 * Math.PI) * n) % n) + n) % n;
  }
  svg.addEventListener('pointerdown', function (ev) {
    if (cheDo === 'deo') { dungTu = true; keo = {x: ev.clientX, xoay: xoay, tay: true}; svg.setPointerCapture(ev.pointerId); ev.preventDefault(); return; }
    var el = ev.target.closest('.charm-g');
    if (!el) { if (dangChon) { dangChon = null; ve(); } return; }
    var p = el.dataset.o.split('.'), g = oDo(+p[0], +p[1]);
    keo = {g: g, dichuyen: false}; svg.setPointerCapture(ev.pointerId); ev.preventDefault();
  });
  svg.addEventListener('pointermove', function (ev) {
    if (!keo) return;
    if (keo.tay) { xoay = keo.xoay + (ev.clientX - keo.x) * .012; capNhatTay(); return; }
    var j = jTuChuot(ev); if (j === keo.g.j) return;
    doiCho(keo.g, keo.g.k, j); keo.dichuyen = true;
  });
  svg.addEventListener('pointerup', function () {
    if (keo && !keo.tay && !keo.dichuyen) { dangChon = dangChon === keo.g ? null : keo.g; ve(); }
    keo = null;
  });
})();
addEventListener('resize', bong);

/* ---------- số vòng quấn ---------- */
function dungVong() {
  $('#soVong').innerHTML = [1, 2, 3, 4, 5].map(function (v) {
    var vong = ''; for (var k = 0; k < v; k++) vong += '<ellipse cx="16" cy="' + (16 + (k - (v - 1) / 2) * 3.2).toFixed(1) + '" rx="11" ry="4.2"/>';
    return '<button class="' + (v === chon.vong ? 'on' : '') + '" data-v="' + v + '"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2">' + vong + '</svg>' +
      '<b>' + v + ' vòng</b><small>' + (chon.day ? gia(giaDay(chon.day, v)) : (v === 1 ? 'quấn đơn' : 'quấn ' + v)) + '</small></button>';
  }).join('');
}
$('#soVong').addEventListener('click', function (ev) {
  var b = ev.target.closest('button'); if (!b) return;
  chon.vong = +b.dataset.v; dangChon = null;
  var bo = chuanHoa();
  if (bo) { baoTin('Đã bỏ ' + bo + ' charm ở các vòng bị bớt'); danhDauDa(); }
  dungVong(); dungDay(); ve(true);
});

/* ---------- bước 01: dây nền ---------- */
function dungDay() {
  $('#dsDay').innerHTML = TK.day.map(function (d, i) {
    return '<button class="the-day' + (chon.day === d ? ' on' : '') + '" data-i="' + i + '">' +
      '<span class="mau-hat" style="background:radial-gradient(circle at 35% 30%,#fff 0,' + d.mau[0] + ' 22%,' + d.mau[1] + ' 85%)"></span>' +
      '<span class="tt-day"><b>' + e(d.ten) + '</b><small>#' + e(d.ma) + ' · hạt ' + String(d.co).replace('.', ',') + ' ly</small></span>' +
      '<span class="gia-day">' + gia(giaDay(d)) + '<small>' + chon.vong + ' vòng</small></span>' +
      (d.anh ? '<span class="xem-day">' + hinh(d.anh, d.ten, 300) + '</span>' : '') + '</button>';
  }).join('');
}
$('#dsDay').addEventListener('click', function (ev) {
  var b = ev.target.closest('.the-day'); if (!b) return;
  chon.day = TK.day[+b.dataset.i]; dungDay(); dungVong(); ve(true);
});
$('#coTay').addEventListener('input', function () { chon.tay = +this.value; $('#gtTay').textContent = String(chon.tay).replace('.', ',') + ' cm'; ve(); });

/* ---------- bước 03: charm ---------- */
function dungChip() {
  var dem = {}; TK.charm.forEach(function (c) { dem[c.nhom] = (dem[c.nhom] || 0) + 1; });
  var ds = Object.keys(dem).sort(function (a, b) { return a === 'Khác' ? 1 : b === 'Khác' ? -1 : dem[b] - dem[a]; });
  $('#chipNhom').innerHTML = '<button class="on" data-n="tat">Tất cả<span>' + TK.charm.length + '</span></button>' +
    ds.map(function (n) { return '<button data-n="' + e(n) + '">' + e(n) + '<span>' + dem[n] + '</span></button>'; }).join('');
}
$('#chipNhom').addEventListener('click', function (ev) {
  var b = ev.target.closest('button'); if (!b) return;
  nhomLoc = b.dataset.n; $$('#chipNhom button').forEach(function (x) { x.classList.toggle('on', x === b); }); hienCharm(true);
});
var henC; $('#timCharm').oninput = function () { clearTimeout(henC); var v = this.value; henC = setTimeout(function () { tuCharm = boDau(v.trim()); hienCharm(true); }, 160); };
$('#xepCharm').onchange = function () { xepC = this.value; hienCharm(true); };
$('#themCharm').onclick = function () { hienCharm(false); };
function soGan(c) { return chon.gan.filter(function (g) { return g.c === c; }).length; }   // 1 charm có thể gắn nhiều lần
function daGan(c) { return soGan(c) > 0; }
function danhDauDa() { $$('#dsCharm .the-charm').forEach(function (b) {
  var n = chon.gan.filter(function (g) { return g.c.id === b.dataset.id; }).length;
  b.classList.toggle('da', n > 0); b.querySelector('.so-gan').textContent = n > 1 ? '×' + n : '';
}); }
function hienCharm(lai) {
  var r = TK.charm.filter(function (c) { return (nhomLoc === 'tat' || c.nhom === nhomLoc) && (!tuCharm || boDau(c.ten + ' ' + c.ma).indexOf(tuCharm) >= 0); });
  r.sort(function (a, b) { return xepC === 're' ? a.gia - b.gia : b.gia - a.gia; });
  if (lai) { soCharmHien = 0; $('#dsCharm').innerHTML = ''; }
  var moi = r.slice(soCharmHien, soCharmHien + MOI); soCharmHien += moi.length;
  $('#dsCharm').insertAdjacentHTML('beforeend', moi.map(function (c) {
    return '<button class="the-charm' + (daGan(c) ? ' da' : '') + '" data-id="' + e(c.id) + '"><span class="h-vo"><span class="h">' + hinh(c.anh, c.ten, 300) + '</span>' +
      '<i class="dau-cong"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path class="cong" d="M12 6v12M6 12h12"/><path class="tick" d="M6 12.5l4 4 8-9"/></svg></i>' +
      '<em class="so-gan">' + (soGan(c) > 1 ? '×' + soGan(c) : '') + '</em><i class="bot-charm" role="button" aria-label="Gỡ bớt một charm này" title="Gỡ bớt 1">−</i></span>' +
      '<b>' + e(c.ten) + '</b><small>' + gia(c.gia) + '</small></button>';
  }).join(''));
  if (!r.length) $('#dsCharm').innerHTML = '<p class="rong">Không có charm nào khớp.</p>';
  $('#themCharm').style.display = soCharmHien < r.length ? '' : 'none';
  $('#themCharm').textContent = 'Xem thêm · ' + (r.length - soCharmHien) + ' charm';
}
$('#dsCharm').addEventListener('click', function (ev) {
  var b = ev.target.closest('.the-charm'); if (!b) return;
  var c = TK.charm.filter(function (x) { return x.id === b.dataset.id; })[0];
  if (ev.target.closest('.bot-charm')) {   // gỡ bớt viên gắn sau cùng
    var cuoi = chon.gan.filter(function (g) { return g.c === c; }).pop(); if (cuoi) boMot(cuoi); return;
  }
  if (!chon.day) { baoTin('Chọn dây ngọc ở bước 01 trước nhé'); $('#dsDay').scrollIntoView({block: 'center'}); return; }
  if (chon.gan.length >= TOI_DA) { baoTin('Tối đa ' + TOI_DA + ' charm cho một chuỗi'); return; }
  if (cheDo === 'deo') cheDo = 'sua';
  var j = viTriTrong(vongDang);
  if (j < 0) { baoTin('Vòng ' + (vongDang + 1) + ' đã đầy'); return; }
  chon.gan.push({c: c, k: vongDang, j: j, moi: true}); dangChon = null;
  danhDauDa(); ve();
  if (chon.vong > 1) baoTin('Đã gắn vào vòng ' + (vongDang + 1));
  nhayMini();
});
function boMot(g) { chon.gan = chon.gan.filter(function (x) { return x !== g; }); dangChon = null; danhDauDa(); ve(); }
function boCharm(c) {
  chon.gan = chon.gan.filter(function (g) { return g.c !== c; }); dangChon = null;
  danhDauDa(); ve();
}

/* ---------- công cụ (áp cho vòng đang thiết kế) ---------- */
$('.cong-cu').addEventListener('click', function (ev) {
  var b = ev.target.closest('[data-lam]'); if (!b) return;
  var n = soHat(), ds = cuaVong(vongDang), m = ds.length, lam = b.dataset.lam;
  if (lam === 'deu' && m) { ds.forEach(function (g, i) { g.j = Math.round(n / 2 + i * n / m) % n; }); dangChon = null; ve(); }
  if (lam === 'gom' && m) { ds.forEach(function (g) { g.j = -1; }); ds.forEach(function (g) { g.j = viTriTrong(vongDang); }); dangChon = null; ve(); }
  if (lam === 'xoa') { chon.gan = chon.gan.filter(function (g) { return chon.vong > 1 && g.k !== vongDang; }); dangChon = null; danhDauDa(); ve(); }
  if (lam === 'link') { if (navigator.clipboard) navigator.clipboard.writeText(location.href).catch(function () {}); baoTin('Đã chép link thiết kế — gửi cho bạn bè xem nhé'); }
});

/* ---------- tóm tắt + gửi ---------- */
function thuTu() { return chon.gan.slice().sort(function (a, b) { return a.k - b.k || a.j - b.j; }); }
function tinNhan() {
  var n = soHat(), L = chon.vong;
  return 'Chào Ngọc Trầm, mình muốn đặt chuỗi tự thiết kế:\n' +
    '• Dây: ' + chon.day.ten + ' (mã ' + chon.day.ma + ')\n' +
    '• Kiểu: quấn ' + L + ' vòng · cỡ tay ' + String(chon.tay).replace('.', ',') + ' cm (~' + n * L + ' hạt, ' + n + ' hạt/vòng)\n' +
    '• Giá dây ' + L + ' vòng: ' + gia(giaDay()) + '\n' +
    (chon.gan.length ? '• Charm (đếm hạt theo chiều kim đồng hồ từ khoá' + (L > 1 ? ', vòng 1 là vòng sát bàn tay' : '') + '):\n' + thuTu().map(function (g) { return '   – ' + tenVt(g) + ': ' + g.c.ma + ' ' + g.c.ten + ' (' + gia(g.c.gia) + ')'; }).join('\n') + '\n' : '• Không gắn charm\n') +
    '• Tổng ước tính: ' + uoc(tong()) + ' (nhờ shop báo giá chính xác)\n' +
    'Xem thiết kế: ' + location.href;
}
function tomTat() {
  var n = tongHat();
  if (!chon.day) { $('#tomTat').innerHTML = ''; $('#thanhTk').classList.remove('hien'); return; }
  $('#tomTat').innerHTML = '<header><span class="so-buoc">04</span><h2>Thiết kế của bạn</h2></header>' +
    '<ul class="dong-tt"><li><span>' + e(chon.day.ten) + '<small>Dây quấn ' + chon.vong + ' vòng · ' + n + ' hạt · cỡ tay ' + String(chon.tay).replace('.', ',') + ' cm</small></span><b>' + gia(giaDay()) + '</b></li>' +
    thuTu().map(function (g) { return '<li><span>' + e(g.c.ten) + '<small>Charm #' + e(g.c.ma) + ' · ' + tenVt(g) + '</small></span><b>' + gia(g.c.gia) + '</b></li>'; }).join('') + '</ul>' +
    '<div class="tong-tt"><span>Tổng ước tính</span><b>' + uoc(tong()) + '</b></div>' +
    '<p class="ghi-tt">Tổng chỉ là giá xấp xỉ để bạn tham khảo. Giá chính xác cửa hàng sẽ báo lại sau khi xem thiết kế, kiểm tra hàng còn và tiền công xâu.</p>' +
    '<p class="ghi-tt luu-y">' + e(CHINH_SACH.luuY[0]) + '</p>' +
    '<div class="hang-mua"><a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-gui>Gửi thiết kế qua Zalo</a>' +
    '<a class="nut" href="' + linkFb() + '" target="_blank" data-gui>Gửi qua Messenger</a></div>' +
    (KHACH.bat ? '<button class="nut nut-luu-tk" id="luuTk">♡ Lưu vào tài khoản</button>' : '');
  $('#thanhTk').innerHTML = '<div><small>Tổng ước tính · ' + chon.gan.length + ' charm</small><b>' + uoc(tong()) + '</b></div><a class="nut dac zalo" href="' + linkZalo() + '" target="_blank" data-gui>Gửi qua Zalo</a>';
  $('#thanhTk').classList.add('hien');
  $('#demCharm').textContent = chon.gan.length + ' / ' + TOI_DA + ' charm';
}
document.addEventListener('click', function (ev) {
  if (!ev.target.closest('[data-gui]') || !chon.day) return;
  if (navigator.clipboard) navigator.clipboard.writeText(tinNhan()).catch(function () {});
  baoTin('Đã chép thiết kế — dán vào tin nhắn để gửi cửa hàng');
});

/* ---------- lưu / đọc lại (link + máy) ---------- */
function luu() {
  if (!chon.day) return;
  var h = 'd=' + encodeURIComponent(chon.day.ma) + '&t=' + chon.tay + '&v=' + chon.vong +
    (chon.gan.length ? '&c=' + thuTu().map(function (g) { return encodeURIComponent(g.c.id) + '@' + g.k + '.' + g.j; }).join(',') : '');
  history.replaceState(null, '', '#' + h);
  try { localStorage.setItem('nt-thiet-ke', h); } catch (er) {}
}
function docLai() {
  var h = location.hash.slice(1);
  if (!h) try { h = localStorage.getItem('nt-thiet-ke') || ''; } catch (er) {}
  var q = new URLSearchParams(h);
  chon.day = TK.day.filter(function (d) { return d.ma === q.get('d'); })[0] || null;
  if (q.get('t')) { chon.tay = Math.min(20, Math.max(12, +q.get('t') || 15)); $('#coTay').value = chon.tay; $('#gtTay').textContent = String(chon.tay).replace('.', ',') + ' cm'; }
  if (q.get('v')) chon.vong = Math.min(5, Math.max(1, Math.round(+q.get('v') || 1)));
  var n = soHat();
  (q.get('c') || '').split(',').forEach(function (s) {
    var p = s.split('@'), c = TK.charm.filter(function (x) { return x.id === decodeURIComponent(p[0]); })[0];
    if (!c) return;
    var vt = String(p[1] || '0'), k, j;
    if (vt.indexOf('.') >= 0) { k = +vt.split('.')[0]; j = +vt.split('.')[1]; } else { k = Math.floor(+vt / n); j = +vt % n; }   // link cũ: số thứ tự trên cả dây
    chon.gan.push({c: c, k: k || 0, j: j || 0});
  });
}

/* ---------- rê chuột vào charm → hiện ảnh lớn bay theo chuột (máy tính) ---------- */
(function () {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var x = document.createElement('div'); x.className = 'xem-charm'; x.setAttribute('aria-hidden', 'true');
  document.body.appendChild(x);
  var dang = null, mx = 0, my = 0, px = 0, py = 0, chay = false, W = 260, H = 340;
  function timCharm(el) {
    var t = el.closest('.the-charm');
    if (t) return TK.charm.filter(function (c) { return c.id === t.dataset.id; })[0];
    var g = el.closest('[data-o]');
    if (g) { var p = g.dataset.o.split('.'), o = oDo(+p[0], +p[1]); return o && o.c; }
  }
  function dich() {   // đặt khung lệch phải-dưới con trỏ, lật lại khi chạm mép màn hình
    var tx = mx + 24, ty = my + 24;
    if (tx + W > innerWidth - 12) tx = mx - W - 24;
    if (ty + H > innerHeight - 12) ty = innerHeight - H - 12;
    return [tx, Math.max(12, ty)];
  }
  function buoc() {
    var d = dich(); px += (d[0] - px) * .2; py += (d[1] - py) * .2;
    x.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0)';
    if (dang) requestAnimationFrame(buoc); else chay = false;
  }
  document.addEventListener('mouseover', function (ev) {
    var c = timCharm(ev.target);
    if (!c || ev.buttons) { if (!ev.target.closest('.the-charm,[data-o]')) an(); return; }
    mx = ev.clientX; my = ev.clientY;
    if (dang !== c) {
      dang = c;
      x.innerHTML = '<span class="h"><img src="' + anh(c.anh, 640) + '" alt="" referrerpolicy="no-referrer"></span>' +
        '<b>' + e(c.ten) + '</b><span class="g">' + gia(c.gia) + '<small>#' + e(c.ma) + '</small></span>';
    }
    if (!x.classList.contains('on')) { var d = dich(); px = d[0]; py = d[1]; x.classList.add('on'); }
    if (!chay) { chay = true; buoc(); }
  });
  document.addEventListener('mousemove', function (ev) { mx = ev.clientX; my = ev.clientY; if (ev.buttons && dang) an(); }, {passive: true});
  function an() { dang = null; x.classList.remove('on'); }
  addEventListener('scroll', an, {passive: true});
})();

/* lưu thiết kế vào tài khoản khách */
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('#luuTk'); if (!b || !chon.day) return;
  if (!KHACH.user) { luu(); return KHACH.canDangNhap(); }
  var ten = prompt('Đặt tên cho thiết kế này:', chon.day.ten.replace(/\s*\d+([.,]\d+)? ly/, '') + ' · ' + chon.vong + ' vòng');
  if (ten === null) return;
  b.disabled = true;
  KHACH.luuThietKe({ten: ten.trim() || 'Thiết kế', hash: location.hash.slice(1), gia: Math.round(tong() / 10000) * 10000,
                    moTa: chon.vong + ' vòng · ' + chon.gan.length + ' charm'})
    .then(function () { baoTin('Đã lưu — xem lại trong Tài khoản'); })
    .catch(function () { baoTin('Chưa lưu được, thử lại nhé'); }).then(function () { b.disabled = false; });
});

/* ---------- điện thoại: vòng thu nhỏ nổi góc màn hình khi đang chọn charm (khỏi phải kéo lên xem) ---------- */
var mini = document.createElement('button'), ngoaiSan = false;
mini.type = 'button'; mini.className = 'vong-mini'; mini.setAttribute('aria-label', 'Xem chuỗi đang thiết kế');
mini.innerHTML = '<svg viewBox="0 0 400 400" aria-hidden="true"></svg><b></b>';
document.body.appendChild(mini);
function capMini() {
  if (!mini) return;
  mini.querySelector('svg').innerHTML = $('#vong').innerHTML;
  var n = cuaVong(vongDang).length;
  mini.querySelector('b').textContent = (chon.vong > 1 ? 'Vòng ' + (vongDang + 1) + ' · ' : '') + n + ' charm';
  mini.classList.toggle('hien', ngoaiSan && !!chon.day && innerWidth < 900);
}
function nhayMini() { mini.classList.remove('nhay'); void mini.offsetWidth; mini.classList.add('nhay'); }
mini.onclick = function () { $('.tk-san').scrollIntoView({behavior: 'smooth', block: 'start'}); };
function doSan() {   // vòng lớn đã khuất (gần hết) khỏi màn hình?
  var r = $('.san-trong').getBoundingClientRect(), moi = r.bottom < 120 || r.top > innerHeight - 120;
  if (moi !== ngoaiSan) { ngoaiSan = moi; capMini(); }
}
addEventListener('scroll', doSan, {passive: true});
addEventListener('resize', function () { doSan(); capMini(); });
doSan();
