import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";

function CreateJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a job title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter the job description.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Backend expects:
       * title
       * description
       *
       * as request parameters.
       */
      const params = new URLSearchParams();

      params.append("title", title.trim());
      params.append("description", description.trim());

      const response = await fetch(
        `${API_BASE_URL}/api/jobs?${params.toString()}`,
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

      /*
       * Some Spring Boot endpoints may return
       * an empty response after successfully
       * creating the job.
       *
       * Therefore, don't blindly call response.json().
       */
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = "Failed to create job.";

        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);

            errorMessage =
              errorData?.message ||
              errorData?.error ||
              errorMessage;
          } catch {
            errorMessage = responseText;
          }
        }

        throw new Error(errorMessage);
      }

      setSuccess("Job description created successfully!");

      setTitle("");
      setDescription("");

      /*
       * Give the user a moment to see the
       * success message before returning.
       */
      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      console.error("Create job error:", err);

      setError(
        err.message ||
          "Something went wrong while creating the job."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="create-job-header">

        <div>
          <h1>CareerMatch AI</h1>

          <p>
            Create a job description
          </p>
        </div>

        <button
          className="create-job-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </header>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="create-job-content">

        {/* PAGE TITLE */}

        <section className="create-job-title-section">

          <div className="create-job-title-icon">
            💼
          </div>

          <div>
            <h2>
              Create Job Description
            </h2>

            <p>
              Add a job description that you want
              to compare with your resume.
            </p>
          </div>

        </section>


        {/* =================================================
            FORM CARD
        ================================================= */}

        <section className="create-job-card">

          <div className="create-job-card-header">

            <div>
              <h3>
                Job Details
              </h3>

              <p>
                Enter the job title and complete
                job description below.
              </p>
            </div>

            <div className="create-job-card-icon">
              📋
            </div>

          </div>


          <div className="create-job-divider"></div>


          <form onSubmit={handleSubmit}>

            {/* JOB TITLE */}

            <div className="create-job-field">

              <label htmlFor="job-title">
                Job Title
              </label>

              <input
                id="job-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Example: Java Developer"
                disabled={loading}
              />

            </div>


            {/* JOB DESCRIPTION */}

            <div className="create-job-field">

              <div className="create-job-label-row">

                <label htmlFor="job-description">
                  Job Description
                </label>

                <span>
                  {description.length} characters
                </span>

              </div>

              <textarea
                id="job-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Paste the complete job description here..."
                rows="10"
                disabled={loading}
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="create-job-message create-job-error">

                <span>!</span>

                <p>
                  {error}
                </p>

              </div>
            )}


            {/* SUCCESS */}

            {success && (
              <div className="create-job-message create-job-success">

                <span>✓</span>

                <p>
                  {success}
                </p>

              </div>
            )}


            {/* ACTIONS */}

            <div className="create-job-actions">

              <button
                type="button"
                className="create-job-cancel-button"
                onClick={() =>
                  navigate("/dashboard")
                }
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="create-job-submit-button"
                disabled={loading}
              >
                {loading
                  ? "Creating Job..."
                  : "Create Job"}
              </button>

            </div>

          </form>

        </section>


        {/* =================================================
            EXAMPLE
        ================================================= */}

        <section className="create-job-example-card">

          <div className="create-job-example-icon">
            💡
          </div>

          <div>

            <h3>
              Example Job Description
            </h3>

            <p className="create-job-example-subtitle">
              You can use a real job description
              from a company you want to apply to.
            </p>

            <div className="create-job-example-content">

              <h4>
                Java Developer
              </h4>

              <p>
                We are looking for a Java Developer
                with Java, Spring Boot, SQL, REST API,
                Git, Docker and Data Structures and
                Algorithms skills.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default CreateJob;