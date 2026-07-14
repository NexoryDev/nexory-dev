import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, RoundedBox } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { ArrowRight, Mouse } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  SERVICE_ICON_PATHS,
  SvgAppDevelopment,
  SvgDiscordBot,
  SvgIndividualSolutions,
  SvgWebDevelopment,
} from "../components/icons/svgs";
import "../styles/Home.css";

const BG = "#0a0b0d";
const ACCENT = "#4c7af5";
const fadeEase = [0.16, 1, 0.3, 1];
const SECTION_IDS = ["hero", "discord", "web", "mobile", "individual", "cta"];

function fitText(ctx, text, maxWidth, startSize, minSize) {
  let size = startSize;
  ctx.font = `700 ${size}px 'General Sans','Outfit',sans-serif`;

  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 2;
    ctx.font = `700 ${size}px 'General Sans','Outfit',sans-serif`;
  }

  return size;
}

function drawServiceIcon(ctx, paths) {
  paths.forEach((path) => {
    ctx.stroke(new Path2D(path));
  });
}

function drawFace(label, iconPaths, moduleTag) {
  const cv = document.createElement("canvas");
  cv.width = 1024;
  cv.height = 1024;

  const c = cv.getContext("2d");
  c.clearRect(0, 0, 1024, 1024);

  c.strokeStyle = "rgba(244,243,239,0.14)";
  c.lineWidth = 2;
  const m = 54;
  const corner = 46;
  [
    [m, m, 1],
    [1024 - m, m, -1],
    [m, 1024 - m, 1],
    [1024 - m, 1024 - m, -1],
  ].forEach(([x, y, dx]) => {
    c.beginPath();
    c.moveTo(x, y + corner * (y < 512 ? 1 : -1));
    c.lineTo(x, y);
    c.lineTo(x + corner * dx, y);
    c.stroke();
  });

  c.font = `600 22px 'JetBrains Mono', monospace`;
  c.fillStyle = "rgba(244,243,239,0.38)";
  c.textAlign = "left";
  c.fillText(moduleTag, m + 14, m + 40);

  const iconSize = 300;
  const iconCenterY = 380;

  c.save();
  c.translate(512 - iconSize / 2, iconCenterY - iconSize / 2);
  c.scale(iconSize / 24, iconSize / 24);
  c.strokeStyle = ACCENT;
  c.fillStyle = ACCENT;
  c.lineWidth = 1.7;
  c.lineCap = "round";
  c.lineJoin = "round";
  drawServiceIcon(c, iconPaths);
  c.restore();

  c.strokeStyle = "rgba(244,243,239,0.16)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(260, 640);
  c.lineTo(764, 640);
  c.stroke();

  c.fillStyle = "#f4f3ef";
  c.textAlign = "center";
  c.textBaseline = "middle";
  fitText(c, label, 780, 72, 44);
  c.fillText(label, 512, 730);

  const texture = new THREE.CanvasTexture(cv);
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
}

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
    ref.current.rotation.y = time * 0.004 + progressRef.current * 0.08;
    ref.current.position.y = Math.sin(time * 0.07) * 0.04;
  });

  return (
    <Points ref={ref} positions={pos} stride={3} frustumCulled={false}>
      <PointMaterial transparent depthWrite={false} color="#f4f3ef" opacity={0.05} size={0.012} sizeAttenuation />
    </Points>
  );
}

