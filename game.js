// Bird Blaster — мультяшный стиль, большие птицы и пушка
function makeTexture(scene, key, w, h, drawFn) {
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  drawFn(ctx, w, h);
  scene.textures.addCanvas(key, canvas);
}

class BootScene extends Phaser.Scene {
  constructor() { super("BootScene"); }
  create() {
    const W = this.scale.width, H = this.scale.height;

    // ── ФОН: яркое дневное небо ──
    makeTexture(this, "bg", W, H, (ctx, w, h) => {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.72);
      sky.addColorStop(0, "#3eb8f5");
      sky.addColorStop(0.5, "#6dcff6");
      sky.addColorStop(1, "#a8e6fb");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);

      function cloud(cx, cy, sc) {
        ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
        ctx.fillStyle = "rgba(255,255,255,0.96)";
        [[0,0,55],[60,-10,42],[-60,-6,40],[110,6,32],[-108,6,32],[28,-32,30],[-24,-30,26]].forEach(([ox,oy,r]) => {
          ctx.beginPath(); ctx.arc(ox,oy,r,0,Math.PI*2); ctx.fill();
        });
        ctx.restore();
      }
      cloud(w*0.18, h*0.09, 1.3); cloud(w*0.72, h*0.06, 1.0);
      cloud(w*0.48, h*0.19, 1.5); cloud(w*0.10, h*0.27, 0.9);
      cloud(w*0.85, h*0.24, 1.1); cloud(w*0.35, h*0.34, 0.8);

      const forestY = h * 0.72;
      ctx.fillStyle = "#2d6a2d";
      for (let tx = -20; tx < w+20; tx += 38) {
        const th = 80 + (tx*13%50);
        ctx.beginPath();
        ctx.moveTo(tx, forestY); ctx.lineTo(tx-22, forestY);
        ctx.lineTo(tx-10, forestY-th*0.5); ctx.lineTo(tx-16, forestY-th*0.5);
        ctx.lineTo(tx-4, forestY-th*0.8); ctx.lineTo(tx-8, forestY-th*0.8);
        ctx.lineTo(tx, forestY-th);
        ctx.lineTo(tx+8, forestY-th*0.8); ctx.lineTo(tx+4, forestY-th*0.8);
        ctx.lineTo(tx+16, forestY-th*0.5); ctx.lineTo(tx+10, forestY-th*0.5);
        ctx.lineTo(tx+22, forestY); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = "#3d8c3d";
      for (let tx = 10; tx < w; tx += 55) {
        const th = 100 + (tx*7%60);
        ctx.beginPath();
        ctx.moveTo(tx, forestY+10); ctx.lineTo(tx-28, forestY+10);
        ctx.lineTo(tx-12, forestY-th*0.45); ctx.lineTo(tx-20, forestY-th*0.45);
        ctx.lineTo(tx-6, forestY-th*0.75); ctx.lineTo(tx-10, forestY-th*0.75);
        ctx.lineTo(tx, forestY-th);
        ctx.lineTo(tx+10, forestY-th*0.75); ctx.lineTo(tx+6, forestY-th*0.75);
        ctx.lineTo(tx+20, forestY-th*0.45); ctx.lineTo(tx+12, forestY-th*0.45);
        ctx.lineTo(tx+28, forestY+10); ctx.closePath(); ctx.fill();
      }
      const grass = ctx.createLinearGradient(0, forestY, 0, h);
      grass.addColorStop(0, "#4caf50"); grass.addColorStop(0.2, "#388e3c"); grass.addColorStop(1, "#1b5e20");
      ctx.fillStyle = grass; ctx.fillRect(0, forestY, w, h-forestY);
      ctx.fillStyle = "#66bb6a"; ctx.fillRect(0, forestY, w, 18);
    });

