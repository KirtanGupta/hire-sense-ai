"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

// ─── Toast Component ───────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", text: "#4ade80", icon: "✓" },
    error:   { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", text: "#f87171", icon: "✗" },
  };
  const c = colors[type] || colors.success;

  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      padding: "1rem 1.5rem",
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: "1rem",
      color: c.text,
      fontWeight: 600,
      fontSize: "0.95rem",
      display: "flex",
      alignItems: "center",
      gap: "0.6rem",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      animation: "slideUp 0.3s ease",
      maxWidth: "360px",
    }}>
      <span style={{ fontSize: "1.1rem" }}>{c.icon}</span>
      {message}
    </div>
  );
}

// ─── Section Card Wrapper ──────────────────────────────────────────────────────
function SettingsCard({ children, danger = false }) {
  return (
    <div style={{
      padding: "2rem",
      borderRadius: "1.5rem",
      background: danger ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${danger ? "rgba(248,113,113,0.2)" : "rgba(148,163,184,0.1)"}`,
      marginBottom: "1.5rem",
      transition: "border-color 0.2s",
    }}>
      {children}
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, danger = false }) {
  return (
    <div style={{ marginBottom: "1.75rem", paddingBottom: "1.25rem", borderBottom: `1px solid ${danger ? "rgba(248,113,113,0.15)" : "rgba(148,163,184,0.08)"}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
        <span style={{
          width: 38, height: 38, borderRadius: "0.75rem",
          background: danger ? "rgba(248,113,113,0.1)" : "rgba(99,102,241,0.12)",
          border: `1px solid ${danger ? "rgba(248,113,113,0.25)" : "rgba(99,102,241,0.25)"}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
        }}>{icon}</span>
        <h2 style={{ color: danger ? "#f87171" : "#f8fafc", fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      <p style={{ color: "#64748b", fontSize: "0.88rem", margin: 0, paddingLeft: "3.25rem" }}>{subtitle}</p>
    </div>
  );
}

// ─── Input Field ───────────────────────────────────────────────────────────────
function Field({ label, id, type = "text", value, onChange, placeholder, readOnly = false }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <label htmlFor={id} style={{ display: "block", color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "0.85rem 1.1rem",
          background: readOnly ? "rgba(148,163,184,0.04)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${readOnly ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.18)"}`,
          borderRadius: "0.85rem",
          color: readOnly ? "#475569" : "#f1f5f9",
          fontSize: "0.95rem",
          outline: "none",
          cursor: readOnly ? "default" : "text",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={e => { if (!readOnly) e.target.style.borderColor = "rgba(99,102,241,0.5)"; }}
        onBlur={e => { e.target.style.borderColor = readOnly ? "rgba(148,163,184,0.1)" : "rgba(148,163,184,0.18)"; }}
      />
    </div>
  );
}

// ─── Save Button ───────────────────────────────────────────────────────────────
function SaveBtn({ loading, label = "Save Changes", onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: "0.8rem 2rem",
        background: danger
          ? loading ? "rgba(248,113,113,0.4)" : "linear-gradient(135deg, #ef4444, #dc2626)"
          : loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff",
        border: "none",
        borderRadius: "0.85rem",
        fontWeight: 700,
        fontSize: "0.92rem",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        boxShadow: danger
          ? loading ? "none" : "0 4px 14px rgba(239,68,68,0.35)"
          : loading ? "none" : "0 4px 14px rgba(99,102,241,0.4)",
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {loading ? "⏳ Processing..." : label}
    </button>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, badge }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0.85rem 1rem", borderRadius: "0.75rem",
      background: "rgba(255,255,255,0.02)", marginBottom: "0.5rem",
    }}>
      <span style={{ color: "#64748b", fontSize: "0.88rem", fontWeight: 500 }}>{label}</span>
      {badge ? (
        <span style={{
          padding: "0.2rem 0.75rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: 600,
          background: badge === "Active" ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)",
          color: badge === "Active" ? "#4ade80" : "#f87171",
          border: `1px solid ${badge === "Active" ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`,
        }}>{badge}</span>
      ) : (
        <span style={{ color: "#f1f5f9", fontSize: "0.9rem", fontWeight: 500 }}>{value}</span>
      )}
    </div>
  );
}

