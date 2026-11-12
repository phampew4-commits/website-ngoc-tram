/* Khối "Tự thiết kế" ở trang chủ: vòng chuỗi 3D (three.js) minh hoạ 3 bước
   01 chọn dây (đổi màu/cỡ hạt) · 02 nhập cỡ tay (vòng nở/co, đổi số hạt) · 03 gắn charm vàng (rơi vào, trượt trên dây).
   Không có WebGL / không tải được three → giữ hình SVG cũ. */
(function () {
  var sec = document.getElementById('tuThietKe');
  if (!sec) return;
  var the = sec.querySelector('.tk-vong3d'), cv = sec.querySelector('.tk-3d'), nhan = sec.querySelector('.tk-nhan');
  var nut = [].slice.call(sec.querySelectorAll('.tk-buoc button'));
  var GIAM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TG = 5200;   // thời gian mỗi bước (ms)

  // ---------- dữ liệu dây (màu thật từ kho) ----------
  // màu chuỗi: phỉ thuý xanh lục đế (imperial green) — bước 01 minh hoạ đổi cỡ hạt
  var LUC_DE = ['#2ec46c', '#056b36'];
  var DAY = [6, 8, 7].map(function (co) { return { ten: 'Phỉ thuý xanh lục đế ' + co + ' ly', co: co, mau: LUC_DE }; });
  var soCharm = 0;
  (window.taiJson ? taiJson('thiet-ke.json') : fetch('thiet-ke.json').then(function (r) { return r.json(); })).then(function (d) {
    soCharm = (d.charm || []).length;
    var a = sec.querySelector('[data-dem="day"]'), b = sec.querySelector('[data-dem="charm"]');
    if (a && d.day) a.textContent = d.day.length + ' loại dây';
    if (b && soCharm) b.textContent = soCharm + ' mẫu charm vàng';
  }).catch(function () {});

  // ---------- trạng thái chung (dùng cả khi không có 3D) ----------
  var daDoi = false, buoc = 0, batDau = performance.now(), dayI = 0, coTay = 15.5, dangKeo = false;
  var khoaNhan = '';
  function chu(nho, lon, khoa) {   // khoa: chỉ chạy hiệu ứng khi đổi bước / đổi dây, không chạy khi số cỡ tay nhảy
    if (!nhan) return;
    var b = nhan.querySelector('b'), s = nhan.querySelector('small');
    if (b.textContent === lon && s.textContent === nho) return;
    if (khoa !== khoaNhan) { khoaNhan = khoa; nhan.classList.remove('doi'); void nhan.offsetWidth; nhan.classList.add('doi'); }
    s.textContent = nho; b.textContent = lon;
  }
  function soHat(day, cm) { return Math.max(14, Math.min(42, Math.round((cm * 10 + 15) / day.co))); }
  function datBuoc(i, tay) {
    buoc = i; batDau = performance.now(); daDoi = false;
    nut.forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); b.style.setProperty('--tg', (GIAM || tay ? 0 : TG) + 'ms'); });
    the.dataset.buoc = i;
    if (i === 0) dayI = (dayI + 1) % DAY.length;
    if (tay) tuChay = false;   // bấm tay → dừng tự chạy để người xem nhìn kỹ
  }
  var tuChay = !GIAM;
  nut.forEach(function (b, k) { b.addEventListener('click', function () { datBuoc(k, true); }); });
  datBuoc(0);

  function capNhatChu(t) {   // nhãn dưới vòng theo bước
    var d = DAY[dayI];
    if (buoc === 0) chu('Dây ngọc', d.ten, '0' + dayI);
    else if (buoc === 1) chu('Cỡ tay ' + coTay.toFixed(1).replace('.', ',') + ' cm', soHat(d, coTay) + ' hạt · ' + d.co + ' ly', '1');
    else chu('Charm vàng', 'Kéo charm tới đúng chỗ bạn muốn', '2');
  }
  function nhip(t) {   // đồng hồ chung: đổi bước, đổi dây, cỡ tay
    var tg = t - batDau;
    if (tuChay && !dangKeo && tg > TG) datBuoc((buoc + 1) % 3);
    if (buoc === 0 && tg > TG / 2 && !daDoi) { dayI = (dayI + 1) % DAY.length; daDoi = true; }   // mỗi bước 01 đổi 2 dây
    if (buoc === 1) coTay = 15.5 + 2.2 * Math.sin(tg / TG * Math.PI * 2);
    else coTay += (15.5 - coTay) * .08;
    capNhatChu(t);
  }

  // ---------- 3D ----------
  var coWebGL = (function () { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  if (!coWebGL || !cv) { (function chay(t) { nhip(t); requestAnimationFrame(chay); })(performance.now()); return; }

  var daTai = false;
  function tai() {
    if (daTai) return; daTai = true;
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js').then(dung).catch(function (e) { console.warn('tk-3d', e);
      (function chay(t) { nhip(t); requestAnimationFrame(chay); })(performance.now());
    });
  }
  // chỉ tải three khi khối sắp vào màn hình
  if ('IntersectionObserver' in window) {
    var io0 = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io0.disconnect(); tai(); } }, { rootMargin: '600px 0px' });
    io0.observe(sec);
  } else tai();
  setTimeout(tai, 4000);

  function dung(THREE) {
    var R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    R.outputColorSpace = THREE.SRGBColorSpace;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.2;
    var canh = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(30, 1, .1, 100);
    cam.position.set(0, 0, 14);

    // môi trường phản chiếu tự dựng (studio ấm) — cho vàng và ngọc bóng thật
    (function () {
      var env = new THREE.Scene();
      var vo = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.MeshBasicMaterial({ color: 0x1a2a33, side: THREE.BackSide }));
      env.add(vo);
      function den(w, h, mau, x, y, z) {
        var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: mau, side: THREE.DoubleSide }));
        m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
      }
      den(14, 6, 0xfff1d6, -6, 10, 6);   // softbox trên trái
      den(8, 10, 0xffffff, 12, 2, 4);    // bên phải
      den(20, 3, 0xffd9a0, 0, -8, -10);  // viền ấm phía sau
      den(6, 6, 0xbfe8ff, -12, -2, -4);
      den(10, 10, 0xfff6e6, 0, 14, -2);   // đèn trần cho vàng sáng
      den(6, 14, 0xffe2b0, -14, 4, 8);
      var pm = new THREE.PMREMGenerator(R);
      canh.environment = pm.fromScene(env, .035).texture;
    })();
    var den1 = new THREE.DirectionalLight(0xfff8ee, 1.5); den1.position.set(-4, 6, 8); canh.add(den1);
    var den2 = new THREE.DirectionalLight(0x9fd0ff, .5); den2.position.set(6, -3, -4); canh.add(den2);

    // vân ngọc: ảnh mây mờ vẽ bằng canvas
    function vanNgoc() {
      var c = document.createElement('canvas'); c.width = 512; c.height = 256;
      var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 512, 256);
      for (var i = 0; i < 70; i++) {
        var x = Math.random() * 512, y = Math.random() * 256, r = 14 + Math.random() * 70, a = .04 + Math.random() * .1;
        var gr = g.createRadialGradient(x, y, 0, x, y, r);
        var sang = Math.random() < .25;
        gr.addColorStop(0, sang ? 'rgba(235,255,240,' + a * 2.4 + ')' : 'rgba(20,70,40,' + a * .8 + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        if (x < 60 || x > 452) { g.save(); g.translate(x > 256 ? -512 : 512, 0); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); }
      }
      g.strokeStyle = 'rgba(20,60,35,.06)'; g.lineWidth = 1;
      for (var k = 0; k < 6; k++) { g.beginPath(); var yy = Math.random() * 256; g.moveTo(0, yy); for (var xx = 0; xx <= 512; xx += 16) g.lineTo(xx, yy + Math.sin(xx / 40 + k) * 18 + (Math.random() - .5) * 6); g.stroke(); }
      var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
      return t;
    }

    var nghieng = new THREE.Group(), quay = new THREE.Group();
    nghieng.rotation.x = .95; nghieng.add(quay); canh.add(nghieng);

    // ---- hạt ngọc: InstancedMesh ----
    var MAX = 44, b0 = .3;
    var hatGeo = new THREE.SphereGeometry(1, 40, 28);
    var hatMat = new THREE.MeshPhysicalMaterial({ map: vanNgoc(), roughness: .1, clearcoat: 1, clearcoatRoughness: .04, sheen: .25, sheenRoughness: .4, sheenColor: new THREE.Color(0xd8ffe4), ior: 1.66, specularIntensity: 1 });
    hatMat.onBeforeCompile = function (s) {   // ánh sáng xuyên trong hạt: màu ngọc tự sáng, đậm ở tâm, nhạt ra mép
      s.fragmentShader = s.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' +
        'float tamHat = pow(clamp(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 1.6);\n' +
        'totalEmissiveRadiance += diffuseColor.rgb * (0.1 + 0.32 * tamHat);');
    };
    var hat = new THREE.InstancedMesh(hatGeo, hatMat, MAX);
    hat.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    quay.add(hat);
    var H = [];   // trạng thái từng hạt
    for (var i = 0; i < MAX; i++) {
      H.push({ p: new THREE.Vector3(), s: 0, c: new THREE.Color(0x9fd39a), r: Math.random(), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)) });
      hat.setColorAt(i, H[i].c);
    }
    // dây chun
    var day = new THREE.Mesh(new THREE.TorusGeometry(1, .025, 8, 160), new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: .6 }));
    day.rotation.x = Math.PI / 2; quay.add(day);

    // ---- charm vàng ----
    var vang = new THREE.MeshStandardMaterial({ color: 0xf3c76c, metalness: 1, roughness: .17 });
    var vangNham = new THREE.MeshStandardMaterial({ color: 0xeab963, metalness: 1, roughness: .3 });
    function charmVienNgoc() {   // hạt ngọc bọc viền vàng
      var g = new THREE.Group();
      var n = new THREE.Mesh(hatGeo, hatMat.clone()); n.material.color = new THREE.Color(0x1fae5c); n.scale.setScalar(.31); g.add(n);
      var v = new THREE.Mesh(new THREE.TorusGeometry(.33, .075, 24, 64), vang); v.rotation.x = Math.PI / 2; g.add(v);
      var v2 = new THREE.Mesh(new THREE.TorusGeometry(.27, .03, 12, 48), vang); v2.rotation.x = Math.PI / 2; v2.position.y = .2; g.add(v2);
      var v3 = v2.clone(); v3.position.y = -.2; g.add(v3);
      g.userData.rong = .78; return g;
    }
    function charmLu() {   // lu thống vàng chạm vân
      var pts = [], i;
      for (i = 0; i <= 40; i++) { var y = -.36 + .72 * i / 40, r = .2 + .1 * Math.cos(y / .36 * Math.PI / 2) + .018 * Math.sin(i * 1.9); pts.push(new THREE.Vector2(Math.max(.06, r), y)); }
      var m = new THREE.Mesh(new THREE.LatheGeometry(pts, 64), vangNham); m.rotation.z = Math.PI / 2;
      var g = new THREE.Group(); g.add(m);
      [-.36, .36].forEach(function (x) { var t = new THREE.Mesh(new THREE.TorusGeometry(.17, .035, 12, 40), vang); t.rotation.y = Math.PI / 2; t.position.x = x; g.add(t); });
      g.userData.rong = .82; return g;
    }
    function charmBiDua() {   // bi vàng múi dưa
      var geo = new THREE.SphereGeometry(.3, 64, 40), p = geo.attributes.position, v = new THREE.Vector3();
      for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); var a = Math.atan2(v.z, v.y); var k = 1 + .06 * Math.cos(a * 10); var r = Math.hypot(v.y, v.z); if (r > 1e-4) { v.y *= k; v.z *= k; } p.setXYZ(i, v.x, v.y, v.z); }
      geo.computeVertexNormals();
      var g = new THREE.Group(); g.add(new THREE.Mesh(geo, vang));
      g.userData.rong = .64; return g;
    }
    var C = [charmVienNgoc(), charmLu(), charmBiDua()].map(function (g, k) {
      quay.add(g); g.visible = false;
      return { g: g, hien: 0, cho: [.08, .42, .7][k], p: new THREE.Vector3(), tre: k * .45 };
    });

    // bóng mềm dưới vòng
    var bc = document.createElement('canvas'); bc.width = bc.height = 128;
    var bg = bc.getContext('2d'), gr = bg.createRadialGradient(64, 64, 20, 64, 64, 64);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.38, 'rgba(0,0,0,.05)'); gr.addColorStop(.47, 'rgba(0,0,0,.4)'); gr.addColorStop(.56, 'rgba(0,0,0,.05)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    bg.fillStyle = gr; bg.fillRect(0, 0, 128, 128);
    var bong = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, opacity: .6, depthWrite: false }));
    bong.rotation.x = -Math.PI / 2; bong.position.y = -.55; quay.add(bong);

    // ---- kéo để xoay ----
    var xoay = 0, vXoay = GIAM ? 0 : .0035, keo = null, nghiengThem = 0, diChuyen = 0;
    cv.addEventListener('pointerdown', function (e) { keo = { x: e.clientX, y: e.clientY }; diChuyen = 0; dangKeo = true; cv.setPointerCapture(e.pointerId); the.classList.add('dang-keo'); });
    cv.addEventListener('pointermove', function (e) {
      if (!keo) return;
      var dx = e.clientX - keo.x, dy = e.clientY - keo.y; keo.x = e.clientX; keo.y = e.clientY; diChuyen += Math.abs(dx) + Math.abs(dy);
      vXoay = dx * .006; xoay += dx * .008; nghiengThem = Math.max(-.5, Math.min(.45, nghiengThem + dy * .005));
    });
    function tha() { if (!keo) return; keo = null; dangKeo = false; the.classList.remove('dang-keo'); if (diChuyen < 6) location.href = 'thiet-ke.html'; }
    cv.addEventListener('pointerup', tha); cv.addEventListener('pointercancel', function () { keo = null; dangKeo = false; the.classList.remove('dang-keo'); });

    // ---- kích thước ----
    function coKhung() {
      var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
      R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    new ResizeObserver(coKhung).observe(cv); coKhung();

    // ---- vòng lặp: chỉ vẽ khi khối đang hiện trên màn ----
    var dangHien = true;
    new IntersectionObserver(function (es) { dangHien = es[0].isIntersecting; if (dangHien) loop(performance.now()); }, { rootMargin: '100px 0px' }).observe(cv);
    var m4 = new THREE.Matrix4(), sc = new THREE.Vector3(), mTam = new THREE.Color(), mDam = new THREE.Color(), tam = new THREE.Vector3();
    var bChay = b0, truoc = performance.now(), chayLoop = false;
    function loop(t) {
      if (chayLoop) return; chayLoop = true;
      (function f(t) {
        if (!dangHien || document.hidden) { chayLoop = false; return; }
        var dt = Math.min(.05, (t - truoc) / 1000); truoc = t;
        nhip(t);
        var d = DAY[dayI], tg = (t - batDau) / 1000;
        var n = soHat(d, coTay), bMuc = d.co / 20;   // bán kính hạt: 6 ly → .3
        bChay += (bMuc - bChay) * Math.min(1, dt * 5);
        mTam.set(d.mau[0]); mDam.set(d.mau[1]);

        // charm: bước 3 rơi vào lần lượt; bước khác bay lên ẩn đi; trượt nhẹ trên dây
        C.forEach(function (c, k) {
          // tiến độ tuyến tính + làm mượt (smoothstep): vào 0,8s; ra 1,2s, lần lượt từng charm (charm cuối ra trước)
          var vao = buoc === 2 && tg > .25 + c.tre, raCho = buoc !== 2 && tg > (2 - k) * .22;
          if (vao) c.hien = Math.min(1, c.hien + dt / .8);
          else if (raCho || buoc === 2) c.hien = Math.max(0, c.hien - dt / 1.2);
          c.ra = !vao;
          c.e = c.hien * c.hien * (3 - 2 * c.hien);

        });
        // xếp hạt + charm trên vòng theo chiều dài thật (charm chen giữa, đẩy hạt ra)
        var muc = [], i;
        for (i = 0; i < n; i++) muc.push({ hat: i, rong: 2 * bChay * 1.02, vt: i });
        var kc = bChay / b0;   // charm to nhỏ theo cỡ hạt
        C.forEach(function (c) { if (c.hien > 0) muc.push({ charm: c, rong: c.g.userData.rong * kc * c.e, vt: Math.round(c.cho * n) - .5 }); });
        muc.sort(function (a, b) { return a.vt - b.vt; });
        var L = 0; muc.forEach(function (m) { L += m.rong; });
        var BK = L / (Math.PI * 2), goc = 0;
        muc.forEach(function (m) {
          var a = (goc + m.rong / 2) / BK; goc += m.rong;
          tam.set(Math.cos(a) * BK, 0, Math.sin(a) * BK);
          var mu = Math.min(1, dt * 6);
          if (m.hat !== undefined) { var h = H[m.hat]; if (h.s < .02) h.p.copy(tam); else h.p.lerp(tam, mu); h.a = a; }
          else { if (m.charm.e < .02) m.charm.p.copy(tam); else m.charm.p.lerp(tam, mu); m.charm.a = Math.atan2(m.charm.p.z, m.charm.p.x); }
        });
        for (i = 0; i < MAX; i++) {
          var h = H[i], on = i < n;
          h.s += ((on ? bChay : 0) - h.s) * Math.min(1, dt * 6);
          h.c.lerp(mTam.clone().lerp(mDam, .25 + h.r * .5).offsetHSL((h.r - .5) * .025, .05, 0), Math.min(1, dt * 3.5));
          hat.setColorAt(i, h.c);
          sc.setScalar(Math.max(h.s, 1e-4));
          m4.compose(h.p, h.q, sc); hat.setMatrixAt(i, m4);
        }
        hat.instanceMatrix.needsUpdate = true; hat.instanceColor.needsUpdate = true;
        C.forEach(function (c) {
          c.g.visible = c.hien > 0;
          if (!c.g.visible) return;
          var e = c.e, roi = (1 - e) * (1 - e);
          if (c.ra) {   // rời đi: nhấc lên nhẹ, nghiêng chút, nhỏ dần rồi tan
            c.g.position.set(c.p.x, c.p.y + (1 - e) * 1.4, c.p.z);
            c.g.rotation.set(0, -c.a - Math.PI / 2, (1 - e) * .6);
            c.g.scale.setScalar(e * kc);
          } else {      // rơi vào: từ trên cao xuống, xoay nhẹ cho tới khi khớp dây
            c.g.position.set(c.p.x, c.p.y + roi * 4, c.p.z);
            c.g.rotation.set(0, -c.a - Math.PI / 2, roi * 2.5);   // trục charm dọc theo dây
            c.g.scale.setScalar((.6 + .4 * e) * kc);
          }
        });
        day.scale.setScalar(BK); bong.scale.setScalar(BK * 2.25);

        // xoay: tự quay chậm + quán tính khi kéo
        if (!keo) { vXoay += ((GIAM ? 0 : .0035) - vXoay) * Math.min(1, dt * 1.5); xoay += vXoay; nghiengThem *= .97; }
        quay.rotation.y = xoay;
        nghieng.rotation.x = .95 + nghiengThem + (GIAM ? 0 : Math.sin(t / 2600) * .04);
        nghieng.position.y = .35 + (GIAM ? 0 : Math.sin(t / 1900) * .08);   // nhích lên, chừa chỗ nhãn
        cam.position.z = 10.5 + BK * 2.3;
        R.render(canh, cam);
        requestAnimationFrame(f);
      })(t);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && dangHien) { truoc = performance.now(); loop(truoc); } });
    loop(performance.now());
    the.classList.add('co-3d');
  }
})();
