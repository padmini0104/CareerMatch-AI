import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/forgot-password?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
        }
      );

      const message = await response.text();

      if (!response.ok) {
        alert(message || "Unable to send OTP.");
        return;
      }

      alert(
        "Password reset OTP has been sent to your email."
      );

      navigate("/reset-password", {
        state: {
          email: email,
        },
      });

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      alert(
        "Unable to connect to CareerMatch AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>CareerMatch AI</h1>

        <p className="login-subtitle">
          Reset your password
        </p>

        <form onSubmit={handleForgotPassword}>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send OTP"}
          </button>

        </form>

        <p className="register-text">

          Remember your password?{" "}

          <span
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </span>

        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;