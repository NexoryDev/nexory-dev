import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { ArrowRight, Mouse, MessageSquare, Code2, Smartphone, Users } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Home.css";

const BG = "#040d1e";
const fadeEase = [0.16, 1, 0.3, 1];

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function createNTexture() {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 512;
  const c = cv.getContext("2d");
  c.fillStyle = "#050e28";
  c.fillRect(0, 0, 512, 512);
  const bg = c.createRadialGradient(256, 256, 20, 256, 256, 240);
  bg.addColorStop(0, "rgba(80, 60, 220, 0.28)");
  bg.addColorStop(1, "rgba(5, 14, 40, 0)");
  c.fillStyle = bg;
  c.fillRect(0, 0, 512, 512);
  const g = c.createLinearGradient(108, 88, 408, 428);
  g.addColorStop(0, "#60c8ff");
  g.addColorStop(0.38, "#c084fc");
  g.addColorStop(0.72, "#8060ff");
  g.addColorStop(1, "#f0eeff");
  c.shadowBlur = 56;
  c.shadowColor = "#8060ff";
  c.strokeStyle = g;
  c.lineWidth = 68;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(138, 380); c.lineTo(138, 128);
  c.lineTo(374, 380); c.lineTo(374, 128);
  c.stroke();
  c.shadowBlur = 70;
  c.shadowColor = "rgba(200,200,255,0.4)";
  c.strokeStyle = "rgba(255,255,255,0.22)";
  c.lineWidth = 8;
  c.beginPath();
  c.moveTo(158, 148); c.lineTo(354, 360);
  c.stroke();
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 8;
  return t;
}

function drawFace(label, iconFn, color) {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 512;
  const c = cv.getContext("2d");
  c.fillStyle = "#050e28"; c.fillRect(0, 0, 512, 512);
  const bg = c.createRadialGradient(256, 196, 16, 256, 196, 210);
  bg.addColorStop(0, color + "2a"); bg.addColorStop(1, "rgba(5,14,40,0)");
  c.fillStyle = bg; c.fillRect(0, 0, 512, 512);
  const SZ = 152, CY = 200;
  c.save();
  c.translate(256 - SZ / 2, CY - SZ / 2);
  c.scale(SZ / 24, SZ / 24);
  c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 1.7;
  c.lineCap = "round"; c.lineJoin = "round";
  c.shadowBlur = 6; c.shadowColor = color;
  iconFn(c);
  c.restore();
  c.shadowBlur = 0; c.strokeStyle = color + "3e"; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(144, 325); c.lineTo(368, 325); c.stroke();
  c.fillStyle = "rgba(255,255,255,0.9)";
  c.font = "bold 50px 'Outfit','Inter',sans-serif";
  c.textAlign = "center"; c.shadowBlur = 24; c.shadowColor = color;
  c.fillText(label, 256, 392);
  const t = new THREE.CanvasTexture(cv);
  t.anisotropy = 8;
  return t;
}

