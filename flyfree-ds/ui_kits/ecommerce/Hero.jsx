// Hero.jsx — FlyFree Urban Homepage Hero

const heroStyles = {
  root: { position: "relative", background: "#231F20", minHeight: 420, display: "flex", alignItems: "center", overflow: "hidden", borderBottom: "3px solid #FFD100" },
  overlay: { position: "absolute", inset: 0, backgroundImage: "url('../../assets/community-photo.jpg')", backgroundSize: "cover", backgroundPosition: "center 30%", opacity: 0.35 },
  content: { position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", padding: "60px 40px", width: "100%" },
  tagline: { fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 400, fontSize: 13, letterSpacing: "0.35em", textTransform: "uppercase", color: "#FFD100", marginBottom: 8 },
  title: { fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 900, fontSize: 88, lineHeight: 0.88, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "flex-start" },
  titleLine: { position: "relative", display: "inline-block" },
  italic: { display: "inline-block", transform: "skewX(-12deg)", transformOrigin: "left bottom" },
  speedLines: { position: "absolute", left: -34, top: "16%", width: 26, height: "66%", background: "repeating-linear-gradient(to bottom, #FFD100 0, #FFD100 5px, transparent 5px, transparent 12px)", transform: "skewX(-12deg)" },
  sub: { fontFamily: "'FuturaStd', sans-serif", fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 32 },
  btns: { display: "flex", gap: 12, flexWrap: "wrap" },
  btnPrimary: { background: "#FFD100", color: "#231F20", border: "none", fontFamily: "'FuturaStd', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer", boxShadow: "4px 4px 0 rgba(255,255,255,0.2)" },
  btnOutline: { background: "transparent", color: "#FFFFFF", border: "2px solid #FFFFFF", fontFamily: "'FuturaStd', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 24px", cursor: "pointer" },
  chevronDecor: { position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 900, fontSize: 280, color: "rgba(255,209,0,0.07)", lineHeight: 1, userSelect: "none", zIndex: 1, letterSpacing: "-0.1em" }
};

export function Hero({ onShop }) {
  return (
    <section style={heroStyles.root}>
      <div style={heroStyles.overlay}></div>
      <div style={heroStyles.content}>
        <div style={heroStyles.tagline}>Always Rolling</div>
        <h1 style={heroStyles.title}>
          <span style={heroStyles.titleLine}>
            <span style={heroStyles.speedLines}></span>
            <span style={heroStyles.italic}>Rollers</span>
          </span>
          <span style={heroStyles.italic}>Urbanos</span>
        </h1>
        <p style={heroStyles.sub}>Equipamiento para todos los niveles y edades</p>
        <div style={heroStyles.btns}>
          <button style={heroStyles.btnPrimary} onClick={onShop}>Ver Tienda &gt;&gt;</button>
          <button style={heroStyles.btnOutline}>Alquiler de Rollers</button>
        </div>
      </div>
      <div style={heroStyles.chevronDecor}>&gt;&gt;</div>
    </section>
  );
}

if (typeof window !== 'undefined') Object.assign(window, { Hero });
