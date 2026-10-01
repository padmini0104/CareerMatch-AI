import { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import { useNavigate } from "react-router-dom";

function ResumeAnalyzer() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [deletingResumeId, setDeletingResumeId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadResumes();
  }, [navigate, token]);

  const loadResumes = async () => {
    try {
      const response = await fetch(
        "/api/resumes/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await response.json();

      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load resumes:", err);
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const fileName = file.name.toLowerCase();

    const isPdf = fileName.endsWith(".pdf");
    const isDocx = fileName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      setError("Only PDF and DOCX files are allowed.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a PDF or DOCX resume.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    const formData = new FormData();

    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        "${API_BASE_URL}/api/resumes/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Resume upload failed."
        );
      }

      setMessage(
        "Resume uploaded and analyzed successfully!"
      );

      setSelectedFile(null);

      const fileInput = document.getElementById(
        "resume-file-input"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      await loadResumes();
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while uploading the resume."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingResumeId(resumeId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/resumes/${resumeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        let errorMessage = "Failed to delete resume.";

        try {
          const data = await response.json();

          errorMessage =
            data?.message || errorMessage;
        } catch {
          // Ignore empty error response
        }

        throw new Error(errorMessage);
      }

      setMessage("Resume deleted successfully.");

      await loadResumes();
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while deleting the resume."
      );
    } finally {
      setDeletingResumeId(null);
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

  return (
    <div className="resume-page">

      {/* HEADER */}

      <div className="resume-header">

        <div>
          <h1>
            CareerMatch AI
          </h1>

          <p>
            AI-powered career and resume analysis
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </div>


      {/* MAIN CONTENT */}

      <div className="resume-content">

        {/* PAGE TITLE */}

        <div className="resume-title">

          <div className="resume-icon">
            📄
          </div>

          <div>

            <h2>
              Resume Analyzer
            </h2>

            <p>
              Upload your resume and let CareerMatch AI
              extract your skills automatically.
            </p>

          </div>

        </div>


        {/* UPLOAD CARD */}

        <div className="resume-upload-card">

          <h3>
            Upload New Resume
          </h3>

          <p className="upload-description">
            Supported formats: PDF and DOCX
          </p>


          <label
            className="file-input-label"
            htmlFor="resume-file-input"
          >

            📁 Choose Resume

            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />

          </label>


          {/* SELECTED FILE */}

          {selectedFile && (

            <div className="selected-file">

              <div className="file-icon">
                📄
              </div>

              <div>

                <strong>
                  {selectedFile.name}
                </strong>

                <p>
                  {(
                    selectedFile.size / 1024
                  ).toFixed(1)} KB
                </p>

              </div>

            </div>

          )}


          {/* UPLOAD BUTTON */}

          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={
              uploading || !selectedFile
            }
          >

            {uploading
              ? "Uploading & Analyzing..."
              : "Upload & Analyze"}

          </button>


          {/* SUCCESS */}

          {message && (

            <div className="success-message">
              {message}
            </div>

          )}


          {/* ERROR */}

          {error && (

            <div className="error-message">
              {error}
            </div>

          )}

        </div>


        {/* MY RESUMES */}

        <div className="resume-result-card">

          <div className="result-header">

            <div>

              <h3>
                My Resumes
              </h3>

              <p>
                Your uploaded resumes and automatically
                detected skills.
              </p>

            </div>

            <span className="success-badge">

              {resumes.length} Resume
              {resumes.length === 1
                ? ""
                : "s"}

            </span>

          </div>


          {/* LOADING */}

          {loadingResumes && (

            <div className="resume-loading">
              Loading your resumes...
            </div>

          )}


          {/* EMPTY */}

          {!loadingResumes &&
            resumes.length === 0 && (

              <div className="resume-empty">

                <div className="empty-icon">
                  📄
                </div>

                <h4>
                  No resumes uploaded yet
                </h4>

                <p>
                  Upload your first resume above
                  to begin your analysis.
                </p>

              </div>

            )}


          {/* RESUMES */}

          {!loadingResumes &&
            resumes.length > 0 && (

              <div className="resume-list">

                {resumes.map((resume) => (

                  <div
                    className="resume-item"
                    key={resume.id}
                  >

                    <div className="resume-item-header">

                      <div>

                        <h4>
                          📄{" "}
                          {resume.fileName}
                        </h4>

                        <p>
                          Uploaded:{" "}
                          {formatDate(
                            resume.uploadedAt
                          )}
                        </p>

                      </div>


                      <div className="resume-actions">

                        <span className="resume-skill-count">

                          {Array.isArray(
                            resume.extractedSkills
                          )
                            ? resume.extractedSkills.length
                            : 0}{" "}
                          Skills

                        </span>


                        <button
                          className="delete-resume-button"
                          onClick={() =>
                            handleDelete(
                              resume.id
                            )
                          }
                          disabled={
                            deletingResumeId ===
                            resume.id
                          }
                        >

                          {deletingResumeId ===
                          resume.id
                            ? "Deleting..."
                            : "🗑️ Delete"}

                        </button>

                      </div>

                    </div>


                    {/* SKILLS */}

                    <div className="result-section">

                      <h4>
                        Detected Skills
                      </h4>


                      {Array.isArray(
                        resume.extractedSkills
                      ) &&
                      resume.extractedSkills.length > 0 ? (

                        <div className="skills-container">

                          {resume.extractedSkills.map(
                            (skill) => (

                              <span
                                className="skill-tag"
                                key={`${resume.id}-${skill}`}
                              >
                                {skill}
                              </span>

                            )
                          )}

                        </div>

                      ) : (

                        <p>
                          No skills were detected
                          from this resume.
                        </p>

                      )}

                    </div>


                    {/* ANALYZE RESUME BUTTON */}

                    <div className="resume-item-actions">

                      <button
                        className="analyze-resume-button"
                        onClick={() =>
                          navigate("/ats-analysis")
                        }
                      >
                        📊 Analyze Resume
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

        </div>

      </div>

    </div>
  );
}

export default ResumeAnalyzer;