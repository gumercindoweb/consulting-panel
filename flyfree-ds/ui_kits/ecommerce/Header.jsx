// Header.jsx — FlyFree Urban Ecommerce Header

export function Header({ cartCount = 0, onNav }) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navItems = ["Inicio", "Tienda", "Eventos", "Vistanos"];

  return (
    <header style={headerStyles.root}>
      <div style={headerStyles.inner}>
        {/* Logo */}
        <a href="#" style={headerStyles.logoLink} onClick={e => { e.preventDefault(); onNav && onNav("home"); }}>
          <img src="../../assets/logo-white.png" alt="FlyFree Urban" style={headerStyles.logo} />
        </a>

        {/* Nav */}
        <nav style={headerStyles.nav}>
          {navItems.map(item => (
            <a key={item} href="#" style={headerStyles.navLink}
              onClick={e => { e.preventDefault(); onNav && onNav(item.toLowerCase()); }}>
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div style={headerStyles.actions}>
          <button style={headerStyles.iconBtn} title="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
          <a href="tel:+5491161097151" style={headerStyles.phone}>+549 116 109 7151</a>
          <button style={headerStyles.iconBtn} title="Carrito" onClick={() => onNav && onNav("cart")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            {cartCount > 0 && <span style={headerStyles.cartBadge}>{cartCount}</span>}
          </button>
          <button style={headerStyles.ctaBtn} onClick={() => onNav && onNav("contact")}>Contáctanos</button>
        </div>
      </div>
    </header>
  );
};

const headerStyles = {
  root: { background: "#231F20", borderBottom: "2px solid #FFD100", position: "sticky", top: 0, zIndex: 100 },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 24 },
  logoLink: { flexShrink: 0 },
  logo: { height: 28, display: "block" },
  nav: { display: "flex", gap: 4, marginLeft: 8 },
  navLink: { color: "#FFFFFF", textDecoration: "none", fontFamily: "'FuturaStd', sans-serif", fontWeight: 400, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", transition: "color 0.15s" },
  actions: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 },
  iconBtn: { background: "none", border: "none", color: "#FFFFFF", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", position: "relative" },
  cartBadge: { position: "absolute", top: 0, right: 0, background: "#FFD100", color: "#231F20", fontSize: 9, fontWeight: 700, borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  phone: { color: "#FFFFFF", textDecoration: "none", fontSize: 12, fontFamily: "'FuturaStd', sans-serif", letterSpacing: "0.05em" },
  ctaBtn: { background: "#FFD100", color: "#231F20", border: "none", fontFamily: "'FuturaStd', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "8px 16px", cursor: "pointer" }
};

if (typeof window !== 'undefined') Object.assign(window, { Header });
