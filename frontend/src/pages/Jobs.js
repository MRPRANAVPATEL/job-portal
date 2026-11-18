import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "./setting";
import "./jobs.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const salary = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" });

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  const [pendingJob, setPendingJob] = useState(null);
  const [applicationError, setApplicationError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };

    axios.get(API_BASE_URL + "/check-login", options)
      .then(({ data }) => setIsCandidate(Boolean(data.user?.id)))
      .catch(() => {});

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setApplicationError("");

    axios.get(API_BASE_URL + "/jobs", {
      params: { page, limit: 6 },
      signal: controller.signal,
    }).then(({ data }) => {
      setJobs(data.jobs);
      setHasMore(data.hasMore);
    }).catch(() => {
      if (!controller.signal.aborted) setError("Could not load jobs. Refresh the page to try again.");
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });

    return () => controller.abort();
  }, [page]);

  async function apply(jobId) {
    setPendingJob(jobId);
    setApplicationError("");
    try {
      await axios.post(API_BASE_URL + "/jobs/" + jobId + "/apply", {});
      setJobs(current => current.map(job => job.job_id === jobId ? { ...job, applied: true } : job));
    } catch (err) {
      setApplicationError(err.response?.data?.message || "Could not submit your application. Try again.");
    } finally {
      setPendingJob(null);
    }
  }

  return (
    <>
      <Header />
      <main className="browse-jobs">
        <div className="browse-jobs__inner">
          <h1>Available jobs</h1>
          <p className="browse-jobs__intro">Explore open roles and apply directly to employers.</p>
          {loading && <p role="status" className="browse-jobs__notice">Loading jobs…</p>}
          {error && <p role="alert" className="browse-jobs__notice">{error}</p>}
          {applicationError && <p role="alert" className="browse-jobs__notice">{applicationError}</p>}
          {!loading && !error && (
            <>
              {jobs.length === 0 && <p className="browse-jobs__notice">No open jobs right now.</p>}
              <div className="browse-jobs__list">
                {jobs.map(job => (
                  <article className="listing" key={job.job_id}>
                    <div className="listing__header">
                      <div>
                        <h2>{job.title}</h2>
                        <p>{job.company_name} · {job.location}</p>
                      </div>
                      <span className="listing__type">{job.job_type}</span>
                    </div>
                    <div className="listing__details">
                      <div><h3>Description</h3><p>{job.description}</p></div>
                      <div><h3>Requirements</h3><p>{job.requirements}</p></div>
                    </div>
                    <div className="listing__footer">
                      <div>
                        <strong>{salary.format(job.salary_min)} – {salary.format(job.salary_max)}</strong>
                        <p>Posted {date.format(new Date(job.posted_date))} · Closes {date.format(new Date(job.expiry_date))}</p>
                      </div>
                      {job.applied ? (
                        <button className="hero-action" disabled>Applied</button>
                      ) : isCandidate ? (
                        <button className="hero-action" disabled={pendingJob !== null} onClick={() => apply(job.job_id)}>
                          {pendingJob === job.job_id ? "Applying…" : "Apply now"}
                        </button>
                      ) : (
                        <Link to="/login" className="hero-action">Sign in to apply</Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              {(page > 1 || hasMore) && (
                <nav aria-label="Job pages" className="browse-jobs__pagination">
                  <button className="hero-action" disabled={page === 1 || pendingJob !== null} onClick={() => setPage(page - 1)}>Previous</button>
                  <span>Page {page}</span>
                  <button className="hero-action" disabled={!hasMore || pendingJob !== null} onClick={() => setPage(page + 1)}>Next</button>
                </nav>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
