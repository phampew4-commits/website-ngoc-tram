/* Bản vẽ riêng từng charm, vẽ theo bộ ảnh thật (ưu tiên hơn bản phác chung trong charm-ve.js).
   Khoá = id charm. xo = kiểu xỏ thật xem từ ảnh: xuyen (lỗ xuyên ngang thân, xỏ như hạt) · ong (dây xuyên dọc trục) · treo (có khoen/móc).
   s = hình vẽ khung 200×200: xuyen tâm (100,100), dây ngang · ong trục ngang · treo điểm móc (100,10), thân thõng xuống.
   Token: {D} tô đá · {K} tô kim loại · {oD} viền đá · {oK} viền kim loại.  cung = dùng chung bản vẽ của charm khác. */
(function () {
  var K = '{K}', oK = '{oK}', D = '{D}', oD = '{oD}';
  function sang(x, y, rx, ry, xoay, op) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (op || .8) + '"' + (xoay ? ' transform="rotate(' + xoay + ' ' + x + ' ' + y + ')"' : '') + '/>'; }
  function lap(n, f) { var h = ''; for (var i = 0; i < n; i++) h += f(i); return h; }
  // khoen tròn: đỉnh ở (100,10)
  function khoen(r, day) { r = r || 11; return '<circle cx="100" cy="' + (10 + r) + '" r="' + r + '" fill="none" stroke="' + K + '" stroke-width="' + (day || 5) + '"/><circle cx="100" cy="' + (10 + r) + '" r="' + r + '" fill="none" stroke="' + oK + '" stroke-width=".8" opacity=".5"/>'; }
  // móc càng cua: đỉnh (100,10), đáy ~y=60 (khoen nối nhỏ)
  function mocCua() {
    return '<circle cx="100" cy="16" r="6" fill="none" stroke="' + K + '" stroke-width="3.5"/>' +
      '<path d="M100 22 C114 22 120 32 118 42 C116 50 108 54 100 54 C90 54 82 46 84 36 C86 28 92 22 100 22Z" fill="none" stroke="' + K + '" stroke-width="7"/>' +
      '<path d="M100 22 C114 22 120 32 118 42 C116 50 108 54 100 54 C90 54 82 46 84 36 C86 28 92 22 100 22Z" fill="none" stroke="' + oK + '" stroke-width="1" opacity=".6"/>' +
      '<path d="M86 32 L94 28" stroke="' + oK + '" stroke-width="2"/><rect x="114" y="34" width="8" height="5" rx="2" fill="' + K + '" stroke="' + oK + '" stroke-width="1"/>' +
      '<circle cx="100" cy="60" r="5" fill="none" stroke="' + K + '" stroke-width="3"/>';
  }
  // vòng hạt kim cương nhỏ quanh tâm
  function hatTron(cx, cy, r, n, rr) { return lap(n, function (i) { var a = i * 2 * Math.PI / n; return '<circle cx="' + (cx + r * Math.cos(a)).toFixed(1) + '" cy="' + (cy + r * Math.sin(a)).toFixed(1) + '" r="' + (rr || 3.4) + '" fill="#fff" stroke="#b9c4d0" stroke-width=".8"/>'; }); }
  // hạt kim cương rải dọc một đường cong (danh sách điểm)
  function hatDiem(ds, rr) { return ds.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (rr || 3.2) + '" fill="#fff" stroke="#b9c4d0" stroke-width=".8"/>'; }).join(''); }
  // hồ lô đứng, gốc khung 28..176 (cao 148) → đặt tâm trên (cx, top) với tỉ lệ s
  var HL = 'M100 28 C116 28 126 42 126 58 C126 72 117 79 119 86 C138 94 148 112 146 132 C144 158 124 176 100 176 C76 176 56 158 54 132 C52 112 62 94 81 86 C83 79 74 72 74 58 C74 42 84 28 100 28Z';
  function hoLo(top, s, them) { return '<g transform="translate(100 ' + top + ') scale(' + s + ') translate(-100 -28)"><path d="' + HL + '" fill="' + D + '" stroke="' + (them || oD) + '" stroke-width="' + (3 / s).toFixed(1) + '"/>' + sang(90, 54, 6, 11, -10) + '<path d="M72 140 C74 118 86 106 100 106" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".55"/></g>'; }

  var V = {};

  /* ===== đợt 1 ===== */
  // 1 · cỏ 4 lá lam ngọc 8×6,7 — lỗ xuyên ngang thân, mặt 4 lá tim ngửa lên
  V['26265'] = { xo: 'xuyen', s: (function () {
    var la = 'M100 96 C86 84 64 70 64 48 C64 32 80 24 92 34 C96 38 99 42 100 46 C101 42 104 38 108 34 C120 24 136 32 136 48 C136 70 114 84 100 96Z';
    return '<g fill="' + D + '" stroke="' + oD + '" stroke-width="3.5" stroke-linejoin="round">' + lap(4, function (i) { return '<path d="' + la + '" transform="rotate(' + (i * 90 + 45) + ' 100 100)"/>'; }) + '</g>' +
      '<g fill="none" stroke="' + oD + '" stroke-width="2.2" opacity=".35">' + lap(4, function (i) { return '<path d="M100 100 L100 58" transform="rotate(' + (i * 90 + 45) + ' 100 100)"/>'; }) + '</g>' +
      '<g fill="none" stroke="#fff" stroke-width="2.5" opacity=".5">' + lap(4, function (i) { return '<path d="M100 100 L100 40" transform="rotate(' + (i * 90) + ' 100 100)"/>'; }) + '</g>' +
      sang(70, 62, 10, 5, -45) + sang(140, 70, 5, 9, 30, .7) + sang(100, 100, 6, 4, 0, .5);
  })() };
  // 2 · hoa mai lam ngọc 8 ly — 5 cánh tròn, gân toả, nhuỵ nút tròn; xuyên ngang thân
  V['26267'] = { xo: 'xuyen', s: (function () {
    var c = 'M100 96 C86 86 72 68 74 50 C76 34 90 28 100 34 C110 28 124 34 126 50 C128 68 114 86 100 96Z';
    return '<g fill="' + D + '" stroke="' + oD + '" stroke-width="3.5" stroke-linejoin="round">' + lap(5, function (i) { return '<path d="' + c + '" transform="rotate(' + (i * 72) + ' 100 100)"/>'; }) + '</g>' +
      '<g fill="none" stroke="' + oD + '" stroke-width="1.8" opacity=".45">' + lap(15, function (i) { return '<path d="M100 84 L' + (i % 3 === 1 ? 100 : i % 3 ? 112 : 88) + ' 46" transform="rotate(' + (Math.floor(i / 3) * 72) + ' 100 100)"/>'; }) + '</g>' +
      '<circle cx="100" cy="100" r="15" fill="' + D + '" stroke="' + oD + '" stroke-width="3"/><circle cx="100" cy="100" r="7" fill="#fff" opacity=".35"/>' + sang(88, 44, 8, 4, -20) + sang(150, 82, 4, 8, 30, .6);
  })() };
  // 3 · túi tiền ngọc bích trên đế vàng chấu; lỗ xuyên ngang qua đế
  V['23139'] = { xo: 'xuyen', s:
    '<path d="M40 128 C40 150 56 162 100 162 C144 162 160 150 160 128 L150 120 L50 120Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M54 150 h92" stroke="' + oK + '" stroke-width="2" opacity=".5"/><circle cx="60" cy="146" r="5" fill="#3b2a12" opacity=".6"/><circle cx="140" cy="146" r="5" fill="#3b2a12" opacity=".6"/>' +
    '<path d="M72 64 C56 80 46 104 50 126 C56 146 80 150 100 150 C120 150 144 146 150 126 C154 104 144 80 128 64Z" fill="' + D + '" stroke="' + oD + '" stroke-width="3"/>' +
    '<path d="M64 46 C76 40 90 50 100 48 C110 50 124 40 136 46 C134 58 124 66 100 66 C76 66 66 58 64 46Z" fill="' + D + '" stroke="' + oD + '" stroke-width="3"/><path d="M74 64 Q100 74 126 64" fill="none" stroke="' + oD + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2" opacity=".45"><path d="M84 76 C78 96 78 118 86 140M116 76 C122 96 122 118 114 140M100 74 V146"/></g>' +
    '<g fill="' + K + '" stroke="' + oK + '" stroke-width="1.5"><path d="M50 118 l-6 -14 l12 8z"/><path d="M150 118 l6 -14 l-12 8z"/><path d="M98 150 l2 10 l2 -10z"/></g>' + sang(74, 92, 7, 16, 15) + sang(110, 54, 10, 4, 0, .6) };
  // 4 · hồ lô lam băng, viền ổ & khoen vàng 14K
  V['25641'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6" stroke-linecap="round"/>' + hoLo(46, .95, K) +
    '<g fill="' + K + '"><path d="M80 100 l6 -3 l-1 9z"/><path d="M120 100 l-6 -3 l1 9z"/><path d="M92 186 l8 5 l8 -5z"/></g>' };
  // 5 · hồ lô lam băng 18K: móc càng cua, viền vàng xoắn thừng hình giọt
  V['12782'] = { xo: 'treo', s: mocCua() +
    '<path d="M100 66 C130 70 152 104 152 138 C152 168 128 188 100 188 C72 188 48 168 48 138 C48 104 70 70 100 66Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M100 74 C124 78 144 108 144 138 C144 162 124 180 100 180 C76 180 56 162 56 138 C56 108 76 78 100 74Z" fill="none" stroke="' + oK + '" stroke-width="2.5" stroke-dasharray="3 3" opacity=".7"/>' +
    '<path d="M100 82 C120 86 136 110 136 136 C136 158 120 172 100 172 C80 172 64 158 64 136 C64 110 80 86 100 82Z" fill="#fff8e2"/>' + hoLo(88, .55) };
  // 6 · hồ lô băng trắng: móc càng cua, khung bát giác đính đá, hồ lô nằm trong
  V['25810'] = { xo: 'treo', s: mocCua() +
    '<path d="M70 70 H130 L150 92 V164 L130 186 H70 L50 164 V92Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M76 84 H124 L136 98 V158 L124 172 H76 L64 158 V98Z" fill="#fff8e2" stroke="' + oK + '" stroke-width="2"/>' +
    hatDiem([[70, 77], [85, 77], [100, 77], [115, 77], [130, 77], [57, 96], [57, 112], [57, 128], [57, 144], [57, 160], [143, 96], [143, 112], [143, 128], [143, 144], [143, 160], [70, 179], [85, 179], [100, 179], [115, 179], [130, 179]], 3) +
    hoLo(94, .48) };
  // 7 · hồ lô băng trắng: khung tròn vàng viền thừng, vòng đá, khoen tròn
  V['25783'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V44" stroke="' + K + '" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="100" cy="118" r="72" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="118" r="64" fill="none" stroke="' + oK + '" stroke-width="2.5" stroke-dasharray="4 3" opacity=".6"/>' +
    '<circle cx="100" cy="118" r="52" fill="#fff8e2" stroke="' + oK + '" stroke-width="2"/>' + hatTron(100, 118, 46, 14, 3.4) + hoLo(78, .5) };
  // 8 · đậu phúc lam băng: ổ vàng chạm lưới, mặt ngọc hình đậu; xuyên ngang qua viền lưới
  V['25785'] = { xo: 'xuyen', s:
    '<path d="M44 84 C40 62 62 50 84 56 C100 60 112 50 132 50 C156 50 168 68 162 92 C158 110 168 124 160 140 C150 156 120 156 100 148 C80 140 56 150 44 132 C36 118 48 102 44 84Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M54 86 C52 68 68 62 86 66 C100 70 112 60 130 60 C150 60 156 74 152 92 C148 108 158 122 150 134 C142 146 120 146 102 138 C84 130 64 140 54 126 C48 116 56 102 54 86Z" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    sang(84, 80, 16, 7, -10) + sang(132, 120, 10, 4, -20, .5) };
  // 9 · lu thống vàng 18K: khối vuông bo góc, mặt nhám hạt, dây xuyên dọc trục
  V['25890'] = { xo: 'ong', s:
    '<rect x="34" y="40" width="132" height="120" rx="30" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<rect x="48" y="58" width="104" height="84" rx="10" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55"/>' +
    lap(36, function (i) { var x = 58 + (i % 9) * 10.5, y = 68 + Math.floor(i / 9) * 20; return '<rect x="' + x + '" y="' + y + '" width="6" height="12" rx="2" fill="' + oK + '" opacity=".35"/>'; }) +
    '<rect x="38" y="46" width="124" height="10" rx="5" fill="#fff" opacity=".45"/>' };
  // 10 · cua (vòng hoa đính đá + chùm đồng xu, ngọc lam băng giữa), khoen
  V['25820'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V46" stroke="' + K + '" stroke-width="6"/>' +
    lap(12, function (i) { var a = i * Math.PI / 6, x = 100 + 62 * Math.cos(a), y = 118 + 62 * Math.sin(a); return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="13" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><rect x="' + (x - 4).toFixed(1) + '" y="' + (y - 4).toFixed(1) + '" width="8" height="8" fill="' + oK + '" opacity=".5"/>'; }) +
    '<circle cx="100" cy="118" r="48" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + hatTron(100, 118, 38, 14, 4) +
    '<circle cx="100" cy="118" r="22" fill="' + D + '" stroke="' + oK + '" stroke-width="2.5"/>' + sang(93, 110, 7, 4, -20) };
  // 11 · ngọc lam băng tròn: móc càng cua, viền ngọc trai nhỏ quanh mặt ngọc
  V['25804'] = { xo: 'treo', s: mocCua() + '<circle cx="100" cy="124" r="60" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    hatTron(100, 124, 50, 20, 5) + '<circle cx="100" cy="124" r="38" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="100" cy="124" r="30" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' + sang(90, 112, 9, 5, -25) };
  // 12 · hạt đậu lam băng chạm lá: ổ vàng bầu dục, hạt đá đỏ ở cổ, móc càng cua
  V['25800'] = { xo: 'treo', s: mocCua() + '<circle cx="100" cy="72" r="7" fill="#c4283f" stroke="' + oK + '" stroke-width="2"/>' +
    '<rect x="62" y="80" width="76" height="110" rx="36" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><rect x="70" y="88" width="60" height="94" rx="29" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.2" opacity=".55"><path d="M100 96 V176"/>' + lap(5, function (i) { var y = 104 + i * 15; return '<path d="M100 ' + (y + 8) + ' L80 ' + y + ' M100 ' + (y + 8) + ' L120 ' + y + '"/>'; }) + '</g>' + sang(84, 108, 5, 12, 0, .7) };

  /* ===== đợt 2 ===== */
  // ổ vàng viền lưới (gallery) — dùng cho các mặt ngọc xỏ xuyên qua thành lưới
  function luoi(path, them) { return '<path d="' + path + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + (them || ''); }
  function hatVienDuong(path, w) { return '<path d="' + path + '" fill="none" stroke="' + oK + '" stroke-width="' + (w || 2.4) + '" stroke-dasharray="1.5 4.5" stroke-linecap="round" opacity=".75"/>'; }
  // 13 · điếu (đĩa bình an) ngọc trắng: thanh vàng đính đá ngang tâm, khoen hai đầu → nằm dọc dây
  V['25146'] = { xo: 'ong', s:
    '<circle cx="100" cy="100" r="62" fill="' + D + '" stroke="' + oD + '" stroke-width="2.5"/><circle cx="100" cy="100" r="13" fill="#f4eee3" stroke="' + oD + '" stroke-width="2"/>' +
    sang(76, 74, 18, 8, -35) + sang(130, 136, 10, 4, -35, .5) +
    '<rect x="26" y="95" width="148" height="10" rx="5" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[44, 100], [56, 100], [68, 100], [132, 100], [144, 100], [156, 100]], 2.6) +
    '<circle cx="18" cy="100" r="9" fill="none" stroke="' + K + '" stroke-width="5"/><circle cx="182" cy="100" r="9" fill="none" stroke="' + K + '" stroke-width="5"/>' +
    '<circle cx="100" cy="100" r="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="100" cy="100" r="5" fill="#fff" stroke="#b9c4d0"/>' };
  // 14 · sen ngọc băng: hai đài sen ngọc trong treo dưới thanh vàng đính đá
  V['26266'] = { xo: 'treo', s: khoen(9) + '<rect x="92" y="26" width="16" height="44" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[100, 36], [100, 46], [100, 56]], 2.8) +
    '<path d="M100 70 L74 92 M100 70 L126 92" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/>' +
    [[72, -8], [128, 8]].map(function (p) { return '<g transform="rotate(' + p[1] + ' ' + p[0] + ' 92)"><path d="M' + (p[0] - 22) + ' 96 C' + (p[0] - 26) + ' 130 ' + (p[0] - 22) + ' 176 ' + p[0] + ' 180 C' + (p[0] + 22) + ' 176 ' + (p[0] + 26) + ' 130 ' + (p[0] + 22) + ' 96 Q' + p[0] + ' 86 ' + (p[0] - 22) + ' 96Z" fill="' + D + '" stroke="' + oD + '" stroke-width="2.5"/>' +
      '<g fill="' + oD + '" opacity=".35"><circle cx="' + (p[0] - 8) + '" cy="104" r="3"/><circle cx="' + (p[0] + 8) + '" cy="104" r="3"/><circle cx="' + p[0] + '" cy="112" r="3"/></g>' + sang(p[0] - 10, 140, 4, 16, 0, .6) + '</g>'; }).join('') };
  // 15 · dzi 9 mắt vàng: ống thuôn hai đầu, chạm các "mắt" tròn
  V['23908'] = { xo: 'ong', s: '<path d="M26 82 C26 66 44 56 70 54 L130 54 C156 56 174 66 174 82 L174 118 C174 134 156 144 130 146 L70 146 C44 144 26 134 26 118Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<path d="M48 60 V140 M152 60 V140" stroke="' + oK + '" stroke-width="2.2" opacity=".55"/>' +
    lap(9, function (i) { var x = 66 + (i % 3) * 34, y = 74 + Math.floor(i / 3) * 26; return '<circle cx="' + x + '" cy="' + y + '" r="9" fill="none" stroke="' + oK + '" stroke-width="2.5" opacity=".6"/><circle cx="' + x + '" cy="' + y + '" r="3" fill="' + oK + '" opacity=".5"/>'; }) +
    '<rect x="40" y="60" width="120" height="8" rx="4" fill="#fff" opacity=".45"/>' };
  // 16 · thỏi vàng (nguyên bảo): lỗ xuyên ngang thân
  V['23880'] = { xo: 'xuyen', s: '<path d="M22 92 C30 80 50 80 60 92 L140 92 C150 80 170 80 178 92 C176 132 144 156 100 156 C56 156 24 132 22 92Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<ellipse cx="100" cy="90" rx="38" ry="32" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + sang(88, 76, 12, 6, -25) + sang(48, 116, 14, 5, 20, .5) + '<circle cx="100" cy="132" r="7" fill="#3b2a12" opacity=".45"/>' };
  // 17 · ống đính đá vàng: ống chạm hoa văn, viên đá giữa
  V['23819'] = { xo: 'ong', s: '<rect x="24" y="58" width="152" height="84" rx="22" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<rect x="22" y="62" width="14" height="76" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><rect x="164" y="62" width="14" height="76" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55">' + lap(4, function (i) { var x = 48 + i * 30 + (i > 1 ? 24 : 0); return '<path d="M' + x + ' 72 q10 14 0 28 q-10 14 0 28"/><circle cx="' + (x + 8) + '" cy="86" r="4"/><circle cx="' + (x + 8) + '" cy="114" r="4"/>'; }) + '</g>' +
    '<circle cx="100" cy="100" r="16" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><circle cx="100" cy="100" r="8" fill="#fff" stroke="#b9c4d0" stroke-width="1"/>' + '<rect x="40" y="64" width="120" height="8" rx="4" fill="#fff" opacity=".4"/>' };
  // 18 · con thoi vàng: hạt bậc thang thuôn (như tổ ong), dây xuyên dọc trục
  V['23822'] = { xo: 'ong', s: lap(6, function (i) { var x = 40 + i * 22, h = 46 + Math.sin(i / 5 * Math.PI) * 56 + (i === 0 || i === 5 ? 0 : 10); return '<rect x="' + x + '" y="' + (100 - h / 2) + '" width="22" height="' + h + '" rx="9" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>'; }) +
    '<path d="M40 100 H172" stroke="' + oK + '" stroke-width="1.5" opacity=".3"/>' + sang(96, 66, 30, 4, 0, .5) };
  // 19 · kim cang (miếng mây như ý): đá xanh dương giữa, hai đá xanh lá hai bên; dây xuyên dọc
  V['21669'] = { xo: 'ong', s: (function () {
    var may = 'M100 66 C88 56 70 52 56 60 C40 52 22 62 24 80 C14 90 16 110 28 118 C24 136 44 148 60 140 C72 150 90 146 100 134 C110 146 128 150 140 140 C156 148 176 136 172 118 C184 110 186 90 176 80 C178 62 160 52 144 60 C130 52 112 56 100 66Z';
    return '<path d="' + may + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/><path d="M48 76 C40 86 40 112 48 124 M152 76 C160 86 160 112 152 124" fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55"/>' +
      '<circle cx="100" cy="100" r="22" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><circle cx="100" cy="100" r="15" fill="#1d3f9a" stroke="#0d2466" stroke-width="2"/>' + sang(95, 94, 5, 3, -30) +
      '<circle cx="56" cy="100" r="11" fill="#7cc95a" stroke="' + oK + '" stroke-width="2.5"/><circle cx="144" cy="100" r="11" fill="#7cc95a" stroke="' + oK + '" stroke-width="2.5"/>' + hatDiem([[78, 80], [122, 80], [78, 120], [122, 120]], 2.6);
  })() };
  // 20 · rồng tròn: thân rồng uốn thành vòng, đầu rồng trên cùng (móc vào dây ở đầu)
  V['9438'] = { xo: 'treo', s: '<circle cx="100" cy="112" r="62" fill="none" stroke="' + oK + '" stroke-width="27"/><circle cx="100" cy="112" r="62" fill="none" stroke="' + K + '" stroke-width="22"/>' +
    '<circle cx="100" cy="112" r="62" fill="none" stroke="' + oK + '" stroke-width="10" stroke-dasharray="2 6" opacity=".45"/>' +
    '<path d="M68 38 C74 18 92 12 100 22 C108 12 126 18 132 38 C124 52 112 56 100 50 C88 56 76 52 68 38Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<circle cx="86" cy="34" r="3.5" fill="#3b2a12"/><circle cx="114" cy="34" r="3.5" fill="#3b2a12"/><path d="M78 22 L70 12 M122 22 L130 12" stroke="' + K + '" stroke-width="4" stroke-linecap="round"/>' + sang(60, 92, 4, 14, 20, .6) };
  // 21 · kim cang (chày đôi chạm hạt, khoen nhỏ giữa) — nằm dọc dây
  V['16396'] = { xo: 'ong', s: [0, 1].map(function (m) { return '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + '><ellipse cx="54" cy="100" rx="30" ry="34" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
      '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55"><path d="M54 66 C40 80 40 120 54 134 M54 66 C68 80 68 120 54 134 M26 100 H82"/></g>' + lap(6, function (i) { return '<circle cx="' + (40 + (i % 3) * 14) + '" cy="' + (84 + Math.floor(i / 3) * 32) + '" r="3" fill="' + oK + '" opacity=".45"/>'; }) +
      '<path d="M24 100 L12 92 L12 108Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><rect x="82" y="92" width="12" height="16" rx="4" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/></g>'; }).join('') +
    '<circle cx="100" cy="100" r="10" fill="none" stroke="' + K + '" stroke-width="5"/>' + sang(46, 82, 9, 5, -30) };
  // 22 · kim cang chuông: cán chày kim cang ở trên, chuông bên dưới, đá trắng treo đáy
  V['16395'] = { xo: 'treo', s: '<path d="M100 12 L100 30 M88 16 C88 26 94 30 100 30 C106 30 112 26 112 16" fill="none" stroke="' + K + '" stroke-width="5" stroke-linecap="round"/>' +
    '<ellipse cx="100" cy="44" rx="14" ry="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><rect x="92" y="54" width="16" height="22" rx="5" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' +
    '<path d="M100 74 C78 74 70 96 68 124 C66 142 58 150 50 156 L150 156 C142 150 134 142 132 124 C130 96 122 74 100 74Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M70 120 Q100 130 130 120" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"/>' + lap(5, function (i) { return '<circle cx="' + (76 + i * 12) + '" cy="104" r="3" fill="' + oK + '" opacity=".4"/>'; }) +
    '<rect x="48" y="152" width="104" height="9" rx="4.5" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><path d="M100 161 V170" stroke="' + K + '" stroke-width="3"/>' +
    '<path d="M100 170 L112 180 L100 194 L88 180Z" fill="#fff" stroke="#b9c4d0" stroke-width="1.5"/>' + sang(84, 98, 4, 14, 10, .6) };
  // 23 · kim cang lồng rỗng: hai lồng chấu hai đầu, hạt giữa có lỗ — nằm dọc dây
  V['16391'] = { xo: 'ong', s: [0, 1].map(function (m) { return '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + ' fill="none" stroke="' + K + '" stroke-width="7" stroke-linecap="round">' +
      '<path d="M78 100 C66 68 40 62 22 72 C14 84 14 116 22 128 C40 138 66 132 78 100Z"/><path d="M78 100 C60 86 38 86 22 100 C38 114 60 114 78 100Z"/></g>' +
      '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + ' fill="none" stroke="' + oK + '" stroke-width="1" opacity=".6"><path d="M78 100 C66 68 40 62 22 72 C14 84 14 116 22 128 C40 138 66 132 78 100Z"/></g>'; }).join('') +
    '<ellipse cx="100" cy="100" rx="26" ry="24" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="100" r="9" fill="#3b2a12" opacity=".55"/>' + sang(90, 88, 8, 4, -20) };
  // 24 · tỳ hưu lam băng ngọc trên khay vàng có lỗ (xuyên ngang khay)
  V['23138'] = { xo: 'xuyen', s: '<rect x="30" y="118" width="140" height="40" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="70" cy="140" r="9" fill="#3b2a12" opacity=".5"/><circle cx="130" cy="140" r="9" fill="#3b2a12" opacity=".5"/>' +
    '<path d="M36 124 C30 88 48 54 84 50 C102 48 108 58 122 54 C150 48 172 70 166 104 C164 116 168 122 164 128 L36 128Z" fill="' + D + '" stroke="' + oD + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.2" opacity=".5"><path d="M128 60 C140 70 140 90 128 98 M60 70 C74 64 90 70 96 84 C104 100 120 104 134 98 M52 100 C64 96 76 104 80 116 M110 116 C116 106 130 104 140 112"/><circle cx="142" cy="76" r="4"/></g>' +
    '<g fill="' + K + '" stroke="' + oK + '" stroke-width="1.5"><path d="M34 120 l-4 -14 l10 8z"/><path d="M166 120 l4 -14 l-10 8z"/></g>' + sang(70, 70, 14, 6, -20) };
  // 25 · hồ lô lục đế 14K: ổ giọt nước lát kim cương, cầu treo đính đá
  V['26254'] = { xo: 'treo', s: '<rect x="90" y="10" width="20" height="40" rx="9" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[100, 19], [100, 29], [100, 39]], 3.2) +
    '<path d="M100 52 C126 70 156 110 156 142 C156 172 130 190 100 190 C70 190 44 172 44 142 C44 110 74 70 100 52Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    hatDiem([[100, 62], [112, 72], [88, 72], [123, 84], [77, 84], [133, 98], [67, 98], [141, 113], [59, 113], [146, 129], [54, 129], [147, 146], [53, 146], [143, 162], [57, 162], [134, 175], [66, 175], [120, 183], [80, 183], [100, 186]], 3.6) +
    hoLo(70, .72) };
  // 26 · hồ lô lục đế 18K: viền thừng ôm dáng hồ lô, móc càng cua
  V['25768'] = { xo: 'treo', s: mocCua() + '<g transform="translate(100 66) scale(.86) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="16"/>' +
    '<path d="' + HL + '" fill="none" stroke="' + K + '" stroke-width="12"/><path d="' + HL + '" fill="none" stroke="' + oK + '" stroke-width="4" stroke-dasharray="2 4" opacity=".6"/></g>' + hoLo(70, .78) };
  // 27 · tỳ hưu lục đế: mặt ngọc bầu dục chạm tỳ hưu, đế lưới đồng tiền (xỏ xuyên qua lưới)
  V['25782'] = { xo: 'xuyen', s: '<ellipse cx="100" cy="100" rx="76" ry="58" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatVienDuong('M100 46 A72 54 0 1 1 99.9 46Z', 3) +
    '<ellipse cx="100" cy="100" rx="62" ry="45" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.2" opacity=".55"><path d="M60 110 C66 86 90 72 112 76 C130 80 144 92 146 106 M66 118 C84 114 100 122 108 134 M126 74 C136 66 148 70 150 80"/><circle cx="138" cy="86" r="4"/></g>' + sang(76, 82, 14, 6, -25) };
  // 28, 29 · hồ lô lục đế: ổ vàng viền hạt, thành lưới — xỏ xuyên qua lưới
  V['25784'] = { xo: 'xuyen', s: '<g transform="rotate(90 100 100)"><g transform="translate(100 18) scale(1.1) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="12"/><path d="' + HL + '" fill="none" stroke="' + K + '" stroke-width="8"/>' +
    '<path d="' + HL + '" fill="none" stroke="' + oK + '" stroke-width="3" stroke-dasharray="1.5 4" stroke-linecap="round"/></g>' + hoLo(26, .96) + '</g>' };
  V['25787'] = { cung: '25784' };
  // 30 · hồ lô vàng khắc vòng xoắn, đá lục đế nhỏ giữa, khoen tròn
  V['25814'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V42" stroke="' + K + '" stroke-width="6"/>' +
    '<g transform="translate(100 42) scale(.98) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    [.82, .64, .46].map(function (s) { return '<g transform="translate(100 ' + (102 + (1 - s) * 30) + ') scale(' + s + ') translate(-100 -102)"><path d="' + HL + '" fill="none" stroke="' + oK + '" stroke-width="' + (2.6 / s).toFixed(1) + '" opacity=".55"/></g>'; }).join('') + '</g>' +
    '<circle cx="100" cy="146" r="10" fill="' + D + '" stroke="' + oK + '" stroke-width="2.5"/>' + sang(80, 70, 4, 10, -10, .7) };
  // 31 · giọt lệ lục đế: ổ vàng giọt nước, dây xích ngắn + móc càng cua
  V['25781'] = { xo: 'treo', s: mocCua() + lap(3, function (i) { return '<ellipse cx="100" cy="' + (72 + i * 10) + '" rx="4" ry="5.5" fill="none" stroke="' + K + '" stroke-width="2.5"/>'; }) +
    '<path d="M100 98 C120 120 144 142 144 160 C144 180 124 192 100 192 C76 192 56 180 56 160 C56 142 80 120 100 98Z" fill="' + D + '" stroke="' + K + '" stroke-width="6"/>' + sang(82, 156, 6, 14, -10) };
  // 32 · chùm nho lục đế: các hạt ngọc tròn, lá vàng phía trên, móc càng cua
  V['25798'] = { xo: 'treo', s: mocCua() + '<path d="M100 64 C124 62 140 74 144 92 C126 94 110 86 100 74 C90 86 74 94 56 92 C60 74 76 62 100 64Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' +
    '<path d="M100 66 V86 M76 80 L92 74 M124 80 L108 74" stroke="' + oK + '" stroke-width="1.6" opacity=".5"/>' +
    [[100, 104], [78, 120], [122, 120], [100, 138], [80, 158], [120, 158], [100, 178]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="15" fill="' + D + '" stroke="' + K + '" stroke-width="3"/>' + sang(p[0] - 5, p[1] - 5, 4, 2.5, -30); }).join('') +
    hatDiem([[90, 92], [110, 92], [89, 140], [111, 140]], 2.4) };
  // 33 · hồ lô lục đế: ổ vàng, móc càng cua, hạt ngọc trai treo cạnh móc
  V['25789'] = { xo: 'treo', s: mocCua() + '<path d="M108 58 L128 70" stroke="' + K + '" stroke-width="2.5"/><circle cx="132" cy="76" r="9" fill="#fbf6ea" stroke="#c4b59f" stroke-width="1.5"/>' + sang(129, 73, 3, 2, 0, .9) +
    '<g transform="translate(100 66) scale(.84) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="12"/><path d="' + HL + '" fill="none" stroke="' + K + '" stroke-width="8"/></g>' + hoLo(70, .76) };
  // 34 · khánh hoa văn lục đế: khung vuông lượn mây chạm lưới, mặt ngọc tròn giữa (xỏ xuyên qua thành)
  V['25779'] = { xo: 'xuyen', s: '<path d="M50 40 C66 30 80 44 100 36 C120 44 134 30 150 40 C164 50 154 70 164 100 C154 130 164 150 150 160 C134 170 120 156 100 164 C80 156 66 170 50 160 C36 150 46 130 36 100 C46 70 36 50 50 40Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".55">' + lap(4, function (i) { return '<path d="M62 62 C54 74 60 86 72 84 C80 82 80 72 72 70" transform="rotate(' + i * 90 + ' 100 100)"/><path d="M100 50 C92 54 92 62 100 64 C108 62 108 54 100 50Z" transform="rotate(' + i * 90 + ' 100 100)"/>'; }) + '</g>' +
    '<circle cx="100" cy="100" r="32" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + hatTron(100, 100, 28, 16, 2.4) + '<circle cx="100" cy="100" r="22" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' + sang(92, 92, 7, 4, -30) };
  // 35 · hoa văn lục đế: khung tròn lượn sóng chạm lưới, mặt ngọc tròn giữa
  V['25794'] = { xo: 'xuyen', s: (function () {
    var d = ''; for (var i = 0; i <= 48; i++) { var a = i / 48 * Math.PI * 2, r = 72 + 6 * Math.cos(a * 8); d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (100 + r * Math.sin(a)).toFixed(1); }
    return '<path d="' + d + 'Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 100, 64, 32, 2.2) +
      '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".5">' + lap(8, function (i) { return '<path d="M100 40 C90 48 92 58 100 60 C108 58 110 48 100 40Z M84 46 C74 52 76 64 88 64" transform="rotate(' + i * 45 + ' 100 100)"/>'; }) + '</g>' +
      '<circle cx="100" cy="100" r="30" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><circle cx="100" cy="100" r="22" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' + sang(92, 92, 7, 4, -30);
  })() };
  // 36 · hồ điệp lục đế: hai cánh ngọc trong ổ vàng, đá đỏ ở thân (xỏ xuyên qua đế dày)
  V['25375'] = { xo: 'xuyen', s: '<g stroke="' + K + '" stroke-width="6" stroke-linejoin="round" fill="' + D + '">' +
    '<path d="M96 96 C82 54 46 36 28 52 C16 66 30 96 92 108Z"/><path d="M104 96 C118 54 154 36 172 52 C184 66 170 96 108 108Z"/>' +
    '<path d="M94 110 C62 116 48 136 58 150 C70 166 92 146 98 120Z"/><path d="M106 110 C138 116 152 136 142 150 C130 166 108 146 102 120Z"/></g>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2" opacity=".4"><path d="M88 96 C72 76 54 64 40 62M112 96 C128 76 146 64 160 62M90 116 C78 126 70 136 66 146M110 116 C122 126 130 136 134 146"/></g>' +
    '<rect x="93" y="84" width="14" height="50" rx="7" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="100" cy="92" r="5" fill="#c4283f"/>' + sang(48, 60, 10, 4, -30) + sang(152, 60, 10, 4, 30) };

  /* ===== đợt 3 ===== */
  function vongHoa(cx, cy, r, n, sau) { var d = ''; for (var i = 0; i <= n * 8; i++) { var a = i / (n * 8) * Math.PI * 2, rr = r + (sau || 6) * Math.cos(a * n); d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1); } return d + 'Z'; }
  function ngocTron(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' + sang(cx - r * .3, cy - r * .32, r * .3, r * .18, -30) + sang(cx + r * .3, cy + r * .4, r * .16, r * .08, -30, .5); }
  // 37 · khánh bình an ngọc trai: mặt khoá hình tim lượn mây, ngọc trai trong ổ hoa, móc càng cua
  V['25808'] = { xo: 'treo', s: mocCua() + '<path d="M100 188 C70 168 40 146 40 112 C40 88 56 72 76 72 C88 72 96 78 100 86 C104 78 112 72 124 72 C144 72 160 88 160 112 C160 146 130 168 100 188Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="' + vongHoa(100, 122, 30, 6, 4) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><circle cx="100" cy="122" r="22" fill="url(#ngTrai)" stroke="#c4b59f" stroke-width="1.5"/>' + sang(92, 114, 7, 4, -30, .95) +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"><path d="M56 104 c6 -8 16 -6 16 2 M144 104 c-6 -8 -16 -6 -16 2 M78 166 c6 -6 14 -4 14 2 M122 166 c-6 -6 -14 -4 -14 2"/></g>' +
    '<defs><radialGradient id="ngTrai" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f3ece0"/><stop offset="1" stop-color="#c9bba6"/></radialGradient></defs>' };
  // 38 · khánh ngọc trai: ổ hoa lượn sóng, viền hạt, ngọc trai lớn (xỏ xuyên qua thành lưới)
  V['25811'] = { xo: 'xuyen', s: '<path d="' + vongHoa(100, 100, 70, 6, 8) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 100, 60, 30, 2.2) +
    '<circle cx="100" cy="100" r="50" fill="url(#ngTrai2)" stroke="#c4b59f" stroke-width="2"/>' + sang(84, 82, 16, 9, -30, .95) +
    '<defs><radialGradient id="ngTrai2" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f3ece0"/><stop offset="1" stop-color="#c9bba6"/></radialGradient></defs>' };
  // 39 · hồ điệp khảm trai: cánh xà cừ trắng trong khung vàng (xỏ xuyên qua đế)
  V['25793'] = { xo: 'xuyen', da: 'trai', s: '<g stroke="' + K + '" stroke-width="7" stroke-linejoin="round" fill="' + D + '">' +
    '<path d="M98 100 C90 60 62 40 40 48 C22 56 26 86 46 100 C30 112 34 142 58 146 C80 150 94 128 98 100Z"/><path d="M102 100 C110 60 138 40 160 48 C178 56 174 86 154 100 C170 112 166 142 142 146 C120 150 106 128 102 100Z"/></g>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="1.6" opacity=".35"><path d="M92 96 C80 76 64 62 48 60M92 106 C78 118 66 128 58 138M108 96 C120 76 136 62 152 60M108 106 C122 118 134 128 142 138"/></g>' +
    '<path d="M100 72 V130" stroke="' + K + '" stroke-width="8" stroke-linecap="round"/>' + sang(54, 66, 10, 5, -30, .9) + sang(146, 66, 10, 5, 30, .9) };
  // 40 · khiêm treo: hoa bách hợp (fleur-de-lis) đôi, đá trắng giữa, khoen tròn
  V['25862'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V46" stroke="' + K + '" stroke-width="6"/>' + [0, 1].map(function (m) {
      return '<g' + (m ? ' transform="matrix(1 0 0 -1 0 236)"' : '') + '><path d="M100 50 C110 62 112 76 104 90 C118 84 132 88 134 100 C122 98 112 104 106 112 L94 112 C88 104 78 98 66 100 C68 88 82 84 96 90 C88 76 90 62 100 50Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/></g>'; }).join('') +
    '<rect x="78" y="110" width="44" height="16" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + hatDiem([[90, 118], [100, 118], [110, 118]], 3.2) };
  // 41 · lu thống viền loe: dáng đồng hồ cát loe hai đầu, viền đá ở miệng và đai giữa (cân xứng)
  V['25381'] = { xo: 'ong', s: [0, 1].map(function (m) { return '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + '><path d="M24 40 C40 46 60 70 88 88 L88 112 C60 130 40 154 24 160Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g stroke="' + oK + '" stroke-width="1.6" opacity=".5">' + lap(6, function (i) { var y = 56 + i * 18; return '<path d="M30 ' + y + ' L86 ' + (96 + i * 1.6) + '"/>'; }) + '</g>' +
      '<rect x="16" y="38" width="14" height="124" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + '</g>'; }).join('') +
    hatDiem([[23, 50], [23, 66], [23, 82], [23, 98], [23, 114], [23, 130], [23, 146], [177, 50], [177, 66], [177, 82], [177, 98], [177, 114], [177, 130], [177, 146]], 3.2) +
    '<rect x="84" y="80" width="32" height="40" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + hatDiem([[100, 88], [100, 100], [100, 112]], 3.4) };
  // 42 · cân kim tiền: khối vuông chạm đồng tiền, khoen lớn trên nắp
  V['25380'] = { xo: 'treo', s: '<circle cx="100" cy="34" r="22" fill="none" stroke="' + oK + '" stroke-width="13"/><circle cx="100" cy="34" r="22" fill="none" stroke="' + K + '" stroke-width="10"/>' +
    '<path d="M58 70 L142 70 L156 92 L156 176 L44 176 L44 92Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/><path d="M44 92 H156" stroke="' + oK + '" stroke-width="2.5"/>' +
    '<circle cx="100" cy="134" r="28" fill="none" stroke="' + oK + '" stroke-width="3" opacity=".7"/><rect x="90" y="124" width="20" height="20" fill="none" stroke="' + oK + '" stroke-width="3" opacity=".7"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"><path d="M54 104 c6 -6 14 -2 12 6M146 104 c-6 -6 -14 -2 -12 6M54 166 c6 6 14 2 12 -6M146 166 c-6 6 -14 2 -12 -6"/></g>' + sang(60, 120, 5, 22, 0, .5) };
  // 43 · tháp phật: tháp chuông nhiều tầng có vòm, đá đỏ đỉnh, khoen
  V['25384'] = { xo: 'treo', s: khoen(10) + '<circle cx="100" cy="44" r="7" fill="#c4283f" stroke="' + oK + '" stroke-width="2"/>' +
    '<path d="M100 50 C88 50 82 62 80 76 C70 80 64 96 62 112 C50 118 44 138 42 160 L158 160 C156 138 150 118 138 112 C136 96 130 80 120 76 C118 62 112 50 100 50Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M80 78 H120 M62 114 H138" stroke="' + oK + '" stroke-width="2.5" opacity=".6"/>' +
    lap(5, function (i) { return '<path d="M' + (50 + i * 20) + ' 160 V142 a10 10 0 0 1 20 0 V160" fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".6"/>'; }) +
    lap(3, function (i) { return '<path d="M' + (72 + i * 20) + ' 112 V100 a8 8 0 0 1 16 0 V112" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55"/>'; }) +
    '<rect x="38" y="158" width="124" height="12" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + sang(84, 70, 4, 10, 10, .6) };
  // 44 · chặn bánh xe (vàng trắng): bánh xe nhìn ngang — vành lát đá
  V['25389'] = { xo: 'ong', kl: 'bac', s: '<rect x="62" y="28" width="76" height="144" rx="22" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<rect x="74" y="34" width="52" height="132" rx="12" fill="#e9eef4" stroke="' + oK + '" stroke-width="2"/>' +
    lap(9, function (i) { return '<circle cx="100" cy="' + (44 + i * 14) + '" r="6" fill="#fff" stroke="#9fb0c4" stroke-width="1.2"/><path d="M96 ' + (42 + i * 14) + ' l4 -2 l4 2" stroke="#b9d4ff" stroke-width="1" fill="none"/>'; }) +
    '<rect x="66" y="34" width="6" height="132" rx="3" fill="#fff" opacity=".6"/>' };
  // 45 · lu thống đính đá (vàng trắng): cân xứng — vương miện hai đầu, đá baguette, đai giữa
  V['25390'] = { xo: 'ong', kl: 'bac', s: [0, 1].map(function (m) { return '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + '>' +
      '<path d="M40 50 L90 64 L90 136 L40 150Z" fill="#e8eef5" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g stroke="#8d99a6" stroke-width="1.8"><path d="M40 75 L90 84 M40 100 L90 100 M40 125 L90 116"/></g><g fill="#fff"><path d="M46 56 L84 67 L84 74 L46 66Z"/><path d="M46 104 L84 104 L84 110 L46 113Z"/></g><g fill="#b9d4ff" opacity=".5"><path d="M46 80 L84 88 L84 96 L46 94Z"/></g>' +
      '<path d="M40 44 C26 40 18 52 26 60 C16 66 14 82 24 88 C14 96 14 104 24 112 C14 118 16 134 26 140 C18 148 26 160 40 156Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      lap(5, function (i) { return '<circle cx="14" cy="' + (60 + i * 20) + '" r="6" fill="' + K + '" stroke="' + oK + '" stroke-width="1.5"/>'; }) + '</g>'; }).join('') +
    '<rect x="86" y="58" width="28" height="84" rx="10" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + sang(100, 70, 4, 8, 0, .8) };
  // 46 · tròn đính đá trái tim: mặt tròn vàng nhám, đá tim trắng giữa, đá nhỏ quanh, khoen
  V['25869'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V46" stroke="' + K + '" stroke-width="6"/><circle cx="100" cy="114" r="66" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<circle cx="100" cy="114" r="58" fill="none" stroke="' + oK + '" stroke-width="1" stroke-dasharray="1 3" opacity=".5"/>' + hatTron(100, 114, 44, 7, 4) +
    '<path d="M100 140 C82 126 72 116 72 104 C72 94 80 88 88 88 C94 88 98 92 100 96 C102 92 106 88 112 88 C120 88 128 94 128 104 C128 116 118 126 100 140Z" fill="#fff" stroke="#9fb0c4" stroke-width="2"/><path d="M100 96 L100 140 M76 104 L124 104" stroke="#b9d4ff" stroke-width="1.2" opacity=".7"/>' + sang(68, 84, 10, 5, -40, .6) };
  // 47 · hồ lô đính đá: hồ lô vàng chạm lưới, đá đỏ & xanh hai đầu, khoen ở đỉnh
  V['23909'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V42" stroke="' + K + '" stroke-width="6"/><g transform="translate(100 42) scale(.98) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55"><path d="M76 60 C90 70 110 70 124 60 M60 128 C80 116 120 116 140 128 M64 146 C84 160 116 160 136 146"/>' + lap(6, function (i) { return '<path d="M' + (70 + i * 12) + ' 120 l6 12 l6 -12"/>'; }) + '</g></g>' +
    '<circle cx="100" cy="54" r="8" fill="#2bb35a" stroke="' + oK + '" stroke-width="2"/><circle cx="100" cy="160" r="10" fill="#d4235a" stroke="' + oK + '" stroke-width="2"/>' + sang(80, 140, 5, 14, -10, .6) };
  // 48 · phỉ thuý lục đế: ổ vàng xoắn ốc, mặt ngọc tròn lớn (xỏ xuyên ngang thân)
  V['23835'] = { xo: 'xuyen', s: '<circle cx="100" cy="100" r="72" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="3" opacity=".55">' + lap(14, function (i) { return '<path d="M100 30 C126 36 146 56 150 80" transform="rotate(' + i * 360 / 14 + ' 100 100)"/>'; }) + '</g>' + ngocTron(100, 100, 42) };
  // 49 · ngọc trai viền: ngọc trai lớn trong viền thừng, khoen nhỏ hai bên (nối dây)
  V['23816'] = { xo: 'xuyen', s: '<circle cx="24" cy="100" r="9" fill="none" stroke="' + K + '" stroke-width="5"/><circle cx="176" cy="100" r="9" fill="none" stroke="' + K + '" stroke-width="5"/>' +
    '<ellipse cx="100" cy="100" rx="70" ry="64" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><ellipse cx="100" cy="100" rx="64" ry="58" fill="none" stroke="' + oK + '" stroke-width="3" stroke-dasharray="2 4" opacity=".6"/>' +
    '<ellipse cx="100" cy="100" rx="56" ry="50" fill="url(#ngTrai3)" stroke="#c4b59f" stroke-width="1.5"/>' + sang(80, 78, 18, 10, -30, .95) +
    '<defs><radialGradient id="ngTrai3" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#f3ece0"/><stop offset="1" stop-color="#c9bba6"/></radialGradient></defs>' };
  // 50 · kim tiền lục đế: đồng xu, khung lỗ vuông dạng sao 4 cánh, ngọc tròn giữa (xỏ xuyên qua thành)
  V['23767'] = { xo: 'xuyen', s: '<circle cx="100" cy="100" r="72" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="100" r="62" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55"/>' +
    '<path d="M100 44 C106 72 128 94 156 100 C128 106 106 128 100 156 C94 128 72 106 44 100 C72 94 94 72 100 44Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' +
    '<g fill="#3b2a12" opacity=".35"><path d="M60 60 L80 66 L66 80Z"/><path d="M140 60 L120 66 L134 80Z"/><path d="M60 140 L80 134 L66 120Z"/><path d="M140 140 L120 134 L134 120Z"/></g>' + ngocTron(100, 100, 24) };
  // 51 · Di Lặc lục đế: tượng ngọc chạm nổi trên đế vàng tam giác bo (xỏ xuyên ngang đế)
  V['23772'] = { xo: 'xuyen', s: '<path d="M100 28 C126 28 170 104 172 136 C174 160 156 172 100 172 C44 172 26 160 28 136 C30 104 74 28 100 28Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M100 40 C122 40 160 106 160 134 C160 154 146 162 100 162 C54 162 40 154 40 134 C40 106 78 40 100 40Z" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.4" opacity=".55"><circle cx="100" cy="78" r="18"/><path d="M90 76 q4 -4 8 0 M102 76 q4 -4 8 0 M92 86 q8 6 16 0 M70 140 C70 110 130 110 130 140 M86 112 C80 124 82 136 92 144 M114 112 C120 124 118 136 108 144"/><circle cx="100" cy="132" r="5"/></g>' + sang(80, 60, 6, 14, 30, .6) };
  // 52 · hoa lục đế 4 cánh tròn, đá đỏ nhuỵ (xỏ xuyên)
  V['23786'] = { xo: 'xuyen', s: '<path d="' + vongHoa(100, 100, 66, 4, 12) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="' + D + '" stroke="' + oD + '" stroke-width="2.5">' + lap(4, function (i) { return '<circle cx="100" cy="62" r="30" transform="rotate(' + (i * 90 + 45) + ' 100 100)"/>'; }) + '</g>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2" opacity=".4">' + lap(4, function (i) { return '<path d="M100 100 L100 46" transform="rotate(' + (i * 90 + 45) + ' 100 100)"/>'; }) + '</g>' +
    '<circle cx="100" cy="100" r="9" fill="#d4235a" stroke="' + oK + '" stroke-width="2.5"/>' + sang(70, 66, 9, 5, -45) };
  // 53 · hoa lục đế 8 cánh khía (xỏ xuyên qua thành)
  V['23788'] = { xo: 'xuyen', s: '<path d="' + vongHoa(100, 100, 70, 8, 6) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="' + vongHoa(100, 100, 60, 8, 7) + '" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.2" opacity=".5">' + lap(8, function (i) { return '<path d="M100 82 L100 44" transform="rotate(' + (i * 45 + 22.5) + ' 100 100)"/>'; }) + '</g>' +
    '<circle cx="100" cy="100" r="16" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' + sang(76, 70, 12, 6, -40) };
  // 54 · quạt 3 tiêu: dáng hồ lô dẹt lát kín đá nhỏ, khoen bên trên
  V['25877'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V44" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 44 C130 44 140 66 132 86 C152 96 160 126 148 152 C136 178 110 186 100 186 C90 186 64 178 52 152 C40 126 48 96 68 86 C60 66 70 44 100 44Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(46, function (i) { var x = 62 + (i % 7) * 13 + (Math.floor(i / 7) % 2) * 6, y = 58 + Math.floor(i / 7) * 19; var ok = (y < 88 && Math.abs(x - 100) < 28) || (y >= 88 && Math.abs(x - 100) < 44 - (y > 160 ? (y - 160) : 0)); return ok ? '<circle cx="' + x + '" cy="' + y + '" r="4.4" fill="#fff" stroke="#c9bfa8" stroke-width="1"/>' : ''; }) };
  // 55 · treo đính đá trắng: chén tròn nhỏ một viên đá, khoen
  V['25873'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V58" stroke="' + K + '" stroke-width="6"/><circle cx="100" cy="112" r="54" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="112" r="38" fill="none" stroke="' + oK + '" stroke-width="2.5" opacity=".6"/>' +
    '<circle cx="100" cy="112" r="18" fill="#fff" stroke="#9fb0c4" stroke-width="2"/><path d="M100 94 L100 130 M82 112 L118 112 M88 100 L112 124 M112 100 L88 124" stroke="#b9d4ff" stroke-width="1.2" opacity=".7"/>' + sang(74, 88, 10, 5, -40, .6) };
  // 56 · nơ vàng: nơ bản rộng, có gân, khoen trên
  V['25843'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V58" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 84 C78 54 36 46 30 72 C26 96 62 104 100 96Z M100 84 C122 54 164 46 170 72 C174 96 138 104 100 96Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M92 96 L66 170 L82 164 L90 178 L100 104Z M108 96 L134 170 L118 164 L110 178 L100 104Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".45"><path d="M90 88 C72 72 50 66 40 72 M110 88 C128 72 150 66 160 72 M88 108 L74 160 M112 108 L126 160"/></g>' +
    '<rect x="88" y="78" width="24" height="26" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + sang(52, 66, 9, 4, -20) };
  // 57 · tròn lục đế: ngọc tròn trong ổ vàng viền đá (xỏ xuyên qua thành lưới)
  V['23790'] = { xo: 'xuyen', s: '<circle cx="100" cy="100" r="70" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 100, 61, 26, 3.2) +
    '<circle cx="100" cy="100" r="52" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + ngocTron(100, 100, 44) };
  // 58 · cỏ 4 lá lục đế: khung vàng 4 lá tim, đá đỏ nhỏ, ngọc tròn giữa (xỏ xuyên qua thành)
  V['23774'] = { xo: 'xuyen', s: '<g fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round">' + lap(4, function (i) { return '<path d="M100 96 C86 84 64 70 64 48 C64 32 80 24 92 34 C96 38 99 42 100 46 C101 42 104 38 108 34 C120 24 136 32 136 48 C136 70 114 84 100 96Z" transform="rotate(' + i * 90 + ' 100 100)"/>'; }) + '</g>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55">' + lap(4, function (i) { return '<path d="M100 86 C90 76 76 66 76 52 C76 42 86 38 92 44 C96 48 100 52 100 56 C100 52 104 48 108 44 C114 38 124 42 124 52 C124 66 110 76 100 86Z" transform="rotate(' + i * 90 + ' 100 100)"/>'; }) + '</g>' +
    lap(4, function (i) { return '<circle cx="100" cy="36" r="5" fill="#d4235a" stroke="' + oK + '" stroke-width="1.5" transform="rotate(' + (i * 90) + ' 100 100)"/>'; }) + ngocTron(100, 100, 24) };
  // 59 · hoa phỉ thuý: khung tròn chạm hoa lưới, ngọc tròn giữa, khoen
  V['23780'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V44" stroke="' + K + '" stroke-width="6"/><path d="' + vongHoa(100, 114, 64, 12, 5) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55">' + lap(12, function (i) { return '<path d="M100 60 C94 66 94 74 100 78 C106 74 106 66 100 60Z" transform="rotate(' + i * 30 + ' 100 114)"/>'; }) + '</g>' +
    '<circle cx="100" cy="114" r="32" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatTron(100, 114, 28, 16, 2.4) + ngocTron(100, 114, 21) };
  // 60 · tròn lục đế: ổ vàng tròn chạm lưới dày, ngọc tròn lớn (xỏ xuyên ngang)
  V['23757'] = { xo: 'xuyen', s: '<circle cx="100" cy="100" r="72" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.6" opacity=".55">' + lap(10, function (i) { return '<path d="M100 32 C116 36 120 50 112 58 C104 64 94 60 96 52" transform="rotate(' + i * 36 + ' 100 100)"/>'; }) + '</g>' +
    '<circle cx="100" cy="100" r="50" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + ngocTron(100, 100, 42) };

  /* ===== đợt 4 ===== */
  // hạt dạng ống nhìn ngang (dây xuyên dọc trục): thân bo tròn, rộng w, cao h
  function thanOng(w, h, r) { return '<rect x="' + (100 - w / 2) + '" y="' + (100 - h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (r || 16) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>'; }
  function bongOng(w, h) { return '<rect x="' + (100 - w / 2 + 8) + '" y="' + (100 - h / 2 + 6) + '" width="' + (w - 16) + '" height="7" rx="3.5" fill="#fff" opacity=".45"/>'; }
  // 61 · hoa ngọc bích: 6 cánh viền hạt rỗng, ngọc xanh giữa (xỏ xuyên qua thành)
  V['16407'] = { xo: 'xuyen', s: lap(6, function (i) { return '<path d="M100 92 C84 80 74 56 84 42 C92 32 108 32 116 42 C126 56 116 80 100 92Z" fill="none" stroke="' + K + '" stroke-width="8" transform="rotate(' + i * 60 + ' 100 100)"/>' +
      '<path d="M100 92 C84 80 74 56 84 42 C92 32 108 32 116 42 C126 56 116 80 100 92Z" fill="none" stroke="' + oK + '" stroke-width="2.6" stroke-dasharray="1.5 4" stroke-linecap="round" transform="rotate(' + i * 60 + ' 100 100)"/>'; }) +
    '<circle cx="100" cy="100" r="24" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + ngocTron(100, 100, 17) };
  // 62 · mặt trái tim vàng phồng, mặt nhám (xỏ xuyên ngang)
  V['7714'] = { xo: 'xuyen', s: '<path d="M100 172 C58 140 28 114 28 78 C28 50 50 32 74 32 C88 32 96 40 100 52 C104 40 112 32 126 32 C150 32 172 50 172 78 C172 114 142 140 100 172Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<path d="M100 172 C58 140 28 114 28 78 C28 50 50 32 74 32 C88 32 96 40 100 52 C104 40 112 32 126 32 C150 32 172 50 172 78 C172 114 142 140 100 172Z" fill="none" stroke="' + oK + '" stroke-width="1" stroke-dasharray="1 3" opacity=".4" transform="translate(100 100) scale(.82) translate(-100 -100)"/>' + sang(62, 66, 16, 8, -40, .7) + sang(132, 62, 8, 4, 30, .5) };
  // 63 · bản tính: khung bàn tính chữ nhật, hàng hạt rỗng, hoa nhỏ hai đầu, móc càng cua
  V['25874'] = { xo: 'treo', s: mocCua() + '<rect x="66" y="74" width="68" height="112" rx="12" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<rect x="76" y="96" width="48" height="68" rx="4" fill="#3b2a12" opacity=".55"/>' + lap(8, function (i) { var x = 84 + (i % 2) * 32, y = 104 + Math.floor(i / 2) * 15; return '<rect x="' + (x - 6) + '" y="' + y + '" width="12" height="9" rx="4" fill="' + K + '" stroke="' + oK + '" stroke-width="1.2"/>'; }) +
    '<path d="M100 96 V164" stroke="' + K + '" stroke-width="3"/>' + hatDiem([[84, 84], [100, 84], [116, 84], [84, 176], [100, 176], [116, 176]], 4) };
  // 64 · mặt nạ hồ ly: tai nhọn, khoét mắt, khoen tai phải
  V['19807'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V50" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 70 L132 44 L146 94 C150 130 128 160 100 182 C72 160 50 130 54 94 L68 44Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M74 58 L80 86 L92 78Z M126 58 L120 86 L108 78Z" fill="' + oK + '" opacity=".3"/>' +
    '<path d="M68 112 C76 100 90 102 94 114 C86 120 74 120 68 112Z M132 112 C124 100 110 102 106 114 C114 120 126 120 132 112Z" fill="#3b2a12" opacity=".75"/>' +
    '<path d="M100 128 L94 146 Q100 154 106 146Z" fill="' + oK + '" opacity=".4"/><g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"><path d="M78 132 Q90 146 96 166 M122 132 Q110 146 104 166"/></g>' + sang(84, 76, 4, 10, -30, .7) };
  // 65 · bản tính treo: bàn tính nhỏ, đỉnh mây, khoen
  V['20308'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V44" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M70 70 C64 56 78 44 90 50 C92 40 108 40 110 50 C122 44 136 56 130 70Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<rect x="62" y="68" width="76" height="110" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><rect x="72" y="86" width="56" height="80" rx="3" fill="#3b2a12" opacity=".55"/>' +
    lap(8, function (i) { var x = 86 + (i % 2) * 28, y = 94 + Math.floor(i / 2) * 18; return '<rect x="' + (x - 7) + '" y="' + y + '" width="14" height="10" rx="4" fill="' + K + '" stroke="' + oK + '" stroke-width="1.2"/>'; }) + '<path d="M100 86 V166" stroke="' + K + '" stroke-width="3"/>' };
  // 66 · thỏi vàng treo: nguyên bảo có khoen
  V['20245'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V58" stroke="' + K + '" stroke-width="7"/>' +
    '<path d="M24 104 C32 92 52 92 62 104 L138 104 C148 92 168 92 176 104 C174 146 142 170 100 170 C58 170 26 146 24 104Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<ellipse cx="100" cy="100" rx="38" ry="34" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="100" r="12" fill="none" stroke="' + oK + '" stroke-width="2.5" opacity=".6"/>' + sang(86, 86, 10, 5, -25) + sang(50, 128, 12, 4, 20, .5) };
  // 67 · chủ tiểu: chú tiểu đầu nổi hạt, chấm đỏ trán — dây xuyên dọc thân (nằm theo dây)
  V['16400'] = { xo: 'ong', s: '<g transform="rotate(-90 100 100)"><circle cx="100" cy="64" r="34" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + lap(20, function (i) { var a = Math.PI + i / 19 * Math.PI; return '<circle cx="' + (100 + 28 * Math.cos(a)).toFixed(1) + '" cy="' + (64 + 28 * Math.sin(a)).toFixed(1) + '" r="3.4" fill="' + oK + '" opacity=".35"/>'; }) +
    '<circle cx="100" cy="58" r="5" fill="#d4235a"/><path d="M88 72 q4 -3 8 0 M104 72 q4 -3 8 0 M92 84 q8 6 16 0" fill="none" stroke="' + oK + '" stroke-width="2.4"/>' +
    '<path d="M66 100 C60 130 64 160 78 172 L122 172 C136 160 140 130 134 100 C124 94 76 94 66 100Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="M80 112 C92 124 108 124 120 112 M100 120 V168" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"/>' + sang(84, 48, 8, 4, -30) + '</g>' };
  // 68 · kim cang (phurba): chày nhọn, cán chạm, khoen trên
  V['21636'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V42" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M88 42 L112 42 L108 56 L92 56Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><ellipse cx="100" cy="64" rx="12" ry="9" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' +
    '<rect x="93" y="72" width="14" height="30" rx="4" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + lap(4, function (i) { return '<path d="M93 ' + (78 + i * 7) + ' H107" stroke="' + oK + '" stroke-width="1.6" opacity=".6"/>'; }) +
    '<ellipse cx="100" cy="106" rx="16" ry="7" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><path d="M84 110 L100 192 L116 110Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M100 112 V184" stroke="' + oK + '" stroke-width="1.8" opacity=".5"/>' + sang(92, 130, 2.5, 18, 0, .6) };
  // 69 · cỏ 4 lá tourmaline: 4 lá tim, mỗi lá một màu đá (xỏ xuyên qua đế)
  V['23776'] = { xo: 'xuyen', s: ['#2f6b3a', '#c4284f', '#e8a93a', '#7a4a2a'].map(function (m, i) { var la = 'M100 96 C86 84 64 70 64 48 C64 32 80 24 92 34 C96 38 99 42 100 46 C101 42 104 38 108 34 C120 24 136 32 136 48 C136 70 114 84 100 96Z';
      return '<path d="' + la + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3" transform="rotate(' + i * 90 + ' 100 100)"/><path d="' + la + '" fill="' + m + '" stroke="none" transform="rotate(' + i * 90 + ' 100 100) translate(100 64) scale(.72) translate(-100 -64)"/>' +
        '<ellipse cx="88" cy="50" rx="6" ry="3" fill="#fff" opacity=".6" transform="rotate(' + i * 90 + ' 100 100)"/>'; }).join('') + '<circle cx="100" cy="100" r="7" fill="#fff" stroke="#b9c4d0"/>' };
  // 70 · phỉ thuý lục đế: ngọc tròn lớn, viền hạt, thân trụ lưới (xỏ xuyên)
  V['19033'] = { xo: 'xuyen', s: '<circle cx="100" cy="100" r="70" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 100, 63, 34, 2.6) + '<circle cx="100" cy="100" r="54" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + ngocTron(100, 100, 46) };
  // 71 · chú bình an: mặt tròn chạm luân xa lưới, khoen có đá đỏ
  V['14689'] = { xo: 'treo', s: khoen(10) + '<circle cx="100" cy="40" r="6" fill="#d4235a" stroke="' + oK + '" stroke-width="2"/>' +
    '<circle cx="100" cy="116" r="68" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="116" r="60" fill="none" stroke="' + oK + '" stroke-width="2" stroke-dasharray="1.5 4" stroke-linecap="round" opacity=".7"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".6">' + lap(8, function (i) { return '<path d="M100 66 C108 80 108 96 100 104 C92 96 92 80 100 66Z" transform="rotate(' + i * 45 + ' 100 116)"/>'; }) + '<circle cx="100" cy="116" r="44"/></g>' +
    '<circle cx="100" cy="116" r="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' };
  // 72 · hồ ly chúa: mặt tròn chạm đuôi cáo xoáy, đá đỏ quanh viền, khoen ngọn lửa
  V['7643'] = { xo: 'treo', s: '<path d="M100 10 C110 20 112 32 104 42 L96 42 C88 32 90 20 100 10Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><path d="M100 42 V52" stroke="' + K + '" stroke-width="6"/>' +
    '<circle cx="100" cy="118" r="66" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.6" opacity=".6">' + lap(9, function (i) { return '<path d="M100 118 C108 98 128 88 136 70 C126 76 114 74 108 66" transform="rotate(' + i * 40 + ' 100 118)"/>'; }) + '</g>' +
    lap(8, function (i) { var a = i * Math.PI / 4 + .3; return '<circle cx="' + (100 + 58 * Math.cos(a)).toFixed(1) + '" cy="' + (118 + 58 * Math.sin(a)).toFixed(1) + '" r="4" fill="#d4235a"/>'; }) + '<circle cx="100" cy="118" r="8" fill="#d4235a" stroke="' + oK + '" stroke-width="2"/>' };
  // 73 · hồ ly chúa lục đế: chín đuôi cáo xoè tròn, ngọc lục đế giữa, móc càng cua
  V['7648'] = { xo: 'treo', s: mocCua() + lap(9, function (i) { return '<path d="M100 124 C96 104 104 88 118 80 C132 72 138 60 134 50 C146 60 148 78 140 92 C132 106 116 116 100 124Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.2" transform="rotate(' + i * 40 + ' 100 124)"/>' +
      '<path d="M104 116 C106 100 116 90 130 80" fill="none" stroke="' + oK + '" stroke-width="1.6" opacity=".5" transform="rotate(' + i * 40 + ' 100 124)"/>'; }) + '<circle cx="100" cy="124" r="16" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + ngocTron(100, 124, 10) };
  // 74 · chữ phúc: hạt trụ vàng, mặt chữ phúc rỗng — nhìn ngang thân có cửa sổ chữ (dây xuyên dọc)
  V['21662'] = { xo: 'ong', s: thanOng(110, 132, 26) + '<rect x="56" y="44" width="88" height="112" rx="10" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"/>' +
    lap(2, function (i) { var x = 64 + i * 40; return '<rect x="' + x + '" y="62" width="32" height="76" rx="4" fill="#3b2a12" opacity=".55"/><path d="M' + (x + 6) + ' 76 H' + (x + 26) + ' M' + (x + 16) + ' 70 V132 M' + (x + 6) + ' 100 H' + (x + 26) + ' M' + (x + 8) + ' 120 H' + (x + 24) + '" stroke="' + K + '" stroke-width="4"/>'; }) + bongOng(110, 132) };
  // 75 · chữ: hạt trụ vàng chạm chữ rỗng (dây xuyên dọc)
  V['21666'] = { xo: 'ong', s: thanOng(116, 140, 30) + '<g stroke="' + oK + '" stroke-width="2" fill="none" opacity=".5"><path d="M50 56 H150 M50 144 H150"/></g>' +
    '<path d="M64 70 H136 V130 H64Z" fill="#3b2a12" opacity=".5"/><g stroke="' + K + '" stroke-width="7" fill="none" stroke-linecap="square"><path d="M72 82 H128 M100 76 V124 M78 100 H122 M72 118 H128 M80 92 V112 M120 92 V112"/></g>' + bongOng(116, 140) };
  // 76 · ngôi sao đính đá: sao 5 cánh lát đá, khoen
  V['26275'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V56" stroke="' + K + '" stroke-width="6"/>' + (function () {
      var d = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 30 : 68; d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (124 + r * Math.sin(a)).toFixed(1); }
      return '<path d="' + d + 'Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' + hatDiem([[100, 74], [100, 96], [70, 114], [130, 114], [86, 134], [114, 134], [100, 124], [76, 160], [124, 160]], 5.5);
    })() };
  // 77 · hạt gạo: hạt thuôn chải xước, dây xuyên dọc trục
  V['21653'] = { xo: 'ong', s: '<ellipse cx="100" cy="100" rx="78" ry="48" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="1.4" opacity=".35">' + lap(9, function (i) { var y = 64 + i * 9; return '<path d="M' + (40 + Math.abs(i - 4) * 6) + ' ' + y + ' Q100 ' + (y + 6) + ' ' + (160 - Math.abs(i - 4) * 6) + ' ' + y + '"/>'; }) + '</g>' + sang(86, 70, 34, 6, -4, .55) };
  // 78 · chặn dẹt bánh xe: hạt dẹt khắc kim cương, nhìn ngang
  V['21655'] = { xo: 'ong', s: thanOng(92, 138, 30) + '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55">' + lap(6, function (i) { var y = 46 + i * 20; return '<path d="M58 ' + y + ' l14 10 l14 -10 l14 10 l14 -10 l14 10 l14 -10"/>'; }) + '</g>' +
    '<path d="M54 40 H146 M54 160 H146" stroke="' + oK + '" stroke-width="2.5" opacity=".6"/>' + bongOng(92, 138) };
  // 79 · chặn hoa văn: hạt tròn chạm lưới xoắn mây
  V['19805'] = { xo: 'ong', s: '<circle cx="100" cy="100" r="66" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<g fill="none" stroke="#3b2a12" stroke-width="5" opacity=".45">' + lap(6, function (i) { return '<path d="M100 48 C120 50 126 70 112 78 C102 84 92 76 98 68" transform="rotate(' + i * 60 + ' 100 100)"/>'; }) + '</g>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="1.6" opacity=".6">' + lap(6, function (i) { return '<path d="M100 48 C120 50 126 70 112 78 C102 84 92 76 98 68" transform="rotate(' + i * 60 + ' 100 100)"/>'; }) + '</g>' + sang(76, 70, 14, 7, -35) };
  // 80 · chặn đèn lồng: hạt đèn lồng gân dọc rỗng, nhìn ngang
  V['18924'] = { xo: 'ong', s: '<ellipse cx="100" cy="100" rx="56" ry="70" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    lap(5, function (i) { var x = 64 + i * 18; return '<path d="M' + x + ' 46 Q' + (x + 9 + (i - 2) * 4) + ' 100 ' + x + ' 154" fill="none" stroke="#3b2a12" stroke-width="7" opacity=".45"/>'; }) +
    '<rect x="52" y="26" width="96" height="14" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><rect x="52" y="160" width="96" height="14" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + sang(70, 76, 6, 20, 0, .6) };
  // 81 · kim cang lục đế: khung chữ nhật lát đá, chày kim cang bên trong, ngọc xanh giữa, khoen
  V['14681'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V44" stroke="' + K + '" stroke-width="6"/><rect x="60" y="44" width="80" height="146" rx="18" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<rect x="72" y="56" width="56" height="122" rx="10" fill="#3b2a12" opacity=".5"/>' + lap(13, function (i) { return '<circle cx="66" cy="' + (52 + i * 11) + '" r="3" fill="#fff" stroke="#b9c4d0" stroke-width=".8"/><circle cx="134" cy="' + (52 + i * 11) + '" r="3" fill="#fff" stroke="#b9c4d0" stroke-width=".8"/>'; }) +
    '<path d="M100 62 V172" stroke="' + K + '" stroke-width="5"/>' + [76, 158].map(function (y) { return '<ellipse cx="100" cy="' + y + '" rx="14" ry="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>'; }).join('') + ngocTron(100, 117, 10) };
  // 82 · bướm vàng: bướm chạm nổi, chuỗi xích treo charm nhỏ bên dưới, móc càng cua
  V['25891'] = { xo: 'treo', s: mocCua() + '<g transform="translate(0 -8)"><path d="M98 100 C88 74 62 62 48 74 C38 86 50 104 96 110Z M102 100 C112 74 138 62 152 74 C162 86 150 104 104 110Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M96 112 C70 116 60 132 68 142 C78 152 94 138 98 120Z M104 112 C130 116 140 132 132 142 C122 152 106 138 102 120Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="' + oK + '" opacity=".35">' + lap(8, function (i) { return '<circle cx="' + (62 + (i % 4) * 9 + (i > 3 ? 54 : 0)) + '" cy="' + (88 + (i % 2) * 8) + '" r="2.6"/>'; }) + '</g><rect x="95" y="84" width="10" height="44" rx="5" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/></g>' +
    lap(5, function (i) { return '<ellipse cx="100" cy="' + (148 + i * 8) + '" rx="3" ry="4.5" fill="none" stroke="' + K + '" stroke-width="2"/>'; }) + '<path d="M100 188 L108 196 L100 200 L92 196Z" fill="' + K + '" stroke="' + oK + '" stroke-width="1.5"/>' };
  // 83 · chặn dẹt: hạt dẹt khắc vân sóng, nhìn ngang
  V['21660'] = { xo: 'ong', s: thanOng(100, 140, 34) + '<g fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".55">' + lap(7, function (i) { var y = 48 + i * 17; return '<path d="M56 ' + y + ' q11 8 22 0 q11 -8 22 0 q11 8 22 0 q11 -8 22 0"/>'; }) + '</g>' + bongOng(100, 140) };
  // 84 · ống vàng xoắn mảnh (dây xuyên dọc)
  V['12872'] = { xo: 'ong', s: '<rect x="14" y="80" width="172" height="40" rx="18" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g stroke="' + oK + '" stroke-width="2.4" opacity=".55">' + lap(14, function (i) { var x = 24 + i * 11.5; return '<path d="M' + x + ' 82 L' + (x + 12) + ' 118"/>'; }) + '</g><rect x="22" y="86" width="156" height="6" rx="3" fill="#fff" opacity=".45"/>' };

  /* ===== đợt 5 ===== */
  // ống cong (ống hoa văn): uốn theo vòng — giữa ống lồi ra ngoài, hai đầu cong vào tâm vòng (+y)
  var CONG = 'M16 114 Q100 74 184 114';
  function ongCong(trangTri) {
    return '<path d="' + CONG + '" fill="none" stroke="' + oK + '" stroke-width="42" stroke-linecap="round"/><path d="' + CONG + '" fill="none" stroke="' + K + '" stroke-width="36" stroke-linecap="round"/>' +
      (trangTri || '') + '<path d="M26 100 Q100 66 174 100" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45"/>' +
      '<ellipse cx="14" cy="114" rx="6" ry="17" fill="#3b2a12" opacity=".4" transform="rotate(-25 14 114)"/>';
  }
  function luoiCong(op) { return '<path d="' + CONG + '" fill="none" stroke="#3b2a12" stroke-width="28" stroke-dasharray="3 5" opacity="' + (op || .35) + '"/>'; }
  function diemCong(n, mau, r) { var h = ''; for (var i = 1; i < n; i++) { var t = i / n, x = (1 - t) * (1 - t) * 16 + 2 * (1 - t) * t * 100 + t * t * 184, y = (1 - t) * (1 - t) * 114 + 2 * (1 - t) * t * 74 + t * t * 114; h += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r || 3.4) + '" fill="' + mau + '" stroke="' + oK + '" stroke-width=".8"/>'; } return h; }
  // 85 · chặn vuông vát: khối lập phương vát góc, mặt nhám (dây xuyên dọc)
  V['22706'] = { xo: 'ong', s: '<path d="M58 36 H142 L168 62 V138 L142 164 H58 L32 138 V62Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M58 36 L66 60 H134 L142 36 M168 62 L144 70 V130 L168 138 M142 164 L134 140 H66 L58 164 M32 138 L56 130 V70 L32 62" fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55"/>' +
    '<rect x="66" y="60" width="68" height="80" fill="' + oK + '" opacity=".08"/>' + sang(84, 50, 18, 5, 0, .55) };
  // 86 · chặn bánh xe đính đá: hạt dẹt viền vàng, hàng đá xanh (nhìn ngang)
  V['16291'] = { xo: 'ong', s: thanOng(84, 144, 24) + '<rect x="70" y="34" width="60" height="132" rx="10" fill="#3b2a12" opacity=".25"/>' +
    lap(7, function (i) { var y = 44 + i * 19; return '<circle cx="100" cy="' + y + '" r="8.5" fill="#2bb35a" stroke="' + oK + '" stroke-width="1.5"/><circle cx="97" cy="' + (y - 3) + '" r="2.5" fill="#fff" opacity=".7"/>'; }) + bongOng(84, 144) };
  // 87–96 · ống hoa văn cong (bạc phủ vàng) — mỗi chiếc một kiểu trang trí
  V['24011'] = { xo: 'ong', s: ongCong(lap(6, function (i) { var x = 34 + i * 26; return '<path d="M' + x + ' ' + (106 - Math.sin((x - 16) / 168 * Math.PI) * 26) + ' q10 -10 20 0" fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".65"/>'; }) + '<circle cx="100" cy="94" r="5" fill="#fff" stroke="#b9c4d0"/>') };
  V['24008'] = { xo: 'ong', s: ongCong(luoiCong(.3) + '<path d="M70 92 C84 76 116 76 130 92 C116 100 84 100 70 92Z" fill="#3fb59a" stroke="' + oK + '" stroke-width="1.5"/><path d="M86 90 C94 80 106 80 114 90" fill="none" stroke="#5aa8e0" stroke-width="4"/>') };
  V['24020'] = { xo: 'ong', s: ongCong(luoiCong(.3) + '<path d="M40 104 C60 84 90 80 120 86 C140 90 156 98 168 106 C144 100 120 98 100 102 C80 106 60 108 40 104Z" fill="#2e9f6e" stroke="' + oK + '" stroke-width="1.2"/>' +
    lap(4, function (i) { return '<ellipse cx="' + (70 + i * 26) + '" cy="' + (90 - (i === 1 || i === 2 ? 4 : 0)) + '" rx="7" ry="4" fill="#2f6fc0"/>'; })) };
  V['23983'] = { xo: 'ong', s: ongCong(luoiCong(.4) + diemCong(9, '#fff', 3.2)) };
  V['24022'] = { xo: 'ong', s: ongCong(luoiCong(.3) + '<path d="M44 102 C60 86 84 86 96 96 C84 100 64 104 44 102Z" fill="#f0a0b8" stroke="' + oK + '" stroke-width="1.2"/><path d="M156 102 C140 86 116 86 104 96 C116 100 136 104 156 102Z" fill="#7cc8d8" stroke="' + oK + '" stroke-width="1.2"/>' + '<circle cx="100" cy="94" r="5" fill="#fff" stroke="#b9c4d0"/>') };
  V['24003'] = { xo: 'ong', s: ongCong(lap(8, function (i) { var x = 30 + i * 20; return '<path d="M' + x + ' ' + (110 - Math.sin((x - 16) / 168 * Math.PI) * 26) + ' a10 10 0 0 1 20 0" fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".6"/>'; }) + diemCong(8, '#9fd0f0', 3)) };
  V['23987'] = { xo: 'ong', s: ongCong(luoiCong(.45)) };
  V['24013'] = { xo: 'ong', s: ongCong(luoiCong(.4) + '<circle cx="100" cy="94" r="5.5" fill="#fff" stroke="#b9c4d0"/>') };
  V['23992'] = { xo: 'ong', s: ongCong('<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".6">' + lap(5, function (i) { var x = 34 + i * 33; return '<path d="M' + x + ' ' + (108 - Math.sin((x - 16) / 168 * Math.PI) * 26) + ' c6 -12 18 -12 20 0 c2 8 -8 10 -10 4"/>'; }) + '</g>' +
    '<circle cx="100" cy="94" r="8" fill="' + K + '" stroke="' + oK + '" stroke-width="1.5"/><circle cx="100" cy="94" r="4.5" fill="#d4235a"/>') };
  V['24029'] = { xo: 'ong', s: ongCong(luoiCong(.3) + '<path d="M106 96 C120 80 140 82 150 98 C138 104 120 104 106 96Z" fill="#e0402a" stroke="' + oK + '" stroke-width="1.2"/><path d="M50 106 C62 92 80 90 92 98 C80 106 62 108 50 106Z" fill="#2e9f6e" stroke="' + oK + '" stroke-width="1.2"/>') };
  // 97 · hoa đá đỏ tròn: hạt vòm chạm lưới, hoa đá đỏ + đá trắng giữa (xỏ xuyên ngang) — mạ vàng
  V['23935'] = { xo: 'xuyen', kl: 'vang', s: '<circle cx="100" cy="100" r="72" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55">' + lap(8, function (i) { return '<path d="M100 34 C112 50 112 66 100 74 C88 66 88 50 100 34Z" transform="rotate(' + i * 45 + ' 100 100)"/>'; }) + '<circle cx="100" cy="100" r="62"/></g>' +
    lap(8, function (i) { var a = i * Math.PI / 4; return '<circle cx="' + (100 + 17 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 17 * Math.sin(a)).toFixed(1) + '" r="6.5" fill="#d4235a" stroke="' + oK + '" stroke-width="1"/>'; }) + '<circle cx="100" cy="100" r="9" fill="#fff" stroke="#b9c4d0" stroke-width="1.5"/>' };
  // 98 · hoa đá đỏ: hoa nhiều lớp cánh vàng, vòng đá đỏ, đá trắng giữa (xỏ xuyên qua đế)
  V['23939'] = { xo: 'xuyen', kl: 'vang', s: '<path d="' + vongHoa(100, 100, 70, 12, 8) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="' + vongHoa(100, 100, 50, 10, 6) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="1.6" opacity=".5">' + lap(12, function (i) { return '<path d="M100 36 V54" transform="rotate(' + (i * 30 + 15) + ' 100 100)"/>'; }) + '</g>' +
    lap(10, function (i) { var a = i * Math.PI / 5; return '<circle cx="' + (100 + 24 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 24 * Math.sin(a)).toFixed(1) + '" r="6.5" fill="#d4235a" stroke="' + oK + '" stroke-width="1"/>'; }) + '<circle cx="100" cy="100" r="11" fill="#fff" stroke="#b9c4d0" stroke-width="1.5"/>' };
  // 99 · mèo mặt trắng: mặt mèo men hồng trắng, mắt xanh, khoen
  V['23937'] = { xo: 'treo', kl: 'vang', s: khoen(10) + '<path d="M100 30 V50" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M50 84 L44 40 L84 62 Q100 58 116 62 L156 40 L150 84 C164 108 160 146 132 166 C114 178 86 178 68 166 C40 146 36 108 50 84Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M58 86 L54 52 L82 70 Q100 66 118 70 L146 52 L142 86 C152 106 150 140 128 156 C112 166 88 166 72 156 C50 140 48 106 58 86Z" fill="#f6b3c2"/><path d="M70 104 C70 90 130 90 130 104 C134 130 120 156 100 156 C80 156 66 130 70 104Z" fill="#fff"/>' +
    '<ellipse cx="82" cy="112" rx="10" ry="12" fill="#3fbf6a" stroke="#1d6b3a" stroke-width="2"/><ellipse cx="118" cy="112" rx="10" ry="12" fill="#3fbf6a" stroke="#1d6b3a" stroke-width="2"/><circle cx="82" cy="112" r="4" fill="#1d3a2a"/><circle cx="118" cy="112" r="4" fill="#1d3a2a"/>' +
    '<path d="M95 130 L105 130 L100 136Z" fill="#e88a8a"/><path d="M100 136 Q92 146 84 140 M100 136 Q108 146 116 140" fill="none" stroke="#c46a6a" stroke-width="2"/>' };
  // 100, 101 · cầu hoa văn xanh: hạt cầu lưới vàng, các mặt tròn men xanh có chữ (dây xuyên dọc)
  V['23932'] = { xo: 'ong', kl: 'vang', s: '<circle cx="100" cy="100" r="70" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<circle cx="100" cy="100" r="66" fill="none" stroke="' + oK + '" stroke-width="6" stroke-dasharray="1.5 3.5" opacity=".35"/>' +
    '<circle cx="100" cy="100" r="30" fill="#3b78c4" stroke="' + K + '" stroke-width="5"/><path d="M88 90 H112 M100 84 V116 M86 102 H114 M90 112 H110" stroke="' + K + '" stroke-width="3.5"/>' +
    '<path d="M30 80 C40 76 46 90 38 98 C34 104 28 102 30 96 M170 80 C160 76 154 90 162 98 C166 104 172 102 170 96 M30 120 C40 124 46 110 38 102 M170 120 C160 124 154 110 162 102" fill="none" stroke="#3b78c4" stroke-width="5" stroke-linecap="round"/>' + sang(72, 62, 12, 6, -35, .6) };
  V['23931'] = { cung: '23932' };
  // 102 · garnet: mặt garnet tròn lớn trong ổ hoa lưới (xỏ xuyên) — mạ vàng
  V['23782'] = { xo: 'xuyen', kl: 'vang', da: 'garnet', s: '<path d="' + vongHoa(100, 100, 70, 8, 5) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 100, 62, 28, 2.4) + ngocTron(100, 100, 50) };
  // 103 · hoa garnet: chén hoa 8 cánh, garnet giác cắt giữa (xỏ xuyên qua đế lưới)
  V['23791'] = { xo: 'xuyen', kl: 'vang', da: 'garnet', s: lap(8, function (i) { return '<path d="M100 96 C80 84 72 50 86 36 C94 28 106 28 114 36 C128 50 120 84 100 96Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5" transform="rotate(' + i * 45 + ' 100 100)"/>'; }) +
    '<g fill="none" stroke="' + oK + '" stroke-width="1.8" opacity=".45">' + lap(8, function (i) { return '<path d="M100 80 V44" transform="rotate(' + i * 45 + ' 100 100)"/>'; }) + '</g>' +
    '<circle cx="100" cy="100" r="34" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><path d="M100 72 L124 86 L124 114 L100 128 L76 114 L76 86Z" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/><path d="M100 72 L100 128 M76 86 L124 114 M124 86 L76 114" stroke="#fff" stroke-width="1" opacity=".35"/>' };
  // 104 · hoa garnet: garnet tròn trong cầu lưới vàng (xỏ xuyên)
  V['23853'] = { xo: 'xuyen', kl: 'vang', da: 'garnet', s: '<circle cx="100" cy="100" r="72" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="#3b2a12" opacity=".45">' + lap(10, function (i) { return '<path d="M100 32 C112 40 114 54 104 62 L96 62 C86 54 88 40 100 32Z" transform="rotate(' + i * 36 + ' 100 100)"/>'; }) + '</g>' +
    '<circle cx="100" cy="100" r="38" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + ngocTron(100, 100, 30) };
  // 105 · hoa garnet: garnet vuông bo (cushion) viền kim cương (xỏ xuyên)
  V['23796'] = { xo: 'xuyen', kl: 'vang', da: 'garnet', s: '<path d="' + vongHoa(100, 100, 70, 8, 6) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 100, 60, 18, 5) +
    '<rect x="66" y="66" width="68" height="68" rx="16" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><rect x="72" y="72" width="56" height="56" rx="12" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    '<path d="M72 72 L128 128 M128 72 L72 128" stroke="#fff" stroke-width="1" opacity=".3"/>' + sang(88, 86, 9, 5, -30) };
  // 106 · bướm men: bướm vàng tráng men xanh lá & cam (xỏ xuyên qua đế dày)
  V['23942'] = { xo: 'xuyen', kl: 'vang', s: '<path d="M98 98 C86 60 52 44 34 60 C22 74 36 100 94 108Z M102 98 C114 60 148 44 166 60 C178 74 164 100 106 108Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M96 110 C64 114 50 134 60 148 C72 162 92 144 98 120Z M104 110 C136 114 150 134 140 148 C128 162 108 144 102 120Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M92 96 C82 70 58 60 46 68 C40 80 56 96 90 102Z M108 96 C118 70 142 60 154 68 C160 80 144 96 110 102Z" fill="#e8892a"/><path d="M92 114 C70 118 62 132 68 140 C76 148 90 134 94 120Z M108 114 C130 118 138 132 132 140 C124 148 110 134 106 120Z" fill="#e8892a"/>' +
    '<path d="M40 64 C34 76 44 90 60 96 M160 64 C166 76 156 90 140 96 M58 146 C52 136 58 124 70 118 M142 146 C148 136 142 124 130 118" fill="none" stroke="#6cc44a" stroke-width="7" stroke-linecap="round"/>' +
    '<rect x="95" y="80" width="10" height="50" rx="5" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' };
  // 107 · bản tính men xanh: bàn tính, đỉnh mây men xanh, khoen
  V['23919'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V44" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M64 74 C56 58 72 44 86 50 C90 38 110 38 114 50 C128 44 144 58 136 74Z" fill="#3b78c4" stroke="' + oK + '" stroke-width="3"/><path d="M80 62 c6 -6 14 -2 12 4 M120 62 c-6 -6 -14 -2 -12 4" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>' +
    '<rect x="62" y="72" width="76" height="110" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><rect x="72" y="88" width="56" height="80" rx="3" fill="#3b2a12" opacity=".55"/>' +
    lap(8, function (i) { var x = 86 + (i % 2) * 28, y = 96 + Math.floor(i / 2) * 18; return '<rect x="' + (x - 7) + '" y="' + y + '" width="14" height="10" rx="4" fill="' + K + '" stroke="' + oK + '" stroke-width="1.2"/>'; }) + '<path d="M100 88 V168" stroke="' + K + '" stroke-width="3"/>' };
  // 108 · hồ lô quả: hồ lô vàng trơn, cuống lá trên, khoen
  V['23968'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V40" stroke="' + K + '" stroke-width="6"/><path d="M100 40 C112 34 126 38 130 48 C118 52 106 50 100 42Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' +
    '<g transform="translate(100 44) scale(.96) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/></g>' + sang(86, 62, 5, 12, -10, .7) + sang(74, 132, 7, 18, -15, .55) };

  /* ===== đợt 6 ===== */
  function daTrang(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#fff" stroke="#9fb0c4" stroke-width="1.5"/><path d="M' + cx + ' ' + (cy - r) + ' V' + (cy + r) + ' M' + (cx - r) + ' ' + cy + ' H' + (cx + r) + '" stroke="#b9d4ff" stroke-width="1" opacity=".7"/>'; }
  function khoenNoi(y) { return khoen(12) + '<circle cx="100" cy="' + y + '" r="8" fill="none" stroke="' + K + '" stroke-width="4.5"/>'; }
  // 109 · đá trắng: chấu tròn nhỏ một viên đá, khoen đôi
  V['23954'] = { xo: 'treo', s: khoen(16) + '<circle cx="100" cy="66" r="10" fill="none" stroke="' + K + '" stroke-width="5"/>' +
    '<path d="M70 112 C70 92 130 92 130 112 C130 138 116 156 100 156 C84 156 70 138 70 112Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + daTrang(100, 112, 22) +
    lap(4, function (i) { return '<path d="M100 86 l-4 8 h8z" fill="' + K + '" transform="rotate(' + (i * 90 + 45) + ' 100 112)"/>'; }) };
  // 110 · hồ lô xanh: hồ lô thành lưới, mặt men xanh có chữ (xỏ xuyên qua lưới)
  V['23957'] = { xo: 'xuyen', kl: 'vang', s: '<g transform="rotate(90 100 100)"><g transform="translate(100 18) scale(1.1) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="' + HL + '" fill="none" stroke="#3b2a12" stroke-width="9" stroke-dasharray="2 4" opacity=".35" transform="translate(100 102) scale(.88) translate(-100 -102)"/></g>' +
    '<circle cx="100" cy="56" r="18" fill="#3b78c4" stroke="' + K + '" stroke-width="3"/><circle cx="100" cy="130" r="30" fill="#3b78c4" stroke="' + K + '" stroke-width="3"/>' +
    '<path d="M92 52 H108 M100 48 V62 M86 124 H114 M100 116 V146 M90 136 H110" stroke="#fff" stroke-width="3"/></g>' };
  // 111 · cầu bướm xanh: hạt cầu lưới vàng, bướm men xanh trắng (dây xuyên dọc)
  V['23971'] = { xo: 'ong', kl: 'vang', s: '<circle cx="100" cy="100" r="70" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<g fill="none" stroke="#3b2a12" stroke-width="4" opacity=".35">' + lap(10, function (i) { return '<path d="M100 36 a14 14 0 0 1 0 28 a14 14 0 0 1 0 -28" transform="rotate(' + i * 36 + ' 100 100)"/>'; }) + '</g>' +
    '<path d="M98 98 C86 70 60 62 52 78 C46 92 66 104 96 104Z M102 98 C114 70 140 62 148 78 C154 92 134 104 104 104Z" fill="#3b78c4" stroke="' + K + '" stroke-width="3"/>' +
    '<path d="M96 108 C76 110 66 124 74 134 C82 142 94 128 98 114Z M104 108 C124 110 134 124 126 134 C118 142 106 128 102 114Z" fill="#eaf2ff" stroke="' + K + '" stroke-width="3"/><path d="M100 82 V130" stroke="' + K + '" stroke-width="5"/>' };
  // 112 · bướm men: viền vàng, men xanh lá, hoa vàng & chấm hồng (xỏ xuyên qua đế)
  V['23941'] = { xo: 'xuyen', s: '<path d="M98 98 C86 56 50 40 32 58 C20 72 36 100 94 108Z M102 98 C114 56 150 40 168 58 C180 72 164 100 106 108Z M96 110 C64 114 50 136 60 150 C72 164 92 146 98 120Z M104 110 C136 114 150 136 140 150 C128 164 108 146 102 120Z" fill="#4cb84a" stroke="' + K + '" stroke-width="6" stroke-linejoin="round"/>' +
    [[62, 70], [138, 70], [74, 134], [126, 134]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="12" fill="' + K + '" stroke="' + oK + '" stroke-width="1.5"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="4" fill="#e8892a"/>'; }).join('') +
    '<circle cx="84" cy="94" r="4" fill="#e85a8a"/><circle cx="116" cy="94" r="4" fill="#e85a8a"/><rect x="95" y="78" width="10" height="54" rx="5" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' };
  // 113 · bướm treo: bướm men cam, viền xanh lá, khoen
  V['23950'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V58" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M98 96 C88 64 58 52 42 66 C32 78 44 100 94 104Z M102 96 C112 64 142 52 158 66 C168 78 156 100 106 104Z M96 108 C68 112 56 132 64 146 C74 160 92 142 98 118Z M104 108 C132 112 144 132 136 146 C126 160 108 142 102 118Z" fill="#e8892a" stroke="#6cc44a" stroke-width="7" stroke-linejoin="round"/>' +
    '<path d="M98 96 C88 64 58 52 42 66 C32 78 44 100 94 104Z M102 96 C112 64 142 52 158 66 C168 78 156 100 106 104Z M96 108 C68 112 56 132 64 146 C74 160 92 142 98 118Z M104 108 C132 112 144 132 136 146 C126 160 108 142 102 118Z" fill="none" stroke="' + oK + '" stroke-width="1.2"/>' +
    '<rect x="95" y="70" width="10" height="64" rx="5" fill="#3b78c4" stroke="' + K + '" stroke-width="2"/>' };
  // 114 · garnet: dáng mắt (hạnh nhân) chạm lưới, garnet tròn giữa (xỏ xuyên)
  V['23855'] = { xo: 'xuyen', da: 'garnet', s: '<path d="M18 100 C40 54 76 38 100 38 C124 38 160 54 182 100 C160 146 124 162 100 162 C76 162 40 146 18 100Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M30 100 C50 62 80 50 100 50 C120 50 150 62 170 100 C150 138 120 150 100 150 C80 150 50 138 30 100Z" fill="none" stroke="' + oK + '" stroke-width="2.4" stroke-dasharray="1.5 4" stroke-linecap="round" opacity=".7"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"><path d="M44 100 c10 -14 22 -14 26 0 c-4 14 -16 14 -26 0 M156 100 c-10 -14 -22 -14 -26 0 c4 14 16 14 26 0"/></g>' +
    '<circle cx="100" cy="100" r="30" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + ngocTron(100, 100, 23) };
  // 115 · phỉ thuý đa sắc: ống nhỏ đính đá, ba nhánh xích treo lá ngọc xanh, tím, vàng
  V['24201'] = { xo: 'treo', s: '<rect x="88" y="10" width="24" height="26" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="100" cy="23" r="4" fill="#d4235a"/>' +
    [[-30, '#b8e0c0', 150], [0, '#d6c6ee', 176], [30, '#f2d79a', 146]].map(function (n) { var x = 100 + n[0], y = n[2];
      return '<path d="M100 36 L' + x + ' ' + (y - 40) + '" stroke="' + K + '" stroke-width="2.2" stroke-dasharray="3 2"/><circle cx="' + x + '" cy="' + (y - 36) + '" r="5" fill="' + K + '"/>' +
        '<path d="M' + x + ' ' + (y - 32) + ' C' + (x + 16) + ' ' + (y - 22) + ' ' + (x + 14) + ' ' + y + ' ' + x + ' ' + (y + 10) + ' C' + (x - 14) + ' ' + y + ' ' + (x - 16) + ' ' + (y - 22) + ' ' + x + ' ' + (y - 32) + 'Z" fill="' + n[1] + '" stroke="#7a9a80" stroke-width="1.5"/><path d="M' + x + ' ' + (y - 28) + ' V' + (y + 6) + '" stroke="#fff" stroke-width="1.2" opacity=".6"/>'; }).join('') };
  // 116 · tròn lục đế: ngọc tròn, viền hạt, lưng hoa lưới (xỏ xuyên)
  V['24195'] = { xo: 'xuyen', s: '<circle cx="100" cy="100" r="70" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 100, 63, 34, 2.4) + '<circle cx="100" cy="100" r="56" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + ngocTron(100, 100, 50) };
  // 117 · hoa lục đế: mặt ngọc chạm hoa sen 8 cánh (xỏ xuyên qua đế)
  V['24190'] = { xo: 'xuyen', s: '<path d="' + vongHoa(100, 100, 72, 8, 5) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="' + vongHoa(100, 100, 62, 8, 6) + '" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.4" opacity=".5">' + lap(8, function (i) { return '<path d="M100 82 C90 70 90 52 100 44 C110 52 110 70 100 82Z" transform="rotate(' + i * 45 + ' 100 100)"/>'; }) + '</g><circle cx="100" cy="100" r="12" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' + sang(76, 68, 12, 6, -40) };
  // 118 · hồ lô lục đế: ổ hình khiên nhọn đáy, đá trắng vai, lưng lưới (xỏ xuyên)
  V['24134'] = { xo: 'xuyen', s: '<path d="M44 46 C70 30 130 30 156 46 C164 90 148 140 100 182 C52 140 36 90 44 46Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatDiem([[56, 50], [70, 42], [130, 42], [144, 50]], 4.4) +
    '<path d="M54 56 C76 44 124 44 146 56 C152 94 138 136 100 170 C62 136 48 94 54 56Z" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"/>' + hoLo(52, .74) };
  // 119 · phỉ thuý lục đế: ngọc vuông bo trong khung tròn chạm, đá trắng bốn góc (xỏ xuyên)
  V['24205'] = { xo: 'xuyen', s: '<path d="' + vongHoa(100, 100, 72, 4, 6) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5">' + lap(4, function (i) { return '<path d="M60 60 c-6 10 0 20 10 18" transform="rotate(' + i * 90 + ' 100 100)"/>'; }) + '</g>' + hatDiem([[54, 100], [146, 100], [100, 54], [100, 146]], 5) +
    '<rect x="62" y="62" width="76" height="76" rx="20" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><rect x="68" y="68" width="64" height="64" rx="16" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' + sang(86, 84, 12, 6, -35) };
  // 120 · vuông đính đá: tấm vuông xoay, chạm lưới, đá trắng giữa, khoen ở đỉnh
  V['23918'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V44" stroke="' + K + '" stroke-width="6"/><path d="M100 44 L160 112 L100 180 L40 112Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M100 60 L146 112 L100 164 L54 112Z" fill="none" stroke="' + oK + '" stroke-width="2.4" stroke-dasharray="1.5 4" stroke-linecap="round" opacity=".7"/>' + daTrang(100, 112, 13) };
  // 121 · đính đá: hộp vuông nhỏ đá trắng, khoen
  V['23929'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V60" stroke="' + K + '" stroke-width="6"/><rect x="58" y="60" width="84" height="84" rx="10" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<rect x="68" y="70" width="64" height="64" rx="5" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"/>' + daTrang(100, 102, 20) + sang(70, 76, 4, 14, 0, .5) };
  // 122 · bát sen: đài sen úp (chụp hạt) có khoen bên dưới
  V['23936'] = { xo: 'treo', s: khoen(10) + '<path d="M100 30 V46" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 46 C70 50 52 70 50 96 L150 96 C148 70 130 50 100 46Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(6, function (i) { var x = 58 + i * 17; return '<path d="M100 50 Q' + x + ' 60 ' + (x + 2) + ' 96" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55"/>'; }) +
    '<circle cx="100" cy="138" r="34" fill="none" stroke="' + oK + '" stroke-width="13"/><circle cx="100" cy="138" r="34" fill="none" stroke="' + K + '" stroke-width="10"/><path d="M100 96 V104" stroke="' + K + '" stroke-width="6"/>' };
  // 123 · lông vũ: lông vũ cong, đá trắng ở ngọn, khoen
  V['23921'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="5"/>' +
    '<path d="M100 48 C124 66 132 110 112 150 C104 166 94 178 84 186 C84 160 72 128 76 98 C78 76 88 58 100 48Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M98 56 C102 90 98 140 86 182" fill="none" stroke="' + oK + '" stroke-width="2.2"/>' + lap(7, function (i) { var y = 70 + i * 15; return '<path d="M' + (99 - i) + ' ' + y + ' L' + (118 - i * 2) + ' ' + (y - 8) + ' M' + (98 - i) + ' ' + (y + 6) + ' L' + (80 - i) + ' ' + (y - 2) + '" stroke="' + oK + '" stroke-width="1.6" opacity=".55"/>'; }) + daTrang(86, 182, 7) };
  // 124 · kim tiền: đồng xu lỗ hình sao 4 cánh, khoen
  V['24117'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/><circle cx="100" cy="116" r="66" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="116" r="56" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55"/>' +
    '<path d="M100 76 C104 100 116 112 140 116 C116 120 104 132 100 156 C96 132 84 120 60 116 C84 112 96 100 100 76Z" fill="#3b2a12" opacity=".55"/>' + sang(68, 84, 12, 5, -40, .6) };
  // 125 · ngựa (bập bênh men trắng hồng): ngựa men trắng, yên đỏ xanh, chân bập bênh vàng (xỏ xuyên)
  V['B0529'] = { xo: 'xuyen', s: '<path d="M34 150 Q100 182 166 150" fill="none" stroke="' + oK + '" stroke-width="13" stroke-linecap="round"/><path d="M34 150 Q100 182 166 150" fill="none" stroke="' + K + '" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M50 150 L56 112 C48 104 44 88 54 78 L72 84 L120 84 C126 64 140 52 156 56 C166 58 170 70 164 80 L152 92 C154 112 150 128 146 150 L130 150 L126 120 L80 120 L72 150Z" fill="#fbf7f0" stroke="#c49aa8" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M76 84 C80 104 116 104 120 84Z" fill="#e8b3c4"/><path d="M78 86 C84 100 112 100 118 86" fill="none" stroke="#d4302a" stroke-width="4"/><path d="M80 94 C88 104 108 104 116 94" fill="none" stroke="#2e9f6e" stroke-width="3"/>' +
    '<path d="M150 58 C146 48 136 44 128 50" fill="none" stroke="#d4302a" stroke-width="4"/><circle cx="152" cy="70" r="3.5" fill="#3b2a12"/><path d="M160 80 C166 86 168 92 162 96" fill="#f2a3b8"/>' + lap(5, function (i) { return '<circle cx="' + (66 + i * 18) + '" cy="' + (108 + (i % 2) * 6) + '" r="2.5" fill="#d4302a"/>'; }) };
  // 126 · hoa bồ công anh: hoa cúc vàng nhiều cánh, đá trắng nhuỵ, khoen
  V['23962'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V54" stroke="' + K + '" stroke-width="6"/>' + lap(16, function (i) { return '<path d="M100 114 L92 66 C94 58 106 58 108 66Z" fill="' + K + '" stroke="' + oK + '" stroke-width="1.8" transform="rotate(' + i * 22.5 + ' 100 114)"/>'; }) +
    '<circle cx="100" cy="114" r="16" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + daTrang(100, 114, 9) };
  // 127 · khánh bình an: khoá như ý viền mây cuộn, đá trắng, khoen
  V['BS128'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V54" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 186 C66 168 40 146 38 116 C30 106 32 86 46 82 C50 66 66 58 80 64 C86 56 94 54 100 58 C106 54 114 56 120 64 C134 58 150 66 154 82 C168 86 170 106 162 116 C160 146 134 168 100 186Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".6"><path d="M50 90 c8 -10 22 -6 20 6 c-2 8 -12 8 -12 0 M150 90 c-8 -10 -22 -6 -20 6 c2 8 12 8 12 0 M66 148 c6 -6 16 -2 14 6 M134 148 c-6 -6 -16 -2 -14 6"/></g>' +
    hatDiem([[100, 96], [100, 116], [100, 136]], 7) };
  // 128 · charm hoa 4 cánh nhọn đính đá, khoen
  V['16481'] = { xo: 'treo', s: khoen(16) + '<path d="M100 42 V60" stroke="' + K + '" stroke-width="6"/>' + lap(4, function (i) { return '<path d="M100 120 C86 108 82 84 100 64 C118 84 114 108 100 120Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5" transform="rotate(' + (i * 90 + 45) + ' 100 120)"/>' +
      '<circle cx="100" cy="88" r="7" fill="#fff" stroke="#9fb0c4" stroke-width="1.2" transform="rotate(' + (i * 90 + 45) + ' 100 120)"/>'; }) + '<circle cx="100" cy="120" r="8" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' };
  // 129 · bát sen: chụp hoa sen nhỏ (hoa 6 cánh đính đá) gắn khoen
  V['A5320'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/><path d="' + vongHoa(100, 112, 58, 6, 12) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(6, function (i) { return '<circle cx="100" cy="72" r="4" fill="' + oK + '" opacity=".35" transform="rotate(' + i * 60 + ' 100 112)"/>'; }) + '<circle cx="100" cy="112" r="18" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + daTrang(100, 112, 11) };
  // 130 · sao: sao phồng vàng, mặt đính chùm đá, khoen
  V['23965'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V56" stroke="' + K + '" stroke-width="6"/>' + (function () {
      var d = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 32 : 68; d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (124 + r * Math.sin(a)).toFixed(1); }
      return '<path d="' + d + 'Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' + hatDiem([[100, 106], [86, 120], [114, 120], [92, 136], [108, 136], [100, 122]], 6);
    })() };
  // 131 · cỏ 4 lá: cỏ 4 lá viền hạt, đá trắng giữa, khoen
  V['23927'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V54" stroke="' + K + '" stroke-width="6"/><path d="' + vongHoa(100, 118, 54, 4, 14) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3" transform="rotate(45 100 118)"/>' +
    '<path d="' + vongHoa(100, 118, 46, 4, 12) + '" fill="none" stroke="' + oK + '" stroke-width="2.4" stroke-dasharray="1.5 4" stroke-linecap="round" opacity=".7" transform="rotate(45 100 118)"/>' + daTrang(100, 118, 13) };
  // 132 · ngựa bập bênh vàng: ngựa vàng, chân bập bênh lát đá, khoen
  V['23943'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V56" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M36 170 Q100 196 164 170" fill="none" stroke="' + oK + '" stroke-width="15" stroke-linecap="round"/><path d="M36 170 Q100 196 164 170" fill="none" stroke="' + K + '" stroke-width="11" stroke-linecap="round"/>' + hatDiem([[54, 178], [74, 184], [94, 187], [114, 186], [134, 182], [152, 175]], 3.4) +
    '<path d="M54 170 L60 130 C52 122 48 106 58 96 L76 102 L118 102 C124 82 138 68 152 72 C162 76 164 88 158 98 L146 110 C148 130 146 150 142 170 L126 170 L122 138 L80 138 L72 170Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M80 104 C86 120 112 120 118 104" fill="none" stroke="' + oK + '" stroke-width="2.5" opacity=".6"/><circle cx="148" cy="86" r="3.5" fill="#3b2a12"/>' + sang(92, 112, 12, 4, 0, .5) };

  /* ===== đợt 7 ===== */
  function nham(path, op) { return '<path d="' + path + '" fill="none" stroke="' + oK + '" stroke-width="6" stroke-dasharray="1 4" opacity="' + (op || .3) + '"/>'; }
  // 133 · ngựa cõng túi tiền: ngựa vàng nhìn ngang, túi tiền trên lưng, mắt đá (xỏ xuyên thân)
  V['23999'] = { xo: 'xuyen', s: '<path d="M40 150 L44 112 C34 104 30 84 42 72 L60 80 L112 80 C118 60 134 46 152 50 C164 54 170 68 162 80 L150 94 C152 116 150 134 146 150 L128 150 L124 124 L64 124 L58 150Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M72 80 C64 60 70 40 88 36 L104 36 C120 40 124 60 116 80Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="M80 40 Q96 30 112 40" fill="none" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M62 90 C78 110 110 110 124 90" fill="none" stroke="' + oK + '" stroke-width="2.5" opacity=".6"/>' + lap(5, function (i) { return '<circle cx="' + (70 + i * 12) + '" cy="' + (100 + (i % 2) * 6) + '" r="2.4" fill="' + oK + '" opacity=".45"/>'; }) +
    '<circle cx="150" cy="66" r="4" fill="#fff" stroke="#9fb0c4"/>' + sang(88, 52, 5, 10, 10, .6) };
  // 134 · hồ lô khoét: đĩa tròn khoét hình hồ lô, viền nhám, khoen
  V['23979'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/><circle cx="100" cy="118" r="68" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + nham('M100 56 A62 62 0 1 1 99.9 56Z', .35) +
    '<g transform="translate(100 74) scale(.56) translate(-100 -28)"><path d="' + HL + '" fill="#f4eee3" stroke="' + oK + '" stroke-width="5"/></g>' + sang(66, 92, 6, 16, 20, .55) };
  // 135 · lục phi diệp: lá bạch quả (quạt) mặt nhám, viền hạt, khoen
  V['24042'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V60" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 60 L38 128 C46 160 72 178 100 176 C112 182 132 176 148 162 C164 150 168 136 162 128Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' + nham('M100 76 L54 128 C60 152 80 166 100 164 C120 166 142 152 150 128Z', .4) +
    '<path d="M100 172 V150" stroke="' + oK + '" stroke-width="2.5"/>' + hatDiem([[48, 140], [58, 156], [74, 168], [126, 168], [142, 156], [152, 140]], 3) };
  // 136, 139 · hồ lô dẹt mặt nhám, khoen
  V['23966'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V44" stroke="' + K + '" stroke-width="6"/><g transform="translate(100 42) scale(.98) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="' + HL + '" fill="none" stroke="' + oK + '" stroke-width="9" stroke-dasharray="1 4" opacity=".3" transform="translate(100 102) scale(.84) translate(-100 -102)"/></g>' + sang(80, 140, 6, 18, -10, .5) };
  V['24037'] = { cung: '23966' };
  // 137 · tam giác: tấm tam giác mặt nhám, ô vuông chữ phúc giữa, khoen
  V['24031'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/><path d="M100 50 L172 176 L28 176Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' + nham('M100 70 L156 166 L44 166Z', .35) +
    '<rect x="80" y="120" width="40" height="40" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><path d="M88 130 H112 M100 126 V156 M88 144 H112 M90 152 H110" stroke="' + oK + '" stroke-width="2.5" opacity=".7"/>' };
  // 138 · xin keo: quả cầu ghép hai nửa — nửa trơn, nửa chạm lưới, khoen
  V['24010'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 50 C58 52 36 84 36 118 C36 152 60 182 100 184 C80 160 74 132 74 118 C74 98 82 70 100 50Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M100 50 C142 52 164 84 164 118 C164 152 140 182 100 184 C120 160 126 132 126 118 C126 98 118 70 100 50Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M100 50 C88 74 82 98 82 118 C82 140 88 162 100 184 C112 162 118 140 118 118 C118 98 112 74 100 50Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="#3b2a12" stroke-width="3" opacity=".45">' + lap(4, function (i) { var y = 80 + i * 26; return '<path d="M130 ' + y + ' c10 4 16 14 10 22 c-6 6 -14 0 -10 -6"/>'; }) + '</g>' + sang(58, 96, 7, 18, 15, .6) };
  // 140 · ấm trà: ấm tròn chạm hoa, đá đỏ, vòi & quai, khoen
  V['23972'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M68 70 C66 56 134 56 132 70Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/><circle cx="100" cy="56" r="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' +
    '<ellipse cx="100" cy="122" rx="58" ry="52" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="M44 104 C26 98 18 82 24 72 L36 100Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' +
    '<path d="M156 100 C176 96 182 126 158 140" fill="none" stroke="' + K + '" stroke-width="8"/><path d="M156 100 C176 96 182 126 158 140" fill="none" stroke="' + oK + '" stroke-width="1.2"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5">' + lap(6, function (i) { return '<path d="M100 122 m0 -30 c8 6 8 16 0 22" transform="rotate(' + i * 60 + ' 100 122)"/>'; }) + '</g><circle cx="100" cy="122" r="9" fill="#d4235a" stroke="' + oK + '" stroke-width="2"/>' };
  // 141 · hồ lô treo: hồ lô lưới phía trên, xích dài, hồ lô nhỏ ở đuôi
  V['24014'] = { xo: 'treo', s: khoen(9) + '<g transform="translate(100 28) scale(.42) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="7"/><path d="' + HL + '" fill="none" stroke="#3b2a12" stroke-width="20" stroke-dasharray="3 9" opacity=".4" transform="translate(100 102) scale(.7) translate(-100 -102)"/></g>' +
    lap(7, function (i) { return '<ellipse cx="100" cy="' + (96 + i * 9) + '" rx="2.6" ry="4.2" fill="none" stroke="' + K + '" stroke-width="2"/>'; }) +
    '<g transform="translate(100 156) scale(.28) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="9"/></g>' };
  // 142 · thẻ bài: thẻ bầu dục dài, hoa văn chữ phúc lưới, đá trắng, khoen
  V['23960'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/><rect x="62" y="48" width="76" height="140" rx="34" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="3" opacity=".6"><path d="M78 74 H122 V160 H78Z M78 96 H122 M78 118 H122 M78 140 H122 M100 74 V160"/></g>' + daTrang(100, 66, 6) };
  // 143 · hoa mai ngọc du long: ngọc xanh chạm hoa 5 cánh, viền đá trắng (xỏ xuyên qua đế)
  V['23779'] = { xo: 'xuyen', da: 'lucde', s: '<path d="' + vongHoa(100, 100, 72, 5, 9) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(30, function (i) { var a = i / 30 * Math.PI * 2, r = 66 + 8 * Math.cos(a * 5); return '<circle cx="' + (100 + r * Math.cos(a)).toFixed(1) + '" cy="' + (100 + r * Math.sin(a)).toFixed(1) + '" r="3" fill="#fff" stroke="#b9c4d0" stroke-width=".8"/>'; }) +
    '<path d="' + vongHoa(100, 100, 54, 5, 8) + '" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.4" opacity=".5">' + lap(5, function (i) { return '<path d="M100 92 C90 80 90 62 100 52 C110 62 110 80 100 92Z" transform="rotate(' + i * 72 + ' 100 100)"/>'; }) + '</g>' + sang(80, 74, 12, 6, -40) };
  // 144 · bướm lưới: bướm vàng chạm rỗng (xỏ xuyên qua thân)
  V['23838'] = { xo: 'xuyen', s: '<path d="M98 98 C86 58 50 42 32 60 C20 74 36 100 94 108Z M102 98 C114 58 150 42 168 60 C180 74 164 100 106 108Z M96 110 C64 114 50 136 60 150 C72 164 92 146 98 120Z M104 110 C136 114 150 136 140 150 C128 164 108 146 102 120Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<g fill="#3b2a12" opacity=".4"><path d="M90 98 C80 74 60 62 46 70 C40 80 52 96 86 102Z M110 98 C120 74 140 62 154 70 C160 80 148 96 114 102Z M92 114 C72 118 64 132 70 140 C78 148 90 134 94 120Z M108 114 C128 118 136 132 130 140 C122 148 110 134 106 120Z"/></g>' +
    '<g fill="none" stroke="' + K + '" stroke-width="3"><path d="M88 98 C74 84 60 76 50 76 M112 98 C126 84 140 76 150 76 M64 92 L70 72 M136 92 L130 72"/></g><rect x="94" y="78" width="12" height="56" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' };
  // 145 · thanh đá tour: thanh chữ nhật mặt nhám, ba đá tourmaline hồng (nằm dọc dây)
  V['23826'] = { xo: 'ong', s: '<rect x="18" y="64" width="164" height="72" rx="10" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' + nham('M28 76 H172 M28 92 H172 M28 108 H172 M28 124 H172', .3) +
    [50, 100, 150].map(function (x) { return '<circle cx="' + x + '" cy="100" r="10" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="' + x + '" cy="100" r="7" fill="#f2a6c0" stroke="#b05080" stroke-width="1"/>'; }).join('') + '<rect x="26" y="70" width="148" height="6" rx="3" fill="#fff" opacity=".45"/>' };
  // 146 · đá vuông: đá vàng chanh giác vuông, viền đá trắng (xỏ xuyên qua đế)
  V['23794'] = { xo: 'xuyen', s: '<g transform="rotate(45 100 100)"><rect x="36" y="36" width="128" height="128" rx="22" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(24, function (i) { var s = Math.floor(i / 6), t = (i % 6) / 6, x = [48 + t * 104, 152, 152 - t * 104, 48][s], y = [48, 48 + t * 104, 152, 152 - t * 104][s]; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5" fill="#fff" stroke="#b9c4d0" stroke-width=".8"/>'; }) +
    '<rect x="62" y="62" width="76" height="76" rx="8" fill="#d8e65a" stroke="#8a9a20" stroke-width="2"/><path d="M62 62 L138 138 M138 62 L62 138 M74 74 H126 V126 H74Z" fill="none" stroke="#fff" stroke-width="1.2" opacity=".55"/></g>' };
  // 147 · garnet cà rốt: garnet giọt nước + hai lá đá trắng (xỏ xuyên ngang)
  V['23849'] = { xo: 'xuyen', da: 'garnet', s: '<g transform="rotate(-90 100 100)"><path d="M100 54 C126 62 142 86 136 116 C130 144 112 166 100 180 C88 166 70 144 64 116 C58 86 74 62 100 54Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M100 62 C120 70 132 90 128 114 C122 138 110 156 100 168 C90 156 78 138 72 114 C68 90 80 70 100 62Z" fill="' + D + '" stroke="' + oD + '" stroke-width="2"/><path d="M100 64 V166 M76 100 L124 100 M80 130 L120 82 M80 82 L120 130" stroke="#fff" stroke-width="1" opacity=".35"/>' +
    '<path d="M98 56 C84 44 80 28 86 18 C96 26 102 40 98 56Z" fill="#fff" stroke="#9fb0c4" stroke-width="1.5"/><path d="M102 56 C116 44 120 28 114 18 C104 26 98 40 102 56Z" fill="#fff" stroke="#9fb0c4" stroke-width="1.5"/></g>' };
  // 148 · móc xoáy: ống hoa văn chữ vạn, hai đầu vương miện (nằm dọc dây)
  V['24069'] = { xo: 'ong', s: '<rect x="30" y="62" width="140" height="76" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".6">' + lap(5, function (i) { var x = 44 + i * 24; return '<path d="M' + x + ' 82 h14 v14 h-8 v-6 M' + x + ' 118 h14 v-14"/>'; }) + '<path d="M30 74 H170 M30 126 H170"/></g>' +
    [0, 1].map(function (m) { return '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + '><rect x="14" y="56" width="20" height="88" rx="4" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + lap(4, function (i) { return '<path d="M14 ' + (60 + i * 22) + ' l-6 8 l6 8" fill="' + K + '" stroke="' + oK + '" stroke-width="1.5"/>'; }) + '</g>'; }).join('') };
  // 149 · hoa ngọc nam hồng: hoa 6 cánh vàng, hạt san hô đỏ giữa, đá trắng đầu cánh (xỏ xuyên qua đế)
  V['23851'] = { xo: 'xuyen', s: lap(6, function (i) { return '<path d="M100 96 C80 84 70 56 82 38 C90 28 110 28 118 38 C130 56 120 84 100 96Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5" transform="rotate(' + i * 60 + ' 100 100)"/>' +
      '<path d="M100 84 V46" stroke="' + oK + '" stroke-width="1.8" opacity=".45" transform="rotate(' + i * 60 + ' 100 100)"/><circle cx="100" cy="34" r="4.4" fill="#fff" stroke="#b9c4d0" transform="rotate(' + (i * 60 + 30) + ' 100 100)"/>'; }) +
    '<circle cx="100" cy="100" r="22" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="100" cy="100" r="15" fill="#d8452f" stroke="#8a2414" stroke-width="1.5"/>' + sang(95, 95, 5, 3, -30) };
  // 150 · khoá hoa sen: hạt hai đài sen úp đối xứng (nơ), cánh gân (nằm dọc dây)
  V['24051'] = { xo: 'ong', s: [0, 1].map(function (m) { return '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + '><path d="M90 84 C70 70 40 56 22 60 C14 76 14 124 22 140 C40 144 70 130 90 116Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
      '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55">' + lap(5, function (i) { return '<path d="M88 100 L' + (24 + (i % 2) * 6) + ' ' + (66 + i * 17) + '"/>'; }) + '</g></g>'; }).join('') +
    '<rect x="84" y="80" width="32" height="40" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="M84 92 H116 M84 108 H116" stroke="' + oK + '" stroke-width="2" opacity=".55"/>' };
  // 151 · lu thống: trụ dài chạm hoa văn, đầu lưới tròn (nằm dọc dây)
  V['24056'] = { xo: 'ong', s: '<rect x="20" y="58" width="160" height="84" rx="26" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5"/>' +
    '<path d="M60 58 V142 M100 58 V142 M140 58 V142" stroke="' + oK + '" stroke-width="3" opacity=".6"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55">' + lap(4, function (i) { var x = 40 + i * 40; return '<path d="M' + (x - 10) + ' 82 c6 -8 20 -8 20 0 c0 8 -12 10 -12 2 M' + (x - 10) + ' 118 c6 8 20 8 20 0 c0 -8 -12 -10 -12 -2"/>'; }) + '</g>' + bongOng(160, 84) };
  // 152 · bướm men hồng xanh, đá trắng thân (ống xỏ ngang dưới thân)
  V['23947'] = { xo: 'xuyen', s: '<path d="M98 96 C88 58 54 40 34 54 C20 66 34 96 94 106Z M102 96 C112 58 146 40 166 54 C180 66 166 96 106 106Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M94 110 C66 114 52 132 62 146 C74 160 92 142 98 120Z M106 110 C134 114 148 132 138 146 C126 160 108 142 102 120Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M90 92 C80 66 58 56 44 62 C38 72 52 90 88 98Z M110 92 C120 66 142 56 156 62 C162 72 148 90 112 98Z" fill="#ef9ab6"/><path d="M48 66 C46 76 56 86 70 90 M152 66 C154 76 144 86 130 90" fill="none" stroke="#5cc47a" stroke-width="6" stroke-linecap="round"/>' +
    hatDiem([[80, 104], [120, 104], [76, 124], [124, 124]], 4) + '<rect x="94" y="80" width="12" height="52" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[100, 90], [100, 104], [100, 118]], 3.4) };
  // 153 · khoá: ổ khoá lát đá, quai trên đầu
  V['23933'] = { xo: 'treo', s: '<path d="M74 74 V50 C74 28 126 28 126 50 V74" fill="none" stroke="' + oK + '" stroke-width="13"/><path d="M74 74 V50 C74 28 126 28 126 50 V74" fill="none" stroke="' + K + '" stroke-width="10"/>' +
    '<rect x="50" y="72" width="100" height="110" rx="14" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + lap(20, function (i) { return '<circle cx="' + (66 + (i % 5) * 17) + '" cy="' + (88 + Math.floor(i / 5) * 24) + '" r="6" fill="#fff" stroke="#b9c4d0" stroke-width=".9"/>'; }) };
  // 154 · trăng treo: lưỡi liềm đính đá, khoen
  V['23949'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M112 48 C70 52 46 88 48 122 C50 158 80 184 116 182 C90 168 78 144 78 118 C78 90 92 64 112 48Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    hatDiem([[96, 64], [84, 80], [74, 98], [68, 118], [70, 138], [78, 156], [92, 170]], 5.2) };
  // 155 · sao 4 cánh: sao lát đá, khoen nối hai đầu (nằm dọc dây)
  V['23945'] = { xo: 'ong', s: '<circle cx="20" cy="100" r="10" fill="none" stroke="' + K + '" stroke-width="5"/><circle cx="180" cy="100" r="10" fill="none" stroke="' + K + '" stroke-width="5"/>' +
    '<path d="M30 100 H48 M152 100 H170" stroke="' + K + '" stroke-width="5"/><path d="M100 46 C106 78 122 94 152 100 C122 106 106 122 100 154 C94 122 78 106 48 100 C78 94 94 78 100 46Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    hatDiem([[100, 72], [100, 128], [74, 100], [126, 100], [100, 100], [88, 88], [112, 88], [88, 112], [112, 112]], 4.4) };
  // 156 · ngọc du long (bạc): khung vuông bo bạc, ngọc xanh tròn (xỏ xuyên qua đế lưới)
  V['23879'] = { xo: 'xuyen', kl: 'bac', da: 'lucde', s: '<rect x="30" y="30" width="140" height="140" rx="34" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(4, function (i) { return '<rect x="40" y="94" width="18" height="12" rx="2" fill="#fff" stroke="#9fb0c4" stroke-width="1" transform="rotate(' + i * 90 + ' 100 100)"/>'; }) + hatTron(100, 100, 56, 16, 3.4) +
    '<circle cx="100" cy="100" r="44" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + ngocTron(100, 100, 37) };

  /* ===== đợt 8 ===== */
  function chuNham(x, y, s) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')" fill="none" stroke="' + oK + '" stroke-width="2.6" opacity=".65"><path d="M-12 -14 H12 M0 -18 V18 M-12 -2 H12 M-9 10 H9 M-14 18 H14"/></g>'; }
  var MAY = 'M100 186 C66 168 40 146 38 116 C30 106 32 86 46 82 C50 66 66 58 80 64 C86 56 94 54 100 58 C106 54 114 56 120 64 C134 58 150 66 154 82 C168 86 170 106 162 116 C160 146 134 168 100 186Z';
  // 157 · bướm lưới nhỏ, đá trắng, khoen
  V['23952'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V62" stroke="' + K + '" stroke-width="6"/><g transform="translate(0 16)">' + V['23838'].s.replace(/<rect[^>]*\/>$/, '') + '</g>' + daTrang(100, 116, 7) };
  // 158 · khánh bình an mây nhám, chữ giữa, khoen
  V['24083'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V54" stroke="' + K + '" stroke-width="6"/><path d="' + MAY + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + nham('M60 96 C70 80 130 80 140 96 C150 120 130 160 100 172 C70 160 50 120 60 96Z', .3) + chuNham(100, 118, 1.3) };
  // 159 · chuông: chuông vàng nhám, vành đá, móc càng cua
  V['24077'] = { xo: 'treo', s: mocCua() + '<rect x="92" y="62" width="16" height="18" rx="5" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' +
    '<path d="M100 78 C74 80 62 104 60 132 C58 152 52 160 44 166 L156 166 C148 160 142 152 140 132 C138 104 126 80 100 78Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + nham('M74 110 C76 94 124 94 126 110', .35) +
    '<rect x="42" y="162" width="116" height="12" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[54, 168], [68, 168], [82, 168], [96, 168], [110, 168], [124, 168], [138, 168]], 4) + sang(78, 112, 6, 18, 10, .55) };
  // 160 · chữ phúc treo: đồng tròn chữ phúc hình học rỗng, khoen
  V['24030'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/><circle cx="100" cy="116" r="66" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><circle cx="100" cy="116" r="56" fill="#3b2a12" opacity=".5"/>' +
    '<g fill="none" stroke="' + K + '" stroke-width="7" stroke-linecap="square"><path d="M62 84 H138 V148 H62Z M78 100 H122 V132 H78Z M100 70 V84 M100 148 V162 M48 116 H62 M138 116 H152 M90 116 H110"/></g>' };
  // 161 · tròn: đồng tròn nhám có chữ, khoen
  V['24093'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/><circle cx="100" cy="116" r="66" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + nham('M100 56 A60 60 0 1 1 99.9 56Z', .35) +
    chuNham(76, 116, 1) + chuNham(100, 116, 1) + chuNham(124, 116, 1) + '<path d="M54 92 C60 78 76 66 92 62" fill="none" stroke="#fff" stroke-width="4" opacity=".4" stroke-linecap="round"/>' };
  // 162 · chữ X: vòng hai dải chéo đính đá hồng & trắng (dây xuyên qua lỗ giữa — nhìn ngang)
  V['24000'] = { xo: 'ong', s: '<path d="M44 40 L156 160 M156 40 L44 160" stroke="' + oK + '" stroke-width="38" stroke-linecap="round"/><path d="M44 40 L156 160 M156 40 L44 160" stroke="' + K + '" stroke-width="32" stroke-linecap="round"/>' +
    lap(7, function (i) { var t = i / 6; return '<circle cx="' + (50 + t * 100).toFixed(1) + '" cy="' + (46 + t * 108).toFixed(1) + '" r="6.5" fill="' + (i % 2 ? '#fff' : '#e8a6d0') + '" stroke="#9fb0c4" stroke-width="1"/>'; }) +
    lap(7, function (i) { var t = i / 6; return i === 3 ? '' : '<circle cx="' + (150 - t * 100).toFixed(1) + '" cy="' + (46 + t * 108).toFixed(1) + '" r="6.5" fill="' + (i % 2 ? '#e8a6d0' : '#fff') + '" stroke="#9fb0c4" stroke-width="1"/>'; }) };
  // 163 · túi tiền: túi nhám chấm hạt, chữ, khoen
  V['23998'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M76 66 C56 86 42 116 48 144 C54 170 78 180 100 180 C122 180 146 170 152 144 C158 116 144 86 124 66Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="M70 50 Q100 64 130 50 L122 68 Q100 76 78 68Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(16, function (i) { var a = i / 16 * Math.PI * 2; return '<circle cx="' + (100 + 42 * Math.cos(a)).toFixed(1) + '" cy="' + (126 + 38 * Math.sin(a)).toFixed(1) + '" r="3" fill="' + oK + '" opacity=".45"/>'; }) + chuNham(100, 126, 1.1) };
  // 164 · kim tiền (bạc): vòng đồng tiền nối nhau đính đá — nhìn ngang dải
  V['24041'] = { xo: 'ong', kl: 'bac', s: thanOng(96, 150, 22) + lap(4, function (i) { var y = 46 + i * 36; return '<circle cx="100" cy="' + y + '" r="17" fill="none" stroke="' + oK + '" stroke-width="3"/><rect x="93" y="' + (y - 7) + '" width="14" height="14" fill="#3b2a12" opacity=".35"/>' +
      '<circle cx="100" cy="' + (y + 18) + '" r="4.5" fill="#fff" stroke="#9fb0c4"/>'; }) };
  // 165 · hoa đá (bạc): vòng hoa nhỏ đính đá — nhìn ngang dải
  V['23990'] = { xo: 'ong', kl: 'bac', s: thanOng(90, 150, 26) + lap(5, function (i) { var y = 44 + i * 28; return '<path d="' + vongHoa(100, y, 12, 5, 4) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + daTrang(100, y, 6); }) };
  // 166 · thẻ bài hình thang, chữ hỉ lạc, khoen
  V['24071'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/><path d="M76 50 H124 L142 180 H58Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' + nham('M80 62 H120 L134 170 H66Z', .3) + chuNham(100, 96, 1.2) + chuNham(100, 144, 1.2) };
  // 167 · thẻ bài bầu dục rỗng, chữ phúc, khoen
  V['24035'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/><rect x="56" y="48" width="88" height="138" rx="40" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><rect x="68" y="62" width="64" height="110" rx="30" fill="#3b2a12" opacity=".5"/>' +
    '<g fill="none" stroke="' + K + '" stroke-width="6" stroke-linecap="round"><path d="M82 82 H118 M100 74 V160 M78 104 H122 M84 126 H116 V150 H84Z"/></g>' };
  // 168 · khánh bình an: khoá như ý hoa văn, đá đỏ giữa, khoen
  V['24005'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V54" stroke="' + K + '" stroke-width="6"/><path d="' + MAY + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".6">' + lap(6, function (i) { return '<path d="M100 92 C110 98 110 110 100 116 C90 110 90 98 100 92Z" transform="rotate(' + i * 60 + ' 100 124)"/>'; }) + '<path d="M52 92 c8 -10 22 -6 20 6 M148 92 c-8 -10 -22 -6 -20 6"/></g>' +
    '<circle cx="100" cy="124" r="9" fill="#d4235a" stroke="' + oK + '" stroke-width="2"/>' };
  // 169 · hoa: hoa cánh tim đá trắng, cầu treo ống đính đá
  V['24096'] = { xo: 'treo', s: '<rect x="86" y="10" width="28" height="34" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[100, 20], [100, 32]], 4) + '<path d="M100 44 V62" stroke="' + K + '" stroke-width="5"/>' +
    lap(8, function (i) { return '<path d="M100 120 C92 108 84 92 92 84 C96 80 100 84 100 88 C100 84 104 80 108 84 C116 92 108 108 100 120Z" fill="#fff" stroke="#9fb0c4" stroke-width="1.5" transform="rotate(' + i * 45 + ' 100 120) translate(0 -8)"/>'; }) +
    '<circle cx="100" cy="120" r="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + daTrang(100, 120, 6) };
  // 170 · mèo đứng: mèo vàng nhìn ngang, đuôi dựng (xỏ xuyên thân)
  V['24114'] = { xo: 'xuyen', s: '<path d="M44 150 L46 112 C40 98 44 82 56 76 L60 52 L72 68 L84 52 L88 72 C98 82 98 98 92 108 L134 108 C146 100 152 82 150 62 C158 64 164 80 160 100 C158 116 154 132 150 150 L134 150 L130 132 L82 132 L76 150 L62 150 L60 132Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<circle cx="64" cy="88" r="3.5" fill="#3b2a12"/><circle cx="80" cy="88" r="3.5" fill="#3b2a12"/><path d="M68 98 l4 3 l4 -3" fill="none" stroke="' + oK + '" stroke-width="2"/>' + nham('M96 116 H140 M98 124 H136', .35) + sang(116, 114, 14, 4, 0, .5) };
  // 171 · cá ngựa: đầu cá ngựa vàng chụp trên hạt ngọc xanh ngả lam, khoen
  V['23984'] = { xo: 'treo', da: 'lambang', s: khoen(10) + '<path d="M100 30 V42" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M86 42 C80 60 84 80 72 96 L128 104 C132 84 126 62 116 48 C110 40 92 36 86 42Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/><path d="M92 48 C104 48 112 60 108 72 M96 60 L110 56 M94 72 L108 70 M92 84 L106 84" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".6"/><circle cx="104" cy="56" r="3" fill="#3b2a12"/>' +
    '<path d="M68 96 Q100 110 132 104 L128 116 Q100 122 70 110Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + hatDiem([[80, 104], [94, 108], [108, 110], [122, 108]], 3) +
    '<circle cx="100" cy="150" r="38" fill="url(#pd-ngLam)" stroke="#2a6f6a" stroke-width="2.5"/>' + sang(88, 138, 10, 6, -30, .8) +
    '<defs><radialGradient id="pd-ngLam" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="#bfe9e2"/><stop offset=".5" stop-color="#3f9a8f"/><stop offset="1" stop-color="#1e5a58"/></radialGradient></defs>' };
  // 172 · hoa (bạc): hạt chặn hoa bạc đính đá — nhìn ngang
  V['24064'] = { xo: 'ong', kl: 'bac', s: '<path d="M70 30 C60 60 60 140 70 170 L130 170 C140 140 140 60 130 30Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(6, function (i) { var y = 44 + i * 23; return '<path d="M70 ' + (y - 10) + ' C58 ' + y + ' 58 ' + (y + 6) + ' 70 ' + (y + 12) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><path d="M130 ' + (y - 10) + ' C142 ' + y + ' 142 ' + (y + 6) + ' 130 ' + (y + 12) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + daTrang(100, y + 1, 6); }) };
  // 173 · hoa văn: bình dẹt nhám viền hạt, khoen
  V['23988'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V54" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M86 54 H114 L116 76 C140 92 152 122 146 150 C140 174 120 186 100 186 C80 186 60 174 54 150 C48 122 60 92 84 76Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + nham('M88 66 H112 L112 82 C132 96 142 122 136 146 C130 166 116 176 100 176 C84 176 70 166 64 146 C58 122 68 96 88 82Z', .4) };
  // 174 · củ lạc: củ lạc nhám có chữ, khoen
  V['24074'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 48 C124 48 132 70 126 88 C120 104 126 112 128 128 C132 160 118 184 100 184 C82 184 68 160 72 128 C74 112 80 104 74 88 C68 70 76 48 100 48Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(18, function (i) { return '<path d="M' + (82 + (i % 3) * 12) + ' ' + (60 + Math.floor(i / 3) * 20) + ' l6 6 l6 -6" fill="none" stroke="' + oK + '" stroke-width="1.6" opacity=".45"/>'; }) + chuNham(100, 92, .9) };
  // 175 · đôi lạc garnet: hai củ lạc vàng nhám, hạt garnet, khoen
  V['23859'] = { xo: 'treo', da: 'garnet', s: khoen(12) + '<path d="M100 34 L80 56 M100 34 L120 56" stroke="' + K + '" stroke-width="5"/>' +
    [[74, -8], [126, 8]].map(function (p) { return '<g transform="rotate(' + p[1] + ' ' + p[0] + ' 60)"><path d="M' + p[0] + ' 56 C' + (p[0] + 22) + ' 56 ' + (p[0] + 28) + ' 76 ' + (p[0] + 22) + ' 96 C' + (p[0] + 18) + ' 108 ' + (p[0] + 24) + ' 116 ' + (p[0] + 24) + ' 132 C' + (p[0] + 24) + ' 160 ' + (p[0] + 12) + ' 180 ' + p[0] + ' 180 C' + (p[0] - 12) + ' 180 ' + (p[0] - 24) + ' 160 ' + (p[0] - 24) + ' 132 C' + (p[0] - 24) + ' 116 ' + (p[0] - 18) + ' 108 ' + (p[0] - 22) + ' 96 C' + (p[0] - 28) + ' 76 ' + (p[0] - 22) + ' 56 ' + p[0] + ' 56Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
      '<circle cx="' + p[0] + '" cy="82" r="11" fill="' + D + '" stroke="' + oK + '" stroke-width="2"/><circle cx="' + p[0] + '" cy="146" r="11" fill="' + D + '" stroke="' + oK + '" stroke-width="2"/></g>'; }).join('') };
  // 176 · hồ lô tour: xích nối, hồ lô vàng giữa, đá tour hồng hai bên, khoen hai đầu (nằm dọc dây)
  V['23831'] = { xo: 'ong', s: '<circle cx="14" cy="100" r="8" fill="none" stroke="' + K + '" stroke-width="4"/><circle cx="186" cy="100" r="8" fill="none" stroke="' + K + '" stroke-width="4"/>' +
    '<path d="M22 100 H178" stroke="' + K + '" stroke-width="4"/>' + [40, 160].map(function (x) { return '<circle cx="' + x + '" cy="100" r="9" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="' + x + '" cy="100" r="5.5" fill="#e86a9a"/>'; }).join('') +
    [66, 134].map(function (x) { return '<path d="M' + (x - 10) + ' 100 L' + x + ' 88 L' + (x + 10) + ' 100 L' + x + ' 112Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>'; }).join('') +
    '<g transform="translate(100 100) rotate(-90) translate(-100 -100)"><g transform="translate(100 76) scale(.34) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="8"/></g></g>' };
  // 177 · cỏ garnet: khung vàng 4 thuỳ, bốn hạt garnet tròn (xỏ xuyên qua đế)
  V['23856'] = { xo: 'xuyen', da: 'garnet', s: '<path d="' + vongHoa(100, 100, 66, 4, 16) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3" transform="rotate(45 100 100)"/>' +
    lap(4, function (i) { return '<g transform="rotate(' + i * 90 + ' 100 100)"><circle cx="100" cy="58" r="24" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatTron(100, 58, 21, 12, 1.8) + '</g>'; }) +
    [[100, 58], [142, 100], [100, 142], [58, 100]].map(function (p) { return ngocTron(p[0], p[1], 17); }).join('') };
  // 178 · treo thẻ: chùm đồng xu nhỏ có chữ trên khoen
  V['24086'] = { xo: 'treo', s: khoen(14) + [[76, 96, -15], [124, 96, 15], [100, 130, 0], [70, 150, -10], [130, 150, 10]].map(function (p) {
      return '<path d="M100 40 L' + p[0] + ' ' + (p[1] - 26) + '" stroke="' + K + '" stroke-width="3"/><g transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="26" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + chuNham(p[0], p[1], .8) + '</g>'; }).join('') };
  // 179 · mèo (mặt dẹt): mặt mèo nhám có chữ, khoen
  V['24038'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V54" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M50 84 L48 50 L80 66 Q100 62 120 66 L152 50 L150 84 C162 110 156 150 130 168 C112 180 88 180 70 168 C44 150 38 110 50 84Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    nham('M60 90 C62 76 138 76 140 90 C150 112 144 146 124 160 C110 168 90 168 76 160 C56 146 50 112 60 90Z', .35) + chuNham(100, 124, 1.3) };
  // 180 · sen treo: đoá sen lưới, tượng nhỏ giữa, khoen
  V['24106'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 50 C128 74 158 104 154 138 C150 170 126 186 100 186 C74 186 50 170 46 138 C42 104 72 74 100 50Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M100 66 C122 86 142 110 140 136 C138 160 120 172 100 172 C80 172 62 160 60 136 C58 110 78 86 100 66Z" fill="#3b2a12" opacity=".45"/>' +
    '<circle cx="100" cy="116" r="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><path d="M80 160 C80 136 120 136 120 160Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[66, 108], [134, 108], [58, 132], [142, 132]], 3.2) };

  /* ===== đợt 9 (cuối) ===== */
  // mặt ngọc chạm trong ổ vàng 14K có đá trắng (hạt đậu đa sắc …): path = dáng mặt ngọc, khac = nét chạm
  function oNgoc14(path, khac) { return '<path d="' + path + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="' + path + '" fill="' + D + '" stroke="' + oD + '" stroke-width="2" transform="translate(100 100) scale(.86) translate(-100 -100)"/>' +
    '<g fill="none" stroke="' + oD + '" stroke-width="2.6" opacity=".5" transform="translate(100 100) scale(.86) translate(-100 -100)">' + (khac || '') + '</g>'; }
  var DAU = 'M100 26 C134 26 156 54 156 96 C156 140 132 176 100 176 C68 176 44 140 44 96 C44 54 66 26 100 26Z';
  // 181 · chuông: chuông vàng vành hạt, quả lắc tròn, khoen
  V['24208'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V54" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 52 C72 54 60 82 58 112 C56 134 48 144 40 150 L160 150 C152 144 144 134 142 112 C140 82 128 54 100 52Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<rect x="38" y="146" width="124" height="12" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + lap(10, function (i) { return '<circle cx="' + (46 + i * 12) + '" cy="152" r="3" fill="' + oK + '" opacity=".45"/>'; }) +
    '<circle cx="100" cy="172" r="14" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + sang(78, 96, 6, 20, 10, .6) };
  // 182 · hồ lô hạt sen: hồ lô vàng ô trám đính đá, khoen
  V['24209'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V44" stroke="' + K + '" stroke-width="6"/><g transform="translate(100 42) scale(.98) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".55">' + lap(5, function (i) { var y = 106 + i * 14; return '<path d="M58 ' + y + ' L142 ' + (y + 30) + ' M142 ' + y + ' L58 ' + (y + 30) + '"/>'; }) + '</g></g>' +
    hatDiem([[88, 130], [112, 130], [100, 146], [88, 162], [112, 162], [100, 70]], 4) };
  // 183 · hồ lô đan: hồ lô vàng vân đan, đai đính đá ngang eo, khoen
  V['24211'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V44" stroke="' + K + '" stroke-width="6"/><g transform="translate(100 42) scale(.98) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5">' + lap(8, function (i) { var y = 40 + i * 17; return '<path d="M50 ' + y + ' q12 8 25 0 q12 -8 25 0 q12 8 25 0 q12 -8 25 0"/>'; }) + '</g></g>' +
    '<rect x="74" y="94" width="52" height="12" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[84, 100], [96, 100], [108, 100], [120, 100]], 3.6) };
  // 184 · hồ lô kim tiền: hồ lô dẹt chạm vân mây đồng tiền (xỏ xuyên)
  V['24213'] = { xo: 'xuyen', s: '<g transform="rotate(90 100 100)"><g transform="translate(100 22) scale(1.06) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.4" opacity=".55">' + lap(5, function (i) { var p = [[100, 60], [82, 124], [118, 124], [100, 150], [100, 100]][i]; return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="12"/><path d="M' + (p[0] - 12) + ' ' + p[1] + ' c6 -6 18 -6 24 0"/>'; }) + '</g></g></g>' };
  // 185 · chong chóng: 4 cánh quạt xoáy, đá trắng tâm, khoen
  V['24045'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V58" stroke="' + K + '" stroke-width="6"/>' + lap(4, function (i) { return '<path d="M100 118 C96 96 102 72 122 66 C130 64 136 72 130 82 C122 96 112 108 100 118Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5" transform="rotate(' + i * 90 + ' 100 118)"/>' +
      '<path d="M104 110 C108 94 116 82 126 76" fill="none" stroke="' + oK + '" stroke-width="1.6" opacity=".5" transform="rotate(' + i * 90 + ' 100 118)"/>'; }) + '<circle cx="100" cy="118" r="10" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + daTrang(100, 118, 6) };
  // 186 · cá chép: thân chạm lưới, đuôi cuộn, mắt đá, khoen ở đầu
  V['24043'] = { xo: 'treo', s: khoen(9) + '<path d="M96 28 L92 40" stroke="' + K + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M122 138 C132 150 134 168 120 182 C138 184 158 172 162 150 C168 160 176 162 184 160 C172 150 164 132 164 114 C154 128 140 136 122 138Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
    '<path d="M124 166 a9 9 0 1 0 9 -9" fill="none" stroke="' + oK + '" stroke-width="3"/><path d="M130 62 C150 66 164 84 162 108 C156 100 148 98 138 100Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="M84 40 C104 34 128 48 134 72 C140 96 134 120 122 138 C112 130 92 118 80 102 C68 86 66 50 84 40Z" fill="' + K + '" stroke="' + oK + '" stroke-width="4"/>' +
    '<g fill="#3b2a12" opacity=".55">' + [[110, 70], [124, 74], [104, 84], [118, 88], [130, 92], [108, 100], [122, 104], [114, 116], [126, 120]].map(function (p) { return '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="5.5" ry="4.5"/>'; }).join('') + '</g>' +
    '<path d="M96 42 C88 56 88 74 96 88" fill="none" stroke="' + oK + '" stroke-width="3"/><circle cx="84" cy="56" r="5.5" fill="#fff" stroke="' + oK + '" stroke-width="2"/>' + sang(96, 44, 8, 3, -15) };
  // 187 · khánh bình an garnet: khoá mây, garnet giữa, vòng đá trắng, khoen
  V['23868'] = { xo: 'treo', da: 'garnet', s: khoen(14) + '<path d="M100 38 V54" stroke="' + K + '" stroke-width="6"/><path d="' + MAY + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + hatTron(100, 122, 32, 14, 4.6) + ngocTron(100, 122, 18) };
  // 188 · khoá móc phỉ thuý: hoa 5 cánh vàng nhám, đá lục giữa (ống xỏ phía sau)
  V['24136'] = { xo: 'xuyen', da: 'lucde', s: lap(5, function (i) { return '<path d="M100 96 C80 86 70 58 84 40 C92 30 108 30 116 40 C130 58 120 86 100 96Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" transform="rotate(' + i * 72 + ' 100 100)"/>' +
      '<path d="M100 82 V48" stroke="' + oK + '" stroke-width="1.8" opacity=".4" transform="rotate(' + i * 72 + ' 100 100)"/>'; }) + '<circle cx="100" cy="100" r="18" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + ngocTron(100, 100, 12) };
  // 189 · treo ngọc bích: hạt ngọc bích nhạt trong chụp vàng, khoen
  V['24145'] = { xo: 'treo', da: 'bichnhat', s: khoen(12) + '<path d="M100 34 V50" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M70 92 C70 64 130 64 130 92Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + lap(5, function (i) { return '<path d="M' + (74 + i * 13) + ' 92 L' + (80 + i * 10) + ' 70" stroke="' + oK + '" stroke-width="1.6" opacity=".5"/>'; }) + daTrang(100, 66, 5) + ngocTron(100, 132, 46) };
  // 190 · ngọn lửa ngọc bích: khung vàng dáng ngọn lửa/hoa, ngọc bích tròn giữa, khoen
  V['24142'] = { xo: 'treo', da: 'bichnhat', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 48 C112 62 130 60 142 74 C156 92 146 110 156 126 C164 150 146 178 120 178 C112 186 88 186 80 178 C54 178 36 150 44 126 C54 110 44 92 58 74 C70 60 88 62 100 48Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5"><path d="M70 90 c-8 10 -6 24 4 26 M130 90 c8 10 6 24 -4 26 M80 160 c6 6 16 6 20 0 c4 6 14 6 20 0"/></g>' + ngocTron(100, 124, 22) };
  // 191 · thỏi vàng ngọc bích: tấm nguyên bảo chạm mây, ngọc bích nhạt giữa, khoen
  V['24206'] = { xo: 'treo', da: 'bichnhat', s: khoen(12) + '<path d="M100 34 V56" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M28 90 C36 74 58 72 70 84 L130 84 C142 72 164 74 172 90 C176 140 144 176 100 176 C56 176 24 140 28 90Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.2" opacity=".55"><path d="M44 96 c8 -8 20 -4 18 6 M156 96 c-8 -8 -20 -4 -18 6 M50 134 c6 -6 16 -2 14 6 M150 134 c-6 -6 -16 -2 -14 6"/></g>' + ngocTron(100, 128, 30) };
  // 192 · hoa lục đế: hoa 5 cánh vàng chạm lưới, ngọc tròn giữa (xỏ xuyên qua đế)
  V['24156'] = { xo: 'xuyen', s: lap(5, function (i) { return '<path d="M100 96 C78 86 66 56 82 38 C90 28 110 28 118 38 C134 56 122 86 100 96Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" transform="rotate(' + i * 72 + ' 100 100)"/>' +
      '<path d="M100 82 C92 72 90 54 100 46 C110 54 108 72 100 82Z" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".5" transform="rotate(' + i * 72 + ' 100 100)"/>'; }) + '<circle cx="100" cy="100" r="30" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + ngocTron(100, 100, 24) };
  // 193 · điếu lam băng: đĩa ngọc nhỏ giữa, hai thanh vàng chạm hai bên, khoen hai đầu (nằm dọc dây)
  V['24203'] = { xo: 'ong', s: '<circle cx="14" cy="100" r="8" fill="none" stroke="' + K + '" stroke-width="4.5"/><circle cx="186" cy="100" r="8" fill="none" stroke="' + K + '" stroke-width="4.5"/>' +
    [0, 1].map(function (m) { return '<g' + (m ? ' transform="matrix(-1 0 0 1 200 0)"' : '') + '><rect x="22" y="92" width="52" height="16" rx="8" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' +
      '<ellipse cx="34" cy="100" rx="8" ry="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><ellipse cx="58" cy="100" rx="8" ry="12" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/>' + hatDiem([[46, 100]], 4) + '</g>'; }).join('') +
    '<circle cx="100" cy="100" r="28" fill="' + D + '" stroke="' + oD + '" stroke-width="2.5"/><circle cx="100" cy="100" r="8" fill="#f4eee3" stroke="' + oD + '" stroke-width="1.5"/><rect x="72" y="96" width="56" height="8" rx="4" fill="' + K + '"/>' + sang(88, 86, 8, 4, -30) };
  // 194 · trái tim nhám, chấm đá, khoen
  V['23915'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V52" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 184 C62 156 34 132 34 98 C34 72 54 56 76 56 C88 56 96 62 100 72 C104 62 112 56 124 56 C146 56 166 72 166 98 C166 132 138 156 100 184Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    nham('M100 170 C68 146 46 126 46 98 C46 78 60 68 76 68 C88 68 96 76 100 84 C104 76 112 68 124 68 C140 68 154 78 154 98 C154 126 132 146 100 170Z', .35) + hatDiem([[84, 104], [116, 104], [100, 122], [100, 92]], 5) };
  // 195 · cỏ 3 lá: tam diệp vàng gân, đá đỏ giữa, khoen
  V['23930'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V54" stroke="' + K + '" stroke-width="6"/>' + lap(3, function (i) { return '<path d="M100 120 C84 108 70 86 80 70 C88 60 100 64 100 72 C100 64 112 60 120 70 C130 86 116 108 100 120Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" transform="rotate(' + (i * 120 + 180) + ' 100 120) translate(0 4)"/>' +
      '<path d="M100 112 V74" stroke="' + oK + '" stroke-width="1.8" opacity=".5" transform="rotate(' + (i * 120 + 180) + ' 100 120)"/>'; }) + '<circle cx="100" cy="120" r="10" fill="#d4235a" stroke="' + oK + '" stroke-width="2.5"/>' };
  // 196 · cá vàng men: cá men trắng, vây đỏ cam, viền vàng (xỏ xuyên qua đế)
  V['23956'] = { xo: 'xuyen', s: '<path d="M140 100 C160 80 178 74 186 84 C178 96 178 104 186 116 C178 126 160 120 140 100Z" fill="#f2a03a" stroke="' + K + '" stroke-width="4"/>' +
    '<ellipse cx="94" cy="100" rx="56" ry="42" fill="#fbf4ea" stroke="' + K + '" stroke-width="5"/><path d="M80 58 C96 46 120 52 128 66 C112 66 96 64 80 58Z M84 142 C96 154 112 152 120 140 C106 140 94 140 84 142Z" fill="#e8442a" stroke="' + K + '" stroke-width="3"/>' +
    '<path d="M110 74 C130 82 136 108 120 124 C116 108 112 90 110 74Z" fill="#f2a03a" opacity=".85"/><path d="M60 78 C52 94 52 108 60 122" fill="none" stroke="#e8442a" stroke-width="4"/>' +
    '<circle cx="56" cy="92" r="6" fill="#3b2a12"/><circle cx="54" cy="90" r="2" fill="#fff"/>' };
  // 197 · trái tim đính đá, khoen
  V['23970'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V52" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 184 C62 156 34 132 34 98 C34 72 54 56 76 56 C88 56 96 62 100 72 C104 62 112 56 124 56 C146 56 166 72 166 98 C166 132 138 156 100 184Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    hatDiem([[62, 84], [80, 76], [120, 76], [138, 84], [52, 102], [148, 102], [60, 122], [140, 122], [74, 140], [126, 140], [88, 156], [112, 156], [100, 170], [82, 100], [100, 92], [118, 100], [90, 120], [110, 120], [100, 138]], 5.4) };
  // 198 · cầu hoa văn: hạt cầu men kem, dải xanh ngọc, mây vàng đính đá (dây xuyên dọc)
  V['23917'] = { xo: 'ong', s: '<circle cx="100" cy="100" r="70" fill="#f6ead2" stroke="' + K + '" stroke-width="6"/>' +
    '<g fill="none" stroke-width="10" stroke-linecap="round"><path d="M44 62 C70 84 70 116 44 138" stroke="#2bb5a8"/><path d="M156 62 C130 84 130 116 156 138" stroke="#2bb5a8"/></g>' +
    '<g fill="none" stroke="' + K + '" stroke-width="5" stroke-linecap="round"><path d="M80 52 c12 -8 26 0 20 12 c-6 8 -16 2 -12 -4 M120 148 c-12 8 -26 0 -20 -12 c6 -8 16 -2 12 4 M76 100 c0 -14 16 -18 22 -8 M124 100 c0 14 -16 18 -22 8"/></g>' +
    hatDiem([[100, 80], [100, 120], [88, 100], [112, 100], [66, 52], [134, 148], [100, 100]], 4.4) + sang(70, 60, 10, 5, -35, .6) };
  // 199 · chó Cinnamoroll: mặt cún men trắng, tai dài hồng, khoen
  V['24039'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V58" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M50 84 C30 82 18 100 24 116 C30 128 46 126 52 116Z M150 84 C170 82 182 100 176 116 C170 128 154 126 148 116Z" fill="#fbf7f2" stroke="' + K + '" stroke-width="5"/><path d="M40 94 C30 100 30 112 40 116 M160 94 C170 100 170 112 160 116" fill="none" stroke="#ef8fb0" stroke-width="7" stroke-linecap="round"/>' +
    '<ellipse cx="100" cy="116" rx="54" ry="48" fill="#fbf7f2" stroke="' + K + '" stroke-width="5"/>' +
    '<ellipse cx="82" cy="114" rx="5" ry="7" fill="#2a3a5a"/><ellipse cx="118" cy="114" rx="5" ry="7" fill="#2a3a5a"/><ellipse cx="72" cy="130" rx="8" ry="5" fill="#f6b3c6"/><ellipse cx="128" cy="130" rx="8" ry="5" fill="#f6b3c6"/>' +
    '<path d="M94 132 Q100 138 106 132" fill="none" stroke="#2a3a5a" stroke-width="2.4" stroke-linecap="round"/>' };
  // 200 · kì lân: kỳ lân vàng, cánh men xanh, đế lưới đồng tiền (xỏ xuyên)
  V['23958'] = { xo: 'xuyen', s: '<path d="M40 150 L44 116 C34 106 32 88 44 78 L58 84 L110 86 C116 66 132 52 150 56 C164 60 168 76 158 88 L148 100 C150 120 148 136 144 150 L128 150 L124 128 L66 128 L60 150Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M70 84 C72 56 90 40 108 42 C100 54 102 68 110 80Z" fill="#5b9de0" stroke="' + K + '" stroke-width="3"/><path d="M78 80 C80 64 90 54 100 52" fill="none" stroke="#dcefff" stroke-width="3"/>' +
    '<path d="M150 56 L156 40 L160 58" fill="' + K + '" stroke="' + oK + '" stroke-width="2"/><circle cx="150" cy="70" r="3.5" fill="#3b2a12"/>' +
    '<rect x="40" y="146" width="112" height="22" rx="6" fill="' + K + '" stroke="' + oK + '" stroke-width="2.5"/>' + lap(4, function (i) { return '<circle cx="' + (58 + i * 26) + '" cy="157" r="7" fill="none" stroke="' + oK + '" stroke-width="2" opacity=".6"/>'; }) };
  // 201 · hồ lô treo chữ: hồ lô dẹt có chữ, khoen
  V['23974'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V44" stroke="' + K + '" stroke-width="6"/><g transform="translate(100 42) scale(.98) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/></g>' + chuNham(100, 66, .9) + chuNham(100, 134, 1.4) };
  // 202 · tam giác đỏ: tam giác men đỏ viền vàng, chữ vàng, khoen
  V['B1240'] = { xo: 'treo', s: khoen(14) + '<path d="M100 38 V54" stroke="' + K + '" stroke-width="6"/><path d="M100 54 L170 176 L30 176Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M100 72 L156 166 L44 166Z" fill="#e0302a"/>' + '<g transform="translate(100 134)" fill="none" stroke="' + K + '" stroke-width="3"><circle r="13"/><path d="M-8 0 H8 M0 -8 V8"/></g>' };
  // 203 · hồ ly ngồi: hồ ly vàng tai hồng (tượng nhỏ, xỏ xuyên)
  V['B1124'] = { xo: 'xuyen', s: '<path d="M60 70 L52 30 L84 52 Q100 48 116 52 L148 30 L140 70 C150 90 146 112 128 122 C146 134 150 160 132 174 C118 184 82 184 68 174 C50 160 54 134 72 122 C54 112 50 90 60 70Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M62 44 L68 66 L80 58Z M138 44 L132 66 L120 58Z" fill="#f2a6c0"/><path d="M80 84 q8 -6 14 2 M106 86 q6 -8 14 -2" fill="none" stroke="#3b2a12" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M96 98 L104 98 L100 104Z" fill="#3b2a12"/><circle cx="100" cy="74" r="4" fill="#d4235a"/><path d="M130 160 C152 160 164 140 156 122" fill="none" stroke="' + K + '" stroke-width="12" stroke-linecap="round"/>' + sang(80, 140, 8, 14, 10, .5) };
  // 204 · thẻ bài chữ đỏ: thẻ dáng hũ, chữ đỏ, khoen
  V['BS127'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M76 48 H124 L120 62 C140 70 146 92 146 120 L146 168 C146 178 138 184 128 184 L72 184 C62 184 54 178 54 168 L54 120 C54 92 60 70 80 62Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<rect x="66" y="82" width="68" height="90" rx="8" fill="#fbf2dc"/><g fill="none" stroke="#e0302a" stroke-width="4" stroke-linecap="round"><path d="M80 96 H96 M88 92 V118 M80 108 H96 M108 96 H122 M115 92 V118 M106 112 H124 M80 136 H120 M100 128 V162 M84 150 H116"/></g>' };
  // 205 · mắt ngọc: con mắt vàng, ngọc xanh tròn giữa, mi toả (xỏ xuyên qua đế lưới)
  V['BS26'] = { xo: 'xuyen', da: 'lucde', s: '<path d="M14 100 C40 56 70 42 100 42 C130 42 160 56 186 100 C160 144 130 158 100 158 C70 158 40 144 14 100Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    lap(7, function (i) { var a = (-150 + i * 20) * Math.PI / 180; return '<path d="M' + (100 + 64 * Math.cos(a)).toFixed(1) + ' ' + (110 + 64 * Math.sin(a)).toFixed(1) + ' L' + (100 + 82 * Math.cos(a)).toFixed(1) + ' ' + (110 + 82 * Math.sin(a)).toFixed(1) + '" stroke="' + K + '" stroke-width="7" stroke-linecap="round"/>'; }) +
    '<path d="M30 100 C52 68 76 58 100 58 C124 58 148 68 170 100 C148 132 124 142 100 142 C76 142 52 132 30 100Z" fill="#fbf2dc" stroke="' + oK + '" stroke-width="2"/>' + ngocTron(100, 100, 30) };
  // 206 · hồ lô phỉ thuý: hồ lô vàng nhám, đá lục đế ở cổ, khoen
  V['21611'] = { xo: 'treo', da: 'lucde', s: khoen(12) + '<path d="M100 34 V44" stroke="' + K + '" stroke-width="6"/><g transform="translate(100 42) scale(.98) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<path d="' + HL + '" fill="none" stroke="' + oK + '" stroke-width="10" stroke-dasharray="1 4" opacity=".3" transform="translate(100 102) scale(.84) translate(-100 -102)"/></g>' + ngocTron(100, 70, 12) + '<rect x="88" y="128" width="24" height="24" fill="none" stroke="' + oK + '" stroke-width="3" opacity=".6"/>' };
  // 207 · ngọc bích: hoa mặt trời vàng nhiều chấu, ngọc bích tròn giữa (xỏ xuyên qua đế)
  V['A5805'] = { xo: 'xuyen', da: 'lucde', s: lap(8, function (i) { return '<path d="M92 60 L100 22 L108 60Z" fill="' + K + '" stroke="' + oK + '" stroke-width="2" stroke-linejoin="round" transform="rotate(' + (i * 45 + 22.5) + ' 100 100)"/>'; }) +
    '<path d="' + vongHoa(100, 100, 46, 8, 6) + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' + ngocTron(100, 100, 30) };
  // 208 · Di Lặc vàng: tượng Di Lặc chạm trong giọt nước vàng, khoen
  V['A55891'] = { xo: 'treo', s: khoen(12) + '<path d="M100 34 V48" stroke="' + K + '" stroke-width="6"/>' +
    '<path d="M100 48 C128 70 156 108 152 142 C148 170 126 186 100 186 C74 186 52 170 48 142 C44 108 72 70 100 48Z" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/>' +
    '<g fill="none" stroke="' + oK + '" stroke-width="2.6" opacity=".6"><circle cx="100" cy="100" r="18"/><path d="M90 98 q4 -4 8 0 M102 98 q4 -4 8 0 M92 108 q8 6 16 0 M66 166 C66 132 134 132 134 166 M82 134 C76 148 80 160 90 166 M118 134 C124 148 120 160 110 166"/><circle cx="100" cy="154" r="5"/></g>' + sang(76, 104, 5, 16, 15, .55) };
  // 209 · đồng điếu thạch anh tóc xanh: hạt đá trong, sợi tóc xanh (nhìn ngang, dây xuyên dọc)
  V['1941'] = { xo: 'ong', da: 'toc', s: '<rect x="56" y="36" width="88" height="128" rx="28" fill="' + D + '" stroke="' + oD + '" stroke-width="3"/>' +
    '<g stroke="#2f5a34" stroke-width="1.6" opacity=".7">' + lap(14, function (i) { var x = 62 + (i * 37) % 76, y = 44 + (i * 53) % 108; return '<path d="M' + x + ' ' + y + ' l' + ((i % 3) * 8 - 8) + ' ' + (10 + i % 4 * 4) + '"/>'; }) + '</g>' +
    '<rect x="62" y="44" width="10" height="112" rx="5" fill="#fff" opacity=".45"/>' };
  // 210 · hồ lô lam băng 14K: mặt hồ lô ngọc trong ổ vàng, đá trắng điểm viền (xỏ xuyên)
  V['26418'] = { xo: 'xuyen', s: '<g transform="rotate(90 100 100)"><g transform="translate(100 20) scale(1.08) translate(-100 -28)"><path d="' + HL + '" fill="' + K + '" stroke="' + oK + '" stroke-width="3"/></g>' + hoLo(28, .92) +
    hatDiem([[78, 92], [122, 92], [56, 128], [144, 128], [74, 172], [126, 172]], 4) + '</g>' };
  // 211–216 · hạt đậu đa sắc 14K: mặt ngọc chạm trong ổ vàng, mỗi chiếc một màu & một nét chạm (xỏ xuyên)
  var XOAY = '<path d="M76 70 c10 -12 30 -10 32 4 c2 12 -14 16 -18 6 M118 108 c-10 -12 -30 -10 -32 4 c-2 12 14 16 18 6 M70 132 c8 -10 24 -8 26 4"/>';
  var LA = '<path d="M100 40 V164"/>' + lap(6, function (i) { var y = 56 + i * 18; return '<path d="M100 ' + (y + 10) + ' L74 ' + y + ' M100 ' + (y + 10) + ' L126 ' + y + '"/>'; });
  var QUA = '<path d="M100 40 C120 56 120 80 100 96 C80 112 80 140 100 160"/><circle cx="100" cy="62" r="14"/><circle cx="100" cy="102" r="16"/><circle cx="100" cy="142" r="16"/>';
  var OVAL = 'M100 30 C138 30 160 62 160 100 C160 138 138 170 100 170 C62 170 40 138 40 100 C40 62 62 30 100 30Z';
  function dau14(da, path, khac) { return { xo: 'xuyen', da: da, s: '<g transform="rotate(90 100 100)">' + oNgoc14(path, khac) + hatDiem([[52, 100], [148, 100], [100, 32], [100, 168]], 4) + '</g>' }; }
  V['26417~v2EopT'] = dau14('lucde', OVAL, XOAY);
  V['26417~EGvjyq'] = dau14('trang', 'M100 26 C128 26 148 56 148 100 C148 144 128 174 100 174 C72 174 52 144 52 100 C52 56 72 26 100 26Z', LA);
  V['26416'] = dau14('dasac', DAU, XOAY);
  V['26417~F3BZ8-'] = dau14('lucde', 'M100 26 C128 26 148 56 148 100 C148 144 128 174 100 174 C72 174 52 144 52 100 C52 56 72 26 100 26Z', LA);
  V['26417'] = dau14('lucde', DAU, QUA);
  V['26417~YXLixy'] = dau14('vang', DAU, QUA);

  window.VE_RIENG = V;
})();
