import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import API_BASE_URL from "./setting";
import "./portal-forms.css";
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
                                <label htmlFor="name">Company Name</label>
                                <Field id="name" name="name" type="text" />
                                <ErrorMessage name="name" component="div" className="error" />

                                <label htmlFor="industry">Industry</label>
                                <Field id="industry" name="industry" type="text" />
                                <ErrorMessage name="industry" component="div" className="error" />

                                <label htmlFor="size">Company Size</label>
                                <Field id="size" name="size" type="text" />
                                <ErrorMessage name="size" component="div" className="error" />

                                <label htmlFor="website">Website</label>
                                <Field id="website" name="website" type="url" />
                                <ErrorMessage name="website" component="div" className="error" />

                                <label htmlFor="description">Description</label>
                                <Field id="description" as="textarea" name="description" />
                                <ErrorMessage name="description" component="div" className="error" />

                                <label htmlFor="location">Location</label>
                                <Field id="location" name="location" type="text" />
                                <ErrorMessage name="location" component="div" className="error" />

                                <label htmlFor="email">Email</label>
                                <Field id="email" name="email" type="email" />
                                <ErrorMessage name="email" component="div" className="error" />

                                <label htmlFor="password">Password</label>
                                <Field id="password" name="password" type="password" />
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
