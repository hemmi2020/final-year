"use client";

import { useState, useRef } from "react";
import { Camera } from "lucide-react";

export default function AvatarUploader({ currentAvatar, userName, onUpload }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    if (file.size > MAX_SIZE) {
      setError("Image must be under 2 MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = async () => {
    if (!preview || uploading) return;
    setUploading(true);
    try {
      await onUpload(preview);
      setPreview(null);
    } catch {
      setError("Upload failed, please try again");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayImage = preview || currentAvatar;
  const initial = userName?.[0]?.toUpperCase() || "U";

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={() => !preview && fileRef.current?.click()}
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: displayImage ? "none" : "#FFF",
          border: "4px solid #FFF",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          fontWeight: 800,
          color: "var(--orange)",
          cursor: preview ? "default" : "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt="Avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initial
        )}
        {!preview && (
          <div
            className="avatar-hover-overlay"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
              borderRadius: "50%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
          >
            <Camera size={24} style={{ color: "#FFF" }} />
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {error && (
        <p
          style={{
            color: "var(--error, #EF4444)",
            fontSize: 12,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      {preview && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 8,
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleConfirm}
            disabled={uploading}
            className="btn-orange"
            style={{ padding: "6px 16px", fontSize: 12 }}
          >
            {uploading ? "Uploading..." : "Confirm"}
          </button>
          <button
            onClick={handleCancel}
            className="btn-outline"
            style={{ padding: "6px 16px", fontSize: 12 }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
