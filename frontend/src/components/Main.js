import React from 'react';
import {Link} from 'react-router-dom';
export default function Main() {
  return <main className="portal-hero"><div><h1>Find your next role.</h1>
    <p>Browse open positions and apply directly to the companies hiring.</p>
    <Link className="hero-action" to="/jobs">Explore open jobs →</Link>
    <Link className="employer-link" to="/companyregister">Register your company</Link></div>
    <img src="/img/man.webp" alt="" /></main>;
}
