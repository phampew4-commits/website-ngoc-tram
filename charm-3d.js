/* Charm 3D (three.js) — dựng hình theo ảnh thật của từng charm.
   Đơn vị mm. Khung nhìn chính diện: x = chiều dây, y = lên (phía khoen), z = mặt trước. Gốc toạ độ = chỗ dây đi qua.
   window.taoCharm3D(THREE) → { ds: {mã: hàm dựng}, tao(mã) → {g, rong, xo, cao} } */
window.taoCharm3D = function (THREE) {
  var V2 = THREE.Vector2, V3 = THREE.Vector3, PI = Math.PI;

  /* ---------- vân đá vẽ bằng canvas ---------- */
  function vai(w, h, ve) { var c = document.createElement('canvas'); c.width = w; c.height = h; ve(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
  var vanMay = vai(512, 512, function (g, w, h) {   // mây ngọc
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) { var x = Math.random() * w, y = Math.random() * h, r = 20 + Math.random() * 90, a = .04 + Math.random() * .09, sang = Math.random() < .3;
      var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, sang ? 'rgba(240,255,245,' + a * 2.2 + ')' : 'rgba(10,60,35,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  });
  var vanLam = vai(512, 512, function (g, w, h) {   /* ngọc lam xanh: đốm trắng mây + mảng xanh đậm (ảnh CHUAMA-8VBuMl) */
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 120; i++) { var x = Math.random() * w, y = Math.random() * h, r = 12 + Math.random() * 70, sang = Math.random() < .45, a = sang ? .35 + Math.random() * .4 : .1 + Math.random() * .15;
      var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, sang ? 'rgba(250,255,252,' + a + ')' : 'rgba(0,70,70,' + a + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
  });
  var vanToc = vai(512, 512, function (g, w, h) {   // thạch anh tóc vàng: nền trong, sợi rutile vàng kim
    g.fillStyle = '#fffdf2'; g.fillRect(0, 0, w, h);
    var i, x, y, r, gr;
    for (i = 0; i < 40; i++) { x = Math.random() * w; y = Math.random() * h; r = 30 + Math.random() * 110;
      gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, Math.random() < .5 ? 'rgba(214,150,20,.22)' : 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    for (i = 0; i < 260; i++) { x = Math.random() * w; y = Math.random() * h; var a = Math.random() * PI, l = 30 + Math.random() * 150;
      g.strokeStyle = Math.random() < .35 ? 'rgba(255,250,215,' + (.35 + Math.random() * .4) + ')' : 'rgba(150,88,6,' + (.25 + Math.random() * .45) + ')';
      g.lineWidth = .5 + Math.random() * 1.3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  });
  var vanCham = vai(512, 256, function (g, w, h) {   // nền nhám + 4 ô chấm nổi (lu thống vàng) — dùng làm bump
    g.fillStyle = '#6a6a6a'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 9000; i++) { g.fillStyle = 'rgba(' + (Math.random() < .5 ? '255,255,255' : '0,0,0') + ',.06)'; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    for (var k = 0; k < 4; k++) for (var c = 0; c < 8; c++) for (var r = 0; r < 12; r++) {   /* 4 mặt × 8 cột × 12 chấm (ảnh #25890) */
      var u = ((k / 4 + (c - 3.5) * .021 + 1) % 1) * w, v = (.5 + (r - 5.5) * .056) * h;
      var gr = g.createRadialGradient(u, v, 0, u, v, 5); gr.addColorStop(0, '#fff'); gr.addColorStop(.6, '#dcdcdc'); gr.addColorStop(1, 'rgba(106,106,106,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(u, v, 5, 0, 7); g.fill();
      if (u < 6) { g.beginPath(); g.arc(u + w, v, 5, 0, 7); g.fill(); } }
  });
  vanCham.colorSpace = THREE.NoColorSpace;
  function vanNoi(ve) { var t = vai(512, 512, function (g, w, h) { g.fillStyle = '#707070'; g.fillRect(0, 0, w, h); ve(g, w, h); }); t.colorSpace = THREE.NoColorSpace; return t; }
  var VAN = {
    dan: vanNoi(function (g) { for (var x = 0; x < 16; x++) for (var y = 0; y < 16; y++) { var ng = (x + y) % 2, gr = ng ? g.createLinearGradient(x * 32, 0, x * 32 + 32, 0) : g.createLinearGradient(0, y * 32, 0, y * 32 + 32);
      gr.addColorStop(0, '#3c3c3c'); gr.addColorStop(.5, '#f2f2f2'); gr.addColorStop(1, '#3c3c3c'); g.fillStyle = gr; g.fillRect(x * 32, y * 32, 32, 32); } }),
    bua: vanNoi(function (g, w, h) { for (var i = 0; i < 520; i++) { var x = Math.random() * w, y = Math.random() * h, r = 8 + Math.random() * 16, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, Math.random() < .6 ? 'rgba(20,20,20,.75)' : 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(112,112,112,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }),
    vay: vanNoi(function (g, w) { g.strokeStyle = '#fff'; g.lineWidth = 5; for (var r = 0; r < 18; r++) for (var c = -1; c < 9; c++) { g.beginPath(); g.arc(c * 64 + (r % 2) * 32 + 32, r * 30, 30, 0, PI); g.stroke(); g.beginPath(); g.arc(c * 64 + (r % 2) * 32 + 32, r * 30, 16, 0, PI); g.stroke(); } }),
    luoi: vanNoi(function (g, w, h) { g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#fff'; g.lineWidth = 9; for (var i = -8; i < 16; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64 + 512, 512); g.stroke(); g.beginPath(); g.moveTo(i * 64 + 512, 0); g.lineTo(i * 64, 512); g.stroke(); } }),
    giac: vanNoi(function (g, w, h) { for (var i = 0; i < 520; i++) { var x = Math.random() * w, y = Math.random() * h, r = 22 + Math.random() * 30, a = Math.random() * 7, c = 30 + Math.floor(Math.random() * 225);
      g.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')'; g.beginPath(); for (var q = 0; q < 3; q++) g[q ? 'lineTo' : 'moveTo'](x + Math.cos(a + q * 2.1) * r, y + Math.sin(a + q * 2.1) * r); g.fill(); } }),   // mặt cắt giác (diamond-cut) lấp lánh
    hoa: vanNoi(function (g, w, h) { g.strokeStyle = '#fff'; g.lineWidth = 4; for (var i = 0; i < 150; i++) { var x = Math.random() * w, y = Math.random() * h, r = 7 + Math.random() * 15, a0 = Math.random() * 7; g.beginPath();
      for (var q = 0; q <= 30; q++) { var a = a0 + q / 30 * 9, rr = r * (1 - q / 34); g[q ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.stroke(); } })
  };
  function vangVan(ten, lap, noi, nham) { var t = VAN[ten].clone(); t.repeat.set(lap, lap); t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: 0xf2c263, metalness: 1, roughness: nham || .26, bumpMap: t, bumpScale: noi || 1.4 }); }

  /* ---------- vật liệu ---------- */
  function phatSang(m, nen, tam) {   // đá tự sáng nhẹ từ trong: đậm ở giữa, nhạt ra mép → trông trong, mọng
    m.onBeforeCompile = function (s) { s.fragmentShader = s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' +
      'float tamHat = pow(clamp(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 1.6);\n' +
      'totalEmissiveRadiance += diffuseColor.rgb * (' + nen.toFixed(3) + ' + ' + tam.toFixed(3) + ' * tamHat);'); };
    m.customProgramCacheKey = function () { return 'ps' + nen + '_' + tam; };
    return m;
  }
  function daTrong(mau, map, nen, tam, tr, sau) { var m = da(mau, map, nen, tam); m.transmission = tr; m.thickness = sau || 3; m.attenuationColor = new THREE.Color(mau); m.attenuationDistance = 5; m.roughness = .06; return m; }   /* ngọc băng: trong, thấy ánh vàng đế qua đá */
  function da(mau, map, nen, tam) { return phatSang(new THREE.MeshPhysicalMaterial({ color: mau, map: map || null, roughness: .09, clearcoat: 1, clearcoatRoughness: .03, ior: 1.66, specularIntensity: 1 }), nen, tam); }
  var kcEnv = (function () {   /* soát: môi trường riêng cho kim cương — nền xám sáng + mảng trắng + vài mảng tối → mặt giác sáng/tối xen kẽ, lấp lánh như CZ (trước phản chiếu phòng ấm nên thành chấm kem) */
    var mat = []; for (var f = 0; f < 6; f++) { var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'); g.fillStyle = '#9aa0ab'; g.fillRect(0, 0, 64, 64);
      for (var i = 0; i < 7; i++) { var x = (f * 23 + i * 37) % 52, y = (f * 41 + i * 19) % 52; g.fillStyle = i % 3 === 2 ? '#2a2d34' : (i % 2 ? '#ffffff' : '#e6eeff'); g.fillRect(x, y, 10 + (i * 7) % 16, 8 + (i * 5) % 14); } mat.push(c); }
    var t = new THREE.CubeTexture(mat); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; })();
  var bacEnv = (function () { var mat = []; for (var f = 0; f < 6; f++) { var c = document.createElement('canvas'); c.width = c.height = 32; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 32);
      gr.addColorStop(0, f === 2 ? '#ffffff' : '#d9dce2'); gr.addColorStop(.55, '#9ea3ad'); gr.addColorStop(1, f === 3 ? '#4a4e56' : '#7d828c'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); g.fillStyle = '#ffffff'; g.fillRect(4 + f * 3, 6, 8, 3); mat.push(c); }
    var t = new THREE.CubeTexture(mat); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; })();   /* soát đợt 5: phòng chụp trung tính cho bạc/vàng trắng (phòng ấm làm bạc ngả be) */
  var VL = {
    vang: new THREE.MeshStandardMaterial({ color: 0xf4c561, metalness: 1, roughness: .17 }),
    vangNham: new THREE.MeshStandardMaterial({ color: 0xedbd5c, metalness: 1, roughness: .44, bumpMap: vanCham, bumpScale: 1.6 }),
    lucde: da(0x0b8f34, vanMay, .1, .36),   /* lục đế: xanh lục đậm tươi như ảnh */
    lambang: daTrong(0xbfe6dc, vanMay, .1, .26, .45),
    toc: da(0xf5c331, vanToc, .2, .38),
    ruby: da(0xe2245c, null, .1, .5),
    bangtrang: daTrong(0xe4f1ec, vanMay, .1, .28, .55),
    lamdam: daTrong(0x3aa892, vanLam, .1, .3, .3),
    hong: da(0xf58ca6, vanMay, .14, .4),
    trai: new THREE.MeshPhysicalMaterial({ color: 0xf2e0dc, roughness: .12, clearcoat: 1, clearcoatRoughness: .05, sheen: 1, sheenRoughness: .2, sheenColor: new THREE.Color(0xffc8e0), iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [300, 700], envMapIntensity: 1.4, emissive: 0x3a2a30, emissiveIntensity: .15 }),   /* soát: ánh xà cừ hồng/xanh như ngọc trai thật */
    men: new THREE.MeshPhysicalMaterial({ color: 0x2d7fd6, roughness: .12, clearcoat: 1 }),
    kc: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0, flatShading: true, envMap: kcEnv, envMapIntensity: 2.2, iridescence: .6, iridescenceIOR: 2.2 }),   /* soát: bỏ ánh sữa — giác phản chiếu tương phản sáng/tối như CZ thật */   // kim cương giác: mặt bàn + giác trên/dưới, phản chiếu lấp lánh khi xoay   // kim cương: các mặt giác phản chiếu như gương → lấp lánh khi xoay
    vangMo: new THREE.MeshStandardMaterial({ color: 0xedbd5c, metalness: 1, roughness: .42 }),
    bac: new THREE.MeshStandardMaterial({ color: 0xf0f2f5, metalness: 1, roughness: .16, envMap: bacEnv, envMapIntensity: 1.05 }),   /* soát: bạc sáng trắng, không xỉn nâu */   /* vàng trắng / bạc */
    vangDan: vangVan('dan', 4, 1.8), vangBua: vangVan('bua', 2, 1.6, .2), vangVay: vangVan('vay', 1.6, 1.3), vangLuoi: vangVan('luoi', 3, 2.2), vangHoa: vangVan('hoa', 2, 1.5), vangGiac: vangVan('giac', 1, 3.2, .08),
    toi: new THREE.MeshBasicMaterial({ color: 0x1c1408 })
  };

  /* ---------- công cụ dựng hình ---------- */
  function tron(x, y, cx, cy, r) { return Math.hypot(x - cx, y - cy) - r; }
  function hop(a, b, k) { var h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k / 4; }   // hợp 2 hình, bo mềm chỗ nối
  function vienTu(f, cx, cy, n) {   // đường viền (ngược chiều kim đồng hồ) của hình f(x,y)<0, nhìn từ tâm (cx,cy)
    var p = []; n = n || 96;
    for (var i = 0; i < n; i++) { var a = i / n * PI * 2, dx = Math.cos(a), dy = Math.sin(a), lo = 0, hi = 16;
      for (var k = 0; k < 26; k++) { var m = (lo + hi) / 2; if (f(cx + dx * m, cy + dy * m) < 0) lo = m; else hi = m; }
      p.push(new V2(cx + dx * lo, cy + dy * lo)); }
    return p;
  }
  function phapTuyen(p) { var n = p.length; return p.map(function (_, i) { var a = p[(i + n - 1) % n], b = p[(i + 1) % n], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty) || 1; return new V2(ty / l, -tx / l); }); }
  function luoi(pos, idx, uv) { var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    if (uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; }
  function hoSo(day, bo) {   // mặt cắt tấm dày `day` (z từ -day tới 0), cạnh bo tròn `bo`
    var pf = [], q;
    for (q = 0; q <= 5; q++) { var a = q / 5 * PI / 2; pf.push([-bo + bo * Math.sin(a), -day + bo - bo * Math.cos(a)]); }
    for (q = 0; q <= 5; q++) { a = q / 5 * PI / 2; pf.push([-bo + bo * Math.cos(a), -bo + bo * Math.sin(a)]); }
    return pf;
  }
  function khoi(p, cx, cy, pf, vl, hoLung) {   // quét mặt cắt pf quanh đường viền p → khối kín, cạnh mượt; hoLung: bỏ nắp sau (để lắp lưng chạm lộng)
    var nm = phapTuyen(p), n = p.length, m = pf.length, pos = [], idx = [], i, j;
    for (j = 0; j < m; j++) for (i = 0; i < n; i++) pos.push(p[i].x + nm[i].x * pf[j][0], p[i].y + nm[i].y * pf[j][0], pf[j][1]);
    for (j = 0; j < m - 1; j++) for (i = 0; i < n; i++) { var a = j * n + i, b = j * n + (i + 1) % n, c = (j + 1) * n + (i + 1) % n, d = (j + 1) * n + i; idx.push(a, b, c, a, c, d); }
    (hoLung ? [[m - 1, 1]] : [[0, -1], [m - 1, 1]]).forEach(function (np) {   // 2 nắp phẳng
      var j = np[0], o = pos.length / 3; pos.push(cx, cy, pf[j][1]);
      for (i = 0; i < n; i++) pos.push(p[i].x + nm[i].x * pf[j][0], p[i].y + nm[i].y * pf[j][0], pf[j][1]);
      for (i = 0; i < n; i++) { var u = o + 1 + i, v = o + 1 + (i + 1) % n; if (np[1] > 0) idx.push(o, u, v); else idx.push(o, v, u); } });
    var uv = []; for (i = 0; i < pos.length; i += 3) uv.push(pos[i] / 10 + .5, pos[i + 1] / 10 + .5);
    return new THREE.Mesh(luoi(pos, idx, uv), vl);
  }
  function vom(p, cx, cy, h, vl, sua, KK) {   // viên đá mài vòm (cabochon) trên đường viền p, cao h; sua(x,y,s) → hệ số chạm khắc; KK = số vòng lưới
    var K = KK || 22, n = p.length, pos = [], uv = [], idx = [], k, i;
    for (k = 0; k <= K; k++) { var s = Math.sin(k / K * PI / 2);
      for (i = 0; i < n; i++) { var x = cx + (p[i].x - cx) * s, y = cy + (p[i].y - cy) * s, z = h * Math.sqrt(Math.max(0, 1 - s * s)); if (sua) z *= sua(x, y, s);
        pos.push(x, y, z); uv.push(x / 11 + .5, y / 11 + .5); } }
    for (k = 0; k < K; k++) for (i = 0; i < n; i++) { var a = k * n + i, b = (k + 1) * n + i, c = (k + 1) * n + (i + 1) % n, d = k * n + (i + 1) % n; idx.push(a, b, c, a, c, d); }
    var g = luoi(pos, idx, uv), nr = g.attributes.normal;
    for (i = 0; i < n; i++) nr.setXYZ(i, 0, 0, 1);   // đỉnh vòm: n điểm trùng nhau → chung pháp tuyến
    return new THREE.Mesh(g, vl);
  }
  function chuoiHat(p, r, vl, z, kc) {   // viền hạt bi nhỏ (kiểu viền thừng vàng) chạy theo đường p
    var n = p.length, L = [0], i; for (i = 0; i < n; i++) L.push(L[i] + p[i].distanceTo(p[(i + 1) % n]));
    var so = Math.max(6, Math.round(L[n] / (r * 1.85))), im = new THREE.InstancedMesh(kc ? kcGeo(r) : new THREE.SphereGeometry(r, 14, 10), vl, so), m4 = new THREE.Matrix4(), j = 0;
    for (i = 0; i < so; i++) { var d = i / so * L[n]; while (L[j + 1] < d) j++; var t = (d - L[j]) / (L[j + 1] - L[j]), a = p[j], b = p[(j + 1) % n];
      m4.makeTranslation(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, z || 0); im.setMatrixAt(i, m4); }
    return im;
  }
  function ongVien(p, r, vl, z, ho) {   // ống tròn chạy theo đường p (kín, hoặc hở nếu ho)
    var c = new THREE.CatmullRomCurve3(p.map(function (q) { return new V3(q.x, q.y, z || 0); }), !ho);
    return new THREE.Mesh(new THREE.TubeGeometry(c, p.length * 2, r, 10, !ho), vl);
  }
  var _kcG = {};
  function kcGeo(r) {   /* viên kim cương giác tròn (brilliant): mặt bàn hướng +z */
    var k = r.toFixed(3); if (_kcG[k]) return _kcG[k];
    var g = new THREE.LatheGeometry([new V2(0, -.86 * r), new V2(r, -.06 * r), new V2(r, .06 * r), new V2(.56 * r, .34 * r), new V2(0, .34 * r)], 16);
    g.rotateX(PI / 2); g = g.toNonIndexed(); g.computeVertexNormals(); return (_kcG[k] = g); }
  function khoen(R, r, vl) { return new THREE.Mesh(new THREE.TorusGeometry(R, r, 16, 56), vl); }
  function vien(r, vl, det) { var m = new THREE.Mesh(new THREE.SphereGeometry(r, 36, 24), vl); m.scale.z = det || .6; return m; }
  function tienTron(pts, vl, seg) {   // tiện tròn quanh trục y, khử đường nối
    var g = new THREE.LatheGeometry(pts, seg || 72); return { g: g, np: pts.length, seg: seg || 72, vl: vl };
  }
  function xongTien(o, lapU) {   // tính lại pháp tuyến sau khi nắn hình + làm liền mép nối; lapU: lặp vân quanh thân cho khỏi giãn
    var g = o.g; if (lapU) { var uv = g.attributes.uv; for (var q = 0; q < uv.count; q++) uv.setX(q, uv.getX(q) * lapU); } g.computeVertexNormals(); var nr = g.attributes.normal;
    for (var j = 0; j < o.np; j++) { var a = j, b = o.seg * o.np + j, x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1;
      nr.setXYZ(a, x / l, y / l, z / l); nr.setXYZ(b, x / l, y / l, z / l); }
    return new THREE.Mesh(g, o.vl);
  }
  function moc(g, yDinh) {   // khoen + khoá móc lò xo cho charm treo; dời cả charm để dây đi qua lòng khoá. userData.khoa: phần ôm dây (trang web xoay nó theo chiều dây)
    var a = khoen(.75, .2, VL.vang); a.rotation.y = PI / 2; a.position.y = yDinh + .45; g.add(a);
    var b = khoen(.8, .17, VL.vang); b.position.y = yDinh + 1.55; g.add(b);
    var kh = new THREE.Group(), c = khoen(1.55, .3, VL.vang); c.rotation.y = PI / 2; kh.add(c);
    var lay = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .7, 12), VL.vang); lay.rotation.x = PI / 2; lay.position.set(0, -.4, 1.75); kh.add(lay);
    kh.position.y = yDinh + 3.5; g.add(kh); g.userData.khoa = kh;
    g.children.forEach(function (m) { m.position.y -= yDinh + 4.6; });
    return yDinh + 4.6;
  }
  function mocDon(g, yDinh) {   // khoen treo đơn (bail) — dây luồn thẳng qua khoen
    var a = khoen(.5, .17, VL.vang); a.position.y = yDinh + .3; g.add(a);
    var kh = new THREE.Group(), c = khoen(1.05, .27, VL.vang); c.rotation.y = PI / 2; c.scale.y = 1.3; kh.add(c);
    kh.position.y = yDinh + 1.75; g.add(kh); g.userData.khoa = kh;
    g.children.forEach(function (m) { m.position.y -= yDinh + 2.6; });
    return yDinh + 2.6;
  }
  function latMat(m) {   // bản lật của 1 vòm đá → mặt sau (cho viên đá không có đế vàng)
    var g = m.geometry.clone(), p = g.attributes.position, ix = g.index.array, i, t;
    for (i = 0; i < p.count; i++) p.setZ(i, -p.getZ(i) * .55);
    for (i = 0; i < ix.length; i += 3) { t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; }
    g.computeVertexNormals(); return new THREE.Mesh(g, m.material);
  }
  function vongHat(R, y, r, vl, kc) {   // vòng hạt quanh trục y (đai kim cương…)
    var so = Math.max(6, Math.round(2 * PI * R / (r * 1.9))), im = new THREE.InstancedMesh(kc ? kcGeo(r) : new THREE.SphereGeometry(r, 14, 10), vl, so), m4 = new THREE.Matrix4();
    for (var i = 0; i < so; i++) { var a = i / so * PI * 2; m4.makeTranslation(Math.cos(a) * R, y, Math.sin(a) * R); im.setMatrixAt(i, m4); }
    return im;
  }
  function dinhY(p) { return Math.max.apply(null, p.map(function (q) { return q.y; })); }
  function beRong(p) { var x = p.map(function (q) { return q.x; }); return Math.max.apply(null, x) - Math.min.apply(null, x); }
  function oval(a, b) { return function (x, y) { return (Math.hypot(x / a, y / b) - 1) * Math.min(a, b); }; }
  function batGiac(a, b, c) { return function (x, y) { x = Math.abs(x); y = Math.abs(y); return Math.max(x - a, y - b, (x + y - (a + b - c)) * .7071); }; }
  function giot(k, nguoc) { return function (x, y) { if (nguoc) y = -y; return hop(hop(tron(x, y, 0, -1.9 * k, 3.9 * k), tron(x, y, 0, 2.9 * k, 2.3 * k), 4.5 * k), tron(x, y, 0, 5.3 * k, .5 * k), 2.2 * k); }; }   // giọt nước: bầu dưới, nhọn dần lên đỉnh
  function tamLo(pN, pT, day, vl) {   // tấm phẳng có khoét lỗ: viền ngoài pN, viền lỗ pT (cùng số điểm, cùng tâm nhìn)
    var n = pN.length, pos = [], idx = [], h = day / 2;
    function dai(A, zA, B, zB, lat) { var o = pos.length / 3, i; for (i = 0; i < n; i++) pos.push(A[i].x, A[i].y, zA); for (i = 0; i < n; i++) pos.push(B[i].x, B[i].y, zB);
      for (i = 0; i < n; i++) { var a = o + i, b = o + (i + 1) % n, c = o + n + (i + 1) % n, d = o + n + i; if (lat) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); } }
    dai(pN, -h, pN, h, false); dai(pT, -h, pT, h, true); dai(pT, h, pN, h, true); dai(pT, -h, pN, -h, false);
    var uv = []; for (var i = 0; i < pos.length; i += 3) uv.push(pos[i] / 10 + .5, pos[i + 1] / 10 + .5);
    return new THREE.Mesh(luoi(pos, idx, uv), vl);
  }
  function vanRieng(ve, noi) {   // vân nổi vẽ riêng cho 1 tấm: canvas 512px = 10 × 10 ly theo đúng toạ độ tấm (chữ, ô tròn, lưới…) → vàng chạm nổi
    var t = vai(512, 512, function (g) { g.fillStyle = '#5c5c5c'; g.fillRect(0, 0, 512, 512); g.textAlign = 'center'; g.textBaseline = 'middle';
      ve(g, function (x) { return (x / 10 + .5) * 512; }, function (y) { return (.5 - y / 10) * 512; }, 51.2); });
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return new THREE.MeshStandardMaterial({ color: 0xf2c263, metalness: 1, roughness: .27, bumpMap: t, bumpScale: noi || 2.4 });
  }
  function tamTreo(o) {   // tấm vàng mỏng: mặt trước o.vl, viền bi o.hat, lưng nhám trơn
    var g = new THREE.Group(), cy = o.cy || 0, day = o.day || .8;
    function ra(d, n) { return vienTu(function (x, y) { return o.f(x, y) - d; }, 0, cy, n || 150); }
    var t = khoi(ra(0), 0, cy, hoSo(day, .22), o.vl); t.position.z = day / 2; g.add(t);
    if (o.hat) g.add(chuoiHat(ra(-.06, 220), o.hat, VL.vang, day / 2 - .06));
    var l = khoi(ra(-.03), 0, cy, hoSo(.3, .1), VL.vangMo); l.position.z = -day / 2 + .03; g.add(l);
    return g;
  }
  function huyHieu(r, nen, chu, mauChu, vanh) {   // ô men tròn có chữ
    var t = vai(256, 256, function (g) { g.fillStyle = nen; g.fillRect(0, 0, 256, 256); g.fillStyle = mauChu; g.font = 'bold 170px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(chu, 128, 138);
      if (vanh) { g.strokeStyle = vanh; g.lineWidth = 22; g.beginPath(); g.arc(128, 128, 116, 0, 7); g.stroke(); } });
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshPhysicalMaterial({ map: t, roughness: .15, clearcoat: 1, clearcoatRoughness: .05 }));
  }
  function treoEo(th, Ax, Ay, t, k) {   // treo bằng khoen nhỏ gắn ở sườn/eo (không phải ở đỉnh) → thân rủ nghiêng góc t như ảnh kẹp treo
    var g = new THREE.Group(), lo = khoen(.42, .14, VL.vang); lo.position.set(Ax + .3, Ay, 0); th.add(lo);
    var ax = (Ax + .3) * Math.cos(t) - Ay * Math.sin(t), ay = (Ax + .3) * Math.sin(t) + Ay * Math.cos(t);
    th.rotation.z = t; th.position.set(-ax, -ay - 1.75, 0); g.add(th);
    var kh = new THREE.Group(), c = khoen(.95, .22, VL.vang); c.rotation.y = PI / 2; kh.add(c); kh.position.y = -.9; g.add(kh);
    var bao = new THREE.Group(); g.scale.setScalar(k || 1); bao.add(g); bao.userData.khoa = kh; return bao;
  }
  function vienRen(p, R, r, so, vl, z) {   /* chuỗi vòng (loop) bằng dây hạt chạy quanh đường p: mỗi vòng bán kính R, hạt r — kiểu viền ren vàng */
    var n = p.length, L = [0], i, j; for (i = 0; i < n; i++) L.push(L[i] + p[i].distanceTo(p[(i + 1) % n]));
    var moiVong = Math.max(10, Math.round(2 * PI * R / (r * 1.7))), im = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), vl, so * moiVong), m4 = new THREE.Matrix4(), k = 0; j = 0;
    for (i = 0; i < so; i++) { var d = i / so * L[n]; while (L[j + 1] < d) j++; var t = (d - L[j]) / (L[j + 1] - L[j]), a = p[j], b = p[(j + 1) % n], cx = a.x + (b.x - a.x) * t, cy = a.y + (b.y - a.y) * t;
      for (var q = 0; q < moiVong; q++) { var g = q / moiVong * PI * 2; m4.makeTranslation(cx + Math.cos(g) * R, cy + Math.sin(g) * R, (z || 0) + Math.sin(g * 2 + i) * r * .5); im.setMatrixAt(k++, m4); } }
    return im;
  }
  function vienXoan(p, A, r, so, vl, z) {   /* 2 sợi dây hạt (milgrain) xoắn bện quanh đường p: lệch ±A theo pháp tuyến, nhấp nhô z ngược pha → mắt lưới chồng nhau */
    var n = p.length, nm = phapTuyen(p), L = [0], i, j, pts = [];
    for (i = 0; i < n; i++) L.push(L[i] + p[i].distanceTo(p[(i + 1) % n]));
    [0, PI].forEach(function (ph) { var M = 3000, cu = null, dd = 0; j = 0;
      for (var q = 0; q < M; q++) { var d = q / M * L[n]; while (L[j + 1] < d) j++; var t = (d - L[j]) / (L[j + 1] - L[j]), a = p[j], b = p[(j + 1) % n], na = nm[j], nb = nm[(j + 1) % n];
        var w = 2 * PI * so * d / L[n] + ph, o = A * Math.sin(w), x = a.x + (b.x - a.x) * t + (na.x + (nb.x - na.x) * t) * o, y = a.y + (b.y - a.y) * t + (na.y + (nb.y - na.y) * t) * o, zz = (z || 0) + A * .5 * Math.cos(w);
        if (cu) dd += Math.hypot(x - cu[0], y - cu[1], zz - cu[2]); if (!cu || dd >= r * 1.6) { pts.push(x, y, zz); dd = 0; } cu = [x, y, zz]; } });
    var im = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), vl, pts.length / 3), m4 = new THREE.Matrix4();
    for (i = 0; i < pts.length / 3; i++) { m4.makeTranslation(pts[3 * i], pts[3 * i + 1], pts[3 * i + 2]); im.setMatrixAt(i, m4); }
    return im;
  }
  function hinhHoLo(k) { return function (x, y) { return hop(tron(x, y, 0, -2.3 * k, 3.5 * k), tron(x, y, 0, 2.55 * k, 2.45 * k), .65 * k); }; }   /* soát 12/11: eo thắt rõ như ảnh (2 bầu tách) */
  function yenHoLo(yw, k) { return function (x, y, s) { return 1 - .32 * Math.exp(-Math.pow((y - yw) / (.75 * k), 2)) * (1 - Math.pow(s, 3)); }; }   /* mặt ngọc hồ lô: 2 vòm bầu + yên lõm ở eo */

  /* ---------- họ hồ lô ---------- */
  /* ---------- LƯNG CHẠM LỘNG (soát 12/11 lần 4): lưng hạt ngọc gắn vàng là lưới vàng lộng, nhìn qua thấy ngọc ----------
     fOut: viền lưng (2D) · z: vị trí lưng · ve(c, X, Y, k): vẽ nét vàng (trắng) theo toạ độ mm · R: nửa cạnh ô vẽ (mm) · ngoc: vật liệu mặt sau viên ngọc (null = nền tối) */
  function lungLo(g, fOut, z, ve, R, ngoc, zNgoc) {
    var fO = fOut; fOut = function (u, v) { return fO(u, v) - .18; };   /* phủ kín tới vành, không hở khe sáng */
    var vk = vienTu(fOut, 0, 0, 220), c = document.createElement('canvas'); c.width = c.height = 1024; var x = c.getContext('2d'), k = 1024 / (2 * R);
    var X = function (u) { return (u + R) * k; }, Y = function (v) { return (R - v) * k; };
    x.fillStyle = '#000'; x.fillRect(0, 0, 1024, 1024); x.strokeStyle = x.fillStyle = '#fff'; x.lineCap = x.lineJoin = 'round';
    x.lineWidth = .55 * k; x.beginPath(); vk.forEach(function (q, i) { x[i ? 'lineTo' : 'moveTo'](X(q.x), Y(q.y)); }); x.closePath(); x.stroke();   /* vành viền */
    x.lineWidth = .32 * k; ve(x, X, Y, k);
    var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
    var geo = new THREE.ShapeGeometry(new THREE.Shape(vk), 1), ps = geo.attributes.position, uv = [];
    for (var i = 0; i < ps.count; i++) uv.push((ps.getX(i) + R) / (2 * R), (ps.getY(i) + R) / (2 * R)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    var m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xf2c25a, metalness: 1, roughness: .28, alphaMap: t, alphaTest: .5, side: THREE.DoubleSide })); m.position.z = z; g.add(m);
    var m2 = m.clone(); m2.position.z = z + .22; g.add(m2);   /* lưới có bề dày */
    var nen = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(vienTu(function (u, v) { return fOut(u, v) + .25; }, 0, 0, 160)), 1), ngoc ? (function () { var q = ngoc.clone(); q.side = THREE.DoubleSide; return q; })() : new THREE.MeshStandardMaterial({ color: 0x3a2e1a, roughness: .7, side: THREE.DoubleSide }));
    nen.position.z = zNgoc === undefined ? z + .9 : zNgoc; g.add(nen);   /* mặt sau viên ngọc thấy qua lỗ */
    return g; }
  var HV = {   /* hoa văn lưng lộng theo ảnh lưng thật */
    nutDan: function (c, X, Y, k) { for (var i = 0; i < 4; i++) { var a = PI / 4 + i * PI / 2; c.beginPath(); c.arc(X(Math.cos(a) * 1.3), Y(Math.sin(a) * 1.3), 1.85 * k, 0, 7); c.stroke(); } },   /* 23786: 4 vòng đan nút */
    namVong: function (c, X, Y, k) { for (var i = 0; i < 5; i++) { var a = PI / 2 + i * PI * 2 / 5; c.beginPath(); c.arc(X(Math.cos(a) * 1.95), Y(Math.sin(a) * 1.95), 1.45 * k, 0, 7); c.stroke(); } },   /* 23788: 5 vòng tròn */
    hoa8: function (c, X, Y, k) { for (var i = 0; i < 8; i++) { var a = i * PI / 4; c.beginPath(); c.ellipse(X(Math.cos(a) * 1.75), Y(Math.sin(a) * 1.75), 1.5 * k, .72 * k, -a, 0, 7); c.stroke(); } c.beginPath(); c.arc(X(0), Y(0), .55 * k, 0, 7); c.stroke(); },   /* 24190: hoa 8 cánh */
    hoa4: function (c, X, Y, k) { for (var i = 0; i < 4; i++) { var a = PI / 4 + i * PI / 2; c.beginPath(); c.ellipse(X(Math.cos(a) * 1.75), Y(Math.sin(a) * 1.75), 1.9 * k, .95 * k, -a, 0, 7); c.stroke(); } },   /* 23779: hoa 4 cánh */
    co4: function (c, X, Y, k) { [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(function (q) { c.beginPath(); c.arc(X(q[0] * 2.75), Y(q[1] * 2.75), 1.55 * k, 0, 7); c.stroke(); c.beginPath(); c.arc(X(q[0] * .95), Y(q[1] * .95), .75 * k, 0, 7); c.stroke(); }); },   /* 23774: 4 thuỳ + hoa giữa */
    kimTien: function (c, X, Y, k) { var s = 1.45; c.lineWidth = .3 * k; for (var i = -6; i <= 6; i++) for (var j = -7; j <= 7; j++) { var u = i * s, v = j * s; c.beginPath(); c.arc(X(u), Y(v), s * .71 * k, 0, 7); c.stroke(); c.strokeRect(X(u + s / 2) - .14 * k, Y(v + s / 2) - .14 * k, .28 * k, .28 * k); } },   /* hồ lô: lưới đồng tiền chồng */
    buom: function (c, X, Y, k) { [-1, 1].forEach(function (sg) { for (var i = 0; i < 4; i++) { var a = -.9 + i * .55; c.beginPath(); c.moveTo(X(sg * .5), Y(0)); c.quadraticCurveTo(X(sg * (1.5 + Math.cos(a) * 1.2)), Y(Math.sin(a) * 1.6 + .3), X(sg * (.6 + Math.cos(a) * 3.6)), Y(Math.sin(a) * 2.9)); c.stroke(); } }); c.beginPath(); c.moveTo(X(0), Y(2)); c.lineTo(X(0), Y(-2)); c.stroke(); }   /* 25375: khung + gân cánh */
  };
  function holoMat(o) {   // viên đá hồ lô mài vòm, nằm trong khung vàng (viền thừng / trơn / kim cương), treo hoặc xuyên dây
    var k = o.k || 1, g = new THREE.Group(), f = o.hinh || hinhHoLo(k), cy = -.5 * k, fk = o.khung || f, day = o.day || 1.4, vk = null, i;
    var le = o.le || (o.vien === 'xoan' ? .32 + 2 * (o.renR || .45) + 2 * (o.hatR || .17) : o.vien === 'kc' ? 1.25 : o.vien === 'thung' ? .95 : o.vien === 'tron' ? .5 : 0);
    function ra(h, d) { return vienTu(function (x, y) { return h(x, y) - d; }, 0, cy, o.n || 140); }
    if (o.vien !== 'khong') {
      vk = ra(fk, le); if (o.vien === 'xoan') { var cx2 = .32 + (o.renR || .45) + (o.hatR || .17), pd = khoi(ra(fk, cx2), 0, cy, hoSo(day * .6, .25), VL.vangMo); pd.position.z = -.25; g.add(pd);
        g.add(vienXoan(ra(fk, cx2), o.renR || .45, o.hatR || .17, o.soVong || 12, VL.vang, .1)); } else if (o.vien !== 'ren') g.add(khoi(vk, 0, cy, hoSo(day, .4), VL.vang, !!o.lung)); else { var de = khoi(ra(fk, .2), 0, cy, hoSo(day * .6, .3), VL.vang); g.add(de); }
      if (o.vien === 'ren') { g.add(vienRen(ra(fk, le * .5), o.renR || le * .6, .19, o.soVong || 15, VL.vang, -.1)); g.add(ongVien(ra(fk, .15), .22, VL.vang, .05)); }
      if (o.vien === 'thung') g.add(chuoiHat(ra(fk, le - (o.hatR || .34) * .7), o.hatR || .34, VL.vang, .12));
      if (o.kcTrong) g.add(chuoiHat(ra(fk, -o.kcTrong), .3, VL.kc, .1, true));   // vòng kim cương nhỏ phía trong viền
      if (o.vien === 'kc') g.add(chuoiHat(ra(fk, .62), .43, VL.kc, .12, true));
      g.add(ongVien(ra(f, .14), .2, VL.vang, .1));
    }
    var vd = vom(ra(f, 0), 0, cy, (o.cao || 2.1) * k, VL[o.da], o.cham || (o.yen !== undefined ? yenHoLo(o.yen, k) : (o.hinh ? null : yenHoLo(.77 * k, k))), o.K || 40); g.add(vd);
    if (o.vien === 'khong') g.add(latMat(vd));
    function hatKc(q, r) { var d = new THREE.Mesh(kcGeo(r), VL.kc); d.position.set(q.x, q.y, .22); g.add(d); }
    if (o.kc3 && vk) { var vkc = ra(fk, le - .55), nn = vkc.length; [0, .25, .5, .75].forEach(function (t) { [-5, 0, 5].forEach(function (dl) { hatKc(vkc[(Math.round(t * nn) + dl + nn) % nn], .5); }); }); }   // 4 cụm 3 viên: phải, trên, trái, dưới
    if (o.kcTrai && vk) { var vt2 = ra(fk, le - .6); for (i = 0; i < vt2.length; i += 6) if (vt2[i].x < -1.2 * k && vt2[i].y > cy - 3 * k && vt2[i].y < cy + 4.5 * k) hatKc(vt2[i], .45); }   // hàng kim cương chỉ ở sườn trái
    if (o.kcVai && vk) { var vt3 = ra(fk, le - .65); for (i = 0; i < vt3.length; i += 5) if (vt3[i].y > cy + .6 && Math.abs(vt3[i].x) > .9) hatKc(vt3[i], .42); }   // kim cương dọc 2 vai trên
    var dinh = vk ? dinhY(vk) : 5 * k;
    if (o.nhon) { var nh = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.0, 18), VL.vang); nh.position.set(0, dinh + .3, -day / 2); g.add(nh); dinh += .7; }
    if (o.ruby) { var ch = new THREE.Mesh(new THREE.CylinderGeometry(.95, .95, 1.2, 28), VL.vang); ch.rotation.x = PI / 2; ch.position.set(0, dinh + .85, -.5); g.add(ch);
      var rb = vien(.7, VL.ruby, .7); rb.position.set(0, dinh + .85, .1); g.add(rb); dinh += 1.75; }
    if (o.trai) { var tr = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 20), VL.trai); tr.position.set(-2.5, dinh + 1.0, 0); g.add(tr); var tk = khoen(.5, .12, VL.vang); tk.position.set(-1.5, dinh + 1.5, 0); g.add(tk); }
    if (o.lung && vk) { var fl = function (x, y) { return fk(x, y) - le + .05; }; lungLo(g, fl, -day, o.lung, 6.5 * k + 1, VL[o.da], -day + .9); }   /* lưng chạm lộng */
    if (o.treo) { var cao = (o.treo === 'khoa' ? moc : mocDon)(g, dinh); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 6.5 * k }; }
    g.children.forEach(function (m) { m.position.z += day / 2; });
    return { g: g, rong: vk ? beRong(vk) : 7 * k, xo: 'xuyen', cao: 12 * k };
  }
  function holoKhoi(o) {   // hồ lô vàng đúc khối (tiện tròn 2 bầu): vân nổi, đai kim cương, đá gắn bầu dưới, bánh xe đáy; treo ở đỉnh hoặc ở eo
    var k = o.k || 1, g = new THREE.Group(), th = new THREE.Group(), pts = [], i, rt = o.bauTren || 2.1;
    function f2(r, y) { return hop(tron(r, y, 0, -2.1, 3.1), tron(r, y, 0, 2.5, rt), 1.1); }
    function bk(y) { var lo = 0, hi = 6; for (var q = 0; q < 24; q++) { var m = (lo + hi) / 2; if (f2(m, y) < 0) lo = m; else hi = m; } return lo; }
    for (i = 0; i <= 64; i++) { var a = -PI / 2 + i / 64 * PI, lo = 0, hi = 9; for (var q = 0; q < 24; q++) { var m = (lo + hi) / 2; if (f2(Math.cos(a) * m, Math.sin(a) * m) < 0) lo = m; else hi = m; } pts.push(new V2(Math.max(0, Math.cos(a) * lo), Math.sin(a) * lo)); }
    var ob = tienTron(pts, o.vl || VL.vang, 88);
    if (o.xoan) { var p = ob.g.attributes.position; for (i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), s = 1 + .07 * Math.sin(7 * Math.atan2(z, x) + y * 1.4); p.setX(i, x * s); p.setZ(i, z * s); } }
    th.add(xongTien(ob, o.lapU || 2));
    if (o.long) th.add(xongTien(tienTron(pts.map(function (q) { return new V2(q.x * .8, q.y * .92); }), VL.vangMo, 64), 1));   /* soát đợt 5: lõi trong cho hồ lô chỉ vàng lộng */
    var dinh = 2.5 + rt, cuong = new THREE.Mesh(new THREE.CylinderGeometry(.22, .55, 1.3, 20), VL.vang); cuong.position.y = dinh + .35; if (o.khoenEo) cuong.rotation.z = -.35; th.add(cuong);
    if (o.dai) { th.add(vongHat(bk(.55) + .15, .55, .36, VL.kc, true)); var d1 = khoen(bk(.55) + .1, .16, VL.vang); d1.rotation.x = PI / 2; d1.position.y = 1.0; th.add(d1); var d2 = d1.clone(); d2.position.y = .1; th.add(d2); }
    if (o.kcBau) for (i = 0; i < 16; i++) { var yy = -2.1 + 3.0 * (1 - (i + .5) / 16 * 2) * .8, rr = bk(yy), aa = i * 2.39996, dd = new THREE.Mesh(kcGeo(.36), VL.kc); dd.position.set(Math.cos(aa) * rr * .98, yy, Math.sin(aa) * rr * .98); th.add(dd); }
    if (o.daDuoi) { var R0 = bk(-2.2), be = khoen(1.0, .2, VL.vang); be.position.set(0, -2.2, R0 - .05); th.add(be);
      var v = o.daDuoi === 'kc' ? new THREE.Mesh(new THREE.IcosahedronGeometry(.85, 1), VL.kc) : vien(.88, VL[o.daDuoi], .7); v.position.set(0, -2.2, R0); th.add(v); }
    if (o.dayBanh) { var bx = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, .4, 40), VL.vang); bx.position.y = -5.15; th.add(bx); var vb = khoen(1.9, .2, VL.vang); vb.rotation.x = PI / 2; vb.position.y = -5.3; th.add(vb);
      for (i = 0; i < 8; i++) { var nan = new THREE.Mesh(new THREE.BoxGeometry(1.5, .16, .22), VL.vang); nan.position.set(Math.cos(i * PI / 4) * .95, -5.4, Math.sin(i * PI / 4) * .95); nan.rotation.y = -i * PI / 4; th.add(nan); }
      var kcd = new THREE.Mesh(kcGeo(.34), VL.kc); kcd.position.y = -5.45; th.add(kcd); }
    if (o.det) th.scale.z = o.det;
    if (o.khoenEo) return { g: treoEo(th, bk(.55) * 1 + .1, .55, o.nghieng || .9, k), rong: 1.5 * k, xo: 'treo', cao: 9.5 * k };
    g.add(th);
    if (o.treo) { var cao = mocDon(g, dinh + .9), bao = new THREE.Group(); g.scale.setScalar(k); bao.add(g); bao.userData.khoa = g.userData.khoa;   // phóng theo k quanh điểm dây đi qua
      return { g: bao, rong: 1.6 * k, xo: 'treo', cao: (cao + 5.3) * k }; }
    g.rotation.z = PI / 2; var b2 = new THREE.Group(); g.scale.setScalar(k); b2.add(g);
    return { g: b2, rong: 10.6 * k, xo: 'ong', cao: 6.4 * k, dungXem: true };   /* soát đợt 5: xem gần dựng đứng (bầu nhỏ trên) */
  }
  function holoGon(o) {   // hồ lô vàng dập nổi: mỗi bầu có gân tròn đồng tâm, viên đá giữa bầu dưới
    var k = o.k || 1, g = new THREE.Group(), f = hinhHoLo(.9), cy = -.45, vk = vienTu(f, 0, cy, 140);
    var de = khoi(vk, 0, cy, hoSo(.9, .3), VL.vang); g.add(de);
    g.add(vom(vk, 0, cy, 1.5, VL.vang, function (x, y) { return 1 + .15 * Math.cos(f(x, y) * 7); }));
    var be = khoen(.98, .2, VL.vang); be.position.set(0, -2.07, 1.5); g.add(be);
    var v = vien(.86, VL[o.da || 'lucde'], .7); v.position.set(0, -2.07, 1.5); g.add(v);
    var nh = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.1, 18), VL.vang); nh.position.set(0, 4.75, -.3); g.add(nh);
    var cao = mocDon(g, 5.1), bao = new THREE.Group(); g.scale.setScalar(k); bao.add(g); bao.userData.khoa = g.userData.khoa;
    return { g: bao, rong: 1.6 * k, xo: 'treo', cao: (cao + 6) * k };
  }
  function holoLa(o) {   // hồ lô vàng dạng lá mỏng (tấm chạm vân) hoặc chỉ là vành rỗng
    var k = o.k || 1, g = new THREE.Group(), f = hinhHoLo(.9), cy = -.45, day = o.day || 1.0;
    function ra(d) { return vienTu(function (x, y) { return f(x, y) - d; }, 0, cy, 140); }
    if (o.lo) g.add(tamLo(vienTu(oval(3.5, 4.9), 0, -.26, 140), vienTu(hinhHoLo(.52), 0, -.26, 140), day, o.vl || VL.vangBua)), g.add(ongVien(vienTu(oval(3.5, 4.9), 0, cy, 140), .3, VL.vang, 0));
    else if (o.vanh) g.add(ongVien(ra(-.5), .78, o.vl || VL.vangBua, 0));
    else { var t = khoi(ra(0), 0, cy, hoSo(day, .3), o.vl || VL.vang); t.position.z = day / 2; g.add(t);
      g.add(ongVien(ra(.12), .26, VL.vang, day / 2 - .1)); g.add(ongVien(ra(.12), .26, VL.vang, -day / 2 + .1)); }
    var dinh = 4.6;
    if (o.xich) { var x = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, o.xich, 8), VL.vang); x.position.y = dinh + o.xich / 2; g.add(x);
      for (var i = 0; i < 3; i++) { var kk = khoen(.34, .1, VL.vang); kk.position.y = dinh + o.xich * (i + .5) / 3; kk.rotation.y = i % 2 ? PI / 2 : 0; g.add(kk); } dinh += o.xich; }
    if (o.trai) { var tr = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 20), VL.trai); tr.position.set(-2.6, dinh + .9, 0); g.add(tr); var tk = khoen(.5, .12, VL.vang); tk.position.set(-1.6, dinh + 1.5, 0); g.add(tk); }
    if (o.tua) { var day2 = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, o.tua, 8), VL.vang); day2.position.y = -5.2 - o.tua / 2; g.add(day2);
      for (var j = 0; j < 4; j++) { var k2 = khoen(.3, .09, VL.vang); k2.position.y = -5.2 - o.tua * (j + .5) / 4; k2.rotation.y = j % 2 ? PI / 2 : 0; g.add(k2); }
      var la = new THREE.Mesh(new THREE.SphereGeometry(1.5, 28, 18), o.vl || VL.vang); la.scale.set(.75, 1.15, .22); la.position.y = -5.2 - o.tua - 1.5; g.add(la); }
    var cao = (o.treo === 'khoa' ? moc : mocDon)(g, dinh);
    var bao = new THREE.Group(); g.scale.setScalar(k); bao.add(g); bao.userData.khoa = g.userData.khoa;
    return { g: bao, rong: 1.6 * k, xo: 'treo', cao: (cao + 6) * k };
  }

  /* ---------- 10 charm ---------- */
  var DS = {};

  DS['25768'] = function () { return holoMat({ da: 'lucde', k: .8, yen: .55, hinh: function (x, y) { return hop(tron(x, y, 0, -1.3, 2.65), tron(x, y, 0, 1.65, 2.0), .45); }, vien: 'xoan', renR: .45, hatR: .17, soVong: 13, day: 1.6, cao: 2.5, treo: 'khoa' }); };   /* xem kĩ 4 ảnh: viền là 2 sợi dây vàng hạt xoắn bện thành mắt lưới, ôm sát dáng hồ lô; viên lục đế to, ổ trơn mảnh; lưng tấm khắc chữ; khoen + khoá lò xo */   // khung hình giọt nhọn đỉnh, viền thừng xoắn to; hồ lô lục đế trong ổ trơn

  DS['25800'] = function () {   // hạt đậu phỉ thuý lam băng chạm gân lá, viền vàng, chấu ruby, treo móc
    var g = new THREE.Group();
    function f(x, y) { return hop(hop(tron(x, y, 0, -3.3, 2.55), tron(x, y, .2, 0, 2.8), 1.6), tron(x, y, 0, 3.1, 2.3), 1.6); }
    g.add(khoi(vienTu(function (x, y) { return f(x, y) - .7; }, 0, 0), 0, 0, hoSo(1.2, .35), VL.vang));
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .52; }, 0, 0, 160), .2, VL.vang, .1));
    g.add(vom(vienTu(f, 0, 0, 120), 0, 0, 1.75, VL.lambang, function (x, y, s) {
      var giua = Math.exp(-Math.pow(x / .3, 2)), w = (y - Math.abs(x) * .95) / 2.1, d = Math.abs(w - Math.round(w)) * 2.1, gan = Math.exp(-Math.pow(d / .28, 2));
      return 1 - .3 * Math.max(giua, gan) * (1 - s * s * s); }, 40));   /* soát đợt 5: gân lá xương cá sâu rõ */
    var chau = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.3, 32), VL.vang); chau.rotation.x = PI / 2; chau.position.set(0, 6.95, -.55); g.add(chau);
    var rb = vien(.78, VL.ruby, .7); rb.position.set(0, 6.95, .1); g.add(rb);
    var cao = moc(g, 7.95);
    return { g: g, rong: 1.6, xo: 'treo', cao: cao + 6.6 };
  };

  DS['23767'] = function () {   // kim tiền chạm lộng: vành tròn dày; giữa là khung vuông cạnh lõm (4 góc chạm vành) ôm viên lục đế viền bi; 4 khoảng giữa vành và khung để trống, nhìn xuyên qua
    var g = new THREE.Group(), R = 4.1, day = 3.2, i, C0 = 3.42;
    function vong(r, n) { var p = []; for (var q = 0; q < n; q++) p.push(new V2(Math.cos(q / n * PI * 2) * r, Math.sin(q / n * PI * 2) * r)); return p; }
    function sao(x, y) { var d = Math.max(Math.abs(x), Math.abs(y)) - C0; [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) { d = Math.max(d, C0 - Math.hypot(x - c[0] * C0, y - c[1] * C0)); }); return d; }
    g.add(thanhVien(vong(R - .05, 128), day - .2, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 14; k++) { var x = (k + .5) * w / 14; c.beginPath(); c.moveTo(x, h * .2); c.lineTo(x + w / 32, h / 2); c.lineTo(x, h * .8); c.lineTo(x - w / 32, h / 2); c.fill(); } })), 1));   /* soát đợt 5: thành lộng mắt trám như ảnh (trước đặc) */
    g.add(thanhVien(vong(R - .7, 128), day - .2, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 14; k++) { var x = (k + .5) * w / 14; c.beginPath(); c.moveTo(x, h * .2); c.lineTo(x + w / 32, h / 2); c.lineTo(x, h * .8); c.lineTo(x - w / 32, h / 2); c.fill(); } })), 1));
    [1, -1].forEach(function (m) { var v = khoen(R - .36, .37, VL.vang); v.position.z = m * day / 2; g.add(v);
      var t = khoi(vienTu(sao, 0, 0, 200), 0, 0, hoSo(.8, .22), VL.vang); t.position.z = m > 0 ? day / 2 : -day / 2 + .8; g.add(t); });
    g.add(chuoiHat(vong(1.72, 80), .2, VL.vang, day / 2 + .05));
    var v = vien(1.5, VL.lucde, .75); v.position.z = day / 2; g.add(v);
    g.scale.setScalar(.9);
    return { g: g, rong: 7.4, xo: 'xuyen', cao: 7.4 };
  };

  DS['23774'] = function () {   // cỏ 4 lá vàng: 4 cánh nhọn đầu (kiểu cánh sen), viên lục đế to ở giữa viền bi, mỗi cánh 1 viên ruby
    var g = new THREE.Group(), i, T = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    function f(x, y) { var d = 1e9; T.forEach(function (c) { d = hop(d, hop(tron(x, y, c[0] * 2.75, c[1] * 2.75, 2.15), tron(x, y, c[0] * 5.5, c[1] * 5.5, .1), 2.1), .12); }); return d; }   /* 4 cánh tách rõ, khe sâu giữa các cánh, đầu cánh nhọn */
    var than = khoi(vienTu(f, 0, 0, 200), 0, 0, hoSo(3.0, .5), VL.vang, true); than.position.z = 1.5; g.add(than);
    lungLo(g, function (x, y) { return f(x, y) + .05; }, -1.5, HV.co4, 5.8, null, -.9);   /* soát: lưng 4 thuỳ lộng + hoa giữa */
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .45; }, 0, 0, 200), .2, VL.vang, 1.55));
    g.add(chuoiHat((function () { var p = []; for (var q = 0; q < 70; q++) p.push(new V2(Math.cos(q / 70 * PI * 2) * 2.12, Math.sin(q / 70 * PI * 2) * 2.12)); return p; })(), .2, VL.vang, 1.6));
    var v = vien(1.9, VL.lucde, .75); v.position.z = 1.55; g.add(v);
    T.forEach(function (c) { var x = c[0] * 3.55, y = c[1] * 3.55, b = khoen(.62, .14, VL.vang); b.position.set(x, y, 1.55); g.add(b); var r = vien(.52, VL.ruby, .75); r.position.set(x, y, 1.6); g.add(r); });
    g.rotation.z = PI / 4; var bao = new THREE.Group(); g.scale.setScalar(.85); bao.add(g);
    return { g: bao, rong: 6.6, xo: 'xuyen', cao: 8.6 };
  };

  DS['23786'] = function () {   // hoa 4 cánh phỉ thuý lục đế, đế vàng, nhuỵ ruby
    var g = new THREE.Group();
    function f(x, y) { return hop(hop(tron(x, y, 2.05, 0, 2.5), tron(x, y, -2.05, 0, 2.5), .9), hop(tron(x, y, 0, 2.05, 2.5), tron(x, y, 0, -2.05, 2.5), .9), .9); }
    g.add(khoi(vienTu(function (x, y) { return f(x, y) - .5; }, 0, 0, 144), 0, 0, hoSo(2.3, .5), VL.vang, true));
    lungLo(g, function (x, y) { return f(x, y) - .45; }, -2.3, HV.nutDan, 5.2, VL.lucde, -1.5);   /* soát: lưng 4 vòng đan lộng (ảnh lưng) */
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .32; }, 0, 0, 200), .2, VL.vang, .08));
    g.add(vom(vienTu(f, 0, 0, 144), 0, 0, 2.5, VL.lucde, function (x, y, s) {
      var a = Math.atan2(y, x), ranh = Math.pow(Math.abs(Math.sin(2 * a)), 5), r = Math.hypot(x, y);
      return (1 - .3 * ranh * Math.min(1, r / 1.2)) * (1 - .1 * Math.exp(-Math.pow((r - 2.4) / .9, 2)) * (1 - ranh)); }));
    var be = khoen(.74, .2, VL.vang); be.position.z = 2.42; g.add(be);
    var rb = vien(.6, VL.ruby, .8); rb.position.z = 2.5; g.add(rb);
    g.position.z = 1.1; var bao = new THREE.Group(); bao.add(g); bao.scale.setScalar(.88);
    return { g: bao, rong: 8.6, xo: 'xuyen', cao: 8.6 };
  };

  DS['25890'] = function () {   // lu thống vàng nhám: thân TRÒN dạng trống (phình nhẹ giữa), dài 10 × Ø 8,4 ly; 4 mặt cột chấm bi nổi; 2 đầu vòm nhẹ có lỗ xỏ
    var pts = [], i, L = 5, RR = 4.2, lo = .8;
    for (i = 0; i <= 60; i++) { var t = i / 60, y, r;
      if (t < .12) { var a = t / .12 * PI / 2; y = -L + .9 * (1 - Math.cos(a)); r = lo + (RR * .9 - lo) * Math.sin(a); }
      else if (t > .88) { a = (1 - t) / .12 * PI / 2; y = L - .9 * (1 - Math.cos(a)); r = lo + (RR * .9 - lo) * Math.sin(a); }
      else { var u = (t - .5) / .38; y = u * (L - .9); r = RR * (1 - .1 * u * u); }
      pts.push(new V2(r, y)); }
    var o = tienTron(pts, VL.vangNham, 112), p = o.g.attributes.position;
    for (i = 0; i < p.count; i++) o.g.attributes.uv.setY(i, (p.getY(i) / L + 1) / 2);   /* chấm bi đều theo chiều dài thân */
    var m = xongTien(o); m.rotation.z = PI / 2;
    var g = new THREE.Group(); g.add(m);
    [-1, 1].forEach(function (d) { var h = new THREE.Mesh(new THREE.CircleGeometry(lo * .98, 24), VL.toi); h.rotation.y = d * PI / 2; h.position.x = d * (L + .01); g.add(h); });
    return { g: g, rong: 10, xo: 'ong', cao: 8.4 };
  };

  /* ---------- tiện tròn có vân theo góc (lu, chặn, hạt rỗng) ---------- */
  var _hai = {};
  function hai(vl) { if (!_hai[vl.uuid]) { _hai[vl.uuid] = vl.clone(); _hai[vl.uuid].side = THREE.DoubleSide; } return _hai[vl.uuid]; }   /* bản 2 mặt: thấy cả lòng trong của ống rỗng */
  function xoayLuoi(pf, nA, fr, vl, a0, a1) {   /* mặt tròn xoay quanh trục y theo profile pf [[r,y],…]; fr(r,y,a,j) → bán kính mới (vân theo góc); a0..a1: chỉ quét 1 cung */
    var nP = pf.length, pos = [], uv = [], idx = [], i, j, kin = a0 === undefined; if (kin) { a0 = 0; a1 = PI * 2; }
    for (i = 0; i <= nA; i++) { var a = a0 + (a1 - a0) * i / nA, s = Math.sin(a), c = Math.cos(a);
      for (j = 0; j < nP; j++) { var r = fr ? fr(pf[j][0], pf[j][1], a, j) : pf[j][0]; pos.push(s * r, pf[j][1], c * r); uv.push(i / nA, j / (nP - 1)); } }
    for (i = 0; i < nA; i++) for (j = 0; j < nP - 1; j++) { var A = j + i * nP, B = j + (i + 1) * nP, C = j + 1 + (i + 1) * nP, D = j + 1 + i * nP; idx.push(A, B, D, C, D, B); }
    var g = luoi(pos, idx, uv);
    if (kin) { var nr = g.attributes.normal; for (j = 0; j < nP; j++) { var p = j, q = nA * nP + j, x = nr.getX(p) + nr.getX(q), y = nr.getY(p) + nr.getY(q), z = nr.getZ(p) + nr.getZ(q), l = Math.hypot(x, y, z) || 1; nr.setXYZ(p, x / l, y / l, z / l); nr.setXYZ(q, x / l, y / l, z / l); } }
    return new THREE.Mesh(g, vl);
  }
  function hangKc(r, ds, vl) {   /* nhiều viên kim cương ds = [[x,y,z,nx,ny,nz],…]: mặt bàn quay theo pháp tuyến n */
    var im = new THREE.InstancedMesh(kcGeo(r), vl || VL.kc, ds.length), o = new THREE.Object3D();
    ds.forEach(function (d, i) { o.position.set(d[0], d[1], d[2]); o.lookAt(d[0] + d[3], d[1] + d[4], d[2] + d[5]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    return im;
  }
  function vongKc(r, R, y, n, ny, vl) {   /* 1 hàng kim cương quanh trục y ở độ cao y, bán kính R; ny: độ chúc pháp tuyến theo trục y */
    var ds = []; for (var i = 0; i < n; i++) { var a = i / n * PI * 2, s = Math.sin(a), c = Math.cos(a); ds.push([s * R, y, c * R, s, ny || 0, c]); } return hangKc(r, ds, vl);
  }
  function ongNam(g) { g.rotation.z = PI / 2; var b = new THREE.Group(); b.add(g); return b; }   /* dựng đứng theo trục y → nằm ngang theo dây */

  DS['25381'] = function () {   /* lu thống viền loe (xem 4 ảnh): ống chỉ thắt eo, 2 đầu loe như kèn, miệng hơi oval lượn; thành rãnh dọc mảnh; hàng kim cương quanh 2 miệng loe (ngoài + trong lòng), đai kim cương nổi ở eo; ruột rỗng lỗ to */
    var L = 4.2, rw = 2.3, re = 4.1, W = .42, pf = [], i, N = 64;
    function R(y) { return rw + (re - rw) * Math.pow(Math.abs(y) / L, 2.2); }
    function D(y) { return (re - rw) * 2.2 * Math.pow(Math.abs(y) / L, 1.2) / L; }
    for (i = 0; i <= N; i++) { var y = -L + 2 * L * i / N; pf.push([R(y), y]); }
    pf.push([R(L) - W * .5, L + .16]); for (i = N; i >= 0; i--) { y = -L + 2 * L * i / N; pf.push([R(y) - W - .05 * (1 - Math.abs(y) / L), y]); } pf.push([R(-L) - W * .5, -L - .16]); pf.push(pf[0].slice());
    var g = new THREE.Group();
    g.add(xoayLuoi(pf, 160, function (r, y, a, j) { var k = Math.pow(Math.abs(y) / L, 3), ay = Math.abs(y);
      if (j <= N) { if (ay < .78) r += .38 * Math.min(1, (.78 - ay) / .1); else if (ay < L - .55) r += .045 * Math.cos(64 * a) - .02; }   /* đai eo nổi · rãnh dọc mảnh trên thành */
      return r * (1 + .05 * k * Math.cos(2 * a)); }, hai(VL.vang)));
    var ds = [];
    [-1, 1].forEach(function (sg) { var y = sg * (L - .32), n = 40, rr = R(y) + .04, dd = D(y);
      for (i = 0; i < n; i++) { var a = (i + .5 * (sg > 0)) / n * PI * 2, s = Math.sin(a), c = Math.cos(a), q = 1 + .05 * Math.pow(Math.abs(y) / L, 3) * Math.cos(2 * a);
        ds.push([s * rr * q, y, c * rr * q, s, -sg * dd, c]);
        var ri = (R(y) - W - .04) * q, yi = sg * (L - .38); if (i % 2 === 0) ds.push([s * ri, yi, c * ri, -s, sg * 1.2, -c]); } });   /* mặt ngoài miệng loe + 1 hàng trong lòng */
    g.add(hangKc(.27, ds, VL.kc));
    g.add(vongKc(.31, rw + .4, 0, 17, 0));
    [-.66, .66].forEach(function (y) { var t = khoen(rw + .38, .07, VL.vang); t.rotation.x = PI / 2; t.position.y = y; g.add(t); });   /* chỉ viền 2 mép đai eo */
    return { g: ongNam(g), rong: 2 * L + .3, xo: 'ong', cao: 2 * re };
  };
  DS['25389'] = function () {   /* chặn bánh xe vàng TRẮNG (xem 4 ảnh): khoanh tròn dẹt (dài ≈ 0,45 đường kính); rãnh giữa 1 hàng kim cương tròn kẹp giữa 2 gờ bóng; 2 mặt hở, 4 nan chữ thập nối moay-ơ quanh lỗ */
    var g = new THREE.Group(), i, bac = hai(VL.bac);
    var pf = [[3.25, -1.9], [3.6, -1.9], [3.92, -1.84], [4.1, -1.66], [4.15, -1.42], [4.1, -1.18], [3.95, -1.04], [3.72, -.98], [3.62, -.9], [3.62, .9], [3.72, .98], [3.95, 1.04], [4.1, 1.18], [4.15, 1.42], [4.1, 1.66], [3.92, 1.84], [3.6, 1.9], [3.25, 1.9], [3.25, -1.9]];
    g.add(xoayLuoi(pf, 140, null, bac));
    g.add(vongKc(.52, 3.7, 0, 21, 0));
    var ds = []; for (i = 0; i < 42; i++) { var a = (i + .5) / 42 * PI * 2; [-.78, .78].forEach(function (y) { ds.push([Math.sin(a) * 3.66, y, Math.cos(a) * 3.66]); }); }
    var hb = new THREE.InstancedMesh(new THREE.SphereGeometry(.12, 8, 6), VL.bac, ds.length), m4 = new THREE.Matrix4(); ds.forEach(function (d, k) { m4.makeTranslation(d[0], d[1], d[2]); hb.setMatrixAt(k, m4); }); g.add(hb);   /* hạt chấu giữ đá 2 bên rãnh */
    [-1, 1].forEach(function (sg) { var y = sg * 1.55;
      for (i = 0; i < 4; i++) { var a = PI / 4 + i * PI / 2, b = new THREE.Mesh(new THREE.BoxGeometry(.45, .4, 2.5), VL.bac); b.position.set(Math.sin(a) * 2.05, y, Math.cos(a) * 2.05); b.rotation.y = a; g.add(b); }
      var h = khoen(.85, .23, VL.bac); h.rotation.x = PI / 2; h.position.y = y; g.add(h); });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, 3.1, 28, 1, true), bac));   /* lòng lỗ xỏ */
    return { g: ongNam(g), rong: 3.8, xo: 'ong', cao: 8.3 };
  };
  DS['25390'] = function () {   /* lu thống đính đá vàng TRẮNG (xem 4 ảnh): thắt eo; mỗi nửa là bầu loe gắn 8 viên baguette chữ nhật thuôn xếp vòng; đầu bầu có 8 chấu nhọn loe ra như vương miện; eo là đai trơn bóng; lỗ nhỏ */
    var g = new THREE.Group(), i, yW = .45, yE = 3.4, rW = 1.45, rE = 2.5, bac = hai(VL.bac);
    g.add(xoayLuoi([[.55, -yE], [rE - .2, -yE], [rW - .2, -yW], [rW - .2, yW], [rE - .2, yE], [.55, yE], [.55, -yE]], 96, null, bac));
    var gb = new THREE.BoxGeometry(1, 1, .46).toNonIndexed(), p = gb.attributes.position, len = 2.55;
    for (i = 0; i < p.count; i++) { var t = p.getY(i) + .5, w = .68 + (1.12 - .68) * t, zz = p.getZ(i); p.setXYZ(i, p.getX(i) * w * (zz > 0 ? .86 : 1), p.getY(i) * len * (zz > 0 ? .96 : 1), zz); }   /* thuôn: đầu hẹp ở eo, mặt bàn nhỏ hơn đáy */
    gb.computeVertexNormals();
    var kcT = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0, transmission: .85, ior: 2.4, thickness: .6, flatShading: true, envMapIntensity: 3, specularIntensity: 1, clearcoat: 1, emissive: 0xffffff, emissiveIntensity: .12 });   /* baguette trong suốt, mặt giác bậc */
    var im = new THREE.InstancedMesh(gb, kcT, 16), m4 = new THREE.Matrix4(), k = 0, dr = rE - rW, dy = yE - yW;
    [-1, 1].forEach(function (sg) { for (i = 0; i < 8; i++) { var a = (i + (sg > 0 ? .5 : 0)) / 8 * PI * 2, u = new V3(Math.sin(a), 0, Math.cos(a)), tA = u.clone().multiplyScalar(dr).add(new V3(0, sg * dy, 0)).normalize();
      var zA = u.clone().sub(tA.clone().multiplyScalar(u.dot(tA))).normalize(), yA = tA, xA = new V3().crossVectors(yA, zA), yc = sg * (yW + dy / 2), rc = rW + dr / 2;
      m4.makeBasis(xA, yA, zA).setPosition(u.x * (rc + .02), yc, u.z * (rc + .02)); im.setMatrixAt(k++, m4); } });
    g.add(im);
    [-1, 1].forEach(function (sg) { for (i = 0; i < 8; i++) { var a = (i + (sg > 0 ? 0 : .5)) / 8 * PI * 2, s = Math.sin(a), c = Math.cos(a);
      var A = new V3(s * (rE - .05), sg * (yE - .1), c * (rE - .05)), B = new V3(s * (rE + .2), sg * (yE + .32), c * (rE + .2)), cu = new THREE.LineCurve3(A, B);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(cu, 1, .13, 8), VL.bac)); var tp = new THREE.Mesh(new THREE.SphereGeometry(.21, 12, 8), VL.bac); tp.position.copy(B); g.add(tp); }
      var vr = khoen(rE - .12, .13, VL.bac); vr.rotation.x = PI / 2; vr.position.y = sg * (yE - .02); g.add(vr);
      var vw = khoen(rW - .05, .08, VL.bac); vw.rotation.x = PI / 2; vw.position.y = sg * yW; g.add(vw); });   /* 8 chấu loe ở miệng mỗi bầu + chỉ viền */
    var dai = khoen(rW + .02, .3, VL.bac); dai.rotation.x = PI / 2; g.add(dai);
    [-1, 1].forEach(function (sg) { var h = new THREE.Mesh(new THREE.CircleGeometry(.55, 20), VL.toi); h.rotation.x = -sg * PI / 2; h.position.y = sg * (yE + .01); g.add(h); });
    return { g: ongNam(g), rong: 2 * yE + .7, xo: 'ong', cao: 2 * rE + .5 };
  };
  DS['21655'] = function () {   /* chặn dẹt bánh xe (xem 4 ảnh): hạt dẹt (dài ≈ 0,65 đường kính), vàng satin, lỗ to; quanh thân 2 hàng gờ xoắn kiểu dây thừng chéo ngược chiều (chữ V), rãnh nhỏ ở đường xích đạo */
    var pf = [], i, N = 40, H = 1.62, Rq = 2.6, ho = .98;
    for (i = 0; i <= N; i++) { var y = -H + 2 * H * i / N; pf.push([Rq * Math.sqrt(1 - Math.pow(y / 2.05, 2)), y]); }
    pf.push([ho + .12, H]); pf.push([ho, H - .1]); pf.push([ho, -H + .1]); pf.push([ho + .12, -H]); pf.push(pf[0].slice());
    var g = new THREE.Group();
    g.add(xoayLuoi(pf, 220, function (r, y, a, j) { if (j > N) return r; var ay = Math.abs(y);
      var f = ay > .12 && ay < H - .1 ? Math.sin(PI * (ay - .12) / (H - .22)) : 0, ph = 14 * a + 3.2 * y, gd = Math.pow(Math.abs(Math.cos(ph)), .7);
      return r + .17 * (gd - .55) * f - .1 * Math.exp(-Math.pow(y / .1, 2)); }, hai(VL.vangMo)));
    return { g: ongNam(g), rong: 2 * H, xo: 'ong', cao: 2 * Rq };
  };
  var vanXoan = vai(1024, 512, function (c, w, h) {   /* hoa văn chạm lộng hạt 19805: trắng = vàng, đen = khoét thủng → còn lại các dải vàng cuộn xoắn */
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.strokeStyle = '#000'; c.fillStyle = '#000'; c.lineCap = 'round';
    for (var col = 0; col < 8; col++) for (var row = 0; row < 3; row++) { var cx = (col + .5 + (row % 2) * .5) * w / 8, cy = h * (.2 + row * .3), sx = (col + row) % 2 ? -1 : 1;
      [-w, 0, w].forEach(function (dx) { c.lineWidth = 21; c.beginPath(); for (var t = 0; t <= 1.0001; t += .015) { var an = t * PI * 3.0, rr = 7 + 50 * t; c.lineTo(dx + cx + sx * Math.cos(an) * rr, cy + Math.sin(an) * rr * .85); } c.stroke();   /* lỗ xoắn ốc */
        c.lineWidth = 22; c.beginPath(); c.arc(dx + cx - sx * 52, cy + (row % 2 ? 44 : -44), 24, 0, PI * 1.4); c.stroke();   /* lỗ hình chữ C giữa các cuộn */
        c.beginPath(); c.ellipse(dx + cx + sx * 58, cy + (row % 2 ? -30 : 30), 12, 22, sx * .6, 0, PI * 2); c.fill(); }); } });
  vanXoan.colorSpace = THREE.NoColorSpace; vanXoan.generateMipmaps = false; vanXoan.minFilter = THREE.LinearFilter;   /* giữ lỗ khoét sắc nét khi nhìn nhỏ */
  DS['19805'] = function () {   /* chặn hoa văn (xem 4 ảnh): hạt tròn chạm lộng, khoét hình xoắn cuộn chữ C/S, vàng satin; 2 lỗ xỏ có cổ tròn */
    var R = 2.75, t0 = .38, g = new THREE.Group();
    var vl = new THREE.MeshStandardMaterial({ color: 0xf2c25a, metalness: 1, roughness: .36, alphaMap: vanXoan, alphaTest: .5, bumpMap: vanXoan, bumpScale: 1.2, side: THREE.DoubleSide });
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 56, 0, PI * 2, t0, PI - 2 * t0), vl));
    [-1, 1].forEach(function (sg) { var k = khoen(R * Math.sin(t0), .22, VL.vangMo); k.rotation.x = PI / 2; k.position.y = sg * R * Math.cos(t0); g.add(k); });
    return { g: ongNam(g), rong: 2 * R * Math.cos(t0) + .4, xo: 'ong', cao: 2 * R };
  };
  DS['18924'] = function () {   /* chặn đèn lồng (xem 4 ảnh): hạt tròn hơi dẹt; 10 nan dọc dẹt có vân hạt, khe hở giữa các nan; 2 đầu cổ tròn (nhìn từ đầu thấy hình sao 10 cánh) */
    var R = 2.75, H = 2.3, t0 = .42, g = new THREE.Group(), i, pf = [], N = 28, vl = hai(VL.vangNham);
    for (i = 0; i <= N; i++) { var t = t0 + (PI - 2 * t0) * i / N; pf.push([R * Math.sin(t), H * Math.cos(t)]); }
    for (i = N; i >= 0; i--) { t = t0 + (PI - 2 * t0) * i / N; pf.push([(R - .32) * Math.sin(t), (H - .3) * Math.cos(t)]); } pf.push(pf[0].slice());
    for (i = 0; i < 10; i++) { var a = i / 10 * PI * 2; g.add(xoayLuoi(pf, 8, null, vl, a - .2, a + .2)); }
    var hh = [], m4 = new THREE.Matrix4(); for (i = 0; i < 10; i++) for (var e2 = -1; e2 <= 1; e2 += 2) { var ae = i / 10 * PI * 2 + e2 * .19; for (var q = 0; q <= 40; q++) { var tq = t0 + .1 + (PI - 2 * t0 - .2) * q / 40; hh.push([Math.sin(ae) * (R + .02) * Math.sin(tq), H * Math.cos(tq), Math.cos(ae) * (R + .02) * Math.sin(tq)]); } }
    var ih = new THREE.InstancedMesh(new THREE.SphereGeometry(.075, 8, 6), VL.vang, hh.length); hh.forEach(function (d, k) { m4.makeTranslation(d[0], d[1], d[2]); ih.setMatrixAt(k, m4); }); g.add(ih);   /* dây hạt viền 2 mép nan */
    [-1, 1].forEach(function (sg) { var k = khoen(R * Math.sin(t0) - .05, .3, VL.vangNham); k.rotation.x = PI / 2; k.position.y = sg * H * Math.cos(t0); g.add(k);
      for (i = 0; i < 10; i++) { var a = (i + .5) / 10 * PI * 2, d = new THREE.Mesh(new THREE.ConeGeometry(.28, .5, 4), VL.vangNham); d.position.set(Math.sin(a) * (R * Math.sin(t0) + .3), sg * H * Math.cos(t0), Math.cos(a) * (R * Math.sin(t0) + .3)); d.rotation.set(0, a - PI / 2, -PI / 2); g.add(d); } });   /* răng sao quanh cổ */
    return { g: ongNam(g), rong: 2 * H * Math.cos(t0) + .6, xo: 'ong', cao: 2 * R };
  };

  DS['21660'] = function () {   /* chặn dẹt (xem 4 ảnh): hạt tròn dẹt, vàng bóng satin, lỗ to; quanh thân 1 dải gờ xoắn chéo cùng chiều như cuộn dây, 2 mép có rãnh viền */
    var pf = [], i, N = 40, H = 1.6, Rq = 2.45, ho = .98;
    for (i = 0; i <= N; i++) { var y = -H + 2 * H * i / N; pf.push([Rq * Math.sqrt(1 - Math.pow(y / 2.0, 2)), y]); }
    pf.push([ho + .12, H]); pf.push([ho, H - .1]); pf.push([ho, -H + .1]); pf.push([ho + .12, -H]); pf.push(pf[0].slice());
    var g = new THREE.Group();
    g.add(xoayLuoi(pf, 220, function (r, y, a, j) { if (j > N) return r; var ay = Math.abs(y), f = ay < 1.05 ? Math.cos(ay / 1.05 * PI / 2) : 0;
      var ph = 15 * a + 4.2 * y + .7 * Math.sin(PI * y / 1.05), gd = Math.pow(Math.abs(Math.cos(ph)), .6);
      return r + .2 * (gd - .5) * Math.pow(f, .4) - .09 * Math.exp(-Math.pow((ay - 1.17) / .07, 2)); }, hai(VL.vangMo)));
    return { g: ongNam(g), rong: 2 * H, xo: 'ong', cao: 2 * Rq };
  };
  DS['22706'] = function () {   /* chặn vuông vát (xem 4 ảnh): khối lập phương vát 8 góc (mỗi mặt thành bát giác, góc là tam giác), vàng xước nhám; lỗ xỏ giữa 2 mặt đối diện */
    var h = 2.1, k = 5.55, e = k - 2 * h, F = [], i;   /* vát góc vừa phải như ảnh */
    function mat(ax, sg) {   /* mặt bát giác vuông góc trục ax */
      var p = [[h, e], [e, h], [-e, h], [-h, e], [-h, -e], [-e, -h], [e, -h], [h, -e]];
      return p.map(function (q) { var v = [0, 0, 0]; v[ax] = sg * h; v[(ax + 1) % 3] = q[0]; v[(ax + 2) % 3] = q[1]; return v; }); }
    for (i = 0; i < 3; i++) { F.push(mat(i, 1)); F.push(mat(i, -1).reverse()); }
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sy) { [-1, 1].forEach(function (sz) { var t = [[sx * e, sy * h, sz * h], [sx * h, sy * e, sz * h], [sx * h, sy * h, sz * e]]; if (sx * sy * sz < 0) t.reverse(); F.push(t); }); }); });
    var pos = []; F.forEach(function (f) { for (var j = 1; j < f.length - 1; j++) [f[0], f[j], f[j + 1]].forEach(function (v) { pos.push(v[0], v[1], v[2]); }); });
    var gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gm.computeVertexNormals();
    var uv = []; for (i = 0; i < pos.length; i += 3) uv.push(pos[i] / 5 + pos[i + 2] / 7 + .5, pos[i + 1] / 5 + .5); gm.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    var g = new THREE.Group(); var bua = VAN.bua.clone(); bua.repeat.set(1.4, 1.4); bua.needsUpdate = true; g.add(new THREE.Mesh(gm, new THREE.MeshStandardMaterial({ color: 0xf6c55c, metalness: 1, roughness: .38, bumpMap: bua, bumpScale: 1.4, side: THREE.DoubleSide })));   /* soát: vàng chạm búa lấp lánh như ảnh (trước trơn) */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.62, 24), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (h + .01); g.add(l); });
    return { g: g, rong: 2 * h, xo: 'ong', cao: 2 * h };
  };
  DS['16291'] = function (o) {   /* chặn bánh xe đính đá (xem 4 ảnh): khoanh vàng vàng, 1 hàng đá màu trong rãnh giữa 2 gờ; mỗi mặt bên là bánh xe 3 lỗ tròn quanh lỗ giữa. Có 2 màu đá (user xác nhận): xanh lục (mặc định) / hồng — o.mau = 'hong' */
    var g = new THREE.Group(), i, vv = hai(VL.vang);
    g.add(xoayLuoi([[3.0, -1.8], [3.3, -1.8], [3.55, -1.75], [3.68, -1.6], [3.68, -1.15], [3.44, -1.08], [3.36, -.98], [3.36, .98], [3.44, 1.08], [3.68, 1.15], [3.68, 1.6], [3.55, 1.75], [3.3, 1.8], [3.0, 1.8], [3.0, -1.8]], 120, null, vv));
    var hong = o && o.mau === 'hong', daMau = new THREE.MeshPhysicalMaterial({ color: hong ? 0xe2245f : 0x0b8f3a, metalness: .25, roughness: 0, flatShading: true, clearcoat: 1, envMapIntensity: 2.4, emissive: hong ? 0x7a0b2c : 0x06501f, emissiveIntensity: .3 });
    g.add(vongKc(.62, 3.38, 0, 17, 0, daMau));
    var ds = [], m4 = new THREE.Matrix4(); for (i = 0; i < 44; i++) { var a = (i + .5) / 44 * PI * 2; [-.82, .82].forEach(function (y) { ds.push([Math.sin(a) * 3.36, y, Math.cos(a) * 3.36]); }); }
    var hb = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 8, 6), VL.vang, ds.length); ds.forEach(function (d, k) { m4.makeTranslation(d[0], d[1], d[2]); hb.setMatrixAt(k, m4); }); g.add(hb);   /* hạt chấu */
    var sh = new THREE.Shape(); sh.absarc(0, 0, 3.05, 0, PI * 2, false);
    var l0 = new THREE.Path(); l0.absarc(0, 0, .6, 0, PI * 2, true); sh.holes.push(l0);
    for (i = 0; i < 3; i++) { var aa = PI / 2 + i * PI * 2 / 3, lp = new THREE.Path(), w2 = .78;   /* soát đợt 5: 3 khe cong rộng giữa 3 nan (bánh xe), không phải 3 lỗ tròn */
      lp.absarc(0, 0, 2.6, aa - w2, aa + w2, false); lp.absarc(0, 0, 1.05, aa + w2 - .1, aa - w2 + .1, true); lp.closePath(); sh.holes.push(lp); }
    var mg = new THREE.ExtrudeGeometry(sh, { depth: .26, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2, curveSegments: 40 });
    [-1, 1].forEach(function (sg) { var m = new THREE.Mesh(mg, VL.vang); m.rotation.x = -sg * PI / 2; m.position.y = sg * 1.48; g.add(m); });   /* mặt bánh xe 3 lỗ */
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 3.0, 24, 1, true), vv));
    return { g: ongNam(g), rong: 3.6, xo: 'ong', cao: 7.4 };
  };
  DS['23826'] = function () {   /* thanh đá tour (xem 4 ảnh): thanh chữ nhật dài ≈ 2,2 × rộng, toàn thân vàng chạm búa lấp lánh; mặt trước gắn tourmaline hồng hình trái tim; 2 thành dài khoét hàng trái tim xen tam giác; xỏ dọc theo chiều dài */
    var L = 10, W = 4.5, T = 4.0, g = new THREE.Group(), i;
    var vk = vienTu(function (x, y) { var dx = Math.abs(x) - L / 2 + .4, dy = Math.abs(y) - W / 2 + .4; return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0) - .4; }, 0, 0, 240);
    var than = khoi(vk, 0, 0, hoSo(T, .28), VL.vangBua); than.position.z = T / 2; g.add(than);
    function traiTim(s) { var p = []; for (var q = 0; q < 72; q++) { var t = q / 72 * PI * 2; p.push(new V2(16 * Math.pow(Math.sin(t), 3) * s / 16, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s / 16 + .1 * s)); } return p; }
    var hongT = da(0xee9f9b, vanMay, .16, .38);
    var tim = traiTim(1.35).reverse(), vd = vom(tim, 0, 0, 1.0, hongT);   /* đảo chiều cho ngược kim đồng hồ như vienTu */ vd.position.z = T / 2; g.add(vd);
    g.add(ongVien(traiTim(1.42), .14, VL.vang, T / 2 + .05));
    var sh = new THREE.Shape(traiTim(.62).map(function (q) { return new V2(q.x, q.y); })), tg = new THREE.ShapeGeometry(sh);
    var tam = new THREE.Shape([new V2(-.5, .45), new V2(.5, .45), new V2(0, -.45)]), tgg = new THREE.ShapeGeometry(tam);
    [-1, 1].forEach(function (sg) { for (i = 0; i < 5; i++) { var x = (i - 2) * 1.9, m = new THREE.Mesh(tg, VL.toi); if (sg > 0) m.rotation.set(-PI / 2, 0, PI); else m.rotation.set(PI / 2, 0, 0); m.position.set(x, sg * (W / 2 + .01), 0); g.add(m);
        if (i < 4) { var t2 = new THREE.Mesh(tgg, VL.toi); if (sg > 0) t2.rotation.set(-PI / 2, 0, PI); else t2.rotation.set(PI / 2, 0, 0); t2.position.set(x + .95, sg * (W / 2 + .01), 0); g.add(t2); } } });   /* hàng trái tim + tam giác khoét trên 2 thành dài */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.75, 24), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (L / 2 + .01); g.add(l); });
    return { g: g, rong: L, xo: 'ong', cao: W };
  };
  DS['24056'] = function () {   /* lu thống bạc phủ vàng (xem 4 ảnh): ống trụ dài ≈ 2,2 × đường kính; giữa đai gờ nổi; 2 nửa chia 6 ô, mỗi ô hoa văn chữ S, nẹp chấm hạt giữa các ô; 2 đầu nắp hoa 6 cánh có lỗ */
    var H = 5.5, R = 2.5, pf = [], i, N = 110;
    for (i = 0; i <= N; i++) { var y = -H + .25 + (2 * H - .5) * i / N; pf.push([R, y]); }
    pf.unshift([R - .25, -H]); pf.unshift([.75, -H]); pf.push([R - .25, H]); pf.push([.75, H]);
    var g = new THREE.Group();
    g.add(xoayLuoi(pf, 240, function (r, y, a, j) { var ay = Math.abs(y); if (ay > H - .05) return r;
      if (ay < .8) return r + .3 + .12 * Math.exp(-Math.pow((ay - .55) / .08, 2)) - .08 * Math.exp(-Math.pow((ay - .3) / .07, 2)) + .05 * Math.cos(36 * a) * (ay < .2);   /* đai giữa */
      var e = ay > H - .55 ? (ay - (H - .55)) / .55 : 0, hoa = .14 * Math.abs(Math.cos(3 * a)) * e;   /* đầu loe hoa 6 cánh */
      var u = (a / (PI * 2) * 6) % 1, du = Math.abs(u - .5), v = (ay - .8) / (H - 1.4), z = 0;
      if (du > .43) z += .1 + .05 * Math.cos(y * 22);   /* nẹp chấm hạt */
      else if (v > 0 && v < 1) { var s = .5 + .2 * Math.sin(v * PI * 2), d1 = Math.abs(u - s); z += .09 * Math.exp(-Math.pow(d1 / .045, 2)) + .06 * Math.exp(-Math.pow((Math.hypot(u - .5, (v - .5) * 1.4) - .32) / .03, 2)) * 0; }   /* chữ S nổi */
      z += .1 * (Math.exp(-Math.pow((ay - .95) / .06, 2)) + Math.exp(-Math.pow((ay - (H - .7)) / .06, 2)));   /* chỉ viền ngang */
      return r + z + hoa; }, hai(VL.vangMo)));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.75, 24), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * (H + .01); g.add(l);
      for (i = 0; i < 6; i++) { var aa = (i + .5) / 6 * PI * 2, c = new THREE.Mesh(new THREE.CircleGeometry(.36, 16), VL.toi); c.rotation.x = -sg * PI / 2; c.position.set(Math.sin(aa) * 1.55, sg * (H + .01), Math.cos(aa) * 1.55); g.add(c); } });
    return { g: ongNam(g), rong: 2 * H, xo: 'ong', cao: 2 * R + .6 };
  };
  var vanTocXanh = vai(512, 512, function (g, w, h) {   /* thạch anh tóc xanh: nền xanh lục nhạt trong, mảng đậm, sợi tóc xanh rêu */
    g.fillStyle = '#f2faea'; g.fillRect(0, 0, w, h); var i, x, y, r, gr;
    for (i = 0; i < 30; i++) { x = Math.random() * w; y = Math.random() * h; r = 40 + Math.random() * 120; gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(40,95,40,' + (.15 + Math.random() * .25) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.lineCap = 'round'; for (i = 0; i < 260; i++) { x = Math.random() * w; y = Math.random() * h; var a = Math.random() * PI, l = 15 + Math.random() * 60; g.strokeStyle = 'rgba(' + (30 + Math.random() * 40 | 0) + ',' + (70 + Math.random() * 50 | 0) + ',30,' + (.18 + Math.random() * .3) + ')'; g.lineWidth = .5 + Math.random() * .9;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } });
  DS['12982'] = function () {   /* lu thống thạch anh tóc xanh khắc kim tiền (xem 4 ảnh): trụ đá trong xanh lục nhạt có sợi tóc xanh đậm, dài ≈ 1,5 × đường kính; thân chạm hoa văn kim tiền (đồng xu chồng, lỗ vuông giữa); 2 đầu viền trơn có rãnh */
    var H = 4.2, R = 2.8, pf = [[.7, -H], [R - .3, -H], [R - .08, -H + .08]], i, N = 70;
    for (i = 0; i <= N; i++) pf.push([R, -H + .3 + (2 * H - .6) * i / N]);
    pf.push([R - .08, H - .08]); pf.push([R - .3, H]); pf.push([.7, H]);
    var tx = vanTocXanh.clone(); tx.repeat.set(2, 1); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.needsUpdate = true;
    var da = daSuot({ mau: 0xc9e4b4, tr: .55, nhuom: 0xdcefcf, xa: 8, map: tx });
    var g = new THREE.Group(), C = 2 * PI * R, B = 1.75;
    g.add(soiToc(function (x, y, z) { return Math.max(Math.hypot(x, z) - R + .15, Math.abs(y) - H + .1, .75 - Math.hypot(x, z)); }, [-R, -H, -R, R, H, R], { mau: 0x1f3a15, so: 70, r: .04, dai: 4.5, hatGiong: 41 }));
    g.add(xoayLuoi(pf, 200, function (r, y, a, j) { var ay = Math.abs(y); if (j < 3 || j > N + 2) return r;
      var z = -.07 * Math.exp(-Math.pow((ay - (H - .75)) / .06, 2));
      if (ay < H - .85) { var u = a / (PI * 2) * C, v = y, best = 0;
        for (var q = -1; q <= 1; q++) for (var w = -1; w <= 1; w++) { var row = Math.round(v / B) + w, cu = (Math.round(u / B - (row % 2) * .5) + q + (row % 2) * .5) * B, cv = row * B, du = u - cu, dv = v - cv;
          best = Math.max(best, Math.exp(-Math.pow((Math.hypot(du, dv) - B * .55) / .06, 2)), Math.exp(-Math.pow((Math.max(Math.abs(du), Math.abs(dv)) - .26) / .05, 2))); }
        z -= .17 * best; }   /* rãnh đồng xu + lỗ vuông */
      return r + z; }, da));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.7, 24), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * (H + .01); g.add(l); });
    return { g: ongNam(g), rong: 2 * H, xo: 'ong', cao: 2 * R };
  };

  /* ---------- đồng điếu ---------- */
  function dieuTien(R, ri, hz, vl, p, lapU) {   /* khoanh đồng điếu tiện quanh trục y: mặt cắt siêu elip (p nhỏ → thành vuông hơn), lỗ ri, dày 2·hz */
    var pts = [], rc = (R + ri) / 2, hw = (R - ri) / 2;
    for (var i = 0; i <= 48; i++) { var a = i / 48 * PI * 2, c = Math.cos(a), s = Math.sin(a); pts.push(new V2(rc + hw * Math.sign(c) * Math.pow(Math.abs(c), p || .7), hz * Math.sign(s) * Math.pow(Math.abs(s), p || .7))); }
    return xongTien(tienTron(pts, vl, 96), lapU || 3);
  }
  function xich(g, A, B, r, vl) {   /* dây xích mắt nhỏ từ A tới B (V3), mắt xen kẽ xoay 90° */
    var d = B.clone().sub(A), L = d.length(), n = Math.max(2, Math.round(L / (r * 2.6))), q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), d.clone().normalize());
    for (var i = 0; i < n; i++) { var m = khoen(r, r * .28, vl); m.scale.y = 1.35; var o = new THREE.Group(); o.add(m); m.rotation.y = i % 2 ? PI / 2 : 0; o.quaternion.copy(q); o.position.copy(A).addScaledVector(d, (i + .5) / n); g.add(o); }
  }
  var vanMatHo = vai(512, 512, function (g, w, h) {   /* mắt hổ vàng: sợi óng song song, dải sáng tối gợn sóng */
    g.fillStyle = '#f0bd1c'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 900; i++) { var y = Math.random() * h, s = Math.random(); g.strokeStyle = s < .5 ? 'rgba(255,240,160,' + (.03 + Math.random() * .07) + ')' : 'rgba(170,100,0,' + (.02 + Math.random() * .05) + ')'; g.lineWidth = 1 + Math.random() * 3;
      g.beginPath(); for (var x = 0; x <= w; x += 16) g.lineTo(x, y + 6 * Math.sin(x / 70 + y / 40)); g.stroke(); } });
  var vanTocDam = vai(512, 512, function (g, w, h) {   /* thạch anh tóc xanh dày sợi (hạt điếu 1941) */
    g.fillStyle = '#cfe6c0'; g.fillRect(0, 0, w, h); var i;
    for (i = 0; i < 25; i++) { var x = Math.random() * w, y = Math.random() * h, r = 40 + Math.random() * 110, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(30,90,30,' + (.25 + Math.random() * .3) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.lineCap = 'round'; for (i = 0; i < 900; i++) { x = Math.random() * w; y = Math.random() * h; var a = Math.random() * PI, l = 8 + Math.random() * 45; g.strokeStyle = 'rgba(' + (15 + Math.random() * 30 | 0) + ',' + (60 + Math.random() * 50 | 0) + ',20,' + (.3 + Math.random() * .5) + ')'; g.lineWidth = .4 + Math.random() * .9;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); } });
  DS['1941'] = function () {   /* đồng điếu thạch anh tóc xanh (soát lại 4 ảnh): khoanh dày (≈ 0,5 đường kính) mặt cắt tròn mọng, lỗ ≈ 0,25 đường kính; đá XANH NHẠT TRONG, sợi tóc xanh đen dày bên trong */
    function f(x, y, z) { var r = Math.hypot(x, z), q = Math.max(Math.abs(r - 3.12) - 1.88 + 1.3, 0), w = Math.max(Math.abs(y) - 2.6 + 1.3, 0); return Math.hypot(q, w) - 1.3; }
    var g = daToc(f, [-5.1, -2.7, -5.1, 5.1, 2.7, 5.1], 'xanhDam', 72, 19, '1941');
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(1.2, 24), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * 1.35; g.add(l); });
    return { g: ongNam(g), rong: 5.2, xo: 'ong', cao: 10 };
  };

  DS['12430'] = function () {   /* điếu mắt hổ vàng (xem 4 ảnh): hạt điếu dày (≈ 0,53 đường kính), mặt vòm bóng, mắt hổ vàng óng ánh sợi; lỗ 2 ly */
    var m = dieuTien(5, 1.0, 2.65, da(0xf6c51e, vanMatHo, .14, .42), .85, 1);
    var g = new THREE.Group(); g.add(m);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * 1.6; g.add(l); });
    return { g: ongNam(g), rong: 5.3, xo: 'ong', cao: 10 };
  };
  DS['25146'] = function () {   /* điếu phỉ thuý trắng nối (xem 3 ảnh): đồng điếu băng trắng dày (≈ 0,45 đường kính); thanh vàng cong ôm mặt trước, giữa núm tròn gắn kim cương, dọc thanh đính kim cương nhỏ; 2 đầu thanh là khoen nối thò ra ngoài → charm nối nằm dọc dây */
    var R = 5, hz = 2.25, g = new THREE.Group(), i, d = dieuTien(R, .9, hz, daKinh({ mau: 0x9fd6c8, dac: .28 }), .72, 2); d.rotation.x = PI / 2; g.add(d);   /* soát đợt 5: ngọc băng trong đều (trước nửa đục nửa trong) */
    function zMat(x) { var u = Math.abs(x); if (u >= R) return .2; var t = (u - (R + .9) / 2) / ((R - .9) / 2); return Math.max(.2, hz * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 1 / .72 * 2)), .72 / 2)); }   /* cao độ mặt trước theo x (theo đúng mặt cắt) */
    var pts = []; for (i = 0; i <= 40; i++) { var x = -R - .6 + (2 * R + 1.2) * i / 40; pts.push(new V3(x, 0, Math.max(zMat(x), .9 * hz * Math.max(0, 1 - Math.pow(x / (R + .4), 8))) + .18)); }
    var tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, .5, 12), VL.vang); g.add(tb);
    var ds = []; pts.forEach(function (q, k) { if (k % 3 === 1 && Math.abs(q.x) > 1.3 && Math.abs(q.x) < R) ds.push([q.x, 0, q.z + .42, 0, 0, 1]); }); g.add(hangKc(.27, ds));
    var num = new THREE.Mesh(new THREE.SphereGeometry(1.0, 28, 18), VL.vang); num.scale.set(1.05, .9, .55); num.position.set(0, 0, hz + .3); g.add(num);
    g.add(hangKc(.28, [[0, 0, hz + .82, 0, 0, 1]]));
    [-1, 1].forEach(function (sg) { var k = khoen(.6, .17, VL.vang); k.position.set(sg * (R + 1.15), 0, 0); g.add(k); });
    return { g: g, rong: 2 * R + 3, xo: 'xuyen', cao: 2 * R };
  };
  DS['24203'] = function () {   /* điếu lam băng nối (xem 4 ảnh): đồng điếu lam băng nhỏ, thanh vàng vân hạt ngang qua mặt, giữa ổ kim cương; 2 đầu là cụm nơ vàng nhiều cánh đính kim cương, ngoài cùng là khoen nối */
    var R = 4, hz = 1.6, g = new THREE.Group(), i, d = dieuTien(R, .8, hz, VL.lambang, .7, 2); d.rotation.x = PI / 2; g.add(d);
    var c = 6.6, th = new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, 2 * c - 2, 16), VL.vangNham); th.rotation.z = PI / 2; th.position.z = hz + .1; g.add(th);
    var o2 = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, .5, 20), VL.vang); o2.rotation.x = PI / 2; o2.position.z = hz + .45; g.add(o2); g.add(hangKc(.4, [[0, 0, hz + .8, 0, 0, 1]]));
    [-1, 1].forEach(function (sg) { var cu = new THREE.Group(), ds = [];
      var ru = new THREE.Mesh(new THREE.CylinderGeometry(.85, .85, 2.2, 20), VL.vang); ru.rotation.z = PI / 2; cu.add(ru);
      for (i = 0; i < 6; i++) { var a = i / 6 * PI * 2, xx = (i % 2 ? .55 : -.55); var la = new THREE.Mesh(new THREE.SphereGeometry(.75, 18, 12), VL.vang); la.scale.set(.85, .7, .7); la.position.set(xx, Math.sin(a) * 1.0, Math.cos(a) * 1.0); cu.add(la);
        ds.push([xx, Math.sin(a) * 1.55, Math.cos(a) * 1.55, 0, Math.sin(a), Math.cos(a)]); }
      for (i = 0; i < 4; i++) { var b = (i + .5) / 4 * PI * 2; ds.push([0, Math.sin(b) * 1.05, Math.cos(b) * 1.05, 0, Math.sin(b), Math.cos(b)]); }
      cu.add(hangKc(.26, ds)); cu.scale.setScalar(1.6); cu.position.set(sg * (c + .6), 0, hz * .55); g.add(cu);   /* cụm nơ to ≈ 0,8 đường kính đĩa như ảnh */
      var k = khoen(.85, .17, VL.vang); k.position.set(sg * (c + 3.2), 0, hz * .55); g.add(k); });
    return { g: g, rong: 2 * c + 8, xo: 'xuyen', cao: 2 * R };
  };

  /* ---------- kim tiền · cỏ lá ---------- */
  function timDuong(s, n) {   /* đường viền trái tim (mũi nhọn hướng −y), ngược chiều kim đồng hồ, rộng ≈ 2s */
    var p = []; n = n || 72; for (var q = n - 1; q >= 0; q--) { var t = q / n * PI * 2; p.push(new V2(16 * Math.pow(Math.sin(t), 3) * s / 16, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s / 16 + .15 * s)); } return p;
  }
  function coLa(n, a, b, r, rt, g0) {   /* hình cỏ n lá trái tim (mũi hướng tâm, khe tim ở đầu lá): lá thứ k theo góc g0 + k·2π/n */
    return function (x, y) { var d = tron(x, y, 0, 0, rt);
      for (var k = 0; k < n; k++) { var an = (g0 || 0) + k * PI * 2 / n, c = Math.cos(an), s = Math.sin(an), u = x * c + y * s, v = -x * s + y * c;
        d = Math.min(d, hop(tron(u, v, a, b, r), tron(u, v, a, -b, r), .35), hop(tron(u, v, a * .45, 0, r * .8), tron(u, v, a, 0, r * .7), .9)); }
      return d; };
  }
  var vanCan = vai(256, 256, function (c, w, h) {   /* mặt khối cân kim tiền: khung viền, đồng xu lỗ vuông giữa, mây cuộn 4 góc (trắng = nổi) */
    c.fillStyle = '#555'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineWidth = 14; c.lineCap = 'round';
    c.strokeRect(14, 14, w - 28, h - 28); c.lineWidth = 16; c.beginPath(); c.arc(w / 2, h / 2, 62, 0, 7); c.stroke(); c.strokeRect(w / 2 - 20, h / 2 - 20, 40, 40);
    [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]].forEach(function (q) { c.lineWidth = 9; c.beginPath(); for (var t = 0; t < 1; t += .03) { var an = t * PI * 3, rr = 4 + 20 * t; c.lineTo(q[0] + Math.cos(an) * rr, q[1] + Math.sin(an) * rr); } c.stroke(); }); });
  vanCan.colorSpace = THREE.NoColorSpace;
  DS['25380'] = function () {   /* cân kim tiền (xem 4 ảnh): khối vuông nhỏ hơi thuôn lên trên; 4 mặt chạm nổi đồng xu lỗ vuông + mây cuộn góc + khung viền; khoen nhỏ + khoen lớn ở đỉnh → treo */
    var g = new THREE.Group(), bx = new THREE.BoxGeometry(4.6, 4.3, 4.6, 6, 6, 6), p = bx.attributes.position, i;
    for (i = 0; i < p.count; i++) { var y = p.getY(i), k = 1 - .1 * (y + 2.15) / 4.3; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
    bx.computeVertexNormals();
    g.add(new THREE.Mesh(bx, new THREE.MeshStandardMaterial({ color: 0xf6c45a, metalness: 1, roughness: .25, bumpMap: vanCan, bumpScale: 6 })));   /* soát đợt 5: chạm nổi sâu */
    var cao = mocDon(g, 2.15); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 2.15 };
  };
  DS['24117'] = function () {   /* kim tiền (xem 4 ảnh): đồng xu chạm lộng dẹt — vòng tròn ngoài + 4 cung lõm tạo hình vuông cong ở giữa, vàng mờ cát; khoen nhỏ + khoen lớn → treo */
    var g = new THREE.Group(), i, R = 4, ri = 3.25, ngoai = [], trong = [];
    for (i = 0; i < 140; i++) { var a = i / 140 * PI * 2; ngoai.push(new V2(Math.cos(a) * R, Math.sin(a) * R)); trong.push(new V2(Math.cos(a) * ri, Math.sin(a) * ri)); }
    g.add(tamLo(ngoai, trong, .9, VL.vangNham));
    [0, 1, 2, 3].forEach(function (k) { var an = PI / 4 + k * PI / 2, cx = Math.cos(an) * 4.35, cy = Math.sin(an) * 4.35, rr = 3.05, pts = [];
      for (i = 0; i <= 24; i++) { var t = an + PI + (i / 24 - .5) * 1.55; pts.push(new V3(cx + Math.cos(t) * rr, cy + Math.sin(t) * rr, 0)); }
      var m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .34, 8), VL.vangNham); m.scale.z = 1.3; g.add(m); });   /* 4 cung lõm */
    var cao = mocDon(g, R); return { g: g, rong: 1.6, xo: 'treo', cao: cao + R };
  };
  var vanXuBac = vai(1024, 180, function (c, w, h) {   /* thành khoanh 24041: chuỗi vòng đồng xu chồng nhau (trắng = bạc, đen = khoét) */
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineWidth = 24; var n = 8, r = h / 2 - 13;
    for (var k = 0; k <= n; k++) { var cx = k / n * w; c.beginPath(); c.arc(cx, h / 2, r, 0, 7); c.stroke();
      c.beginPath(); c.ellipse(cx + w / n / 2, h / 2, 17, 44, 0, 0, 7); c.fill();   /* ổ đá hình thoi ở chỗ 2 vòng chồng */
      c.lineWidth = 9; c.beginPath(); for (var q = 0; q <= 4; q++) { var an = q / 4 * PI * 2; c.lineTo(cx + Math.cos(an) * 34, h / 2 + Math.sin(an) * 34); } c.stroke(); c.lineWidth = 24; } });
  vanXuBac.colorSpace = THREE.NoColorSpace; vanXuBac.generateMipmaps = false; vanXuBac.minFilter = THREE.LinearFilter;
  DS['24041'] = function () {   /* kim tiền bạc 925 (xem 4 ảnh): khoanh bạc TRẮNG, thành chạm lộng chuỗi vòng đồng xu chồng nhau, đá nhỏ ở chỗ giao, mép lượn theo vòng; xỏ qua lỗ giữa */
    var R = 4, W = 4.4, g = new THREE.Group(), i;
    var vl = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .14, envMap: bacEnv, alphaMap: vanXuBac, alphaTest: .5, side: THREE.DoubleSide });
    [R, R - .18].forEach(function (rr) { g.add(new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, W, 128, 1, true), vl)); });   /* 2 lớp sát nhau cho thành có độ dày */
    var ds = []; for (i = 0; i < 8; i++) { var a = (i + .5) / 8 * PI * 2 + PI / 2; ds.push([Math.sin(a) * (R + .05), 0, Math.cos(a) * (R + .05), Math.sin(a), 0, Math.cos(a)]); [-1, 1].forEach(function (sy) { var b = a - PI / 8; ds.push([Math.sin(b) * (R + .03), sy * 1.05, Math.cos(b) * (R + .03), Math.sin(b), 0, Math.cos(b)]); }); }
    g.add(hangKc(.3, ds));
    return { g: ongNam(g), rong: W, xo: 'ong', cao: 2 * R };
  };
  DS['26265'] = function () {   /* cỏ 4 lá lam ngọc 8×6,7 (soát lại 3 ảnh): khối ngọc lam xanh TRONG phát sáng, 4 thuỳ tim phồng TRƠN (không gân xoè), rãnh sâu giữa các thuỳ; dày 6,7; lỗ xỏ ngang qua khe 2 lá */
    var f2 = dem2D(coLa(4, 2.35, .72, 1.3, 1.1, 0), -4.2, -4.2, 4.2, 4.2);
    function f(x, y, z) { var d = epBo(f2(x, y), z, 3.35, 1.25), a = Math.atan2(y, x), r = Math.hypot(x, y);
      d += ranh(Math.abs(Math.sin(2 * a)) - 1, .1, .3) * Math.min(1, r / 1.2);   /* rãnh giữa 4 thuỳ (thuỳ ở 4 hướng trục, rãnh ở góc chéo) */
      return Math.max(d, -Math.hypot(y, z) + .5); }   /* lỗ ngang trục x */
    var g = new THREE.Group(); g.add(khoiTac(f, [-4, -4, -3.5, 4, 4, 3.5], ngocLam(), 76, '26265'));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 20), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f2(x0 * sg, 0) < 0 && x0 < 6) x0 += .02; l.position.x = sg * (x0 + .01); g.add(l); });
    return { g: g, rong: 7.6, xo: 'xuyen', cao: 8 };
  };

  DS['23776'] = function () {   /* cỏ 4 lá tourmaline (xem 4 ảnh): khung vàng 4 lá, mỗi lá 1 viên tourmaline cabochon trái tim khác màu (xanh đậm, đỏ, vàng, nâu mật), viền hạt quanh từng viên, giữa kim cương nhỏ; thành bên khoét trái tim; xỏ ngang */
    var g = new THREE.Group(), i, f = coLa(4, 2.45, .72, 1.5, 1.3, 0), vk = vienTu(function (x, y) { return f(x, y) - .1; }, 0, 0, 240), T = 3.6;   /* khung nhỏ hơn: nhìn trước chỉ thấy 4 viên tim viền hạt */
    var de = khoi(vk, 0, 0, hoSo(T, .35), VL.vang); de.position.z = T / 2 - .6; g.add(de);
    var mau = [0x1f4a2c, 0xc21e46, 0xf2b52c, 0xc77a1f];
    for (i = 0; i < 4; i++) { var an = i * PI / 2 + PI / 2, tim = timDuong(2.15).map(function (q) { var c = Math.cos(an - PI / 2), s = Math.sin(an - PI / 2); return new V2(q.x * c - (q.y + 1.0) * s + Math.cos(an) * 2.55 * 0, q.x * s + (q.y + 1.0) * c); });
      tim = tim.map(function (q) { return new V2(q.x + Math.cos(an) * 1.75, q.y + Math.sin(an) * 1.75); });
      var cx = Math.cos(an) * 2.75, cy = Math.sin(an) * 2.75, v = vom(tim, cx, cy, 1.5, da(mau[i], vanMay, .12, .38)); v.position.z = T / 2 - .55; g.add(v);
      g.add(chuoiHat(tim.map(function (q) { return new V2(cx + (q.x - cx) * 1.1, cy + (q.y - cy) * 1.1); }), .17, VL.vang, T / 2 - .45)); }
    g.add(hangKc(.3, [[0, 0, T / 2 - .3, 0, 0, 1]]));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 20), VL.toi); l.rotation.y = sg * PI / 2; l.position.set(sg * 4.55, 0, -.6 + .0); g.add(l); });
    return { g: g, rong: 9, xo: 'xuyen', cao: 9.5 };
  };
  DS['23927'] = function () {   /* cỏ 4 lá bạc phủ vàng (xem 4 ảnh): tấm 4 lá tròn nhỏ (dáng thoi khi treo), mặt vàng mờ cát, viền hạt quanh mép, giữa ổ kim cương; khoen nhỏ + khoen lớn → treo */
    var f = function (x, y) { var d = tron(x, y, 0, 0, 1.6); for (var k = 0; k < 4; k++) { var an = k * PI / 2; d = hop(d, tron(x, y, Math.cos(an) * 1.45, Math.sin(an) * 1.45, 1.45), .5); } return d; };
    var g = tamTreo({ f: f, vl: VL.vangNham, day: 1.1, hat: .2 });
    var o = new THREE.Mesh(new THREE.CylinderGeometry(.75, .8, .5, 24), VL.vang); o.rotation.x = PI / 2; o.position.z = .7; g.add(o); g.add(hangKc(.55, [[0, 0, .98, 0, 0, 1]]));
    var cao = mocDon(g, 2.85); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 2.9 };
  };
  DS['23930'] = function () {   /* cỏ 3 lá bạc phủ vàng (xem 4 ảnh): tấm 3 lá (1 lá trên, 2 lá dưới), gân toả từ tâm, giữa ruby hồng 3 chấu + 3 lỗ nhỏ quanh; khoen → treo */
    var f = function (x, y) { var d = tron(x, y, 0, 0, 1.5); for (var k = 0; k < 3; k++) { var an = PI / 2 + k * PI * 2 / 3; d = hop(d, tron(x, y, Math.cos(an) * 1.7, Math.sin(an) * 1.7, 1.75), .7); } return d; };
    var g = new THREE.Group(), vk = vienTu(f, 0, 0, 200), i;
    var t = khoi(vk, 0, 0, hoSo(1.3, .3), VL.vang); t.position.z = .3; g.add(t);
    var mt = vom(vk, 0, 0, .7, VL.vang, function (x, y, s) { return 1 + .35 * Math.pow(Math.abs(Math.cos(14 * Math.atan2(y, x))), 3) * Math.min(1, s * 2) - .3 * Math.exp(-Math.pow((1 - s) / .08, 2)); }, 30); mt.position.z = .3; g.add(mt);   /* gân toả từ tâm */
    for (i = 0; i < 3; i++) { var an = -PI / 2 + i * PI * 2 / 3, l = new THREE.Mesh(new THREE.CircleGeometry(.42, 3), VL.toi); l.position.set(Math.cos(an) * .95, Math.sin(an) * .95, 1.05); l.rotation.z = an; g.add(l);
      var ch = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), VL.vang); ch.position.set(Math.cos(an + PI / 3) * .62, Math.sin(an + PI / 3) * .62, 1.15); g.add(ch); }
    g.add(hangKc(.5, [[0, 0, 1.15, 0, 0, 1]], VL.ruby));
    var cao = mocDon(g, 3.45); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 3.0 };
  };
  DS['371'] = function () {   /* cỏ 4 lá mắt hổ vàng (xem 4 ảnh): nửa vòm mắt hổ tạc 4 lá (lá ở 4 góc chéo), rãnh chữ thập, khía tim ở đầu mỗi lá, lưng phẳng; lỗ xuyên ngang qua khe giữa 2 lá → xuyên, mặt vòm quay ra ngoài */
    var f = coLa(4, 3.4, .95, 2.35, 2.2, PI / 4), vk = vienTu(f, 0, 0, 220), g = new THREE.Group(), vl = da(0xf3c21e, vanMatHo, .14, .4);
    var v = vom(vk, 0, 0, 4.2, vl, function (x, y, s) { var a = Math.atan2(y, x), q = Math.abs(Math.sin(2 * a)); return 1 - .16 * Math.exp(-Math.pow(q / .09, 2)) * Math.min(1, s * 1.5); }, 36); g.add(v);
    var lm = latMat(v); lm.scale.z = .08 / .55; g.add(lm);   /* lưng phẳng */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 20), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f(x0 * sg, 0) < 0 && x0 < 8) x0 += .02; l.position.set(sg * (x0 + .01), 0, 1.4); g.add(l); });
    g.children.forEach(function (m) { m.position.z -= 2.0; });
    return { g: g, rong: 11, xo: 'xuyen', cao: 11.5 };
  };

  /* ---------- hồ điệp ---------- */
  function elip(x, y, cx, cy, a, b, t) { var c = Math.cos(t || 0), s = Math.sin(t || 0), u = (x - cx) * c + (y - cy) * s, v = -(x - cx) * s + (y - cy) * c; return (Math.hypot(u / a, v / b) - 1) * Math.min(a, b); }
  function hinhBuom(k, o) {   /* dáng bướm nhìn thẳng: 2 cánh trên to chếch lên, 2 cánh dưới nhỏ chếch xuống, thân giữa; k phóng, o tinh chỉnh {tren, duoi} */
    o = o || {}; var tr = o.tren || [2.6, 1.15, 2.75, 1.95, .45], du = o.duoi || [1.9, -1.65, 1.85, 1.4, -.55];
    return function (x, y) { x /= k; y /= k; var ax = Math.abs(x);
      var d = hop(elip(ax, y, tr[0], tr[1], tr[2], tr[3], tr[4]), elip(ax, y, du[0], du[1], du[2], du[3], du[4]), .35);
      return hop(d, elip(x, y, 0, -.2, .5, 2.3), .4) * k; };
  }
  function veMau(w, ve) { var t = vai(512, 512, function (c) { ve(c, function (x) { return (x / w + .5) * 512; }, function (y) { return (.5 - y / w) * 512; }, 512 / w); }); t.colorSpace = THREE.SRGBColorSpace; return t; }   /* tranh màu phủ lên mặt khoi (uv = toạ độ/10): w = bề rộng vẽ (ly) */
  function chuanDo(m, doBan) { m.doBan = doBan; return m; }
  DS['25375'] = function () {   /* hồ điệp lục đế (xem 4 ảnh): mỗi bên cánh 1 viên lục đế liền (cánh trên + dưới) chạm gân; khung vàng viền hạt, kim cương dọc mép trên; đầu ruby + hàng kim cương thân; lưng chạm lộng; xỏ ngang */
    var f = hinhBuom(1.05), g = new THREE.Group(), i, T = 3.2;
    var vk = vienTu(function (x, y) { return f(x, y) - .25; }, 0, 0, 260), de = khoi(vk, 0, 0, hoSo(T, .3), VL.vang, true); de.position.z = T / 2 - .5; g.add(de);
    lungLo(g, function (x, y) { return f(x, y) - .2; }, -T / 2 - .5, HV.buom, 6, VL.lucde, -.6);   /* soát: lưng khung cánh bướm lộng thấy ngọc */
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .08; }, 0, 0, 260), .16, VL.vang, T / 2 - .35));
    [-1, 1].forEach(function (sg) { var fs = function (x, y) { return Math.max(f(x, y) + .3, .75 - sg * x); }, cx = sg * 2.5, p = vienTu(fs, cx, -.1, 200);
      var v = vom(p, cx, -.1, 1.7, VL.lucde, function (x, y, s) { var a = Math.atan2(y + .3, sg * x - .4), r = Math.hypot(x, y); return 1 - .14 * Math.pow(Math.abs(Math.cos(a * 3.5)), 14) * Math.min(1, s * 2) * (r > 1.5 ? 1 : 0); }, 30);   /* gân cánh toả từ thân */
      v.position.z = T / 2 - .45; g.add(v);
      var ds = []; for (i = 0; i < 5; i++) { var t = (i + .5) / 5, x0 = sg * (1.0 + t * 3.6), y0 = 1.5 + t * 1.55; ds.push([x0, y0 + .1, T / 2 - .2, 0, 0, 1]); } g.add(hangKc(.2, ds)); });
    g.add(hangKc(.17, [[0, .6, T / 2 - .1, 0, 0, 1], [0, 0, T / 2 - .1, 0, 0, 1], [0, -.6, T / 2 - .1, 0, 0, 1], [0, -1.2, T / 2 - .1, 0, 0, 1]]));
    g.add(hangKc(.3, [[0, 1.5, T / 2 - .05, 0, 0, 1]], VL.ruby));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 20), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f(x0 * sg, 0) < .25 && x0 < 9) x0 += .02; l.position.set(sg * x0, 0, -.5); g.add(l); });
    return { g: g, rong: 11, xo: 'xuyen', cao: 9 };
  };
  DS['25793'] = function () {   /* hồ điệp khảm trai (xem 4 ảnh): 1 mảnh xà cừ trắng hồng hình bướm, rãnh chia cánh trên/dưới + thân; viền vàng hạt; lưng chạm lộng lá; thành bên hoa văn xoắn; xỏ ngang */
    var f = hinhBuom(.9, { tren: [2.5, 1.0, 2.6, 1.95, .35], duoi: [1.95, -1.6, 2.0, 1.45, -.4] }), g = new THREE.Group(), T = 3.6;
    var vk = vienTu(function (x, y) { return f(x, y) - .3; }, 0, 0, 260), de = khoi(vk, 0, 0, hoSo(T, .3), VL.vangNham, true); de.position.z = T / 2 - .5; g.add(de);
    lungLo(g, function (x, y) { return f(x, y) - .25; }, -T / 2 - .5, HV.buom, 6, VL.trai, -1.2);   /* soát đợt 5: lưng lộng khung cánh bướm */
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .12; }, 0, 0, 260), .17, VL.vang, T / 2 - .35));
    var trai = VL.trai;   /* soát đợt 5: xà cừ ánh hồng */
    var p = vienTu(function (x, y) { return f(x, y) + .2; }, 0, 0, 260);
    var v = vom(p, 0, 0, 1.25, trai, function (x, y, s) { var ax = Math.abs(x); return 1 - .3 * Math.exp(-Math.pow((ax - .55) / .12, 2)) * (Math.abs(y) < 2 ? 1 : 0) - .25 * Math.exp(-Math.pow((y + .25 + .15 * ax) / .12, 2)) * (ax > .6 ? 1 : 0); }, 30); v.position.z = T / 2 - .45; g.add(v);   /* rãnh thân + rãnh chia cánh */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 20), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f(x0 * sg, -.3) < .3 && x0 < 9) x0 += .02; l.position.set(sg * x0, -.3, -.4); g.add(l); });
    return { g: g, rong: 9.5, xo: 'xuyen', cao: 7.5 };
  };
  DS['25891'] = function () {   /* bướm vàng (xem 4 ảnh): bướm vàng khối phồng 2 mặt, chạm nổi hoa nhỏ li ti; xỏ ngang qua thân; dưới rủ 2 dây xích: 1 dây hồ lô nhỏ + đồng tiền, 1 dây quạt */
    var f = hinhBuom(.95, { tren: [2.5, 1.0, 2.6, 2.1, .3], duoi: [2.0, -1.55, 2.1, 1.55, -.35] }), g = new THREE.Group(), vk = vienTu(f, 0, 0, 240), i;
    var t = khoi(vk, 0, 0, hoSo(1.6, .5), VL.vangHoa); t.position.z = .8; g.add(t);
    [-1, 1].forEach(function (sg) { var v = vom(vk, 0, 0, 1.6, VL.vangHoa, function (x, y, s) { return 1 - .35 * Math.exp(-Math.pow((Math.abs(x) - .5) / .14, 2)) + .1 * Math.exp(-Math.pow(x / .3, 2)); }, 30); if (sg < 0) v.rotation.y = PI; v.position.z = sg * .8; g.add(v); });
    var y0 = -3.0;
    xich(g, new V3(-.5, y0, 0), new V3(-1.0, y0 - 4.2, 0), .32, VL.vang);
    var hl = new THREE.Group(); [[0, 0, .75], [0, 1.0, .5]].forEach(function (q) { var b = new THREE.Mesh(new THREE.SphereGeometry(q[2], 20, 14), VL.vangNham); b.position.set(q[0], q[1], 0); hl.add(b); }); hl.position.set(-1.0, y0 - 5.4, 0); g.add(hl);   /* hồ lô nhỏ */
    xich(g, new V3(-1.0, y0 - 6.3, 0), new V3(-1.0, y0 - 8.0, 0), .3, VL.vang);
    var tien = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, .3, 24), VL.vangNham); tien.rotation.x = PI / 2; tien.position.set(-1.0, y0 - 8.8, 0); g.add(tien);
    xich(g, new V3(.5, y0, 0), new V3(1.2, y0 - 2.6, 0), .32, VL.vang);
    var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.absarc(0, 0, 1.6, -PI / 2 - .8, -PI / 2 + .8, false); sh.lineTo(0, 0);
    var qt = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .25, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 2, curveSegments: 16 }), VL.vangDan); qt.position.set(1.2, y0 - 2.6, -.12); g.add(qt);   /* quạt */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 20), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f(x0 * sg, 0) < 0 && x0 < 9) x0 += .02; l.position.set(sg * (x0 + .01), 0, 0); g.add(l); });
    return chuanDo({ g: g, rong: 9.5, xo: 'xuyen', cao: 8 }, 8);
  };
  var menBuom = veMau(10, function (c, X, Y, k) {   /* men 23942: nền cánh xanh lá, trong cánh cam, thân sẫm, đường chỉ vàng */
    c.fillStyle = '#7fd23a'; c.fillRect(0, 0, 512, 512);
    [-1, 1].forEach(function (sg) { c.fillStyle = '#f08a2a'; c.beginPath(); c.ellipse(X(sg * 2.2), Y(.95), 1.65 * k, 1.1 * k, sg * -.45, 0, 7); c.fill(); c.beginPath(); c.ellipse(X(sg * 1.6), Y(-1.35), 1.0 * k, .75 * k, sg * .5, 0, 7); c.fill();
      c.strokeStyle = '#e8c04a'; c.lineWidth = .16 * k; c.beginPath(); c.ellipse(X(sg * 2.2), Y(.95), 1.65 * k, 1.1 * k, sg * -.45, 0, 7); c.stroke(); c.beginPath(); c.ellipse(X(sg * 1.6), Y(-1.35), 1.0 * k, .75 * k, sg * .5, 0, 7); c.stroke();
      for (var q = 0; q < 3; q++) { c.beginPath(); c.arc(X(sg * (1.6 + q * .6)), Y(1.25 - q * .15), .25 * k, PI * .2, PI * 1.6); c.stroke(); }
      c.beginPath(); c.moveTo(X(sg * .2), Y(2.2)); c.quadraticCurveTo(X(sg * .5), Y(3.2), X(sg * 1.0), Y(3.0)); c.stroke(); });   /* râu */
    c.fillStyle = '#2d4a2c'; for (var i = 0; i < 6; i++) { c.beginPath(); c.ellipse(X(0), Y(1.6 - i * .55), .38 * k, .26 * k, 0, 0, 7); c.fill(); } });
  DS['23942'] = function () {   /* bướm bạc 925 tráng men (xem 4 ảnh): cánh nền xanh lá, trong cánh cam có chỉ vàng, thân sẫm khoanh đốt, râu; viền vàng; 2 lỗ xuyên dọc thân (đầu→đuôi) → trên vòng bướm nằm dọc theo dây */
    var f = hinhBuom(.92, { tren: [2.45, 1.0, 2.5, 1.85, .35], duoi: [1.85, -1.55, 1.75, 1.35, -.45] }), g = new THREE.Group(), T = 3.0;
    var vk = vienTu(f, 0, 0, 240), de = khoi(vk, 0, 0, hoSo(T, .3), VL.vang); de.position.z = T / 2; g.add(de);
    var men = new THREE.MeshPhysicalMaterial({ map: menBuom, roughness: .25, clearcoat: 1, clearcoatRoughness: .1 });
    var mt = khoi(vienTu(function (x, y) { return f(x, y) + .28; }, 0, 0, 240), 0, 0, hoSo(.3, .08), men); mt.position.z = T / 2 + .12; g.add(mt);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.45, 20), VL.toi); l.rotation.x = -sg * PI / 2; l.position.set(0, sg * 2.6, 0); [-.7, .7].forEach(function (dx) { var c2 = l.clone(); c2.position.x = dx; g.add(c2); }); });
    g.rotation.z = -PI / 2; var b = new THREE.Group(); b.add(g);   /* lỗ xuyên dọc thân → xoay cho thân nằm theo dây */
    return { g: b, rong: 6, xo: 'xuyen', cao: 9, dungXem: PI / 2 };
  };
  var vanVay = vai(1024, 512, function (c, w, h) {   /* hạt cầu 23971: lưới vảy cá chạm lộng (trắng = vàng, đen = thủng) */
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 15; c.fillStyle = '#fff'; c.fillRect(0, 0, w, 30); c.fillRect(0, h - 30, w, 30);
    for (var r = 0; r < 7; r++) for (var q = -1; q <= 12; q++) { var cx = (q + (r % 2) * .5) * w / 12, cy = 40 + r * 66; c.beginPath(); c.arc(cx, cy, 44, 0, PI); c.stroke(); c.beginPath(); c.arc(cx, cy, 22, 0, PI); c.stroke(); } });
  vanVay.colorSpace = THREE.NoColorSpace; vanVay.generateMipmaps = false; vanVay.minFilter = THREE.LinearFilter;
  var menBuomXanh = veMau(10, function (c, X, Y, k) { var q = 1.5; c.fillStyle = '#f4f5f2'; c.fillRect(0, 0, 512, 512); c.fillStyle = '#3d7bd0';   /* bướm men (hinhBuom .5): thân + giữa cánh trắng ngà, mép cánh xanh lam */
    [-1, 1].forEach(function (sg) { [[1.25, .7, .62, .45], [.95, -.85, .45, .38]].forEach(function (e) { c.beginPath(); c.ellipse(X(sg * e[0] * q), Y(e[1] * q), e[2] * q * k, e[3] * q * k, 0, 0, 7); c.fill(); }); }); });
  DS['23971'] = function () {   /* cầu bướm xanh bạc phủ vàng (xem 4 ảnh): hạt cầu chạm lộng lưới vảy cá dây hạt, gắn bướm men xanh trắng quanh thân; 2 lỗ xỏ có cổ */
    var R = 4.8, t0 = .22, g = new THREE.Group(), i;   /* soát: cổ lỗ nhỏ lại như ảnh */
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 56, 0, PI * 2, t0, PI - 2 * t0), new THREE.MeshStandardMaterial({ color: 0xf3c255, metalness: 1, roughness: .3, alphaMap: vanVay, alphaTest: .5, bumpMap: VAN.dan, bumpScale: .4, side: THREE.DoubleSide })));
    [-1, 1].forEach(function (sg) { var k = khoen(R * Math.sin(t0), .2, VL.vangNham); k.rotation.x = PI / 2; k.position.y = sg * R * Math.cos(t0); g.add(k); });
    var fb = hinhBuom(.5), vb = vienTu(fb, 0, 0, 160), men = new THREE.MeshPhysicalMaterial({ map: menBuomXanh, roughness: .2, clearcoat: 1 });
    for (i = 0; i < 3; i++) { var a = i / 3 * PI * 2 + .4, b = new THREE.Group(), de = khoi(vb, 0, 0, hoSo(.6, .15), VL.vang); b.add(de);
      var m2 = khoi(vienTu(function (x, y) { return fb(x, y) + .09; }, 0, 0, 160), 0, 0, hoSo(.2, .05), men); m2.position.z = .08; m2.scale.set(1, 1, 1); b.add(m2);
      b.position.set(Math.sin(a) * (R - .05), 0, Math.cos(a) * (R - .05)); b.lookAt(Math.sin(a) * 20, 0, Math.cos(a) * 20); b.rotateZ(PI / 2); g.add(b); }
    return { g: ongNam(g), rong: 2 * R * Math.cos(t0) + .6, xo: 'ong', cao: 2 * R };
  };

  function buomMen(tex, o) {   /* bướm tráng men trên đế vàng (kiểu 23942): o.k, o.tren/duoi, o.T; trả về group mặt trước +z */
    var f = hinhBuom(o.k || .92, o), g = new THREE.Group(), T = o.T || 3.0;
    var de = khoi(vienTu(f, 0, 0, 240), 0, 0, hoSo(T, .3), VL.vang); de.position.z = T / 2; g.add(de);
    var mt = khoi(vienTu(function (x, y) { return f(x, y) + .28; }, 0, 0, 240), 0, 0, hoSo(.3, .08), new THREE.MeshPhysicalMaterial({ map: tex, roughness: .28, clearcoat: 1, clearcoatRoughness: .1 })); mt.position.z = T / 2 + .12; g.add(mt);
    g.userData.f = f; return g;
  }
  var menBuomHoa = veMau(10, function (c, X, Y, k) {   /* men 23941: nền xanh lá, hoa vàng cam, chấm hồng, thân đỏ */
    c.fillStyle = '#2f9c3a'; c.fillRect(0, 0, 512, 512);
    [-1, 1].forEach(function (sg) { [[2.6, 1.7, .8], [1.7, .6, .6], [3.3, .7, .55], [1.6, -1.4, .7]].forEach(function (h) { var x = X(sg * h[0]), y = Y(h[1]), r = h[2] * k;
        c.fillStyle = '#f1b62a'; for (var q = 0; q < 8; q++) { var a = q / 8 * PI * 2; c.beginPath(); c.arc(x + Math.cos(a) * r * .65, y + Math.sin(a) * r * .65, r * .38, 0, 7); c.fill(); }
        c.fillStyle = '#e88a1c'; c.beginPath(); c.arc(x, y, r * .45, 0, 7); c.fill(); });
      c.fillStyle = '#e8487a'; [[2.2, .2], [1.1, 1.6], [2.4, -1.0]].forEach(function (p) { c.beginPath(); c.arc(X(sg * p[0]), Y(p[1]), .25 * k, 0, 7); c.fill(); }); });
    c.strokeStyle = '#c8202c'; c.lineWidth = .3 * k; c.beginPath(); c.moveTo(X(-.15), Y(2.0)); c.lineTo(X(.15), Y(-2.0)); c.stroke(); });
  DS['23941'] = function () {   /* bướm bạc phủ vàng tráng men (xem 4 ảnh): nền xanh lá, hoa vàng cam, chấm hồng, thân đỏ, viền vàng; 2 lỗ xuyên dọc thân → nằm dọc dây */
    var g = buomMen(menBuomHoa, { k: .95, tren: [2.5, 1.15, 2.6, 2.0, .55], duoi: [1.95, -1.6, 1.9, 1.45, -.5] });
    [-1, 1].forEach(function (sg) { [-.7, .7].forEach(function (dx) { var l = new THREE.Mesh(new THREE.CircleGeometry(.42, 20), VL.toi); l.rotation.x = -sg * PI / 2; l.position.set(dx, sg * 2.65, 1.5); g.add(l); }); });
    g.rotation.z = -PI / 2; var b = new THREE.Group(); b.add(g); return { g: b, rong: 6, xo: 'xuyen', cao: 9.5, dungXem: PI / 2 };
  };
  DS['23950'] = function () {   /* bướm treo bạc phủ vàng (xem 4 ảnh): men nền xanh, cánh cam chỉ vàng, thân sẫm khoanh đốt (như 23942) nhưng mỏng, khoen nhỏ + khoen lớn ở đầu → treo */
    var g = buomMen(menBuom, { k: .82, T: 1.6, tren: [2.45, 1.0, 2.5, 1.85, .35], duoi: [1.85, -1.55, 1.75, 1.35, -.45] });
    g.children.forEach(function (m) { m.position.z -= .8; });
    var cao = mocDon(g, 2.6); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 3 };
  };
  DS['23838'] = function () {   /* bướm bạc phủ vàng đá vàng (xem 4 ảnh): khung dây vàng uốn lượn, mỗi bên cánh 1 viên thạch anh vàng chạm gân lông vũ, kim cương nhỏ ở đầu cánh; khoen ở đầu cánh trên → treo nghiêng */
    var f = hinhBuom(1.05, { tren: [2.5, 1.2, 2.7, 1.9, .6], duoi: [2.0, -1.6, 2.0, 1.5, -.5] }), th = new THREE.Group(), i;
    var vo = vienTu(function (x, y) { return f(x, y) - .15; }, 0, 0, 260).map(function (q, j, a) { var r = 1 + .04 * Math.sin(j / a.length * PI * 2 * 22); return new V2(q.x * r, q.y * r); });
    th.add(ongVien(vo, .26, VL.vang, 0));   /* viền dây lượn sóng */
    [-1, 1].forEach(function (sg) { var fs = function (x, y) { return Math.max(f(x, y) + .45, .6 - sg * x); }, cx = sg * 2.5, p = vienTu(fs, cx, 0, 200);
      th.add(ongVien(vienTu(function (x, y) { return fs(x, y) - .12; }, cx, 0, 200), .17, VL.vang, -.1));
      var v = vom(p, cx, 0, 1.4, VL.toc, function (x, y, s) { var a = Math.atan2(y, sg * x - .3); return 1 - .18 * Math.pow(Math.abs(Math.cos(a * 4)), 10) * Math.min(1, s * 2); }, 28); v.position.z = -.25; th.add(v);
      var lv = latMat(v); lv.position.z = -.25; th.add(lv); });
    var ds = []; [[4.9, 2.9], [3.8, -3.0], [-4.9, 2.9], [-3.8, -3.0]].forEach(function (p) { ds.push([p[0], p[1], .25, 0, 0, 1]); }); th.add(hangKc(.22, ds));
    var than = new THREE.Mesh(new THREE.CapsuleGeometry(.35, 3.2, 6, 12), VL.vang); th.add(than);
    return { g: treoEo(th, 4.8, 2.9, Math.atan2(4.8, 2.9), 1), rong: 1.5, xo: 'treo', cao: 13 };
  };
  var menBuomHong = veMau(10, function (c, X, Y, k) {   /* 23947: đầu cánh trên men hồng → trắng, chấm xanh lá; phần còn lại vàng */
    c.fillStyle = '#e9b84a'; c.fillRect(0, 0, 512, 512);
    [-1, 1].forEach(function (sg) { var gr = c.createLinearGradient(X(sg * 2.2), Y(1.6), X(sg * 4.2), Y(3.3)); gr.addColorStop(0, '#fbe6ea'); gr.addColorStop(1, '#f07ea0'); c.fillStyle = gr;
      c.beginPath(); c.ellipse(X(sg * 3.1), Y(2.3), 1.5 * k, .75 * k, sg * -.75, 0, 7); c.fill();
      c.fillStyle = '#4fbf4a'; c.beginPath(); c.ellipse(X(sg * 2.2), Y(1.1), .35 * k, .25 * k, 0, 0, 7); c.fill(); }); });
  DS['23947'] = function () {   /* bướm bạc phủ vàng (xem 4 ảnh): cánh trên nhọn chếch lên, đầu cánh men hồng + chấm xanh, trong cánh đính kim cương; cánh dưới vàng khoét chấm; lưng có ống xỏ ngang → xỏ qua ống sau lưng */
    var f = hinhBuom(.95, { tren: [2.6, 1.4, 2.9, 1.5, .7], duoi: [1.7, -1.45, 1.5, 1.2, -.4] }), g = new THREE.Group(), i;
    var vk = vienTu(f, 0, 0, 240), mt = khoi(vk, 0, 0, hoSo(1.0, .25), new THREE.MeshPhysicalMaterial({ map: menBuomHong, metalness: .55, roughness: .3, clearcoat: .8 })); mt.position.z = .5; g.add(mt);
    var ds = []; [-1, 1].forEach(function (sg) { for (i = 0; i < 4; i++) ds.push([sg * (1.2 + i * .55), .9 + i * .38, .62, 0, 0, 1]); ds.push([sg * .95, -1.1, .62, 0, 0, 1]); }); g.add(hangKc(.24, ds));
    [-1, 1].forEach(function (sg) { [[1.6, -1.7], [2.1, -1.2]].forEach(function (p) { var l = new THREE.Mesh(new THREE.CircleGeometry(.2, 12), VL.toi); l.position.set(sg * p[0], p[1], .52); g.add(l); }); });
    var than = new THREE.Mesh(new THREE.CapsuleGeometry(.4, 2.6, 6, 12), VL.vang); than.position.z = .45; than.scale.z = .6; g.add(than);
    var ong = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 3.0, 28, 1, true), hai(VL.vang)); ong.rotation.z = PI / 2; ong.position.z = -1.0; g.add(ong);   /* ống xỏ sau lưng */
    return { g: g, rong: 9.5, xo: 'xuyen', cao: 7.5 };
  };
  DS['23952'] = function () {   /* bướm chạm lộng bạc phủ vàng (xem 4 ảnh): bướm bằng dây vàng cuộn mây (cánh trên có râu cuộn, cánh dưới xoắn), giữa ổ kim cương; khoen → treo */
    var g = new THREE.Group();
    function day(pts) { [-1, 1].forEach(function (sg) { var c = new THREE.CatmullRomCurve3(pts.map(function (p) { return new V3(sg * p[0], p[1], 0); })), m = new THREE.Mesh(new THREE.TubeGeometry(c, 60, .46, 8), VL.vang); m.scale.z = .6; g.add(m); }); }   /* soát đợt 5: bản dây dày như ảnh */
    day([[.3, 1.0], [.9, 2.4], [1.9, 3.0], [2.9, 2.7], [3.3, 1.8], [2.7, .9], [1.3, .45], [.5, .5]]);   /* viền cánh trên */
    day([[1.3, 1.4], [1.9, 2.0], [2.4, 1.7], [2.1, 1.3], [1.8, 1.55]]);   /* cuộn trong cánh trên */
    day([[.6, -.2], [2.2, -.3], [3.0, -1.3], [2.5, -2.6], [1.3, -2.6], [.5, -1.6], [.45, -.6]]);   /* viền cánh dưới */
    day([[1.2, -1.0], [1.9, -1.2], [2.0, -1.8], [1.5, -1.9], [1.45, -1.5]]);   /* cuộn cánh dưới */
    day([[.25, 1.5], [.5, 2.6], [1.0, 3.1], [1.35, 2.8], [1.05, 2.55]]);   /* râu cuộn */
    var o = new THREE.Mesh(new THREE.CylinderGeometry(.75, .8, .7, 24), VL.vang); o.rotation.x = PI / 2; g.add(o); g.add(hangKc(.55, [[0, 0, .4, 0, 0, 1]]));
    var cao = mocDon(g, 3.25); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 2.9 };
  };

  /* ---------- hồ ly ---------- */
  function hoLyChua(vl) {   /* hồ ly chúa tạc đá (22313, 23057): dáng giọt, đầu nhỏ trên, 2 mép răng cưa (ngọn đuôi xếp lớp); mặt trước chạm mặt cáo mõm dài + tai + đuôi cuộn; lưng phẳng hơn; lỗ xuyên ngang */
    function f(x, y) { var d = hop(tron(x, y, 0, -1.4, 3.7), tron(x, y, 0, 2.7, 1.55), 3.2); return d + .32 * Math.pow(Math.abs(Math.sin((y + 3) * 2.2)), 1.5) * Math.min(1, Math.abs(x) / 2.5) * (y < 3 ? 1 : 0); }
    var vk = vienTu(f, 0, -.3, 240), g = new THREE.Group();
    var v = vom(vk, 0, -.3, 3.0, vl, function (x, y, s) { var z = .22 * Math.exp(-(x * x / .5 + Math.pow(y - .2, 2) / 4.5)) + .15 * (Math.exp(-(Math.pow(x - .95, 2) + Math.pow(y - 2.4, 2) * 2) / .3) + Math.exp(-(Math.pow(x + .95, 2) + Math.pow(y - 2.4, 2) * 2) / .3));   /* mõm dài + 2 tai */
      var ax = Math.abs(x), ph = (y + .55 * ax) / .95; z -= ax > 1.1 ? .11 * Math.exp(-Math.pow((ph - Math.round(ph)) / .12, 2)) * Math.min(1, (ax - 1.1) * 1.5) : 0;   /* các lớp đuôi xếp chéo 2 bên */
      z -= .1 * (Math.exp(-(Math.pow(x - .55, 2) / .03 + Math.pow(y - 1.1, 2) / .06)) + Math.exp(-(Math.pow(x + .55, 2) / .03 + Math.pow(y - 1.1, 2) / .06)));   /* mắt */
      return 1 + z * (1 - Math.pow(s, 4)) / Math.max(.3, Math.sqrt(1 - s * s)); }, 40);
    g.add(v); var l = latMat(v); l.scale.z = .5 / .55; g.add(l);
    [-1, 1].forEach(function (sg) { var h = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), VL.toi); h.rotation.y = sg * PI / 2; var x0 = 0; while (f(x0 * sg, -1.2) < 0 && x0 < 8) x0 += .02; h.position.set(sg * (x0 - .05), -1.2, .2); g.add(h); });
    return { g: g, rong: 8.5, xo: 'xuyen', cao: 11.5 };
  }
  function hoLyNho(vl) {   /* hồ ly nhỏ cuộn tròn tạc đá (5179, 377): thân tròn, 2 tai dựng, mặt cáo mõm nhọn giữa, đuôi cuộn bên phải, chân trước dưới; vòm cao; lỗ xuyên ngang */
    function f(x, y) { var d = tron(x, y, 0, -.4, 4.0); return hop(d, Math.min(elip(x, y, 1.75, 3.3, .75, 1.05, -.3), elip(x, y, -1.75, 3.3, .75, 1.05, .3)), .6); }
    var vk = vienTu(f, 0, -.2, 240), g = new THREE.Group();
    var v = vom(vk, 0, -.2, 4.3, vl, function (x, y, s) { var z = .25 * Math.exp(-(x * x / .45 + Math.pow(y - .8, 2) / 2.2));   /* mõm */
      z -= .14 * Math.exp(-Math.pow((Math.hypot(x - 1.7, y + .9) - 1.3) / .14, 2)) * (x > .8 ? 1 : 0);   /* đuôi cuộn */
      z -= .12 * Math.exp(-Math.pow((Math.abs(x) - .9 - .5 * (y - 1.5)) / .1, 2)) * (y > .6 && y < 2.6 ? 1 : 0);   /* viền mặt */
      z -= .08 * Math.exp(-Math.pow((y + 2.7) / .12, 2)) * (Math.abs(x) < 2.2 ? 1 : 0);   /* chân */
      return 1 + z * (1 - Math.pow(s, 4)) / Math.max(.3, Math.sqrt(1 - s * s)); }, 40);
    g.add(v); var l = latMat(v); l.scale.z = .45 / .55; g.add(l);
    [-1, 1].forEach(function (sg) { var h = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), VL.toi); h.rotation.y = sg * PI / 2; h.position.set(sg * 3.9, -.6, .3); g.add(h); });
    g.children.forEach(function (m) { m.position.z -= 1.0; });
    return { g: g, rong: 8.5, xo: 'xuyen', cao: 9.5 };
  }
  var tocXanhLy = function () { return daTrong(0x5f9a52, vanTocDam, .07, .22, .28, 5); };
  DS['22313'] = function () { return hoLyChuaKhoi('xanhDam'); };   /* hồ ly chúa thạch anh tóc xanh (xem 4 ảnh) */
  DS['23057'] = function () { return hoLyChuaKhoi('matHo'); };   /* hồ ly chúa mắt hổ vàng (xem 4 ảnh) */
  DS['5179'] = function () { return hoLyKhoi('xanhDam'); };   /* hồ ly thạch anh tóc xanh (xem 4 ảnh) */
  DS['377'] = function () { return hoLyKhoi('matHo'); };   /* hồ ly mắt hổ vàng (xem 4 ảnh) */
  DS['19807'] = function () {   /* mặt nạ hồ ly (xem 4 ảnh): tấm vàng mỏng hơi cong như mặt nạ, 2 tai nhọn, 2 mắt khoét, nét khắc tai/râu/trán; khoen → treo */
    function f(x, y) { var d = elip(x, y, 0, -.6, 3.75, 2.55); return hop(d, Math.min(elip(x, y, 2.25, 1.95, 1.15, 2.0, -.45), elip(x, y, -2.25, 1.95, 1.15, 2.0, .45)), .9); }   /* soát đợt 5: mặt nạ cáo bè, 2 tai to */
    var vl = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .14 * k; c.lineCap = 'round';
      [-1, 1].forEach(function (sg) { c.beginPath(); c.moveTo(X(sg * 1.6), Y(1.1)); c.quadraticCurveTo(X(sg * 2.0), Y(3.0), X(sg * 2.45), Y(3.3)); c.quadraticCurveTo(X(sg * 2.8), Y(2.2), X(sg * 2.6), Y(1.2)); c.stroke();   /* lòng tai */
        for (var q = 0; q < 3; q++) { c.beginPath(); c.moveTo(X(sg * (1.2 + q * .25)), Y(-1.0 - q * .35)); c.quadraticCurveTo(X(sg * (2.4 + q * .1)), Y(-1.4 - q * .3), X(sg * 3.1), Y(-.6 - q * .45)); c.stroke(); } });   /* nét cong má (không ria) */
      c.beginPath(); c.arc(X(0), Y(1.3), .3 * k, 0, 7); c.stroke(); c.beginPath(); c.moveTo(X(0), Y(1.0)); c.lineTo(X(0), Y(.2)); c.stroke();   /* dấu trán */
    }, 1.6);
    var g = new THREE.Group(), vk = vienTu(f, 0, 0, 240), t = khoi(vk, 0, 0, hoSo(.9, .2), vl), p = t.geometry.attributes.position;
    for (var i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + .45 - .07 * p.getX(i) * p.getX(i)); t.geometry.computeVertexNormals(); g.add(t);   /* uốn cong như mặt nạ */
    [-1, 1].forEach(function (sg) { var e = new THREE.Mesh(new THREE.CircleGeometry(.55, 24), VL.toi); e.scale.set(1.75, .78, 1); e.rotation.z = sg * .4; e.position.set(sg * 1.35, -.15, .5 - .07 * 1.82 + .02); g.add(e); });   /* 2 mắt khoét */
    var cao = mocDon(g, 2.45); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 3.4 };
  };
  var vanHoLyChua = vai(512, 512, function (c, w, h) {   /* chạm lộng mặt hồ ly chúa 7643: 9 đuôi cuộn từ tâm ra vành (trắng = vàng) */
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineCap = 'round'; var cx = w / 2, cy = h / 2;
    c.beginPath(); c.arc(cx, cy, 250, 0, 7); c.lineWidth = 14; c.stroke();
    for (var k = 0; k < 9; k++) { var a0 = -PI / 2 + k * PI * 2 / 9 + .35; c.lineWidth = 13;
      [[.95, 85, 14], [.25, 175, 18], [.75, 225, 12]].forEach(function (q) { var sx = cx + Math.cos(a0 + q[0]) * q[1], sy = cy + Math.sin(a0 + q[0]) * q[1]; c.save(); c.lineWidth = 8; c.beginPath(); for (var t3 = 0; t3 < 1; t3 += .03) { var an3 = t3 * PI * 3.2, r3 = 2 + q[2] * t3; c.lineTo(sx + Math.cos(an3) * r3, sy + Math.sin(an3) * r3); } c.stroke(); c.restore(); });   /* thêm cuộn nhỏ lấp kín như dây chạm thật */
      [0, .16].forEach(function (lech) { c.beginPath(); for (var t = 0; t <= 1; t += .02) { var r = 55 + 175 * t, a = a0 + lech + .9 * Math.sin(t * PI) * .5 + t * .4; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.stroke(); });
      var ae = a0 + .6, ex = cx + Math.cos(ae) * 200, ey = cy + Math.sin(ae) * 200; c.lineWidth = 8; c.beginPath(); for (var t2 = 0; t2 < 1; t2 += .03) { var an = t2 * PI * 3.4, rr = 3 + 20 * t2; c.lineTo(ex + Math.cos(an) * rr, ey + Math.sin(an) * rr); } c.stroke();
      var mx = cx + Math.cos(a0 + .45) * 130, my = cy + Math.sin(a0 + .45) * 130; c.beginPath(); for (t2 = 0; t2 < 1; t2 += .03) { an = -t2 * PI * 3; rr = 3 + 16 * t2; c.lineTo(mx + Math.cos(an) * rr, my + Math.sin(an) * rr); } c.stroke(); }
    c.beginPath(); c.arc(cx, cy, 58, 0, 7); c.fill(); });
  vanHoLyChua.colorSpace = THREE.NoColorSpace; vanHoLyChua.generateMipmaps = false; vanHoLyChua.minFilter = THREE.LinearFilter;
  DS['7643'] = function () {   /* mặt hồ ly chúa (xem 4 ảnh): mặt tròn chạm lộng dây vàng = hồ ly 9 đuôi cuộn, đầu cáo giữa, 7 ruby quanh, vành tròn; quai treo hình ngọn lửa 5 gân → treo */
    var R = 7, g = new THREE.Group(), i, vl = new THREE.MeshStandardMaterial({ color: 0xf4c35a, metalness: 1, roughness: .28, alphaMap: vanHoLyChua, alphaTest: .5, bumpMap: VAN.dan, bumpScale: .3, side: THREE.DoubleSide });
    [.25, -.25].forEach(function (z) { var d = new THREE.Mesh(new THREE.CircleGeometry(R, 96), vl); d.position.z = z; g.add(d); });
    var vanh = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1.1, 96, 1, true), hai(VL.vang)); vanh.rotation.x = PI / 2; g.add(vanh);
    var dau = new THREE.Mesh(new THREE.SphereGeometry(1.3, 24, 16), VL.vang); dau.scale.set(1, .9, .55); dau.position.z = .45; g.add(dau);
    [-1, 1].forEach(function (sg) { var tai = new THREE.Mesh(new THREE.ConeGeometry(.5, 1.2, 12), VL.vang); tai.position.set(sg * .75, 1.2, .45); tai.rotation.z = -sg * .35; g.add(tai); });
    var mui = new THREE.Mesh(new THREE.ConeGeometry(.45, 1.4, 12), VL.vang); mui.rotation.x = PI; mui.position.set(0, -.9, .5); g.add(mui);
    for (i = 0; i < 7; i++) { var a = PI / 2 + (i + .5) / 7 * PI * 2, b = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .5, 18), VL.vang); b.rotation.x = PI / 2; b.position.set(Math.cos(a) * 5.6, Math.sin(a) * 5.6, .35); g.add(b);
      var rb = vien(.45, VL.ruby, .7); rb.position.set(Math.cos(a) * 5.6, Math.sin(a) * 5.6, .62); g.add(rb); }
    var lua = new THREE.Group(); for (i = -2; i <= 2; i++) { var pts = [new V3(i * .38, 0, 0), new V3(i * .5, 1.2, 0), new V3(i * .42, 2.3, 0), new V3(i * .15 + .25 * Math.sign(i), 3.0, 0)];
      var m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, .22, 8), VL.vang); lua.add(m); }
    var vo = khoen(.55, .2, VL.vang); vo.position.y = -.2; lua.add(vo); lua.position.y = R + .2; g.add(lua);   /* quai ngọn lửa */
    var kh = new THREE.Group(); kh.position.y = R + 1.8; g.add(kh); g.userData.khoa = kh;
    var yQ = R + 1.8; g.children.forEach(function (m) { m.position.y -= yQ; });
    return { g: g, rong: 1.6, xo: 'treo', cao: yQ + R };
  };
  DS['7648'] = function () {   /* mặt hồ ly chúa lục đế (xem 4 ảnh): hồ ly 9 đuôi toả tròn (đuôi cong thuôn có gân, đầu cuộn), mặt cáo giữa gắn lục đế trán; lưng đĩa chữ 卍; khoen + khoá lò xo → treo */
    var g = new THREE.Group(), i;
    for (i = 0; i < 9; i++) { var a0 = PI / 2 + i * PI * 2 / 9, L = [], R2 = [];
      for (var q = 0; q <= 16; q++) { var t = q / 16, r = 1.5 + 4.7 * t, a = a0 + .35 * Math.sin(t * PI * .9) - .15 * t, w = 1.45 * (1 - t * t) + .3;
        var px = Math.cos(a) * r, py = Math.sin(a) * r, nx = -Math.sin(a), ny = Math.cos(a); L.push(new V2(px + nx * w, py + ny * w)); R2.push(new V2(px - nx * w, py - ny * w)); }
      var sh = new THREE.Shape(L.concat(R2.reverse())), ge = new THREE.ExtrudeGeometry(sh, { depth: 1.1, bevelEnabled: true, bevelThickness: .4, bevelSize: .25, bevelSegments: 4, curveSegments: 6 });
      var duoi = new THREE.Mesh(ge, VL.vang); duoi.position.z = -.55; g.add(duoi);   /* soát đợt 5: đuôi nổi dày */
      [-.4, 0, .4].forEach(function (lc) { var cp = []; for (var q2 = 1; q2 <= 14; q2++) { var t2 = q2 / 16, r2 = 1.5 + 4.7 * t2, a2 = a0 + .35 * Math.sin(t2 * PI * .9) - .15 * t2, w2 = (1.45 * (1 - t2 * t2) + .3) * lc; cp.push(new V3(Math.cos(a2) * r2 - Math.sin(a2) * w2, Math.sin(a2) * r2 + Math.cos(a2) * w2, .65)); }
        g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cp), 30, .1, 6), VL.vangMo)); });   /* gân lông đuôi */
      var ae = a0 + .35 * Math.sin(.9 * PI) - .15, cu = khoen(.7, .32, VL.vang); cu.position.set(Math.cos(ae) * 6.3, Math.sin(ae) * 6.3, .2); g.add(cu); }   /* đầu đuôi cuộn */
    var mat = new THREE.Mesh(new THREE.SphereGeometry(2.0, 28, 18), VL.vang); mat.scale.set(1, 1.05, .6); mat.position.z = .7; g.add(mat);
    [-1, 1].forEach(function (sg) { var tai = new THREE.Mesh(new THREE.ConeGeometry(.6, 1.5, 12), VL.vang); tai.scale.z = .5; tai.position.set(sg * 1.3, 1.9, .7); tai.rotation.z = -sg * .45; g.add(tai); });
    var mui = new THREE.Mesh(new THREE.ConeGeometry(.7, 1.6, 14), VL.vang); mui.scale.z = .6; mui.rotation.z = PI; mui.position.set(0, -1.75, 1.0); g.add(mui);   /* soát đợt 5: mặt cáo có 2 tai + mõm nhọn */
    [-1, 1].forEach(function (sg) { var e = new THREE.Mesh(new THREE.TorusGeometry(.35, .08, 6, 16, PI), VL.toi); e.position.set(sg * .8, -.4, 1.45); e.rotation.z = PI; g.add(e); });
    var v = vien(.75, VL.lucde, .7); v.position.set(0, .7, 1.45); g.add(v); var be = khoen(.8, .14, VL.vang); be.position.set(0, .7, 1.3); g.add(be);
    var lung = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, .4, 32), VL.vangMo); lung.rotation.x = PI / 2; lung.position.z = -.6; g.add(lung);
    [[0, 0, 2.0, .3], [0, 0, .3, 2.0]].forEach(function (b) { var m = new THREE.Mesh(new THREE.BoxGeometry(b[2], b[3], .2), VL.vang); m.position.set(0, 0, -.85); g.add(m); });
    [[.55, .85, .9, .3], [-.85, .55, .3, .9], [-.55, -.85, .9, .3], [.85, -.55, .3, .9]].forEach(function (b) { var m = new THREE.Mesh(new THREE.BoxGeometry(b[2], b[3], .2), VL.vang); m.position.set(b[0], b[1], -.85); g.add(m); });   /* chữ 卍 sau lưng */
    var cao = moc(g, 6.4); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 6.4 };
  };
  DS['B1124'] = function () {   /* hồ ly bạc phủ vàng (xem 4 ảnh): tượng cáo con ngồi: đầu to, tai men hồng, mắt nhắm cười, 3 chấm đỏ trán, mõm nhỏ; thân nhỏ, đuôi cuộn trước; lỗ to xuyên ngang qua đầu */
    var g = new THREE.Group(), vv = VL.vang;
    g.add(khoiElip(vv, [[0, 0, 0, 3.36, 2.76, 2.85], [0, -1.1, 2.5, .96, .64, .56, .5], [0, -4.0, -.2, 2.2, 2.3, 2.1, .9], [2.6, -3.9, 1.1, .85, .85, .85, .4]],
      [[-1.8, -5.2, -.6, -.2, -5.8, 1.4, .85, .5], [-.2, -5.8, 1.4, 1.8, -5.0, 1.6, .85, .4], [1.8, -5.0, 1.6, 2.6, -3.9, 1.1, .85, .4]], .7, [-4, -7, -3.3, 4, 3.5, 3.6], 'hoLyB1124'));   /* soát: đầu + mõm + thân + đuôi cuộn đúc liền */
    var dau = new THREE.Group();
    [-1, 1].forEach(function (sg) { var tai = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.6, 24), vv); tai.position.set(sg * 2.0, 3.0, 0); tai.rotation.z = -sg * .38; tai.scale.z = .55; g.add(tai);
      var hong = new THREE.Mesh(new THREE.ConeGeometry(.85, 1.9, 20), new THREE.MeshPhysicalMaterial({ color: 0xf6a9c8, roughness: .25, clearcoat: 1 })); hong.position.set(sg * 1.95, 2.85, .45); hong.rotation.z = -sg * .38; hong.scale.z = .3; g.add(hong);
      var mt = new THREE.Mesh(new THREE.TorusGeometry(.55, .1, 6, 18, PI), VL.toi); mt.position.set(sg * 1.2, -.1, 2.72); mt.rotation.z = PI; g.add(mt);
      var lo = new THREE.Mesh(new THREE.CircleGeometry(1.05, 24), VL.toi); lo.rotation.y = sg * PI / 2; lo.position.x = sg * 3.36; g.add(lo); });   /* tai, mắt nhắm, lỗ xuyên đầu */
    [[0, 1.1], [-.35, 1.45], [.35, 1.45]].forEach(function (p) { var d = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), VL.ruby); d.position.set(p[0], p[1], 2.68); g.add(d); });
    var mui = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), VL.toi); mui.position.set(0, -.85, 3.05); g.add(mui);

    return { g: g, rong: 7.2, xo: 'xuyen', cao: 11 };
  };

  /* ---------- hạt đậu / ổ vàng 14K đá đa sắc ---------- */
  function trung(a, b, t) { return function (x, y) { return elip(x / (1 + (t || 0) * y / b), y, 0, 0, a, b); }; }   /* hình trứng: t > 0 → đầu dưới to */
  function xoanOc(x, y, cx, cy, a, b, n, chieu) {   /* độ gần rãnh xoắn ốc (như ý) tâm cx,cy: 0 = trên rãnh */
    var dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx) * (chieu || 1); if (r > a + b * PI * 2 * n) return 9;
    var u = (r - a) / (2 * PI * b) - th / (2 * PI); return Math.abs(u - Math.round(u)) * 2 * PI * b;
  }
  function dauKhung(o) {   /* ổ vàng 14K kiểu đậu đa sắc: khung lệch (mép dày 1 bên), 4 chấu móc, cụm kim cương 2-2-1-1, ống xỏ ngang sau lưng */
    var f = o.f, g = new THREE.Group(), i, T = 2.6;
    var fk = function (x, y) { return Math.min(f(x, y) - .45, f(x + .35, y - .3) - .55); }, vk = vienTu(fk, 0, 0, 240);
    var de = khoi(vk, 0, 0, hoSo(T, .35), VL.vang); de.position.z = .5; g.add(de);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) - .12; }, 0, 0, 220), .2, VL.vang, .55));
    var v = vom(vienTu(f, 0, 0, 220), 0, 0, (o.h || 2.6) * .6, o.da, o.cham, 36); v.position.z = .45; g.add(v);   /* user: mặt ngọc nhô cao quá → hạ còn 60% */
    var vt = vienTu(function (x, y) { return f(x, y) - .05; }, 0, 0, 360), n = vt.length;
    [.12, .38, .62, .88].forEach(function (t) { var q = vt[Math.round(t * n) % n], c = new THREE.Mesh(new THREE.ConeGeometry(.2, 1.1, 8), VL.vang); c.position.set(q.x * .97, q.y * .97, 1.2); c.rotation.set(0, 0, Math.atan2(q.y, q.x) - PI / 2); c.rotateX(-.9); g.add(c); });   /* 4 chấu móc */
    var vr = vienTu(function (x, y) { return fk(x, y) + .3; }, 0, 0, 360), ds = [];
    [[.0, 0], [.5, 0], [.25, 0], [.75, 0]].forEach(function (p, k) { var j = Math.round(p[0] * n), q = vr[j % n], q2 = vr[(j + 9) % n]; ds.push([q.x, q.y, .62, 0, 0, 1]); if (k < 2) ds.push([q2.x, q2.y, .62, 0, 0, 1]); });
    g.add(hangKc(.3, ds));
    var bx = vk.map(function (q) { return q.x; }), w = Math.max.apply(null, bx) - Math.min.apply(null, bx), by = vk.map(function (q) { return q.y; }), h = Math.max.apply(null, by) - Math.min.apply(null, by);
    var ong = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, w * .55, 24, 1, true), hai(VL.vang)); ong.rotation.z = PI / 2; ong.position.z = -2.4; g.add(ong);   /* ống xỏ sau lưng */
    return { g: g, rong: w, xo: 'xuyen', cao: h, uoc: o.uoc || 16 };
  }
  function chamNhuY(xs) { return function (x, y, s) { var z = 0; xs.forEach(function (c) { var d = xoanOc(x, y, c[0], c[1], .15, .3, 1.5, c[2]); z += d < 9 ? .3 * Math.exp(-Math.pow((d - .45) / .3, 2)) - .45 * Math.exp(-Math.pow(d / .16, 2)) : 0; });   /* gờ cuộn nổi + rãnh sâu */ return 1 + z * (1 - Math.pow(s, 4)) / Math.max(.35, Math.sqrt(1 - s * s)); }; }
  function chamLa(k) { return function (x, y, s) { var ax = Math.abs(x), u = (y - .75 * ax) / (k || 1.25), z = -.14 * Math.exp(-Math.pow(x / .1, 2)) - .1 * Math.exp(-Math.pow((u - Math.round(u)) / .1, 2)) * (ax > .25 ? 1 : 0); return 1 + z * (1 - Math.pow(s, 4)); }; }
  function chamDau(ys, a) { return function (x, y, s) { var z = 0, u = a ? x : y; ys.forEach(function (c, k) { z += .3 * Math.exp(-(Math.pow(x - (a ? c : 0), 2) + Math.pow(y - (a ? 0 : c), 2)) / 1.2); if (k) z -= .5 * Math.exp(-Math.pow((u - (c + ys[k - 1]) / 2) / .32, 2)); });   /* soát: 3 hạt đậu phồng tách rõ, eo sâu giữa các hạt */ return 1 + z * (1 - Math.pow(s, 4)) / Math.max(.35, Math.sqrt(1 - s * s)); }; }
  DS['26417~v2EopT'] = function () { return dauKhung({ f: trung(3.5, 4.5, .07), da: da(0x41bd5c, vanMay, .12, .36), cham: chamNhuY([[-.7, 1.1, 1], [-.8, -1.6, -1]]) }); };   /* xem 4 ảnh: ngọc xanh táo hình trứng chạm 2 cuộn như ý */
  DS['26417~EGvjyq'] = function () { return dauKhung({ f: trung(3.2, 4.7, .05), da: VL.bangtrang, cham: chamLa(1.3) }); };   /* xem 4 ảnh: băng trắng chạm lá gân */
  DS['26416'] = function () { return dauKhung({ f: function (x, y) { return hop(tron(x, y, .2, -1.2, 3.7), tron(x, y, -.3, 2.3, 2.0), 2.6); }, da: daTrong(0xd3ebe0, vanLam, .1, .28, .4, 4), cham: chamNhuY([[-.9, 1.4, 1], [-1.1, -1.4, -1]]) }); };   /* xem 4 ảnh: trắng loang xanh, dáng giọt, chạm như ý */
  DS['26417~F3BZ8-'] = function () { return dauKhung({ f: trung(3.0, 5.2, .06), da: da(0x2fc456, vanMay, .12, .36), cham: chamLa(1.05), h: 2.9 }); };   /* xem 4 ảnh: lá dài xanh táo gân xoắn */
  DS['26417'] = function () { return dauKhung({ f: function (x, y) { return hop(tron(x, y, 0, -1.6, 3.2), tron(x, y, 0, 2.4, 2.1), 2.2); }, da: da(0x3cc04f, vanMay, .12, .38), cham: chamDau([-2.2, .2, 2.4]), h: 2.8 }); };   /* xem 4 ảnh: quả đậu 3 hạt xanh táo */
  DS['26417~YXLixy'] = function () { var m = dauKhung({ f: function (x, y) { return hop(tron(x, y, 0, -1.6, 3.2), tron(x, y, 0, 2.4, 2.1), 2.2); }, da: da(0xf0a020, vanMay, .14, .38), cham: chamDau([-2.2, .2, 2.4]), h: 2.8 });
    var r = new THREE.Mesh(new THREE.TorusGeometry(.55, .22, 8, 20, PI * 1.4), da(0xf0a020, vanMay, .14, .38)); r.position.set(-1.0, 3.6, 1.4); m.g.add(r); return m; };   /* xem 4 ảnh: quả đậu 3 hạt vàng mật, râu cuộn đầu */
  DS['25785'] = function () {   /* đậu phúc lam băng (xem 3 ảnh, số đo 14,4 × 8,4 × 6,2): quả đậu 3 hạt nằm ngang, ổ vàng viền hạt, thành bên chạm lộng hoa văn xoắn; xỏ dọc chiều dài */
    var f = function (x, y) { return hop(tron(x, y, -2.3, 0, 3.8), tron(x, y, 3.6, .1, 2.35), 3.6); }, g = new THREE.Group();   /* soát đợt 5: dáng giọt lệch (đầu to/nhỏ) */
    var vk = vienTu(function (x, y) { return f(x, y) - .35; }, .4, 0, 260), de = khoi(vk, .4, 0, hoSo(3.4, .3), VL.vangHoa); de.position.z = .3; g.add(de);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .22; }, .4, 0, 260), .2, VL.vang, .45));
    var v = vom(vienTu(f, .4, 0, 220), .4, 0, 1.7, VL.lambang, chamDau([-2.8, .3, 3.3], true), 36); v.position.z = .3; g.add(v);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; var x0 = .4; while (f(x0 + sg * .01, 0) < .35 && Math.abs(x0) < 9) x0 += sg * .02; l.position.set(x0, 0, -1.2); g.add(l); });
    return { g: g, rong: 14.4, xo: 'xuyen', cao: 8.4 };
  };

  /* ---------- hoa ---------- */
  function matPhang(p, W, vl, z, lat) {   /* mặt phẳng theo đường viền p (uv = toạ độ/W + .5 → khớp tranh vẽ W ly) */
    var sh = new THREE.Shape(p.map(function (q) { return new V2(q.x, q.y); })), g = new THREE.ShapeGeometry(sh), ps = g.attributes.position, uv = [];
    for (var i = 0; i < ps.count; i++) uv.push(ps.getX(i) / W + .5, ps.getY(i) / W + .5); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    var m = new THREE.Mesh(g, vl); m.position.z = z || 0; if (lat) m.rotation.y = PI; return m;
  }
  function thanhVien(p, T, vl, lap) {   /* thành đứng chạy theo đường viền p, cao T (z −T/2..T/2), uv u theo chu vi × lap */
    var n = p.length, L = [0], i; for (i = 0; i < n; i++) L.push(L[i] + p[i].distanceTo(p[(i + 1) % n]));
    var pos = [], uv = [], idx = [];
    for (i = 0; i <= n; i++) { var q = p[i % n]; pos.push(q.x, q.y, -T / 2, q.x, q.y, T / 2); uv.push(L[i] / L[n] * (lap || 1), 0, L[i] / L[n] * (lap || 1), 1); }
    for (i = 0; i < n; i++) { var a = 2 * i; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    return new THREE.Mesh(luoi(pos, idx, uv), vl);
  }
  function longVang(t) { return new THREE.MeshStandardMaterial({ color: 0xf4c35a, metalness: 1, roughness: .3, alphaMap: t, alphaTest: .5, side: THREE.DoubleSide }); }
  function vanLong(ve) { var t = vai(512, 512, function (c, w, h) { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineCap = 'round'; ve(c, w, h); }); t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; return t; }
  var vanLuoiCheo = vai(512, 128, function (c, w, h) { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 9; c.fillStyle = '#fff'; c.fillRect(0, 0, w, 16); c.fillRect(0, h - 16, w, 16);
    for (var i = -2; i < 20; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32 + 64, h); c.stroke(); c.beginPath(); c.moveTo(i * 32 + 64, 0); c.lineTo(i * 32, h); c.stroke(); } });   /* thành lưới chéo X */
  vanLuoiCheo.colorSpace = THREE.NoColorSpace; vanLuoiCheo.generateMipmaps = false; vanLuoiCheo.minFilter = THREE.LinearFilter;
  function cuon(c, x, y, r, a0, vong) { c.beginPath(); for (var t = 0; t <= 1; t += .02) { var an = a0 + t * PI * 2 * vong, rr = r * (1 - t * .85); c.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } c.stroke(); }
  function hatLong(o) {   /* hạt vàng chạm lộng 2 mặt (25779, 25794): mặt trước/sau hoa văn lộng, thành lưới chéo, lục đế giữa 2 mặt viền hạt, lỗ xỏ 2 sườn */
    var g = new THREE.Group(), p = vienTu(o.f, 0, 0, 200), T = o.T || 4.6, W = o.W || 10, mt = longVang(o.tranh);
    g.add(matPhang(p, W, mt, T / 2)); g.add(matPhang(p, W, mt, -T / 2, true));
    g.add(thanhVien(p, T, longVang(vanLuoiCheo), o.lap || 5));
    [-1, 1].forEach(function (sg) { g.add(ongVien(p, .22, VL.vang, sg * T / 2));
      if (o.vienGo) g.add(chuoiHat(vienTu(function (x, y) { return o.f(x, y) + .38; }, 0, 0, 200), .16, VL.vang, sg * (T / 2 + .05)));
      var v = vien(o.rDa || 1.5, VL.lucde, .6); v.position.z = sg * (T / 2 + .1); g.add(v);
      g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - (o.rDa || 1.5) - .2; }, 0, 0, 80), .14, VL.vang, sg * (T / 2 + .08)));
      var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (o.f(x0 * sg, 0) < 0 && x0 < 9) x0 += .02; l.position.x = sg * (x0 + .02); g.add(l); });
    var bx = p.map(function (q) { return q.x; }), by = p.map(function (q) { return q.y; });
    return { g: g, rong: Math.max.apply(null, bx) - Math.min.apply(null, bx), xo: 'xuyen', cao: Math.max.apply(null, by) - Math.min.apply(null, by) };
  }
  var vanKhanh = vanLong(function (c, w, h) { var cx = w / 2, cy = h / 2, i;
    c.lineWidth = 16; c.beginPath(); c.arc(cx, cy, 92, 0, 7); c.stroke();
    for (i = 0; i < 8; i++) { var a = i / 8 * PI * 2 + PI / 8, x = cx + Math.cos(a) * 165, y = cy + Math.sin(a) * 150; c.lineWidth = 13; cuon(c, x, y, 46, a + PI, 1.3);
      c.beginPath(); c.moveTo(cx + Math.cos(a) * 95, cy + Math.sin(a) * 95); c.lineTo(x - Math.cos(a) * 30, y - Math.sin(a) * 30); c.stroke(); }
    c.lineWidth = 14; [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) { c.beginPath(); c.moveTo(cx + d[0] * 100, cy + d[1] * 100); c.lineTo(cx + d[0] * 240, cy + d[1] * 230); c.stroke(); });
    c.lineWidth = 11; for (i = 0; i < 8; i++) { var b = i / 8 * PI * 2; cuon(c, cx + Math.cos(b) * 128, cy + Math.sin(b) * 128, 26, b, 1.2); cuon(c, cx + Math.cos(b + .2) * 215, cy + Math.sin(b + .2) * 200, 24, b + PI, 1.1); }
    c.lineWidth = 12; c.strokeRect(22, 22, w - 44, h - 44); });   /* thêm cuộn nhỏ + khung trong cho dày như ảnh */
  var vanBatGiac = vanLong(function (c, w, h) { var cx = w / 2, cy = h / 2, i;
    c.lineWidth = 15; c.beginPath(); c.arc(cx, cy, 88, 0, 7); c.stroke();
    for (i = 0; i < 8; i++) { var a = i / 8 * PI * 2, x = cx + Math.cos(a) * 150, y = cy + Math.sin(a) * 150; c.lineWidth = 12; cuon(c, x, y, 40, a, 1.4); cuon(c, cx + Math.cos(a + PI / 8) * 185, cy + Math.sin(a + PI / 8) * 185, 30, a + PI, 1.2);
      c.beginPath(); c.moveTo(cx + Math.cos(a) * 90, cy + Math.sin(a) * 90); c.lineTo(x, y); c.stroke(); } });
  DS['25779'] = function () {   /* khánh hoa văn lục đế (xem 4 ảnh): hạt vàng chạm lộng dáng khánh (góc lõm mây), hoa văn cuộn; lục đế tròn viền hạt ở giữa CẢ 2 mặt; thành lưới chéo; xuyên ngang */
    var f = function (x, y) { var d = Math.max(Math.abs(x) - 4.7, Math.abs(y) - 4.2) + 0; [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (s) { d = Math.max(d, 1.25 - Math.hypot(x - s[0] * 4.9, y - s[1] * 4.4)); }); return d; };
    return hatLong({ f: f, tranh: vanKhanh, W: 10.5, T: 4.4, rDa: 1.6 });
  };
  DS['25794'] = function () {   /* hoa văn lục đế (xem 4 ảnh): hạt bát giác lượn sóng, vành gờ hạt, mặt chạm lộng cuộn; lục đế giữa 2 mặt; thành lưới chéo; xuyên ngang */
    var f = function (x, y) { var a = Math.atan2(y, x), r = Math.hypot(x, y); return r - (4.5 + .35 * Math.abs(Math.cos(4 * a + PI / 8 * 4))) ; };
    return hatLong({ f: f, tranh: vanBatGiac, W: 10, T: 4.6, rDa: 1.4, vienGo: true });
  };
  DS['26267'] = function () {   /* hoa mai lam ngọc 8 ly (soát lại 3 ảnh): khối ngọc lam trong, 5 cánh tròn phồng TRƠN, nhuỵ là nút tròn nổi giữa có vòng rãnh; dày 6,2; lỗ ngang */
    var f2 = dem2D(function (x, y) { var d = tron(x, y, 0, 0, 1.6); for (var k = 0; k < 5; k++) { var an = PI / 2 + k * PI * 2 / 5; d = hop(d, tron(x, y, Math.cos(an) * 2.0, Math.sin(an) * 2.0, 1.75), .4); } return d; }, -4.2, -4.2, 4.2, 4.2);
    function f(x, y, z) { var d = epBo(f2(x, y), z, 3.1, 1.15), a = Math.atan2(y, x) - PI / 2, r = Math.hypot(x, y), k = Math.abs(Math.cos(a * 2.5));
      d += ranh(k, .1, .26) * Math.min(1, Math.max(0, (r - 1.0) / .6));   /* khe giữa 5 cánh */
      if (Math.abs(z) > 1.6) { d -= .3 * Math.exp(-r * r / .3); d += ranh(r - .75, .08, .12); }   /* nhuỵ nút tròn + vòng rãnh */
      return Math.max(d, -Math.hypot(y, z) + .5); }
    var g = new THREE.Group(); g.add(khoiTac(f, [-4, -4, -3.3, 4, 4, 3.3], ngocLam(), 76, '26267'));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 20), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f2(x0 * sg, 0) < 0 && x0 < 6) x0 += .02; l.position.x = sg * (x0 + .01); g.add(l); });
    return { g: g, rong: 7.6, xo: 'xuyen', cao: 8 };
  };

  DS['23788'] = function (o) {   /* hoa lục đế (xem 4 ảnh): viên lục đế 8 cánh lượn (gân cánh + nhuỵ), ổ vàng viền hạt, lưng 5 vòng tròn đan (24190: hoa 8 cánh) — soát: lưng lộng thấy ngọc; xuyên ngang */
    var f = function (x, y) { var a = Math.atan2(y, x); return Math.hypot(x, y) - (4.0 + .32 * Math.abs(Math.cos(4 * a))); };
    var g = new THREE.Group(), vk = vienTu(function (x, y) { return f(x, y) - .35; }, 0, 0, 240), T = 3.6;
    var de = khoi(vk, 0, 0, hoSo(T, .3), VL.vang, true); de.position.z = T / 2 - .5; g.add(de);
    lungLo(g, function (x, y) { return f(x, y) - .3; }, -T / 2 - .5, o && o.hoa8 ? HV.hoa8 : HV.namVong, 5, VL.lucde, -.3);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .2; }, 0, 0, 240), .15, VL.vang, T / 2 - .35));
    var v = vom(vienTu(f, 0, 0, 240), 0, 0, 1.6, VL.lucde, function (x, y, s) { var a = Math.atan2(y, x), r = Math.hypot(x, y); return 1 - .25 * Math.pow(Math.abs(Math.sin(4 * a)), 20) * Math.min(1, r / 1.2) - .3 * Math.exp(-Math.pow((r - .5) / .1, 2)); }, 36); v.position.z = T / 2 - .45; g.add(v);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 20), VL.toi); l.rotation.y = sg * PI / 2; l.position.set(sg * 4.5, 0, -.3); g.add(l); });
    return { g: g, rong: 9, xo: 'xuyen', cao: 9 };
  };
  DS['23780'] = function () {   /* hoa phỉ thuý (xem 4 ảnh): lục đế tròn giữa 2 vòng viền hạt, quanh là 8 vòng cánh dây hạt, khoen dây xoắn → treo */
    var g = new THREE.Group(), i, v = vien(1.9, VL.lucde, .55); v.position.z = .6; g.add(v);
    [2.15, 2.6].forEach(function (r, k) { g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - r; }, 0, 0, 90), k ? .26 : .18, VL.vang, .45)); });
    var nen = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, .7, 40), VL.vang); nen.rotation.x = PI / 2; g.add(nen);
    for (i = 0; i < 8; i++) { var a = (i + .5) / 8 * PI * 2, cx = Math.cos(a) * 3.75, cy = Math.sin(a) * 3.75, el = [];
      for (var q = 0; q < 40; q++) { var t = q / 40 * PI * 2, u = Math.cos(t) * 1.15, w = Math.sin(t) * .95; el.push(new V2(cx + u * Math.cos(a) - w * Math.sin(a), cy + u * Math.sin(a) + w * Math.cos(a))); }
      g.add(chuoiHat(el, .22, VL.vang, .1)); }
    var kh = new THREE.Group(), q2 = new THREE.Mesh(new THREE.TorusGeometry(1.1, .34, 12, 40), VL.vangDan); q2.rotation.y = PI / 2; kh.add(q2); kh.position.y = 5.9; g.add(kh); g.userData.khoa = kh;   /* khoen dây xoắn */
    g.children.forEach(function (m) { m.position.y -= 5.9; });
    return { g: g, rong: 1.6, xo: 'treo', cao: 10.8 };
  };
  DS['16407'] = function () {   /* hoa ngọc bích (xem 4 ảnh): hoa 8 cánh rỗng bằng dây hạt (2 mặt), nhuỵ toả tia đầu hạt, viên ngọc bích xanh nhạt giữa 2 mặt; thành trong khoét lỗ bầu dục; xuyên ngang */
    var g = new THREE.Group(), i, T = 3.6, ngoc = da(0xb7d44c, vanMay, .14, .4);
    var tw = new THREE.MeshStandardMaterial({ color: 0xf4c35a, metalness: 1, roughness: .3, alphaMap: vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 8; k++) { c.beginPath(); c.ellipse((k + .5) * w / 8, h / 2, 18, 150, 0, 0, 7); c.fill(); } }), alphaTest: .5, side: THREE.DoubleSide });
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, T, 64, 1, true), tw)).children; g.children[0].rotation.x = PI / 2;   /* thành trong lỗ bầu dục */
    [-1, 1].forEach(function (sg) { var z = sg * T / 2;
      for (i = 0; i < 8; i++) { var a = i / 8 * PI * 2, pts = [];
        for (var q = 0; q < 50; q++) { var t = q / 50 * PI * 2, rr = 1.7 + 3.1 * (.5 - .5 * Math.cos(t)), da2 = .36 * Math.sin(t) * (1 - .1 * Math.cos(t));   /* cánh tròn rộng gần chạm nhau */ pts.push(new V2(Math.cos(a + da2) * rr, Math.sin(a + da2) * rr)); }
        g.add(chuoiHat(pts, .13, VL.vang, z)); }   /* cánh rỗng dây hạt */
      for (i = 0; i < 16; i++) { var b = (i + .5) / 16 * PI * 2, ti = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 1.0, 6), VL.vang); ti.rotation.z = b - PI / 2; ti.position.set(Math.cos(b) * 2.1, Math.sin(b) * 2.1, z); g.add(ti);
        var hh = new THREE.Mesh(new THREE.SphereGeometry(.15, 8, 6), VL.vang); hh.position.set(Math.cos(b) * 2.65, Math.sin(b) * 2.65, z); g.add(hh); }   /* nhuỵ tia */
      g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 1.55; }, 0, 0, 60), .15, VL.vang, z));
      var v = vien(1.3, ngoc, .6); v.position.z = z + sg * .15; g.add(v); });
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * 2.92; g.add(l); });
    return { g: g, rong: 10, xo: 'xuyen', cao: 10 };
  };

  /* ---------- ống cong chạm lộng bạc phủ vàng (10 mẫu "ống hoa văn") ---------- */
  function ongCong(o) {   /* o: L dài, R bán kính, sag độ cong, ve(c,L,C) vẽ lộng (mm, trắng = kim loại), men(c,L,C) vẽ men màu, kc [[x,gocDo]], bang {vong, a0}, them(g, pt) */
    var L = o.L, R = o.R, sag = o.sag || 2.5, C = 2 * PI * R, Rc = (L * L / 4 + sag * sag) / (2 * sag), ph = Math.asin(L / 2 / Rc), g = new THREE.Group(), i, j;
    function pt(s, a, r) { var th = -ph + 2 * ph * s, sx = Math.sin(th), cy = Math.cos(th), px = Rc * sx, py = sag - Rc + Rc * cy; return new V3(px + r * Math.cos(a) * sx, py + r * Math.cos(a) * cy, r * Math.sin(a)); }
    function mat(r, nS, nA) { var pos = [], uv = [], idx = []; for (i = 0; i <= nS; i++) for (j = 0; j <= nA; j++) { var p = pt(i / nS, j / nA * PI * 2, r); pos.push(p.x, p.y, p.z); uv.push(i / nS, 1 - j / nA); }   /* tranh: y = C/4 là mặt trước */
      for (i = 0; i < nS; i++) for (j = 0; j < nA; j++) { var a = i * (nA + 1) + j, b = a + nA + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); } return luoi(pos, idx, uv); }
    function tranh(ve, mau) { var t = vai(2048, 1024, function (c, w, h) { c.fillStyle = mau ? 'rgba(0,0,0,0)' : '#000'; c.fillRect(0, 0, w, h); c.setTransform(w / L, 0, 0, h / C, 0, 0); c.lineCap = 'round'; c.lineJoin = 'round';
        if (!mau) { c.fillStyle = '#fff'; c.fillRect(0, 0, 1.3, C); c.fillRect(L - 1.3, 0, 1.3, C); c.strokeStyle = '#fff'; c.fillStyle = '#fff'; }
        [-C, 0, C].forEach(function (d) { c.save(); c.translate(0, d); ve(c, L, C); c.restore(); }); });
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; if (!mau) { t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; } return t; }
    var vlL = new THREE.MeshStandardMaterial({ color: o.mau || 0xf4c35a, metalness: 1, roughness: .32, alphaMap: tranh(o.ve), alphaTest: .5, side: THREE.DoubleSide });
    g.add(new THREE.Mesh(mat(R, 120, 72), vlL));
    g.add(new THREE.Mesh(mat(R * .72, 60, 40), new THREE.MeshStandardMaterial({ color: 0xd6a443, metalness: 1, roughness: .42, side: THREE.DoubleSide })));   /* ống lót trong — soát đợt 5: vàng như ảnh (trước nâu đen) */
    if (o.men) g.add(new THREE.Mesh(mat(R + .05, 120, 72), new THREE.MeshPhysicalMaterial({ map: tranh(o.men, true), alphaTest: .5, roughness: .25, clearcoat: 1, side: THREE.DoubleSide })));
    [0, 1].forEach(function (s) { var hb = [], n = Math.round(C / .42), m4 = new THREE.Matrix4();   /* cổ 2 đầu: viền gờ + hàng hạt chấm */
      [s ? 1 - .012 : .012, s ? 1 - .045 : .045].forEach(function (ss, k) { if (k === 0) { for (var q = 0; q <= 48; q++) hb.push(pt(ss, q / 48 * PI * 2, R + .12)); g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hb, true), 60, .16, 6, true), VL.vang)); }
        else { var im = new THREE.InstancedMesh(new THREE.SphereGeometry(.12, 8, 6), VL.vang, n); for (var q2 = 0; q2 < n; q2++) { var p = pt(ss, q2 / n * PI * 2, R + .05); m4.makeTranslation(p.x, p.y, p.z); im.setMatrixAt(q2, m4); } g.add(im); } });
      var e = pt(s, 0, 0), t = pt(s + (s ? -.01 : .01), 0, 0).sub(e).normalize(), d = new THREE.Mesh(new THREE.CircleGeometry(R * .7, 28), VL.toi); d.position.copy(e).addScaledVector(t, .05); d.lookAt(e.clone().sub(t)); g.add(d); });
    if (o.kc) g.add(hangKc(o.kcR || .3, o.kc.map(function (k) { var s = k[0] / L, a = k[1] * PI / 180, p = pt(s, a, R + .08), n2 = pt(s, a, R + 1).sub(pt(s, a, R)); return [p.x, p.y, p.z, n2.x, n2.y, n2.z]; }), o.kcVl));
    if (o.bang) { var bp = []; for (i = 0; i <= 80; i++) { var s2 = .05 + .9 * i / 80; bp.push(pt(s2, o.bang.a0 + o.bang.vong * PI * 2 * s2, R + .12)); } var bm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bp), 160, .5, 8), VL.vangMo); bm.scale.set(1, 1, 1); g.add(bm); }
    if (o.them) o.them(g, function (x, gd, r) { return pt(x / L, gd * PI / 180, R + (r || 0)); });
    g.rotation.z = PI; g.position.y = sag / 2;   /* user: ống cong ngược → lật 180° quanh trục nhìn (mặt men vẫn ra trước), 2 đầu ống chúc vào lòng vòng */
    var b = new THREE.Group(); b.add(g); return chuanDo({ g: b, rong: L, xo: 'ong', cao: 2 * R + sag }, 2 * R);
  }
  /* bộ nét vẽ dùng chung (đơn vị mm, trước = y C/4, sau = y 3C/4) */
  function vayCa(c, x0, x1, C, r, w) { c.lineWidth = w || .3; for (var y = 0, k = 0; y <= C + r; y += r * .9, k++) for (var x = x0 + (k % 2) * r; x <= x1; x += 2 * r) { c.beginPath(); c.arc(x, y, r, 0, PI); c.stroke(); } }
  function xoanNho(c, x, y, r, a0, vong, w) { c.lineWidth = w || .3; cuon(c, x, y, r, a0, vong); }
  function hoaMen(c, x, y, n, rr, w, mauNgoai, mauTrong, a0) { for (var k = 0; k < n; k++) { var a = (a0 || 0) + k / n * PI * 2, gr = c.createLinearGradient(x, y, x + Math.cos(a) * rr, y + Math.sin(a) * rr); gr.addColorStop(0, mauTrong); gr.addColorStop(1, mauNgoai); c.fillStyle = gr;
    c.save(); c.translate(x + Math.cos(a) * rr * .55, y + Math.sin(a) * rr * .55); c.rotate(a); c.beginPath(); c.ellipse(0, 0, rr * .55, w, 0, 0, 7); c.fill(); c.restore(); } }
  function la(c, x, y, dai, rong, goc, mau1, mau2) { c.save(); c.translate(x, y); c.rotate(goc); var gr = c.createLinearGradient(0, 0, dai, 0); gr.addColorStop(0, mau1); gr.addColorStop(1, mau2); c.fillStyle = gr;
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(dai * .5, -rong, dai, 0); c.quadraticCurveTo(dai * .5, rong * .6, 0, 0); c.fill(); c.restore(); }

  DS['24011'] = function () { return ongCong({ L: 30, R: 2.8, sag: 2.6,   /* xem 4 ảnh: mỗi nửa 4 vòng lá thuôn dài quanh thân, trong lá đan dây cuộn C; giữa đai dây thừng + kim cương */
    ve: function (c, L, C) { c.lineWidth = .35; c.fillRect(L / 2 - 1.3, 0, 2.6, C);
      [-1, 1].forEach(function (sg) { for (var k = 0; k < 4; k++) { var y = (k + .5) * C / 4, x0 = L / 2 + sg * 1.3, x1 = sg > 0 ? L - 1.3 : 1.3, w = C / 8 * .85;
        c.beginPath(); c.moveTo(x0, y); c.bezierCurveTo(x0 + sg * 3, y - w, x1 - sg * 3, y - w * 1.1, x1, y); c.bezierCurveTo(x1 - sg * 3, y + w * 1.1, x0 + sg * 3, y + w, x0, y); c.stroke();
        for (var x = Math.min(x0, x1) + 1.2; x < Math.max(x0, x1) - .8; x += .55) { var t = Math.abs(x - x0) / Math.abs(x1 - x0), ww = w * Math.sin(PI * Math.min(1, t * 1.15)) * .8; c.beginPath(); c.arc(x, y, Math.max(.1, ww), -PI / 2, PI / 2, sg < 0); c.stroke(); } } }); },
    kc: [[15, 90]], kcR: .5,
    them: function (g, P) { [-.9, -.3, .3, .9].forEach(function (dx) { var pts = []; for (var q = 0; q <= 40; q++) pts.push(P(15 + dx, q / 40 * 360, .25)); g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 60, .22, 6, true), VL.vangDan)); }); } }); };   /* vòng dây thừng ở đai giữa */
  DS['24008'] = function () { return ongCong({ L: 30, R: 2.6, sag: 3.0,   /* xem 4 ảnh: lưới vảy cá dây hạt, 2 bên cuộn xoắn to, mặt trước hoa sen men xanh ngọc chân hồng */
    ve: function (c, L, C) { vayCa(c, 1.3, L - 1.3, C, .9, .28); c.lineWidth = .5; [[9.5, 1], [6, -1], [20.5, -1], [24, 1]].forEach(function (q) { xoanNho(c, q[0], C / 4, 1.5, q[1] > 0 ? 0 : PI, 1.2, .5); }); c.fillRect(11, C / 4 - 2.4, 8, 4.4); },
    men: function (c, L, C) { var x = L / 2, y = C / 4 + 1.6; [[-3.3, -.5], [-2, -.9], [-.7, -1.2], [.7, -1.2], [2, -.9], [3.3, -.5]].forEach(function (p, k) { la(c, x + p[0] * .3, y + .6, 4.0, 1.4, -PI / 2 + p[0] * .3, '#f4c1b5', '#3fae88'); });
      c.fillStyle = '#f2d6c6'; c.beginPath(); c.ellipse(x, y + .5, 3.8, 1.0, 0, 0, 7); c.fill(); } }); };
  DS['24020'] = function () { return ongCong({ L: 30, R: 2.6, sag: 2.4,   /* xem 4 ảnh: lộng cuộn xoắn dày đặc, mặt trước chim phượng: đầu vàng cuộn bên trái, lông đuôi men xanh lá + xanh lam xoè dọc thân */
    ve: function (c, L, C) { for (var x = 2.5; x < L - 1.5; x += 2.2) for (var y = 0; y < C; y += 2.2) xoanNho(c, x + (Math.round(y / 2.2) % 2) * 1.1, y, .95, x + y, 1.3, .3); c.fillRect(5, C / 4 - 2.3, 23, 4.6); },
    men: function (c, L, C) { var y = C / 4; for (var k = 0; k < 7; k++) la(c, 7.5 + k * 2.6, y + 1.5 - (k % 2) * 2.2, 7.0, 2.0, -.3 + (k % 2) * .55, k % 2 ? '#2a5fb8' : '#18a050', k % 2 ? '#4b8fe0' : '#62d47e'); },
    them: function (g, P) { var p = P(6, 90, .2), h = new THREE.Mesh(new THREE.TorusGeometry(.9, .28, 8, 24, PI * 1.6), VL.vang); h.position.copy(p); h.lookAt(P(6, 90, 2)); g.add(h); } }); };   /* đầu phượng */
  DS['23983'] = function () { return ongCong({ L: 30, R: 2.7, sag: 2.6,   /* xem 4 ảnh: lưới chéo chữ X dày + quạt nan trong mắt lưới, hàng 8 kim cương dọc mặt trên */
    ve: function (c, L, C) { c.lineWidth = .4; var d = 2.6; for (var x = -C; x < L + C; x += d) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + C, C); c.stroke(); c.beginPath(); c.moveTo(x + C, 0); c.lineTo(x, C); c.stroke(); }
      c.lineWidth = .18; for (var x2 = 1.3; x2 < L; x2 += d) for (var y = 0; y < C; y += d) for (var q = -2; q <= 2; q++) { c.beginPath(); c.moveTo(x2 + d / 2, y + d * .8); c.lineTo(x2 + d / 2 + q * .35, y + d * .25); c.stroke(); } },
    kc: [4, 7.3, 10.6, 13.9, 17.2, 20.5, 23.8, 27].map(function (x) { return [x, 90]; }), kcR: .38 }); };
  DS['24022'] = function () { return ongCong({ L: 30, R: 2.8, sag: 2.6,   /* xem 4 ảnh: lưới vảy cá + 1 dải trơn chạy dọc lưng; mặt trước đôi cánh men hồng 2 bên, giữa trái tim men xanh ngọc, 2 thiên nga vàng cuộn */
    ve: function (c, L, C) { vayCa(c, 1.3, L - 1.3, C, 1.0, .3); c.fillRect(1, 3 * C / 4 - .7, L - 2, 1.4); c.fillRect(5, C / 4 - 1.5, 20, 3.0); },
    men: function (c, L, C) { var y = C / 4; [-1, 1].forEach(function (sg) { for (var k = 0; k < 4; k++) la(c, L / 2 + sg * 2.2, y - .4 + k * .45, 8.5 - k * 1.3, 1.1, sg > 0 ? -.12 + k * .08 : PI + .12 - k * .08, '#f0b3a8', '#e8879a'); });
      c.fillStyle = '#3ec3b0'; c.beginPath(); c.moveTo(L / 2, y + 1.3); c.bezierCurveTo(L / 2 - 2, y - .2, L / 2 - 1.1, y - 1.6, L / 2, y - .6); c.bezierCurveTo(L / 2 + 1.1, y - 1.6, L / 2 + 2, y - .2, L / 2, y + 1.3); c.fill(); },
    them: function (g, P) { [-1, 1].forEach(function (sg) { var h = new THREE.Mesh(new THREE.TorusGeometry(.75, .2, 8, 20, PI * 1.5), VL.vang); h.position.copy(P(15 + sg * 2.4, 90, .25)); h.lookAt(P(15 + sg * 2.4, 90, 2)); if (sg < 0) h.rotateZ(PI); g.add(h); }); } }); };
  DS['24003'] = function () { return ongCong({ L: 28, R: 2.5, sag: 2.2,   /* xem 4 ảnh: chuỗi mắt hạnh nhân (vesica) đan nối dọc thân, 4 hàng quanh; lòng mỗi mắt men xanh lam nhạt; giữa là dây cuộn */
    ve: function (c, L, C) { c.lineWidth = .35; for (var r = 0; r < 4; r++) { var y = (r + .5) * C / 4; for (var x = 1.3 + (r % 2) * 1.6; x < L - 2; x += 3.2) { c.beginPath(); c.ellipse(x + 1.6, y, 1.75, .95, 0, 0, 7); c.stroke(); c.beginPath(); c.ellipse(x + 1.6, y, .9, .42, 0, 0, 7); c.stroke(); } }
      c.lineWidth = .2; for (var x2 = 2; x2 < L - 1.5; x2 += 1.6) for (var y2 = 0; y2 < C; y2 += C / 4) xoanNho(c, x2, y2, .5, x2, 1, .2); },
    men: function (c, L, C) { c.fillStyle = '#7fb3e6'; for (var r = 0; r < 4; r++) { var y = (r + .5) * C / 4; if (Math.abs(y - C / 4) > C / 5 && Math.abs(y - C / 4 + C) > C / 5) continue; for (var x = 1.3 + (r % 2) * 1.6; x < L - 2; x += 3.2) { c.beginPath(); c.ellipse(x + 1.6, y, .85, .38, 0, 0, 7); c.fill(); } } } }); };
  DS['23987'] = function () { return ongCong({ L: 30, R: 2.4, sag: 2.0,   /* xem 4 ảnh: lưới ô vuông, mỗi ô chữ 米 (chữ thập + chéo), hàng 5 kim cương dọc mặt trên */
    ve: function (c, L, C) { var d = C / 6; c.lineWidth = .32; for (var x = 1.3; x <= L - 1.3; x += d) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, C); c.stroke(); } for (var y = 0; y <= C; y += d) { c.beginPath(); c.moveTo(1.3, y); c.lineTo(L - 1.3, y); c.stroke(); }
      c.lineWidth = .24; for (x = 1.3; x < L - 1.3; x += d) for (y = 0; y < C; y += d) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + d, y + d); c.moveTo(x + d, y); c.lineTo(x, y + d); c.moveTo(x + d / 2, y); c.lineTo(x + d / 2, y + d); c.moveTo(x, y + d / 2); c.lineTo(x + d, y + d / 2); c.stroke(); } },
    kc: [9, 12.5, 16, 19.5, 23].map(function (x) { return [x, 90]; }), kcR: .32 }); };
  DS['24013'] = function () { return ongCong({ L: 32, R: 2.8, sag: 3.0,   /* xem 4 ảnh: dải trơn xoắn 1 vòng quanh thân, giữa các vòng là lưới chéo dây hạt + chuỗi vòng tròn; 3 kim cương trên dải */
    ve: function (c, L, C) { c.lineWidth = .28; var d = 1.6; for (var x = -C; x < L + C; x += d) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + C, C); c.stroke(); c.beginPath(); c.moveTo(x + C, 0); c.lineTo(x, C); c.stroke(); }
      for (var x2 = 2; x2 < L - 1.5; x2 += 1.4) { c.beginPath(); c.arc(x2, C * .6, .55, 0, 7); c.stroke(); c.beginPath(); c.arc(x2, C * .1, .55, 0, 7); c.stroke(); } },
    bang: { vong: 1, a0: PI / 2 - PI }, kc: [[5, 90 - 180 + 5 / 32 * 360], [16, 90], [27, 90 - 180 + 27 / 32 * 360]], kcR: .42 }); };
  DS['23992'] = function () { return ongCong({ L: 15, R: 3.0, sag: 2.6,   /* xem 4 ảnh: ống ngắn cong, lộng cuộn xoắn lá; mặt trước bông hoa 8 cánh vàng nổi, nhuỵ ruby; 2 hoa nhỏ 2 bên */
    ve: function (c, L, C) { for (var x = 2.2; x < L - 1.5; x += 1.7) for (var y = 0; y < C; y += 1.7) xoanNho(c, x + (Math.round(y / 1.7) % 2) * .85, y, .8, x * 3 + y, 1.25, .38);
      c.beginPath(); c.arc(L / 2, C / 4, 2.6, 0, 7); c.fill(); c.fillRect(1.3, 3 * C / 4 - .5, L - 2.6, 1); },
    them: function (g, P) { var tam = P(7.5, 90, .3), n = P(7.5, 90, 2).sub(P(7.5, 90, 0)).normalize(), hoa = new THREE.Group();
      for (var k = 0; k < 8; k++) { var a = k / 8 * PI * 2, cn = new THREE.Mesh(new THREE.SphereGeometry(.85, 14, 10), VL.vangNham); cn.scale.set(1, .45, .3); cn.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0); cn.rotation.z = a; hoa.add(cn); }
      var rb = vien(.5, VL.ruby, .7); rb.position.z = .25; hoa.add(rb); hoa.position.copy(tam); hoa.lookAt(tam.clone().add(n)); g.add(hoa);
      [3.6, 11.4].forEach(function (x) { var h2 = hoa.clone(); h2.scale.setScalar(.45); h2.position.copy(P(x, 70, .25)); h2.lookAt(P(x, 70, 2)); g.add(h2); }); } }); };
  DS['24029'] = function () { return ongCong({ L: 28, R: 2.6, sag: 2.4,   /* xem 4 ảnh: lộng vòng bầu dục + giọt nước; mặt trước 2 lá men xanh lam/xanh lá bên trái, ngọn lửa men đỏ cam vuốt sang phải */
    ve: function (c, L, C) { c.lineWidth = .35; for (var r = 0; r < 5; r++) for (var x = 1.8 + (r % 2) * 1.3; x < L - 2; x += 2.6) { c.beginPath(); c.ellipse(x + 1.3, (r + .5) * C / 5, 1.25, .75, (r % 2 ? .4 : -.4), 0, 7); c.stroke(); }
      c.fillRect(4, C / 4 - 2.2, 22, 4.4); },
    men: function (c, L, C) { var y = C / 4; la(c, 4.8, y + 1.6, 4.6, 1.8, -.95, '#1e8a54', '#3cc0d0'); la(c, 7.0, y + 1.6, 5.0, 1.9, -.6, '#2066c0', '#46b06a');
      var gr = c.createLinearGradient(12, y, 25, y); gr.addColorStop(0, '#f6c64a'); gr.addColorStop(.5, '#f07a28'); gr.addColorStop(1, '#e8241c'); c.fillStyle = gr;
      c.beginPath(); c.moveTo(10.5, y + 1.6); c.quadraticCurveTo(18, y + 2.4, 25.5, y - 2.0); c.quadraticCurveTo(21.5, y - .2, 23.5, y - 1.0); c.quadraticCurveTo(17, y - 1.2, 10.5, y + 1.6); c.fill(); } }); };

  /* ---------- nút hoa (hạt dẹt xỏ sườn: mặt trước gắn đá, lưng vòm chạm lộng, thành bên lỗ tròn) ---------- */
  var VLda = { garnet: new THREE.MeshPhysicalMaterial({ color: 0x6e0414, metalness: .25, roughness: 0, flatShading: true, clearcoat: 1, envMapIntensity: 1.5, emissive: 0x3a0008, emissiveIntensity: .3 }),   /* soát: đỏ rượu sẫm như ảnh (trước bị hồng san hô) */
    rubyG: new THREE.MeshPhysicalMaterial({ color: 0xe0185a, metalness: .3, roughness: 0, flatShading: true, clearcoat: 1, envMapIntensity: 2.4, emissive: 0x700628, emissiveIntensity: .35 }) };
  function lungLong(ve) { return vanLong(function (c, w, h) { c.save(); c.translate(w / 2, h / 2); c.scale(w / 11, w / 11); ve(c); c.restore(); }); }   /* tranh cho vom (uv = x/11) — vẽ theo mm, tâm 0 */
  function nutHoa(o) {
    var f = o.f, g = new THREE.Group(), T = o.T || 4.4, p = vienTu(f, 0, 0, 220), i;
    var nl = Math.round(o.loBen || 8), thanh = longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < nl; k++) { c.beginPath(); c.ellipse((k + .5) * w / nl, h / 2, w / nl * .3, h * .3, 0, 0, 7); c.fill(); } }));
    g.add(thanhVien(p, T, thanh, 1));   /* thành bên khoét lỗ tròn */
    var lung = vom(p, 0, 0, o.lungCao || 2.0, longVang(o.lung), null, 30); lung.rotation.y = PI; lung.position.z = -T / 2; g.add(lung);   /* lưng vòm chạm lộng */
    var x00 = 0; while (f(x00, 0) < 0 && x00 < 9) x00 += .02; var ongX = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 2 * x00 - .1, 16, 1, true), hai(VL.vangMo)); ongX.rotation.z = PI / 2; g.add(ongX);   /* ống xỏ ngang (dài đúng bề ngang — soát đợt 5) */
    g.add(ongVien(p, .18, VL.vang, -T / 2)); g.add(ongVien(p, .2, VL.vang, T / 2));
    o.truoc(g, T / 2, p);
    var x0 = 0; while (f(x0, 0) < 0 && x0 < 9) x0 += .02; [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (x0 + .02); g.add(l); });
    return { g: g, rong: 2 * x0, xo: 'xuyen', cao: 2 * x0, uoc: o.uoc || 9.5 };
  }
  function hoaKc(g, z, rTam, nVong, rVong, rr, vlVong) {   /* cụm: kim cương giữa + vòng đá nhỏ quanh, chấu hạt */
    var ds = []; for (var k = 0; k < nVong; k++) { var a = k / nVong * PI * 2; ds.push([Math.cos(a) * rVong, Math.sin(a) * rVong, z + .25, 0, 0, 1]); }
    g.add(hangKc(rTam, [[0, 0, z + .35, 0, 0, 1]])); g.add(hangKc(rr, ds, vlVong || VLda.rubyG));
    var nen = new THREE.Mesh(new THREE.CylinderGeometry(rVong + rr + .2, rVong + rr + .35, .5, 32), VL.vang); nen.rotation.x = PI / 2; nen.position.z = z; g.add(nen);
  }
  function cungHoa(n, r0, a, an) { return function (x, y) { var ang = Math.atan2(y, x); return Math.hypot(x, y) - (r0 + a * Math.pow(Math.abs(Math.cos(n / 2 * ang + (an || 0))), .7)); }; }
  var lungSen = lungLong(function (c) { c.strokeStyle = '#fff'; c.lineWidth = .35; c.beginPath(); c.arc(0, 0, 4.4, 0, 7); c.stroke(); for (var k = 0; k < 8; k++) { var a = k / 8 * PI * 2; c.beginPath(); c.ellipse(Math.cos(a) * 2.4, Math.sin(a) * 2.4, 1.9, .95, a, 0, 7); c.stroke(); } c.beginPath(); c.arc(0, 0, .9, 0, 7); c.lineWidth = .5; c.stroke(); });
  var lungHoa = lungLong(function (c) { c.strokeStyle = '#fff'; c.lineWidth = .45; c.beginPath(); c.arc(0, 0, 4.4, 0, 7); c.stroke(); for (var k = 0; k < 8; k++) { var a = k / 8 * PI * 2; c.beginPath(); c.ellipse(Math.cos(a) * 2.5, Math.sin(a) * 2.5, 1.6, 1.0, a, 0, 7); c.stroke(); } c.beginPath(); c.arc(0, 0, .95, 0, 7); c.stroke(); });
  var lungCuon = lungLong(function (c) { c.strokeStyle = '#fff'; c.lineWidth = .5; c.beginPath(); c.arc(0, 0, 4.4, 0, 7); c.stroke(); for (var k = 0; k < 4; k++) { c.save(); c.rotate(k * PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 4.4); c.stroke(); cuon(c, 1.6, 2.2, 1.1, 0, 1.2); cuon(c, -1.6, 2.2, 1.1, PI, 1.2); c.restore(); } });
  DS['23935'] = function () { return nutHoa({ f: function (x, y) { return Math.hypot(x, y) - 4.6; }, T: 4.2, lung: lungSen,   /* xem 4 ảnh: nút tròn vàng, mặt trước sao 8 cánh sen chạm lộng viền hạt, giữa kim cương + 8 ruby; lưng vòm lộng hoa sen; thành 8 lỗ tròn */
    truoc: function (g, z) { var t = longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.save(); c.translate(w / 2, h / 2); c.scale(w / 10, w / 10); c.fillStyle = '#000'; for (var k = 0; k < 8; k++) { var a = (k + .5) / 8 * PI * 2; c.beginPath(); c.ellipse(Math.cos(a) * 3.3, Math.sin(a) * 3.3, .9, .55, a, 0, 7); c.fill(); c.beginPath(); c.moveTo(Math.cos(a - .2) * 2.2, Math.sin(a - .2) * 2.2); c.lineTo(Math.cos(a) * 2.9, Math.sin(a) * 2.9); c.lineTo(Math.cos(a + .2) * 2.2, Math.sin(a + .2) * 2.2); c.fill(); } c.restore(); }));
      g.add(matPhang(vienTu(function (x, y) { return Math.hypot(x, y) - 4.5; }, 0, 0, 120), 10, t, z));
      var vs = []; for (var k = 0; k < 8; k++) { var a = k / 8 * PI * 2, q = []; for (var j = 0; j <= 2; j++) { var an = a + (j - 1) * PI / 8, r = j === 1 ? 4.0 : 1.9; q.push(new V2(Math.cos(an) * r, Math.sin(an) * r)); } vs = vs.concat(q.slice(0, 2)); }
      g.add(chuoiHat(vs, .14, VL.vang, z + .1)); hoaKc(g, z + .2, .75, 8, 1.35, .32); } }); };
  DS['23939'] = function () { var f = cungHoa(12, 4.2, .45); return nutHoa({ f: f, T: 4.4, lung: lungHoa, lungCao: 2.6,   /* xem 4 ảnh: nút hoa 12 cánh tròn viền dây hạt (mỗi cánh 1 vòng lồng), giữa kim cương + 8 ruby; lưng vòm lộng 8 cánh */
    truoc: function (g, z) { var nen = vom(vienTu(f, 0, 0, 200), 0, 0, 1.2, VL.vangNham); nen.position.z = z; g.add(nen);
      for (var k = 0; k < 12; k++) { var a = k / 12 * PI * 2, q = []; for (var j = 0; j < 30; j++) { var t = j / 30 * PI * 2; q.push(new V2(Math.cos(a) * 3.3 + Math.cos(t) * .95 * Math.cos(a) - Math.sin(t) * .62 * Math.sin(a), Math.sin(a) * 3.3 + Math.cos(t) * .95 * Math.sin(a) + Math.sin(t) * .62 * Math.cos(a))); } g.add(ongVien(q, .2, VL.vang, z + 1.05)); }   /* vòng cánh nổi trên vòm */
      hoaKc(g, z + 1.0, .75, 8, 1.35, .32); } }); };
  DS['23791'] = function () { var f = cungHoa(8, 4.0, .55); return nutHoa({ f: f, T: 4.0, lung: lungSen,   /* xem 4 ảnh: hoa sen 8 cánh, mép cánh cong vểnh, gân cánh khía; giữa garnet giác oval to viền hạt; lưng vòm lộng hoa */
    truoc: function (g, z) { var v = vom(vienTu(f, 0, 0, 200), 0, 0, 1.6, VL.vangNham, function (x, y, s) { var a = Math.atan2(y, x), r = Math.hypot(x, y); return 1 + .5 * Math.pow(s, 3) * Math.pow(Math.abs(Math.sin(4 * a)), .3) - .2 * Math.pow(Math.abs(Math.cos(16 * a)), 8) * Math.min(1, Math.max(0, r - 2.3)); }, 30); v.position.z = z; g.add(v);
      g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 2.3; }, 0, 0, 60), .15, VL.vang, z + 1.1));
      var nen = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, .6, 32), VL.vang); nen.rotation.x = PI / 2; nen.position.z = z + 1.0; g.add(nen);
      var da2 = new THREE.Mesh(kcGeo(1.75), VLda.garnet); da2.scale.set(1, .92, 1); da2.position.z = z + 1.35; g.add(da2); } }); };
  var vanDanLoop = vanLong(function (c, w, h) { c.lineWidth = 12; for (var r = 0; r < 4; r++) for (var k = -1; k < 9; k++) { c.beginPath(); c.ellipse((k + (r % 2) * .5) * w / 8, (r + .5) * h / 4, w / 10, h / 7, 0, 0, 7); c.stroke(); } });
  DS['23853'] = function () {   /* hoa garnet (xem 4 ảnh): hạt tròn dẹt lồng dây vàng đan vòng chéo; mặt trước garnet cabochon tròn viền hạt; lưng đĩa chữ 壽; xỏ ngang */
    var g = new THREE.Group(), R = 4.4, cage = new THREE.Mesh(new THREE.SphereGeometry(R, 72, 40, 0, PI * 2, .3, PI - .85), longVang(vanDanLoop)); cage.rotation.x = -PI / 2;   /* chừa lỗ to phía trước cho viên garnet */ cage.scale.z = .78; g.add(cage);
    var v = vien(1.85, da(0x7a0a2a, null, .12, .5), .6); v.position.z = R * .78 - .1; g.add(v);
    g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 2.35; }, 0, 0, 60), .15, VL.vang, R * .78 - .45));
    var be = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, .5, 32), VL.vang); be.rotation.x = PI / 2; be.position.z = R * .78 - .55; g.add(be);
    var lung = new THREE.Mesh(new THREE.CircleGeometry(2.3, 32), vanRieng(function (c, X, Y, k) { c.fillStyle = '#fff'; c.font = 'bold ' + (3 * k) + 'px serif'; c.fillText('壽', X(0), Y(0)); c.strokeStyle = '#fff'; c.lineWidth = .3 * k; c.beginPath(); c.arc(X(0), Y(0), 2.0 * k, 0, 7); c.stroke(); }, 2)); lung.position.z = -R * .78 + .1; lung.rotation.y = PI; g.add(lung);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (R * Math.sin(PI / 2) - .05); g.add(l); });
    return { g: g, rong: 8.8, xo: 'xuyen', cao: 8.8, uoc: 9 };
  };
  DS['23796'] = function () { var f = cungHoa(8, 4.3, .5, PI / 8); return nutHoa({ f: f, T: 4.4, lung: lungCuon,   /* xem 4 ảnh: nút hoa mây 8 thuỳ phủ đá trắng nhỏ (2 vòng), giữa garnet giác oval to 4 chấu; lưng vòm lộng cuộn */
    truoc: function (g, z) { var nen = vom(vienTu(f, 0, 0, 200), 0, 0, .9, VL.vang); nen.position.z = z; g.add(nen);
      var ds = []; [[3.8, 26], [2.95, 19]].forEach(function (q) { for (var k = 0; k < q[1]; k++) { var a = (k + .5) / q[1] * PI * 2, rr = q[0] * (1 + .08 * Math.cos(8 * a)); ds.push([Math.cos(a) * rr, Math.sin(a) * rr * .95, z + .55, 0, 0, 1]); } }); g.add(hangKc(.38, ds));
      var da2 = new THREE.Mesh(kcGeo(2.0), VLda.garnet); da2.scale.set(1.12, .88, 1); da2.position.z = z + 1.0; g.add(da2);
      [45, 135, 225, 315].forEach(function (d) { var a = d * PI / 180, ch = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), VL.vang); ch.position.set(Math.cos(a) * 2.0, Math.sin(a) * 1.75, z + 1.2); g.add(ch); }); } }); };
  DS['24190'] = function () { return DS['23788']({ hoa8: true }); };   /* xem 4 ảnh: cùng kiểu hoa lục đế 8 cánh viền hạt như 23788 (lưng vòm lộng 8 cánh) */
  var vanLuoiTo = vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var r = 0; r < 26; r++) for (var k = 0; k < 52; k++) { c.beginPath(); c.arc((k + (r % 2) * .5) * w / 52, (r + .5) * h / 26, w / 52 * .44, 0, 7); c.fill(); } });
  function menCuon() { return vai(256, 256, function (c, w, h) { c.clearRect(0, 0, w, h); c.fillStyle = '#2f6db8'; for (var k = 0; k < 4; k++) { var a = k * PI / 2; c.beginPath(); c.arc(128 + Math.cos(a) * 68, 128 + Math.sin(a) * 68, 50, 0, 7); c.fill(); }
    c.strokeStyle = '#e8c35c'; c.lineWidth = 9; for (k = 0; k < 4; k++) { a = k * PI / 2; c.beginPath(); c.arc(128 + Math.cos(a) * 68, 128 + Math.sin(a) * 68, 26, a + .8, a + 5); c.stroke(); } c.fillStyle = '#e8c35c'; c.beginPath(); c.arc(128, 128, 40, 0, 7); c.fill(); }); }
  function cauMen() {   /* cầu hoa văn xanh (23932, 23931 — xem 4 ảnh mỗi mã, cùng mẫu): cầu lưới vàng lỗ tròn dày, 4 ô men xanh chữ 壽 quanh xích đạo, 2 đầu lỗ xỏ là mây như ý men xanh */
    var R = 4.9, g = new THREE.Group(), i, lt = vanLuoiTo.clone(); lt.repeat.set(1, 1); lt.needsUpdate = true;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 56, 0, PI * 2, .3, PI - .6), new THREE.MeshStandardMaterial({ color: 0xf4c35a, metalness: 1, roughness: .3, alphaMap: lt, alphaTest: .5, bumpMap: VAN.dan, bumpScale: .5, side: THREE.DoubleSide })));
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R * .82, 48, 28), VL.vangMo));
    for (i = 0; i < 4; i++) { var a = i * PI / 2, h = huyHieu(1.8, '#2f6db8', '壽', '#e8c35c', '#e8c35c'); h.position.set(Math.sin(a) * (R + .02), 0, Math.cos(a) * (R + .02)); h.lookAt(Math.sin(a) * 30, 0, Math.cos(a) * 30); h.rotateZ(PI / 2); g.add(h);   /* chữ đứng thẳng khi ống nằm ngang */
      var vv = khoen(1.82, .11, VL.vang); vv.position.copy(h.position).multiplyScalar((R - .33) / R); vv.lookAt(h.position.clone().multiplyScalar(2)); g.add(vv); }   /* soát: viền ô men ôm sát mặt cầu (trước nhô ra thành vòng lơ lửng) */
    var mc = new THREE.MeshPhysicalMaterial({ map: menCuon(), alphaTest: .5, roughness: .2, clearcoat: 1, side: THREE.DoubleSide });
    [-1, 1].forEach(function (sg) { var m = new THREE.Mesh(new THREE.CircleGeometry(2.6, 40), mc); m.rotation.x = -sg * PI / 2; m.position.y = sg * R * Math.cos(.3); g.add(m);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.7, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * (R * Math.cos(.3) + .02); g.add(l); });
    return { g: ongNam(g), rong: 2 * R * Math.cos(.3), xo: 'ong', cao: 2 * R };
  }
  DS['23932'] = cauMen; DS['23931'] = cauMen;

  /* ---------- hoa lô 4 ---------- */
  DS['23962'] = function () {   /* hoa bồ công anh (xem 4 ảnh): hoa nhỏ 4 cánh hình quạt có gân toả, đầu gân là hạt tròn; giữa kim cương ổ tròn; 2 khoen → treo */
    var g = new THREE.Group(), i, k;
    for (k = 0; k < 4; k++) { var a0 = PI / 4 + k * PI / 2;
      for (i = -6; i <= 6; i++) { var a = a0 + i * .105, L = 2.9 - Math.abs(i) * .04, gan = new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, L, 6), VL.vangNham);   /* soát đợt 5: cánh quạt rộng, gần chạm nhau */ gan.rotation.z = a - PI / 2; gan.position.set(Math.cos(a) * (.6 + L / 2), Math.sin(a) * (.6 + L / 2), .1); g.add(gan);
        var h = new THREE.Mesh(new THREE.SphereGeometry(.24, 8, 6), VL.vang); h.position.set(Math.cos(a) * (.65 + L), Math.sin(a) * (.65 + L), .1); g.add(h); }
      var nen = new THREE.Mesh(new THREE.CircleGeometry(2.6, 20, a0 - .66, 1.32), VL.vangMo); nen.position.z = -.05; g.add(nen); }
    var o = new THREE.Mesh(new THREE.CylinderGeometry(.7, .75, .55, 20), VL.vang); o.rotation.x = PI / 2; o.position.z = .2; g.add(o); g.add(hangKc(.5, [[0, 0, .5, 0, 0, 1]]));
    var cao = mocDon(g, 2.6); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 3.3 };
  };
  DS['23779'] = function () {   /* hoa mai ngọc du long (xem 4 ảnh): ngọc xanh tạc hoa 5 cánh có gân, viền vàng phủ đá trắng nhỏ quanh; lưng lồng lộng hoa 4 cánh; xuyên ngang */
    var f = cungHoa(5, 3.9, .6, PI / 2), g = new THREE.Group(), vk = vienTu(function (x, y) { return f(x, y) - .9; }, 0, 0, 220), T = 3.6;
    var de = khoi(vk, 0, 0, hoSo(T, .3), VL.vang, true); de.position.z = T / 2 - .6; g.add(de);
    lungLo(g, function (x, y) { return f(x, y) - .85; }, -T / 2 - .6, HV.hoa4, 5.4, da(0x37b45a, vanMay, .12, .38), -.4);   /* soát: lưng hoa 4 cánh lộng thấy ngọc */
    var vr = vienTu(function (x, y) { return f(x, y) - .45; }, 0, 0, 44); g.add(hangKc(.27, vr.map(function (q) { return [q.x, q.y, T / 2 - .45, 0, 0, 1]; })));
    var v = vom(vienTu(f, 0, 0, 220), 0, 0, 1.4, da(0x37b45a, vanMay, .12, .38), function (x, y, s) { var a = Math.atan2(y, x), r = Math.hypot(x, y); return 1 - .3 * Math.pow(Math.abs(Math.sin(2.5 * a - PI / 4 * 0 + PI / 2 * 2.5)), 18) * Math.min(1, r / 1.2) - .2 * Math.pow(Math.abs(Math.cos(5 * a + PI / 2 * 5)), 20) * Math.min(1, r / 1.5); }, 36); v.position.z = T / 2 - .5; g.add(v);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f(x0 * sg, 0) < .9 && x0 < 9) x0 += .02; l.position.set(sg * x0, 0, -.4); g.add(l); });
    return { g: g, rong: 10, xo: 'xuyen', cao: 10, uoc: 10 };
  };
  DS['23851'] = function () { var f = function (x, y) { var t = Math.atan2(y, x) - PI / 2; return Math.hypot(x, y) - (2.7 + 1.45 * Math.pow(1 - Math.abs(Math.sin(3 * t)), .85)); };   /* soát đợt 5: 6 cánh NHỌN đầu như ảnh (trước cánh tròn) */ return nutHoa({ f: f, T: 3.8, lung: lungCuon, lungCao: 1.6,   /* xem 4 ảnh: hoa 6 cánh nhọn vàng chải xước, gân giữa cánh, đầu cánh đính đá trắng, giữa hạt nam hồng đỏ cam viền hạt; lưng vòm lộng */
    truoc: function (g, z) { var v = vom(vienTu(f, 0, 0, 220), 0, 0, .9, VL.vangMo, function (x, y, s) { var a = Math.atan2(y, x); return 1 + .5 * Math.exp(-Math.pow(Math.sin(3 * a - PI / 2 * 3) / .12, 2)) * s; }, 30); v.position.z = z; g.add(v);
      var ds = []; for (var k = 0; k < 6; k++) { var a = PI / 2 + k / 6 * PI * 2; ds.push([Math.cos(a) * 3.55, Math.sin(a) * 3.55, z + .55, 0, 0, 1]); } g.add(hangKc(.3, ds));   /* soát đợt 5: đá ở đầu cánh */
      g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 1.55; }, 0, 0, 50), .13, VL.vang, z + .8));
      var nh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 28, 20), new THREE.MeshPhysicalMaterial({ color: 0xd8411c, roughness: .25, clearcoat: .6 })); nh.scale.z = .75; nh.position.z = z + 1.0; g.add(nh); } }); };
  DS['24051'] = function () {   /* khoá hoa sen (xem 4 ảnh): 2 búp sen vàng úp ngược nhau nối bằng đai trụ giữa (dáng nơ), mỗi búp 2 tầng cánh có gân viền; đai giữa chạm hoa văn + 2 gờ; lỗ xuyên dọc → nằm dọc dây */
    var g = new THREE.Group(), i, k;
    var dai = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3.2, 28), VL.vangHoa); g.add(dai);
    [-1.45, 1.45].forEach(function (y) { var t = khoen(1.55, .17, VL.vang); t.rotation.x = PI / 2; t.position.y = y; g.add(t); });
    [-1, 1].forEach(function (sg) { for (var tang = 0; tang < 2; tang++) for (k = 0; k < 8; k++) { var a = (k + tang * .5) / 8 * PI * 2, sh = new THREE.Shape(), L = 3.0 - tang * .5, W = 1.7 - tang * .25;
        sh.moveTo(0, 0); sh.quadraticCurveTo(W * 1.05, L * .3, W * .72, L * .78); sh.quadraticCurveTo(0, L * 1.12, -W * .72, L * .78); sh.quadraticCurveTo(-W * 1.05, L * .3, 0, 0);   /* soát đợt 5: cánh sen dày tròn đầu */
        var m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .2, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 2, curveSegments: 10 }), tang ? VL.vang : VL.vangNham);
        var p = new THREE.Group(); p.add(m); m.position.z = 1.1 - tang * .25; m.rotation.x = .5 - tang * .25; p.rotation.y = a;   /* cánh khum thành búp, tầng trong đứng hơn */ p.position.y = sg * 1.6; if (sg < 0) p.rotation.x = PI; g.add(p); }
      var l = new THREE.Mesh(new THREE.CircleGeometry(.8, 20), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * 4.2; g.add(l); });
    return { g: ongNam(g), rong: 9, xo: 'ong', cao: 7 };
  };
  DS['23990'] = function () {   /* hoa đá bạc (xem 4 ảnh): vòng chặn bạc trắng gồm các bông hoa 6 cánh đá trắng nối liền quanh lỗ to, hoa nhỏ xen giữa; xỏ qua lỗ */
    var g = new THREE.Group(), i, R = 3.4, n = 8;   /* soát đợt 5: 8 hoa pavé kín đá sát nhau */
    var vo = new THREE.Mesh(new THREE.TorusGeometry(R, .45, 12, 60), VL.bac); vo.rotation.x = PI / 2; g.add(vo);
    for (i = 0; i < n; i++) { var a = i / n * PI * 2, hoa = new THREE.Group(), ds = [[0, 0, .3, 0, 0, 1]];
      for (var k = 0; k < 6; k++) { var b = k / 6 * PI * 2; ds.push([Math.cos(b) * .85, Math.sin(b) * .85, .2, Math.cos(b) * .3, Math.sin(b) * .3, 1]); }
      hoa.add(hangKc(.5, ds)); var de = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, .5, 18), VL.bac); de.rotation.x = PI / 2; hoa.add(de);
      hoa.position.set(Math.sin(a) * (R + .25), 0, Math.cos(a) * (R + .25)); hoa.lookAt(Math.sin(a) * 20, 0, Math.cos(a) * 20); g.add(hoa);
      var nh = hangKc(.3, [[Math.sin(a + PI / n) * (R + .1), 0, Math.cos(a + PI / n) * (R + .1), Math.sin(a + PI / n), 0, Math.cos(a + PI / n)]]); g.add(nh); }
    return { g: ongNam(g), rong: 3, xo: 'ong', cao: 2 * R + 2.4 };
  };
  DS['24096'] = function () {   /* hoa bạc phủ vàng (xem 4 ảnh): quai treo dạng 2 ống tròn dẹt đính hàng đá trắng (dây luồn qua), rủ 1 bông hoa 6 cánh đá giọt trắng + 1 bướm nhỏ đính đá → treo */
    var g = new THREE.Group(), i;
    [-.75, .75].forEach(function (x) { var o = new THREE.Mesh(new THREE.TorusGeometry(1.7, .55, 10, 40), VL.vang); o.rotation.y = PI / 2; o.position.set(x, 1.7, 0); g.add(o); });   /* 2 ống quai */
    var dk = []; [-.75, .75].forEach(function (x) { for (i = 0; i < 9; i++) { var a = (i - 4) * .3; dk.push([x, 1.7 + 2.25 * Math.sin(a), 2.25 * Math.cos(a), 0, Math.sin(a), Math.cos(a)]); } }); g.add(hangKc(.2, dk));   /* hàng đá mặt trước quai */
    var kh = new THREE.Group(); kh.position.y = 1.7; g.add(kh); g.userData.khoa = kh;
    var k1 = khoen(.35, .1, VL.vang); k1.position.set(.6, -.4, 0); g.add(k1);
    var hoa = new THREE.Group(), dsH = [];
    for (i = 0; i < 6; i++) { var b = i / 6 * PI * 2, gi = new THREE.Mesh(kcGeo(.75), VL.kc); gi.scale.set(.75, 1.25, 1); gi.position.set(Math.cos(b) * 1.15, Math.sin(b) * 1.15, 0); gi.rotation.z = b - PI / 2; hoa.add(gi); }
    hoa.add(hangKc(.35, [[0, 0, .3, 0, 0, 1]])); var de = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, .4, 24), VL.vang); de.rotation.x = PI / 2; de.position.z = -.4; hoa.add(de); hoa.position.set(.6, -3.0, 0); g.add(hoa);
    var fb = hinhBuom(.28), bu = khoi(vienTu(fb, 0, 0, 120), 0, 0, hoSo(.4, .1), VL.vang); bu.position.set(-1.4, -1.6, .2); g.add(bu);
    g.add(hangKc(.13, [[-1.9, -1.35, .3, 0, 0, 1], [-.9, -1.35, .3, 0, 0, 1], [-1.75, -1.95, .3, 0, 0, 1], [-1.05, -1.95, .3, 0, 0, 1]]));
    g.children.forEach(function (m) { m.position.y -= 1.7; });
    return { g: g, rong: 3, xo: 'treo', cao: 11 };
  };
  DS['24064'] = function () {   /* hoa bạc 925 (user: 3 bông hoa dựa lưng vào nhau): 3 bông cỏ 4 lá tim bạc trắng xếp tam giác quanh lỗ xỏ, lưng chạm nhau; mỗi cánh tim viền dây hạt riêng, trong cánh đá trắng, giữa đá to; nhìn từ đầu lỗ thấy tam giác viền hạt */
    var g = new THREE.Group(), i, k, A = 1.45, B = .55, Rr = .95;
    function canh(k) { var an = PI / 4 + k * PI / 2, c = Math.cos(an), s2 = Math.sin(an); return function (x, y) { var u = x * c + y * s2, v = -x * s2 + y * c; return Math.min(hop(tron(u, v, A, B, Rr), tron(u, v, A, -B, Rr), .35), hop(tron(u, v, A * .45, 0, Rr * .8), tron(u, v, A, 0, Rr * .7), .9)); }; }
    var f = coLa(4, A, B, Rr, .6, PI / 4), vk = vienTu(f, 0, 0, 200);
    for (i = 0; i < 3; i++) { var a = i * PI * 2 / 3, hoa = new THREE.Group();
      var t = khoi(vk, 0, 0, hoSo(.7, .25), VL.bac); t.position.z = .35; hoa.add(t);
      var ds = [[0, 0, .55, 0, 0, 1]];
      for (k = 0; k < 4; k++) { var an = PI / 4 + k * PI / 2, cx = Math.cos(an) * 1.35, cy = Math.sin(an) * 1.35, fk = canh(k);
        var vm = vom(vienTu(function (x, y) { return fk(x, y) + .12; }, cx, cy, 90), cx, cy, .45, VL.bac, null, 16); vm.position.z = .35; hoa.add(vm);   /* cánh phồng */
        hoa.add(chuoiHat(vienTu(function (x, y) { return fk(x, y) - .02; }, cx, cy, 120), .2, VL.bac, .4));   /* viền dây hạt từng cánh */
        ds.push([Math.cos(an) * 1.5, Math.sin(an) * 1.5, .75, 0, 0, 1]); }
      hoa.add(hangKc(.28, ds.slice(1))); hoa.add(hangKc(.42, [ds[0].map(function (v, j) { return j === 2 ? .9 : v; })]));
      hoa.position.set(Math.sin(a) * 1.75, 0, Math.cos(a) * 1.75); hoa.lookAt(Math.sin(a) * 20, 0, Math.cos(a) * 20); hoa.rotateZ(PI / 4); g.add(hoa); }   /* lưng 3 bông chạm nhau thành tam giác */
    var ong = new THREE.Mesh(new THREE.CylinderGeometry(.85, .85, 4.6, 18, 1, true), hai(VL.bac)); g.add(ong);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.84, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * 2.3; g.add(l); });
    return { g: ongNam(g), rong: 5.6, xo: 'ong', cao: 7.6, uoc: 8 };
  };
  DS['23988'] = function () {   /* hoa văn bạc phủ vàng (xem kĩ lại ảnh to): tấm dáng chuông/chìa — cổ dài thon từ khoen loe dần xuống; đáy 4 thuỳ tròn (2 bên + 2 dưới, lõm nhẹ giữa đáy); viền hạt quanh mép; chấm hạt nổi: chữ Λ chụm ở cổ + vạch giữa, toả xuống 2 nét cuộn xoắn vào 2 thuỳ bên; đáy trơn chải mờ; khoen → treo */
    var f = function (x, y) { var ax = Math.abs(x), t = Math.min(1, Math.max(0, (4.3 - y) / 3.2)), co = Math.max(ax - (.55 + .7 * t * t), y - 4.3, .5 - y);   /* cánh trên kéo dài thành cổ */
      var d = Math.min(tron(ax, y, 1.55, .05, 1.1), tron(x, y, 0, -1.55, 1.4));   /* 2 cánh tròn 2 bên + 1 cánh tròn to ở đáy (tổng 4 cánh kể cả cổ) */
      d = hop(d, tron(x, y, 0, -.2, 1.25), .4);   /* lõi giữa, chừa khía lõm giữa các cánh */
      return hop(d, co, .55); };
    var vl = vanRieng(function (c, X, Y, k) { c.fillStyle = '#fff';
      function cham(x, y, r) { c.beginPath(); c.arc(X(x), Y(y), (r || .15) * k, 0, 7); c.fill(); }
      function duong(pts, n) { for (var j = 0; j <= n; j++) { var u = j / n * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(u)), q = u - i; cham(pts[i][0] + (pts[i + 1][0] - pts[i][0]) * q, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * q); } }
      duong([[0, 3.9], [0, .1]], 11);   /* vạch giữa */
      [-1, 1].forEach(function (sg) { duong([[0, 3.2], [sg * .32, 2.0], [sg * .55, .7]], 9);   /* chữ Λ ngoài */
        duong([[0, 1.6], [sg * .22, .8], [sg * .3, .25]], 5);   /* Λ trong */
        var pts = []; for (var j = 0; j <= 16; j++) { var t = j / 16, an = PI * .75 - t * PI * 1.9, r = .75 * (1 - .55 * t); pts.push([sg * (1.5 - Math.cos(an) * r), .05 + Math.sin(an) * r]); }
        pts.unshift([sg * .55, .7]); duong(pts, 20);   /* nét cuộn xoắn chữ C vào cánh bên */
        cham(sg * 1.55, 0, .18); });
      cham(0, .45, .17); }, 2.8);
    var vl2 = vl.clone(); vl2.roughness = .42;
    var g = tamTreo({ f: f, vl: vl2, day: 1.0, hat: .14, cy: -.6 }); var cao = mocDon(g, 4.3); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 3.0 };
  };
  var lungLongCuon = lungLong(function (c) { c.strokeStyle = '#fff'; c.lineWidth = .45; c.beginPath(); c.arc(0, 0, 4.4, 0, 7); c.stroke(); for (var k = 0; k < 8; k++) { c.save(); c.rotate(k * PI / 4); c.beginPath(); c.moveTo(0, .6); c.lineTo(0, 4.4); c.stroke(); c.restore(); } c.beginPath(); c.arc(0, 0, .6, 0, 7); c.stroke(); });
  DS['24156'] = function () { var f = cungHoa(6, 3.9, .7); return nutHoa({ f: f, T: 3.6, lung: lungLongCuon, lungCao: 1.4,   /* xem 4 ảnh: hoa 6 cánh vàng chạm lộng cuộn (lá mỏng hơi vểnh), giữa lục đế cabochon tròn; lưng lộng nan toả 8; xuyên ngang */
    truoc: function (g, z) { var t = longVang(vanLong(function (c, w, h) { c.save(); c.translate(w / 2, h / 2); c.scale(w / 10, w / 10); c.fillStyle = '#fff'; c.fillRect(-5, -5, 10, 10); c.fillStyle = '#000'; c.strokeStyle = '#000'; c.lineWidth = .25;
        for (var k = 0; k < 6; k++) { var a = k / 6 * PI * 2; c.beginPath(); c.ellipse(Math.cos(a) * 3.1, Math.sin(a) * 3.1, .5, .3, a, 0, 7); c.fill(); cuon(c, Math.cos(a + .35) * 2.6, Math.sin(a + .35) * 2.6, .55, a, 1.2); cuon(c, Math.cos(a - .35) * 2.6, Math.sin(a - .35) * 2.6, .55, a + PI, 1.2); } c.restore(); }));
      var v = vom(vienTu(f, 0, 0, 220), 0, 0, 1.0, t, function (x, y, s) { return 1 + .35 * s * s; }, 24); v.position.z = z; g.add(v);
      var vd = vien(1.6, VL.lucde, .7); vd.position.z = z + 1.0; g.add(vd); g.add(ongVien(vienTu(function (x, y) { return Math.hypot(x, y) - 1.68; }, 0, 0, 50), .14, VL.vang, z + .9)); } }); };
  var vanCauMen = vai(1024, 512, function (c, w, h) {   /* cầu 23917: nền vàng, 4 dải xoắn chéo (dải vàng chạm cuộn mây + 2 viền men xanh ngọc/trắng), giữa các dải là mảng đá trắng */
    c.fillStyle = '#d9a73a'; c.fillRect(0, 0, w, h);
    for (var k = 0; k < 4; k++) { var x0 = k * w / 4; c.save(); c.translate(x0, 0); c.transform(1, 0, -.35, 1, 0, 0);
      c.fillStyle = '#f2ead8'; c.fillRect(30, 0, 120, h); c.fillStyle = '#2fb8a8'; c.fillRect(30, 0, 18, h); c.fillRect(132, 0, 18, h);
      c.fillStyle = '#e8b84a'; c.fillRect(56, 0, 68, h); c.strokeStyle = '#a87a1c'; c.lineWidth = 5; for (var y = 20; y < h; y += 44) { c.beginPath(); c.arc(90, y, 14, 0, PI * 1.6); c.stroke(); } c.restore(); } });
  DS['23917'] = function () {   /* cầu hoa văn (xem 4 ảnh): hạt cầu vàng, dải xoắn chéo chạm cuộn mây viền men xanh ngọc + trắng, giữa dải là cụm đá trắng; 2 đầu lỗ là hoa đá trắng; xỏ qua lỗ */
    var R = 4.6, g = new THREE.Group(), i;
    g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 72, 48, 0, PI * 2, .22, PI - .44), new THREE.MeshPhysicalMaterial({ map: vanCauMen, metalness: .55, roughness: .3, clearcoat: .7 })));
    var ds = []; for (i = 0; i < 4; i++) for (var k = 0; k < 7; k++) { var a = (i + .62) / 4 * PI * 2 + (k % 3 - 1) * .1, t = .55 + k * .3, n = new V3(Math.sin(t) * Math.sin(a + (t - 1.57) * .35), Math.cos(t), Math.sin(t) * Math.cos(a + (t - 1.57) * .35)); ds.push([n.x * R, n.y * R, n.z * R, n.x, n.y, n.z]); }
    g.add(hangKc(.32, ds));
    [-1, 1].forEach(function (sg) { var hd = []; for (var k = 0; k < 8; k++) { var b = k / 8 * PI * 2, rr = 1.6; hd.push([Math.cos(b) * rr, sg * Math.sqrt(R * R - rr * rr), Math.sin(b) * rr, Math.cos(b) * .3, sg, Math.sin(b) * .3]); } g.add(hangKc(.35, hd));
      var l = new THREE.Mesh(new THREE.CircleGeometry(.85, 20), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * R * Math.cos(.22); g.add(l); });
    return { g: ongNam(g), rong: 2 * R * Math.cos(.22), xo: 'ong', cao: 2 * R };
  };

  /* ---------- nhóm Khác lô 1 ---------- */
  var vanVayRong = vanNoi(function (g, w, h) { g.fillStyle = '#555'; g.fillRect(0, 0, w, h); for (var r = 0; r < 20; r++) for (var c = 0; c < 40; c++) { var x = (c + (r % 2) * .5) * w / 40, y = r * h / 20, gr = g.createRadialGradient(x, y, 0, x, y, w / 40 * .6); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#555'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, w / 40 * .6, 0, 7); g.fill(); } });
  DS['23139'] = function () {   /* túi tiền ngọc bích (soát lại 3 ảnh, số đo 11,2 × 9,7 × 7): túi ngọc TẠC TRÒN dày (không phải vòm mỏng): bụng tròn căng, cổ thắt buộc dây, miệng xoè lượn; nếp gấp khắc;
     ngọc ngồi trên khay vàng phía sau, 4 chấu móc ôm hông túi; khay có lỗ xỏ ngang */
    var f2 = function (x, y) { var d = hop(elip(x, y, 0, -1.3, 4.6, 3.5), Math.max(Math.abs(x) - 1.6, Math.abs(y - 1.75) - .55), .5); return hop(d, elip(x, y, 0, 3.0, 3.3, 1.25) + .25 * Math.abs(Math.sin(x * 2.2)), .4); };
    function f(x, y, z) { var d = phong(x, y, z - .6, f2(x, y), 2.4, 3.4, 1.4);
      d += ranh(y - 1.25, .2, .3) * (Math.abs(x) < 2.2 ? 1 : 0);   /* dây buộc cổ */
      if (z > .6) { for (var k = -2; k <= 2; k++) d += ranh(x - k * 1.1 - .2 * (y + 1), .13, .12) * (y < .8 && y > -2.7 ? 1 : 0);   /* nếp gấp bụng túi */
        d += ranh(x - .4 * Math.sin(y * 3), .15, .1) * (y > 1.7 ? 1 : 0); }
      return d; }
    var g = new THREE.Group(), ngoc = daSuot({ mau: 0x2c7e38, tr: .22, nhuom: 0x5aa86a, xa: 2, nham: .14, ior: 1.62 });
    g.add(khoiTac(f, [-4.8, -5, -1, 4.8, 4.3, 4.2], ngoc, 84, '23139'));
    var de = khoi(vienTu(function (x, y) { return f2(x, y) - .25; }, 0, -.5, 200), 0, -.5, hoSo(1.8, .35), VL.vang); de.position.z = -.6; g.add(de);   /* khay vàng sau lưng */
    [[-3.6, -2.4], [3.6, -2.4], [-2.4, 2.1], [2.4, 2.1]].forEach(function (q) { var c = new THREE.Mesh(new THREE.CylinderGeometry(.17, .22, 2.6, 8), VL.vang); c.position.set(q[0], q[1], .3); c.rotation.x = PI / 2; c.rotation.z = 0; c.rotateX(0); g.add(c);
      var mu = new THREE.Mesh(new THREE.SphereGeometry(.24, 10, 8), VL.vang); mu.position.set(q[0] * .96, q[1] * .96 + (q[1] > 0 ? 0 : .1), 1.6); g.add(mu); });   /* 4 chấu */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.set(sg * 4.75, -1.0, -1.5); g.add(l); });
    return { g: g, rong: 11.2, xo: 'xuyen', cao: 9.7 };
  };

  DS['25820'] = function () {   /* con cua vàng (xem lại ảnh to): thân tròn: lam băng cabochon 4 chấu giữa, vòng 12 đá trắng; quanh thân bên trái là chân cua = đồng xu lỗ vuông xen ổ đá trắng; bên phải 2 càng cong hình trăng khuyết, càng trên kẹp đồng xu, khoen treo gắn ở đó → treo nghiêng */
    var th = new THREE.Group(), i, nen = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.8, 1.0, 40), VL.vang); nen.rotation.x = PI / 2; th.add(nen);
    var v = vien(1.15, VL.lambang, .75); v.position.z = .75; th.add(v);
    for (i = 0; i < 4; i++) { var a = PI / 4 + i * PI / 2, ch = new THREE.Mesh(new THREE.CylinderGeometry(.1, .13, .9, 6), VL.vang); ch.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, .9); ch.rotation.x = PI / 2; th.add(ch); }
    var ds = []; for (i = 0; i < 12; i++) { var b = i / 12 * PI * 2; ds.push([Math.cos(b) * 1.85, Math.sin(b) * 1.85, .6, 0, 0, 1]); } th.add(hangKc(.3, ds));
    th.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 2.35; }, 0, 0, 60), .12, VL.vang, .55));
    function xu(x, y, r) { var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .5, 22), VL.vang); m.rotation.x = PI / 2; m.position.set(x, y, .1); th.add(m); var vv = khoen(r * .8, .07, VL.vangMo); vv.position.set(x, y, .37); th.add(vv); var l = new THREE.Mesh(new THREE.PlaneGeometry(r * .5, r * .5), VL.toi); l.position.set(x, y, .37); th.add(l); }
    function oDa(x, y) { var m = new THREE.Mesh(new THREE.CylinderGeometry(.55, .6, .55, 18), VL.vang); m.rotation.x = PI / 2; m.position.set(x, y, .1); th.add(m); th.add(hangKc(.4, [[x, y, .42, 0, 0, 1]])); }
    [[150, 'xu'], [172, 'da'], [195, 'xu'], [217, 'da'], [240, 'xu'], [262, 'da'], [285, 'xu'], [128, 'da'], [105, 'xu'], [307, 'da']].forEach(function (q) { var a2 = q[0] * PI / 180, x = Math.cos(a2) * 3.25, y = Math.sin(a2) * 3.25; if (q[1] === 'xu') xu(x, y, .62); else oDa(x, y); });   /* chân cua quanh trái */
    [[1, 0], [-1, 1]].forEach(function (q) { var sg = q[0], cg = new THREE.Mesh(new THREE.TorusGeometry(1.05, .55, 12, 28, PI * 1.25), VL.vang); cg.scale.z = .8; cg.position.set(3.0, sg * 1.75, .1); cg.rotation.z = sg > 0 ? -.3 : PI * .05 + PI; th.add(cg); });   /* 2 càng trăng khuyết */
    xu(3.9, 2.55, .75);   /* đồng xu kẹp ở càng trên */
    return { g: treoEo(th, 4.45, 3.05, PI / 2 - Math.atan2(3.05, 4.75), 1), rong: 1.5, xo: 'treo', cao: 11 };
  };
  DS['25804'] = function () {   /* ngọc lam băng tròn (xem 3 ảnh): viên lam băng cabochon tròn, viền đá trắng nhỏ quanh, lưng vàng chạm sóng nước (vảy cá chồng); khoen + khoá lò xo → treo */
    var g = new THREE.Group(), nen = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.9, 1.3, 40), VL.vang); nen.rotation.x = PI / 2; g.add(nen);
    var v = vien(1.85, VL.lambang, .6); v.position.z = .75; g.add(v); g.add(ongVien(vienTu(function (x, y) { return Math.hypot(x, y) - 1.95; }, 0, 0, 60), .14, VL.vang, .65));
    var ds = []; for (var i = 0; i < 24; i++) { var a = i / 24 * PI * 2; ds.push([Math.cos(a) * 2.45, Math.sin(a) * 2.45, .66, 0, 0, 1]); } g.add(hangKc(.22, ds));
    var lung = new THREE.Mesh(new THREE.CircleGeometry(2.8, 40), vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .14 * k; for (var r = 0; r < 6; r++) for (var q = -3; q <= 3; q++) { var cx = q * 1.1 + (r % 2) * .55, cy = -2.6 + r * .9; [.5, .3].forEach(function (rr) { c.beginPath(); c.arc(X(cx), Y(cy), rr * k * 1.1, PI, 0); c.stroke(); }); } }, 2)); lung.rotation.y = PI; lung.position.z = -.66; g.add(lung);
    var cao = moc(g, 2.9); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 2.9 };
  };
  DS['26266'] = function () {   /* 2 đài sen ngọc băng rơi (xem lại ảnh to): mỗi đài là khối ngọc băng trong, dẹt dày, bầu dài như chiếc thìa (đầu trên hẹp, đáy tròn to); mặt trước phía trên có đĩa tròn nổi với 6 lỗ hạt sen (5 quanh + 1 giữa); đầu trên có mũ lá vàng nhiều ngón bấu; 2 đài treo cạnh nhau qua khoen vào quai tròn đính hàng đá trắng */
    var g = new THREE.Group(), ngoc = daSuot({ kinh: true, mau: 0xc9ebe2, dac: .26 }), loHat = new THREE.MeshPhysicalMaterial({ color: 0xa9d2c8, roughness: .35, transmission: .3 });
    var f = function (x, y) { return hop(elip(x, y, 0, -1.2, 2.5, 3.4), elip(x, y, 0, 2.0, 1.45, 1.6), 1.6); };
    [-1, 1].forEach(function (sg) { var d = new THREE.Group(), vk = vienTu(f, 0, -.5, 160);
      d.add(khoiTac(function (x, y, z) { var dd = phong(x, y, z, f(x, y), 2.0, 1.75, 1.45), r = Math.hypot(x, y - 1.3);   /* soát: đài sen ngọc DÀY tạc tròn (trước là tấm dẹt) */
        dd = S3.hop(dd, epBo(r - 1.45, z - 1.5, .5, .35), .35);   /* đĩa hạt sen nổi */
        for (var k = 0; k < 6; k++) { var a = k / 5 * PI * 2 + PI / 2, rr = k < 5 ? .88 : 0; dd = S3.hop(dd, S3.cau(x, y, z, Math.cos(a) * rr, 1.3 + Math.sin(a) * rr, 1.95, .3), .12); }   /* 6 hạt sen lồi */
        return dd; }, [-2.8, -4.8, -1.7, 2.8, 3.8, 2.4], ngoc, 70, '26266'));
      var k;
      for (k = 0; k < 5; k++) { var b = (k - 2) * .38, ngon = new THREE.Mesh(new THREE.CapsuleGeometry(.2, 1.4, 4, 8), VL.vang); ngon.position.set(Math.sin(b) * 1.0, 3.4 - Math.abs(k - 2) * .15, Math.cos(b) * .5); ngon.rotation.set(-.35, 0, -b * .9); d.add(ngon); }   /* mũ lá vàng nhiều ngón */
      var mu = new THREE.Mesh(new THREE.SphereGeometry(.65, 14, 10), VL.vang); mu.position.y = 4.1; d.add(mu);
      var kk = khoen(.35, .1, VL.vang); kk.position.y = 4.9; d.add(kk);
      d.scale.setScalar(.9); d.position.set(sg * 2.9, -6.6, sg * .4); d.rotation.z = sg * .22; d.rotation.y = sg * .25; g.add(d);   /* user: 2 đài tách hẳn nhau, mỗi đài rủ riêng chếch ra 2 bên */
      var dinh = new V3(0, 4.9 * .9, 0).applyEuler(d.rotation).add(d.position); xich(g, new V3(sg * .35, -.6, 0), dinh, .2, VL.vang); });   /* mắt xích nối đài sen lên khoen chung */
    var q = khoen(1.25, .4, VL.vang); q.rotation.y = PI / 2; q.scale.set(1, 1, 1.1); q.position.y = 1.2; g.add(q); g.userData.khoa = q;
    var ds = []; for (var j = 0; j < 6; j++) { var a2 = -1.0 + j * .4; ds.push([.42, 1.2 + Math.sin(a2) * 1.25, Math.cos(a2) * 1.25, 1, 0, 0]); } g.add(hangKc(.2, ds));   /* hàng đá trên quai */
    g.children.forEach(function (m) { m.position.y -= 1.2; });
    return { g: g, rong: 2.6, xo: 'treo', cao: 15 };
  };
  var vanDzi = vai(512, 256, function (c, w, h) { c.fillStyle = '#555'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.fillStyle = '#fff'; c.lineWidth = 7;   /* 9 mắt tròn + nét chữ T như dzi */
    for (var k = 0; k < 9; k++) { var x = (k % 3 + .5) * w / 3 + (Math.floor(k / 3) % 2) * w / 6, y = (Math.floor(k / 3) + .5) * h / 3; c.beginPath(); c.arc(x, y, 20, 0, 7); c.stroke(); c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
    for (k = 0; k < 6; k++) { var x2 = k * w / 6 + 40; c.beginPath(); c.moveTo(x2, 20); c.lineTo(x2, h - 20); c.moveTo(x2 - 20, 20); c.lineTo(x2 + 20, 20); c.stroke(); } });
  vanDzi.colorSpace = THREE.NoColorSpace;
  DS['23908'] = function () {   /* dzi 9 mắt vàng (xem 3 ảnh): hạt trụ thuôn (dài ≈ 2,2 đường kính), chạm nổi mắt tròn + nét chữ T kiểu đá dzi, 2 đầu có ngấn; lỗ xỏ dọc */
    var pf = [], i, H = 4.4, R = 2.0; for (i = 0; i <= 140; i++) { var y = -H + 2 * H * i / 140, u = y / H; pf.push([.95 + (R - .95) * Math.sqrt(Math.max(0, 1 - u * u)), y]); }   /* thùng thuôn 2 đầu */
    pf.unshift([.6, -H]); pf.push([.6, H]);
    var g = new THREE.Group(), m = xoayLuoi(pf, 160, function (r, y, a, j) { var ay = Math.abs(y), z = -(ay > H - .8 && ay < H - .2 ? .08 * Math.abs(Math.sin(ay * 14)) : 0);
      for (var q = 0; q < 3; q++) for (var w = -1; w <= 1; w++) { var da = Math.atan2(Math.sin(a - (q * 2 * PI / 3 + w * .5)), Math.cos(a - (q * 2 * PI / 3 + w * .5))) * r, dy = y - w * 2.4, d = Math.hypot(da, dy);
        z += .16 * Math.exp(-Math.pow((d - .55) / .1, 2)) + .14 * Math.exp(-d * d / .04); }   /* soát: 9 "mắt" dzi = vòng tròn nổi + chấm giữa (ảnh: mắt nổi rõ) */
      return r + z; }, new THREE.MeshStandardMaterial({ color: 0xf4c35a, metalness: 1, roughness: .3, bumpMap: vanDzi, bumpScale: 7 }));
    vanDzi.repeat.set(2, 1); g.add(m); [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * (H + .01); g.add(l); });
    return { g: ongNam(g), rong: 2 * H, xo: 'ong', cao: 2 * R };
  };
  DS['23819'] = function () {   /* ống đính đá (xem 3 ảnh): ống trụ nhỏ (dài ≈ 2 đường kính), 2 đầu gờ tròn, thân chạm hạt nổi + cuộn, giữa mặt 1 kim cương ổ tròn; lỗ dọc */
    var H = 3.6, R = 1.7, g = new THREE.Group();
    g.add(xoayLuoi([[.6, -H], [R + .25, -H], [R + .25, -H + .55], [R, -H + .65], [R, H - .65], [R + .25, H - .55], [R + .25, H], [.6, H]], 64, null, VL.vangHoa));
    var o = new THREE.Mesh(new THREE.CylinderGeometry(.75, .8, .4, 20), VL.vang); o.position.z = R + .1; o.rotation.x = PI / 2; g.add(o); g.add(hangKc(.55, [[0, 0, R + .32, 0, 0, 1]]));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * (H + .01); g.add(l); });
    return { g: ongNam(g), rong: 2 * H, xo: 'ong', cao: 2 * R + .5 };
  };
  DS['23822'] = function () {   /* con thoi (xem 3 ảnh): hạt hình thoi bậc thang — đai giữa phẳng rộng, mỗi bên 3 bậc tròn nhỏ dần; vàng bóng; lỗ dọc */
    var pf = [[.7, -3.4]], st = [[1.0, 3.4], [1.45, 2.6], [1.85, 1.8], [2.25, 1.0]];
    st.forEach(function (q) { pf.push([q[0], -q[1]]); pf.push([q[0], -q[1] + .62]); });   /* soát: bỏ điểm [2.25, 1] thừa làm mặt cắt tự cắt → vết chém chéo */
    for (var i = st.length - 1; i >= 0; i--) { pf.push([st[i][0], st[i][1] - .62]); pf.push([st[i][0], st[i][1]]); } pf.push([.7, 3.4]);
    var g = new THREE.Group(); g.add(xoayLuoi(pf, 64, null, VL.vang));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.68, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * 3.41; g.add(l); });
    return { g: ongNam(g), rong: 6.8, xo: 'ong', cao: 4.5 };
  };
  DS['9438'] = function () {   /* rồng tròn (xem 3 ảnh): vòng tròn dày là thân rồng phủ vảy, đầu rồng có sừng/bờm ở đỉnh vòng; dây xỏ qua lòng vòng */
    var g = new THREE.Group(), R = 3.3, vl = new THREE.MeshStandardMaterial({ color: 0xf2c25a, metalness: 1, roughness: .38, bumpMap: vanVayRong, bumpScale: 2.2 });
    var t = new THREE.Mesh(new THREE.TorusGeometry(R, 1.05, 24, 80), vl); g.add(t);
    var dau = new THREE.Group(), so = new THREE.Mesh(new THREE.SphereGeometry(1.35, 20, 14), VL.vangNham); so.scale.set(1.6, .9, 1.1); dau.add(so);
    [-1, 1].forEach(function (sg) { var s1 = new THREE.Mesh(new THREE.ConeGeometry(.3, 1.6, 8), VL.vang); s1.position.set(sg * .8, .9, -.2); s1.rotation.z = -sg * .7; dau.add(s1);
      for (var k = 0; k < 3; k++) { var b = new THREE.Mesh(new THREE.TorusGeometry(.35, .14, 6, 12, PI * 1.4), VL.vang); b.position.set(sg * (1.3 + k * .4), .5 - k * .1, -.3); dau.add(b); }
      var mt = new THREE.Mesh(new THREE.SphereGeometry(.2, 8, 6), VL.toi); mt.position.set(sg * .55, .2, 1.05); dau.add(mt); });
    var mom = new THREE.Mesh(new THREE.SphereGeometry(.6, 14, 10), VL.vangNham); mom.position.set(0, -.3, 1.2); mom.scale.set(1.4, .8, 1); dau.add(mom);
    dau.scale.setScalar(1.35); dau.position.y = R + .9; g.add(dau);
    var b2 = new THREE.Group(); g.rotation.y = PI / 2 - .7; b2.add(g); return { g: b2, rong: 2.8, xo: 'ong', cao: 2 * R + 3.3, dung: true };   /* vòng xỏ dây qua lòng, hơi nghiêng cho thấy mặt + đầu rồng */
  };

  /* ---------- mặt ngọc lấy từ ảnh thật (charm-anh/<mã>.webp + -noi.webp) + đường viền đo từ ảnh, đối xứng 2 bên ---------- */
  var VIEN_ANH = {"25782": {"c": [0.195, -0.116], "r": [3.634, 3.628, 3.613, 3.593, 3.574, 3.554, 3.53, 3.501, 3.467, 3.43, 3.386, 3.326, 3.241, 3.122, 2.976, 2.824, 2.691, 2.584, 2.504, 2.454, 2.426, 2.404, 2.384, 2.367, 2.353, 2.345, 2.349, 2.364, 2.387, 2.414, 2.446, 2.481, 2.518, 2.561, 2.62, 2.706, 2.812, 2.92, 3.019, 3.121, 3.243, 3.387, 3.543, 3.691, 3.807, 3.88, 3.912, 3.921, 3.923, 3.921, 3.912, 3.88, 3.807, 3.691, 3.543, 3.387, 3.243, 3.121, 3.019, 2.92, 2.812, 2.706, 2.62, 2.561, 2.518, 2.481, 2.446, 2.414, 2.387, 2.364, 2.349, 2.345, 2.353, 2.367, 2.384, 2.404, 2.426, 2.454, 2.504, 2.584, 2.691, 2.824, 2.976, 3.122, 3.241, 3.326, 3.386, 3.43, 3.467, 3.501, 3.53, 3.554, 3.574, 3.593, 3.613, 3.628]}, "23138": {"c": [0.359, -0.34], "r": [4.092, 4.084, 4.059, 4.022, 3.976, 3.919, 3.842, 3.739, 3.622, 3.501, 3.373, 3.23, 3.076, 2.926, 2.789, 2.666, 2.554, 2.449, 2.352, 2.27, 2.206, 2.16, 2.126, 2.105, 2.096, 2.097, 2.111, 2.149, 2.216, 2.304, 2.4, 2.498, 2.595, 2.695, 2.805, 2.93, 3.07, 3.225, 3.386, 3.539, 3.667, 3.768, 3.847, 3.907, 3.948, 3.971, 3.983, 3.988, 3.99, 3.988, 3.983, 3.971, 3.948, 3.907, 3.847, 3.768, 3.667, 3.539, 3.386, 3.225, 3.07, 2.93, 2.805, 2.695, 2.595, 2.498, 2.4, 2.304, 2.216, 2.149, 2.111, 2.097, 2.096, 2.105, 2.126, 2.16, 2.206, 2.27, 2.352, 2.449, 2.554, 2.666, 2.789, 2.926, 3.076, 3.23, 3.373, 3.501, 3.622, 3.739, 3.842, 3.919, 3.976, 4.022, 4.059, 4.084]}, "23772": {"c": [0.132, 0.217], "r": [2.629, 2.634, 2.648, 2.672, 2.706, 2.75, 2.805, 2.868, 2.938, 3.019, 3.112, 3.215, 3.331, 3.46, 3.596, 3.733, 3.857, 3.955, 4.01, 4.01, 3.963, 3.899, 3.84, 3.781, 3.707, 3.618, 3.526, 3.444, 3.372, 3.305, 3.239, 3.178, 3.119, 3.055, 2.985, 2.923, 2.884, 2.872, 2.884, 2.918, 2.979, 3.062, 3.157, 3.246, 3.316, 3.367, 3.4, 3.42, 3.426, 3.42, 3.4, 3.367, 3.316, 3.246, 3.157, 3.062, 2.979, 2.918, 2.884, 2.872, 2.884, 2.923, 2.985, 3.055, 3.119, 3.178, 3.239, 3.305, 3.372, 3.444, 3.526, 3.618, 3.707, 3.781, 3.84, 3.899, 3.963, 4.01, 4.01, 3.955, 3.857, 3.733, 3.596, 3.46, 3.331, 3.215, 3.112, 3.019, 2.938, 2.868, 2.805, 2.75, 2.706, 2.672, 2.648, 2.634]}};
  function vienAnh(ma) { var d = VIEN_ANH[ma], N = d.r.length; return function (x, y) { var dx = x - d.c[0], dy = y - d.c[1], t = Math.atan2(dy, dx); if (t < 0) t += PI * 2; var u = t / (PI * 2) * N, i = Math.floor(u) % N, q = u - Math.floor(u); return Math.hypot(dx, dy) - (d.r[i] * (1 - q) + d.r[(i + 1) % N] * q); }; }
  var _tl = null;
  function ngocAnh(ma) { _tl = _tl || new THREE.TextureLoader(); var t = _tl.load('charm-anh/' + ma + '.webp'), b = _tl.load('charm-anh/' + ma + '-noi.webp'); t.colorSpace = THREE.SRGBColorSpace; b.colorSpace = THREE.NoColorSpace; t.anisotropy = 4;
    var m = da(0xffffff, t, .05, .16); m.bumpMap = b; m.bumpScale = 2.2; m.roughness = .12; return m; }
  function docDay(g, dai) {   /* charm xỏ DỌC (user: mọi charm xỏ đều xỏ dọc): bỏ lỗ ngang cũ, khoét lỗ ở 2 đầu trục dài y rồi đặt nằm theo dây */
    g.children.slice().forEach(function (m) { if (m.material === VL.toi) g.remove(m); });
    var hb = new THREE.Box3().setFromObject(g);   /* soát đợt 5: đặt lỗ đúng 2 đầu thật (trước đặt theo 'dai' ước → đĩa đen lơ lửng ngoài đầu) */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = (sg > 0 ? hb.max.y : hb.min.y) + sg * .02; g.add(l); });
    return ongNam(g); }
  /* ---------- kim cang · tỳ hưu ---------- */
  function ongTay(A, B, r, vl) { var c = new THREE.CatmullRomCurve3(A); return new THREE.Mesh(new THREE.TubeGeometry(c, 24, r, 8), vl); }
  function vajraDau(sg, L, R, vl, kieu) {   /* nửa chày kim cang hướng sg (±y), dài L, bán kính R; kieu 'long' = 4 nan mở rỗng, 'cau' = bầu kín có nan + hạt, 'vuong' = nan dày có hạt */
    var g = new THREE.Group(), i, n = 4;
    var de = new THREE.Mesh(new THREE.CylinderGeometry(R * .55, R * .4, L * .18, 20), vl); de.position.y = sg * L * .09; g.add(de);
    if (kieu === 'cau') { var b = new THREE.Mesh(new THREE.SphereGeometry(R * .82, 24, 16), VL.vangNham); b.scale.y = 1.3; b.position.y = sg * L * .52; g.add(b); }   /* soát đợt 5: bầu giọt nhỏ hơn để 4 nan + hạt nổi rõ */
    for (i = 0; i < n; i++) { var a = i / n * PI * 2 + PI / 4, pts = [];
      for (var k = 0; k <= 8; k++) { var t = k / 8, rr = R * Math.sin(PI * (.15 + .85 * t)) * (1 - .1 * t); pts.push(new V3(Math.cos(a) * rr, sg * L * (.15 + .8 * t), Math.sin(a) * rr)); }
      g.add(ongTay(pts, 0, kieu === 'long' ? R * .14 : R * .2, vl));
      if (kieu !== 'long') for (k = 1; k <= 7; k += 1) { var p = pts[k], h = new THREE.Mesh(new THREE.SphereGeometry(R * .12, 8, 6), vl); h.position.copy(p).multiply(new V3(1.18, 1, 1.18)); g.add(h); } }
    var tru = new THREE.Mesh(new THREE.CylinderGeometry(R * .14, R * .14, L * .8, 8), vl); tru.position.y = sg * L * .55; g.add(tru);
    var mui = new THREE.Mesh(new THREE.ConeGeometry(R * .2, L * .15, 8), vl); mui.position.y = sg * L * 1.0; if (sg < 0) mui.rotation.z = PI; g.add(mui);
    return g;
  }
  function chayKC(o) {   /* chày kim cang xỏ ngang: trục dài y, lỗ xỏ ở giữa theo x (dây đi ngang qua giữa thân) */
    var g = new THREE.Group(), L = o.L || 4.2, R = o.R || 1.9, vl = o.vl || VL.vang;
    var giua = new THREE.Mesh(new THREE.CylinderGeometry(o.rg || 1.1, o.rg || 1.1, 2.0, 24), o.vlGiua || VL.vangMo); g.add(giua);
    [-1, 1].forEach(function (sg) { var bd = khoen((o.rg || 1.1) + .05, .15, VL.vang); bd.rotation.x = PI / 2; bd.position.y = sg * 1.0; g.add(bd);
      var d = vajraDau(sg, L, R, vl, o.kieu); d.position.y = sg * 1.0; g.add(d); });
    if (o.vong) { var v = khoen(1.05, .28, VL.vang); v.rotation.y = PI / 2; g.add(v); }
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * ((o.rg || 1.1) + (o.vong ? .35 : .02)); g.add(l); });
    return g;
  }
  DS['16391'] = function () { return { g: docDay(chayKC({ L: 4.0, R: 2.0, kieu: 'long', rg: 1.25 }), 12.6), rong: 12.6, xo: 'ong', cao: 4.2 }; };   /* xem 3 ảnh: chày kim cang trơn, mỗi đầu 4 nan cong rỗng, giữa trụ vàng mờ có lỗ xỏ ngang */
  DS['16396'] = function () { return { g: docDay(chayKC({ L: 3.8, R: 2.1, kieu: 'cau', rg: .9, vong: true }), 12.2), rong: 12.2, xo: 'ong', cao: 4.4 }; };   /* xem 3 ảnh: 2 đầu bầu kín có nan nổi + hạt chấm, giữa là khoen tròn (dây xỏ qua) */
  DS['16395'] = function () {   /* xem 4 ảnh: chày kim cang chuông — 1 đầu chuông chạm hoa văn hạt, miệng chuông rủ 1 kim cương ổ tròn; đầu kia là chày 4 nan mở có hạt; giữa khoen tròn xỏ dây */
    var g = new THREE.Group(), i, giua = khoen(1.0, .3, VL.vang); giua.rotation.y = PI / 2; g.add(giua);
    var d = vajraDau(1, 3.6, 1.9, VL.vang, 'vuong'); d.position.y = 1.1; g.add(d);
    var pf = []; for (i = 0; i <= 20; i++) { var t = i / 20; pf.push([.6 + 1.6 * Math.pow(t, 1.6) + .25 * (t > .9 ? (t - .9) * 10 : 0), -1.1 - t * 3.6]); }
    for (i = 20; i >= 0; i--) { var t2 = i / 20; pf.push([.45 + 1.5 * Math.pow(t2, 1.6), -1.1 - t2 * 3.6 + .05]); }
    g.add(xoayLuoi(pf, 48, null, hai(VL.vangHoa)));   /* chuông */
    var kc = new THREE.Group(), o2 = new THREE.Mesh(new THREE.CylinderGeometry(.75, .8, .4, 20), VL.vang); o2.rotation.x = PI / 2; kc.add(o2); kc.add(hangKc(.55, [[0, 0, .25, 0, 0, 1]])); kc.position.y = -5.6; g.add(kc);
    var nx = khoen(.25, .08, VL.vang); nx.position.y = -4.85; g.add(nx);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * 1.32; g.add(l); });
    return { g: docDay(g, 11.6), rong: 11.6, xo: 'ong', cao: 4.8 };
  };
  DS['21669'] = function () {   /* xem lại ảnh to: giữa là ổ tròn sapphire xanh lam; 2 bên là 2 ĐẦU NHƯ Ý (mây) bằng dây vàng chạm lộng — mũi nhọn ngoài cùng, 2 thuỳ tròn 2 bên cuộn vào trong, giữa đầu như ý là đá xanh lá ổ tròn viền hạt; lòng thuỳ có dây cuộn; lỗ xỏ ngang qua giữa thân */
    var g = new THREE.Group(), T = 2.4, i;
    function nhuY(x, y) { var d = tron(x, y, 0, 3.15, 1.2); d = hop(d, tron(x, y, -1.35, 2.65, 1.05), .35); d = hop(d, tron(x, y, 1.35, 2.65, 1.05), .35);
      d = hop(d, Math.max(Math.abs(x) - .9, Math.abs(y - 1.7) - .5), .5); d = hop(d, Math.max(Math.abs(x) - .45, Math.abs(y - 4.4) - .45 + Math.abs(x) * .9), .3); return d; }   /* mây như ý: mũi nhọn + 2 thuỳ */
    [-1, 1].forEach(function (sg) { var dau = new THREE.Group(), p = vienTu(nhuY, 0, 2.7, 180);
      [T / 2, -T / 2].forEach(function (z) { dau.add(ongVien(p, .2, VL.vang, z)); });   /* viền dây 2 mặt */
      dau.add(thanhVien(p, T, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h * .15); c.fillRect(0, h * .85, w, h * .15); c.lineWidth = 10; for (var k = 0; k < 14; k++) cuon(c, (k + .5) * w / 14, h / 2, 22, k, 1.2); })), 1));
      [[-1.3, 2.75, 0], [1.3, 2.75, PI], [-.55, 3.75, -PI / 2], [.55, 3.75, PI * 1.5]].forEach(function (q) { var pts = []; for (var t = 0; t <= 1.0001; t += .05) { var an = q[2] + t * PI * 2.6, rr = .78 * (1 - .75 * t); pts.push(new V3(q[0] + Math.cos(an) * rr, q[1] + Math.sin(an) * rr, T / 2 - .05)); }
        dau.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .13, 6), VL.vang)); });   /* dây cuộn trong 2 thuỳ + mũi */
      var lungD = matPhang(p, 10, VL.vangMo, -T / 2 + .1, true); dau.add(lungD);
      var oDa = new THREE.Mesh(new THREE.CylinderGeometry(.8, .85, .5, 24), VL.vang); oDa.rotation.x = PI / 2; oDa.position.set(0, 2.55, T / 2); dau.add(oDa);
      dau.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y - 2.55) - .82; }, 0, 2.55, 40), .09, VL.vang, T / 2 + .2));
      var v = vien(.6, da(0x5cc232, null, .16, .42), .7); v.position.set(0, 2.55, T / 2 + .3); dau.add(v);
      dau.rotation.z = sg > 0 ? 0 : PI; g.add(dau); });
    var giua = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, T + .2, 32), VL.vang); giua.rotation.x = PI / 2; g.add(giua);
    var sap = new THREE.Mesh(kcGeo(1.15), new THREE.MeshPhysicalMaterial({ color: 0x14307a, metalness: .3, roughness: 0, flatShading: true, clearcoat: 1, envMapIntensity: 2.4, emissive: 0x0a1840, emissiveIntensity: .3 }));
    sap.position.z = T / 2 + .35; g.add(sap); g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 1.32; }, 0, 0, 50), .1, VL.vang, T / 2 + .2));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * 1.52; g.add(l); });
    return { g: docDay(g, 10.8), rong: 10.8, xo: 'ong', cao: 4.2 };
  };
  DS['21636'] = function () {   /* dao kim cang phurba (xem lại ảnh to): đầu là vòng oval kín (mắt chày) có núm giữa + 2 tai cuộn loe 2 bên, khoen tròn móc qua vòng; cổ 3 nút khía dọc (nút giữa to); lưỡi 3 cạnh to bản nhọn dần, mỗi mặt lưỡi có ô tam giác lõm viền gờ dày → treo */
    var g = new THREE.Group(), i, L = 10.5, W = 1.6;   /* soát đợt 5: lưỡi dài thon (≈ nửa chiều dài) */
    var vo = khoen(1.15, .38, VL.vang); vo.scale.y = 1.35; vo.position.y = 3.2; g.add(vo);   /* vòng oval đầu */
    var num = new THREE.Mesh(new THREE.SphereGeometry(.45, 14, 10), VL.vang); num.scale.y = 1.6; num.position.y = 3.0; g.add(num);
    [-1, 1].forEach(function (sg) { var tai = new THREE.Mesh(new THREE.TorusGeometry(.45, .2, 8, 16, PI * 1.5), VL.vang); tai.position.set(sg * 1.55, 2.0, 0); tai.rotation.z = sg > 0 ? -.4 : PI + .4; g.add(tai); });   /* tai cuộn */
    function nut(y, R, H) { var pf = []; for (var k = 0; k <= 16; k++) { var t = k / 16, yy = y - H / 2 + H * t; pf.push([R * Math.sqrt(Math.max(.05, 1 - Math.pow(2 * t - 1, 2))), yy]); }
      g.add(xoayLuoi(pf, 64, function (r, yy, a) { return r * (1 + .07 * Math.cos(20 * a)); }, VL.vang)); }   /* nút khía dọc */
    nut(1.25, .8, 1.0); nut(0, 1.2, 1.5); nut(-1.25, .85, 1.0);
    var dinh = -1.85, mui = dinh - L, F = [];
    for (i = 0; i < 3; i++) { var a = i / 3 * PI * 2 + PI / 2; F.push(new V3(Math.cos(a) * W, dinh, Math.sin(a) * W)); }
    var pos = []; for (i = 0; i < 3; i++) { var A = F[i], B = F[(i + 1) % 3], C = new V3(0, mui, 0); pos.push(A.x, A.y, A.z, C.x, C.y, C.z, B.x, B.y, B.z); }
    pos.push(F[0].x, F[0].y, F[0].z, F[1].x, F[1].y, F[1].z, F[2].x, F[2].y, F[2].z);
    var gm = new THREE.BufferGeometry(); gm.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gm.computeVertexNormals(); g.add(new THREE.Mesh(gm, new THREE.MeshStandardMaterial({ color: 0xe9b347, metalness: 1, roughness: .35, side: THREE.DoubleSide })));   /* lưỡi 3 mặt */
    var mui3 = new V3(0, mui, 0);
    for (i = 0; i < 3; i++) { var P = F[i], Q = F[(i + 1) % 3];
      g.add(ongTay([P, mui3], 0, .2, VL.vang)); g.add(ongTay([P, Q], 0, .2, VL.vang));   /* gờ cạnh lưỡi */
      var tam = P.clone().add(Q).add(mui3).multiplyScalar(1 / 3), n = Q.clone().sub(P).cross(mui3.clone().sub(P)).normalize().multiplyScalar(-1);
      var co = function (v) { return v.clone().sub(tam).multiplyScalar(.62).add(tam).addScaledVector(n, .08); }, P2 = co(P), Q2 = co(Q), M2 = co(mui3);
      g.add(ongTay([P2, Q2], 0, .13, VL.vang)); g.add(ongTay([Q2, M2], 0, .13, VL.vang)); g.add(ongTay([M2, P2], 0, .13, VL.vang)); }   /* viền ô tam giác lõm */
    var dai = khoen(1.6, .22, VL.vang); dai.rotation.x = PI / 2; dai.position.y = dinh + .05; g.add(dai);
    var kh = new THREE.Group(), q = khoen(1.0, .2, VL.vang); q.rotation.y = PI / 2; kh.add(q); kh.position.y = 5.3; g.add(kh); g.userData.khoa = kh;
    g.children.forEach(function (m) { m.position.y -= 5.3; });
    return { g: g, rong: 1.6, xo: 'treo', cao: 19 };
  };
  DS['14681'] = function () {   /* xem 4 ảnh: khung chữ nhật bo góc viền đá trắng nhỏ, lòng rỗng, giữa là chày kim cang vàng dựng dọc gắn lục đế cabochon ở giữa; thành bên chạm lộng lưới; quai treo thuôn đính đá ở đỉnh → treo */
    var g = new THREE.Group(), W = 3.6, H = 8.6, T = 2.4, i;
    var ngoai = vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - W + .9, 0), Math.max(Math.abs(y) - H + .9, 0)) - .9; }, 0, 0, 160).map(function (q) { return new V2(q.x, q.y); });
    var sx = function (s) { return vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - W + .9 + s, 0), Math.max(Math.abs(y) - H + .9 + s, 0)) - .9 + s * 0; }, 0, 0, 160); };
    g.add(tamLo(sx(0), sx(1.35), T, VL.vang));   /* soát đợt 5: khung dày bản rộng, 1 hàng đá to */
    var vr = sx(.68), ds = []; for (i = 0; i < vr.length; i += 5) ds.push([vr[i].x, vr[i].y, T / 2 + .05, 0, 0, 1]); g.add(hangKc(.36, ds));
    var c = chayKC({ L: 2.6, R: 1.0, kieu: 'cau', rg: .5 }); c.children.forEach(function (m) { if (m.geometry && m.geometry.type === 'CircleGeometry') m.visible = false; }); c.scale.set(1.0, 1.85, 1.0); g.add(c);
    var v = vien(.75, VL.lucde, .7); v.position.z = .7; g.add(v); g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - .85; }, 0, 0, 30), .1, VL.vang, .5));
    var quai = new THREE.Mesh(new THREE.CylinderGeometry(.75, 1.1, 2.4, 4, 1), VL.vang); quai.rotation.y = PI / 4; quai.scale.z = .6; quai.position.y = H + 1.0; g.add(quai);
    g.add(hangKc(.2, [[0, H + .4, .5, 0, 0, 1], [0, H + 1.0, .45, 0, 0, 1], [0, H + 1.6, .4, 0, 0, 1]]));
    var cao = mocDon(g, H + 2.0); return { g: g, rong: 1.6, xo: 'treo', cao: cao + H };
  };
  function tyHuu(x, y) {   /* tỳ hưu nằm phục, nhìn từ trên, đầu ở −x: thân gọn hình hồ lô dài (đầu to tròn + thân bầu), chân thu dưới thân — KHÔNG xoè chân (user: trông như rùa) */
    var d = hop(elip(x, y, 1.1, 0, 3.0, 2.1), elip(x, y, -2.35, 0, 1.75, 1.85), .9);
    [-1, 1].forEach(function (s2) { d = hop(d, elip(x, y, -3.45, s2 * 1.05, .5, .38, s2 * .6), .35); });   /* 2 tai nhỏ vểnh trước */
    return hop(d, tron(x, y, 3.9, -.55, .55), .45); }   /* chóp đuôi cuộn */
  var tyHuuTron = tyHuu;
  function chamTyHuu(x, y, s) { function G(cx, cy, rx, ry) { return Math.exp(-(Math.pow((x - cx) / rx, 2) + Math.pow((y - cy) / (ry || rx), 2))); } function R(d, w) { return Math.exp(-Math.pow(d / w, 2)); }
    var z = .32 * G(-2.5, 0, 1.4, 1.5) + .3 * G(2.1, -.4, 1.5, 1.4) + .12 * G(.3, 0, 1.6, 1.6);   /* đầu, mông (bắp đùi sau), lưng */
    [-1, 1].forEach(function (s2) { z += .3 * G(-3.05, s2 * .7, .42, .42) - .16 * R(Math.hypot(x + 3.05, y - s2 * .7) - .48, .07);   /* mắt lồi tròn có viền */
      z += .1 * R(Math.hypot(x + 2.75, y - s2 * .7) - .8, .09) * (x < -2.5 ? 1 : 0);   /* mày cong */
      z += .14 * G(-2.0, s2 * 1.7, .5, .35) - .07 * R(Math.abs(y - s2 * 1.7) - .0, .06) * G(-2.0, s2 * 1.7, .55, .45);   /* chân trước thu dưới má */
      for (var k = 0; k < 3; k++) z -= .06 * R(y - s2 * (.35 + k * .35) - .4 * Math.sin((x + 1.6) * 1.6) * s2 * .3, .06) * (x > -1.8 && x < .2 ? 1 : 0); });   /* bờm chảy dọc gáy */
    z += .18 * G(-3.95, 0, .4, .5) - .08 * R(x + 3.6, .06) * (Math.abs(y) < .6 ? 1 : 0);   /* mũi + rãnh miệng */
    z -= .09 * R(Math.hypot((x - 2.1) / 1.05, (y + .4) / 1.0) - 1, .1);   /* viền bắp đùi sau */
    var tx = x - 3.1, ty = y + .3, ra = Math.hypot(tx, ty), an = Math.atan2(ty, tx); z -= ra < 1.0 && x > 2.4 ? .1 * R(((ra / .3 - an / (2 * PI)) % 1 + 1) % 1 - .5, .16) : 0;   /* đuôi cuộn trên mông */
    z -= .06 * R(y, .06) * (x > -.6 && x < 1.6 ? 1 : 0);   /* sống lưng */
    [-1, 1].forEach(function (s2) { z -= .08 * G(-3.15, s2 * .72, .14, .14);   /* con ngươi */
      for (var k = 0; k < 3; k++) z -= .05 * R(x + 1.75 + k * .17, .04) * G(-1.75 - k * .17, s2 * 1.95, .3, .25);   /* ngón chân trước */
      [[-1.3, .95], [-.6, 1.25], [.1, 1.45]].forEach(function (c) { var rx = x - c[0], ry = y - s2 * c[1], rr = Math.hypot(rx, ry), aa = Math.atan2(ry, rx) * s2; z -= rr < .42 ? .07 * R(((rr / .13 - aa / (2 * PI)) % 1 + 1) % 1 - .5, .18) : 0; }); });   /* xoáy bờm cuộn 2 bên gáy */
    return 1 + z * (1 - Math.pow(s, 4)) / Math.max(.35, Math.sqrt(1 - s * s)); }
  DS['23138'] = function () {   /* tỳ hưu ngọc lam băng: MẶT NGỌC LẤY TỪ ẢNH THẬT (charm-anh/23138), viền đo từ ảnh đối xứng 2 bên; khối ngọc tròn đầy đặt trong giỏ vàng: đai trên/dưới, trụ góc, 4 chấu nhọn cong vào; XỎ DỌC qua 2 đầu giỏ */
    var g = new THREE.Group(), f = vienAnh('23138'), C = VIEN_ANH['23138'].c, vk = vienTu(f, C[0], C[1], 300), ngoc = ngocAnh('23138');
    var xs = vk.map(function (q) { return q.x; }), ys = vk.map(function (q) { return q.y; }), BX = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, BY = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2, HX = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2, HY = (Math.max.apply(null, ys) - Math.min.apply(null, ys)) / 2;   /* khung bao viên ngọc: giỏ căn theo đây */
    var v = vom(vk, C[0], C[1], 3.9, ngoc, null, 60); v.position.z = .9; g.add(v);   /* soát: khối ngọc cao hơn như ảnh (ngồi nhô hẳn lên khay) */
    var de = khoi(vk, C[0], C[1], hoSo(1.2, .3), ngoc); de.position.z = .9; g.add(de);
    function chuNhat(dx, dy, r) { return vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x - BX) - dx, 0), Math.max(Math.abs(y - BY) - dy, 0)) - r; }, BX, BY, 160); }
    var dTren = khoi(chuNhat(HX - .7, HY - .75, .95), BX, BY, hoSo(.55, .12), VL.vang); dTren.position.z = .25; g.add(dTren);
    var dDuoi = khoi(chuNhat(HX - .7, HY - .75, .95), BX, BY, hoSo(.4, .12), VL.vang); dDuoi.position.z = -2.35; g.add(dDuoi);
    var nen = khoi(chuNhat(HX - .9, HY - .95, .9), BX, BY, hoSo(.25, .08), VL.vangMo); nen.position.z = -2.4; g.add(nen);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (q) { var x = BX + q[0] * (HX + .15), y = BY + q[1] * (HY + .1);
      var tru = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 2.2, 10), VL.vang); tru.rotation.x = PI / 2; tru.position.set(x, y, -1.2); g.add(tru);
      var pts = [new V3(x, y, .2), new V3(x, y, 1.1), new V3(x - q[0] * .25, y - q[1] * .35, 2.0), new V3(x - q[0] * .45, y - q[1] * .6, 2.6)];
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .24, 8), VL.vang)); });   /* 4 chấu */
    [-1, 1].forEach(function (sg) { var tm = tamLo(vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - .45, 0), Math.max(Math.abs(y) - .5, 0)) - .5; }, 0, 0, 60), vienTu(function (x, y) { return Math.hypot(x, y) - .55; }, 0, 0, 60), .3, VL.vang);
      tm.rotation.y = PI / 2; tm.position.set(BX + sg * (HX + .4), BY, -1.1); g.add(tm);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.52, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.set(BX + sg * (HX + .57), BY, -1.1); g.add(l); });   /* 2 tấm lỗ xỏ ở 2 ĐẦU giỏ (xỏ dọc) */
    g.children.forEach(function (m) { m.position.x -= BX; m.position.y -= BY; });
    return { g: g, rong: 2 * HX + 1.2, xo: 'xuyen', cao: 6, uoc: 6.5 };
  };
  DS['25782'] = function () {   /* tỳ hưu lục đế: MẶT NGỌC LẤY TỪ ẢNH THẬT (charm-anh/25782), viền đo từ ảnh đối xứng; ổ vàng ôm theo viền: gờ trơn ôm đá, viền hạt to mép trên + mép dưới, thành chạm lộng cuộn 2 tầng; lưng lưới đồng xu; xỏ dọc */
    var g = new THREE.Group(), f = vienAnh('25782'), C = VIEN_ANH['25782'].c, T = 3.0, vk = vienTu(f, C[0], C[1], 300);
    function ra(dd, n) { return vienTu(function (x, y) { return f(x, y) - dd; }, C[0], C[1], n || 280); }
    var gio = ra(.5);
    g.add(thanhVien(gio, T, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h * .12); c.fillRect(0, h * .88, w, h * .12); c.lineWidth = 8; for (var k = 0; k < 22; k++) { cuon(c, (k + .5) * w / 22, h * .42, 20, k * 2, 1.4); cuon(c, (k + 1) * w / 22, h * .62, 14, k * 2 + PI, 1.2); } })), 1));
    g.add(chuoiHat(ra(.32), .21, VL.vang, T / 2)); g.add(chuoiHat(ra(.42), .17, VL.vang, -T / 2 + .05));
    g.add(ongVien(ra(.06), .12, VL.vang, T / 2 - .05)); g.add(ongVien(ra(.5), .1, VL.vangMo, T / 2 - .35));
    var v = vom(vk, C[0], C[1], 1.9, ngocAnh('25782'), null, 60); v.position.z = T / 2 - .25; g.add(v);
    g.add(matPhang(gio, 11, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var r = 0; r < 9; r++) for (var k = 0; k < 9; k++) { c.beginPath(); c.ellipse((k + .5) * w / 9, (r + .5) * h / 9, w / 22, h / 22, PI / 4, 0, 7); c.fill(); } })), -T / 2, true));
    var xs = gio.map(function (q) { return q.x; }), x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    [x0, x1].forEach(function (x, i) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = (i ? 1 : -1) * PI / 2; l.position.set(x + (i ? .01 : -.01), C[1], 0); g.add(l); });
    g.children.forEach(function (m) { m.position.x -= C[0]; m.position.y -= C[1]; });
    return { g: g, rong: x1 - x0, xo: 'xuyen', cao: 6, uoc: 6.5 };
  };

  /* ---------- MẶT CHARM LẤY TỪ ẢNH THẬT (charm-anh/<tên>.webp: RGBA, lỗ lộng trong suốt; -noi: nổi chi tiết) — dáng ngoài r(θ) đo từ ảnh ---------- */
  var VIEN_MAT = {"25808": {"lo": [0.7183323, -0.0009963, 1.9138923], "S": 9.963, "r": [4.626, 4.594, 4.541, 4.471, 4.382, 4.289, 4.229, 4.247, 4.344, 4.466, 4.583, 4.684, 4.77, 4.841, 4.888, 4.915, 4.924, 4.906, 4.868, 4.83, 4.775, 4.694, 4.599, 4.513, 4.459, 4.424, 4.377, 4.321, 4.274, 4.239, 4.214, 4.198, 4.193, 4.198, 4.214, 4.234, 4.203, 3.955, 3.564, 3.607, 4.138, 4.559, 4.746, 4.867, 4.98, 5.048, 4.924, 4.65, 4.513, 4.51, 4.516, 4.512, 4.497, 4.457, 4.393, 4.317, 4.255, 4.242, 4.301, 4.402, 4.492, 4.546, 4.571, 4.582, 4.583, 4.582, 4.571, 4.537, 4.49, 4.44, 4.376, 4.283, 4.169, 4.047, 3.929, 3.851, 3.848, 3.917, 4.023, 4.13, 4.213, 4.265, 4.3, 4.326, 4.342, 4.345, 4.336, 4.318, 4.283, 4.231, 4.171, 4.112, 4.068, 4.031, 3.996, 3.975, 3.968, 3.967, 3.978, 4.008, 4.057, 4.128, 4.22, 4.335, 4.473, 4.617, 4.696, 4.648, 4.516, 4.382, 4.283, 4.212, 4.16, 4.135, 4.149, 4.185, 4.223, 4.272, 4.329, 4.38, 4.431, 4.484, 4.527, 4.563, 4.6, 4.629, 4.64, 4.639]}, "25808-lung": {"lo": [0.16432632, 3.33228816, 0.5408208], "S": 10.4, "r": [4.555, 4.656, 4.736, 4.792, 4.824, 4.831, 4.817, 4.788, 4.741, 4.68, 4.601, 4.499, 4.379, 4.261, 4.18, 4.163, 4.185, 4.208, 4.217, 4.213, 4.192, 4.155, 4.103, 4.038, 3.97, 3.952, 4.043, 4.199, 4.338, 4.427, 4.47, 4.482, 4.473, 4.439, 4.397, 4.406, 4.519, 4.691, 4.86, 5.016, 5.165, 5.291, 5.373, 5.404, 5.41, 5.41, 5.41, 5.41, 5.41, 5.41, 5.403, 5.319, 4.945, 4.346, 4.021, 3.997, 4.048, 4.103, 4.148, 4.176, 4.189, 4.19, 4.182, 4.161, 4.126, 4.076, 4.01, 3.926, 3.822, 3.722, 3.676, 3.727, 3.855, 3.991, 4.106, 4.199, 4.255, 4.27, 4.27, 4.27, 4.268, 4.263, 4.252, 4.242, 4.228, 4.205, 4.175, 4.148, 4.121, 4.095, 4.081, 4.088, 4.117, 4.167, 4.24, 4.339, 4.472, 4.63, 4.756, 4.777, 4.7, 4.589, 4.496, 4.43, 4.382, 4.348, 4.331, 4.333, 4.353, 4.388, 4.436, 4.495, 4.557, 4.621, 4.686, 4.744, 4.791, 4.823, 4.836, 4.821, 4.779, 4.714, 4.627, 4.514, 4.396, 4.334, 4.362, 4.449]}, "25811": {"lo": [-1.0096777716279068, 0.40993591395348833, 2.141774761395349], "S": 11.231, "r": [5.018, 5.093, 5.173, 5.253, 5.308, 5.326, 5.315, 5.279, 5.213, 5.123, 5.022, 4.916, 4.807, 4.678, 4.505, 4.342, 4.258, 4.232, 4.217, 4.205, 4.192, 4.177, 4.164, 4.178, 4.26, 4.397, 4.512, 4.581, 4.639, 4.698, 4.757, 4.814, 4.859, 4.881, 4.882, 4.862, 4.824, 4.776, 4.724, 4.662, 4.591, 4.532, 4.514, 4.549, 4.615, 4.683, 4.745, 4.794, 4.821, 4.825, 4.815, 4.794, 4.759, 4.711, 4.657, 4.593, 4.524, 4.452, 4.376, 4.338, 4.392, 4.516, 4.624, 4.735, 4.891, 5.022, 5.109, 5.175, 5.217, 5.247, 5.278, 5.312, 5.327, 5.333, 5.345, 5.376, 5.411, 5.357, 5.051, 4.59, 4.338, 4.311, 4.365, 4.453, 4.545, 4.594, 4.574, 4.507, 4.435, 4.385, 4.374, 4.392, 4.406, 4.401, 4.398, 4.419, 4.461, 4.519, 4.595, 4.689, 4.815, 4.934, 4.97, 4.929, 4.849, 4.79, 4.78, 4.761, 4.709, 4.662, 4.624, 4.616, 4.715, 4.892, 5.035, 5.132, 5.232, 5.312, 5.358, 5.386, 5.395, 5.376, 5.33, 5.255, 5.157, 5.055, 4.98, 4.968]}, "25811-lung": {"lo": [-0.14857702468085104, 1.2855142570212765, 0.48018371744680843], "S": 10.766, "r": [4.962, 4.945, 4.897, 4.824, 4.746, 4.659, 4.536, 4.39, 4.249, 4.147, 4.112, 4.109, 4.101, 4.087, 4.075, 4.055, 4.018, 3.998, 4.048, 4.157, 4.294, 4.435, 4.559, 4.66, 4.74, 4.792, 4.822, 4.854, 4.895, 4.932, 4.948, 4.941, 4.922, 4.891, 4.85, 4.799, 4.745, 4.719, 4.762, 4.86, 4.967, 5.059, 5.132, 5.183, 5.213, 5.222, 5.21, 5.178, 5.128, 5.065, 4.992, 4.912, 4.831, 4.756, 4.715, 4.734, 4.79, 4.853, 4.914, 4.967, 5.0, 5.006, 4.99, 4.961, 4.918, 4.864, 4.812, 4.767, 4.733, 4.709, 4.692, 4.681, 4.68, 4.701, 4.747, 4.819, 4.904, 4.956, 4.933, 4.852, 4.768, 4.691, 4.635, 4.629, 4.642, 4.64, 4.654, 4.695, 4.745, 4.8, 4.86, 4.915, 4.961, 4.984, 4.97, 4.917, 4.864, 4.849, 4.833, 4.793, 4.75, 4.686, 4.618, 4.617, 4.682, 4.792, 4.923, 5.02, 5.077, 5.115, 5.13, 5.114, 5.061, 4.988, 4.95, 4.946, 4.911, 4.831, 4.728, 4.652, 4.647, 4.67, 4.681, 4.709, 4.773, 4.844, 4.907, 4.951]}, "25798": {"lo": [-0.6770375581395349, 0.5964576279069768, 0.7468181162790698], "S": 8.307, "r": [2.855, 2.763, 2.612, 2.528, 2.513, 2.506, 2.503, 2.547, 2.654, 2.782, 2.947, 3.172, 3.36, 3.419, 3.351, 3.237, 3.178, 3.173, 3.182, 3.185, 3.179, 3.167, 3.188, 3.294, 3.461, 3.577, 3.592, 3.557, 3.519, 3.489, 3.469, 3.457, 3.453, 3.457, 3.469, 3.487, 3.51, 3.543, 3.598, 3.665, 3.737, 3.82, 3.917, 4.027, 4.148, 4.25, 4.304, 4.319, 4.321, 4.321, 4.321, 4.321, 4.319, 4.308, 4.279, 4.22, 4.123, 3.989, 3.797, 3.493, 3.137, 2.892, 2.733, 2.58, 2.44, 2.351, 2.325, 2.329, 2.322, 2.294, 2.26, 2.228, 2.215, 2.223, 2.235, 2.247, 2.258, 2.263, 2.265, 2.269, 2.278, 2.283, 2.274, 2.268, 2.28, 2.319, 2.374, 2.417, 2.412, 2.345, 2.218, 2.077, 1.996, 2.004, 2.081, 2.165, 2.241, 2.329, 2.402, 2.459, 2.531, 2.629, 2.733, 2.911, 3.256, 3.637, 3.827, 3.838, 3.818, 3.858, 3.94, 4.022, 4.084, 4.119, 4.14, 4.184, 4.259, 4.279, 4.159, 3.903, 3.645, 3.414, 3.177, 2.984, 2.884, 2.848, 2.84, 2.858]}, "23835": {"lo": [-0.8809661578378378, 1.301752838918919, 1.7592464432432433], "S": 8.953, "r": [4.098, 4.122, 4.144, 4.166, 4.182, 4.188, 4.205, 4.233, 4.252, 4.262, 4.292, 4.341, 4.379, 4.401, 4.404, 4.382, 4.341, 4.285, 4.217, 4.149, 4.103, 4.072, 4.035, 3.987, 3.949, 3.92, 3.88, 3.835, 3.816, 3.82, 3.829, 3.822, 3.8, 3.817, 3.883, 3.941, 3.977, 4.007, 4.035, 4.062, 4.095, 4.138, 4.187, 4.236, 4.276, 4.298, 4.299, 4.286, 4.261, 4.226, 4.181, 4.13, 4.086, 4.047, 4.017, 4.015, 4.023, 4.019, 3.999, 3.96, 3.925, 3.919, 3.936, 3.955, 3.975, 4.007, 4.062, 4.115, 4.13, 4.114, 4.103, 4.136, 4.228, 4.302, 4.309, 4.312, 4.335, 4.355, 4.355, 4.338, 4.309, 4.279, 4.259, 4.257, 4.253, 4.208, 4.136, 4.082, 4.047, 4.008, 3.95, 3.899, 3.881, 3.881, 3.888, 3.902, 3.922, 3.935, 3.923, 3.909, 3.94, 4.003, 4.068, 4.126, 4.179, 4.228, 4.26, 4.263, 4.255, 4.269, 4.297, 4.316, 4.32, 4.304, 4.261, 4.197, 4.118, 4.039, 3.995, 3.985, 4.007, 4.054, 4.078, 4.073, 4.063, 4.059, 4.063, 4.077]}};
  function matAnh(ten) { _tl = _tl || new THREE.TextureLoader(); var t = _tl.load('charm-anh/' + ten + '.webp'), b = _tl.load('charm-anh/' + ten + '-noi.webp'); t.colorSpace = THREE.SRGBColorSpace; b.colorSpace = THREE.NoColorSpace; t.anisotropy = 8;
    return new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: .42, metalness: .35, roughness: .38, bumpMap: b, bumpScale: 3, alphaTest: .5, transparent: false, side: THREE.DoubleSide }); }
  var VM_DX = { '25808': 1, '25811': 0 };   /* 1 = đối xứng trái/phải */
  function vienMat(ten, co) { var d = VIEN_MAT[ten], N = d.r.length, r = d.r.slice(), p = [], i, j;
    if (VM_DX[ten]) r = r.map(function (v, i2) { return (v + r[(N / 2 - i2 + N) % N]) / 2; });   /* r(θ) và r(π−θ) */
    for (var lap = 0; lap < 3; lap++) r = r.map(function (v, i2) { var sum = 0; for (j = -2; j <= 2; j++) sum += r[(i2 + j + N) % N]; return sum / 5; });   /* làm mượt mép */
    for (i = 0; i < N; i++) { var t = i / N * PI * 2; p.push(new V2(Math.cos(t) * (r[i] - (co || 0)), Math.sin(t) * (r[i] - (co || 0)))); } return p; }
  function matPhangAnh(ten, z, lat) { var d = VIEN_MAT[ten], sh = new THREE.Shape(vienMat(ten, 0)), g = new THREE.ShapeGeometry(sh, 2), ps = g.attributes.position, uv = [];
    for (var i = 0; i < ps.count; i++) uv.push(ps.getX(i) / d.S + .5, ps.getY(i) / d.S + .5); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    var m = new THREE.Mesh(g, matAnh(ten)); m.position.z = z; if (lat) { m.rotation.y = PI; } return m; }
  function charmAnh(o) {   /* o.ten (mặt trước), o.lung (ảnh lưng, tuỳ), o.T dày, o.trai [x,y,r] ngọc trai nổi; trả về group mặt trước +z */
    var g = new THREE.Group(), T = o.T || 2, p = vienMat(o.ten, .02);
    var than = khoi(p, 0, 0, hoSo(T, Math.min(.4, T / 3)), o.vlThan || VL.vang); than.position.z = T / 2; g.add(than);
    g.add(matPhangAnh(o.ten, T / 2 + .02));
    if (o.lung) { var l = matPhangAnh(o.lung, -T / 2 - .02, true); l.scale.x = VIEN_MAT[o.ten].S / VIEN_MAT[o.lung].S; l.scale.y = l.scale.x; g.add(l); }
    if (o.trai) { var tr = new THREE.Mesh(new THREE.SphereGeometry(o.trai[2], 36, 24), VL.trai); tr.scale.z = .75; tr.position.set(o.trai[0], o.trai[1], T / 2 + o.trai[2] * .45); g.add(tr);
      var vo = khoen(o.trai[2] * 1.02, .13, VL.vang); vo.position.set(o.trai[0], o.trai[1], T / 2 + .1); g.add(vo); }
    var ys = p.map(function (q) { return q.y; }), xs = p.map(function (q) { return q.x; });
    g.userData.top = Math.max.apply(null, ys); g.userData.rong = Math.max.apply(null, xs) - Math.min.apply(null, xs); g.userData.cao = g.userData.top - Math.min.apply(null, ys);
    return g;
  }
  /* ---------- dựng tay theo dáng đo từ ảnh (VIEN_MAT chỉ dùng làm đường viền) ---------- */
  function xoanDay(g, cx, cy, r0, r1, vong, a0, chieu, rTube, z, vl) {   /* dây vàng cuộn xoắn ốc nổi */
    var pts = []; for (var t = 0; t <= 1.0001; t += .025) { var an = a0 + chieu * t * PI * 2 * vong, r = r0 + (r1 - r0) * t; pts.push(new V3(cx + Math.cos(an) * r, cy + Math.sin(an) * r, z + .05 * Math.sin(t * PI))); }
    var m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, rTube, 8), vl || VL.vang); g.add(m);
    var dau = new THREE.Mesh(new THREE.SphereGeometry(rTube * 1.25, 10, 8), vl || VL.vang); dau.position.copy(pts[pts.length - 1]); g.add(dau); return m;
  }
  function oTrai(g, x, y, r, z) { var de = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.06, r * 1.12, .7, 40), VL.vang); de.rotation.x = PI / 2; de.position.set(x, y, z + .2); g.add(de);
    var vo = khoen(r * 1.06, .13, VL.vang); vo.position.set(x, y, z + .56); g.add(vo);
    var tr = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), VL.trai); tr.scale.z = .82; tr.position.set(x, y, z + .55 + r * .35); g.add(tr); }
  /* ---------- nhóm Khác lô 3 ---------- */
  function lungSong(f, cy, z) {   /* lưng vàng chạm sóng nước (vảy chồng) viền hạt */
    var p = vienTu(f, 0, cy, 160), m = matPhang(p, 10, vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .14 * k; for (var r = 0; r < 9; r++) for (var q = -5; q <= 5; q++) { var cx = q * 1.0 + (r % 2) * .5, cy2 = -4 + r * .8; [.45, .28].forEach(function (rr) { c.beginPath(); c.arc(X(cx), Y(cy2), rr * k, PI, 0); c.stroke(); }); } }, 2), z, true); return m; }
  DS['25781'] = function () {   /* giọt lệ lục đế (xem 4 ảnh): lục đế cabochon giọt nước, viền vàng 2 bậc trơn bóng; lưng sóng nước viền hạt; khoen + xích ngắn + khoá lò xo → treo */
    var g = new THREE.Group(), f = giot(.82), cy = -.6;
    var de = khoi(vienTu(function (x, y) { return f(x, y) - .75; }, 0, cy, 200), 0, cy, hoSo(1.8, .35), VL.vang); de.position.z = .9; g.add(de);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) - .35; }, 0, cy, 200), .22, VL.vang, .95));
    var v = vom(vienTu(f, 0, cy, 200), 0, cy, 1.9, VL.lucde, null, 30); v.position.z = .9; g.add(v);
    g.add(lungSong(function (x, y) { return f(x, y) - .7; }, cy, -.92));
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .6; }, 0, cy, 200), .12, VL.vang, -.92));
    var top = dinhY(vienTu(f, 0, cy, 200)) + .75; xich(g, new V3(0, top + .3, 0), new V3(0, top + 2.6, 0), .3, VL.vang);
    var cao = moc(g, top + 2.6); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 6 };
  };
  DS['25798'] = function () {   /* chùm nho lục đế (xem kĩ 4 ảnh): đế vàng dáng đo từ ảnh; 3 hạt lục đế cabochon tròn to (trên-phải, giữa-trái, dưới-phải) mỗi hạt 4 chấu; 3 đá trắng nhỏ xen giữa; 2 lá nho vàng có răng cưa + gân nổi chồng nhau ở trên-trái, cuống cong lên khoen; khoen + khoá lò xo → treo */
    var g = new THREE.Group(), T = 1.3, p = vienMat('25798', .25);
    var de = khoi(p, 0, 0, hoSo(T, .3), VL.vangMo); de.position.z = T / 2 - .3; g.add(de);
    [[1.25, 1.75], [-.6, -.45], [2.0, -1.65]].forEach(function (q) { var o = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.36, .7, 32), VL.vang); o.rotation.x = PI / 2; o.position.set(q[0], q[1], .55); g.add(o);
      var v = vien(1.2, VL.lucde, .78); v.position.set(q[0], q[1], .95); g.add(v);
      for (var i = 0; i < 4; i++) { var a = PI / 4 + i * PI / 2, ch = new THREE.Mesh(new THREE.ConeGeometry(.14, .6, 6), VL.vang); ch.position.set(q[0] + Math.cos(a) * 1.22, q[1] + Math.sin(a) * 1.22, 1.15); ch.rotation.set(-Math.sin(a) * .6, Math.cos(a) * .6, 0); ch.rotation.x += PI / 2; g.add(ch); } });
    g.add(hangKc(.24, [[.55, .55, .95, 0, 0, 1], [2.3, .35, .95, 0, 0, 1], [.75, -1.7, .95, 0, 0, 1], [-.1, -2.0, .9, 0, 0, 1]]));
    function la(x, y, s2, goc) { var f = function (u, v) { var d = tron(u, v, 0, 0, 1.05); for (var k = 0; k < 5; k++) { var b = k / 5 * PI * 2 + PI / 2; d = hop(d, tron(u, v, Math.cos(b) * .78, Math.sin(b) * .78, .5), .25); } return d + .06 * Math.abs(Math.sin(Math.atan2(v, u) * 15)); };
      var vl = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .16 * k; for (var q2 = 0; q2 < 5; q2++) { var b = q2 / 5 * PI * 2 + PI / 2; c.beginPath(); c.moveTo(X(0), Y(-.2)); c.lineTo(X(Math.cos(b) * 1.3), Y(Math.sin(b) * 1.3)); c.stroke();
        for (var t = .35; t < 1.15; t += .25) [-1, 1].forEach(function (sd) { c.beginPath(); c.moveTo(X(Math.cos(b) * t), Y(Math.sin(b) * t)); c.lineTo(X(Math.cos(b + sd * .45) * (t + .22)), Y(Math.sin(b + sd * .45) * (t + .22))); c.stroke(); }); } }, 3);
      var t = new THREE.Group(), lv = khoi(vienTu(f, 0, 0, 160), 0, 0, hoSo(.45, .15), vl); lv.position.z = .45; t.add(lv);
      var vm = vom(vienTu(f, 0, 0, 160), 0, 0, .35, vl, null, 14); vm.position.z = .45; t.add(vm);
      t.scale.setScalar(s2); t.rotation.z = goc; t.position.set(x, y, .45); g.add(t); }
    la(-1.55, 2.0, 1.25, .35); la(-2.35, .35, .95, -.7);
    var cuong = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(-.2, 2.2, .9), new V3(.1, 3.0, .9), new V3(.0, 3.7, .6)]), 20, .17, 8), VL.vang); g.add(cuong);
    var top = 3.7; var cao = moc(g, top); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 8 };
  };
  DS['25808'] = function () {   /* khánh bình an ngọc trai (xem kĩ 4 ảnh): tấm khoá như ý vàng chải mờ — dáng đo từ ảnh (2 thuỳ tròn trên, lõm giữa, nhọn đáy); gờ viền nổi bóng chạy quanh mép; 2 cuộn mây xoắn ở 2 vai cạnh chỗ lõm; ngọc trai to trong ổ trơn lệch phải-dưới; lưng 7 mây như ý nổi (3-1-3); khoen + khoá lò xo → treo */
    function fk(x, y) { var ax = Math.abs(x), d = tron(ax, y, 1.45, 1.2, 1.85); d = hop(d, tron(ax, y, 2.1, -.35, 1.6), 1.0); d = hop(d, Math.max(ax + (-.5 - y) * .6 - 2.8, y - .5, -y - 4.0 + ax * .28), 1.2); d = Math.max(d, .3 - Math.hypot(x, y - 3.25)); return hop(d, tron(x, y, 0, 2.8, .42), .35); }   /* khoá như ý gọn: 2 thuỳ tròn trên, lõm nhỏ giữa đỉnh, 2 sườn phình tròn, đáy thu nhọn tròn */   /* khoá như ý: 2 thuỳ tròn trên (lõm giữa), 2 cánh phình 2 bên, thu nhọn tròn ở đáy */   /* khoá như ý: 2 vai tròn, sườn phình, thu nhọn đáy, núm giữa đỉnh */
    function vk(co) { return vienTu(function (x, y) { return fk(x, y) + (co || 0); }, 0, -.5, 220); }
    var g = new THREE.Group(), T = 1.3, p = vk(0), vl = new THREE.MeshStandardMaterial({ color: 0xf2bf4f, metalness: 1, roughness: .48, bumpMap: VAN.dan, bumpScale: .12 });
    var than = khoi(p, 0, 0, hoSo(T, .35), vl); than.position.z = T / 2; g.add(than);
    g.add(ongVien(vk(.18), .18, VL.vang, T / 2 + .02)); g.add(ongVien(vk(.62), .13, VL.vang, T / 2 + .02));   /* gờ viền kép: mép + chỉ trong */
    xoanDay(g, -1.05, 2.25, .1, .6, 1.35, -.3, 1, .19, T / 2 + .05); xoanDay(g, 1.05, 2.25, .1, .6, 1.35, PI + .3, -1, .19, T / 2 + .05);   /* 2 cuộn mây ôm chỗ lõm giữa đỉnh */   /* 2 cuộn mây vai */
    oTrai(g, 0, -.95, 2.05, T / 2 - .1);   /* ngọc trai chính giữa (ảnh chụp nghiêng nên trông lệch) */
    var lung = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(vk(.1)), 2), vanRieng(function (c, X, Y, k) { c.fillStyle = '#fff';
      function may(x, y, s2) { c.beginPath(); c.arc(X(x), Y(y + .1 * s2), .32 * s2 * k, 0, 7); c.fill(); [-1, 1].forEach(function (q) { c.beginPath(); c.arc(X(x + q * .38 * s2), Y(y), .26 * s2 * k, 0, 7); c.fill(); }); c.beginPath(); c.moveTo(X(x - .35 * s2), Y(y - .15 * s2)); c.lineTo(X(x), Y(y - .7 * s2)); c.lineTo(X(x + .35 * s2), Y(y - .15 * s2)); c.fill(); }
      [[-2.2, 2.2], [0, 2.3], [2.2, 2.2], [0, .5], [-2.0, -.6], [2.0, -.6], [0, -1.9]].forEach(function (q) { may(q[0], q[1], 1.05); }); }, 2.6));
    var uv = [], ps = lung.geometry.attributes.position; for (var i = 0; i < ps.count; i++) uv.push(ps.getX(i) / 10 + .5, ps.getY(i) / 10 + .5); lung.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    lung.rotation.y = PI; lung.position.z = -T / 2 - .01; g.add(lung);
    var top = dinhY(p); var cao = moc(g, top - .2); return { g: g, rong: 1.6, xo: 'treo', cao: cao + top + 5 };
  };
  var lungHoaTim = lungLong(function (c) { c.strokeStyle = '#fff'; c.lineWidth = .4; c.beginPath(); c.arc(0, 0, 4.4, 0, 7); c.stroke(); for (var k = 0; k < 4; k++) { c.save(); c.rotate(k * PI / 2); c.beginPath(); c.ellipse(0, 1.3, .8, 1.3, 0, 0, 7); c.stroke(); c.restore(); } for (k = 0; k < 12; k++) { c.save(); c.rotate(k * PI / 6); c.beginPath(); c.moveTo(0, 2.8); c.lineTo(0, 4.4); c.stroke(); c.restore(); } });
  DS['25811'] = function () {   /* nút hoa ngọc trai (xem kĩ 4 ảnh): dáng hoa 8 thuỳ đo từ ảnh; mép là 2 dây hạt (milgrain) nổi; giữa viền và ổ ngọc là vòng dây lộng cuộn chữ C/S (khe hở thật); ngọc trai to ổ trơn hơi lệch; lưng lộng hoa 4 cánh; thành lỗ đồng xu; xỏ qua 2 sườn */
    var fH = cungHoa(8, 4.55, .5, PI / 8), T = 3.6, PX = 0, PY = 0, RP = 2.85;   /* 8 thuỳ đều, đối xứng — ảnh chụp nghiêng nên viền đo bị méo */
    function vh(co) { return vienTu(function (x, y) { return fH(x, y) + co; }, 0, 0, 240); }
    var g = new THREE.Group(), p = vh(0);
    g.add(thanhVien(vh(.05), T, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 10; k++) { c.beginPath(); c.ellipse((k + .5) * w / 10, h / 2, w / 34, h * .28, 0, 0, 7); c.fill(); } })), 1));
    g.add(chuoiHat(vh(.12), .17, VL.vang, T / 2)); g.add(chuoiHat(vh(.5), .13, VL.vang, T / 2 - .1)); g.add(chuoiHat(vh(.12), .15, VL.vang, -T / 2));
    var nen = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(vh(.3)), 2), new THREE.MeshStandardMaterial({ color: 0x6e4a14, metalness: .8, roughness: .6 })); nen.position.z = T / 2 - 1.3; g.add(nen);   /* đáy tối sâu → vòng dây lộng trông xuyên thấu */
    g.add(vienRen(vh(.95), .62, .1, 18, VL.vang, T / 2 - .35));   /* vòng dây hạt lộng chạy quanh mép */
    for (var k = 0; k < 16; k++) { var a = (k + .5) / 16 * PI * 2; xoanDay(g, Math.cos(a) * (RP + 1.0), Math.sin(a) * (RP + 1.0), .08, .38, 1.1, a, k % 2 ? 1 : -1, .09, T / 2 - .45); }   /* cuộn nhỏ trong lòng */
    [RP + .3, RP + .55].forEach(function (rr, i) { g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - rr; }, 0, 0, 80), i ? .12 : .15, VL.vang, T / 2 - .15)); });   /* 2 vòng dây hạt quanh ổ ngọc */
    oTrai(g, PX, PY, RP, T / 2 - .4);
    var lung = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(vh(.1)), 2), longVang(lungHoaTim)); var ps = lung.geometry.attributes.position, uv = []; for (var i = 0; i < ps.count; i++) uv.push(ps.getX(i) / 11 + .5, ps.getY(i) / 11 + .5); lung.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    lung.rotation.y = PI; lung.position.z = -T / 2; g.add(lung);
    var xs = p.map(function (q) { return q.x; }); [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg > 0 ? Math.max.apply(null, xs) + .02 : Math.min.apply(null, xs) - .02; g.add(l); });
    return { g: g, rong: Math.max.apply(null, xs) - Math.min.apply(null, xs), xo: 'xuyen', cao: 10, uoc: 9.5 };
  };
  DS['25862'] = function () {   /* khiêm treo / hoa huệ (xem 4 ảnh): cánh giữa thuôn dài như giọt (dài ≈ 2/3), 2 cánh bên cong cuộn ra, cánh ngắn phía khoen; đai ngang đính 3 đá trắng; khoen ở đầu cánh ngắn → treo */
    var g = new THREE.Group(), vv = VL.vang;
    var dai = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), vv); dai.scale.set(.85, 2.6, .7); dai.position.y = -2.6; g.add(dai);   /* cánh giữa */
    var ngan = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), vv); ngan.scale.set(.6, 1.1, .55); ngan.position.y = 1.1; g.add(ngan);
    [-1, 1].forEach(function (sg) { var pts = [new V3(sg * .4, -.2, 0), new V3(sg * 1.4, -.5, 0), new V3(sg * 2.0, .4, 0), new V3(sg * 1.6, 1.0, 0), new V3(sg * 1.25, .6, 0)];
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, .32, 10), vv)); var dot = new THREE.Mesh(new THREE.SphereGeometry(.33, 10, 8), vv); dot.position.copy(pts[4]); g.add(dot);
      var pts2 = pts.map(function (p) { return new V3(p.x, -p.y - .4, 0); }); g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 30, .32, 10), vv)); var d2 = new THREE.Mesh(new THREE.SphereGeometry(.33, 10, 8), vv); d2.position.copy(pts2[4]); g.add(d2); });   /* 2 cặp cánh cong cuộn */
    var dk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, .9), vv); dk.position.y = -.2; g.add(dk);
    g.add(hangKc(.26, [[0, .45, .5, 0, 0, 1], [0, -.2, .5, 0, 0, 1], [0, -.85, .5, 0, 0, 1]]));
    var cao = mocDon(g, 2.2); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 5.2 };
  };
  DS['25384'] = function () {   /* tháp phật (xem 4 ảnh): tháp chuông 3 tầng, mỗi tầng hàng cửa vòm cung nổi, đỉnh tròn; đáy là đĩa chạm lộng hoa sen nhiều cánh viền răng, giữa ruby; khoen ở đỉnh → treo */
    var g = new THREE.Group(), i, pf0 = [[.3, 5.2], [1.0, 5.0], [1.5, 4.3], [1.6, 3.6], [2.3, 3.3], [2.4, 2.4], [3.1, 2.1], [3.2, .9], [3.6, .6], [3.6, 0], [.1, 0]], pf = [];
    for (i = 0; i < pf0.length - 1; i++) for (var q = 0; q < 8; q++) { var t = q / 8; pf.push([pf0[i][0] + (pf0[i + 1][0] - pf0[i][0]) * t, pf0[i][1] + (pf0[i + 1][1] - pf0[i][1]) * t]); } pf.push(pf0[pf0.length - 1]);   /* profile dày điểm để khắc cửa vòm */
    g.add(xoayLuoi(pf, 160, function (r, y, a, j) { var tang = y > 3.4 ? 0 : y > 2.2 ? 1 : 2, so = [6, 8, 10][tang], y0 = [3.6, 2.4, .9][tang], h = [1.2, 1.1, 1.3][tang];
      if (y < .5 || j === pf.length - 1) return r; var u = (a / (PI * 2) * so) % 1, du = Math.abs(u - .5), dy = (y - (y0 - h * .1)) / h; return r + (du < .38 && dy < .75 && dy > -.1 ? .32 * Math.sqrt(Math.max(0, 1 - Math.pow(du / .38, 2))) * (dy > .45 ? Math.cos((dy - .45) / .3 * PI / 2) : 1) : 0); }, VL.vang));   /* cửa vòm nổi */
    var day = new THREE.Mesh(new THREE.CircleGeometry(3.5, 48), longVang(vanLong(function (c, w, h) { c.save(); c.translate(w / 2, h / 2); c.scale(w / 7.2, w / 7.2); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 3.6, 0, 7); c.fill(); c.fillStyle = '#000'; for (var k = 0; k < 8; k++) { c.save(); c.rotate(k * PI / 4); c.beginPath(); c.ellipse(0, 2.1, .5, .9, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(0, 1.0, .3, .45, 0, 0, 7); c.fill(); c.restore(); } c.restore(); })));
    day.rotation.x = PI / 2; day.position.y = .02; g.add(day); g.add(vongHat(3.5, .1, .15, VL.vang));
    var rb = vien(.4, VL.ruby, .7); rb.rotation.x = PI / 2; rb.position.y = -.05; g.add(rb);
    g.position.y = -5.2; var b = new THREE.Group(); b.add(g); var cao = mocDon(b, 0); return { g: b, rong: 1.6, xo: 'treo', cao: cao + 5.2 };
  };
  DS['25869'] = function () {   /* tròn đính đá trái tim (xem 3 ảnh): đĩa vàng vòm phồng chải xước, giữa đá trắng trái tim, 6 đá trắng nhỏ chìm quanh; khoen → treo */
    var g = new THREE.Group(), vl = new THREE.MeshStandardMaterial({ color: 0xedbd5c, metalness: 1, roughness: .45, bumpMap: VAN.dan, bumpScale: .4 });
    var d = new THREE.Mesh(new THREE.SphereGeometry(3.4, 48, 24, 0, PI * 2, 0, PI / 2), vl); d.rotation.x = PI / 2; d.scale.y = .45; g.add(d);
    var l = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), vl); l.rotation.y = PI; g.add(l);
    var tim = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(timDuong(1.25, 24).reverse()), { depth: .25, bevelEnabled: true, bevelThickness: .45, bevelSize: .28, bevelSegments: 1, curveSegments: 6 }).toNonIndexed(), VL.kc); tim.geometry.computeVertexNormals(); tim.position.z = 1.45; g.add(tim);   /* soát: đá giác hình TRÁI TIM như ảnh (trước là đá tròn) */
    var ds = []; for (var i = 0; i < 6; i++) { var a = PI / 2 + i / 6 * PI * 2, r = 2.3, z = 1.53 * Math.sqrt(1 - Math.pow(r / 3.4, 2)); ds.push([Math.cos(a) * r, Math.sin(a) * r, z, Math.cos(a) * .4, Math.sin(a) * .4, 1]); } g.add(hangKc(.27, ds));
    var cao = mocDon(g, 3.4); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 3.4 };
  };
  DS['23835'] = function () {   /* lục đế xoáy (xem kĩ 4 ảnh): hạt vuông bo tròn như gối (dáng đo từ ảnh), mặt nổi phồng; quanh lục đế là 2 lớp dây xoắn thừng xoáy chéo về tâm (như ổ chim); lục đế cabochon tròn to ổ trơn; lưng sọc cong xoáy ốc; xỏ qua 2 sườn */
    var g = new THREE.Group(), T = 4.0, i, k, p = vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - 2.0, 0), Math.max(Math.abs(y) - 2.0, 0)) - 2.0; }, 0, 0, 200);   /* vuông bo đều 4 góc */
    var than = khoi(p, 0, 0, hoSo(T, 1.3), VL.vang); than.position.z = T / 2; g.add(than);
    var R0 = 2.35, RE = 3.7;
    for (k = 0; k < 16; k++) { var pts = [], a0 = k / 16 * PI * 2;
      for (var t = 0; t <= 1.0001; t += .05) { var a = a0 + t * 1.5, r = R0 + (RE - R0) * t, x = Math.cos(a) * r, y = Math.sin(a) * r, sc = Math.min(1, 3.45 / Math.max(Math.abs(x), Math.abs(y))); pts.push(new V3(x * sc, y * sc, T / 2 + .55 - .75 * t * t)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, .27, 8), VL.vangDan)); }   /* dây thừng xoắn xoáy */
    var de = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.45, .8, 40), VL.vang); de.rotation.x = PI / 2; de.position.z = T / 2 + .3; g.add(de);
    var v = vien(2.15, VL.lucde, .78); v.position.z = T / 2 + .75; g.add(v);
    for (k = 0; k < 14; k++) { var pts2 = []; for (var t2 = 0; t2 <= 1.0001; t2 += .05) { var a2 = k / 14 * PI * 2 + t2 * 1.7, r2 = .6 + 3.3 * t2, x2 = Math.cos(a2) * r2 * .9, y2 = Math.sin(a2) * r2 * .9, sc2 = Math.min(1, 3.3 / Math.max(Math.abs(x2), Math.abs(y2)));   /* soát đợt 5: sợi lưng không thò ra ngoài viền */ pts2.push(new V3(x2 * sc2, y2 * sc2, -T / 2 - .05 + .3 * t2 * t2)); }
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 24, .2, 6), VL.vang)); }   /* lưng xoáy */
    var xs = p.map(function (q) { return q.x; }); [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg > 0 ? Math.max.apply(null, xs) + .02 : Math.min.apply(null, xs) - .02; g.add(l); });
    return { g: g, rong: Math.max.apply(null, xs) - Math.min.apply(null, xs), xo: 'xuyen', cao: 8.6, uoc: 8 };
  };
  /* ---------- nhóm Khác lô 4 (dựng tay, cân xứng) ---------- */
  DS['23816'] = function () {   /* ngọc trai viền (xem 3 ảnh): ngọc trai tròn to, đai vàng ôm quanh chu vi (mặt trước/sau lộ ngọc), đai có viền xoắn thừng 2 mép; 2 khoen xoắn thừng nhỏ ở 2 sườn = lỗ xỏ dọc */
    var g = new THREE.Group(), R = 3.3;
    var tr = new THREE.Mesh(new THREE.SphereGeometry(R, 48, 32), VL.trai); tr.scale.z = .82; g.add(tr);
    var dai = new THREE.Mesh(new THREE.CylinderGeometry(R + .12, R + .12, 1.3, 64, 1, true), hai(VL.vang)); dai.rotation.x = PI / 2; g.add(dai);
    [-.62, .62].forEach(function (z) { var t = new THREE.Mesh(new THREE.TorusGeometry(R + .16, .13, 8, 90), VL.vangDan); t.position.z = z; g.add(t); });
    [-1, 1].forEach(function (sg) { var k = new THREE.Mesh(new THREE.TorusGeometry(.62, .2, 10, 28), VL.vangDan); k.rotation.y = PI / 2; k.position.x = sg * (R + .55); g.add(k);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.42, 16), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (R + .78); g.add(l); });
    return { g: g, rong: 2 * R + 1.6, xo: 'xuyen', cao: 2 * R, uoc: 7 };
  };
  DS['23772'] = function () {   /* Di Lặc lục đế: MẶT NGỌC CHẠM LẤY TỪ ẢNH THẬT (kho_2), dáng đo từ ảnh lấy đối xứng trái/phải; ổ vàng khay trơn ôm sát, thành dày bóng; lưng vàng nổi chữ 福; xỏ dọc ngang qua 2 sườn */
    var w = new THREE.Group(), f = vienAnh('23772'), C = VIEN_ANH['23772'].c, vk = vienTu(f, C[0], C[1], 300), T = 3.2;
    var v = vom(vk, C[0], C[1], 1.7, ngocAnh('23772'), null, 60); v.position.z = T / 2 - .2; w.add(v);
    var vo = vienTu(function (x, y) { return f(x, y) - .35; }, C[0], C[1], 300);
    var de = khoi(vo, C[0], C[1], hoSo(T, .45), VL.vang); de.position.z = T / 2 - .05; w.add(de);
    var lung = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(vienTu(function (x, y) { return f(x, y) - .2; }, C[0], C[1], 200)), 2), vanRieng(function (c, X, Y, k) { c.save(); c.translate(X(C[0]), Y(C[1])); c.rotate(PI / 2); c.fillStyle = '#fff'; c.font = 'bold ' + (5.2 * k) + 'px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('福', 0, 0); c.restore(); }, 2.6));
    var ps = lung.geometry.attributes.position, uv = []; for (var i = 0; i < ps.count; i++) uv.push(ps.getX(i) / 10 + .5, ps.getY(i) / 10 + .5); lung.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    lung.rotation.y = PI; lung.position.z = -T / 2 - .06; w.add(lung);
    w.children.forEach(function (m) { m.position.x -= C[0]; m.position.y -= C[1]; });
    var g = new THREE.Group(); w.rotation.z = -PI / 2; g.add(w);   /* đầu Phật hướng lên */
    var ys = vo.map(function (q) { return q.y - C[1]; }), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    [y0, y1].forEach(function (yy, i2) { var sg = i2 ? -1 : 1, l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.set(sg * (Math.abs(i2 ? y0 : y1) * 0 + (i2 ? -y1 : -y0)) * 1, 0, 0); l.position.x = i2 ? -y1 - .02 : -y0 + .02; l.rotation.y = i2 ? -PI / 2 : PI / 2; g.add(l); });
    return { g: g, rong: y1 - y0, xo: 'xuyen', cao: 8, uoc: 8.5 };
  };
  DS['25877'] = function () {   /* quạt ba tiêu (xem 4 ảnh): tấm quạt cân xứng — cuống hẹp trên, thân loe tròn, 2 thuỳ tròn ở đáy (lõm nhẹ giữa); mặt phủ kín đá trắng nhỏ, giữa là gân lá vàng (gân dọc + gân xiên chữ V) nổi; lưng vàng trơn khoét rãnh lá; cổ vuông + khoen → treo */
    var g = new THREE.Group(), T = 1.6, i;
    var f = function (x, y) { var ax = Math.abs(x), d = Math.min(tron(ax, y, 1.05, 1.45, 1.5), tron(ax, y, 1.3, -1.75, 1.75)); d = hop(d, elip(x, y, 0, -.1, 1.9, 2.8), .9); return d; };   /* 4 thuỳ: 2 vai tròn trên, eo nhẹ, 2 thuỳ to dưới */
    var vk = vienTu(f, 0, 0, 240), de = khoi(vk, 0, 0, hoSo(T, .3), VL.vang); de.position.z = T / 2; g.add(de);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) - .15; }, 0, 0, 240), .14, VL.vang, T / 2 + .02));
    function gan(A, B, r) { g.add(ongTay([A, B], 0, r, VL.vang)); }
    gan(new V3(0, 3.0, T / 2 + .1), new V3(0, -2.6, T / 2 + .1), .2);
    var gv = [];
    for (i = 0; i < 6; i++) { var y = 2.4 - i * .85; [-1, 1].forEach(function (sg) { var A = new V3(0, y, T / 2 + .1), B = new V3(sg * (1.55 + .25 * Math.sin(i * .8)), y - .9, T / 2 + .1); gan(A, B, .12); gv.push([A, B]); }); }
    function ganGan(x, y) { var best = 9; gv.concat([[new V3(0, 3, 0), new V3(0, -2.6, 0)]]).forEach(function (s2) { var ax = s2[1].x - s2[0].x, ay = s2[1].y - s2[0].y, t = Math.max(0, Math.min(1, ((x - s2[0].x) * ax + (y - s2[0].y) * ay) / (ax * ax + ay * ay))); best = Math.min(best, Math.hypot(x - s2[0].x - ax * t, y - s2[0].y - ay * t)); }); return best; }
    var ds = []; for (var yy = -3.8; yy < 3.8; yy += .52) for (var xx = -3.4; xx < 3.4; xx += .55) { var x2 = xx + (Math.round(yy / .52) % 2 ? .27 : 0); if (f(x2, yy) < -.36 && ganGan(x2, yy) > .32) ds.push([x2, yy, T / 2 + .14, 0, 0, 1]); }
    g.add(hangKc(.25, ds));   /* soát đợt 5: đá to hơn như ảnh */   /* pavé dày kín như ảnh */   /* đá trắng pavé */
    var co = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, .8), VL.vang); co.position.set(0, 4.0, .4); g.add(co);
    var top = 4.6; var cao = mocDon(g, top); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 4 };
  };
  DS['25873'] = function () {   /* treo đính đá trắng (xem 4 ảnh): ổ vàng tròn dày bo tròn (như cái chén), đá trắng giác tròn chìm giữa, gờ trong bậc; khoen nhỏ + khoen tròn → treo */
    var g = new THREE.Group(), R = 2.6;
    var chen = xoayLuoi([[0, -.9], [R - .6, -1.0], [R - .1, -.75], [R, -.2], [R - .1, .5], [R - .45, .85], [R - .7, .8], [R - .75, .5], [R - .95, .45], [R - 1.0, .3], [0, .3]], 96, null, VL.vang); chen.rotation.x = PI / 2; g.add(chen);
    var kc = new THREE.Mesh(kcGeo(1.45), VL.kc); kc.position.z = .5; g.add(kc);
    var cao = mocDon(g, R - .1); return { g: g, rong: 1.6, xo: 'treo', cao: cao + R };
  };
  DS['25843'] = function () {   /* nơ vàng (soát lại 4 ảnh): nơ cân xứng — 2 tai nơ là dải ruy băng PHỒNG (không phải quả trứng), mép viền hạt milgrain, nếp gấp chụm về nút;
     nút thắt giữa tròn phồng viền hạt; 2 đuôi nơ dày xoè xuống có nếp + viền hạt; đúc liền khối; khoen trên */
    var g = new THREE.Group();
    var tai2 = function (x, y) { var ax = Math.abs(x); return hop(elip(ax, y, 1.95, .55, 1.65, 1.3, -.2), elip(ax, y, .7, .45, .7, .55), .5); };
    var duoi2 = daGiacSdf([[.15, -.2], [.75, -.1], [1.95, -2.35], [1.55, -2.7], [1.15, -2.45], [.75, -2.75], [.2, -.6]]);
    function f(x, y, z) { var ax = Math.abs(x), d = phong(x, y, z - .25, tai2(x, y), 1.2, 1.05, .45);
      var a = Math.atan2(y - .5, ax - .4); d += ranh(Math.sin((a + .1) * 4.2), .2, .3) * Math.max(0, Math.min(1, (ax - .8) / .7)) * (z > .1 ? 1 : 0);   /* nếp gấp chụm về nút (sâu) */
      var dd = Math.max(duoi2(ax, y), Math.abs(z - .1) - .32); dd += ranh(Math.sin((ax * 1.6 + y * .55) * 3.2), .3, .07);   /* đuôi nơ + nếp */
      d = S3.hop(d, dd, .25);
      d = S3.hop(d, S3.elip(x, y, z, 0, .45, .45, .82, .98, .72), .25);   /* nút thắt */
      return d; }
    g.add(khoiTac(f, [-4, -3, -.8, 4, 2.2, 1.9], VL.vang, 90, 'no25843b'));
    [-1, 1].forEach(function (sg) { var rim = []; for (var k = 0; k < 48; k++) { var an = k / 48 * PI * 2, c = Math.cos(-.2), sn = Math.sin(-.2), u = Math.cos(an) * 1.6, v = Math.sin(an) * 1.25; rim.push(new V2(sg * (1.95 + u * c - v * sn), .55 + u * sn + v * c)); } g.add(chuoiHat(rim, .085, VL.vang, .3)); });   /* viền milgrain tai nơ */
    g.add(chuoiHat(vienTu(function (x, y) { return elip(x, y, 0, .45, .86, 1.02); }, 0, .45, 40), .08, VL.vang, .75));
    var cao = mocDon(g, 2.0); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 3.5 };
  };

  DS['23790'] = function () { var f = function (x, y) { return Math.hypot(x, y) - 4.6; }; return nutHoa({ f: f, T: 3.6, lung: lungHoaTim, lungCao: 1.2,   /* tròn lục đế (xem 4 ảnh): nút tròn, mặt là vòng 28 đá trắng viền hạt 2 mép, giữa lục đế cabochon mặt bằng cao (đỉnh phẳng); thành bên lộng chữ X; lưng lộng hoa 4 cánh; xỏ dọc qua 2 sườn */
    truoc: function (g, z) { var de = new THREE.Mesh(new THREE.CylinderGeometry(4.55, 4.6, .6, 64), VL.vang); de.rotation.x = PI / 2; de.position.z = z + .2; g.add(de);
      var ds = []; for (var i = 0; i < 28; i++) { var a = i / 28 * PI * 2; ds.push([Math.cos(a) * 3.75, Math.sin(a) * 3.75, z + .55, 0, 0, 1]); } g.add(hangKc(.32, ds));
      [4.35, 3.15].forEach(function (r) { g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - r; }, 0, 0, 90), .1, VL.vang, z + .55)); });
      var pf = [[0, 0], [2.9, 0], [2.95, .3], [2.7, 1.2], [2.25, 1.75], [0, 1.85]], ng = xoayLuoi(pf, 64, null, VL.lucde); ng.rotation.x = PI / 2; ng.position.z = z + .45; g.add(ng); } }); };

  /* ---------- nhóm Khác lô 5 (dựng tay, cân xứng) ---------- */
  var vanNut = vanNoi(function (c, w, h) { c.fillStyle = '#fff'; for (var r = 0; r < 18; r++) for (var k = 0; k < 36; k++) { var x = (k + (r % 2) * .5) * w / 36, y = (r + .5) * h / 18, gr = c.createRadialGradient(x, y, 0, x, y, w / 72); gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#707070'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, w / 72, 0, 7); c.fill(); } });   /* tóc ốc / hạt nổi */
  DS['23757'] = function () {   /* tròn lục đế (xem 4 ảnh): hạt tròn dẹt; mặt trước lục đế cabochon ổ trơn + viền hạt; thành chạm cuộn mây nổi xen ô cửa khoét (lỗ xỏ ở 2 sườn); lưng nổi tượng Phật ngồi trong vòng hạt */
    var g = new THREE.Group(), R = 3.6, T = 3.6;
    var pf = [[0, -T / 2], [R - .6, -T / 2], [R - .1, -T / 2 + .35], [R, 0], [R - .1, T / 2 - .35], [R - .6, T / 2], [0, T / 2]], th = xoayLuoi(pf, 96, function (r, y, a) { var u = (a / (PI * 2) * 8) % 1; return r + (Math.abs(y) < 1.1 ? .12 * Math.sin(u * PI * 2) * Math.cos(y * 1.4) : 0); }, VL.vangHoa); th.rotation.x = PI / 2; g.add(th);
    for (var i = 0; i < 8; i++) { var a = (i + .5) / 8 * PI * 2, o = new THREE.Mesh(new THREE.PlaneGeometry(.9, .75), VL.toi); o.position.set(Math.cos(a) * (R + .02), Math.sin(a) * (R + .02), 0); o.lookAt(Math.cos(a) * 9, Math.sin(a) * 9, 0); if (i % 2) g.add(o); }   /* ô cửa khoét */
    var de = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.2, .5, 40), VL.vang); de.rotation.x = PI / 2; de.position.z = T / 2 + .1; g.add(de);
    g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 2.4; }, 0, 0, 70), .13, VL.vang, T / 2 + .05));
    var v = vien(1.9, VL.lucde, .7); v.position.z = T / 2 + .3; g.add(v);
    var lung = new THREE.Group(); lung.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 2.9; }, 0, 0, 80), .14, VL.vang, 0));
    var dau = new THREE.Mesh(new THREE.SphereGeometry(.6, 18, 12), VL.vang); dau.position.set(0, 1.0, .2); lung.add(dau);
    var than = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), VL.vang); than.scale.set(1.35, 1.1, .45); than.position.set(0, -.5, .1); lung.add(than);
    var hl = new THREE.Mesh(new THREE.TorusGeometry(.95, .08, 6, 30, PI), VL.vang); hl.position.set(0, 1.0, .05); lung.add(hl);
    lung.rotation.y = PI; lung.position.z = -T / 2; g.add(lung);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (R + .03); g.add(l); });
    return { g: g, rong: 2 * R, xo: 'xuyen', cao: 2 * R, uoc: 7.5 };
  };
  DS['7714'] = function () {   /* trái tim vàng (soát lại 4 ảnh): tim PHỒNG TRÒN đều 2 mặt (không sống nhọn giữa, không khe sườn), vàng chải xước mờ; lỗ xỏ ngang qua 2 thuỳ trên */
    var f2 = function (x, y) { var ax = Math.abs(x); return hop(tron(ax, y, 1.55, .5, 1.8), Math.max(ax * .75 - (y + 3.8) * .66, y - .5), .8); };
    function f(x, y, z) { var d2 = f2(x, y), d = S3.hop(phong(x, y, z, d2, 2.4, 1.75, 1.75), epBo(d2, z, .55, .5), .6);
      d += ranh(x, .12, .12) * Math.max(0, Math.min(1, (y - .2) / .8)) * (Math.abs(z) > .6 ? 1 : 0);   /* khe nhẹ giữa 2 thuỳ trên */
      return Math.max(d, .6 - Math.hypot(y - 1.0, z)); }   /* lỗ ngang */
    var vl = new THREE.MeshStandardMaterial({ color: 0xefbf52, metalness: 1, roughness: .48 }), g = new THREE.Group();
    g.add(khoiTac(f, [-3.7, -4.2, -2.1, 3.7, 2.7, 2.1], vl, 80, '7714'));
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; var x0 = 0; while (f(x0 * sg, 1.0, 0) < .1 && x0 < 5) x0 += .02; l.position.set(sg * x0, 1.0, 0); g.add(l); });
    return { g: g, rong: 8.4, xo: 'xuyen', cao: 8, uoc: 7.5 };
  };

  DS['25874'] = function () {   /* bàn tính (xem 4 ảnh): khung chữ nhật bo góc dày; đai trên + đai dưới là 3 cánh sen phủ đá trắng; giữa rỗng: 2 trục dọc xâu hạt bàn tính (2 hạt trên, 2 hạt dưới mỗi trục) + thanh ngang; lưng khắc cánh sen; khoen + khoá lò xo → treo */
    var g = new THREE.Group(), W = 2.4, H = 4.4, T = 2.0, i;
    function cn(dx, dy, r) { return vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - dx, 0), Math.max(Math.abs(y) - dy, 0)) - r; }, 0, 0, 160); }
    g.add(tamLo(cn(W - .7, H - .7, .7), cn(W - 1.25, H - 2.2, .25), T, VL.vang));   /* khung + lòng rỗng giữa */
    [-1, 1].forEach(function (sg) { var y0 = sg * (H - 1.0);
      [[-1.05, 0], [0, .2], [1.05, 0]].forEach(function (q) { var la = new THREE.Mesh(new THREE.SphereGeometry(.65, 20, 14), VL.vang); la.scale.set(.85, 1.15, .4); la.position.set(q[0], y0 + sg * q[1], T / 2); la.rotation.z = -q[0] * .5 * sg; if (sg < 0) la.rotation.z += PI; g.add(la);
        var ds = []; for (var k = 0; k < 4; k++) { var a = k / 4 * PI * 2; ds.push([q[0] + Math.cos(a) * .3, y0 + sg * q[1] + Math.sin(a) * .42, T / 2 + .25, 0, 0, 1]); } g.add(hangKc(.15, ds)); }); });   /* cánh sen phủ đá */
    [-.6, .6].forEach(function (x) { var tr = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, 2 * H - 4.2, 8), VL.vang); tr.position.set(x, 0, 0); g.add(tr);
      [-1.1, -.55, .55, 1.1].forEach(function (y) { var h = new THREE.Mesh(new THREE.SphereGeometry(.38, 16, 10), VL.vang); h.scale.y = .62; h.position.set(x, y + (y > 0 ? -.1 : .1), 0); g.add(h); }); });
    var ngang = new THREE.Mesh(new THREE.BoxGeometry(2 * W - 2.4, .32, .5), VL.vang); g.add(ngang);
    var cao = moc(g, H); return { g: g, rong: 1.6, xo: 'treo', cao: cao + H };
  };
  DS['20308'] = function () {   /* bàn tính treo nhỏ (xem 4 ảnh): tấm vàng — đầu là mây như ý 3 thuỳ có cuộn, thân chữ nhật với 2 ô khoét, mỗi ô 2 cột hạt bàn tính (3 hạt) + thanh ngang; khoen trên mây → treo */
    var g = new THREE.Group(), T = 1.1, i;
    var f = function (x, y) { var d = Math.max(Math.abs(x) - 1.75, Math.abs(y + 1.0) - 1.7); [[-1.05, 1.0, .75], [0, 1.45, .8], [1.05, 1.0, .75]].forEach(function (q) { d = hop(d, tron(x, y, q[0], q[1], q[2]), .3); }); return d; };
    var lo = function (x, y) { return Math.min(Math.max(Math.abs(x + .8) - .55, Math.abs(y + 1.0) - 1.3), Math.max(Math.abs(x - .8) - .55, Math.abs(y + 1.0) - 1.3)); };
    var vk = vienTu(f, 0, -.3, 200), t = khoi(vk, 0, -.3, hoSo(T, .25), VL.vangMo); t.position.z = T / 2; g.add(t);
    [-.8, .8].forEach(function (cx) { g.add(ongVien([new V2(cx - .6, -2.35), new V2(cx + .6, -2.35), new V2(cx + .6, .35), new V2(cx - .6, .35)], .08, VL.vang, T / 2 + .03));
      var o = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.6), new THREE.MeshStandardMaterial({ color: 0x7a5216, metalness: .9, roughness: .5 })); o.position.set(cx, -1.0, T / 2 + .01); g.add(o);   /* lòng ô lõm vàng tối */
      [-.25, .25].forEach(function (dx) { var tr = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.6, 6), VL.vang); tr.position.set(cx + dx, -1.0, T / 2 + .08); g.add(tr);
        [-1.75, -1.4, -.4, -.05].forEach(function (y) { var h = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), VL.vang); h.position.set(cx + dx, y + .0, T / 2 + .12); g.add(h); }); });
      var ng = new THREE.Mesh(new THREE.BoxGeometry(1.1, .16, .2), VL.vang); ng.position.set(cx, -.9, T / 2 + .1); g.add(ng); });
    xoanDay(g, -1.05, 1.0, .08, .42, 1.2, 0, -1, .1, T / 2 + .05); xoanDay(g, 1.05, 1.0, .08, .42, 1.2, PI, 1, .1, T / 2 + .05); xoanDay(g, 0, 1.45, .08, .45, 1.2, PI / 2, 1, .1, T / 2 + .05);
    var cao = mocDon(g, 2.25); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 5 };
  };
  DS['20245'] = function () {   /* thỏi vàng quan tiền / nguyên bảo (xem lại ảnh): MỘT KHỐI LIỀN dáng thuyền — đáy bầu tròn như cái bát oval, miệng vành dày; vành thấp ở 2 bên hông, vểnh cao + loe ra ở 2 đầu (cong như yên ngựa); giữa lòng gù tròn nhô lên; mặt hông trước đồng xu lỗ khắc sao; vàng mờ cát; khoen sau gù → treo */
    var g = new THREE.Group(), vl = new THREE.MeshStandardMaterial({ color: 0xf0bd4c, metalness: 1, roughness: .5, bumpMap: VAN.bua, bumpScale: .5, side: THREE.DoubleSide });
    var A = 2.6, B = 1.75, NA = 96, NT = 28, pos = [], idx = [], i, j;
    function vanh(c) { return .35 + 1.35 * Math.pow(c, 4); }   /* độ cao miệng theo góc: thấp ở hông, cao ở 2 đầu */
    function P(th, t) { var c = Math.cos(th), sn = Math.sin(th), h = vanh(Math.abs(c)), y = -1.75 + (h + 1.75) * t, k = Math.sqrt(Math.max(0, 1 - Math.pow(1 - Math.min(1, t * 1.15), 2.4))),   /* soát đợt 5: đáy bầu tròn đầy (trước nhọn chữ V) */ loe = 1 + .28 * Math.pow(t, 3) * Math.pow(Math.abs(c), 3);
      return [c * A * k * loe, y, sn * B * k]; }
    for (i = 0; i <= NA; i++) for (j = 0; j <= NT; j++) { var q = P(i / NA * PI * 2, j / NT); pos.push(q[0], q[1], q[2]); }
    for (i = 0; i < NA; i++) for (j = 0; j < NT; j++) { var a0 = i * (NT + 1) + j, b0 = a0 + NT + 1; idx.push(a0, b0, a0 + 1, a0 + 1, b0, b0 + 1); }
    var than = new THREE.Mesh(luoi(pos, idx, null), vl); g.add(than);
    var vp = []; for (i = 0; i <= 120; i++) { var q2 = P(i / 120 * PI * 2, 1); vp.push(new V3(q2[0], q2[1], q2[2])); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(vp, true), 160, .32, 10, true), vl));   /* miệng vành dày */
    var day = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), vl); day.scale.set(A * .92, .7, B * .92); day.position.y = -.05; g.add(day);   /* lòng thuyền */
    var gu = new THREE.Mesh(new THREE.SphereGeometry(1.45, 36, 24), vl); gu.scale.set(1, 1, 1); gu.position.y = .45; g.add(gu);   /* gù giữa to */   /* gù giữa */
    var xu = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, .22, 28), VL.vang); xu.rotation.x = PI / 2 - .35; xu.position.set(0, -1.0, B * .95); g.add(xu);
    var vx = khoen(.5, .07, VL.vangMo); vx.rotation.x = -.35; vx.position.set(0, -.97, B * .95 + .14); g.add(vx);
    var sao = new THREE.Mesh(new THREE.CylinderGeometry(.27, .27, .08, 5), VL.vangMo); sao.rotation.x = PI / 2 - .35; sao.position.set(0, -.97, B * .95 + .16); g.add(sao);
    var k1 = khoen(.35, .11, VL.vang); k1.position.set(0, 1.5, -.6); g.add(k1);
    var cao = mocDon(g, 1.55); return { g: g, rong: 1.6, xo: 'treo', cao: cao + 1.6 };
  };
  DS['16400'] = function () {   /* chú tiểu (xem 4 ảnh): tượng chú tiểu ngồi ôm gối — đầu to tóc ốc hạt nổi, chấm ruby giữa trán, mặt tròn; thân nhỏ, 2 tay chắp ôm gối; lỗ xỏ dọc từ đỉnh đầu xuống đáy → xỏ dọc theo thân */
    var g = new THREE.Group();
    var dau = new THREE.Mesh(new THREE.SphereGeometry(2.0, 40, 28), new THREE.MeshStandardMaterial({ color: 0xf2c04f, metalness: 1, roughness: .3, bumpMap: vanNut, bumpScale: 3 })); dau.position.y = 1.6; g.add(dau);
    var mat = new THREE.Mesh(new THREE.SphereGeometry(1.45, 30, 20), VL.vang); mat.scale.set(1.05, 1, .75); mat.position.set(0, 1.25, 1.05); g.add(mat);   /* mặt trơn nhô ra trước */   /* mặt trơn */
    [-1, 1].forEach(function (sg) { var m2 = new THREE.Mesh(new THREE.TorusGeometry(.32, .07, 6, 16, PI), VL.vangMo); m2.position.set(sg * .55, 1.5, 2.1); m2.rotation.z = PI; g.add(m2); });   /* mắt nhắm cười */
    var mieng = new THREE.Mesh(new THREE.TorusGeometry(.45, .08, 6, 16, PI), VL.vangMo); mieng.position.set(0, .75, 2.05); mieng.rotation.z = PI; g.add(mieng);
    var rb = vien(.3, VL.ruby, .7); rb.position.set(0, 2.35, 1.95); g.add(rb); var vr = khoen(.34, .07, VL.vang); vr.position.set(0, 2.35, 1.9); g.add(vr);
    [-1, 1].forEach(function (sg) { var tai = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 10), VL.vang); tai.scale.set(.5, 1, .7); tai.position.set(sg * 1.95, 1.4, 0); g.add(tai); });
    g.add(khoiElip(VL.vangMo, [[0, -1.4, 0, 1.75, 1.7, 1.55], [.8, -1.65, 1.1, .8, .75, .75, .4], [-.8, -1.65, 1.1, .8, .75, .75, .4], [0, .25, .3, 1.2, .7, 1.1, .6]],
      [[1.3, -.4, .9, .1, -1.0, 1.65, .34, .35], [-1.3, -.4, .9, -.1, -1.0, 1.65, .34, .35]], .55, [-2.4, -3.3, -1.8, 2.4, 1.2, 2.6], 'chuTieu'));   /* soát: thân ngồi, 2 gối, 2 tay chắp, cổ đúc liền (trước là các quả cầu rời) */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg > 0 ? 3.62 : -3.0; g.add(l); });
    return { g: ongNam(g), rong: 7.2, xo: 'ong', cao: 4.4, uoc: 4.6, dungXem: true };   /* xem gần: dựng đứng */
  };

  /* ---------- lô Khác 6: hạt trống chạm lộng, sao, hạt gạo, ống ---------- */
  var vanCat = vanNoi(function (g, w, h) { for (var i = 0; i < 26000; i++) { var c = Math.random() < .5 ? 40 : 230; g.fillStyle = 'rgba(' + c + ',' + c + ',' + c + ',.35)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });   /* vàng phun cát li ti */
  function longMo(t) { var b = vanCat.clone(); b.repeat.set(3, 3); b.needsUpdate = true; return new THREE.MeshStandardMaterial({ color: 0xf0bf55, metalness: 1, roughness: .5, bumpMap: b, bumpScale: 1.1, alphaMap: t, alphaTest: .5, side: THREE.DoubleSide }); }
  function veTho(c, w, h, lw) {   /* chữ Thọ tròn (圆寿) đối xứng: trục đứng + thanh ngang giữa + 4 móc vuông xoắn ở 4 góc + 2 thanh ngang trên/dưới */
    var cx = w / 2, cy = h / 2; c.lineWidth = lw; c.lineCap = 'square'; c.lineJoin = 'miter';
    function l(pts) { c.beginPath(); pts.forEach(function (q, i) { c[i ? 'lineTo' : 'moveTo'](cx + q[0], cy + q[1]); }); c.stroke(); }
    l([[0, -215], [0, 215]]); l([[-150, 0], [150, 0]]);
    [-1, 1].forEach(function (sy) { l([[-105, sy * 186], [105, sy * 186]]);
      [-1, 1].forEach(function (sx) { l([[sx * 46, sy * 56], [sx * 168, sy * 56], [sx * 168, sy * 132], [sx * 96, sy * 132]]); l([[sx * 46, sy * 0], [sx * 46, sy * 56]]); }); });
  }
  function matTrong(R, ve, wRim) { return vanLong(function (c, w, h) { c.save(); c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 2, 0, 7); c.clip(); ve(c, w, h); c.restore(); c.lineWidth = wRim || 34; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - (wRim || 34) / 2, 0, 7); c.stroke(); }); }
  function thanhTrong(kieu) { return vanLong(function (c, w, h) {   /* thành hạt trống (512 × 512, quấn 1 vòng × lap): 2 đai trên dưới + cửa sổ */
    c.fillRect(0, 0, w, 70); c.fillRect(0, h - 70, w, 70); var n = 4, cw = w / n, i;
    for (i = 0; i < n; i++) { var x0 = i * cw; c.fillRect(x0, 0, 30, h);
      if (kieu === 'vom') { c.lineWidth = 26; c.beginPath(); c.moveTo(x0 + cw * .32, h - 70); c.lineTo(x0 + cw * .32, h * .45); c.arc(x0 + cw * .58, h * .45, cw * .26, PI, 0); c.lineTo(x0 + cw * .84, h - 70); c.stroke(); cuon(c, x0 + cw * .58, h * .5, 50, -PI / 2, 1.1); }
      else if (kieu === 'cuon') { c.lineWidth = 22; cuon(c, x0 + cw * .4, h * .38, 62, 0, 1.3); cuon(c, x0 + cw * .76, h * .64, 56, PI, 1.3); c.beginPath(); c.arc(x0 + cw * .58, h * .5, 16, 0, 7); c.fill(); }
      else { c.lineWidth = 28; c.beginPath(); c.arc(x0 + cw * .58, h / 2, 82, 0, 7); c.stroke(); c.fillRect(x0 + cw * .58 - 14, 70, 28, 104); c.fillRect(x0 + cw * .58 - 14, h - 174, 28, 104); } } }); }
  function hatTrong(o) {   /* hạt vàng hình trống dẹt: 2 mặt tròn (lộng chữ / mặt ngọc), thành cửa sổ lộng, viền dày, lỗ xỏ 2 bên sườn → dây chạy dọc qua thân */
    var g = new THREE.Group(), R = o.R, T = o.T, p = vienTu(function (x, y) { return Math.hypot(x, y) - R; }, 0, 0, 120), vk = o.vl || VL.vang;
    var tw = o.mo ? longMo(thanhTrong(o.thanh)) : longVang(thanhTrong(o.thanh)); g.add(thanhVien(vienTu(function (x, y) { return Math.hypot(x, y) - R + .12; }, 0, 0, 120), T - .3, tw, o.lap || 6));
    [-1, 1].forEach(function (sg) { var tr = sg > 0 ? o.truoc : o.sau;
      if (tr) g.add(matPhang(p, 2 * R, o.mo ? longMo(tr) : longVang(tr), sg * (T / 2 - .12), sg < 0));
      if (tr) { var nen = new THREE.Mesh(new THREE.CircleGeometry(R - .2, 64), new THREE.MeshStandardMaterial({ color: 0xd9aa48, metalness: 1, roughness: .4, side: THREE.DoubleSide })); nen.position.z = sg * (T / 2 - .95); g.add(nen); }   /* lòng hạt khuất sáng phía sau mặt lộng → chữ nổi rõ */
      var rim = new THREE.Mesh(new THREE.TorusGeometry(R - .1, .2, 12, 90), vk); rim.position.z = sg * (T / 2 - .12); rim.scale.z = 1.2; g.add(rim);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (R + .02); g.add(l);
      var cu = new THREE.Mesh(new THREE.TorusGeometry(.72, .16, 10, 30), vk); cu.rotation.y = PI / 2; cu.position.x = sg * (R - .05); g.add(cu); });   /* cổ lỗ xỏ */
    return g;
  }
  DS['19033'] = function () {   /* hạt trống lục đế (xem 4 ảnh): vàng bóng; mặt trước lục đế tròn mài vòm trong ổ viền trơn + vòng hạt bi; mặt sau chữ Thọ tròn chạm lộng, viền dày; thành cửa sổ vòm lộng; lỗ xỏ 2 sườn */
    var R = 4, T = 5.2, g = hatTrong({ R: R, T: T, thanh: 'vom', lap: 2, sau: matTrong(R, function (c, w, h) { veTho(c, w, h, 30); }, 56) }), zf = T / 2 - .1;
    var de = new THREE.Mesh(new THREE.CylinderGeometry(R - .2, R - .2, .5, 72), VL.vang); de.rotation.x = PI / 2; de.position.z = zf - .25; g.add(de);
    g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - R + .38; }, 0, 0, 90), .3, VL.vang, zf + .05));
    var o = new THREE.Mesh(new THREE.TorusGeometry(2.62, .3, 14, 72), VL.vang); o.scale.z = 1.5; o.position.z = zf + .2; g.add(o);   /* ổ viền trơn */
    var v = vien(2.3, VL.lucde, .62); v.position.z = zf + .05; g.add(v);
    return { g: g, rong: 2 * R, xo: 'xuyen', cao: 2 * R };
  };
  DS['21662'] = function () {   /* hạt trống chữ Phúc/Thọ (xem 4 ảnh): vàng phun cát mờ; 2 mặt chữ Thọ tròn chạm lộng; thành cửa sổ lộng có vòng tròn; lỗ xỏ 2 sườn */
    var R = 3.3, tr = matTrong(R, function (c, w, h) { veTho(c, w, h, 26); }, 40);
    return { g: hatTrong({ R: R, T: 3.9, mo: true, vl: VL.vangMo, thanh: 'tron', lap: 2, truoc: tr, sau: tr }), rong: 2 * R, xo: 'xuyen', cao: 2 * R };
  };
  function veChu(ch) { return function (c, w, h) { c.font = '600 300px "PingFang TC","PingFang SC","Heiti TC","Noto Sans CJK TC","Microsoft JhengHei",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(ch, w / 2, h / 2 + 12); }; }
  DS['21666'] = function () {   /* hạt trống chữ (xem 4 ảnh): vàng phun cát; mặt chữ Chiêu 招 / Tài 財 chạm lộng trong vòng tròn; thành cửa sổ lộng; lỗ xỏ 2 sườn */
    var R = 3.3;
    return { g: hatTrong({ R: R, T: 4.1, mo: true, vl: VL.vangMo, thanh: 'tron', lap: 2, truoc: matTrong(R, veChu('招'), 40), sau: matTrong(R, veChu('財'), 40) }), rong: 2 * R, xo: 'xuyen', cao: 2 * R };
  };
  function sao5(R, rf, bo) {   /* SDF ngôi sao 5 cánh, đỉnh hướng lên; rf: độ sâu khe; bo: bo tròn đầu cánh */
    var k1x = .809016994375, k1y = -.587785252292, r = R - bo, bax = rf * .587785252292, bay = rf * k1x - 1, bb = bax * bax + bay * bay;
    return function (x, y) { x = Math.abs(x); var d = Math.max(k1x * x + k1y * y, 0); x -= 2 * d * k1x; y -= 2 * d * k1y;
      d = Math.max(-k1x * x + k1y * y, 0); x += 2 * d * k1x; y -= 2 * d * k1y; x = Math.abs(x); y -= r;
      var hh = Math.max(0, Math.min(r, (x * bax + y * bay) / bb)), dx = x - bax * hh, dy = y - bay * hh;
      return Math.hypot(dx, dy) * (y * bax - x * bay < 0 ? -1 : 1) - bo; }; }
  DS['26275'] = function () {   /* ngôi sao vàng (xem 4 ảnh): sao 5 cánh phồng, cạnh vát bóng; 6 viên kim cương: 1 giữa + 1 ở mỗi cánh, ổ tròn; lưng trơn có lỗ chân đá; khoen nhỏ hàn ở đỉnh + khoen lớn */
    var g = new THREE.Group(), R = 4.4, f = sao5(R, .5, .38), p = vienTu(f, 0, 0, 320), T = 1.3, H = .7;
    var b = khoi(p, 0, 0, hoSo(T, .3), VL.vang); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, 0, H, VL.vang, function (x, y, s) { return 1 - .12 * s * s; }, 26); v.position.z = T / 2 - .05; g.add(v);
    var lu = vom(p, 0, 0, .35, VL.vang, null, 14); lu.rotation.y = PI; lu.position.z = -T / 2 + .05; g.add(lu);
    var ds = [[0, 0, .74]], i; for (i = 0; i < 5; i++) { var a = PI / 2 + i * 2 * PI / 5; ds.push([Math.cos(a) * 2.12, Math.sin(a) * 2.12, .6]); }
    ds.forEach(function (d) { var rr = Math.hypot(d[0], d[1]) / R, z = T / 2 - .05 + H * Math.sqrt(Math.max(0, 1 - rr * rr)) * (1 - .12 * rr * rr), zb = -T / 2 + .05 - .35 * Math.sqrt(Math.max(0, 1 - rr * rr)) - .02;
      g.add(hangKc(d[2], [[d[0], d[1], z - .02, 0, 0, 1]]));
      var o = new THREE.Mesh(new THREE.TorusGeometry(d[2] + .06, .07, 8, 28), VL.vang); o.position.set(d[0], d[1], z + .02); g.add(o);
      var l = new THREE.Mesh(new THREE.CircleGeometry(d[2] * .32, 14), new THREE.MeshStandardMaterial({ color: 0x8a6420, metalness: 1, roughness: .5 })); l.rotation.y = PI; l.position.set(d[0], d[1], zb - .01); g.add(l); });   /* soát đợt 5: lỗ chân đá nhỏ, tối vừa (trước chấm đen lơ lửng) */
    var yd = mocDon(g, R - .25);
    return { g: g, rong: 2 * R * .95, xo: 'treo', cao: yd + R };
  };
  var vanXuoc = vanNoi(function (g, w, h) { for (var i = 0; i < 700; i++) { var y = Math.random() * h, c = Math.floor(40 + Math.random() * 215); g.strokeStyle = 'rgba(' + c + ',' + c + ',' + c + ',.55)'; g.lineWidth = .8 + Math.random() * 1.6;
    g.beginPath(); g.moveTo(-20, y); g.lineTo(w + 20, y + 60); g.stroke(); g.beginPath(); g.moveTo(-20, y - h); g.lineTo(w + 20, y - h + 60); g.stroke(); } });   /* xước xoắn quanh thân (vàng chải) */
  DS['21653'] = function () {   /* hạt gạo vàng (xem 4 ảnh): hạt bầu dục thuôn 2 đầu, vàng bóng chải xước xoắn quanh thân; lỗ xỏ ở 2 đầu (xỏ dọc) */
    var L = 6.2, Rm = 2.05, pts = [new V2(.5, -L / 2)], j;
    for (j = 0; j <= 40; j++) { var t = -1 + 2 * j / 40, r = Math.max(.82, Rm * Math.pow(Math.max(0, 1 - t * t), .5)); pts.push(new V2(r, t * L / 2)); }
    pts.push(new V2(.5, L / 2));
    var bt = vanXuoc.clone(); bt.repeat.set(2, 1); bt.needsUpdate = true;
    var g = new THREE.Group(); g.add(xongTien(tienTron(pts, new THREE.MeshStandardMaterial({ color: 0xf4c561, metalness: 1, roughness: .22, bumpMap: bt, bumpScale: 1.3 }), 72)));
    return { g: docDay(g, L), rong: L, xo: 'ong', cao: 2 * Rm, uoc: 2 * Rm };
  };
  var vanGiacThoi = vanNoi(function (g, w, h) { var n = 8, m = 16, cw = w / n, ch = h / m, i, j;   /* lưới quả trám mài giác (diamond-cut) quanh ống */
    for (j = -1; j <= m; j++) for (i = -1; i <= n; i++) { var x = (i + (j % 2 ? .5 : 0)) * cw, y = j * ch, c = Math.floor(30 + Math.random() * 225);
      g.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')'; g.beginPath(); g.moveTo(x, y - ch); g.lineTo(x + cw / 2, y); g.lineTo(x, y + ch); g.lineTo(x - cw / 2, y); g.fill(); }
    g.strokeStyle = '#151515'; g.lineWidth = 3; for (i = -m; i <= 2 * m; i++) { g.beginPath(); g.moveTo(0, i * ch - h); g.lineTo(w, i * ch - h + w * 2 * ch / cw); g.stroke(); g.beginPath(); g.moveTo(w, i * ch - h); g.lineTo(0, i * ch - h + w * 2 * ch / cw); g.stroke(); } });
  DS['12872'] = function () {   /* ống vàng (xem 4 ảnh): ống tròn mảnh, mài giác quả trám chéo khắp thân lấp lánh; 2 đầu cắt phẳng, lòng rỗng (xỏ dọc) */
    var L = 10, R = 1.0, ri = .62, g = new THREE.Group(), bt = vanGiacThoi.clone(); bt.repeat.set(1, 1.2); bt.needsUpdate = true;
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0xf4c561, metalness: 1, roughness: .12, bumpMap: bt, bumpScale: 2.2 })));
    var tr = new THREE.Mesh(new THREE.CylinderGeometry(ri, ri, L, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xb8803a, metalness: 1, roughness: .5, side: THREE.BackSide })); g.add(tr);
    [-1, 1].forEach(function (sg) { var m = new THREE.Mesh(new THREE.RingGeometry(ri, R, 48), VL.vang); m.rotation.x = -sg * PI / 2; m.position.y = sg * L / 2; g.add(m); });
    return { g: docDay(g, L), rong: L, xo: 'ong', cao: 2 * R, uoc: 2 * R };
  };
  /* ---------- lô Khác 7: mèo men, tỳ hưu giỏ, garnet, bàn tính, đá ổ chấu ---------- */
  function daGiac(P) { return function (x, y) {   /* SDF đa giác P = [[x,y],…] */
    var d = 1e9, s = 1, n = P.length, i, j;
    for (i = 0, j = n - 1; i < n; j = i, i++) { var ex = P[j][0] - P[i][0], ey = P[j][1] - P[i][1], wx = x - P[i][0], wy = y - P[i][1], t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey))), bx = wx - ex * t, by = wy - ey * t;
      d = Math.min(d, bx * bx + by * by); var c1 = y >= P[i][1], c2 = y < P[j][1], c3 = ex * wy > ey * wx; if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s; }
    return s * Math.sqrt(d); }; }
  var daGarnet = da(0x6a0430, null, .1, .7);   /* garnet mài vòm: đỏ tía trong */
  function lamLo(g, pts, T, r) {   /* hàng lỗ tròn tối trên thành đứng theo đường viền pts (mỗi phần tử [x,y,nx,ny]) */
    var im = new THREE.InstancedMesh(new THREE.CircleGeometry(r, 14), VL.toi, pts.length), o = new THREE.Object3D();
    pts.forEach(function (q, i) { o.position.set(q[0], q[1], 0); o.lookAt(q[0] + q[2], q[1] + q[3], 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); g.add(im); }

  DS['23937'] = function () {   /* mèo mặt trắng (xem 4 ảnh): đầu mèo tròn 2 tai nhọn; mặt men: viền hồng, mặt trắng, tai trong hồng, mắt xanh lá to, trăng khuyết trên trán, ria + đường nét chỉ vàng; mép vàng hạt nhỏ; thành vàng mờ khoét hàng lỗ tròn; khoen hàn đỉnh đầu + khoen lớn */
    var g = new THREE.Group(), T = 2.2;
    var tai = function (sx) { return daGiac(sx > 0 ? [[1.25, 2.6], [3.35, 1.55], [2.85, 4.25]] : [[-2.85, 4.25], [-3.35, 1.55], [-1.25, 2.6]]); };
    var f = function (x, y) { return hop(hop(oval(3.75, 3.35)(x, y), tai(1)(x, y) - .25, .7), tai(-1)(x, y) - .25, .7); };
    var p = vienTu(f, 0, 0, 260), pn = phapTuyen(p);
    var b = khoi(p, 0, 0, hoSo(T, .25), VL.vangMo); b.position.z = T / 2; g.add(b);
    var ld = []; for (var i = 0; i < 26; i++) { var k = Math.floor((i + .5) / 26 * p.length); if (p[k].y < 2.4) ld.push([p[k].x + pn[k].x * .01, p[k].y + pn[k].y * .01, pn[k].x, pn[k].y]); } lamLo(g, ld, T, .26);
    var men = new THREE.MeshPhysicalMaterial({ roughness: .3, clearcoat: 1, clearcoatRoughness: .08, map: veMau(9, function (c, X, Y, k) {
      c.fillStyle = '#ec5a7c'; c.fillRect(0, 0, 512, 512);
      c.fillStyle = '#fbf6ee'; c.beginPath(); c.ellipse(X(0), Y(-.35), 2.85 * k, 2.55 * k, 0, 0, 7); c.fill();   /* mặt trắng */
      [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(X(s * 1.0), Y(2.0)); c.lineTo(X(s * 2.55), Y(3.65)); c.lineTo(X(s * 2.85), Y(1.6)); c.closePath(); c.fill(); });   /* phần trắng nối lên tai */
      c.fillStyle = '#f06a8a'; [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(X(s * 1.75), Y(2.35)); c.lineTo(X(s * 2.6), Y(3.45)); c.lineTo(X(s * 2.6), Y(2.05)); c.closePath(); c.fill(); });   /* tai trong hồng */
      c.strokeStyle = '#d9a43c'; c.lineCap = 'round'; c.lineWidth = .09 * k;
      c.beginPath(); c.ellipse(X(0), Y(-.35), 2.85 * k, 2.55 * k, 0, PI * .02, PI * .98); c.stroke();
      [-1, 1].forEach(function (s) {   /* mắt */
        var gr = c.createRadialGradient(X(s * 1.12), Y(-.15), 0, X(s * 1.12), Y(-.15), .78 * k); gr.addColorStop(0, '#1e8f45'); gr.addColorStop(.45, '#46c255'); gr.addColorStop(1, '#c8ea5a');
        c.fillStyle = gr; c.beginPath(); c.ellipse(X(s * 1.12), Y(-.15), .8 * k, .76 * k, 0, 0, 7); c.fill(); c.lineWidth = .1 * k; c.stroke();
        c.fillStyle = '#0d5a2c'; c.beginPath(); c.ellipse(X(s * 1.1), Y(-.2), .3 * k, .4 * k, 0, 0, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(X(s * 1.1 + .22), Y(.12), .14 * k, 0, 7); c.fill();
        c.lineWidth = .1 * k; c.beginPath(); c.arc(X(s * 1.12), Y(-.15), 1.0 * k, PI * 1.15, PI * 1.85); c.stroke();   /* mí */
        for (var r = 0; r < 3; r++) { c.beginPath(); c.moveTo(X(s * 1.9), Y(-1.0 - r * .3)); c.quadraticCurveTo(X(s * 2.7), Y(-1.05 - r * .38), X(s * 3.35), Y(-.9 - r * .55)); c.stroke(); } });   /* ria */
      c.lineWidth = .14 * k; c.beginPath(); c.arc(X(0), Y(1.55), .42 * k, PI * .1, PI * .9, true); c.stroke();   /* trăng khuyết */
      c.fillStyle = '#e8507a'; c.beginPath(); c.moveTo(X(-.2), Y(-1.15)); c.lineTo(X(.2), Y(-1.15)); c.lineTo(X(0), Y(-1.4)); c.closePath(); c.fill();
      c.lineWidth = .08 * k; c.beginPath(); c.moveTo(X(-.5), Y(-1.55)); c.quadraticCurveTo(X(-.25), Y(-1.8), X(0), Y(-1.45)); c.quadraticCurveTo(X(.25), Y(-1.8), X(.5), Y(-1.55)); c.stroke();
      c.fillStyle = '#f07c96'; c.beginPath(); c.ellipse(X(.05), Y(-1.85), .2 * k, .26 * k, 0, 0, 7); c.fill(); }) });
    var pm = vienTu(function (x, y) { return f(x, y) + .3; }, 0, 0, 260);
    g.add(matPhang(pm, 9, men, T / 2 + .02));
    g.add(ongVien(pm, .1, VL.vang, T / 2 + .04)); g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .1; }, 0, 0, 260), .1, VL.vang, T / 2 + .02));
    var yd = mocDon(g, 3.25);
    return { g: g, rong: 7.6, xo: 'treo', cao: yd + 3.35 };
  };

  DS['CHUAMA-ALtsCz'] = function () {   /* xuyên tỳ hưu (xem 4 ảnh): tỳ hưu ngọc băng trắng xanh nằm (MẶT NGỌC LẤY TỪ ẢNH THẬT), dáng gối chữ nhật bo tròn đối xứng; giỏ vàng: viền thừng trên + dưới, thành khoét ô dài + lỗ tròn, 4 chấu góc; lỗ xỏ ở 2 ĐẦU (xỏ dọc) */
    var g = new THREE.Group(), HX = 4.4, HY = 3.3, D = 4.4;
    var ngoc = ngocAnh('CHUAMA-ALtsCz'); ngoc.map = null; ngoc.color.set(0xb4c2e4); ngoc.bumpScale = 6; ngoc.transmission = .3; ngoc.thickness = 2.5; ngoc.needsUpdate = true;   /* soát: bỏ màu ảnh lốm đốm → ngọc băng tím nhạt trong, nét chạm tỳ hưu bằng vân nổi */ [ngoc.bumpMap].forEach(function (t) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.repeat.set(1, .82); t.offset.set(-.034, .09); });   /* ảnh chụp nghiêng → giãn chiều cao cho đúng tỉ lệ thật */
    function cn(dx, dy, r, n) { return vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - dx, 0), Math.max(Math.abs(y) - dy, 0)) - r; }, 0, 0, n || 200); }
    var vk = cn(HX - 1.6, HY - 1.6, 1.6, 240);
    var v = vom(vk, 0, 0, 1.8, ngoc, null, 50); v.position.z = .6; g.add(v);
    var de = khoi(vk, 0, 0, hoSo(1.8, .4), ngoc); de.position.z = .6; g.add(de);
    var gio = cn(HX - 1.5, HY - 1.5, 1.6, 220);
    g.add(thanhVien(gio, 2.1, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, 60); c.fillRect(0, h - 60, w, 60); var n = 6, cw = w / n;
      for (var i = 0; i < n; i++) { var x0 = i * cw; c.fillRect(x0, 0, 26, h); c.lineWidth = 22; c.beginPath(); c.arc(x0 + cw * .3, h / 2, 40, 0, 7); c.stroke(); c.fillRect(x0 + cw * .3 + 40, h / 2 - 11, cw * .7 - 40, 22); } })), 1));
    [1.05, -1.05].forEach(function (z) { g.add(chuoiHat(cn(HX - 1.5, HY - 1.5, 1.7, 220), .19, VL.vang, z)); g.add(ongVien(cn(HX - 1.5, HY - 1.5, 1.6, 220), .14, VL.vang, z - Math.sign(z) * .2)); });
    var nen = khoi(cn(HX - 1.5, HY - 1.5, 1.45), 0, 0, hoSo(.2, .06), VL.vangMo); nen.position.z = -1.05; g.add(nen);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (q) { var x = q[0] * (HX - .55), y = q[1] * (HY - .55);
      var pts = [new V3(x, y, .8), new V3(x, y, 1.6), new V3(x - q[0] * .2, y - q[1] * .25, 2.3), new V3(x - q[0] * .4, y - q[1] * .45, 2.7)];
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, .2, 8), VL.vang)); });   /* 4 chấu */
    [-1, 1].forEach(function (sg) { var cu = new THREE.Mesh(new THREE.TorusGeometry(.62, .17, 10, 30), VL.vang); cu.rotation.y = PI / 2; cu.position.set(sg * (HX + .08), 0, 0); g.add(cu);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.set(sg * (HX + .12), 0, 0); g.add(l); });
    return { g: g, rong: 2 * HX + .4, xo: 'xuyen', cao: 2 * HY, uoc: 7 };
  };

  DS['23782'] = function () { return trongChi(daGarnet, 2.15); };   /* hạt trống garnet (xem 4 ảnh): garnet đỏ tía mài vòm, vòng hạt bi; thành chỉ cuộn; lưng hoa 8 cánh chỉ vàng; lỗ xỏ 2 sườn */

  DS['23919'] = function () {   /* bàn tính (xem 4 ảnh): đầu mây như ý 3 múi phủ men xanh lam, chân mây chấm men trắng + cam nhạt, viền thừng vàng; dưới là khung bàn tính chữ nhật viền thừng, 2 cột trụ mỗi cột 2 hạt tròn + thanh giữa; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.5, i;
    var may = function (x, y) { var d = tron(x, y, 0, 1.25, 1.45); d = hop(d, tron(x, y, -1.65, .6, 1.12), .35); d = hop(d, tron(x, y, 1.65, .6, 1.12), .35); d = hop(d, Math.max(Math.abs(x) - 2.5, Math.abs(y + .15) - .55), .4);
      d = hop(d, tron(x, y, -2.2, -.35, .62), .3); d = hop(d, tron(x, y, 2.2, -.35, .62), .3); return d; };
    var pm = vienTu(may, 0, .4, 240), b = khoi(pm, 0, .4, hoSo(T, .25), VL.vang); b.position.z = T / 2; g.add(b);
    var men = new THREE.MeshPhysicalMaterial({ roughness: .45, clearcoat: .6, clearcoatRoughness: .3, map: veMau(7, function (c, X, Y, k) {
      c.fillStyle = '#4a8ad8'; c.fillRect(0, 0, 512, 512);
      for (i = 0; i < 900; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(120,175,240,.6)' : 'rgba(30,90,190,.5)'; c.fillRect(Math.random() * 512, Math.random() * 512, 3, 3); }   /* men cát lấp lánh */
      [[-1.9, -.3], [1.9, -.3], [-.9, -.35], [.9, -.35], [0, -.25]].forEach(function (q, j) { c.fillStyle = j < 2 ? '#f3efe8' : '#f6c8a2'; c.beginPath(); c.arc(X(q[0]), Y(q[1]), (j < 2 ? .5 : .52) * k, 0, 7); c.fill(); });
      c.strokeStyle = '#e2b24a'; c.lineWidth = .1 * k; [[-.9, -.35], [.9, -.35], [0, -.25]].forEach(function (q) { c.beginPath(); c.arc(X(q[0]), Y(q[1]), .52 * k, 0, 7); c.stroke(); });
      c.fillStyle = '#e2b24a'; c.beginPath(); c.arc(X(0), Y(1.1), .22 * k, 0, 7); c.fill(); }) });
    var pi = vienTu(function (x, y) { return may(x, y) + .28; }, 0, .4, 240); g.add(matPhang(pi, 7, men, T / 2 + .02));
    g.add(chuoiHat(vienTu(function (x, y) { return may(x, y) + .12; }, 0, .4, 240), .12, VL.vang, T / 2 + .03));
    var hd = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 8), VL.vang); hd.position.set(0, 1.1, T / 2 + .1); g.add(hd);
    var W = 2.15, y0 = -.9, y1 = -6.6, ym = (y0 + y1) / 2, H = (y0 - y1) / 2;   /* khung bàn tính */
    var ngoai = vienTu(function (x, y) { return Math.max(Math.abs(x) - W, Math.abs(y - ym) - H); }, 0, ym, 160), trong = vienTu(function (x, y) { return Math.max(Math.abs(x) - W + .55, Math.abs(y - ym) - H + .55); }, 0, ym, 160);
    g.add(tamLo(ngoai, trong, 1.1, VL.vang));
    [-1, 1].forEach(function (sg) { g.add(chuoiHat(vienTu(function (x, y) { return Math.max(Math.abs(x) - W + .12, Math.abs(y - ym) - H + .12); }, 0, ym, 160), .1, VL.vang, sg * .6)); });
    function que(x) { var m = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, 2 * H - .8, 8), VL.vang); m.position.set(x, ym, 0); g.add(m); }
    [-1.05, 0, 1.05].forEach(que);
    [-1.05, 1.05].forEach(function (x) { [ym + .6, ym - .6].forEach(function (y) { var h = new THREE.Mesh(new THREE.SphereGeometry(.45, 18, 12), VL.vang); h.scale.set(1, .82, .9); h.position.set(x, y, 0); g.add(h); }); });   /* mỗi cột 2 hạt tính */
    var yd = mocDon(g, 2.5);
    return { g: g, rong: 5.2, xo: 'treo', cao: yd + 6.6 };
  };

  DS['23954'] = function () {   /* đá trắng ổ chấu (xem 4 ảnh): 1 viên đá trắng giác tròn ~3 ly, ổ chén vàng 6 chấu; khoen nhỏ hàn mép trên + khoen lớn */
    var g = new THREE.Group(), r = 1.45, i;
    var kc = hangKc(r, [[0, 0, .25, 0, 0, 1]]); g.add(kc);
    var chen = new THREE.Mesh(new THREE.LatheGeometry([new V2(.25, -1.35), new V2(.75, -1.2), new V2(1.25, -.55), new V2(1.42, .05), new V2(1.32, .12), new V2(1.12, -.45), new V2(.55, -1.0), new V2(.2, -1.15)], 40), hai(VL.vang)); chen.rotation.x = PI / 2; g.add(chen);
    for (i = 0; i < 6; i++) { var a = i / 6 * PI * 2 + PI / 6, pts = [new V3(Math.cos(a) * 1.35, Math.sin(a) * 1.35, -.2), new V3(Math.cos(a) * 1.55, Math.sin(a) * 1.55, .35), new V3(Math.cos(a) * 1.35, Math.sin(a) * 1.35, .72)];
      g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, .17, 8), VL.vang)); var dk = new THREE.Mesh(new THREE.SphereGeometry(.19, 10, 8), VL.vang); dk.position.copy(pts[2]); g.add(dk); }
    var yd = mocDon(g, 1.45);
    return { g: g, rong: 3.2, xo: 'treo', cao: yd + 1.5 };
  };

  DS['23855'] = function () {   /* garnet hình thoi (xem 4 ảnh): hạt chỉ vàng hình mắt (thoi bo), mặt trước garnet tròn mài vòm trong ổ viền hạt, quanh là chỉ cuộn lộng + hạt bi; thành chỉ cuộn lộng, mép viền hạt; mặt sau chỉ cuộn quanh ô tròn; lỗ xỏ ở 2 ĐẦU nhọn (xỏ dọc) */
    var g = new THREE.Group(), T = 3.6, L = 5.0, Rc = 5.67;
    var f = function (x, y) { var d = Math.max(tron(x, y, 0, Rc - 3.0, Rc), tron(x, y, 0, -(Rc - 3.0), Rc)); return -hop(-d, -(Math.abs(x) - L + .35), .6); };   /* thoi = giao 2 cung tròn, đầu bo */
    var p = vienTu(f, 0, 0, 240);
    function chiCuon(c, w, h) { var cx = w / 2, cy = h / 2, i; c.lineWidth = 15;
      [-1, 1].forEach(function (s) { cuon(c, cx + s * 170, cy - 40, 48, s > 0 ? 0 : PI, 1.3); cuon(c, cx + s * 170, cy + 40, 48, s > 0 ? PI : 0, 1.3);
        c.beginPath(); c.ellipse(cx + s * 120, cy, 60, 120, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(cx + s * 230, cy); c.lineTo(cx + s * 300, cy); c.stroke(); cuon(c, cx + s * 70, cy - 150, 34, s > 0 ? 0 : PI, 1.2); cuon(c, cx + s * 70, cy + 150, 34, s > 0 ? PI : 0, 1.2); });
      for (i = 0; i < 40; i++) { var a = i / 40 * PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92, 7, 0, 7); c.fill(); } }
    var mt = longVang(vanLong(function (c, w, h) { chiCuon(c, w, h); c.lineWidth = 14; c.beginPath(); c.arc(w / 2, h / 2, 82, 0, 7); c.stroke(); }));
    g.add(matPhang(p, 11, mt, T / 2 - .1));
    g.add(matPhang(p, 11, longVang(vanLong(function (c, w, h) { chiCuon(c, w, h); c.beginPath(); c.arc(w / 2, h / 2, 80, 0, 7); c.fill(); })), -T / 2 + .1, true));
    [-1, 1].forEach(function (sg) { var nen = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(vienTu(function (x, y) { return f(x, y) + .3; }, 0, 0, 120))), new THREE.MeshStandardMaterial({ color: 0xdcae4c, metalness: 1, roughness: .4, side: THREE.DoubleSide })); nen.position.z = sg * (T / 2 - .8); g.add(nen); });
    g.add(thanhVien(vienTu(function (x, y) { return f(x, y) + .1; }, 0, 0, 240), T - .2, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, 50); c.fillRect(0, h - 50, w, 50); c.lineWidth = 16; for (var k = 0; k < 6; k++) { cuon(c, (k + .3) * w / 6, h * .5, 46, k, 1.25); cuon(c, (k + .75) * w / 6, h * .5, 40, k + PI, 1.25); } })), 3));
    [-1, 1].forEach(function (sg) { g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .02; }, 0, 0, 240), .17, VL.vang, sg * (T / 2 - .08))); g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .2; }, 0, 0, 240), .09, VL.vang, sg * (T / 2 - .05)));
      var cu = new THREE.Mesh(new THREE.TorusGeometry(.55, .15, 10, 28), VL.vang); cu.rotation.y = PI / 2; cu.position.x = sg * (L - .5); g.add(cu);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.48, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.x = sg * (L - .42); g.add(l); });
    var zf = T / 2 - .05, o = new THREE.Mesh(new THREE.TorusGeometry(1.65, .16, 12, 60), VL.vang); o.scale.z = 1.4; o.position.z = zf + .1; g.add(o);
    var de = new THREE.Mesh(new THREE.CircleGeometry(1.7, 40), VL.vang); de.position.z = zf; g.add(de);
    g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - 1.95; }, 0, 0, 80), .13, VL.vang, zf + .05));
    var v = vien(1.55, daGarnet, .7); v.position.z = zf; g.add(v);
    return { g: g, rong: 2 * L, xo: 'xuyen', cao: 6.6 };
  };
  /* ---------- lô Khác 8: tua lá ngọc, hạt trống lục đế, thẻ vuông, khối đá, bát sen ---------- */
  function trongChi(daVl, rDa) {   /* hạt trống chỉ vàng (23782, 24195): mặt trước đá mài vòm trong ổ + vòng hạt bi; thành chỉ cuộn lộng; mặt sau hoa 8 cánh chỉ vàng lộng; lỗ xỏ 2 sườn */
    var R = 3.5, T = 4.3, zf = T / 2 - .1;
    var g = hatTrong({ R: R, T: T, thanh: 'cuon', lap: 2, sau: matTrong(R, function (c, w, h) { var cx = w / 2, cy = h / 2, i; c.lineWidth = 16;
      for (i = 0; i < 8; i++) { var a = i / 8 * PI * 2; c.beginPath(); c.ellipse(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120, 110, 50, a, 0, 7); c.stroke(); }
      c.beginPath(); c.arc(cx, cy, 48, 0, 7); c.stroke(); c.beginPath(); c.arc(cx, cy, 18, 0, 7); c.fill();
      for (i = 0; i < 36; i++) { var b = i / 36 * PI * 2; c.beginPath(); c.arc(cx + Math.cos(b) * 205, cy + Math.sin(b) * 205, 9, 0, 7); c.fill(); } }, 36) });
    var de = new THREE.Mesh(new THREE.CylinderGeometry(R - .2, R - .2, .5, 72), VL.vangMo); de.rotation.x = PI / 2; de.position.z = zf - .25; g.add(de);
    [[R - .3, .22, zf + .05], [R - .3, .2, -zf - .05], [rDa + .3, .14, zf + .12]].forEach(function (q) { g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - q[0]; }, 0, 0, 90), q[1], VL.vang, q[2])); });
    var o = new THREE.Mesh(new THREE.TorusGeometry(rDa + .1, .2, 12, 72), VL.vang); o.scale.z = 1.4; o.position.z = zf + .15; g.add(o);
    var v = vien(rDa, daVl, .62); v.position.z = zf + .05; g.add(v);
    return { g: g, rong: 2 * R, xo: 'xuyen', cao: 2 * R };
  }
  DS['24195'] = function () { return trongChi(VL.lucde, 2.25); };   /* hạt tròn lục đế (xem 4 ảnh): lục đế tròn mài vòm trong ổ viền hạt; thành chỉ cuộn tròn lộng; lưng hoa 8 cánh chỉ vàng; lỗ xỏ 2 sườn */

  DS['24205'] = function () {   /* hạt lục đế vuông (xem 4 ảnh): hạt trống tròn; mặt trước vàng chạm lá lông chim toả tròn, giữa lục đế vuông bo góc mài vòm cao, 4 viên kim cương nhỏ ở 4 góc chéo; thành khoét lỗ tròn; lưng nút thắt 4 vòng chạm lộng; lỗ xỏ 2 sườn */
    var R = 3.6, T = 4.4, zf = T / 2 - .1;
    var g = hatTrong({ R: R, T: T, thanh: 'tron', lap: 2, sau: matTrong(R, function (c, w, h) { var cx = w / 2, cy = h / 2; c.lineWidth = 22;
      for (var i = 0; i < 4; i++) { var a = i * PI / 2 + PI / 4; c.beginPath(); c.arc(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92, 70, 0, 7); c.stroke(); }
      c.beginPath(); c.moveTo(cx - 200, cy - 200); c.lineTo(cx + 200, cy + 200); c.moveTo(cx + 200, cy - 200); c.lineTo(cx - 200, cy + 200); c.stroke(); }, 40) });
    var mat = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .16 * k;
      for (var i = 0; i < 16; i++) { var a = i / 16 * PI * 2 + PI / 16, r0 = 2.0, r1 = 3.4; c.beginPath(); c.moveTo(X(Math.cos(a) * r0), Y(Math.sin(a) * r0)); c.quadraticCurveTo(X(Math.cos(a + .25) * 2.8), Y(Math.sin(a + .25) * 2.8), X(Math.cos(a + .18) * r1), Y(Math.sin(a + .18) * r1)); c.stroke();
        for (var q = 1; q < 5; q++) { var rr = r0 + q * .3, b = a + q * .05; c.beginPath(); c.moveTo(X(Math.cos(b) * rr), Y(Math.sin(b) * rr)); c.lineTo(X(Math.cos(b + .17) * (rr + .12)), Y(Math.sin(b + .17) * (rr + .12))); c.stroke(); } } }, 2.6);
    var de = new THREE.Mesh(new THREE.CylinderGeometry(R - .15, R - .15, .6, 72), mat); de.rotation.x = PI / 2; de.position.z = zf - .25; g.add(de);
    g.add(matPhang(vienTu(function (x, y) { return Math.hypot(x, y) - R + .15; }, 0, 0, 120), 10, mat, zf + .06));
    g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y) - R + .3; }, 0, 0, 90), .18, VL.vang, zf + .08));
    var vu = vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - 1.35, 0), Math.max(Math.abs(y) - 1.35, 0)) - .55; }, 0, 0, 160);
    g.add(ongVien(vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - 1.35, 0), Math.max(Math.abs(y) - 1.35, 0)) - .72; }, 0, 0, 160), .2, VL.vang, zf + .2));
    var v = vom(vu, 0, 0, 1.7, VL.lucde, function (x, y, s) { return 1 - .25 * s * s; }, 30); v.position.z = zf + .1; g.add(v);   /* lục đế vuông mài vòm cao (sugarloaf) */
    var ds = []; [1, 3, 5, 7].forEach(function (k) { var a = k * PI / 4; ds.push([Math.cos(a) * 2.75, Math.sin(a) * 2.75, zf + .28, 0, 0, 1]);
      for (var q = 0; q < 4; q++) { var b = q * PI / 2 + PI / 4, h = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), VL.vang); h.position.set(Math.cos(a) * 2.75 + Math.cos(b) * .38, Math.sin(a) * 2.75 + Math.sin(b) * .38, zf + .25); g.add(h); } });
    g.add(hangKc(.38, ds));
    return { g: g, rong: 2 * R, xo: 'xuyen', cao: 2 * R };
  };

  DS['24201'] = function () {   /* tua lá ngọc đa sắc (xem 4 ảnh): đầu là ống vàng chạm lộng 2 miệng loe viền hạt, giữa đính ruby nhỏ (dây luồn qua ống); dưới treo 3 dây xích, mỗi dây 1 lá ngọc chạm gân (xanh nhạt, vàng mật, xanh lục) đội hoa vàng 5 cánh; dây giữa dài nhất */
    var g = new THREE.Group(), kh = new THREE.Group(), L = 5.0, R = 1.45, ong = new THREE.Group();
    var tw = longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 6; k++) { var x = (k + .5) * w / 6; c.beginPath(); c.ellipse(x - 28, h / 2, 18, h * .3, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(x + 28, h / 2, 18, h * .3, 0, 0, 7); c.fill(); } }));
    ong.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, L - .6, 48, 1, true), tw));
    var tr = new THREE.Mesh(new THREE.CylinderGeometry(R - .25, R - .25, L - .4, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x8c6a2a, metalness: .8, roughness: .6, side: THREE.BackSide })); ong.add(tr);
    [-1, 1].forEach(function (sg) { var lo = new THREE.Mesh(new THREE.CylinderGeometry(sg > 0 ? R + .2 : R, sg > 0 ? R : R + .2, .4, 48, 1, true), hai(VL.vang)); lo.position.y = sg * (L / 2 - .25); ong.add(lo);
      var vt = khoen(R + .2, .14, VL.vang); vt.rotation.x = PI / 2; vt.position.y = sg * L / 2; ong.add(vt); ong.add(vongHat(R + .05, sg * (L / 2 - .7), .14, VL.vang)); });
    ong.rotation.z = PI / 2; kh.add(ong);
    var bo = new THREE.Mesh(new THREE.CylinderGeometry(.55, .62, .5, 24), VL.vang); bo.rotation.x = PI / 2; bo.position.z = R + .05; kh.add(bo);
    kh.add(hangKc(.32, [[0, 0, R + .32, 0, 0, 1]], VLda.rubyG));
    g.add(kh); g.userData.khoa = kh; g.userData.khoaXem = 0;   /* xem gần: ống nằm ngang, ruby quay ra trước */
    var a = khoen(.5, .15, VL.vang); a.position.y = -R - .45; g.add(a);
    var y0 = -R - .95, mau = [0xbfd08e, 0x61c48c, 0xe0aa5c];
    [[-1.3, -6.0, .35], [0, -10.2, 0], [1.3, -8.0, -.35]].forEach(function (q, i) {   /* soát đợt 5: 3 dây xích dài khác nhau, lá treo tách riêng */
      xich(g, new V3(0, y0, 0), new V3(q[0], q[1], 0), .26, VL.vang);
      var la = new THREE.Group(), f = function (x, y) { return hop(tron(x, y, 0, -.35, 1.05), tron(x, y, 0, -1.5, .25), 1.3); };   /* lá: bầu tròn trên, nhọn dần xuống */
      var p = vienTu(f, 0, -.6, 160), ng = da(mau[i], vanMay, .14, .4);
      [-1, 1].forEach(function (sg) { var v = vom(p, 0, -.6, .55, ng, function (x, y, s) { return 1 - .35 * Math.exp(-Math.pow(x / .07, 2)) * (y < .3 ? 1 : 0) - .15 * Math.exp(-Math.pow((Math.abs(x) - .45 + (y + .4) * .3) / .06, 2)); }, 26); if (sg < 0) v.rotation.y = PI; la.add(v); });   /* gân giữa + gân xiên */
      var hoa = khoi(vienTu(cungHoa(5, .32, .3), 0, 0, 80), 0, 0, hoSo(.35, .12), VL.vang); hoa.position.set(0, .55, .55); la.add(hoa);
      var nh = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), VL.vang); nh.position.set(0, .55, .62); la.add(nh);
      var mo = khoen(.25, .08, VL.vang); mo.position.y = .95; la.add(mo);
      la.scale.setScalar(1.45); la.position.set(q[0], q[1] - 1.45, 0); la.rotation.y = q[2]; g.add(la); });
    return { g: g, rong: 5.4, xo: 'treo', cao: 16 };
  };

  DS['23918'] = function () {   /* thẻ vuông đính đá (xem 4 ảnh): tấm vuông, viền hạt bi, 3 bậc khung vuông lùi dần vào trong; ô giữa chạm lộng sao 8 tia quanh viên kim cương ổ tròn; khoen hàn giữa cạnh trên + khoen lớn */
    var g = new THREE.Group(), H = 3.2;
    function vuong(h) { return vienTu(function (x, y) { return Math.max(Math.abs(x), Math.abs(y)) - h; }, 0, 0, 160); }
    [[H, 2.72, 1.5, 0], [2.72, 2.28, 1.2, -.12], [2.28, 1.84, .95, -.24]].forEach(function (q) { var m = tamLo(vuong(q[0]), vuong(q[1]), q[2], VL.vangMo); m.position.z = q[3]; g.add(m); });
    var lung = tamLo(vuong(H - .05), vuong(1.84), .3, VL.vangMo); lung.position.z = -.45; g.add(lung);   /* soát đợt 5: ô giữa lộng thủng (trước nền nâu đặc) */
    for (var i = 0; i < 8; i++) { var a = i * PI / 4, Lr = i % 2 ? 2.45 : 1.85, b = .34, P = [[Math.cos(a) * Lr, Math.sin(a) * Lr], [Math.cos(a + b) * .62, Math.sin(a + b) * .62], [Math.cos(a - b) * .62, Math.sin(a - b) * .62]];
      var t = khoi(vienTu(daGiac(P.reverse()), Math.cos(a) * .9, Math.sin(a) * .9, 60), Math.cos(a) * .9, Math.sin(a) * .9, hoSo(.75, .06), VL.vang); t.position.z = .1; g.add(t); }   /* sao 8 tia */
    var o = new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, .9, 30), VL.vang); o.rotation.x = PI / 2; o.position.z = -.2; g.add(o);
    g.add(hangKc(.5, [[0, 0, .3, 0, 0, 1]]));
    g.add(chuoiHat(vuong(H - .14), .13, VL.vang, .77));
    var yd = mocDon(g, H - .1);
    return { g: g, rong: 2 * H, xo: 'treo', cao: yd + H };
  };

  DS['23929'] = function () {   /* khối vuông đính đá (xem 4 ảnh): khối vàng bóng gần lập phương, mặt trước viên kim cương tròn trong ổ vuông viền hạt (milgrain) 4 chấu góc; lưng có lỗ chân đá; khoen hàn trên + khoen lớn */
    var g = new THREE.Group(), H = 1.75, D = 2.8;
    var b = khoi(vienTu(function (x, y) { return Math.max(Math.abs(x), Math.abs(y)) - H; }, 0, 0, 120), 0, 0, hoSo(D, .25), VL.vang); b.position.z = D / 2; g.add(b);
    g.add(chuoiHat(vienTu(function (x, y) { return Math.max(Math.abs(x), Math.abs(y)) - H + .28; }, 0, 0, 120), .08, VL.vang, D / 2 + .02));
    g.add(hangKc(1.1, [[0, 0, D / 2 + .08, 0, 0, 1]]));
    [1, 3, 5, 7].forEach(function (k) { var a = k * PI / 4, h = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), VL.vang); h.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, D / 2 + .15); g.add(h); });
    var l = new THREE.Mesh(new THREE.CircleGeometry(.4, 18), VL.toi); l.rotation.y = PI; l.position.z = -D / 2 - .01; g.add(l);
    var yd = mocDon(g, H - .1);
    return { g: g, rong: 2 * H, xo: 'treo', cao: yd + H };
  };

  DS['23936'] = function () {   /* bát sen (xem 4 ảnh): đài sen treo úp như chuông: chóp nhọn trên nối khoen, thân loe xuống có gân xếp nếp, miệng dưới lượn 6 múi; mặt đáy phẳng chấm hạt sen; vàng phun cát; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), pf = [], j, N = 26;
    for (j = 0; j <= N; j++) { var t = j / N, y = 1.2 - t * 2.55, r = .34 + 2.2 * Math.pow(Math.sin(t * PI / 2), 1.25); pf.push([r, y]); }
    pf.push([2.68, -1.42]); pf.push([2.5, -1.5]);
    for (j = 0; j <= 6; j++) pf.push([2.45 * (1 - j / 6), -1.5]);
    var than = xoayLuoi(pf, 144, function (r, y, a, jj) { var t = Math.max(0, Math.min(1, (1.2 - y) / 2.55)), mui = 1 + .22 * Math.pow(.5 + .5 * Math.cos(5 * a), .8) * Math.pow(t, 2.5) - .06 * Math.pow(t, 2.5), gan = 1 + .1 * Math.pow(Math.abs(Math.cos(6 * a + PI / 2)), 6) * Math.min(1, t * 3); return r * mui * (jj > N + 1 ? 1 : gan); }, hai(VL.vangMo));
    g.add(than); var cap = new THREE.Mesh(new THREE.SphereGeometry(.36, 14, 10), VL.vangMo); cap.position.y = 1.2; g.add(cap);
    var ds = [[0, 0]]; for (j = 0; j < 6; j++) { var a = j / 6 * PI * 2 + PI / 6; ds.push([Math.cos(a) * 1.15, Math.sin(a) * 1.15]); }
    ds.forEach(function (q) { var h = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 8), VL.vang); h.position.set(q[0], -1.54, q[1]); h.scale.y = .6; g.add(h); });   /* hạt sen trên mặt đáy */
    var yd = mocDon(g, 1.2);
    return { g: g, rong: 5.4, xo: 'treo', cao: yd + 1.55 };
  };
  /* ---------- lô Khác 9: lông vũ, ngựa bập bênh men, khánh như ý, hoa bướm, búp sen, sao nhỏ ---------- */
  function eli(vl, x, y, z, a, b, c, rz) { var m = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), vl); m.scale.set(a, b, c); m.position.set(x, y, z || 0); if (rz) m.rotation.z = rz; return m; }   /* khối bầu dục tâm (x,y,z), bán trục a,b,c, nghiêng rz */

  DS['23921'] = function () {   /* lông vũ (xem 4 ảnh): lông chim cong chữ S, sống giữa + vân lông xiên 2 bên, đuôi cuộn tròn; cuối đính 1 viên kim cương ổ 4 chấu; khoen hàn đầu trên + khoen lớn */
    var g = new THREE.Group(), i, N = 40;
    var song = new THREE.CatmullRomCurve3([new V3(0, 3.3, 0), new V3(-.45, 2.1, 0), new V3(-.65, .7, 0), new V3(-.4, -.7, 0), new V3(.15, -1.8, 0), new V3(.35, -2.55, 0)]);
    var P = [], Tn = [], W = [];
    for (i = 0; i <= N; i++) { var t = i / N; P.push(song.getPoint(t)); Tn.push(song.getTangent(t)); W.push(1.35 * Math.pow(Math.sin(PI * Math.min(1, .08 + t * .95)), .55) + .12); }
    var trai = [], phai = [];
    for (i = 0; i <= N; i++) { var n = new V2(-Tn[i].y, Tn[i].x), w = W[i] * (i / N > .55 ? 1 : .9); trai.push(new V2(P[i].x + n.x * w, P[i].y + n.y * w)); phai.push(new V2(P[i].x - n.x * w * .85, P[i].y - n.y * w * .85)); }
    var sh = new THREE.Shape(trai.concat(phai.reverse()));
    var bm = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .1 * k;
      for (var j = 1; j < N; j++) { var q = P[j], tg = Tn[j], nn = new V2(-tg.y, tg.x);
        [1, -1].forEach(function (s) { var w2 = W[j] * (s > 0 ? 1 : .85); c.beginPath(); c.moveTo(X(q.x), Y(q.y)); c.lineTo(X(q.x + nn.x * s * w2 + tg.x * .45), Y(q.y + nn.y * s * w2 + tg.y * .45)); c.stroke(); }); }
      c.lineWidth = .22 * k; c.beginPath(); P.forEach(function (q, j) { c[j ? 'lineTo' : 'moveTo'](X(q.x), Y(q.y)); }); c.stroke(); }, 2.2);
    bm.bumpMap.repeat.set(.1, .1); bm.bumpMap.offset.set(.5, .5);
    var la = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .7, bevelEnabled: true, bevelThickness: .3, bevelSize: .18, bevelSegments: 3, curveSegments: 4 }), bm); la.position.z = -.35; g.add(la);
    var cu = []; for (i = 0; i <= 30; i++) { var a = PI * .1 + i / 30 * PI * 2.1, r = .95 - i / 30 * .6; cu.push(new V3(-.45 + Math.cos(a) * r, -2.6 + Math.sin(a) * r, 0)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cu), 40, .36, 10), VL.vang));   /* đuôi cuộn */
    var o = new THREE.Mesh(new THREE.CylinderGeometry(.62, .45, .8, 24), VL.vang); o.rotation.x = PI / 2; o.position.set(.95, -3.0, .2); g.add(o);
    g.add(hangKc(.55, [[.95, -3.0, .65, 0, 0, 1]]));
    [1, 3, 5, 7].forEach(function (k) { var a = k * PI / 4, h = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), VL.vang); h.position.set(.95 + Math.cos(a) * .6, -3.0 + Math.sin(a) * .6, .82); g.add(h); });
    var yd = mocDon(g, 3.3);
    return { g: g, rong: 4.0, xo: 'treo', cao: yd + 3.6 };
  };

  DS['B0529'] = function () {   /* ngựa bập bênh men (xem 4 ảnh): ngựa tròn trịa men trắng, chấm đỏ; yên hồng viền đỏ + dải xanh lá; mõm hồng, tai + mắt + cương vàng; chân đứng trên ván bập bênh vàng cong; XỎ DỌC từ ngực ra đuôi */
    var g = new THREE.Group(), tr = new THREE.MeshPhysicalMaterial({ color: 0xfbfaf6, roughness: .22, clearcoat: 1, clearcoatRoughness: .05 }), i;
    var hong = new THREE.MeshPhysicalMaterial({ color: 0xf6aab9, roughness: .25, clearcoat: 1 }), xanh = new THREE.MeshPhysicalMaterial({ color: 0x1f9a4a, roughness: .25, clearcoat: 1 }), doMen = new THREE.MeshPhysicalMaterial({ color: 0xe0242c, roughness: .25, clearcoat: 1 });
    var EL = [[.2, .5, 0, 2.2, 1.35, 1.4], [-1.3, .8, 0, 1.25, 1.3, 1.35], [1.7, .75, 0, 1.25, 1.25, 1.35], [-1.6, -.95, 0, .62, 1.5, 1.1], [1.75, -.95, 0, .62, 1.5, 1.1]],
      OG = [[-1.45, 1.3, 0, -2.2, 2.65, 0, .82], [-2.3, 3.15, 0, -3.45, 2.4, 0, .78], [2.55, 1.05, 0, 3.1, 1.8, 0, .42]];
    g.add(khoiElip(tr, EL, OG, .55, [-4.3, -2.6, -1.8, 3.7, 4.2, 1.8], 'nguaMen'));   /* soát: thân ngựa men đúc liền (trước ghép quả trứng) */
    function fThan(x, y, z) { var d = 9; EL.forEach(function (q) { d = S3.hop(d, S3.elip(x, y, z, q[0], q[1], q[2], q[3], q[4], q[5]), .55); }); OG.forEach(function (q) { d = S3.hop(d, S3.ong(x, y, z, q[0], q[1], q[2], q[3], q[4], q[5], q[6]), .55); }); return d; }
    g.add(eli(hong, -3.9, 2.05, 0, .6, .55, .64, -.5));   /* mõm hồng */
    function vanh(vl, t0, t1, s) { var m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 16, 0, PI * 2, t0, t1 - t0), vl); m.scale.set(1.78 * s, 1.6 * s, 1.6 * s); m.position.set(.3, .55, 0); g.add(m); }   /* yên: các dải vỏ bầu dục */
    vanh(hong, 0, 1.45, 1); vanh(doMen, 1.43, 1.55, 1.008); vanh(xanh, 1.53, 1.8, 1.004); vanh(doMen, 1.78, 1.88, 1.01);
    [[-1.4, 1.5], [2.1, 1.4], [-1.6, -.1], [1.6, -.2], [-2.2, .9], [2.6, .4], [-.4, -.5], [.8, -.55], [-.3, 1.2]].forEach(function (q) { [-1, 1].forEach(function (s) {
      var best = 0; for (var zz = 2; zz > 0; zz -= .02) if (fThan(q[0], q[1], zz) < 0) { best = zz; break; }   /* chấm bám đúng mặt thân */
      if (!best) return; var d = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), doMen); d.scale.z = .4; d.position.set(q[0], q[1], s * (best + .01)); g.add(d); }); });   /* chấm đỏ 2 bên */
    [-1, 1].forEach(function (s) { var tai = new THREE.Mesh(new THREE.ConeGeometry(.28, .7, 14), VL.vang); tai.position.set(-2.35, 3.55, s * .42); tai.rotation.z = -.2; g.add(tai);
      var mat = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 8), VL.vang); mat.position.set(-2.85, 2.95, s * .72); g.add(mat);
      var cg = new THREE.Mesh(new THREE.TorusGeometry(.62, .06, 8, 40), VL.vang); cg.position.set(-3.5, 2.25, 0); cg.rotation.y = PI / 2; cg.rotation.x = .4; g.add(cg);   /* cương quanh mõm */
      var day = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(-3.4, 2.1, s * .6), new V3(-2.3, 1.4, s * 1.0), new V3(-1.1, 1.3, s * 1.42)]), 16, .07, 6), doMen); g.add(day); });
    var sh = new THREE.Shape(); sh.absarc(.2, 7.6, 9.75, -PI / 2 - .4, -PI / 2 + .4, false); sh.absarc(.2, 7.6, 9.35, -PI / 2 + .4, -PI / 2 - .4, true);
    var van = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 2.0, bevelEnabled: true, bevelThickness: .1, bevelSize: .08, bevelSegments: 2, curveSegments: 40 }), VL.vang); van.position.z = -1.0; g.add(van);   /* ván bập bênh */
    [-1, 1].forEach(function (s) { var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.set(s > 0 ? 2.97 : -2.57, .8, 0); g.add(l); });   /* lỗ xỏ: ngực + đuôi */
    g.children.forEach(function (m) { m.position.y -= .75; });
    return { g: g, rong: 7.6, xo: 'xuyen', cao: 6.8, dung: true, uoc: 7 };
  };

  DS['BS128'] = function () {   /* khánh như ý (xem 4 ảnh): khoá như ý vàng phun cát: 4 góc cuộn mây xoắn ốc, đáy bo tròn; giữa 1 rãnh DỌC thẳng đứng đính 5 kim cương (user: hàng đá nằm dọc, không chéo); lưng chữ Phúc; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.5;
    var f = function (x, y) { var d = oval(2.3, 1.9)(x, y - .1); d = hop(d, tron(x, y, -2.0, 1.05, .88), .5); d = hop(d, tron(x, y, 2.0, 1.05, .88), .5); d = hop(d, tron(x, y, -1.4, -1.0, .8), .5); d = hop(d, tron(x, y, 1.4, -1.0, .8), .5); d = hop(d, tron(x, y, 0, -1.55, .7), .6); return d; };
    var p = vienTu(f, 0, .1, 240);
    var mt = vanRieng(function (c, X, Y, k) { for (var i = 0; i < 9000; i++) { c.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.25)'; c.fillRect(Math.random() * 512, Math.random() * 512, 2, 2); }
      c.strokeStyle = '#fff'; c.lineWidth = .17 * k;
      [[-2.0, 1.05, .72, 0], [2.0, 1.05, .72, PI], [-1.4, -1.0, .66, PI / 2], [1.4, -1.0, .66, PI / 2]].forEach(function (q) { c.beginPath(); for (var t = 0; t <= 1; t += .02) { var a = q[3] + t * PI * 2 * 1.6, r = q[2] * (1 - t * .85); c.lineTo(X(q[0] + Math.cos(a) * r), Y(q[1] + Math.sin(a) * r)); } c.stroke(); });
      c.beginPath(); c.moveTo(X(0), Y(1.5)); c.lineTo(X(0), Y(-1.35)); c.lineWidth = .75 * k; c.strokeStyle = '#2a2a2a'; c.stroke(); }, 2.4);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, .1, hoSo(T, .3), mt); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, .1, .45, mt, null, 20); v.position.z = T / 2 - .05; g.add(v);
    var ds = []; for (var i = 0; i < 5; i++) { var t = i / 4, x = 0, y = 1.2 - t * 2.3; ds.push([x, y, T / 2 + .3, 0, 0, 1]); } g.add(hangKc(.31, ds));
    var yd = mocDon(g, 1.95);
    return { g: g, rong: 6.2, xo: 'treo', cao: yd + 2.1 };
  };

  DS['16481'] = function () {   /* hoa bướm 4 cánh (xem 4 ảnh): 4 cánh thoi nhọn xếp chéo — 2 cánh trên to (3 viên đá), 2 cánh dưới nhỏ (2 viên); mỗi cánh viền vàng nổi, đá kim cương xếp dọc giữa cánh; khoen hàn tâm + khoen lớn */
    var g = new THREE.Group();
    function canh(L, wd, goc, so) { var c = new THREE.Group(), R = (wd * wd + L * L / 4) / (2 * wd), cc = R - wd;
      var f = function (x, y) { return Math.max(tron(x, y, cc, L / 2, R), tron(x, y, -cc, L / 2, R)); }, p = vienTu(f, 0, L / 2, 120);
      var b = khoi(p, 0, L / 2, hoSo(.9, .18), VL.vang); b.position.z = .45; c.add(b);
      c.add(ongVien(vienTu(function (x, y) { return f(x, y) + .12; }, 0, L / 2, 120), .12, VL.vang, .5));
      var ds = []; for (var i = 0; i < so; i++) { var y = L * (so === 3 ? .26 + i * .23 : .34 + i * .28); ds.push([0, y, .52, 0, 0, 1]); } c.add(hangKc(so === 3 ? .34 : .36, ds));
      c.rotation.z = goc; g.add(c); }
    canh(3.4, .95, .78, 3); canh(3.4, .95, -.78, 3); canh(2.6, .82, PI - .62, 2); canh(2.6, .82, PI + .62, 2);
    var tam = new THREE.Mesh(new THREE.SphereGeometry(.42, 16, 12), VL.vang); tam.position.z = .4; g.add(tam);
    var yd = mocDon(g, .35);
    return { g: g, rong: 5.6, xo: 'treo', cao: yd + 2.4 };
  };

  DS['A5320'] = function () {   /* búp sen (xem 4 ảnh): búp sen nhỏ treo úp: chóp trên nối khoen, thân phình như quả bí 8 múi gân tròn nổi; mặt đáy hoa 8 cánh chấm hạt, giữa 1 viên kim cương; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), pf = [], j, N = 24;
    for (j = 0; j <= N; j++) { var t = j / N, y = 1.3 - t * 2.6, r = .3 + 1.55 * Math.pow(Math.sin(Math.min(1, t * 1.15) * PI / 2), .9); pf.push([r, y]); }
    pf.push([1.7, -1.42]); for (j = 0; j <= 6; j++) pf.push([1.55 * (1 - j / 6), -1.45]);
    g.add(xoayLuoi(pf, 128, function (r, y, a, jj) { var t = Math.max(0, Math.min(1, (1.3 - y) / 2.6)); return r * (1 + .13 * Math.pow(Math.abs(Math.cos(4 * a)), .7) * Math.min(1, t * 2.5) - .06); }, hai(VL.vang)));
    var cap = new THREE.Mesh(new THREE.SphereGeometry(.34, 14, 10), VL.vang); cap.position.y = 1.3; g.add(cap);
    for (j = 0; j < 8; j++) { var a = j / 8 * PI * 2 + PI / 8, h = new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), VL.vang); h.position.set(Math.sin(a) * 1.05, -1.5, Math.cos(a) * 1.05); g.add(h); }
    g.add(hangKc(.4, [[0, -1.5, 0, 0, -1, 0]]));
    var yd = mocDon(g, 1.3);
    return { g: g, rong: 3.8, xo: 'treo', cao: yd + 1.5 };
  };

  DS['23965'] = function () {   /* sao nhỏ (xem 4 ảnh): sao 5 cánh, mặt trước pavé kín kim cương (1 giữa, 5 đầu cánh, 5 khe cánh), viền vàng; lưng phồng trơn bóng; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), R = 3.3, f = sao5(R, .52, .25), p = vienTu(f, 0, 0, 300), T = 1.2;
    var b = khoi(p, 0, 0, hoSo(T, .22), VL.vang); b.position.z = T / 2; g.add(b);
    var lu = vom(p, 0, 0, .8, VL.vang, null, 18); lu.rotation.y = PI; lu.position.z = -T / 2 + .05; g.add(lu);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .1; }, 0, 0, 300), .1, VL.vang, T / 2 + .02));
    var ds = [[0, 0, T / 2 + .1, 0, 0, 1]], i; for (i = 0; i < 5; i++) { var a = PI / 2 + i * 2 * PI / 5, b2 = a + PI / 5; ds.push([Math.cos(a) * 1.75, Math.sin(a) * 1.75, T / 2 + .1, 0, 0, 1]); ds.push([Math.cos(b2) * 1.0, Math.sin(b2) * 1.0, T / 2 + .1, 0, 0, 1]); }
    g.add(hangKc(.42, ds.slice(0, 1))); g.add(hangKc(.34, ds.slice(1)));
    var yd = mocDon(g, R - .15);
    return { g: g, rong: 2 * R * .95, xo: 'treo', cao: yd + R };
  };
  /* ---------- lô Khác 10: ngựa vàng, lá bạch quả, tam giác chữ Phúc, đôi keo, ấm trà ---------- */
  function khoiElip(vl, elips, ongs, k, bb, key, them) {   /* thú/tượng đúc LIỀN KHỐI: hợp mềm các elip + ống (soát: trước ghép quả trứng rời → trông như thú bóng bay) */
    function f(x, y, z) { var d = 9; elips.forEach(function (q) { d = S3.hop(d, S3.elip(x, y, z, q[0], q[1], q[2], q[3], q[4], q[5]), q[6] || k); });
      (ongs || []).forEach(function (q) { d = S3.hop(d, S3.ong(x, y, z, q[0], q[1], q[2], q[3], q[4], q[5], q[6]), q[7] || k); }); return them ? them(d, x, y, z) : d; }
    return khoiTac(f, bb, vl, 90, key); }
  function thanNgua(vl) {   /* thân ngựa đúc tròn (đầu bên trái −x) — soát 12/11: dựng LIỀN KHỐI bằng SDF (trước ghép quả trứng rời → trông như thú bóng bay):
     thân + ngực + mông hoà liền, cổ cong vươn, đầu thuôn có mõm, 2 tai nhọn, bờm nổi ngấn, 4 chân thon có móng, đuôi rủ cong */
    function f(x, y, z) { var az = Math.abs(z);   /* soát 2: tỷ lệ mập, chân ngắn, đầu to như ảnh (23999, 23958, 23943) */
      var d = S3.elip(x, y, z, .2, .35, 0, 2.05, 1.5, 1.45);
      d = S3.hop(d, S3.elip(x, y, z, -1.3, .6, 0, 1.25, 1.4, 1.3), .7);   /* ngực */
      d = S3.hop(d, S3.elip(x, y, z, 1.55, .5, 0, 1.3, 1.4, 1.38), .7);   /* mông */
      d = S3.hop(d, S3.ong(x, y, z, -1.45, 1.3, 0, -2.1, 2.55, 0, .78), .6);   /* cổ ngắn dày */
      d = S3.hop(d, S3.hop(S3.cau(x, y, z, -2.3, 2.95, 0, .82), S3.ong(x, y, z, -2.4, 2.85, 0, -3.3, 2.2, 0, .55), .5), .4);   /* đầu to + mõm */
      d = S3.hop(d, S3.ong(x, y, az, -2.05, 3.6, .38, -1.9, 4.15, .32, .17), .18);   /* 2 tai */
      d = S3.hop(d, S3.ong(x, y, z, -2.0, 3.6, 0, -.9, 1.95, 0, .3), .3);   /* bờm */
      [[-1.3, .58], [1.55, .58]].forEach(function (q) { d = S3.hop(d, S3.ong(x, y, az, q[0], -.2, q[1], q[0] + (q[0] > 0 ? .08 : -.04), -1.65, q[1], .42), .45);   /* chân ngắn mập */
        d = S3.hop(d, S3.elip(x, y, az, q[0] + (q[0] > 0 ? .08 : -.04), -1.8, q[1], .46, .2, .44), .15); });   /* móng */
      d = S3.hop(d, S3.hop(S3.ong(x, y, z, 2.4, 1.2, 0, 3.05, .85, 0, .32), S3.ong(x, y, z, 3.05, .85, 0, 3.1, -.1, 0, .26), .3), .35);   /* đuôi rủ */
      d += ranh(az - .02, .06, .05) * (y > 1.9 ? 1 : 0) * Math.max(0, Math.min(1, -x - .8));   /* ngấn bờm giữa */
      var ph = (x + 2.2) / .35; if (y > 2.0 && y < 3.8 && x > -2.4 && x < -1) d += ranh(ph - Math.round(ph), .07, .05) * (az < .3 ? 1 : 0);   /* các lọn bờm */
      d += ranh(Math.hypot(x + 3.4, y - 2.1) - .001, .12, .1) * (az > .1 && az < .4 ? 1 : 0);   /* lỗ mũi */
      return d; }
    var g = new THREE.Group(); g.add(khoiTac(f, [-4.0, -2.2, -1.9, 3.6, 4.5, 1.9], vl, 96, 'ngua2'));
    [-1, 1].forEach(function (s) { var mat = new THREE.Mesh(new THREE.SphereGeometry(.16, 12, 8), VL.vang); mat.position.set(-2.5, 3.1, s * .7); g.add(mat); });   /* mắt bóng */
    return g;
  }

  DS['23943'] = function () {   /* ngựa bập bênh vàng (xem 4 ảnh): ngựa vàng mờ đúc tròn, yên nổi; đứng trên ván bập bênh cong dày, mặt trước ván đính 1 hàng kim cương; khoen hàn đỉnh đầu + khoen lớn */
    var g = new THREE.Group(), h = thanNgua(VL.vangMo);
    var yen = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 14, 0, PI * 2, 0, 1.15), VL.vang); yen.scale.set(1.5, 1.45, 1.42); yen.position.set(.2, .55, 0); h.add(yen);
    var vh0 = vongHat(1, 1.15, .1, VL.vang); vh0.scale.set(1.37, 1, 1.3); vh0.position.x = .2; h.add(vh0);
    var sh = new THREE.Shape(); sh.absarc(.1, 5.2, 7.9, -PI / 2 - .52, -PI / 2 + .52, false); sh.absarc(.1, 5.2, 7.0, -PI / 2 + .52, -PI / 2 - .52, true);
    var van = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.6, bevelEnabled: true, bevelThickness: .15, bevelSize: .12, bevelSegments: 3, curveSegments: 40 }), VL.vang); van.position.z = -.8; h.add(van);
    var ds = []; for (var i = 0; i < 11; i++) { var a = -PI / 2 - .44 + i / 10 * .88; ds.push([.1 + Math.cos(a) * 7.45, 5.2 + Math.sin(a) * 7.45, .97, 0, 0, 1]); } h.add(hangKc(.3, ds));
    h.scale.x = -1; h.position.set(-2.4, -3.5, 0); g.add(h);   /* đầu quay phải như ảnh; khoen trên đầu */
    var yd = mocDon(g, .25);
    return { g: g, rong: 8.2, xo: 'treo', cao: yd + 6.5 };
  };

  DS['23999'] = function () {   /* ngựa cõng túi tiền (xem 4 ảnh): ngựa vàng phun cát đúc tròn, cổ cong, bờm nổi; lưng phủ khăn yên viền hạt bi, tua rủ 2 bên; trên lưng cõng túi tiền buộc nút; đinh kim cương ở vai + hông; XỎ DỌC từ ngực ra đuôi */
    var g = thanNgua(VL.vangMo), i;
    var khan = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 16, 0, PI * 2, 0, 1.5), VL.vangNham); khan.scale.set(1.7, 1.6, 1.62); khan.position.set(.2, .35, 0); g.add(khan);   /* soát: khăn yên phủ rộng, nổi ra ngoài thân */
    var vh = vongHat(1.0, 0, .12, VL.vang); vh.scale.set(1.7, 1, 1.62); vh.position.set(.2, .35 + 1.6 * Math.cos(1.5), 0); g.add(vh);
    [-1, 1].forEach(function (s) { for (i = 0; i < 3; i++) { var t = new THREE.Mesh(new THREE.CylinderGeometry(.06, .12, .6, 8), VL.vang); t.position.set(-.3 + i * .5, -.05, s * 1.6); g.add(t); }   /* tua */
      g.add(hangKc(.24, [[-1.35, .75, s * 1.42, 0, 0, s], [1.8, .7, s * 1.45, 0, 0, s]])); });
    var tui = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(.85, 24, 18), VL.vangMo); b.scale.y = .85; tui.add(b);
    var co = new THREE.Mesh(new THREE.CylinderGeometry(.32, .45, .45, 18), VL.vangMo); co.position.y = .8; tui.add(co);
    var mieng = new THREE.Mesh(new THREE.SphereGeometry(.42, 16, 10), VL.vangMo); mieng.scale.y = .6; mieng.position.y = 1.15; tui.add(mieng);
    var nut = new THREE.Mesh(new THREE.TorusGeometry(.38, .08, 8, 24), VL.vang); nut.rotation.x = PI / 2; nut.position.y = .78; tui.add(nut);
    tui.position.set(.25, 2.45, 0); g.add(tui);
    [-1, 1].forEach(function (s) { var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.set(s > 0 ? 2.82 : -2.47, .8, 0); g.add(l); });
    g.children.forEach(function (m) { m.position.y -= .8; });
    var b2 = new THREE.Group(); g.scale.x = -1; b2.add(g);   /* đầu quay phải như ảnh */
    return { g: b2, rong: 7.2, xo: 'xuyen', cao: 6.6, dung: true, uoc: 7.5 };
  };

  DS['24042'] = function () {   /* lá bạch quả (xem 4 ảnh): lá quạt, cuống ở đỉnh, mép dưới cong có khía giữa; mặt trước mài giác lấp lánh, viền hạt bi; lưng trơn; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = .9, A = 1.2, R = 4.6;
    var f = function (x, y) { var dx = x, dy = y - A, r = Math.hypot(dx, dy), an = Math.abs(Math.atan2(dx, -dy)); var d = Math.max(r - R, (an - 1.1) * r, .9 - r);
      d = -hop(-d, tron(x, y, 0, A - R - .1, .55), .25); return hop(d, tron(x, y, 0, A - .9, .5), .3); };
    var p = vienTu(f, 0, -1.4, 260);
    var b = khoi(p, 0, -1.4, hoSo(T, .2), VL.vangGiac); b.position.z = T / 2; g.add(b);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .16; }, 0, -1.4, 260), .14, VL.vang, T / 2 + .02));
    var yd = mocDon(g, A - .5);
    return { g: g, rong: 8.2, xo: 'treo', cao: yd + 3.6 };
  };

  DS['24031'] = function () {   /* tam giác chữ Phúc (xem 4 ảnh): tấm tam giác đỉnh trên, mặt mài giác lấp lánh; giữa ô vuông vàng mờ viền chỉ, chữ Phúc 福 nổi; lưng trơn; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.0;
    var f = function (x, y) { return daGiac([[0, 3.0], [-2.85, -2.0], [2.85, -2.0]])(x, y) - .3; }, p = vienTu(f, 0, -.3, 240);
    var b = khoi(p, 0, -.3, hoSo(T, .2), VL.vangGiac); b.position.z = T / 2; g.add(b);
    var vq = vienTu(function (x, y) { return Math.max(Math.abs(x), Math.abs(y + .5)) - 1.3; }, 0, -.5, 120);
    var mt = vanRieng(function (c, X, Y, k) { c.font = '700 ' + (2.0 * k) + 'px "Kaiti TC","STKaiti","Songti TC","PingFang TC",serif'; c.fillStyle = '#fff'; c.fillText('福', X(0), Y(-.45)); c.strokeStyle = '#fff'; c.lineWidth = .12 * k; c.strokeRect(X(-1.15), Y(.65), 2.3 * k, 2.3 * k); }, 2.6);
    mt.roughness = .45;
    var o = khoi(vq, 0, -.5, hoSo(.3, .06), VL.vangMo); o.position.z = T / 2 + .2; g.add(o);
    g.add(matPhang(vq, 10, mt, T / 2 + .21));
    var yd = mocDon(g, 2.85);
    return { g: g, rong: 6.4, xo: 'treo', cao: yd + 2.3 };
  };

  DS['24010'] = function () {   /* đôi keo (xem 4 ảnh; user: là 2 TRĂNG KHUYẾT): 2 miếng keo hình trăng khuyết, 2 đầu nhọn — lưng vòm dày vàng phun cát, mặt phẳng chạm lộng chỉ cuộn + giọt nước, viền chỉ; 2 miếng RỜI NHAU (không dính), quay mặt chạm vào nhau, khe giữa hình lá; mỗi miếng 1 khoen nhỏ ở đầu nhọn trên, móc chung 1 khoen */
    var g = new THREE.Group(), Ro = 3.1, Ri = 3.1, cI = -2.2, xt = -1.1, yt = 2.9, dx = 1.15;   /* user: 2 miếng KHÔNG dính nhau → chừa khe hở cả ở 2 đầu nhọn */
    var aO = Math.atan2(yt, xt), aI = Math.atan2(yt, xt - cI);
    var sh = new THREE.Shape(); sh.absarc(0, 0, Ro, -aO, aO, false); sh.absarc(cI, 0, Ri, aI, -aI, true);   /* trăng khuyết: cung ngoài lồi phải, cung trong lõm */
    var mt = veMau(7, function (c, X, Y, k) { c.fillStyle = '#8a6428'; c.fillRect(0, 0, 512, 512); c.strokeStyle = '#ffd36a'; c.fillStyle = '#f2c35e'; c.lineCap = 'round'; c.lineWidth = .2 * k;
      c.beginPath(); c.arc(X(cI), Y(0), (Ri + .35) * k, -aI * .92, aI * .92); c.stroke();   /* chỉ dọc theo mép trong */
      c.beginPath(); c.arc(X(0), Y(0), (Ro - .35) * k, -aO * .94, aO * .94); c.stroke();   /* chỉ dọc theo mép ngoài */
      [[1.85, .95, 1], [1.85, -.95, -1]].forEach(function (q) { c.beginPath(); for (var t = 0; t <= 1; t += .02) { var a = (q[2] > 0 ? PI : 0) + q[2] * t * PI * 2.2, r = .62 * (1 - t * .8); c.lineTo(X(q[0] + Math.cos(a) * r), Y(q[1] + Math.sin(a) * r)); } c.stroke(); });   /* 2 cuộn xoắn */
      [[1.15, 2.0, .5], [1.15, -2.0, -.5]].forEach(function (q) { c.save(); c.translate(X(q[0]), Y(q[1])); c.rotate(q[2]); c.beginPath(); c.ellipse(0, 0, .22 * k, .5 * k, 0, 0, 7); c.stroke(); c.restore(); });   /* giọt nước gần 2 đầu nhọn */
      c.beginPath(); c.arc(X(2.0), Y(0), .26 * k, 0, 7); c.fill(); });
    mt.repeat.set(1 / 7, 1 / 7); mt.offset.set(.5, .5);
    var mat = new THREE.MeshStandardMaterial({ map: mt, metalness: .9, roughness: .35 });
    [-1, 1].forEach(function (s) { var k = new THREE.Group(), m = new THREE.Group();
      var than = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .5, bevelEnabled: true, bevelThickness: .75, bevelSize: .1, bevelSegments: 6, curveSegments: 48 }), VL.vangMo); than.position.z = -1.25; m.add(than);   /* lưng vòm dày */
      var mp = new THREE.Mesh(new THREE.ShapeGeometry(sh, 48), mat); mp.position.z = .01; m.add(mp);
      m.add(ongVien(sh.getPoints(60).slice(0, -1), .12, VL.vang, .03));
      var kh = khoen(.3, .1, VL.vang); kh.position.set(xt, yt + .25, -.4); kh.rotation.y = PI / 2; m.add(kh);
      m.scale.x = .7; m.position.x = dx; k.add(m); k.rotation.y = -.3;   /* ép ngang 0,7 cho cân tỉ lệ cao/rộng như ảnh */
      var m2 = new THREE.Group(); m2.add(k); if (s < 0) m2.scale.x = -1; g.add(m2); });
    var yd = mocDon(g, yt + .3);
    return { g: g, rong: 5.8, xo: 'treo', cao: yd + yt };
  };


  var vanAmTra = vanNoi(function (c, w, h) {   /* thân ấm (u quanh thân, v từ đáy lên): 6 cành lá dương xỉ chạm nổi */
    c.strokeStyle = '#fff'; c.lineCap = 'round';
    for (var k = 0; k < 6; k++) { var x0 = (k + .5) / 6 * w; c.lineWidth = 7; c.beginPath(); c.moveTo(x0 - 6, h * .9); c.quadraticCurveTo(x0 + 10, h * .6, x0 + 4, h * .3); c.stroke();
      for (var q = 0; q < 9; q++) { var t = q / 9, y = h * (.86 - t * .52), x = x0 - 4 + t * 10, L = 30 * (1 - t * .6); c.lineWidth = 5;
        [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + s * L * .6, y - L * .2, x + s * L, y - L * .55); c.stroke(); }); } }
    c.lineWidth = 6; c.beginPath(); c.moveTo(0, h * .12); c.lineTo(w, h * .12); c.stroke(); });
  DS['23972'] = function () {   /* ấm trà (xem 4 ảnh, user: làm kĩ): thân phình tròn có đế, chạm nổi 6 cành lá dương xỉ xen chùm hạt bi; vai gờ viền hạt; nắp 5 tầng ngấn bậc thang, núm tròn; vòi côn chếch lên có khoanh; quai tròn dày; đáy ruby giữa vòng hạt; khoen hàn núm + khoen lớn */
    var g = new THREE.Group(), j, k;
    function rT(t) { return 1.3 + .4 * t + 1.3 * Math.pow(Math.sin(PI * t), .85); }
    var pf = [[.001, -1.95], [1.2, -1.95], [1.32, -1.85]]; for (j = 0; j <= 30; j++) { var t = j / 30; pf.push([rT(t), -1.75 + t * 3.0]); }
    var bt = vanAmTra.clone(); bt.needsUpdate = true;
    g.add(xoayLuoi(pf, 120, null, hai(new THREE.MeshStandardMaterial({ color: 0xf2c25a, metalness: 1, roughness: .3, bumpMap: bt, bumpScale: 2.2 }))));
    function rY(y) { return rT(Math.max(0, Math.min(1, (y + 1.75) / 3.0))); }
    var vai_ = khoen(1.72, .13, VL.vang); vai_.rotation.x = PI / 2; vai_.position.y = 1.27; g.add(vai_);
    var vh = vongHat(1.62, 1.12, .09, VL.vang); g.add(vh);
    var nap = [[1.66, 1.3], [1.6, 1.46], [1.44, 1.5], [1.4, 1.63], [1.24, 1.67], [1.2, 1.8], [1.02, 1.84], [.97, 1.97], [.78, 2.01], [.73, 2.13], [.5, 2.17], [.45, 2.28], [.001, 2.3]];
    g.add(xoayLuoi(nap, 72, null, hai(VL.vang)));   /* nắp 5 tầng ngấn */
    var co = new THREE.Mesh(new THREE.CylinderGeometry(.2, .26, .22, 16), VL.vang); co.position.y = 2.38; g.add(co);
    var num = new THREE.Mesh(new THREE.SphereGeometry(.36, 18, 12), VL.vang); num.position.y = 2.68; g.add(num);
    var ht = new THREE.SphereGeometry(.11, 8, 6), ds = [];   /* chùm hạt bi giữa các cành lá */
    for (k = 0; k < 6; k++) { var a0 = k / 6 * PI * 2; [[-.75, 0], [-.35, -.11], [-.35, .11], [.05, 0], [.05, -.22], [.05, .22], [.45, -.11], [.45, .11], [.85, 0]].forEach(function (q) { ds.push([a0 + q[1], q[0]]); }); }
    var im = new THREE.InstancedMesh(ht, VL.vang, ds.length), m4 = new THREE.Matrix4();
    ds.forEach(function (d, i) { var r = rY(d[1]) + .02; m4.makeTranslation(Math.sin(d[0]) * r, d[1], Math.cos(d[0]) * r); im.setMatrixAt(i, m4); }); g.add(im);
    var A = new V3(-2.25, -.75, 0), B = new V3(-3.75, .8, 0), dir = B.clone().sub(A), L = dir.length(); dir.normalize();
    var voi = new THREE.Group(), vo = new THREE.Mesh(new THREE.CylinderGeometry(.3, .58, L, 24, 1, true), hai(VL.vang)); voi.add(vo);
    [-.25, .05, .35].forEach(function (t) { var rr = .58 + (.3 - .58) * (t + .5), kk = khoen(rr + .02, .06, VL.vang); kk.rotation.x = PI / 2; kk.position.y = t * L; voi.add(kk); });   /* khoanh trên vòi */
    var mv = khoen(.32, .08, VL.vang); mv.rotation.x = PI / 2; mv.position.y = L / 2; voi.add(mv);
    var lo = new THREE.Mesh(new THREE.CircleGeometry(.28, 16), VL.toi); lo.rotation.x = -PI / 2; lo.position.y = L / 2 - .05; voi.add(lo);
    voi.quaternion.setFromUnitVectors(new V3(0, 1, 0), dir); voi.position.copy(A).addScaledVector(dir, L / 2); g.add(voi);
    var quai = new THREE.Mesh(new THREE.TorusGeometry(1.05, .26, 14, 40, PI * 1.3), VL.vang); quai.rotation.z = -PI * .65; quai.position.set(2.72, .1, 0); g.add(quai);
    var nq = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), VL.vang); nq.position.set(3.0, 1.12, 0); g.add(nq);   /* nút tì ngón trên quai */
    g.add(hangKc(.3, [[0, -1.98, 0, 0, -1, 0]], VLda.rubyG));
    for (k = 0; k < 12; k++) { var b = k / 12 * PI * 2, h = new THREE.Mesh(ht, VL.vang); h.position.set(Math.sin(b) * .8, -1.97, Math.cos(b) * .8); g.add(h); }   /* vòng hạt quanh ruby đáy */
    var yd = mocDon(g, 3.0);
    return { g: g, rong: 7.0, xo: 'treo', cao: yd + 1.95 };
  };

  /* ---------- lô Khác 11: thẻ bài núi, hạt vuông đá vàng chanh, cà rốt garnet, móc xoáy, ổ khoá đá, trăng đính đá ---------- */
  DS['23960'] = function () {   /* thẻ bài (xem 4 ảnh): thẻ chữ nhật bo tròn 2 đầu; mặt trước chia chéo theo đường sống núi răng cưa: nửa dưới-trái chạm vân đá núi gồ ghề, nửa trên-phải vàng mờ trơn; 1 viên kim cương ổ tròn giữa; lưng chạm hoa văn chữ vạn ô lưới; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), W = 1.85, H = 3.9, T = 1.1;
    var f = function (x, y) { return Math.hypot(Math.max(Math.abs(x), 0), Math.max(Math.abs(y) - (H - W), 0)) - W; }, p = vienTu(f, 0, 0, 200);
    var b = khoi(p, 0, 0, hoSo(T, .25), VL.vangMo); b.position.z = T / 2; g.add(b);
    var song = [[-1.9, 2.6], [-1.1, 2.1], [-.7, 2.5], [-.1, 1.3], [.5, .9], [.2, .1], [.9, -.6], [1.2, -1.5], [1.9, -2.2]];
    var hg = 7; function rnd() { hg = (hg * 16807) % 2147483647; return hg / 2147483647; }   /* ngẫu nhiên cố định → mẫu nào cũng giống nhau */
    var mt = vanRieng(function (c, X, Y, k) { c.save(); c.beginPath(); c.moveTo(X(-3), Y(-5)); song.forEach(function (q) { c.lineTo(X(q[0]), Y(q[1])); }); c.lineTo(X(3), Y(-5)); c.closePath(); c.clip();
      c.fillStyle = '#9a9a9a'; c.fillRect(0, 0, 512, 512);
      for (var i = 0; i < 260; i++) { var x = -2 + rnd() * 4, y = -4 + rnd() * 7, a = -.9 + rnd() * .5, L = .3 + rnd() * .7, v = Math.floor(120 + rnd() * 135); c.strokeStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; c.lineWidth = (.06 + rnd() * .1) * k;
        c.beginPath(); c.moveTo(X(x), Y(y)); c.lineTo(X(x + Math.cos(a) * L), Y(y + Math.sin(a) * L)); c.lineTo(X(x + Math.cos(a) * L + .2), Y(y + Math.sin(a) * L + .35)); c.stroke(); }   /* vân đá núi */
      c.restore(); c.strokeStyle = '#fff'; c.lineWidth = .12 * k; c.beginPath(); song.forEach(function (q, i) { c[i ? 'lineTo' : 'moveTo'](X(q[0]), Y(q[1])); }); c.stroke(); }, 2.4);
    mt.roughness = .45; mt.color.set(0xf0c058);
    g.add(matPhang(vienTu(function (x, y) { return f(x, y) + .05; }, 0, 0, 200), 10, mt, T / 2 + .005));
    var lung = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .28 * k; c.lineCap = 'square';
      for (var r = -3; r <= 3; r++) for (var q = -1; q <= 1; q++) { var cx = q * 1.3, cy = r * 1.3, s = .5; c.beginPath(); c.moveTo(X(cx - s), Y(cy + s)); c.lineTo(X(cx + s), Y(cy + s)); c.lineTo(X(cx + s), Y(cy - s)); c.lineTo(X(cx - s * .2), Y(cy - s)); c.lineTo(X(cx - s * .2), Y(cy + s * .2)); c.stroke(); } }, 2.6);   /* lưới chữ vạn */
    lung.roughness = .45; g.add(matPhang(vienTu(function (x, y) { return f(x, y) + .05; }, 0, 0, 200), 10, lung, -T / 2 - .005, true));
    var o = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .3, 24), VL.vang); o.rotation.x = PI / 2; o.position.set(.55, .15, T / 2 + .1); g.add(o);
    g.add(hangKc(.4, [[.55, .15, T / 2 + .18, 0, 0, 1]]));
    var yd = mocDon(g, H - .05);
    return { g: g, rong: 2 * W, xo: 'treo', cao: yd + H };
  };

  var daChanh = new THREE.MeshPhysicalMaterial({ color: 0xc6e01c, metalness: .35, roughness: 0, flatShading: true, clearcoat: 1, emissive: 0x6c8a00, emissiveIntensity: .45, envMapIntensity: 3 });   /* đá vàng chanh giác */
  DS['23794'] = function () {   /* hạt vuông đá vàng chanh (xem 4 ảnh): hạt vuông bo góc; mặt trước 1 viên đá vàng chanh giác vuông (cushion) 4 chấu góc, quanh là 1 vòng kim cương nhỏ (halo); thành khoét lỗ tròn; lưng chạm lộng hoa 4 cánh; lỗ xỏ 2 sườn (dây chạy dọc qua thân) */
    var g = new THREE.Group(), H = 3.3, T = 3.6, rb = .9;
    function vu(h, r) { return vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - (h - r), 0), Math.max(Math.abs(y) - (h - r), 0)) - r; }, 0, 0, 200); }
    g.add(thanhVien(vu(H - .1, rb), T - .2, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 8; k++) { c.beginPath(); c.arc((k + .5) * w / 8, h / 2, h * .15, 0, 7); c.fill(); } })), 1));   /* soát đợt 5: lỗ nhỏ, thành liền */
    var mat = khoi(vu(H, rb), 0, 0, hoSo(.6, .15), VL.vang); mat.position.z = T / 2; g.add(mat);
    g.add(matPhang(vu(H - .15, rb), 2 * H, longVang(vanLong(function (c, w, h) { var cx = w / 2, cy = h / 2; c.lineWidth = 30; c.strokeRect(15, 15, w - 30, h - 30);
      for (var i = 0; i < 4; i++) { var a = i * PI / 2 + PI / 4; c.beginPath(); c.ellipse(cx + Math.cos(a) * 110, cy + Math.sin(a) * 110, 120, 55, a, 0, 7); c.stroke(); } c.beginPath(); c.arc(cx, cy, 40, 0, 7); c.fill(); })), -T / 2, true));
    var nen = new THREE.Mesh(new THREE.PlaneGeometry(2 * H - 1, 2 * H - 1), new THREE.MeshStandardMaterial({ color: 0xe8d040, metalness: .1, roughness: .2, transparent: true, opacity: .85, side: THREE.DoubleSide })); nen.position.z = -T / 2 + .7; g.add(nen);
    var ds = [], n = 7, i; for (i = 0; i < n; i++) { var t = (i + .5) / n * 2 - 1; [[t * 2.45, 2.62], [t * 2.45, -2.62], [2.62, t * 2.45], [-2.62, t * 2.45]].forEach(function (q) { ds.push([q[0], q[1], T / 2 + .65, 0, 0, 1]); }); }
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { ds.push([q[0] * 2.62, q[1] * 2.62, T / 2 + .65, 0, 0, 1]); });
    g.add(hangKc(.25, ds));   /* halo */
    var rr = 2.45, dg = new THREE.LatheGeometry([new V2(0, -.7 * rr), new V2(rr, -.04 * rr), new V2(rr, .04 * rr), new V2(.86 * rr, .17 * rr), new V2(.62 * rr, .29 * rr), new V2(0, .29 * rr)], 4); dg.rotateY(PI / 4); dg.rotateX(PI / 2); dg = dg.toNonIndexed(); dg.computeVertexNormals();
    var da_ = new THREE.Mesh(dg, daChanh); da_.position.z = T / 2 + .75; g.add(da_);   /* giác vuông: mặt bàn + 2 tầng giác */
    var vk = khoi(vu(2.15, .5), 0, 0, hoSo(.35, .1), VL.vang); vk.position.z = T / 2 + .7; g.add(vk);
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var c = new THREE.Mesh(new THREE.CylinderGeometry(.17, .2, 1.2, 10), VL.vang); c.rotation.x = PI / 2; c.position.set(q[0] * 1.75, q[1] * 1.75, T / 2 + 1.1); g.add(c);
      var dk = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), VL.vang); dk.position.set(q[0] * 1.68, q[1] * 1.68, T / 2 + 1.7); g.add(dk); });   /* 4 chấu */
    [-1, 1].forEach(function (s) { var cu = new THREE.Mesh(new THREE.TorusGeometry(.6, .15, 10, 28), VL.vang); cu.rotation.y = PI / 2; cu.position.x = s * (H - .08); g.add(cu);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.52, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.x = s * (H - .02); g.add(l); });
    return { g: g, rong: 2 * H, xo: 'xuyen', cao: 2 * H };
  };

  DS['23849'] = function () {   /* cà rốt garnet (xem 4 ảnh): củ cà rốt = 1 viên garnet giọt nước giác (đầu nhọn xuống) trong ổ vàng viền hạt, thành ổ khoét lỗ tròn; ngọn = 2 viên kim cương marquise xoè chữ V trong ổ vàng, chấu nhỏ ở đầu; XỎ DỌC từ ngọn xuống mũi nhọn */
    var g = new THREE.Group(), T = 2.4;
    var f = giot(.42, true), p = vienTu(f, 0, -.2, 200);   /* giọt nước nhọn xuống */
    g.add(thanhVien(p, T, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 10; k++) { c.beginPath(); c.arc((k + .5) * w / 10, h * .5, h * .14, 0, 7); c.fill(); } })), 1));   /* soát đợt 5: lỗ nhỏ, thành liền */
    var day = khoi(p, 0, -.2, hoSo(.4, .1), VL.vang); day.position.z = -T / 2 + .4; g.add(day);
    g.add(ongVien(p, .14, VL.vang, T / 2)); g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .12; }, 0, -.2, 200), .07, VL.vang, T / 2 + .1));
    var gm = new THREE.MeshPhysicalMaterial({ color: 0xa00c4c, metalness: .3, roughness: 0, flatShading: true, clearcoat: 1, envMapIntensity: 2.4, emissive: 0x5a0628, emissiveIntensity: .35 });
    var gn = vom(vienTu(function (x, y) { return f(x, y) + .22; }, 0, -.2, 22), 0, -.2, 1.0, gm, null, 4); gn.position.z = T / 2 - .2; g.add(gn);   /* garnet giọt nước mài giác */
    [-1, 1].forEach(function (s) { var la = new THREE.Group();
      var mq = function (x, y) { return Math.max(tron(x, y, .45, .9, 1.0), tron(x, y, -.45, .9, 1.0)); }, pm = vienTu(mq, 0, .9, 80);
      var o = khoi(vienTu(function (x, y) { return mq(x, y) - .12; }, 0, .9, 80), 0, .9, hoSo(.8, .12), VL.vang); o.position.z = .4; la.add(o);
      var kc = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(pm), { depth: .2, bevelEnabled: true, bevelThickness: .35, bevelSize: .08, bevelSegments: 1, curveSegments: 6 }), VL.kc); kc.position.z = .45; la.add(kc);
      var dk = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), VL.vang); dk.position.set(0, 1.85, .7); la.add(dk);
      la.scale.setScalar(.85); la.rotation.z = -s * .62; la.position.set(s * .22, 2.2, 0); g.add(la); });
    var cao = 6.6;
    g.children.forEach(function (m) { m.position.y -= .4; });
    return { g: docDay(g, cao), rong: cao, xo: 'ong', cao: 4, uoc: 4.2, dungXem: true };   /* xem gần: dựng đứng như ảnh */
  };

  var vanMocXoay = vanNoi(function (c, w, h) {   /* thân móc xoáy (u quanh, v dọc): 2 dải ô chữ vạn + ô chữ Tạng, viền hạt */
    c.strokeStyle = '#fff'; c.lineWidth = 7; c.lineCap = 'square';
    [[.22, .4], [.6, .78]].forEach(function (b) { var y0 = h * (1 - b[1]), y1 = h * (1 - b[0]), hh = y1 - y0;
      for (var k = 0; k < 8; k++) { var x0 = k * w / 8 + 6, x1 = (k + 1) * w / 8 - 6; c.strokeRect(x0, y0 + 4, x1 - x0, hh - 8);
        if (k % 2) { var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, s = Math.min(x1 - x0, hh) * .3; c.beginPath(); c.moveTo(cx - s, cy - s); c.lineTo(cx - s, cy); c.lineTo(cx + s, cy); c.lineTo(cx + s, cy + s); c.moveTo(cx, cy - s); c.lineTo(cx, cy + s); c.moveTo(cx - s, cy + s); c.lineTo(cx, cy + s); c.moveTo(cx + s, cy - s); c.lineTo(cx, cy - s); c.stroke(); }   /* chữ vạn */
        else { var cx2 = (x0 + x1) / 2, cy2 = (y0 + y1) / 2; c.beginPath(); c.arc(cx2, cy2 - 4, 10, PI, 0); c.moveTo(cx2 - 14, cy2 + 10); c.lineTo(cx2 + 14, cy2 + 10); c.moveTo(cx2, cy2 + 6); c.lineTo(cx2, cy2 + 22); c.stroke(); } } });   /* nét chữ Tạng */
  });
  DS['24069'] = function () {   /* móc xoáy (xem 4 ảnh): ống trụ 2 nửa vặn ren vào nhau ở giữa; thân chạm 2 dải ô chữ vạn + chữ Tạng, viền hạt bi các khoanh; 2 đầu là vương miện 8 cánh nhọn loe như đài sen, giữa lỗ xỏ; XỎ DỌC */
    var g = new THREE.Group(), R = 1.95, L = 4.1, i;
    var bt = vanMocXoay.clone(); bt.needsUpdate = true;
    var than = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 2 * L - 1.8, 64, 1, true), new THREE.MeshStandardMaterial({ color: 0xf2c25a, metalness: 1, roughness: .3, bumpMap: bt, bumpScale: 2.4 })); g.add(than);
    [-1, 1].forEach(function (s) {
      [0, 2.0, 3.05].forEach(function (y) { var k = khoen(R + .02, .13, VL.vang); k.rotation.x = PI / 2; k.position.y = s * y; g.add(k); g.add(vongHat(R + .14, s * (y + .26), .09, VL.vang)); g.add(vongHat(R + .14, s * (y - .26), .09, VL.vang)); });
      var cg = new THREE.Mesh(new THREE.CylinderGeometry(s > 0 ? R * 1.08 : R, s > 0 ? R : R * 1.08, .7, 48, 1, true), hai(VL.vang)); cg.position.y = s * (L - .55); g.add(cg);
      var nap = new THREE.Mesh(new THREE.CircleGeometry(R * 1.02, 48), VL.vang); nap.rotation.x = -s * PI / 2; nap.position.y = s * (L - .2); g.add(nap);
      for (var q = 0; q < 8; q++) { var a = q / 8 * PI * 2, cn = new THREE.Mesh(new THREE.ConeGeometry(.85, 1.15, 4), VL.vang), o = new THREE.Object3D();
        o.position.set(Math.sin(a) * R * .82, s * (L + .25), Math.cos(a) * R * .82); o.lookAt(Math.sin(a) * R * 1.6, s * (L + 1.3), Math.cos(a) * R * 1.6); cn.rotation.x = PI / 2; o.add(cn); g.add(o); }   /* vương miện 8 cánh nhọn */
      var tam = new THREE.Mesh(new THREE.CylinderGeometry(.75, .9, .5, 20), VL.vang); tam.position.y = s * (L + .05); g.add(tam);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.x = -s * PI / 2; l.position.y = s * (L + .31); g.add(l); });
    var ren = new THREE.Mesh(new THREE.CylinderGeometry(R - .05, R - .05, .5, 48, 1, true), VL.vangMo); g.add(ren);
    return { g: ongNam(g), rong: 2 * L + 1, xo: 'ong', cao: 2 * R * 1.3, uoc: 4.8 };
  };

  DS['23933'] = function () {   /* ổ khoá đính đá (xem 4 ảnh): thân khoá chữ nhật bo góc dày, mặt trước + sau pavé 2 hàng × 5 kim cương, 2 cạnh bên 2 × 2; đáy có khe oval; quai chữ U trên đỉnh; khoen lớn */
    var g = new THREE.Group(), W = 2.9, H = 2.1, D = 2.6;
    var p = vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - W + .5, 0), Math.max(Math.abs(y) - H + .5, 0)) - .5; }, 0, 0, 160);
    var b = khoi(p, 0, 0, hoSo(D, .3), VL.vangMo); b.position.z = D / 2; g.add(b);
    [-1, 1].forEach(function (s) { var ds = []; for (var r = 0; r < 2; r++) for (var c = 0; c < 5; c++) ds.push([(c - 2) * 1.08, (r - .5) * 1.25, s * (D / 2 - .05), 0, 0, s]); g.add(hangKc(.46, ds));
      g.add(chuoiHat(vienTu(function (x, y) { return Math.max(Math.abs(x) - W + .22, Math.abs(y) - H + .22); }, 0, 0, 160), .1, VL.vang, s * (D / 2 + .02)));
      var ds2 = []; for (var r2 = 0; r2 < 2; r2++) for (var c2 = 0; c2 < 2; c2++) ds2.push([s * (W - .05), (r2 - .5) * 1.25, (c2 - .5) * 1.1, s, 0, 0]); g.add(hangKc(.4, ds2)); });
    var khe = new THREE.Mesh(new THREE.CircleGeometry(1, 24), VL.toi); khe.scale.set(1.4, .5, 1); khe.rotation.x = PI / 2; khe.position.y = -H - .01; g.add(khe);
    var quai = new THREE.Mesh(new THREE.TorusGeometry(1.55, .3, 14, 40, PI), VL.vang); quai.position.y = H - .1; g.add(quai);
    [-1, 1].forEach(function (s) { var c = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .4, 14), VL.vang); c.position.set(s * 1.55, H - .2, 0); g.add(c); });
    var kh = new THREE.Group(), kl = khoen(1.05, .27, VL.vang); kl.rotation.y = PI / 2; kl.scale.y = 1.3; kh.add(kl); kh.position.y = H + 1.55 + 1.2; g.add(kh); g.userData.khoa = kh;
    g.children.forEach(function (m) { m.position.y -= H + 2.75; });
    return { g: g, rong: 2 * W, xo: 'treo', cao: 2 * H + 4 };
  };

  DS['23949'] = function () {   /* trăng treo (xem 4 ảnh): trăng khuyết lưỡi liềm (lồi phải), mặt trước đính 7 kim cương dọc thân trăng to dần ở giữa, viền vàng; lưng phồng trơn bóng; khoen hàn ở đầu nhọn trên + khoen lớn */
    var g = new THREE.Group(), Ro = 3.2, ri = 3.2, ci = -2.2, xt = -1.1, yt = 3.0, T = 1.0;
    var aO = Math.atan2(yt, xt), aI = Math.atan2(yt, xt - ci), sh = new THREE.Shape(); sh.absarc(0, 0, Ro, -aO, aO, false); sh.absarc(ci, 0, ri, aI, -aI, true);
    var b = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: T, bevelEnabled: true, bevelThickness: .35, bevelSize: .15, bevelSegments: 4, curveSegments: 48 }), VL.vang); b.position.z = -T / 2 - .2; g.add(b);
    var ds = [], i; for (i = 0; i < 7; i++) { var y = -2.25 + i / 6 * 4.5, xo = Math.sqrt(Ro * Ro - y * y), xi = ci + Math.sqrt(ri * ri - y * y), w = xo - xi; ds.push([(xo + xi) / 2, y, T / 2 + .18, Math.min(.5, w * .3)]); }
    ds.forEach(function (d) { g.add(hangKc(d[3], [[d[0], d[1], d[2], 0, 0, 1]])); var o = new THREE.Mesh(new THREE.TorusGeometry(d[3] + .04, .05, 6, 24), VL.vang); o.position.set(d[0], d[1], d[2] + .05); g.add(o); });
    g.add(ongVien(sh.getPoints(60).slice(0, -1), .08, VL.vang, T / 2 + .14));
    g.children.forEach(function (m) { m.position.x -= xt; });
    var yd = mocDon(g, yt);
    return { g: g, rong: Ro - xt, xo: 'treo', cao: yd + yt };
  };
  /* ---------- lô Khác 12: hạt bạc ngọc băng, khánh hoa chữ Phúc, chuông đá, chữ Thọ lộng, xu nhỏ, chữ X ---------- */
  DS['23879'] = function () {   /* ngọc du long (xem 4 ảnh): hạt vuông bo góc xi bạc sáng; mặt trước ngọc băng xanh tròn mài vòm to chiếm gần hết mặt, 4 chấu; viền đá ôm sát: mỗi cạnh 1 viên baguette dài, 4 góc mỗi góc 3 viên tròn; thành khoét lỗ; lưng nút thắt 4 vòng chạm lộng; lỗ xỏ 2 sườn */
    var g = new THREE.Group(), H = 3.1, T = 4.0, rb = 1.0, i, vl = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .2, envMap: bacEnv });
    function vu(h, r) { return vienTu(function (x, y) { return Math.hypot(Math.max(Math.abs(x) - (h - r), 0), Math.max(Math.abs(y) - (h - r), 0)) - r; }, 0, 0, 200); }
    var lv = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .2, envMap: bacEnv, alphaMap: vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 8; k++) { c.beginPath(); c.arc((k + .5) * w / 8, h / 2, h * .14, 0, 7); c.fill(); } }), alphaTest: .5, side: THREE.DoubleSide });
    g.add(thanhVien(vu(H - .1, rb), T - .2, lv, 1));
    var mat = khoi(vu(H, rb), 0, 0, hoSo(.6, .15), vl); mat.position.z = T / 2; g.add(mat);
    var lung = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: .2, envMap: bacEnv, alphaMap: vanLong(function (c, w, h) { var cx = w / 2, cy = h / 2; c.lineWidth = 30; c.strokeRect(15, 15, w - 30, h - 30); c.lineWidth = 20;
      for (var k = 0; k < 4; k++) { var a = k * PI / 2 + PI / 4; c.beginPath(); c.arc(cx + Math.cos(a) * 95, cy + Math.sin(a) * 95, 72, 0, 7); c.stroke(); } c.beginPath(); c.arc(cx, cy, 30, 0, 7); c.fill(); }), alphaTest: .5, side: THREE.DoubleSide });
    g.add(matPhang(vu(H - .15, rb), 2 * H, lung, -T / 2, true));
    var nen = new THREE.Mesh(new THREE.PlaneGeometry(2 * H - 1, 2 * H - 1), new THREE.MeshStandardMaterial({ color: 0x5e9a74, metalness: .2, roughness: .4, side: THREE.DoubleSide })); nen.position.z = -T / 2 + .9; g.add(nen);
    var z0 = T / 2 + .62;
    for (i = 0; i < 4; i++) { var a = i * PI / 2, m = new THREE.Mesh(new THREE.BoxGeometry(2.1, .62, .34), VL.kc); m.position.set(Math.cos(a) * 2.45, Math.sin(a) * 2.45, z0); m.rotation.z = a + PI / 2; g.add(m);
      var kv = new THREE.Mesh(new THREE.BoxGeometry(2.3, .78, .25), vl); kv.position.set(Math.cos(a) * 2.45, Math.sin(a) * 2.45, z0 - .14); kv.rotation.z = a + PI / 2; g.add(kv); }   /* baguette mỗi cạnh */
    var ds = []; [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { ds.push([q[0] * 2.3, q[1] * 2.3, z0, 0, 0, 1]); ds.push([q[0] * 1.55, q[1] * 2.55, z0, 0, 0, 1]); ds.push([q[0] * 2.55, q[1] * 1.55, z0, 0, 0, 1]); });
    g.add(hangKc(.32, ds));
    var o = new THREE.Mesh(new THREE.TorusGeometry(2.05, .14, 10, 48), vl); o.position.z = z0 - .05; g.add(o);
    var ngoc = da(0x5fcf92, vanMay, .16, .42), v = vien(2.0, ngoc, .8); v.position.z = z0 - .1; g.add(v);
    [1, 3, 5, 7].forEach(function (k) { var a = k * PI / 4, c = new THREE.Mesh(new THREE.CylinderGeometry(.15, .17, 1.0, 10), vl); c.rotation.x = PI / 2; c.position.set(Math.cos(a) * 2.05, Math.sin(a) * 2.05, z0 + .35); g.add(c);
      var dk = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), vl); dk.position.set(Math.cos(a) * 1.95, Math.sin(a) * 1.95, z0 + .85); g.add(dk); });
    [-1, 1].forEach(function (s) { var cu = new THREE.Mesh(new THREE.TorusGeometry(.6, .15, 10, 28), vl); cu.rotation.y = PI / 2; cu.position.x = s * (H - .08); g.add(cu);
      var l = new THREE.Mesh(new THREE.CircleGeometry(.52, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.x = s * (H - .02); g.add(l); });
    return { g: g, rong: 2 * H, xo: 'xuyen', cao: 2 * H };
  };


  DS['24083'] = function () {   /* khánh bình an (xem 4 ảnh): tấm khánh viền lượn 8 múi như mây/hoa, vàng phun cát; nền chấm hạt bi nổi dày; giữa khung tứ diệp viền chỉ, chữ Phúc 福 nổi; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.1;
    var f0 = cungHoa(8, 2.75, .55, PI / 8), f = function (x, y) { return f0(x, y / 1.04); }, p = vienTu(f, 0, 0, 260);
    var hg = 11; function rnd() { hg = (hg * 16807) % 2147483647; return hg / 2147483647; }
    var mt = vanRieng(function (c, X, Y, k) { for (var i = 0; i < 9000; i++) { c.fillStyle = rnd() < .5 ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.22)'; c.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
      c.fillStyle = '#fff'; for (var j = 0; j < 160; j++) { var a = rnd() * PI * 2, r = 1.75 + rnd() * 1.35; c.beginPath(); c.arc(X(Math.cos(a) * r), Y(Math.sin(a) * r), .12 * k, 0, 7); c.fill(); }   /* chấm hạt */
      c.strokeStyle = '#fff'; c.lineWidth = .14 * k; c.beginPath(); for (var t = 0; t <= 1.001; t += .01) { var b = t * PI * 2, rr = 1.35 + .28 * Math.abs(Math.cos(2 * b)); c.lineTo(X(Math.cos(b) * rr), Y(Math.sin(b) * rr)); } c.stroke();   /* khung tứ diệp */
      c.font = '700 ' + (1.9 * k) + 'px "Kaiti TC","STKaiti","Songti TC","PingFang TC",serif'; c.fillText('福', X(0), Y(-.08)); }, 2.6);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, 0, hoSo(T, .25), mt); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, 0, .3, mt, null, 16); v.position.z = T / 2 - .05; g.add(v);
    var yd = mocDon(g, 2.85);
    return { g: g, rong: 6.8, xo: 'treo', cao: yd + 3.2 };
  };

  DS['24077'] = function () {   /* chuông (xem 4 ảnh): chuông vàng phun cát, miệng loe có đai kim cương quanh vành; quai dẹt trên đỉnh đính hàng kim cương; trong lòng có quả lắc; treo qua khoen + khoá móc lò xo */
    var g = new THREE.Group(), pf = [], j;
    for (j = 0; j <= 30; j++) { var t = j / 30, y = 1.9 - t * 3.4, r = .02 + 1.5 * Math.pow(Math.sin(Math.min(1, t * 1.45) * PI / 2), .8) + .75 * Math.pow(Math.max(0, t - .6) / .4, 2.2);   /* soát đợt 5: vai vòm tròn cao */ pf.push([r, y]); }   /* chóp vòm tròn, thân thẳng, miệng loe */
    pf.push([2.25, -1.62]); pf.push([2.0, -1.62]); for (j = 0; j <= 10; j++) { var t2 = j / 10; pf.push([1.9 - t2 * .5, -1.55 + t2 * 2.8]); }
    g.add(xoayLuoi(pf, 96, null, hai(VL.vangMo)));
    var cap = new THREE.Mesh(new THREE.SphereGeometry(.32, 14, 10), VL.vangMo); cap.position.y = 1.9; g.add(cap);
    var dai = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, .45, 64, 1, true), hai(VL.vang)); dai.position.y = -1.35; g.add(dai);
    g.add(vongKc(.2, 2.28, -1.35, 30, -.1));
    var ql = new THREE.Mesh(new THREE.SphereGeometry(.4, 14, 10), VL.vang); ql.position.y = -1.2; g.add(ql);
    var sh = new THREE.Shape(); sh.absarc(0, 0, .95, 0, PI * 2, false); var ho = new THREE.Path(); ho.absarc(0, 0, .5, 0, PI * 2, true); sh.holes.push(ho);
    var quai = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .55, bevelEnabled: true, bevelThickness: .08, bevelSize: .06, bevelSegments: 2, curveSegments: 32 }), VL.vang); quai.position.set(0, 2.75, -.28); g.add(quai);
    var dq = []; for (j = 0; j < 5; j++) { var a = PI * (.08 + j * .21); dq.push([Math.cos(a) * .72, 2.75 + Math.sin(a) * .72, .36, 0, 0, 1]); } g.add(hangKc(.17, dq));
    moc(g, 3.7);
    return { g: g, rong: 4.6, xo: 'treo', cao: 10.5 };
  };

  DS['24030'] = function () {   /* chữ Thọ treo (xem 4 ảnh): tấm tròn vàng phun cát chạm lộng chữ Thọ tròn (圆寿) thủng 2 mặt, viền tròn dày; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), R = 3.4, T = .9, p = vienTu(function (x, y) { return Math.hypot(x, y) - R; }, 0, 0, 120);
    var tr = longMo(matTrong(R, function (c, w, h) { veTho(c, w, h, 30); }, 40));
    g.add(matPhang(p, 2 * R, tr, T / 2)); g.add(matPhang(p, 2 * R, tr, -T / 2, true));
    var thanh = new THREE.Mesh(new THREE.CylinderGeometry(R - .02, R - .02, T, 90, 1, true), hai(VL.vangMo)); thanh.rotation.x = PI / 2; g.add(thanh);
    [-1, 1].forEach(function (s) { var rim = new THREE.Mesh(new THREE.TorusGeometry(R - .12, .14, 10, 90), VL.vangMo); rim.position.z = s * T / 2; g.add(rim); });
    var yd = mocDon(g, R - .1);
    return { g: g, rong: 2 * R, xo: 'treo', cao: yd + R };
  };

  DS['24093'] = function () {   /* xu tròn nhỏ (xem 4 ảnh): đồng xu vàng phun cát, mép nổi; mặt chạm nổi: giữa 1 cột vạch ngang như bông lúa, 2 bên 2 cung cong có vạch; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), R = 2.6, T = .8, p = vienTu(function (x, y) { return Math.hypot(x, y) - R; }, 0, 0, 100);
    var mt = vanRieng(function (c, X, Y, k) { for (var i = 0; i < 6000; i++) { c.fillStyle = (i % 2) ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)'; c.fillRect((i * 97) % 512, (i * 211 + (i >> 3)) % 512, 2, 2); }
      c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineWidth = .3 * k; c.beginPath(); c.arc(X(0), Y(0), (R - .2) * k, 0, 7); c.stroke();
      c.lineWidth = .24 * k; c.beginPath(); c.moveTo(X(0), Y(1.7)); c.lineTo(X(0), Y(-1.7)); c.stroke();
      for (var j = 0; j < 7; j++) { var y = 1.5 - j * .5; c.lineWidth = .2 * k; c.beginPath(); c.moveTo(X(-.5), Y(y)); c.lineTo(X(.5), Y(y)); c.stroke(); }
      [-1, 1].forEach(function (s) { c.lineWidth = .3 * k; c.beginPath(); c.arc(X(s * 2.6), Y(0), 1.35 * k, s > 0 ? PI * .7 : -PI * .3, s > 0 ? PI * 1.3 : PI * .3); c.stroke();
        for (var q = 0; q < 6; q++) { var a = (s > 0 ? PI : 0) + (q - 2.5) * .19, x0 = s * 2.6 + Math.cos(a) * 1.35, y0 = Math.sin(a) * 1.35; c.lineWidth = .16 * k; c.beginPath(); c.moveTo(X(x0), Y(y0)); c.lineTo(X(x0 - s * .35), Y(y0 + .18)); c.stroke(); } }); }, 4);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, 0, hoSo(T, .2), mt); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, 0, .18, mt, null, 12); v.position.z = T / 2 - .03; g.add(v);
    var yd = mocDon(g, R - .1);
    return { g: g, rong: 2 * R, xo: 'treo', cao: yd + R };
  };

  var kcTim = VL.kc.clone(); kcTim.color = new THREE.Color(0xf0cff0); kcTim.emissive = new THREE.Color(0xb48ac8); kcTim.emissiveIntensity = .18;   /* đá hồng tím nhạt */
  DS['24000'] = function () {   /* chữ X (xem 4 ảnh): hạt gồm 2 vòng oval dẹt bắt chéo nhau thành chữ X, mặt ngoài phía trước đính 1 hàng đá hồng tím; dây xỏ dọc xuyên qua lòng 2 vòng */
    var g = new THREE.Group(), A = 2.7, B = 1.5, W = 1.25, th = .45;
    var sh = new THREE.Shape(); sh.absellipse(0, 0, B, A, 0, PI * 2, false); var ho = new THREE.Path(); ho.absellipse(0, 0, B - th, A - th, 0, PI * 2, true); sh.holes.push(ho);
    [-1, 1].forEach(function (s) { var v = new THREE.Group();
      var band = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2, curveSegments: 64 }), VL.vang); band.position.z = -W / 2; v.add(band);
      var ds = []; for (var i = 0; i < 7; i++) { var t = -1.05 + i / 6 * 2.1, x = (B + .02) * Math.cos(t), y = (A + .02) * Math.sin(t), nx = Math.cos(t) / B, ny = Math.sin(t) / A, l = Math.hypot(nx, ny); ds.push([x, y, 0, nx / l, ny / l, 0]); } v.add(hangKc(.32, ds, kcTim));
      v.rotation.y = -PI / 2;   /* mặt phẳng vòng = yz → trục vòng theo x (chiều dây) */
      var w = new THREE.Group(); w.add(v); w.rotation.z = s * .62; g.add(w); });
    return { g: g, rong: 4.0, xo: 'xuyen', cao: 2 * A, dung: true, uoc: 5.6 };
  };
  /* ---------- lô Khác 13: túi tiền hạt, thẻ Hỷ Lạc, thẻ Như Ý lộng, khoá như ý ruby, mèo đứng, đầu ngựa ngọc lam ---------- */
  function hatCung(g, cx, cy, R, a0, a1, n, r, z) {   /* 1 dãy hạt bi theo cung tròn */
    var im = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 8), VL.vang, n), m4 = new THREE.Matrix4();
    for (var i = 0; i < n; i++) { var a = a0 + (a1 - a0) * i / (n - 1); m4.makeTranslation(cx + Math.cos(a) * R, cy + Math.sin(a) * R, z); im.setMatrixAt(i, m4); } g.add(im); }
  DS['23998'] = function () {   /* túi tiền (xem 4 ảnh): tấm túi tiền vàng phun cát: bụng túi tròn trơn, mép bụng viền hạt bi; miệng túi xoè như vương miện, 2 dải hạt bi uốn vòm + 1 hàng hạt ngang cổ túi; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.2;
    var f = function (x, y) { return hop(oval(2.55, 1.95)(x, y + .7), oval(2.3, 1.15)(x, y - 1.3), .35); }   /* bụng túi + miệng túi xoè tròn */, p = vienTu(f, 0, 0, 240);
    var b = khoi(p, 0, 0, hoSo(T, .25), VL.vangMo); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, 0, .45, VL.vangMo, null, 18); v.position.z = T / 2 - .05; g.add(v);
    var lu = vom(p, 0, 0, .25, VL.vangMo, null, 12); lu.rotation.y = PI; lu.position.z = -T / 2 + .05; g.add(lu);
    var zf = T / 2 + .3;
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .15; }, 0, 0, 240), .12, VL.vang, T / 2 + .08));
    hatCung(g, 0, -.4, 2.15, PI * .14, PI * .86, 15, .13, zf);   /* dải hạt vòm dưới */
    hatCung(g, 0, -.1, 2.05, PI * .2, PI * .8, 13, .13, zf - .05);   /* dải hạt vòm trên */
    hatCung(g, 0, 3.9, 3.4, -PI * .66, -PI * .34, 13, .12, zf - .02);   /* hàng hạt cổ túi (cong nhẹ) */
    var yd = mocDon(g, 2.35);
    return { g: g, rong: 5.2, xo: 'treo', cao: yd + 2.7 };
  };

  DS['24071'] = function () {   /* thẻ Hỷ Lạc (xem 4 ảnh): thẻ hình thang (hẹp trên, rộng dưới), 2 góc trên bo tròn; vàng phun cát; chữ 喜 trên, 乐 dưới nổi, giữa có vạch ngang; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.1;
    var f = function (x, y) { return daGiac([[-1.05, 3.0], [1.05, 3.0], [1.75, -3.0], [-1.75, -3.0]])(x, y) - .35; }, p = vienTu(f, 0, 0, 220);
    var mt = vanRieng(function (c, X, Y, k) { for (var i = 0; i < 7000; i++) { c.fillStyle = (i % 2) ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)'; c.fillRect((i * 97) % 512, (i * 211 + (i >> 3)) % 512, 2, 2); }
      c.fillStyle = '#fff'; c.font = '700 ' + (2.3 * k) + 'px "Kaiti TC","STKaiti","Songti TC","PingFang TC",serif'; c.fillText('喜', X(0), Y(1.35)); c.fillText('乐', X(0), Y(-1.5));
    }, 2.6);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, 0, hoSo(T, .25), mt); b.position.z = T / 2; g.add(b);
    var yd = mocDon(g, 3.3);
    return { g: g, rong: 4.2, xo: 'treo', cao: yd + 3.35 };
  };

  DS['24035'] = function () {   /* thẻ Như Ý (xem 4 ảnh): thẻ oval bo tròn 2 đầu, viền tròn dày, trong chạm lộng chữ 如 (trên) 意 (dưới) thủng 2 mặt; vàng phun cát; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), Wd = 2.3, Hh = 4.1, T = .9, S = 8.6;
    var f = function (x, y) { return Math.hypot(x, Math.max(Math.abs(y) - (Hh - Wd), 0)) - Wd; }, p = vienTu(f, 0, 0, 200);
    var tr = longMo(vanLong(function (c, w, h) { function X(x) { return (x / S + .5) * w; } function Y(y) { return (.5 - y / S) * h; } var k = w / S;
      c.lineWidth = .42 * k; c.beginPath(); c.moveTo(X(Wd - .21), Y(Hh - Wd)); c.arc(X(0), Y(Hh - Wd), (Wd - .21) * k, 0, -PI, true); c.lineTo(X(-Wd + .21), Y(-(Hh - Wd))); c.arc(X(0), Y(-(Hh - Wd)), (Wd - .21) * k, PI, 0, true); c.closePath(); c.stroke();
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 ' + (2.9 * k) + 'px "PingFang TC","Heiti TC","Noto Sans CJK TC",sans-serif'; c.fillText('如', X(0), Y(1.65)); c.font = '700 ' + (3.4 * k) + 'px "PingFang TC","Heiti TC","Noto Sans CJK TC",sans-serif'; c.fillText('意', X(0), Y(-1.35));
      c.lineWidth = .22 * k; c.beginPath(); c.moveTo(X(-Wd + .3), Y(.05)); c.lineTo(X(Wd - .3), Y(.05)); c.stroke(); }));
    g.add(matPhang(p, S, tr, T / 2)); g.add(matPhang(p, S, tr, -T / 2, true));
    var th = thanhVien(vienTu(function (x, y) { return f(x, y) + .02; }, 0, 0, 200), T, hai(VL.vangMo), 1); g.add(th);
    var yd = mocDon(g, Hh - .1);
    return { g: g, rong: 2 * Wd, xo: 'treo', cao: yd + Hh };
  };

  DS['24005'] = function () {   /* khoá như ý ruby (xem 4 ảnh): tấm khoá như ý vàng phun cát: 2 góc trên cuộn mây, hông lượn, đáy nhọn; mặt chạm nổi chỉ bóng: hoa 6 cánh quanh viên ruby giữa, cuộn mây chữ C 4 góc, đường viền trong; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.2;
    var f = function (x, y) { var d = oval(2.4, 1.7)(x, y - .3); d = hop(d, tron(x, y, -1.9, 1.3, .85), .4); d = hop(d, tron(x, y, 1.9, 1.3, .85), .4); d = hop(d, tron(x, y, -2.1, -.3, .62), .35); d = hop(d, tron(x, y, 2.1, -.3, .62), .35); d = hop(d, tron(x, y, -1.3, -1.35, .72), .35); d = hop(d, tron(x, y, 1.3, -1.35, .72), .35); d = hop(d, daGiac([[-1.2, -.8], [1.2, -.8], [0, -2.25]])(x, y) - .4, .5); d = hop(d, tron(x, y, 0, 1.95, .55), .4); return d;   /* khoá như ý: 2 cuộn trên, 2 múi hông, đáy nhọn */ }, p = vienTu(f, 0, 0, 260);
    var mt = vanRieng(function (c, X, Y, k) { for (var i = 0; i < 7000; i++) { c.fillStyle = (i % 2) ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.22)'; c.fillRect((i * 97) % 512, (i * 211 + (i >> 3)) % 512, 2, 2); }
      c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineWidth = .24 * k;
      for (var j = 0; j < 6; j++) { var a = j / 6 * PI * 2 + PI / 2, cx = Math.cos(a) * .95, cy = .25 + Math.sin(a) * .95; c.beginPath(); c.ellipse(X(cx), Y(cy), .5 * k, .32 * k, -a, 0, 7); c.stroke(); }   /* hoa 6 cánh */
      [[-1.75, 1.0, 0], [1.75, 1.0, PI], [-1.2, -.95, PI / 2], [1.2, -.95, PI / 2]].forEach(function (q) { c.beginPath(); for (var t = 0; t <= 1; t += .02) { var b = q[2] + t * PI * 2 * 1.4, r = .62 * (1 - t * .8); c.lineTo(X(q[0] + Math.cos(b) * r), Y(q[1] + Math.sin(b) * r)); } c.stroke(); });
      c.lineWidth = .12 * k; c.beginPath(); c.moveTo(X(-.9), Y(-1.7)); c.quadraticCurveTo(X(0), Y(-1.2), X(.9), Y(-1.7)); c.stroke(); }, 4.2);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, 0, hoSo(T, .25), mt); b.position.z = T / 2; g.add(b);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .22; }, 0, 0, 260), .1, VL.vang, T / 2 + .03));
    var o = new THREE.Mesh(new THREE.TorusGeometry(.48, .11, 8, 30), VL.vang); o.position.set(0, .25, T / 2 + .12); g.add(o);
    g.add(hangKc(.42, [[0, .25, T / 2 + .1, 0, 0, 1]], VLda.rubyG));
    var yd = mocDon(g, 2.4);
    return { g: g, rong: 5.8, xo: 'treo', cao: yd + 2.9 };
  };

  DS['24114'] = function () {   /* mèo đứng (xem 4 ảnh): mèo vàng đúc tròn đứng 4 chân, lông chạm xước, đầu tròn quay nghiêng, tai nhọn, mắt kim cương, mõm nhỏ; đuôi dựng cong lên; bụng chữ Tài; XỎ DỌC từ ngực ra mông */
    var g = new THREE.Group(), vl = vangVan('hoa', 3, 1.6, .42);
    g.add(khoiElip(vl, [[.3, .6, 0, 2.0, 1.25, 1.15], [-1.3, .8, 0, 1.15, 1.2, 1.12], [1.6, .6, 0, 1.05, 1.1, 1.1], [-2.3, 2.15, 0, 1.25, 1.12, 1.15, .6], [-3.3, 1.85, 0, .5, .42, .62, .35], [-2.05, 3.15, .6, .5, .62, .22, .3], [-2.05, 3.15, -.6, .5, .62, .22, .3],
      [-1.4, -1.05, .52, .34, .22, .32, .2], [-1.4, -1.05, -.52, .34, .22, .32, .2], [1.55, -1.05, .52, .34, .22, .32, .2], [1.55, -1.05, -.52, .34, .22, .32, .2]],
      [[-1.35, .2, .52, -1.4, -.95, .52, .4], [-1.35, .2, -.52, -1.4, -.95, -.52, .4], [1.5, .2, .52, 1.55, -.95, .52, .42], [1.5, .2, -.52, 1.55, -.95, -.52, .42],
       [2.3, 1.2, 0, 2.55, 1.75, 0, .3, .35], [2.55, 1.75, 0, 2.5, 2.4, 0, .28, .2]], .55, [-4, -1.5, -1.6, 3.2, 4, 1.6], 'meo24114b',
      function (d, x, y, z) { return d + ranh(Math.hypot(x + 3.45, y - 1.7) - .001, .12, .06) * (Math.abs(z) < .3 ? 1 : 0); }));   /* mèo liền khối: thân, đầu, mõm, 4 chân, tai, đuôi dựng */
    g.add(hangKc(.22, [[-3.2, 2.4, .5, -.8, .1, .6], [-3.2, 2.4, -.5, -.8, .1, -.6]]));   /* mắt kim cương */
    var duoi = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(2.3, 1.2, 0), new V3(2.55, 1.75, 0), new V3(2.5, 2.3, 0)]), 16, .3, 10), vl); g.add(duoi);
    var dd = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 10), vl); dd.position.set(2.45, 2.4, 0); dd.scale.set(1.3, .8, 1.1); g.add(dd);
    [-1, 1].forEach(function (s) { var l = new THREE.Mesh(new THREE.CircleGeometry(.45, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.set(s > 0 ? 2.52 : -2.37, .7, 0); g.add(l); });
    g.children.forEach(function (m) { m.position.y -= .7; });
    return { g: g, rong: 6.0, xo: 'xuyen', cao: 4.6, dung: true, uoc: 5 };
  };

  DS['23984'] = function () {   /* đầu ngựa ngọc lam (xem 4 ảnh): đầu ngựa vàng như quân mã cờ vua, bờm + mắt chạm nổi, quay trái; cổ loe thành chụp ôm hạt ngọc, đai kim cương quanh chụp; dưới treo hạt ngọc lam xanh nước biển tròn; khoen hàn sau tai + khoen lớn */
    var g = new THREE.Group(), h = new THREE.Group();
    var P = [[1.5, 0], [1.65, 1.5], [1.45, 2.8], [1.0, 3.6], [.75, 4.35], [.35, 3.85], [-.3, 3.65], [-1.35, 2.75], [-1.95, 2.1], [-1.75, 1.6], [-.95, 1.7], [-.6, 1.15], [-1.15, .45], [-1.4, 0]];
    var f = function (x, y) { return daGiac(P)(x, y) - .12; }, p = vienTu(f, .2, 1.9, 240);
    var mt = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineCap = 'round';
      for (var j = 0; j < 9; j++) { var t = j / 8, x0 = 1.45 - t * .3, y0 = .4 + t * 3.1; c.lineWidth = .13 * k; c.beginPath(); c.moveTo(X(x0), Y(y0)); c.quadraticCurveTo(X(x0 - .7), Y(y0 + .15), X(x0 - .55), Y(y0 - .45)); c.stroke(); }   /* bờm */
      c.lineWidth = .12 * k; c.beginPath(); c.ellipse(X(-.45), Y(2.95), .3 * k, .2 * k, -.4, 0, 7); c.stroke();   /* mắt */
      c.beginPath(); c.arc(X(-1.6), Y(2.0), .18 * k, 0, 7); c.stroke();   /* lỗ mũi */
      c.beginPath(); c.moveTo(X(-.95), Y(1.75)); c.quadraticCurveTo(X(-.3), Y(2.3), X(.2), Y(1.6)); c.stroke(); }, 2.8);
    var dau = khoi(p, .2, 1.9, hoSo(3.0, .9), mt); dau.position.z = 1.5; dau.scale.set(1.3, 1.3, 1); dau.position.y = .1; h.add(dau);   /* soát đợt 5: đầu ngựa to dày (≈ đường kính ngọc) như ảnh */
    var chup = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.3, 1.3, 48, 1, true), hai(VL.vang)); chup.position.y = -.4; h.add(chup);
    var dai = khoen(2.12, .12, VL.vang); dai.rotation.x = PI / 2; dai.position.y = -.85; h.add(dai);
    h.add(vongKc(.22, 1.92, -.38, 12, .25));
    var ngoc = new THREE.Mesh(new THREE.SphereGeometry(2.7, 48, 32), daTrong(0x147a72, null, .12, .4, .5)); ngoc.position.y = -3.3; h.add(ngoc);
    h.position.x = -.55; g.add(h);
    var yd = mocDon(g, 4.0);
    return { g: g, rong: 5.6, xo: 'treo', cao: yd + 6.0 };
  };
  /* ---------- lô Khác 14: củ lạc, lạc bổ đôi garnet, cỏ 4 lá garnet, chùm xu chữ, mặt mèo chữ Phúc, sen ngọn lửa ---------- */
  function hinhLac(k) { k = k || 1; return function (x, y) { x /= k; y /= k; return hop(oval(1.6, 1.9)(x, y - 1.75), oval(1.78, 2.05)(x, y + 1.8), .9) * k; }; }   /* củ lạc 2 hạt, eo giữa */
  function vanVoLac(chu) { var hg = 5; function rnd() { hg = (hg * 16807) % 2147483647; return hg / 2147483647; }
    return vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineJoin = 'round';
      for (var i = 0; i < 70; i++) { var x = -2 + rnd() * 4, y = -4.2 + rnd() * 8.4, n = 3 + Math.floor(rnd() * 3); c.lineWidth = (.08 + rnd() * .06) * k; c.beginPath(); c.moveTo(X(x), Y(y));
        for (var j = 0; j < n; j++) { x += (rnd() - .5) * 1.1; y += (rnd() - .5) * 1.1; c.lineTo(X(x), Y(y)); } c.stroke(); }   /* gân vỏ lạc nhăn */
      if (chu) { c.fillStyle = '#fff'; c.font = '700 ' + (1.25 * k) + 'px "Kaiti TC","STKaiti","Songti TC",serif'; chu.split('').forEach(function (ch, i) { c.fillText(ch, X(.1), Y(2.6 - i * 1.75)); }); } }, 3.2); }
  DS['24074'] = function () {   /* củ lạc (xem 4 ảnh): củ lạc 2 hạt eo giữa, vàng phun cát, vỏ chạm gân nhăn, giữa nổi dọc 4 chữ 好事花生; lưng phồng; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), f = hinhLac(.95), p = vienTu(f, 0, 0, 240), T = 1.2, mt = vanVoLac('好事花生'); mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, 0, hoSo(T, .3), mt); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, 0, .75, mt, null, 22); v.position.z = T / 2 - .05; g.add(v);
    var lu = vom(p, 0, 0, .6, mt, null, 16); lu.rotation.y = PI; lu.position.z = -T / 2 + .05; g.add(lu);
    var yd = mocDon(g, 3.4);
    return { g: g, rong: 3.2, xo: 'treo', cao: yd + 3.7 };
  };

  DS['23859'] = function () {   /* lạc garnet (xem 4 ảnh; user: là 2 NỬA CỦ LẠC TÁCH RIÊNG, treo chung khoen): mỗi nửa là 1 mảnh vỏ lạc rỗng lòng (lưng vòm vỏ nhăn, lòng lõm vàng mờ). Nửa trái: lưng nổi 2 đồng xu lỗ vuông, lòng in vết 2 đồng xu. Nửa phải: lưng vỏ nhăn trơn, lòng chứa 2 hạt garnet tròn. Mỗi nửa 1 khoen nhỏ ở đỉnh, móc chung 1 khoen lớn */
    var g = new THREE.Group(), f = hinhLac(.88), p = vienTu(f, 0, 0, 240), mt = vanVoLac(''); mt.roughness = .5; mt.color.set(0xf0bf55);
    var trong = new THREE.MeshStandardMaterial({ color: 0xe8b955, metalness: 1, roughness: .45, side: THREE.DoubleSide });
    function nua(xu, garnet) { var h = new THREE.Group();
      var lung = vom(p, 0, 0, 1.15, mt, null, 22); h.add(lung);   /* lưng vòm vỏ nhăn */
      var long_ = vom(vienTu(function (x, y) { return f(x, y) + .22; }, 0, 0, 240), 0, 0, .9, trong, null, 18); long_.position.z = -.01; h.add(long_);   /* lòng lõm (nhìn từ sau) */
      var mep = tamLo(p, vienTu(function (x, y) { return f(x, y) + .22; }, 0, 0, 240), .2, VL.vangMo); mep.position.z = -.1; h.add(mep);   /* mép vỏ */
      [1.55, -1.6].forEach(function (y) {
        if (xu) { var z = 1.05; var dx = new THREE.Mesh(new THREE.CylinderGeometry(.66, .66, .18, 28), VL.vang); dx.rotation.x = PI / 2; dx.position.set(0, y, z); h.add(dx);
          var vh = khoen(.58, .075, VL.vang); vh.position.set(0, y, z + .1); h.add(vh);
          var lo = new THREE.Mesh(new THREE.PlaneGeometry(.4, .4), VL.toi); lo.position.set(0, y, z + .11); h.add(lo);
          var vq = new THREE.Mesh(new THREE.TorusGeometry(.29, .05, 4, 4), VL.vang); vq.rotation.z = PI / 4; vq.position.set(0, y, z + .12); h.add(vq);
          var in_ = khoen(.58, .07, VL.vangMo); in_.position.set(0, y, .62); h.add(in_); var iq = new THREE.Mesh(new THREE.TorusGeometry(.29, .05, 4, 4), VL.vangMo); iq.rotation.z = PI / 4; iq.position.set(0, y, .62); h.add(iq); }   /* vết xu in trong lòng */
        if (garnet) { var gn = vien(.78, daGarnet, .95); gn.rotation.y = PI; gn.position.set(0, y, .12); h.add(gn); } });
      var kh = khoen(.3, .1, VL.vang); kh.position.set(0, 3.45, 0); kh.rotation.y = PI / 2; h.add(kh);
      return h; }
    var A = nua(true, false), B = nua(false, true);
    A.position.x = -1.72; A.rotation.z = -.3; B.position.x = 1.72; B.rotation.z = .3; g.add(A); g.add(B);   /* 2 nửa chụm đầu vào khoen nối, thân hơi xoè */
    var noi = khoen(.85, .12, VL.vang); noi.position.y = 3.88; g.add(noi);   /* khoen nối luồn qua khoen nhỏ của 2 nửa */
    var kh = new THREE.Group(), kl = khoen(1.05, .27, VL.vang); kl.rotation.y = PI / 2; kl.scale.y = 1.3; kh.add(kl); kh.position.y = 3.88 + .85 + 1.15; g.add(kh); g.userData.khoa = kh;
    g.children.forEach(function (m) { m.position.y -= 3.88 + .85 + 1.15; });
    return { g: g, rong: 6.4, xo: 'treo', cao: 11.5 };
  };



  DS['23856'] = function () {   /* cỏ 4 lá garnet (xem 4 ảnh): hạt cỏ 4 lá tròn (4 thùy xếp chéo), mỗi thùy 1 viên garnet tròn mài vòm trong ổ viền hạt, giữa 1 viên kim cương nhỏ; thành thấp khoét vòm; lưng 4 lỗ tròn lộng; lỗ xỏ 2 sườn */
    var g = new THREE.Group(), T = 3.0, c = 1.45, rL = 1.55;
    var f = function (x, y) { var d = 1e9; [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { d = hop(d, tron(x, y, q[0] * c, q[1] * c, rL), .5); }); return d; }, p = vienTu(f, 0, 0, 260);
    g.add(thanhVien(vienTu(function (x, y) { return f(x, y) + .08; }, 0, 0, 260), T - .2, longVang(vanLong(function (cv, w, h) { cv.fillRect(0, 0, w, h); cv.fillStyle = '#000'; for (var k = 0; k < 8; k++) { cv.beginPath(); cv.ellipse((k + .5) * w / 8, h * .62, w / 8 * .3, h * .3, 0, 0, 7); cv.fill(); } })), 1));
    var mat = khoi(p, 0, 0, hoSo(.5, .12), VL.vangMo); mat.position.z = T / 2; g.add(mat);
    g.add(matPhang(p, 8, longVang(vanLong(function (cv, w, h) { cv.fillRect(0, 0, w, h); cv.fillStyle = '#000'; [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { cv.beginPath(); cv.arc(w / 2 + q[0] * c / 8 * w, h / 2 - q[1] * c / 8 * h, rL * .62 / 8 * w, 0, 7); cv.fill(); }); })), -T / 2, true));
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var x = q[0] * c, y = q[1] * c;
      g.add(chuoiHat(vienTu(function (a, b) { return tron(a, b, x, y, 1.32); }, x, y, 60), .1, VL.vang, T / 2 + .12));
      var h = vien(1.2, daGarnet, .7); h.position.set(x, y, T / 2 + .05); g.add(h); });
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .1; }, 0, 0, 260), .1, VL.vang, T / 2 + .02));
    g.add(hangKc(.32, [[0, 0, T / 2 + .3, 0, 0, 1]]));
    [-1, 1].forEach(function (s) { var x0 = 0; while (f(x0 * s, 0) < 0 && x0 < 9) x0 += .02; var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.x = s * (x0 + .02); g.add(l); });
    return { g: g, rong: 2 * (c + rL), xo: 'xuyen', cao: 2 * (c + rL) };
  };

  DS['24086'] = function (o) {   /* xu chữ treo (xem 4 ảnh; user: ảnh chụp chung nhiều chiếc — mỗi charm CHỈ 1 đồng xu): đồng xu tròn nhỏ vàng phun cát, mép nổi, 1 chữ nổi (上 / 有 / 发 / 钱 — khách chọn); khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), R = 2.2, T = .8, ch = { thuong: '上', huu: '有', phat: '发', tien: '钱' }[(o && o.mau) || 'thuong'] || '上', p = vienTu(function (a, b) { return Math.hypot(a, b) - R; }, 0, 0, 90);
    var mt = vanRieng(function (c, X, Y, k) { for (var j = 0; j < 5000; j++) { c.fillStyle = (j % 2) ? 'rgba(255,255,255,.22)' : 'rgba(0,0,0,.22)'; c.fillRect((j * 97) % 512, (j * 211 + (j >> 3)) % 512, 2, 2); }
      c.strokeStyle = '#fff'; c.lineWidth = .3 * k; c.beginPath(); c.arc(X(0), Y(0), (R - .2) * k, 0, 7); c.stroke();
      c.fillStyle = '#fff'; c.font = '700 ' + (2.6 * k) + 'px "Kaiti SC","STKaiti","Songti SC","PingFang SC",serif'; c.fillText(ch, X(0), Y(-.05)); }, 3.4);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, 0, hoSo(T, .2), mt); b.position.z = T / 2; g.add(b);
    var yd = mocDon(g, R - .1);
    return { g: g, rong: 2 * R, xo: 'treo', cao: yd + R };
  };


  DS['24038'] = function () {   /* mặt mèo chữ Phúc (xem 4 ảnh): tấm đầu mèo (2 tai nhọn trên), vàng phun cát, viền chỉ nổi; mặt chạm mây cuộn kín nền, giữa chữ Phúc 福 nổi; khoen hàn giữa 2 tai + khoen lớn */
    var g = new THREE.Group(), T = 1.1;
    var tai = function (s) { return daGiac(s > 0 ? [[.9, 1.6], [2.35, .9], [2.15, 2.65]] : [[-2.15, 2.65], [-2.35, .9], [-.9, 1.6]]); };
    var f = function (x, y) { return hop(hop(oval(2.55, 2.35)(x, y + .25), tai(1)(x, y) - .2, .5), tai(-1)(x, y) - .2, .5); }, p = vienTu(f, 0, 0, 240);
    var mt = vanRieng(function (c, X, Y, k) { for (var j = 0; j < 6000; j++) { c.fillStyle = (j % 2) ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)'; c.fillRect((j * 97) % 512, (j * 211 + (j >> 3)) % 512, 2, 2); }
      c.strokeStyle = '#fff'; c.lineWidth = .12 * k; c.lineCap = 'round';
      [[-1.35, .9], [1.35, .9], [-1.6, -.7], [1.6, -.7], [0, -1.95], [-.75, 1.75], [.75, 1.75], [-1.0, -1.6], [1.0, -1.6]].forEach(function (q, i) { c.beginPath(); for (var t = 0; t <= 1; t += .03) { var a = i + t * PI * 2 * 1.3, r = .48 * (1 - t * .8); c.lineTo(X(q[0] + Math.cos(a) * r), Y(q[1] + Math.sin(a) * r)); } c.stroke(); });   /* mây cuộn */
      c.fillStyle = '#fff'; c.font = '700 ' + (2.3 * k) + 'px "Kaiti TC","STKaiti","Songti TC",serif'; c.fillText('福', X(0), Y(-.1)); }, 3.0);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, 0, hoSo(T, .25), mt); b.position.z = T / 2; g.add(b);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .12; }, 0, 0, 240), .1, VL.vang, T / 2 + .02));
    var yd = mocDon(g, 1.95);
    return { g: g, rong: 5.2, xo: 'treo', cao: yd + 2.6 };
  };

  function bang(P, w0, w1) {   /* dải cong bản rộng theo đường P (V2[]), rộng w0 → w1 → Shape kín */
    var c = new THREE.CatmullRomCurve3(P.map(function (q) { return new V3(q[0], q[1], 0); })), n = 40, L = [], R = [];
    for (var i = 0; i <= n; i++) { var t = i / n, q = c.getPoint(t), tg = c.getTangent(t), w = (w0 + (w1 - w0) * t) / 2; L.push(new V2(q.x - tg.y * w, q.y + tg.x * w)); R.push(new V2(q.x + tg.y * w, q.y - tg.x * w)); }
    return { sh: new THREE.Shape(L.concat(R.reverse())), c: c };
  }
  DS['24106'] = function () {   /* hoa sen (xem 4 ảnh; user: là MỘT BÔNG HOA SEN): búp sen giữa đặc có gân lá vươn thẳng lên, khoen ở đỉnh; 2 cánh sen bên chếch lên + 2 cánh dưới xoè ngang — cánh chạm lộng (khung viền), đính hàng kim cương dọc cánh; dưới đáy đài sen tròn chấm hạt; vàng phun cát */
    var g = new THREE.Group(), y0 = -1.7, ex = { depth: .55, bevelEnabled: true, bevelThickness: .15, bevelSize: .08, bevelSegments: 3, curveSegments: 6 };
    function canhSen(L, hw) { var R = (hw * hw + L * L / 4) / (2 * hw), c = R - hw; return function (x, y) { return Math.max(tron(x, y, c, L / 2, R), tron(x, y, -c, L / 2, R)); }; }   /* cánh sen nhọn 2 đầu, gốc tại (0,0) mũi tại (0,L) */
    function canhLong(L, hw, goc, so) { var f = canhSen(L, hw), w = new THREE.Group(), ngoai = vienTu(f, 0, L / 2, 120), trong = vienTu(function (x, y) { return f(x, y) + .34; }, 0, L / 2, 120);
      var sh = new THREE.Shape(ngoai), ho = new THREE.Path(trong.slice().reverse()); sh.holes.push(ho);
      var m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, ex), VL.vangMo); m.position.z = -.28; w.add(m);
      var ds = []; for (var i = 0; i < so; i++) { var t = .22 + i / (so - 1) * .6, yy = t * L, xx = 0; while (f(xx - .02, yy) < 0) xx -= .02; ds.push([xx + .17, yy, .45, 0, 0, 1]); } w.add(hangKc(.15, ds));   /* hàng đá dọc mép ngoài cánh */
      var gan = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, L * .5, 6), VL.vang); gan.position.set(0, L * .45, -.05); w.add(gan);
      w.rotation.z = goc; w.position.y = y0; g.add(w); return w; }
    [1, -1].forEach(function (s) { var a = canhLong(4.3, 1.05, -s * .5, 5); if (s > 0) a.scale.x = -1; var b = canhLong(2.9, .85, -s * 1.2, 4); if (s > 0) b.scale.x = -1;   /* đá nằm mép ngoài cánh */ });
    var fb = canhSen(4.9, 1.15), mb = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineWidth = .14 * k; c.beginPath(); c.moveTo(X(0), Y(.5)); c.lineTo(X(0), Y(4.3)); c.stroke();
      for (var j = 0; j < 5; j++) { var y = .9 + j * .62; [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(X(0), Y(y)); c.quadraticCurveTo(X(s * .4), Y(y + .12), X(s * .7), Y(y + .55)); c.stroke(); }); } }, 2.4);
    mb.roughness = .45; mb.color.set(0xf2c25a);
    var pb = vienTu(fb, 0, 2.45, 140), bup = new THREE.Group(), k1 = khoi(pb, 0, 2.45, hoSo(.8, .25), mb); k1.position.z = .4; bup.add(k1);
    var k2 = vom(pb, 0, 2.45, .5, mb, null, 14); k2.position.z = .35; bup.add(k2); bup.position.y = y0; g.add(bup);   /* búp sen giữa */
    var dai = khoi(vienTu(oval(1.55, .62), 0, 0, 80), 0, 0, hoSo(1.0, .3), VL.vangMo); dai.position.set(0, y0 - .15, .5); g.add(dai);   /* đài sen */
    [[-.7, 0], [0, .1], [.7, 0], [-.35, -.3], [.35, -.3]].forEach(function (q) { var h = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), VL.vang); h.position.set(q[0], y0 - .15 + q[1], .58); g.add(h); });   /* hạt sen */
    [-1, 1].forEach(function (s) { var cd = khoi(vienTu(canhSen(1.3, .45), 0, .65, 50), 0, .65, hoSo(.5, .15), VL.vangMo); cd.rotation.z = s * 2.4; cd.position.set(s * .9, y0 - .3, .2); g.add(cd); });   /* 2 cánh nhỏ dưới đài */
    var yd = mocDon(g, y0 + 4.9);
    return { g: g, rong: 6.4, xo: 'treo', cao: yd + 2.6 };
  };

  /* ---------- lô Khác 15: chuông váy hạt, chong chóng, cá chép lộng, khánh garnet hạt, hoa mai móc, mũ hạt ngọc xanh ---------- */
  DS['24208'] = function () {   /* chuông váy hạt (xem 4 ảnh): chuông cao, chóp vòm trơn vàng mờ; váy loe dưới quấn 3 vòng hạt bi, mép dưới là dải vòng xoắn nhỏ lượn sóng; quả lắc tròn thòng dưới miệng; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), pf = [], j;
    for (j = 0; j <= 22; j++) { var t = j / 22, y = 2.5 - t * 2.9, r = .05 + 1.25 * Math.pow(Math.sin(Math.min(1, t * 1.25) * PI / 2), .8) + .75 * Math.pow(Math.max(0, t - .55) / .45, 1.6); pf.push([r, y]); }
    pf.push([2.1, -.5]); pf.push([1.85, -.45]); for (j = 0; j <= 6; j++) pf.push([1.8 - j * .1, -.4 + j * .4]);
    g.add(xoayLuoi(pf, 80, null, hai(VL.vangMo)));
    function rY(y) { var t = (2.5 - y) / 2.9; return .05 + 1.25 * Math.pow(Math.sin(Math.min(1, t * 1.25) * PI / 2), .8) + .75 * Math.pow(Math.max(0, t - .55) / .45, 1.6); }
    [.45, .05, -.3].forEach(function (y) { g.add(vongHat(rY(y) + .06, y, .11, VL.vang)); });   /* 3 vòng hạt quấn váy */
    var n = 16; for (j = 0; j < n; j++) { var a = j / n * PI * 2, k = khoen(.3, .07, VL.vang); k.position.set(Math.sin(a) * 2.05, -.68, Math.cos(a) * 2.05); k.rotation.y = a + PI / 2; g.add(k); }   /* mép vòng xoắn lượn sóng */
    var cap = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 10), VL.vangMo); cap.position.y = 2.55; g.add(cap);
    var can = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 2.4, 8), VL.vang); can.position.y = -.2; g.add(can);
    var ql = new THREE.Mesh(new THREE.SphereGeometry(.48, 16, 12), VL.vang); ql.position.y = -1.45; g.add(ql);
    var yd = mocDon(g, 2.7);
    return { g: g, rong: 4.4, xo: 'treo', cao: yd + 1.95 };
  };


  DS['24045'] = function () {   /* chong chóng (xem 4 ảnh): 4 cánh chong chóng vàng phun cát hình mái chèo cong, mỗi cánh xoắn nghiêng; trục giữa đính 1 viên kim cương; cần nối lên khoen treo */
    var g = new THREE.Group(), i, mt = VL.vangMo;
    var f = function (x, y) { var d = hop(oval(.95, 1.25)(x - .3, y - 1.6), tron(x, y, 0, .35, .36), .5); return Math.max(d, -tron(x, y, -.75, 2.15, .62)); }, p = vienTu(f, .25, 1.3, 140);   /* mái chèo cong, mép khuyết 1 bên như cánh chong chóng */
    for (i = 0; i < 4; i++) { var c = new THREE.Group(), b = khoi(p, .25, 1.3, hoSo(.45, .15), mt); b.position.z = .22; var tw = new THREE.Group(); tw.add(b); tw.rotation.y = .5; c.add(tw); c.rotation.z = PI / 4 + i * PI / 2; g.add(c); }   /* cánh xoắn */
    var truc = new THREE.Mesh(new THREE.CylinderGeometry(.55, .6, .7, 24), VL.vang); truc.rotation.x = PI / 2; g.add(truc);
    g.add(hangKc(.36, [[0, 0, .4, 0, 0, 1]]));
    var can = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 2.1, 10), mt); can.position.set(0, 1.4, -.35); g.add(can);
    var yd = mocDon(g, 2.4);
    return { g: g, rong: 6.0, xo: 'treo', cao: yd + 2.9 };
  };

  DS['24043'] = function () {   /* cá chép (xem 4 ảnh): cá chép vàng uốn mình chữ S, đầu tròn trơn hướng lên (miệng ngậm khoen), mắt kim cương; thân bầu chạm lộng vảy cá thủng; vây lưng + vây ngực có gân; đuôi chẻ đôi xoè hất lên phía phải; khoen hàn miệng + khoen lớn */
    var g = new THREE.Group();
    g.add(khoiTac(function (x, y, z) { var d = S3.hop(S3.elip(x, y, z, 0, 1.85, 0, 1.12, 1.35, 1.0), S3.elip(x, y, z, 0, 2.85, 0, .55, .35, .5), .3);   /* soát: đầu cá có môi chu ra */
      d += ranh(Math.hypot(x, (y - 1.2) * 1.3) - 1.05, .1, .14) * (y > .9 ? 1 : 0);   /* đường mang cong */
      d += ranh(Math.hypot(x, z) - .3, .08, .12) * (y > 2.9 ? 1 : 0);   /* miệng */
      d -= .12 * Math.exp(-(Math.pow(Math.abs(x) - .62, 2) + Math.pow(y - 2.2, 2)) / .06) * (Math.abs(z) > .3 ? 1 : 0);   /* hốc mắt nổi */
      return d; }, [-1.3, .4, -1.2, 1.3, 3.4, 1.2], VL.vang, 70, 'dauCa'));
    var mieng = khoen(.32, .12, VL.vang); mieng.rotation.x = PI / 2; mieng.position.y = 3.1; g.add(mieng);
    g.add(hangKc(.2, [[-.6, 2.2, .58, -.6, .1, .75], [.6, 2.2, .58, .6, .1, .75]]));
    var duong = new THREE.CatmullRomCurve3([new V3(0, 1.2, 0), new V3(-.35, .2, 0), new V3(-.3, -.85, 0), new V3(.3, -1.6, 0), new V3(1.15, -1.95, 0)]);
    var tg = new THREE.TubeGeometry(duong, 40, 1, 24, false), ps = tg.attributes.position;
    for (var a = 0; a < 41; a++) { var t = a / 40, r = 1.12 - Math.pow(t, 1.8) * .78, cen = duong.getPoint(t); for (var b2 = 0; b2 < 25; b2++) { var k = a * 25 + b2, v = new V3(ps.getX(k), ps.getY(k), ps.getZ(k)).sub(cen).multiplyScalar(r); ps.setXYZ(k, cen.x + v.x, cen.y + v.y, cen.z + v.z * .85); } }
    tg.computeVertexNormals();
    var vay = longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var r2 = 0; r2 < 8; r2++) for (var q = 0; q < 12; q++) { c.beginPath(); c.arc((r2 + (q % 2) * .5 + .25) * w / 8, (q + .5) * h / 12, Math.min(w / 8, h / 12) * .36, 0, 7); c.fill(); } }));
    g.add(new THREE.Mesh(tg, vay));   /* thân lộng vảy */
    var tr = new THREE.Mesh(new THREE.TubeGeometry(duong, 30, .32, 10, false), new THREE.MeshStandardMaterial({ color: 0x8c6a2a, metalness: .8, roughness: .6 })); g.add(tr);
    var gan = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineWidth = .1 * k; for (var j = 0; j < 9; j++) { var an = -PI * .3 + j / 8 * PI * .62; c.beginPath(); c.moveTo(X(1.15), Y(-1.95)); c.lineTo(X(1.15 + Math.cos(an) * 1.7), Y(-1.95 + Math.sin(an) * 1.7)); c.stroke(); } }, 2.2);
    gan.bumpMap.repeat.set(.1, .1); gan.bumpMap.offset.set(.5, .5);
    var sh = new THREE.Shape(), cx = 1.15, cy = -1.95, R = 2.05; sh.moveTo(cx, cy); sh.lineTo(cx + Math.cos(-PI * .32) * R, cy + Math.sin(-PI * .32) * R);
    sh.quadraticCurveTo(cx + 1.0, cy - .05, cx + Math.cos(PI * .02) * R * .72, cy + Math.sin(PI * .02) * R * .72);   /* khe chẻ đuôi */
    sh.quadraticCurveTo(cx + 1.25, cy + .75, cx + Math.cos(PI * .3) * R, cy + Math.sin(PI * .3) * R); sh.lineTo(cx, cy);
    var duoi = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .2, bevelEnabled: true, bevelThickness: .06, bevelSize: .05, bevelSegments: 1, curveSegments: 20 }), gan); duoi.position.z = -.1; g.add(duoi);   /* đuôi chẻ đôi */
    var shv = new THREE.Shape(); shv.moveTo(-1.1, .9); shv.quadraticCurveTo(-1.95, -.1, -1.25, -1.0); shv.lineTo(-.95, -.7); shv.quadraticCurveTo(-1.3, .1, -.9, .6);
    var vl_ = new THREE.Mesh(new THREE.ExtrudeGeometry(shv, { depth: .16, bevelEnabled: true, bevelThickness: .05, bevelSize: .04, bevelSegments: 1 }), VL.vangMo); vl_.position.z = -.08; g.add(vl_);   /* vây lưng */
    [-1, 1].forEach(function (s) { g.add(eli(VL.vangMo, s * .85, .65, .3, .45, .22, .12, s * .8)); });   /* vây ngực */
    var yd = mocDon(g, 3.4);
    return { g: g, rong: 5.0, xo: 'treo', cao: yd + 4.5 };
  };


  DS['23868'] = function () {   /* khánh bình an garnet (xem 4 ảnh): hạt dáng khoá như ý; mặt trước garnet tròn mài vòm giữa, quanh 1 vòng kim cương pavé, núm tròn trên đỉnh đính 1 viên; thành khoét vòm; lưng chữ Phúc 福 chạm lộng; lỗ xỏ 2 sườn */
    var g = new THREE.Group(), T = 3.2;
    var f = function (x, y) { var d = oval(2.45, 1.75)(x, y - .1); d = hop(d, tron(x, y, -1.95, 1.1, .85), .4); d = hop(d, tron(x, y, 1.95, 1.1, .85), .4); d = hop(d, tron(x, y, -2.1, -.55, .65), .35); d = hop(d, tron(x, y, 2.1, -.55, .65), .35); d = hop(d, tron(x, y, 0, -1.75, .7), .5); return d; }, p = vienTu(f, 0, 0, 260);
    g.add(thanhVien(vienTu(function (x, y) { return f(x, y) + .08; }, 0, 0, 260), T - .2, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 9; k++) { c.beginPath(); c.ellipse((k + .5) * w / 9, h * .58, w / 9 * .3, h * .28, 0, 0, 7); c.fill(); } })), 1));
    var mat = khoi(p, 0, 0, hoSo(.5, .14), VL.vang); mat.position.z = T / 2; g.add(mat);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .12; }, 0, 0, 260), .1, VL.vang, T / 2 + .03));
    g.add(matPhang(p, 7, longVang(vanLong(function (c, w, h) { c.font = '700 330px "Kaiti TC","STKaiti","Songti TC",serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 16; c.fillText('福', w / 2, h / 2 + 10); c.strokeText('福', w / 2, h / 2 + 10); })), -T / 2, true));
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .14; }, 0, 0, 260), .16, VL.vang, -T / 2));   /* viền lưng */
    var nen = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.6), new THREE.MeshStandardMaterial({ color: 0xd9aa48, metalness: 1, roughness: .4, side: THREE.DoubleSide })); nen.position.z = -T / 2 + .7; g.add(nen);
    var ds = []; for (var i = 0; i < 14; i++) { var a = i / 14 * PI * 2; ds.push([Math.cos(a) * 1.6, -.05 + Math.sin(a) * 1.5, T / 2 + .58, 0, 0, 1]); } g.add(hangKc(.32, ds));
    var o = new THREE.Mesh(new THREE.TorusGeometry(1.08, .14, 10, 48), VL.vang); o.position.set(0, -.05, T / 2 + .6); g.add(o);
    var v = vien(1.0, daGarnet, .8); v.position.set(0, -.05, T / 2 + .5); g.add(v);
    var nm = new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .4, 20), VL.vang); nm.rotation.x = PI / 2; nm.position.set(0, 1.95, T / 2 + .45); g.add(nm); g.add(hangKc(.3, [[0, 1.95, T / 2 + .68, 0, 0, 1]]));
    [-1, 1].forEach(function (s) { var x0 = 0; while (f(x0 * s, 0) < 0 && x0 < 9) x0 += .02; var l = new THREE.Mesh(new THREE.CircleGeometry(.5, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.x = s * (x0 + .02); g.add(l); });
    return { g: g, rong: 5.6, xo: 'xuyen', cao: 4.8 };
  };

  DS['24136'] = function () {   /* hoa mai móc (xem 4 ảnh): hoa mai 5 cánh vàng phun cát, cánh có gân toả, mép viền chỉ; nhuỵ ngọc lục tròn + 5 hạt nhị vàng; sau lưng là móc chữ U (khoá móc) ôm vào dây, đỉnh có khoen tròn — hoa nằm áp lên dây như charm xỏ */
    var g = new THREE.Group(), T = .8;
    var f = cungHoa(5, 1.45, .95, -PI / 4), p = vienTu(f, 0, 0, 240);
    var mt = vanRieng(function (c, X, Y, k) { for (var j = 0; j < 5000; j++) { c.fillStyle = (j % 2) ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)'; c.fillRect((j * 97) % 512, (j * 211 + (j >> 3)) % 512, 2, 2); }
      c.strokeStyle = '#fff'; c.lineWidth = .06 * k; for (var q = 0; q < 5; q++) { var a0 = PI / 2 + q * 2 * PI / 5; for (var l = -6; l <= 6; l++) { var a = a0 + l * .085; c.beginPath(); c.moveTo(X(Math.cos(a) * .9), Y(Math.sin(a) * .9)); c.lineTo(X(Math.cos(a) * 2.2), Y(Math.sin(a) * 2.2)); c.stroke(); } } }, 1.8);
    mt.roughness = .45; mt.color.set(0xf0c25a);
    var b = khoi(p, 0, 0, hoSo(T, .22), mt); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, 0, .35, mt, null, 14); v.position.z = T / 2 - .03; g.add(v);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .08; }, 0, 0, 240), .08, VL.vang, T / 2 + .03));
    var ng = vien(.62, VL.lucde, .75); ng.position.z = T / 2 + .3; g.add(ng);
    var ds = []; for (var i = 0; i < 5; i++) { var a = PI / 2 + PI / 5 + i * 2 * PI / 5, h = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), VL.vang); h.position.set(Math.cos(a) * .95, Math.sin(a) * .95, T / 2 + .3); g.add(h); }
    var mocU = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0, 1.3, -.2), new V3(0, -.6, -.35), new V3(0, -1.3, -.8), new V3(0, -1.2, -1.5), new V3(0, -.5, -1.75), new V3(0, .9, -1.8)]), 30, .17, 8), VL.vang); g.add(mocU);   /* móc chữ U */
    var dau = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), VL.vang); dau.position.set(0, .95, -1.8); g.add(dau);
    var khoenTren = khoen(.48, .14, VL.vang); khoenTren.rotation.y = PI / 2; khoenTren.position.set(0, 1.85, -.25); g.add(khoenTren);
    g.children.forEach(function (m) { m.position.y += .8; m.position.z += 1.15; });   /* dây đi qua lòng móc chữ U */
    return { g: g, rong: 4.6, xo: 'xuyen', cao: 4.6, uoc: 5 };
  };

  DS['24145'] = function () {   /* mũ hạt ngọc xanh (xem 4 ảnh): hạt ngọc xanh táo tròn, nửa trên đội chụp vàng hạt hình nón tròn: 4 gân hạt bi chia 4 ô, mỗi ô 1 viên kim cương ổ tròn, vành dưới viền hạt; chóp có núm; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), pf = [], j;
    for (j = 0; j <= 18; j++) { var t = j / 18; pf.push([.32 + 1.95 * Math.pow(Math.sin(t * PI / 2), 1.3), 2.15 - t * 2.25]); }
    g.add(xoayLuoi(pf, 80, null, hai(vangVan('hoa', 2.5, 1.2, .42))));
    g.add(vongHat(2.27, -.12, .14, VL.vang)); g.add(vongHat(.4, 2.1, .1, VL.vang));
    for (var q = 0; q < 4; q++) { var a = q * PI / 2 + PI / 4, n = 10, im = new THREE.InstancedMesh(new THREE.SphereGeometry(.1, 8, 6), VL.vang, n), m4 = new THREE.Matrix4();
      for (j = 0; j < n; j++) { var tt = (j + .5) / n, y = 2.15 - tt * 2.25, r = .32 + 1.95 * Math.pow(Math.sin(tt * PI / 2), 1.3) + .05; m4.makeTranslation(Math.sin(a) * r, y, Math.cos(a) * r); im.setMatrixAt(j, m4); } g.add(im); }   /* 4 gân hạt */
    for (q = 0; q < 4; q++) { var b = q * PI / 2, tt2 = .58, y2 = 2.15 - tt2 * 2.25, r2 = .32 + 1.95 * Math.pow(Math.sin(tt2 * PI / 2), 1.3) + .05, nx = Math.sin(b), nz = Math.cos(b);
      var o = new THREE.Mesh(new THREE.TorusGeometry(.32, .07, 8, 24), VL.vang); o.position.set(nx * (r2 + .05), y2, nz * (r2 + .05)); o.lookAt(nx * 9, y2 + 3, nz * 9); g.add(o);
      g.add(hangKc(.27, [[nx * (r2 + .02), y2, nz * (r2 + .02), nx, .45, nz]])); }
    var num = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 10), VL.vang); num.position.y = 2.25; g.add(num);
    var ngoc = new THREE.Mesh(new THREE.SphereGeometry(2.1, 40, 28), daTrong(0x7cc742, vanMay, .12, .36, .35)); ngoc.position.y = -.7; g.add(ngoc);
    var yd = mocDon(g, 2.4);
    return { g: g, rong: 4.6, xo: 'treo', cao: yd + 2.9 };
  };
  /* ---------- lô Khác 16: mây lửa ngọc, thỏi vàng ngọc, tim búa đá, cá vàng men, tim nghiêng đá, Cinnamoroll men ---------- */
  function tamMen(o) {   /* tấm men vẽ tay: khối vàng mờ theo viền f, thành khoét lỗ tròn, mặt men tranh o.ve (khung o.W ly), viền chỉ vàng + hạt nhỏ */
    var g = new THREE.Group(), T = o.T || 2.0, p = vienTu(o.f, o.cx || 0, o.cy || 0, 260), pn = phapTuyen(p), i;
    var b = khoi(p, o.cx || 0, o.cy || 0, hoSo(T, .22), VL.vangMo); b.position.z = T / 2; g.add(b);
    var ld = []; for (i = 0; i < 24; i++) { var k = Math.floor((i + .5) / 24 * p.length); if (p[k].y < (o.lyMax || 9)) ld.push([p[k].x + pn[k].x * .01, p[k].y + pn[k].y * .01, pn[k].x, pn[k].y]); } lamLo(g, ld, T, .24);
    var men = new THREE.MeshPhysicalMaterial({ roughness: .28, clearcoat: 1, clearcoatRoughness: .08, map: veMau(o.W, o.ve) });
    var pm = vienTu(function (x, y) { return o.f(x, y) + .28; }, o.cx || 0, o.cy || 0, 260);
    g.add(matPhang(pm, o.W, men, T / 2 + .02));
    g.add(ongVien(pm, .09, VL.vang, T / 2 + .04)); g.add(chuoiHat(vienTu(function (x, y) { return o.f(x, y) + .1; }, o.cx || 0, o.cy || 0, 260), .09, VL.vang, T / 2 + .02));
    return g;
  }
  function timF(k) { return function (x, y) { x /= k; y /= k; return hop(hop(tron(x, y, -.95, .55, 1.15), tron(x, y, .95, .55, 1.15), .3), daGiac([[-1.95, .25], [1.95, .25], [0, -2.25]])(x, y) - .25, .35) * k; }; }   /* trái tim */

  DS['24142'] = function () {   /* mây lửa ngọc (xem 4 ảnh): tấm chỉ vàng dáng mây lửa cuộn nhiều múi, đuôi xoắn vút lên nối khoen; viền hạt bi, trong là các đường chỉ cuộn, khe lộng giữa các cuộn; giữa ngọc bích xanh vàng tròn mài vòm trong ổ viền hạt; lưng tấm trơn khoét 4 lỗ */
    var g = new THREE.Group(), T = 1.1;
    var f = function (x, y) { var d = tron(x, y, -1.45, -.05, 1.15); d = hop(d, tron(x, y, 1.45, -.05, 1.15), .5); d = hop(d, tron(x, y, 0, -1.3, 1.15), .5); d = hop(d, tron(x, y, 0, .5, 1.1), .5); d = hop(d, tron(x, y, -1.0, 1.1, .55), .3); d = hop(d, tron(x, y, 1.0, 1.1, .55), .3); d = hop(d, daGiac([[-.3, 1.3], [.35, 1.3], [.15, 3.3], [-.25, 3.0]])(x, y) - .12, .45); return d; }   /* mây lửa: 4 thùy cuộn + 2 lưỡi lửa vai + đuôi lửa vút lên */, p = vienTu(f, 0, 0, 260);
    var mt = vanRieng(function (c, X, Y, k) { c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineWidth = .16 * k;
      for (var i = 0; i < 6; i++) { var a = PI / 2 + PI / 6 + i * PI / 3, cx = Math.cos(a) * 1.65, cy = -.2 + Math.sin(a) * 1.65; c.beginPath(); for (var t = 0; t <= 1; t += .03) { var b = a + PI + t * PI * 2 * 1.2, r = .55 * (1 - t * .7); c.lineTo(X(cx + Math.cos(b) * r), Y(cy + Math.sin(b) * r)); } c.stroke(); }
      c.beginPath(); c.moveTo(X(0), Y(1.1)); c.quadraticCurveTo(X(.35), Y(2.1), X(-.1), Y(3.0)); c.stroke(); }, 2.6);
    mt.roughness = .4;
    var b = khoi(p, 0, 0, hoSo(T, .25), mt); b.position.z = T / 2; g.add(b);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .12; }, 0, 0, 260), .1, VL.vang, T / 2 + .03));
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { var k2 = new THREE.Mesh(new THREE.CircleGeometry(.22, 16), new THREE.MeshStandardMaterial({ color: 0x5a3e12, metalness: .6, roughness: .7 })); k2.scale.set(1.5, .6, 1); k2.rotation.z = q[0] * q[1] * .8; k2.position.set(q[0] * 1.35, -.2 + q[1] * 1.1, T / 2 + .01); g.add(k2); });   /* khe lộng */
    var o = new THREE.Mesh(new THREE.TorusGeometry(1.0, .13, 10, 40), VL.vang); o.position.set(0, -.2, T / 2 + .1); g.add(o);
    g.add(chuoiHat(vienTu(function (x, y) { return Math.hypot(x, y + .2) - 1.2; }, 0, -.2, 60), .08, VL.vang, T / 2 + .08));
    var v = vien(.92, daTrong(0x9cc84a, vanMay, .12, .36, .3), .65); v.position.set(0, -.2, T / 2); g.add(v);
    var yd = mocDon(g, 3.2);
    return { g: g, rong: 5.4, xo: 'treo', cao: yd + 2.9 };
  };

  DS['24206'] = function () {   /* thỏi vàng ngọc (xem 4 ảnh): tấm thỏi vàng như ý — mép trên lõm giữa, 2 tai cuộn tròn 2 bên, đáy bo tròn; vàng phun cát; giữa ngọc bích xanh vàng tròn trong ổ; 2 bên mỗi bên 1 đồng xu lỗ vuông + cuộn mây chạm; viền chỉ; lưng chữ Phúc; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.1;
    var f = function (x, y) { var d = oval(2.75, 1.65)(x, y + .25); d = hop(d, tron(x, y, -2.15, .85, .8), .4); d = hop(d, tron(x, y, 2.15, .85, .8), .4); return -hop(-d, tron(x, y, 0, 2.25, 1.15), .4); }, p = vienTu(f, 0, -.2, 260);
    var mt = vanRieng(function (c, X, Y, k) { for (var j = 0; j < 6000; j++) { c.fillStyle = (j % 2) ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)'; c.fillRect((j * 97) % 512, (j * 211 + (j >> 3)) % 512, 2, 2); }
      c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineWidth = .14 * k;
      [-1, 1].forEach(function (s) { c.beginPath(); c.arc(X(s * 1.85), Y(-.15), .5 * k, 0, 7); c.stroke(); c.strokeRect(X(s * 1.85) - .2 * k, Y(-.15) - .2 * k, .4 * k, .4 * k);
        c.beginPath(); for (var t = 0; t <= 1; t += .03) { var a = (s > 0 ? PI : 0) + s * t * PI * 2.2, r = .55 * (1 - t * .75); c.lineTo(X(s * 2.15 + Math.cos(a) * r), Y(.85 + Math.sin(a) * r)); } c.stroke();
        c.beginPath(); c.moveTo(X(s * 1.0), Y(-1.5)); c.quadraticCurveTo(X(s * 1.6), Y(-1.45), X(s * 2.1), Y(-1.0)); c.stroke(); }); }, 2.6);
    mt.roughness = .5; mt.color.set(0xf0bf55);
    var b = khoi(p, 0, -.2, hoSo(T, .25), mt); b.position.z = T / 2; g.add(b);
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .12; }, 0, -.2, 260), .09, VL.vang, T / 2 + .03));
    var o = new THREE.Mesh(new THREE.TorusGeometry(1.15, .14, 10, 40), VL.vang); o.position.set(0, -.2, T / 2 + .1); g.add(o);
    var v = vien(1.08, daTrong(0x8cc63a, vanMay, .12, .38, .3), .68); v.position.set(0, -.2, T / 2); g.add(v);
    var yd = mocDon(g, 1.15);
    return { g: g, rong: 5.8, xo: 'treo', cao: yd + 2.2 };
  };

  DS['23915'] = function () {   /* tim búa đính đá (xem 4 ảnh): trái tim nhỏ phồng, vàng chạm búa lấm tấm, mặt trước đính 5 viên kim cương; lưng 4 lỗ chân đá; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), f0 = timF(1.0), f = function (x, y) { return f0(x / 1.18, y / .92); }, p = vienTu(f, 0, 0, 220), T = 1.3;   /* tim bè ngang như ảnh */
    var b = khoi(p, 0, 0, hoSo(T, .3), VL.vangBua); b.position.z = T / 2; g.add(b);
    var v = vom(p, 0, 0, .55, VL.vangBua, null, 16); v.position.z = T / 2 - .05; g.add(v);
    var lu = vom(p, 0, 0, .35, VL.vangBua, null, 12); lu.rotation.y = PI; lu.position.z = -T / 2 + .05; g.add(lu);
    g.add(hangKc(.36, [[-1.0, .35, T / 2 + .42, -.1, .1, 1], [0, .25, T / 2 + .52, 0, 0, 1], [1.0, .35, T / 2 + .42, .1, .1, 1], [-.5, -.5, T / 2 + .45, -.1, -.1, 1], [.5, -.5, T / 2 + .45, .1, -.1, 1]]));   /* 3 viên hàng trên, 2 viên hàng dưới */
    var yd = mocDon(g, 1.12);
    return { g: g, rong: 4.2, xo: 'treo', cao: yd + 2.4 };
  };

  DS['23956'] = function () {   /* cá vàng men (xem 4 ảnh): cá vàng (cá ba đuôi) nhìn ngang đầu trái; men trắng thân, mào đầu đỏ, vảy lưng đỏ hồng, vây + đuôi xoè vàng cam viền đỏ, nét chỉ vàng; mắt đen; thành vàng khoét lỗ tròn; khoen hàn đỉnh + khoen lớn */
    var f = function (x, y) { var d = oval(2.0, 1.5)(x + .35, y); d = hop(d, tron(x, y, 2.05, .75, .95), .5); d = hop(d, tron(x, y, 2.15, -.75, .85), .5); d = hop(d, tron(x, y, .3, 1.35, .7), .5); return d; };
    var g = tamMen({ f: f, cx: 0, cy: 0, W: 7, T: 2.0, lyMax: 1.0, ve: function (c, X, Y, k) {
      c.fillStyle = '#fbf8f2'; c.fillRect(0, 0, 512, 512);
      var gr = c.createLinearGradient(X(1.4), 0, X(3.3), 0); gr.addColorStop(0, '#ffd23e'); gr.addColorStop(.7, '#ff9a2e'); gr.addColorStop(1, '#e8352c'); c.fillStyle = gr;   /* đuôi */
      c.beginPath(); c.arc(X(2.05), Y(.75), .95 * k, 0, 7); c.fill(); c.beginPath(); c.arc(X(2.15), Y(-.75), .85 * k, 0, 7); c.fill(); c.fillRect(X(1.4), Y(.9), .9 * k, 1.8 * k);
      c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(X(.3), Y(1.35), .7 * k, 0, 7); c.fill();   /* vây lưng */
      var gl = c.createLinearGradient(0, Y(1.4), 0, Y(-.1)); gl.addColorStop(0, '#ff8a2a'); gl.addColorStop(1, 'rgba(255,214,70,.0)'); c.fillStyle = gl; c.beginPath(); c.ellipse(X(-.05), Y(.65), 1.45 * k, .85 * k, 0, 0, 7); c.fill();   /* lưng cam vàng */
      c.fillStyle = '#ef3f54'; c.beginPath(); c.ellipse(X(-1.55), Y(.55), .55 * k, .45 * k, 0, 0, 7); c.fill();   /* mào đầu đỏ */
      c.strokeStyle = '#e8365a'; c.lineWidth = .1 * k; for (var r = 0; r < 3; r++) for (var q = 0; q < 4; q++) { c.beginPath(); c.arc(X(-.4 + q * .45 + (r % 2) * .22), Y(.95 - r * .4), .26 * k, 0, PI); c.stroke(); }   /* vảy đỏ */
      c.strokeStyle = '#d9a43c'; c.lineWidth = .08 * k; c.beginPath(); c.moveTo(X(1.35), Y(1.1)); c.quadraticCurveTo(X(1.0), Y(0), X(1.35), Y(-1.1)); c.stroke();
      for (var j = 0; j < 4; j++) { c.beginPath(); c.moveTo(X(1.6), Y(0)); c.lineTo(X(2.9), Y(-1.2 + j * .8)); c.stroke(); }
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(X(-1.75), Y(.05), .14 * k, 0, 7); c.fill();
      c.fillStyle = '#ef3f54'; c.beginPath(); c.arc(X(-2.05), Y(-.45), .1 * k, 0, 7); c.fill(); } });
    var yd = mocDon(g, 1.95);
    return { g: g, rong: 6.0, xo: 'treo', cao: yd + 1.6 };
  };

  DS['23970'] = function () {   /* tim nghiêng đính đá (xem 4 ảnh): trái tim nghiêng lệch, viền hạt milgrain, mặt trước đính 2 hàng kim cương chạy theo 2 nhánh tim; lưng lỗ chân đá; khoen hàn ở thùy trên + khoen lớn */
    var g = new THREE.Group(), tim = new THREE.Group(), f = timF(1.0), p = vienTu(f, 0, 0, 220), T = 1.2;
    var b = khoi(p, 0, 0, hoSo(T, .25), VL.vang); b.position.z = T / 2; tim.add(b);
    tim.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .12; }, 0, 0, 220), .09, VL.vang, T / 2 + .03));
    var ds = []; [[-1.35, .75], [-1.0, .05], [-.55, -.6], [0, -1.25], [.55, -.6], [1.0, .05], [1.35, .75], [-.55, .55], [.55, .55]].forEach(function (q) { ds.push([q[0], q[1], T / 2 + .08, 0, 0, 1]); }); tim.add(hangKc(.27, ds));
    tim.rotation.z = -.65; tim.position.x = .42; g.add(tim);   /* tim nghiêng: thùy trái dựng cao, khoen ở đỉnh thùy */
    var yd = mocDon(g, 2.1);
    return { g: g, rong: 4.4, xo: 'treo', cao: yd + 2.4 };
  };

  DS['24039'] = function () {   /* chó Cinnamoroll men (xem 4 ảnh; user: là CON CHÓ): đầu cún tròn trắng to; 2 tai dài cụp rủ xuống 2 bên má, đầu tai tròn có đốm vàng; mũ hồng trên đỉnh viền vàng; mắt đen tròn, má hồng, mũi hồng + miệng chữ ω; men trắng, nét chỉ vàng tách đầu/tai; thành khoét lỗ tròn; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 2.0, cA = Math.cos(.38), sA = Math.sin(.38);
    function tai(s) { return function (x, y) { var u = x - s * 2.15, v = y + .3, ru = u * cA - s * v * sA, rv = s * u * sA + v * cA; return oval(1.3, .8)(ru, rv); }; }   /* tai to bầu tròn chìa ngang, hơi cụp xuống */
    var dau = function (x, y) { return oval(1.7, 1.55)(x, y); }, mu = function (x, y) { return oval(1.15, .5)(x, y - 1.45); };
    var f = function (x, y) { var d = hop(dau(x, y), mu(x, y), .3); d = hop(d, tai(1)(x, y), .25); return hop(d, tai(-1)(x, y), .25); }, p = vienTu(f, 0, 0, 280), pn = phapTuyen(p), i;
    var b = khoi(p, 0, 0, hoSo(T, .22), VL.vangMo); b.position.z = T / 2; g.add(b);
    var ld = []; for (i = 0; i < 24; i++) { var k = Math.floor((i + .5) / 24 * p.length); if (p[k].y < .4) ld.push([p[k].x + pn[k].x * .01, p[k].y + pn[k].y * .01, pn[k].x, pn[k].y]); } lamLo(g, ld, T, .24);
    var men = new THREE.MeshPhysicalMaterial({ roughness: .28, clearcoat: 1, clearcoatRoughness: .08, map: veMau(8, function (c, X, Y, k) {
      c.fillStyle = '#d9a43c'; c.fillRect(0, 0, 512, 512);
      [-1, 1].forEach(function (s) { c.save(); c.translate(X(s * 2.15), Y(-.3)); c.rotate(-s * .38); var gr = c.createLinearGradient(0, -.8 * k, 0, .8 * k); gr.addColorStop(0, '#fbf8f2'); gr.addColorStop(1, '#efe4d4'); c.fillStyle = gr;
        c.beginPath(); c.ellipse(0, 0, 1.12 * k, .62 * k, 0, 0, 7); c.fill(); c.restore();
        c.fillStyle = '#f2c94c'; c.beginPath(); c.arc(X(s * 2.85), Y(-.85), .2 * k, 0, 7); c.fill(); c.beginPath(); c.arc(X(s * 2.3), Y(-.95), .17 * k, 0, 7); c.fill(); });   /* tai trắng + đốm vàng đầu tai */
      c.fillStyle = '#fbf8f2'; c.beginPath(); c.ellipse(X(0), Y(0), 1.58 * k, 1.43 * k, 0, 0, 7); c.fill();   /* mặt trắng (nét vàng quanh mặt = nền vàng chừa ra) */
      c.fillStyle = '#ea3c7a'; c.beginPath(); c.ellipse(X(0), Y(1.45), 1.03 * k, .38 * k, 0, 0, 7); c.fill();   /* mũ hồng */
      c.fillStyle = '#f2c94c'; [-.6, 0, .6].forEach(function (x) { c.beginPath(); c.arc(X(x), Y(1.47), .07 * k, 0, 7); c.fill(); });
      [-1, 1].forEach(function (s) { c.fillStyle = '#1d1d1d'; c.beginPath(); c.ellipse(X(s * .6), Y(.1), .15 * k, .19 * k, 0, 0, 7); c.fill();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(X(s * .6 + .05), Y(.17), .05 * k, 0, 7); c.fill();
        c.fillStyle = 'rgba(240,110,140,.6)'; c.beginPath(); c.ellipse(X(s * .95), Y(-.35), .26 * k, .15 * k, 0, 0, 7); c.fill(); });   /* mắt + má */
      c.fillStyle = '#e8507a'; c.beginPath(); c.ellipse(X(0), Y(-.22), .13 * k, .1 * k, 0, 0, 7); c.fill();
      c.strokeStyle = '#b8505a'; c.lineWidth = .06 * k; c.beginPath(); c.moveTo(X(-.24), Y(-.42)); c.quadraticCurveTo(X(-.12), Y(-.58), X(0), Y(-.4)); c.quadraticCurveTo(X(.12), Y(-.58), X(.24), Y(-.42)); c.stroke(); }) });   /* mũi + miệng ω */
    var pm = vienTu(function (x, y) { return f(x, y) + .22; }, 0, 0, 280);
    g.add(matPhang(pm, 8, men, T / 2 + .02));
    var men2 = men.clone(); men2.map = men.map.clone(); men2.map.repeat.set(11 / 8, 11 / 8); men2.map.offset.set(.5 - 5.5 / 8, .5 - 5.5 / 8); men2.map.needsUpdate = true;   /* vom có uv = x/11 → chỉnh cho khớp tranh 8 ly */
    var vm = vom(vienTu(function (x, y) { return dau(x, y) + .1; }, 0, 0, 160), 0, 0, .35, men2, null, 14); vm.position.z = T / 2 + .03; g.add(vm);   /* mặt phồng nổi hơn tai */
    g.add(ongVien(pm, .09, VL.vang, T / 2 + .04)); g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .1; }, 0, 0, 280), .09, VL.vang, T / 2 + .02));
    var yd = mocDon(g, 1.85);
    return { g: g, rong: 7.8, xo: 'treo', cao: yd + 2.2 };
  };

  /* ---------- lô Khác 17: kì lân cánh men, tam giác men đỏ, thẻ mái đình chữ đỏ, mắt ngọc, bông tuyết ngọc, Di Lặc hổ phách ---------- */
  DS['23958'] = function () {   /* kì lân (xem 4 ảnh): ngựa thần vàng phun cát đúc tròn đứng, đầu trái, bờm nổi; 2 bên lưng đôi cánh men xanh lam chuyển trắng, viền chỉ vàng; khoen hàn trên lưng + khoen lớn */
    var g = new THREE.Group(), h = thanNgua(VL.vangMo);
    var canh = new THREE.Shape(); canh.moveTo(-.2, 0); canh.quadraticCurveTo(-.6, 1.3, .1, 2.3); canh.quadraticCurveTo(.5, 1.9, .55, 1.5); canh.quadraticCurveTo(.95, 1.75, 1.2, 1.3); canh.quadraticCurveTo(1.35, .85, 1.55, .75); canh.quadraticCurveTo(1.0, .1, -.2, 0);   /* cánh 3 lông */
    var mt = veMau(4, function (c, X, Y, k) { var gr = c.createLinearGradient(0, Y(2.3), 0, Y(0)); gr.addColorStop(0, '#1f4fc4'); gr.addColorStop(.45, '#3d78e0'); gr.addColorStop(.8, '#a9c4f0'); gr.addColorStop(1, '#fbf3ee'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512);
      c.strokeStyle = '#d9a43c'; c.lineWidth = .07 * k; [[.1, 2.0], [.6, 1.5], [1.15, 1.1]].forEach(function (q) { c.beginPath(); c.moveTo(X(-.1), Y(.1)); c.quadraticCurveTo(X(q[0] * .6), Y(q[1] * .5), X(q[0]), Y(q[1])); c.stroke(); }); });
    mt.repeat.set(.25, .25); mt.offset.set(.5, .5);
    var men = new THREE.MeshPhysicalMaterial({ map: mt, roughness: .3, clearcoat: 1 });
    [-1, 1].forEach(function (s) { var m = new THREE.Mesh(new THREE.ExtrudeGeometry(canh, { depth: .18, bevelEnabled: true, bevelThickness: .05, bevelSize: .05, bevelSegments: 1, curveSegments: 10 }), [men, VL.vang]);
      m.scale.setScalar(1.35); m.position.set(-.35, 1.2, s * 1.35); m.rotation.y = s > 0 ? -.25 : PI + .25; h.add(m);
      var vien_ = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(canh.getPoints(30).map(function (q) { return new V3(q.x, q.y, 0); }), true), 60, .06, 6, true), VL.vang); vien_.scale.copy(m.scale); vien_.position.copy(m.position); vien_.rotation.copy(m.rotation); vien_.position.z += s * .27; h.add(vien_); });
    g.add(h);
    var yd = mocDon(g, 2.05);
    return { g: g, rong: 7.0, xo: 'treo', cao: yd + 2.6 };
  };

  DS['B1240'] = function () {   /* tam giác đỏ (xem 4 ảnh): tấm tam giác đỉnh trên phủ men đỏ son, viền vàng chạm xoắn; giữa bông hoa vàng nổi 8 cánh; lưng chữ vàng; khoen hàn đỉnh + khoen lớn */
    var f = function (x, y) { return daGiac([[0, 2.75], [-2.95, -2.0], [2.95, -2.0]])(x, y) - .2; };
    var g = tamMen({ f: f, cx: 0, cy: -.4, W: 7, T: 1.1, lyMax: -9, ve: function (c, X, Y, k) { c.fillStyle = '#e4231f'; c.fillRect(0, 0, 512, 512); } });
    var hoa = khoi(vienTu(cungHoa(8, .55, .32, 0), 0, 0, 80), 0, 0, hoSo(.25, .08), VL.vang); hoa.position.set(0, -.45, .82); g.add(hoa);
    var nh = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 8), VL.vang); nh.scale.z = .6; nh.position.set(0, -.45, .9); g.add(nh);
    var yd = mocDon(g, 2.85);
    return { g: g, rong: 6.2, xo: 'treo', cao: yd + 2.2 };
  };

  DS['BS127'] = function (o) {   /* thẻ mái đình chữ đỏ (xem 4 ảnh): thẻ bài vàng phun cát, đầu là mái đình 2 tầng mái cong vểnh; thân chữ nhật đáy bo tròn; mặt khắc 2 chữ son đỏ xếp dọc (好运 / 努力 — khách chọn); khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 1.2, chu = { haoyun: '好运', nuli: '努力' }[(o && o.mau) || 'haoyun'] || '好运';
    var f = function (x, y) { return Math.hypot(Math.max(Math.abs(x) - .65, 0), Math.max(-(y + 1.6), 0, y - 1.0)) - 1.45; }, p = vienTu(f, 0, -.6, 200);
    var b = khoi(p, 0, -.6, hoSo(T, .25), VL.vangMo); b.position.z = T / 2; g.add(b);
    var chuMat = new THREE.MeshStandardMaterial({ map: veMau(6, function (c, X, Y, k) { c.clearRect(0, 0, 512, 512); c.fillStyle = '#e0261e'; c.font = '700 ' + (1.75 * k) + 'px "PingFang SC","Heiti SC","Songti SC",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(chu[0], X(0), Y(.15)); c.fillText(chu[1], X(0), Y(-1.75)); }), transparent: true, roughness: .45, metalness: 0 });
    g.add(matPhang(vienTu(function (x, y) { return f(x, y) + .2; }, 0, -.6, 200), 6, chuMat, T / 2 + .01));
    [[2.45, .38, 1.15], [1.8, .32, 1.62], [1.05, .28, 2.0]].forEach(function (q, i) {   /* 2 tầng mái + nóc */
      var sh = new THREE.Shape(); sh.moveTo(-q[0], q[2] - q[1] / 2 + .32); sh.quadraticCurveTo(-q[0] * .75, q[2] - q[1] / 2 - .05, 0, q[2] - q[1] / 2); sh.quadraticCurveTo(q[0] * .75, q[2] - q[1] / 2 - .05, q[0], q[2] - q[1] / 2 + .32);   /* mái cong vểnh 2 đầu */
      sh.lineTo(q[0] * .88, q[2] + q[1] / 2); sh.lineTo(-q[0] * .88, q[2] + q[1] / 2); sh.closePath();
      var m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: T + .1 - i * .1, bevelEnabled: true, bevelThickness: .06, bevelSize: .05, bevelSegments: 2 }), VL.vang); m.position.z = -(T + .1 - i * .1) / 2; g.add(m);
      for (var j = -3; j <= 3; j++) { var r = new THREE.Mesh(new THREE.BoxGeometry(.06, q[1] * .8, .06), VL.vangMo); r.position.set(j * q[0] * .26, q[2], (T + .1 - i * .1) / 2 + .03); g.add(r); } });   /* gân ngói */
    var yd = mocDon(g, 2.15);
    return { g: g, rong: 5.0, xo: 'treo', cao: yd + 3.6 };
  };

  DS['BS26'] = function () {   /* mắt ngọc (xem 4 ảnh): hạt hình con mắt (hạnh nhân), viền hạt bi to, mép trên mọc 7 tia mi nhọn; lòng mắt viền chỉ, tròng ngọc lục đế tròn mài vòm trong ổ; thành khoét lỗ tròn + thoi; lỗ xỏ ở 2 khoé mắt (xỏ dọc) */
    var g = new THREE.Group(), T = 2.8, Rc = 3.2, c0 = 1.85;
    var f = function (x, y) { return Math.max(tron(x, y, 0, -c0, Rc), tron(x, y, 0, c0, Rc)); }, p = vienTu(f, 0, 0, 220);
    g.add(thanhVien(vienTu(function (x, y) { return f(x, y) + .06; }, 0, 0, 220), T - .2, longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 8; k++) { var x = (k + .5) * w / 8; if (k % 2) { c.beginPath(); c.arc(x, h / 2, h * .2, 0, 7); c.fill(); } else { c.beginPath(); c.moveTo(x, h * .28); c.lineTo(x + 22, h / 2); c.lineTo(x, h * .72); c.lineTo(x - 22, h / 2); c.fill(); } } })), 1));
    var mat = khoi(p, 0, 0, hoSo(.5, .14), VL.vangMo); mat.position.z = T / 2; g.add(mat);
    var lu = khoi(p, 0, 0, hoSo(.3, .1), VL.vangMo); lu.position.z = -T / 2 + .3; g.add(lu);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .02; }, 0, 0, 220), .18, VL.vang, T / 2 + .02));
    g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .5; }, 0, 0, 220), .1, VL.vang, T / 2 + .05));
    for (var i = 0; i < 7; i++) { var a = PI * (.22 + i * .093), px = Math.cos(a) * (Rc + .08), py = -c0 + Math.sin(a) * (Rc + .08), cn = new THREE.Mesh(new THREE.ConeGeometry(.2, .75, 8), VL.vangMo); cn.position.set(px + Math.cos(a) * .3, py + Math.sin(a) * .3, T / 2 - .3); cn.rotation.z = a - PI / 2; g.add(cn); }   /* mi mắt */
    var o = new THREE.Mesh(new THREE.TorusGeometry(1.05, .14, 10, 40), VL.vang); o.position.z = T / 2 + .2; g.add(o);
    var v = vien(.98, VL.lucde, .75); v.position.z = T / 2 + .1; g.add(v);
    [-1, 1].forEach(function (s) { var x0 = 0; while (f(x0 * s, 0) < 0 && x0 < 9) x0 += .02; var l = new THREE.Mesh(new THREE.CircleGeometry(.42, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.x = s * (x0 - .05); g.add(l); });
    return { g: g, rong: 6.2, xo: 'xuyen', cao: 3.6 };
  };

  DS['A5805'] = function () {   /* bông tuyết ngọc (xem 4 ảnh): giữa ngọc bích xanh táo tròn mài vòm trong ổ chấu; quanh 6 nhánh hoa tuyết, đầu mỗi nhánh là lá 3 thùy chấm hạt; dưới là lồng ổ đỡ thủng; lưng 6 nan; lỗ xỏ 2 sườn */
    var g = new THREE.Group(), T = 2.4, i;
    var long_ = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.15, T, 36, 1, true), longVang(vanLong(function (c, w, h) { c.fillRect(0, 0, w, h); c.fillStyle = '#000'; for (var k = 0; k < 6; k++) { c.beginPath(); c.ellipse((k + .5) * w / 6, h / 2, w / 6 * .32, h * .3, 0, 0, 7); c.fill(); } }))); long_.rotation.x = PI / 2; g.add(long_);
    for (i = 0; i < 6; i++) { var a = i * PI / 3 + PI / 6, n = new THREE.Group();
      var cg = new THREE.Mesh(new THREE.BoxGeometry(.3, 1.0, .35), VL.vang); cg.position.y = 1.45; n.add(cg);
      var la = khoi(vienTu(function (x, y) { return Math.min(tron(x, y, 0, 2.25, .38), tron(x, y, -.38, 1.95, .32), tron(x, y, .38, 1.95, .32)); }, 0, 2.05, 60), 0, 2.05, hoSo(.4, .12), VL.vangMo); la.position.z = .2; n.add(la);
      [[0, 2.3], [-.4, 1.95], [.4, 1.95]].forEach(function (q) { var h = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), VL.vang); h.position.set(q[0], q[1], .28); n.add(h); });
      n.rotation.z = a - PI / 2; n.position.z = T / 2 - .3; g.add(n); }
    var o = new THREE.Mesh(new THREE.TorusGeometry(1.28, .14, 10, 40), VL.vang); o.position.z = T / 2; g.add(o);
    var v = vien(1.22, daTrong(0x6cc33a, vanMay, .12, .38, .3), .8); v.position.z = T / 2; g.add(v);
    [-1, 1].forEach(function (s) { var l = new THREE.Mesh(new THREE.CircleGeometry(.42, 18), VL.toi); l.rotation.y = s * PI / 2; l.position.x = s * 1.32; g.add(l); });
    return { g: g, rong: 5.4, xo: 'xuyen', cao: 5.4, uoc: 6 };
  };

  DS['A55891'] = function () {   /* Di Lặc hổ phách (xem 4 ảnh): tượng Di Lặc ngồi chạm trên đá vàng cam trong (MẶT CHẠM LẤY TỪ ẢNH THẬT), dáng đầu tròn trên bụng bầu to, cân xứng; ổ vàng ôm sát viền hạt bi; lưng vàng chạm lộng mây cuộn; khoen hàn đỉnh + khoen lớn */
    var g = new THREE.Group(), T = 2.6;
    var f = function (x, y) { return hop(oval(4.3, 3.2)(x, y + 1.4), oval(2.5, 2.3)(x, y - 2.1), 1.2); }, vk = vienTu(f, 0, 0, 300);
    var ngoc = ngocAnh('A55891'); ngoc.map = null; ngoc.color.set(0xf4ad2c); ngoc.bumpScale = 3.6; ngoc.transmission = .3; ngoc.thickness = 2; ngoc.attenuationColor = new THREE.Color(0xf0a020); ngoc.attenuationDistance = 3; ngoc.needsUpdate = true;   /* soát: bỏ màu ảnh lốm đốm → ngọc vàng mật ong trong, nét chạm giữ bằng vân nổi */
    var v = vom(vk, 0, 0, 1.6, ngoc, null, 50); v.position.z = T / 2 - .3; g.add(v);
    var vo = vienTu(function (x, y) { return f(x, y) - .35; }, 0, 0, 300), de = khoi(vo, 0, 0, hoSo(T, .4), VL.vang); de.position.z = T / 2 - .05; g.add(de);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) - .42; }, 0, 0, 300), .16, VL.vang, -T / 2 + .25));
    var yd = mocDon(g, 4.65);
    return { g: g, rong: 9.4, xo: 'treo', cao: yd + 4.9 };
  };
  /* ---------- lô Khác 18: đá chạm nguyên khối — cỏ 4 lá tóc xanh, túi tiền tóc xanh / mắt hổ / tóc vàng ---------- */
  DS['9715'] = function () {   /* cỏ 4 lá thạch anh tóc xanh (xem 4 ảnh): khối thạch anh tóc xanh trong, tạc 4 lá tròn ở 4 góc chéo, rãnh chữ thập sâu, khía nhỏ đầu mỗi lá; mặt vòm cao, lưng phẳng; XỎ DỌC qua khe trên-dưới */
    var f = coLa(4, 3.0, .85, 2.15, 2.0, PI / 4), vk = vienTu(f, 0, 0, 220), g = new THREE.Group(), vl = daSuot({ mau: 0xcfe8ba, tr: .6, nhuom: 0xe0f0d2, xa: 8 });
    g.add(soiToc(function (x, y, z) { return Math.max(f(x, y) + .45, Math.abs(z - 1.1) - .8); }, [-4, -4, 0, 4, 4, 3], { mau: 0x1f3a15, so: 60, r: .04, dai: 4, hatGiong: 43 }));
    var v = vom(vk, 0, 0, 3.6, vl, function (x, y, s) { var a = Math.atan2(y, x), q = Math.abs(Math.sin(2 * a)); return 1 - .2 * Math.exp(-Math.pow(q / .1, 2)) * Math.min(1, s * 1.5); }, 36); g.add(v);
    var lm = latMat(v); lm.scale.z = .08 / .55; g.add(lm);
    g.children.forEach(function (m) { m.position.z -= 1.6; });
    var y0 = 0; while (f(0, y0) < 0 && y0 < 8) y0 += .02;
    return { g: docDay(g, 2 * y0), rong: 2 * y0, xo: 'ong', cao: 7.6, uoc: 7.6 };
  };

  function tuiDa(o) {   /* túi tiền đá chạm nguyên khối (mặt vòm, lưng phẳng): bụng túi tròn, cổ thắt, miệng túi xoè 3 múi cuộn; mặt khắc: o.xu = đồng xu tròn trên bụng, ngược lại gân lá toả từ cổ; o.lo: 'doc' xỏ dọc 2 ly, 'treo' mũ chụp vàng + khoen (không xuyên lỗ) */
    var g = new THREE.Group(), f = function (x, y) { var d = oval(2.95, 2.55)(x, y + 1.0); d = hop(d, oval(1.15, .55)(x, y - 1.5), .45);
      d = hop(d, tron(x, y, 0, 2.35, 1.0), .35); d = hop(d, tron(x, y, -1.75, 2.2, .82), .35); d = hop(d, tron(x, y, 1.75, 2.2, .82), .35); return d; }, vk = vienTu(f, 0, .2, 260);
    var v = vom(vk, 0, .2, 2.6, o.vl, function (x, y, s) { var k = 1;
      k -= .14 * Math.exp(-Math.pow((y - 1.4) / .22, 2)) * (Math.abs(x) < 1.6 ? 1 : 0);   /* rãnh cổ túi */
      k -= .08 * Math.exp(-Math.pow((Math.abs(x) - .9) / .12, 2)) * (y > 1.6 ? 1 : 0);   /* khe 3 múi miệng */
      if (o.xu) { var r = Math.hypot(x, y + 1.1); k -= .09 * Math.exp(-Math.pow((r - 1.25) / .1, 2)) + .06 * Math.exp(-Math.pow((Math.max(Math.abs(x), Math.abs(y + 1.1)) - .45) / .08, 2)); }   /* đồng xu khắc */
      else { var a = Math.atan2(x, -(y - 1.1)); for (var j = -2; j <= 2; j++) k -= .07 * Math.exp(-Math.pow((a - j * .32) / .045, 2)) * (y < .9 && y > -1.6 ? 1 : 0); }   /* gân lá toả từ cổ */
      return k * (.65 + .35 * Math.min(1, s * 3)); }, 40); g.add(v);
    var lm = latMat(v); lm.scale.z = .06 / .55; g.add(lm);
    g.children.forEach(function (m) { m.position.z -= 1.0; });
    if (o.lo === 'doc') { var yt = 0; while (f(0, yt) < 0 && yt < 9) yt += .02; var yb = 0; while (f(0, -yb) < 0 && yb < 9) yb += .02;
      g.children.forEach(function (m) { m.position.y -= (yt - yb) / 2; }); return { g: docDay(g, yt + yb), rong: yt + yb, xo: 'ong', cao: 6.2, uoc: 6.2, dungXem: true }; }
    var mu = new THREE.Mesh(new THREE.SphereGeometry(.7, 20, 12, 0, PI * 2, 0, PI / 2), VL.vang); mu.scale.set(1, .7, .9); mu.position.set(0, 3.15, .2); g.add(mu);   /* mũ chụp vàng gắn đỉnh (đá không xuyên lỗ) */
    var yd = mocDon(g, 3.55);
    return { g: g, rong: 6.2, xo: 'treo', cao: yd + 3.6 };
  }
  var matHoVl = function () { return da(0xf3b81e, vanMatHo, .14, .42); };
  var tocXanhNhat = function () { var m = daTrong(0xc4dca6, vanTocXanh, .12, .3, .5, 4); m.attenuationColor = new THREE.Color(0x8fbf6a); return m; };   /* thạch anh tóc xanh nhạt trong (ảnh 9715/9674): nền xanh lá nhạt, sợi tóc xanh rêu */
  DS['9674'] = function () { return tuiKhoi('xanh', true); };   /* túi tiền thạch anh tóc xanh (xem 4 ảnh): khắc đồng xu trên bụng, miệng xoè cuộn; user: charm XUYÊN (xỏ dọc đáy→miệng), không phải charm rơi */
  DS['22312'] = function () { return tuiKhoi('xanh', true); };   /* túi tiền thạch anh tóc xanh xuyên lỗ 2 ly (xem 4 ảnh): như 9674, lỗ xuyên dọc đáy→miệng */
  DS['9675'] = function () { return tuiKhoi('matHo', false); };   /* túi tiền mắt hổ vàng (xem 4 ảnh): bụng khắc gân lá toả từ cổ, sợi óng mắt hổ; charm XUYÊN dọc */
  DS['16079'] = function () { return tuiKhoi('matHo', true); };   /* túi tiền mắt hổ vàng xuyên lỗ 2 ly (xem 4 ảnh): bụng khắc đồng xu, lỗ dọc đáy→miệng */
  DS['9680'] = function (o) { return tuiKhoi(o && o.mau === 'nau' ? 'vangCam' : 'vangChanh', false); };   /* túi tiền thạch anh tóc vàng (2 màu: vàng chanh trong / nâu cam): bụng gân lá toả, miệng xoè cuộn; xỏ dọc, tạc tròn */
  /* ---------- lô cuối: tỳ hưu / hồ ly / hồ ly chúa thạch anh tóc vàng (đều XỎ DỌC), sao 4 cánh nối ---------- */
  function docDayTam(g) {   /* căn giữa theo trục y rồi khoét lỗ 2 đầu, đặt nằm theo dây */
    var b = new THREE.Box3().setFromObject(g), cy = (b.min.y + b.max.y) / 2, h = b.max.y - b.min.y;
    g.children.forEach(function (m) { m.position.y -= cy; }); return { g: docDay(g, h), dai: h }; }
  var tocBaMia = function () { return daTrong(0xf4ead2, vanToc, .1, .26, .55, 4); };   /* thạch anh tóc vàng bã mía: nền trong gần trắng, sợi tóc vàng thưa */
  var tocCam = function () { return da(0xf2b23a, vanToc, .18, .4); };   /* tóc vàng ngả cam */
  /* ---------- KHỐI TẠC TRÒN (soát 12/11): đá/ngọc chạm nguyên khối dựng bằng hàm khoảng cách 3D (SDF) → lưới Surface Nets
     → tròn đủ mọi phía như hàng thật, không còn kiểu "vòm trên lưng phẳng". Đơn vị mm. ---------- */
  var S3 = {
    cau: function (x, y, z, cx, cy, cz, r) { return Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz)) - r; },
    elip: function (x, y, z, cx, cy, cz, a, b, c) { var u = (x - cx) / a, v = (y - cy) / b, w = (z - cz) / c, k0 = Math.sqrt(u * u + v * v + w * w), k1 = Math.sqrt(u * u / (a * a) + v * v / (b * b) + w * w / (c * c)); return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -Math.min(a, b, c); },
    ong: function (x, y, z, ax, ay, az, bx, by, bz, r) { var px = x - ax, py = y - ay, pz = z - az, dx = bx - ax, dy = by - ay, dz = bz - az, h = Math.max(0, Math.min(1, (px * dx + py * dy + pz * dz) / (dx * dx + dy * dy + dz * dz))); px -= dx * h; py -= dy * h; pz -= dz * h; return Math.sqrt(px * px + py * py + pz * pz) - r; },
    xuyen: function (x, z, cx, cz, r) { return Math.hypot(x - cx, z - cz) - r; },   /* trụ dọc trục y (lỗ xỏ) */
    hop: function (a, b, k) { var h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k / 4; },
    tru: function (a, b, k) { return -S3.hop(-a, b, k); },   /* a trừ b, bo mềm */
    giao: function (a, b, k) { return -S3.hop(-a, -b, k); }
  };
  function sdfLuoi(f, bb, n, uvF) {   /* Surface Nets: f(x,y,z)<0 bên trong; bb=[x0,y0,z0,x1,y1,z1]; n ô theo cạnh dài nhất */
    var h = Math.max(bb[3] - bb[0], bb[4] - bb[1], bb[5] - bb[2]) / n, nx = Math.ceil((bb[3] - bb[0]) / h) + 3, ny = Math.ceil((bb[4] - bb[1]) / h) + 3, nz = Math.ceil((bb[5] - bb[2]) / h) + 3;
    var x0 = bb[0] - h, y0 = bb[1] - h, z0 = bb[2] - h, V = new Float32Array(nx * ny * nz), i, j, k, id = function (i, j, k) { return i + nx * (j + ny * k); };
    /* tối ưu: tính lưới thô (bước 2h) trước; điểm mịn chỉ gọi f khi ô thô quanh nó gần bề mặt, còn lại nội suy (giữ đúng dấu) → nhanh ~4–6 lần */
    var cx = (nx >> 1) + 1, cy = (ny >> 1) + 1, cz = (nz >> 1) + 1, CV = new Float32Array(cx * cy * cz), ci = function (i, j, k) { return i + cx * (j + cy * k); }, nguong = 2.2 * h;
    for (k = 0; k < cz; k++) for (j = 0; j < cy; j++) for (i = 0; i < cx; i++) CV[ci(i, j, k)] = f(x0 + 2 * i * h, y0 + 2 * j * h, z0 + 2 * k * h);
    for (k = 0; k < nz; k++) for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      var I = Math.min(i >> 1, cx - 2), J = Math.min(j >> 1, cy - 2), K = Math.min(k >> 1, cz - 2), a = i / 2 - I, b = j / 2 - J, c = k / 2 - K, mn = 1e9, q;
      var c000 = CV[ci(I, J, K)], c100 = CV[ci(I + 1, J, K)], c010 = CV[ci(I, J + 1, K)], c110 = CV[ci(I + 1, J + 1, K)], c001 = CV[ci(I, J, K + 1)], c101 = CV[ci(I + 1, J, K + 1)], c011 = CV[ci(I, J + 1, K + 1)], c111 = CV[ci(I + 1, J + 1, K + 1)];
      mn = Math.min(Math.abs(c000), Math.abs(c100), Math.abs(c010), Math.abs(c110), Math.abs(c001), Math.abs(c101), Math.abs(c011), Math.abs(c111));
      if (mn > nguong && (c000 > 0) === (c111 > 0) && (c000 > 0) === (c100 > 0) && (c000 > 0) === (c011 > 0)) {
        q = ((c000 * (1 - a) + c100 * a) * (1 - b) + (c010 * (1 - a) + c110 * a) * b) * (1 - c) + ((c001 * (1 - a) + c101 * a) * (1 - b) + (c011 * (1 - a) + c111 * a) * b) * c; V[id(i, j, k)] = q; }
      else V[id(i, j, k)] = f(x0 + i * h, y0 + j * h, z0 + k * h); }
    var dinh = new Int32Array(nx * ny * nz).fill(-1), pos = [], nor = [], E = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]], C = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]], g = [0, 0, 0, 0, 0, 0, 0, 0];
    for (k = 0; k < nz - 1; k++) for (j = 0; j < ny - 1; j++) for (i = 0; i < nx - 1; i++) {
      var m = 0, c; for (c = 0; c < 8; c++) { g[c] = V[id(i + C[c][0], j + C[c][1], k + C[c][2])]; if (g[c] < 0) m |= 1 << c; }
      if (m === 0 || m === 255) continue;
      var sx = 0, sy = 0, sz = 0, so = 0;
      E.forEach(function (e) { var a = g[e[0]], b = g[e[1]]; if ((a < 0) === (b < 0)) return; var t = a / (a - b), A = C[e[0]], B = C[e[1]]; sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t; so++; });
      var px = x0 + (i + sx / so) * h, py = y0 + (j + sy / so) * h, pz = z0 + (k + sz / so) * h, e2 = h * .5;
      var gx = f(px + e2, py, pz) - f(px - e2, py, pz), gy = f(px, py + e2, pz) - f(px, py - e2, pz), gz = f(px, py, pz + e2) - f(px, py, pz - e2), gl = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
      dinh[id(i, j, k)] = pos.length / 3; pos.push(px, py, pz); nor.push(gx / gl, gy / gl, gz / gl); }
    var idx = [];
    function quad(a, b, c, d, lat) { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (lat) idx.push(a, c, b, a, d, c); else idx.push(a, b, c, a, c, d); }
    for (k = 1; k < nz - 1; k++) for (j = 1; j < ny - 1; j++) for (i = 1; i < nx - 1; i++) {
      var v0 = V[id(i, j, k)] < 0;
      if (i < nx - 1 && v0 !== (V[id(i + 1, j, k)] < 0)) quad(dinh[id(i, j - 1, k - 1)], dinh[id(i, j, k - 1)], dinh[id(i, j, k)], dinh[id(i, j - 1, k)], !v0);
      if (j < ny - 1 && v0 !== (V[id(i, j + 1, k)] < 0)) quad(dinh[id(i - 1, j, k - 1)], dinh[id(i - 1, j, k)], dinh[id(i, j, k)], dinh[id(i, j, k - 1)], !v0);
      if (k < nz - 1 && v0 !== (V[id(i, j, k + 1)] < 0)) quad(dinh[id(i - 1, j - 1, k)], dinh[id(i, j - 1, k)], dinh[id(i, j, k)], dinh[id(i - 1, j, k)], !v0); }
    var uv = [], ly = bb[4] - bb[1]; for (i = 0; i < pos.length; i += 3) { if (uvF) { var q = nor[i + 2] > .05 ? uvF(pos[i], pos[i + 1]) : [.004, .004]; uv.push(q[0], q[1]); }   /* vân ảnh chỉ ở mặt trước; lưng trơn */ else uv.push(Math.atan2(pos[i + 2], pos[i]) / (2 * PI) + .5, (pos[i + 1] - bb[1]) / ly); }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
    return geo;
  }
  /* đá trong suốt (thạch anh / ngọc băng): ánh sáng xuyên qua, thấy sợi tóc nằm BÊN TRONG khối */
  function daKinh(o) { return new THREE.MeshPhysicalMaterial({ color: o.mau || 0xffffff, transparent: true, opacity: o.dac || .3, roughness: .03, clearcoat: 1, clearcoatRoughness: .02, ior: 1.54, specularIntensity: 1, envMapIntensity: 2.4, depthWrite: false, side: THREE.DoubleSide }); }   /* đá trong không màu (bã mía, ngọc băng): trong như pha lê, thấy rõ sợi bên trong */
  function daSuot(o) { if (o.kinh) return daKinh(o); var m = new THREE.MeshPhysicalMaterial({ color: o.mau || 0xffffff, transmission: o.tr === undefined ? 1 : o.tr, thickness: o.day || 4, roughness: o.nham || .07, ior: o.ior || 1.54, attenuationColor: new THREE.Color(o.nhuom || 0xffffff), attenuationDistance: o.xa || 6, clearcoat: 1, clearcoatRoughness: .02, specularIntensity: 1, envMapIntensity: 1.3, map: o.map || null, side: THREE.FrontSide });
    return m; }
  /* sợi tóc (rutile) thật trong lòng khối: đoạn thẳng mảnh ngẫu nhiên, chỉ giữ phần nằm bên trong f */
  var _soi = {};
  function soiToc(f, bb, o) { var so = o.so || 140, g = o.key && _soi[o.key + so] ? _soi[o.key + so].slice() : [], daCo = g.length > 0, m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), A = new V3(), B = new V3(), Y = new V3(0, 1, 0), i, t, hat = o.hat || 7;
    var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(o.hatGiong || 12345);
    for (i = 0; !daCo && i < so * 6 && g.length < so; i++) {
      var cx = bb[0] + rnd() * (bb[3] - bb[0]), cy = bb[1] + rnd() * (bb[4] - bb[1]), cz = bb[2] + rnd() * (bb[5] - bb[2]); if (f(cx, cy, cz) > -.25) continue;
      var th = rnd() * PI * 2, ph = Math.acos(2 * rnd() - 1), dx = Math.sin(ph) * Math.cos(th), dy = Math.sin(ph) * Math.sin(th), dz = Math.cos(ph);
      if (o.huong) { dx = dx * .35 + o.huong[0]; dy = dy * .35 + o.huong[1]; dz = dz * .35 + o.huong[2]; var l0 = Math.hypot(dx, dy, dz); dx /= l0; dy /= l0; dz /= l0; }
      var L = (o.dai || 3) * (.4 + rnd()), a = 0, b = 0;
      for (t = 0; t < L; t += .22) { if (f(cx + dx * t, cy + dy * t, cz + dz * t) > -.12) break; a = t; }
      for (t = 0; t < L; t += .22) { if (f(cx - dx * t, cy - dy * t, cz - dz * t) > -.12) break; b = t; }
      if (a + b < .5) continue;
      g.push([cx + dx * a, cy + dy * a, cz + dz * a, cx - dx * b, cy - dy * b, cz - dz * b, (o.r || .035) * (.5 + rnd())]); }
    if (o.key && !daCo) _soi[o.key + so] = g.slice();
    var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 5, 1, true), o.vl || new THREE.MeshStandardMaterial({ color: o.mau || 0xd99a1c, metalness: .6, roughness: .3, emissive: o.mau || 0xd99a1c, emissiveIntensity: .25 }), g.length);
    g.forEach(function (s, i) { A.set(s[0], s[1], s[2]); B.set(s[3], s[4], s[5]); var d = B.clone().sub(A), L = d.length(); q.setFromUnitVectors(Y, d.normalize());
      m4.compose(A.clone().add(B).multiplyScalar(.5), q, new V3(s[6], L, s[6])); im.setMatrixAt(i, m4); });
    return im; }
  var _khoi = {};   /* bộ đệm lưới khối tạc theo khoá: dựng 1 lần, gắn/xem lại dùng ngay */
  function khoiTac(f, bb, vl, n, key, uvF) { var geo = key && _khoi[key] || sdfLuoi(f, bb, n || 80, uvF); if (key) _khoi[key] = geo; return new THREE.Mesh(geo, vl); }
  /* rãnh khắc mềm (cộng vào SDF): sâu d, rộng w, theo khoảng cách t tới đường */
  function ranh(t, w, d) { return d * Math.exp(-(t * t) / (w * w)); }
  var DA_TOC = {   /* chất thạch anh tóc theo ảnh: thân đá có màu + trong vừa (không trong như thuỷ tinh), sợi tóc thật bên trong */
    vangChanh: function () { return { vl: daSuot({ mau: 0xffc62a, tr: .42, nhuom: 0xffd65a, xa: 4 }), soi: { mau: 0xe0a72c, so: 190, r: .021, dai: 3.5 } }; },
    vangCam: function () { return { vl: daSuot({ mau: 0xffa21e, tr: .4, nhuom: 0xffc050, xa: 3.5 }), soi: { mau: 0xd8961e, so: 190, r: .021, dai: 3.5 } }; },
    baMia: function () { return { vl: daSuot({ kinh: true, mau: 0xfff3d6, dac: .32 }), soi: { mau: 0xd08a20, so: 24, r: .06, dai: 4.5 } }; },
    xanh: function () { return { vl: daSuot({ mau: 0xd3ebbf, tr: .62, nhuom: 0xe2f2d4, xa: 9 }), soi: { mau: 0x2b4a1e, so: 55, r: .035, dai: 4.5 } }; },
    xanhDam: function () { return { vl: daSuot({ mau: 0xb3d69c, tr: .5, nhuom: 0xcfe6bd, xa: 6 }), soi: { mau: 0x1f3a15, so: 80, r: .04, dai: 4.5 } }; },
    trongVang: function () { return { vl: daSuot({ kinh: true, mau: 0xfff8ea, dac: .3 }), soi: { mau: 0xd8a024, so: 120, r: .022, dai: 4 } }; }
  };
  var ngocLam = function () { return daSuot({ mau: 0x74ccb8, tr: .5, nhuom: 0xa8e4d6, xa: 4, nham: .12, ior: 1.66 }); };   /* ngọc lam xanh: trong vừa, phát sáng */
  function daToc(f, bb, kieu, n, giong, key, H) { var c = (typeof kieu === 'string' ? DA_TOC[kieu] : kieu)(), g = new THREE.Group(); g.add(khoiTac(f, bb, H ? vanThat(H.ten, c.vl) : c.vl, n, key, H && H.uv)); var s = Object.assign({ hatGiong: giong || 7, key: key }, c.soi); g.add(soiToc(f, bb, s)); return g; }
  var matHoLuoi = function () { var t = vanMatHo.clone(); t.needsUpdate = true; t.repeat.set(3, 1); return new THREE.MeshPhysicalMaterial({ color: 0xffd23a, map: t, roughness: .14, clearcoat: 1, clearcoatRoughness: .05, sheen: .6, sheenColor: new THREE.Color(0xfff0b0), sheenRoughness: .25 }); };   /* mắt hổ: đục, ánh óng sợi song song */
  function xoDoc(g, L, r) {   /* lỗ xỏ dọc trục y (đầu → đuôi): khoét bằng SDF đã làm; thêm đĩa tối ở 2 miệng lỗ, nằm theo dây */
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(r || .5, 18), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * L; g.add(l); }); return ongNam(g); }

  /* tỳ hưu tạc đá (3641, 22654, 4064, 26101) — xem 4 ảnh cỡ lớn: con tỳ hưu NẰM PHỤC tạc tròn; MÔNG là phần to và cao nhất (2 bầu tròn, rãnh giữa,
     đuôi cuộn dưới), ĐẦU thấp hơn ở phía trước: bờm/lưng có các ngấn ngang, 2 tai nhô 2 bên, mặt có mắt lồi + mõm, 2 chân trước duỗi dưới cằm.
     Trục y = đầu(+)→đuôi(−) (lỗ xỏ dọc), z = lưng (mặt nhìn chính diện), x = bề ngang. Cỡ thật ≈ dài 10 × ngang 7 × cao 6,5 ly. */
  function tyHuuKhoi(kieu, vuong) {   /* soát lần 2: thân lấy từ hình thật đo ảnh 22654 (chính diện nhìn từ lưng + nhìn ngang) — dài 10 × ngang 7,6 × cao 6,8 */
    var H = hinhThat('tyHuu', { mu: 2.4 }), f0 = H.f, Zt = H.mat;
    function f(x, y, z) { var ax = Math.abs(x), d = f0(x, y, z);
      d = S3.hop(d, S3.hop(S3.cau(x, y, z, -1.55, -2.0, .55, 2.05), S3.cau(x, y, z, 1.55, -2.0, .55, 2.05), .35), .5);   /* 2 BẦU MÔNG phồng tròn như ảnh */
      d += ranh(x, .28, .75) * Math.max(0, Math.min(1, (-.6 - y) / .8)) * Math.max(0, Math.min(1, z + 1.2));   /* rãnh SÂU giữa 2 mông (ảnh: 2 bầu tách rõ) */
      d += ranh(y - 1.0, .3, .35) * Math.max(0, Math.min(1, z + .8));   /* eo cổ tách đầu và mông */
      if (vuong && z > -.8 && y > 1.6 && y < 4.6 && ax < 2.1) { var ph = (y - 1.6) / .6; d += ranh(ph - Math.round(ph), .11, .2) * Math.min(1, (z + .8) / .8); }   /* 4064: ngấn khối đầu vuông (các mẫu khác lấy vân bờm từ ảnh) */
            d -= .35 * Math.exp(-(Math.pow(ax - 1.9, 2) / .12 + Math.pow(y - 3.0, 2) / .5)) * Math.max(0, Math.min(1, z + 1));   /* 2 tai nhô 2 bên đầu */
      d += ranh(Math.hypot(x, y + 4.3) - .5, .1, .2) * (z < 1.2 ? 1 : 0);   /* đuôi cuộn */
      return Math.max(d, -S3.xuyen(x, z, 0, -.3, .45)); }
    var g = daToc(f, H.bb, kieu, 86, 31, 'tyHuu7' + !!vuong, H);
    return { g: xoDoc(g, 5.05), rong: 10, xo: 'ong', cao: 6.6, uoc: 6.6, dungXem: true };
  }


  function daKhoi(f, bb, kieu, n, giong, key, H) {   /* khối đá theo chất: chuỗi DA_TOC (thạch anh tóc trong) hoặc 'matHo' (mắt hổ đục óng); H: hình thật → vân nổi từ ảnh */
    if (kieu === 'matHo') { var g = new THREE.Group(); g.add(khoiTac(f, bb, H ? vanThat(H.ten, matHoLuoi(), 2.4) : matHoLuoi(), n, key, H && H.uv)); return g; }
    return daToc(f, bb, kieu, n, giong, key, H); }
  function dem2D(f2, x0, y0, x1, y1, h) {   /* bộ đệm lưới cho hình 2D đắt (coLa…): tính 1 lần, nội suy song tuyến → dựng khối nhanh */
    h = h || .04; var nx = Math.ceil((x1 - x0) / h) + 2, ny = Math.ceil((y1 - y0) / h) + 2, V = new Float32Array(nx * ny), i, j;
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) V[i + nx * j] = f2(x0 + i * h, y0 + j * h);
    return function (x, y) { var u = (x - x0) / h, v = (y - y0) / h; if (u < 0 || v < 0 || u >= nx - 1 || v >= ny - 1) return f2(x, y);
      var i0 = Math.floor(u), j0 = Math.floor(v), a = u - i0, b = v - j0, k = i0 + nx * j0; return (V[k] * (1 - a) + V[k + 1] * a) * (1 - b) + (V[k + nx] * (1 - a) + V[k + nx + 1] * a) * b; }; }
  function epBo(d2, z, nua, r) {   /* đùn hình 2D d2 thành khối dày 2·nua, cạnh bo tròn r (SDF đúng) */
    var a = d2 + r, b = Math.abs(z) - nua + r; return Math.hypot(Math.max(a, 0), Math.max(b, 0)) + Math.min(Math.max(a, b), 0) - r; }
  function phong(x, y, z, d2, R, dau, lung) {   /* SDF gần đúng của khối phồng: trong hình 2D, bề dày theo vòm elip (cao dau phía trước, lung phía sau) */
    var w = Math.max(0, -d2) / R, h = Math.sqrt(Math.min(1, w * (2 - w))), top = dau * h, bot = lung * h;
    var dz = z >= 0 ? z - top : -z - bot; return Math.max(d2, dz * .8); }

  /* hồ ly nhỏ cuộn tròn tạc đá (3031, 24980, 24980~X51SyH, 5179, 377) — xem ảnh cỡ lớn: mặt cáo hình chữ V/tim lớn ở giữa-trên (mõm nhọn chúc xuống),
     2 tai nhọn dựng; thân tròn bao quanh, đuôi to cuộn từ bên phải vòng xuống dưới trái, 2 chân trước ló dưới mõm; nhìn ngang thấp, vồng tròn cả 2 mặt.
     Lỗ xỏ DỌC từ đỉnh đầu xuống đáy (thấy rõ trong ảnh 24980~X51SyH). Cỡ ≈ 8 × 8,5 × 5 ly. */
  function hoLyKhoi(kieu) {   /* soát lần 2: thân lấy từ hình thật đo ảnh 3031 (chính diện + nằm ngang) — cao 8,6 × ngang 7,1 × dày 5,1; chạm mặt cáo chữ V, mắt, đuôi cuộn */
    var H = hinhThat('hoLy', { mu: 2.2 }), f0 = H.f, Zt = H.mat;
    var mat = daGiacSdf([[-2.1, 3.9], [-1.65, 4.32], [-.98, 4.05], [0, 3.4], [.98, 4.05], [1.65, 4.32], [2.1, 3.9], [1.9, 1.75], [.68, -.44], [0, -1.94], [-.68, -.44], [-1.9, 1.75]]);   /* viền mặt cáo + 2 tai dò từ ảnh 3031 */
    function f(x, y, z) { var ax = Math.abs(x), d = f0(x, y, z);
      var zt = Zt(y); if (zt !== null) d = S3.hop(d, Math.max(mat(x, y), Math.abs(z - (zt - .5)) - .85), .3);   /* KHỐI MẶT CÁO nổi cao trên thân */
      d = S3.tru(d, Math.max(ax - (y - 3.3) * .6, 3.3 - y), .12);   /* khe chữ V giữa 2 tai */
      if (zt !== null && z > zt - .4) d += ranh(Math.hypot((ax - .72) / 1.6, (y - 2.0) / .5) - .5, .09, .3) + ranh(Math.hypot((ax - .95) / .7, (y - 3.6) / .9) - .45, .08, .22);   /* mắt xếch + lòng tai */
      if (z > -.3) {
        d -= .5 * Math.exp(-(x * x / .8 + Math.pow(y - 1.7, 2) / 2.2)) * Math.max(0, Math.min(1, z + .5));   /* khối mặt cáo nổi cao */
        var vx = Math.abs(ax - (.08 + .62 * (y + .2))); d += ranh(vx, .13, .22) * (y > -.2 && y < 3.4 ? 1 : 0);   /* viền mặt chữ V (chi tiết mắt/lông lấy từ vân ảnh) */
        d += ranh(ax - .02, .05, .08) * (y > 2.8 ? 1 : 0);   /* khe giữa 2 tai */
        d += ranh(Math.hypot(x - 1.85, y + 1.6) - 1.25, .12, .2) * (x > .7 ? 1 : 0);   /* đường cuộn đuôi */
        d += ranh(y + 2.9, .1, .22) * (ax < 1.7 ? 1 : 0); }   /* ngấn chân */
      return Math.max(d, -S3.xuyen(x, z, 0, .1, .45)); }
    var g = daKhoi(f, H.bb, kieu, 84, 53, 'hoLy7', H);
    return { g: xoDoc(g, 4.35), rong: 8.6, xo: 'ong', cao: 7.4, uoc: 7.4, dungXem: true };
  }

  /* hồ ly chúa tạc đá (15102, 22313, 23057): dáng giọt, đầu nhỏ trên, 2 mép răng cưa (các lớp đuôi xếp); mặt trước chạm mặt cáo mõm dài + 2 tai;
     soát lại theo ảnh: KHỐI DÀY, lưng vồng tròn (không phẳng) — bề dày ≈ 0,5 bề ngang. Xỏ dọc. */
  function hoLyChuaKhoi(kieu) {   /* hồ ly chúa (15102, 22313, 23057) — soát lần 2: dáng dò từ ảnh 15102 (chính diện) + 23057 (nằm ngang): giọt, đầu hẹp trên, mép răng cưa
     các lớp đuôi; mặt trước chạm mặt cáo mõm dài + 2 tai; dày ≈ 4,4 ly lưng vồng nhẹ; vân nổi từ nét chạm ảnh. Xỏ dọc. */
    var H = hinhThat('hoLyChua', { mu: 2.4 }), f0 = H.f, Zt = H.mat;
    function f(x, y, z) { var ax = Math.abs(x), d = f0(x, y, z), w = H.ngang(y) || 1;
      d += .3 * Math.pow(Math.abs(Math.sin((y + 3) * 2.3)), 1.5) * Math.max(0, Math.min(1, (ax / w - .62) / .38)) * (y < 4 ? 1 : 0);   /* mép răng cưa: các lớp đuôi xếp */
      var zt = Zt(y);
      if (zt !== null && z > zt - 1.2) {
        d -= .45 * Math.exp(-(x * x / .45 + Math.pow(y - 1.2, 2) / 5)) + .3 * Math.exp(-(Math.pow(ax - .95, 2) + Math.pow(y - 3.6, 2) * 2) / .3);   /* mõm dài + 2 tai nổi */
        var ph = (y + .55 * ax) / 1.0; if (ax > 1.2) d += ranh(ph - Math.round(ph), .13, .24) * Math.min(1, (ax - 1.2) * 1.2);   /* các lớp đuôi xếp chéo */
        d += ranh(Math.hypot((ax - .6) / .6, (y - 2.2) / .9) - .3, .05, .16); }   /* mắt */
      return Math.max(d, -S3.xuyen(x, z, 0, .3, .45)); }
    var g = daKhoi(f, H.bb, kieu, 84, 67, 'hoLyChua2', H);
    return { g: xoDoc(g, H.L + .05), rong: 9.7, xo: 'ong', cao: 9, uoc: 9, dungXem: true };
  }

  /* túi tiền đá tạc tròn (9674, 22312, 9675, 16079, 9680, 9680~p1kr3L) — ảnh: bụng túi tròn căng mọi phía, cổ thắt có dây buộc, miệng xoè 3 múi cuộn;
     mặt bụng khắc đồng xu (lỗ vuông) hoặc gân toả từ cổ (9675); lỗ xỏ dọc đáy → miệng. Cỡ ≈ ngang 7 × cao 7,5 × dày 5,5 ly. */
  function tuiKhoi(kieu, xu) {   /* soát lần 2: thân lấy từ hình thật đo ảnh (xu: 9674 túi đồng xu · không xu: 9675 túi gân) — cao 7,6; cổ thắt dây buộc, miệng 3 múi */
    var H = hinhThat(xu ? 'tuiXu' : 'tuiGan', { mu: 2.1 }), f0 = H.f;
    function f(x, y, z) { var ax = Math.abs(x), d = f0(x, y, z);
      d += ranh(y - 1.35, .16, .34) * (ax < 2.4 ? 1 : 0);   /* dây buộc cổ túi */
      d += ranh(ax - .9, .1, .3) * (y > 1.9 ? 1 : 0);   /* khe giữa các múi miệng */
      if (z > 0) {
        if (xu) { var r = Math.hypot(x, y + 1.25); d += ranh(r - 1.45, .11, .3) + ranh(Math.max(Math.abs(x), Math.abs(y + 1.25)) - .45, .09, .24); }   /* đồng xu lỗ vuông */
        else { var a = Math.atan2(x, -(y - 1.1)); for (var j = -2; j <= 2; j++) d += ranh(a - j * .32, .05, .12) * (y < .9 && y > -2.2 ? 1 : 0); } }   /* gân toả từ cổ (nhẹ, vân ảnh bổ sung) */
      return Math.max(d, -S3.xuyen(x, z, 0, 0, .45)); }
    var g = daKhoi(f, H.bb, kieu, 80, 89, 'tui6' + !!xu, H);
    return { g: xoDoc(g, 3.85), rong: 7.6, xo: 'ong', cao: 6.4, uoc: 6.4, dungXem: true };
  }

  /* ---------- HÌNH THẬT DÒ TỪ ẢNH (soát 12/11 lần 2 — user: dáng "hơi dị") ----------
     Dò bằng mắt trên ảnh kho phóng to có lưới (toạ độ px của ảnh rộng 540): VIỀN CHÍNH DIỆN = nửa bề ngang theo chiều dài,
     VIỀN NHÌN NGANG = mép trên/dưới theo chiều dài. Khối = lát cắt siêu elip từng y đúng bề ngang + bề dày + tâm như ảnh, nối mượt (Catmull-Rom).
     tr: {y0, s, d:[[y_px, nửa_ngang_px]]} (y_mm = (y0 − y_px)·s) · ng: {x0, s, chieu, d:[[x_px, mép_trên_px, mép_dưới_px]]} (y_mm = chieu·(x_px − x0)·s) */
  var DO_THAT = {
    tyHuu: { anh: [60, 140, 300, 450], tr: { cx: 180, y0: 295, s: .03497, d: [[152, 0], [156, 30], [170, 55], [190, 72], [230, 75], [250, 62], [265, 55], [285, 90], [300, 105], [330, 113], [360, 113], [390, 105], [415, 85], [430, 55], [438, 0]] },   /* 22654 ảnh 2 (nhìn từ lưng) */
      ng: { x0: 280, s: .0309, chieu: -1, d: [[118, 270, 320], [125, 200, 340], [140, 172, 342], [170, 160, 345], [200, 165, 348], [230, 175, 350], [255, 172, 352], [270, 150, 352], [300, 135, 352], [340, 128, 350], [380, 130, 348], [420, 160, 340], [435, 200, 330], [442, 250, 300]] } },   /* 22654 ảnh 1 (nằm ngang, đầu trái) */
    hoLy: { anh: [130, 110, 420, 450], tr: { cx: 276, y0: 284, s: .0273, d: [[122, 0], [126, 45], [140, 75], [170, 78], [200, 78], [215, 95], [235, 112], [260, 125], [300, 133], [340, 135], [380, 128], [410, 110], [430, 80], [440, 40], [444, 0]] },   /* 3031 ảnh 3 */
      ng: { x0: 297, s: .0257, chieu: 1, d: [[130, 280, 330], [150, 230, 360], [200, 205, 385], [250, 195, 388], [300, 200, 388], [350, 210, 385], [400, 225, 380], [440, 255, 360], [465, 290, 330]] } },   /* 3031 ảnh 0 (đầu phải) */
    tuiGan: { anh: [40, 160, 300, 470], tr: { cx: 172, y0: 314, s: .02676, d: [[172, 0], [178, 50], [190, 80], [210, 95], [230, 100], [250, 90], [262, 70], [275, 85], [295, 110], [320, 120], [350, 122], [380, 118], [410, 100], [435, 70], [450, 35], [456, 0]] },   /* 9675 ảnh 2 */
      ng: { x0: 280, s: .0262, chieu: -1, d: [[135, 230, 290], [150, 195, 300], [175, 170, 305], [200, 160, 305], [225, 165, 308], [245, 185, 312], [260, 160, 318], [290, 140, 322], [330, 135, 322], [370, 140, 320], [400, 160, 315], [420, 200, 305], [425, 240, 290]] } },   /* 9675 ảnh 1 (miệng trái) */
    hoLyChua: { anh: [60, 80, 470, 560], tr: { cx: 245, y0: 279, s: .0291, d: [[90, 0], [100, 35], [120, 60], [150, 85], [180, 100], [200, 115], [230, 135], [260, 150], [290, 160], [320, 162], [350, 150], [380, 135], [410, 120], [440, 95], [460, 55], [468, 0]] },   /* 15102 ảnh 2 */
      ng: { x0: 271, s: .0295, chieu: 1, d: [[85, 300, 345], [90, 250, 350], [150, 220, 352], [200, 212, 352], [250, 205, 352], [300, 200, 350], [350, 200, 348], [400, 210, 345], [440, 235, 338], [455, 280, 330], [458, 305, 322]] } },   /* 23057 ảnh 2 (nằm ngang, đầu phải) */
    tuiXu: { anh: [150, 160, 370, 435], tr: { cx: 268, y0: 295, s: .02923, d: [[165, 0], [172, 45], [185, 75], [205, 85], [225, 82], [240, 60], [252, 52], [265, 70], [285, 85], [310, 92], [340, 92], [370, 85], [395, 70], [415, 45], [425, 0]] },   /* 9674 ảnh 2 */
      ng: { x0: 272, s: .02868, chieu: -1, d: [[140, 300, 340], [150, 260, 350], [175, 230, 352], [210, 220, 352], [245, 235, 350], [258, 250, 352], [275, 215, 358], [310, 200, 360], [350, 200, 360], [385, 215, 356], [400, 250, 345], [405, 290, 330]] } }   /* 9674 ảnh 1 */
  };
  function duongMuot(ds) {   /* ds = [[t, v…]] tăng dần theo t → hàm nội suy Catmull-Rom từng cột */
    return function (t) { var n = ds.length; if (t <= ds[0][0] || t >= ds[n - 1][0]) return null; var i = 0; while (ds[i + 1][0] < t) i++;
      var p0 = ds[Math.max(0, i - 1)], p1 = ds[i], p2 = ds[i + 1], p3 = ds[Math.min(n - 1, i + 2)], u = (t - p1[0]) / (p2[0] - p1[0]), r = [];
      for (var k = 1; k < p1.length; k++) { var a = p1[k], b = p2[k], m1 = (p2[k] - p0[k]) / ((p2[0] - p0[0]) || 1) * (p2[0] - p1[0]), m2 = (p3[k] - p1[k]) / ((p3[0] - p1[0]) || 1) * (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
        r.push((2 * u3 - 3 * u2 + 1) * a + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * b + (u3 - u2) * m2); } return r; }; }
  function hinhThat(ten, o) {   /* → {f(x,y,z), bb, L}: khối dựng theo viền dò; o.mu số mũ lát cắt (2 = elip) */
    o = o || {}; var D = DO_THAT[ten], tr = D.tr, ng = D.ng, mu = o.mu || 2.2;
    var A = tr.d.map(function (q) { return [(tr.y0 - q[0]) * tr.s, q[1] * tr.s]; }).sort(function (a, b) { return a[0] - b[0]; });
    var B = ng.d.map(function (q) { return [ng.chieu * (q[0] - ng.x0) * ng.s, -q[1] * ng.s, -q[2] * ng.s]; }).sort(function (a, b) { return a[0] - b[0]; });
    var zs = []; B.forEach(function (q) { zs.push(q[1], q[2]); }); var zc = (Math.max.apply(null, zs) + Math.min.apply(null, zs)) / 2;
    B = B.map(function (q) { return [q[0], q[1] - zc, q[2] - zc]; });
    var ya = Math.max(A[0][0], B[0][0]), yb = Math.min(A[A.length - 1][0], B[B.length - 1][0]);   /* 2 viền chuẩn về cùng chiều dài */
    function chuan(ds) { var a = ds[0][0], b = ds[ds.length - 1][0]; return ds.map(function (q) { return [ya + (q[0] - a) / (b - a) * (yb - ya)].concat(q.slice(1)); }); }
    var W = duongMuot(chuan(A)), Z = duongMuot(chuan(B));
    function f(x, y, z) { var w = W(y), h = Z(y); if (!w || !h || w[0] < .03) return Math.max(.3, Math.min(Math.abs(y - ya), Math.abs(y - yb)) + .3);
      var hz = Math.max(.03, (h[0] - h[1]) / 2), cz = (h[0] + h[1]) / 2, u = Math.abs(x) / w[0], v = Math.abs(z - cz) / hz;
      return (Math.pow(Math.pow(u, mu) + Math.pow(v, mu), 1 / mu) - 1) * Math.min(w[0], hz); }
    var wm = Math.max.apply(null, A.map(function (q) { return q[1]; })), zm = Math.max.apply(null, zs.map(Math.abs)) + Math.abs(zc);
    var bx = D.anh, uv = function (x, y) { var px = tr.cx + x / tr.s, py = tr.y0 - y / tr.s; return [(px - bx[0]) / (bx[2] - bx[0]), 1 - (py - bx[1]) / (bx[3] - bx[1])]; };   /* chiếu mặt trước lên ảnh gốc */
    return { f: f, bb: [-wm - .4, ya - .4, -zm - .4, wm + .4, yb + .4, zm + 1.2], L: (yb - ya) / 2, yc: (ya + yb) / 2, uv: uv, ten: ten, mat: function (y) { var h = Z(y); return h ? h[0] : null; }, ngang: function (y) { var w = W(y); return w ? w[0] : 0; } };
  }
  function daGiacSdf(P) {   /* khoảng cách có dấu tới đa giác kín P=[[x,y]…] */
    return function (x, y) { var d = 1e9, s = 1, n = P.length; for (var i = 0, j = n - 1; i < n; j = i++) { var ax = P[j][0], ay = P[j][1], bx = P[i][0], by = P[i][1], ex = bx - ax, ey = by - ay, wx = x - ax, wy = y - ay, t = Math.max(0, Math.min(1, (wx * ex + wy * ey) / (ex * ex + ey * ey))), qx = wx - ex * t, qy = wy - ey * t; d = Math.min(d, qx * qx + qy * qy);
      if ((ay > y) !== (by > y) && x < ax + (y - ay) * ex / ey) s = -s; } return s * Math.sqrt(d); }; }
  var _tl2 = null;
  function vanThat(ten, vl, manh) {   /* gắn vân nổi lấy từ nét chạm ảnh thật (chỉ độ lồi lõm, không dán màu) */
    _tl2 = _tl2 || new THREE.TextureLoader(); var t = _tl2.load('charm-anh/than-' + ten + '.webp'); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4;
    var m = vl.clone(); m.bumpMap = t; m.bumpScale = manh || 3; return m; }
  function tyHuuDa(vl, kieu) {   /* tỳ hưu tạc đá nằm phục nhìn chính diện: đầu trên (bờm cuộn + 2 tai), thân dưới phình 2 mông tròn tách bởi rãnh giữa, 2 chân trước; mặt vòm, lưng phẳng; kieu 'vuong' (4064): đầu vuông khắc vạch, thân trơn */
    var g = new THREE.Group(), vuong = kieu === 'vuong';
    var f = function (x, y) { var dau = vuong ? Math.hypot(Math.max(Math.abs(x) - 1.3, 0), Math.max(Math.abs(y - 1.9) - .95, 0)) - .55 : oval(1.85, 1.55)(x, y - 1.85);
      var than = hop(tron(x, y, -1.15, -1.35, 1.75), tron(x, y, 1.15, -1.35, 1.75), .8); var d = hop(dau, than, .45);
      if (!vuong) { d = hop(d, tron(x, y, -1.75, 2.75, .45), .3); d = hop(d, tron(x, y, 1.75, 2.75, .45), .3); } return d; };
    var vk = vienTu(f, 0, 0, 260);
    var v = vom(vk, 0, 0, 3.0, vl, function (x, y, s) { var k = 1, ax = Math.abs(x);
      k -= .22 * Math.exp(-Math.pow((y - .45) / .2, 2)) * (ax < 1.8 ? 1 : 0);   /* cổ tách đầu/thân */
      k -= .26 * Math.exp(-Math.pow(x / .16, 2)) * (y < -.4 ? 1 : 0); k -= .12 * Math.exp(-Math.pow((Math.hypot(ax - 1.15, y + 1.35) - 1.1) / .12, 2)) * (y < -.2 ? 1 : 0);   /* + đường cong vai mông */   /* rãnh giữa 2 mông */
      if (vuong) { k -= .13 * (Math.exp(-Math.pow((y - 2.3) / .08, 2)) + Math.exp(-Math.pow((y - 1.7) / .08, 2))) * (ax < 1.5 ? 1 : 0) + .13 * Math.exp(-Math.pow(x / .08, 2)) * (y > 1.1 && y < 2.7 ? 1 : 0); }
      else { for (var j = 0; j < 3; j++) k -= .11 * Math.exp(-Math.pow((Math.hypot(x, y - 1.4) - (1.0 + j * .4)) / .09, 2)) * (y > 1.4 ? 1 : 0);   /* bờm cuộn */
        k -= .16 * Math.exp(-(Math.pow(ax - .6, 2) + Math.pow(y - 1.75, 2)) / .04); }   /* mắt */
      k += .16 * Math.exp(-(Math.pow(ax - .7, 2) + Math.pow(y + 2.3, 2)) / .18);   /* 2 chân trước */
      return k * (.7 + .3 * Math.min(1, s * 3)); }, 40); g.add(v);
    var lm = latMat(v); lm.scale.z = .08 / .55; g.add(lm);
    g.children.forEach(function (m) { m.position.z -= 1.2; });
    var r = docDayTam(g); return { g: r.g, rong: r.dai, xo: 'ong', cao: 6.6, uoc: 6.6, dungXem: true };
  }
  function hoLyDoc(m, uoc) { var r = docDayTam(m.g); return { g: r.g, rong: r.dai, xo: 'ong', cao: uoc, uoc: uoc, dungXem: true }; }   /* hồ ly đá cũ (lỗ ngang) → xỏ dọc */
  DS['3641'] = function () { return tyHuuKhoi('vangCam'); };   /* tỳ hưu thạch anh tóc vàng xuyên lỗ 2 ly (xem 4 ảnh): tỳ hưu phục, đầu bờm cuộn, 2 mông tròn; vàng cam sợi óng; xỏ dọc */
  DS['22654'] = function () { return tyHuuKhoi('vangChanh'); };   /* tỳ hưu thạch anh tóc vàng (xem 4 ảnh): như 3641, vàng chanh tươi; xỏ dọc */
  DS['4064'] = function () { return tyHuuKhoi('vangChanh', true); };   /* tỳ hưu thạch anh tóc vàng (xem 4 ảnh): đầu khối vuông khắc vạch, thân tròn trơn; xỏ dọc */
  DS['26101'] = function () { return tyHuuKhoi('baMia'); };   /* tỳ hưu tóc vàng bã mía xuyên lỗ 2 ly (xem 4 ảnh: thấy rõ lỗ khoan dọc đầu→đuôi): đá trong gần trắng, sợi tóc vàng thưa */
  DS['3031'] = function () { return hoLyKhoi('vangChanh'); };   /* hồ ly thạch anh tóc vàng xuyên lỗ 2 ly (xem 4 ảnh): hồ ly cuộn tròn 2 tai, mặt cáo, đuôi cuộn; xỏ dọc */
  DS['15102'] = function () { return hoLyChuaKhoi('vangChanh'); };   /* hồ ly chúa thạch anh tóc vàng xuyên lỗ 2 ly (xem 4 ảnh): dáng giọt, mép đuôi xếp lớp răng cưa; xỏ dọc */
  DS['24980'] = function () { return hoLyKhoi('baMia'); };   /* hồ ly tóc vàng bã mía (xem 4 ảnh): như 3031, đá trong gần trắng sợi vàng thưa; xỏ dọc */

  DS['24980~X51SyH'] = function () { return hoLyKhoi('baMia'); };   /* hồ ly tóc vàng bã mía xuyên lỗ 2 ly (xem 4 ảnh: thấy lỗ khoan dọc đầu→đuôi): đá trong gần trắng, sợi tóc vàng to thưa; hồ ly cuộn tròn, mặt cáo chữ V, 2 tai; xỏ dọc */
  DS['9680~p1kr3L'] = function () { return tuiKhoi('vangCam', true); };   /* túi tiền thạch anh tóc vàng nâu nhỏ (xem 4 ảnh): vàng nâu cam sợi óng, bụng khắc đồng xu, miệng xoè cuộn; xỏ dọc */
  DS['23945'] = function () {   /* sao 4 cánh nối (xem 4 ảnh): khoen nối 2 đầu — giữa ngôi sao 4 cánh cong lõm pavé kín kim cương viền hạt, 2 bên mỗi bên 1 hoa 4 cánh nhỏ đính 1 viên, cuối 2 vòng khoen tròn (dây/xích luồn qua) → nằm dọc theo dây, mặt sao quay ra */
    var g = new THREE.Group(), T = 1.1;
    var f = function (x, y) { var d = Math.abs(x) + Math.abs(y) - 3.2; [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { d = Math.max(d, 2.3 - Math.hypot(x - q[0] * 2.6, y - q[1] * 2.6)); }); return d; }   /* sao 4 cánh cạnh cong lõm, thân đầy */, p = vienTu(f, 0, 0, 260);
    var b = khoi(p, 0, 0, hoSo(T, .22), VL.vang); b.position.z = T / 2; g.add(b);
    g.add(chuoiHat(vienTu(function (x, y) { return f(x, y) + .1; }, 0, 0, 260), .08, VL.vang, T / 2 + .03));
    var ds = [[0, 0]]; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (q) { [.7, 1.35, 1.95, 2.5].forEach(function (r) { ds.push([q[0] * r, q[1] * r]); }); });
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (q) { ds.push([q[0] * .6, q[1] * .6]); ds.push([q[0] * .55, q[1] * 1.15]); ds.push([q[0] * 1.15, q[1] * .55]); });
    g.add(hangKc(.22, ds.map(function (d) { return [d[0], d[1], T / 2 + .04, 0, 0, 1]; })));
    [-1, 1].forEach(function (s) { var x0 = s * 3.35, k1 = khoen(.32, .1, VL.vang); k1.position.x = x0; k1.rotation.y = PI / 2; g.add(k1);
      var hoa = khoi(vienTu(cungHoa(4, .45, .32, PI / 4), 0, 0, 60), 0, 0, hoSo(.5, .12), VL.vang); hoa.position.set(s * 4.25, 0, .25); g.add(hoa);
      g.add(hangKc(.26, [[s * 4.25, 0, .3, 0, 0, 1]]));
      var k2 = khoen(.3, .1, VL.vang); k2.position.x = s * 5.15; g.add(k2);
      var k3 = khoen(.75, .17, VL.vang); k3.position.x = s * 6.15; k3.rotation.y = PI / 2; g.add(k3); });   /* vòng khoen cuối: dây luồn qua */
    return { g: g, rong: 13.8, xo: 'xuyen', cao: 6.2, uoc: 6 };
  };
  DS['6147'] = function () {   /* lu thống thạch anh tóc vàng (soát lại ảnh): trụ tròn dài ≈ 1,8 × đường kính, mép bo; đá TRONG (vàng nhạt), sợi tóc vàng óng dọc ngang bên trong; lỗ 2 ly dọc trục */
    function f(x, y, z) { var q = Math.max(Math.hypot(x, z) - 2.9 + .45, 0), w = Math.max(Math.abs(y) - 5.3 + .45, 0); return Math.max(Math.hypot(q, w) + Math.min(Math.max(Math.hypot(x, z) - 2.9 + .45, Math.abs(y) - 5.3 + .45), 0) - .45, .85 - Math.hypot(x, z)); }
    var g = daToc(f, [-3, -5.4, -3, 3, 5.4, 3], function () { return { vl: daSuot({ mau: 0xf8e6a8, tr: .5, nhuom: 0xfff4cc, xa: 8 }), soi: { mau: 0xe0a62a, so: 160, r: .03, dai: 6 } }; }, 72, 23, '6147');
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.85, 24), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * 5.31; g.add(l); });
    return { g: ongNam(g), rong: 10.7, xo: 'ong', cao: 5.8 };
  };


  DS['3640'] = function () {   /* đồng điếu thạch anh tóc vàng (soát lại ảnh): khoanh dày mặt cắt mọng; đá TRONG KHÔNG MÀU, sợi tóc vàng mảnh dày đặc bên trong; lỗ giữa */
    function f(x, y, z) { var r = Math.hypot(x, z), q = Math.max(Math.abs(r - 2.4) - 1.6 + 1.2, 0), w = Math.max(Math.abs(y) - 1.9 + 1.2, 0); return Math.hypot(q, w) - 1.2; }
    var g = daToc(f, [-4.1, -2, -4.1, 4.1, 2, 4.1], 'trongVang', 72, 29, '3640');
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.8, 24), VL.toi); l.rotation.x = -sg * PI / 2; l.position.y = sg * 1.0; g.add(l); });
    return { g: ongNam(g), rong: 3.9, xo: 'ong', cao: 8 };
  };


  DS['5200'] = function () {   // túi tiền thạch anh tóc vàng: thân bè tròn (ngang lớn hơn cao), cổ thắt ngắn, miệng túi xoè 5 múi
    var moc0 = [[0, -3.2], [1.9, -3.1], [3.3, -2.45], [3.95, -1.25], [4.02, 0], [3.55, 1.05], [2.7, 1.75], [2.05, 2.1], [1.85, 2.4], [2.25, 2.8], [2.95, 3.2], [3.15, 3.55], [2.75, 3.85], [1.6, 3.8], [0, 3.6]];
    var pts = new THREE.SplineCurve(moc0.map(function (q) { return new V2(q[0], q[1]); })).getPoints(70); pts[0].x = 0; pts[70].x = 0;
    pts.forEach(function (q) { q.x = Math.max(0, q.x); });
    var tv = daSuot({ mau: 0xffd650, tr: .55, nhuom: 0xffeaa0, xa: 6 }), o = tienTron(pts, tv, 96), p = o.g.attributes.position, i;
    for (i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
      var nep = y < 2.4 ? .04 * Math.cos(10 * a) * Math.min(1, Math.max(0, (y + .2) / 2.4)) : .2 * Math.cos(5 * a) * Math.min(1, (y - 2.4) / .7);
      p.setXYZ(i, x * (1 + nep), y, z * (1 + nep) * .8); }
    var g = new THREE.Group(); g.add(xongTien(o, 2));
    var day = new THREE.Mesh(new THREE.TorusGeometry(1.95, .24, 14, 56), tv); day.rotation.x = PI / 2; day.scale.y = .8; day.position.y = 2.38; g.add(day);
    g.add(soiToc(function (x, y, z) { return S3.elip(x, y, z / .8, 0, -.3, 0, 3.6, 2.7, 3.6); }, [-4, -3.2, -3.2, 4, 2.5, 3.2], { mau: 0xe0a72c, so: 200, r: .022, dai: 3.5, hatGiong: 47 }));
    g.children.forEach(function (m) { m.position.y -= .2; });
    return { g: g, rong: 8.1, xo: 'xuyen', cao: 7.3, lat: true };
  };

  DS['23880'] = function () {   // thỏi vàng (nguyên bảo): thân thuyền, vành cong lên 2 đầu, gò tròn ở giữa
    var geo = new THREE.SphereGeometry(1, 96, 64), p = geo.attributes.position, i, A = 4.5, B = 2.3, C = 2.9;
    for (i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i), hx = .1 + 1.65 * x * x * Math.abs(x), Y;
      if (y < 0) Y = B * y + hx * (1 + y);
      else { var ro = Math.sqrt(Math.max(0, 1 - y * y)), re = Math.hypot(x / .74, z / .52); Y = hx - .45 * (1 - ro * ro) + (re < 1 ? 2.35 * Math.sqrt(1 - re * re) : 0); }   /* gò giữa hình bầu dục, dài theo thân — soát: nhô cao hơn mép thuyền như ảnh */
      p.setXYZ(i, A * x, Y, C * z); }
    geo.computeVertexNormals();
    var nr = geo.attributes.normal;   // liền mép nối của hình cầu
    for (var r = 0; r <= 64; r++) { var a = r * 97, b = r * 97 + 96, nx = nr.getX(a) + nr.getX(b), ny = nr.getY(a) + nr.getY(b), nz = nr.getZ(a) + nr.getZ(b), l = Math.hypot(nx, ny, nz) || 1; nr.setXYZ(a, nx / l, ny / l, nz / l); nr.setXYZ(b, nx / l, ny / l, nz / l); }
    var m = new THREE.Mesh(geo, VL.vang); m.position.y = .5;
    var g = new THREE.Group(); g.add(m);
    [-1, 1].forEach(function (sg) { var l = new THREE.Mesh(new THREE.CircleGeometry(.55, 18), VL.toi); l.rotation.y = sg * PI / 2; l.position.set(sg * 3.6, .35, 0); g.add(l); });   /* soát: lỗ xuyên ở 2 đầu thuyền như ảnh */
    return { g: g, rong: 9.1, xo: 'ong', cao: 6, dung: true };   // dung: gò tròn hướng lên trên mặt vòng
  };

  /* ---------- nhóm hồ lô (25 mẫu) ---------- */
  function xoanOc(x, y, s) { var r = Math.hypot(x, y + 1.2), a = Math.atan2(y + 1.2, x); return 1 - .13 * Math.pow(Math.max(0, Math.sin(a * 1 + r * 2.2)), 6) * (1 - s * s * s); }
  var HL = {
    '25810': function () { return holoMat({ da: 'bangtrang', k: .52, khung: batGiac(3.0, 4.2, 1.4), vien: 'kc', day: 3.4, treo: 'khoa' }); },   // khối bát giác dày 3,3 ly, vành trơn, vòng kim cương quanh hồ lô trắng
    '25783': function () { return holoMat({ da: 'bangtrang', k: .5, khung: oval(3.55, 3.6), vien: 'thung', kcTrong: .5, day: 1.9, treo: 'khoen' }); },   // charm rơi: đế tròn viền thừng, vòng kim cương nhỏ quanh hồ lô, khoen tròn
    '23979': function () {   // theo ảnh cỡ lớn: đĩa gần tròn mặt cắt giác lấp lánh, khoét lỗ hình hồ lô (bầu nhỏ phía khoen), viền bi quanh mép ngoài và quanh lỗ, lưng nhám trơn
      var g = new THREE.Group(), cy = -.2, dia = oval(4.35, 4.6), lo = hinhHoLo(.5);
      function ra(h, d, n) { return vienTu(function (x, y) { return h(x, y - cy) - d; }, 0, cy, n || 160); }
      function lo2(x, y) { return lo(x, y + .2); }
      g.add(tamLo(ra(dia, 0), ra(lo2, 0), .6, VL.vangGiac));
      g.add(chuoiHat(ra(dia, -.3, 200), .27, VL.vang, .3)); g.add(chuoiHat(ra(lo2, .3, 200), .23, VL.vang, .3));
      var lung = tamLo(ra(dia, -.02), ra(lo2, .02), .3, VL.vangMo); lung.position.z = -.4; g.add(lung);
      var cao = mocDon(g, 4.35);
      return { g: g, rong: 1.6, xo: 'treo', cao: cao + 4.9 };
    },
    '23966': function () {   // lá hồ lô: nền lưới ô vuông, ô tròn chữ 福 ở bầu dưới, đồng tiền ở bầu trên, viền bi; lưng nhám trơn
      function f(x, y) { return hop(tron(x, y, 0, -1.9, 3.3), tron(x, y, 0, 2.75, 2.05), 1.0); }
      var vl = vanRieng(function (g, X, Y, mm) { var i;
        g.strokeStyle = '#c8c8c8'; g.lineWidth = 3; for (i = -5; i <= 5; i += .55) { g.beginPath(); g.moveTo(X(i), 0); g.lineTo(X(i), 512); g.stroke(); g.beginPath(); g.moveTo(0, Y(i)); g.lineTo(512, Y(i)); g.stroke(); }
        g.fillStyle = '#5c5c5c'; g.beginPath(); g.arc(X(0), Y(-1.9), 2.25 * mm, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 7; g.stroke();
        g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(3.1 * mm) + 'px serif'; g.fillText('福', X(0), Y(-1.95));
        g.fillStyle = '#5c5c5c'; g.beginPath(); g.arc(X(0), Y(2.75), 1.3 * mm, 0, 7); g.fill(); g.stroke(); g.lineWidth = 5; g.strokeRect(X(-.45), Y(3.2), .9 * mm, .9 * mm); });
      var g = tamTreo({ f: f, cy: -.3, vl: vl, day: .8, hat: .2 }), cao = mocDon(g, 4.8);
      return { g: g, rong: 1.6, xo: 'treo', cao: cao + 5.2 };
    },
    '24037': function () { var g = tamTreo({ f: function (x, y) { return hop(tron(x, y, 0, -1.55, 2.3), tron(x, y, 0, 1.95, 1.5), .9); }, cy: -.2, vl: VL.vangGiac, day: .7 }), cao = mocDon(g, 3.45); return { g: g, rong: 1.5, xo: 'treo', cao: cao + 3.85 }; },   // lá hồ lô nhỏ, mặt cắt giác, lưng trơn
    '24211': function () { return holoKhoi({ vl: vangVan('dan', 1.5, 2.6, .3),   /* soát đợt 5: vân đan mây tre to như ảnh */ dai: true, khoenEo: true, nghieng: .85, k: .95 }); },   // hồ lô vân đan, đai kim cương ở eo; khoen gắn ở eo nên rủ nghiêng
    '24213': function () { return holoKhoi({ vl: VL.vangHoa, k: .62, det: .55 }); },   // hồ lô dẹt phồng chạm vân mây, lỗ xỏ dọc thân
    '26418': function () { return holoMat({ da: 'lambang', k: .86, khung: giot(.9), vien: 'tron', le: .75, day: 2.6, kc3: true }); },   // khung giọt nước dày, 4 cụm kim cương quanh viền
    '21611': function () { return holoKhoi({ vl: vangVan('bua', 3, .7, .55),   /* soát đợt 5: vàng phun cát */ daDuoi: 'lucde', khoenEo: true, bauTren: 1.75, k: .8 }); },   // hồ lô nhám, bầu trên nhỏ, đá xanh ở bầu dưới; khoen ở eo
    'CHUAMA-8VBuMl': function () {   /* ngọc lam xanh chạm con HỒ LY nằm cuộn (xem kĩ 4 ảnh): đầu bên phải nhìn sang phải, 2 tai nhọn ở đỉnh, mắt dài, mõm + cằm thành 2 mấu ở mép phải, chân trước mấu dưới phải; thân + đuôi bông cuộn ôm bên trái, chóp đuôi tròn ở dưới giữa, lông đuôi là 2 rãnh cong dài. Viền vàng mảnh ôm theo, có chấu giữ đá; xỏ ngang */
      function el(x, y, cx, cy, a, b, t) { var c = Math.cos(t || 0), s = Math.sin(t || 0), u = (x - cx) * c + (y - cy) * s, v = -(x - cx) * s + (y - cy) * c; return (Math.hypot(u / a, v / b) - 1) * Math.min(a, b); }
      function h(x, y) { var d = hop(tron(x, y, -1.35, .35, 2.95), tron(x, y, -.95, -1.15, 2.6), 1.2);   /* thân + đuôi */
        d = hop(d, tron(x, y, -.55, 1.05, 2.7), 1.0); d = hop(d, el(x, y, 1.5, 2.85, .5, 1.05, -.75), .6);   /* tai 1 = góc trên phải của khối */
        d = hop(d, el(x, y, 2.8, -.2, 1.3, 2.05), .7); d = hop(d, el(x, y, 3.35, 1.4, .45, .75, -.6), .45);   /* đầu, tai 2 */
        d = hop(d, tron(x, y, 3.75, -.55, .5), .4); d = hop(d, tron(x, y, 3.6, -1.9, .55), .4);   /* mõm, cằm */
        d = hop(d, tron(x, y, .7, -2.0, 1.75), 1.0); return hop(d, tron(x, y, 2.55, -2.6, .75), .8); }   /* bụng, chân trước */
      function G(x, y, cx, cy, sx, sy) { return Math.exp(-((x - cx) * (x - cx) / (sx * sx) + (y - cy) * (y - cy) / (sy * sy))); }
      function R(d, w) { return Math.exp(-(d / w) * (d / w)); }
      function cham(x, y, s) { var z = .34 * G(x, y, 2.75, .1, 1.1, 1.6) + .12 * G(x, y, 1.6, 2.6, .45, .8) + .12 * G(x, y, 3.35, 1.45, .35, .6) + .26 * G(x, y, -1.7, .5, 1.8, 2.2) + .16 * G(x, y, .2, -2.2, 1.2, 1.0) + .10 * G(x, y, 2.5, -2.55, .55, .55);   /* đầu, đuôi, chóp đuôi, chân nổi khối */
        z -= x < 4.2 ? .16 * R(Math.hypot((x - 3.0) / 1.25, (y + .25) / 1.9) - 1, .12) : 0;   /* rãnh viền đầu */
        z -= y > -3.4 && x < 1 ? .08 * R(Math.hypot((x + .3) / 1.15, (y + 2.25) / .95) - 1, .2) * (y > -1.6 ? 1 : .5) : 0;   /* rãnh quanh chóp đuôi */
        var r = Math.hypot(x + .4, y + .3), a = Math.atan2(y + .3, x + .4);
        [[2.05, 2.3, 1.0], [2.85, 2.0, 1.15]].forEach(function (q) { var da = Math.atan2(Math.sin(a - q[1]), Math.cos(a - q[1])); z -= .10 * R(r - q[0], .13) * Math.exp(-(da / q[2]) * (da / q[2])); });   /* lông đuôi */
        for (var i = 0; i < 5; i++) z -= .06 * R((x - 2.1) * .6 + (y - .1) * .8 - (i - 2) * .38, .07) * G(x, y, 2.5, .5, 1.0, 1.3);   /* lông trên đầu */
        z -= .12 * R(Math.hypot((x - 3.2) / .32, (y + .3) / .13) - 1, .25);   /* mắt dài */
        z -= .10 * R(Math.hypot((x - 1.55) / .32, (y - 2.55) / .65) - 1, .15) + .10 * R(Math.hypot((x - 3.3) / .28, (y - 1.35) / .5) - 1, .15);   /* lòng 2 tai */
        return 1 + z * (1 - s * s * s * s) / Math.max(.32, Math.sqrt(1 - s * s)); }   /* cộng thêm chiều cao (không nhân vòm) → đầu & tai ở gần mép vẫn nổi rõ */
      var g = new THREE.Group(), o = holoMat({ da: 'lamdam', hinh: h, khung: h, vien: 'tron', le: .3, day: 1.2, cao: 2.4, cham: cham, n: 240, K: 56 }).g;
      g.add(o);
      var vt = vienTu(function (x, y) { return h(x, y) - .2; }, 0, -.5, 120);
      [6, 26, 44, 62, 84, 104].forEach(function (i) { var q = vt[i], c = new THREE.Mesh(new THREE.SphereGeometry(.3, 14, 10), VL.vang); c.scale.set(.7, .7, 1.3); c.position.set(q.x * .97, q.y * .97 - .01, 1.15); g.add(c); });   /* chấu nhỏ bấu lên mép đá */
      return { g: g, rong: 8.6, xo: 'xuyen', cao: 8.6 };
    },
    '25641': function () { return holoMat({ da: 'lambang', vien: 'tron', k: .72, day: 1.1, treo: 'khoen' }); },   // ảnh ghi cỡ thật: cả móc 12,1 ly · thân 8,4 × 5 × 2,7
    '12782': function () { return holoMat({ da: 'lambang', k: .9, vien: 'ren', le: 2.0, renR: 1.05, soVong: 24, cao: 2.4, treo: 'khoa' }); },   // viền ren ôm sát hồ lô: 24 vòng dây hạt xếp đè lên nhau, viền trơn mảnh trong; băng trắng trong suốt
    '24134': function () {   /* xem kĩ 4 ảnh: hạt xỏ ngang dáng khiên (đỉnh hơi nhọn, vai tròn, đáy nhọn), dày; vòm kim cương chạy theo mép trên; 2 bên gờ vàng uốn ôm đá; hồ lô lục đế ổ trơn; lưng chạm lộng; lỗ xỏ ở 2 sườn */
      var g = new THREE.Group(), i;
      function fk(x, y) { var d = hop(el2(x, y, 0, .55, 4.5, 4.4), Math.max(tron(x, y, -3.9, 0, 6.6), tron(x, y, 3.9, 0, 6.6)), 1.6); return hop(d, tron(x, y, 0, 4.75, .55), 1.4); }
      function el2(x, y, cx, cy, a, b) { return (Math.hypot((x - cx) / a, (y - cy) / b) - 1) * Math.min(a, b); }
      var fh = hinhHoLo(.64), DY = .65; function fs(x, y) { return fh(x, y - DY); }
      var vk = vienTu(fk, 0, 0, 200);
      var than = khoi(vk, 0, 0, hoSo(2.0, .7), VL.vangMo, true); g.add(than);
      g.add(vom(vk, 0, 0, .95, VL.vangMo, function (x, y, s) { var d = fs(x, y), m = Math.min(1, Math.max(0, (1.9 - y) / 1.2)), r = 0;
        [1.05, 1.8, 2.55].forEach(function (c) { r += .3 * Math.exp(-Math.pow((d - c) / .24, 2)); });
        return 1 + (r * m + .35 * Math.exp(-Math.pow((d - .4) / .35, 2))) * (1 - s * s * s * s) / Math.max(.3, Math.sqrt(1 - s * s)); }, 40));   /* gờ uốn 2 bên ôm theo viên đá */
      lungLo(g, function (x, y) { return fk(x, y) + .02; }, -2.0, function (c, X, Y, k) { for (var i = 0; i < 8; i++) { var a = i / 8 * PI * 2; c.beginPath(); c.ellipse(X(Math.cos(a) * 1.9), Y(Math.sin(a) * 1.9 + .3), 1.6 * k, .7 * k, -a, 0, 7); c.stroke(); } c.beginPath(); c.ellipse(X(0), Y(.3), .9 * k, 1.4 * k, 0, 0, 7); c.stroke(); }, 5.6, VL.lucde, -1.3);   /* soát đợt 5: lưng lộng hoa lá thấy ngọc (trước lưới mịn đặc) */
      var de = khoi(vienTu(function (x, y) { return fs(x, y) - .3; }, 0, DY - .2, 160), 0, DY - .2, hoSo(.75, .15), VL.vang); de.position.z = .75; g.add(de);
      var pd = vienTu(fs, 0, DY - .2, 160);
      g.add(ongVien(vienTu(function (x, y) { return fs(x, y) - .12; }, 0, DY - .2, 160), .17, VL.vang, .8));
      var dv = vom(pd, 0, DY - .2, 1.75, VL.lucde); dv.position.z = .72; g.add(dv);
      /* vòm kim cương theo mép trên */
      var vt = vienTu(function (x, y) { return fk(x, y) + .78; }, 0, 0, 400).filter(function (q) { return q.y > 1.7; });
      vt.sort(function (a, b) { return Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x); });
      var Ls = [0]; for (i = 1; i < vt.length; i++) Ls.push(Ls[i - 1] + vt[i].distanceTo(vt[i - 1]));
      function diem(d) { for (var j = 1; j < vt.length; j++) if (Ls[j] >= d) { var t = (d - Ls[j - 1]) / (Ls[j] - Ls[j - 1] || 1); return new V2(vt[j - 1].x + (vt[j].x - vt[j - 1].x) * t, vt[j - 1].y + (vt[j].y - vt[j - 1].y) * t); } return vt[vt.length - 1]; }
      var SO = 11, LL = Ls[Ls.length - 1];
      for (i = 0; i < SO; i++) { var q = diem((i + .5) / SO * LL), d = new THREE.Mesh(kcGeo(.48), VL.kc); d.position.set(q.x, q.y, .66); g.add(d);
        var o = new THREE.Mesh(new THREE.TorusGeometry(.5, .07, 8, 24), VL.vang); o.position.set(q.x, q.y, .6); g.add(o); }
      for (i = 0; i <= SO; i++) { var q2 = diem(i / SO * LL), b2 = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), VL.vang); b2.position.set(q2.x * 1.0, q2.y, .72); g.add(b2); }   /* hạt chấu giữa các viên */
      [-1, 1].forEach(function (sx) { var x0 = 0; while (fk(x0 * sx, 0) < 0) x0 += .02; var lo = khoen(.55, .16, VL.vang); lo.rotation.y = PI / 2; lo.position.set(sx * (x0 - .1), 0, -1.0); g.add(lo);
        var ld = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), VL.toi || new THREE.MeshBasicMaterial({ color: 0x2a1d08 })); ld.rotation.y = sx * PI / 2; ld.position.set(sx * (x0 - .05), 0, -1.0); g.add(ld); });   /* lỗ xỏ 2 sườn */
      g.children.forEach(function (m) { m.position.z += .4; });
      return { g: g, rong: 9, xo: 'xuyen', cao: 11 };
    },
    '26254': function () { return holoMat({ da: 'lucde', k: .5, khung: giot(.62), vien: 'kc', treo: 'khoen' }); },   // đế giọt nước viền kim cương
    '25784': function () { return holoMat({ da: 'lucde', vien: 'thung', day: 3.0, nhon: true, lung: HV.kimTien }); },   // viền bi, thành chạm lộng dày, cuống nhọn
    '25787': function () { return holoMat({ da: 'lucde', vien: 'thung', k: .7, day: 3.0, lung: HV.kimTien }); },   // mặt trước ngọc lục đế, lưng vàng chạm lộng dày
    '25814': function () { return holoGon({ da: 'lucde' }); },
    '25789': function () { return holoMat({ da: 'lucde', vien: 'thung', k: .85, treo: 'khoa', trai: true }); },   // mặt trước ngọc lục đế + ngọc trai cạnh khoá
    '23968': function () { return holoKhoi({ vl: VL.vangMo, khoenEo: true, dayBanh: true, bauTren: 1.6, nghieng: 1.0, k: .72 }); },   // hồ lô nhám, đáy là bánh xe hoa có hạt kim cương; khoen ở eo
    '23831': function () {   // dải dài (ảnh kẹp treo): khoen, chấu ruby, mắt như ý, hồ lô tourmaline, mắt như ý, chấu ruby, khoen cuối
      var g = new THREE.Group(), m;
      function nhuY(x, yy) { return hop(hop(tron(x, yy, -.75, -.1, .7), tron(x, yy, .75, -.1, .7), .3), tron(x, yy, 0, .45, .78), .3); }
      function chau(y) { var ch = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 1.0, 28), VL.vang); ch.rotation.x = PI / 2; ch.position.y = y; g.add(ch); var rb = vien(.6, VL.ruby, .7); rb.position.set(0, y, .5); g.add(rb); }
      var kh = new THREE.Group(), kk = khoen(1.0, .22, VL.vang); kk.rotation.y = PI / 2; kh.add(kk); kh.position.y = -1.0; g.add(kh); g.userData.khoa = kh;
      chau(-2.8);
      m = ongVien(vienTu(nhuY, 0, .1, 64), .2, VL.vang, 0); m.position.y = -4.8; g.add(m);
      var hl = holoMat({ da: 'hong', vien: 'tron', k: .42 }).g; hl.position.y = -8.7; g.add(hl);
      m = ongVien(vienTu(nhuY, 0, .1, 64), .2, VL.vang, 0); m.rotation.z = PI; m.position.y = -12.4; g.add(m);
      chau(-14.4);
      var kc = khoen(.8, .18, VL.vang); kc.position.y = -16.0; g.add(kc);
      return { g: g, rong: 1.3, xo: 'treo', cao: 17 };
    },
    '24014': function () {   // trên: vành hồ lô kết bằng hạt bi (rỗng giữa), khoen ở đỉnh; dưới: dây xích mảnh, cuối dây là lá hồ lô nhỏ mặt cắt giác
      var g = new THREE.Group(), f = hinhHoLo(.42), i;
      g.add(chuoiHat(vienTu(f, 0, -.2, 140), .4, VL.vang, 0));
      var L = 8.5; xich(g, new V3(0, -2.75, 0), new V3(0, -2.75 - L, 0), .26, VL.vang);   /* soát đợt 5: dây xích mắt thật (trước que + hạt) */
      var la = khoi(vienTu(hinhHoLo(.26), 0, -.13, 90), 0, -.13, hoSo(.5, .15), VL.vangGiac); la.position.set(0, -2.75 - L - 1.3, .25); g.add(la);
      var cao = mocDon(g, 2.35);
      return { g: g, rong: 1.3, xo: 'treo', cao: cao + 14 };
    },
    '23974': function () {   // lá hồ lô chữ 暴富 nổi, nền hạt nhám, 2 lỗ tròn ở bầu dưới, viền bi
      function f(x, y) { return hop(tron(x, y, 0, -1.75, 2.95), tron(x, y, 0, 2.45, 1.95), 1.2); }
      var vl = vanRieng(function (g, X, Y, mm) { for (var i = 0; i < 2600; i++) { g.fillStyle = Math.random() < .5 ? '#8a8a8a' : '#3e3e3e'; g.fillRect(Math.random() * 512, Math.random() * 512, 4, 4); }
        g.fillStyle = '#fff'; g.font = 'bold ' + Math.round(2.7 * mm) + 'px serif'; g.fillText('暴', X(0), Y(2.3)); g.font = 'bold ' + Math.round(3.5 * mm) + 'px serif'; g.fillText('富', X(0), Y(-1.5)); });
      var g = tamTreo({ f: f, cy: -.2, vl: vl, day: .9, hat: .17 });
      [-2.05, 2.05].forEach(function (x) { var lo = new THREE.Mesh(new THREE.CircleGeometry(.42, 20), VL.toi); lo.position.set(x, -2.7, .46); g.add(lo); });
      var cao = mocDon(g, 4.4), bao = new THREE.Group(); g.scale.setScalar(.92); bao.add(g); bao.userData.khoa = g.userData.khoa;
      return { g: bao, rong: 1.5, xo: 'treo', cao: (cao + 4.7) * .92 };
    },
    '23909': function () { return holoKhoi({ vl: longVang(vanLong(function (c, w, h) { c.lineWidth = 9; for (var i = 0; i < 6; i++) for (var j = 0; j < 4; j++) { c.beginPath(); c.ellipse((i + .5) * w / 6, (j + .5) * h / 4, w / 12 - 6, h / 8 - 8, 0, 0, 7); c.stroke(); } c.lineWidth = 6; for (j = 0; j <= 4; j++) { c.beginPath(); c.moveTo(0, j * h / 4); c.lineTo(w, j * h / 4); c.stroke(); } })), long: true, lapU: 1, daDuoi: 'ruby', treo: true, det: .8, k: .95 }); },   /* soát đợt 5: hồ lô CHỈ VÀNG LỘNG vòng số 8 (trước khối trơn) */
    '24209': function () {   // hồ lô: bầu dưới là bi đan lưới đính kim cương, bầu trên là nắp trơn chạm vân có núm; khoen gắn ở cổ nên rủ nghiêng
      var th = new THREE.Group(), R = 3.1, i; th.add(new THREE.Mesh(new THREE.SphereGeometry(R, 56, 36), vangVan('luoi', 1.3, 3.2, .28)));   /* soát đợt 5: ô quả trám to */
      for (i = 0; i < 18; i++) { var y = 1 - (i + .5) / 18 * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996, d = new THREE.Mesh(kcGeo(.36), VL.kc); d.position.set(Math.cos(a) * r * R * .98, y * R * .98 - .1, Math.sin(a) * r * R * .98); if (y < .8) th.add(d); }
      var nap = new THREE.Mesh(new THREE.SphereGeometry(2.05, 40, 24), VL.vangHoa); nap.scale.y = .85; nap.position.y = 3.25; th.add(nap);
      var vanh = khoen(2.1, .26, VL.vang); vanh.rotation.x = PI / 2; vanh.position.y = 2.35; th.add(vanh);
      var num = new THREE.Mesh(new THREE.SphereGeometry(.55, 20, 14), VL.vang); num.position.y = 5.15; th.add(num);
      return { g: treoEo(th, 2.3, 2.35, .7, .85), rong: 1.4, xo: 'treo', cao: 9 };
    },
    '23957': function () {   // hồ lô vàng đúc dày, thành chạm lưới, mặt trên 2 ô men lam
      var g = new THREE.Group(), f = hinhHoLo(.8), cy = -.4, vk = vienTu(f, 0, cy, 140);
      var th = khoi(vk, 0, cy, hoSo(3.6, .5), VL.vangLuoi); th.position.z = 1.8; g.add(th);
      g.add(ongVien(vienTu(function (x, y) { return f(x, y) + .3; }, 0, cy, 140), .22, VL.vang, 1.8));
      [[0, -1.85, 2.1, '#f3eee0', '#2c6cc2', '#3b82d8'], [0, 2.05, 1.3, '#2f74cc', '#f4e7b8', null]].forEach(function (q) { var m = huyHieu(q[2], q[3], '福', q[4], q[5]); m.position.set(q[0], q[1], 1.84); g.add(m); var b = khoen(q[2] + .05, .17, VL.vang); b.position.set(q[0], q[1], 1.84); g.add(b); });   // ô lớn nền trắng ngà chữ lam, ô nhỏ nền lam chữ vàng
      var mo = new THREE.Mesh(new THREE.ConeGeometry(.55, 1.2, 18), VL.vang); mo.position.set(0, 4.3, 0); g.add(mo);
      g.rotation.z = PI / 2;   // dây xỏ dọc thân hồ lô
      var bao = new THREE.Group(); bao.add(g); return { g: bao, rong: 9.4, xo: 'xuyen', cao: 5.8, dungXem: true };
    }
  };
  Object.keys(HL).forEach(function (k) { DS[k] = HL[k]; });

  /* ---------- tỷ lệ kích thước: theo cỡ THẬT (ly) so với hạt chuỗi ----------
     Ưu tiên: (1) cỡ đo thật ghi trên ảnh (bảng KT) · (2) cỡ ghi trong tên "N ly" · (3) chặn = cỡ hạt − 2,5 ly
     (4) còn lại: giữ cỡ của mô hình (dựng theo tương quan với khoen/móc trong ảnh), chặn trong khoảng hợp lý. */
  var KT = {
    '23915': { cao: 7 },   /* tim nhỏ ~5 ly + 2 khoen */
    '24093': { cao: 7 },   /* xu nhỏ ~5 ly + 2 khoen */
    'A5320': { cao: 7.5 },   /* búp sen nhỏ ~4 ly + 2 khoen */
    '23929': { cao: 7.5 },   /* khối đá nhỏ ~3,5 ly + 2 khoen */
    '23954': { cao: 7 },   /* đá ổ chấu nhỏ: viên ~3 ly + 2 khoen */   // mã → cao: cả móc (charm rơi) · day: bề dày vuông góc dây (charm xỏ) — số đo ghi trên ảnh
    '25810': { cao: 18.2 },   // "Cả móc 18,2mm · 9,1-7,5-3,3"
    '25641': { cao: 12.1 },   // "Cả móc 12,1mm · 8,4-5-2,7"
    '25785': { day: 8.4 },   /* ảnh ghi 14,4-8,4-6,2 */
    '23139': { day: 9.7 },   /* ảnh ghi 11,2-9,7-7 */
    '20245': { cao: 5.5 },
    '25890': { day: 8.4 }     // "10-8,4"
  };
  function kep(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function chuan(m, o) {
    o = o || {}; var ten = (o.ten || '').toLowerCase(), co = o.co || 8, that = KT[o.ma] || {};
    var kt = new THREE.Box3().setFromObject(m.g, true).getSize(new V3()), dich, do_;   // đo chính xác theo từng đỉnh (charm xoay nghiêng không bị đo dôi)
    if (m.xo === 'treo') { do_ = kt.y; dich = that.cao || kep(kt.y, 9, 20); }
    else { do_ = m.doBan || Math.max(kt.y, kt.z);   /* doBan: cỡ phần thân chính (bỏ qua dây rủ…) */ var coTen = ten.replace(/lỗ\s*[\d.,]+\s*ly/g, '').match(/(\d+(?:[.,]\d+)?)\s*(?:x\s*[\d.,]+\s*)?ly(?![a-zà-ỹ])/);
      if (that.day) dich = that.day;
      else if (m.uoc) dich = m.uoc;   /* cỡ ước theo ảnh (không có số đo) */
      else if (/chặn/.test(ten)) dich = Math.max(3, co - 2.5);
      else if (coTen) dich = kep(parseFloat(coTen[1].replace(',', '.')), 4, 14);
      else dich = kep(do_, 4.5, 11); }
    var s = dich / do_, bao = new THREE.Group(); m.g.scale.multiplyScalar(s); bao.add(m.g); bao.userData.khoa = m.g.userData.khoa; bao.userData.khoaXem = m.g.userData.khoaXem;
    return { g: bao, xo: m.xo, lat: m.lat, dung: m.dung, dungXem: m.dungXem, rong: Math.max(m.xo === 'treo' ? 1.1 : 0, m.rong * s), cao: m.cao * s, kt: { x: kt.x * s, y: kt.y * s, z: kt.z * s }, doThat: !!(that.cao || that.day) };
  }
  var BIEN = { '16291': [{ k: 'xanh', ten: 'Đá xanh lục' }, { k: 'hong', ten: 'Đá hồng' }], '24086': [{ k: 'thuong', ten: 'Chữ 上' }, { k: 'huu', ten: 'Chữ 有' }, { k: 'phat', ten: 'Chữ 发' }, { k: 'tien', ten: 'Chữ 钱' }], 'BS127': [{ k: 'haoyun', ten: 'Chữ 好运' }, { k: 'nuli', ten: 'Chữ 努力' }] };   /* charm có nhiều màu: khách chọn, o.mau = k (phần tử đầu là mặc định) */
  return { ds: DS, vl: VL, bien: BIEN, tao: function (ma, o) { o = o || {}; o.ma = ma; return DS[ma] ? chuan(DS[ma](o), o) : null; } };
};