const ICONS = {
  discord: (c) => {
    c.beginPath();
    c.moveTo(5.5, 10.0);
    c.bezierCurveTo(4.8, 7.0, 6.8, 4.5, 9.2, 4.5);
    c.lineTo(14.8, 4.5);
    c.bezierCurveTo(17.2, 4.5, 19.2, 7.0, 18.5, 10.0);
    c.lineTo(18.2, 15.5);
    c.bezierCurveTo(17.8, 18.2, 16.0, 19.5, 14.2, 19.5);
    c.lineTo(13.0, 21.2); c.lineTo(12.0, 19.5); c.lineTo(9.8, 19.5);
    c.bezierCurveTo(8.0, 19.5, 6.2, 18.2, 5.8, 15.5);
    c.closePath(); c.stroke();
    c.beginPath(); c.arc(9.2, 12.5, 1.9, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(14.8, 12.5, 1.9, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(9.5, 16.2); c.quadraticCurveTo(12, 18.0, 14.5, 16.2); c.stroke();
  },
  web: (c) => {
    c.lineWidth = 2.1;
    c.beginPath(); c.moveTo(8, 6.5); c.lineTo(2.5, 12); c.lineTo(8, 17.5); c.stroke();
    c.beginPath(); c.moveTo(14.5, 4.5); c.lineTo(9.5, 19.5); c.stroke();
    c.beginPath(); c.moveTo(16, 6.5); c.lineTo(21.5, 12); c.lineTo(16, 17.5); c.stroke();
  },
  app: (c) => {
    rrect(c, 6.5, 1.5, 11, 21, 2.2); c.stroke();
    c.beginPath(); c.moveTo(10, 20); c.lineTo(14, 20); c.stroke();
    c.beginPath(); c.arc(12, 4.2, 1.0, 0, Math.PI * 2); c.fill();
  },
  individual: (c) => {
    c.beginPath(); c.arc(12, 7.5, 3.8, 0, Math.PI * 2); c.stroke();
    c.beginPath();
    c.moveTo(3.5, 22);
    c.bezierCurveTo(3.5, 16.5, 7.2, 13.5, 12, 13.5);
    c.bezierCurveTo(16.8, 13.5, 20.5, 16.5, 20.5, 22);
    c.stroke();
  },
};

function buildMaterials(tex) {
  function fm(t) {
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 1 });
  }
  return [
    fm(tex.web),        
    fm(tex.individual), 
    fm(tex.n),          
    fm(tex.n),          
    fm(tex.discord),    
    fm(tex.app),        
  ];
}

const FACE_ROT_Y = [0, 0, -Math.PI / 2, Math.PI, Math.PI / 2, 0];
const FACE_ROT_X = [-0.28, -0.12, -0.12, -0.12, -0.12, -0.30];

const CAM_POS = [
  new THREE.Vector3(0.6, 0.45, 7.8),   
  new THREE.Vector3(0.6, 0.28, 6.8),   
  new THREE.Vector3(0.6, 0.28, 6.8),   
  new THREE.Vector3(0.6, 0.28, 6.8),   
  new THREE.Vector3(0.6, 0.28, 6.8),   
  new THREE.Vector3(1.0, 0.45, 7.8),   
];

const CAM_LOOK = [
  new THREE.Vector3(1.2, 0.0, 0),   
  new THREE.Vector3(1.8, 0.0, 0),   
  new THREE.Vector3(0.4, 0.0, 0),   
  new THREE.Vector3(1.8, 0.0, 0),   
  new THREE.Vector3(0.4, 0.0, 0),   
  new THREE.Vector3(1.0, 0.0, 0),   
];

const CUBE_POS = [
  new THREE.Vector3(3.2, 0, 0),   
  new THREE.Vector3(3.2, 0, 0),   
  new THREE.Vector3(-1.5, 0, 0),  
  new THREE.Vector3(3.2, 0, 0),   
  new THREE.Vector3(-1.5, 0, 0),  
  new THREE.Vector3(1.0, 0, 0),   
];

const CAM_POS_M = [
  new THREE.Vector3(0.3, 0.3, 7.2),
  new THREE.Vector3(0.3, 0.3, 7.0),
  new THREE.Vector3(0.3, 0.3, 7.0),
  new THREE.Vector3(0.3, 0.3, 7.0),
  new THREE.Vector3(0.3, 0.3, 7.0),
  new THREE.Vector3(0.3, 0.3, 7.4),
];
const CUBE_POS_M = Array(6).fill(new THREE.Vector3(0.3, 0, 0));
const CAM_LOOK_M = Array(6).fill(new THREE.Vector3(0.3, 0, 0));

function easeInOut(t) { return t * t * (3 - 2 * t); }

function lerpSections(arr, p) {
  const seg = Math.min(Math.floor(p * (arr.length - 1)), arr.length - 2);
  const loc = p * (arr.length - 1) - seg;
  return arr[seg].clone().lerp(arr[seg + 1], easeInOut(loc));
}
function lerpNum(arr, p) {
  const seg = Math.min(Math.floor(p * (arr.length - 1)), arr.length - 2);
  const loc = p * (arr.length - 1) - seg;
  return arr[seg] + (arr[seg + 1] - arr[seg]) * easeInOut(loc);
}

