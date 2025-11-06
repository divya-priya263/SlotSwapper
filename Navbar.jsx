// src/components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  function doLogout() {
    logout();
    nav("/login");
  }

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: 12 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link to="/" style={{ textDecoration: "none", color: "#111", fontWeight: 700 }}>SlotSwapper</Link>
        </div>
        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/marketplace">Marketplace</Link>
              <Link to="/requests">Requests</Link>
              <span style={{ marginLeft: 8 }}>{user.name || user.email}</span>
              <button onClick={doLogout} style={{ marginLeft: 8 }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
