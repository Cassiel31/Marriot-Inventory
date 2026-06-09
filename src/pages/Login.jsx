import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { supabase } from "../lib/supabase";

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (userError || !userData) {
      alert("Invalid username");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: password
    });

    if (error) {
      alert(error.message);
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="auth-page">

      <button
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back
      </button>

      <div className="auth-card">

        <p className="auth-tag">
          GOA MARRIOTT
        </p>

        <h1 className="auth-title">
          Welcome Back
        </h1>

        <p className="auth-subtitle">
          Login to continue.
        </p>

        <div className="auth-form">

          <div className="input-group">

            <label>Username</label>

            <input
              type="text"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

          </div>

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          <button
            className="auth-button"
            onClick={handleLogin}
          >
            Login
          </button>

        </div>

        <p className="auth-switch">

          Don’t have an account?

          <Link
            to="/signup"
            className="auth-link"
          >
            Sign Up
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;