function Particles({ count, progressRef }) {
  const ref = useRef();
  const pos = useMemo(() => {
    const d = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      d[i * 3]     = (Math.random() - 0.5) * 22;
      d[i * 3 + 1] = (Math.random() - 0.5) * 12;
      d[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    return d;
  }, [count]);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    ref.current.rotation.y = t * 0.005 + progressRef.current * 0.1;
    ref.current.position.y = Math.sin(t * 0.08) * 0.05;
  });
  return (
    <Points ref={ref} positions={pos} stride={3} frustumCulled={false}>
      <PointMaterial transparent depthWrite={false} color="#8090d8" opacity={0.14} size={0.014} sizeAttenuation />
    </Points>
  );
}

function AccentCubes({ mobile }) {
  const grp = useRef();
  const cubes = useMemo(() => {
    const n = mobile ? 3 : 5;
    return Array.from({ length: n }).map((_, i) => ({
      pos: [(Math.random() - 0.5) * 12 + (i % 2 ? 2.5 : -2.5), (Math.random() - 0.5) * 6, -4 - Math.random() * 5],
      sc: 0.04 + Math.random() * 0.07,
      ph: Math.random() * Math.PI * 2,
    }));
  }, [mobile]);
  useFrame((s) => {
    if (!grp.current) return;
    const t = s.clock.elapsedTime;
    grp.current.children.forEach((ch, i) => {
      ch.position.y = cubes[i].pos[1] + Math.sin(t * 0.3 + cubes[i].ph) * 0.12;
      ch.rotation.x = t * 0.035 + cubes[i].ph;
      ch.rotation.y = t * 0.048 + cubes[i].ph;
    });
  });
  return (
    <group ref={grp}>
      {cubes.map((cu, i) => (
        <mesh key={i} position={cu.pos} scale={cu.sc}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={i % 2 ? "#0a1a40" : "#0c1a38"} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
            <lineBasicMaterial color={i % 3 === 0 ? "#3060e0" : i % 3 === 1 ? "#6040e0" : "#30a0e0"} transparent opacity={0.45} />
          </lineSegments>
        </mesh>
      ))}
    </group>
  );
}

function Grid() {
  const mat = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1024; cv.height = 1024;
    const c = cv.getContext("2d");
    c.clearRect(0, 0, 1024, 1024);
    const N = 16, step = 1024 / N;
    for (let i = 0; i <= N; i++) {
      const a = 0.38 - (i / N) * 0.06;
      c.strokeStyle = `rgba(16,42,100,${a})`; c.lineWidth = 1;
      c.beginPath(); c.moveTo(i * step, 0); c.lineTo(i * step, 1024); c.stroke();
      c.beginPath(); c.moveTo(0, i * step); c.lineTo(1024, i * step); c.stroke();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2.5, 2.5);
    return new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.3, depthWrite: false });
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, -2.4, -3]} material={mat}>
      <planeGeometry args={[36, 28]} />
    </mesh>
  );
}

