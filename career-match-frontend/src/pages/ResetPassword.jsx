import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/reset-password?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(
          otp
        )}&newPassword=${encodeURIComponent(
          newPassword
        )}`,
        {
          method: "POST",
        }
      );

      const message = await response.text();

      if (!response.ok) {
        alert(message || "Password reset failed.");
        return;
      }

      alert(
        "Password reset successfully! You can now login."
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "Reset password error:",
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

        <p className="login-subtitle">
          Enter the OTP sent to:
        </p>

        <p
          style={{
            textAlign: "center",
            fontWeight: "600",
            marginBottom: "24px",
          }}
        >
          {email}
        </p>

        <form onSubmit={handleResetPassword}>

          <div className="form-group">
            <label>Verification OTP</label>

            <input
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>New Password</label>

            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              minLength="8"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              minLength="8"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
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

export default ResetPassword;