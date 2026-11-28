/* Khách sỉ: đăng nhập bằng tài khoản Ngọc Trầm cấp → giải mã data/si.json (giá sỉ) ngay trên máy khách.
   File trên web chỉ là bản mã hoá (noi-bo/xuat_si.py). Đăng nhập xong máy nhớ khoá chung để lần sau vào thẳng;
   anh khoá / đổi mật khẩu một tài khoản thì khoá chung đổi theo → máy cũ phải đăng nhập lại.
   Danh sách hỏi sỉ: khách gom nhiều mã (localStorage 'dsSi') rồi chép một lần gửi qua Zalo. */
var SI = (function () {
  var NHO = 'si-k', TIEN_TO = 'ngoc-tram-si:', tep = null, san = null;
  function ub(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function b64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function ten(s) { return boDau(s || '').replace(/[^a-z0-9]/g, ''); }
  function hex(buf) { return [].map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function taiTep() {
    return tep || (tep = fetch('data/si.json', {cache: 'no-cache'}).then(function (r) { if (!r.ok) throw new Error('khong-tep'); return r.json(); })
      .catch(function (er) { tep = null; throw er; }));
  }
  function moRuot(raw, f) {
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt'])
      .then(function (k) { return crypto.subtle.decrypt({name: 'AES-GCM', iv: ub(f.iv)}, k, ub(f.d)); })
      .then(function (b) { return JSON.parse(new TextDecoder().decode(b)); });
  }
  function doc() { try { return JSON.parse(localStorage.getItem(NHO) || 'null'); } catch (er) { return null; } }
  function coTheMaHoa() { return !!(window.crypto && crypto.subtle && window.TextDecoder); }

  return {
    duoc: coTheMaHoa,
    /* Promise → {g: {khoá món: giá sỉ}, luc, ten} khi máy này đã đăng nhập & còn hiệu lực; null nếu chưa */
    san: function () {
      if (san) return san;
      var n = doc();
      if (!n || !n.k || !coTheMaHoa()) return Promise.resolve(null);
      san = taiTep().then(function (f) { return moRuot(ub(n.k), f); })
        .then(function (d) { d.ten = n.ten; SI.du = d; return d; })
        .catch(function (er) {
          if (er && er.message === 'khong-tep') { san = null; return null; }   // mạng lỗi: giữ đăng nhập, thử lại sau
          try { localStorage.removeItem(NHO); } catch (e2) {}                   // khoá chung đã đổi → đăng nhập lại
          san = null; return null;
        });
      return san;
    },
    /* Promise → dữ liệu như san(); sai tên / mật khẩu → reject('sai') */
    dangNhap: function (tenDn, mk) {
      var t = ten(tenDn), m = String(mk || '').replace(/\s+/g, '').toLowerCase(), f, raw;
      if (!t || !m) return Promise.reject('sai');
      if (!coTheMaHoa()) return Promise.reject('may');
      var enc = new TextEncoder();
      return taiTep().then(function (x) { f = x; return crypto.subtle.digest('SHA-256', enc.encode(TIEN_TO + t)); })
        .then(function (h) {
          var o = f.tk[hex(h).slice(0, 16)]; if (!o) throw 'sai';
          return crypto.subtle.importKey('raw', enc.encode(m), 'PBKDF2', false, ['deriveKey']).then(function (g) {
            return crypto.subtle.deriveKey({name: 'PBKDF2', salt: ub(o.s), iterations: f.lap, hash: 'SHA-256'}, g, {name: 'AES-GCM', length: 256}, false, ['decrypt']);
          }).then(function (kk) { return crypto.subtle.decrypt({name: 'AES-GCM', iv: ub(o.iv)}, kk, ub(o.k)); })
            .catch(function () { throw 'sai'; });
        })
        .then(function (k) { raw = k; return moRuot(new Uint8Array(k), f); })
        .then(function (d) {
          try { localStorage.setItem(NHO, JSON.stringify({k: b64(raw), ten: t})); } catch (er) {}
          d.ten = t; SI.du = d; san = Promise.resolve(d); return d;
        });
    },
    du: null,
    thoat: function () { try { localStorage.removeItem(NHO); } catch (er) {} san = null; SI.du = null; },
    ct: function (k) { return 'san-pham.html?ma=' + encodeURIComponent(k) + '&si=1'; },

    /* ---- danh sách hỏi sỉ ---- */
    ds: function () { try { return (JSON.parse(localStorage.getItem('dsSi') || '[]') || []).map(String); } catch (er) { return []; } },
    co: function (k) { return SI.ds().indexOf(String(k)) >= 0; },
    doi: function (k) {   // true nếu vừa thêm
      var d = SI.ds(), i = d.indexOf(String(k)), them = i < 0;
      if (them) d.unshift(String(k)); else d.splice(i, 1);
      try { localStorage.setItem('dsSi', JSON.stringify(d.slice(0, 120))); } catch (er) {}
      SI.ve(); return them;
    },
    xoaHet: function () { try { localStorage.removeItem('dsSi'); } catch (er) {} SI.ve(); },
    nghe: [],
    ve: function () {
      var n = SI.ds().length;
      $$('[data-so-si]').forEach(function (o) { o.textContent = n; o.hidden = !n; });
      $$('[data-si-ds]').forEach(function (b) {
        var co = SI.co(b.dataset.siDs); b.classList.toggle('on', co);
        if (b.dataset.chu != null) b.innerHTML = (co ? IC_SI_CO : IC_SI_THEM) + '<span>' + (co ? 'Đã thêm vào danh sách sỉ' : 'Thêm vào danh sách sỉ') + '</span>';
        b.setAttribute('aria-pressed', String(co));
      });
      SI.nghe.forEach(function (f) { f(); });
    },
    /* thẻ món có giá sỉ (dùng cùng lớp .sp với cửa hàng; bấm thẻ → chi tiết giá sỉ) */
    the: function (x, i, d) {
      var k = e(khoa(x)), g = d && d.g[khoa(x)] || 0;
      return '<div class="sp si-sp" role="button" tabindex="0" data-hien style="--i:' + (i % 4) + '" data-k="' + k + '"><div class="h">' +
        '<span class="nhan">' + e(nhanSp(x)) + '</span>' + (x.tt && x.tt !== 'Còn hàng' ? '<span class="tt">' + e(x.tt) + '</span>' : '') +
        hinh(x.anh[0], x.ten, 700) + (x.anh[1] ? hinh(x.anh[1], x.ten, 700, ' class="sau"') : '') +
        '<div class="viec"><button class="tron" data-si-ds="' + k + '" aria-label="Thêm vào danh sách hỏi sỉ">' + IC_SI_THEM + '</button></div></div>' +
        '<h3>' + e(x.ten) + '</h3><div class="g">' + (g ? gia(g) : '<span class="si-hoi">Hỏi giá sỉ</span>') + '<span class="ma">#' + e(x.ma) + '</span></div></div>';
    },
    /* chữ để dán Zalo: từng mã + tên + giá sỉ */
    chu: function (mon, d, tenKhach) {
      var tong = 0, dong = mon.map(function (x) {
        var g = d.g[khoa(x)] || 0; tong += g;
        return '• ' + x.ma + ' – ' + x.ten + ' – ' + (g ? gia(g) : 'hỏi giá sỉ');
      });
      return 'Chào Ngọc Trầm, mình là khách sỉ' + (tenKhach ? ' (' + tenKhach + ')' : '') + ', muốn lấy ' + (mon.length > 1 ? mon.length + ' mã' : 'mã') + ':\n' +
        dong.join('\n') + (mon.length > 1 && tong ? '\nTạm tính theo giá sỉ: ' + gia(tong) : '');
    }
  };
})();
var IC_SI_THEM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="4.5" y="4" width="15" height="16.5" rx="2"/><path d="M12 8.6v7.2M8.4 12.2h7.2"/></svg>';
var IC_SI_CO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="4" width="15" height="16.5" rx="2"/><path d="M8.4 12.4l2.5 2.5 4.8-5"/></svg>';

/* bấm nút thêm / bỏ một mã khỏi danh sách hỏi sỉ (thẻ món + trang chi tiết) */
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('[data-si-ds]'); if (!b) return;
  ev.preventDefault(); ev.stopPropagation();
  var co = SI.doi(b.dataset.siDs);
  baoTin(co ? 'Đã thêm mã ' + b.dataset.siDs.split('~')[0] + ' vào danh sách hỏi sỉ' : 'Đã bỏ khỏi danh sách hỏi sỉ');
});
/* bấm "Hỏi sỉ qua Zalo" của một món: chép sẵn câu hỏi kèm mã + giá sỉ */
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('[data-chep-si]'); if (!b) return;
  var k = b.dataset.chepSi, d = SI.du;   // dữ liệu đã giải sẵn → chép ngay trong lúc bấm (Safari đòi vậy)
  var x = ds.filter(function (y) { return String(khoa(y)) === k; })[0]; if (!x || !d) return;
  if (navigator.clipboard) navigator.clipboard.writeText(SI.chu([x], d, d.ten)).catch(function () {});
  baoTin('Đã chép mã ' + x.ma + ' — dán vào Zalo nhé');
});
