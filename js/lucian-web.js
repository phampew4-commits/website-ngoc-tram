/* 24/11/2026 — mẫu lucianlabs cho website (dùng chung Ngọc Trầm + Jadora):
   · Story hàng mới (Tap-through stories) — trang chủ
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
    '.lw-sto{display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;padding:6px 2px 12px;margin:0 auto;max-width:1200px}.lw-sto::-webkit-scrollbar{display:none}',
    '.lw-sto button{flex:none;border:0;background:none;padding:0;cursor:pointer;display:grid;justify-items:center;gap:6px;font:inherit;font-size:12px;color:inherit;width:74px}',
    '.lw-sto i{width:68px;height:68px;border-radius:50%;padding:3px;background:conic-gradient(from 200deg,#e7b35a,#d36a8c,#8a6fd1,#e7b35a)}',
    '.lw-sto i img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:3px solid #fff;display:block}',
    '.lw-sto button.xem i{background:#ccc}.lw-sto span{max-width:74px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.lw-st{position:fixed;inset:0;z-index:9999;background:#000;display:grid;place-items:center;touch-action:none}',
    '.lw-st .lw-k{position:relative;width:min(100vw,calc(100vh*9/16));height:100%;overflow:hidden}',
    '.lw-st img.a{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:lwz 6s linear both}@keyframes lwz{to{transform:scale(1.08)}}',
    '.lw-st .lw-vach{position:absolute;left:10px;right:10px;top:10px;display:flex;gap:4px;z-index:2}.lw-st .lw-vach b{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.35);overflow:hidden}',
    '.lw-st .lw-vach b i{display:block;height:100%;width:0;background:#fff}.lw-st .lw-vach b.xong i{width:100%}.lw-st .lw-vach b.dang i{animation:lwv var(--t) linear forwards}@keyframes lwv{to{width:100%}}',
    '.lw-st .lw-dau{position:absolute;top:22px;left:14px;right:14px;z-index:2;display:flex;justify-content:space-between;align-items:center;color:#fff;font-size:13px;text-shadow:0 1px 4px rgba(0,0,0,.5)}',
    '.lw-st .lw-dau button{background:none;border:0;color:#fff;font-size:28px;cursor:pointer;line-height:1}',
    '.lw-st .lw-chan{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:60px 18px 26px;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#fff}',
    '.lw-st .lw-chan b{display:block;font-size:17px;margin-bottom:4px}.lw-st .lw-chan a{display:inline-block;margin-top:12px;padding:11px 22px;border-radius:99px;background:#fff;color:#111;font-weight:600;text-decoration:none}',
    '.lw-st .lw-vung{position:absolute;top:0;bottom:0;width:35%;z-index:1}.lw-st .lw-vung.t{left:0}.lw-st .lw-vung.p{right:0;width:65%}',
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
    '@media (prefers-reduced-motion: reduce){.lw-mua,.lw-st img.a,.lw-bb{animation:none!important;transition:none!important}}'
  ].join('');
  D.head.appendChild(css);

  var SP = null;
  var taiSp = function () { return SP ? Promise.resolve(SP) : fetch('data/san-pham.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    SP = (Array.isArray(d) ? d : (d.san_pham || [])).map(function (x) { var a = x.anh; if (typeof a === 'string') { try { a = JSON.parse(a.replace(/'/g, '"')); } catch (er) { a = [a]; } } return Object.assign({}, x, { anh: a || [] }); });
    return SP; }).catch(function () { return SP = []; }); };
  var ngay = function (s) { var m = /(\d+)\/(\d+)\/(\d+)/.exec(s || ''); return m ? new Date(+m[3], m[2] - 1, +m[1]).getTime() : 0; };

  // ---------- Story hàng mới (trang chủ) ----------
  var trangChu = /(^|\/)(index\.html)?$/.test(location.pathname);
  if (trangChu) taiSp().then(function (ds) {
    var moi = ds.filter(function (x) { return x.anh.length && !/bán/i.test(x.tt || ''); }).sort(function (a, b) { return ngay(b.ngay) - ngay(a.ngay); });
    var nhom = {}; moi.forEach(function (x) { (nhom[x.loai] = nhom[x.loai] || []).length < 8 && nhom[x.loai].push(x); });
    var TEN = { chuoi: 'Chuỗi', vong: 'Vòng', nhan: 'Nhẫn', charm: 'Charm', khuyen: 'Khuyên', matday: 'Mặt dây', lac: 'Lắc', day: 'Dây', tron: 'Chuỗi trơn', daytron: 'Chuỗi trơn', tram: 'Trầm', trangsuc: 'Trang sức' };
    var cum = [{ ten: 'Mới về', ds: moi.slice(0, 10) }].concat(Object.keys(nhom).map(function (k) { return { ten: TEN[k] || (k.charAt(0).toUpperCase() + k.slice(1)), ds: nhom[k] }; })).filter(function (c) { return c.ds.length; });
    if (!cum.length) return;
    var daXem = {}; try { daXem = JSON.parse(localStorage.getItem('lw-story') || '{}'); } catch (er) {}
    var hang = D.createElement('div'); hang.className = 'lw-sto'; hang.setAttribute('aria-label', 'Hàng mới dạng story');
    hang.innerHTML = cum.map(function (c, i) { return '<button type="button" data-c="' + i + '" class="' + (daXem[c.ten] === c.ds[0].ma ? 'xem' : '') + '"><i><img src="' + e(anhUrl(c.ds[0].anh[0], 160)) + '" alt="" referrerpolicy="no-referrer" loading="lazy"></i><span>' + e(c.ten) + '</span></button>'; }).join('');
    var cho = D.querySelector('main') || D.body; var bia = [].slice.call(cho.children).find(function (x) { return x.offsetHeight > 300; }) || cho.firstElementChild; bia.after(hang);   // dưới ảnh bìa lớn
    hang.addEventListener('click', function (ev) { var b = ev.target.closest('[data-c]'); if (b) moStory(cum, +b.dataset.c, daXem, hang); });
  });
  function moStory(cum, ci, daXem, hang) {
    var n = D.createElement('div'); n.className = 'lw-st'; D.body.appendChild(n); D.documentElement.style.overflow = 'hidden';
    var i = 0, hen = null, T = 5000;
    var dong = function () { clearTimeout(hen); n.remove(); D.documentElement.style.overflow = ''; removeEventListener('keydown', phim); };
    var ve = function () {
      var c = cum[ci], x = c.ds[i]; if (!x) return;
      daXem[c.ten] = c.ds[0].ma; try { localStorage.setItem('lw-story', JSON.stringify(daXem)); } catch (er) {} var b = hang.querySelector('[data-c="' + ci + '"]'); if (b) b.classList.add('xem');
      n.innerHTML = '<div class="lw-k"><img class="a" src="' + e(anhUrl(x.anh[0], 1080)) + '" alt="" referrerpolicy="no-referrer"><div class="lw-vach">' + c.ds.map(function (y, k) { return '<b class="' + (k < i ? 'xong' : k === i ? 'dang' : '') + '" style="--t:' + T + 'ms"><i></i></b>'; }).join('') +
        '</div><div class="lw-dau"><span>' + e(c.ten) + ' · ' + (i + 1) + '/' + c.ds.length + '</span><button type="button" data-x aria-label="Đóng">×</button></div><span class="lw-vung t" data-l="-1"></span><span class="lw-vung p" data-l="1"></span>' +
        '<div class="lw-chan"><b>' + e(x.ten) + '</b>' + giaVN(x.gia) + '<br><a href="' + e(link(x)) + '">Xem món</a></div></div>';
      clearTimeout(hen); if (!it) hen = setTimeout(function () { di(1); }, T); };
    var di = function (d) { i += d; if (i < 0) { if (ci > 0) { ci--; i = cum[ci].ds.length - 1; } else i = 0; } else if (i >= cum[ci].ds.length) { if (ci < cum.length - 1) { ci++; i = 0; } else return dong(); } ve(); };
    n.addEventListener('click', function (ev) { if (ev.target.closest('[data-x]')) return dong(); var l = ev.target.closest('[data-l]'); if (l) di(+l.dataset.l); });
    var x0 = null; n.addEventListener('pointerdown', function (ev) { x0 = [ev.clientX, ev.clientY]; });
    n.addEventListener('pointerup', function (ev) { if (!x0) return; var dx = ev.clientX - x0[0], dy = ev.clientY - x0[1]; x0 = null; if (dy > 90) dong(); else if (Math.abs(dx) > 70) { ci = Math.max(0, Math.min(cum.length - 1, ci + (dx < 0 ? 1 : -1))); i = 0; ve(); } });
    var phim = function (ev) { if (ev.key === 'Escape') dong(); if (ev.key === 'ArrowRight') di(1); if (ev.key === 'ArrowLeft') di(-1); }; addEventListener('keydown', phim);
    ve();
  }

  // ---------- "… vừa mua" — chỉ đơn thật (data/mua-gan-day.json: [{"ten":"Chị L.","tinh":"Hà Nội","ma":"25362","luc":"2026-11-24T18:55"}]) ----------
  fetch('data/mua-gan-day.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }).then(function (ds) {
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
    if (D.querySelector('.bb, .lw-bb')) return;
    var nut = D.querySelector('main [data-gio], #them'); if (!nut) { if (lan < 20) setTimeout(function () { thuBB(lan + 1); }, 400); return; }
    var ten = (D.querySelector('main h1') || {}).textContent || '', gia = (D.querySelector('main .gia, main [class*="gia"]') || {}).textContent || '', im = D.querySelector('main img');
    var b = D.createElement('div'); b.className = 'lw-bb'; b.setAttribute('aria-hidden', 'true');
    b.innerHTML = (im ? '<img src="' + e(im.currentSrc || im.src) + '" alt="" referrerpolicy="no-referrer">' : '') + '<div><b>' + e(ten.trim()) + '</b>' + e((gia.match(/\d[\d.]*\s*đ/) || [''])[0]) + '</div><button type="button">' + e(nut.textContent.trim() || 'Thêm vào giỏ') + '</button>';
    b.querySelector('button').onclick = function () { nut.click(); };
    D.body.appendChild(b);
    new IntersectionObserver(function (en) { var h = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; b.classList.toggle('hien', h); b.setAttribute('aria-hidden', String(!h)); }).observe(nut);
  };
  if (/san-pham\.html|chi-tiet\.html/.test(location.pathname) && /[?&]ma=/.test(location.search)) thuBB(0);
})();
