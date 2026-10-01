import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/verify-email?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(otp)}`,
        {
          method: "POST",
        }
      );

      const message = await response.text();

      if (!response.ok) {
        alert(message || "OTP verification failed.");
        return;
      }

      alert("Email verified successfully! You can now login.");

      navigate("/login");

    } catch (error) {
      console.error("OTP verification error:", error);

      alert(
        "Unable to connect to CareerMatch AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      alert("Email address not found. Please register again.");
      navigate("/register");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/resend-otp?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
        }
      );

      const message = await response.text();

      if (!response.ok) {
        alert(message || "Unable to resend OTP.");
        return;
      }

      alert("A new OTP has been sent to your email.");

    } catch (error) {
      console.error("Resend OTP error:", error);

      alert(
        "Unable to connect to CareerMatch AI backend."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>CareerMatch AI</h1>

        <p className="login-subtitle">
          Verify your email address
        </p>

        <p className="login-subtitle">
          Enter the 6-digit OTP sent to:
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

        <form onSubmit={handleVerify}>

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

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Verifying..."
              : "Verify Email"}
          </button>

        </form>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending}
          style={{
            width: "100%",
            marginTop: "12px",
          }}
        >
          {resending
            ? "Sending..."
            : "Resend OTP"}
        </button>

        <p className="register-text">

          Already verified?{" "}

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

export default VerifyEmail;