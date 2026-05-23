import { useMemo, useEffect, useRef, useCallback } from "react";
import {
  BrainCircuit,
  Boxes,
  Cloud,
  Folder,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import "../../styles/Hero.css";
import { useLanguage } from "../../context/LanguageContext";

const LINE_C1   = "rgba(0, 212, 255, 0.55)";
const LINE_C2   = "rgba(123, 47, 255, 0.45)";
const DASH      = "6 4";
const ANIM_DUR  = "3s";
const DOT_R     = 3;

const CARD_CFGS = [
  { id: "cp-cloud", color: LINE_C1 },
  { id: "cp-ecm",   color: LINE_C1 },
  { id: "cp-erp",   color: LINE_C2 },
  { id: "cp-ai",    color: LINE_C1 },
  { id: "cp-sec",   color: LINE_C2 },
];

function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function edgePoint(cardEl, target) {
  const r  = cardEl.getBoundingClientRect();
  const cx = r.left + r.width  / 2;
  const cy = r.top  + r.height / 2;
  const dx = target.x - cx;
  const dy = target.y - cy;
  const sx = Math.abs((r.width  / 2) / (dx || 0.001));
  const sy = Math.abs((r.height / 2) / (dy || 0.001));
  const s  = Math.min(sx, sy) * 0.88;
  return { x: cx + dx * s, y: cy + dy * s };
}

function buildSvgLine({ cubeCenter, ep, color, gradId, pathLen }) {
  const ns   = "http://www.w3.org/2000/svg";
  const frag = document.createDocumentFragment();

  const grad = document.createElementNS(ns, "linearGradient");
  grad.setAttribute("id", gradId);
  grad.setAttribute("gradientUnits", "userSpaceOnUse");
  grad.setAttribute("x1", cubeCenter.x); grad.setAttribute("y1", cubeCenter.y);
  grad.setAttribute("x2", ep.x);         grad.setAttribute("y2", ep.y);
  [["0%", "0.9"], ["100%", "0.3"]].forEach(([offset, opacity]) => {
    const stop = document.createElementNS(ns, "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    stop.setAttribute("stop-opacity", opacity);
    grad.appendChild(stop);
  });

  const glow = document.createElementNS(ns, "line");
  glow.setAttribute("x1", cubeCenter.x); glow.setAttribute("y1", cubeCenter.y);
  glow.setAttribute("x2", ep.x);         glow.setAttribute("y2", ep.y);
  glow.setAttribute("stroke", color);
  glow.setAttribute("stroke-width", "3");
  glow.setAttribute("stroke-dasharray", DASH);
  glow.setAttribute("opacity", "0.25");
  glow.setAttribute("filter", "url(#hc-glow)");

  const line = document.createElementNS(ns, "line");
  line.setAttribute("x1", cubeCenter.x); line.setAttribute("y1", cubeCenter.y);
  line.setAttribute("x2", ep.x);         line.setAttribute("y2", ep.y);
  line.setAttribute("stroke", `url(#${gradId})`);
  line.setAttribute("stroke-width", "1");
  line.setAttribute("stroke-dasharray", DASH);
  const anim = document.createElementNS(ns, "animate");
  anim.setAttribute("attributeName", "stroke-dashoffset");
  anim.setAttribute("from", "0");
  anim.setAttribute("to",   String(-pathLen));
  anim.setAttribute("dur",  ANIM_DUR);
  anim.setAttribute("repeatCount", "indefinite");
  line.appendChild(anim);

  const mkDot = (cx, cy, r, opacity) => {
    const d = document.createElementNS(ns, "circle");
    d.setAttribute("cx", cx); d.setAttribute("cy", cy);
    d.setAttribute("r",  r);  d.setAttribute("fill", color);
    d.setAttribute("opacity", opacity);
    return d;
  };

  frag.appendChild(grad);
  frag.appendChild(glow);
  frag.appendChild(line);
  frag.appendChild(mkDot(ep.x, ep.y, DOT_R, "0.8"));
  frag.appendChild(mkDot(cubeCenter.x, cubeCenter.y, DOT_R - 1, "0.5"));
  return frag;
}

export default function Hero() {
  const { t } = useLanguage();

  function tt(key, fallback) {
    const v = t(key);
    return v === key ? fallback : v;
  }

  const particles = useMemo(
    () =>
      Array.from({ length: 180 }).map((_, i) => ({
        id: i,
        left:     `${(Math.sin(i * 52.73) * 0.5 + 0.5) * 100}%`,
        top:      `${(Math.cos(i * 37.11) * 0.5 + 0.5) * 100}%`,
        delay:    `${(i % 11) * 0.34}s`,
        duration: `${5 + (i % 6) * 0.6}s`,
        size:     `${1.6 + (i % 4) * 0.9}px`,
        opacity:  `${0.22 + (i % 5) * 0.1}`,
        purple:   i % 3 === 0,
      })),
    []
  );

  const svgRef  = useRef(null);
  const cubeRef = useRef(null);
  const rafRef  = useRef(null);

  const drawLines = useCallback(() => {
    const svg  = svgRef.current;
    const cube = cubeRef.current;
    const scene = document.querySelector(".hero-scene");
    if (!svg || !cube || !scene) return;

    const sceneRect = scene.getBoundingClientRect();
    const vw = sceneRect.width;
    const vh = sceneRect.height;
    const ns = "http://www.w3.org/2000/svg";

    svg.setAttribute("width",   vw);
    svg.setAttribute("height",  vh);
    svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
    svg.setAttribute("preserveAspectRatio", "none");

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const defs = document.createElementNS(ns, "defs");

    const filter = document.createElementNS(ns, "filter");
    filter.setAttribute("id", "hc-glow");
    filter.setAttribute("x", "-20%"); filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "140%"); filter.setAttribute("height", "140%");
    const blur = document.createElementNS(ns, "feGaussianBlur");
    blur.setAttribute("stdDeviation", "2.5");
    blur.setAttribute("result", "blur");
    const merge = document.createElementNS(ns, "feMerge");
    ["blur", "SourceGraphic"].forEach(v => {
      const n = document.createElementNS(ns, "feMergeNode");
      if (v === "blur") n.setAttribute("in", "blur");
      merge.appendChild(n);
    });
    filter.appendChild(blur);
    filter.appendChild(merge);
    defs.appendChild(filter);
    svg.appendChild(defs);

    CARD_CFGS.forEach(({ id, color }, i) => {
      const cardEl = document.getElementById(id);
      if (!cardEl) return;
      const cardCenter = getCenter(cardEl);
      const cubeEdge = edgePoint(cube, cardCenter);
      const cardEdge = edgePoint(cardEl, cubeEdge);
      const pathLen = Math.hypot(cardEdge.x - cubeEdge.x, cardEdge.y - cubeEdge.y);
      const relCube = { x: cubeEdge.x - sceneRect.left, y: cubeEdge.y - sceneRect.top };
      const relCard = { x: cardEdge.x - sceneRect.left, y: cardEdge.y - sceneRect.top };
      svg.appendChild(buildSvgLine({ cubeCenter: relCube, ep: relCard, color, gradId: `hc-grad-${i}`, pathLen }));
    });
  }, []);

  useEffect(() => {
    const scene = document.querySelector(".hero-scene");
    if (scene && !svgRef.current) {
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.classList.add("hero-conn-svg");
      svgRef.current = svg;
      svg.style.position = "absolute";
      svg.style.inset = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      svg.style.zIndex = "0";
      svg.style.overflow = "visible";
      scene.prepend(svg);
    }

    drawLines();

    const loop = () => { drawLines(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      const scene = document.querySelector(".hero-scene");
      const svg = svgRef.current;
      if (svg && scene && svg.parentElement === scene) {
        scene.removeChild(svg);
      }
    };
  }, [drawLines]);

  return (
    <section className="hero">
      <div className="hero-grid-bg" aria-hidden="true" />
      <div className="hero-glow hero-glow-c" aria-hidden="true" />
      <div className="hero-glow hero-glow-l" aria-hidden="true" />
      <div className="hero-scan" aria-hidden="true" />

      <div className="hero-corner hero-corner-tl" aria-hidden="true" />
      <div className="hero-corner hero-corner-tr" aria-hidden="true" />
      <div className="hero-corner hero-corner-bl" aria-hidden="true" />
      <div className="hero-corner hero-corner-br" aria-hidden="true" />

      <div className="hero-readout" aria-hidden="true">
        {tt("hero.readout.sys", "SYS_VER")} 4.2.1<br />
        {tt("hero.readout.uptime", "UPTIME")} 99.98%<br />
        {tt("hero.readout.nodes", "NODES")} 2,847<br />
        {tt("hero.readout.latency", "LATENCY")} 4ms<br />
        {tt("hero.readout.load", "LOAD")} 0.31
      </div>

      <div className="hero-main">
        <div className="hero-l">
          <p className="hero-tag">{tt("hero.kicker", "DIGITAL INFRASTRUCTURE")}</p>

          <h1>
            {tt("hero.title.line1", "BUILDING DIGITAL")}<br />
            {tt("hero.title.line2", "INFRASTRUCTURE")}<br />
            {tt("hero.title.line3_pre", "FOR THE")}{" "}
            <span>{tt("hero.title.line3_highlight", "NEXT ERA")}</span>
          </h1>

          <p className="hero-sub">
            {tt(
              "hero.description",
              "We design, build and operate mission-critical systems that empower your business, secure your data and accelerate your growth."
            )}
          </p>

          <div className="hero-btns">
            <Link to="/contact" className="hero-btn-p">
              {t('hero.cta.primary')}
            </Link>
            <Link to="/github" className="hero-btn-s">
              {t('hero.cta.secondary')}
            </Link>
          </div>
        </div>

        <div className="hero-r" aria-hidden="true">
          <div className="hero-scene">

          <div className="hero-ring hero-r1" />
          <div className="hero-ring hero-r2" />
          <div className="hero-ring hero-r3" />

          <div className="hero-cube-wrap" ref={cubeRef}>

            <div className="hero-face hero-fr" />
            <div className="hero-face hero-bk" />
            <div className="hero-face hero-lt" />
            <div className="hero-face hero-rt" />
            <div className="hero-face hero-tp" />
            <div className="hero-face hero-bt" />

          </div>

          <div className="hero-inner-cube">

            <div className="hero-iface hero-ifr">
              <div className="hero-inner-label">

                <div className="hero-core-name">
                  NexoryDev
                </div>

                <div className="hero-core-sub">
                  CORE
                </div>

              </div>
            </div>

            <div className="hero-iface hero-ibk" />
            <div className="hero-iface hero-irt" />
            <div className="hero-iface hero-ilt" />
            <div className="hero-iface hero-itp" />
            <div className="hero-iface hero-ibt" />

          </div>

          <div className="hero-cp hero-cp-cloud" id="cp-cloud">
            <div className="hero-sc">
              <div className="hero-sc-icon">
                <Cloud size={18}/>
              </div>

              <div className="hero-sc-title">
                {tt("hero.card.cloud.title","CLOUD")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.cloud.item1","Scalable")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.cloud.item2","Secure")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.cloud.item3","Global")}
              </div>
            </div>
          </div>

          <div className="hero-cp hero-cp-ecm" id="cp-ecm">
            <div className="hero-sc">
              <div className="hero-sc-icon">
                <Folder size={18}/>
              </div>

              <div className="hero-sc-title">
                {tt("hero.card.ecm.title","ECM")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.ecm.item1","Manage")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.ecm.item2","Store")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.ecm.item3","Secure")}
              </div>
            </div>
          </div>

          <div className="hero-cp hero-cp-erp" id="cp-erp">
            <div className="hero-sc hero-sc-purple">
              <div className="hero-sc-icon hero-sc-icon-purple">
                <Boxes size={18}/>
              </div>

              <div className="hero-sc-title hero-sc-title-purple">
                {tt("hero.card.erp.title","ERP")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.erp.item1","Integrate")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.erp.item2","Automate")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.erp.item3","Optimize")}
              </div>
            </div>
          </div>

          <div className="hero-cp hero-cp-ai" id="cp-ai">
            <div className="hero-sc">
              <div className="hero-sc-icon">
                <BrainCircuit size={18}/>
              </div>

              <div className="hero-sc-title">
                {tt("hero.card.ai.title","AI")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.ai.item1","Intelligence")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.ai.item2","Automation")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.ai.item3","Insights")}
              </div>
            </div>
          </div>

          <div className="hero-cp hero-cp-sec" id="cp-sec">
            <div className="hero-sc hero-sc-purple">
              <div className="hero-sc-icon hero-sc-icon-purple">
                <Shield size={18}/>
              </div>

              <div className="hero-sc-title hero-sc-title-purple">
                {tt("hero.card.security.title","SECURITY")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.security.item1","Protect")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.security.item2","Detect")}
              </div>

              <div className="hero-sc-item">
                {tt("hero.card.security.item3","Respond")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <div className="hero-scroll-h" aria-hidden="true">
        <p>{tt("hero.scroll_hint", "SCROLL TO EXPLORE")}</p>
        <div className="hero-mouse" />
      </div>

      <div className="hero-particles" aria-hidden="true">
        {particles.map((p) => (
          <span
            key={p.id}
            className={`hero-particle${p.purple ? " purple" : ""}`}
            style={{
              left:              p.left,
              top:               p.top,
              animationDelay:    p.delay,
              animationDuration: p.duration,
              width:             p.size,
              height:            p.size,
              opacity:           p.opacity,
            }}
          />
        ))}
      </div>
    </section>
  );
}
