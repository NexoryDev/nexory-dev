import { useMemo } from "react";
import {
  BrainCircuit,
  Boxes,
  Cloud,
  Folder,
  Shield
} from "lucide-react";

import "../../styles/Hero.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  function tt(key, fallback) {
    const translated = t(key);
    return translated === key ? fallback : translated;
  }

  const particles = useMemo(
    () =>
      Array.from({ length: 180 }).map((_, i) => ({
        id: i,
        left: `${(Math.sin(i * 52.73) * 0.5 + 0.5) * 100}%`,
        top: `${(Math.cos(i * 37.11) * 0.5 + 0.5) * 100}%`,
        delay: `${(i % 11) * 0.34}s`,
        duration: `${5 + (i % 6) * 0.6}s`,
        size: `${1.6 + (i % 4) * 0.9}px`,
        opacity: `${0.22 + (i % 5) * 0.1}`,
        purple: i % 3 === 0
      })),
    []
  );

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
        {tt("hero.readout.sys", "SYS_VER")} 4.2.1
        <br />
        {tt("hero.readout.uptime", "UPTIME")} 99.98%
        <br />
        {tt("hero.readout.nodes", "NODES")} 2,847
        <br />
        {tt("hero.readout.latency", "LATENCY")} 4ms
        <br />
        {tt("hero.readout.load", "LOAD")} 0.31
      </div>

      <div className="hero-main">
        <div className="hero-l">
          <p className="hero-tag">{tt("hero.kicker", "DIGITAL INFRASTRUCTURE")}</p>

          <h1>
            {tt("hero.title.line1", "BUILDING DIGITAL")}
            <br />
            {tt("hero.title.line2", "INFRASTRUCTURE")}
            <br />
            {tt("hero.title.line3_pre", "FOR THE")} <span>{tt("hero.title.line3_highlight", "NEXT ERA")}</span>
          </h1>

          <p className="hero-sub">
            {tt(
              "hero.description",
              "We design, build and operate mission-critical systems that empower your business, secure your data and accelerate your growth."
            )}
          </p>

          <div className="hero-btns">
            <button className="hero-btn-p">
              &gt; {tt("hero.cta.primary", "Explore Services")}
            </button>
            <button className="hero-btn-s">
              &gt; {tt("hero.cta.secondary", "View Architecture")}
            </button>
          </div>
        </div>

        <div className="hero-r" aria-hidden="true">
          <div className="hero-scene">
            <svg className="hero-conn-svg" viewBox="0 0 580 580" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="md" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5">
                  <circle cx="2.5" cy="2.5" r="1.8" fill="#00d4ff" opacity="0.7" />
                </marker>
                <marker id="mp" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5">
                  <circle cx="2.5" cy="2.5" r="1.8" fill="#2e86ff" opacity="0.7" />
                </marker>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <line x1="290" y1="74" x2="290" y2="238" stroke="rgba(0,212,255,.22)" strokeWidth="1" strokeDasharray="5 7" markerEnd="url(#md)" filter="url(#glow)" />
              <line x1="126" y1="210" x2="238" y2="270" stroke="rgba(0,212,255,.22)" strokeWidth="1" strokeDasharray="5 7" markerEnd="url(#md)" filter="url(#glow)" />
              <line x1="454" y1="204" x2="342" y2="265" stroke="rgba(46,134,255,.22)" strokeWidth="1" strokeDasharray="5 7" markerEnd="url(#mp)" filter="url(#glow)" />
              <line x1="136" y1="416" x2="240" y2="320" stroke="rgba(0,212,255,.22)" strokeWidth="1" strokeDasharray="5 7" markerEnd="url(#md)" filter="url(#glow)" />
              <line x1="434" y1="418" x2="340" y2="322" stroke="rgba(46,134,255,.22)" strokeWidth="1" strokeDasharray="5 7" markerEnd="url(#mp)" filter="url(#glow)" />
            </svg>

            <div className="hero-ring hero-r1" />
            <div className="hero-ring hero-r2" />
            <div className="hero-ring hero-r3" />

            <div className="hero-cube-wrap">
              <div className="hero-face hero-fr" />
              <div className="hero-face hero-bk" />
              <div className="hero-face hero-lt" />
              <div className="hero-face hero-rt" />
              <div className="hero-face hero-tp" />
              <div className="hero-face hero-bt" />
              <div className="hero-crystal" />
            </div>

            <div className="hero-core-lbl">
              <div className="hero-core-name">NexoryDev</div>
              <div className="hero-core-sub">CORE</div>
            </div>

            <div className="hero-cp hero-cp-cloud">
              <div className="hero-sc">
                <div className="hero-sc-icon"><Cloud size={18} /></div>
                <div className="hero-sc-title">{tt("hero.card.cloud.title", "CLOUD")}</div>
                <div className="hero-sc-item">{tt("hero.card.cloud.item1", "Scalable")}</div>
                <div className="hero-sc-item">{tt("hero.card.cloud.item2", "Secure")}</div>
                <div className="hero-sc-item">{tt("hero.card.cloud.item3", "Global")}</div>
              </div>
            </div>

            <div className="hero-cp hero-cp-ecm">
              <div className="hero-sc">
                <div className="hero-sc-icon"><Folder size={18} /></div>
                <div className="hero-sc-title">{tt("hero.card.ecm.title", "ECM")}</div>
                <div className="hero-sc-item">{tt("hero.card.ecm.item1", "Manage")}</div>
                <div className="hero-sc-item">{tt("hero.card.ecm.item2", "Store")}</div>
                <div className="hero-sc-item">{tt("hero.card.ecm.item3", "Secure")}</div>
              </div>
            </div>

            <div className="hero-cp hero-cp-erp">
              <div className="hero-sc hero-sc-purple">
                <div className="hero-sc-icon hero-sc-icon-purple"><Boxes size={18} /></div>
                <div className="hero-sc-title hero-sc-title-purple">{tt("hero.card.erp.title", "ERP")}</div>
                <div className="hero-sc-item">{tt("hero.card.erp.item1", "Integrate")}</div>
                <div className="hero-sc-item">{tt("hero.card.erp.item2", "Automate")}</div>
                <div className="hero-sc-item">{tt("hero.card.erp.item3", "Optimize")}</div>
              </div>
            </div>

            <div className="hero-cp hero-cp-ai">
              <div className="hero-sc">
                <div className="hero-sc-icon"><BrainCircuit size={18} /></div>
                <div className="hero-sc-title">{tt("hero.card.ai.title", "AI")}</div>
                <div className="hero-sc-item">{tt("hero.card.ai.item1", "Intelligence")}</div>
                <div className="hero-sc-item">{tt("hero.card.ai.item2", "Automation")}</div>
                <div className="hero-sc-item">{tt("hero.card.ai.item3", "Insights")}</div>
              </div>
            </div>

            <div className="hero-cp hero-cp-sec">
              <div className="hero-sc hero-sc-purple">
                <div className="hero-sc-icon hero-sc-icon-purple"><Shield size={18} /></div>
                <div className="hero-sc-title hero-sc-title-purple">{tt("hero.card.security.title", "SECURITY")}</div>
                <div className="hero-sc-item">{tt("hero.card.security.item1", "Protect")}</div>
                <div className="hero-sc-item">{tt("hero.card.security.item2", "Detect")}</div>
                <div className="hero-sc-item">{tt("hero.card.security.item3", "Respond")}</div>
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
        {particles.map((particle) => (
          <span
            key={particle.id}
            className={`hero-particle ${particle.purple ? "purple" : ""}`.trim()}
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity
            }}
          />
        ))}
      </div>
    </section>
  );
}
