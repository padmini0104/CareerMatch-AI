import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function CareerMatch() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [aiAdvice, setAiAdvice] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const resumeResponse = await fetch(
        "${API_BASE_URL}/api/resumes/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resumeResponse.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!resumeResponse.ok) {
        throw new Error("Unable to load resumes.");
      }

      const resumeData = await resumeResponse.json();

      const jobResponse = await fetch(
        "${API_BASE_URL}/api/jobs/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (jobResponse.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!jobResponse.ok) {
        throw new Error("Unable to load jobs.");
      }

      const jobData = await jobResponse.json();

      setResumes(Array.isArray(resumeData) ? resumeData : []);
      setJobs(Array.isArray(jobData) ? jobData : []);
    } catch (err) {
      console.error("Career Match loading error:", err);

      setError(
        err.message ||
          "Unable to load your resumes and jobs."
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResume) {
      setError("Please select a resume.");
      return;
    }

    if (!selectedJob) {
      setError("Please select a job.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAiError("");
      setAiAdvice("");
      setResult(null);

      const response = await fetch(
        `${API_BASE_URL}/api/career-match/resume/${selectedResume}/job/${selectedJob}`,
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
            "Career match analysis failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Career Match error:", err);

      setError(
        err.message ||
          "Unable to analyze career match."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIAdvice = async () => {
    if (!selectedResume || !selectedJob) {
      setAiError(
        "Please select a resume and job first."
      );
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiAdvice("");

      const response = await fetch(
        `${API_BASE_URL}/api/ai/career-advice/resume/${selectedResume}/job/${selectedJob}`,
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
            "Unable to generate AI career advice."
        );
      }

      const advice =
        data?.advice ||
        data?.careerAdvice ||
        data?.response ||
        data?.message ||
        "";

      setAiAdvice(
        typeof advice === "string"
          ? advice
          : JSON.stringify(advice, null, 2)
      );
    } catch (err) {
      console.error("AI advice error:", err);

      setAiError(
        err.message ||
          "Unable to generate AI career advice."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const getArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  const getMatchPercentage = () => {
    return Number(
      result?.matchPercentage ??
        result?.matchScore ??
        0
    );
  };

  const getATSScore = () => {
    return Number(
      result?.resumeATSScore ??
        result?.atsScore ??
        0
    );
  };

  const getKeywordCoverage = () => {
    return Number(
      result?.keywordCoverage ?? 0
    );
  };

  const getJobATSScore = () => {
    return Number(
      result?.jobSpecificATSScore ?? 0
    );
  };

  const getMatchStatus = () => {
    const score = getMatchPercentage();

    if (score >= 80) {
      return {
        label: "Strong Match",
        className: "career-match-strong",
      };
    }

    if (score >= 60) {
      return {
        label: "Moderate Match",
        className: "career-match-moderate",
      };
    }

    return {
      label: "Needs Improvement",
      className: "career-match-low",
    };
  };

  /*
   * =====================================================
   * AI RESPONSE FORMATTER
   *
   * Converts:
   *
   * **Summary**
   *
   * * Java
   * * SQL
   *
   * into a cleaner React layout.
   * =====================================================
   */

  const formatAIAdvice = (text) => {
    if (!text) {
      return null;
    }

    const lines = text
      .replace(/\r\n/g, "\n")
      .split("\n");

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        return (
          <div
            className="career-ai-space"
            key={index}
          />
        );
      }

      /*
       * Markdown heading:
       * **Summary**
       */

      const headingMatch =
        trimmedLine.match(
          /^\*\*(.+?)\*\*$/
        );

      if (headingMatch) {
        return (
          <h5
            className="career-ai-heading"
            key={index}
          >
            {headingMatch[1]}
          </h5>
        );
      }

      /*
       * Bullet:
       * * Java
       * - Java
       */

      const bulletMatch =
        trimmedLine.match(
          /^[*-]\s+(.+)$/
        );

      if (bulletMatch) {
        return (
          <div
            className="career-ai-bullet"
            key={index}
          >
            <span>•</span>

            <p>
              {formatInlineBold(
                bulletMatch[1]
              )}
            </p>
          </div>
        );
      }

      /*
       * Numbered list:
       * 1. Learn Spring Boot
       */

      const numberedMatch =
        trimmedLine.match(
          /^(\d+)\.\s+(.+)$/
        );

      if (numberedMatch) {
        return (
          <div
            className="career-ai-numbered"
            key={index}
          >
            <span>
              {numberedMatch[1]}
            </span>

            <p>
              {formatInlineBold(
                numberedMatch[2]
              )}
            </p>
          </div>
        );
      }

      /*
       * Normal paragraph
       */

      return (
        <p
          className="career-ai-paragraph"
          key={index}
        >
          {formatInlineBold(trimmedLine)}
        </p>
      );
    });
  };

  /*
   * Formats inline **bold text**
   */

  const formatInlineBold = (text) => {
    const parts = text.split(
      /(\*\*[^*]+\*\*)/g
    );

    return parts.map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
  };

  const matchStatus = getMatchStatus();

  return (
    <div className="career-match-page">

      {/* HEADER */}

      <header className="career-match-header">

        <div>
          <h1>CareerMatch AI</h1>

          <p>
            Resume-to-job compatibility analysis
          </p>
        </div>

        <button
          className="career-back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

      </header>


      {/* MAIN */}

      <main className="career-match-content">

        {/* TITLE */}

        <section className="career-match-title">

          <div className="career-match-title-icon">
            🎯
          </div>

          <div>
            <h2>
              Career Match Analysis
            </h2>

            <p>
              Compare your resume with a target
              job and understand how well your
              profile matches the role.
            </p>
          </div>

        </section>


        {/* SELECTION */}

        <section className="career-selection-card">

          <div className="career-card-heading">

            <div>
              <h3>
                Select Resume & Job
              </h3>

              <p>
                Choose the resume and job you want
                to compare.
              </p>
            </div>

            <span className="career-card-icon">
              📋
            </span>

          </div>


          {loadingData ? (

            <div className="career-loading">

              <div className="career-spinner"></div>

              <p>
                Loading your resumes and jobs...
              </p>

            </div>

          ) : (

            <>

              <div className="career-selection-grid">

                <div className="career-form-group">

                  <label htmlFor="career-resume">
                    Resume
                  </label>

                  <select
                    id="career-resume"
                    value={selectedResume}
                    onChange={(event) => {
                      setSelectedResume(
                        event.target.value
                      );

                      setResult(null);
                      setAiAdvice("");
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


                <div className="career-form-group">

                  <label htmlFor="career-job">
                    Target Job
                  </label>

                  <select
                    id="career-job"
                    value={selectedJob}
                    onChange={(event) => {
                      setSelectedJob(
                        event.target.value
                      );

                      setResult(null);
                      setAiAdvice("");
                      setError("");
                    }}
                  >

                    <option value="">
                      -- Select Job --
                    </option>

                    {jobs.map((job) => (
                      <option
                        key={job.id}
                        value={job.id}
                      >
                        {job.title}
                      </option>
                    ))}

                  </select>

                </div>

              </div>


              {resumes.length === 0 && (
                <div className="career-empty-warning">

                  <span>📄</span>

                  <p>
                    No resumes found. Upload a resume
                    before performing a career match.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/resume-analyzer")
                    }
                  >
                    Upload Resume
                  </button>

                </div>
              )}


              {jobs.length === 0 && (
                <div className="career-empty-warning">

                  <span>💼</span>

                  <p>
                    No jobs found. Create a job before
                    performing a career match.
                  </p>

                  <button
                    onClick={() =>
                      navigate("/create-job")
                    }
                  >
                    Create Job
                  </button>

                </div>
              )}


              <button
                className="career-analyze-button"
                onClick={handleAnalyze}
                disabled={
                  loading ||
                  !selectedResume ||
                  !selectedJob
                }
              >
                {loading
                  ? "Analyzing Career Match..."
                  : "Analyze Career Match"}
              </button>


              {error && (
                <div className="career-error">

                  <span>!</span>

                  <p>{error}</p>

                </div>
              )}

            </>

          )}

        </section>


        {/* LOADING */}

        {loading && (
          <section className="career-loading-card">

            <div className="career-spinner"></div>

            <h3>
              Analyzing Your Career Match
            </h3>

            <p>
              Comparing your resume, skills,
              ATS compatibility, and job requirements.
            </p>

          </section>
        )}


        {/* RESULT */}

        {result && !loading && (

          <section className="career-result-card">

            {/* RESULT HEADER */}

            <div className="career-result-header">

              <div>

                <span className="career-result-label">
                  ANALYSIS COMPLETE
                </span>

                <h3>
                  Career Match Result
                </h3>

                <p>
                  {result.jobTitle ||
                    "Selected Job"}
                </p>

              </div>

              <div className="career-result-check">
                ✓
              </div>

            </div>


            {/* SCORE */}

            <div className="career-score-area">

              <div className="career-main-score">

                <div className="career-score-number">
                  {getMatchPercentage()}%
                </div>

                <span>
                  Resume Match
                </span>

                <div
                  className={`career-match-status ${matchStatus.className}`}
                >
                  {matchStatus.label}
                </div>

              </div>


              <div className="career-score-details">

                <div className="career-score-stat">

                  <strong>
                    {getATSScore()}%
                  </strong>

                  <span>
                    Resume ATS
                  </span>

                </div>

                <div className="career-score-stat">

                  <strong>
                    {getKeywordCoverage()}%
                  </strong>

                  <span>
                    Keyword Coverage
                  </span>

                </div>

                <div className="career-score-stat">

                  <strong>
                    {getJobATSScore()}%
                  </strong>

                  <span>
                    Job ATS
                  </span>

                </div>

              </div>

            </div>


            {/* SKILLS */}

            <div className="career-result-grid">

              <div className="career-result-section">

                <div className="career-section-heading">

                  <span className="career-section-icon">
                    📌
                  </span>

                  <div>
                    <h4>
                      Required Skills
                    </h4>

                    <p>
                      Skills mentioned in the job
                    </p>
                  </div>

                </div>

                <div className="career-skill-list">

                  {getArray(
                    result.requiredSkills
                  ).length > 0 ? (

                    getArray(
                      result.requiredSkills
                    ).map((skill) => (
                      <span
                        className="career-skill-tag"
                        key={skill}
                      >
                        {skill}
                      </span>
                    ))

                  ) : (
                    <p className="career-no-data">
                      No required skills detected.
                    </p>
                  )}

                </div>

              </div>


              <div className="career-result-section">

                <div className="career-section-heading">

                  <span className="career-section-icon success">
                    ✓
                  </span>

                  <div>
                    <h4>
                      Matched Skills
                    </h4>

                    <p>
                      Skills already present in your resume
                    </p>
                  </div>

                </div>

                <div className="career-skill-list">

                  {getArray(
                    result.matchedSkills
                  ).length > 0 ? (

                    getArray(
                      result.matchedSkills
                    ).map((skill) => (
                      <span
                        className="career-skill-tag matched"
                        key={skill}
                      >
                        ✓ {skill}
                      </span>
                    ))

                  ) : (
                    <p className="career-no-data">
                      No matching skills found.
                    </p>
                  )}

                </div>

              </div>


              <div className="career-result-section">

                <div className="career-section-heading">

                  <span className="career-section-icon warning">
                    !
                  </span>

                  <div>
                    <h4>
                      Missing Skills
                    </h4>

                    <p>
                      Skills that may need attention
                    </p>
                  </div>

                </div>

                <div className="career-skill-list">

                  {getArray(
                    result.missingSkills
                  ).length > 0 ? (

                    getArray(
                      result.missingSkills
                    ).map((skill) => (
                      <span
                        className="career-skill-tag missing"
                        key={skill}
                      >
                        + {skill}
                      </span>
                    ))

                  ) : (
                    <p className="career-no-data">
                      No missing skills detected.
                    </p>
                  )}

                </div>

              </div>

            </div>


            {/* ATS STRENGTHS */}

            <div className="career-detail-section">

              <div className="career-detail-heading">

                <div className="career-detail-icon success">
                  ✓
                </div>

                <div>
                  <h4>
                    ATS Strengths
                  </h4>

                  <p>
                    Positive aspects identified in your resume
                  </p>
                </div>

              </div>


              {getArray(
                result.atsStrengths
              ).length > 0 ? (

                <div className="career-recommendation-list">

                  {getArray(
                    result.atsStrengths
                  ).map((strength, index) => (

                    <div
                      className="career-recommendation-item success"
                      key={index}
                    >

                      <span>✓</span>

                      <p>
                        {strength}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="career-no-data">
                  No ATS strengths detected.
                </p>

              )}

            </div>


            {/* ATS IMPROVEMENTS */}

            <div className="career-detail-section">

              <div className="career-detail-heading">

                <div className="career-detail-icon warning">
                  !
                </div>

                <div>
                  <h4>
                    ATS Improvements
                  </h4>

                  <p>
                    Areas that could be improved
                  </p>
                </div>

              </div>


              {getArray(
                result.atsImprovements
              ).length > 0 ? (

                <div className="career-recommendation-list">

                  {getArray(
                    result.atsImprovements
                  ).map((improvement, index) => (

                    <div
                      className="career-recommendation-item warning"
                      key={index}
                    >

                      <span>→</span>

                      <p>
                        {improvement}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="career-no-data">
                  No ATS improvements required.
                </p>

              )}

            </div>


            {/* SKILL GAP */}

            <div className="career-detail-section">

              <div className="career-detail-heading">

                <div className="career-detail-icon">
                  🎯
                </div>

                <div>
                  <h4>
                    Skill Gap Analysis
                  </h4>

                  <p>
                    Recommendations based on missing skills
                  </p>
                </div>

              </div>


              {getArray(
                result.skillRecommendations
              ).length > 0 ? (

                <div className="career-gap-list">

                  {getArray(
                    result.skillRecommendations
                  ).map((item, index) => (

                    <div
                      className="career-gap-card"
                      key={index}
                    >

                      <div className="career-gap-top">

                        <h5>
                          {item.skill}
                        </h5>

                        <span
                          className={`career-priority ${
                            item.priority === "High"
                              ? "high"
                              : item.priority === "Medium"
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {item.priority || "Priority"}
                        </span>

                      </div>

                      <p>
                        {item.recommendation}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="career-no-data">
                  No skill gaps detected for this job.
                </p>

              )}

            </div>


            {/* AI CAREER ADVICE */}

            <div className="career-ai-section">

              <div className="career-ai-header">

                <div>

                  <span className="career-ai-label">
                    AI POWERED
                  </span>

                  <h4>
                    Personalized Career Advice
                  </h4>

                  <p>
                    Get personalized guidance based
                    on your resume and selected job.
                  </p>

                </div>

                <div className="career-ai-icon">
                  ✨
                </div>

              </div>


              <button
                className="career-ai-button"
                onClick={handleGenerateAIAdvice}
                disabled={aiLoading}
              >
                {aiLoading
                  ? "Generating Advice..."
                  : "Generate AI Career Advice"}
              </button>


              {aiError && (
                <div className="career-ai-error">
                  {aiError}
                </div>
              )}


              {aiAdvice && (
                <div className="career-ai-result">

                  <div className="career-ai-result-title">
                    <span>✨</span>

                    <strong>
                      AI Recommendations
                    </strong>
                  </div>

                  <div className="career-ai-text">

                    {formatAIAdvice(aiAdvice)}

                  </div>

                </div>
              )}

            </div>


            {/* FOOTER */}

            <div className="career-result-footer">

              <button
                className="career-secondary-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                ← Dashboard
              </button>

              <button
                className="career-primary-button"
                onClick={handleAnalyze}
                disabled={loading}
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

export default CareerMatch;