import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { supabase } from "../lib/supabase";

function Signup() {

  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data.user) {
      alert("User not created");
      return;
    }

    const userId = data.user.id;

    const { error: insertError } = await supabase
      .from("users")
      .insert([
        {
          id: userId,
          name: fullName,
          username: username,
          email: email
        }
      ]);

    if (insertError) {
      alert(insertError.message);
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
          Welcome
        </h1>

        <p className="auth-subtitle">
          Create your inventory account.
        </p>

        <div className="auth-form">

          <div className="input-group">

            <label>Full Name</label>

            <input
              type="text"
              className="auth-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

          </div>

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

            <label>Email</label>

            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            onClick={handleSignup}
          >
            Create Account
          </button>

        </div>

        <p className="auth-switch">

          Already have an account?

          <Link
            to="/login"
            className="auth-link"
          >
            Login
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Signup;