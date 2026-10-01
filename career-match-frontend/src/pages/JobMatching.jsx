import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function JobMatching() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
    } catch (err) {
      console.error(
        "Job Matching loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load resumes and jobs."
      );
    } finally {
      setLoadingData(false);
    }
  };

  const handleMatch = async () => {
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
      setResult(null);

      const response = await fetch(
        `${API_BASE_URL}/api/matching/resume/${selectedResume}/job/${selectedJob}`,
        {
          method: "POST",
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
            "Resume matching failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error(
        "Job Matching error:",
        err
      );

      setError(
        err.message ||
          "Unable to match resume with job."
      );
    } finally {
      setLoading(false);
    }
  };

  const getArray = (value) => {
    return Array.isArray(value)
      ? value
      : [];
  };

  const getMatchPercentage = () => {
    return Number(
      result?.matchPercentage ??
        result?.matchScore ??
        0
    );
  };

  const getMatchStatus = () => {
    const score =
      getMatchPercentage();

    if (score >= 80) {
      return {
        label: "Strong Match",
        className:
          "job-match-status-strong",
      };
    }

    if (score >= 60) {
      return {
        label: "Moderate Match",
        className:
          "job-match-status-moderate",
      };
    }

    return {
      label: "Needs Improvement",
      className:
        "job-match-status-low",
    };
  };

  const matchStatus =
    getMatchStatus();

  return (
    <div className="job-matching-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="job-matching-header">

        <div>
          <h1>
            CareerMatch AI
          </h1>

          <p>
            Resume and job matching
          </p>
        </div>

        <button
          className="job-matching-back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="job-matching-content">

        {/* PAGE TITLE */}

        <section className="job-matching-title">

          <div className="job-matching-title-icon">
            🎯
          </div>

          <div>
            <h2>
              Job Matching
            </h2>

            <p>
              Compare your resume with a job
              description and discover your
              skill match.
            </p>
          </div>

        </section>


        {/* =================================================
            SELECTION CARD
        ================================================= */}

        <section className="job-matching-selection-card">

          <div className="job-matching-card-header">

            <div>
              <h3>
                Select Resume & Job
              </h3>

              <p>
                Choose a resume and a saved job
                description to calculate your match.
              </p>
            </div>

            <div className="job-matching-card-icon">
              📋
            </div>

          </div>


          {loadingData ? (

            <div className="job-matching-loading">

              <div className="job-matching-spinner"></div>

              <p>
                Loading your resumes and jobs...
              </p>

            </div>

          ) : (

            <>

              <div className="job-matching-selection-grid">

                {/* RESUME */}

                <div className="job-matching-field">

                  <label htmlFor="matching-resume">
                    Resume
                  </label>

                  <select
                    id="matching-resume"
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


                {/* JOB */}

                <div className="job-matching-field">

                  <label htmlFor="matching-job">
                    Target Job
                  </label>

                  <select
                    id="matching-job"
                    value={selectedJob}
                    onChange={(event) => {
                      setSelectedJob(
                        event.target.value
                      );

                      setResult(null);
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


              {/* EMPTY STATES */}

              {resumes.length === 0 && (
                <div className="job-matching-empty">

                  <span>📄</span>

                  <div>
                    <strong>
                      No resumes found
                    </strong>

                    <p>
                      Upload a resume before
                      performing a job match.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        "/resume-analyzer"
                      )
                    }
                  >
                    Upload Resume
                  </button>

                </div>
              )}


              {jobs.length === 0 && (
                <div className="job-matching-empty">

                  <span>💼</span>

                  <div>
                    <strong>
                      No jobs found
                    </strong>

                    <p>
                      Create a job description
                      before performing a match.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        "/create-job"
                      )
                    }
                  >
                    Create Job
                  </button>

                </div>
              )}


              {/* MATCH BUTTON */}

              <button
                className="job-matching-button"
                onClick={handleMatch}
                disabled={
                  loading ||
                  !selectedResume ||
                  !selectedJob
                }
              >
                {loading
                  ? "Matching Resume..."
                  : "Match Resume with Job"}
              </button>


              {error && (
                <div className="job-matching-error">

                  <span>!</span>

                  <p>
                    {error}
                  </p>

                </div>
              )}

            </>

          )}

        </section>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <section className="job-matching-loading-card">

            <div className="job-matching-spinner"></div>

            <h3>
              Analyzing Resume Match
            </h3>

            <p>
              Comparing your resume skills with
              the requirements of the selected job.
            </p>

          </section>
        )}


        {/* =================================================
            RESULT
        ================================================= */}

        {result && !loading && (

          <section className="job-matching-result-card">

            {/* RESULT HEADER */}

            <div className="job-matching-result-header">

              <div>

                <span className="job-matching-result-label">
                  ANALYSIS COMPLETE
                </span>

                <h3>
                  Resume Match Result
                </h3>

                <p>
                  Your resume compared with the
                  selected job.
                </p>

              </div>

              <div className="job-matching-result-check">
                ✓
              </div>

            </div>


            {/* SCORE */}

            <div className="job-matching-score-card">

              <div className="job-matching-main-score">

                <strong>
                  {getMatchPercentage()}%
                </strong>

                <span>
                  Resume Match
                </span>

                <div
                  className={`job-matching-status ${matchStatus.className}`}
                >
                  {matchStatus.label}
                </div>

              </div>

              <div className="job-matching-score-info">

                <h4>
                  Skill Compatibility
                </h4>

                <p>
                  This percentage represents how
                  closely your resume skills match
                  the requirements of the selected job.
                </p>

              </div>

            </div>


            {/* =================================================
                SKILL GRID
            ================================================= */}

            <div className="job-matching-skill-grid">

              {/* REQUIRED */}

              <div className="job-matching-skill-card">

                <div className="job-matching-section-heading">

                  <div className="job-matching-section-icon">
                    📌
                  </div>

                  <div>
                    <h4>
                      Required Skills
                    </h4>

                    <p>
                      Skills mentioned in the job
                    </p>
                  </div>

                </div>

                <div className="job-matching-skill-list">

                  {getArray(
                    result.requiredSkills
                  ).length > 0 ? (

                    getArray(
                      result.requiredSkills
                    ).map((skill) => (
                      <span
                        className="job-matching-skill-tag"
                        key={skill}
                      >
                        {skill}
                      </span>
                    ))

                  ) : (

                    <p className="job-matching-no-data">
                      No required skills detected.
                    </p>

                  )}

                </div>

              </div>


              {/* MATCHED */}

              <div className="job-matching-skill-card">

                <div className="job-matching-section-heading">

                  <div className="job-matching-section-icon success">
                    ✓
                  </div>

                  <div>
                    <h4>
                      Matched Skills
                    </h4>

                    <p>
                      Skills already present in your resume
                    </p>
                  </div>

                </div>

                <div className="job-matching-skill-list">

                  {getArray(
                    result.matchedSkills
                  ).length > 0 ? (

                    getArray(
                      result.matchedSkills
                    ).map((skill) => (
                      <span
                        className="job-matching-skill-tag matched"
                        key={skill}
                      >
                        ✓ {skill}
                      </span>
                    ))

                  ) : (

                    <p className="job-matching-no-data">
                      No matching skills found.
                    </p>

                  )}

                </div>

              </div>


              {/* MISSING */}

              <div className="job-matching-skill-card">

                <div className="job-matching-section-heading">

                  <div className="job-matching-section-icon warning">
                    !
                  </div>

                  <div>
                    <h4>
                      Missing Skills
                    </h4>

                    <p>
                      Skills that may need attention
                    </p>
                  </div>

                </div>

                <div className="job-matching-skill-list">

                  {getArray(
                    result.missingSkills
                  ).length > 0 ? (

                    getArray(
                      result.missingSkills
                    ).map((skill) => (
                      <span
                        className="job-matching-skill-tag missing"
                        key={skill}
                      >
                        + {skill}
                      </span>
                    ))

                  ) : (

                    <p className="job-matching-no-data">
                      No missing skills detected.
                    </p>

                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                RECOMMENDATIONS
            ================================================= */}

            <div className="job-matching-recommendations">

              <div className="job-matching-section-heading">

                <div className="job-matching-section-icon">
                  🎯
                </div>

                <div>
                  <h4>
                    Skill Recommendations
                  </h4>

                  <p>
                    Suggested actions based on your
                    missing skills.
                  </p>
                </div>

              </div>


              {getArray(
                result.skillRecommendations
              ).length > 0 ? (

                <div className="job-matching-recommendation-list">

                  {getArray(
                    result.skillRecommendations
                  ).map((item, index) => (

                    <div
                      className="job-matching-recommendation"
                      key={index}
                    >

                      <div className="job-matching-recommendation-number">
                        {index + 1}
                      </div>

                      <div>

                        <h5>
                          {item.skill}
                        </h5>

                        <p>
                          {item.recommendation}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="job-matching-no-data">
                  No additional recommendations.
                </p>

              )}

            </div>


            {/* FOOTER */}

            <div className="job-matching-result-footer">

              <button
                className="job-matching-secondary-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                ← Dashboard
              </button>

              <button
                className="job-matching-primary-button"
                onClick={handleMatch}
                disabled={loading}
              >
                ↻ Match Again
              </button>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default JobMatching;