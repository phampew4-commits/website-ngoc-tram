/* Trang Tài khoản: đăng nhập / đăng ký / quên mật khẩu, hồ sơ, thiết kế đã lưu, món yêu thích */
var sau = new URLSearchParams(location.search).get('sau') || '';
var o = $('#tkNoi');
function loiVn(err) {
  var m = {
    'auth/invalid-email': 'Email không hợp lệ.', 'auth/missing-password': 'Bạn chưa nhập mật khẩu.',
    'auth/invalid-credential': 'Email hoặc mật khẩu chưa đúng.', 'auth/wrong-password': 'Email hoặc mật khẩu chưa đúng.',
    'auth/user-not-found': 'Chưa có tài khoản với email này.', 'auth/email-already-in-use': 'Email này đã có tài khoản — bạn đăng nhập nhé.',
    'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.', 'auth/too-many-requests': 'Thử quá nhiều lần, đợi vài phút rồi thử lại.',
    'auth/user-disabled': 'Tài khoản đang bị khoá. Bạn nhắn Zalo cửa hàng để được hỗ trợ.',
    'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập Google.', 'auth/network-request-failed': 'Mất kết nối mạng, thử lại nhé.'
  };
  return m[err && err.code] || 'Có lỗi xảy ra, bạn thử lại nhé.';
}

if (!KHACH.bat) {
  o.innerHTML = '<div class="tk-hop giua"><span class="nho">Tài khoản</span><h1>Sắp ra mắt</h1><p class="dan">Tính năng tài khoản khách đang được chuẩn bị. Bạn vẫn có thể hỏi mua và gửi thiết kế qua Zalo như thường.</p>' +
    '<a class="nut dac" href="index.html">Về trang chủ</a></div>';
} else {
  o.innerHTML = '<div class="tk-hop giua"><p class="dan">Đang tải…</p></div>';
  KHACH.san.then(function () { KHACH.nghe.push(ve); ve(KHACH.user); });
}

function ve(u) {
  if (!u) return veDangNhap('vao');
  if (sau && !ve.daVe) { ve.daVe = true; location.replace(sau); return; }
  veHoSo();
}