function NDissolveOverlay({ visible }) {
  const cvRef = useRef();
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const DURATION = 1800;

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    if (!visible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      const ctx = cv.getContext("2d");
      ctx.clearRect(0, 0, cv.width, cv.height);
      return;
    }
    function resize() {
      cv.width = cv.offsetWidth * (window.devicePixelRatio || 1);
      cv.height = cv.offsetHeight * (window.devicePixelRatio || 1);
    }
    resize();
    function render(ts) {
      if (!startRef.current) startRef.current = ts;
      const raw = Math.min((ts - startRef.current) / DURATION, 1);
      const alpha = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const ctx = cv.getContext("2d");
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const s = Math.min(W, H) * 0.28;
      const halo = ctx.createRadialGradient(cx, cy, s * 0.1, cx, cy, s * 1.1);
      halo.addColorStop(0, `rgba(96, 80, 255, ${0.12 * alpha})`);
      halo.addColorStop(0.5, `rgba(80, 40, 200, ${0.05 * alpha})`);
      halo.addColorStop(1, `rgba(4, 13, 30, 0)`);
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, W, H);
      const lw = s * 0.11;
      const x0 = cx - s * 0.28, x1 = cx + s * 0.28;
      const y0 = cy - s * 0.42, y1 = cy + s * 0.42;
      const maxAlpha = 0.35 * alpha;
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0,    `rgba(96, 200, 255, ${maxAlpha})`);
      grad.addColorStop(0.38, `rgba(192, 132, 252, ${maxAlpha})`);
      grad.addColorStop(0.72, `rgba(128, 96, 255, ${maxAlpha})`);
      grad.addColorStop(1,    `rgba(240, 238, 255, ${maxAlpha})`);
      ctx.shadowBlur = 24 * alpha;
      ctx.shadowColor = `rgba(128, 96, 255, ${maxAlpha})`;
      ctx.strokeStyle = grad;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y1); ctx.lineTo(x0, y0);
      ctx.lineTo(x1, y1); ctx.lineTo(x1, y0);
      ctx.stroke();
      ctx.shadowBlur = 10 * alpha;
      ctx.shadowColor = `rgba(220, 210, 255, ${maxAlpha * 0.5})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * alpha})`;
      ctx.lineWidth = lw * 0.11;
      ctx.beginPath();
      ctx.moveTo(x0 + lw * 0.55, y0 + lw * 0.85);
      ctx.lineTo(x1 - lw * 0.55, y1 - lw * 0.85);
      ctx.stroke();
      if (raw < 1) rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [visible]);

  return (
    <canvas
      ref={cvRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    />
  );
}

