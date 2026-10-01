import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.message || "Login failed";

        if (
          message.toLowerCase().includes(
            "verify your email"
          )
        ) {
          alert(
            "Please verify your email before logging in."
          );

          navigate("/verify-email", {
            state: {
              email: email,
            },
          });

          return;
        }

        alert(message);
        return;
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
        })
      );

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      alert(
        "Unable to connect to CareerMatch AI backend."
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>CareerMatch AI</h1>

        <p className="login-subtitle">
          AI-powered resume and career matching
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />
          </div>

          <button type="submit">
            Login
          </button>

        </form>

        <p
          className="register-text"
          style={{
            marginTop: "14px",
          }}
        >
          <span
            onClick={() =>
              navigate("/forgot-password")
            }
            style={{
              cursor: "pointer",
            }}
          >
            Forgot Password?
          </span>
        </p>

        <p className="register-text">
          Don't have an account?{" "}

          <span
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;