/* ---------- đăng nhập / đăng ký ---------- */
function veDangNhap(che) {
  var dk = che === 'dk', qm = che === 'qm';
  o.innerHTML = '<div class="tk-hop">' +
    '<span class="nho">' + (dk ? 'Tạo tài khoản' : qm ? 'Quên mật khẩu' : 'Chào mừng trở lại') + '</span>' +
    '<h1>' + (dk ? 'Đăng <em>ký</em>' : qm ? 'Lấy lại <em>mật khẩu</em>' : 'Đăng <em>nhập</em>') + '</h1>' +
    '<p class="dan">' + (qm ? 'Nhập email, cửa hàng gửi link đặt lại mật khẩu vào hộp thư của bạn.' : 'Lưu thiết kế chuỗi, món yêu thích và thông tin giao hàng để lần sau mua nhanh hơn.') + '</p>' +
    (qm ? '' : '<button class="nut nut-gg" id="nutGg"><svg viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/></svg>Tiếp tục với Google</button><div class="hoac"><span>hoặc</span></div>') +
    '<form id="fTk" novalidate>' +
      (dk ? '<label>Họ tên<input name="ten" autocomplete="name" required></label>' : '') +
      '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
      (qm ? '' : '<label>Mật khẩu<input name="mk" type="password" autocomplete="' + (dk ? 'new-password' : 'current-password') + '" minlength="6" required></label>') +
      '<p class="loi-tk" id="loiTk" hidden></p>' +
      '<button class="nut dac" type="submit">' + (dk ? 'Tạo tài khoản' : qm ? 'Gửi link đặt lại' : 'Đăng nhập') + '</button>' +
    '</form>' +
    '<div class="tk-doi">' +
      (dk ? 'Đã có tài khoản? <a href="#" data-che="vao">Đăng nhập</a>'
       : qm ? '<a href="#" data-che="vao">← Quay lại đăng nhập</a>'
       : '<a href="#" data-che="qm">Quên mật khẩu?</a> · Chưa có tài khoản? <a href="#" data-che="dk">Đăng ký</a>') +
    '</div></div>';
  o.querySelectorAll('[data-che]').forEach(function (a) { a.onclick = function (ev) { ev.preventDefault(); veDangNhap(a.dataset.che); }; });
  var loi = function (s) { var p = $('#loiTk'); p.hidden = !s; p.textContent = s || ''; };
  if ($('#nutGg')) $('#nutGg').onclick = function () {
    var p = new firebase.auth.GoogleAuthProvider();
    KHACH.auth.signInWithPopup(p).catch(function (er) {
      if (er.code === 'auth/popup-blocked' || er.code === 'auth/operation-not-supported-in-this-environment') return KHACH.auth.signInWithRedirect(p);
      loi(loiVn(er));
    });
  };
  $('#fTk').onsubmit = function (ev) {
    ev.preventDefault(); loi('');
    var f = ev.target, b = f.querySelector('button'), email = f.email.value.trim();
    b.disabled = true;
    var xong = function () { b.disabled = false; };
    if (qm) return KHACH.auth.sendPasswordResetEmail(email).then(function () { xong(); baoTin('Đã gửi link — bạn mở hộp thư (cả mục Spam) nhé'); veDangNhap('vao'); })
      .catch(function (er) { xong(); loi(loiVn(er)); });
    if (dk) return KHACH.auth.createUserWithEmailAndPassword(email, f.mk.value)
      .then(function (r) { return r.user.updateProfile({displayName: f.ten.value.trim()}).then(function () { return KHACH.doc().set({ten: f.ten.value.trim(), email: email}, {merge: true}); }); })
      .then(function () { return KHACH.taiHo(); }).then(function () { xong(); ve(KHACH.user); })
      .catch(function (er) { xong(); loi(loiVn(er)); });
    KHACH.auth.signInWithEmailAndPassword(email, f.mk.value).catch(function (er) { xong(); loi(loiVn(er)); });
  };
}

