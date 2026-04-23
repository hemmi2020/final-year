"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { communityAPI, groupsAPI } from "@/lib/api";
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
  MessageCircle,
  Trash2,
  Send,
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "budget-low", label: "Budget: Low → High" },
  { value: "budget-high", label: "Budget: High → Low" },
];

const CITY_IMGS = {
  istanbul:
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80&fit=crop",
  paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80&fit=crop",
  dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80&fit=crop",
  tokyo:
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80&fit=crop",
  london:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80&fit=crop",
  bali: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80&fit=crop",
  rome: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80&fit=crop",
  barcelona:
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80&fit=crop",
  "new york":
    "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80&fit=crop",
  bangkok:
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80&fit=crop",
  maldives:
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80&fit=crop",
  marrakech:
    "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&q=80&fit=crop",
  singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80&fit=crop",
  karachi:
    "https://images.unsplash.com/photo-1572688824905-5b0e8c13e8d0?w=600&q=80&fit=crop",
  lahore:
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80&fit=crop",
  islamabad:
    "https://images.unsplash.com/photo-1603912699214-92627f304eb6?w=600&q=80&fit=crop",
  cairo:
    "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&q=80&fit=crop",
  sydney:
    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80&fit=crop",
};

function getCityImage(destination) {
  if (!destination) return null;
  const d = destination.toLowerCase();
  return (
    CITY_IMGS[d] ||
    Object.entries(CITY_IMGS).find(([k]) => d.includes(k))?.[1] ||
    null
  );
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function CommunityCardHeader({ trip }) {
  const imgUrl = trip.heroImage || getCityImage(trip.destination);
  return (
    <div
      style={{
        height: 160,
        position: "relative",
        overflow: "hidden",
        background: imgUrl
          ? `url(${imgUrl}) center/cover no-repeat`
          : "linear-gradient(135deg, #FF4500, #FF6B35, #F7C948)",
      }}
    >
      {!imgUrl && (
        <MapPin
          size={40}
          style={{
            color: "rgba(255,255,255,0.3)",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(transparent 50%, rgba(0,0,0,0.5))",
        }}
      />
      <div style={{ position: "absolute", bottom: 12, left: 14 }}>
        <p
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#FFF",
            margin: 0,
            textShadow: "0 1px 4px rgba(0,0,0,0.4)",
          }}
        >
          {trip.destination}
        </p>
      </div>
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
              background: "rgba(255,255,255,0.25)",
              color: "#FFF",
              fontSize: 11,
              fontWeight: 600,
              backdropFilter: "blur(4px)",
            }}
          >
            ✨ AI
          </span>
        )}
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 99,
            background: "rgba(255,255,255,0.25)",
            color: "#FFF",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "capitalize",
            backdropFilter: "blur(4px)",
          }}
        >
          {trip.status}
        </span>
      </div>
    </div>
  );
}

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
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [commentLoading, setCommentLoading] = useState({});

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

  const handleJoin = async (trip) => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    try {
      await groupsAPI.create({ name: trip.title, tripId: trip._id });
      alert("Joined! Check My Groups");
    } catch {
      alert("Could not join trip. Try again.");
    }
  };

  const getLikeCount = (trip) =>
    (trip.tags || []).filter((t) => t.startsWith("like:")).length;

  const getCommentCount = (trip) => (trip.comments || []).length;

  const toggleComments = (tripId) => {
    setExpandedComments((prev) => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  const handleAddComment = async (tripId) => {
    const text = (commentTexts[tripId] || "").trim();
    if (!text) return;
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    setCommentLoading((prev) => ({ ...prev, [tripId]: true }));
    try {
      const { data } = await communityAPI.addComment(tripId, text);
      setTrips((prev) =>
        prev.map((t) => (t._id === tripId ? { ...t, comments: data.data } : t)),
      );
      setCommentTexts((prev) => ({ ...prev, [tripId]: "" }));
    } catch {}
    setCommentLoading((prev) => ({ ...prev, [tripId]: false }));
  };

  const handleDeleteComment = async (tripId, commentId) => {
    if (!isAuthenticated) return;
    try {
      await communityAPI.deleteComment(tripId, commentId);
      setTrips((prev) =>
        prev.map((t) =>
          t._id === tripId
            ? {
                ...t,
                comments: (t.comments || []).filter((c) => c._id !== commentId),
              }
            : t,
        ),
      );
    } catch {}
  };

  const currentUserId = useAuthStore.getState().user?._id;

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
              {/* Card header — destination image or gradient fallback */}
              <CommunityCardHeader trip={trip} />

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
                    onClick={() => toggleComments(trip._id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px 0",
                      borderRadius: 50,
                      border: expandedComments[trip._id]
                        ? "1.5px solid var(--orange)"
                        : "1.5px solid var(--border)",
                      background: expandedComments[trip._id]
                        ? "var(--orange-bg)"
                        : "#FFF",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: expandedComments[trip._id]
                        ? "var(--orange)"
                        : "var(--text-body)",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--orange)";
                      e.currentTarget.style.color = "var(--orange)";
                    }}
                    onMouseLeave={(e) => {
                      if (!expandedComments[trip._id]) {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-body)";
                      }
                    }}
                  >
                    <MessageCircle size={15} /> {getCommentCount(trip)}
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
                    onClick={() => handleJoin(trip)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "8px 0",
                      borderRadius: 50,
                      border: "1.5px solid var(--orange)",
                      background: "var(--orange-bg)",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--orange)",
                      fontFamily: "inherit",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--orange)";
                      e.currentTarget.style.color = "#FFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--orange-bg)";
                      e.currentTarget.style.color = "var(--orange)";
                    }}
                  >
                    ✈️ Join Trip
                  </button>
                  <button
                    onClick={() => router.push(`/community/${trip._id}`)}
                    className="btn-orange"
                    style={{ flex: 1, padding: "8px 0", fontSize: 13 }}
                  >
                    View
                  </button>
                </div>

                {/* Comment Section */}
                {expandedComments[trip._id] && (
                  <div
                    style={{
                      marginTop: 16,
                      paddingTop: 16,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    {/* Comment input */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <input
                        value={commentTexts[trip._id] || ""}
                        onChange={(e) =>
                          setCommentTexts((prev) => ({
                            ...prev,
                            [trip._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddComment(trip._id)
                        }
                        placeholder="Write a comment..."
                        maxLength={500}
                        style={{
                          flex: 1,
                          padding: "8px 14px",
                          borderRadius: 50,
                          border: "1.5px solid var(--border)",
                          fontSize: 13,
                          fontFamily: "inherit",
                          outline: "none",
                          background: "#FFF",
                          color: "var(--text-primary)",
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(trip._id)}
                        disabled={
                          commentLoading[trip._id] ||
                          !(commentTexts[trip._id] || "").trim()
                        }
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          border: "none",
                          background: (commentTexts[trip._id] || "").trim()
                            ? "var(--orange)"
                            : "#E5E7EB",
                          color: "#FFF",
                          cursor: (commentTexts[trip._id] || "").trim()
                            ? "pointer"
                            : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s",
                          flexShrink: 0,
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </div>

                    {/* Comment list */}
                    <div
                      style={{
                        maxHeight: 240,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {(trip.comments || []).length === 0 ? (
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--text-muted)",
                            textAlign: "center",
                            padding: "12px 0",
                          }}
                        >
                          No comments yet. Be the first!
                        </p>
                      ) : (
                        (trip.comments || []).map((comment) => (
                          <div
                            key={comment._id}
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: "var(--orange)",
                                color: "#FFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {comment.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  marginBottom: 2,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  {comment.user?.name || "User"}
                                </span>
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {timeAgo(comment.createdAt)}
                                </span>
                              </div>
                              <p
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-body)",
                                  margin: 0,
                                  lineHeight: 1.4,
                                  wordBreak: "break-word",
                                }}
                              >
                                {comment.text}
                              </p>
                            </div>
                            {currentUserId &&
                              comment.user?._id === currentUserId && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(trip._id, comment._id)
                                  }
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--text-muted)",
                                    padding: 4,
                                    borderRadius: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "color 0.2s",
                                    flexShrink: 0,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#EF4444";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color =
                                      "var(--text-muted)";
                                  }}
                                  title="Delete comment"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
