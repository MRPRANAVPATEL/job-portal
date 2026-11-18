//src/pages/JobsRegister.js

import React from "react";
import {useNavigate} from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import API_BASE_URL from "./setting";
import "./JobsRegister.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const JobsRegister = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    fetch('/api/check-login').then(r => r.json()).then(data => { if (!data.user?.company_id) navigate('/companylogin'); }).catch(() => navigate('/companylogin'));
  }, [navigate]);
  const initialValues = {
    
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_min: "",
    salary_max: "",
    job_type: "",
    posted_date: "",
    expiry_date: "",
  };

  const validationSchema = Yup.object({
    
    title: Yup.string().required("Job title is required"),
    description: Yup.string().required("Description is required"),
    requirements: Yup.string().required("Requirements are required"),
    location: Yup.string().required("Location is required"),
    salary_min: Yup.number().required("Minimum salary is required"),
    salary_max: Yup.number().required("Maximum salary is required"),
    job_type: Yup.string().required("Job type is required"),
    posted_date: Yup.date().required("Posted date is required"),
    expiry_date: Yup.date().required("Expiry date is required"),
  });

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await axios.post(`${API_BASE_URL}/jobs`, values, { withCredentials: true });
      alert("Job posted successfully!");
      resetForm();
      navigate("/company-dashboard");
    } catch (error) {
      console.error("Job registration error:", error);
      alert(error?.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Header />
    <br></br>
    <div className="jobs-page">
      <div className="jobs-container">
        <div className="jobs-card">
          <h2>Post a Job</h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="jobs-form">


                <div className="form-group">
                  <label>Job Title</label>
                  <Field name="title" type="text" placeholder="Enter job title" />
                  <ErrorMessage name="title" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <Field name="description" as="textarea" rows="4" placeholder="Job description..." />
                  <ErrorMessage name="description" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label>Requirements</label>
                  <Field name="requirements" as="textarea" rows="4" placeholder="Job requirements..." />
                  <ErrorMessage name="requirements" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <Field name="location" type="text" placeholder="Job location" />
                  <ErrorMessage name="location" component="div" className="error" />
                </div>

                <div className="form-group salary-group">
                  <div>
                    <label>Salary Min</label>
                    <Field name="salary_min" type="number" placeholder="₹0" />
                    <ErrorMessage name="salary_min" component="div" className="error" />
                  </div>
                  <div>
                    <label>Salary Max</label>
                    <Field name="salary_max" type="number" placeholder="₹0" />
                    <ErrorMessage name="salary_max" component="div" className="error" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Job Type</label>
                  <Field as="select" name="job_type">
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </Field>
                  <ErrorMessage name="job_type" component="div" className="error" />
                </div>

                <div className="form-group date-group">
                  <div>
                    <label>Posted Date</label>
                    <Field name="posted_date" type="date" />
                    <ErrorMessage name="posted_date" component="div" className="error" />
                  </div>
                  <div>
                    <label>Expiry Date</label>
                    <Field name="expiry_date" type="date" />
                    <ErrorMessage name="expiry_date" component="div" className="error" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post Job"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default JobsRegister;
