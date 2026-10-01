import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOtp, setDeleteOtp] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    loadDashboardData(token);
  }, [navigate]);

  const loadDashboardData = async (token) => {
    try {
      const [resumeResponse, jobResponse] = await Promise.all([
        fetch("${API_BASE_URL}/api/resumes/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch("${API_BASE_URL}/api/jobs/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (
        resumeResponse.status === 401 ||
        jobResponse.status === 401
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const resumeData = await resumeResponse.json();
      const jobData = await jobResponse.json();

      setResumes(
        Array.isArray(resumeData)
          ? resumeData
          : []
      );

      setJobs(
        Array.isArray(jobData)
          ? jobData
          : []
      );

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const handleSendDeleteOtp = async () => {
    if (!user?.email) {
      alert("User email not found.");
      return;
    }

    setOtpSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/delete-account/send-otp?email=${encodeURIComponent(
          user.email
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const message = await response.text();

      if (!response.ok) {
        alert(
          message || "Unable to send deletion OTP."
        );
        return;
      }

      alert(
        "Account deletion OTP has been sent to your email."
      );

    } catch (error) {
      console.error(
        "Delete account OTP error:",
        error
      );

      alert(
        "Unable to connect to CareerMatch AI backend."
      );
    } finally {
      setOtpSending(false);
    }
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();

    if (deleteOtp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users/delete-account?email=${encodeURIComponent(
          user.email
        )}&otp=${encodeURIComponent(deleteOtp)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const message = await response.text();

      if (!response.ok) {
        alert(
          message || "Account deletion failed."
        );
        return;
      }

      alert(
        "Your CareerMatch AI account has been deleted successfully."
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/register");

    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      alert(
        "Unable to connect to CareerMatch AI backend."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const latestResume =
    resumes.length > 0
      ? resumes[resumes.length - 1]
      : null;

  const latestJob =
    jobs.length > 0
      ? jobs[jobs.length - 1]
      : null;

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">

        <div className="brand-area">
          <h1>CareerMatch AI</h1>

          <p>
            AI-powered career and resume analysis
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

          <button
            className="logout-button"
            onClick={() => {
              setDeleteOtp("");
              setShowDeleteModal(true);
            }}
          >
            Delete Account
          </button>
        </div>

      </header>

      <section className="dashboard-welcome">

        <h2>
          Welcome,{" "}
          {user?.name || "CareerMatch User"} 👋
        </h2>

        <p>
          Analyze your resume, match it with jobs,
          and discover the skills you need to grow.
        </p>

      </section>

      <section className="dashboard-stats">

        <div className="dashboard-stat-card">

          <div className="stat-icon">
            📄
          </div>

          <div className="stat-content">

            <span>Total Resumes</span>

            <strong>
              {loading
                ? "..."
                : resumes.length}
            </strong>

          </div>

        </div>

        <div className="dashboard-stat-card">

          <div className="stat-icon">
            💼
          </div>

          <div className="stat-content">

            <span>Total Jobs</span>

            <strong>
              {loading
                ? "..."
                : jobs.length}
            </strong>

          </div>

        </div>

        <div className="dashboard-stat-card">

          <div className="stat-icon">
            📅
          </div>

          <div className="stat-content">

            <span>Latest Resume</span>

            <strong className="stat-small">
              {latestResume
                ? formatDate(
                    latestResume.uploadedAt
                  )
                : "None"}
            </strong>

          </div>

        </div>

        <div className="dashboard-stat-card">

          <div className="stat-icon">
            🎯
          </div>

          <div className="stat-content">

            <span>Latest Job</span>

            <strong className="stat-small">
              {latestJob
                ? latestJob.title
                : "None"}
            </strong>

          </div>

        </div>

      </section>

      <section className="quick-actions-section">

        <div className="section-heading">

          <div>
            <h3>Quick Actions</h3>

            <p>
              Start analyzing your career profile quickly.
            </p>
          </div>

        </div>

        <div className="quick-actions">

          <button
            className="quick-action-button"
            onClick={() =>
              navigate("/resume-analyzer")
            }
          >
            <span className="quick-action-icon">
              📄
            </span>

            <span className="quick-action-content">
              <strong>
                Upload Resume
              </strong>

              <small>
                Analyze your resume
              </small>
            </span>
          </button>

          <button
            className="quick-action-button"
            onClick={() =>
              navigate("/create-job")
            }
          >
            <span className="quick-action-icon">
              💼
            </span>

            <span className="quick-action-content">
              <strong>
                Create Job
              </strong>

              <small>
                Add a job description
              </small>
            </span>
          </button>

          <button
            className="quick-action-button"
            onClick={() =>
              navigate("/job-matching")
            }
          >
            <span className="quick-action-icon">
              🔍
            </span>

            <span className="quick-action-content">
              <strong>
                Match Resume
              </strong>

              <small>
                Compare your skills
              </small>
            </span>
          </button>

          <button
            className="quick-action-button"
            onClick={() =>
              navigate("/career-match")
            }
          >
            <span className="quick-action-icon">
              🎯
            </span>

            <span className="quick-action-content">
              <strong>
                Career Match
              </strong>

              <small>
                Get complete analysis
              </small>
            </span>
          </button>

        </div>

      </section>

      <section className="dashboard-data-section">

        <div className="dashboard-section-heading">

          <div>
            <h3>My Resumes</h3>

            <p>
              Your uploaded resumes and detected skills.
            </p>
          </div>

          <button
            className="section-action-button"
            onClick={() =>
              navigate("/resume-analyzer")
            }
          >
            + Upload Resume
          </button>

        </div>

        {loading ? (

          <div className="empty-dashboard-state">
            Loading resumes...
          </div>

        ) : resumes.length === 0 ? (

          <div className="empty-dashboard-state">

            <div className="empty-icon">
              📄
            </div>

            <h4>
              No resumes uploaded yet
            </h4>

            <p>
              Upload your resume to start
              analyzing your skills.
            </p>

            <button
              onClick={() =>
                navigate("/resume-analyzer")
              }
            >
              Upload Your First Resume
            </button>

          </div>

        ) : (

          <div className="dashboard-data-grid">

            {resumes.map((resume) => (

              <div
                className="dashboard-data-card"
                key={resume.id}
              >

                <div className="data-card-top">

                  <div className="data-card-icon">
                    📄
                  </div>

                  <span className="data-card-badge">
                    Resume
                  </span>

                </div>

                <h4>
                  {resume.fileName}
                </h4>

                <div className="data-card-info">

                  <p>
                    <strong>
                      Uploaded:
                    </strong>{" "}
                    {formatDate(
                      resume.uploadedAt
                    )}
                  </p>

                  <p>
                    <strong>
                      Skills:
                    </strong>{" "}
                    {Array.isArray(
                      resume.extractedSkills
                    )
                      ? resume.extractedSkills.length
                      : 0}
                  </p>

                </div>

                {Array.isArray(
                  resume.extractedSkills
                ) &&
                resume.extractedSkills.length > 0 && (

                  <div className="data-card-skills">

                    {resume.extractedSkills
                      .slice(0, 5)
                      .map((skill) => (

                        <span
                          className="mini-skill-tag"
                          key={skill}
                        >
                          {skill}
                        </span>

                      ))}

                    {resume.extractedSkills.length > 5 && (

                      <span className="mini-skill-more">
                        +
                        {resume.extractedSkills.length - 5}
                      </span>

                    )}

                  </div>

                )}

                <button
                  className="data-card-button"
                  onClick={() =>
                    navigate("/resume-analyzer")
                  }
                >
                  Analyze Resume
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

      <section className="dashboard-data-section">

        <div className="dashboard-section-heading">

          <div>

            <h3>
              My Jobs
            </h3>

            <p>
              Job descriptions you've created
              for resume matching.
            </p>

          </div>

          <button
            className="section-action-button"
            onClick={() =>
              navigate("/create-job")
            }
          >
            + Create Job
          </button>

        </div>

        {loading ? (

          <div className="empty-dashboard-state">
            Loading jobs...
          </div>

        ) : jobs.length === 0 ? (

          <div className="empty-dashboard-state">

            <div className="empty-icon">
              💼
            </div>

            <h4>
              No jobs created yet
            </h4>

            <p>
              Create a job description to
              compare it with your resume.
            </p>

            <button
              onClick={() =>
                navigate("/create-job")
              }
            >
              Create Your First Job
            </button>

          </div>

        ) : (

          <div className="dashboard-data-grid">

            {jobs.map((job) => (

              <div
                className="dashboard-data-card"
                key={job.id}
              >

                <div className="data-card-top">

                  <div className="data-card-icon">
                    💼
                  </div>

                  <span className="data-card-badge job-badge">
                    Job
                  </span>

                </div>

                <h4>
                  {job.title}
                </h4>

                <div className="data-card-info">

                  <p>
                    <strong>
                      Created:
                    </strong>{" "}
                    {formatDate(
                      job.createdAt
                    )}
                  </p>

                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {job.description
                      ? `${job.description.slice(
                          0,
                          110
                        )}${
                          job.description.length > 110
                            ? "..."
                            : ""
                        }`
                      : "No description available"}
                  </p>

                </div>

                <button
                  className="data-card-button"
                  onClick={() =>
                    navigate("/job-matching")
                  }
                >
                  Match a Resume
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

      <section className="feature-section">

        <div className="section-heading">

          <h3>
            Career Tools
          </h3>

          <p>
            Explore the tools available in CareerMatch AI.
          </p>

        </div>

        <div className="dashboard-grid">

          <div className="dashboard-card">

            <div className="feature-icon">
              📄
            </div>

            <h3>
              Resume Analyzer
            </h3>

            <p>
              Upload your PDF or DOCX resume
              and automatically extract your
              skills.
            </p>

            <button
              onClick={() =>
                navigate("/resume-analyzer")
              }
            >
              Open Resume Analyzer
            </button>

          </div>

          <div className="dashboard-card">

            <div className="feature-icon">
              🔍
            </div>

            <h3>
              Job Matching
            </h3>

            <p>
              Compare your resume with a job
              description and identify matching
              and missing skills.
            </p>

            <button
              onClick={() =>
                navigate("/job-matching")
              }
            >
              Match a Job
            </button>

          </div>

          <div className="dashboard-card">

            <div className="feature-icon">
              📊
            </div>

            <h3>
              ATS Analysis
            </h3>

            <p>
              Analyze your resume structure and
              identify areas that can be improved
              for ATS systems.
            </p>

            <button
              onClick={() =>
                navigate("/ats-analysis")
              }
            >
              Analyze ATS
            </button>

          </div>

          <div className="dashboard-card">

            <div className="feature-icon">
              🎯
            </div>

            <h3>
              Career Match
            </h3>

            <p>
              Get a complete analysis of your
              resume, target job, ATS score,
              skill match and recommendations.
            </p>

            <button
              onClick={() =>
                navigate("/career-match")
              }
            >
              Analyze Career Match
            </button>

          </div>

        </div>

      </section>

      {showDeleteModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "450px",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>
              Delete Account
            </h2>

            <p style={{ marginBottom: "20px" }}>
              This will permanently delete your
              CareerMatch AI account and its data.
            </p>

            <button
              onClick={handleSendDeleteOtp}
              disabled={otpSending}
              style={{
                width: "100%",
                marginBottom: "16px",
              }}
            >
              {otpSending
                ? "Sending OTP..."
                : "Send Deletion OTP"}
            </button>

            <form onSubmit={handleDeleteAccount}>

              <div className="form-group">

                <label>
                  Enter 6-digit OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="Enter OTP"
                  value={deleteOtp}
                  onChange={(event) =>
                    setDeleteOtp(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />

              </div>

              <button
                type="submit"
                disabled={
                  deleteLoading ||
                  deleteOtp.length !== 6
                }
                style={{
                  width: "100%",
                }}
              >
                {deleteLoading
                  ? "Deleting Account..."
                  : "Permanently Delete Account"}
              </button>

            </form>

            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteOtp("");
              }}
              disabled={deleteLoading}
              style={{
                width: "100%",
                marginTop: "12px",
              }}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;