function ModuleFragments({ mobile }) {
  const groupRef = useRef();

  const fragments = useMemo(() => {
    const amount = mobile ? 3 : 5;

    return Array.from({ length: amount }).map((_, index) => ({
      pos: [
        (Math.random() - 0.5) * 12 + (index % 2 ? 2.5 : -2.5),
        (Math.random() - 0.5) * 6,
        -4 - Math.random() * 5,
      ],
      scale: 0.05 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
    }));
  }, [mobile]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, index) => {
      child.position.y = fragments[index].pos[1] + Math.sin(time * 0.25 + fragments[index].phase) * 0.1;
      child.rotation.x = time * 0.025 + fragments[index].phase;
      child.rotation.y = time * 0.035 + fragments[index].phase;
    });
  });

  return (
    <group ref={groupRef}>
      {fragments.map((frag, index) => (
        <mesh key={index} position={frag.pos} scale={frag.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#0e1420" />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
            <lineBasicMaterial color={ACCENT} transparent opacity={0.28} />
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
      const alpha = 0.16 - (i / amount) * 0.03;
      c.strokeStyle = `rgba(244,243,239,${alpha})`;
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
      opacity: 0.16,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, -2.4, -3]} material={material}>
      <planeGeometry args={[36, 28]} />
    </mesh>
  );
}

function AssemblyOverlay({ visible }) {
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

      const raw = Math.min((timestamp - startRef.current) / 1600, 1);
      const alpha = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      const ctx = cv.getContext("2d");
      const width = cv.width;
      const height = cv.height;
      const cx = width / 2;
      const cy = height / 2;
      const size = Math.min(width, height) * 0.24;
      const lineWidth = size * 0.06;
      const x0 = cx - size * 0.3;
      const x1 = cx + size * 0.3;
      const y0 = cy - size * 0.4;
      const y1 = cy + size * 0.4;
      const maxAlpha = 0.28 * alpha;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = `rgba(76,122,245,${maxAlpha})`;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(x0, y0 + lineWidth * 2);
      ctx.lineTo(x0, y0);
      ctx.lineTo(x0 + lineWidth * 2, y0);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x1 - lineWidth * 2, y1);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1, y1 - lineWidth * 2);
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
    cubeRef.current.position.y += Math.sin(time * 0.35) * 0.0012;

    if (p < 0.08 && !reducedMotion) {
      cubeRef.current.rotation.y += 0.005;
    } else {
      const targetRotY = THREE.MathUtils.lerp(faceRotations[index], faceRotations[nextIndex], blend);
      cubeRef.current.rotation.y = THREE.MathUtils.lerp(
        cubeRef.current.rotation.y,
        targetRotY + px * 0.04,
        0.11
      );
    }

    cubeRef.current.rotation.x = THREE.MathUtils.lerp(
      cubeRef.current.rotation.x,
      -0.1 + py * 0.016,
      0.09
    );

    cubeRef.current.rotation.z = THREE.MathUtils.lerp(
      cubeRef.current.rotation.z,
      Math.sin(time * 0.08) * 0.003,
      0.08
    );

    let fade = 1;

    if (p > 0.86) {
      const t = (p - 0.86) / 0.14;
      fade = 1 - t * t * (3 - 2 * t);
    }

    cubeRef.current.scale.setScalar(mobile ? fade * 1.0 : fade * 1.05);

    cubeRef.current.traverse((child) => {
      if (child.material && child.material.transparent) {
        child.material.opacity = fade;
      }
    });

    if (edgeRef.current) {
      edgeRef.current.material.opacity = fade * 0.5;
    }
  });
}

