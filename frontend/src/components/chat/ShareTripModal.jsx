"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { groupsAPI, communityAPI } from "@/lib/api";
import { Copy, Mail, Globe, Check, Link, Users } from "lucide-react";

/**
 * ShareTripModal — share a generated trip via link, email, or community
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {string} props.tripTitle
 * @param {string|null} props.tripId
 */
export default function ShareTripModal({ isOpen, onClose, tripTitle, tripId }) {
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [postPublic, setPostPublic] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [toast, setToast] = useState(null);

  const shareLink = tripId
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/community/${tripId}`
    : "";

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyLink = async () => {
    if (!tripId) {
      showToast("Save your trip first to share it", "warning");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleSendInvite = async () => {
    if (!email.trim()) return;
    if (!tripId) {
      showToast("Save your trip first to share it", "warning");
      return;
    }
    setEmailSending(true);
    try {
      await groupsAPI.invite(tripId, email.trim());
      setEmailSent(true);
      setEmail("");
      showToast("Invite sent!", "success");
      setTimeout(() => setEmailSent(false), 2000);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to send invite";
      showToast(msg, "error");
    } finally {
      setEmailSending(false);
    }
  };

  const handlePublish = async () => {
    if (!tripId) {
      showToast("Save your trip first to share it", "warning");
      return;
    }
    setPublishing(true);
    try {
      await communityAPI.publish(tripId, { isPublic: postPublic });
      setPublished(true);
      showToast("Trip posted to community!", "success");
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to publish trip";
      showToast(msg, "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
    setLinkCopied(false);
    setPostPublic(false);
    setPublished(false);
    setToast(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div style={{ padding: "28px 28px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF4500, #FF6B35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <Users size={24} color="#FFF" />
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1F2937",
              margin: "0 0 6px",
            }}
          >
            Share This Trip
          </h2>
          {tripTitle && (
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                margin: 0,
                fontWeight: 500,
              }}
            >
              {tripTitle}
            </p>
          )}
        </div>

        {/* No tripId warning */}
        {!tripId && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 12,
              background: "#FFF7ED",
              border: "1px solid #FDBA74",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>💾</span>
            <p
              style={{
                fontSize: 14,
                color: "#9A3412",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Save your trip first to share it
            </p>
          </div>
        )}

        {/* ── Invite Link Section ── */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Link size={14} color="#FF4500" />
            Invite Link
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              readOnly
              value={tripId ? shareLink : "Save trip to generate link"}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #E5E7EB",
                fontSize: 13,
                color: tripId ? "#1F2937" : "#9CA3AF",
                background: "#F9FAFB",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={handleCopyLink}
              disabled={!tripId}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: linkCopied
                  ? "#10B981"
                  : "linear-gradient(135deg, #FF4500, #FF6B35)",
                color: "#FFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: tripId ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                opacity: tripId ? 1 : 0.5,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {linkCopied ? <Check size={14} /> : <Copy size={14} />}
              {linkCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* ── Invite by Email Section ── */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <Mail size={14} color="#FF4500" />
            Invite by Email
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendInvite();
              }}
              placeholder="friend@example.com"
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1.5px solid #E5E7EB",
                fontSize: 13,
                color: "#1F2937",
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FF4500")}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
            />
            <button
              onClick={handleSendInvite}
              disabled={!email.trim() || emailSending}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background:
                  email.trim() && !emailSending
                    ? emailSent
                      ? "#10B981"
                      : "linear-gradient(135deg, #FF4500, #FF6B35)"
                    : "#D1D5DB",
                color: "#FFF",
                fontSize: 13,
                fontWeight: 600,
                cursor:
                  email.trim() && !emailSending ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {emailSending ? (
                "Sending..."
              ) : emailSent ? (
                <>
                  <Check size={14} /> Sent!
                </>
              ) : (
                "Send Invite"
              )}
            </button>
          </div>
        </div>

        {/* ── Share to Community Toggle ── */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 12,
            border: "1.5px solid #E5E7EB",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Globe size={18} color="#FF4500" />
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1F2937",
                  margin: 0,
                }}
              >
                Post Publicly
              </p>
              <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>
                Share with the community
              </p>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={() => setPostPublic(!postPublic)}
            aria-label="Toggle post publicly"
            style={{
              width: 48,
              height: 26,
              borderRadius: 13,
              border: "none",
              background: postPublic ? "#FF4500" : "#D1D5DB",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#FFF",
                position: "absolute",
                top: 3,
                left: postPublic ? 25 : 3,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }}
            />
          </button>
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handlePublish}
            disabled={publishing || published || !tripId}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              border: "none",
              background: published
                ? "#10B981"
                : tripId
                  ? "linear-gradient(135deg, #FF4500, #FF6B35)"
                  : "#D1D5DB",
              color: "#FFF",
              fontSize: 14,
              fontWeight: 700,
              cursor:
                publishing || published || !tripId ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
              opacity: !tripId ? 0.5 : 1,
            }}
          >
            {publishing
              ? "Publishing..."
              : published
                ? "✓ Published!"
                : "Post to Community"}
          </button>
          <button
            onClick={handleClose}
            style={{
              padding: "12px 28px",
              borderRadius: 12,
              border: "1.5px solid #E5E7EB",
              background: "#FFF",
              color: "#374151",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#FF4500";
              e.currentTarget.style.color = "#FF4500";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.color = "#374151";
            }}
          >
            Done
          </button>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "10px 24px",
              borderRadius: 10,
              background:
                toast.type === "success"
                  ? "#10B981"
                  : toast.type === "error"
                    ? "#EF4444"
                    : toast.type === "warning"
                      ? "#F59E0B"
                      : "#6B7280",
              color: "#FFF",
              fontSize: 14,
              fontWeight: 600,
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              zIndex: 10000,
              animation: "fadeInUp 0.3s ease",
            }}
          >
            {toast.message}
          </div>
        )}
      </div>
    </Modal>
  );
}
