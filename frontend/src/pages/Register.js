// src/components/Register.js
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom"; // ✅ 1. Import useNavigate
import API_BASE_URL from "./setting";
import "./Register.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Register = () => {
  const navigate = useNavigate(); // ✅ 2. Initialize the navigate function

  const initialValues = {
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: "jobseeker", // default
  };

  const validationSchema = Yup.object({
    full_name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "At least 6 characters")
      .required("Password is required"),

    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Enter valid 10-digit phone number")
      .required("Phone number is required"),
    role: Yup.string().required("Role is required"),
  });

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    const { ...payload } = values;

    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // backend returned error status
        throw new Error(data.message || "Registration failed");
      }

      console.log("Register success:", data);
      alert("Registration successful! You will now be redirected to the login page.");
      navigate("/login"); // ✅ 3. Redirect to the login page on success

    } catch (error) {
      console.error("Register error:", error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="register-page">
        <img src="/img/logo.webp" alt="logo" className="register-logo" />

        <div className="register-card">
          <h2>Join JobSphere</h2>
          <p>Make the most of your professional life</p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="register-form">
                <label>Full Name</label>
                <Field name="full_name" type="text" />
                <ErrorMessage
                  name="full_name"
                  component="div"
                  className="error"
                />

                <label>Email</label>
                <Field name="email" type="email" />
                <ErrorMessage name="email" component="div" className="error" />

                <label>Password</label>
                <Field name="password" type="password" />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error"
                />

                <label>Phone Number</label>
                <Field name="phone" type="text" />
                <ErrorMessage name="phone" component="div" className="error" />

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Join"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="signin-text">
            Already on JobSphere? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;