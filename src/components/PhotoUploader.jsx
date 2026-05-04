import { useRef, useState } from "react";
import { api } from "../lib/supabase";

export default function PhotoUploader({ value = [], onUpload, maxFiles = 10 }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    const selected = Array.from(files || []).slice(0, Math.max(0, maxFiles - value.length));
    if (!selected.length) return;

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of selected) {
        const { data, error } = await api.uploadListingImage(file);
        if (error) throw error;
        if (data?.url) uploaded.push(data.url);
      }
      onUpload([...(value || []), ...uploaded].slice(0, maxFiles));
    } catch (err) {
      console.error("Photo upload error:", err);
      alert(err.message || "Photo upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removePhoto = (url) => {
    onUpload((value || []).filter((x) => x !== url));
  };

  return (
    <div style={{ border: "1px dashed #cbd5e1", borderRadius: 14, padding: 16, background: "#fff" }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || value.length >= maxFiles}
        style={{
          width: "100%",
          border: "0",
          borderRadius: 12,
          padding: "14px 16px",
          background: uploading ? "#e5e7eb" : "#fff7ed",
          color: "#1f2937",
          cursor: uploading ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        {uploading ? "Uploading photos..." : `📸 Upload photos (${value.length}/${maxFiles})`}
      </button>

      {!!value.length && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 10, marginTop: 12 }}>
          {value.map((url) => (
            <div key={url} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <img src={url} alt="Uploaded" style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  border: 0,
                  borderRadius: 999,
                  background: "rgba(0,0,0,.7)",
                  color: "#fff",
                  width: 24,
                  height: 24,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
