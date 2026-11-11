/* Bản phác 2D cho charm (trang Tự thiết kế) — vẽ bằng mã, không cần file ảnh.
   phacCharm(c) → chuỗi <svg viewBox="0 0 200 200"> theo c.hinh (dáng), c.da (màu đá), c.kl (vàng/bạc), c.xo (kiểu xỏ).
   Quy ước khung 200×200:
     xuyen : tâm (100,100), dây chạy NGANG qua tâm
     ong   : trục ống NẰM NGANG qua tâm (dây xuyên dọc trục)
     treo  : khoen ở trên cùng, điểm móc vào dây là (100,10); thân thõng xuống */
(function () {
  var DA = {
    lucde: ['#d4fbe2', '#2fc46c', '#056b36'], lambang: ['#effffb', '#8bd9c8', '#2f8379'], trang: ['#ffffff', '#e7eff1', '#a3bcc2'],
    bich: ['#c6eccf', '#3f9a5f', '#1b5534'], dasac: ['#f6efff', '#c9b6e8', '#78a987'], garnet: ['#ffb3bd', '#c4283f', '#560818'],
    tour: ['#ffd6e5', '#e46b9a', '#86204e'], trai: ['#ffffff', '#f4ede2', '#c4b59f'], thachanh: ['#f3fff7', '#bfe6cd', '#5b9473'],
    xanh: ['#dcefff', '#5b9de0', '#1d4b94'], kimcuong: ['#ffffff', '#eaf2ff', '#93a7c0'],
    vang: ['#fff3c2', '#f0b43a', '#a5620a'], toc: ['#eefae8', '#8fc48a', '#3e6e44'], bichnhat: ['#e6f8c8', '#8fcf6a', '#3f7a30']
  };
  var KL = { vang: ['#fff6c4', '#f6cb3e', '#d99a10', '#86580a'], bac: ['#ffffff', '#e4e8ec', '#a6aeb7', '#59616a'] };

  function defs(da, kl) {
    var d = DA[da] || DA.kimcuong, k = KL[kl] || KL.vang;
    return '<defs><radialGradient id="pd-' + da + '" cx="38%" cy="32%" r="78%"><stop offset="0" stop-color="' + d[0] + '"/><stop offset=".5" stop-color="' + d[1] + '"/><stop offset="1" stop-color="' + d[2] + '"/></radialGradient>' +
      '<linearGradient id="pk-' + kl + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + k[0] + '"/><stop offset=".38" stop-color="' + k[1] + '"/><stop offset=".72" stop-color="' + k[2] + '"/><stop offset="1" stop-color="' + k[3] + '"/></linearGradient>' +
      '<filter id="pb" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#2b1d0e" flood-opacity=".3"/></filter></defs>';
  }
  function sang(x, y, rx, ry, xoay, op) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity="' + (op || .8) + '"' + (xoay ? ' transform="rotate(' + xoay + ' ' + x + ' ' + y + ')"' : '') + '/>'; }
  function lap(n, f) { var h = ''; for (var i = 0; i < n; i++) h += f(i); return h; }
  function xoayQuanh(path, n, them) { return lap(n, function (i) { return '<path d="' + path + '"' + (them || '') + ' transform="rotate(' + (i * 360 / n) + ' 100 100)"/>'; }); }

  /* Mỗi dáng nhận P = {D: tô đá, K: tô kim loại, oD: viền đá, oK: viền kim loại, da: có đá} và vẽ trong khung 25..175 */
  var VE = {
    holo: function (P) {
      var g = 'M100 28 C116 28 126 42 126 58 C126 72 117 79 119 86 C138 94 148 112 146 132 C144 158 124 176 100 176 C76 176 56 158 54 132 C52 112 62 94 81 86 C83 79 74 72 74 58 C74 42 84 28 100 28Z';
      return P.da ? '<path d="' + g + '" fill="' + P.D + '" stroke="' + P.K + '" stroke-width="6"/><path d="M84 88 Q100 94 116 88" fill="none" stroke="' + P.K + '" stroke-width="4"/><ellipse cx="100" cy="30" rx="11" ry="6" fill="' + P.K + '"/>' +
          sang(88, 52, 6, 11, -10) + '<path d="M72 140 C74 118 86 106 100 106" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".6"/>'
        : '<path d="' + g + '" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3"/><path d="M84 88 Q100 94 116 88" fill="none" stroke="' + P.oK + '" stroke-width="2.5" opacity=".6"/>' + sang(88, 52, 5, 10, -10, .7) + sang(76, 126, 6, 16, -15, .55);
    },
    co4la: function (P) {
      var la = 'M100 96 C84 82 62 66 62 46 C62 30 80 22 92 34 C96 38 99 42 100 46 C101 42 104 38 108 34 C120 22 138 30 138 46 C138 66 116 82 100 96Z';
      var f = P.da ? P.D : P.K, o = P.da ? P.oD : P.oK;
      return '<g fill="' + f + '" stroke="' + o + '" stroke-width="4" stroke-linejoin="round">' + xoayQuanh(la, 4) + '</g>' +
        '<circle cx="100" cy="100" r="11" fill="' + (P.da ? P.K : f) + '"/><g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"><path d="M100 54 V86 M146 100 H114 M100 146 V114 M54 100 H86"/></g>' +
        sang(84, 42, 9, 4, -25) + sang(158, 86, 4, 8, 20, .7);
    },
    hoa: function (P) {
      var c = 'M100 98 C86 86 70 66 72 46 C74 30 88 24 100 30 C112 24 126 30 128 46 C130 66 114 86 100 98Z';
      var f = P.da ? P.D : P.K, o = P.da ? P.oD : P.oK;
      return '<g fill="' + f + '" stroke="' + o + '" stroke-width="4" stroke-linejoin="round">' + xoayQuanh(c, 5) + '</g>' +
        '<g fill="none" stroke="' + o + '" stroke-width="2.2" opacity=".4">' + xoayQuanh('M100 78 V42', 5) + '</g>' +
        '<circle cx="100" cy="100" r="17" fill="' + (P.da ? P.K : P.D2 || f) + '" stroke="' + P.oK + '" stroke-width="2"/>' + lap(6, function (i) { var a = i * Math.PI / 3; return '<circle cx="' + (100 + 9 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 9 * Math.sin(a)).toFixed(1) + '" r="2.6" fill="#fff" opacity=".7"/>'; }) +
        sang(88, 38, 8, 3.5, -20);
    },
    tron: function (P) {
      return P.da && P.kim ? '<circle cx="100" cy="100" r="66" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3"/><circle cx="100" cy="100" r="52" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="2"/>' + sang(82, 78, 14, 8, -30)
        : '<circle cx="100" cy="100" r="64" fill="' + (P.da ? P.D : P.K) + '" stroke="' + (P.da ? P.oD : P.oK) + '" stroke-width="3"/>' + sang(80, 76, 16, 9, -30) + sang(124, 132, 8, 4, -30, .35);
    },
    sen: function (P) {
      var f = P.da ? P.D : P.K, o = P.da ? P.oD : P.oK;
      return '<g fill="' + f + '" stroke="' + o + '" stroke-width="3.5" stroke-linejoin="round">' +
        '<path d="M100 40 C120 70 122 110 100 136 C78 110 80 70 100 40Z"/><path d="M58 70 C84 82 98 112 96 140 C68 132 54 104 58 70Z"/><path d="M142 70 C116 82 102 112 104 140 C132 132 146 104 142 70Z"/>' +
        '<path d="M36 112 C64 112 90 128 96 148 C66 152 42 136 36 112Z"/><path d="M164 112 C136 112 110 128 104 148 C134 152 158 136 164 112Z"/></g>' +
        '<path d="M66 150 Q100 166 134 150 L128 166 Q100 176 72 166Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2.5"/>' + sang(96, 66, 4, 12, -8);
    },
    buom: function (P) {
      var f = P.da ? P.D : P.K, o = P.oK;
      return '<g fill="' + f + '" stroke="' + o + '" stroke-width="3.5" stroke-linejoin="round">' +
        '<path d="M98 92 C80 50 40 34 30 56 C22 76 44 100 96 102Z"/><path d="M102 92 C120 50 160 34 170 56 C178 76 156 100 104 102Z"/>' +
        '<path d="M96 106 C60 108 44 126 52 144 C62 162 90 146 98 116Z"/><path d="M104 106 C140 108 156 126 148 144 C138 162 110 146 102 116Z"/></g>' +
        '<g fill="none" stroke="' + o + '" stroke-width="1.8" opacity=".45"><path d="M92 92 C76 70 54 58 42 62M90 98 C70 90 52 84 40 74M108 92 C124 70 146 58 158 62M110 98 C130 90 148 84 160 74M92 112 C78 120 66 130 62 142M108 112 C122 120 134 130 138 142"/></g>' +
        '<rect x="94" y="78" width="12" height="62" rx="6" fill="' + P.K + '" stroke="' + o + '" stroke-width="2.5"/><path d="M98 80 C92 66 86 58 78 54M102 80 C108 66 114 58 122 54" fill="none" stroke="' + P.K + '" stroke-width="3" stroke-linecap="round"/>' +
        sang(54, 58, 9, 4, -30) + sang(146, 58, 9, 4, 30);
    },
    dau: function (P) {
      var f = P.da ? P.D : P.K, o = P.da ? P.oD : P.oK;
      return '<path d="M100 30 C126 30 134 58 128 78 C122 96 130 108 130 124 C130 156 116 176 100 176 C84 176 70 156 70 124 C70 108 78 96 72 78 C66 58 74 30 100 30Z" fill="' + f + '" stroke="' + o + '" stroke-width="3.5"/>' +
        '<g fill="none" stroke="' + o + '" stroke-width="2" opacity=".35"><path d="M80 82 Q100 90 120 82M78 124 Q100 134 122 124"/></g>' +
        (P.da && P.kim ? '<path d="M86 32 Q100 22 114 32 L110 42 Q100 36 90 42Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2"/>' : '') +
        sang(88, 58, 6, 14, -8) + sang(86, 120, 6, 16, -6, .6);
    },
    holy: function (P) {
      var f = P.K, o = P.oK;
      return '<path d="M100 66 L66 34 L58 92 C58 126 78 150 100 176 C122 150 142 126 142 92 L134 34Z" fill="' + f + '" stroke="' + o + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M68 48 L74 80 L88 72Z M132 48 L126 80 L112 72Z" fill="' + (P.da ? P.D : o) + '" opacity="' + (P.da ? 1 : .35) + '"/>' +
        '<path d="M70 104 C78 96 90 98 94 108 C86 114 76 114 70 104Z M130 104 C122 96 110 98 106 108 C114 114 124 114 130 104Z" fill="#3b2a12" opacity=".75"/>' +
        '<path d="M100 120 L92 140 Q100 150 108 140Z" fill="' + o + '" opacity=".35"/><g fill="none" stroke="' + o + '" stroke-width="2" opacity=".5"><path d="M78 128 Q88 140 96 160M122 128 Q112 140 104 160"/></g>' + sang(84, 60, 4, 10, -30, .7);
    },
    kimtien: function (P) {
      return '<circle cx="100" cy="100" r="68" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/><circle cx="100" cy="100" r="56" fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".5"/>' +
        '<rect x="84" y="84" width="32" height="32" rx="3" fill="' + (P.da ? P.D : '#3b2a12') + '" stroke="' + P.oK + '" stroke-width="3" opacity="' + (P.da ? 1 : .55) + '"/>' +
        '<g fill="' + P.oK + '" opacity=".55"><rect x="94" y="52" width="12" height="20" rx="2"/><rect x="94" y="128" width="12" height="20" rx="2"/><rect x="52" y="94" width="20" height="12" rx="2"/><rect x="128" y="94" width="20" height="12" rx="2"/></g>' + sang(70, 60, 14, 6, -40);
    },
    tim: function (P) {
      var f = P.da ? P.D : P.K, o = P.da ? P.oD : P.oK;
      return '<path d="M100 170 C60 136 32 112 32 78 C32 52 52 36 72 36 C86 36 96 44 100 56 C104 44 114 36 128 36 C148 36 168 52 168 78 C168 112 140 136 100 170Z" fill="' + f + '" stroke="' + (P.da && P.kim ? P.K : o) + '" stroke-width="' + (P.da && P.kim ? 6 : 3.5) + '"/>' + sang(66, 66, 14, 7, -40) + sang(130, 70, 5, 3, 30, .6);
    },
    sao: function (P) {
      var d = ''; for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 32 : 74; d += (i ? 'L' : 'M') + (100 + r * Math.cos(a)).toFixed(1) + ' ' + (104 + r * Math.sin(a)).toFixed(1); }
      return '<path d="' + d + 'Z" fill="' + (P.da ? P.D : P.K) + '" stroke="' + (P.da ? P.oD : P.oK) + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M100 30 L100 104 M30 81 L100 104 M170 81 L100 104 M57 164 L100 104 M143 164 L100 104" stroke="' + P.oK + '" stroke-width="1.5" opacity=".35"/>' + sang(92, 60, 4, 10, -10);
    },
    giot: function (P) {
      var f = P.da ? P.D : P.K;
      return '<path d="M100 30 C120 70 146 96 146 126 C146 154 126 174 100 174 C74 174 54 154 54 126 C54 96 80 70 100 30Z" fill="' + f + '" stroke="' + (P.da && P.kim ? P.K : P.oK) + '" stroke-width="' + (P.da && P.kim ? 6 : 3.5) + '"/>' + sang(80, 120, 8, 18, -10) + sang(116, 150, 6, 3, 0, .5);
    },
    la: function (P) {
      return '<path d="M100 28 C140 60 150 120 104 176 C56 130 60 64 100 28Z" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<path d="M100 40 C104 90 104 130 104 176" fill="none" stroke="' + P.oK + '" stroke-width="2.5"/>' + lap(6, function (i) { var y = 60 + i * 18; return '<path d="M103 ' + y + ' L' + (128 - i * 2) + ' ' + (y - 14) + ' M102 ' + (y + 6) + ' L' + (76 + i * 2) + ' ' + (y - 8) + '" stroke="' + P.oK + '" stroke-width="1.6" opacity=".55"/>'; }) + sang(88, 70, 5, 14, 15);
    },
    ca: function (P) {
      return '<path d="M118 136 C128 150 128 166 116 178 C134 180 152 168 156 148 C162 158 170 160 176 158 C166 148 160 132 160 116 C150 128 136 134 118 136Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M80 30 C100 26 124 42 130 66 C136 92 130 116 118 136 C108 128 88 116 76 100 C64 84 62 42 80 30Z" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<g fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".45">' + lap(4, function (i) { return '<path d="M' + (96 + i * 6) + ' ' + (66 + i * 16) + ' q8 -8 16 0"/>'; }) + '</g>' +
        '<path d="M94 34 C86 48 86 66 92 80" fill="none" stroke="' + P.oK + '" stroke-width="2.5"/><circle cx="80" cy="50" r="5" fill="#fff" stroke="' + P.oK + '" stroke-width="2"/>' + sang(92, 38, 8, 3, -15);
    },
    meo: function (P) {
      var f = P.da ? P.D : P.K;
      return '<path d="M54 74 L50 30 L84 54 Q100 50 116 54 L150 30 L146 74 C160 96 158 140 132 160 C114 174 86 174 68 160 C42 140 40 96 54 74Z" fill="' + f + '" stroke="' + P.oK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<ellipse cx="80" cy="104" rx="8" ry="11" fill="#3b2a12" opacity=".8"/><ellipse cx="120" cy="104" rx="8" ry="11" fill="#3b2a12" opacity=".8"/><circle cx="82" cy="100" r="3" fill="#fff"/><circle cx="122" cy="100" r="3" fill="#fff"/>' +
        '<path d="M94 124 L106 124 L100 132Z" fill="#e88a8a"/><path d="M100 132 Q92 142 84 136 M100 132 Q108 142 116 136" fill="none" stroke="' + P.oK + '" stroke-width="2"/>' +
        '<g stroke="' + P.oK + '" stroke-width="1.6" opacity=".5"><path d="M60 122 L36 118M60 130 L38 136M140 122 L164 118M140 130 L162 136"/></g>' + sang(72, 70, 8, 4, -30);
    },
    ngua: function (P) {
      return '<path d="M70 40 C86 30 108 34 116 50 L150 62 C160 66 160 80 150 82 L126 78 C130 96 132 112 126 128 L128 172 L112 172 L108 136 L84 136 L80 172 L64 172 L64 126 C52 112 50 92 58 74 L52 60Z" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<path d="M70 40 C62 54 58 66 60 80 M78 38 C72 52 70 64 72 76" fill="none" stroke="' + P.oK + '" stroke-width="2.5" opacity=".6"/><circle cx="128" cy="62" r="4" fill="#3b2a12"/>' + sang(96, 96, 14, 6, -20, .6);
    },
    khanh: function (P) {
      return '<path d="M36 72 C60 48 140 48 164 72 C170 80 166 92 156 92 C140 80 60 80 44 92 C34 92 30 80 36 72Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3"/>' +
        '<path d="M44 92 C50 124 74 150 100 158 C126 150 150 124 156 92 C140 82 60 82 44 92Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<circle cx="100" cy="114" r="' + (P.da ? 16 : 13) + '" fill="' + (P.da ? P.D : 'none') + '" stroke="' + P.oK + '" stroke-width="2.5"/>' +
        '<g fill="none" stroke="' + P.oK + '" stroke-width="1.8" opacity=".5"><path d="M62 104 Q74 112 80 128M138 104 Q126 112 120 128"/></g>' +
        '<path d="M100 158 L100 172 M92 172 L108 172 L104 182 L96 182Z" stroke="' + P.oK + '" stroke-width="2" fill="' + P.K + '"/>' + sang(70, 66, 14, 4, -10, .7);
    },
    the: function (P) {
      return '<rect x="58" y="32" width="84" height="140" rx="14" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/><rect x="68" y="44" width="64" height="116" rx="8" fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".5"/>' +
        (P.da ? '<ellipse cx="100" cy="102" rx="20" ry="26" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="2"/>' :
          '<g stroke="' + P.oK + '" stroke-width="3.5" stroke-linecap="round" opacity=".6"><path d="M84 74 H116 M100 64 V96 M80 104 H120 M90 116 L110 116 M86 128 Q100 146 114 128"/></g>') + sang(76, 56, 5, 18, 0, .55);
    },
    tui: function (P) {
      return '<path d="M78 54 C60 74 44 108 50 138 C56 166 80 174 100 174 C120 174 144 166 150 138 C156 108 140 74 122 54Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<path d="M70 40 Q100 56 130 40 L122 58 Q100 66 78 58Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3"/><path d="M76 60 Q100 70 124 60" fill="none" stroke="' + (P.da ? '#c4283f' : P.oK) + '" stroke-width="4"/>' +
        (P.da ? '<circle cx="100" cy="122" r="16" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="2"/>' : '<path d="M88 112 H112 M100 102 V138 M90 126 H110" stroke="' + P.oK + '" stroke-width="3" opacity=".5"/>') + sang(72, 112, 7, 18, 10, .6);
    },
    chuong: function (P) {
      return '<path d="M100 34 C70 34 60 64 58 100 C56 128 46 140 36 150 L164 150 C154 140 144 128 142 100 C140 64 130 34 100 34Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<rect x="34" y="146" width="132" height="10" rx="5" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2.5"/><circle cx="100" cy="166" r="11" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="2.5"/>' +
        '<path d="M70 110 Q100 120 130 110" fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".5"/>' + sang(78, 76, 6, 18, 10, .7);
    },
    khoa: function (P) {
      return '<path d="M70 70 V58 C70 40 84 30 100 30 C116 30 130 40 130 58 V70" fill="none" stroke="' + P.K + '" stroke-width="10"/>' +
        '<path d="M44 74 C70 64 130 64 156 74 C162 104 150 140 100 170 C50 140 38 104 44 74Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        (P.da ? '<ellipse cx="100" cy="108" rx="22" ry="18" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="2"/>' : '<circle cx="100" cy="104" r="8" fill="#3b2a12" opacity=".7"/><rect x="96" y="108" width="8" height="18" rx="3" fill="#3b2a12" opacity=".7"/>') + sang(66, 90, 6, 14, 20, .6);
    },
    thoi: function (P) {
      return '<path d="M30 104 C40 96 56 98 64 106 L136 106 C144 98 160 96 170 104 C166 140 138 160 100 160 C62 160 34 140 30 104Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<ellipse cx="100" cy="100" rx="34" ry="30" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3"/>' + sang(88, 88, 10, 5, -30) + sang(56, 126, 12, 4, 15, .55);
    },
    trang: function (P) {
      return '<path d="M120 30 C80 34 52 66 52 104 C52 142 82 172 120 174 C96 156 84 132 84 104 C84 74 98 46 120 30Z" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3.5"/>' + sang(70, 92, 5, 18, 10, .7);
    },
    no: function (P) {
      return '<path d="M100 92 C76 66 38 58 34 84 C30 108 66 112 100 100Z M100 92 C124 66 162 58 166 84 C170 108 134 112 100 100Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<path d="M94 102 L70 166 L84 160 L92 172 L100 106Z M106 102 L130 166 L116 160 L108 172 L100 106Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3"/><circle cx="100" cy="96" r="12" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3"/>' + sang(56, 78, 9, 4, -20);
    },
    quat: function (P) {
      return '<path d="M100 166 L30 80 C60 40 140 40 170 80Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5" stroke-linejoin="round"/>' +
        '<g stroke="' + P.oK + '" stroke-width="1.8" opacity=".5">' + lap(7, function (i) { var a = (-130 + i * 13.3) * Math.PI / 180; return '<path d="M100 166 L' + (100 + 110 * Math.cos(a)).toFixed(1) + ' ' + (166 + 110 * Math.sin(a)).toFixed(1) + '"/>'; }) + '</g>' +
        '<circle cx="100" cy="160" r="8" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="2"/>' + sang(80, 62, 14, 4, -10, .7);
    },
    nho: function (P) {
      var o = [[100, 52], [80, 70], [120, 70], [100, 88], [70, 92], [130, 92], [86, 110], [114, 110], [100, 130], [90, 150], [110, 150]];
      return '<path d="M100 30 V46" stroke="' + P.K + '" stroke-width="6"/><path d="M104 40 C120 30 136 34 140 46 C126 50 112 48 104 40Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2"/>' +
        o.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + (p[1] + 8) + '" r="15" fill="' + (P.da ? P.D : P.K) + '" stroke="' + (P.da ? P.oD : P.oK) + '" stroke-width="2.5"/>' + sang(p[0] - 5, p[1] + 2, 4, 2.5, -30); }).join('');
    },
    phat: function (P) {
      return '<ellipse cx="100" cy="128" rx="54" ry="46" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3.5"/><circle cx="100" cy="68" r="34" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<g fill="none" stroke="' + P.oK + '" stroke-width="2.5" stroke-linecap="round"><path d="M84 66 Q90 60 96 66M104 66 Q110 60 116 66M86 80 Q100 94 114 80"/><path d="M70 120 Q100 150 130 120" opacity=".5"/></g>' +
        '<circle cx="100" cy="132" r="6" fill="' + P.oK + '" opacity=".4"/>' + sang(84, 50, 9, 4, -30) + sang(72, 112, 8, 4, -30, .6);
    },
    mat: function (P) {
      return P.da ? '<circle cx="100" cy="100" r="62" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3"/>' + lap(16, function (i) { var a = i * Math.PI / 8; return '<circle cx="' + (100 + 56 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 56 * Math.sin(a)).toFixed(1) + '" r="4" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="1"/>'; }) +
          '<ellipse cx="100" cy="100" rx="44" ry="46" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="2.5"/>' + sang(84, 80, 13, 7, -30)
        : '<circle cx="100" cy="100" r="62" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/><circle cx="100" cy="100" r="44" fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".45"/>' +
          '<g fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".5">' + xoayQuanh('M100 62 C110 76 110 88 100 100 C90 88 90 76 100 62Z', 6) + '</g>' + sang(76, 70, 14, 6, -40);
    },
    /* ---- dạng ống: trục NGANG, cân xứng hai đầu ---- */
    lu: function (P) {   // lu thống: cân xứng qua đai giữa
      var nua = P.da
        ? '<path d="M40 52 L94 64 L94 136 L40 148Z" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<g stroke="' + P.oK + '" stroke-width="1.8" opacity=".55"><path d="M40 76 L94 82 M40 100 L94 100 M40 124 L94 118"/></g>' +
          '<g fill="#fff" opacity=".85"><path d="M46 58 L88 68 L88 74 L46 66Z"/><path d="M46 104 L88 104 L88 110 L46 112Z"/></g>' +
          '<path d="M40 50 C30 48 24 56 24 64 C32 66 34 72 34 78 C24 80 20 90 20 100 C20 110 24 120 34 122 C34 128 32 134 24 136 C24 144 30 152 40 150Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
          lap(4, function (i) { return '<circle cx="18" cy="' + (64 + i * 24) + '" r="6" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="1.5"/>'; })
        : '<path d="M30 60 C30 50 36 46 44 46 L94 40 L94 160 L44 154 C36 154 30 150 30 140Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<g fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".5"><path d="M50 46 V154 M64 44 V156 M78 42 V158"/></g>' +
          '<path d="M24 64 C20 80 20 120 24 136 L32 138 C28 120 28 80 32 62Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2"/>';
      return '<g>' + nua + '</g><g transform="matrix(-1 0 0 1 200 0)">' + nua + '</g>' +
        '<rect x="90" y="' + (P.da ? 56 : 36) + '" width="20" height="' + (P.da ? 88 : 128) + '" rx="8" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3"/>' + sang(100, P.da ? 70 : 52, 4, 9, 0, .8);
    },
    ong: function (P) {
      return '<rect x="26" y="56" width="148" height="88" rx="20" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        '<g fill="none" stroke="' + P.oK + '" stroke-width="2" opacity=".5"><path d="M44 58 V142 M156 58 V142"/>' + lap(5, function (i) { var x = 62 + i * 19; return '<path d="M' + x + ' 72 q9 14 0 28 q-9 14 0 28"/>'; }) + '</g>' +
        (P.da ? '<ellipse cx="100" cy="100" rx="16" ry="22" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="2"/>' : '') + '<rect x="34" y="64" width="132" height="10" rx="5" fill="#fff" opacity=".45"/>';
    },
    chan: function (P) {   // chặn bánh xe nhìn ngang: đĩa dẹt có răng
      return '<rect x="60" y="30" width="80" height="140" rx="14" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3.5"/>' +
        lap(7, function (i) { var y = 40 + i * 20; return '<rect x="56" y="' + y + '" width="88" height="8" rx="4" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="1.5"/>'; }) +
        (P.da ? lap(5, function (i) { return '<circle cx="100" cy="' + (52 + i * 24) + '" r="6" fill="' + P.D + '" stroke="' + P.oK + '" stroke-width="1.2"/>'; }) : '') +
        '<rect x="68" y="34" width="10" height="132" rx="5" fill="#fff" opacity=".45"/>';
    },
    dieu: function (P) {   // đồng điếu: hạt giữa, hai đầu bịt kim loại
      return '<ellipse cx="100" cy="100" rx="58" ry="52" fill="' + (P.da ? P.D : P.K) + '" stroke="' + (P.da ? P.oD : P.oK) + '" stroke-width="3"/>' +
        '<path d="M42 70 C30 80 30 120 42 130 L54 126 C46 114 46 86 54 74Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2.5"/><path d="M158 70 C170 80 170 120 158 130 L146 126 C154 114 154 86 146 74Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2.5"/>' +
        sang(84, 76, 16, 8, -20) + sang(116, 128, 8, 4, -20, .5);
    },
    kimcang: function (P) {   // chày kim cang: hạt giữa, hai đầu toả cánh
      var dau = '<path d="M72 100 L40 70 C34 80 32 90 34 100 C32 110 34 120 40 130Z" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M72 100 L30 100" stroke="' + P.oK + '" stroke-width="2" opacity=".5"/><path d="M72 92 L40 64 M72 108 L40 136" stroke="' + P.K + '" stroke-width="5" stroke-linecap="round"/><circle cx="28" cy="100" r="7" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2"/>';
      return dau + '<g transform="matrix(-1 0 0 1 200 0)">' + dau + '</g><circle cx="100" cy="100" r="30" fill="' + (P.da ? P.D : P.K) + '" stroke="' + P.oK + '" stroke-width="3"/>' +
        '<rect x="66" y="88" width="10" height="24" rx="4" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2"/><rect x="124" y="88" width="10" height="24" rx="4" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="2"/>' + sang(90, 88, 9, 5, -30);
    }
  };
  var ONG = { lu: 1, ong: 1, chan: 1, dieu: 1, kimcang: 1 };

  function rieng(c) {   // bản vẽ riêng (charm-ve-rieng.js), theo id rồi theo mã
    var R = window.VE_RIENG || {}, v = R[c.id] || R[c.ma];
    while (v && v.cung) v = R[v.cung];
    return v;
  }
  window.kieuXo = function (c) { var v = rieng(c); return (v && v.xo) || c.xo || 'treo'; };
  window.phacCharm = function (c) {
    var da = c.da || '', kl = c.kl || 'vang', d = DA[da], k = KL[kl] || KL.vang, hinh = VE[c.hinh] ? c.hinh : 'mat';
    var P = { D: 'url(#pd-' + (da || 'x') + ')', K: 'url(#pk-' + kl + ')', oD: d ? d[2] : k[3], oK: k[3], da: !!d, kim: true };
    var rg = rieng(c);
    if (rg && rg.kl && KL[rg.kl]) { kl = rg.kl; k = KL[kl]; P.K = 'url(#pk-' + kl + ')'; P.oK = k[3]; if (!d) P.oD = k[3]; }   // màu kim loại xem từ ảnh
    if (rg && rg.da && DA[rg.da]) { da = rg.da; d = DA[da]; P.D = 'url(#pd-' + da + ')'; P.oD = d[2]; }
    if (rg && rg.s) return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs(da || 'x', kl) + '<g filter="url(#pb)">' +
      rg.s.replace(/\{D\}/g, P.D).replace(/\{K\}/g, P.K).replace(/\{oD\}/g, P.oD).replace(/\{oK\}/g, P.oK) + '</g></svg>';
    var than = VE[hinh](P), xo = c.xo || 'treo', h;
    if (xo === 'treo') {
      // khoen ở đỉnh (100,10); thân thu lại, treo ngay dưới khoen
      h = '<circle cx="100" cy="20" r="11" fill="none" stroke="' + P.K + '" stroke-width="6"/><rect x="95" y="29" width="10" height="16" rx="4" fill="' + P.K + '" stroke="' + P.oK + '" stroke-width="1.5"/>' +
        '<g transform="translate(100 44) scale(.84) translate(-100 -28)">' + than + '</g>';
    } else if (xo === 'ong' && !ONG[hinh]) {
      h = '<g transform="rotate(90 100 100)">' + than + '</g>';   // dáng đứng mà xỏ ống → xoay nằm theo dây
    } else h = than;
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">' + defs(da || 'x', kl) + '<g filter="url(#pb)">' + h + '</g></svg>';
  };
})();
