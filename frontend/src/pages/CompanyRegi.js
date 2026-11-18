import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import API_BASE_URL from "./setting";
import "./CompanyRegi.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const CompanyRegi = () => {
    const navigate = useNavigate();
    
    const initialValues = {
        name: "",
        industry: "",
        size: "",
        website: "",
        description: "",
        location: "",
        email: "",
        password: "",
    };

    const validationSchema = Yup.object({
        name: Yup.string().required("Company name is required"),
        industry: Yup.string().required("Industry is required"),
        size: Yup.string().required("Company size is required"),
        website: Yup.string().url("Enter valid URL").required("Website is required"),
        description: Yup.string().required("Description is required"),
        location: Yup.string().required("Location is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string()
            .min(6, "At least 6 characters")
            .required("Password is required"),
    });

    const onSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/company/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            alert("Company registered successfully! Please proceed to login.");
            resetForm();
            navigate('/companylogin'); // Redirect to login page

        } catch (error) {
            console.error("Company register error:", error);
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <div className="company-register-page">
                <img
                    src="/img/logo.webp"
                    alt="logo"
                    className="company-register-logo"
                />
                <div className="company-register-card">
                    <h2>Register Your Company</h2>
                    <p>Grow with JobSphere</p>

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="company-register-form">
                                <label>Company Name</label>
                                <Field name="name" type="text" />
                                <ErrorMessage name="name" component="div" className="error" />

                                <label>Industry</label>
                                <Field name="industry" type="text" />
                                <ErrorMessage name="industry" component="div" className="error" />

                                <label>Company Size</label>
                                <Field name="size" type="text" />
                                <ErrorMessage name="size" component="div" className="error" />

                                <label>Website</label>
                                <Field name="website" type="url" />
                                <ErrorMessage name="website" component="div" className="error" />

                                <label>Description</label>
                                <Field as="textarea" name="description" />
                                <ErrorMessage name="description" component="div" className="error" />

                                <label>Location</label>
                                <Field name="location" type="text" />
                                <ErrorMessage name="location" component="div" className="error" />

                                <label>Email</label>
                                <Field name="email" type="email" />
                                <ErrorMessage name="email" component="div" className="error" />

                                <label>Password</label>
                                <Field name="password" type="password" />
                                <ErrorMessage name="password" component="div" className="error" />

                                <button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Registering..." : "Register Company"}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <p className="signin-text">
                        Already registered? <a href="/companylogin">Login</a>
                    </p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CompanyRegi;