/* ---------- hồ sơ ---------- */
function veHoSo() {
  var h = KHACH.ho || {}, u = KHACH.user;
  var tk = (h.thietKe || []), yt = (h.yeuThich || []);
  o.innerHTML =
    '<div class="tk-dau"><div><span class="nho">Tài khoản của bạn</span><h1>Xin chào, <em>' + e(h.ten || u.displayName || 'bạn') + '</em></h1><p class="dan">' + e(u.email || '') + '</p></div>' +
      '<button class="nut" id="dangXuat">Đăng xuất</button></div>' +
    '<div class="tk-luoi">' +
      '<section class="tk-the"><h2>Thông tin giao hàng</h2><form id="fHo">' +
        '<label>Họ tên<input name="ten" value="' + e(h.ten || '') + '" autocomplete="name"></label>' +
        '<label>Số điện thoại<input name="sdt" value="' + e(h.sdt || '') + '" inputmode="tel" autocomplete="tel"></label>' +
        '<label>Địa chỉ nhận hàng<textarea name="diaChi" rows="3" autocomplete="street-address">' + e(h.diaChi || '') + '</textarea></label>' +
        '<button class="nut dac" type="submit">Lưu thông tin</button></form></section>' +
      '<section class="tk-the"><h2>Thiết kế đã lưu <small>' + tk.length + '</small></h2>' +
        (tk.length ? '<ul class="ds-tk">' + tk.map(function (x) {
          return '<li><a href="thiet-ke.html#' + e(x.hash) + '"><b>' + e(x.ten || 'Thiết kế') + '</b><small>' + new Date(x.luc).toLocaleDateString('vi-VN') + ' · ' + e(x.moTa || '') + '</small></a>' +
            '<span>' + (x.gia ? '≈ ' + gia(x.gia) : '') + '</span><button class="xoa-tk" data-bo="' + e(x.hash) + '" aria-label="Bỏ thiết kế">✕</button></li>'; }).join('') + '</ul>'
          : '<p class="dan">Chưa có thiết kế nào. <a href="thiet-ke.html">Thử tự thiết kế chuỗi</a>, rồi bấm "Lưu vào tài khoản".</p>') + '</section>' +
    '</div>' +
    '<section class="tk-the tk-don" id="tkDon"><h2>Đơn đã đặt</h2><p class="dan">Đang xem lại…</p></section>' +
    '<section class="tk-yt"><h2>Món yêu thích <small>' + yt.length + '</small></h2><div class="luoi" id="luoiYt"></div>' +
      (yt.length ? '' : '<p class="dan">Bấm ♡ ở trang sản phẩm để lưu món bạn thích vào đây.</p>') + '</section>';
  veDonCuaToi();
  $('#dangXuat').onclick = function () { KHACH.auth.signOut().then(function () { baoTin('Đã đăng xuất'); }); };
  $('#fHo').onsubmit = function (ev) {
    ev.preventDefault(); var f = ev.target, b = f.querySelector('button'); b.disabled = true;
    KHACH.ghi({ten: f.ten.value.trim(), sdt: f.sdt.value.trim(), diaChi: f.diaChi.value.trim()})
      .then(function () { baoTin('Đã lưu thông tin'); }).catch(function () { baoTin('Lưu không được, thử lại nhé'); })
      .then(function () { b.disabled = false; });
  };
  o.querySelectorAll('[data-bo]').forEach(function (b) { b.onclick = function () { KHACH.boThietKe(b.dataset.bo).then(veHoSo); }; });
  if (yt.length) taiDuLieu.then(function () {
    var mon = yt.map(function (m) { return ds.filter(function (x) { return x.ma === m || x.id === m; })[0]; }).filter(Boolean);
    $('#luoiYt').innerHTML = mon.map(the).join('') || '<p class="dan">Các món bạn thích đã được bán hoặc tạm ẩn.</p>';
    theoDoi($('#luoiYt'));
  });
}

/* ---------- đơn đã đặt (Firestore donHang của chính mình) ---------- */
var TEN_TT = {moi: 'Cửa hàng đã nhận', dangGoi: 'Đang chuẩn bị gửi', daGui: 'Đã gửi đi', xong: 'Đã giao xong', huy: 'Đã huỷ'};
function veDonCuaToi() {
  var khung = $('#tkDon'); if (!khung) return;
  KHACH.db.collection('donHang').where('uid', '==', KHACH.user.uid).limit(30).get().then(function (kq) {
    var ds = kq.docs.map(function (d) { return d.data(); }).sort(function (a, b) { return (b.luc && b.luc.seconds || 0) - (a.luc && a.luc.seconds || 0); });
    khung.innerHTML = '<h2>Đơn đã đặt <small>' + ds.length + '</small></h2>' + (ds.length ? '<ul class="ds-don">' + ds.map(function (d) {
      var ng = d.luc && d.luc.seconds ? new Date(d.luc.seconds * 1000).toLocaleDateString('vi-VN') : '';
      return '<li><div class="don-dau"><b>' + e(d.ma || '') + '</b><span class="chip-don tt-' + e(d.trangThai || 'moi') + '">' + e(TEN_TT[d.trangThai] || 'Cửa hàng đã nhận') + '</span></div>' +
        '<div class="don-mon">' + (d.mon || []).map(function (m) { return e(m.ten) + ' <small>#' + e(m.ma) + '</small>'; }).join(' · ') + '</div>' +
        '<div class="don-chan"><span>' + ng + '</span><b>' + gia(d.tong || 0) + '</b></div></li>';
    }).join('') + '</ul>' : '<p class="dan">Chưa có đơn nào. Chọn món rồi bấm “Thêm vào giỏ” để đặt mua.</p>');
  }).catch(function () {
    khung.innerHTML = '<h2>Đơn đã đặt</h2><p class="dan">Chưa xem được danh sách đơn. Bạn nhắn Zalo cửa hàng để hỏi về đơn của mình nhé.</p>';
  });
}