    // ── ПУШКА — большой мультяшный бластер ──
    makeTexture(this, "gun", 240, 320, (ctx) => {
      // Рукоять
      ctx.fillStyle = "#5d4037";
      ctx.beginPath(); ctx.roundRect(82, 210, 76, 100, 14); ctx.fill();
      ctx.strokeStyle = "#4e342e"; ctx.lineWidth = 2;
      for (let y = 225; y < 300; y += 15) {
        ctx.beginPath(); ctx.moveTo(88, y); ctx.lineTo(152, y); ctx.stroke();
      }
      ctx.strokeStyle = "#8d6e63"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(82, 210, 76, 100, 14); ctx.stroke();

      // Тело — оранжевое
      ctx.fillStyle = "#ff6f00";
      ctx.beginPath(); ctx.roundRect(30, 130, 180, 88, 18); ctx.fill();
      ctx.strokeStyle = "#e65100"; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(30, 130, 180, 88, 18); ctx.stroke();

      // Зелёная полоса
      ctx.fillStyle = "#43a047";
      ctx.beginPath(); ctx.roundRect(38, 148, 164, 28, 8); ctx.fill();
      ctx.fillStyle = "#66bb6a";
      ctx.beginPath(); ctx.roundRect(42, 152, 156, 20, 6); ctx.fill();

      // Жёлтая полоса
      ctx.fillStyle = "#fdd835";
      ctx.beginPath(); ctx.roundRect(38, 182, 164, 20, 7); ctx.fill();
      ctx.strokeStyle = "#f9a825"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(38, 182, 164, 20, 7); ctx.stroke();

      // Синий шарик
      ctx.fillStyle = "#1565c0";
      ctx.beginPath(); ctx.arc(62, 210, 18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#42a5f5";
      ctx.beginPath(); ctx.arc(56, 204, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath(); ctx.arc(53, 202, 3, 0, Math.PI*2); ctx.fill();

      // Ствол
      const barrelGrad = ctx.createLinearGradient(80, 0, 160, 0);
      barrelGrad.addColorStop(0, "#555"); barrelGrad.addColorStop(0.3, "#999");
      barrelGrad.addColorStop(0.5, "#ccc"); barrelGrad.addColorStop(0.7, "#999"); barrelGrad.addColorStop(1, "#555");
      ctx.fillStyle = barrelGrad;
      ctx.beginPath(); ctx.roundRect(84, 12, 72, 122, 10); ctx.fill();
      [40, 65, 90].forEach(ry => {
        ctx.fillStyle = "#444"; ctx.beginPath(); ctx.roundRect(80, ry, 80, 12, 4); ctx.fill();
        ctx.fillStyle = "#888"; ctx.beginPath(); ctx.roundRect(82, ry+2, 76, 7, 3); ctx.fill();
      });

      // Дуло
      ctx.fillStyle = "#222";
      ctx.beginPath(); ctx.roundRect(78, 2, 84, 24, 8); ctx.fill();
      ctx.fillStyle = "rgba(0,200,255,0.5)";
      ctx.beginPath(); ctx.arc(120, 14, 28, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath(); ctx.arc(120, 14, 14, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = "#333";
      ctx.beginPath(); ctx.roundRect(108, 0, 24, 10, 3); ctx.fill();
    });

    // ── ПТИЦА СИНЯЯ ──
    makeTexture(this, "birdBlue", 160, 120, (ctx) => {
      const body = ctx.createRadialGradient(80,65,8,80,65,52);
      body.addColorStop(0,"#82d8ff"); body.addColorStop(0.6,"#2196f3"); body.addColorStop(1,"#0d47a1");
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.ellipse(80,68,52,38,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#0d47a1"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.ellipse(80,68,52,38,0,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#e3f2fd";
      ctx.beginPath(); ctx.ellipse(82,75,28,22,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#0d47a1";
      ctx.beginPath(); ctx.moveTo(55,58); ctx.quadraticCurveTo(45,20,100,35); ctx.quadraticCurveTo(80,52,55,58); ctx.fill();
      ctx.fillStyle="#1976d2";
      ctx.beginPath(); ctx.moveTo(60,56); ctx.quadraticCurveTo(52,28,95,38); ctx.quadraticCurveTo(76,50,60,56); ctx.fill();
      ctx.fillStyle="#42a5f5";
      ctx.beginPath(); ctx.moveTo(65,54); ctx.quadraticCurveTo(60,34,90,40); ctx.quadraticCurveTo(76,50,65,54); ctx.fill();
      ctx.fillStyle="#0d47a1";
      ctx.beginPath(); ctx.moveTo(130,58); ctx.lineTo(158,38); ctx.lineTo(155,62); ctx.lineTo(158,86); ctx.lineTo(130,78); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#1976d2";
      ctx.beginPath(); ctx.moveTo(130,62); ctx.lineTo(152,46); ctx.lineTo(150,65); ctx.lineTo(130,74); ctx.closePath(); ctx.fill();
      const head=ctx.createRadialGradient(32,52,5,32,52,30);
      head.addColorStop(0,"#b3e5fc"); head.addColorStop(1,"#1976d2");
      ctx.fillStyle=head; ctx.beginPath(); ctx.arc(32,55,30,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#0d47a1"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(32,55,30,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#0d47a1";
      ctx.beginPath(); ctx.moveTo(16,28); ctx.quadraticCurveTo(10,8,28,16); ctx.quadraticCurveTo(32,6,40,18); ctx.quadraticCurveTo(36,14,28,24); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#ff8f00";
      ctx.beginPath(); ctx.moveTo(4,52); ctx.lineTo(-6,58); ctx.lineTo(8,62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#e65100"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(1,57); ctx.lineTo(7,55); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(24,48,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(22,48,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(18,44,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(26,52,1.5,0,Math.PI*2); ctx.fill();
    });

    // ── ПТИЦА КРАСНАЯ ──
    makeTexture(this, "birdRed", 160, 120, (ctx) => {
      const body=ctx.createRadialGradient(80,65,8,80,65,52);
      body.addColorStop(0,"#ff8a80"); body.addColorStop(0.6,"#e53935"); body.addColorStop(1,"#7f0000");
      ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(80,68,52,38,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#7f0000"; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(80,68,52,38,0,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#ffcdd2"; ctx.beginPath(); ctx.ellipse(82,75,28,22,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#7f0000";
      ctx.beginPath(); ctx.moveTo(55,58); ctx.quadraticCurveTo(45,20,100,35); ctx.quadraticCurveTo(80,52,55,58); ctx.fill();
      ctx.fillStyle="#c62828";
      ctx.beginPath(); ctx.moveTo(60,56); ctx.quadraticCurveTo(52,28,95,38); ctx.quadraticCurveTo(76,50,60,56); ctx.fill();
      ctx.fillStyle="#ef5350";
      ctx.beginPath(); ctx.moveTo(65,54); ctx.quadraticCurveTo(60,34,90,40); ctx.quadraticCurveTo(76,50,65,54); ctx.fill();
      ctx.fillStyle="#7f0000";
      ctx.beginPath(); ctx.moveTo(130,58); ctx.lineTo(158,38); ctx.lineTo(155,62); ctx.lineTo(158,86); ctx.lineTo(130,78); ctx.closePath(); ctx.fill();
      const head=ctx.createRadialGradient(32,52,5,32,52,30);
      head.addColorStop(0,"#ffcdd2"); head.addColorStop(1,"#c62828");
      ctx.fillStyle=head; ctx.beginPath(); ctx.arc(32,55,30,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#7f0000"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(32,55,30,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#7f0000";
      for(let i=0;i<4;i++){
        ctx.beginPath(); ctx.moveTo(14+i*7,28); ctx.lineTo(11+i*7,10-i*2); ctx.lineTo(20+i*7,24); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle="#ff8f00";
      ctx.beginPath(); ctx.moveTo(4,52); ctx.lineTo(-6,58); ctx.lineTo(8,62); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#e65100"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(1,57); ctx.lineTo(7,55); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(24,48,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(22,48,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(18,44,3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#7f0000"; ctx.lineWidth=4; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(10,36); ctx.lineTo(30,42); ctx.stroke();
    });

    // ── ПТИЦА ЗОЛОТАЯ ──
    makeTexture(this, "birdGold", 180, 140, (ctx) => {
      const aura=ctx.createRadialGradient(88,75,15,88,75,80);
      aura.addColorStop(0,"rgba(255,215,0,0.45)"); aura.addColorStop(0.6,"rgba(255,160,0,0.2)"); aura.addColorStop(1,"rgba(255,160,0,0)");
      ctx.fillStyle=aura; ctx.beginPath(); ctx.arc(88,75,80,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,150,0.9)";
      [[20,30],[150,25],[160,80],[155,120],[20,100],[30,55]].forEach(([sx,sy])=>{
        ctx.save(); ctx.translate(sx,sy);
        ctx.beginPath(); ctx.moveTo(0,-7); ctx.lineTo(1.5,-1.5); ctx.lineTo(7,0); ctx.lineTo(1.5,1.5); ctx.lineTo(0,7); ctx.lineTo(-1.5,1.5); ctx.lineTo(-7,0); ctx.lineTo(-1.5,-1.5); ctx.closePath(); ctx.fill(); ctx.restore();
      });
      const body=ctx.createRadialGradient(88,80,10,88,80,58);
      body.addColorStop(0,"#fff9c4"); body.addColorStop(0.5,"#fdd835"); body.addColorStop(1,"#e65100");
      ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(88,82,58,42,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#f57f17"; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(88,82,58,42,0,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#fff9c4"; ctx.beginPath(); ctx.ellipse(90,90,32,24,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#bf360c";
      ctx.beginPath(); ctx.moveTo(62,72); ctx.quadraticCurveTo(50,28,116,44); ctx.quadraticCurveTo(92,64,62,72); ctx.fill();
      ctx.fillStyle="#e65100";
      ctx.beginPath(); ctx.moveTo(68,70); ctx.quadraticCurveTo(58,36,110,48); ctx.quadraticCurveTo(90,62,68,70); ctx.fill();
      ctx.fillStyle="#ffb300";
      ctx.beginPath(); ctx.moveTo(74,68); ctx.quadraticCurveTo(68,44,104,52); ctx.quadraticCurveTo(90,62,74,68); ctx.fill();
      ctx.fillStyle="#bf360c";
      ctx.beginPath(); ctx.moveTo(144,70); ctx.lineTo(176,48); ctx.lineTo(172,75); ctx.lineTo(176,102); ctx.lineTo(144,94); ctx.closePath(); ctx.fill();
      const head=ctx.createRadialGradient(35,65,6,35,65,34);
      head.addColorStop(0,"#fff9c4"); head.addColorStop(1,"#f9a825");
      ctx.fillStyle=head; ctx.beginPath(); ctx.arc(35,68,34,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#f57f17"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(35,68,34,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#fdd835";
      ctx.beginPath(); ctx.moveTo(8,38); ctx.lineTo(12,14); ctx.lineTo(20,26); ctx.lineTo(30,8); ctx.lineTo(40,26); ctx.lineTo(50,14); ctx.lineTo(58,38); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#f9a825"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(8,38); ctx.lineTo(12,14); ctx.lineTo(20,26); ctx.lineTo(30,8); ctx.lineTo(40,26); ctx.lineTo(50,14); ctx.lineTo(58,38); ctx.closePath(); ctx.stroke();
      [["#ff1744",18,18],["#00e5ff",30,12],["#76ff03",44,18]].forEach(([c,cx,cy])=>{
        ctx.fillStyle=c; ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fill();
        ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(cx-1,cy-1,2,0,Math.PI*2); ctx.fill();
      });
      ctx.fillStyle="#e65100";
      ctx.beginPath(); ctx.moveTo(4,65); ctx.lineTo(-8,72); ctx.lineTo(8,76); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#bf360c"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(1,70); ctx.lineTo(7,68); ctx.stroke();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(26,60,14,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(24,60,8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(20,56,3.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(28,64,2,0,Math.PI*2); ctx.fill();
    });

    // ── ПТИЦА ЧЁРНАЯ ──
    makeTexture(this, "birdBlack", 160, 120, (ctx) => {
      const body=ctx.createRadialGradient(80,65,8,80,65,52);
      body.addColorStop(0,"#78909c"); body.addColorStop(0.5,"#37474f"); body.addColorStop(1,"#102027");
      ctx.fillStyle=body; ctx.beginPath(); ctx.ellipse(80,68,52,38,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#000"; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(80,68,52,38,0,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#546e7a"; ctx.beginPath(); ctx.ellipse(82,75,28,22,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#102027";
      ctx.beginPath(); ctx.moveTo(55,58); ctx.quadraticCurveTo(45,20,100,35); ctx.quadraticCurveTo(80,52,55,58); ctx.fill();
      ctx.fillStyle="#37474f";
      ctx.beginPath(); ctx.moveTo(65,54); ctx.quadraticCurveTo(60,34,90,40); ctx.quadraticCurveTo(76,50,65,54); ctx.fill();
      ctx.fillStyle="#102027";
      ctx.beginPath(); ctx.moveTo(130,58); ctx.lineTo(158,38); ctx.lineTo(155,62); ctx.lineTo(158,86); ctx.lineTo(130,78); ctx.closePath(); ctx.fill();
      const head=ctx.createRadialGradient(32,52,5,32,52,30);
      head.addColorStop(0,"#546e7a"); head.addColorStop(1,"#102027");
      ctx.fillStyle=head; ctx.beginPath(); ctx.arc(32,55,30,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#000"; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(32,55,30,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#666";
      ctx.beginPath(); ctx.moveTo(4,48); ctx.lineTo(-10,54); ctx.lineTo(4,62); ctx.lineTo(8,54); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#444"; ctx.beginPath(); ctx.moveTo(4,55); ctx.lineTo(-10,54); ctx.lineTo(4,56); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(24,48,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#111"; ctx.beginPath(); ctx.arc(22,48,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(18,44,3,0,Math.PI*2); ctx.fill();
    });

    // ── ПУЛЯ ──
    makeTexture(this, "bullet", 24, 36, (ctx) => {
      const g=ctx.createLinearGradient(0,36,0,0);
      g.addColorStop(0,"#00e5ff"); g.addColorStop(0.4,"#ffffff"); g.addColorStop(1,"rgba(0,200,255,0)");
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(12,18,7,16,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(0,200,255,0.3)"; ctx.beginPath(); ctx.ellipse(12,18,12,18,0,0,Math.PI*2); ctx.fill();
    });

    // ── ВСПЫШКА ──
    makeTexture(this, "hit", 120, 120, (ctx) => {
      ctx.save(); ctx.translate(60,60);
      for(let i=0;i<10;i++){
        ctx.save(); ctx.rotate((i*Math.PI*2)/10);
        const rg=ctx.createLinearGradient(0,0,0,-55);
        rg.addColorStop(0,"rgba(255,220,0,0.95)"); rg.addColorStop(0.5,"rgba(255,120,0,0.6)"); rg.addColorStop(1,"rgba(255,80,0,0)");
        ctx.fillStyle=rg;
        ctx.beginPath(); ctx.moveTo(-7,0); ctx.lineTo(7,0); ctx.lineTo(2,-55); ctx.lineTo(-2,-55); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      const core=ctx.createRadialGradient(60,60,4,60,60,36);
      core.addColorStop(0,"rgba(255,255,255,1)"); core.addColorStop(0.25,"rgba(255,240,0,0.95)");
      core.addColorStop(0.6,"rgba(255,100,0,0.7)"); core.addColorStop(1,"rgba(255,0,0,0)");
      ctx.fillStyle=core; ctx.beginPath(); ctx.arc(60,60,36,0,Math.PI*2); ctx.fill();
    });

    // ── ПЕРО ──
    makeTexture(this, "feather", 20, 50, (ctx) => {
      ctx.strokeStyle="rgba(255,255,255,0.8)"; ctx.lineWidth=2; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(10,48); ctx.quadraticCurveTo(10,24,10,2); ctx.stroke();
      for(let y=8;y<45;y+=7){
        ctx.beginPath(); ctx.moveTo(10,y); ctx.quadraticCurveTo(18,y+4,14,y+10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10,y); ctx.quadraticCurveTo(2,y+4,6,y+10); ctx.stroke();
      }
    });

    this.scene.start("MenuScene");
  }
}

// ══════════════════════════════════════════════
//  МЕНЮ
// ══════════════════════════════════════════════
class MenuScene extends Phaser.Scene {
  constructor() { super("MenuScene"); }
  create() {
    const { width: W, height: H } = this.scale;
    this.add.image(W/2, H/2, "bg").setDisplaySize(W, H);

    this.add.rectangle(W/2, H*0.18, 590, 132, 0x5d4037).setStrokeStyle(7, 0x3e2723);
    this.add.rectangle(W/2, H*0.18, 582, 124, 0x6d4c41);
    this.add.text(W/2, H*0.13, "BIRD", { fontSize:"102px", color:"#FFD700", stroke:"#7f4000", strokeThickness:14, fontStyle:"bold" }).setOrigin(0.5);
    this.add.text(W/2, H*0.22, "BLASTER", { fontSize:"74px", color:"#00e5ff", stroke:"#003366", strokeThickness:10, fontStyle:"bold" }).setOrigin(0.5);

    const birds = [
      { key:"birdBlue",  pts:"100", x:W*0.18, label:"Обычная" },
      { key:"birdRed",   pts:"150", x:W*0.50, label:"Быстрая" },
      { key:"birdGold",  pts:"300", x:W*0.82, label:"Бонусная" },
    ];
    birds.forEach(({ key, pts, x, label }) => {
      const img = this.add.image(x, H*0.48, key).setScale(1.1);
      this.tweens.add({ targets:img, y:H*0.48-14, duration:900+Math.random()*400, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      this.add.text(x, H*0.57, `+${pts}`, { fontSize:"38px", color:"#FFD700", stroke:"#000", strokeThickness:5 }).setOrigin(0.5);
      this.add.text(x, H*0.62, label,    { fontSize:"26px", color:"#fff",    stroke:"#000", strokeThickness:4 }).setOrigin(0.5);
    });

    const gun = this.add.image(W/2, H*0.80, "gun").setScale(0.85);
    this.tweens.add({ targets:gun, y:H*0.80-8, duration:1200, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
    this.add.text(W/2, H*0.73, "ТАП = ВЫСТРЕЛ", { fontSize:"38px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);

    const btn = this.add.rectangle(W/2, H*0.91, 380, 90, 0xff6f00).setStrokeStyle(5, 0xFFD700);
    this.add.text(W/2, H*0.91, "ИГРАТЬ!", { fontSize:"52px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.04, scaleY:1.04, duration:700, yoyo:true, repeat:-1 });
    this.input.on("pointerdown", () => this.scene.start("GameScene"));
  }
}

// ══════════════════════════════════════════════
//  ИГРА
// ══════════════════════════════════════════════
class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  init() {
    this.score       = 0;
    this.lives       = 3;
    this.timeLeft    = 60;
    this.isGameOver  = false;
    this.missStreak  = 0;   // промахов подряд (3 = -жизнь)
    this.holdStart   = 0;   // время зажатия (мс)
    this.isHolding   = false;
    this.chargeX     = 0;
    this.chargeY     = 0;
  }

  create() {
    const { width: W, height: H } = this.scale;
    this.add.image(W/2, H/2, "bg").setDisplaySize(W, H);

    this.birds   = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // Пушка
    this.gun = this.add.image(W/2, H - 60, "gun");
    this.gun.setOrigin(0.5, 0.90).setScale(1.05);

    // Индикатор заряда (шкала под пушкой)
    this.chargeBarBg = this.add.rectangle(W/2, H - 18, 320, 18, 0x333333, 0.7).setDepth(10);
    this.chargeBar   = this.add.rectangle(W/2 - 160, H - 18, 0, 14, 0x00e5ff, 1).setOrigin(0, 0.5).setDepth(11);
    this.chargeLabel = this.add.text(W/2, H - 18, "", { fontSize:"20px", color:"#fff", stroke:"#000", strokeThickness:3 }).setOrigin(0.5).setDepth(12);

    // Иконка промахов (3 черепа = потеря жизни)
    this.missIcons = [];
    for(let i = 0; i < 3; i++) {
      const ic = this.add.text(W/2 - 42 + i*42, H - 48, "✕", {
        fontSize:"28px", color:"#888", stroke:"#000", strokeThickness:3
      }).setDepth(10);
      this.missIcons.push(ic);
    }

    // HUD
    this.add.rectangle(W/2, 60, W, 120, 0x5d4037, 0.88);
    this.add.rectangle(W/2, 60, W-4, 116, 0x6d4c41, 0.5);
    this.timeText  = this.add.text(24, 20, "⏱ 60", { fontSize:"44px", color:"#FFD700", stroke:"#000", strokeThickness:6 });
    this.scoreText = this.add.text(W/2, 20, "SCORE: 0", { fontSize:"44px", color:"#fff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5, 0);
    this.livesText = this.add.text(W-20, 20, "❤❤❤", { fontSize:"38px", color:"#ff4d4d", stroke:"#000", strokeThickness:5 }).setOrigin(1, 0);

    this.physics.add.overlap(this.bullets, this.birds, this.handleBulletHitBird, null, this);

    // ── ЗАЖАТИЕ: pointerdown начинает заряд, pointerup — стреляет ──
    this.input.on("pointerdown", (p) => {
      if(this.isGameOver) return;
      this.isHolding = true;
      this.holdStart = this.time.now;
      this.chargeX   = p.x;
      this.chargeY   = p.y;
      // Поворот пушки сразу при зажатии
      const angle = Phaser.Math.Angle.Between(this.gun.x, this.gun.y - 70, p.x, p.y);
      this.gun.setRotation(angle + Math.PI/2);
    });

    this.input.on("pointermove", (p) => {
      if(!this.isHolding || this.isGameOver) return;
      this.chargeX = p.x;
      this.chargeY = p.y;
      const angle = Phaser.Math.Angle.Between(this.gun.x, this.gun.y - 70, p.x, p.y);
      this.gun.setRotation(angle + Math.PI/2);
    });

    this.input.on("pointerup", (p) => {
      if(!this.isHolding || this.isGameOver) return;
      this.isHolding = false;
      const held = this.time.now - this.holdStart; // мс
      this.shoot(this.chargeX, this.chargeY, held);
      this.chargeBar.width = 0;
      this.chargeLabel.setText("");
    });

    this.spawnEvent = this.time.addEvent({ delay:1100, callback:this.spawnBird, callbackScope:this, loop:true });
    this.timerEvent = this.time.addEvent({ delay:1000, callback:this.updateGameTimer, callbackScope:this, loop:true });
  }

  update() {
    if(this.isGameOver) return;
    const { width:W, height:H } = this.scale;

    // Анимация шкалы заряда
    if(this.isHolding) {
      const held = this.time.now - this.holdStart;
      const t    = Math.min(held / 1500, 1); // макс заряд за 1.5 сек
      const barW = Math.round(t * 320);
      this.chargeBar.width = barW;
      // Цвет: синий → жёлтый → красный
      const color = t < 0.5
        ? Phaser.Display.Color.Interpolate.ColorWithColor({r:0,g:229,b:255}, {r:255,g:220,b:0}, 100, Math.round(t*200))
        : Phaser.Display.Color.Interpolate.ColorWithColor({r:255,g:220,b:0}, {r:255,g:60,b:0},  100, Math.round((t-0.5)*200));
      this.chargeBar.setFillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
      const speed = Math.round(600 + t * 1400);
      this.chargeLabel.setText(t < 0.05 ? "" : `${speed} px/s`);
    }

    // Удаляем улетевшие пули
    this.bullets.children.each((b) => {
      if(!b.active) return;
      if(b.x<-80||b.x>W+80||b.y<-80||b.y>H+80) {
        b.destroy();
        // Промах — пуля улетела не попав
        this.registerMiss();
      }
    });

    // Птицы улетели — снимаем жизнь
    this.birds.children.each((bird) => {
      if(!bird.active) return;
      if(bird.x<-180||bird.x>W+180||bird.y<-180||bird.y>H+180){
        bird.destroy();
        this.loseLife("bird_escaped");
      }
    });
  }

  // ── ВЫСТРЕЛ: held — время зажатия в мс ──
  shoot(tx, ty, held) {
    const gx = this.gun.x, gy = this.gun.y - 70;
    const t  = Math.min(held / 1500, 1);
    // Скорость: 600 (тап) → 2000 (макс заряд)
    const speed = 600 + t * 1400;

    const bullet = this.bullets.create(gx, gy, "bullet");
    // Размер пули зависит от заряда
    bullet.setScale(0.8 + t * 0.8);
    bullet.isCharged = t > 0.5; // помечаем заряженную пулю
    this.physics.moveTo(bullet, tx, ty, speed);

    // Цвет следа: обычный = голубой, заряженный = огненный
    const trailColor = t < 0.5 ? 0x00e5ff : (t < 0.8 ? 0xffcc00 : 0xff4400);
    this.time.addEvent({ delay:16, repeat:6, callback:() => {
      if(!bullet.active) return;
      const r = Math.round((0.6 + t * 0.6) * 6);
      const trail = this.add.circle(bullet.x, bullet.y, r, trailColor, 0.6);
      this.tweens.add({ targets:trail, alpha:0, scaleX:0, scaleY:0, duration:160, onComplete:()=>trail.destroy() });
    }});

    // Отдача пушки — сильнее при заряде
    const kick = 0.94 - t * 0.08;
    this.tweens.add({ targets:this.gun, scaleX:kick, scaleY:kick, duration:55, yoyo:true });
  }

  // ── ПРОМАХ — пуля улетела за экран ──
  registerMiss() {
    if(this.isGameOver) return;
    this.missStreak++;
    // Подсвечиваем иконки промахов
    for(let i = 0; i < 3; i++) {
      this.missIcons[i].setColor(i < this.missStreak ? "#ff4444" : "#888");
    }
    if(this.missStreak >= 3) {
      this.missStreak = 0;
      for(let i = 0; i < 3; i++) this.missIcons[i].setColor("#888");
      this.loseLife("miss");
    }
  }

  spawnBird() {
    if(this.isGameOver) return;
    const { width:W, height:H } = this.scale;
    const side = Phaser.Math.Between(0,1);
    const roll = Phaser.Math.Between(1,100);
    let texture="birdBlue", points=100, speed=Phaser.Math.Between(110,160), scale=1.0, isDanger=false;
    if(roll>60&&roll<=78)  { texture="birdRed";   points=150; speed=Phaser.Math.Between(180,250); scale=0.95; }
    else if(roll>78&&roll<=90) { texture="birdBlack"; points=0;   speed=Phaser.Math.Between(200,280); scale=0.9; isDanger=true; }
    else if(roll>90)           { texture="birdGold";  points=300; speed=Phaser.Math.Between(130,190); scale=1.05; }

    const spawnY  = Phaser.Math.Between(140, Math.floor(H*0.60));
    const startX  = side===0 ? -160 : W+160;
    const targetX = side===0 ? W+200 : -200;
    const targetY = spawnY + Phaser.Math.Between(-80,80);

    const bird = this.birds.create(startX, spawnY, texture);
    bird.setScale(scale);
    bird.points   = points;
    bird.isDanger = isDanger;
    if(side===1) bird.setFlipX(true);
    this.physics.moveTo(bird, targetX, targetY, speed);
    this.tweens.add({ targets:bird, y:bird.y+Phaser.Math.Between(-30,30), duration:Phaser.Math.Between(450,850), yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
  }

  handleBulletHitBird(bullet, bird) {
    if(!bullet.active||!bird.active) return;
    const pts      = bird.points;
    const isDanger = bird.isDanger;
    const bx = bird.x, by = bird.y;

    bullet.destroy();
    bird.destroy();

    // Попал в чёрную птицу — минус жизнь!
    if(isDanger) {
      const skull = this.add.text(bx, by-20, "☠ -ЖИЗНЬ!", {
        fontSize:"52px", color:"#ff0000", stroke:"#000", strokeThickness:7, fontStyle:"bold"
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets:skull, y:skull.y-90, alpha:0, duration:900, ease:"Quad.easeOut", onComplete:()=>skull.destroy() });

      // Красная вспышка побольше
      const hit = this.add.image(bx, by, "hit").setScale(1.0).setTint(0xff0000);
      this.tweens.add({ targets:hit, alpha:0, scale:1.8, duration:400, onComplete:()=>hit.destroy() });

      this.loseLife("black_bird");
      return;
    }

    // Обычное попадание
    // Сбрасываем счётчик промахов при попадании
    this.missStreak = 0;
    for(let i=0;i<3;i++) this.missIcons[i].setColor("#888");

    const hit = this.add.image(bx, by, "hit").setScale(0.7);
    this.tweens.add({ targets:hit, alpha:0, scale:1.3, duration:350, onComplete:()=>hit.destroy() });

    for(let i=0;i<5;i++){
      const f = this.add.image(bx, by, "feather")
        .setScale(0.7+Math.random()*0.4).setRotation(Math.random()*Math.PI*2).setAlpha(0.9);
      this.tweens.add({ targets:f, x:bx+Phaser.Math.Between(-80,80), y:by+Phaser.Math.Between(-60,80),
        angle:Phaser.Math.Between(-180,180), alpha:0, duration:700+Math.random()*300, ease:"Quad.easeOut", onComplete:()=>f.destroy() });
    }

    const color = pts>=300?"#FFD700":"#7CFF00";
    const popup = this.add.text(bx, by-30, `+${pts}`, {
      fontSize:"60px", color, stroke:"#000", strokeThickness:7, fontStyle:"bold"
    }).setOrigin(0.5);
    this.tweens.add({ targets:popup, y:popup.y-80, alpha:0, duration:700, ease:"Quad.easeOut", onComplete:()=>popup.destroy() });

    this.score += pts;
    this.scoreText.setText(`SCORE: ${this.score}`);
  }

  updateGameTimer() {
    if(this.isGameOver) return;
    this.timeLeft--;
    this.timeText.setText(`⏱ ${this.timeLeft}`);
    if(this.timeLeft<=10) this.tweens.add({ targets:this.timeText, alpha:0.2, duration:200, yoyo:true });
    if(this.timeLeft===40) this.setSpawnDelay(900);
    if(this.timeLeft===20) this.setSpawnDelay(650);
    if(this.timeLeft<=0)  this.endGame();
  }

  setSpawnDelay(delay) {
    if(this.spawnEvent) this.spawnEvent.remove(false);
    this.spawnEvent = this.time.addEvent({ delay, callback:this.spawnBird, callbackScope:this, loop:true });
  }

  loseLife(reason) {
    if(this.isGameOver) return;
    this.lives--;
    const hearts = ["","❤","❤❤","❤❤❤"];
    this.livesText.setText(hearts[Math.max(0, this.lives)]);

    const flash = this.add.rectangle(this.scale.width/2, this.scale.height/2, this.scale.width, this.scale.height, 0xff0000, 0.4);
    this.tweens.add({ targets:flash, alpha:0, duration:300, onComplete:()=>flash.destroy() });

    if(this.lives <= 0) this.endGame();
  }

  endGame() {
    if(this.isGameOver) return;
    this.isGameOver = true;
    if(this.spawnEvent) this.spawnEvent.remove(false);
    if(this.timerEvent) this.timerEvent.remove(false);

    const { width:W, height:H } = this.scale;
    this.add.rectangle(W/2,H/2,W,H,0x000000,0.65);
    this.add.text(W/2,H/2-130,"GAME OVER",{ fontSize:"82px", color:"#ff4d4d", stroke:"#000", strokeThickness:12, fontStyle:"bold" }).setOrigin(0.5);
    this.add.text(W/2,H/2-30,`SCORE: ${this.score}`,{ fontSize:"62px", color:"#FFD700", stroke:"#000", strokeThickness:8 }).setOrigin(0.5);
    let rank="🐦 Новичок";
    if(this.score>=5000) rank="👑 Легенда";
    else if(this.score>=2500) rank="🏆 Мастер";
    else if(this.score>=1000) rank="🎯 Снайпер";
    this.add.text(W/2,H/2+60,rank,{ fontSize:"42px", color:"#00e5ff", stroke:"#000", strokeThickness:6 }).setOrigin(0.5);
    const btn=this.add.rectangle(W/2,H/2+165,400,90,0xff6f00).setStrokeStyle(5,0xFFD700);
    this.add.text(W/2,H/2+165,"ЕЩЁ РАЗ!",{ fontSize:"48px", color:"#fff", stroke:"#000", strokeThickness:7, fontStyle:"bold" }).setOrigin(0.5);
    this.tweens.add({ targets:btn, scaleX:1.05, scaleY:1.05, duration:600, yoyo:true, repeat:-1 });
    this.input.once("pointerdown", ()=>this.scene.restart());
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 720, height: 1280,
  backgroundColor: "#6dcff6",
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: "arcade", arcade: { debug: false } },
  scene: [BootScene, MenuScene, GameScene]
};
new Phaser.Game(config);
