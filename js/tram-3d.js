/* Trang Trầm hương — mô hình 3D sản phẩm theo ảnh thật (three.js). CSS: css/tram-3d.css
   - 6 khung .th-gt-anh của 6 dòng (co-tam, khong-tam, nu-tram, tram-thien, nhang-vong, ram-tram): nét vẽ SVG mờ dần, mô hình 3D hiện thay.
   - TIẾT KIỆM: một WebGLRenderer + một canvas dùng chung, canvas dời vào khung đang nằm trong màn hình nhiều nhất;
     mô hình dựng lười (lần đầu cần mới dựng) rồi giữ lại; chỉ vẽ khi khung trong màn hình và tab đang hiện;
     sau 8 giây không ai chạm → 30 khung/giây, sau 30 giây → chậm dần rồi dừng hẳn (chạm / kéo / cuộn tới dòng khác thì chạy lại).
     pixelRatio tối đa 1,5 (điện thoại 1,25). Rời khung thì để lại ảnh chụp khung cuối (không nháy về nét vẽ).
   - Không WebGL / three tải lỗi → giữ nguyên nét vẽ. Giảm chuyển động → vẽ 1 khung tĩnh (kéo tay vẫn xoay được), không khói bay, không tự xoay.
   - Đơn vị 1 = 1 cm, kích thước theo cỡ thật ghi trong data/tram-dot.json và ảnh sản phẩm. Hộp/khay: trơn màu + hoạ tiết đơn giản, không chữ, không nhãn hiệu. */