function Scene({ progressRef, pointerRef, reducedMotion, mobile }) {
  const cubeRef = useRef();
  const platRef = useRef();
  const edgeRef = useRef();
  const lookAt      = useRef(new THREE.Vector3(1.2, 0, 0));
  const cubeTarget  = useRef(new THREE.Vector3(3.2, 0, 0));

  const heroRotY      = useRef(0);
  const wasHero       = useRef(true);

  const materials = useMemo(() => {
    const tex = {
      n:          createNTexture(),
      discord:    drawFace("Discord Bot", ICONS.discord,    "#5865f2"),
      web:        drawFace("Web Dev",     ICONS.web,        "#0ea5e9"),
      app:        drawFace("Mobile App",  ICONS.app,        "#ec4899"),
      individual: drawFace("Individual",  ICONS.individual, "#a855f7"),
    };
    return buildMaterials(tex);
  }, []);

  const edgesGeom = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, 2.2, 2.2)), []);
  const pCount    = mobile ? 26 : 65;
  const cpArr     = mobile ? CAM_POS_M  : CAM_POS;
  const clArr     = mobile ? CAM_LOOK_M : CAM_LOOK;
  const cubeArr   = mobile ? CUBE_POS_M : CUBE_POS;

  useFrame((s) => {
    const time = s.clock.elapsedTime;
    const p  = progressRef.current;
    const px = reducedMotion ? 0 : pointerRef.current.x;
    const py = reducedMotion ? 0 : pointerRef.current.y;

    const cp = lerpSections(cpArr, p);
    cp.x += px * (mobile ? 0.02 : 0.06);
    cp.y += py * (mobile ? 0.012 : 0.032);
    s.camera.position.lerp(cp, 0.025);

    const cl = lerpSections(clArr, p);
    lookAt.current.lerp(cl, 0.034);
    s.camera.lookAt(lookAt.current);

    const ct = lerpSections(cubeArr, p);
    cubeTarget.current.lerp(ct, 0.038);

    let cubeFade = 1;
    if (p > 0.8) {
      const t = Math.max(0, Math.min(1, (p - 0.8) / 0.18));
      cubeFade = 1 - (t * t * (3 - 2 * t)); 
    }

    if (!cubeRef.current) return;
    cubeRef.current.position.lerp(cubeTarget.current, 0.05);
    cubeRef.current.position.y += Math.sin(time * 0.42) * 0.0014;
    cubeRef.current.scale.setScalar(cubeFade);

    materials.forEach((mat) => {
      mat.opacity = cubeFade;
    });
    if (edgeRef.current) {
      edgeRef.current.material.opacity = 0.82 * cubeFade;
    }

    const isHero = p < 0.05;

    if (isHero) {
      if (!reducedMotion) heroRotY.current += 0.004;
      cubeRef.current.rotation.y = heroRotY.current;
      cubeRef.current.rotation.x = THREE.MathUtils.lerp(
        cubeRef.current.rotation.x, FACE_ROT_X[0] + py * 0.013, 0.022
      );
      wasHero.current = true;
    } else {
      wasHero.current = false;
      const targetRY = lerpNum(FACE_ROT_Y, p);
      const targetRX = lerpNum(FACE_ROT_X, p) + py * 0.013;
      let cur  = cubeRef.current.rotation.y;
      let diff = ((targetRY - cur) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
      
      cubeRef.current.rotation.y = THREE.MathUtils.lerp(cur, cur + diff + px * 0.022, 0.022);
      cubeRef.current.rotation.x = THREE.MathUtils.lerp(cubeRef.current.rotation.x, targetRX, 0.022);
      heroRotY.current = cubeRef.current.rotation.y;
    }

    cubeRef.current.rotation.z = THREE.MathUtils.lerp(
      cubeRef.current.rotation.z,
      Math.sin(time * 0.11 + p * 2.8) * 0.009,
      0.022
    );

    if (platRef.current) {
      platRef.current.position.x = THREE.MathUtils.lerp(
        platRef.current.position.x, cubeTarget.current.x, 0.038
      );
      platRef.current.rotation.z = time * 0.02 + p * 0.3;
      platRef.current.scale.setScalar(mobile ? 0.54 : 1.0);
    }
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 6, 24]} />
      <ambientLight intensity={0.55} color="#5060a0" />
      <pointLight position={[-3.5, 3.5, 5]} intensity={mobile ? 8 : 18} color="#7060ff" />
      <pointLight position={[3, -1.5, 5]} intensity={mobile ? 7 : 14} color="#2888ff" />
      <pointLight position={[-1.5, -3, 4]} intensity={mobile ? 2 : 5} color="#5030c0" />
      <pointLight position={[-2.5, 7, 0]} intensity={mobile ? 0 : 28} color="#1835b0" />

      <group ref={cubeRef}>
        <mesh material={materials}>
          <boxGeometry args={[2.2, 2.2, 2.2, 1, 1, 1]} />
        </mesh>
        <lineSegments ref={edgeRef} geometry={edgesGeom}>
          <lineBasicMaterial color="#7878ff" transparent opacity={0.82} />
        </lineSegments>
      </group>

      <Grid />
      <AccentCubes mobile={mobile} />
      <Particles count={pCount} progressRef={progressRef} />

      {!mobile && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.12} luminanceSmoothing={0.88} intensity={0.75} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

function HomeCanvas({ progressRef, pointerRef, webglSupported, ctaVisible }) {
  const reducedMotion = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const u = () => setMobile(window.innerWidth < 768);
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);

  if (!webglSupported) {
    return (
      <div className="home-static-visual" aria-hidden="true">
        <div className="home-static-cube">N</div>
      </div>
    );
  }

  return (
    <div className="home-canvas-shell" aria-hidden="true">
      <Canvas
        camera={{ position: [0.6, 0.45, mobile ? 7.2 : 7.8], fov: mobile ? 50 : 40 }}
        dpr={[1, mobile ? 1.2 : 1.7]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene
            progressRef={progressRef}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
            mobile={mobile}
          />
        </Suspense>
      </Canvas>
      <NDissolveOverlay visible={ctaVisible} />
    </div>
  );
}

function TechList({ items }) {
  return (
    <div className="journey-tags">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function ServiceSection({ id, icon, align = "left", title, desc, children, learnMore }) {
  return (
    <section id={id} className={`journey-section service-journey-section service--${align}`}>
      <div className="service-grid">
        <motion.div
          className="service-text"
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.22, once: false }}
          transition={{ duration: 0.92, ease: fadeEase }}
        >
          {icon && <div className="svc-icon">{icon}</div>}
          <h2>{title}</h2>
          <p>{desc}</p>
          {children}
          <Link className="journey-link" to="/contact">
            {learnMore}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
        {}
        <div aria-hidden="true" />
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const progressRef = useRef(0);
  const pointerRef  = useRef({ x: 0, y: 0 });
  const [webglSupported, setWebglSupported] = useState(true);
  const [ctaVisible, setCtaVisible]         = useState(false);

  useEffect(() => {
    try {
      const cv = document.createElement("canvas");
      setWebglSupported(!!(window.WebGLRenderingContext &&
        (cv.getContext("webgl") || cv.getContext("experimental-webgl"))));
    } catch { setWebglSupported(false); }
  }, []);

  useEffect(() => {
    let fr = 0;
    const onScroll = () => {
      cancelAnimationFrame(fr);
      fr = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current = max > 0 ? window.scrollY / max : 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(fr);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      pointerRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      pointerRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const el = document.getElementById("cta");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="home-page">
      <HomeCanvas
        progressRef={progressRef}
        pointerRef={pointerRef}
        webglSupported={webglSupported}
        ctaVisible={ctaVisible}
      />
      <div className="home-atmosphere" />

      {}
      <section id="hero" className="journey-section hero-journey-section">
        <motion.div
          className="journey-content hero-journey-content"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.92, ease: fadeEase }}
        >
          <span className="journey-kicker">{t("home.hero.kicker")}</span>
          <h1>
            {t("home.hero.title_1")}
            <br />
            <span className="hero-accent">{t("home.hero.title_2")}</span>
          </h1>
          <p className="hero-desc">{t("home.hero.description")}</p>
          <div className="journey-actions">
            <Link className="home-primary-button" to="/contact">
              {t("home.hero.cta.primary")}
              <ArrowRight size={16} />
            </Link>
            <Link className="home-secondary-button" to="/contact">
              {t("home.hero.cta.secondary")}
            </Link>
          </div>
        </motion.div>
        <button
          className="journey-scroll-cue"
          onClick={() => document.getElementById("discord")?.scrollIntoView({ behavior: "smooth" })}
        >
          <Mouse size={14} />
          {t("home.hero.scroll_hint")}
        </button>
      </section>

      {}
      <ServiceSection
        id="discord"
        icon={<MessageSquare size={22} />}
        align="left"
        title={t("home.section.discord.title")}
        desc={t("home.section.discord.desc")}
        learnMore={t("home.section.learn_more")}
      >
        <TechList items={["Moderation", "Tickets", "Economy", "AI", "Analytics"]} />
      </ServiceSection>

      <ServiceSection
        id="web"
        icon={<Code2 size={22} />}
        align="right"
        title={t("home.section.web.title")}
        desc={t("home.section.web.desc")}
        learnMore={t("home.section.learn_more")}
      >
        <TechList items={["Next.js", "React", "Node.js", "API", "Cloud", "SEO"]} />
      </ServiceSection>

      <ServiceSection
        id="mobile"
        icon={<Smartphone size={22} />}
        align="left"
        title={t("home.section.app.title")}
        desc={t("home.section.app.desc")}
        learnMore={t("home.section.learn_more")}
      >
        <TechList items={["Push Notifications", "Maps", "Chat", "Analytics", "Auth"]} />
      </ServiceSection>

      <ServiceSection
        id="individual"
        icon={<Users size={22} />}
        align="right"
        title={t("home.section.individual.title")}
        desc={t("home.section.individual.desc")}
        learnMore={t("home.section.learn_more")}
      >
        <TechList items={["APIs", "Automation", "Integrations", "Scalable"]} />
      </ServiceSection>

      {}
      <section id="cta" className="journey-section final-journey-section">
        <motion.div
          className="journey-content final-journey-content"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.4, once: false }}
          transition={{ duration: 0.92, ease: fadeEase }}
        >
          <span className="journey-kicker">{t("home.about.title")}</span>
          <h2>{t("home.cta.title")}</h2>
          <p>{t("home.about.desc")}</p>
          <div className="journey-actions journey-actions-center">
            <Link className="home-primary-button" to="/contact">
              {t("home.cta.button")}
              <ArrowRight size={16} />
            </Link>
            <Link className="home-secondary-button" to="/github">
              {t("nav.servies")}
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}