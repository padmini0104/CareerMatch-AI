import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../api";

function ATSAnalysis() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(
    searchParams.get("resumeId") || ""
  );

  const [result, setResult] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadResumes();
  }, [token, navigate]);

  const loadResumes = async () => {
    try {
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/resumes/my",
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

      if (!response.ok) {
        throw new Error("Unable to load your resumes.");
      }

      const data = await response.json();

      const resumeList = Array.isArray(data) ? data : [];

      setResumes(resumeList);

      /*
       * If a resumeId came from Resume Analyzer,
       * automatically analyze that resume.
       */
      const resumeIdFromUrl = searchParams.get("resumeId");

      if (
        resumeIdFromUrl &&
        resumeList.some(
          (resume) =>
            String(resume.id) === String(resumeIdFromUrl)
        )
      ) {
        setSelectedResume(resumeIdFromUrl);
        analyzeResume(resumeIdFromUrl);
      }
    } catch (err) {
      console.error("Resume loading error:", err);

      setError(
        err.message ||
          "Unable to load your resumes."
      );
    } finally {
      setLoadingResumes(false);
    }
  };

  const analyzeResume = async (resumeId = selectedResume) => {
    if (!resumeId) {
      setError("Please select a resume first.");
      return;
    }

    try {
      setLoadingAnalysis(true);
      setError("");
      setResult(null);

      const response = await fetch(
        `${API_BASE_URL}/api/ats/resume/${resumeId}`,
        {
          method: "GET",
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

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "ATS analysis failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("ATS analysis error:", err);

      setError(
        err.message ||
          "Unable to analyze the resume."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const getATSScore = () => {
    if (!result) {
      return 0;
    }

    return Number(
      result.atsScore ??
        result.score ??
        result.ats_score ??
        0
    );
  };

  const getStrengths = () => {
    if (!result) {
      return [];
    }

    return Array.isArray(result.strengths)
      ? result.strengths
      : [];
  };

  const getImprovements = () => {
    if (!result) {
      return [];
    }

    return Array.isArray(result.improvements)
      ? result.improvements
      : [];
  };

  const getScoreStatus = () => {
    const score = getATSScore();

    if (score >= 80) {
      return {
        title: "Strong ATS Compatibility",
        description:
          "Your resume has a strong structure and is well prepared for ATS screening.",
        className: "ats-status-strong",
      };
    }

    if (score >= 60) {
      return {
        title: "Moderate ATS Compatibility",
        description:
          "Your resume has a reasonable ATS structure, but some areas can still be improved.",
        className: "ats-status-moderate",
      };
    }

    return {
      title: "Needs Improvement",
      description:
        "Your resume needs some improvements to increase its ATS compatibility.",
      className: "ats-status-low",
    };
  };

  const scoreStatus = getScoreStatus();

  return (
    <div className="ats-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="ats-header">

        <div className="ats-brand">
          <h1>CareerMatch AI</h1>

          <p>
            Resume ATS Analysis
          </p>
        </div>

        <button
          className="ats-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="ats-content">

        {/* PAGE INTRO */}

        <section className="ats-page-title">

          <div className="ats-title-icon">
            📊
          </div>

          <div>
            <h2>
              ATS Resume Analysis
            </h2>

            <p>
              Analyze your resume structure and
              identify areas that can be improved
              for ATS systems.
            </p>
          </div>

        </section>


        {/* =================================================
            RESUME SELECTION
        ================================================= */}

        <section className="ats-selection-card">

          <div className="ats-card-heading">

            <div>
              <h3>
                Select Your Resume
              </h3>

              <p>
                Choose the resume you want to analyze.
              </p>
            </div>

            <span className="ats-selection-icon">
              📄
            </span>

          </div>


          {loadingResumes ? (

            <div className="ats-loading-small">
              Loading your resumes...
            </div>

          ) : resumes.length === 0 ? (

            <div className="ats-empty-selection">

              <span>
                📄
              </span>

              <p>
                No resumes found.
                Please upload a resume first.
              </p>

              <button
                className="ats-secondary-button"
                onClick={() =>
                  navigate("/resume-analyzer")
                }
              >
                Upload Resume
              </button>

            </div>

          ) : (

            <>

              <div className="ats-form-group">

                <label htmlFor="resume-select">
                  Resume
                </label>

                <select
                  id="resume-select"
                  value={selectedResume}
                  onChange={(event) => {
                    setSelectedResume(
                      event.target.value
                    );

                    setResult(null);
                    setError("");
                  }}
                >

                  <option value="">
                    -- Select Resume --
                  </option>

                  {resumes.map((resume) => (
                    <option
                      key={resume.id}
                      value={resume.id}
                    >
                      {resume.fileName}
                    </option>
                  ))}

                </select>

              </div>


              <button
                className="ats-analyze-button"
                onClick={() =>
                  analyzeResume()
                }
                disabled={
                  loadingAnalysis ||
                  !selectedResume
                }
              >
                {loadingAnalysis
                  ? "Analyzing Resume..."
                  : "Analyze Resume"}
              </button>

            </>

          )}


          {/* ERROR */}

          {error && (
            <div className="ats-error-message">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

        </section>


        {/* =================================================
            LOADING ANALYSIS
        ================================================= */}

        {loadingAnalysis && (
          <section className="ats-loading-card">

            <div className="ats-loading-spinner"></div>

            <h3>
              Analyzing Your Resume
            </h3>

            <p>
              CareerMatch AI is checking your
              resume structure, skills, keywords,
              education, experience, and readability.
            </p>

          </section>
        )}


        {/* =================================================
            ATS RESULT
        ================================================= */}

        {result && !loadingAnalysis && (

          <section className="ats-result-card">

            {/* RESULT HEADER */}

            <div className="ats-result-header">

              <div>
                <span className="ats-result-label">
                  ANALYSIS COMPLETE
                </span>

                <h3>
                  Your ATS Analysis
                </h3>

                <p>
                  Your resume has been analyzed
                  for ATS compatibility.
                </p>
              </div>

              <div className="ats-result-check">
                ✓
              </div>

            </div>


            {/* SCORE SECTION */}

            <div className="ats-score-section">

              <div
                className="ats-score-circle"
                style={{
                  "--score":
                    `${getATSScore() * 3.6}deg`,
                }}
              >

                <div className="ats-score-circle-inner">

                  <strong>
                    {getATSScore()}%
                  </strong>

                  <span>
                    ATS Score
                  </span>

                </div>

              </div>


              <div className="ats-score-info">

                <span className="ats-score-overline">
                  RESUME ATS COMPATIBILITY
                </span>

                <h4>
                  {scoreStatus.title}
                </h4>

                <p>
                  Your resume was analyzed for
                  structure, skills, education,
                  experience, keywords,
                  achievements, and readability.
                </p>

                <div
                  className={`ats-score-status ${scoreStatus.className}`}
                >
                  <span>
                    {getATSScore() >= 80
                      ? "✓"
                      : getATSScore() >= 60
                      ? "!"
                      : "!"}
                  </span>

                  {scoreStatus.title}
                </div>

              </div>

            </div>


            {/* =================================================
                STRENGTHS
            ================================================= */}

            <div className="ats-result-section">

              <div className="ats-section-heading">

                <div className="ats-section-icon success">
                  ✓
                </div>

                <div>
                  <h4>
                    Strengths
                  </h4>

                  <p>
                    What your resume is doing well
                  </p>
                </div>

              </div>


              {getStrengths().length > 0 ? (

                <div className="ats-recommendation-list">

                  {getStrengths().map(
                    (strength, index) => (

                      <div
                        className="ats-recommendation-item success-item"
                        key={index}
                      >

                        <span className="recommendation-icon">
                          ✓
                        </span>

                        <p>
                          {strength}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p className="ats-no-data">
                  No strengths were returned
                  by the analysis.
                </p>

              )}

            </div>


            {/* =================================================
                IMPROVEMENTS
            ================================================= */}

            <div className="ats-result-section">

              <div className="ats-section-heading">

                <div className="ats-section-icon warning">
                  !
                </div>

                <div>
                  <h4>
                    Areas for Improvement
                  </h4>

                  <p>
                    Suggestions to improve your ATS score
                  </p>
                </div>

              </div>


              {getImprovements().length > 0 ? (

                <div className="ats-recommendation-list">

                  {getImprovements().map(
                    (improvement, index) => (

                      <div
                        className="ats-recommendation-item improvement-item"
                        key={index}
                      >

                        <span className="recommendation-icon">
                          →
                        </span>

                        <p>
                          {improvement}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p className="ats-no-data">
                  No improvement suggestions
                  were returned by the analysis.
                </p>

              )}

            </div>


            {/* FOOTER ACTION */}

            <div className="ats-result-footer">

              <button
                className="ats-secondary-button"
                onClick={() =>
                  navigate("/resume-analyzer")
                }
              >
                ← Resume Analyzer
              </button>

              <button
                className="ats-primary-button"
                onClick={() =>
                  analyzeResume()
                }
                disabled={loadingAnalysis}
              >
                ↻ Analyze Again
              </button>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default ATSAnalysis;