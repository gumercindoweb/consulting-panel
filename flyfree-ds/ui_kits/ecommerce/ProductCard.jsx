// ProductCard.jsx — FlyFree Urban Ecommerce Product Card

export function ProductCard({ name, category, price, badge, img, onAdd, onDetail }) {
  const [wished, setWished] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    onAdd && onAdd({ name, price });
  };

  return (
    <div style={cardStyles.root} onClick={onDetail}>
      <div style={cardStyles.imgWrap}>
        {img
          ? <img src={img} alt={name} style={cardStyles.img} />
          : <div style={cardStyles.imgPlaceholder}>
              <span style={cardStyles.imgPlaceholderText}>{name}</span>
            </div>
        }
        {badge && <div style={{ ...cardStyles.badge, ...(badge === "Oferta" ? cardStyles.badgeDark : {}) }}>{badge}</div>}
        <button style={cardStyles.wishBtn} onClick={e => { e.stopPropagation(); setWished(w => !w); }}>
          {wished ? "♥" : "♡"}
        </button>
      </div>
      <div style={cardStyles.body}>
        <div style={cardStyles.category}>{category}</div>
        <div style={cardStyles.name}>{name}</div>
        <div style={cardStyles.price}>{price}</div>
      </div>
      <div style={cardStyles.footer}>
        <button style={{ ...cardStyles.addBtn, ...(added ? cardStyles.addBtnDone : {}) }}
          onClick={e => { e.stopPropagation(); handleAdd(); }}>
          {added ? "✓ Agregado" : "Agregar al carrito"}
        </button>
      </div>
    </div>
  );
};

const cardStyles = {
  root: { background: "#FFFFFF", border: "1.5px solid #231F20", boxShadow: "4px 4px 0 #231F20", display: "flex", flexDirection: "column", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", width: "100%" },
  imgWrap: { position: "relative", background: "#f5f5f5", borderBottom: "1.5px solid #231F20", height: 180, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "contain" },
  imgPlaceholder: { background: "#231F20", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 },
  imgPlaceholderText: { fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 900, fontSize: 24, color: "#FFD100", textTransform: "uppercase", textAlign: "center", lineHeight: 1, letterSpacing: "-0.01em" },
  badge: { position: "absolute", top: 10, left: 0, background: "#FFD100", color: "#231F20", fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 10px" },
  badgeDark: { background: "#231F20", color: "#FFD100" },
  wishBtn: { position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.9)", border: "1.5px solid #231F20", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: "#231F20", fontFamily: "sans-serif" },
  body: { padding: "10px 12px 6px", display: "flex", flexDirection: "column", gap: 3, flex: 1 },
  category: { fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 400, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#888" },
  name: { fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 700, fontSize: 16, textTransform: "uppercase", color: "#231F20", letterSpacing: "0.01em", lineHeight: 1.1, fontStyle: "normal", transform: "skewX(-9deg)", transformOrigin: "left bottom", display: "inline-block" },
  price: { fontFamily: "'FuturaStdCondensed', sans-serif", fontWeight: 900, fontSize: 22, color: "#231F20", letterSpacing: "-0.01em", marginTop: 4 },
  footer: { borderTop: "1.5px solid #231F20" },
  addBtn: { width: "100%", background: "#FFD100", border: "none", color: "#231F20", fontFamily: "'FuturaStd', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px", cursor: "pointer", transition: "background 0.15s" },
  addBtnDone: { background: "#231F20", color: "#FFD100" }
};

if (typeof window !== 'undefined') Object.assign(window, { ProductCard });
