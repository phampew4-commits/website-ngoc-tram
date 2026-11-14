/* =========================================================
   TÀI KHOẢN KHÁCH (Firebase Auth + Firestore)
   - Chỉ bật khi cau-hinh.js có đủ firebase.apiKey/authDomain/projectId/appId (điền trong app › Khách hàng web).
   - Hồ sơ khách: Firestore khach/{uid} = {ten, sdt, diaChi, email, thietKe:[{ten,hash,gia,luc}], yeuThich:[mã], tao, capNhat}
   - Luật Firestore: khách chỉ đọc / ghi hồ sơ của chính mình.
   ========================================================= */
var KHACH = {bat: false, user: null, ho: null, nghe: [function () { if (window.veNutYt) veNutYt(); }]};
(function () {
  var fb = CH.firebase || {};
  KHACH.bat = !!(fb.apiKey && fb.authDomain && fb.projectId && fb.appId);
  var BAN = '10.12.2', sdk = ['app', 'auth', 'firestore'].map(function (m) { return 'https://www.gstatic.com/firebasejs/' + BAN + '/firebase-' + m + '-compat.js'; });

  function napScript(src) { return new Promise(function (ok, loi) { var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = loi; document.head.appendChild(s); }); }
  // tải SDK (~150KB) SAU khi trang đã hiện xong để ảnh / vòng 3D lên trước; trang tài khoản thì tải ngay.
  // app trước, auth + firestore song song (cả hai chỉ cần app).
  function choRanh() {
    return new Promise(function (ok) {
      if (/tai-khoan|gio-hang/.test(location.pathname)) return ok();
      function cho() { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(ok, { timeout: 2500 }); }
      if (document.readyState === 'complete') cho(); else window.addEventListener('load', cho, { once: true });
    });
  }
  KHACH.san = !KHACH.bat ? Promise.resolve(null) : choRanh().then(function () { return napScript(sdk[0]); })
    .then(function () { return Promise.all([napScript(sdk[1]), napScript(sdk[2])]); })
    .then(function () {
      firebase.initializeApp({apiKey: fb.apiKey, authDomain: fb.authDomain, projectId: fb.projectId, appId: fb.appId});
      KHACH.auth = firebase.auth(); KHACH.db = firebase.firestore();
      KHACH.auth.languageCode = 'vi';
      return new Promise(function (xong) {
        var dau = true;
        KHACH.auth.onAuthStateChanged(function (u) {
          KHACH.user = u;
          (u ? KHACH.taiHo() : Promise.resolve(KHACH.ho = null)).then(function () {
            veNutTk(); KHACH.nghe.forEach(function (f) { try { f(u); } catch (e) {} });
            if (dau) { dau = false; xong(u); }
          });
        });
      });
    }).catch(function () { KHACH.bat = false; return null; });

  KHACH.doc = function () { return KHACH.db.collection('khach').doc(KHACH.user.uid); };
  KHACH.taiHo = function () {
    return KHACH.doc().get().then(function (d) {
      KHACH.ho = d.exists ? d.data() : null;
      if (!KHACH.ho) {   // lần đầu: tạo hồ sơ
        KHACH.ho = {ten: KHACH.user.displayName || '', email: KHACH.user.email || '', sdt: '', diaChi: '', thietKe: [], yeuThich: [],
                    tao: firebase.firestore.FieldValue.serverTimestamp()};
        return KHACH.doc().set(KHACH.ho, {merge: true});
      }
    }).catch(function () { KHACH.ho = KHACH.ho || {thietKe: [], yeuThich: []}; }).then(gopYeuThich);
  };
  /* gộp món yêu thích đang lưu ở máy này với món yêu thích trong tài khoản — lúc vừa đăng nhập */
  function gopYeuThich() {
    if (typeof YT === 'undefined' || !KHACH.ho) return;
    var cuc = YT.ds(), xa = (KHACH.ho.yeuThich || []).map(String);
    var gop = cuc.concat(xa.filter(function (m) { return cuc.indexOf(m) < 0; })).slice(0, 200);
    if (gop.join('|') !== cuc.join('|')) YT.dat(gop);
    if (gop.join('|') !== xa.join('|')) { KHACH.ho.yeuThich = gop; KHACH.ghi({yeuThich: gop}).catch(function () {}); }
  }
  KHACH.ghi = function (thay) {
    Object.keys(thay).forEach(function (k) { KHACH.ho[k] = thay[k]; });
    return KHACH.doc().set(Object.assign({}, thay, {capNhat: firebase.firestore.FieldValue.serverTimestamp()}), {merge: true});
  };
  KHACH.yeuThich = function (ma) { return typeof YT !== 'undefined' ? YT.co(ma) : !!(KHACH.ho && (KHACH.ho.yeuThich || []).indexOf(String(ma)) >= 0); };
  KHACH.doiYeuThich = function (ma) { return Promise.resolve(YT.doi(ma)); };
  KHACH.luuThietKe = function (tk) {
    var ds = (KHACH.ho.thietKe || []).filter(function (x) { return x.hash !== tk.hash; });
    ds.unshift(Object.assign({luc: Date.now()}, tk));
    return KHACH.ghi({thietKe: ds.slice(0, 30)});
  };
  KHACH.boThietKe = function (hash) { return KHACH.ghi({thietKe: (KHACH.ho.thietKe || []).filter(function (x) { return x.hash !== hash; })}); };
  KHACH.canDangNhap = function () {   // chưa đăng nhập → sang trang tài khoản rồi quay lại đúng chỗ
    location.href = 'tai-khoan.html?sau=' + encodeURIComponent(location.pathname.split('/').pop() + location.search + location.hash);
  };

  /* nút tài khoản trên đầu trang */
  function veNutTk() {
    var a = document.getElementById('nutTk');
    if (!a) {
      var o = (window.oNut && oNut()) || document.querySelector('.dau .phai'); if (!o) return;
      a = document.createElement('a'); a.id = 'nutTk'; a.className = 'nut-dau nut-tk'; a.href = 'tai-khoan.html';
      if (o.id === 'dauNut') o.appendChild(a); else o.insertBefore(a, o.querySelector('.mo-menu'));
    }
    var u = KHACH.user, ten = (KHACH.ho && KHACH.ho.ten) || (u && (u.displayName || u.email)) || '';
    a.setAttribute('aria-label', u ? 'Tài khoản của ' + ten : 'Đăng nhập');
    a.title = u ? ten : 'Đăng nhập';
    a.innerHTML = u ? '<span class="chu-tk">' + e((ten.trim()[0] || '•').toUpperCase()) + '</span>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8.5" r="3.6"/><path d="M4.5 20c1-3.8 4-5.8 7.5-5.8s6.5 2 7.5 5.8"/></svg>';
  }
  if (KHACH.bat) veNutTk();
})();
