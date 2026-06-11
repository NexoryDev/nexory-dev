import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, RoundedBox } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { ArrowRight, Mouse, MessageSquare, Code2, Smartphone, Users } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import "../styles/Home.css";

const BG = "#020409";
const fadeEase = [0.16, 1, 0.3, 1];
const SECTION_IDS = ["hero", "discord", "web", "mobile", "individual", "cta"];

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

function fitText(ctx, text, maxWidth, startSize, minSize) {
  let size = startSize;
  ctx.font = `800 ${size}px 'Outfit','Inter',sans-serif`;

  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `800 ${size}px 'Outfit','Inter',sans-serif`;
  }

  return size;
}

function drawFace(label, iconFn, color) {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 1024;

  const c = cv.getContext("2d");
  c.clearRect(0, 0, 1024, 1024);

  const iconSize = 335;
  const iconCenterY = 365;

  c.save();
  c.translate(512 - iconSize / 2, iconCenterY - iconSize / 2);
  c.scale(iconSize / 24, iconSize / 24);
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 1.9;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.shadowBlur = 16;
  c.shadowColor = color;
  iconFn(c);
  c.restore();

  c.shadowBlur = 0;
  c.strokeStyle = `${color}55`;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(260, 635);
  c.lineTo(764, 635);
  c.stroke();

  c.fillStyle = color;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.shadowBlur = 22;
  c.shadowColor = color;
  fitText(c, label, 780, 84, 48);
  c.fillText(label, 512, 760);

  const texture = new THREE.CanvasTexture(cv);
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

const ICONS = {
  discord: (c) => {
    c.beginPath();
    c.moveTo(5.5, 10);
    c.bezierCurveTo(4.8, 7, 6.8, 4.5, 9.2, 4.5);
    c.lineTo(14.8, 4.5);
    c.bezierCurveTo(17.2, 4.5, 19.2, 7, 18.5, 10);
    c.lineTo(18.2, 15.5);
    c.bezierCurveTo(17.8, 18.2, 16, 19.5, 14.2, 19.5);
    c.lineTo(13, 21.2);
    c.lineTo(12, 19.5);
    c.lineTo(9.8, 19.5);
    c.bezierCurveTo(8, 19.5, 6.2, 18.2, 5.8, 15.5);
    c.closePath();
    c.stroke();
    c.beginPath();
    c.arc(9.2, 12.5, 1.9, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(14.8, 12.5, 1.9, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.moveTo(9.5, 16.2);
    c.quadraticCurveTo(12, 18, 14.5, 16.2);
    c.stroke();
  },
  web: (c) => {
    c.lineWidth = 2.1;
    c.beginPath();
    c.moveTo(8, 6.5);
    c.lineTo(2.5, 12);
    c.lineTo(8, 17.5);
    c.stroke();
    c.beginPath();
    c.moveTo(14.5, 4.5);
    c.lineTo(9.5, 19.5);
    c.stroke();
    c.beginPath();
    c.moveTo(16, 6.5);
    c.lineTo(21.5, 12);
    c.lineTo(16, 17.5);
    c.stroke();
  },
  app: (c) => {
    rrect(c, 6.5, 1.5, 11, 21, 2.2);
    c.stroke();
    c.beginPath();
    c.moveTo(10, 20);
    c.lineTo(14, 20);
    c.stroke();
    c.beginPath();
    c.arc(12, 4.2, 1, 0, Math.PI * 2);
    c.fill();
  },
  individual: (c) => {
    c.beginPath();
    c.arc(12, 7.5, 3.8, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(3.5, 22);
    c.bezierCurveTo(3.5, 16.5, 7.2, 13.5, 12, 13.5);
    c.bezierCurveTo(16.8, 13.5, 20.5, 16.5, 20.5, 22);
    c.stroke();
  },
};

function Particles({ count, progressRef }) {
  const ref = useRef();

  const pos = useMemo(() => {
    const data = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      data[i * 3] = (Math.random() - 0.5) * 22;
      data[i * 3 + 1] = (Math.random() - 0.5) * 12;
      data[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    return data;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;

    const time = state.clock.elapsedTime;
    ref.current.rotation.y = time * 0.005 + progressRef.current * 0.1;
    ref.current.position.y = Math.sin(time * 0.08) * 0.05;
  });

  return (
    <Points ref={ref} positions={pos} stride={3} frustumCulled={false}>
      <PointMaterial transparent depthWrite={false} color="#8090d8" opacity={0.14} size={0.014} sizeAttenuation />
    </Points>
  );
}

function AccentCubes({ mobile }) {
  const groupRef = useRef();

  const cubes = useMemo(() => {
    const amount = mobile ? 3 : 5;

    return Array.from({ length: amount }).map((_, index) => ({
      pos: [
        (Math.random() - 0.5) * 12 + (index % 2 ? 2.5 : -2.5),
        (Math.random() - 0.5) * 6,
        -4 - Math.random() * 5,
      ],
      scale: 0.04 + Math.random() * 0.07,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [mobile]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, index) => {
      child.position.y = cubes[index].pos[1] + Math.sin(time * 0.3 + cubes[index].phase) * 0.12;
      child.rotation.x = time * 0.035 + cubes[index].phase;
      child.rotation.y = time * 0.048 + cubes[index].phase;
    });
  });

  return (
    <group ref={groupRef}>
      {cubes.map((cube, index) => (
        <mesh key={index} position={cube.pos} scale={cube.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={index % 2 ? "#0a1a40" : "#0c1a38"} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
            <lineBasicMaterial color={index % 3 === 0 ? "#3060e0" : index % 3 === 1 ? "#6040e0" : "#30a0e0"} transparent opacity={0.45} />
          </lineSegments>
        </mesh>
      ))}
    </group>
  );
}

function Grid() {
  const material = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 1024;

    const c = cv.getContext("2d");
    c.clearRect(0, 0, 1024, 1024);

    const amount = 16;
    const step = 1024 / amount;

    for (let i = 0; i <= amount; i += 1) {
      const alpha = 0.38 - (i / amount) * 0.06;
      c.strokeStyle = `rgba(16,42,100,${alpha})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(i * step, 0);
      c.lineTo(i * step, 1024);
      c.stroke();
      c.beginPath();
      c.moveTo(0, i * step);
      c.lineTo(1024, i * step);
      c.stroke();
    }

    const texture = new THREE.CanvasTexture(cv);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.5, 2.5);

    return new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, -2.4, -3]} material={material}>
      <planeGeometry args={[36, 28]} />
    </mesh>
  );
}

function NDissolveOverlay({ visible }) {
  const cvRef = useRef();
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return undefined;

    if (!visible) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      const ctx = cv.getContext("2d");
      ctx.clearRect(0, 0, cv.width, cv.height);
      return undefined;
    }

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      cv.width = cv.offsetWidth * ratio;
      cv.height = cv.offsetHeight * ratio;
    }

    function render(timestamp) {
      if (!startRef.current) startRef.current = timestamp;

      const raw = Math.min((timestamp - startRef.current) / 1800, 1);
      const alpha = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const ctx = cv.getContext("2d");
      const width = cv.width;
      const height = cv.height;
      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height) * 0.28;
      const lineWidth = size * 0.11;
      const x0 = cx - size * 0.28;
      const x1 = cx + size * 0.28;
      const y0 = cy - size * 0.42;
      const y1 = cy + size * 0.42;
      const maxAlpha = 0.35 * alpha;

      ctx.clearRect(0, 0, width, height);

      const halo = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 1.1);
      halo.addColorStop(0, `rgba(96, 80, 255, ${0.12 * alpha})`);
      halo.addColorStop(0.5, `rgba(80, 40, 200, ${0.05 * alpha})`);
      halo.addColorStop(1, "rgba(4, 13, 30, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, `rgba(96, 200, 255, ${maxAlpha})`);
      gradient.addColorStop(0.38, `rgba(192, 132, 252, ${maxAlpha})`);
      gradient.addColorStop(0.72, `rgba(128, 96, 255, ${maxAlpha})`);
      gradient.addColorStop(1, `rgba(240, 238, 255, ${maxAlpha})`);

      ctx.shadowBlur = 24 * alpha;
      ctx.shadowColor = `rgba(128, 96, 255, ${maxAlpha})`;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y1);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1, y0);
      ctx.stroke();

      ctx.shadowBlur = 10 * alpha;
      ctx.shadowColor = `rgba(220, 210, 255, ${maxAlpha * 0.5})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * alpha})`;
      ctx.lineWidth = lineWidth * 0.11;
      ctx.beginPath();
      ctx.moveTo(x0 + lineWidth * 0.55, y0 + lineWidth * 0.85);
      ctx.lineTo(x1 - lineWidth * 0.55, y1 - lineWidth * 0.85);
      ctx.stroke();

      if (raw < 1) rafRef.current = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [visible]);

  return (
    <canvas
      ref={cvRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    />
  );
}

function CubeFace({ texture, position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[2.06, 2.06]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={1}
        depthWrite={false}
        depthTest
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-4}
        polygonOffsetUnits={-4}
      />
    </mesh>
  );
}

function useCubeController(progressRef, pointerRef, reducedMotion, mobile, cubeRef, edgeRef) {
  const targetPosition = useRef(new THREE.Vector3());
  const smoothProgress = useRef(0);

  const basePositions = useMemo(() => {
    if (mobile) {
      return [
        new THREE.Vector3(0.3, 0, 0),
        new THREE.Vector3(0.3, 0, 0),
        new THREE.Vector3(0.3, 0, 0),
        new THREE.Vector3(0.3, 0, 0),
        new THREE.Vector3(0.3, 0, 0),
        new THREE.Vector3(0.3, 0, 0),
      ];
    }

    return [
      new THREE.Vector3(3.2, 0, 0),
      new THREE.Vector3(3.2, 0, 0),
      new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(3.2, 0, 0),
      new THREE.Vector3(-1.5, 0, 0),
      new THREE.Vector3(1.0, 0, 0),
    ];
  }, [mobile]);

  const faceRotations = useMemo(
    () => [0, 0, -Math.PI / 2, Math.PI, Math.PI / 2, Math.PI / 2],
    []
  );

  const offset = useMemo(
    () => new THREE.Vector3(mobile ? 0 : -0.6, mobile ? -0.05 : -0.2, 0),
    [mobile]
  );

  useFrame((state) => {
    if (!cubeRef.current) return;

    const time = state.clock.elapsedTime;

    smoothProgress.current = THREE.MathUtils.lerp(
      smoothProgress.current,
      THREE.MathUtils.clamp(progressRef.current, 0, 1),
      reducedMotion ? 0.18 : 0.085
    );

    const p = smoothProgress.current;
    const px = reducedMotion ? 0 : THREE.MathUtils.clamp(pointerRef.current.x, -1, 1);
    const py = reducedMotion ? 0 : THREE.MathUtils.clamp(pointerRef.current.y, -1, 1);
    const maxIndex = basePositions.length - 1;
    const segment = THREE.MathUtils.clamp(p * maxIndex, 0, maxIndex);
    const index = Math.min(Math.floor(segment), maxIndex);
    const nextIndex = Math.min(index + 1, maxIndex);
    const blend = THREE.MathUtils.smoothstep(segment - index, 0, 1);

    const target = new THREE.Vector3()
      .lerpVectors(basePositions[index], basePositions[nextIndex], blend)
      .add(offset);

    targetPosition.current.lerp(target, 0.1);
    cubeRef.current.position.lerp(targetPosition.current, 0.12);
    cubeRef.current.position.y += Math.sin(time * 0.4) * 0.0015;

    if (p < 0.08 && !reducedMotion) {
      cubeRef.current.rotation.y += 0.006;
    } else {
      const targetRotY = THREE.MathUtils.lerp(faceRotations[index], faceRotations[nextIndex], blend);
      cubeRef.current.rotation.y = THREE.MathUtils.lerp(
        cubeRef.current.rotation.y,
        targetRotY + px * 0.045,
        0.11
      );
    }

    cubeRef.current.rotation.x = THREE.MathUtils.lerp(
      cubeRef.current.rotation.x,
      -0.12 + py * 0.018,
      0.09
    );

    cubeRef.current.rotation.z = THREE.MathUtils.lerp(
      cubeRef.current.rotation.z,
      Math.sin(time * 0.1) * 0.004,
      0.08
    );

    let fade = 1;

    if (p > 0.86) {
      const t = (p - 0.86) / 0.14;
      fade = 1 - t * t * (3 - 2 * t);
    }

    cubeRef.current.scale.setScalar(mobile ? fade * 1.02 : fade * 1.08);

    cubeRef.current.traverse((child) => {
      if (child.material && child.material.transparent) {
        child.material.opacity = fade;
      }
    });

    if (edgeRef.current) {
      edgeRef.current.material.opacity = fade * 0.85;
    }
  });
}

function Scene({ progressRef, pointerRef, reducedMotion, mobile, cubeTexts = {} }) {
  const cubeRef = useRef();
  const edgeRef = useRef();

  const textures = useMemo(
    () => ({
      discord: drawFace(cubeTexts.discord || "Discord Bot", ICONS.discord, "#5865f2"),
      web: drawFace(cubeTexts.web || "Web Entwicklung", ICONS.web, "#0ea5e9"),
      app: drawFace(cubeTexts.app || "Mobile App", ICONS.app, "#ec4899"),
      individual: drawFace(cubeTexts.individual || "Individual", ICONS.individual, "#a855f7"),
    }),
    [cubeTexts]
  );

  const edgesGeometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 2.3, 2.3)),
    []
  );

  useCubeController(progressRef, pointerRef, reducedMotion, mobile, cubeRef, edgeRef);

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 10, 28]} />

      <hemisphereLight args={["#6f8cff", "#020409", 1.15]} />
      <directionalLight position={[4, 5, 6]} color="#dbe7ff" intensity={2.6} />

      <group ref={cubeRef}>
        <RoundedBox args={[2.3, 2.3, 2.3]} radius={0.1} smoothness={8}>
          <meshPhysicalMaterial
            color="#050e28"
            metalness={0.68}
            roughness={0.22}
            clearcoat={0.6}
            clearcoatRoughness={0.25}
            emissiveIntensity={0.12}
            emissive={new THREE.Color("#111833")}
          />
        </RoundedBox>

        <CubeFace texture={textures.discord} position={[0, 0, 1.156]} rotation={[0, 0, 0]} />
        <CubeFace texture={textures.web} position={[1.156, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <CubeFace texture={textures.app} position={[0, 0, -1.156]} rotation={[0, Math.PI, 0]} />
        <CubeFace texture={textures.individual} position={[-1.156, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      </group>

      <Grid />
      <AccentCubes mobile={mobile} />
      <Particles count={mobile ? 25 : 60} progressRef={progressRef} />
    </>
  );
}

function HomeCanvas({ progressRef, pointerRef, webglSupported, ctaVisible, cubeTexts }) {
  const reducedMotion = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const update = () => setMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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
        camera={{ position: [0, 0, 8], fov: mobile ? 65 : 45 }}
        dpr={[1, mobile ? 1.2 : 1.7]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene
            progressRef={progressRef}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
            mobile={mobile}
            cubeTexts={cubeTexts}
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
        <div aria-hidden="true" />
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [webglSupported, setWebglSupported] = useState(true);
  const [ctaVisible, setCtaVisible] = useState(false);

  const cubeTexts = useMemo(
    () => ({
      discord: t("home.section.discord.title"),
      web: t("home.section.web.title"),
      app: t("home.section.app.title"),
      individual: t("home.section.individual.title"),
    }),
    [t]
  );

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebglSupported(
        Boolean(
          window.WebGLRenderingContext &&
            (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        )
      );
    } catch {
      setWebglSupported(false);
    }
  }, []);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const viewportCenter = window.scrollY + window.innerHeight * 0.5;
        const centers = SECTION_IDS.map((id) => {
          const element = document.getElementById(id);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return window.scrollY + rect.top + rect.height * 0.5;
        }).filter((value) => value !== null);

        if (centers.length < 2) {
          progressRef.current = 0;
          return;
        }

        if (viewportCenter <= centers[0]) {
          progressRef.current = 0;
          return;
        }

        if (viewportCenter >= centers[centers.length - 1]) {
          progressRef.current = 1;
          return;
        }

        for (let i = 0; i < centers.length - 1; i += 1) {
          const start = centers[i];
          const end = centers[i + 1];

          if (viewportCenter >= start && viewportCenter <= end) {
            const local = end === start ? 0 : (viewportCenter - start) / (end - start);
            progressRef.current = THREE.MathUtils.clamp((i + local) / (centers.length - 1), 0, 1);
            return;
          }
        }
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.y = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const element = document.getElementById("cta");
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setCtaVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <main className="home-page">
      <HomeCanvas
        progressRef={progressRef}
        pointerRef={pointerRef}
        webglSupported={webglSupported}
        ctaVisible={ctaVisible}
        cubeTexts={cubeTexts}
      />

      <div className="home-atmosphere" />

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
          type="button"
          onClick={() => document.getElementById("discord")?.scrollIntoView({ behavior: "smooth" })}
        >
          <Mouse size={14} />
          {t("home.hero.scroll_hint")}
        </button>
      </section>

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
