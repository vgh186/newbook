import React, { useState } from "react";

// 你的专属账号和密码
const USERNAME = "15959154172";
const PASSWORD = "xiaozhu22";

export default function PhoneAuth({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === USERNAME && password === PASSWORD) {
      // 本地保存登录状态（可选）
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("username", username); // 新增，保存用户名
      onLogin();
    } else {
      setError("账号或密码错误！");
    }
  };

  return (
    <div style={{ maxWidth: 350, margin: "80px auto" }}>
      <h2>账号密码登录</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="账号"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button type="submit" style={{ width: "100%" }}>
          登录
        </button>
      </form>
    </div>
  );
}