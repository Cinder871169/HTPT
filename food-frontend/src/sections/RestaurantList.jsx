import { useState, useEffect } from "react";
import { Star, Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { restaurantAPI } from "../services/api";
import MenuModal from "./MenuModal";

const CUISINES = [
  "Tất cả",
  "Món Việt",
  "Pizza",
  "Nhật Bản",
  "Fast Food",
  "Cơm Tấm",
  "Trung Hoa",
];

export default function RestaurantList({ searchQuery, onToast }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [cuisine, setCuisine] = useState("Tất cả");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await restaurantAPI.getAll();
        setRestaurants(res.data?.data || []);
      } catch (err) {
        console.error("Error loading restaurants:", err);
        onToast &&
          onToast("Không thể tải danh sách nhà hàng từ hệ thống.", "error");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [onToast]);

  const filtered = restaurants
    .filter((r) => r.isActive !== false)
    .filter((r) => cuisine === "Tất cả" || r.cuisine?.includes(cuisine))
    .filter(
      (r) =>
        !searchQuery ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine || '')?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <section
      id="restaurant-list"
      style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}
    >
      {/* Section header */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 32,
            fontWeight: 800,
            color: "var(--text-dark)",
            marginBottom: 6,
          }}
        >
          {searchQuery ? `Kết quả cho "${searchQuery}"` : "Nhà hàng nổi bật"}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 16 }}>
          Khám phá ẩm thực đa dạng từ khắp nơi
        </p>
      </div>

      {/* Cuisine filter */}
      {!searchQuery && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              style={{
                padding: "8px 18px",
                borderRadius: 50,
                border: `1.5px solid ${cuisine === c ? "var(--primary)" : "var(--border)"}`,
                background: cuisine === c ? "var(--primary)" : "#fff",
                color: cuisine === c ? "#fff" : "var(--text-muted)",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                transition: "all .15s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card" style={{ overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 180 }} />
              <div style={{ padding: 20 }}>
                <div
                  className="skeleton"
                  style={{ height: 20, borderRadius: 8, marginBottom: 10 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 14, borderRadius: 8, width: "60%" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "var(--text-muted)",
          }}
        >
          <UtensilsCrossed
            size={56}
            style={{ opacity: 0.3, marginBottom: 16 }}
          />
          <p style={{ fontWeight: 600, fontSize: 18 }}>
            Không tìm thấy nhà hàng
          </p>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Thử từ khoá khác hoặc bỏ bộ lọc
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {filtered.map((r) => (
            <div
              key={r._id}
              className="card"
              style={{ cursor: "pointer", overflow: "hidden" }}
              onClick={() => setSelected(r)}
            >
              {/* Cover */}
              <div
                style={{
                  height: 180,
                  background: `linear-gradient(135deg, ${r.color || "#d1fae5"}, ${r.color2 || "#a7f3d0"})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 72,
                  position: "relative",
                }}
              >
                {r.emoji || "🍽️"}
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "rgba(0,0,0,.4)",
                    backdropFilter: "blur(6px)",
                    borderRadius: 50,
                    padding: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Star size={12} fill="#fbbf24" color="#fbbf24" />
                  <span
                    style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}
                  >
                    {r.rating}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: "18px 20px" }}>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>
                  {r.name}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontWeight: 500,
                    marginBottom: 12,
                  }}
                >
                  {Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine}
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    <Clock size={13} />
                    {r.deliveryTime} phút
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      color: "var(--text-muted)",
                    }}
                  >
                    <MapPin size={13} />
                    {r.address}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 16px",
                    background: "var(--primary)",
                    borderRadius: 50,
                    textAlign: "center",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 14,
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--primary-light)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--primary)")
                  }
                >
                  Xem thực đơn
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <MenuModal
          restaurant={selected}
          onClose={() => setSelected(null)}
          onToast={onToast}
        />
      )}
    </section>
  );
}