// ─── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel, loading }) {
  const [pw, setPw] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid rgba(248,113,113,0.3)",
        borderRadius: "1.5rem", padding: "2.5rem", maxWidth: 440, width: "100%",
        boxShadow: "0 24px 80px rgba(248,113,113,0.15)",
        animation: "scaleIn 0.2s ease",
      }}>
        <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "1rem" }}>💀</div>
        <h3 style={{ color: "#f87171", fontSize: "1.3rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>
          Delete Account Permanently
        </h3>
        <p style={{ color: "#94a3b8", fontSize: "0.88rem", textAlign: "center", lineHeight: 1.65, marginBottom: "1.75rem" }}>
          This will <strong style={{ color: "#f87171" }}>permanently delete</strong> your account, all interview sessions, and your uploaded resume. This cannot be undone.
        </p>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
            Enter your password to confirm
          </label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Your current password"
            style={{
              width: "100%", padding: "0.85rem 1.1rem",
              background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: "0.85rem", color: "#f1f5f9", fontSize: "0.95rem", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "0.8rem", background: "rgba(148,163,184,0.08)",
              border: "1px solid rgba(148,163,184,0.15)", borderRadius: "0.85rem",
              color: "#94a3b8", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
            }}
          >Cancel</button>
          <SaveBtn loading={loading} label="Delete Forever" danger onClick={() => onConfirm(pw)} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Page ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const setAuthUser = useAuthStore((s) => s.setUser);

  // User data
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Revoke object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("Please select a valid image file (PNG, JPG, etc.).", "error");
        return;
      }
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        showToast("Image size cannot exceed 5MB.", "error");
        return;
      }
      
      setPendingFile(file);
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);
    }
  }

  function handleRemovePhoto() {
    setPendingFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setProfilePic("");
  }

  // Password form
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch user on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/user/profile", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setAuthUser(data.user);
          setProfileName(data.user.fullName || "");
          setProfilePic(data.user.profilePicture || "");
        }
      } catch {
        // silent
      } finally {
        setUserLoading(false);
      }
    }
    fetchUser();
  }, [setAuthUser]);

  // ── Save profile ────────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!profileName.trim()) return showToast("Full name cannot be empty.", "error");
    setProfileLoading(true);

    let finalProfilePic = profilePic;

    try {
      // 1. Upload pending avatar file if present
      if (pendingFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("avatar", pendingFile);

        const uploadRes = await fetch("/api/user/upload-avatar", {
          method: "POST",
          credentials: "include",
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          showToast(uploadData.message || "Failed to upload avatar image.", "error");
          setProfileLoading(false);
          return;
        }
        finalProfilePic = uploadData.profilePicture;
      }

      // 2. Save profile updates (name and avatar URL)
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName: profileName.trim(), profilePicture: finalProfilePic }),
      });

      const data = await res.json();
      if (data.success) {
        setUser(prev => ({ ...prev, fullName: profileName.trim(), profilePicture: finalProfilePic }));
        setAuthUser(data.user);
        setProfilePic(finalProfilePic);
        setPendingFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        showToast("Profile updated successfully!", "success");
      } else {
        showToast(data.message || "Failed to update profile.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Change password ─────────────────────────────────────────────────────────
  async function handleChangePassword() {
    if (!curPw || !newPw || !confirmPw) return showToast("All password fields are required.", "error");
    if (newPw.length < 8) return showToast("New password must be at least 8 characters.", "error");
    if (newPw !== confirmPw) return showToast("New passwords do not match.", "error");
    if (curPw === newPw) return showToast("New password must differ from current password.", "error");
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = await res.json();
      if (data.success) {
        setCurPw(""); setNewPw(""); setConfirmPw("");
        showToast("Password changed successfully!", "success");
      } else {
        showToast(data.message || "Failed to change password.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setPwLoading(false);
    }
  }

  // ── Delete account ──────────────────────────────────────────────────────────
  async function handleDeleteAccount(password) {
    if (!password) return showToast("Password is required.", "error");
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Account deleted. Redirecting...", "success");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        showToast(data.message || "Failed to delete account.", "error");
        setDeleteLoading(false);
      }
    } catch {
      showToast("Network error. Please try again.", "error");
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <DashboardShell title="Settings" subtitle="Manage your account, security, and preferences.">
        <div style={{ maxWidth: 720 }}>

          {/* ── Section 1: Profile Settings ─────────────────────────────────── */}
          <SettingsCard>
            <SectionHeader icon="👤" title="Profile Settings" subtitle="Update your display name and profile picture." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field
                  id="fullName"
                  label="Full Name"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div style={{ gridColumn: "1 / -1", marginBottom: "1.5rem" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                  Profile Picture
                </label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  padding: "1.25rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(148, 163, 184, 0.25)",
                  borderRadius: "1rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.background = "rgba(99,102,241,0.02)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.25)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                >
                  {/* File Input */}
                  <input
                    type="file"
                    id="avatarUploadInput"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  
                  {/* Upload Buttons */}
                  <div style={{ display: "flex", flexFlow: "row wrap", gap: "0.75rem" }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById("avatarUploadInput").click()}
                      style={{
                        padding: "0.6rem 1.2rem",
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        borderRadius: "0.75rem",
                        color: "#a5b4fc",
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.12)"; }}
                    >
                      Choose Photo
                    </button>
                    
                    {(profilePic || previewUrl) && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        style={{
                          padding: "0.6rem 1.2rem",
                          background: "rgba(248,113,113,0.08)",
                          border: "1px solid rgba(248,113,113,0.2)",
                          borderRadius: "0.75rem",
                          color: "#fca5a5",
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.15)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                  
                  <div style={{ color: "#64748b", fontSize: "0.8rem", lineHeight: 1.4 }}>
                    Supports PNG, JPG, JPEG, or WEBP.<br />Max size of 5MB.
                  </div>
                </div>
              </div>
            </div>
            {/* ── Live Profile Preview — always visible ── */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              marginBottom: "1.75rem",
              padding: "1.25rem 1.5rem",
              background: "rgba(99,102,241,0.06)",
              borderRadius: "1rem",
              border: "1px solid rgba(99,102,241,0.15)",
            }}>
              {/* Avatar — photo or initials fallback */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                {(previewUrl || profilePic) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl || profilePic}
                    alt="Preview"
                    onError={e => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                    style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(99,102,241,0.5)", display: "block" }}
                  />
                ) : null}
                {/* Initials fallback — shown when no URL or URL fails to load */}
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  border: "2px solid rgba(99,102,241,0.5)",
                  display: (previewUrl || profilePic) ? "none" : "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: "1.3rem",
                  letterSpacing: "-0.02em",
                }}>
                  {profileName ? profileName.charAt(0).toUpperCase() : "?"}
                </div>
              </div>

              {/* Text info */}
              <div>
                <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "1rem", margin: "0 0 0.2rem" }}>
                  {profileName || "Your Name"}
                </p>
                <p style={{ color: "#a5b4fc", fontSize: "0.82rem", margin: 0 }}>
                  {previewUrl
                    ? "✨ Pending save..."
                    : profilePic
                      ? "✓ Photo uploaded"
                      : "Using initials avatar — choose a photo above"}
                </p>
              </div>
            </div>

            <SaveBtn loading={profileLoading} onClick={handleSaveProfile} />
          </SettingsCard>

          {/* ── Section 2: Change Password ───────────────────────────────────── */}
          <SettingsCard>
            <SectionHeader icon="🔐" title="Change Password" subtitle="Use a strong password of at least 8 characters." />
            <Field
              id="curPw"
              label="Current Password"
              type="password"
              value={curPw}
              onChange={e => setCurPw(e.target.value)}
              placeholder="Enter your current password"
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
              <Field
                id="newPw"
                label="New Password"
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="Min. 8 characters"
              />
              <Field
                id="confirmPw"
                label="Confirm New Password"
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            {/* Password strength indicator */}
            {newPw.length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.4rem" }}>
                  {[1, 2, 3, 4].map(i => {
                    const strength = newPw.length >= 12 ? 4 : newPw.length >= 10 ? 3 : newPw.length >= 8 ? 2 : 1;
                    const colors = ["#f87171", "#f59e0b", "#34d399", "#4ade80"];
                    return (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 999,
                        background: i <= strength ? colors[strength - 1] : "rgba(148,163,184,0.15)",
                        transition: "background 0.3s",
                      }} />
                    );
                  })}
                </div>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: 0 }}>
                  {newPw.length < 8 ? "Too short" : newPw.length < 10 ? "Acceptable" : newPw.length < 12 ? "Good" : "Strong"} password
                </p>
              </div>
            )}
            {/* Match indicator */}
            {confirmPw.length > 0 && (
              <p style={{ color: newPw === confirmPw ? "#4ade80" : "#f87171", fontSize: "0.82rem", marginBottom: "1.25rem", marginTop: "-0.5rem" }}>
                {newPw === confirmPw ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
            <SaveBtn loading={pwLoading} label="Update Password" onClick={handleChangePassword} />
          </SettingsCard>

          {/* ── Section 3: Account Information ──────────────────────────────── */}
          <SettingsCard>
            <SectionHeader icon="📋" title="Account Information" subtitle="Your account details — read only." />
            {userLoading ? (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: 48, borderRadius: "0.75rem", background: "rgba(148,163,184,0.05)", animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : (
              <>
                <InfoRow label="Registered Email" value={user?.email || "—"} />
                <InfoRow label="Account Role" value={user?.role === "admin" ? "👑 Administrator" : "🧑 Candidate"} />
                <InfoRow label="Member Since" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"} />
                <InfoRow label="Account Status" badge={user?.isBlocked ? "Blocked" : "Active"} />
              </>
            )}
          </SettingsCard>

          {/* ── Section 4: Danger Zone ───────────────────────────────────────── */}
          <SettingsCard danger>
            <SectionHeader icon="⚠️" title="Danger Zone" subtitle="Irreversible actions that affect your entire account." danger />
            <div style={{
              padding: "1.25rem 1.5rem",
              background: "rgba(248,113,113,0.05)",
              border: "1px solid rgba(248,113,113,0.15)",
              borderRadius: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}>
              <div>
                <p style={{ color: "#f1f5f9", fontWeight: 600, margin: "0 0 0.3rem" }}>Delete My Account</p>
                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0 }}>
                  Permanently deletes your profile, all interviews, and your resume. Cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  padding: "0.7rem 1.4rem",
                  background: "transparent",
                  border: "1px solid rgba(248,113,113,0.4)",
                  borderRadius: "0.85rem",
                  color: "#f87171",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                🗑️ Delete Account
              </button>
            </div>
          </SettingsCard>

        </div>
      </DashboardShell>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          loading={deleteLoading}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
          -webkit-text-fill-color: #f1f5f9 !important;
        }
      `}</style>
    </>
  );
}
