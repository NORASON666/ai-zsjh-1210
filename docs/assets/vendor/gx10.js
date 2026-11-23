/* GX10 3D（從中山國中 AI 算力中心首頁移植，2026-11-23）：GX10Hero(canvas, {two, label})
 * 依 ASUS 官方產品照比例自建模型（不使用官方圖片）：150×150×51mm、銀色髮絲鋁、深色菱格頂蓋、正面 U 形溝、方形電源鍵 */
window.GX10Hero = function (cv, opt) {
  opt = opt || {};
  if (!window.THREE) return;
  let R; try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
  R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = .9;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, .05, 200);
  // 環境光源：做一個漸層的立方環境貼圖，讓鏡面頂蓋與金屬有反光
  const envFace = (top, bot) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(14, 34, 100, 16); return c; };
  const cube = new THREE.CubeTexture([envFace('#9a9ea4', '#141518'), envFace('#8d9197', '#141518'), envFace('#f2f4f7', '#a6aab0'), envFace('#050506', '#000'), envFace('#6d7177', '#101113'), envFace('#7c8086', '#101113')]);
  cube.needsUpdate = true;
  const pm = new THREE.PMREMGenerator(R); scene.environment = pm.fromCubemap(cube).texture;
  scene.add(new THREE.AmbientLight(0xffffff, .25));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 6, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x7fb8ff, 1.2); rim.position.set(-5, 2, -4); scene.add(rim);

  // ── GX10：150×150×51mm（1 單位＝100mm），依 ASUS 官方產品照：
  //    深鐵灰機身；頂蓋細密菱格網紋；正面上半平滑＋ASUS 字樣、下半直立波浪縱溝；右側方形電源鍵；
  //    背面上半一排直立長條散熱孔，下方由左到右：安全鎖孔、4 個 USB-C（最左供電）、HDMI、10G 網路、ConnectX-7
  const W = 1.5, H = .51, RAD = .06;
  function roundedSquare(w, r) { const s = new THREE.Shape(), h = w / 2;
    s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
    s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h); return s; }
  const canvasTex = (w, h, draw, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); } return t; };
  // 頂蓋：菱格網紋（斜向的小方點）
  const knurl = canvasTex(256, 256, (g, w) => { g.fillStyle = '#202328'; g.fillRect(0, 0, w, w);
    for (let y = 0; y < w; y += 16) for (let x = (y / 16) % 2 ? -8 : 0; x < w; x += 16) {
      g.fillStyle = '#4c5159'; g.beginPath(); g.moveTo(x + 8, y + 1); g.lineTo(x + 15, y + 8); g.lineTo(x + 8, y + 15); g.lineTo(x + 1, y + 8); g.fill();
      g.fillStyle = '#6a7079'; g.beginPath(); g.moveTo(x + 8, y + 1); g.lineTo(x + 15, y + 8); g.lineTo(x + 8, y + 8); g.fill(); } }, 5);
  // 機身：銀色髮絲紋鋁（水平細線＋微雜訊）
  const brushed = canvasTex(512, 512, (g, w) => { g.fillStyle = '#c4c8ce'; g.fillRect(0, 0, w, w);
    for (let y = 0; y < w; y++) { const v = 180 + Math.random() * 40 | 0; g.fillStyle = `rgba(${v},${v + 2},${v + 6},.35)`; g.fillRect(0, y, w, 1); } });
  const matBody = new THREE.MeshStandardMaterial({ color: 0xc9cdd3, map: brushed, metalness: .9, roughness: .3, envMapIntensity: 1.1 });
  const matTop = new THREE.MeshStandardMaterial({ color: 0xffffff, map: knurl, metalness: .55, roughness: .5, envMapIntensity: .5 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: .2, roughness: .9 });
  const matFin = matBody;
  const logoTex = canvasTex(512, 128, (g, w, h) => { g.font = 'italic 900 92px "Arial Black","Helvetica Neue",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(70,74,80,.75)'; g.fillText('ASUS', w / 2 + 2, h / 2 + 6); g.fillStyle = 'rgba(235,238,242,.95)'; g.fillText('ASUS', w / 2, h / 2 + 4); });
  const pwrTex = canvasTex(128, 128, (g, w) => { g.fillStyle = '#3f444c'; g.fillRect(0, 0, w, w); g.strokeStyle = '#c9d2de'; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.arc(64, 68, 26, -Math.PI * .32, Math.PI * 1.32); g.stroke(); g.beginPath(); g.moveTo(64, 30); g.lineTo(64, 62); g.stroke(); });
  function roundedRect(w, d, r) { const s = new THREE.Shape(), x = w / 2, z = d / 2;
    s.moveTo(-x + r, -z); s.lineTo(x - r, -z); s.quadraticCurveTo(x, -z, x, -z + r); s.lineTo(x, z - r); s.quadraticCurveTo(x, z, x - r, z);
    s.lineTo(-x + r, z); s.quadraticCurveTo(-x, z, -x, z - r); s.lineTo(-x, -z + r); s.quadraticCurveTo(-x, -z, -x + r, -z); return s; }
  // 正面下半的溝是真的切進機身：俯視外框在正面那一邊挖出一排 U 形缺口，往上擠出成「下半部機身」；
  // 上半部機身是完整外框。溝頂的圓弧用溝口上方的暗色半圓表現，溝裡放一片暗色背板當陰影。（2026-11-23 依官方產品照）
  const CR = .13, FIN_H = H * .62, GD = .07, PB_X = W * .34;
  const NS = 36, FW = W - 2 * CR - .04, PITCH = FW / NS, SW = PITCH * .55;
  const notchX = [...Array(NS)].map((_, i) => -FW / 2 + (i + .5) * PITCH);
  function notchedRect(w, r) {   // shape 的 y=-w/2 那一邊＝機身正面
    const s = new THREE.Shape(), h = w / 2;
    s.moveTo(-h + r, -h);
    notchX.forEach(cx => { const l = cx - SW / 2, rr = SW / 2;
      s.lineTo(l, -h); s.lineTo(l, -h + GD); s.lineTo(cx + rr, -h + GD); s.lineTo(cx + rr, -h); });
    s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
    s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h); return s;
  }
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x07080a });
  function makeGX(label) {
    const g = new THREE.Group();
    const lower = new THREE.ExtrudeGeometry(notchedRect(W, CR), { depth: FIN_H, bevelEnabled: false, curveSegments: 6 });
    lower.rotateX(-Math.PI / 2); lower.translate(0, -H / 2, 0);
    const upper = new THREE.ExtrudeGeometry(roundedRect(W, W, CR), { depth: H - FIN_H, bevelEnabled: false, curveSegments: 14 });
    upper.rotateX(-Math.PI / 2); upper.translate(0, -H / 2 + FIN_H, 0);
    g.add(new THREE.Mesh(lower, matBody), new THREE.Mesh(upper, matBody));
    // 頂蓋：深色菱格紋，四邊留一圈銀色窄邊
    const top = new THREE.Mesh(new THREE.ShapeGeometry(roundedRect(W - .04, W - .04, CR - .02)), matTop); top.rotation.x = -Math.PI / 2; top.position.y = H / 2 + .001; g.add(top);
    // 溝裡的暗色背板（只從溝口看得到）＋溝頂圓弧
    const back = new THREE.Mesh(new THREE.PlaneGeometry(FW, FIN_H), slotMat); back.position.set(0, -H / 2 + FIN_H / 2, W / 2 - .007); g.add(back);
    const capGeo = new THREE.CircleGeometry(SW / 2, 10, 0, Math.PI);
    notchX.forEach(x => { const c = new THREE.Mesh(capGeo, slotMat); c.position.set(x, -H / 2 + FIN_H - .0005, W / 2 + .0006); g.add(c); });
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(.28, .07), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true })); logo.position.set(0, H * .24, W / 2 + .001); g.add(logo);
    // 右側方形電源鍵
    const pb = new THREE.Mesh(new THREE.BoxGeometry(.11, .11, .012), new THREE.MeshStandardMaterial({ color: 0x6b7078, metalness: .7, roughness: .35 })); pb.position.set(PB_X, -H * .12, W / 2 + .006); g.add(pb);
    const pi = new THREE.Mesh(new THREE.PlaneGeometry(.085, .085), new THREE.MeshBasicMaterial({ map: pwrTex })); pi.position.set(PB_X, -H * .12, W / 2 + .022); g.add(pi);
    const led = { material: pi.material };   // 電源鍵圖示當作呼吸燈
    // 背面上半：直立長條散熱孔
    const BZ = -W / 2 - .006;
    for (let i = 0; i < 24; i++) { const sl = new THREE.Mesh(new THREE.BoxGeometry(.034, H * .42, .012), matDark); sl.position.set(-W * .41 + i * W * .82 / 23, H * .13, BZ); g.add(sl); }
    // 背面下方連接埠
    [[-.6, .02, .05], [-.47, .05, .028], [-.39, .05, .028], [-.31, .05, .028], [-.23, .05, .028], [-.06, .1, .038], [.13, .08, .07], [.42, .3, .075]].forEach(([x, w, h]) => {
      const pt = new THREE.Mesh(new THREE.BoxGeometry(w, h, .012), matDark); pt.position.set(x, -H * .28, BZ); g.add(pt); });
    // 標籤（浮在上方）
    const c = document.createElement('canvas'); c.width = 512; c.height = 96; const x = c.getContext('2d');
    x.font = '800 54px "Noto Sans TC",sans-serif'; x.textAlign = 'center'; x.fillStyle = '#1e3a6e'; x.fillText(label, 256, 66);
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false })); tag.scale.set(1.1, .2, 1); tag.position.y = .62; tag.material.opacity = 0; g.add(tag);
    // 地面柔光
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1.0, 64), new THREE.MeshBasicMaterial({ color: 0x2f6bff, transparent: true, opacity: .1, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = -H / 2 - .01; g.add(glow);
    g.userData = { tag, glow, led };
    scene.add(g); return g;
  }
  const A = makeGX('GX10-A'), B = opt.two ? makeGX('GX10-B') : null;
  if (B) { A.position.x = -.95; B.position.x = .95; }
  [A, B].forEach(g => g && (g.userData.tag.material.opacity = opt.two ? .9 : 0));
  function size() { const w = cv.clientWidth, h = cv.clientHeight; if (!w) return; R.setPixelRatio(Math.min(2, devicePixelRatio)); R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  size(); addEventListener('resize', size); new ResizeObserver(size).observe(cv);
  const t0 = performance.now();
  (function loop() {
    requestAnimationFrame(loop);
    if (!cv.offsetParent) return;                       // 投影片沒顯示就不畫
    const t = (performance.now() - t0) / 1000, d = opt.mini ? 5.6 : (opt.two ? 6.4 : 4.6), yaw = (opt.mini ? -.35 : -.55) + Math.sin(t * .35) * (opt.mini ? .22 : .35);
    cam.position.set(Math.sin(yaw) * d, (opt.mini ? 2.1 : 1.55) + Math.sin(t * .25) * .15, Math.cos(yaw) * d); cam.lookAt(0, opt.mini ? .05 : -.05, 0);
    [A, B].forEach((g, j) => g && g.userData.led.material.color.setScalar(.75 + .25 * Math.sin(t * 2.4 + j)));
    R.render(scene, cam);
  })();
};