(function () {
  'use strict';
  var IDS = ['co-tam', 'khong-tam', 'nu-tram', 'tram-thien', 'nhang-vong', 'ram-tram'];
  var DS = [];
  IDS.forEach(function (id) {
    var s = document.getElementById(id), f = s && s.querySelector('.th-gt-anh');
    if (f) DS.push({ id: id, sec: s, fig: f, toi: s.classList.contains('toi'), tl: 0 });
  });
  if (!DS.length || !('IntersectionObserver' in window)) return;
  try { var thu = document.createElement('canvas'), gl = thu.getContext('webgl2') || thu.getContext('webgl'); if (!gl) return; var mat = gl.getExtension('WEBGL_lose_context'); if (mat) mat.loseContext(); } catch (er) { return; }   // thử xong trả ngữ cảnh ngay
  var GIAM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHUP = /[?&]chup=1/.test(location.search);
  var DT = matchMedia('(pointer:coarse)').matches || Math.min(screen.width, screen.height) < 600;

  /* chỉ tải three khi khung đầu tiên sắp cuộn tới */
  var daTai = false;
  var ioTai = new IntersectionObserver(function (es) {
    if (daTai || !es.some(function (e) { return e.isIntersecting; })) return;
    daTai = true; ioTai.disconnect();
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js').then(batDau).catch(function (er) { console.warn('tram-3d: không tải được three', er); });
  }, { rootMargin: CHUP ? '100000px 0px' : '60% 0px' });
  DS.forEach(function (o) { ioTai.observe(o.fig); });

  function batDau(THREE) {
    var PI = Math.PI, V3 = THREE.Vector3;
    var R;
    try {
      R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: DT ? 'low-power' : 'default' });
    } catch (er) { console.warn('tram-3d: không tạo được WebGL', er); return; }
    R.setPixelRatio(Math.min(devicePixelRatio || 1, DT ? 1.25 : 1.5));
    R.outputColorSpace = THREE.SRGBColorSpace;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.12;
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.setClearColor(0x000000, 0);
    var cv = R.domElement; cv.className = 'tram-3d-cv';
    cv.setAttribute('role', 'img');
    var goi = document.createElement('span'); goi.className = 'tram-3d-goi'; goi.setAttribute('aria-hidden', 'true');
    goi.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M4 12h16"/></svg>Kéo để xoay';

    /* ---------- phòng chụp: hộp đèn ấm → kim loại, men sứ bóng thật ---------- */
    var envTex = (function () {
      var env = new THREE.Scene();
      env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 24, 12), new THREE.MeshBasicMaterial({ color: 0x51483f, side: THREE.BackSide })));
      function den(w, h, mau, x, y, z) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: mau, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); }
      den(14, 7, 0xfff0d8, -7, 11, 6); den(8, 11, 0xfff8ee, 12, 3, 5); den(20, 3, 0xffd9a8, 0, -9, -10); den(7, 7, 0xd8e6f0, -12, -1, -5);
      den(10, 10, 0xfff3e0, 0, 15, -2); den(9, 5, 0xffffff, 3, 6, 14); den(26, 14, 0x9c8160, 0, -15, 4);
      var pm = new THREE.PMREMGenerator(R), t = pm.fromScene(env, .04).texture; pm.dispose(); return t;
    })();

    /* ---------- vân bột trầm: hạt nhám (dùng cho map + bump, màu nhân theo vật liệu) ---------- */
    function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
    var R0 = rnd(20261128);
    function canvasTex(w, h, ve, mau) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; ve(c.getContext('2d', { willReadFrequently: true }), w, h);
      var t = new THREE.CanvasTexture(c); if (mau !== false) t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
    }
    var hatTex = canvasTex(256, 256, function (g, w, h) {
      var d = g.createImageData(w, h), r = rnd(7);
      for (var i = 0; i < w * h; i++) {
        var v = 222 + (r() - .5) * 44;
        var q = r(); if (q < .05) v -= 50 + r() * 40; else if (q > .965) v += 26;
        v = Math.max(0, Math.min(255, v)); d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255;
      }
      g.putImageData(d, 0, 0);
      g.globalAlpha = .18; g.filter = 'blur(1.2px)'; g.drawImage(g.canvas, 0, 0); g.filter = 'none'; g.globalAlpha = 1;
    });
    function bot(hex, ru, rv, o) {   // vật liệu bột trầm nén: nhám, hạt li ti
      o = o || {};
      var t = hatTex.clone(); t.repeat.set(ru || 1, rv || 1); t.needsUpdate = true;
      return new THREE.MeshStandardMaterial({ color: hex, map: t, bumpMap: t, bumpScale: o.bump || 1.4, roughness: o.rough || .93, metalness: 0, envMapIntensity: .8 });
    }
    function tron(hex, rough, o) { var m = new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: rough === undefined ? .6 : rough, metalness: 0, envMapIntensity: .7 }, o || {})); return m; }
    var VANG = new THREE.MeshStandardMaterial({ color: 0xd8ad5c, metalness: 1, roughness: .26, envMapIntensity: 1.25 });
    var DO_LUA = new THREE.MeshStandardMaterial({ color: 0x3a2a22, emissive: 0xff6a1a, emissiveIntensity: 2.2, roughness: .9 });
    var TRO = bot(0x7a756f, 1, 1, { rough: 1 });

    function luoi(geo, mat, bong) { var m = new THREE.Mesh(geo, mat); m.castShadow = bong !== false; m.receiveShadow = true; return m; }
    function tien(pts, n, mat) { return luoi(new THREE.LatheGeometry(pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }), n || 48), mat); }

    /* đầu que đang cháy: đoạn tro xám + vành than hồng; trả về điểm khói */
    function dauChay(g, r, y, truc) {
      var tro = luoi(new THREE.CylinderGeometry(r * .82, r * .97, r * 2.2, 10), TRO); tro.position.y = y + r * 1.1; g.add(tro);
      var than = luoi(new THREE.CylinderGeometry(r * 1.01, r * 1.01, r * .5, 10), DO_LUA, false); than.position.y = y + r * .1; g.add(than);
      var dinh = new THREE.Object3D(); dinh.position.y = y + r * 2.3; g.add(dinh); return dinh;
    }

    /* ---------- khói: dải mảnh uốn lượn (shader), luôn quay mặt về máy ảnh quanh trục đứng ---------- */
    var KHOI_V = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    var KHOI_F = [
      'uniform float t; uniform float a; uniform float s; uniform vec3 mau; varying vec2 vUv;',
      'void main(){',
      '  float y = vUv.y;',
      '  float amp = 0.025 + 0.36 * y * y;',
      '  float x = 0.5 + amp * (0.55 * sin(y * 6.5 - t * 0.85 + s) + 0.3 * sin(y * 14.0 - t * 1.6 + s * 1.7) + 0.15 * sin(y * 27.0 - t * 2.5 + s * 0.6));',
      '  float w = 0.006 + 0.012 * y + 0.06 * y * y;',
      '  float aa = fwidth(vUv.x) * 1.2;',
      '  float d = abs(vUv.x - x);',
      '  float al = 1.0 - smoothstep(w * 0.25, w + aa, d);',
      '  al *= min(1.0, (w + aa) / (aa * 2.0 + 1e-5));',
      '  al *= smoothstep(0.0, 0.05, y) * (1.0 - smoothstep(0.3, 1.0, y));',
      '  al *= 0.7 + 0.3 * sin(y * 19.0 - t * 2.0 + s * 3.0);',
      '  gl_FragColor = vec4(mau, al * a);',
      '  #include <colorspace_fragment>',
      '}'].join('\n');
    function taoKhoi(c, toi, cao, rong, a) {
      var ms = [];
      [[0, 1], [2.7, .55]].forEach(function (k, i) {
        var m = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, a: { value: (a || 1) * (toi ? .5 : .62) * k[1] }, s: { value: k[0] + R0() * 6 }, mau: { value: new THREE.Color(toi ? 0xe9e2d4 : 0x737a80) } },
          vertexShader: KHOI_V, fragmentShader: KHOI_F, transparent: true, depthWrite: false, side: THREE.DoubleSide, extensions: { derivatives: true } });
        var g = new THREE.PlaneGeometry(rong, cao, 1, 1); g.translate(0, cao / 2, 0);
        var me = new THREE.Mesh(g, m); me.renderOrder = 5 + i; me.frustumCulled = false; c.scene.add(me); ms.push(me);
      });
      return ms;
    }

    /* ---------- bóng mềm dưới đồ (vết tối tròn mờ) ---------- */
    var bongTex = canvasTex(128, 128, function (g) { var gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(.5, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }, false);
    function vetBong(g, x, z, rx, rz, a) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ map: bongTex, transparent: true, opacity: a || .5, depthWrite: false }));
      m.rotation.x = -PI / 2; m.position.set(x, .012, z); m.renderOrder = 1; g.add(m); return m;
    }

    /* ================= 01 · TRẦM CÓ TĂM ================= */
    function hopXanhTex() {   // mặt hộp giấy dài: xanh lá, khung chỉ vàng, dải sóng nhiều màu ở một đầu (không chữ)
      return canvasTex(1024, 196, function (g, w, h) {
        var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#46a03f'); gr.addColorStop(1, '#368d35'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.fillStyle = '#2a7330'; g.fillRect(70, 26, w - 250, h - 52);
        g.strokeStyle = '#d9b45a'; g.lineWidth = 3; g.strokeRect(62, 18, w - 234, h - 36); g.lineWidth = 1.5; g.strokeRect(74, 30, w - 258, h - 60);
        var x0 = w - 160, mau = ['#f3ead2', '#2f6fb0', '#e8862f', '#c8322a', '#f3ead2', '#3a9dc4'];
        g.save(); g.beginPath(); g.rect(x0, 0, 160, h); g.clip();
        for (var r = 0; r < 6; r++) for (var c = -1; c < 4; c++) {
          var cx = x0 + c * 52 + (r % 2) * 26, cy = h + 8 - r * 34;
          for (var k = 0; k < 4; k++) { g.beginPath(); g.arc(cx, cy, 26 - k * 6.2, PI, 0); g.fillStyle = mau[(k + r) % mau.length]; g.fill(); }
        }
        g.restore();
        g.strokeStyle = '#d9b45a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0, h); g.stroke();
      });
    }
    function dungCoTam(c) {
      var g = new THREE.Group(), khoi = [];
      var THAN = bot(0xc4ad8a, 1, 30), CHAN = tron(0xa3262a, .55);
      /* đế đồng tròn có núm lỗ ở giữa (như ảnh) */
      var de = tien([[0, 0], [2.7, 0], [3.0, .1], [3.08, .42], [2.95, .5], [2.82, .24], [1.15, .2], [1.1, 1.3], [.98, 1.42], [0, 1.45]], 56, VANG); g.add(de);
      var lo = new THREE.MeshBasicMaterial({ color: 0x1a1208 });
      [[0, 0], [.5, 0], [-.5, 0], [.25, .43], [-.25, .43], [.25, -.43], [-.25, -.43]].forEach(function (p) { var m = new THREE.Mesh(new THREE.CircleGeometry(.1, 12), lo); m.rotation.x = -PI / 2; m.position.set(p[0], 1.452, p[1]); de.add(m); });
      vetBong(g, 0, 0, 3.8, 3.8, .45);
      /* 3 que cắm xoè nhẹ: chân tăm đỏ 7,5 cm, thân trầm, đầu đang cháy (dài 30 cm) */
      var L = 30, CH = 7.5;
      [[0, 0, 0, 0, L - 3], [-.5, 0, .14, .03, L - 5.5], [.25, .43, -.11, -.09, L - 1.5]].forEach(function (q) {
        var s = new THREE.Group(); s.position.set(q[0], .6, q[1]); s.rotation.set(q[3], 0, q[2]);
        var chan = luoi(new THREE.CylinderGeometry(.07, .07, CH, 8), CHAN); chan.position.y = CH / 2 - .6; s.add(chan);
        var dai = q[4] - CH;
        var than = luoi(new THREE.CylinderGeometry(.19, .2, dai, 12), THAN); than.position.y = CH - .6 + dai / 2; s.add(than);
        khoi.push({ o: dauChay(s, .19, CH - .6 + dai, 1), cao: 18, rong: 5 });
        g.add(s);
      });
      /* hộp giấy dài nằm phía sau + một bó que đặt trên nắp hộp */
      var hop = new THREE.Group(); hop.position.set(.3, 0, -4.4); hop.rotation.y = -.3; g.add(hop);
      var mt = hopXanhTex(), canh = tron(0x36883a, .62), canh2 = tron(0x2e7d33, .62);
      var mH = new THREE.MeshStandardMaterial({ map: mt, roughness: .58, envMapIntensity: .6 });
      var hp = luoi(new THREE.BoxGeometry(34, 3, 6.5), [canh2, canh2, mH, canh, canh, canh]); hp.position.y = 1.5; hop.add(hp);
      vetBong(hop, 0, 0, 19, 5.2, .5);
      var N = 0, pos = [];
      for (var i = -4; i <= 4; i++) for (var j = -4; j <= 4; j++) {
        var yy = j * .3, zz = i * .34 + (j % 2 ? .17 : 0);
        if (yy * yy / 1.0 + zz * zz / 2.2 <= 1 && yy > -.95) pos.push([yy + 1.0, zz]);
      }
      N = pos.length;
      var thanI = new THREE.InstancedMesh(new THREE.CylinderGeometry(.16, .16, 22.5, 8).rotateZ(PI / 2), bot(0xbca684, 1, 24), N);
      var chanI = new THREE.InstancedMesh(new THREE.CylinderGeometry(.07, .07, 7.5, 6).rotateZ(PI / 2), CHAN, N);
      thanI.castShadow = chanI.castShadow = true; thanI.receiveShadow = chanI.receiveShadow = true;
      var m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e3 = new THREE.Euler(), one = new V3(1, 1, 1), r = rnd(31);
      pos.forEach(function (p, k) {
        var lech = (r() - .5) * .5, xo = (r() - .5) * .04;
        e3.set(0, xo, (r() - .5) * .01); q4.setFromEuler(e3);
        var tam = new V3(-1.2 + lech, 3 + .16 + p[0], p[1]);
        var dir = new V3(1, 0, 0).applyQuaternion(q4);
        m4.compose(tam.clone().addScaledVector(dir, 0), q4, one); thanI.setMatrixAt(k, m4);
        m4.compose(tam.clone().addScaledVector(dir, 15), q4, one); chanI.setMatrixAt(k, m4);
        var sc = .9 + r() * .2; thanI.setColorAt(k, new THREE.Color(sc, sc * .99, sc * .97));
      });
      hop.add(thanI, chanI);
      return { g: g, khoi: khoi, goc0: -.25, cao: .3 };
    }

    /* ================= 02 · TRẦM KHÔNG TĂM ================= */
    function goTex(sang) {   // gỗ trắc/ cẩm lai nâu đen, vân dọc
      return canvasTex(512, 128, function (g, w, h) {
        g.fillStyle = sang ? '#47271d' : '#3e2219'; g.fillRect(0, 0, w, h); var r = rnd(sang ? 5 : 9);
        for (var i = 0; i < 70; i++) {
          var y = r() * h, a = .05 + r() * .14; g.strokeStyle = r() < .55 ? 'rgba(18,8,5,' + a * 1.6 + ')' : 'rgba(120,70,48,' + a + ')';
          g.lineWidth = .6 + r() * 2.2; g.beginPath(); g.moveTo(0, y);
          for (var x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * .012 + i) * 3 + (r() - .5) * 1.5);
          g.stroke();
        }
      });
    }
    function sen(cx, cy, s) {   // một bông sen chạm thủng: 5 cánh rời nhau + đài (mỗi phần là 1 lỗ riêng, không chồng nhau)
      var ps = [];
      function canh(x0, y0, x1, y1, bung) {
        var p = new THREE.Path(), mx = (x0 + x1) / 2, my = (y0 + y1) / 2, nx = -(y1 - y0), ny = x1 - x0, l = Math.hypot(nx, ny); nx /= l; ny /= l;
        p.moveTo(cx + x0 * s, cy + y0 * s);
        p.quadraticCurveTo(cx + (mx + nx * bung) * s, cy + (my + ny * bung) * s, cx + x1 * s, cy + y1 * s);
        p.quadraticCurveTo(cx + (mx - nx * bung) * s, cy + (my - ny * bung) * s, cx + x0 * s, cy + y0 * s);
        ps.push(p);
      }
      canh(0, -.2, 0, 1, .32); canh(-.22, -.24, -.8, .62, .24); canh(.22, -.24, .8, .62, .24); canh(-.36, -.42, -1.0, .06, .16); canh(.36, -.42, 1.0, .06, .16);
      var d = new THREE.Path(); d.moveTo(cx - .55 * s, cy - .62 * s); d.quadraticCurveTo(cx, cy - .95 * s, cx + .55 * s, cy - .62 * s); d.quadraticCurveTo(cx, cy - .74 * s, cx - .55 * s, cy - .62 * s); ps.push(d);
      return ps;
    }
    function dungKhongTam(c) {
      var g = new THREE.Group(), khoi = [];
      var GO = new THREE.MeshPhysicalMaterial({ map: goTex(), roughness: .42, clearcoat: .35, clearcoatRoughness: .5, envMapIntensity: .8 });
      var NI = new THREE.MeshStandardMaterial({ color: 0x151414, map: hatTex, roughness: 1, envMapIntensity: .2 });
      var Lk = 25, Wk = 4.6;
      /* khay: đế + vành, lòng lót nỉ đen, lỗ cắm đồng ở một đầu */
      var khay = new THREE.Group(); khay.position.set(0, 0, 1.6); khay.rotation.y = .1; g.add(khay);
      var de = luoi(new THREE.BoxGeometry(Lk, 1.0, Wk), GO); de.position.y = .5; khay.add(de);
      var vs = new THREE.Shape(); vs.moveTo(-Lk / 2, -Wk / 2); vs.lineTo(Lk / 2, -Wk / 2); vs.lineTo(Lk / 2, Wk / 2); vs.lineTo(-Lk / 2, Wk / 2); vs.closePath();
      var hl = new THREE.Path(), a = 10.7, b = 1.3, rr = .5; hl.moveTo(-a + rr, -b); hl.lineTo(a - rr, -b); hl.quadraticCurveTo(a, -b, a, -b + rr); hl.lineTo(a, b - rr); hl.quadraticCurveTo(a, b, a - rr, b); hl.lineTo(-a + rr, b); hl.quadraticCurveTo(-a, b, -a, b - rr); hl.lineTo(-a, -b + rr); hl.quadraticCurveTo(-a, -b, -a + rr, -b); vs.holes.push(hl);
      var vg = new THREE.ExtrudeGeometry(vs, { depth: .55, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2, curveSegments: 6 });
      vg.rotateX(-PI / 2); var vanh = luoi(vg, GO); vanh.position.y = 1.0; khay.add(vanh);
      var ni = luoi(new THREE.BoxGeometry(2 * a, .06, 2 * b), NI); ni.position.y = 1.08; khay.add(ni);
      var lo = tien([[0, 0], [.26, 0], [.26, .04], [.12, .04], [.12, -.3], [0, -.3]], 24, VANG); lo.position.set(-11.85, 1.56, 0); khay.add(lo);
      /* que trầm không tăm mảnh nằm trong khay, đầu xa đang cháy */
      var THAN = bot(0xc6b691, 1, 40, { bump: 1 });
      var que = new THREE.Group(); que.position.set(-11.85, 1.5, 0); que.rotation.z = -PI / 2 - .016; khay.add(que);
      var qt = luoi(new THREE.CylinderGeometry(.085, .09, 19.5, 8), THAN); qt.position.y = 19.5 / 2; que.add(qt);
      khoi.push({ o: dauChay(que, .085, 19.5), cao: 16, rong: 4.5 });
      [[8.0, .22], [8.5, -.25], [7.95, -.12]].forEach(function (p) { var t = luoi(new THREE.SphereGeometry(.07 + R0() * .05, 6, 4), TRO); t.scale.y = .5; t.position.set(p[0], 1.13, p[1]); khay.add(t); });
      vetBong(khay, 0, 0, 14.5, 3.4, .5);
      /* nắp khay: chạm thủng 6 bông sen + vòng tròn khắc ở giữa, đặt song song phía sau */
      var ns = vs.clone(); ns.holes = [];
      [-9.7, -6.85, -4.0, 4.0, 6.85, 9.7].forEach(function (x) { ns.holes = ns.holes.concat(sen(x, -.05, 1.18)); });
      var ng = new THREE.ExtrudeGeometry(ns, { depth: .7, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2, curveSegments: 8 });
      ng.rotateX(-PI / 2);
      /* nắp nằm song song phía sau khay (như ảnh), máy ảnh nhìn từ trên xuống thấy rõ hoa sen chạm thủng */
      var zn = -Wk / 2 - 2.0, nap = new THREE.Group(); nap.position.set(.4, 0, zn - Wk / 2); nap.rotation.y = -.03; khay.add(nap);
      ng.translate(0, 0, 0); var nm = luoi(ng, new THREE.MeshPhysicalMaterial({ map: goTex(true), roughness: .42, clearcoat: .35, clearcoatRoughness: .5, envMapIntensity: .8 })); nap.add(nm);
      var vk = luoi(new THREE.TorusGeometry(1.25, .05, 6, 48), tron(0x1e100c, .8), false); vk.rotation.x = PI / 2; vk.position.set(0, .77, 0); nap.add(vk);
      var vk2 = luoi(new THREE.TorusGeometry(.9, .035, 6, 40), tron(0x1e100c, .8), false); vk2.rotation.x = PI / 2; vk2.position.set(0, .77, 0); nap.add(vk2);
      /* ống giấy xanh ngọc nhạt đựng que nằm chéo phía trước: ống lót trắng + bó que mảnh ló ra một đầu */
      var zt = Wk / 2 + 3.0;
      var ong = new THREE.Group(); ong.position.set(-9.5, 1.3, zt + 1.2); ong.rotation.set(0, .13, -PI / 2); khay.add(ong);
      var XANH = tron(0xc4e59b, .62), SOC = tron(0x1f7a49, .4);
      var vo = luoi(new THREE.CylinderGeometry(1.3, 1.3, 19, 40, 1, true), XANH); vo.position.y = 9.5; ong.add(vo);
      var day = luoi(new THREE.CircleGeometry(1.3, 40), XANH); day.rotation.x = PI / 2; day.position.y = .001; ong.add(day);
      [.9, 1.35].forEach(function (y) { var s = luoi(new THREE.CylinderGeometry(1.31, 1.31, .16, 40, 1, true), SOC, false); s.position.y = y; ong.add(s); });
      var lot = luoi(new THREE.CylinderGeometry(1.2, 1.2, 4, 40, 1, true), tron(0xf4f1ea, .7, { side: THREE.DoubleSide })); lot.position.y = 19.5; ong.add(lot);
      var bq = [], rq = rnd(12);
      for (var i = 0; i < 70; i++) { var rr2 = Math.sqrt(rq()) * 1.05, an = rq() * PI * 2; bq.push([Math.cos(an) * rr2, Math.sin(an) * rr2]); }
      var qi = new THREE.InstancedMesh(new THREE.CylinderGeometry(.075, .075, 12, 5), bot(0xc6b691, 1, 20, { bump: .8 }), bq.length); qi.castShadow = true;
      var m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), one = new V3(1, 1, 1);
      bq.forEach(function (p, k) { q4.setFromEuler(new THREE.Euler(p[1] * .03, 0, -p[0] * .03)); m4.compose(new V3(p[0] * 1.0, 17.2 + rq() * .9, p[1]), q4, one); qi.setMatrixAt(k, m4); });
      ong.add(qi);
      var bo = vetBong(khay, 1.2, zt, 12.5, 1.9, .45); bo.rotation.z = .13;
      vetBong(khay, .4, zn - Wk / 2, 14.5, 3.2, .4);
      return { g: g, khoi: khoi, goc0: .25, cao: .78 };
    }

    /* ================= 03 · NỤ TRẦM ================= */
    function nuGeo(cao, rDay, khia) {   // nụ búp sen: đáy bằng có lỗ nhỏ, thân thuôn nhọn, khía dọc (ép khuôn)
      var P = [[0, .22], [.11, .22], [.11, 0], [.88, 0], [.97, .05], [1, .25], [.97, .55], [.88, .9], [.74, 1.3], [.57, 1.72], [.4, 2.15], [.25, 2.58], [.12, 2.98], [.04, 3.26], [0, 3.36]];
      var k = cao / 3.36, geo = new THREE.LatheGeometry(P.map(function (p) { return new THREE.Vector2(p[0] * rDay, p[1] * k); }), 48);
      var a = geo.attributes.position;
      for (var i = 0; i < a.count; i++) {
        var x = a.getX(i), z = a.getZ(i), y = a.getY(i), r = Math.hypot(x, z); if (r < 1e-4 || y < .01) continue;
        var th = Math.atan2(z, x), f = 1 - (khia || .07) * (1 - Math.pow(Math.abs(Math.cos(th * 4)), .6));
        a.setX(i, x * f); a.setZ(i, z * f);
      }
      geo.computeVertexNormals(); return geo;
    }
    function dungNu(c) {
      var g = new THREE.Group(), khoi = [];
      /* hộp giấy đỏ nắp nam châm mở ngửa, lót giấy trắng (15 × 9 × 4 cm) */
      var DO = tron(0xc8221d, .62, { envMapIntensity: .55 }), DO2 = tron(0xab1b17, .62);
      var hop = new THREE.Group(); hop.position.set(0, 0, -1.6); g.add(hop);
      var Lh = 15, Wh = 9, Hh = 4, t = .28;
      function tam(w, h, d, x, y, z, m) { var b = luoi(new THREE.BoxGeometry(w, h, d), m || DO); b.position.set(x, y, z); hop.add(b); return b; }
      tam(Lh, t, Wh, 0, t / 2, 0);
      tam(Lh, Hh, t, 0, Hh / 2, Wh / 2 - t / 2); tam(Lh, Hh, t, 0, Hh / 2, -Wh / 2 + t / 2);
      tam(t, Hh, Wh - 2 * t, Lh / 2 - t / 2, Hh / 2, 0); tam(t, Hh, Wh - 2 * t, -Lh / 2 + t / 2, Hh / 2, 0);
      tam(Lh - 2 * t - .05, .03, Wh - 2 * t - .05, 0, Hh - 2.0, 0, tron(0xf7f3ea, .8));
      var nap = new THREE.Group(); nap.position.set(0, Hh, -Wh / 2); nap.rotation.x = -1.72; hop.add(nap);
      var nb = luoi(new THREE.BoxGeometry(Lh + .1, t, Wh + .1), DO); nb.position.set(0, t / 2, Wh / 2 + .05); nap.add(nb);
      var nv = luoi(new THREE.BoxGeometry(Lh + .1, 1.1, t), DO2); nv.position.set(0, -.5, Wh + .1); nap.add(nv);
      vetBong(hop, 0, 0, 9.5, 6, .5);
      /* nụ nằm xếp trong hộp (40 × 8,6 mm), 2 lớp, đầu đuôi so le */
      var geo = nuGeo(4.0, .43, .1), rn = rnd(77), dsN = [];
      function datNu(cx, cy, cz, xoayY, nguoc, nghieng) {
        var q = new THREE.Quaternion().setFromEuler(new THREE.Euler(nghieng, xoayY, nguoc * PI / 2, 'YXZ')), dir = new V3(0, 1, 0).applyQuaternion(q);
        dsN.push({ p: new V3(cx, cy, cz).addScaledVector(dir, -2.0), q: q });
      }
      for (var hang = 0; hang < 12; hang++) for (var cot = 0; cot < 3; cot++)
        datNu(-4.55 + cot * 4.55 + (rn() - .5) * .7, 2.0 + .43 + (hang % 2) * .08, -3.55 + hang * .645, (rn() - .5) * .14, (hang + cot) % 2 ? 1 : -1, (rn() - .5) * .4);
      for (var k = 0; k < 15; k++)
        datNu(-4.8 + (k % 5) * 2.4 + (rn() - .5) * .8, 2.0 + .43 + .74, -3.0 + Math.floor(k / 5) * 3.0 + (rn() - .5) * .9, (rn() - .5) * 1.3, rn() < .5 ? 1 : -1, (rn() - .5) * .5);
      var NU = bot(0xb39067, 2, 2, { bump: 1.2 });
      var ni = new THREE.InstancedMesh(geo, NU, dsN.length); ni.castShadow = ni.receiveShadow = true;
      var one = new V3(1, 1, 1), m4 = new THREE.Matrix4();
      dsN.forEach(function (n, k) { m4.compose(n.p, n.q, one); ni.setMatrixAt(k, m4); var s = .88 + rn() * .2; ni.setColorAt(k, new THREE.Color(s, s * (.97 + rn() * .04), s * (.94 + rn() * .06))); });
      hop.add(ni);
      /* đĩa sứ trắng phía trước, một nụ đứng đang cháy */
      var dia = tien([[0, 0], [1.6, 0], [1.75, .05], [2.6, .36], [2.72, .46], [2.62, .5], [1.7, .2], [0, .17]], 56, new THREE.MeshPhysicalMaterial({ color: 0xf3efe6, roughness: .18, clearcoat: .7, envMapIntensity: .9 }));
      dia.position.set(2.6, 0, 5.6); g.add(dia); vetBong(g, 2.6, 5.6, 3.2, 3.2, .45);
      var nu1 = new THREE.Group(); nu1.position.set(2.6, .17, 5.6); g.add(nu1);
      var nm = luoi(nuGeo(3.2, .43, .1), NU); nm.scale.set(1, 1, 1); nu1.add(nm);
      var tro = luoi(new THREE.ConeGeometry(.16, .5, 10), TRO); tro.position.y = 3.2 + .05; nu1.add(tro);
      var than = luoi(new THREE.CylinderGeometry(.19, .2, .08, 10), DO_LUA, false); than.position.y = 3.0 - .08; nu1.add(than);
      var dinh = new THREE.Object3D(); dinh.position.y = 3.45; nu1.add(dinh); khoi.push({ o: dinh, cao: 13, rong: 4.2 });
      var nu2 = luoi(nuGeo(4.0, .43, .1), NU); nu2.position.set(-.3, .43, 6.0); nu2.rotation.set(0, .7, PI / 2 - .1); g.add(nu2);
      return { g: g, khoi: khoi, goc0: -.35, cao: .64 };
    }

    /* ================= 04 · TRẦM THIỀN ================= */
    /* đường tâm sợi trầm dò trên ảnh SP026578/2 (px ảnh cắt, cao 850 px = 40 mm): đầu tròn, thân, móc tay cuộn vào trong, vòng chân dài bên phải */
    var THIEN = [[300, 445], [345, 495], [430, 522], [515, 500], [570, 445], [580, 380], [545, 325], [470, 288], [395, 255],
      [375, 205], [388, 145], [365, 95], [310, 78], [255, 98], [228, 150], [240, 215], [262, 268],
      [220, 320], [150, 368], [105, 440], [108, 520], [160, 585], [228, 625],
      [215, 668], [150, 712], [108, 790], [122, 870], [185, 912], [270, 888], [370, 812], [470, 722], [570, 655], [680, 628], [752, 655], [772, 730], [732, 808], [640, 850], [528, 868]];
    function soiDet(pts, rong, day) {   // quét tiết diện chữ nhật bo góc dọc đường cong phẳng (XZ) → sợi trầm dẹt
      var cur = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), N = 420;
      var P = cur.getSpacedPoints(N), L = cur.getLength();
      var prof = [], rb = Math.min(rong, day) * .32, hw = rong / 2, hd = day / 2;
      [[hw - rb, hd - rb, 0], [-hw + rb, hd - rb, PI / 2], [-hw + rb, -hd + rb, PI], [hw - rb, -hd + rb, 1.5 * PI]].forEach(function (cn) {
        for (var k = 0; k <= 3; k++) { var a = cn[2] + k / 3 * PI / 2; prof.push([cn[0] + Math.cos(a) * rb, cn[1] + Math.sin(a) * rb]); }
      });
      var M = prof.length, pos = [], uv = [], idx = [];
      for (var i = 0; i <= N; i++) {
        var p = P[i], t = P[Math.min(N, i + 1)].clone().sub(P[Math.max(0, i - 1)]).normalize(), n = new V3(-t.z, 0, t.x);
        for (var j = 0; j <= M; j++) { var q = prof[j % M]; pos.push(p.x + n.x * q[0], p.y + q[1], p.z + n.z * q[0]); uv.push(i / N * L / .6, j / M); }
      }
      for (i = 0; i < N; i++) for (j = 0; j < M; j++) { var a0 = i * (M + 1) + j, b0 = a0 + M + 1; idx.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1); }
      [0, N].forEach(function (i, e) {   // nắp hai đầu
        var c0 = pos.length / 3, p = P[i]; pos.push(p.x, p.y, p.z); uv.push(0, 0);
        for (var j = 0; j < M; j++) { var a = i * (M + 1) + j, b = i * (M + 1) + j + 1; if (e) idx.push(c0, a, b); else idx.push(c0, b, a); }
      });
      var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
      geo.computeVertexNormals(); return { geo: geo, P: P };
    }
    function dungThien(c) {
      var g = new THREE.Group(), khoi = [];
      /* lư men ngọc (celadon) xanh xám nhạt, thân phình, miệng cuộn dày, hai quai tròn, ba chân; lòng phủ tro đen */
      var MEN = new THREE.MeshPhysicalMaterial({ color: 0x95ad98, roughness: .22, clearcoat: .7, clearcoatRoughness: .2, envMapIntensity: 1.0 });
      var lu = new THREE.Group(); g.add(lu);
      var y0 = .55;
      var ngoai = [[0, y0], [1.7, y0], [2.4, y0 + .12], [3.15, y0 + .55], [3.65, y0 + 1.2], [3.88, y0 + 1.95], [3.82, y0 + 2.6], [3.58, y0 + 3.15], [3.28, y0 + 3.5],
        [3.18, y0 + 3.66], [3.26, y0 + 3.82], [3.36, y0 + 3.98], [3.34, y0 + 4.14], [3.2, y0 + 4.26], [3.0, y0 + 4.28], [2.84, y0 + 4.18], [2.76, y0 + 4.0], [2.74, y0 + 3.6], [2.7, y0 + 3.3], [2.6, y0 + 3.05], [0, y0 + 3.05]];
      lu.add(tien(ngoai, 72, MEN));
      for (var k = 0; k < 3; k++) {
        var a = k / 3 * PI * 2 + PI / 6, ch = tien([[0, 0], [.34, .02], [.42, .22], [.4, .45], [.3, .62], [0, .64]], 20, MEN);
        ch.position.set(Math.cos(a) * 2.25, 0, Math.sin(a) * 2.25); lu.add(ch);
      }
      [-1, 1].forEach(function (s) { var q = luoi(new THREE.TorusGeometry(.5, .16, 12, 28), MEN); q.position.set(s * 3.72, y0 + 3.32, 0); lu.add(q); });
      var TROD = new THREE.MeshStandardMaterial({ color: 0x232325, map: hatTex, bumpMap: hatTex, bumpScale: 2, roughness: 1, envMapIntensity: .3 });
      TROD.map = hatTex.clone(); TROD.map.repeat.set(3, 3); TROD.map.needsUpdate = true;
      var tro = luoi(new THREE.CircleGeometry(2.78, 48), TROD); tro.rotation.x = -PI / 2; tro.position.y = y0 + 3.2; lu.add(tro);
      vetBong(g, 0, 0, 4.6, 4.6, .55);
      /* sợi trầm thiền 40 mm, dẹt 3,3 × 3 mm, nằm trên tro */
      var s = 4.0 / 850, pts = THIEN.map(function (p) { return new V3((p[0] - 430) * s, 0, (p[1] - 485) * s); });
      var so = soiDet(pts, .33, .28), TH = bot(0xb2a283, 3, 1, { bump: 2 });
      var mi = luoi(so.geo, TH); mi.position.y = y0 + 3.2 + .14; mi.rotation.y = .12; lu.add(mi);
      /* đuôi đang cháy: than hồng + khói */
      var cuoi = so.P[so.P.length - 1].clone().applyAxisAngle(new V3(0, 1, 0), .12);
      var than = luoi(new THREE.SphereGeometry(.17, 10, 8), DO_LUA, false); than.scale.set(1, .8, 1); than.position.set(cuoi.x, y0 + 3.34, cuoi.z); lu.add(than);
      var dinh = new THREE.Object3D(); dinh.position.set(cuoi.x, y0 + 3.45, cuoi.z); lu.add(dinh); khoi.push({ o: dinh, cao: 12, rong: 4 });
      return { g: g, khoi: khoi, goc0: 0, cao: .82, thap: true };
    }

    /* ================= 05 · NHANG VÒNG ================= */
    function dungVong(c) {
      var g = new THREE.Group(), khoi = [];
      var SOI = bot(0xd4bc9f, 60, 1, { bump: 1.2 });
      /* đế nhựa trong tròn có vành + vòng dây vàng nằm trên đế, cột dây vàng thẳng đứng, móc ở đỉnh */
      var NHUA = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .2, roughness: .04, metalness: 0, clearcoat: 1, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false });
      var de = tien([[0, .25], [4.1, .25], [4.4, .3], [4.55, 1.6], [4.45, 1.7], [4.3, 1.62], [4.2, .5], [0, .45]], 64, NHUA); de.castShadow = false; de.renderOrder = 3; g.add(de);
      var vd = luoi(new THREE.TorusGeometry(2.2, .05, 6, 64), VANG); vd.rotation.x = PI / 2; vd.position.y = .5; g.add(vd);
      var H = 15.5;
      var cot = luoi(new THREE.CylinderGeometry(.06, .06, H - .4, 8), VANG); cot.position.y = .45 + (H - .4) / 2; g.add(cot);
      var moc = luoi(new THREE.TorusGeometry(.35, .055, 6, 20, PI * 1.3), VANG); moc.position.set(.3, H + .1, 0); moc.rotation.z = -PI * .15; g.add(moc);
      var chan = luoi(new THREE.TorusGeometry(.7, .05, 6, 24), VANG); chan.rotation.x = PI / 2; chan.position.y = .52; g.add(chan);
      vetBong(g, 0, 0, 5.2, 5.2, .35);
      /* cuộn nhang treo xoè thành tháp chuông (ảnh SP026580/1): ~11 vòng, đỉnh hẹp tròn, đáy rộng 11 cm, cao ~12 cm */
      var vong = 11, pts = [], n = vong * 64, top = H - .25, cao = 11.0;
      for (var i = 0; i <= n; i++) {
        var t = i / n, a = t * vong * PI * 2;
        var r = .5 + 4.2 * Math.pow(t, .5) - .25 * t * t, y = top - cao * (.35 * t + .65 * t * t * (3 - 2 * t) * .92 + .08 * t * t);
        pts.push(new V3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      /* đầu trong cuộn ngược thành chữ S nhỏ móc vào móc treo */
      pts.unshift(new V3(.35, top + .25, .05), new V3(.15, top + .5, -.1));
      var cu = new THREE.CatmullRomCurve3(pts);
      var soi = luoi(new THREE.TubeGeometry(cu, n + 40, .16, 8, false), SOI); g.add(soi);
      var cuoi = pts[pts.length - 1], tt = cu.getTangent(1);
      var dau = new THREE.Group(); dau.position.copy(cuoi); dau.quaternion.setFromUnitVectors(new V3(0, 1, 0), tt); g.add(dau);
      var dinh = dauChay(dau, .16, 0);
      var tam = new THREE.Object3D(); tam.position.copy(cuoi); g.add(tam);
      khoi.push({ o: tam, cao: 13, rong: 4.4, a: .9 });
      return { g: g, khoi: khoi, goc0: .3, cao: .22 };
    }

    /* ================= 06 · RĂM TRẦM ================= */
    function luoiLoTex() {   // dải hoa văn thủng của lò đất (lỗ lục giác/tam giác xếp so le)
      return canvasTex(2048, 220, function (g, w, h) {
        g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#000';
        var cot = 56, dx = w / cot, hang = 6, dy = h / (hang + .4);
        for (var r = 0; r < hang; r++) for (var c = 0; c <= cot; c++) {
          var cx = c * dx + (r % 2 ? dx / 2 : 0), cy = dy * (r + .7), s = dx * .3;
          g.beginPath();
          for (var k = 0; k < 6; k++) { var a = PI / 6 + k * PI / 3; g.lineTo(cx + Math.cos(a) * s * 1.05, cy + Math.sin(a) * s * .95); }
          g.closePath(); g.fill();
          g.beginPath(); g.moveTo(cx + dx / 2, cy - s * .55); g.lineTo(cx + dx / 2 + s * .42, cy + s * .1); g.lineTo(cx + dx / 2 - s * .42, cy + s * .1); g.closePath(); g.fill();
        }
      }, false);
    }
    function manhGeo(r) {   // mảnh trầm vụn: mỏng, mép răng cưa, cong nhẹ
      var sh = new THREE.Shape(), n = 9, L = .7 + r() * .7, W = .35 + r() * .35;
      for (var i = 0; i < n; i++) { var a = i / n * PI * 2, k = .72 + r() * .38, x = Math.cos(a) * L / 2 * k, y = Math.sin(a) * W / 2 * k; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }
      sh.closePath();
      var geo = new THREE.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: false }), p = geo.attributes.position, cong = .25 + r() * .35;
      for (var j = 0; j < p.count; j++) { var x = p.getX(j); p.setZ(j, p.getZ(j) + cong * x * x); }
      geo.rotateX(-PI / 2); geo.computeVertexNormals(); return geo;
    }
    function manhTex() {
      return canvasTex(256, 256, function (g, w, h) {
        g.fillStyle = '#7a5532'; g.fillRect(0, 0, w, h); var r = rnd(3);
        for (var i = 0; i < 160; i++) { g.strokeStyle = r() < .5 ? 'rgba(40,18,6,' + (.15 + r() * .35) + ')' : 'rgba(196,158,108,' + (.1 + r() * .3) + ')'; g.lineWidth = 1 + r() * 4; var y = r() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + (r() - .5) * 20, w * .7, y + (r() - .5) * 20, w, y + (r() - .5) * 10); g.stroke(); }
      });
    }
    function dungRam(c) {
      var g = new THREE.Group(), khoi = [];
      var DAT = new THREE.MeshStandardMaterial({ color: 0x8b605a, map: hatTex, bumpMap: hatTex, bumpScale: .6, roughness: .82, envMapIntensity: .6 });
      /* lò xông đất nung nâu tím: đế gỗ tối, thân dưới thủng hoa văn, vai phẳng có gờ, giữa lõm đặt đĩa inox */
      var lo = new THREE.Group(); lo.position.set(-1.0, 0, .8); g.add(lo);
      var deGo = tien([[0, 0], [5.15, 0], [5.4, .12], [5.45, .55], [5.3, .78], [5.05, .82], [0, .82]], 64, new THREE.MeshPhysicalMaterial({ map: goTex(), roughness: .45, clearcoat: .3, envMapIntensity: .7 })); lo.add(deGo);
      var lt = luoiLoTex(); lt.minFilter = THREE.LinearFilter; lt.generateMipmaps = false; lt.repeat.set(1, 1);
      var vl = new THREE.MeshStandardMaterial({ color: 0x8b605a, alphaMap: lt, alphaTest: .5, roughness: .85, side: THREE.DoubleSide, envMapIntensity: .6 });
      var thanLo = luoi(new THREE.CylinderGeometry(4.9, 4.9, 3.15, 96, 1, true), vl); thanLo.position.y = 1.27 + 1.575; lo.add(thanLo);
      var chanLo = luoi(new THREE.CylinderGeometry(4.9, 4.95, .45, 96, 1, true), DAT); chanLo.position.y = .82 + .225; lo.add(chanLo);
      var long = luoi(new THREE.CylinderGeometry(4.55, 4.55, 3.6, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a1410, emissive: 0x5a2008, emissiveIntensity: .35, roughness: 1, side: THREE.BackSide }), false); long.position.y = .82 + 1.8; lo.add(long);
      var vai = tien([[4.9, .82 + 3.6], [4.9, 5.9], [4.98, 6.05], [5.02, 6.35], [4.92, 6.5], [4.72, 6.52], [4.55, 6.4], [4.35, 6.32], [3.1, 6.3], [2.55, 6.32], [2.32, 6.2], [2.22, 5.8], [0, 5.8]], 96, DAT); lo.add(vai);
      var nhan = luoi(new THREE.TorusGeometry(4.2, .035, 6, 96), DAT, false); nhan.rotation.x = PI / 2; nhan.position.y = 6.32; lo.add(nhan);
      var day = luoi(new THREE.CircleGeometry(4.9, 64), DAT); day.rotation.x = PI / 2; day.position.y = .83; lo.add(day);
      /* đĩa inox nhỏ + răm trầm */
      var INOX = new THREE.MeshStandardMaterial({ color: 0xc9ccce, metalness: 1, roughness: .32, envMapIntensity: 1.1 });
      var dia = tien([[0, 0], [1.82, 0], [1.98, .08], [2.06, .55], [2.15, .62], [2.1, .66], [1.94, .6], [1.86, .14], [0, .08]], 56, INOX); dia.position.y = 5.8; lo.add(dia);
      var mt = manhTex(), MANH = new THREE.MeshStandardMaterial({ map: mt, bumpMap: mt, bumpScale: 1, roughness: .72, envMapIntensity: .5 }), rm = rnd(41);
      for (var i = 0; i < 13; i++) {
        var m = luoi(manhGeo(rm), MANH), a = rm() * PI * 2, rr = Math.sqrt(rm()) * 1.25;
        m.position.set(Math.cos(a) * rr, 5.8 + .1 + rm() * .12, Math.sin(a) * rr); m.rotation.set((rm() - .5) * .35, rm() * PI * 2, (rm() - .5) * .35); lo.add(m);
      }
      var dinh = new THREE.Object3D(); dinh.position.set(.2, 6.1, 0); lo.add(dinh); khoi.push({ o: dinh, cao: 12, rong: 4.4, a: .75 });
      vetBong(lo, 0, 0, 6.6, 6.6, .55);
      /* hũ nhựa trong nắp vàng đựng răm, băng nhãn trơn xanh đá (không chữ) */
      var hu = new THREE.Group(); hu.position.set(4.6, 0, -6.0); g.add(hu);
      var NHUA = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .16, roughness: .05, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false });
      var vo = luoi(new THREE.CylinderGeometry(3.3, 3.3, 4.6, 64, 1, true), NHUA, false); vo.position.y = 2.3; vo.renderOrder = 3; hu.add(vo);
      var ruot = canvasTex(512, 128, function (g2, w, h) {
        g2.fillStyle = '#5a3416'; g2.fillRect(0, 0, w, h); var r = rnd(8);
        for (var i = 0; i < 420; i++) { var x = r() * w, y = r() * h, s = 6 + r() * 12; g2.save(); g2.translate(x, y); g2.rotate(r() * PI); g2.fillStyle = 'hsl(' + (24 + r() * 14) + ',' + (45 + r() * 25) + '%,' + (24 + r() * 26) + '%)'; g2.beginPath(); g2.ellipse(0, 0, s, s * .45, 0, 0, PI * 2); g2.fill(); g2.restore(); }
      });
      ruot.repeat.set(3, 1);
      var ru = luoi(new THREE.CylinderGeometry(3.18, 3.18, 3.9, 48), new THREE.MeshStandardMaterial({ map: ruot, bumpMap: ruot, roughness: .85, envMapIntensity: .4 })); ru.position.y = 2.0; hu.add(ru);
      var nhanT = canvasTex(1024, 128, function (g2, w, h) {
        g2.fillStyle = '#2f3f55'; g2.fillRect(0, 0, w, h); g2.strokeStyle = 'rgba(160,185,210,.22)'; g2.lineWidth = 1.5;
        for (var i = 0; i < 6; i++) for (var k = 1; k < 6; k++) { g2.beginPath(); g2.arc(i * 190 + 80, 64, k * 13, 0, PI * 2); g2.stroke(); }
        g2.strokeStyle = 'rgba(214,173,92,.8)'; g2.lineWidth = 3; g2.beginPath(); g2.moveTo(0, 6); g2.lineTo(w, 6); g2.moveTo(0, h - 6); g2.lineTo(w, h - 6); g2.stroke();
      });
      var nh = luoi(new THREE.CylinderGeometry(3.32, 3.32, 2.5, 64, 1, true), new THREE.MeshStandardMaterial({ map: nhanT, roughness: .5, envMapIntensity: .6 })); nh.position.y = 2.15; hu.add(nh);
      var gan = canvasTex(256, 32, function (g2, w, h) { for (var x = 0; x < w; x += 4) { g2.fillStyle = x % 8 ? '#bbb' : '#fff'; g2.fillRect(x, 0, 4, h); } }, false);
      gan.repeat.set(6, 1);
      var napVanh = luoi(new THREE.CylinderGeometry(3.42, 3.42, 1.0, 96, 1, true), new THREE.MeshStandardMaterial({ color: 0xd9ab52, metalness: 1, roughness: .3, bumpMap: gan, bumpScale: 1.5, envMapIntensity: 1.25 }));
      napVanh.position.y = 4.6 + .55; hu.add(napVanh);
      var nap = tien([[3.42, 1.05], [3.35, 1.18], [3.1, 1.22], [0, 1.22]], 72, VANG); nap.position.y = 4.6; hu.add(nap);
      vetBong(hu, 0, 0, 4.2, 4.2, .45);
      return { g: g, khoi: khoi, goc0: -.2, cao: .62, thap: true };
    }

    var DUNG = { 'co-tam': dungCoTam, 'khong-tam': dungKhongTam, 'nu-tram': dungNu, 'tram-thien': dungThien, 'nhang-vong': dungVong, 'ram-tram': dungRam };
    var TEN = { 'co-tam': 'Trầm có tăm: bó que nhang chân tăm đỏ cắm trên đế đồng, cạnh hộp giấy dài', 'khong-tam': 'Trầm không tăm: que trầm mảnh nằm trong khay gỗ lót nỉ, nắp chạm sen và ống giấy đựng que',
      'nu-tram': 'Nụ trầm búp sen xếp trong hộp đỏ, một nụ đang cháy trên đĩa sứ', 'tram-thien': 'Trầm thiền hình người ngồi thiền nằm trong lư men ngọc',
      'nhang-vong': 'Nhang vòng treo xoè thành tháp trên giá dây vàng', 'ram-tram': 'Răm trầm trong đĩa inox trên lò xông đất nung, cạnh hũ nắp vàng' };

    /* ---------- dựng cảnh (lười, có cache) ---------- */
    var CANH = {};
    function layCanh(o) {
      if (CANH[o.id]) return CANH[o.id];
      var c = { id: o.id, toi: o.toi, scene: new THREE.Scene(), cam: new THREE.PerspectiveCamera(26, .8, .5, 400) };
      c.scene.environment = envTex;
      var m = DUNG[o.id](c);
      c.xoay = new THREE.Group(); c.xoay.add(m.g); c.scene.add(c.xoay);
      c.goc = c.goc0 = m.goc0 || 0; c.v = 0; c.cao = m.cao || .4;
      /* đèn: trời ấm + đèn chính đổ bóng mềm + đèn phụ lạnh từ sau */
      c.scene.add(new THREE.HemisphereLight(0xfff3e0, 0x5c4a3a, o.toi ? .75 : .62));
      var d = new THREE.DirectionalLight(0xffe8c8, o.toi ? 2.5 : 2.2); c.scene.add(d, d.target); c.den = d;
      d.castShadow = true; d.shadow.mapSize.set(DT ? 512 : 1024, DT ? 512 : 1024); d.shadow.bias = -.0006; d.shadow.normalBias = .02; d.shadow.radius = 4;
      var d2 = new THREE.DirectionalLight(0xd6e4ff, o.toi ? .9 : .55); d2.position.set(9, 6, -12); c.scene.add(d2);
      /* nền hứng bóng (trong suốt, chỉ hiện bóng) */
      var nen = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: o.toi ? .42 : .2 }));
      nen.rotation.x = -PI / 2; nen.receiveShadow = true; c.scene.add(nen);
      /* bao: bán kính quanh trục xoay + chiều cao, để máy ảnh ôm vừa khi quay đủ vòng */
      c.xoay.updateMatrixWorld(true);
      var Rm = 0, ymin = 1e9, ymax = -1e9, v = new V3(), m4 = new THREE.Matrix4(), sp = new THREE.Sphere();
      c.xoay.traverse(function (x) {
        if (!x.isMesh || x.material.isMeshBasicMaterial) return;
        var p = x.geometry.attributes.position;
        if (x.isInstancedMesh) {
          if (!x.geometry.boundingSphere) x.geometry.computeBoundingSphere();
          for (var i = 0; i < x.count; i++) { x.getMatrixAt(i, m4); sp.copy(x.geometry.boundingSphere).applyMatrix4(m4).applyMatrix4(x.matrixWorld); Rm = Math.max(Rm, Math.hypot(sp.center.x, sp.center.z) + sp.radius); ymin = Math.min(ymin, sp.center.y - sp.radius); ymax = Math.max(ymax, sp.center.y + sp.radius); }
          return;
        }
        var buoc = Math.max(1, Math.floor(p.count / 1500));
        for (var j = 0; j < p.count; j += buoc) { v.fromBufferAttribute(p, j).applyMatrix4(x.matrixWorld); Rm = Math.max(Rm, Math.hypot(v.x, v.z)); ymin = Math.min(ymin, v.y); ymax = Math.max(ymax, v.y); }
      });
      c.R = Rm; c.y0 = Math.max(0, ymin); c.y1 = ymax; c.thap = m.thap;
      var Lm = Math.max(Rm, ymax);
      d.position.set(-.55 * Lm * 2, 1.15 * Lm * 2, .75 * Lm * 2); d.target.position.set(0, ymax * .3, 0);
      var sc = d.shadow.camera; sc.left = sc.bottom = -Lm * 1.25; sc.right = sc.top = Lm * 1.25; sc.near = .5; sc.far = Lm * 6; sc.updateProjectionMatrix();
      /* khói */
      c.khoi = [];
      if (!GIAM) m.khoi.forEach(function (k) { c.khoi.push({ o: k.o, ms: taoKhoi(c, o.toi, k.cao, k.rong, k.a) }); });
      CANH[o.id] = c; return c;
    }

    /* máy ảnh ôm vừa mô hình (trụ bán kính R, cao y0→y1) trong khung vòm 4:5: chừa phía trên cho vòm + khói */
    function vuaKhung(c, asp) {
      var cam = c.cam, el = c.cao, f = Math.tan(cam.fov * PI / 360);
      var d = new V3(0, Math.sin(el), Math.cos(el)), u = new V3(0, Math.cos(el), -Math.sin(el)), rt = new V3(1, 0, 0);
      var pts = []; for (var i = 0; i < 24; i++) { var a = i / 24 * PI * 2; pts.push(new V3(Math.cos(a) * c.R, c.y0, Math.sin(a) * c.R), new V3(Math.cos(a) * c.R, c.y1, Math.sin(a) * c.R)); }
      var MX = .9, TREN = c.thap ? .5 : .74, DUOI = -.9, ty = (c.y0 + c.y1) / 2, D = 50;
      function chieu(D, ty) {
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, T = new V3(0, ty, 0), r = new V3();
        pts.forEach(function (p) { r.copy(p).sub(T); var z = D - r.dot(d), x = r.dot(rt) / (z * f * asp), y = r.dot(u) / (z * f); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
        return [x0, x1, y0, y1];
      }
      for (var lap = 0; lap < 4; lap++) {
        var lo = 2, hi = 600;
        for (var k = 0; k < 30; k++) { var mid = (lo + hi) / 2, b = chieu(mid, ty); if (Math.max(-b[0], b[1]) <= MX && (b[3] - b[2]) <= (TREN - DUOI)) hi = mid; else lo = mid; }
        D = hi; var bb = chieu(D, ty), lech = (bb[2] + bb[3]) / 2 - (TREN + DUOI) / 2;
        ty += lech * D * f * .9;
      }
      cam.aspect = asp; cam.position.set(0, ty, 0).addScaledVector(d, D); cam.lookAt(0, ty, 0); cam.near = Math.max(.5, D - c.R * 3); cam.far = D + c.R * 3 + 40; cam.updateProjectionMatrix();
      c.asp = asp;
    }

    /* ---------- vòng vẽ ---------- */
    var dang = null, hienTab = !document.hidden, chay = false, raf = 0, tTruoc = 0, tCham = 0, tKhoi = 0, keo = null, lanDau = {};
    var W = 0, H = 0, soVe = 0;
    function doCo() {
      if (!dang) return;
      var w = dang.fig.clientWidth, h = dang.fig.clientHeight; if (!w || !h) return;
      if (w !== W || h !== H) { W = w; H = h; R.setSize(w, h, false); }
      var c = layCanh(dang); if (c.asp !== w / h) vuaKhung(c, w / h);
    }
    function ve(dt, now) {
      var c = layCanh(dang);
      if (!keo) {
        var ranh = now - tCham, cham = GIAM ? 0 : Math.max(0, Math.min(1, (30000 - ranh) / 2500));
        c.goc += (c.v + .2 * cham) * dt; c.v *= Math.exp(-dt * 3.2); if (Math.abs(c.v) < 1e-3) c.v = 0;
      }
      c.xoay.rotation.y = c.goc;
      if (!GIAM) tKhoi += dt;
      var p = new V3();
      c.khoi.forEach(function (k) {
        k.o.getWorldPosition(p);
        var ya = Math.atan2(c.cam.position.x - p.x, c.cam.position.z - p.z);
        k.ms.forEach(function (m) { m.position.copy(p); m.rotation.set(0, ya, 0); m.material.uniforms.t.value = tKhoi; });
      });
      R.render(c.scene, c.cam); soVe++;
      if (!lanDau[dang.id]) { lanDau[dang.id] = 1; dang.fig.classList.add('tram-3d-co'); void cv.offsetWidth; cv.classList.add('hien'); }
    }
    function vong(now) {
      raf = 0;
      if (!dang || !hienTab || !dang.thay) { chay = false; return; }
      var ranh = now - tCham, nhanh = ranh < 8000 || keo || Math.abs(layCanh(dang).v) > .01;
      if (!nhanh && now - tTruoc < 31) { raf = requestAnimationFrame(vong); return; }
      var dt = Math.min(.05, Math.max(0, (now - tTruoc) / 1000)); tTruoc = now;
      ve(dt, now);
      if (GIAM || (ranh > 32500 && !keo && layCanh(dang).v === 0)) { chay = false; return; }   // nghỉ hẳn: máy mát
      raf = requestAnimationFrame(vong);
    }
    function danhThuc(chamMoi) {
      if (chamMoi) tCham = performance.now();
      if (chay || !dang || !hienTab || !dang.thay) return;
      chay = true; tTruoc = performance.now(); raf = requestAnimationFrame(vong);
    }

    /* chụp khung cuối để lại trong khung cũ (không nháy về nét vẽ khi canvas dời đi) */
    function deLaiAnh(o) {
      if (!lanDau[o.id]) return;
      var c = CANH[o.id]; if (!c) return;
      R.render(c.scene, c.cam);
      var an = o.anh || (o.anh = document.createElement('canvas'));   // chép canvas 2D (GPU → GPU, không đọc điểm ảnh về CPU)
      an.className = 'tram-3d-anh'; an.setAttribute('aria-hidden', 'true');
      if (an.width !== cv.width || an.height !== cv.height) { an.width = cv.width; an.height = cv.height; }
      var g2 = an.getContext('2d'); g2.clearRect(0, 0, an.width, an.height); g2.drawImage(cv, 0, 0);
      if (!an.parentNode) o.fig.appendChild(an);
    }
    function chuyenToi(o) {
      if (dang === o) return;
      if (dang) deLaiAnh(dang);
      dang = o; W = H = 0;
      if (raf) { cancelAnimationFrame(raf); raf = 0; } chay = false;
      cv.classList.toggle('hien', !!lanDau[o.id]);
      cv.setAttribute('aria-label', TEN[o.id] + ' (mô hình 3D, kéo ngang để xoay)');
      o.fig.appendChild(cv); o.fig.appendChild(goi);
      goi.classList.remove('an');
      doCo(); ro.disconnect(); ro.observe(o.fig);
      if (o.thay) ve(0, performance.now());   // vẽ ngay khung đầu (không lộ khung cũ của dòng trước)
      danhThuc(true);
    }
    var ro = new ResizeObserver(function () { doCo(); if (!chay && dang) { if (GIAM) ve(0, performance.now()); else danhThuc(false); } });

    /* chọn khung đang nằm trong màn hình nhiều nhất */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var o = DS.find(function (x) { return x.fig === e.target; }); if (!o) return; o.tl = e.isIntersecting ? e.intersectionRatio : 0; o.thay = e.isIntersecting; });
      var tot = null; DS.forEach(function (o) { if (o.thay && (!tot || o.tl > tot.tl)) tot = o; });
      if (tot && tot !== dang) chuyenToi(tot);
      else if (dang && dang.thay) danhThuc(false);
    }, { threshold: [0, .1, .25, .4, .55, .7, .85, 1] });
    DS.forEach(function (o) { io.observe(o.fig); });
    document.addEventListener('visibilitychange', function () { hienTab = !document.hidden; if (hienTab) danhThuc(true); });

    /* ---------- kéo ngang để xoay (chuột: kéo ngay; cảm ứng: chỉ khi kéo ngang, kéo dọc để trang cuộn) ---------- */
    var x0, y0, xTr, tTr, quyet;
    cv.addEventListener('pointerdown', function (ev) {
      if (!dang || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
      x0 = xTr = ev.clientX; y0 = ev.clientY; tTr = performance.now(); quyet = ev.pointerType === 'mouse' ? 1 : 0;
      keo = { id: ev.pointerId }; layCanh(dang).v = 0;
      if (quyet) { cv.setPointerCapture(ev.pointerId); cv.classList.add('dang-keo'); }
      goi.classList.add('an'); danhThuc(true);
    });
    cv.addEventListener('pointermove', function (ev) {
      if (!keo || ev.pointerId !== keo.id) return;
      var dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!quyet) {
        if (Math.abs(dy) > 9 && Math.abs(dy) > Math.abs(dx)) { keo = null; return; }   // kéo dọc → để trang cuộn
        if (Math.abs(dx) > 7) { quyet = 1; try { cv.setPointerCapture(ev.pointerId); } catch (er) {} cv.classList.add('dang-keo'); }
        else return;
      }
      var c = layCanh(dang), now = performance.now(), b = (ev.clientX - xTr) * (3.6 / Math.max(260, W));
      c.goc += b; var dtt = Math.max(8, now - tTr); c.v = c.v * .4 + b / (dtt / 1000) * .6; xTr = ev.clientX; tTr = now;
      tCham = now; if (GIAM) ve(0, now); else danhThuc(false);
    });
    function tha(ev) {
      if (!keo || ev.pointerId !== keo.id) return;
      keo = null; cv.classList.remove('dang-keo');
      var c = dang && layCanh(dang); if (c) { if (performance.now() - tTr > 90) c.v = 0; c.v = Math.max(-4, Math.min(4, c.v)); if (GIAM) c.v = 0; }
      danhThuc(true);
    }
    cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', tha);

    /* ?chup=1: vẽ sẵn ảnh tĩnh mọi khung (chụp toàn trang) */
    if (CHUP) {
      DS.forEach(function (o) {
        var w = o.fig.clientWidth, h = o.fig.clientHeight; if (!w || !h) return;
        dang = o; R.setSize(w, h, false); var c = layCanh(o); vuaKhung(c, w / h); c.xoay.rotation.y = c.goc; lanDau[o.id] = 1; o.fig.classList.add('tram-3d-co');
        deLaiAnh(o);
      });
      dang = null;
    }

    window.__tram3d = {
      canh: CANH, THREE: THREE,
      cao: function (id, el) { var c = CANH[id]; if (c) { c.cao = el; vuaKhung(c, c.asp); if (dang && dang.id === id) ve(0, performance.now()); } },
      trangThai: function () { return { dang: dang && dang.id, chay: chay, soVe: soVe, dung: Object.keys(CANH), pr: R.getPixelRatio(), co: [W, H], giam: GIAM }; },
      goc: function (id, a, dungLai) { var c = CANH[id]; if (c) { c.goc = a == null ? c.goc0 : c.goc0 + a; c.v = 0; if (dungLai) tCham = -1e9; if (dang && dang.id === id) ve(0, performance.now()); } }
    };
  }
})();
