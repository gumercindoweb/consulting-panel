/* @ds-bundle: {"format":3,"namespace":"FlyFreeUrbanDesignSystem_019dd7","components":[{"name":"Footer","sourcePath":"ui_kits/ecommerce/Footer.jsx"},{"name":"Header","sourcePath":"ui_kits/ecommerce/Header.jsx"},{"name":"Hero","sourcePath":"ui_kits/ecommerce/Hero.jsx"},{"name":"ProductCard","sourcePath":"ui_kits/ecommerce/ProductCard.jsx"}],"sourceHashes":{"ui_kits/ecommerce/Footer.jsx":"fcff09b47b61","ui_kits/ecommerce/Header.jsx":"ec0e93defdd1","ui_kits/ecommerce/Hero.jsx":"2785417d880f","ui_kits/ecommerce/ProductCard.jsx":"cd89f67eb5a0"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FlyFreeUrbanDesignSystem_019dd7 = window.FlyFreeUrbanDesignSystem_019dd7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/ecommerce/Footer.jsx
try { (() => {
// Footer.jsx — FlyFree Urban Footer

const footerStyles = {
  root: {
    background: "#231F20",
    borderTop: "3px solid #FFD100",
    marginTop: 40
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "40px 40px 24px",
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 40
  },
  logoCol: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  logo: {
    height: 28
  },
  about: {
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 400,
    fontSize: 13,
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.65)",
    maxWidth: 360
  },
  social: {
    display: "flex",
    gap: 8
  },
  socialIcon: {
    width: 32,
    height: 32,
    border: "1.5px solid rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 700,
    fontSize: 9,
    color: "#fff",
    letterSpacing: "0.05em",
    cursor: "pointer"
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  colTitle: {
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    marginBottom: 4
  },
  link: {
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 400,
    fontSize: 13,
    color: "#FFD100",
    textDecoration: "none",
    letterSpacing: "0.03em"
  },
  bottom: {
    borderTop: "1px solid rgba(255,255,255,0.1)",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    fontFamily: "'FuturaStd', sans-serif",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "0.05em"
  }
};
function Footer({
  onNav
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: footerStyles.root
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.logoCol
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-white.png",
    alt: "FlyFree Urban",
    style: footerStyles.logo
  }), /*#__PURE__*/React.createElement("p", {
    style: footerStyles.about
  }, "FLYFREE URBAN nace de nuestro amor por los deportes urbanos.", /*#__PURE__*/React.createElement("br", null), "Somos patinadores apasionados por el movimiento, la libertad y la cultura que rodea las actividades al aire libre."), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.social
  }, ["YT", "IG", "TK"].map(s => /*#__PURE__*/React.createElement("div", {
    key: s,
    style: footerStyles.socialIcon
  }, s)))), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colTitle
  }, "Contacto"), /*#__PURE__*/React.createElement("a", {
    href: "mailto:flyfreeurban@gmail.com",
    style: footerStyles.link
  }, "flyfreeurban@gmail.com"), /*#__PURE__*/React.createElement("a", {
    href: "tel:+5491161097151",
    style: footerStyles.link
  }, "+549 116109715")), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colTitle
  }, "Enlaces"), ["Inicio", "Productos", "Alquiler de Rollers", "Legales"].map(item => /*#__PURE__*/React.createElement("a", {
    key: item,
    href: "#",
    style: footerStyles.link,
    onClick: e => {
      e.preventDefault();
      onNav && onNav(item.toLowerCase());
    }
  }, item)))), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.bottom
  }, /*#__PURE__*/React.createElement("span", null, "Copyright \"flyFree\" \xB7 2025 \xB7 Todos los derechos reservados."), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#FFD100"
    }
  }, "Always Rolling.")));
}
if (typeof window !== 'undefined') Object.assign(window, {
  Footer
});
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ecommerce/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ecommerce/Header.jsx
try { (() => {
// Header.jsx — FlyFree Urban Ecommerce Header

function Header({
  cartCount = 0,
  onNav
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navItems = ["Inicio", "Tienda", "Eventos", "Vistanos"];
  return /*#__PURE__*/React.createElement("header", {
    style: headerStyles.root
  }, /*#__PURE__*/React.createElement("div", {
    style: headerStyles.inner
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: headerStyles.logoLink,
    onClick: e => {
      e.preventDefault();
      onNav && onNav("home");
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-white.png",
    alt: "FlyFree Urban",
    style: headerStyles.logo
  })), /*#__PURE__*/React.createElement("nav", {
    style: headerStyles.nav
  }, navItems.map(item => /*#__PURE__*/React.createElement("a", {
    key: item,
    href: "#",
    style: headerStyles.navLink,
    onClick: e => {
      e.preventDefault();
      onNav && onNav(item.toLowerCase());
    }
  }, item))), /*#__PURE__*/React.createElement("div", {
    style: headerStyles.actions
  }, /*#__PURE__*/React.createElement("button", {
    style: headerStyles.iconBtn,
    title: "Buscar"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  }))), /*#__PURE__*/React.createElement("a", {
    href: "tel:+5491161097151",
    style: headerStyles.phone
  }, "+549 116 109 7151"), /*#__PURE__*/React.createElement("button", {
    style: headerStyles.iconBtn,
    title: "Carrito",
    onClick: () => onNav && onNav("cart")
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "21",
    r: "1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "20",
    cy: "21",
    r: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
  })), cartCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: headerStyles.cartBadge
  }, cartCount)), /*#__PURE__*/React.createElement("button", {
    style: headerStyles.ctaBtn,
    onClick: () => onNav && onNav("contact")
  }, "Cont\xE1ctanos"))));
}
;
const headerStyles = {
  root: {
    background: "#231F20",
    borderBottom: "2px solid #FFD100",
    position: "sticky",
    top: 0,
    zIndex: 100
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    height: 56,
    display: "flex",
    alignItems: "center",
    gap: 24
  },
  logoLink: {
    flexShrink: 0
  },
  logo: {
    height: 28,
    display: "block"
  },
  nav: {
    display: "flex",
    gap: 4,
    marginLeft: 8
  },
  navLink: {
    color: "#FFFFFF",
    textDecoration: "none",
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 400,
    fontSize: 13,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    padding: "4px 10px",
    transition: "color 0.15s"
  },
  actions: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#FFFFFF",
    cursor: "pointer",
    padding: 6,
    display: "flex",
    alignItems: "center",
    position: "relative"
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    background: "#FFD100",
    color: "#231F20",
    fontSize: 9,
    fontWeight: 700,
    borderRadius: "50%",
    width: 14,
    height: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  phone: {
    color: "#FFFFFF",
    textDecoration: "none",
    fontSize: 12,
    fontFamily: "'FuturaStd', sans-serif",
    letterSpacing: "0.05em"
  },
  ctaBtn: {
    background: "#FFD100",
    color: "#231F20",
    border: "none",
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "8px 16px",
    cursor: "pointer"
  }
};
if (typeof window !== 'undefined') Object.assign(window, {
  Header
});
Object.assign(__ds_scope, { Header });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ecommerce/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ecommerce/Hero.jsx
try { (() => {
// Hero.jsx — FlyFree Urban Homepage Hero

const heroStyles = {
  root: {
    position: "relative",
    background: "#231F20",
    minHeight: 420,
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    borderBottom: "3px solid #FFD100"
  },
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url('../../assets/community-photo.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center 30%",
    opacity: 0.35
  },
  content: {
    position: "relative",
    zIndex: 2,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "60px 40px",
    width: "100%"
  },
  tagline: {
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 400,
    fontSize: 13,
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    color: "#FFD100",
    marginBottom: 8
  },
  title: {
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 900,
    fontSize: 88,
    lineHeight: 0.88,
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start"
  },
  titleLine: {
    position: "relative",
    display: "inline-block"
  },
  italic: {
    display: "inline-block",
    transform: "skewX(-12deg)",
    transformOrigin: "left bottom"
  },
  speedLines: {
    position: "absolute",
    left: -34,
    top: "16%",
    width: 26,
    height: "66%",
    background: "repeating-linear-gradient(to bottom, #FFD100 0, #FFD100 5px, transparent 5px, transparent 12px)",
    transform: "skewX(-12deg)"
  },
  sub: {
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 400,
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 32
  },
  btns: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap"
  },
  btnPrimary: {
    background: "#FFD100",
    color: "#231F20",
    border: "none",
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "12px 24px",
    cursor: "pointer",
    boxShadow: "4px 4px 0 rgba(255,255,255,0.2)"
  },
  btnOutline: {
    background: "transparent",
    color: "#FFFFFF",
    border: "2px solid #FFFFFF",
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "12px 24px",
    cursor: "pointer"
  },
  chevronDecor: {
    position: "absolute",
    right: -20,
    top: "50%",
    transform: "translateY(-50%)",
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 900,
    fontSize: 280,
    color: "rgba(255,209,0,0.07)",
    lineHeight: 1,
    userSelect: "none",
    zIndex: 1,
    letterSpacing: "-0.1em"
  }
};
function Hero({
  onShop
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: heroStyles.root
  }, /*#__PURE__*/React.createElement("div", {
    style: heroStyles.overlay
  }), /*#__PURE__*/React.createElement("div", {
    style: heroStyles.content
  }, /*#__PURE__*/React.createElement("div", {
    style: heroStyles.tagline
  }, "Always Rolling"), /*#__PURE__*/React.createElement("h1", {
    style: heroStyles.title
  }, /*#__PURE__*/React.createElement("span", {
    style: heroStyles.titleLine
  }, /*#__PURE__*/React.createElement("span", {
    style: heroStyles.speedLines
  }), /*#__PURE__*/React.createElement("span", {
    style: heroStyles.italic
  }, "Rollers")), /*#__PURE__*/React.createElement("span", {
    style: heroStyles.italic
  }, "Urbanos")), /*#__PURE__*/React.createElement("p", {
    style: heroStyles.sub
  }, "Equipamiento para todos los niveles y edades"), /*#__PURE__*/React.createElement("div", {
    style: heroStyles.btns
  }, /*#__PURE__*/React.createElement("button", {
    style: heroStyles.btnPrimary,
    onClick: onShop
  }, "Ver Tienda >>"), /*#__PURE__*/React.createElement("button", {
    style: heroStyles.btnOutline
  }, "Alquiler de Rollers"))), /*#__PURE__*/React.createElement("div", {
    style: heroStyles.chevronDecor
  }, ">>"));
}
if (typeof window !== 'undefined') Object.assign(window, {
  Hero
});
Object.assign(__ds_scope, { Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ecommerce/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ecommerce/ProductCard.jsx
try { (() => {
// ProductCard.jsx — FlyFree Urban Ecommerce Product Card

function ProductCard({
  name,
  category,
  price,
  badge,
  img,
  onAdd,
  onDetail
}) {
  const [wished, setWished] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    onAdd && onAdd({
      name,
      price
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: cardStyles.root,
    onClick: onDetail
  }, /*#__PURE__*/React.createElement("div", {
    style: cardStyles.imgWrap
  }, img ? /*#__PURE__*/React.createElement("img", {
    src: img,
    alt: name,
    style: cardStyles.img
  }) : /*#__PURE__*/React.createElement("div", {
    style: cardStyles.imgPlaceholder
  }, /*#__PURE__*/React.createElement("span", {
    style: cardStyles.imgPlaceholderText
  }, name)), badge && /*#__PURE__*/React.createElement("div", {
    style: {
      ...cardStyles.badge,
      ...(badge === "Oferta" ? cardStyles.badgeDark : {})
    }
  }, badge), /*#__PURE__*/React.createElement("button", {
    style: cardStyles.wishBtn,
    onClick: e => {
      e.stopPropagation();
      setWished(w => !w);
    }
  }, wished ? "♥" : "♡")), /*#__PURE__*/React.createElement("div", {
    style: cardStyles.body
  }, /*#__PURE__*/React.createElement("div", {
    style: cardStyles.category
  }, category), /*#__PURE__*/React.createElement("div", {
    style: cardStyles.name
  }, name), /*#__PURE__*/React.createElement("div", {
    style: cardStyles.price
  }, price)), /*#__PURE__*/React.createElement("div", {
    style: cardStyles.footer
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...cardStyles.addBtn,
      ...(added ? cardStyles.addBtnDone : {})
    },
    onClick: e => {
      e.stopPropagation();
      handleAdd();
    }
  }, added ? "✓ Agregado" : "Agregar al carrito")));
}
;
const cardStyles = {
  root: {
    background: "#FFFFFF",
    border: "1.5px solid #231F20",
    boxShadow: "4px 4px 0 #231F20",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    transition: "transform 0.15s, box-shadow 0.15s",
    width: "100%"
  },
  imgWrap: {
    position: "relative",
    background: "#f5f5f5",
    borderBottom: "1.5px solid #231F20",
    height: 180,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  },
  imgPlaceholder: {
    background: "#231F20",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12
  },
  imgPlaceholderText: {
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 900,
    fontSize: 24,
    color: "#FFD100",
    textTransform: "uppercase",
    textAlign: "center",
    lineHeight: 1,
    letterSpacing: "-0.01em"
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 0,
    background: "#FFD100",
    color: "#231F20",
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    padding: "3px 10px"
  },
  badgeDark: {
    background: "#231F20",
    color: "#FFD100"
  },
  wishBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(255,255,255,0.9)",
    border: "1.5px solid #231F20",
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 14,
    color: "#231F20",
    fontFamily: "sans-serif"
  },
  body: {
    padding: "10px 12px 6px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    flex: 1
  },
  category: {
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 400,
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#888"
  },
  name: {
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 700,
    fontSize: 16,
    textTransform: "uppercase",
    color: "#231F20",
    letterSpacing: "0.01em",
    lineHeight: 1.1,
    fontStyle: "normal",
    transform: "skewX(-9deg)",
    transformOrigin: "left bottom",
    display: "inline-block"
  },
  price: {
    fontFamily: "'FuturaStdCondensed', sans-serif",
    fontWeight: 900,
    fontSize: 22,
    color: "#231F20",
    letterSpacing: "-0.01em",
    marginTop: 4
  },
  footer: {
    borderTop: "1.5px solid #231F20"
  },
  addBtn: {
    width: "100%",
    background: "#FFD100",
    border: "none",
    color: "#231F20",
    fontFamily: "'FuturaStd', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "10px",
    cursor: "pointer",
    transition: "background 0.15s"
  },
  addBtnDone: {
    background: "#231F20",
    color: "#FFD100"
  }
};
if (typeof window !== 'undefined') Object.assign(window, {
  ProductCard
});
Object.assign(__ds_scope, { ProductCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ecommerce/ProductCard.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Header = __ds_scope.Header;

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.ProductCard = __ds_scope.ProductCard;

})();
