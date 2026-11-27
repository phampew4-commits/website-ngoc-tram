/* 24/11/2026 — mẫu lucianlabs cho website (dùng chung Ngọc Trầm + Jadora):
   · "… vừa mua" (Recent purchase) — CHỈ đọc đơn thật trong data/mua-gan-day.json (file trống → không hiện gì; không bịa)
   · Thử độ vừa của chuỗi / vòng (giống "Coffee cup that fits its size") — trang chọn size / đo cổ tay
   · Thanh "Mua ngay" dính đáy khi cuộn qua nút Thêm vào giỏ (Sticky buy bar) — trang chi tiết (trang nào đã có thì thôi) */
(function () {
  var D = document, W = window;
  var e = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var giaVN = function (v) { return (Number(String(v).replace(/\D/g, '')) || 0).toLocaleString('vi-VN') + 'đ'; };
  var anhUrl = function (id, w) { return W.anh ? W.anh(id, w) : (/[\/.]/.test(id) ? id : 'https://lh3.googleusercontent.com/d/' + id + '=w' + (w || 600)); };
  var link = function (x) { return W.linkSp ? W.linkSp(x) : ('?ma=' + encodeURIComponent(x.ma)); };
  var it = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = D.createElement('style');
  css.textContent = [
    '.lw-mua{position:fixed;left:16px;bottom:16px;z-index:900;display:flex;gap:10px;align-items:center;max-width:min(340px,calc(100vw - 32px));padding:10px 34px 10px 10px;border-radius:16px;background:#fff;color:#222;box-shadow:0 14px 34px -12px rgba(0,0,0,.35);font-size:13px;line-height:1.35;animation:lwm .5s cubic-bezier(.2,.8,.2,1) both}',
    '.lw-mua.ra{animation:lwm .35s ease reverse both}@keyframes lwm{from{opacity:0;transform:translateY(24px)}}',
    '.lw-mua img{width:48px;height:48px;border-radius:10px;object-fit:cover;flex:none}.lw-mua small{color:#888;display:block}.lw-mua button{position:absolute;top:6px;right:8px;border:0;background:none;font-size:18px;color:#999;cursor:pointer}',
    '.lw-vua{display:grid;gap:14px;margin:18px 0;padding:18px;border-radius:18px;background:rgba(0,0,0,.035)}',
    '.lw-vua .h{display:grid;grid-template-columns:1fr 1fr;gap:10px}.lw-vua label{display:grid;gap:4px;font-size:13px}.lw-vua input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(0,0,0,.15);font:inherit;font-size:16px}',
    '.lw-vua svg{width:100%;max-width:300px;margin:auto;display:block}.lw-vua .kq{text-align:center;font-weight:600;font-size:15px}.lw-vua .kq small{display:block;font-weight:400;opacity:.7;font-size:12.5px;margin-top:2px}',
    '.lw-vua circle.vong{transition:r .45s cubic-bezier(.34,1.4,.64,1)}.lw-vua ellipse{transition:rx .45s,ry .45s}',
    '.lw-bb{position:fixed;left:0;right:0;bottom:0;z-index:800;display:flex;align-items:center;gap:12px;padding:10px max(16px,env(safe-area-inset-left)) calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.96);backdrop-filter:blur(10px);box-shadow:0 -8px 24px -12px rgba(0,0,0,.25);transform:translateY(110%);transition:transform .35s cubic-bezier(.2,.8,.2,1)}',
    '.lw-bb.hien{transform:none}.lw-bb img{width:44px;height:44px;border-radius:10px;object-fit:cover}.lw-bb div{flex:1;min-width:0;font-size:13px}.lw-bb div b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.lw-bb button{flex:none;padding:12px 20px;border-radius:99px;border:0;background:#1f2a24;color:#fff;font:inherit;font-weight:600;cursor:pointer}',
    '@media (prefers-reduced-motion: reduce){.lw-mua,.lw-bb{animation:none!important;transition:none!important}}'
  ].join('');
  D.head.appendChild(css);

  var SP = null;
  var taiSp = function () { return SP ? Promise.resolve(SP) : fetch('data/san-pham.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    SP = (Array.isArray(d) ? d : (d.san_pham || [])).map(function (x) { var a = x.anh; if (typeof a === 'string') { try { a = JSON.parse(a.replace(/'/g, '"')); } catch (er) { a = [a]; } } return Object.assign({}, x, { anh: a || [] }); });
    return SP; }).catch(function () { return SP = []; }); };
  var ngay = function (s) { var m = /(\d+)\/(\d+)\/(\d+)/.exec(s || ''); return m ? new Date(+m[3], m[2] - 1, +m[1]).getTime() : 0; };

  // ---------- "… vừa mua" — ĐÃ TẮT 27/11/2026: kiểu thông báo "ai đó vừa mua" user không muốn (dễ thành số liệu giả); file data/mua-gan-day.json cũng không có → 404 mỗi trang ----------
  if (false) fetch('data/mua-gan-day.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (ds) {
    ds = (ds || []).filter(function (x) { return x && x.ma && x.luc && Date.now() - new Date(x.luc).getTime() < 7 * 864e5; }); if (!ds.length) return;
    var tat = false; try { tat = sessionStorage.getItem('lw-mua-tat'); } catch (er) {} if (tat) return;
    taiSp().then(function (sp) {
      var k = 0, hien = function () { if (k >= Math.min(3, ds.length) || D.hidden) return; var x = ds[k++], m = sp.find(function (y) { return String(y.ma) === String(x.ma); }); if (!m) return hien();
        var phut = Math.round((Date.now() - new Date(x.luc).getTime()) / 6e4), khi = phut < 60 ? phut + ' phút trước' : phut < 1440 ? Math.round(phut / 60) + ' giờ trước' : Math.round(phut / 1440) + ' ngày trước';
        var t = D.createElement('a'); t.className = 'lw-mua'; t.href = link(m);
        t.innerHTML = (m.anh[0] ? '<img src="' + e(anhUrl(m.anh[0], 120)) + '" alt="" referrerpolicy="no-referrer">' : '') + '<span><b>' + e(x.ten || 'Một khách') + (x.tinh ? ' ở ' + e(x.tinh) : '') + '</b> vừa mua<br>' + e(m.ten) + '<small>' + khi + '</small></span><button type="button" aria-label="Tắt">×</button>';
        t.querySelector('button').onclick = function (ev) { ev.preventDefault(); t.remove(); try { sessionStorage.setItem('lw-mua-tat', '1'); } catch (er) {} k = 99; };
        D.body.appendChild(t); setTimeout(function () { t.classList.add('ra'); setTimeout(function () { t.remove(); }, 400); }, 6000); setTimeout(hien, 28000); };
      setTimeout(hien, 9000); });
  });

  // ---------- Thử độ vừa của chuỗi / vòng ----------
  var choVua = D.querySelector('[data-lw-vua]');
  if (choVua) {
    var k = D.createElement('div'); k.className = 'lw-vua';
    k.innerHTML = '<b>Thử xem chuỗi / vòng có vừa tay không</b><div class="h"><label>Chu vi cổ tay (cm)<input id="lw-ct" inputmode="decimal" value="15"></label><label>Size chuỗi (cm)<input id="lw-sz" inputmode="decimal" value="16"></label></div>' +
      '<svg viewBox="0 0 200 200" aria-hidden="true"><ellipse cx="100" cy="100" rx="60" ry="44" fill="#f1d3bd" stroke="#d9b49a" stroke-width="2"/><circle class="vong" cx="100" cy="100" r="70" fill="none" stroke="#c9a45c" stroke-width="12" stroke-dasharray="1 13" stroke-linecap="round"/></svg><div class="kq" aria-live="polite"></div>';
    choVua.appendChild(k);
    var ve2 = function () {
      var ct = parseFloat(k.querySelector('#lw-ct').value.replace(',', '.')) || 0, sz = parseFloat(k.querySelector('#lw-sz').value.replace(',', '.')) || 0; if (!ct || !sz) return;
      // cổ tay ≈ elip tỉ lệ 1 : 0,74 có chu vi = ct; chuỗi ≈ vòng tròn chu vi = sz; thu phóng để vật lớn hơn rộng ~80px
      var a = ct / (Math.PI * 1.74), r = sz / (2 * Math.PI), s = 80 / Math.max(a, r);
      k.querySelector('circle.vong').setAttribute('r', (r * s).toFixed(1)); k.querySelector('ellipse').setAttribute('rx', (a * s).toFixed(1)); k.querySelector('ellipse').setAttribute('ry', (a * s * .74).toFixed(1));
      var vn = function (v) { return String(v).replace('.', ','); }, du = sz - ct, kq = du < 0.5 ? ['Hơi chật', 'Nên chọn size ' + vn(Math.ceil((ct + 1) * 2) / 2) + ' cm'] : du <= 2 ? ['Vừa đẹp ✓', 'Hở khoảng ' + du.toFixed(1).replace('.', ',') + ' cm — đeo thoải mái'] : du <= 3 ? ['Hơi rộng', 'Hợp nếu thích đeo lỏng'] : ['Rộng', 'Nên chọn size ' + vn(Math.ceil((ct + 1.5) * 2) / 2) + ' cm'];
      k.querySelector('.kq').innerHTML = e(kq[0]) + '<small>' + e(kq[1]) + '</small>'; };
    k.addEventListener('input', ve2); ve2();
  }

  // ---------- Thanh "Mua ngay" dính đáy (trang chi tiết chưa có thanh riêng) ----------
  var thuBB = function (lan) {
    if (D.querySelector('.bb, .lw-bb, #thanhMua, .thanh-mua')) return;   // trang đã có thanh mua riêng (san-pham.html: #thanhMua) → không chồng thêm
    var nut = D.querySelector('main [data-gio], #them'); if (!nut) { if (lan < 20) setTimeout(function () { thuBB(lan + 1); }, 400); return; }
    var ten = (D.querySelector('main h1') || {}).textContent || '', gia = (D.querySelector('main .gia, main [class*="gia"]') || {}).textContent || '', im = D.querySelector('main img');
    var b = D.createElement('div'); b.className = 'lw-bb'; b.setAttribute('aria-hidden', 'true');
    b.innerHTML = (im ? '<img src="' + e(im.currentSrc || im.src) + '" alt="" referrerpolicy="no-referrer">' : '') + '<div><b>' + e(ten.trim()) + '</b>' + e((gia.match(/\d[\d.]*\s*đ/) || [''])[0]) + '</div><button type="button">' + e(nut.textContent.trim() || 'Thêm vào giỏ') + '</button>';
    b.querySelector('button').onclick = function () { nut.click(); };
    D.body.appendChild(b);
    new IntersectionObserver(function (en) { var h = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; b.classList.toggle('hien', h); b.setAttribute('aria-hidden', String(!h)); }).observe(nut);
  };
  if (/chi-tiet\.html/.test(location.pathname) && /[?&]ma=/.test(location.search) && !D.getElementById('thanhMua')) thuBB(0);   // san-pham.html có #thanhMua riêng
})();
