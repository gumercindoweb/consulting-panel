// Footer.jsx — FlyFree Urban Footer

const footerStyles = {
  root: { background: "#231F20", borderTop: "3px solid #FFD100", marginTop: 40 },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "40px 40px 24px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40 },
  logoCol: { display: "flex", flexDirection: "column", gap: 16 },
  logo: { height: 28 },
  about: { fontFamily: "'FuturaStd', sans-serif", fontWeight: 400, fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", maxWidth: 360 },
  social: { display: "flex", gap: 8 },
  socialIcon: { width: 32, height: 32, border: "1.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'FuturaStd', sans-serif", fontWeight: 700, fontSize: 9, color: "#fff", letterSpacing: "0.05em", cursor: "pointer" },
  col: { display: "flex", flexDirection: "column", gap: 8 },
  colTitle: { fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FFFFFF", marginBottom: 4 },
  link: { fontFamily: "'FuturaStd', sans-serif", fontWeight: 400, fontSize: 13, color: "#FFD100", textDecoration: "none", letterSpacing: "0.03em" },
  bottom: { borderTop: "1px solid rgba(255,255,255,0.1)", maxWidth: 1200, margin: "0 auto", padding: "16px 40px", display: "flex", justifyContent: "space-between", fontFamily: "'FuturaStd', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }
};

export function Footer({ onNav }) {
  return (
    <footer style={footerStyles.root}>
      <div style={footerStyles.inner}>
        <div style={footerStyles.logoCol}>
          <img src="../../assets/logo-white.png" alt="FlyFree Urban" style={footerStyles.logo} />
          <p style={footerStyles.about}>FLYFREE URBAN nace de nuestro amor por los deportes urbanos.<br/>Somos patinadores apasionados por el movimiento, la libertad y la cultura que rodea las actividades al aire libre.</p>
          <div style={footerStyles.social}>
            {["YT","IG","TK"].map(s => (
              <div key={s} style={footerStyles.socialIcon}>{s}</div>
            ))}
          </div>
        </div>
        <div style={footerStyles.col}>
          <div style={footerStyles.colTitle}>Contacto</div>
          <a href="mailto:flyfreeurban@gmail.com" style={footerStyles.link}>flyfreeurban@gmail.com</a>
          <a href="tel:+5491161097151" style={footerStyles.link}>+549 116109715</a>
        </div>
        <div style={footerStyles.col}>
          <div style={footerStyles.colTitle}>Enlaces</div>
          {["Inicio","Productos","Alquiler de Rollers","Legales"].map(item => (
            <a key={item} href="#" style={footerStyles.link}
              onClick={e => { e.preventDefault(); onNav && onNav(item.toLowerCase()); }}>
              {item}
            </a>
          ))}
        </div>
      </div>
      <div style={footerStyles.bottom}>
        <span>Copyright "flyFree" · 2025 · Todos los derechos reservados.</span>
        <span style={{ color: "#FFD100" }}>Always Rolling.</span>
      </div>
    </footer>
  );
}

if (typeof window !== 'undefined') Object.assign(window, { Footer });
