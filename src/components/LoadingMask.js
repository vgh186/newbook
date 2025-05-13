import React from "react";
import "../App.css";

export default function LoadingMask({ show = false, text = "加载中..." }) {
  if (!show) return null;
  return (
    <div className="loading-mask">
      <div className="loading-spinner" />
      <div style={{ marginTop: 18, color: "#333", fontWeight: 600 }}>{text}</div>
    </div>
  );
}
