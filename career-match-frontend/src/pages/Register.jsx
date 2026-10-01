import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert(
        "Registration successful! A verification OTP has been sent to your email."
      );

      navigate("/verify-email", {
        state: {
          email: email,
        },
      });

    } catch (error) {
      console.error("Registration error:", error);

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
          Create your account and start your career journey
        </p>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
            />
          </div>

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
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              minLength="8"
              required
            />
          </div>

          <button type="submit">
            Create Account
          </button>

        </form>

        <p className="register-text">
          Already have an account?{" "}

          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default Register;