function Scene({ progressRef, pointerRef, reducedMotion, mobile, cubeTexts = {} }) {
  const cubeRef = useRef();
  const edgeRef = useRef();

  const textures = useMemo(
    () => ({
      discord: drawFace(cubeTexts.discord || "Discord Bot", SERVICE_ICON_PATHS.discord, "MOD_01 · AUTOMATION"),
      web: drawFace(cubeTexts.web || "Web Entwicklung", SERVICE_ICON_PATHS.web, "MOD_02 · FRONTEND"),
      app: drawFace(cubeTexts.app || "Mobile App", SERVICE_ICON_PATHS.app, "MOD_03 · APPS"),
      individual: drawFace(cubeTexts.individual || "Individual", SERVICE_ICON_PATHS.individual, "MOD_04 · SYSTEMS"),
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

      <hemisphereLight args={["#f4f3ef", "#0a0b0d", 0.9]} />
      <directionalLight position={[4, 5, 6]} color="#f4f3ef" intensity={2.4} />
      <directionalLight position={[-5, 2, 3]} color={ACCENT} intensity={0.4} />

      <group ref={cubeRef}>
        <RoundedBox args={[2.3, 2.3, 2.3]} radius={0.06} smoothness={8}>
          <meshPhysicalMaterial
            color="#0e1118"
            metalness={0.3}
            roughness={0.38}
            clearcoat={0.25}
            clearcoatRoughness={0.35}
          />
        </RoundedBox>

        <lineSegments ref={edgeRef} geometry={edgesGeometry}>
          <lineBasicMaterial color={ACCENT} transparent opacity={0.5} />
        </lineSegments>

        <CubeFace texture={textures.discord} position={[0, 0, 1.156]} rotation={[0, 0, 0]} />
        <CubeFace texture={textures.web} position={[1.156, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
        <CubeFace texture={textures.app} position={[0, 0, -1.156]} rotation={[0, Math.PI, 0]} />
        <CubeFace texture={textures.individual} position={[-1.156, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      </group>

      <Grid />
      <ModuleFragments mobile={mobile} />
      <Particles count={mobile ? 20 : 45} progressRef={progressRef} />
    </>
  );
}

function HomeCanvas({ progressRef, pointerRef, webglSupported, ctaVisible, cubeTexts }) {
  const reducedMotion = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 980px)");
    const update = () => setMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
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
      <AssemblyOverlay visible={ctaVisible} />
    </div>
  );
}

function ServiceSection({ id, serviceHref, icon, align = "left", tag, title, desc, learnMore }) {
  return (
    <section id={id} className={`journey-section service-journey-section service--${align}`}>
      <div className="service-grid">
        <motion.div
          className="service-text"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.22, once: false }}
          transition={{ duration: 0.8, ease: fadeEase }}
        >
          {tag && <span className="service-tag">{tag}</span>}
          {icon && <div className="svc-icon">{icon}</div>}
          <h2>{title}</h2>
          <p>{desc}</p>
          <Link className="journey-link" to={serviceHref}>
            {learnMore}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
        <div aria-hidden="true" />
      </div>
    </section>
  );
}

const PROJECTS = [
  {
    tag: "WEB PLATFORM",
    title: "Buchungssystem für einen Dienstleistungsbetrieb",
    desc: "Individuelle Web-Anwendung mit Terminverwaltung, Kundenportal und Anbindung an bestehende Systeme.",
  },
  {
    tag: "AUTOMATION",
    title: "Discord-Infrastruktur für eine Community-Plattform",
    desc: "Skalierbarer Bot mit Rollenverwaltung, Ticket-System und automatisierten Workflows über Webhooks.",
  },
  {
    tag: "INTERNAL TOOLING",
    title: "Admin-Panel zur Prozessautomatisierung",
    desc: "Internes Werkzeug zur Steuerung wiederkehrender Abläufe, angebunden über n8n und eine eigene API.",
  },
];

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
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: fadeEase }}
        >
          <span className="journey-kicker">Software Engineering Studio</span>
          <h1>
            Software, gebaut
            <br />
            <span className="hero-accent">um eure Idee.</span>
          </h1>
          <p className="hero-desc">
            {t("home.hero.description") ||
              "Nexory entwickelt individuelle Software, Webanwendungen und Automatisierungen für reale Anforderungen."}
          </p>
          <div className="journey-actions">
            <Link className="home-primary-button" to="/contact">
              Projekt starten
              <ArrowRight size={16} />
            </Link>
            <Link className="home-secondary-button" to="/services">
              {t("nav.services")}
            </Link>
          </div>
        </motion.div>

        <button
          className="journey-scroll-cue"
          type="button"
          onClick={() => document.getElementById("discord")?.scrollIntoView({ behavior: "smooth" })}
        >
          <Mouse size={14} />
          {t("home.hero.scroll_hint") || "Scrollen"}
        </button>
      </section>

      <ServiceSection
        id="discord"
        serviceHref="/services#discord-bots"
        icon={<SvgDiscordBot size={22} />}
        align="left"
        tag="Modul 01 — Automation"
        title={t("home.section.discord.title")}
        desc={t("home.section.discord.desc")}
        learnMore={t("home.section.learn_more")}
      />

      <ServiceSection
        id="web"
        serviceHref="/services#web-development"
        icon={<SvgWebDevelopment size={22} />}
        align="right"
        tag="Modul 02 — Frontend"
        title={t("home.section.web.title")}
        desc={t("home.section.web.desc")}
        learnMore={t("home.section.learn_more")}
      />

      <ServiceSection
        id="mobile"
        serviceHref="/services#app-development"
        icon={<SvgAppDevelopment size={22} />}
        align="left"
        tag="Modul 03 — Apps"
        title={t("home.section.app.title")}
        desc={t("home.section.app.desc")}
        learnMore={t("home.section.learn_more")}
      />

      <ServiceSection
        id="individual"
        serviceHref="/services#individual-solutions"
        icon={<SvgIndividualSolutions size={22} />}
        align="right"
        tag="Modul 04 — Systeme"
        title={t("home.section.individual.title")}
        desc={t("home.section.individual.desc")}
        learnMore={t("home.section.learn_more")}
      />

      <section id="projects" className="journey-section projects-journey-section">
        <div className="journey-content">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.3, once: false }}
            transition={{ duration: 0.7, ease: fadeEase }}
          >
            <span className="journey-kicker">Beispielhafte Projekte</span>
            <h2 className="projects-title">Systeme, die wir so oder ähnlich gebaut haben.</h2>
          </motion.div>

          <div className="projects-list">
            {PROJECTS.map((project, i) => (
              <motion.article
                key={project.title}
                className="project-card"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.3, once: false }}
                transition={{ duration: 0.7, ease: fadeEase, delay: i * 0.05 }}
              >
                <span className="project-tag">{project.tag}</span>
                <h3>{project.title}</h3>
                <p>{project.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="journey-section final-journey-section">
        <motion.div
          className="journey-content final-journey-content"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.4, once: false }}
          transition={{ duration: 0.85, ease: fadeEase }}
        >
          <span className="journey-kicker">Kontakt</span>
          <h2>
            Habt ihr eine Idee?
            <br />
            Lasst sie uns bauen.
          </h2>
          <p>{t("home.about.desc") || "Wir sind ein kleines Team, das Software von der Architektur bis zum Deployment verantwortet."}</p>
          <div className="journey-actions journey-actions-center">
            <Link className="home-primary-button" to="/contact">
              {t("home.cta.button") || "Kontakt aufnehmen"}
              <ArrowRight size={16} />
            </Link>
            <Link className="home-secondary-button" to="/services">
              {t("nav.services")}
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}