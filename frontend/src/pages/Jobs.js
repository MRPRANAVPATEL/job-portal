// src/pages/Jobs.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "./setting";
import "./jobs.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [hasMore, setHasMore] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // ✅ Check login status once on mount
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/check-login`, {
          withCredentials: true,
        });
        setLoggedIn(Boolean(res.data.user?.id));
      } catch {
        setLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  // ✅ Fetch jobs for the current page
  const fetchJobs = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/jobs?page=${pageNumber}&limit=${limit}`
      );
      const jobData = res.data.jobs || [];
      setJobs(jobData);
      setHasMore(res.data.hasMore);
      setAppliedJobs(jobData.filter(job => job.applied).map(job => job.job_id));
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchJobs(page);
  }, [page, fetchJobs]);

  const handlePageChange = (newPage) => {
    if (newPage < 1) return;
    if (!hasMore && newPage > page) return;
    setPage(newPage);
  };

  // ✅ FIX: This function now correctly calls the backend API
  const handleApply = async (jobId) => {
    if (!loggedIn) {
      alert("⚠️ You must log in first!");
      navigate("/login");
      return;
    }

    try {
      // Send the request to the new backend endpoint
      const response = await axios.post(
        `${API_BASE_URL}/jobs/${jobId}/apply`,
        {}, // No body data is needed, just the IDs from the URL and session
        { withCredentials: true } // ESSENTIAL for sending the session cookie
      );

      // Update local UI to show "Applied"
      setAppliedJobs((prev) => [...prev, jobId]);
      alert(response.data.message || "✅ You have successfully applied!");

    } catch (err) {
      console.error("Application failed:", err);
      // Show the specific error message from the backend (e.g., "Already applied")
      alert(err.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>Loading jobs...</p>
    );
  if (error)
    return (
      <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        {error}
      </p>
    );

  return (
    <>
      <Header />
      <div className="jobs-page" >
        <h2>Available Jobs</h2>
        <div className="jobs-container">
          <div className="jobs-list">
            {jobs.length === 0 ? (
              <p>No jobs available at the moment.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.job_id} className="job-card">
                  <h3>{job.title}</h3>
                  <p>
                    <strong>Company:</strong> {job.company_name}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Type:</strong> {job.job_type}
                  </p>
                  <p>
                    <strong>Salary:</strong> ₹{job.salary_min} - ₹
                    {job.salary_max}
                  </p>
                  <p>
                    <strong>Posted:</strong>{" "}
                    {new Date(job.posted_date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Expiry:</strong>{" "}
                    {new Date(job.expiry_date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Description:</strong> {job.description}
                  </p>
                  <p>
                    <strong>Requirements:</strong> {job.requirements}
                  </p>

                  {appliedJobs.includes(job.job_id) ? (
                    <button disabled style={{ background: "#ccc" }}>
                      Applied
                    </button>
                  ) : loggedIn ? (
                    <button onClick={() => handleApply(job.job_id)}>
                      Apply Now
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/login")}
                      style={{ background: "#eee", color: "#888" }}
                    >
                      Login to Apply
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ✅ Pagination */}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore}
          >
            Next
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Jobs;