"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { communityAPI } from "@/lib/api";
import {
  MapPin,
  Heart,
  Copy,
  Search,
  Filter,
  Users,
  Calendar,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "budget-low", label: "Budget: Low → High" },
  { value: "budget-high", label: "Budget: High → Low" },
];

export default function CommunityPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const fetchTrips = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await communityAPI.getTrips({
        page: p,
        limit: 12,
        search,
        sort,
      });
      setTrips(data.data || []);
      setPagination(data.pagination || {});
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, [sort]);

  const handleLike = async (tripId) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    try {
      await communityAPI.like(tripId);
      fetchTrips(page);
    } catch {}
  };

  const handleClone = async (tripId) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    try {
      const { data } = await communityAPI.clone(tripId);
      router.push(`/trips/${data.data._id}`);
    } catch {}
  };

  const getLikeCount = (trip) =>
    (trip.tags || []).filter((t) => t.startsWith("like:")).length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            background: "var(--orange-bg)",
            borderRadius: 50,
            marginBottom: 16,
          }}
        >
          <Users size={16} style={{ color: "var(--orange)" }} />
          <span
            style={{ fontSize: 13, fontWeight: 600, color: "var(--orange)" }}
          >
            Community
          </span>
        </div>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: 12,
          }}
        >
          Explore Shared <span style={{ color: "var(--orange)" }}>Trips</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            color: "var(--text-secondary)",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          Discover trips shared by fellow travelers. Clone any trip to customize
          it for yourself.
        </p>
      </div>

      {/* Search + Sort */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 240, position: "relative" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTrips(1)}
            placeholder="Search destinations, trip names..."
            className="input-field"
            style={{ paddingLeft: 42 }}
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field"
          style={{ width: "auto", minWidth: 180, cursor: "pointer" }}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchTrips(1)}
          className="btn-orange"
          style={{ padding: "12px 24px", fontSize: 14 }}
        >
          Search
        </button>
      </div>

      {/* Trip Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="skeleton-card card"
              style={{ overflow: "hidden" }}
            >
              <div className="skeleton-img" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Globe
            size={56}
            style={{ color: "#D1D5DB", margin: "0 auto 16px" }}
          />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            No shared trips yet
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
            Be the first to share your trip with the community!
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="btn-orange"
            style={{ padding: "12px 28px", fontSize: 15 }}
          >
            Share a Trip
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {trips.map((trip) => (
            <div key={trip._id} className="card" style={{ overflow: "hidden" }}>
              {/* Card header gradient */}
              <div
                style={{
                  height: 140,
                  background:
                    "linear-gradient(135deg, #FF4500, #FF6B35, #F7C948)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <MapPin size={40} style={{ color: "rgba(255,255,255,0.3)" }} />
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  {trip.aiGenerated && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.2)",
                        color: "#FFF",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      ✨ AI
                    </span>
                  )}
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 99,
                      background: "rgba(255,255,255,0.2)",
                      color: "#FFF",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {trip.status}
                  </span>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                {/* Author */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--orange)",
                      color: "#FFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {trip.user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {trip.user?.name || "Traveler"}
                  </span>
                </div>

                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {trip.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <MapPin size={12} /> {trip.destination}
                </p>
                {trip.startDate && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Calendar size={12} />{" "}
                    {new Date(trip.startDate).toLocaleDateString()}
                    {trip.endDate &&
                      ` – ${new Date(trip.endDate).toLocaleDateString()}`}
                  </p>
                )}
                {trip.budget?.total > 0 && (
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--orange)",
                      marginTop: 4,
                    }}
                  >
                    {trip.budget.currency} {trip.budget.total}
                  </p>
                )}

                {/* Tags */}
                {trip.tags?.filter((t) => !t.startsWith("like:")).length >
                  0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      marginTop: 8,
                    }}
                  >
                    {trip.tags
                      .filter((t) => !t.startsWith("like:"))
                      .slice(0, 4)
                      .map((t) => (
                        <span
                          key={t}
                          style={{
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "var(--orange-bg)",
                            color: "var(--orange)",
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => handleLike(trip._id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px 0",
                      borderRadius: 50,
                      border: "1.5px solid var(--border)",
                      background: "#FFF",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-body)",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#EF4444";
                      e.currentTarget.style.color = "#EF4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-body)";
                    }}
                  >
                    <Heart size={15} /> {getLikeCount(trip)}
                  </button>
                  <button
                    onClick={() => handleClone(trip._id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px 0",
                      borderRadius: 50,
                      border: "1.5px solid var(--border)",
                      background: "#FFF",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-body)",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--orange)";
                      e.currentTarget.style.color = "var(--orange)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-body)";
                    }}
                  >
                    <Copy size={15} /> Clone
                  </button>
                  <button
                    onClick={() => router.push(`/community/${trip._id}`)}
                    className="btn-orange"
                    style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            marginTop: 40,
          }}
        >
          <button
            onClick={() => fetchTrips(page - 1)}
            disabled={page <= 1}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid var(--border)",
              background: "#FFF",
              cursor: page <= 1 ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchTrips(page + 1)}
            disabled={page >= pagination.pages}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid var(--border)",
              background: "#FFF",
              cursor: page >= pagination.pages ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: page >= pagination.pages ? 0.4 : 1,
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </div>
  );
}
