/* =========================================================
   VÒNG CHUỖI 3D — trang Tự thiết kế (three.js + charm-3d.js)
   thiet-ke.js giữ toàn bộ dữ liệu (dây, cỡ tay, số vòng, charm gắn ở hạt j của vòng k);
   file này chỉ VẼ: V3D.ve(tt) đồng bộ cảnh theo trạng thái, báo lại khi khách bấm / kéo charm.
   - Thiết kế: 1 vòng nằm nghiêng, kéo nền để xoay, bấm charm để chọn, kéo charm sang hạt khác.
   - Đeo thử: cả chuỗi quấn quanh cổ tay 3D, kéo ngang để xoay chuỗi quanh tay.
   - Charm xuyên / ống thay chỗ 1 hạt, nằm theo chiều dây; charm treo rủ theo trọng lực (con lắc thật).
   Không có WebGL / không tải được three → không tạo V3D, trang giữ hình SVG 2D.
   ========================================================= */
(function () {
  var san = document.querySelector('.san-trong');
  if (!san || !window.taoCharm3D) return;
  try { var thu = document.createElement('canvas'); if (!(thu.getContext('webgl2') || thu.getContext('webgl'))) return; } catch (er) { return; }
  import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js').then(dung).catch(function (er) { console.warn('vong-3d', er); });

  function dung(THREE) {
    var X = window.taoCharm3D(THREE), PI = Math.PI, V3 = THREE.Vector3;
    var cv = document.createElement('canvas'); cv.className = 'vong-3d';
    cv.setAttribute('aria-label', 'Chuỗi đang thiết kế (3D): kéo để xoay, bấm charm để chọn');
    san.insertBefore(cv, san.firstChild);
    var R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.outputColorSpace = THREE.SRGBColorSpace;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
    var canh = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .1, 200); cam.position.set(0, 0, 20);

    /* phòng chụp tự dựng: softbox ấm → vàng và ngọc bóng thật (giống bản thử charm 3D) */
    (function () {
      var env = new THREE.Scene();
      env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x7a6f5c, side: THREE.BackSide })));
      function den(w, h, mau, x, y, z) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: mau, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); }
      den(14, 6, 0xfff1d6, -6, 10, 6); den(8, 10, 0xffffff, 12, 2, 4); den(20, 3, 0xffd9a0, 0, -8, -10); den(6, 6, 0xcfeaff, -12, -2, -4);
      den(10, 10, 0xfff6e6, 0, 14, -2); den(6, 14, 0xffe2b0, -14, 4, 8); den(9, 5, 0xffffff, 3, 5, 14); den(16, 4, 0xfff0d0, 0, -12, 6); den(26, 16, 0xd9bd86, 0, -1, 19);
      canh.environment = new THREE.PMREMGenerator(R).fromScene(env, .03).texture;
    })();
    var d1 = new THREE.DirectionalLight(0xfff8ee, 1.4); d1.position.set(-4, 6, 8); canh.add(d1);
    var d2 = new THREE.DirectionalLight(0x9fd0ff, .45); d2.position.set(6, -3, -4); canh.add(d2);

    /* khung cảnh: thiết kế = nghiêng > quay > vòng nằm ngang (đơn vị 1 = 1 cm) · đeo thử = cánh tay nằm ngang, bàn tay bên phải */
    var nghieng = new THREE.Group(), quay = new THREE.Group(); nghieng.add(quay); canh.add(nghieng);
    var deoG = new THREE.Group(); canh.add(deoG); deoG.visible = false;

    /* ---------- hạt ngọc: 1 InstancedMesh cho mọi vòng ---------- */
    var TOI_DA_HAT = 360;
    var c2 = document.createElement('canvas'); c2.width = 512; c2.height = 256;
    (function (g) { g.fillStyle = '#fff'; g.fillRect(0, 0, 512, 256);
      for (var i = 0; i < 70; i++) { var x = Math.random() * 512, y = Math.random() * 256, r = 14 + Math.random() * 70, a = .04 + Math.random() * .1, gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, Math.random() < .25 ? 'rgba(240,255,250,' + a * 2.4 + ')' : 'rgba(20,50,55,' + a * .8 + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } })(c2.getContext('2d'));
    var van = new THREE.CanvasTexture(c2); van.colorSpace = THREE.SRGBColorSpace; van.wrapS = THREE.RepeatWrapping;
    var hatMat = new THREE.MeshPhysicalMaterial({ map: van, roughness: .1, clearcoat: 1, clearcoatRoughness: .04, sheen: .25, sheenRoughness: .4, sheenColor: new THREE.Color(0xe4fbff), ior: 1.66 });
    hatMat.onBeforeCompile = function (s) { s.fragmentShader = s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\nfloat tamHat = pow(clamp(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 1.6);\ntotalEmissiveRadiance += diffuseColor.rgb * (0.1 + 0.32 * tamHat);'); };
    var hat = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 40, 28), hatMat, TOI_DA_HAT); hat.count = 0; hat.frustumCulled = false; quay.add(hat);
    var HAT = [];   // trạng thái từng hạt theo khoá k*64+j: vị trí đang lướt tới + góc xoay ngẫu nhiên (vân đá mỗi hạt một khác)
    for (var i = 0; i < 5 * 64; i++) HAT.push({ p: new V3(), dat: false, q: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)), r: Math.random() });
    var mauDay = '';
    function toMau(mau) {
      var k = mau.join(); if (k === mauDay) return; mauDay = k;
      var mT = new THREE.Color(mau[0]), mD = new THREE.Color(mau[1]);
      for (var i = 0; i < TOI_DA_HAT; i++) { var r = HAT[i % HAT.length].r; hat.setColorAt(i, mT.clone().lerp(mD, .2 + r * .5).offsetHSL((r - .5) * .02, .04, 0)); }
      hat.instanceColor.needsUpdate = true;
    }

    /* dây chun trong lòng hạt + bóng mềm dưới vòng (chế độ thiết kế) */
    var dayChun = new THREE.Mesh(new THREE.TorusGeometry(1, .022, 8, 200), new THREE.MeshStandardMaterial({ color: 0x3a342c, roughness: .6 })); dayChun.rotation.x = PI / 2; quay.add(dayChun);
    var bc = document.createElement('canvas'); bc.width = bc.height = 128;
    (function (g) { var gr = g.createRadialGradient(64, 64, 20, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.36, 'rgba(0,0,0,.05)'); gr.addColorStop(.47, 'rgba(0,0,0,.42)'); gr.addColorStop(.6, 'rgba(0,0,0,.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); })(bc.getContext('2d'));
    var bong = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, opacity: .5, depthWrite: false })); bong.rotation.x = -PI / 2; bong.position.y = -.62; quay.add(bong);

    /* vòng chọn: vòng vàng nét đứt quay quanh charm đang chọn, luôn quay mặt về máy ảnh */
    var vc = document.createElement('canvas'); vc.width = vc.height = 256;
    (function (g) { g.strokeStyle = '#c99a45'; g.lineWidth = 7; g.setLineDash([16, 14]); g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke(); })(vc.getContext('2d'));
    var vongChon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(vc), transparent: true, depthTest: false, depthWrite: false }));
    vongChon.renderOrder = 9; vongChon.visible = false; canh.add(vongChon);

    /* ---------- cánh tay (đeo thử): tiện tròn theo trục x, cổ tay dẹt, bàn tay hình bao tay mềm ---------- */
    var da = new THREE.MeshPhysicalMaterial({ color: 0xeac3a4, roughness: .62, sheen: .5, sheenRoughness: .6, sheenColor: new THREE.Color(0xffd9c4), clearcoat: .15, clearcoatRoughness: .6 });
    var tay = null, tayKhoa = '';
    function dungTay(b, a, xw) {   // b: nửa bề dày cổ tay (y), a: nửa bề ngang (z), xw: toạ độ cổ tay
      var k = b.toFixed(2) + a.toFixed(2) + xw.toFixed(2); if (k === tayKhoa) return; tayKhoa = k;
      if (tay) { deoG.remove(tay); tay.geometry.dispose(); }
      var P = [[-16, 1.5], [-9, 1.38], [-4, 1.18], [-1.2, 1.04], [0, 1], [.8, 1.02], [1.8, 1.2], [3.2, 1.3], [4.6, 1.22], [5.6, 1.0], [6.3, .62], [6.62, .2], [6.68, 0]];
      var pts = P.map(function (q) { return new THREE.Vector2(Math.max(.001, q[1] * b), q[0]); });
      var g = new THREE.LatheGeometry(pts, 72); g.rotateZ(-PI / 2);   // trục y của tiện → trục x (khuỷu bên trái, bàn tay bên phải)
      var p = g.attributes.position;
      for (var i = 0; i < p.count; i++) { var x = p.getX(i), s = Math.min(1, Math.max(0, (x - .6) / 2.6)); s = s * s * (3 - 2 * s);
        p.setZ(i, p.getZ(i) * (a / b) * (1 + .38 * s)); p.setY(i, p.getY(i) * (1 - .26 * s)); p.setX(i, x + xw); }
      g.computeVertexNormals();
      tay = new THREE.Mesh(g, da); deoG.add(tay);
    }

    /* ---------- charm trên vòng ---------- */
    var DS = new Map(), coDay = 0;   // g (mục gắn trong thiet-ke.js) → đối tượng 3D
    var THIEU = {};   // charm chưa có bản 3D → tấm ảnh vẽ v3 (hoặc ảnh chụp) dựng đứng
    function taoMoHinh(g) {
      var c = g.c, m = X.tao(c.id, { ten: c.ten, co: coDay, mau: g.mau });
      if (m) return m;
      var gr = new THREE.Group(), xo = (window.V3 || {})[c.id] || c.xo || 'treo', url = (window.V3 || {})[c.id] ? 'charm-v3/' + c.id + '.webp?v=' + (window.V3_PHIEN || 1) : (/[\/.]/.test(c.anh) ? c.anh : 'https://lh3.googleusercontent.com/d/' + c.anh + '=w300');
      var t = THIEU[url] || (THIEU[url] = new THREE.TextureLoader().load(url)); t.colorSpace = THREE.SRGBColorSpace;
      var tam = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .1, side: THREE.DoubleSide, toneMapped: false }));
      tam.position.y = xo === 'treo' ? -4.8 : 0; gr.add(tam);
      return { g: gr, xo: xo === 'treo' ? 'treo' : 'xuyen', rong: xo === 'treo' ? 1.6 : 7, cao: 10, dung: true, kt: { x: 10, y: 10, z: .1 } };
    }
    /* thu nhỏ charm trên vòng cho cân với hạt (khách thấy charm to quá): xuyên/ống ×0,8 · treo ×0,72 · chặn đã theo cỡ hạt nên giữ nguyên */
    var CO_XUYEN = .8, CO_TREO = .72;
    function heSoCo(g, m) { return /chặn/i.test(g.c.ten || '') ? 1 : m.xo === 'treo' ? CO_TREO : CO_XUYEN; }
    function taoCharm(g) {
      var m = taoMoHinh(g), giu = new THREE.Group(); giu.add(m.g);
      var hop = new THREE.Box3().setFromObject(m.g), tam = hop.getCenter(new V3()), kt = hop.getSize(new V3());
      var o = { k: heSoCo(g, m), g: g, m: m, giu: giu, tam: tam, ban: Math.max(kt.x, kt.y) * .5, e: 0, ra: false, p: new V3(), T: new V3(1, 0, 0), F: new V3(0, 1, 0), dat: false, mau: g.mau, treo: m.xo === 'treo', moi: !!g.moi };
      giu.traverse(function (x) { x.userData.charm = o; });
      return o;
    }
    function boCharm(o) { if (o.giu.parent) o.giu.parent.remove(o.giu); DS.delete(o.g); o.giu.traverse(function (x) { if (x.geometry && !x.isInstancedMesh) x.geometry.dispose(); }); }

    /* ---------- trạng thái từ thiet-ke.js ---------- */
    var tt = null, khoaCanh = '', canNhin = null, xoay = 0, vX = 0, ngThem = 0, spin = 0, tuSpin = true, chonO = null;
    var BKm = {}, gocJ = {}, xeps = [];
    function ve(t) {
      tt = t;
      toMau(t.mau);
      if (t.co !== coDay) { coDay = t.co; DS.forEach(boCharm); }   // đổi cỡ hạt: charm chặn đổi cỡ theo → dựng lại
      var khoa = t.cheDo + '|' + (t.cheDo === 'deo' ? t.L : t.vongDang);
      var doiCanh = khoa !== khoaCanh; khoaCanh = khoa;
      var thay = t.gan.filter(function (g) { return t.cheDo === 'deo' || g.k === t.vongDang; });
      if (doiCanh) {   // đổi vòng / chế độ: charm vòng khác biến ngay, hạt đặt lại chỗ (không lướt từ vòng cũ)
        DS.forEach(function (o) { if (thay.indexOf(o.g) < 0) boCharm(o); else o.dat = false; });
        HAT.forEach(function (h) { h.dat = false; }); BKm = {}; canNhin = null;
        var chua = t.cheDo === 'deo' ? deoG : quay; chua.add(hat); DS.forEach(function (o) { chua.add(o.giu); });
        nghieng.visible = t.cheDo !== 'deo'; deoG.visible = t.cheDo === 'deo'; dayChun.visible = bong.visible = t.cheDo !== 'deo';
        if (t.cheDo === 'deo') { tuSpin = true; spin = 0; } else { xoay = 0; vX = 0; }
      }
      DS.forEach(function (o) { if (thay.indexOf(o.g) < 0 && !o.ra) o.ra = true; });
      thay.forEach(function (g) {
        var o = DS.get(g);
        if (o && o.mau !== g.mau) { boCharm(o); o = null; }   // đổi màu charm (charm có nhiều màu)
        if (o && o.ra) o.ra = false;
        if (!o) { o = taoCharm(g); if (doiCanh) { o.e = 1; o.moi = false; } DS.set(g, o); (t.cheDo === 'deo' ? deoG : quay).add(o.giu); }
        if (g.moi && t.cheDo !== 'deo') canNhin = o;
      });
      chonO = t.chon ? DS.get(t.chon) || null : null;
      yen = 1; chay();   // có thay đổi → vẽ tiếp cho tới khi hạt xếp xong (không dừng giữa chừng để lại vòng hở)
    }

    /* ---------- xếp hạt + charm theo bề rộng thật trên dây (đơn vị cm) ---------- */
    function xep(dt) {
      var t = tt, rH = t.co / 20, ds = [], soHat = 0, mu = Math.min(1, dt * 7); hatDong = false; var ks = t.cheDo === 'deo' ? Array.from({ length: t.L }, function (_, k) { return k; }) : [t.vongDang];
      var o3 = {}; DS.forEach(function (o) { if (!o.ra) o3[o.g.k + '.' + o.g.j] = o; });
      var dsVong = ks.map(function (k) {
        var muc = [];
        for (var j = 0; j < t.n; j++) {
          var o = o3[k + '.' + j];
          if (o && !o.treo) { muc.push({ o: o, w: o.m.rong * .1 * o.k * Math.max(.05, o.e), j: j }); continue; }
          muc.push({ hat: k * 64 + j, w: 2 * rH * 1.015, j: j });
          if (o) muc.push({ o: o, w: Math.max(.05, o.m.rong * .1 * o.k * o.e), j: j + .5 });
        }
        var L = 0; muc.forEach(function (m) { L += m.w; });
        var BK = L / (2 * PI); BKm[k] = BKm[k] === undefined ? BK : BKm[k] + (BK - BKm[k]) * mu;
        if (Math.abs(BKm[k] - BK) > 1e-4) hatDong = true;
        return { k: k, muc: muc, BK: BK };
      });
      /* đeo thử: cổ tay vừa lòng vòng lớn nhất, các vòng xếp cạnh nhau, vòng 1 sát bàn tay */
      var BKmax = 0; dsVong.forEach(function (v) { BKmax = Math.max(BKmax, BKm[v.k]); });
      var bT = (BKmax - rH) * .8, aT = (BKmax - rH) * .94, buoc = 2 * rH * 1.06, xw = 0;
      if (t.cheDo === 'deo') dungTay(bT, aT, xw);
      gocJ = {};
      dsVong.forEach(function (v) {
        var BK = BKm[v.k], goc = 0, gj = gocJ[v.k] = {};
        var x0 = xw - .35 - rH - v.k * buoc, cy = bT + rH - BK;   // đeo thử: vòng tựa lên mu cổ tay, rủ xuống phía dưới
        v.muc.forEach(function (m) {
          var a = -PI / 2 + (goc + m.w / 2) / (v.BK || 1); goc += m.w;   // hạt 0 (chỗ khoá) ở phía sau, hạt giữa ở phía trước
          var P, T, F;
          if (t.cheDo === 'deo') { var th = a + spin;   /* vòng đứng quanh trục x (cổ tay): th = π/2 → phía trước, 0 → mu tay */
            P = new V3(x0, cy + BK * Math.cos(th), BK * Math.sin(th));
            T = new V3(0, Math.sin(th), -Math.cos(th)); F = new V3(0, Math.cos(th), Math.sin(th)); }
          else { P = new V3(Math.cos(a) * BK, 0, Math.sin(a) * BK); T = new V3(Math.sin(a), 0, -Math.cos(a)); F = new V3(Math.cos(a), 0, Math.sin(a)); }
          if (m.hat !== undefined) { var h = HAT[m.hat]; if (!h.dat) { h.p.copy(P); h.dat = true; } else { if (h.p.distanceToSquared(P) > 1e-8) hatDong = true; h.p.lerp(P, mu); } h.F = F; gj[m.j] = a; ds.push(h); soHat++; return; }
          var o = m.o; if (!m.o.treo) gj[m.j] = a;
          if (!o.dat) { o.p.copy(P); o.dat = true; } else o.p.lerp(P, mu);
          o.T.copy(T); o.F.copy(F); o.a = a;
        });
        if (t.cheDo !== 'deo') { dayChun.scale.setScalar(BK); bong.scale.setScalar(BK * 2.3); }
      });
      var m4 = new THREE.Matrix4(), sc = new V3(rH, rH, rH);
      hat.count = Math.min(TOI_DA_HAT, soHat);
      for (var i = 0; i < hat.count; i++) { m4.compose(ds[i].p, ds[i].q, sc); hat.setMatrixAt(i, m4); }
      hat.instanceMatrix.needsUpdate = true;
      return { rH: rH, BKmax: BKmax, xw: xw, buoc: buoc };
    }

    /* ---------- đặt hướng từng charm: xuyên/ống theo chiều dây; treo = con lắc ---------- */
    var mB = new THREE.Matrix4(), xA = new V3(), yA = new V3(), zA = new V3(), Pw = new V3(), Tw = new V3(), vt = new V3(), r3 = new V3(), qCha = new THREE.Quaternion(), qQ = new THREE.Quaternion(), qL = new THREE.Quaternion();
    function datCharm(dt) {
      var deo = tt.cheDo === 'deo', chua = deo ? deoG : quay;
      chua.updateMatrixWorld(true); chua.getWorldQuaternion(qCha).invert();
      DS.forEach(function (o) {
        o.e = o.ra ? Math.max(0, o.e - dt / .6) : Math.min(1, o.e + dt / .9);
        if (o.ra && o.e <= 0) { boCharm(o); if (chonO === o) chonO = null; return; }
        var e1 = o.e * o.e * (3 - 2 * o.e), roi = (1 - e1) * (1 - e1), len = o.ra ? (1 - e1) * 1.6 : roi * 4.5;
        o.giu.position.copy(o.p); o.giu.position.y += len + (o.keo ? .35 : 0);
        o.giu.scale.setScalar(.1 * o.k * (o.ra ? Math.max(.001, e1) : .55 + .45 * e1));
        if (!o.treo) {   /* trục ngang charm = chiều dây, mặt trước ngửa lên (thiết kế) hoặc quay ra ngoài cổ tay (đeo thử) */
          xA.copy(o.T); zA.copy(o.m.dung || deo ? o.F : yA.set(0, 1, 0)); yA.crossVectors(zA, xA).normalize(); zA.crossVectors(xA, yA);
          mB.makeBasis(xA, yA, zA); o.giu.quaternion.setFromRotationMatrix(mB);
          if (roi > .001) o.giu.quaternion.multiply(qL.setFromAxisAngle(yA.set(0, 0, 1), roi * 3));
          return;
        }
        /* charm treo: con lắc thật — rủ theo trọng lực, khoá trượt quanh dây, đung đưa khi vòng xoay rồi tắt dần */
        Pw.copy(o.giu.position); chua.localToWorld(Pw); Tw.copy(o.T).transformDirection(chua.matrixWorld);
        if (!o.b) { o.b = Pw.clone().add(new V3((Math.random() - .5) * .8, -.3, .9)); o.bT = o.b.clone(); }
        vt.copy(o.b).sub(o.bT).multiplyScalar(Math.exp(-dt * 2.4)); o.bT.copy(o.b); o.b.add(vt); o.b.y -= 46 * dt * dt;
        r3.copy(o.b).sub(Pw); r3.addScaledVector(Tw, -r3.dot(Tw)); if (r3.lengthSq() < 1e-6) r3.set(0, -1, 0); r3.normalize(); o.b.copy(Pw).add(r3);
        yA.copy(r3).negate(); zA.set(0, .25, 1).addScaledVector(yA, -yA.y * .25 - yA.z).normalize(); xA.crossVectors(yA, zA).normalize(); zA.crossVectors(xA, yA);
        mB.makeBasis(xA, yA, zA); o.giu.quaternion.setFromRotationMatrix(mB).premultiply(qCha);
        var kh = o.m.g.userData.khoa; if (kh) kh.rotation.y = Math.atan2(-Tw.dot(zA), Tw.dot(xA));
      });
    }

    /* ---------- chạm / kéo ---------- */
    var ray = new THREE.Raycaster(), nd = new THREE.Vector2(), keo = null;
    function tia(ev) { var r = cv.getBoundingClientRect(); nd.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(nd, cam); }
    function trungCharm(ev) {
      tia(ev); var ds = []; DS.forEach(function (o) { if (!o.ra && o.giu.visible) ds.push(o.giu); });
      var h = ray.intersectObjects(ds, true)[0]; return h ? h.object.userData.charm : null;
    }
    function jTuTia(o) {   // điểm trên mặt phẳng vòng dưới con trỏ → hạt gần nhất
      var n = new V3(0, 1, 0).transformDirection(quay.matrixWorld), O = new V3().setFromMatrixPosition(quay.matrixWorld), pl = new THREE.Plane().setFromNormalAndCoplanarPoint(n, O), q = new V3();
      if (!ray.ray.intersectPlane(pl, q)) return o.g.j;
      quay.worldToLocal(q); var a = Math.atan2(q.z, q.x), gj = gocJ[o.g.k] || {}, tot = o.g.j, kc = 9;
      Object.keys(gj).forEach(function (j) { var d = Math.abs(Math.atan2(Math.sin(a - gj[j]), Math.cos(a - gj[j]))); if (d < kc) { kc = d; tot = Math.floor(+j); } });
      return tot;
    }
    cv.addEventListener('pointerdown', function (ev) {
      if (!tt) return;
      var o = tt.cheDo !== 'deo' ? trungCharm(ev) : null;
      lanCham = performance.now();
      keo = { x: ev.clientX, y: ev.clientY, x0: ev.clientX, y0: ev.clientY, o: o, di: false };
      cv.setPointerCapture(ev.pointerId); canNhin = null; tuSpin = false; san.classList.add('keo-3d');
    });
    cv.addEventListener('pointermove', function (ev) {
      if (!keo) {   // rê chuột (máy tính): con trỏ bàn tay khi ở trên charm
        if (ev.pointerType === 'mouse' && tt && tt.cheDo !== 'deo') { var o = trungCharm(ev); cv.style.cursor = o ? 'pointer' : 'grab'; }
        return;
      }
      var dx = ev.clientX - keo.x, dy = ev.clientY - keo.y; keo.x = ev.clientX; keo.y = ev.clientY;
      if (!keo.di && Math.hypot(ev.clientX - keo.x0, ev.clientY - keo.y0) > 6) { keo.di = true; if (keo.o) keo.o.keo = true; }
      if (!keo.di) return;
      if (keo.o) { tia(ev); var j = jTuTia(keo.o); if (j !== keo.o.g.j && V.khi.doi) V.khi.doi(keo.o.g, j); return; }
      if (tt.cheDo === 'deo') { spin -= dx * .012; ngThem = Math.max(-.35, Math.min(.45, ngThem + dy * .004)); }
      else { vX = dx * .006; xoay += dx * .008; ngThem = Math.max(-.55, Math.min(.5, ngThem + dy * .005)); }
      chay();
    });
    function tha() {
      if (!keo) return;
      if (!keo.di && V.khi.chon) V.khi.chon(keo.o ? keo.o.g : null);
      if (keo.o) keo.o.keo = false;
      keo = null; lanCham = performance.now(); san.classList.remove('keo-3d'); chay();
    }
    cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', tha);

    /* ---------- kích thước + chỉ vẽ khi đang nhìn thấy ---------- */
    function co() { var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); chay(); }
    new ResizeObserver(co).observe(cv); co();
    var thay = true; new IntersectionObserver(function (e) { thay = e[0].isIntersecting; if (thay) chay(); }).observe(san);

    /* ---------- vòng lặp ---------- */
    /* tự xoay chậm ở chế độ thiết kế cho sinh động; khách chạm / chọn charm thì dừng, rảnh tay 4 giây lại xoay */
    var GIAM_DONG = matchMedia('(prefers-reduced-motion: reduce)').matches, lanCham = -1e9;   // chưa chạm lần nào → xoay ngay khi mở trang
    function tuQuay() { return !GIAM_DONG && tt && tt.cheDo !== 'deo' && !keo && !chonO && !canNhin && Math.abs(vX) < 2e-3 && performance.now() - lanCham > 4000; }
    var dangChay = false, truoc = 0, yen = 1, hatDong = false, camDat = false, cT = new V3(), nhin = new V3(), nhinT = new V3();
    function chay() { if (dangChay || !tt) return; dangChay = true; truoc = performance.now(); requestAnimationFrame(f); }
    function f(t) {
      var dt = Math.min(.05, (t - truoc) / 1000); truoc = t;
      if (!thay || document.hidden) { dangChay = false; return; }
      buoc(dt);
      R.render(canh, cam);
      if (V.khi.khung) V.khi.khung();
      /* đứng yên hẳn (không kéo, không lướt, con lắc tắt) → nghỉ vẽ cho đỡ tốn pin */
      var dong = keo || canNhin || hatDong || (!GIAM_DONG && tt.cheDo !== 'deo' && !chonO) ||   // thiết kế: chạy tiếp để tự xoay (kể cả lúc chờ 4 giây sau khi khách chạm) cam.position.distanceToSquared(cT) > 1e-6 || Math.abs(vX) > 1e-4 || (tt.cheDo === 'deo' && tuSpin) || vongChon.visible;
      DS.forEach(function (o) { if (o.e < 1 || o.ra || (o.treo && o.bT && o.b.distanceToSquared(o.bT) > 1e-9)) dong = true; });
      if (!dong) { yen++; if (yen > 90) { dangChay = false; return; } } else yen = 1;
      requestAnimationFrame(f);
    }
    function buoc(dt) {   // 1 bước mô phỏng: xoay, xếp hạt, đặt charm, máy ảnh (không vẽ)
      var deo = tt.cheDo === 'deo';
      if (!keo) {
        if (deo) { if (tuSpin) spin += dt * .35; }
        else if (canNhin && DS.get(canNhin.g) === canNhin && canNhin.dat) {   // đưa charm vừa gắn ra trước mặt
          var d = -(canNhin.a - PI / 2) - xoay; d = Math.atan2(Math.sin(d), Math.cos(d)); xoay += d * Math.min(1, dt * 3.2); vX = 0; if (Math.abs(d) < .01) canNhin = null; }
        else { vX *= Math.pow(.02, dt); xoay += vX; if (tuQuay()) xoay += dt * .3; }
        ngThem *= Math.pow(.4, dt);
      }
      var kq = xep(dt);
      if (deo) {
        /* nhìn chéo từ phía khuỷu tay về bàn tay (như tự ngắm cổ tay mình): vòng hiện thành hình bầu dục, bàn tay ở phía sau */
        var xc = kq.xw - .35 - kq.rH - (tt.L - 1) * kq.buoc / 2, kc = 10 + kq.BKmax * 3.1, az = -.62, el = .42 + ngThem;
        nhinT.set(xc + .5, -.25, 0); cT.set(nhinT.x + kc * Math.sin(az) * Math.cos(el), nhinT.y + kc * Math.sin(el), kc * Math.cos(az) * Math.cos(el));
      } else {
        quay.rotation.y = xoay; nghieng.rotation.x = .9 + ngThem;
        // máy ảnh đứng yên theo cỡ tay lớn (~19 cm) → đổi cỡ tay thấy vòng to / nhỏ thật; vòng to hơn thế mới lùi ra
        var bk = BKm[tt.vongDang] || 3; nhinT.set(0, -.55, 0); cT.set(0, 0, 7 + Math.max(bk, 3.1) * 3.3);
      }
      var mc = Math.min(1, dt * 5); cam.position.lerp(cT, camDat ? mc : 1); nhin.lerp(nhinT, camDat ? mc : 1); cam.lookAt(nhin); camDat = true;
      nghieng.updateMatrixWorld(true); deoG.updateMatrixWorld(true);
      datCharm(dt);
      /* vòng chọn quanh charm đang chọn */
      if (chonO && DS.get(chonO.g) === chonO && !deo) { vongChon.visible = true; chonO.giu.localToWorld(vongChon.position.copy(chonO.tam)); vongChon.scale.setScalar(Math.max(.8, chonO.ban * .1 * chonO.k * 2.6)); vongChon.material.rotation += dt * .6; }
      else vongChon.visible = false;
    }

    /* ---------- toạ độ màn hình của charm (để đặt bong bóng thông tin) ---------- */
    function viTri(g) {
      var o = DS.get(g); if (!o) return null;
      var p = o.giu.localToWorld(o.tam.clone()).project(cam), rc = cv.getBoundingClientRect(), rs = san.getBoundingClientRect();
      return [(p.x + 1) / 2 * rc.width + rc.left - rs.left, (1 - p.y) / 2 * rc.height + rc.top - rs.top, (1 - p.y) / 2 < .5];
    }
    /* ảnh chụp vòng hiện tại (gửi thiết kế, vòng thu nhỏ, hộp lưu) */
    function anh() {   // vòng đang khuất màn hình thì vòng lặp đã nghỉ → tua mô phỏng cho charm rơi xong, con lắc yên rồi mới chụp
      if (!dangChay && tt) for (var i = 0; i < 80; i++) buoc(.05);
      var v = vongChon.visible; vongChon.visible = false; R.render(canh, cam); vongChon.visible = v; return cv; }

    var V = window.V3D = { ve: ve, viTri: viTri, anh: anh, bien: function (id) { return (X.bien || {})[id] || null; }, khi: {} };
    document.querySelector('.tk-san').classList.add('co-3d');
    dispatchEvent(new Event('vong3d'));
  }
})();
